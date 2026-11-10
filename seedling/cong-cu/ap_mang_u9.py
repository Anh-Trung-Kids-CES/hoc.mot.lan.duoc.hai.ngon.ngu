"""Đưa mạng văn bản Unit 9 mới (chuong-trinh/cong-cu/khung/grid/mang/mau_seedling48_u9.json) lên web Seedling 99 ngày – bản mẫu chờ chị duyệt.
Sửa ngày web 64–71 ngay trong seedling-data.js (build.py cần Excel v7 không có trong repo, nên chạy script này SAU build.py):
- Nghe truyện: truyện khung 6 phần mới, mỗi câu một tranh ghép (tai-nguyen/canh/u9/).
- Bài luyện rời "Chạm đúng tranh / Nghe – chạm tranh" thay bằng bước "Big book và vè" (nguyên tắc 23, 27: văn bản mới thay chỗ luyện rời, không thêm phút).
- Nói theo, Phiên dịch nhí, Trả lời câu hỏi dựng lại từ câu của truyện mới. Các bước khác (thẻ, mẹo âm, dạng đề, nghe – trả lời, vận động) giữ nguyên.
- Reader Unit 9 thay bằng truyện mới.
Chạy ở thư mục gốc repo: python3 -I seedling/cong-cu/ap_mang_u9.py
"""
import json, os, re, subprocess
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(ROOT, 'seedling', 'seedling-data.js')
M = json.load(open(os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/mau_seedling48_u9.json')))
raw = open(DATA).read()
head = raw.split('\n', 1)[0]
SD = json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))', DATA], capture_output=True, text=True, check=True).stdout)
AU = SD['aumap']; MISS = []
def au(l, t):
    t = t.strip(); a = AU.get(f'{l}:{t}') or AU.get(f'{l}:{t.rstrip("!.?！。？")}')
    if not a: MISS.append((l, t))
    return a or ''
T1 = M['T1']; IMG = 'tai-nguyen/canh/u9/'; TR = 'tai-nguyen/tranh/'
def scenes(k):
    return [{'who': w, 'img': IMG + f'p{k + 1}_{i + 1}.webp', 'en': e, 'zh': z, 'py': p, 'a_en': au('en', e), 'a_zh': au('zh', z)} for i, (w, e, z, p) in enumerate(T1['phan'][k])]
BB = [(TR + k + '.webp', e, z, p) for k, e, z, p in M['T3']['trang']]
VE = [(TR + k + '.webp', e, z, p) for k, e, z, p in M['T4']['dong']]
def bb(n):
    pg = [BB[(2 * n + j) % len(BB)] for j in range(3)] + [VE[(n + j) % len(VE)] for j in range(2)]
    return {'type': 'truyen', 'lab': 'Big book và vè', 'sub': 'Nghe lại mẫu câu của unit', 'title': 'Big book · I Like… / I Don\'t Like… + vè', 'title_zh': 'Big book · 我喜欢… + 儿歌',
            'scenes': [{'who': 'narr', 'img': i, 'en': e, 'zh': z, 'py': p, 'a_en': au('en', e), 'a_zh': au('zh', z)} for i, e, z, p in pg]}
def noi(sc, n=6):
    kid = [s for s in sc if s['who'] in ('bong', 'nhan', 'leo', 'anna')]
    T = []
    for i, s in enumerate(kid):
        l = 'en' if i % 2 == 0 else 'zh'
        T.append({'img': s['img'], 'say': [{'t': s[l], 'l': l, 'w': s['who'], 'a': s['a_' + l]}]})
    while len(T) < 5: T.append(T[len(T) % max(1, len(kid))])
    return T[:n]
def pdn(sc, n=5):
    seen, it = set(), []
    for s in sc:
        if s['en'] in seen or len(s['en'].split()) < 3: continue
        seen.add(s['en']); it.append({'en': s['en'], 'zh': s['zh'], 'py': s['py'], 'a_en': s['a_en'], 'a_zh': s['a_zh']})
    return it[:n]
ALL = [scenes(k) for k in range(6)]
for k in range(6):
    n = 64 + k; d = SD['days'][str(n)]; st = d['steps']
    i_tr = next(i for i, s in enumerate(st) if s['type'] == 'truyen')
    st[i_tr] = {'type': 'truyen', 'title': f'The Picnic · {T1["phan_ten"][k][0]}', 'title_zh': f'真好吃！· {T1["phan_ten"][k][1]}', 'scenes': ALL[k]}
    i_ch = next((i for i, s in enumerate(st) if s['type'] in ('chon', 'cham')), None)
    if i_ch is not None: st[i_ch] = bb(k)
    else: st.insert(i_tr + 1, bb(k))
    for i, s in enumerate(st):
        if s['type'] == 'noi': st[i] = {'type': 'noi', 'turns': noi(ALL[k] + (ALL[k - 1] if k else []))}
        if s['type'] == 'pdn':
            items = pdn(ALL[k] + (ALL[k - 1] if k else ALL[1]))
            st[i] = {'type': 'pdn', 'model_first': False, 'items': items}
    d['t'] = f'{T1["phan_ten"][k][0]} – {T1["phan_ten"][k][1]}'; d['hero'] = IMG + f'p{k + 1}_1.webp'
