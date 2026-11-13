"""Ghép file nghe cho từng trang: xử lý clip (cắt lặng, chậm lại, cân âm), chèn khoảng lặng và chuông, xuất mp3 64 kbps mono 24 kHz.
python3 assemble.py <work_dir> <tracks.json> <clips.json> <out_dir> <tempo 0.90|0.85>"""
import sys, os, json, subprocess, wave, numpy as np
wd, TR, CL, OUT, TEMPO = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
SR = 24000; os.makedirs(wd + '/proc', exist_ok=True); os.makedirs(OUT, exist_ok=True)
tracks, clips = json.load(open(TR)), json.load(open(CL))
def proc(k):
    o = f'{wd}/proc/{k}.npy'
    if os.path.exists(o): return np.load(o)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{wd}/raw/{k}.wav', '-af',
        f'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,atempo={TEMPO}',
        '-ac', '1', '-ar', str(SR), '-f', 's16le', 'pipe:1'], capture_output=True)
    a = np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768
    rms = np.sqrt(np.mean(a ** 2)) + 1e-9; a = a * (10 ** (-21 / 20) / rms)    # cân về -21 dBFS RMS
    n = int(SR * .02); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    np.save(o, a); return a
def tone(f, d=.28, amp=.22):
    t = np.arange(int(SR * d)) / SR; e = np.minimum(1, np.minimum(t / .02, (d - t) / .12))
    return (np.sin(2 * np.pi * f * t) * e * amp).astype(np.float32)
CHIME = {'start': np.concatenate([tone(523), tone(659), tone(784, .4)]), 'check': np.concatenate([tone(784), tone(659), tone(784, .4)]),
         'end': np.concatenate([tone(523, .2), tone(659, .2), tone(784, .2), tone(1047, .5)])}
sil = lambda s: np.zeros(int(SR * s), dtype=np.float32)
bad = []
for name, seq in tracks.items():
    if os.path.exists(f'{OUT}/{name}.mp3') and '--force' not in sys.argv: continue
    parts = []
    for it in seq:
        if it[0] == 'say':
            if not os.path.exists(f'{wd}/raw/{it[1]}.wav'): bad.append((name, it[1], 'thiếu')); continue
            a = proc(it[1]); parts += [a, sil(.25)]
            c = clips[it[1]]; dur = len(a) / SR; words = max(1, len(c['text'].split()) if c['lang'] == 'en' else len(c['text']) / 2)
            if dur > 1.6 * words + 2.5 or dur < .25: bad.append((name, c['text'][:50], round(dur, 1)))
        elif it[0] == 'pause': parts.append(sil(it[1]))
        else: parts += [CHIME[it[1]], sil(.5)]
    x = np.concatenate(parts); pk = np.abs(x).max()
    if pk > .9: x *= .9 / pk
    tmp = f'{wd}/{name}.pcm'; (x * 32767).astype(np.int16).tofile(tmp)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', tmp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-ac', '1', '-b:a', '48k', f'{OUT}/{name}.mp3'], check=True); os.remove(tmp)
print('xong', len(tracks), 'track; cảnh báo', len(bad))
for b in bad[:40]: print('  ', b)
