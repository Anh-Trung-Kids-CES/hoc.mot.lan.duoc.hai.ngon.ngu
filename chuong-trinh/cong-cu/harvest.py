import json,re,collections,sys
R='/tmp/claude-0/-home-claude/90b5872a-a8dd-505f-8810-4b4160312da5/scratchpad/repo/r/xem-truoc/'
O='/tmp/claude-0/-home-claude/90b5872a-a8dd-505f-8810-4b4160312da5/scratchpad/ctr/'
def loadjs(f,var):
    t=open(R+f).read(); i=t.find('window.'+var+' = ')+len('window.'+var+' = '); return json.loads(t[i:t.rfind('}')+1])
L=loadjs('ls-data.js','LS'); C=loadjs('canopy-data.js','CANOPY')
t=open(R+'tai-nguyen/canopy-audio-map.js').read(); t=t[t.find('window.CN_AUDIO='):]; AM=json.loads(t[t.find('{'):t.rfind('}')+1])
t=open(R+'tai-nguyen/canopy-story-times.js').read(); t=t[t.find('window.CX_STORY='):]; ST=json.loads(t[t.find('{'):t.rfind('}')+1])
def akey(s):
    for a,b in [['里奥','Leo'],['安娜','Anna'],['小美','Xiaomei']]: s=s.split(a).join(b) if False else s.replace(a,b)
    return re.sub(r"[\s，。！？、,.!?：:;；“”\"…()（）\-–—]",'',s.replace('’',"'")).lower()
def cfile(text,l,who=None):
    c=AM.get(l+'|'+akey(text)) or []
    if not c: return None
    for w,f in c:
        if w==who: return f
    for w,f in c:
        if w=='co_huou': return f
    return c[0][1]
bank={'items':{},'stories':{},'chars':{}}
def add(it):
    k=it['id']
    if k in bank['items']:
        old=bank['items'][k]
        for x in it.get('pics',[]):
            if x not in old['pics']: old['pics'].append(x)
        for l in ('en','zh'):
            for a in it.get('aud',{}).get(l,[]):
                if a not in old['aud'].setdefault(l,[]): old['aud'][l].append(a)
        return
    bank['items'][k]=it
# ---------- Little Seed ----------
LSU={1:1,2:2,3:3}
def lsday(n): return (n-1)%7+1
for d in L['days']:
    u=LSU[d['r']]; dn=lsday(d['n'])
    for s in d['steps']:
        if s['type']=='cham' and s.get('mode')=='tu':
            for it in s['demo']:
                key=re.search(r'_tu_(.+?)_l\d',it['pic']).group(1)
                pics=[it['pic'].replace('_l1.','_l%d.'%i) for i in (1,2,3)]
                aud={'en':[x['a'] for x in it['seq'] if x['l']=='en'],'zh':[x['a'] for x in it['seq'] if x['l']=='zh']}
                add(dict(id='ls_w_'+key,kind='word',course='Little Seed',unit=u,day=dn,en=it['en'],zh=it['zh'],pics=pics,aud=aud,move=it.get('move','')))
        if s['type']=='noi':
            for tu in s['turns']:
                m=re.search(r'_cum_(.+?)_l(\d)',tu['pic'] or '')
                if not m: continue
                key=m.group(1)
                it=dict(id='ls_p_'+key,kind='phrase',course='Little Seed',unit=u,day=dn,en='',zh='',pics=[tu['pic']],aud={'en':[],'zh':[]})
                for x in tu['say']:
                    if x['l']=='en': it['en']=x['t']; it['aud']['en'].append(x['a'])
                    else: it['zh']=x['t']; it['aud']['zh'].append(x['a'])
                if it['id'] in bank['items']:
                    o=bank['items'][it['id']]
                    if not o['en']: o['en']=it['en']
                    if not o['zh']: o['zh']=it['zh']
                add(it)
        if s['type']=='cham' and s.get('mode')=='cau':
            for it in s['demo']:
                m=re.search(r'_cau_(.+?)_l(\d)',it['pic']); key=m.group(1)
                lines=[{'t':x['t'],'l':x['l'],'a':x['a'],'w':x['w']} for x in it['seq']]
                add(dict(id='ls_s_'+key,kind='dialog',course='Little Seed',unit=u,day=dn,en=' / '.join(x['t'] for x in lines if x['l']=='en'),zh=' / '.join(x['t'] for x in lines if x['l']=='zh'),pics=[it['pic'].replace('_l1.','_l%d.'%i) for i in (1,2,3)],lines=lines,aud={'en':[],'zh':[]}))
        if s['type']=='nc':
            for cd in s.get('cards',[]):
                k='ls_c_'+cd['chu']
                if k not in bank['items']: bank['items'][k]=dict(id=k,kind='char',course='Little Seed',unit=u,day=dn,en=cd['chu'] if cd['l']=='en' else '',zh=cd['chu'] if cd['l']=='zh' else '',pics=[cd.get('pic','')],hint=cd.get('hint',''),aud={cd['l']:[cd['a']]})
for r,stv in L['stories'].items():
    bank['stories']['ls_story_%s'%r]=dict(id='ls_story_%s'%r,course='Little Seed',unit=LSU[int(r)],title=stv['title'],scenes=[{'img':sc['img'],'en':sc['en']['t'],'zh':sc['zh']['t'],'aen':sc['en']['a'],'azh':sc['zh']['a']} for sc in stv['scenes']])
# ---------- Canopy ----------
CNU={1:5,2:6,3:7}
for rd in C['rounds']:
    u=CNU[rd['r']]
    for dn,d in enumerate(rd['days'],1):
        for ex in d['ex']:
            if ex['type']=='cards':
                for it in ex['items']:
                    im=it.get('img') or {}; src=im.get('src','')
                    en=it['en'].strip(); zh=it['zh'].strip()
                    if re.search(r'[.?!]$',en): kind='sentence'
                    elif ' ' in en and not re.search(r'_w_',src): kind='phrase'
                    else: kind='word'
                    key=re.sub(r'\W+','_',en.lower()).strip('_')+'_'+zh
                    a_en=cfile(en,'en'); a_zh=cfile(zh,'zh')
                    add(dict(id='cn_'+key,kind=kind,course='Canopy',unit=u,day=dn,en=en,zh=zh,py=it.get('py',''),pics=[src] if src else [],emo=im.get('e',''),aud={'en':[a_en] if a_en else [],'zh':[a_zh] if a_zh else []}))
            if ex['type']=='story':
                sid=ex['id']; se=ST.get(sid+'|en'); sz=ST.get(sid+'|zh')
                bank['stories']['cn_'+sid]=dict(id='cn_'+sid,course='Canopy',unit=u,day=dn,title=ex['title'].split(': ',1)[-1],narrator=ex.get('narrator'),
                    scenes=[{'img':(s.get('img') or {}).get('src',''),'emo':(s.get('img') or {}).get('e',''),'en':s['en'],'zh':s['zh'],'py':s.get('py','')} for s in ex['sents']],
                    full={'en':se,'zh':sz},questions=ex.get('questions',[]))
bank['people']=C['people']
json.dump(bank,open(O+'bank.json','w'),ensure_ascii=False,indent=0)
cnt=collections.Counter((i['course'],i['unit'],i['kind']) for i in bank['items'].values())
for k in sorted(cnt): print(k,cnt[k])
noaud=[i['id'] for i in bank['items'].values() if i['kind'] in('word','phrase','sentence') and (not i['aud'].get('en') or not i['aud'].get('zh'))]
print('missing audio',len(noaud),noaud[:15])
print(len(bank['stories']))
for i in list(bank['items'].values())[:3]: print(i)
