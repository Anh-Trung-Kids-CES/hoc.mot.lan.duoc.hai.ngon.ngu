"""Cắt tờ lưới 3x3 + hình lẻ do ve_10hinh.py vẽ thành hình dán nền trong suốt: python3 -I cat_10hinh.py <thư_mục_tranh>"""
import sys, os
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cat_nen.py'), encoding='utf8').read()
exec(src[:src.index('done = []')].replace("sys.argv[1] if len(sys.argv) > 1 else T + 'phep-thuat/'", "T + 'phep-thuat/'"))
from PIL import Image
D0 = sys.argv[1]; names = ['cake_plain', 'baby', 'robo', 'angry', 'excited', 'pencil', 'crayon', 'balloon_white', 'polar_bear']
A = Image.open(D0 + '/A.png').convert('RGB'); w = A.width // 3; ins = 22
import tempfile
for i, n in enumerate(names):
    x, y = (i % 3) * w, (i // 3) * w
    p = tempfile.mktemp(suffix='.png'); A.crop((x + ins, y + ins, x + w - ins, y + w - ins)).save(p)
    cut(p).save(OUT + n + '.webp', 'WEBP', quality=90, method=6); os.remove(p)
cut(D0 + '/fruit.png').save(OUT + 'fruit.webp', 'WEBP', quality=90, method=6)
print('đã cắt 10 hình')
