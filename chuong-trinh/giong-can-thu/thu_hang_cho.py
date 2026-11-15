"""Thu hàng chờ giọng bằng Gemini TTS, tiết kiệm nhất (15/11/2026). Khoá chỉ đọc từ biến môi trường GEMINI_API_KEY, không ghi ra file.
  python3 -I chuong-trinh/giong-can-thu/thu_hang_cho.py --dry        # chỉ đếm, không gọi máy
  GEMINI_API_KEY=... python3 -I ... thu_hang_cho.py --thu 8          # thu thử 8 câu
  GEMINI_API_KEY=... python3 -I ... thu_hang_cho.py                  # thu hết (chạy lại thì chỉ thu phần còn thiếu)
Tiết kiệm: gộp trùng theo chữ thật sự đọc (speak_text), bỏ câu đã có file/aumap, mỗi câu một lần gọi, lưu kết quả sau mỗi 20 câu để chạy lại không mất tiền.
Kiểm không tốn tiền: độ dài file so với số chữ. Kết quả: giong_hang_cho.json {"en:chữ": "tai-nguyen/giong/xxx.mp3"} (tính từ seedling/)."""
import json, os, sys, re, hashlib, subprocess, threading
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(R, 'seedling/cong-cu/gemini'))
DRY = '--dry' in sys.argv; LIM = int(sys.argv[sys.argv.index('--thu') + 1]) if '--thu' in sys.argv else 0
GIONG = os.path.join(R, 'seedling/tai-nguyen/giong'); OUTMAP = os.path.join(HERE, 'giong_hang_cho.json')
VOICE = {'en': 'despina', 'zh': 'zh-cn-techagent-1', 'vi': 'sulafat'}
STYLE = {'en': 'slow, clear and warm, like a kind teacher talking to six-year-old learners',
         'zh': '标准普通话，语速慢，清楚，温柔亲切，像老师对六岁小朋友说话',
         'vi': 'Giọng cô giáo nhẹ nhàng, chậm rãi, rõ ràng, ấm áp, nói với bé sáu tuổi'}
def speak_text(t, l):
    s = re.sub(r'\(nghe\s*làm\s*quen\)|\(nghelàmquen\)', '', t)
    s = re.sub(r"^(?:Bông|Leo|Anna|Xiaomei|Vũ|Mrs Lan|Mummy|Mommy|Mum|Grandpa|Grandma|Dad|Daddy|Kids|The man)\s*:\s*", '', s.strip())
    s = s.replace('“', '').replace('”', '').replace('"', '')
    s = re.sub(r'\s*[/·]\s*', ', ' if l == 'en' else '，', s)
    s = re.sub(r'\s*\((?![^)]*[一-鿿])[^)]*\)', '', s) if l == 'zh' else re.sub(r'\s*\([^)]*\)', '', s)
    return s.strip(' ,，') or t
def fname(l, t): return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"
def load(rel):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); return raw.split('window.SD=', 1)[0], json.loads(raw.split('window.SD=', 1)[1].rstrip().rstrip(';'))
# 1. danh sách việc: hàng chờ + câu chạy thử thấy bị đọc bằng giọng máy
jobs = {}
for i in json.load(open(os.path.join(HERE, 'hang-cho.json'), encoding='utf-8')): jobs.setdefault((i['l'], i['t'].strip()), 'hang-cho')
sp = os.environ.get('CHAY_THU_JSON', '').split(',')
for p in [x for x in sp if x]:
    for r in json.load(open(p, encoding='utf-8')):
        for s in r.get('tts', []):
            l, t = s.split(':', 1)
            if l in ('en', 'zh', 'vi') and t.strip(): jobs.setdefault((l, t.strip()), 'chay-thu')
# 2. bỏ phần đã có
_, SD = load('seedling/seedling-data.js'); AM = SD['aumap']; VT = SD.get('vi_tx', {})
prev = json.load(open(OUTMAP, encoding='utf-8')) if os.path.exists(OUTMAP) else {}
def ok(rel): return rel and os.path.exists(os.path.join(R, 'seedling', rel))
need = {}; have = 0; dup = 0
for (l, t), src in sorted(jobs.items()):
    k = f'{l}:{t}'
    if os.environ.get('LAI_VU') and l == 'zh' and 'Vũ' in t: prev.pop(k, None); AM.pop(k, None)
    if ok(prev.get(k)) or ok(AM.get(k)) or (l == 'vi' and ok(VT.get(t))): have += 1; continue
    st = speak_text(t, l); key = (l, st)
    if key in need: dup += 1; need[key].append(t); continue
    need[key] = [t]
chars = sum(len(s) for (_, s) in need)
print(f'tổng {len(jobs)} | đã có {have} | trùng chữ đọc {dup} | cần thu {len(need)} (en {sum(1 for l, _ in need if l == "en")}, zh {sum(1 for l, _ in need if l == "zh")}, vi {sum(1 for l, _ in need if l == "vi")}) | {chars} ký tự')
if DRY: sys.exit()
import ia
todo = sorted(need)[:LIM] if LIM else sorted(need)
lock = threading.Lock(); errs = []; done = [0]; toks = [0]; odd = []
def work(key):
    l, st = key; vu = l == 'zh' and 'Vũ' in st; f = fname(l, st + '#vu' if vu else st)
    try:
        d = ia.tts(st.replace('Vũ', 'Vu') if vu else st, STYLE[l] + ('；名字“Vu”是越南人名，读作英语的 "voo"，不要读成中文的“乌”或“武”，保持清晰的 v 开头' if vu else ''), VOICE[l]); wav = ia.audio(d)
        p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'pipe:0', '-af',
            'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse',
            '-ac', '1', '-ar', '24000', '-b:a', '48k', os.path.join(GIONG, f)], input=wav, capture_output=True)
        if p.returncode: raise RuntimeError(p.stderr.decode()[:200])
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(GIONG, f)], capture_output=True).stdout or 0)
        per = dur / max(1, len(re.sub(r'\W', '', st)) if l != 'en' else max(1, len(st.split())))   # giây/chữ (zh) hoặc giây/từ (en, vi)
        with lock:
            for t in need[key]: prev[f'{l}:{t}'] = 'tai-nguyen/giong/' + f
            done[0] += 1; toks[0] += d.get('usage', {}).get('total_output_tokens', 0)
            if (l == 'zh' and not .12 <= per <= .9 and len(st) > 2) or (l != 'zh' and not .15 <= per <= 1.8 and len(st.split()) > 1): odd.append((l, st, round(dur, 1)))
            if done[0] % 20 == 0:
                json.dump(prev, open(OUTMAP, 'w', encoding='utf-8'), ensure_ascii=False, indent=0); print(done[0], 'tokens', toks[0], 'lỗi', len(errs), flush=True)
    except Exception as e: errs.append((l, st, str(e)[:160]))
with ThreadPoolExecutor(6) as ex: list(ex.map(work, todo))
json.dump(prev, open(OUTMAP, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('XONG', done[0], '| token âm thanh', toks[0], '| lỗi', len(errs), '| nghi ngờ độ dài', len(odd))
for e in errs[:10]: print('LỖI', e)
json.dump(odd, open(os.path.join(HERE, 'nghi_do_dai.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
