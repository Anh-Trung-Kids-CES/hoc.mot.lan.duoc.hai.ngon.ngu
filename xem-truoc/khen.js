/* =====================================================================
   KHEN THƯỞNG theo nghiên cứu (bản duyệt 22/10/2026):
   1. Khen việc con vừa làm, cụ thể, không khen "con giỏi"; sai thì gợi ý, sai lần 2 chỉ đáp án.
   2. Sao cố định theo việc làm xong (không theo số câu đúng).
   3. "Hành trình của con": con so với chính con (buổi, ngày học, lần nói, huy hiệu) + mục tiêu chung cả đội.
   4. Quà bất ngờ không báo trước; xong chặng thì có video, trò chơi mới.
   5. Lời nhắn để ba mẹ khen con cụ thể.
   Câu chưa có file giọng cô Hươu thì phát câu dự phòng (đã có giọng) và hiện chữ của câu mới.
   ===================================================================== */
const KHEN = {
  ok:     ['Đúng rồi!', 'Đúng rồi, con nghe kỹ lắm!', 'Đúng rồi, con nhìn kỹ lắm!'],
  retry:  'Con thử lại và làm được rồi!',
  speak:  ['Con nói to và rõ quá!', 'Cô nghe thấy con nói rồi!', 'Con đã tự nói được rồi!'],
  sai1:   'Con nghe lại nhé.',
  sai2:   'Đáp án ở đây nè. Con chạm vào nhé!',
  effort: 'Bài này khó mà con vẫn cố đến cùng!',
  step: {
    xem:  'Con đã xem và làm theo các bạn rồi!',
    cham: 'Con đã nghe và chạm đúng tranh rồi!',
    noi:  'Con đã nói theo các bạn rồi!',
    at:   'Con đã nghe ra tiếng Anh và tiếng Trung rồi!',
    do:   'Con đã thử nói bằng cả hai thứ tiếng!',
    nc:   'Con đã làm quen với mặt chữ rồi!'},
  stage:    'Con đã đi hết một chặng! Trong mục Game và video có thêm video và trò chơi mới cho con.',
  surprise: 'Ôi, cô có một món quà bất ngờ cho con!',
  badge:    'Con nhận được một huy hiệu mới!',
  journey:  'Đây là hành trình của con. Con xem con đã học được bao nhiêu rồi nhé!'
};
/* câu dự phòng đã có giọng, dùng tạm khi câu mới chưa thu */
const KHEN_FB = {speak:'Con được thêm một ngôi sao!', step:'Con được thêm một ngôi sao!', sai2:'Con nghe lại nhé.'};
let khenN = 0;
function khenPick(a){ return Array.isArray(a) ? a[(khenN++) % a.length] : a; }
function khenOk(retried){ return retried ? KHEN.retry : khenPick(KHEN.ok); }
function khenSpeak(){ return khenPick(KHEN.speak); }
/* đọc một câu khen trong bài Little Seed: có file thì phát, không thì phát câu dự phòng (nếu có), chữ luôn là câu mới */
function khenLS(text, fb){ const a=hdFile(text) || (fb?hdFile(fb):''); return lsPlay({t:text, l:'vi', a}); }
function khenHas(text){ return !!hdFile(text); }
/* lời khen cuối một bài Canopy: theo độ chính xác, nhưng luôn nói về việc con đã làm */
function khenEnd(frac){
  if(frac>=0.8) return 'Con nghe và chọn rất cẩn thận!';
  if(frac>=0.5) return 'Con làm được nhiều câu rồi. Chơi lại để nhớ thêm nhé!';
  return KHEN.effort;
}

