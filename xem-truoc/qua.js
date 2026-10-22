/* =====================================================================
   PHÒNG ĐỔI QUÀ – ví sao, nuôi thú cưng, nuôi quái vật, avatar, quà thật, học bổng.
   Giá sao và điều kiện theo "Quy chế đổi sao" (bản 22/10/2026) – sửa ở khối Q_ dưới đây.
   Trạng thái lưu trong P._shop, đồng bộ lên máy chủ cùng tiến độ học.
   Tổng sao đã kiếm (Bảng vàng) không bị trừ khi đổi quà; chỉ "sao trong ví" bị trừ.
   ===================================================================== */
const Q_IMG = 'tai-nguyen/qua/';
const Q_RULE = {petAdopt:60, feed:5, play:10, careDay:3, petG:[8,20],
                egg:40, candy:8, candyDay:3, candyE:2, perLesson:3, monE:[6,18],
                outfit:30, giftMinLessons:6, giftMax:2};
const PET_SP = {cun:{n:'Cún con'}, meo:{n:'Mèo con'}, gautruc:{n:'Gấu trúc'}};
const MON_SP = {lua:{n:'Lửa Nhỏ', c:'#E3262E'}, nuoc:{n:'Giọt Nước', c:'#2F9BD6'}, la:{n:'Mầm Lá', c:'#3BB273'}};
const AVA_CHAR = {bong:'Bông', anna:'Anna', leo:'Leo', xiaomei:'Xiaomei'};
const AVA_OUT = {'':'Đồ thường', tham_hiem:'Nhà thám hiểm', phi_hanh:'Phi hành gia', sieu_nhan:'Siêu anh hùng'};
const AVA_BG = {
  studio:{n:'Sân khấu', img:Q_IMG+'bg_avatar.webp', p:0},
  vuon:{n:'Vườn thú cưng', img:Q_IMG+'bg_vuon.webp', p:20},
  quai:{n:'Đồng cỏ quái vật', img:Q_IMG+'bg_quai.webp', p:20},
  phong:{n:'Phòng quà', img:Q_IMG+'bg_phong.webp', p:20},
  seed:{n:'Thế giới Little Seed', img:'tai-nguyen/trang/the_gioi_seed.webp', p:20},
  canopy:{n:'Thành phố Canopy', img:'tai-nguyen/trang/the_gioi_canopy.webp', p:20}};
const AVA_FR = {none:{n:'Trắng', p:0}, vang:{n:'Vàng', p:15}, cauvong:{n:'Cầu vồng', p:25}, sao:{n:'Sao lấp lánh', p:30}, vuongmien:{n:'Vương miện', p:40}};
const GIFTS = [
  {id:'sticker', n:'Bộ sticker hoạt hình', vnd:'5.000đ', p:120}, {id:'tay', n:'Tẩy hình con vật', vnd:'5.000đ', p:120},
  {id:'but_chi', n:'Bút chì đầu thú', vnd:'5.000đ', p:120},     {id:'kep_toc', n:'Kẹp tóc nơ', vnd:'10.000đ', p:200},
  {id:'moc_khoa', n:'Móc khoá thú bông', vnd:'10.000đ', p:200}, {id:'so_tay', n:'Sổ tay mini', vnd:'10.000đ', p:200},
  {id:'dat_nan', n:'Đất nặn 6 màu', vnd:'15.000đ', p:280},      {id:'sap_mau', n:'Sáp màu 12 màu', vnd:'15.000đ', p:280},
  {id:'xe', n:'Xe kéo trớn mini', vnd:'15.000đ', p:280},        {id:'rubik', n:'Rubik 3x3', vnd:'20.000đ', p:350},
  {id:'hop_but', n:'Hộp bút hình thú', vnd:'20.000đ', p:350}];
const HB = [
  {id:'dong', n:'Học bổng Đồng', p:350, vnd:'300.000đ', les:12, zoom:0, c:'#B8742F'},
  {id:'bac',  n:'Học bổng Bạc',  p:500, vnd:'600.000đ', les:15, zoom:2, c:'#7D8DA3'},
  {id:'vang', n:'Học bổng Vàng', p:650, vnd:'1.000.000đ', les:18, zoom:3, c:'#C99A00'}];
const Q_ST = {cho:'Chờ cô kiểm tra', duyet:'Đã duyệt', da_trao:'Đã trao', tu_choi:'Không duyệt · đã hoàn sao'};

