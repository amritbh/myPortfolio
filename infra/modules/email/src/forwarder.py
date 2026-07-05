import os
import boto3
import email
from email.message import EmailMessage
from email.policy import default

s3 = boto3.client('s3')
ses = boto3.client('ses')

FORWARD_TO = os.environ.get('FORWARD_TO')

def lambda_handler(event, context):
    print("Received event:", event)
    
    for record in event.get('Records', []):
        if record['eventSource'] != 'aws:ses':
            continue
            
        ses_record = record['ses']
        mail_info = ses_record['mail']
        message_id = mail_info['messageId']
        receipt = ses_record['receipt']
        
        # We need to fetch the raw email from S3
        # The S3 object key is the messageId
        bucket_name = os.environ.get('S3_BUCKET')
        
        print(f"Fetching email {message_id} from S3 bucket {bucket_name}")
        
        response = s3.get_object(Bucket=bucket_name, Key=message_id)
        raw_email_bytes = response['Body'].read()
        
        # Parse the email
        msg = email.message_from_bytes(raw_email_bytes, policy=default)
        
        # We need to rewrite headers so SES allows sending it.
        # SES Sandbox requires the "From" address to be verified.
        # Since we are forwarding, the original sender's "From" is likely NOT verified in our account.
        # So we change the "From" to be the address it was originally sent to (our verified domain).
        
        original_from = msg.get('From', '')
        original_to = msg.get('To', '')
        original_subject = msg.get('Subject', '')
        
        from email.utils import parseaddr, formataddr
        from_name, from_email = parseaddr(original_from)
        
        # Set Reply-To so when the user hits reply in Gmail, it replies to the original sender
        if not msg.get('Reply-To'):
            msg['Reply-To'] = original_from
            
        # Replace From with our verified domain address (the one the email was sent to)
        # e.g. admin@amrit.cloud
        # To be safe, let's just use the first destination address from the receipt
        send_from = mail_info['destination'][0]
        
        del msg['From']
        if from_name:
            msg['From'] = formataddr((from_name, send_from))
        else:
            msg['From'] = send_from
        
        del msg['Return-Path']
        msg['Return-Path'] = send_from
        
        del msg['To']
        msg['To'] = FORWARD_TO
        
        # Add a prefix to subject to denote forwarded mail
        del msg['Subject']
        msg['Subject'] = f"[Forwarded] {original_subject}"
        
        # Send using SES
        print(f"Sending forwarded email from {send_from} to {FORWARD_TO}")
        
        try:
            ses.send_raw_email(
                Source=send_from,
                Destinations=[FORWARD_TO],
                RawMessage={'Data': msg.as_bytes()}
            )
            print("Email forwarded successfully!")
        except Exception as e:
            print(f"Error sending email: {e}")
            raise e

    return {'statusCode': 200, 'body': 'Processed successfully'}
