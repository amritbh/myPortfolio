import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

response = table.scan()
blogs = response.get('Items', [])

# output as JSON
print(json.dumps(blogs, default=str))
