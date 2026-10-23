# Sinh "chương trình chi tiết" cho 9 khóa trên trang chuong-trinh/
#  - Little Seed, Canopy: lấy nguyên các tab trong tài liệu chương trình (xuất HTML)
#  - Khung chương trình: tab Giới thiệu
#  - Các khóa khác: ghép từ bảng phân bổ từ vựng, khung Syllabus đã hiệu đính, nhịp unit và lịch ôn
import json, re, html, os, collections
S='/tmp/claude-0/-home-claude/90b5872a-a8dd-505f-8810-4b4160312da5/scratchpad/'
SITE=S+'repo/r/chuong-trinh/'
OUT=SITE+'data/chi-tiet/'; os.makedirs(OUT,exist_ok=True)
A=json.load(open(S+'cov/allocation.json'))
D=json.load(open(SITE+'data/chuong-trinh.json'))
SYL={}
if os.path.exists(S+'ct/syllabus_clean.json'):
    for x in json.load(open(S+'ct/syllabus_clean.json')): SYL[(x['course'],x['unit'])]=x
E=html.escape
CID={c['name']:c['id'] for c in D['courses']}
CM={c['name']:c for c in D['courses']}

# ---------- làm sạch HTML xuất từ tài liệu ----------
def clean(h):
    h=re.sub(r'<time[^>]*>.*?</time>','',h,flags=re.S)
    h=re.sub(r'<span data-atom="mention"[^>]*>.*?</span>','',h,flags=re.S)
    # link nội bộ claude.ai (riêng tư) -> chữ thường
    h=re.sub(r'<a href="https://claude\.ai[^"]*">(.*?)</a>',r'\1',h,flags=re.S)
    h=re.sub(r'<a href="(https?://[^"]+)">',r'<a href="\1" target="_blank" rel="noopener">',h)
    h=re.sub(r'<table>',r'<div class="tbox"><table class="t">',h); h=h.replace('</table>','</table></div>')
    h=re.sub(r'<h([1-6]) id="[^"]*">',r'<h\1>',h)
    h=re.sub(r'<p>\s*·?\s*</p>','',h)
    return h
def split_h2(h):
    parts=re.split(r'(<h2>.*?</h2>)',h,flags=re.S)
    out=[]; cur=None
    for p in parts:
        m=re.match(r'<h2>(.*?)</h2>',p,re.S)
        if m: cur=[html.unescape(re.sub('<[^>]+>','',m.group(1))).strip(),'']; out.append(cur)
        elif cur: cur[1]+=p
    return out

# ---------- khung chương trình ----------
intro=clean(open(S+'ex/intro.html').read())
intro=re.sub(r'<h1>.*?</h1>','',intro,flags=re.S)
secs=split_h2(intro)
lead=intro[:intro.find('<h2>')]
json.dump(dict(lead=lead,sections=[dict(t=t,h=b) for t,b in secs]),open(OUT+'khung.json','w'),ensure_ascii=False)

# ---------- Little Seed, Canopy: từ tài liệu ----------
def from_doc(name,f):
    h=clean(open(S+'ex/%s.html'%f).read())
    h=re.sub(r'<h1>.*?</h1>','',h,flags=re.S)
    secs=split_h2(h); units={}; ov=''
    for t,b in secs:
        m=re.match(r'Unit (\d+)',t)
        if m: units[m.group(1)]=dict(title=t,html=b)
        else: ov+='<h3 class="sec">%s</h3>'%E(t)+b if not t.startswith('Tổng quan') else b
    return dict(source='doc',overview=ov,units=units)

# ---------- dữ liệu chung cho các khóa ghép ----------
src=open(S+'cov/spiral.py').read()
NEXT=eval(src[src.index('NEXT={')+5:src.index('\n}\n')+2])
UN={}
for a in A:
    p=a['unit'].split(' · ',1); UN.setdefault(a['course'],{})[a['unit_no']]=p[1] if len(p)>1 else ''
