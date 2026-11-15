"""Seedling 48 · dựng bước Big book mới (6 dạng, 4 lần/unit) – chị chốt 13/11/2026 chiều (claude/KeHoach_DungBigBook_1311.md mục 1).

Chạy ở thư mục gốc repo, SAU build.py và các script ap_*/va_* khác (dữ liệu web đã vá tay, đừng chạy lại build.py sinh đè):
    python3 seedling/cong-cu/ap_bigbook_sd48.py            # U1–U3
    python3 seedling/cong-cu/ap_bigbook_sd48.py 1,2,3,4    # chọn unit

Việc script làm (an toàn chạy lại nhiều lần):
  1. Trong mọi ngày của unit: bỏ bước Big book cũ (lab 'Big book'); bỏ bước bb v2 cũ nếu có.
  2. Chọn 4 ngày chứa 4 lần (U1: cả 4 ngày; unit 7–8 ngày: ngày 1, 3, 5, 7; unit khác: chia đều). Ngày có big book bỏ bước
     "Nói theo" riêng (phương án a, chị chọn 12/11) để ngày vẫn 10–12 phút.
  3. Dựng bước {'type':'bb','v':2,...} từ BT['SD'][unit] (chuong-trinh/cong-cu/khung/grid/mang/bigbook_baitap.py) và lời từng trang
     (…/mang/bigbook_loi_sd48.txt). Giọng từng trang: tai-nguyen/bigbook/uN/am/{en,zh}_pK.mp3 (đã cắt từ file duyệt trên Drive).
  4. Ghi câu chưa có file giọng vào seedling/cong-cu/giong_thieu_sd48_bb.json (chuong-trinh/giong-can-thu/gom_giong.py tự gom).
Engine: little-seed/bigbook.js + bigbook.css + bb-ve.js (web Seedling nạp từ ../little-seed/).
"""
import json, os, re, subprocess, sys, importlib.util as iu

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(ROOT, 'seedling', 'seedling-data.js')
MANG = os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang')
sys.path.insert(0, os.path.join(ROOT, 'chuong-trinh/cong-cu'))
from pinyin_chuan import py as _PYC   # pinyin chuẩn (CC-CEDICT + luật chữ đa âm)
def PY(z): return _PYC(z, noi=True)

_sp = iu.spec_from_file_location('bigbook_baitap', os.path.join(MANG, 'bigbook_baitap.py')); BBT = iu.module_from_spec(_sp); _sp.loader.exec_module(BBT)
UNITS = [int(x) for x in sys.argv[1].split(',')] if len(sys.argv) > 1 else [1, 2, 3]

raw = open(DATA, encoding='utf-8').read()
head = raw.split('\n', 1)[0]
SD = json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))', DATA],
                               capture_output=True, text=True, check=True).stdout)
days = SD['days']

# ---------- tra file giọng: file từng trang → giọng Seedling (aumap) → web 21 ngày ----------
def norm(t):
    t = t.strip().replace('，', ',').replace('！', '!').replace('？', '?').replace('。', '.')
    t = re.sub(r'\s+', ' ', t)
    return re.sub(r'[!.?]+$', '', t).lower()
IDX = {}
for k, f in SD['aumap'].items():
    l, t = k.split(':', 1); IDX.setdefault((l, norm(t)), f)
_man = json.load(open(os.path.join(ROOT, 'xem-truoc/tai-nguyen/am_thanh_manifest.json')))
for v in _man.values():
    if isinstance(v, dict) and 'loi' in v and v.get('tieng') in ('en', 'zh', 'vi'):
        IDX.setdefault((v['tieng'], norm(v['loi'])), '../xem-truoc/tai-nguyen/' + v['file'])
MISS = []
PAGE_AU = {}   # (lang, norm(text)) → file trang, ưu tiên cao nhất (đúng nguyên câu của trang)

def look(l, t):
    return PAGE_AU.get((l, norm(t))) or IDX.get((l, norm(t))) or ''
def au(l, t):
    a = look(l, t)
    if not a: MISS.append((l, t.strip()))
    return a
