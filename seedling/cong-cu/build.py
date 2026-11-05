"""Dựng dữ liệu web Seedling 48 buổi (99 ngày) từ days.json (parse.py) + bản demo Unit 1.
Chạy: python3 -I build.py <work_dir> <out_js> <out_report_md>
- Ngày 1, 2, 3, 8: giữ bản demo đã duyệt (tranh cảnh Unit 1, giọng thu sẵn), thêm bước vận động.
- Các ngày khác: sinh tự động theo đúng thứ tự bước của tab "Bước ngày web", nội dung lấy từ v6.
- Tranh: chỉ dùng tranh phong cách 21 ngày (Little Seed, nhân vật, quà, cảnh Unit 1). Chỗ chưa có tranh
  dùng biểu tượng tạm và ghi vào danh sách cần vẽ.
"""
import json, re, sys, random, os
from pypinyin import pinyin, Style

sys.path.insert(0, os.path.dirname(__file__))
from parse import has_py, zh_entry, items, tag, zh_sent, split_list, PY_CH

W = sys.argv[1]
OUT, REPORT = sys.argv[2], sys.argv[3]
random.seed(20261105)
ALL = json.load(open(f'{W}/days.json'))
D = {int(k): v for k, v in ALL['days'].items()}
BUOI = {int(k): v for k, v in ALL['buoi'].items()}
STORIES = ALL['stories']
LS = json.load(open(f'{W}/ls_assets.json'))
DEMO = json.load(open(f'{W}/demo_sd.json'))
TN = 'tai-nguyen/'
CJK = re.compile(r'[㐀-鿿]')
MISS_IMG, MISS_AU = {}, set()

# ---------------------------------------------------------------- nhân vật
def avatar(ch, c1, c2):
    svg = (f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='{c1}' stroke='#fff' stroke-width='6'/>"
           f"<text x='50' y='64' font-family='Baloo 2,Arial' font-weight='800' font-size='44' text-anchor='middle' fill='{c2}'>{ch}</text></svg>")
    return 'data:image/svg+xml;utf8,' + svg.replace('#', '%23').replace('<', '%3C').replace('>', '%3E').replace("'", '%27').replace(' ', '%20')

NV = TN + 'nhan-vat/'
WHO = dict(DEMO['who'])
WHO.update({
    'nhan': ['Vũ', NV + 'nv_vu_a.webp'],
    'man': ['The man · 表演的人', NV + 'nv_nguoi_dien_a.webp'],
    'hoa': ['Miss Hoa · Hoa姐姐', NV + 'nv_hoa_a.webp'],
    'anh_nhan': ["Vũ's brother · 哥哥", NV + 'nv_anh_vu_a.webp'],
    'lan': ['Mrs Lan · Lan老师', NV + 'nv_lan_a.webp'],
    'me_bong': ['Mummy · 妈妈', NV + 'fam_bong_me_a.webp'], 'bo_bong': ['Daddy · 爸爸', NV + 'fam_bong_bo_a.webp'],
    'me_leo': ['Mummy · 妈妈', NV + 'fam_leo_me_a.webp'], 'bo_leo': ['Dad · 爸爸', NV + 'fam_leo_bo_a.webp'],
    'me_xm': ["Xiaomei's mummy · 妈妈", NV + 'fam_xiaomei_me_a.webp'],
    'ba': ['Grandma · 奶奶', NV + 'fam_bong_ba_a.webp'],
    'ong': ['Grandpa · 爷爷', NV + 'fam_bong_ong_a.webp'],
})
OWNER = {'1': 'bong', '2': 'nhan', '3': 'bong', '4': 'bong', '5': 'leo', '6': 'bong', '7': 'leo', '8': 'leo', '9': 'bong',
         '10': 'leo', '11': 'bong', '12': 'leo', 'Ôn': 'bong'}
def who_key(w, unit):
    if w in ('me', 'bo'):
        o = OWNER.get(unit, 'bong')
        k = f'{w}_{o}'
        return k if k in WHO else f'{w}_bong'
    return w if w in WHO else 'narr'

UNIT_INFO = {
    '1': ('Greeting', '问好', 'ls_class'), '2': ('Name and age', '名字和年龄', 'ls_park'), '3': ('Family', '家庭', 'ls_class'),
    '4': ('Body', '身体', 'ls_park'), '5': ('Feelings', '感觉', 'ls_home'), '6': ('School things', '学习用品', 'ls_school'),
    '7': ('Home', '家', 'ls_home'), '8': ('Animals', '动物', 'ls_park'), '9': ('Food', '食物', 'ls_park'),
    '10': ('Weather', '天气', 'ls_park'), '11': ('Clothes and colours', '衣服和颜色', 'ls_home'), '12': ('Party and time', '派对', 'ls_class'),
    'Ôn': ('Review', '复习', 'ls_school'),
}
def bg_img(unit):
    return TN + 'trang/' + UNIT_INFO.get(unit, UNIT_INFO['Ôn'])[2] + '.webp'

# ---------------------------------------------------------------- tranh cho từ
LS_PIC = {k.lower(): v['pic'] for k, v in LS['pics'].items()}
EXTRA_PIC = {
    'mommy': NV + 'fam_bong_me_a.webp', 'mother': NV + 'fam_bong_me_a.webp', 'mummy': NV + 'fam_bong_me_a.webp',
    'daddy': NV + 'fam_bong_bo_a.webp', 'father': NV + 'fam_bong_bo_a.webp', 'dad': NV + 'fam_bong_bo_a.webp',
    'grandpa': NV + 'fam_bong_ong_a.webp', 'grandma': NV + 'fam_bong_ba_a.webp', 'baby': NV + 'fam_bong_em_gai_a.webp',
    'older': NV + 'fam_bong_anh_trai_a.webp', 'younger': NV + 'fam_bong_em_gai_a.webp', 'family': NV + 'bang_fam_bong.webp',
    'girl': NV + 'kids_anna_a.webp', 'kid': NV + 'kids_bong_a.webp', 'kids': TN + 'canh/u1/w_kids_c.webp', 'class': TN + 'canh/u1/w_kids_c.webp',
    'friend': NV + 'kids_xiaomei_a.webp', 'teacher': NV + 'nv_lan_a.webp', 'mrs': NV + 'nv_lan_a.webp', 'mrs lan': NV + 'nv_lan_a.webp', 'miss hoa': NV + 'nv_hoa_a.webp', 'photographer': NV + 'nv_hoa_a.webp',
    'man/men': TN + 'canh/u1/w_two_men_c.webp', 'man': TN + 'canh/u1/w_two_men_c.webp',
    'dog': TN + 'qua/pet_cun_1.webp', 'puppy': TN + 'qua/pet_cun_1.webp', 'cat': NV + 'pets_meo_ngoi_a.webp', 'kitten': NV + 'pets_meo_ngoi_a.webp',
    'pencil': TN + 'qua/gift_but_chi.webp', 'crayon': TN + 'qua/gift_sap_mau.webp', 'notebook': TN + 'qua/gift_so_tay.webp', 'pencil case': TN + 'qua/gift_hop_but.webp',
    'toy': TN + 'qua/gift_xe.webp', 'school': TN + 'trang/ls_school.webp', 'park': TN + 'trang/ls_park.webp', 'home': TN + 'trang/ls_home.webp',
    'photo': TN + 'trang/ls_album.webp', 'write': TN + 'canh/u1/the_write_c.webp', 'sorry': TN + 'canh/u1/p3_3_c.webp',
    'mum': NV + 'fam_bong_me_a.webp', 'brother': NV + 'fam_bong_anh_trai_a.webp', 'sister': NV + 'fam_anna_chi_gai_a.webp',
    'good morning': TN + 'canh/u1/p1_2_c.webp', 'morning': TN + 'canh/u1/p1_2_c.webp', 'wave': TN + 'canh/u1/p3_8_c.webp',
}
EMO = {
    'a lot': '🔢', 'a pair': '🧦', 'again': '🔁', 'all': '👐', 'angry': '😠', 'animal': '🐾', 'apartment': '🏢', 'flat': '🏢', 'apple': '🍎', 'arm': '💪',
    'aunt': '👩', 'bag': '👜', 'ball': '⚽', 'banana': '🍌', 'bed': '🛏️', 'bedroom': '🛏️', 'bird': '🐦', 'birthday': '🎂', 'black': '⚫', 'blue': '🔵',
    'board': '🧑‍🏫', 'boat': '⛵', 'body': '🧍', 'book': '📖', 'bounce': '🏀', 'bounce the ball': '🏀', 'bread': '🍞', 'brown': '🟤', 'burger': '🍔',
    'cake': '🎂', 'candy': '🍬', 'sweets': '🍬', 'chair': '🪑', 'chinese': '🀄', 'chips': '🍟', 'fries': '🍟', 'clap': '👏', 'clap your hands': '👏',
    'close': '🙈', 'clothes': '👕', 'cloudy': '☁️', 'coat': '🧥', 'jacket': '🧥', 'cold': '🥶', 'colour': '🎨', 'come': '👋', 'cool': '😎', 'count': '🔢',
    'cross': '❌', 'day': '🌞', 'dining room': '🍽️', 'door': '🚪', 'down': '⬇️', 'dress': '👗', 'skirt': '👗', 'drink': '🥤', 'drop': '💧', 'duck': '🦆',
    'ear': '👂', 'ears': '👂', 'eat': '🍽️', 'egg': '🥚', 'eight': '8️⃣', 'eraser': '🧽', 'excited': '🤩', 'eye': '👁️', 'eyes': '👀', 'favourite': '💖',
    'feel': '🙂', 'feet': '🦶', 'foot': '🦶', 'finger': '☝️', 'fish': '🐟', 'fly': '🕊️', 'food': '🍱', 'forest': '🌲', 'frog': '🐸', 'fruit': '🍓',
    'fun': '😄', "it's fun": '😄', 'game': '🎲', 'glasses': '👓', 'glue': '🧴', 'go': '🚶', 'go away': '👋', 'go out': '🚪', 'go to bed': '😴',
    'gold': '🥇', 'good': '👍', 'goodbye': '👋', 'green': '🟢', 'grey': '🩶', 'hair': '💇', 'hand': '✋', 'hands': '🙌', 'happy': '😊', 'hat': '🧢',
    'head': '🙂', 'hello': '👋', 'hooray': '🎉', 'hop': '🐇', 'hot': '🥵', 'hungry': '🍽️', 'ice cream': '🍦', 'in': '📥', 'jeans': '👖', 'juice': '🧃',
    'jump': '🤸', 'keyboard': '⌨️', 'knee': '🦵', 'lamp': '💡', 'learn': '📚', 'leg': '🦵', 'letter': '🔤', 'like': '💛', 'line': '🧍‍♂️', 'make a line': '🧍‍♂️',
    'living room': '🛋️', 'long': '📏', 'look': '👀', 'love': '❤️', 'i love': '❤️', 'milk': '🥛', 'monkey': '🐒', 'mouse': '🐭', 'mouth': '👄',
    'open your mouth': '😮', 'name': '📛', 'new': '✨', 'nice': '😋', 'yummy': '😋', 'nine': '9️⃣', 'no': '🙅', 'noodles': '🍜', 'nose': '👃',
    'number': '🔢', "o'clock": '🕗', 'old': '🎂', 'on': '⬆️', 'one': '1️⃣', 'two': '2️⃣', 'three': '3️⃣', 'four': '4️⃣', 'five': '5️⃣', 'six': '6️⃣',
    'seven': '7️⃣', 'ten': '🔟', 'open': '📂', 'orange': '🍊', 'party': '🎉', 'pen': '🖊️', 'person': '🧑', 'people': '👨‍👩‍👧', 'person/people': '👨‍👩‍👧',
    'pick up': '🤲', 'picnic': '🧺', 'pink': '🩷', 'pizza': '🍕', 'play': '🧸', 'polar bear': '🐻‍❄️', 'purple': '🟣', 'rabbit': '🐰', 'rain': '🌧️',
    'rainbow': '🌈', 'rainy': '🌧️', 'read': '📖', 'red': '🔴', 'rice': '🍚', 'right': '👉', 'ruler': '📏', 'run': '🏃', 'sad': '😢', 'saturday': '📅',
    'sunday': '📅', 'scared': '😨', 'scarf': '🧣', 'schoolbag': '🎒', 'scissors': '✂️', 'see you': '👋', 'see you tomorrow': '👋', 'shoe': '👟', 'shop': '🏪',
    'shorts': '🩳', 'shoulder': '🤷', 'silver': '🥈', 'sleepy': '😪', 'small': '🤏', 'smile': '😃', 'snowman': '⛄', 'snowy': '❄️', 'sock': '🧦', 'socks': '🧦',
    'sofa': '🛋️', 'stamp': '🦶', 'stamp your feet': '🦶', 'stay at home': '🏠', 'stay': '🏠', 'sunny': '☀️', 'swim': '🏊', 'table': '🪑', 'table tennis': '🏓',
    'tail': '🐁', 'take a photo': '📷', 'tall': '🦒', 'tell a story': '📖', 'tell': '🗣️', 'thank you': '🙏', 'thirsty': '🥤', 'tired': '🥱', 'today': '📅',
    'toe': '🦶', 'tomorrow': '📅', 'touch': '👆', 'town': '🏘️', 'trousers': '👖', 'tyre': '🛞', 'umbrella': '☂️', 'uncle': '👨', 'under': '⬇️', 'use': '🖐️',
    'vietnamese': '🇻🇳', 'want': '🙋', 'water': '💧', 'wear': '👕', 'weather': '🌦️', 'white': '⚪', 'window': '🪟', 'windy': '🌬️', 'wing': '🪽', 'word': '🔤',
    'wow': '😮', 'year': '🗓️', 'yellow': '🟡', 'yes': '🙆', 'big': '🐘', 'little': '🐭', 'tennis racket': '🎾', 'song': '🎵', 'story': '📖', 'lesson': '🔔',
    'video': '📺', 'let\'s': '🙌', 'excited!': '🤩', 'nine years old': '9️⃣', 'how old': '🎂', 'me too': '🙋', 'what': '❓', 'where': '❓', 'who': '❓',
    'how many': '🔢', 'good morning, class': '🏫', 'hello, kids': '👋', 'meet': '🤝', 'nice to meet you': '🤝', 'about': '❓', 'my': '🙋', 'you': '👉',
}
def norm_en(t):
    t = re.sub(r'\(.*?\)', '', t).split(' – ')[0].split(';')[0].split(' = ')[0]
    t = t.split(',')[0] if ',' in t and len(t.split(',')[0].split()) <= 2 else t
    return t.strip().strip('!?.').lower()

