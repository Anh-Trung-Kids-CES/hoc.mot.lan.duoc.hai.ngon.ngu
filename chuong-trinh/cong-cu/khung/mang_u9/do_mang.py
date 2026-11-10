"""Đo mạng văn bản theo nguyên tắc mục I (GrapeSEED): độ dài mỗi phần (27), câu theo khung (24), từ đã nghe (26), từ lõi trong ≥3 văn bản (23).
Chạy: python3 -I do_mang.py
- Câu theo khung: câu mở bằng mẫu khung của phần (không tính câu cửa miệng, theo cách đếm đã thống nhất 09/11).
- Từ đã nghe: từ nội dung đã gặp ở phần trước hoặc câu trước trong cùng phần (chuỗi xích, ng.t. 25), tính từ phần 2.
"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
MANG = os.path.join(HERE, '..', 'grid', 'mang')
STOP = set("a an the is are am i you he she it we they my your do does don't too and to of in on at be this that what who how not no yes oh look and".split())
def lem(w): return re.sub(r"(es|s)$", '', w) if len(w) > 4 else w
def toks(s): return [lem(w) for w in re.findall(r"[a-zà-ỹđ']+", s.lower()) if w not in STOP and len(w) > 1]
def sents(s): return [x.strip() for x in re.split(r'(?<=[!.?])\s+', s) if x.strip()]
def han(s): return len(re.findall(r'[一-鿿]', s))

def measure(name, parts, frames, catch, texts=None, core=None, lim=(10, 15), limz=(13, 22), prior=()):
    print(f'\n=== {name}')
    seen = set(lem(w) for x in prior for w in toks(x)); rows = []
    for k, p in enumerate(parts):
        en = ' '.join(s[1] for s in p); zh = ''.join(s[2] for s in p)
        S = [x for s in p for x in sents(s[1])]
        S2 = [x for x in S if x not in catch]
        fr = sum(1 for x in S2 if re.match(frames[k] if isinstance(frames, list) else frames, x, re.I))
        T = []; kn = 0
        for x in S:
            for w in toks(x):
                if w in seen: kn += 1
                T.append(w); seen.add(w)
        nw = len(re.findall(r"[A-Za-zÀ-ỹ']+", en.replace('___', '')))
        rows.append((k + 1, nw, han(zh), fr, len(S2), kn, len(T)))
        ok = '✓' if lim[0] <= nw <= lim[1] and limz[0] <= han(zh) <= limz[1] else '✗'
        print(f'  phần {k+1}: {nw} chữ Anh, {han(zh)} chữ Hán {ok} · khung {fr}/{len(S2)} = {100*fr/max(1,len(S2)):.0f}% · từ đã nghe {kn}/{len(T)} = {100*kn/max(1,len(T)):.0f}%')
    fr = sum(r[3] for r in rows); ns = sum(r[4] for r in rows); kn = sum(r[5] for r in rows[1:]); nt = sum(r[6] for r in rows[1:])
    print(f'  CẢ TRUYỆN: khung {100*fr/ns:.0f}% (mức ≥60%) · từ đã nghe từ phần 2: {100*kn/nt:.0f}% (mức ≥70%)')
    if texts and core:
        low = []
        for w in core:
            n = [t for t, v in texts.items() if re.search(r'\b' + re.escape(w) + r'(s|es)?\b', v, re.I)]
            if len(n) < 3: low.append(f'{w} ({", ".join(n)})')
        print(f'  Từ lõi có trong ≥3 văn bản: {len(core) - len(low)}/{len(core)}' + (f' · chưa đủ: {"; ".join(low)}' if low else ''))

import subprocess
G48 = json.load(open(os.path.join(MANG, 'little-seed48.json')))
def moi(cell): return [w for seg in cell.split(' | ') if seg.startswith('Mới') or seg.startswith('Nền') for w in re.split(r'[,/]', re.sub(r'\([^)]*\)', '', seg.split(':', 1)[-1]))]
LS_PRIOR = [w for d in G48['days'] if isinstance(d['unit'], int) and d['unit'] < 9 for w in moi(d['en']['tu'])] + ['hello', 'friend', "let's go", 'yummy']
_sd = json.loads(subprocess.run(['node', '-e', 'global.window=global;require(process.argv[1]);console.log(JSON.stringify(SD))', os.path.abspath(os.path.join(HERE, '../../../../seedling/seedling-data.js'))], capture_output=True, text=True).stdout)
SD_PRIOR = [c['en'] for k, d in _sd['days'].items() for s in d['steps'] if s['type'] in ('the', 'nen') and (int(k) < 64 or (s['type'] == 'nen' and int(k) <= 69)) for c in s.get('cards', [])]
LS = json.load(open(os.path.join(MANG, 'mau_little-seed_u9.json')))
SD = json.load(open(os.path.join(MANG, 'mau_seedling48_u9.json')))
U1 = json.load(open(os.path.join(MANG, 'mau_little-seed_u1.json')))

# Little Seed U1 (đang trên web): mỗi lượt lời là một cảnh
u1p = [[['', t, '', ''] for t in re.findall(r'"([^"]+)"', x)] for x in U1['T1']['en']]
for k, x in enumerate(U1['T1']['zh']):
    zz = re.findall(r'“([^”]+)”', x)
    for i, s in enumerate(u1p[k]): s[2] = zz[i] if i < len(zz) else ''
measure('Little Seed U1 · Bông\'s Day (web)', u1p, r'(hello|goodbye|see you)\b', {"Let's go!", 'Woof!'})

def txt(T, key):
    if key == 'T1': return ' '.join(s[1] for p in T['T1']['phan'] for s in p)
    if key == 'T2': return ' '.join(l[1] for l in T['T2']['luot'])
    if key == 'T3': return ' '.join(l[1] for l in T['T3']['trang'])
    if key == 'T4': return ' '.join(l[1] for l in T['T4']['dong'])
measure('Little Seed U9 · Picnic Time!', LS['T1']['phan'], [r'picnic time', r'i (like|eat)', r'i (like|eat)', r'(i (like|eat)|rice!)', r'i (drink|like)|what do you like'],
        {'Yummy!', "Let's go!", 'Hello!', 'Hello, friends!', 'Look!'},
        {k: txt(LS, k) for k in ('T1', 'T2', 'T3', 'T4')}, ['picnic', 'time', 'like', 'eat', 'apple', 'banana', 'pizza', 'rice', 'drink', 'milk', 'water'], prior=LS_PRIOR)
measure('Seedling U9 · The Picnic (mới)', SD['T1']['phan'], [r"(do you like|yes, i do|no, i don't|i like)", r"(do you like|yes, i do|i like)", r"(do you like|yes, i do|no, i don't|ice cream is nice)",
        r"(do you like|yes, i do|look! chips)", r"(do you want|i want)", r"(do you like|yes, i do|no, i don't)"],
        {'It looks nice!', 'No, thank you!', 'Look!', 'Food!', 'Apple juice!', 'Nice!', 'Yes!', 'A cross!', 'And you, ___?', 'Chips!'},
        {k: txt(SD, k) for k in ('T1', 'T2', 'T3', 'T4')}, ['food', 'fruit', 'bread', 'juice', 'noodles', 'ice cream', 'nice', 'burger', 'chips', 'candy', 'want', 'cross'],
        lim=(15, 20), limz=(20, 30), prior=SD_PRIOR)
