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
    ('Good Morning!', '早上好！', [
        ('bong', X21 + 'v1_n1_cum_hello_mommy_l1.webp', 'Good morning, mommy!', '妈妈，早上好！', 'Māma, zǎoshang hǎo!'),
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
        ('bong', S + 'tranh/go_to_bed.webp', 'Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!'),
        ('me', LS + 'me_vay.webp', 'Good night, ___!', '___，晚安！', '___, wǎn\'ān!')]),
]
def scenes(k):
    return [{'who': w, 'img': img, 'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, VOICE.get(w, '')), 'a_zh': au('zh', z, VOICE.get(w, ''))}
            for (w, img, e, z, p) in PARTS[k][2]]

# ---------- thẻ từ ----------
W = {  # en: (zh, py, img)
    'good morning': ('早上好', 'zǎoshang hǎo', S + 'tranh/sunny.webp'),
    'good night': ('晚安', 'wǎn\'ān', S + 'tranh/go_to_bed.webp'),
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
    if on: c['on'] = True
    return c
def pcard(w):
    z, p, img, e = PREB[w]
    c = {'en': w, 'zh': z, 'py': p, 'img': img, 'e': e, 'a_en': au('en', w), 'a_zh': au('zh', z) if z else '', 'nen': 'PreB'}
    return c

PART_NEW = [['good morning', 'goodbye', 'mommy', 'kitten'], ['hello', 'teacher'], ['everyone', 'friend'], ['see you', 'all', 'tomorrow'], ['daddy', 'puppy', 'good night']]
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
BUOI_OF = {n: b['buoi'] for b in GRID['buoi'] for n in b['ngay_web'] if b['buoi']}
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
                     {'type': 'game', 'qs': game_qs(['daddy', 'friend', 'all', 'mommy', 'teacher', 'good morning'], 3)}]}
# ngày 8: nghe cả truyện → phiên dịch nhí (cô làm mẫu trước) → hộp ôn → vận động
PDN = [('Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), ('Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), ('Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'),
       ('Goodbye, mommy!', '妈妈，再见！', 'Māma, zàijiàn!'), ('Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!')]