def img_for(en_text):
    k = norm_en(en_text)
    for cand in (k, k.rstrip('s'), k.split('/')[0].strip(), k.split()[-1] if k.split() else k):
        if cand in EXTRA_PIC:
            return EXTRA_PIC[cand], ''
        if cand in LS_PIC:
            return LS_PIC[cand], ''
    for cand in (k, k.rstrip('s'), k.split('/')[0].strip(), k.split()[-1] if k.split() else k, k.split()[0] if k.split() else k):
        if cand in EMO:
            MISS_IMG[k] = EMO[cand]
            return '', EMO[cand]
    MISS_IMG[k] = '🖼️'
    return '', '🖼️'

# tranh từ vựng vẽ bằng Gemini (19 tờ 9 ô, cắt ra tai-nguyen/tranh/)
if os.path.exists(f'{W}/gen_pic.json'):
    for _w, _f in json.load(open(f'{W}/gen_pic.json')).items():
        EXTRA_PIC.setdefault(norm_en(_w), TN + 'tranh/' + _f)

# ---------------------------------------------------------------- giọng có sẵn
AU = dict(LS['au'])
if os.path.exists(f'{W}/gen_au.json'):
    AU.update(json.load(open(f'{W}/gen_au.json')))
def au(t, l):
    a = AU.get(f'{l}:{t}') or AU.get(f'{l}:{t.strip("!.?")}') or ''
    if not a:
        MISS_AU.add((l, t))
    return a

PY_MAP = {}
PUNCT = {'，': ',', '。': '.', '！': '!', '？': '?', '、': ',', '：': ':', '“': '"', '”': '"', '…': '…', '——': ' – ', '；': ';'}
def _key(z):
    return re.sub(r'[\s，。！？、：“”…—;；,.!?"]', '', z)
def add_py(z, py):
    if z and py and CJK.search(z) and has_py(py):
        PY_MAP.setdefault(_key(z), py.strip())
WORD_PY = {}
def py_of(zh):
    zh = zh.strip()
    if not zh:
        return ''
    k = _key(zh)
    if k in PY_MAP:
        return PY_MAP[k]
    out = []
    toks = re.findall(r'[㐀-鿿]+|[A-Za-zÀ-ỹ0-9]+|[^㐀-鿿A-Za-zÀ-ỹ0-9]', zh)
    for t in toks:
        if CJK.match(t):
            j = 0
            while j < len(t):
                for L in range(min(5, len(t) - j), 0, -1):
                    w = t[j:j + L]
                    if L > 1 and w in WORD_PY:
                        out.append(WORD_PY[w]); j += L; break
                    if L == 1:
                        out.append(pinyin(w, style=Style.TONE)[0][0]); j += 1
        elif t in PUNCT:
            out.append(PUNCT[t])
        elif t.strip() and re.match(r'\w', t):
            out.append(t)
    txt = ''
    for t in out:
        if t in (',', '.', '!', '?', ':', ';', '…', '"', ' – '):
            txt += t
        else:
            txt += (' ' if txt else '') + t
    txt = re.sub(r'\s+', ' ', txt).strip()
    txt = re.sub(r'([.!?]\s+)([a-zāáǎàēéěèīíǐìōóǒòūúǔù])', lambda m: m.group(1) + m.group(2).upper(), txt)
    return txt[:1].upper() + txt[1:]

def clean_zh(s):
    return re.sub(r'\s+', '', s)

# ---------------------------------------------------------------- từ điển Anh – Trung (để ghép cặp, cầu nối)
DICT = []   # (zh, py, en)
for d in D.values():
    for e in d['zh_new'] + d['zh_on'] + d['nen_zh'] + d['bg_zh'] + d['nlq_zh']:
        if e['en']:
            DICT.append((e['zh'], e['py'], e['en']))
for en_, v in LS['pics'].items():
    DICT.append((v['zh'], '', en_))
for z, p, e in DICT:
    if p and CJK.search(z) and len(z) > 1:
        WORD_PY.setdefault(z, p)
for d in D.values():
    for it in d['sent_zh']:
        tg, b = tag(it)
        b = re.sub(r'^\[[^\]]*\]\s*', '', b)
        for seg in re.split(r'\s[·/]\s|——|\s—\s', b):
            for m in re.finditer(r'([^()\[\]]*?[\u3400-\u9fff][^()\[\]]*?)\s*\(([^()]*)\)', seg):
                z = re.sub(r'^.*?[:：]\s*(?=[^:：]*$)', '', m.group(1)).strip() if '：' not in m.group(1)[-3:] else m.group(1)
                add_py(re.sub(r'^\d\.\s*', '', m.group(1)).strip(), m.group(2))
    for ph in d['phr_zh'].split(' / '):
        m = re.match(r'^(?:\([^)]*\)\s*)?([^a-zA-Z' + PY_CH + r']+?)\s+([a-zA-Z' + PY_CH + r'].*)$', ph.strip())
        if m:
            add_py(m.group(1), m.group(2))
    # câu truyện: tách pinyin theo câu, khớp số câu
    zs = [x for x in re.split(r'(?<=[。！？])', re.sub(r'[“”]', '', d['story_zh'])) if x.strip()]
    ps = [x for x in re.split(r'(?<=[.!?])\s+(?=["“A-ZĀÁǍÀĒÉĚÈŌÓǑÒ\[])', re.sub(r'[“”]', '', d['story_py'])) if x.strip()]
    if len(zs) == len(ps):
        for z, p_ in zip(zs, ps):
            z2 = re.sub(r'^[^：]{1,8}：', '', z); p2 = re.sub(r'^[^:]{1,14}:\s*', '', p_)
            add_py(z, p_); add_py(z2, p2)
