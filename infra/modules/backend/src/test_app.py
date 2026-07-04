import os
import json
import pytest
import boto3
from moto import mock_aws

@pytest.fixture
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'
    os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
    os.environ['TABLE_NAME'] = 'test-blogs-table'
    os.environ['USERS_TABLE_NAME'] = 'test-users-table'
    os.environ['ADMIN_PASSWORD'] = 'testpass'

@pytest.fixture
def dynamodb_client(aws_credentials):
    with mock_aws():
        conn = boto3.resource('dynamodb', region_name='us-east-1')
        yield conn

@pytest.fixture
def setup_dynamodb(dynamodb_client):
    blogs_table_name = os.environ['TABLE_NAME']
    users_table_name = os.environ['USERS_TABLE_NAME']

    # Create Blogs table
    dynamodb_client.create_table(
        TableName=blogs_table_name,
        KeySchema=[{'AttributeName': 'slug', 'KeyType': 'HASH'}],
        AttributeDefinitions=[
            {'AttributeName': 'slug', 'AttributeType': 'S'},
            {'AttributeName': 'publishDate', 'AttributeType': 'S'}
        ],
        GlobalSecondaryIndexes=[{
            'IndexName': 'PublishDateIndex',
            'KeySchema': [{'AttributeName': 'publishDate', 'KeyType': 'HASH'}],
            'Projection': {'ProjectionType': 'ALL'}
        }],
        BillingMode='PAY_PER_REQUEST'
    )

    # Create Users table
    dynamodb_client.create_table(
        TableName=users_table_name,
        KeySchema=[{'AttributeName': 'username', 'KeyType': 'HASH'}],
        AttributeDefinitions=[{'AttributeName': 'username', 'AttributeType': 'S'}],
        BillingMode='PAY_PER_REQUEST'
    )

    table = dynamodb_client.Table(blogs_table_name)
    table.put_item(Item={'slug': 'test-blog-1', 'title': 'Test Blog 1', 'publishDate': '2026-01-01'})
    table.put_item(Item={'slug': 'test-blog-2', 'title': 'Test Blog 2', 'publishDate': '2026-01-02'})
    yield

def test_password_hashing(setup_dynamodb):
    import app
    h1, s1 = app.hash_password("Password123!")
    assert app.verify_password("Password123!", h1, s1) is True
    assert app.verify_password("WrongPassword", h1, s1) is False

def test_signup_admin_success(setup_dynamodb):
    import app
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    event = {
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'SecurePassword123!'
        })
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 201
    body = json.loads(response['body'])
    assert 'token' in body
    assert body['user']['username'] == 'newuser'

def test_signup_duplicate_username(setup_dynamodb):
    import app
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    event = {
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({
            'username': 'dupuser',
            'email': 'dupuser@example.com',
            'password': 'SecurePassword123!'
        })
    }
    app.lambda_handler(event, None)
    
    # Try creating same user again
    res2 = app.lambda_handler(event, None)
    assert res2['statusCode'] == 400
    assert 'already registered' in json.loads(res2['body'])['error']

def test_login_with_registered_dynamodb_user(setup_dynamodb):
    import app
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    # 1. Sign up user
    signup_evt = {
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'registereduser', 'password': 'MySecretPassword1!'})
    }
    app.lambda_handler(signup_evt, None)

    # 2. Login user
    login_evt = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'registereduser', 'password': 'MySecretPassword1!'})
    }
    login_res = app.lambda_handler(login_evt, None)
    assert login_res['statusCode'] == 200
    assert 'token' in json.loads(login_res['body'])

def test_login_admin_fallback_success(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'admin', 'password': 'testpass'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert 'token' in body

def test_login_admin_invalid_password(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'admin', 'password': 'wrongpassword'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401
    body = json.loads(response['body'])
    assert 'error' in body

def test_create_blog_with_jwt(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    login_evt = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'admin', 'password': 'testpass'})
    }
    login_res = app.lambda_handler(login_evt, None)
    token = json.loads(login_res['body'])['token']

    event = {
        'rawPath': '/blogs',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'jwt-blog', 'title': 'JWT Blog'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 201

def test_get_all_blogs(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])

    response = app.get_all_blogs()
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert len(body) == 2

def test_get_blog_by_slug(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])

    response = app.get_blog_by_slug('test-blog-1')
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['title'] == 'Test Blog 1'
