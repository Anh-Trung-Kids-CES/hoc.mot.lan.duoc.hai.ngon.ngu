"""Lời vè lớp offline 48 buổi – Little Seed U2–U12, Seedling U1–U12 + vè lời đề Seedling (viết 13/11/2026, CHỜ CHỊ DUYỆT).

Nguyên tắc: claude/NguyenTac_Ve_OnVong_1311.md (khung mới – ô cũ, chị duyệt 13/11; mục 3 chị chốt 13/11),
claude/NguyenTac_LapLai_DangBai.md 24–25, 30–35, 61a, 65. Khung câu lấy từ big book bản chốt (claude/BigBook_22quyen_LoiSoTrang_1311.json).

Tệp dữ liệu RIÊNG của vè (chat big book không sửa tệp này; chat vè không sửa code big book).
Chỗ khác trỏ tới vè theo MÃ UNIT: VE['LS'][4], VE['SD'][7], VE['SD']['de'] (vè lời đề), VE['LS'][1] (vè chào, chỉ đổi dòng tuổi).

Mỗi dòng: (người, câu Anh, câu Trung, tranh, ô cũ)
  - Câu Anh: CHỮ HOA = phách mạnh (4 phách/dòng). {…} = ô thay từ: lần 3 web ẩn chữ trong ô, chỉ hiện tranh, con tự nói.
    {#…} = ô tuổi: mẫu nói một tuổi, con thay bằng tuổi của mình (giơ ngón tay). ___ = tên con.
  - Câu Trung: {…} cùng ô, cùng thứ tự với câu Anh.
  - Tranh: trang big book 'LS/u3/p6', 'SD/u4/p13' (LS u2 = bản vẽ mới u2-moi) hoặc thẻ 'tranh/xxx'.
  - Ô cũ: từ lấy từ unit trước, ghi (từ, unit) để chị thấy tỉ lệ ô cũ.
Mỗi vè: ten (Anh, Trung), van [(vần Anh, vần Trung) theo từng cặp dòng], vá (từ thiếu theo báo cáo được cài vào).
Chạy: python3 ve48_loi.py  → kiểm (4 phách, độ dài, ô khớp hai tiếng, pinyin từ điển) và ghi ve48.json.
"""
import json, os, re

VE = {'LS': {}, 'SD': {}}

# ======================= LITTLE SEED (6 dòng: mở → trao đổi → đóng; dòng 5–6 gọi tên con) =======================

# U1 vè chào: giữ nguyên lời đã duyệt, chỉ đổi dòng tuổi cố định thành ô tuổi (chị chốt 13/11)
VE['LS'][1] = dict(chi_doi=True, ten=('Hello and Goodbye!', '你好，再见！'), van=[], va=[], dong=[
    ('lop', 'Leo, Leo, HOW old are YOU?', 'Leo，Leo，你几岁？', 'LS/u1/p6', []),
    ('con', "{#FIVE}! I'm {#FIVE}! And YOU? And YOU?", '{#五}岁{#五}岁，我{#五}岁！', 'LS/u1/p6', [])])

VE['LS'][2] = dict(ten=('How Old Are You?', '你几岁？'), van=[('you / two', 'ui'), ('name', 'e – o'), ('you', 'ui')], va=[], dong=[
    ('lop', '{PUP-py}, {PUP-py}, HOW old are YOU?', '{小狗}{小狗}，你几岁？', 'LS/u1/p8', [('puppy', 'U1')]),
    ('con', "WOOF, WOOF! I'm {TWO}! I'm {TWO}!", '汪汪汪，我{两}岁！', 'LS/u2/p12', []),
    ('lop', "{KIT-ten}, {KIT-ten}, WHAT'S your NAME?", '{小猫}{小猫}，你叫什么？', 'LS/u1/p10', [('kitten', 'U1')]),
    ('con', "MEOW! I'm {KIT-ten}! THAT'S my NAME!", '喵喵！{小猫}就是我！', 'LS/u2/p6', [('kitten', 'U1')]),
    ('lop', '___, ___, HOW old are YOU?', '___，___，你几岁？', 'LS/u2/p9', []),
    ('con', "{#SIX}! I'm {#SIX}! And YOU? And YOU?", '{#六}岁{#六}岁，我{#六}岁！', 'LS/u2/p10', [])])

VE['LS'][3] = dict(ten=('Who Is She?', '她是谁？'), van=[('she / me', 'ui'), ('he / me', 'ui'), ('she / me', 'ui')],
                   va=['he/she · 他/她 (gỡ lỗi he/she ↔ 这)', 'me', 'with'], dong=[
    ('lop', 'WHO is SHE? WHO is SHE?', '她是谁？她是谁？', 'LS/u3/p5', []),
    ('con', "SHE'S my {GRAND-ma}! SHE loves ME!", '她是我{奶奶}！对，对，对！', 'LS/u3/p6', []),
    ('lop', 'WHO is HE? WHO is HE?', '他是谁？他是谁？', 'LS/u3/p3', []),
    ('con', "HE'S my {DAD-dy}! HE loves ME!", '他是我{爸爸}！对，对，对！', 'LS/u1/p3', [('daddy', 'U1')]),
    ('lop', '___, ___, WHO is SHE?', '___，___，她是谁？', 'LS/u3/p11', []),
    ('con', "SHE'S my {FRIEND}! She PLAYS with ME!", '她是我{朋友}！对，对，对！', 'LS/u1/p6', [('friend', 'U1')])])

