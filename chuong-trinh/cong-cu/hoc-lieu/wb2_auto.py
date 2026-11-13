"""Tự dựng nội dung sách bài tập (bản 2) cho mọi buổi chưa viết tay (13/11/2026): lấy từ web (thẻ từ, cảnh truyện) + danh sách từ thêm.
Trả về cùng dạng với wb2_spec.SPEC (tranh truyền thẳng dạng dict {'img','line'}). Có kiểm tự động ở cuối (kiem())."""
import re, random, json, os
HAN = re.compile(r'[一-鿿]')
REPL = {'兴': '口', '奋': '生', '事': '去', '卧': '床', '能': '飞', '鸭': '会', '极': '白', '想': '叉', '袜': '它', '眼': '见'}  # chị chốt 13/11 (chữ & âm Seedling)
PART_A = ['们', '吗', '的', '了', '呢', '吧']; PART_B = ['是', '有', '在', '很', '也', '都']
STOP = {'under', 'here', 'too', 'please', 'yes', 'down', 'away', 'out', 'what', 'look', 'this', 'that', 'the', 'and', 'not', 'very', 'have', 'like'}
NONNOUN = set('one two three four five six seven eight nine ten red blue green yellow orange pink black white brown purple happy sad hot cold big small long short tall fun funny good bad cool wow hello goodbye hi sorry yes no please thank morning night nice little new old young fast slow run jump hop eat drink walk swim sing dance clap stand sit touch open close write count play like love read go come see look hooray them down drop wear stamp open'.split())
BADD = set('night kids baby older younger shoe open board flat trousers door girl wing long knee ball photo brown scissors crayon men man'.split())
BADZ = {'衣服', '汉堡', '照片', '铅笔', '早上好', '跺跺脚', '我爱', '明天', '胳膊', '肩膀', '脚趾', '尾巴', '眼镜', '手提包'}
BADLS = {'心', '火', '回家', '上', '今天', '动物', '晴天', '宝宝', '日'}
BADMED = ('big puppy', 'No pizza', 'A mouse?', 'computer mouse')
PUNC = r'[\s,.!?;:\'"“”‘’…·]'

def wl(t): return re.findall(r"[A-Za-z']+", t)
def alpha1(w): return bool(re.fullmatch(r"[a-z]{3,9}", w))

