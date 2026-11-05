import json, base64, urllib.request, urllib.error, time
import gem
def tts(text, style='', voice='despina', model='gemini-3.8-flash-tts', tries=5):
    item = {'type': 'text', 'text': text}
    if style: item['annotations'] = [{'type': 'speech_metadata', 'style': style}]
    body = {'model': model, 'input': [{'type': 'user_input', 'content': [item]}], 'response_format': {'type': 'audio'},
            'generation_config': {'speech_config': [{'voice': voice}]}}
    for i in range(tries):
        req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/interactions', data=json.dumps(body).encode(),
              headers={'Content-Type': 'application/json', 'x-goog-api-key': gem.KEY})
        try:
            with urllib.request.urlopen(req, timeout=180) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            m = e.read().decode()[:500]
            if e.code in (429, 500, 503) and i < tries - 1: time.sleep(15 * (i + 1)); continue
            raise RuntimeError(f'{e.code} {m}')
def audio(d):
    for s in d['steps']:
        for c in s.get('content', []):
            if c.get('type') == 'audio': return base64.b64decode(c['data'])
    raise RuntimeError('no audio')
