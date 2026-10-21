/* =====================================================================
   CANOPY · L. TRANG LUYỆN NÓI (logic cô đã duyệt)
   tranh + nhãn ở một tiếng → con nói ở tiếng kia · máy chỉ kiểm tra từ khoá
   2 lần thử · không bao giờ báo sai · "Chưa muốn nói? Ghép chữ"
   ===================================================================== */
const CX_SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let cxStream=null;
function cxNorm(s){ return String(s||'').toLowerCase().replace(/[\s.,!?;:'"，。！？、：；“”‘’()\-]/g,''); }
function cxMatchKeys(alts, keys){ const A=alts.map(cxNorm); return keys.some(k=>{ const n=cxNorm(k); return n && A.some(a=>a.includes(n)); }); }
async function cxMic(){
  if(cxStream) return cxStream;
  try{ cxStream=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ cxStream=null; }
  return cxStream;
}
/* nghe 1 lượt: trả về {alts:[...], blob, err} */
function cxListen(lang, maxMs, onLevel){
  return new Promise(async res=>{
    let alts=[], err=null, rec=null, chunks=[], doneN=0, finished=false;
    const stream=await cxMic();
    const end=()=>{ if(finished) return; finished=true; clearTimeout(to);
      try{ rec && rec.state!=='inactive' && rec.stop(); }catch(e){}
      cxT(()=>res({alts, err, blob: chunks.length?new Blob(chunks,{type:(rec&&rec.mimeType)||'audio/webm'}):null}), 250); };
    if(stream && window.MediaRecorder){ try{ rec=new MediaRecorder(stream); rec.ondataavailable=e=>e.data&&e.data.size&&chunks.push(e.data); rec.start(); }catch(e){ rec=null; } }
    let to=setTimeout(()=>{ try{ sr&&sr.stop(); }catch(e){} end(); }, maxMs);
    let sr=null;
    if(CX_SR){
      try{
        sr=new CX_SR(); sr.lang=lang==='zh'?'zh-CN':'en-US'; sr.interimResults=false; sr.maxAlternatives=5; sr.continuous=false;
        sr.onresult=e=>{ for(const r of e.results) for(const a of r) alts.push(a.transcript); };
        sr.onerror=e=>{ err=e.error||'error'; };
        sr.onend=()=>end();
        sr.start();
      }catch(e){ err='start'; }
    } else err='unsupported';
    window.cxStopListen=()=>{ try{ sr&&sr.stop(); }catch(e){} if(!sr) end(); };
  });
}

function cxSpeak(ex, box){
  // gom các lượt nói
  const turns = ex.mode==='qa'
    ? [...ex.qa.map(x=>({kind:'qa', q:x.q, to:x.model, keys:x.keys, frame:cxFrame(x.model.t, x.keys)})),
       ...ex.strips.map(x=>({kind:'strip', img:x.img, label:x.label, to:x.to, keys:x.keys}))]
    : ex.items.map(x=>({kind:'word', img:x.img, frm:x.frm, to:x.to, keys:x.keys, hint:x.hint}));
  const res=turns.map(()=>null);   // 'say' | 'say2' | 'try' | 'ana' | 'nochk'
  const voiceUrl=turns.map(()=>null);
  const first = ex.order!=='speak-first';
  let i=0, queue=turns.map((_,k)=>k);

  const lab = l => l==='zh'?'中文':'English';
  const praise = l => l==='zh'?'真棒！':'Great job!';
  const again = l => l==='zh'?'再说一次！':'Try again!';

  function show(k, attempt){
    i=k; cxDots(queue.indexOf(k), queue.length, queue.map(n=>res[n]==='say'||res[n]==='say2'?'good':res[n]?'tried':''));
    const t=turns[k], tl=t.to.l;
    const left = t.kind==='qa'
      ? `<div class="sp-qbox">${cxFace(CX.day.cx.comp,'big')}<div class="sp-q">${badge(t.q.l)}<span class="${t.q.l==='zh'?'zh':''}">${esc(t.q.t)}</span>${spk(t.q.l,'id="sq"')}</div></div>`
      : `${cxImg(t.img,'cx-pic sp')}`;
    const fromRow = t.kind==='word' ? `<div class="sp-from">${badge(t.frm.l)}<span class="sp-w ${t.frm.l==='zh'?'zh':''}">${esc(t.frm.t)}</span>${spk(t.frm.l,'id="sf"')}</div>`
      : t.kind==='strip' ? `<div class="sp-from"><span class="sp-tag">${esc(t.label)}</span></div>`
      : `<div class="sp-frame">${esc(t.frame)}</div>`;
    box.innerHTML=`<div class="cx-card sp-card"><div class="sp-left">${left}</div>
        <div class="sp-right">${fromRow}<div class="sp-arrow">↓</div>
          <div class="sp-target"><span class="sp-chip">${CX_SVG.mic.replace('40','22').replace('40','22')} <b class="${tl==='zh'?'zh':''}">${lab(tl)}</b></span><span class="sp-ans" id="ans">?</span></div>
          <div id="spmsg"></div></div></div>
      <div class="sp-bot">
        <div class="sp-l">${!first||attempt? (voiceUrl[k]?`<button class="cx-pill" id="mine">🎧 Nghe giọng con</button>`:'') : `<button class="cx-pill" id="model">🔊 Nghe mẫu</button>`}
          ${!first&&t.hint&&!attempt?`<button class="cx-pill" id="hint">💡 Gợi ý</button>`:''}</div>
        <div class="sp-mid"><button class="sp-mic" id="mic">${CX_SVG.mic}</button><div class="sp-cap" id="cap">${attempt?'Nói lại · lần 2/2':'Bấm để nói'}</div></div>
        <div class="sp-r">${attempt?`<button class="cx-pill" id="skip">Bỏ qua →</button>`:`<button class="cx-pill" id="ana">🔤 Chưa muốn nói? Ghép chữ</button>`}</div></div>
      ${!CX_SR?`<div class="sp-warn">Máy này chưa nghe được giọng nói. Bố mẹ mở trang bằng <b>Chrome</b> (máy tính hoặc Android) để máy chấm. Con vẫn nói và bố mẹ bấm xác nhận nhé.</div>`:''}`;
    const sq=box.querySelector('#sq'); if(sq) sq.onclick=()=>cxSay(t.q);
    /* tự động: đọc đề → tự bật micro (không cần bấm) */
    const autoGo=()=>cxT(()=>{ const m=box.querySelector('#mic'); if(CX.ex===ex && i===k && m && !m.classList.contains('on')) listen(k, attempt); }, 450);
    if(!attempt){ const pr = t.kind==='qa' ? t.q : t.kind==='word' ? t.frm : null;
      if(pr) cxT(()=>cxSay(pr, ()=>autoGo()), 350); else cxT(autoGo, 600); }
    const sf=box.querySelector('#sf'); if(sf) sf.onclick=()=>cxSay(t.frm);
    const md=box.querySelector('#model'); if(md) md.onclick=()=>cxSay(t.to);
    const mi=box.querySelector('#mine'); if(mi) mi.onclick=()=>{ cxStop(); const a=new Audio(voiceUrl[k]); curAudio=a; a.play().catch(()=>{}); };
    const hn=box.querySelector('#hint'); if(hn) hn.onclick=()=>{ box.querySelector('#ans').innerHTML=`<span class="${tl==='zh'?'':'en'}">${esc(t.hint)}</span>`; };
    const sk=box.querySelector('#skip'); if(sk) sk.onclick=()=>{ res[k]=res[k]||'try'; next(); };
    const an=box.querySelector('#ana'); if(an) an.onclick=()=>anagram(k);
    box.querySelector('#mic').onclick=()=>listen(k, attempt);
  }

  async function listen(k, attempt){
    const t=turns[k], mic=box.querySelector('#mic');
    if(mic.classList.contains('on')){ window.cxStopListen&&window.cxStopListen(); return; }
    cxStop(); mic.classList.add('on'); mic.innerHTML='<i class="sp-sq"></i>';
    const ansEl=box.querySelector('#ans'); if(ansEl){ ansEl.innerHTML='<span class="sp-dots"><i></i><i></i><i></i></span>'; ansEl.classList.add('wait'); }
    box.querySelector('#cap').innerHTML=`<span class="sp-wave l"><i></i><i></i><i></i><i></i><i></i></span><div class="sp-bar"><i></i></div><span class="sp-wave r"><i></i><i></i><i></i><i></i><i></i></span><div class="sp-rec">🔴 Đang thu… con nói đi!</div>`;
    const r=await cxListen(t.to.l, t.kind==='word'?5000:8000);
    if(!document.body.contains(box) || CX.ex!==ex) return;   // con đã rời trang
    if(r.blob) voiceUrl[k]=URL.createObjectURL(r.blob);
    if(!CX_SR || (r.err && /not-allowed|service-not-allowed|audio-capture|network|unsupported|start/.test(r.err))){
      return selfCheck(k, r);
    }
    const ok=cxMatchKeys(r.alts, t.keys);
    if(ok){ res[k]= attempt?'say2':'say'; success(k); }
    else if(!attempt){ retry(k); }
    else { res[k]='try'; tried(k); }
  }

  function answerCard(t, cls){ const z=t.to.l==='zh';
    return `<div class="sp-card2 ${cls}">${z?`<span class="zh sp-big">${esc(t.to.t)}</span><span class="cx-py">${esc(t.to.py||'')}</span>`:`<span class="sp-big en">${esc(t.to.t)}</span>`}${spk(t.to.l+' '+(cls==='good'?'g':'o'),'id="sm"')}</div>`; }
  function head(t,good){ return `<div class="sp-head ${good?'good':'warm'}">${good?CX_SVG.star:CX_SVG.star0}<b class="${t.to.l==='zh'?'zh':''}">${good?praise(t.to.l):again(t.to.l)}</b></div>`; }
  function rightSide(k, good){ const t=turns[k];
    const fr = t.kind==='word' ? `<div class="sp-mini">${badge(t.frm.l)}<span class="${t.frm.l==='zh'?'zh':''}">${esc(t.frm.t)}</span> →</div>` : '';
    return head(t,good)+fr+answerCard(t, good?'good':'warm'); }

  function success(k){
    const t=turns[k]; sfx.ok(); cxStarAdd(1);
    box.querySelector('.sp-right').innerHTML=rightSide(k,true);
    box.querySelector('#sm').onclick=()=>cxSay(t.to);
    box.querySelector('.sp-bot').innerHTML=`<div class="sp-l"></div><div class="sp-mid sp-row">${voiceUrl[k]?`<button class="cx-pill" id="mine">🎧 Nghe giọng con</button>`:''}<button class="cx-pill" id="model">🔊 Nghe mẫu</button><button class="cx-go g" id="nx">Tiếp →</button></div><div class="sp-r"></div>`;
    wire(k); playBackThenNext(k, true);
  }
  function retry(k){
    const t=turns[k]; sfx.pop();
    show(k, 1);
    box.querySelector('.sp-right').innerHTML=rightSide(k,false);
    box.querySelector('#sm').onclick=()=>cxSay(t.to);
    cxT(()=>cxSay(t.to, ()=>cxT(()=>{ const m=box.querySelector('#mic'); if(CX.ex===ex && i===k && m && !m.classList.contains('on')) listen(k,1); }, 450)),300);
  }
  function tried(k){
    const t=turns[k];
    box.querySelector('.sp-right').innerHTML=`<div class="sp-head warm">${CX_SVG.star0}<b>Con đã cố gắng rồi, tem này của con!</b></div>`+answerCard(t,'warm');
    box.querySelector('#sm').onclick=()=>cxSay(t.to);
    box.querySelector('.sp-bot').innerHTML=`<div class="sp-l"></div><div class="sp-mid sp-row">${voiceUrl[k]?`<button class="cx-pill" id="mine">🎧 Nghe giọng con</button>`:''}<button class="cx-go g" id="nx">Tiếp →</button></div><div class="sp-r"></div>`;
    wire(k); playBackThenNext(k, false);
  }
  /* thu xong: phát lại giọng con → (nghe mẫu) → tự sang câu tiếp */
  function playBackThenNext(k, model){
    const t=turns[k];
    const go=()=>cxT(()=>{ if(CX.ex===ex && i===k && document.body.contains(box)) next(); }, 1600);
    const mdl=()=>model ? cxSay(t.to, go) : go();
    cxT(()=>{ if(voiceUrl[k]){ const m=box.querySelector('#mine'); if(m) m.classList.add('playing');
        voicePlay(voiceUrl[k],{onend:()=>{ if(m) m.classList.remove('playing'); mdl(); }, onerr:mdl}); } else mdl(); }, 400);
  }
  function selfCheck(k, r){
    const t=turns[k];
    box.querySelector('.sp-right').innerHTML=`<div class="sp-head warm">${CX_SVG.star0}<b>Bố mẹ nghe con nói nhé</b></div>`+answerCard(t,'warm')+`<div class="sp-note">Máy chưa chấm được ở trình duyệt này. Bố mẹ so với câu mẫu rồi bấm xác nhận.</div>`;
    box.querySelector('#sm').onclick=()=>cxSay(t.to);
    box.querySelector('.sp-bot').innerHTML=`<div class="sp-l"></div><div class="sp-mid sp-row">${voiceUrl[k]?`<button class="cx-pill" id="mine">🎧 Nghe giọng con</button>`:''}<button class="cx-go g" id="ok">✓ Con nói được rồi</button><button class="cx-pill" id="no">Để lần sau</button></div><div class="sp-r"></div>`;
    wire(k);
    box.querySelector('#ok').onclick=()=>{ res[k]='nochk'; cxStarAdd(1); sfx.ok(); next(); };
    box.querySelector('#no').onclick=()=>{ res[k]='try'; next(); };
  }
  function wire(k){
    const mi=box.querySelector('#mine'); if(mi) mi.onclick=()=>{ cxStop(); voicePlay(voiceUrl[k]); };
    const md=box.querySelector('#model'); if(md) md.onclick=()=>cxSay(turns[k].to);
    const nx=box.querySelector('#nx'); if(nx) nx.onclick=()=>{ i=-1; next0(k); };
  }
  function anagram(k){
    const t=turns[k], z=t.to.l==='zh';
    const its=[ z ? {en:t.kind==='word'?t.frm.t:t.to.t, img:t.img, zhTarget:t.to.t.replace(/[，。？！\s]/g,''), extra:cxExtraChars(t.to.t)}
                  : {en:t.to.t.replace(/[.,!?]/g,''), zh:t.kind==='word'?t.frm.t:'', py:t.kind==='word'?t.frm.py:'', img:t.img} ];
    cxAnagram(CX.ex, box, its, ()=>{ res[k]='ana'; cxStarAdd(0); next(); });
  }
  function next(){ next0(i); }
  function next0(cur){
    cxStop();
    const pos=queue.indexOf(cur);
    if(pos<queue.length-1) return show(queue[pos+1], 0);
    summary();
  }
  function summary(){
    const good=res.filter(r=>r==='say'||r==='say2'||r==='ana'||r==='nochk').length;
    const left=turns.map((_,k)=>k).filter(k=>res[k]==='try'||!res[k]);
    const label={say:'Nói khớp', say2:'Nói khớp sau khi nghe mẫu', ana:'Ghép chữ', nochk:'Bố mẹ xác nhận', try:'Đã cố gắng · nói lại sau'};
    cxDots(0,0); const tt=document.getElementById('ctitle'); if(tt) tt.textContent=CX.ex.title;
    box.innerHTML=`<div class="sp-sum"><div class="sp-sumh">${CX_SVG.star}<b>${good}/${turns.length}</b><span class="zh g">${good>=turns.length-1?'太棒了！':'加油！'}</span><span class="en">${good>=turns.length/2?'Well done!':'Good try!'}</span></div>
      <div class="sp-grid">${turns.map((t,k)=>`<div class="sp-it">${t.img?cxImg(t.img,'sp-thumb'):`<span class="sp-thumb q">💬</span>`}<span class="sp-ic">${res[k]==='ana'?'🔤':(res[k]==='say'||res[k]==='say2'||res[k]==='nochk')?CX_SVG.star:CX_SVG.star0}</span>
        <div class="sp-pair">${t.kind==='word'?`<span class="${t.frm.l==='zh'?'zh':''}">${esc(t.frm.t)}</span> → `:''}<b class="${t.to.l==='zh'?'zh':''}">${esc(t.to.t)}</b></div>
        <small class="${res[k]==='try'||!res[k]?'w':res[k]==='ana'?'y':'g'}">${label[res[k]||'try']}</small></div>`).join('')}</div></div>
      <div class="cx-bot">${left.length?`<button class="cx-pill warm" id="redo">🎤 Nói lại từ chưa được (${left.length})</button>`:''}<button class="cx-go g" id="fin">✓ Xong</button></div>`;
    const rd=box.querySelector('#redo'); if(rd) rd.onclick=()=>{ queue=left; left.forEach(k=>res[k]=null); show(queue[0],0); };
    box.querySelector('#fin').onclick=()=>cxFinish(good/turns.length, `<h3>Con đã nói ${good}/${turns.length} mục! <span class="zh">太棒了！</span></h3>`, {again:()=>cxSpeak(ex,box)});
  }
  show(0,0);
}
/* khung câu: thay từ khoá bằng ___ */
function cxFrame(model, keys){
  for(const k of keys.slice().sort((a,b)=>b.length-a.length)){
    const i=model.toLowerCase().indexOf(k.toLowerCase());
    if(i>=0){ const art=/^(the|a|an) /i; let s=model.slice(0,i)+'___'+model.slice(i+k.length); return s.replace(/\b(the|a|an) ___/i,'___'); }
  }
  return model;
}
function cxExtraChars(t){ const pool='家学校商店公园饭动物车飞机火医生师爸妈哥姐上下早晚'.split('').filter(c=>!t.includes(c)); return shuffle(pool).slice(0,2); }
