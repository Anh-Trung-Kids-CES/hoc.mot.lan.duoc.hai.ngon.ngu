"""Dựng khung Little Seed offline 48 buổi (lớp chưa học PreB) – 48 × 90′, 99 ngày web, 26 tuần.

Nhịp giống Seedling 48: tuần 1–3 mỗi tuần 3 ngày web rồi buổi Chủ nhật; từ tuần 4: 2 ngày web → thứ Tư → 2 ngày web → Chủ nhật;
tuần 26: 2 ngày web và buổi 48 (thứ Tư).

Bố cục:
- Tuần 1–3 (ngày 1–9, buổi 1–3): Unit 1 theo mạng văn bản mới (mang/mau_little-seed_u1.json): ngày 1–5 kể dần 5 phần,
  ngày 6–8 cả truyện, ngày 9 ôn bằng bài hát, vè, big book.
- Tuần 4–25 (ngày 10–97, buổi 4–47): Unit 2–12, mỗi unit 8 ngày web và 4 buổi, lấy nguyên ô của khung 9 khóa
  (out/little-seed-*.json, buổi 7–54) đánh số lại; thêm từ PreB dạy lại và vai I-R-P-P.
- Tuần 26 (ngày 98–99, buổi 48): ôn cả khóa, Album gia đình, trình bày cho phụ huynh (lấy từ buổi 55–56 khung 9 khóa).
- Bỏ: 2 buổi mở khóa ôn PreB, 2 tuần ôn chặng, 2 tuần lễ hội của khung 9 khóa.

Chạy: python3 -I build_ls48.py  (trong thư mục ls48/) → ../grid/mang/little-seed48.json
"""
import json, os, re, copy

HERE = os.path.dirname(os.path.abspath(__file__))
GRID = os.path.join(HERE, '..', 'grid')

rows = []
for p in 'abc':
    rows += json.load(open(os.path.join(GRID, 'out', f'little-seed-{p}.json')))['rows']
old = {r['buoi']: r for r in rows}
plan = {u['unit']: u for u in json.load(open(os.path.join(GRID, 'mang', 'plan_little-seed.json')))}
u1 = json.load(open(os.path.join(GRID, 'mang', 'mau_little-seed_u1.json')))

# ---------------- Từ PreB dạy lại (lớp chưa học PreB) ----------------
# Chỉ tiếng Anh (PreB không có tiếng Trung). Dạy ở unit cùng chủ đề, mức Nền: tranh + tiếng, nghe – chạm, chưa bắt nói.
PREB = {
    1: ['boy', 'girl', 'yes', 'no'],
    2: ['cake', 'seven', 'eight', 'nine', 'ten'],  # nghe đếm tới 10 trong vè; U12 coi là Ôn
    3: ['brother', 'sister'],
    5: ['smile', 'hungry'],
    6: ['pencil', 'desk'],
    7: ['door', 'window', 'bath', 'home'],
    8: ['duck', 'horse', 'frog'],
    9: ['juice', 'egg'],
    12: ['ball', 'toy'],
}
LOI_LOP_B1 = 'Lời lớp học (buổi 1, PreB dạy lại): Sit down, please. / Stand up! / Look! / Listen! / Yes! / No! ↔ 请坐。/ 起立！/ 看！/ 听！/ 对！/ 不对！'
PREB_ALL = {w for ws in PREB.values() for w in ws} | {'sit down', 'stand up'}

ROLE = ['Introduce', 'Repeat + Introduce', 'Practice + Introduce', 'Produce']
ROLE_U1 = ['Introduce', 'Repeat + Introduce', 'Practice + Produce']

def thu_of(buoi):
    if buoi <= 3:
        return 'Chủ nhật'
    return 'thứ Tư' if buoi % 2 == 0 else 'Chủ nhật'

def tuan_of_buoi(b):
    return b if b <= 3 else 4 + (b - 4) // 2

def tuan_of_day(n):
    return (n - 1) // 3 + 1 if n <= 9 else 4 + (n - 10) // 4

def fix_tyre(s):
    # Lỗi dữ liệu Little Seed U5 "tyre" → "tired" (tab Duyệt, sửa an toàn).
    s = re.sub(r',\s*tyre\b', '', s)
    return re.sub(r'\btyre\b', 'tired', s)

def deep_fix(o):
    if isinstance(o, str):
        return fix_tyre(o)
    if isinstance(o, list):
        return [deep_fix(x) for x in o]
    if isinstance(o, dict):
        return {k: deep_fix(v) for k, v in o.items()}
    return o

