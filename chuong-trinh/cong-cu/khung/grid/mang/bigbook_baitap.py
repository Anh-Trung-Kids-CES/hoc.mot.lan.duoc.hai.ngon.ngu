"""Dữ liệu bài tập big book trên web – Little Seed 48 và Seedling 48 (chị chốt 13/11/2026 chiều).

Bốn lần trong một unit, dạng bài đổi theo unit chẵn / lẻ:
  lần 1 an   (tìm chi tiết ẩn)            – mọi unit
  lần 2 sai  (cô đọc sai, con sửa)         – unit lẻ  | dien (nghe, chọn từ điền chỗ trống) – unit chẵn
  lần 3 vai  (lồng tiếng nhân vật + trang ảnh của con) – mọi unit
  lần 4 xep  (nghe rồi xếp thẻ thành câu)  – unit lẻ  | dich (chuyển ngữ bằng tai) – unit chẵn
Số trang (pg) tính theo danh sách trang trên web: 0 = bìa khung ảnh, 1 = p1.webp …

Mỗi quyển:
  an   : [(pg, tiếng, từ khoá, [x, y, rộng, cao] % trên tranh)]   – từ khoá là mã tên (names) hoặc (en, zh)
  sai  : [(pg, tiếng, câu cô đọc sai hoặc None nếu cô đọc đúng, [từ đúng, từ sai])]  – từ là mã tên hoặc chữ
  dien : [(pg, tiếng, từ bị che, [các lựa chọn])]
  vai  : {mã vai: (nhãn, ảnh, [(pg, tiếng)])}  – lời của vai; trang ngay trước là ngữ cảnh (cô đọc)
  dich : [(pg, tiếng nghe, [pg câu nhiễu])]   – đáp án là câu cùng trang ở tiếng kia
  xep  : [(pg, tiếng, [thẻ])]                   – Seedling có thể thêm tiếng nghe khác tiếng xếp: (pg, tiếng xếp, [thẻ], tiếng nghe)
"""


def kieu(un, lan):
    """Dạng bài của lần `lan` ở unit `un` (bảng chị duyệt 13/11)."""
    le = un % 2 == 1
    return {1: 'an', 2: 'sai' if le else 'dien', 3: 'vai', 4: 'xep' if le else 'dich'}[lan]


NV = '../seedling/tai-nguyen/nhan-vat/'

BT = {'LS': {}, 'SD': {}}

# ---------- Little Seed U1 · "Goodbye, Puppy!" (Puppy lén theo Bông cả ngày) ----------
BT['LS'][1] = {
    'an': [(2, 'en', 'puppy', [36, 64, 20, 33]),      # dưới gầm bàn ăn sáng
           (3, 'zh', 'puppy', [6, 44, 16, 24]),       # trong giỏ xe máy của bố
           (5, 'en', 'puppy', [5, 28, 13, 21]),       # cái đuôi thò ra từ cặp sách ở lớp
           (6, 'zh', 'puppy', [51, 46, 10, 27]),      # nấp sau tháp gỗ
           (10, 'en', 'kitten', [58, 36, 25, 40])],   # mèo con ở cửa
    'sai': [(2, 'en', 'Good morning, daddy!', ['mommy', 'daddy']),
            (3, 'zh', '妈妈，你好！', ['daddy', 'mommy']),
            (5, 'en', None, []),
            (10, 'zh', '小狗，你好！', ['kitten', 'puppy']),
            (11, 'en', 'Good morning, puppy!', [('Good night', '晚安'), ('Good morning', '早上好')])],
    'vai': {'bong': ('Bông', NV + 'kids_bong_a.webp', [(2, 'en'), (3, 'zh'), (5, 'en'), (8, 'zh'), (11, 'en')])},
    'xep': [(2, 'en', ['Good', 'morning,', 'mommy!']),
            (3, 'zh', ['爸爸，', '你', '好！']),
            (9, 'en', ['See', 'you', 'tomorrow!']),
            (7, 'zh', ['大家', '好！']),
            (11, 'en', ['Good', 'night,', 'puppy!'])],
}

