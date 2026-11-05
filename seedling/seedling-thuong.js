/* =====================================================================
   SEEDLING · TÍCH SAO, ĐỔI QUÀ, HÀNH TRÌNH – chép cách làm của web 21 ngày (qua.js, khen.js)
   và chỉnh cho lớp offline Seedling (48 buổi, 99 ngày web):
   - Sao chỉ đến từ việc học, cố định theo việc làm xong (không theo số câu đúng).
   - "Đã kiếm" không bao giờ bị trừ; đổi quà chỉ trừ "sao trong ví".
   - Quà ảo (thú cưng, quái vật, avatar) đổi ngay. Quà ở lớp: ba mẹ xác nhận ở Cổng ba mẹ,
     web tạo phiếu, con đưa phiếu cho cô ở buổi học trên lớp (chưa có máy chủ).
   - Hành trình của con: con so với chính con (ngày học, lần nói, lần ôn, huy hiệu).
   - Quà bất ngờ không báo trước, sau một số ngày học.
   Giá và điều kiện ở khối Q_RULE (TẠM, chờ chị duyệt).
   ===================================================================== */
const Q_IMG = 'tai-nguyen/qua/';
const PTS = { dayDone: 10, review: 5, reviewMaxDay: 3 };
const Q_RULE = { petAdopt: 60, feed: 5, play: 10, careDay: 3, petG: [8, 20],
  egg: 40, candy: 8, candyDay: 3, candyE: 2, perDay: 3, monE: [6, 18], outfit: 30, giftPerUnit: 1 };
const UNITS = (window.SD && SD.units_q) || [{ u: 1, n: 'Unit 1 · Greeting', days: [1, 2, 3, 8], img: 'tai-nguyen/trang/ls_class.webp' }];
const PET_SP = { cun: { n: 'Cún con' }, meo: { n: 'Mèo con' }, gautruc: { n: 'Gấu trúc' } };
const MON_SP = { lua: { n: 'Lửa Nhỏ', c: '#E3262E' }, nuoc: { n: 'Giọt Nước', c: '#2F9BD6' }, la: { n: 'Mầm Lá', c: '#3BB273' } };
const AVA_CHAR = { bong: 'Bông', anna: 'Anna', leo: 'Leo', xiaomei: 'Xiaomei' };
const AVA_OUT = { '': 'Đồ thường', tham_hiem: 'Nhà thám hiểm', phi_hanh: 'Phi hành gia', sieu_nhan: 'Siêu anh hùng' };
const AVA_BG = { studio: { n: 'Sân khấu', img: Q_IMG + 'bg_avatar.webp', p: 0 }, vuon: { n: 'Vườn thú cưng', img: Q_IMG + 'bg_vuon.webp', p: 20 },
  quai: { n: 'Đồng cỏ quái vật', img: Q_IMG + 'bg_quai.webp', p: 20 }, phong: { n: 'Phòng quà', img: Q_IMG + 'bg_phong.webp', p: 20 },
  seed: { n: 'Thế giới Seedling', img: 'tai-nguyen/trang/the_gioi_seed.webp', p: 20 } };
const AVA_FR = { none: { n: 'Trắng', p: 0 }, vang: { n: 'Vàng', p: 15 }, cauvong: { n: 'Cầu vồng', p: 25 }, sao: { n: 'Sao lấp lánh', p: 30 }, vuongmien: { n: 'Vương miện', p: 40 } };
const GIFTS = [
  { id: 'sticker', n: 'Bộ sticker hoạt hình', vnd: '5.000đ', p: 120 }, { id: 'tay', n: 'Tẩy hình con vật', vnd: '5.000đ', p: 120 },
  { id: 'but_chi', n: 'Bút chì đầu thú', vnd: '5.000đ', p: 120 }, { id: 'kep_toc', n: 'Kẹp tóc nơ', vnd: '10.000đ', p: 200 },
  { id: 'moc_khoa', n: 'Móc khoá thú bông', vnd: '10.000đ', p: 200 }, { id: 'so_tay', n: 'Sổ tay mini', vnd: '10.000đ', p: 200 },
  { id: 'dat_nan', n: 'Đất nặn 6 màu', vnd: '15.000đ', p: 280 }, { id: 'sap_mau', n: 'Sáp màu 12 màu', vnd: '15.000đ', p: 280 },
  { id: 'xe', n: 'Xe kéo trớn mini', vnd: '15.000đ', p: 280 }, { id: 'rubik', n: 'Rubik 3x3', vnd: '20.000đ', p: 350 },
  { id: 'hop_but', n: 'Hộp bút hình thú', vnd: '20.000đ', p: 350 }];
const Q_ST = { cho: 'Chờ cô duyệt', da_trao: 'Cô đã trao quà', tu_choi: 'Cô chưa duyệt · đã hoàn sao' };
const KHEN = { surprise: 'Ôi, cô có một món quà bất ngờ cho con!', badge: 'Con nhận được một huy hiệu mới!',
  journey: 'Đây là hành trình của con. Con xem con đã học được bao nhiêu rồi nhé!' };

