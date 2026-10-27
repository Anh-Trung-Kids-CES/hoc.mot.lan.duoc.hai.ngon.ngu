import json,re,collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
S=_K
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
units={c:[] for c in ORDER}   # list of (en_text, zh_text, label)
for c in ORDER:
    b=json.load(open(_CT+'data/bang/%s.json'%c))
    for bl in b['blocks']:
        for r in bl['rows']:
            for w in r['web']:
                units[c].append((' '.join(w['en'].values()),' '.join(w['zh'].values()),'web'))
            units[c].append((' '.join(r['lop']['en'].values()),' '.join(r['lop']['zh'].values()),'lop'))
def entext(t): return ' '+re.sub(r'[^a-z\' ]+',' ',t.lower())+' '
def zhtext(t): return re.sub(r'\([^)]*\)','',t)
U={c:[(entext(e),zhtext(z),k) for e,z,k in units[c]] for c in ORDER}
def forms(w):
    w=w.lower().strip(); out={w}
    if ' ' not in w:
        out|={w+'s',w+'es',w+'ed',w+'d',w+'ing',w+"'s"}
        if w.endswith('y'): out|={w[:-1]+'ies',w[:-1]+'ied'}
        if w.endswith('e'): out.add(w[:-1]+'ing')
        if re.search(r'[^aeiou][aeiou][bdgmnprt]$',w): out|={w+w[-1]+'ing',w+w[-1]+'ed'}
    return out
def variants(word):
    word=re.sub(r'\(.*?\)','',word)
    return [re.sub(r'\s+',' ',x).strip() for x in re.split(r'[/,]',word) if x.strip()]
cov=json.load(open(S+'cov/coverage.json'))
MIL={'YCT1':'seedling','Starters':'canopy','YCT2':'canopy','Movers':'larva','YCT3':'larva','Flyers':'butterfly','YCT4':'butterfly'}
res=[]
for x in cov:
    lv=x['level']; end=ORDER.index(MIL[lv]); vs=variants(x['word'])
    if not vs: continue
    hits=[];first=None
    for ci,c in enumerate(ORDER):
        for i,(e,z,k) in enumerate(U[c]):
            ok=False
            if x['lang']=='Tiếng Anh':
                ok=any((' '+f+' ') in e for v in vs for f in forms(v))
            else:
                ok=any(v in z for v in vs)
            if ok:
                hits.append(ci)
                if first is None: first=(c,i)
    before=sum(1 for h in hits if h<=end)
    res.append(dict(lang=x['lang'],level=lv,word=x['word'],before=before,total=len(hits),first=first[0] if first else None))
json.dump(res,open(S+'grid/exam_cov.json','w'),ensure_ascii=False)
T=collections.defaultdict(collections.Counter)
for r in res:
    k=(r['lang'][-4:],r['level'])
    T[k]['n']+=1
    T[k]['vững (≥5)' if r['before']>=5 else 'ít (1–4)' if r['before']>=1 else ('sau mốc' if r['total'] else 'không có')]+=1
for k in sorted(T,key=lambda k:['YCT1','Starters','YCT2','Movers','YCT3','Flyers','YCT4'].index(k[1])):
    t=T[k]; n=t['n']
    print(k[1].ljust(9),n,' vững',t['vững (≥5)'],'(%d%%)'%(100*t['vững (≥5)']//n),' ít',t['ít (1–4)'],' sau mốc',t['sau mốc'],' không có',t['không có'])
