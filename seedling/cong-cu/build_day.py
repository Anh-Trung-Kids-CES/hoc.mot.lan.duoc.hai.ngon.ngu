"""Sinh dữ liệu web dạy offline 48 buổi (seedling/day/day-data.js) từ seedling-data.js.

Mỗi buổi: giáo án 7 khối + dãy trang chiếu, theo vai I-R-P-P, chỉ dùng từ, câu, truyện
của các ngày web gắn với buổi. Chạy: python3 seedling/cong-cu/build_day.py
"""
import json, subprocess, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # seedling/
OUT = ROOT / 'day' / 'day-data.js'

raw = subprocess.run(['node', '-e', '''
global.window=global; const fs=require("fs");
eval(fs.readFileSync(process.argv[1],"utf8").replace(/^const /gm,"var "));
const D=window.SD; console.log(JSON.stringify({days:D.days, lop:D.lop, map:D.map, who:D.who, reader:D.reader, aumap:D.aumap, units_q:D.units_q}));
''', str(ROOT / 'seedling-data.js')], capture_output=True, text=True, check=True).stdout
SD = json.loads(raw)
DAYS = {int(k): v for k, v in SD['days'].items()}
LOP = {int(k): v for k, v in SD['lop'].items()}
AU = SD['aumap']


def au(l, t):
    k = (t or '').strip()
    return AU.get(f'{l}:{k}') or AU.get(f'{l}:' + re.sub(r'[!.?！。？]+$', '', k)) or ''


# ---------------- giai điệu dân gian hết bản quyền + chant tự soạn ----------------
TUNES = {
    'frere': 'Frère Jacques · 两只老虎 (dân gian Pháp)',
    'twinkle': 'Twinkle, Twinkle, Little Star (dân gian)',
    'london': 'London Bridge Is Falling Down (dân gian Anh)',
    'row': 'Row, Row, Row Your Boat (dân gian, 1852)',
}

