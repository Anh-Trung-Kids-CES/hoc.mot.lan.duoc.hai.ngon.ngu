/* Anh – Trung – Kids · trang chương trình (bản đồ 9 khóa + bài tự học)
   Trang này độc lập với web 21 ngày: chỉ đọc tranh và giọng đọc ở ../xem-truoc/tai-nguyen/, không ghi gì vào đó. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=$('#view');
/* Bản xem trước: đọc chung dữ liệu với trang thật, lưu tiến độ dưới khóa riêng (atk2-) để không lẫn với trang thật */
const DATA='../chuong-trinh/data/';
const ATK={data:null,lessons:{}};
window.ATK=ATK;

/* ---------- lưu trên máy (tiến độ, Hộp ôn) ---------- */
const store={
  get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
const KEY={prog:'atk2-tien-do',hop:'atk2-hop-on',seen:'atk2-da-gap',name:'atk2-ten-con'};
ATK.store=store; ATK.KEY=KEY;
const DAY=864e5, STEP=[1,2,7,21,42];
ATK.hop={
  all(){ return store.get(KEY.hop,{}); },
  wrong(id){ const h=this.all(); h[id]={b:0,due:Date.now()}; store.set(KEY.hop,h); },
  right(id){ const h=this.all(); const x=h[id]; if(!x) return; x.b=Math.min(x.b+1,STEP.length-1); x.due=Date.now()+STEP[x.b]*DAY; if(x.b>=STEP.length-1 && x.done){ delete h[id]; } else if(x.b>=STEP.length-1){ x.done=true; } store.set(KEY.hop,h); },
  due(){ const h=this.all(), now=Date.now(); return Object.keys(h).filter(k=>h[k].due<=now).sort((a,b)=>h[a].due-h[b].due); }
};
ATK.seen={
  mark(id){ const s=store.get(KEY.seen,{}); s[id]=Date.now(); store.set(KEY.seen,s); },
  ago(id){ const s=store.get(KEY.seen,{}); return s[id]?Date.now()-s[id]:Infinity; }
};
ATK.prog={
  get(k){ return (store.get(KEY.prog,{}))[k]||0; },
  set(k,stars){ const p=store.get(KEY.prog,{}); p[k]=Math.max(p[k]||0,stars); store.set(KEY.prog,p); }
};

/* ---------- Chế độ con trội tiếng Anh (bản xem thử: công tắc trên máy, chỉ Canopy Unit 5) ---------- */
KEY.em='atk2-en-manh'; KEY.emLog='atk2-kt-en';
ATK.enManh={
  on(){ return store.get(KEY.em,false)===true; },
  set(v){ store.set(KEY.em,!!v); },
  has(cid,u){ return cid==='canopy' && +u===5; },          // unit đã có dữ liệu Thử thách, Phiên dịch nhí nâng cao
  active(cid,u){ return this.on() && this.has(cid,u); },
  log(key,ok){ const h=store.get(KEY.emLog,[]); h.push({key,ok:!!ok,t:Date.now()}); store.set(KEY.emLog,h.slice(-60)); },
  history(){ return store.get(KEY.emLog,[]); },
  failStreak(){ // số ngày web liền nhau (lần làm gần nhất của mỗi ngày) con trượt kiểm tra nhanh
    const last=new Map(); this.history().forEach(x=>{ last.delete(x.key); last.set(x.key,x); });
    const xs=[...last.values()].reverse(); let n=0; for(const x of xs){ if(x.ok) break; n++; } return n; }
};
/* Hộp "Gửi cô": bản ghi Phiên dịch nhí nâng cao, lưu IndexedDB trên máy; không mở được thì giữ trong bộ nhớ phiên */
ATK.guiCo=(function(){
  const mem=[]; let dbp=null;
  const db=()=>{ if(dbp) return dbp; dbp=new Promise(res=>{ try{
      const r=indexedDB.open('atk2-gui-co',1);
      r.onupgradeneeded=()=>{ try{ r.result.createObjectStore('rec',{keyPath:'id'}); }catch(e){} };
      r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); r.onblocked=()=>res(null);
    }catch(e){ res(null); } }); return dbp; };
  const tx=async(mode,fn)=>{ const d=await db(); if(!d) return null; return new Promise(res=>{ try{
      const t=d.transaction('rec',mode), s=t.objectStore('rec'); const out=fn(s);
      t.oncomplete=()=>res(out&&out.result!==undefined?out.result:true); t.onerror=()=>res(null); t.onabort=()=>res(null);
    }catch(e){ res(null); } }); };
  return {
    async add(rec){ rec.id=rec.id||('r'+Date.now()+Math.random().toString(36).slice(2,6)); const ok=await tx('readwrite',s=>s.put(rec)); if(!ok) mem.push(rec); return rec.id; },
    async del(id){ const i=mem.findIndex(x=>x.id===id); if(i>=0) mem.splice(i,1); await tx('readwrite',s=>s.delete(id)); },
    async list(){ const xs=(await tx('readonly',s=>s.getAll()))||[]; return [...(Array.isArray(xs)?xs:[]),...mem].sort((a,b)=>b.t-a.t); }
  };
})();

