# Sinh dữ liệu cho trang chương trình Anh – Trung – Kids (thư mục chuong-trinh/)
import json, re, random, collections, os
S='/tmp/claude-0/-home-claude/90b5872a-a8dd-505f-8810-4b4160312da5/scratchpad/'
OUT=S+'repo/r/chuong-trinh/data/'
os.makedirs(OUT+'bai',exist_ok=True)
B=json.load(open(S+'ctr/bank.json'))
A=json.load(open(S+'cov/allocation.json'))
PRE='../xem-truoc/'
random.seed(23)

COURSES=[
 dict(id='preb',name='PreB',stage='Dự bị',age='4–5',time='15 tuần · 30 buổi × 45 phút',en='~100 từ, nghe hiểu 12 chủ đề',zh='–',bridge='–'),
 dict(id='little-seed',name='Little Seed',stage='1 · Nảy mầm',age='5–6',time='30 tuần · 60 buổi × 45 phút',en='~150 từ',zh='~80 từ nghe – nói',bridge='BRIDGE 1 đang hình thành'),
 dict(id='seedling',name='Seedling',stage='1 · Nảy mầm',age='5–6',time='30 tuần · 60 buổi × 50 phút',en='~250 từ',zh='YCT1',bridge='BRIDGE 1'),
 dict(id='canopy',name='Canopy',stage='2 · Vươn tán',age='6–7',time='30 tuần · 60 buổi × 60 phút',en='Pre-A1 Starters',zh='YCT2',bridge='BRIDGE 2'),
 dict(id='larva',name='Larva',stage='2 · Vươn tán',age='7–8',time='30 tuần · 60 buổi × 60 phút',en='A1 Movers',zh='YCT3',bridge='BRIDGE 3'),
 dict(id='larva-plus',name='Larva Plus',stage='Bổ trợ',age='7–8',time='15 tuần · 30 buổi × 60 phút',en='Movers vững, thi Movers',zh='Giữ YCT3',bridge='Giữ BRIDGE 3'),
 dict(id='pupa',name='Pupa',stage='3 · Hóa bướm',age='8–9',time='30 tuần · 60 buổi × 75 phút',en='A1 → A2',zh='Đầu YCT4',bridge='BRIDGE 4'),
 dict(id='cocoon',name='Cocoon',stage='3 · Hóa bướm',age='9–10',time='30 tuần · 60 buổi × 90 phút',en='A2 Flyers',zh='YCT4',bridge='BRIDGE 5'),
 dict(id='butterfly',name='Butterfly',stage='Về đích',age='9–10',time='15 tuần · 30 buổi × 90 phút',en='Flyers vững, thi Flyers',zh='YCT4 vững, thi YCT4',bridge='Chứng nhận BRIDGE 5'),
]
CID={c['name']:c['id'] for c in COURSES}
WEB_MIN={'Little Seed':'10–15','Seedling':'10–15','Canopy':'15–20'}
ONQ_N={'Little Seed':3,'Seedling':3,'Canopy':5}

# ---------- kho (items dùng trên web) ----------
items=B['items']; stories=B['stories']
def P(x): return PRE+x if x else ''
LISTEN_ONLY={'Nice to meet you!'}
NO_ZH_EAR={'他','她'}
kho={}
for k,i in items.items():
    if i['kind']=='char': continue
    kho[k]=dict(id=k,k=i['kind'],c=i['course'],u=i['unit'],d=i['day'],en=i['en'],zh=i['zh'],py=i.get('py',''),
        pics=[P(x) for x in i['pics'] if x],emo=i.get('emo',''),
        a={'en':[P(x) for x in i['aud'].get('en',[])],'zh':[P(x) for x in i['aud'].get('zh',[])]},
        lines=[dict(t=l['t'],l=l['l'],a=P(l['a']),w=l['w']) for l in i.get('lines',[])],
        nghe=i['en'] in LISTEN_ONLY, noear=i['zh'] in NO_ZH_EAR)
