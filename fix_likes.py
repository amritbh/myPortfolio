import boto3

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

table.update_item(
    Key={'slug': 'mastering-responsive-ui-ux-react'},
    UpdateExpression="REMOVE likes, #v",
    ExpressionAttributeNames={'#v': 'views'}
)
print("Removed likes and views!")
