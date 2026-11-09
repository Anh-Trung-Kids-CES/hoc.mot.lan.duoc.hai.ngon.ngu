# -*- coding: utf-8 -*-
"""Dựng cấu trúc mạng văn bản theo unit cho khung 9 khóa (NguyenTac_LapLai_DangBai.md mục I, K, L; ng.t. 4, 7b, 15).

Đầu vào: grid/tu2tang.json (nhãn 2 tầng), grid/mang/plan_<khóa>.json (kế hoạch mạng văn bản từng unit).
Đầu ra:  grid/mang/<khóa>.json   – mỗi unit: nhãn từ, khung câu, văn bản, văn bản theo ngày/buổi,
                                   lịch gọi lại, từ vòng ngoài quay lại, nghe ngấm, reader, bộ học tại nhà.
         --relabel: ghi nhãn vào ô từ của grid/out/*.json và gắn văn bản của ngày vào ô truyện, bài hát.
Chạy trong cong-cu/khung/:  python3 audit/build_mang.py [--relabel]
"""
import json, glob, re, os, sys, collections

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
G = K + 'grid/'
sys.path.insert(0, K + 'audit')
from tu2tang import ORDER, REVIEW, load_rows, unit_texts, split_items, en_key, zh_parse  # noqa

GROUP = {'preb': 'đầu', 'little-seed': 'đầu', 'seedling': 'đầu', 'canopy': 'giữa', 'larva': 'giữa',
         'larva-plus': 'cao', 'pupa': 'cao', 'cocoon': 'cao', 'butterfly': 'cao'}
TEXT7B = {'preb': 'A', 'little-seed': 'A', 'seedling': 'A', 'canopy': 'B', 'larva': 'B', 'pupa': 'C', 'cocoon': 'C'}
IRPP = ['Introduce', 'Repeat', 'Practice', 'Produce']
COURSE_NAME = {'preb': 'PreB', 'little-seed': 'Little Seed', 'seedling': 'Seedling', 'canopy': 'Canopy', 'larva': 'Larva',
               'larva-plus': 'Larva Plus', 'pupa': 'Pupa', 'cocoon': 'Cocoon', 'butterfly': 'Butterfly'}


def tid(plan, kind):
    for t in plan.get('van_ban', []):
        if t['loai'].lower().startswith(kind.lower()):
            return t['id']
    return None


def day_slots(c, plan, ndays):
    """Văn bản có mặt ở từng ngày web của unit (ng.t. 4, 7b, 27: mỗi văn bản có mặt ở hầu hết ngày web)."""
    song, big, ve, zh = tid(plan, 'Bài hát'), tid(plan, 'Big book'), tid(plan, 'Vè'), tid(plan, 'Bài tiếng Trung')
    sib, exam = tid(plan, 'Truyện anh em'), tid(plan, 'Đọc dạng đề')
    nparts = len(next((t.get('phan', []) for t in plan['van_ban'] if t['id'] == 'T1'), [])) or 5
    g = TEXT7B[c]
    last_part_day = min(nparts, {'A': 5, 'B': 5, 'C': 5}[g], ndays - 1)
    out = []
    for d in range(1, ndays + 1):
        s = []
        if d <= last_part_day:
            s.append('T1 phần %d' % d + (' (+ nghe lại phần trước)' if d > 1 else ''))
        elif g == 'B' and d == ndays and sib:
            s.append('%s truyện anh em' % sib)
        elif g == 'C' and d == ndays - 1 and sib:
            s.append('%s truyện anh em' % sib)
        elif g == 'C' and d == ndays and exam:
            s.append('%s đọc dạng đề (văn bản mới)' % exam)
        else:
            s.append('T1 cả truyện')
        if ndays <= 4:   # PreB
            pat = {1: [song], 2: [song, ve], 3: [big, song], 4: [ve, big]}[d]
        else:
            pat = []
            if song and d in (1, 2, 3, 5, 6, 8): pat.append(song)
            if ve and d in (2, 3, 4, 6, 7, 8): pat.append(ve)
            if big and d in (3, 4, 5, 7, 8): pat.append(big)
            if zh and d in (4, 6, 8): pat.append(zh)
        s += [p for p in pat if p]
        out.append(s)
    return out