chars={k:dict(id=k,chu=i['en'] or i['zh'],l='en' if i['en'] else 'zh',pic=P(i['pics'][0]) if i['pics'] else '',hint=P(i.get('hint','')),a=P((i['aud'].get('en') or i['aud'].get('zh'))[0]),u=i['unit']) for k,i in items.items() if i['kind']=='char'}
truyen={}
for k,s in stories.items():
    sc=[]
    for j,x in enumerate(s['scenes']):
        d=dict(img=P(x['img']),emo=x.get('emo',''),en=x['en'],zh=x['zh'],py=x.get('py',''))
        if 'aen' in x: d['aen']=P(x['aen']); d['azh']=P(x['azh'])
        sc.append(d)
    t=dict(id=k,c=s['course'],u=s['unit'],title=s['title'],scenes=sc)
    if s.get('full'):
        t['full']={l:(dict(f=P(v['f']),s=v['s']) if v else None) for l,v in s['full'].items()}
    truyen[k]=t

# ---------- quy tắc chọn ----------
def unit_items(c,u,kinds=('word',)):
    return [x for x in kho.values() if x['c']==c and x['u']==u and x['k'] in kinds]
def older_pool(c,u):
    """từ của các unit trước (cùng khóa) và từ khóa trước được xếp lịch vào unit này hoặc trước"""
    pool=[x for x in kho.values() if x['c']==c and x['u']<u and x['k']=='word' and x['pics']]
    if c=='Canopy':
        sched=set()
        for a in A:
            if a['course']=='Little Seed':
                for m in re.finditer(r'Canopy U(\d+) ',a['review_next_course']):
                    if int(m.group(1))<=u: sched.add(a['word'].lower())
        pool+= [x for x in kho.values() if x['c']=='Little Seed' and x['k']=='word' and (x['en'].lower() in sched or x['zh'] in sched)]
    return pool
BAD_PAIRS=[{'ls_w_hello','ls_w_goodbye'}]
def opts_for(correct, cur, old, n=3, need_old=True):
    """1 đáp án đúng + phương án nhiễu: ít nhất 1 từ unit trước (nếu có), không bao giờ từ chưa học"""
    cand_cur=[x for x in cur if x['id']!=correct['id'] and x['pics']]
    cand_old=[x for x in old if x['id']!=correct['id'] and x['pics'] and x['en']!=correct['en']]
    ds=[]
    if need_old and cand_old: ds.append(random.choice(cand_old))
    random.shuffle(cand_cur)
    for x in cand_cur+cand_old:
        if len(ds)>=n-1: break
        if x in ds: continue
        if any({x['id'],correct['id']}==p for p in BAD_PAIRS) or any({x['id'],d['id']}==p for p in BAD_PAIRS for d in ds): continue
        ds.append(x)
    o=[correct]+ds[:n-1]; random.shuffle(o)
    return [x['id'] for x in o], o.index(correct)

def lang_ok(x,l): return not (l=='zh' and x['noear'])

def act_the(xs): return dict(t='the',items=[x['id'] for x in xs])
def act_chon(xs, cur, old, langs=('en','zh'), pick=1):
    qs=[]
    for x in xs:
        for l in langs:
            if not lang_ok(x,l) or not x['a'][l]: continue
            o,a=opts_for(x,cur,old)
            qs.append(dict(id=x['id'],l=l,opts=o,ans=a,pic=min(pick,len(x['pics'])-1)))
    random.shuffle(qs); return dict(t='chon',qs=qs)
def act_chon_chu(xs, cur, old, l='zh'):
    qs=[]
    for x in xs:
        pool=[y for y in cur+old if y['id']!=x['id'] and y[l] and y[l]!=x[l]]
        ds=random.sample(pool,min(2,len(pool)))
        o=[x]+ds; random.shuffle(o)
        qs.append(dict(id=x['id'],l=l,opts=[y['id'] for y in o],ans=o.index(x)))
    random.shuffle(qs); return dict(t='chon_chu',qs=qs)