# mỗi dòng: (EN, ZH, động tác) – câu lấy từ truyện / câu chuẩn bị của unit để có sẵn giọng
CHANTS = {
    'hello': dict(name='Hello Chant · 早上好', tune='frere', lines=[
        ("Good morning, Mrs Lan!", "Lan老师，早上好！", "Vẫy tay về phía cô, hơi cúi chào"),
        ("Good morning, class!", "小朋友们，早上好！", "Cô dang tay chào cả lớp"),
        ("Hello, kids!", "小朋友们，你们好！", "Cả lớp vẫy hai tay"),
        ("It's lesson time!", "上课了！", "Vỗ tay hai cái rồi ngồi xuống"),
    ]),
    'bye': dict(name='Goodbye Chant · 再见', tune='twinkle', lines=[
        ("Goodbye, Mrs Lan!", "老师再见！", "Vẫy tay chào cô"),
        ("See you tomorrow!", "明天见！", "Chỉ tay ra xa phía trước"),
        ("Goodbye, class!", "小朋友们，再见！", "Cô vẫy tay chào cả lớp"),
    ]),
    '1': dict(name='Good Morning Chant', tune='frere', lines=[
        ("Good morning, Mrs Lan!", "Lan老师，早上好！", "Vươn vai như mặt trời mọc"),
        ("Hello, Grandpa!", "爷爷，您好！", "Khoanh tay cúi chào"),
        ("Sorry, Leo!", "对不起，Leo！", "Tay đặt lên ngực, cúi đầu"),
        ("See you tomorrow!", "明天见！", "Vẫy tay, chỉ ra xa"),
    ]),
    '4': dict(name='Body Show Chant', tune='row', lines=[
        ("This is my body.", "这是我的身体。", "Hai tay vuốt từ vai xuống chân"),
        ("Clap your hands! Stamp your feet!", "拍拍手！跺跺脚！", "Vỗ tay hai cái, giậm chân hai cái"),
        ("Touch your shoulders! Touch your knees!", "摸摸肩膀！摸摸膝盖！", "Chạm vai, chạm gối"),
        ("Open your mouth!", "张大口！", "Há miệng thật to"),
        ("It's fun!", "真好玩！", "Giơ hai tay lên, nhảy nhẹ"),
    ]),
    '2': dict(name='Name and Age Chant', tune='london', lines=[
        ("Hello! What's your name?", "你好！你叫什么名字？", "Vẫy tay, chìa tay về phía bạn"),
        ("My name is Xiaomei.", "我叫Xiaomei。", "Chỉ vào mình"),
        ("How old are you?", "你几岁？", "Giơ tay hỏi"),
        ("I'm seven years old!", "我七岁！", "Giơ 7 ngón tay"),
        ("Nice to meet you!", "很高兴认识你！", "Bắt tay bạn bên cạnh"),
    ]),
    '3': dict(name='Family Photo Chant', tune='twinkle', lines=[
        ("Look! A family photo.", "看！家庭照片！", "Hai tay làm khung ảnh"),
        ("Who is she? – She is my mother.", "她是我妈妈。", "Chỉ vào khung ảnh"),
        ("He is my older brother.", "他是我哥哥。", "Tay giơ cao chỉ người lớn hơn"),
        ("This is my younger sister.", "这是我妹妹。", "Tay để thấp chỉ người nhỏ hơn"),
        ("I love them!", "我爱他们！", "Ôm tim bằng hai tay"),
    ]),
    '5': dict(name='Feelings Chant', tune='frere', lines=[
        ("How do you feel?", "你感觉怎么样？", "Hai tay mở, nhún vai hỏi"),
        ("I'm excited!", "我很兴奋！", "Nhảy lên, giơ hai tay"),
        ("I'm hungry!", "我很饿！", "Xoa bụng"),
        ("Some water, please!", "我要喝水！", "Làm động tác uống nước"),
        ("Close your eyes!", "闭上眼睛！", "Nhắm mắt"),
    ]),
    '6': dict(name='School Things Chant', tune='twinkle', lines=[
        ("This is a pencil.", "这是铅笔。", "Giơ bút chì"),
        ("This is glue.", "这是胶水。", "Giơ lọ hồ"),
        ("Where is the glue?", "胶水在哪儿？", "Hai tay che mắt rồi nhìn quanh"),
        ("Open your books.", "打开书。", "Hai bàn tay mở như quyển sách"),
        ("Make a line, please.", "请排队。", "Đứng dậy xếp hàng"),
    ]),
    '7': dict(name='Our New Flat Chant', tune='london', lines=[
        ("Our new flat!", "我们的新公寓！", "Hai tay chụm thành mái nhà"),
        ("This is the living room.", "这是客厅。", "Dang tay chỉ quanh phòng"),
        ("Is it in the bedroom or in the dining room?", "在卧室还是在餐厅？", "Tay trái rồi tay phải chỉ hai bên"),
        ("It's right under the bed!", "球就在床下面！", "Cúi xuống chỉ dưới chân"),
    ]),
    '8': dict(name='Little Boat Chant', tune='row', lines=[
        ("Can we go on the boat? – Yes, you can!", "我们能上船吗？——能！", "Chèo thuyền"),
        ("Can the duck fly?", "鸭子能飞吗？", "Vỗ cánh"),
        ("The duck can fly.", "鸭子能飞。", "Vỗ cánh chạy vòng"),
        ("Can the frog fly? – No, it can't.", "青蛙能飞吗？——不能。", "Nhảy như ếch, lắc đầu"),
    ]),
    '9': dict(name='Picnic Chant', tune='frere', lines=[
        ("Let's have a picnic in the park!", "我们去公园野餐吧！", "Trải khăn picnic tưởng tượng"),
        ("Do you want some fruit?", "你想吃水果吗？", "Chìa tay mời bạn"),
        ("I like eating fruit.", "我喜欢吃水果。", "Làm động tác ăn"),
        ("I like drinking juice.", "我喜欢喝果汁。", "Làm động tác uống"),
    ]),
    '10': dict(name='Weather Chant', tune='twinkle', lines=[
        ("It's sunny today. It's hot.", "今天是晴天，很热。", "Hai tay quạt mặt"),
        ("It's cold. Wear your coat!", "今天很冷，穿外套！", "Ôm người run, mặc áo"),
        ("Can I go out, Mum?", "妈妈，我能出去吗？", "Chỉ ra cửa"),
        ("Stay at home.", "在家吧。", "Hai tay chụm mái nhà"),
    ]),
    '11': dict(name='Colours Chant', tune='london', lines=[
        ("What colour do you like?", "你喜欢什么颜色？", "Chỉ vào bạn"),
        ("I like gold.", "我喜欢金色。", "Giơ thẻ màu"),
        ("What colour is it? – It's brown.", "是什么颜色的？——是棕色的。", "Chỉ áo của mình"),
        ("I want a skirt.", "我想要裙子。", "Xoay một vòng"),
    ]),
    '12': dict(name='Party Chant', tune='frere', lines=[
        ("How many people are there?", "有几个人？", "Chỉ đếm các bạn"),
        ("Let's take a photo!", "我们拍照吧！", "Hai tay làm máy ảnh, bấm"),
        ("Let's play table tennis!", "我们打乒乓球吧！", "Vung tay như đánh bóng"),
        ("Hooray!", "太好了！", "Nhảy lên reo"),
    ]),
}

