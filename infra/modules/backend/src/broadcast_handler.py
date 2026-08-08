import json
import os
import boto3
from botocore.config import Config

config = Config(connect_timeout=5, read_timeout=5)
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'), config=config)
subscribers_table_name = os.environ.get('SUBSCRIBERS_TABLE_NAME')

ses = boto3.client('ses', region_name=os.environ.get('AWS_REGION', 'us-east-1'), config=config)
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'newsletter@amrit.cloud')

def broadcast_to_subscribers(subject, body_text, table):
    response = table.scan()
    items = response.get('Items', [])
    
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response.get('Items', []))
        
    success_count = 0
    for subscriber in items:
        email = subscriber.get('email')
        if not email:
            continue
            
        try:
            ses.send_email(
                Source=SENDER_EMAIL,
                Destination={'ToAddresses': [email]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {'Text': {'Data': body_text}}
                }
            )
            success_count += 1
        except Exception as email_err:
            print(f"Failed to send email to {email}: {email_err}")
            
    print(f"Successfully broadcasted to {success_count} subscribers.")

def lambda_handler(event, context):
    if not subscribers_table_name:
        print("Error: SUBSCRIBERS_TABLE_NAME not set in environment.")
        return

    table = dynamodb.Table(subscribers_table_name)
    
    # Handle manual direct invocation (custom newsletter)
    if 'subject' in event and 'body' in event:
        print(f"Processing manual custom newsletter: {event['subject']}")
        broadcast_to_subscribers(event['subject'], event['body'], table)
        return {'statusCode': 200, 'body': 'Custom broadcast complete'}
        
    # Handle DynamoDB Stream Events (automated blogs)
    for record in event.get('Records', []):
        try:
            if record.get('eventSource') == 'aws:dynamodb':
                if record.get('eventName') == 'INSERT':
                    new_image = record.get('dynamodb', {}).get('NewImage', {})
                    blog_title = new_image.get('title', {}).get('S')
                    blog_slug = new_image.get('slug', {}).get('S')
                    
                    if not blog_title or not blog_slug:
                        print("Missing title or slug in DynamoDB INSERT, skipping.")
                        continue
                        
                    print(f"Broadcasting new blog from DynamoDB stream: {blog_title} ({blog_slug})")
                    blog_url = f"https://amrit.cloud/blogs/{blog_slug}"
                    subject = f"New Blog Published: {blog_title}"
                    body_text = f"Hi there!\n\nI just published a new blog post: \"{blog_title}\".\n\nYou can read it here: {blog_url}\n\nThanks for subscribing!\nAmrit"
                    
                    broadcast_to_subscribers(subject, body_text, table)
            else:
                print(f"Unknown event source: {record.get('eventSource')}")
                
        except Exception as e:
            print(f"Error processing record: {e}")
            
    return {'statusCode': 200, 'body': 'Broadcast complete'}
