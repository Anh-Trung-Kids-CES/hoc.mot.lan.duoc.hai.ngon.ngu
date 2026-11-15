"""Gắn giọng đã thu (giong_hang_cho.json) vào dữ liệu hai web (15/11/2026). Chạy lại vẫn ra cùng kết quả.
Seedling: SD.aumap['en:chữ'] = 'tai-nguyen/giong/x.mp3'; vi → SD.vi_tx. Little Seed: cùng khoá, đường dẫn thêm '../seedling/'."""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
M = json.load(open(os.path.join(os.path.dirname(__file__), 'giong_hang_cho.json'), encoding='utf-8'))
S = json.loads(open(os.path.join(R, 'seedling/seedling-data.js'), encoding='utf-8').read().split('window.SD=', 1)[1].rstrip().rstrip(';'))
for rel, pre in (('seedling/seedling-data.js', ''), ('little-seed/little-seed-data.js', '../seedling/')):
    raw = open(os.path.join(R, rel), encoding='utf-8').read(); head, body = raw.split('window.SD=', 1); j = json.loads(body.rstrip().rstrip(';'))
    am = j.setdefault('aumap', {}); vt = j.setdefault('vi_tx', {}); n = 0
    if pre:   # Little Seed dùng chung kho giọng Seedling: nhận cả aumap/vi_tx đã có bên đó
        for k, p in S['aumap'].items(): am.setdefault(k, pre + p)
        for k, p in S['vi_tx'].items(): vt.setdefault(k, p if p.startswith('../') else pre + p)
    for k, p in M.items():
        l, t = k.split(':', 1)
        if not os.path.exists(os.path.join(R, 'seedling', p)): continue
        d = vt if l == 'vi' else am; key = t if l == 'vi' else k
        if d.get(key) != pre + p: d[key] = pre + p; n += 1
    open(os.path.join(R, rel), 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(j, ensure_ascii=False) + ';\n')
    print(rel, 'thêm', n)
