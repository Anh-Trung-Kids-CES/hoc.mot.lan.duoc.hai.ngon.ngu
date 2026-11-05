import json, urllib.request, urllib.error, gem
B = 'https://generativelanguage.googleapis.com/v1beta/'
def req(method, path, body=None):
    r = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                               headers={'Content-Type': 'application/json', 'x-goog-api-key': gem.KEY})
    try:
        with urllib.request.urlopen(r, timeout=600) as x: return json.load(x)
    except urllib.error.HTTPError as e: raise RuntimeError(f'{e.code} {e.read().decode()[:800]}')
def tts_req(text, voice):
    return {'contents': [{'parts': [{'text': text}]}], 'generationConfig': {'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
def submit(model, items, name):
    body = {'batch': {'display_name': name, 'input_config': {'requests': {'requests': [{'request': r, 'metadata': {'key': k}} for k, r in items]}}}}
    return req('POST', f'models/{model}:batchGenerateContent', body)