/* ---------- tiện ích chung ---------- */
let toastT = 0;
function toast(t) { const el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
/* lời cô Hươu ngoài bài học: có file thu thì phát, luôn hiện chữ */
function hdSay(lines) { const L = Array.isArray(lines) ? lines : [lines]; toast(L[L.length - 1]);
  (async () => { const my = RUN; for (const t of L) { if (my !== RUN) return; const a = (SD.vi_t || {})[t]; if (a) await playFile(a); else await wait(300); } })(); }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function daysSince(day) { if (!day) return 99; return Math.round((Date.parse(today()) - Date.parse(day)) / 864e5); }
function daysDone() { return Object.values(P.days).filter(d => d.done).length; }
function addStars(n) { P.stars = (P.stars || 0) + n; save(); bumpStars(); }
function bumpStars() { const el = document.getElementById('starCount'); if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
function qFloat(el, txt) { if (!el) return; const r = el.getBoundingClientRect(), f = document.createElement('span'); f.className = 'q-float'; f.textContent = txt;
  f.style.left = (r.left + r.width / 2) + 'px'; f.style.top = (r.top + r.height * .35) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 1300); }
function unitDone(U) { return U.days.every(d => P.days[d] && P.days[d].done); }

/* ---------- ví sao ---------- */
function shop() { const s = (P._shop && typeof P._shop === 'object') ? P._shop : (P._shop = {});
  s.spent = +s.spent || 0; s.own = s.own || {}; s.pets = s.pets || []; s.mons = s.mons || []; s.orders = s.orders || [];
  s.ava = s.ava || { c: 'bong', o: '', bg: 'studio', fr: 'none' }; return s; }
function coAwards() { return ((P.co && P.co.awards) || []); }
function coSum() { return coAwards().reduce((a, x) => a + (+x.n || 0), 0); }
function qEarned() { return (P.stars || 0) + coSum(); }
function qWallet() { return Math.max(0, qEarned() - shop().spent); }
function qNoStars(n) { sfx.no(); toast(`Con cần ${n} ⭐, trong ví con có ${qWallet()} ⭐. Con học thêm để kiếm sao nhé!`); }
function qSpend(n) { if (qWallet() < n) { qNoStars(n); return false; } shop().spent += n; save(); sfx.coin(); bumpStars(); updWallet(); return true; }
function qWalletHTML() { return `<div class="q-wallet"><span><small>Đã kiếm</small><b>⭐ ${qEarned()}</b></span><span><small>Đã đổi</small><b>${shop().spent}</b></span><span class="q-left"><small>Trong ví</small><b>⭐ ${qWallet()}</b></span></div>`; }
function updWallet() { const w = document.querySelector('.q-wallet'); if (w) w.outerHTML = qWalletHTML(); }

/* ---------- avatar ---------- */
function avaSrc(a) { a = a || shop().ava; return a.o ? `${Q_IMG}ava_${a.c}_${a.o}.webp` : `tai-nguyen/nhan-vat/kids_${a.c}_a.webp`; }
function avaBg(a) { a = a || shop().ava; return (AVA_BG[a.bg] || AVA_BG.studio).img; }
function qSide() { const b = document.getElementById('sdKid'); if (!b) return; const a = shop().ava, im = b.querySelector('.ava-mini');
  const html = `<span class="ava-mini fr-${a.fr}" style="background-image:url('${avaBg(a)}')"><img src="${avaSrc(a)}" alt=""></span>`;
  if (im) im.outerHTML = html; else { const old = b.querySelector('img'); if (old) old.outerHTML = html; } }

/* ---------- cổng ba mẹ: phép nhân để chắc người lớn xác nhận ---------- */
function parentGate(title, detail, ok) {
  const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
  const ov = document.createElement('div'); ov.className = 'overlay pp';
  ov.innerHTML = `<div class="modal pp-box q-gate" role="dialog" aria-label="Cổng ba mẹ"><button class="pp-x" aria-label="Đóng">✕</button>
    <h3>👨‍👩‍👧 Cổng ba mẹ</h3><p class="q-gate-what"><b>${esc(title)}</b><br>${detail}</p>
    <p>Ba mẹ trả lời để xác nhận: <b class="q-gate-q">${a} × ${b} = ?</b></p>
    <div class="row"><input class="q-gate-in" id="qGateIn" type="number" inputmode="numeric" aria-label="Kết quả"><button class="btn g" id="qGateOk">Xác nhận</button></div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove(), inp = ov.querySelector('input');
  ov.querySelector('.pp-x').onclick = close; ov.addEventListener('click', e => { if (e.target === ov) close(); });
  const go = () => { if (+inp.value === a * b) { close(); ok(); } else { sfx.no(); inp.value = ''; inp.focus(); toast('Chưa đúng. Ba mẹ thử lại nhé!'); } };
  ov.querySelector('#qGateOk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  setTimeout(() => inp.focus(), 50);
}
function qCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return 'SDL-' + s; }

/* ---------- khung chung các phòng ---------- */
let qSpoke = {};
function qSay(key, lines) { if (qSpoke[key]) return; qSpoke[key] = true; hdSay(lines); }
function qFrame(title, body, cls) { document.body.classList.add('hub'); setActive('qua');
  app.innerHTML = `<div class="screen qscr ${cls || ''}"><div class="q-top"><a class="q-back" href="#/qua" aria-label="Về Phòng đổi quà">🎁</a><h2>${title}</h2>${qWalletHTML()}</div>
    <div class="q-body">${body}</div></div>`; }

/* ---------- sảnh Phòng đổi quà ---------- */
function viewQua(sub) {
  if (sub === 'thu-cung') return viewPets(); if (sub === 'quai-vat') return viewMons(); if (sub === 'avatar') return viewAvatar();
  if (sub === 'qua-lop') return viewGifts(); if (sub === 'phieu') return viewOrders();
  const s = shop(), p = s.pets[s.petSel || 0], m = s.mons[s.monSel || 0];
  document.body.classList.add('hub'); setActive('qua');
  app.innerHTML = `<div class="screen qscr qhub"><div class="q-top"><span class="q-back">🎁</span><h2>Phòng đổi quà</h2>${qWalletHTML()}</div>
    <div class="q-grid">
      ${tile({ href: '#/qua/thu-cung', img: p ? petImg(p) : Q_IMG + 'pet_cun_2.webp', size: 'auto 86%', pos: '50% 90%', bg: '#E3F5D2', c: '#3BB273', t: 'Nuôi thú cưng', sub: p ? `${PET_SP[p.sp].n} · ${petStageName(p)}` : 'Nhận nuôi miễn phí 1 bạn' })}
      ${tile({ href: '#/qua/quai-vat', img: m ? monImg(m) : Q_IMG + 'mon_lua_2.webp', size: 'auto 86%', pos: '50% 90%', bg: '#EDE4FF', c: '#7B5CD6', t: 'Nuôi quái vật', sub: m ? `${MON_SP[m.sp].n} · ${monStageName(m)}` : `Trứng ${Q_RULE.egg} ⭐ · lớn lên khi con học` })}
      ${tile({ href: '#/qua/avatar', img: avaSrc(), size: 'auto 92%', pos: '50% 100%', bg: '#FFE4EC', c: '#E3487A', t: 'Avatar của con', sub: 'Trang phục · nền · khung' })}
      ${tile({ href: '#/qua/qua-lop', img: Q_IMG + 'gift_rubik.webp', size: 'auto 70%', pos: '50% 60%', bg: '#FFF1CC', c: '#F28C00', t: 'Quà ở lớp', sub: 'Cô trao ở buổi học · 120–350 ⭐' })}
      ${tile({ href: '#/hanh-trinh', img: 'tai-nguyen/trang/ls_stickers.webp', size: 'auto 92%', bg: '#FFF8E1', c: '#C9A227', t: 'Hành trình của con', sub: 'Huy hiệu · ngày học · lần nói' })}
      ${tile({ href: '#/qua/phieu', img: Q_IMG + 'gift_so_tay.webp', size: 'auto 70%', pos: '50% 60%', bg: '#E4F0FF', c: '#2F6FD6', t: 'Phiếu & cách kiếm sao', sub: s.orders.length ? `${s.orders.length} phiếu của con` : 'Sao đến từ đâu?' })}
    </div></div>`;
  qSay('hub', 'Chào mừng con đến Phòng đổi quà! Con dùng sao kiếm được khi học để nuôi thú cưng, nuôi quái vật, chọn trang phục, hoặc đổi quà thật.');
}

/* ---------- thú cưng ---------- */
function petStage(p) { return p.g >= Q_RULE.petG[1] ? 3 : (p.g >= Q_RULE.petG[0] ? 2 : 1); }
function petStageName(p) { return ['', 'Bé xíu', 'Lớn rồi', 'Trưởng thành'][petStage(p)]; }
function petImg(p) { return `${Q_IMG}pet_${p.sp}_${petStage(p)}.webp`; }
function viewPets() {
  const s = shop(); const sel = Math.min(s.petSel || 0, Math.max(0, s.pets.length - 1)); const p = s.pets[sel];
  const list = Object.keys(PET_SP).map(sp => { const k = s.pets.findIndex(x => x.sp === sp), own = k >= 0, x = s.pets[k], price = s.pets.length ? Q_RULE.petAdopt : 0;
    return `<button class="q-card ${own && k === sel ? 'on' : ''}" data-sp="${sp}" data-k="${k}" type="button"><img src="${own ? petImg(x) : Q_IMG + 'pet_' + sp + '_1.webp'}" alt=""><b>${PET_SP[sp].n}</b>
      <span class="q-price ${own ? 'own' : ''}">${own ? petStageName(x) : (price ? price + ' ⭐' : 'Miễn phí')}</span></button>`; }).join('');
  let stage;
  if (p) { const st = petStage(p), nxt = Q_RULE.petG[st - 1], prev = st === 1 ? 0 : Q_RULE.petG[st - 2], care = p.d === today() ? p.n : 0, miss = daysSince(p.last) >= 2;
    stage = `<div class="q-stage" style="background-image:url('${Q_IMG}bg_vuon.webp')"><div class="q-plate"><b>${PET_SP[p.sp].n}</b><span>${petStageName(p)}</span></div>
      <div class="q-meters"><div class="q-meter"><small>Lớn lên</small><i><u style="width:${st === 3 ? 100 : Math.round((p.g - prev) / (nxt - prev) * 100)}%"></u></i></div><div class="q-mood">${miss ? '🥺 Bạn ấy nhớ con!' : '😊 Bạn ấy đang vui'}</div></div>
      <img class="q-crit pet s${st}" id="qCrit" src="${petImg(p)}" alt="${PET_SP[p.sp].n}">
      <div class="q-acts"><button class="q-act" id="qFeed" type="button">🍖<b>Cho ăn</b><span>${Q_RULE.feed} ⭐</span></button><button class="q-act" id="qPlay" type="button">🎾<b>Chơi cùng</b><span>${Q_RULE.play} ⭐</span></button></div>
      <div class="q-care">Hôm nay: ${care}/${Q_RULE.careDay} lần chăm</div></div>`;
  } else stage = `<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_vuon.webp')"><div class="q-empty">🐾 Con chọn một bạn bên cạnh để nhận nuôi nhé!<br><small>Bạn đầu tiên được tặng miễn phí.</small></div></div>`;
  qFrame('🐶 Nuôi thú cưng', `${stage}<div class="q-side"><h4>Các bạn thú cưng</h4><div class="q-cards">${list}</div>
    <p class="q-hint">Cho ăn: +1 · Chơi cùng: +2 điểm lớn. Đủ ${Q_RULE.petG[0]} điểm bạn ấy lớn, đủ ${Q_RULE.petG[1]} điểm bạn ấy trưởng thành. Mỗi ngày chăm tối đa ${Q_RULE.careDay} lần.</p></div>`, 'qpet');
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => { const sp = b.dataset.sp, k = +b.dataset.k;
    if (k >= 0) { s.petSel = k; save(); sfx.pop(); return viewPets(); }
    const price = s.pets.length ? Q_RULE.petAdopt : 0; if (price && !qSpend(price)) return;
    s.pets.push({ sp, g: 0, d: '', n: 0, last: today() }); s.petSel = s.pets.length - 1; save(); sfx.win(); confetti(16);
    viewPets(); hdSay(`Con đã nhận nuôi ${PET_SP[sp].n}! Con cho bạn ấy ăn hoặc chơi cùng để bạn ấy lớn lên nhé.`); });
  if (p) { const care = kind => { if (p.d !== today()) { p.d = today(); p.n = 0; }
      if (p.n >= Q_RULE.careDay) { sfx.no(); return hdSay('Bạn ấy đã chơi đủ hôm nay rồi. Ngày mai con quay lại nhé!'); }
      if (!qSpend(kind === 'feed' ? Q_RULE.feed : Q_RULE.play)) return;
      const before = petStage(p); p.g += kind === 'feed' ? 1 : 2; p.n++; p.last = today(); save();
      const el = document.getElementById('qCrit'); qFloat(el, kind === 'feed' ? '😋 +1' : '💖 +2');
      if (petStage(p) > before) setTimeout(() => { sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewPets(); }, 700);
      else { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); setTimeout(viewPets, 900); } };
    document.getElementById('qFeed').onclick = () => care('feed'); document.getElementById('qPlay').onclick = () => care('play'); }
  qSay('pet', s.pets.length ? 'Con cho bạn ấy ăn hoặc chơi cùng để bạn ấy lớn lên nhé.' : 'Con chọn một bạn thú cưng để nhận nuôi nhé. Bạn đầu tiên được tặng miễn phí!');
}

