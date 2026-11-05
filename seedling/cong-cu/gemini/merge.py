"""Lấy kết quả batch, đổi sang mp3 (chậm lại 10%, cắt lặng), gộp với bản realtime có style -> gen_au.json"""
import json, os, base64, subprocess, sys
import bat
W = '/home/claude/work'; OUT = W + '/giong'
K = json.load(open(W + '/batch_keys.json'))
RT = json.load(open(W + '/gen_au_raw.json')) if os.path.exists(W + '/gen_au_raw.json') else {}
TRIM = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse'
def to_mp3(raw, mime, dst, slow):
    if 'wav' in mime: inp = ['-i', 'pipe:0']
    else:
        rate = '24000'
        if 'rate=' in mime: rate = mime.split('rate=')[1].split(';')[0]
        inp = ['-f', 's16le', '-ar', rate, '-ac', '1', '-i', 'pipe:0']
    af = TRIM + (',atempo=0.9' if slow else '')
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-af', af, '-ac', '1', '-ar', '24000', '-b:a', '48k', dst], input=raw, capture_output=True)
    return p.returncode == 0
res = {'rt': 0, 'batch': 0, 'fail': [], 'vi': {}}
gen = {}
for f in RT.values(): pass
for k, f in RT.items():
    if os.path.exists(os.path.join(OUT, f)): gen[k] = f; res['rt'] += 1
for b in ('en', 'zh', 'vi'):
    d = bat.req('GET', K['_batch_' + b])
    rs = d.get('response', {}).get('inlinedResponses', {}).get('inlinedResponses', [])
    print(b, d['metadata']['state'], len(rs))
    for r in rs:
        key = r.get('metadata', {}).get('key')
        try:
            p = r['response']['candidates'][0]['content']['parts'][0]['inlineData']
        except Exception:
            res['fail'].append((key, str(r.get('error'))[:120])); continue
        if b == 'vi':
            dst = f'{OUT}/{key}.mp3'
            if to_mp3(base64.b64decode(p['data']), p['mimeType'], dst, False): res['vi'][key[3:]] = f'{key}.mp3'
            continue
        l, t = K[key]; lk = f'{l}:{t}'
        if lk in gen: continue
        if to_mp3(base64.b64decode(p['data']), p['mimeType'], f'{OUT}/{key}.mp3', True):
            gen[lk] = f'{key}.mp3'; res['batch'] += 1
        else: res['fail'].append((key, 'ffmpeg'))
pre = 'tai-nguyen/giong/'
json.dump({k: pre + v for k, v in gen.items()}, open(W + '/gen_au.json', 'w'), ensure_ascii=False, indent=0)
json.dump({k: pre + v for k, v in res['vi'].items()}, open(W + '/gen_vi_a.json', 'w'), ensure_ascii=False, indent=0)
print('realtime', res['rt'], 'batch', res['batch'], 'vi', len(res['vi']), 'fail', len(res['fail']), res['fail'][:10])
