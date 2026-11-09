# -*- coding: utf-8 -*-
"""Đổi nhãn một từ Mới ngay trong khung (grid/out): chuyển mục từ đoạn 'Mới · lõi' sang 'Mới · vòng ngoài' hoặc ngược lại.
Dùng khi chị duyệt tab "Duyệt nhãn". Nhãn ghi trong khung thắng nhãn máy khi chạy lại tu2tang.py.

  python3 audit/doi_nhan.py <khóa> <unit> <en|zh> <từ> <lõi|vòng ngoài> [<từ> <nhãn> ...]
  ví dụ: python3 audit/doi_nhan.py pupa 8 zh 春季 "vòng ngoài"
Sau đó chạy: tu2tang.py → build_mang.py --relabel → check_k.py → to_sheet_mang.py → patch_bang.py
"""
import json, glob, re, os, sys

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
sys.path.insert(0, K + 'audit')
from tu2tang import split_items, en_key, zh_parse  # noqa

SEG = re.compile(r'^(\s*)Mới(?:\s*·\s*(lõi|vòng ngoài))?(\s*\([^)]*\))?\s*:(.*)$', re.S)


def relabel_cell(cell, lang, word, new):
    segs = cell.split(' | ')
    out, moved = [], None
    for seg in segs:
        m = SEG.match(seg)
        if not m or (m.group(2) or '') == new:
            out.append(seg); continue
        items = split_items(m.group(4))
        keep = []
        for it in items:
            k = en_key(it) if lang == 'en' else zh_parse(it)[0]
            if k == word:
                moved = it
            else:
                keep.append(it)
        if keep:
            out.append('Mới%s%s: %s' % (' · ' + m.group(2) if m.group(2) else '', m.group(3) or '', ', '.join(keep)))
    if moved is None:
        return cell, False
    tgt = next((i for i, s in enumerate(out) if (SEG.match(s) and SEG.match(s).group(2) == new and not SEG.match(s).group(3))), None)
    if tgt is None:
        last = max([i for i, s in enumerate(out) if SEG.match(s)] + [-1])
        out.insert(last + 1, 'Mới · %s: %s' % (new, moved))
    else:
        out[tgt] = out[tgt] + ', ' + moved
    return ' | '.join(out), True


def main(args):
    c, u, rest = args[0], args[1], args[2:]
    changes = [(rest[i], rest[i + 1], rest[i + 2]) for i in range(0, len(rest), 3)]
    done = set()
    for f in sorted(glob.glob(K + 'grid/out/%s-?.json' % c)):
        d = json.load(open(f))
        for r in d['rows']:
            if str(r['unit']) != str(u):
                continue
            for lang, word, new in changes:
                for w in r['web']:
                    w[lang]['tu'], ok = relabel_cell(w[lang]['tu'], lang, word, new)
                    if ok: done.add(word)
                r['lop'][lang]['flash'], ok = relabel_cell(r['lop'][lang]['flash'], lang, word, new)
                if ok: done.add(word)
        json.dump(d, open(f, 'w'), ensure_ascii=False, indent=1)
    for _, word, new in changes:
        print(word, '→', new if word in done else 'KHÔNG TÌM THẤY')


if __name__ == '__main__':
    main(sys.argv[1:])
