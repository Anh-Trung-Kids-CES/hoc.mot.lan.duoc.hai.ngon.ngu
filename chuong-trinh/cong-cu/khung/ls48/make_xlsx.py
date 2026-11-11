"""Xuất khung Little Seed 48 buổi ra Excel + CSV dạng tab của Sheet "Khung chương trình mỗi khoá".
Chạy: python3 -I make_xlsx.py <thư mục ra>
"""
import json, os, sys, csv
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
GRID = os.path.join(HERE, '..', 'grid')
OUT = sys.argv[1] if len(sys.argv) > 1 else HERE
d = json.load(open(os.path.join(GRID, 'mang', 'little-seed48.json')))
plan = json.load(open(os.path.join(GRID, 'mang', 'plan_little-seed.json')))
days, buoi = d['days'], d['buoi']
dmap = {x['ngay']: x for x in days}

wb = Workbook()
HEAD = Font(bold=True, color='FFFFFF')
FILL = PatternFill('solid', fgColor='2E7D32')
UFILL = [PatternFill('solid', fgColor=c) for c in ('F1F8E9', 'FFFFFF')]
WRAP = Alignment(wrap_text=True, vertical='top')

def sheet(title, header, data, widths):
    ws = wb.create_sheet(title)
    ws.append(header)
    for c in ws[1]:
        c.font, c.fill, c.alignment = HEAD, FILL, WRAP
    for r in data:
        ws.append(r)
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(i)].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row:
            c.alignment = WRAP
    ws.freeze_panes = 'B2'
    return ws

