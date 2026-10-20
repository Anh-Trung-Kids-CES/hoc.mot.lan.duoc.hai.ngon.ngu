/* =====================================================================
   LITTLE SEED · 18 ngày tự học, 6 dạng bài (Xem và làm theo · Chạm đúng hình ·
   Nói theo · Anh hay Trung? · Đố con · Nhìn chữ), chỉ chạm và nói.
   Dữ liệu: ls-data.js (window.LS). Dùng chung tiện ích của index.html:
   st, save, addPoints, dayPoints, TEACHER, toast, sfx, esc, confetti, GROUPS, PER, head…
   ===================================================================== */
const LS_PTS = 4;     // điểm mỗi bước (5 bước)
const LS_STEP_ICON = {xem:'ls_o_xem', cham:'ls_o_cham_hinh', noi:'ls_o_noi_theo', at:'ls_o_anh_trung', do:'ls_o_do_con', nc:'ls_o_nhin_chu'};
const LS_TYPE_NAME = {xem:'Xem và làm theo', cham:'Chạm đúng hình', noi:'Nói theo', at:'Anh hay Trung?', do:'Đố con', nc:'Nhìn chữ'};
const LS_FACE = {
  co_huou:'tai-nguyen/nhan-vat/huou_huou1_a.webp', bong:'tai-nguyen/nhan-vat/kids_bong_a.webp', anna:'tai-nguyen/nhan-vat/kids_anna_a.webp',
  tho_con:'tai-nguyen/nhan-vat/huou_tho_a.webp', gau_con:'tai-nguyen/nhan-vat/huou_gau_a.webp',
  me:'tai-nguyen/nhan-vat/fam_bong_me_a.webp', bo:'tai-nguyen/nhan-vat/fam_bong_bo_a.webp'
};
const LS_WHO = {co_huou:'Cô Hươu', bong:'Bông', anna:'Anna', tho_con:'Thỏ con', gau_con:'Gấu con', me:'Mẹ', bo:'Bố'};

/* ---------- 3 buổi học trực tuyến (ngày 7, 14, 21) ---------- */
const LS_ZOOM=[
 {zoom:true, t:'Lớp học trực tuyến: Chào hỏi', about:'Buổi học trực tuyến cùng cô giáo: con chào cô và các bạn bằng tiếng Anh và tiếng Trung, rồi cùng cô diễn lại truyện “Một ngày của Bông”.',
  prep:['9 từ: hello, goodbye, mommy, daddy, kitten, teacher, everyone, friend, puppy','Câu chào trong truyện: Hello, teacher! – 老师好！ · Goodbye, mommy! – 妈妈，再见！','Cho con xem lại truyện “Một ngày của Bông” một lần']},
 {zoom:true, t:'Lớp học trực tuyến: Giới thiệu bản thân', about:'Buổi học trực tuyến cùng cô giáo: con chào, nói tên và tuổi của mình, đếm từ 1 đến 6, rồi cùng cô diễn lại truyện “Sinh nhật của Bông”.',
  prep:['Đếm one – six · 一 – 六','My name is … · 我叫……','How old are you? I’m … · 你几岁？我……岁']},
 {zoom:true, t:'Lớp học trực tuyến: Gia đình', about:'Buổi học trực tuyến cùng cô giáo: con giới thiệu 2–3 người trong gia đình mình, rồi cùng cô diễn lại truyện “Album ảnh nhà Bông”. Cô chỉ vào tranh và hỏi Who is he? / 他是谁？',
  prep:['Ông, bà, anh trai, em gái, chị gái, em trai bằng hai thứ tiếng','He is my … · 他是我…… · She is my … · 她是我……','Con vẽ hoặc chọn một ảnh gia đình để mang tới buổi học']}
];
/* ---------- dựng 21 ngày từ dữ liệu ---------- */
function lsDays(zooms){
  const L=window.LS; if(!L) return [];
  const out=[];
  for(let i=0;i<21;i++){
    if(i%7===6){ out.push(LS_ZOOM[(i-6)/7]); continue; }
    const D=L.days.find(d=>d.n===i+1);
    out.push({t:D.t, ls:D, r:D.r});
  }
  return out;
}
function lsState(g,i){ const s=st(g,i); s.ls=s.ls||{}; return s; }
function lsDayPoints(s,d){ if(!s) return 0; const m=s.ls||{}; return d.ls.steps.reduce((a,_,k)=>a+(k in m?LS_PTS:0),0)+(s.done?PTS.done:0); }
function lsOpen(g,i,k){ if(TEACHER) return true; const s=lsState(g,i); for(let j=0;j<k;j++) if(!(j in s.ls)) return false; return true; }

