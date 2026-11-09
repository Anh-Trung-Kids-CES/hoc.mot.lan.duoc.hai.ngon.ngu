# -*- coding: utf-8 -*-
"""Ngoại lệ chị duyệt 09/11/2026 (NL-1): chuyển bớt từ vòng ngoài của Larva sang Larva Plus và Pupa
để tải từ mới không nhảy (ng.t. 19). Bảng chuyển: grid/mang/chuyen_tu_larva.json.
- Từ thi Movers/YCT1–3 và từ không có đơn vị Pupa hợp chủ đề → unit Larva Plus cùng chủ đề (trước mốc Movers/YCT3).
- Từ Flyers / ngoài danh sách thi có unit Pupa hợp chủ đề → Pupa.
- Từ Trung cùng nghĩa đi theo từ Anh (Anh trước, Trung sau); giữ lại ở Larva nếu nghĩa Anh khác của nó vẫn ở Larva.
Chạy một lần trong cong-cu/khung/:  python3 audit/chuyen_tu_larva.py  (chạy lại không nhân đôi).
"""
import json, glob, re, os, sys

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
G = K + 'grid/'
sys.path.insert(0, K + 'audit')
from tu2tang import split_items, en_key, zh_parse  # noqa

SEG = re.compile(r'^(\s*)Mới(\s*·\s*(?:lõi|vòng ngoài))?(\s*\([^)]*\))?\s*:(.*)$', re.S)
TAG = 'Mới · vòng ngoài (chuyển từ Larva)'


def load(c):
    out = {}
    for f in sorted(glob.glob(G + 'out/%s-?.json' % c)):
        out[f] = json.load(open(f))
    return out


def strip_cell(cell, drop, lang):
    segs = []
    for seg in cell.split(' | '):
        m = SEG.match(seg)
        if not m:
            segs.append(seg); continue
        items = split_items(m.group(4))
        keep = [it for it in items if (en_key(it) if lang == 'en' else zh_parse(it)[0]) not in drop]
        if len(keep) == len(items):
            segs.append(seg)
        elif keep:
            segs.append('Mới%s%s: %s' % (m.group(2) or '', m.group(3) or '', ', '.join(keep)))
    return ' | '.join(segs)


def add_cell(cell, items):
    if not items:
        return cell
    segs = [s for s in cell.split(' | ') if not s.startswith(TAG)]
    old = next((s for s in cell.split(' | ') if s.startswith(TAG)), None)
    have = split_items(old.split(':', 1)[1]) if old else []
    allit = have + [i for i in items if i not in have]
    i = max([k for k, s in enumerate(segs) if s.lstrip().startswith('Mới')] + [-1]) + 1
    segs.insert(i, '%s: %s' % (TAG, ', '.join(allit)))
    return ' | '.join(segs)


