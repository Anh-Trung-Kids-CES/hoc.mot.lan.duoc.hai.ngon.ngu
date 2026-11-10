"""Kiểm web Seedling 99 ngày theo các nguyên tắc đo được bằng máy (claude/NguyenTac_LapLai_DangBai.md).
Chạy: python3 -I seedling/cong-cu/kiem-nguyen-tac.py  (in báo cáo; mã thoát 1 nếu còn báo đỏ)

Báo đỏ (phải sửa trước khi giao):
  17   mỗi bài 5–10 câu
  GN   màn bài không có chữ tiếng Việt (nội dung, nút trả lời, thẻ)
  NV   không có nhân vật có tên mới ngoài bộ nhân vật đã chốt
  GI   câu nào cũng có giọng thu (không dùng giọng máy)
Báo vàng (thuộc bước viết lại mạng văn bản U2–U12, cần chị biết):
  27   truyện khung Seedling 15–20 chữ Anh, 20–30 chữ Hán mỗi phần
  5/T  tranh cảnh minh hoạ đúng nội dung (không dùng tranh nền chung)
  36   unit hơn 15 từ Mới mỗi tiếng phải chia lõi / vòng ngoài
  23   mạng văn bản: truyện + bài hát + big book + vè (web hiện mới có truyện)
  AZ   cảnh tiếng Anh và tiếng Trung khớp nhau từng câu
"""
import json, re, subprocess, sys, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SD = json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);console.log(JSON.stringify(SD))',
                                str(ROOT / 'seedling-data.js')], capture_output=True, text=True, check=True).stdout)
D = SD['days']
VI = re.compile(r'[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýõãĩũ]', re.I)
KNOWN = {'Bông', 'Vũ', 'Leo', 'Anna', 'Xiaomei', 'Lan'}
CAST = {'bong', 'leo', 'anna', 'xiaomei', 'nhan', 'anh_nhan', 'lan', 'ong', 'ba', 'me_bong', 'bo_bong', 'me_leo', 'bo_leo',
        'bo_anna', 'me_xm', 'kids', 'narr', 'man'}
red, yellow = collections.defaultdict(list), collections.defaultdict(list)
days = sorted(D, key=int)


def vi(s):
    for k in KNOWN:
        s = s.replace(k, '')
    return bool(VI.search(s or ''))


def scenes(s):
    return s.get('scenes') or (s.get('scenes_en', []) + s.get('scenes_zh', []))


for n in days:
    x = D[n]
    for s in x['steps']:
        t = s['type']
        c = {'nen': 'cards', 'the': 'cards', 'goi': 'cards', 'loi': 'cards', 'cham': 'qs', 'game': 'qs', 'de': 'qs',
             'chon': 'qs', 'noi': 'turns', 'pdn': 'items', 'tl': 'items', 'lam': 'cmds'}.get(t)
        k = len(s[c]) if c else sum(len(r['qs']) for r in s['rounds']) if t == 'hoi' else \
            len(s['quiz'].get('zh', [])) + len(s['quiz'].get('en', [])) if t == 'meo' else None
        if k is not None and not 5 <= k <= 10:
            red['17'].append(f'ngày {n} {t}: {k} câu')
        blobs = []
        if t in ('nen', 'the', 'goi', 'loi'):
            blobs = [c['en'] for c in s['cards']]
        if t == 'meo':
            blobs = [b[1] for b in s['quiz'].get('zh_btn', []) + s['quiz'].get('en_btn', [])] + [c.get('name', '') for c in s['cards']]
        if t == 'de':
            blobs = [o for q in s['qs'] for o in q['opts'] if q.get('tf') or not q.get('imgs')]
        if t == 'hoi':
            blobs = [q['q'] for r in s['rounds'] for q in r['qs']]
        if t in ('pdn', 'tl'):
            blobs = [i.get('en', '') + i.get('q', '') for i in s['items']]
        if t == 'noi':
            blobs = [y['t'] for tt in s['turns'] for y in tt['say']]
        for b in blobs:
            if vi(b):
                red['GN'].append(f'ngày {n} {t}: {b[:60]}')
        if t == 'truyen':
            for sc in scenes(s):
                if sc['who'] not in CAST:
                    red['NV'].append(f'ngày {n}: nhân vật "{sc["who"]}"')
                for m in re.findall(r'\b(?:Mr|Mrs|Miss|Ms)\.? ([A-Z]\w+)', sc.get('en', '')):
                    if m not in KNOWN:
                        red['NV'].append(f'ngày {n}: tên mới "{m}" trong "{sc["en"][:50]}"')
            if 'scenes_en' in s:
                yellow['AZ'].append(f'ngày {n}: {len(s["scenes_en"])} cảnh Anh / {len(s["scenes_zh"])} cảnh Trung')
            if x.get('kind') == 'Phần':
                E = s.get('scenes') or s['scenes_en']; Z = s.get('scenes') or s['scenes_zh']
                w = len(re.findall(r"[A-Za-z']+", ' '.join(sc['en'] for sc in E)))
                ch = len(re.findall(r'[一-鿿]', ''.join(sc['zh'] for sc in Z)))
                if not (15 <= w <= 20 and 20 <= ch <= 30):
                    yellow['27'].append(f'ngày {n} U{x["unit"]} {x["part"]}: {w} chữ Anh, {ch} chữ Hán')

gen = collections.Counter(); tot = collections.Counter()
for n in days:
    for s in D[n]['steps']:
        if s['type'] == 'truyen':
            for sc in scenes(s):
                tot[D[n]['unit']] += 1
                gen[D[n]['unit']] += '/trang/' in (sc.get('img') or '/trang/')
yellow['5/T'] = [f'U{u}: {gen[u]}/{tot[u]} cảnh dùng tranh nền chung' for u in tot if gen[u]]
U = collections.defaultdict(lambda: [set(), set()])
for n in days:
    for s in D[n]['steps']:
        if s['type'] == 'the':
            for c in s['cards']:
                if not c.get('on'):
                    U[D[n]['unit']][0].add(c['en']); c.get('zh') and U[D[n]['unit']][1].add(c['zh'])
yellow['36'] = [f'U{u}: {len(a)} từ Anh, {len(b)} từ Trung' for u, (a, b) in U.items() if len(a) > 15 or len(b) > 15]
yellow['23'] = ['Web 99 ngày chưa có bài hát, big book mẫu câu, vè của mạng văn bản (mới có truyện; web dạy có chant riêng)']

print('BÁO ĐỎ'); [print(f'  [{k}] {len(v)}', *v[:12], sep='\n    ') for k, v in red.items()] or print('  (không có)')
print('BÁO VÀNG'); [print(f'  [{k}] {len(v)}', *v[:8], sep='\n    ') for k, v in yellow.items() if v]
sys.exit(1 if any(red.values()) else 0)
