"""Dựng trang in big book mẫu Little Seed U1 (A4 dọc, in phóng A3). Chạy ở gốc repo sau ghep.py."""
import html, json
from pypinyin import pinyin, Style
def PY(z): return ' '.join(x[0] for x in pinyin(z, style=Style.TONE)).replace(' ，', ',').replace(' ！', '!').replace(' ？', '?').replace('…… ', '…… ')
SLOT = '<span class="slot">…</span>'
# (tranh, EN, ZH, từ trong ô (tô màu), loại trang, ghi chú cho cô)
P = [
 ('bia', 'Hello, …?', '……，你好？', '', 'bia', 'Bìa: chỉ mèo, Puppy ló ở hai mép. Hỏi "Hello, …?" – con đoán ai sẽ xuất hiện.'),
 ('p1_doan', 'Hello, …?', '……，你好？', '', 'doan', 'Trang đoán: chỉ mái tóc dài, vạt váy. Dừng 3 giây, để con đoán rồi mới lật.'),
 ('p1_chao', 'Hello, mommy!', '妈妈，你好！', 'mommy|妈妈', 'chao', 'Cả lớp vẫy tay chào.'),
 ('p2_doan', 'Hello, …?', '……，你好？', '', 'doan', 'Chỉ cặp kính sau ghế. Con nói "daddy!" trước khi cô lật.'),
 ('p2_chao', 'Hello, daddy!', '爸爸，你好！', 'daddy|爸爸', 'chao', ''),
 ('p3_doan', 'Hello, …?', '……，你好？', '', 'doan', 'Cái đuôi vằn cam. Làm tiếng "meo" nếu con chưa đoán ra.'),
 ('p3_chao', 'Hello, kitten!', '小猫，你好！', 'kitten|小猫', 'chao', ''),
 ('p4_doan', 'Hello, kitten?', '小猫，你好？', 'kitten|小猫', 'doan', 'Cô cố ý đoán sai: "Hello, kitten?" Đuôi nâu, không vằn. Chờ con phản đối "No!".'),
 ('p4_chao', 'No! Hello, puppy!', '不对！小狗，你好！', 'puppy|小狗', 'chao', 'Chỗ cười: cô làm mặt ngạc nhiên. Cả lớp nói "No!" thật to.'),
 ('p5_doan', 'Hello, …?', '……，你好？', '', 'doan', 'Ở lớp: ai che mặt bằng quyển sách đỏ? Chỉ váy xanh ngọc.'),
 ('p5_chao', 'Hello, teacher!', '老师，你好！', 'teacher|老师', 'chao', 'Con chào cô thật, ngay trên lớp.'),
 ('p6_doan', 'Hello, …?', '……，你好？', '', 'doan', 'Bàn tay vẫy và mái tóc xoăn ló ở mép trang.'),
 ('p6_chao', 'Hello, friend!', '朋友，你好！', 'friend|朋友', 'chao', 'Con quay sang chào bạn bên cạnh.'),
 ('p7', 'Hello, everyone!', '大家好！', 'everyone|大家', 'chao', ''),
 ('p8', 'Goodbye, all! See you tomorrow!', '大家再见！明天见！', 'Goodbye|再见', 'chao', 'Nắng chiều: hết giờ học.'),
 ('p9', 'Goodbye, puppy!', '小狗，再见！', 'puppy|小狗', 'chao', 'Chữ nói "Goodbye" nhưng Puppy đã chui lên giường Bông! Hỏi: Puppy có đi không? Con trả lời "No!".'),
 ('p10', 'Hello, ___!', '___，你好！', '', 'ten', 'Trang cuối: dán ảnh con vào khung, cả lớp đọc tên con.'),
]
def mark(t, w):
    t = html.escape(t.replace('……', '…'))
    if w: t = t.replace(html.escape(w), f'<b class="o">{html.escape(w)}</b>', 1)
    return t.replace('…', SLOT).replace('___', '<span class="blank"></span>')
