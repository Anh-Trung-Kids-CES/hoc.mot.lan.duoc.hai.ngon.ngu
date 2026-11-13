"""Lời vè lớp offline 48 buổi – bản 2 (13/11/2026 chiều, CHỜ CHỊ DUYỆT).

Quy tắc: claude/NguyenTac_Ve_OnVong_1311.md (chị chốt 13/11, 10:00 và 10:05) + claude/QuyTac_BigBook_Ve_Web.md mục D.
Vè tách khỏi big book: mỗi unit 2 bài, A mở buổi (sôi động), B kết buổi (nhịp chậm hơn).
Nhiệm vụ: nhắc lại từ ít quay lại (bảng claude/DemTu_LS_SD48.csv). Little Seed 6 dòng, Seedling 8 dòng.
U1 hai level: 2 vè chào giữ nguyên (LS chỉ đổi dòng tuổi thành ô tuổi). Vè lời đề Seedling giữ.

Mỗi dòng: (người, câu Anh, câu Trung)
  CHỮ HOA = phách mạnh (4 phách/dòng). {…} = từ được nhắc lại / ô thẻ tranh (từ buổi 3 cô che thẻ để con tự nói).
  {#…} = ô tuổi (con nói tuổi mình). ___ = tên con. Câu Trung: {…} cùng từ với câu Anh.
Chạy: python3 ve48_loi.py → kiểm 4 phách, độ dài, pinyin từ điển, bảng phủ từ ít quay lại; ghi ve48.json.
"""
import json, os, re, sys

VE = {'LS': {}, 'SD': {}}
L, S = VE['LS'], VE['SD']

# ============================ LITTLE SEED ============================
L[1] = {'chao': True, 'doi': [  # vè chào U1 giữ nguyên, chỉ đổi dòng tuổi
    ('lop', 'Leo, Leo, HOW old are YOU?', 'Leo，Leo，你几岁？'),
    ('con', "{#FIVE}! I'm {#FIVE}! And YOU? And YOU?", '{#五}岁{#五}岁，我{#五}岁！')]}

L[2] = {
 'A': ('Hello, Everyone!', '大家好！', [
    ('co', 'HEL-lo, {BOYS}! HEL-lo, {GIRLS}!', '{男孩}{女孩}，你们好！'),
    ('lop', 'HEL-lo, {ALL}! SPIN and TWIRL!', '{大家}{大家}，转圈跑！'),
    ('co', 'HEL-lo, {TEACH-er}! HOW are YOU?', '{老师}好！{老师}好！'),
    ('lop', 'HEL-lo, {FRIEND}! PEEK, PEEK-a-BOO!', '{朋友}好！躲猫猫！'),
    ('co', '___, ___, ARE you HERE?', '___，___，你来了吗？'),
    ('con', "YES! I'm HERE! LET'S CHEER!", '来了！来了！哈哈哈！')]),
 'B': ('Goodbye and Good Night', '再见，晚安', [
    ('co', 'Good NIGHT, {MOM-my}! Good NIGHT, {DAD}!', '{妈妈}{爸爸}，晚安啦！'),
    ('lop', "Good NIGHT, {PUP-py}! DON'T be SAD!", '{小狗}晚安，别哭啦！'),
    ('co', 'GOOD-bye, {TEACH-er}! GOOD-bye, {FRIEND}!', '{老师}再见！{朋友}再见！'),
    ('lop', "SEE you to-MOR-row! THAT'S the END!", '下课了，{明天}见！'),
    ('co', '___, ___, Good NIGHT to YOU!', '___，___，晚安呀！'),
    ('con', 'Good NIGHT to {ALL}! I LOVE YOU!', '{大家}晚安！爱你们呀！')])}

L[3] = {
 'A': ('Birthday Count', '生日数一数', [
    ('co', "It's my {BIRTH-day}! CLAP, CLAP, CLAP!", '今天我{生日}，拍拍手！'),
    ('con', "I'm {#SIX}! I'm {#SIX}! NOD like THAT!", '我{#六}岁！点点头！'),
    ('co', '{ONE}, two, {THREE}! CAN-dles for ME!', '{一}{二}{三}，点蜡烛！'),
    ('lop', "{FOUR}, five, {SIX}! LET'S make a WISH!", '{四}{五}{六}，许个愿！'),
    ('co', '___, ___, HOW old are YOU?', '___，___，你几岁？'),
    ('con', "I'm {#SEV-en}! I'm {#SEV-en}! AND YOU?", '我{#七}岁！你几岁？')]),
 'B': ('Come with Me', '跟我来', [
    ('co', 'COME with me, {PUP-py}! COME with ME!', '{小狗}{小狗}，跟我来！'),
    ('lop', 'WALK to {MOM-my}, ONE, two, THREE!', '一二三，到{妈妈}这儿来！'),
    ('co', 'COME with me, {KIT-ten}! PLEASE, PLEASE!', '{小猫}{小猫}，请过来！'),
    ('lop', 'SIT with {DAD-dy}, ON his KNEES!', '坐到{爸爸}腿上来！'),
    ('co', '___, ___, COME with ME!', '___，___，跟我来！'),
    ('con', "OK, I'm COM-ing! WAIT for ME!", '好！等等我！我就来！')])}

L[4] = {
 'A': ('My Family', '我的家人', [
    ('co', 'WHO is HE? WHO is HE?', '他是谁？他是谁？'),
    ('lop', "HE'S my {GRAND-pa}! HE loves ME!", '他是我{爷爷}！对，对，对！'),
    ('co', 'WHO is SHE? WHO is SHE?', '她是谁？她是谁？'),
    ('lop', "She's my {LIT-tle SIS-ter}, SMALL as a BEE!", '她是我的小{妹妹}！'),
    ('co', '___, ___, WHO do you SEE?', '___，___，你看见谁？'),
    ('con', '{BIG BRO-ther}, {BA-by}… and ME!', '{哥哥}、{宝宝}，还有我！')]),
 'B': ('Class Is Done', '下课啦', [
    ('co', '{FIVE}, {FOUR}, {THREE}, two, {ONE}!', '{五}、{四}、{三}、{二}、{一}！'),
    ('lop', 'GOOD-bye, {EV-ery-one}! CLASS is DONE!', '{大家}再见！下课啦！'),
    ('co', '{PUP-py}, {KIT-ten}, WHERE do THEY go?', '{小狗}{小猫}，去哪儿？'),
    ('lop', 'THEY go to {MOM-my}, SLOW, slow, SLOW!', '它们慢慢走，找{妈妈}！'),
    ('co', '___, ___, WHERE do we GO?', '___，___，我们去哪儿？'),
    ('con', 'We go HOME! HEL-lo, {DAD-dy}! HEL-lo!', '回家啦！{爸爸}，你好！')])}

