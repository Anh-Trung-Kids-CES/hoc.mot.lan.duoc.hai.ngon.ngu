# -*- coding: utf-8 -*-
"""Xuất grid/mang/*.json thành 2 bảng cho Google Sheet "Khung chương trình mỗi khoá":
  - tab "Mạng văn bản theo unit": mỗi unit một dòng (nhãn 2 tầng, mạng văn bản, ngày web, nghe ngấm, bộ học tại nhà)
  - tab "Duyệt nhãn (ng.t. 44)": chỗ máy không chắc + đề nghị đổi nhãn, để chị Duyên duyệt
Ra: grid/mang/sheet_mang.json, grid/mang/sheet_duyet.json, và bản CSV cùng tên (cho IMPORTDATA).
"""
import json, os, sys, csv

K = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
G = K + 'grid/'
sys.path.insert(0, K + 'audit')
from tu2tang import ORDER  # noqa


def j(xs, sep=', '):
    return sep.join(str(x) for x in xs if x)


def vb_cell(t):
    if not t:
        return '–'
    head = '%s %s' % (t['id'], t['loai'])
    if t.get('ten_en') or t.get('ten_zh'):
        head += ': ' + ' / '.join(x for x in (t.get('ten_en'), t.get('ten_zh')) if x)
    parts = [head]
    if t.get('kieu'): parts.append('Kiểu: ' + t['kieu'])
    if t.get('khung_en') or t.get('khung_zh'): parts.append('Khung: ' + ' | '.join(x for x in (t.get('khung_en'), t.get('khung_zh')) if x))
    if t.get('phan'):
        parts.append('Phần: ' + ' / '.join('%s. %s' % (p.get('phan'), p.get('y', '')) for p in t['phan']))
    if t.get('giai_dieu'): parts.append('Giai điệu: ' + t['giai_dieu'])
    if t.get('dong_tac'): parts.append('Động tác: ' + t['dong_tac'])
    if t.get('ghi_chu_thanh'): parts.append('Thanh điệu: ' + t['ghi_chu_thanh'])
    if t.get('nguon'): parts.append(t['nguon'])
    parts.append('Từ EN: ' + j(t.get('tu_en', [])))
    if t.get('tu_zh'): parts.append('Từ ZH: ' + j(t.get('tu_zh', [])))
    return '\n'.join(parts)


