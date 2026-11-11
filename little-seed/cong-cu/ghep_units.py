"""Ghép tranh cảnh cho truyện Little Seed U2–U12 (mạng văn bản ls48_mang.py) và thẻ chữ cho từ chưa có tranh.
Mỗi câu một tranh: người nói + người nghe trên nền của unit, thẻ tranh của từ được nhắc trong câu (nét tranh web 21 ngày, nguyên tắc tranh 05/11).
Ra: little-seed/tai-nguyen-ls/canh/u<n>/p<k>_<i>.webp, little-seed/tai-nguyen-ls/the/<từ>.webp
Chạy ở thư mục gốc repo: python3 -I little-seed/cong-cu/ghep_units.py
"""
from PIL import Image, ImageDraw, ImageFont
import os, re, sys, importlib.util
ROOT = os.getcwd()
spec = importlib.util.spec_from_file_location('m', 'chuong-trinh/cong-cu/khung/grid/mang/ls48_mang.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
NV = 'seedling/tai-nguyen/nhan-vat/'; TRG = 'seedling/tai-nguyen/trang/'; PIC = 'seedling/tai-nguyen/tranh/'
OUT = 'little-seed/tai-nguyen-ls/'
FILE = {'bong': 'kids_bong_a', 'leo': 'kids_leo_a', 'anna': 'kids_anna_a', 'xiaomei': 'kids_xiaomei_a', 'vu': 'nv_vu_a', 'me': 'fam_bong_me_a',
        'bo': 'fam_bong_bo_a', 'ong': 'fam_bong_ong_a', 'ba': 'fam_bong_ba_a', 'anh': 'fam_bong_anh_trai_a', 'em': 'fam_bong_em_gai_a',
        'cun': 'pets_cun_dung_a', 'meo': 'pets_meo_ngoi_a', 'co': 'huou_huou1_a', 'me_leo': 'fam_leo_me_a'}
ANIMAL = {'duck': 'duck', 'bird': 'bird', 'fish': 'fish', 'rabbit': 'rabbit', 'mouse': 'mouse'}
WHO_VI = {'Cô Hươu': 'co', 'Bông': 'bong', 'Leo': 'leo', 'Anna': 'anna', 'Vũ': 'vu', 'Xiaomei': 'xiaomei', 'Mẹ': 'me', 'Mẹ Leo': 'me_leo', 'Bố': 'bo',
          'Cả lớp': 'lop', 'Cả nhà': 'lop', 'Ông': 'ong', 'Bà': 'ba', 'Em bé': 'em', 'Em trai': 'anh'}
def code(w):
    if w in FILE or w in ANIMAL or w in ('lop', 'narr'): return w
    w0 = re.sub(r'\s*\(.*\)', '', w).strip()
    if w0.startswith('Cún'): return 'cun'
    if w0.startswith('Mặt nạ chó'): return 'leo'
    if w0.startswith('Mặt nạ mèo'): return 'anna'
    if w0.startswith('Hai bạn') or w0.startswith('Bạn'): return 'leo'
    return WHO_VI.get(w0, 'bong')

def person(w, h):
    if w in ANIMAL:
        im = Image.open(PIC + ANIMAL[w] + '.webp').convert('RGBA'); s = int(h * 0.7)
        return card_img(im, s)
    if w == 'lop':
        ims = [Image.open(NV + FILE[k] + '.webp').convert('RGBA') for k in ('leo', 'anna', 'xiaomei')]
        hh = int(h * 0.85); ims = [i.resize((int(i.width * hh / i.height), hh), Image.LANCZOS) for i in ims]
        c = Image.new('RGBA', (sum(i.width for i in ims) - 60, hh), (0, 0, 0, 0)); x = 0
        for i in ims: c.alpha_composite(i, (x, 0)); x += i.width - 30
        return c
    im = Image.open(NV + FILE.get(w, 'kids_bong_a') + '.webp').convert('RGBA')
    hh = int(h * (1.25 if w in ('me', 'bo', 'ong', 'ba', 'me_leo') else (0.6 if w in ('cun', 'meo') else (0.95 if w == 'co' else 1.0))))
    return im.resize((int(im.width * hh / im.height), hh), Image.LANCZOS)

def card_img(im, size):
    im = im.resize((size, size), Image.LANCZOS); pad = 10
    c = Image.new('RGBA', (size + 2 * pad, size + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(c).rounded_rectangle([0, 0, size + 2 * pad - 1, size + 2 * pad - 1], 26, fill=(255, 255, 255, 255), outline=(240, 200, 80, 255), width=6)
    mk = Image.new('L', (size, size), 0); ImageDraw.Draw(mk).rounded_rectangle([0, 0, size - 1, size - 1], 20, fill=255)
    c.paste(im, (pad, pad), mk); return c

FONT = None
for f in ('/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
    if os.path.exists(f): FONT = f; break
def the_chu(en, zh, out):
    """Thẻ chữ cho từ chức năng chưa có tranh: nền kem, viền vàng, chữ Anh và chữ Hán."""
    W = 600; im = Image.new('RGB', (W, W), (255, 250, 236)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 14, W - 15, W - 15], 48, outline=(240, 200, 80), width=14, fill=(255, 252, 244))
    f1 = ImageFont.truetype(FONT, 96 if len(en) < 10 else 70); f2 = ImageFont.truetype(FONT, 120)
    for txt, f, y in ((en, f1, 190), (zh, f2, 380)):
        w = d.textlength(txt, font=f); d.text(((W - w) / 2, y - f.size // 2), txt, font=f, fill=(47, 70, 60))
    im.save(out, quality=88)

def tranh(key):
    for p in (PIC + key + '.webp', NV + key + '_a.webp', NV + key + '.webp'):
        if key and os.path.exists(p): return p
    return ''

def scene(out, bg, ppl, items):
    base = Image.open(TRG + bg + '.webp').convert('RGBA').resize((900, 900))
    n = len(ppl)
    for i, w in enumerate(ppl):
        im = person(w, 470)
        cx = int(900 * (i + 1) / (n + 1)); base.alpha_composite(im, (max(0, min(900 - im.width, cx - im.width // 2)), 885 - im.height))
    for j, f in enumerate(items[:2]):
        c = card_img(Image.open(f).convert('RGBA'), 220 if len(items) == 1 else 190)
        x = (900 - c.width) // 2 if len(items) == 1 else (180 + j * 330); base.alpha_composite(c, (x, 40))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    base.convert('RGB').save(out, quality=84)

def words_in(text, the):
    t = ' ' + re.sub(r"[^a-z' ]", ' ', text.lower()) + ' '; out = []
    for part in the:
        for w in part:
            en, img = w[0].lower(), (w[2] if len(w) > 2 else '')
            p = tranh(img)
            if p and (' ' + en + ' ' in t or ' ' + en + 's ' in t) and p not in out: out.append(p)
    return out[:2]

if __name__ == '__main__':
    os.makedirs(OUT + 'the', exist_ok=True)
    nthe = ncanh = 0
    for n, M in sorted(m.U.items()):
        for part in M['the']:
            for w in part:
                if not tranh(w[2] if len(w) > 2 else ''):
                    slug = re.sub(r'[^a-z0-9]+', '_', w[0].lower()).strip('_')
                    the_chu(w[0], w[1], OUT + f'the/{slug}.webp'); nthe += 1
        for k, (t, z, P) in enumerate(M['phan']):
            for i, (w, e, zz) in enumerate(P):
                who = code(w)
                nxt = code(P[i + 1][0]) if i + 1 < len(P) else (code(P[i - 1][0]) if i else who)
                if nxt == who: nxt = code(P[i - 1][0]) if i else who
                ppl = [who] if nxt == who else [who, nxt]
                items = words_in(e, M['the'])
                scene(OUT + f'canh/u{n}/p{k + 1}_{i + 1}.webp', M['bg'], ppl, items); ncanh += 1
    print('thẻ chữ', nthe, '· cảnh', ncanh)