L[5] = {
 'A': ('Family Dance', '一家人跳舞', [
    ('co', '{GRAND-ma} DANC-es! TURN a-ROUND!', '{奶奶}跳舞，转圈圈！'),
    ('lop', '{GRAND-pa} DANC-es! UP and DOWN!', '{爷爷}跳舞，蹲一蹲！'),
    ('co', '{BIG SIS-ter} jumps! JUMP, jump, JUMP!', '{姐姐}跳！跳！跳！'),
    ('lop', '{LIT-tle BRO-ther} falls! BUMP, BUMP!', '{弟弟}摔倒了！扑通！'),
    ('co', '___, ___, DANCE with ME!', '___，___，跟我跳！'),
    ('con', 'My {FAM-i-ly} DANC-es! ONE, two, THREE!', '{家人}一起跳！一二三！')]),
 'B': ('Touch and Hush', '摸一摸，嘘', [
    ('co', 'TOUCH your {EARS}! LIS-ten, LIS-ten!', '摸摸{耳朵}，听一听！'),
    ('lop', 'TOUCH your {NOSE}! SNIFF like a KIT-ten!', '摸摸{鼻子}，闻一闻！'),
    ('co', 'TOUCH your {MOUTH}! SHH, shh, SHH!', '摸摸{嘴巴}，嘘，嘘，嘘！'),
    ('lop', '{HANDS} to-GETH-er… HUSH, HUSH!', '{小手}放好，静悄悄！'),
    ('co', '___, ___, TOUCH your {FEET}!', '___，___，摸摸{脚}！'),
    ('con', 'TAP, tap, TAP! GOOD-bye, my SEAT!', '跺跺{脚}，站起来！')])}

L[6] = {
 'A': ('Shake and Wiggle', '摇一摇', [
    ('co', 'SHAKE your {HANDS}! SHAKE, shake, SHAKE!', '摇摇{手}，摇摇{手}！'),
    ('lop', 'SHAKE your {HEAD}! WIG-gle like a SNAKE!', '摇摇{头}，扭一扭！'),
    ('co', 'BLINK your {EYES}! SEE the SKY!', '眨眨{眼睛}，看看天！'),
    ('lop', 'FLAP your {EARS}! CAN you FLY?', '动动{耳朵}，飞上天！'),
    ('co', "___, ___, LET'S be-GIN!", '___，___，开始啦！'),
    ('con', '{HANDS} and {FEET}, and a BIG, big GRIN!', '{手}{脚}动动，笑哈哈！')]),
 'B': ('How Do You Feel?', '你感觉怎么样？', [
    ('co', 'HOW do you FEEL? HOW do you FEEL?', '你感觉怎么样？怎么样？'),
    ('lop', "I'M {HUN-gry}! TIME for a MEAL!", '我{饿}了，饭好香！'),
    ('co', 'ARE you {AN-gry}? ARE you {SAD}?', '你{生气}吗？你{难过}吗？'),
    ('lop', "NO, NO! I'm HAP-py! I'm GLAD!", '不！不！我很开心！'),
    ('co', '___, ___, are you {SCARED}?', '___，___，你{害怕}吗？'),
    ('con', "NO! I'm {SLEEP-y}! HUG my BEAR!", '不怕！我{困}了，抱小熊！')])}

L[7] = {
 'A': ('Feelings Dance', '心情舞', [
    ('co', '{HAP-py}, {HAP-py}! JUMP up HIGH!', '{开心}{开心}，跳一跳！'),
    ('lop', '{SAD}, {SAD}! WIPE your EYE!', '{难过}{难过}，擦擦眼！'),
    ('co', '{AN-gry}, {AN-gry}! HMPH, like THAT!', '{生气}{生气}，哼！哼！哼！'),
    ('lop', '{SCARED}, {SCARED}! HIDE like a CAT!', '{害怕}{害怕}，躲起来！'),
    ('co', '___, ___, HOW do you FEEL?', '___，___，你感觉怎么样？'),
    ('con', "I'm {HAP-py}! HAP-py! THAT'S for REAL!", '我很{开心}！真的真的！')]),
 'B': ('My Schoolbag', '我的书包', [
    ('co', 'OPEN my {SCHOOL-bag}! WHAT do I SEE?', '打开新{书包}，看一看！'),
    ('lop', 'a {PEN}, a {RUL-er}, a {BOOK} for ME!', '有{笔}有{尺子}，还有{书}！'),
    ('co', 'WHERE is my {PEN-cil case}? WHERE, oh WHERE?', '我的{笔袋}在哪儿？'),
    ('lop', "ON the {DESK}! It's RIGHT THERE!", '在{桌子}上，在那儿！'),
    ('co', '___, ___, PACK your {BAG}!', '___，___，收{书包}！'),
    ('con', '{NOTE-book} in, {ER-as-er} in! ZIP the BAG!', '{本子}{橡皮}，放进去！')])}

L[8] = {
 'A': ('Pick It Up!', '拿起来！', [
    ('co', 'PICK up a {PEN}! HOLD it HIGH!', '拿起{笔}，举高高！'),
    ('lop', 'PICK up a {RUL-er}! TOUCH the SKY!', '拿起{尺子}，长又高！'),
    ('co', 'OPEN your {NOTE-book}! WRITE, write, WRITE!', '打开{本子}，写一写！'),
    ('lop', 'CLOSE your {BOOK}! HOLD it TIGHT!', '合上{书}，拿好了！'),
    ('co', '___, ___, WHERE is your {BAG}?', '___，你的{书包}在哪儿？'),
    ('con', 'ON my BACK! a BIG, big BAG!', '在背上！大{书包}！')]),
 'B': ('Where Is Puppy?', '小狗在哪儿？', [
    ('co', 'WHERE is {PUP-py}? WHERE, oh WHERE?', '{小狗}{小狗}在哪儿？'),
    ('lop', 'UN-der the {TA-ble}? NOT THERE!', '在{桌子}{下}面？不在那儿！'),
    ('co', 'IS he by the {WIN-dow}? IS he in the {BATH}?', '在{窗户}边？在{浴缸}里？'),
    ('lop', "SPLASH! He's in the {BATH}! HA, ha, LAUGH!", '扑通！在{浴缸}里！哈哈哈！'),
    ('co', '___, ___, WHERE are YOU?', '___，___，你在哪儿？'),
    ('con', 'HERE! UN-der the {BED}! PEEK-a-BOO!', '在{床}{下}面！在这儿！')])}

