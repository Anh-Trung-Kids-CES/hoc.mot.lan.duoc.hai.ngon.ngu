#!/usr/bin/env python3
"""Cắt nền trắng của tranh kho (tai-nguyen/tranh/*.webp) thành hình dán có nền trong suốt cho Phép thuật lời nói.
Chạy: python3 cat_nen.py [thư_mục_ra]. Chỉ cắt các vật có trong phep-thuat-du-lieu.js (mục src 'phep-thuat/…', không có emoji dự phòng)."""
import json, os, sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
T = ROOT + '/seedling/tai-nguyen/'
OUT = sys.argv[1] if len(sys.argv) > 1 else T + 'phep-thuat/'
os.makedirs(OUT, exist_ok=True)
s = open(ROOT + '/seedling/phep-thuat-du-lieu.js', encoding='utf8').read()
D = json.loads(s[s.index('=') + 1:].rstrip().rstrip(';'))

def cut(path, size=420):
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(int)
    mn = a.min(axis=2); mx = a.max(axis=2)
    near = (mn >= 232) & ((mx - mn) <= 22)                     # gần trắng, ít sắc
    lab, n = ndi.label(near)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # tranh có khung màu phẳng (áo, váy, mũ…): lớp vỏ ngoài của hình sau khi bỏ nền trắng gần như một màu → xoá luôn khung
    nb = ~bg; shell = nb & ~ndi.binary_erosion(nb, iterations=4)
    if shell.sum() > 200:
        cols = a[shell]; med = np.median(cols, axis=0)
        if (np.abs(cols - med).max(axis=1) < 26).mean() > .8:
            same = (np.abs(a - med).max(axis=2) < 34) & nb
            lab2, _ = ndi.label(same)
            keep = set(np.unique(lab2[shell & same])) - {0}
            bg = bg | np.isin(lab2, list(keep))
    bg = ndi.binary_dilation(bg, iterations=1)                  # ăn vào viền 1px cho hết quầng trắng
    alpha = Image.fromarray(((~bg) * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.8))
    out = im.convert('RGBA'); out.putalpha(alpha)
    bb = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    pad = 6; out = out.crop((max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, out.width), min(bb[3] + pad, out.height)))
    sc = size / max(out.size)
    if sc < 1: out = out.resize((max(1, round(out.width * sc)), max(1, round(out.height * sc))), Image.LANCZOS)
    return out

done = []
for i, o in D['objs'].items():
    if not o['src'].startswith('phep-thuat/') or 'e' in o: continue
    out = cut(T + 'tranh/' + i + '.webp'); out.save(OUT + i + '.webp', 'WEBP', quality=90, method=6); done.append(i)
print('đã cắt', len(done), 'hình →', OUT)
# bảng xem thử trên nền ca-rô
cw = 200; names = sorted(done); cols = 8; rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (cw * cols, cw * rows), (200, 230, 200))
for k, n in enumerate(names):
    im = Image.open(OUT + n + '.webp'); im.thumbnail((cw - 12, cw - 12)); sheet.paste(im, ((k % cols) * cw + 6, (k // cols) * cw + 6), im)
sheet.save('/tmp/claude-0/-home-claude/32ae9290-cafc-5e66-a05b-ade1745c64d7/scratchpad/cut_sheet.png')
