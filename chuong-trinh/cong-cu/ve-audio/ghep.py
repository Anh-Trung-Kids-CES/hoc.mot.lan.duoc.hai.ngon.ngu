"""Ghép audio vè từ bản thô (không tốn tiền, chạy lại bao nhiêu lần cũng được).
Mỗi bài, mỗi thứ tiếng: file mẫu (đếm vào + từng dòng trên nền nhạc vỗ tay + ô kết), file từng dòng cho web (đã đặt đúng vị trí trong ô nhịp);
mỗi bài một file nhạc vỗ tay không lời. Nhạc giống hệt nhạc máy trên web (bb-ve.js, music()).
python3 ghep.py [id ...]"""
import json, os, re, sys, numpy as np
from scipy.signal import butter, sosfilt
import am
SR = am.SR; LV = -20.0
B = json.load(open('ve_list.json'))
CHECK = json.load(open('kiem.json')) if os.path.exists('kiem.json') else {}
OUT = 'out'
rng = np.random.default_rng(7)
HP = butter(4, 7000, 'highpass', fs=SR, output='sos'); BP = butter(2, [1100, 2000], 'bandpass', fs=SR, output='sos')

def synth(bars, bpm):
    """bars: danh sách 'count' | 'line' | 'end'. Trả mảng nhạc."""
    BEAT = 60 / bpm; BAR = 4 * BEAT; n = int(len(bars) * BAR * SR + SR); y = np.zeros(n, np.float32)
    def add(t, sig):
        i = int(t * SR); j = min(n, i + len(sig)); y[i:j] += sig[:j - i]
    def env(d, v, att=.02):
        k = int(d * SR); e = np.full(k, v, np.float32); a = int(att * SR)
        e[:a] = np.geomspace(1e-4, v, a); e[a:] = np.geomspace(v, 1e-4, k - a); return e
    def note(f, t, d, typ, v):
        k = int(d * SR); tt = np.arange(k) / SR; ph = (f * tt) % 1
        w = np.sin(2 * np.pi * f * tt) if typ == 'sine' else np.sign(np.sin(2 * np.pi * f * tt)) if typ == 'square' else 2 * np.abs(2 * ph - 1) - 1
        add(t, w * env(d, v))
    def noise(t, d, v, hp):
        k = int(d * SR); x = (rng.random(k) * 2 - 1) * (1 - np.arange(k) / k) ** 2
        add(t, sosfilt(HP if hp else BP, x) * v * (1 if hp else 2.2))
    def kick(t):
        k = int(.3 * SR); tt = np.arange(k) / SR; f = np.maximum(45, 140 * (45 / 140) ** (tt / .18))
        ph = 2 * np.pi * np.cumsum(f) / SR; a = .9 * np.maximum(1e-4, (1e-4 / .9) ** (tt / .25))
        add(t, np.sin(ph) * a)
    CH = [[48, 64, 67, 72], [43, 62, 67, 71], [45, 64, 69, 72], [41, 65, 69, 72]]; hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for bi, k in enumerate(bars):
        tb = bi * BAR
        if k == 'count':
            for b in range(4): note(1600 if b == 0 else 1200, tb + b * BEAT, .08, 'square', .25)
            continue
        ch = CH[bi % 4]
        for b in range(4):
            t = tb + b * BEAT
            kick(t) if b % 2 == 0 else noise(t, .16, .7, False)
            noise(t + BEAT / 2, .05, .18, True); noise(t, .05, .12, True)
            note(hz(ch[0]), t, BEAT * .9, 'triangle', .35)
        for m in ch[1:]: note(hz(m), tb, BAR * .95, 'sine', .07)
    return y * .5

def raw(key, p):
    return am.pitch(am.trim(am.read(f'raw/{key}.wav')), p)

