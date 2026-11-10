"""Rà khung 9 khóa online theo nguyên tắc 61–68 (chị duyệt 10/11/2026).
Đọc grid/mang/<khóa>.json, ghi kết quả ra grid/mang/ra_soat_6268.json và in tóm tắt.
Chạy ở thư mục gốc repo: python3 -I chuong-trinh/cong-cu/khung/audit/ra_soat_6268.py

Kiểm:
- 62a/62b mặt 1: chỉ tiêu chữ mỗi phần của truyện khung (T1_do_dai, T1_do_dai_zh) so với thang mới, nội suy theo unit.
- 62 mặt 2, 3: khung có chỉ tiêu chữ mỗi câu và độ liền mạch chưa.
- 62 mặt 4 + 64: cấu trúc của đề (Starters/Movers/Flyers, YCT1–4) đã có trong khung câu, câu mẫu của khung trước mốc thi chưa.
- 63: phần truyện có dùng lại khung câu của unit trước không (đo trên câu mẫu trong ô "y" của T1 – chỉ là chỉ báo).
- 65: vè (T4) có theo công thức (≥4 dòng, không đệm số đếm) không.
- 66: big book unit chào hỏi.
- 62c: khóa ôn có chỉ tiêu độ dài văn bản dạng đề chưa.
"""
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
MANG = os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/')
KHOA = ['preb', 'little-seed', 'seedling', 'canopy', 'larva', 'larva-plus', 'pupa', 'cocoon', 'butterfly']
TEN = {'preb': 'PreB', 'little-seed': 'Little Seed', 'seedling': 'Seedling', 'canopy': 'Canopy', 'larva': 'Larva',
       'larva-plus': 'Larva Plus', 'pupa': 'Pupa', 'cocoon': 'Cocoon', 'butterfly': 'Butterfly'}
# Thang 62a, 62b: (đầu khóa, cuối khóa) chữ mỗi phần
THANG_EN = {'preb': (6, 10), 'little-seed': (10, 28), 'seedling': (35, 55), 'canopy': (55, 75), 'larva': (75, 110),
            'larva-plus': (110, 130), 'pupa': (120, 160), 'cocoon': (160, 220), 'butterfly': (200, 230)}
THANG_ZH = {'preb': (3, 8), 'little-seed': (13, 40), 'seedling': (40, 60), 'canopy': (60, 75), 'larva': (75, 90),
            'larva-plus': (90, 100), 'pupa': (100, 115), 'cocoon': (115, 130), 'butterfly': (130, 140)}
CAU_EN = {'preb': '1–2', 'little-seed': '2 → 3', 'seedling': '4 → 5,5', 'canopy': '6 → 7', 'larva': '7 → 8', 'larva-plus': '8 → 9',
          'pupa': '9 → 10', 'cocoon': '10 → 12', 'butterfly': '12 → 15'}