ZH2EN = {}
for z, p, e in DICT:
    ZH2EN.setdefault(z, (p, e))
EN2ZH = {}
for z, (p, e) in ZH2EN.items():
    for part in re.split(r'[,/;]| – | = ', re.sub(r'\(.*?\)', '', e)):
        part = part.strip().lower().strip('!?.')
        if part:
            EN2ZH.setdefault(part, (z, p))

def card(en_t, zh_t='', py=''):
    img, e = img_for(en_t)
    c = {'en': en_t, 'zh': zh_t, 'py': py or (py_of(zh_t) if zh_t else ''), 'img': img, 'a_en': au(en_t, 'en'), 'a_zh': au(zh_t, 'zh') if zh_t else ''}
    if e:
        c['e'] = e
    return c

def clean_gloss(g):
    g = re.sub(r'\(.*?\)', '', g).split(' – ')[0].split(';')[0].split(' = ')[0]
    if ':' in g:
        g = g.split(':', 1)[1] if len(g.split(':', 1)[0].split()) <= 1 else g.split(':', 1)[0]
    g = g.split(' · ')[0]
    if ',' in g and all(len(x.split()) <= 2 for x in g.split(',')):
        g = g.split(',')[0]
    return g.strip().strip('“”"')
def gloss(e):
    g = clean_gloss(e['en'])
    if not g and e['zh'] in ZH2EN:
        g = clean_gloss(ZH2EN[e['zh']][1])
    return g

# ---------------------------------------------------------------- truyện
def sentences_en(text):
    """Tách đoạn kể kiểu 'Leo says, “…”' thành câu, đoán người nói."""
    text = re.sub(r'\s+', ' ', text)
    parts = re.split(r"(?<=[.!?…])['’”]?\s+(?=['‘“A-Z\[])", text)
    out = []
    names = {'Dad': 'bo', 'Daddy': 'bo', 'Mummy': 'me', 'Grandma': 'ba', 'Grandpa': 'ong', 'Mrs Lan': 'lan', 'Anna': 'anna', 'Leo': 'leo',
             'Bông': 'bong', 'Xiaomei': 'xiaomei', 'Nhan': 'nhan', 'Vũ': 'nhan', 'Miss Hoa': 'hoa'}
    for p in parts:
        p = p.strip()
        if not p:
            continue
        w = 'narr'
        m = re.search(r"(?:says|asks|shouts)\s+(Mrs Lan|Miss Hoa|[A-Z]\w+)", p) or re.match(r"^(Mrs Lan|Miss Hoa|[A-Z]\w+)\s+(?:says|asks|shouts)", p)
        if m and m.group(1) in names and ("'" in p or '“' in p):
            w = names[m.group(1)]
        if (p.count("'") - len(re.findall(r"\w'\w", p))) % 2 == 1:
            p = p.strip("'‘’")
        out.append([w, p])
    return out

def sentences_zh(text):
    parts = re.split(r'(?<=[。！？”])(?=[^”。！？])', clean_zh(text))
    out = []
    from parse import ZH_SPK
    for p in parts:
        if not p:
            continue
        w = 'narr'
        m = re.match(r'^(' + '|'.join(sorted((re.escape(k) for k in ZH_SPK), key=len, reverse=True)) + r')(?:说|问)?：', p)
        if m:
            w = ZH_SPK[m.group(1)]; p2 = p[m.end():]
            p = p2.strip('“”') if p2.startswith('“') and p2.endswith('”') else p2
        out.append([w, p])
    return out

def story_step(d, unit, kp=None):
    te, tz = d['turns_en'], d['turns_zh']
    title = d['story_title'].strip(); title_zh = d['story_title_zh'].split(' (')[0].strip()
    img = bg_img(unit)
    aligned = te and tz and [w for w, _ in te] == [w for w, _ in tz]
    if not aligned or len(te) < 3:
        se = [[who_key(w, unit), s] for w, s in sentences_en(d['story_en'])]
        sz = [[who_key(w, unit), s] for w, s in sentences_zh(d['story_zh'])]
        if len(se) == len(sz) and len(se) >= 2:
            sc = []
            for (w1, e), (w2, z) in zip(se, sz):
                w = w1 if w1 != 'narr' else w2
                sc.append({'who': w, 'img': img, 'en': e, 'zh': z, 'py': py_of(z), 'a_en': au(e, 'en'), 'a_zh': au(z, 'zh')})
            return {'type': 'truyen', 'title': title, 'title_zh': title_zh, 'scenes': sc}, sc
    if aligned and len(te) >= 3 or (aligned and not (len(sentences_en(d['story_en'])) > 1)):
        sc = []
        for (w, e), (_, z) in zip(te, tz):
            k = who_key(w, unit)
            sc.append({'who': k, 'img': img, 'en': e, 'zh': z, 'py': py_of(z), 'a_en': au(e, 'en'), 'a_zh': au(z, 'zh')})
        return {'type': 'truyen', 'title': title, 'title_zh': title_zh, 'scenes': sc}, sc
    se = [[who_key(w, unit), s] for w, s in sentences_en(d['story_en'])]
    sz = [[who_key(w, unit), s] for w, s in sentences_zh(d['story_zh'])]
    sc_en = [{'who': w, 'img': img, 'en': s, 'a_en': au(s, 'en')} for w, s in se]
    sc_zh = [{'who': w, 'img': img, 'zh': s, 'py': py_of(s), 'a_zh': au(s, 'zh')} for w, s in sz]
    return {'type': 'truyen', 'title': title, 'title_zh': title_zh, 'scenes_en': sc_en, 'scenes_zh': sc_zh}, None

def speaker_lines(step):
    """Các câu có người nói rõ (không phải lời dẫn), cả hai tiếng."""
    L = []
    if 'scenes' in step:
        for s in step['scenes']:
            if s['who'] != 'narr':
                L.append((s['who'], 'en', s['en'], '')); L.append((s['who'], 'zh', s['zh'], s['py']))
    else:
        for s in step['scenes_en']:
            if s['who'] != 'narr':
                L.append((s['who'], 'en', s['en'], ''))
        for s in step['scenes_zh']:
            if s['who'] != 'narr':
                L.append((s['who'], 'zh', s['zh'], s['py']))
    return L

def short(t, l):
    return len(t.split()) <= 9 if l == 'en' else len(t) <= 16

# ---------------------------------------------------------------- câu hỏi, cầu nối, phiên dịch nhí
def qa_en(sent):
    out = []
    for it in sent:
        tg, body = tag(it)
        if tg:
            continue
        m = re.match(r'^(.+?\?)\s+[–—-]\s+(.+)$', body)
        if m:
            out.append((m.group(1).strip(), m.group(2).strip()))
    return out

def qa_zh(sent):
    out = []
    for it in sent:
        tg, body = tag(it)
        if tg:
            continue
        b = re.sub(r'\(=\s*[^)]*\)\s*$', '', body).strip()
        m = re.match(r'^(.+?[？?])\s*(?:\([^)]*\))?\s*(?:——|—|–|-)\s*(.+)$', b)
        if m:
            q = re.sub(r'\s*\([^)]*\)', '', m.group(1)).strip(); a = re.sub(r'\s*\([^)]*\)', '', m.group(2)).strip()
            if CJK.search(q) and CJK.search(a):
                out.append((clean_zh(q), clean_zh(a)))
    return out

EN_LBL = {'Bông': 'bong', 'Leo': 'leo', 'Anna': 'anna', 'Xiaomei': 'xiaomei', 'Nhan': 'nhan', 'Vũ': 'nhan', 'Mrs Lan': 'lan', 'Mummy': 'me', 'Grandpa': 'ong',
          'Grandma': 'ba', 'Dad': 'bo', 'Daddy': 'bo', 'Kids': 'kids', 'The man': 'man', 'Miss Hoa': 'hoa'}
def key_pairs(d, unit):
    """Các câu chính của ngày: ô Câu tiếng Anh và tiếng Trung xếp song song theo thứ tự (không gồm câu hỏi – đáp)."""
    E, Z = [], []
    for it in d['sent_en']:
        tg, b = tag(it)
        if not tg and not re.match(r'^.+?\?\s+[–—-]\s+', b) and not b.startswith(('Listen and say', 'Look at')):
            E.append(b)
    for it in d['sent_zh']:
        tg, b = tag(it)
        if tg or not CJK.search(b) or re.search(r'[？?]\s*(?:\([^)]*\))?\s*(?:——|—|–)', b) or b.startswith(('听后重复', '(nghe')):
            continue
        z, py, e = zh_sent(b)
        Z.append(z)
    if len(E) != len(Z) or not E:
        return []
    out = []
    for e, z in zip(E, Z):
        w = 'narr'
        m = re.match(r'^(' + '|'.join(sorted(map(re.escape, EN_LBL), key=len, reverse=True)) + r'):\s*(.+)$', e)
        if m:
            w = EN_LBL[m.group(1)]; e = m.group(2)
        z = clean_zh(z)
        from parse import ZH_SPK
        mz = re.match(r'^(' + '|'.join(sorted(map(re.escape, ZH_SPK), key=len, reverse=True)) + r')：(.+)$', z)
        if mz:
            z = mz.group(2)
            if w == 'narr':
                w = ZH_SPK[mz.group(1)]
        e = e.strip().strip("'‘’“”")
        out.append((who_key(w, unit), e, z.strip('“”')))
    return out