/* ---------- dữ liệu ---------- */
async function load(){
  if(ATK.data) return ATK.data;
  const r=await fetch(DATA+'chuong-trinh.json'); ATK.data=await r.json(); return ATK.data;
}
ATK.lesson=async function(cid,u){
  const k=cid+'-u'+u;
  if(!ATK.lessons[k]){ const r=await fetch(DATA+'bai/'+k+'.json'); ATK.lessons[k]=await r.json(); }
  return ATK.lessons[k];
};
const course=id=>ATK.data.courses.find(c=>c.id===id);
const CT={};
ATK.detail=async function(id){ if(!CT[id]){ const r=await fetch(DATA+'chi-tiet/'+id+'.json'); CT[id]=await r.json(); } return CT[id]; };
const WEBNAME=['','Ngày 1','Ngày 2','Ngày 3','Ngày 4','Ngày 5','Ngày 6','Ngày 7','Ngày 8'];
const WEBIC={the:'🃏',chon:'👂',noi:'🎤',anh_trung:'🔵🔴',ghep:'🧩',cau:'💬',truyen:'📖',truyen_hoi:'📖',on_nhanh:'🔁',hop_on:'🧠',nhin_chu:'字',xem:'📺',chon_chu:'🔤'};

/* ---------- trang ---------- */
function setNav(k){ document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.nav===k)); }
function pageHome(){
  setNav('home');
  const D=ATK.data, name=store.get(KEY.name,'');
  const kids=['leo','anna','xiaomei','bong'].map(k=>D.people[k]).filter(Boolean);
  view.innerHTML=`
  <section class="hero">
    <div>
      <h1>Học một lần,<br>được hai ngôn ngữ</h1>
      <p class="lead">Lộ trình 9 khóa song ngữ Anh – Trung cho trẻ 4–10 tuổi, đi từ chưa biết ngoại ngữ đến Cambridge Flyers và YCT4. Mỗi unit học 2 tuần: 4 buổi trên lớp và 8 ngày tự học trên web, cứ 2 ngày web đi với 1 buổi.</p>
      <form class="who" id="who"><label class="sr" for="ten">Tên của con</label>
        <input id="ten" placeholder="Tên của con (lưu trên máy này)" value="${esc(name)}" autocomplete="off">
        <button>Lưu</button></form>
    </div>
    <div class="kids">${kids.map(p=>`<img src="${esc(p[1])}" alt="${esc(p[0])}">`).join('')}</div>
  </section>
  <section class="today card" id="today"></section>
  <h2>Lộ trình 9 khóa</h2>
  <div class="path">${D.courses.map((c,i)=>{
    const web=c.units.filter(u=>u.web).map(u=>u.u);
    const nEn=c.units.reduce((a,u)=>a+u.en.length,0), nZh=c.units.reduce((a,u)=>a+u.zh.length,0);
    return `<a class="course card" href="#/k/${c.id}">
      <span class="n" aria-hidden="true">${i+1}</span>
      <span><span class="stage">${esc(c.stage)} · ${esc(c.age)} tuổi</span>
        <h3>${esc(c.name)}</h3>
        <span class="meta"><span class="chip en">EN ${esc(c.en)}</span><span class="chip zh">中文 ${esc(c.zh)}</span>
        ${c.units.length?`<span class="chip">${c.units.length} unit · ${nEn} từ Anh · ${nZh} từ Trung</span>`:'<span class="chip">Đang soạn khung từ vựng</span>'}
        ${web.length?`<span class="chip web">Có bài web: Unit ${web[0]}–${web[web.length-1]}</span>`:''}</span></span>
      <span class="go" aria-hidden="true">›</span></a>`;}).join('')}</div>`;
  $('#who').onsubmit=e=>{ e.preventDefault(); store.set(KEY.name,$('#ten').value.trim()); ATK.gc.hs.get().dong_y&&ATK.gc.hs.set({ten:$('#ten').value.trim()}); $('#who button').textContent='Đã lưu'; todayCard(); };
  todayCard();
}
/* Nhiệm vụ hôm nay: một nút đi thẳng vào ngày web tiếp theo; học xong thì hẹn mai */
function todayCard(){
  const el=$('#today'); if(!el) return; const gc=ATK.gc, hs=gc.hs.get();
  const c=course(hs.khoa)&&course(hs.khoa).units.some(u=>u.web)?course(hs.khoa):ATK.data.courses.find(x=>x.units.some(u=>u.web));
  const nv=gc.nhiemVu(c), mon=gc.monday(), d=gc.ngay.ds().filter(x=>x>=mon).length, g=gc.mt.so(mon);
  const set=new Set(gc.ngay.ds());
  const week=`<div class="wdots sm">${[0,1,2,3,4,5,6].map(i=>{ const x=gc.add(mon,i); return `<span class="wd ${set.has(x)?'on':''} ${x===gc.today()?'nay':''}"><i></i><small>${gc.THU_VN[i]}</small></span>`; }).join('')}</div>`;
  let main;
  if(gc.nghi.dang()) main=`<div class="t-msg">🌴 Nhà mình đang tạm nghỉ đến ${gc.vnDate(gc.nghi.get().den)}. Con muốn học lúc nào cũng được.</div>${nv&&nv.mo?`<a class="t-go" href="#/b/${nv.k}">▶<span>Unit ${nv.U.u} · ${WEBNAME[nv.n]}</span></a>`:''}`;
  else if(gc.ngay.homNay()) main=`<div class="t-msg">✅ Hôm nay con đã học xong. Hẹn mai nhé! 🌙</div><a class="t-sub" href="#/hop-on">Ôn thêm trong Hộp ôn (tùy chọn)</a>`;
  else if(!nv) main=`<div class="t-msg">🏁 Con đã học hết các bài đang có của ${esc(c.name)}.</div>`;
  else if(!nv.mo) main=`<div class="t-msg">🌙 ${WEBNAME[nv.n]} của Unit ${nv.U.u} mở vào ngày mai.</div>`;
  else main=`<a class="t-go" href="#/b/${nv.k}">▶<span>${esc(c.name)} · Unit ${nv.U.u} · ${WEBNAME[nv.n]}</span></a>`;
  el.innerHTML=`<div class="t-h"><div><small class="stage">Nhiệm vụ hôm nay · 10–15 phút</small><h2>${esc(gc.tenCon()==='con'?'Của con':'Của '+gc.tenCon())}</h2></div>
    <div class="t-w"><small>Tuần này ${d}/${g} ngày</small>${week}</div></div>${main}
    <p class="note">${gc.soTuanDat()?`Đã đạt mục tiêu ${gc.soTuanDat()} tuần. `:''}${hs.dong_y?'':'Ba mẹ vào mục <a href="#/ba-me">Ba mẹ</a> để chọn khóa của con và mục tiêu tuần.'}</p>`;
}
function pageCourse(cid){
  setNav('home');
  const c=course(cid); if(!c) return pageHome();
  view.innerHTML=`
  <p class="crumb"><a href="#/">Lộ trình</a> › ${esc(c.name)}</p>
  <h1>${esc(c.name)}</h1>
  <div class="facts">
    <div class="fact card"><small>Giai đoạn</small><b>${esc(c.stage)}</b></div>
    <div class="fact card"><small>Tuổi</small><b>${esc(c.age)}</b></div>
    <div class="fact card"><small>Thời lượng</small><b>${esc(c.time)}</b></div>
    <div class="fact card"><small>Tiếng Anh cuối khóa</small><b>${esc(c.en)}</b></div>
    <div class="fact card"><small>Tiếng Trung cuối khóa</small><b>${esc(c.zh)}</b></div>
    <div class="fact card"><small>Chuyển ngữ</small><b>${esc(c.bridge)}</b></div>
  </div>
  <p><a class="btn-bang" href="#/bang/${c.id}">Bảng phân bổ theo buổi: ${c.id==='preb'||c.id==='larva-plus'||c.id==='butterfly'?'30 buổi, 60 ngày web':'60 buổi, 120 ngày web'}</a></p>
  <h2>Chương trình chi tiết</h2>
  <div class="detail card" id="ov"><p class="note">Đang tải…</p></div>
  ${c.units.length?`<h2>Các unit</h2>
  <p class="note">Bấm một unit để xem chương trình chi tiết của unit. Unit có viền xanh đã có 8 ngày tự học trên web.</p>
  <div class="units">${c.units.map(u=>`<a class="unit card ${u.web?'has':''}" href="#/u/${c.id}/${u.u}">
    <span class="un">UNIT ${u.u}</span><h3>${esc(u.name)}</h3>
    <span class="cnt">${u.review?`<span class="chip">${u.en.length+u.zh.length} từ ôn</span>`:`<span class="chip en">${u.en.length} từ Anh</span>${u.zh.length?`<span class="chip zh">${u.zh.length} từ Trung</span>`:''}`}${u.web?'<span class="chip web">8 ngày web</span>':''}</span></a>`).join('')}</div>`
  :''}`;
  ATK.detail(c.id).then(d=>{ const el=$('#ov'); if(!el) return; el.innerHTML=(d.draft?'<p class="chip">Bản đề xuất, chờ duyệt</p>':'')+d.overview; });
}
const TLAB={'Từ lõi':'lõi','Cụm từ, câu mẫu':'cụm','Từ mở rộng':'mở rộng','Từ chức năng (theo mẫu câu)':'chức năng'};
function wlist(ws,cls){
  return `<ul>${ws.map(w=>`<li class="${cls}">${esc(w.w)}<i>${esc(TLAB[w.t]||'')}</i></li>`).join('')}</ul>`;
}
function pageUnit(cid,u){
  setNav('home');
  const c=course(cid); const U=c&&c.units.find(x=>x.u==u); if(!U) return pageCourse(cid);
  const lessons=U.web?[1,2,3,4,5,6]:[];
  view.innerHTML=`
  <p class="crumb"><a href="#/">Lộ trình</a> › <a href="#/k/${c.id}">${esc(c.name)}</a> › Unit ${U.u}</p>
  <h1>Unit ${U.u} · ${esc(U.name)}</h1>
  <p><a class="btn-bang" href="#/bang/${c.id}/${U.u}">Xem bảng phân bổ theo buổi của unit này</a></p>
  ${U.web?`<p class="lead">8 ngày tự học, mỗi ngày một nhiệm vụ ${esc(c.web_min)} phút; mỗi ngày mở 1 ngày web mới${ATK.gc.gv()?' (đang ở chế độ thầy cô: mở mọi bài)':''}; 2 ngày web chuẩn bị cho 1 buổi trên lớp. Ngày 1–5 học từ mới xen ngày củng cố, ngày 6–8 ôn không tranh, nghe truyện và chuyển ngữ. Ngày nào cũng mở đầu bằng phần Ôn nhanh từ cũ (từ unit thứ hai trở đi).</p>
  <div class="lessons" id="lessons"></div>${ATK.enManh.active(c.id,U.u)?'<section class="leo card" id="leo"></section>':''}`:`<p class="lead">Bài tự học trên web của unit này đang soạn.</p>`}
  <h2>Chương trình chi tiết của unit</h2>
  <div class="detail card" id="ud"><p class="note">Đang tải…</p></div>
  <div id="wl"><h2>Từ của unit theo bảng phân bổ</h2>
  <div class="words">
    <div class="wl card en"><h3>Tiếng Anh · ${U.en.length}</h3>${wlist(U.en,'')}</div>
    <div class="wl card zh"><h3>Tiếng Trung · ${U.zh.length}</h3>${wlist(U.zh,'')}</div>
  </div>
  <p class="note">Nhãn nhỏ: lõi (con nói được, có trong bài kiểm tra) · cụm (cụm từ, câu mẫu) · mở rộng (con nghe hiểu, gặp trong câu và truyện) · chức năng (đi theo mẫu câu).</p></div>`;
  ATK.detail(c.id).then(d=>{ const x=d.units[String(U.u)]; const el=$('#ud'); if(!el) return;
    el.innerHTML=x?(d.draft?'<p class="chip">Bản đề xuất, chờ duyệt</p>':'')+(x.title&&x.title!==('Unit '+U.u+' · '+U.name)?`<p class="note">${esc(x.title)}</p>`:'')+x.html:'<p class="note">Chưa có.</p>';
    if(d.source==='gen'){ const w=$('#wl'); if(w) w.remove(); } });
  if(U.web){
    ATK.lesson(c.id,U.u).then(L=>{
      const nv=ATK.gc.nhiemVu(c), hn=ATK.gc.ngay.homNay();
      $('#lessons').innerHTML=L.webs.map(w=>{
        const k=c.id+'/'+U.u+'/'+w.n, st=ATK.prog.get(k), m=ATK.gc.mo(c,U,w.n), nay=nv&&nv.k===k&&m.mo&&!hn;
        const ics=[...new Set(w.acts.map(a=>WEBIC[a.t]).filter(Boolean))].slice(0,5).map(x=>`<span>${x}</span>`).join('');
        if(!m.mo) return `<div class="lesson lock" aria-disabled="true"><span class="ic" aria-hidden="true">${m.vi==='mai'?'🌙':'🔒'}</span><b>${WEBNAME[w.n]}</b>
          <span class="lk-t">${m.vi==='mai'?'Mở vào ngày mai':'Mở sau ngày trước'}</span></div>`;
        return `<a class="lesson ${st?'done':''} ${nay?'nay':''}" href="#/b/${k}">${nay?'<span class="nay-t">Hôm nay ▶</span>':''}<span class="ic" aria-hidden="true">${ics}</span><b>${WEBNAME[w.n]}</b>
          <span class="st" aria-label="${st} sao">${'★'.repeat(st)}${'☆'.repeat(3-st)}</span></a>`;}).join('');
      const leo=$('#leo'); if(leo) leoCorner(leo,c,U,L);
    });
  }
}
/* Góc "Thử thách của Leo": mở sau khi con xong ngày đó; không cộng sao, không mở ngày mới */
function leoCorner(el,c,U,L){
  const leoPic=ATK.data.people.leo;
  el.innerHTML=`<div class="leo-h">${leoPic?`<img src="${esc(leoPic[1])}" alt="">`:''}<div><h2>Thử thách của Leo</h2>
    <p class="note">Các bé nếu hứng thú thì khám phá thêm, không cần làm hết.</p></div></div>
    <div class="leo-grid">${L.webs.map(w=>{
      const k=c.id+'/'+U.u+'/'+w.n, done=ATK.prog.get(k)>0;
      const tt=w.thu_thach_en, pd=w.phien_dich_nc;
      if(!tt&&!pd) return '';
      return `<div class="leo-day ${done?'':'lock'}"><b>${WEBNAME[w.n]}</b>
        ${done?`${tt?`<a class="lb en" href="#/tt/${k}"><span aria-hidden="true">🦁</span> Thử thách tiếng Anh <small>${esc(tt.cap)}</small></a>`:''}
        ${pd?`<a class="lb zh" href="#/pd/${k}"><span aria-hidden="true">🎧→中</span> Phiên dịch nhí nâng cao</a>`:''}`
        :`<span class="lk"><span aria-hidden="true">🔒</span> Mở sau khi con xong ${WEBNAME[w.n]}</span>`}</div>`;}).join('')}</div>
    <p class="leo-f"><a href="#/gui-co">🎙️ Gửi cô</a> <span class="note" id="gcn"></span></p>`;
  ATK.guiCo.list().then(xs=>{ const n=xs.filter(x=>x.cid===c.id&&+x.u===+U.u).length; const g=$('#gcn'); if(g) g.textContent=n?`${n} bản ghi`:'chưa có bản ghi'; });
}
async function pageGuiCo(){
  setNav('lop');
  view.innerHTML=`<p class="crumb"><a href="#/lop">Thầy cô</a> › Gửi cô</p><h1>Gửi cô</h1>
  <p class="lead">Bản ghi con nói lại bằng tiếng Trung trong Phiên dịch nhí nâng cao. Cô nghe trên lớp; web không chấm tự động.</p>
  <div id="gc"><p class="note">Đang tải…</p></div>
  <p class="note">Bản xem thử: bản ghi lưu trên máy này (trình duyệt), không gửi đi đâu. Web thật sẽ gửi bản ghi về trang quản lý lớp.</p>`;
  const xs=await ATK.guiCo.list(); const el=$('#gc'); if(!el) return;
  if(!xs.length){ el.innerHTML='<p class="card" style="padding:16px">Chưa có bản ghi nào.</p>'; return; }
  const urls=[];
  el.innerHTML=`<div class="gc-list">${xs.map(x=>{ let u=''; try{ u=URL.createObjectURL(x.blob); urls.push(u); }catch(e){}
    const d=new Date(x.t); const tm=d.toLocaleDateString('vi-VN')+' '+d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
    return `<div class="gc card"><div><b>${esc(x.title||'')}</b><small>${esc(tm)} · ${Math.round((x.dur||0)/1000)} giây</small>
      <p class="zh gc-m">${esc(x.mau||'')}</p></div>${u?`<audio controls preload="none" src="${esc(u)}"></audio>`:''}
      <button class="gc-x" data-id="${esc(x.id)}">Xóa</button></div>`; }).join('')}</div>`;
  el.querySelectorAll('.gc-x').forEach(b=>b.onclick=async()=>{ await ATK.guiCo.del(b.dataset.id); pageGuiCo(); });
}
async function pageKhung(){
  setNav('khung');
  view.innerHTML='<h1>Khung chương trình</h1><p class="note">Đang tải…</p>';
  const d=await ATK.detail('khung');
  view.innerHTML=`<h1>Khung chương trình</h1><div class="detail lead2">${d.lead}</div>
  <nav class="toc card" aria-label="Mục lục"><b>Mục lục</b><ol>${d.sections.map((x,i)=>`<li><a href="#/khung" data-go="s${i}">${esc(x.t)}</a></li>`).join('')}</ol></nav>
  ${d.sections.map((x,i)=>`<section class="detail" id="s${i}"><h2>${esc(x.t)}</h2>${x.h}</section>`).join('')}`;
  view.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); document.getElementById(a.dataset.go).scrollIntoView({behavior:'smooth'}); });
}
function pageHop(){
  setNav('hop');
  const D=ATK.data, h=ATK.hop.all(), ids=Object.keys(h).filter(k=>D.kho[k]);
  const due=new Set(ATK.hop.due());
  view.innerHTML=`<h1>Hộp ôn của con</h1>
  <p class="lead">Từ con trả lời chưa đúng được đưa vào hộp. Từ cần ôn hôm nay hiện ở phần Ôn nhanh đầu bài học kế tiếp; trả lời đúng thì từ giãn ra 1 ngày, 2 ngày, 1 tuần, 3 tuần, 6 tuần rồi rời hộp.</p>
  ${ids.length?`<h2>${ids.length} từ trong hộp · ${[...due].filter(k=>D.kho[k]).length} từ cần ôn hôm nay</h2>
  <div class="boxgrid">${ids.map(k=>{const x=D.kho[k]; const d=Math.max(0,Math.ceil((h[k].due-Date.now())/864e5));
    return `<div class="bx card">${x.pics[0]?`<img src="${esc(x.pics[0])}" alt="">`:`<div class="emo">${esc(x.emo||'🔤')}</div>`}
    <small><span style="color:var(--en)">${esc(x.en)}</span> · <span class="zh" style="color:var(--zh)">${esc(x.zh)}</span><br>${due.has(k)?'ôn hôm nay':'ôn sau '+d+' ngày'}</small></div>`;}).join('')}</div>`
  :`<p class="card" style="padding:16px">Hộp đang trống. Khi con làm bài, từ nào con chọn chưa đúng sẽ vào đây.</p>`}`;
}
ATK.guideHTML=()=>`<div class="prose"><h2>Mỗi unit con học thế nào</h2>
  <ul>
    <li>Một unit kéo dài 2 tuần: 4 buổi trên lớp và 8 ngày web. Cứ 2 ngày web đi trước 1 buổi: Ngày 1, Ngày 2 → Buổi 1 → Ngày 3, Ngày 4 → Buổi 2 → Ngày 5, Ngày 6 → Buổi 3 → Ngày 7, Ngày 8 → Buổi 4. Mỗi tuần: 2 buổi trên lớp và 4 ngày web.</li>
    <li>Mỗi bài web không quá 30 phút: Little Seed, Seedling 10–15 phút; Canopy, Larva 15–20 phút.</li>
    <li>Ngày 1–5 giới thiệu từ mới theo nhóm (xen ngày củng cố); ngày 6–8 ôn không có hình mẫu, nghe truyện, chuyển ngữ và Hộp ôn.</li>
    <li>Nội dung từng ngày web và từng buổi (từ, cụm từ, câu, truyện, video; flashcard, slide bài tập, truyện, bài hát trên lớp) nằm ở <b>Bảng phân bổ theo buổi</b> của mỗi khóa.</li>
  </ul>
  <h2>Vì sao từ cũ cứ quay lại</h2>
  <ul>
    <li><b>Ôn nhanh</b> ở đầu mỗi bài: 3 từ cũ (Little Seed), 5 từ cũ (Canopy). Con tự nghe, tự chọn trước khi thấy thẻ, vì tự nhớ lại giúp con nhớ lâu hơn xem lại.</li>
    <li><b>Phương án nhiễu</b> trong câu hỏi chọn tranh luôn có ít nhất một từ của unit trước, không bao giờ là từ con chưa học.</li>
    <li><b>Hộp ôn</b>: từ con chọn chưa đúng quay lại ở bài kế tiếp, rồi giãn dần 1 ngày → 2 ngày → 1 tuần → 3 tuần → 6 tuần.</li>
    <li>Từ của khóa trước đi tiếp vào khóa sau: ví dụ từ gia đình của Little Seed quay lại ở Canopy Unit 6 khi con học về nghề của người thân.</li>
  </ul>
  <h2>Màn bài học không có chữ tiếng Việt</h2>
  <p>Trong bài, con làm theo hình, biểu tượng và giọng tiếng Anh, tiếng Trung: 👂 nghe rồi chạm tranh, 🎤 nói theo, 🔵🔴 chọn tiếng Anh hay tiếng Trung, 🧩 lật thẻ tìm đôi, 📖 nghe truyện, 🔁 ôn nhanh. Nếu con chưa chạm sau vài giây, tranh đúng sẽ nhấp nháy để gợi ý. Ba mẹ ngồi cạnh con, khen con, không nhắc bằng tiếng Việt.</p>
  <h2>Hiện có gì trên trang</h2>
  <ul>
    <li>Bản đồ 9 khóa, danh sách từ tiếng Anh và tiếng Trung của từng unit theo bảng phân bổ từ vựng.</li>
    <li>Bài tự học: Little Seed Unit 1–3 và Canopy Unit 5–7 (8 ngày mỗi unit), dùng tranh và giọng đọc đã thu. Các unit khác đang soạn.</li>
    <li>Bảng phân bổ theo buổi của cả 9 khóa: mỗi ngày web và mỗi buổi trên lớp ghi rõ nội dung học.</li>
    <li>Tiến độ và Hộp ôn lưu trên máy con đang dùng.</li>
  </ul>
  <p class="note">Con: mỗi ngày mở 1 ngày web mới. Thầy cô bật "Mở mọi bài" ở trang Thầy cô để xem trước.</p>
  </div>`;

