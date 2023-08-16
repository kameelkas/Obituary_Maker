import boto3
import requests
import json

get_key = boto3.client('ssm')
def generate_obituary_handler(event, context):

    key_response = get_key.get_parameters(Names=['OpenAI_SKey'], WithDecryption=True)
    api_s_key = key_response['Parameters'][0]['Value']

    
    name = event['Name']
    born = event['Born']
    dead = event['Dead']
    id = event['id']

    prompt = f'Please write an obituary about a person/fictional character named {name} who was born on {born} and died on {dead}. Please keep it short.'
    
    messages = [
        {"role": "user", "content": prompt}
    ]

    url = 'https://api.openai.com/v1/chat/completions'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_s_key}'
    }

    body = {
        'model':'gpt-3.5-turbo',
        'messages': messages,
        'max_tokens': 150,
        'temperature': 0.6
    }

    try:
        res = requests.post(url, headers=headers, json=body)
        print(res.json())
        obituary = res.json()['choices'][0]['message']['content']
    except Exception as e:
        obituary = f"Error: {str(e)}"

    input_info = {
        'Name':name,
        'Born':born,
        'Dead':dead,
        'id':id,
        'Obituary':obituary
    }

    return json.dumps(input_info)


