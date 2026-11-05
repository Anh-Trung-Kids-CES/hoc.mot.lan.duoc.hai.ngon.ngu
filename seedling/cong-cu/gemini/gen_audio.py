"""Tạo giọng Gemini TTS cho từng câu thiếu (mỗi câu một yêu cầu, không phải tách khoảng lặng).
python3 gen_audio.py <miss_au.json> <out_dir> <map.json> [workers]"""
import json, sys, os, re, hashlib, subprocess, threading, time
from concurrent.futures import ThreadPoolExecutor
import ia
MISS, OUT, MAP = sys.argv[1], sys.argv[2], sys.argv[3]
NW = int(sys.argv[4]) if len(sys.argv) > 4 else 6
os.makedirs(OUT, exist_ok=True)
VOICE = {'en': 'despina', 'zh': 'zh-cn-techagent-1', 'vi': None}
STYLE = {'en': 'slow, clear and warm, like a kind teacher talking to six-year-old learners',
         'zh': '标准普通话，语速慢，清楚，温柔亲切，像老师对六岁小朋友说话'}
SPK = r"^(?:Bông|Leo|Anna|Xiaomei|Vũ|Mrs Lan|Mummy|Mommy|Mum|Grandpa|Grandma|Dad|Daddy|Kids|The man|Miss Hoa|[A-Z][a-z]+'s (?:daddy|mummy|brother))\s*:\s*"
def speak_text(t, l):
    s = re.sub(r'\(nghe\s*làm\s*quen\)|\(nghelàmquen\)', '', t)
    s = re.sub(SPK, '', s.strip())
    if l == 'zh':
        s = re.sub(r'^(?:Bông|Leo|Anna|Xiaomei|Vũ|Lan老师|妈妈|爸爸|爷爷|奶奶|小朋友们?|表演的人|Hoa姐姐|\w{1,8}的(?:爸爸|妈妈|哥哥))(?:说|问)?：', '', s)
    s = s.replace('“', '').replace('”', '').replace('"', '')
    s = re.sub(r'\s*[/·]\s*', ', ' if l == 'en' else '，', s)
    s = re.sub(r'\s*\((?![^)]*[一-鿿])[^)]*\)', '', s) if l == 'zh' else re.sub(r'\s*\([^)]*\)', '', s)
    s = s.strip(' ,，')
    return s or t
def fname(l, t):
    return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"
lock = threading.Lock()
mp = json.load(open(MAP)) if os.path.exists(MAP) else {}
items = [tuple(x) for x in json.load(open(MISS))]
todo = [(l, t) for l, t in items if f'{l}:{t}' not in mp]
print('todo', len(todo), 'of', len(items), flush=True)
done = [0]; toks = [0]; errs = []
PACE = float(os.environ.get('PACE', '0'))
last = [0.0]
def work(lt):
    l, t = lt
    if PACE:
        with lock:
            w = last[0] + PACE - time.time()
            if w > 0: time.sleep(w)
            last[0] = time.time()
    st = speak_text(t, l)
    try:
        d = ia.tts(st, STYLE[l], VOICE[l])
        wav = ia.audio(d)
    except Exception as e:
        errs.append((l, t, str(e)[:200])); return
    f = fname(l, t)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-af',
                        'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse',
                        '-ac', '1', '-ar', '24000', '-b:a', '48k', os.path.join(OUT, f)], input=wav, capture_output=True)
    if p.returncode:
        errs.append((l, t, p.stderr.decode()[:200])); return
    with lock:
        mp[f'{l}:{t}'] = f; done[0] += 1; toks[0] += d['usage']['total_output_tokens']
        if done[0] % 20 == 0:
            json.dump(mp, open(MAP, 'w'), ensure_ascii=False, indent=0)
            print(done[0], 'tokens', toks[0], 'errs', len(errs), time.strftime('%H:%M:%S'), flush=True)
with ThreadPoolExecutor(NW) as ex:
    list(ex.map(work, todo))
json.dump(mp, open(MAP, 'w'), ensure_ascii=False, indent=0)
print('DONE', done[0], 'audio tokens', toks[0], 'errors', len(errs))
for e in errs[:20]: print('ERR', e)