def main():
    moves = json.load(open(G + 'mang/chuyen_tu_larva.json'))
    larva, lp, pupa = load('larva'), load('larva-plus'), load('pupa')
    raw = {}
    # 1. Bỏ khỏi Larva (giữ nguyên văn mục để chép sang nơi mới)
    for f, d in larva.items():
        for r in d['rows']:
            u = str(r['unit'])
            dropen = {o['en'] for o in moves if o['larva_unit'] == u}
            dropzh = {z for o in moves if o['larva_unit'] == u for z in o['zh']}
            if not dropen:
                continue
            cells = [w for w in r['web']] + [{'en': {'tu': r['lop']['en']['flash']}, 'zh': {'tu': r['lop']['zh']['flash']}, '_lop': True}]
            for w in cells:
                for L, drop in (('en', dropen), ('zh', dropzh)):
                    for seg in w[L]['tu'].split(' | '):
                        m = SEG.match(seg)
                        if m:
                            for it in split_items(m.group(4)):
                                k = en_key(it) if L == 'en' else zh_parse(it)[0]
                                if k in drop:
                                    raw.setdefault((L, k), it)
                    w[L]['tu'] = strip_cell(w[L]['tu'], drop, L)
                if w.get('_lop'):
                    r['lop']['en']['flash'], r['lop']['zh']['flash'] = w['en']['tu'], w['zh']['tu']
    # 2. Thêm vào unit đích, rải đều ngày web 1–5 của unit, từ Trung cùng ngày với từ Anh
    for o in moves:
        o['raw_en'] = raw.get(('en', o['en']), o['en'])
        o['raw_zh'] = [raw.get(('zh', z), z) for z in o['zh']]
    for dest_prefix, files in (('LP', lp), ('P', pupa)):
        by_unit = {}
        for o in moves:
            if o['dest'].startswith(dest_prefix) and (dest_prefix == 'P') == (not o['dest'].startswith('LP')):
                by_unit.setdefault(o['dest'][len(dest_prefix):], []).append(o)
        for f, d in files.items():
            for r in d['rows']:
                u = str(r['unit'])
                if u not in by_unit:
                    continue
        for u, os_ in by_unit.items():
            days = sorted(w['ngay'] for d in files.values() for r in d['rows'] if str(r['unit']) == u for w in r['web'])[:5]
            plan = {dd: {'en': [], 'zh': []} for dd in days}
            for i, o in enumerate(os_):
                dd = days[i % len(days)]
                plan[dd]['en'].append(o['raw_en']); plan[dd]['zh'] += o['raw_zh']
                o['ngay_moi'] = dd
            for d in files.values():
                for r in d['rows']:
                    for w in r['web']:
                        if w['ngay'] in plan and str(r['unit']) == u:
                            w['en']['tu'] = add_cell(w['en']['tu'], plan[w['ngay']]['en'])
                            w['zh']['tu'] = add_cell(w['zh']['tu'], plan[w['ngay']]['zh'])
    for files in (larva, lp, pupa):
        for f, d in files.items():
            json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
    # 3. Kế hoạch mạng văn bản: bỏ khỏi Larva, thêm vào Pupa (T1 + T3); Larva Plus dựng trong build_mang
    pl = json.load(open(G + 'mang/plan_larva.json'))
    for p in pl:
        dropen = {o['en'] for o in moves if o['larva_unit'] == str(p['unit'])}
        dropzh = {z for o in moves if o['larva_unit'] == str(p['unit']) for z in o['zh']}
        if not dropen:
            continue
        for t in p['van_ban']:
            t['tu_en'] = [x for x in t.get('tu_en', []) if x not in dropen]
            t['tu_zh'] = [x for x in t.get('tu_zh', []) if x not in dropzh]
            if 'o_thay' in t:
                t['o_thay'] = [x for x in t['o_thay'] if x not in dropen]
            for ph in t.get('phan', []):
                ph['tu_moi_vao'] = [x for x in ph.get('tu_moi_vao', []) if x not in dropen]
        p['dem_vong_ngoai'] = {k: v for k, v in (p.get('dem_vong_ngoai') or {}).items() if k not in dropen and k not in dropzh}
        note = 'NL-1 (09/11): chuyển sang Larva Plus/Pupa: ' + ', '.join(sorted(dropen))
        if note not in (p.get('ghi_chu') or ''):
            p['ghi_chu'] = ((p.get('ghi_chu') or '') + ' ' + note).strip()
    json.dump(pl, open(G + 'mang/plan_larva.json', 'w'), ensure_ascii=False, indent=1)
    pp = json.load(open(G + 'mang/plan_pupa.json'))
    for p in pp:
        add = [o for o in moves if o['dest'] == 'P' + str(p['unit'])]
        if not add:
            continue
        vb = {t['id']: t for t in p['van_ban']}
        for o in add:
            for tid in ('T1', 'T3'):
                if o['en'] not in vb[tid].setdefault('tu_en', []):
                    vb[tid]['tu_en'].append(o['en'])
                for z in o['zh']:
                    if z not in vb[tid].setdefault('tu_zh', []):
                        vb[tid]['tu_zh'].append(z)
            p.setdefault('dem_vong_ngoai', {})[o['en']] = 'T1 + T3 (chuyển từ Larva U%s)' % o['larva_unit']
            for z in o['zh']:
                p['dem_vong_ngoai'][z] = 'T1 + T3 (chuyển từ Larva U%s)' % o['larva_unit']
        note = 'NL-1 (09/11): nhận từ Larva: ' + ', '.join(o['en'] for o in add) + ' – viết vào truyện khung và big book khi viết trọn.'
        if note not in (p.get('ghi_chu') or ''):
            p['ghi_chu'] = ((p.get('ghi_chu') or '') + ' ' + note).strip()
    json.dump(pp, open(G + 'mang/plan_pupa.json', 'w'), ensure_ascii=False, indent=1)
    json.dump(moves, open(G + 'mang/chuyen_tu_larva.json', 'w'), ensure_ascii=False, indent=1)
    print('đã chuyển', len(moves), 'từ Anh,', sum(len(o['zh']) for o in moves), 'từ Trung')


if __name__ == '__main__':
    main()