# ---------- Little Seed U2 · "My Name Is…" (khách đeo mặt nạ con vật) ----------
BT['LS'][2] = {
    'an': [(2, 'en', 'leo', [61, 15, 26, 82]),        # Leo dưới mặt nạ cún (Puppy thật ngồi cạnh Bông)
           (6, 'zh', ('kitten', '小猫'), [38, 37, 22, 33]),   # mèo con thật trên bậu cửa sổ
           (9, 'en', ('mommy', '妈妈'), [9, 10, 25, 85]),    # mẹ bưng bánh
           (11, 'zh', 'puppy', [30, 54, 28, 35]),     # Puppy dưới gầm bàn
           (6, 'en', 'anna', [64, 27, 28, 72])],      # Anna dưới mặt nạ mèo
    'dien': [(4, 'en', 'Leo', ['Leo', 'Anna', 'Puppy']),
             (8, 'zh', '四', ['五', '四', '六']),
             (10, 'en', 'six', ['four', 'six', 'five']),
             (12, 'zh', '小狗', ['小猫', '小狗', 'Leo']),
             (6, 'en', 'Kitten', ['Puppy', 'Anna', 'Kitten'])],
    'vai': {'bong': ('Bông (hỏi tên)', NV + 'kids_bong_a.webp', [(1, 'en'), (3, 'zh'), (5, 'en'), (7, 'zh'), (10, 'en')]),
            'khach': ('Các bạn khách (nói tên)', NV + 'kids_leo_a.webp', [(2, 'en'), (4, 'zh'), (6, 'en'), (8, 'zh'), (12, 'en')])},
    'dich': [(4, 'en', [8, 9]), (8, 'zh', [4, 6]), (9, 'en', [1, 10]), (6, 'zh', [2, 8]), (10, 'en', [4, 9])],
}

# ---------- Little Seed U3 · "Who Is She?" (đoán người nhà từ sau lưng) ----------
BT['LS'][3] = {
    'an': [(1, 'en', 'me', [51, 3, 22, 82]),          # mẹ quay lưng nấu ăn
           (5, 'zh', 'ba', [52, 11, 19, 48]),         # bà quay lưng nhặt rau
           (9, 'en', 'anh_trai', [45, 18, 18, 52]),   # anh trai đội mũ tưới rau
           (11, 'zh', ('puppy', '小狗'), [33, 57, 25, 43]),   # Puppy ló đầu ở dưới
           (13, 'en', 'em_gai', [50, 26, 16, 31])],   # em bé trong tay mẹ
    'sai': [(2, 'en', 'She is my grandma!', ['me', 'ba']),
            (4, 'zh', '这是我爷爷！', ['bo', 'ong']),
            (6, 'en', None, []),
            (12, 'zh', '嘘！这是我哥哥。', ['em_gai', 'anh_trai']),
            (8, 'en', 'He is my daddy!', ['ong', 'bo'])],
    'vai': {'bong': ('Bông (trả lời)', NV + 'kids_bong_a.webp', [(2, 'en'), (4, 'zh'), (6, 'en'), (8, 'zh'), (12, 'en')]),
            'anna': ('Anna (hỏi)', NV + 'kids_anna_a.webp', [(1, 'en'), (3, 'zh'), (5, 'en'), (7, 'zh'), (11, 'en')])},
    'xep': [(2, 'en', ['She', 'is', 'my', 'mommy!']),
            (4, 'zh', ['这', '是', '我', '爸爸！']),
            (8, 'en', ['He', 'is', 'my', 'grandpa!']),
            (12, 'zh', ['这', '是', '我', '妹妹。']),
            (13, 'en', ['I', 'love', 'you!'])],
}

# ======================================================================================================
# SEEDLING 48 · U1–U3 (15/11/2026, chờ chị duyệt). Lời từng trang: bigbook_loi_sd48.txt. Vùng chạm đo trên tranh seedling/tai-nguyen/bigbook/uN/pK.webp (% rộng, % cao).
# Khóa thêm của Seedling: mine (hai câu "của con" ở trang ảnh), frame (ô ảnh trên bia_khung.webp), photo_t.
# ======================================================================================================
NVS = 'tai-nguyen/nhan-vat/'   # đường dẫn tính từ seedling/
NAMES_SD = {   # mã tên → (en, zh, ảnh)
    'leo': ('Leo', 'Leo', NVS + 'kids_leo_a.webp'), 'anna': ('Anna', 'Anna', NVS + 'kids_anna_a.webp'),
    'xiaomei': ('Xiaomei', 'Xiaomei', NVS + 'kids_xiaomei_a.webp'), 'bong': ('Bông', 'Bông', NVS + 'kids_bong_a.webp'),
    'vu': ('Vũ', 'Vũ', NVS + 'nv_vu_a.webp'), 'lan': ('Mrs Lan', 'Lan老师', NVS + 'nv_lan_a.webp'),
    'ong': ('grandpa', '爷爷', NVS + 'fam_bong_ong_a.webp'), 'me': ('mother', '妈妈', NVS + 'fam_bong_me_a.webp'),
    'bo': ('father', '爸爸', NVS + 'fam_bong_bo_a.webp'), 'anh_trai': ('older brother', '哥哥', NVS + 'fam_bong_anh_trai_a.webp'),
    'em_gai': ('younger sister', '妹妹', NVS + 'fam_bong_em_gai_a.webp'),
    # (18/11) lựa chọn big book phải có tranh như các lựa chọn bên cạnh: 奶奶 (U1 lần 2), 叔叔 (U3 lần 2, tranh cắt từ ảnh trang 8)
    'ba': ('grandma', '奶奶', NVS + 'fam_bong_ba_a.webp'), 'chu': ('uncle', '叔叔', NVS + 'bb_sd3_chu_anh.webp'),
}
PHOTO_SD = 'sdl-anh-gia-dinh'   # khóa lưu ảnh con trên máy (tiền tố sdl- như tiến độ Seedling)