def act_noi(xs, mode='nhai', langs=('en','zh')):
    its=[]
    for x in xs:
        if x['nghe']: continue
        for l in langs:
            if x['a'][l]: its.append(dict(id=x['id'],l=l))
    return dict(t='noi',mode=mode,items=its)
def act_dich(xs):
    its=[]
    for x in xs:
        if x['nghe']: continue
        l=random.choice(['en','zh'])
        if not lang_ok(x,l): l='en'
        its.append(dict(id=x['id'],l=l))
    random.shuffle(its); return dict(t='noi',mode='dich',items=its)
def act_at(xs,n=6):
    qs=[]
    for x in xs:
        for l in ('en','zh'):
            if lang_ok(x,l) and x['a'][l]: qs.append(dict(id=x['id'],l=l))
    random.shuffle(qs); qs=qs[:n]
    return dict(t='anh_trung',qs=qs)
def act_ghep(xs): return dict(t='ghep',items=[x['id'] for x in xs[:4]])
def act_cau(xs, pool):
    qs=[]
    for x in xs:
        if not x['pics']: continue
        l=random.choice(['en','zh'])
        o,a=opts_for(x,[y for y in pool if y['pics']],[],need_old=False)
        qs.append(dict(id=x['id'],l=l,opts=o,ans=a,pic=0))
    return dict(t='cau',qs=qs)
def act_truyen(sid, first): return dict(t='truyen',story=sid,first=first)
def act_truyen_hoi(sid, n=4):
    s=truyen[sid]; idx=list(range(len(s['scenes']))); random.shuffle(idx)
    qs=[]
    for j in idx[:n]:
        others=[k for k in range(len(s['scenes'])) if k!=j]; ds=random.sample(others,2)
        o=[j]+ds; random.shuffle(o); qs.append(dict(scene=j,l=random.choice(['en','zh']),opts=o,ans=o.index(j)))
    return dict(t='truyen_hoi',story=sid,qs=qs)

def on_nhanh(c,u,web):
    pool=older_pool(c,u)
    if not pool: return None
    return dict(t='on_nhanh',n=ONQ_N[c],pool=[x['id'] for x in pool])

# ---------- dựng 6 bài web cho mỗi unit có tranh, giọng ----------
def ls_videos(u):
    out={}
    L=json.load(open(S+'ctr/ls_days.json'))
    for d in L:
        if d['u']==u: out[d['dn']]=d['xem']
    return out

