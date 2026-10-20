/* =====================================================================
   CANOPY · bộ bài tập dựng thẳng trên web (giao diện kiểu Wordwall)
   Dữ liệu: canopy-data.js (window.CANOPY). Dùng chung tiện ích của index.html:
   esc, shuffle, sfx, confetti, toast, speak, zhKey, imgSlug, st, dayPoints, addPoints, TEACHER, KID…
   ===================================================================== */
const CX_PTS = 4;                 // điểm tối đa mỗi bài
const CX_TYPES = {
  video:   ['▶️', 'Video'],        cards:  ['🃏', 'Thẻ học'],      quiz:    ['❓', 'Quiz'],
  match3:  ['🔗', 'Nối 3 cột'],    matchup:['🎧', 'Nối nghe'],     missing: ['🧩', 'Điền chỗ trống'],
  unjumble:['🔀', 'Xếp câu'],      tf:     ['⚖️', 'Đúng hay sai'], sort:    ['🗂️', 'Phân nhóm'],
  story:   ['📖', 'Truyện'],       puzzle: ['🕵️', 'Giải đố'],      speak:   ['🎤', 'Luyện nói'],
  anagram: ['🔤', 'Ghép chữ']
};
const CX_WHO = {leo:'Leo', anna:'Anna', xiaomei:'Xiaomei', bong:'Bông', co_huou:'Cô Hươu', david:'David'};
const CX_FACE = {leo:'tai-nguyen/nhan-vat/kids_leo_a.webp', anna:'tai-nguyen/nhan-vat/kids_anna_a.webp', xiaomei:'tai-nguyen/nhan-vat/kids_xiaomei_a.webp', bong:'tai-nguyen/nhan-vat/kids_bong_a.webp', co_huou:'tai-nguyen/nhan-vat/huou_huou1_a.webp', david:'tai-nguyen/nhan-vat/fam_anna_bo_a.webp'};
const CX_PITCH = {leo:1.25, anna:1.45, xiaomei:1.5, bong:1.35};   // giọng máy dự phòng: trẻ em giọng cao
let CX_RATE = (()=>{ try{ return +localStorage.getItem('lle-rate')||1; }catch(e){ return 1; } })();

/* ---------- dựng 21 ngày Canopy từ dữ liệu ---------- */
function canopyDays(){
  const C = window.CANOPY; if(!C) return [];
  const out = [];
  C.rounds.forEach(R=>{
    R.days.forEach((D,k)=> out.push({t:D.t, cx:D, r:R.r, d:k+1, round:R}));
    out.push({zoom:true, t:R.zoom.t, about:R.zoom.about, prep:R.zoom.prep});
  });
  return out;
}
function cxRequired(day){ return day.cx.ex.filter(e=>!e.optional); }
function cxState(g,i){ const s=st(g,i); s.ex=s.ex||{}; s.rec=s.rec||{}; return s; }
function cxDayPoints(s,d){ if(!s) return 0; const ex=s.ex||{}; return cxRequired(d).reduce((a,e)=>a+(ex[e.id]||0),0)+(s.done?PTS.done:0); }
function cxOpenIdx(g,i,k){
  const day=GROUPS[g].days[i], s=cxState(g,i), req=day.cx.ex;
  if(TEACHER) return true;
  if(day.d>=4){ // ngày ôn: xong bài khởi động thì tự chọn thứ tự
    const first=req.findIndex(e=>!e.optional && e.type!=='video');
    return k<=first || req[first].id in s.ex;
  }
  for(let j=0;j<k;j++){ const e=req[j]; if(!e.optional && e.type!=='video' && !(e.id in s.ex)) return false; }
  return true;
}