# ---------- Seedling U1 · "Hello! I'm…" (lẻ: an, sai, vai, xep) ----------
BT['SD'][1] = {
    'an': [(2, 'en', 'Leo', [22, 26, 25, 70]),          # áo mưa vàng, quay lưng, ba lô xanh
           (4, 'zh', 'Anna', [22, 27, 25, 64]),         # mũ hồng có hoa đỏ, quay lưng
           (6, 'en', 'Xiaomei', [22, 31, 24, 66]),      # hai búi tóc, áo đỏ, quay lưng
           (8, 'en', 'Bông', [49, 21, 19, 76]),         # Bông nấp dưới áo mưa của ông (quần bò, giày đỏ)
           (12, 'zh', 'Lan老师', [14, 30, 19, 62])],     # cô Lan ở cổng trường
    'sai': [(3, 'en', "Good morning, Mrs Lan! I'm Anna.", ['leo', 'anna']),
            (5, 'zh', 'Lan老师，早上好！我是Leo。', ['anna', 'leo']),
            (7, 'en', None, []),
            (9, 'zh', '早上好！我是……Bông的奶奶！', ['爷爷', '奶奶']),
            (12, 'en', 'Good morning, class! See you tomorrow!', [('Goodbye', '再见'), ('Good morning', '早上好')])],
    'vai': {'lan': ('Mrs Lan (hỏi tên)', NVS + 'nv_lan_a.webp', [(2, 'en'), (4, 'zh'), (6, 'en'), (8, 'zh'), (12, 'en')]),
            'ban': ('Các bạn và ông (nói tên)', NVS + 'kids_leo_a.webp', [(3, 'en'), (5, 'zh'), (7, 'en'), (9, 'zh'), (10, 'en')])},
    'xep': [(2, 'en', ['Good', 'morning!', "What's", 'your', 'name?']),
            (5, 'zh', ['Lan老师，', '早上好！', '我是', 'Anna。'], 'en'),    # nghe tiếng Anh, xếp tiếng Trung
            (7, 'en', ['Good', 'morning,', 'Mrs', 'Lan!', "I'm", 'Xiaomei.']),
            (10, 'zh', ['Lan老师，', '早上好！', '我是', 'Bông！']),
            (12, 'en', ['Goodbye,', 'class!', 'See', 'you', 'tomorrow!'])],
    'mine': [{'l': 'en', 'q': "What's your name?", 'half': "I'm…", 'cue': "I'm", 'vd': "I'm Bông!"},
             {'l': 'zh', 'q': '你叫什么名字？', 'half': '我是……', 'cue': '我是', 'vd': '我是Bông！'}],
    'frame': {'left': 55.4, 'top': 18.6, 'width': 35.8, 'height': 70.6}, 'photo_t': 'ảnh của con',
}

# ---------- Seedling U2 · "How Old Are You?" (chẵn: an, dien, vai, dich) ----------
BT['SD'][2] = {
    'an': [(1, 'en', 'cake', [38, 58, 22, 30]),          # bánh sinh nhật
           (3, 'zh', '七', [46, 58, 9, 20]),            # cây nến số 7 trên bánh
           (5, 'en', 'Xiaomei', [9, 11, 37, 88]),       # bạn bên trái, hai búi tóc, áo đỏ (Anna đứng bên phải)
           (8, 'zh', '哥哥', [52, 3, 35, 93]),          # anh trai áo xanh
           (11, 'en', 'grandpa', [34, 11, 36, 88])],    # ông ở giữa
    'dien': [(2, 'en', 'nine', ['nine', 'six', 'seven']),
             (4, 'zh', '七', ['六', '七', '八']),
             (6, 'en', 'six', ['seven', 'six', 'eight']),
             (8, 'zh', '哥哥', ['妈妈', '哥哥', '爷爷']),
             (13, 'en', 'birthday', ['birthday', 'morning', 'goodbye'])],
    'vai': {'hoi': ('Bạn hỏi tuổi', NVS + 'kids_leo_a.webp', [(1, 'en'), (3, 'zh'), (5, 'en'), (10, 'zh'), (12, 'en')]),
            'tra': ('Bạn nói tuổi', NVS + 'nv_vu_a.webp', [(2, 'en'), (4, 'zh'), (6, 'en'), (7, 'zh'), (11, 'en')])},
    'dich': [(4, 'en', [8, 9]), (8, 'zh', [4, 6]), (9, 'en', [1, 10]), (6, 'zh', [2, 8]), (13, 'en', [10, 14])],
    'mine': [{'l': 'en', 'q': 'How old are you?', 'half': "I'm…", 'cue': "I'm", 'vd': "I'm six!"},
             {'l': 'zh', 'q': '你几岁？', 'half': '我……', 'cue': '我', 'vd': '我六岁！'}],
    'frame': {'left': 62.0, 'top': 29.2, 'width': 31.4, 'height': 59.2}, 'photo_t': 'ảnh của con',
}