def main():
    head = ['Khóa', 'Unit', 'Chủ đề', 'Từ lõi EN', 'Từ vòng ngoài EN', 'Từ lõi ZH', 'Từ vòng ngoài ZH',
            'Ngoại lệ 40 (vòng ngoài luyện đủ như lõi)', 'Khung câu chính', 'Câu cửa miệng',
            'T1 Truyện khung', 'T2 Bài hát vận động', 'T3 Big book', 'T4 Vè', 'T5 / T6 / T7',
            'Văn bản theo ngày web', 'Trên lớp (4 buổi)', 'Nghe ngấm', 'Reader + bộ học tại nhà',
            'Từ vòng ngoài unit trước quay lại ở đây', 'Đề nghị đổi nhãn / ghi chú']
    rows = [head]
    duyet = [['Khóa', 'Unit', 'Tiếng', 'Từ', 'Nhãn máy gắn', 'Vì sao', 'Loại cần duyệt', 'Chị quyết (Lõi / Vòng ngoài / sửa)']]
    for c in ORDER:
        f = G + 'mang/%s.json' % c
        if not os.path.exists(f):
            continue
        for r in json.load(open(f)):
            vb = {t['id']: t for t in r.get('van_ban') or []}
            def tier(L, n):
                return j([x['tu'] for x in r['tu_' + L] if x['nhan'] == n])
            kc = r.get('khung_cau') or {}
            ngay = '\n'.join('Ngày %s: %s' % (d, j(s, ' · ')) for d, s in zip(r['ngay_web'], r.get('van_ban_theo_ngay') or []))
            lop = '\n'.join('Buổi %s – %s: con %s' % (b, x['vai'], x['vai_cua_con']) for b, x in zip(r['buoi'], r.get('van_ban_tren_lop') or []))
            nn = r.get('nghe_ngam') or {}
            nn_s = '\n'.join(x for x in ['Bộ: ' + j(nn.get('bo', [])), 'Ôn xoắn ốc: ' + j(nn.get('on_xoan_oc', [])) if nn.get('on_xoan_oc') else '',
                                          nn.get('thoi_luong', ''), nn.get('noi_dung', ''), nn.get('cach_nghe', '')] if x)
            rd, kit = r.get('reader') or {}, r.get('bo_hoc_tai_nha') or {}
            kit_s = '\n'.join(x for x in [
                'Reader: ' + j(rd.get('van_ban', [])) + ' – ' + rd.get('cach_dung', '') if rd else '',
                'Flashcard EN (%d): %s' % (len(kit.get('flashcard_en', [])), j(kit.get('flashcard_en', []))) if kit else '',
                'Flashcard ZH (%d): %s' % (len(kit.get('flashcard_zh', [])), j(kit.get('flashcard_zh', []))) if kit else '',
                'Poster câu cửa miệng: ' + j(kit.get('poster_cau_cua_mieng', []), ' · ') if kit.get('poster_cau_cua_mieng') else ''] if x)
            ex40 = j(['%s (%s)' % (x['tu'], x['ngoai_le_40']) for L in ('en', 'zh') for x in r['tu_' + L] if x['ngoai_le_40']])
            back = r.get('tu_cu_quay_lai') or {}
            notes = r.get('de_nghi_doi_nhan') or []
            notes_s = '\n'.join(n if isinstance(n, str) else json.dumps(n, ensure_ascii=False) for n in notes)
            if r.get('ghi_chu'): notes_s += ('\n' if notes_s else '') + 'Ghi chú: ' + r['ghi_chu']
            rows.append([r['khoa'], 'U' + r['unit'], r['chu_de'][:200], tier('en', 'Lõi'), tier('en', 'Vòng ngoài'),
                         tier('zh', 'Lõi'), tier('zh', 'Vòng ngoài'), ex40,
                         ' | '.join(x for x in (kc.get('en'), kc.get('zh'), ('ô: ' + kc['o']) if kc.get('o') else '') if x) or ('Nghe lại mạng: ' + j(r.get('nghe_lai_mang', []))),
                         j([p.get('en', '') + ' / ' + p.get('zh', '') for p in r.get('cau_cua_mieng') or []], ' · '),
                         (vb_cell(vb.get('T1') or vb.get('R1')) + ('\nĐộ dài mỗi phần (NL-2): %d–%d chữ Anh' % tuple(r['T1_do_dai']) if r.get('T1_do_dai') else '') + (', %d–%d chữ Hán' % tuple(r['T1_do_dai_zh']) if r.get('T1_do_dai_zh') else '') + ('\nTừ hay sai cài vào (ng.t. 6, từ %s): %s' % (r['tu_hay_sai']['nguon'], j(r['tu_hay_sai']['en'] + r['tu_hay_sai']['zh'])) if r.get('tu_hay_sai') else '')), vb_cell(vb.get('T2') or vb.get('R2')), vb_cell(vb.get('T3') or vb.get('R3')),
                         vb_cell(vb.get('T4')), '\n\n'.join(vb_cell(vb[k]) for k in ('T5', 'T6', 'T7', 'N1') if k in vb) or '–',
                         ngay, lop or '–', nn_s, kit_s or '–',
                         ('EN: ' + j(back.get('en', [])) if back.get('en') else '') + ('\nZH: ' + j(back.get('zh', [])) if back.get('zh') else '') or '–',
                         notes_s or '–'])
            for L in ('en', 'zh'):
                for x in r['tu_' + L]:
                    if x.get('may_khong_chac'):
                        duyet.append([r['khoa'], 'U' + r['unit'], L, x['tu'] + (' (= %s)' % x['nghia'] if x['nghia'] else ''), x['nhan'], x['ly_do'], 'Máy không chắc (cùng điểm ở ranh giới lõi)', ''])
            for n in notes:
                duyet.append([r['khoa'], 'U' + r['unit'], '', n if isinstance(n, str) else json.dumps(n, ensure_ascii=False), '', '', 'Đề nghị khi lập mạng văn bản', ''])
    for name, data in (('sheet_mang', rows), ('sheet_duyet', duyet)):
        json.dump(data, open(G + 'mang/%s.json' % name, 'w'), ensure_ascii=False)
        with open(G + 'mang/%s.csv' % name, 'w', newline='') as fh:
            csv.writer(fh).writerows(data)
        print(name, len(data) - 1, 'dòng', os.path.getsize(G + 'mang/%s.json' % name) // 1024, 'KB')


if __name__ == '__main__':
    main()
