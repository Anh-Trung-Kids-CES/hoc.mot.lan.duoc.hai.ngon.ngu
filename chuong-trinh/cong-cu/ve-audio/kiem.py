"""Máy tự kiểm bản thô: độ dài so với số chữ + chép lời so lời vè. Lỗi (trừ dòng có tên) tạo lại tối đa 2 vòng bằng gọi lẻ.
Ra kiem.json {key: {dur, exp, tr, flags, lan}}"""
import json, os, re, time, threading, base64, difflib, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import gem
from pypinyin import lazy_pinyin
J = {j['key']: j for j in json.load(open('jobs.json'))}
C = json.load(open('kiem.json')) if os.path.exists('kiem.json') else {}
TEN = r'Bông|Vũ|Leo|Anna|小美'
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
def du_kien(l, t):
    if l == 'en': return 0.35 + 0.436 * len(re.findall(r"[A-Za-zÀ-ỹ']+", t))
    return 0.32 + 0.435 * (len(re.findall(r'[一-鿿]', t)) + 1.5 * len(re.findall(r'[A-Za-zÀ-ỹ]+', t)))
NUM = {'1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'}
def chuan(l, t):
    t = re.sub(TEN.lower(), '§', t.lower().replace('’', "'"))
    if l == 'en':
        t = re.sub(r'\d+', lambda m: NUM.get(m.group(), m.group()), t)
        return list(''.join(re.findall(r"§|[a-z]+", t)))
    t = ''.join(re.findall(r'[一-鿿§]', t.translate(str.maketrans('12345678910', '一二三四五六七八九十十'))))
    return [p for p in lazy_pinyin(t.replace('§', 'X')) if p]
def sai(a, b): return sum(max(i2 - i1, j2 - j1) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes() if op != 'equal')
def transcribe(f, l):
    ask = ('This audio is spoken in English. Transcribe it verbatim in English. Do not translate. Output only the transcript.' if l == 'en'
           else 'This audio is spoken in Mandarin Chinese (Latin-letter personal names may appear). Transcribe it verbatim in Chinese characters; keep Latin names in Latin letters. Do not translate. Output only the transcript.')
    body = {'contents': [{'parts': [{'inlineData': {'mimeType': 'audio/wav', 'data': base64.b64encode(open(f, 'rb').read()).decode()}}, {'text': ask}]}]}
    d = gem.call('gemini-3.1-flash-lite', body)
    return d['candidates'][0]['content']['parts'][0]['text'].strip()
def kiem(k):
    j = J[k]; f = f'raw/{k}.wav'
    if not os.path.exists(f): return k, dict(flags=['thiếu'])
    d = dur(f); e = du_kien(j['l'], j['text']) + 0.4 * len(re.findall(r'[,，、!！?？]', j['text']))
    try: tr = transcribe(f, j['l'])
    except Exception as ex: tr = '?'
    fl = []
    if d > 1.9 * e + 1.2: fl.append(f'dài {d:.1f}/{e:.1f}s')
    if d < 0.45 * e: fl.append(f'ngắn {d:.1f}/{e:.1f}s')
    s = sai(chuan(j['l'], j['text']), chuan(j['l'], tr))
    if s > (2 if j['l'] == 'en' else 0): fl.append(f'lệch {s}')
    if j['l'] == 'en' and re.search(r'[一-鿿]', tr): fl.append('nhầm tiếng')
    return k, dict(dur=round(d, 2), exp=round(e, 2), tr=tr, flags=fl)
lock = threading.Lock(); last = [0.0]
def lam_lai(k):
    j = J[k]
    with lock:
        w = last[0] + 6.5 - time.time()
        if w > 0: time.sleep(w)
        last[0] = time.time()
    body = {'contents': [{'parts': [{'text': j['prompt']}]}], 'generationConfig': {'responseModalities': ['AUDIO'],
            'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': j['voice'].capitalize()}}}}}
    d = gem.call(j['model'], body); p = d['candidates'][0]['content']['parts'][0]['inlineData']
    import lay_wav; lay_wav.to_wav(base64.b64decode(p['data']), p.get('mimeType', ''), f'raw/{k}.wav')
if __name__ == '__main__':
    todo = [k for k in J if k not in C and os.path.exists(f'raw/{k}.wav')]
    print('chưa có bản thô', sum(1 for k in J if not os.path.exists(f'raw/{k}.wav')), '· kiểm', len(todo), flush=True)
    with ThreadPoolExecutor(8) as ex:
        for k, r in ex.map(kiem, todo): C[k] = dict(r, lan=1)
    json.dump(C, open('kiem.json', 'w'), ensure_ascii=False, indent=1)
    for vong in (2, 3):
        bad = [k for k, r in C.items() if k in J and r['flags'] and not re.search(TEN, J[k]['text']) and r.get('lan', 1) < vong]
        print('vòng', vong, 'tạo lại', len(bad), flush=True)
        if not bad: break
        def redo(k):
            try: lam_lai(k)
            except Exception as e: return k, dict(flags=[f'lỗi gọi {str(e)[:80]}'])
            return kiem(k)
        with ThreadPoolExecutor(3) as ex:
            for k, r in ex.map(redo, bad): C[k] = dict(r, lan=vong)
        json.dump(C, open('kiem.json', 'w'), ensure_ascii=False, indent=1)
    still = [(k, J[k]['text'], C[k]['flags'], C[k].get('tr')) for k in C if k in J and C[k]['flags']]
    print('còn gắn cờ', len(still))
    for s in still[:60]: print(s)