UN['Larva Plus']={i+1:t for i,t in enumerate(['Me and my day','Jobs and school','Clothes and shopping','Animals, weather and health','Sports and food','Holidays and celebrations'])}
UN['Butterfly']={i+1:t for i,t in enumerate(['Home and family','School and future','Weather, nature and disasters','Health, sports and food','City, transport and directions','Media, music and festivals'])}
RATIO={'PreB':'Chỉ tiếng Anh (làm quen nghe – hiểu)','Little Seed':'40 : 60','Seedling':'40 : 60','Canopy':'50 : 50','Larva':'55 : 45','Larva Plus':'55 : 45','Pupa':'40 : 60','Cocoon':'50 : 50','Butterfly':'30 : 70'}
LEN={'PreB':('10–15 phút','Tối đa 10 phút','45 phút: 6–8 hoạt động ngắn'),'Seedling':('10–15 phút','Tối đa 10 phút','50 phút: 6–8 hoạt động'),
     'Larva':('15–20 phút','Tối đa 15 phút','60 phút: pha tiếng Anh ~25 phút · pha tiếng Trung ~25 phút · chuyển ngữ ~10 phút'),
     'Larva Plus':('15–20 phút','Tối đa 15 phút','60 phút: pha tiếng Anh ~25 phút · pha tiếng Trung ~25 phút · chuyển ngữ ~10 phút'),
     'Pupa':('20–25 phút','Tối đa 15 phút','75 phút: pha tiếng Anh ~30 phút · nghỉ, vận động 5 phút · pha tiếng Trung ~30 phút · chuyển ngữ ~10 phút'),
     'Cocoon':('20–30 phút','Tối đa 15 phút','90 phút: pha tiếng Anh ~35 phút · nghỉ 5 phút · pha tiếng Trung ~35 phút · chuyển ngữ ~10 phút · tổng kết 5 phút'),
     'Butterfly':('20–30 phút (đề thi thử chia từng phần)','Tối đa 15 phút','90 phút: luyện kỹ năng thi tiếng Anh ~35 phút · nghỉ 5 phút · luyện YCT ~35 phút · chuyển ngữ ~10 phút · tổng kết 5 phút')}
MILE={'PreB':'Sau PreB, con vào Little Seed.','Seedling':'Có thể đăng ký thi YCT1 sau khóa.','Larva':'Có thể đăng ký thi Movers và YCT3 sau khóa (hoặc sau Larva Plus).','Larva Plus':'Thi Movers và YCT3 cuối khóa.','Pupa':'Khóa đệm lên A2 và YCT4; chưa thi.','Cocoon':'Học xong toàn bộ từ thi Flyers và YCT4.','Butterfly':'Thi Flyers và YCT4 cuối khóa.'}
EXAM={'Starters':'Starters','Movers':'Movers','Flyers':'Flyers','YCT1':'YCT1','YCT2':'YCT2','YCT3':'YCT3','YCT4':'YCT4'}
TLAB={'Từ lõi':'Lõi','Cụm từ, câu mẫu':'Cụm, câu mẫu','Từ mở rộng':'Mở rộng','Từ chức năng (theo mẫu câu)':'Chức năng','Chỉ nghe hiểu':'Chỉ nghe'}

