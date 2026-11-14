"""Đưa 180 câu hướng dẫn tiếng Việt về cùng một tốc độ (14/11/2026, chị duyệt mức 3,5 âm tiết/giây lúc nói).
    python3 -I chuong-trinh/ra-soat-giong/ap_toc_do_vi.py
Mỗi câu: nén quãng nghỉ dài, đo tốc độ chỉ tính lúc đang nói, chỉnh về TARGET, chuẩn hoá âm lượng, lưu <tên>_v3.mp3 trong
seedling/tai-nguyen/giong/ và trỏ vi_a, vi_tx của 2 khoá sang file mới. File gốc giữ nguyên. Chạy lại vẫn ra cùng kết quả.
Cần ffmpeg và numpy."""
import json, os, re, subprocess, tempfile, numpy as np
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TARGET = 3.5
OUTDIR = os.path.join(R, 'seedling/tai-nguyen/giong')
FILES = [('seedling/seedling-data.js', 'seedling'), ('little-seed/little-seed-data.js', 'little-seed')]

def pcm(p):
    w = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(w, dtype=np.float32)

def speech_time(x):
    fr = 320; n = len(x) // fr
    r = np.sqrt((x[:n * fr].reshape(n, fr) ** 2).mean(1)); on = r > 0.12 * np.percentile(r, 95); i = 0
    while i < n:
        if not on[i]:
            j = i
            while j < n and not on[j]: j += 1
            if i > 0 and j < n and j - i <= 6: on[i:j] = True
            i = j
        else: i += 1
    return on.sum() * 0.02

def load(rel):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); head, body = raw.split('window.SD=', 1)
    return head, json.loads(body.rstrip().rstrip(';'))

data = {rel: load(rel) for rel, _ in FILES}
jobs = {}   # đường dẫn tuyệt đối file gốc -> câu
for rel, base in FILES:
    j = data[rel][1]
    for k, p in j['vi_a'].items():
        if p and not p.endswith('_v3.mp3'): jobs.setdefault(os.path.normpath(os.path.join(R, base, p)), j['vi'][k])
    for t, p in j['vi_tx'].items():
        if p and not p.endswith('_v3.mp3'): jobs.setdefault(os.path.normpath(os.path.join(R, base, p)), t)
done = {}
tmp = tempfile.mkdtemp()
for src, text in jobs.items():
    stem = os.path.splitext(os.path.basename(src))[0]; out = os.path.join(OUTDIR, stem + '_v3.mp3'); t1 = os.path.join(tmp, 't.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', 'silenceremove=stop_periods=-1:stop_duration=0.4:stop_threshold=-42dB:stop_silence=0.3', '-ar', '24000', '-ac', '1', t1], check=True)
    rate = len(re.findall(r'\w+', text, re.U)) / speech_time(pcm(t1))
    tempo = max(0.55, min(1.25, TARGET / rate))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', t1, '-af', f'atempo={tempo:.4f},loudnorm=I=-18:TP=-2', '-ar', '24000', '-ac', '1', '-b:a', '48k', out], check=True)
    done[src] = out
for rel, base in FILES:
    head, j = data[rel]
    fix = lambda p: os.path.relpath(done[os.path.normpath(os.path.join(R, base, p))], os.path.join(R, base)) if p and os.path.normpath(os.path.join(R, base, p)) in done else p
    j['vi_a'] = {k: fix(p) for k, p in j['vi_a'].items()}
    j['vi_tx'] = {t: fix(p) for t, p in j['vi_tx'].items()}
    open(os.path.join(R, rel), 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(j, ensure_ascii=False) + ';\n')
print('đã chỉnh', len(done), 'file')
