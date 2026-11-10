"""Vá seedling-data.js cho khớp bộ nguyên tắc (claude/NguyenTac_LapLai_DangBai.md) – 10/11/2026.

Nguồn dựng gốc (days.json, demo_sd.json, ls_assets.json của build.py) không nằm trong repo, nên các chỗ sửa
dữ liệu được làm bằng script này, chạy SAU build.py. Chạy lại nhiều lần vẫn ra cùng kết quả.
    python3 -I seedling/cong-cu/va_nguyen_tac.py seedling/seedling-data.js

Sửa gì (mỗi mục ghi nguyên tắc liên quan):
1. Lời dặn tiếng Việt lọt vào câu Leo nói ở Phiên dịch nhí (ngày 17, 25, 59, 71, 95): giọng cũ đọc cả lời dặn
   bằng giọng Anh. Thay bằng câu sạch và giọng sạch đã có. (Giữ nguyên: màn bài không có chữ tiếng Việt.)
2. Ngày 96, Trả lời câu hỏi: 3 câu dính mã tranh tiếng Việt ("C thuyền trong rừng] 1. …"), giọng đọc cả mã.
   Thay bằng 3 câu hỏi về cùng truyện đã có giọng sạch (lấy từ ngày 59).
3. Ngày 32, Nói theo: câu Trung dính pinyin và chú thích tiếng Anh. Tách thành 水来了。 + 谢谢！ (giọng có sẵn).
4. Thẻ có chữ tiếng Việt thay cho tiếng Anh: ngày 5 "vóc dáng" (个子) → cụm của truyện "The man is very tall." /
   "表演的人个子很高。"; ngày 88 "lượng từ…" (个) → "Ten people." / "十个人。".
5. Mẹo âm: bỏ chữ tiếng Việt trên nút và dưới kí hiệu (đường bằng, cầu trượt, kiến bò, có, không); giữ kí hiệu,
   mũi tên, hình và ✔ / ✖. Dạng đề đúng/sai: nút "✓ Đúng / ✗ Sai" thành ✓ / ✗.
6. Không thêm nhân vật có tên mới (09/11): "Miss Hoa" (ngày 23, 25, Reader U3) → Mrs Lan chụp ảnh lớp.
   Câu của cô Hoa không có tên riêng nên giữ nguyên giọng.
7. Bố Anna "Mr Nam" (ngày 22, 25, Reader U3): thay câu có tên bằng câu cùng nghĩa đã có giọng; lời Anna ở ngày 25
   và Reader U3 tách thành từng câu, mỗi câu một giọng có sẵn.
"""
import json, re, sys

PATH = sys.argv[1] if len(sys.argv) > 1 else 'seedling/seedling-data.js'
raw = open(PATH, encoding='utf-8').read()
head, body = raw.split('window.SD=', 1)
body = body.rstrip().rstrip(';')
SD = json.loads(body)
D, AM = SD['days'], SD['aumap']
log = []


def au(l, t):
    a = AM.get(f'{l}:{t}')
    if not a:
        raise SystemExit(f'Thiếu giọng cho {l}:{t}')
    return a


def steps(n, t):
    return [s for s in D[str(n)]['steps'] if s['type'] == t]


# 1. Phiên dịch nhí: câu Leo dính lời dặn
JUNK = re.compile(r'^(?:Phiên dịch nhí[^:\]]*[:\]]\s*)?(?:Leo nói tiếng Anh, con nói lại cho Xiaomei:\s*)?(?:Leo:\s*)?')
for n in (17, 25, 59, 71, 95):
    for s in steps(n, 'pdn'):
        for it in s['items']:
            if re.search(r'Phiên dịch|nói lại cho', it['en']):
                clean = JUNK.sub('', it['en']).strip()
                it['en'], it['a_en'] = clean, au('en', clean)
                log.append(f'ngày {n} Phiên dịch nhí: "{clean}"')