/* ---------- quái vật: lớn lên nhờ con học (mỗi ngày web học xong +3 năng lượng) ---------- */
function monSince(m) { return Math.max(0, daysDone() - m.base); }
function monEnergy(m) { const k = monSince(m); return k >= 1 ? Q_RULE.perDay * k + (m.c || 0) : 0; }
function monStage(m) { if (monSince(m) < 1) return 0; const e = monEnergy(m); return e >= Q_RULE.monE[1] ? 3 : (e >= Q_RULE.monE[0] ? 2 : 1); }
function monStageName(m) { return ['Trứng', 'Bé con', 'Lớn rồi', 'Tiến hoá'][monStage(m)]; }
function monImg(m) { return `${Q_IMG}mon_${m.sp}_${monStage(m)}.webp`; }
function viewMons() {
  const s = shop(); const sel = Math.min(s.monSel || 0, Math.max(0, s.mons.length - 1)); const m = s.mons[sel];
  const list = Object.keys(MON_SP).map(sp => { const k = s.mons.findIndex(x => x.sp === sp), own = k >= 0, x = s.mons[k];
    return `<button class="q-card ${own && k === sel ? 'on' : ''}" data-sp="${sp}" data-k="${k}" type="button" style="--mc:${MON_SP[sp].c}"><img src="${own ? monImg(x) : Q_IMG + 'mon_' + sp + '_0.webp'}" alt=""><b>${MON_SP[sp].n}</b>
      <span class="q-price ${own ? 'own' : ''}">${own ? monStageName(x) : Q_RULE.egg + ' ⭐'}</span></button>`; }).join('');
  let stage;
  if (m) { const st = monStage(m), e = monEnergy(m), cd = m.d === today() ? m.n : 0;
    if (st > 0 && !m.seen) { m.seen = true; save(); setTimeout(() => { sfx.win(); confetti(30); hdSay('Ôi, trứng nở rồi!'); }, 300); }
    const lo = st <= 1 ? 0 : (st === 2 ? Q_RULE.monE[0] : Q_RULE.monE[1]), hi = st <= 1 ? Q_RULE.monE[0] : Q_RULE.monE[1];
    stage = `<div class="q-stage" style="background-image:url('${Q_IMG}bg_quai.webp')"><div class="q-plate" style="--pc:${MON_SP[m.sp].c}"><b>${MON_SP[m.sp].n}</b><span>${monStageName(m)}</span></div>
      <div class="q-meters">${st === 0 ? '<div class="q-mood">🥚 Con học xong 1 ngày thì trứng nở!</div>' : `<div class="q-meter"><small>Năng lượng ${e}</small><i><u style="width:${st === 3 ? 100 : Math.round((e - lo) / (hi - lo) * 100)}%"></u></i></div><div class="q-mood">⚡ Mỗi ngày học xong +${Q_RULE.perDay}</div>`}</div>
      <img class="q-crit mon s${st} ${st === 0 ? 'egg' : ''}" id="qCrit" src="${monImg(m)}" alt="${MON_SP[m.sp].n}">
      <div class="q-acts"><button class="q-act" id="qCandy" type="button" ${st === 0 ? 'disabled' : ''}>🍬<b>Kẹo năng lượng</b><span>${Q_RULE.candy} ⭐ · +${Q_RULE.candyE}</span></button>
        <a class="q-act learn" href="#/ban-do">📚<b>Đi học</b><span>+${Q_RULE.perDay} mỗi ngày</span></a></div>
      <div class="q-care">${st === 0 ? 'Trứng đang được ấp…' : `Kẹo hôm nay: ${cd}/${Q_RULE.candyDay}`}</div></div>`;
  } else stage = `<div class="q-stage empty" style="background-image:url('${Q_IMG}bg_quai.webp')"><div class="q-empty">🥚 Con chọn một quả trứng bên cạnh nhé!<br><small>Học xong 1 ngày là trứng nở, càng học quái vật càng lớn.</small></div></div>`;
  qFrame('👾 Nuôi quái vật', `${stage}<div class="q-side"><h4>Trứng quái vật</h4><div class="q-cards">${list}</div>
    <p class="q-hint">Quái vật lớn lên khi con học: mỗi ngày web học xong +${Q_RULE.perDay} năng lượng. Đủ ${Q_RULE.monE[0]} năng lượng quái vật lớn, đủ ${Q_RULE.monE[1]} năng lượng quái vật tiến hoá.</p></div>`, 'qmon');
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => { const sp = b.dataset.sp, k = +b.dataset.k;
    if (k >= 0) { s.monSel = k; save(); sfx.pop(); return viewMons(); }
    if (!qSpend(Q_RULE.egg)) return;
    s.mons.push({ sp, base: daysDone(), c: 0, d: '', n: 0 }); s.monSel = s.mons.length - 1; save(); confetti(12);
    viewMons(); hdSay('Mỗi ngày con học xong, quái vật của con lại lớn thêm.'); });
  const cb = document.getElementById('qCandy');
  if (m && cb) cb.onclick = () => { if (m.d !== today()) { m.d = today(); m.n = 0; }
    if (m.n >= Q_RULE.candyDay) { sfx.no(); return hdSay('Hôm nay quái vật ăn đủ kẹo rồi. Con đi học để quái vật lớn thêm nhé!'); }
    if (!qSpend(Q_RULE.candy)) return;
    const before = monStage(m); m.c = (m.c || 0) + Q_RULE.candyE; m.n++; save(); qFloat(document.getElementById('qCrit'), '⚡ +' + Q_RULE.candyE);
    if (monStage(m) > before) setTimeout(() => { sfx.win(); confetti(30); hdSay('Hoan hô! Bạn ấy lớn lên rồi!'); viewMons(); }, 700); else setTimeout(viewMons, 900); };
  qSay('mon', s.mons.length ? 'Mỗi ngày con học xong, quái vật của con lại lớn thêm.' : 'Con chọn một quả trứng quái vật. Con học xong một ngày thì trứng sẽ nở!');
}

