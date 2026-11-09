# -*- coding: utf-8 -*-
"""Gắn nhãn từ 2 tầng (Lõi / Vòng ngoài) cho mọi từ Mới của khung 9 khóa.
Theo NguyenTac_LapLai_DangBai.md mục K, nguyên tắc 36, 37, 40, 42, 44.

Chạy:  python3 audit/tu2tang.py          (trong cong-cu/khung/)
Ra:    grid/tu2tang.json  – nhãn từng từ, lý do, cờ "máy không chắc"
"""
import json, glob, re, os, collections

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
ORDER = ['preb', 'little-seed', 'seedling', 'canopy', 'larva', 'larva-plus', 'pupa', 'cocoon', 'butterfly']
REVIEW = {'larva-plus', 'butterfly'}          # khóa ôn: không áp phân tầng (ng.t. 36)
LO, HI = 12, 15

# Mốc thi gần nhất của từng khóa (nguyên tắc 37a, 40)
EN_LEVEL = {'preb': 'Starters', 'little-seed': 'Starters', 'seedling': 'Starters', 'canopy': 'Starters',
            'larva': 'Movers', 'larva-plus': 'Movers', 'pupa': 'Flyers', 'cocoon': 'Flyers', 'butterfly': 'Flyers'}
ZH_LEVEL = {'preb': 'YCT1', 'little-seed': 'YCT1', 'seedling': 'YCT1', 'canopy': 'YCT2',
            'larva': 'YCT3', 'larva-plus': 'YCT3', 'pupa': 'YCT4', 'cocoon': 'YCT4', 'butterfly': 'YCT4'}
EN_RANK = {'Starters': 1, 'Movers': 2, 'Flyers': 3}
ZH_RANK = {'YCT1': 1, 'YCT2': 2, 'YCT3': 3, 'YCT4': 4}
# Khóa bắt đầu viết chính tả tiếng Anh (nguyên tắc 14): từ Canopy
EN_WRITE_FROM = ORDER.index('canopy')

CJK = r'[㐀-鿿]'


def split_items(s):
    """Tách theo dấu phẩy nằm ngoài ngoặc."""
    out, buf, depth = [], '', 0
    for ch in s:
        if ch in '(（[': depth += 1
        if ch in ')）]': depth = max(0, depth - 1)
        if ch in ',，;；' and depth == 0:
            out.append(buf); buf = ''
        else:
            buf += ch
    out.append(buf)
    return [x.strip() for x in out if x.strip() and x.strip() not in ('–', '-')]


def new_segments(cell, with_label=False):
    """Đoạn 'Mới:' của ô từ. Sau khi đã ghi nhãn, đoạn có dạng 'Mới · lõi:' / 'Mới · vòng ngoài:'
    – nhãn ghi sẵn trong khung được giữ (chị sửa tay trên khung là nhãn mới)."""
    for seg in cell.split(' | '):
        m = re.match(r'\s*Mới(?:\s*·\s*(lõi|vòng ngoài))?(?:\s*\([^)]*\))?\s*:(.*)', seg, re.S)
        if m:
            body = re.sub(r'^\s*–\s*\(.*?\)\s*', '', m.group(2).strip())
            lab = {'lõi': 'Lõi', 'vòng ngoài': 'Vòng ngoài'}.get(m.group(1) or '')
            yield (body, lab) if with_label else body


def en_key(item):
    s = re.sub(r'\[.*?\]', '', item)
    s = re.sub(r'\(.*?\)', '', s).strip().strip('.!?')
    return re.sub(r'\s+', ' ', s).lower()


def zh_parse(item):
    m = re.match(r'\s*((?:%s|[·…，！？—\-]|\s(?=%s))+)' % (CJK, CJK), item)
    if not m:
        return None, None
    hz = re.sub(r'\s+', '', m.group(1)).strip('，！？')
    g = re.search(r'\(=\s*(.*?)\)\s*$', item) or re.search(r'\(=\s*(.*)', item)
    gloss = g.group(1) if g else ''
    return hz, gloss


def load_rows(c):
    rows = []
    for f in sorted(glob.glob(K + 'grid/out/%s-?.json' % c)):
        rows += json.load(open(f))['rows']
    return rows


