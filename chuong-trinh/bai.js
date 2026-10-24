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
function stage(html){ const st=root.querySelector('.stage-area'); st.innerHTML=html; st.scrollTop=0; return st; }
function icon(t){ return `<div class="act-ic" aria-hidden="true">${({the:'🃏',chon:'👂👆',cau:'💬👆',noi:'🎤',anh_trung:'<span class="flag en">A</span><span class="flag zh">中</span>',ghep:'🧩',truyen:'📖',truyen_hoi:'📖👆',on_nhanh:'🔁',hop_on:'🧠',nhin_chu:'👀',xem:'📺',chon_chu:'🖼️👆'})[t]||''}</div>`; }
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
        if(!tried){ first++; S.stars++; flyStar(); bar(); }
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

/* ---------- khung trình phát ---------- */
function bar(){
  if(!S) return;
  root.querySelector('.dots').innerHTML=S.acts.map((a,k)=>`<i class="${k<S.ai?'done':k===S.ai?'on':''}"></i>`).join('');
  root.querySelector('.stars').innerHTML=`<b>★</b>${S.stars}`;
}
function runAct(){
  bar(); stop();
  if(S.ai>=S.acts.length) return finish();
  const a=S.acts[S.ai], mine=S; S.seq++;
  let called=false;
  (R[a.t]||((x,d)=>d()))(a,()=>{ if(called||S!==mine) return; called=true; S.seq++; S.ai++; runAct(); });
}
function finish(){
  stop();
  const total=S.acts.reduce((n,a)=>n+((a.qs||a.items||[]).length||1),0);
  const ratio=S.stars/Math.max(1,total); const st=ratio>=.8?3:ratio>=.5?2:1;
  ATK.prog.set(S.key,st);
  const nextN=S.n<((S.L&&S.L.webs&&S.L.webs.length)||8)?S.n+1:null;
  stage(`<div class="endscr"><div class="bigstar">${'⭐'.repeat(st)}</div>
    <div class="row"><button class="pbtn" id="again" aria-label="again">🔁</button>
    <button class="pbtn" id="home" aria-label="unit">🏠</button>
    ${nextN?`<button class="next" id="go" aria-label="next lesson">▶</button>`:''}</div></div>`);
  chime(true);
  root.querySelector('#again').onclick=()=>open(S.cid,S.u,S.n);
  root.querySelector('#home').onclick=()=>{ location.hash='#/u/'+S.cid+'/'+S.u; };
  const g=root.querySelector('#go'); if(g) g.onclick=()=>{ location.hash='#/b/'+S.cid+'/'+S.u+'/'+nextN; };
}
async function open(cid,u,n){
  const L=await ATK.lesson(cid,u); const W=L.webs.find(w=>w.n===n); if(!W) return;
  S={cid,u,n,course:L.course,key:cid+'/'+u+'/'+n,acts:W.acts,ai:0,stars:0,seq:0};
  root.hidden=false; document.body.style.overflow='hidden';
  root.innerHTML=`<div class="pbar"><button class="pbtn" id="x" aria-label="close">✕</button><div class="dots"></div><div class="stars"></div></div><div class="stage-area"></div>`;
  root.querySelector('#x').onclick=()=>{ location.hash='#/u/'+cid+'/'+u; };
  bar();
  const st=stage(`<button class="start" id="go" aria-label="start">▶</button>`);
  st.querySelector('#go').onclick=()=>{ try{ speechSynthesis.getVoices(); }catch(e){} runAct(); };
}
function close(){ stop(); if(!root.hidden){ root.hidden=true; root.innerHTML=''; document.body.style.overflow=''; } S=null; }
window.ATKplayer={open,close};
})();
