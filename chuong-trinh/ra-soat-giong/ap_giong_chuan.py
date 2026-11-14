"""Đưa tiếng Anh/Trung về một giọng chuẩn trong cùng một bước (14/11/2026).
    GEMINI_API_KEY=... python3 -I chuong-trinh/ra-soat-giong/ap_giong_chuan.py [--dry]
Giọng chuẩn: Anh = despina, Trung = zh-cn-techagent-1 (kho seedling/tai-nguyen/giong, aumap). Trong mỗi bước đã có giọng chuẩn
mà còn lẫn file của cô Hươu thu cũ (ls_co_huou) hoặc canopy (cn_), thay bằng file chuẩn của đúng câu đó;
câu chưa có thì thu mới bằng Gemini (cùng lời dặn giọng với gen_audio.py). Giọng nhân vật (Anna, Bông, thỏ con) giữ nguyên.
Thẻ thêm (cờ plus) thiếu giọng cũng được lấp. Chạy lại vẫn ra cùng kết quả."""
import json, os, re, sys, hashlib, subprocess, threading, time
from concurrent.futures import ThreadPoolExecutor
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(R, 'seedling/cong-cu/gemini'))
DRY = '--dry' in sys.argv
FILES = [('seedling/seedling-data.js', 'seedling'), ('little-seed/little-seed-data.js', 'little-seed')]
GIONG = os.path.join(R, 'seedling/tai-nguyen/giong')
VOICE = {'en': 'despina', 'zh': 'zh-cn-techagent-1'}
STYLE = {'en': 'slow, clear and warm, like a kind teacher talking to six-year-old learners',
         'zh': '标准普通话，语速慢，清楚，温柔亲切，像老师对六岁小朋友说话'}
REPL = re.compile(r'/(?:ls_co_huou_|cn_|cn_bu_)|/canopy/')   # nguồn thay; giọng nhân vật không nằm trong đây
def load(rel):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); head, body = raw.split('window.SD=', 1)
    return head, json.loads(body.rstrip().rstrip(';'))
data = {rel: load(rel) for rel, _ in FILES}
AM = data['seedling/seedling-data.js'][1]['aumap']
def speak_text(t, l):
    s = re.sub(r'\(nghe\s*làm\s*quen\)|\(nghelàmquen\)', '', t)
    s = re.sub(r"^(?:Bông|Leo|Anna|Xiaomei|Vũ|Mrs Lan|Mummy|Mommy|Mum|Grandpa|Grandma|Dad|Daddy|Kids|The man)\s*:\s*", '', s.strip())
    s = s.replace('“', '').replace('”', '').replace('"', '')
    s = re.sub(r'\s*[/·]\s*', ', ' if l == 'en' else '，', s)
    s = re.sub(r'\s*\((?![^)]*[一-鿿])[^)]*\)', '', s) if l == 'zh' else re.sub(r'\s*\([^)]*\)', '', s)
    return s.strip(' ,，') or t
def fname(l, t): return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"

# 1. đi qua mọi bước: gom việc cần thay và việc cần thu
KEYS = (('a_en', 'en', 'en'), ('a_zh', 'zh', 'zh'), ('a', 't', None), ('a_q', 'q', 'zh'))
def refs(step):
    out = []
    def walk(o):
        if isinstance(o, dict):
            for ak, tk, l in KEYS:
                p = o.get(ak)
                if isinstance(p, str) and p.endswith('.mp3') and o.get(tk): out.append((o, ak, o[tk], l or o.get('l')))
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(step); return out
tasks = []; need = set()
for rel, base in FILES:
    for d in data[rel][1]['days'].values():
        for s in d['steps']:
            rs = refs(s)
            for o, ak, t, l in rs:   # file bị thiếu: thay bằng giọng chuẩn của đúng câu đó
                if l in ('en', 'zh') and not os.path.exists(os.path.normpath(os.path.join(R, base, o[ak]))):
                    tasks.append((rel, base, o, ak, l, t))
                    k = f'{l}:{t}'
                    if k not in AM or not os.path.exists(os.path.join(R, 'seedling', AM[k])): need.add((l, t))
            for l in ('en', 'zh'):
                grp = [r for r in rs if r[3] == l]
                if not any('/giong/' in r[0][r[1]] for r in grp): continue
                for o, ak, t, _ in grp:
                    if REPL.search(o[ak]):
                        tasks.append((rel, base, o, ak, l, t))
                        if f'{l}:{t}' not in AM or REPL.search(AM[f'{l}:{t}']): need.add((l, t))
            if s['type'] in ('the', 'goi', 'nen'):   # thẻ thêm thiếu giọng
                for c in s.get('cards', []):
                    if c.get('plus'):
                        for ak, tk, l in (('a_en', 'en', 'en'), ('a_zh', 'zh', 'zh')):
                            if not c.get(ak) and c.get(tk) and f'{l}:{c[tk]}' not in AM: need.add((l, c[tk]))
print('thay file lẫn giọng:', len(tasks), '| câu cần thu mới:', len(need), '| ký tự:', sum(len(t) for _, t in need))
if DRY: sys.exit()
# 2. thu mới
if need:
    import ia
    lock = threading.Lock(); errs = []
    def work(lt):
        l, t = lt; f = fname(l, t)
        try:
            wav = ia.audio(ia.tts(speak_text(t, l), STYLE[l], VOICE[l]))
            p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-af',
                'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse',
                '-ac', '1', '-ar', '24000', '-b:a', '48k', os.path.join(GIONG, f)], input=wav, capture_output=True)
            if p.returncode: raise RuntimeError(p.stderr.decode()[:200])
            with lock: AM[f'{l}:{t}'] = 'tai-nguyen/giong/' + f
        except Exception as e: errs.append((l, t, str(e)[:200]))
    with ThreadPoolExecutor(4) as ex: list(ex.map(work, sorted(need)))
    print('thu mới xong, lỗi:', errs)
# 3. gắn vào dữ liệu
def rel_to(base, p): return p if base == 'seedling' else '../seedling/' + p
n = 0
for rel, base in FILES:
    for d in data[rel][1]['days'].values():
        for s in d['steps']:
            for c in s.get('cards', []):
                if c.get('plus'):
                    for ak, tk, l in (('a_en', 'en', 'en'), ('a_zh', 'zh', 'zh')):
                        if not c.get(ak) and f'{l}:{c.get(tk)}' in AM: c[ak] = rel_to(base, AM[f'{l}:{c[tk]}'])
for rel, base, o, ak, l, t in tasks:
    k = f'{l}:{t}'
    if k in AM: o[ak] = rel_to(base, AM[k]); n += 1
for rel, _ in FILES:
    head, j = data[rel]
    if rel.startswith('seedling'): j['aumap'] = AM
    open(os.path.join(R, rel), 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(j, ensure_ascii=False) + ';\n')
print('đã thay', n, 'chỗ')
