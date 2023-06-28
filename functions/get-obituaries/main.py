import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("obituaries-30141921")

def get_obituaries_handler(event, context):
    try:
        tablee = table.scan()
        if tablee["Count"] == 0:
            return{
                "statusCode": 200,
                "body": json.dumps({"message": "No obituaries located",
                "data":[]
                })
            }
        else:
            return{
                "statusCode": 200,
                "body": json.dumps({"message": "Obituaries located",
                "data":tablee["Items"]
                })
            }
    except Exception as e:
        print(e)
        return{
            "statusCode": 500,
            "body": "Error retrieving items"
        }