VE['LS'][4] = dict(ten=('Touch, Touch!', '摸一摸！'), van=[('ears / here', 'o (朵 – 摸)'), ('nose / noses', '子 – 子'), ('feet / beat', 'iao (脚 – 跳)')],
                   va=['they'], dong=[
    ('lop', '{GRAND-ma}, {GRAND-ma}, TOUCH your {EARS}!', '{奶奶}{奶奶}，摸{耳朵}！', 'LS/u3/p6', [('grandma', 'U3')]),
    ('con', 'I HAVE two {EARS}! THEY are HERE!', '我有{耳朵}，摸一摸！', 'LS/u4/p5', []),
    ('lop', '{PUP-py}, {PUP-py}, TOUCH your {NOSE}!', '{小狗}{小狗}，摸{鼻子}！', 'LS/u4/p9', [('puppy', 'U1')]),
    ('con', 'HA, ha! I have TWO RED {NOS-es}!', '哈哈！两个红{鼻子}！', 'LS/u4/p10', []),
    ('lop', '___, ___, TOUCH your {FEET}!', '___，___，摸摸{脚}！', 'LS/u4/p11', []),
    ('con', 'I HAVE two {FEET}! JUMP to the BEAT!', '我有两只{脚}，跳一跳！', 'LS/u4/p7', [])])

VE['LS'][5] = dict(ten=('How Do You Feel?', '你感觉怎么样？'), van=[('grandpa / ah', '—'), ('grandma / ha', 'ang (样 – 洋)'), ('okay / hooray', 'a (吗 – 啦)')],
                   va=[], dong=[
    ('lop', 'HOW do you FEEL, {GRAND-pa}, {GRAND-pa}?', '{爷爷}{爷爷}，您感觉怎么样？', 'LS/u3/p8', [('grandpa', 'U3')]),
    ('con', 'I am {SLEEP-y}! AH… AH… AH!', '我很{困}，想睡觉！', 'LS/u5/p8', []),
    ('lop', 'HOW do you FEEL, {GRAND-ma}, {GRAND-ma}?', '{奶奶}{奶奶}，您感觉怎么样？', 'LS/u3/p6', [('grandma', 'U3')]),
    ('con', 'I AM {HAP-py}! HA, ha, HA!', '我很{开心}，喜洋洋！', 'LS/u5/p14', []),
    ('lop', '___, ___, ARE you O-KAY?', '___，___，你好吗？', 'LS/u5/p11', []),
    ('con', 'I AM {HUN-gry}! RICE, hoo-RAY!', '我很{饿}，吃饭啦！', 'LS/u5/p12', [])])

VE['LS'][6] = dict(ten=('What Is This?', '这是什么？'), van=[('look / book', 'an (看 – 看)'), ('that / bag', 'ao (瞧 – 包)'), ('this / please', 'o (么 – 握)')],
                   va=['please'], dong=[
    ('lop', 'WHAT is THIS? LOOK, look, LOOK!', '这是什么？看一看！', 'LS/u6/p2', []),
    ('con', 'THIS is a NEW, NEW {BOOK}!', '这是新{书}，我爱看！', 'LS/u6/p3', []),
    ('lop', 'WHAT is THAT? WHAT is THAT?', '那是什么？瞧一瞧！', 'LS/u6/p12', []),
    ('con', 'THAT is my {SCHOOL-bag}! a BIG, big BAG!', '那是我的大{书包}！', 'LS/u6/p1', []),
    ('lop', '___, ___, WHAT is THIS?', '___，___，这是什么？', 'LS/u6/p10', []),
    ('con', 'THIS is my {HAND}! SHAKE it, PLEASE!', '这是{小手}，握一握！', 'LS/u4/p6', [('hand', 'U4')])])

VE['LS'][7] = dict(ten=('Where Is It?', '在哪儿？'), van=[('bed / head', 'ang (上 – 上)'), ('chair / there', 'er (哪儿 – 那儿)'), ('book / look', 'er (哪儿 – 这儿)')],
                   va=['哪儿'], dong=[
    ('lop', 'WHERE is my {RUL-er}? ON the {BED}?', '我的{尺子}在{床}上？', 'LS/u6/p9', [('ruler', 'U6')]),
    ('con', "NOT on the {BED}! It's ON my HEAD!", '不在{床}上，在头上！', 'LS/u7/p3', [('head', 'U4')]),
    ('lop', 'WHERE is my {PEN}? UN-der the {CHAIR}?', '我的{笔}在哪儿？{椅子}下？', 'LS/u6/p5', [('pen', 'U6')]),
    ('con', "NOT under the {CHAIR}! LOOK! It's THERE!", '不在{椅子}下，在那儿！', 'LS/u7/p10', []),
    ('lop', '___, ___, WHERE is your {BOOK}?', '___，你的{书}在哪儿？', 'LS/u6/p3', [('book', 'U6')]),
    ('con', 'ON the {SO-fa}! COME and LOOK!', '在{沙发}上！在这儿！', 'LS/u7/p5', [])])

