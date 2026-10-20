/* =====================================================================
   CANOPY · 13 dạng bài (kiểu Wordwall) — mỗi hàm nhận (ex, box)
   ===================================================================== */

/* ---------- VIDEO ---------- */
function cxVideo(ex, box){
  box.innerHTML=`<div class="cx-card">${linkBtns([L('video', ex.title, ex.url)])}</div>
    <div class="cx-bot"><button class="cx-go" id="ok">Con đã xem xong →</button></div>`;
  box.querySelector('#ok').onclick=()=>cxFinish(1);
}

/* ---------- A. THẺ HỌC (Flip tiles) ---------- */
function cxCards(ex, box){
  const its=ex.items, st2=ex.stage===2; let i=0; const seen=new Set();
  (function show(){
    cxDots(i, its.length, its.map((_,k)=>seen.has(k)?'seen':''));
    const x=its[i];
    box.innerHTML=`<div class="cx-card cx-flipwrap"><div class="cx-flip" id="fl">
        <div class="cx-face1">${!st2&&x.img?cxImg(x.img,'cx-pic'):''}
          <div class="cx-fz"><span class="cx-zcol">${zhHTML(x, !st2)}</span>${spk('zh','id="sz"')}</div>
          <div class="cx-turn">Chạm để lật thẻ ↻</div></div>
        <div class="cx-face2"><div class="cx-fe">${badge('en')}<span class="cx-tx big">${esc(x.en)}</span>${spk('en','id="se"')}</div>
          ${st2?`<div class="cx-py big">${esc(x.py)}</div>`:''}<div class="cx-zhsmall zh">${esc(x.zh)}</div></div>
      </div></div>
      <div class="cx-bot"><button class="cx-pill" id="pv" ${i?'':'disabled'}>← Trước</button>
        <button class="cx-go" id="nx">${i<its.length-1?'Thẻ tiếp →':'Hoàn thành ✓'}</button></div>`;
    const fl=box.querySelector('#fl');
    const playZh=()=>cxSay(x.zh,'zh'), playEn=()=>cxSay(x.en,'en');
    fl.onclick=e=>{ if(e.target.closest('.cx-spk')) return; fl.classList.toggle('flipped'); sfx.pop(); seen.add(i);
      cxT(fl.classList.contains('flipped')?playEn:playZh, 250); };
    box.querySelector('#sz').onclick=e=>{ e.stopPropagation(); playZh(); };
    box.querySelector('#se').onclick=e=>{ e.stopPropagation(); playEn(); };
    box.querySelector('#pv').onclick=()=>{ if(i){ i--; show(); } };
    box.querySelector('#nx').onclick=()=>{ seen.add(i); if(i<its.length-1){ i++; show(); } else cxFinish(1); };
    cxT(playZh, 300);
  })();
}

