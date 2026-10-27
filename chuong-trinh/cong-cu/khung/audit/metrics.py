import json,glob,re,statistics as st,collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/out/'
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
def parts(c): return sorted(f for f in glob.glob(G+c+'-*.json') if re.match(r'^'+re.escape(c)+r'-[a-c]\.json$',f.split('/')[-1]))
HAN=re.compile(r'[一-鿿]')
def story_en(t):
    t=re.sub(r'\[[^\]]*\]','',t); t=re.sub(r'\([^)]*\)','',t)
    title,body=(t.split(' — ',1)+[''])[:2] if ' — ' in t else ('',t)
    return title.strip(),body
def story_zh(t):
    t=re.sub(r'\[[^\]]*\]','',t); t=re.sub(r'[（(][^)）]*[)）]','',t)
    title,body=(t.split(' — ',1)+[''])[:2] if ' — ' in t else ('',t)
    return title.strip(),body
def words(t): return re.findall(r"[A-Za-z][A-Za-z']*",re.sub(r'\b(Leo|Anna|Bông|Xiaomei|Nhan|Lan|Mai|Nam)\b','X',t))
def sents(t): return [s for s in re.split(r'[.!?。！？]+',t) if s.strip()]
def newlist(tu,l):
    out=[]
    for seg in tu.split(' | '):
        if seg.startswith('Mới'):
            body=seg.split(':',1)[1]
            for x in body.split(','):
                x=re.sub(r'\([^)]*\)','',x).strip()
                if l=='zh': x=''.join(HAN.findall(x))
                else: x=x.split('/')[0].strip()
                if x: out.append(x)
    return out
def forms(w):
    w=w.lower(); o={w}
    if ' ' not in w:
        o|={w+'s',w+'es',w+'ed',w+'d',w+'ing'}
        if w.endswith('y'): o|={w[:-1]+'ies',w[:-1]+'ied'}
        if w.endswith('e'): o.add(w[:-1]+'ing')
    return o
def occ_en(w,body):
    b=' '+re.sub(r"[^a-z' ]+",' ',body.lower())+' '
    return max(b.count(' '+f+' ') for f in forms(w))
D=[]
for c in ORDER:
    for f in parts(c):
        for r in json.load(open(f))['rows']:
            for w in r['web']:
                te,be=story_en(w['en']['truyen']); tz,bz=story_zh(w['zh']['truyen'])
                ne=newlist(w['en']['tu'],'en'); nz=newlist(w['zh']['tu'],'zh')
                cau=[s for s in re.split(r' / ',re.sub(r'\[[^\]]*\]','',w['en']['cau'])) if s.strip()]
                D.append(dict(c=c,part=f.split('/')[-1][:-5],buoi=r['buoi'],unit=r['unit'],ngay=w['ngay'],label=w['label'],
                    title=te,ew=len(words(be)),es=len(sents(be)),zc=len(HAN.findall(bz)),
                    ne=len(ne),nz=len(nz),neL=ne,nzL=nz,
                    occ=[occ_en(x,be) for x in ne], occz=[bz.count(x) for x in nz],
                    caul=st.mean([len(words(s)) for s in cau]) if cau else 0,
                    lop_title=story_en(r['lop']['en']['truyen'])[0]))
json.dump(D,open(_K+'audit/days.json','w'),ensure_ascii=False)
print('days',len(D))
print('%-12s %5s %6s %6s %6s %6s %6s %6s %7s %7s'%('course','days','EN_w','ZH_ch','sent','wPerS','newEN','newZH','cauLen','titles'))
for c in ORDER:
    X=[d for d in D if d['c']==c]
    if not X: continue
    nt=len(set(d['title'] for d in X))
    print('%-12s %5d %6.0f %6.0f %6.1f %6.1f %6.1f %6.1f %7.1f %7d'%(c,len(X),st.mean(d['ew'] for d in X),st.mean(d['zc'] for d in X),st.mean(d['es'] for d in X),
      st.mean(d['ew']/max(1,d['es']) for d in X),st.mean(d['ne'] for d in X),st.mean(d['nz'] for d in X),st.mean(d['caul'] for d in X),nt))
    q=sorted(d['ew'] for d in X); print('   EN words min/p10/median/p90/max',q[0],q[len(q)//10],q[len(q)//2],q[9*len(q)//10],q[-1])
