"""Dò và cắt tiếng rẹt (ồn vỡ tiếng, phổ phẳng, đỉnh chạm trần) ở đầu/cuối file, khung 10 ms.
python3 -I ret_min.py --do <thư_mục>...   → liệt kê file có rẹt
python3 -I ret_min.py --sua <thư_mục>...  → cắt rồi ghi lại"""
import sys, os, glob
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../lop-zoom/tao-tai-nguyen'))
import am_thanh as A
F = 240
def khung(x):
    n = len(x) // F; fr = x[:n * F].reshape(n, F)
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9); pk = np.abs(fr).max(1)
    hf = np.array([ (lambda s: s[len(s)//2:].sum() / s.sum())(np.abs(np.fft.rfft(r * np.hanning(F))) + 1e-9) for r in fr])
    return db, pk, hf
def rac(db, pk, hf): return (pk > .9) & (hf > .25) & (db > -20)       # khung ồn vỡ: chạm trần + phổ phẳng
def tim(x):
    """→ (a, b): giữ x[a:b]; None nếu sạch. Chỉ coi là rẹt khi cụm ồn vỡ tiếng TÁCH khỏi lời bởi ≥3 khung (30 ms) lặng."""
    if len(x) < 4800: return None
    db, pk, hf = khung(x); n = len(db); r = rac(db, pk, hf); a, b = 0, len(x); ch = False
    lang = db < -30
    tail = [i for i in range(max(0, n - 40), n) if r[i]]
    if len(tail) >= 3:
        i0 = tail[0]
        if i0 >= 4 and lang[i0 - 3:i0].sum() >= 2 or i0 <= 1:
            while i0 > 0 and lang[i0 - 1]: i0 -= 1
            b = i0 * F; ch = True
    head = [i for i in range(0, min(n, 40)) if r[i]]
    if len(head) >= 3:
        i1 = head[-1] + 1
        if i1 + 3 < n and lang[i1:i1 + 3].sum() >= 2:
            while i1 < n and lang[i1]: i1 += 1
            a = i1 * F; ch = True
    return (a, b) if ch else None
def hoan(x, a, b):
    z = x[a:b].copy(); idx = np.where(20 * np.log10(np.abs(z) + 1e-9) > -40)[0]
    if len(idx): z = z[max(0, idx[0] - int(.03 * A.SR)): idx[-1] + int(.06 * A.SR)]
    k = int(.012 * A.SR); z[:k] *= np.linspace(0, 1, k); k = int(.04 * A.SR); z[-k:] *= np.linspace(1, 0, k)
    return np.concatenate([np.zeros(int(.03 * A.SR)), z, np.zeros(int(.10 * A.SR))])
if __name__ == '__main__':
    mode = sys.argv[1]; fs = []
    for d in sys.argv[2:]: fs += [d] if os.path.isfile(d) else sorted(glob.glob(d + '/**/*.mp3', recursive=True))
    from concurrent.futures import ThreadPoolExecutor
    def f(p):
        x = A.doc_mp3(p); t = tim(x)
        if t and mode == '--sua': A.ghi_mp3(hoan(x, *t), p)
        return p, t, len(x)
    with ThreadPoolExecutor(8) as ex: R = [r for r in ex.map(f, fs) if r[1]]
    print(len(fs), 'file |', len(R), 'có rẹt' + (' (đã cắt)' if mode == '--sua' else ''))
    for p, t, n in R[:60]: print(p.replace('seedling/tai-nguyen/', ''), 'cắt %.2f-%.2f / %.2f s' % (t[0]/A.SR, t[1]/A.SR, n/A.SR))
