import json
import os
import boto3
import time
import base64
import hashlib
import hmac
import urllib.request
from botocore.config import Config

JOSE_IMPORT_ERROR = None
try:
    from jose import jwk, jwt
    from jose.utils import base64url_decode
    JOSE_AVAILABLE = True
except ImportError as e:
    JOSE_AVAILABLE = False
    JOSE_IMPORT_ERROR = str(e)

COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
COGNITO_REGION = os.environ.get('COGNITO_REGION')

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'amrit-cloud-prod-blogs')
table = dynamodb.Table(table_name)
users_table_name = os.environ.get('USERS_TABLE_NAME', 'amrit-cloud-prod-users')
users_table = dynamodb.Table(users_table_name)

config = Config(connect_timeout=5, read_timeout=5)
ses = boto3.client('ses', region_name=os.environ.get('AWS_REGION', 'us-east-1'), config=config)
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'admin@amrit.cloud')

# Super simple JWT implementation without external dependencies
JWT_SECRET = os.environ.get('JWT_SECRET', os.environ.get('ADMIN_PASSWORD', 'amrit123'))
TOKEN_EXPIRATION_SECONDS = 8 * 60 * 60 # 8 hours

def send_email(to_email, subject, body):
    try:
        ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [to_email]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body}}
            }
        )
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        print(f"Mock Email Content -> Subject: {subject} | Body: {body}")

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def generate_jwt(payload: dict, expires_in=TOKEN_EXPIRATION_SECONDS) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    if "exp" not in payload:
        payload["exp"] = int(time.time()) + expires_in
        
    b64_header = base64url_encode(json.dumps(header).encode('utf-8'))
    b64_payload = base64url_encode(json.dumps(payload).encode('utf-8'))
    
    signature = hmac.new(
        JWT_SECRET.encode('utf-8'),
        f"{b64_header}.{b64_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    b64_signature = base64url_encode(signature)
    return f"{b64_header}.{b64_payload}.{b64_signature}"

def verify_jwt(token: str) -> dict:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
            
        b64_header, b64_payload, b64_signature = parts
        
        signature = hmac.new(
            JWT_SECRET.encode('utf-8'),
            f"{b64_header}.{b64_payload}".encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        expected_signature = base64url_encode(signature)
        if not hmac.compare_digest(b64_signature, expected_signature):
            return None
            
        payload = json.loads(base64url_decode(b64_payload).decode('utf-8'))
        if payload.get('exp', 0) < int(time.time()):
            return None
            
        return payload
    except Exception:
        return None

_jwks = None

def get_cognito_jwks():
    global _jwks
    if _jwks is not None:
        return _jwks
    if not COGNITO_USER_POOL_ID or not COGNITO_REGION:
        return None
        
    keys_url = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json'
    try:
        with urllib.request.urlopen(keys_url) as response: # nosec B310
            _jwks = json.loads(response.read().decode('utf-8'))
        return _jwks
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None

def verify_cognito_jwt(token: str):
    if not JOSE_AVAILABLE:
        print("python-jose not available, skipping cognito verification")
        return {'error': f'python-jose not available due to ImportError: {JOSE_IMPORT_ERROR}'}
        
    jwks = get_cognito_jwks()
    if not jwks:
        return None
        
    try:
        # jwt.decode handles finding the correct key from JWKS, signature verification, and expiration
        claims = jwt.decode(token, jwks, algorithms=['RS256'], options={'verify_aud': False, 'verify_at_hash': False})
        
        email = claims.get('email')
        admin_email = os.environ.get('ADMIN_EMAIL', '')
        role = 'admin' if email and admin_email and email == admin_email else 'user'
        
        # Standardize claims to look like our custom payload for downstream
        return {
            'username': email or claims.get('cognito:username') or claims.get('sub'),
            'name': claims.get('name') or claims.get('given_name'),
            'picture': claims.get('picture'),
            'type': 'cognito',
            'role': role
        }
    except jwt.ExpiredSignatureError:
        print('Token is expired')
        return {'error': 'Cognito token is expired'}
    except jwt.JWTError as e:
        print(f"JWT signature verification failed: {e}")
        return {'error': f'JWT signature verification failed: {e}'}
    except Exception as e:
        print(f"Cognito JWT verification error: {e}")
        return {'error': f'Cognito JWT verification error: {e}'}

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
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Username must be at least 3 characters long'})}
        if not password or len(password) < 6:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Password must be at least 6 characters long'})}
            
        try:
            existing_user = users_table.get_item(Key={'username': username}).get('Item')
            if existing_user:
                return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Username is already registered'})}
        except Exception as err:
            print("Users table lookup warning:", err)
            
        pwd_hash, pwd_salt = hash_password(password)
        user_item = {
            'username': username,
            'email': email,
            'password_hash': pwd_hash,
            'salt': pwd_salt,
            'role': 'user',
            'verified': False,
            'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }
        
        try:
            users_table.put_item(Item=user_item)
        except Exception as err:
            print("Error saving user to DynamoDB:", err)
            
        token = generate_jwt({'username': username, 'type': 'verify'}, expires_in=900) # 15 minutes
        origin = event.get('headers', {}).get('origin', 'https://amrit.cloud')
        verification_link = f"{origin}/admin?verifyToken={token}"
        send_email(email, "Verify your Admin Account", f"Click here to verify your account: {verification_link}")
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Account created successfully. Please check your email to verify.',
                'user': {'username': username, 'email': email, 'role': 'user'}
            })
        }
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def verify_email_route(event):
    try:
        body = json.loads(event.get('body', '{}'))
        token = body.get('token')
        
        payload = verify_jwt(token)
        if not payload or payload.get('type') != 'verify':
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid or expired verification token'})}
            
        username = payload.get('username')
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="SET verified = :v",
            ExpressionAttributeValues={':v': True}
        )
        
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Email verified successfully!'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def forgot_password_route(event):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').strip()
        
        response = users_table.scan(
            FilterExpression="email = :e",
            ExpressionAttributeValues={":e": email}
        )
        items = response.get('Items', [])
        
        if items:
            user = items[0]
            token = generate_jwt({'username': user['username'], 'type': 'reset'}, expires_in=900)
            origin = event.get('headers', {}).get('origin', 'https://amrit.cloud')
            reset_link = f"{origin}/admin?resetToken={token}"
            send_email(email, "Password Reset Request", f"Click here to reset your password: {reset_link}")
            
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'If an account with that email exists, a password reset link has been sent.'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def reset_password_route(event):
    try:
        body = json.loads(event.get('body', '{}'))
        token = body.get('token')
        new_password = body.get('password')
        
        payload = verify_jwt(token)
        if not payload or payload.get('type') != 'reset':
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid or expired reset token'})}
            
        username = payload.get('username')
        pwd_hash, pwd_salt = hash_password(new_password)
        
        users_table.update_item(
            Key={'username': username},
            UpdateExpression="SET password_hash = :h, salt = :s",
            ExpressionAttributeValues={':h': pwd_hash, ':s': pwd_salt}
        )
        
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Password reset successfully!'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def login_admin(event):
    try:
        body = json.loads(event.get('body', '{}'))
        password = body.get('password', '').strip()
        username = body.get('username', 'admin').strip()
        
        if not password:
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Password is required'})}
            
        try:
            db_user = None
            if '@' in username:
                response = users_table.scan(
                    FilterExpression="email = :e",
                    ExpressionAttributeValues={":e": username}
                )
                items = response.get('Items', [])
                if items:
                    db_user = items[0]
            else:
                db_user = users_table.get_item(Key={'username': username}).get('Item')
                
            if db_user:
                if db_user.get('verified', True) == False:
                    return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Please verify your email before logging in.'})}
                if verify_password(password, db_user.get('password_hash'), db_user.get('salt')):
                    email = db_user.get('email', '')
                    admin_email = os.environ.get('ADMIN_EMAIL', '')
                    
                    # Use role from database, but fallback to admin if email matches ADMIN_EMAIL
                    db_role = db_user.get('role', 'user')
                    role = 'admin' if (email and admin_email and email == admin_email) else db_role
                    
                    token = generate_jwt({'username': username, 'role': role})
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'message': 'Login successful',
                            'token': token,
                            'expiresIn': TOKEN_EXPIRATION_SECONDS,
                            'user': {'username': username, 'email': email, 'role': role}
                        })
                    }
                else:
                    return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid username or password'})}
        except Exception as err:
            print("Users table check warning:", err)
            
        return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid username or password'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def get_all_blogs():
    try:
        response = table.scan()
        items = response.get('Items', [])
        items.sort(key=lambda x: x.get('publishDate', ''), reverse=True)
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(items)}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def get_blog_by_slug(slug):
    try:
        response = table.get_item(Key={'slug': slug})
        item = response.get('Item')
        if not item:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Blog not found'})}
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps(item)}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def create_blog(event):
    try:
        payload = authenticate(event)
            
        if not payload or payload.get('role') != 'admin':
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized or session expired'})}
            
        body = json.loads(event.get('body', '{}'))
        if not body.get('slug') or not body.get('title'):
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Missing slug or title'})}
            
        table.put_item(Item=body)
        return {'statusCode': 201, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Blog created successfully!', 'item': body})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def update_blog(event, slug):
    try:
        payload = authenticate(event)
        if not payload or payload.get('role') != 'admin':
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized or session expired'})}
            
        body = json.loads(event.get('body', '{}'))
        new_slug = body.get('slug')
        if not new_slug or not body.get('title'):
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Missing slug or title'})}

        # Fetch existing to preserve engagement metrics
        existing_res = table.get_item(Key={'slug': slug})
        existing = existing_res.get('Item')
        if not existing:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Blog not found'})}

        # Merge existing metrics
        body['likes'] = existing.get('likes', [])
        body['comments'] = existing.get('comments', [])

        if new_slug != slug:
            # Slug changed, create new and delete old
            table.put_item(Item=body)
            table.delete_item(Key={'slug': slug})
        else:
            table.put_item(Item=body)
            
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Blog updated successfully!', 'item': body})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def delete_blog(event, slug):
    try:
        payload = authenticate(event)
        if not payload or payload.get('role') != 'admin':
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized or session expired'})}
            
        table.delete_item(Key={'slug': slug})
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Blog deleted successfully!'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def contact_portfolio(event):
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', 'Unknown')
        email = body.get('email', 'Unknown')
        phone = body.get('phone', 'N/A')
        message_title = body.get('messageTitle', 'No Subject')
        message = body.get('message', '')
        
        subject = f"Portfolio Contact: {message_title}"
        email_body = f"Name: {username}\nEmail: {email}\nPhone: {phone}\n\nMessage:\n{message}"
        
        send_email('amrit@amrit.cloud', subject, email_body)
        
        return {
            'statusCode': 200, 
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 
            'body': json.dumps({'message': 'Message sent successfully!'})
        }
    except Exception as e:
        print(f"Error sending contact email: {e}")
        return {
            'statusCode': 500, 
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 
            'body': json.dumps({'error': 'Internal server error'})
        }
def authenticate(event):
    headers = event.get('headers', {})
    auth_header = headers.get('authorization', headers.get('Authorization', ''))
    token = auth_header.replace('Bearer ', '').strip() if auth_header.startswith('Bearer ') else auth_header
    if not token:
        return None
    payload = verify_jwt(token)
    if not payload:
        payload = verify_cognito_jwt(token)
        if payload and 'error' in payload:
            print(f"Authentication failed: {payload['error']}")
            return None
    return payload

def like_blog(event, slug):
    try:
        payload = authenticate(event)
        if not payload:
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized'})}
            
        username = payload.get('username')
        response = table.get_item(Key={'slug': slug})
        item = response.get('Item')
        if not item:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Blog not found'})}
            
        likes = item.get('likes', [])
        if username in likes:
            likes.remove(username)
        else:
            likes.append(username)
            
        table.update_item(
            Key={'slug': slug},
            UpdateExpression="SET likes = :l",
            ExpressionAttributeValues={':l': likes}
        )
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Like toggled', 'likes': likes})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def comment_blog(event, slug):
    try:
        payload = authenticate(event)
        if not payload:
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized'})}
            
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '').strip()
        if not text:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Comment text required'})}
            
        username = payload.get('username')
        name = payload.get('name') or username
        picture = payload.get('picture')
        comment_id = str(int(time.time() * 1000))
        new_comment = {
            'id': comment_id,
            'username': username,
            'name': name,
            'picture': picture,
            'text': text,
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }
        
        response = table.get_item(Key={'slug': slug})
        item = response.get('Item')
        if not item:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Blog not found'})}
            
        comments = item.get('comments', [])
        comments.append(new_comment)
        
        table.update_item(
            Key={'slug': slug},
            UpdateExpression="SET comments = :c",
            ExpressionAttributeValues={':c': comments}
        )
        return {'statusCode': 201, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Comment added', 'comment': new_comment})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def delete_comment(event, slug):
    try:
        payload = authenticate(event)
        if not payload:
            return {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Unauthorized'})}
            
        body = json.loads(event.get('body', '{}'))
        comment_id = body.get('commentId', '')
        if not comment_id:
            return {'statusCode': 400, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'commentId required'})}
            
        username = payload.get('username')
        role = payload.get('role')
        
        response = table.get_item(Key={'slug': slug})
        item = response.get('Item')
        if not item:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Blog not found'})}
            
        comments = item.get('comments', [])
        new_comments = []
        deleted = False
        for c in comments:
            if c.get('id') == comment_id:
                if c.get('username') == username or role == 'admin':
                    deleted = True
                    continue
                else:
                    return {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Not authorized to delete this comment'})}
            new_comments.append(c)
            
        if not deleted:
            return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Comment not found'})}
            
        table.update_item(
            Key={'slug': slug},
            UpdateExpression="SET comments = :c",
            ExpressionAttributeValues={':c': new_comments}
        )
        return {'statusCode': 200, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'message': 'Comment deleted'})}
    except Exception as e:
        print(e)
        return {'statusCode': 500, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Internal server error'})}

def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))
    path = event.get('rawPath', event.get('path', ''))
    method = event.get('requestContext', {}).get('http', {}).get('method', event.get('httpMethod', 'GET'))
    
    if path.endswith('/') and len(path) > 1:
        path = path[:-1]
        
    if path in ['/auth/signup', '/signup'] and method == 'POST':
        return signup_admin(event)
    if path in ['/auth/login', '/login'] and method == 'POST':
        return login_admin(event)
    if path in ['/auth/verify-email', '/verify-email'] and method == 'POST':
        return verify_email_route(event)
    if path in ['/auth/forgot-password', '/forgot-password'] and method == 'POST':
        return forgot_password_route(event)
    if path in ['/auth/reset-password', '/reset-password'] and method == 'POST':
        return reset_password_route(event)
    if path in ['/portfolio', '/api/portfolio'] and method == 'POST':
        return contact_portfolio(event)
            
    if path == '/blogs':
        if method == 'POST':
            return create_blog(event)
        return get_all_blogs()
        
    elif path.startswith('/blogs/'):
        parts = path.split('/')
        slug = parts[2] if len(parts) > 2 else ''
        if len(parts) == 4 and parts[3] == 'like' and method == 'POST':
            return like_blog(event, slug)
        if len(parts) == 4 and parts[3] == 'comment' and method == 'POST':
            return comment_blog(event, slug)
        if len(parts) == 4 and parts[3] == 'comment' and method == 'DELETE':
            return delete_comment(event, slug)
            
        if len(parts) == 3:
            if method == 'PUT':
                return update_blog(event, slug)
            if method == 'DELETE':
                return delete_blog(event, slug)
            
        return get_blog_by_slug(slug)
        
    return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Not found', 'path': path, 'method': method})}
