import json
import os
import boto3
import hmac
import hashlib
import base64
import time
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB clients
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'my-portfolio-prod-blogs')
users_table_name = os.environ.get('USERS_TABLE_NAME', 'my-portfolio-prod-users')

table = dynamodb.Table(table_name)
users_table = dynamodb.Table(users_table_name)

SECRET_KEY = os.environ.get('JWT_SECRET', os.environ.get('ADMIN_PASSWORD', 'amrit123'))
TOKEN_EXPIRATION_SECONDS = 8 * 3600  # 8 hours

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def generate_jwt(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64url_encode(json.dumps(header).encode('utf-8'))
    
    payload['exp'] = int(time.time()) + TOKEN_EXPIRATION_SECONDS
    payload['iat'] = int(time.time())
    payload_b64 = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature_b64 = parts
        signature_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), signature_input, hashlib.sha256).digest())
        
        if not hmac.compare_digest(signature_b64, expected_sig):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode('utf-8'))
        if payload.get('exp', 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

def hash_password(password: str, salt: bytes = None) -> tuple:
    if not salt:
        salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    return base64.b64encode(key).decode('utf-8'), base64.b64encode(salt).decode('utf-8')

def verify_password(password: str, stored_hash: str, stored_salt: str) -> bool:
    try:
        salt = base64.b64decode(stored_salt)
        new_hash, _ = hash_password(password, salt)
        return hmac.compare_digest(new_hash, stored_hash)
    except Exception:
        return False

def signup_admin(event):
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip()
        email = body.get('email', '').strip()
        password = body.get('password', '').strip()
        
        if not username or len(username) < 3:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Username must be at least 3 characters long'})
            }
            
        if not password or len(password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Password must be at least 6 characters long'})
            }
            
        # Check if user already exists
        try:
            existing_user = users_table.get_item(Key={'username': username}).get('Item')
            if existing_user:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Username is already registered'})
                }
        except Exception as err:
            print("Users table lookup warning:", err)
            
        # Hash password and store in DynamoDB
        pwd_hash, pwd_salt = hash_password(password)
        user_item = {
            'username': username,
            'email': email,
            'password_hash': pwd_hash,
            'salt': pwd_salt,
            'role': 'admin',
            'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }
        
        try:
            users_table.put_item(Item=user_item)
        except Exception as err:
            print("Error saving user to DynamoDB:", err)
            
        token = generate_jwt({'username': username, 'role': 'admin'})
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Account created successfully',
                'token': token,
                'expiresIn': TOKEN_EXPIRATION_SECONDS,
                'user': {'username': username, 'email': email, 'role': 'admin'}
            })
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }

def login_admin(event):
    try:
        body = json.loads(event.get('body', '{}'))
        password = body.get('password', '').strip()
        username = body.get('username', 'admin').strip()
        
        if not password:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Password is required'})
            }
            
        # 1. Check DynamoDB Users Table
        try:
            db_user = users_table.get_item(Key={'username': username}).get('Item')
            if db_user:
                if verify_password(password, db_user.get('password_hash'), db_user.get('salt')):
                    token = generate_jwt({'username': username, 'role': 'admin'})
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'message': 'Login successful',
                            'token': token,
                            'expiresIn': TOKEN_EXPIRATION_SECONDS,
                            'user': {'username': username, 'email': db_user.get('email', ''), 'role': 'admin'}
                        })
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid username or password'})
                    }
        except Exception as err:
            print("Users table check warning:", err)
            
        # 2. Fallback to ADMIN_PASSWORD env variable
        admin_password = os.environ.get('ADMIN_PASSWORD', 'amrit123')
        if password == admin_password:
            token = generate_jwt({'username': username or 'admin', 'role': 'admin'})
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Login successful',
                    'token': token,
                    'expiresIn': TOKEN_EXPIRATION_SECONDS,
                    'user': {'username': username or 'admin', 'role': 'admin'}
                })
            }
            
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid username or password'})
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }

def get_all_blogs():
    try:
        response = table.scan()
        items = response.get('Items', [])
        items.sort(key=lambda x: x.get('publishDate', ''), reverse=True)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(items)
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }

def get_blog_by_slug(slug):
    try:
        response = table.get_item(Key={'slug': slug})
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Blog not found'})
            }
            
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(item)
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }

def create_blog(event):
    try:
        headers = event.get('headers', {})
        auth_header = headers.get('authorization', headers.get('Authorization', ''))
        
        admin_password = os.environ.get('ADMIN_PASSWORD', 'amrit123')
        token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else auth_header
        
        payload = verify_jwt(token)
        if not payload and token != admin_password:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized or session expired'})
            }
            
        body = json.loads(event.get('body', '{}'))
        
        if not body.get('slug') or not body.get('title'):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing slug or title'})
            }
            
        table.put_item(Item=body)
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Blog created successfully!', 'item': body})
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error'})
        }

def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))
    path = event.get('rawPath', event.get('path', ''))
    method = event.get('requestContext', {}).get('http', {}).get('method', event.get('httpMethod', 'GET'))
    
    if path.endswith('/') and len(path) > 1:
        path = path[:-1]
        
    if path in ['/auth/signup', '/signup']:
        if method == 'POST':
            return signup_admin(event)
            
    if path in ['/auth/login', '/login']:
        if method == 'POST':
            return login_admin(event)
            
    if path == '/blogs':
        if method == 'POST':
            return create_blog(event)
        return get_all_blogs()
        
    elif path.startswith('/blogs/'):
        slug = path.split('/blogs/')[1]
        return get_blog_by_slug(slug)
        
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found', 'path': path, 'method': method})
    }
