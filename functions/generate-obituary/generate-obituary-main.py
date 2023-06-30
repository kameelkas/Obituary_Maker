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

    prompt = f'Please write an obituary about a person named {name} who was born on {born} and died on {dead}.'
    
    url = 'https://api.openai.com/v1/completions'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_s_key}'
    }

    body = {
        'model':'text-curie-001',
        'prompt': prompt,
        'max_tokens': 600,
        'temperature': 0.6
    }

    try:
        res = requests.post(url, headers=headers, json=body)
        res.raise_for_status()  # Raise an exception for non-2xx responses
        obituary = res.json()['choices'][0]['text']
    except requests.exceptions.HTTPError as e:
        obituary = f"OpenAI API error: {str(e)}"
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


