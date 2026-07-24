import boto3
from datetime import datetime, timedelta

logs = boto3.client('logs', region_name='us-east-1')
log_group = '/aws/lambda/amrit-portfolio-prod-api'

try:
    response = logs.filter_log_events(
        logGroupName=log_group,
        startTime=int((datetime.now() - timedelta(minutes=15)).timestamp() * 1000),
        filterPattern='Exception'
    )
    for event in response.get('events', []):
        print(f"[{datetime.fromtimestamp(event['timestamp']/1000)}] {event['message']}")
    
    print("--- FULL LOGS (last 2 mins) ---")
    response2 = logs.filter_log_events(
        logGroupName=log_group,
        startTime=int((datetime.now() - timedelta(minutes=2)).timestamp() * 1000)
    )
    for event in response2.get('events', []):
        print(f"[{datetime.fromtimestamp(event['timestamp']/1000)}] {event['message']}")
except Exception as e:
    print(f"Error: {e}")