def hoi_step(d, unit, lines_pool):
    rounds = []
    E = qa_en(d['sent_en'])[:5]; Z = qa_zh(d['sent_zh'])[:5]
    def opts_for(ans, pool):
        others = [p for p in pool if p != ans]
        random.shuffle(others)
        o = [ans] + others[:2]
        random.shuffle(o)
        return o, o.index(ans)
    if E:
        pool = [a for _, a in E] + [t for w, l, t, _ in lines_pool if l == 'en' and short(t, 'en')]
        qs = []
        for q, a in E:
            o, i = opts_for(a, list(dict.fromkeys(pool)))
            if len(o) >= 2:
                qs.append({'q': q, 'opts': o, 'ans': i, 'a': au(q, 'en')})
        if qs:
            rounds.append({'l': 'en', 'qs': qs})
    if Z:
        pool = [a for _, a in Z] + [t for w, l, t, _ in lines_pool if l == 'zh' and short(t, 'zh')]
        qs = []
        for q, a in Z:
            o, i = opts_for(a, list(dict.fromkeys(pool)))
            if len(o) >= 2:
                qs.append({'q': q, 'py': py_of(q), 'opts': [[x, py_of(x)] for x in o], 'ans': i})
        if qs:
            rounds.append({'l': 'zh', 'yct': True, 'qs': qs})
    n = sum(len(r['qs']) for r in rounds)
    return {'type': 'hoi', 'rounds': rounds} if n >= 3 else None

COLORS = 'abcd'
def bridge(en_s, zh_s):
    """Tô cùng màu phần cùng ý, dùng từ điển Anh – Trung của khoá."""
    marks_en, marks_zh = [], []
    cands = sorted(((z, e) for z, (p, e) in ZH2EN.items()), key=lambda x: -len(x[0]))
    used_z = [False] * len(zh_s)
    for z, e in cands:
        if len(marks_en) >= 4:
            break
        zi = zh_s.find(z)
        if zi < 0 or any(used_z[zi:zi + len(z)]):
            continue
        for part in re.split(r'[,/;]| – | = ', re.sub(r'\(.*?\)', '', e)):
            part = part.strip().strip('!?.')
            if len(part) < 2:
                continue
            m = re.search(r'\b' + re.escape(part) + r'\b', en_s, re.I)
            if m and not any(a < m.end() and m.start() < b for a, b, _ in marks_en):
                g = COLORS[len(marks_en)]
                marks_en.append((m.start(), m.end(), g)); marks_zh.append((zi, zi + len(z), g))
                for k in range(zi, zi + len(z)):
                    used_z[k] = True
                break
    def chunks(s, marks):
        marks = sorted(marks); out = []; pos = 0
        for a, b, g in marks:
            if a > pos:
                out.append([s[pos:a], ''])
            out.append([s[a:b], g]); pos = b
        if pos < len(s):
            out.append([s[pos:], ''])
        return out
    if not marks_en:
        return None
    return {'en': chunks(en_s, marks_en), 'zh': chunks(zh_s, marks_zh)}

def pdn_step(d, unit, aligned, kp=()):
    pairs = []
    br = None
    for it in d['sent_zh'] + d['sent_en']:
        tg, body = tag(it)
        if tg == 'Cầu nối' and not br:
            if '↔' in body:
                left, right = body.split('↔', 1)
                zpart = re.split(r'\(|·|\s\[', right, maxsplit=1)[0]
                if CJK.search(zpart) and re.search(r'[A-Za-z]', left):
                    br = (left.strip(), clean_zh(zpart))
        if tg == 'Chuyển ngữ':
            b = re.sub(r'^\[[^\]]*\]\s*', '', body)
            b = re.sub(r'^[^:：]*(?:rối Leo nói|Leo nói)[^:：]*[:：]\s*', '', b)
            for seg in re.split(r'\s·\s', b):
                m = re.search(r'(?:Leo:\s*)?[“"]?([A-Za-z][^→“”"]*?[.!?])[”"]?\s*→\s*([^(·]+?)\s*(?:\(([^)]*)\))?\s*$', seg.strip())
                if m and CJK.search(m.group(2)):
                    pairs.append((m.group(1).strip(), clean_zh(m.group(2))))
                    continue
                m = re.search(r'([\u3400-\u9fff][^→(]*?)\s*(?:\([^)]*\))?\s*→\s*([A-Za-z][^→]*?[.!?])\s*$', seg.strip())
                if m:
                    pairs.append((m.group(2).strip(), clean_zh(re.sub(r'^.*?[:：]\s*', '', m.group(1)))))
                    continue
                m = re.search(r'[“"]([A-Za-z][^”"]+)[”"]\s*[–-]\s*con nói lại[^:：]*[:：]\s*([^(]+)', seg)
                if m and CJK.search(m.group(2)):
                    pairs.append((m.group(1).strip(), clean_zh(m.group(2))))
    for it in d['sent_zh']:
        tg, body = tag(it)
        if tg:
            continue
        z, py, e = zh_sent(body)
        if e and CJK.search(z) and '——' not in z and '—' not in z:
            e = e.split(' – ')[0].strip()
            if re.search(r'[A-Za-z]', e):
                pairs.append((e, clean_zh(z)))
    for it in d['sent_en'] + d['sent_zh']:
        tg, body = tag(it)
        if tg in ('Mẹo âm', 'Cầu nối') or '→' not in body:
            continue
        body = re.sub(r'^\[[^\]]*\]\s*', '', body)
        for seg in re.split(r'\s·\s', body):
            if seg.count('→') != 1:
                continue
            a, b = [x.strip() for x in seg.split('→')]
            a = re.sub(r'^(?:Leo|Xiaomei|Phiên dịch nhí[^:]*)[:：]\s*', '', a)
            ca, cb = bool(CJK.search(a)), bool(CJK.search(b))
            if ca == cb:
                continue
            en_, zh_ = (b, a) if ca else (a, b)
            zh_ = clean_zh(re.sub(r'\([^)]*\)', '', zh_)); en_ = en_.strip(' "“”')
            if re.search(r'[A-Za-z]{2}', en_) and CJK.search(zh_):
                pairs.append((en_, zh_))
    for w, e, z in kp:
        if short(e, 'en') and short(z, 'zh'):
            pairs.append((e, z))
    if aligned:
        for s in aligned:
            if s['who'] != 'narr' and short(s['en'], 'en') and short(s['zh'], 'zh'):
                pairs.append((s['en'], s['zh']))
    seen, P2 = set(), []
    if br:
        P2.append(br); seen.add(br[0].lower())
    for e, z in pairs:
        if e.lower() in seen or not z:
            continue
        seen.add(e.lower()); P2.append((e, z))
    P2 = P2[:5]
    if len(P2) < 3:
        return None
    step = {'type': 'pdn', 'model_first': d['week'] <= 1,
            'items': [{'en': e, 'zh': z, 'py': py_of(z), 'a_en': au(e, 'en'), 'a_zh': au(z, 'zh')} for e, z in P2]}
    b = bridge(P2[0][0], P2[0][1])
    if b:
        step['bridge'] = b
    return step

# ---------------------------------------------------------------- mẹo âm
TONE_OF = {}
for i, s in enumerate(['āēīōūǖ', 'áéíóúǘ', 'ǎěǐǒǔǚ', 'àèìòùǜ']):
    for c in s:
        TONE_OF[c] = i + 1
TONE_BTN = {1: ['1', 'ˉ → đường bằng'], 2: ['2', 'ˊ ↗ lên dốc'], 3: ['3', 'ˇ ↘↗ võng'], 4: ['4', 'ˋ ↘ cầu trượt']}
def tone1(py):
    for c in py:
        if c in TONE_OF:
            return TONE_OF[c]
    return 0

def meo_step(d):
    cards, zq, eq = [], [], []
    for lang, sent in (('zh', d['sent_zh']), ('en', d['sent_en'])):
        for it in sent:
            tg, body = tag(it)
            if tg != 'Mẹo âm':
                continue
            body = re.sub(r'\s*\((?:nghe|chạm)[^)]*\)\s*$', '', body).replace(' | ', ' · ')
            body = re.sub(r'^ôn\s+', '', body)
            toks = [t.strip() for t in re.split(r'\s·\s', body) if t.strip()]
            sym, ex = [], []
            for t in toks:
                if lang == 'zh':
                    m = re.match(r'^(.*?)\s*([A-Za-z' + PY_CH + r"'’\s]+?)\s+([㐀-鿿]+)$", t)
                    if m and has_py(m.group(2)):
                        if m.group(1).strip():
                            sym.append(m.group(1).strip())
                        ex.append([m.group(2).strip(), m.group(3)])
                    else:
                        sym.append(t)
                else:
                    if '→' in t:
                        l, r = t.split('→', 1)
                        sym.append(l.strip()); r = r.strip()
                        if r:
                            ex.append([r.split()[-1], ''])
                    elif not sym:
                        sym.append(t)
                    else:
                        ex.append([t.split()[-1], ''])
            if not ex:
                continue
            symtxt = ' · '.join(dict.fromkeys(s.replace('→', '').strip() if lang == 'en' else s for s in sym if s)) or '♪'
            cards.append({'l': lang, 'sym': symtxt, 'name': '', 'ex': ex[:5]})
            if lang == 'zh':
                for py, hz in ex[:5]:
                    t = tone1(py)
                    if t:
                        zq.append([py, hz, str(t)])
            else:
                letter = re.match(r'^[a-zA-Z\-]+', symtxt)
                if letter:
                    lt = letter.group(0).strip('-').lower()
                    for w, _ in ex[:3]:
                        if lt in w.lower():
                            eq.append([w, True])
                    pool = [x for x in d['en_new'] + d['en_on'] if lt not in x.lower() and len(x.split()) == 1]
                    for w in pool[:2]:
                        eq.append([w, False])
                    cards[-1]['letter'] = lt
    if not cards:
        return None
    tones = sorted({q[2] for q in zq})
    if len(tones) == 1:
        extra = '4' if tones[0] != '4' else '1'
        tones.append(extra)
    step = {'type': 'meo', 'cards': cards[:2], 'quiz': {'zh': zq[:5], 'zh_btn': [TONE_BTN[int(t)] for t in sorted(set(tones))] if zq else [], 'en': eq[:5]}}
    en_c = next((c for c in cards if c['l'] == 'en' and c.get('letter')), None)
    if en_c:
        step['quiz']['en_btn'] = [['yes', f"{en_c['sym'].split('·')[0].strip()} có"], ['no', '✖ không']]
    if len(step['quiz']['zh']) + len(step['quiz']['en']) < 3:
        step['quiz'] = {'zh': [], 'en': []}
    return step

