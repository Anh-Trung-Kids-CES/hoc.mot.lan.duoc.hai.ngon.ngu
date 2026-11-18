"""Vè có chỗ trống "___, ___, …" → điền tên bạn trong truyện (chị chốt 18/11/2026).

Trước đây giọng mẫu tự điền từ ngẫu nhiên vào chỗ trống (小熊, 同学, 俊阳…), khác chữ trên màn hình.
Nay mỗi câu vè có chỗ trống được điền một tên đã có giọng đọc tên trên web: Leo, Bông, Anna, Xiaomei
(xoay vòng theo thứ tự câu trong mỗi web; cùng một câu thì tiếng Anh và tiếng Trung cùng tên).

Chạy từ gốc repo, sau mọi lần dựng lại dữ liệu:
    python3 -I seedling/cong-cu/va_ve_ten_1811.py            # sửa chữ + ghi danh sách câu cần thu
Danh sách câu cần thu: seedling/cong-cu/ve_ten_can_thu.json (key "en:…"/"zh:…" → tên file),
thu bằng chuong-trinh/giong-can-thu/thu_hang_cho.py (cùng giọng despina / zh-cn-techagent-1), rồi chạy lại script này
để gắn file đã thu vào aumap.
"""
import json, os, re, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILES = {'SD': 'seedling/seedling-data.js', 'LS': 'little-seed/little-seed-data.js'}
NAMES = ['Leo', 'Bông', 'Anna', 'Xiaomei']
GIONG = os.path.join(ROOT, 'seedling/tai-nguyen/giong')
OUT = os.path.join(ROOT, 'seedling/cong-cu/ve_ten_can_thu.json')

def norm_en(t):   # chữ hoa đánh phách (WHO is SHE) → viết thường như câu bình thường, giữ tên riêng và "I"
    out = []
    for tok in t.split():
        core = re.sub(r"[^A-Za-z']", '', tok)
        if sum(c.isupper() for c in core) >= 2 and core not in ('OK',): tok = tok.lower()
        out.append(tok)
    s = ' '.join(out); return s[:1].upper() + s[1:]
def fname(l, t): return f"{l}_{hashlib.md5((l + ':' + t).encode()).hexdigest()[:10]}.mp3"
def load(p):
    raw = open(os.path.join(ROOT, p), encoding='utf-8').read(); head, body = raw.split('window.SD=', 1)
    return head, json.loads(body.rstrip().rstrip(';'))
def save(p, head, d): open(os.path.join(ROOT, p), 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(d, ensure_ascii=False) + ';\n')

can_thu = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
for key, p in FILES.items():
    head, d = load(p); am = d['aumap']; pick = {}; n_sua = 0
    pre = 'tai-nguyen/giong/' if key == 'SD' else '../seedling/tai-nguyen/giong/'
    def name_for(raw):
        if raw not in pick: pick[raw] = NAMES[len(pick) % len(NAMES)]
        return pick[raw]
    def w(o):
        global n_sua
        if isinstance(o, dict):
            raw0 = o.get('_ve_raw') or o.get('raw')
            if isinstance(raw0, str) and '___' in raw0 and isinstance(o.get('zh'), str) and isinstance(o.get('en'), str):
                o.setdefault('_ve_raw', raw0)
                nm = name_for(raw0)
                for k in ('raw', 'en', 'zh', 'py'):
                    if isinstance(o.get(k), str): o[k] = o[k].replace('___', nm)
                if isinstance(o.get('w'), list): o['w'] = [[t[0].replace('___', nm)] + t[1:] for t in o['w']]
                en_n = norm_en(o['en'])
                # thu câu viết thường (o['en']); khoá raw (chữ hoa = phách mạnh) dùng chung file đó
                fe, fz = fname('en', en_n), fname('zh', o['zh'])
                can_thu['en:' + en_n] = fe; can_thu['zh:' + o['zh']] = fz
                for k2, f in (('en:' + o['raw'], fe), ('en:' + o['en'], fe), ('en:' + en_n, fe), ('zh:' + o['zh'], fz)):
                    if os.path.exists(os.path.join(GIONG, f)): am[k2] = pre + f
                n_sua += 1
            for v in o.values(): w(v)
        elif isinstance(o, list):
            for v in o: w(v)
    for n, day in d['days'].items():
        for st in day.get('steps', []):
            if st.get('type') in ('ve', 'vek'): w(st)
    save(p, head, d)
    print(key, 'câu vè đã điền tên:', n_sua, '·', {r: nm for r, nm in pick.items()})
# bỏ câu trùng (en vs raw cùng chữ khi viết thường giống nhau vẫn giữ: hai khoá khác nhau trỏ cùng giọng sau khi thu)
json.dump(can_thu, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
thieu = [k for k, f in can_thu.items() if not os.path.exists(os.path.join(GIONG, f))]
print('câu cần thu:', len(can_thu), '· chưa có file:', len(thieu))