L[9] = {
 'A': ('Animal Moves', '动物动一动', [
    ('co', '{RAB-bit}, {RAB-bit}, JUMP, jump, JUMP!', '{兔子}{兔子}，跳跳跳！'),
    ('lop', '{MOUSE}, {MOUSE}, RUN… and BUMP!', '{老鼠}{老鼠}，快快跑！'),
    ('co', '{FISH}, {FISH}, SWIM, swim, SWIM!', '小{鱼}小{鱼}，游游游！'),
    ('lop', '{BIRD}, {BIRD}, FLAP your WING!', '小{鸟}小{鸟}，飞飞飞！'),
    ('co', '___, ___, can you {SWIM}?', '___，___，你会{游泳}吗？'),
    ('con', "YES, I CAN! LET'S jump IN!", '会！我会！跳下去吧！')]),
 'B': ('Good Night, Animals', '动物晚安', [
    ('co', 'Good NIGHT, {RAB-bit}! GO to {BED}!', '{兔子}晚安，睡觉吧！'),
    ('lop', 'Good NIGHT, {MOUSE}! REST your HEAD!', '{老鼠}晚安，闭眼吧！'),
    ('co', 'Good NIGHT, {BIRD}, UP in the TREE!', '小{鸟}晚安，在树上！'),
    ('lop', 'Good NIGHT, {FISH}, DOWN in the SEA!', '小{鱼}晚安，在水里！'),
    ('co', '___, ___, Good NIGHT to YOU!', '___，___，晚安呀！'),
    ('con', "Good NIGHT, {FROG}! I'm SLEEP-y TOO!", '{青蛙}晚安！我也困啦！')])}

L[10] = {
 'A': ('Animal Picnic', '动物野餐', [
    ('co', '{MOUSE} likes {PIZ-za}! YUM, yum, YUM!', '{老鼠}爱吃{比萨}，真好吃！'),
    ('lop', '{BIRD} likes {RICE}! YUM in my TUM!', '小{鸟}爱吃{米饭}，吃吃吃！'),
    ('co', '{FISH} likes {WA-ter}! DRINK, drink, DRINK!', '小{鱼}爱{喝}{水}，喝喝喝！'),
    ('lop', '{RAB-bit} likes {BA-NA-nas}! WINK, wink, WINK!', '{兔子}爱{吃}{香蕉}，眨眨眼！'),
    ('co', '___, ___, WHAT do you LIKE?', '___，___，你喜欢什么？'),
    ('con', "{PIC-nic} {TIME}! Let's GO by BIKE!", '{野餐}啦！骑车去吧！')]),
 'B': ('Dinner Time', '吃饭啦', [
    ('co', '{GRAND-ma}, {GRAND-ma}, WHAT do you EAT?', '{奶奶}{奶奶}，吃什么？'),
    ('lop', '{RICE} and {EGGS}! a YUM-MY TREAT!', '{米饭}{鸡蛋}，真好吃！'),
    ('co', '{GRAND-pa}, {GRAND-pa}, WHAT do you DRINK?', '{爷爷}{爷爷}，喝什么？'),
    ('lop', '{MILK}, PLEASE! WHITE, not PINK!', '请给我{牛奶}，喝一喝！'),
    ('co', '___, ___, ARE you {HUN-gry}?', '___，___，你{饿}吗？'),
    ('con', "YES! I'm {HUN-gry}! RICE for my TUM-my!", '{饿}了！{米饭}，吃饭吧！')])}

L[11] = {
 'A': ('Weather Dance', '天气舞', [
    ('co', "It's {HOT}! It's {HOT}! FAN, fan, FAN!", '好{热}！好{热}！擦擦汗！'),
    ('lop', "It's {COLD}! It's {COLD}! RUB your HANDS!", '好{冷}！好{冷}！搓搓手！'),
    ('co', "It's {WIND-y}, {WIND-y}! SWAY like a TREE!", '{刮风}了，摇一摇！'),
    ('lop', "It's {RAIN-y}! SPLASH, SPLASH with ME!", '{下雨}了，跳一跳！'),
    ('co', "___, ___, WHAT'S the {WEATH-er}?", '___，___，{天气}怎么样？'),
    ('con', "It's {SNOW-y}! LET'S PLAY to-GETH-er!", '{下雪}了！一起{玩}吧！')]),
 'B': ('Shh, Baby Sleeps', '嘘，宝宝睡了', [
    ('co', 'SHH! The {BA-by} IS in {BED}!', '嘘！{宝宝}在{床}上！'),
    ('lop', 'SOFT-ly, SOFT-ly, PAT her HEAD!', '轻轻地，摸摸头！'),
    ('co', 'SHH! The {RAIN} is FALL-ing DOWN!', '嘘！{下雨}了，滴答滴答！'),
    ('lop', "SLEEP, {LIT-tle SIS-ter}, don't make a SOUND!", '{妹妹}睡吧，别说话！'),
    ('co', '___, ___, ARE you {SLEEP-y}?', '___，___，你{困}了吗？'),
    ('con', "YES, I'm {SLEEP-y}! NIGHT-night, {BA-by}!", '我{困}了！{宝宝}晚安啦！')])}

