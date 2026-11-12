"""So câu Whisper nghe được với câu đúng, theo pinyin có thanh (đồng âm 他/她/它 không tính là sai)."""
import json, re, sys, difflib
import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'cong-cu'))
from pinyin_chuan import py
from opencc import OpenCC
cc = OpenCC('t2s')
HAN = re.compile(r'[一-鿿]')
def han(s): return ''.join(c for c in cc.convert(s) if HAN.match(c))
def syl(s): return py(s, noi=False).replace(',', ' ').replace('.', ' ').replace('!', ' ').replace('?', ' ').split()
R = json.load(open(sys.argv[1]))
ok, nghi = 0, []
for x in R:
    zh = x['zh']
    if x.get('part'):
        parts = re.findall(r'[^!！]+[!！]', zh) or [zh]; i = x['part'][0]; zh = parts[i] if i < len(parts) else zh
    a, b = han(zh), han(x['nghe'])
    if a == b: ok += 1; continue
    pa, pb = syl(a), syl(b)
    if pa == pb: ok += 1; continue   # khác chữ nhưng cùng âm, cùng thanh
    ta = [re.sub('[^a-zü]', '', __import__('unicodedata').normalize('NFD', s).encode('ascii', 'ignore').decode()) for s in pa]
    tb = [re.sub('[^a-zü]', '', __import__('unicodedata').normalize('NFD', s).encode('ascii', 'ignore').decode()) for s in pb]
    loai = 'chi_khac_thanh' if ta == tb else ('co_ten_latin' if re.search(r'[A-Za-zÀ-ỹ]{2,}', zh) else 'khac_chu')
    r = difflib.SequenceMatcher(None, a, b).ratio()
    nghi.append({'loai': loai, 'giong': round(r, 2), 'file': x['file'], 'zh': zh, 'nghe': x['nghe'], 'py_dung': ' '.join(pa), 'py_nghe': ' '.join(pb)})
print('khớp:', ok, '/', len(R), '· nghi:', len(nghi), {k: sum(1 for n in nghi if n['loai'] == k) for k in ('khac_chu', 'chi_khac_thanh', 'co_ten_latin')})
json.dump(sorted(nghi, key=lambda n: (n['loai'] != 'khac_chu', n['giong'])), open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