VE['LS'][8] = dict(ten=('I Can…', '我会……'), van=[('jump / bump', 'iao (跳 – 跳)'), ('swim / in', 'ong (泳 – 通)'), ('fly / try', 'a (吗 – 吧)')],
                   va=['we', 'they'], dong=[
    ('lop', "LOOK! I'm a {RAB-bit}! I CAN {JUMP}!", '我是{兔子}，我会{跳}！', 'LS/u8/p4', []),
    ('con', 'WE jump on the {BED}! BUMP, bump, BUMP!', '我们在{床}上跳呀跳！', 'LS/u7/p3', [('bed', 'U7')]),
    ('lop', "LOOK! I'm a {FISH}! I CAN {SWIM}!", '我是{鱼}，我会{游泳}！', 'LS/u8/p3', []),
    ('con', "THEY swim in the {POND}! LET'S jump IN!", '它们在{池塘}里，扑通！扑通！', 'LS/u8/p3', []),
    ('lop', '___, ___, CAN you {FLY}?', '___，___，你会{飞}吗？', 'LS/u8/p6', []),
    ('con', "I CAN'T {FLY}! But I CAN TRY!", '我不会{飞}，试试吧！', 'LS/u8/p8', [])])

VE['LS'][9] = dict(ten=('What Do You Like?', '你喜欢什么？'), van=[('like / nice', 'o (么 – 多)'), ('drink / drink', 'e (么 – 喝)'), ('like / bite', 'e (么 – 个)')],
                   va=[], dong=[
    ('lop', '{MOUSE}, {MOUSE}, WHAT do you LIKE?', '{老鼠}{老鼠}，喜欢什么？', 'LS/u8/p10', [('mouse', 'U8')]),
    ('con', 'I LIKE {RICE}! RICE is NICE!', '我爱吃{米饭}，吃好多！', 'LS/u9/p12', []),
    ('lop', '{BIRD}, {BIRD}, WHAT do you DRINK?', '小{鸟}小{鸟}，喝什么？', 'LS/u8/p2', [('bird', 'U8')]),
    ('con', 'I DRINK {WA-ter}! DRINK, drink, DRINK!', '我喝{水}，喝呀喝！', 'tranh/water', []),
    ('lop', '___, ___, WHAT do you LIKE?', '___，___，你喜欢什么？', 'LS/u9/p11', []),
    ('con', 'I LIKE {AP-ples}! TAKE a BITE!', '我喜欢{苹果}，来一个！', 'LS/u9/p4', [])])

VE['LS'][10] = dict(ten=('What Is the Weather?', '天气怎么样？'), van=[('today / play', 'a (啦 – 吧)'), ('sad / dad', '—'), ('weather / together', 'a (吗 – 吧)')],
                    va=['please', "let's"], dong=[
    ('lop', 'WEATH-er, WEATH-er, WHAT is it to-DAY?', '天气天气，怎么啦？', 'LS/u10/p1', []),
    ('con', "It IS {SUN-ny}! LET'S go and PLAY!", '今天{晴天}，去玩吧！', 'LS/u10/p2', []),
    ('lop', 'It IS {RAIN-y}! I am SO {SAD}.', '今天{下雨}，我{难过}。', 'LS/u10/p6', [('sad', 'U5')]),
    ('con', '{MILK}, PLEASE! THANK you, DAD!', '请给我{牛奶}！谢谢爸爸！', 'LS/u9/p10', [('milk', 'U9'), ('thank you', 'U7'), ('daddy', 'U1')]),
    ('lop', '___, ___, WHAT is the WEATH-er?', '___，___，天气好吗？', 'LS/u10/p8', []),
    ('con', "It is {WIND-y}! LET'S PLAY to-GETH-er!", '今天{刮风}，一起玩吧！', 'LS/u10/p4', [])])

VE['LS'][11] = dict(ten=('What Colour Is It?', '什么颜色？'), van=[('bed / red', 'e (色 – 的)'), ('bird / hello', 'e (色 – 的)'), ('think / drink', 'e (色 – 喝)')],
                    va=[], dong=[
    ('lop', 'WHAT col-our IS it? LOOK at my {BED}!', '什么颜色？我的{床}！', 'LS/u7/p2', [('bed', 'U7')]),
    ('con', "IT'S {RED}! My BED is {RED}!", '我的床是{红色}的！', 'LS/u11/p4', [('bed', 'U7')]),
    ('lop', 'WHAT col-our ARE you, {BIRD}, {BIRD}?', '小{鸟}小{鸟}，什么颜色？', 'LS/u8/p2', [('bird', 'U8')]),
    ('con', 'I AM {YEL-low}! HEL-lo, HEL-lo!', '我是{黄色}的！黄黄的！', 'LS/u11/p6', []),
    ('lop', '___, ___, WHAT COL-our do you THINK?', '___，___，什么颜色？', 'LS/u11/p11', []),
    ('con', '{PINK}! PINK {MILK} to DRINK!', '{粉色}{牛奶}，喝一喝！', 'LS/u9/p10', [('milk', 'U9')])])