/* ---------- bảng phân bổ theo buổi (cùng bố cục với Google Sheet "Khung chương trình mỗi khoá") ---------- */
const BWEB=[['tu','Từ'],['cum','Cụm từ'],['cau','Câu (cài ngữ pháp)'],['truyen','Truyện'],['video','Video']];
const BLOP=[['flash','Flash card'],['slide','Slide có bài tập tương tác'],['truyen','Truyện'],['baihat','Bài hát']];
function bcell(t){
  t=String(t==null?'':t);
  if(t==='–'||t==='') return '<span class="dash">–</span>';
  let h=esc(t).replace(/(https?:\/\/[^\s,;)<]+)/g,'<a href="$1" target="_blank" rel="noopener">link</a>')
    .replace(/(Mới|Ôn|Tìm YouTube|Nghe thêm):/g,'<b>$1:</b>').replace(/\[(Ngữ pháp[^\]]*)\]/g,'<span class="gp">$1</span>')
    .replace(/ \| /g,'<br>').replace(/ \/ /g,'<br>').replace(/\n/g,'<br>');
  return h;
}
function blockName(b){ return b.kind==='unit'?'Unit '+b.unit:({mo:'Mở khóa',on:'Ôn chặng',cuoi:'Cuối khóa',le:'Lễ hội',thi:'Thi thử'}[b.kind]||b.kind); }
async function pageBang(cid,sel){
  setNav('home');
  const c=course(cid); if(!c) return pageHome();
  view.innerHTML=`<p class="crumb"><a href="#/">Lộ trình</a> › <a href="#/k/${c.id}">${esc(c.name)}</a> › Bảng phân bổ</p><h1>Bảng phân bổ theo buổi · ${esc(c.name)}</h1><p class="note">Đang tải…</p>`;
  let d; try{ const r=await fetch(DATA+'bang/'+cid+'.json'); if(!r.ok) throw 0; d=await r.json(); }catch(e){ view.querySelector('.note').textContent='Bảng của khóa này đang soạn.'; return; }
  const B=d.blocks; let i=B.findIndex(b=>sel?(String(b.unit)===String(sel)||b.key===sel):true); if(i<0) i=0;
  const nb=B.reduce((n,b)=>n+b.rows.length,0);
  view.innerHTML=`<p class="crumb"><a href="#/">Lộ trình</a> › <a href="#/k/${c.id}">${esc(c.name)}</a> › Bảng phân bổ</p>
  <h1>Bảng phân bổ theo buổi · ${esc(c.name)}</h1>
  <p class="lead">${nb} buổi trên lớp, ${nb*2} ngày web. Cứ 2 ngày nội dung trên web đi trước 1 buổi học trên lớp. Hàng ngang là từng ngày web và từng buổi; cột là nội dung: trên web có Từ, Cụm từ, Câu, Truyện, Video; trên lớp có Flash card, Slide bài tập tương tác, Truyện, Bài hát.</p>
  <p><a class="chip" href="${DATA}bang/${cid}.csv" download>Tải bảng (CSV, mở được bằng Excel, Google Sheets)</a></p>
  <div class="bchips" role="tablist">${B.map((b,k)=>`<button role="tab" class="chip ${k===i?'on':''}" data-k="${k}" aria-selected="${k===i}">${esc(blockName(b))}</button>`).join('')}</div>
  <div id="bb"></div>`;
  const show=k=>{
    const b=B[k]; view.querySelectorAll('.bchips .chip').forEach(x=>{const on=+x.dataset.k===k; x.classList.toggle('on',on); x.setAttribute('aria-selected',on);});
    const head=`<thead><tr><th rowspan="3" class="sc">Ngày web</th><th colspan="10" class="grp"><span>Nội dung đẩy lên web</span></th><th rowspan="3" class="sb">Buổi dạy</th><th colspan="8" class="grp"><span>Nội dung dạy trên lớp</span></th></tr>
      <tr><th colspan="5" class="en">Tiếng Anh</th><th colspan="5" class="zh">Tiếng Trung</th><th colspan="4" class="en">Tiếng Anh</th><th colspan="4" class="zh">Tiếng Trung</th></tr>
      <tr>${BWEB.map(x=>`<th>${x[1]}</th>`).join('')}${BWEB.map(x=>`<th>${x[1]}</th>`).join('')}${BLOP.map(x=>`<th>${x[1]}</th>`).join('')}${BLOP.map(x=>`<th>${x[1]}</th>`).join('')}</tr></thead>`;
    const body=b.rows.map(r=>r.web.map((w,j)=>`<tr class="${j?'w2':'w1'}"><th class="sc">${esc(w.label)}</th>
      ${BWEB.map(x=>`<td>${bcell(w.en[x[0]])}</td>`).join('')}${BWEB.map(x=>`<td class="zh">${bcell(w.zh[x[0]])}</td>`).join('')}
      ${j===0?`<th rowspan="${r.web.length}" class="sb">${esc(r.label_buoi)}</th>${BLOP.map(x=>`<td rowspan="${r.web.length}" class="lop">${bcell(r.lop.en[x[0]])}</td>`).join('')}${BLOP.map(x=>`<td rowspan="${r.web.length}" class="lop zh">${bcell(r.lop.zh[x[0]])}</td>`).join('')}`:''}</tr>`).join('')).join('');
    const cards=b.rows.map(r=>`<article class="bcard card"><h3>${esc(r.label_buoi)}</h3>
      ${r.web.map(w=>`<details><summary>${esc(w.label)}</summary>${['en','zh'].map(L=>`<div class="bl ${L}"><b>${L==='en'?'Tiếng Anh':'Tiếng Trung'}</b><dl>${BWEB.map(x=>`<dt>${x[1]}</dt><dd>${bcell(w[L][x[0]])}</dd>`).join('')}</dl></div>`).join('')}</details>`).join('')}
      <details><summary>Trên lớp</summary>${['en','zh'].map(L=>`<div class="bl ${L}"><b>${L==='en'?'Tiếng Anh':'Tiếng Trung'}</b><dl>${BLOP.map(x=>`<dt>${x[1]}</dt><dd>${bcell(r.lop[L][x[0]])}</dd>`).join('')}</dl></div>`).join('')}</details></article>`).join('');
    $('#bb').innerHTML=`<h2>${esc(b.title||blockName(b))}</h2><div class="bwrap card"><table class="bang">${head}<tbody>${body}</tbody></table></div><div class="bcards">${cards}</div>`;
    history.replaceState(null,'','#/bang/'+cid+'/'+(b.kind==='unit'?b.unit:b.key));
  };
  view.querySelectorAll('.bchips .chip').forEach(x=>x.onclick=()=>show(+x.dataset.k));
  show(i);
}