/* ---------- ví sao ---------- */
function shop(){
  const s = (P._shop && typeof P._shop==='object') ? P._shop : (P._shop = {});
  s.spent = +s.spent || 0; s.own = s.own || {}; s.pets = s.pets || []; s.mons = s.mons || []; s.orders = s.orders || [];
  s.ava = s.ava || {c:'bong', o:'', bg:'studio', fr:'none'};
  return s;
}
function qSave(){ shop().t = Date.now(); save(); }
function qEarned(){ return myPoints(); }
function qWallet(){ return Math.max(0, qEarned() - shop().spent); }
function qGroup(){ return KID && GROUPS[KID.group] ? KID.group : 'seed'; }
function qLessons(){ return doneCount(qGroup()); }
function qZooms(){ const g=qGroup(); return [0,1,2].filter(r=>isDone(g, r*PER+PER-1)).length; }
function qToday(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function qDaysSince(day){ if(!day) return 99; return Math.round((Date.parse(qToday())-Date.parse(day))/864e5); }
function qNoStars(n){
  sfx.no(); toast(`Con cần ${n} ⭐, trong ví con có ${qWallet()} ⭐. Con học thêm để kiếm sao nhé!`);
  hdSay('Con chưa đủ sao. Con học thêm để kiếm sao nhé!');
}
function qSpend(n){
  if(qWallet() < n){ qNoStars(n); return false; }
  shop().spent += n; qSave(); sfx.coin(); bumpStars(); return true;
}
function qWalletHTML(){
  return `<div class="q-wallet"><span><small>Đã kiếm</small><b>⭐ ${qEarned()}</b></span><span><small>Đã đổi</small><b>${shop().spent}</b></span><span class="q-left"><small>Trong ví</small><b>⭐ ${qWallet()}</b></span></div>`;
}

/* ---------- avatar ---------- */
function avaSrc(a){ a=a||shop().ava; return a.o ? `${Q_IMG}ava_${a.c}_${a.o}.webp` : `tai-nguyen/nhan-vat/kids_${a.c}_a.webp`; }
function avaBg(a){ a=a||shop().ava; return (AVA_BG[a.bg]||AVA_BG.studio).img; }
function qSide(){
  const b=document.getElementById('sdKid'); if(!b) return;
  const a=shop().ava, im=b.querySelector('.ava-mini');
  const html=`<span class="ava-mini fr-${a.fr}" style="background-image:url('${avaBg(a)}')"><img src="${avaSrc(a)}" alt=""></span>`;
  if(im) im.outerHTML=html; else { const old=b.querySelector('img'); if(old) old.outerHTML=html; }
}

/* ---------- cổng ba mẹ: phép nhân để chắc người lớn xác nhận ---------- */
function parentGate(title, detail, ok){
  const a=6+Math.floor(Math.random()*4), b=6+Math.floor(Math.random()*4);
  const ov=document.createElement('div'); ov.className='overlay pp';
  ov.innerHTML=`<div class="modal pp-box q-gate" role="dialog" aria-label="Cổng ba mẹ"><button class="pp-x" aria-label="Đóng">✕</button>
    <h3>👨‍👩‍👧 Cổng ba mẹ</h3><p class="q-gate-what"><b>${esc(title)}</b><br>${detail}</p>
    <p>Ba mẹ trả lời để xác nhận: <b class="q-gate-q">${a} × ${b} = ?</b></p>
    <div class="row"><input class="q-gate-in" type="number" inputmode="numeric" aria-label="Kết quả"><button class="btn g" id="qGateOk">Xác nhận</button></div>
    <small class="q-gate-note">Sao được trừ ngay để giữ chỗ. Nếu CES không duyệt, sao được hoàn đủ vào ví.</small></div>`;
  document.body.appendChild(ov);
  const close=()=>ov.remove(), inp=ov.querySelector('input');
  ov.querySelector('.pp-x').onclick=close; ov.addEventListener('click',e=>{ if(e.target===ov) close(); });
  const go=()=>{ if(+inp.value===a*b){ close(); ok(); } else { sfx.no(); inp.value=''; inp.focus(); toast('Chưa đúng. Ba mẹ thử lại nhé!'); } };
  ov.querySelector('#qGateOk').onclick=go; inp.onkeydown=e=>{ if(e.key==='Enter') go(); };
  setTimeout(()=>inp.focus(), 50);
}
function qCanReal(){
  if(TEACHER){ toast('Chế độ giáo viên chỉ xem thử, không đổi quà thật và học bổng.'); return false; }
  if(!KID || KID.temp){ toast('Ba mẹ đăng nhập bằng tên con và SĐT/Gmail để đổi quà thật nhé.'); askProfile(KID&&KID.group||'', route); return false; }
  return true;
}
function qCode(prefix){ const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<4;i++) s+=A[Math.floor(Math.random()*A.length)]; return prefix+'-'+s; }
function qOrder(kind, item){
  const s=shop(); if(!qSpend(item.p)) return;
  const o={code:qCode(kind==='hb'?'HB':'QUA'), kind, id:item.id, n:item.n, p:item.p, at:Date.now(), st:'cho'};
  s.orders.unshift(o); qSave();
  if(SCORE_API){
    const body=JSON.stringify({action:'redeem', id:KID.id, name:KID.name, acct:KID.acct||'', group:qGroup(), code:o.code, kind, item:item.id, itemName:item.n+(item.vnd?' ('+item.vnd+')':''),
      cost:item.p, earned:qEarned(), spent:s.spent, lessons:qLessons(), zooms:qZooms()});
    try{ fetch(SCORE_API,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body}).catch(()=>{}); }catch(e){}
  }
  route(); sfx.win(); confetti(24); hdSay('Cảm ơn ba mẹ. Cô đã nhận phiếu, cô sẽ kiểm tra và báo ba mẹ qua Zalo nhé.');
  const ov=document.createElement('div'); ov.className='overlay pp';
  ov.innerHTML=`<div class="modal pp-box q-done" role="dialog"><button class="pp-x" aria-label="Đóng">✕</button>
    <img src="${kind==='hb'?Q_IMG+'hocbong.webp':Q_IMG+'gift_'+item.id+'.webp'}" alt="">
    <h3>Đã tạo phiếu ${o.code}</h3><p><b>${esc(item.n)}</b> · ${item.p} ⭐</p>
    <p>CES kiểm tra tiến độ học của con trong 3 ngày làm việc rồi báo ba mẹ qua Zalo. Ba mẹ có thể chụp màn hình phiếu này gửi vào nhóm Zalo của thử thách.</p>
    <div class="row"><a class="btn g" href="${ZALO_LINK}" target="_blank" rel="noopener">📤 Mở nhóm Zalo</a><a class="btn y" href="#/qua/phieu">🧾 Phiếu của con</a></div></div>`;
  document.body.appendChild(ov);
  const close=()=>ov.remove(); ov.querySelector('.pp-x').onclick=close; ov.addEventListener('click',e=>{ if(e.target===ov||e.target.closest('a')) close(); });
}
/* hỏi máy chủ trạng thái phiếu; phiếu bị từ chối thì hoàn sao */
let qChecked=0;
async function qSyncOrders(force){
  if(!SCORE_API || !KID || !KID.id || KID.temp || TEACHER) return;
  const s=shop(); if(!s.orders.some(o=>o.st==='cho'||o.st==='duyet')) return;
  if(!force && Date.now()-qChecked<60000) return; qChecked=Date.now();
  try{
    const r=await fetch(`${SCORE_API}?action=orders&id=${encodeURIComponent(KID.id)}`); const j=await r.json();
    if(!j || !Array.isArray(j.orders)) return;
    let ch=false;
    j.orders.forEach(x=>{ const o=s.orders.find(o=>o.code===x.code); if(!o || !Q_ST[x.status] || o.st===x.status) return;
      if(x.status==='tu_choi' && !o.ref){ s.spent=Math.max(0, s.spent-o.p); o.ref=true; }
      o.st=x.status; o.note=x.note||''; ch=true; });
    if(ch){ qSave(); if(/^#\/qua/.test(location.hash)) route(); }
  }catch(e){}
}

/* ---------- khung chung của các phòng ---------- */
let qSpoke={};
function qSay(key, lines){ if(!STARTED || qSpoke[key]) return; qSpoke[key]=true; hdSay(lines); }
function qFrame(title, body, cls){
  document.body.classList.add('hub');
  app.innerHTML=`<div class="screen qscr ${cls||''}">
    <div class="q-top"><a class="q-back" href="#/qua" aria-label="Về Phòng đổi quà">🎁</a><h2>${title}</h2>${qWalletHTML()}</div>
    <div class="q-body">${body}</div></div>`;
}
function qFloat(el, txt){
  const r=el.getBoundingClientRect(), f=document.createElement('span'); f.className='q-float'; f.textContent=txt;
  f.style.left=(r.left+r.width/2)+'px'; f.style.top=(r.top+r.height*0.35)+'px'; document.body.appendChild(f); setTimeout(()=>f.remove(),1300);
}

/* ---------- sảnh Phòng đổi quà ---------- */
function viewQua(sub){
  if(sub==='thu-cung') return viewPets();
  if(sub==='quai-vat') return viewMons();
  if(sub==='avatar') return viewAvatar();
  if(sub==='qua-that') return viewGifts();
  if(sub==='hoc-bong') return viewHB();
  if(sub==='phieu') return viewOrders();
  const s=shop(), p=s.pets[s.petSel||0], m=s.mons[s.monSel||0];
  document.body.classList.add('hub');
  app.innerHTML=`<div class="screen qscr qhub">
    <div class="q-top"><span class="q-back">🎁</span><h2>Phòng đổi quà</h2>${qWalletHTML()}</div>
    <div class="q-grid">
      ${hubTile({href:'#/qua/thu-cung', img:p?petImg(p):Q_IMG+'pet_cun_2.webp', size:'auto 86%', pos:'50% 90%', bg:'#E3F5D2', c:'#3BB273', t:'Nuôi thú cưng', sub:p?`${PET_SP[p.sp].n} · ${petStageName(p)}`:'Nhận nuôi miễn phí 1 bạn', badge:p?'':'Miễn phí'})}
      ${hubTile({href:'#/qua/quai-vat', img:m?monImg(m):Q_IMG+'mon_lua_2.webp', size:'auto 86%', pos:'50% 90%', bg:'#EDE4FF', c:'#7B5CD6', t:'Nuôi quái vật', sub:m?`${MON_SP[m.sp].n} · ${monStageName(m)}`:`Trứng ${Q_RULE.egg} ⭐ · lớn lên khi con học`})}
      ${hubTile({href:'#/qua/avatar', img:avaSrc(), size:'auto 92%', pos:'50% 100%', bg:'#FFE4EC', c:'#E3487A', t:'Avatar của con', sub:'Trang phục · nền · khung'})}
      ${hubTile({href:'#/qua/qua-that', img:Q_IMG+'gift_rubik.webp', size:'auto 70%', pos:'50% 60%', bg:'#FFF1CC', c:'#F28C00', t:'Quà thật', sub:'Quà 5.000–20.000đ · 120–350 ⭐'})}
      ${hubTile({href:'#/qua/hoc-bong', img:Q_IMG+'hocbong.webp', size:'auto 76%', pos:'50% 60%', bg:'#FFF8E1', c:'#C99A00', t:'Học bổng', sub:'Khoá học Anh – Trung tại CES'})}
      ${hubTile({href:'#/qua/phieu', img:Q_IMG+'gift_so_tay.webp', size:'auto 70%', pos:'50% 60%', bg:'#E4F0FF', c:'#2F6FD6', t:'Phiếu & quy chế', sub:s.orders.length?`${s.orders.length} phiếu của con`:'Cách đổi sao'})}
    </div></div>`;
  qSay('hub', 'Chào mừng con đến Phòng đổi quà! Con dùng sao kiếm được khi học để nuôi thú cưng, nuôi quái vật, chọn trang phục, hoặc đổi quà thật.');
  qSyncOrders();
}

/* ---------- thú cưng ---------- */
function petStage(p){ return p.g>=Q_RULE.petG[1]?3:(p.g>=Q_RULE.petG[0]?2:1); }
function petStageName(p){ return ['','Bé xíu','Lớn rồi','Trưởng thành'][petStage(p)]; }
function petImg(p){ return `${Q_IMG}pet_${p.sp}_${petStage(p)}.webp`; }
function viewPets(){
  const s=shop(); let sel=Math.min(s.petSel||0, Math.max(0,s.pets.length-1)); const p=s.pets[sel];
  const list=Object.keys(PET_SP).map(sp=>{ const k=s.pets.findIndex(x=>x.sp===sp), own=k>=0, x=s.pets[k];
    const price=s.pets.length?Q_RULE.petAdopt:0;
    return `<button class="q-card ${own&&k===sel?'on':''}" data-sp="${sp}" data-k="${k}" type="button">
      <img src="${own?petImg(x):Q_IMG+'pet_'+sp+'_1.webp'}" alt=""><b>${PET_SP[sp].n}</b>
      <span class="q-price ${own?'own':''}">${own?petStageName(x):(price?price+' ⭐':'Miễn phí')}</span></button>`; }).join('');
  let stage;
  if(p){
    const st=petStage(p), nxt=Q_RULE.petG[st-1], prev=st===1?0:Q_RULE.petG[st-2], care=p.d===qToday()?p.n:0, miss=qDaysSince(p.last)>=2;
    stage=`<div class="q-stage" style="background-image:url('${Q_IMG}bg_vuon.webp')">
      <div class="q-plate"><b>${PET_SP[p.sp].n}</b><span>${petStageName(p)}</span></div>
      <div class="q-meters"><div class="q-meter"><small>Lớn lên</small><i><u style="width:${st===3?100:Math.round((p.g-prev)/(nxt-prev)*100)}%"></u></i></div>
        <div class="q-mood">${miss?'🥺 Bạn ấy nhớ con!':'😊 Bạn ấy đang vui'}</div></div>
      <img class="q-crit pet s${st}" id="qCrit" src="${petImg(p)}" alt="${PET_SP[p.sp].n}">
      <div class="q-acts"><button class="q-act" id="qFeed" type="button">🍖<b>Cho ăn</b><span>${Q_RULE.feed} ⭐</span></button>
        <button class="q-act" id="qPlay" type="button">🎾<b>Chơi cùng</b><span>${Q_RULE.play} ⭐</span></button></div>
      <div class="q-care">Hôm nay: ${care}/${Q_RULE.careDay} lần chăm</div></div>`;
  } else {
    stage=`<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_vuon.webp')"><div class="q-empty">🐾 Con chọn một bạn bên phải để nhận nuôi nhé!<br><small>Bạn đầu tiên được tặng miễn phí.</small></div></div>`;
  }
  qFrame('🐶 Nuôi thú cưng', `${stage}<div class="q-side"><h4>Các bạn thú cưng</h4><div class="q-cards">${list}</div>
    <p class="q-hint">Cho ăn: +1 · Chơi cùng: +2 điểm lớn. Đủ ${Q_RULE.petG[0]} điểm bạn ấy lớn, đủ ${Q_RULE.petG[1]} điểm bạn ấy trưởng thành. Mỗi ngày chăm tối đa ${Q_RULE.careDay} lần.</p></div>`, 'qpet');
  app.querySelectorAll('.q-card').forEach(b=>b.onclick=()=>{
    const sp=b.dataset.sp, k=+b.dataset.k;
    if(k>=0){ s.petSel=k; qSave(); sfx.pop(); return viewPets(); }
    const price=s.pets.length?Q_RULE.petAdopt:0;
    if(price && !qSpend(price)) return;
    s.pets.push({sp, g:0, d:'', n:0, last:qToday()}); s.petSel=s.pets.length-1; qSave(); sfx.win(); confetti(16);
    toast(`Con đã nhận nuôi ${PET_SP[sp].n}! 🎉`); viewPets(); hdSay('Con cho bạn ấy ăn hoặc chơi cùng để bạn ấy lớn lên nhé.');
  });
  if(p){
    const care=(kind)=>{
      if(p.d!==qToday()){ p.d=qToday(); p.n=0; }
      if(p.n>=Q_RULE.careDay){ sfx.no(); toast('Bạn ấy đã chơi đủ hôm nay rồi. Ngày mai con quay lại nhé!'); hdSay('Bạn ấy đã chơi đủ hôm nay rồi. Ngày mai con quay lại nhé!'); return; }
      const cost=kind==='feed'?Q_RULE.feed:Q_RULE.play; if(!qSpend(cost)) return;
      const before=petStage(p); p.g+=kind==='feed'?1:2; p.n++; p.last=qToday(); qSave();
      const el=document.getElementById('qCrit'); qFloat(el, kind==='feed'?'😋 +1':'💖 +2');
      if(petStage(p)>before){ setTimeout(()=>{ sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewPets(); }, 700); }
      else { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); setTimeout(viewPets, 900); }
    };
    document.getElementById('qFeed').onclick=()=>care('feed');
    document.getElementById('qPlay').onclick=()=>care('play');
  }
  qSay('pet', s.pets.length?'Con cho bạn ấy ăn hoặc chơi cùng để bạn ấy lớn lên nhé.':'Con chọn một bạn thú cưng để nhận nuôi nhé. Bạn đầu tiên được tặng miễn phí!');
}

/* ---------- quái vật: lớn lên nhờ con học ---------- */
function monSince(m){ return Math.max(0, doneCount(m.g||qGroup()) - m.base); }
function monEnergy(m){ const k=monSince(m); return k>=1 ? Q_RULE.perLesson*k + (m.c||0) : 0; }
function monStage(m){ if(monSince(m)<1) return 0; const e=monEnergy(m); return e>=Q_RULE.monE[1]?3:(e>=Q_RULE.monE[0]?2:1); }
function monStageName(m){ return ['Trứng','Bé con','Lớn rồi','Tiến hoá'][monStage(m)]; }
function monImg(m){ return `${Q_IMG}mon_${m.sp}_${monStage(m)}.webp`; }
function viewMons(){
  const s=shop(); let sel=Math.min(s.monSel||0, Math.max(0,s.mons.length-1)); const m=s.mons[sel];
  const list=Object.keys(MON_SP).map(sp=>{ const k=s.mons.findIndex(x=>x.sp===sp), own=k>=0, x=s.mons[k];
    return `<button class="q-card ${own&&k===sel?'on':''}" data-sp="${sp}" data-k="${k}" type="button" style="--mc:${MON_SP[sp].c}">
      <img src="${own?monImg(x):Q_IMG+'mon_'+sp+'_0.webp'}" alt=""><b>${MON_SP[sp].n}</b>
      <span class="q-price ${own?'own':''}">${own?monStageName(x):Q_RULE.egg+' ⭐'}</span></button>`; }).join('');
  let stage;
  if(m){
    const st=monStage(m), e=monEnergy(m), cd=m.d===qToday()?m.n:0;
    if(st>0 && !m.seen){ m.seen=true; qSave(); setTimeout(()=>{ sfx.win(); confetti(30); hdSay('Ôi, trứng nở rồi!'); }, 300); }
    const lo=st<=1?0:(st===2?Q_RULE.monE[0]:Q_RULE.monE[1]), hi=st<=1?Q_RULE.monE[0]:Q_RULE.monE[1];
    stage=`<div class="q-stage" style="background-image:url('${Q_IMG}bg_quai.webp')">
      <div class="q-plate" style="--pc:${MON_SP[m.sp].c}"><b>${MON_SP[m.sp].n}</b><span>${monStageName(m)}</span></div>
      <div class="q-meters">${st===0?`<div class="q-mood">🥚 Con học xong 1 buổi thì trứng nở!</div>`
        :`<div class="q-meter"><small>Năng lượng ${e}</small><i><u style="width:${st===3?100:Math.round((e-lo)/(hi-lo)*100)}%"></u></i></div><div class="q-mood">⚡ Mỗi buổi học xong +${Q_RULE.perLesson}</div>`}</div>
      <img class="q-crit mon s${st} ${st===0?'egg':''}" id="qCrit" src="${monImg(m)}" alt="${MON_SP[m.sp].n}">
      <div class="q-acts"><button class="q-act" id="qCandy" type="button" ${st===0?'disabled':''}>🍬<b>Kẹo năng lượng</b><span>${Q_RULE.candy} ⭐ · +${Q_RULE.candyE}</span></button>
        <a class="q-act learn" href="#/g/${qGroup()}">📚<b>Đi học</b><span>+${Q_RULE.perLesson} mỗi buổi</span></a></div>
      <div class="q-care">${st===0?'Trứng đang được ấp…':`Kẹo hôm nay: ${cd}/${Q_RULE.candyDay}`}</div></div>`;
  } else {
    stage=`<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_quai.webp')"><div class="q-empty">🥚 Con chọn một quả trứng bên phải nhé!<br><small>Học xong 1 buổi là trứng nở, càng học quái vật càng lớn.</small></div></div>`;
  }
  qFrame('👾 Nuôi quái vật', `${stage}<div class="q-side"><h4>Trứng quái vật</h4><div class="q-cards">${list}</div>
    <p class="q-hint">Quái vật lớn lên khi con học: mỗi buổi học xong +${Q_RULE.perLesson} năng lượng. Đủ ${Q_RULE.monE[0]} năng lượng quái vật lớn, đủ ${Q_RULE.monE[1]} năng lượng quái vật tiến hoá.</p></div>`, 'qmon');
  app.querySelectorAll('.q-card').forEach(b=>b.onclick=()=>{
    const sp=b.dataset.sp, k=+b.dataset.k;
    if(k>=0){ s.monSel=k; qSave(); sfx.pop(); return viewMons(); }
    if(!qSpend(Q_RULE.egg)) return;
    s.mons.push({sp, g:qGroup(), base:qLessons(), c:0, d:'', n:0}); s.monSel=s.mons.length-1; qSave(); confetti(12);
    toast(`Con đã nhận trứng ${MON_SP[sp].n}! 🥚`); viewMons(); hdSay('Mỗi buổi con học xong, quái vật của con lại lớn thêm.');
  });
  const cb=document.getElementById('qCandy');
  if(m && cb) cb.onclick=()=>{
    if(m.d!==qToday()){ m.d=qToday(); m.n=0; }
    if(m.n>=Q_RULE.candyDay){ sfx.no(); toast('Hôm nay quái vật ăn đủ kẹo rồi. Con đi học để quái vật lớn thêm nhé!'); return; }
    if(!qSpend(Q_RULE.candy)) return;
    const before=monStage(m); m.c=(m.c||0)+Q_RULE.candyE; m.n++; qSave(); qFloat(document.getElementById('qCrit'), '⚡ +'+Q_RULE.candyE);
    if(monStage(m)>before) setTimeout(()=>{ sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewMons(); }, 700);
    else setTimeout(viewMons, 900);
  };
  qSay('mon', s.mons.length?'Mỗi buổi con học xong, quái vật của con lại lớn thêm.':'Con chọn một quả trứng quái vật. Con học xong một buổi thì trứng sẽ nở!');
}

/* ---------- avatar: thử đồ trước, thích thì đổi ---------- */
let qPrev=null, qTab='c';
function avaOwned(kind, id){ const s=shop();
  if(kind==='c') return true;
  if(kind==='o') return !id.split('|')[1] || !!s.own['o:'+id];
  if(kind==='b') return !AVA_BG[id].p || !!s.own['b:'+id];
  if(kind==='f') return !AVA_FR[id].p || !!s.own['f:'+id];
}
function avaPrice(kind, id){ if(kind==='o') return id.split('|')[1]?Q_RULE.outfit:0; if(kind==='b') return AVA_BG[id].p; if(kind==='f') return AVA_FR[id].p; return 0; }
function viewAvatar(){
  const s=shop(), a=Object.assign({}, s.ava);
  if(qPrev){ if(qPrev.k==='c'){ a.c=qPrev.id; a.o=''; } if(qPrev.k==='o'){ const [c,o]=qPrev.id.split('|'); a.c=c; a.o=o; } if(qPrev.k==='b') a.bg=qPrev.id; if(qPrev.k==='f') a.fr=qPrev.id; }
  const items={
    c:Object.keys(AVA_CHAR).map(c=>({k:'c', id:c, n:AVA_CHAR[c], img:`tai-nguyen/nhan-vat/kids_${c}_a.webp`})),
    o:Object.keys(AVA_OUT).map(o=>({k:'o', id:a.c+'|'+o, n:AVA_OUT[o], img:o?`${Q_IMG}ava_${a.c}_${o}.webp`:`tai-nguyen/nhan-vat/kids_${a.c}_a.webp`})),
    b:Object.keys(AVA_BG).map(b=>({k:'b', id:b, n:AVA_BG[b].n, bgimg:AVA_BG[b].img})),
    f:Object.keys(AVA_FR).map(f=>({k:'f', id:f, n:AVA_FR[f].n, fr:f}))};
  const cur=(it)=> (it.k==='c'&&s.ava.c===it.id) || (it.k==='o'&&s.ava.c+'|'+s.ava.o===it.id) || (it.k==='b'&&s.ava.bg===it.id) || (it.k==='f'&&s.ava.fr===it.id);
  const grid=items[qTab].map(it=>{ const own=avaOwned(it.k,it.id), pr=avaPrice(it.k,it.id), pv=qPrev&&qPrev.k===it.k&&qPrev.id===it.id;
    const pic=it.img?`<img src="${it.img}" alt="">`:(it.bgimg?`<span class="q-bgthumb" style="background-image:url('${it.bgimg}')"></span>`:`<span class="ava-mini big fr-${it.fr}"></span>`);
    return `<button class="q-card ${cur(it)?'on':''} ${pv?'pv':''}" data-k="${it.k}" data-id="${it.id}" type="button">${pic}<b>${esc(it.n)}</b>
      <span class="q-price ${own?'own':''}">${cur(it)?'Đang dùng':(own?(pr?'Đã có':'Miễn phí'):pr+' ⭐')}</span></button>`; }).join('');
  let act='';
  if(qPrev){ const own=avaOwned(qPrev.k,qPrev.id), pr=avaPrice(qPrev.k,qPrev.id);
    act=`<div class="q-acts"><button class="q-act" id="qAvaOk" type="button">${own?'✅<b>Dùng</b><span>đã có</span>':`🛍️<b>Đổi và dùng</b><span>${pr} ⭐</span>`}</button>
      <button class="q-act ghost" id="qAvaNo" type="button">↩️<b>Thôi</b><span>bỏ thử</span></button></div>`; }
  qFrame('🧒 Avatar của con', `<div class="q-stage ava fr-${a.fr}" style="background-image:url('${avaBg(a)}')">
      <img class="q-crit ava" src="${avaSrc(a)}" alt="">${qPrev?'<div class="q-plate"><b>Đang thử</b><span>Con thích không?</span></div>':''}${act}</div>
    <div class="q-side"><div class="q-tabs">${[['c','Nhân vật'],['o','Trang phục'],['b','Nền'],['f','Khung']].map(([k,n])=>`<button class="${qTab===k?'on':''}" data-t="${k}" type="button">${n}</button>`).join('')}</div>
      <div class="q-cards ${qTab}">${grid}</div></div>`, 'qava');
  app.querySelectorAll('.q-tabs button').forEach(b=>b.onclick=()=>{ qTab=b.dataset.t; sfx.pop(); viewAvatar(); });
  app.querySelectorAll('.q-card').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k, id=b.dataset.id; sfx.pop();
    if(avaOwned(k,id) && !qPrev){ applyAva(k,id); return viewAvatar(); }
    qPrev={k,id}; viewAvatar();
  });
  const ok=document.getElementById('qAvaOk');
  if(ok) ok.onclick=()=>{ const {k,id}=qPrev;
    if(!avaOwned(k,id)){ if(!qSpend(avaPrice(k,id))) return; s.own[k+':'+id]=true; confetti(14); }
    applyAva(k,id); qPrev=null; viewAvatar(); };
  const no=document.getElementById('qAvaNo'); if(no) no.onclick=()=>{ qPrev=null; sfx.pop(); viewAvatar(); };
  qSay('ava', 'Con chọn nhân vật, trang phục, nền và khung cho ảnh đại diện của con nhé.');
}
function applyAva(k,id){ const a=shop().ava;
  if(k==='c'){ a.c=id; a.o=''; } if(k==='o'){ const [c,o]=id.split('|'); a.c=c; a.o=o; } if(k==='b') a.bg=id; if(k==='f') a.fr=id;
  qSave(); qSide(); }