def strip_preb_tag(s):
    # Khung 9 khóa coi PreB là đã học: "Ôn (PreB): yes, no" → lớp này chưa học PreB.
    return s.replace('Ôn (PreB)', 'Nền PreB (dạy lại)')

days, buoi = [], []

# ---------------- Unit 1: 9 ngày, 3 buổi ----------------
T1 = u1['T1']
def lines(txt):
    return re.findall(r'["“]([^"”]+)["”]', txt)

new_en, new_zh, seen_en, seen_zh = [], [], [], []
vids = [old[3]['web'][0]['en']['video'], old[3]['web'][1]['en']['video'], old[4]['web'][0]['en']['video'],
        old[4]['web'][1]['en']['video'], old[5]['web'][0]['en']['video'], old[5]['web'][1]['en']['video']]
vids_zh = [old[b]['web'][i]['zh']['video'] for b in (3, 4, 5) for i in (0, 1)]
for k in range(5):
    t = T1['tu_moi_theo_phan'][k]
    en_l, zh_l = lines(T1['en'][k]), lines(T1['zh'][k])
    on_en = ', '.join(seen_en) or '–'
    on_zh = ', '.join(seen_zh) or '–'
    nen = ''
    if k == 0:
        nen = ' | Nghe làm quen (câu cửa miệng): Let\'s go! / 走吧'
    if k == 2:
        nen = ' | Nền PreB (dạy lại: tranh + tiếng, chưa bắt nói): boy, girl'
    if k == 3:
        nen = ' | Nền PreB (dạy lại): yes, no (cô dùng ở buổi 1 trong lời lớp học)'
    days.append({
        'ngay': k + 1, 'tuan': tuan_of_day(k + 1), 'unit': 1, 'loai': f'Phần {k + 1}',
        'label': f'Ngày {k + 1}. Unit 1 · Greeting · {T1["phan_ten"][k][0]} · {T1["phan_ten"][k][1]}',
        'en': {'tu': f'Mới · lõi: {", ".join(t["en"])} | Ôn: {on_en}{nen}',
               'cum': ' / '.join(dict.fromkeys(en_l[:4])),
               'cau': ' / '.join(en_l) + ' [Lời web: chỉ tranh và tiếng, không hiện chữ]',
               'truyen': f'[Mạng unit – văn bản của ngày: T1 phần {k + 1}' + (' (+ nghe lại phần trước)' if k else '') + f' · T2] {T1["ten_en"]} · Phần {k + 1}: {T1["phan_ten"][k][0]} — {T1["en"][k]}',
               'video': vids[k]},
        'zh': {'tu': f'Mới · lõi: {", ".join(t["zh"])} | Ôn: {on_zh}',
               'cum': ' / '.join(dict.fromkeys(zh_l[:4])),
               'cau': ' / '.join(zh_l) + f' ({T1["pinyin"][k]})',
               'truyen': f'[Mạng unit – văn bản của ngày: T1 phần {k + 1}] {T1["ten_zh"]} · 第{"一二三四五"[k]}部分：{T1["phan_ten"][k][1]} — {T1["zh"][k]} ({T1["pinyin"][k]})',
               'video': vids_zh[k]},
        'tranh': T1['tranh'][k], 'nguon': 'mạng văn bản U1 (10/11)'})
    seen_en += t['en']; seen_zh += t['zh']