/* ---------- âm thanh ---------- */
let lsRun=0, lsSid=0, lsAudio=null, lsPend=null;
function lsRelease(){ if(lsPend){ const p=lsPend; lsPend=null; p(); } }
function lsStop(){ lsRun++; try{ speechSynthesis.cancel(); }catch(e){} if(lsAudio){ try{ lsAudio.onended=null; lsAudio.onerror=null; lsAudio.pause(); }catch(e){} lsAudio=null; } lsRelease(); }
function lsEnd(){ lsStop(); lsSid++; }
function lsTTS(text, lang){
  return new Promise(res=>{
    let done=false; const fin=()=>{ if(!done){ done=true; res(); } };
    try{
      if(!('speechSynthesis' in window)){ setTimeout(fin,700); return; }
      const t=String(text||'').replace(/…+|_+/g,' ').trim(); if(!t){ fin(); return; }
      const L={en:'en-US',zh:'zh-CN',vi:'vi-VN'}[lang]||'en-US';
      const u=new SpeechSynthesisUtterance(t); u.lang=L; u.rate=lang==='vi'?1:.8;
      const v=voices.find(v=>v.lang.replace('_','-').toLowerCase()===L.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(L.slice(0,2)));
      if(v) u.voice=v; else if(lang==='vi'){ setTimeout(fin,600); return; }
      u.onend=fin; u.onerror=fin; speechSynthesis.cancel(); speechSynthesis.speak(u); setTimeout(fin, 1800+t.length*200);
    }catch(e){ setTimeout(fin,600); }
  });
}
/* phát 1 lời {t,l,a}: ưu tiên file thu sẵn, thiếu thì giọng máy */
function lsPlay(u){
  if(!u) return Promise.resolve();
  if(window.LS_FAST){ (window.LS_LOG=window.LS_LOG||[]).push(u); return new Promise(r=>setTimeout(r,5)); }
  if(MUTE) return new Promise(r=>setTimeout(r,500));
  lsRelease();
  const my=lsSid;
  return new Promise(res0=>{
    let settled=false; const res=()=>{ if(settled) return; settled=true; if(lsPend===res) lsPend=null; res0(); };
    lsPend=res;
    const tts=()=>{ if(my!==lsRun) return res(); lsTTS(u.t,u.l).then(res); };
    if(!u.a) return tts();
    try{ speechSynthesis.cancel(); }catch(e){}
    if(lsAudio){ try{ lsAudio.onended=null; lsAudio.onerror=null; lsAudio.pause(); }catch(e){} }
    const a=new Audio(u.a); lsAudio=a; let fell=false;
    const fb=()=>{ if(fell) return; fell=true; tts(); };
    a.onended=()=>{ if(!fell){ fell=true; res(); } }; a.onerror=fb;
    a.play().catch(fb);
    setTimeout(()=>{ if(!fell && a.paused && a.currentTime===0) fb(); }, 6000);
  });
}
async function lsSeq(list, gap, onstep){ const my=lsRun; for(let k=0;k<list.length;k++){ if(my!==lsRun) return; onstep&&onstep(k); await lsPlay(list[k]); await lsWait(gap||350); } }
function lsHD(text){ const L=window.LS; return lsPlay({t:text, l:'vi', a:(L.hd&&L.hd[text])||''}); }
function lsWait(ms){ return new Promise(r=>setTimeout(r, window.LS_FAST?5:REDUCED?Math.min(ms,300):ms)); }
function lsAlive(my){ return my===lsSid && !!document.getElementById('lsBox'); }