/* ---------- quà thật ---------- */
function giftUsed(){ return shop().orders.filter(o=>o.kind==='gift' && o.st!=='tu_choi').length; }
function viewGifts(){
  const les=qLessons(), used=giftUsed(), open=les>=Q_RULE.giftMinLessons, w=qWallet();
  const cards=GIFTS.map(g=>`<button class="q-card gift ${w>=g.p&&open&&used<Q_RULE.giftMax?'can':''}" data-id="${g.id}" type="button">
      <img src="${Q_IMG}gift_${g.id}.webp" alt=""><b>${g.n}</b><small>Giá tham khảo ${g.vnd}</small><span class="q-price">${g.p} ⭐</span></button>`).join('');
  qFrame('🎁 Quà thật', `<div class="q-gifts"><div class="q-cond">
      <span class="${open?'ok':''}">${open?'✅':'🔒'} Học xong ${Math.min(les,Q_RULE.giftMinLessons)}/${Q_RULE.giftMinLessons} buổi</span>
      <span class="${used<Q_RULE.giftMax?'ok':''}">🎁 Đã đổi ${used}/${Q_RULE.giftMax} món</span>
      <span>👨‍👩‍👧 Ba mẹ xác nhận · CES kiểm tra rồi trao quà</span></div>
    <div class="q-cards gifts">${cards}</div></div>`, 'qgift');
  app.querySelectorAll('.q-card').forEach(b=>b.onclick=()=>{
    const g=GIFTS.find(x=>x.id===b.dataset.id); sfx.pop();
    if(!qCanReal()) return;
    if(!open){ sfx.no(); return toast(`Con học xong ${Q_RULE.giftMinLessons} buổi (1 chặng) thì đổi được quà thật nhé! Con đã học ${les} buổi.`); }
    if(used>=Q_RULE.giftMax){ sfx.no(); return toast(`Mỗi bạn đổi tối đa ${Q_RULE.giftMax} món quà thật trong thử thách.`); }
    if(qWallet()<g.p) return qNoStars(g.p);
    parentGate(g.n, `${g.p} ⭐ · giá tham khảo ${g.vnd}. Mẫu thật có thể khác hình minh hoạ.`, ()=>qOrder('gift', g));
  });
  qSay('gift', 'Quà thật cần ba mẹ xác nhận. Con gọi ba mẹ cùng chọn nhé!');
}

