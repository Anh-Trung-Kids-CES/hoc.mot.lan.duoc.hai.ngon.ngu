"""Mạng văn bản Little Seed 48 buổi, Unit 2–12 (nguyên tắc 61–67, chỉ tiêu 4 mặt ng.t. 62). Viết 10–11/11/2026.
U2, U3, U9, U12: bản đã gửi chị 10/11 (ThuNghiem_LS_U2U3, TruyenUnit_U9/U12_BanMoi); U4–U8, U10, U11: viết 11/11.
Mỗi unit: truyện 5 phần (who, en, zh), big book (ảnh, en, zh), vè 4 dòng (ai, en, zh, vần), thẻ từ theo phần (en, zh, ảnh, nền?).
Ảnh: tên tranh trong seedling/tai-nguyen/tranh (không có thì web dùng thẻ chữ). who: mã nhân vật (xem ghep_unit.py).
"""
import json, os

U = {}

U[2] = dict(ten_en="Bông's Birthday", ten_zh='Bông的生日', bg='ls_home', phan=[
    ('Hello, Cake!', '蛋糕，你好！', [('bong', 'Hello, cake!', '蛋糕，你好！'), ('me', "Let's count! One, two, three!", '我们数一数！一、二、三！'),
                                  ('bong', 'One, two, three! Yay!', '一、二、三！耶！'), ('bong', 'Mommy, Daddy, Bông! Three!', '妈妈、爸爸、Bông！三！')]),
    ('Six!', '六！', [('me', 'One, two, three, four, five!', '一、二、三、四、五！'), ('bong', 'No, Mommy! Six!', '不，妈妈！六！'),
                    ('bong', "Four, five, six! I'm six!", '四、五、六！我六岁！'), ('bo', 'Six! Yay!', '六岁！耶！')]),
    ('Happy Birthday!', '生日快乐！', [('leo', 'Happy birthday!', '生日快乐！'), ('bong', "Hello! What's your name?", '你好！你叫什么名字？'),
                                    ('leo', 'My name is Puppy! Woof!', '我叫小狗！汪汪！'), ('anna', 'My name is Kitten! Meow!', '我叫小猫！喵喵！')]),
    ('My Name Is Leo!', '我叫Leo！', [('bong', "No! What's your name?", '不！你叫什么名字？'), ('leo', 'Leo! My name is Leo!', 'Leo！我叫Leo！'),
                                    ('bong', "What's your name?", '你叫什么名字？'), ('anna', 'My name is Anna!', '我叫Anna！')]),
    ('How Old Are You?', '你几岁？', [('anna', 'How old are you, Bông?', 'Bông，你几岁？'), ('bong', "I'm six!", '我六岁！'), ('leo', "I'm five!", '我五岁！'),
                                    ('lop', 'Happy birthday, Bông!', 'Bông，生日快乐！'), ('bong', 'How old are you, ___?', '___，你几岁？')])],
    bb=('My Name Is…', '我叫…', [('kids_bong', 'Hello! My name is Bông.', '你好！我叫Bông。'), ('kids_leo', "My name is Leo. I'm five.", '我叫Leo。我五岁。'),
                                ('kids_anna', "My name is Anna. I'm four.", '我叫Anna。我四岁。'), ('nv_vu', "My name is Vũ. I'm six.", '我叫Vũ。我六岁。'),
                                ('pets_cun_dung', "My name is Puppy. I'm three. Woof!", '我是小狗。我三岁。汪汪！'), ('cake', 'My name is ___. Happy birthday!', '我叫___。生日快乐！')]),
    ve=[('co', 'HAP-py BIRTH-day, HAP-py DAY!', '生日快乐，笑哈哈！', '-ay / a'), ('lop', 'ONE, two, THREE, four, CAKE! Yay, YAY!', '一二三四，蛋糕啦！', '-ay / a'),
        ('lop', "WHAT'S your NAME? How OLD are YOU?", '你叫什么？你几岁？', '-oo / ui'), ('bong', "my NAME'S LE-o. I'm FIVE! And YOU?", '我叫Leo，我五岁！', '-oo / ui')],
    the=[[('name', '名字', 'name'), ('my', '我的', ''), ('cake', '蛋糕', 'cake', 'PreB'), ('seven', '七', 'seven', 'PreB'), ('eight', '八', 'eight', 'PreB')],
         [('you', '你', ''), ('what', '什么', ''), ('your', '你的', '')], [('one', '一', 'count'), ('two', '二', 'count'), ('three', '三', 'count'), ('nine', '九', 'nine', 'PreB'), ('ten', '十', 'ten', 'PreB')],
         [('four', '四', 'count'), ('five', '五', 'count'), ('six', '六', 'count'), ('how old', '几岁', 'birthday')], [('birthday', '生日', 'birthday'), ('how old', '几岁', 'birthday')]])