VE['LS'][12] = dict(ten=('How Many?', '几个？'), van=[('me / see', '—'), ('yellow / hello', 'iao (鸟 – 好)'), ('friends / hand', 'ou (友 – 手)')],
                    va=['boy', 'with', 'me'], dong=[
    ('lop', 'HOW many {BOYS}? COUNT with ME!', '几个{男孩}？数一数！', 'LS/u12/p3', []),
    ('con', 'ONE, two, three! {THREE} {BOYS} I SEE!', '一二三，{三}个{男孩}！', 'LS/u12/p4', []),
    ('lop', 'HOW MAN-y {BIRDS} are {YEL-low}?', '几只{黄色}的{鸟}？', 'LS/u8/p2', [('bird', 'U8'), ('yellow', 'U11')]),
    ('con', '{FOUR} {BIRDS} say HEL-lo, HEL-lo!', '{四}只{鸟}，你好你好！', 'LS/u11/p6', [('bird', 'U8')]),
    ('lop', '___, ___, HOW many {FRIENDS}?', '___，___，几个{朋友}？', 'LS/u12/p3', [('friend', 'U1')]),
    ('con', '{TEN} {FRIENDS}! HAND in HAND!', '{十}个{朋友}，手拉手！', 'LS/u12/p12', [('friend', 'U1')])])

# ======================= SEEDLING (8 dòng; lớp 3–5 nên câu dài hơn, hai cặp hỏi – đáp có nhân vật, cặp cuối gọi tên con) =======================
# Thứ tự học: U1 + U4 (ngày 1–9) → U2 → U3 → U5 … U12. "Unit trước" của U2 là U1/U4; của U5 là U3, U2.

# U1: giữ vè chào (đã hát ở buổi 0–1, chị đã duyệt); không có unit trước để lấy ô cũ.
VE['SD'][1] = dict(giu=True, ten=('Hello and Goodbye!', '你好，再见！'), van=[], va=[], dong=[])

VE['SD'][4] = dict(ten=('Touch Your…', '摸摸……'), van=[('knees / please', 'ai (盖 – 盖)'), ('ah / ha', 'a (啊 – 哈)'), ('feet / beat', 'iao (脚 – 笑)'), ('toes / nose', 'i (趾 – 子)')],
                   va=['cơ thể U4 (vá cho nhóm cơ thể)'], dong=[
    ('lan', '{GRAND-pa}, {GRAND-pa}, TOUCH your {KNEES}!', '{爷爷}{爷爷}，摸{膝盖}！', 'SD/u1/p9', [('grandpa', 'U1')]),
    ('ong', 'OH, my {KNEES}! HELP me, PLEASE!', '哎哟哎哟，我的{膝盖}！', 'SD/u4/p5', []),
    ('lan', '{PUP-py}, {PUP-py}, open your {MOUTH}, say AH!', '{小狗}{小狗}，张大{嘴}，啊！', 'SD/u4/p6', [('puppy', 'Nền LS')]),
    ('kids', "AH! I've GOT a big {MOUTH}! HA, ha!", '啊！我有大{嘴巴}，哈哈！', 'SD/u4/p6', []),
    ('lan', '{KIDS}, {KIDS}, STAMP your {FEET}!', '{小朋友}，跺跺{脚}！', 'SD/u4/p10', [('kids', 'U1')]),
    ('kids', 'STAMP, STAMP, STAMP to the BEAT!', '跺跺跺，真好笑！', 'SD/u4/p10', []),
    ('lan', '___, ___, TOUCH your {TOES}!', '___，___，摸{脚趾}！', 'SD/u4/p12', []),
    ('kids', "I've GOT ten {TOES} and ONE small {NOSE}!", '十个{脚趾}，一个{鼻子}！', 'SD/u4/p8', [])])

VE['SD'][2] = dict(ten=('How Old Are You?', '你几岁？'), van=[('you / true', 'e (了 – 乐)'), ('bigger / bigger', 'a (大 – 大)'), ('please / these', 'i (指 – 里)'), ('you / you', 'ui (岁 – 岁)')],
                   va=['ngón tay U4'], dong=[
    ('lan', '{GRAND-pa}, {GRAND-pa}, HOW old are YOU?', '{爷爷}，您多大年纪了？', 'SD/u2/p10', [('grandpa', 'U1')]),
    ('kids', "I'm {SEV-en}! HA, ha… NOT TRUE!", '我{七}岁！哈哈，逗你乐！', 'SD/u2/p11', []),
    ('lan', '{SEV-en}, {EIGHT}! WHICH is BIG-ger?', '{七}和{八}，哪个大？', 'SD/u2/p9', []),
    ('kids', '{EIGHT} is BIG-ger, BIG-ger, BIG-ger!', '{八}比七大，大大大！', 'SD/u2/p9', []),
    ('lan', 'SHOW me {SEV-en} {FIN-gers}, PLEASE!', '伸出{七}个{手指}！', 'tranh/finger', [('finger', 'U4')]),
    ('kids', '{SEV-en} {FIN-gers}! LOOK at THESE!', '{七}个{手指}，看这里！', 'tranh/finger', [('finger', 'U4')]),
    ('lan', '___, ___, HOW old are YOU?', '___，___，你几岁？', 'SD/u2/p5', []),
    ('kids', "I'm {#NINE}! I'm {#NINE}! WHAT a-bout YOU?", '我{#九}岁！你呢？几岁？', 'SD/u2/p6', [])])