/* ---------- avatar: thử trước, thích thì đổi ---------- */
let qPrev = null, qTab = 'c';
function avaOwned(kind, id) { const s = shop(); if (kind === 'c') return true; if (kind === 'o') return !id.split('|')[1] || !!s.own['o:' + id];
  if (kind === 'b') return !AVA_BG[id].p || !!s.own['b:' + id]; if (kind === 'f') return !AVA_FR[id].p || !!s.own['f:' + id]; }
function avaPrice(kind, id) { if (kind === 'o') return id.split('|')[1] ? Q_RULE.outfit : 0; if (kind === 'b') return AVA_BG[id].p; if (kind === 'f') return AVA_FR[id].p; return 0; }
function applyAva(k, id) { const a = shop().ava; if (k === 'c') { a.c = id; a.o = ''; } if (k === 'o') { const [c, o] = id.split('|'); a.c = c; a.o = o; } if (k === 'b') a.bg = id; if (k === 'f') a.fr = id; save(); qSide(); }
function viewAvatar() {
  const s = shop(), a = Object.assign({}, s.ava);
  if (qPrev) { if (qPrev.k === 'c') { a.c = qPrev.id; a.o = ''; } if (qPrev.k === 'o') { const [c, o] = qPrev.id.split('|'); a.c = c; a.o = o; } if (qPrev.k === 'b') a.bg = qPrev.id; if (qPrev.k === 'f') a.fr = qPrev.id; }
  const items = { c: Object.keys(AVA_CHAR).map(c => ({ k: 'c', id: c, n: AVA_CHAR[c], img: `tai-nguyen/nhan-vat/kids_${c}_a.webp` })),
    o: Object.keys(AVA_OUT).map(o => ({ k: 'o', id: a.c + '|' + o, n: AVA_OUT[o], img: o ? `${Q_IMG}ava_${a.c}_${o}.webp` : `tai-nguyen/nhan-vat/kids_${a.c}_a.webp` })),
    b: Object.keys(AVA_BG).map(b => ({ k: 'b', id: b, n: AVA_BG[b].n, bgimg: AVA_BG[b].img })), f: Object.keys(AVA_FR).map(f => ({ k: 'f', id: f, n: AVA_FR[f].n, fr: f })) };
  const cur = it => (it.k === 'c' && s.ava.c === it.id) || (it.k === 'o' && s.ava.c + '|' + s.ava.o === it.id) || (it.k === 'b' && s.ava.bg === it.id) || (it.k === 'f' && s.ava.fr === it.id);
  const grid = items[qTab].map(it => { const own = avaOwned(it.k, it.id), pr = avaPrice(it.k, it.id), pv = qPrev && qPrev.k === it.k && qPrev.id === it.id;
    const pc = it.img ? `<img src="${it.img}" alt="">` : (it.bgimg ? `<span class="q-bgthumb" style="background-image:url('${it.bgimg}')"></span>` : `<span class="ava-mini big fr-${it.fr}"></span>`);
    return `<button class="q-card ${cur(it) ? 'on' : ''} ${pv ? 'pv' : ''}" data-k="${it.k}" data-id="${it.id}" type="button">${pc}<b>${esc(it.n)}</b>
      <span class="q-price ${own ? 'own' : ''}">${cur(it) ? 'Đang dùng' : (own ? (pr ? 'Đã có' : 'Miễn phí') : pr + ' ⭐')}</span></button>`; }).join('');
  let act = '';
  if (qPrev) { const own = avaOwned(qPrev.k, qPrev.id), pr = avaPrice(qPrev.k, qPrev.id);
    act = `<div class="q-acts"><button class="q-act" id="qAvaOk" type="button">${own ? '✅<b>Dùng</b><span>đã có</span>' : `🛍️<b>Đổi và dùng</b><span>${pr} ⭐</span>`}</button>
      <button class="q-act ghost" id="qAvaNo" type="button">↩️<b>Thôi</b><span>bỏ thử</span></button></div>`; }
  qFrame('🧒 Avatar của con', `<div class="q-stage ava fr-${a.fr}" style="background-image:url('${avaBg(a)}')"><img class="q-crit ava" src="${avaSrc(a)}" alt="">${qPrev ? '<div class="q-plate"><b>Đang thử</b><span>Con thích không?</span></div>' : ''}${act}</div>
    <div class="q-side"><div class="q-tabs">${[['c', 'Nhân vật'], ['o', 'Trang phục'], ['b', 'Nền'], ['f', 'Khung']].map(([k, n]) => `<button class="${qTab === k ? 'on' : ''}" data-t="${k}" type="button">${n}</button>`).join('')}</div>
      <div class="q-cards ${qTab}">${grid}</div></div>`, 'qava');
  app.querySelectorAll('.q-tabs button').forEach(b => b.onclick = () => { qTab = b.dataset.t; sfx.pop(); viewAvatar(); });
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => { const k = b.dataset.k, id = b.dataset.id; sfx.pop();
    if (avaOwned(k, id) && !qPrev) { applyAva(k, id); return viewAvatar(); } qPrev = { k, id }; viewAvatar(); });
  const ok = document.getElementById('qAvaOk');
  if (ok) ok.onclick = () => { const { k, id } = qPrev; if (!avaOwned(k, id)) { if (!qSpend(avaPrice(k, id))) return; s.own[k + ':' + id] = true; confetti(14); } applyAva(k, id); qPrev = null; viewAvatar(); };
  const no = document.getElementById('qAvaNo'); if (no) no.onclick = () => { qPrev = null; sfx.pop(); viewAvatar(); };
  qSay('ava', 'Con chọn nhân vật, trang phục, nền và khung cho ảnh đại diện của con nhé.');
}