# ---------------------------------------------------------------- dạng đề, nghe – làm theo, nghe – nhắc lại
def de_steps(d):
    out = []
    qs = []
    for lang, sent in (('en', d['sent_en']), ('zh', d['sent_zh'])):
        txt = ' / '.join(sent)
        for m in re.finditer(r'(?:(\d+)\.|Example:|例如：)\s*([^\[\]/]+?)\s*\[([^\]]*✓[^\]]*)\]', txt):
            prompt = m.group(2).strip()
            sep = r'\s[·/]\s' if re.search(r'\s[·/]\s', m.group(3)) else r',\s*(?=[A-F]\s)'
            opts = [re.sub(r'^[A-F]\s+', '', o.strip()) for o in re.split(sep, m.group(3)) if o.strip()]
            ans = next((i for i, o in enumerate(opts) if '✓' in o), 0)
            opts = [o.replace('✓', '').strip() for o in opts]
            if len(opts) < 2:
                continue
            if lang == 'zh' or CJK.search(prompt):
                z = clean_zh(re.sub(r'[A-Za-z' + PY_CH + r'\s]+$', '', re.sub(r'\([^)]*\)', '', prompt)))
                if not CJK.search(z):
                    continue
                qs.append({'say': {'t': z, 'l': 'zh', 'a': au(z, 'zh')}, 'py': py_of(z), 'opts': opts, 'ans': ans, 'ex': not m.group(1)})
            else:
                qs.append({'say': {'t': prompt, 'l': 'en', 'a': au(prompt, 'en')}, 'opts': opts, 'ans': ans, 'ex': not m.group(1)})
        # YCT Đọc phần 2: câu → tranh A–F
        mt = re.search(r'Tranh:\s*(.+?)\.\s', txt)
        if mt and lang == 'zh':
            pics = {}
            for p in re.split(r',\s*', mt.group(1)):
                mm = re.match(r'^([A-F])\s+(.*)$', p.strip())
                if mm:
                    pics[mm.group(1)] = mm.group(2)
            letters = sorted(pics)
            for m2 in re.finditer(r'(\d+)\.\s*([^\[/]+?)\s*\[([A-F])\]', txt):
                z = clean_zh(re.sub(r'\([^)]*\)', '', m2.group(2)))
                if CJK.search(z) and m2.group(3) in pics:
                    opt_l = [m2.group(3)] + [x for x in letters if x != m2.group(3)][:2]
                    random.shuffle(opt_l)
                    qs.append({'say': {'t': z, 'l': 'zh', 'a': ''}, 'py': py_of(z), 'read': True, 'opts': [pics[x] for x in opt_l], 'ans': opt_l.index(m2.group(3))})
    qs = [q for q in qs if not q.get('ex')] or qs
    qs += tf_qs(d)
    if len(qs) >= 3:
        out.append({'type': 'de', 'qs': qs[:10]})
    return out

def lam_step(d):
    cmds = []
    for lang, sent in (('en', d['sent_en']), ('zh', d['sent_zh'])):
        for it in sent:
            tg, body = tag(it)
            if tg == 'Việc của con' and re.search(r'Listen and do|听一听，做一做', body):
                lst = body.split(':', 1)[-1] if ':' in body else body.split('：', 1)[-1]
                for c in re.split(r'\s·\s', lst):
                    c = c.strip()
                    if lang == 'zh':
                        z = clean_zh(re.sub(r'\([^)]*\)', '', c))
                        if CJK.search(z):
                            cmds.append({'t': z, 'l': 'zh', 'py': py_of(z)})
                    elif c:
                        cmds.append({'t': c, 'l': 'en', 'py': ''})
    if len(cmds) < 4:
        return None
    for c in cmds:
        img, e = img_for(c['t'])
        c['img'], c['e'] = img, e or '🤸'
        c['a'] = au(c['t'], c['l'])
    return {'type': 'lam', 'cmds': cmds[:10]}

def nhac_turns(d, unit):
    T = []
    for lang, sent in (('en', d['sent_en']), ('zh', d['sent_zh'])):
        for it in sent:
            body = it
            m = re.match(r'^(?:Listen and say:|听后重复[：:])\s*(.+)$', body)
            if m:
                t = m.group(1).strip()
                if lang == 'zh':
                    t = clean_zh(re.sub(r'\([^)]*\)', '', t))
                T.append({'img': bg_img(unit), 'say': [{'t': t, 'l': lang, 'w': 'narr', 'a': au(t, lang)}]})
            m3 = re.match(r'^(?:Say it like (\w+):|学(\w+)说：)\s*(.+)$', body)
            if m3:
                t = m3.group(3).strip()
                if lang == 'zh':
                    t = clean_zh(re.sub(r'\([^)]*\)', '', t))
                T.append({'img': bg_img(unit), 'say': [{'t': t, 'l': lang, 'w': who_key((m3.group(1) or m3.group(2) or 'narr').lower(), unit), 'a': au(t, lang)}]})
            m2 = re.search(r'(?:请听后重复。|听，说：|听后重复[^\]]*\]\s*[^1]*?)\s*(?:\([^)]*\))?\s*(1\..+)$', body)
            if m2 and '回答' not in body[:60]:
                for s in re.split(r'\s*\d\.\s*', m2.group(1)):
                    z = clean_zh(re.sub(r'\([^)]*\)', '', s))
                    if CJK.search(z):
                        T.append({'img': bg_img(unit), 'say': [{'t': z, 'l': 'zh', 'w': 'narr', 'a': au(z, 'zh')}]})
    return T[:8]

def tl_step(d):
    out = []
    for it in d['sent_zh']:
        if '听后回答' not in it and '回答问题' not in it:
            continue
        for m in re.finditer(r'\d\.\s*([^0-9]+?[？?])\s*(?:\([^)]*\))?\s*——\s*([^0-9(]+)', it):
            q, a = clean_zh(m.group(1)), clean_zh(m.group(2)).rstrip('。') + '。'
            if CJK.search(q) and CJK.search(a):
                out.append({'q': q, 'py': py_of(q), 'a': a, 'apy': py_of(a), 'a_q': au(q, 'zh'), 'a_a': au(a, 'zh')})
    return {'type': 'tl', 'items': out[:6]} if len(out) >= 3 else None

def tf_qs(d):
    qs = []
    for it in d['sent_zh'] + d['sent_en']:
        for m in re.finditer(r'(\d+)\.\s*([^\[\]]+?)\s*\[([^\]]*?)\s*(✓|✗)\]', it):
            z = m.group(2).strip(); l = 'zh' if CJK.search(z) else 'en'
            if l == 'zh':
                z = clean_zh(re.sub(r'\([^)]*\)', '', z))
            qs.append({'say': {'t': z, 'l': l, 'a': au(z, l)}, 'py': py_of(z) if l == 'zh' else '', 'desc': m.group(3).strip(), 'tf': True, 'ans': 0 if m.group(4) == '✓' else 1, 'opts': ['✓ Đúng', '✗ Sai']})
    return qs

# ---------------------------------------------------------------- gọi lại (nói) + vận động
def recall_pairs(d, prev_cards):
    pool = []
    for en_t in [clean_gloss(x) or x for x in d['en_on']]:
        k = norm_en(en_t)
        z = EN2ZH.get(k)
        pool.append(card(en_t, z[0] if z else '', z[1] if z else ''))
    for e in d['zh_on']:
        g = gloss(e)
        if g and not any(c['zh'] == e['zh'] for c in pool):
            pool.append(card(g, e['zh'], e['py']))
    for c in prev_cards[::-1]:
        if len(pool) >= 10:
            break
        if c.get('zh') and not any(p['en'] == c['en'] for p in pool):
            pool.append(c)
    return [c for c in pool if c['zh'] and c['en'] and not CJK.search(c['en'])]

def goi_step(d):
    for it in d['sent_en']:
        tg, body = tag(it)
        m = re.match(r'^Gọi lại từ (.+?)\s*\(.*?\)\s*[:：]\s*(.+)$', body) if tg == 'Việc của con' else None
        if m:
            src = m.group(1); ens = [x.strip() for x in m.group(2).split('·') if x.strip()]
            zhs = []
            for it2 in d['sent_zh']:
                tg2, b2 = tag(it2)
                m2 = re.match(r'^Gọi lại từ .+?[:：]\s*(.+)$', b2) if tg2 == 'Việc của con' else None
                if m2:
                    zhs = [clean_zh(re.sub(r'\([^)]*\)', '', x)) for x in m2.group(1).split('·') if x.strip()]
            cards = []
            for i, e in enumerate(ens):
                z = zhs[i] if i < len(zhs) else (EN2ZH.get(norm_en(e)) or ('',))[0]
                cards.append(card(e, z))
            if cards:
                return {'type': 'goi', 'from': src, 'cards': cards}
    return None