# ---------------- thủ công từng unit (theo tài liệu khung) ----------------
CRAFTS = {
    '1': dict(name='Thẻ tên đeo cổ + rối que nhân vật', tpl='nametag',
              mat='Giấy in thẻ tên, dây đeo, bút màu; rối que in sẵn, que kem, bìa cứng',
              steps=['Buổi 1: con viết tên mình lên thẻ (Kids, write your name.)', 'Buổi 2: tô màu, đục lỗ, xâu dây', 'Buổi 3: cầm rối diễn chào – xin lỗi – tạm biệt', 'Produce: đeo thẻ, chào cả lớp hai tiếng'],
              say=('Good morning, class! My name is …', '小朋友们，早上好！我叫……')),
    '4': dict(name='Người giấy cử động', tpl='paperman',
              mat='Mẫu người giấy in, 5 ghim cài, kéo, bút màu',
              steps=['Buổi 2: vẽ mặt, tô màu, cắt', 'Buổi 3: nối bằng ghim cài', 'Buổi 3: dán nhãn head, body, arm, leg', 'Buổi 12: giới thiệu người giấy'],
              say=('This is my body. Long arms! Long legs!', '这是我的身体。胳膊很长，腿也很长！')),
    '2': dict(name='Bánh sinh nhật giấy cắm nến số', tpl='cutouts',
              mat='Giấy màu, đĩa giấy, que kem làm nến, thẻ số 6–10',
              steps=['B1: cắt bánh, dán lên đĩa', 'B2: làm nến số', 'B3: trang trí, viết tên', 'B4: giới thiệu tên và tuổi'],
              say=("Hello! My name is … I'm seven years old!", '你好！我叫……我七岁！')),
    '3': dict(name='Khung ảnh gia đình gấp', tpl='frame',
              mat='Bìa màu gấp đôi, bút màu, ảnh hoặc tranh vẽ người thân',
              steps=['B1: gấp khung', 'B2: vẽ người thân', 'B3: viết nhãn mother, father…', 'B4: giới thiệu ảnh gia đình'],
              say=('Look! A family photo. This is my mother. I love them!', '看！家庭照片！这是我妈妈。我爱他们！')),
    '5': dict(name='Bánh xe cảm xúc có kim xoay', tpl='wheel',
              mat='Đĩa giấy, ghim cài, mặt cảm xúc in sẵn',
              steps=['B1: tô 4 mặt cảm xúc', 'B2: dán lên đĩa', 'B3: gắn kim xoay', 'B4: xoay kim, kể cảm xúc'],
              say=("How do you feel? – I'm excited!", '你感觉怎么样？——我很兴奋！')),
    '6': dict(name='Hộp bút giấy có thẻ đồ dùng', tpl='cutouts',
              mat='Hộp giấy hoặc phong bì, thẻ đồ dùng in sẵn',
              steps=['B1: gấp hộp', 'B2: tô thẻ pencil, crayon, glue, scissors', 'B3: chơi cửa hàng', 'B4: giới thiệu hộp bút'],
              say=('This is a pencil. This is glue.', '这是铅笔。这是胶水。')),
    '7': dict(name='Nhà gấp ba phòng + bóng giấy', tpl='house',
              mat='Giấy A4 gấp ba, đồ đạc cắt dán, quả bóng giấy nhỏ',
              steps=['B1: gấp nhà, vẽ ba phòng', 'B2: dán đồ đạc', 'B3: giấu bóng, bạn đoán', 'B4: dẫn bạn thăm nhà'],
              say=('This is the living room. Is it in the bedroom or in the dining room?', '这是客厅。在卧室还是在餐厅？')),
    '8': dict(name='Băng đô con vật', tpl='cutouts',
              mat='Dải giấy bìa, hình con vật in sẵn, ghim bấm',
              steps=['B1: chọn con vật, tô màu', 'B2: cắt, dán lên băng đô', 'B3: chơi Can the duck fly?', 'B4: đeo băng đô, giới thiệu con vật'],
              say=("This is a frog. It can't fly.", '这是青蛙。青蛙不能飞。')),
    '9': dict(name='Đĩa picnic giấy', tpl='cutouts',
              mat='Đĩa giấy, đồ ăn in sẵn để cắt dán',
              steps=['B1: tô đồ ăn', 'B2: cắt, dán lên đĩa', 'B3: chơi picnic mời bạn', 'B4: giới thiệu đĩa của mình'],
              say=('I like eating fruit. Do you want some fruit?', '我喜欢吃水果。你想吃水果吗？')),
    '10': dict(name='Bánh xe thời tiết + người giấy mặc đồ', tpl='wheel',
               mat='Đĩa giấy, hình thời tiết và quần áo in sẵn, ghim cài',
               steps=['B1: tô 4 kiểu thời tiết', 'B2: làm kim xoay', 'B3: mặc đồ cho người giấy theo thời tiết', 'B4: bản tin thời tiết 30 giây'],
               say=("It's cold. Wear your coat!", '今天很冷，穿外套！')),
    '11': dict(name='Búp bê giấy thay đồ', tpl='cutouts',
               mat='Búp bê giấy in sẵn, quần áo để tô và cắt',
               steps=['B1: tô quần áo', 'B2: cắt', 'B3: chơi cửa hàng quần áo', 'B4: trình diễn thời trang'],
               say=("What colour is it? – It's brown. I want a skirt.", '是什么颜色的？——是棕色的。我想要裙子。')),
    '12': dict(name='Thiệp mời dự tiệc + máy ảnh giấy', tpl='frame',
               mat='Bìa màu, hộp nhỏ làm máy ảnh, bút màu',
               steps=['B1: làm thiệp', 'B2: viết lời mời', 'B3: làm máy ảnh giấy', 'B4: mời bạn, chụp ảnh lớp'],
               say=("Let's have a class party! Let's take a photo!", '我们开一个派对吧！我们拍照吧！')),
}

