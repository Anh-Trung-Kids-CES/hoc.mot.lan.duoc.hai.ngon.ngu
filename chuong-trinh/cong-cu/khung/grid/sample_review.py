# Rút mẫu ngẫu nhiên ngày web + buổi để người kiểm tra độc lập rà khớp Anh – Trung
import json, random, glob, os, sys
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
os.makedirs(G+'review',exist_ok=True)
random.seed(int(sys.argv[1]) if len(sys.argv)>1 else 11)
COURSES=['little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
for c in COURSES:
    days=[];ses=[]
    for f in sorted(glob.glob(G+'out/%s-*.json'%c)):
        for r in json.load(open(f))['rows']:
            for w in r['web']: days.append(w)
            ses.append(r)
    pick_d=random.sample(days,min(8,len(days))); pick_s=random.sample(ses,min(3,len(ses)))
    out=[]
    for w in sorted(pick_d,key=lambda x:x['ngay']):
        out.append('### '+w['label']+'\nEN:\n'+'\n'.join('- %s: %s'%(k,v) for k,v in w['en'].items())+'\nZH:\n'+'\n'.join('- %s: %s'%(k,v) for k,v in w['zh'].items()))
    for r in sorted(pick_s,key=lambda x:x['buoi']):
        out.append('### '+r['label_buoi']+' (trên lớp)\nEN:\n'+'\n'.join('- %s: %s'%(k,v) for k,v in r['lop']['en'].items())+'\nZH:\n'+'\n'.join('- %s: %s'%(k,v) for k,v in r['lop']['zh'].items()))
    open(G+'review/%s.md'%c,'w').write('\n\n'.join(out))
    print(c,len(pick_d),len(pick_s))