def class_slots(plan, nbuoi):
    """Mỗi buổi lớp: vai chính theo Introduce → Repeat → Practice → Produce; mọi văn bản có mặt ở mọi buổi (ng.t. 27)."""
    ids = [t['id'] for t in plan.get('van_ban', []) if t['id'] in ('T1', 'T2', 'T3', 'T4', 'T5')]
    out = []
    for b in range(nbuoi):
        role = IRPP[b] if nbuoi == 4 else IRPP[min(3, b * 2)]
        out.append({'vai': role, 'van_ban': ids, 'vai_cua_con': ['nghe, chỉ tranh', 'làm động tác, nói từ trong ô',
                                                                 'nói cùng, thay tên mình/bạn vào ô', 'tự nói, phiên dịch nhí'][IRPP.index(role)]})
    return out


def first_day(first, rows):
    n = int(re.search(r'\d+', first).group())
    if first.startswith('buổi'):
        r = next(r for r in rows if r['buoi'] == n)
        return r['web'][0]['ngay']
    return n


def recall_days(n, last, k):
    """Lịch gọi lại giãn cách (ng.t. 15): hôm đó, ngày web kế, ~1 tuần (4 ngày web), ~3 tuần (12), cuối unit/khóa ôn."""
    steps = [0, 1, 4, 12, None][:k]
    out = []
    for s in steps:
        if s is None:
            out.append('khóa ôn / ôn chặng')
        else:
            out.append(n + s if n + s <= last else 'khóa sau (ôn đầu khóa)')
    return out


