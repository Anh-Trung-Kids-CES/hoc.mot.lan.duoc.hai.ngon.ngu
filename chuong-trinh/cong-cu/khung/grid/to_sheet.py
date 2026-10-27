# Chuyển grid/out/<cid>-<part>.json thành các khối ghi Sheet (A..T) + kiểm tra
import json, sys, re, os, glob
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
TAB={'preb':'PreB','little-seed':'Little Seed','seedling':'Seedling','canopy':'Canopy','larva':'Larva','larva-plus':'Larva Plus','pupa':'Pupa','cocoon':'Cocoon','butterfly':'Butterfly'}
WEB=['tu','cum','cau','truyen','video']; LOP=['flash','slide','truyen','baihat']
VI=re.compile(r'[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệịỉĩọỏốồổỗộớờởỡợụủứừửữựỳỷỹỵ]',re.I)
def esc(s):
    s='' if s is None else str(s).strip()
    if s=='' : s='–'
    return "'"+s if s[0] in '=+-@' else s
def check(cid,part,d):
    pk=json.load(open(G+'packs/%s.json'%cid))
    probs=[]
    rows=d['rows']
    for r in rows:
        if len(r.get('web',[]))!=2: probs.append('buổi %s: %d ngày web'%(r.get('buoi'),len(r.get('web',[]))))
        for w in r.get('web',[]):
            for L in ('en','zh'):
                for k in WEB:
                    if not str(w.get(L,{}).get(k,'')).strip(): probs.append('ngày %s %s.%s trống'%(w.get('ngay'),L,k))
        for L in ('en','zh'):
            for k in LOP:
                if not str(r.get('lop',{}).get(L,{}).get(k,'')).strip(): probs.append('buổi %s lớp %s.%s trống'%(r.get('buoi'),L,k))
        # chữ Hán dịch tên riêng
        for bad in ('安娜','里奥','小美','莱奥'):
            if bad in json.dumps(r,ensure_ascii=False): probs.append('buổi %s có tên phiên âm %s'%(r.get('buoi'),bad))
    # Tiếng Việt trong nội dung học (bỏ qua nhãn: Mới/Ôn/Ngữ pháp/Tìm YouTube, slide là hướng dẫn cô)
    def strip_labels(s):
        s=re.sub(r'\[[^\]]*\]','',s); s=re.sub(r'(Mới|Ôn|Tìm YouTube|Nghe thêm|Giai điệu|Lời|Từ khóa)\s*:','',s)
        return s
    for r in rows:
        for w in r['web']:
            for L in ('en','zh'):
                for k in ('cau','truyen'):
                    t=strip_labels(str(w[L][k])).replace('Bông','').replace('Nhan','')
                    m=VI.findall(t)
                    if len(m)>6: probs.append('ngày %s %s.%s có thể có tiếng Việt: %s'%(w['ngay'],L,k,t[:80]))
    # từ lõi có nhãn Mới trong unit
    missing={}
    for u,ud in pk['units'].items():
        u=int(u)
        mine=[r for r in rows if r.get('unit')==u]
        if not mine or 'words' not in ud: continue
        txt=' '.join(w[L]['tu']+' '+w[L]['cum'] for r in mine for w in r['web'] for L in ('en','zh'))
        for typ in ('Từ lõi',):
            for L in ('en','zh'):
                for x in ud['words'].get(typ,{}).get(L,[]):
                    wd=re.sub(r'\s*\((Starters|Movers|Flyers|YCT\d)\)$','',x)
                    if wd.lower() not in txt.lower(): missing.setdefault(u,[]).append(wd)
    return probs,missing
def links(d):
    return set(re.findall(r'https?://[^\s,;)\]"<>]+',json.dumps(d,ensure_ascii=False)))
def build(cid,part,chunk=10):
    d=json.load(open(G+'out/%s-%s.json'%(cid,part)))
    out=[]
    for r in sorted(d['rows'],key=lambda r:r['buoi']):
        for i,w in enumerate(r['web']):
            row=[esc(w.get('label','Ngày %s'%w['ngay']))]+[esc(w['en'][k]) for k in WEB]+[esc(w['zh'][k]) for k in WEB]
            if i==0: row+= [esc(r['label_buoi'])]+[esc(r['lop']['en'][k]) for k in LOP]+[esc(r['lop']['zh'][k]) for k in LOP]
            else: row+= [None]*9
            out.append((w['ngay'],row))
    os.makedirs(G+'sheet',exist_ok=True)
    for f in glob.glob(G+'sheet/%s-%s-*.json'%(cid,part)): os.remove(f)
    files=[]
    for k in range(0,len(out),chunk):
        part_rows=out[k:k+chunk]; r0=3+part_rows[0][0]; r1=3+part_rows[-1][0]
        assert r1-r0+1==len(part_rows)
        fn=G+'sheet/%s-%s-%02d.json'%(cid,part,k//chunk+1)
        json.dump({'range':"'%s'!A%d:T%d"%(TAB[cid],r0,r1),'values':[x[1] for x in part_rows]},open(fn,'w'),ensure_ascii=False)
        files.append((fn,os.path.getsize(fn)))
    return d,files
if __name__=='__main__':
    for arg in sys.argv[1:]:
        cid,part=arg.rsplit('-',1)
        d,files=build(cid,part)
        probs,missing=check(cid,part,d)
        print('==',arg,'buổi',len(d['rows']),'khối ghi',len(files),'KB',round(sum(s for _,s in files)/1024))
        print('  vấn đề:',len(probs)); [print('   ',p) for p in probs[:15]]
        print('  từ lõi chưa có:',{u:len(v) for u,v in missing.items()}, {u:v[:8] for u,v in missing.items()})
        src=open(G+'packs/%s.json'%cid).read()+''.join(open(f).read() for f in glob.glob(G+'packs/*.json'))
        bad=[l for l in links(d) if l.rstrip('.') not in src]
        print('  link:',len(links(d)),'link không có trong nguồn (bịa?):',bad)