for k, (lab, mang, vt) in enumerate([
        ('Nghe cả truyện, chạm đúng người được chào', 'T1 cả truyện · T2', 'Trả lời câu hỏi bằng chạm tranh: Bông chào ai?'),
        ('Nói câu của Bông; chào hay tạm biệt?', 'T1 cả truyện · T4', 'Nói theo câu Bông, chọn Hello hay Goodbye theo tranh sáng – chiều'),
        ('Phiên dịch nhí: Leo nói, con nói cho Xiaomei', 'T1 cả truyện · T2 · T3', 'Phiên dịch nhí 5 câu: Hello, teacher! → 老师，你好！…'),
        ('Ôn unit: hát, vè, big book Hello and Goodbye', 'T2 · T3 · T4', 'Nghe big book 10 trang, hát Hello, Hello!, vè gọi – đáp')]):
    n = 6 + k
    days.append({
        'ngay': n, 'tuan': tuan_of_day(n), 'unit': 1, 'loai': 'Ôn unit' if n == 9 else 'Cả truyện',
        'label': f'Ngày {n}. Unit 1 · Greeting · {lab}',
        'en': {'tu': f'Mới: – (ngày {"ôn" if n == 9 else "cả truyện"}) | Ôn: {", ".join(seen_en)} | Nền PreB: boy, girl, yes, no',
               'cum': 'Hello, ___! / Goodbye, ___! / See you tomorrow!',
               'cau': vt,
               'truyen': f'[Mạng unit – văn bản của ngày: {mang}] {T1["ten_en"]} (cả 5 phần)' if n < 9 else
                         '[Mạng unit: T2 Hello, Hello! (Mary Had a Little Lamb) · T3 big book Hello and Goodbye · T4 vè Goodbye, See You Tomorrow!]',
               'video': vids[min(5, k + 2)]},
        'zh': {'tu': f'Mới: – | Ôn: {", ".join(seen_zh)}',
               'cum': '___，你好！/ ___，再见！/ 明天见！',
               'cau': '老师，你好！/ 大家好！/ 朋友，你好！/ 大家再见！明天见！/ 爸爸，你好！',
               'truyen': f'[Mạng unit – văn bản của ngày: {mang}] {T1["ten_zh"]}' if n < 9 else
                         '[Mạng unit: T2 你好，你好！· T3 你好，再见 · T4 再见，明天见！]',
               'video': vids_zh[min(5, k + 2)]},
        'nguon': 'mạng văn bản U1 (10/11)'})

def lop_merge(*bs):
    out = {'en': {}, 'zh': {}}
    for l in ('en', 'zh'):
        for f in ('flash', 'slide', 'truyen', 'baihat'):
            parts = [old[b]['lop'][l][f] for b in bs]
            out[l][f] = parts[0] if len(parts) == 1 else ' ‖ '.join(f'(từ buổi {b} khung 9 khóa) {x}' for b, x in zip(bs, parts))
    return out

U1_SESS = [
    (1, [1, 2, 3], 'Unit 1 · Greeting – Làm quen lớp, lời lớp học; chào và tạm biệt mẹ, mèo, cô, bạn (phần 1–3)', (3,)),
    (2, [4, 5, 6], 'Unit 1 · Greeting – Hẹn ngày mai, chào bố, cún; xếp lại cả ngày của Bông (phần 4–5, cả truyện)', (4,)),
    (3, [7, 8, 9], 'Unit 1 · Greeting – Diễn truyện, hát, vè; chào cả lớp bằng hai tiếng (Produce)', (5, 6)),
]
for i, (b, dd, lab, src) in enumerate(U1_SESS):
    lop = lop_merge(*src)
    for l in ('en', 'zh'):
        lop[l]['slide'] = strip_preb_tag(lop[l]['slide'])
        lop[l]['flash'] = lop[l]['flash'].replace('(+ thẻ PreB: boy, girl)', '(+ thẻ Nền PreB dạy lại: boy, girl)')
    # Flash theo phần truyện mới (khung 9 khóa chia từ khác)
    tp = T1['tu_moi_theo_phan']
    rng = {1: range(0, 3), 2: range(3, 5), 3: range(0, 5)}[b]
    fl_en = [w for k in rng for w in tp[k]['en']]
    fl_zh = [w for k in rng for w in tp[k]['zh']]
    on_en = [w for k in range(0, 3) for w in tp[k]['en']] if b == 2 else []
    lop['en']['flash'] = ', '.join(fl_en) + (f' (+ ôn {", ".join(on_en)})' if on_en else '') + (' (+ thẻ Nền PreB dạy lại: boy, girl)' if b == 1 else '')
    lop['zh']['flash'] = ', '.join(fl_zh)
    if b == 1:
        lop['en']['slide'] = LOI_LOP_B1 + ' · [Điều chỉnh cho lớp 48 buổi: buổi 1 chưa dạy daddy, puppy – thay bằng thẻ teacher, everyone, friend của phần 2–3] · ' + lop['en']['slide']
        lop['zh']['slide'] = '[Điều chỉnh: buổi 1 chưa dạy 爸爸, 小狗 – thay bằng 老师, 大家, 朋友] · ' + lop['zh']['slide']
    lop['en']['truyen'] = f'[Truyện khung mới] {T1["ten_en"]} phần ' + ('1–3' if b == 1 else '1–5' if b == 2 else '1–5, diễn 5 vai') + ' ‖ [Bản cũ] ' + lop['en']['truyen']
    lop['zh']['truyen'] = f'[Truyện khung mới] {T1["ten_zh"]} ‖ [Bản cũ] ' + lop['zh']['truyen']
    buoi.append({'buoi': b, 'tuan': tuan_of_buoi(b), 'thu': thu_of(b), 'unit': 1, 'vai': ROLE_U1[i],
                 'label': f'Buổi dạy {b}. {lab}', 'ngay_web': dd, 'lop': lop,
                 'nguon': 'khung 9 khóa buổi ' + ', '.join(map(str, src)) + ' + mạng văn bản U1'})

