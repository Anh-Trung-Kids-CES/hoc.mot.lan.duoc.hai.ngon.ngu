import json,re,html,sys
d=json.load(open(sys.argv[1]))
W={'lop':'Lớp','con':'Con','co':'Cô','lan':'Cô','kids':'Lớp'}
def m(s):
    s=html.escape(s.replace('}{',''))
    s=re.sub(r'\{#([^}]*)\}',r'<span class="age">\1</span>',s)
    s=re.sub(r'\{([^}]*)\}',r'<mark>\1</mark>',s)
    return s.replace('___','<span class="nm">tên con</span>')
def row(i,r,py=True):
    p=f'<div class="py">{html.escape(r["py"]).replace("___","…")}</div>' if py and r.get('py') else ''
    return f'<tr><td class="n">{i}</td><td class="w">{W.get(r["w"],r["w"])}</td><td class="en">{m(r["en_o"])}</td><td class="zh"><div class="hz">{m(r["zh_o"])}</div>{p}</td></tr>'
def ve(lbl,ten,dong,id_):
    rows=''.join(row(i+1,r) for i,r in enumerate(dong))
    return f'<article class="ve" id="{id_}"><header><span class="tag">{lbl}</span><h4>{html.escape(ten[0])}<span class="zt">{html.escape(ten[1])}</span></h4></header><div class="tw"><table><thead><tr><th>#</th><th>Ai</th><th>Tiếng Anh</th><th>Tiếng Trung · pinyin</th></tr></thead><tbody>{rows}</tbody></table></div></article>'
def level(lv,name,order,lines):
    out=[];nav=[]
    for u in order:
        V=d[lv].get(u)
        if not V: continue
        uid=f'{lv.lower()}-u{u}'
        if u=='de':
            nav.append(f'<a href="#{uid}">Lời đề</a>')
            out.append(f'<section class="unit" id="{uid}"><h3>Vè lời đề</h3><p class="note">Dùng mở buổi luyện dạng đề (ngày 96–99 và các buổi làm đề).</p>{ve("Lời đề",V["A"]["ten"],V["A"]["dong"],uid+"a")}</section>');continue
        nav.append(f'<a href="#{uid}">U{u}</a>')
        if V.get('chao'):
            body='<p class="note">Giữ 2 vè chào đang dùng.'
            if 'doi' in V:
                body+=' Chỉ đổi dòng tuổi cố định thành ô tuổi:</p><div class="tw"><table><tbody>'+''.join(row(5+i,r,False) for i,r in enumerate(V['doi']))+'</tbody></table></div>'
            else:
                body+=(' U1 và U4 học chung tuần 1–3 nên dùng chung bộ vè chào này.' if lv=='SD' else '')+'</p>'
            out.append(f'<section class="unit" id="{uid}"><h3>Unit {u}{" + U4" if lv=="SD" else ""}</h3>{body}</section>');continue
        a=ve('A · mở buổi',V['A']['ten'],V['A']['dong'],uid+'a'); b=ve('B · kết buổi',V['B']['ten'],V['B']['dong'],uid+'b')
        out.append(f'<section class="unit" id="{uid}"><h3>Unit {u}</h3><div class="pair">{a}{b}</div></section>')
    return f'<section class="level" id="{lv.lower()}"><div class="lvh"><h2>{name}</h2><p>{lines} dòng mỗi bài · 4 phách mỗi dòng</p></div><nav class="un">{"".join(nav)}</nav>{"".join(out)}</section>'
def phu(lv):
    xs=d['_phu'][lv]; ok=sum(1 for x in xs if x['ve'])
    rows=''.join(f'<tr class="{"" if x["ve"] else "miss"}"><td>{html.escape(x["tu"])}</td><td>{"bổ sung" if x["tieng"]=="vá" else "U"+str(x["unit"])}</td><td>{", ".join(x["ve"]) if x["ve"] else "chưa có"}</td></tr>' for x in xs)
    return f'<details><summary>{"Little Seed" if lv=="LS" else "Seedling"}: {ok}/{len(xs)} từ</summary><div class="tw"><table class="phu"><thead><tr><th>Từ</th><th>Học ở</th><th>Gặp lại trong vè</th></tr></thead><tbody>{rows}</tbody></table></div></details>'
LS=level('LS','Little Seed 48',[str(i) for i in range(1,13)],6)
SD=level('SD','Seedling 48',['1','2','3']+[str(i) for i in range(5,13)]+['de'],8)
tpl=open(sys.argv[2]).read()
open(sys.argv[3],'w').write(tpl.replace('%%LS%%',LS).replace('%%SD%%',SD).replace('%%PHU%%',phu('LS')+phu('SD')))
