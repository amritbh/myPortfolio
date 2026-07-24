import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

slug = 'how-i-built-a-serverless-portfolio-on-aws'
response = table.get_item(Key={'slug': slug})
item = response.get('Item')
if not item:
    print("Item not found!")
    exit(1)

likes = item.get('likes', [])
likes.append("test_user")

try:
    table.update_item(
        Key={'slug': slug},
        UpdateExpression="SET likes = :l",
        ExpressionAttributeValues={':l': likes}
    )
    print("Success")
except Exception as e:
    print("Error:", e)
