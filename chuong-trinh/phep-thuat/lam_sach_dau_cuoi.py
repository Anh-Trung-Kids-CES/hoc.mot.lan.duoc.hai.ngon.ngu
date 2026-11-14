"""Làm sạch đầu/cuối file giọng: bỏ tiếng bụp đầu, rẹt cuối, cụt đột ngột; thêm mờ dần + đệm lặng.
python3 -I lam_sach_dau_cuoi.py <file|thư_mục>...  (chạy lại nhiều lần vẫn an toàn)"""
import sys, os, glob
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../lop-zoom/tao-tai-nguyen'))
import am_thanh as A
SR = A.SR
def lam(x):
    y, ret = A.cat_ret(x)
    fe = A._frames(y); loud = fe > -40; ch = False
    if not loud.any(): return x, False
    s = int(np.argmax(loud)); e = s
    while e < len(loud) and loud[e]: e += 1
    if e - s <= 2 and loud[e:].any():                      # tiếng bụp đầu: đoạn ngắn rồi lặng rồi mới tới lời
        g = int(np.argmax(loud[e:]))
        if 3 <= g < 40: s = e + g; ch = True
    idx = np.where(loud)[0]; t = int(idx[-1])
    a = max(0, s * A.F - int(.04 * SR)); b = min(len(y), (t + 1) * A.F + int(.08 * SR))
    z = y[a:b].copy()
    k = int(.012 * SR); z[:k] *= np.linspace(0, 1, k)      # mờ vào 12 ms
    k = int(.04 * SR); z[-k:] *= np.linspace(1, 0, k)      # mờ ra 40 ms
    z = np.concatenate([np.zeros(int(.03 * SR)), z, np.zeros(int(.10 * SR))])
    return z, (ret or ch or abs(len(z) - len(x)) > 240)
if __name__ == '__main__':
    fs = []
    for d in sys.argv[1:]: fs += [d] if os.path.isfile(d) else sorted(glob.glob(d + '/**/*.mp3', recursive=True))
    n = 0
    for p in fs:
        x = A.doc_mp3(p)
        if len(x) < 2400: continue
        z, ch = lam(x); A.ghi_mp3(z, p); n += 1
    print('đã xử lý', n, 'file')
