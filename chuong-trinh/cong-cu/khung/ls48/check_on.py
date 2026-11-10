"""Soát từ Ôn tiếng Anh chưa từng dạy trước đó (lớp chưa học PreB)."""
import json, re, sys
d = json.load(open('../grid/mang/little-seed48.json'))
taught = set()
bad = []
def words(seg):
    seg = re.sub(r'\([^)]*\)', '', seg)
    seg = seg.split(':', 1)[1] if ':' in seg else ''
    out = []
    for w in re.split(r'[,/;·]| – ', seg):
        w = w.strip().lower()
        if w and w not in ('–', '-') and len(w) < 20: out.append(w)
    return out
for x in d['days']:
    segs = x['en']['tu'].split(' | ')
    for s in segs:
        head = s.split(':')[0]
        if head.startswith('Mới') or head.startswith('Nền') or head.startswith('Nghe'):
            taught.update(words(s))
    for s in segs:
        head = s.split(':')[0]
        if head.startswith('Ôn'):
            for w in words(s):
                if w not in taught and not re.match(r'^(one|u\d|thẻ)', w):
                    bad.append((x['ngay'], w))
from collections import defaultdict
g = defaultdict(list)
for n, w in bad: g[w].append(n)
for w, ns in sorted(g.items(), key=lambda t: t[1][0]): print(w, ns[:6])
print(len(g), 'từ')