# ---------------- Unit 2–12: 8 ngày, 4 buổi mỗi unit ----------------
day_n, b_n = 10, 4
for u in range(2, 13):
    obs = [r['buoi'] for r in rows if r['unit'] == u]
    assert len(obs) == 4, (u, obs)
    t1 = [v for v in plan[str(u)]['van_ban'] if v['id'] == 'T1'][0]
    preb = PREB.get(u, [])
    for i, ob in enumerate(obs):
        r = deep_fix(copy.deepcopy(old[ob]))
        dd = []
        for j, w in enumerate(r['web']):
            k = 2 * i + j  # 0..7 trong unit
            w = copy.deepcopy(w)
            w['label'] = re.sub(r'^Ngày \d+\.', f'Ngày {day_n}.', w['label'])
            for l in ('en', 'zh'):
                w[l]['tu'] = strip_preb_tag(w[l]['tu'])
            if k == 0 and preb:
                w['en']['tu'] += ' | Nền PreB (dạy lại: tranh + tiếng, chưa bắt nói): ' + ', '.join(preb)
            if k < 5:
                ph = t1['phan'][k]
                w['en']['truyen'] = f'[Truyện khung (kế hoạch) phần {k + 1}: {ph["y"]} · từ mới vào: {", ".join(ph["tu_moi_vao"])}] ' + w['en']['truyen']
            days.append({'ngay': day_n, 'tuan': tuan_of_day(day_n), 'unit': u,
                         'loai': f'Phần {k + 1}' if k < 5 else 'Cả truyện',
                         'label': w['label'], 'en': w['en'], 'zh': w['zh'],
                         'nguon': f'khung 9 khóa ngày {r["web"][j]["ngay"]}'})
            dd.append(day_n)
            day_n += 1
        lop = r['lop']
        for l in ('en', 'zh'):
            lop[l]['slide'] = strip_preb_tag(lop[l]['slide'])
        if i == 0 and preb:
            lop['en']['flash'] += ' (+ thẻ Nền PreB dạy lại: ' + ', '.join(preb) + ')'
        if i == 3 and u in (4, 8, 12):
            lop['en']['slide'] += f' ‖ [Ôn chặng – thay tuần ôn của khung 9 khóa] 15′ trò chơi quét lại Unit {u - 3}–{u} (mỗi unit 2 tranh, nghe – chạm, rồi mỗi con nói 1 câu của truyện mình thích).'
        lab = re.sub(r'^Buổi dạy \d+\.', f'Buổi dạy {b_n}.', r['label_buoi'])
        buoi.append({'buoi': b_n, 'tuan': tuan_of_buoi(b_n), 'thu': thu_of(b_n), 'unit': u, 'vai': ROLE[i],
                     'label': lab, 'ngay_web': dd, 'lop': lop, 'nguon': f'khung 9 khóa buổi {ob}'})
        b_n += 1