def exam_tables():
    cov = json.load(open(K + 'cov/coverage.json'))
    en, zh = {}, {}
    for x in cov:
        if x['lang'] == 'Tiếng Anh':
            w = re.sub(r'\(.*?\)', '', x['word'])
            for v in re.split(r'[/,]', w):
                v = re.sub(r'\s+', ' ', v).strip().lower()
                if v and (v not in en or EN_RANK[x['level']] < EN_RANK[en[v]['level']]):
                    en[v] = {'level': x['level'], 'pos': x['info']}
        else:
            zh.setdefault(x['word'], {'level': x['level'], 'pos': x['info']})
    return en, zh


def en_pos_class(pos, key):
    if ' ' in key:
        return 'cụm'
    if not pos:
        # ngoài danh sách thi: từ đơn đoán là danh từ (dollar, yuan, size…), có đuôi động/tính thì không
        if re.search(r'(ly|ful|ous|ive|ing|ed|able|y)$', key):
            return 'động/tính'
        return 'danh'
    first = pos.split('+')[0].strip()
    if first == 'n' and '+' not in pos:
        return 'danh'
    if first in ('v', 'adj', 'adv') or 'v' in pos.split(' + ') or 'adj' in pos.split(' + '):
        return 'động/tính'
    return 'chức năng'


def unit_texts(rows):
    """Văn bản đầy đủ mỗi unit, để đo luật 37c (từ sẽ là 'từ cũ' ở unit sau)."""
    T = collections.OrderedDict()
    for r in rows:
        u = r['unit']
        if u == '':
            continue
        t = T.setdefault(u, {'en': '', 'zh': ''})
        for w in r['web']:
            t['en'] += ' ' + ' '.join(w['en'].values())
            t['zh'] += ' ' + ' '.join(w['zh'].values())
        t['en'] += ' ' + ' '.join(r['lop']['en'].values())
        t['zh'] += ' ' + ' '.join(r['lop']['zh'].values())
    for t in T.values():
        t['en'] = ' ' + re.sub(r"[^a-z' ]+", ' ', t['en'].lower()) + ' '
    return T


def collect_new(rows):
    """Từ Mới của mỗi unit (ngày web + thẻ trên lớp), giữ ngày gặp đầu."""
    U = collections.OrderedDict()
    for r in rows:
        u = r['unit']
        if u == '':
            continue
        d = U.setdefault(u, {'en': collections.OrderedDict(), 'zh': collections.OrderedDict(), 'days': []})
        cells = [('web', w['ngay'], w) for w in r['web']] + [('lop', r['buoi'], {'en': {'tu': r['lop']['en'].get('flash', '')}, 'zh': {'tu': r['lop']['zh'].get('flash', '')}})]
        for kind, n, w in cells:
            if kind == 'web':
                d['days'].append(n)
            for body, lab in new_segments(w['en']['tu'], True):
                for it in split_items(body):
                    k = en_key(it)
                    if k and k not in d['en']:
                        d['en'][k] = {'raw': it, 'first': '%s %s' % ('ngày' if kind == 'web' else 'buổi', n), 'lab': lab}
            for body, lab in new_segments(w['zh']['tu'], True):
                for it in split_items(body):
                    hz, gl = zh_parse(it)
                    if hz and hz not in d['zh']:
                        d['zh'][hz] = {'raw': it, 'gloss': gl, 'first': '%s %s' % ('ngày' if kind == 'web' else 'buổi', n), 'lab': lab}
    return U


def unit_carry(rows, u, lang, key):
    """Số ngày web của unit có từ này trong câu mẫu hoặc truyện: đo mức khung câu của unit mang từ (37b)."""
    n = 0
    for r in rows:
        if r['unit'] != u:
            continue
        for w in r['web']:
            t = w[lang].get('cau', '') + ' ' + w[lang].get('truyen', '')
            if lang == 'en':
                t = ' ' + re.sub(r"[^a-z' ]+", ' ', t.lower()) + ' '
                if (' ' + key + ' ') in t or (' ' + key + 's ') in t:
                    n += 1
            elif key in t:
                n += 1
    return n


def later_reuse(T, u, lang, key):
    units = list(T)
    i = units.index(u)
    n = 0
    for v in units[i + 1:]:
        if lang == 'en':
            if (' ' + key + ' ') in T[v]['en'] or (' ' + key + 's ') in T[v]['en']:
                n += 1
        elif key in T[v]['zh']:
            n += 1
    return n


def gloss_keys(gl):
    gl = re.sub(r'\[.*?\]', '', gl)
    gl = re.split(r'[;；]', gl)[0]
    parts = re.split(r'\s[–-]\s|/|,', gl)
    out = []
    for p in parts:
        p = re.sub(r'\(.*?\)', '', p).strip().strip('.!?').lower()
        p = re.sub(r'^(to|a|an|the)\s+', '', p)
        if p:
            out.append(p)
    return out