/* ---------- B/E/F/K. QUIZ (Quiz · Gameshow quiz) ---------- */
function cxOptHTML(o, stage2){
  if(o.l==='py') return `<span class="cx-tx pyo">${esc(o.t)}</span>`;
  if(o.l==='zh') return `<span class="cx-hz zh">${esc(o.t)}</span>${!stage2&&o.py?`<span class="cx-py">${esc(o.py)}</span>`:''}${o.en?`<span class="cx-oen">${esc(o.en)}</span>`:''}`;
  return `<span class="cx-tx">${esc(o.t)}</span>`;
}
function cxPrompt(q, stage2){
  const p=q.p; let h='';
  if(q.dlg){ h+=`<div class="cx-dlg">${q.dlg.lines.map(([w,x],k)=>`<div class="cx-bub ${k%2?'r':''}">${cxFace(w)}<div><small>${CX_WHO[w]}</small>${x.l==='zh'?`<span class="zh">${esc(x.t)}</span>`:esc(x.t)}</div></div>`).join('')}
      <button class="cx-pill" id="pdlg">▶ Nghe hội thoại</button></div>`; }
  if(q.passage){ const ps=q.passage;
    h+=`<div class="cx-people">${(q.people||[]).map(w=>`<span>${cxFace(w)}<small>${CX_WHO[w]}</small></span>`).join('')}</div>
      <div class="cx-pass ${ps.hide?'hid':''}">${ps.hide?'<span class="cx-ear">🎧</span> Nghe đoạn tiếng Anh':(ps.l==='zh'?`<span class="zh">${esc(ps.t)}</span>${!ps.nopy&&ps.py?`<div class="cx-py">${esc(ps.py)}</div>`:''}`:esc(ps.t))}
      ${ps.audio||ps.hide?`<button class="cx-pill" id="ppass">▶ Nghe đoạn</button>`:''}</div>`;
    if(q.grid) h+=`<table class="cx-grid"><tr><th></th>${q.grid.cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${q.grid.rows.map((r,ri)=>`<tr><th>${esc(r)}</th>${q.grid.cols.map((c,ci)=>`<td data-k="${ri}-${ci}"></td>`).join('')}</tr>`).join('')}</table><div class="cx-gh">Chạm ô để đánh dấu ✓ / ✗ (nháp, không chấm)</div>`;
  }
  if(p.l==='img'){ h+=cxImg(p.img,'cx-qpic'); h+=`<div class="cx-ask">Hình này là gì?</div>`; return h; }
  if(p.img) h+=cxImg(p.img,'cx-qpic sm');
  if(p.hide) h+=`<div class="cx-ask">${esc(p.ask||'Nghe và chọn đáp án đúng')}</div><div class="cx-bigspk">${spk('big','id="pq"')}</div>`;
  else h+=`<div class="cx-q">${badge(p.l)} ${txtHTML(p, p.l==='zh' && !p.nopy && !stage2)} ${p.audio||p.l==='zh'?spk(p.l,'id="pq"'):''}</div>`;
  return h;
}
function cxQuiz(ex, box, qsIn, onDone){
  const QS=qsIn||ex.questions, stage2=CX.stage2;
  let mode=0;   // 0 = lần 1 không tính giờ, 1 = thử thách
  const run=()=>{
    let i=0, score=0, marks=[], t0=Date.now(), fifty=true, timer=null;
    const qs = mode ? shuffle(QS) : QS;
    (function q(){
      clearInterval(timer);
      if(i>=qs.length){
        const secs=Math.round((Date.now()-t0)/1000);
        const fin=()=>cxFinish(score/qs.length, `<h3>Đúng ${score}/${qs.length} câu! <span class="zh">${score===qs.length?'太棒了！':'加油！'}</span></h3>`,
          {again:()=>{mode=0;run();}, challenge: ex.timed&&!mode ? ()=>{mode=1;run();} : null, rec: mode?{sc:score,t:secs}:null});
        return onDone ? onDone(score, qs.length) : fin();
      }
      cxDots(i, qs.length, marks);
      const Q=qs[i], order=Q.o.map((_,k)=>k);
      const long=(Q.p.t||'').length>20||Q.dlg||Q.passage; const lim=Q.passage&&Q.grid?90:long?45:30;
      box.innerHTML=`<div class="cx-card cx-qcard">${mode?`<div class="cx-timer"><i id="tbar"></i></div>`:''}${cxPrompt(Q, stage2)}</div>
        <div class="cx-opts n${Q.o.length}">${order.map((k,n)=>`<button class="cx-opt cxc${n}" data-k="${k}"><span class="cx-abc">${'ABCD'[n]}</span>${cxOptHTML(Q.o[k], stage2)}${Q.o[k].l==='zh'&&stage2?spk('zh mini','data-s="'+k+'"'):''}</button>`).join('')}</div>
        <div class="cx-bot">${mode&&fifty&&Q.o.length>2?`<button class="cx-pill" id="ff">50:50</button>`:''}<span class="cx-mode">${mode?'⏱ Thử thách':''}</span></div>`;
      const pq=box.querySelector('#pq'), pd=box.querySelector('#pdlg'), pp=box.querySelector('#ppass');
      const playQ=()=>cxSay(Q.p.t,Q.p.l);
      if(pq) pq.onclick=playQ;
      if(pd) pd.onclick=()=>cxDialog(Q.dlg, ()=>{ cxHi(-1); if(Q.p.audio) cxT(playQ,400); });
      if(pp) pp.onclick=()=>cxSay(Q.passage.t, Q.passage.l);
      box.querySelectorAll('.cx-grid td').forEach(td=>td.onclick=()=>{ td.textContent=td.textContent==='✓'?'✗':td.textContent==='✗'?'':'✓'; sfx.pop(); });
      box.querySelectorAll('.cx-spk.mini').forEach(b=>b.onclick=e=>{ e.stopPropagation(); cxSay(Q.o[+b.dataset.s]); });
      // tự phát lần đầu
      cxT(()=>{ if(Q.dlg) pd.click(); else if(Q.passage && Q.passage.hide) pp.click(); else if(Q.p.audio||Q.p.hide) playQ(); }, 350);
      let locked=false;
      const answer=(b,k)=>{
        if(locked) return; locked=true; clearInterval(timer);
        const ok=k===Q.a; const right=box.querySelector(`.cx-opt[data-k="${Q.a}"]`);
        if(b) cxFlash(b, ok); right.classList.add('ok');
        if(ok){ score++; cxStarAdd(1); sfx.ok(); } else { sfx.no(); }
        marks[i]=ok?'good':'bad';
        const said=Q.o[Q.a]; cxT(()=>cxSay(said), 250);
        cxT(()=>{ i++; q(); }, ok?1300:2300);
      };
      box.querySelectorAll('.cx-opt').forEach(b=>b.onclick=()=>answer(b,+b.dataset.k));
      const ff=box.querySelector('#ff'); if(ff) ff.onclick=()=>{ fifty=false; ff.remove();
        const wrong=shuffle(order.filter(k=>k!==Q.a)).slice(0,Q.o.length-2); wrong.forEach(k=>box.querySelector(`.cx-opt[data-k="${k}"]`).classList.add('gone')); };
      if(mode){ const bar=box.querySelector('#tbar'), start=Date.now();
        timer=setInterval(()=>{ if(!document.body.contains(box)){ clearInterval(timer); return; } const f=1-(Date.now()-start)/(lim*1000); bar.style.width=Math.max(0,f*100)+'%'; if(f<=0) answer(null,-1); }, 200); }
    })();
  };
  run();
}