L[12] = {
 'A': ('Rainbow!', '彩虹！', [
    ('co', 'The {RAIN} is GONE! The SUN is OUT!', '{雨}停了！太阳出来了！'),
    ('lop', 'LOOK! A {RAIN-bow}! JUMP and SHOUT!', '看！{彩虹}！跳起来！'),
    ('co', '{RED}, {YEL-low}, {GREEN} and {BLUE}!', '{红色}{黄色}{绿色}{蓝色}，真好看！'),
    ('lop', '{OR-ange}, {PUR-ple}, I SEE YOU!', '{橙色}、{紫色}，看见你！'),
    ('co', '___, ___, WHAT col-our do you LIKE?', '___，___，你喜欢什么颜色？'),
    ('con', 'I LIKE {BLACK} and {GREY}… like my BIKE!', '我喜欢{黑色}{灰色}的车！')]),
 'B': ('Count Our Friends', '数朋友', [
    ('co', 'HOW many {BOYS}? COUNT with ME!', '几个{男孩}？数一数！'),
    ('lop', 'ONE, two, three! {THREE} {BOYS} I SEE!', '一二三，{三}个{男孩}！'),
    ('co', 'HOW many {GIRLS}? COUNT a-GAIN!', '几个{女孩}？再数一遍！'),
    ('lop', 'There are {TEN} {GIRLS}! TEN, ten, TEN!', '{十}个{女孩}！十个！十个！'),
    ('co', '___, ___, HOW many {FRIENDS}?', '___，___，几个{朋友}？'),
    ('con', '{ALL} my {FRIENDS}! HAND in HAND!', '{大家}都是{朋友}，手拉手！')])}

# ============================ SEEDLING ============================
# U1 + U4 (tuần 1–3): 2 vè chào giữ nguyên. Thứ tự học sau đó: U2 → U3 → U5 … U12.
S[1] = {'chao': True}

S[2] = {
 'A': ('Fingers and Toes', '手指和脚趾', [
    ('lan', 'WIG-gle your {FIN-gers}! COUNT them, PLEASE!', '动动{手指}，数一数！'),
    ('kids', '{TEN} {FIN-gers}! WIG-gle, SQUEEZE!', '{十}个{手指}，捏一捏！'),
    ('lan', 'STRETCH your {ARMS}! UP, up, HIGH!', '伸伸{胳膊}，高高举！'),
    ('kids', 'TWO long {ARMS}! TOUCH the SKY!', '两只{胳膊}，摸到天！'),
    ('lan', 'WIG-gle your {TOES}! WIG-gle your {TOES}!', '动动{脚趾}，动一动！'),
    ('kids', '{TEN} little {TOES}, and ONE big {NOSE}!', '十个{脚趾}，一个{鼻子}！'),
    ('lan', '___, ___, HOW old are YOU?', '___，___，你几岁？'),
    ('kids', "I'm {#NINE}! nine {FIN-gers}! WHAT a-bout YOU?", '我{#九}岁！{#九}个{手指}！你呢？')]),
 'B': ('Goodbye, Class!', '同学们，再见！', [
    ('lan', 'WAVE good-BYE! WAVE to the {CLASS}!', '挥挥手，再见啦！'),
    ('kids', 'SEE you to-MOR-row! TIME goes FAST!', '{明天见}！快快来吧！'),
    ('lan', "OOPS! I'm {SOR-ry}! I DROPPED my PEN!", '哎呀！{对不起}！笔掉了！'),
    ('kids', 'NO prob-LEM! pick it UP a-GAIN!', '没关系！捡起来！'),
    ('lan', '{KIDS}, {KIDS}, {WRITE} your {NAME}!', '{小朋友}，{写名字}！'),
    ('kids', 'I {WRITE} it! YOU WRITE the SAME!', '我写写，你也写！'),
    ('lan', '___, ___, SEE you to-MOR-row!', '___，___，{明天见}！'),
    ('kids', 'GOOD-bye, Mrs LAN! SEE you to-MOR-row!', '{老师再见}！明天见！')])}

S[3] = {
 'A': ('Shake Your Body', '动动身体', [
    ('lan', 'SHAKE your {BOD-y}! SHAKE, shake, SHAKE!', '动动{身体}，扭一扭！'),
    ('kids', 'SHAKE your {SHOUL-ders}! WIG-gle like a SNAKE!', '摇摇{肩膀}，扭扭扭！'),
    ('lan', 'BEND your {KNEES}! DOWN, down, DOWN!', '弯弯{膝盖}，蹲下去！'),
    ('kids', '{LONG} {LEGS}, jump UP from the GROUND!', '长长的{腿}，跳起来！'),
    ('lan', 'TOUCH your {HAIR}! IS it {LONG}?', '摸摸{头发}，长不长？'),
    ('kids', 'YES, my {HAIR} is {LONG} and STRONG!', '我的{头发}长又长！'),
    ('lan', '___, ___, TOUCH your {TOES}!', '___，___，摸{脚趾}！'),
    ('kids', 'I TOUCH my {TOES}… and UP I GO!', '摸到{脚趾}，站起来！')]),
 'B': ('Which Is Bigger?', '哪个大？', [
    ('lan', 'WHICH is BIG-ger? {NINE} or {TEN}?', '{九}和{十}，哪个大？'),
    ('kids', '{TEN} is BIG-ger! COUNT a-GAIN!', '{十}比{九}大！再数吧！'),
    ('lan', 'WHICH is SMALL-er? {SEV-en} or {NINE}?', '{七}和{九}，哪个小？'),
    ('kids', '{SEV-en} is SMALL-er! STAND in LINE!', '{七}比{九}小！排排好！'),
    ('lan', 'I AM {#NINE}! WHAT a-bout YOU?', '我{#九}岁！你呢？'),
    ('kids', "I'm {NINE}! REAL-ly? ME TOO!", '{九}岁！真的？{我也是}！'),
    ('lan', '___, ___, HOW old are YOU?', '___，___，你几岁？'),
    ('kids', "I'm {#TEN}! I'm {#TEN}! BIG-ger than TWO!", '我{#十}岁！十比二大！')])}

