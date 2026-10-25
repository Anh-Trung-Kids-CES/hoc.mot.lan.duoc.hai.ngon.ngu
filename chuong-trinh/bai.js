/* Trình phát bài tự học. Màn bài không có chữ tiếng Việt: chỉ hình, biểu tượng, giọng tiếng Anh và tiếng Trung. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.getElementById('player');
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
let S=null; // trạng thái bài đang mở
const HINT=/[?&]thu=1/.test(location.search)?300:7000; // ?thu=1: gợi ý nhanh để thầy cô chạy thử

/* ---------- âm thanh ---------- */
let cur=null, tok=0, actx=null;
function stop(){ tok++; try{ speechSynthesis.cancel(); }catch(e){} if(cur){ try{ cur.onended=null; cur.ontimeupdate=null; cur.pause(); }catch(e){} cur=null; } }
function tts(text,l,cb){
  if(!('speechSynthesis' in window)||!text){ cb&&cb(); return; }
  const u=new SpeechSynthesisUtterance(String(text).replace(/…|_+/g,' '));
  u.lang=l==='zh'?'zh-CN':'en-US'; u.rate=.85;
  const vs=speechSynthesis.getVoices(); const v=vs.find(v=>v.lang.toLowerCase().startsWith(l==='zh'?'zh':'en')); if(v) u.voice=v;
  u.onend=()=>cb&&cb(); u.onerror=()=>cb&&cb(); speechSynthesis.speak(u);
}
function playFile(f,cb,seg,fallbackText,l){
  const my=++tok;
  let fired=false; const done=()=>{ if(fired) return; fired=true; if(my===tok) cb&&cb(); };
  if(!f){ tts(fallbackText,l,done); return; }
  const a=new Audio(f); cur=a;
  let fell=false; const fb=()=>{ if(fell||my!==tok) return; fell=true; tts(fallbackText,l,done); };
  a.onerror=fb;
  if(seg){ a.currentTime=seg[0]; a.ontimeupdate=()=>{ if(a.currentTime>=seg[1]){ a.pause(); a.ontimeupdate=null; done(); } }; }
  a.onended=done;
  const p=a.play(); if(p&&p.catch) p.catch(fb);
}
function sayItem(x,l,cb){
  if(x.k==='dialog'){ const ls=x.lines.filter(z=>z.l===l); let i=0; const nx=()=>{ if(i>=ls.length){ cb&&cb(); return; } const z=ls[i++]; playFile(z.a,()=>setTimeout(nx,250),null,z.t,l); }; nx(); return; }
  playFile((x.a[l]||[])[0],cb,null,x[l],l);
}
function chime(ok){
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const notes=ok?[660,880,1320]:[220];
    notes.forEach((f,i)=>{ const o=actx.createOscillator(), g=actx.createGain(); o.frequency.value=f; o.type='sine';
      g.gain.setValueAtTime(.0001,actx.currentTime+i*.09); g.gain.exponentialRampToValueAtTime(.18,actx.currentTime+i*.09+.02); g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+i*.09+.25);
      o.connect(g).connect(actx.destination); o.start(actx.currentTime+i*.09); o.stop(actx.currentTime+i*.09+.3); });
  }catch(e){}
}
function flyStar(){ const t=document.createElement('div'); t.className='toast'; t.textContent='⭐'; document.body.appendChild(t); setTimeout(()=>t.remove(),1000); }

/* ---------- vẽ chung ---------- */
const K=id=>ATK.data.kho[id];
const isLS=()=>S.course==='Little Seed'||S.course==='Seedling';
function pic(x,i){ const p=x.pics||[]; return p.length?p[Math.min(i||0,p.length-1)]:''; }
function picHTML(x,i){ const p=pic(x,i); return p?`<img src="${esc(p)}" alt="" draggable="false">`:`<div class="emo">${esc(x.emo||'🔤')}</div>`; }
function label(x){ if(isLS()) return ''; return `<div class="lbl"><span class="en">${esc(x.en)}</span><span class="zh">${esc(x.zh)}</span>${x.py?`<small>${esc(x.py)}</small>`:''}</div>`; }
function stage(html,long){ const st=root.querySelector('.stage-area'); st.classList.toggle('long',!!long); st.innerHTML=html; st.scrollTop=0; return st; }
function icon(t){ return `<div class="act-ic" aria-hidden="true">${({the:'🃏',chon:'👂👆',cau:'💬👆',noi:'🎤',anh_trung:'<span class="flag en">A</span><span class="flag zh">中</span>',ghep:'🧩',truyen:'📖',truyen_hoi:'📖👆',on_nhanh:'🔁',hop_on:'🧠',nhin_chu:'👀',xem:'📺',chon_chu:'🖼️👆',
  kt_en:'<span class="flag en">A</span>👂👆',tt_tu:'🦁🃏',tt_cau:'🦁💬',tt_doan:'🦁📖',tt_hoi:'🦁👂👆',tt_de:'🦁📝',pd_chon:'<span class="flag zh">中</span>👂👆'})[t]||''}</div>`; }
function spk(l,cls){ return `<button class="spk ${l} ${cls||''}" data-l="${l}" aria-label="${l==='zh'?'中文':'English'}">🔊</button>`; }
function next(cb,label){ return {html:`<button class="next" id="nx" aria-label="next">▶</button>`,wire(){ root.querySelector('#nx').onclick=()=>{ stop(); cb(); }; }}; }

