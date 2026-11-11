"""Dựng dữ liệu dải "Xem thêm" (extensive reading/listening) cho web Little Seed và Seedling.
Chạy: python3 -I seedling/cong-cu/xem_them/build_xem_them.py  (từ gốc repo)
Nguồn: khung 48 buổi mới (little-seed48.json, seedling48-v8-sheet.csv) để biết unit của từng ngày;
mẹo âm từng ngày lấy từ seedling/seedling-data.js; kho video/sách ở kho_xem_them.py.
Ra: little-seed/xem-them-data.js, seedling/xem-them-data.js"""
import csv, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE); import kho_xem_them as K

def yt(x, kind, lang):
    return {'k': kind, 'l': lang, 'id': x[0], 't': x[1], 'c': x[2]}
def book(b):
    return {'k': 'book', 'l': 'en', 'id': str(b[0]), 't': b[1], 'c': 'Unite for Literacy'}

# ---------- unit theo ngày ----------
g = json.load(open(os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json')))
ls_unit = {d['ngay']: d['unit'] for d in g['days']}
sd_unit = {}
for x in csv.reader(open(os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/seedling48-v8-sheet.csv'))):
    if len(x) > 3 and x[0].isdigit():
        if int(x[0]) in sd_unit or x[0] == '0': break   # sau bảng ngày web là bảng buổi học
        sd_unit[int(x[0])] = x[2]
def norm_units(m):
    """ngày ôn (unit không phải số) → ôn chủ đề của mọi unit đã học tới lúc đó (xoay vòng để mỗi ngày một khác)"""
    out, seen = {}, []
    for n in sorted(m):
        u = str(m[n]).strip()
        if u.isdigit():
            if int(u) not in seen: seen.append(int(u))
            out[n] = [int(u)]
        else: out[n] = list(seen) or [1]
    return out
ls_u, sd_u = norm_units(ls_unit), norm_units(sd_unit)

# ---------- mẹo âm Seedling theo ngày ----------
js = subprocess.run(['node', '-e', """global.window=global;const fs=require('fs');eval(fs.readFileSync(process.argv[1],'utf8').replace(/^const SD\\b/m,'global.SD'));
const o={};for(const k of Object.keys(SD.days)){const r={en:[],zh:[]};(SD.days[k].steps||[]).forEach(s=>{if(s.type==='meo')(s.cards||[]).forEach(c=>r[c.l]&&r[c.l].push(c.sym))});o[k]=r}console.log(JSON.stringify(o))""",
                     os.path.join(ROOT, 'seedling/seedling-data.js')], capture_output=True, text=True, check=True).stdout
meo = {int(k): v for k, v in json.loads(js).items()}
MULTI = ['ck', 'ch', 'sh', 'th', 'ee', 'oo', 'ng', 'or', 'ow']
def ph_keys(sym):
    if '+' in sym or re.search(r'\bs a t i p n\b', sym): return ['sat']
    s = sym.lower().replace('c/k', 'c k'); keys = []
    for tok in re.findall(r'-?[a-z]+', s):
        tok = tok.lstrip('-')
        if tok in MULTI or (len(tok) == 1 and tok in K.PH): keys.append(tok)
        elif tok in ('brown', 'nam', 'dad'): continue
    return [k for i, k in enumerate(keys) if k not in keys[:i]]
def py_keys(sym):
    out = []
    for key, pat in [('bpmf', r'\bb\b.*\bp\b|\bm ↔ f'), ('dtnl', r'\bd ↔ t|\bn ↔ l'), ('gkh', r'\bg\b.*\bk\b.*\bh\b'), ('jqx', r'j q x'),
                     ('zhchshr', r'zh ch sh r'), ('zcs', r'^z c s'), ('aoe', r'a · o · e'), ('iuv', r'i .*u .*ü'), ('dv', r'ai ei|ao ou|ia|ua'),
                     ('nasal', r'an en|ang eng'), ('whole', r'^y-')]:
        if re.search(pat, sym): out.append(key)
    return out or ['tones']   # thanh điệu, ghép âm có dấu, bài hát ôn

def pools(topics):
    """ghép xen kẽ theo chủ đề (ngày ôn nhiều unit thì mỗi lượt lấy một chủ đề khác)"""
    def mix(lists):
        out = []
        for j in range(max([len(L) for L in lists] or [0])):
            out += [L[j] for L in lists if j < len(L)]
        return out
    en = mix([[x for x in K.V[t] if x[3] == 'en'] for t in topics]); zh = mix([[x for x in K.V[t] if x[3] == 'zh'] for t in topics])
    bk = mix([K.B[t] for t in topics])
    dedup = lambda L: [x for i, x in enumerate(L) if x[0] not in [y[0] for y in L[:i]]]
    return dedup(en), dedup(zh), dedup(bk)
def rot(L, i, n): return [L[(i + j) % len(L)] for j in range(min(n, len(L)))] if L else []

def build(course, unit_of, units_map, n_en, n_zh):
    days, idx = {}, {}
    for n in sorted(unit_of):
        us = unit_of[n]; topics = [t for u in us for t in units_map.get(u, [])] or ['greet']
        key = tuple(us); i = idx.get(key, 0); idx[key] = i + 1
        if len(us) > 1: i = n   # ngày ôn: lệch theo số ngày để hai ngày ôn liền nhau không trùng
        en, zh, bk = pools(topics); items = []
        if course == 'sd' and n in meo:
            for sym in meo[n]['en'][:1]:
                for k in ph_keys(sym)[:2]: items.append(yt(K.PH[k], 'phonics', 'en'))
            for sym in meo[n]['zh'][:1]:
                for k in py_keys(sym)[:1]: items.append(yt(K.PY[k], 'pinyin', 'zh'))
        items += [yt(x, 'song', 'en') for x in rot(en, i * n_en, n_en)]
        items += [yt(x, 'song', 'zh') for x in rot(zh, i * n_zh, n_zh)]
        items += [book(b) for b in rot(bk, i, 1)]
        seen = set(); days[n] = [x for x in items if not (x['id'] in seen or seen.add(x['id']))]
    return days

out = {'ls': build('ls', ls_u, K.UNITS['ls'], 2, 2), 'sd': build('sd', sd_u, K.UNITS['sd'], 2, 2)}
for course, folder in [('ls', 'little-seed'), ('sd', 'seedling')]:
    d = out[course]
    body = ('/* Tự sinh bởi seedling/cong-cu/xem_them/build_xem_them.py – không sửa tay.\n'
            '   Dải "Xem thêm" theo ngày: k = phonics | pinyin | song | book; l = en | zh; id = mã YouTube hoặc BookId Unite for Literacy. */\n'
            'const XT_DATA = ' + json.dumps({str(k): v for k, v in d.items()}, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, folder, 'xem-them-data.js'), 'w').write(body)
    n_items = sum(len(v) for v in d.values()); ids = {x['id'] for v in d.values() for x in v}
    print(course, len(d), 'ngày ·', n_items, 'mục ·', len(ids), 'tài liệu khác nhau · ít nhất', min(len(v) for v in d.values()), 'mục/ngày')