def rhythm(kind):
    if kind=='ls':
        R=[('Web 1','chuẩn bị Buổi 1','Xem video EN rồi ZH; từ mới nhóm 1 (chạm đúng hình); nói theo 1–2 cụm; Anh hay Trung?'),
           ('Buổi 1','Hiểu','Dùng lại từ, cụm của Web 1 với cô và bạn: động tác, bài hát, trò chơi; nghe trước nhóm 2'),
           ('Web 2','ôn Buổi 1, chuẩn bị Buổi 2','Ôn nhanh từ cũ; từ mới nhóm 2 + ôn nhóm 1; Đố con'),
           ('Buổi 2','Hiểu','Từ, cụm nhóm 1–2; vè; chữ hình (tô chữ Hán theo nét); nghe trước nhóm 3'),
           ('Web 3','ôn tuần','Từ nối của unit trước trong câu mới; nhóm 3; Anh hay Trung? ôn cả tuần'),
           ('Web 4','chuẩn bị Buổi 3','Đảo ôn không có tranh mẫu; Đố con ôn cả unit'),
           ('Buổi 3','Làm quen','Kể truyện của unit theo tranh; limerick; thanh điệu và âm'),
           ('Web 5','ôn Buổi 3, chuẩn bị Buổi 4','Xem trọn truyện EN rồi ZH; ôn cụm và câu truyện; nhìn chữ'),
           ('Buổi 4','Vận dụng','Diễn truyện; Phiên dịch nhí trực tiếp; cô ghi nhận xét từng con'),
           ('Web 6','ôn unit','Xem truyện ZH rồi EN; tìm tranh cho chữ; Phiên dịch nhí; Hộp ôn')]
    elif kind=='cn':
        R=[('Web 1','chuẩn bị Buổi 1','Ôn nhanh từ cũ; nhóm từ 1 (khoảng 6 từ), 3–4 cụm, 2 câu; NL1; luyện nói NL2'),
           ('Buổi 1','Hiểu','Nhóm 1 vào hỏi – đáp, bài hát; nghe trước nhóm 2'),
           ('Web 2','ôn Buổi 1, chuẩn bị Buổi 2','Nhóm từ 2, 3–4 cụm, 2 câu; NL1, NL3'),
           ('Buổi 2','Hiểu','Nhóm 1–2; vè; tô – chép chữ Hán; nghe trước nhóm 3'),
           ('Web 3','ôn tuần','Nhóm 3 nối với từ unit trước; NL3, NL4 (đúng hay sai), PS-1'),
           ('Web 4','chuẩn bị Buổi 3','Đảo ôn không tranh, ẩn pinyin; NL1, NL2, NL4 có tính giờ'),
           ('Buổi 3','Làm quen','Đọc truyện 1; limerick; thanh điệu, phonics; ngữ pháp khó nhận ra trong 2–3 phút'),
           ('Web 5','ôn Buổi 3, chuẩn bị Buổi 4','Truyện 1 hai chiều; NL3, NL5, PS-2'),
           ('Buổi 4','Vận dụng','Diễn truyện 2; NL6 với người thật; PS-3; cô ghi nhận xét từng con'),
           ('Web 6','ôn unit','Truyện 2; NL6 trên trang luyện nói, NL7, PS-3 có tính giờ; Hộp ôn')]
    elif kind=='pre':
        R=[('Web 1','chuẩn bị Buổi 1','Xem video tiếng Anh; nghe từ mới, chạm đúng hình; làm động tác theo'),
           ('Buổi 1','Nghe – làm theo','Bài hát, động tác (TPR), trò chơi chỉ tranh với các từ của chủ đề'),
           ('Web 2','ôn Buổi 1, chuẩn bị Buổi 2','Ôn nhanh từ cũ; nghe – chạm tranh; nói theo 1–2 từ'),
           ('Buổi 2','Vận dụng','Kể truyện tranh ngắn; trò chơi; con nói theo cô 1–2 từ, 1 câu'),
           ('Web 3','ôn tuần','Nghe truyện tranh; chạm tranh; Hộp ôn')]
    else:
        R=[('Web 1','chuẩn bị Buổi 1','Ôn nhanh; ôn từ của các unit cặp theo chủ đề; một phần đề luyện tiếng Anh (≤30 phút)'),
           ('Buổi 1','Kỹ năng','Dạng bài nghe và đọc – viết của đề tiếng Anh; chiến lược làm bài'),
           ('Web 2','ôn Buổi 1, chuẩn bị Buổi 2','Một phần đề luyện tiếng Trung; Hộp ôn'),
           ('Buổi 2','Kỹ năng','Dạng bài của đề YCT; chuyển ngữ có bẫy'),
           ('Web 3','ôn tuần','Đề luyện ngắn hai tiếng; từ con hay sai trong tuần'),
           ('Web 4','chuẩn bị Buổi 3','Đảo ôn từ của chủ đề không tranh; một phần đề tiếng Anh'),
           ('Buổi 3','Nói','Luyện phần thi nói theo cặp, theo tranh'),
           ('Web 5','ôn Buổi 3, chuẩn bị Buổi 4','Một phần đề YCT; truyện, đoạn đọc của chủ đề'),
           ('Buổi 4','Thi thử phần','Thi thử trên lớp có tính giờ một phần đề; cô nhận xét từng con'),
           ('Web 6','ôn unit','Hộp ôn; tổng hợp lỗi sai; Phiên dịch nhí')]
    rows=''.join(f'<tr><td><b>{E(a)}</b></td><td>{E(b)}</td><td>{E(c)}</td></tr>' for a,b,c in R)
    return f'<div class="tbox"><table class="t"><thead><tr><th>Bài, buổi</th><th>Vai trò</th><th>Nội dung</th></tr></thead><tbody>{rows}</tbody></table></div>'