/* ---------- câu hỏi chọn (dùng cho chọn tranh, câu, ôn nhanh, hộp ôn, truyện) ---------- */
function quiz(qs, opts, done){
  // qs: [{prompt(cb), opts:[{html,key}], ans, onRight, onWrong}]
  let i=0, first=0;
  const one=()=>{
    if(i>=qs.length){ done(first); return; }
    const q=qs[i]; let tried=false, hintT=null;
    const st=stage(`${icon(opts.icon)}<div class="prompt">${q.promptHTML}</div>
      <div class="opts ${q.cols?'c'+q.cols:''}">${q.opts.map((o,k)=>`<button class="opt ${o.cls||''}" data-k="${k}">${o.html}</button>`).join('')}</div>`);
    const btns=[...st.querySelectorAll('.opt')];
    const arm=()=>{ clearTimeout(hintT); hintT=setTimeout(()=>btns[q.ans]&&btns[q.ans].classList.add('hint'),HINT); };
    const ask=()=>{ const s=st.querySelector('.prompt .spk'); s&&s.classList.add('talk'); q.prompt(()=>{ s&&s.classList.remove('talk'); arm(); }); };
    st.querySelectorAll('.prompt .spk').forEach(b=>b.onclick=ask);
    btns.forEach((b,k)=>b.onclick=()=>{
      if(b.dataset.lock) return;
      q.onTap&&q.onTap(k);
      if(k===q.ans){
        btns.forEach(x=>x.dataset.lock=1); clearTimeout(hintT); b.classList.remove('hint'); b.classList.add('ok'); chime(true);
        if(!tried){ first++; if(!S.extra){ S.stars++; flyStar(); bar(); } }
        q.onRight&&q.onRight(tried);
        const go=()=>{ i++; setTimeout(one,450); };
        q.after?q.after(go):setTimeout(go,700);
      } else {
        b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); chime(false);
        if(!tried){ tried=true; q.onWrong&&q.onWrong(); }
        setTimeout(ask,450);
      }
    });
    setTimeout(ask,350);
  };
  one();
}
function wordQ(id,l,optIds,ans,picIdx,extra){
  const x=K(id);
  return Object.assign({
    promptHTML:spk(l),
    prompt:cb=>sayItem(x,l,cb),
    opts:optIds.map((o,k)=>({html:picHTML(K(o),k===ans?picIdx:Math.max(0,(picIdx||0)-1))})),
    ans,
    onWrong:()=>{ if(x.k==='word') ATK.hop.wrong(id); },
    after:go=>{ const o=l==='en'?'zh':'en'; if(x.k==='word' && x.a[o] && !(o==='zh'&&x.noear)) sayItem(x,o,()=>setTimeout(go,150)); else setTimeout(go,600); }
  },extra||{});
}

