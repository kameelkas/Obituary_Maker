# add your create-obituary function here
import boto3
import json
import time
from base64 import b64decode
from requests_toolbelt.multipart import decoder


step = boto3.client('stepfunctions')
bucket = boto3.client('s3')


def create_obituary_handler(event, context):
    print(event)
    step_arn = 'arn:aws:states:ca-central-1:985238918738:stateMachine:step-function'

    id = event['headers']['id']
    born = event['headers']['born']
    dead = event['headers']['dead']
    name = event['headers']['name']

    body = event['body']
    if event['isBase64Encoded']:
        body = b64decode(body)

    content_type_header = event['headers']['content-type']
    data = decoder.MultipartDecoder(body, content_type_header)

    image = data.parts[0].content
    file_name = 'obit_image.png'
    bucket_name = 'storage-30141921-30141541'

    bucket.put_object(Bucket=bucket_name, Key=file_name, Body=image)

    input_info = {
        "input": {
            'Name': name,
            'Born': born,
            'Dead': dead,
            'id': id
        }
    }


# from chatGPT
    response = step.start_execution(
        stateMachineArn=step_arn,
        input=json.dumps(input_info)
    )

    execution_arn = response['executionArn']

    # Check the status of the execution
    while True:
        execution = step.describe_execution(
            executionArn=execution_arn,
            #includeExecutionData=True
        )
        status = execution['status']
        if status == 'SUCCEEDED':
            # Get the output of the last Lambda function in the Step Function
            output = execution['output']
            print('Success')
            output = json.loads(output)
            print(output)
            info = output['body']
            return {
                "body": json.dumps(info)
            }
        elif status == 'FAILED':
            # Get the error message from the execution details
            error = execution['error']
            cause = execution['cause']
            print('Failed')
            print(error)
            print(cause)
        else:
            time.sleep(5)  # Wait for 5 seconds before checking again
