import json,statistics as st,collections
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
D=json.load(open(_K+'audit/days.json'))
ORDER=['preb','little-seed','seedling','canopy','larva','larva-plus','pupa','cocoon','butterfly']
print('== Story-length jumps (>=1.6x median of previous 4 days and +15 words)')
J=collections.Counter(); ex={}
for c in ORDER:
    X=[d for d in D if d['c']==c]
    for i in range(4,len(X)):
        m=st.median(x['ew'] for x in X[i-4:i])
        if X[i]['ew']>=1.6*m and X[i]['ew']-m>=15:
            J[c]+=1; ex.setdefault(c,[]).append('%s ngày %s (%s): %d từ, 4 ngày trước ~%d'%(X[i]['part'],X[i]['ngay'],X[i]['label'][:60],X[i]['ew'],m))
for c in ORDER: print(c,J[c]); [print('   ',e) for e in ex.get(c,[])[:4]]
print('== Story-length drops then jumps: max/min ratio within each unit')
for c in ORDER:
    X=[d for d in D if d['c']==c]; U=collections.defaultdict(list)
    for d in X: U[(d['part'],d['unit'])].append(d['ew'])
    r=[max(v)/max(1,min(v)) for v in U.values() if len(v)>=4]
    print(c,'units',len(r),'median max/min %.1f'%st.median(r) if r else '', 'units with ratio>=2.5:',sum(1 for x in r if x>=2.5))
print('== New-word spikes (EN new words >= 2x prev-4 mean and >=5)')
for c in ORDER:
    X=[d for d in D if d['c']==c]; n=0; e=[]
    for i in range(4,len(X)):
        m=st.mean(x['ne'] for x in X[i-4:i])
        if X[i]['ne']>=5 and X[i]['ne']>=2*max(1,m): n+=1; e.append('%s ngày %s: %d từ mới EN (%s)'%(X[i]['part'],X[i]['ngay'],X[i]['ne'],', '.join(X[i]['neL'][:8])))
    print(c,n); [print('   ',x) for x in e[:3]]
    q=collections.Counter(d['ne'] for d in X); print('   distribution new EN/day',sorted(q.items()))
print('== Target words in the day story (EN new words): occ>=2 / occ=1 / 0')
for c in ORDER:
    X=[d for d in D if d['c']==c]; o=[k for d in X for k in d['occ']]; oz=[k for d in X for k in d['occz']]
    if o: print(c,'EN n=%d  >=2: %d%%  =1: %d%%  0: %d%%'%(len(o),100*sum(k>=2 for k in o)/len(o),100*sum(k==1 for k in o)/len(o),100*sum(k==0 for k in o)/len(o)), end='')
    if oz: print('  | ZH n=%d >=2: %d%% =1: %d%% 0: %d%%'%(len(oz),100*sum(k>=2 for k in oz)/len(oz),100*sum(k==1 for k in oz)/len(oz),100*sum(k==0 for k in oz)/len(oz)))
    else: print()
print('== Story continuity: units whose web days share one story title; class story = a web story of the unit')
for c in ORDER:
    X=[d for d in D if d['c']==c]; U=collections.defaultdict(list)
    for d in X: U[(d['part'],d['unit'])].append(d)
    one=sum(1 for v in U.values() if len(set(d['title'] for d in v))<=2)
    same=0; tot=0
    for v in U.values():
        wt=set(d['title'].lower() for d in v)
        for lt in set(d['lop_title'].lower() for d in v):
            tot+=1; same+= lt in wt
    print(c,'units',len(U),'units with <=2 story titles',one,'| class stories also used on web: %d/%d'%(same,tot))
print('== Course boundary: last 10 days of course vs first 10 days of next (EN story words)')
for a,b in zip(ORDER,ORDER[1:]):
    A=[d['ew'] for d in D if d['c']==a][-10:]; B=[d['ew'] for d in D if d['c']==b][:10]
    print('%s -> %s: %.0f -> %.0f'%(a,b,st.mean(A),st.mean(B)))