U[3] = dict(ten_en="Bông's Family", ten_zh='Bông的家人', bg='ls_home', phan=[
    ('Who Is He?', '这是谁？', [('anna', 'Who is he?', '这是谁？'), ('bong', 'He is my daddy!', '这是我爸爸！'), ('anna', 'Who is he?', '这是谁？'),
                              ('bong', 'He is my grandpa!', '这是我爷爷！'), ('ong', "Hello! What's your name?", '你好！你叫什么名字？')]),
    ('Who Is She?', '这是谁？', [('anna', 'Hello, Grandpa! My name is Anna!', '爷爷好！我叫Anna！'), ('anna', 'Who is she?', '这是谁？'),
                               ('bong', 'She is my grandma!', '这是我奶奶！'), ('anna', 'Who is she?', '这是谁？'), ('bong', 'My mommy!', '我妈妈！')]),
    ("Anna's Family", 'Anna的家人', [('bong', 'Who is he?', '这是谁？'), ('anna', 'My big brother!', '我哥哥！'), ('bong', 'Hello, big brother! Who is she?', '哥哥好！这是谁？'),
                                   ('anna', 'My big sister! She is six!', '我姐姐！六岁！')]),
    ('Shh!', '嘘！', [('anna', 'Who is he?', '这是谁？'), ('bong', 'My little brother! He is three!', '我弟弟！三岁！'), ('anna', 'Hello! Wow! Who is she?', '你好！哇！这是谁？'),
                     ('bong', 'Shh!', '嘘！')]),
    ('My Family', '我的家人', [('bong', 'My little sister! She is young!', '我妹妹！好小呀！'), ('em', 'Waaa!', '哇哇！'), ('me', 'Hello, baby! I love you!', '宝宝，你好！我爱你！'),
                             ('bong', 'My family!', '我的家人！'), ('bong', 'And your family, ___?', '___，你的家人呢？')])],
    bb=('Who Is He? Who Is She?', '这是谁？', [('fam_bong_ong', 'Who is he? He is my grandpa.', '这是谁？这是我爷爷。'), ('fam_bong_ba', 'Who is she? She is my grandma.', '这是谁？这是我奶奶。'),
                                             ('fam_bong_anh_trai', 'Who is he? He is my big brother.', '这是谁？这是我哥哥。'), ('fam_anna_chi_gai', 'Who is she? She is my big sister.', '这是谁？这是我姐姐。'),
                                             ('fam_gau_em_trai', 'Who is he? He is my little brother.', '这是谁？这是我弟弟。'), ('fam_bong_em_gai', 'Who is she? Shh! She is my little sister.', '这是谁？嘘！这是我妹妹。'),
                                             ('bang_fam_bong', 'This is my family. I love you!', '这是我的家人。我爱你！')]),
    ve=[('co', '___, ___, WHO is SHE?', '___，___，这是谁？', '-ee / ui'), ('bong', "SHE'S my SIS-ter! SHE is THREE!", '我的妹妹，三岁！', '-ee / ui'),
        ('lop', 'BA-by, BA-by, WHO are YOU?', '宝宝宝宝，你是谁？', '-oo / ui'), ('lop', 'SHH! SHH! BA-by! I love YOU!', '嘘嘘嘘，宝宝睡！', '-oo / ui')],
    the=[[('grandpa', '爷爷', 'fam_bong_ong'), ('who', '谁', ''), ('he', '这', '')], [('grandma', '奶奶', 'fam_bong_ba'), ('she', '这', '')],
         [('big brother', '哥哥', 'fam_bong_anh_trai'), ('big sister', '姐姐', 'fam_anna_chi_gai'), ('brother', '哥哥', 'fam_bong_anh_trai', 'PreB'), ('sister', '姐姐', 'fam_anna_chi_gai', 'PreB')],
         [('little brother', '弟弟', 'fam_gau_em_trai'), ('little sister', '妹妹', 'fam_bong_em_gai'), ('wow', '哇', 'wow')], [('baby', '宝宝', 'fam_bong_em_gai'), ('young', '小', 'young'), ('family', '家人', 'bang_fam_bong')]])

