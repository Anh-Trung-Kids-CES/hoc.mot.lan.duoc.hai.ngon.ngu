"""Sách bài tập bản 2 (13/11/2026): dựng dữ liệu cho Unit 1 và 3 từ wb2_spec.py. Gọi từ build_hoc_lieu.py."""
import random, re
from wb2_spec import SPEC, UNIT_PAGE, CHECK
HAN = re.compile(r'[一-鿿]')

def build(L, units, sessions, LA, PY, hz_load):
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
    def pic(key): return find(key) if key else None
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
    hz = {}
    def need(chs):
        for c in chs:
            if c not in hz: hz[c] = hz_load(c)
    out = {}
    for n, S in SPEC[L].items():
        s = next(x for x in sessions if x['n'] == n)
        d = {'band': S['band'], 'add': S['add'], 'zc': S['zc'], 'zrec': S.get('zrec', []), 'zpy': {c: PY(c).lower() for c in S['zc'] + S.get('zrec', [])}}
        need(S['zc'] + S.get('zrec', []))
        d['copy'] = [{'w': w, 'p': pic(k)} for w, k in S['copy']]
        if L == 'SD':
            d['unscr'] = [{'w': w, 'p': pic(k), 'l': scr(w, n * 31 + i)} for i, (w, k) in enumerate(S['unscr'])]
            d['cloze'] = [{'s': q, 'bank': b, 'ans': a, 'p': pic(k), 'rec': bool(r)} for q, b, a, k, r in S['cloze']]
            d['me'] = {'frame': S['me'][0], 'draw': S['me'][1]}
            d['zread'] = [{'p': pic(k), 'zh': z, 'py': PY(z), 'ok': bool(o)} for k, z, o in S['zread']]
            q, b, a = S['zfill']; d['zfill'] = {'zh': q, 'py': zpy(q), 'bank': [{'zh': x, 'py': PY(x)} for x in b], 'ans': a}
        else:
            d['circ'] = [{'w': w, 'ps': [pic(k) for k in ks], 'ans': a} for w, ks, a in S['circ']]
            d['me'] = {'frame': S['me'][0], 'opts': S['me'][1]}
            d['rec'] = S.get('rec')
            d['zmatch'] = [{'zh': z, 'py': PY(z), 'p': pic(k)} for z, k in S['zmatch']]
        d['med'] = [{'en': e, 'zh': z, 'py': PY(z)} for e, z in S['med']]
        d['medperm'] = S['medperm']
        s['wb2'] = d; out[n] = d
    pages = {}
    for uk, P in UNIT_PAGE[L].items():
        need([])
        pages[uk] = {'can': [{'en': e, 'zh': z, 'py': PY(z)} for e, z in P['can']], 'words': [pic('w:' + w) and dict(pic('w:' + w), en=w) for w in P['words']], 'photo': P['photo']}
    chk = {}
    if L == 'SD':
        for uk, C in CHECK.items():
            for c in sum([[x[1] for x in C['zfill']] for _ in [0]], []): pass
            chk[uk] = {'yes': [{'p': pic(k), 'en': e, 'ok': bool(o)} for k, e, o in C['yes']],
                       'unscr': [{'w': w, 'p': pic(k), 'l': scr(w, 77 + i + int(uk))} for i, (w, k) in enumerate(C['unscr'])],
                       'zread': [{'p': pic(k), 'opts': [{'zh': z, 'py': PY(z)} for z in o], 'ans': a} for k, o, a in C['zread']],
                       'zfill': [{'zh': q, 'py': zpy(q), 'bank': [{'zh': x, 'py': PY(x)} for x in b], 'ans': a} for q, b, a in C['zfill']]}
    return {'sessions': out, 'unit_pages': pages, 'check': chk, 'hz': hz}