# 2. Ngày 96: câu hỏi dính mã tranh
NEW96 = [
    ('Where is the boat?', ['Two white wings.', 'In the forest.', 'A long tail.'], 1),
    ('Has the mouse got a long tail?', ['Yes, it has.', 'Yes, it can.', 'A green frog.'], 0),
    ('Who hops?', ['The frog and Leo.', 'Two white wings.', 'Yes, it has.'], 0),
]
for s in steps(96, 'hoi'):
    r = [r for r in s['rounds'] if r['l'] == 'en'][0]
    keep = [q for q in r['qs'] if not re.search(r'\]\s*\d\.', q['q'])]
    if len(keep) < len(r['qs']):
        for q, opts, ans in NEW96:
            for o in opts:
                au('en', o)
            keep.append({'q': q, 'opts': opts, 'ans': ans, 'a': au('en', q)})
        r['qs'] = keep
        log.append('ngày 96 Trả lời câu hỏi: thay 3 câu dính mã tranh')

# 3. Ngày 32: câu Trung dính pinyin, chú thích
for s in steps(32, 'noi'):
    for t in s['turns']:
        sy = t['say']
        if len(sy) == 1 and sy[0]['l'] == 'zh' and '(' in sy[0]['t']:
            w = sy[0]['w']
            t['say'] = [{'t': '水来了。', 'l': 'zh', 'w': w, 'a': au('zh', '水来了。')},
                        {'t': '谢谢！', 'l': 'zh', 'w': w, 'a': au('zh', '谢谢')}]
            log.append('ngày 32 Nói theo: tách 水来了。/ 谢谢！')

# 4. Thẻ có chữ tiếng Việt
FIX_CARD = {
    'vóc dáng': ('The man is very tall.', '表演的人个子很高。', 'Biǎoyǎn de rén gèzi hěn gāo.', 'tai-nguyen/tranh/tall.webp'),
    'lượng từ giữa số và vật khi đếm': ('Ten people.', '十个人。', 'Shí ge rén.', 'tai-nguyen/tranh/people.webp'),
}
for n, x in D.items():
    for s in x['steps']:
        for c in s.get('cards', []):
            if c.get('en') in FIX_CARD:
                old = c['en']; e, z, py, img = FIX_CARD[old]
                c.update({'en': e, 'zh': z, 'py': py, 'img': img, 'a_en': au('en', e), 'a_zh': au('zh', z)})
                c.pop('e', None)
                log.append(f'ngày {n} thẻ "{old}" → {e} / {z}')
        for q in s.get('qs', []):  # bài vận động, chọn tranh dùng lại thẻ
            if not isinstance(q.get('opts'), list):
                continue
            for o in q['opts']:
                if isinstance(o, dict) and o.get('en') in FIX_CARD:
                    e, z, py, img = FIX_CARD[o['en']]; o.update({'en': e, 'img': img}); o.pop('e', None)
                    if 'zh' in o:
                        o['zh'] = z
            sy = q.get('say')
            if isinstance(sy, dict):
                if sy.get('t') in FIX_CARD:
                    e, z, py, img = FIX_CARD[sy['t']]; sy.update({'t': e, 'a': au('en', e)})
                elif sy.get('l') == 'zh' and sy.get('t') in ('个子', '个'):
                    z = {'个子': '表演的人个子很高。', '个': '十个人。'}[sy['t']]; sy.update({'t': z, 'a': au('zh', z)})
            # hai lựa chọn trùng tranh thì bỏ lựa chọn gây nhiễu trùng, thay bằng thẻ khác của ngày
            if all(isinstance(o, dict) for o in q['opts']):
                imgs = [o.get('img') for o in q['opts']]
                for i, o in enumerate(q['opts']):
                    if i != q.get('ans') and o.get('img') and imgs.count(o['img']) > 1:
                        pool = [c for st in x['steps'] if st['type'] in ('the', 'nen') for c in st['cards']
                                if c.get('img') and c['img'] not in imgs]
                        if pool:
                            c = pool[0]; q['opts'][i] = {k: c.get(k, '') for k in o}; q['opts'][i]['en'] = c['en']; q['opts'][i]['img'] = c['img']
                            if 'zh' in o: q['opts'][i]['zh'] = c.get('zh', '')
                            if 'e' in o: q['opts'][i]['e'] = c.get('e', '')
                            imgs = [oo.get('img') for oo in q['opts']]
        for t in s.get('turns', []):  # Nói theo
            for sy in t.get('say', []):
                if sy.get('t') in FIX_CARD:
                    e, z, py, img = FIX_CARD[sy['t']]; sy.update({'t': e, 'a': au('en', e)}); t['img'] = img; t.pop('e', None)

