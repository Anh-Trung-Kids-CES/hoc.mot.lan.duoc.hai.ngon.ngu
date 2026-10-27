/* =====================================================================
   XẾP HẠNG – mỗi tuần (mỗi chặng) là một "giải đấu" của từng khoá.
   - Tuần 1 = Vòng khám phá, tuần 2 = Vòng bứt phá, tuần 3 = Vòng chinh phục,
     tính từ ngày khai mạc XH_START; hết tuần 3 thì mở sẵn tab "Tổng 21 ngày".
   - 5 bạn nhiều sao nhất tuần nằm trong "Nhóm vinh danh" (XH_TOP).
   - Không có nhóm "xuống hạng": bạn ở dưới chỉ thấy còn bao nhiêu sao nữa là vào nhóm vinh danh.
   - Máy chủ mới (?action=xephang, ping v>=7) trả cả bảng kèm avatar bé chọn ở Phòng đổi quà.
     Máy chủ cũ chỉ trả Top 10: web vẫn hiện được, avatar các bạn khác là nhân vật mặc định.
   - Dòng của chính bé luôn lấy điểm mới nhất trên máy, không chờ máy chủ.
   ===================================================================== */
const XH_START = '2026-10-26';   // thứ Hai khai mạc (giờ Việt Nam)
const XH_TOP = 5;                // số bạn được vinh danh mỗi tuần
const XH_MAX = 50;               // số dòng hiện tối đa
const XH_CHARS = ['bong','anna','leo','xiaomei'];

function xhT0(){ return new Date(XH_START+'T00:00:00+07:00').getTime(); }
/* chặng của tuần hiện tại: 1, 2, 3; hết 3 tuần trả 0 (tổng 21 ngày) */
function xhWeekNow(){ const k=Math.floor((Date.now()-xhT0())/(7*864e5)); return k<0?1:(k>2?0:k+1); }
/* thời điểm kết thúc tuần r (0 = hết tuần 3) */
function xhEnd(r){ return xhT0() + (r||3)*7*864e5; }
function xhLeft(r){
  const ms=xhEnd(r)-Date.now();
  if(ms<=0) return r ? 'Đã kết thúc' : 'Chờ Chung kết tỏa sáng';
  const d=Math.floor(ms/864e5), h=Math.floor(ms/36e5), m=Math.max(1,Math.floor(ms/6e4));
  return 'Còn '+(d>=1 ? d+' ngày' : h>=1 ? h+' giờ' : m+' phút');
}
function xhHash(s){ let h=0; for(const c of String(s||'')) h=(h*31+c.charCodeAt(0))>>>0; return h; }
function xhAva(a, name){
  if(Array.isArray(a)) a={c:a[0],o:a[1],bg:a[2],fr:a[3]};
  if(!a || !a.c) a={c:XH_CHARS[xhHash(name)%4], o:'', bg:'studio', fr:'none'};
  if(typeof AVA_CHAR!=='undefined' && !AVA_CHAR[a.c]) a.c='bong';
  if(typeof AVA_FR!=='undefined' && !AVA_FR[a.fr]) a.fr='none';
  const src=(typeof avaSrc==='function')?avaSrc(a):`tai-nguyen/nhan-vat/kids_${a.c}_a.webp`;
  const bg=(typeof avaBg==='function')?avaBg(a):'';
  return `<span class="ava-mini xh-ava fr-${esc(a.fr)}" style="background-image:url('${bg}')"><img src="${src}" alt="" loading="lazy"></span>`;
}
function xhBanner(g,r){ const v=r||3; return `tai-nguyen/trang/${g==='canopy'?'cn':'ls'}_banner_v${v}.webp`; }
function xhMyPoints(g,r){ return r ? roundPoints(g,r-1) : groupPoints(g); }

/* tải bảng: một lần gọi, máy chủ cũ (không biết action=xephang) tự trả Top 10 */
async function xhLoad(g,r){
  const q=new URLSearchParams({action:'xephang', group:g, round:r, kid:kidId(), t:Date.now()});
  const j=await (await fetch(SCORE_API+'?'+q.toString())).json();
  if(j && Array.isArray(j.list)) return {list:j.list.map(x=>({n:x.n, p:+x.p||0, a:x.a, me:!!x.me})), total:j.total||j.list.length, full:true};
  const top=(j && j.top)||[], myRank=j && j.me && j.me.rank;
  return {list:top.map((x,i)=>({n:x.name, p:+x.points||0, me:myRank===i+1})), total:top.length, full:false, myRank};
}
/* thay điểm của bé bằng điểm mới nhất trên máy, xếp lại, hạng bằng điểm thì đồng hạng */
function xhMerge(d,g,r){
  const mine=xhMyPoints(g,r), name=KID&&!KID.temp?KID.name.trim():'';
  let list=d.list.slice(), me=list.find(x=>x.me);
  if(name && !TEACHER){
    if(me) me.p=Math.max(me.p,mine);
    else if(mine>0){ me={n:name,p:mine,me:true}; list.push(me); }
    if(me){ me.n=name; me.mine=true; }
  }
  list=list.filter(x=>x.p>0 || x.me).sort((a,b)=>b.p-a.p || (a.me?-1:b.me?1:0));
  list.forEach((x,i)=>{ x.r = i && list[i-1].p===x.p ? list[i-1].r : i+1; });
  return list;
}
function xhRow(x,k){
  const medal=x.r<=3 && x.p>0 ? ` m${x.r}` : '';
  const ava=x.me ? xhAva(typeof shop==='function'?shop().ava:null, x.n) : xhAva(x.a, x.n);
  return `<li class="xh-row${x.me?' me':''}${x.r<=XH_TOP&&x.p>0?' up':''}" style="--d:${Math.min(k,12)*.06}s">
    <span class="xh-rk${medal}"><b>${x.r}</b></span>${ava}
    <span class="xh-nm">${esc(x.n)}${x.me?'<small>Con</small>':''}</span>
    <span class="xh-pt">${x.p}<i>⭐</i></span></li>`;
}