/* ---------- âm thanh ---------- */
function enKey(t){ const s=imgSlug(t); return (s.length<50 && s.length>0) ? s : 'h'+zhKey(t); }
/* chuẩn hoá lời để tra file giọng (khớp với bộ sinh bản đồ) */
const CX_NAMES=[['里奥','Leo'],['安娜','Anna'],['小美','Xiaomei'],["Lǐ'ào",'Leo'],['Ānnà','Anna'],['Xiǎoměi','Xiaomei']];
function cxAKey(t){ let s=String(t||''); CX_NAMES.forEach(([a,b])=>{ s=s.split(a).join(b); }); return s.replace(/’/g,"'").replace(/[\s，。！？、,.!?：:;；“”"…()（）\-–—]/g,'').toLowerCase(); }
/* tìm file giọng: đúng nhân vật nếu có, không thì giọng cô Hươu */
function cxFile(t,l,who){
  const M=window.CN_AUDIO; if(!M) return '';
  const c=M[l+'|'+cxAKey(t)]; if(!c||!c.length) return '';
  const f=(w)=>{ const x=c.find(e=>e[0]===w); return x&&x[1]; };
  return (who&&f(who)) || f('co_huou') || c[0][1];
}
let cxTTSPitch=1;
function cxSpeakTTS(text, lang, who, onend){
  if(!('speechSynthesis' in window)){ onend&&onend(); return; }
  text=String(text||'').replace(/_+|…/g,' ').trim(); if(!text){ onend&&onend(); return; }
  const u=new SpeechSynthesisUtterance(text), zh=lang==='zh';
  const v=voices.find(v=>v.lang.toLowerCase().replace('_','-').startsWith(zh?'zh-cn':'en-us'))||voices.find(v=>v.lang.toLowerCase().startsWith(zh?'zh':'en'));
  if(v) u.voice=v; u.lang=zh?'zh-CN':'en-US'; u.rate=0.85*CX_RATE; u.pitch=CX_PITCH[who]||1;
  if(onend){ u.onend=onend; u.onerror=onend; }
  speechSynthesis.speak(u);
}
function cxStop(){ try{ speechSynthesis.cancel(); }catch(e){} voiceStop(); if(curAudio){ try{ curAudio.onended=null; curAudio.pause(); }catch(e){} } }
/* phát 1 câu: ưu tiên file mp3 (giọng nhân vật), không có thì giọng máy */
function cxSay(t, l, who, onend){
  if(t && typeof t==='object'){ onend=l; who=undefined; l=t.l; t=t.t; }
  if(!t || l==='img' || l==='py') { onend&&onend(); return; }
  cxStop();
  const f=cxFile(t,l,who);
  const tts=()=>cxSpeakTTS(t,l,who,onend);
  if(!f) return tts();
  let fell=false; const fb=()=>{ if(fell) return; fell=true; tts(); };
  voicePlay(f,{ rate:CX_RATE, onend:()=>onend&&onend(), onerr:fb });
}
/* hội thoại 2 giọng */
function cxDialog(dlg, onend){
  cxStop();
  let k=0; const tok=(cxDialog.tok=(cxDialog.tok||0)+1);
  (function nx(){ if(tok!==cxDialog.tok) return; if(k>=dlg.lines.length){ cxHi(-1); onend&&onend(); return; }
    const [w,x]=dlg.lines[k++]; cxHi(k-1); cxSay(x.t,x.l,w,()=>setTimeout(nx,300)); })();
}
function cxHi(k){ document.querySelectorAll('.cx-bub').forEach((b,j)=>b.classList.toggle('talk',j===k)); }
function cxSeq(list, onend, onstep){ let k=0; (function nx(){ if(k>=list.length){ onend&&onend(); return; } const x=list[k]; onstep&&onstep(k); k++; cxSay(x.t,x.l,x.who,()=>setTimeout(nx,350)); })(); }

/* ---------- hình ---------- */
function cxImg(im, cls){
  if(!im) return '';
  return `<span class="cx-im ${cls||''}"><img src="${esc(im.src)}" alt="" onerror="this.parentNode.classList.add('emo');this.remove()"><b>${esc(im.e||'🖼️')}</b></span>`;
}
function cxFace(w, cls){ return `<img class="cx-face ${cls||''}" src="${CX_FACE[w]||CX_FACE.bong}" alt="${esc(CX_WHO[w]||'')}">`; }
function spk(cls, extra){ return `<button class="cx-spk ${cls||''}" ${extra||''} aria-label="Nghe">${CX_SVG.spk}</button>`; }
const CX_SVG = {
  spk:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mic:'<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  star:'<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z" fill="#F2B632" stroke="#B9851B" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  star0:'<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z" fill="none" stroke="#B9851B" stroke-width="1.6" stroke-linejoin="round"/></svg>'
};

/* ---------- MÀN HÌNH NGÀY CANOPY: danh sách nhiệm vụ ---------- */
function viewCanopyDay(g,i,sub){
  const day=GROUPS[g].days[i], s=cxState(g,i);
  const exs=day.cx.ex, req=cxRequired(day);
  const k = sub && /^b\d+$/.test(sub) ? +sub.slice(1)-1 : -1;
  if(k>=0 && exs[k]){
    if(!cxOpenIdx(g,i,k)){ toast('Làm xong bài trước để mở bài này nhé! 🔒'); location.hash=`#/g/${g}/${i+1}`; return; }
    return cxPlay(g,i,k);
  }
  const doneN=req.filter(e=>e.id in s.ex).length;
  const comp=day.cx.comp;
  app.innerHTML=`<div class="wrap">${head(g,i)}
    <div class="cx-daybar">${cxFace(comp,'big')}<div><b>Bạn đồng hành hôm nay: ${CX_WHO[comp]}</b>
      <small>${day.d<=3?'Làm lần lượt từ trên xuống.':'Làm bài khởi động trước, sau đó con tự chọn thứ tự.'} Đã xong ${doneN}/${req.length} bài.</small></div></div>
    <div class="cx-prog"><i style="width:${doneN/req.length*100}%"></i></div>
    <div class="cx-list">${exs.map((e,n)=>{
      const open=cxOpenIdx(g,i,n), done=e.id in s.ex, [ic,tn]=CX_TYPES[e.type]||['•',''];
      const sc=s.ex[e.id];
      return `<button class="cx-item ${done?'done':''} ${open?'':'lock'}" data-n="${n}" style="--d:${n*.04}s">
        <span class="cx-ic">${done?'✅':open?ic:'🔒'}</span>
        <span class="cx-tt"><b>${n+1}. ${esc(e.title)}</b><small>${tn}${e.nl?' · '+e.nl:''}${e.optional?' · tùy chọn':''}${e.timed?' · ⏱ có thử thách':''}</small></span>
        <span class="cx-sc">${done&&!e.optional?'⭐ '+sc+'/'+CX_PTS:''}</span></button>`; }).join('')}</div>
    ${s.done?`<div class="panel" id="cxdone"></div>`:''}
    <div class="row"><a class="btn y" href="#/g/${g}">← Về bản đồ</a></div></div>`;
  app.querySelectorAll('.cx-item').forEach(b=>b.onclick=()=>{
    if(b.classList.contains('lock')){ sfx.no(); toast('Làm xong bài trước để mở bài này nhé! 🔒'); return; }
    sfx.pop(); location.hash=`#/g/${g}/${i+1}/b${+b.dataset.n+1}`;
  });
  if(s.done){ cur={g,i,day}; showDone(document.getElementById('cxdone'), false); }
  window.scrollTo({top:0});
}

/* ---------- khung chơi 1 bài ---------- */
let CX={};   // trạng thái bài đang chơi
function cxPlay(g,i,k){
  cxStop();
  const day=GROUPS[g].days[i], ex=day.cx.ex[k];
  cur={g,i,day};
  CX={g,i,k,day,ex,stars:0,stage2:day.d>=4};
  app.innerHTML=`<div class="wrap">${head(g,i)}
    <div class="cx-stage" id="stage">
      <div class="cx-top"><div class="cx-dots" id="dots"></div><div class="cx-title" id="ctitle">${esc(ex.title)}</div>
        <div class="cx-star">${CX_SVG.star}<b id="cstar">0</b></div></div>
      ${ex.note?`<div class="cx-note">${esc(ex.note)}</div>`:''}
      <div id="cxbox"></div>
    </div>
    <div class="row cx-rowbar"><a class="btn y" href="#/g/${g}/${i+1}">← Danh sách bài</a>
      <button class="btn y cx-rate" id="rate">${CX_RATE<1?'🐢 Đọc chậm':'🐇 Tốc độ thường'}</button></div></div>`;
  document.getElementById('rate').onclick=e=>{ CX_RATE=CX_RATE<1?1:0.75; try{localStorage.setItem('lle-rate',CX_RATE);}catch(_){}
    e.currentTarget.textContent=CX_RATE<1?'🐢 Đọc chậm':'🐇 Tốc độ thường'; sfx.pop(); };
  const box=document.getElementById('cxbox'); CX.box=box;
  const R={video:cxVideo,cards:cxCards,quiz:cxQuiz,match3:cxMatch3,matchup:cxMatchup,missing:cxMissing,unjumble:cxUnjumble,
           tf:cxTF,sort:cxSort,story:cxStory,puzzle:cxPuzzle,speak:cxSpeak,anagram:cxAnagram}[ex.type];
  R(ex, box);
  window.scrollTo({top:0});
}
function cxDots(i,n,marks){
  const el=document.getElementById('dots'); if(!el) return;
  el.innerHTML=Array.from({length:n},(_,k)=>`<i class="${k===i?'on':''} ${marks&&marks[k]?marks[k]:''}"></i>`).join('');
  const t=document.getElementById('ctitle'); if(t) t.textContent=`${CX.ex.title.replace(/\s*\(.*\)$/,'')} · ${i+1}/${n}`;
}
function cxStarAdd(n){ CX.stars+=n; const el=document.getElementById('cstar'); if(el){ el.textContent=CX.stars; el.parentNode.classList.remove('pop'); void el.offsetWidth; el.parentNode.classList.add('pop'); } }
/* hoàn thành 1 bài: lưu điểm, sang bài tiếp */
function cxFinish(frac, html, opt){
  opt=opt||{};
  const {g,i,k,day,ex}=CX, s=cxState(g,i), before=dayPoints(g,i);
  const pts=ex.optional?0:Math.max(1,Math.round(Math.max(0,Math.min(1,frac))*CX_PTS));
  if(!(ex.id in s.ex) || s.ex[ex.id]<pts) s.ex[ex.id]=pts;
  if(opt.rec){ const r=s.rec[ex.id]; if(!r || opt.rec.sc>r.sc || (opt.rec.sc===r.sc && opt.rec.t<r.t)) s.rec[ex.id]=opt.rec; }
  const req=cxRequired(day), allDone=req.every(e=>e.id in s.ex);
  let fresh=false; if(allDone && !s.done){ s.done=true; fresh=true; }
  const box=document.getElementById('cxbox');
  const next=day.cx.ex.findIndex((e,n)=>n>k && !(e.id in s.ex) && e.type!=='video');
  const stars=Math.max(1,Math.round(frac*3));
  box.innerHTML=`<div class="cx-card cx-end">
      <div class="cx-endstars">${[0,1,2].map(n=>n<stars?CX_SVG.star:CX_SVG.star0).join('')}</div>
      ${html||`<h3>Xong bài rồi! <span class="zh">太棒了！</span> <span class="cx-en">Well done!</span></h3>`}
      ${s.rec[ex.id]?`<div class="cx-rec">🏅 Kỷ lục của em: ${s.rec[ex.id].sc} câu đúng · ${s.rec[ex.id].t} giây</div>`:''}
      ${fresh?`<div class="cx-alldone">🎉 Con đã làm xong tất cả bài của ngày ${i+1}!</div>`:''}
    </div>
    <div class="cx-bot">${opt.again?`<button class="cx-pill" id="again">↻ Chơi lại</button>`:''}
      ${opt.challenge?`<button class="cx-pill warm" id="chal">⏱ Thử thách lần 2</button>`:''}
      ${next>=0&&!fresh?`<button class="cx-go" id="nx">Bài tiếp →</button>`:`<button class="cx-go" id="list">${fresh?'Nhận huy hiệu →':'Về danh sách bài'}</button>`}</div>`;
  addPoints(g,i,before,box.querySelector('.cx-end'));
  sfx.win(); confetti(fresh?44:18); if(typeof mascot==='function') mascot(fresh?'done':'ok');
  const a=box.querySelector('#again'); if(a) a.onclick=()=>{ sfx.pop(); opt.again(); };
  const c=box.querySelector('#chal'); if(c) c.onclick=()=>{ sfx.pop(); opt.challenge(); };
  const n=box.querySelector('#nx'); if(n) n.onclick=()=>{ location.hash=`#/g/${g}/${i+1}/b${next+1}`; };
  const l=box.querySelector('#list'); if(l) l.onclick=()=>{ location.hash=`#/g/${g}/${i+1}`; };
}
/* hẹn giờ an toàn: bỏ qua nếu con đã rời bài */
function cxT(fn, ms){ const b=CX.box; return setTimeout(()=>{ if(CX.box===b && b && document.body.contains(b)) fn(); }, ms); }
/* thông báo nhỏ đúng / chưa đúng */
function cxFlash(el, ok){ if(!el) return; el.classList.remove('ok','no','shake'); void el.offsetWidth; el.classList.add(ok?'ok':'no'); if(!ok) el.classList.add('shake'); }
function cxPraise(lang){ const zh=['真棒！','太好了！','你真厉害！'], en=['Great job!','Super!','Well done!']; const a=lang==='zh'?zh:en; return a[Math.floor(Math.random()*a.length)]; }
/* chữ Trung kèm pinyin */
function zhHTML(x, showPy){ return `<span class="cx-hz zh">${esc(x.t||x.zh)}</span>${showPy&&(x.py)?`<span class="cx-py">${esc(x.py)}</span>`:''}`; }
function txtHTML(x, showPy){ return x.l==='zh' ? zhHTML(x, showPy) : `<span class="cx-tx">${esc(x.t)}</span>`; }
function badge(l){ return l==='zh'?'<span class="cx-bd zhb">中文</span>':'<span class="cx-bd enb">EN</span>'; }