/* ---------- quà ở lớp: xong mỗi unit được đổi 1 món, cô trao ở buổi học ---------- */
function giftQuota() { return UNITS.filter(unitDone).length * Q_RULE.giftPerUnit; }
function giftUsed() { return shop().orders.length; }
function viewGifts() {
  const quota = giftQuota(), used = giftUsed(), w = qWallet(), open = used < quota;
  const cards = GIFTS.map(g => `<button class="q-card gift ${w >= g.p && open ? 'can' : ''}" data-id="${g.id}" type="button"><img src="${Q_IMG}gift_${g.id}.webp" alt=""><b>${g.n}</b><small>Giá tham khảo ${g.vnd}</small><span class="q-price">${g.p} ⭐</span></button>`).join('');
  qFrame('🎁 Quà ở lớp', `<div class="q-gifts"><div class="q-cond">
      <span class="${quota ? 'ok' : ''}">${quota ? '✅' : '🔒'} Học xong ${UNITS.filter(unitDone).length} unit · mỗi unit đổi ${Q_RULE.giftPerUnit} món</span>
      <span class="${open ? 'ok' : ''}">🎁 Đã đổi ${used}/${quota} món</span>
      <span>👨‍👩‍👧 Ba mẹ xác nhận · cô duyệt trên bảng của cô và trao quà ở lớp</span></div>
    <div class="q-cards gifts">${cards}</div></div>`, 'qgift');
  app.querySelectorAll('.q-card').forEach(b => b.onclick = () => { const g = GIFTS.find(x => x.id === b.dataset.id); sfx.pop();
    if (!quota) { sfx.no(); return hdSay('Con học xong một unit thì đổi được quà ở lớp nhé!'); }
    if (used >= quota) { sfx.no(); return toast('Con đã đổi đủ quà của unit này. Học xong unit sau con đổi tiếp nhé!'); }
    if (qWallet() < g.p) return qNoStars(g.p);
    if (!kidId()) return toast('Ba mẹ mở đường link cô gửi để nối web với lớp, rồi đổi quà nhé.');
    parentGate(g.n, `${g.p} ⭐ · giá tham khảo ${g.vnd}. Mẫu thật có thể khác hình minh hoạ.`, () => qOrder(g)); });
  qSay('gift', 'Quà thật cần ba mẹ xác nhận. Con gọi ba mẹ cùng chọn nhé!');
}
function qOrder(g) { const s = shop(); if (!qSpend(g.p)) return;
  const o = { code: qCode(), id: g.id, n: g.n, p: g.p, at: Date.now(), st: 'cho' }; s.orders.unshift(o); save();
  api({ action: 'redeem', id: kidId(), code: o.code, qua: g.id, ten_qua: `${g.n} (${g.vnd})`, sao: g.p });
  sfx.win(); confetti(24); route();
  const ov = document.createElement('div'); ov.className = 'overlay pp';
  ov.innerHTML = `<div class="modal pp-box q-done" role="dialog"><button class="pp-x" aria-label="Đóng">✕</button><img src="${Q_IMG}gift_${g.id}.webp" alt="">
    <h3>Đã gửi cô Lan</h3><p><b>${esc(g.n)}</b> · ${g.p} ⭐ · phiếu ${o.code}</p><p>Cô xem trên bảng của cô rồi trao quà cho con ở buổi học trên lớp. Nếu cô chưa duyệt, sao được hoàn đủ vào ví.</p>
    <div class="row"><a class="btn y" href="#/qua/phieu">🧾 Phiếu của con</a></div></div>`;
  document.body.appendChild(ov); const close = () => ov.remove(); ov.querySelector('.pp-x').onclick = close; ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('a')) close(); }); }

