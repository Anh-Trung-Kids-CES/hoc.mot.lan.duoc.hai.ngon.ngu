/* =====================================================================
   SEEDLING · TÍCH SAO, ĐỔI QUÀ, HÀNH TRÌNH – chép cách làm của web 21 ngày (qua.js, khen.js)
   và chỉnh cho lớp offline Seedling (48 buổi, 99 ngày web):
   - Sao chỉ đến từ việc học, cố định theo việc làm xong (không theo số câu đúng).
   - "Đã kiếm" không bao giờ bị trừ; đổi quà chỉ trừ "sao trong ví".
   - Quà ảo (thú cưng, quái vật, avatar) đổi ngay. Quà ở lớp: ba mẹ xác nhận ở Cổng ba mẹ,
     web tạo phiếu, con đưa phiếu cho cô ở buổi học trên lớp (chưa có máy chủ).
   - Hành trình của con: con so với chính con (ngày học, lần nói, lần ôn, huy hiệu).
   - Quà bất ngờ không báo trước, sau một số ngày học.
   PHÒNG ĐỔI QUÀ (26/11/2026): ví sao, thú cưng, quái vật, Rồng trùm, vườn, avatar, quà thật, học bổng nay nằm ở
   ../chung/qua/ (chép từ web cuộc thi, nạp trước tệp này: qua-noi.js, qua.js, qua-choi.js; qua-sau.js nạp cuối).
   Tệp này giữ phần riêng của web: cách tính sao (PTS), Hành trình, huy hiệu, quà bất ngờ, sao cô thưởng.
   ===================================================================== */
const PTS = { dayDone: 10, review: 5, reviewMaxDay: 3 };
const UNITS = (window.SD && SD.units_q) || [{ u: 1, n: 'Unit 1 · Greeting', days: [1, 2, 3, 8], img: 'tai-nguyen/trang/ls_class.webp' }];
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
function unitDone(U) { return U.days.every(d => P.days[d] && P.days[d].done); }

/* ---------- sao cô thưởng ở lớp ---------- */
function coAwards() { return ((P.co && P.co.awards) || []); }
function coSum() { return coAwards().reduce((a, x) => a + (+x.n || 0), 0); }
function updWallet() { const w = document.querySelector('.q-wallet'); if (w) w.outerHTML = qWalletHTML(); }

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
function surpriseGive(it) { const s = shop(); if (it.k === 'egg') s.mons.push({ sp: it.id, g: LOP, base: daysDone(), c: 0, d: '', n: 0, gift: true, v: 2 }); else if (it.k === 'star') s.spent -= 15; else s.own[it.k + ':' + it.id] = true; }

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
  const U = UNITS.find(u => u.days.includes(n)); if (U && unitDone(U)) parts.push(`<div class="rw-stage">🎉 Con đã học xong ${esc(U.n)}! Rồng trùm của Unit này đang chờ con. <a href="#/qua/quai-vat">Nuôi quái vật, đánh Rồng trùm →</a></div>`);
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