U[4] = dict(ten_en='Touch, Touch!', ten_zh='摸摸！', bg='ls_home', phan=[
    ('I Have a Head!', '我有头！', [('bong', 'Hello, Daddy! I have a head!', '爸爸，你好！我有一个头！'), ('bo', 'Hello, Bông! I have a big head!', 'Bông，你好！我有大大的头！'),
                                   ('leo', 'Ha ha! A big head!', '哈哈！大大的头！'), ('cun', 'Woof! Woof!', '汪汪！汪汪！')]),
    ('Eyes and Mouth', '眼睛和嘴巴', [('leo', 'I have eyes! One, two eyes!', '我有眼睛！一、二，两只眼睛！'), ('bong', 'I have a mouth! A big mouth!', '我有嘴巴！大大的嘴巴！'),
                                     ('bo', 'Ha ha! I have a big mouth!', '哈哈！我有大嘴巴！'), ('cun', 'Woof!', '汪！')]),
    ('Touch Your Nose!', '摸摸鼻子！', [('bo', 'Touch your nose!', '摸摸鼻子！'), ('bong', 'I have a small nose!', '我有小小的鼻子！'),
                                      ('bong', 'Big brother! Touch your nose!', '哥哥！摸摸鼻子！'), ('anh', 'I have a big nose!', '我有大大的鼻子！')]),
    ('Oh No, Puppy!', '哎呀，小狗！', [('bo', 'Touch your ears! Touch your hands!', '摸摸耳朵！摸摸手！'), ('leo', 'I have two hands!', '我有两只手！'),
                                     ('bong', 'Puppy, touch your feet!', '小狗，摸摸脚！'), ('cun', 'Woof?', '汪？'), ('bong', 'Ha ha! Four feet!', '哈哈！四只脚！')]),
    ('Touch, Touch!', '摸摸！', [('bo', 'Touch one eye, one ear!', '摸摸一只眼睛，一只耳朵！'), ('bong', 'One hand! One foot! Ha ha!', '一只手！一只脚！哈哈！'),
                               ('leo', 'Wow! One big head!', '哇！一个大头！'), ('bong', 'Touch your nose, ___!', '___，摸摸鼻子！')])],
    bb=('I Have…', '我有…', [('head', 'I have a head.', '我有头。'), ('eye', 'I have two eyes.', '我有两只眼睛。'), ('mouth', 'I have a mouth.', '我有嘴巴。'),
                            ('nose', 'I have a small nose.', '我有小小的鼻子。'), ('ear', 'I have two ears.', '我有两只耳朵。'), ('hand', 'I have two hands.', '我有两只手。'),
                            ('foot', 'I have two feet.', '我有两只脚。'), ('touch', 'Touch your nose, ___!', '___，摸摸鼻子！')]),
    ve=[('co', 'ONE head, TWO eyes, I have TWO!', '头呀头，摸摸头，', '-oo / ou'), ('lop', 'TWO ears, TWO hands! And YOU? And YOU?', '两只眼睛两只手！', '-oo / ou'),
        ('lop', '___, ___, TOUCH your NOSE!', '___，___，摸鼻子，', '-ose / i'), ('bong', 'TOUCH, touch! HA, ha! THERE it GOES!', '摸摸摸，笑嘻嘻！', '-ose / i')],
    the=[[('head', '头', 'head'), ('have', '有', ''), ('I', '我', '')], [('eyes', '眼睛', 'eye'), ('mouth', '嘴巴', 'mouth'), ('ha ha', '哈哈', 'funny')],
         [('nose', '鼻子', 'nose'), ('small', '小小的', 'small'), ('touch', '摸摸', 'touch')], [('ears', '耳朵', 'ear'), ('hands', '手', 'hand'), ('feet', '脚', 'foot')],
         [('eye', '眼', 'eye'), ('ear', '耳', 'ear'), ('hand', '手', 'hand'), ('foot', '脚', 'foot')]])

U[5] = dict(ten_en="Bông's Big Day", ten_zh='Bông的一天', bg='ls_park', phan=[
    ('I Am Happy!', '我很开心！', [('bong', 'Hello, day! I am happy!', '早上好！我很开心！'), ('anna', "I am happy! Let's go!", '我很开心！走吧！'),
                                 ('bong', 'Oh no! I am hungry!', '哎呀！我饿了！'), ('me', 'Bông! Smile! I have cake!', 'Bông，笑一笑！我有蛋糕！')]),
    ('Sleepy and Scared', '困了，怕了', [('bong', 'I am sleepy.', '我好困。'), ('cun', 'Woof! Woof!', '汪汪！汪汪！'), ('anna', 'A big puppy!', '大狗！'),
                                     ('bong', 'I am scared!', '我好害怕！'), ('leo', 'Hello, puppy! I am happy!', '小狗，你好！我很开心！')]),
    ('I Am Angry!', '我很生气！', [('leo', 'Ha ha! My ball!', '哈哈！我的球！'), ('bong', 'No, Leo! I am angry!', '不对，Leo！我很生气！'),
                                 ('leo', 'Bông, your ball!', 'Bông，你的球！'), ('bong', 'I am tired. I am sleepy.', '我好累。我好困。')]),
    ('How Do You Feel?', '你心情怎么样？', [('me', 'Bông! How do you feel?', 'Bông，你心情怎么样？'), ('bong', 'I am sad. I am tired.', '我很难过。我好累。'),
                                          ('me', 'Hug! Hug!', '抱抱！抱抱！'), ('bong', 'I am happy!', '我很开心！'), ('leo', 'How do you feel, Anna?', 'Anna，你心情怎么样？')]),
    ("It's OK!", '没关系！', [('anna', "I am happy! It's OK!", '我很开心！没关系！'), ('leo', 'I am sleepy! Ha ha!', '我好困！哈哈！'),
                            ('bong', 'Goodbye, everyone! I am happy!', '大家再见！我很开心！'), ('bong', 'How do you feel, ___?', '___，你心情怎么样？')])],
    bb=('I Am…', '我很…', [('happy', 'I am happy.', '我很开心。'), ('sad', 'I am sad.', '我很难过。'), ('sleepy', 'I am sleepy.', '我好困。'), ('scared', 'I am scared.', '我好害怕。'),
                          ('angry', 'I am angry.', '我很生气。'), ('tired', 'I am tired.', '我好累。'), ('smile', 'How do you feel, ___?', '___，你心情怎么样？')]),
    ve=[('co', 'I am HAP-py! HA, ha, HA!', '我很开心，哈哈哈！', '-a / a'), ('lop', 'I am SLEEP-y! AH… AH… AH!', '我好困呀，啊啊啊！', '-a / a'),
        ('lop', '___, ___, ARE you O-KAY?', '___，___，你好吗？', '-ay / a'), ('bong', 'I am HAP-py! HIP, hip, hoo-RAY!', '我很开心，笑哈哈！', '-ay / a')],
    the=[[('happy', '开心', 'happy'), ('sad', '难过', 'sad'), ('smile', '笑', 'smile', 'PreB'), ('hungry', '饿', 'hungry', 'PreB')], [('sleepy', '困', 'sleepy'), ('scared', '害怕', 'scared')],
         [('angry', '生气', 'angry'), ('tired', '累', 'tired')], [('How do you feel?', '你心情怎么样？', 'smile')], [('tired', '累', 'tired'), ('happy', '心', 'happy')]])