# ---------------- dò buổi ----------------
lop2unit = {}
for m in SD['map']:
    for kind, n in m['items']:
        if kind == 'lop':
            lop2unit[n] = m
UNIT_NAME = {str(u['u']): u['n'] for u in SD['units_q']}


def kind_of(n):
    if n in (1, 2, 3):
        return 'w13'
    if n in (12, 29):
        return 'on'
    if n in (30, 47, 48):
        return 'thi'
    t = LOP[n]['t']
    if 'Produce' in t:
        return 'produce'
    if 'Practice' in t:
        return 'practice'
    if 'Repeat' in t:
        return 'repeat'
    return 'intro'


def steps(days, typ):
    out = []
    for d in days:
        for s in DAYS[d]['steps']:
            if s['type'] == typ:
                out.append((d, s))
    return out


def words(days, include_on=False):
    seen, out = set(), []
    for d, s in steps(days, 'the'):
        for c in s['cards']:
            if (c.get('on') and not include_on) or c['en'] in seen or c['en'] == 'vóc dáng':
                continue
            seen.add(c['en'])
            out.append(dict(en=c['en'], zh=c['zh'], py=c['py'], img=c.get('img', ''),
                            a_en=c.get('a_en') or au('en', c['en']), a_zh=c.get('a_zh') or au('zh', c['zh']), e=c.get('e', '')))
    return out


def scenes(days):
    out = []
    for d, s in steps(days, 'truyen'):
        if 'scenes' in s:
            lst = s['scenes']
        else:  # truyện tách hai tiếng: scenes_en, scenes_zh
            en_, zh_ = s.get('scenes_en', []), s.get('scenes_zh', [])
            lst = [dict(x, zh='', py='') for x in en_] + [dict(x, en='') for x in zh_]
        for sc in lst:
            e, z = sc.get('en', ''), sc.get('zh', '')
            out.append(dict(who=sc.get('who', 'narr'), img=sc.get('img', ''), en=e, zh=z, py=sc.get('py', ''),
                            a_en=(sc.get('a_en') or au('en', e)) if e else '', a_zh=(sc.get('a_zh') or au('zh', z)) if z else '',
                            title=s['title']))
    return out


def pdn(days):
    out = []
    for d, s in steps(days, 'pdn'):
        for it in s.get('items', []):
            out.append(dict(en=it['en'], zh=it['zh'], py=it.get('py', ''),
                            a_en=it.get('a_en') or au('en', it['en']), a_zh=it.get('a_zh') or au('zh', it['zh'])))
    seen, res = set(), []
    for x in out:
        if x['en'] not in seen:
            seen.add(x['en']); res.append(x)
    return res


def game_qs(days):
    out = []
    for d, s in steps(days, 'game'):
        for q in s['qs']:
            if q.get('m') == 'pic' and len(q.get('opts', [])) >= 2:
                out.append(dict(t=q['say']['t'], l=q['say']['l'], a=q['say'].get('a') or au(q['say']['l'], q['say']['t']),
                                opts=[dict(en=o['en'], zh=o.get('zh', ''), img=o.get('img', '')) for o in q['opts']], ans=q['ans']))
    return out


def cham_qs(days):
    out = []
    for d, s in steps(days, 'cham'):
        for q in s['qs']:
            if q['say'].get('w') is None:
                continue
            out.append(dict(t=q['say']['t'], l=q['say']['l'], a=q['say'].get('a') or au(q['say']['l'], q['say']['t']),
                            opts=s['opts'], ans=q['ans']))
    return out


def meo(days):
    out = []
    for d, s in steps(days, 'meo'):
        for c in s['cards']:
            out.append(c)
    return out[:2]


def de_qs(days):
    out = []
    for d, s in steps(days, 'de'):
        for q in s['qs']:
            if q.get('imgs'):
                out.append(dict(t=q['say']['t'], l=q['say']['l'], a=q['say'].get('a') or au(q['say']['l'], q['say']['t']),
                                py=q.get('py', ''), imgs=q['imgs'], ans=q['ans']))
    return out