/* ---------- các dạng bài ---------- */
const R={};
R.the=(a,done)=>{
  const xs=a.items.map(K); let i=0;
  const one=()=>{
    if(i>=xs.length){ S.stars++; bar(); done(); return; }
    const x=xs[i]; let k=0;
    const st=stage(`${icon('the')}<div class="big">${picHTML(x,0)}</div>${label(x)}
      <div class="row">${spk('en','small')}${x.noear?'':spk('zh','small')}<button class="next" id="nx" disabled aria-label="next">▶</button></div>`);
    const nx=st.querySelector('#nx');
    const hl=l=>st.querySelectorAll('.spk').forEach(b=>b.classList.toggle('talk',b.dataset.l===l));
    st.querySelectorAll('.spk').forEach(b=>b.onclick=()=>{ hl(b.dataset.l); sayItem(x,b.dataset.l,()=>hl('')); });
    nx.onclick=()=>{ stop(); i++; one(); };
    hl('en'); sayItem(x,'en',()=>{ if(x.noear){ hl(''); nx.disabled=false; return; } setTimeout(()=>{ hl('zh'); sayItem(x,'zh',()=>{ hl(''); nx.disabled=false; }); },350); });
  };
  one();
};
R.chon=(a,done)=>{
  quiz(a.qs.map(q=>wordQ(q.id,q.l,q.opts,q.ans,q.pic)),{icon:'chon'},()=>done());
};
R.cau=(a,done)=>{
  quiz(a.qs.map(q=>wordQ(q.id,q.l,q.opts,q.ans,0,{after:go=>setTimeout(go,500)})),{icon:'cau'},()=>done());
};
R.chon_chu=(a,done)=>{
  quiz(a.qs.map(q=>{ const x=K(q.id);
    return {promptHTML:`<div class="big" style="width:min(70%,260px)">${picHTML(x,0)}</div>`,
      prompt:cb=>cb(),
      opts:q.opts.map(o=>{ const y=K(o); return {cls:'txt',html:q.l==='zh'?`<span class="zh">${esc(y.zh)}</span><small>${esc(y.py||'')}</small>`:`<span class="en">${esc(y.en)}</span>`}; }),
      ans:q.ans, onTap:k=>sayItem(K(q.opts[k]),q.l), onWrong:()=>ATK.hop.wrong(q.id), after:go=>setTimeout(go,900)};
  }),{icon:'chon_chu'},()=>done());
};
R.anh_trung=(a,done)=>{
  let i=0;
  const one=()=>{
    if(i>=a.qs.length){ done(); return; }
    const q=a.qs[i], x=K(q.id); let tried=false;
    const st=stage(`${icon('anh_trung')}<div class="prompt">${spk('any')}</div><div class="two"><button class="be" data-l="en">ABC</button><button class="bz" data-l="zh">中文</button></div>`);
    const ask=()=>{ const s=st.querySelector('.spk'); s.classList.add('talk'); sayItem(x,q.l,()=>s.classList.remove('talk')); };
    st.querySelector('.spk').onclick=ask;
    st.querySelectorAll('.two button').forEach(b=>b.onclick=()=>{
      if(b.dataset.l===q.l){ chime(true); if(!tried){ S.stars++; flyStar(); bar(); } b.style.transform='scale(1.06)'; i++; setTimeout(one,700); }
      else { chime(false); tried=true; b.animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:350}); setTimeout(ask,400); }
    });
    setTimeout(ask,350);
  };
  one();
};
R.noi=(a,done)=>{
  let i=0;
  const one=()=>{
    if(i>=a.items.length){ S.stars++; bar(); done(); return; }
    const it=a.items[i], x=K(it.id), dich=a.mode==='dich', to=it.l==='en'?'zh':'en';
    const st=stage(`${icon('noi')}<div class="big" style="width:min(80%,300px)">${picHTML(x,1)}</div>
      ${dich?`<div class="row">${spk(it.l,'small')}<span style="font-size:34px">→</span><span class="flag ${to}">${to==='en'?'A':'中'}</span><span style="font:800 34px var(--fh)">?</span></div>`:`<div class="row">${spk(it.l,'small')}</div>`}
      <div class="row"><div class="mic" id="mic">🎤</div><div class="count" id="ct"></div></div>
      <div id="rev"></div>
      <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`);
    const mic=st.querySelector('#mic'), ct=st.querySelector('#ct'), nx=st.querySelector('#nx');
    const s=st.querySelector('.spk'); s.onclick=()=>{ s.classList.add('talk'); sayItem(x,it.l,()=>s.classList.remove('talk')); };
    nx.onclick=()=>{ stop(); i++; one(); };
    const myTok=++S.seq;
    const count=(n,cb)=>{ if(myTok!==S.seq) return; if(n<=0){ ct.textContent=''; mic.classList.remove('on'); cb(); return; } ct.textContent=n; setTimeout(()=>count(n-1,cb),1000); };
    s.classList.add('talk');
    sayItem(x,it.l,()=>{ s.classList.remove('talk'); if(myTok!==S.seq) return; mic.classList.add('on');
      count(dich?4:3,()=>{
        if(dich){ st.querySelector('#rev').innerHTML=`<div class="row">${spk(to,'small talk')}</div>${isLS()?'':`<div class="lbl">${to==='en'?`<span class="en">${esc(x.en)}</span>`:`<span class="zh">${esc(x.zh)}</span>`}</div>`}`;
          sayItem(x,to,()=>{ const r=st.querySelector('#rev .spk'); r&&r.classList.remove('talk'); setTimeout(()=>{ if(myTok===S.seq){ i++; one(); } },900); }); }
        else setTimeout(()=>{ if(myTok===S.seq){ i++; one(); } },500);
      }); });
  };
  one();
};
R.ghep=(a,done)=>{
  const xs=a.items.map(K).filter(Boolean);
  let cards=[]; xs.forEach(x=>{ cards.push({x,l:'en'}); cards.push({x,l:'zh'}); });
  cards=shuffle(cards); let open=[], got=0, busy=false, moves=0;
  const st=stage(`${icon('ghep')}<div class="mem">${cards.map((c,k)=>`<button class="mc ${c.l==='en'?'e':'z'}" data-k="${k}" aria-label="card">?</button>`).join('')}</div>`);
  const els=[...st.querySelectorAll('.mc')];
  const face=c=>isLS()?`${pic(c.x,0)?`<img src="${esc(pic(c.x,0))}" alt="">`:esc(c.x.emo||'')}`:`<span class="tx ${c.l}" style="color:var(--${c.l})">${esc(c.x[c.l])}</span>`;
  els.forEach((b,k)=>b.onclick=()=>{
    if(busy||b.classList.contains('open')||b.classList.contains('got')) return;
    const c=cards[k]; b.classList.add('open'); b.innerHTML=face(c); sayItem(c.x,c.l); open.push(k);
    if(open.length===2){
      busy=true; moves++;
      const [p,q]=open; open=[];
      if(cards[p].x.id===cards[q].x.id && cards[p].l!==cards[q].l){
        setTimeout(()=>{ els[p].classList.add('got'); els[q].classList.add('got'); chime(true); got++; S.stars++; flyStar(); bar(); busy=false;
          if(got===xs.length) setTimeout(done,900); },700);
      } else setTimeout(()=>{ [p,q].forEach(j=>{ els[j].classList.remove('open'); els[j].innerHTML='?'; }); busy=false; },1100);
    }
  });
};
function sceneAudio(s,j,l){ const sc=s.scenes[j]; if(!sc) return {f:null};
  if(sc['a'+l]) return {f:sc['a'+l]};
  const F=s.full&&s.full[l]; if(F&&F.s[j]) return {f:F.f,seg:F.s[j]};
  return {f:null};
}
function playScene(s,j,l,cb){ if(!s.scenes[j]){ cb&&cb(); return; } const A=sceneAudio(s,j,l); playFile(A.f,cb,A.seg,s.scenes[j][l],l); }
R.truyen=(a,done)=>{
  const s=ATK.data.truyen[a.story]; let j=0; const first=a.first||'en', second=first==='en'?'zh':'en';
  const one=()=>{
    if(j>=s.scenes.length){ S.stars++; bar(); done(); return; }
    const sc=s.scenes[j]; const myTok=++S.seq;
    const st=stage(`${icon('truyen')}<div class="scene">${sc.img?`<img src="${esc(sc.img)}" alt="">`:`<div class="emo">${esc(sc.emo||'📖')}</div>`}
      ${isLS()?'':`<div class="sub"><span class="${first}">${esc(sc[first])}</span><span class="${second}">${esc(sc[second])}</span>${sc.py?`<small>${esc(sc.py)}</small>`:''}</div>`}</div>
      <div class="row">${spk(first,'small')}${spk(second,'small')}<button class="next" id="nx" aria-label="next">▶</button></div>`);
    const hl=l=>st.querySelectorAll('.spk').forEach(b=>b.classList.toggle('talk',b.dataset.l===l));
    st.querySelectorAll('.spk').forEach(b=>b.onclick=()=>{ hl(b.dataset.l); playScene(s,j,b.dataset.l,()=>hl('')); });
    st.querySelector('#nx').onclick=()=>{ stop(); j++; one(); };
    hl(first); playScene(s,j,first,()=>{ if(myTok!==S.seq) return; setTimeout(()=>{ if(myTok!==S.seq) return; hl(second); playScene(s,j,second,()=>{ hl(''); if(myTok===S.seq) setTimeout(()=>{ if(myTok===S.seq){ j++; one(); } },1200); }); },500); });
  };
  one();
};
R.truyen_hoi=(a,done)=>{
  const s=ATK.data.truyen[a.story];
  quiz(a.qs.map(q=>({promptHTML:spk(q.l),prompt:cb=>playScene(s,q.scene,q.l,cb),
    opts:q.opts.map(k=>{ const sc=s.scenes[k]; return {html:sc.img?`<img src="${esc(sc.img)}" alt="">`:`<div class="emo">${esc(sc.emo||'📖')}</div>`}; }),
    ans:q.ans, after:go=>setTimeout(go,600)})),{icon:'truyen_hoi'},()=>done());
};
R.nhin_chu=(a,done)=>{
  const cs=a.items.map(id=>ATK.data.chars[id]).filter(Boolean); const n=cs.map(()=>0);
  const st=stage(`${icon('nhin_chu')}<div class="chu">${cs.map((c,k)=>`<button class="cc l-${c.l}" data-k="${k}">${esc(c.chu)}</button>`).join('')}</div><div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`);
  st.querySelectorAll('.cc').forEach(b=>b.onclick=()=>{ const k=+b.dataset.k, c=cs[k]; n[k]++;
    playFile(c.a,null,null,c.chu,c.l);
    if(n[k]%2===1 && c.pic){ b.innerHTML=`<img src="${esc(c.pic)}" alt="">`; } else { b.textContent=c.chu; }
  });
  st.querySelector('#nx').onclick=()=>{ stop(); S.stars++; bar(); done(); };
};
R.xem=(a,done)=>{
  let k=0;
  const one=()=>{
    if(k>=a.parts.length){ done(); return; }
    const p=a.parts[k]; const m=String(p.url).match(/\/d\/([^/]+)/);
    const src=m?`https://drive.google.com/file/d/${m[1]}/preview`:p.url;
    const st=stage(`${icon('xem')}<span class="flag ${p.l}">${p.l==='en'?'A':'中'}</span><iframe class="vid" src="${esc(src)}" allow="autoplay; fullscreen" allowfullscreen title="video"></iframe>
      <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`);
    st.querySelector('#nx').onclick=()=>{ k++; one(); };
  };
  one();
};
/* Ôn nhanh: từ đến hạn trong Hộp ôn trước, rồi từ cũ lâu chưa gặp nhất */
function reviewQs(ids,n){
  const D=ATK.data;
  const pool=ids.map(K).filter(x=>x&&x.pics&&x.pics.length);
  if(!pool.length) return [];
  const due=ATK.hop.due().map(K).filter(x=>x&&x.pics&&x.pics.length);
  const order=[...due, ...shuffle(pool).sort((p,q)=>ATK.seen.ago(q.id)-ATK.seen.ago(p.id))];
  const pick=[]; for(const x of order){ if(pick.length>=n) break; if(!pick.find(y=>y.id===x.id)) pick.push(x); }
  const all=[...new Map([...pool,...due].map(x=>[x.id,x])).values()];
  return pick.map(x=>{
    let l=Math.random()<.5?'en':'zh'; if(l==='zh'&&x.noear) l='en';
    const others=shuffle(all.filter(y=>y.id!==x.id && y.en!==x.en)).slice(0,2);
    const opts=shuffle([x,...others]);
    return wordQ(x.id,l,opts.map(o=>o.id),opts.indexOf(x),0,{onRight:tried=>{ ATK.seen.mark(x.id); if(!tried) ATK.hop.right(x.id); }});
  });
}
R.on_nhanh=(a,done)=>{
  const qs=reviewQs(a.pool,a.n);
  if(!qs.length){ done(); return; }
  quiz(qs,{icon:'on_nhanh'},()=>done());
};
R.hop_on=(a,done)=>{
  const ids=ATK.hop.due().filter(id=>K(id));
  const qs=ids.length?reviewQs(ids,8):[];
  if(!qs.length){ stage(`<div class="endscr"><div class="bigstar">🧠✨</div></div>`); setTimeout(done,1600); return; }
  quiz(qs,{icon:'hop_on'},()=>done());
};