# 1. Tổng quan
ws = wb.active
ws.title = 'Tổng quan'
info = [
    ['Little Seed · khung chương trình offline 48 buổi · v2.4 (11/11/2026 – nguyên tắc 61–68, nội dung đã lên web 99 ngày)'],
    [''],
    ['Lớp', 'Lớp Little Seed offline, con 4–5 tuổi, chưa học PreB. Thiết kế độc lập với lớp Seedling 48 buổi; không đổi khung 9 khóa.'],
    ['Nhịp', d['nhip']],
    ['Số lượng', 'Buổi 0 khai giảng + 48 buổi × 90′ trên lớp, 99 ngày web, 26 tuần. Web luôn đi trước buổi lớp; buổi lớp dạy kỹ, sửa và mở rộng các ngày web vừa làm.'],
    ['Bố cục', 'Tuần 1–3: Unit 1 (ngày 1–9, buổi 1–3) theo mạng văn bản mới. Tuần 4–25: Unit 2–12, mỗi unit 8 ngày web (5 ngày Phần + 3 ngày Cả truyện) và 4 buổi (Introduce → Repeat + Introduce → Practice + Introduce → Produce). Tuần 26: ôn cả khóa, Album gia đình, buổi 48 mời phụ huynh.'],
    ['Lấy từ đâu', 'Unit 2–12 và buổi cuối dùng nguyên ô của khung 9 khóa (tab Little Seed, buổi 7–56) đánh số lại. Unit 1 dùng mạng văn bản trọn U1 (Bông\'s Day, 5 phần). Ô truyện có nhãn [Bản cũ] được thay khi viết truyện khung từng unit.'],
    ['Bỏ so với khung 9 khóa', '2 buổi mở khóa ôn PreB (buổi 1–2), 2 tuần ôn chặng (buổi 19–20, 37–38), 2 tuần lễ hội (buổi 57–60). Ôn chặng thay bằng 15′ trò chơi quét lại ở buổi Produce của Unit 4, 8, 12 (buổi 15, 31, 47) và Hộp ôn trên web. Lễ hội có thể chèn theo lịch thật, không tính vào 48 buổi.'],
    ['Từ PreB', 'Lớp chưa học PreB: từ PreB không có trong Little Seed được dạy lại ở unit cùng chủ đề, mức Nền (tranh + tiếng, nghe – chạm, chưa bắt nói). Xem tab "Từ PreB dạy lại". "Ôn (PreB)" của khung 9 khóa đổi thành "Nền PreB (dạy lại)".'],
    ['Sửa dữ liệu', 'Unit 5: "tyre" → bỏ (đã có tired), theo hướng sửa an toàn của tab Duyệt.'],
    ['Sửa v2.4 (11/11 tối)', 'Chị quyết: bỏ "Hello, day!" (không tự nhiên). Unit 1 dạy Good morning · 早上好 (ngày 1, thay từ day) và Good night · 晚安 (ngày 5, cuối truyện: "Good night, puppy!", "Good night, ___!"), cả hai tiếng, cạnh hello/goodbye. Big book U1 thêm trang Good night; vè tạm biệt dòng 5 "Good night! Goodbye, all!"; truyện U5 "Good morning! I am happy!".'],
    ['Sửa v2.3 (11/11 trưa)', 'Chị quyết: lớp offline Little Seed 48 có hiện chữ trên web (chữ Anh, chữ Hán, pinyin hiện sẵn, bấm "Aa Ẩn chữ" để ẩn) và có luyện thanh điệu: bước Mẹo âm ở 94 ngày web (U1–U2 thanh 1, 4; U3–U4 thêm thanh 2; từ U5 đủ 4 thanh; chỉ dùng từ con đã gặp). Chó của Bông gọi là Puppy · 小狗.'],
    ['Sửa v2.2 (11/11)', 'Truyện unit U2–U12 viết đủ theo chỉ tiêu 4 mặt (U4–U8, U10, U11 viết mới; U2, U3, U9, U12 theo bản 10/11), big book + vè mỗi unit, vè chào tuần 1–3 – tất cả đã lên web Little Seed 99 ngày (ô truyện, vè, big book ở tab Mạch từ và Khung buổi lấy từ bản trên web). Buổi 0 không có trên web.'],
    ['Sửa v2 (10/11 khuya)', 'Theo nguyên tắc 61–68: mỗi unit có chỉ tiêu 4 mặt cho truyện khung (tab "Chỉ tiêu 4 mặt", cột "Chỉ tiêu truyện" ở tab Mạch từ); truyện bản mới U2, U3, U9, U12 (chờ duyệt) thay ô truyện; vè mới U2, U3, U9, U12; chào đầu và cuối buổi bằng hai vè chào (buổi 0 = khai giảng (thêm, ngoài 48 buổi), hát câu 1–2; buổi 1 hát trọn); U1 không có big book câu chào.'],
    ['Web cho con 4–5 tuổi', 'Web không hiện chữ cho con (chỉ tranh, tiếng, lời dặn tiếng Việt); cô bật ?gv=1 thì thấy chữ. Mỗi ngày ≤5 bước, mỗi bài 5–10 câu, sai không chặn. Xem tab "Bước ngày web".'],
    [''],
    ['Em tự chọn, chờ chị duyệt'],
    ['1', 'Unit 1 chiếm trọn tuần 1–3 (9 ngày, 3 buổi) thay vì nén Greeting + Body như Seedling, vì con chưa biết tiếng Anh và cần làm quen lớp, lời lớp học.'],
    ['2', 'Không có tuần ôn chặng riêng (48 buổi chỉ đủ cho 12 unit × 4 buổi). Ôn chặng 15′ nằm trong buổi 15, 31, 47.'],
    ['3', 'Cô giáo trong truyện Little Seed là cô Hươu – cô giáo của web 21 ngày Little Seed, đã có sẵn nhiều tranh chào, tạm biệt cùng nét vẽ; Mrs Lan dạng người giữ cho Seedling. Cảnh còn thiếu được ghép từ nhân vật và nền có sẵn.'],
    ['4', 'Đếm 7–10 (PreB) nghe làm quen ở Unit 2 để Unit 12 "Đếm đến 10" là ôn; home ở Unit 7.'],
    ['5', 'Kế hoạch 90′ chia 7 khối, có 10′ nghỉ và làm tay ở giữa (con 4–5 tuổi); không khối nào quá 20′.'],
]
for r in info:
    ws.append(r)
ws['A1'].font = Font(bold=True, size=14)
ws['A13'].font = Font(bold=True)
ws.column_dimensions['A'].width = 24
ws.column_dimensions['B'].width = 140
for row in ws.iter_rows():
    for c in row:
        c.alignment = WRAP

# 2. Khung 48 buổi
data = []
for b in buoi:
    u = b['unit']
    data.append([b['buoi'], b['tuan'], b['thu'], f'U{u}' if isinstance(u, int) else u, b['vai'],
                 ', '.join(map(str, b['ngay_web'])), b['label'],
                 b['lop']['en']['flash'], b['lop']['zh']['flash'], b.get('chao', ''), b['lop']['en']['baihat'][:1500], b.get('chi_tieu', ''), b['nguon']])