def hoi_qs(days):
    out = []
    for d, s in steps(days, 'hoi'):
        for r in s['rounds']:
            for q in r['qs']:
                opts = [o if isinstance(o, str) else o[0] for o in q['opts']]
                out.append(dict(l=r['l'], q=q['q'], py=q.get('py', ''), opts=opts, ans=q['ans'], img=q.get('img', ''),
                                a=q.get('a') or au(r['l'], q['q'])))
    return out


def tl_items(days):
    out = []
    for d, s in steps(days, 'tl'):
        out += s['items']
    return out


def videos(days):
    seen, out = set(), []
    for d in days:
        for v in DAYS[d].get('video') or []:
            if v['url'] not in seen:
                seen.add(v['url']); out.append(v)
    return out


def unit_days(u):
    for x in SD['units_q']:
        if str(x['u']) == str(u):
            return x['days']
    return []


def unit_of(n):
    if n == 1: return ['1']
    if n == 2: return ['4', '1']
    if n == 3: return ['1', '4']
    m = lop2unit.get(n)
    return [str(m['unit'])] if m and str(m['unit']).isdigit() else []


# ---------------- trang chiếu ----------------
def S(block, typ, mode, note, **kw):
    d = dict(b=block, ty=typ, m=mode, note=note); d.update(kw); return d


def quiz_from_game(qs, k, block, label):
    out = []
    pick = [q for q in qs if q['a']][:k] or qs[:k]
    for q in pick:
        out.append(S(block, 'quiz', 'Thẻ', f'{label}: phát tiếng, đếm 3–2–1, các con giơ thẻ số. Cô bấm số từng bé rồi Hiện đáp án.',
                     say=q['t'], l=q['l'], a=q['a'], opts=q['opts'][:3], ans=q['ans'] if q['ans'] < 3 else 0))
    return out


def story_slides(sc, lang, block, note):
    # một trang cho mỗi phần truyện; trong trang, cô bấm → để đi từng câu
    out, cur = [], None
    for x in sc:
        if cur is None or cur['title'] != x['title']:
            cur = S(block, 'story', 'Chiếu', note, l=lang, title=x['title'], scenes=[])
            out.append(cur)
        cur['scenes'].append({k: v for k, v in x.items() if k != 'title'})
    return out


def card_slides(ws, lang, block, note):
    cs = [w for w in ws if (w['img'] or w['e']) and (w['zh'] if lang == 'zh' else w['en'])]
    return [S(block, 'cards', 'Chiếu', note, l=lang, cards=cs)] if cs else []


def tf_slides(sc, block):
    out = []
    pool = [x for x in sc if x['en'] and x['who'] != 'narr']
    for i, x in enumerate(pool[:3]):
        if i % 2 == 0 or len(pool) < 2:
            out.append(S(block, 'tf', 'Thẻ', 'Đúng hay sai? Đọc câu, các con giơ thẻ ✓ hoặc ✗.', img=x['img'], who=x['who'],
                         say=x['en'], a=x['a_en'], ans=True))
        else:
            other = pool[(i + 1) % len(pool)]
            out.append(S(block, 'tf', 'Thẻ', 'Đúng hay sai? Câu này của nhân vật khác: đáp án ✗.', img=x['img'], who=x['who'],
                         say=other['en'], a=other['a_en'], ans=False))
    return out


