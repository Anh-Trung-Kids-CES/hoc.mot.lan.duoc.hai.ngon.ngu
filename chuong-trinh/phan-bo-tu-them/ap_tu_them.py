"""Áp phân bổ từ/cụm thêm lên web 2 khoá 48 buổi (13/11/2026). Chạy SAU build, chạy lại nhiều lần vẫn ra cùng kết quả.
    python3 -I chuong-trinh/phan-bo-tu-them/ap_tu_them.py [--dry]
Làm gì (không thêm dạng bài mới, không đụng big book/vè/truyện):
 - Thẻ từ mới (hoặc Gọi lại nếu ngày đó không có Thẻ từ mới): thêm thẻ của mục vào ngày gặp đầu (trần 3 thẻ/ngày, 2 ở unit nhẹ).
 - Gọi lại: thêm thẻ vào ngày gọi lại (tạo bước Gọi lại nếu chưa có). Thẻ trong nen/the/goi tự vào Hộp ôn.
 - Vận động: hành vi/cụm và so sánh có tranh -> thêm 1 câu nghe–chọn tranh.
 - Mục chưa có tranh/giọng trong kho -> ghi vào CAN-BO-SUNG.md để làm đợt Gemini sau.
Thẻ thêm mang cờ "plus": true để chạy lại thì gỡ ra thêm lại.
"""
import json, os, sys, copy, collections
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(__file__)
DRY = '--dry' in sys.argv
COURSE = {'SD': ('seedling', 'seedling/seedling-data.js'), 'LS': ('little-seed', 'little-seed/little-seed-data.js')}

def load(rel):
    raw = open(os.path.join(ROOT, rel), encoding='utf-8').read()
    head, body = raw.split('window.SD=', 1)
    tail = ''
    b = body.rstrip()
    if b.endswith(';'): b = b[:-1]; tail = ';'
    return head, json.loads(b), tail

DATA = {lv: load(rel) for lv, (_, rel) in COURSE.items()}
AUMAP = DATA['SD'][1]['aumap']
rows = [r for r in json.load(open(os.path.join(HERE, 'phanbo.json'), encoding='utf-8')) if not r['web'].startswith('Dư')]

def fixp(p, src, dst):
    if not p or p.startswith(('http', 'data:')): return p
    ab = os.path.normpath(os.path.join(ROOT, src, p))
    return os.path.relpath(ab, os.path.join(ROOT, dst)) if os.path.exists(ab) else ''

# gỡ thẻ thêm của lần chạy trước
for lv, (_, sd, _t) in DATA.items():
    for d in sd['days'].values():
        for s in d['steps']:
            if s.get('cards'): s['cards'] = [c for c in s['cards'] if not c.get('plus')]
            if s['type'] == 'game': s['qs'] = [q for q in s['qs'] if not q.get('plus')]
        d['steps'] = [s for s in d['steps'] if not (s['type'] == 'goi' and s.get('plus'))]

# kho thẻ có sẵn
lex = collections.defaultdict(list)
for lv, (folder, _), in COURSE.items():
    for n, d in DATA[lv][1]['days'].items():
        for s in d['steps']:
            for c in s.get('cards') or []:
                if isinstance(c, dict) and c.get('en') and c.get('zh'):
                    lex[c['en'].lower()].append((folder, c)); lex[c['zh']].append((folder, c))

def best(key, lv):
    cs = lex.get(key.lower()) or lex.get(key)
    if not cs: return None
    def sc(fc):
        f, c = fc
        return (bool(c.get('img')), bool(c.get('a_en')) + bool(c.get('a_zh')), f == COURSE[lv][0])
    return max(cs, key=sc)

def make(key, lv):
    hit = best(key, lv)
    if not hit: return None
    src, c = hit; dst = COURSE[lv][0]
    n = {'en': c['en'], 'zh': c['zh'], 'py': c.get('py', ''), 'plus': True}
    n['img'] = fixp(c.get('img', ''), src, dst)
    if c.get('e') and not n['img']: n['e'] = c['e']
    n['a_en'] = fixp(c.get('a_en', ''), src, dst) or fixp(AUMAP.get('en:' + c['en'], ''), 'seedling', dst)
    n['a_zh'] = fixp(c.get('a_zh', ''), src, dst) or fixp(AUMAP.get('zh:' + c['zh'], ''), 'seedling', dst)
    return n

def card_step(day):
    for t in ('the', 'goi', 'nen'):
        for s in day['steps']:
            if s['type'] == t and 'cards' in s: return s
    s = {'type': 'the', 'cards': [], 'plus': True}; day['steps'].insert(0, s); return s

