"""Gắn mã QR (SVG gọn) vào hoc-lieu-data.js: HL.qr = {id: svg}. Mã trỏ tới trang nghe: BASE/nghe/?t=<id>
python3 qr_make.py <data.js> <LS|SD>"""
import sys, re, json, qrcode
BASE = 'https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/nghe/'
f, L = sys.argv[1], sys.argv[2]
txt = open(f, encoding='utf8').read()
txt = re.sub(r'\n/\*QR\*/.*$', '', txt, flags=re.S)
ids = [f'ls-s{n}' for n in range(1, 49)] if L == 'LS' else [f'sd-s{n}-{l}' for n in range(1, 49) for l in ('en', 'zh')]
ids += re.findall(r'"id": "(ve-[a-z0-9-]+)"', txt)
def svg(url):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, box_size=1); q.add_data(url); q.make(fit=True)
    m = q.get_matrix(); n = len(m); d = ''.join(f'M{x} {y}h1v1h-1z' for y, r in enumerate(m) for x, v in enumerate(r) if v)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 {n+4} {n+4}" shape-rendering="crispEdges" style="width:100%;height:100%"><rect x="-2" y="-2" width="{n+4}" height="{n+4}" fill="#fff"/><path d="{d}"/></svg>'
Q = {i: svg(BASE + '?t=' + i) for i in ids}
open(f, 'w', encoding='utf8').write(txt + '\n/*QR*/HL.qr=' + json.dumps(Q, ensure_ascii=False) + ';\n')
print(f, len(Q), 'QR')