/* ---------- C. NỐI 3 CỘT: tranh (audio) – chữ Hán – tiếng Anh ---------- */
function cxMatch3(ex, box){ cxSlots(ex, box, true); }
/* ---------- C'. NỐI NGHE: cụm Trung (audio) ↔ cụm Anh ---------- */
function cxMatchup(ex, box){ cxSlots(ex, box, false); }
function cxSlots(ex, box, three){
  let mode=0;
  const run=()=>{
    const its=ex.items; let sel=null, miss=0, left=its.length*(three?2:1), t0=Date.now(), timer=null;
    const tiles=shuffle([...(three?its.map((x,k)=>({k,s:'zh',t:x.zh})):[]), ...its.map((x,k)=>({k,s:'en',t:x.en}))]);
    const lim=Math.max(120, its.length*20);
    box.innerHTML=`<div class="cx-card">${mode?`<div class="cx-timer"><i id="tbar"></i></div>`:''}
      <div class="cx-rows">${its.map((x,k)=>`<div class="cx-row" data-k="${k}">
        ${three?`<button class="cx-rpic" data-k="${k}">${cxImg(x.img,'cx-pic sm')}<span class="cx-spkdot">🔊</span></button>`:`<button class="cx-rzh" data-k="${k}">${spk('zh')}<span class="zh">${esc(x.zh)}</span></button>`}
        ${three?`<span class="cx-slot zhs" data-k="${k}" data-s="zh">汉字</span>`:''}<span class="cx-slot ens" data-k="${k}" data-s="en">${three?'English':'?'}</span></div>`).join('')}</div></div>
      <div class="cx-bank">${tiles.map((x,n)=>`<button class="cx-tile ${x.s==='zh'?'zh':''}" data-n="${n}">${esc(x.t)}</button>`).join('')}</div>
      <div class="cx-bot"><span class="cx-mode">${mode?'⏱ Thử thách':'Chọn 1 thẻ, rồi chạm vào ô trống đúng hàng'}</span></div>`;
    box.querySelectorAll('.cx-rpic,.cx-rzh').forEach(b=>b.onclick=()=>{ cxSay(its[+b.dataset.k].zh,'zh'); b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); });
    box.querySelectorAll('.cx-tile').forEach(b=>b.onclick=()=>{ box.querySelectorAll('.cx-tile.sel').forEach(x=>x.classList.remove('sel')); sel=b; b.classList.add('sel'); sfx.pop();
      const x=tiles[+b.dataset.n]; cxSay(x.t, x.s); });
    box.querySelectorAll('.cx-slot').forEach(sl=>sl.onclick=()=>{
      if(!sel || sl.classList.contains('fill')) return;
      const x=tiles[+sel.dataset.n];
      if(x.k===+sl.dataset.k && x.s===sl.dataset.s){ sl.textContent=x.t; sl.classList.add('fill'); if(x.s==='zh') sl.classList.add('zh'); sel.classList.add('used'); sel.disabled=true; sel=null; sfx.ok(); cxStarAdd(1);
        if(!--left){ clearInterval(timer); const secs=Math.round((Date.now()-t0)/1000); const tot=its.length*(three?2:1);
          cxT(()=>cxFinish(Math.max(0,1-miss/tot), `<h3>Nối đúng hết rồi! <span class="zh">太棒了！</span></h3>`,
            {again:()=>{mode=0;run();}, challenge: ex.timed&&!mode?()=>{mode=1;run();}:null, rec: mode?{sc:tot-miss>0?tot-miss:0,t:secs}:null}),600); }
      } else { miss++; sfx.no(); cxFlash(sl,false); cxFlash(sel,false); }
    });
    if(mode){ const bar=box.querySelector('#tbar'); timer=setInterval(()=>{ if(!document.body.contains(box)){ clearInterval(timer); return; } const f=1-(Date.now()-t0)/(lim*1000); if(bar) bar.style.width=Math.max(0,f*100)+'%';
      if(f<=0){ clearInterval(timer); cxFinish(Math.max(0,1-(miss+left)/(its.length*(three?2:1))), `<h3>Hết giờ rồi! Con chơi lại nhé.</h3>`,{again:()=>{mode=0;run();},challenge:()=>{mode=1;run();}}); } },250); }
  };
  run();
}