/* ---------- khung giao diện một bước ---------- */
function lsPic(src, cls, alt){ return src?`<img class="ls-pic ${cls||''}" src="${esc(src)}" alt="${esc(alt||'')}" loading="lazy" draggable="false">`:`<span class="ls-pic ${cls||''} ph">🖼️</span>`; }
function lsBub(u, cls){ if(!u) return ''; const zh=u.l==='zh'; const w=u.w&&u.w!=='co_huou'&&LS_WHO[u.w]?` · ${LS_WHO[u.w]}`:''; return `<span class="ls-bub ${u.l} ${cls||''}"><i>${u.l==='both'?'EN · 中文':zh?'中文':'EN'}${w}</i><b class="${zh?'zh':''}">${esc(u.t)}</b></span>`; }
function lsFace(w){ return LS_FACE[w]?`<img class="ls-face" src="${LS_FACE[w]}" alt="${esc(LS_WHO[w]||'')}">`:''; }
const LS_SVG = {
  spk:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  redo:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  mic:'<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  star:'<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC93C" stroke="#E0A400" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  gift:'<svg viewBox="0 0 64 64" width="78" height="78" aria-hidden="true"><rect x="8" y="26" width="48" height="32" rx="5" fill="rgba(255,255,255,.3)"/><rect x="4" y="16" width="56" height="12" rx="4" fill="rgba(255,255,255,.45)"/><rect x="28" y="16" width="8" height="42" fill="rgba(255,255,255,.8)"/><path d="M32 16 C24 4 14 8 20 14 C23 17 32 16 32 16 Z M32 16 C40 4 50 8 44 14 C41 17 32 16 32 16 Z" fill="rgba(255,255,255,.9)"/></svg>'
};
let LSX = null;   // bước đang chơi: {g,i,k,step,stars,replay}
function lsFrame(box, step, total){
  box.innerHTML=`<div class="ls-stage">
    <div class="ls-top"><div><b>${esc(LS_TYPE_NAME[step.type])}</b><small>${esc(step.step)}</small></div>
      <div class="ls-dots" id="lsDots"></div><div class="ls-stars">${LS_SVG.star}<span id="lsStars">0</span></div></div>
    <div class="ls-body" id="lsBody"></div>
    <div class="ls-bot"><button class="ls-b dark" id="lsReplay">${LS_SVG.spk}<span>Nghe lại</span></button>
      <div class="ls-cap" id="lsCap"></div>
      <button class="ls-b" id="lsRedo">${LS_SVG.redo}<span>Làm lại</span></button></div></div>`;
  box.querySelector('#lsReplay').onclick=()=>{ sfx.pop(); LSX.replay&&LSX.replay(); };
  box.querySelector('#lsRedo').onclick=()=>{ sfx.pop(); lsStartStep(); };
  return box.querySelector('#lsBody');
}
function lsDots(i,n){ const el=document.getElementById('lsDots'); if(!el) return; el.innerHTML=Array.from({length:n},(_,k)=>`<span class="${k<i?'ok':k===i?'now':''}"></span>`).join(''); }
function lsStar(n){ LSX.stars+=n||1; const el=document.getElementById('lsStars'); if(el){ el.textContent=LSX.stars; el.parentNode.classList.remove('bump'); void el.offsetWidth; el.parentNode.classList.add('bump'); } }
function lsCap(t){ const el=document.getElementById('lsCap'); if(el) el.textContent=t||''; }
function lsShake(el){ if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function lsPop(el){ if(!el) return; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

/* ---------- MÀN HÌNH NGÀY ---------- */
function viewSeedDay(g,i,sub){
  const day=GROUPS[g].days[i], D=day.ls, s=lsState(g,i);
  const k = sub && /^b\d+$/.test(sub) ? +sub.slice(1)-1 : -1;
  if(k>=0 && D.steps[k]){
    if(!lsOpen(g,i,k)){ toast('Con làm xong bước trước để mở bước này nhé! 🔒'); location.hash=`#/g/${g}/${i+1}`; return; }
    return lsPlayStep(g,i,k);
  }
  const R=window.LS.rounds[D.r-1], doneN=D.steps.filter((_,j)=>j in s.ls).length;
  app.innerHTML=`<div class="wrap ls-wrap">
    <div class="ls-banner" style="background-image:url('${esc(R.banner)}')"><div class="ls-bt">
      <span class="ls-kick">${esc(ROUNDS[D.r-1].vi)} · ${esc(R.topic)} · Ngày ${i+1}</span>
      <h2>${esc(D.t)}</h2>
      <button class="ls-goal" id="lsGoal">${LS_SVG.spk}<span><small>Sau hôm nay con có thể</small>${esc(D.goal)}</span></button></div></div>
    <div class="ls-prog"><i style="width:${doneN/5*100}%"></i></div>
    <div class="ls-tiles">${D.steps.map((st_,j)=>{ const open=lsOpen(g,i,j), done=j in s.ls;
      return `<button class="ls-tile ${done?'done':''} ${open?'':'lock'}" data-j="${j}" style="--d:${j*.05}s">
        <span class="ls-tim"><img src="${esc(window.LS.page[LS_STEP_ICON[st_.type]])}" alt="" loading="lazy">${done?'<em>✓</em>':open?'':'<em class="lk">🔒</em>'}</span>
        <span class="ls-ttx"><small>Bước ${j+1} · ${esc(st_.step)}</small><b>${esc(LS_TYPE_NAME[st_.type])}</b>${done?`<span class="ls-got">${LS_SVG.star} ${s.ls[j]} sao</span>`:''}</span></button>`; }).join('')}</div>
    <div class="ls-parent"><b>Ba mẹ đồng hành:</b> bật bài cho con đúng giờ · khen con khi con đang làm bài · khen con khi con xong bài và nhận sao. Không ép nói, không sửa lỗi, không so sánh.</div>
    <div id="lsDone"></div>
    <div class="row"><a class="btn y" href="#/g/${g}">← Về bản đồ</a></div></div>`;
  document.getElementById('lsGoal').onclick=()=>{ lsStop(); lsPlay({t:'Hôm nay con học: '+D.goal, l:'vi', a:D.goal_a}); };
  app.querySelectorAll('.ls-tile').forEach(b=>b.onclick=()=>{
    if(b.classList.contains('lock')){ sfx.no(); toast('Con làm xong bước trước để mở bước này nhé! 🔒'); return; }
    sfx.pop(); location.hash=`#/g/${g}/${i+1}/b${+b.dataset.j+1}`;
  });
  if(doneN===5) lsDayDone(g,i,document.getElementById('lsDone'));
  window.scrollTo({top:0});
}
function lsDayDone(g,i,panel){
  const s=lsState(g,i);
  const total=Object.values(s.ls).reduce((a,b)=>a+b,0);
  const more=`<div class="row"><a class="btn y" href="#/g/${g}/them/${Math.floor(i/7)+1}">🧭 Con muốn xem thêm, chơi thêm</a></div>`;
  if(s.done){ const d=document.createElement('div'); d.className='panel'; panel.appendChild(d); showDone(d,false); panel.insertAdjacentHTML('beforeend',more); return; }
  panel.innerHTML=`<div class="panel ls-praise"><img src="${esc(window.LS.page.ls_man_khen)}" alt="" class="ls-praise-img">
    <h3>Tuyệt vời! Con đã học xong hôm nay rồi!</h3><p>Con được <b>${total} sao</b>. Ba mẹ khen con một câu thật to nhé!</p>
    <div class="row"><button class="btn g" id="lsFin">⭐ Nhận sao và mở ngày mai</button></div></div>`;
  lsHD('Tuyệt vời! Con đã học xong hôm nay rồi!');
  panel.querySelector('#lsFin').onclick=e=>{ const before=dayPoints(g,i); s.done=true; addPoints(g,i,before,e.currentTarget); panel.innerHTML='<div class="panel" id="lsdp"></div>'+more; showDone(document.getElementById('lsdp'),true); lsHD('Hẹn gặp con ngày mai nhé!'); };
}

/* ---------- chơi một bước ---------- */
function lsPlayStep(g,i,k){
  const D=GROUPS[g].days[i].ls, step=D.steps[k];
  app.innerHTML=`<div class="wrap ls-wrap">${head(g,i)}<div id="lsBox"></div>
    <div class="row"><a class="btn y" href="#/g/${g}/${i+1}">← Các bước của ngày ${i+1}</a></div></div>`;
  LSX={g,i,k,step,stars:0,replay:null};
  lsStartStep();
  window.scrollTo({top:0});
}
function lsStartStep(){
  lsStop(); lsSid++; LSX.stars=0;
  const box=document.getElementById('lsBox'), body=lsFrame(box, LSX.step);
  ({xem:lsXem, cham:lsCham, noi:lsNoi, at:lsAT, do:lsDo, nc:lsNC})[LSX.step.type](LSX.step, body);
}
function lsFinish(){
  const {g,i,k}=LSX, s=lsState(g,i), D=GROUPS[g].days[i].ls;
  const before=dayPoints(g,i), stars=Math.max(1,LSX.stars);
  s.ls[k]=Math.max(s.ls[k]||0, stars); addPoints(g,i,before,document.getElementById('lsStars'));
  const body=document.getElementById('lsBody'), nx=k+1<D.steps.length;
  lsCap('');
  body.innerHTML=`<div class="ls-done"><div class="ls-bigstar">${LS_SVG.star}</div><b>Giỏi quá!</b><span>Con được ${stars} sao.</span>
    <div class="row">${nx?`<a class="btn g" href="#/g/${g}/${i+1}/b${k+2}">Bước ${k+2}: ${esc(LS_TYPE_NAME[D.steps[k+1].type])} →</a>`:`<a class="btn g" href="#/g/${g}/${i+1}">⭐ Xong cả 5 bước!</a>`}
    <button class="btn y" id="lsAgain">Chơi lại</button></div></div>`;
  body.querySelector('#lsAgain').onclick=()=>lsStartStep();
  LSX.replay=null; sfx.win(); confetti(18);
  lsHD('Con được thêm một ngôi sao!');
}

/* ---------- 1. XEM VÀ LÀM THEO ---------- */
function lsXem(step, body){
  const parts=step.parts; let p=0; const my=lsSid;
  const ord=['Xem lần 1','Xem lần 2'];
  const extra=step.extra&&step.extra.length?`<div class="ls-extra"><b>Xem thêm (không bắt buộc):</b>${step.extra.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">▶ ${esc(x.label)}</a>`).join('')}</div>`:'';
  function show(){
    if(!lsAlive(my)) return;
    lsDots(p,parts.length);
    if(p>=parts.length){ lsStar(); return lsFinish(); }
    const P=parts[p], lang=P.l==='zh'?'tiếng Trung':'tiếng Anh';
    if(P.kind==='video'){
      const src=P.url.replace(/\/view.*$/,'/preview');
      body.innerHTML=`<div class="ls-xem ${P.l}"><div class="ls-xh"><span class="ls-tag ${P.l}">${ord[p]} · ${lang}</span><span>${esc(P.label)}</span></div>
        <div class="ls-vid"><iframe src="${esc(src)}" allow="autoplay; fullscreen" allowfullscreen title="Video ${esc(P.label)}"></iframe></div>
        <p class="ls-hint">Con xem và làm theo bạn nhé: vẫy tay, chỉ, giơ ngón tay giống bạn trong video.</p>
        <div class="row"><button class="btn g" id="lsNx">${p===0?'Con xem xong rồi → Xem lần 2':'Con xem xong rồi ⭐'}</button></div>${extra}</div>`;
      body.querySelector('#lsNx').onclick=()=>{ sfx.ok(); p++; show(); };
      LSX.replay=()=>lsHD('Con xem và làm theo bạn nhé!');
      lsHD('Con xem và làm theo bạn nhé!');
    } else storyShow(P);
  }
  function storyShow(P){
    const S=window.LS.stories[P.r], lang=P.l==='zh'?'tiếng Trung':'tiếng Anh'; let c=0, playing=true;
    const draw=()=>{
      const sc=S.scenes[c], u=sc[P.l];
      body.innerHTML=`<div class="ls-xem ${P.l}"><div class="ls-xh"><span class="ls-tag ${P.l}">${ord[p]} · ${lang}</span><span>Truyện “${esc(S.title)}” · cảnh ${c+1}/8</span></div>
        <div class="ls-story">${lsPic(sc.img,'ls-scene')}<div class="ls-sline">${lsBub(u)}</div></div>
        <div class="row ls-snav"><button class="ls-b" id="sPrev" ${c===0?'disabled':''}>◀</button><button class="ls-b dark" id="sPlay">${playing?'⏸ Dừng':'▶ Nghe tiếp'}</button><button class="ls-b" id="sNext">${c===7?'Xong ✓':'▶▶'}</button></div>${extra}</div>`;
      body.querySelector('#sPrev').onclick=()=>{ if(c>0){ lsStop(); c--; playing=false; draw(); lsPlay(S.scenes[c][P.l]); } };
      body.querySelector('#sNext').onclick=()=>{ lsStop(); if(c<7){ c++; playing=false; draw(); lsPlay(S.scenes[c][P.l]); } else end(); };
      body.querySelector('#sPlay').onclick=()=>{ playing=!playing; if(playing) auto(); else lsStop(); draw(); };
    };
    const end=()=>{ lsStop(); body.innerHTML=`<div class="ls-done"><b>Hết truyện!</b><span>${p===0?'Mình xem lần 2 bằng '+(P.l==='en'?'tiếng Trung':'tiếng Anh')+' nhé.':'Con xem đủ 2 lần rồi!'}</span><div class="row"><button class="btn g" id="lsNx">${p===0?'Xem lần 2 →':'Xong ⭐'}</button></div></div>`;
      body.querySelector('#lsNx').onclick=()=>{ sfx.ok(); p++; show(); }; };
    async function auto(){
      const me=++lsRun;
      if(c===0){ await lsHD('Mình cùng nghe truyện nhé!'); if(me!==lsRun) return; await lsPlay({t:'Câu chuyện: '+S.title, l:'vi', a:S.title_a}); }
      while(me===lsRun && c<8){ draw(); lsCap((P.l==='zh'?'ZH: ':'EN: ')+S.scenes[c][P.l].t); await lsPlay(S.scenes[c][P.l]); if(me!==lsRun) return; await lsWait(900); if(me!==lsRun) return; if(c===7) return end(); c++; }
    }
    LSX.replay=()=>{ lsStop(); lsPlay(S.scenes[c][P.l]); };
    draw(); auto();
  }
  show();
}

/* ---------- 2. CHẠM ĐÚNG HÌNH ---------- */
function lsCham(step, body){
  const my=lsSid; const qs=step.qs; let qi=0, busy=false;
  async function demo(){
    for(let d=0; d<step.demo.length; d++){
      if(!lsAlive(my)) return;
      const it=step.demo[d];
      body.innerHTML=`<div class="ls-demo"><span class="ls-lab">Làm mẫu · lượt 1${step.demo.length>1?` · ${d+1}/${step.demo.length}`:''}</span>
        <div class="ls-dpic pop">${lsPic(it.pic,'')}</div>
        <div class="ls-chips">${it.seq.map(u=>lsBub(u,'sm')).join('')}${it.move?`<span class="ls-move">Động tác: ${esc(it.move)}</span>`:''}</div>
        <button class="ls-b" id="skip">Bỏ qua mẫu ▶▶</button></div>`;
      body.querySelector('#skip').onclick=()=>{ lsStop(); LSX.skip=true; ask0(); };
      LSX.replay=()=>{ lsStop(); lsSeq(it.seq); };
      lsCap(it.move?'Con làm động tác: '+it.move:'Con nghe lời thoại nhé');
      await lsSeq(it.seq, 500, k=>{ body.querySelectorAll('.ls-chips .ls-bub').forEach((b,j)=>b.classList.toggle('talk',j===k)); });
      if(!lsAlive(my)) return; await lsWait(600);
    }
    if(lsAlive(my)) ask0();
  }
  async function ask0(){ const me=lsSid; await lsHD('Con nghe và chạm vào tranh đúng nhé!'); if(me===lsSid) ask(); }
  function ask(){
    lsDots(qi,qs.length);
    if(qi>=qs.length) return lsFinish();
    const q=qs[qi];
    body.innerHTML=`<div class="ls-ask"><span class="ls-lab">Câu ${qi+1}/${qs.length} · nghe ${q.say[0].l==='zh'?'tiếng Trung':'tiếng Anh'}</span>
      <div class="ls-opts">${q.opts.map((o,n)=>`<button class="ls-opt" data-n="${n}" aria-label="Tranh ${n+1}">${lsPic(o,'')}</button>`).join('')}</div></div>`;
    const say=()=>{ lsStop(); lsCap('Con nghe nhé…'); return lsSeq(q.say,250); };
    LSX.replay=say; say();
    body.querySelectorAll('.ls-opt').forEach(b=>b.onclick=async()=>{
      if(busy) return; const n=+b.dataset.n;
      if(n===q.ans){
        busy=true; lsStop(); sfx.ok(); b.classList.add('right'); lsPop(b); lsStar();
        if(q.then){ lsCap((q.then.l==='zh'?'Tiếng Trung: ':'Tiếng Anh: ')+q.then.t); await lsWait(300); await lsPlay(q.then); }
        await lsWait(600); busy=false; qi++; ask();
      } else { sfx.no(); lsShake(b); const me=lsSid; await lsHD('Con nghe lại nhé.'); if(me===lsSid) say(); }
    });
  }
  if(step.demo.length) demo(); else ask0();
}

/* ---------- 3. NÓI THEO (cả đóng vai) ---------- */
function lsNoi(step, body){
  const my=lsSid, T=step.turns; let ti=0;
  async function micCount(el){
    for(let s=3;s>=1;s--){ if(!lsAlive(my)) return false; el.querySelector('b').textContent=s; await lsWait(1000); }
    return lsAlive(my);
  }
  async function turn(){
    if(!lsAlive(my)) return;
    lsDots(ti,T.length);
    if(ti>=T.length) return lsFinish();
    const t=T[ti], who=t.who||(t.say[0]&&t.say[0].who);
    body.innerHTML=`<div class="ls-noi"><div class="ls-npic">${lsPic(t.pic,'')}</div>
      <div class="ls-nside">${t.note?`<span class="ls-lab">${esc(t.note)}</span>`:''}${step.role?'<span class="ls-lab">Đóng vai · nghe mẫu trước</span>':''}
        <div class="ls-says">${t.say.map(u=>lsBub(u)).join('')}</div>
        <div class="ls-mic idle" id="mic">${LS_SVG.mic}<b></b></div>
        <div class="ls-mytxt" id="myt">${t.mic?`Con nói: ${lsBub(t.mic,'sm')}`:'<span class="ls-lab">Con nghe nhé (chưa cần nói)</span>'}</div>
        <button class="ls-b" id="nx" hidden>Tiếp ▶</button></div></div>`;
    const mic=body.querySelector('#mic'), nx=body.querySelector('#nx');
    nx.onclick=()=>{ lsStop(); ti++; turn(); };
    LSX.replay=()=>{ lsStop(); lsSeq(t.say); };
    lsCap(t.say.map(u=>u.t).join(' · '));
    await lsSeq(t.say, 400, k=>body.querySelectorAll('.ls-says .ls-bub').forEach((b,j)=>b.classList.toggle('talk',j===k)));
    if(!lsAlive(my)) return;
    if(t.mic){
      if(step.role){ await lsHD('Đến lượt con!'); if(!lsAlive(my)) return; if(t.ask){ await lsPlay(t.ask); if(!lsAlive(my)) return; } }
      mic.classList.remove('idle'); mic.classList.add('on'); sfx.pop();
      const ok=await micCount(mic); if(!ok) return;
      mic.classList.remove('on'); mic.classList.add('ok'); mic.querySelector('b').textContent='✓'; sfx.ok(); lsStar();
      await lsHD('Giỏi quá!'); if(!lsAlive(my)) return;
      if(t.after&&t.after.length){ await lsSeq(t.after); if(!lsAlive(my)) return; }
    } else { mic.classList.add('off'); lsStar(); }
    nx.hidden=false; await lsWait(1200); if(lsAlive(my)){ ti++; turn(); }
  }
  (async()=>{ await lsHD('Con nghe rồi nói theo bạn nhé!'); if(lsAlive(my)) turn(); })();
}

/* ---------- 4. ANH HAY TRUNG? ---------- */
function lsAT(step, body){
  const my=lsSid, Q=step.qs; let qi=0, busy=false;
  body.innerHTML=`<div class="ls-at"><button class="ls-box en" data-l="en"><b>ABC</b><span>Tiếng Anh</span><div class="ls-pile" id="pen"></div></button>
    <img class="ls-deer" src="${LS_FACE.co_huou}" alt="Cô Hươu">
    <button class="ls-box zh" data-l="zh"><b class="zh">中文</b><span>Tiếng Trung</span><div class="ls-pile" id="pzh"></div></button></div>`;
  const ask=()=>{ lsDots(qi,Q.length); if(qi>=Q.length) return lsFinish(); lsStop(); lsCap('Con nghe nhé…'); lsPlay(Q[qi]); };
  LSX.replay=ask;
  body.querySelectorAll('.ls-box').forEach(b=>b.onclick=async()=>{
    if(busy||qi>=Q.length) return; const q=Q[qi];
    if(b.dataset.l===q.l){
      busy=true; sfx.ok(); lsPop(b); lsStar();
      const card=document.createElement('span'); card.className='ls-card '+q.l; card.textContent=q.t; b.querySelector('.ls-pile').appendChild(card);
      lsCap((q.l==='zh'?'Đúng rồi, tiếng Trung: ':'Đúng rồi, tiếng Anh: ')+q.t);
      await lsWait(900); busy=false; qi++; ask();
    } else { sfx.no(); lsShake(b); const me=lsSid; await lsHD('Con nghe lại nhé.'); if(me===lsSid) lsPlay(q); }
  });
  (async()=>{ await lsHD('Tiếng Anh hay tiếng Trung? Con chạm ô xanh nếu là tiếng Anh, ô đỏ nếu là tiếng Trung nhé!'); if(lsAlive(my)) ask(); })();
}

/* ---------- 5. ĐỐ CON (cả Phiên dịch nhí) ---------- */
function lsDo(step, body){
  const my=lsSid, C=step.cards, opened=new Set();
  const COL=[['#ff8a3d','#d0631c'],['#2fa37a','#1e7a59'],['#9b6bd6','#7347ad'],['#2f6fd6','#1f4f9e'],['#e04f5f','#ad2f3e'],['#e0a400','#ad7f00'],['#1fa5a0','#16807c'],['#f06aa0','#c24b7d']];
  function boxes(){
    lsDots(opened.size,C.length);
    if(opened.size>=C.length) return lsFinish();
    body.innerHTML=`<div class="ls-do"><span class="ls-lab">${step.pd?'Phiên dịch nhí · ':''}Con chọn một hộp quà nhé!</span>
      <div class="ls-gifts" style="--n:${C.length>6?4:3}">${C.map((c,n)=>`<button class="ls-gift ${opened.has(n)?'used':''}" data-n="${n}" ${opened.has(n)?'disabled':''} style="--c:${COL[n%8][0]};--e:${COL[n%8][1]}">${LS_SVG.gift}<b>${n+1}</b></button>`).join('')}</div></div>`;
    LSX.replay=()=>lsHD('Con nghe rồi thử nói bằng tiếng kia nhé!');
    body.querySelectorAll('.ls-gift').forEach(b=>b.onclick=()=>{ sfx.ok(); open(+b.dataset.n); });
  }
  async function open(n){
    lsStop(); const me=lsSid, c=C[n], to=c.a.l;
    body.innerHTML=`<div class="ls-dop"><div class="ls-npic pop">${lsPic(c.pic,'')}</div>
      <div class="ls-nside"><div class="ls-says">${lsBub(c.q)}</div>
      <div class="ls-timer" id="tm"><b>?</b></div><div class="ls-says" id="ans"></div><div class="ls-lab" id="hint">Con nghe nhé…</div></div></div>`;
    const tm=body.querySelector('#tm'), hint=body.querySelector('#hint');
    LSX.replay=()=>{ lsStop(); lsPlay(c.q); };
    await lsWait(350); await lsPlay(c.q); if(me!==lsSid) return;
    const ask=to==='zh'?'Tiếng Trung nói thế nào nhỉ?':'Tiếng Anh nói thế nào nhỉ?';
    hint.textContent=ask; await lsHD(ask); if(me!==lsSid) return;
    tm.className='ls-timer think'; for(let s=3;s>=1;s--){ tm.querySelector('b').textContent=s; await lsWait(1000); if(me!==lsSid) return; }
    body.querySelector('#ans').innerHTML=lsBub(c.a); hint.textContent='Đáp án là…'; tm.className='ls-timer'; tm.querySelector('b').textContent='!';
    LSX.replay=()=>{ lsStop(); lsPlay(c.a); };
    await lsPlay(c.a); if(me!==lsSid) return;
    hint.textContent='Con nói theo nhé!'; tm.className='ls-timer rep'; sfx.pop();
    for(let s=3;s>=1;s--){ tm.querySelector('b').textContent=s; await lsWait(1000); if(me!==lsSid) return; }
    tm.className='ls-timer ok'; tm.querySelector('b').textContent='✓'; hint.textContent='Giỏi quá!'; sfx.ok(); lsStar(); opened.add(n);
    await lsHD('Giỏi quá!'); if(me!==lsSid) return; await lsWait(400); boxes();
  }
  (async()=>{ await lsHD('Con nghe rồi thử nói bằng tiếng kia nhé!'); })();
  boxes();
}

/* ---------- 6. NHÌN CHỮ ---------- */
function lsChu(c, big){ return `<span class="ls-chu ${c.l} ${big?'big':''}">${c.chu==='她'?'<span class="nu-hi">她</span>':esc(c.chu)}</span>`; }
function lsNC(step, body){
  const my=lsSid, C=step.cards;
  if(step.mode==='lq'){
    const taps=C.map(()=>0); let fin=false;
    const draw=()=>{
      body.innerHTML=`<div class="ls-nc"><span class="ls-lab">Chạm vào chữ: lần 1 nghe đọc, lần 2 chữ biến thành tranh</span>
        <div class="ls-ncards">${C.map((c,n)=>{ const t=taps[n], pic=t>=2&&t%2===0;
          return `<button class="ls-ncard ${c.l} ${t===1?'lit':''} ${t>=2?'got':''}" data-n="${n}">${pic?`<span class="ls-flip">${lsPic(c.pic,'')}${c.hint?`<img class="ls-hintimg" src="${esc(c.hint)}" alt="">`:''}</span>`:lsChu(c,true)}
            <span class="ls-ticks"><i class="${t>0?'on':''}"></i><i class="${t>1?'on':''}"></i></span></button>`; }).join('')}</div></div>`;
      body.querySelectorAll('.ls-ncard').forEach(b=>b.onclick=async()=>{
        const n=+b.dataset.n; taps[n]++; sfx.pop(); draw(); lsCap('Đọc: '+C[n].chu); lsStop(); await lsPlay({t:C[n].chu,l:C[n].l,a:C[n].a});
        if(!fin && taps.every(x=>x>=2)){ fin=true; await lsWait(700); lsStar(); lsFinish(); }
      });
      lsDots(taps.filter(x=>x>=2).length, C.length);
    };
    LSX.replay=()=>lsHD('Con chạm vào chữ để nghe đọc nhé!');
    draw(); lsHD('Con chạm vào chữ để nghe đọc nhé!');
    return;
  }
  // Tìm tranh cho chữ: chạm tranh nào cũng được xem đáp án và nhận sao
  const Q=step.qs; let qi=0, busy=false;
  const ask=()=>{
    lsDots(qi,Q.length); if(qi>=Q.length) return lsFinish();
    const q=Q[qi], c=C[q.card];
    body.innerHTML=`<div class="ls-tt"><div class="ls-ttcard ${c.l}">${lsChu(c,true)}${c.chu==='她'?'<small class="nu-tip">Có chữ <b>女</b> bên trái: chữ dành cho bạn nữ</small>':''}<button class="ls-b" id="spk">${LS_SVG.spk}</button></div>
      <div class="ls-opts">${q.opts.map((o,n)=>`<button class="ls-opt" data-n="${n}">${lsPic(o,'')}</button>`).join('')}</div></div>`;
    const play=()=>{ lsStop(); lsCap('Đọc: '+c.chu); return lsPlay({t:c.chu,l:c.l,a:c.a}); };
    body.querySelector('#spk').onclick=play; LSX.replay=play; play();
    body.querySelectorAll('.ls-opt').forEach(b=>b.onclick=async()=>{
      if(busy) return; busy=true; lsStop(); const n=+b.dataset.n;
      const right=body.querySelectorAll('.ls-opt')[q.ans]; right.classList.add('right'); lsPop(right); sfx.ok(); lsStar();
      if(n!==q.ans) await lsHD('Chữ này ở đây nè!');
      await play(); await lsWait(700); busy=false; qi++; ask();
    });
  };
  (async()=>{ await lsHD('Con nghe chữ rồi tìm tranh đúng nhé!'); if(lsAlive(my)) ask(); })();
}

/* ---------- GÓC KHÁM PHÁ THÊM (xem thêm, chơi cùng ba mẹ) – không mở ngày mới, không cộng điểm ---------- */
function viewXemThem(g, r){
  const X=window.XEM_THEM, G=GROUPS[g]; if(!X||!G||!X[g]||!X[g][r-1]) return viewGroup(g);
  const R=X[g][r-1];
  // ngày đã mở: Little Seed theo ngày chung, Canopy theo ngày trong vòng
  let reach=0; for(let i=0;i<21;i++) if(isUnlocked(g,i)) reach=i+1;
  const ok=it=> TEACHER || (g==='seed' ? it[2]<=reach : (r-1)*7+it[2]<=reach);
  const vids=R.v.filter(ok), games=R.g.filter(ok);
  const src=c=>c.startsWith('y:')?'https://www.youtube-nocookie.com/embed/'+c.slice(2)+'?rel=0&modestbranding=1':'https://drive.google.com/file/d/'+c.slice(2)+'/preview';
  const thumb=c=>c.startsWith('y:')?`https://i.ytimg.com/vi/${c.slice(2)}/mqdefault.jpg`:'';
  app.innerHTML=`<div class="wrap ls-wrap">
    <div class="ls-banner" style="background-image:url('${esc(G.banners[r-1])}')"><div class="ls-bt">
      <span class="ls-kick">${esc(G.name)} · ${esc(ROUNDS[r-1].vi)}</span><h2>Góc khám phá thêm</h2>
      <p class="xt-note">Con nào hứng thú thì khám phá thêm, không cần làm hết. Góc này không mở ngày mới và không tính điểm.</p></div></div>
    <h3 class="xt-h">▶ Xem thêm <small>${vids.length} video · viền xanh là tiếng Anh, viền đỏ là tiếng Trung</small></h3>
    <div class="xt-grid">${vids.map((it,n)=>`<button class="xt-v ${it[0]}" data-n="${n}">${thumb(it[3])?`<img src="${thumb(it[3])}" alt="" loading="lazy" onerror="this.outerHTML='<span class=xt-ph>▶</span>'">`:`<span class="xt-ph">▶</span>`}<b>${esc(it[1])}</b><small>${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'}</small></button>`).join('')||'<p>Con học thêm vài ngày để mở video mới nhé!</p>'}</div>
    <div id="xtPlay"></div>
    ${games.length?`<h3 class="xt-h">🎮 Chơi cùng ba mẹ <small>mở trang mới · ba mẹ ngồi cạnh con nhé</small></h3>
    <div class="xt-games">${games.map(it=>`<a class="xt-g ${it[0]}" href="${esc(it[3])}" target="_blank" rel="noopener"><b>${esc(it[1])}</b><small>${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'} ↗</small></a>`).join('')}</div>`:''}
    <div class="row"><a class="btn y" href="#/g/${g}">← Về bản đồ</a></div></div>`;
  app.querySelectorAll('.xt-v').forEach(b=>b.onclick=()=>{
    const it=vids[+b.dataset.n], box=document.getElementById('xtPlay');
    box.innerHTML=`<div class="ls-xem ${it[0]}"><div class="ls-xh"><span class="ls-tag ${it[0]}">${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'}</span><span>${esc(it[1])}</span></div>
      <div class="ls-vid"><iframe src="${esc(src(it[3]))}" allow="autoplay; fullscreen" allowfullscreen title="${esc(it[1])}"></iframe></div>
      <div class="row"><button class="btn y" id="xtClose">Đóng video</button></div></div>`;
    box.querySelector('#xtClose').onclick=()=>{ box.innerHTML=''; };
    box.scrollIntoView({behavior:'smooth', block:'center'});
  });
  window.scrollTo({top:0});
}