/* ---------- phiếu & cách kiếm sao ---------- */
function viewOrders() {
  const s = shop();
  coSync(true);
  const aw = coAwards().slice().sort((a, b) => b.at - a.at);
  const rows = s.orders.length ? s.orders.map((o, i) => `<li class="q-ord st-${o.st}"><img src="${Q_IMG}gift_${o.id}.webp" alt=""><span><b>${esc(o.n)}</b><small>${o.code} · ${new Date(o.at).toLocaleDateString('vi-VN')} · ${o.p} ⭐</small></span>
      <em>${Q_ST[o.st] || o.st}</em></li>`).join('') : '<li class="q-ord none">Con chưa có phiếu nào. Quà ở lớp sẽ hiện ở đây.</li>';
  qFrame('🧾 Phiếu & cách kiếm sao', `<div class="q-ords"><h4>Sao cô thưởng ở lớp <small>⭐ ${coSum()}</small></h4><ul>${aw.length ? aw.map(a => `<li class="q-ord"><img src="tai-nguyen/nhan-vat/huou_huou2_a.webp" alt=""><span><b>+${a.n} ⭐ · ${esc(a.why || 'Cô thưởng')}</b><small>${new Date(a.at).toLocaleDateString('vi-VN')}</small></span></li>`).join('') : '<li class="q-ord none">Sao cô thưởng trên lớp sẽ hiện ở đây.</li>'}</ul>
      <h4>Phiếu quà của con</h4><ul>${rows}</ul></div>
    <div class="q-rules"><h4>Sao đến từ đâu?</h4><ol>
      <li><b>Mỗi bước học xong</b>: 1 sao cho mỗi thẻ, câu hỏi hay lượt nói con làm xong (đúng hay chưa đúng đều được).</li>
      <li><b>Học xong một ngày web</b>: +${PTS.dayDone} ⭐.</li>
      <li><b>Ôn nhanh trong Hộp ôn</b>: +${PTS.review} ⭐ mỗi lượt, tối đa ${PTS.reviewMaxDay} lượt một ngày.</li>
      <li><b>Cô thưởng ở lớp</b>: cô thưởng trên bảng của cô, sao tự vào ví của con.</li>
      <li><b>Đổi quà không làm mất sao đã kiếm.</b> Chỉ sao trong ví bị trừ. Quà ảo đổi ngay, không hoàn lại.</li>
      <li><b>Quà ở lớp</b> 120–350 ⭐: học xong mỗi unit được đổi ${Q_RULE.giftPerUnit} món; ba mẹ xác nhận, cô duyệt và trao ở lớp.</li></ol></div>`, 'qord');
}