sheet('Khung 48 buổi', ['Buổi', 'Tuần', 'Thứ', 'Unit', 'Vai I-R-P-P', 'Ngày web trước buổi', 'Nội dung buổi',
                        'Flash EN', 'Flash ZH', 'Chào đầu / cuối buổi', 'Bài hát / vè', 'Chỉ tiêu (vè, big book, hiện trạng)', 'Nguồn'], data, [6, 6, 9, 6, 18, 12, 50, 35, 35, 50, 60, 50, 22])

# 3. Mạch từ theo ngày
data = []
for x in days:
    b = next(bb['buoi'] for bb in buoi if x['ngay'] in bb['ngay_web'])
    data.append([x['ngay'], x['tuan'], f'U{x["unit"]}' if isinstance(x['unit'], int) else x['unit'], x['loai'], b, x['label'],
                 x['en']['tu'], x['zh']['tu'], x['en']['cum'], x['zh']['cum'], x['en']['truyen'], x['zh']['truyen'], x.get('chi_tieu', ''), x['nguon']])
sheet('Mạch từ theo ngày', ['Ngày', 'Tuần', 'Unit', 'Loại ngày', 'Trước buổi', 'Tên ngày', 'Từ EN', 'Từ ZH', 'Cụm EN', 'Cụm ZH',
                            'Truyện EN', 'Truyện ZH', 'Chỉ tiêu truyện (ng.t. 62)', 'Nguồn'], data, [6, 6, 6, 10, 8, 40, 45, 45, 30, 30, 60, 60, 50, 18])

# 4. Kế hoạch 90 phút
sheet('Kế hoạch 90 phút', ['Buổi', 'Unit', 'Vai', 'Kế hoạch 7 khối'],
      [[b['buoi'], b['unit'], b['vai'], b['ke_hoach_90']] for b in buoi], [6, 6, 18, 160])

# 5. Truyện khung theo unit
data = []
for u in plan:
    t1 = [v for v in u['van_ban'] if v['id'] == 'T1'][0]
    first = [x['ngay'] for x in days if x['unit'] == int(u['unit'])]
    for ph in t1['phan']:
        data.append([u['unit'], u['chu_de'], f'{t1["ten_en"]} · {t1["ten_zh"]}', ph['phan'],
                     first[ph['phan'] - 1] if ph['phan'] - 1 < len(first) else '', ph['y'], ', '.join(ph['tu_moi_vao']),
                     t1.get('khung_en', ''), t1.get('khung_zh', '')])
sheet('Truyện khung theo unit', ['Unit', 'Chủ đề', 'Truyện khung', 'Phần', 'Ngày web', 'Ý của phần', 'Từ mới vào', 'Khung EN', 'Khung ZH'],
      data, [6, 40, 36, 6, 9, 70, 30, 30, 30])

# 5b. Chỉ tiêu 4 mặt (chi_tieu_48.py)
_ct = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'grid', 'mang', 'chi_tieu_48.json')
if os.path.exists(_ct):
    CTR = [x for x in json.load(open(_ct)) if x['lop'] == 'Little Seed 48']
    sheet('Chỉ tiêu 4 mặt', ['Unit', 'Chủ đề', 'Ngày web', 'Buổi', 'EN chữ/phần', 'EN chữ/câu', 'Lượt nói', 'Khung, cấu trúc', 'ZH chữ Hán/phần', 'ZH chữ/câu',
                             'Mẫu câu cũ dùng lại', 'Vè', 'Big book', 'Hiện trạng', 'Việc cần làm'],
          [[x[k] for k in ('unit', 'chu_de', 'ngay_web', 'buoi', 'en_chu_phan', 'en_chu_cau', 'lien', 'cau_truc', 'zh_chu_phan', 'zh_chu_cau', 'mau_cu', 've', 'big_book', 'hien_trang', 'viec')] for x in CTR],
          [6, 16, 9, 12, 10, 9, 14, 40, 12, 9, 40, 40, 32, 48, 14])

# 6. Từ PreB dạy lại
data = []
for u, ws_ in d['preb_day_lai'].items():
    n = next(x['ngay'] for x in days if str(x['unit']) == str(u))
    data.append([f'U{u}', ', '.join(ws_), n, 'Nền: tranh + tiếng, nghe – chạm, chưa bắt nói; gặp lại trong ô Ôn các ngày sau'])