HOI = {'type': 'hoi', 'rounds': [
    {'l': 'en', 'qs': [{'q': 'Does Vũ like fruit?', 'opts': ['Yes, he does.', "No, he doesn't."], 'ans': 0, 'img': IMG + 'p1_5.webp'},
                       {'q': 'Does Bông like noodles?', 'opts': ['Yes, she does.', "No, she doesn't."], 'ans': 1, 'img': IMG + 'p3_2.webp'},
                       {'q': 'What does Bông like?', 'opts': ['Ice cream.', 'Noodles.', 'Candy.'], 'ans': 0, 'img': IMG + 'p3_4.webp'},
                       {'q': 'Does Leo like chips?', 'opts': ['Yes, he does.', "No, he doesn't."], 'ans': 0, 'img': IMG + 'p4_4.webp'},
                       {'q': 'Does Bông want candy?', 'opts': ['Yes, please!', 'No, thank you!'], 'ans': 1, 'img': IMG + 'p5_2.webp'}]},
    {'l': 'zh', 'yct': True, 'qs': [{'q': 'Vũ喜欢水果吗？', 'py': 'Vũ xǐhuan shuǐguǒ ma?', 'opts': [['喜欢。', 'Xǐhuan.'], ['不喜欢。', 'Bù xǐhuan.']], 'ans': 0, 'img': IMG + 'p1_5.webp'},
                                    {'q': 'Bông喜欢面条吗？', 'py': 'Bông xǐhuan miàntiáo ma?', 'opts': [['喜欢。', 'Xǐhuan.'], ['不喜欢。', 'Bù xǐhuan.']], 'ans': 1, 'img': IMG + 'p3_2.webp'},
                                    {'q': 'Bông喜欢什么？', 'py': 'Bông xǐhuan shénme?', 'opts': [['冰淇淋。', 'Bīngqílín.'], ['面条。', 'Miàntiáo.'], ['糖果。', 'Tángguǒ.']], 'ans': 0, 'img': IMG + 'p3_4.webp'},
                                    {'q': 'Leo喜欢薯条吗？', 'py': 'Leo xǐhuan shǔtiáo ma?', 'opts': [['喜欢。', 'Xǐhuan.'], ['不喜欢。', 'Bù xǐhuan.']], 'ans': 0, 'img': IMG + 'p4_4.webp'},
                                    {'q': 'Bông想吃糖果吗？', 'py': 'Bông xiǎng chī tángguǒ ma?', 'opts': [['想。', 'Xiǎng.'], ['不想。', 'Bù xiǎng.']], 'ans': 1, 'img': IMG + 'p5_2.webp'}]}]}
for q in HOI['rounds'][0]['qs']: q['a'] = au('en', q['q'])
for q in HOI['rounds'][1]['qs']: q['a'] = au('zh', q['q'])
for n, rng, ttl in [(70, range(0, 3), 'phần 1–3'), (71, range(3, 6), 'phần 4–6')]:
    d = SD['days'][str(n)]; st = d['steps']; sc = [s for k in rng for s in ALL[k]]
    for i, s in enumerate(st):
        if s['type'] == 'truyen': st[i] = {'type': 'truyen', 'title': f'The Picnic · Cả truyện ({ttl})', 'title_zh': f'真好吃！· 全文（{ttl}）', 'scenes': sc}
        if s['type'] == 'hoi': st[i] = HOI
        if s['type'] == 'noi': st[i] = {'type': 'noi', 'turns': noi(sc, 8)}
        if s['type'] == 'pdn': st[i] = {'type': 'pdn', 'model_first': False, 'items': pdn(sc)}
    d['hero'] = IMG + ('p1_1.webp' if n == 70 else 'p6_2.webp')
SD['reader']['9'] = {'t': 'The Picnic', 'zh': '真好吃！', 'pages': [dict(s, part=k + 1) for k in range(6) for s in ALL[k]]}
open(DATA, 'w').write(head + '\nwindow.SD=' + json.dumps(SD, ensure_ascii=False) + ';\n')
json.dump(sorted(set(MISS)), open(os.path.join(os.path.dirname(__file__), 'giong_thieu_u9.json'), 'w'), ensure_ascii=False, indent=0)
print('xong ngày 64–71 · câu chưa có giọng thu sẵn:', len(set(MISS)))