S[5] = {
 'A': ('My Big Brother', '我的哥哥', [
    ('lan', 'My {OLD-er BRO-ther} is {BIG-GER} than ME!', '我{哥哥}比我大！'),
    ('kids', 'My {YOUNG-er SIS-ter} is {SMALL-ER}, SEE?', '我{妹妹}比我小！'),
    ('lan', 'MY {UN-cle} is {CHI-NESE}! Ni HAO!', '我{叔叔}是{中国人}，你好！'),
    ('kids', 'My {AUNT} is {CHI-NESE}, TOO! WOW!', '我{阿姨}也是！哇！'),
    ('lan', 'LOOK at the {GIRL}! WHO is SHE?', '看那个{女孩}，她是谁？'),
    ('kids', "She's my {OLD-er SIS-ter}! SHE loves ME!", '她是我{姐姐}！她爱我！'),
    ('lan', '___, ___, WHO is {OLD-er}?', '___，___，谁大？'),
    ('kids', "I'm {YOUNG-er}, I SIT ON his {SHOUL-der}!", '我小！我坐在他{肩膀}上！')]),
 'B': ('We Learn Chinese', '我们学中文', [
    ('lan', 'We {LEARN} {ENG-LISH}! We {LEARN} {CHI-NESE}!', '我们{学}英语！我们{学}中文！'),
    ('kids', 'WE can SAY it! LIS-ten, PLEASE!', '我们会说！请你听！'),
    ('lan', 'BÔNG is {VI-et-NAM-ESE}! XIAO-MEI is {CHI-NESE}!', 'Bông是{越南人}，小美是{中国人}！'),
    ('kids', 'WE are FRIENDS! SAY CHEESE!', '我们是朋友！拍{照片}！'),
    ('lan', 'LOOK, LOOK at my {FAM-i-ly} {PHO-to}!', '看看我的{家庭}{照片}！'),
    ('kids', 'I {LOVE} {THEM}! I LOVE them SO!', '我{爱}{他们}！很爱他们！'),
    ('lan', '___, ___, WHAT do you {LEARN}?', '___，___，你{学}什么？'),
    ('kids', "I {LEARN} {CHI-NESE}! now it's YOUR TURN!", '我{学}中文！该你了！')])}

S[6] = {
 'A': ('Close Your Eyes!', '闭上眼睛！', [
    ('lan', '{CLOSE} your {EYES}… and COUNT to THREE!', '{闭上}眼睛，数到三！'),
    ('kids', 'OPEN your EYES! WHAT do you SEE?', '睁开眼睛，看见什么？'),
    ('lan', 'RAISE your {RIGHT} {HAND}! up, up, HIGH!', '举起{右}手，高高的！'),
    ('kids', 'WAVE your {RIGHT} {HAND} and say HI!', '挥挥{右}手，说你好！'),
    ('lan', "WHAT'S your {FA-vour-ite} {TOY}? tell me, PLEASE!", '你{最喜欢}什么{玩具}？'),
    ('kids', 'My {TOY} BEAR! I SQUEEZE and SQUEEZE!', '我的{玩具}熊！抱一抱！'),
    ('lan', '___, ___, HOW do you {FEEL}?', '___，___，你{感觉}怎么样？'),
    ('kids', 'I FEEL {ex-CIT-ed}, from HEAD to HEEL!', '我很{兴奋}！从头到脚！')]),
 'B': ('Bedtime', '睡觉啦', [
    ('lan', '{THIRS-ty}? DRINK your {WA-ter}, PLEASE.', '{渴}了吗？喝点{水}！'),
    ('kids', '{HUN-gry}? HAVE some BREAD and CHEESE!', '{饿}了吗？吃面包！'),
    ('lan', "NOW it's NIGHT! {GO to BED}!", '天黑了！{睡觉}吧！'),
    ('kids', 'READ me a {STO-ry}! REST my HEAD!', '{讲故事}！讲一个吧！'),
    ('lan', '{CLOSE} your {EYES}… sleep, SLEEP TIGHT.', '{闭上}眼睛，快睡觉！'),
    ('kids', 'Good NIGHT, {MUM-my}! TURN off the LIGHT!', '{妈妈}晚安！关灯吧！'),
    ('lan', '___, ___, ARE you {SLEEP-y}?', '___，___，你{困}了吗？'),
    ('kids', "YES, I'm {SLEEP-y}! BYE-bye, BUD-dy!", '{困}了！晚安，大家！')])}

S[7] = {
 'A': ('Make a Line!', '排好队！', [
    ('lan', '{MAKE a LINE}! STAND up TALL!', '{排好队}，站直站好！'),
    ('kids', "WALK, walk, WALK! and DON'T FALL!", '走走走，别摔倒！'),
    ('lan', 'LOOK at the {BOARD}! WHAT are {THOSE}?', '看{黑板}！{那些}是什么？'),
    ('kids', '{THOSE} are {LET-ters}, in TWO ROWS!', '{那些}是{字母}，两排呢！'),
    ('lan', '{OPEN} your {BOOK}! {READ} with ME!', '{打开}书，跟我{读}！'),
    ('kids', '{READ} the {LET-ters}! A, B, C!', '{读}{字母}，A、B、C！'),
    ('lan', '___, ___, {WRITE} your {NAME}!', '___，___，{写}名字！'),
    ('kids', "BIG {LET-ters}! THAT'S my NAME!", '大大的{字母}！我的名字！')]),
 'B': ('Tidy Up!', '收拾好！', [
    ('lan', 'PUT a-WAY your {PEN-cil}, PLEASE!', '请收好你的{铅笔}！'),
    ('kids', '{CRAY-ons}, {SCIS-sors}, AND all {THESE}!', '{蜡笔}、{剪刀}，还有{这些}！'),
    ('lan', 'PUT the {GLUE} BACK on the SHELF!', '把{胶水}放回去！'),
    ('kids', 'TI-dy, TI-dy, ALL by my-SELF!', '收拾好，我自己来！'),
    ('lan', 'BYE-bye, {KEY-board}! BYE-bye, {MOUSE}!', '{键盘}再见！{鼠标}再见！'),
    ('kids', "{SCHOOL} is DONE! LET'S go to my HOUSE!", '下课了！去我家玩吧！'),
    ('lan', "___, ___, WHAT'S in your {BAG}?", '___，___，{包}里有什么？'),
    ('kids', 'a {PEN-cil}, a {RU-ler}, and a NAME TAG!', '{铅笔}、尺子、名字卡！')])}