days[8] = {'steps': [whole, {'type': 'pdn', 'model_first': True,
                              'items': [{'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, 'leo'), 'a_zh': au('zh', z, 'xiaomei')} for e, z, p in PDN]},
                     {'type': 'goi', 'from': 'Unit 1', 'cards': [card(w) for w in ['hello', 'kitten', 'everyone', 'tomorrow', 'goodbye']]},
                     {'type': 'game', 'qs': game_qs(['puppy', 'teacher', 'hello', 'kitten', 'friend', 'daddy'], 3)}]}
# ngày 9: big book "Goodbye, Puppy!" (chị duyệt kịch bản 11/11, tranh vẽ Canva DAHanaV9zZg trang 15–27, claude/KichBan_BigBook_LS_U1.md)
# → chọn tranh trộn → nói theo big book → vận động. Tranh: little-seed/tai-nguyen-ls/bigbook/u1/
BBD = 'tai-nguyen-ls/bigbook/u1/'
BB_BIA = (BBD + 'bia_khung.webp', 'Goodbye, Puppy!', '小狗，再见！', 'Xiǎogǒu, zàijiàn!')
BB = [(BBD + 'p1.webp', 'Good morning!', '早上好！', 'Zǎoshang hǎo!'), (BBD + 'p2.webp', 'Good morning, mommy!', '妈妈，早上好！', 'Māma, zǎoshang hǎo!'),
      (BBD + 'p3.webp', 'Hello, daddy!', '爸爸，你好！', 'Bàba, nǐ hǎo!'), (BBD + 'p4.webp', 'Goodbye, puppy!', '小狗，再见！', 'Xiǎogǒu, zàijiàn!'),
      (BBD + 'p5.webp', 'Hello, teacher!', '老师，你好！', 'Lǎoshī, nǐ hǎo!'), (BBD + 'p6.webp', 'Hello, friend!', '朋友，你好！', 'Péngyou, nǐ hǎo!'),
      (BBD + 'p7.webp', 'Hello, everyone!', '大家好！', 'Dàjiā hǎo!'), (BBD + 'p8.webp', 'Hello, puppy!', '小狗，你好！', 'Xiǎogǒu, nǐ hǎo!'),
      (BBD + 'p9.webp', 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Dàjiā zàijiàn! Míngtiān jiàn!'),
      (BBD + 'p10.webp', 'Hello, kitten!', '小猫，你好！', 'Xiǎomāo, nǐ hǎo!'), (BBD + 'p11.webp', 'Good night, puppy!', '小狗，晚安！', 'Xiǎogǒu, wǎn\'ān!')]
# (12/11) trang khung dán ảnh con ("Good night, ___!") lên làm bìa, không để ở cuối sách nữa
def bb_img(k): return k if k.endswith('.webp') else (W[k][2] if k in W else S + 'tranh/sunny.webp')
def au_multi(l, t, who=''):
    a = au(l, t, who)
    if a: return a
    MISS.pop()  # câu ghép: đọc từng câu nhỏ (web tự nối) – ghi thiếu theo câu nhỏ
    parts = re.findall(r'[^!！]+[!！]', t)
    fs = [au(l, x.strip(), who) for x in parts]
    return '|'.join(fs) if all(fs) else ''
big = {'type': 'truyen', 'title': 'Big book · Goodbye, Puppy!', 'title_zh': 'Big book · 小狗，再见！',
       'scenes': [{'who': 'narr', 'img': bb_img(k), 'en': e, 'zh': z, 'py': p, 'a_en': au_multi('en', e, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')}
                  for k, e, z, p in [BB_BIA] + BB]}
VE = [('mommy', 'Mommy, mommy, goodbye!', '妈妈，妈妈，再见！'), ('daddy', 'Daddy, daddy, goodbye!', '爸爸，爸爸，再见！'),
      ('kitten', 'Kitten, kitten, goodbye!', '小猫，小猫，再见！'), ('puppy', 'Puppy, puppy, goodbye!', '小狗，小狗，再见！'),
      ('all', 'Goodbye, see you tomorrow!', '再见，明天见！')]
days[9] = {'steps': [big, {'type': 'chon', 'qs': chon_qs(['good morning', 'see you', 'everyone', 'kitten', 'daddy', 'teacher', 'friend', 'puppy'], 3)[:8]},
                     {'type': 'noi', 'turns': [{'img': W[k][2], 'say': [{'t': e, 'l': 'en', 'w': 'narr', 'a': au('en', e)}]} for k, e, z in VE] +
                                              [{'img': W[k][2], 'say': [{'t': z, 'l': 'zh', 'w': 'narr', 'a': au('zh', z)}]} for k, e, z in VE[:3]]},
                     {'type': 'game', 'qs': game_qs(ALLW[:6], 3)}]}
for n in (6, 7, 8, 9):
    days[n].update({'n': n, 'unit': 1, 'unitname': 'Greeting', 'part': 'Ôn unit' if n == 9 else 'Cả truyện', 'week': G[n]['tuan'],
                    'before': BUOI_OF[n], 't': ["Bông's Day – cả truyện", 'Chào hay tạm biệt?', 'Phiên dịch nhí', 'Goodbye, Puppy! – hát và big book'][n - 6],
                    'hero': [X21 + 'tr1_c4.webp', X21 + 'tr1_c1.webp', LS + 'xiaomei_anna.webp', X21 + 'tr1_c8.webp'][n - 6], 'goal': GOAL[n - 1], 'bg': [], 'video': [], 'kind': 'ca'})


# ---------- câu có tên con (ng.t. 25): ___ thay bằng tên con lúc chạy (ls48.js), giọng = câu thu sẵn + tên đọc bằng giọng máy ----------
def ten_au(l, t, who=''):
    base = t.replace(', ___', '').replace('___，', '').replace('___, ', '')
    f = AIDX.get(f'{l}:{norm(base)}')
    a = au(l, base, who) if f else ''
    if not f: MISS.append((l, base))
    if not a: return ''
    return (a + '|@ten') if l == 'en' else ('@ten|' + a)
def fix_ten(obj):
    if isinstance(obj, dict):
        for l in ('en', 'zh'):
            if isinstance(obj.get(l), str) and '___' in obj[l] and ('a_' + l) in obj: obj['a_' + l] = ten_au(l, obj[l], VOICE.get(obj.get('who', ''), ''))
        for v in obj.values(): fix_ten(v)
    elif isinstance(obj, list):
        for v in obj: fix_ten(v)

# ---------- big book + vè (ng.t. 23, 27): mỗi ngày nghe vài trang, thay bài luyện rời ----------
def bb_step(pages, title, title_zh):
    return {'type': 'truyen', 'lab': 'Big book và vè', 'sub': 'Nghe lại mẫu câu của unit', 'title': title, 'title_zh': title_zh,
            'scenes': [{'who': 'narr', 'img': img, 'en': e, 'zh': z, 'py': p, 'a_en': au_multi('en', e, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')} for img, e, z, p in pages]}
BB1 = [(bb_img(k), e, z, p) for k, e, z, p in BB]
VE1 = [(W[k][2], e, z, '') for k, e, z in VE]
for n in range(1, 9):
    pg = [BB1[(2 * (n - 1) + j) % len(BB1)] for j in range(3)] + [VE1[(n - 1 + j) % len(VE1)] for j in range(2)]
    st = bb_step(pg, 'Big book · Goodbye, Puppy! + vè', 'Big book · 小狗，再见！+ 儿歌')
    if n <= 5: days[n]['steps'][2] = st          # thay bài Nghe – chạm tranh (luyện rời)
    else: days[n]['steps'].insert(len(days[n]['steps']) - 1, st)
# (12/11) bỏ trang cuối "Hello, ___!" khỏi big book ngày 9: trang có tên con giờ là bìa (khung dán ảnh)

# ---------- Unit 9 · Food (mạng văn bản mau_little-seed_u9.json) ----------
M9 = json.load(open('chuong-trinh/cong-cu/khung/grid/mang/mau_little-seed_u9.json'))
T9 = M9['T1']; L9 = 'tai-nguyen-ls/canh/u9/'
TR = S + 'tranh/'
W9 = {'picnic': ('野餐', 'yěcān', TR + 'picnic.webp'), 'picnic time': ('去野餐', 'qù yěcān', TR + 'picnic.webp'), 'like': ('喜欢', 'xǐhuan', TR + 'love.webp'),
      'eat': ('吃', 'chī', TR + 'eat.webp'), 'apple': ('苹果', 'píngguǒ', TR + 'apple.webp'), 'banana': ('香蕉', 'xiāngjiāo', TR + 'banana.webp'),
      'pizza': ('比萨', 'bǐsà', TR + 'pizza.webp'), 'rice': ('米饭', 'mǐfàn', TR + 'rice.webp'), 'drink': ('喝', 'hē', TR + 'drink.webp'),
      'milk': ('牛奶', 'niúnǎi', TR + 'milk.webp'), 'water': ('水', 'shuǐ', TR + 'water.webp'), 'juice': ('果汁', 'guǒzhī', TR + 'juice.webp'), 'egg': ('鸡蛋', 'jīdàn', TR + 'egg.webp')}
def c9(w, on=False, nen=False):
    z, p, img = W9[w]; c = {'en': w if w != 'picnic time' else 'Picnic time!', 'zh': z, 'py': p, 'img': img, 'a_en': au('en', w if w != 'picnic time' else 'Picnic time!', 'co_huou'), 'a_zh': au('zh', z, 'co_huou')}
    if on: c['on'] = True
    if nen: c['nen'] = 'PreB'
    return c
def sc9(k):
    return [{'who': w, 'img': L9 + f'p{k + 1}_{i + 1}.webp', 'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, VOICE.get(w, '')), 'a_zh': au('zh', z, VOICE.get(w, ''))}
            for i, (w, e, z, p) in enumerate(T9['phan'][k])]
def g9(words, n_opt=3):
    words = pad(words, 5, 6); qs = []
    for i, w in enumerate(words):
        l = 'en' if i % 2 == 0 else 'zh'; t = w if l == 'en' else W9[w][0]
        others = random.sample([x for x in W9 if x != w and W9[x][2] != W9[w][2] and x not in ('juice', 'egg')], n_opt - 1)
        opts = others + [w]; random.shuffle(opts)
        qs.append({'m': 'pic', 'say': {'t': t, 'l': l, 'a': au(l, t, 'co_huou')}, 'opts': [{'en': o, 'zh': W9[o][0], 'img': W9[o][2]} for o in opts], 'ans': opts.index(w)})
    return qs
def noi9(k):
    T = []
    for s in sc9(k):
        if s['who'] == 'me': continue
        T.append({'img': s['img'], 'say': [{'t': s['en'], 'l': 'en', 'w': s['who'], 'a': s['a_en']}]})
        T.append({'img': s['img'], 'say': [{'t': s['zh'], 'l': 'zh', 'w': s['who'], 'a': s['a_zh']}]})
    return T[:6]
BB9 = [(W9[k][2] if k in W9 else TR + k + '.webp', e, z, p) for k, e, z, p in M9['T3']['trang']]
VE9 = [(W9[k][2] if k in W9 else TR + k + '.webp', e, z, p) for k, e, z, p in M9['T4']['dong']]
def bb9(n):
    pg = [BB9[(2 * n + j) % len(BB9)] for j in range(3)] + [VE9[(n + j) % len(VE9)] for j in range(2)]
    return bb_step(pg, 'Big book · Do You Like…? + vè', 'Big book · 你喜欢…吗？+ 儿歌')
NEW9 = [['picnic', 'picnic time'], ['like', 'apple', 'eat'], ['banana', 'pizza'], ['rice'], ['drink', 'milk', 'water']]
D9 = sorted(d['ngay'] for d in GRID['days'] if d['unit'] == 9)
GOAL9 = ['Đi dã ngoại: Picnic time!', 'Con thích táo: I like apples!', 'Chuối và pizza', 'Cơm của Anna: I like rice!', 'Uống sữa, uống nước; con thích gì?',
         'Nghe cả truyện, chạm đúng bạn đang nói', 'Nói câu của các bạn', 'Phiên dịch nhí: nói cho Xiaomei con thích gì']
for k in range(5):
    n = D9[k]; old = [w for j in range(k) for w in NEW9[j]]
    cards = [c9(w) for w in NEW9[k]] + [c9(w, True) for w in old[-max(0, 5 - len(NEW9[k])):]]
    if k == 0: cards += [c9('juice', nen=True), c9('egg', nen=True)]
    days[n] = {'steps': [{'type': 'the', 'cards': cards[:8]},
                         {'type': 'truyen', 'title': f'Picnic Time! · {T9["phan_ten"][k][0]}', 'title_zh': f'去野餐！· {T9["phan_ten"][k][1]}', 'scenes': sc9(k)},
                         bb9(k), {'type': 'noi', 'turns': noi9(k) if len(noi9(k)) >= 5 else noi9(k) + noi9(max(0, k - 1))[:5 - len(noi9(k))]},
                         {'type': 'game', 'qs': g9(NEW9[k] + old, 3)}],
               'part': f'Phần {k + 1}', 't': f'{T9["phan_ten"][k][0]} – {T9["phan_ten"][k][1]}', 'hero': L9 + f'p{k + 1}_1.webp', 'kind': 'phan'}
ALL9 = [s for k in range(5) for s in sc9(k)]
whole9 = {'type': 'truyen', 'title': 'Picnic Time!', 'title_zh': '去野餐！', 'scenes': ALL9}
ALLW9 = [w for p in NEW9 for w in p if w != 'picnic time']
cham9 = {'type': 'cham', 'opts': ['bong', 'leo', 'anna', 'xiaomei'],
         'qs': [{'say': {'t': s[l], 'l': l, 'w': s['who'], 'a': s['a_' + l]}, 'ans': s['who']} for i, s in enumerate(ALL9) for l in (('en', 'zh')[i % 2],) if s['who'] in ('bong', 'leo', 'anna', 'xiaomei')][:8]}
kid9 = [s for s in ALL9 if s['who'] in ('bong', 'leo', 'anna', 'xiaomei', 'vu')]
PDN9 = [('I like apples!', '我喜欢苹果！', 'Wǒ xǐhuan píngguǒ!'), ('I like bananas!', '我喜欢香蕉！', 'Wǒ xǐhuan xiāngjiāo!'), ('I eat rice!', '我吃米饭！', 'Wǒ chī mǐfàn!'),
        ('I drink milk!', '我喝牛奶！', 'Wǒ hē niúnǎi!'), ('I like pizza!', '我喜欢比萨！', 'Wǒ xǐhuan bǐsà!')]
days[D9[5]] = {'steps': [whole9, cham9, bb9(5), {'type': 'goi', 'from': 'Unit 9', 'cards': [c9(w) for w in ['apple', 'banana', 'rice', 'milk', 'water']]}, {'type': 'game', 'qs': g9(ALLW9[:6])}]}
days[D9[6]] = {'steps': [whole9, {'type': 'noi', 'turns': [{'img': s['img'], 'say': [{'t': s['en'] if i % 2 == 0 else s['zh'], 'l': 'en' if i % 2 == 0 else 'zh', 'w': s['who'], 'a': s['a_en'] if i % 2 == 0 else s['a_zh']}]} for i, s in enumerate(kid9[::2])][:8]},
                         bb9(6), {'type': 'game', 'qs': g9(['pizza', 'drink', 'like', 'water', 'eat', 'picnic'])}]}
days[D9[7]] = {'steps': [whole9, {'type': 'pdn', 'model_first': False, 'items': [{'en': e, 'zh': z, 'py': p, 'a_en': au('en', e, 'leo'), 'a_zh': au('zh', z, 'xiaomei')} for e, z, p in PDN9]},
                         bb9(7), {'type': 'goi', 'from': 'Unit 9', 'cards': [c9(w) for w in ['eat', 'drink', 'pizza', 'like', 'picnic']]}, {'type': 'game', 'qs': g9(['milk', 'apple', 'rice', 'banana', 'water', 'eat'])}]}
for k, n in enumerate(D9):
    d = days[n]
    d.update({'n': n, 'unit': 9, 'unitname': 'Food', 'week': G[n]['tuan'], 'before': BUOI_OF[n], 'goal': GOAL9[k], 'bg': [], 'video': []})
    if k >= 5: d.update({'part': 'Cả truyện', 't': ['Picnic Time! – cả truyện', 'Các bạn thích gì?', 'Phiên dịch nhí'][k - 5], 'hero': L9 + ['p1_2.webp', 'p3_3.webp', 'p5_3.webp'][k - 5], 'kind': 'ca'})
fix_ten(days)


# ---------- Unit 2–12 + tuần ôn (mạng văn bản ls48_mang.py, nguyên tắc 61–67; tranh ghép ghep_units.py) – 11/11/2026 ----------
import importlib.util as _iu
from pypinyin import pinyin as _pinyin, Style as _Style
_sp = _iu.spec_from_file_location('ls48_mang', 'chuong-trinh/cong-cu/khung/grid/mang/ls48_mang.py'); MANG = _iu.module_from_spec(_sp); _sp.loader.exec_module(MANG)
_gs = _iu.spec_from_file_location('ghep_units', 'little-seed/cong-cu/ghep_units.py'); GH = _iu.module_from_spec(_gs); _gs.loader.exec_module(GH)
PY_NHE = {'爸爸': 'bà ba', '妈妈': 'mā ma', '哥哥': 'gē ge', '姐姐': 'jiě jie', '弟弟': 'dì di', '妹妹': 'mèi mei', '奶奶': 'nǎi nai', '爷爷': 'yé ye',
          '宝宝': 'bǎo bao', '朋友': 'péng you', '谢谢': 'xiè xie', '名字': 'míng zi', '什么': 'shén me', '我们': 'wǒ men', '你们': 'nǐ men', '他们': 'tā men', '妈妈的': 'mā ma de',
          '早上': 'zǎo shang', '晚上': 'wǎn shang', '喜欢': 'xǐ huan', '衣服': 'yī fu', '漂亮': 'piào liang', '时候': 'shí hou', '东西': 'dōng xi', '舒服': 'shū fu',
          '休息': 'xiū xi', '认识': 'rèn shi', '学生': 'xué sheng', '眼睛': 'yǎn jing', '耳朵': 'ěr duo', '头发': 'tóu fa', '鼻子': 'bí zi', '肚子': 'dù zi',
          '桌子': 'zhuō zi', '椅子': 'yǐ zi', '杯子': 'bēi zi', '孩子': 'hái zi', '鞋子': 'xié zi', '帽子': 'mào zi', '裙子': 'qún zi', '裤子': 'kù zi',
          '饺子': 'jiǎo zi', '包子': 'bāo zi', '橘子': 'jú zi', '叔叔': 'shū shu', '意思': 'yì si', '知道': 'zhī dao', '客气': 'kè qi', '个子': 'gè zi'}
def _py_seg(seg):   # thanh nhẹ (轻声) cho từ lặp, từ thường gặp; phần còn lại theo pypinyin
    out = []; pat = '(' + '|'.join(sorted(map(re.escape, PY_NHE), key=len, reverse=True)) + ')'
    for part in re.split(pat, seg):
        if not part: continue
        out.append(PY_NHE[part] if part in PY_NHE else ' '.join(x[0] for x in _pinyin(part, style=_Style.TONE)))
    return ' '.join(out)
import sys as _sy, os as _os; _sy.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '../../chuong-trinh/cong-cu'))
from pinyin_chuan import py as _PYC   # (12/11) pinyin chuẩn theo từ điển CC-CEDICT + luật chữ đa âm
def PY(z):
    return _PYC(z, noi=True)
    out = []
    for seg in re.split(r'([一-鿿]+)', z):
        if re.match(r'[一-鿿]', seg or ''): out.append(' ' + _py_seg(seg) + ' ')   # (12/11) có cách với tên Latin: "wǒ jiào Leo"
        else: out.append(seg)
    s = ''.join(out).replace('，', ', ').replace('！', '! ').replace('？', '? ').replace('。', '. ').replace('、', ', ').replace('……', '… ')
    return re.sub(r'\s+([,.!?…])', r'\1', re.sub(r'\s+', ' ', s)).strip()
def IMG(key, en=''):
    p = GH.tranh(key)
    if p: return '../' + p
    slug = re.sub(r'[^a-z0-9]+', '_', en.lower()).strip('_')
    return 'tai-nguyen-ls/the/' + slug + '.webp' if os.path.exists('little-seed/tai-nguyen-ls/the/' + slug + '.webp') else ''
GOALS = {2: 'Đếm nến, nói tên, hỏi tuổi', 3: 'Xem album: ông, bà, anh, chị, em', 4: 'Đầu, mắt, mũi, tay, chân: I have…', 5: 'Vui, buồn, buồn ngủ, sợ, giận, mệt',
         6: 'Đồ dùng học tập: What is this?', 7: 'Tìm sách: on, under', 8: 'Con vật làm được gì: I can…', 9: 'Đi dã ngoại: I like / I eat / I drink',
         10: 'Thời tiết hôm nay', 11: 'Màu sắc và cầu vồng', 12: 'Tiệc của Leo: đếm bánh, đếm bạn'}
DU = {}
for d in GRID['days']: DU.setdefault(d['unit'], []).append(d['ngay'])
READER = {}
for un, MU in sorted(MANG.U.items()):
    WU = {}
    for part in MU['the']:
        for w in part: WU[w[0]] = (w[1], PY(w[1]), IMG(w[2] if len(w) > 2 else '', w[0]), (w[3] if len(w) > 3 else ''))
    def cu(w, on=False):
        z, p, img, nen = WU[w]
        c = {'en': w, 'zh': z, 'py': p, 'img': img, 'a_en': au('en', w, 'co_huou'), 'a_zh': au('zh', z, 'co_huou')}
        if on: c['on'] = True
        if nen: c['nen'] = nen
        return c
    L = f'tai-nguyen-ls/canh/u{un}/'
    def scu(k):
        return [{'who': GH.code(w) if GH.code(w) in who else ('narr' if GH.code(w) in GH.ANIMAL else GH.code(w)), 'img': L + f'p{k + 1}_{i + 1}.webp', 'en': e, 'zh': z, 'py': PY(z),
                 'a_en': au('en', e, VOICE.get(GH.code(w), '')), 'a_zh': au('zh', z, VOICE.get(GH.code(w), ''))} for i, (w, e, z) in enumerate(MU['phan'][k][2])]
    SC = [scu(k) for k in range(5)]
    for k in range(5):
        for s in SC[k]:
            if s['who'] not in who: s['who'] = 'narr'
    PIC_W = [w for w in WU if WU[w][2]]
    def gq(words, n_opt=3):
        words = [w for w in words if WU[w][2]] or PIC_W
        words = pad(words, 5, 6); qs = []
        for i, w in enumerate(words):
            l = 'en' if i % 2 == 0 else 'zh'; t = w if l == 'en' else WU[w][0]
            pool = [x for x in PIC_W if x != w and WU[x][2] != WU[w][2]]
            others = random.sample(pool, min(n_opt - 1, len(pool))); opts = others + [w]; random.shuffle(opts)
            qs.append({'m': 'pic', 'say': {'t': t, 'l': l, 'a': au(l, t, 'co_huou')}, 'opts': [{'en': o, 'zh': WU[o][0], 'img': WU[o][2]} for o in opts], 'ans': opts.index(w)})
        return qs
    def nu(k):
        T = []
        for s in SC[k] + (SC[k - 1] if k else SC[k + 1]):
            if s['who'] in ('narr', 'me', 'bo', 'co', 'cun', 'meo', 'em'): continue
            T.append({'img': s['img'], 'say': [{'t': s['en'] if len(T) % 2 == 0 else s['zh'], 'l': 'en' if len(T) % 2 == 0 else 'zh', 'w': s['who'],
                                                 'a': s['a_en'] if len(T) % 2 == 0 else s['a_zh']}]})
        return T[:6] if len(T) >= 5 else (T + [{'img': s['img'], 'say': [{'t': s['en'], 'l': 'en', 'w': s['who'], 'a': s['a_en']}]} for s in SC[k]])[:6]
    BBU = [(i if i.endswith('.webp') else IMG(i) or IMG(i.replace('_a', '')) or ('../' + GH.NV + i + '_a.webp' if os.path.exists(GH.NV + i + '_a.webp') else ('../' + GH.NV + i + '.webp' if os.path.exists(GH.NV + i + '.webp') else '')), e, z, PY(z)) for i, e, z in MU['bb'][2]]
    VEU = [(IMG({'co': 'song', 'lop': 'song'}.get(w, 'song')), e.replace('-', '').title() if False else re.sub(r'(?<=\w)-(?=\w)', '', e), z, PY(z)) for w, e, z, v in MU['ve']]
    def bbu(n):
        pg = [BBU[(2 * n + j) % len(BBU)] for j in range(3)] + [VEU[(n + j) % len(VEU)] for j in range(2)]
        return bb_step(pg, f'Big book · {MU["bb"][0]} + vè', f'Big book · {MU["bb"][1]} + 儿歌')
    D = sorted(DU[un]); NEW = [[w[0] for w in part] for part in MU['the']]
    for k in range(5):
        n = D[k]; old = [w for j in range(k) for w in NEW[j]]
        cards = [cu(w) for w in NEW[k]] + [cu(w, True) for w in old[-max(0, 5 - len(NEW[k])):]]
        days[n] = {'steps': [{'type': 'the', 'cards': cards[:8]},
                             {'type': 'truyen', 'title': f'{MU["ten_en"]} · {MU["phan"][k][0]}', 'title_zh': f'{MU["ten_zh"]} · {MU["phan"][k][1]}', 'scenes': SC[k]},
                             bbu(k), {'type': 'noi', 'turns': nu(k)}, {'type': 'game', 'qs': gq(NEW[k] + old, 3)}],
                   'part': f'Phần {k + 1}', 't': f'{MU["phan"][k][0]} – {MU["phan"][k][1]}', 'hero': L + f'p{k + 1}_1.webp', 'kind': 'phan'}
    ALLU = [s for k in range(5) for s in SC[k]]
    whole = {'type': 'truyen', 'title': MU['ten_en'], 'title_zh': MU['ten_zh'], 'scenes': ALLU}
    kids = [x for x in ('bong', 'leo', 'anna', 'xiaomei', 'vu', 'me', 'bo') if any(s['who'] == x for s in ALLU)][:4]
    chamu = {'type': 'cham', 'opts': kids, 'qs': [{'say': {'t': s[l], 'l': l, 'w': s['who'], 'a': s['a_' + l]}, 'ans': s['who']}
                                                for i, s in enumerate(ALLU) for l in (('en', 'zh')[i % 2],) if s['who'] in kids][:8]}
    kidl = [s for s in ALLU if s['who'] in ('bong', 'leo', 'anna', 'xiaomei', 'vu')]
    pdn = []
    for s in kidl:
        if '___' in s['en'] or len(s['en'].split()) < 3 or any(p['en'] == s['en'] for p in pdn): continue
        pdn.append({'en': s['en'], 'zh': s['zh'], 'py': s['py'], 'a_en': s['a_en'], 'a_zh': s['a_zh']})
    ALLW = [w for p in NEW for w in p]
    if len(D) >= 8:
        days[D[5]] = {'steps': [whole, chamu, bbu(5), {'type': 'goi', 'from': f'Unit {un}', 'cards': [cu(w) for w in ALLW[::2][:5]]}, {'type': 'game', 'qs': gq(ALLW[:6])}]}
        days[D[6]] = {'steps': [whole, {'type': 'noi', 'turns': [{'img': s['img'], 'say': [{'t': s['en'] if i % 2 == 0 else s['zh'], 'l': 'en' if i % 2 == 0 else 'zh', 'w': s['who'],
                                                                                           'a': s['a_en'] if i % 2 == 0 else s['a_zh']}]} for i, s in enumerate(kidl[::2])][:8]},
                                bbu(6), {'type': 'game', 'qs': gq(ALLW[3:9] or ALLW)}]}
        days[D[7]] = {'steps': [whole, {'type': 'pdn', 'model_first': False, 'items': pdn[:5] if len(pdn) >= 5 else (pdn + pdn)[:5]},
                                bbu(7), {'type': 'goi', 'from': f'Unit {un}', 'cards': [cu(w) for w in ALLW[1::2][:5]]}, {'type': 'game', 'qs': gq(ALLW[-6:])}]}
    for k, n in enumerate(D):
        if n not in days: continue
        d = days[n]
        d.update({'n': n, 'unit': un, 'unitname': GRID['days'][n - 1]['label'].split('·')[1].strip(), 'week': G[n]['tuan'], 'before': BUOI_OF.get(n), 'goal': GOALS[un] if k < 5 else
                  ['Nghe cả truyện, chạm đúng bạn đang nói', 'Nói câu của các bạn', 'Phiên dịch nhí'][k - 5], 'bg': [], 'video': []})
        if k >= 5: d.update({'part': 'Cả truyện', 't': [f'{MU["ten_en"]} – cả truyện', 'Các bạn nói gì?', 'Phiên dịch nhí'][k - 5], 'hero': L + ['p1_2.webp', 'p3_2.webp', 'p5_2.webp'][k - 5], 'kind': 'ca'})
    READER[str(un)] = {'t': MU['ten_en'], 'zh': MU['ten_zh'], 'pages': [dict(s, part=k + 1) for k in range(5) for s in SC[k]]}
    globals()['BBU_%d' % un] = BBU
# Tuần ôn (ngày 98–99): big book các unit + trò chơi trộn câu của ngày Phần 5 các unit
for n, us in ((98, (2, 3, 4, 5, 6)), (99, (7, 8, 10, 11, 12))):
    pg = [globals()['BBU_%d' % u][0] for u in us] + [globals()['BBU_%d' % u][1] for u in us[:3]]
    qs = []
    for u in us:
        qs += next(st for st in days[sorted(DU[u])[4]]['steps'] if st['type'] == 'game')['qs'][:2]
    days[n] = {'n': n, 'unit': 'Ôn', 'unitname': 'Ôn cả khóa', 'part': 'Ôn cả khóa', 'week': G[n]['tuan'], 'before': BUOI_OF.get(n), 'kind': 'ca',
               't': 'Ôn cả khóa – big book các unit' + (' (1)' if n == 98 else ' (2)'), 'hero': pg[0][0], 'goal': 'Nghe lại mẫu câu của cả khóa, chuẩn bị Album gia đình',
               'bg': [], 'video': [], 'steps': [bb_step(pg, 'Big book cả khóa', '全年大书'), {'type': 'game', 'qs': qs[:8]}]}
# Unit 1: vè chào (hello, goodbye) đưa vào bước Big book và vè – ng.t. 66–67 (web trước buổi mang câu của vè)
VE_CHAO = [(S + 'tranh/song.webp', 'Hello, hello, everyone!', '你好你好，大家好！'), (S + 'tranh/song.webp', 'Hello, teacher! Class is fun!', '老师老师，早上好！'),
           (S + 'tranh/song.webp', "What's your name? What's your name?", '你叫什么名字呀？'), (S + 'tranh/song.webp', "Leo, Leo, that's my name!", '我叫Leo，Leo呀！'),
           (S + 'tranh/song.webp', 'Goodbye, goodbye, everyone!', '大家再见，再见啦！'), (S + 'tranh/song.webp', 'One, two, three… school is done!', '一二三，放学啦！')]
for n in range(1, 10):
    st = next((x for x in days[n]['steps'] if x.get('lab') == 'Big book và vè'), None)
    if st:
        add = [VE_CHAO[(n - 1) * 2 % 6], VE_CHAO[((n - 1) * 2 + 1) % 6]]
        st['scenes'] = st['scenes'][:3] + [{'who': 'narr', 'img': i, 'en': e, 'zh': z, 'py': PY(z), 'a_en': au_multi('en', e, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')} for i, e, z in add]
        st['title'] = 'Big book · Goodbye, Puppy! + vè chào'; st['title_zh'] = 'Big book · 小狗，再见！+ 儿歌'
# Từ "Mới · lõi" của khung 48 buổi chưa có trong thẻ ngày (đối chiếu 11/11): thêm thẻ vào bước Thẻ từ của đúng ngày
EXTRA = {30: [('mouth', '口', 'mouth')], 46: [('these', '这些', '')], 91: [('Happy birthday!', '生日快乐！', 'happy'), ('two dogs', '两只狗', 'dog')],
         94: [('egg', '鸡蛋', 'egg'), ('an eraser', '一块橡皮', 'eraser'), ('a table', '一张桌子', 'table')], 19: [('little sister', '妹妹', 'fam_bong_em_gai')]}
for n, ws in EXTRA.items():
    st = next((x for x in days[n]['steps'] if x['type'] == 'the'), None)
    if st is None:
        st = {'type': 'the', 'cards': []}; days[n]['steps'].insert(0, st)
    have = {c['en'].lower() for c in st['cards']}
    for en, zh, key in ws:
        if en.lower() in have: continue
        img = IMG(key, en)
        if not img:
            slug = re.sub(r'[^a-z0-9]+', '_', en.lower()).strip('_'); GH.the_chu(en, zh, f'little-seed/tai-nguyen-ls/the/{slug}.webp'); img = f'tai-nguyen-ls/the/{slug}.webp'
        st['cards'].append({'en': en, 'zh': zh, 'py': PY(zh), 'img': img, 'a_en': au('en', en, 'co_huou'), 'a_zh': au('zh', zh, 'co_huou')})
# Luyện thanh điệu (chị quyết 11/11, NL-3: lớp offline Little Seed 48 có luyện thanh). Bước "Mẹo âm" trước trò chơi cuối ngày, từng chút một:
# U1–U2 thanh 1 và 4, U3–U4 thêm thanh 2, từ U5 thêm thanh 3. Chỉ dùng từ con đã gặp ở bước Thẻ (tính thanh của âm tiết đầu),
# bỏ từ có biến thanh (一, 不, hai thanh 3 liền nhau). Mỗi bước: 1 thẻ bắt chước (3 từ) + 5–6 câu nghe – chạm kí hiệu thanh.
from pypinyin import lazy_pinyin as _lp, Style as _St
TSYM = {'1': 'ˉ →', '2': 'ˊ ↗', '3': 'ˇ ↘↗', '4': 'ˋ ↘'}
def tone_of(hz):
    h = re.findall(r'[一-鿿]', hz)
    if not h or h[0] in '一不': return ''
    t = [re.sub(r'\D', '', x) or '5' for x in _lp(''.join(h[:2]), style=_St.TONE3)]
    if t[0] == '3' and len(t) > 1 and t[1] == '3': return ''
    return t[0] if t[0] in '1234' else ''
POOL = {}   # hz -> (py, tone, ngày gặp)
for n in sorted(k for k in days if isinstance(k, int)):
    d = days[n]
    try: un = int(d.get('unit'))
    except (TypeError, ValueError): continue
    for st in d['steps']:
        if st['type'] == 'the':
            for c in st['cards']:
                hz = re.sub(r'[！？。，、…!?.]', '', c.get('zh') or '')
                if hz and hz not in POOL and len(re.findall(r'[一-鿿]', hz)) <= 3 and tone_of(hz):
                    py = c.get('py') or PY(hz); hh = re.findall(r'[一-鿿]', hz)
                    if len(hh) == 2 and hh[0] == hh[1]:   # từ lặp (妈妈, 爷爷): âm tiết sau thanh nhẹ
                        s1 = _lp(hh[0], style=_St.TONE)[0]; py = s1 + _lp(hh[0], style=_St.NORMAL)[0]
                    POOL[hz] = (py, tone_of(hz), n)
    allow = '14' if un <= 2 else ('124' if un <= 4 else '1234')
    pool = [(hz, py, t, m) for hz, (py, t, m) in POOL.items() if t in allow]
    if len(pool) < 5 or len({t for _, _, t, _ in pool}) < 2: continue
    pool.sort(key=lambda x: -x[3])                       # từ mới gặp trước
    pairs = [p for p in ('14', '12', '24', '13', '34', '23') if set(p) <= set(allow)]
    foc = pairs[n % len(pairs)]
    ex = []
    for t in foc + foc:
        w = next((x for x in pool if x[2] == t and x not in ex), None)
        if w and len(ex) < 3: ex.append(w)
    rest = [x for x in pool if x not in ex]
    k = n % max(1, len(rest)); rest = rest[k:] + rest[:k]
    qz = (ex + rest)[:6 if len(pool) >= 6 else 5]
    step = {'type': 'meo', 'cards': [{'l': 'zh', 'sym': ' · '.join(TSYM[t] for t in foc), 'name': '', 'ex': [[py, hz] for hz, py, _, _ in ex]}],
            'quiz': {'zh': [[py, hz, t] for hz, py, t, _ in qz], 'zh_btn': [[t, TSYM[t]] for t in allow], 'en': [], 'en_btn': []}}
    i = max(j for j, s in enumerate(d['steps']) if s['type'] == 'game') if any(s['type'] == 'game' for s in d['steps']) else len(d['steps'])
    d['steps'] = [s for s in d['steps'] if s['type'] != 'meo']
    d['steps'].insert(min(i, len(d['steps'])), step)
fix_ten(days)

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
        if b['buoi'] == 0: continue
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
    if b['buoi'] == 0: continue
    lop[b['buoi']] = {'t': f"Buổi {b['buoi']} trên lớp · {('U' + str(b['unit'])) if b['unit'] != 'Ôn' else 'Ôn'}: {b['vai']}",
                      'img': S + 'trang/ls_class.webp', 'about': b['label'].split('. ', 1)[-1],
                      'prep': [x.strip() for x in re.split(r',', re.sub(r'\([^)]*\)', '', b['lop']['en']['flash']))][:8],
                      'days': b['ngay_web'], 'wb': ['Phiếu tô – dán 1 trang (khoảng 10 phút): tô tranh truyện, dán ảnh người thân, nối tranh – tranh'],
                      'kh': b['ke_hoach_90']}
units_q = [{'u': u, 'n': f'Unit {u} · {TOPIC[u].split(" · ")[0]}', 'days': ds, 'img': S + 'trang/' + IMG[int(u) - 1] + '.webp'} for u, ds in U.items() if u != 'Ôn']
reader = {'1': {'t': "Bông's Day", 'zh': 'Bông的一天', 'pages': [dict(s, part=k + 1) for k in range(5) for s in scenes(k)]}}
reader.update(READER)
fix_ten(reader)

# Tách bước "Big book và vè" thành bước Big book + bước Vè riêng (chị chốt 12/11)
import sys as _s; _s.path.insert(0, 'chuong-trinh/cong-cu'); from tach_bb_ve import tach as _tach; print('tách big book / vè', _tach(days, 'LS'))
# Thiết kế mới (chị chốt 12/11) – mẫu U3 trước khi làm các unit khác:
#   bước "bb": trái đọc cả quyển big book (Anh rồi Trung từng trang), phải 4 câu hỏi đọc hiểu, trả lời sau khi nghe hết;
#   bước "vek": vè dạng video karaoke (tranh + lời sáng theo nhịp + nhạc máy), hát nhiều lần, rồi lồng tiếng, lưu video về máy.
FAM = {k: '../seedling/tai-nguyen/nhan-vat/fam_bong_%s_a.webp' % v for k, v in
       {'me': 'me', 'bo': 'bo', 'ba': 'ba', 'ong': 'ong', 'anh_trai': 'anh_trai', 'em_gai': 'em_gai'}.items()}
FAM_TEN = {'me': ('mommy', '妈妈'), 'bo': ('daddy', '爸爸'), 'ba': ('grandma', '奶奶'), 'ong': ('grandpa', '爷爷'), 'anh_trai': ('big brother', '哥哥'), 'em_gai': ('little sister', '妹妹')}

# =====================================================================
# (12/11, mục N) BIG BOOK + VÈ 4 LẦN – dùng chung cho mọi unit (claude/QuyTac_BigBook_Ve_Web.md)
#   kind 'guess': big book kiểu trang đoán + trang lật (U3 "Who Is She?")
#   kind 'seq'  : big book kể theo trình tự, mỗi trang chào / gọi tên một người, vật (U1 "Goodbye, Puppy!")
# =====================================================================
def pg_dict(img, e, z, cover=False):
    d = {'img': img, 'en': e, 'zh': z, 'py': PY(z), 'a_en': au_multi('en', e, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')}
    if cover: d['cover'] = True
    return d
def ve_dict(e, z, img=''):
    en_ = re.sub(r'(?<=\w)-(?=\w)', '', e)
    return {'raw': e, 'en': en_, 'zh': z, 'py': PY(z), 'img': img, 'a_en': au_multi('en', en_, 'co_huou'), 'a_zh': au_multi('zh', z, 'co_huou')}
def _cat(t, nm):   # tách câu quanh tên: (trước, sau)
    i = t.lower().find(nm.lower())
    return (t[:i], t[i + len(nm):]) if i >= 0 else (t, '')
BB_TXT = {
    'guess': {'sub': {1: 'Lần 1 · Nghe cả quyển, chạm đúng người', 2: 'Lần 2 · Đoán trang sau là ai', 3: 'Lần 3 · Đọc đuổi, điền chỗ trống', 4: 'Lần 4 · Con kể, rồi nói về gia đình con'},
              'rules': {1: ['Khởi động: con nghe bài vè và nghe tên các bạn trong truyện.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con nghe câu hỏi và chạm đúng người. Cần thì bấm 💡 để xem gợi ý.'],
                        2: ['Khởi động: con nghe bài vè và nghe lại 3 trang đầu.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con đoán: trang sau là ai? Con chạm vào tranh trang sau.'],
                        3: ['Khởi động: con nghe bài vè và 2 trang đầu.', 'Đọc đuổi tiếng Anh rồi tiếng Trung: cô đọc, cô và con cùng đọc, rồi con đọc một mình.', 'Rồi con chọn tranh điền vào chỗ trống.'],
                        4: ['Khởi động: con nghe bài vè và nghe nhanh cả quyển.', 'Con kể: cô nói nửa câu, con nói tiếp.', 'Rồi con nói về gia đình con: "He is my…", "She is my…".']}},
    'seq': {'sub': {1: 'Lần 1 · Nghe cả quyển, chạm đúng người', 2: 'Lần 2 · Đoán trang sau Bông gặp ai', 3: 'Lần 3 · Đọc đuổi, điền chỗ trống', 4: 'Lần 4 · Con kể, rồi chúc ngủ ngon người thân'},
            'rules': {1: ['Khởi động: con nghe bài vè và nghe tên các bạn trong truyện.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con nghe câu Bông nói và chạm đúng người Bông chào. Cần thì bấm 💡.'],
                      2: ['Khởi động: con nghe bài vè và nghe lại 3 trang đầu.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con đoán: trang sau Bông gặp ai? Con chạm vào tranh trang sau.'],
                      3: ['Khởi động: con nghe bài vè và 2 trang đầu.', 'Đọc đuổi tiếng Anh rồi tiếng Trung: cô đọc, cô và con cùng đọc, rồi con đọc một mình.', 'Rồi con chọn tranh điền vào chỗ trống.'],
                      4: ['Khởi động: con nghe bài vè và nghe nhanh cả quyển.', 'Con kể: cô nói nửa câu, con nói tiếp.', 'Rồi con chúc ngủ ngon người thân: "Good night, …!"']}}}
BB_CMD = {1: {'en': ('Listen and touch.', 'vi', 'Con nghe rồi chạm vào đúng người nhé.'), 'zh': ('听一听，点一点。', 'en', 'Listen and touch.')},
          2: {'en': ('Who is on the next page?', 'vi', 'Trang sau là ai? Con chạm vào tranh trang sau nhé.'), 'zh': ('下一页是谁？', 'en', 'Who is on the next page?')},
          3: {'en': ('Which one? Touch it.', 'vi', 'Chọn tranh điền vào chỗ trống nhé.'), 'zh': ('是哪一个？点一点。', 'en', 'Which one? Touch it.')}}
def bb_cmd(lan):
    if lan not in BB_CMD: return None
    return {l: {'t': t, 'a': au(l, t.rstrip('.。'), 'co_huou') or au(l, t, 'co_huou'), 'tl': tl, 'tr': tr, 'a_tr': au('en', tr.rstrip('.'), 'co_huou') if tl == 'en' else ''}
            for l, (t, tl, tr) in BB_CMD[lan].items()}
VE_SUB = {1: 'Lần 1 · Nghe mẫu, hát tiếng Anh', 2: 'Lần 2 · Hát tiếng Trung', 3: 'Lần 3 · Hát hai tiếng, giọng cô nhỏ dần', 4: 'Lần 4 · Lồng tiếng, lưu video gửi cô'}
VE_RULES = {1: ['Khởi động: con nghe lại 3 trang big book.', 'Con nghe cô đọc mẫu vè tiếng Anh từng dòng.', 'Rồi con hát karaoke cùng nhạc: chữ sáng đến đâu, con hát đến đó.'],
            2: ['Khởi động: con nghe 3 trang big book và hát lại vè tiếng Anh cùng cô.', 'Con nghe cô đọc mẫu vè tiếng Trung từng dòng.', 'Rồi con hát karaoke tiếng Trung.'],
            3: ['Khởi động: con nghe 3 trang big book và nghe nhanh vè hai tiếng.', 'Con hát karaoke 3 lượt mỗi tiếng: giọng cô to, rồi nhỏ, rồi tắt.', 'Lượt cuối con hát một mình nhé!'],
            4: ['Khởi động: con nghe 3 trang big book và hát vè một lượt.', 'Lồng tiếng: video chạy, con hát, máy thu giọng con.', 'Ba mẹ lưu video và gửi cô qua Zalo (mỗi unit một lần).']}

# (13/11) khởi động big book: vè của chính unit, cả bài, một tiếng mỗi lần; trỏ theo mã unit, không chép lời – kế hoạch chung LS/SD
_spk = _iu.spec_from_file_location('kh_bb48', 'chuong-trinh/cong-cu/khung/grid/mang/ke_hoach_bigbook_48.py'); KH = _iu.module_from_spec(_spk); _spk.loader.exec_module(KH)
VE_U = {}   # lời vè hiện hành của từng unit (web đọc ở SD.ve_u khi khởi động trỏ tới)
def bbve_unit(un, S_):
    """S_: pages, names {k:(en,zh,img)}, items [{'k','ap','qpg'?,'opts'}], kind, vel, ve2 {lan:(lines,langs)}, mine [..5], plan [(bb|ve, lan)] theo ngày,
    title, title_zh, ve_title, ve_title_zh, frame?, qimg?"""
    D_U = sorted(n for n, d in days.items() if str(d.get('unit')) == str(un))
    pages, kind = S_['pages'], S_['kind']; off = 1 if pages and pages[0].get('cover') else 0
    def ten(k):   # tên Latin (Bông, Vũ) chưa có giọng Trung: phát đúng file giọng tên đó, không để máy đọc tiếng Trung
        e, z, im = S_['names'][k]; ae = au_multi('en', e, 'co_huou')
        return {'k': k, 'img': im, 'en': e, 'zh': z, 'a_en': ae, 'a_zh': au_multi('zh', z, 'co_huou') or (ae if z == e else '')}
    APG = {}
    for it in S_['items']:   # trang trả lời: tên người được che để làm khung câu, nửa câu cô nói, câu gợi ý
        ap, k = it['ap'], it['k']; APG[k] = ap; P_ = pages[ap]; P_['nm'] = k
        for l, nm in (('en', S_['names'][k][0]), ('zh', S_['names'][k][1])):
            pre, post = _cat(P_[l], nm)
            P_['half_' + l] = re.sub(r' ?…\.', '…', (pre + '…' + post).strip())   # "My name is…  I'm five.", không "…."
            cue = pre.rstrip(' ,，') or post.lstrip(' ,，')
            P_['cue_' + l] = cue; P_['a_cue_' + l] = au(l, cue.rstrip('!！。.?？'), 'co_huou') if cue else ''   # chỉ dùng file đúng nguyên câu
            P_['fr_' + l] = (pre + '___' + post).strip()
    NAMES = [ten(k) for k in sorted(APG, key=APG.get)]
    def cau_hoi(lan):
        qs = []; IT = S_['items']
        for q in range(5):
            it = IT[(lan - 1 + q) % len(IT)]; l = ('en', 'zh')[(q + lan - 1) % 2]; ap = it['ap']
            qpg = it.get('qpg', ap - 1)
            if kind == 'seq':   # lần 1: nghe câu Bông nói, chạm người (không lộ tranh); lần 2: nghe trang trước, đoán trang sau; lần 3: nhìn trang, điền khung
                pg = None if lan == 1 else (qpg if lan == 2 else ap)
                qt = pages[ap][l] if lan == 1 else (pages[qpg][l] if lan == 2 else '')
            else:
                pg = qpg; qt = pages[qpg][l]
            d = {'l': l, 'pg': pg, 'ap': ap, 'q': qt, 'py': PY(qt) if l == 'zh' and qt else '', 'a_q': au_multi(l, qt, 'co_huou') if qt else '',
                 'say': pages[ap][l], 'a_say': au_multi(l, pages[ap][l], 'co_huou'), 'fr': pages[ap]['fr_' + l],
                 'opts': [dict(ten(o), pg=APG.get(o, ap)) for o in it['opts']], 'ans': it['opts'].index(it['k'])}
            if kind == 'seq' and lan == 1: d.update({'qd': pages[ap]['half_' + l], 'img': S_.get('qimg', '')})
            qs.append(d)
        return qs
    def cau_con():
        return [dict(m, a_q=au_multi(m['l'], m['q'], 'co_huou') if m.get('q') else '', a_cue=au(m['l'], m['cue'].rstrip('!！。.?？'), 'co_huou'),
                     a_vd=au_multi(m['l'], m['vd'], 'co_huou')) for m in S_['mine']]
    NP = len(pages) - off; jv = 0
    strip = lambda x: {k: v for k, v in x.items() if k != 'w'}
    VE_U[un] = [strip(x) for x in S_['vel']]
    for di, n in enumerate(D_U):
        typ, lan = S_['plan'][di]; st = days[n]['steps']; out = []; placed = False
        is_bb = lambda s: s.get('lab') == 'Big book' or (s['type'] == 'truyen' and str(s.get('title', '')).startswith('Big book'))
        is_ve = lambda s: s['type'] in ('ve', 'vek')
        has_main = any((is_bb(s) if typ == 'bb' else is_ve(s)) for s in st)
        for s in st:
            if is_bb(s) or is_ve(s):
                mine = is_bb(s) if typ == 'bb' else is_ve(s)
                if placed or (has_main and not mine): continue
                placed = True
                if typ == 'bb':
                    if (S_.get('ve2') or {}).get(lan):   # khai báo riêng (U1: vè chào là vè của chính unit)
                        v2, vl = S_['ve2'][lan]; warm = {'ve': [strip(x) for x in v2], 've_l': vl}
                    else:   # kế hoạch chung: vè của chính unit, cả bài, Anh ở lần 1–2, Trung ở lần 3–4
                        vu, vi_, vl = KH.khoi_dong('LS', un)[lan]; warm = {'ve_ref': {'u': vu, 'i': vi_}, 've_l': vl}
                    if lan == 1: warm['names'] = NAMES
                    if lan == 2: warm['pages'] = [off, off + 1, off + 2]
                    if lan == 3: warm['pages'] = [off, off + 1]
                    if lan == 4: warm['fast'] = True
                    TX = S_.get('txt') or BB_TXT[kind]
                    o = {'type': 'bb', 'lan': lan, 'lab': 'Big book', 'sub': TX['sub'][lan], 'rules': TX['rules'][lan], 'title': S_['title'], 'title_zh': S_['title_zh'],
                         'pages': pages, 'names': NAMES, 'warm': warm, 'qs': cau_con() if lan == 4 else cau_hoi(lan)}
                    for k_ in ('frame', 'mine_h', 'mine_vi', 'photo_t', 'photo_k'):   # khung ảnh bìa, lời phần "câu của con" riêng từng unit
                        if S_.get(k_): o[k_] = S_[k_]
                    if bb_cmd(lan): o['cmd'] = bb_cmd(lan); o['co_img'] = NV + 'huou_huou1_a.webp'
                    out.append(o)
                else:
                    wp = [off + (3 * jv + t) % NP for t in range(3)]; jv += 1
                    out.append({'type': 'vek', 'lan': lan, 'lab': 'Vè', 'sub': VE_SUB[lan], 'rules': VE_RULES[lan], 'title': S_['ve_title'], 'title_zh': S_['ve_title_zh'],
                                'bpm': S_.get('bpm', 92), 'lines': [strip(x) for x in S_['vel']], 'pages': pages, 'warm': wp})
            elif s['type'] == 'noi' and typ == 'bb':
                continue   # nguyên tắc 27 (phương án a): ngày có big book bỏ bước Nói theo riêng
            else:
                out.append(s)
        days[n]['steps'] = out
        if typ == 'bb' and lan == 4 and days[n].get('t') == 'Các bạn nói gì?':   # (12/11) ngày không còn Nói theo: tên theo big book lần 4 (chị duyệt)
            days[n].update({'t': 'Con kể chuyện', 'goal': 'Kể lại big book và nói câu của con'})
        for k, v in (S_.get('day_fix') or {}).get(di, {}).items(): days[n][k] = v
    print('big book + vè 4 lần: unit', un, 'ngày', D_U, [f'{t}{l}' for t, l in S_['plan']])

# ---------- U3 · "Who Is She?" (trang đoán) ----------
for un, MU in sorted(MANG.U.items()):
    if not MU.get('bb_hoi'): continue
    BBP = MU['bb'][2]; bdir = BBP[0][0].rsplit('/', 1)[0]
    pages = ([pg_dict(bdir + '/bia_khung.webp', MU['bb'][0], MU['bb'][1], True)] if os.path.exists('little-seed/' + bdir + '/bia_khung.webp') else []) + [pg_dict(i, e, z) for i, e, z in BBP]
    off = 1 if pages[0].get('cover') else 0
    VEL = [ve_dict(e, z, (MU.get('ve_img') or [''] * 9)[k]) for k, (w, e, z, v) in enumerate(MU['ve'])]
    items = [{'k': ans, 'ap': off + pno, 'qpg': off + pno - 1, 'opts': opts} for pno, g, ans, opts in MU['bb_hoi']]
    mine = []
    for l, g in [('en', 'he'), ('zh', 'he'), ('en', 'she'), ('zh', 'she'), ('en', 'he')]:   # "Who is he? He is my ___" với gia đình con
        k = 'bo' if g == 'he' else 'me'; vp = next((pages[it['ap']] for it in items if it['k'] == k), None)
        mine.append({'l': l, 'q': ('Who is %s?' % g) if l == 'en' else '这是谁？', 'half': ('%s is my…' % g.capitalize()) if l == 'en' else '这是我…',
                     'cue': ('%s is my' % g.capitalize()) if l == 'en' else '这是我', 'vd': vp[l] if vp else ''})
    bbve_unit(un, {'pages': pages, 'kind': 'guess', 'names': {k: (FAM_TEN[k][0], FAM_TEN[k][1], FAM[k]) for k in FAM}, 'items': items, 'vel': VEL,
                   'mine': mine,
                   'plan': [('bb', 1), ('ve', 1), ('bb', 2), ('ve', 2), ('bb', 3), ('ve', 3), ('bb', 4), ('ve', 4)],
                   'title': MU['bb'][0], 'title_zh': MU['bb'][1], 've_title': MU['ten_en'], 've_title_zh': MU['ten_zh']})

# ---------- U1 · "Goodbye, Puppy!" (kể theo trình tự) + vè chào (ngoại lệ U1: 9 ngày, vè chào 5 ngày, big book 4 ngày) ----------
U1P = [pg_dict(bb_img(BB_BIA[0]), BB_BIA[1], BB_BIA[2], True)] + [pg_dict(bb_img(k), e, z) for k, e, z, p in BB]
U1N = {k: (k, W[k][0], W[k][2]) for k in ('mommy', 'daddy', 'teacher', 'friend', 'puppy', 'kitten')}
U1I = [{'k': 'mommy', 'ap': 2, 'opts': ['mommy', 'teacher', 'kitten']}, {'k': 'daddy', 'ap': 3, 'opts': ['puppy', 'daddy', 'friend']},
       {'k': 'teacher', 'ap': 5, 'opts': ['mommy', 'friend', 'teacher']}, {'k': 'friend', 'ap': 6, 'opts': ['friend', 'daddy', 'kitten']},
       {'k': 'puppy', 'ap': 8, 'opts': ['teacher', 'puppy', 'mommy']}, {'k': 'kitten', 'ap': 10, 'opts': ['daddy', 'friend', 'kitten']}]
# Vè chào đủ hai bài theo khung (build_ls48.py VE_CHAO, VE_BYE). Lời Trung câu 5–6 bài đầu và 3–4 bài cuối: bản nháp mới, chờ chị duyệt.
BBU1 = 'tai-nguyen-ls/bigbook/u1/'
VE_U1 = [ve_dict('Hello, hello, everyone!', '你好你好，大家好！', BBU1 + 'p7.webp'), ve_dict('Hello, teacher! Class is fun!', '老师老师，早上好！', BBU1 + 'p5.webp'),
         ve_dict("What's your name? What's your name?", '你叫什么名字呀？', BBU1 + 'p6.webp'), ve_dict("Leo, Leo, that's my name!", '我叫Leo，Leo呀！', BBU1 + 'p6.webp'),
         ve_dict('Leo, Leo, how old are you?', 'Leo，Leo，你几岁？', BBU1 + 'p6.webp'), ve_dict("Five! I'm five! And you? And you?", '五岁五岁，我五岁！', BBU1 + 'p6.webp'),
         ve_dict('Goodbye, goodbye, everyone!', '大家再见，再见啦！', BBU1 + 'p9.webp'), ve_dict('One, two, three… school is done!', '一二三，放学啦！', BBU1 + 'p9.webp'),
         ve_dict('See you tomorrow, Leo and Anna!', 'Leo，Anna，明天见！', BBU1 + 'p9.webp'), ve_dict("Goodbye, teacher! Let's go!", '老师老师，再见！', BBU1 + 'p9.webp')]
U1M = [{'l': l, 'q': '', 'half': 'Good night, …!' if l == 'en' else '…，晚安！', 'cue': 'Good night' if l == 'en' else '晚安', 'vd': vd}
       for l, vd in [('en', 'Good night, mommy!'), ('zh', '妈妈，晚安！'), ('en', 'Good night, daddy!'), ('zh', '爸爸，晚安！'), ('en', 'Good night, puppy!')]]
bbve_unit(1, {'pages': U1P, 'kind': 'seq', 'names': U1N, 'items': U1I, 'vel': VE_U1, 'qimg': NV + 'kids_bong_a.webp',
              # (13/11) khởi động hát cả bài, một tiếng mỗi lần: chào đầu (dòng 1–6) Anh · chào cuối (7–10) Anh · chào đầu Trung · chào cuối Trung
              've2': {1: (VE_U1[0:6], ['en']), 2: (VE_U1[6:10], ['en']), 3: (VE_U1[0:6], ['zh']), 4: (VE_U1[6:10], ['zh'])}, 'mine': U1M,
              # ngày 1–9: vè, big book xen kẽ; ngày sát buổi 1 và buổi 3 là ngày vè (con hát trọn hai vè chào ở buổi 1)
              'plan': [('ve', 1), ('bb', 1), ('ve', 2), ('bb', 2), ('ve', 3), ('bb', 3), ('ve', 3), ('bb', 4), ('ve', 4)],
              'title': 'Goodbye, Puppy!', 'title_zh': '小狗，再见！', 've_title': 'Hello and Goodbye!', 've_title_zh': '你好，再见！',
              'frame': {'left': 52, 'top': 15.5, 'width': 39.3, 'height': 45.4},
              'day_fix': {8: {'t': 'Vè chào – lồng tiếng', 'goal': 'Hát trọn hai vè chào, lồng tiếng gửi cô'}}})

# ---------- U2 · "My Name Is…" (kể theo trình tự, bản final 12 trang chị duyệt 13/11) ----------
# Tiệc sinh nhật Bông: khách đeo mặt nạ, Bông hỏi tên, khách đùa xưng tên con vật; trang cuối Puppy thật đeo mặt nạ cún.
# Câu hỏi chỉ về 4 nhân vật có trang trả lời riêng (Leo tr4, Anna tr8, Bông tr9 được mẹ hỏi tuổi, Puppy tr12), để lần 2 lựa chọn nào cũng là một trang thật.
# Bìa khung ảnh: lần 4 con dán ảnh của con, nói tên và tuổi của con.
MU2 = MANG.U[2]; BBU2 = 'tai-nguyen-ls/bigbook/u2/'
U2P = [pg_dict(BBU2 + 'bia_khung.webp', MU2['bb'][0], MU2['bb'][1], True)] + [pg_dict(i, e, z) for i, e, z in MU2['bb'][2]]
U2N = {'bong': ('Bông', 'Bông', NV + 'kids_bong_a.webp'), 'leo': ('Leo', 'Leo', NV + 'kids_leo_a.webp'), 'anna': ('Anna', 'Anna', NV + 'kids_anna_a.webp'),
       'puppy': ('Puppy', '小狗', NV + 'pets_cun_dung_a.webp')}
U2I = [{'k': 'leo', 'ap': 4, 'opts': ['puppy', 'leo', 'anna']}, {'k': 'anna', 'ap': 8, 'opts': ['anna', 'bong', 'leo']},
       {'k': 'bong', 'ap': 9, 'opts': ['leo', 'anna', 'bong']}, {'k': 'puppy', 'ap': 12, 'opts': ['bong', 'puppy', 'leo']}]
# tranh dòng vè lấy trang big book (dòng 1 mẹ bưng bánh, 2 đếm nến, 3 Bông hỏi tên ở cửa, 4 Leo nói tên, tuổi)
VE_U2 = [ve_dict(e, z, BBU2 + im) for (w, e, z, v), im in zip(MU2['ve'], ['p9.webp', 'p10.webp', 'p1.webp', 'p4.webp'])]
U2M = [{'l': 'en', 'q': "What's your name?", 'half': 'My name is…', 'cue': 'My name is', 'vd': 'My name is Bông.'},
       {'l': 'zh', 'q': '你叫什么名字？', 'half': '我叫…', 'cue': '我叫', 'vd': '我叫Bông。'},
       {'l': 'en', 'q': 'How old are you?', 'half': "I'm…", 'cue': "I'm", 'vd': "I'm six."},
       {'l': 'zh', 'q': '你几岁？', 'half': '我…岁。', 'cue': '我', 'vd': '我六岁。'},
       {'l': 'en', 'q': "Hello! What's your name?", 'half': 'Hello! My name is…', 'cue': 'Hello! My name is', 'vd': 'Hello! My name is Leo.'}]
TX_U2 = {'sub': {1: 'Lần 1 · Nghe cả quyển, chạm đúng bạn', 2: 'Lần 2 · Đoán trang sau là ai', 3: 'Lần 3 · Đọc đuổi, điền tên', 4: 'Lần 4 · Con kể, rồi giới thiệu về con'},
         'rules': {1: ['Khởi động: con nghe bài vè và nghe tên các bạn trong truyện.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con nghe câu nói và chạm đúng bạn đó. Cần thì bấm 💡.'],
                   2: ['Khởi động: con nghe bài vè và nghe lại 3 trang đầu.', 'Cô đọc cả quyển bằng tiếng Anh, rồi bằng tiếng Trung.', 'Rồi con đoán: trang sau là ai? Con chạm vào tranh trang sau.'],
                   3: ['Khởi động: con nghe bài vè và 2 trang đầu.', 'Đọc đuổi tiếng Anh rồi tiếng Trung: cô đọc, cô và con cùng đọc, rồi con đọc một mình.', 'Rồi con chọn đúng bạn điền vào chỗ trống.'],
                   4: ['Khởi động: con nghe bài vè và nghe nhanh cả quyển.', 'Con kể: cô nói nửa câu, con nói tên.', 'Rồi con giới thiệu về con: "My name is…", "I\'m…".']}}
bbve_unit(2, {'pages': U2P, 'kind': 'seq', 'names': U2N, 'items': U2I, 'vel': VE_U2, 'qimg': BBU2 + 'bia_khung.webp', 'txt': TX_U2, 'mine': U2M,
              'plan': [('bb', 1), ('ve', 1), ('bb', 2), ('ve', 2), ('bb', 3), ('ve', 3), ('bb', 4), ('ve', 4)],
              'title': MU2['bb'][0], 'title_zh': MU2['bb'][1], 've_title': MU2['ten_en'], 've_title_zh': MU2['ten_zh'],
              'frame': {'left': 63.2, 'top': 24.1, 'width': 29.4, 'height': 56.1},   # ô ảnh trên bia_khung.webp (đo 13/11: 1005–1486 × 283–962 / 1600×1196)
              'mine_h': 'Con giới thiệu', 'mine_vi': 'Giờ con giới thiệu về con nhé! Con nhìn ảnh rồi nói tên, nói tuổi của con.',
              'photo_t': 'ảnh của con', 'photo_k': 'lsd-anh-cua-con'})
# Unit chưa dựng big book + vè 4 lần: vẫn đưa lời vè vào kho để khởi động unit sau trỏ tới được
for _u, _M in sorted(MANG.U.items()):
    if _u not in VE_U:
        _im = [i for i, e, z in _M['bb'][2] if str(i).endswith('.webp')]
        VE_U[_u] = [{k: v for k, v in ve_dict(e, z, (_im[k % len(_im)] if _im else '')).items()} for k, (w, e, z, v) in enumerate(_M['ve'])]
# Không để bước rỗng (chị chốt 12/11): bước không có bài tập bên trong thì bỏ, in ra để sửa nguồn
_K = ('cards', 'scenes', 'lines', 'turns', 'qs', 'items', 'pages', 'opts', 'quiz')
for n, d in days.items():
    keep = [st for st in d['steps'] if not [k for k in _K if isinstance(st.get(k), list)] or any(st.get(k) for k in _K if isinstance(st.get(k), list))]
    if len(keep) != len(d['steps']): print('  !! ngày', n, 'bỏ bước rỗng:', [st['type'] for st in d['steps'] if st not in keep])
    d['steps'] = keep
out = {'who': who, 'days': {str(k): v for k, v in sorted(days.items())}, 'lop': {str(k): v for k, v in lop.items()}, 'map': mp,
       'soon': {str(k): v for k, v in soon.items()}, 'vi': SD0['vi'], 'vi_a': deep(SD0['vi_a']), 'vi_t': SD0.get('vi_t', {}), 'bg': {},
       'reader': reader, 'units_q': units_q, 'aumap': {}, 'vi_tx': deep(SD0['vi_tx']), 've_u': {str(k): v for k, v in sorted(VE_U.items())}}
open('little-seed/little-seed-data.js', 'w').write('/* Dữ liệu web Little Seed 48 buổi – sinh từ little-seed48.json và mạng văn bản U1 (cong-cu/build_ls.py). Đừng sửa tay. */\nwindow.SD=' + json.dumps(out, ensure_ascii=False) + ';\n')
miss = sorted(set(MISS))
json.dump(miss, open('little-seed/cong-cu/giong_thieu.json', 'w'), ensure_ascii=False, indent=0)
print('ngày:', sorted(days), '· câu chưa có giọng thu sẵn:', len(miss))
for m in miss: print('  ', m)
