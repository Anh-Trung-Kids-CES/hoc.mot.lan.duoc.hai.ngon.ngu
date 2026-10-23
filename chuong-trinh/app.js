/* Anh – Trung – Kids · trang chương trình (bản đồ 9 khóa + bài tự học)
   Trang này độc lập với web 21 ngày: chỉ đọc tranh và giọng đọc ở ../xem-truoc/tai-nguyen/, không ghi gì vào đó. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const view=$('#view');
const ATK={data:null,lessons:{}};
window.ATK=ATK;

/* ---------- lưu trên máy (tiến độ, Hộp ôn) ---------- */
const store={
  get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};
const KEY={prog:'atk-tien-do',hop:'atk-hop-on',seen:'atk-da-gap',name:'atk-ten-con'};
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

/* ---------- dữ liệu ---------- */
async function load(){
  if(ATK.data) return ATK.data;
  const r=await fetch('data/chuong-trinh.json'); ATK.data=await r.json(); return ATK.data;
}
ATK.lesson=async function(cid,u){
  const k=cid+'-u'+u;
  if(!ATK.lessons[k]){ const r=await fetch('data/bai/'+k+'.json'); ATK.lessons[k]=await r.json(); }
  return ATK.lessons[k];
};
const course=id=>ATK.data.courses.find(c=>c.id===id);
const WEBNAME=['','Bài 1','Bài 2','Bài 3','Bài 4','Bài 5','Bài 6'];
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
      <p class="lead">Lộ trình 9 khóa song ngữ Anh – Trung cho trẻ 4–10 tuổi, đi từ chưa biết ngoại ngữ đến Cambridge Flyers và YCT4. Mỗi unit học 2 tuần: 4 buổi trên lớp và 6 bài tự học trên web.</p>
      <form class="who" id="who"><label class="sr" for="ten">Tên của con</label>
        <input id="ten" placeholder="Tên của con (lưu trên máy này)" value="${esc(name)}" autocomplete="off">
        <button>Lưu</button></form>
    </div>
    <div class="kids">${kids.map(p=>`<img src="${esc(p[1])}" alt="${esc(p[0])}">`).join('')}</div>
  </section>
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
  $('#who').onsubmit=e=>{ e.preventDefault(); store.set(KEY.name,$('#ten').value.trim()); $('#who button').textContent='Đã lưu'; };
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
  ${c.units.length?`<h2>Các unit</h2>
  <p class="note">Unit có viền xanh đã có 6 bài tự học trên web. Các unit khác hiện đã có danh sách từ, bài web đang soạn.</p>
  <div class="units">${c.units.map(u=>`<a class="unit card ${u.web?'has':''}" href="#/u/${c.id}/${u.u}">
    <span class="un">UNIT ${u.u}</span><h3>${esc(u.name)}</h3>
    <span class="cnt"><span class="chip en">${u.en.length} từ Anh</span><span class="chip zh">${u.zh.length} từ Trung</span>${u.web?'<span class="chip web">6 bài web</span>':''}</span></a>`).join('')}</div>`
  :`<p class="lead">Khung từ vựng của ${esc(c.name)} đang được soạn.</p>`}`;
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
  ${U.web?`<p class="lead">6 bài tự học, mỗi bài ${esc(c.web_min)} phút. Bài 1–3 học từ mới, bài 4–6 ôn, nghe truyện và chuyển ngữ. Bài nào cũng mở đầu bằng phần Ôn nhanh từ cũ (từ unit thứ hai trở đi).</p>
  <div class="lessons" id="lessons"></div>`:`<p class="lead">Bài web của unit này đang soạn. Dưới đây là các từ con sẽ học.</p>`}
  <h2>Từ của unit</h2>
  <div class="words">
    <div class="wl card en"><h3>Tiếng Anh · ${U.en.length}</h3>${wlist(U.en,'')}</div>
    <div class="wl card zh"><h3>Tiếng Trung · ${U.zh.length}</h3>${wlist(U.zh,'')}</div>
  </div>
  <p class="note">Nhãn nhỏ: lõi (con nói được, có trong bài kiểm tra) · cụm (cụm từ, câu mẫu) · mở rộng (con nghe hiểu, gặp trong câu và truyện) · chức năng (đi theo mẫu câu).</p>`;
  if(U.web){
    ATK.lesson(c.id,U.u).then(L=>{
      $('#lessons').innerHTML=L.webs.map(w=>{
        const k=c.id+'/'+U.u+'/'+w.n, st=ATK.prog.get(k);
        const ics=[...new Set(w.acts.map(a=>WEBIC[a.t]).filter(Boolean))].slice(0,5).map(x=>`<span>${x}</span>`).join('');
        return `<a class="lesson ${st?'done':''}" href="#/b/${k}"><span class="ic" aria-hidden="true">${ics}</span><b>${WEBNAME[w.n]}</b>
          <span class="st" aria-label="${st} sao">${'★'.repeat(st)}${'☆'.repeat(3-st)}</span></a>`;}).join('');
    });
  }
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
function pageGuide(){
  setNav('bame');
  view.innerHTML=`<div class="prose"><h1>Dành cho ba mẹ và thầy cô</h1>
  <p class="lead">Trang này là bản đồ của chương trình Anh – Trung – Kids và nơi con làm bài tự học. Trang chạy riêng, không liên quan đến web Thử thách 21 ngày.</p>
  <h2>Mỗi unit con học thế nào</h2>
  <ul>
    <li>Một unit kéo dài 2 tuần: 4 buổi trên lớp và 6 bài web, xen nhau (Bài 1 → Buổi 1 → Bài 2 → Buổi 2 → Bài 3 → Bài 4 → Buổi 3 → Bài 5 → Buổi 4 → Bài 6).</li>
    <li>Mỗi bài web không quá 30 phút: Little Seed, Seedling 10–15 phút; Canopy, Larva 15–20 phút.</li>
    <li>Bài 1–3 giới thiệu từ mới; bài 4–6 ôn không có hình mẫu, nghe truyện, chuyển ngữ và Hộp ôn.</li>
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
    <li>Bài tự học: Little Seed Unit 1–3 và Canopy Unit 5–7, dùng tranh và giọng đọc đã thu. Các unit khác đang soạn.</li>
    <li>Tiến độ và Hộp ôn lưu trên máy con đang dùng.</li>
  </ul>
  <p class="note">Thầy cô có thể mở mọi bài để xem trước; không có bài nào bị khóa.</p></div>`;
}

/* ---------- định tuyến ---------- */
async function route(){
  await load();
  const h=location.hash.replace(/^#\/?/,'').split('/');
  window.ATKplayer&&ATKplayer.close(false);
  if(h[0]==='k') pageCourse(h[1]);
  else if(h[0]==='u') pageUnit(h[1],+h[2]);
  else if(h[0]==='b'){ pageUnit(h[1],+h[2]); window.ATKplayer&&ATKplayer.open(h[1],+h[2],+h[3]); return; }
  else if(h[0]==='hop-on') pageHop();
  else if(h[0]==='ba-me') pageGuide();
  else pageHome();
  window.scrollTo(0,0); view.focus({preventScroll:true});
}
ATK.course=course;
window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',route);
})();
