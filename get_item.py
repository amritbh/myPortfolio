import boto3
import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

slug = 'how-i-built-a-serverless-portfolio-on-aws'
response = table.get_item(Key={'slug': slug})
print(json.dumps(response.get('Item'), cls=DecimalEncoder, indent=2))