def framed(pos, carry):
    """37b: khung câu của unit mang được – động/tính/cụm/chức năng có trong câu của unit,
    hoặc danh từ làm ô thay thế của khung (có trong câu, truyện ở ≥3 ngày web của unit)."""
    if pos in ('động/tính', 'cụm', 'chức năng'):
        return carry >= 1
    return carry >= 3


def rank_key(prod, pos, reuse, near, carry):
    """Luật chọn lõi 37 theo đúng thứ tự ưu tiên: (a) từ thi bắt tự nói/viết, (b) từ khung câu của unit
    mang được, (c) từ sẽ làm 'từ cũ' ở unit sau; danh từ ít xuất hiện trong khung xếp vòng ngoài trước."""
    return [1 if prod else 0, 1 if framed(pos, carry) else 0, 1 if reuse else 0, min(carry, 4), 1 if near else 0, min(reuse, 3)]


def why(prod, pos, reuse, near, carry):
    r = []
    if prod: r.append('37a từ thi bắt tự nói/viết')
    if framed(pos, carry): r.append('37b khung câu mang được (%s, %d ngày)' % (pos, carry))
    if reuse: r.append('37c dùng lại ở %d unit sau' % reuse)
    if not r and near: r.append('danh từ thi')
    if not r: r.append('danh từ / ngoài danh sách thi')
    return '; '.join(r)