U[6] = dict(ten_en="Leo's New Schoolbag", ten_zh='Leo的新书包', bg='ls_class', phan=[
    ('What Is This?', '这是什么？', [('leo', 'Hello, Bông! What is this?', 'Bông，你好！这是什么？'), ('bong', 'This is a book!', '这是书！'), ('leo', 'What is this?', '这是什么？'),
                                    ('bong', 'This is a pen! Wow!', '这是笔！哇！'), ('leo', 'I am happy!', '我很开心！')]),
    ('My New Schoolbag', '我的新书包', [('leo', 'Look! I have a new schoolbag!', '看！我有新书包！'), ('bong', 'Wow! A new schoolbag!', '哇！新书包！'),
                                       ('bong', 'What is this, Leo?', 'Leo，这是什么？'), ('leo', 'Ha ha! This is a new pen!', '哈哈！这是新笔！')]),
    ('Eraser and Ruler', '橡皮和尺子', [('bong', 'What is this?', '这是什么？'), ('leo', 'This is an eraser.', '这是橡皮。'), ('bong', 'What is this?', '这是什么？'),
                                      ('leo', 'This is a ruler! A big ruler!', '这是尺子！大大的尺子！'), ('bong', 'Touch! A small eraser!', '摸摸！小小的橡皮！')]),
    ('What Is That?', '那是什么？', [('bong', 'Oh no! What is that?', '哎呀！那是什么？'), ('leo', 'That is a bag! My bag!', '那是包！我的包！'), ('anna', 'What is that?', '那是什么？'),
                                    ('leo', 'That is a big bag! Ha ha!', '那是大大的包！哈哈！')]),
    ('Ta-da!', '当当！', [('leo', 'Ta-da! This is a pencil case!', '当当！这是笔袋！'), ('anna', 'Wow! This is a notebook!', '哇！这是本子！'),
                         ('bong', 'Look! My schoolbag! A new book!', '看！我的书包！新书！'), ('leo', "This is ___'s schoolbag!", '这是___的书包！')])],
    bb=('What Is This?', '这是什么？', [('book', 'What is this? This is a book.', '这是什么？这是书。'), ('pen', 'What is this? This is a pen.', '这是什么？这是笔。'),
                                        ('schoolbag', 'What is this? This is a schoolbag.', '这是什么？这是书包。'), ('eraser', 'What is this? This is an eraser.', '这是什么？这是橡皮。'),
                                        ('ruler', 'What is this? This is a ruler.', '这是什么？这是尺子。'), ('bag', 'What is that? That is a bag.', '那是什么？那是包。'),
                                        ('schoolbag', "This is ___'s pencil case!", '这是___的笔袋！')]),
    ve=[('co', 'WHAT is THIS? A BOOK, a BOOK!', '这是什么？是书呀！', '-ook / a'), ('lop', "WHAT is THAT? A PEN! Let's LOOK!", '那是什么？是笔呀！', '-ook / a'),
        ('lop', '___, ___, LOOK, look, LOOK!', '___，___，看一看呀！', '-ook / a'), ('bong', 'THIS is my NEW, new BOOK, book, BOOK!', '这是我的新书呀！', '-ook / a')],
    the=[[('book', '书', 'book'), ('pen', '笔', 'pen'), ('pencil', '铅笔', 'pen', 'PreB'), ('desk', '桌子', 'table', 'PreB')], [('schoolbag', '书包', 'schoolbag'), ('new', '新', 'new'), ('look', '看', '')],
         [('eraser', '橡皮', 'eraser'), ('ruler', '尺子', 'ruler')], [('that', '那', ''), ('bag', '包', 'bag')], [('pencil case', '笔袋', ''), ('notebook', '本子', 'book')]])

