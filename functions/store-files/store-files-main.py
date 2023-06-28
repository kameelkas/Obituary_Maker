import boto3
import json
import time
import requests
import hashlib

bucket = boto3.client('s3')
get_key = boto3.client("ssm")


def store_files_handler(event, context):
    input_data = json.loads(event)
    name = input_data['Name']
    born = input_data['Born']
    dead = input_data['Dead']
    id = input_data['id']
    obituary = input_data['Obituary']

    key_response = get_key.get_parameters(
        Names=['Cloudinary_SKey'], WithDecryption=True)
    api_s_key = key_response['Parameters'][0]['Value']

    image_name = 'obit_image.png'
    speech_name = 'speech.mp3'
    bucket_name = 'storage-30141921-30141541'

    get_image = bucket.get_object(Bucket=bucket_name, Key=image_name)
    get_speech = bucket.get_object(Bucket=bucket_name, Key=speech_name)

    image = get_image['Body'].read()
    speech = get_speech['Body'].read()

    api_key = '166783116254194'
    cloud_name = 'dapnj1d31'
    timestamp = int(time.time())

    body_image = {
        'timestamp': timestamp,
        'api_key': api_key,
        'eager': 'e_art:zorro,e_grayscale',
    }

    body_image['signature'] = create_signature(body_image, api_s_key)

    url_image = f'https://api.cloudinary.com/v1_1/{cloud_name}/image/upload'
    res_image = requests.post(
        url_image, files={'file': image}, data=body_image)

    body_speech = {
        'timestamp': timestamp,
        'api_key': api_key,
        "public_id": f"speech_{timestamp}.mp3"
    }

    body_speech['signature'] = create_signature(body_speech, api_s_key)

    url_speech = f'https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload'
    res_speech = requests.post(
        url_speech, files={'file': speech}, data=body_speech)

    json_res_image = json.loads(res_image.text)
    json_res_speech = json.loads(res_speech.text)

    print(json_res_image)
    print(json_res_speech)

    image_url = json_res_image['secure_url']
    speech_url = json_res_speech['secure_url']

    input_info = {
        'Name': name,
        'Born': born,
        'Dead': dead,
        'id': id,
        'Obituary': obituary,
        'ImageURL': image_url,
        'SpeechURL': speech_url
    }

    return json.dumps(input_info)


def create_signature(body, secret):
    excluded = ['api_key', 'resource_type', 'cloud_name', 'file']
    sorted_body = sort_dict(body, excluded)
    query_str = create_query_string(sorted_body)
    query_str_app = f'{query_str}{secret}'
    sig = hashlib.sha1(query_str_app.encode()).hexdigest()
    return sig


def sort_dict(dictionary, exclude):
    return {k: v for k, v in sorted(dictionary.items(), key=lambda item: item[0]) if k not in exclude}


def create_query_string(body):
    str = ""
    for idx, (k, v) in enumerate(body.items()):
        str = f'{k}={v}' if idx == 0 else f'{str}&{k}={v}'

    return str
