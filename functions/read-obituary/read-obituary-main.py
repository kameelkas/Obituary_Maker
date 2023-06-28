import boto3
import json

polly = boto3.client('polly')
bucket = boto3.client('s3')

def read_obituary_handler(event, context):
    input_data = json.loads(event)
    name = input_data['Name']
    born = input_data['Born']
    dead = input_data['Dead']
    id = input_data['id']
    text = input_data['Obituary']

    response = polly.synthesize_speech(
        Engine='standard',
        LanguageCode='en-US',
        OutputFormat='mp3',
        Text=text,
        TextType='text',
        VoiceId='Justin'
    )

    audio_output = response['AudioStream'].read()
    file_name = 'speech.mp3'
    bucket_name = 'storage-30141921-30141541'

    bucket.put_object(Bucket=bucket_name, Key=file_name, Body=audio_output)

    input_info = {
        'Name':name,
        'Born':born,
        'Dead':dead,
        'id':id,
        'Obituary':text
    }

    return json.dumps(input_info)