# ---------------- Unit 9 theo mạng văn bản (mau_little-seed_u9.json) – thay ô từ, cụm, truyện của 8 ngày ----------------
_m9 = os.path.join(GRID, 'mang', 'mau_little-seed_u9.json')
if os.path.exists(_m9):
    M9 = json.load(open(_m9)); T9 = M9['T1']; D9 = [d for d in days if d['unit'] == 9]
    seen_en, seen_zh = [], []
    for k, d in enumerate(D9):
        if k < 5:
            t = T9['tu_moi_theo_phan'][k]; P = T9['phan'][k]
            nen = ' | Nền PreB (dạy lại: tranh + tiếng, chưa bắt nói): juice, egg' if k == 0 else ''
            d['en']['tu'] = f'Mới · lõi: {", ".join(t["en"])} | Ôn: {", ".join(seen_en) or "từ U1–U8 trong khung câu"}{nen}'
            d['zh']['tu'] = f'Mới · lõi: {", ".join(t["zh"])} | Ôn: {", ".join(seen_zh) or "–"}'
            d['en']['cum'] = ' / '.join(dict.fromkeys(s[1] for s in P))
            d['zh']['cum'] = ' / '.join(dict.fromkeys(s[2] for s in P))
            d['en']['truyen'] = f'[Mạng unit – văn bản của ngày: T1 phần {k + 1} · T3 · T4] {T9["ten_en"]} · Phần {k + 1}: ' + ' '.join(f'{s[0]}: {s[1]}' for s in P)
            d['zh']['truyen'] = f'[Mạng unit: T1 phần {k + 1}] {T9["ten_zh"]} · ' + ' '.join(f'{s[0]}：{s[2]}' for s in P) + ' (' + ' '.join(s[3] for s in P) + ')'
            d['label'] = f'Ngày {d["ngay"]}. Unit 9 · Food · {T9["phan_ten"][k][0]} · {T9["phan_ten"][k][1]}'
            seen_en += t['en']; seen_zh += t['zh']
        else:
            d['en']['truyen'] = f'[Mạng unit: T1 cả truyện · T3 · T4] {T9["ten_en"]} (cả 5 phần)'
            d['zh']['truyen'] = f'[Mạng unit: T1 cả truyện] {T9["ten_zh"]}'
            d['label'] = f'Ngày {d["ngay"]}. Unit 9 · Food · ' + ['Nghe cả truyện, chạm đúng bạn đang nói', 'Nói câu của các bạn', 'Phiên dịch nhí: con thích gì'][k - 5]
        d['nguon'] = 'mạng văn bản U9 (10/11)'
    for b in buoi:
        if b['unit'] == 9:
            b['lop']['en']['baihat'] = f'[Bài của unit, cố định cả 4 buổi] T2 {M9["T2"]["khung_en"]} ({M9["T2"]["giai_dieu"]}) + T4 vè {M9["T4"]["khung_en"]} ‖ ' + b['lop']['en']['baihat']
            b['lop']['en']['truyen'] = f'[Truyện khung mới] {T9["ten_en"]} ‖ [Bản cũ] ' + b['lop']['en']['truyen']

# ---------------- v2 (10/11/2026 khuya): nguyên tắc 61–68 ----------------
# Truyện khung bản mới (chờ duyệt) của U2, U3, U9, U12 thay ô truyện các ngày Phần; vè mới vào buổi.
_mn = os.path.join(GRID, 'mang', 'mau_ls48_banmoi.json')
if os.path.exists(_mn):
    MN = json.load(open(_mn))
    for us, M in MN.items():
        if us.startswith('_'): continue
        u = int(us); D = [d for d in days if d['unit'] == u]
        for k, d in enumerate(D[:5]):
            t, z, P = M['phan'][k]
            d['en']['truyen'] = (f'[Truyện khung bản mới 10/11 – chờ duyệt] {M["ten_en"]} · Phần {k + 1}: {t} — '
                                 + ' '.join(f'{w}: {e}' for w, e, _ in P))
            d['zh']['truyen'] = f'[Truyện khung bản mới] {M["ten_zh"]} · {z} — ' + ' '.join(f'{w}：{zz}' for w, _, zz in P)
        for d in D[5:]:
            d['en']['truyen'] = f'[Truyện khung bản mới – cả truyện] {M["ten_en"]} (cả 5 phần) ‖ ' + d['en']['truyen']
        ve = ' / '.join(f'{w}: {e}' for w, e, _ in M['ve']); vez = ' / '.join(z for _, _, z in M['ve'])
        for b in buoi:
            if b['unit'] == u:
                b['lop']['en']['baihat'] = f'[Vè mới theo nguyên tắc 65 – chờ duyệt] {ve} ‖ {vez} ‖ ' + b['lop']['en']['baihat']
