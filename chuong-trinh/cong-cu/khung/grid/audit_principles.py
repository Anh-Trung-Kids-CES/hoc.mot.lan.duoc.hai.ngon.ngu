import json,re,collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
S=_K
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
A=json.load(open(S+'cov/allocation.json'))
gl={}
for a in A:
    if a['lang']=='Tiếng Trung' and '·' in a['info']:
        g=a['info'].split('·',1)[1]
        ws=set(re.findall(r'[a-z]+',g.lower()))-{'a','an','the','to','of','for','sb','sth','in','on','be','and','or','with','used','measure','word','particle','etc','one','s'}
        gl.setdefault(a['word'],set()).update(ws)
kho=json.load(open(_CT+'data/chuong-trinh.json'))['kho']
for x in kho.values():
    if x.get('zh') and x.get('en'): gl.setdefault(x['zh'],set()).update(re.findall(r'[a-z]+',x['en'].lower()))
HAN=re.compile(r'[一-鿿]+')
def new_zh(tu):
    m=re.search(r'Mới:(.*?)(\||$)',tu,re.S)
    return HAN.findall(m.group(1)) if m else []
BR=re.compile(r'Cầu nối|so sánh|giống nhau|khác nhau|cùng nghĩa|giống tiếng Anh|khác tiếng Anh|như tiếng Anh|EN ?↔ ?ZH|Anh ?↔ ?Trung',re.I)
MED=re.compile(r'Phiên dịch nhí|chuyển ngữ|NL\d|nói lại bằng tiếng|dịch sang|mediation',re.I)
seen_en=set(); out={}
for c in ORDER:
    b=json.load(open(_CT+'data/bang/%s.json'%c))
    tot=known=same=0; days=br=0; units=collections.defaultdict(lambda:[0,0]); ses=med_lop=0
    for bl in b['blocks']:
        for r in bl['rows']:
            for w in r['web']:
                days+=1
                en=' '.join(w['en'].values()).lower(); en_words=set(re.findall(r'[a-z]+',en))
                for z in new_zh(w['zh']['tu']):
                    g=gl.get(z)
                    if not g: continue
                    tot+=1
                    if g & seen_en: known+=1
                    if g & en_words: same+=1
                seen_en|=en_words
                t=json.dumps(w,ensure_ascii=False)
                if BR.search(t): br+=1
                if bl['kind']=='unit' and MED.search(t): units[bl['unit']][0]=1
            ses+=1
            t=json.dumps(r['lop'],ensure_ascii=False)
            if MED.search(t): med_lop+=1
            if bl['kind']=='unit' and MED.search(t): units[bl['unit']][1]=1
    nu=len([1 for bl in b['blocks'] if bl['kind']=='unit'])
    out[c]=dict(zh_new=tot, zh_known_en_before=round(100*known/max(tot,1)), zh_same_day_en=round(100*same/max(tot,1)), web_days=days, bridge_days=br, sessions=ses, mediation_sessions=med_lop, units=nu, units_med_web=sum(v[0] for v in units.values()), units_med_lop=sum(v[1] for v in units.values()))
    print(c,out[c])
json.dump(out,open(S+'grid/audit_principles.json','w'))
