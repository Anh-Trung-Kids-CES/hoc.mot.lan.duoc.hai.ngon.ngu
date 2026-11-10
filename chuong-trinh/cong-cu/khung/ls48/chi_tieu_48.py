"""Chỉ tiêu 4 mặt theo unit cho hai lớp offline 48 buổi (Little Seed, Seedling) – nguyên tắc 61–68 (10/11/2026).
Đặt mức cho truyện khung từng unit (chữ mỗi phần, chữ mỗi câu, lượt nói liền, cấu trúc; hai tiếng), mẫu câu cũ phải dùng lại,
yêu cầu vè/chào/dạy trước, rồi so với truyện đang có (Seedling: seedling/seedling-data.js; Little Seed: bản đã viết).
Ra: grid/mang/chi_tieu_48.json, chi_tieu_48.csv (nhập Sheet), ChiTieu4Mat_LS48_SD48.xlsx.
Chạy ở thư mục gốc repo: python3 -I chuong-trinh/cong-cu/khung/ls48/chi_tieu_48.py
"""
import json, os, re, csv, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
MANG = os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/')
OUT = os.path.dirname(__file__)

def r(x):
    return int(x + 0.5)

# ---------- Little Seed 48 ----------
LS = json.load(open(MANG + 'little-seed.json'))
LS48 = json.load(open(MANG + 'little-seed48.json'))
ngay = {}
for d in LS48['days']:
    ngay.setdefault(d['unit'], []).append(d['ngay'])
buoi = {}
for b in LS48['buoi']:
    if isinstance(b['unit'], int):
        buoi.setdefault(b['unit'], []).append(b['buoi'])
# Hiện trạng truyện khung Little Seed (đo trên bản đã viết; các unit khác mới có ý kế hoạch)
LS_HT = {1: 'Đã có (mạng U1): 10–12 chữ/phần, ~2,5 chữ/câu. Cần sửa P2–P3 thêm hỏi tên, tuổi (đề xuất 10/11).',
         2: 'Bản thử 10/11 (ThuNghiem_LS_U2U3): 15–16 chữ/phần – đạt.', 3: 'Bản thử 10/11: 15–18 chữ/phần – đạt; P4–P5 hơi dày từ mới, P5 khung 2/5.',
         9: 'Bản mới 10/11 (TruyenUnit_U9_BanMoi): 21–26 chữ/phần, 2,5 chữ/câu – đạt. Web ngày 66–73 còn bản cũ.',
         12: 'Bản mới 10/11 (TruyenUnit_U12_BanMoi): 25–29 chữ/phần, 2,5 chữ/câu – đạt.'}
LS_CT = {1: 'Hello/Goodbye ___; What\'s your name? (nghe làm quen qua vè)', 2: 'What\'s your name? – My name is ___; How old are you? – I\'m ___',
         3: 'Who is he/she? – He/She is my ___', 4: 'I have ___; Touch your ___; big/small', 5: 'I am ___; How do you feel?',
         6: 'What is this? – This is a ___; Look!', 7: 'Where is ___? – On/Under the ___; Thank you', 8: '___ can ___ / can\'t',
         9: 'What do you like? – I like ___; I eat/drink ___', 10: 'It is ___ today; Let\'s play in the park',
         11: 'What colour is it? – It\'s ___', 12: 'How many ___? – ___ ___s!; 个/只/两'}
rows_ls = []
for i, u in enumerate(LS):
    n = int(u['unit'])
    lo = r(10 + 1.4 * (n - 1)); zlo = r(13 + 2.4 * (n - 1))
    cau = '2' if n <= 4 else ('2,5' if n <= 8 else '2,5–3')
    han = '3' if n <= 4 else ('3,5' if n <= 8 else '3,5–4')
    cu = [LS[k]['khung_cau']['en'] for k in range(i)]
    rows_ls.append({
        'lop': 'Little Seed 48', 'unit': n, 'chu_de': u['chu_de'].split('–')[0].strip(), 'ngay_web': f"{min(ngay[n])}–{max(ngay[n])}",
        'buoi': ', '.join(map(str, buoi.get(n, []))),
        'en_chu_phan': f'{lo}–{lo + 5}', 'en_chu_cau': cau, 'lien': '1 hỏi – 1 đáp (2 lượt)', 'cau_truc': LS_CT[n],
        'zh_chu_phan': f'{zlo}–{zlo + 7}', 'zh_chu_cau': han,
        'mau_cu': ' · '.join(cu[-3:]) if cu else '— (unit đầu; câu vè chào là nền)',
        've': ('Vè chào đầu + chào cuối buổi (đã duyệt hướng 10/11); khai giảng hát câu 1–2 mỗi bài; buổi 2 hát trọn' if n == 1 else
               'Vè 4 dòng × 4 phách, vần AABB, gọi – đáp vòng lớp có tên con; từ trong vè dạy trước theo 67'),
        'big_book': 'Không làm big book câu chào (66): big book U1 = tên và tuổi của các bạn' if n == 1 else 'Khung một ô, chuỗi xích, trang cuối có tên con',
        'hien_trang': LS_HT.get(n, 'Chưa viết truyện khung (mới có ý kế hoạch trong khung). Viết mới theo chỉ tiêu.'),
    })

