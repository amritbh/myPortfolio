import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

with open('docs/blog27_content.local.md', 'r') as f:
    content = f.read()

table.update_item(
    Key={'slug': 'mastering-responsive-ui-ux-react'},
    UpdateExpression="SET content = :val",
    ExpressionAttributeValues={':val': content}
)
print("Updated blog content in DynamoDB!")