PROPER=set('america england france germany japan korea russia vietnam china australia india italy spain egypt brazil mexico canada thailand singapore beijing shanghai london paris english chinese vietnamese japanese korean french monday tuesday wednesday thursday friday saturday sunday january february march april may june july august september october november december'.split())
def cap(w): return ' '.join(x[:1].upper()+x[1:] if x.lower() in PROPER else x for x in w.split(' '))
def vocab_html(c,u):
    rows=[a for a in A if a['course']==c and a['unit_no']==u]
    g=collections.OrderedDict()
    for t in ('Từ lõi','Cụm từ, câu mẫu','Từ mở rộng','Từ chức năng (theo mẫu câu)','Chỉ nghe hiểu'):
        en=[a for a in rows if a['rep_type']==t and a['lang']=='Tiếng Anh']; zh=[a for a in rows if a['rep_type']==t and a['lang']=='Tiếng Trung']
        if en or zh: g[t]=(en,zh)
    def w(a):
        lv=EXAM.get(a['level'],'')
        return f'<li>{E(cap(a["word"]) if a["lang"]=="Tiếng Anh" else a["word"])}{f"<i>{lv}</i>" if lv else ""}</li>'
    out='<div class="tbox"><table class="t"><thead><tr><th>Loại</th><th>Tiếng Anh</th><th>Tiếng Trung</th></tr></thead><tbody>'
    for t,(en,zh) in g.items():
        out+=f'<tr><td><b>{E(TLAB[t])}</b><br><small>{len(en)} / {len(zh)}</small></td><td><ul class="wchips en">{"".join(w(a) for a in en)}</ul></td><td><ul class="wchips zh">{"".join(w(a) for a in zh)}</ul></td></tr>'
    return out+'</tbody></table></div><p class="note">Nhãn nhỏ cạnh từ là kỳ thi có từ đó (Starters, Movers, Flyers, YCT1–4).</p>'

def review_html(c,u):
    key=f'{c} U{u}'
    inc=collections.defaultdict(list); cross=collections.defaultdict(list)
    for a in A:
        for m in re.finditer(re.escape(c)+r' U(\d+)(?: \(([^)]+)\)| ·)',a['review_in_course']):
            if int(m.group(1))==u and a['course']==c: inc[m.group(2) or 'ôn'].append(a)
        for m in re.finditer(re.escape(c)+r' U(\d+) ·',a['review_next_course']):
            if int(m.group(1))==u and a['course']!=c: cross[a['course']].append(a)
    if not inc and not cross: return '<p>Unit đầu tiên của khóa: chưa có từ cũ trong khóa quay lại.</p>'
    out='<ul>'
    lab={'từ nối, câu':'Từ nối, câu (unit liền trước)','truyện, chuyển ngữ':'Truyện, chuyển ngữ','cùng chủ đề':'Cùng chủ đề','Ôn nhanh trên web':'Ôn nhanh đầu bài web','phương án nhiễu trên web':'Phương án nhiễu trên web'}
    for k,v in inc.items():
        units=sorted({a['unit_no'] for a in v}); ex=', '.join(E(a['word']) for a in v[:8])
        out+=f'<li><b>{E(lab.get(k,k))}</b>: {len(v)} từ của Unit {", ".join(map(str,units))} — ví dụ {ex}</li>'
    for k,v in cross.items():
        ex=', '.join(E(a['word']) for a in v[:8])
        out+=f'<li><b>Từ của {E(k)}</b>: {len(v)} từ — ví dụ {ex}</li>'
    return out+'</ul>'

def patterns_html(x):
    if not x or not x.get('patterns'): return ''
    rows=''.join(f'<tr><td>{E(p["en"])}</td><td class="zh">{E(p["zh"])}</td><td><small>{E(p.get("py",""))}</small></td></tr>' for p in x['patterns'])
    g=''.join(f'<li>{E(n)}</li>' for n in x.get('grammar_vi',[]))
    return f'<h3>Mẫu câu</h3><div class="tbox"><table class="t"><thead><tr><th>Tiếng Anh</th><th>Tiếng Trung</th><th>Pinyin</th></tr></thead><tbody>{rows}</tbody></table></div>'+(f'<h3>Ngữ pháp trọng tâm</h3><ul>{g}</ul><p class="note">Ngữ pháp khó không dạy thành bài riêng: nằm trong câu mẫu, truyện, bài chuyển ngữ của 3–4 unit liền nhau.</p>' if g else '')

