"""Tranh ghép TẠM cho big book U2 "My Name Is…" (chưa vẽ Canva) – quy tắc C ngoại lệ: chạy đúng khung bằng tranh ghép hiện có, thay khi vẽ xong.
Khổ trang như U1, U3 (1147×857). Ra: little-seed/tai-nguyen-ls/bigbook/u2/
  bia_khung.webp  bánh sinh nhật + khung ảnh trống (con dán ảnh của con, nói "My name is ___")
  p1–p5.webp      Bông, Leo, Anna, Vũ, Cún tự giới thiệu: nhân vật vẫy tay + thẻ số tuổi
Chạy ở thư mục gốc repo: python3 -I little-seed/cong-cu/ghep_bigbook_u2.py
"""
from PIL import Image, ImageDraw, ImageFont
import os, importlib.util
spec = importlib.util.spec_from_file_location('g', 'little-seed/cong-cu/ghep_units.py'); g = importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
OUT = 'little-seed/tai-nguyen-ls/bigbook/u2/'; W, H = 1147, 857
FRAME = (640, 130, 1065, 520)   # ô ảnh trên bìa (x0, y0, x1, y1) – build_ls.py đọc ra phần trăm

def nen():
    bg = Image.open(g.TRG + 'ls_home.webp').convert('RGBA').resize((W, W), Image.LANCZOS)
    return bg.crop((0, W - H, W, W))   # giữ sàn nhà, cắt bớt trần

def font(sz):
    return ImageFont.truetype(g.FONT, sz) if g.FONT else ImageFont.load_default()

def the_so(n, zh):   # thẻ tuổi: số to + chữ Hán, nến nhỏ phía trên
    s = 230; c = Image.new('RGBA', (s, s + 60), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    for k in range(n):
        x = s // 2 + (k - (n - 1) / 2) * 30
        d.rounded_rectangle([x - 7, 20, x + 7, 62], 4, fill=(120, 180, 230, 255)); d.ellipse([x - 7, 2, x + 7, 22], fill=(255, 190, 60, 255))
    d.rounded_rectangle([0, 60, s - 1, s + 59], 30, fill=(255, 250, 236, 255), outline=(240, 200, 80, 255), width=7)
    d.text((s // 2, 60 + s // 2 - 22), str(n), font=font(130), fill=(200, 55, 45, 255), anchor='mm')
    d.text((s // 2, 60 + s - 38), zh, font=font(40), fill=(60, 45, 30, 255), anchor='mm')
    return c

def trang(out, who, age):
    base = nen()
    im = g.person(who, 700 if who != 'cun' else 900)
    x = 300 - im.width // 2 if who != 'cun' else 330 - im.width // 2
    base.alpha_composite(im, (max(10, x), H - 20 - im.height))
    if age:
        c = the_so(*age); base.alpha_composite(c, (780, 230))
    base.convert('RGB').save(out, 'WEBP', quality=86)

def bia(out):
    base = nen()
    cake = g.card_img(Image.open(g.PIC + 'birthday.webp').convert('RGBA'), 380); base.alpha_composite(cake, (90, 300))
    d = ImageDraw.Draw(base); x0, y0, x1, y1 = FRAME
    d.rounded_rectangle([x0 - 22, y0 - 22, x1 + 22, y1 + 22], 18, fill=(150, 95, 50, 255))   # khung gỗ như bìa U1, U3
    d.rounded_rectangle([x0, y0, x1, y1], 8, fill=(255, 255, 255, 255))
    d.text(((x0 + x1) // 2, (y0 + y1) // 2), '?', font=font(150), fill=(225, 215, 200, 255), anchor='mm')
    base.convert('RGB').save(out, 'WEBP', quality=86)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    bia(OUT + 'bia_khung.webp')
    for k, (who, age) in enumerate([('bong', None), ('leo', (5, '五岁')), ('anna', (4, '四岁')), ('vu', (6, '六岁')), ('cun', (3, '三岁'))]):
        trang(OUT + f'p{k + 1}.webp', who, age)
    print('big book U2: bìa + 5 trang ->', OUT, '· khung ảnh (%):', [round(v, 1) for v in (FRAME[0] / W * 100, FRAME[1] / H * 100, (FRAME[2] - FRAME[0]) / W * 100, (FRAME[3] - FRAME[1]) / H * 100)])
