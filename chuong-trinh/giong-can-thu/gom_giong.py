"""Gom MỌI câu chưa có giọng thu của cả chương trình vào một hàng chờ (chị chốt 12/11/2026):
không thu lẻ từng unit; khi cả 12 unit đã có kế hoạch thì gửi đi thu một lần theo batch.

Nguồn (mỗi web tự ghi khi build):
  - */cong-cu/giong_thieu*.json, */cong-cu/giong-thieu.json : câu tiếng Anh, tiếng Trung chưa có file giọng ([lang, text])
  - */cong-cu/giong_vi_*.json                              : lời cô tiếng Việt mới chưa có giọng ([lang, text])
Chạy từ thư mục gốc repo:  python3 chuong-trinh/giong-can-thu/gom_giong.py
Ra: chuong-trinh/giong-can-thu/hang-cho.json (mỗi câu một dòng, ghi nguồn) và tom-tat.md (đếm theo nguồn, theo tiếng).
Gửi thu: tách hang-cho.json theo tiếng rồi chạy seedling/cong-cu/gemini/gen_audio.py (tiếng Việt cần chọn giọng cô trước).
"""
import glob, json, os
from collections import Counter, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
PATS = ['*/cong-cu/giong_thieu*.json', '*/cong-cu/giong-thieu.json', '*/cong-cu/giong_vi_*.json']
q = OrderedDict()
for pat in PATS:
    for f in sorted(glob.glob(pat)):
        try:
            items = json.load(open(f))
        except Exception:
            continue
        for it in items:
            if not isinstance(it, (list, tuple)) or len(it) < 2: continue
            l, t = it[0], str(it[1]).strip()
            if not t: continue
            k = (l, t)
            q.setdefault(k, {'l': l, 't': t, 'nguon': []})
            src = f.split('/cong-cu/')[0] + '/' + os.path.basename(f)
            if src not in q[k]['nguon']: q[k]['nguon'].append(src)
rows = list(q.values())
json.dump(rows, open(os.path.join(HERE, 'hang-cho.json'), 'w'), ensure_ascii=False, indent=0)
by_l = Counter(r['l'] for r in rows)
by_src = Counter((s, r['l']) for r in rows for s in r['nguon'])
md = ['# Hàng chờ thu giọng – cả chương trình', '',
      'Quy tắc (chị chốt 12/11/2026): ghi lại mọi câu cần thu giọng, **chưa gửi thu**; khi đủ kế hoạch 12 unit thì gửi thu một lần theo batch.', '',
      f'Tổng: **{len(rows)} câu** · ' + ' · '.join(f'{ {"en": "tiếng Anh", "zh": "tiếng Trung", "vi": "lời cô tiếng Việt"}.get(l, l)} {n}' for l, n in sorted(by_l.items())), '',
      '| Nguồn | Tiếng | Số câu |', '|---|---|---|']
md += [f'| {s} | {l} | {n} |' for (s, l), n in sorted(by_src.items())]
open(os.path.join(HERE, 'tom-tat.md'), 'w').write('\n'.join(md) + '\n')
print(len(rows), dict(by_l))