U[7] = dict(ten_en='Where Is My Book?', ten_zh='我的书在哪儿？', bg='ls_home', phan=[
    ('Where Is My Book?', '我的书在哪儿？', [('bong', 'Oh no! Where is my new book?', '哎呀！我的新书在哪儿？'), ('me', 'Look! The bed! The sofa! The door!', '看！床！沙发！门！'),
                                            ('bong', 'Bed? No! Sofa? No!', '床？不对！沙发？不对！'), ('cun', 'Woof!', '汪！')]),
    ('Thank You!', '谢谢！', [('leo', 'Hello, Bông! The table? The chair?', 'Bông，你好！桌子？椅子？'), ('bong', 'Table? No! Chair? No!', '桌子？不对！椅子？不对！'),
                             ('leo', 'Look! A book!', '看！一本书！'), ('bong', 'That is your book! Thank you, Leo!', '那是你的书！谢谢你，Leo！')]),
    ('Is It on the Bed?', '在床上吗？', [('bong', 'Is it on the bed?', '在床上吗？'), ('me', 'Not on the bed.', '不在床上。'), ('bong', 'Is it on the sofa?', '在沙发上吗？'),
                                       ('leo', 'Not on the sofa!', '不在沙发上！'), ('bong', 'Oh no!', '哎呀！')]),
    ('Under the Chair?', '在椅子下吗？', [('bong', 'Is it on the chair?', '在椅子上吗？'), ('me', 'Not on the chair.', '不在椅子上。'), ('leo', 'Is it under the chair?', '在椅子下吗？'),
                                        ('bong', 'Not under the chair!', '不在椅子下！'), ('cun', 'Woof! Woof!', '汪汪！汪汪！')]),
    ('Here It Is!', '在这儿！', [('leo', 'Look! Under the table! The puppy!', '看！桌子下！小狗！'), ('bong', 'My book! Here it is! Yay!', '我的书！在这儿！耶！'),
                                ('bong', 'Thank you, puppy! Thank you, Leo!', '谢谢你，小狗！谢谢你，Leo！'), ('bong', 'Thank you, ___!', '___，谢谢你！')])],
    bb=('Is It on the Bed?', '在床上吗？', [('bed', 'Is it on the bed? Not on the bed.', '在床上吗？不在床上。'), ('sofa', 'Is it on the sofa? Not on the sofa.', '在沙发上吗？不在沙发上。'),
                                           ('table', 'Is it on the table? Not on the table.', '在桌子上吗？不在桌子上。'), ('chair', 'Is it on the chair? Not on the chair.', '在椅子上吗？不在椅子上。'),
                                           ('under', 'Is it under the chair? Yes! Here it is!', '在椅子下吗？对！在这儿！'), ('thank_you', 'Thank you, ___!', '___，谢谢你！')]),
    ve=[('co', 'WHERE is my BOOK? ON the BED?', '我的书呢？在床上？', '-ed / ang'), ('lop', 'NOT on the BED! It\'s ON my HEAD!', '不在床上，在头上！', '-ed / ang'),
        ('lop', '___, ___, WHERE is your BOOK?', '___，___，你的书呢？', '-ook / e'), ('bong', 'UN-der the CHAIR! LOOK, look, LOOK!', '椅子下面，找到了！', '-ook / e')],
    the=[[('bed', '床', 'bed'), ('sofa', '沙发', 'sofa'), ('where', '哪儿', ''), ('door', '门', 'door', 'PreB'), ('window', '窗户', 'window', 'PreB')],
         [('table', '桌子', 'table'), ('chair', '椅子', 'chair'), ('thank you', '谢谢', 'thank_you')], [('on', '上', 'table'), ('not', '不', '')], [('under', '下', 'under')],
         [('Here it is!', '在这儿！', 'book')]])

