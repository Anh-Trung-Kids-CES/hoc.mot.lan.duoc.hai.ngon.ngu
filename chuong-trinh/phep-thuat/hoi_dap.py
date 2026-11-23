"""Phép thuật lời nói · luật HỎI – ĐÁP – HIỆN TRANH (chị duyệt 23/11/2026).
Leo (tiếng Anh) rồi Xiaomei (tiếng Trung) lần lượt hỏi; con trả lời bằng một trong 2–3 tranh gợi ý; tranh hiện theo câu con nói.
QT  = câu hỏi mẫu dùng chung mọi unit (mỗi câu một file thu, dùng lại ở nhiều unit).
QA  = nhóm câu hỏi của từng unit: (mã câu hỏi, [các phép làm đáp án]). Phép tự là câu hỏi (What's your name?…) không làm đáp án.
Câu tiếng Trung đã qua agent giáo viên tiếng Trung rà (23/11/2026): 会什么, 数一数, 一起, 要穿/戴, 这时候要说什么, 中文这样说; phép khả năng 能 → 会 theo luật chị đã chốt.
"""
QT = {
    'hi':      ("Who's here? Say hello!",          '谁来啦？打个招呼吧！'),
    'who_she': ('Who is she?',                     '她是谁？'),
    'who_he':  ('Who is he?',                      '他是谁？'),
    'feel':    ('How do you feel?',                '你感觉怎么样？'),
    'this':    ("What's this?",                    '这是什么？'),
    'have':    ('What do you have?',               '你有什么？'),
    'where':   ('Where is it?',                    '它在哪儿？'),
    'can':     ('What can they do?',               '它们会什么？'),
    'eat':     ('What do you eat?',                '你吃什么？'),
    'drink':   ('What do you drink?',              '你喝什么？'),
    'like':    ('What do you like?',               '你喜欢什么？'),
    'weather': ("What's the weather like today?",  '今天天气怎么样？'),
    'colour':  ('What colour do you want?',        '你想要什么颜色？'),
    'count':   ("Let's count! How many?",          '数一数，有几个？'),
    'do':      ('What shall we do?',               '我们一起做什么？'),
    'wear':    ('What do we wear?',                '我们要穿什么？戴什么？'),
    'age':     ('How old are you?',                '你几岁？'),
    'name':    ("What's your name?",               '你叫什么名字？'),
    'say':     ('Look! What do you say?',          '看！这时候要说什么？'),
}
QA = {
    ('LS', '1'):  [('hi', ['hi_kitten', 'hi_teacher', 'hi_mommy', 'hi_all']), ('say', ['day', 'night', 'go', 'bye_puppy'])],
    ('LS', '2'):  [('age', ['num']), ('name', ['name']), ('say', ['hello_cake', 'hbd'])],
    ('LS', '3'):  [('hi', ['hi_grandpa', 'hi_grandma', 'hi_bigbro', 'hi_lilsis']), ('say', ['baby', 'family'])],
    ('LS', '4'):  [('have', ['head', 'eyes', 'ears', 'mouth']), ('say', ['hi_robo', 'nose'])],
    ('LS', '5'):  [('feel', ['happy', 'sad', 'hungry', 'sleepy', 'scared', 'angry'])],
    ('LS', '6'):  [('this', ['book', 'pen', 'pencil', 'ruler', 'eraser', 'bag'])],
    ('LS', '7'):  [('where', ['on_table', 'under_bed', 'on_sofa', 'under_chair']), ('say', ['here'])],
    ('LS', '8'):  [('can', ['dog_run', 'bird_fly', 'fish_swim', 'rabbit_jump']), ('say', ['hi_duck', 'ready_go'])],
    ('LS', '9'):  [('eat', ['eat_apple', 'eat_banana', 'eat_rice']), ('drink', ['drink_juice', 'drink_milk']), ('like', ['like_pizza'])],
    ('LS', '10'): [('weather', ['sunny', 'cloudy', 'windy', 'rainy', 'snowy', 'cold'])],
    ('LS', '11'): [('colour', ['red', 'yellow', 'blue', 'green', 'pink']), ('say', ['rainbow'])],
    ('LS', '12'): [('count', ['two_dogs', 'three_cakes', 'five_monkeys', 'ten_eggs']), ('say', ['hbd_leo'])],
    ('SD', '1'):  [('hi', ['hi_teacher', 'hi_grandpa', 'hi_kids']), ('say', ['night', 'go', 'tall'])],
    ('SD', '2'):  [('age', ['age']), ('name', ['name']), ('say', ['hbd_vu', 'meet'])],
    ('SD', '3'):  [('who_she', ['mother', 'younger_sis']), ('who_he', ['father', 'older_bro']), ('say', ['photo', 'baby'])],
    ('SD', '4'):  [('do', ['clap', 'stamp', 'mouth']), ('say', ['hands', 'arms', 'body'])],
    ('SD', '5'):  [('feel', ['sleepy', 'excited', 'hungry', 'thirsty']), ('say', ['hbd_leo', 'night'])],
    ('SD', '6'):  [('this', ['scissors', 'glue', 'bag']), ('say', ['crayon', 'line', 'letters'])],
    ('SD', '7'):  [('where', ['under_bed', 'on_sofa']), ('say', ['living', 'found'])],
    ('SD', '8'):  [('can', ['bird_fly', 'fish_swim', 'dog_run', 'rabbit_jump', 'bear_swim', 'frog_cant'])],
    ('SD', '9'):  [('like', ['like_apple', 'like_ice', 'dont_fruit']), ('say', ['no_thanks'])],
    ('SD', '10'): [('weather', ['sunny', 'windy', 'rainy', 'snowy']), ('wear', ['coat', 'hat'])],
    ('SD', '11'): [('colour', ['pink_dress', 'blue_shorts', 'red_socks', 'gold']), ('say', ['colour_dress'])],
    ('SD', '12'): [('count', ['ten', 'count']), ('say', ['photo', 'hooray', 'cake', 'time'])],
}
# câu chung mới của luật hỏi – đáp (text hiển thị, text đọc khi khác)
COMMON_QA = {
    'en': {'bye': ('Bye-bye! Your turn, Xiaomei!', None), 'langx': ("That's Chinese! In English, we say:", None)},
    'zh': {'come': ('你好！我是Xiaomei！', '你好！我是小美！'), 'langx': ('这是英语哦！中文这样说：', None)},
    'vi': {'qa1': ('Leo hỏi, con trả lời. Con nói gì, tranh sẽ hiện ra đúng cái đó!', None),
           'qa2': ('Con chưa nghĩ ra thì chạm bóng đèn để được gợi ý nhé!', None),
           'qa3': ('Bây giờ mình nói tiếng Trung nhé!', None)},
}
