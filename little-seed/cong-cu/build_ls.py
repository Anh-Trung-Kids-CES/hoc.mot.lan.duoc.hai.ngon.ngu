"""Dựng little-seed-data.js cho web Little Seed 48 buổi (bản demo Unit 1, ngày 1–9).
Nguồn: khung chương trình/cong-cu/khung/grid/mang/little-seed48.json (khung 48 buổi), mạng văn bản U1,
tranh và giọng có sẵn của web Seedling (../seedling/tai-nguyen) và web 21 ngày (../xem-truoc/tai-nguyen).
Chạy trong thư mục gốc repo: python3 little-seed/cong-cu/build_ls.py
"""
import json, os, re, random, subprocess
random.seed(7)
ROOT = os.getcwd()
HERE = 'little-seed'
GRID = json.load(open('chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json'))
AIDX = json.load(open('little-seed/cong-cu/audio_index.json'))
SD0 = json.loads(subprocess.run(['node', '-e', "global.window={};require('./seedling/seedling-data.js');process.stdout.write(JSON.stringify(window.SD))"],
                                capture_output=True, text=True).stdout)

def fix(p):  # đường dẫn của web Seedling → tính từ little-seed/
    return re.sub(r'^tai-nguyen/', '../seedling/tai-nguyen/', p) if isinstance(p, str) else p
def deep(o):
    if isinstance(o, str): return fix(o)
    if isinstance(o, list): return [deep(x) for x in o]
    if isinstance(o, dict): return {k: deep(v) for k, v in o.items()}
    return o

S = '../seedling/tai-nguyen/'
X21 = '../xem-truoc/tai-nguyen/little-seed/img/'
LS = 'tai-nguyen-ls/canh/u1/'
NV = S + 'nhan-vat/'

def norm(t):
    t = t.strip().replace('，', ',').replace('！', '!').replace('？', '?').replace('。', '.')
    t = re.sub(r'\s+', ' ', t)
    return re.sub(r'[!.?]+$', '', t).lower()
MISS = []
def au(l, t, who=''):
    c = AIDX.get(f'{l}:{norm(t)}')
    if not c:
        MISS.append((l, t)); return ''
    # ưu tiên giọng đúng nhân vật, rồi giọng Seedling
    for v, f in c:
        if who and v == who: return f
    for v, f in c:
        if v == 'seedling': return f
    return c[0][1]

who = {
    'bong': ['Bông', NV + 'kids_bong_a.webp'], 'me': ['Mommy · 妈妈', NV + 'fam_bong_me_a.webp'],
    'bo': ['Daddy · 爸爸', NV + 'fam_bong_bo_a.webp'], 'co': ['Teacher · 老师', NV + 'huou_huou1_a.webp'],
    'leo': ['Leo', NV + 'kids_leo_a.webp'], 'anna': ['Anna', NV + 'kids_anna_a.webp'], 'xiaomei': ['Xiaomei', NV + 'kids_xiaomei_a.webp'],
    'vu': ['Vũ', NV + 'nv_vu_a.webp'], 'lop': ['Kids · 小朋友们', S + 'canh/u1/w_kids_c.webp'], 'cun': ['Puppy · 小狗', NV + 'pets_cun_dung_a.webp'],
    'meo': ['Kitten · 小猫', NV + 'pets_meo_ngoi_a.webp'], 'narr': ['', NV + 'huou_huou3_a.webp'],
}
VOICE = {'bong': 'bong', 'me': 'me', 'bo': 'bo', 'co': 'co_huou', 'leo': 'leo', 'anna': 'anna', 'xiaomei': 'xiaomei'}