/* ---------- D. ĐIỀN CHỖ TRỐNG (Missing word) ---------- */
function cxMissing(ex, box){
  const its=ex.items; let i=0, miss=0, marks=[];
  (function show(){
    if(i>=its.length) return cxFinish(Math.max(0,1-miss/(its.length*2)));
    cxDots(i,its.length,marks); const x=its[i]; let tried=false;
    box.innerHTML=`<div class="cx-card"><div class="cx-q">${badge('en')}<span class="cx-tx">${esc(x.en)}</span>${spk('en','id="se"')}</div>
      <div class="cx-arrow">↓</div>
      <div class="cx-gapline zh">${badge('zh')}<span>${esc(x.pre)}</span><span class="cx-gap" id="gap">?</span><span>${esc(x.post)}</span></div></div>
      <div class="cx-bank">${x.opts.map((o,n)=>`<button class="cx-tile zh big" data-n="${n}">${esc(o)}<small>${esc(x.py[o]||'')}</small></button>`).join('')}</div>`;
    box.querySelector('#se').onclick=()=>cxSay(x.en,'en'); cxT(()=>cxSay(x.en,'en'),300);
    box.querySelectorAll('.cx-tile').forEach(b=>b.onclick=()=>{
      const o=x.opts[+b.dataset.n], gap=box.querySelector('#gap');
      if(o===x.ans){ gap.textContent=o; gap.classList.add('ok'); sfx.ok(); if(!tried) cxStarAdd(1); marks[i]=tried?'bad':'good';
        box.querySelectorAll('.cx-tile').forEach(t=>t.disabled=true); cxSay(x.full,'zh', null, ()=>{}); cxT(()=>{ i++; show(); }, 2200); }
      else { tried=true; miss++; sfx.no(); cxFlash(b,false); cxSay(o,'zh'); }
    });
  })();
}