def unit_generated(c,u,kind):
    x=SYL.get((c,u)); name=UN.get(c,{}).get(u,'')
    t=f'Unit {u} · {name}'
    if x and x.get('title_zh'): t+=f' · {x["title_zh"]}'
    h=''
    if x and x.get('objectives_vi'):
        h+='<h3>Mục tiêu</h3><ul>'+''.join(f'<li>{E(o)}</li>' for o in x['objectives_vi'])+'</ul>'
    h+='<h3>Từ vựng theo bảng phân bổ</h3>'+vocab_html(c,u)
    h+=patterns_html(x)
    h+='<h3>Lịch 2 tuần của unit</h3>'+rhythm(kind)
    h+='<h3>Từ cũ quay lại trong unit này</h3>'+review_html(c,u)
    if c=='Cocoon' and u==12: h+='<p class="note">Chủ đề Unit 12 còn chờ chốt giữa Workplace và Future plans.</p>'
    return dict(title=t,html=h)

def course_overview(c,units_desc,weeks=30):
    cm=CM[c]; L=LEN.get(c)
    h=f'<p>{E(c)} dành cho trẻ {E(cm["age"])} tuổi, {E(cm["time"])}. Cuối khóa: tiếng Anh <b>{E(cm["en"])}</b>, tiếng Trung <b>{E(cm["zh"])}</b>, chuyển ngữ <b>{E(cm["bridge"])}</b>. {E(MILE.get(c,""))}</p>'
    h+='<div class="tbox"><table class="t"><tbody>'
    h+=f'<tr><th>Tỉ lệ thời gian Anh : Trung</th><td>{E(RATIO.get(c,""))}</td></tr>'
    if L: h+=f'<tr><th>Mỗi bài web</th><td>{E(L[0])}</td></tr><tr><th>Mỗi hoạt động trên lớp</th><td>{E(L[1])}</td></tr><tr><th>Buổi học</th><td>{E(L[2])}</td></tr>'
    h+='<tr><th>Mỗi tuần</th><td>2 buổi học với cô và 3 bài tự học trên web (2 bài chuẩn bị trước buổi, 1 bài ôn cả tuần)</td></tr>'
    h+='</tbody></table></div>'
    if weeks==30:
        h+='<h3 class="sec">Lịch 30 tuần</h3><div class="tbox"><table class="t"><tbody>'+''.join(f'<tr><th>{a}</th><td>{b}</td></tr>' for a,b in [
            ('Tuần 1','Mở khóa: bài đầu vào, đồng thời ôn quét từ của khóa trước; từ con quên vào Hộp ôn'),('Tuần 2–9','Unit 1–4 (mỗi unit 2 tuần)'),('Tuần 10','Ôn và kiểm tra chặng 1, quét lại mọi unit đã học'),
            ('Tuần 11–18','Unit 5–8'),('Tuần 19','Ôn và kiểm tra chặng 2'),('Tuần 20–27','Unit 9–12'),('Tuần 28','Cuối khóa: ôn toàn khóa, dự án, hồ sơ BRIDGE'),('2 tuần','Lễ hội (Noel, Tết; hoặc Trung thu, Halloween, Quốc tế Thiếu nhi)')])+'</tbody></table></div>'
    h+=units_desc
    return h

def units_table(c,rows):
    return '<h3 class="sec">Các unit</h3><div class="tbox"><table class="t"><thead><tr><th>Unit</th><th>Chủ đề</th><th>Từ Anh mới</th><th>Từ Trung mới</th><th>Ôn từ khóa trước</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div>'

def gen_course(c,kind):
    units={}; rows=[]
    for u in sorted(UN.get(c,{})):
        un=unit_generated(c,u,kind); units[str(u)]=un
        en=sum(1 for a in A if a['course']==c and a['unit_no']==u and a['lang']=='Tiếng Anh')
        zh=sum(1 for a in A if a['course']==c and a['unit_no']==u and a['lang']=='Tiếng Trung')
        rv=sum(1 for a in A if a['course']!=c and re.search(re.escape(c)+r' U%d ·'%u,a['review_next_course']))
        x=SYL.get((c,u)); zt=f' · <span class="zh">{E(x["title_zh"])}</span>' if x and x.get('title_zh') else ''
        rows.append(f'<tr><td>{u}</td><td><a href="#/u/{CID[c]}/{u}">{E(UN[c][u])}</a>{zt}</td><td>{en}</td><td>{zh}</td><td>{rv}</td></tr>')
    return dict(source='gen',overview=course_overview(c,units_table(c,rows)),units=units)

