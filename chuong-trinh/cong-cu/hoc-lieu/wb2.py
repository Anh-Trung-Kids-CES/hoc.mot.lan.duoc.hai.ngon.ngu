"""Sách bài tập bản 2 (13/11/2026): dựng dữ liệu cho Unit 1 và 3 từ wb2_spec.py. Gọi từ build_hoc_lieu.py."""
import random, re
from wb2_spec import SPEC, UNIT_PAGE, CHECK
HAN = re.compile(r'[一-鿿]')

def build(L, units, sessions, LA, PY, hz_load, LOP=None):
    def find(key):
        if not key: return None
        kind, en = key[0], key[2:]
        for u in units:
            if kind == 'w':
                for w in u['words']:
                    if w['en'] == en and w['img'] and '/the/' not in w['img']: return {'img': w['img'], 'line': w['line']}
            else:
                for p in u['parts']:
                    for s in p['scenes']:
                        if s['en'] == en or s['en'].startswith(en): return {'img': s['img'], 'line': LA(s['img'])}
        raise SystemExit('Thiếu tranh: ' + key)
    def pic(key): return key if isinstance(key, dict) else (find(key) if key else None)
    def scr(word, seed):
        r = random.Random(seed); l = list(word.replace(' ', ''))
        for _ in range(20):
            r.shuffle(l)
            if ''.join(l) != word.replace(' ', ''): break
        return l
    def zpy(z):
        parts = z.split('___')
        r = ' ___ '.join((PY(p) if HAN.search(p) else p).strip() for p in parts).strip()
        return re.sub(r'\s+([!?.,])', r'\1', r)
    import os, json as _j
    from wb2_auto import run as _auto, wl as _wl
    def find_card(en):
        e = en.lower()
        for u in units:
            for w in u['words']:
                if w['img'] and '/the/' not in w['img'] and (w['en'].lower() == e or e in [x.strip() for x in w['en'].lower().split('·')]):
                    return {'img': w['img'], 'line': w['line']}
        return None
    hz = {}
    def need(chs):
        for c in chs:
            if c not in hz: hz[c] = hz_load(c)
    EXTRA = _j.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tu_them.json')))
    def strokes(c):
        if c not in hz: hz[c] = hz_load(c)
        return len(hz[c]) if hz[c] else None
    AUTO = _auto(L, units, sessions, LOP, strokes, find_card, None, EXTRA)
    ALL = {**AUTO, **SPEC[L]}
    out = {}
    for n, S in ALL.items():
        s = next(x for x in sessions if x['n'] == n)
        S = dict(S); S['zc'] = S['zc']
        d = {'band': S['band'], 'add': S['add'], 'zc': S['zc'], 'zrec': S.get('zrec', []), 'zpy': {c: PY(c).lower() for c in S['zc'] + S.get('zrec', [])}}
        need(S['zc'] + S.get('zrec', []))
        d['copy'] = [{'w': w, 'p': pic(k)} for w, k in S['copy']]
        if L == 'SD':
            d['unscr'] = [{'w': w, 'p': pic(k), 'l': scr(w, n * 31 + i)} for i, (w, k) in enumerate(S['unscr'])]
            d['cloze'] = [{'s': q, 'bank': b, 'ans': a, 'p': pic(k), 'rec': bool(r)} for q, b, a, k, r in S['cloze']]
            d['me'] = {'frame': S['me'][0], 'draw': S['me'][1]}
            d['zread'] = [{'p': pic(k), 'zh': z, 'py': PY(z), 'ok': bool(o)} for k, z, o in S['zread']]
            q, b, a = S['zfill'][:3]; d['zfill'] = {'zh': q, 'py': zpy(q), 'bank': [{'zh': x, 'py': PY(x)} for x in b], 'ans': a, 'p': pic(S['zfill'][3]) if len(S['zfill']) > 3 else None}
        else:
            d['circ'] = [{'w': w, 'ps': [pic(k) for k in ks], 'ans': a} for w, ks, a in S['circ']]
            d['me'] = {'frame': S['me'][0], 'opts': S['me'][1]}
            d['rec'] = S.get('rec')
            d['zmatch'] = [{'zh': z, 'py': PY(z), 'p': pic(k)} for z, k in S['zmatch']]
        d['med'] = [{'en': e, 'zh': z, 'py': PY(z)} for e, z in S['med']]
        d['medperm'] = S['medperm']
        s['wb2'] = d; out[n] = d
    chk = {}
    pages = {}
    for uk, P in UNIT_PAGE[L].items():
        pages[uk] = {'can': [{'en': e, 'zh': z, 'py': PY(z)} for e, z in P['can']], 'words': [pic('w:' + w) and dict(pic('w:' + w), en=w) for w in P['words']], 'photo': P['photo']}
    rng = random.Random(5)
    def okz(w): return w['zh'] and not re.search(r'[A-Za-z（）()·,，！？]', w['zh']) and 1 <= len(w['zh']) <= 4
    for u in units:
        uk = u['key']
        sc = [x for p in u['parts'] for x in p['scenes'] if x['who'] != 'narr' and '___' not in x['en'] and x.get('zh') and '___' not in x['zh']]
        seen, sc2 = set(), []
        for x in sc:
            if x['en'] in seen: continue
            seen.add(x['en']); sc2.append(x)
        short = [x for x in sc2 if 2 <= len(x['en'].split()) <= 6 and len(HAN.findall(x['zh'])) <= 10]
        if uk not in pages:
            ws, si = [], set()
            for w in u['words']:
                if w['img'] and '/the/' not in w['img'] and w['img'] not in si and ' · ' not in w['en'] and len(w['en']) <= 18:
                    si.add(w['img']); ws.append(dict(img=w['img'], line=w['line'], en=w['en']))
            pages[uk] = {'can': [{'en': 'I can say: ' + x['en'], 'zh': x['zh'], 'py': PY(x['zh'])} for x in short[:3]], 'words': ws[:8], 'photo': ('Draw and show!', '画一画，说一说！')}
        if L == 'SD' and uk not in CHECK:
            pool = [x for x in sc2 if 3 <= len(x['en'].split()) <= 8 and len(HAN.findall(x['zh'])) <= 12]
            rng.shuffle(pool)
            if len(pool) < 6: continue
            def sp(x): return {'img': x['img'], 'line': ''}
            yes = [(sp(pool[0]), pool[0]['en'], 1), (sp(pool[2]), pool[1]['en'], 0), (sp(pool[3]), pool[3]['en'], 1)]
            wl_ = [w for w in u['words'] if w['img'] and '/the/' not in w['img'] and re.fullmatch(r'[a-z]{4,9}', w['en'])]
            seenw, un = set(), []
            for w in wl_:
                if w['en'] in seenw: continue
                seenw.add(w['en']); un.append({'w': w['en'], 'p': {'img': w['img'], 'line': w['line']}, 'l': scr(w['en'], 77 + len(un) + len(uk))})
                if len(un) == 3: break
            zr = []
            for i, x in enumerate(pool[:3]):
                oth = [y['zh'] for y in pool[3:] if y['zh'] != x['zh']][:2]; opts = oth[:i % 3] + [x['zh']] + oth[i % 3:]
                zr.append({'p': sp(x), 'opts': [{'zh': z, 'py': PY(z)} for z in opts[:3]], 'ans': opts.index(x['zh'])})
            uzh = list(dict.fromkeys(w['zh'] for w in u['words'] if okz(w)))
            zf = []
            for x in pool:
                for zw in sorted(uzh, key=lambda a: -len(a)):
                    if x['zh'].count(zw) == 1 and len(HAN.findall(x['zh'])) >= len(zw) + 2:
                        dist = [w['zh'] for k, v in [(0, o) for o in units if o['key'] != uk] for w in v['words'] if okz(w) and w['zh'] != zw and w['zh'] not in x['zh'] and w['zh'][-1] != zw[-1]]; dist = list(dict.fromkeys(dist)); rng.shuffle(dist)
                        if len(dist) >= 2:
                            bank = [zw] + dist[:2]; rng.shuffle(bank); q = x['zh'].replace(zw, '___')
                            zf.append({'zh': q, 'py': zpy(q), 'bank': [{'zh': b, 'py': PY(b)} for b in bank], 'ans': zw, 'p': sp(x)}); break
                if len(zf) == 3: break
            chk[uk] = {'yes': [{'p': p_, 'en': e, 'ok': bool(o)} for p_, e, o in yes], 'unscr': un, 'zread': zr, 'zfill': zf}
    if L == 'SD':
        for uk, C in CHECK.items():
            chk[uk] = {'yes': [{'p': pic(k), 'en': e, 'ok': bool(o)} for k, e, o in C['yes']],
                       'unscr': [{'w': w, 'p': pic(k), 'l': scr(w, 77 + i + int(uk))} for i, (w, k) in enumerate(C['unscr'])],
                       'zread': [{'p': pic(k), 'opts': [{'zh': z, 'py': PY(z)} for z in o], 'ans': a} for k, o, a in C['zread']],
                       'zfill': [{'zh': q, 'py': zpy(q), 'bank': [{'zh': x, 'py': PY(x)} for x in b], 'ans': a} for q, b, a in C['zfill']]}
    return {'sessions': out, 'unit_pages': pages, 'check': chk, 'hz': hz}
