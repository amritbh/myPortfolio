import json
import os
import boto3
from boto3.dynamodb.conditions import Key

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'my-portfolio-prod-blogs')
table = dynamodb.Table(table_name)

def get_all_blogs():
    try:
        # Since this is a small table, scan is acceptable. For scale, use a GSI.
        response = table.scan()
        items = response.get('Items', [])
        
        # Sort by publishDate descending
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
        
        # Verify Password
        admin_password = os.environ.get('ADMIN_PASSWORD', 'amrit123')
        if auth_header != f"Bearer {admin_password}":
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }
            
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        if not body.get('slug') or not body.get('title'):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing slug or title'})
            }
            
        # Insert into DynamoDB
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
    path = event.get('rawPath', '')
    method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
    
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
        'body': json.dumps({'error': 'Not found'})
    }