data.append(['Buổi 1', 'sit down, stand up (+ yes, no)', '–', 'Lời lớp học cô dạy ở buổi 1: Sit down, please. / Stand up! ↔ 请坐。/ 起立！'])
sheet('Từ PreB dạy lại', ['Unit', 'Từ PreB', 'Ngày web đầu', 'Cách dạy'], data, [8, 40, 12, 80])

# 7. Bước ngày web
steps = [
    ['Ngày Phần (1–5 mỗi unit)', 'Thẻ từ (tranh + tiếng Anh + tiếng Trung, 5–8 thẻ, có thẻ ôn và thẻ Nền PreB) → Nghe truyện (phần của ngày, nghe lại phần trước, không hiện chữ) → Nghe – chạm tranh (5–8 câu) → Nói theo (câu nhân vật, 5 câu, micro) → Vận động (nghe từ, quay đầu chọn tranh)'],
    ['Ngày Cả truyện', 'Nghe cả truyện → Trả lời câu hỏi bằng chạm tranh → Nói theo / Phiên dịch nhí (Leo nói, con nói cho Xiaomei) → Gọi lại từ trong Hộp ôn → Vận động'],
    ['Ngày ôn unit / cả khóa', 'Nghe big book / bài hát → Nghe – chạm tranh trộn unit → Gọi lại (Hộp ôn) → Vận động'],
    ['Luật chung', 'Mỗi ngày ≤5 bước, khoảng 10–12 phút; mỗi bài 5–10 câu; sai không chặn, gặp lại ở dạng khác hoặc cuối bài; lời dặn và khen bằng giọng tiếng Việt; không hiện chữ cho con (cô thêm ?gv=1 để thấy chữ).'],
]
sheet('Bước ngày web', ['Loại ngày', 'Thứ tự bước'], steps, [24, 150])

# 8. Dạng tab Sheet 9 khóa (một dòng mỗi ngày web, cột lớp ở dòng ngày cuối trước buổi)
SHEET_HDR = [['', 'Nội dung đẩy lên web'] + [''] * 10 + ['Nội dung dạy trên lớp'] + [''] * 7 + ['Kế hoạch 90 phút'],
             ['', 'Tiếng Anh', '', '', '', '', 'Tiếng Trung', '', '', '', '', '', 'Tiếng Anh', '', '', '', 'Tiếng Trung', '', '', '', ''],
             ['', 'Từ', 'Cụm từ', 'Câu', 'Truyện', 'Video', 'Từ', 'Cụm từ', 'Câu', 'Truyện', 'Video', '',
              'Flash card', 'Slide có bài tập tương tác', 'Truyện', 'Bài hát', 'Flash card', 'Slide có bài tập tương tác', 'Truyện', 'Bài hát', '7 khối']]
grid_rows = []
for b in buoi:
    if not b['ngay_web']:
        grid_rows.append([b['label']] + [''] * 11 + [b['label']] + [b['lop']['en'][k] for k in ('flash', 'slide', 'truyen', 'baihat')] + [b['lop']['zh'][k] for k in ('flash', 'slide', 'truyen', 'baihat')] + [b['ke_hoach_90']])
    for n in b['ngay_web']:
        x = dmap[n]
        r = [x['label']] + [x['en'][k] for k in ('tu', 'cum', 'cau', 'truyen', 'video')] + [x['zh'][k] for k in ('tu', 'cum', 'cau', 'truyen', 'video')]
        if n == b['ngay_web'][-1]:
            r += [b['label']] + [b['lop']['en'][k] for k in ('flash', 'slide', 'truyen', 'baihat')] + [b['lop']['zh'][k] for k in ('flash', 'slide', 'truyen', 'baihat')] + [b['ke_hoach_90']]
        grid_rows.append(r)
ws = wb.create_sheet('Dạng tab Sheet')
for r in SHEET_HDR + grid_rows:
    ws.append(r)
for i in range(1, 22):
    ws.column_dimensions[get_column_letter(i)].width = 40
for row in ws.iter_rows():
    for c in row:
        c.alignment = WRAP
ws.freeze_panes = 'B4'

xlsx = os.path.join(OUT, 'LittleSeed_KhungChuongTrinh_48buoi_v2.xlsx')
wb.save(xlsx)
with open(os.path.join(OUT, 'little-seed48-sheet.csv'), 'w', newline='') as f:
    w = csv.writer(f)
    for r in SHEET_HDR + grid_rows:
        w.writerow([str(c)[:49000] for c in r])
print(xlsx)
