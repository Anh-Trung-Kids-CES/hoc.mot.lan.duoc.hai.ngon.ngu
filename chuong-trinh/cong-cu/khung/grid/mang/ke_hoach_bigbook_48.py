"""Kế hoạch dùng big book – Little Seed 48 và Seedling 48 (cập nhật 13/11/2026, sau khi chị tách vè khỏi big book lúc 10:00
và chốt lúc 10:50: web không ôn vè của unit khác, ôn vè cũ nằm ở buổi offline). Tài liệu: claude/KeHoach_DungBigBook_1311.md.

  1. Khởi động big book trên web: KHÔNG có vè. Lần 1 nghe tên các bạn; lần 2 nghe lại 3 trang đầu; lần 3 nghe lại 2 trang đầu;
     lần 4 nghe nhanh cả quyển (tiếng Anh). (build_ls.py bbve_unit, bb-ve.js warm)
  2. Buổi offline: warm-up và farewell hát được nhiều vè, bài hát con thích, miễn là thuộc nhóm đã học (kho_da_hoc).
     mo_buoi chỉ là GỢI Ý xoay vòng để không vè nào bị quên hẳn, kèm 3 phút flashcard của unit đó.
  3. Ngày ôn 98–99: mỗi big book đọc lại một lượt, một tiếng, + 1 câu hỏi cùng tiếng; không kèm vè.

Chạy thẳng file này: in bảng gợi ý buổi offline và lịch ngày ôn.
"""

# Thứ tự unit trong khoá (Seedling 48: tuần 1–3 học U1 + U4 xen nhau, rồi U2, U3, U5…)
ORDER = {'LS': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
         'SD': [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]}

KHOI_DONG = {1: 'nghe tên các bạn trong truyện', 2: 'nghe lại 3 trang đầu', 3: 'nghe lại 2 trang đầu', 4: 'nghe nhanh cả quyển (tiếng Anh)'}


def _truoc(kh, un, buoc):
    """Unit đứng trước un `buoc` vị trí trong khoá; None nếu chưa có (SD U1, U4 là khối đầu khoá)."""
    o = ORDER[kh]; p = o.index(un) - buoc
    if kh == 'SD' and un in (1, 4):
        return None
    return o[p] if p >= 0 else None


def kho_da_hoc(kh, un):
    """Các unit con đã học xong trước unit un: vè, bài hát của chúng đều dùng được ở warm-up, farewell."""
    o = ORDER[kh]; return o[:o.index(un)]


def mo_buoi(kh, un, k):
    """GỢI Ý cho buổi thứ k (1–4) của unit: một vè cũ chắc chắn có mặt + flashcard unit đó; lùi 2, 3, 4, 2 unit."""
    lui = [2, 3, 4, 2][(k - 1) % 4]
    u = _truoc(kh, un, lui)
    if u is None:
        u = _truoc(kh, un, 1)   # đầu khoá: unit liền trước nếu có
    return u


# Từ không quay lại sau unit (ngay_quay_lai_sau_unit = 0, claude/DemTu_LS_SD48.csv) + từ báo cáo hội đồng còn thiếu.
# Flashcard ở buổi offline ưu tiên các từ này của unit được ôn.
KHONG_QUAY_LAI = {
    'LS': {1: ('teacher, good night, girl, boy', '老师, 晚安'),
           2: ('name, how old', '名字'),
           3: ('grandpa, grandma, little sister, big sister, little brother, family, baby', '爷爷, 奶奶, 妹妹, 姐姐, 宝宝, 家人'),
           4: ('mouth, nose, ears, hands, feet', '嘴巴, 耳朵, 手, 脚'),
           5: ('hungry, scared, angry, feel', '困, 害怕, 生气'),
           6: ('pen, schoolbag, ruler, pencil case, desk', '笔, 书包, 新, 尺子, 笔袋'),
           7: ('window, bath, under', '下, 床'),
           8: ('fish, swim, rabbit, mouse, frog, horse', '鸟, 游泳, 兔子, 老鼠'),
           9: ('picnic, banana, pizza, rice, water', '野餐, 吃, 香蕉, 比萨, 喝'),
           10: ('hot, windy, rainy, snowy, cold, weather', '热, 刮风, 下雨, 下雪, 冷, 天气'),
           11: ('yellow, blue, green, orange, rainbow', '黄色, 蓝色, 绿色, 橙色, 彩虹'),
           12: ('how many, cake', '几, 个, 只')},
    'SD': {1: ('one man, see you tomorrow', '您好, 明天见'),
           4: ('arm, toe, knee, shoulder', '胳膊, 腿, 手指, 脚趾, 肩膀'),
           2: ('is bigger than, nine, seven', '大于, 小于'),
           3: ('girl, older, younger, Chinese', '女孩, 中国人, 越南人'),
           5: ('thirsty, close your eyes', '闭, 渴'),
           6: ('those, letter, scissors', '那些, 剪刀'),
           7: ('bedroom, dining room', '卧室, 餐厅'),
           8: ('tall, boat', '船, 高'),
           9: ('ice cream, burger, it looks nice', '冰淇淋, 汉堡, 好吃, 看起来'),
           10: ('coat, scarf, umbrella, cloudy', '帽子, 围巾, 雨伞, 多云'),
           11: ('trousers, jeans, socks', '裤子, 袜子'),
           12: ('people, pairs of shoes', '人, 双')}}

# Ngày ôn cuối khoá: mỗi ngày 6 quyển; mỗi quyển một tiếng (đọc lại + 1 câu hỏi), xen kẽ theo quyển, ngày 99 đổi lại
ON_CUOI = {'LS': {98: [1, 2, 3, 4, 5, 6], 99: [7, 8, 9, 10, 11, 12]},
           'SD': {98: [1, 4, 2, 3, 5, 6], 99: [7, 8, 9, 10, 11, 12]}}


def on_cuoi(kh, ngay):
    """[(unit, tiếng)] cho ngày ôn 98 hoặc 99."""
    us = ON_CUOI[kh][ngay]; lech = 0 if ngay == 98 else 1
    return [(u, ('en', 'zh')[(i + lech) % 2]) for i, u in enumerate(us)]


if __name__ == '__main__':
    for kh in ('LS', 'SD'):
        print(f'\n== {kh} – buổi offline: gợi ý vè cũ + flashcard (ngoài ra hát thêm bất kỳ vè, bài hát nào trong nhóm đã học) ==')
        for un in ORDER[kh]:
            print(f'U{un}:', ', '.join(f'b{k}→U{mo_buoi(kh, un, k)}' for k in range(1, 5)), '| đã học:', kho_da_hoc(kh, un))
        print(f'\n== {kh} – ôn 98–99 ==')
        for n in (98, 99):
            print(n, on_cuoi(kh, n))