def fit(x, bpm, right=False):
    """Co giãn cho vừa ô nhịp: phần có tiếng dài khoảng 3,4 phách, bắt đầu đúng phách 1 (dòng có ô tên: kết thúc ở 3,4 phách).
    Trả (mảng đã đặt từ đầu ô nhịp, hệ số co giãn, cờ)."""
    BEAT = 60 / bpm; target = 6.8 * BEAT; L = len(x) / SR; r = L / target   # mỗi dòng 2 ô nhịp = 8 phách
    t = float(np.clip(r, 0.85, 1.3)) if not right else float(np.clip(r, 1.0, 1.3))
    y = am.tempo(x, t); flag = ''
    if r > 1.3: flag = f'dài {r:.2f}× chỗ dành cho dòng'
    start = max(0.0, target - len(y) / SR) if right else 0.0
    return np.concatenate([am.sil(start), y]), t, flag

def am_tiet(w):
    w = re.sub(r"[^a-z]", '', w.lower())
    if not w: return 0
    n = len(re.findall(r'[aeiouy]+', w)) - (1 if re.search(r'[^aeiouy]e$', w) and not w.endswith('le') else 0)
    return max(1, n)

def moc_chu(y, r, l):
    """Thời điểm bắt đầu từng chữ (giây, tính từ đầu file dòng) cho karaoke: chia theo đoạn có tiếng và số âm tiết. Miễn phí, gần đúng."""
    if l == 'en':
        toks = r['tts']['en'].split(); syl = [am_tiet(t) for t in toks]
        chunks = [[]]; [chunks[-1].append(i) or (chunks.append([]) if re.search(r'[,.!?…]$', t) else None) for i, t in enumerate(toks)]
    else:
        toks = re.findall(r'[A-Za-zÀ-ỹ]+|[一-鿿]', r['tts']['zh']); syl = [2 if re.match(r'[A-Za-z]', t) else 1 for t in toks]
        chunks = []; cur = []
        for ch in re.findall(r'[A-Za-zÀ-ỹ]+|[一-鿿]|[，。！？、,!?…]', r['tts']['zh']):
            if re.match(r'[，。！？、,!?…]', ch):
                if cur: chunks.append(cur); cur = []
            else: cur.append(len(cur) + sum(len(c) for c in chunks))
        if cur: chunks.append(cur)
    chunks = [c for c in chunks if c]
    segs = am.segments(y, rel=-32, gap=0.14)
    if not segs: return [0.0] * len(toks)
    def spread(idx, a, b):
        tot = sum(syl[i] for i in idx) or 1; t = a; out = {}
        for i in idx: out[i] = round(t, 2); t += (b - a) * syl[i] / tot
        return out
    m = {}
    if len(segs) == len(chunks):
        for c, (a, b) in zip(chunks, segs): m.update(spread(c, a, b))
    else:   # không khớp: dàn đều trên toàn bộ thời gian có tiếng
        tot = sum(b - a for a, b in segs); acc = 0; pos = []
        allsyl = sum(syl) or 1; t = 0
        for i in range(len(toks)):
            # đổi "thời gian có tiếng" t sang thời gian thật
            x = t; real = segs[-1][1]
            for a, b in segs:
                if x <= b - a: real = a + x; break
                x -= b - a
            m[i] = round(real, 2); t += tot * syl[i] / allsyl
    return [m.get(i, 0.0) for i in range(len(toks))]

def dong(r, l, bpm):
    """Một dòng, đặt từ đầu chỗ của dòng (2 ô nhịp). Trả (bản nghe, bản giọng đơn, thông tin, mốc chữ).
    Đồng thanh: giọng chính (Bông) rõ, 2 giọng đệm nhỏ hơn 10 dB, lệch 30 ms; bản giọng đơn = giọng chính."""
    right = '___' in r.get('en_o', '') or '___' in r.get('zh_o', '')
    xs, info = [], []
    for v, p, key in r['giong'][l]:
        y, t, fl = fit(raw(key, p), bpm, right); xs.append(am.level(y, LV)); info.append(dict(giong=v, t=round(t, 3), co=fl, kiem=CHECK.get(key, {}).get('flags', [])))
    don = xs[0]; moc = moc_chu(don, r, l)
    if len(xs) == 1: return don, don, info, moc
    n = max(len(x) for x in xs) + int(.07 * SR); y = np.zeros(n, np.float32)
    for i, x in enumerate(xs): o = int(i * .03 * SR); y[o:o + len(x)] += x * (1.0 if i == 0 else 0.32)
    return am.level(y, LV), don, info, moc

