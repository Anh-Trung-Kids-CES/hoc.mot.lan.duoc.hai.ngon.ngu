"""Thu giọng Anh/Trung cho 24 thẻ thêm (the_them.json) và 20 câu Vận động cấu trúc (cau_truc.json) (14/11/2026).
    GEMINI_API_KEY=... python3 -I chuong-trinh/phan-bo-tu-them/thu_giong_tu_them.py [--dry]
Câu đã có file giọng trong kho (thẻ cùng chữ) thì dùng lại; chưa có thì thu bằng Gemini với giọng chuẩn (Anh despina, Trung zh-cn-techagent-1).
Ghi kết quả vào giong_them.json: {"en:chữ": "tai-nguyen/giong/xxx.mp3"} (đường dẫn tính từ thư mục seedling/). Chạy lại vẫn ra cùng kết quả."""
import json, os, sys, re, hashlib, subprocess
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(R, 'seedling/cong-cu/gemini'))
DRY = '--dry' in sys.argv
GIONG = os.path.join(R, 'seedling/tai-nguyen/giong')
VOICE = {'en': 'despina', 'zh': 'zh-cn-techagent-1'}
STYLE = {'en': 'slow, clear and warm, like a kind teacher talking to six-year-old learners', 'zh': '标准普通话，语速慢，清楚，温柔亲切，像老师对六岁小朋友说话'}
def fname(l, t): return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"
def load(rel):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); return json.loads(raw.split('window.SD=', 1)[1].rstrip().rstrip(';'))
SD = load('seedling/seedling-data.js'); LS = load('little-seed/little-seed-data.js'); AM = SD['aumap']
have = {}   # 'en:chữ' -> đường dẫn (từ seedling/) có sẵn trong kho
def norm(p): return p[len('../seedling/'):] if p.startswith('../seedling/') else p
def scan(o, own):
    if isinstance(o, dict):
        for ak, tk, l in (('a_en', 'en', 'en'), ('a_zh', 'zh', 'zh')):
            p, t = o.get(ak), o.get(tk)
            if isinstance(p, str) and p.endswith('.mp3') and t and (own or p.startswith('../seedling/')):
                q = norm(p)
                if os.path.exists(os.path.join(R, 'seedling', q)): have.setdefault(f'{l}:{t.lower()}', q)
        for v in o.values(): scan(v, own)
    elif isinstance(o, list):
        for v in o: scan(v, own)
scan(SD['days'], True); scan(LS['days'], False)
for k, v in AM.items():
    if os.path.exists(os.path.join(R, 'seedling', v)): have[k.lower()] = v
th = json.load(open(os.path.join(HERE, 'the_them.json'), encoding='utf-8')); ct = json.load(open(os.path.join(HERE, 'cau_truc.json'), encoding='utf-8'))
want = []
for k, c in th.items():
    if k.startswith('_') or 'fromcard' in c: continue
    want += [('en', c['en']), ('zh', c['zh'])]
for q in ct['qs']: want.append((q['l'], q['t']))
out = {}; need = []
prev = os.path.join(HERE, 'giong_them.json')
if os.path.exists(prev): out.update(json.load(open(prev, encoding='utf-8')))
for l, t in dict.fromkeys(want):
    key = f'{l}:{t}'
    if key in out and os.path.exists(os.path.join(R, 'seedling', out[key])): continue
    h = have.get(key.lower())
    if h: out[key] = h
    else: need.append((l, t))
print('dùng lại', len(out), '| cần thu', len(need)); [print('  ', l, t) for l, t in need]
if DRY: sys.exit()
if need:
    import ia
    errs = []
    def work(lt):
        l, t = lt; f = fname(l, t)
        try:
            wav = ia.audio(ia.tts(t.replace('?', '?').strip(), STYLE[l], VOICE[l]))
            p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-af',
                'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse',
                '-ac', '1', '-ar', '24000', '-b:a', '48k', os.path.join(GIONG, f)], input=wav, capture_output=True)
            if p.returncode: raise RuntimeError(p.stderr.decode()[:200])
            out[f'{l}:{t}'] = 'tai-nguyen/giong/' + f
        except Exception as e: errs.append((l, t, str(e)[:200]))
    with ThreadPoolExecutor(4) as ex: list(ex.map(work, need))
    print('lỗi:', errs)
json.dump(out, open(prev, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)
print('giong_them.json:', len(out), 'câu')
