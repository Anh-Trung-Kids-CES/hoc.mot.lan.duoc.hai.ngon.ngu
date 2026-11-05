"""Làm sạch và chỉnh âm lượng giọng đọc (dùng chung cho web học 21 ngày và Lớp Zoom).

1. Tiếng "rẹt" cuối câu: mô hình Gemini TTS đôi khi trả thêm một đoạn ồn ngắn, to, bị vỡ tiếng
   (khoảng 0,15 giây) sau khi đã đọc xong và lặng một chút. Hàm cat_ret() tìm đoạn đó và cắt bỏ.
   Chỉ cắt khi đoạn cuối vừa là tiếng ồn (phổ phẳng) vừa bị vỡ tiếng, để không cắt nhầm chữ cuối của câu.
2. Âm lượng: đưa mức giọng (trung vị các khung có tiếng) về MUC_DICH dB, chặn đỉnh ở -2,5 dBFS.

Sửa các tệp đã có:  python3 lop-zoom/tao-tai-nguyen/am_thanh.py xem-truoc/tai-nguyen/little-seed/audio xem-truoc/tai-nguyen/canopy/audio
(chỉ ghi lại tệp có tiếng rẹt hoặc lệch âm lượng quá LECH dB; in danh sách đã sửa)."""
import subprocess, sys, glob, os
import numpy as np

SR = 24000
F = 720            # khung 30 ms
MUC_DICH = -16.5   # dB, mức giọng chung
LECH = 3.0         # chỉ chỉnh khi lệch hơn chừng này


def _frames(x):
    n = len(x) // F
    if n == 0: return np.array([-120.0])
    fr = x[:n * F].reshape(-1, F)
    return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)


def muc_giong(x):
    fe = _frames(x); sp = fe[fe > -40]
    return float(np.median(sp)) if len(sp) else None


def cat_ret(x):
    """Trả về (tín hiệu đã cắt, True) nếu cuối tệp có tiếng rẹt; không thì (x, False)."""
    fe = _frames(x); n = len(fe); loud = fe > -40
    if not loud.any(): return x, False
    end = n - 1
    while end >= 0 and not loud[end]: end -= 1
    st = end
    while st >= 0 and loud[st]: st -= 1
    g = st
    while g >= 0 and not loud[g]: g -= 1
    if not (end - st <= 10 and st - g >= 3 and g >= 5): return x, False
    tail = x[(st + 1) * F:(end + 1) * F]
    seg = tail[np.abs(tail) > 0.01]
    if len(seg) < 256: return x, False
    w = seg[:4096] * np.hanning(min(4096, len(seg)))
    sp = np.abs(np.fft.rfft(w)) + 1e-9
    phang = np.exp(np.mean(np.log(sp))) / np.mean(sp)
    vo = (np.abs(tail) > 0.98).sum()
    if phang < 0.6 or vo == 0: return x, False
    keep = (g + 1) * F + int(0.12 * SR)
    y = x[:keep].copy()
    k = int(0.03 * SR); y[-k:] *= np.linspace(1, 0, k)       # mờ dần 30 ms cuối
    return np.concatenate([y, np.zeros(int(0.12 * SR))]), True


def chinh_am_luong(x, force=False):
    m = muc_giong(x)
    if m is None: return x, 0.0
    g = MUC_DICH - m
    if not force and abs(g) <= LECH: return x, 0.0
    y = x * (10 ** (g / 20))
    lim = 10 ** (-2.5 / 20)   # chừa khoảng cho mp3, tránh vỡ tiếng
    pk = np.abs(y).max()
    if pk > lim:   # chặn đỉnh mềm: nén phần vượt ngưỡng thay vì cắt
        t = 0.6 * lim
        a = np.abs(y); over = a > t
        y[over] = np.sign(y[over]) * (t + (lim - t) * np.tanh((a[over] - t) / (lim - t)))
    return y, g


def lam_sach(x, force_level=False):
    x, ret = cat_ret(x)
    x, g = chinh_am_luong(x, force_level)
    return x, ret, g


def doc_mp3(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768


def ghi_mp3(x, dst):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                    '-ar', str(SR), '-ac', '1', '-b:a', '64k', dst], input=pcm, check=True)


if __name__ == '__main__':
    sua = 0
    for d in sys.argv[1:]:
        for p in sorted(glob.glob(os.path.join(d, '*.mp3'))):
            x = doc_mp3(p)
            y, ret, g = lam_sach(x)
            if ret or g:
                ghi_mp3(y, p); sua += 1
                print(f"{os.path.basename(p)}\t{'cắt rẹt ' if ret else ''}{'%+.1f dB' % g if g else ''}")
    print('Đã sửa', sua, 'tệp')
