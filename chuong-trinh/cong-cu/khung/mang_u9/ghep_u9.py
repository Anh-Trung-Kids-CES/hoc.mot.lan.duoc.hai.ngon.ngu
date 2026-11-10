"""Ghép tranh cảnh Unit 9 (picnic) cho cả hai web từ nhân vật, nền và tranh đồ ăn có sẵn (nét web 21 ngày).
Mỗi câu một tranh: người nói + người nghe trên nền công viên (cảnh cuối Seedling ở nhà), đồ ăn được nhắc trong câu hiện trong thẻ tranh.
Chạy ở thư mục gốc repo: python3 -I chuong-trinh/cong-cu/khung/mang_u9/ghep_u9.py
"""
from PIL import Image, ImageDraw
import json, os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
NV = os.path.join(ROOT, 'seedling/tai-nguyen/nhan-vat/'); TR = os.path.join(ROOT, 'seedling/tai-nguyen/trang/'); PIC = os.path.join(ROOT, 'seedling/tai-nguyen/tranh/')
MANG = os.path.join(ROOT, 'chuong-trinh/cong-cu/khung/grid/mang/')
FILE = {'bong': 'kids_bong_a', 'vu': 'nv_vu_a', 'nhan': 'nv_vu_a', 'leo': 'kids_leo_a', 'anna': 'kids_anna_a', 'xiaomei': 'kids_xiaomei_a',
        'me': 'fam_bong_me_a', 'me_bong': 'fam_bong_me_a'}
FOOD = [('ice cream', 'ice_cream'), ('apple juice', 'juice'), ('juice', 'juice'), ('apple', 'apple'), ('banana', 'banana'), ('pizza', 'pizza'), ('rice', 'rice'),
        ('milk', 'milk'), ('water', 'water'), ('bread', 'bread'), ('noodle', 'noodles'), ('chips', 'chips'), ('burger', 'burger'), ('candy', 'candy'),
        ('fruit', 'fruit'), ('food', 'food'), ('cross', 'cross'), ('picnic', 'picnic'), ('egg', 'egg')]
def foods(t):
    t = t.lower(); out = []
    for k, f in FOOD:
        if k in t and f not in out and not any(k in o.replace('_', ' ') for o in out): out.append(f)
        t = t.replace(k, ' ')
    return out[:2]
def card(f, size):
    im = Image.open(PIC + f + '.webp').convert('RGBA').resize((size, size), Image.LANCZOS)
    pad = 10; c = Image.new('RGBA', (size + 2 * pad, size + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(c).rounded_rectangle([0, 0, size + 2 * pad - 1, size + 2 * pad - 1], 26, fill=(255, 255, 255, 255), outline=(240, 200, 80, 255), width=6)
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], 20, fill=255)
    c.paste(im, (pad, pad), m); return c
def scene(out, bg, people, items):
    base = Image.open(TR + bg).convert('RGBA').resize((900, 900))
    n = len(people)
    for i, w in enumerate(people):
        im = Image.open(NV + FILE[w] + '.webp').convert('RGBA')
        h = 600 if w.startswith('me') else 470
        im = im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
        cx = int(900 * (i + 1) / (n + 1)); base.alpha_composite(im, (cx - im.width // 2, 885 - h))
    for j, f in enumerate(items):
        c = card(f, 220 if len(items) == 1 else 190)
        x = (900 - c.width) // 2 if len(items) == 1 else (180 + j * 330); base.alpha_composite(c, (x, 40))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    base.convert('RGB').save(out, quality=86)

def build(parts, outdir, bg_last=None):
    names = {}
    for k, p in enumerate(parts):
        for i, s in enumerate(p):
            who = s[0]; nxt = p[i + 1][0] if i + 1 < len(p) else (p[i - 1][0] if i else who)
            if nxt == who: nxt = p[i - 1][0] if i else (p[i + 1][0] if i + 1 < len(p) else who)
            ppl = [who] if nxt == who else [who, nxt]
            it = foods(s[1]) or (foods(p[i - 1][1]) if i else []) or ['picnic']
            bg = bg_last if (bg_last and k == len(parts) - 1) else 'ls_park.webp'
            f = f'{outdir}/p{k + 1}_{i + 1}.webp'
            scene(os.path.join(ROOT, f), bg, ppl, it); names[(k, i)] = f
    return names

if __name__ == '__main__':
    LS = json.load(open(MANG + 'mau_little-seed_u9.json')); SD = json.load(open(MANG + 'mau_seedling48_u9.json'))
    a = build(LS['T1']['phan'], 'little-seed/tai-nguyen-ls/canh/u9')
    b = build(SD['T1']['phan'], 'seedling/tai-nguyen/canh/u9', bg_last='ls_home.webp')
    print(len(a), len(b))
