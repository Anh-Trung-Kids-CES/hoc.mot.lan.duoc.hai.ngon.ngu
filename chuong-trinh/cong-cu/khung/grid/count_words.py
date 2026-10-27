# Đếm số hàng (ngày web / buổi) có chứa mỗi từ cần bổ sung, trong file phần của bạn.
# Dùng: python3 count_words.py canopy-a            (đọc need_words.json, khóa canopy-a)
#       python3 count_words.py cocoon-a cocoon      (file cocoon-a.json, danh sách khóa "cocoon")
import json, re, sys
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
part=sys.argv[1]; key=sys.argv[2] if len(sys.argv)>2 else part
need=json.load(open(G+'need_words.json')).get(key,[])
import glob
rows=[]
for f in sorted(glob.glob(G+'out/%s.json'%part)):
  for r in json.load(open(f))['rows']:
    for w in r['web']: rows.append((' '.join(w['en'].values()),' '.join(w['zh'].values())))
    rows.append((' '.join(r['lop']['en'].values()),' '.join(r['lop']['zh'].values())))
def en(t): return ' '+re.sub(r"[^a-z' ]+",' ',t.lower())+' '
def zh(t): return re.sub(r'\([^)]*\)','',t)
R=[(en(a),zh(b)) for a,b in rows]
def forms(w):
    w=w.lower().strip(); out={w}
    if ' ' not in w:
        out|={w+'s',w+'es',w+'ed',w+'d',w+'ing',w+"'s"}
        if w.endswith('y'): out|={w[:-1]+'ies',w[:-1]+'ied'}
        if w.endswith('e'): out.add(w[:-1]+'ing')
        if re.search(r'[^aeiou][aeiou][bdgmnprt]$',w): out|={w+w[-1]+'ing',w+w[-1]+'ed'}
    return out
short=[]
for x in need:
    vs=[re.sub(r'\s+',' ',v).strip() for v in re.split(r'[/,]',re.sub(r'\(.*?\)','',x['word'])) if v.strip()]
    if x['lang']=='EN':
        n=sum(1 for e,_ in R if any((' '+re.sub(r"[^a-z' ]+",' ',f)+' ') in e for v in vs for f in forms(v)))
    else:
        n=sum(1 for _,z in R if any(v in z for v in vs))
    tgt=x.get('target',x['add']); ok=n>=tgt
    if not ok: short.append(x['word'])
    print(('OK ' if ok else '.. ')+x['word'].ljust(28),'có',n,'hàng, cần ≥',tgt)
print('\nCÒN THIẾU:',len(short),short)
