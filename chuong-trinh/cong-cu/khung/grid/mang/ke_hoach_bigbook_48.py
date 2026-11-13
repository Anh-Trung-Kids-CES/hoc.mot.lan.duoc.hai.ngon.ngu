"""Kế hoạch dùng big book – Little Seed 48 và Seedling 48 (nguyên tắc vè ôn vòng chị duyệt 13/11/2026,
claude/NguyenTac_Ve_OnVong_1311.md mục 2; sửa quy tắc A5 trong claude/QuyTac_BigBook_Ve_Web.md).

Một nguồn duy nhất cho ba việc:
  1. Khởi động big book trên web: hát CẢ BÀI vè, mỗi lần một tiếng (chị chốt 13/11: bỏ "2 dòng").
     Lần 1 vè unit đang học (Anh) · lần 2 vè unit cách 2 (Trung) · lần 3 vè unit đang học (Trung) · lần 4 vè unit cách 3 (Anh).
     Mỗi vè cũ được ôn hai lần ở hai unit sau: một lần tiếng Trung (khi là "cách 2"), một lần tiếng Anh (khi là "cách 3").
     Chỉ ghi MÃ UNIT (+ đoạn dòng nếu là vè chào U1), không chép lời: build đọc lời vè hiện hành của unit đó.
  2. Mở buổi lớp: 2–3 phút một bài vè cũ (2–4 unit trước) + 3 phút flashcard cùng unit đó, ưu tiên từ không quay lại sau unit.
  3. Ngày ôn 98–99: mỗi big book: cả bài vè của chính unit đó → đọc lại một lượt → 1 câu hỏi, cả ba cùng một tiếng.

Chạy thẳng file này: in bảng kế hoạch (dùng để chép vào tài liệu Project, kịch bản buổi lớp).
"""

# Thứ tự unit trong khoá (Seedling 48: tuần 1–3 học U1 + U4 xen nhau, rồi U2, U3, U5…)
ORDER = {'LS': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
         'SD': [1, 4, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12]}

# Vè chào U1 Little Seed là hai bài trong một: dòng 0–5 chào đầu buổi, 6–9 chào cuối buổi (build_ls.py VE_U1).
# Seedling U1 là vè unit bình thường: cả bài.
CHAO = {'LS': {'dau': list(range(0, 6)), 'cuoi': list(range(6, 10))}, 'SD': {'dau': 'all', 'cuoi': 'all'}}
TIENG = {1: 'en', 2: 'zh', 3: 'zh', 4: 'en'}   # tiếng hát vè khởi động theo lần


def _truoc(kh, un, buoc):
    """Unit đứng trước un `buoc` vị trí trong khoá; None nếu chưa có."""
    o = ORDER[kh]; p = o.index(un) - buoc
    if kh == 'SD' and un in (1, 4):
        return None
    return o[p] if p >= 0 else None


def khoi_dong(kh, un):
    """{lần: (unit vè, 'all' hoặc [dòng], [tiếng])}. Cả bài vè, một tiếng mỗi lần (TIENG).
    Lần 1, 3: vè unit hiện tại; lần 2: unit cách 2; lần 4: unit cách 3. Unit đầu khoá: vè chào U1 (lần 2 chào đầu, lần 4 chào cuối)."""
    def cu(buoc, phan):
        u = _truoc(kh, un, buoc)
        if u is None or u == 1:
            return (1, CHAO[kh][phan])
        return (u, 'all')
    u2, d2 = cu(2, 'dau'); u4, d4 = cu(3, 'cuoi')
    return {1: (un, 'all', [TIENG[1]]), 2: (u2, d2, [TIENG[2]]), 3: (un, 'all', [TIENG[3]]), 4: (u4, d4, [TIENG[4]])}


def mo_buoi(kh, un, k):
    """Buổi thứ k (1–4) của unit: vè cũ + flashcard cùng unit đó. Lùi 2, 3, 4, 2 unit theo buổi."""
    lui = [2, 3, 4, 2][(k - 1) % 4]
    u = _truoc(kh, un, lui)
    if u is None:
        u = _truoc(kh, un, 1)   # đầu khoá: unit liền trước nếu có
    return u


# Từ không quay lại sau unit (ngay_quay_lai_sau_unit = 0, claude/DemTu_LS_SD48.csv) + từ báo cáo hội đồng còn thiếu.
# Flashcard mở buổi ưu tiên các từ này của unit được ôn.
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
VA_THEM = {'LS': 'he/she · 他/她, me, we, they, with, to, please, 哪儿, bath, horse, boy, girl',
           'SD': 'nhóm cơ thể U4 (đưa vào U8 con vật, U11 quần áo); vè lời đề: listen, look, point, tick, draw, colour, answer, question, page'}

# Ngày ôn cuối khoá: mỗi ngày 6 quyển; tiếng đọc xen kẽ Anh / Trung theo quyển, ngày 99 đổi lại để mỗi tiếng đều có
ON_CUOI = {'LS': {98: [1, 2, 3, 4, 5, 6], 99: [7, 8, 9, 10, 11, 12]},
           'SD': {98: [1, 4, 2, 3, 5, 6], 99: [7, 8, 9, 10, 11, 12]}}


def on_cuoi(kh, ngay):
    """[(unit, tiếng)]: tiếng dùng cho cả ba việc của quyển đó (vè cả bài, đọc lại, câu hỏi)."""
    us = ON_CUOI[kh][ngay]; lech = 0 if ngay == 98 else 1
    return [(u, ('en', 'zh')[(i + lech) % 2]) for i, u in enumerate(us)]


if __name__ == '__main__':
    for kh in ('LS', 'SD'):
        print(f'\n== {kh} – khởi động big book (unit vè, dòng, tiếng) ==')
        for un in ORDER[kh]:
            k = khoi_dong(kh, un)
            print(f'U{un}:', ' · '.join(f'lần {l}: U{u} {"cả bài" if d == "all" else "d" + str(d[0] + 1) + "–" + str(d[-1] + 1)} {"+".join(t)}' for l, (u, d, t) in k.items()))
        print(f'\n== {kh} – mở buổi lớp (vè cũ + flashcard cùng unit) ==')
        for un in ORDER[kh]:
            print(f'U{un}:', ', '.join(f'b{k}→U{mo_buoi(kh, un, k)}' for k in range(1, 5)))
        print(f'\n== {kh} – ôn 98–99 ==')
        for n in (98, 99):
            print(n, on_cuoi(kh, n))
