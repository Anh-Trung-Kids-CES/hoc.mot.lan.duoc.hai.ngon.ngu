# Đếm / sửa biến điệu 一, 不 trong pinyin: python3 sandhi.py [--fix] [glob]
import json,re,sys,glob,unicodedata
import os as _os
_K=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))+'/'
_CT=_os.path.abspath(_K+'../..')+'/'
G=_K+'grid/'
fix='--fix' in sys.argv; pats=[a for a in sys.argv[1:] if a!='--fix'] or ['*']
def tone(syl):
    for ch in unicodedata.normalize('NFD',syl):
        t={'\u0304':1,'\u0301':2,'\u030c':3,'\u0300':4}.get(ch)
        if t: return t
    return 0
# yī + âm tiết thanh 4 -> yí ; yī + thanh 1/2/3 -> yì ; bù + thanh 4 -> bú
# ngoại lệ: số đếm, thứ tự (第一, 一月, 十一, 一二三), 星期一
EXC=re.compile(r'(dì|shí|xīngqī|xingqi)\s*$',re.I)
COMP={'yīqǐ':'yìqǐ','yīdìng':'yídìng','yīyàng':'yíyàng','yīzhí':'yìzhí','yīgòng':'yígòng','yīxià':'yíxià','yīhuìr':'yíhuìr','yīhuì':'yíhuì','yīqiè':'yíqiè','yīdiǎnr':'yìdiǎnr','yīdiǎn':'yìdiǎn','yībiān':'yìbiān','yībàn':'yíbàn','yīgè':'yígè','yīge':'yíge','yīkuàir':'yíkuàir','yīkuài':'yíkuài','yīxiē':'yìxiē','yītiān':'yìtiān','yīqí':'yìqí','yīzhǒng':'yìzhǒng','yīzhāng':'yìzhāng','yīběn':'yìběn','yīzhī':'yìzhī','yītiáo':'yìtiáo','yīcì':'yícì','yīdìng':'yídìng','yīlù':'yílù','yīwèi':'yíwèi','yīduì':'yíduì','yītào':'yítào','yījiàn':'yíjiàn','yīliàng':'yíliàng','yīshuāng':'yìshuāng','yīpíng':'yìpíng','yībēi':'yìbēi','yīwǎn':'yìwǎn','yījiā':'yìjiā','yīqiān':'yìqiān','yībǎi':'yìbǎi','yīqún':'yìqún','yīkǒu':'yìkǒu',
 'bùshì':'búshì','bùyào':'búyào','bùduì':'búduì','bùcuò':'búcuò','bùyòng':'búyòng','bùkèqi':'búkèqi','bùguò':'búguò','bùdà':'búdà','bùhuì':'búhuì','bùqù':'búqù','bùkàn':'búkàn','bùjiàn':'bújiàn','bùzài':'búzài','bùxiè':'búxiè','bùgòu':'búgòu','bùpà':'búpà','bùzuò':'búzuò','bùrè':'búrè','bùkuài':'búkuài','bùmàn':'búmàn','bùlèi':'búlèi','bùxìng':'búxìng','bùbiàn':'búbiàn','bùdàn':'búdàn','bùyào':'búyào','bùlùn':'búlùn','bùsuàn':'búsuàn'}
def fix_text(t):
    n=0
    def rep_comp(m):
        nonlocal n
        w=m.group(0); k=w.lower()
        if k in COMP:
            n+=1; r=COMP[k]; return r[0].upper()+r[1:] if w[0].isupper() else r
        return w
    t=re.sub(r'(?<![a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü])(?:yī|bù|Yī|Bù)[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+',rep_comp,t)
    def rep(m):
        nonlocal n
        pre,w,nxt=m.group(1),m.group(2),m.group(3)
        ctx=m.string[max(0,m.start()-15):m.start()]+pre
        if re.search(r'(dì|shí|xīngqī|lǐbài|yuè|-|比)\s*$',ctx,re.I): return m.group(0)
        if w.lower()=='bù' and re.search(r'(nà|zhè|yí|yì|yī|liǎng|jǐ|měi|nǎ)\s*$',ctx,re.I): return m.group(0)
        if nxt.lower().startswith(('yuè','èr','sān','sì','wǔ','liù','qī','bā','jiǔ','shí','líng','hào','diǎn','fēn','hào','rì','píndào','bǐ','hàoxiàn','lù','lóu','hào')) and w.lower()=='yī': return m.group(0)
        tn=tone(nxt)
        if nxt.lower() in ('ge','gè'): tn=4
        lw=w.lower()
        if lw=='yī': new='yí' if tn==4 else ('yì' if tn in (1,2,3) else w)
        else: new='bú' if tn==4 else w
        if new!=lw: n+=1; new=new[0].upper()+new[1:] if w[0].isupper() else new
        else: new=w
        return pre+new+' '+nxt
    t=re.sub(r'((?:^|[^a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü])(?:[a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ]+ )?)(yī|bù|Yī|Bù) ([a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+)',rep,t)
    return t,n
tot=0
for p in pats:
    for f in sorted(glob.glob(G+'out/%s.json'%p)):
        d=json.load(open(f)); c=0
        def walk(o):
            global c
            if isinstance(o,dict): return {k:walk(v) for k,v in o.items()}
            if isinstance(o,list): return [walk(v) for v in o]
            if isinstance(o,str):
                t,n=fix_text(o); globals()['c']+=n; return t
            return o
        d2=walk(d)
        print(f.split('/')[-1],c); tot+=c
        if fix and c: json.dump(d2,open(f,'w'),ensure_ascii=False,indent=1)
print('tổng',tot)
