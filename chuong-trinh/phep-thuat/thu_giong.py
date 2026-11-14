"""Thu giọng Phép thuật lời nói (14/11/2026). Khoá chỉ đọc từ biến môi trường GEMINI_API_KEY.
  python3 -I thu_giong.py --dry | --thu N (thu thử N clip) | (không cờ = thu hết)
Clip dùng lại giọng có sẵn thì chép file (0đ); còn lại gọi Gemini. Ra: seedling/tai-nguyen/giong/phep-thuat/<id>.mp3 + giong_pt_xong.json
Dừng ngay khi lỗi 402."""
import json, os, sys, re, shutil, subprocess, base64
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(R, 'seedling/cong-cu/gemini'))
DRY = '--dry' in sys.argv; N = int(sys.argv[sys.argv.index('--thu') + 1]) if '--thu' in sys.argv else 0
OUT = os.path.join(R, 'seedling/tai-nguyen/giong/phep-thuat'); os.makedirs(OUT, exist_ok=True)
VOICE = {'en': 'despina', 'zh': 'zh-cn-techagent-1'}
STYLE = {'en': 'slow, clear and warm, like a kind teacher talking to six-year-old learners', 'zh': '标准普通话，语速慢，清楚，温柔亲切，像老师对六岁小朋友说话'}
FF = ['-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15,areverse']
def load(rel):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); return json.loads(raw.split('window.SD=', 1)[1].rstrip().rstrip(';'))
SD = load('seedling/seedling-data.js'); LS = load('little-seed/little-seed-data.js')
have = {}
def norm(p): return p[len('../seedling/'):] if p.startswith('../seedling/') else p
def scan(o, own):
    if isinstance(o, dict):
        for ak, l in (('a_en', 'en'), ('a_zh', 'zh')):
            p, t = o.get(ak), o.get(l)
            if isinstance(p, str) and p.endswith('.mp3') and t and (own or p.startswith('../seedling/')):
                q = norm(p)
                if os.path.exists(os.path.join(R, 'seedling', q)): have.setdefault(f'{l}:{t.lower()}', q)
        for v in o.values(): scan(v, own)
    elif isinstance(o, list):
        for v in o: scan(v, own)
scan(SD['days'], True); scan(LS['days'], False)
for k, v in SD['aumap'].items():
    if os.path.exists(os.path.join(R, 'seedling', v)): have[k.lower()] = v
clips = json.load(open(os.path.join(HERE, 'giong_can_thu.json'), encoding='utf-8'))
done = {}; need = []
for c in clips:
    dst = os.path.join(OUT, c['id'] + '.mp3')
    if os.path.exists(dst): done[c['id']] = 'co'; continue
    h = have.get(f"{c['l']}:{c['text']}".lower())
    if h and c['l'] != 'vi': need.append((c, h))
    else: need.append((c, None))
reuse = [x for x in need if x[1]]; call = [x for x in need if not x[1]]
print('đã có', len(done), '| dùng lại', len(reuse), '| cần thu', len(call), {l: sum(1 for c, _ in call if c['l'] == l) for l in ('en', 'zh', 'vi')})
if DRY: sys.exit()
for c, h in reuse: shutil.copy(os.path.join(R, 'seedling', h), os.path.join(OUT, c['id'] + '.mp3')); done[c['id']] = 'dung-lai'
if N: call = call[:N]
errs = []; stop = []
def enc(data, dst, pcm):
    a = ['ffmpeg', '-v', 'error', '-y'] + (['-f', 's16le', '-ar', '24000', '-ac', '1'] if pcm else []) + ['-i', 'pipe:0'] + FF + ['-ac', '1', '-ar', '24000', '-b:a', '48k', dst]
    p = subprocess.run(a, input=data, capture_output=True)
    if p.returncode: raise RuntimeError(p.stderr.decode()[:200])
def work(x):
    c = x[0]
    if stop: return
    try:
        dst = os.path.join(OUT, c['id'] + '.mp3')
        if c['l'] == 'vi':
            import gem
            d = gem.call('gemini-3.8-flash-tts', {'contents': [{'parts': [{'text': c['text']}]}], 'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': 'Sulafat'}}}}})
            enc(base64.b64decode(d['candidates'][0]['content']['parts'][0]['inlineData']['data']), dst, True)
        else:
            import ia
            enc(ia.audio(ia.tts(c['text'], STYLE[c['l']], VOICE[c['l']])), dst, False)
        done[c['id']] = 'moi'
    except Exception as e:
        if '402' in str(e): stop.append(1)
        errs.append((c['id'], str(e)[:200]))
with ThreadPoolExecutor(4) as ex: list(ex.map(work, call))
json.dump(done, open(os.path.join(HERE, 'giong_pt_xong.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('xong', len(done), '/', len(clips), '| lỗi', len(errs), errs[:5], '| DỪNG 402' if stop else '')