def build_session(n):
    L = LOP[n]; k = kind_of(n); units = unit_of(n)
    days = L['days']
    u = units[0] if units else ''
    prev_days = LOP[n - 1]['days'] if n > 1 else []
    ud = unit_days(u) if u else []
    ws = words(days)
    sc = scenes(days)
    sl = []
    blocks = []  # giáo án

    # [1] khởi động
    sl.append(S('1', 'title', 'Chiếu', 'Chào lớp, giới thiệu buổi học.', t=L['t'], about=L['about']))
    sl.append(S('1', 'song', 'Chiếu', 'Cả lớp đứng hát Hello Chant, làm động tác. Màn chiếu phát nhạc nền.', chant='hello'))
    hq = quiz_from_game(game_qs(days), 4, '1', 'Hỏi lại web')
    sl += hq
    b1 = ['Hello Chant (đứng, động tác)', f'Hỏi lại web {len(hq)} câu từ ngày web {", ".join(map(str, days))}: giơ thẻ số']
    if k == 'w13' and n == 1:
        b1.append('Dạy nếp lớp: giơ thẻ sau khi đếm 3–2–1; lời lớp học let’s, 去')
    blocks.append(dict(k='[1]', name='Khởi động', min=8 if n != 1 else 14, acts=b1))

    # [2] tiếng Anh
    b2 = []
    if k in ('intro', 'w13', 'repeat', 'practice'):
        if k in ('repeat', 'practice') or n == 2:
            rp = words(prev_days if n != 2 else LOP[1]['days'])
            sl.append(S('2', 'song', 'Chiếu', 'Nhắc lại bằng chant của unit, cả lớp làm động tác.', chant=(units[-1] if n == 2 else u)))
            sl.append(S('2', 'grid', 'Thẻ', 'Đập thẻ: trải thẻ mini trên sàn, cô nói từ, hai bạn thi đập đúng thẻ. Màn chỉ để nhắc từ.',
                        cards=rp[:9], l='en'))
            b2.append('Nhắc lại phần trước: chant, Đập thẻ (thẻ mini)')
        if k == 'practice':
            pp = pdn([d for d in ud if d < days[0]])[:4]
            sl.append(S('2', 'pair', 'Thẻ', 'Đôi bạn: hai bạn quay mặt vào nhau, một bạn nói câu tiếng Anh, bạn kia chỉ tranh rồi đổi vai. Cô đi vòng nghe, bấm 🎤 EN.',
                        items=pp, l='en'))
            b2.append('Đôi bạn với dải câu phần đã học (tự nói)')
        if sc:
            hero = DAYS[days[0]].get('hero') or sc[0]['img']
            sl.append(S('2', 'mystery', 'Chiếu', 'Tranh bí ẩn: hé dần tranh, các con đoán ai, ở đâu.', img=hero))
            sl += story_slides([x for x in sc if x['en']], 'en', '2', 'Cô kể bằng rối, phát tiếng mẫu từng câu. Các con chỉ nhân vật.')
            b2.append('Tranh bí ẩn → cô kể phần mới bằng rối que và flashcard lớn')
        sl += card_slides(ws, 'en', '2', 'Flashcard: nói từ, làm động tác, cả lớp nhắc lại đồng thanh.')
        sl += quiz_from_game([q for q in game_qs(days) if q['l'] == 'en'][4:7], 3, '2', 'Show me!')
        sl += tf_slides(sc, '2')
        b2.append('Show me!, Đúng/Sai bằng thẻ ✓ ✗')
    elif k == 'produce':
        pp = pdn(ud)[:6]
        sl.append(S('2', 'pair', 'Thẻ', 'Từng cặp tập hội thoại cả unit bằng dải câu, cô đi vòng sửa phát âm.', items=pp, l='en'))
        b2.append('Từng cặp tập hội thoại cả unit, cô đi vòng sửa')
    elif k == 'on':
        sl.append(S('2', 'stations', 'Thẻ', 'Trạm xoay vòng 4 × 10 phút: cô ngồi trạm Giao tiếp chấm từng bé.', stations=[
            ['Giao tiếp', 'Cô hỏi đáp từng bé bằng hai tiếng, chấm trên màn cô'],
            ['Đọc', 'Đọc reader các unit theo cặp, chạm chữ Hán đã tô'],
            ['Thuyết trình', 'Lấy lại sản phẩm thủ công cũ, tập nói với bạn'],
            ['Viết', 'Trang ôn sách bài tập, viết bảng con']]))
        b2.append('Trò đội ôn cả chặng, rồi 4 trạm xoay vòng (cô ở trạm Giao tiếp)')
    elif k == 'thi':
        dq = de_qs(days)
        sl.append(S('2', 'note', 'Thẻ', 'Phát đề giấy và phiếu trả lời. Nhắc cách tô ô đáp án.', t='Bài thi phần Nghe', body='Nghe tiếng, tô ô A, B hoặc C trên phiếu.'))
        for i, q in enumerate(dq[:10]):
            sl.append(S('2', 'exam', 'Chiếu', f'Câu {i + 1}: phát tiếng hai lần, chờ 10 giây.', n=i + 1, **q))
        b2.append(f'Bài giấy phần Nghe ({min(10, len(dq))} câu), màn chiếu chỉ phát tiếng')
    blocks.append(dict(k='[2]', name='Tiếng Anh' if k not in ('on', 'thi') else ('Trạm ôn' if k == 'on' else 'Thi phần Nghe'),
                       min=20 if k not in ('on', 'thi') else 22, acts=b2))

    # [3] vận động
    game = {'intro': 'Simon says + Chạy tới thẻ', 'w13': 'Simon says + Chạy tới thẻ', 'repeat': 'Đập thẻ cả lớp, Chạy tới thẻ',
            'practice': 'Rồng Lửa theo đội', 'produce': 'Trò đội ôn cả unit', 'on': 'Rồng Lửa theo đội ôn cả chặng',
            'thi': 'Vận động nhẹ giữa hai phần thi'}[k]
    sl.append(S('3', 'move', 'Vận động', f'{game}. Dùng thẻ lớn dán bốn góc lớp; màn chỉ đếm giờ.', game=game, cards=(ws or words(ud))[:8], sec=600))
    if u in CHANTS:
        sl.append(S('3', 'song', 'Vận động', 'Chant của unit với động tác, đứng thành vòng tròn.', chant=u))
    blocks.append(dict(k='[3]', name='Vận động', min=10, acts=[game, f'Chant unit: {CHANTS[u]["name"]}' if u in CHANTS else 'Chant']))

    # [4] tiếng Trung
    b4 = []
    if k in ('intro', 'w13', 'repeat', 'practice'):
        cq = [q for q in cham_qs(days) if q['l'] == 'zh'][:3]
        for q in cq:
            sl.append(S('4', 'who', 'Thẻ', 'Ai đang nói? Phát tiếng, các con chỉ rối que hoặc giơ thẻ số nhân vật.', **q))
        if cq: b4.append('Ai đang nói? (rối que, thẻ số)')
        sl += story_slides([x for x in sc if x['zh']], 'zh', '4', 'Xiaomei kể: phát tiếng Trung từng câu, các con làm 做一做.')
        sl += card_slides(ws, 'zh', '4', 'Flashcard tiếng Trung: nói từ, cả lớp nhắc lại; tay vẽ thanh điệu.')
        for it in pdn(days)[:3]:
            sl.append(S('4', 'bridge', 'Chiếu', 'Cầu nối Anh – Trung: đọc câu tiếng Anh, các con nói câu tiếng Trung rồi Hiện.', **it))
        b4 += ['Xiaomei kể phần mới, 做一做', 'Flashcard, thanh điệu bằng tay', 'Cầu nối Anh – Trung (Phiên dịch nhí làm mẫu)']
        if k == 'practice':
            b4.insert(0, 'Go fish hai tiếng, Memory tranh – chữ Hán (thẻ mini)')
    elif k == 'produce':
        for it in pdn(ud)[:5]:
            sl.append(S('4', 'bridge', 'Thẻ', 'Phiên dịch nhí không mẫu: từng cặp, một bạn nói tiếng Anh, bạn kia nói tiếng Trung. Cô bấm 🎤 ZH.', hide=True, **it))
        for it in tl_items(ud)[:3]:
            sl.append(S('4', 'oral', 'Thẻ', 'YCT口试 听后回答: cô hỏi từng bé, chấm trên màn cô.', **it))
        b4 += ['Phiên dịch nhí không mẫu theo cặp', 'YCT口试 từng bé']
    elif k == 'on':
        sl.append(S('4', 'present', 'Thẻ', 'Mỗi bé thuyết trình một sản phẩm thủ công trước lớp.', frames=[CRAFTS[x]['say'] for x in ['1', '4', '2', '3', '5', '6', '7', '8'] if x in CRAFTS][:4 if n == 12 else 8][-4:]))
        b4.append('Mỗi bé thuyết trình một sản phẩm thủ công')
    elif k == 'thi':
        hq2 = hoi_qs(days)
        sl.append(S('4', 'note', 'Thẻ', 'Phần Đọc làm trên giấy (15–17 phút). Sau đó thi nói 1–1, các bạn khác xoay 3 trạm tự làm.',
                    t='Phần Đọc · rồi thi nói 1–1', body='Bàn thi của cô quay mặt ra lớp. Màn chiếu chỉ hiện đồng hồ trạm và tên bạn tới lượt.'))
        for it in (tl_items(days) or [])[:4]:
            sl.append(S('4', 'oral', 'Thẻ', 'Câu hỏi thi nói: cô hỏi, bé trả lời, cô chấm.', **it))
        for q in hq2[:4]:
            sl.append(S('4', 'ask', 'Thẻ', 'Câu hỏi thi nói (theo truyện).', **q))
        b4 += ['Bài giấy phần Đọc', 'Thi nói 1–1, ~3 phút mỗi bé; 3 trạm tự làm']
    blocks.append(dict(k='[4]', name='Tiếng Trung' if k not in ('on', 'thi') else ('Thuyết trình' if k == 'on' else 'Đọc + thi nói'),
                       min=25 if k != 'thi' else 47, acts=b4))

    # [5] chữ & âm
    mc = meo(days)
    for c in mc:
        sl.append(S('5', 'sound', 'Chiếu', 'Mẹo âm: cô làm mẫu, cả lớp nói theo, chạm chữ.', **c))
    wb = L.get('wb', [])
    sl.append(S('5', 'board', 'Thẻ', 'Bảng con: viết từ tiếng Anh, tô chữ Hán theo thứ tự nét. Cô đi vòng, bấm ✓ bảng con.', wb=wb))
    blocks.append(dict(k='[5]', name='Chữ và âm', min=7, acts=['Mẹo âm của buổi' if mc else 'Ôn chữ đã học', f'Bảng con: {"; ".join(wb)}']))

    # [6] truyện, thủ công, đầu ra
    b6 = []
    cu = u if u in CRAFTS else ''
    if k in ('intro', 'w13', 'repeat', 'practice'):
        sl.append(S('6', 'bigbook', 'Chiếu', 'Big Book: đọc lại phần đã học, các con giơ thẻ nhân vật khi nhân vật nói.', unit=u, upto=max([DAYS[d]['part'] for d in days if str(DAYS[d].get('part', '')).startswith('Phần')] or ['Phần 0'])))
        b6.append('Big Book phần đã học, giơ thẻ nhân vật')
    if k == 'produce':
        c = CRAFTS.get(cu)
        sl.append(S('6', 'present', 'Thẻ', 'Thuyết trình 30–60 giây với sản phẩm thủ công; bạn khác vỗ tay. Cô bấm 🎤 từng bé.', frames=[c['say']] if c else []))
        sl.append(S('6', 'bigbook', 'Thẻ', 'Đọc to một trang reader: mỗi bé một trang.', unit=u, upto='Cả truyện'))
        b6 += ['Thuyết trình với sản phẩm thủ công', 'Đọc to một trang reader']
    if cu and k != 'produce':
        step_i = {'intro': 0, 'w13': 0, 'repeat': 1, 'practice': 2}.get(k, 0)
        if n == 2 and cu == '4': step_i = 0
        sl.append(S('6', 'craft', 'Thẻ', 'Thủ công 5 phút: phát mẫu in, làm theo bước của buổi.', unit=cu, step=step_i))
        b6.append(f'Thủ công: {CRAFTS[cu]["name"]} – {CRAFTS[cu]["steps"][step_i]}')
    if k == 'on':
        b6.append('(đã gộp vào trạm và thuyết trình)')
    blocks.append(dict(k='[6]', name='Truyện, thủ công, đầu ra', min=15 if k not in ('on', 'thi') else 0, acts=b6))

    # [7] vinh danh
    sl.append(S('7', 'praise', 'Chiếu', 'Vinh danh từng bạn theo việc con làm nhiều nhất; huy hiệu cả lớp.'))
    sl.append(S('7', 'song', 'Chiếu', 'Goodbye Chant.', chant='bye'))
    nxt = LOP.get(n + 1, {}).get('days', [])
    sl.append(S('7', 'home', 'Chiếu', 'Giao việc ở nhà.', wb=wb, nxt=nxt))
    blocks.append(dict(k='[7]', name='Vinh danh, việc ở nhà', min=5, acts=['Vinh danh từng bạn', 'Goodbye Chant', f'Sách bài tập; web ngày {", ".join(map(str, nxt))}']))

    return dict(n=n, t=L['t'], about=L['about'], kind=k, units=units, days=days, prep=L.get('prep', []), wb=wb,
                words=ws, videos=videos(days), blocks=blocks, slides=sl)


