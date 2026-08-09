import json
import pytest
import os
from unittest.mock import MagicMock, patch
import broadcast_handler

@pytest.fixture
def mock_dynamodb():
    with patch('broadcast_handler.dynamodb') as mock_db:
        yield mock_db

@pytest.fixture
def mock_ses():
    with patch('broadcast_handler.ses') as mock_ses:
        yield mock_ses

@pytest.fixture(autouse=True)
def mock_env():
    broadcast_handler.subscribers_table_name = 'test_table'
    yield

def test_broadcast_handler_manual_invocation(mock_dynamodb, mock_ses):
    event = {
        'subject': 'Test Subject',
        'body': 'Test Body'
    }
    
    # Mock DynamoDB table and scan
    mock_table = MagicMock()
    mock_dynamodb.Table.return_value = mock_table
    mock_table.scan.return_value = {
        'Items': [
            {'email': 'test1@example.com'},
            {'email': 'test2@example.com'}
        ]
    }
    
    response = broadcast_handler.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert 'Custom broadcast complete' in response['body']
    assert mock_ses.send_email.call_count == 2
    
    # Verify the parameters of the first call
    call_args = mock_ses.send_email.call_args_list[0][1]
    assert call_args['Destination']['ToAddresses'] == ['test1@example.com']
    assert call_args['Message']['Subject']['Data'] == 'Test Subject'
    assert call_args['Message']['Body']['Text']['Data'] == 'Test Body'

def test_broadcast_handler_dynamodb_stream_insert(mock_dynamodb, mock_ses):
    event = {
        'Records': [
            {
                'eventSource': 'aws:dynamodb',
                'eventName': 'INSERT',
                'dynamodb': {
                    'NewImage': {
                        'title': {'S': 'My New Blog'},
                        'slug': {'S': 'my-new-blog'}
                    }
                }
            }
        ]
    }
    
    # Mock DynamoDB table and scan
    mock_table = MagicMock()
    mock_dynamodb.Table.return_value = mock_table
    mock_table.scan.return_value = {
        'Items': [
            {'email': 'subscriber@example.com'}
        ]
    }
    
    response = broadcast_handler.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert mock_ses.send_email.call_count == 1
    
    call_args = mock_ses.send_email.call_args_list[0][1]
    assert call_args['Destination']['ToAddresses'] == ['subscriber@example.com']
    assert 'My New Blog' in call_args['Message']['Subject']['Data']
    assert 'my-new-blog' in call_args['Message']['Body']['Text']['Data']

def test_broadcast_handler_dynamodb_stream_modify(mock_dynamodb, mock_ses):
    # Should ignore MODIFY events
    event = {
        'Records': [
            {
                'eventSource': 'aws:dynamodb',
                'eventName': 'MODIFY',
                'dynamodb': {
                    'NewImage': {
                        'title': {'S': 'Updated Blog'},
                        'slug': {'S': 'updated-blog'}
                    }
                }
            }
        ]
    }
    
    mock_table = MagicMock()
    mock_dynamodb.Table.return_value = mock_table
    mock_table.scan.return_value = {'Items': [{'email': 'subscriber@example.com'}]}
    
    response = broadcast_handler.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert mock_ses.send_email.call_count == 0

def test_broadcast_handler_unknown_source(mock_dynamodb, mock_ses):
    event = {
        'Records': [
            {
                'eventSource': 'aws:sqs',
                'body': '{}'
            }
        ]
    }
    
    mock_table = MagicMock()
    mock_dynamodb.Table.return_value = mock_table
    
    response = broadcast_handler.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    assert mock_ses.send_email.call_count == 0
