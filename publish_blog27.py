import boto3
import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('amrit-portfolio-prod-blogs')

with open('docs/blog27_content.local.md', 'r') as f:
    content = f.read()

item = {
    'slug': 'mastering-responsive-ui-ux-react',
    'title': 'Mastering Responsive UI & UX in React: Designing a Premium Portfolio Experience',
    'date': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'readTime': '12 min read',
    'tags': ['React', 'CSS', 'UI/UX', 'Testing', 'Frontend'],
    'content': content,
    'coverImage': 'https://amrit-portfolio-prod-media.s3.amazonaws.com/media/blogs/mastering-responsive-ui-ux-react/cover.png',
    'likes': 0,
    'views': 0
}

table.put_item(Item=item)
print("Successfully published Blog 27 to DynamoDB!")