/* ---------- nhật ký học: ngày học, số lần nói, huy hiệu, quà bất ngờ ---------- */
function jGet(){ const j=(P._j && typeof P._j==='object') ? P._j : (P._j={}); j.days=j.days||{}; j.rec=+j.rec||0; j.badges=j.badges||{}; j.gifts=j.gifts||{}; return j; }
function jToday(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function jMark(){ if(!KID || TEACHER) return; const j=jGet(); if(!j.days[jToday()]){ j.days[jToday()]=1; j.t=Date.now(); } }
function jRec(){ if(!KID || TEACHER) return; const j=jGet(); j.rec++; j.t=Date.now(); }
function jGroup(){ return KID && GROUPS[KID.group] ? KID.group : 'seed'; }
function jMetrics(g){
  g=g||jGroup(); const j=jGet();
  const st=[0,1,2].map(r=>{ for(let d=0; d<PER-1; d++) if(!isDone(g, r*PER+d)) return false; return true; });
  let clip=0; for(let i=0;i<TOTAL;i++){ const s=P[g+'-'+i]; if(s && s.clipSent) clip++; }
  return {g, les:doneCount(g), st, days:Object.keys(j.days).length, rec:j.rec, zoom:[0,1,2].filter(r=>isDone(g, r*PER+PER-1)).length, clip, pts:groupPoints(g)};
}
const BADGES = [
  {id:'dau',   n:'Bước chân đầu tiên', d:'Học xong buổi đầu tiên', img:'tai-nguyen/qua/pet_cun_1.webp', ok:m=>m.les>=1},
  {id:'c1',    n:'Xong chặng 1',       d:'Học xong 6 buổi chặng 1', img:g=>`tai-nguyen/trang/ban_do_${g}_1.webp`, ok:m=>m.st[0], scene:true},
  {id:'c2',    n:'Xong chặng 2',       d:'Học xong 6 buổi chặng 2', img:g=>`tai-nguyen/trang/ban_do_${g}_2.webp`, ok:m=>m.st[1], scene:true},
  {id:'c3',    n:'Xong chặng 3',       d:'Học xong 6 buổi chặng 3', img:g=>`tai-nguyen/trang/ban_do_${g}_3.webp`, ok:m=>m.st[2], scene:true},
  {id:'n3',    n:'3 ngày chăm chỉ',    d:'Học vào 3 ngày khác nhau', img:'tai-nguyen/qua/mon_la_1.webp', ok:m=>m.days>=3},
  {id:'n7',    n:'7 ngày chăm chỉ',    d:'Học vào 7 ngày khác nhau', img:'tai-nguyen/qua/mon_nuoc_2.webp', ok:m=>m.days>=7},
  {id:'n14',   n:'14 ngày chăm chỉ',   d:'Học vào 14 ngày khác nhau', img:'tai-nguyen/qua/mon_lua_3.webp', ok:m=>m.days>=14},
  {id:'noi10', n:'Giọng nói tự tin',   d:'Nói thành tiếng 10 lần', img:'tai-nguyen/trang/cx_o_speak.webp', ok:m=>m.rec>=10, scene:true},
  {id:'noi50', n:'Nhà hùng biện nhí',  d:'Nói thành tiếng 50 lần', img:'tai-nguyen/trang/ls_o_noi_theo.webp', ok:m=>m.rec>=50, scene:true},
  {id:'zoom',  n:'Gặp cô qua Zoom',    d:'Tham gia 1 buổi Zoom', img:'tai-nguyen/trang/cx_o_video.webp', ok:m=>m.zoom>=1, scene:true},
  {id:'clip',  n:'Ngôi sao chia sẻ',   d:'Gửi clip đầu tiên vào nhóm Zalo', img:'tai-nguyen/trang/ls_man_khen.webp', ok:m=>m.clip>=1, scene:true},
  {id:'dich',  n:'Về đích',            d:'Học xong cả 18 buổi', img:'tai-nguyen/qua/hocbong.webp', ok:m=>m.les>=18}];
function badgeImg(b,g){ return typeof b.img==='function' ? b.img(g) : b.img; }
function badgeHTML(b, g, on, isNew){
  return `<div class="hj-badge ${on?'on':''} ${b.scene?'scene':''}" title="${esc(b.d)}">
    <span class="hj-medal"><i style="background-image:url('${badgeImg(b,g)}')"></i>${isNew?'<em>Mới!</em>':''}</span>
    <b>${esc(b.n)}</b><small>${on?'Đã nhận':esc(b.d)}</small></div>`;
}
/* huy hiệu vừa đạt mà chưa báo: đánh dấu rồi trả về */
function badgesNew(){
  if(!KID || TEACHER) return [];
  const j=jGet(), m=jMetrics(), out=[];
  BADGES.forEach(b=>{ if(b.ok(m) && !j.badges[b.id]){ j.badges[b.id]=Date.now(); out.push(b); } });
  if(out.length) j.t=Date.now();
  return out;
}

/* ---------- quà bất ngờ: không báo trước, sau một số buổi học ---------- */
const SURPRISE_AT = [2,5,8,11,14,17];
function surprisePick(){
  const s=shop(), a=s.ava, sp=Object.keys(MON_SP).find(x=>!s.mons.some(m=>m.sp===x));
  const pool=[
    {k:'b', id:'vuon', n:'Nền ảnh "Vườn thú cưng"', img:Q_IMG+'bg_vuon.webp', bg:true},
    sp?{k:'egg', id:sp, n:'Trứng quái vật '+MON_SP[sp].n, img:Q_IMG+'mon_'+sp+'_0.webp'}:null,
    {k:'f', id:'vang', n:'Khung avatar Vàng', img:avaSrc(), fr:'vang'},
    {k:'o', id:a.c+'|tham_hiem', n:'Bộ đồ Nhà thám hiểm', img:`${Q_IMG}ava_${a.c}_tham_hiem.webp`},
    {k:'b', id:'phong', n:'Nền ảnh "Phòng quà"', img:Q_IMG+'bg_phong.webp', bg:true},
    {k:'f', id:'cauvong', n:'Khung avatar Cầu vồng', img:avaSrc(), fr:'cauvong'}].filter(Boolean);
  return pool.find(x=>x.k==='egg' || !s.own[x.k+':'+x.id]) || {k:'star', id:'15', n:'15 sao thưởng thêm vào ví', img:Q_IMG+'gift_sticker.webp'};
}
function surpriseGive(it){
  const s=shop();
  if(it.k==='egg') s.mons.push({sp:it.id, g:jGroup(), base:jMetrics().les, c:0, d:'', n:0, gift:true});
  else if(it.k==='star') s.spent-=15;
  else s.own[it.k+':'+it.id]=true;
  s.t=Date.now();
}

/* ---------- gọi một lần khi con vừa học xong một buổi: quà bất ngờ, huy hiệu, xong chặng ---------- */
function rewardExtras(g,i){
  const out={html:'', lines:[]};
  if(!KID || TEACHER || (typeof DEMO!=='undefined' && DEMO)) return out;
  jMark();
  const j=jGet(), m=jMetrics(g), parts=[];
  if(SURPRISE_AT.includes(m.les) && !j.gifts[m.les]){
    const it=surprisePick(); surpriseGive(it); j.gifts[m.les]=it.k+':'+it.id;
    parts.push(`<div class="rw-gift"><img class="rw-huou" src="tai-nguyen/nhan-vat/huou_huou1_a.webp" alt="">
      <div class="rw-letter"><small>💌 Thư của cô Hươu</small><b>Cô thấy con đã học đều ${m.les} buổi. Cô tặng con một món quà bất ngờ!</b>
      <span class="rw-item">${it.fr?`<span class="ava-mini big fr-${it.fr}" style="background-image:url('${avaBg()}')"><img src="${it.img}" alt=""></span>`:`<img class="${it.bg?'bg':''}" src="${it.img}" alt="">`}<em>${esc(it.n)}</em></span>
      <a class="rw-go" href="#/qua/${it.k==='egg'?'quai-vat':(it.k==='star'?'':'avatar')}">Xem trong Phòng đổi quà →</a></div></div>`);
    out.lines.push(KHEN.surprise);
  }
  const nb=badgesNew();
  if(nb.length){
    parts.push(`<div class="rw-badges"><small>🏅 Huy hiệu mới</small><div>${nb.map(b=>badgeHTML(b,g,true,false)).join('')}</div><a class="rw-go" href="#/hanh-trinh">Xem hành trình của con →</a></div>`);
    out.lines.push(KHEN.badge);
  }
  const r=Math.floor(i/PER);
  if(i%PER===PER-2 && m.st[r]){
    parts.push(`<div class="rw-stage">🎬 ${esc(KHEN.stage)} <a href="#/g/${g}/them/${r+1}">Mở Game – video chặng ${r+1} →</a></div>`);
    out.lines.push(KHEN.stage);
  }
  if(parts.length){ j.t=Date.now(); save(); }
  out.html=parts.join('');
  return out;
}
/* lời nhắn để ba mẹ khen cụ thể (khen việc con làm, không khen "con giỏi") */
function khenParent(g,i){
  const day=GROUPS[g].days[i], t=lessonTitle(day).replace(/^📖\s*/,'');
  return `<div class="rw-parent"><b>💬 Ba mẹ thử hỏi con:</b> “Hôm nay con học nói <i>${esc(t)}</i> thế nào?”. Khi con nói, ba mẹ khen đúng việc con làm: <i>“Con tự nói được câu này rồi!”</i>, <i>“Con nghe kỹ lắm!”</i>.</div>`;
}

/* ---------- trang "Hành trình của con" ---------- */
let teamCache={};
async function teamTotal(g){
  if(teamCache[g] && Date.now()-teamCache[g].t<300000) return teamCache[g].v;
  if(!SCORE_API) return null;
  try{ const r=await fetch(`${SCORE_API}?action=team&group=${encodeURIComponent(g)}`); const j=await r.json();
    if(j && typeof j.lessons==='number'){ teamCache[g]={t:Date.now(), v:j}; return j; } }catch(e){}
  return null;
}
function viewJourney(){
  document.body.classList.add('hub');
  const g=jGroup(), G=GROUPS[g], m=jMetrics(g), j=jGet();
  const fresh=badgesNew(); if(fresh.length) save();
  const stat=(ic,v,lb,sub)=>`<div class="hj-stat"><span class="hj-ic">${ic}</span><b>${v}</b><span>${lb}</span>${sub?`<small>${sub}</small>`:''}</div>`;
  app.innerHTML=`<div class="screen qscr hjscr">
    <div class="q-top"><a class="q-back" href="#/" aria-label="Về trang chủ">🧭</a><h2>Hành trình của con</h2>
      <span class="hj-team" id="hjTeam" hidden></span></div>
    <div class="q-body">
      <div class="hj-left">
        <div class="hj-me"><span class="ava-mini big fr-${shop().ava.fr}" style="background-image:url('${avaBg()}')"><img src="${avaSrc()}" alt=""></span>
          <div><b>${esc(KID&&!KID.temp?KID.name:'Nhà thám hiểm nhí')}</b><small>${esc(G.icon+' '+G.name)}</small>
          <div class="hj-road"><i style="width:${Math.round(m.les/LEARN_TOTAL*100)}%"></i><span>${m.les}/${LEARN_TOTAL} buổi</span></div></div></div>
        <div class="hj-stats">
          ${stat('📚', m.les, 'buổi con đã học', m.les<LEARN_TOTAL?`còn ${LEARN_TOTAL-m.les} buổi nữa là về đích`:'Con đã về đích!')}
          ${stat('📅', m.days, 'ngày con đã học', 'mỗi ngày học là một bước tiến')}
          ${stat('🎤', m.rec, 'lần con nói thành tiếng', 'càng nói nhiều, càng nói hay')}
          ${stat('⭐', m.pts, 'sao con đã kiếm', `<a href="#/qua">Mở Phòng đổi quà →</a>`)}
        </div>
        <a class="btn g hj-go" href="#/g/${g}">🗺️ Học tiếp trên bản đồ</a>
      </div>
      <div class="q-side hj-side"><h4>Huy hiệu của con <small>${BADGES.filter(b=>j.badges[b.id]||b.ok(m)).length}/${BADGES.length}</small></h4>
        <div class="hj-badges">${BADGES.map(b=>badgeHTML(b,g,b.ok(m),fresh.includes(b))).join('')}</div></div>
    </div></div>`;
  if(fresh.length){ sfx.win(); confetti(20); }
  if(STARTED) hdSay(fresh.length?[KHEN.badge, KHEN.journey]:[KHEN.journey]);
  teamTotal(g).then(t=>{ const el=document.getElementById('hjTeam'); if(!el || !t || !t.lessons) return;
    el.innerHTML=`🤝 Cả đội ${esc(G.name)}${t.kids?` (${t.kids} bạn)`:''} đã cùng học <b>${t.lessons}</b> buổi!`; el.hidden=false; });
}