# Mốc thi: (tiếng, tên mốc, khóa cuối trước mốc, cấu trúc: regex)
CAU_TRUC = [
    ('en', 'Starters', 'canopy', {
        'there is/are': r"\bthere(?:'s| is| are)\b", 'have/has got': r"\b(?:has|have|'ve) got\b", 'hiện tại tiếp diễn': r"\b(?:is|are|am|'m|'s|'re) \w+ing\b",
        'can/can\'t': r"\bcan(?:'t|not)?\b", 'giới từ next to/behind/between/in front of': r"\b(?:next to|behind|between|in front of)\b",
        'how many': r'\bhow many\b', 'what colour': r'\bwhat colou?r\b', 'like + V-ing': r"\b(?:like|love)s? \w+ing\b",
        'câu mệnh lệnh (Look/Colour/Put…)': r"\b(?:look at|colou?r the|put|draw|find)\b", "sở hữu 's": r"\b\w+'s \w+", 'and/but': r'\bbut\b'}),
    ('en', 'Movers', 'larva-plus', {
        'quá khứ đơn': r"\b(?:was|were|went|had|did|saw|ate|got|made|came|took|played|liked|wanted|yesterday)\b", 'so sánh hơn (-er than)': r'\b\w+er than\b',
        'so sánh nhất (the …est/most)': r'\bthe (?:\w+est|most)\b', 'must/have to': r"\b(?:must|have to|has to)\b", 'would like to': r"\b(?:would like|'d like)\b",
        'mệnh đề who/which/that': r"\b\w+ (?:who|which) (?:is|are|was|has|lives|can)\b", 'because': r'\bbecause\b', 'so (liên từ)': r', so\b|\bso we\b|\bso I\b',
        'let\'s / how about': r"\b(?:let's|how about)\b"}),
    ('en', 'Flyers', 'butterfly', {
        'quá khứ tiếp diễn': r"\b(?:was|were) \w+ing\b", 'hiện tại hoàn thành': r"\b(?:have|has|'ve|'s) (?:been|seen|done|eaten|gone|had|made|ever|never|already|just)\b",
        'going to': r'\bgoing to\b', 'will': r"\b(?:will|'ll|won't)\b", 'might/may': r'\b(?:might|may)\b', 'could/should': r'\b(?:could|should)\b',
        'if': r'\bif\b', 'when/before/after + mệnh đề': r'\b(?:when|before|after|until) (?:I|we|you|he|she|it|they)\b',
        'câu hỏi đuôi': r", (?:isn't|aren't|doesn't|don't|didn't|wasn't|can't) (?:it|he|she|they|you)\?", 'be made of': r'\bmade of\b'}),
    ('zh', 'YCT1', 'seedling', {
        '是…吗': r'是.{0,8}吗', '有': r'有', '在 (nơi chốn)': r'在', '喜欢': r'喜欢', '的': r'的', '很': r'很', '和': r'和',
        '谁': r'谁', '哪儿': r'哪[儿里]', '什么': r'什么', '几': r'几'}),
    ('zh', 'YCT2', 'canopy', {
        '了': r'了', '会': r'会', '比': r'比', '没(有)': r'没', '可以': r'可以', '也': r'也', '呢': r'呢', '怎么样': r'怎么样', '多少': r'多少'}),
    ('zh', 'YCT3', 'larva-plus', {
        '在+V呢 (đang)': r'在\w{1,3}呢|正在', '能': r'能', '把': r'把', '因为…所以': r'因为', '得 (bổ ngữ)': r'得(?:很|好|快|慢|真)', '过 (kinh nghiệm)': r'过',
        '是…的': r'是.{1,8}的', '吧': r'吧'}),
    ('zh', 'YCT4', 'butterfly', {
        '要…了': r'要.{1,4}了', '一边…一边': r'一边', '比…更/还': r'比.{1,4}[更还]', '虽然/但是': r'但是|虽然', '如果': r'如果', '越来越': r'越来越'}),
]
QUOTE = re.compile(r'[“"]([^”"]{3,})[”"]')

def loi(u):
    """Mọi câu mẫu tiếng Anh/Trung có trong khung của unit."""
    en, zh = [], []
    k = u.get('khung_cau') or {}
    en.append(k.get('en', '')); zh.append(k.get('zh', ''))
    for c in u.get('cau_cua_mieng') or []:
        en.append(c.get('en', '')); zh.append(c.get('zh', ''))
    for v in u.get('van_ban', []):
        en.append(v.get('khung_en', '')); zh.append(v.get('khung_zh', ''))
        for p in v.get('phan', []) or []:
            for q in QUOTE.findall(p.get('y', '')):
                (zh if re.search(r'[一-鿿]', q) else en).append(q)
    return ' \n '.join(en), ' \n '.join(zh)

def muc(lo, hi, i, n):
    return round(lo + (hi - lo) * (i / max(1, n - 1)))