def build_unit(c,u):
    words=unit_items(c,u,('word',)); phr=unit_items(c,u,('phrase',)); sen=unit_items(c,u,('sentence','dialog'))
    words=[x for x in words if x['pics']]
    old=older_pool(c,u)
    prev=[x for x in kho.values() if x['c']==c and x['u']==u-1 and x['k']=='word' and x['pics']]
    days=sorted({x['d'] for x in words})
    sts=[k for k,s in truyen.items() if s['c']==c and s['u']==u]
    vids=ls_videos(u) if c=='Little Seed' else {}
    webs=[]
    newdays=days[:4] if c=='Little Seed' else days[:3]
    seen=[]
    for k,dn in enumerate(newdays,1):
        acts=[]
        oq=on_nhanh(c,u,k)
        if oq: acts.append(oq)
        if vids.get(dn): acts.append(dict(t='xem',parts=vids[dn]))
        nw=[x for x in words if x['d']==dn]
        np_=[x for x in phr if x['d']==dn]; ns=[x for x in sen if x['d']==dn]
        acts.append(act_the(nw))
        acts.append(act_chon(nw,words,old,pick=1))
        if seen: acts.append(act_chon(random.sample(seen,min(3,len(seen))),words,old,langs=(random.choice(['en','zh']),),pick=2))
        acts.append(act_noi(nw,'nhai'))
        if k==3 and prev: acts.append(act_chon(random.sample(prev,min(4,len(prev))),words+prev,old,langs=('zh','en'),pick=2))
        if np_: acts.append(act_the(np_)); acts.append(act_noi(np_,'nhai',langs=('en','zh')))
        if ns: acts.append(act_cau(ns, sen+phr))
        if c=='Canopy': acts.append(act_chon_chu(nw,words,old,'zh'))
        seen+=nw
        acts.append(act_at(seen+np_))
        webs.append(dict(n=k,acts=[a for a in acts if a and (a.get('qs') or a.get('items') or a['t'] in ('on_nhanh','xem'))]))
    # bài ôn và truyện
    allw=words
    while len(webs)<6:
        k=len(webs)+1; acts=[]
        oq=on_nhanh(c,u,k)
        if oq: acts.append(oq)
        if c=='Canopy' and k==4:
            acts.append(act_the(allw)); acts.append(act_chon(allw,allw,old,langs=('zh','en'),pick=0))
            acts.append(act_chon_chu(random.sample(allw,min(8,len(allw))),allw,old,'en'))
            acts.append(act_dich(random.sample(allw,min(6,len(allw)))))
            acts.append(act_ghep(random.sample(phr,min(4,len(phr))) if phr else allw))
            acts.append(act_at(allw+phr,8))
        else:
            si=sts[(k-5) % len(sts)] if sts else None
            if c=='Little Seed':
                si=sts[0] if sts else None
                first='en' if k==5 else 'zh'
            else:
                first='en' if k==5 else 'zh'
            if si:
                acts.append(act_truyen(si,first)); acts.append(act_truyen_hoi(si,4))
            if c=='Little Seed' and k==5:
                cs=[x for x in chars.values() if x['u']==u]
                if cs: acts.append(dict(t='nhin_chu',items=[x['id'] for x in cs]))
                acts.append(act_chon(random.sample(allw,min(4,len(allw))),allw,old,langs=('zh',),pick=0))
            if k==6:
                acts.append(act_dich(random.sample(allw,min(6,len(allw)))))
                acts.append(act_ghep(random.sample(allw,min(4,len(allw)))))
                acts.append(dict(t='hop_on'))
            else:
                acts.append(act_at(allw+phr,6))
        webs.append(dict(n=k,acts=[a for a in acts if a]))
    return webs

# Little Seed: video theo ngày
L=json.load(open(S+'ctr/ls_days.json')) if os.path.exists(S+'ctr/ls_days.json') else None
built={}
for c,us in (('Little Seed',(1,2,3)),('Canopy',(5,6,7))):
    for u in us:
        webs=build_unit(c,u)
        built[(c,u)]=webs
        json.dump(dict(course=c,unit=u,webs=webs),open(OUT+'bai/%s-u%d.json'%(CID[c],u),'w'),ensure_ascii=False)

# ---------- đếm lượt trên web (mỗi tiếng) ----------
def count(c,u):
    ex=collections.Counter(); rt=collections.Counter()
    def hit(id_,l,n=1,ret=False):
        ex[(id_,l)]+=n
        if ret: rt[(id_,l)]+=1
    def in_text(text,l,n=1):
        for x in kho.values():
            w=x[l]
            if not w or x['k']!='word': continue
            if (l=='zh' and w in text) or (l=='en' and re.search(r'(?i)\b'+re.escape(w)+r'\b',text)): ex[(x['id'],l)]+=n
    for w in built[(c,u)]:
        for a in w['acts']:
            t=a['t']
            if t=='the':
                for i in a['items']: hit(i,'en'); hit(i,'zh')
            elif t in('chon','cau'):
                for q in a['qs']:
                    o='zh' if q['l']=='en' else 'en'
                    if kho[q['id']]['k']=='word': hit(q['id'],q['l'],ret=True); hit(q['id'],o)
                    else: in_text(kho[q['id']][q['l']],q['l']); in_text(kho[q['id']][o],o)
            elif t=='chon_chu':
                for q in a['qs']:
                    hit(q['id'],q['l'],ret=True)
                    for oid in q['opts']:
                        if oid!=q['id']: hit(oid,q['l'],0.5)
            elif t=='noi':
                for it in a['items']:
                    x=kho[it['id']]
                    if x['k']=='word':
                        if a['mode']=='dich': o='zh' if it['l']=='en' else 'en'; hit(it['id'],it['l']); hit(it['id'],o,2,ret=True)
                        else: hit(it['id'],it['l'],2)
                    else: in_text(x[it['l']],it['l'],2)
            elif t=='anh_trung':
                for q in a['qs']:
                    x=kho[q['id']]
                    if x['k']=='word': hit(q['id'],q['l'])
                    else: in_text(x[q['l']],q['l'])
            elif t=='ghep':
                for i in a['items']: hit(i,'en',2); hit(i,'zh',2)
            elif t=='truyen':
                for s in truyen[a['story']]['scenes']: in_text(s['en'],'en'); in_text(s['zh'],'zh')
            elif t=='truyen_hoi':
                for q in a['qs']:
                    s=truyen[a['story']]['scenes'][q['scene']]; in_text(s[q['l']],q['l'])
            elif t=='on_nhanh':
                pass
    return ex,rt
