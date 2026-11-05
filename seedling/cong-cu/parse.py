"""Đọc Excel v6 (đã xuất ra v6.json) và tách nội dung 99 ngày web Seedling thành dữ liệu có cấu trúc.
Chạy: python3 -I parse.py v6.json days.json
"""
import json, re, sys

PY_CH = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü'

def has_py(s):
    return any(c in PY_CH for c in s)

# ---------- người nói ----------
EN_SPK = {
    'Bông': 'bong', 'Leo': 'leo', 'Anna': 'anna', 'Xiaomei': 'xiaomei', 'Nhan': 'nhan', 'Mrs Lan': 'lan',
    'Mummy': 'me', 'Mommy': 'me', 'Mum': 'me', 'Grandpa': 'ong', 'Grandma': 'ba', 'Dad': 'bo', 'Daddy': 'bo',
    'Kids': 'kids', 'The man': 'man', "Leo's daddy": 'bo_leo', "Anna's daddy": 'bo_anna', 'Miss Hoa': 'hoa',
    "Xiaomei's mummy": 'me_xm', "Nhan's brother": 'anh_nhan',
}
ZH_SPK = {
    'Bông': 'bong', 'Leo': 'leo', 'Anna': 'anna', 'Xiaomei': 'xiaomei', 'Nhan': 'nhan', 'Lan老师': 'lan',
    '妈妈': 'me', '爷爷': 'ong', '奶奶': 'ba', '爸爸': 'bo', '小朋友': 'kids', '小朋友们': 'kids', '表演的人': 'man',
    'Leo的爸爸': 'bo_leo', 'Anna的爸爸': 'bo_anna', 'Hoa姐姐': 'hoa', 'Xiaomei的妈妈': 'me_xm',
}
EN_LAB = sorted(EN_SPK, key=len, reverse=True)
ZH_LAB = sorted(ZH_SPK, key=len, reverse=True)


def strip_head(s):
    """Bỏ phần 'Tên truyện · Phần 1 — ' ở đầu ô truyện."""
    return s.split(' — ', 1)[1] if ' — ' in s else s


def split_zh_py(s):
    """Ô truyện tiếng Trung: chữ Hán + (pinyin cả đoạn) ở cuối."""
    s = s.strip()
    m = re.search(r'\s\(([^()]*)\)\s*$', s)
    if m and has_py(m.group(1)):
        return s[:m.start()].strip(), m.group(1).strip()
    return s, ''


def en_turns(text):
    """Tách đoạn tiếng Anh thành lượt: (người nói, câu). Lời dẫn là 'narr'."""
    text = re.sub(r'\s+', ' ', text).strip()
    pat = r'(?:(?<=^)|(?<=[.!?”"\]]\s)|(?<=[.!?]”\s)|(?<=\]\s))(' + '|'.join(re.escape(l) for l in EN_LAB) + r'):\s'
    out, pos, cur = [], 0, 'narr'
    for m in re.finditer(pat, text):
        seg = text[pos:m.start()].strip()
        if seg:
            out.append([cur, seg])
        cur, pos = EN_SPK[m.group(1)], m.end()
    seg = text[pos:].strip()
    if seg:
        out.append([cur, seg])
    # lời nhân vật thường "…" — câu dẫn đi sau dấu ” thuộc về lời dẫn
    res = []
    for w, s in out:
        if w != 'narr' and s.startswith(('“', '"')):
            mm = re.match(r'^[“"](.*?)[”"](.*)$', s)
            if mm:
                res.append([w, mm.group(1).strip()])
                rest = mm.group(2).strip()
                if rest:
                    res.append(['narr', rest])
                continue
        res.append([w, s.strip('“”"').strip() if w != 'narr' else s])
    return [[w, s] for w, s in res if s]


def zh_turns(text):
    text = re.sub(r'\s+', '', text)
    pat = r'(?:(?<=^)|(?<=[。！？”\]]))(' + '|'.join(re.escape(l) for l in ZH_LAB) + r')(?:说|问|对\S{1,6}说)?：'
    out, pos, cur = [], 0, 'narr'
    for m in re.finditer(pat, text):
        seg = text[pos:m.start()].strip()
        if seg:
            out.append([cur, seg])
        cur, pos = ZH_SPK[m.group(1)], m.end()
    seg = text[pos:].strip()
    if seg:
        out.append([cur, seg])
    res = []
    for w, s in out:
        if w != 'narr' and s.startswith('“'):
            mm = re.match(r'^“(.*?)”(.*)$', s)
            if mm:
                res.append([w, mm.group(1)])
                if mm.group(2):
                    res.append(['narr', mm.group(2)])
                continue
        res.append([w, s.strip('“”')])
    return [[w, s] for w, s in res if s]


def strip_markers(s):
    return re.sub(r'\[\d\]\s*', '', s).strip()


# ---------- từ mới, ôn, nền ----------
def fields(cell):
    """'Mới: a, b | Ôn: c | Nền Little Seed (…): d' -> {'Mới': '...', ...}"""
    out = {}
    for part in cell.split(' | '):
        if ':' in part:
            k, v = part.split(':', 1)
            out[re.sub(r'\s*\(.*$', '', k).strip()] = v.strip()
    return out