def nhip_bai(b):
    """Nhịp riêng từng bài: giữ nhịp gốc (A 96, B 88) nếu câu dài nhất vừa chỗ 2 ô nhịp khi đọc nhanh tối đa ×1,25; không thì hạ nhịp (thấp nhất 70)."""
    L = 0
    for r in b['dong']:
        for l in ('en', 'zh'):
            for v, p, key in r['giong'][l][:1]: L = max(L, len(am.trim(am.read(f'raw/{key}.wav'))) / SR)
    return int(min(b['bpm'], max(70, 60 * 6.8 * 1.25 / L)))

def build(b):
    bpm = nhip_bai(b); BEAT = 60 / bpm; BAR = 4 * BEAT; d = f"{OUT}/{b['lv']}/{b['id']}"; os.makedirs(d, exist_ok=True)
    n = len(b['dong']); res = dict(id=b['id'], bpm=bpm, ten=b['ten'], dong=[])
    bars = ['count'] + ['line'] * (2 * n) + ['end']; mus = synth(bars, bpm); mus_db = am.rms_db(mus)
    bars2 = ['count'] + ['line'] * (4 * n) + ['end']; mus2 = synth(bars2, bpm)
    am.master(mus * 10 ** ((-24 - mus_db) / 20), f'{d}/nhac.mp3', title=f"{b['ten'][0]} · nhạc vỗ tay", target=-18.0)
    g = 10 ** ((LV - 11 - mus_db) / 20)
    for l in ('en', 'zh'):
        v1 = np.zeros_like(mus); v2 = np.zeros_like(mus2)
        for i, r in enumerate(b['dong']):
            y, don, info, moc = dong(r, l, bpm)
            am.write(y, f'{d}/{l}_{i + 1:02d}.mp3', ['-c:a', 'libmp3lame', '-b:a', '48k'])
            if len(info) > 1: am.write(don, f'{d}/{l}_{i + 1:02d}_don.mp3', ['-c:a', 'libmp3lame', '-b:a', '48k'])
            o = int((1 + 2 * i) * BAR * SR); v1[o:o + len(y)] += y[:len(v1) - o]
            o = int((1 + 4 * i) * BAR * SR); v2[o:o + len(don)] += don[:len(v2) - o]
            if l == 'en': res['dong'].append(dict(en=r['tts']['en'], zh=r['tts']['zh'], vai=r['vai'], info={}, moc={}, don=len(info) > 1))
            res['dong'][i]['info'][l] = info; res['dong'][i]['moc'][l] = moc
        nm = b['ten'][0 if l == 'en' else 1]; L = 'Tiếng Anh' if l == 'en' else 'Tiếng Trung'
        x = (v1 + mus * g)[:int(len(bars) * BAR * SR + .4 * SR)]
        I, P = am.master(x, f'{d}/{l}_mau.mp3', title=f'{nm} · {L} · mẫu')
        x2 = (v2 + mus2 * g)[:int(len(bars2) * BAR * SR + .4 * SR)]
        am.master(x2, f'{d}/{l}_noi_theo.mp3', title=f'{nm} · {L} · nói theo')
        res[l] = dict(dur=round(len(x) / SR, 1), dur_noi_theo=round(len(x2) / SR, 1), lufs=I, peak=P)
    return res

if __name__ == '__main__':
    ids = set(sys.argv[1:]); todo = [b for b in B if not ids or b['id'] in ids]
    R = json.load(open(f'{OUT}/ghep.json')) if os.path.exists(f'{OUT}/ghep.json') else {}
    from concurrent.futures import ProcessPoolExecutor
    with ProcessPoolExecutor(4) as ex:
        for b, r in zip(todo, ex.map(build, todo)):
            R[b['id']] = r; print(b['id'], r['en'], r['zh'], [x['co'] for d in r['dong'] for x in d['info']['en'] + d['info']['zh'] if x['co']], flush=True)
    json.dump(R, open(f'{OUT}/ghep.json', 'w'), ensure_ascii=False, indent=1)
