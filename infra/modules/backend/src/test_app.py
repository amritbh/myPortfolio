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
        assert app.verify_cognito_jwt('expired_token') is None
        
        # JWT Error
        mock_decode.side_effect = jwt.JWTError("Bad signature")
        assert app.verify_cognito_jwt('bad_token') is None
        
        # Generic Exception
        mock_decode.side_effect = Exception("Generic")
        assert app.verify_cognito_jwt('token') is None

def test_verify_cognito_jwt_no_jose():
    import app
    app.JOSE_AVAILABLE = False
    assert app.verify_cognito_jwt('token') is None
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