VE['SD'][3] = dict(ten=('Who Is She?', '她是谁？'), van=[('she / me', '—'), ('eight / great', '—'), ('three / see', 'ui (岁 – 妹)'), ('he / me', '—')],
                   va=[], dong=[
    ('kids', 'LOOK at my PHO-to! WHO is SHE?', '看我的照片！她是谁？', 'SD/u3/p1', []),
    ('kids', "SHE'S my {MOTH-er}! SHE loves ME!", '她是我{妈妈}，她爱我！', 'SD/u3/p3', []),
    ('kids', 'WHO is HE? HE is {EIGHT}.', '他是谁？他{八}岁。', 'SD/u2/p8', [('eight', 'U2')]),
    ('kids', "HE'S my {OLD-er BRO-ther}! GREAT!", '他是我{哥哥}，真棒！', 'SD/u3/p5', []),
    ('kids', 'WHO is SHE? SHE is {THREE}.', '她是谁？她{三}岁。', 'SD/u3/p6', [('three', 'U2')]),
    ('kids', "SHE'S my {YOUNG-er SIS-ter}, you SEE!", '她是我的小{妹妹}！', 'SD/u3/p7', []),
    ('lan', '___, ___, WHO is HE?', '___，___，他是谁？', 'SD/u3/p8', []),
    ('kids', "HE'S my {GRAND-pa}! He LOVES ME!", '他是我{爷爷}，他爱我！', 'SD/u1/p9', [('grandpa', 'U1')])])

VE['SD'][5] = dict(ten=('How Do You Feel?', '你感觉怎么样？'), van=[('feel / meal', 'ang (样 – 香)'), ('hot / lot', 'a (吗 – 呀)'), ('please / knees', '—'), ('okay / hooray', 'a (吗 – 哈)')],
                   va=['đầu gối U4'], dong=[
    ('lan', '{UN-cle}, {UN-cle}, HOW do you FEEL?', '{叔叔}{叔叔}，感觉怎么样？', 'SD/u3/p9', [('uncle', 'U3')]),
    ('kids', 'I FEEL {HUN-gry}! I WANT a MEAL!', '我{饿}了，饭菜香！', 'SD/u5/p8', []),
    ('lan', '{BRO-ther}, {BRO-ther}, ARE you HOT?', '{哥哥}{哥哥}，你热吗？', 'SD/u3/p5', [('older brother', 'U3')]),
    ('kids', "I'm {THIRS-ty}! I WANT {WA-ter}, a LOT!", '我{渴}了！要喝很多{水}呀！', 'SD/u5/p10', []),
    ('lan', 'HOW do you FEEL, {GRAND-pa}? tell me, PLEASE!', '{爷爷}，您感觉怎么样？', 'SD/u5/p9', [('grandpa', 'U1')]),
    ('kids', 'I FEEL {TIRED}! OH, my {KNEES}!', '我很{累}！哎哟，{膝盖}！', 'SD/u4/p5', [('knees', 'U4')]),
    ('lan', '___, ___, ARE you O-KAY?', '___，___，你好吗？', 'SD/u5/p3', []),
    ('kids', 'I FEEL {ex-CIT-ed}! HIP, hip, hoo-RAY!', '我很{兴奋}，哈哈哈！', 'SD/u5/p4', [])])

VE['SD'][6] = dict(ten=('What Is This?', '这是什么？'), van=[('this / kiss', 'e (么 – 个)'), ('these / please', '—'), ('O / no', '—'), ('see / me', 'o (么 – 我)')],
                   va=[], dong=[
    ('lan', 'CLOSE your {EYES}! WHAT is THIS?', '{闭上}眼睛！这是什么？', 'SD/u5/p5', [('close your eyes', 'U5')]),
    ('kids', "It's my {TOY DOG}! GIVE it a KISS!", '是我的{玩具狗}！亲一个！', 'SD/u5/p6', [('toy', 'U5')]),
    ('lan', 'CLOSE your {EYES}! WHAT are THESE?', '{闭上}眼睛！这些是什么？', 'SD/u6/p5', [('close your eyes', 'U5')]),
    ('kids', '{SCIS-sors}! CARE-ful! CARE-ful, PLEASE!', '是{剪刀}！小心！小心！', 'SD/u6/p6', []),
    ('lan', 'WHAT are THESE? L! E! O!', '这些是什么？L、E、O！', 'SD/u6/p9', []),
    ('kids', '{LET-ters}! STICK-y letters! OH, NO!', '是{字母}！粘住了！', 'SD/u6/p10', []),
    ('lan', '___, ___, WHAT do you SEE?', '___，___，看见什么？', 'SD/u6/p11', []),
    ('kids', "IT'S my {PHO-to}! LOOK, that's ME!", '是我的{照片}，你看我！', 'SD/u3/p1', [('photo', 'U3')])])

