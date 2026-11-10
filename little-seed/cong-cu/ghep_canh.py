"""Ghép cảnh truyện Little Seed U1 còn thiếu từ nhân vật và nền có sẵn (nét web 21 ngày). Chạy trong thư mục gốc repo."""
from PIL import Image
import os
NV = 'seedling/tai-nguyen/nhan-vat/'; TR = 'seedling/tai-nguyen/trang/'
OUT = 'little-seed/tai-nguyen-ls/canh/u1/'
def scene(name, bg, people, flip=()):
    base = Image.open(TR + bg).convert('RGBA').resize((900, 900))
    n = len(people)
    for i, (f, h) in enumerate(people):
        im = Image.open(NV + f).convert('RGBA')
        if f in flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
        w = int(im.width * h / im.height); im = im.resize((w, h), Image.LANCZOS)
        cx = int(900 * (i + 1) / (n + 1)); x = cx - w // 2; y = 880 - h
        sh = Image.new('RGBA', (w, 40), (0, 0, 0, 0))
        base.alpha_composite(im, (x, y))
    base.convert('RGB').save(OUT + name + '.webp', quality=88)
scene('di_hoc', 'ls_school.webp', [('kids_bong_a.webp', 520), ('fam_bong_bo_a.webp', 640)])
scene('co_leo', 'ls_class.webp', [('huou_huou1_a.webp', 600), ('kids_leo_a.webp', 470)])
scene('co_anna', 'ls_class.webp', [('huou_huou1_a.webp', 600), ('kids_anna_a.webp', 470)])
scene('co_xiaomei', 'ls_class.webp', [('huou_huou1_a.webp', 600), ('kids_xiaomei_a.webp', 460)])
scene('ba_ban_chao_co', 'ls_class.webp', [('kids_leo_a.webp', 420), ('kids_anna_a.webp', 420), ('kids_xiaomei_a.webp', 410), ('huou_huou2_a.webp', 560)])
scene('leo_vu', 'ls_class.webp', [('kids_leo_a.webp', 480), ('nv_vu_a.webp', 470)], flip=('nv_vu_a.webp',))
scene('xiaomei_anna', 'ls_class.webp', [('kids_xiaomei_a.webp', 470), ('kids_anna_a.webp', 480)])
scene('co_tam_biet', 'ls_school.webp', [('huou_huou2_a.webp', 620)])
scene('leo_vu_ve', 'ls_school.webp', [('kids_leo_a.webp', 480), ('nv_vu_a.webp', 470)], flip=('nv_vu_a.webp',))
scene('me_vay', 'ls_home.webp', [('fam_bong_me_a.webp', 700)])
print(sorted(os.listdir(OUT)))