def au_multi(l, t):
    """Câu ghép: nguyên câu, không có thì ghi cả câu vào hàng chờ thu."""
    a = look(l, t)
    if a: return a
    parts = [x for x in re.split(r'(?<=[!！?？.。])\s*', t.strip()) if x]
    fs = [look(l, x) for x in parts]
    MISS.append((l, t.strip())); return ''
def au_cmd(l, t):   # lệnh có thể có dấu chấm hoặc không
    a = look(l, t.rstrip('.。')) or look(l, t)
    if not a: MISS.append((l, t.strip()))
    return a

# ---------- lời từng trang ----------
LOI = {}
for line in open(os.path.join(MANG, 'bigbook_loi_sd48.txt'), encoding='utf-8'):
    line = line.rstrip('\n')
    if line.startswith('# SD U'):
        m = re.match(r'# SD U(\d+) \| (.*?) \| (.*)$', line); cur = int(m.group(1)); LOI[cur] = {'title': m.group(2), 'title_zh': m.group(3), 'rows': []}
    elif line.strip() and cur:
        e, z = [x.strip() for x in line.split(' | ', 1)]; LOI[cur]['rows'].append((e, z))

def pages_of(un):
    L = LOI[un]; base = f'tai-nguyen/bigbook/u{un}/'
    n_img = len([f for f in os.listdir(os.path.join(ROOT, 'seedling', base)) if re.fullmatch(r'p\d+\.webp', f)])
    assert n_img == len(L['rows']), f'U{un}: {n_img} tranh nhưng {len(L["rows"])} dòng lời'
    for k in range(1, n_img + 1):
        for l in ('en', 'zh'):
            assert os.path.exists(os.path.join(ROOT, 'seedling', base, f'am/{l}_p{k}.mp3')), f'thiếu am/{l}_p{k}.mp3 ở U{un}'
    pg = [{'img': base + 'bia_khung.webp', 'en': L['title'], 'zh': L['title_zh'], 'py': PY(L['title_zh']),
           'a_en': base + 'am/en_bia.mp3', 'a_zh': base + 'am/zh_bia.mp3', 'cover': True}]
    for k, (e, z) in enumerate(L['rows'], 1):
        pg.append({'img': base + f'p{k}.webp', 'en': e, 'zh': z, 'py': PY(z), 'a_en': base + f'am/en_p{k}.mp3', 'a_zh': base + f'am/zh_p{k}.mp3'})
        PAGE_AU[('en', norm(e))] = base + f'am/en_p{k}.mp3'; PAGE_AU[('zh', norm(z))] = base + f'am/zh_p{k}.mp3'
    PAGE_AU[('en', norm(L['title']))] = base + 'am/en_bia.mp3'; PAGE_AU[('zh', norm(L['title_zh']))] = base + 'am/zh_bia.mp3'
    return pg

# ---------- luật chơi (thẻ đầu bước) và dạng bài: cùng chữ với Little Seed (bigbook.js) ----------
RULES = {
    'an': ['Lần này con nghe cô đọc cả quyển: tiếng Anh, rồi tiếng Trung.', 'Nghe xong, cô nói một từ, con tìm và chạm vào đúng chỗ trong tranh.', 'Không thấy thì bấm 💡: cô đưa con về trang đó để nghe lại.'],
    'sai': ['Cô đọc một trang. Đúng thì con bấm Yes, sai thì bấm No rồi chọn từ đúng.', 'Big book ở bên trái: con nghe lại khi nào cũng được.', 'Cần thì bấm 💡 nhé.'],
    'dien': ['Con nghe câu, rồi chọn từ đúng điền vào chỗ trống.', 'Big book ở bên trái: con nghe lại khi nào cũng được.', 'Cần thì bấm 💡 nhé.'],
    'vai': ['Con chọn một bạn trong truyện để đóng vai.', 'Đến lời của bạn ấy, con nói thay bạn ấy. Máy thu giọng con.', 'Cuối bài con nói về con với ảnh trên bìa, rồi nghe lại truyện có giọng con.'],
    'dich': ['Con nghe một câu, rồi nghe các câu ở tiếng kia.', 'Con chọn câu cùng nghĩa.', 'Big book ở bên trái: con nghe lại khi nào cũng được.'],
    'xep': ['Con nghe câu.', 'Rồi chạm các thẻ theo đúng thứ tự để xếp lại câu. Chạm thẻ là nghe được thẻ đó.', 'Big book ở bên trái: con nghe lại khi nào cũng được.']}
