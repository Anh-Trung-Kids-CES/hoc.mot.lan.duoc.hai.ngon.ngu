"""Đo tiếng rẹt/click đầu-cuối file mp3. python3 do_ret.py <thư_mục>... → in số liệu + ghi /tmp/ret.json
Dấu hiệu: (R) rẹt cuối kiểu Gemini (cat_ret thấy); (C) cuối cắt cụt: mẫu cuối còn to; (H) đầu cắt cụt: mẫu đầu to; (B) tiếng bụp đầu: đoạn ngắn to rồi lặng rồi mới tới lời."""
import sys, os, glob, json
from concurrent.futures import ThreadPoolExecutor
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../lop-zoom/tao-tai-nguyen'))
import am_thanh as A
def chk(p):
    try: x = A.doc_mp3(p)
    except Exception: return p, ['E']
    if len(x) < 2400: return p, ['S']
    f = []
    y, r = A.cat_ret(x)
    if r: f.append('R')
    pk = np.abs(x).max() + 1e-9
    if np.abs(x[-48:]).max() / pk > .08: f.append('C')      # 2 ms cuối vẫn to → cụt
    if np.abs(x[:48]).max() / pk > .08: f.append('H')
    fe = A._frames(x); loud = fe > -40
    if loud.any():
        s = int(np.argmax(loud)); e = s
        while e < len(loud) and loud[e]: e += 1
        if e - s <= 5 and e + 3 < len(loud) and loud[e + 3:].any() and (np.argmax(loud[e:]) >= 3 or True):
            gap = int(np.argmax(loud[e:])) if loud[e:].any() else 0
            if gap >= 3 and gap < 40: f.append('B')
    return p, f
if __name__ == '__main__':
    files = sorted(sum([glob.glob(d + '/**/*.mp3', recursive=True) for d in sys.argv[1:]], []))
    with ThreadPoolExecutor(8) as ex: res = list(ex.map(chk, files))
    bad = {p: f for p, f in res if f}
    json.dump(bad, open('/tmp/ret.json', 'w'), indent=0)
    from collections import Counter
    c = Counter(); tot = Counter()
    for p, f in res:
        d = os.path.dirname(p); tot[d] += 1
        for k in f: c[(d, k)] += 1
    print('tổng', len(files), '| có dấu hiệu', len(bad))
    for d in sorted(tot): print(d, tot[d], {k: c[(d, k)] for k in 'RCHBES' if c[(d, k)]})