def main(relabel=False):
    T2 = json.load(open(G + 'tu2tang.json'))
    allT = collections.OrderedDict()           # (khóa, unit) -> văn bản đầy đủ, theo thứ tự chương trình
    rows_by = {}
    for c in ORDER:
        rows_by[c] = load_rows(c)
        for u, t in unit_texts(rows_by[c]).items():
            allT[(c, str(u))] = t
    keys = list(allT)
    os.makedirs(G + 'mang', exist_ok=True)
    plans = {}
    for c in ORDER:
        f = G + 'mang/plan_%s.json' % c
        if os.path.exists(f):
            plans[c] = {str(p['unit']): p for p in json.load(open(f))}
    scheduled = collections.defaultdict(lambda: {'en': [], 'zh': []})   # (khóa, unit) -> từ vòng ngoài quay lại

    # Ng.t. 41: mỗi từ vòng ngoài quay lại ở ≥2 unit sau
    returns = {}
    for c in ORDER:
        for u, d in T2[c].items():
            i = keys.index((c, u))
            later = [k for k in keys[i + 1:] if not (k[0] in REVIEW)]
            for L in ('en', 'zh'):
                for it in d[L]:
                    if it['tier'] != 'Vòng ngoài':
                        continue
                    w = it['w']
                    found = []
                    for k in keys[i + 1:]:
                        t = allT[k][L]
                        if (L == 'en' and ((' ' + w + ' ') in t or (' ' + w + 's ') in t)) or (L == 'zh' and w in t):
                            found.append('%s U%s' % (COURSE_NAME[k[0]], k[1]))
                        if len(found) >= 2:
                            break
                    need = 2 - len(found)
                    sched = []
                    for k in later:
                        if need <= 0:
                            break
                        lab = '%s U%s' % (COURSE_NAME[k[0]], k[1])
                        if lab in found:
                            continue
                        scheduled[k][L].append(w)
                        sched.append(lab); need -= 1
                    returns[(c, u, L, w)] = {'da_co': found, 'xep_them': sched}

    for c in ORDER:
        rows = rows_by[c]
        last_day = max(w['ngay'] for r in rows for w in r['web'])
        res = []
        prev_units = []
        for u, d in T2[c].items():
            unit_rows = [r for r in rows if str(r['unit']) == u]
            plan = plans.get(c, {}).get(u)
            rec = {'unit': u, 'khoa': COURSE_NAME[c], 'chu_de': unit_rows[0]['label_buoi'].split('·', 1)[-1].strip(),
                   'ngay_web': d['days'], 'buoi': [r['buoi'] for r in unit_rows]}
            # nhãn và lịch gọi lại
            for L in ('en', 'zh'):
                items = []
                for it in d[L]:
                    n = first_day(it['first'], rows)
                    k = 5 if it['tier'] in ('Lõi',) or it.get('ex40') else 3
                    x = {'tu': it['w'], 'nghia': it.get('gloss', ''), 'nhan': it['tier'], 'ly_do': it.get('why', ''),
                         'ngoai_le_40': it.get('ex40', ''), 'may_khong_chac': bool(it.get('unsure')), 'thi': it['exam'],
                         'gap_dau': it['first'], 'goi_lai': recall_days(n, last_day, k) if c not in REVIEW else [],
                         'buoc_chu': bool(it.get('ex40')) or (it['tier'] == 'Lõi' and (L == 'zh' or GROUP[c] != 'đầu'))}
                    if it['tier'] == 'Vòng ngoài':
                        x['quay_lai'] = returns[(c, u, L, it['w'])]
                    items.append(x)
                rec['tu_' + L] = items
            rec['tu_cu_quay_lai'] = scheduled.get((c, u), {'en': [], 'zh': []})
            if c in REVIEW:
                src = re.findall(r'(Larva|Pupa|Cocoon) U(\d+)', unit_rows[0]['label_buoi'])
                rec['nghe_lai_mang'] = ['%s U%s' % s for s in src]
                rec['van_ban'] = [{'id': 'R%d' % (j + 1), 'loai': 'Mạng văn bản cũ', 'nguon': '%s U%s: T1 truyện khung (cài từ hay sai), T2 bài hát, T4 vè' % s}
                                  for j, s in enumerate(src)] + [{'id': 'N1', 'loai': 'Văn bản mới theo dạng đề', 'nguon': 'nửa thời gian nghe, đọc (ng.t. 7b)'}]
                nd = len(d['days'])
                rec['van_ban_theo_ngay'] = [[('R%d' % ((i // 2) % max(1, len(src)) + 1)) if i % 2 == 0 else 'N1 văn bản mới dạng đề'] for i in range(nd)]
                rec['nghe_ngam'] = {'bo': ['%s T1, T2, T4' % x for x in rec['nghe_lai_mang']], 'thoi_luong': '6–8 phút', 'bac': GROUP[c]}
            elif plan:
                for kk in ('khung_cau', 'cau_cua_mieng', 'van_ban', 'dem_vong_ngoai', 'de_nghi_doi_nhan', 'ghi_chu'):
                    rec[kk] = plan.get(kk)
                rec['van_ban_theo_ngay'] = day_slots(c, plan, len(d['days']))
                rec['van_ban_tren_lop'] = class_slots(plan, len(unit_rows))
                prev = prev_units[-2:]
                rec['nghe_ngam'] = {
                    'bo': [t['id'] + ' ' + t['loai'] for t in plan['van_ban'] if t['id'] in ('T1', 'T2', 'T3', 'T4', 'T5')
                           and not (GROUP[c] == 'đầu' and t['id'] == 'T1' and c == 'little-seed' and False)],
                    'on_xoan_oc': (['U%s T2 bài hát' % prev[-1]] if prev else []) + (['U%s T4 vè' % prev[-2]] if len(prev) > 1 else []),
                    'thoi_luong': '6–8 phút (bộ của unit) + 1–2 bài unit cũ',
                    'bac': GROUP[c],
                    'cach_nghe': '2–3 lượt × 10–15 phút/ngày theo mốc cố định; hiểu trước (nghe có reader hoặc gặp trên lớp) rồi mới nghe ngấm (ng.t. 48–49)'}
                if GROUP[c] == 'đầu':
                    rec['nghe_ngam']['noi_dung'] = 'chủ yếu bài hát, vè, câu cửa miệng; truyện khung ở bản nghe cùng reader'
                elif GROUP[c] == 'giữa':
                    rec['nghe_ngam']['noi_dung'] = 'thêm bản đọc to truyện khung và truyện anh em'
                else:
                    rec['nghe_ngam']['noi_dung'] = 'thêm audio truyện, hội thoại dài hơn, xen bài nghe dạng thi; có thể video ngắn có phụ đề (tính vào giờ màn hình)'
                rec['reader'] = {'van_ban': ['T1'] + (['T6'] if any(t['id'] == 'T6' for t in plan['van_ban']) else []),
                                 'in': 'A5, mã QR tới 2 bản audio (cùng reader có tiếng hiệu lật trang; nghe ngấm tốc độ tự nhiên)',
                                 'cach_dung': {'đầu': 'nghe và chỉ nhân vật, đồ vật; tiếng Trung có pinyin' + ('; Little Seed chỉ tranh' if c == 'little-seed' else ''),
                                               'giữa': 'chỉ tay theo dòng chữ khi nghe, cả chữ Hán đã quen',
                                               'cao': 'đọc thầm theo audio rồi đọc không cần audio'}[GROUP[c]]}
                fl = [x['tu'] for x in rec['tu_en'] if x['nhan'] == 'Lõi' or x['ngoai_le_40']]
                flz = [x['tu'] for x in rec['tu_zh'] if x['nhan'] == 'Lõi' or x['ngoai_le_40']]
                rec['bo_hoc_tai_nha'] = {
                    'flashcard_en': fl, 'flashcard_zh': flz,
                    'poster_the_gioi': [x['tu'] for x in rec['tu_en'] if x['nhan'] == 'Vòng ngoài' or x['tu'] in fl][:20],
                    'poster_cau_cua_mieng': [p.get('en', '') + ' / ' + p.get('zh', '') for p in (plan.get('cau_cua_mieng') or [])],
                    'mo_khoa': 'mở khi con học tới unit này; đồ unit cũ giữ nguyên (ng.t. 56)'}
            prev_units.append(u)
            res.append(rec)
        json.dump(res, open(G + 'mang/%s.json' % c, 'w'), ensure_ascii=False, indent=1)
        print(c, 'units', len(res), 'có kế hoạch mạng', sum(1 for r in res if r.get('van_ban')))
    if relabel:
        do_relabel(T2, plans)


SEG = re.compile(r'^(\s*)Mới(\s*\([^)]*\))?\s*:(.*)$', re.S)


def do_relabel(T2, plans):
    for c in ORDER:
        mang = {r['unit']: r for r in json.load(open(G + 'mang/%s.json' % c))}
        for f in sorted(glob.glob(G + 'out/%s-?.json' % c)):
            d = json.load(open(f))
            for r in d['rows']:
                u = str(r['unit'])
                if u not in T2[c]:
                    continue
                lab = {L: {x['w']: x['tier'] for x in T2[c][u][L]} for L in ('en', 'zh')}
                m = mang[u]
                cells = [(w, 'tu') for w in r['web']] + [({'en': r['lop']['en'], 'zh': r['lop']['zh']}, 'flash')]
                for w, key in cells:
                    for L in ('en', 'zh'):
                        segs = []
                        for seg in w[L][key].split(' | '):
                            mm = SEG.match(seg)
                            if not mm or c in REVIEW:
                                segs.append(seg); continue
                            lo, ng = [], []
                            for it in split_items(mm.group(3)):
                                k = en_key(it) if L == 'en' else zh_parse(it)[0]
                                (ng if lab[L].get(k) == 'Vòng ngoài' else lo).append(it)
                            par = mm.group(2) or ''
                            if lo: segs.append('Mới · lõi%s: %s' % (par, ', '.join(lo)))
                            if ng: segs.append('Mới · vòng ngoài%s: %s' % (par, ', '.join(ng)))
                            if not lo and not ng: segs.append(seg)
                        w[L][key] = ' | '.join(segs)
                # văn bản của ngày và bài của unit
                if m.get('van_ban_theo_ngay'):
                    for w in r['web']:
                        i = m['ngay_web'].index(w['ngay'])
                        tag = '[Mạng unit – văn bản của ngày: %s]' % ' · '.join(m['van_ban_theo_ngay'][i])
                        for L in ('en', 'zh'):
                            old = re.sub(r'^\[Mạng unit[^\]]*\]\s*(\[Bản cũ[^\]]*\]\s*)?', '', w[L]['truyen'])
                            w[L]['truyen'] = tag + ' [Bản cũ – thay khi viết truyện khung] ' + old
                    vb = {t['id']: t for t in m.get('van_ban') or []}
                    for L in ('en', 'zh'):
                        kk = 'khung_' + L
                        songs = ' + '.join('%s %s (%s): %s' % (t['id'], t['loai'], t.get('kieu', ''), t.get(kk, ''))
                                           for i_, t in vb.items() if i_ in ('T2', 'T4'))
                        old = re.sub(r'^\[Bài của unit[^\]]*\]\s*(\[Bản cũ[^\]]*\]\s*)?', '', r['lop'][L]['baihat'])
                        r['lop'][L]['baihat'] = '[Bài của unit, cố định cả 4 buổi: %s] [Bản cũ] %s' % (songs, old)
            json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
    print('đã ghi nhãn vào grid/out')


if __name__ == '__main__':
    main('--relabel' in sys.argv)