/* ---------- nhật ký học, huy hiệu ---------- */
function jGet() { const j = (P._j && typeof P._j === 'object') ? P._j : (P._j = {}); j.days = j.days || {}; j.rec = +j.rec || 0; j.on = +j.on || 0; j.lop = j.lop || {}; j.badges = j.badges || {}; j.gifts = j.gifts || {}; return j; }
function jMark() { const j = jGet(); j.days[today()] = 1; }
function jRec() { const j = jGet(); j.rec++; save(); }
function jMetrics() { const j = jGet(); return { les: daysDone(), units: UNITS.filter(unitDone).length, days: Object.keys(j.days).length, rec: j.rec, on: j.on, nho: onRemembered(), co: coAwards().length, pts: qEarned() }; }
const BADGES = [
  { id: 'dau', n: 'Bước chân đầu tiên', d: 'Học xong ngày web đầu tiên', img: Q_IMG + 'pet_cun_1.webp', ok: m => m.les >= 1 },
  { id: 'u1', n: 'Xong Unit 1', d: 'Học xong 4 ngày web của Unit 1', img: 'tai-nguyen/trang/ls_class.webp', ok: m => m.units >= 1, scene: true },
  { id: 'co1', n: 'Cô khen con', d: 'Được cô thưởng sao ở lớp', img: 'tai-nguyen/trang/ls_school.webp', ok: m => m.co >= 1, scene: true },
  { id: 'n3', n: '3 ngày chăm chỉ', d: 'Học vào 3 ngày khác nhau', img: Q_IMG + 'mon_la_1.webp', ok: m => m.days >= 3 },
  { id: 'n7', n: '7 ngày chăm chỉ', d: 'Học vào 7 ngày khác nhau', img: Q_IMG + 'mon_nuoc_2.webp', ok: m => m.days >= 7 },
  { id: 'on5', n: 'Bạn của Hộp ôn', d: 'Ôn nhanh 5 lượt', img: 'tai-nguyen/trang/ls_album.webp', ok: m => m.on >= 5, scene: true },
  { id: 'nho10', n: 'Nhớ chắc 10 từ', d: '10 từ lên bậc 🌳 trong Hộp ôn', img: Q_IMG + 'mon_la_2.webp', ok: m => m.nho >= 10 },
  { id: 'noi10', n: 'Giọng nói tự tin', d: 'Nói thành tiếng 10 lần', img: 'tai-nguyen/trang/cx_o_speak.webp', ok: m => m.rec >= 10, scene: true },
  { id: 'noi50', n: 'Nhà hùng biện nhí', d: 'Nói thành tiếng 50 lần', img: 'tai-nguyen/trang/ls_o_noi_theo.webp', ok: m => m.rec >= 50, scene: true },
  { id: 'dich', n: 'Về đích Seedling', d: 'Học xong cả 99 ngày web', img: Q_IMG + 'hocbong.webp', ok: m => m.les >= 99 }];
function badgeHTML(b, on, isNew) { return `<div class="hj-badge ${on ? 'on' : ''} ${b.scene ? 'scene' : ''}" title="${esc(b.d)}"><span class="hj-medal"><i style="background-image:url('${b.img}')"></i>${isNew ? '<em>Mới!</em>' : ''}</span>
  <b>${esc(b.n)}</b><small>${on ? 'Đã nhận' : esc(b.d)}</small></div>`; }
function badgesNew() { const j = jGet(), m = jMetrics(), out = []; BADGES.forEach(b => { if (b.ok(m) && !j.badges[b.id]) { j.badges[b.id] = Date.now(); out.push(b); } }); return out; }

/* ---------- quà bất ngờ: không báo trước, sau một số ngày học ---------- */
const SURPRISE_AT = [2, 4, 9, 15, 22, 30, 40, 52, 66, 80, 99];
function surprisePick() { const s = shop(), a = s.ava, sp = Object.keys(MON_SP).find(x => !s.mons.some(m => m.sp === x));
  const pool = [{ k: 'b', id: 'vuon', n: 'Nền ảnh "Vườn thú cưng"', img: Q_IMG + 'bg_vuon.webp', bg: true },
    sp ? { k: 'egg', id: sp, n: 'Trứng quái vật ' + MON_SP[sp].n, img: Q_IMG + 'mon_' + sp + '_0.webp' } : null,
    { k: 'f', id: 'vang', n: 'Khung avatar Vàng', img: avaSrc(), fr: 'vang' }, { k: 'o', id: a.c + '|tham_hiem', n: 'Bộ đồ Nhà thám hiểm', img: `${Q_IMG}ava_${a.c}_tham_hiem.webp` },
    { k: 'b', id: 'phong', n: 'Nền ảnh "Phòng quà"', img: Q_IMG + 'bg_phong.webp', bg: true }, { k: 'f', id: 'cauvong', n: 'Khung avatar Cầu vồng', img: avaSrc(), fr: 'cauvong' }].filter(Boolean);
  return pool.find(x => x.k === 'egg' || !s.own[x.k + ':' + x.id]) || { k: 'star', id: '15', n: '15 sao thưởng thêm vào ví', img: Q_IMG + 'gift_sticker.webp' }; }
function surpriseGive(it) { const s = shop(); if (it.k === 'egg') s.mons.push({ sp: it.id, base: daysDone(), c: 0, d: '', n: 0, gift: true }); else if (it.k === 'star') s.spent -= 15; else s.own[it.k + ':' + it.id] = true; }

