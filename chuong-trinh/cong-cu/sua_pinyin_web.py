"""Viết lại mọi trường "py" trong dữ liệu web theo pinyin chuẩn từ điển (pinyin_chuan.py) – 12/11/2026.
Chạy ở thư mục gốc repo SAU mọi bước dựng dữ liệu (build_ls.py, seedling build.py → ap_mang… → va_nguyen_tac.py, build_day.py,
build_hoc_lieu.py, khai-giang build_buoi0.js):
    python3 -W ignore chuong-trinh/cong-cu/sua_pinyin_web.py            # sửa tất cả, in số dòng đổi
    python3 -W ignore chuong-trinh/cong-cu/sua_pinyin_web.py --thu      # chỉ in các thay đổi, không ghi
Giữ nguyên: chữ hoa đầu câu như bản cũ; phần ghi chú trong ngoặc ở cuối (vd. "(= open the window)")."""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pinyin_chuan import py as PYC

FILES = ['little-seed/little-seed-data.js', 'seedling/seedling-data.js', 'seedling/day/day-data.js',
         'seedling/day/hoc-lieu/hoc-lieu-data.js', 'little-seed/day/hoc-lieu-data.js', 'khai-giang/buoi0-data.js']
HAN = re.compile(r'[一-鿿]')
THU = '--thu' in sys.argv

def moi(zh, old):
    note = ''
    m = re.search(r'\s*\(=.*\)$', old or '')
    if m: note = m.group(0)
    new = PYC(zh, noi=True)
    up = lambda m: m.group(1) + m.group(2).upper()
    if old and old[:1].isupper(): new = re.sub(r'^(\W*)(\w)', up, new)
    if old and re.search(r'[.!?]\s+["“]?[A-ZĀÁǍÀĒÉĚÈŌÓǑÒÜ]', old): new = re.sub(r'([.!?]\s+"?)(\w)', up, new)
    return new + note

PYLIKE = re.compile(r'^[\sA-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹḿ\'",.!?:;…()\-—_=ÔôƯưĐđÂâÊêƠơĂăÝýỲỳÀ-ỹ]+$')
def walk(o, doi):
    if isinstance(o, list):
        # đáp án dạng cặp [chữ Hán, pinyin]
        if len(o) == 2 and all(isinstance(x, str) for x in o) and HAN.search(o[0]) and not HAN.search(o[1]) and PYLIKE.match(o[1] or ' ') and re.search('[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]', o[1]):
            n = moi(o[0], o[1])
            if n != o[1]: doi.append((o[0], o[1], n)); o[1] = n
            return
        for x in o: walk(x, doi)
    elif isinstance(o, dict):
        for k in ('zh', 'q'):   # câu {zh, py} hoặc câu hỏi {q, py}
            z, p = o.get(k), o.get('py')
            if isinstance(z, str) and isinstance(p, str) and HAN.search(z):
                n = moi(z, p)
                if n != p: doi.append((z, p, n)); o['py'] = n
                break
        for v in o.values(): walk(v, doi)

for f in FILES:
    if not os.path.exists(f): continue
    s = open(f, encoding='utf-8').read()
    i = s.index('=', s.index('window.')) + 1
    j = s.rstrip().rstrip(';').rstrip()
    head, body = s[:i], j[i:]
    data = json.loads(body)
    doi = []; walk(data, doi)
    print(f, '· đổi', len(doi))
    if THU:
        for z, p, n in doi[:40]: print('   ', z, '|', p, '→', n)
    else:
        sep = (',', ':') if '":{' in body[:2000] or '"sess":{' in body[:50] else (', ', ': ')
        open(f, 'w', encoding='utf-8').write(head + json.dumps(data, ensure_ascii=False, separators=sep) + ';\n')