def game_step(pool, pos):
    """Bước vận động: nghe, quay đầu (trái / ngửa lên / phải) để chọn; chạm vẫn được."""
    P = [c for c in pool if c.get('zh')][:8]
    if len(P) < 3:
        return None
    qs = []
    order = ['aht', 'aht', 'ds', 'ds', 'c3', 'c3', 'ds', 'c3'] if pos >= 3 else ['aht', 'aht', 'aht', 'ds', 'ds', 'ds', 'aht', 'ds']
    for i, mode in enumerate(order):
        c = P[i % len(P)]
        if mode == 'aht':
            l = random.choice(['en', 'zh'])
            qs.append({'m': 'aht', 'say': {'t': c['en'] if l == 'en' else c['zh'], 'l': l, 'a': c.get('a_en', '') if l == 'en' else c.get('a_zh', '')}, 'ans': 0 if l == 'en' else 1})
        elif mode == 'ds':
            ok = random.random() < .5
            other = random.choice([x for x in P if x['zh'] != c['zh']])
            z = c if ok else other
            qs.append({'m': 'ds', 'card': {'en': c['en'], 'img': c.get('img', ''), 'e': c.get('e', '')}, 'say': {'t': z['zh'], 'l': 'zh', 'a': z.get('a_zh', '')}, 'ans': 0 if ok else 1})
        else:
            cand = [x for x in P if x['en'] != c['en']]
            others = random.sample(cand, min(2, len(cand)))
            opts = [c] + others
            random.shuffle(opts)
            l = random.choice(['en', 'zh'])
            qs.append({'m': 'c3', 'say': {'t': c['en'] if l == 'en' else c['zh'], 'l': l, 'a': c.get('a_en', '') if l == 'en' else c.get('a_zh', '')},
                       'opts': [{'en': o['en'], 'zh': o['zh'], 'img': o.get('img', ''), 'e': o.get('e', '')} for o in opts], 'ans': opts.index(c)})
    return {'type': 'game', 'qs': qs}

# ---------------------------------------------------------------- dựng từng ngày
def bg_dict(d):
    out = {}
    for w in d['bg_en']:
        img, e = img_for(w)
        out[w] = {'l': 'en', 'img': img, 'e': e, 'a': au(w, 'en')}
    for e in d['bg_zh'] + d['nlq_zh']:
        out[e['zh']] = {'l': 'zh', 'py': e['py'], 'en': gloss(e), 'a': au(e['zh'], 'zh'), 'a_en': ''}
    return out

def nen_cards(d):
    cs, used = [], set()
    zs = d['nen_zh']
    for w in d['nen_en']:
        zt, py = '', ''
        for z in zs:
            g = (z['en'] or (ZH2EN.get(z['zh'], ('', ''))[1])).lower()
            if z['zh'] not in used and (w.lower() in re.split(r'[,/;–=()]\s*|\s+-\s+', g) or w.lower() == g.strip() or norm_en(g) == w.lower()):
                zt, py = z['zh'], z['py']; break
        if not zt and w.lower() in LS['pics'] and any(z['zh'] == LS['pics'][w.lower()]['zh'] for z in zs):
            zt = LS['pics'][w.lower()]['zh']
        if not zt:
            e2z = EN2ZH.get(norm_en(w))
            if e2z and any(z['zh'] == e2z[0] for z in zs):
                zt, py = e2z
        if zt:
            used.add(zt)
        cs.append(card(w, zt, py))
    if zs and len(zs) == len(cs) and all(not c['zh'] for c in cs):
        cs = [card(c['en'], z['zh'], z['py']) for c, z in zip(cs, zs)]
        used = {z['zh'] for z in zs}
    for z in zs:
        if z['zh'] not in used:
            g = gloss(z)
            if g:
                cs.append(card(g, z['zh'], z['py']))
    return cs

def new_cards(d):
    d = dict(d); d['en_new'] = [clean_gloss(w) or w for w in d['en_new']]
    cs, covered = [], set()
    for e in d['zh_new']:
        g = gloss(e)
        cs.append(card(g, e['zh'], e['py']))
        for w in d['en_new']:
            if re.search(r'\b' + re.escape(w.split('/')[0].lower()) + r'\b', e['en'].lower()):
                covered.add(w)
    today = d['story_zh'] + ' '.join(d['sent_zh'])
    for w in d['en_new']:
        if w not in covered:
            z = EN2ZH.get(norm_en(w))
            ok = z and z[0] in today
            cs.append(card(w, z[0] if ok else '', z[1] if ok else ''))
    return [c for c in cs if c['en'] and not CJK.search(c['en'])]

UNIT_DAYS = {}
for n, d in sorted(D.items()):
    UNIT_DAYS.setdefault(d['unit'], []).append(n)

days_out, bg_all, recent_cards = {}, {}, []
for n, d in sorted(D.items()):
    unit = d['unit']
    bgd = bg_dict(d); bg_all.update({k: v for k, v in bgd.items() if k not in bg_all})
    if n in (1, 2, 3, 8):
        day = DEMO['days'][str(n)]
        day = json.loads(json.dumps(day))
        day['unitname'] = 'Greeting'; day['kind'] = 'Phần' if n != 8 else 'Cả truyện'
        for s in day['steps']:
            for c in s.get('cards', []):
                recent_cards.append(c)
        pool = recall_pairs(d, recent_cards)
        g = game_step(pool, n)
        if g:
            day['steps'].append(g)
        days_out[n] = day
        continue
    steps = []
    nc = nen_cards(d)
    if nc:
        steps.append({'type': 'nen', 'cards': nc})
    cards = new_cards(d)
    if d['kind'].startswith('Phần') and cards:
        steps.append({'type': 'the', 'cards': cards})
    kp = key_pairs(d, unit)
    st, aligned = story_step(d, unit)
    steps.append(st)
    lines = speaker_lines(st)
    if len([x for x in lines if x[1] == 'en']) < 3:
        lines = [x for x in lines] + [(w, 'en', e, '') for w, e, z in kp if w != 'narr'] + [(w, 'zh', z, py_of(z)) for w, e, z in kp if w != 'narr']
    is_part = d['kind'].startswith('Phần')
    if is_part:
        spk = [w for w, _, _, _ in lines]
        from collections import Counter
        top = [w for w, _ in Counter(spk).most_common(3)]
        if len(lines) >= 4 and len(top) >= 1:
            while len(top) < 3:
                for extra in ('bong', 'leo', 'anna', 'xiaomei'):
                    if extra not in top:
                        top.append(extra); break
            qs = []
            en_l = [x for x in lines if x[1] == 'en' and x[0] in top]; zh_l = [x for x in lines if x[1] == 'zh' and x[0] in top]
            for i in range(max(len(en_l), len(zh_l))):
                for L in (en_l, zh_l):
                    if i < len(L):
                        w, l, t, py = L[i]
                        qs.append({'say': {'t': t, 'l': l, 'w': w, 'a': au(t, l)}, 'ans': w})
            if len(qs) >= 5:
                steps.append({'type': 'cham', 'opts': top, 'qs': qs[:8]})
        if not any(s['type'] == 'cham' for s in steps) and len({c['en'] for c in cards + nc}) >= 3:
            pool_c = list({c['en']: c for c in cards + nc}.values())
            qs = []
            for c in (pool_c * 3)[:6]:
                cand = [x for x in pool_c if x['en'] != c['en']]
                others = random.sample(cand, min(2, len(cand)))
                opts = [c] + others; random.shuffle(opts)
                l = 'zh' if (len(qs) % 2 and c['zh']) else 'en'
                qs.append({'say': {'t': c['en'] if l == 'en' else c['zh'], 'l': l, 'a': c.get('a_en', '') if l == 'en' else c.get('a_zh', '')},
                           'opts': [{'en': o['en'], 'img': o['img'], 'e': o.get('e', '')} for o in opts], 'ans': opts.index(c)})
            steps.append({'type': 'chon', 'qs': qs})
        turns = []
        en_l = [x for x in lines if x[1] == 'en' and short(x[2], 'en')]; zh_l = [x for x in lines if x[1] == 'zh' and short(x[2], 'zh')]
        for i in range(max(len(en_l), len(zh_l))):
            for L in (en_l, zh_l):
                if i < len(L):
                    w, l, t, py = L[i]
                    turns.append({'img': bg_img(unit), 'say': [{'t': t, 'l': l, 'w': w, 'a': au(t, l)}]})
        if len(turns) < 5:
            for w, e, z in kp:
                if short(e, 'en'):
                    turns.append({'img': bg_img(unit), 'say': [{'t': e, 'l': 'en', 'w': w, 'a': au(e, 'en')}]})
                    turns.append({'img': bg_img(unit), 'say': [{'t': z, 'l': 'zh', 'w': w, 'a': au(z, 'zh')}]})
        if len(turns) < 5:
            for c in cards:
                if c['zh']:
                    turns.append({'img': c['img'] or bg_img(unit), 'e': c.get('e', ''), 'say': [{'t': c['en'], 'l': 'en', 'w': 'narr', 'a': c['a_en']}]})
                    turns.append({'img': c['img'] or bg_img(unit), 'e': c.get('e', ''), 'say': [{'t': c['zh'], 'l': 'zh', 'w': 'narr', 'a': c['a_zh']}]})
        if len(turns) < 5:
            turns += nhac_turns(d, unit)
        if turns:
            steps.append({'type': 'noi', 'turns': turns[:6]})
        tl = tl_step(d)
        if tl:
            steps.append(tl)
    else:
        h = hoi_step(d, unit, lines)
        if h:
            steps.append(h)
        nt = nhac_turns(d, unit)
        if len(nt) >= 3:
            steps.append({'type': 'noi', 'turns': nt, 'mode': 'nhac'})
        else:
            tn = []
            for w, l, t, py in lines:
                if short(t, l) and len(tn) < 6:
                    tn.append({'img': bg_img(unit), 'say': [{'t': t, 'l': l, 'w': w, 'a': au(t, l)}]})
            if len(tn) >= 4:
                steps.append({'type': 'noi', 'turns': tn})
        tl = tl_step(d)
        if tl:
            steps.append(tl)
        steps += de_steps(d)
        lm = lam_step(d)
        if lm:
            steps.append(lm)
    p = pdn_step(d, unit, (st.get('scenes') or None), kp)
    if p:
        steps.append(p)
    m = meo_step(d)
    if m:
        steps.append(m)
    gs = goi_step(d)
    if gs:
        steps.append(gs)
    for s in steps:
        for c in s.get('cards', []):
            if c.get('zh'):
                recent_cards.append(c)
    pool = recall_pairs(d, recent_cards)
    pos = UNIT_DAYS[unit].index(n) + 1
    g = game_step(pool, pos)
    if g:
        steps.append(g)
    uname = UNIT_INFO.get(unit, UNIT_INFO['Ôn'])[0]
    t_en = st.get('title', '')
    first = next((s for s in (st.get('scenes') or st.get('scenes_en') or []) if s.get('who') != 'narr' and s.get('en')), None)
    title = d['head'].split(':', 1)[-1].strip() if ':' in d['head'] else d['head']
    days_out[n] = {
        'n': n, 'unit': unit, 'unitname': uname, 'kind': 'Phần' if is_part else ('Cả truyện' if d['kind'] == 'Cả truyện' else 'Ôn'),
        'part': re.search(r'Phần \d+', d['head']).group(0) if re.search(r'Phần \d+', d['head']) else ('Cả truyện' if d['kind'] == 'Cả truyện' else 'Ôn tập'),
        'week': d['week'], 'before': d['before'], 't': re.sub(r'\s·.*$', '', title)[:90], 'story': t_en, 'hero': bg_img(unit),
        'goal': d['goal'], 'bg': list(bgd.keys()),
        'video': [v for v in ([{'l': 'en', 'label': re.sub(r'\s*–\s*https?://\S+.*$', '', d['video_en']).strip(), 'url': (re.search(r'https?://\S+', d['video_en']) or [''])[0]} if re.search(r'https?://', d['video_en']) else None,
                               {'l': 'zh', 'label': re.sub(r'\s*–\s*https?://\S+.*$', '', d['video_zh']).strip(), 'url': (re.search(r'https?://\S+', d['video_zh']) or [''])[0]} if re.search(r'https?://', d['video_zh']) else None]) if v],
        'steps': steps,
    }

