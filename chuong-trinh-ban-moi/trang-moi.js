/* Trang mới của bản xem trước: Ba mẹ, Thầy cô, Bộ sưu tập, Có gì mới */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ATK=window.ATK, view=$('#view');
const G=()=>ATK.gc;
const P={};
window.ATKpages=P;

/* ---------- tiện ích chung ---------- */
let curAudio=null;
function playSrc(f,btn){ try{ if(curAudio) curAudio.pause(); }catch(e){} if(!f) return; const a=new Audio(f); curAudio=a; btn&&btn.classList.add('talk'); a.onended=a.onerror=()=>btn&&btn.classList.remove('talk'); const p=a.play(); p&&p.catch&&p.catch(()=>btn&&btn.classList.remove('talk')); }
function spkBtn(x,l){ const f=(x.a&&x.a[l]||[])[0]; return f?`<button class="spk ${l} small" data-src="${esc(f)}" aria-label="${l==='zh'?'Nghe tiếng Trung':'Nghe tiếng Anh'}">🔊</button>`:''; }
function wireSpk(root){ root.querySelectorAll('[data-src]').forEach(b=>b.onclick=e=>{ e.preventDefault(); playSrc(b.dataset.src,b); }); }
function setNav(k){ document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.nav===k)); }
const course=id=>ATK.data.courses.find(c=>c.id===id);
const webCourses=()=>ATK.data.courses.filter(c=>c.units.some(u=>u.web));
function curCourse(){ const hs=G().hs.get(); const c=course(hs.khoa); return c&&c.units.some(u=>u.web)?c:webCourses()[0]; }
async function idsCua(key){ // từ có tranh của một ngày web
  const [cid,u,n]=key.split('/'); let L; try{ L=await ATK.lesson(cid,+u); }catch(e){ return []; }
  const W=L.webs.find(w=>w.n===+n); if(!W) return [];
  const ids=new Set(); const kho=ATK.data.kho;
  W.acts.forEach(a=>{ (a.items||[]).forEach(it=>ids.add(typeof it==='string'?it:it.id)); (a.qs||[]).forEach(q=>q.id&&ids.add(q.id)); });
  return [...ids].filter(id=>{ const x=kho[id]; return x&&x.k==='word'&&x.c===L.course&&+x.u===+u&&x.pics&&x.pics.length; });
}
function dots(ngays,mon){ const set=new Set(ngays), d0=G().today();
  return `<div class="wdots">${[0,1,2,3,4,5,6].map(i=>{ const d=G().add(mon,i); return `<span class="wd ${set.has(d)?'on':''} ${d===d0?'nay':''}"><i></i><small>${G().THU_VN[i]}</small></span>`; }).join('')}</div>`; }
function gateThen(fn){ if(G().daQuaCong()){ fn(); return; }
  view.innerHTML=`<div class="locked-page"><p class="lead">Khu vực dành cho người lớn.</p></div>`;
  G().cong(fn,()=>{ location.hash='#/'; }); }
const IDB=(function(){ let dbp=null; const db=()=>dbp||(dbp=new Promise(res=>{ try{ const r=indexedDB.open('atk2-ghi-am-thang',1);
  r.onupgradeneeded=()=>{ try{ r.result.createObjectStore('rec',{keyPath:'id'}); }catch(e){} }; r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); }catch(e){ res(null); } }));
  const tx=async(m,fn)=>{ const d=await db(); if(!d) return null; return new Promise(res=>{ try{ const t=d.transaction('rec',m), s=t.objectStore('rec'), o=fn(s); t.oncomplete=()=>res(o&&o.result!==undefined?o.result:true); t.onerror=()=>res(null); }catch(e){ res(null); } }); };
  const mem=[];
  return { async add(r){ const ok=await tx('readwrite',s=>s.put(r)); if(!ok) mem.push(r); }, async list(){ const xs=(await tx('readonly',s=>s.getAll()))||[]; return [...xs,...mem].sort((a,b)=>a.t-b.t); }, async del(id){ await tx('readwrite',s=>s.delete(id)); } };
})();

/* =====================================================================
   KHU VỰC BA MẸ
   ===================================================================== */
