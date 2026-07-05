import os
import pytest
import boto3
from moto import mock_aws
from email.message import EmailMessage

# Set environment variables for the Lambda before importing it
os.environ['FORWARD_TO'] = 'target@example.com'
os.environ['S3_BUCKET'] = 'test-inbound-mail'
os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'
os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
os.environ['AWS_SECURITY_TOKEN'] = 'testing'
os.environ['AWS_SESSION_TOKEN'] = 'testing'

# Import forwarder after env vars are set
from infra.modules.email.src import forwarder

@pytest.fixture
def s3_client():
    with mock_aws():
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-inbound-mail')
        yield s3

@pytest.fixture
def ses_client():
    with mock_aws():
        ses = boto3.client('ses', region_name='us-east-1')
        ses.verify_domain_identity(Domain='amrit.cloud')
        yield ses

def test_lambda_handler_forwards_email(s3_client, ses_client):
    # Create a dummy email
    msg = EmailMessage()
    msg['Subject'] = 'Test Subject'
    msg['From'] = 'sender@external.com'
    msg['To'] = 'admin@amrit.cloud'
    msg.set_content('This is a test email body.')
    
    message_id = 'test-message-id-123'
    
    # Put the email in the mocked S3 bucket
    s3_client.put_object(
        Bucket='test-inbound-mail',
        Key=message_id,
        Body=msg.as_bytes()
    )
    
    # Create a mock SES event
    event = {
        'Records': [
            {
                'eventSource': 'aws:ses',
                'ses': {
                    'mail': {
                        'messageId': message_id,
                        'destination': ['admin@amrit.cloud']
                    },
                    'receipt': {}
                }
            }
        ]
    }
    
    import unittest.mock
    with unittest.mock.patch.object(forwarder.ses, 'send_raw_email', wraps=ses_client.send_raw_email) as mock_ses:
        # Call the lambda handler
        response = forwarder.lambda_handler(event, None)
        
        # Verify success response
        assert response['statusCode'] == 200
        assert response['body'] == 'Processed successfully'
        
        # Verify send_raw_email was called correctly
        mock_ses.assert_called_once()
        call_kwargs = mock_ses.call_args.kwargs
    
    assert call_kwargs['Source'] == 'admin@amrit.cloud'
    assert call_kwargs['Destinations'] == ['target@example.com']
    
    # Verify the rewritten raw message
    raw_message = call_kwargs['RawMessage']['Data']
    import email
    sent_msg = email.message_from_bytes(raw_message)
    
    assert sent_msg['Subject'] == '[Forwarded] Test Subject'
    assert 'sender@external.com' in sent_msg['From']
    assert '<admin@amrit.cloud>' in sent_msg['From']
    assert sent_msg['Reply-To'] == 'sender@external.com'
    assert sent_msg['To'] == 'target@example.com'

def test_lambda_handler_ignores_non_ses_events():
    event = {
        'Records': [
            {
                'eventSource': 'aws:s3'
            }
        ]
    }
    
    response = forwarder.lambda_handler(event, None)
    assert response['statusCode'] == 200