/* ---------- G. XẾP CÂU (Unjumble) ---------- */
function cxUnjumble(ex, box){
  const its=ex.items; let i=0, miss=0, marks=[];
  (function show(){
    if(i>=its.length) return cxFinish(Math.max(0,1-miss/(its.length*2)));
    cxDots(i,its.length,marks); const x=its[i]; const bank=shuffle(x.tiles.map((t,k)=>({...t,k}))); let line=[]; let tried=false;
    const draw=()=>{
      box.innerHTML=`<div class="cx-card"><div class="cx-q">${badge('en')}<span class="cx-tx">${esc(x.en)}</span>${spk('en','id="se"')}</div><div class="cx-arrow">↓</div>
        <div class="cx-line" id="ln">${line.length?line.map((t,n)=>`<button class="cx-tile zh in" data-n="${n}">${esc(t.t)}<small>${esc(t.py)}</small></button>`).join(''):'<span class="cx-ph">Chạm các thẻ bên dưới theo thứ tự</span>'}</div></div>
        <div class="cx-bank">${bank.map((t,n)=>`<button class="cx-tile zh big ${line.includes(t)?'used':''}" data-b="${n}" ${line.includes(t)?'disabled':''}>${esc(t.t)}<small>${esc(t.py)}</small></button>`).join('')}</div>
        <div class="cx-bot"><button class="cx-pill" id="clr">↺ Xếp lại</button><button class="cx-go" id="chk" ${line.length===x.tiles.length?'':'disabled'}>Kiểm tra ✓</button></div>`;
      box.querySelector('#se').onclick=()=>cxSay(x.en,'en');
      box.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ const t=bank[+b.dataset.b]; line.push(t); sfx.pop(); cxSay(t.t,'zh'); draw(); });
      box.querySelectorAll('#ln .cx-tile').forEach(b=>b.onclick=()=>{ line.splice(+b.dataset.n,1); draw(); });
      box.querySelector('#clr').onclick=()=>{ line=[]; draw(); };
      box.querySelector('#chk').onclick=()=>{
        const ok=line.every((t,n)=>t.t===x.tiles[n].t);
        const ln=box.querySelector('#ln'); cxFlash(ln, ok);
        if(ok){ sfx.ok(); if(!tried) cxStarAdd(1); marks[i]=tried?'bad':'good'; cxSay(x.tiles.map(t=>t.t).join('').replace(/\s/g,''),'zh'); cxT(()=>{ i++; show(); },2400); }
        else { tried=true; miss++; sfx.no(); toast('Gần đúng rồi! Con xếp lại nhé.'); }
      };
    };
    draw(); cxT(()=>cxSay(x.en,'en'),300);
  })();
}

