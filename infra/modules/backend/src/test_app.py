import os
import json
import pytest
import boto3
from moto import mock_aws
from unittest.mock import patch

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
    assert 'Account created successfully' in body['message']
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
    
    # 1.5 Manually verify the user in DynamoDB
    app.users_table.update_item(
        Key={'username': 'registereduser'},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={':v': True}
    )

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

def test_verify_email_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'registereduser', 'type': 'verify'})
    event = {
        'rawPath': '/auth/verify-email',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'token': token})
    }
    
    # We must ensure the user exists
    app.users_table.put_item(Item={'username': 'registereduser', 'verified': False})
    
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    assert 'verified successfully' in json.loads(response['body'])['message']
    
    # Verify the table was updated
    user = app.users_table.get_item(Key={'username': 'registereduser'}).get('Item')
    assert user['verified'] is True

def test_verify_email_invalid_token(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/verify-email',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'token': 'invalid.token.string'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400

@patch('app.send_email')
def test_forgot_password_success(mock_send_email, setup_dynamodb):
    import app
    app.users_table.put_item(Item={'username': 'testuser', 'email': 'test@example.com'})
    
    event = {
        'rawPath': '/auth/forgot-password',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'email': 'test@example.com'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    mock_send_email.assert_called_once()
    
def test_reset_password_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'registereduser', 'type': 'reset'})
    event = {
        'rawPath': '/auth/reset-password',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'token': token, 'password': 'NewPassword123!'})
    }
    
    app.users_table.put_item(Item={'username': 'registereduser', 'password_hash': 'old', 'salt': 'old'})
    
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    assert 'Password reset successfully' in json.loads(response['body'])['message']
    
    # Verify the password changed
    user = app.users_table.get_item(Key={'username': 'registereduser'}).get('Item')
    assert user['password_hash'] != 'old'

def test_login_unverified_user(setup_dynamodb):
    import app
    app.users_table.put_item(Item={
        'username': 'unverifieduser', 
        'password_hash': 'hash', 
        'salt': 'salt', 
        'verified': False
    })
    
    event = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'unverifieduser', 'password': 'Password123!'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 403
    assert 'Please verify your email' in json.loads(response['body'])['error']

def test_login_missing_password(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'admin'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401
    assert 'Password is required' in json.loads(response['body'])['error']

def test_reset_password_invalid_token(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/reset-password',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'token': 'invalid.jwt.token', 'password': 'NewPassword123!'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400
    assert 'Invalid or expired reset token' in json.loads(response['body'])['error']

def test_get_blog_by_slug_not_found(setup_dynamodb):
    import app
    response = app.get_blog_by_slug('does-not-exist')
    assert response['statusCode'] == 404
    assert 'Blog not found' in json.loads(response['body'])['error']

def test_exception_handling(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': 'invalid-json'
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 500
    assert 'Internal server error' in json.loads(response['body'])['error']

@patch('app.send_email')
def test_contact_portfolio_success(mock_send_email, setup_dynamodb):
    import app
    event = {
        'rawPath': '/portfolio',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({
            'username': 'Test User',
            'email': 'test@example.com',
            'phone': '1234567890',
            'messageTitle': 'Inquiry',
            'message': 'Hello there!'
        })
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    assert 'Message sent successfully!' in json.loads(response['body'])['message']
    
    mock_send_email.assert_called_once_with(
        app.SENDER_EMAIL, 
        'Portfolio Contact: Inquiry', 
        'Name: Test User\nEmail: test@example.com\nPhone: 1234567890\n\nMessage:\nHello there!'
    )