pages, notes = [], []
for i, (img, en, zh, w, kind, note) in enumerate(P):
    we, wz = (w.split('|') + [''])[:2] if w else ('', '')
    tag = {'bia': 'cover', 'doan': '?', 'chao': '', 'ten': ''}[kind]
    if kind == 'bia':
        txt = f'<div class="title en">{mark(en, "")}</div><div class="title zh">{mark(zh, "")}</div><div class="sub">Little Seed · Unit 1 · Big Book</div>'
    else:
        txt = f'<div class="en">{mark(en, we)}</div><div class="zh">{mark(zh, wz)}</div><div class="py">{html.escape(PY(zh.replace("……", "").replace("___", "")).strip(' ,'))}</div>'
    pages.append(f'<section class="pg bb {kind}"><div class="sc"><img src="tranh/{img}.webp" alt=""></div><div class="tx">{txt}</div>'
                 + ('' if kind == 'bia' else f'<div class="no">{i}</div>') + (f'<div class="q">?</div>' if kind == 'doan' else '') + '</section>')
    notes.append(f'<tr><td>{i if i else "Bìa"}</td><td>{html.escape(en)}<br><span class="zh">{html.escape(zh)}</span></td><td>{html.escape(note)}</td></tr>')
H = f'''<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Big book mẫu · Hello, …?</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;700;800&family=Noto+Sans+SC:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../hoc-lieu.css"><style>
.pg.bb{{padding:0;display:flex;flex-direction:column}}
.bb .sc{{width:210mm;height:210mm;overflow:hidden}} .bb .sc img{{width:100%;height:100%;display:block}}
.bb .tx{{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 10mm;border-top:2mm solid var(--gold)}}
.bb .en{{font-size:40pt;font-weight:800;line-height:1.15}} .bb .zh{{font-size:36pt;font-weight:700;margin-top:3mm}} .bb .py{{font-size:15pt;color:var(--teal);margin-top:1.5mm}}
.bb.chao .en{{font-size:38pt}} .o{{color:var(--red)}}
.slot{{display:inline-block;min-width:26mm;border:1mm dashed #E0A83A;border-radius:4mm;padding:0 3mm;color:#E0A83A}}
.blank{{display:inline-block;width:55mm;border-bottom:1mm solid #333}}
.bb .title.en{{font-size:54pt;font-weight:800;color:var(--red)}} .bb .title.zh{{font-size:48pt;font-weight:700}} .bb .sub{{font-size:13pt;color:#999;margin-top:3mm}}
.bb .no{{position:absolute;bottom:5mm;right:8mm;color:#bbb;font-size:12pt}}
.bb .q{{position:absolute;top:6mm;right:6mm;width:18mm;height:18mm;border-radius:50%;background:var(--gold);color:#fff;font:800 34pt/18mm 'Be Vietnam Pro';text-align:center;box-shadow:0 1mm 0 #c9962e}}
table.ss td{{font-size:14px}}
</style></head><body>
<div class="top noprint"><b>Big book mẫu · Little Seed U1 · "Hello, …?"</b><span class="sp"></span><a class="btn" href="../">← Học liệu in</a><button class="btn p" onclick="print()">In / Lưu PDF</button></div>
<div class="wrap noprint"><div class="note"><b>Mẫu theo bộ quy tắc thiết kế big book mới (chờ chị duyệt).</b> Cặp trang <b>đoán → lật → chào</b>: trang đoán chỉ hé một đặc điểm (tóc, kính, cái đuôi, bàn tay), con đoán và nói to trước khi cô lật. Có cảnh nền đúng nơi xảy ra (nhà Bông, lớp, sân trường). Chỗ cười: trang 7–8 cô cố ý đoán sai ("kitten?" → "No! puppy!"); trang 15 chữ nói "Goodbye" nhưng tranh cho thấy Puppy đã chui lên giường. Khung câu 100% "Hello, ___!", chỉ dùng từ Unit 1. In A4 dọc, phóng A3 khi in big book thật. Tranh ghép từ tranh có sẵn; bản chính thức nên vẽ riêng (xem bộ quy tắc).</div>
<table class="ss"><tr><th>Trang</th><th>Câu</th><th>Cô làm gì</th></tr>{''.join(notes)}</table></div>
<div class="pw">{''.join(pages)}</div></body></html>'''
open('little-seed/day/mau-big-book/index.html', 'w').write(H); print(len(P), 'trang')
