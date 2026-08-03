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

def test_signup_duplicate_username_verified(setup_dynamodb):
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
    
    # Manually verify the user in the mock DB
    app.users_table.update_item(
        Key={'username': 'dupuser'},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={':v': True}
    )
    
    # Try creating same user again when already verified
    res2 = app.lambda_handler(event, None)
    assert res2['statusCode'] == 400
    assert 'already registered' in json.loads(res2['body'])['error']

def test_signup_resend_verification_unverified(setup_dynamodb):
    import app
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    event = {
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({
            'username': 'unverifieduser',
            'email': 'unverified@example.com',
            'password': 'SecurePassword123!'
        })
    }
    app.lambda_handler(event, None)
    
    # Try creating same user again while unverified
    res2 = app.lambda_handler(event, None)
    assert res2['statusCode'] == 201
    assert 'unverified' in json.loads(res2['body'])['message']

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

def test_login_by_email(setup_dynamodb):
    import app
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    # 1. Sign up user with email
    signup_evt = {
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'emailuser', 'email': 'testlogin@email.com', 'password': 'MySecretPassword1!'})
    }
    app.lambda_handler(signup_evt, None)
    
    # 1.5 Manually verify the user in DynamoDB
    app.users_table.update_item(
        Key={'username': 'emailuser'},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={':v': True}
    )

    # 2. Login user by email
    login_evt = {
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'testlogin@email.com', 'password': 'MySecretPassword1!'})
    }
    login_res = app.lambda_handler(login_evt, None)
    assert login_res['statusCode'] == 200
    assert 'token' in json.loads(login_res['body'])



def test_create_blog_with_jwt(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    app.users_table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['USERS_TABLE_NAME'])

    token = app.generate_jwt({'username': 'amrit', 'role': 'admin'})

    event = {
        'rawPath': '/blogs',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'jwt-blog', 'title': 'JWT Blog'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 201

@patch('app.verify_cognito_jwt')
def test_create_blog_with_cognito_jwt(mock_verify_cognito_jwt, setup_dynamodb):
    mock_verify_cognito_jwt.return_value = {'username': 'cognito_user', 'role': 'admin'}
    event = {
        'rawPath': '/blogs',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': 'Bearer cognito-token-123'},
        'body': json.dumps({'slug': 'test-cognito-blog', 'title': 'Title', 'content': 'Content'})
    }
    from app import lambda_handler
    response = lambda_handler(event, None)
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

def test_like_blog(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})

    # Like the blog
    event = {
        'rawPath': '/blogs/test-blog-1/like',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert 'testuser' in body['likes']

    # Unlike the blog
    response2 = app.lambda_handler(event, None)
    assert response2['statusCode'] == 200
    body2 = json.loads(response2['body'])
    assert 'testuser' not in body2['likes']

def test_comment_blog(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})

    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'text': 'Great post!'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 201
    body = json.loads(response['body'])
    assert body['comment']['text'] == 'Great post!'
    assert body['comment']['username'] == 'testuser'
    assert 'id' in body['comment']

def test_delete_comment(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})

    # 1. Add comment
    add_evt = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'text': 'To be deleted'})
    }
    res = app.lambda_handler(add_evt, None)
    comment_id = json.loads(res['body'])['comment']['id']

    # 2. Delete comment
    del_evt = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'commentId': comment_id})
    }
    del_res = app.lambda_handler(del_evt, None)
    assert del_res['statusCode'] == 200

    # 3. Verify it's gone
    get_res = app.get_blog_by_slug('test-blog-1')
    blog = json.loads(get_res['body'])
    assert len([c for c in blog.get('comments', []) if c['id'] == comment_id]) == 0