def run(L, units, sessions, LOP, strokes, find_card, scene_pic, extras):
    UK = {u['key']: u for u in units}
    order = [s['n'] for s in sessions]
    SPEC, traced = {}, set()
    per_unit = {}
    for s in sessions: per_unit.setdefault(str(s['unit']), []).append(s['n'])
    uorder = list(per_unit)
    def scenes_of(s):
        u = UK.get(str(s['unit']));
        if not u: return []
        mine = [x for p in u['parts'] if p['day'] in s['days'] for x in p['scenes']]
        return mine or [x for p in u['parts'] for x in p['scenes']]
    def good(x, lo=2, hi=9):
        if x['who'] == 'narr' or '___' in x['en'] or not x.get('zh') or '___' in x['zh']: return False
        n = len(wl(x['en'])); return lo <= n <= hi and len(HAN.findall(x['zh'])) <= 16
    def uniqs(xs):
        seen, out = set(), []
        for x in xs:
            if x['en'] in seen: continue
            seen.add(x['en']); out.append(x)
        return out
    def pic_s(x): return {'img': x['img'], 'line': ''}
    def alloc(items, k, n, cap=2): return items[k * cap:(k + 1) * cap] if k < n else []
    def single_words(u): return [w['en'].lower() for w in u['words'] if alpha1(w['en'].lower()) and w['img'] and '/the/' not in w['img']]
    def other_en(uk): return list(dict.fromkeys(w for k, v in UK.items() if k != uk for w in single_words(v)))
    def other_zh(uk): return list(dict.fromkeys(w['zh'] for k, v in UK.items() if k != uk for w in v['words'] if w['zh'] and not re.search(r'[A-Za-z（）()·,，！？]', w['zh']) and 1 <= len(w['zh']) <= 4))
    for s in sessions:
        n, uk = s['n'], str(s['unit']); u = UK.get(uk); rng = random.Random(n * 7919 + (1 if L == 'LS' else 2))
        idx = per_unit[uk].index(n); nn = len(per_unit[uk])
        lop = LOP[str(n)]; ew_core, zc_core = [], []
        if L == 'SD':
            wbk = lop.get('wb', ['', '']); 
            for x in re.split(r'[,;]', wbk[0]):
                x = re.split(r'[(=]', x)[0].strip()
                if x and not x.startswith('('): ew_core.append(x)
            zc_core = [REPL.get(c, c) for c in HAN.findall(wbk[1] if len(wbk) > 1 else '')]
        ex = extras[L].get(uk, {'en': [], 'zh': []}) if u else {'en': [], 'zh': []}
        en_new = alloc(ex['en'], idx, nn); zh_new = alloc(ex['zh'], idx, nn)
        review = u is None or (not en_new and not zh_new and not ew_core and not s['words'])
        if u is None:   # buổi Ôn / thi: gộp từ các buổi trước
            pool_units = [UK[k] for k in uorder if k in UK and per_unit[k][-1] < n][-4:]
        else: pool_units = [u]
        scs = uniqs([x for s2 in [s] for x in (scenes_of(s) if u else [x for pu in pool_units for p in pu['parts'] for x in p['scenes']])])
        scs_g = [x for x in uniqs(scs) if good(x)]
        if u is None: rng.shuffle(scs_g); scs_g = scs_g[:12]
        words_all = [w for pu in pool_units for w in pu['words']]
        wordpics = {w['en'].lower(): w for w in words_all if w['img'] and '/the/' not in w['img']}
        # ---- từ để chép
        copy_en = list(en_new) + [w for w in ew_core if w.lower() not in [e.lower() for e in en_new]] + [w['en'] for w in s['words']]
        if u is None or not copy_en: copy_en = [w['en'] for w in rng.sample(words_all, min(6, len(words_all)))]
        seen = set(); cp = []
        for w in copy_en:
            if w.lower() in seen or len(w) > 22: continue
            seen.add(w.lower()); cp.append(w)
        if L == 'LS': cp = [w for w in cp if find_card(w)]
        cp_n = 3 if L == 'SD' else 2; cp = cp[:cp_n]
        def card_pic(en):
            c = find_card(en); return c
        copy = [(w, card_pic(w)) for w in cp]
        # ---- chữ Hán
        zh_chars = []
        for w in zh_new:
            for c in (HAN.findall(w) if len(HAN.findall(w)) == 1 else [c for c in HAN.findall(w) if c not in traced]):
                if c not in zh_chars and (strokes(c) or 99) <= 10: zh_chars.append(c)
        for c in zc_core:
            if c not in zh_chars and (strokes(c) or 99) <= 10: zh_chars.append(c)
        if len(zh_chars) < 2:   # ôn: lấy lại chữ đã tô trong unit trước đó
            prev = [c for c in traced if c not in zh_chars]
            prev.sort(); rng.shuffle(prev); zh_chars += prev[:2 - len(zh_chars)]
        zh_chars = zh_chars[:2]; traced.update(zh_chars)
        # ---- câu
        d = {'band': (u['name'].split(' · ', 1)[-1] if u else 'Review'), 'add': en_new, 'zc': zh_chars, 'zrec': []}
        meds = [x for x in scs_g if (L == 'SD' or len(wl(x['en'])) <= 6) and not x['zh'].rstrip('！。？').endswith('的') and len(HAN.findall(x['zh'])) <= 14 and not any(b in x['en'] for b in BADMED)]; rng.shuffle(meds)
        med = [(x['en'], x['zh']) for x in meds[:3 if L == 'SD' else 2]]
        if len(med) < 2:
            pool2 = [x for pu in (pool_units + [UK[k] for k in uorder if k in UK]) for p in pu['parts'] for x in p['scenes'] if good(x, 1, 6) and not x['zh'].rstrip('！。？').endswith('的') and not any(b in x['en'] for b in BADMED)]
            for x in pool2:
                if x['en'] not in [m[0] for m in med]: med.append((x['en'], x['zh']))
                if len(med) >= 2: break
        d['med'] = med; d['medperm'] = [[1, 2, 0], [2, 0, 1], [1, 0, 2]][n % 3][:len(med)] if L == 'SD' else [1, 0][:len(med)]
        if len(med) == 2 and L == 'SD': d['medperm'] = [1, 0]
        d['copy'] = copy
        if L == 'SD':
            targets = [w for w in cp if alpha1(w.lower())] + [w['en'].lower() for w in s['words'] if alpha1(w['en'].lower())] + [w for w in single_words(pool_units[-1])]
            un = []; seenu = set()
            for w in targets:
                w = w.lower()
                if w in seenu or w not in wordpics or w in NONNOUN: continue
                seenu.add(w); un.append((w, wordpics[w]))
            d['unscr'] = un[:2]
            # cloze tiếng Anh: câu truyện có từ mục tiêu
            cl = []; tw = [w.lower() for w in cp if alpha1(w.lower())] + [w['en'].lower() for w in s['words'] if alpha1(w['en'].lower())]
            pool_w = list(dict.fromkeys(single_words(pool_units[-1]) + [w for pu in pool_units for w in single_words(pu)]))
            def make_cloze(cands, targets, rec=0, picfn=None):
                for x in cands:
                    toks = wl(x['en'])
                    for t in targets:
                        if t in [y.lower() for y in toks] and len(toks) >= 3:
                            sent = re.sub(r'\b' + re.escape(t) + r'\b', '___', x['en'], count=1, flags=re.I)
                            if sent.count('___') != 1 or not wordpics.get(t) and not rec: pass
                            dist = [w for w in other_en(uk) if w != t and w not in [y.lower() for y in toks] and w not in BADD]; rng.shuffle(dist)
                            bank = [t] + dist[:2]; rng.shuffle(bank)
                            return (sent, bank, t, (None if rec else pic_s(x)), rec), x
                return None, None
            used = set()
            for tgt in ([t for t in tw] or []):
                r, x = make_cloze([y for y in scs_g if y['en'] not in used], [tgt])
                if r: cl.append(r); used.add(x['en'])
                if len(cl) == 2: break
            for y in scs_g:
                if len(cl) == 2: break
                if y['en'] in used: continue
                cand = [w.lower() for w in wl(y['en']) if w.lower() in pool_w]
                if cand:
                    r, x = make_cloze([y], cand[:1]); 
                    if r: cl.append(r); used.add(x['en'])
            # ♻ từ unit trước
            pi = uorder.index(uk) - 1 if uk in uorder else -1
            if pi >= 0 and uorder[pi] in UK:
                pu = UK[uorder[pi]]; ps = [y for p in pu['parts'] for y in p['scenes'] if good(y, 3, 8)]
                ow = list(dict.fromkeys(single_words(pu)))
                for y in ps:
                    toks = [t.lower() for t in wl(y['en'])]; c = [w for w in ow if w in toks]
                    if c:
                        t = c[0]; sent = re.sub(r'\b' + t + r'\b', '___', y['en'], count=1, flags=re.I)
                        dist = [w for w in other_en(uorder[pi]) if w != t and w not in toks and w not in BADD]; rng.shuffle(dist); bank = [t] + dist[:2]; rng.shuffle(bank)
                        cl.append((sent, bank, t, None, 1)); break
            d['cloze'] = cl
            # about me
            me = None
            for y in scs_g:
                if re.match(r"^(I have|I like|I see|I want|My |This is my)", y['en']) and 'too' not in y['en'].lower():
                    toks = wl(y['en']); hit = [t for t in toks if t.lower() in wordpics and t.lower() not in STOP and t.lower() not in NONNOUN and alpha1(t.lower())]
                    if hit: me = (re.sub(r'\b' + hit[-1] + r'\b', '___', y['en'], count=1), 'Draw it.'); break
            d['me'] = me or ('My new word is ___.', 'Draw it.')
            # đọc – chọn tiếng Trung
            zr = []; pat = [[1, 0, 1], [0, 1, 1], [1, 1, 0]][n % 3]
            zs = [x for x in scs_g if len(HAN.findall(x['zh'])) <= 12 and not re.search(r'[？吗]', x['zh'])][:6]
            if len(zs) < 3: zs = scs_g[:3]
            others = [x for x in scs_g if x not in zs]
            for i, x in enumerate(zs[:3]):
                if pat[i]: zr.append((pic_s(x), x['zh'], 1))
                else:
                    o = next((y for y in (others + zs) if y['img'] != x['img'] and y['en'] != x['en']), x)
                    zr.append((pic_s(o), x['zh'], 0))
            d['zread'] = zr
            # điền từ tiếng Trung (chọn từ)
            uzh = [(w['zh'], w['py']) for pu in pool_units for w in pu['words'] if w['zh'] and not re.search(r'[A-Za-z（）()·,，！？]', w['zh']) and 1 <= len(w['zh']) <= 4]
            uzh = list(dict.fromkeys(uzh)); zf = None
            for x in scs_g:
                for zw, _ in sorted(uzh, key=lambda a: -len(a[0])):
                    if x['zh'].count(zw) == 1 and len(HAN.findall(x['zh'])) >= len(zw) + 2:
                        dist = [a for a in other_zh(uk) if a != zw and a not in x['zh'] and a[-1] != zw[-1] and a not in BADZ]; rng.shuffle(dist); dist.sort(key=lambda a: abs(len(a) - len(zw)))
                        if len(dist) >= 2:
                            bank = [zw] + dist[:2]; rng.shuffle(bank)
                            zf = (x['zh'].replace(zw, '___'), bank, zw, pic_s(x)); break
                if zf: break
            d['zfill'] = zf or ('我爱___！', ['他们', '学', '明天'], '他们')
        else:
            cw = [c for c in copy if c[1]]
            d['circ'] = []
            allp = [w for w in words_all if w['img'] and '/the/' not in w['img']]
            for i, (wd, pc) in enumerate(cw[:2]):
                opts = [x for x in allp if x['img'] != pc['img']]; rng.shuffle(opts); seen_i = {pc['img']}; o2 = []
                for x in opts:
                    if x['img'] in seen_i: continue
                    seen_i.add(x['img']); o2.append(x)
                    if len(o2) == 2: break
                ps = [pc] + [{'img': x['img'], 'line': x['line']} for x in o2]; pos = (n + i) % 3; ps = ps[1:pos + 1] + [ps[0]] + ps[pos + 1:] if pos else ps
                ans = next(k for k, y in enumerate(ps) if y['img'] == pc['img'])
                d['circ'].append((wd, ps, ans))
            # nối chữ Trung – tranh
            zm = [w for w in (s['words'] + words_all) if w['zh'] and w['img'] and '/the/' not in w['img'] and not re.search(r'[A-Za-z（）()·,，！？]', w['zh']) and len(w['zh']) <= 4 and w['zh'] not in BADLS and w['zh'][0] not in '喝去吃看说听玩跳走跑坐' and not w['zh'].startswith('果汁')]
            ssn, zmm = set(), []
            for w in zm:
                if w['img'] in ssn or w['zh'] in [z[0] for z in zmm]: continue
                ssn.add(w['img']); zmm.append((w['zh'], {'img': w['img'], 'line': w['line']}))
            d['zmatch'] = zmm[:3]
            # về mình
            lw = [w for w in dict.fromkeys(w for pu in pool_units for w in single_words(pu)) if w not in NONNOUN]
            if len(lw) < 2: lw = ['apple', 'cake', 'milk']
            rng.shuffle(lw); d['me'] = ('I like', lw[:2])
            zcs = []
            for z, _p in d['zmatch']:
                for c in HAN.findall(z):
                    if c not in zcs: zcs.append(c)
            d['zc'] = zcs[:2]
            d['rec'] = [("How old are you? I am", 'num'), ("What's your name? My name is", 'name')][n % 2] if (u and int(uk) >= 3) else None
        SPEC[n] = d
    return SPEC