NAMES = BBT.NAMES_SD
CO_IMG = 'tai-nguyen/nhan-vat/nv_lan_a.webp'   # Seedling: cô dẫn là Mrs Lan

def ten(k, l=None):
    """Thẻ nhân vật. Chỉ ghi vào hàng chờ thu giọng của tiếng đang hỏi (l); tên Latin chưa có giọng Trung thì dùng giọng Anh của tên đó."""
    e, z, im = NAMES[k]
    ae = au('en', e) if l in (None, 'en') else look('en', e)
    az = look('zh', z) or (look('en', e) if z == e else '')
    if not az and l in (None, 'zh'): MISS.append(('zh', z))
    return {'k': k, 'img': im, 'en': e, 'zh': z, 'a_en': ae, 'a_zh': az}

def build_step(un, lan, pages):
    BTU = BBT.BT['SD'][un]; off = 1; k = BBT.kieu(un, lan); qs = []; extra = {}
    def _w(l, w):   # từ / lựa chọn: mã tên (có ảnh), chữ trùng tên nhân vật, hoặc chữ trơn (cùng tiếng với câu hỏi)
        if isinstance(w, str) and w in NAMES: return ten(w, l)
        if isinstance(w, str):
            kk = next((x for x, (e, z, _) in NAMES.items() if w.lower() in (e.lower(), z.lower())), None)
            if kk: return ten(kk, l)
        o = {'en': w[0], 'zh': w[1]} if isinstance(w, (tuple, list)) else {'en': w, 'zh': w}
        for lg, strip in (('en', '!.?,'), ('zh', '！。？，')):
            t = o[lg].rstrip(strip); o['a_' + lg] = au(lg, t) if lg == l else look(lg, t)
        o['py'] = PY(o['zh']) if re.search(r'[一-鿿]', o['zh']) else ''
        return o
    def _pg(pg, l):
        t = pages[pg][l]; return {'say': t, 'a_say': pages[pg]['a_' + l], 'pg': pg, 'l': l}
    def cau_con():
        return [dict(m, a_q=au_multi(m['l'], m['q']) if m.get('q') else '', a_cue=au(m['l'], m['cue'].rstrip('!！。.?？')), a_vd=au_multi(m['l'], m['vd'])) for m in BTU['mine']]
    if k == 'an':
        for pg, l, w, box in BTU['an']:
            o = _w(l, w); t = o[l]
            qs.append(dict(_pg(pg, l), w=t, a_w=o['a_' + l] or au(l, t), py=PY(t) if l == 'zh' else '', box=box))
    elif k == 'sai':
        for i, (pg, l, rd, op) in enumerate(BTU['sai']):
            d = dict(_pg(pg, l), wrong=bool(rd), read=rd or pages[pg][l])
            d['a_read'] = au_multi(l, d['read']) if rd else pages[pg]['a_' + l]
            if op:
                os_ = [_w(l, x) for x in op]; a = i % 2; os_ = os_ if a == 0 else [os_[1], os_[0]]
                d.update({'opts': os_, 'ans': a})
            qs.append(d)
    elif k == 'dien':
        for pg, l, bl, op in BTU['dien']:
            t = pages[pg][l]; assert bl in t, (un, pg, bl, t)
            qs.append(dict(_pg(pg, l), fr=t.replace(bl, '___', 1), opts=[_w(l, x) for x in op], ans=op.index(bl)))
    elif k == 'xep':
        for it in BTU['xep']:
            pg, l, tl = it[:3]; src = it[3] if len(it) > 3 else l
            assert ''.join(tl).replace(' ', '') in pages[pg][l].replace(' ', ''), (un, pg, tl, pages[pg][l])
            d = dict(_pg(pg, l), tiles=[{'t': x, 'a': au(l, re.sub(r'[!！。.?？,，]+$', '', x)), 'py': PY(x) if l == 'zh' else ''} for x in tl])
            if src != l: d.update({'src': src, 'src_t': pages[pg][src], 'src_a': pages[pg]['a_' + src]})
            qs.append(d)
    elif k == 'dich':
        for i, (pg, src, nh) in enumerate(BTU['dich']):
            l = 'zh' if src == 'en' else 'en'; ops = [pg] + list(nh); a = i % len(ops); ops = ops[1:a + 1] + [pg] + ops[a + 1:]
            qs.append(dict(_pg(pg, l), src=src, s=pages[pg][src], a_s=pages[pg]['a_' + src], s_py=pages[pg]['py'] if src == 'zh' else '',
                           opts=[{'t': pages[x][l], 'a': pages[x]['a_' + l], 'py': pages[x]['py'] if l == 'zh' else ''} for x in ops], ans=a))
    elif k == 'vai':
        roles = []
        for rk, (lab, img, turns) in BTU['vai'].items():
            mine_pg = {pg for pg, _ in turns}; ts = []
            for pg, l in turns:
                ctx = pg - 1 if pg - 1 >= off and (pg - 1) not in mine_pg else None
                ts.append(dict(_pg(pg, l), t=pages[pg][l], py=pages[pg]['py'] if l == 'zh' else '', ctx=ctx))
            roles.append({'k': rk, 'label': lab, 'img': img, 'turns': ts})
        extra = {'roles': roles, 'mine': cau_con()[:2]}
    cmd = {l: {'t': t, 'a': au_cmd(l, t), 'tl': 'vi', 'tr': tr} for l, (t, tr) in BBT.LENH[k].items()}
    o = {'type': 'bb', 'v': 2, 'kind': k, 'lan': lan, 'lab': 'Big book', 'sub': f'Lần {lan} · {BBT.TEN_NGAY[k]}', 'rules': RULES[k],
         'title': LOI[un]['title'], 'title_zh': LOI[un]['title_zh'], 'pages': pages, 'qs': qs, 'cmd': cmd, 'co_img': CO_IMG,
         'frame': BTU['frame'], 'photo_t': BTU['photo_t'], 'photo_k': BBT.PHOTO_SD}
    o.update(extra)
    return o