def main():
    EN, ZH = exam_tables()
    res = {}
    known_en = set()      # từ Anh con đã học (Mới các unit trước, mọi khóa trước)
    stats = []
    for ci, c in enumerate(ORDER):
        rows = load_rows(c)
        U = collect_new(rows)
        T = unit_texts(rows)
        res[c] = {}
        for u, d in U.items():
            en_items = []
            for k, v in d['en'].items():
                ex = EN.get(k) or EN.get(k.rstrip('s'))
                pos = en_pos_class(ex['pos'] if ex else '', k)
                near = bool(ex) and EN_RANK[ex['level']] <= EN_RANK[EN_LEVEL[c]]
                reuse = later_reuse(T, u, 'en', k)
                prod = near and pos != 'danh'          # 37a: từ thi bắt con tự nói/viết câu
                carry = unit_carry(rows, u, 'en', k)
                score = rank_key(prod, pos, reuse, near, carry)
                en_items.append(dict(w=k, raw=v['raw'], first=v['first'], exam=ex['level'] if ex else '', pos=pos, reuse=reuse, carry=carry, score=score, why=why(prod, pos, reuse, near, carry)))
            zh_items = []
            for k, v in d['zh'].items():
                ex = ZH.get(k)
                gks = gloss_keys(v['gloss'])
                epos = '?'
                for g in gks:
                    if g in EN:
                        epos = en_pos_class(EN[g]['pos'], g); break
                if epos == '?':
                    gl0 = gks[0] if gks else ''
                    epos = 'cụm' if (len(k) >= 3 or ' ' in gl0) else en_pos_class('', gl0) if gl0 else 'danh'
                near = bool(ex) and ZH_RANK.get(ex['level'], 9) <= ZH_RANK[ZH_LEVEL[c]]
                reuse = later_reuse(T, u, 'zh', k)
                prod = (near and epos != 'danh') or (bool(ex) and ex['level'] == 'YCT4' and c in ('pupa', 'cocoon', 'butterfly'))
                carry = unit_carry(rows, u, 'zh', k)
                score = rank_key(prod, epos, reuse, near, carry)
                zh_items.append(dict(w=k, raw=v['raw'], gloss=v['gloss'], gk=gks, first=v['first'], exam=ex['level'] if ex else '', pos=epos, reuse=reuse, carry=carry, score=score, why=why(prod, epos, reuse, near, carry)))

            def tier(items, review):
                if review:
                    for it in items:
                        it['tier'] = 'Ôn (khóa ôn)'
                    return
                if len(items) <= HI:
                    for it in items:
                        it['tier'] = 'Lõi'; it['why'] = 'unit ≤15 từ: tất cả là lõi (ng.t. 36)'
                    return
                items_sorted = sorted(items, key=lambda x: [-v for v in x['score']])
                cut = items_sorted[HI - 1]['score']
                for i, it in enumerate(items_sorted):
                    it['tier'] = 'Lõi' if i < HI else 'Vòng ngoài'
                    # máy không chắc: cùng điểm với từ ở ranh giới, hoặc không rõ loại từ
                    if it['score'] == cut and any(o['score'] == cut for o in items_sorted[HI:]) or it['pos'] == '?':
                        it['unsure'] = True

            review = c in REVIEW
            tier(en_items, review)
            en_core = {i['w'] for i in en_items if i['tier'] == 'Lõi'}
            en_outer = {i['w'] for i in en_items if i['tier'] == 'Vòng ngoài'}
            # Tiếng Trung: lõi chỉ lấy từ mà nghĩa tiếng Anh là lõi Anh của unit hoặc từ Anh con đã biết (ng.t. 42)
            if not review:
                for it in zh_items:
                    it['en_link'] = 'lõi Anh' if any(g in en_core for g in it['gk']) else \
                                    'vòng ngoài Anh' if any(g in en_outer for g in it['gk']) else \
                                    'Anh đã biết' if any(g in known_en for g in it['gk']) else 'không thấy nghĩa Anh'
                elig = [i for i in zh_items if i['en_link'] in ('lõi Anh', 'Anh đã biết', 'không thấy nghĩa Anh')]
                for it in zh_items:
                    if it['en_link'] == 'vòng ngoài Anh':
                        it['tier'] = 'Vòng ngoài'; it['why'] += '; nghĩa Anh là vòng ngoài (ng.t. 42)'
                if len(zh_items) <= HI and all(i['en_link'] != 'vòng ngoài Anh' for i in zh_items):
                    for it in zh_items:
                        it['tier'] = 'Lõi'; it['why'] = 'unit ≤15 từ: tất cả là lõi (ng.t. 36)'
                else:
                    s = sorted(elig, key=lambda x: [-v for v in x['score']])
                    cut = s[min(HI, len(s)) - 1]['score'] if s else 0
                    for i, it in enumerate(s):
                        it['tier'] = 'Lõi' if i < HI else 'Vòng ngoài'
                        if (it['score'] == cut and any(o['score'] == cut for o in s[HI:])) or it['pos'] == '?':
                            it['unsure'] = True
            else:
                tier(zh_items, True)

            # Nhãn đã ghi trong khung (chị duyệt / sửa tay) thắng nhãn máy
            for L_, items_ in (('en', en_items), ('zh', zh_items)):
                for it in items_:
                    lab = d[L_][it['w']].get('lab')
                    if lab and lab != it['tier'] and not review:
                        it['tier'] = lab; it['why'] += '; nhãn ghi sẵn trong khung'; it.pop('unsure', None)
            # Ngoại lệ bắt buộc 40: từ vòng ngoài mà đề thi của mốc gần nhất bắt viết / nói
            for it in en_items:
                if it['tier'] == 'Vòng ngoài' and it['exam'] == EN_LEVEL[c] and ci >= EN_WRITE_FROM and it['pos'] != 'chức năng':
                    it['ex40'] = 'thi bắt viết (%s)' % it['exam']
            for it in zh_items:
                if it['tier'] == 'Vòng ngoài' and it['exam']:
                    if it['exam'] == 'YCT4' and c in ('pupa', 'cocoon', 'butterfly'):
                        it['ex40'] = 'chữ Hán YCT4'
                    elif it['exam'] == ZH_LEVEL[c] and it['pos'] in ('động/tính', 'cụm'):
                        it['ex40'] = 'cần cho YCT口试 (%s)' % it['exam']
            res[c][str(u)] = {'days': d['days'], 'en': en_items, 'zh': zh_items}
            known_en |= set(d['en'])
            for L, items in (('en', en_items), ('zh', zh_items)):
                stats.append((c, u, L, len(items), sum(i['tier'] == 'Lõi' for i in items), sum(i['tier'] == 'Vòng ngoài' for i in items),
                              sum(bool(i.get('ex40')) for i in items), sum(bool(i.get('unsure')) for i in items)))
    json.dump(res, open(K + 'grid/tu2tang.json', 'w'), ensure_ascii=False, indent=1)
    agg = collections.defaultdict(lambda: [0] * 5)
    for c, u, L, n, co, ou, e40, un in stats:
        a = agg[(c, L)]
        a[0] += n; a[1] += co; a[2] += ou; a[3] += e40; a[4] += un
    print('khóa        tiếng  từ Mới  lõi  vòng ngoài  ngoại lệ 40  máy không chắc')
    for (c, L), a in agg.items():
        print('%-12s %-4s %6d %5d %10d %11d %14d' % (c, L, *a))


if __name__ == '__main__':
    main()
