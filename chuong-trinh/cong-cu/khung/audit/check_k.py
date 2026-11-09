# -*- coding: utf-8 -*-
"""Kiểm tra tự động trước khi chốt (NguyenTac_LapLai_DangBai.md, nguyên tắc 43) – 7 lỗi đỏ.

Chạy trong cong-cu/khung/:  python3 audit/check_k.py [--json]
Đọc grid/mang/<khóa>.json (từ build_mang.py) và grid/out/*.json.
Mức kiểm: KẾ HOẠCH (danh sách từ mỗi văn bản trong mạng) cho unit chưa viết văn bản; VĂN BẢN THẬT cho unit đã có
file mẫu grid/mang/mau_<khóa>_u<n>.json. Còn báo đỏ thì không đưa lên Sheet, web, hay giao (trừ ngoại lệ chị duyệt).
"""
import json, re, os, sys, collections

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
G = K + 'grid/'
sys.path.insert(0, K + 'audit')
from tu2tang import ORDER, REVIEW, load_rows  # noqa

MIL = {'YCT1': 'seedling', 'Starters': 'canopy', 'YCT2': 'canopy', 'Movers': 'larva-plus', 'YCT3': 'larva-plus',   # NL-1 (09/11): mốc Movers/YCT3 sau Larva Plus
       'Flyers': 'butterfly', 'YCT4': 'butterfly'}
CHECKS = {1: 'số từ lõi một tiếng ngoài 12–15 (unit >15 từ)', 2: 'từ lõi có mặt dưới 3 văn bản',
          3: 'từ vòng ngoài dưới 2 lần trong unit hoặc dưới 3 lượt gọi lại',
          4: 'từ thi bắt viết/nói thiếu bước luyện hoặc thiếu 5 lượt gọi lại',
          5: 'từ vòng ngoài không quay lại ở ít nhất 2 unit sau', 6: 'lõi tiếng Trung có từ ngoài lõi tiếng Anh',
          7: 'từ thi dưới 5 lần gặp trước mốc thi',
          8: '(kiểm thêm, NL-2) phần truyện khung ngoài mức độ dài của bậc', 9: '(kiểm thêm, ng.t. 6) truyện khung thiếu 1–2 từ hay sai của unit trước'}


def norm_en(t):
    t = t.lower().replace('é', 'e')
    t = re.sub(r'(?<=[a-z])[-.](?=[a-z])', '', t)       # e-book→ebook, a.m.→am, x-ray→xray, T-shirt→tshirt
    return ' ' + re.sub(r"[^a-z' ]+", ' ', t) + ' '


def forms(w):
    out = {w}
    if w and ' ' not in w:
        out |= {w + 's', w + 'es', w + 'ed', w + 'd', w + 'ing', w + "'s"}
        if w.endswith('y'): out |= {w[:-1] + 'ies', w[:-1] + 'ied'}
        if w.endswith('e'): out.add(w[:-1] + 'ing')
        if re.search(r'[^aeiou][aeiou][bdgmnprt]$', w): out |= {w + w[-1] + 'ing', w + w[-1] + 'ed'}
    return out


def appearances(where):
    """Đếm số lần trong chuỗi mô tả nơi xuất hiện, ví dụ 'T1 phần 2 + T3' -> 2, 'T1 phần 1, phần 4' -> 2."""
    if not where:
        return 0
    n = len(re.findall(r'[TNR]\d', where))
    n += max(0, len(re.findall(r'phần\s*\d', where)) - len(re.findall(r'T1\s*phần', where)))
    return n