/* ---------- Chế độ con trội tiếng Anh (bản xem thử: Canopy Unit 5) ----------
   Bật trong trang Hướng dẫn. Màn của con không có nhãn hay chữ tiếng Việt, chỉ thêm nội dung. */
const clean=t=>String(t==null?'':t).replace(/[\p{Extended_Pictographic}️‍⃣]/gu,'').replace(/[—…]/g,', ').replace(/\s+/g,' ').trim();
function say(text,l,cb){ // giọng máy, có hẹn giờ dự phòng khi trình duyệt không báo đọc xong
  const my=tok; let fired=false; const t=clean(text);
  const f=()=>{ if(fired) return; fired=true; clearTimeout(tm); if(my===tok) cb&&cb(); };
  const tm=setTimeout(f,1800+t.length*(l==='zh'?260:90)); tts(t,l,f);
}
function sayList(lines,l,onLine,cb){
  const my=tok; let i=0;
  const nx=()=>{ if(my!==tok) return; if(i>=lines.length){ onLine&&onLine(-1); cb&&cb(); return; } onLine&&onLine(i); say(lines[i++],l,()=>setTimeout(nx,250)); };
  nx();
}
const later=(fn,ms)=>{ const my=S.seq; setTimeout(()=>{ if(S&&my===S.seq) fn(); },ms||350); };
function dayIds(acts,course,u){ // các mục của chính ngày (bỏ từ cũ của phần Ôn nhanh)
  const ids=[]; const add=id=>{ const x=K(id); if(x&&x.c===course&&+x.u===+u&&!ids.includes(id)) ids.push(id); };
  acts.forEach(a=>{ (a.items||[]).forEach(it=>add(typeof it==='string'?it:it.id)); (a.qs||[]).forEach(q=>q.id&&add(q.id)); });
  return ids;
}
function picQs(ids,n,l){ // câu nghe – chọn tranh, phương án nhiễu là mục khác của cùng ngày
  const ok=ids.filter(id=>{ const x=K(id); return x&&x.pics&&x.pics.length&&x[l]&&!(l==='zh'&&x.noear); });
  const qs=[], used=new Set();
  for(const id of shuffle(ok)){
    if(qs.length>=n) break; const x=K(id); if(used.has(x[l])||used.has(x.en)) continue;
    const others=shuffle(ok.filter(o=>o!==id&&K(o).en!==x.en&&K(o)[l]!==x[l])).slice(0,2); if(others.length<2) continue;
    used.add(x[l]); used.add(x.en);
    const opts=shuffle([id,...others]); qs.push({id,l,opts,ans:opts.indexOf(id),pic:0});
  }
  return qs;
}
function withCheck(acts,course,u){ // chèn kiểm tra nhanh 4 câu ngay sau Ôn nhanh
  const all=dayIds(acts,course,u);
  let qs=picQs(all.filter(id=>K(id).k==='word'||K(id).k==='phrase'),4,'en');
  if(qs.length<4) qs=picQs(all,4,'en');
  if(qs.length<4) return acts;
  const out=acts.slice(), i=out.findIndex(a=>a.t==='on_nhanh');
  out.splice(i+1,0,{t:'kt_en',qs}); return out;
}
function fastRest(){ // đúng 4/4: chon/noi giữ 1 lượt tiếng Anh mỗi từ, đủ tiếng Trung; truyện giữ nguyên; cuối ngày thêm tiếng Trung
  const head=S.acts.slice(0,S.ai+1), rest=S.acts.slice(S.ai+1), seen=new Set(); let cut=0;
  const keep=(id,l)=>{ if(l!=='en') return true; if(seen.has(id)){ cut++; return false; } seen.add(id); return true; };
  const out=rest.map(a=>{
    if(a.t==='chon') return Object.assign({},a,{qs:a.qs.filter(q=>keep(q.id,q.l))});
    if(a.t==='noi'&&a.mode!=='dich') return Object.assign({},a,{items:a.items.filter(it=>keep(it.id,it.l))});
    return a;
  }).filter(a=>!((a.t==='chon'&&!a.qs.length)||(a.t==='noi'&&!a.items.length)));
  const zh=dayIds(rest,S.course,S.u).filter(id=>{ const x=K(id); return x.zh&&!x.noear; });
  const sayIds=shuffle(zh).slice(0,Math.max(6,Math.min(10,cut)));
  const zq=picQs(zh,6,'zh');
  if(sayIds.length||zq.length) out.push({t:'zh_mo'});
  if(sayIds.length) out.push({t:'noi',mode:'nhai',items:sayIds.map(id=>({id,l:'zh'}))});
  if(zq.length) out.push({t:'chon',qs:zq});
  S.acts=head.concat(out);
}
R.kt_en=(a,done)=>{
  quiz(a.qs.map(q=>wordQ(q.id,'en',q.opts,q.ans,0,{after:go=>setTimeout(go,450)})),{icon:'kt_en'},first=>{
    const ok=first>=a.qs.length; ATK.enManh.log(S.key,ok); S.fast=ok; if(ok) fastRest(); done();
  });
};
R.zh_mo=(a,done)=>{ // mở bước "Thêm tiếng Trung"
  const xm=ATK.data.people.xiaomei;
  const st=stage(`<div class="pd-who">${xm?`<img src="${esc(xm[1])}" alt="">`:''}<span class="flag zh xl">中</span><span class="flag zh xl">+</span></div>
    <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`);
  st.querySelector('#nx').onclick=()=>{ stop(); done(); };
  later(()=>say('我们再说一说中文！','zh'));
};