U[8] = dict(ten_en='The Animal Games', ten_zh='动物运动会', bg='ls_park', phan=[
    ('I Can Run!', '我能跑！', [('bong', 'Hello, dog! Ready, go!', '小狗，你好！预备，跑！'), ('cun', 'I can run! Run, run, run!', '我能跑！跑，跑，跑！'),
                               ('leo', 'Wow! The dog can run!', '哇！小狗能跑！'), ('duck', 'Quack! Quack! I can run!', '嘎嘎！嘎嘎！我能跑！')]),
    ('I Can Fly!', '我能飞！', [('bong', 'Hello, bird! How old are you?', '小鸟，你好！你几岁？'), ('bird', "I'm two! I can fly! Fly, fly!", '我两岁！我能飞！飞，飞！'),
                               ('cun', 'Oh no! I can not fly!', '哎呀！我不能飞！'), ('leo', 'Ha ha!', '哈哈！')]),
    ('I Can Swim!', '我能游泳！', [('bong', 'Hello, fish!', '小鱼，你好！'), ('fish', 'I can swim! Swim, swim!', '我能游泳！游，游！'), ('cun', 'I can run! I can swim!', '我能跑！我能游泳！'),
                                  ('bird', 'I can not swim! Oh no!', '我不能游泳！哎呀！'), ('leo', 'Ha ha! Swim, bird!', '哈哈！小鸟，游呀！')]),
    ('I Can Jump!', '我能跳！', [('rabbit', 'Hello! I can jump! Jump, jump!', '你好！我能跳！跳，跳！'), ('meo', 'I can jump! I can run!', '我能跳！我能跑！'),
                               ('fish', 'I can not run! Ha ha!', '我不能跑！哈哈！'), ('cun', 'Ready, go!', '预备，跑！')]),
    ('The Animal Games', '动物运动会', [('co', 'The Animal Games! Ready, go!', '动物运动会！预备，跑！'), ('mouse', 'I can run!', '我能跑！'), ('lop', 'Hooray!', '耶！'),
                                       ('bong', 'The animals can run, fly, swim and jump!', '动物能跑、能飞、能游泳、能跳！'), ('bong', 'And ___ can jump!', '___也能跳！')])],
    bb=('I Can…', '我能…', [('animal', 'I am a dog. I can run.', '我是小狗。我能跑。'), ('bird', 'I am a bird. I can fly.', '我是小鸟。我能飞。'), ('fish', 'I am a fish. I can swim.', '我是小鱼。我能游泳。'),
                           ('rabbit', 'I am a rabbit. I can jump.', '我是兔子。我能跳。'), ('mouse', 'I am a mouse. I can run.', '我是老鼠。我能跑。'), ('jump', 'I am ___. I can jump!', '我是___。我能跳！')]),
    ve=[('co', 'DOG can RUN and BIRD can FLY!', '狗狗跑呀鸟儿飞，', '-y / ui'), ('lop', 'RAB-bit can JUMP, jump, UP so HIGH!', '鱼儿游呀兔儿追！', '-y / ui'),
        ('lop', '___, ___, WHAT can YOU do?', '___，___，你能做什么？', '-oo / e'), ('bong', 'I can JUMP! One, TWO! One, TWO!', '我能跳！看我跳了！', '-oo / e')],
    the=[[('dog', '狗', 'animal'), ('run', '跑', 'run'), ('can', '能', ''), ('duck', '鸭子', 'duck', 'PreB'), ('frog', '青蛙', 'frog', 'PreB')], [('bird', '鸟', 'bird'), ('fly', '飞', 'fly')],
         [('fish', '鱼', 'fish'), ('swim', '游泳', 'swim')], [('rabbit', '兔子', 'rabbit'), ('jump', '跳', 'jump'), ('cat', '猫', 'animal')],
         [('animal', '动物', 'animal'), ('game', '运动会', 'game'), ('mouse', '老鼠', 'mouse')]])

U[10] = dict(ten_en='Rain, Rain!', ten_zh='下雨啦！', bg='ls_park', phan=[
    ('It Is Sunny!', '今天晴天！', [('bong', 'It is sunny today! I am happy!', '今天晴天！我很开心！'), ('me', 'It is hot!', '好热！'), ('bong', "Let's go! The park! Yay!", '走吧！去公园！耶！'),
                                   ('leo', 'Hello, Bông! I am in the park!', 'Bông，你好！我在公园！')]),
    ('It Is Windy!', '刮风了！', [('leo', "Let's play!", '我们玩吧！'), ('anna', 'I like the park! I can run!', '我喜欢公园！我能跑！'), ('bong', 'Oh! It is cloudy today.', '哦！今天多云。'),
                                 ('leo', 'Whoosh, whoosh! It is windy!', '呼呼！刮风了！'), ('anna', 'Oh no! My bag!', '哎呀！我的包！')]),
    ('It Is Rainy!', '下雨了！', [('anna', 'What is the weather today?', '今天天气怎么样？'), ('bong', 'Oh! Rain! It is rainy!', '哦！下雨了！'), ('anna', 'No! I am sad.', '不！我很难过。'),
                                ('leo', 'It is rainy. No park!', '下雨了。不去公园！'), ('me', "Let's eat! Let's drink milk!", '我们吃饭吧！喝牛奶吧！'), ('lop', 'Yay!', '耶！')]),
    ('It Is Snowy!', '下雪了！', [('bong', 'I am sleepy…', '我好困……'), ('bong', 'Wow! It is snowy today!', '哇！今天下雪了！'), ('leo', 'It is cold! I am cold!', '好冷！我好冷！'),
                                ('anna', 'I like it! Ha ha!', '我喜欢！哈哈！'), ('bong', 'Brr! It is cold!', '好冷呀！')]),
    ("Let's Go Home!", '回家吧！', [('me', 'Bông! It is sunny today!', 'Bông！今天晴天！'), ('bong', 'Oh! No snow?', '哦！没有雪？'), ('me', "Let's go home!", '回家吧！'),
                                   ('bong', 'Goodbye, park! See you tomorrow!', '公园，再见！明天见！'), ('bong', "It is sunny! Let's go home, ___!", '___，今天晴天！回家吧！')])],
    bb=('It Is … Today', '今天…', [('sunny', 'It is sunny today.', '今天晴天。'), ('cloudy', 'It is cloudy today.', '今天多云。'), ('windy', 'It is windy today.', '今天刮风。'),
                                  ('rainy', 'It is rainy today.', '今天下雨。'), ('snowy', 'It is snowy today.', '今天下雪。'), ('cold', 'It is cold today.', '今天很冷。'),
                                  ('go_out', "Let's go home, ___!", '___，回家吧！')]),
    ve=[('co', "SUN-ny, SUN-ny, LET'S go PLAY!", '晴天晴天，去玩吧！', '-ay / a'), ('lop', 'RAIN-y, RAIN-y, GO a-WAY!', '下雨下雨，快走吧！', '-ay / a'),
        ('lop', '___, ___, IS it HOT?', '___，___，热不热？', '-ot / e'), ('bong', 'SUN-ny! SUN-ny! YES, a LOT!', '好热好热，热热热！', '-ot / e')],
    the=[[('sunny', '晴天', 'sunny'), ('park', '公园', 'go_out'), ('in', '在', ''), ('hot', '热', 'hot')], [('play', '玩', 'play'), ('cloudy', '多云', 'cloudy'), ('windy', '刮风', 'windy')],
         [('rainy', '下雨', 'rainy'), ('today', '今天', 'weather'), ('weather', '天气', 'weather')], [('snowy', '下雪', 'snowy'), ('cold', '冷', 'cold')],
         [('go home', '回家', 'go_out'), ('rain', '雨', 'rain'), ('sun', '日', 'sunny')]])