def main(as_json=False):
    red = collections.defaultdict(list)
    note = []
    for c in ORDER:
        f = G + 'mang/%s.json' % c
        if not os.path.exists(f):
            red[0].append('%s: chưa có grid/mang/%s.json' % (c, c)); continue
        for r in json.load(open(f)):
            u = 'U' + r['unit']
            tag = '%s %s' % (r['khoa'], u)
            mau = None
            if c in REVIEW:
                # khóa ôn: chỉ kiểm từ chuyển từ Larva (NL-1) – đủ 2 lần, gọi lại, ngoại lệ 40
                dv = r.get('dem_vong_ngoai') or {}
                for L in ('en', 'zh'):
                    for x in r['tu_' + L]:
                        if x['nhan'] != 'Vòng ngoài':
                            continue
                        if appearances(dv.get(x['tu'], '')) < 2 or len(x['goi_lai']) < 3:
                            red[3].append('%s %s: "%s"' % (tag, L, x['tu']))
                        if x['ngoai_le_40'] and (not x['buoc_chu'] or len(x['goi_lai']) < 5):
                            red[4].append('%s %s: "%s"' % (tag, L, x['tu']))
                continue
            # kiểm thêm (NL-2, ng.t. 6): độ dài truyện khung theo bậc, 1–2 từ hay sai của unit trước
            lo_hi = r.get('T1_do_dai')
            mau_ = G + 'mang/mau_%s_u%s.json' % (c, r['unit'])
            if lo_hi and os.path.exists(mau_):
                for i, part in enumerate(json.load(open(mau_))['T1']['en']):
                    n = len(re.findall(r"[^\W\d_][\w'’-]*|___", part))
                    if not (lo_hi[0] <= n <= lo_hi[1]):
                        red[8].append('%s: T1 phần %d có %d chữ, mức %d–%d' % (tag, i + 1, n, lo_hi[0], lo_hi[1]))
            hs = r.get('tu_hay_sai') or {}
            if r.get('co_unit_truoc') and not (1 <= len(hs.get('en', [])) <= 2):
                red[9].append('%s: %d từ hay sai tiếng Anh' % (tag, len(hs.get('en', []))))
            mau = G + 'mang/mau_%s_u%s.json' % (c, r['unit'])
            full = json.load(open(mau)) if os.path.exists(mau) else None
            vb = r.get('van_ban') or []
            if not vb:
                red[2].append('%s: chưa có kế hoạch mạng văn bản' % tag); continue
            for L in ('en', 'zh'):
                items = r['tu_' + L]
                core = [x for x in items if x['nhan'] == 'Lõi']
                outer = [x for x in items if x['nhan'] == 'Vòng ngoài']
                # (1)
                if len(items) > 15 and not (12 <= len(core) <= 15):
                    red[1].append('%s %s: %d lõi / %d từ Mới' % (tag, L, len(core), len(items)))
                # (2)
                for x in core:
                    if full:
                        def has(t):
                            txt = json.dumps(full.get(t, {}).get(L, ''), ensure_ascii=False)
                            return (norm_en(x['tu']) in norm_en(txt) or (' ' + x['tu'] + 's ') in norm_en(txt)) if L == 'en' else x['tu'] in txt
                        n = sum(1 for t in full if t.startswith('T') and has(t))
                    else:
                        n = sum(1 for t in vb if x['tu'] in (t.get('tu_' + L) or []))
                    if n < 3:
                        red[2].append('%s %s: "%s" ở %d văn bản' % (tag, L, x['tu'], n))
                # (3)
                dv = r.get('dem_vong_ngoai') or {}
                for x in outer:
                    inn = sum(1 for t in vb if x['tu'] in (t.get('tu_' + L) or []))
                    a = max(appearances(dv.get(x['tu'], '')), inn)
                    if a < 2 or len(x['goi_lai']) < 3:
                        red[3].append('%s %s: "%s" %d lần, %d lượt gọi lại' % (tag, L, x['tu'], a, len(x['goi_lai'])))
                # (4)
                for x in items:
                    if x['ngoai_le_40'] and (not x['buoc_chu'] or len(x['goi_lai']) < 5):
                        red[4].append('%s %s: "%s"' % (tag, L, x['tu']))
                # (5)
                for x in outer:
                    q = x.get('quay_lai', {})
                    if len(q.get('da_co', [])) + len(q.get('xep_them', [])) < 2:
                        red[5].append('%s %s: "%s" quay lại %d unit' % (tag, L, x['tu'], len(q.get('da_co', [])) + len(q.get('xep_them', []))))
            # (6) lõi Trung có nghĩa Anh là vòng ngoài Anh
            en_outer = {x['tu'] for x in r['tu_en'] if x['nhan'] == 'Vòng ngoài'}
            for x in r['tu_zh']:
                if x['nhan'] == 'Lõi':
                    gk = [re.sub(r'\(.*?\)', '', g).strip().lower() for g in re.split(r'[,/;]|\s[–-]\s', x['nghia'])]
                    if any(g in en_outer for g in gk) and not any(g in {y['tu'] for y in r['tu_en'] if y['nhan'] == 'Lõi'} for g in gk):
                        red[6].append('%s: %s (= %s)' % (tag, x['tu'], x['nghia']))
    # (7) từ thi trước mốc thi – đếm trên khung (web + lớp), có chuẩn hoá gạch nối, dấu chấm
    cov = json.load(open(K + 'cov/coverage.json'))
    units = {c: [] for c in ORDER}
    for c in ORDER:
        for r in load_rows(c):
            for w in r['web']:
                t = ' '.join(w['en'].values())
                units[c].append((norm_en(t) + norm_en(t.replace('-', ' ')), ' '.join(w['zh'].values())))
            t = ' '.join(r['lop']['en'].values())
            units[c].append((norm_en(t) + norm_en(t.replace('-', ' ')), ' '.join(r['lop']['zh'].values())))
    for x in cov:
        end = ORDER.index(MIL[x['level']])
        vs = [v for v in (re.sub(r'\s+', ' ', y).strip() for y in re.split(r'[/,]', re.sub(r'\(.*?\)', '', x['word']))) if v]
        if not vs:
            continue
        n = 0
        for ci, c in enumerate(ORDER[:end + 1]):
            for e, z in units[c]:
                if x['lang'] == 'Tiếng Anh':
                    if any((' ' + f + ' ') in e for v in vs for f in forms(norm_en(v).strip()) if f):
                        n += 1
                elif any(v in z for v in vs):
                    n += 1
        if n < 5:
            red[7].append('%s %s: %d lần trước mốc' % (x['level'], x['word'], n))
    total = sum(len(v) for v in red.values())
    if as_json:
        json.dump({str(k): v for k, v in red.items()}, open(G + 'mang/check_k.json', 'w'), ensure_ascii=False, indent=1)
    print('KIỂM TRA MỤC K (ng.t. 43):', 'ĐẠT – không có báo đỏ' if total == 0 else '%d BÁO ĐỎ' % total)
    for k in sorted(red):
        print(' (%s) %s: %d' % (k, CHECKS.get(k, 'thiếu dữ liệu'), len(red[k])))
        for line in red[k][:12]:
            print('     ', line)
    return total


if __name__ == '__main__':
    sys.exit(1 if main('--json' in sys.argv) else 0)