# ---------- Seedling U3 · "Who Is She?" (lẻ: an, sai, vai, xep) ----------
BT['SD'][3] = {
    'an': [(2, 'en', 'mother', [55, 28, 20, 50]),        # người phụ nữ áo dài hồng trong ảnh Leo cầm
           (4, 'zh', '哥哥', [49, 42, 12, 41]),          # cậu bé áo xanh trong ảnh
           (6, 'en', 'baby', [48, 50, 17, 33]),          # em bé áo vàng trong ảnh
           (8, 'zh', '叔叔', [52, 20, 24, 56]),          # chú áo cam cầm đèn lồng trong ảnh
           (12, 'en', 'family', [42, 30, 19, 17])],      # ảnh cả nhà trong hình trái tim
    'sai': [(3, 'en', 'She is my younger sister.', ['me', 'em_gai']),
            (5, 'zh', '他是我爸爸。', ['anh_trai', 'bo']),
            (7, 'en', None, []),
            (9, 'zh', '他是我爷爷。他是中国人。', ['叔叔', 'ong']),
            (11, 'en', "It's… you!", [('me', '我'), ('you', '你')])],
    'vai': {'ban': ('Bạn hỏi', NVS + 'kids_leo_a.webp', [(2, 'en'), (4, 'zh'), (6, 'en'), (8, 'zh'), (10, 'en')]),
            'bong': ('Bông (trả lời)', NVS + 'kids_bong_a.webp', [(3, 'en'), (5, 'zh'), (7, 'en'), (9, 'zh'), (11, 'en')])},
    'xep': [(3, 'en', ['She', 'is', 'my', 'mother.']),
            (5, 'zh', ['他', '是', '我', '哥哥。'], 'en'),
            (7, 'en', ['She', 'is', 'my', 'younger', 'sister.']),
            (9, 'zh', ['他', '是', '我', '叔叔。']),
            (12, 'en', ['I', 'love', 'my', 'family!'])],
    'mine': [{'l': 'en', 'q': 'Who is she?', 'half': 'She is my…', 'cue': 'She is my', 'vd': 'She is my mother.'},
             {'l': 'zh', 'q': '他是谁？', 'half': '他是我……', 'cue': '他是我', 'vd': '他是我爸爸。'}],
    'frame': {'left': 62.0, 'top': 40.6, 'width': 28.0, 'height': 46.8}, 'photo_t': 'ảnh gia đình',
}

# Lệnh ngắn bằng tiếng đích (2 câu đầu kèm lời dịch tiếng Việt), theo dạng bài
LENH = {
    'an': {'en': ('Look and touch.', 'Con nhìn rồi chạm nhé.'), 'zh': ('看一看，摸一摸。', 'Con nhìn rồi chạm nhé.')},
    'sai': {'en': ('Is it right?', 'Cô đọc đúng không?'), 'zh': ('对不对？', 'Cô đọc đúng không?')},
    'dien': {'en': ('Listen and choose.', 'Con nghe rồi chọn nhé.'), 'zh': ('听一听，选一选。', 'Con nghe rồi chọn nhé.')},
    'vai': {'en': ('Your turn!', 'Đến lượt con!'), 'zh': ('该你了！', 'Đến lượt con!')},
    'dich': {'en': ('Which one is the same?', 'Câu nào cùng nghĩa?'), 'zh': ('哪个一样？', 'Câu nào cùng nghĩa?')},
    'xep': {'en': ('Put the words in order.', 'Con xếp lại câu nhé.'), 'zh': ('排一排。', 'Con xếp lại câu nhé.')},
}
TEN_NGAY = {'an': 'Tìm trong tranh', 'sai': 'Cô đọc đúng không?', 'dien': 'Điền chỗ trống', 'vai': 'Con đóng vai', 'dich': 'Con phiên dịch', 'xep': 'Xếp câu'}
