import json, base64, time, urllib.request, urllib.error, os
KEY = os.environ['GEMINI_API_KEY']  # khoá đặt trong biến môi trường, không lưu vào repo
BASE = 'https://generativelanguage.googleapis.com/v1beta/models/'
def call(model, body, timeout=300, tries=4):
    for i in range(tries):
        req = urllib.request.Request(BASE + model + ':generateContent', data=json.dumps(body).encode(),
                                     headers={'Content-Type': 'application/json', 'x-goog-api-key': KEY})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:600]
            if e.code in (429, 500, 503) and i < tries - 1:
                print('retry', e.code, msg[:200]); time.sleep(20 * (i + 1)); continue
            raise RuntimeError(f'{e.code} {msg}')
def tts(text, voice='Kore', model='gemini-3.8-flash-tts'):
    body = {'contents': [{'parts': [{'text': text}]}],
            'generationConfig': {'responseModalities': ['AUDIO'],
                                 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
    d = call(model, body)
    p = d['candidates'][0]['content']['parts'][0]['inlineData']
    return base64.b64decode(p['data']), p.get('mimeType'), d.get('usageMetadata')
def image(prompt, refs=(), model='gemini-nano-banana-2.1', aspect=None):
    parts = []
    for path in refs:
        mt = 'image/png' if path.endswith('.png') else 'image/webp' if path.endswith('.webp') else 'image/jpeg'
        parts.append({'inlineData': {'mimeType': mt, 'data': base64.b64encode(open(path, 'rb').read()).decode()}})
    parts.append({'text': prompt})
    cfg = {'responseModalities': ['IMAGE']}
    if aspect: cfg['imageConfig'] = {'aspectRatio': aspect}
    d = call(model, {'contents': [{'parts': parts}], 'generationConfig': cfg})
    for p in d['candidates'][0]['content']['parts']:
        if 'inlineData' in p:
            return base64.b64decode(p['inlineData']['data']), p['inlineData']['mimeType'], d.get('usageMetadata')
    raise RuntimeError('no image: ' + json.dumps(d)[:500])
def transcribe(path_or_bytes, mime='audio/mp3', model='gemini-3.5-flash-lite', hint=''):
    b = open(path_or_bytes, 'rb').read() if isinstance(path_or_bytes, str) else path_or_bytes
    body = {'contents': [{'parts': [{'inlineData': {'mimeType': mime, 'data': base64.b64encode(b).decode()}},
             {'text': 'Transcribe exactly what is spoken in this audio, verbatim, in its original language and script (Chinese in Hanzi). Output only the transcript.' + hint}]}]}
    d = call(model, body)
    return d['candidates'][0]['content']['parts'][0]['text'].strip()