VE['SD'][7] = dict(ten=('Where Is It?', '在哪儿？'), van=[('where / chair', 'er (哪儿 – 那儿)'), ('bed / head', 'ang (上 – 上)'), ('ball / all', 'er (哪儿 – 那儿)'), ('you / boo', 'er (哪儿 – 这儿)')],
                   va=['哪儿'], dong=[
    ('lan', 'WHERE is my {CRAY-on}? WHERE, oh WHERE?', '我的{蜡笔}在哪儿？', 'SD/u6/p4', [('crayon', 'U6')]),
    ('kids', "LOOK! It's RIGHT UN-der the {CHAIR}!", '{椅子}下面，在那儿！', 'SD/u7/p10', []),
    ('lan', 'WHERE is my {GLUE}? ON the {BED}?', '我的{胶水}在{床}上？', 'SD/u6/p8', [('glue', 'U6')]),
    ('kids', "NO, NO! It's ON your {HEAD}!", '不在！在你头上！', 'SD/u7/p7', [('head', 'U4')]),
    ('lan', 'WHERE is my {BALL}? WHERE is my {BALL}?', '{球}在哪儿？{球}在哪儿？', 'SD/u7/p10', []),
    ('kids', 'by the {DOOR}? NO, NOT at ALL!', '在{门}边？不在那儿！', 'SD/u7/p1', []),
    ('lan', '___, ___, WHERE are YOU?', '___，___，你在哪儿？', 'SD/u7/p11', []),
    ('kids', 'HERE in the {BED-room}! PEEK, PEEK-a-BOO!', '我在{卧室}！在这儿！', 'SD/u7/p7', [])])

VE['SD'][8] = dict(ten=('Can It Fly?', '它会飞吗？'), van=[('fly / high', 'a (吗 – 啦)'), ("can't / legs", 'ui (会 – 腿)'), ('can it / at it', 'a (吗 – 它)'), ('hop / stop', 'a (吗 – 啦)')],
                   va=['chân U4 (vá nhóm cơ thể)'], dong=[
    ('lan', 'can the {DUCK} FLY? can the {DUCK} FLY?', '{鸭子}{鸭子}，会飞吗？', 'SD/u8/p3', []),
    ('kids', 'YES! It CAN! It FLIES so HIGH!', '会！它会飞，飞高啦！', 'SD/u8/p4', []),
    ('lan', "can the {FROG} FLY? NO, it CAN'T!", '{青蛙}会飞吗？不会！', 'SD/u8/p5', []),
    ('kids', 'It can {HOP} on its LONG, LONG {LEGS}!', '它会{跳}，长长{腿}！', 'SD/u8/p6', [('legs', 'U4')]),
    ('lan', 'can the {PO-lar BEAR} SWIM? can it? CAN it?', '{北极熊}会游泳吗？会吗？', 'SD/u8/p9', []),
    ('kids', 'YES, it CAN! SPLASH! LOOK at it!', '会！扑通！快看它！', 'SD/u8/p10', []),
    ('lan', '___, ___, CAN you {HOP}?', '___，___，你会{跳}吗？', 'SD/u8/p6', []),
    ('kids', 'YES, I CAN! {HOP}, hop, and STOP!', '我会{跳}！跳！停下啦！', 'SD/u8/p6', [])])

VE['SD'][9] = dict(ten=('Do You Like…?', '你喜欢……吗？'), van=[('chips / lips', 'a (吗 – 把)'), ('cream / dream', 'a (吗 – 它)'), ('no / know', 'iao (条 – 条)'), ('juice / goose', 'a (吗 – 吧)')],
                   va=[], dong=[
    ('lan', '{FROG}, {FROG}, do you LIKE {CHIPS}?', '{青蛙}{青蛙}，喜欢{薯条}吗？', 'SD/u8/p5', [('frog', 'U8')]),
    ('kids', 'YES, I DO! I LICK my LIPS!', '喜欢呀！我要一大把！', 'SD/u9/p12', []),
    ('lan', '{PO-lar BEAR}, do you like {ICE CREAM}?', '{北极熊}，喜欢{冰淇淋}吗？', 'SD/u8/p9', [('polar bear', 'U8')]),
    ('kids', "YES, I DO! It's MY DREAM!", '喜欢！喜欢！最爱它！', 'tranh/ice_cream', []),
    ('lan', '{DUCK}, do you LIKE {NOO-dles}? NO?', '{鸭子}，不喜欢{面条}？', 'SD/u8/p3', [('duck', 'U8')]),
    ('kids', 'MMM! I LIKE {NOO-dles}, now I KNOW!', '嗯！我喜欢{面条}！', 'SD/u9/p8', []),
    ('lan', '___, ___, do you LIKE {JUICE}?', '___，___，喜欢{果汁}吗？', 'SD/u9/p3', []),
    ('kids', 'YES, I DO! like a THIRS-ty GOOSE!', '喜欢！我{渴}了，喝吧！', 'SD/u9/p4', [('thirsty', 'U5')])])

