import json,glob,re,collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/out/'
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
UNIT=r'(câu|lượt|cặp|lệnh|tranh|thẻ|cảnh|chỗ trống|từ|tình huống|cụm|đối thoại)'
tot=collections.Counter(); per=collections.defaultdict(collections.Counter); ex=collections.defaultdict(list)
CIRC='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳'
for c in ORDER:
  for f in sorted(glob.glob(G+c+'-*.json')):
    if not re.match(r'^'+re.escape(c)+r'-[a-c]\.json$',f.split('/')[-1]): continue
    for r in json.load(open(f))['rows']:
      for l in ['en','zh']:
        s=r['lop'][l]['slide']
        # split activities by "N) "
        acts=re.split(r'(?:(?<=\s)|^)(\d{1,2})\)\s',s)
        for m in re.finditer(r'\((\d+)\s*'+UNIT,s):
          n=int(m.group(1)); k='<5' if n<5 else ('>10' if n>10 else '5-10')
          per[c][k]+=1; tot[k]+=1
          if k!='5-10' and len(ex[c,k])<4: ex[c,k].append('buổi %s %s: …%s…'%(r['buoi'],l,s[max(0,m.start()-60):m.end()+5].replace('\n',' ')))
        # circled lists per activity chunk
        for chunk in re.split(r'\s\d{1,2}\)\s',s):
          n=sum(chunk.count(ch) for ch in CIRC)
          if n:
            k='<5' if n<5 else ('>10' if n>10 else '5-10'); per[c]['circ'+k]+=1
print('Class activities with stated item count (n câu/lượt/cặp…):')
for c in ORDER: print(' ',c,dict(per[c]))
print('total',dict(tot))
for (c,k),v in ex.items():
  print('--',c,k); [print('    ',x) for x in v[:2]]