# ---------- Seedling 48 ----------
raw = subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))',
                      os.path.join(ROOT, 'seedling/seedling-data.js')], capture_output=True, text=True, check=True).stdout
SD = json.loads(raw)
W = lambda s: re.findall(r"[A-Za-z']+", s or '')
H = lambda s: len(re.findall(r'[一-鿿]', s or ''))
def do(units):
    parts = []
    for k, d in SD['days'].items():
        if d.get('unit') in units and d.get('kind') == 'Phần':
            for s in d['steps']:
                if s['type'] == 'truyen' and s.get('scenes'):
                    parts.append(s['scenes']); break
    if not parts: return None
    en = [sum(len(W(x['en'])) for x in p) for p in parts]; zh = [sum(H(x['zh']) for x in p) for p in parts]
    se = [s for p in parts for x in p for s in re.split(r'(?<=[.!?])\s+', x['en'] or '') if W(s)]
    sz = [s for p in parts for x in p for s in re.split(r'(?<=[。！？])', x['zh'] or '') if H(s)]
    return {'en': f'{min(en)}–{max(en)}', 'cau': round(sum(len(W(s)) for s in se) / len(se), 1),
            'zh': f'{min(zh)}–{max(zh)}', 'han': round(sum(map(H, sz)) / len(sz), 1)}
# Thứ tự dạy của lớp Seedling 48 (map web): tuần 1–3 Greeting + Body là bậc cầu 1; U2, U3 bậc cầu 2–3; U5–U12 vào thang 35 → 55
SDU = [('1+4', 'Greeting + Body', ['1', '4'], 'Tuần 1–3'), ('2', 'Name and age', ['2'], 'Unit 2'), ('3', 'Family', ['3'], 'Unit 3'),
       ('5', 'Feelings', ['5'], 'Unit 5'), ('6', 'School things', ['6'], 'Unit 6'), ('7', 'Home', ['7'], 'Unit 7'), ('8', 'Animals', ['8'], 'Unit 8'),
       ('9', 'Food', ['9'], 'Unit 9'), ('10', 'Weather', ['10'], 'Unit 10'), ('11', 'Clothes and colours', ['11'], 'Unit 11'), ('12', 'Party and time', ['12'], 'Unit 12')]