# Larva Plus, Butterfly: unit ôn, gộp từ các unit cặp
def gen_review_course(c, srcs, exams):
    units={}; rows=[]
    inv=collections.defaultdict(list)
    for sc in srcs:
        for su,lst in NEXT.get(sc,{}).items():
            for cc,uu in lst:
                if cc==c: inv[uu].append(f'{sc} U{su} · {UN[sc][su]}')
    for u in sorted(UN[c]):
        words=[a for a in A if re.search(re.escape(c)+r' U%d ·'%u,a['review_next_course'])]
        en=[a for a in words if a['lang']=='Tiếng Anh']; zh=[a for a in words if a['lang']=='Tiếng Trung']
        lv=collections.Counter(a['level'] for a in words if a['level'] in EXAM)
        h='<h3>Gộp từ các unit</h3><ul>'+''.join(f'<li>{E(s)}</li>' for s in inv[u])+'</ul>'
        h+=f'<h3>Mục tiêu</h3><ul><li>Ôn sâu {len(en)} từ tiếng Anh và {len(zh)} từ tiếng Trung của các unit trên, trong câu, truyện và đề luyện; không thêm từ mới.</li><li>Làm quen dạng bài {E(exams)} của chủ đề, mỗi lần làm một phần đề không quá 30 phút; đề trọn vẹn làm trên lớp ở tuần ôn.</li><li>Sửa lỗi con hay gặp qua Hộp ôn và phần chuyển ngữ có bẫy.</li></ul>'
        h+='<h3>Từ ôn theo kỳ thi</h3><p>'+', '.join(f'{k}: {v} từ' for k,v in sorted(lv.items()))+'</p>'
        h+='<h3>Từ ôn</h3><div class="tbox"><table class="t"><thead><tr><th>Tiếng Anh</th><th>Tiếng Trung</th></tr></thead><tbody><tr><td><ul class="wchips en">'+''.join(f'<li>{E(a["word"])}</li>' for a in en)+'</ul></td><td><ul class="wchips zh">'+''.join(f'<li>{E(a["word"])}</li>' for a in zh)+'</ul></td></tr></tbody></table></div>'
        h+='<h3>Lịch 2 tuần của unit</h3>'+rhythm('rv')
        units[str(u)]=dict(title=f'Unit {u} · {UN[c][u]}',html=h,review_en=[a['word'] for a in en],review_zh=[a['word'] for a in zh])
        rows.append(f'<tr><td>{u}</td><td><a href="#/u/{CID[c]}/{u}">{E(UN[c][u])}</a></td><td>0</td><td>0</td><td>{len(words)}</td></tr>')
    cal='<h3 class="sec">Lịch 15 tuần</h3><div class="tbox"><table class="t"><tbody><tr><th>Tuần 1</th><td>Mở khóa: bài đầu vào theo dạng đề</td></tr><tr><th>Tuần 2–13</th><td>Unit 1–6, mỗi unit 2 tuần</td></tr><tr><th>Tuần 14</th><td>Thi thử trọn đề trên lớp, có tính giờ</td></tr><tr><th>Tuần 15</th><td>Ôn cuối, nhận xét và hướng dẫn đăng ký thi</td></tr></tbody></table></div>'
    return dict(source='gen',overview=course_overview(c,cal+units_table(c,rows),weeks=15),units=units)

# PreB: bản đề xuất
PREB=[('Greeting','hello, goodbye, teacher, friend, boy, girl, yes, no'),('Name and age','one, two, three, four, five, name, birthday, cake'),
 ('Family','mommy, daddy, brother, sister, grandma, grandpa, baby, family'),('Body','head, eyes, ears, nose, mouth, hands, feet, touch'),
 ('Feelings','happy, sad, angry, tired, sleepy, hungry, smile'),('School','book, pen, pencil, bag, ruler, desk, sit down, stand up'),
 ('House','bed, chair, table, sofa, door, window, bath, home'),('Animals','cat, dog, bird, fish, rabbit, duck, horse, frog'),
 ('Food','apple, banana, milk, water, rice, egg, juice, cake'),('Weather','sunny, rainy, cloudy, windy, hot, cold'),
 ('Colors','red, blue, yellow, green, pink, orange, black, white'),('Numbers and counting','six, seven, eight, nine, ten, how many, ball, toy')]