# ---------------------------------------------------------------- khối bản đồ, buổi lớp, reader
blocks = []
for n in sorted(days_out):
    u = D[n]['unit']
    key = 'w13' if n <= 9 else (('on1' if n < 40 else 'on2' if n < 70 else 'on3') if u == 'Ôn' else u)
    if not blocks or blocks[-1]['key'] != key:
        blocks.append({'key': key, 'days': []})
    blocks[-1]['days'].append(n)
STORY_BY_U = {s['unit']: s for s in STORIES}
CHANG = {1: 'Chặng 1', 2: 'Chặng 2', 3: 'Chặng 3', 4: 'Về đích'}
mp = []
for b in blocks:
    ds = b['days']; u = D[ds[0]]['unit']
    if b['key'] == 'w13':
        name, topic, story = 'Tuần 1–3', 'Greeting + Body · 问好 + 身体', 'Good Morning, Mrs Lan! · The Body Show'
    elif u == 'Ôn':
        name = 'Ôn cuối khoá' if ds[0] >= 96 else ('Ôn chặng 1' if ds[0] < 40 else 'Ôn chặng 2')
        topic, story = 'Ôn tập · 复习', ''
    else:
        info = UNIT_INFO[u]; name = f'Unit {u}'; topic = f'{info[0]} · {info[1]}'; story = STORY_BY_U.get(u, {}).get('en', '')
    items_ = []
    bset = []
    for n in ds:
        items_.append(['day', n])
        b_ = D[n]['before']
        nxt = D.get(n + 1)
        if not nxt or nxt['before'] != b_:
            items_.append(['lop', b_])
            bset.append(b_)
    chang = 1 if ds[0] <= 27 else 2 if ds[0] <= 63 else 3 if ds[0] <= 95 else 4
    mp.append({'key': b['key'], 'name': name, 'topic': topic, 'story': story, 'chang': chang, 'unit': u, 'img': bg_img(u if b['key'] != 'w13' else '1'), 'items': items_})

lop = {}
for b, v in BUOI.items():
    dn = [int(x) for x in re.findall(r'\d+', v['days'])]
    prep = []
    for n in dn:
        for s in days_out.get(n, {}).get('steps', []):
            if s['type'] == 'pdn':
                for it in s['items'][:2]:
                    prep.append(f"{it['en']} · {it['zh']}")
                break
    about = ' · '.join(x for x in [v['intro'] and 'Giới thiệu: ' + v['intro'], v['repeat'] and 'Nhắc lại: ' + v['repeat'],
                                     v['practice'] and 'Luyện: ' + v['practice'], v['produce'] and 'Con tự dùng: ' + v['produce']] if x)
    lop[b] = {'t': f'Buổi {b} trên lớp · {v["role"]}', 'img': TN + 'trang/ls_class.webp', 'about': about, 'prep': prep[:4],
              'days': dn, 'wb': [x for x in (v['wb_en'], v['wb_zh']) if x]}
if 1 in DEMO['lop']:
    for k in ('1', '2', '3'):
        if k in DEMO['lop']:
            lop[int(k)].update({'about': DEMO['lop'][k]['about'], 'prep': DEMO['lop'][k]['prep']})

reader = {'1': DEMO['reader']['1']}
for u, ns in UNIT_DAYS.items():
    if u in ('1', 'Ôn'):
        continue
    pages = []
    pi = 0
    for n in ns:
        d = D[n]
        if not d['kind'].startswith('Phần'):
            continue
        pi += 1
        st = days_out[n]['steps']
        tr = next(s for s in st if s['type'] == 'truyen')
        if 'scenes' in tr:
            for s in tr['scenes']:
                pages.append({'part': pi, 'who': s['who'], 'img': s['img'], 'en': s['en'], 'zh': s['zh'], 'py': s['py'], 'a_en': s['a_en'], 'a_zh': s['a_zh']})
        else:
            pages.append({'part': pi, 'who': 'narr', 'img': bg_img(u), 'en': d['story_en'], 'zh': clean_zh(d['story_zh']), 'py': py_of(clean_zh(d['story_zh'])), 'a_en': '', 'a_zh': ''})
    s = STORY_BY_U.get(u, {})
    reader[u] = {'t': s.get('en', f'Unit {u}'), 'zh': s.get('zh', ''), 'pages': pages}

units_q = []
for b in mp:
    if b['unit'] != 'Ôn' and b['key'] != 'w13':
        units_q.append({'u': b['unit'], 'n': f"{b['name']} · {b['topic'].split(' · ')[0]}", 'days': [x[1] for x in b['items'] if x[0] == 'day'], 'img': b['img']})
units_q.insert(0, {'u': 1, 'n': 'Unit 1 · Greeting', 'days': [1, 2, 3, 8], 'img': TN + 'trang/ls_class.webp'})
units_q.insert(1, {'u': 4, 'n': 'Unit 4 · Body', 'days': [4, 5, 6, 7, 9], 'img': TN + 'trang/ls_park.webp'})

vi = dict(DEMO['vi'])
vi.update({
    'game': 'Mình vận động một chút nhé! Con nghe rồi quay đầu sang trái, sang phải hoặc ngửa lên để chọn. Con cũng có thể chạm.',
    'aht': 'Con nghe: đây là tiếng Anh hay tiếng Trung?', 'ds': 'Tranh và câu con nghe có cùng nghĩa không?', 'c3': 'Con nghe rồi chọn tranh đúng nhé!',
    'chon': 'Con nghe rồi chạm vào tranh đúng nhé!', 'de': 'Mình làm thử dạng bài thi nhé. Con nghe kỹ rồi chọn.', 'lam': 'Con nghe và làm theo nhé!',
    'nhac': 'Con nghe rồi nói lại đúng như vậy nhé!',
    'pdn': 'Bạn Xiaomei chỉ hiểu tiếng Trung. Con nghe Leo nói tiếng Anh, rồi nói lại bằng tiếng Trung cho Xiaomei nhé!',
    'pdn_go': 'Đến lượt con! Con nói tiếng Trung cho Xiaomei nghe nhé!',
    'pdn_ok': 'Xiaomei hiểu rồi! Cảm ơn con!',
    'quiet': 'Cô chưa nghe thấy con nói. Con nói lại to hơn một chút nhé!',
    'quiet2': 'Không sao, mình sang câu tiếp nhé!',
    'next': 'Mình sang câu tiếp nhé!',
})

# ---------------------------------------------------------------- luật 5–10 câu mỗi bài (Nguyên tắc 17)
MIN_Q, MAX_Q = 5, 10
def _key_of(x):
    return (str(x.get('en', '')).strip().lower(), str(x.get('zh', '')).strip())
POOL = {'cards': [], 'nen': [], 'pdn': [], 'noi': [], 'meo_en': [], 'meo_zh': []}
PAD_LOG = []
def _pad(lst, pool, label, n, t):
    have = {_key_of(x) for x in lst}
    for x in pool:
        if len(lst) >= MIN_Q: break
        k = _key_of(x)
        if k in have or not (k[0] or k[1]): continue
        y = dict(x); y['on'] = True; lst.append(y); have.add(k)
    PAD_LOG.append((n, t, label, len(lst)))