/* ---------- định tuyến ---------- */
async function route(){
  await load();
  const h=location.hash.replace(/^#\/?/,'').split('/');
  window.ATKplayer&&ATKplayer.close(false);
  if(h[0]==='k') pageCourse(h[1]);
  else if(h[0]==='u') pageUnit(h[1],+h[2]);
  else if(h[0]==='b'){ pageUnit(h[1],+h[2]); window.ATKplayer&&ATKplayer.open(h[1],+h[2],+h[3]); return; }
  else if(h[0]==='tt'||h[0]==='pd'){ pageUnit(h[1],+h[2]);
    if(ATK.enManh.active(h[1],+h[2]) && ATK.prog.get(h[1]+'/'+h[2]+'/'+h[3])>0) window.ATKplayer&&ATKplayer.extra(h[0],h[1],+h[2],+h[3]);
    return; }
  else if(h[0]==='gui-co') pageGuiCo();
  else if(h[0]==='hop-on') pageHop();
  else if(h[0]==='ba-me') ATKpages.baMe();
  else if(h[0]==='lop') ATKpages.lop();
  else if(h[0]==='suu-tap') ATKpages.suuTap();
  else if(h[0]==='moi') ATKpages.moi();
  else if(h[0]==='khung') pageKhung();
  else if(h[0]==='bang') pageBang(h[1],h[2]);
  else pageHome();
  window.scrollTo(0,0); view.focus({preventScroll:true});
}
ATK.course=course;
window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',route);
})();
