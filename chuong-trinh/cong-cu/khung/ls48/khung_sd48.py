"""Khung Seedling offline 48 buổi v8 (11/11/2026) – dựng lại từ dữ liệu web 99 ngày (seedling/seedling-data.js, sinh từ Excel v7)
và thêm nguyên tắc 61–68: chỉ tiêu 4 mặt theo unit (bậc cầu tuần 1–3, U2, U3), buổi 0 khai giảng, vè chào, việc cần sửa từng unit.
Excel v7 gốc nằm trong chat "Web bài tập cho trẻ 5-8 tuổi" (06/11), không có trong repo; nội dung từ, truyện, buổi của v7 đã vào seedling-data.js.
Ra: ls48/Seedling_KhungChuongTrinh_48buoi_v8.xlsx, grid/mang/seedling48-v8-sheet.csv
Chạy ở thư mục gốc repo: python3 -I chuong-trinh/cong-cu/khung/ls48/khung_sd48.py
"""
import json, os, re, csv, subprocess
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
MANG = os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/')
raw = subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))',
                      os.path.join(ROOT, 'seedling/seedling-data.js')], capture_output=True, text=True, check=True).stdout
SD = json.loads(raw)
CT = [x for x in json.load(open(MANG + 'chi_tieu_48.json')) if x['lop'] == 'Seedling 48']
CTU = {}
for x in CT:
    for u in x['unit'].split('+'):
        CTU[u] = x
WHO = {k: v[0] for k, v in SD.get('who', {}).items()} if isinstance(SD.get('who'), dict) else {}

def scenes_text(sc, l):
    return ' '.join(f"{WHO.get(s.get('who'), s.get('who', ''))}: {s.get(l, '')}" for s in sc if s.get(l))

days = []
for k in sorted(SD['days'], key=int):
    d = SD['days'][k]; st = d['steps']
    the = next((s for s in st if s['type'] == 'the'), {})
    tr = next((s for s in st if s['type'] == 'truyen' and s.get('scenes')), None)
    c = CTU.get(str(d.get('unit')))
    days.append([int(k), d.get('week', ''), d.get('unit', ''), d.get('kind', ''), d.get('part', ''), d.get('t', ''), d.get('goal', ''),
                 ', '.join(x['en'] for x in the.get('cards', [])), ', '.join(f"{x['zh']} {x.get('py', '')}" for x in the.get('cards', [])),
                 (tr or {}).get('title', ''), scenes_text(tr['scenes'], 'en') if tr else '', scenes_text(tr['scenes'], 'zh') if tr else '',
                 ' → '.join(s['type'] for s in st),
                 (f"EN {c['en_chu_phan']} chữ, ~{c['en_chu_cau']} chữ/câu; ZH {c['zh_chu_phan']}, ~{c['zh_chu_cau']} chữ/câu; {c['lien']}; cấu trúc: {c['cau_truc']}"
                  if c and d.get('kind') == 'Phần' else '')])

VE_CHAO = 'Vè chào đầu buổi (6 dòng, tên – tuổi gọi vòng lớp) và vè chào cuối buổi (4 dòng) như lớp Little Seed, theo nguyên tắc 65–66'
buoi = [[0, 'Khai giảng', '–', 'Buổi 0. Khai giảng (ngoài 48 buổi): làm quen cô Lan, bạn, lớp; hát câu 1–2 của hai vè chào, con nhại theo, động tác cố định; hướng dẫn ba mẹ mở web, mã con, nhóm Zalo.',
         'hello, good morning, Mrs Lan, goodbye (chỉ nghe)', '', 'Câu 1–2 hai vè chào', 'Nguyên tắc 66–67; chị quyết 11/11']]
for k in sorted(SD['lop'], key=int):
    L = SD['lop'][k]
    u = re.search(r'U(\d+)', L['t'])
    c = CTU.get(u.group(1)) if u else None
    chao = ('Sau buổi 0 và ngày web 1–3: hát trọn hai vè chào. ' if k == '1' else 'Đầu và cuối buổi: ') + VE_CHAO
    buoi.append([int(k), L['t'].split('·', 1)[-1].strip(), ', '.join(map(str, L.get('days', []))), L.get('about', ''), ' · '.join(L.get('prep', [])),
                 ' | '.join(L.get('wb', [])), chao, (f"Vè unit: {c['ve']}. Big book: {c['big_book']}" if c else '')])