CAU_TRUC_SD = {
    '1+4': 'EN: What\'s your name?, câu mệnh lệnh (Sit down, Touch your…), has got (I\'ve got two…) · ZH: 你好吗, 叫什么, 有, 是…吗',
    '2': 'EN: How old are you? I\'m ___ (years old), and · ZH: 几岁, 是…吗, 和',
    '3': 'EN: Who is he/she?, sở hữu \'s (Anna\'s brother), has got · ZH: 谁, 的, 有',
    '5': 'EN: I\'m ___ / Are you ___?, but · ZH: 很, 吗, 不',
    '6': 'EN: This is my ___, there is/are, Look at the ___! · ZH: 这是, 有, 什么',
    '7': 'EN: Where is the ___?, in/on/under/next to/behind/between · ZH: 在哪儿, 在…上/下/旁边',
    '8': 'EN: Can a ___ hop? can/can\'t, hiện tại tiếp diễn (The frog is hopping) · ZH: 能, 在',
    '9': 'EN: Do you like ___?, like + V-ing, has got, there are · ZH: 喜欢…吗, 想',
    '10': 'EN: It\'s ___ today, hiện tại tiếp diễn (It\'s raining), Let\'s… · ZH: 今天, 很',
    '11': 'EN: What colour is it?, Colour the ___!, Where are my ___? · ZH: 什么颜色, 的',
    '12': 'EN: How many ___ are there? There are ___, số 11–20, can · ZH: 有几个, 几',
}
BAC = {'1+4': (25, 3, '2', 30, 3.5), '2': (28, 3.5, '2–3', 33, 3.5), '3': (31, 3.5, '3', 37, 4.0)}
rows_sd = []
for j, (k, ten, us, nhan) in enumerate(SDU):
    if k in BAC:
        en, cau, lien, zh, han = BAC[k]; en_s = f'{en}–{en + 4}'; zh_s = f'{zh}–{zh + 6}'; cau_s = str(cau).replace('.', ','); han_s = str(han).replace('.', ',')
    else:
        i = j - 3; t = r(35 + 20 * i / 7); tz = r(40 + 20 * i / 7)
        en_s = f'{t}–{t + 5}'; zh_s = f'{tz}–{tz + 6}'
        cau_s = f'{4 + 1.5 * i / 7:.1f}'.replace('.', ','); han_s = f'{4 + i / 7:.1f}'.replace('.', ',')
        lien = '3' if i < 4 else '3–4'
    m = next(x for x in SD['map'] if x['key'] == ('w13' if k == '1+4' else k))
    days = [it[1] for it in m['items'] if it[0] == 'day']; lops = [it[1] for it in m['items'] if it[0] == 'lop']
    ht = do(us)
    rows_sd.append({
        'lop': 'Seedling 48', 'unit': k, 'chu_de': ten, 'truyen': m.get('story', ''), 'ngay_web': f'{min(days)}–{max(days)}', 'buoi': ', '.join(map(str, lops)),
        'en_chu_phan': en_s, 'en_chu_cau': cau_s, 'lien': f'{lien} lượt quanh một chuyện', 'cau_truc': CAU_TRUC_SD[k],
        'zh_chu_phan': zh_s, 'zh_chu_cau': han_s,
        'mau_cu': ('Mẫu câu lõi Little Seed ở mức nghe làm quen (chào, tên, tuổi, Who is he?, I like…, Where is…?, can) – 62d' if k in BAC
                   else 'Ít nhất 2 khung của các unit đã học (63)'),
        've': 'Vè 4 dòng × 4 phách, vần AABB, gọi – đáp vòng lớp có tên con; tiếng Trung vần cùng vận mẫu (65); từ trong vè dạy trước (67)',
        'big_book': 'Không làm big book câu chào (66)' if k == '1+4' else 'Khung một ô, chuỗi xích, trang cuối có tên con',
        'hien_trang': (f"Web hiện có: {ht['en']} chữ/phần, {str(ht['cau']).replace('.', ',')} chữ/câu; ZH {ht['zh']} chữ/phần, {str(ht['han']).replace('.', ',')} chữ/câu" if ht else 'Chưa có trên web')
                      + (' (U9 trên web là bản mẫu cũ; bản mới 10/11 đạt 40–44 chữ, chưa đủ chữ/câu)' if k == '9' else '')
                      + (' (bản mới 10/11 43–46 chữ, 3,9 chữ/câu – cần viết lại theo thang)' if k == '12' else ''),
    })
    def so(s): return int(s.split('–')[0]) if s and s[0].isdigit() else None
    if ht:
        thieu = []
        if int(ht['en'].split('–')[0]) < int(en_s.split('–')[0]) - 2: thieu.append('dài thêm chữ mỗi phần')
        if ht['cau'] < float(cau_s.replace(',', '.')) - 0.2: thieu.append('câu dài hơn, nối hội thoại')
        if int(ht['zh'].split('–')[0]) < int(zh_s.split('–')[0]) - 3: thieu.append('bản Trung dài thêm')
        rows_sd[-1]['viec'] = '; '.join(thieu) or 'đạt độ dài; còn kiểm cấu trúc, mẫu cũ, cốt truyện'
    else:
        rows_sd[-1]['viec'] = 'viết mới'
for x in rows_ls:
    x['viec'] = 'đạt' if 'đạt' in x['hien_trang'] and 'Cần' not in x['hien_trang'] else ('sửa' if x['unit'] in (1, 3) else 'viết mới')

ALL = rows_ls + rows_sd
json.dump(ALL, open(MANG + 'chi_tieu_48.json', 'w'), ensure_ascii=False, indent=1)
HDR = ['Lớp', 'Unit', 'Chủ đề', 'Ngày web', 'Buổi', 'EN chữ/phần', 'EN chữ/câu', 'Lượt nói liền', 'Cấu trúc phải có', 'ZH chữ Hán/phần',
       'ZH chữ Hán/câu', 'Mẫu câu cũ dùng lại', 'Vè', 'Big book', 'Hiện trạng', 'Việc cần làm']
KEYS = ['lop', 'unit', 'chu_de', 'ngay_web', 'buoi', 'en_chu_phan', 'en_chu_cau', 'lien', 'cau_truc', 'zh_chu_phan', 'zh_chu_cau', 'mau_cu', 've', 'big_book', 'hien_trang', 'viec']
with open(MANG + 'chi_tieu_48.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(HDR)
    for x in ALL: w.writerow([x.get(k, '') for k in KEYS])
try:
    from openpyxl import Workbook
    from openpyxl.styles import Font, Alignment, PatternFill
    wb = Workbook(); wb.remove(wb.active)
    for ten, rows in (('Little Seed 48', rows_ls), ('Seedling 48', rows_sd)):
        ws = wb.create_sheet(ten); ws.append(HDR)
        for x in rows: ws.append([x.get(k, '') for k in KEYS])
        for c in ws[1]: c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='2F7D4F')
        for i, wd in enumerate([14, 7, 18, 10, 12, 10, 9, 14, 48, 12, 10, 40, 40, 32, 48, 30], 1):
            ws.column_dimensions[chr(64 + i)].width = wd
        for row in ws.iter_rows(min_row=2):
            for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')
        ws.freeze_panes = 'C2'
    wb.save(os.path.join(OUT, 'ChiTieu4Mat_LS48_SD48.xlsx'))
except ImportError:
    pass
for x in ALL:
    print(x['lop'][:4], x['unit'], x['en_chu_phan'], x['en_chu_cau'], x['zh_chu_phan'], '|', x['hien_trang'][:80], '→', x['viec'])
