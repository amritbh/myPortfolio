# Backend Architecture & API Gateway Quirks

## AWS API Gateway Integration

The custom Serverless Backend relies on AWS API Gateway to route HTTP requests to the Python Lambda function.

### Payload Format Versions (Troubleshooting 404 Errors)

When configuring the `aws_apigatewayv2_integration` in Terraform for HTTP APIs, AWS supports two payload format versions: `1.0` and `2.0`.

If the version is not explicitly set to `2.0` in the Terraform module, AWS may default to sending the legacy `1.0` REST API payload format to the Lambda function.

**The Quirk:**

- In Payload **v2.0**, the HTTP path and method are found in: `event['rawPath']` and `event['requestContext']['http']['method']`.
- In Payload **v1.0**, the HTTP path and method are found in: `event['path']` and `event['httpMethod']`.

**The Solution:**
To prevent `404 Not Found` routing errors when the API Gateway sends a `POST` request, the Python Lambda (`app.py`) was updated to securely parse both formats:

```python
# Gracefully handle both v1.0 and v2.0 API Gateway payloads
path = event.get('rawPath', event.get('path', ''))
method = event.get('requestContext', {}).get('http', {}).get('method', event.get('httpMethod', 'GET'))
```

This ensures the backend dynamically accepts payloads regardless of how API Gateway encapsulates them!
