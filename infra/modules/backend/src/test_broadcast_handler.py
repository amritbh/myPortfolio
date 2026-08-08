import json
import pytest
from unittest.mock import patch, MagicMock

import broadcast_handler

@pytest.fixture
def mock_dynamo():
    with patch('broadcast_handler.dynamodb') as mock:
        yield mock

@pytest.fixture
def mock_ses():
    with patch('broadcast_handler.ses') as mock:
        yield mock

def test_broadcast_handler_success(mock_dynamo, mock_ses):
    # Setup mock dynamo table scan
    mock_table = MagicMock()
    mock_table.scan.return_value = {
        'Items': [
            {'email': 'test1@example.com'},
            {'email': 'test2@example.com'}
        ]
    }
    mock_dynamo.Table.return_value = mock_table
    
    event = {
        'Records': [
            {
                'body': json.dumps({
                    'title': 'My Awesome Blog',
                    'slug': 'my-awesome-blog'
                })
            }
        ]
    }
    
    broadcast_handler.subscribers_table_name = "test-table"
    
    res = broadcast_handler.lambda_handler(event, None)
    
    assert res['statusCode'] == 200
    
    # Assert DynamoDB was scanned
    mock_table.scan.assert_called_once()
    
    # Assert SES was called twice
    assert mock_ses.send_email.call_count == 2
    
    # Verify first email contents
    call_args = mock_ses.send_email.call_args_list[0][1]
    assert call_args['Destination']['ToAddresses'] == ['test1@example.com']
    assert call_args['Source'] == 'newsletter@amrit.cloud'
    assert call_args['Message']['Subject']['Data'] == 'New Blog Published: My Awesome Blog'
    assert 'https://amrit.cloud/blogs/my-awesome-blog' in call_args['Message']['Body']['Text']['Data']

def test_broadcast_handler_missing_table():
    broadcast_handler.subscribers_table_name = None
    res = broadcast_handler.lambda_handler({}, None)
    assert res is None

def test_broadcast_handler_missing_body_fields(mock_dynamo, mock_ses):
    event = {
        'Records': [
            {
                'body': json.dumps({
                    'title': 'My Awesome Blog'
                    # Missing slug
                })
            }
        ]
    }
    broadcast_handler.subscribers_table_name = "test-table"
    
    res = broadcast_handler.lambda_handler(event, None)
    
    assert res['statusCode'] == 200
    
    # Assert DynamoDB was NOT scanned because the record is skipped
    mock_dynamo.Table().scan.assert_not_called()
    mock_ses.send_email.assert_not_called()
