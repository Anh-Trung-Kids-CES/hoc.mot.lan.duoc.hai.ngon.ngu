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
# Bìa: Bông vẫy chào, mèo và Puppy ló ra ở hai mép
b = nen('ls_home'); put(b, BONG(520), 450, 860)
put(b, nv('pets_meo_ngoi_a', 300, True), 20, 870, sh=False); put(b, nv('pets_cun_ngoi_a', 320), 880, 870, sh=False)
save(b, 'bia')

# 1 – đoán: mẹ bước vào từ mép phải, chỉ thấy mái tóc dài và một bên váy
b = nen('ls_home'); put(b, BONG(), 300, 860); put(b, nv('fam_bong_me_a', 640), 925, 860, sh=False); save(b, 'p1_doan')
b = nen('ls_home'); put(b, BONG(), 300, 860); put(b, nv('fam_bong_me_a', 640), 640, 860); save(b, 'p1_chao')

# 2 – đoán: bố trốn sau ghế sofa, chỉ thấy tóc và cặp kính
b = nen('ls_home'); d = nv('fam_bong_bo_a', 660); top = 860 - int(SOFA.height * 620 / SOFA.width)
b.alpha_composite(part(d, (0, 0, 1, .4)), (470 - d.width // 2, top - 105)); sofa(b); save(b, 'p2_doan')
b = nen('ls_home'); sofa(b, cx=600); put(b, d, 250, 870); save(b, 'p2_chao')

# 3 – đoán: cái đuôi vằn cam thò lên sau lưng ghế
meo = nv('pets_meo_dung_a', 330)
b = nen('ls_home'); b.alpha_composite(part(meo, (.76, 0, 1, .55)), (560 - meo.width // 2, top - 160)); sofa(b); save(b, 'p3_doan')
b = nen('ls_home'); sofa(b); put(b, nv('pets_meo_dung_a', 300), 470, top + 150, sh=False); save(b, 'p3_chao')

# 4 – đoán: lại một cái đuôi (màu nâu, không có vằn) – cô đọc "Hello, kitten?", con tinh ý nói "No!"
cun = nv('pets_cun_dung_a', 330)
cg = nv('pets_cun_dung_a', 460); b = nen('ls_home'); b.alpha_composite(part(cg, (0, .34, .155, .62)), (520 - cg.width // 2, top - 245)); sofa(b); save(b, 'p4_doan')
b = nen('ls_home'); sofa(b); put(b, cun, 300, 860); put(b, nv('pets_meo_dung_a', 280, True), 560, top + 150, sh=False); save(b, 'p4_chao')

# 5 – lớp học: cô giơ quyển sách che mặt, chỉ thấy váy xanh ngọc và tay
lan = nv('nv_lan_a', 640)
b = nen('ls_class'); put(b, BONG(420, True), 230, 880); put(b, lan, 640, 900)
book = Image.new('RGBA', (240, 180), (0, 0, 0, 0)); dr = ImageDraw.Draw(book)
dr.rounded_rectangle([0, 0, 239, 179], 16, fill=(200, 55, 45, 255), outline=(60, 30, 20, 255), width=6); dr.line([120, 4, 120, 175], fill=(60, 30, 20, 255), width=5)
for cx in (60, 180): dr.ellipse([cx - 32, 60, cx + 32, 124], fill=(242, 193, 78, 255), outline=(60, 30, 20, 255), width=4)
b.alpha_composite(book, (640 - 120, 900 - 640 + 5)); save(b, 'p5_doan')
b = nen('ls_class'); put(b, BONG(420, True), 230, 880); put(b, lan, 640, 900); save(b, 'p5_chao')

# 6 – bàn tay vẫy ló ra từ mép trái → bạn Leo
leo = nv('kids_leo_a', 470)
b = nen('ls_class'); put(b, BONG(420, True), 600, 880); b.alpha_composite(leo, (-int(leo.width * .5), 880 - leo.height)); save(b, 'p6_doan')
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
