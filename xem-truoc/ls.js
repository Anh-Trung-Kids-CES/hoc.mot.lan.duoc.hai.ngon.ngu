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
const LS_PARENT_HD = 'Ba mẹ đồng hành cùng con nhé: bật bài cho con đúng giờ, khen con khi con đang làm bài, và khen con khi con xong bài, nhận sao. Không ép nói, không sửa lỗi, không so sánh.';
/* Luật chơi từng dạng bài: hiện thành thẻ có hình + giọng đọc trước khi bắt đầu mỗi bước */
const LS_RULES = {
  xem:{h:'Xem và làm theo', lines:['Con xem video 2 lần: một lần bằng tiếng Anh, một lần bằng tiếng Trung.','Con vừa xem vừa làm động tác giống bạn trong video: vẫy tay, chỉ tay, giơ ngón tay.','Xem xong, con chạm nút xanh để xem bằng thứ tiếng còn lại.']},
  xems:{h:'Nghe truyện', lines:['Con nghe truyện 2 lần: một lần bằng tiếng Anh, một lần bằng tiếng Trung.','Truyện tự sang trang. Con chạm nút Dừng để nghỉ, nút mũi tên để xem lại trang trước.']},
  cham:{h:'Chạm đúng hình', lines:['Đầu tiên con xem bạn làm mẫu.','Sau đó con nghe cô đọc một từ hoặc một câu, rồi chạm vào tranh đúng.','Chạm đúng được 1 sao. Chưa đúng thì con nghe lại và chọn lại nhé.']},
  noi:{h:'Nói theo', lines:['Con nghe bạn trong tranh nói trước.','Khi cô nói "Đến lượt con", micro đỏ nhấp nháy là máy đang thu giọng con. Con nói to nhé!','Con nói xong, máy phát lại giọng con cho con nghe, rồi tự sang câu tiếp.']},
  at:{h:'Anh hay Trung?', lines:['Con nghe một câu.','Nếu là tiếng Anh, con chạm ô xanh ABC. Nếu là tiếng Trung, con chạm ô đỏ 中文.']},
  do:{h:'Đố con', lines:['Con chọn một hộp quà và nghe một câu bằng một thứ tiếng.','Con thử nói câu đó bằng thứ tiếng kia. Đếm 3 giây thì cô đọc đáp án.','Sau đó micro đỏ bật, con nói theo đáp án nhé.']},
  nc:{h:'Nhìn chữ', lines:['Con chạm vào chữ để nghe cô đọc.','Chạm thêm lần nữa, chữ biến thành tranh. Con chạm hết các chữ là xong.']},
  nct:{h:'Nhìn chữ', lines:['Con nghe cô đọc chữ, nhìn chữ thật kỹ.','Rồi con chạm vào tranh đúng với chữ đó.']}
};
function lsRuleKey(step){ if(step.type==='xem') return step.parts&&step.parts[0]&&step.parts[0].kind==='story'?'xems':'xem'; if(step.type==='nc') return step.mode==='lq'?'nc':'nct'; return step.type; }
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
let lsRun=0, lsSid=0, lsPend=null;
function lsRelease(){ if(lsPend){ const p=lsPend; lsPend=null; p(); } }
function lsStop(){ lsRun++; try{ speechSynthesis.cancel(); }catch(e){} voiceStop(); recAbort(); lsRelease(); }
function lsEnd(){ lsStop(); lsSid++; }
function lsTTS(text, lang){
  return new Promise(res=>{
    let done=false; const fin=()=>{ if(!done){ done=true; res(); } };
    try{
      if(!('speechSynthesis' in window)){ setTimeout(fin,700); return; }
      const t=String(text||'').replace(/…+|_+/g,' ').trim(); if(!t){ fin(); return; }
      if(lang==='vi' && !VI_MACHINE_VOICE){ setTimeout(fin,300); return; }   // tiếng Việt chỉ phát file giọng cô Hươu
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
  lsRelease();
  const my=lsRun;
  if(LS_PAUSED) return lsUntilResume().then(()=> my===lsRun ? lsPlay(u) : undefined);
  return new Promise(res0=>{
    let settled=false; const res=()=>{ if(settled) return; settled=true; if(lsPend===res) lsPend=null; res0(); };
    lsPend=res;
    const tts=()=>{ if(my!==lsRun) return res(); lsTTS(u.t,u.l).then(res); };
    if(!u.a) return tts();
    try{ speechSynthesis.cancel(); }catch(e){}
    let fell=false; const fb=()=>{ if(fell) return; fell=true; tts(); };
    voicePlay(u.a,{ onend:()=>{ if(!fell){ fell=true; res(); } }, onerr:fb });
  });
}
async function lsSeq(list, gap, onstep){ const my=lsRun; for(let k=0;k<list.length;k++){ if(my!==lsRun) return; onstep&&onstep(k); await lsPlay(list[k]); await lsWait(gap||350); } }
function lsHD(text){ return lsPlay({t:text, l:'vi', a:hdFile(text)}); }
/* chờ ms; khi đang ⏸ Dừng thì đồng hồ đứng lại */
function lsWait(ms){ ms=window.LS_FAST?5:REDUCED?Math.min(ms,300):ms;
  return new Promise(r=>{ let left=ms, last=Date.now(); const t=setInterval(()=>{ const now=Date.now(); if(!LS_PAUSED) left-=now-last; last=now; if(left<=0){ clearInterval(t); r(); } }, 50); }); }
let LS_PAUSED=false;
function lsUntilResume(){ return new Promise(r=>{ if(!LS_PAUSED) return r(); const t=setInterval(()=>{ if(!LS_PAUSED){ clearInterval(t); r(); } },80); }); }
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
  pause:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.4"/><rect x="14" y="4.5" width="4" height="15" rx="1.4"/></svg>',
  play:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.5-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8z"/></svg>',
  back:'<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="4" y="5" width="3" height="14" rx="1.2"/><path d="M20 5.6v12.8a1 1 0 0 1-1.55.83L9.2 12.83a1 1 0 0 1 0-1.66l9.25-6.4A1 1 0 0 1 20 5.6z"/></svg>',
  gift:'<svg viewBox="0 0 64 64" width="78" height="78" aria-hidden="true"><rect x="8" y="26" width="48" height="32" rx="5" fill="rgba(255,255,255,.3)"/><rect x="4" y="16" width="56" height="12" rx="4" fill="rgba(255,255,255,.45)"/><rect x="28" y="16" width="8" height="42" fill="rgba(255,255,255,.8)"/><path d="M32 16 C24 4 14 8 20 14 C23 17 32 16 32 16 Z M32 16 C40 4 50 8 44 14 C41 17 32 16 32 16 Z" fill="rgba(255,255,255,.9)"/></svg>'
};
let LSX = null;   // bước đang chơi: {g,i,k,step,stars,replay}
function lsFrame(box, step, total){
  box.innerHTML=`<div class="ls-stage">
    <div class="ls-top"><div><b>${esc(LS_TYPE_NAME[step.type])}</b><small>${esc(step.step)}</small></div>
      <div class="ls-dots" id="lsDots"></div><div class="ls-stars">${LS_SVG.star}<span id="lsStars">0</span></div></div>
    <div class="ls-body" id="lsBody"></div>
    <div class="ls-bot"><div class="ls-ctl">
        <button class="ls-b dark" id="lsReplay" title="Nghe lại">${LS_SVG.spk}<span>Nghe lại</span></button>
        <button class="ls-b" id="lsBack" title="Câu trước" hidden>${LS_SVG.back}<span>Câu trước</span></button>
        <button class="ls-b" id="lsPause" title="Dừng">${LS_SVG.pause}<span>Dừng</span></button></div>
      <div class="ls-cap" id="lsCap"></div>
      <button class="ls-b" id="lsRedo">${LS_SVG.redo}<span>Làm lại</span></button></div>
    <div class="ls-paused" id="lsPausedBox" hidden><button class="ls-resume" id="lsResume">${LS_SVG.play}<b>Đang tạm dừng</b><small>Chạm để học tiếp</small></button></div></div>`;
  box.querySelector('#lsReplay').onclick=()=>{ sfx.pop(); lsSetPause(false); LSX.replay&&LSX.replay(); };
  box.querySelector('#lsRedo').onclick=()=>{ sfx.pop(); lsSetPause(false); lsStartStep(true); };
  box.querySelector('#lsBack').onclick=()=>{ sfx.pop(); lsSetPause(false); LSX.back&&LSX.back(); };
  box.querySelector('#lsPause').onclick=()=>{ sfx.pop(); lsSetPause(!LS_PAUSED); };
  box.querySelector('#lsResume').onclick=()=>{ sfx.pop(); lsSetPause(false); };
  return box.querySelector('#lsBody');
}
/* ⏸ Dừng: giọng đọc đứng lại đúng chỗ, bài không tự chạy tiếp; ▶ Tiếp: đọc tiếp từ chỗ dừng.
   Đang thu giọng mà bấm Dừng thì bỏ lượt thu đó, bấm Tiếp sẽ làm lại lượt đó. */
function lsSetPause(on){
  if(on===LS_PAUSED) return;
  LS_PAUSED=on;
  const b=document.getElementById('lsPause'), box=document.getElementById('lsPausedBox');
  if(b) b.innerHTML=on?`${LS_SVG.play}<span>Tiếp</span>`:`${LS_SVG.pause}<span>Dừng</span>`;
  if(box) box.hidden=!on;
  if(on){ voicePause(); if(recCur){ recAbort(); LSX&&(LSX.redoOnResume=true); } }
  else { voiceResume(); if(LSX && LSX.redoOnResume){ LSX.redoOnResume=false; LSX.redo&&LSX.redo(); } }
}
function lsSetBack(fn){ LSX.back=fn; const b=document.getElementById('lsBack'); if(b) b.hidden=!fn; }
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
      <span class="ls-kick">Chặng ${D.r}: ${esc(ROUNDS[D.r-1].vi)} · ${esc(R.topic)} · Buổi ${lessonNo(i)}</span>
      <h2>${titleHTML(D.t)}</h2>
      <button class="ls-goal" id="lsGoal">${LS_SVG.spk}<span><small>Sau hôm nay con có thể</small>${esc(D.goal)}</span></button></div></div>
    <div class="ls-prog"><i style="width:${doneN/5*100}%"></i></div>
    <div class="ls-tiles">${D.steps.map((st_,j)=>{ const open=lsOpen(g,i,j), done=j in s.ls;
      return `<button class="ls-tile ${done?'done':''} ${open?'':'lock'}" data-j="${j}" style="--d:${j*.05}s">
        <span class="ls-tim"><img src="${esc(window.LS.page[LS_STEP_ICON[st_.type]])}" alt="" loading="lazy">${done?'<em>✓</em>':open?'':'<em class="lk">🔒</em>'}</span>
        <span class="ls-ttx"><small>Bước ${j+1} · ${esc(st_.step)}</small><b>${esc(LS_TYPE_NAME[st_.type])}</b>${done?`<span class="ls-got">${LS_SVG.star} ${s.ls[j]} sao</span>`:''}</span></button>`; }).join('')}</div>
    ${doneN<5?`<div class="row"><button class="btn g ls-gonext" id="lsGo">▶ ${doneN?'Học tiếp':'Bắt đầu'} · Bước ${D.steps.findIndex((_,j)=>!(j in s.ls))+1}: ${esc(LS_TYPE_NAME[D.steps[D.steps.findIndex((_,j)=>!(j in s.ls))].type])}</button></div>`:''}
    <div class="ls-parent"><button class="ls-b sm" id="lsParentSay" aria-label="Nghe lời nhắn cho ba mẹ">${LS_SVG.spk}</button><div><b>Ba mẹ đồng hành:</b> bật bài cho con đúng giờ · khen con khi con đang làm bài · khen con khi con xong bài và nhận sao. Không ép nói, không sửa lỗi, không so sánh.</div></div>
    <div id="lsDone"></div>
    <div class="row"><a class="btn y" href="#/g/${g}">← Về bản đồ</a></div></div>`;
  const sayGoal=()=>lsPlay({t:'Hôm nay con học: '+D.goal, l:'vi', a:D.goal_a});
  const parentLine=LS_PARENT_HD;
  document.getElementById('lsGoal').onclick=()=>{ lsStop(); sayGoal(); };
  document.getElementById('lsParentSay').onclick=()=>{ lsStop(); lsHD(parentLine); };
  const go=document.getElementById('lsGo'); if(go) go.onclick=()=>{ sfx.pop(); location.hash=`#/g/${g}/${i+1}/b${D.steps.findIndex((_,j)=>!(j in s.ls))+1}`; };
  /* vừa mở buổi học: cô Hươu tự đọc "Hôm nay con học gì", lời nhắn cho ba mẹ, rồi mời con bắt đầu */
  if(STARTED && doneN<5){ const my=lsSid; (async()=>{ await lsWait(300); if(my!==lsSid) return; await sayGoal(); if(my!==lsSid) return;
      await lsWait(300); if(my!==lsSid) return; await lsHD(parentLine); if(my!==lsSid) return;
      await lsWait(300); if(my!==lsSid) return; lsHD(doneN?'Con chạm nút xanh để học tiếp nhé!':'Con chạm nút xanh để bắt đầu nhé!'); })(); }
  app.querySelectorAll('.ls-tile').forEach(b=>b.onclick=()=>{
    if(b.classList.contains('lock')){ sfx.no(); toast('Con làm xong bước trước để mở bước này nhé! 🔒'); return; }
    sfx.pop(); location.hash=`#/g/${g}/${i+1}/b${+b.dataset.j+1}`;
  });
  if(doneN===5) lsDayDone(g,i,document.getElementById('lsDone'));
  window.scrollTo({top:0});
}
function lsDayDone(g,i,panel){
  const s=lsState(g,i);
  if(!s.done) lsCompleteDay(g,i);   // đủ 5 bước mà chưa ghi nhận (dữ liệu cũ): tự ghi nhận luôn
  const d=document.createElement('div'); d.className='panel'; panel.appendChild(d); showDone(d,false);
}
/* Xong bước cuối: tự cộng sao, tự hoàn thành ngày, mở màn chúc mừng phủ cả màn hình.
   Bé không cần cuộn hay bấm thêm nút nào; chỉ có một nút có hình để về bản đồ. */
function lsCompleteDay(g,i){
  const s=lsState(g,i);
  if(!s.done){ const before=dayPoints(g,i); s.done=true; addPoints(g,i,before,null); }
  const total=Object.values(s.ls).reduce((a,b)=>a+b,0);
  lsStop();
  document.querySelectorAll('.ls-cele').forEach(e=>e.remove());
  const ov=document.createElement('div'); ov.className='ls-cele';
  ov.innerHTML=`<div class="ls-cele-box" role="dialog" aria-label="Hoàn thành ngày ${i+1}">
    <img class="ls-cele-img" src="${esc(window.LS.page.ls_man_khen)}" alt="">
    <div class="ls-cele-stars">${LS_SVG.star}${LS_SVG.star}${LS_SVG.star}</div>
    <h3>Con học xong buổi ${lessonNo(i)} rồi!</h3>
    <p>Con được <b>${total} sao</b>. Ba mẹ khen con một câu thật to nhé!</p>
    <a class="ls-cele-go" href="#/g/${g}"><span aria-hidden="true">🗺️</span><b>Về bản đồ</b></a>
    <div class="ls-cele-more">${missionHTML(g,i)}${xtTeaser(g,Math.floor(i/PER),'🧭 Con muốn xem thêm? Góc khám phá')}</div></div>`;
  document.body.appendChild(ov); missionWire(ov,g,i);
  ov.querySelectorAll('.xt-tc, .xt-th a').forEach(a=>a.addEventListener('click',()=>ov.remove()));
  confetti(44); sfx.win();
  (async()=>{ await lsHD('Tuyệt vời! Con đã học xong hôm nay rồi!'); if(!document.body.contains(ov)) return;
    await lsWait(300); if(document.body.contains(ov)) lsHD('Hẹn gặp con ngày mai nhé!'); })();
}

/* ---------- chơi một bước ---------- */
function lsPlayStep(g,i,k){
  const D=GROUPS[g].days[i].ls, step=D.steps[k];
  app.innerHTML=`<div class="wrap ls-wrap">${head(g,i)}<div id="lsBox"></div>
    <div class="row"><a class="btn y" href="#/g/${g}/${i+1}">← Các bước của buổi ${lessonNo(i)}</a></div></div>`;
  LSX={g,i,k,step,stars:0,replay:null};
  lsStartStep();
  window.scrollTo({top:0});
}
function lsStartStep(skipRules){
  lsStop(); lsSid++; LSX.stars=0; LSX.back=null; LSX.redo=null; LSX.redoOnResume=false; LS_PAUSED=false;
  const box=document.getElementById('lsBox'), body=lsFrame(box, LSX.step);
  const run=()=>{ ({xem:lsXem, cham:lsCham, noi:lsNoi, at:lsAT, do:lsDo, nc:lsNC})[LSX.step.type](LSX.step, body); };
  if(skipRules) return run();
  lsRulesCard(body, LSX.step, run);
}
/* thẻ luật chơi: lần đầu gặp dạng bài thì đọc đủ, những lần sau đọc 1 câu ngắn; con chạm "Bắt đầu" hoặc chờ đọc xong */
function lsRulesCard(body, step, run){
  const key=lsRuleKey(step), R=LS_RULES[key]; if(!R) return run();
  const seen=lsGet('lle-rule-'+key,0), full=seen<2, my=lsSid; let started=false;
  const start=()=>{ if(started||my!==lsSid) return; started=true; lsSet('lle-rule-'+key, seen+1); lsStop(); lsCap(''); run(); };
  body.innerHTML=`<div class="ls-rule"><img src="${esc(window.LS.page[LS_STEP_ICON[step.type]])}" alt="">
    <div class="ls-rtx"><span class="ls-lab">Luật chơi · ${esc(step.step)}</span><h3>${esc(R.h)}</h3>
      <ol>${R.lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ol>
      <div class="row ls-rrow"><button class="btn g" id="lsStart">▶ Bắt đầu</button><button class="ls-b" id="lsRuleSay">${LS_SVG.spk}<span>Nghe lại luật</span></button></div></div></div>`;
  const say=()=>{ lsStop(); return lsSeq(R.lines.map(t=>({t,l:'vi',a:hdFile(t)})), 250); };
  body.querySelector('#lsStart').onclick=()=>{ sfx.pop(); start(); };
  body.querySelector('#lsRuleSay').onclick=say;
  LSX.replay=say;
  lsCap('Con nghe luật chơi nhé');
  if(window.LS_FAST) return start();
  (async()=>{ await lsWait(250); if(my!==lsSid) return;
    await say();   // luôn đọc đủ luật chơi; con bấm "Bắt đầu" để vào ngay
    if(my!==lsSid || started) return; await lsWait(600); start(); })();
}
function lsFinish(){
  const {g,i,k}=LSX, s=lsState(g,i), D=GROUPS[g].days[i].ls;
  const before=dayPoints(g,i), stars=Math.max(1,LSX.stars);
  s.ls[k]=Math.max(s.ls[k]||0, stars); addPoints(g,i,before,document.getElementById('lsStars'));
  const body=document.getElementById('lsBody'), nx=k+1<D.steps.length;
  if(!s.done && D.steps.every((_,j)=>j in s.ls)){ LSX.replay=null; lsCap(''); return lsCompleteDay(g,i); }
  lsCap('');
  const NR=nx?LS_RULES[lsRuleKey(D.steps[k+1])]:null;
  body.innerHTML=`<div class="ls-done"><div class="ls-bigstar">${LS_SVG.star}</div><b>Giỏi quá!</b><span>Con được ${stars} sao.</span>
    ${NR?`<div class="ls-next"><img src="${esc(window.LS.page[LS_STEP_ICON[D.steps[k+1].type]])}" alt=""><div><small>Bước tiếp theo</small><b>Bước ${k+2}: ${esc(LS_TYPE_NAME[D.steps[k+1].type])}</b><span>${esc(NR.lines.join(' '))}</span></div></div>`:''}
    <div class="row">${nx?`<a class="btn g" href="#/g/${g}/${i+1}/b${k+2}">Bước ${k+2}: ${esc(LS_TYPE_NAME[D.steps[k+1].type])} →</a>`:`<a class="btn g" href="#/g/${g}/${i+1}">⭐ Xong cả 5 bước!</a>`}
    <button class="btn y" id="lsAgain">Chơi lại</button></div></div>`;
  body.querySelector('#lsAgain').onclick=()=>lsStartStep(true); lsSetBack(null);
  LSX.replay=null; sfx.win(); confetti(18);
  lsHD('Con được thêm một ngôi sao!');
}

/* ---------- 1. XEM VÀ LÀM THEO ---------- */
function lsXem(step, body){
  const parts=step.parts; let p=0; const my=lsSid;
  const ord=['Lần 1','Lần 2'], LANG=l=>l==='zh'?'tiếng Trung':'tiếng Anh';
  const extra=step.extra&&step.extra.length?`<div class="ls-extra"><b>Xem thêm (không bắt buộc):</b>${step.extra.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">▶ ${esc(x.label)}</a>`).join('')}</div>`:'';
  function show(){
    if(!lsAlive(my)) return;
    lsDots(p,parts.length);
    if(p>=parts.length){ lsStar(); return lsFinish(); }
    const P=parts[p], lang=LANG(P.l), nxt=parts[p+1];
    lsSetBack(p>0?()=>{ lsStop(); p--; show(); }:null);
    if(P.kind==='video'){
      const src=P.url.replace(/\/view.*$/,'/preview'), local=lsLocalVideo(P.url);
      body.innerHTML=`<div class="ls-xem ${P.l}"><div class="ls-xh"><span class="ls-tag ${P.l}">Xem bằng ${lang}</span><span>${ord[p]} · ${esc(P.label)}</span></div>
        <div class="ls-vid">${local?`<video id="lsV" src="${esc(local)}" controls playsinline preload="auto"></video>`:lsVidFrame(src, 'Video '+P.label)}</div>
        <p class="ls-hint">Con xem và làm theo bạn nhé: vẫy tay, chỉ, giơ ngón tay giống bạn trong video.</p>
        <div class="row"><button class="btn g ls-wait" id="lsNx" disabled><i class="ls-waitbar"></i><span>${nxt?'Con xem xong rồi → Xem bằng '+LANG(nxt.l):'Con xem xong rồi ⭐'}</span></button></div>
        ${local?'':`<p class="ls-vhelp">Video không chạy? <a href="${esc(P.url)}" target="_blank" rel="noopener">Bấm vào đây để mở video</a> rồi quay lại trang này.</p>`}${extra}</div>`;
      const V=body.querySelector('#lsV');
      if(V){ /* video lưu trên web: tự phát, nét, có nút dừng; xem hết thì tự mở nút "xem xong" */
        V.addEventListener('ended',()=>{ if(nxb && nxb.disabled){ nxb.disabled=false; nxb.classList.remove('ls-wait'); nxb.style.setProperty('--w','100%'); lsPop(nxb); } });
        LSX.redo=()=>{ try{ V.play(); }catch(e){} };
      }
      const nxb=body.querySelector('#lsNx');
      nxb.onclick=()=>{ if(nxb.disabled) return; sfx.ok(); if(V) try{ V.pause(); }catch(e){} p++; show(); };
      /* nút "xem xong" chỉ bấm được sau khoảng thời lượng video, để bé không bỏ qua video bằng hai lần chạm */
      const wait=TEACHER?0:LS_VID_WAIT, t0=Date.now();
      nxb.style.setProperty('--w', wait?'0%':'100%');
      const tick=setInterval(()=>{
        if(!lsAlive(my) || !document.body.contains(nxb)){ clearInterval(tick); return; }
        const f=wait?Math.min(1,(Date.now()-t0)/wait):1; nxb.style.setProperty('--w',(f*100)+'%');
        if(f>=1){ clearInterval(tick); nxb.disabled=false; nxb.classList.remove('ls-wait'); lsPop(nxb); }
      }, 250);
      LSX.replay=()=>lsHD('Con xem và làm theo bạn nhé!');
      lsHD('Con xem và làm theo bạn nhé!').then(()=>{ if(V && lsAlive(my) && !LS_PAUSED){ const pr=V.play(); if(pr&&pr.catch) pr.catch(()=>{}); } });
    } else storyShow(P);
  }
  function storyShow(P){
    const S=window.LS.stories[P.r], lang=P.l==='zh'?'tiếng Trung':'tiếng Anh'; let c=0, playing=true;
    const draw=()=>{
      const sc=S.scenes[c], u=sc[P.l];
      body.innerHTML=`<div class="ls-xem ${P.l}"><div class="ls-xh"><span class="ls-tag ${P.l}">Nghe bằng ${lang}</span><span>${ord[p]} · Truyện “${esc(S.title)}” · cảnh ${c+1}/8</span></div>
        <div class="ls-story">${lsPic(sc.img,'ls-scene')}<div class="ls-sline">${lsBub(u)}</div></div>
        <div class="row ls-snav"><button class="ls-b" id="sPrev" ${c===0?'disabled':''}>◀</button><button class="ls-b dark" id="sPlay">${playing?'⏸ Dừng':'▶ Nghe tiếp'}</button><button class="ls-b" id="sNext">${c===7?'Xong ✓':'▶▶'}</button></div>${extra}</div>`;
      body.querySelector('#sPrev').onclick=()=>{ if(c>0){ lsStop(); c--; playing=false; draw(); lsPlay(S.scenes[c][P.l]); } };
      body.querySelector('#sNext').onclick=()=>{ lsStop(); if(c<7){ c++; playing=false; draw(); lsPlay(S.scenes[c][P.l]); } else end(); };
      body.querySelector('#sPlay').onclick=()=>{ playing=!playing; if(playing) auto(); else lsStop(); draw(); };
    };
    const end=()=>{ lsStop(); body.innerHTML=`<div class="ls-done"><b>Hết truyện!</b><span>${p===0?'Mình nghe lại bằng '+LANG(P.l==='en'?'zh':'en')+' nhé.':'Con nghe đủ 2 lần rồi!'}</span><div class="row"><button class="btn g" id="lsNx">${p===0?'Nghe bằng '+LANG(P.l==='en'?'zh':'en')+' →':'Xong ⭐'}</button></div></div>`;
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

const LS_VID_WAIT = 20000;   // ms: video ngắn khoảng 24 giây
/* Video tải lên web (tai-nguyen/video/<mã Drive>.mp4): nét hơn, tự phát, không phụ thuộc Google Drive.
   Thêm mã vào LS_VIDEO_LOCAL khi đã có file; chưa có thì dùng khung Google Drive như cũ. */
const LS_VIDEO_LOCAL = window.LS_VIDEO_LOCAL || {};
function lsLocalVideo(url){ const m=/\/d\/([\w-]+)/.exec(url||''); return m && LS_VIDEO_LOCAL[m[1]] ? 'tai-nguyen/video/'+LS_VIDEO_LOCAL[m[1]] : ''; }
/* khung video Google Drive: thêm lớp che nút "mở cửa sổ mới" ở góc trên bên phải, để bé không bị đưa ra khỏi web */
function lsVidFrame(src, title){
  const drive=/drive\.google\.com/.test(src);
  return `<iframe src="${esc(src)}" allow="autoplay; fullscreen" allowfullscreen title="${esc(title)}"></iframe>${drive?'<span class="ls-vidcover" aria-hidden="true"></span>':''}`;
}

/* ---------- 2. CHẠM ĐÚNG HÌNH ---------- */
/* Bước "Câu": tranh đúng là tranh câu (vuông, nét mới), còn tranh sai lại lấy từ tranh truyện (ngang, khác nét),
   nên bé chọn được "tranh khác kiểu" mà không cần nghe. Đổi tranh sai thành tranh câu của ngày khác trong cùng vòng,
   cùng khung, cùng nét. Cặp câu gần nghĩa (tên – tên, anh chị – anh chị) không làm tranh sai cho nhau. */
const LS_CAU = {
  v1_n1:'goodbye_mommy', v1_n2:'hello_daddy', v1_n3:'hello_teacher', v1_n4:'hello_friend',
  v2_n8:'hello_my_name_is_anna', v2_n9:'what_s_your_name', v2_n10:'one_two_three_four_five_six', v2_n11:'how_old_are_you',
  v3_n15:'who_is_he', v3_n16:'he_is_my_big_brother', v3_n17:'she_is_my_big_sister', v3_n18:'who_is_she'
};
const LS_CAU_ALT = {
  v1_n1:['v1_n2','v1_n3'], v1_n2:['v1_n1','v1_n4'], v1_n3:['v1_n4','v1_n1'], v1_n4:['v1_n3','v1_n2'],
  v2_n8:['v2_n10','v2_n11'], v2_n9:['v2_n11','v2_n10'], v2_n10:['v2_n8','v2_n9'], v2_n11:['v2_n9','v2_n8'],
  v3_n15:['v3_n16','v3_n17'], v3_n16:['v3_n15','v3_n18'], v3_n17:['v3_n18','v3_n15'], v3_n18:['v3_n17','v3_n16']
};
function lsFixCau(q){
  const a=q.opts[q.ans], m=/^(.*\/)(v\d_n\d+)_cau_.+_(l\d)\.webp$/.exec(a||'');
  if(!m || !LS_CAU_ALT[m[2]] || !q.opts.some((o,n)=>n!==q.ans && /\/tr\d_c\d+\.webp$/.test(o))) return q;
  const alt=LS_CAU_ALT[m[2]].map(k=>`${m[1]}${k}_cau_${LS_CAU[k]}_${m[3]}.webp`); let j=0;
  return Object.assign({}, q, {opts:q.opts.map((o,n)=>n===q.ans?o:(alt[j++]||o))});
}
function lsCham(step, body){
  const my=lsSid; const qs=step.qs.map(lsFixCau); let qi=0, busy=false;
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
    if(qi>=qs.length){ lsSetBack(null); return lsFinish(); }
    lsSetBack(qi>0?()=>{ lsStop(); busy=false; qi--; ask(); }:null);
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

/* ---------- 3. NÓI THEO (cả đóng vai) ----------
   Đến lượt con: micro TỰ BẬT, chấm đỏ + sóng âm cho biết đang thu; con nói xong (im lặng ~1 giây) thì tự dừng,
   máy phát lại giọng con, rồi tự sang câu tiếp. Máy không có micro / không cho phép thì đếm 3-2-1 như cũ. */
function lsRecUI(mic, on){ mic.classList.remove('idle','ready','on','ok','rec','off'); if(on) mic.classList.add(on); }
async function lsRecTurn(mic, my, opt){
  opt=opt||{}; const lbl=mic.querySelector('b'), lv=mic.querySelector('.ls-lv');
  lsRecUI(mic,'rec'); lsCap('🔴 Đang thu… con nói đi!'); if(lbl) lbl.textContent='';
  const r=await recTake({maxMs:opt.maxMs||5500, onLevel:v=>{ if(lv) lv.style.setProperty('--lv', (0.25+v*0.9).toFixed(2)); }});
  if(!lsAlive(my)) return 'gone';
  if(r===null && recCur===null && LSX.redoOnResume) return 'paused';
  if(!r){ /* không thu được: đếm 3-2-1 để con vẫn nói */
    lsRecUI(mic,'on'); lsCap('Con nói theo nhé!');
    for(let s=3;s>=1;s--){ if(!lsAlive(my)) return 'gone'; if(lbl) lbl.textContent=s; await lsWait(1000); }
    return 'count';
  }
  lsRecUI(mic,'ok'); if(lbl) lbl.textContent='✓'; sfx.ok();
  lsCap('🎧 Con nghe lại giọng của con nhé'); await lsWait(250); if(!lsAlive(my)) return 'gone';
  await recPlay(r.url); if(!lsAlive(my)) return 'gone';
  LSX.mine=r.url;
  return 'rec';
}
function lsNoi(step, body){
  const my=lsSid, T=step.turns; let ti=0;
  async function turn(){
    if(!lsAlive(my)) return;
    lsDots(ti,T.length);
    if(ti>=T.length){ lsSetBack(null); return lsFinish(); }
    lsSetBack(ti>0?()=>{ lsStop(); ti--; turn(); }:null);
    LSX.redo=()=>{ lsStop(); turn(); };
    const t=T[ti], tok=++lsNoi.tok;
    const alive=()=>lsAlive(my) && tok===lsNoi.tok;
    body.innerHTML=`<div class="ls-noi"><div class="ls-npic">${lsPic(t.pic,'')}</div>
      <div class="ls-nside">${t.note?`<span class="ls-lab">${esc(t.note)}</span>`:''}${step.role?'<span class="ls-lab">Đóng vai · nghe mẫu trước</span>':''}
        <div class="ls-says">${t.say.map(u=>lsBub(u)).join('')}</div>
        <div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${LS_SVG.mic}<b></b></div>
        <div class="ls-mytxt" id="myt">${t.mic?`Con nói: ${lsBub(t.mic,'sm')}`:'<span class="ls-lab">Con nghe nhé (chưa cần nói)</span>'}</div>
        <div class="row ls-nrow"><button class="ls-b" id="mine" hidden>🎧 Nghe lại giọng con</button><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div></div>`;
    const mic=body.querySelector('#mic'), nx=body.querySelector('#nx'), mine=body.querySelector('#mine');
    nx.onclick=()=>{ lsStop(); ti++; turn(); };
    LSX.replay=()=>{ lsStop(); lsSeq(t.say); };
    lsCap(t.say.map(u=>u.t).join(' · '));
    await lsSeq(t.say, 400, k=>body.querySelectorAll('.ls-says .ls-bub').forEach((b,j)=>b.classList.toggle('talk',j===k)));
    if(!alive()) return;
    if(t.mic){
      await lsHD('Đến lượt con!'); if(!alive()) return;
      if(step.role && t.ask){ await lsPlay(t.ask); if(!alive()) return; }
      const how=await lsRecTurn(mic, my); if(!alive() || how==='gone' || how==='paused') return;
      if(how==='rec'){ mine.hidden=false; const url=LSX.mine; mine.onclick=()=>{ lsStop(); recPlay(url); }; }
      lsStar(); await lsHD('Giỏi quá!'); if(!alive()) return;
      if(t.after&&t.after.length){ await lsSeq(t.after); if(!alive()) return; }
    } else { lsRecUI(mic,'off'); lsStar(); }
    nx.textContent='Tiếp ▶'; await lsWait(1200); if(alive()){ ti++; turn(); }
  }
  (async()=>{ await lsHD('Con nghe rồi nói theo bạn nhé!'); if(lsAlive(my)) turn(); })();
}
lsNoi.tok=0;

/* ---------- 4. ANH HAY TRUNG? ---------- */
function lsAT(step, body){
  const my=lsSid, Q=step.qs; let qi=0, busy=false;
  body.innerHTML=`<div class="ls-at"><button class="ls-box en" data-l="en"><b>ABC</b><span>Tiếng Anh</span><div class="ls-pile" id="pen"></div></button>
    <img class="ls-deer" src="${LS_FACE.co_huou}" alt="Cô Hươu">
    <button class="ls-box zh" data-l="zh"><b class="zh">中文</b><span>Tiếng Trung</span><div class="ls-pile" id="pzh"></div></button></div>`;
  const ask=()=>{ lsDots(qi,Q.length); if(qi>=Q.length){ lsSetBack(null); return lsFinish(); }
    lsSetBack(qi>0?()=>{ lsStop(); busy=false; qi--; ask(); }:null); lsStop(); lsCap('Con nghe nhé…'); lsPlay(Q[qi]); };
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
    lsStop(); const me=lsSid, c=C[n], to=c.a.l; LSX.redo=()=>open(n); lsSetBack(null);
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
    hint.textContent='Con nói theo nhé!'; sfx.pop();
    body.querySelector('.ls-nside').insertAdjacentHTML('beforeend','<div class="ls-mic idle" id="mic"><span class="ls-lv"></span>'+LS_SVG.mic+'<b></b></div>');
    tm.hidden=true;
    const how=await lsRecTurn(body.querySelector('#mic'), my, {maxMs:5000}); if(me!==lsSid || how==='gone' || how==='paused') return;
    hint.textContent='Giỏi quá!'; lsStar(); opened.add(n);
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
function viewXemThem(g, r, autoN){
  const X=window.XEM_THEM, G=GROUPS[g]; if(!X||!G||!X[g]||!X[g][r-1]) return viewGroup(g);
  const R=X[g][r-1];
  // ngày đã mở: Little Seed theo ngày chung, Canopy theo ngày trong vòng
  let reach=0; for(let i=0;i<21;i++) if(isUnlocked(g,i)) reach=i+1;
  const ok=it=> TEACHER || (g==='seed' ? it[2]<=reach : (r-1)*7+it[2]<=reach);
  const vids=R.v.filter(ok), games=R.g.filter(ok);
  const src=(c,auto)=>c.startsWith('y:')?'https://www.youtube-nocookie.com/embed/'+c.slice(2)+'?rel=0&modestbranding=1'+(auto?'&autoplay=1':''):'https://drive.google.com/file/d/'+c.slice(2)+'/preview';
  const thumb=c=>c.startsWith('y:')?`https://i.ytimg.com/vi/${c.slice(2)}/mqdefault.jpg`:'';
  app.innerHTML=`<div class="wrap ls-wrap">
    <div class="ls-banner" style="background-image:url('${esc(G.banners[r-1])}')"><div class="ls-bt">
      <span class="ls-kick">${esc(G.name)} · Chặng ${r}: ${esc(ROUNDS[r-1].vi)}</span><h2>🧭 Góc khám phá</h2>
      <p class="xt-note">Con nào hứng thú thì khám phá thêm, không cần làm hết. Góc này không mở ngày mới và không tính điểm.</p></div></div>
    <h3 class="xt-h">▶ Xem thêm <small>${vids.length} video · viền xanh là tiếng Anh, viền đỏ là tiếng Trung</small></h3>
    <div class="xt-grid">${vids.map((it,n)=>`<button class="xt-v ${it[0]}" data-n="${n}">${thumb(it[3])?`<img src="${thumb(it[3])}" alt="" loading="lazy" onerror="this.outerHTML='<span class=xt-ph>▶</span>'">`:`<span class="xt-ph">▶</span>`}<b>${esc(it[1])}</b><small>${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'}</small></button>`).join('')||'<p>Con học thêm vài ngày để mở video mới nhé!</p>'}</div>
    <div id="xtPlay"></div>
    ${games.length?`<h3 class="xt-h">🎮 Chơi cùng ba mẹ <small>mở trang mới · ba mẹ ngồi cạnh con nhé</small></h3>
    <div class="xt-games">${games.map(it=>`<a class="xt-g ${it[0]}" href="${esc(it[3])}" target="_blank" rel="noopener"><b>${esc(it[1])}</b><small>${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'} ↗</small></a>`).join('')}</div>`:''}
    <div class="row"><a class="btn y" href="#/g/${g}">← Về bản đồ</a></div></div>`;
  const open=(it, b)=>{
    const box=document.getElementById('xtPlay');
    app.querySelectorAll('.xt-v.on').forEach(x=>x.classList.remove('on')); if(b) b.classList.add('on');
    box.innerHTML=`<div class="ls-xem ${it[0]}"><div class="ls-xh"><span class="ls-tag ${it[0]}">${it[0]==='zh'?'Tiếng Trung':'Tiếng Anh'}</span><span>${esc(it[1])}</span></div>
      <div class="ls-vid">${lsVidFrame(src(it[3], true), it[1])}</div>
      <div class="row"><button class="btn y" id="xtClose">Đóng video</button></div></div>`;
    box.querySelector('#xtClose').onclick=()=>{ box.innerHTML=''; };
    box.scrollIntoView({behavior:'smooth', block:'center'});
  };
  app.querySelectorAll('.xt-v').forEach(b=>b.onclick=()=>{ sfx.pop(); open(vids[+b.dataset.n], b); });
  if(autoN>=0){ const it=R.v[autoN]; if(it && ok(it)){ const k=vids.indexOf(it); setTimeout(()=>open(it, app.querySelector(`.xt-v[data-n="${k}"]`)), 50); return; } }
  window.scrollTo({top:0});
}
