import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('amrit-portfolio-prod-users')

response = table.scan(
    FilterExpression="email = :e",
    ExpressionAttributeValues={":e": "amrit.bhattarai@miu.edu"}
)

items = response.get('Items', [])
for item in items:
    print(f"Verifying user: {item['username']}")
    table.update_item(
        Key={'username': item['username']},
        UpdateExpression="SET verified = :v",
        ExpressionAttributeValues={':v': True}
    )
print("Done.")