/* ---------- học bổng ---------- */
function viewHB(){
  const les=qLessons(), zo=qZooms(), w=qWallet(), has=shop().orders.some(o=>o.kind==='hb' && o.st!=='tu_choi');
  const cards=HB.map(h=>{ const okL=les>=h.les, okZ=zo>=h.zoom, okS=w>=h.p, can=okL&&okZ&&okS&&!has;
    return `<div class="q-hb ${can?'can':''}" style="--hc:${h.c}"><img src="${Q_IMG}hocbong.webp" alt="">
      <h4>${h.n}</h4><div class="q-hb-v">${h.vnd}</div>
      <ul><li class="${okL?'ok':''}">${okL?'✅':'⬜'} Học xong ${h.les} buổi <small>(${les}/${h.les})</small></li>
        ${h.zoom?`<li class="${okZ?'ok':''}">${okZ?'✅':'⬜'} Tham gia ${h.zoom} buổi Zoom <small>(${zo}/${h.zoom})</small></li>`:''}
        <li class="${okS?'ok':''}">${okS?'✅':'⬜'} ${h.p} ⭐ trong ví <small>(${w}/${h.p})</small></li></ul>
      <div class="q-hb-bar"><i style="width:${Math.min(100,Math.round(w/h.p*100))}%"></i></div>
      <button class="btn ${can?'g':'y'}" data-id="${h.id}" type="button">${has?'Đã đổi học bổng':(can?'Đổi học bổng':'Cố lên con!')}</button></div>`; }).join('');
  qFrame('🎓 Học bổng', `<div class="q-hbwrap"><div class="q-hbs">${cards}</div>
    <p class="q-hint">Phiếu học bổng trừ vào học phí khoá Anh – Trung đăng ký mới tại CES trong 60 ngày kể từ ngày cấp. Mỗi bạn đổi 1 phiếu. Không quy đổi tiền mặt.</p></div>`, 'qhb');
  app.querySelectorAll('.q-hb button').forEach(b=>b.onclick=()=>{
    const h=HB.find(x=>x.id===b.dataset.id); sfx.pop();
    if(!qCanReal()) return;
    if(has){ return toast('Mỗi bạn đổi được 1 phiếu học bổng. Con xem phiếu ở mục Phiếu & quy chế nhé.'); }
    if(les<h.les || zo<h.zoom){ sfx.no(); return toast(`Con cần học xong ${h.les} buổi${h.zoom?` và ${h.zoom} buổi Zoom`:''} để đổi ${h.n}.`); }
    if(qWallet()<h.p) return qNoStars(h.p);
    parentGate(h.n+' – '+h.vnd, `${h.p} ⭐. CES gửi giấy chứng nhận học bổng qua Zalo trong 5 ngày làm việc sau khi kiểm tra tiến độ.`, ()=>qOrder('hb', h));
  });
  qSay('hb', 'Học bổng dành cho bạn chăm học. Con gọi ba mẹ cùng xem nhé!');
}

