# -*- coding: utf-8 -*-
"""Cập nhật data/bang/<khóa>.json, .csv, -sheet.csv từ grid/out/*.json khi thiếu grid/packs/ (build_site.py cần packs).
Giữ nguyên cách chia khối của data/bang/<khóa>.json hiện có, chỉ thay nội dung từng buổi theo số buổi.
Chạy trong cong-cu/khung/:  python3 audit/patch_bang.py
"""
import json, glob, csv, os

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
OUT = os.path.abspath(K + '../..') + '/data/bang/'
WEB = ['tu', 'cum', 'cau', 'truyen', 'video']
LOP = ['flash', 'slide', 'truyen', 'baihat']
H = ['Từ', 'Cụm từ', 'Câu (cài các chủ điểm ngữ pháp cần thiết vào)',
     'Truyện (ngữ cảnh hoàn chỉnh chứa đầy đủ từ, cụm từ, câu đã học phía trước)',
     'Video tìm được trên web/ youtube có nội dung tương đương']
L = ['Flash card', 'Slide có bài tập tương tác', 'Truyện', 'Bài hát']


def rowvals(r, j, x):
    row = [x['label']] + [x['en'][k] for k in WEB] + [x['zh'][k] for k in WEB]
    row += ([r['label_buoi']] + [r['lop']['en'][k] for k in LOP] + [r['lop']['zh'][k] for k in LOP]) if j == 0 else [''] * 9
    return row


for f in sorted(glob.glob(OUT + '*.json')):
    cid = os.path.basename(f)[:-5]
    rows = {}
    for x in glob.glob(K + 'grid/out/%s-?.json' % cid):
        for r in json.load(open(x))['rows']:
            rows[r['buoi']] = r
    if not rows:
        continue
    b = json.load(open(f))
    for bl in b['blocks']:
        bl['rows'] = [rows[r['buoi']] for r in bl['rows']]
    json.dump(b, open(f, 'w'), ensure_ascii=False, separators=(',', ':'))
    with open(OUT + cid + '.csv', 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.writer(fh)
        w.writerow(['', 'Nội dung đẩy lên web'] + [''] * 10 + ['Nội dung dạy trên lớp'] + [''] * 7)
        w.writerow(['', 'Tiếng Anh', '', '', '', '', 'Tiếng Trung', '', '', '', '', '', 'Tiếng Anh', '', '', '', 'Tiếng Trung'])
        w.writerow([''] + H + H + [''] + L + L)
        for bl in b['blocks']:
            for r in bl['rows']:
                for j, x in enumerate(r['web']):
                    w.writerow(rowvals(r, j, x))
    with open(OUT + cid + '-sheet.csv', 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        for bl in b['blocks']:
            for r in bl['rows']:
                for j, x in enumerate(r['web']):
                    row = rowvals(r, j, x)
                    w.writerow([str(v).strip() or '–' for v in row[:11]] + [str(v).strip() for v in row[11:]] if j else [str(v).strip() or '–' for v in row])
    print(cid, sum(len(bl['rows']) for bl in b['blocks']), 'buổi')