# v2.2 (11/11/2026): truyện, big book, vè U2–U12 đã viết đủ theo chỉ tiêu và đã lên web 99 ngày (grid/mang/ls48_mang.py) – thay các ô ở trên
import importlib.util as _iu, re as _re
_sp = _iu.spec_from_file_location('ls48_mang', os.path.join(GRID, 'mang', 'ls48_mang.py')); _LM = _iu.module_from_spec(_sp); _sp.loader.exec_module(_LM)
DO_LS = {}
for u, M in sorted(_LM.U.items()):
    D = [d for d in days if d['unit'] == u]
    nw = []
    for k, d in enumerate(D[:5]):
        t, z, P = M['phan'][k]
        nw.append(len(_re.findall(r"[^\W\d_][\w']*", ' '.join(e for _, e, _ in P))))
        d['en']['truyen'] = f'[Truyện unit 11/11 – đã lên web] {M["ten_en"]} · Phần {k + 1}: {t} — ' + ' '.join(f'{w}: {e}' for w, e, _ in P)
        d['zh']['truyen'] = f'[Truyện unit] {M["ten_zh"]} · {z} — ' + ' '.join(f'{w}：{zz}' for w, _, zz in P)
    for d in D[5:]:
        d['en']['truyen'] = f'[Truyện unit – cả truyện] {M["ten_en"]} (cả 5 phần) + big book {M["bb"][0]} + vè'
        d['zh']['truyen'] = f'[Truyện unit – cả truyện] {M["ten_zh"]}'
    DO_LS[u] = f'Đã viết lại 11/11, đã lên web: EN {min(nw)}–{max(nw)} chữ/phần'
    ve = ' / '.join(e for _, e, _, _ in M['ve']); vez = ' / '.join(z for _, _, z, _ in M['ve'])
    bb = ' / '.join(e for _, e, _ in M['bb'][2])
    for b in buoi:
        if b['unit'] == u:
            b['lop']['en']['baihat'] = f'[Vè unit 11/11, có trên web] {ve} ‖ {vez}'
            b['lop']['en']['truyen'] = f'[Truyện unit 11/11] {M["ten_en"]} · {M["ten_zh"]} ‖ Big book {M["bb"][0]}: {bb}'
# Chỉ tiêu 4 mặt theo unit (nguyên tắc 62, 63, 65–67) – sinh bởi chi_tieu_48.py
_ct = os.path.join(GRID, 'mang', 'chi_tieu_48.json')
CT = {x['unit']: x for x in json.load(open(_ct)) if x['lop'] == 'Little Seed 48'} if os.path.exists(_ct) else {}
for d in days:
    c = CT.get(d['unit'])
    if c and str(d['loai']).startswith('Phần'):
        d['chi_tieu'] = (f'Truyện khung mỗi phần: EN {c["en_chu_phan"]} chữ, ~{c["en_chu_cau"]} chữ/câu; ZH {c["zh_chu_phan"]} chữ Hán, ~{c["zh_chu_cau"]} chữ/câu; '
                         f'{c["lien"]}; khung: {c["cau_truc"]}; dùng lại ≥2 mẫu cũ: {c["mau_cu"]}')
for b in buoi:
    c = CT.get(b['unit'])
    if c:
        b['chi_tieu'] = f'Vè: {c["ve"]}. Big book: {c["big_book"]}. Hiện trạng truyện: {DO_LS.get(b["unit"], c["hien_trang"])}'
# Chào đầu buổi / cuối buổi bằng vè (nguyên tắc 66); buổi 1 = khai giảng (nguyên tắc 67)
VE_CHAO = ('Vè chào đầu buổi: Hello, hello, everyone! / Hello, teacher! Class is fun! / What\'s your name? (×2) / ___, ___, that\'s my name! / '
           '___, ___, how old are you? / Five! I\'m five! And you? And you?')
VE_BYE = 'Vè chào cuối buổi: Goodbye, goodbye, everyone! / One, two, three… school is done! / See you tomorrow, ___ and ___! / Goodbye, teacher! Let\'s go!'
for b in buoi:
    if b['buoi'] == 1:
        b['chao'] = ('Sau buổi 0 (khai giảng) và 3 ngày web (1–3, đã nghe tên, chào, tạm biệt): hát trọn hai vè chào; vòng hỏi tên – tuổi đi quanh lớp, con mới nhại – đáp. '
                     + VE_CHAO + ' ‖ ' + VE_BYE)
    else:
        b['chao'] = 'Đầu buổi: ' + VE_CHAO + ' Cuối buổi: ' + VE_BYE + (' Vai con nâng dần: tự nói tên → giới thiệu bạn → hỏi theo cặp.' if b['buoi'] <= 7 else '')
