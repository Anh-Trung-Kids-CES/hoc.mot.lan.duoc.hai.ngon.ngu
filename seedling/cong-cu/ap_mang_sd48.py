"""Đưa mạng văn bản Seedling 48 buổi (chuong-trinh/cong-cu/khung/grid/mang/sd48_mang.py, 11/11/2026) lên web Seedling 99 ngày.
Thay cho ap_mang_u9.py (bản mẫu U9 cũ). Chạy SAU build.py, ở thư mục gốc repo: python3 -I seedling/cong-cu/ap_mang_sd48.py
- U2, U3, U5–U12: truyện mới theo chỉ tiêu 4 mặt (ng.t. 62d), mỗi câu một tranh ghép nét web 21 ngày (nhân vật + nền + thẻ tranh từ trong câu)
  -> tai-nguyen/canh/u<n>/p<k>_<i>.webp; ngày Phần: bước "Big book và vè" thay bài luyện rời Chạm/Chọn (ng.t. 23, 27), Nói theo, Phiên dịch nhí dựng lại;
  ngày Cả truyện: truyện mới (phần 1–3 / 4–6), câu hỏi nghe hiểu mới; reader mới. Các bước thẻ, nền, mẹo âm, dạng đề, vận động giữ nguyên.
- U1 (ngày 1–3), U4 (ngày 4–7) – tuần 1–3: giữ truyện v7, thêm bước big book + vè chào (ng.t. 65–67); U4 ghép tranh cảnh cho truyện.
- Không đưa buổi 0 (khai giảng) lên web.
"""
import json, os, re, subprocess, importlib.util, shutil
from PIL import Image, ImageDraw, ImageFont
from pypinyin import pinyin as _pinyin, Style as _Style
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(ROOT)
DATA = 'seedling/seedling-data.js'
sp = importlib.util.spec_from_file_location('sd48', 'chuong-trinh/cong-cu/khung/grid/mang/sd48_mang.py'); MG = importlib.util.module_from_spec(sp); sp.loader.exec_module(MG)
raw = open(DATA).read(); head = raw.split('\n', 1)[0]
SD = json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))', os.path.abspath(DATA)],
                               capture_output=True, text=True, check=True).stdout)
AU = SD['aumap']; MISS = set()
def au1(l, t):
    t = t.strip(); return AU.get(f'{l}:{t}') or AU.get(f'{l}:{t.rstrip("!.?！。？")}') or ''
def au(l, t):
    a = au1(l, t)
    if a: return a
    MISS.add((l, t)); return ''   # web Seedling không nối nhiều file giọng: câu chưa thu đọc bằng giọng trình duyệt
def PY(z):
    out = []
    for seg in re.split(r'([一-鿿]+)', z):
        out.append(' '.join(x[0] for x in _pinyin(seg, style=_Style.TONE)) if re.match(r'[一-鿿]', seg or '') else seg)
    s = ''.join(out)
    for a, b in (('，', ', '), ('！', '! '), ('？', '? '), ('。', '. '), ('、', ', '), ('……', '… '), ('：', ': '), ('“', '"'), ('”', '"')): s = s.replace(a, b)
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:1].upper() + s[1:]

# ---------- ghép tranh ----------
S = 'seedling/'; NV = S + 'tai-nguyen/nhan-vat/'; TRG = S + 'tai-nguyen/trang/'; PIC = S + 'tai-nguyen/tranh/'
WFILE = {k: S + v[1] for k, v in SD['who'].items() if k not in ('narr', 'kids')}
ADULT = {'lan', 'ong', 'ba', 'bo_leo', 'bo_anna', 'me_bong', 'bo_bong', 'me_leo', 'me_xm', 'man'}
NAMES = [('Mrs Lan', 'lan'), ('Bông', 'bong'), ('Leo', 'leo'), ('Anna', 'anna'), ('Xiaomei', 'xiaomei'), ('Vũ', 'nhan'), ('Grandma', 'ba'), ('Grandpa', 'ong'), ('kids', 'kids')]
STOP = {'big', 'small', 'little', 'long', 'new', 'young', 'white', 'black', 'blue', 'green', 'red', 'pink', 'yellow', 'orange', 'purple', 'grey', 'colour', 'play', 'love',
        'fun', 'happy', 'water', 'game', 'song', 'number', 'hand', 'open', 'close', 'touch', 'under', 'look', 'see', 'animal', 'cool', 'hot', 'cold', 'tall', 'sad', 'tired'}
