"""Học liệu in cho lớp offline 48 buổi (Little Seed, Seedling) – mẫu Unit 1–3, buổi 1–11 (11/11/2026, chị chọn: bộ đồ dùng in + thủ công,
sách bài tập + reader; tất cả nằm trong web dạy, mở trang rồi In / Lưu PDF).
Nguồn: dữ liệu web học (little-seed-data.js, seedling-data.js) và mạng văn bản (grid/mang/ls48_mang.py, sd48_mang.py) – học liệu in khớp đúng
từ, truyện, big book, vè con đã gặp trên web. Sách bài tập theo cột "Sách bài tập" của khung 48 buổi:
  Little Seed: phiếu tô – dán 1 trang mỗi buổi (tô tranh truyện, nối tranh – tranh, dán ảnh);
  Seedling: 2 trang mỗi buổi – trang tiếng Anh (tô và viết 3 từ, đọc – đánh dấu) khó hơn trang tiếng Trung (tô 2 chữ Hán theo nét, nối).
Ra: little-seed/day/hoc-lieu-data.js + to-mau/ ; seedling/day/hoc-lieu/hoc-lieu-data.js + to-mau/
Chạy ở gốc repo: python3 -I chuong-trinh/cong-cu/hoc-lieu/build_hoc_lieu.py [thư mục hanzi-writer-data]
"""
import json, os, re, sys, subprocess, hashlib, importlib.util, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode, qrcode.image.svg
from pypinyin import pinyin as _py, Style
ROOT = os.getcwd()
HZ = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hanzi-writer-data'
PAGES = 'https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/'
def load_js(p):
    return json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);process.stdout.write(JSON.stringify(SD))', os.path.abspath(p)],
                                     capture_output=True, text=True, check=True).stdout)
def mod(name, p):
    sp = importlib.util.spec_from_file_location(name, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
FONT = next(f for f in ('/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc') if os.path.exists(f))
HAN = re.compile(r'[一-鿿]')
import sys as _sy, os as _os; _sy.path.insert(0, _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), '..'))
from pinyin_chuan import py as _PYC   # (12/11) pinyin chuẩn theo từ điển CC-CEDICT + luật chữ đa âm
def PY(z):
    return _PYC(z, noi=True)
    out = []
    for seg in re.split(r'([一-鿿]+)', z):
        out.append(' '.join(x[0] for x in _py(seg, style=Style.TONE)) if HAN.match(seg or '') else seg)
    s = ' '.join(x.strip() for x in out if x.strip())
    s = re.sub(r'\s+', ' ', s.replace('，', ', ').replace('！', '! ').replace('？', '? ').replace('。', '. ').replace('、', ', ')).strip()
    s = re.sub(r'\s+([,.!?])', r'\1', s)
    return s[:1].upper() + s[1:]

LEVELS = {
    'LS': dict(web='little-seed', data='little-seed/little-seed-data.js', out='little-seed/day', mang='chuong-trinh/cong-cu/khung/grid/mang/ls48_mang.py',
               title='Little Seed · Hạt giống nhỏ', units={str(i): [i] for i in range(1, 13)}),
    'SD': dict(web='seedling', data='seedling/seedling-data.js', out='seedling/day/hoc-lieu', mang='chuong-trinh/cong-cu/khung/grid/mang/sd48_mang.py',
               title='Seedling · Hạt mầm vươn cao', units={'1': [1, 4], **{str(i): [i] for i in (2, 3, 5, 6, 7, 8, 9, 10, 11, 12)}}),
}
UNIT_NAME = {'LS': {'1': ('Unit 1 · Greeting', '问好'), '2': ('Unit 2 · Name and age', '名字和年龄'), '3': ('Unit 3 · Family', '家人')},
             'SD': {'1': ('Unit 1 + Body · Greeting and Body', '问好 + 身体'), '2': ('Unit 2 · Name and age', '名字和年龄'), '3': ('Unit 3 · Family', '家人')}}
PHOTO = {'LS': {'1': ("This is me!", '这是我！'), '2': ("Happy birthday!", '生日快乐！'), '3': ("This is my family.", '这是我的家人。')},
         'SD': {'1': ("This is me!", '这是我！'), '2': ("I'm ___ years old.", '我___岁。'), '3': ("This is my family.", '这是我的家人。')}}