# Buổi 0 – khai giảng (chị quyết 11/11: thêm buổi 0, không tính vào 48 buổi)
B0 = {'buoi': 0, 'tuan': 0, 'thu': 'trước ngày web 1', 'unit': 1, 'vai': 'Khai giảng', 'ngay_web': [],
      'label': 'Buổi 0. Khai giảng · làm quen cô, bạn, lớp; hát phần đơn giản của hai vè chào; hướng dẫn ba mẹ mở web',
      'chao': ('Khai giảng: chỉ hát câu 1–2 vè chào đầu (Hello, hello, everyone! / Hello, teacher! Class is fun!) và câu 1–2 vè chào cuối '
               '(Goodbye, goodbye, everyone! / One, two, three… school is done!), con nhại theo cô, động tác cố định: vẫy tay, vỗ tay, đeo cặp. '
               "Cô dùng thẻ tên từng con (chuẩn bị cho “What's your name?” ở web ngày 1–3)."),
      'lop': {'en': {'flash': 'hello, goodbye, teacher, everyone (chỉ nghe, chưa dạy từ)', 'slide': 'Trò làm quen: nhận thẻ tên, tìm bạn cùng màu; xem tranh lớp học của Bông', 'truyen': 'Cô kể bằng tranh: Bông đến lớp mới (giới thiệu nhân vật)', 'baihat': 'Hai vè chào – câu 1–2'},
              'zh': {'flash': '你好, 再见, 老师, 大家 (chỉ nghe)', 'slide': 'Cô nói lại các câu chào bằng tiếng Trung, con vẫy tay theo', 'truyen': '–', 'baihat': '大家好 / 大家再见 (câu 1–2)'}},
      'nguon': 'nguyên tắc 66–67, chị quyết 11/11',
      'ke_hoach_90': '\n'.join(['Vai buổi: Khai giảng – làm quen, chưa dạy từ; ba mẹ dự 15′ cuối.',
                                '[1] 0–15′ Đón con, thẻ tên, làm quen cô và bạn (trò tìm bạn cùng màu thẻ).',
                                '[2] 15–30′ Vè chào đầu câu 1–2: cô hát mẫu 3 lần với động tác vẫy, vỗ tay; con nhại theo; đổi to – nhỏ.',
                                '[3] 30–45′ Vận động: Leo says / Xiaomei says với các động tác của vè.',
                                '[4] 45–60′ Cô giới thiệu nhân vật bằng tranh (Bông, Leo, Anna, Xiaomei, cô Hươu); con chạm tranh khi cô gọi tên.',
                                '[5] 60–75′ Vè chào cuối câu 1–2, động tác đeo cặp; chụp ảnh lớp.',
                                '[6] 75–90′ Ba mẹ: hướng dẫn mở web ngày 1, mã con, nhóm Zalo, lịch 26 tuần.'])}
buoi.insert(0, B0)

# ---------------- Tuần 26: ôn cả khóa ----------------
for j, (src_day, lab) in enumerate([(109, 'Ôn U1–U6: chào hỏi, tên tuổi, gia đình, cơ thể, cảm xúc, trường lớp – Album trang 1–2'),
                                     (112, 'Ôn U7–U12: nhà, con vật, đồ ăn, thời tiết, màu, số – Album trang 3–4')]):
    ob = 55 if j == 0 else 56
    w = [x for x in old[ob]['web'] if x['ngay'] == src_day][0] if src_day in [x['ngay'] for x in old[ob]['web']] else old[ob]['web'][-1]
    w = copy.deepcopy(w)
    days.append({'ngay': day_n, 'tuan': 26, 'unit': 'Ôn', 'loai': 'Ôn cả khóa', 'label': f'Ngày {day_n}. Cuối khóa · {lab}',
                 'en': w['en'], 'zh': w['zh'], 'nguon': f'khung 9 khóa ngày {w["ngay"]}'})
    day_n += 1
lop = lop_merge(55, 56)
buoi.append({'buoi': 48, 'tuan': 26, 'thu': 'thứ Tư', 'unit': 'Ôn', 'vai': 'Produce cả khóa',
             'label': 'Buổi dạy 48. Cuối khóa · Ôn toàn khóa bằng trò chơi; trình bày Album gia đình hai thứ tiếng (mời phụ huynh)',
             'ngay_web': [98, 99], 'lop': lop, 'nguon': 'khung 9 khóa buổi 55, 56'})

assert len(days) == 99 and [d['ngay'] for d in days] == list(range(1, 100)), len(days)
assert len(buoi) == 49 and [b['buoi'] for b in buoi] == list(range(0, 49)), len(buoi)

# ---------------- Kế hoạch 90 phút (7 khối, không khối nào quá 20′) ----------------
SONG = {}
for u in range(1, 13):
    vb = {v['id']: v for v in plan[str(u)]['van_ban']}
    SONG[u] = (vb['T2'].get('khung_en', ''), vb['T2'].get('khung_zh', ''), vb['T2'].get('giai_dieu', '').replace('dân gian hết bản quyền: ', ''),
               vb['T3'].get('khung_en', ''), vb['T4'].get('khung_en', ''), vb['T4'].get('khung_zh', ''))