VE['SD'][10] = dict(ten=("What's the Weather Like?", '今天天气怎么样？'), van=[('today / hooray', 'ang (样 – 棒)'), ('coat / boat', 'ao (套 – 好)'), ('hat / that', '—'), ('snowing / outing', 'a (吗 – 吧)')],
                    va=[], dong=[
    ('lan', "WHAT'S the WEATH-er LIKE to-DAY?", '今天天气怎么样？', 'SD/u10/p1', []),
    ('kids', "It's {SUN-ny}! {ICE CREAM}, hoo-RAY!", '{晴天}！吃{冰淇淋}，真棒！', 'SD/u10/p2', [('ice cream', 'U9')]),
    ('lan', "It's {RAIN-y}! RAIN-y! WEAR your {COAT}!", '{下雨}了！穿上{外套}！', 'SD/u10/p5', []),
    ('kids', 'LOOK! The {DUCK} HAS a {BOAT}!', '看！{鸭子}坐{船}，真好！', 'SD/u8/p3', [('duck', 'U8'), ('boat', 'U8')]),
    ('lan', "It's COLD and WIN-dy! WEAR your {HAT}!", '又冷又刮风，戴{帽子}！', 'SD/u10/p8', []),
    ('kids', 'OH, no! My {HAT}! LOOK at THAT!', '哎呀！{帽子}飞走了！', 'SD/u10/p8', []),
    ('lan', '___, ___, IS it {SNOW-ing}?', '___，___，{下雪}了吗？', 'SD/u10/p10', []),
    ('kids', "YES! a {SNOW-man}! LET'S go OUT-ing!", '下了！出去堆{雪人}吧！', 'SD/u10/p11', [])])

VE['SD'][11] = dict(ten=('What Colour Is It?', '什么颜色？'), van=[('scarf / town', 'e (色 – 的)'), ('socks / box', 'e (色 – 色)'), ('hat / that', 'e (色 – 的)'), ('like / nice', 'e (色 – 的)')],
                    va=[], dong=[
    ('lan', 'WHAT col-OUR is your {SCARF}, your {SCARF}?', '你的{围巾}什么颜色？', 'tranh/scarf', [('scarf', 'U10')]),
    ('kids', "IT'S {BROWN}! The COOL-est in {TOWN}!", '是{棕色}的！{城里}最酷的！', 'SD/u11/p3', [('town', 'U4')]),
    ('lan', 'WHAT col-our ARE they? the {SOCKS}, the {SOCKS}!', '{袜子}{袜子}，什么颜色？', 'SD/u11/p8', []),
    ('kids', '{RED} and {GREEN}! in a BOX, a BOX!', '红的绿的，两种颜色！', 'SD/u11/p9', []),
    ('lan', 'WHAT col-OUR is your {HAT}, your {HAT}?', '你的{帽子}什么颜色？', 'tranh/hat', [('hat', 'U10')]),
    ('kids', "It's {GOLD}! A gold HAT! LOOK at THAT!", '是{金色}的！金色的！', 'SD/u11/p5', []),
    ('lan', '___, ___, WHAT col-our do you LIKE?', '___，___，你喜欢什么颜色？', 'SD/u11/p12', []),
    ('kids', "I LIKE {SIL-ver}! It's SHI-ny and NICE!", '我喜欢{银色}，亮亮的！', 'SD/u11/p11', [])])

VE['SD'][12] = dict(ten=('How Many Are There?', '有几个？'), van=[('me / see', 'u (数 – 楚)'), ('hats / cats', 'ao (帽 – 帽)'), ('again / ten', '—'), ('family / me', '—')],
                    va=['ngón chân U4 (vá nhóm cơ thể)'], dong=[
    ('lan', 'HOW many {TOES} are there? COUNT with ME!', '有几个{脚趾}？数一数！', 'tranh/toe', [('toes', 'U4')]),
    ('kids', 'There are {TEN}! {TEN} {TOES}, you SEE!', '有{十}个{脚趾}！数清楚！', 'SD/u4/p8', [('toes', 'U4')]),
    ('lan', 'HOW many {HATS}? HOW many {HATS}?', '有几顶{帽}？几顶{帽}？', 'tranh/hat', [('hat', 'U10')]),
    ('kids', '{FOUR} {HATS} on {FOUR} {CATS}!', '{四}只{猫}戴{四}顶{帽}！', 'tranh/hat', [('hat', 'U10')]),
    ('lan', "HOW many {PEO-ple}? LET'S count a-GAIN!", '有几个{人}？再数一遍！', 'SD/u12/p10', []),
    ('kids', '{NINE} {PEO-ple}… and {PUP-py}, TEN!', '{九}个{人}，加{小狗}，十个！', 'SD/u12/p11', []),
    ('lan', '___, ___, HOW many in your {FAM-i-ly}?', '___，你家有几个人？', 'SD/u3/p12', [('family', 'U3')]),
    ('kids', 'There are {FOUR}, and ONE of THEM is ME!', '有{四}个人，一个是我！', 'SD/u3/p12', [('them', 'U3')])])