# ---------- truyện Bông's Day: một cảnh mỗi câu ----------
PARTS = [
    ('Hello, Day!', '早上好！', [
        ('bong', X21 + 'v1_n1_tu_hello_l1.webp', 'Hello, day!', '早上好！', 'Zǎoshang hǎo!'),
        ('bong', X21 + 'v1_n2_cum_goodbye_kitten_l1.webp', 'Hello, kitten!', '小猫，你好！', 'Xiǎomāo, nǐ hǎo!'),
        ('bong', X21 + 'v1_n1_cau_goodbye_mommy_l1.webp', 'Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'),
        ('bong', X21 + 'tr1_c2.webp', 'Goodbye, kitten!', '小猫，再见！', 'Xiǎomāo, zàijiàn!'),
        ('me', X21 + 'v1_n1_cum_goodbye_mommy_l1.webp', 'Goodbye, Bông!', 'Bông，再见！', 'Bông, zàijiàn!'),
        ('bong', LS + 'di_hoc.webp', "Let's go!", '走吧！', 'Zǒu ba!')]),
    ('Hello, Teacher!', '老师，你好！', [
        ('bong', X21 + 'tr1_c3.webp', 'Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'),
        ('co', X21 + 'v1_n3_cum_hello_teacher_l1.webp', 'Hello, Bông!', 'Bông，你好！', 'Bông, nǐ hǎo!'),
        ('co', LS + 'co_leo.webp', 'Hello, Leo!', 'Leo，你好！', 'Leo, nǐ hǎo!'),
        ('co', LS + 'co_anna.webp', 'Hello, Anna!', 'Anna，你好！', 'Anna, nǐ hǎo!'),
        ('co', LS + 'co_xiaomei.webp', 'Hello, Xiaomei!', 'Xiaomei，你好！', 'Xiaomei, nǐ hǎo!'),
        ('lop', LS + 'ba_ban_chao_co.webp', 'Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!')]),
    ('Hello, Friend!', '朋友，你好！', [
        ('co', X21 + 'v1_n3_tu_teacher_l1.webp', 'Hello, everyone!', '大家好！', 'Dàjiā hǎo!'),
        ('lop', X21 + 'tr1_c4.webp', 'Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'),
        ('bong', X21 + 'v1_n4_cau_hello_friend_l1.webp', 'Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'),
        ('anna', X21 + 'v1_n4_cum_hello_friend_l1.webp', 'Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'),
        ('leo', LS + 'leo_vu.webp', 'Hello, Vũ!', 'Vũ，你好！', 'Vũ, nǐ hǎo!'),
        ('xiaomei', LS + 'xiaomei_anna.webp', 'Hello, Anna!', 'Anna，你好！', 'Anna, nǐ hǎo!')]),
    ('See You Tomorrow!', '明天见！', [
        ('lop', X21 + 'v1_n4_cum_goodbye_teacher_l1.webp', 'Goodbye, teacher!', '老师，再见！', 'Lǎoshī, zàijiàn!'),
        ('co', LS + 'co_tam_biet.webp', 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'),
        ('bong', X21 + 'tr1_c6.webp', 'See you tomorrow, teacher!', '老师，明天见！', 'Lǎoshī, míngtiān jiàn!'),
        ('leo', LS + 'leo_vu_ve.webp', 'Goodbye, friend!', '朋友，再见！', 'Péngyou, zàijiàn!')]),
    ('Hello, Daddy!', '爸爸，你好！', [
        ('bong', X21 + 'v1_n2_cau_hello_daddy_l1.webp', 'Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'),
        ('bo', X21 + 'v1_n2_cum_hello_daddy_l1.webp', 'Hello, Bông!', 'Bông，你好！', 'Bông, nǐ hǎo!'),
        ('cun', X21 + 'v1_n4_tu_puppy_l1.webp', 'Woof!', '汪汪！', 'Wāngwāng!'),
        ('bong', X21 + 'tr1_c7.webp', 'Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'),
        ('bong', X21 + 'v1_n1_cum_hello_mommy_l1.webp', 'Hello, mommy!', '妈妈，你好！', 'Māma, nǐ hǎo!'),
        ('me', LS + 'me_vay.webp', 'Hello!', '你好！', 'Nǐ hǎo!')]),
]
def scenes(k):
    return [{'who': w, 'img': img, 'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, VOICE.get(w, '')), 'a_zh': au('zh', z, VOICE.get(w, ''))}
            for (w, img, e, z, p) in PARTS[k][2]]

# ---------- thẻ từ ----------
W = {  # en: (zh, py, img)
    'day': ('早上好', 'zǎoshang hǎo', S + 'tranh/sunny.webp'),
    'goodbye': ('再见', 'zàijiàn', X21 + 'v1_n1_tu_goodbye_l1.webp'),
    'mommy': ('妈妈', 'māma', X21 + 'v1_n1_tu_mommy_l1.webp'),
    'kitten': ('小猫', 'xiǎomāo', X21 + 'v1_n2_tu_kitten_l1.webp'),
    'hello': ('你好', 'nǐ hǎo', X21 + 'v1_n1_tu_hello_l1.webp'),
    'teacher': ('老师', 'lǎoshī', X21 + 'v1_n3_tu_teacher_l1.webp'),
    'everyone': ('大家', 'dàjiā', X21 + 'v1_n3_tu_everyone_l1.webp'),
    'friend': ('朋友', 'péngyou', X21 + 'v1_n4_tu_friend_l1.webp'),
    'see you': ('见', 'jiàn', S + 'tranh/see_you_tomorrow.webp'),
    'all': ('大家', 'dàjiā', S + 'canh/u1/w_kids_c.webp'),
    'tomorrow': ('明天', 'míngtiān', S + 'tranh/see_you_tomorrow.webp'),
    'daddy': ('爸爸', 'bàba', X21 + 'v1_n2_tu_daddy_l1.webp'),
    'puppy': ('小狗', 'xiǎogǒu', X21 + 'v1_n4_tu_puppy_l1.webp'),
}
PREB = {'boy': ('', '', NV + 'kids_leo_a.webp', '👦'), 'girl': ('', '', NV + 'kids_bong_a.webp', '👧'),
        'yes': ('对', 'duì', '', '✅'), 'no': ('不对', 'bú duì', '', '❌')}
def card(w, on=False):
    z, p, img = W[w]
    c = {'en': w, 'zh': z, 'py': p, 'img': img, 'a_en': au('en', w, 'co_huou'), 'a_zh': au('zh', z, 'co_huou')}
    if w == 'day': c['en'] = 'Hello, day!'; c['a_en'] = au('en', 'Hello, day!', 'bong'); c['note'] = ['day', '早上']
    if on: c['on'] = True
    return c
def pcard(w):
    z, p, img, e = PREB[w]
    c = {'en': w, 'zh': z, 'py': p, 'img': img, 'e': e, 'a_en': au('en', w), 'a_zh': au('zh', z) if z else '', 'nen': 'PreB'}
    return c

PART_NEW = [['day', 'goodbye', 'mommy', 'kitten'], ['hello', 'teacher'], ['everyone', 'friend'], ['see you', 'all', 'tomorrow'], ['daddy', 'puppy']]
LEARNED = lambda k: [w for j in range(k) for w in PART_NEW[j]]

def pad(words, lo=5, hi=8):
    out = list(words)
    i = 0
    while len(out) < lo: out.append(words[i % len(words)]); i += 1
    return out[:hi]
def chon_qs(words, n_opt=3, reps=1):
    words = pad(words); qs = []
    pool = list(W.keys())
    for r in range(reps):
        for w in words:
            others = random.sample([x for x in pool if x != w and W[x][2] != W[w][2]], n_opt - 1)
            opts = others + [w]; random.shuffle(opts)
            l = 'en' if (len(qs) % 2 == 0) else 'zh'
            t = w if l == 'en' else W[w][0]
            qs.append({'say': {'t': t, 'l': l, 'a': au(l, t, 'co_huou')},
                       'opts': [{'en': o, 'img': W[o][2], 'e': ''} for o in opts], 'ans': opts.index(w)})
    return qs

def game_qs(words, n_opt):
    words = pad(words, 5, 6); qs = []
    for i, w in enumerate(words):
        l = 'en' if i % 2 == 0 else 'zh'
        others = random.sample([x for x in W if x != w and W[x][2] != W[w][2]], n_opt - 1)
        opts = others + [w]; random.shuffle(opts)
        t = w if l == 'en' else W[w][0]
        qs.append({'m': 'pic', 'say': {'t': t, 'l': l, 'a': au(l, t, 'co_huou')},
                   'opts': [{'en': o, 'zh': W[o][0], 'img': W[o][2]} for o in opts], 'ans': opts.index(w)})
    return qs

def noi_turns(k, limit=6):
    T = []
    for (w, img, e, z, p) in PARTS[k][2]:
        if w in ('bong', 'lop', 'anna', 'leo', 'xiaomei') and len(T) < limit:
            T.append({'img': img, 'say': [{'t': e, 'l': 'en', 'w': w, 'a': au('en', e, VOICE.get(w, ''))}]})
            T.append({'img': img, 'say': [{'t': z, 'l': 'zh', 'w': w, 'a': au('zh', z, VOICE.get(w, ''))}]})
    if len(T) < 5:  # ít câu của trẻ: thêm câu người lớn để đủ 5
        for (w, img, e, z, p) in PARTS[k][2]:
            if w in ('co', 'me', 'bo') and len(T) < 6:
                T.append({'img': img, 'say': [{'t': e, 'l': 'en', 'w': w, 'a': au('en', e, VOICE.get(w, ''))}]})
    return T[:max(5, min(limit, len(T)))]

def cham_qs(k_list, n=6):
    qs, opts = [], set()
    for k in k_list:
        for (w, img, e, z, p) in PARTS[k][2]:
            if w in ('lop', 'cun'): continue
            qs.append({'say': {'t': e, 'l': 'en', 'w': w, 'a': au('en', e, VOICE.get(w, ''))}, 'ans': w})
            qs.append({'say': {'t': z, 'l': 'zh', 'w': w, 'a': au('zh', z, VOICE.get(w, ''))}, 'ans': w})
            opts.add(w)
    random.shuffle(qs); qs = qs[:n]
    used = sorted({q['ans'] for q in qs})
    extra = [x for x in ('bong', 'co', 'me', 'bo', 'leo', 'anna') if x not in used]
    while len(used) < 3: used.append(extra.pop(0))
    return {'type': 'cham', 'opts': used[:4] if len(used) <= 4 else used[:4], 'qs': [q for q in qs if q['ans'] in used[:4]]}

days = {}
G = {d['ngay']: d for d in GRID['days']}
BUOI_OF = {n: b['buoi'] for b in GRID['buoi'] for n in b['ngay_web']}
GOAL = ['Chào buổi sáng, chào mèo con; tạm biệt mẹ bằng hai tiếng',
        'Chào cô giáo và các bạn khi đến lớp',
        'Chào cả lớp, chào bạn mới',
        'Tạm biệt cô, hẹn gặp ngày mai',
        'Về nhà chào bố, chào cún, chào mẹ',
        'Nghe cả truyện của Bông, chạm đúng người được chào',
        'Nói câu của Bông: chào hay tạm biệt?',
        'Phiên dịch nhí: nói lại cho bạn Xiaomei',
        'Ôn unit: hát, vè và big book']
for k in range(5):
    n = k + 1
    new = PART_NEW[k]; old = LEARNED(k)
    cards = [card(w) for w in new] + [card(w, True) for w in old[-max(0, 5 - len(new)):]]
    if k == 0: cards += [{'en': "Let's go!", 'zh': '走吧', 'py': 'zǒu ba', 'img': LS + 'di_hoc.webp', 'a_en': au('en', "Let's go!"), 'a_zh': au('zh', '走吧')}]
    if k == 2: cards += [pcard('boy'), pcard('girl')]
    if k == 3: cards += [pcard('yes'), pcard('no')]
    cards = cards[:8]
    steps = [
        {'type': 'the', 'cards': cards},
        {'type': 'truyen', 'title': f"Bông's Day · {PARTS[k][0]}", 'title_zh': f'Bông的一天 · {PARTS[k][1]}', 'scenes': scenes(k)},
        {'type': 'chon', 'qs': chon_qs(new + old[-max(0, 5 - len(new)):], 3)[:8]},
        {'type': 'noi', 'turns': noi_turns(k)},
        {'type': 'game', 'qs': game_qs((new + old)[:6] if k < 3 else (new + old[:3])[:6], 2 if n <= 3 else 3)},
    ]
    days[n] = {'n': n, 'unit': 1, 'unitname': 'Greeting', 'part': f'Phần {n}', 'week': G[n]['tuan'], 'before': BUOI_OF[n],
               't': f"{PARTS[k][0]} – {PARTS[k][1]}", 'hero': PARTS[k][2][0][1], 'goal': GOAL[k], 'bg': [],
               'video': [], 'steps': steps, 'kind': 'phan'}
ALL = [s for k in range(5) for s in scenes(k)]
whole = {'type': 'truyen', 'title': "Bông's Day", 'title_zh': 'Bông的一天', 'scenes': ALL}
ALLW = [w for p in PART_NEW for w in p]
# ngày 6: nghe cả truyện → ai nói? → hộp ôn → vận động
days[6] = {'steps': [whole, cham_qs(range(5), 8), {'type': 'goi', 'from': 'Unit 1', 'cards': [card(w) for w in ['mommy', 'teacher', 'friend', 'daddy', 'puppy']]},
                     {'type': 'game', 'qs': game_qs(['kitten', 'everyone', 'tomorrow', 'hello', 'goodbye', 'puppy'], 3)}]}
# ngày 7: nghe cả truyện → nói câu Bông → chọn tranh → vận động
BONG = [{'img': s['img'], 'say': [{'t': s['en'], 'l': 'en', 'w': 'bong', 'a': s['a_en']}]} for s in ALL if s['who'] == 'bong'][:4] + \
       [{'img': s['img'], 'say': [{'t': s['zh'], 'l': 'zh', 'w': 'bong', 'a': s['a_zh']}]} for s in ALL if s['who'] == 'bong'][4:8]
days[7] = {'steps': [whole, {'type': 'noi', 'turns': BONG}, {'type': 'chon', 'qs': chon_qs(ALLW, 3)[:8]},
                     {'type': 'game', 'qs': game_qs(['daddy', 'friend', 'all', 'mommy', 'teacher', 'day'], 3)}]}
# ngày 8: nghe cả truyện → phiên dịch nhí (cô làm mẫu trước) → hộp ôn → vận động
PDN = [('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), ('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), ('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'),
       ('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), ('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!')]
days[8] = {'steps': [whole, {'type': 'pdn', 'model_first': True,
                              'items': [{'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, 'leo'), 'a_zh': au('zh', z, 'xiaomei')} for e, z, p in PDN]},
                     {'type': 'goi', 'from': 'Unit 1', 'cards': [card(w) for w in ['hello', 'kitten', 'everyone', 'tomorrow', 'goodbye']]},
                     {'type': 'game', 'qs': game_qs(['puppy', 'teacher', 'hello', 'kitten', 'friend', 'daddy'], 3)}]}
# ngày 9: big book Hello and Goodbye → chọn tranh trộn → nói theo big book → vận động
BB = [('sunny', 'Hello, day!', '早上好！', 'Zǎoshang hǎo!'), ('mommy', 'Hello, mommy! Goodbye, mommy!', '妈妈，你好！妈妈，再见！', 'Māma, nǐ hǎo! Māma, zàijiàn!'),
      ('daddy', 'Hello, daddy! Goodbye, daddy!', '爸爸，你好！爸爸，再见！', 'Bàba, nǐ hǎo! Bàba, zàijiàn!'),
      ('kitten', 'Hello, kitten! Goodbye, kitten!', '小猫，你好！小猫，再见！', 'Xiǎomāo, nǐ hǎo! Xiǎomāo, zàijiàn!'),
      ('puppy', 'Hello, puppy! Goodbye, puppy!', '小狗，你好！小狗，再见！', 'Xiǎogǒu, nǐ hǎo! Xiǎogǒu, zàijiàn!'),
      ('teacher', 'Hello, teacher! Goodbye, teacher!', '老师，你好！老师，再见！', 'Lǎoshī, nǐ hǎo! Lǎoshī, zàijiàn!'),
      ('friend', 'Hello, friend! Goodbye, friend!', '朋友，你好！朋友，再见！', 'Péngyou, nǐ hǎo! Péngyou, zàijiàn!'),
      ('everyone', 'Hello, everyone! Goodbye, everyone!', '大家好！大家再见！', 'Dàjiā hǎo! Dàjiā zàijiàn!'),
      ('all', 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!')]
def bb_img(k): return W[k][2] if k in W else S + 'tranh/sunny.webp'
def au_multi(l, t, who=''):
    a = au(l, t, who)
    if a: return a
    MISS.pop()  # câu ghép: đọc từng câu nhỏ (web tự nối) – ghi thiếu theo câu nhỏ
    parts = re.findall(r'[^!！]+[!！]', t)
    fs = [au(l, x.strip(), who) for x in parts]
    return '|'.join(fs) if all(fs) else ''
big = {'type': 'truyen', 'title': 'Big book · Hello and Goodbye', 'title_zh': 'Big book · 你好，再见',
       'scenes': [{'who': 'narr', 'img': bb_img(k), 'en': e, 'zh': z, 'py': p, 'a_en': au_multi('en', e, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')} for k, e, z, p in BB]}
VE = [('mommy', 'Mommy, mommy, goodbye!', '妈妈，妈妈，再见！'), ('daddy', 'Daddy, daddy, goodbye!', '爸爸，爸爸，再见！'),
      ('kitten', 'Kitten, kitten, goodbye!', '小猫，小猫，再见！'), ('puppy', 'Puppy, puppy, goodbye!', '小狗，小狗，再见！'),
      ('all', 'Goodbye, see you tomorrow!', '再见，明天见！')]
days[9] = {'steps': [big, {'type': 'chon', 'qs': chon_qs(['day', 'see you', 'everyone', 'kitten', 'daddy', 'teacher', 'friend', 'puppy'], 3)[:8]},
                     {'type': 'noi', 'turns': [{'img': W[k][2], 'say': [{'t': e, 'l': 'en', 'w': 'narr', 'a': au('en', e)}]} for k, e, z in VE] +
                                              [{'img': W[k][2], 'say': [{'t': z, 'l': 'zh', 'w': 'narr', 'a': au('zh', z)}]} for k, e, z in VE[:3]]},
                     {'type': 'game', 'qs': game_qs(ALLW[:6], 3)}]}
for n in (6, 7, 8, 9):
    days[n].update({'n': n, 'unit': 1, 'unitname': 'Greeting', 'part': 'Ôn unit' if n == 9 else 'Cả truyện', 'week': G[n]['tuan'],
                    'before': BUOI_OF[n], 't': ["Bông's Day – cả truyện", 'Chào hay tạm biệt?', 'Phiên dịch nhí', 'Hello and Goodbye – hát và big book'][n - 6],
                    'hero': [X21 + 'tr1_c4.webp', X21 + 'tr1_c1.webp', LS + 'xiaomei_anna.webp', X21 + 'tr1_c8.webp'][n - 6], 'goal': GOAL[n - 1], 'bg': [], 'video': [], 'kind': 'ca'})

# ---------- bản đồ: 26 tuần ----------
U = {}
for d in GRID['days']: U.setdefault(str(d['unit']), []).append(d['ngay'])
TOPIC = {str(i + 1): t for i, t in enumerate(['Greeting · 问好', 'Name and age · 名字和年龄', 'Family · 家人', 'Body · 身体', 'Feelings · 心情', 'School · 学校',
                                             'House · 家', 'Animals · 动物', 'Food · 食物', 'Weather · 天气', 'Colours · 颜色', 'Numbers · 数字'])}
TOPIC['Ôn'] = 'Ôn cả khóa · Album gia đình'
plan = {u['unit']: [v for v in u['van_ban'] if v['id'] == 'T1'][0] for u in json.load(open('chuong-trinh/cong-cu/khung/grid/mang/plan_little-seed.json'))}
IMG = ['ls_home', 'ls_park', 'ls_home', 'ls_class', 'ls_home', 'ls_school', 'ls_home', 'ls_park', 'ls_park', 'ls_park', 'ls_class', 'ls_home']
mp, soon = [], {}
for u, ds in U.items():
    items = []
    for b in GRID['buoi']:
        if str(b['unit']) == u:
            items += [['day', n] for n in b['ngay_web']] + [['lop', b['buoi']]]
    ui = int(u) if u != 'Ôn' else 13
    mp.append({'key': 'w13' if u == '1' else u, 'name': 'Tuần 1–3 · Unit 1' if u == '1' else ('Tuần 26' if u == 'Ôn' else f'Unit {u}'),
               'topic': TOPIC[u], 'story': (plan[u]['ten_en'] if u in plan else ''), 'chang': min(4, (ui - 1) // 4 + 1) if u != 'Ôn' else 4, 'unit': u,
               'img': S + 'trang/' + (IMG[ui - 1] if ui <= 12 else 'ls_class') + '.webp', 'items': items})
    for n in ds:
        if n not in days: soon[n] = G[n]['label'].split('. ', 1)[-1]
lop = {}
for b in GRID['buoi']:
    lop[b['buoi']] = {'t': f"Buổi {b['buoi']} trên lớp · {('U' + str(b['unit'])) if b['unit'] != 'Ôn' else 'Ôn'}: {b['vai']}",
                      'img': S + 'trang/ls_class.webp', 'about': b['label'].split('. ', 1)[-1],
                      'prep': [x.strip() for x in re.split(r',', re.sub(r'\([^)]*\)', '', b['lop']['en']['flash']))][:8],
                      'days': b['ngay_web'], 'wb': ['Phiếu tô – dán 1 trang (khoảng 10 phút): tô tranh truyện, dán ảnh người thân, nối tranh – tranh'],
                      'kh': b['ke_hoach_90']}
units_q = [{'u': u, 'n': f'Unit {u} · {TOPIC[u].split(" · ")[0]}', 'days': ds, 'img': S + 'trang/' + IMG[int(u) - 1] + '.webp'} for u, ds in U.items() if u != 'Ôn']
reader = {'1': {'t': "Bông's Day", 'zh': 'Bông的一天', 'pages': [dict(s, part=k + 1) for k in range(5) for s in scenes(k)]}}

out = {'who': who, 'days': {str(k): v for k, v in sorted(days.items())}, 'lop': {str(k): v for k, v in lop.items()}, 'map': mp,
       'soon': {str(k): v for k, v in soon.items()}, 'vi': SD0['vi'], 'vi_a': deep(SD0['vi_a']), 'vi_t': SD0.get('vi_t', {}), 'bg': {},
       'reader': reader, 'units_q': units_q, 'aumap': {}, 'vi_tx': deep(SD0['vi_tx'])}
open('little-seed/little-seed-data.js', 'w').write('/* Dữ liệu web Little Seed 48 buổi – sinh từ little-seed48.json và mạng văn bản U1 (cong-cu/build_ls.py). Đừng sửa tay. */\nwindow.SD=' + json.dumps(out, ensure_ascii=False) + ';\n')
miss = sorted(set(MISS))
json.dump(miss, open('little-seed/cong-cu/giong_thieu.json', 'w'), ensure_ascii=False, indent=0)
print('ngày:', sorted(days), '· câu chưa có giọng thu sẵn:', len(miss))
for m in miss: print('  ', m)