FOCUS = {
    'Introduce': 'giới thiệu từ và phần truyện mới: cô làm mẫu, con nghe – chỉ – làm động tác, chưa bắt nói',
    'Repeat + Introduce': 'nhắc lại từ, câu của buổi trước bằng dạng bài khác; giới thiệu phần truyện tiếp theo',
    'Practice + Introduce': 'luyện trong trò chơi, đóng vai theo cặp; giới thiệu phần truyện cuối',
    'Practice + Produce': 'luyện trong trò chơi rồi mỗi con tự nói, diễn trước lớp',
    'Produce': 'con tự nói, diễn truyện, hát, trình bày sản phẩm; cô ghi nhận xét từng con',
    'Produce cả khóa': 'con trình bày Album gia đình hai thứ tiếng cho phụ huynh, hát liên khúc',
}
def plan90(b):
    u = b['unit']
    en, zh = b['lop']['en'], b['lop']['zh']
    s = SONG.get(u) if isinstance(u, int) else None
    song = f'{s[0]} / {s[1]} (giai điệu {s[2]})' if s else 'liên khúc bài hát cả khóa'
    ve = f'{s[4]} / {s[5]}' if s else 'vè của các unit con thích'
    bb = s[3] if s else 'Album gia đình'
    return '\n'.join([
        f'Vai buổi: {b["vai"]} – {FOCUS[b["vai"]]}. Ngày web trước buổi: {", ".join(map(str, b["ngay_web"]))}.',
        f'[1] 0–10′ Chào và khởi động · {b.get("chao", "Vè chào đầu buổi")}; bài hát vận động của unit: {song}; lời lớp học (Look! Listen! Sit down, please. ↔ 看！听！请坐。).',
        f'[2] 10–25′ Khối tiếng Anh · Flash: {en["flash"]} · Hoạt động (chọn 2–3 trong slide): {en["slide"][:600]}',
        f'[3] 25–33′ Vận động – nghỉ mắt · Vè của unit vỗ tay theo nhịp: {ve}; trò Leo says / Xiaomei says với động tác của bài hát.',
        f'[4] 33–50′ Khối tiếng Trung · Flash: {zh["flash"]} · Hoạt động (cùng tranh với khối tiếng Anh): {zh["slide"][:600]}',
        '[5] 50–60′ Nghỉ và làm tay · uống nước, đi vệ sinh; thủ công nhỏ của unit (tô, dán, gấp) dùng tranh của truyện, vừa làm vừa nói từ.',
        f'[6] 60–80′ Truyện unit và big book · Cô kể truyện khung bằng tranh to (EN rồi ZH); lần 2 con chạm tranh, trả lời; lần 3 con nói câu nhân vật. Big book mẫu câu: {bb} (cô đọc, con điền tên mình, bạn mình). Chuyển ngữ: rối Leo nói 1 câu tiếng Anh, con nói lại cho rối Xiaomei.',
        '[7] 80–90′ Tổng kết, phụ huynh · Mỗi con nói 1 câu của buổi bằng hai tiếng; trao sao; vè chào cuối buổi; cô dặn phụ huynh ngày web tiếp theo và phiếu tô – dán ở nhà (1 trang, khoảng 10 phút).',
    ])
for b in buoi:
    if b['buoi'] == 0: continue
    b['ke_hoach_90'] = plan90(b)

out = {'khoa': 'Little Seed offline 48 buổi', 'ban': 'v2.4 (11/11/2026 – nguyên tắc 61–68, thêm buổi 0 khai giảng; truyện, big book, vè U2–U12 đã lên web 99 ngày)',
       'nhip': 'Tuần 1–3: 3 ngày web rồi buổi Chủ nhật. Từ tuần 4: 2 ngày web → buổi thứ Tư → 2 ngày web → buổi Chủ nhật. Tuần 26: 2 ngày web và buổi 48 (thứ Tư).',
       'preb_day_lai': PREB, 'days': days, 'buoi': buoi}
dst = os.path.join(GRID, 'mang', 'little-seed48.json')
json.dump(out, open(dst, 'w'), ensure_ascii=False, indent=1)
print('ok', len(days), 'ngày,', len(buoi), 'buổi →', dst)
