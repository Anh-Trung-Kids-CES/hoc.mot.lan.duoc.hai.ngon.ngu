import sys, json, re, os
from PIL import Image
import numpy as np
OUT = '/home/claude/work/tranh'; os.makedirs(OUT, exist_ok=True)
def slug(w): return re.sub(r'[^a-z0-9]+', '_', w.lower()).strip('_')[:40]
def cut(sheet_path, words):
    im = Image.open(sheet_path).convert('RGB'); W, H = im.size
    res = {}
    for i, w in enumerate(words):
        r, c = divmod(i, 3)
        box = (int(c * W / 3) + 10, int(r * H / 3) + 10, int((c + 1) * W / 3) - 10, int((r + 1) * H / 3) - 10)
        cell = im.crop(box); a = np.asarray(cell).astype(int)
        nonw = a.min(axis=2) < 238
        ys, xs = np.where(nonw)
        if len(xs):
            cell = cell.crop((max(xs.min() - 6, 0), max(ys.min() - 6, 0), min(xs.max() + 7, cell.width), min(ys.max() + 7, cell.height)))
        s = max(cell.size); sq = Image.new('RGB', (s, s), 'white'); sq.paste(cell, ((s - cell.width) // 2, (s - cell.height) // 2))
        sq = sq.resize((360, 360), Image.LANCZOS)
        f = f'{slug(w)}.webp'; sq.save(os.path.join(OUT, f), 'WEBP', quality=86); res[w] = f
    return res
if __name__ == '__main__':
    print(cut(sys.argv[1], json.loads(sys.argv[2])))
