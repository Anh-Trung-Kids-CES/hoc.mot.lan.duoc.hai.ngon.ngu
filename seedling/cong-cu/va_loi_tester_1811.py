"""Vá lỗi tester báo 18/11/2026 (và lỗi cùng loại) trên dữ liệu web Seedling + Little Seed.

Chạy (từ gốc repo), sau mọi lần dựng lại dữ liệu (build.py, build_ls.py, va_nguyen_tac.py…):
    python3 -I seedling/cong-cu/va_loi_tester_1811.py
Chạy lại nhiều lần không sao (chỉ đổi chỗ còn sai).

Sửa:
 1. Thẻ "wave · Goodbye, Mrs Lan!" / 老师再见 → "Goodbye, Mrs Lan!" / Lan老师再见 (mặt Anh, mặt Trung cùng một câu, có tên cô).
    Ngày 1: lựa chọn "wave" đang gắn chữ 明天见 → 挥挥手.
 2. Đáp án nhiễu trùng nghĩa / trùng tranh với đáp án đúng (vd. nghe 老师 mà hai tranh đều là cô giáo):
    thay bằng lựa chọn khác trong cùng ngày / cùng unit, không chồng nghĩa.
 3. Big book: lựa chọn chỉ có chữ, không có tranh (奶奶, 叔叔, 小猫/Kitten) → thêm tranh, giọng đúng.
 4. Giọng sai tiếng: câu tiếng Anh đang phát file đọc tiếng Trung (Who is he?, What's your name?);
    bỏ các mục aumap "zh:<chữ Latin>" là bản tiếng Trung đọc từ tiếng Anh (Kitten, five, four, six…).
 5. Little Seed: lựa chọn he/she đang ghi chữ Trung 这 → 他 / 她.
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILES = {'SD': os.path.join(ROOT, 'seedling/seedling-data.js'), 'LS': os.path.join(ROOT, 'little-seed/little-seed-data.js')}
LOG = []

def load(p):
    raw = open(p, encoding='utf-8').read(); head, body = raw.split('window.SD=', 1)
    return head, json.loads(body.rstrip().rstrip(';'))

def save(p, head, d):
    open(p, 'w', encoding='utf-8').write(head + 'window.SD=' + json.dumps(d, ensure_ascii=False) + ';\n')

def walk(o, fn, path=()):
    if isinstance(o, dict):
        fn(o, path)
        for k, v in list(o.items()): walk(v, fn, path + (k,))
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, fn, path + (i,))

# ---------- nhóm nghĩa: hai lựa chọn cùng nhóm thì tranh dễ trùng ----------
P = re.compile(r'[\s·…!！。.?？,，、:：“”"\'/]+')
def norm(t): return P.sub('', str(t or '')).lower()
GROUPS = [
    {'老师', 'lan老师', 'teacher', 'mrslan', '鹿老师'},
    {'小朋友', '你们好', '大家好', '同学们', 'kids', 'class', 'classkids', 'everyone', 'hellokids', '大家', 'all', 'friends', '好朋友', '朋友', 'friend'},
]
FAMILY = {'family', '家人', '一家人', 'myfamily'}
FAM_ALL = FAMILY | {'mommy', 'mummy', 'mother', '妈妈', 'daddy', 'father', '爸爸', 'brother', 'olderbrother', 'littlebrother', '哥哥', '弟弟',
                    'sister', 'oldersister', 'littlesister', 'youngersister', '姐姐', '妹妹', 'grandpa', 'grandma', '爷爷', '奶奶', 'baby', '宝宝'}
def toks(o): return {norm(o.get('en')), norm(o.get('zh'))} - {''}
def overlap(a, b):
    A, B = toks(a), toks(b)
    for x in A:
        for y in B:
            if x == y: return True
            if len(x) >= 2 and len(y) >= 2 and (x in y or y in x) and re.search(r'[一-鿿]', x + y): return True
            if re.fullmatch(r'[a-z]+', x) and re.fullmatch(r'[a-z]+', y) and min(len(x), len(y)) >= 4 and (x in y or y in x): return True
    if any(A & g and B & g for g in GROUPS): return True
    if (A & FAM_ALL and B & FAMILY) or (B & FAM_ALL and A & FAMILY): return True
    return bool(a.get('img')) and a.get('img') == b.get('img')

def fix(key, d, pre):
    am = d['aumap']; NV = pre + 'tai-nguyen/nhan-vat/'
    def A(l, t): return am.get(l + ':' + t, '')

    # 1. thẻ wave · Goodbye, Mrs Lan!
    OLD_EN, NEW_EN, NEW_ZH, NEW_PY = 'wave · Goodbye, Mrs Lan!', 'Goodbye, Mrs Lan!', 'Lan老师再见', 'Lan lǎoshī zàijiàn'
    def f1(o, path):
        if o.get('en') == OLD_EN:
            o['en'] = NEW_EN
            if o.get('zh') in ('老师再见', '老师再见！'):
                o['zh'] = NEW_ZH
                if 'py' in o: o['py'] = NEW_PY
            if 'a_en' in o: o['a_en'] = A('en', NEW_EN)
            if 'a_zh' in o: o['a_zh'] = A('zh', NEW_ZH + '！')
            LOG.append((key, 'thẻ wave→Goodbye, Mrs Lan!', path[:2]))
        s = o.get('say')
        if isinstance(s, dict) and s.get('t') == OLD_EN: s['t'] = NEW_EN; s['a'] = A('en', NEW_EN)
        if o.get('en') == 'wave' and o.get('zh') == '明天见':
            o['zh'] = '挥挥手'; LOG.append((key, 'wave/明天见 → 挥挥手', path[:2]))
        if isinstance(o.get('k'), str) and OLD_EN in o['k']: o['k'] = o['k'].replace(OLD_EN, NEW_EN)
    walk(d['days'], f1)
    for k in [k for k in am if k == 'en:' + OLD_EN]: am.pop(k)
    if A('zh', NEW_ZH + '！'): am['zh:' + NEW_ZH] = A('zh', NEW_ZH + '！')

    # 5. he / she ghi 这
    def f5(o, path):
        if o.get('zh') == '这' and o.get('en') in ('he', 'she'):
            o['zh'] = {'he': '他', 'she': '她'}[o['en']]; LOG.append((key, f'{o["en"]}: 这 → {o["zh"]}', path[:2]))
    walk(d['days'], f5)

    # 2. đáp án nhiễu chồng nghĩa (bước chọn tranh: game, chọn…)
    seen = []    # lựa chọn có tranh đã gặp tới ngày đang xét (không lấy từ chưa học)
    def has_pic(o): return isinstance(o.get('opts'), list) and isinstance(o.get('ans'), int) and o['opts'] and all(isinstance(x, dict) and x.get('img') for x in o['opts'])
    for n, day in sorted(d['days'].items(), key=lambda x: int(x[0])):
        today = []
        def g0(o, path):
            if has_pic(o):
                for x in o['opts']:
                    if not any(norm(y.get('en')) == norm(x.get('en')) and y.get('img') == x.get('img') for y in today + seen): today.append(dict(x))
        walk(day, g0)
        def g(o, path):
            if not has_pic(o): return
            op, an = o['opts'], o['ans']
            for j in range(len(op)):
                if j == an or not overlap(op[an], op[j]): continue
                cand = [c for c in today + seen[::-1] if not any(overlap(c, x) for x in op)]
                if not cand: LOG.append((key, f'ngày {n}: KHÔNG tìm được lựa chọn thay cho {op[j].get("en")}', '')); continue
                LOG.append((key, f'ngày {n}: nghe "{op[an].get("en")}/{op[an].get("zh")}" – bỏ "{op[j].get("en")}/{op[j].get("zh")}" → "{cand[0].get("en")}/{cand[0].get("zh")}"', ''))
                op[j] = dict(cand[0])
        walk(day, g)
        seen.extend(today)

    # 3. big book: lựa chọn có tranh lẫn lựa chọn không tranh
    ADD = {('奶奶',): {'k': 'ba', 'img': NV + 'fam_bong_ba_a.webp', 'en': 'grandma', 'zh': '奶奶'},
           ('叔叔',): {'k': 'chu', 'img': NV + 'bb_sd3_chu_anh.webp', 'en': 'uncle', 'zh': '叔叔'},
           ('小猫', 'Kitten'): {'k': 'kitten', 'img': NV + 'pets_meo_ngoi_a.webp', 'en': 'Kitten', 'zh': '小猫'}}
    def f3(o, path):
        op = o.get('opts')
        if not (isinstance(op, list) and op and all(isinstance(x, dict) for x in op)): return
        im = [bool(x.get('img')) for x in op]
        if not (any(im) and not all(im)): return
        for i, x in enumerate(op):
            if x.get('img'): continue
            for keys, v in ADD.items():
                if x.get('zh') in keys or x.get('en') in keys:
                    nx = dict(v); nx['a_en'] = A('en', v['en']) or A('en', v['en'].lower()); nx['a_zh'] = A('zh', v['zh'])
                    op[i] = nx; LOG.append((key, f'big book: thêm tranh cho "{v["zh"]}"', path[:2])); break
            else: LOG.append((key, f'big book: lựa chọn "{x.get("zh")}" vẫn chưa có tranh', path[:2]))
    walk(d['days'], f3)

    # 4. giọng sai tiếng
    def f4(o, path):
        if o.get('l') == 'en' and isinstance(o.get('a_q'), str) and re.search(r'/zh_', o['a_q']) and o.get('q'):
            o['a_q'] = A('en', o['q']); LOG.append((key, f'giọng câu hỏi tiếng Anh "{o["q"]}" đang là file tiếng Trung → file tiếng Anh', path[:2]))
    walk(d['days'], f4)
    NAMES = {'Bông', 'Vũ', 'Leo', 'Anna', 'Xiaomei', 'Puppy', 'Lan'}
    for k in list(am):
        l, t = k.split(':', 1)
        if l == 'zh' and not re.search(r'[一-鿿]', t) and t.strip(' !！') not in NAMES and not re.fullmatch(r'[A-Z、,，\s\-!！]+', t):
            am.pop(k); LOG.append((key, f'bỏ giọng sai tiếng aumap {k}', ''))

for key, p in FILES.items():
    head, d = load(p)
    fix(key, d, '' if key == 'SD' else '../seedling/')
    save(p, head, d)
for r in LOG: print(*r)
print(len(LOG), 'chỗ')