S[8] = {
 'A': ('Wings, Legs and Tails', '翅膀、腿和尾巴', [
    ('lan', 'a {DUCK} has two {WINGS}! FLAP, flap, FLAP!', '{鸭子}有两只{翅膀}！拍拍拍！'),
    ('kids', 'I have TWO {ARMS}! CLAP, clap, CLAP!', '我有两只{胳膊}！拍拍拍！'),
    ('lan', 'a {FROG} has long {LEGS}! HOP, hop, HOP!', '{青蛙}有长{腿}！跳跳跳！'),
    ('kids', "I have LONG {LEGS}! I CAN'T STOP!", '我有长{腿}！停不下！'),
    ('lan', 'a {MOUSE} has a {TAIL}! WIG-gle, WIG-gle!', '{老鼠}有{尾巴}！摇一摇！'),
    ('kids', 'I have NO {TAIL}! GIG-gle, GIG-gle!', '我没有{尾巴}！哈哈笑！'),
    ('lan', '___, ___, CAN you {FLY}?', '___，___，你会{飞}吗？'),
    ('kids', "NO, I CAN'T! no {WINGS}! but I TRY!", '不会！没有{翅膀}！试试吧！')]),
 'B': ('Lights On, Lights Off', '开灯，关灯', [
    ('lan', 'TURN ON the {LAMP} in the {LIV-ing room}!', '打开{客厅}的{灯}！'),
    ('kids', 'CLOSE the {WIN-dow} IN the {BED-room}!', '关上{卧室}的{窗户}！'),
    ('lan', '{BED} or {CHAIR}? WHERE, oh WHERE?', '在{床}下还是{椅子}下？'),
    ('kids', 'UN-der the {TA-ble}! RIGHT THERE!', '在{桌子}下面！就在那儿！'),
    ('lan', "KNOCK, KNOCK! WHO'S at the {DOOR}?", '咚咚咚！谁在{门}外？'),
    ('kids', "IT'S {GRAND-pa}! SIT on the FLOOR!", '是{爷爷}！快进来！'),
    ('lan', '___, ___, WHERE do you SLEEP?', '___，___，你在哪儿睡觉？'),
    ('kids', 'IN my {BED-room}! COUNT the SHEEP!', '在我的{卧室}！数小羊！')])}

S[9] = {
 'A': ('Stand Up Tall!', '站得高高！', [
    ('lan', 'the {PO-lar BEAR} is BIG and {TALL}!', '{北极熊}又大又{高}！'),
    ('kids', "STAND up {TALL}! don't FALL, don't FALL!", '站得{高}高！别倒！'),
    ('lan', 'ROW the {BOAT}! ROW, row, ROW!', '划{船}！快划船！'),
    ('kids', 'IN the {FOR-est}, SLOW, slow, SLOW!', '{森林}里面，慢慢划船！'),
    ('lan', 'the {FROG} says HOP! the {DUCK} says QUACK!', '{青蛙}跳跳，{鸭子}嘎嘎！'),
    ('kids', 'HOP to the {FOR-est}, and HOP BACK!', '跳进{森林}，再跳回家！'),
    ('lan', '___, ___, ARE you {TALL}?', '___，___，你{高}吗？'),
    ('kids', "YES, I'm {TALL}! TALL-er than a BALL!", '我很{高}！比球还高！')]),
 'B': ('Can or Can\'t?', '会不会？', [
    ('lan', "can a {FISH} WALK? NO, it CAN'T!", '{鱼}会走路吗？不会！'),
    ('kids', 'can a {DUCK} SWIM? YES, it CAN!', '{鸭子}会游泳吗？会！'),
    ('lan', 'can a {PO-lar BEAR} FLY? no, NO!', '{北极熊}会飞吗？不会！'),
    ('kids', 'It CAN SWIM and WALK in the SNOW!', '它会游泳，会在雪里走！'),
    ('lan', 'CAN you {HOP}, {HOP} like a {FROG}?', '你会像{青蛙}一样{跳}吗？'),
    ('kids', 'YES, I CAN! HOP on a LOG!', '会！跳到木头上！'),
    ('lan', '___, ___, CAN you {SWIM}?', '___，___，你会{游泳}吗？'),
    ('kids', "YES, I CAN! LET'S jump IN!", '会！我会！跳下去吧！')])}

S[10] = {
 'A': ('Snack Time!', '吃点心啦！', [
    ('lan', 'LOOK at the {BUR-ger}! it {LOOKS NICE}!', '看这个{汉堡}，{看起来}{好吃}！'),
    ('kids', 'YUM! I WANT it! ONE, no, TWICE!', '嗯！我想要！要两个！'),
    ('lan', '{ICE CREAM}, ice cream! COLD and SWEET!', '{冰淇淋}，冰淇淋！又冷又甜！'),
    ('kids', "{CHIPS} and {JUICE}! LET'S EAT!", '{薯条}{果汁}，开吃啦！'),
    ('lan', "TELL me: WHAT'S your {FA-VOUR-ite} {FOOD}?", '你最喜欢什么{食物}？'),
    ('kids', "{BUR-gers}! {BUR-gers}! I'm in a GOOD MOOD!", '{汉堡}！汉堡！我很开心！'),
    ('lan', '___, ___, ARE you {HUN-gry}?', '___，___，你{饿}吗？'),
    ('kids', "YES! I'm {HUN-gry}! FOOD for my TUM-my!", '{饿}了！我要吃饭啦！')]),
 'B': ('Noodles, Please', '我要面条', [
    ('lan', '{NOO-dles}, {NOO-dles}, LONG and THIN!', '{面条}{面条}，长又细！'),
    ('kids', 'SLURP, SLURP… {NOO-dles} on my CHIN!', '吸溜吸溜，吃下去！'),
    ('lan', '{CAN-dy}? candy? NO, THANK YOU!', '{糖果}？糖果？不要，谢谢！'),
    ('kids', '{FRUIT} is GOOD! a {BA-NA-na}, TOO!', '{水果}好！香蕉也好！'),
    ('lan', '{CROSS} the {CAN-dy}! TICK the {BREAD}!', '{糖果}画叉，{面包}打勾！'),
    ('kids', 'good JOB, good JOB! the TEACH-er SAID!', '老师说：做得好！'),
    ('lan', '___, ___, WHAT do you {WANT}?', '___，___，你{要}什么？'),
    ('kids', 'I WANT {JUICE}, please! THANK you, {AUNT}!', '我{要}{果汁}！谢谢{阿姨}！')])}