/* ---------- H. ĐÚNG HAY SAI ---------- */
function cxTF(ex, box){
  let mode=0;
  const run=()=>{
    const its=mode?shuffle(ex.items):ex.items; let i=0, score=0, marks=[], t0=Date.now(), timer=null;
    (function show(){
      clearInterval(timer);
      if(i>=its.length){ const secs=Math.round((Date.now()-t0)/1000);
        return cxFinish(score/its.length, `<h3>Đúng ${score}/${its.length} câu!</h3>`, {again:()=>{mode=0;run();}, challenge: ex.timed&&!mode?()=>{mode=1;run();}:null, rec: mode?{sc:score,t:secs}:null}); }
      cxDots(i,its.length,marks); const x=its[i];
      const side=(y)=>`<div class="cx-tfs">${badge(y.l)}${txtHTML(y, !CX.stage2 && y.l==='zh')}${y.l==='zh'||CX.stage2?spk(y.l,'data-t="'+esc(y.t)+'" data-l="'+y.l+'"'):''}</div>`;
      box.innerHTML=`<div class="cx-card">${mode?`<div class="cx-timer"><i id="tbar"></i></div>`:''}<div class="cx-tfpair">${side(x.a)}<div class="cx-eq">=</div>${side(x.b)}</div><div class="cx-fb" id="fb"></div></div>
        <div class="cx-opts n2"><button class="cx-opt tfy" data-v="1">✓ Đúng</button><button class="cx-opt tfn" data-v="0">✗ Sai</button></div>`;
      box.querySelectorAll('.cx-spk').forEach(b=>b.onclick=()=>cxSay(b.dataset.t,b.dataset.l));
      const z=x.a.l==='zh'?x.a:x.b; cxT(()=>cxSay(z.t,'zh'),300);
      let locked=false;
      const ans=(b,v)=>{ if(locked) return; locked=true; clearInterval(timer);
        const ok=v===x.ok; if(b) cxFlash(b,ok); if(ok){ score++; cxStarAdd(1); sfx.ok(); } else sfx.no(); marks[i]=ok?'good':'bad';
        box.querySelector('#fb').innerHTML=`${x.ok?'✓ Hai bên cùng nghĩa.':'✗ Chưa cùng nghĩa.'} ${x.note?esc(x.note):''}`;
        cxT(()=>{ i++; show(); }, ok?1500:2600); };
      box.querySelectorAll('.cx-opt').forEach(b=>b.onclick=()=>ans(b, b.dataset.v==='1'));
      if(mode){ const bar=box.querySelector('#tbar'), s=Date.now(); timer=setInterval(()=>{ if(!document.body.contains(box)){ clearInterval(timer); return; } const f=1-(Date.now()-s)/30000; bar.style.width=Math.max(0,f*100)+'%'; if(f<=0) ans(null,null); },200); }
    })();
  };
  run();
}

/* ---------- I. PHÂN NHÓM (Group sort) ---------- */
function cxSort(ex, box){
  const its=shuffle(ex.items.map((x,k)=>({...x,k}))); let sel=null, left=its.length, miss=0;
  box.innerHTML=`<div class="cx-card"><div class="cx-groups n${ex.groups.length}">${ex.groups.map((g,n)=>`<div class="cx-grp" data-g="${n}"><h4 class="zh">${esc(g)}</h4><div class="cx-gin"></div></div>`).join('')}</div></div>
    <div class="cx-bank">${its.map((x,n)=>`<button class="cx-tile zh big ${x.img?'withimg':''}" data-n="${n}">${x.img?cxImg(x.img,'cx-tim'):''}${esc(x.zh)}<small>${CX.stage2?'🔊':esc(x.py)}</small></button>`).join('')}</div>
    <div class="cx-bot"><span class="cx-mode">Chọn 1 thẻ (nghe đọc), rồi chạm vào nhóm đúng</span></div>`;
  box.querySelectorAll('.cx-tile').forEach(b=>b.onclick=()=>{ box.querySelectorAll('.cx-tile.sel').forEach(x=>x.classList.remove('sel')); sel=b; b.classList.add('sel'); cxSay(its[+b.dataset.n].zh,'zh'); });
  box.querySelectorAll('.cx-grp').forEach(gp=>gp.onclick=()=>{
    if(!sel) return; const x=its[+sel.dataset.n];
    if(x.g===+gp.dataset.g){ gp.querySelector('.cx-gin').insertAdjacentHTML('beforeend',`<span class="cx-chip zh">${esc(x.zh)}</span>`); sel.remove(); sel=null; sfx.ok(); cxStarAdd(1); cxFlash(gp,true);
      if(!--left) cxT(()=>cxFinish(Math.max(0,1-miss/its.length), `<h3>Xếp đúng hết rồi! <span class="zh">太棒了！</span></h3>`),600); }
    else { miss++; sfx.no(); cxFlash(gp,false); }
  });
}