# 5. Mẹo âm: bỏ chữ tiếng Việt
VI_WORDS = re.compile(r'\s*(đường bằng|cầu trượt|lên dốc|võng|kiến bò|không|có)\s*$')
for n, x in D.items():
    for s in x['steps']:
        if s['type'] != 'meo':
            continue
        for c in s['cards']:
            if c.get('name'):
                c['name'] = ''
        q = s['quiz']
        for key in ('zh_btn', 'en_btn'):
            for b in q.get(key, []):
                t = VI_WORDS.sub('', b[1]).strip()
                if b[0] == 'yes' and '✔' not in t:
                    t = (t + ' ✔').strip()
                if b[0] == 'no':
                    t = '✖'
                b[1] = t
        if 'zh_btn' not in q and q.get('zh'):   # nút mặc định trong app cũng đã bỏ chữ, ghi rõ ở đây cho chắc
            q['zh_btn'] = [['→', 'ˉ →'], ['↘', 'ˋ ↘']]
        if 'en_btn' not in q and q.get('en'):
            sym = next((c['sym'] for c in s['cards'] if c['l'] == 'en'), '')
            q['en_btn'] = [['yes', (sym + ' ✔').strip()], ['no', '✖']]

# 5b. Dạng đề đúng/sai: nút "✓ Đúng / ✗ Sai" → chỉ ✓ / ✗ (giống kí hiệu tick/cross của đề Starters, YCT)
for n, x in D.items():
    for s in x['steps']:
        if s['type'] == 'de':
            for q in s['qs']:
                if q.get('tf'):
                    q['opts'] = ['✓', '✗']

# 6. Miss Hoa → Mrs Lan
nh = 0
for n, x in D.items():
    for s in x['steps']:
        for k in ('scenes', 'scenes_en', 'scenes_zh'):
            for sc in s.get(k, []):
                if sc.get('who') == 'hoa':
                    sc['who'] = 'lan'; nh += 1
        for q in s.get('qs', []):
            if isinstance(q.get('say'), dict) and q['say'].get('w') == 'hoa':
                q['say']['w'] = 'lan'
            if q.get('ans') == 'hoa':
                q['ans'] = 'lan'
        if s.get('opts') and 'hoa' in s['opts']:
            s['opts'] = list(dict.fromkeys(['lan' if o == 'hoa' else o for o in s['opts']]))
        for t in s.get('turns', []):
            for sy in t['say']:
                if sy.get('w') == 'hoa':
                    sy['w'] = 'lan'
for u, r in SD['reader'].items():
    for p in r['pages']:
        if p.get('who') == 'hoa':
            p['who'] = 'lan'; nh += 1
if 'hoa' in SD['who']:
    del SD['who']['hoa']
if nh:
    log.append(f'Miss Hoa → Mrs Lan: {nh} chỗ')