ALL_NEN = {n: [c for s in days_out[n]['steps'] if s['type'] == 'nen' for c in s['cards']] for n in days_out}
for n in sorted(days_out):
    d = days_out[n]
    # từ nền Little Seed là từ con đã biết: lấy từ các ngày gần nhất (trước rồi sau)
    near = sorted((m for m in days_out if m != n), key=lambda m: (abs(m - n), m > n))
    NEN_NEAR = [c for m in near for c in ALL_NEN[m]]
    TODAY_NEN = ALL_NEN[n]
    for s in d['steps']:
        t = s['type']
        if t in ('the', 'nen', 'goi') and isinstance(s.get('cards'), list):
            cs = s['cards']
            if len(cs) < MIN_Q:
                pool = (NEN_NEAR if t == 'nen' else POOL['cards'] + TODAY_NEN + NEN_NEAR)
                _pad(cs, pool, 'cards', n, t)
            del cs[MAX_Q:]
        elif t == 'pdn' and isinstance(s.get('items'), list):
            if len(s['items']) < MIN_Q: _pad(s['items'], POOL['pdn'], 'items', n, t)
            del s['items'][MAX_Q:]
        elif t == 'noi' and isinstance(s.get('turns'), list):
            if len(s['turns']) < MIN_Q:
                have = {json.dumps(x.get('say'), ensure_ascii=False) for x in s['turns']}
                for x in POOL['noi']:
                    if len(s['turns']) >= MIN_Q: break
                    k = json.dumps(x.get('say'), ensure_ascii=False)
                    if k not in have: s['turns'].append(dict(x)); have.add(k)
                PAD_LOG.append((n, t, 'turns', len(s['turns'])))
            del s['turns'][MAX_Q:]
        elif t == 'meo' and isinstance(s.get('quiz'), dict):
            q = s['quiz']; q.setdefault('zh', []); q.setdefault('en', [])
            letter = next((c.get('letter') for c in s.get('cards', []) if c.get('l') == 'en' and c.get('letter')), None)
            keys = {b[0] for b in q.get('zh_btn', [])}
            seen_en = {x[0] for x in q['en']}; seen_zh = {x[1] for x in q['zh']}
            for (lt, x) in POOL['meo_en']:
                if len(q['zh']) + len(q['en']) >= MIN_Q: break
                if lt == letter and x[0] not in seen_en: q['en'].append(list(x)); seen_en.add(x[0])
            if letter:
                for (lt, x) in POOL['meo_en']:
                    if len(q['zh']) + len(q['en']) >= MIN_Q: break
                    w = x[0]
                    if lt != letter and w not in seen_en and not w.lower().startswith(letter.lower()):
                        q['en'].append([w, False]); seen_en.add(w)
            for x in POOL['meo_zh']:
                if len(q['zh']) + len(q['en']) >= MIN_Q: break
                if x[2] in keys and x[1] not in seen_zh and q.get('zh_btn'): q['zh'].append(list(x)); seen_zh.add(x[1])
            while len(q['zh']) + len(q['en']) > MAX_Q:
                (q['en'] if len(q['en']) >= len(q['zh']) else q['zh']).pop()
            PAD_LOG.append((n, t, 'quiz', len(q['zh']) + len(q['en'])))
    # đưa mục của ngày này vào kho để ngày sau dùng ôn (mới nhất lên đầu)
    for s in d['steps']:
        t = s['type']
        if t == 'the': POOL['cards'][:0] = [c for c in s['cards'] if not c.get('on') and (c.get('img') or c.get('e'))]
        if t == 'nen': POOL['nen'][:0] = [c for c in s['cards'] if not c.get('on')]
        if t == 'pdn': POOL['pdn'][:0] = [c for c in s['items'] if not c.get('on')]
        if t == 'noi': POOL['noi'][:0] = list(s['turns'])
        if t == 'meo':
            letter = next((c.get('letter') for c in s.get('cards', []) if c.get('l') == 'en' and c.get('letter')), None)
            POOL['meo_en'][:0] = [(letter, x) for x in s['quiz'].get('en', [])]
            POOL['meo_zh'][:0] = list(s['quiz'].get('zh', []))


# ---------------------------------------------------------------- Vận động: nghe từ → quay đầu chọn TRANH đúng (có tranh gây nhiễu)
def _pic_cards(steps):
    out = []
    for s in sorted(steps, key=lambda s: 0 if s['type'] == 'the' else 1):
        if s['type'] in ('the', 'nen'):
            for c in s['cards']:
                if c.get('img') and c.get('en') and c.get('zh'): out.append(c)
    return out
PIC_HIST = []
for n in sorted(days_out):
    d = days_out[n]
    today = _pic_cards(d['steps'])
    seen, T = set(), []
    for c in sorted(today, key=lambda c: bool(c.get('on'))) + PIC_HIST:
        k = c['img']
        if k in seen or c['en'].lower() in {x['en'].lower() for x in T}: continue
        seen.add(k); T.append(c)
    gs = [s for s in d['steps'] if s['type'] == 'game']
    if gs and len(T) >= 3:
        nopt = 2 if n <= 3 else 3
        rnd = random.Random(1000 + n)
        targets = T[:max(3, min(len(T), 6))]
        qs = []
        for i in range(8):
            c = targets[i % len(targets)]
            l = 'en' if i % 2 == 0 else 'zh'
            cand = [x for x in T if x['img'] != c['img'] and x['en'].lower() != c['en'].lower()]
            opts = [c] + rnd.sample(cand, min(nopt - 1, len(cand)))
            rnd.shuffle(opts)
            t = c['en'] if l == 'en' else c['zh']
            a = AU.get(f'{l}:{t}') or AU.get(f'{l}:{t.strip("!.?")}') or ''
            qs.append({'m': 'pic', 'say': {'t': t, 'l': l, 'a': a},
                       'opts': [{'en': o['en'], 'zh': o['zh'], 'img': o['img']} for o in opts], 'ans': opts.index(c)})
        gs[0]['qs'] = qs
    PIC_HIST[:0] = [c for c in today if not c.get('on')]
    del PIC_HIST[40:]

# ---------------------------------------------------------------- bảng giọng theo câu (web tự tìm file theo nội dung)
SPOKEN = set()
def _add(l, t):
    if isinstance(t, str) and t.strip() and not t.startswith('tai-nguyen'):
        if l == 'zh' and not CJK.search(t): return
        SPOKEN.add((l, t.strip()))
def _walk(o):
    if isinstance(o, dict):
        if isinstance(o.get('en'), str): _add('en', o['en'])
        if isinstance(o.get('zh'), str): _add('zh', o['zh'])
        if 't' in o and o.get('l') in ('en', 'zh'): _add(o['l'], o['t'])
        for k, v in o.items():
            if k == 'quiz' and isinstance(v, dict):
                for x in v.get('zh', []): _add('zh', x[1])
                for x in v.get('en', []): _add('en', x[0])
            elif k == 'ex' and isinstance(v, list):
                for x in v: _add('zh', x[1]) if x[1] else _add('en', x[0])
            else: _walk(v)
    elif isinstance(o, list):
        for x in o: _walk(x)
_walk(days_out); _walk(reader); _walk(lop)
AUMAP, MISS_ALL = {}, []
for (l, t) in sorted(SPOKEN):
    a = AU.get(f'{l}:{t}') or AU.get(f'{l}:{t.strip("!.?")}')
    if a: AUMAP[f'{l}:{t}'] = a
    else: MISS_ALL.append([l, t])
json.dump(MISS_ALL, open(f'{W}/miss_all.json', 'w'), ensure_ascii=False, indent=0)

VI_A = dict(DEMO.get('vi_a', {}))
if os.path.exists(f'{W}/gen_vi_a.json'):
    for _k, _v in json.load(open(f'{W}/gen_vi_a.json')).items():
        if not VI_A.get(_k): VI_A[_k] = _v
SD = {'who': WHO, 'days': {str(k): v for k, v in days_out.items()}, 'lop': {str(k): v for k, v in lop.items()}, 'map': mp, 'soon': {},
      'vi': vi, 'vi_a': VI_A, 'vi_t': DEMO.get('vi_t', {}), 'bg': {**bg_all, **DEMO['bg']}, 'reader': reader, 'units_q': units_q, 'aumap': AUMAP}
open(OUT, 'w').write('/* Dữ liệu web Seedling 48 buổi · 99 ngày – sinh từ Seedling_KhungChuongTrinh_48buoi_v7.xlsx (gen/build.py). Đừng sửa tay. */\nwindow.SD=' + json.dumps(SD, ensure_ascii=False) + ';\n')

# ---------------------------------------------------------------- báo cáo
from collections import Counter
cnt = Counter(s['type'] for d in days_out.values() for s in d['steps'])
with open(REPORT, 'w') as f:
    f.write('# Seedling 99 ngày · danh sách cần bổ sung\n\n')
    f.write(f'Số bước theo dạng bài: {dict(cnt)}\n\n')
    f.write(f'## Tranh còn thiếu ({len(MISS_IMG)} từ, đang dùng biểu tượng tạm)\n\n| Từ | Biểu tượng tạm |\n|---|---|\n')
    for k, v in sorted(MISS_IMG.items()):
        f.write(f'| {k} | {v} |\n')
    f.write(f'\n## Câu chưa có giọng thu ({len(MISS_AU)} câu, đang đọc bằng giọng máy của trình duyệt)\n\n')
    for l, t in sorted(MISS_AU)[:4000]:
        f.write(f'- {l}: {t}\n')
json.dump(sorted(MISS_AU), open(f'{W}/miss_au.json', 'w'), ensure_ascii=False, indent=0)
print('pad', len(PAD_LOG), 'spoken', len(SPOKEN), 'miss_all', len(MISS_ALL))
print('days', len(days_out), 'steps', dict(cnt), 'miss_img', len(MISS_IMG), 'miss_au', len(MISS_AU))
for n in sorted(days_out):
    print(n, days_out[n].get('unit'), days_out[n].get('kind'), ' → '.join(f"{s['type']}({len(s.get('cards') or s.get('qs') or s.get('items') or s.get('turns') or s.get('scenes') or s.get('scenes_en') or s.get('cmds') or [s for r in s.get('rounds', []) for s in r['qs']])})" for s in days_out[n]['steps']))