/* ---------- J. TRUYỆN SONG NGỮ + câu hỏi ---------- */
function cxStory(ex, box){
  const S=ex.sents; let i=0, lang=ex.first, showPy=!CX.stage2, auto=false;
  const page=()=>{
    cxDots(i,S.length);
    const x=S[i];
    box.innerHTML=`<div class="cx-card cx-story">
        <div class="cx-sthead">${cxFace(ex.narrator)}<b>${esc(ex.title.replace('Truyện: ',''))}</b><span>Trang ${i+1}/${S.length}</span></div>
        ${cxImg(x.img,'cx-pic st')}
        <div class="cx-stz ${lang==='zh'?'on':''}"><span class="zh">${esc(x.zh)}</span>${showPy?`<div class="cx-py">${esc(x.py)}</div>`:''}${spk('zh','id="sz"')}</div>
        <div class="cx-ste ${lang==='en'?'on':''}">${esc(x.en)}${spk('en','id="se"')}</div></div>
      <div class="cx-bot"><button class="cx-pill" id="pv" ${i?'':'disabled'}>←</button>
        <button class="cx-pill" id="all">${auto?'⏸ Dừng':'▶ Đọc cả truyện ('+(lang==='zh'?'中文':'English')+')'}</button>
        <button class="cx-pill" id="lg">Đổi sang ${lang==='zh'?'English':'中文'}</button>
        <button class="cx-pill" id="py">${showPy?'Ẩn':'Hiện'} pinyin</button>
        <button class="cx-pill" id="nx">${i<S.length-1?'→':'✓'}</button>
        <button class="cx-go" id="qz">Làm câu hỏi →</button></div>`;
    const sayPage=(cb)=>cxSay(lang==='zh'?x.zh:x.en, lang, ex.narrator, cb);
    box.querySelector('#sz').onclick=()=>cxSay(x.zh,'zh',ex.narrator);
    box.querySelector('#se').onclick=()=>cxSay(x.en,'en',ex.narrator);
    box.querySelector('#pv').onclick=()=>{ auto=false; if(i){ i--; page(); sayPage(); } };
    box.querySelector('#nx').onclick=()=>{ auto=false; if(i<S.length-1){ i++; page(); sayPage(); } };
    box.querySelector('#lg').onclick=()=>{ lang=lang==='zh'?'en':'zh'; auto=false; page(); sayPage(); };
    box.querySelector('#py').onclick=()=>{ showPy=!showPy; page(); };
    box.querySelector('#all').onclick=()=>{ if(auto){ auto=false; cxStop(); page(); return; } auto=true; i=0; const step=()=>{ page(); sayPage(()=>{ if(!auto) return; if(i<S.length-1){ i++; cxT(step,500); } else { auto=false; page(); } }); }; step(); };
    box.querySelector('#qz').onclick=()=>{ auto=false; cxStop(); quiz(); };
  };
  const quiz=()=>{
    const full=l=>S.map(x=>l==='zh'?x.zh:x.en).join(l==='zh'?'':' ');
    const part2=ex.questions.findIndex(q=>q.p.part===2);
    const listenBtn=()=>{ const st=document.getElementById('cxbox'); const bar=document.createElement('div'); bar.className='cx-relisten';
      bar.innerHTML=`<button class="cx-pill" data-l="${ex.first}">🎧 Nghe lại truyện (${ex.first==='zh'?'中文':'English'})</button>${part2>=0?`<button class="cx-pill" data-l="zh">🎧 Nghe truyện (中文)</button>`:''}`;
      st.parentNode.insertBefore(bar, st);
      bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{ const l=b.dataset.l; cxSeq(S.map(x=>({t:l==='zh'?x.zh:x.en,l,who:ex.narrator}))); }); };
    listenBtn();
    cxQuiz(ex, box, ex.questions);
  };
  page(); cxT(()=>box.querySelector('#all').click(), 400);
}

