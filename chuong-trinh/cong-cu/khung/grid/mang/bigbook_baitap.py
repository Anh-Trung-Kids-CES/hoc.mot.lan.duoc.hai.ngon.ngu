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