def test_comment_blog_unauthorized(setup_dynamodb):
    import app
    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {},
        'body': json.dumps({'text': 'Great post!'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_comment_blog_missing_text(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'text': '   '})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400

def test_comment_blog_not_found(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/blogs/not-found/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'text': 'hello'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 404

def test_delete_comment_unauthorized(setup_dynamodb):
    import app
    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {},
        'body': json.dumps({'commentId': '123'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_delete_comment_missing_id(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400

def test_delete_comment_blog_not_found(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/blogs/not-found/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'commentId': '123'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 404

def test_delete_comment_not_found(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'commentId': 'not-exists'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 404

def test_delete_comment_not_authorized_user(setup_dynamodb):
    import app
    app.table = boto3.resource('dynamodb', region_name='us-east-1').Table(os.environ['TABLE_NAME'])
    # User 1 makes comment
    token1 = app.generate_jwt({'username': 'user1', 'role': 'user'})
    add_evt = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token1}'},
        'body': json.dumps({'text': 'To be deleted'})
    }
    res = app.lambda_handler(add_evt, None)
    comment_id = json.loads(res['body'])['comment']['id']

    # User 2 tries to delete it
    token2 = app.generate_jwt({'username': 'user2', 'role': 'user'})
    del_evt = {
        'rawPath': '/blogs/test-blog-1/comment',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token2}'},
        'body': json.dumps({'commentId': comment_id})
    }
    del_res = app.lambda_handler(del_evt, None)
    assert del_res['statusCode'] == 403

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

def test_update_blog_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    
    # Pre-populate
    app.table.put_item(Item={
        'slug': 'test-blog-update',
        'title': 'Old Title',
        'likes': ['amrit'],
        'comments': [{'id': 'c1', 'text': 'nice'}]
    })
    
    event = {
        'rawPath': '/blogs/test-blog-update',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'test-blog-update', 'title': 'New Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    updated = app.table.get_item(Key={'slug': 'test-blog-update'}).get('Item')
    assert updated['title'] == 'New Title'
    assert 'amrit' in updated['likes']
    assert len(updated['comments']) == 1

def test_update_blog_slug_change(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    app.table.put_item(Item={'slug': 'old-slug', 'title': 'Old Title'})
    
    event = {
        'rawPath': '/blogs/old-slug',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'new-slug', 'title': 'New Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    assert not app.table.get_item(Key={'slug': 'old-slug'}).get('Item')
    assert app.table.get_item(Key={'slug': 'new-slug'}).get('Item')

def test_update_blog_missing_fields(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    event = {
        'rawPath': '/blogs/test-slug',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'title': 'Missing Slug'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400

def test_update_blog_not_found(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    event = {
        'rawPath': '/blogs/non-existent',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'non-existent', 'title': 'Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 404

def test_update_blog_unauthorized(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'user', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-blog',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'test-blog', 'title': 'Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_update_blog_exception(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    app.table.put_item(Item={'slug': 'test-slug', 'title': 'Old'})
    
    event = {
        'rawPath': '/blogs/test-slug',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'test-slug', 'title': 'New'})
    }
    with patch('app.table.put_item') as mock_put:
        mock_put.side_effect = Exception("DB Error")
        response = app.lambda_handler(event, None)
    
    assert response['statusCode'] == 500

def test_delete_blog_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    app.table.put_item(Item={'slug': 'test-delete'})
    
    event = {
        'rawPath': '/blogs/test-delete',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    assert not app.table.get_item(Key={'slug': 'test-delete'}).get('Item')

def test_delete_blog_exception(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    
    event = {
        'rawPath': '/blogs/test-delete',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    with patch('app.table.delete_item') as mock_delete:
        mock_delete.side_effect = Exception("DB Error")
        response = app.lambda_handler(event, None)
    assert response['statusCode'] == 500

def test_update_blog_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    
    # Pre-populate
    app.table.put_item(Item={
        'slug': 'test-blog-update',
        'title': 'Old Title',
        'likes': ['amrit'],
        'comments': [{'id': 'c1', 'text': 'nice'}]
    })
    
    event = {
        'rawPath': '/blogs/test-blog-update',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'test-blog-update', 'title': 'New Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    updated = app.table.get_item(Key={'slug': 'test-blog-update'}).get('Item')
    assert updated['title'] == 'New Title'
    assert 'amrit' in updated['likes']
    assert len(updated['comments']) == 1

def test_update_blog_slug_change(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    app.table.put_item(Item={'slug': 'old-slug', 'title': 'Old Title'})
    
    event = {
        'rawPath': '/blogs/old-slug',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'new-slug', 'title': 'New Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    assert not app.table.get_item(Key={'slug': 'old-slug'}).get('Item')
    assert app.table.get_item(Key={'slug': 'new-slug'}).get('Item')

def test_update_blog_unauthorized(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'user', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-blog',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'slug': 'test-blog', 'title': 'Title'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_delete_blog_success(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'admin', 'role': 'admin'})
    app.table.put_item(Item={'slug': 'test-delete'})
    
    event = {
        'rawPath': '/blogs/test-delete',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    assert not app.table.get_item(Key={'slug': 'test-delete'}).get('Item')

def test_delete_blog_unauthorized(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'user', 'role': 'user'})
    event = {
        'rawPath': '/blogs/test-delete',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

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

def test_get_cognito_jwks():
    import app
    from unittest.mock import patch, MagicMock
    app.COGNITO_USER_POOL_ID = 'us-east-1_XXXXX'
    app.COGNITO_REGION = 'us-east-1'
    app._jwks = None
    
    with patch('urllib.request.urlopen') as mock_urlopen:
        mock_response = MagicMock()
        mock_response.read.return_value = b'{"keys": ["test_key"]}'
        mock_urlopen.return_value.__enter__.return_value = mock_response
        
        jwks = app.get_cognito_jwks()
        assert jwks == {"keys": ["test_key"]}
        
        # Test cache
        jwks2 = app.get_cognito_jwks()
        assert jwks2 == {"keys": ["test_key"]}
        
        app._jwks = None
        mock_urlopen.side_effect = Exception("Network error")
        jwks3 = app.get_cognito_jwks()
        assert jwks3 is None

def test_verify_cognito_jwt():
    import app
    from unittest.mock import patch
    app.JOSE_AVAILABLE = True
    app._jwks = {"keys": ["test_key"]}
    app.COGNITO_USER_POOL_ID = 'us-east-1_XXXXX'
    app.COGNITO_REGION = 'us-east-1'
    
    with patch('jose.jwt.decode') as mock_decode:
        # Success case user
        mock_decode.return_value = {'email': 'test@example.com'}
        payload = app.verify_cognito_jwt('valid_token')
        assert payload['role'] == 'user'
        
        # Success case admin
        os.environ['ADMIN_EMAIL'] = 'admin@example.com'
        mock_decode.return_value = {'email': 'admin@example.com'}
        payload = app.verify_cognito_jwt('valid_token')
        assert payload['role'] == 'admin'
        
        # Expired signature
        from jose import jwt
        mock_decode.side_effect = jwt.ExpiredSignatureError("Expired")
        assert 'error' in app.verify_cognito_jwt('expired_token')
        
        # JWT Error
        mock_decode.side_effect = jwt.JWTError("Bad signature")
        assert 'error' in app.verify_cognito_jwt('bad_token')
        
        # Generic Exception
        mock_decode.side_effect = Exception("Generic")
        assert 'error' in app.verify_cognito_jwt('token')

def test_verify_cognito_jwt_no_jose():
    import app
    app.JOSE_AVAILABLE = False
    app.JOSE_IMPORT_ERROR = "MockError"
    result = app.verify_cognito_jwt('token')
    assert isinstance(result, dict)
    assert 'error' in result
    app.JOSE_AVAILABLE = True

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
        'amrit@amrit.cloud', 
        'Portfolio Contact: Inquiry', 
        'Name: Test User\nEmail: test@example.com\nPhone: 1234567890\n\nMessage:\nHello there!'
    )

@patch('app.s3_client.generate_presigned_url')
def test_get_media_upload_url_admin_success(mock_presign, setup_dynamodb):
    import app
    app.MEDIA_BUCKET_NAME = 'test-media-bucket'
    app.CLOUDFRONT_MEDIA_URL = 'https://amrit.cloud/media'
    
    token = app.generate_jwt({'username': 'amrit', 'role': 'admin'})
    mock_presign.return_value = 'https://presigned.url'

    event = {
        'rawPath': '/media/upload-url',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'filename': 'test image.png', 'content_type': 'image/png'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['presigned_url'] == 'https://presigned.url'
    assert body['cloudfront_url'].startswith('https://amrit.cloud/media/')
    assert 'test_image.png' in body['key']
    assert body['key'].startswith('media/drafts/')

@patch('app.s3_client.generate_presigned_url')
def test_get_media_upload_url_with_blog_slug(mock_presign, setup_dynamodb):
    import app
    app.MEDIA_BUCKET_NAME = 'test-media-bucket'
    app.CLOUDFRONT_MEDIA_URL = 'https://amrit.cloud/media'
    
    token = app.generate_jwt({'username': 'amrit', 'role': 'admin'})
    mock_presign.return_value = 'https://presigned.url'

    event = {
        'rawPath': '/media/upload-url',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'filename': 'test image.png', 'content_type': 'image/png', 'blogSlug': 'test-blog-slug'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['key'].startswith('media/blogs/test-blog-slug/')
def test_get_media_upload_url_unauthorized(setup_dynamodb):
    import app
    event = {
        'rawPath': '/media/upload-url',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {},
        'body': json.dumps({'filename': 'test.png', 'content_type': 'image/png'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_get_media_upload_url_invalid_type(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'amrit', 'role': 'admin'})
    event = {
        'rawPath': '/media/upload-url/',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'filename': 'test.exe', 'content_type': 'application/x-msdownload'})
    }
    # This also tests the trailing slash removal in lambda_handler (line 658)
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 400

@patch('app.s3_client.generate_presigned_url')
def test_get_media_upload_url_exception(mock_presign, setup_dynamodb):
    import app
    app.MEDIA_BUCKET_NAME = 'test-media-bucket'
    token = app.generate_jwt({'username': 'amrit', 'role': 'admin'})
    mock_presign.side_effect = Exception("S3 Error")

    event = {
        'rawPath': '/media/upload-url',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'Authorization': f'Bearer {token}'},
        'body': json.dumps({'filename': 'test.png', 'content_type': 'image/png'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 500

def test_get_all_blogs_route(setup_dynamodb):
    import app
    event = {
        'rawPath': '/blogs',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {}
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200

def test_get_blog_by_slug_route(setup_dynamodb):
    import app
    app.table.put_item(Item={'slug': 'test-route'})
    event = {
        'rawPath': '/blogs/test-route',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {}
    }
    response = app.lambda_handler(event, None)
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200

def test_delete_account(setup_dynamodb):
    import app
    
    # Sign up a user
    app.lambda_handler({
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'deleteme', 'email': 'delete@example.com', 'password': 'pass'})
    }, None)
    
    # Log them in to get token
    token = app.generate_jwt({'username': 'deleteme', 'role': 'user'})
    
    # Delete the account
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'DELETE'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': ''
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    # Ensure they are deleted from DB
    db_user = app.users_table.get_item(Key={'username': 'deleteme'}).get('Item')
    assert db_user is None

def test_2fa_setup_and_login(setup_dynamodb):
    import app
    import pyotp
    
    # 1. Sign up and Login to get token
    app.lambda_handler({
        'rawPath': '/auth/signup',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'user2fa', 'email': '2fa@example.com', 'password': 'SecurePass1!'})
    }, None)
    
    # Manually verify the user in the mock DB
    app.users_table.update_item(
        Key={'username': 'user2fa'},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={':v': True}
    )
    
    token = app.generate_jwt({'username': 'user2fa', 'role': 'user'})
    
    # 2. Setup 2FA
    res_setup = app.lambda_handler({
        'rawPath': '/auth/2fa/setup',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': ''
    }, None)
    assert res_setup['statusCode'] == 200
    setup_data = json.loads(res_setup['body'])
    secret = setup_data['secret']
    
    # 3. Verify 2FA
    totp = pyotp.TOTP(secret)
    code = totp.now()
    res_verify = app.lambda_handler({
        'rawPath': '/auth/2fa/verify',
        'requestContext': {'http': {'method': 'POST'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'code': code})
    }, None)
    assert res_verify['statusCode'] == 200
    
    # 4. Login now requires 2FA
    res_login_1 = app.lambda_handler({
        'rawPath': '/auth/login',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'username': 'user2fa', 'password': 'SecurePass1!'})
    }, None)
    assert res_login_1['statusCode'] == 200
    login_1_data = json.loads(res_login_1['body'])
    assert login_1_data['requires_2fa'] == True
    temp_token = login_1_data['temp_token']
    
    # 5. Login with 2FA code
    code2 = totp.now()
    res_login_2 = app.lambda_handler({
        'rawPath': '/auth/login/2fa',
        'requestContext': {'http': {'method': 'POST'}},
        'body': json.dumps({'temp_token': temp_token, 'code': code2})
    }, None)
    assert res_login_2['statusCode'] == 200
    assert 'token' in json.loads(res_login_2['body'])

def test_get_account_profile(setup_dynamodb):
    import app
    
    app.users_table.put_item(Item={'username': 'testuser', 'email': 'test@example.com', 'address': '123 Test St', 'phone_number': '555-5555'})
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {'authorization': f'Bearer {token}'},
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert body['address'] == '123 Test St'

def test_update_account_profile(setup_dynamodb):
    import app
    
    app.users_table.put_item(Item={'username': 'testuser', 'email': 'test@example.com'})
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'name': 'John Doe', 'address': 'New Address', 'phone_number': '555-1234'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200
    
    db_user = app.users_table.get_item(Key={'username': 'testuser'}).get('Item')
    assert db_user['name'] == 'John Doe'
    assert db_user['address'] == 'New Address'
    assert db_user['phone_number'] == '555-1234'

def test_get_account_profile_unauthorized(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {},
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401
    
    event['headers']['authorization'] = 'Bearer invalid'
    response2 = app.lambda_handler(event, None)
    assert response2['statusCode'] == 401

def test_get_account_profile_user_not_found(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'missinguser', 'role': 'user'})
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {'authorization': f'Bearer {token}'},
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 404

def test_update_account_profile_unauthorized(setup_dynamodb):
    import app
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {},
        'body': json.dumps({'address': 'a'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 401

def test_get_account_profile_exception(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'GET'}},
        'headers': {'authorization': f'Bearer {token}'}
    }
    with patch('app.users_table.get_item') as mock_get:
        mock_get.side_effect = Exception("DB Error")
        response = app.lambda_handler(event, None)
    assert response['statusCode'] == 500

def test_update_account_profile_exception(setup_dynamodb):
    import app
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'address': 'a'})
    }
    with patch('app.users_table.update_item') as mock_update:
        mock_update.side_effect = Exception("DB Error")
        response = app.lambda_handler(event, None)
    assert response['statusCode'] == 500

def test_update_account_profile_missing_fields(setup_dynamodb):
    import app
    app.users_table.put_item(Item={'username': 'testuser', 'email': 'test@example.com'})
    token = app.generate_jwt({'username': 'testuser', 'role': 'user'})
    
    # Missing address
    event = {
        'rawPath': '/auth/account',
        'requestContext': {'http': {'method': 'PUT'}},
        'headers': {'authorization': f'Bearer {token}'},
        'body': json.dumps({'phone_number': '555-1234'})
    }
    response = app.lambda_handler(event, None)
    assert response['statusCode'] == 200 # App handles it by using what is present or doesn't complain?
    # Wait, in app.py:
    # body = json.loads(event.get('body', '{}'))
    # users_table.update_item(...)
    # It doesn't error on missing fields, it updates them to whatever they are in the body.