KEYS = sorted([f[:-5] for f in os.listdir(PIC) if f.endswith('.webp') and not f.startswith('de_')], key=lambda k: -len(k))
FONT = next(f for f in ('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc',
                        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf') if os.path.exists(f))
def card_img(im, size):
    im = im.resize((size, size), Image.LANCZOS); pad = 10
    c = Image.new('RGBA', (size + 2 * pad, size + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(c).rounded_rectangle([0, 0, size + 2 * pad - 1, size + 2 * pad - 1], 26, fill=(255, 255, 255, 255), outline=(240, 200, 80, 255), width=6)
    mk = Image.new('L', (size, size), 0); ImageDraw.Draw(mk).rounded_rectangle([0, 0, size - 1, size - 1], 20, fill=255)
    c.paste(im, (pad, pad), mk); return c
def the_chu(en, zh, out):
    W = 600; im = Image.new('RGB', (W, W), (255, 250, 236)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 14, W - 15, W - 15], 48, outline=(240, 200, 80), width=14, fill=(255, 252, 244))
    f1 = ImageFont.truetype(FONT, 90 if len(en) < 10 else 64); f2 = ImageFont.truetype(FONT, 110)
    for txt, f, y in ((en, f1, 200), (zh, f2, 390)):
        w = d.textlength(txt, font=f); d.text(((W - w) / 2, y - f.size // 2), txt, font=f, fill=(47, 70, 60))
    os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out, quality=88)
def person(w, h):
    if w == 'kids':
        ims = [Image.open(WFILE[k]).convert('RGBA') for k in ('leo', 'anna', 'xiaomei')]
        hh = int(h * 0.85); ims = [i.resize((int(i.width * hh / i.height), hh), Image.LANCZOS) for i in ims]
        c = Image.new('RGBA', (sum(i.width for i in ims) - 60, hh), (0, 0, 0, 0)); x = 0
        for i in ims: c.alpha_composite(i, (x, 0)); x += i.width - 30
        return c
    im = Image.open(WFILE.get(w, WFILE['bong'])).convert('RGBA')
    hh = int(h * (1.25 if w in ADULT else (1.1 if w == 'anh_nhan' else 1.0)))
    return im.resize((int(im.width * hh / im.height), hh), Image.LANCZOS)
def tranh(key):
    for p in (PIC + key + '.webp', NV + key + '_a.webp', NV + key + '.webp'):
        if key and os.path.exists(p): return p
    return ''
def words_in(text, pref):
    t = ' ' + re.sub(r"[^a-z' ]", ' ', text.lower().replace('-', ' ')) + ' '; out = []
    for k in pref + KEYS:
        if (k in STOP and k not in pref) or k in out: continue
        w = k.replace('_', ' ')
        if re.search(r'(?<![a-z])' + re.escape(w) + r'(s|es)?(?![a-z])', t): out.append(k)
        if len(out) == 2: break
    return [tranh(k) for k in out]
def scene(out, bg, ppl, items):
    base = Image.open(TRG + bg + '.webp').convert('RGBA').resize((900, 900))
    for i, w in enumerate(ppl):
        im = person(w, 470 if len(ppl) < 3 else 400)
        cx = int(900 * (i + 1) / (len(ppl) + 1)); base.alpha_composite(im, (max(0, min(900 - im.width, cx - im.width // 2)), 885 - im.height))
    for j, f in enumerate(items[:2]):
        sz = (300 if not ppl else 220) if len(items) == 1 else 190
        c = card_img(Image.open(f).convert('RGBA'), sz)
        x = (900 - c.width) // 2 if len(items) == 1 else (180 + j * 330); base.alpha_composite(c, (x, 40 if ppl else 250))
    os.makedirs(os.path.dirname(out), exist_ok=True); base.convert('RGB').save(out, quality=84)
def named(text, parent):
    hits = []
    for nm, c in NAMES + list(parent.items()):
        for mt in re.finditer(r'(?<![A-Za-zÀ-ỹ])' + re.escape(nm) + r'(?![a-zà-ỹ])', text): hits.append((mt.start(), c))
    out = []
    for _, c in sorted(hits):
        if c not in out: out.append(c)
    return out[:3]
def compose(n, k, P, bg, parent, pref):
    """P: [(who, en, zh)] -> danh sách cảnh web; tranh ra tai-nguyen/canh/u<n>/p<k>_<i>.webp"""
    sc = []; spk = [w for w, e, z in P if w not in ('narr', 'kids')]
    for i, (w, e, z) in enumerate(P):
        if w == 'narr':
            ppl = named(e, parent)
        else:
            nxt = next((x[0] for x in P[i + 1:] + P[:i][::-1] if x[0] not in ('narr', w)), None)
            ppl = [w] + ([nxt] if nxt and nxt != 'kids' or (nxt == 'kids' and w != 'kids') else [])
            ppl = [x for j, x in enumerate(ppl) if x not in ppl[:j]][:2]
        items = words_in(e, pref)
        if not ppl and not items: ppl = spk[:1] or ['bong']
        rel = f'tai-nguyen/canh/u{n}/p{k + 1}_{i + 1}.webp'
        scene(S + rel, bg, ppl, items)
        sc.append({'who': w, 'img': rel, 'en': e, 'zh': z, 'py': PY(z), 'a_en': au('en', e), 'a_zh': au('zh', z)})
    return sc

def bb_img(key, en, zh):
    p = tranh(key)
    if p: return p[len(S):]
    slug = re.sub(r'[^a-z0-9]+', '_', en.lower()).strip('_')[:30]; rel = f'tai-nguyen/the/{slug}.webp'
    the_chu(key.replace('_', ' '), {'crayon': '蜡笔'}.get(key, zh[:4]), S + rel); return rel
def ve_txt(e):
    return re.sub(r"\b([\w']+(?:-[\w']+)+)\b", lambda m: m.group(1).replace('-', '').upper() if any(p.isupper() for p in m.group(1).split('-')) else m.group(1).replace('-', ''), e)
def bb_step(pages, title, title_zh):
    return {'type': 'truyen', 'lab': 'Big book và vè', 'sub': 'Nghe lại mẫu câu của unit', 'title': title, 'title_zh': title_zh,
            'scenes': [{'who': 'narr', 'img': i, 'en': e, 'zh': z, 'py': PY(z), 'a_en': au('en', e), 'a_zh': au('zh', z)} for i, e, z in pages]}
SONG = 'tai-nguyen/tranh/song.webp'
def pages_of(M):
    return [(bb_img(k, e, z), e, z) for k, e, z in M['bb'][2]], [(SONG, ve_txt(e), z) for w, e, z, v in M['ve']]
KID = ('bong', 'leo', 'anna', 'xiaomei', 'nhan')
def noi(sc, n=6):
    kid = [s for s in sc if s['who'] in KID and '___' not in s['en']]
    T = [{'img': s['img'], 'say': [{'t': s['en' if i % 2 == 0 else 'zh'], 'l': 'en' if i % 2 == 0 else 'zh', 'w': s['who'], 'a': s['a_en' if i % 2 == 0 else 'a_zh']}]}
         for i, s in enumerate(kid)]
    while T and len(T) < 5: T.append(T[len(T) % len(kid)])
    return T[:n]
def pdn(sc, n=5):
    seen, it = set(), []
    for s in sc:
        if s['en'] in seen or len(s['en'].split()) < 3 or '___' in s['en']: continue
        seen.add(s['en']); it.append({'en': s['en'], 'zh': s['zh'], 'py': s['py'], 'a_en': s['a_en'], 'a_zh': s['a_zh']})
    return it[:n]
def hoi(M, SC, parts):
    en, zh = [], []
    for i, (p, ln, q, opts, ans, qz, oz) in enumerate([h for h in M['hoi'] if h[0] in parts]):
        img = SC[p - 1][min(ln, len(SC[p - 1])) - 1]['img']
        o, oz2, a = list(opts), list(oz), ans
        if i % 2 == 1: o, oz2, a = o[::-1], oz2[::-1], len(o) - 1 - ans
        en.append({'q': q, 'opts': o, 'ans': a, 'img': img, 'a': au('en', q)})
        zh.append({'q': qz, 'py': PY(qz), 'opts': [[x, PY(x)] for x in oz2], 'ans': a, 'img': img, 'a': au('zh', qz)})
    return {'type': 'hoi', 'rounds': [{'l': 'en', 'qs': en}, {'l': 'zh', 'yct': True, 'qs': zh}]}

DAYS = SD['days']
def unit_days(n, kind):
    return sorted((int(k) for k, d in DAYS.items() if str(d.get('unit')) == str(n) and d.get('kind') == kind))
def put_bb(st, step):
    i = next((i for i, s in enumerate(st) if s.get('lab') == 'Big book và vè'), None)
    if i is None: i = next((i for i, s in enumerate(st) if s['type'] in ('cham', 'chon')), None)
    if i is not None: st[i] = step
    else:
        j = next(i for i, s in enumerate(st) if s['type'] == 'truyen'); st.insert(j + 1, step)
def set_truyen(st, step):
    i = next(i for i, s in enumerate(st) if s['type'] == 'truyen' and s.get('lab') != 'Big book và vè'); st[i] = step

report = {}
for n, M in sorted(MG.U.items()):
    if M.get('giu_truyen'): continue
    ph = unit_days(n, 'Phần'); ca = unit_days(n, 'Cả truyện')
    assert len(ph) == len(M['phan']) == 6, (n, ph)
    d0 = S + f'tai-nguyen/canh/u{n}'
    if os.path.isdir(d0): shutil.rmtree(d0)
    bgs = M['bg'] if isinstance(M['bg'], list) else [M['bg']] * 6
    pref = [k for c in sum([DAYS[str(x)]['steps'] for x in ph], []) if c['type'] == 'the' for k in
            [os.path.basename(cd.get('img', ''))[:-5] for cd in c['cards'] if cd.get('img', '').startswith('tai-nguyen/tranh/')]]
    SC = [compose(n, k, P, bgs[k], M.get('parent', {}), pref) for k, (t, z, P) in enumerate(M['phan'])]
    BB, VE = pages_of(M)
    for k, dn in enumerate(ph):
        d = DAYS[str(dn)]; st = d['steps']; t, z, P = M['phan'][k]
        set_truyen(st, {'type': 'truyen', 'title': f'{M["ten_en"]} · {t}', 'title_zh': f'{M["ten_zh"]} · {z}', 'scenes': SC[k]})
        pg = [BB[(2 * k + j) % len(BB)] for j in range(3)] + [VE[(k + j) % len(VE)] for j in range(2)]
        put_bb(st, bb_step(pg, f'Big book · {M["bb"][0]} + vè', f'Big book · {M["bb"][1]} + 儿歌'))
        for i, s in enumerate(st):
            if s['type'] == 'noi': st[i] = {'type': 'noi', 'turns': noi(SC[k] + (SC[k - 1] if k else SC[1]))}
            if s['type'] == 'pdn': st[i] = {'type': 'pdn', 'model_first': False, 'items': pdn(SC[k] + (SC[k - 1] if k else SC[1]))}
        d['t'] = f'{t} – {z}'; d['hero'] = SC[k][0]['img']; d['story'] = f'{M["ten_en"]} · Phần {k + 1}'
    for j, dn in enumerate(ca):
        rg = range(0, 3) if j == 0 else range(3, 6); sc = [s for k in rg for s in SC[k]]
        d = DAYS[str(dn)]; st = d['steps']
        set_truyen(st, {'type': 'truyen', 'title': f'{M["ten_en"]} · Cả truyện (phần {rg[0] + 1}–{rg[-1] + 1})',
                        'title_zh': f'{M["ten_zh"]} · 全文（{rg[0] + 1}–{rg[-1] + 1}）', 'scenes': sc})
        for i, s in enumerate(st):
            if s['type'] == 'hoi': st[i] = hoi(M, SC, [k + 1 for k in rg])
            if s['type'] == 'noi': st[i] = {'type': 'noi', 'turns': noi(sc, 8)}
            if s['type'] == 'pdn': st[i] = {'type': 'pdn', 'model_first': False, 'items': pdn(sc)}
        d['hero'] = sc[0]['img']
    SD['reader'][str(n)] = {'t': M['ten_en'], 'zh': M['ten_zh'], 'pages': [dict(s, part=k + 1) for k in range(6) for s in SC[k]]}
    report[n] = (ph, ca, sum(len(x) for x in SC))

# ---------- tuần 1–3: U1 (ngày 1–3) vè chào + big book tự giới thiệu; U4 (ngày 4–7) big book cơ thể + vè chào + vè unit ----------
BB1, VEC = pages_of(MG.U[1]); BB4, VE4 = pages_of(MG.U[4])
for i, dn in enumerate(unit_days(1, 'Phần')):
    pg = [BB1[(2 * i + j) % len(BB1)] for j in range(3)] + [VEC[(2 * i) % 6], VEC[(2 * i + 1) % 6]]
    put_bb(DAYS[str(dn)]['steps'], bb_step(pg, "Big book · Hello! I'm ___ + vè chào", 'Big book · 你好！我是___ + 问好儿歌'))
U4 = MG.U[4]; ph4 = unit_days(4, 'Phần'); SC4 = []
d0 = S + 'tai-nguyen/canh/u4'
if os.path.isdir(d0): shutil.rmtree(d0)
for k, dn in enumerate(ph4):
    st = DAYS[str(dn)]['steps']; tr = next(s for s in st if s['type'] == 'truyen' and s.get('lab') != 'Big book và vè')
    P = [(s['who'], s['en'], s['zh']) for s in tr['scenes']]
    sc = compose(4, k, P, U4['bg'], {'Grandpa': 'ong'}, ['body', 'hair', 'arm', 'leg', 'finger', 'toe', 'shoulder', 'knee', 'mouth', 'town', 'clap_your_hands', 'stamp_your_feet'])
    for a, b in zip(tr['scenes'], sc):
        for key in ('a_en', 'a_zh'):
            if a.get(key): b[key] = a[key]
    tr['scenes'] = sc; SC4.append(sc); DAYS[str(dn)]['hero'] = sc[0]['img']
    pg = [BB4[(2 * k + j) % len(BB4)] for j in range(2)] + [VEC[(2 * (k + 3)) % 6]] + [VE4[(k + j) % len(VE4)] for j in range(2)]
    put_bb(st, bb_step(pg, 'Big book · This Is My Body + vè', 'Big book · 这是我的身体 + 儿歌'))
IMG4 = {s['en']: s['img'] for sc in SC4 for s in sc}
for dn in unit_days(4, 'Cả truyện'):
    for s in DAYS[str(dn)]['steps']:
        for sc in (s.get('scenes') or []):
            if sc.get('en') in IMG4: sc['img'] = IMG4[sc['en']]
if '4' in SD['reader']:
    for p in SD['reader']['4']['pages']:
        if p.get('en') in IMG4: p['img'] = IMG4[p['en']]

# ---------- "Ba mẹ ôn trước buổi" (SD.lop[*].prep) lấy câu của truyện mới, khớp các ngày web trước buổi (rà 11/11 chiều) ----------
NEWU = {str(n) for n, M in MG.U.items() if not M.get('giu_truyen')}
for k, L in SD['lop'].items():
    ds = [str(x) for x in L.get('days', [])]
    if not any(str(DAYS[d].get('unit')) in NEWU for d in ds if d in DAYS): continue
    out, seen = [], set()
    for d in ds:
        st = DAYS[d]['steps']
        for s in st:
            if s['type'] != 'truyen' or s.get('lab'): continue
            for x in s.get('scenes', []):
                e = x['en'].strip()
                if x['who'] in ('narr',) or '___' in e or len(e.split()) < 3 or e in seen: continue
                seen.add(e); out.append(x)
    pick = out[::max(1, len(out) // 4)][:4] if len(out) > 4 else out
    L['prep'] = [f"{x['en']} · {x['zh']}" for x in pick]
# Sót từ v7: lời dặn "(nghe làm quen)" trong câu Trung của Phiên dịch nhí ngày 4, 5 (màn bài không có chữ tiếng Việt)
for d in DAYS.values():
    for s in d['steps']:
        for it in s.get('items', []):
            if isinstance(it, dict) and '(nghe' in (it.get('zh') or ''):
                it['zh'] = re.sub(r'^\(nghe\s*làm\s*quen\)\s*', '', it['zh'].replace('（', '(').replace('）', ')'))
                it['py'] = re.sub(r'^Nghe\s*l[àa]m\s*quen\s*', '', it.get('py', ''), flags=re.I); it['py'] = it['py'][:1].upper() + it['py'][1:]
                it['a_zh'] = au('zh', it['zh'])

open(DATA, 'w').write(head + '\nwindow.SD=' + json.dumps(SD, ensure_ascii=False) + ';\n')
json.dump(sorted(MISS), open('seedling/cong-cu/giong_thieu_sd48.json', 'w'), ensure_ascii=False, indent=0)
for n, (ph, ca, ns) in report.items(): print(f'U{n}: ngày phần {ph[0]}–{ph[-1]}, cả truyện {ca}, {ns} cảnh')
print('câu chưa có giọng thu sẵn (đọc bằng giọng trình duyệt):', len(MISS))