CRAFT = {
    'LS': {'1': dict(kind='necklace', name='Thẻ tên đeo cổ · Hello, My Name Is…', mat='giấy bìa A4, bút sáp, kéo, dây len 60 cm, máy đục lỗ',
                     steps=['Mỗi con chọn một thẻ có bạn mình thích (Bông, Leo, Anna, Xiaomei), tô màu.', 'Cô viết (hoặc dán) tên con vào dòng kẻ, con đọc theo: "My name is ___."',
                            'Cắt theo nét đứt, đục 2 lỗ, xâu dây.', 'Đeo thẻ khi hát vè chào "___, ___, that\'s my name!" – cô gọi tên trên thẻ, con giơ tay đáp.'],
                     en="Hello! My name is", zh='你好！我叫'),
           '2': dict(kind='cake', name='Bánh sinh nhật đếm nến · How Old Are You?', mat='giấy A4, bút sáp, kéo, hồ dán',
                     steps=['Con tô màu bánh sinh nhật.', 'Cắt dải nến số 1–10, đếm cùng cô bằng hai thứ tiếng (one… ten, 一…十).',
                            'Dán lên bánh đúng số nến bằng tuổi mình, nói "I\'m five! 我五岁！".', 'Cầm bánh đi vòng lớp hỏi bạn: "How old are you? 你几岁？"'],
                     en="I'm ___!", zh='我___岁！'),
           '3': dict(kind='album', name='Album gia đình · trang 1 · My Family', mat='giấy A4, ảnh người thân (ba mẹ gửi trước qua Zalo), hồ dán, bút sáp',
                     steps=['Con dán ảnh (hoặc vẽ) từng người vào đúng khung.', 'Cô chỉ từng khung hỏi "Who is he? / Who is she? 这是谁？", con đáp "He is my grandpa. 这是我爷爷。"',
                            'Giữ trang này cho Album gia đình cuối khóa (buổi 48).'], en='Who is he? Who is she?', zh='这是谁？')},
    'SD': {'1': dict(kind='puppet', name='Người giấy cử động · My Body', mat='giấy bìa A4, bút sáp, kéo, 5 ghim hai chân (ghim mở cánh)',
                     steps=['Con tô màu các bộ phận: đầu, thân, tay, chân, bàn tay, bàn chân.', 'Cắt theo nét đứt; cô đục lỗ ở chấm tròn.',
                            'Ghép bằng ghim hai chân để tay chân cử động.', 'Chơi "Touch your ___!": cô hô, con cử động đúng bộ phận và nói tên bằng hai thứ tiếng.'],
                     parts=[('head', '头'), ('body', '身体'), ('arm', '胳膊'), ('arm', '胳膊'), ('leg', '腿'), ('leg', '腿'), ('hand', '手'), ('hand', '手'), ('foot', '脚'), ('foot', '脚')]),
           '2': dict(kind='crown', name='Vương miện sinh nhật · How Old Are You?', mat='giấy bìa A4 vàng, bút sáp, kéo, hồ dán, băng dính',
                     steps=['Tô màu hai nửa vương miện, cắt theo nét đứt, dán nối thành vòng vừa đầu.', 'Chọn huy hiệu số bằng tuổi mình, dán giữa vương miện.',
                            'Đội vương miện, làm "Vũ\'s birthday": hỏi – đáp "How old are you? – I\'m seven years old. 你几岁？– 我七岁。"',
                            'So số với bạn: "Eight is bigger than seven! 八大于七！"'], en="I'm ___ years old.", zh='我___岁。'),
           '3': dict(kind='frame', name='Khung ảnh gia đình · Our Family Photos', mat='giấy A4, ảnh hoặc tranh vẽ người thân, hồ dán, bút sáp',
                     steps=['Con dán ảnh hoặc vẽ người thân vào khung, cô giúp viết nhãn.', 'Đôi bạn hỏi – đáp: "Who is he? – He is my uncle. 他是谁？– 他是我叔叔。"',
                            'Giới thiệu trước lớp 3 người: "This is my family. I love them! 这是我的家人。我爱他们！"'],
                     slots=[('mother', '妈妈'), ('father', '爸爸'), ('older brother', '哥哥'), ('younger sister', '妹妹'), ('uncle', '叔叔'), ('aunt', '阿姨')])},
}