function viewGold(g, r){
  const G=GROUPS[g]; if(!G) return viewHome();
  if(DEMO){ location.replace('#/g/'+g); setTimeout(()=>demoGate('vang'),200); return; }
  if(r===undefined || r===null || isNaN(r)) r=xhWeekNow();
  r=Math.max(0,Math.min(3,r|0));
  const now=xhWeekNow();
  const tabs=[1,2,3,0].map(k=>{
    const lock = k && now && k>now;          // tuần chưa tới
    const lab = k ? `Tuần ${k}<small>${ROUNDS[k-1].vi}</small>` : `Tổng<small>21 ngày</small>`;
    return lock ? `<span class="xh-tab off">${lab}</span>` : `<a class="xh-tab ${k===r?'on':''}" href="#/g/${g}/vang/${k}">${lab}</a>`;
  }).join('');
  const live = !r || now===r;
  const clock = live ? xhLeft(r) : (now===0 || r<now ? 'Đã kết thúc' : 'Sắp bắt đầu');
  app.innerHTML=`<div class="xh">
    <section class="xh-hero" style="background-image:url('${xhBanner(g,r)}')">
      <div class="xh-ht"><small>GIẢI ĐẤU · ${esc(G.name)}</small>
        <h2>${r?esc(ROUNDS[r-1].vi):'Tổng 21 ngày'}</h2>
        <span class="xh-clock ${live?'':'done'}">⏰ ${clock}</span></div>
    </section>
    <nav class="xh-tabs">${tabs}</nav>
    <section class="xh-card" id="xhCard"><div class="loading">${art('🧭','big spin')}<p>Đang tải bảng xếp hạng…</p></div></section>
    <p class="xh-foot">⭐ là sao con kiếm được khi học. Mỗi tuần, ${XH_TOP} bạn nhiều sao nhất của mỗi khoá được cô vinh danh trên nhóm Zalo. Đổi quà không làm giảm sao trên bảng này.</p>
  </div>`;
  xhFill(g,r);
}

async function xhFill(g,r){
  const card=document.getElementById('xhCard'); if(!card) return;
  const at=location.hash;
  let d=null, err=false;
  if(SCORE_API){ try{ d=await xhLoad(g,r); }catch(e){ err=true; } }
  if(location.hash!==at || !document.getElementById('xhCard')) return;
  if(err && !d){
    card.innerHTML=`<div class="empty">${art('📡','big')}<h3>Chưa tải được bảng xếp hạng</h3><p>Ba mẹ kiểm tra kết nối mạng rồi thử lại nhé.</p><button class="btn y" onclick="route()">Thử lại</button></div>`;
    return;
  }
  const list=xhMerge(d||{list:[]}, g, r);
  if(!list.length){
    card.innerHTML=`<div class="empty">${art('🌱','big')}<h3>Bảng tuần này còn trống</h3><p>Con học một buổi để là nhà thám hiểm đầu tiên có tên trên bảng nhé!</p><a class="btn g" href="#/g/${g}">🗺️ Vào bản đồ</a></div>`;
    return;
  }
  const me=list.find(x=>x.me), shown=list.slice(0,XH_MAX);
  /* dòng của bé ngoài 10 hạng đầu, máy chủ cũ chỉ biết hạng chứ không có danh sách đầy đủ */
  if(me && !d.full && d.myRank && d.myRank>shown.indexOf(me)+1) me.r=Math.max(me.r,d.myRank);
  const top=shown.filter(x=>x.r<=XH_TOP && x.p>0), rest=shown.filter(x=>!top.includes(x));
  const cut=top.length ? top[top.length-1].p : 0;
  let msg='';
  if(me && !me.p) msg=`Con học một buổi là có tên trên bảng nhé! 🌱`;
  else if(me && me.r<=XH_TOP) msg=`🎉 Con đang ở <b>Nhóm vinh danh</b>, hạng ${me.r}! Giữ vững nhé!`;
  else if(me) msg=`Còn <b>${Math.max(1,cut-me.p+1)} ⭐</b> nữa là con vào Nhóm vinh danh. Cố lên nào!`;
  else if(TEACHER) msg='Chế độ giáo viên: chỉ xem, không tính điểm.';
  card.innerHTML=`${msg?`<div class="xh-msg">${msg}</div>`:''}
    <div class="xh-zone"><span>⬆</span> NHÓM VINH DANH <span>⬆</span></div>
    <ol class="xh-list">${top.map(xhRow).join('')}</ol>
    ${rest.length?`<div class="xh-cut"><span>Cố lên để vào nhóm vinh danh</span></div><ol class="xh-list">${rest.map((x,k)=>xhRow(x,k+top.length)).join('')}</ol>`:''}
    ${me && !shown.includes(me)?`<ol class="xh-list xh-mine">${xhRow(me,0)}</ol>`:''}
    <div class="xh-meta">${list.length>shown.length?`Đang hiện ${shown.length}/${list.length} bạn · `:''}Cập nhật ${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})} <button class="xh-re" type="button" onclick="route()">↻ Tải lại</button></div>`;
  const mine=card.querySelector('.xh-row.me');
  if(mine) setTimeout(()=>{ const b=mine.getBoundingClientRect(); if(b.bottom>innerHeight-70) mine.scrollIntoView({block:'center',behavior:'smooth'}); },900);
  if(me && me.r<=XH_TOP && me.p>0){ try{ sfx.win(); confetti(24); }catch(e){} }
}
