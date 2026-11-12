"""Tách bước "Big book và vè" thành hai bước riêng (chị chốt 12/11/2026):
  - bước "Big book" (type truyen): chỉ các trang big book;
  - bước "Vè" (type ve): các dòng vè, chữ thường, phách mạnh đánh dấu riêng (không viết hoa trên web), bàn tay sáng theo nhịp.
Chạy được nhiều lần (chỉ đụng bước còn tên "Big book và vè"). Dùng trong little-seed/cong-cu/build_ls.py và seedling/cong-cu/ap_mang_sd48.py;
chạy tay: python3 chuong-trinh/cong-cu/tach_bb_ve.py seedling/seedling-data.js SD
"""
import json, os, re, sys

TEN_RIENG = {'bông', 'leo', 'anna', 'xiaomei', 'vũ', 'lan', 'hươu'}


def nhip(raw):
    """'BAby, BAby, WHO are YOU?' -> [['Baby,', True], ['baby,', True], ['who', True], ['are', False], ['you?', True]]
    Chữ hoa trong nguồn đánh dấu phách mạnh (≥2 chữ hoa trong một từ). Trên web đưa về chữ thường như câu bình thường."""
    out, dau_cau = [], True
    for tok in raw.split():
        core = re.sub(r"[^\w']", '', tok)
        manh = sum(ch.isupper() for ch in core) >= 2
        t = tok
        if manh:
            t = tok.lower()
            if dau_cau or core.lower() in TEN_RIENG or core.lower() == 'i':
                t = re.sub(r'[a-zà-ỹ]', lambda m: m.group(0).upper(), t, count=1)
        out.append([t, manh])
        dau_cau = bool(re.search(r'[.!?]["”’)]?$', tok))
    return out


def dong_ve(s):
    w = nhip(s['en'])
    return {'en': ' '.join(t for t, _ in w), 'w': w, 'raw': s['en'], 'zh': s.get('zh', ''), 'py': s.get('py', ''),
            'img': '' if os.path.basename(s.get('img', '')).startswith('song') else s.get('img', ''),
            'a_en': s.get('a_en', ''), 'a_zh': s.get('a_zh', '')}


def la_ve(st, level):
    """Vị trí các dòng vè trong bước gộp."""
    sc = st['scenes']
    if level == 'SD':
        return {k for k, s in enumerate(sc) if os.path.basename(s.get('img', '')).startswith('song')}
    # Little Seed: bước ngày Phần luôn là 3 trang big book + 2 dòng vè; ngày ôn cả khóa (8 trang) không có vè
    return {3, 4} if len(sc) == 5 else set()


def tach(days, level):
    n_bb = n_ve = 0
    for day in days.values():
        out = []
        for st in day['steps']:
            if st.get('lab') != 'Big book và vè':
                out.append(st); continue
            idx = la_ve(st, level)
            bb = [s for k, s in enumerate(st['scenes']) if k not in idx]
            ve = [s for k, s in enumerate(st['scenes']) if k in idx]
            chao = 'vè chào' in st.get('title', '')
            t = re.sub(r'\s*\+\s*vè( chào)?\s*$', '', st.get('title', '')).strip()
            tz = re.sub(r'\s*\+\s*\S*儿歌\s*$', '', st.get('title_zh', '')).strip()
            if bb:
                out.append(dict(st, lab='Big book', sub='Nghe big book của unit', title=t, title_zh=tz, scenes=bb)); n_bb += 1
            if ve:
                out.append({'type': 've', 'lab': 'Vè', 'sub': 'Vỗ tay theo nhịp',
                            'title': 'Vè chào' if chao else 'Vè của unit', 'title_zh': '问好儿歌' if chao else '儿歌',
                            'lines': [dong_ve(s) for s in ve]}); n_ve += 1
        day['steps'] = out
    return n_bb, n_ve


if __name__ == '__main__':
    path, var = sys.argv[1], sys.argv[2]
    s = open(path).read(); i = s.index('window.' + var + '=')
    head, body = s[:i], s[i + len('window.' + var + '='):].rstrip().rstrip(';')
    D = json.loads(body)
    print('tách', tach(D['days'], 'SD' if var == 'SD' else 'LS'))
    open(path, 'w').write(head + 'window.' + var + '=' + json.dumps(D, ensure_ascii=False) + ';\n')