/* gọi một lần khi con vừa học xong một ngày web: cộng sao, quà bất ngờ, huy hiệu, nhiệm vụ ba mẹ */
function rewardDay(n) {
  const out = { html: '', lines: [] }; jMark(); addStars(PTS.dayDone);
  const j = jGet(), m = jMetrics(), parts = [];
  if (SURPRISE_AT.includes(m.les) && !j.gifts[m.les]) { const it = surprisePick(); surpriseGive(it); j.gifts[m.les] = it.k + ':' + it.id;
    parts.push(`<div class="rw-gift"><img class="rw-huou" src="tai-nguyen/nhan-vat/huou_huou1_a.webp" alt=""><div class="rw-letter"><small>💌 Thư của cô Hươu</small><b>Cô thấy con đã học đều ${m.les} ngày. Cô tặng con một món quà bất ngờ!</b>
      <span class="rw-item">${it.fr ? `<span class="ava-mini big fr-${it.fr}" style="background-image:url('${avaBg()}')"><img src="${it.img}" alt=""></span>` : `<img class="${it.bg ? 'bg' : ''}" src="${it.img}" alt="">`}<em>${esc(it.n)}</em></span>
      <a class="rw-go" href="#/qua/${it.k === 'egg' ? 'quai-vat' : (it.k === 'star' ? '' : 'avatar')}">Xem trong Phòng đổi quà →</a></div></div>`); out.lines.push(KHEN.surprise); }
  const nb = badgesNew();
  if (nb.length) { parts.push(`<div class="rw-badges"><small>🏅 Huy hiệu mới</small><div>${nb.map(b => badgeHTML(b, true, false)).join('')}</div><a class="rw-go" href="#/hanh-trinh">Xem hành trình của con →</a></div>`); out.lines.push(KHEN.badge); }
  const U = UNITS.find(u => u.days.includes(n)); if (U && unitDone(U)) parts.push(`<div class="rw-stage">🎉 Con đã học xong ${esc(U.n)}! Con được đổi 1 món quà ở lớp. <a href="#/qua/qua-lop">Mở Quà ở lớp →</a></div>`);
  save(); out.html = parts.join(''); return out;
}
/* ---------- trang "Hành trình của con" ---------- */
function viewJourney() {
  document.body.classList.add('hub'); setActive('hanh');
  const m = jMetrics(), j = jGet(), fresh = badgesNew(); if (fresh.length) save();
  const TOTAL = 99, stat = (ic, v, lb, sub) => `<div class="hj-stat"><span class="hj-ic">${ic}</span><b>${v}</b><span>${lb}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  app.innerHTML = `<div class="screen qscr hjscr"><div class="q-top"><a class="q-back" href="#/" aria-label="Về trang chủ">🧭</a><h2>Hành trình của con</h2></div>
    <div class="q-body"><div class="hj-left">
        <div class="hj-me"><span class="ava-mini big fr-${shop().ava.fr}" style="background-image:url('${avaBg()}')"><img src="${avaSrc()}" alt=""></span>
          <div><b>${esc(P.name || 'Bạn nhỏ Seedling')}</b><small>🌱 Seedling · lớp offline</small><div class="hj-road"><i style="width:${Math.round(m.les / TOTAL * 100)}%"></i><span>${m.les}/${TOTAL} ngày web</span></div></div></div>
        <div class="hj-stats">
          ${stat('📚', m.les, 'ngày web con đã học', m.les < TOTAL ? `còn ${TOTAL - m.les} ngày nữa là về đích` : 'Con đã về đích!')}
          ${stat('📅', m.days, 'ngày con đã học', `cô thưởng ${coSum()} ⭐ ở lớp`)}
          ${stat('🎤', m.rec, 'lần con nói thành tiếng', 'càng nói nhiều, càng nói hay')}
          ${stat('🗃️', m.on, 'lượt ôn nhanh', `${m.nho} từ nhớ chắc 🌳`)}
          ${stat('⭐', m.pts, 'sao con đã kiếm', '<a href="#/qua">Mở Phòng đổi quà →</a>')}
        </div><a class="btn g hj-go" href="#/ban-do">🗺️ Học tiếp trên bản đồ</a></div>
      <div class="q-side hj-side"><h4>Huy hiệu của con <small>${BADGES.filter(b => j.badges[b.id] || b.ok(m)).length}/${BADGES.length}</small></h4>
        <div class="hj-badges">${BADGES.map(b => badgeHTML(b, b.ok(m), fresh.includes(b))).join('')}</div></div></div></div>`;
  if (fresh.length) { sfx.win(); confetti(20); }
  hdSay(fresh.length ? [KHEN.badge, KHEN.journey] : [KHEN.journey]);
}

/* ---------- đồng bộ với Bảng của cô: sao cô thưởng, trạng thái phiếu quà, tiến độ ---------- */
let coT = 0, coBusy = false;
async function coSync(force) {
  const id = kidId(); if (!id || coBusy) return; if (!force && Date.now() - coT < (API_ON ? 20000 : 0)) return; coT = Date.now(); coBusy = true;
  try {
    const r = await api({ action: 'kid', id }); if (!r || !r.ok) return;
    P.co = P.co || { awards: [], seen: {} }; P.co.seen = P.co.seen || {};
    if (r.kid && r.kid.ten) P.name = r.kid.ten;
    P.co.awards = (r.awards || []).map(a => ({ id: a.id, n: +a.n || 0, why: a.why || '', at: +a.at || Date.parse(a.at) || Date.now() }));
    const fresh = P.co.awards.filter(a => !P.co.seen[a.id]); fresh.forEach(a => P.co.seen[a.id] = 1);
    const s = shop(); (r.orders || []).forEach(x => { const o = s.orders.find(o => o.code === x.code); if (!o || o.st === x.st || !Q_ST[x.st]) return;
      if (x.st === 'tu_choi' && !o.ref) { s.spent = Math.max(0, s.spent - o.p); o.ref = true; } o.st = x.st; o.note = x.note || ''; });
    save(); qSide(); const nm = document.getElementById('sdName'); if (nm && P.name) nm.textContent = P.name;
    api({ action: 'hello', id, ten: P.name || '', web: P.stars || 0, vi: qWallet(), ngay: daysDone(), cuoi: today() });
    if (fresh.length) coShow(fresh);
  } finally { coBusy = false; }
}
function coShow(list) {
  const tot = list.reduce((a, x) => a + x.n, 0), ov = document.createElement('div'); ov.className = 'ls-cele';
  ov.innerHTML = `<div class="ls-cele-box sx-cele" role="dialog"><img class="ls-cele-img sx-coimg" src="tai-nguyen/nhan-vat/huou_huou2_a.webp" alt=""><div class="ls-cele-stars">${SVG.star}${SVG.star}${SVG.star}</div>
    <h3>Cô Lan thưởng con ${tot} sao!</h3><ul class="sx-cols">${list.map(a => `<li><b>+${a.n} ⭐</b> ${esc(a.why || 'Cô thưởng con')}</li>`).join('')}</ul>
    <div class="row"><button class="ls-cele-go" type="button"><span aria-hidden="true">⭐</span><b>Cảm ơn cô!</b></button></div></div>`;
  document.body.appendChild(ov); ov.querySelector('button').onclick = () => { ov.remove(); route(); }; confetti(40); sfx.win(); bumpStars();
}