def host_days(D):
    n = len(D)
    idx = [0, 2, 4, 6] if n >= 7 else [round(i * (n - 1) / 3) for i in range(4)]
    return [D[i] for i in idx]

is_old_bb = lambda s: s.get('lab') == 'Big book' and s.get('v') != 2 or (s['type'] == 'truyen' and str(s.get('title', '')).startswith('Big book'))
is_bb2 = lambda s: s['type'] == 'bb' and s.get('v') == 2

for un in UNITS:
    pages = pages_of(un)
    D = sorted(int(n) for n, d in days.items() if str(d.get('unit')) == str(un))
    H = host_days(D)
    print(f'U{un}: ngày {D} → 4 lần ở ngày {H}')
    for n in D:   # bỏ big book cũ và bb v2 cũ ở mọi ngày của unit
        st = days[str(n)]['steps']; at = next((i for i, s in enumerate(st) if is_old_bb(s) or is_bb2(s)), None)
        days[str(n)]['steps'] = [s for s in st if not (is_old_bb(s) or is_bb2(s))]
        days[str(n)]['_bb_at'] = at
    for lan, n in enumerate(H, 1):
        d = days[str(n)]; st = d['steps']; at = d.get('_bb_at')
        st = [s for s in st if s['type'] != 'noi']   # phương án (a): ngày big book bỏ "Nói theo" riêng
        if at is None or at > len(st): at = next((i + 1 for i, s in enumerate(st) if s['type'] == 'truyen'), 1)
        st.insert(min(at, len(st)), build_step(un, lan, pages)); d['steps'] = st
    for n in D: days[str(n)].pop('_bb_at', None)

open(DATA, 'w', encoding='utf-8').write(head + '\nwindow.SD=' + json.dumps(SD, ensure_ascii=False) + ';\n')
out = os.path.join(os.path.dirname(__file__), 'giong_thieu_sd48_bb.json')
prev = json.load(open(out)) if os.path.exists(out) else []
cur = sorted(set(map(tuple, MISS)))
json.dump([list(x) for x in cur], open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('xong · câu chưa có giọng thu sẵn:', len(cur), '· en', sum(1 for l, _ in cur if l == 'en'), '· zh', sum(1 for l, _ in cur if l == 'zh'))