/* ---------- K. GIẢI ĐỐ NL8 ---------- */
function cxPuzzle(ex, box){
  const qs=[];
  ex.items.forEach(it=>{
    const base={passage:it.passage, people:it.people, grid:it.grid};
    if(it.lead) qs.push({...base, p:{...it.lead.q, audio:true}, o:it.lead.o, a:it.lead.a});
    qs.push({...base, p:it.q, o:it.o, a:it.a});
  });
  const go=()=>cxQuiz(ex, box, qs);
  if(ex.intro && ex.intro.length){
    box.innerHTML=`<div class="cx-card"><h3 class="cx-h">Chìa khoá giải đố</h3><p class="cx-sub">Nhớ 4 chữ này: chúng hay đánh lừa con!</p>
      <div class="cx-keys">${ex.intro.map((x,k)=>`<button class="cx-key" data-k="${k}"><span class="zh">${esc(x.zh)}</span><small>${esc(x.py)}</small><b>${esc(x.en)}</b></button>`).join('')}</div></div>
      <div class="cx-bot"><button class="cx-go" id="go">Bắt đầu giải đố →</button></div>`;
    box.querySelectorAll('.cx-key').forEach(b=>b.onclick=()=>{ const x=ex.intro[+b.dataset.k]; cxSay(x.zh,'zh',null,()=>cxSay(x.en,'en')); });
    box.querySelector('#go').onclick=go;
  } else go();
}

/* ---------- M. GHÉP CHỮ (Anagram) ---------- */
function cxAnagram(ex, box, itemsIn, onDone){
  const its=itemsIn||ex.items; let i=0, miss=0, marks=[];
  (function show(){
    if(i>=its.length) return onDone?onDone():cxFinish(Math.max(0,1-miss/(its.length*3)));
    if(!onDone) cxDots(i,its.length,marks);
    const x=its[i], zhT=!!x.zhTarget; const ans=[...(zhT?x.zhTarget:x.en.toLowerCase())];
    const pool=shuffle(zhT?[...ans, ...(x.extra||[])]:ans.filter(c=>c!==' '));
    let fill=ans.map(c=>c===' '?' ':null), tried=false;
    const draw=()=>{
      box.innerHTML=`<div class="cx-card cx-ana">${cxImg(x.img,'cx-pic sm')}
        <div class="cx-q">${badge(zhT?'en':'zh')}${zhT?`<span class="cx-tx">${esc(x.en)}</span>`:zhHTML({t:x.zh,py:x.py},!!x.py)}${spk(zhT?'en':'zh','id="sp"')}</div><div class="cx-arrow">↓</div>
        <div class="cx-boxes">${badge(zhT?'zh':'en')}${fill.map((c,n)=>c===' '?'<span class="cx-sp"></span>':`<span class="cx-lb ${c?'f':''} ${zhT?'zh':''}" data-n="${n}">${c?esc(c):''}</span>`).join('')}</div></div>
        <div class="cx-bank">${pool.map((c,n)=>`<button class="cx-tile let ${zhT?'zh':''}" data-n="${n}">${esc(c)}</button>`).join('')}</div>`;
      box.querySelector('#sp').onclick=()=>zhT?cxSay(x.en,'en'):cxSay(x.zh,'zh');
      box.querySelectorAll('.cx-lb.f').forEach(b=>b.onclick=()=>{ const n=+b.dataset.n; pool.push(fill[n]); fill[n]=null; draw(); });
      box.querySelectorAll('.cx-tile').forEach(b=>b.onclick=()=>{
        const n=fill.findIndex(c=>c===null); if(n<0) return; const c=pool.splice(+b.dataset.n,1)[0]; fill[n]=c; sfx.pop();
        if(fill.every(c=>c!==null)){
          const ok=fill.join('')===ans.join('');
          if(ok){ draw(); cxFlash(box.querySelector('.cx-boxes'),true); sfx.ok(); if(!tried) cxStarAdd(1); marks[i]=tried?'bad':'good'; cxSay(zhT?x.zhTarget:x.en, zhT?'zh':'en'); cxT(()=>{ i++; show(); },1600); return; }
          tried=true; miss++; sfx.no();
          fill=fill.map((c,k)=>c===ans[k]?c:(c===' '?' ':(pool.push(c),null))); draw(); cxFlash(box.querySelector('.cx-boxes'),false); return;
        }
        draw();
      });
    };
    draw(); cxT(()=>zhT?cxSay(x.en,'en'):cxSay(x.zh,'zh'),300);
  })();
}