P.baMe=function(){ setNav('bame'); gateThen(renderBaMe); };
function consentForm(hs,first){
  const cs=webCourses(); const dy=hs.dong_y||{};
  return `<form class="card pform" id="hsf">
    ${first?`<h2>Bắt đầu</h2><p class="note">Ba mẹ điền một lần. Bản xem trước: mọi thông tin chỉ lưu trên máy này, không gửi đi đâu.</p>`:'<h2>Hồ sơ và quyền riêng tư</h2>'}
    <div class="fgrid">
      <label>Tên của con<input name="ten" value="${esc(hs.ten||ATK.store.get(ATK.KEY.name,''))}" required autocomplete="off"></label>
      <label>CES gọi ba mẹ là<input name="phu_huynh" value="${esc(hs.phu_huynh)}" placeholder="ví dụ: chị Hoa, anh Tuấn" autocomplete="off"></label>
      <label>Con đang học khóa<select name="khoa">${cs.map(c=>`<option value="${c.id}" ${c.id===hs.khoa?'selected':''}>${esc(c.name)}</option>`).join('')}</select></label>
      <fieldset><legend>Con có học lớp ở CES không?</legend>
        <label class="rad"><input type="radio" name="nhom" value="lop" ${hs.nhom!=='web'?'checked':''}> Có học lớp (online hoặc offline)</label>
        <label class="rad"><input type="radio" name="nhom" value="web" ${hs.nhom==='web'?'checked':''}> Chỉ học trên web</label></fieldset>
    </div>
    <h3>Ba mẹ đồng ý cho CES làm gì?</h3>
    <p class="note">Mỗi mục là một lựa chọn riêng. Ô không đánh dấu nghĩa là không đồng ý; ba mẹ đổi lại bất cứ lúc nào.</p>
    <label class="chk"><input type="checkbox" name="bao_cao" ${dy.bao_cao?'checked':''}> <span><b>Báo cáo học tập.</b> CES lưu ngày con học, bài con đã làm và điểm từng bài để gửi ba mẹ báo cáo tuần và để cô theo dõi. Không lưu từng cú nhấp chuột, không quay màn hình.</span></label>
    <label class="chk"><input type="checkbox" name="nhac" ${dy.nhac?'checked':''}> <span><b>Nhắc nhở.</b> Tối đa 3 tin mỗi tuần (thứ Hai: mục tiêu tuần, thứ Tư: mẹo học cùng con, cuối tuần: báo cáo). Không gửi từ 20:30 đến 7:00. Tạm dừng hoặc dừng hẳn bằng một nút.</span></label>
    <label class="chk"><input type="checkbox" name="uu_dai" ${dy.uu_dai?'checked':''}> <span><b>Thông tin ưu đãi.</b> Lời mời buổi nói thử miễn phí với cô, thông tin lớp học và gói học. Không đánh dấu thì CES không gửi những thông tin này.</span></label>
    <div class="fgrid">
      <label>Nhận tin qua<select name="kenh"><option value="zalo" ${hs.kenh==='zalo'?'selected':''}>Zalo</option><option value="email" ${hs.kenh==='email'?'selected':''}>Email</option></select></label>
      <label>Khung giờ nhận tin<select name="gio_nhan">${['7:00–9:00','11:30–13:00','18:00–20:00'].map(g=>`<option ${g===hs.gio_nhan?'selected':''}>${g}</option>`).join('')}</select></label>
    </div>
    <p class="note warn-note">Cần luật sư xác nhận mẫu đồng ý này trước khi dùng thật (Luật Bảo vệ dữ liệu cá nhân 91/2025, Nghị định 356/2025: có cần trẻ từ 7 tuổi cùng đồng ý không).</p>
    <button class="btn-main">${first?'Lưu và bắt đầu':'Lưu thay đổi'}</button> <span class="note" id="hsok" aria-live="polite"></span>
  </form>`;
}
function wireConsent(after){
  const f=$('#hsf'); if(!f) return;
  f.onsubmit=e=>{ e.preventDefault(); const v=new FormData(f);
    const x=G().hs.set({ten:v.get('ten').trim(),phu_huynh:v.get('phu_huynh').trim(),khoa:v.get('khoa'),nhom:v.get('nhom'),kenh:v.get('kenh'),gio_nhan:v.get('gio_nhan'),
      dong_y:{bao_cao:!!v.get('bao_cao'),nhac:!!v.get('nhac'),uu_dai:!!v.get('uu_dai'),t:Date.now()}});
    ATK.store.set(ATK.KEY.name,x.ten); $('#hsok').textContent='Đã lưu.'; after&&after(); };
}
function chart(weeks){
  const W=320,Hh=150,top=14,bot=28,mx=7,bw=26,gap=(W-24)/weeks.length;
  const y=v=>top+(Hh-top-bot)*(1-v/mx);
  const bd=G().monday(G().hs.get().bat_dau||G().today());
  const bars=weeks.map((w,i)=>{ const x=14+i*gap+(gap-bw)/2; if(w.mon<bd) return `<text x="${x+bw/2}" y="${Hh-bot-4}" text-anchor="middle" font-size="11" fill="var(--muted)">–</text><text x="${x+bw/2}" y="${Hh-bot+14}" text-anchor="middle" font-size="9" fill="var(--muted)">${G().vnDate(w.mon)}</text>`; const col=w.nghi&&!w.d?'var(--muted)':w.dat?'var(--ok)':'var(--en)';
    return `<g><rect x="${x}" y="${y(w.d)}" width="${bw}" height="${Math.max(0,Hh-bot-y(w.d))}" rx="5" fill="${col}" opacity="${w.nay?1:.85}"/>
      <line x1="${x-3}" x2="${x+bw+3}" y1="${y(w.g)}" y2="${y(w.g)}" stroke="var(--ink)" stroke-width="2" stroke-dasharray="3 2"/>
      <text x="${x+bw/2}" y="${y(w.d)-4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">${w.d}</text>
      <text x="${x+bw/2}" y="${Hh-bot+14}" text-anchor="middle" font-size="9" fill="var(--muted)">${w.nay?'Tuần này':G().vnDate(w.mon)}</text>
      ${w.nghi?`<text x="${x+bw/2}" y="${Hh-bot+25}" text-anchor="middle" font-size="9" fill="var(--muted)">nghỉ</text>`:''}</g>`; }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Số ngày học mỗi tuần so với mục tiêu, 8 tuần gần đây">${bars}</svg>
    <p class="note legend"><span class="lg ok"></span> đạt mục tiêu <span class="lg en"></span> chưa đạt <span class="lg goal"></span> mục tiêu ba mẹ chọn</p>`;
}
async function renderBaMe(){
  const gc=G(), hs=gc.hs.get();
  if(!hs.dong_y){ view.innerHTML=`<h1>Dành cho ba mẹ</h1>${consentForm(hs,true)}`; wireConsent(renderBaMe); return; }
  const c=curCourse(), mon=gc.monday(), ngays=gc.ngay.ds(), dTuan=ngays.filter(d=>d>=mon).length, goal=gc.mt.so(mon);
  const nghi=gc.nghi.get(), dangNghi=gc.nghi.dang(), ten=gc.tenCon();
  const nv=gc.nhiemVu(c);
  const daDat=gc.mt.daDatTuanNay();
  view.innerHTML=`<p class="crumb"><a href="#/">Lộ trình</a> › Ba mẹ</p>
  <h1>Dành cho ba mẹ</h1>
  <p class="lead">Con học ngắn, đều và có điểm dừng: mỗi ngày một nhiệm vụ khoảng 10–15 phút. Ba mẹ chọn số ngày mỗi tuần; một tuần học từ 3 ngày trở lên là đã rất tốt.</p>
  ${dangNghi?`<div class="card pcard pause-on"><b>Đang tạm nghỉ đến ${gc.vnDate(nghi.den)}${nghi.ly_do?' ('+esc(nghi.ly_do)+')':''}.</b> Web không nhắc, cô không gắn cờ. Khi con quay lại, bài đầu tiên chỉ ôn nhẹ những từ con đã biết. <button class="lnk" id="nghiX">Con quay lại học từ hôm nay</button></div>`:''}

  <section class="card pcard" id="tuan">
    <div class="tuan-h"><div><small class="stage">Tuần này</small><div class="big-n"><b>${dTuan}</b>/<span>${goal}</span> ngày</div></div>
      ${dTuan>=goal?`<div class="yay">🎉 ${esc(ten)} đạt mục tiêu tuần này!</div>`:''}</div>
    ${dots(ngays,mon)}
    <h3>${daDat?'Mục tiêu tuần này':'Ba mẹ chọn mục tiêu cho tuần này'}</h3>
    <div class="chips" role="radiogroup" aria-label="Số ngày học mỗi tuần">${[2,3,4,5].map(n=>`<button class="chip pick ${n===goal?'on':''}" data-mt="${n}" role="radio" aria-checked="${n===goal}">${n} ngày</button>`).join('')}</div>
    <p class="note">${hs.nhom==='lop'?'Con có học lớp: gợi ý 4 ngày (2 ngày web chuẩn bị cho mỗi buổi học trên lớp).':'Gợi ý 3 ngày mỗi tuần.'} Mục tiêu nhỏ mà đều tốt hơn mục tiêu lớn rồi bỏ dở.</p>
    <h3>Giờ học cố định trong ngày</h3>
    <div class="chips">${['Sau bữa sáng','Sau giờ học','Sau bữa tối','Trước khi ngủ'].map(g=>`<button class="chip pick ${gc.mt.gio()===g?'on':''}" data-gio="${esc(g)}">${g}</button>`).join('')}</div>
    <p class="note" id="mtok" aria-live="polite"></p>
  </section>

  <section class="card pcard"><h2>8 tuần gần đây</h2>${chart(gc.tuan(8))}
    <p>Tổng cộng <b>${gc.soTuanDat()} tuần</b> ${esc(ten)} đạt mục tiêu. Con nghỉ một tuần cũng không mất những tuần đã đạt.</p></section>

  <section class="card pcard" id="bc"><h2>Báo cáo tuần của ${esc(ten)}</h2><p class="note">Đang tổng hợp…</p></section>

  <section class="card pcard" id="hoi"><h2>Ba mẹ hỏi con (3 phút, không cần màn hình)</h2><p class="note">Đang tải…</p></section>

  <section class="card pcard" id="ghi"><h2>Ghi âm tiến bộ hằng tháng</h2><p class="note">Đang tải…</p></section>

  <section class="card pcard"><h2>Tạm nghỉ</h2>
    ${dangNghi?`<p>Đang tạm nghỉ đến <b>${gc.vnDate(nghi.den)}</b>.</p>`:`<p class="note">Tết, ốm, đi xa hay nhà bận: ba mẹ báo tạm nghỉ để web không nhắc và cô không gắn cờ. Các tuần con đã đạt vẫn giữ nguyên, quay lại không phải học bù.</p>
    <form id="nf" class="nform"><div class="chips">${['Tết','Ốm','Đi xa','Nhà đang bận'].map((x,i)=>`<label class="chip pick-r"><input type="radio" name="ly" value="${x}" ${i===0?'checked':''}> ${x}</label>`).join('')}</div>
      <label>Ngày con quay lại <input type="date" name="den" value="${gc.add(gc.today(),7)}" min="${gc.add(gc.today(),1)}" required></label>
      <button class="btn-main">Tạm nghỉ</button></form>`}
  </section>

  <section class="card pcard"><h2>Nhắc nhở</h2>
    <p class="note">Nhịp mặc định: 3 tin mỗi tuần, gửi cho ba mẹ, không gửi lên máy của con. ${hs.dong_y.nhac?'Ba mẹ đang nhận nhắc nhở.':'Ba mẹ chưa đồng ý nhận nhắc nhở (sửa ở phần Hồ sơ bên dưới).'}</p>
    <ul class="rhythm"><li><b>Thứ Hai, sáng</b> · mục tiêu ba mẹ chọn và điều con sẽ học trong tuần</li><li><b>Thứ Tư, chiều tối</b> · một mẹo học cùng con 3 phút</li><li><b>Thứ Bảy hoặc Chủ nhật, sáng</b> · báo cáo tuần</li></ul>
    <label class="sw"><input type="checkbox" id="nhacNgay" ${hs.nhac_ngay?'checked':''}><span class="sw-t" aria-hidden="true"></span> Thêm lời nhắc hằng ngày lúc <input type="time" id="gioNhac" value="${esc(hs.gio_nhac)}" class="tinput"></label>
    <p class="note">Lời nhắc hằng ngày tự dừng sau 3 lần liên tiếp ba mẹ bỏ qua, chỉ còn báo cáo tuần.</p>
    <p><button class="btn-sub" id="dung1">Tạm dừng nhắc 1 tuần</button> <button class="btn-sub" id="dungHan">Dừng nhận tin</button> <span class="note" id="nhacok" aria-live="polite"></span></p>
  </section>

  <section class="card pcard" id="goi"><h2>Gói học</h2></section>

  ${consentForm(hs,false)}
  <section class="card pcard"><h2>Dữ liệu của con trên máy này</h2>
    <p class="note">Web lưu: ngày học, bài đã làm, điểm từng bài, mục tiêu tuần, Hộp ôn, bản ghi âm (nếu có). Không lưu từng cú nhấp, không quay màn hình.</p>
    <button class="btn-sub" id="xoaDL">Xóa toàn bộ dữ liệu của con trên máy này</button></section>

  <details class="card pcard"><summary><b>Cách chương trình vận hành</b></summary>${ATK.guideHTML?ATK.guideHTML():''}</details>`;
  wireSpk(view);
  // mục tiêu
  view.querySelectorAll('[data-mt]').forEach(b=>b.onclick=()=>{ gc.mt.dat(+b.dataset.mt); renderBaMe(); });
  view.querySelectorAll('[data-gio]').forEach(b=>b.onclick=()=>{ gc.mt.dat(gc.mt.so(),b.dataset.gio); view.querySelectorAll('[data-gio]').forEach(x=>x.classList.toggle('on',x===b)); $('#mtok').textContent='Đã lưu giờ học: '+b.dataset.gio.toLowerCase()+'.'; });
  // tạm nghỉ
  const nf=$('#nf'); if(nf) nf.onsubmit=e=>{ e.preventDefault(); const v=new FormData(nf); gc.nghi.dat(v.get('den'),v.get('ly')); renderBaMe(); window.scrollTo(0,0); };
  const nx=$('#nghiX'); if(nx) nx.onclick=()=>{ gc.nghi.ket_thuc(); renderBaMe(); };
  // nhắc nhở
  const ok=t=>{ $('#nhacok').textContent=t; };
  $('#nhacNgay').onchange=e=>{ gc.hs.set({nhac_ngay:e.target.checked}); ok(e.target.checked?'Đã bật lời nhắc hằng ngày.':'Đã tắt lời nhắc hằng ngày.'); };
  $('#gioNhac').onchange=e=>{ gc.hs.set({gio_nhac:e.target.value}); ok('Đã lưu giờ nhắc.'); };
  $('#dung1').onclick=()=>{ gc.hs.set({dung_den:gc.add(gc.today(),7)}); ok('Đã tạm dừng nhắc đến '+gc.vnDate(gc.add(gc.today(),7))+'.'); };
  $('#dungHan').onclick=()=>{ const d=Object.assign({},gc.hs.get().dong_y,{nhac:false}); gc.hs.set({dong_y:d,nhac_ngay:false}); ok('Đã dừng. Ba mẹ bật lại bất cứ lúc nào trong phần Hồ sơ.'); };
  $('#xoaDL').onclick=()=>{ if(!confirm('Xóa toàn bộ dữ liệu học của con trên máy này? Không hoàn tác được.')) return;
    try{ Object.keys(localStorage).filter(k=>k.startsWith('atk2-')).forEach(k=>localStorage.removeItem(k)); indexedDB.deleteDatabase('atk2-ghi-am-thang'); indexedDB.deleteDatabase('atk2-gui-co'); }catch(e){}
    location.hash='#/'; };
  wireConsent(()=>setTimeout(renderBaMe,600));
  baoCao(c,nv,ten,hs,dTuan,goal); hoiCon(ten); ghiAm(c,nv); goiHoc(hs,ten);
}
async function baoCao(c,nv,ten,hs,d,g){
  const gc=G(), el=$('#bc'); if(!el) return; const mon=gc.monday(), all=gc.ngay.all();
  const keys=[...new Set(Object.keys(all).filter(x=>x>=mon).flatMap(x=>all[x].k))];
  const gap=new Set(); for(const k of keys) (await idsCua(k)).forEach(id=>gap.add(id));
  const th=gc.thuoc.all(), can=gc.thuoc.can;
  const moiThuoc=Object.keys(th).filter(id=>{ const ds=th[id].slice().sort(); return ds.length>=can&&ds[can-1]>=mon&&ATK.data.kho[id]; }).map(id=>ATK.data.kho[id]);
  const tongThuoc=Object.keys(th).filter(id=>gc.thuoc.da(id)).length;
  const U=nv&&nv.U, nextTxt=nv?`${esc(c.name)} · Unit ${U.u} (${esc(U.name)}) · Ngày ${nv.n}`:'con đã xong các bài hiện có';
  const tpl=d>=g?gc.MAU_TIN.find(x=>x.id==='t7a'):gc.MAU_TIN.find(x=>x.id==='t7b');
  const msg=gc.dien(tpl.tx,{ph:hs.phu_huynh||'ba mẹ',con:ten,d,mt:g,tu:gap.size,thuoc:moiThuoc.length,chu_de_sau:U?U.name:'mới'});
  el.innerHTML=`<h2>Báo cáo tuần của ${esc(ten)}</h2>
    <div class="facts mini"><div class="fact"><small>Ngày học</small><b>${d} / ${g}</b></div><div class="fact"><small>Từ gặp trong tuần</small><b>${gap.size}</b></div><div class="fact"><small>Từ mới thuộc tuần này</small><b>${moiThuoc.length}</b></div><div class="fact"><small>Tổng số từ đã thuộc</small><b>${tongThuoc}</b></div></div>
    <blockquote class="msg">${esc(msg)}</blockquote>
    ${moiThuoc.length?`<h3>Tiến bộ cụ thể: từ con mới thuộc</h3><div class="wgrid">${moiThuoc.slice(0,8).map(x=>`<div class="wcard"><img src="${esc(x.pics[0])}" alt=""><span class="en">${esc(x.en)}</span><span class="zh">${esc(x.zh)}</span>${x.py?`<small>${esc(x.py)}</small>`:''}<span class="row">${spkBtn(x,'en')}${spkBtn(x,'zh')}</span></div>`).join('')}</div>`
      :`<p class="note">Con "thuộc" một từ khi trả lời đúng ngay lần đầu ở 2 ngày khác nhau. Từ mới thuộc sẽ hiện ở đây kèm giọng đọc để ba mẹ nghe.</p>`}
    <h3>Bước tiếp theo</h3><p>${nextTxt}.</p>
    <p class="note">Bản thật: báo cáo này gửi qua ${hs.kenh==='email'?'email':'Zalo'} vào sáng cuối tuần${hs.dong_y&&hs.dong_y.bao_cao?'':' (ba mẹ chưa đồng ý mục Báo cáo học tập, nên sẽ không gửi)'}.</p>`;
  wireSpk(el);
}
async function hoiCon(ten){
  const gc=G(), el=$('#hoi'); if(!el) return;
  const all=gc.ngay.all(), ds=Object.keys(all).sort(); const last=ds.length?all[ds[ds.length-1]].k.slice(-1)[0]:null;
  let ids=last?await idsCua(last):[];
  if(!ids.length){ const c=curCourse(); const U=c.units.find(u=>u.web); ids=gc.album(c.name,U.u).map(x=>x.id); }
  const xs=ids.map(id=>ATK.data.kho[id]).filter(x=>x&&x.a&&x.a.en&&x.a.en[0]).sort(()=>Math.random()-.5).slice(0,3);
  const hc=gc.hs.hocCung(curCourse().name);
  el.innerHTML=`<h2>Ba mẹ hỏi con (3 phút, không cần màn hình)</h2>
    <p class="note">${last?'Từ của bài con học gần nhất.':'Từ của unit đầu tiên.'} Ba mẹ không cần biết tiếng Trung: bấm 🔊 để nghe trước.</p>
    <div class="wgrid">${xs.map(x=>`<div class="wcard"><img src="${esc(x.pics[0])}" alt=""><span class="en">${esc(x.en)}</span><span class="zh">${esc(x.zh)}</span>${x.py?`<small>${esc(x.py)}</small>`:''}<span class="row">${spkBtn(x,'en')}${spkBtn(x,'zh')}</span></div>`).join('')}</div>
    ${xs[0]?`<p class="tip">Chỉ vào tranh (hoặc đồ vật thật) và hỏi: <i>"${esc(xs[0].en)} tiếng Trung nói thế nào nhỉ?"</i> Con trả lời được thì khen cụ thể: <i>"Con nhớ cả tiếng Trung luôn!"</i> Con chưa nhớ thì ba mẹ bấm 🔊 cùng nghe, không sửa, không so sánh.</p>`:''}
    <label class="sw"><input type="checkbox" id="hcsw" ${hc?'checked':''}><span class="sw-t" aria-hidden="true"></span><b>Chế độ học cùng ba mẹ</b></label>
    <p class="note">Bật: đầu bài hiện biểu tượng 👪 để ba mẹ ngồi cùng; cuối bài hiện 3 tranh có giọng đọc để ba mẹ hỏi con. Mặc định bật cho PreB và Little Seed. Màn của con vẫn không có chữ tiếng Việt.</p>`;
  wireSpk(el);
  $('#hcsw').onchange=e=>gc.hs.set({hoc_cung:e.target.checked});
}
async function ghiAm(c,nv){
  const gc=G(), el=$('#ghi'); if(!el) return;
  const U=(nv&&nv.U)||c.units.find(u=>u.web);
  const kho=Object.values(ATK.data.kho).filter(x=>x.c===c.name&&+x.u===+U.u&&(x.k==='phrase'||x.k==='sentence')&&x.a&&x.a.en&&x.a.en[0]&&x.a.zh&&x.a.zh[0]);
  const mau=kho[0]||gc.album(c.name,U.u)[0];
  const thang=gc.today().slice(0,7);
  const recs=await IDB.list();
  const can=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  el.innerHTML=`<h2>Ghi âm tiến bộ hằng tháng</h2>
    <p class="note">Mỗi tháng con nói lại cùng một câu để ba mẹ nghe đầu tháng so với cuối tháng. Bản ghi chỉ ba mẹ nghe.</p>
    ${mau?`<div class="mau card"><span class="en">${esc(mau.en)}</span><span class="zh">${esc(mau.zh)}</span>${mau.py?`<small>${esc(mau.py)}</small>`:''}<span class="row">${spkBtn(mau,'en')}${spkBtn(mau,'zh')}</span></div>`:''}
    <p>${can?`<button class="btn-main" id="rec">🎤 Ghi âm cho tháng ${thang.slice(5)}/${thang.slice(0,4)}</button> <span class="note" id="rst" aria-live="polite"></span>`:'<span class="note">Trình duyệt này chưa cho ghi âm.</span>'}</p>
    ${recs.length?`<div class="recs">${recs.map(r=>{ let u=''; try{ u=URL.createObjectURL(r.blob); }catch(e){} return `<div class="rc"><b>Tháng ${esc(r.thang.slice(5))}/${esc(r.thang.slice(0,4))}</b><small>${new Date(r.t).toLocaleDateString('vi-VN')} · ${esc(r.mau||'')}</small>${u?`<audio controls preload="none" src="${esc(u)}"></audio>`:''}</div>`; }).join('')}</div>`:'<p class="note">Chưa có bản ghi nào.</p>'}
    <p class="note warn-note">Bản xem trước: bản ghi lưu trên máy này. Trước khi lưu giọng nói của trẻ lên hệ thống thật, CES cần luật sư xác nhận giọng nói thuộc loại dữ liệu nào và cách xin đồng ý.</p>`;
  wireSpk(el);
  const b=$('#rec'); if(!b) return;
  let mr=null, chunks=[], t0=0, tm=null;
  b.onclick=async()=>{
    if(mr&&mr.state==='recording'){ mr.stop(); return; }
    try{ const stream=await navigator.mediaDevices.getUserMedia({audio:true}); mr=new MediaRecorder(stream); chunks=[]; t0=Date.now();
      mr.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
      mr.onstop=async()=>{ clearTimeout(tm); stream.getTracks().forEach(t=>t.stop()); const blob=new Blob(chunks,{type:mr.mimeType||'audio/webm'});
        await IDB.add({id:'g'+Date.now(),thang,t:Date.now(),dur:Date.now()-t0,blob,mau:mau?(mau.en+' · '+mau.zh):''}); ghiAm(c,nv); };
      mr.start(); b.textContent='⏹ Dừng ghi'; $('#rst').textContent='Đang ghi, tối đa 20 giây…'; tm=setTimeout(()=>{ try{ mr.stop(); }catch(e){} },20000);
    }catch(e){ $('#rst').textContent='Chưa mở được micro.'; }
  };
}
function goiHoc(hs,ten){
  const gc=G(), el=$('#goi'); if(!el) return;
  const me=gc.conMayNay(), tx=gc.tuanXanh(me), c=curCourse();
  const elig=hs.nhom==='web'&&tx>=6&&hs.dong_y&&hs.dong_y.uu_dai;
  el.innerHTML=`<h2>Gói học</h2>
    <div class="goi"><div><small class="stage">Gói hiện tại (ví dụ)</small><b>Gói 1 khóa · ${esc(c.name)}</b><span class="note">Không tự động gia hạn. CES nhắc 14 ngày và 3 ngày trước khi hết hạn, kèm hồ sơ tiến bộ và giá đầy đủ.</span></div>
      <a class="btn-sub" href="#/ba-me" id="baoLuu">Bảo lưu (tạm nghỉ)</a></div>
    <details><summary>Các lựa chọn khi hết gói</summary><ul>
      <li><b>Dùng thử 14 ngày</b>: miễn phí, không cần nhập thẻ, không tự chuyển sang trả phí.</li>
      <li><b>Gói 1 khóa</b>: khớp với một khóa Anh – Trung – Kids; cuối khóa có hồ sơ tiến bộ và chứng nhận hoàn thành.</li>
      <li><b>Gói lộ trình 2–3 khóa</b>: ưu đãi rõ ràng, bảo lưu 4–6 tuần mỗi năm (Tết, hè), hoàn tiền theo phần chưa dùng.</li>
      <li><b>Gói anh chị em</b>: ưu đãi cho con thứ hai.</li>
      <li>CES không bán gói "trọn đời" hay gói nhiều năm trả trước.</li></ul></details>
    ${elig?`<div class="invite card"><b>Mời ${esc(ten)} một buổi nói 15 phút miễn phí với cô</b><p>${esc(ten)} đã học đều ${tx} tuần trên web. Cô nghe con phát âm tiếng Anh và tiếng Trung, rồi gửi ba mẹ nhận xét bằng tiếng Việt: 2 điểm mạnh và 1 điểm cần luyện. Buổi này không bắt buộc đăng ký lớp.</p><a class="btn-main" href="#/ba-me" onclick="alert('Bản xem trước: nút này sẽ mở lịch chọn giờ.');return false;">Chọn giờ</a></div>`
      :`<p class="note">(Ghi chú bản xem trước) Lời mời buổi nói thử miễn phí chỉ hiện khi con chỉ học web, đã học đều từ 6 tuần (mỗi tuần từ 3 ngày) và ba mẹ đồng ý nhận thông tin ưu đãi. Hiện: ${hs.nhom==='web'?'chỉ học web':'có học lớp'}, ${tx} tuần đều, ${hs.dong_y&&hs.dong_y.uu_dai?'đã':'chưa'} đồng ý nhận ưu đãi.</p>`}`;
  $('#baoLuu').onclick=e=>{ e.preventDefault(); const f=$('#nf'); if(f) f.scrollIntoView({behavior:'smooth',block:'center'}); };
}

/* =====================================================================
   THẦY CÔ: LỚP VÀ CỜ XANH / VÀNG / ĐỎ
   ===================================================================== */
let LOC={mau:'can',nhom:'all'};
P.lop=function(){ setNav('lop'); gateThen(renderLop); };
function hocSinh(){
  const gc=G(), lh=gc.lienHe.all();
  const xs=[gc.conMayNay(),...gc.lopMau()].map(s=>{ s.lien_he=(s.lien_he||[]).concat(lh[s.id]||[]); const t=gc.trangThai(s); return Object.assign(s,{tt:t}); });
  xs.forEach(s=>{ const f=['moi','vang','do'].includes(s.tt.mau); s.co=f?(s.co_gio!=null?Date.now()-s.co_gio*36e5:gc.coTu(s.id,s.tt.mau)):null;
    s.lhSau=f?s.lien_he.filter(x=>x.t>=s.co):[]; s.tx=gc.tuanXanh(s); s.elig=s.nhom==='web'&&s.tx>=6&&s.uu_dai&&!f; });
  return xs;
}
function phuTrach(s){ if(s.tt.mau==='do') return 'CVHT phụ trách nhóm hoặc quản lý lớp'; return s.nhom==='lop'?'GV lớp '+(s.lop||''):'CVHT (chỉ học web)'; }
function han(s){ if(!s.co) return ''; if(s.lhSau.length){ const x=s.lhSau[s.lhSau.length-1]; return `<span class="han ok">Đã liên hệ ${new Date(x.t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}${x.kq?' · '+esc(x.kq):''}</span>`; }
  const left=Math.round((s.co+48*36e5-Date.now())/36e5); return left>=0?`<span class="han">Còn ${left} giờ để liên hệ</span>`:`<span class="han tre">Quá hạn ${-left} giờ</span>`; }
function last7(s){ const gc=G(), d0=gc.today(), set=new Set(s.ngay); return `<span class="d7" aria-label="${s.tt.d7} ngày học trong 7 ngày">${[6,5,4,3,2,1,0].map(k=>`<i class="${set.has(gc.add(d0,-k))?'on':''}"></i>`).join('')}</span>`; }
function pill(m){ const x=G().MAU[m]; return `<span class="pill" style="--c:${x[1]}">${x[0]}</span>`; }
function renderLop(){
  const gc=G(), xs=hocSinh();
  const live=xs.filter(s=>s.tt.mau!=='nghi'&&s.tt.mau!=='ngung');
  const pct=(a,b)=>b?Math.round(100*a/b)+'%':'–';
  const dat=live.filter(s=>s.tt.d7>=3).length, act=live.filter(s=>s.tt.d7>=1).length;
  const flags=xs.filter(s=>s.co), lh48=flags.filter(s=>s.lhSau.some(x=>x.t-s.co<=48*36e5)).length;
  const moi=xs.filter(s=>{ const t=gc.diff(gc.today(),s.bat_dau); return t>=7&&t<=28; });
  const kh=moi.filter(s=>s.ngay.filter(d=>d<gc.add(s.bat_dau,7)).length>=3).length;
  const counts={}; xs.forEach(s=>counts[s.tt.mau]=(counts[s.tt.mau]||0)+1);
  const F=[['can','Cần liên hệ'],['do','Đỏ'],['vang','Vàng'],['moi','Mới'],['xanh','Xanh'],['nghi','Tạm nghỉ'],['all','Tất cả']];
  const pass=s=>(LOC.nhom==='all'||s.nhom===LOC.nhom)&&(LOC.mau==='all'||(LOC.mau==='can'?!!s.co:LOC.mau==='moi'?s.tt.mau.startsWith('moi'):LOC.mau==='nghi'?['nghi','ngung'].includes(s.tt.mau):s.tt.mau===LOC.mau));
  const order={do:0,moi:1,vang:2,'moi-ok':3,xanh:4,nghi:5,ngung:6};
  const rows=xs.filter(pass).sort((a,b)=>order[a.tt.mau]-order[b.tt.mau]||(a.co||0)-(b.co||0));
  view.innerHTML=`<p class="crumb"><a href="#/">Lộ trình</a> › Thầy cô</p>
  <h1>Lớp và cờ xanh / vàng / đỏ</h1>
  <p class="lead">Mỗi cờ có người phụ trách và hạn liên hệ 48 giờ. Sáng thứ Hai họp 30 phút, chỉ xem danh sách đỏ.</p>
  <p class="note warn-note">Bản xem trước: 12 học sinh giả lập để thầy cô thấy đủ các tình huống, cộng thêm dòng "Máy này" là con đang học trên chính máy này. Bản thật lấy dữ liệu của cả lớp từ máy chủ.</p>
  <div class="kpis">
    <div class="kpi card"><small>Đạt mục tiêu tuần</small><b>${pct(dat,live.length)}</b><span>≥3 ngày học trong 7 ngày · ${dat}/${live.length} con</span></div>
    <div class="kpi card"><small>Hoạt động tuần</small><b>${pct(act,live.length)}</b><span>≥1 ngày học trong 7 ngày</span></div>
    <div class="kpi card"><small>Cờ liên hệ trong 48 giờ</small><b>${pct(lh48,flags.length)}</b><span>${lh48}/${flags.length} cờ · mục tiêu ≥90%</span></div>
    <div class="kpi card"><small>Kích hoạt tuần đầu</small><b>${pct(kh,moi.length)}</b><span>Con mới có ≥3 ngày học trong 7 ngày đầu · mục tiêu ≥60%</span></div>
  </div>
  <div class="lop-f">
    <div class="chips" role="tablist">${F.map(([k,t])=>{ const n=k==='all'?xs.length:k==='can'?flags.length:k==='moi'?(counts.moi||0)+(counts['moi-ok']||0):k==='nghi'?(counts.nghi||0)+(counts.ngung||0):(counts[k]||0);
      return `<button class="chip pick ${LOC.mau===k?'on':''}" data-f="${k}" role="tab" aria-selected="${LOC.mau===k}">${t} · ${n}</button>`; }).join('')}</div>
    <label class="sel">Nhóm <select id="nhomF"><option value="all">Tất cả</option><option value="lop" ${LOC.nhom==='lop'?'selected':''}>Có học lớp</option><option value="web" ${LOC.nhom==='web'?'selected':''}>Chỉ học web</option></select></label>
  </div>
  <div class="hs-list">${rows.length?rows.map(s=>`<article class="hs card m-${s.tt.mau}">
    <div class="hs-a">${pill(s.tt.mau)}<div><b>${esc(s.ten)}</b>${s.may?' <span class="chip">Máy này</span>':''}<small>${esc(s.phu_huynh)} · ${esc(s.khoa)} · ${esc(s.lop)}</small></div></div>
    <div class="hs-b">${last7(s)}<small>Học gần nhất: ${s.tt.cuoi?gc.vnDate(s.tt.cuoi)+' ('+(s.tt.gap?s.tt.gap+' ngày trước':'hôm nay')+')':'chưa học'} · mục tiêu ba mẹ: ${s.muc_tieu} ngày</small></div>
    <div class="hs-c"><span class="why">${s.tt.why.map(esc).join(' · ')}</span>${s.co?`<small>Phụ trách: ${esc(phuTrach(s))}</small>${han(s)}`:''}${s.elig?'<span class="chip web">Đủ điều kiện mời buổi nói thử</span>':''}</div>
    <div class="hs-d">${s.co||s.elig||s.tt.mau==='xanh'||s.tt.mau==='moi-ok'?`<button class="btn-sub" data-tin="${esc(s.id)}">Mẫu tin</button>`:''}${s.co?`<button class="btn-main sm" data-lh="${esc(s.id)}">Ghi đã liên hệ</button>`:''}</div>
  </article>`).join(''):'<p class="card pcard">Không có con nào trong nhóm này.</p>'}</div>

  <section class="card pcard"><h2>Danh sách đỏ cho họp sáng thứ Hai</h2>
    ${xs.filter(s=>s.tt.mau==='do').map(s=>`<p class="red-row">${pill('do')} <b>${esc(s.ten)}</b> · ${esc(s.tt.why.join('; '))} · ${esc(phuTrach(s))} · ${han(s)}</p>`).join('')||'<p class="note">Không có con nào ở mức đỏ.</p>'}
    <p class="note">Ba nguyên tắc: liên hệ chăm sóc tách hẳn khỏi bán hàng (không chào gói trong cuộc gọi vàng, đỏ); mỗi gia đình tối đa 1 liên hệ cá nhân mỗi tuần; không bao giờ so sánh con với bạn khác.</p></section>

  <section class="card pcard"><h2>Đủ điều kiện mời buổi nói thử</h2>
    ${xs.filter(s=>s.elig).map(s=>`<p>${pill('xanh')} <b>${esc(s.ten)}</b> · ${s.tx} tuần học đều · ba mẹ đã đồng ý nhận ưu đãi <button class="btn-sub sm" data-tin="${esc(s.id)}" data-mau="moi_noi">Mẫu tin mời</button></p>`).join('')||'<p class="note">Chưa có con nào.</p>'}
    <p class="note">Điều kiện: chỉ học web, ≥6 tuần liền mỗi tuần ≥3 ngày (hoặc vừa xong một khóa), ba mẹ đã đồng ý nhận thông tin ưu đãi. Không mời khi con đang ở mức vàng hoặc đỏ.</p></section>

  <section class="card pcard"><h2>Nhịp tin và mẫu tin cho phụ huynh</h2>
    <p class="note">3 tin mỗi tuần tự động (thứ Hai, thứ Tư, cuối tuần) và tin cá nhân khi có cờ. Không gửi tự động từ 20:30 đến 7:00.</p>
    <div class="tpl-list">${gc.MAU_TIN.map(t=>`<details class="tpl"><summary><b>${esc(t.loai)}</b> <small>${esc(t.khi)}${t.tu_dong?' · tự động':''}</small></summary><p>${esc(t.tx)}</p></details>`).join('')}</div>
    <h3>Không bao giờ dùng</h3><ul>${gc.KHONG_DUNG.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>

  <section class="card pcard"><h2>Rào chắn an toàn và thời gian thực tế (máy này)</h2><div id="rao"></div></section>

  <section class="card pcard"><h2>Thiết lập cho thầy cô</h2>
    <label class="sw"><input type="checkbox" id="gvsw" ${gc.gv()?'checked':''}><span class="sw-t" aria-hidden="true"></span><b>Mở mọi bài (chế độ thầy cô)</b></label>
    <p class="note">Tắt (mặc định cho con): mỗi ngày mở 1 ngày web mới; xong ngày 8 của unit thì unit sau mở vào hôm sau. Bật: thầy cô mở được mọi bài để xem trước, màn cuối bài có thêm nút sang bài kế tiếp.</p>
    <div class="em" id="emBox"></div></section>

  <details class="card pcard"><summary><b>Quy tắc màu (ngưỡng ban đầu, hiệu chỉnh sau đợt thí điểm)</b></summary>
    <table class="rules"><tr><th>Màu</th><th>Khi nào</th><th>Ai, làm gì, hạn</th></tr>
    <tr><td>${pill('moi')}</td><td>14 ngày đầu: sau 3 ngày chưa có ngày học, hoặc sau 7 ngày có dưới 2 ngày học</td><td>GV (có lớp) hoặc CVHT (chỉ web): nhắn chào, gửi video hướng dẫn 2 phút, hỏi giờ học cố định, giúp đặt mục tiêu tuần đầu · 24–48 giờ</td></tr>
    <tr><td>${pill('xanh')}</td><td>≥3 ngày học trong 7 ngày gần nhất</td><td>Tin tự động 3 tin/tuần và báo cáo tuần; GV khen cả lớp kiểu không xếp hạng</td></tr>
    <tr><td>${pill('vang')}</td><td>1–2 ngày học trong 7 ngày; hoặc 7 ngày liền không học; hoặc giảm ≥50% so với trung bình 3 tuần trước; hoặc ba mẹ hạ mục tiêu 2 tuần liền</td><td>GV hoặc CVHT nhắn riêng qua Zalo, có tên con, kèm một bài 5 phút, hỏi một câu mở về khó khăn; không nhắc gói · 48 giờ</td></tr>
    <tr><td>${pill('do')}</td><td>≥14 ngày liền không học; hoặc vàng 2 tuần liền dù đã liên hệ; hoặc (có lớp) vắng ≥2 buổi/tháng và web vàng; hoặc ba mẹ phàn nàn, xin dừng</td><td>CVHT hoặc quản lý lớp: nhắn hẹn giờ rồi gọi 10–15 phút, thỏa thuận kế hoạch nhỏ 2 tuần, đề nghị bảo lưu nếu nhà bận, ghi kết quả · 48 giờ</td></tr>
    <tr><td>${pill('nghi')}</td><td>Ba mẹ báo tạm nghỉ</td><td>Không gắn cờ, không nhắc; 2 ngày trước ngày quay lại gửi tin chào mừng</td></tr>
    <tr><td>${pill('ngung')}</td><td>Đã liên hệ 2 lần ở mức đỏ, không phản hồi</td><td>QLCT duyệt: ngừng nhắc tự động, chỉ gửi bản tiến bộ hằng tháng và lời mời khi bắt đầu khóa mới</td></tr></table></details>`;
  view.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{ LOC.mau=b.dataset.f; renderLop(); });
  $('#nhomF').onchange=e=>{ LOC.nhom=e.target.value; renderLop(); };
  view.querySelectorAll('[data-tin]').forEach(b=>b.onclick=()=>tinDialog(xs.find(s=>s.id===b.dataset.tin),b.dataset.mau));
  view.querySelectorAll('[data-lh]').forEach(b=>b.onclick=()=>lhDialog(xs.find(s=>s.id===b.dataset.lh)));
  $('#gvsw').onchange=e=>gc.setGv(e.target.checked);
  rao(); emBox();
}
function tinDialog(s,force){
  const gc=G(); const m=force||(s.tt.mau==='do'?'do':s.tt.mau==='vang'?'vang':s.tt.mau==='moi'?'moi':s.elig?'moi_noi':s.tt.d7>=gc.mt.so()?'t7a':'t7b');
  const t=gc.MAU_TIN.find(x=>x.id===m);
  const nguoi=(m==='do'||s.nhom!=='lop')?'Thảo':'cô Lan'; /* mức đỏ: CVHT gọi */ const lop=s.nhom==='lop'?'lớp '+s.lop:'';
  const tx=gc.dien(t.tx,{ph:s.phu_huynh,con:s.ten,nguoi,lop,khoa:s.khoa,d:s.tt.d7,mt:s.muc_tieu,tu:'',thuoc:'',tx:s.tx,chu_de_sau:''});
  const el=document.createElement('div'); el.className='gate'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
  el.innerHTML=`<div class="gate-b card tin-b"><b class="gate-t">${esc(t.loai)} · ${esc(s.ten)}</b><small class="note">${esc(t.khi)}</small>
    <textarea rows="7">${esc(tx)}</textarea>
    <p class="note">Sửa những chỗ còn trong ngoặc {…} bằng thông tin thật trước khi gửi. Tin chăm sóc không nhắc đến gói.</p>
    <div class="gate-r"><button class="gate-x">Đóng</button><button class="gate-ok" id="cp">Sao chép</button></div></div>`;
  document.body.appendChild(el);
  el.querySelector('.gate-x').onclick=()=>el.remove();
  el.querySelector('#cp').onclick=async()=>{ const v=el.querySelector('textarea').value; try{ await navigator.clipboard.writeText(v); el.querySelector('#cp').textContent='Đã sao chép'; }catch(e){ el.querySelector('textarea').select(); } };
}
function lhDialog(s){
  const gc=G();
  const el=document.createElement('div'); el.className='gate'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true');
  el.innerHTML=`<form class="gate-b card"><b class="gate-t">Ghi đã liên hệ · ${esc(s.ten)}</b>
    <label class="sel">Cách liên hệ <select name="loai"><option value="nhan">Nhắn riêng Zalo</option><option value="goi">Gọi điện</option></select></label>
    <label class="sel">Kết quả <select name="kq"><option>Ba mẹ đã trả lời</option><option>Đã hẹn giờ gọi</option><option>Thỏa thuận kế hoạch 2 tuần</option><option>Ba mẹ xin tạm nghỉ</option><option>Không phản hồi</option></select></label>
    <label class="sel">Ghi chú (nguyên nhân: máy, giờ giấc, con chán, bài khó…)<input name="gc" autocomplete="off"></label>
    <div class="gate-r"><button type="button" class="gate-x">Hủy</button><button class="gate-ok">Lưu</button></div></form>`;
  document.body.appendChild(el);
  el.querySelector('.gate-x').onclick=()=>el.remove();
  el.querySelector('form').onsubmit=e=>{ e.preventDefault(); const v=new FormData(e.target);
    gc.lienHe.ghi(s.id,{loai:v.get('loai'),kq:v.get('kq'),ghi_chu:v.get('gc'),muc:s.tt.mau});
    if(s.may&&v.get('kq')==='Ba mẹ xin tạm nghỉ') gc.nghi.dat(gc.add(gc.today(),14),'ba mẹ xin');
    el.remove(); renderLop(); };
}
function rao(){
  const gc=G(), el=$('#rao'); if(!el) return;
  const nk=gc.phien.nhatKy(); const qua=nk.filter(x=>x.giay>30*60).length, toi=nk.filter(x=>{ const d=new Date(x.t); return d.getHours()*60+d.getMinutes()>=20*60+30; }).length;
  const tg=gc.ngay.thoiGian(); const ks=Object.keys(tg).sort();
  el.innerHTML=`<div class="facts mini"><div class="fact"><small>Phiên học đã ghi</small><b>${nk.length}</b></div><div class="fact"><small>Phiên quá 30 phút</small><b>${qua}</b></div><div class="fact"><small>Phiên bắt đầu sau 20:30</small><b>${toi}</b></div></div>
    ${ks.length?`<table class="rules"><tr><th>Bài</th><th>Thời gian thực tế (các lần làm)</th></tr>${ks.map(k=>`<tr><td>${esc(k.replace(/\//g,' · '))}</td><td>${tg[k].map(s=>(s/60).toFixed(1)+' phút').join(', ')}</td></tr>`).join('')}</table>`:'<p class="note">Chưa có bài nào làm xong trên máy này. Khi con làm xong, thời gian thực tế của từng bài hiện ở đây để đối chiếu với khung 10–15 phút.</p>'}`;
}
function emBox(){
  const el=$('#emBox'); if(!el) return;
  el.innerHTML=`<label class="sw"><input type="checkbox" id="emsw" ${ATK.enManh.on()?'checked':''}><span class="sw-t" aria-hidden="true"></span><b>Chế độ con trội tiếng Anh</b></label>
    <p class="note">Hiện chỉ có ở Canopy Unit 5. Sau Ôn nhanh có kiểm tra nhanh 4 câu; đúng 4/4 thì bớt lượt tiếng Anh, thêm bước tiếng Trung, mở Thử thách của Leo. Bản ghi Phiên dịch nhí nâng cao ở <a href="#/gui-co">Gửi cô</a>.</p><p class="note" id="emst"></p>`;
  const sw=$('#emsw'), st=$('#emst');
  const show=()=>{ const h=ATK.enManh.history(), n=ATK.enManh.failStreak();
    st.innerHTML=!sw.checked?'Đang tắt.':(h.length?`Kiểm tra nhanh đã làm ${h.length} lần, đúng 4/4: ${h.filter(x=>x.ok).length} lần.`:'Đang bật. Chưa có lần kiểm tra nhanh nào.')+(n>=3?` <b class="warn">Con trượt kiểm tra nhanh ${n} ngày liền: cô cân nhắc tắt chế độ.</b>`:''); };
  sw.onchange=()=>{ ATK.enManh.set(sw.checked); show(); }; show();
}

/* =====================================================================
   BỘ SƯU TẬP CỦA CON (phần thưởng gắn với từ đã thuộc)
   ===================================================================== */
P.suuTap=function(){
  setNav('suu'); const gc=G(); const ten=gc.tenCon();
  const cs=webCourses();
  view.innerHTML=`<h1>Bộ sưu tập${ten&&ten!=='con'?' của '+esc(ten):''}</h1>
  <p class="lead">Mỗi tranh sáng lên khi con đã thuộc từ đó: trả lời đúng ngay lần đầu ở 2 ngày học khác nhau. Không cần học thêm giờ, chỉ cần học đều.</p>
  ${cs.map(c=>c.units.filter(u=>u.web).map(U=>{ const al=gc.album(c.name,U.u); const da=al.filter(x=>gc.thuoc.da(x.id)).length; const full=al.length&&da>=Math.ceil(al.length*.8);
    return `<section class="album card"><div class="album-h"><h2>${esc(c.name)} · Unit ${U.u} · ${esc(U.name)}</h2><span class="chip ${full?'web':''}">${full?'🏆 ':''}${da}/${al.length}</span></div>
      <div class="album-g">${al.map(x=>{ const ok=gc.thuoc.da(x.id); return `<button class="al ${ok?'ok':''}" ${ok?`data-en="${esc((x.a.en||[])[0]||'')}" data-zh="${esc((x.a.zh||[])[0]||'')}"`:'disabled'} aria-label="${ok?esc(x.en):'chưa mở'}"><img src="${esc(x.pics[0])}" alt="" loading="lazy"></button>`; }).join('')}</div></section>`; }).join('')).join('')}`;
  view.querySelectorAll('.al.ok').forEach(b=>b.onclick=()=>{ playSrc(b.dataset.en,b); if(b.dataset.zh&&curAudio){ curAudio.onended=()=>{ b.classList.remove('talk'); setTimeout(()=>playSrc(b.dataset.zh,b),250); }; } });
};

/* =====================================================================
   CÓ GÌ MỚI (hướng dẫn kiểm tra bản xem trước)
   ===================================================================== */
P.moi=function(){
  setNav('moi');
  view.innerHTML=`<div class="prose"><h1>Có gì mới trong bản xem trước</h1>
  <p class="lead">Bản này dựng lại trang chương trình theo báo cáo "Người đồng hành giữ trẻ học web đều đặn". Trang thật ở <a href="../chuong-trinh/">/chuong-trinh/</a> chưa thay đổi. Tiến độ ở bản này lưu riêng, không lẫn với trang thật.</p>
  <p class="note warn-note">Muốn thử nhanh: mở link có thêm <a href="?thu=1#/moi">?thu=1</a>. Khi đó nhắc nghỉ sau 1 phút thay vì 20 phút, khóa mềm sau 1,5 phút thay vì 30 phút, con "thuộc" từ chỉ sau 1 ngày, và tranh đúng nhấp nháy ngay.</p>

  <h2>1. Màn học của con</h2>
  <ul>
    <li><b>Nhiệm vụ hôm nay</b> ở trang chủ: một nút ▶ đi thẳng vào ngày web tiếp theo. Học xong thì hiện "Hôm nay con đã học xong, hẹn mai". Các ngày web hiện có dài khoảng 6–12 phút, nằm trong khung 10–15 phút. <a href="#/">Xem</a></li>
    <li><b>Điểm dừng cuối bài</b>: nhân vật vẫy tay "Goodbye! 再见！" (giọng cô Hươu đã thu), không còn nút ▶ sang bài kế tiếp. Có nút tự chọn 🧠 ôn thêm Hộp ôn nếu có từ đến hạn.</li>
    <li><b>Mỗi ngày mở 1 ngày web mới</b>: xong Ngày 1 hôm nay thì Ngày 2 mở vào ngày mai (ô hiện 🌙). Thầy cô bật "Mở mọi bài" ở trang Thầy cô để xem trước. <i>Chị cân nhắc: giữ quy tắc này, hay mở theo buổi (2 ngày web mỗi lần)?</i></li>
    <li><b>Nhắc nghỉ ở phút 20, khóa mềm ở phút 30</b> dùng liên tục. Nút ▶ học tiếp sáng lên sau 15 giây nghỉ. Khi khóa, ba mẹ bấm 👪🔓 và qua cổng để mở thêm 10 phút. Chỉ tính thời gian khi con đang làm bài và màn hình đang mở.</li>
    <li><b>Nút tạm dừng ⏸</b> trong bài. Thoát ra giữa chừng thì lần sau làm tiếp từ chỗ dở (trong 24 giờ); nút 🔁 nhỏ để làm lại từ đầu.</li>
    <li><b>Quay lại sau ≥7 ngày nghỉ</b>: màn chào "Hello again! 你好！", phần Ôn nhanh chỉ hỏi 3 từ con đã biết, Hộp ôn tối đa 4 câu. Không có "nợ bài".</li>
    <li><b>Chế độ dễ tự động</b>: 2 bài gần nhất đều dưới 70% đúng ngay lần đầu thì câu chọn tranh còn 2 phương án; một bài từ 85% trở lên thì trở lại 3 phương án. Mục đích: bài chính giữ mức 70–90% đúng.</li>
    <li><b>Bộ sưu tập</b> thay cho thưởng theo số phút: tranh sáng lên khi con thuộc từ. Cuối bài, từ vừa thuộc bay vào 📒; đủ 80% từ của unit thì có màn ăn mừng cả unit. Thỉnh thoảng có pháo giấy không báo trước. <a href="#/suu-tap">Xem</a></li>
    <li><b>Học cùng ba mẹ</b>: mặc định bật cho Little Seed. Đầu bài hiện 👪, cuối bài hiện 3 tranh có giọng đọc để ba mẹ hỏi con. Màn của con vẫn không có chữ tiếng Việt.</li>
  </ul>
  <h2>2. Khu vực ba mẹ (có cổng phép tính)</h2>
  <ul>
    <li>Lần đầu: hồ sơ và <b>3 ô đồng ý tách riêng</b> (báo cáo học tập, nhắc nhở, thông tin ưu đãi), mặc định không đánh dấu.</li>
    <li><b>Mục tiêu tuần</b> do ba mẹ chọn (2–5 ngày) và giờ học cố định; chấm 7 ngày trong tuần; chúc mừng khi đạt.</li>
    <li><b>Biểu đồ 8 tuần</b> mục tiêu so với thực tế; đếm tổng số tuần đạt, không reset.</li>
    <li><b>Báo cáo tuần</b> viết theo mẫu tin, từ mới thuộc kèm giọng đọc, bước tiếp theo.</li>
    <li><b>Ba mẹ hỏi con</b>: 3 từ của bài gần nhất, có 🔊 tiếng Anh, tiếng Trung và pinyin, kèm câu hỏi gợi ý.</li>
    <li><b>Ghi âm tiến bộ hằng tháng</b> (lưu trên máy, chờ luật sư xác nhận trước khi lưu lên hệ thống).</li>
    <li><b>Tạm nghỉ</b>, <b>nhắc nhở</b> (tạm dừng 1 tuần, dừng nhận tin, không câu gây áy náy), <b>gói học</b> không tự gia hạn, lời mời buổi nói thử chỉ khi đủ điều kiện, <b>xóa dữ liệu</b>.</li>
  </ul>
  <p><a class="btn-bang" href="#/ba-me">Mở khu vực ba mẹ</a></p>
  <h2>3. Trang thầy cô</h2>
  <ul>
    <li>Lớp mẫu 12 con giả lập đủ tình huống: xanh, vàng, đỏ, mới, tạm nghỉ, ngừng liên hệ, đủ điều kiện mời nói thử. Dòng "Máy này" là con thật trên máy.</li>
    <li>4 chỉ số tuần; lọc theo màu và theo nhóm (có lớp, chỉ web); mỗi cờ có người phụ trách và đồng hồ 48 giờ.</li>
    <li>Nút <b>Mẫu tin</b> điền sẵn tên con, tên ba mẹ để sao chép; nút <b>Ghi đã liên hệ</b> ghi cách liên hệ và kết quả. 2 lần "Không phản hồi" ở mức đỏ thì chuyển sang "Ngừng liên hệ".</li>
    <li>Danh sách đỏ cho họp thứ Hai, danh sách mời buổi nói thử, toàn bộ mẫu tin và danh sách câu không bao giờ dùng, rào chắn an toàn và thời gian thực tế từng bài.</li>
  </ul>
  <p><a class="btn-bang" href="#/lop">Mở trang thầy cô</a></p>
  <h2>Chưa có trong bản này</h2>
  <ul>
    <li>Gửi tin Zalo, email thật; đồng bộ dữ liệu của cả lớp lên máy chủ; đăng nhập phụ huynh; thanh toán. Những phần này cần hệ thống thật và ý kiến luật sư.</li>
    <li>Web 21 ngày không bị đụng tới.</li>
  </ul></div>`;
};
})();