def gen_preb():
    units={}; rows=[]
    for i,(t,ws) in enumerate(PREB,1):
        w=[x.strip() for x in ws.split(',')]
        h=f'<h3>Mục tiêu</h3><ul><li>Con nghe hiểu và làm động tác, chỉ tranh theo {len(w)} từ của chủ đề.</li><li>Con hát theo bài hát và nói theo cô 1–2 từ, 1 câu ngắn.</li><li>Con làm quen âm tiếng Anh qua vè, bài hát; chưa học chữ.</li></ul>'
        h+='<h3>Từ nghe hiểu</h3><ul class="wchips en">'+''.join(f'<li>{E(x)}</li>' for x in w)+'</ul>'
        h+='<h3>Lịch 1 tuần của unit</h3>'+rhythm('pre')
        units[str(i)]=dict(title=f'Unit {i} · {t}',html=h,en=w)
        rows.append(f'<tr><td>{i}</td><td><a href="#/u/preb/{i}">{E(t)}</a></td><td>{len(w)}</td><td>–</td><td>–</td></tr>')
    cal='<p class="note">Bản đề xuất: khung PreB chưa có trong bảng phân bổ từ vựng. Chủ đề đi trước 12 chủ đề của Little Seed, chỉ tiếng Anh, nghe – hiểu là chính, khoảng 100 từ.</p><h3 class="sec">Lịch 15 tuần</h3><div class="tbox"><table class="t"><tbody><tr><th>Tuần 1</th><td>Mở khóa, làm quen cô và bạn</td></tr><tr><th>Tuần 2–7</th><td>Unit 1–6, mỗi unit 1 tuần (2 buổi, 3 bài web)</td></tr><tr><th>Tuần 8</th><td>Ôn chặng, trò chơi quét lại 6 chủ đề</td></tr><tr><th>Tuần 9–14</th><td>Unit 7–12</td></tr><tr><th>Tuần 15</th><td>Cuối khóa: sân khấu nhỏ, ba mẹ xem con hát và chỉ tranh</td></tr></tbody></table></div>'
    return dict(source='gen',draft=True,overview=course_overview('PreB',cal+units_table('PreB',rows),weeks=15),units=units)

UN['PreB']={i+1:t for i,(t,_) in enumerate(PREB)}
CID['PreB']='preb'
out={'little-seed':from_doc('Little Seed','ls'),'canopy':from_doc('Canopy','canopy'),
     'seedling':gen_course('Seedling','ls'),'larva':gen_course('Larva','cn'),'pupa':gen_course('Pupa','cn'),'cocoon':gen_course('Cocoon','cn'),
     'larva-plus':gen_review_course('Larva Plus',['Larva'],'Movers và YCT3'),'butterfly':gen_review_course('Butterfly',['Pupa','Cocoon'],'Flyers và YCT4'),
     'preb':gen_preb()}
for k,v in out.items():
    json.dump(v,open(OUT+k+'.json','w'),ensure_ascii=False)
    print(k,v['source'],len(v['units']),'units',os.path.getsize(OUT+k+'.json'))
# bổ sung unit cho khóa chưa có từ mới (PreB, Larva Plus, Butterfly) vào chuong-trinh.json
for c in D['courses']:
    v=out[c['id']]
    if not c['units']:
        c['units']=[dict(u=int(k),name=x['title'].split(' · ',1)[1],en=[dict(w=w,t='Từ ôn' if 'review_en' in x else 'Từ lõi',lv='') for w in x.get('review_en',x.get('en',[]))],zh=[dict(w=w,t='Từ ôn',lv='') for w in x.get('review_zh',[])],web=False,webs=0,review=('review_en' in x)) for k,x in sorted(v['units'].items(),key=lambda z:int(z[0]))]
for c in D['courses']:
    for un in c['units']:
        for w in un['en']: w['w']=cap(w['w'])
json.dump(D,open(SITE+'data/chuong-trinh.json','w'),ensure_ascii=False)