rep={}
for (c,u) in built:
    ex,rt=count(c,u)
    ws=[x for x in kho.values() if x['c']==c and x['u']==u and x['k']=='word' and x['pics']]
    rows=[]
    for x in ws:
        rows.append((x['en'],x['zh'],ex[(x['id'],'en')],ex[(x['id'],'zh')],rt[(x['id'],'en')]+rt[(x['id'],'zh')]))
    rep['%s U%d'%(c,u)]=rows
json.dump({k:v for k,v in rep.items()},open(S+'ctr/counts.json','w'),ensure_ascii=False)
for k,v in rep.items():
    e=[r[2] for r in v]; z=[r[3] for r in v]; r_=[r[4] for r in v]
    print(k,'EN',min(e),'-',max(e),'ZH',min(z),'-',max(z),'tự nhớ lại',min(r_),'-',max(r_))

# ---------- dữ liệu chương trình (bản đồ 9 khóa) ----------
UN={}
for a in A:
    UN.setdefault(a['course'],{})
    p=a['unit'].split(' · ',1); UN[a['course']].setdefault(a['unit_no'],p[1] if len(p)>1 else '')
units={}
for a in A:
    if a['role'].startswith('Chỉ nghe'): continue
    c=a['course']; u=a['unit_no']
    d=units.setdefault(c,{}).setdefault(u,dict(u=u,name=UN[c][u],en=[],zh=[]))
    w=dict(w=a['word'],t=a['rep_type'],lv=a['level'])
    (d['en'] if a['lang']=='Tiếng Anh' else d['zh']).append(w)
data=dict(courses=[])
for cm in COURSES:
    c=cm['name']; us=[]
    for u in sorted(units.get(c,{})):
        d=units[c][u]; d['web']=(c,u) in built; d['webs']=6 if d['web'] else 0
        us.append(d)
    cm2=dict(cm); cm2['units']=us; cm2['web_min']=WEB_MIN.get(c,'')
    data['courses'].append(cm2)
data['kho']=kho; data['chars']=chars; data['truyen']=truyen; data['people']={k:[v[0],P(v[2])] for k,v in B['people'].items()}
json.dump(data,open(OUT+'chuong-trinh.json','w'),ensure_ascii=False)
print('size',os.path.getsize(OUT+'chuong-trinh.json'))

SEC=dict(the=6,chon=7,cau=9,noi=8,anh_trung=5,chon_chu=7,truyen_hoi=7,nhin_chu=6)
for (c,u),webs in built.items():
    out=[]
    for w in webs:
        t=0
        for a in w['acts']:
            n=len(a.get('qs') or a.get('items') or [])
            if a['t'] in SEC: t+=SEC[a['t']]*n
            elif a['t']=='xem': t+=180
            elif a['t']=='truyen': t+=6*len(truyen[a['story']]['scenes'])*2
            elif a['t']=='ghep': t+=45
            elif a['t']=='on_nhanh': t+=9*a['n']
            elif a['t']=='hop_on': t+=60
        out.append(round(t/60,1))
    print(c,u,'phút/bài',out)