# Vè lời đề Seedling: mở buổi lớp (cố định) và dùng ở ngày 96–99 (nghe, nhìn, chỉ, đánh dấu, vẽ, tô màu, câu hỏi, trả lời, trang)
VE['SD']['de'] = dict(ten=('Ready, Steady!', '准备好了吗？'), van=[('ears / here', '—'), ('tick / quick', 'ou (勾 – 油)'), ('well / tell', 'u (楚 – 楚)'), ('ready / steady', 'a (吗 – 吧)')],
                      va=['listen', 'look', 'point', 'tick', 'draw', 'colour', 'question', 'answer', 'page'], dong=[
    ('lan', 'LIS-ten, LIS-ten! OPEN your EARS!', '听一听，听一听！', 'SD/u1/p1', []),
    ('kids', 'LOOK at the PAGE! The PIC-ture is HERE!', '看一看，这一页！', 'SD/u3/p1', []),
    ('lan', 'POINT to the PIC-ture! TICK, tick, TICK!', '指一指，打个勾！', 'SD/u9/p13', []),
    ('kids', 'DRAW and COL-our! QUICK, quick, QUICK!', '画一画，涂一涂，加油！', 'SD/u6/p11', []),
    ('lan', "HERE'S a QUES-tion! LIS-ten WELL!", '听问题，听清楚！', 'SD/u12/p2', []),
    ('kids', 'AN-swer, AN-swer! TELL, tell, TELL!', '回答问题，说清楚！', 'SD/u3/p11', []),
    ('lan', '___, ___, ARE you READ-y?', '___，___，准备好了吗？', 'SD/u1/p11', []),
    ('kids', "YES, I'm READ-y! STEA-dy, STEA-dy!", '好了！好了！开始吧！', 'SD/u1/p11', [])])


# ======================= KIỂM TRA + GHI JSON =======================
def phach(en):   # giống vkTok trên web: từ có ≥2 chữ hoa = phách mạnh
    s = re.sub(r'(\w)-(\w)', r'\1\2', en.replace('{', '').replace('}', '').replace('#', '')).replace('___', ' ')
    return [t for t in s.split() if len([c for c in re.sub(r"[^A-Za-zÀ-ỹ']", '', t) if c.isupper()]) >= 2]

def am_tiet(en):
    s = en.replace('{', '').replace('}', '').replace('#', '').replace('___', '')
    n = 0
    for w in re.findall(r"[A-Za-z']+", s):
        n += max(1, len(re.findall(r'[aeiouy]+', w.lower().replace("'", ''))) - (1 if w.lower().endswith('e') and not w.lower().endswith(('le', 'ee')) and len(w) > 3 else 0))
    return n + en.count('-') * 0

def o(s):
    r = []
    for x in re.findall(r'\{#?([^}]*)\}', s):
        if x not in r: r.append(x)
    return r

def kiem():
    import sys; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))
    try:
        from pinyin_chuan import py
    except Exception:
        py = None
    out, loi = {}, []
    for lv, D in VE.items():
        for u, V in D.items():
            rows = []
            for k, (w, en, zh, img, cu) in enumerate(V['dong']):
                p = phach(en)
                if len(p) != 4 and '___' not in en: loi.append(f'{lv} U{u} dòng {k+1}: {len(p)} phách mạnh – {en}')
                if len(o(en)) and len(o(zh)) and len(o(en)) != len(o(zh)) and not V.get('chi_doi'):
                    loi.append(f'{lv} U{u} dòng {k+1}: ô Anh {o(en)} ≠ ô Trung {o(zh)}')
                han = len(re.findall(r'[一-鿿]', zh))
                if han > 11: loi.append(f'{lv} U{u} dòng {k+1}: {han} chữ Hán (dài)')
                zr = zh.replace('{', '').replace('}', '').replace('#', '')
                rows.append({'w': w, 'raw': re.sub(r'[{}#]', '', en), 'en_o': en, 'zh': zr, 'zh_o': zh, 'py': py(zr.replace('___', '')).strip() if py else '',
                             'img': img, 'o_en': o(en), 'o_zh': o(zh), 'tuoi': '{#' in en, 'cu': cu, 'phach': p})
            out.setdefault(lv, {})[str(u)] = {k: v for k, v in V.items() if k != 'dong'} | {'dong': rows}
    return out, loi

if __name__ == '__main__':
    out, loi = kiem()
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 've48.json'), 'w'), ensure_ascii=False, indent=1)
    for l in loi: print('!!', l)
    for lv in out:
        for u, V in out[lv].items():
            n = sum(len(r['o_en']) for r in V['dong']); c = sum(len(r['cu']) for r in V['dong'])
            print(lv, u, V['ten'][0], '| dòng', len(V['dong']), '| ô', n, '| ô cũ', c)