U[11] = dict(ten_en="Bông's Rainbow", ten_zh='Bông的彩虹', bg='ls_park', phan=[
    ('A Rainbow!', '彩虹！', [('bong', 'Look! A rainbow! Wow!', '看！彩虹！哇！'), ('anna', 'What colour is it?', '这是什么颜色？'), ('bong', "It's red! It's yellow!", '是红色！是黄色！'),
                            ('leo', "Let's play in the park!", '我们在公园玩吧！'), ('anna', 'What colour is it, Leo?', 'Leo，这是什么颜色？'), ('leo', "It's yellow!", '是黄色！')]),
    ('Blue and Green', '蓝色和绿色', [('anna', 'What colour is it?', '这是什么颜色？'), ('bong', "It's blue! It's green!", '是蓝色！是绿色！'), ('leo', 'Look! A green tree!', '看！绿色的树！'),
                                    ('anna', 'Colour, colour! I like blue!', '颜色，颜色！我喜欢蓝色！'), ('bong', 'What colour is it? A blue bird!', '这是什么颜色？蓝色的小鸟！')]),
    ('Red and Yellow Make Orange!', '红加黄是橙色！', [('leo', 'Look! Red and yellow!', '看！红色和黄色！'), ('leo', 'Ta-da! Red and yellow make orange!', '当当！红加黄是橙色！'),
                                                    ('anna', 'Wow! Red and blue make purple!', '哇！红加蓝是紫色！'), ('bong', 'What colour is it?', '这是什么颜色？'), ('leo', "It's purple! Ha ha!", '是紫色！哈哈！')]),
    ('Black and White', '黑色和白色', [('anna', 'Look! My kitten! What colour is it?', '看！我的小猫！是什么颜色？'), ('bong', "It's black!", '是黑色！'),
                                      ('anna', 'My puppy! What colour is it?', '我的小狗！是什么颜色？'), ('leo', "It's white! A white puppy! Ha ha!", '是白色！白色的小狗！哈哈！'),
                                      ('bong', 'Black and white! Wow!', '黑色和白色！哇！')]),
    ('My Rainbow!', '我的彩虹！', [('leo', 'Black and white make grey!', '黑加白是灰色！'), ('bong', 'And pink! I like pink!', '还有粉色！我喜欢粉色！'), ('anna', "It's a rainbow! Ta-da!", '是彩虹！当当！'),
                                 ('bong', 'Red, yellow, blue, green, pink! Yay!', '红、黄、蓝、绿、粉！耶！'), ('bong', 'What colour do you like, ___?', '___，你喜欢什么颜色？')])],
    bb=('What Colour Is It?', '这是什么颜色？', [('red', "What colour is it? It's red.", '这是什么颜色？是红色。'), ('yellow', "What colour is it? It's yellow.", '这是什么颜色？是黄色。'),
                                              ('blue', "What colour is it? It's blue.", '这是什么颜色？是蓝色。'), ('green', "What colour is it? It's green.", '这是什么颜色？是绿色。'),
                                              ('orange', "What colour is it? It's orange.", '这是什么颜色？是橙色。'), ('purple', "What colour is it? It's purple.", '这是什么颜色？是紫色。'),
                                              ('rainbow', 'What colour do you like, ___?', '___，你喜欢什么颜色？')]),
    ve=[('co', 'RED and YEL-low, BLUE and GREEN,', '红色黄色蓝绿色，', '-een / e'), ('lop', 'PINK and PUR-ple, IN be-TWEEN!', '彩虹颜色真快乐！', '-een / e'),
        ('lop', '___, ___, what COL-our do you LIKE?', '___，___，你喜欢什么颜色？', '-ike / e'), ('bong', 'I like RED! RED like my BIKE!', '我喜欢红色，红红的！', '-ike / e')],
    the=[[('red', '红色', 'red'), ('yellow', '黄色', 'yellow'), ('rainbow', '彩虹', 'rainbow')], [('blue', '蓝色', 'blue'), ('green', '绿色', 'green'), ('colour', '颜色', 'colour')],
         [('orange', '橙色', 'orange'), ('purple', '紫色', 'purple'), ('make', '加', '')], [('black', '黑色', 'black'), ('white', '白色', 'white')],
         [('pink', '粉色', 'pink'), ('grey', '灰色', 'grey'), ('fire', '火', 'red'), ('tree', '木', 'green')]])


