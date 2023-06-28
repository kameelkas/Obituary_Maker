import boto3
import json

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("obituaries-30141921")

def save_item_handler(event, context):
    input_data = json.loads(event)
    try:
        table.put_item(Item=input_data)
        return{
            "statusCode":201,
            "body": json.dumps(input_data)
        }
    except Exception as exp:
        return{
            "statusCode":500,
            "body": json.dumps({"message":str(exp)})
            }