S[11] = {
 'A': ('Get Dressed!', '穿好衣服！', [
    ('lan', 'PUT on your {COAT}! {ARMS} in, IN!', '穿上{外套}！{胳膊}伸进去！'),
    ('kids', 'PUT on your {SCARF}! a BIG, big GRIN!', '戴上{围巾}！笑嘻嘻！'),
    ('lan', 'PUT on your {HAT}! ON your {HEAD}!', '戴上{帽子}！戴{头}上！'),
    ('kids', 'a {HAT} on my {HEAD}… BLUE and RED!', '{帽子}戴头上，红又蓝！'),
    ('lan', 'OPEN your {UM-BREL-la}! up, UP, UP!', '打开{雨伞}，举高高！'),
    ('kids', '{DROP}, drop, {DROP}! RAIN in my CUP!', '滴答滴答，雨{掉}下来！'),
    ('lan', "___, ___, LET'S {GO OUT}!", '___，___，我们{出去}吧！'),
    ('kids', '{COAT}, {SCARF}, {HAT}… now we SHOUT!', '{外套}{围巾}{帽子}，出发吧！')]),
 'B': ('Rainy Day', '下雨天', [
    ('lan', 'IS it {CLOUD-y}? IS it WET?', '今天{多云}？下雨吗？'),
    ('kids', "{STAY at HOME}! don't go OUT YET!", '{在家}玩！先别{出去}！'),
    ('lan', 'LOOK! The SUN! The CLOUDS go a-WAY!', '看！太阳！云走了！'),
    ('kids', "TAKE your {UM-BREL-la}! LET'S go and PLAY!", '带上{雨伞}，出去玩！'),
    ('lan', "WHAT'S the WEATH-er LIKE to-DAY?", '今天天气怎么样？'),
    ('kids', "It's {COLD}! {COAT} and {SCARF}, OK?", '很{冷}！穿{外套}，戴{围巾}！'),
    ('lan', '___, ___, GOOD-BYE, GOOD-BYE!', '___，___，再见啦！'),
    ('kids', 'TAKE your {UM-BREL-la}! KEEP DRY!', '带上{雨伞}，别淋湿啦！')])}

S[12] = {
 'A': ("Let's Go Out!", '我们出去吧！', [
    ('lan', "it's {SNOW-ing}! LET'S {GO OUT}!", '{下雪}了！我们{出去}！'),
    ('kids', 'MAKE a {SNOW-man}! JUMP and SHOUT!', '堆{雪人}！跳起来！'),
    ('lan', 'GIVE him a {HAT} and a {SCARF}, TOO!', '给他戴{帽子}，戴{围巾}！'),
    ('kids', 'a CAR-rot NOSE, and EYES of {BLUE}!', '胡萝卜鼻子，{蓝}眼睛！'),
    ('lan', "it's {COLD}! it's {COLD}! BRR, brr, BRR!", '好{冷}！好{冷}！发抖了！'),
    ('kids', 'PUT on your {COAT}! a COAT with FUR!', '穿上{外套}！毛毛的！'),
    ('lan', '___, ___, ARE you {COLD}?', '___，___，你{冷}吗？'),
    ('kids', "NO! I'm WARM in my {SCARF} of {GOLD}!", '不冷！我有{金色}的{围巾}！')]),
 'B': ('Clothes Parade', '服装秀', [
    ('lan', '{JEANS} and {TROU-sers}! WHO wears {THOSE}?', '{牛仔裤}、{裤子}，谁穿的？'),
    ('kids', 'LEO does! and RED {SOCKS} on his TOES!', 'Leo穿！还有红{袜子}！'),
    ('lan', 'a {GOLD} {DRESS}! a {SIL-ver} {SKIRT}!', '{金色}{裙子}！{银色}短裙！'),
    ('kids', 'a {BROWN} JACK-et and a WHITE SHIRT!', '{棕色}夹克，白衬衫！'),
    ('lan', '{BOUNCE the BALL}! one, TWO, THREE!', '{拍球}！一、二、三！'),
    ('kids', 'In my {SHORTS}! So {COOL}! LOOK at ME!', '穿{短裤}，真{酷}！看我！'),
    ('lan', '___, ___, WHAT are you WEAR-ing?', '___，___，你穿什么？'),
    ('kids', "I'm WEAR-ing my {JEANS}! and YOU'RE STAR-ing!", '我穿{牛仔裤}！你在看我！')])}

# Vè lời đề Seedling (cố định, mở buổi luyện dạng đề và ngày 96–99): listen, look, page, point, tick, draw, colour, question, answer
S['de'] = {'A': ('Ready, Steady!', '准备好了吗？', [
    ('lan', 'LIS-ten, LIS-ten! OPEN your EARS!', '听一听，听一听！'),
    ('kids', 'LOOK at the PAGE! The PIC-ture is HERE!', '看一看，这一页！'),
    ('lan', 'POINT to the PIC-ture! TICK, tick, TICK!', '指一指，打个勾！'),
    ('kids', 'DRAW and COL-our! QUICK, quick, QUICK!', '画一画，涂一涂，加油！'),
    ('lan', "HERE'S a QUES-tion! LIS-ten WELL!", '听问题，听清楚！'),
    ('kids', 'AN-swer, AN-swer! TELL, tell, TELL!', '回答问题，说清楚！'),
    ('lan', '___, ___, ARE you READ-y?', '___，___，准备好了吗？'),
    ('kids', "YES, I'm READ-y! STEA-dy, STEA-dy!", '好了！好了！开始吧！')])}

