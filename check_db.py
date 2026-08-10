import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

response = table.get_item(Key={'slug': 'mastering-responsive-ui-ux-react'})
if 'Item' in response:
    item = response['Item']
    print(item.keys())
    print("title:", item.get('title'))
    print("publishDate:", item.get('publishDate'))
    print("author:", item.get('author'))
else:
    print("Item not found!")