/* Thử thách tiếng Anh (chỉ tiếng Anh, giọng máy) */
R.tt_tu=(a,done)=>{
  const T=a.d;
  const st=stage(`${icon('tt_tu')}<div class="tt-grid">${T.tu.map((w,k)=>`<button class="tt-w" data-k="${k}"><span class="e" aria-hidden="true">${esc(w.emo)}</span><span class="en">${esc(w.en)}</span></button>`).join('')}</div>
    <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`,true);
  const bs=[...st.querySelectorAll('.tt-w')], hl=k=>bs.forEach((b,j)=>b.classList.toggle('talk',j===k));
  bs.forEach((b,k)=>b.onclick=()=>{ stop(); hl(k); say(T.tu[k].en,'en',()=>hl(-1)); });
  st.querySelector('#nx').onclick=()=>{ stop(); done(); };
  later(()=>sayList(T.tu.map(w=>w.en),'en',hl));
};
function lines(cls,arr){ return `<div class="tt-lines ${cls||''}">${arr.map((t,k)=>`<button class="tt-s" data-k="${k}"><span class="spk en small" aria-hidden="true">🔊</span><span class="en">${esc(t)}</span></button>`).join('')}</div>`; }
function readLines(st,arr,spkBtn){
  const ls=[...st.querySelectorAll('.tt-s')];
  const hl=k=>{ ls.forEach((x,j)=>x.classList.toggle('on',j===k)); spkBtn&&spkBtn.classList.toggle('talk',k>=0); };
  ls.forEach((b,k)=>b.onclick=()=>{ stop(); hl(k); say(arr[k],'en',()=>hl(-1)); });
  const all=()=>{ stop(); sayList(arr,'en',hl); };
  if(spkBtn) spkBtn.onclick=all;
  later(all);
}
R.tt_cau=(a,done)=>{
  const st=stage(`${icon('tt_cau')}${lines('',a.d.cau)}<div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`,true);
  st.querySelector('#nx').onclick=()=>{ stop(); done(); };
  readLines(st,a.d.cau);
};
R.tt_doan=(a,done)=>{
  const D=a.d.doan, leo=ATK.data.people.leo;
  const st=stage(`<div class="pd-who">${leo?`<img src="${esc(leo[1])}" alt="">`:''}${spk('en')}</div>
    <h2 class="tt-ten en">${esc(D.ten)}</h2>${lines('doan',D.cau)}
    <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`,true);
  st.querySelector('#nx').onclick=()=>{ stop(); done(); };
  readLines(st,D.cau,st.querySelector('.pd-who .spk'));
};
function textQ(q,lead){
  const ord=shuffle(q.opts.map((o,k)=>k));
  return {promptHTML:`${lead||''}${spk('en')}<div class="tt-q en">${esc(q.q)}</div>`,
    prompt:cb=>say(q.q,'en',cb),
    opts:ord.map(k=>({cls:'txt',html:`<span class="en">${esc(q.opts[k])}</span>`})),
    ans:ord.indexOf(q.ans), cols:1, after:go=>setTimeout(go,700)};
}
R.tt_hoi=(a,done)=>{ quiz(a.d.hoi.map(q=>textQ(q)),{icon:'tt_hoi'},()=>done()); };
R.tt_de=(a,done)=>{ quiz([textQ(a.d.de,`<span class="chip tt-dang en">${esc(a.d.de.dang)}</span>`)],{icon:'tt_de'},()=>done()); };

