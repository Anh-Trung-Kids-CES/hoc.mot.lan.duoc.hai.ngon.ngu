# -*- coding: utf-8 -*-
"""Kiểm một file mẫu văn bản trọn grid/mang/mau_<khóa>_u<n>.json (độ dài, từ lõi ≥3 văn bản, vòng ngoài ≥2, câu cửa miệng, từ hay sai, tỉ lệ khung, từ lạ).
Chạy trong cong-cu/khung/:  python3 audit/check_unit.py grid/ seedling 1 "good morning" [doclap]   (regex của khung câu; doclap = lớp chưa học khóa trước)"""
import json, re, sys
G, C, U, FR = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
ORDER = ['preb', 'little-seed', 'seedling', 'canopy']
mau = json.load(open(G + 'mang/mau_%s_u%s.json' % (C, U)))
rows = json.load(open(G + 'mang/%s.json' % C))
u = [r for r in rows if r['unit'] == U][0]
kn_en, kn_zh = set(), set()
DOC_LAP = len(sys.argv) > 5 and sys.argv[5] == 'doclap'   # khóa độc lập: lớp chưa học khóa nào trước
for c in ([C] if DOC_LAP or C not in ORDER else ORDER[:ORDER.index(C) + 1]):
    for r in json.load(open(G + 'mang/%s.json' % c)):
        if c == C and int(r['unit']) >= int(U): continue
        kn_en |= {x['tu'].lower() for x in r['tu_en']}; kn_zh |= {x['tu'] for x in r['tu_zh']}

def txt(t, L):
    v = mau[t].get(L, '')
    return v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)
def norm(t):
    return ' ' + re.sub(r"[^a-zà-ỹ' ]+", ' ', t.lower()) + ' '
ts = [k for k in mau if k.startswith('T')]
lo, hi = u['T1_do_dai']; zlo, zhi = u['T1_do_dai_zh']
print('== Độ dài T1 (EN %d–%d, ZH %d–%d) ==' % (lo, hi, zlo, zhi))
bad = 0
for i, (e, z) in enumerate(zip(mau['T1']['en'], mau['T1']['zh'])):
    ne = len(re.findall(r"[^\W\d_][\w'’-]*|___", e)); nz = len(re.findall(r'[一-鿿]', z))
    ok = lo <= ne <= hi and zlo <= nz <= zhi; bad += not ok
    print(' phần %d: EN %d · ZH %d %s' % (i + 1, ne, nz, 'OK' if ok else 'LỆCH'))
print('== Từ Mới: văn bản chứa (lõi ≥3 và có T1; vòng ngoài ≥2) ==')
for L in ('en', 'zh'):
    for x in u['tu_' + L]:
        w = x['tu']
        if L == 'en':
            vs = [v.strip() for v in w.lower().split('/')]
            where = [t for t in ts if any(f in norm(txt(t, 'en')) for v in vs for f in (' %s ' % v, ' %ss ' % v))]
        else:
            where = [t for t in ts if w in txt(t, 'zh')]
        core = x['nhan'] == 'Lõi'   # vòng ngoài và từ "Nền Little Seed" dạy lại: ≥2 văn bản
        miss = (len(where) < 3 or 'T1' not in where) if core else len(where) < 2
        bad += miss
        print(' %s %-10s %-4s %s%s' % (L, w, 'lõi' if core else 'ngoài', ','.join(where), '  <-- THIẾU' if miss else ''))
print('== Câu cửa miệng ==')
for c in u['cau_cua_mieng']:
    e = [t for t in ts if c['en'].lower().rstrip('!?') in txt(t, 'en').lower()]
    z = [t for t in ts if c['zh'].rstrip('！？') in txt(t, 'zh')]
    print(' ', c['en'], e, c['zh'], z)
print('== Từ hay sai (máy chọn) ==', u['tu_hay_sai'], '· T1 có:',
      [w for w in u['tu_hay_sai']['en'] if w in txt('T1', 'en').lower()] + [w for w in u['tu_hay_sai']['zh'] if w in txt('T1', 'zh')])
FORM = {"let's go", "see you tomorrow", "sorry", "let's sing together", "woof", "good morning", "six", "oops"}
fr = tot = 0
for e in mau['T1']['en']:
    e2 = re.sub(r'["”]\s*(says|say|asks)\s+[\w\'’ ]+?\.', '"', e)
    for s in re.split(r'(?<=[.!?–])["”]?\s+', e2):
        s = s.strip(' "“”,–')
        if not s or s.lower().strip('!?.,') in FORM: continue
        tot += 1; fr += bool(re.search(FR, s.lower()))
print('== Khung câu T1: %d/%d = %.0f%% (≥60%%; không tính câu cửa miệng, tiếng kêu) ==' % (fr, tot, 100 * fr / tot))
bad += fr / tot < .6
mine = {x['tu'].lower() for x in u['tu_en']} | {v for x in u['tu_en'] for v in x['tu'].lower().split('/')}
FUNC = set("a an the is are am it it's i you we they he she my your this and to in on at of no yes go says say asks time let's".split())
names = {'bông', 'leo', 'anna', 'xiaomei', 'vũ', 'lan', 'mrs', "leo's"}
lex = sorted({(t, w) for t in ts for w in re.findall(r"[a-zà-ỹ']+", txt(t, 'en').lower())
              if w not in kn_en | mine | FUNC | names and w.rstrip('s') not in kn_en | mine and not re.match(r'^(đáp|nói|vè|tay|lượt)$', w)})
print('== Từ EN ngoài danh sách đã học (kiểm bằng mắt) ==', lex)
zl = set()
for t in ts:
    z = txt(t, 'zh')
    for w in re.findall(r'[一-鿿]+', z):
        rest = w
        for k in sorted(kn_zh | {x['tu'] for x in u['tu_zh']}, key=len, reverse=True):
            rest = rest.replace(k, '')
        rest = re.sub('[说的是了们还有好吧个这那和也很都]', '', rest)
        if rest: zl.add((t, rest))
print('== Chữ Hán ngoài danh sách (kiểm bằng mắt) ==', sorted(zl))
print('THIẾU / LỆCH:', bad)
if DOC_LAP or C not in ORDER: print('(khóa độc lập: không tính từ của khóa trước là đã biết)')
