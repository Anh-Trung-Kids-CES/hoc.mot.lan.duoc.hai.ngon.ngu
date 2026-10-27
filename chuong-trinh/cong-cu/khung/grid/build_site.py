# Gộp grid/out/<cid>-*.json -> trang web data/bang/<cid>.json + .csv (cùng bố cục Sheet)
import json, glob, csv, os, collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
OUT=_CT+'data/bang/'
os.makedirs(OUT,exist_ok=True)
PARTS={'preb':'a','larva-plus':'ab','butterfly':'ab'}
WEB=['tu','cum','cau','truyen','video']; LOP=['flash','slide','truyen','baihat']
done=[]
for f in sorted(glob.glob(G+'packs/*.json')):
    cid=os.path.basename(f)[:-5]
    need=PARTS.get(cid,'abc')
    files=[G+'out/%s-%s.json'%(cid,p) for p in need]
    if not all(os.path.exists(x) for x in files): continue
    pk=json.load(open(f))
    rows={}
    for x in files:
        for r in json.load(open(x))['rows']: rows[r['buoi']]=r
    blocks=[]; cnt=collections.Counter()
    for b in pk['skeleton']:
        cnt[b['kind']]+=1
        key='u%d'%b['unit'] if b['kind']=='unit' else b['kind']+(str(cnt[b['kind']]) if b['kind'] in ('on','le') else '')
        title=('Unit %d · %s'%(b['unit'],pk['units'][str(b['unit'])]['title'].split('·',1)[-1].strip()) if b['kind']=='unit' else b['label'])
        rs=[rows[s['buoi']] for s in b['sessions']]
        blocks.append(dict(kind=b['kind'],unit=b['unit'],key=key,title=title,rows=rs))
    json.dump(dict(course=pk['course'],blocks=blocks),open(OUT+cid+'.json','w'),ensure_ascii=False,separators=(',',':'))
    with open(OUT+cid+'.csv','w',newline='',encoding='utf-8-sig') as fh:
        w=csv.writer(fh)
        w.writerow(['','Nội dung đẩy lên web']+['']*10+['Nội dung dạy trên lớp']+['']*7)
        w.writerow(['','Tiếng Anh','','','','','Tiếng Trung','','','','','','Tiếng Anh','','','','Tiếng Trung'])
        H=['Từ','Cụm từ','Câu (cài các chủ điểm ngữ pháp cần thiết vào)','Truyện (ngữ cảnh hoàn chỉnh chứa đầy đủ từ, cụm từ, câu đã học phía trước)','Video tìm được trên web/ youtube có nội dung tương đương']
        L=['Flash card','Slide có bài tập tương tác','Truyện','Bài hát']
        w.writerow(['']+H+H+['']+L+L)
        for b in blocks:
            for r in b['rows']:
                for j,x in enumerate(r['web']):
                    row=[x['label']]+[x['en'][k] for k in WEB]+[x['zh'][k] for k in WEB]
                    row+=([r['label_buoi']]+[r['lop']['en'][k] for k in LOP]+[r['lop']['zh'][k] for k in LOP]) if j==0 else ['']*9
                    w.writerow(row)
    # bản chỉ có hàng dữ liệu (A..T), để Sheet nhập bằng IMPORTDATA rồi đổi thành giá trị
    with open(OUT+cid+'-sheet.csv','w',newline='',encoding='utf-8') as fh:
        w=csv.writer(fh)
        for b in blocks:
            for r in b['rows']:
                for j,x in enumerate(r['web']):
                    row=[x['label']]+[x['en'][k] for k in WEB]+[x['zh'][k] for k in WEB]
                    row+=([r['label_buoi']]+[r['lop']['en'][k] for k in LOP]+[r['lop']['zh'][k] for k in LOP]) if j==0 else ['']*9
                    w.writerow([str(v).strip() if str(v).strip() else '–' for v in row[:11]]+[str(v).strip() for v in row[11:]] if j else [str(v).strip() or '–' for v in row])
    done.append((cid,sum(len(b['rows']) for b in blocks),os.path.getsize(OUT+cid+'.json')//1024))
print(done)