SESS = {n: build_session(n) for n in range(1, 49)}

# Big Book / Reader: truyện của từng unit (reader trên web)
BOOKS = {}
for k_, r in SD['reader'].items():
    BOOKS[k_] = dict(t=r['t'], zh=r['zh'], pages=[dict(part=p.get('part'), who=p['who'], img=p['img'], en=p['en'], zh=p['zh'], py=p.get('py', ''),
                                                      a_en=p.get('a_en') or au('en', p['en']), a_zh=p.get('a_zh') or au('zh', p['zh'])) for p in r['pages']])

# gắn giọng cho chant
for c in CHANTS.values():
    c['lines'] = [dict(en=e, zh=z, mv=m, a_en=au('en', e), a_zh=au('zh', z)) for e, z, m in c['lines']]

UNITS = {}
for x in SD['units_q']:
    UNITS[str(x['u'])] = dict(name=x['n'], img=x['img'], days=x['days'])

WHO = {k_: dict(n=v[0], img=v[1]) for k_, v in SD['who'].items()}
DATA = dict(sess=SESS, books=BOOKS, chants=CHANTS, tunes=TUNES, crafts=CRAFTS, units=UNITS, who=WHO,
            map=[dict(key=m['key'], name=m['name'], topic=m['topic'], story=m['story'], chang=m['chang'],
                      lops=[i for kk, i in m['items'] if kk == 'lop']) for m in SD['map']])
OUT.parent.mkdir(exist_ok=True)
OUT.write_text('window.DAY = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')

# báo cáo nhanh
miss = [(k_, l['en']) for k_, c in CHANTS.items() for l in c['lines'] if not l['a_en']]
missz = [(k_, l['zh']) for k_, c in CHANTS.items() for l in c['lines'] if not l['a_zh']]
print('buổi:', len(SESS), 'trang chiếu:', sum(len(s['slides']) for s in SESS.values()), 'kb:', OUT.stat().st_size // 1024)
print('chant thiếu giọng EN:', miss)
print('chant thiếu giọng ZH:', missz)
for n in (1, 2, 3, 4, 5, 6, 7, 12, 30, 48):
    s = SESS[n]; print(n, s['kind'], s['units'], len(s['slides']), 'từ', len(s['words']))
