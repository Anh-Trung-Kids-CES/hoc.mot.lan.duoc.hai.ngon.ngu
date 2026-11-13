"""Hỏi trạng thái lô; lô xong thì lưu raw/<key>.wav. In một dòng trạng thái."""
import json, base64, os, subprocess, bat
os.makedirs('raw', exist_ok=True)
def to_wav(raw, mime, dst):
    rate = mime.split('rate=')[1].split(';')[0] if 'rate=' in (mime or '') else '24000'
    inp = ['-i', 'pipe:0'] if raw[:4] == b'RIFF' else ['-f', 's16le', '-ar', rate, '-ac', '1', '-i', 'pipe:0']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-ac', '1', '-ar', '24000', dst], input=raw, check=True)
B = json.load(open('batches.json')); st = []; tok = 0
for b in B:
    if b.get('done'): st.append('xong'); continue
    d = bat.req('GET', b['name']); s = d.get('metadata', {}).get('state', '?'); st.append(s.replace('BATCH_STATE_', ''))
    if s.endswith('SUCCEEDED'):
        rs = d.get('response', {}).get('inlinedResponses', {})
        rs = rs.get('inlinedResponses', []) if isinstance(rs, dict) else rs
        bad = []
        for r in rs:
            k = r.get('metadata', {}).get('key')
            try:
                p = r['response']['candidates'][0]['content']['parts'][0]['inlineData']
                to_wav(base64.b64decode(p['data']), p.get('mimeType', ''), f'raw/{k}.wav')
                b['tok'] = b.get('tok', 0) + r['response'].get('usageMetadata', {}).get('candidatesTokenCount', 0)
            except Exception: bad.append(k)
        b['done'] = True; b['loi'] = bad
    elif s.endswith(('FAILED', 'CANCELLED', 'EXPIRED')): b['done'] = True; b['loi'] = b['keys']
json.dump(B, open('batches.json', 'w'), indent=1)
print(' '.join(st), '| raw', len(os.listdir('raw')), '| lỗi', sum(len(b.get('loi', [])) for b in B), '| token ra', sum(b.get('tok', 0) for b in B), flush=True)