# ===================== TỪ ÍT QUAY LẠI (ngay_quay_lai_sau_unit = 0) + từ vá =====================
IT = {
 'LS': {'en': {1: 'teacher, all, good night, girl, boy', 3: 'grandpa, grandma, little sister, big sister, little brother, family',
               4: 'mouth, nose, ears, hands, feet', 5: 'hungry, scared, angry, feel', 6: 'pen, desk, schoolbag, ruler, pencil case, notebook',
               7: 'window, bath', 8: 'horse, fish, swim, rabbit, mouse', 9: 'picnic, time, banana, pizza, rice, water',
               10: 'hot, windy, rainy, rain, weather, snowy, cold', 11: 'yellow, rainbow, blue, green, orange, purple, black, grey'},
        'zh': {1: '老师, 晚安', 3: '奶奶, 妹妹, 姐姐, 宝宝', 4: '嘴巴, 耳朵, 手, 脚', 5: '困, 害怕, 生气', 6: '笔, 书包, 新, 尺子, 本子, 笔袋',
               7: '下', 8: '鸟, 游泳, 兔子, 老鼠', 9: '野餐, 吃, 香蕉, 比萨, 喝', 10: '热, 玩, 刮风, 下雨, 天气, 下雪, 冷',
               11: '黄色, 彩虹, 蓝色, 绿色, 橙色, 紫色, 黑色'},
        'va': 'he, she, 他, 她, me, we, they, with, to, please, 哪儿, bath, horse, boy, girl'},
 'SD': {'en': {4: 'arm, toe, shoulder, knee, finger, hair, leg, body', 2: 'bigger than, smaller',
               3: 'girl, older, younger, chinese, vietnamese, learn', 5: 'close, right, story, go to bed', 6: 'those, letter',
               8: 'tall, forest', 9: 'ice cream, burger, looks nice', 10: 'coat, scarf, cloudy, umbrella, drop, go out, stay at home',
               11: 'bounce the ball, trousers, jeans'},
        'zh': {4: '身体, 胳膊, 腿, 手指, 脚趾, 肩膀', 3: '女孩, 中国人, 越南人', 5: '闭, 右', 6: '那些', 8: '船',
               9: '食物, 冰淇淋, 好吃, 汉堡, 薯条, 看起来', 10: '帽子, 围巾, 多云, 雨伞, 掉, 出去', 11: '酷, 拍球, 裤子'},
        'va': ''}}
THU_TU = {'LS': list(range(1, 13)), 'SD': [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]}

def phach(en):
    s = re.sub(r'(?<=\w)-(?=\w)', '', re.sub(r'[{}#]', '', en)).replace('___', ' ')
    return [t for t in s.split() if sum(c.isupper() for c in re.sub(r"[^A-Za-zÀ-ỹ']", '', t)) >= 2]

def sach_en(s): return re.sub(r'(?<=\w)-(?=\w)', '', re.sub(r'[{}#]', '', s)).lower()

def kiem():
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
    try:
        from pinyin_chuan import py
    except Exception:
        py = lambda s: ''
    out, loi = {}, []
    for lv, D in VE.items():
        for u, V in D.items():
            o = {}
            for k in ('A', 'B'):
                if k not in V: continue
                ten_en, ten_zh, dong = V[k]
                rows = []
                for i, (w, en, zh) in enumerate(dong):
                    p = phach(en)
                    if len(p) != 4 and '___' not in en: loi.append(f'{lv} U{u}{k} dòng {i+1}: {len(p)} phách – {en}')
                    han = len(re.findall(r'[一-鿿]', zh))
                    if han > 11: loi.append(f'{lv} U{u}{k} dòng {i+1}: {han} chữ Hán')
                    zr = re.sub(r'[{}#]', '', zh)
                    pyy = py(zr.replace('___', '')).strip()
                    if '___' in zh: pyy = ', '.join(['___'] * zh.count('___')) + ', ' + re.sub(r'^[,\s]+', '', pyy)
                    rows.append({'w': w, 'raw': re.sub(r'[{}#]', '', en), 'en_o': en, 'zh': zr, 'zh_o': zh, 'py': pyy,
                                 'o_en': re.findall(r'\{#?([^}]*)\}', en), 'o_zh': re.findall(r'\{#?([^}]*)\}', zh), 'tuoi': '{#' in en})
                o[k] = {'ten': [ten_en, ten_zh], 'dong': rows}
            for x in ('chao', 'giu'):
                if V.get(x): o[x] = True
            if 'doi' in V: o['doi'] = [{'w': w, 'en_o': en, 'zh_o': zh} for w, en, zh in V['doi']]
            out.setdefault(lv, {})[str(u)] = o
    return out, loi

def phu(out):
    """Bảng phủ: mỗi từ ít quay lại có trong vè nào dùng SAU unit của nó."""
    res = {}
    for lv in IT:
        thu = THU_TU[lv]
        def ve_sau(u):
            r = []
            for v in thu[thu.index(u) + 1:]:
                for k in ('A', 'B'):
                    if k in out[lv].get(str(v), {}): r.append((v, k, out[lv][str(v)][k]['dong']))
            return r
        for tieng in ('en', 'zh'):
            for u, ws in IT[lv][tieng].items():
                for w in [x.strip() for x in ws.split(',') if x.strip()]:
                    gap = []
                    for v, k, dong in ve_sau(u):
                        txt = ' '.join(sach_en(d['raw']) if tieng == 'en' else d['zh'] for d in dong)
                        if (re.search(r'\b' + re.escape(w) + r'(e?s)?\b', txt) if tieng == 'en' else w in txt):
                            gap.append(f'U{v}{k}')
                    res.setdefault(lv, []).append((tieng, u, w, gap))
        for w in [x.strip() for x in IT[lv]['va'].split(',') if x.strip()]:
            gap = []
            for v in thu:
                for k in ('A', 'B'):
                    if k in out[lv].get(str(v), {}):
                        dong = out[lv][str(v)][k]['dong']
                        txt = ' '.join(sach_en(d['raw']) + ' ' + d['zh'] for d in dong)
                        if (w in txt) if re.search(r'[一-鿿]', w) else re.search(r'\b' + re.escape(w) + r'(e?s)?\b', txt): gap.append(f'U{v}{k}')
            res[lv].append(('vá', '-', w, gap))
    return res

if __name__ == '__main__':
    out, loi = kiem()
    p = phu(out)
    out['_phu'] = {lv: [{'tieng': a, 'unit': b, 'tu': c, 've': d} for a, b, c, d in v] for lv, v in p.items()}
    json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 've48.json'), 'w'), ensure_ascii=False, indent=1)
    for l in loi: print('!!', l)
    for lv, v in p.items():
        thieu = [f'{c}({a} U{b})' for a, b, c, d in v if not d]
        print(lv, 'phủ', sum(1 for x in v if x[3]), '/', len(v), '| thiếu:', ', '.join(thieu))