/* ---------- phiếu & quy chế ---------- */
function viewOrders(){
  const s=shop();
  const rows=s.orders.length?s.orders.map(o=>`<li class="q-ord st-${o.st}"><img src="${o.kind==='hb'?Q_IMG+'hocbong.webp':Q_IMG+'gift_'+o.id+'.webp'}" alt="">
      <span><b>${esc(o.n)}</b><small>${o.code} · ${new Date(o.at).toLocaleDateString('vi-VN')} · ${o.p} ⭐</small>${o.note?`<small>${esc(o.note)}</small>`:''}</span>
      <em>${Q_ST[o.st]||o.st}</em></li>`).join(''):'<li class="q-ord none">Con chưa có phiếu nào. Quà thật và học bổng sẽ hiện ở đây.</li>';
  qFrame('🧾 Phiếu & quy chế', `<div class="q-ords"><h4>Phiếu của con</h4><ul>${rows}</ul>
      ${s.orders.length?'<button class="btn y sm" id="qRefresh" type="button">🔄 Xem trạng thái mới</button>':''}</div>
    <div class="q-rules"><h4>Quy chế đổi sao (tóm tắt)</h4><ol>
      <li><b>Sao chỉ đến từ việc học.</b> Mỗi buổi làm đủ khoảng 30 ⭐; gửi clip +10, buổi Zoom +20.</li>
      <li><b>Đổi quà không làm tụt hạng.</b> Bảng vàng tính tổng sao đã kiếm; chỉ sao trong ví bị trừ.</li>
      <li><b>Quà ảo</b> (thú cưng, quái vật, avatar) đổi ngay, không hoàn lại thành sao. Thú cưng không bao giờ ốm hay mất.</li>
      <li><b>Quà thật</b> 120–350 ⭐: mở khi con học xong 6 buổi, tối đa 2 món. <b>Học bổng</b> 350–650 ⭐: theo số buổi đã học, tối đa 1 phiếu.</li>
      <li><b>Ba mẹ xác nhận</b> ở Cổng ba mẹ; CES kiểm tra tiến độ trong 3 ngày làm việc. Phiếu không duyệt được hoàn đủ sao.</li>
      <li>Phòng đổi quà mở đến hết 7 ngày sau Chung kết. Thắc mắc, ba mẹ nhắn nhóm Zalo của thử thách.</li></ol>
      <a class="btn g sm" href="${ZALO_LINK}" target="_blank" rel="noopener">📤 Nhóm Zalo thử thách</a></div>`, 'qord');
  const r=document.getElementById('qRefresh'); if(r) r.onclick=()=>{ sfx.pop(); toast('Đang xem trạng thái…'); qSyncOrders(true); };
}