# 7. Không thêm nhân vật có tên mới: bố Anna "Mr Nam" (ngày 22, 25, Reader U3). Thay câu có tên bằng các câu
#    cùng nghĩa đã có giọng (This is my family. This is my father. / 这是我的家人。这是我爸爸。…).
NAM_EN = 'This is my father, Mr Nam, and my mum.'
NAM_ZH = '这是我爸爸，他叫Nam。'
REP_EN = ['This is my family. This is my father.', 'She is my mother. She is my mum.']
REP_ZH = '这是我的家人。这是我爸爸。'
ANNA = [('narr', 'Anna: Look at my photo!', '看我的照片！'),
        ('anna', 'This is my grandfather and my grandmother.', '这是我爷爷和我奶奶。'),
        ('anna', 'This is my family. This is my father.', '这是我的家人。这是我爸爸。'),
        ('anna', 'She is my mother. She is my mum.', '她是我妈妈。'),
        ('anna', 'My cousin is a little girl.', '我表妹是小女孩。'),
        ('anna', 'I love my family!', '我爱我的家人！')]
PYMAP = {}
for n, x in D.items():
    for s in x['steps']:
        for sc in s.get('scenes', []):
            if sc.get('zh') and sc.get('py'):
                PYMAP[sc['zh']] = sc['py']
        for sc in s.get('scenes_zh', []):
            if sc.get('py'):
                PYMAP[sc['zh']] = sc['py']
PYMAP.setdefault('她是我妈妈。', 'Tā shì wǒ māma.')
PYMAP.setdefault('这是我的家人。这是我爸爸。', 'Zhè shì wǒ de jiārén. Zhè shì wǒ bàba.')
for n, x in D.items():
    for s in x['steps']:
        if s['type'] != 'truyen':
            continue
        if 'scenes_en' in s and any(sc['en'] == NAM_EN for sc in s['scenes_en']):
            new = []
            for sc in s['scenes_en']:
                if sc['en'] == NAM_EN:
                    new += [dict(sc, en=e, a_en=au('en', e)) for e in REP_EN]
                else:
                    new.append(sc)
            s['scenes_en'] = new
            for sc in s['scenes_zh']:
                if sc['zh'] == NAM_ZH:
                    sc.update({'zh': REP_ZH, 'py': PYMAP[REP_ZH], 'a_zh': au('zh', REP_ZH)})
            log.append(f'ngày {n}: bỏ tên "Mr Nam"')
        if 'scenes' in s and any('Mr Nam' in sc.get('en', '') for sc in s['scenes']):
            new = []
            for sc in s['scenes']:
                if 'Mr Nam' in sc.get('en', ''):
                    new += [dict(sc, who=w, en=e, zh=z, py=PYMAP.get(z, ''), a_en=au('en', e), a_zh=au('zh', z)) for w, e, z in ANNA]
                else:
                    new.append(sc)
            s['scenes'] = new
            log.append(f'ngày {n}: tách lời Anna, bỏ tên "Mr Nam"')
for u, r in SD['reader'].items():
    if any('Mr Nam' in p.get('en', '') for p in r['pages']):
        new = []
        for p in r['pages']:
            if 'Mr Nam' in p.get('en', ''):
                new += [dict(p, who=w, en=e, zh=z, py=PYMAP.get(z, ''), a_en=au('en', e), a_zh=au('zh', z)) for w, e, z in ANNA]
            else:
                new.append(p)
        r['pages'] = new
        log.append(f'Reader U{u}: tách lời Anna, bỏ tên "Mr Nam"')

# kiểm tra còn sót
txt = json.dumps(SD['days'], ensure_ascii=False)
assert '"hoa"' not in txt, 'còn nhân vật hoa'
assert 'Phiên dịch nhí [' not in txt and 'nói lại cho Xiaomei:' not in txt
assert 'vóc dáng' not in txt and 'lượng từ giữa' not in txt

out = head + 'window.SD=' + json.dumps(SD, ensure_ascii=False) + ';\n'
open(PATH, 'w', encoding='utf-8').write(out)
print('\n'.join(log) or 'Không còn gì để vá (đã vá trước đó).')
