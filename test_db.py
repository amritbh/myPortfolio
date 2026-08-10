import boto3
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')
response = table.scan()
for item in response.get('Items', []):
    if type(item.get('likes')) != list or type(item.get('views')) != list:
        print(f"Slug: {item['slug']}, likes: {item.get('likes')}, views: {item.get('views')}")
