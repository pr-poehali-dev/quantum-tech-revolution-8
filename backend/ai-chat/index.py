import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    '''
    Business: Принимает запрос пользователя и отправляет его в Groq для генерации ответа.
    Args: event - dict с httpMethod, body (prompt, mode); context - объект с request_id
    Returns: HTTP-ответ с полем answer (текст от нейросети)
    '''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw)
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'})
        }

    prompt = (body.get('prompt') or '').strip()
    mode = body.get('mode', 'text')

    if not prompt:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Prompt is required'})
        }

    if mode in ('image', 'video'):
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'answer': f'Режим «{mode}» скоро будет доступен. Пока я могу подробно описать, как создать это словами — попробуй переключиться на «Текст».',
                'mode': mode
            })
        }

    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'GROQ_API_KEY is not configured'})
        }

    payload = {
        'model': 'llama-3.3-70b-versatile',
        'messages': [
            {'role': 'system', 'content': 'Ты — дружелюбный универсальный ассистент NeuroFree. Отвечай на русском, кратко и по делу.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 1024
    }

    req = urllib.request.Request(
        'https://api.groq.com/openai/v1/chat/completions',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            answer = data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        err_text = e.read().decode('utf-8', errors='ignore')
        return {
            'statusCode': 502,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Groq error: {e.code}', 'details': err_text[:300]})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Request failed: {str(e)[:200]}'})
        }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'answer': answer, 'mode': mode})
    }