wb = Workbook(); ws = wb.active; ws.title = 'Tổng quan'
for r in [['Seedling · khung chương trình offline 48 buổi · v8 (11/11/2026)'], [''],
          ['Lớp', 'Lớp Seedling offline, con 5–7 tuổi, đã có chút tiếng Anh, chưa học Little Seed. Không đổi khung 9 khóa.'],
          ['Nguồn', 'v8 = nội dung v7 (bộ từ, thứ tự unit, truyện, buổi – lấy từ dữ liệu web 99 ngày seedling-data.js, sinh từ Excel v7) + nguyên tắc 61–68 chị duyệt 10–11/11. File Excel v7 gốc nằm trong chat "Web bài tập cho trẻ 5-8 tuổi" (06/11).'],
          ['Sửa v8', 'Thêm buổi 0 khai giảng (ngoài 48 buổi). Chào đầu/cuối buổi bằng hai vè chào. Chỉ tiêu 4 mặt cho truyện mỗi unit (tab "Chỉ tiêu 4 mặt"): bậc cầu tuần 1–3 (Greeting + Body) 25 chữ/3 chữ câu, U2 28/3,5, U3 31/3,5, U5→U12 35→55, 4→5,5 (nguyên tắc 62d, chị duyệt 11/11). Truyện hiện có trên web còn ngắn hơn chỉ tiêu – cột "Việc cần làm".'],
          ['Còn phải làm', 'Viết lại truyện U2–U12 theo chỉ tiêu (dài hơn, câu dài hơn, nối hội thoại, dùng lại mẫu câu cũ, có cốt truyện); viết vè mới theo công thức 65; đổi big book U1 sang chào + tự giới thiệu tên; dựng lại web.']]:
    ws.append(r)
ws['A1'].font = Font(bold=True, size=14); ws.column_dimensions['A'].width = 18; ws.column_dimensions['B'].width = 140
for row in ws.iter_rows():
    for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')

def sheet(t, h, rows, w):
    s = wb.create_sheet(t); s.append(h)
    for c in s[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='2F7D4F')
    for r in rows: s.append(r)
    for i, x in enumerate(w, 1): s.column_dimensions[get_column_letter(i)].width = x
    for row in s.iter_rows(min_row=2):
        for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')
    s.freeze_panes = 'B2'

HB = ['Buổi', 'Unit · vai', 'Ngày web trước buổi', 'Nội dung buổi', 'Ba mẹ ôn trước buổi', 'Sách bài tập', 'Chào đầu / cuối buổi', 'Vè, big book (ng.t. 65–66)']
sheet('Khung 48 buổi + buổi 0', HB, buoi, [6, 26, 12, 60, 40, 30, 40, 50])
HD = ['Ngày', 'Tuần', 'Unit', 'Loại', 'Phần', 'Tên ngày', 'Mục tiêu', 'Từ EN', 'Từ ZH', 'Truyện', 'Truyện EN (web hiện tại)', 'Truyện ZH (web hiện tại)', 'Bước', 'Chỉ tiêu truyện (ng.t. 62)']
sheet('Mạch từ theo ngày', HD, days, [6, 6, 6, 9, 8, 36, 36, 30, 30, 22, 60, 60, 36, 50])
KEYS = ['unit', 'chu_de', 'truyen', 'ngay_web', 'buoi', 'en_chu_phan', 'en_chu_cau', 'lien', 'cau_truc', 'zh_chu_phan', 'zh_chu_cau', 'mau_cu', 've', 'big_book', 'hien_trang', 'viec']
sheet('Chỉ tiêu 4 mặt', ['Unit', 'Chủ đề', 'Truyện', 'Ngày web', 'Buổi', 'EN chữ/phần', 'EN chữ/câu', 'Lượt nói', 'Cấu trúc', 'ZH chữ Hán/phần', 'ZH chữ/câu',
                         'Mẫu câu cũ', 'Vè', 'Big book', 'Hiện trạng', 'Việc cần làm'], [[x.get(k, '') for k in KEYS] for x in CT],
      [7, 18, 22, 9, 12, 10, 9, 14, 48, 12, 10, 40, 40, 30, 48, 30])
out = os.path.join(os.path.dirname(__file__), 'Seedling_KhungChuongTrinh_48buoi_v8.xlsx'); wb.save(out)
with open(MANG + 'seedling48-v8-sheet.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(HD)
    for r in days: w.writerow([str(x)[:49000] for x in r])
    w.writerow([]); w.writerow(HB)
    for r in buoi: w.writerow([str(x)[:49000] for x in r])
print(out, len(days), 'ngày', len(buoi), 'buổi')