def lineart(src, outdir, rel_out):
    h = hashlib.sha1(src.encode()).hexdigest()[:10]; fn = f'{outdir}/to-mau/{h}.png'
    if not os.path.exists(fn):
        im = Image.open(src).convert('RGBA'); base = Image.new('RGBA', im.size, (255, 255, 255, 255)); base.alpha_composite(im)
        if max(base.size) > 900: base.thumbnail((900, 900))
        g = base.convert('L').filter(ImageFilter.GaussianBlur(1.1)); a = np.asarray(g).astype(float)
        e = np.asarray(g.filter(ImageFilter.FIND_EDGES)).astype(float)
        o = np.where((a < 75) | (e > 26), 0, 255).astype('uint8')
        os.makedirs(os.path.dirname(fn), exist_ok=True)
        Image.fromarray(o).filter(ImageFilter.MedianFilter(3)).convert('1').save(fn, optimize=True)
    return rel_out + f'to-mau/{h}.png'

def the_chu(en, zh, out):
    W = 600; im = Image.new('RGB', (W, W), (255, 250, 236)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 14, W - 15, W - 15], 48, outline=(240, 200, 80), width=14, fill=(255, 252, 244))
    f1 = ImageFont.truetype(FONT, 88 if len(en) < 10 else (64 if len(en) < 16 else 48)); f2 = ImageFont.truetype(FONT, 110 if len(zh) < 4 else 80)
    for txt, f, y in ((en, f1, 200), (zh, f2, 390)):
        w = d.textlength(txt, font=f); d.text(((W - w) / 2, y - f.size // 2), txt, font=f, fill=(47, 70, 60))
    os.makedirs(os.path.dirname(out), exist_ok=True); im.save(out, quality=88)

def qr_svg(url):
    img = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=1)
    s = img.to_string(encoding='unicode'); return s[s.index('<svg'):]

def hz_data(ch):
    p = os.path.join(HZ, ch + '.json')
    return json.load(open(p))['strokes'] if os.path.exists(p) else None

for L, C in LEVELS.items():
    SD = load_js(C['data']); D = SD['days']; MG = mod('m' + L, C['mang']).U
    out = C['out']; os.makedirs(out + '/to-mau', exist_ok=True)
    web = C['web']
    def R(img):   # đường dẫn ảnh trong dữ liệu web -> tính từ gốc repo
        if not img: return ''
        return os.path.normpath(os.path.join(web, img)).replace('\\', '/')
    def has_pic(p): return p and '/the/' not in p and os.path.exists(p)
    def LA(p): return lineart(p, out, '') if has_pic(p) else ''
    def unit_of(n):
        u = str(D[str(n)].get('unit'))
        for k, us in C['units'].items():
            if u in map(str, us): return k
        return None
    HZD = {}
    def card(c):
        img = R(c.get('img', ''))
        if not img or not os.path.exists(img):
            slug = re.sub(r'[^a-z0-9]+', '_', c['en'].lower()).strip('_')[:30]
            img = f"{web}/{'tai-nguyen-ls' if L == 'LS' else 'tai-nguyen'}/the/{slug}.webp"
            if not os.path.exists(img): the_chu(c['en'], c.get('zh', ''), img)
        return {'en': c['en'], 'zh': c.get('zh', ''), 'py': c.get('py') or PY(c.get('zh', '')), 'img': img, 'line': LA(img)}
    def uniq(ws):   # tranh trùng (vd. one, two, three cùng một tranh đếm) không dùng cho trò chọn tranh
        seen_i, out_ = set(), []
        for w in ws:
            if w['img'] in seen_i: continue
            seen_i.add(w['img']); out_.append(w)
        return out_
    units, sessions = [], []
    for uk, us in C['units'].items():
        days = sorted(int(k) for k, d in D.items() if str(d.get('unit')) in map(str, us))
        words, seen = [], set()
        for n in days:
            for s in D[str(n)]['steps']:
                if s['type'] == 'the':
                    for c in s['cards']:
                        if c.get('on') or c['en'] in seen: continue
                        seen.add(c['en']); words.append(card(c))
        parts, story_lines = [], []
        for n in days:
            if D[str(n)].get('kind') not in ('Phần', 'phan'): continue
            tr = next((s for s in D[str(n)]['steps'] if s['type'] == 'truyen' and not s.get('lab')), None)
            if not tr: continue
            sc = tr.get('scenes') or tr.get('scenes_en')
            parts.append({'day': n, 'title': tr.get('title', ''), 'scenes': [{'who': x['who'], 'img': R(x['img']), 'en': x['en'], 'zh': x.get('zh', ''), 'py': PY(x.get('zh', ''))} for x in sc]})
        # big book + vè: theo mạng văn bản; ảnh lấy đúng ảnh trang big book trên web
        webbb, webve = {}, {}
        for n in days:
            for s in D[str(n)]['steps']:
                if s.get('lab') in ('Big book và vè', 'Big book'):
                    for x in s.get('scenes') or [p for p in s.get('pages', []) if not p.get('cover')]: webbb.setdefault(x['en'], R(x['img']))
                if s['type'] == 've':   # vè tách thành bước riêng (12/11): giữ chữ hoa đánh dấu phách mạnh cho tờ vè in
                    for x in s['lines']: webve.setdefault(x.get('raw') or x['en'], (x['zh'], x.get('py', '')))
        bbs, ves = [], []
        for u in us:
            M = MG.get(u)
            if M and M.get('bb'):
                bbs.append({'title': M['bb'][0], 'title_zh': M['bb'][1], 'pages': [{'en': e, 'zh': z, 'py': PY(z), 'img': webbb.get(e, '')} for _, e, z in M['bb'][2]]})
            if M and M.get('ve'):
                ves.append({'lines': [{'en': e, 'zh': z, 'py': PY(z), 'van': v} for _, e, z, v in M['ve']]})
        if not bbs:   # Little Seed U1: lấy từ web (big book "Goodbye, Puppy!" + vè chào)
            pg = [{'en': e, 'zh': '', 'py': '', 'img': i} for e, i in webbb.items() if 'song' not in i]
            zh = {x['en']: (x['zh'], PY(x['zh'])) for n in days for s in D[str(n)]['steps'] if s.get('lab') for x in (s.get('scenes') or s.get('pages') or [])}
            for p in pg: p['zh'], p['py'] = zh.get(p['en'], ('', ''))
            bbs.append({'title': 'Goodbye, Puppy!', 'title_zh': '小狗，再见！', 'pages': pg})
            ves.append({'lines': [{'en': e, 'zh': z, 'py': PY(z), 'van': ''} for e, (z, p) in webve.items()]})
        for b in bbs:   # bìa: trang khung dán ảnh con + tên truyện (chị chốt 12/11, thay bìa chỉ cảnh nền): bia_nen.webp cạnh tranh các trang
            p1 = next((p['img'] for p in b['pages'] if '/bigbook/' in p['img']), '')
            if p1 and os.path.exists(p1.rsplit('/', 1)[0] + '/bia_khung.webp'): b['cover'] = p1.rsplit('/', 1)[0] + '/bia_khung.webp'
            for p in b['pages']: p['line'] = '' if '/bigbook/' in p['img'] else LA(p['img'])   # tranh big book vẽ Canva: nhiều chi tiết, không làm nét tô (trang in không dùng)
        who = []
        for p in parts:
            for x in p['scenes']:
                if x['who'] not in who and x['who'] in SD['who'] and x['who'] not in ('narr',): who.append(x['who'])
        chars = [{'key': k, 'name': SD['who'][k][0], 'img': R(SD['who'][k][1]), 'line': LA(R(SD['who'][k][1]))} for k in who if os.path.exists(R(SD['who'][k][1]))]
        strips, st_seen = [], set()
        for p in parts:
            for x in p['scenes']:
                e = x['en'].strip()
                if x['who'] == 'narr' or '___' in e or len(e.split()) < (2 if L == 'LS' else 3) or e in st_seen: continue
                st_seen.add(e); strips.append({'en': e, 'zh': x['zh'], 'py': x['py']})
        pics = uniq([w for w in words if has_pic(w['img'])])
        check = []
        for i, w in enumerate(pics[:6]):
            others = [x for x in pics if x is not w]
            o = [others[(i * 3 + 1) % len(others)], others[(i * 3 + 2) % len(others)]] if len(others) >= 2 else others
            opts = [w] + [x for x in o if x is not w][:2]
            r = i % 3; opts = opts[r:] + opts[:r]
            check.append({'say': w['en'] if i < 3 else w['zh'], 'l': 'en' if i < 3 else 'zh', 'opts': [x['img'] for x in opts], 'ans': opts.index(w)})
        readers = []
        for u in us:
            rd = SD['reader'].get(str(u))
            if not rd: continue
            url = PAGES + web + f'/#/reader/{u}/1'
            readers.append({'u': u, 't': rd['t'], 'zh': rd['zh'], 'url': url, 'qr': qr_svg(url),
                            'pages': [{'img': R(x['img']), 'en': x['en'], 'zh': x.get('zh', ''), 'py': PY(x.get('zh', '')), 'part': x.get('part')} for x in rd['pages']]})
        cr = dict(CRAFT[L].get(uk) or dict(kind='none', name='(chưa làm)', mat='', steps=[]))
        if cr['kind'] == 'necklace': cr['kids'] = [{'img': c['img'], 'line': c['line'], 'name': c['name']} for c in
                                                     [{'img': R(SD['who'][k][1]), 'line': LA(R(SD['who'][k][1])), 'name': SD['who'][k][0]} for k in ('bong', 'leo', 'anna', 'xiaomei')]]
        if cr['kind'] == 'cake': cr['cake'] = LA('seedling/tai-nguyen/tranh/cake.webp')
        if cr['kind'] == 'album':
            fam = [('fam_bong_me', 'Mommy', '妈妈'), ('fam_bong_bo', 'Daddy', '爸爸'), ('fam_bong_ong', 'Grandpa', '爷爷'), ('fam_bong_ba', 'Grandma', '奶奶')]
            cr['slots'] = [{'en': e, 'zh': z, 'line': LA(f'seedling/tai-nguyen/nhan-vat/{k}_a.webp')} for k, e, z in fam]
        if cr['kind'] == 'puppet': cr['face'] = LA('seedling/tai-nguyen/nhan-vat/kids_bong_a.webp')
        if cr['kind'] == 'crown': cr['nums'] = [{'n': n, 'en': e, 'zh': z} for n, e, z in [(4, 'four', '四'), (5, 'five', '五'), (6, 'six', '六'), (7, 'seven', '七'), (8, 'eight', '八'), (9, 'nine', '九')]]
        UQ = {str(q['u']): q['n'] for q in SD.get('units_q', [])}
        un = UNIT_NAME[L].get(uk) or (UQ.get(uk, 'Unit ' + uk), '')
        units.append({'key': uk, 'name': un[0], 'name_zh': un[1], 'days': days, 'words': words, 'pics': [w['img'] for w in uniq(words)], 'chars': chars, 'bb': bbs, 've': ves, 'parts': parts,
                      'strips': strips[:12], 'check': check, 'readers': readers, 'craft': cr, 'photo': PHOTO[L].get(uk, ('', ''))})
    UK = {u['key']: u for u in units}
    for k in range(1, len(SD['lop']) + 1):
        Lp = SD['lop'][str(k)]; ds = Lp['days']; uk = unit_of(ds[0])
        if uk is None:   # buổi Ôn / thi: không có unit riêng
            sessions.append({'n': k, 't': Lp['t'], 'about': Lp.get('about', ''), 'days': ds, 'unit': 'Ôn', 'words': [], 'wb': None}); continue
        U = UK[uk]
        sw, seen = [], set()
        for n in ds:
            for s in D[str(n)]['steps']:
                if s['type'] == 'the':
                    for c in s['cards']:
                        if not c.get('on') and c['en'] not in seen: seen.add(c['en']); sw.append(card(c))
        lines = [x for p in U['parts'] if p['day'] in ds for x in p['scenes']]
        S = {'n': k, 't': Lp['t'], 'about': Lp.get('about', ''), 'days': ds, 'unit': uk, 'words': sw}
        pics = uniq([w for w in sw if has_pic(w['img'])] or [w for w in U['words'] if has_pic(w['img'])])
        if len(pics) < 3: pics = uniq(pics + [w for w in U['words'] if has_pic(w['img'])])
        if L == 'LS':
            sc = next((x for x in lines if x['who'] != 'narr'), lines[0] if lines else None)
            if sc is None:   # ngày cả truyện: lấy cảnh của phần cuối unit
                sc = U['parts'][min(len(U['parts']) - 1, k % max(1, len(U['parts'])))]['scenes'][0]
            m3 = pics[:3]
            S['wb'] = {'scene': {'line': LA(sc['img']), 'en': sc['en'], 'zh': sc['zh']}, 'match': [{'img': w['img'], 'line': w['line'], 'en': w['en'], 'zh': w['zh']} for w in m3],
                       'order': [(i + 2) % len(m3) for i in range(len(m3))] if len(m3) > 1 else [0], 'photo': U['photo']}
        else:
            wb = Lp.get('wb', ['', ''])
            ew = [x.strip() for x in re.split(r'[,;]', wb[0]) if x.strip() and not x.startswith('(')]
            zc = HAN.findall(wb[1] if len(wb) > 1 else '')
            if not ew or not zc:   # buổi ôn: lấy lại từ, chữ của các buổi trước trong unit
                prev = [x for x in sessions if x['unit'] == uk]
                ew = ew or [w['w'] for x in prev for w in x['wb']['en']['words']][-3:]
                zc = zc or [c for x in prev for c in x['wb']['zh']['chars']][-2:]
            def pic_of(w):
                for c in sw + U['words']:
                    if re.search(r'\b' + re.escape(w.lower()), c['en'].lower()) and has_pic(c['img']): return c['img']
                return ''
            ewords = [{'w': w if isinstance(w, str) else w['w'], 'img': pic_of(w if isinstance(w, str) else w['w'])} for w in ew[:3]]
            # đọc – đánh dấu: câu của truyện (đúng) và câu đổi một từ (sai)
            cand, _seen = [], set()
            for x in (lines or [s for p in U['parts'] for s in p['scenes']]):
                if x['who'] != 'narr' and 3 <= len(x['en'].split()) <= 9 and '___' not in x['en'] and x['en'] not in _seen: _seen.add(x['en']); cand.append(x)
            uw = [w['en'] for w in U['words'] if len(w['en'].split()) == 1 and w['en'].isalpha()]
            nums = ['six', 'seven', 'eight', 'nine', 'ten']
            tick = []
            for i, x in enumerate(cand[:6]):
                if len(tick) == 3: break
                e = x['en']; ok = (i % 2 == 0)
                if not ok:
                    hit = next((w for w in uw + nums + ['Bông', 'Leo', 'Anna', 'Xiaomei'] if re.search(r'\b' + re.escape(w) + r'\b', e)), None)
                    if not hit: ok = True
                    else:
                        alts = [w for w in (nums if hit in nums else (['Bông', 'Leo', 'Anna', 'Xiaomei'] if hit[0].isupper() else uw)) if w != hit]
                        e = re.sub(r'\b' + re.escape(hit) + r'\b', alts[(i * 5) % len(alts)], e, count=1)
                tick.append({'line': LA(x['img']), 'en': e, 'ok': ok, 'goc': x['en']})
            for c in zc:
                if c not in HZD: HZD[c] = hz_data(c)
            zm = [w for w in pics if w['zh'] and len(HAN.findall(w['zh'])) <= 4][:3]
            S['wb'] = {'en': {'words': ewords, 'tick': tick}, 'zh': {'chars': zc[:2], 'match': [{'img': w['img'], 'zh': w['zh'], 'py': w['py']} for w in zm], 'order': [(i + 1) % len(zm) for i in range(len(zm))] if len(zm) > 1 else [0]}}
        sessions.append(S)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import wb2 as _wb2   # (13/11) sách bài tập bản 2: Unit 1, 3
    W2 = _wb2.build(L, units, sessions, LA, PY, hz_data, SD['lop'])
    HZD.update({c: v for c, v in W2['hz'].items()})
    data = {'level': L, 'title': C['title'], 'web': web, 'units': units, 'sessions': sessions, 'hz': HZD, 'wb2': {'pages': W2['unit_pages'], 'check': W2['check']},
            'root': '../../' if L == 'LS' else '../../../'}
    open(f'{out}/hoc-lieu-data.js', 'w').write('window.HL=' + json.dumps(data, ensure_ascii=False) + ';\n')
    here = os.path.dirname(os.path.abspath(__file__))
    for fn in ('hoc-lieu.js', 'hoc-lieu.css', 've-loi.js'): open(f'{out}/{fn}', 'w').write(open(os.path.join(here, fn)).read())
    open(f'{out}/robot48.js', 'w').write(open(os.path.join(here, '..', '..', 've48', 'robot48.js')).read())   # Robo Bi (nhân vật hát vè)
    VER = hashlib.md5(b''.join(open(f'{out}/{fn}', 'rb').read() for fn in ('hoc-lieu-data.js', 'hoc-lieu.js', 'hoc-lieu.css', 've-loi.js', 'robot48.js'))).hexdigest()[:8]
    open(f'{out}/index.html', 'w').write(f'''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{C['title'].split(' · ')[0]} · Web dạy · Học liệu in</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="hoc-lieu.css?v={VER}"></head>
<body><div id="app"></div><script src="hoc-lieu-data.js?v={VER}"></script><script src="ve-loi.js?v={VER}"></script><script src="robot48.js?v={VER}"></script><script src="hoc-lieu.js?v={VER}"></script></body></html>
''')
    print(L, 'unit', [(u['key'], len(u['words']), len(u['parts']), len(u['strips'])) for u in units], 'buổi', len(sessions),
          'tranh tô màu', len(os.listdir(out + '/to-mau')), 'chữ Hán', list(HZD), 'thiếu nét', [c for c, v in HZD.items() if not v])
