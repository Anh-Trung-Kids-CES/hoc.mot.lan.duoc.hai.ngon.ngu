# Kiểm tra 4 nguyên tắc cho một phần: python3 check_principles.py canopy-a
import json, re, sys, glob
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
part=sys.argv[1]; cid=part.rsplit('-',1)[0]
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
d=json.load(open(G+'out/%s.json'%part)); rows=d['rows']
young=cid in ('preb','little-seed','seedling')
fails={}
def fail(k,where): fails.setdefault(k,[]).append(where)
# tiếng Anh con đã gặp trước phần này (các khóa trước + các phần trước của khóa này)
seen=set()
for c in ORDER[:ORDER.index(cid)+1]:
    for f in sorted(glob.glob(G+'out/%s-*.json'%c)):
        if f.endswith(part+'.json'): break
        for r in json.load(open(f))['rows']:
            for w in r['web']: seen|=set(re.findall(r'[a-z]+',json.dumps(w['en']).lower()))
            seen|=set(re.findall(r'[a-z]+',json.dumps(r['lop']['en']).lower()))
tot=ok=0
first_day_of_unit={}
for r in rows:
    b=r['buoi']
    for w in r['web']:
        if r.get('unit')!='' and r.get('unit') not in first_day_of_unit: first_day_of_unit[r['unit']]=w
for r in rows:
    b=r['buoi']; lop=r['lop']
    if '[Lời cô]' not in lop['en']['slide']: fail('[Lời cô] trong slide en mỗi buổi','buổi %s'%b)
    if cid!='preb':
        if '[Cầu nối' not in lop['zh']['slide']: fail('[Cầu nối Anh – Trung] trong slide zh mỗi buổi','buổi %s'%b)
        if '[Chuyển ngữ]' not in lop['en']['slide']+lop['zh']['slide']: fail('[Chuyển ngữ] trên lớp mỗi buổi','buổi %s'%b)
        if not any('[Chuyển ngữ]' in w['en']['cau']+w['zh']['cau'] or 'Phiên dịch nhí' in w['label'] for w in r['web']):
            fail('[Chuyển ngữ] trong cặp ngày web của buổi','buổi %s'%b)
    for w in r['web']:
        n=w['ngay']
        if cid!='preb':
            if '[Cầu nối]' not in w['zh']['cau']: fail('[Cầu nối] trong câu zh mỗi ngày web','ngày %s'%n)
            m=re.search(r'Mới:(.*?)(\||$)',w['zh']['tu'],re.S)
            if m and re.search(r'[一-鿿]',m.group(1)):
                for it in re.split(r'[,，]\s*(?=[一-鿿])',m.group(1).strip()):
                    if not re.search(r'[一-鿿]',it): continue
                    tot+=1
                    g=re.search(r'\(=\s*([^)]*)\)',it)
                    if not g: fail('Từ Trung mới ghi kèm (= nghĩa)','ngày %s: %s'%(n,it.strip()[:20])); continue
                    gl=g.group(1).lower()
                    if 'tranh' in gl: ok+=1; continue
                    day_en=set(re.findall(r'[a-z]+',json.dumps(w['en']).lower()))
                    if set(re.findall(r'[a-z]+',gl)) & (seen|day_en): ok+=1
                    else: fail('Nghĩa tiếng Anh của từ Trung mới đã có trước hoặc cùng ngày','ngày %s: %s'%(n,it.strip()[:30]))
        seen|=set(re.findall(r'[a-z]+',json.dumps(w['en']).lower()))
    seen|=set(re.findall(r'[a-z]+',json.dumps(lop['en']).lower()))
if young:
    for u,w in first_day_of_unit.items():
        if '[Lời web]' not in w['en']['cau']: fail('[Lời web] ở ngày đầu mỗi unit (khóa nhỏ)','unit %s'%u)
print('==',part,'buổi',len(rows))
if tot: print('Từ Trung mới có nghĩa đã biết: %d/%d'%(ok,tot))
if not fails: print('ĐẠT tất cả')
for k,v in fails.items(): print('CHƯA ĐẠT:',k,'—',len(v),'chỗ:',', '.join(v[:8]))