def _from_json(n, p):
    D = json.load(open(p))
    return D


_HERE = os.path.dirname(os.path.abspath(__file__))
_MN = json.load(open(os.path.join(_HERE, 'mau_ls48_banmoi.json')))
U[9] = dict(ten_en='Picnic Time!', ten_zh='去野餐！', bg='ls_park', phan=[(t, z, [tuple(x) for x in P]) for t, z, P in _MN['9']['phan']],
            bb=('I Like…', '我喜欢…', [('apple', 'I like apples.', '我喜欢苹果。'), ('banana', 'I like bananas.', '我喜欢香蕉。'), ('pizza', 'I like pizza.', '我喜欢比萨。'),
                                    ('rice', 'I eat rice.', '我吃米饭。'), ('milk', 'I drink milk.', '我喝牛奶。'), ('water', 'I drink water.', '我喝水。'),
                                    ('picnic', 'I like picnics! What do you like, ___?', '我喜欢野餐！___，你喜欢什么？')]),
            ve=[(w, e, z, v) for (w, e, z), v in zip([tuple(x) for x in _MN['9']['ve']], ['-o / ou', '-o / ou', '-eat / e', '-eat / e'])],
            the=[[('Picnic time!', '去野餐', 'picnic'), ('juice', '果汁', 'juice', 'PreB'), ('egg', '鸡蛋', 'egg', 'PreB')], [('like', '喜欢', 'love'), ('apple', '苹果', 'apple'), ('eat', '吃', 'eat')],
                 [('banana', '香蕉', 'banana'), ('pizza', '比萨', 'pizza')], [('drink', '喝', 'drink'), ('milk', '牛奶', 'milk'), ('water', '水', 'water')], [('rice', '米饭', 'rice')]])
U[12] = dict(ten_en="Leo's Party", ten_zh='Leo的生日会', bg='ls_home', phan=[(t, z, [tuple(x) for x in P]) for t, z, P in _MN['12']['phan']],
             bb=('How Many?', '几个？', [('cake', 'How many cakes? One cake.', '几个蛋糕？一个蛋糕。'), ('animal', 'How many dogs? Two dogs.', '几只狗？两只狗。'),
                                       ('pets_meo_ngoi', 'How many cats? Three cats.', '几只猫？三只猫。'), ('apple', 'How many apples? Four apples.', '几个苹果？四个苹果。'),
                                       ('monkey', 'How many monkeys? Five monkeys.', '几只猴子？五只猴子。'), ('people', 'How many friends? Ten friends!', '几个朋友？十个朋友！'),
                                       ('count', "How many friends, ___? Let's count!", '___，几个朋友？我们数一数！')]),
             ve=[(w, e, z, v) for (w, e, z), v in zip([tuple(x) for x in _MN['12']['ve']], ['-en / i', '-en / i', '-nd / ou', '-nd / ou'])],
             the=[[('party', '生日会', 'party'), ('how many', '几个', 'count'), ('cake', '蛋糕', 'cake')], [('monkey', '猴子', 'monkey'), ('toy', '玩具', 'ball', 'PreB')],
                  [('dogs', '两只狗', 'animal'), ('jump', '跳', 'jump')], [('red', '红色', 'red'), ('white', '白色', 'white')], [('big', '大', 'big'), ('ten', '十', 'ten')]])
# U9: vè dòng 1–4 người nói
U[9]['ve'] = [(w if w not in ('Cô', 'Lớp', 'Con') else {'Cô': 'co', 'Lớp': 'lop', 'Con': 'bong'}[w], e, z, v) for w, e, z, v in U[9]['ve']]
U[12]['ve'] = [(w if w not in ('Cô', 'Lớp', 'Con') else {'Cô': 'co', 'Lớp': 'lop', 'Con': 'bong'}[w], e, z, v) for w, e, z, v in U[12]['ve']]
for _u in (2, 3):
    pass

if __name__ == '__main__':
    import re
    for n, M in sorted(U.items()):
        en = [sum(len(re.findall(r"[A-Za-zÀ-ỹ']+", e.replace('___', ''))) for _, e, _ in P) for _, _, P in M['phan']]
        print(n, M['ten_en'], en)
