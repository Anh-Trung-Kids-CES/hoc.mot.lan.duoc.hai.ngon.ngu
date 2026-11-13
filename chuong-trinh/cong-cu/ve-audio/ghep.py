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
    BEAT = 60 / bpm; target = 3.4 * BEAT; L = len(x) / SR; r = L / target
    t = float(np.clip(r, 0.85, 1.25)) if not right else float(np.clip(r, 1.0, 1.25))
    y = am.tempo(x, t); flag = ''
    if r > 1.25: flag = f'dài {r:.2f}× ô nhịp'
    start = max(0.0, target - len(y) / SR) if right else 0.0
    return np.concatenate([am.sil(start), y]), t, flag

def dong(r, l, bpm):
    """Âm thanh 1 dòng (đặt từ đầu ô nhịp), đồng thanh thì chồng giọng lệch 30 ms."""
    right = '___' in r.get('en_o', '') or '___' in r.get('zh_o', '')
    xs, info = [], []
    for v, p, key in r['giong'][l]:
        y, t, fl = fit(raw(key, p), bpm, right); xs.append(am.level(y, LV)); info.append(dict(giong=v, t=round(t, 3), co=fl, kiem=CHECK.get(key, {}).get('flags', [])))
    if len(xs) == 1: return xs[0], info
    n = max(len(x) for x in xs) + int(.07 * SR); y = np.zeros(n, np.float32)
    for i, x in enumerate(xs): o = int(i * .03 * SR); y[o:o + len(x)] += x * .55
    return am.level(y, LV), info

def build(b):
    bpm = b['bpm']; BEAT = 60 / bpm; BAR = 4 * BEAT; d = f"{OUT}/{b['lv']}/{b['id']}"; os.makedirs(d, exist_ok=True)
    bars = ['count'] + ['line'] * len(b['dong']) + ['end']
    mus = synth(bars, bpm); res = dict(id=b['id'], bpm=bpm, ten=b['ten'], dong=[])
    mus_db = am.rms_db(mus)
    am.master(mus * 10 ** ((-24 - mus_db) / 20), f'{d}/nhac.mp3', title=f"{b['ten'][0]} · nhạc vỗ tay", target=-18.0)
    for l in ('en', 'zh'):
        voice = np.zeros_like(mus)
        for i, r in enumerate(b['dong']):
            y, info = dong(r, l, bpm)
            am.write(y, f'{d}/{l}_{i + 1:02d}.mp3', ['-c:a', 'libmp3lame', '-b:a', '48k'])
            o = int((i + 1) * BAR * SR); voice[o:o + len(y)] += y[:len(voice) - o]
            if l == 'en': res['dong'].append(dict(en=r['tts']['en'], zh=r['tts']['zh'], vai=r['vai'], info={}))
            res['dong'][i]['info'][l] = info
        x = voice + mus * 10 ** ((LV - 11 - mus_db) / 20)
        x = x[:int(len(bars) * BAR * SR + .4 * SR)]
        I, P = am.master(x, f'{d}/{l}_mau.mp3', title=f"{b['ten'][0 if l == 'en' else 1]} · {'Tiếng Anh' if l == 'en' else 'Tiếng Trung'}")
        res[l] = dict(dur=round(len(x) / SR, 1), lufs=I, peak=P)
    return res

if __name__ == '__main__':
    ids = set(sys.argv[1:]); todo = [b for b in B if not ids or b['id'] in ids]
    R = json.load(open(f'{OUT}/ghep.json')) if os.path.exists(f'{OUT}/ghep.json') else {}
    from concurrent.futures import ProcessPoolExecutor
    with ProcessPoolExecutor(4) as ex:
        for b, r in zip(todo, ex.map(build, todo)):
            R[b['id']] = r; print(b['id'], r['en'], r['zh'], [x['co'] for d in r['dong'] for x in d['info']['en'] + d['info']['zh'] if x['co']], flush=True)
    json.dump(R, open(f'{OUT}/ghep.json', 'w'), ensure_ascii=False, indent=1)