KQ = {'do_dai': [], 'cau_truc': [], 'dung_lai': [], 've': [], 'chao': [], 'khoa_on': [], 'thieu_chi_tieu': []}
TEXT = {}
for f in KHOA:
    D = json.load(open(MANG + f + '.json'))
    TEXT[f] = [loi(u) for u in D]
    n = len(D)
    for i, u in enumerate(D):
        un = str(u['unit'])
        if 'T1_do_dai' in u:
            cu = u['T1_do_dai']; cz = u.get('T1_do_dai_zh') or [None, None]
            de, dz = muc(*THANG_EN[f], i, n), muc(*THANG_ZH[f], i, n)
            KQ['do_dai'].append({'khoa': TEN[f], 'unit': un, 'en_khung': cu, 'en_thang': de, 'zh_khung': cz, 'zh_thang': dz,
                                 'en_lech': de - max(cu), 'zh_lech': (dz - max(cz)) if cz[1] else None})
            if not any(k in u for k in ('T1_cau', 'T1_lien')):
                KQ['thieu_chi_tieu'].append(f'{TEN[f]} U{un}')
        else:
            ids = [v['id'] for v in u['van_ban']]
            KQ['khoa_on'].append({'khoa': TEN[f], 'unit': un, 'van_ban': ids,
                                  'co_do_dai_de': any('do_dai' in v for v in u['van_ban'])})
        # 63: phần truyện dùng lại khung câu unit trước
        if i and 'T1_do_dai' in u:
            cu_frames = []
            for p in D[:i]:
                fr = re.sub(r'___.*', '', (p.get('khung_cau') or {}).get('en', '')).strip(' ,?!.–-')
                if len(fr.split()) >= 2:
                    cu_frames.append(' '.join(fr.split()[:3]).lower())
            t1 = next(v for v in u['van_ban'] if v['id'] == 'T1')
            so = 0
            for p in t1.get('phan', []):
                qs = ' '.join(QUOTE.findall(p.get('y', ''))).lower()
                if sum(1 for fr in set(cu_frames) if fr and fr in qs) >= 1:
                    so += 1
            KQ['dung_lai'].append({'khoa': TEN[f], 'unit': un, 'phan_co_mau_cu': so, 'so_phan': len(t1.get('phan', []))})
        # 65: vè
        for v in u['van_ban']:
            if v['id'] == 'T4':
                t = v.get('khung_en', '')
                dong = [x for x in re.split(r'(?<=[!?.])\s+|\s*/\s*', t) if x.strip()]
                dem = bool(re.search(r'\b(?:one|two|three)\b.*\b(?:two|three|four)\b', t, re.I))
                KQ['ve'].append({'khoa': TEN[f], 'unit': un, 'so_dong': len(dong), 'dem_dem': dem, 'loai': v.get('kieu', '')})
        # 66: big book chào hỏi
        if un == '1':
            for v in u['van_ban']:
                if v['id'] == 'T3' and re.search(r'\b(?:hello|good morning|hi)\b', v.get('khung_en', ''), re.I):
                    KQ['chao'].append({'khoa': TEN[f], 'unit': un, 'khung': v.get('khung_en', '')})

# 62 mặt 4: cấu trúc trước mốc thi
for lang, moc, cuoi, ds in CAU_TRUC:
    upto = KHOA[:KHOA.index(cuoi) + 1]
    for ten, rx in ds.items():
        dau = None
        for f in upto:
            for i, (en, zh) in enumerate(TEXT[f]):
                if re.search(rx, en if lang == 'en' else zh, re.I):
                    dau = f'{TEN[f]} U{i + 1}'; break
            if dau: break
        KQ['cau_truc'].append({'moc': moc, 'cau_truc': ten, 'lan_dau': dau})

json.dump(KQ, open(MANG + 'ra_soat_6268.json', 'w'), ensure_ascii=False, indent=1)

# Tóm tắt
print('== 62 mặt 1: chỉ tiêu chữ mỗi phần (khung → thang) ==')
for f in KHOA:
    r = [x for x in KQ['do_dai'] if x['khoa'] == TEN[f]]
    if not r: continue
    en = sorted({tuple(x['en_khung']) for x in r}); zh = sorted({tuple(x['zh_khung']) for x in r if x['zh_khung'][1]})
    print(f"{TEN[f]:12} khung EN {en} → thang {r[0]['en_thang']}→{r[-1]['en_thang']} | ZH {zh} → {r[0]['zh_thang']}→{r[-1]['zh_thang']}")
print('Khóa ôn chưa có chỉ tiêu độ dài văn bản dạng đề:', sorted({x['khoa'] for x in KQ['khoa_on'] if not x['co_do_dai_de']}))
print('Unit chưa có chỉ tiêu chữ/câu và độ liền mạch:', len(KQ['thieu_chi_tieu']))
print('\n== 62 mặt 4: cấu trúc của đề, lần đầu có trong khung ==')
for moc in dict.fromkeys(x['moc'] for x in KQ['cau_truc']):
    r = [x for x in KQ['cau_truc'] if x['moc'] == moc]
    thieu = [x['cau_truc'] for x in r if not x['lan_dau']]
    print(f"{moc}: có {len(r) - len(thieu)}/{len(r)}; thiếu: {', '.join(thieu) or '—'}")
print('\n== 63: phần truyện có câu mẫu dùng lại khung unit trước (chỉ báo) ==')
for f in KHOA:
    r = [x for x in KQ['dung_lai'] if x['khoa'] == TEN[f]]
    if r:
        print(f"{TEN[f]:12} {sum(x['phan_co_mau_cu'] for x in r)}/{sum(x['so_phan'] for x in r)} phần")
print('\n== 65: vè ==')
r = KQ['ve']
print(f"{len(r)} vè; dưới 4 dòng: {sum(1 for x in r if x['so_dong'] < 4)}; có dòng đếm 'one, two…': {sum(1 for x in r if x['dem_dem'])}")
print('\n== 66: big book Unit 1 là câu chào ==', [x['khoa'] for x in KQ['chao']])