def goi_step(day):
    for s in day['steps']:
        if s['type'] == 'goi': return s
    s = {'type': 'goi', 'from': 'Ôn từ thêm', 'cards': [], 'plus': True}
    i = next((k for k, x in enumerate(day['steps']) if x['type'] in ('meo', 'game')), len(day['steps']))
    day['steps'].insert(i, s); return s

pend = collections.defaultdict(list)
queue, done = [], collections.Counter(); perday = collections.Counter(); perrec = collections.Counter(); gq = 0
for r in rows:
    lv = r['lv']; sd = DATA[lv][1]; card = make(r['muc'], lv)
    if not card:
        queue.append(r); continue
    d = sd['days'][str(r['web_ngay'])]; st = card_step(d)
    if not any(c['en'] == card['en'] and not c.get('plus') for c in st['cards']) and not any(c['en'] == card['en'] for c in st['cards']):
        st['cards'].append(card); done['thẻ'] += 1; perday[(lv, r['web_ngay'])] += 1
    if r['rec'] and r['rec'] != r['web_ngay']:
        pend[(lv, r['rec'])].append(card)
    if r['loai'] in ('Hành vi/cụm', 'So sánh') and card['img'] and 'Vận động' in r['web']:
        g = next((s for s in d['steps'] if s['type'] == 'game'), None)
        pool = [c for s in d['steps'] if s.get('cards') for c in s['cards'] if c.get('img') and c['en'] != card['en']]
        if g and len(pool) >= 2:
            o = [pool[0], pool[-1]]
            opts = [{'en': x['en'], 'zh': x['zh'], 'img': x['img']} for x in o]
            opts.insert(len(card['en']) % 3, {'en': card['en'], 'zh': card['zh'], 'img': card['img']})
            g['qs'].append({'m': 'pic', 'say': {'t': card['en'], 'l': 'en', 'a': card['a_en']}, 'opts': opts,
                            'ans': opts.index(next(x for x in opts if x['en'] == card['en'])), 'plus': True}); gq += 1

# gọi lại: mỗi bài 5–10 câu (nguyên tắc 17) -> chỉ tạo bước Gọi lại mới khi gom đủ 5; ít hơn thì để Hộp ôn tự động lo
skipped = 0
for (lv, day), cs in pend.items():
    d = DATA[lv][1]['days'][str(day)]
    seen = set(); cs = [c for c in cs if not (c['en'] in seen or seen.add(c['en']))]
    gs = next((s for s in d['steps'] if s['type'] == 'goi'), None)
    if gs is None and len(cs) < 5:
        skipped += len(cs); continue
    if gs is None: gs = goi_step(d)
    for c in cs:
        if len(gs['cards']) < 10 and not any(x['en'] == c['en'] for x in gs['cards']):
            gs['cards'].append(copy.deepcopy(c)); done['gọi lại'] += 1; perrec[(lv, day)] += 1
        else: skipped += 1
print('gọi lại bỏ (để Hộp ôn tự động):', skipped)
# kiểm: trần
over = [(k, v) for k, v in {**perday}.items() if v > 3]
print('thẻ thêm', dict(done), '| câu vận động', gq, '| chưa có kho', len(queue))
print('ngày > 3 thẻ mới:', over, '| ngày gọi lại nhiều nhất:', max(perrec.values()) if perrec else 0)
miss = collections.Counter()
for lv, (_, sd, _t) in DATA.items():
    for d in sd['days'].values():
        for s in d['steps']:
            for c in s.get('cards') or []:
                if c.get('plus'):
                    if not c['img'] and not c.get('e'): miss['thiếu tranh'] += 1
                    if not c['a_en']: miss['thiếu giọng Anh'] += 1
                    if not c['a_zh']: miss['thiếu giọng Trung'] += 1
print('thẻ thêm còn thiếu:', dict(miss))
if DRY: sys.exit()
for lv, (_, rel) in COURSE.items():
    head, sd, tail = DATA[lv]
    open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(sd, ensure_ascii=False) + tail + '\n')
L = ['# Cần bổ sung cho các mục thêm (13/11/2026)', '', 'Mục chưa có thẻ nào trong kho hiện tại (chưa có tranh/giọng) – làm ở đợt Gemini sau, rồi thêm vào ngày đã phân bổ.', '',
     '| Khoá | Unit | Loại | Mục | Ngày web | Gọi lại | Buổi lớp |', '|---|---|---|---|---|---|---|']
for r in queue:
    L.append(f"| {r['lv']} | {r['u']} | {r['loai']} | {r['muc']} | {r['web_ngay']} | {r['rec']} | B{r['buoi']} |")
open(os.path.join(HERE, 'CAN-BO-SUNG.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