def split_list(v):
    # tách theo dấu phẩy nhưng không cắt trong ngoặc
    items, depth, cur = [], 0, ''
    for ch in v:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            items.append(cur.strip()); cur = ''
        else:
            cur += ch
    if cur.strip():
        items.append(cur.strip())
    return [i for i in items if i]


def zh_entry(s):
    """'早上好 zǎoshang hǎo (= good morning)' -> {zh, py, en}"""
    s = s.strip()
    gloss = ''
    m = re.search(r'\(=\s*([^)]*)\)', s)
    if m:
        gloss = m.group(1).strip(); s = (s[:m.start()] + s[m.end():]).strip()
    m = re.match(r'^([^\sa-zA-Z' + PY_CH + r']*[㐀-鿿][^\s]*)\s*(.*)$', s)
    if not m:
        return None
    return {'zh': m.group(1).strip(), 'py': m.group(2).strip(), 'en': gloss}


# ---------- câu và lời trong ô "Câu" ----------
def items(cell):
    return [x.strip() for x in re.split(r'\s/\s', cell) if x.strip()]


def tag(it):
    m = re.match(r'^\[([^\]]+)\]\s*(.*)$', it, re.S)
    return (m.group(1), m.group(2)) if m else ('', it)


def zh_sent(s):
    """'你几岁？(Nǐ jǐ suì?) (= How old?)' -> zh, py, en"""
    s = s.strip(); en = ''
    m = re.search(r'\(=\s*([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$', s)
    if m:
        en = m.group(1).strip(); s = s[:m.start()].strip()
    py = ''
    m = re.search(r'\(([^()]*)\)\s*$', s)
    if m and has_py(m.group(1)):
        py = m.group(1).strip(); s = s[:m.start()].strip()
    return s, py, en


def main(src, dst):
    d = json.load(open(src))
    K = d['Khung 48 buổi']; M = d['Mạch từ theo ngày']; B = d['Bước ngày web']; V = d['Vai buổi I-R-P-P']
    CA = d['Chữ & âm']; TU = d['Truyện unit']
    mach = {int(r[0]): r for r in M if r[0].isdigit()}
    buoc = {int(r[0]): r for r in B if r[0].isdigit()}
    days = {}
    for r in K:
        m = re.match(r'Ngày (\d+)\.\s*(.*)', r[0])
        if not m:
            continue
        n = int(m.group(1)); mr = mach[n]; br = buoc[n]
        fe, fz = fields(r[1]), fields(r[6])
        en_new = split_list(fe.get('Mới', ''))
        zh_new = [e for e in (zh_entry(x) for x in split_list(fz.get('Mới', ''))) if e]
        en_on = split_list(fe.get('Ôn', ''))
        zh_on = [e for e in (zh_entry(x) for x in split_list(fz.get('Ôn', ''))) if e]
        bg_en = split_list(fe.get('Ngữ cảnh nền', ''))
        bg_zh = [e for e in (zh_entry(x) for x in split_list(fz.get('Ngữ cảnh nền', ''))) if e]
        nlq_zh = [e for e in (zh_entry(x) for x in split_list(fz.get('Nghe làm quen', ''))) if e]
        nen_en = [x.strip() for x in mr[10].split(',') if x.strip()]
        nen_zh = [e for e in (zh_entry(x) for x in split_list(mr[11])) if e]
        st_en = strip_markers(strip_head(r[4]))
        zt, zp = split_zh_py(strip_head(r[9]))
        days[n] = {
            'n': n, 'head': m.group(2), 'week': int(mr[1]) if mr[1].isdigit() else 0, 'before': int(mr[2]) if mr[2].isdigit() else 0,
            'unit': mr[3], 'kind': mr[4], 'goal': mr[5],
            'en_new': en_new, 'zh_new': zh_new, 'en_on': en_on, 'zh_on': zh_on, 'bg_en': bg_en, 'bg_zh': bg_zh, 'nlq_zh': nlq_zh,
            'nen_en': nen_en, 'nen_zh': nen_zh, 'phr_en': r[2], 'phr_zh': r[7],
            'sent_en': items(r[3]), 'sent_zh': items(r[8]),
            'story_title': r[4].split(' — ', 1)[0], 'story_title_zh': r[9].split(' — ', 1)[0],
            'story_en': st_en, 'story_zh': strip_markers(zt), 'story_py': strip_markers(zp),
            'turns_en': en_turns(st_en), 'turns_zh': zh_turns(strip_markers(zt)),
            'video_en': r[5], 'video_zh': r[10], 'steps_plan': br[4], 'class': r[11],
        }
    buoi = {}
    for r in V:
        if r[0].isdigit():
            buoi[int(r[0])] = {'b': int(r[0]), 'days': r[1], 'role': r[2], 'intro': r[3], 'repeat': r[4], 'practice': r[5], 'produce': r[6],
                               'wb_en': r[7], 'wb_zh': r[8], 'wb_read': r[9], 'reader': r[10]}
    stories = []
    for r in TU[1:]:
        if r[0]:
            stories.append({'unit': r[0], 'en': r[1], 'zh': r[2], 'plot': r[3], 'parts': r[4]})
    json.dump({'days': days, 'buoi': buoi, 'stories': stories}, open(dst, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
