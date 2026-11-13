"""Xử lý âm thanh (giống claude/MaNghe_Reader.md): đọc/ghi, cắt lặng, tách đoạn, co giãn, cân âm lượng, xuất mp3."""
import subprocess, numpy as np, re, os
SR = 24000

def read(path):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.int16).astype(np.float32) / 32768

def write(x, path, extra=()):
    b = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', *extra, path], input=b, check=True)

def env_db(x, hop=0.01):
    n = int(SR * hop); m = len(x) // n
    r = np.sqrt(np.mean(x[:m * n].reshape(m, n) ** 2, axis=1) + 1e-12)
    return 20 * np.log10(r)

def segments(x, rel=-38, gap=0.09, hop=0.01):
    e = env_db(x, hop)
    if not len(e): return []
    th = e.max() + rel; on = e > th; segs = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            segs.append([i * hop, j * hop]); i = j
        else: i += 1
    out = []
    for s in segs:
        if out and s[0] - out[-1][1] < gap: out[-1][1] = s[1]
        else: out.append(s)
    return [s for s in out if s[1] - s[0] > 0.04]

def trim(x, pad_in=0.03, pad_out=0.06):
    s = segments(x)
    if not s: return x
    a = max(0, int((s[0][0] - pad_in) * SR)); b = min(len(x), int((s[-1][1] + pad_out) * SR))
    y = x[a:b].copy(); fi, fo = int(0.008 * SR), int(0.03 * SR)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    return y

def _ff(x, af):
    b = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', '-af', af, '-f', 's16le', '-'], input=b, capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.int16).astype(np.float32) / 32768

def tempo(x, t):
    """t > 1 nhanh hơn. Giữ âm sắc (rubberband)."""
    if abs(t - 1) < 1e-3: return x
    return _ff(x, f'rubberband=tempo={t:.4f}:pitchq=quality:formant=preserved')

def pitch(x, r):
    if abs(r - 1) < 1e-3: return x
    return _ff(x, f'rubberband=pitch={r}:pitchq=quality')

def rms_db(x):
    s = segments(x)
    v = np.concatenate([x[int(a * SR):int(b * SR)] for a, b in s]) if s else x
    return 20 * np.log10(np.sqrt(np.mean(v ** 2)) + 1e-12)

def level(x, target=-20.0):
    y = x * 10 ** ((target - rms_db(x)) / 20)
    pk = np.max(np.abs(y)) if len(y) else 0
    return y / pk * 0.95 if pk > 0.95 else y

def sil(sec): return np.zeros(int(sec * SR), np.float32)

def lufs(path):
    p = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p.stderr)[-1]); P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', p.stderr)[-1])
    return I, P

def master(x, out_mp3, title='', target=-16.0, kbps='64k'):
    tmp = out_mp3 + '.tmp.wav'; write(x, tmp)
    I, _ = lufs(tmp); g = target - I
    af = f'volume={g:.2f}dB,aresample=96000,alimiter=limit=0.66:attack=1:release=60:level=false,aresample=24000'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ac', '1', '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', kbps,
                    '-metadata', f'title={title}', '-metadata', 'artist=CES · Anh – Trung – Kids', out_mp3], check=True)
    os.remove(tmp)
    return lufs(out_mp3)