/* Phiên dịch nhí nâng cao: nghe Leo (en) → chọn tóm tắt (zh) → ghi âm cho Xiaomei → nghe câu mẫu */
R.pd_nghe=(a,done)=>{
  const P=a.d, leo=ATK.data.people.leo;
  const st=stage(`<div class="pd-who">${leo?`<img src="${esc(leo[1])}" alt="">`:''}${spk('en')}</div>
    ${lines('doan',P.en)}
    <div class="row"><span class="flag en">A</span><span class="arrow" aria-hidden="true">→</span><span class="flag zh">中</span><button class="next" id="nx" disabled aria-label="next">▶</button></div>`,true);
  const nx=st.querySelector('#nx'); nx.onclick=()=>{ stop(); done(); };
  const sp=st.querySelector('.pd-who .spk'), ls=[...st.querySelectorAll('.tt-s')];
  const hl=k=>{ ls.forEach((x,j)=>x.classList.toggle('on',j===k)); sp.classList.toggle('talk',k>=0); };
  ls.forEach((b,k)=>b.onclick=()=>{ stop(); hl(k); say(P.en[k],'en',()=>hl(-1)); });
  const play=()=>{ stop(); sayList(P.en,'en',hl,()=>{ nx.disabled=false; }); };
  sp.onclick=play; later(play);
};
R.pd_chon=(a,done)=>{
  const P=a.d, ord=shuffle([0,1]), ansPos=ord.indexOf(P.dung||0);
  const st=stage(`${icon('pd_chon')}<div class="pd-two">${ord.map((k,j)=>`<div class="pd-c" data-j="${j}" role="button" tabindex="0">
      <span class="pd-l">${'AB'[j]}</span><button class="spk zh small" data-j="${j}" aria-label="中文">🔊</button>
      <span class="zh">${esc(P.chon[k].zh)}</span><small>${esc(P.chon[k].py)}</small></div>`).join('')}</div>
    <div class="row"><button class="spk en small rep" aria-label="English">🔊</button><span class="flag en">A</span></div>`,true);
  const cs=[...st.querySelectorAll('.pd-c')]; let lock=false;
  const hl=j=>cs.forEach((c,i)=>c.classList.toggle('talk',i===j));
  st.querySelectorAll('.pd-c .spk').forEach(b=>b.onclick=e=>{ e.stopPropagation(); stop(); const j=+b.dataset.j; hl(j); say(P.chon[ord[j]].zh,'zh',()=>hl(-1)); });
  st.querySelector('.rep').onclick=()=>{ stop(); hl(-1); sayList(P.en,'en'); };
  const pick=j=>{ if(lock) return; const c=cs[j];
    if(j===ansPos){ lock=true; stop(); hl(-1); c.classList.add('ok'); chime(true); setTimeout(()=>{ if(S&&S.extra) done(); },1000); }
    else { c.classList.remove('no'); void c.offsetWidth; c.classList.add('no'); chime(false); } };
  cs.forEach((c,j)=>{ c.onclick=()=>pick(j); c.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(j); } }; });
  later(()=>sayList(ord.map(k=>P.chon[k].zh),'zh',hl));
};
let REC=null;
function killRec(){
  if(!REC) return; const r=REC; REC=null; r.cancel=true;
  try{ clearInterval(r.timer); }catch(e){}
  try{ if(r.mr&&r.mr.state!=='inactive') r.mr.stop(); }catch(e){}
  try{ r.stream&&r.stream.getTracks().forEach(t=>t.stop()); }catch(e){}
}
R.pd_ghi=(a,done)=>{
  const P=a.d, xm=ATK.data.people.xiaomei, MAX=60, mine=S;
  const can=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  const st=stage(`<div class="pd-who">${xm?`<img src="${esc(xm[1])}" alt="">`:''}<span class="flag zh">中</span><span class="arrow" aria-hidden="true">🗣️</span></div>
    <div class="row"><button class="mic" id="mic" aria-label="record">🎤</button><div class="count" id="ct"></div></div>
    <div class="row" id="aft"></div>
    <div class="row"><button class="pbtn" id="sk" hidden aria-label="skip">⏭</button><button class="next" id="nx" disabled aria-label="next">▶</button></div>`);
  const mic=st.querySelector('#mic'), ct=st.querySelector('#ct'), aft=st.querySelector('#aft'), nx=st.querySelector('#nx'), sk=st.querySelector('#sk');
  let lastId=null, blob=null;
  nx.onclick=()=>{ stop(); killRec(); done(); };
  sk.onclick=()=>{ stop(); killRec(); done(); };
  const noMic=()=>{ killRec(); mic.disabled=true; mic.classList.add('off'); mic.innerHTML='🎤<i aria-hidden="true">🚫</i>'; ct.textContent=''; sk.hidden=false; };
  const fmt=s=>{ s=Math.max(0,s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const saved=()=>{
    aft.innerHTML=`<button class="pbtn" id="pl" aria-label="play">▶</button><button class="pbtn" id="re" aria-label="again">🔁</button>`;
    aft.querySelector('#pl').onclick=()=>{ stop(); try{ const au=new Audio(URL.createObjectURL(blob)); cur=au; const p=au.play(); p&&p.catch&&p.catch(()=>{}); }catch(e){} };
    aft.querySelector('#re').onclick=()=>{ stop(); begin(); };
    nx.disabled=false;
  };
  const begin=()=>{
    if(!can){ noMic(); return; }
    killRec(); aft.innerHTML=''; mic.disabled=true;
    let p; try{ p=navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ noMic(); return; }
    p.then(stream=>{
      if(S!==mine){ stream.getTracks().forEach(t=>t.stop()); return; }
      let mr; try{ mr=new MediaRecorder(stream); }catch(e){ stream.getTracks().forEach(t=>t.stop()); noMic(); return; }
      const r={mr,stream,chunks:[],t0:Date.now()}; REC=r;
      mr.ondataavailable=e=>{ if(e.data&&e.data.size) r.chunks.push(e.data); };
      mr.onstop=async()=>{
        try{ clearInterval(r.timer); }catch(e){} try{ stream.getTracks().forEach(t=>t.stop()); }catch(e){}
        if(REC===r) REC=null;
        mic.classList.remove('on'); mic.textContent='🎤'; mic.disabled=false; ct.textContent='';
        if(r.cancel||S!==mine) return;
        blob=new Blob(r.chunks,{type:mr.mimeType||'audio/webm'});
        try{ if(lastId) await ATK.guiCo.del(lastId);
          lastId=await ATK.guiCo.add({cid:S.cid,u:S.u,n:S.n,key:S.key,buoi:P.buoi,t:Date.now(),dur:Date.now()-r.t0,blob,type:blob.type,
            title:`${S.course} Unit ${S.u} · Ngày ${S.n} · Buổi ${P.buoi}`,mau:P.mau.zh}); }catch(e){}
        saved();
      };
      mr.start(); mic.disabled=false; mic.classList.add('on'); mic.textContent='⏹'; ct.textContent=fmt(MAX);
      r.timer=setInterval(()=>{ const left=MAX-Math.floor((Date.now()-r.t0)/1000); ct.textContent=fmt(left); if(left<=0){ try{ mr.stop(); }catch(e){} } },250);
    }).catch(()=>noMic());
  };
  mic.onclick=()=>{ if(REC&&REC.mr&&REC.mr.state==='recording'){ try{ REC.mr.stop(); }catch(e){} return; } stop(); begin(); };
  if(!can) noMic();
  else try{ navigator.mediaDevices.enumerateDevices().then(ds=>{ if(S===mine&&!REC&&!ds.some(d=>d.kind==='audioinput')) noMic(); }).catch(()=>{}); }catch(e){}
  later(()=>say('请你用中文说一说。','zh'));
};
R.pd_mau=(a,done)=>{
  const P=a.d, xm=ATK.data.people.xiaomei;
  const st=stage(`<div class="pd-who">${xm?`<img src="${esc(xm[1])}" alt="">`:''}${spk('zh')}</div>
    <div class="pd-mau"><span class="zh">${esc(P.mau.zh)}</span><small>${esc(P.mau.py)}</small></div>
    <div class="row"><button class="next" id="nx" aria-label="next">▶</button></div>`,true);
  const sp=st.querySelector('.spk'), play=()=>{ stop(); sp.classList.add('talk'); say(P.mau.zh,'zh',()=>sp.classList.remove('talk')); };
  sp.onclick=play; st.querySelector('#nx').onclick=()=>{ stop(); done(); };
  later(play);
};

/* ---------- khung trình phát ---------- */
function bar(){
  if(!S) return;
  root.querySelector('.dots').innerHTML=S.acts.map((a,k)=>`<i class="${k<S.ai?'done':k===S.ai?'on':''}"></i>`).join('');
  root.querySelector('.stars').innerHTML=`<b>★</b>${S.stars}`;
}
function runAct(){
  bar(); stop(); killRec();
  if(S.ai>=S.acts.length) return finish();
  const a=S.acts[S.ai], mine=S; S.seq++;
  let called=false;
  (R[a.t]||((x,d)=>d()))(a,()=>{ if(called||S!==mine) return; called=true; S.seq++; S.ai++; runAct(); });
}
function finish(){
  stop();
  if(S.extra) return finishExtra();
  const total=S.acts.reduce((n,a)=>n+((a.qs||a.items||[]).length||1),0);
  const ratio=S.stars/Math.max(1,total); const st=ratio>=.8?3:ratio>=.5?2:1;
  ATK.prog.set(S.key,st);
  const nextN=S.n<((S.L&&S.L.webs&&S.L.webs.length)||8)?S.n+1:null;
  const W=S.W||{}, leo=S.em&&(W.thu_thach_en||W.phien_dich_nc);
  stage(`<div class="endscr"><div class="bigstar">${'⭐'.repeat(st)}</div>
    <div class="row"><button class="pbtn" id="again" aria-label="again">🔁</button>
    <button class="pbtn" id="home" aria-label="unit">🏠</button>
    ${nextN?`<button class="next" id="go" aria-label="next lesson">▶</button>`:''}</div>
    ${leo?`<div class="row leo-row">${W.thu_thach_en?`<button class="leo-b en" id="tt" aria-label="Leo English">🦁<span class="flag en">A</span></button>`:''}
      ${W.phien_dich_nc?`<button class="leo-b zh" id="pd" aria-label="Leo 中文">🎧<span class="flag zh">中</span></button>`:''}</div>`:''}</div>`);
  chime(true);
  root.querySelector('#again').onclick=()=>open(S.cid,S.u,S.n);
  root.querySelector('#home').onclick=()=>{ location.hash='#/u/'+S.cid+'/'+S.u; };
  const g=root.querySelector('#go'); if(g) g.onclick=()=>{ location.hash='#/b/'+S.cid+'/'+S.u+'/'+nextN; };
  const t=root.querySelector('#tt'); if(t) t.onclick=()=>{ location.hash='#/tt/'+S.key; };
  const p=root.querySelector('#pd'); if(p) p.onclick=()=>{ location.hash='#/pd/'+S.key; };
}
function finishExtra(){
  const kind=S.extra, o={cid:S.cid,u:S.u,n:S.n};
  stage(`<div class="endscr"><div class="bigstar">${kind==='tt'?'🦁✨':'🎤✨'}</div>
    <div class="row"><button class="pbtn" id="again" aria-label="again">🔁</button>
    <button class="pbtn" id="home" aria-label="unit">🏠</button></div></div>`);
  chime(true);
  root.querySelector('#again').onclick=()=>extra(kind,o.cid,o.u,o.n);
  root.querySelector('#home').onclick=()=>{ location.hash='#/u/'+o.cid+'/'+o.u; };
}
function start(o){
  S=Object.assign(o,{ai:0,stars:0,seq:0});
  root.hidden=false; root.classList.toggle('extra',!!o.extra); document.body.style.overflow='hidden';
  root.innerHTML=`<div class="pbar"><button class="pbtn" id="x" aria-label="close">✕</button><div class="dots"></div><div class="stars"></div></div><div class="stage-area"></div>`;
  root.querySelector('#x').onclick=()=>{ location.hash='#/u/'+o.cid+'/'+o.u; };
  bar();
  const st=stage(`<button class="start" id="go" aria-label="start">${o.extra==='tt'?'🦁':o.extra==='pd'?'🎧':'▶'}</button>`);
  st.querySelector('#go').onclick=()=>{ try{ speechSynthesis.getVoices(); }catch(e){} runAct(); };
}
async function open(cid,u,n){
  const L=await ATK.lesson(cid,u); const W=L.webs.find(w=>w.n===n); if(!W) return;
  const em=!!(ATK.enManh&&ATK.enManh.active(cid,u));
  start({cid,u,n,course:L.course,key:cid+'/'+u+'/'+n,acts:em?withCheck(W.acts,L.course,u):W.acts,W,L,em});
}
async function extra(kind,cid,u,n){ // Thử thách của Leo: không cộng sao, không lưu tiến độ
  const L=await ATK.lesson(cid,u); const W=L.webs.find(w=>w.n===n); if(!W) return;
  const T=kind==='tt'?W.thu_thach_en:W.phien_dich_nc; if(!T) return;
  const acts=kind==='tt'?['tt_tu','tt_cau','tt_doan','tt_hoi'].concat(T.de?['tt_de']:[]).map(t=>({t,d:T})):['pd_nghe','pd_chon','pd_ghi','pd_mau'].map(t=>({t,d:T}));
  start({cid,u,n,course:L.course,key:cid+'/'+u+'/'+n,acts,W,L,extra:kind});
}
function close(){ stop(); killRec(); if(!root.hidden){ root.hidden=true; root.innerHTML=''; document.body.style.overflow=''; } S=null; }
window.ATKplayer={open,close,extra};
})();
