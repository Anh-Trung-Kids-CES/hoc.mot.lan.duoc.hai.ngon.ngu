"""Gemini TTS theo lô (Batch, rẻ hơn 50%). Khoá lấy từ biến môi trường GEMINI_API_KEY, không ghi ra file.
python3 tts_batch.py submit <clips.json> <work_dir> [limit]   -> gửi lô, lưu tên lô vào work_dir/jobs.json
python3 tts_batch.py fetch <work_dir>                         -> tải kết quả đã xong về work_dir/raw/<key>.pcm (WAV thô giữ lại)"""
import json, sys, os, base64, time, urllib.request, urllib.error, wave
KEY = os.environ['GEMINI_API_KEY']; B = 'https://generativelanguage.googleapis.com/v1beta/'
def req(method, path, body=None):
    r = urllib.request.Request(B + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                               headers={'Content-Type': 'application/json', 'x-goog-api-key': KEY})
    for i in range(4):
        try:
            with urllib.request.urlopen(r, timeout=600) as x: return json.load(x)
        except urllib.error.HTTPError as e:
            m = e.read().decode()[:600]
            if e.code in (429, 500, 503) and i < 3: time.sleep(15 * (i + 1)); continue
            raise RuntimeError(f'{e.code} {m}')
def treq(text, voice):
    return {'contents': [{'parts': [{'text': text}]}], 'generationConfig': {'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
def wav(path, pcm, rate=24000):
    with wave.open(path, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
cmd, a = sys.argv[1], sys.argv[2:]
if cmd == 'submit':
    clips = json.load(open(a[0])); wd = a[1]; lim = int(a[2]) if len(a) > 2 else 10**9
    os.makedirs(wd + '/raw', exist_ok=True)
    jf = wd + '/jobs.json'; jobs = json.load(open(jf)) if os.path.exists(jf) else []
    sent = {k for j in jobs for k in j['keys']}
    todo = [(k, c) for k, c in clips.items() if k not in sent and not os.path.exists(f'{wd}/raw/{k}.wav')][:lim]
    groups = {}
    for k, c in todo: groups.setdefault(c['model'], []).append((k, c))
    for model, items in groups.items():
        for i in range(0, len(items), 250):
            part = items[i:i + 250]
            body = {'batch': {'display_name': f'workbook-{model}-{int(time.time())}-{i}', 'input_config': {'requests': {'requests': [
                {'request': treq(c['text'], c['voice']), 'metadata': {'key': k}} for k, c in part]}}}}
            r = req('POST', f'models/{model}:batchGenerateContent', body)
            jobs.append({'name': r['name'], 'model': model, 'keys': [k for k, _ in part]}); json.dump(jobs, open(jf, 'w'))
            print('submitted', r['name'], len(part), flush=True)
else:
    wd = a[0]; jobs = json.load(open(wd + '/jobs.json')); ok = bad = pend = 0
    for j in jobs:
        if j.get('done'): continue
        r = req('GET', j['name']); st = r.get('metadata', {}).get('state') or r.get('state')
        if st not in ('BATCH_STATE_SUCCEEDED', 'JOB_STATE_SUCCEEDED', 'SUCCEEDED'):
            print(j['name'], st); pend += 1
            if 'FAILED' in str(st) or 'CANCELLED' in str(st): j['done'] = 'failed'
            continue
        resp = r.get('response', r); inl = (resp.get('inlinedResponses') or {}).get('inlinedResponses') or []
        for x in inl:
            k = (x.get('metadata') or {}).get('key')
            try:
                p = x['response']['candidates'][0]['content']['parts'][0]['inlineData']
                wav(f'{wd}/raw/{k}.wav', base64.b64decode(p['data'])); ok += 1
            except Exception as e:
                bad += 1; print('ERR', k, str(x)[:200])
        j['done'] = True
    json.dump(jobs, open(wd + '/jobs.json', 'w')); print('ok', ok, 'bad', bad, 'pending', pend)
