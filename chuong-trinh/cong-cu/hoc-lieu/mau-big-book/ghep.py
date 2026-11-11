"""Big book mẫu theo quy tắc thiết kế mới (11/11/2026): Little Seed U1 "Hello, …?" – trang đoán (hé lộ một phần) → lật trang → trang chào.
Ghép từ tranh nhân vật, nền, đồ vật có sẵn (nét web 21 ngày). Chạy ở gốc repo: python3 -I chuong-trinh/cong-cu/hoc-lieu/mau-big-book/ghep.py"""
from PIL import Image, ImageDraw, ImageFilter
import os
from collections import deque
NV = 'seedling/tai-nguyen/nhan-vat/'; TRG = 'seedling/tai-nguyen/trang/'; PIC = 'seedling/tai-nguyen/tranh/'
OUT = 'little-seed/day/mau-big-book/tranh/'; os.makedirs(OUT, exist_ok=True)
S = 900

def nv(name, h, flip=False):
    im = Image.open(NV + name + '.webp').convert('RGBA'); im = im.crop(im.getbbox())
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im.resize((max(1, int(im.width * h / im.height)), h), Image.LANCZOS)

def key_white(path, tol=28):
    """Tách đồ vật khỏi nền sáng: loang từ mép, bỏ điểm gần màu nền."""
    im = Image.open(path).convert('RGBA'); w, h = im.size; px = im.load()
    ref = px[2, 2][:3]; seen = bytearray(w * h); q = deque()
    for x in range(w): q.extend([(x, 0), (x, h - 1)])
    for y in range(h): q.extend([(0, y), (w - 1, y)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y * w + x]: continue
        seen[y * w + x] = 1; r, g, b, a = px[x, y]
        if abs(r - ref[0]) + abs(g - ref[1]) + abs(b - ref[2]) > tol * 3 and min(r, g, b) < 200: continue
        px[x, y] = (r, g, b, 0); q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    a = im.split()[3].filter(ImageFilter.MinFilter(3)); im.putalpha(a)
    return im.crop(im.getbbox())

def nen(name):
    return Image.open(TRG + name + '.webp').convert('RGBA').resize((S, S))

def shadow(base, x, y, w):
    d = ImageDraw.Draw(base, 'RGBA'); d.ellipse([x - w // 2, y - 14, x + w // 2, y + 10], fill=(80, 60, 40, 55))

def put(base, im, cx, bottom, sh=True):
    if sh: shadow(base, cx, bottom - 6, int(im.width * .8))
    base.alpha_composite(im, (int(cx - im.width / 2), int(bottom - im.height)))

def save(base, name):
    base.convert('RGB').save(OUT + name + '.webp', quality=90); print(name)

SOFA = key_white(PIC + 'sofa.webp')
def sofa(base, cx=470, bottom=860, w=620):
    s = SOFA.resize((w, int(SOFA.height * w / SOFA.width)), Image.LANCZOS); put(base, s, cx, bottom); return bottom - s.height

def part(im, box):
    """Giữ một phần tranh (box theo tỉ lệ 0–1), phần còn lại trong suốt – để chỉ hé lộ một đặc điểm."""
    w, h = im.size; x0, y0, x1, y1 = box; m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rectangle([int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)], fill=255)
    a = Image.composite(im.split()[3], Image.new('L', im.size, 0), m); out = im.copy(); out.putalpha(a); return out

BONG = lambda h=470, flip=False: nv('kids_bong_a', h, flip)
def bong(base, im, cx, by, h, skew=0.18, alpha=150, blur=1.6):
    """Bóng người in lên tường: lấy dáng nhân vật, tô sẫm, mờ nhẹ, xô nghiêng như có đèn chiếu từ phía cửa."""
    m = im.split()[3].point(lambda v: 255 if v > 40 else 0)
    w = int(im.width * h / im.height); m = m.resize((w, h))
    m = m.transform((w + int(h * abs(skew)), h), Image.AFFINE, (1, skew, -h * skew if skew > 0 else 0, 0, 1, 0), Image.BICUBIC)
    m = m.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: v * alpha // 255)
    sh = Image.new('RGBA', m.size, (55, 50, 70, 0)); sh.putalpha(m)
    base.alpha_composite(sh, (int(cx - sh.width / 2), int(by - h)))

BONG = lambda h=470, flip=False: nv('kids_bong_a', h, flip)
WALL = 545   # chân tường phòng khách ls_home (chỗ tường gặp sàn)
# Bìa: Bông vẫy chào, mèo và Puppy ngồi hai bên
b = nen('ls_home'); put(b, BONG(520), 450, 860)
put(b, nv('pets_meo_ngoi_a', 260, True), 210, 870); put(b, nv('pets_cun_ngoi_a', 280), 700, 870)
save(b, 'bia')

# Trang đoán: không cắt người, không nấp – BÓNG in trên tường; Bông quay nhìn cái bóng
# 1 – bóng tóc dài, váy → mommy
me = nv('fam_bong_me_a', 640)
b = nen('ls_home'); bong(b, me, 600, WALL + 10, 470); put(b, BONG(470, True), 260, 860); save(b, 'p1_doan')
b = nen('ls_home'); put(b, BONG(), 300, 860); put(b, me, 640, 860); save(b, 'p1_chao')

# 2 – bóng tóc ngắn, đeo kính, áo sơ mi → daddy
bo = nv('fam_bong_bo_a', 660)
b = nen('ls_home'); bong(b, bo, 610, WALL + 10, 480); put(b, BONG(470, True), 260, 860); save(b, 'p2_doan')
b = nen('ls_home'); put(b, BONG(), 300, 860); put(b, bo, 640, 860); save(b, 'p2_chao')

# 3 – bóng tai nhọn, đuôi dựng → kitten
meo = nv('pets_meo_dung_a', 330)
b = nen('ls_home'); bong(b, meo, 600, WALL + 10, 300, skew=.12); put(b, BONG(470, True), 260, 860); save(b, 'p3_doan')
b = nen('ls_home'); put(b, BONG(), 300, 860); put(b, meo, 640, 860); save(b, 'p3_chao')

# 4 – lại một cái bóng bốn chân… tai cụp, đuôi ngắn. Cô đọc "Hello, kitten?" – con phát hiện: No!
cun = nv('pets_cun_dung_a', 330)
b = nen('ls_home'); bong(b, cun, 600, WALL + 10, 310, skew=.12); put(b, BONG(470, True), 260, 860); put(b, nv('pets_meo_ngoi_a', 200, True), 430, 870); save(b, 'p4_doan')
b = nen('ls_home'); put(b, BONG(), 260, 860); put(b, cun, 560, 860); put(b, nv('pets_meo_ngoi_a', 200, True), 780, 870); save(b, 'p4_chao')

# 5 – lớp học: bóng cô (tóc ngang vai, ôm sách) in lên bảng xanh và tường
lan = nv('nv_lan_a', 640)
b = nen('ls_class'); bong(b, lan, 560, 470, 400, skew=.1, alpha=150); put(b, BONG(420), 230, 880); save(b, 'p5_doan')
b = nen('ls_class'); put(b, BONG(420, True), 230, 880); put(b, lan, 640, 900); save(b, 'p5_chao')

# 6 – cặp sách xanh của bạn trên ghế + bóng bạn tóc xoăn vẫy tay
leo = nv('kids_leo_a', 470)
bag = key_white(PIC + 'schoolbag.webp', 30); bag = bag.resize((150, int(bag.height * 150 / bag.width)), Image.LANCZOS)
b = nen('ls_class'); bong(b, leo, 330, 470, 330, skew=-.1, alpha=150); put(b, bag, 470, 720); put(b, BONG(420, True), 680, 880); save(b, 'p6_doan')
b = nen('ls_class'); put(b, BONG(420, True), 620, 880); put(b, leo, 280, 880); save(b, 'p6_chao')

# 7 – cả lớp
b = nen('ls_school')
for name, h, cx in [('kids_anna_a', 400, 150), ('kids_leo_a', 420, 330), ('nv_lan_a', 520, 470), ('kids_bong_a', 410, 620), ('kids_xiaomei_a', 400, 790)]:
    put(b, nv(name, h), cx, 880)
save(b, 'p7')

# 8 – tạm biệt: nắng chiều, cả lớp vẫy
b = nen('ls_school'); b.alpha_composite(Image.new('RGBA', (S, S), (255, 140, 60, 60)))
for name, h, cx in [('kids_anna_a', 400, 200), ('kids_leo_a', 420, 400), ('kids_xiaomei_a', 400, 600), ('kids_bong_a', 410, 780)]:
    put(b, nv(name, h, True), cx, 880)
save(b, 'p8')

# 9 – chữ nói "Goodbye, puppy!" nhưng tranh: Puppy đã chui lên giường Bông (tranh "cãi" lời – chỗ buồn cười)
bed = key_white(PIC + 'bed.webp', 30); bw = bed.resize((720, int(bed.height * 720 / bed.width)), Image.LANCZOS)
b = nen('ls_home'); put(b, bw, 470, 880); put(b, nv('pets_cun_ngoi_a', 230), 400, 880 - int(bw.height * .5), sh=False)
put(b, BONG(400, True), 800, 890); save(b, 'p9')

# 10 – trang cuối: khung ảnh của con, Puppy ló góc khung
b = nen('ls_home'); dr = ImageDraw.Draw(b, 'RGBA')
dr.rounded_rectangle([200, 120, 700, 720], 30, fill=(255, 255, 255, 235), outline=(242, 193, 78, 255), width=18)
dr.rounded_rectangle([250, 170, 650, 670], 18, outline=(200, 200, 200, 255), width=4)
pk = nv('pets_cun_ngoi_a', 260); b.alpha_composite(part(pk, (0, 0, 1, .55)), (640, 30)); save(b, 'p10')
