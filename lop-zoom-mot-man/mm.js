/* Lớp Zoom MỘT MÀN – cô vừa dạy vừa điều khiển trên một màn hình duy nhất, chia sẻ màn hình này lên Zoom.
   Các con không cần máy thứ hai: con xem màn cô, trả lời bằng cách gõ số vào khung chat Zoom, giơ tay, phát biểu.
   Cô bấm thay các con ở cột "Các bé": ✋ giơ tay · ✅ trả lời đúng · 🎤 phát biểu, và số 1-2-3 con gõ trong chat.
   Dữ liệu nằm trên máy cô (localStorage), không dùng Firebase. Cuối buổi: vinh danh, gửi báo cáo + cộng sao về web học.
   Bản riêng, không ảnh hưởng lop-zoom/ (bản cũ có máy bé). Nội dung (tranh, giọng, câu hỏi) lấy từ bản sao lz-core.js / lz-canopy.js. */

/* các biến lz-boss.js cần (bản gốc dùng cho màn chiếu) */
const CHIEU = 'mot-man';
let muted = !!lsGet('mm-mute', false), room = {}, CODE = 'mm', lastStageKey = '';
let duckN = 0;
/* trong trận Rồng: nhạc nhỏ lại khi đọc đề, đọc xong nhạc to lại */
function play(list, v) {
  if (muted) return;
  const pr = SND.play(list, v);
  if (S && S.ph === 'boss' && pr && pr.then) { const my = ++duckN; BA.duck(true); pr.then(() => { if (my === duckN) BA.duck(false); }); }
  return pr;
}
function giveStar() { }
function render() { draw(); }
window.BOSS_SPQ = 14;
/* Bản một màn không phát giọng hướng dẫn tiếng Việt của cô Hươu: hướng dẫn chỉ hiện bằng chữ (cô đọc trên Zoom).
   Tiếng mẫu tiếng Anh, tiếng Trung của bài học vẫn phát. */
hd = function () { return ''; };   // cô bấm hộ: dự kiến mỗi bé một câu đúng trong khoảng 14 giây

const HUOU = TN + 'nhan-vat/huou_huou1_a.webp';
const MM_PH = [
  { id: 'cho', n: 'Chờ vào lớp', m: '', ic: '🚪' },
  { id: 'hat', n: 'Hát chào', m: '0–2', ic: '🎵' },
  { id: 'intro', n: 'Chào bạn mới', m: '2–5', ic: '🎡' },
  { id: 'noi', n: 'Nói theo cô', m: '5–9', ic: '🗣️' },
  { id: 'on', n: 'Ôn nhanh', m: '9–14', ic: '⚡' },
  { id: 'tone', n: 'Máy bay thanh điệu', m: '14–19', ic: '✈️' },
  { id: 'lop', n: 'Cô giáo nhỏ', m: '19–25', ic: '📣' },
  { id: 'boss', n: 'Đấu Rồng Lửa', m: '25–30', ic: '🐉' },
  { id: 'xep', n: 'Nghe truyện, ghép tranh', m: '30–36', ic: '📖' },
  { id: 'vinh', n: 'Vinh danh', m: '36–40', ic: '🏆' },
];
const NOPT = { on: 3, tone: 4, lop: 3, boss: 3, xep: 4 };   // số lựa chọn các con gõ trong chat
const KEY = 'mm-buoi-' + LZ_LOP;
let S = null, VKEY = '', AKEY = '', VIEW = null, spinLanded = 0, spinShown = 0, wheelAngle = 0, noiRun = 0, autoT = null, bossT = null;
const app = $('#app');

/* ======================= buổi học ======================= */
function blank() {
  return { id: 'mm' + Date.now().toString(36), lop: LZ_LOP, ngay: today(), made: Date.now(), kids: [], ph: 'cho', i: 0, step: 'ask', rp: 0, run: 0,
    spin: {}, li: 0, xr: 0, xj: -1, vi: 0, boss: { run: 0, dur: 180000 }, sc: {}, px: {}, rv: {}, adj: {}, note: {}, log: [],
    w: { tay: 1, dung: 1, noi: 1 }, auto: true, t0: 0, sent: 0 };
}
function save() {
  S.upd = Date.now(); lsSet(KEY, S); lsSet('mm-s-' + S.id, S);
  const ds = (lsGet('mm-ds', []) || []).filter(x => x.id !== S.id);
  ds.unshift({ id: S.id, lop: S.lop, ngay: S.ngay, n: S.kids.length }); lsSet('mm-ds', ds.slice(0, 12));
}
function go(patch) { Object.assign(S, patch); save(); draw(); }

/* ======================= các bé và thành tích ======================= */
function addKid(kid, parent) {
  kid = String(kid || '').trim(); parent = String(parent || '').trim();
  if (!kid || S.kids.some(k => normName(k.kid) === normName(kid) && normName(k.parent) === normName(parent))) return false;
  S.kids.push({ id: 'k' + rid(), kid, parent, ava: AVATARS[S.kids.length % AVATARS.length].id });
  return true;
}
function kidById(id) { return S.kids.find(k => k.id === id); }
function sc(id) { return S.sc[id] || (S.sc[id] = { tay: 0, dung: 0, noi: 0 }); }
/* câu trả lời đúng cô bấm theo chat: chỉ tính khi cô đã Hiện đáp án (không lộ ai đúng ai sai trước đó); trận Rồng tính ngay */
function autoCounts(id) {
  const o = { dung: 0, rong: 0, rongN: 0, on: [0, 0], onEN: [0, 0], onZH: [0, 0], doc: [0, 0], tone: [0, 0], lop: [0, 0], xep: [0, 0] };
  Object.entries(S.px).forEach(([q, m]) => {
    const a = m[id]; if (!a) return;
    const p = q.split('_')[0];
    if (p === 'boss') { o.rongN++; if (a.ok) o.rong++; return; }
    if (p === 'xep') { const x = o['x' + q.split('_')[1]] || (o['x' + q.split('_')[1]] = [0, 0]); x[1]++; if (a.ok) x[0]++; }
    if (!S.rv[q]) return;
    if (a.ok) o.dung++;
    if (o[p]) { o[p][1]++; if (a.ok) o[p][0]++; }
    if (p === 'on') { const L = quizLang(QUIZ[+q.split('_')[1]]); const b = L === 'en' ? o.onEN : L === 'zh' ? o.onZH : o.doc; b[1]++; if (a.ok) b[0]++; }
  });
  return o;
}
function totals(id) {
  const s = sc(id), a = autoCounts(id), w = S.w;
  const dung = s.dung + a.dung + a.rong;
  return { tay: s.tay, dung, chat: s.dung + a.dung, rong: a.rong, noi: s.noi, a, sao: Math.max(0, s.tay * w.tay + dung * w.dung + s.noi * w.noi + (+S.adj[id] || 0)) };
}
function bump(id, f, n) {
  const s = sc(id); n = n || 1;
  if (s[f] + n < 0) return;
  s[f] += n; S.log.push({ k: 'sc', id, f, n }); S.log = S.log.slice(-300); save();
  SND.beep(n > 0 ? 'ok' : 'tap'); draw();
  if (n > 0) floatOn(id, '+' + (S.w[f] * n) + '⭐');
}
function undo() {
  const x = S.log.pop(); if (!x) return toast('Chưa có gì để hoàn tác.');
  if (x.k === 'sc') sc(x.id)[x.f] -= x.n;
  if (x.k === 'px') { const m = S.px[x.q] || (S.px[x.q] = {}); if (x.prev) m[x.id] = x.prev; else delete m[x.id]; }
  save(); draw(); const k = kidById(x.id); toast('Đã hoàn tác ' + (k ? 'cho ' + k.kid : ''));
}

/* ======================= câu hỏi hiện tại (con gõ số trong chat) ======================= */
function lopTurnsNow() { return lopTurns(S.kids); }
function xepOrder(r) { let o = [0, 1, 2, 3], s = 7 + r * 13 + (S.run || 0); do { o = shuffleSeeded([0, 1, 2, 3], s++); } while (o.join() === '0,1,2,3'); return o; }
function curQ() {
  const p = S.ph, run = S.run || 0;
  if (p === 'on') { const q = QUIZ[S.i]; return q && { qid: `on_${S.i}_${run}`, ans: quizAns(q) + 1, n: 3 }; }
  if (p === 'tone') { const x = TONES[S.i]; return x && { qid: `tone_${S.i}_${run}`, ans: x.t, n: 4 }; }
  if (p === 'xep') { const j = S.xj == null ? -1 : S.xj; if (!XEP[S.xr || 0] || j < 0 || j > 3) return null; return { qid: `xep_${S.xr || 0}_${j}_${run}`, ans: xepOrder(S.xr || 0).indexOf(j) + 1, n: 4 }; }
  if (p === 'boss') { const b = S.boss; if (!b.t0 || !b.q || bossDoneNow()) return null; return { qid: `boss_${b.run}_${b.qn}`, ans: b.q.ans + 1, n: 3, now: true }; }
  return null;
}
function press(id, c) {
  const q = curQ(); if (!q) return;
  const m = S.px[q.qid] || (S.px[q.qid] = {}), prev = m[id] || null;
  if (prev && prev.c === c) delete m[id]; else m[id] = { c, ok: c === q.ans, at: Date.now() };
  S.log.push({ k: 'px', q: q.qid, id, prev }); S.log = S.log.slice(-300); save();
  SND.beep('pop');
  if (q.now && m[id] && m[id].ok && !(prev && prev.ok)) bossHit(id);
  if (q.now && m[id] && !m[id].ok) { SND.beep('no'); setTimeout(() => floatOn(id, '✗', 1), 30); }
  draw();
  /* cô tích đủ đáp án của các bé: tự hiện đáp án đúng và cộng sao (rồi tự sang câu nếu đang bật) */
  if (!q.now && S.step === 'ask' && S.autoShow !== false && S.kids.length && S.kids.every(k => (S.px[q.qid] || {})[k.id])) { clearTimeout(autoT); const qid = q.qid; autoT = setTimeout(() => { const c2 = curQ(); if (c2 && c2.qid === qid && S.step === 'ask') reveal(); }, 800); }
  if (q.now && S.auto && S.kids.every(k => (S.px[q.qid] || {})[k.id])) { clearTimeout(autoT); const qid = q.qid; autoT = setTimeout(() => { const c2 = curQ(); if (c2 && c2.qid === qid) bossNext(); }, 1100); }
}
function reveal() {
  const q = curQ(); if (!q || S.step === 'rv') return;
  S.rv[q.qid] = 1; S.step = 'rv'; save(); draw();
  const good = Object.entries(S.px[q.qid] || {}).filter(([, a]) => a.ok).map(([id]) => id);
  good.forEach((id, j) => setTimeout(() => {
    floatOn(id, '+' + S.w.dung + '⭐');
    const card = $('#mk-' + id); if (!card) return;
    [card.querySelector('[data-sc$="|dung"]'), card.querySelector('.mk-star')].forEach(el => { if (!el) return; el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); });
  }, 250 + j * 160));
  const bad = Object.entries(S.px[q.qid] || {}).filter(([, a]) => !a.ok).map(([id]) => id);
  bad.forEach((id, j) => setTimeout(() => floatOn(id, '✗', 1), 250 + (good.length + j) * 160));
  if (good.length) SND.beep('win');
  if (bad.length) setTimeout(() => SND.beep('no'), good.length ? 650 : 150);
  autoRvStart();
}
/* Hiện đáp án xong: tự sang câu sau vài giây để cô săn đáp án câu mới trong chat (tắt được, không tự sang phần khác) */
const AUTO_RV_S = { on: 4, tone: 6, xep: 5 };   // Ghép tranh: tự sang câu, câu 4 (đọc lại cả đoạn) thì cô tự bấm
let autoRvT = null, autoRvLeft = 0, autoRvKey = '';
function autoRvLast() {
  if (S.ph === 'on') return S.i + 1 >= QUIZ.length;
  if (S.ph === 'tone') return S.i + 1 >= TONES.length;
  if (S.ph === 'xep') return (S.xj == null ? -1 : S.xj) >= 3;
  return true;
}
function autoRvStop() { clearInterval(autoRvT); autoRvT = null; autoRvKey = ''; }
function autoRvStart() {
  autoRvStop();
  if (S.autoRv === false || !AUTO_RV_S[S.ph] || autoRvLast()) return;
  autoRvLeft = AUTO_RV_S[S.ph]; autoRvKey = VKEY; autoRvShow();
  autoRvT = setInterval(() => {
    if (!S || VKEY !== autoRvKey || S.step !== 'rv') return autoRvStop();
    if (--autoRvLeft <= 0) { autoRvStop(); step(1); } else autoRvShow();
  }, 1000);
}
function autoRvShow() { const b = $('#mmCtl [data-act="next"]'); if (b && !b.querySelector('.cd')) b.insertAdjacentHTML('beforeend', ' <span class="cd"></span>'); const c = b && b.querySelector('.cd'); if (c) c.textContent = '(' + autoRvLeft + ')'; }
const autoRvChk = () => `<label class="mm-chk" title="Cô tích đủ đáp án của các bé thì tự hiện đáp án đúng và cộng sao"><input type="checkbox" data-act="autoShow" ${S.autoShow !== false ? 'checked' : ''}> Tích đủ thì tự hiện đáp án</label><label class="mm-chk" title="Hiện đáp án xong thì vài giây sau tự sang câu tiếp"><input type="checkbox" data-act="autoRv" ${S.autoRv !== false ? 'checked' : ''}> Tự sang câu</label>`;

/* ======================= vẽ ======================= */
function draw() {
  if (!S) return home();
  if (!$('#mmStage')) shell();
  drawTop(); drawRail(); drawKids();
  const v = view();
  VIEW = v;
  if (v.key !== VKEY) { VKEY = lastStageKey = v.key; $('#mmStage').innerHTML = v.html; v.bind && v.bind(); }
  else v.update && v.update();
  $('#mmCtl').innerHTML = v.ctl || '';
  if (autoRvT) autoRvShow();
  $('#mmTip').innerHTML = v.tip ? '💡 ' + v.tip : '';
  if (v.audio && v.akey !== AKEY) { AKEY = v.akey; play(v.audio); }
  document.body.dataset.ph = S.ph;
  if (S.ph === 'boss' && !bossT) bossT = setInterval(bossTick, 300);
}
function shell() {
  app.innerHTML = `<div class="mm-top" id="mmTop"></div>
    <div class="mm-body"><nav class="mm-rail" id="mmRail"></nav>
      <section class="mm-main"><div class="mm-stage" id="mmStage"></div><div class="mm-tip" id="mmTip"></div><div class="mm-ctl" id="mmCtl"></div></section>
      <aside class="mm-kids" id="mmKids"></aside></div>`;
}
function drawTop() {
  const el = $('#mmTop'), t = S.t0 ? Math.max(0, Math.floor((Date.now() - S.t0) / 1000)) : 0;
  el.innerHTML = `<span class="lz-badge">🦌</span><b class="mm-title">Lớp Zoom cùng cô</b>
    <span class="pill">${esc(LZ_CFG.ten)} · ${esc(LZ_CFG.chude)}</span><span class="sp"></span>
    <span class="mm-clock" id="mmClock">${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}</span>
    <button class="pill" data-act="undo" title="Hoàn tác lần bấm vừa rồi (phím Z)">↩ Hoàn tác</button>
    <button class="pill" data-act="mute">${muted ? '🔇 Bật tiếng' : '🔊 Tiếng'}</button>
    <button class="pill" data-act="add">👥 Thêm bé</button>
    <button class="pill y" data-act="report">📊 Báo cáo</button>
    <button class="pill" data-act="set" title="Cài đặt">⚙</button>
    <button class="pill" data-act="full" title="Toàn màn hình">⛶</button>`;
}
setInterval(() => { const c = $('#mmClock'); if (c && S && S.t0) { const t = Math.floor((Date.now() - S.t0) / 1000); c.textContent = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); } }, 1000);
function drawRail() {
  $('#mmRail').innerHTML = MM_PH.map(p => `<button data-ph="${p.id}" class="${S.ph === p.id ? 'on' : ''}" title="${esc(p.n)}"><span class="ic">${p.ic}</span><span class="nm">${esc(p.n)}<small>${p.m ? 'phút ' + p.m : 'trước giờ'}</small></span></button>`).join('');
}
function drawKids() {
  const q = curQ(), box = $('#mmKids');
  const m = q ? (S.px[q.qid] || {}) : {}, rv = q && (q.now || S.step === 'rv');
  const head = `<div class="mk-head"><b>Các bé (${S.kids.length})</b>${q ? `<span class="mk-hint">${q.now ? 'Con gõ số trong chat, cô bấm ngay' : S.step === 'rv' ? 'Đã hiện đáp án' : 'Con gõ số vào chat Zoom'}</span>` : ''}<button class="mk-add" data-act="add" title="Thêm bé">＋</button></div>`;
  if (!S.kids.length) { box.innerHTML = head + `<div class="mk-empty"><p>Chưa có bé nào.</p><button class="btn" data-act="add">👥 Thêm bé</button></div>`; return; }
  box.innerHTML = head + `<div class="mk-list">${S.kids.map(k => {
    const t = totals(k.id), a = m[k.id];
    const tr = S.ph === 'tone' && S.step === 'rv' ? (((S.tr || {})[S.i] || {})[k.id]) : undefined;
    const nums = S.ph === 'tone' && S.step === 'rv' ? `<div class="mk-ans tr" title="Cô chấm thanh điệu của con">${[[2, 'Chuẩn'], [1, 'Gần'], [0, 'Luyện']].map(([v, n]) => `<button class="num${tr === v ? ' on' : ''}" data-tr="${k.id}|${v}">${n}</button>`).join('')}</div>`
      : q && q.skip !== k.id ? `<div class="mk-ans" title="Số con gõ trong chat">${Array.from({ length: q.n }, (_, j) => j + 1).map(c => `<button class="num${a && a.c === c ? ' on' : ''}${a && a.c === c && rv && a.ok ? ' ok' : ''}${a && a.c === c && rv && !a.ok ? ' no' : ''}" data-px="${k.id}|${c}">${a && a.c === c && rv && !a.ok ? '✗' : c}</button>`).join('')}</div>`
      : q && q.skip === k.id ? `<div class="mk-ans"><span class="mk-turn">📣 cô giáo nhỏ</span></div>` : '';
    return `<div class="mk${a && rv && a.ok ? ' win' : ''}${a && rv && !a.ok ? ' lose' : ''}" id="mk-${k.id}">
      <img src="${avaImg(k.ava)}" alt="" data-ava="${k.id}" title="Đổi bạn đồng hành">
      <div class="mk-nm"><b>${esc(k.kid)}</b><span class="mk-star">⭐ ${t.sao}</span></div>
      <div class="mk-row"><div class="mk-btn">
        <button data-sc="${k.id}|tay" title="Giơ tay">✋<b>${t.tay}</b></button>
        <button data-sc="${k.id}|dung" title="Trả lời đúng (gồm số cô bấm theo chat)">✅<b>${t.dung}</b></button>
        <button data-sc="${k.id}|noi" title="Phát biểu">🎤<b>${t.noi}</b></button>
      </div>${nums}</div></div>`;
  }).join('')}</div>`;
}
function floatOn(id, text, bad) {
  const card = $('#mk-' + id); if (!card) return;
  const f = document.createElement('div'); f.className = 'mk-float' + (bad ? ' bad' : ''); f.textContent = text; card.appendChild(f);
  card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
  setTimeout(() => f.remove(), 1300);
}
function toast(t) {
  let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = t; el.className = 'show'; clearTimeout(el._t); el._t = setTimeout(() => el.className = '', 2600);
}
function confetti() {
  const box = $('#confetti'), cols = ['#E3262E', '#FFC72C', '#3BB273', '#4AA3E8', '#F29B38'];
  box.innerHTML = Array.from({ length: 80 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${cols[i % 5]};animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.2}s"></i>`).join('');
  setTimeout(() => box.innerHTML = '', 7000);
}
const face = k => `<div class="face"><img src="${avaImg(k.ava)}" alt=""><span>${esc(k.kid)}</span></div>`;
const numPics = (srcs, ans, rv, cls) => `<div class="mm-pics ${cls || ''} n${srcs.length}">${srcs.map((s, j) => `<div class="mm-pick${rv && j + 1 === ans ? ' right' : ''}${rv && j + 1 !== ans ? ' dim' : ''}"><img src="${s}" alt=""><span class="no">${j + 1}</span></div>`).join('')}</div>`;
const flag = l => `<span class="flag ${l}">${{ en: 'English', zh: '中文', doc: 'Nhìn chữ' }[l]}</span>`;
const nav = (prev, next, nextLabel, extra) => `${prev ? `<button class="btn ghost" data-act="${prev}">◀ Trước</button>` : ''}${extra || ''}${next ? `<button class="btn" data-act="${next}">${nextLabel || 'Tiếp ▶'}</button>` : ''}`;

/* ======================= các phần của buổi học ======================= */
function view() {
  const f = { cho: vCho, hat: vHat, intro: vIntro, noi: vNoi, on: vOn, tone: vTone, lop: vLop, boss: vBoss2, xep: vXep, vinh: vVinh }[S.ph] || vCho;
  return f();
}
function phaseName(id) { return (MM_PH.find(p => p.id === id) || {}).n || ''; }
function nextPhase() { const i = MM_PH.findIndex(p => p.id === S.ph); return (MM_PH[i + 1] || {}).id; }
function goPhase(ph) {
  const p = { ph, step: 'ask', rp: 0 };
  if (!S.t0 && ph !== 'cho') p.t0 = Date.now();
  if (ph === 'on' || ph === 'tone' || ph === 'noi') p.i = 0;
  if (ph === 'lop') p.li = 0;
  if (ph === 'xep') { p.xr = 0; p.xj = -1; }
  if (ph === 'vinh') p.vi = 0;
  SND.stop(); BA.stop(); noiRun++;
  go(p);
}

/* --- Chờ vào lớp --- */
function vCho() {
  return {
    key: 'cho|' + S.kids.map(k => k.id + k.ava + k.kid).join(','), akey: 'cho',
    html: `<img class="mm-huou" src="${HUOU}" alt=""><h1 class="mm-h1">Chào các con! Cô là cô Hươu 🦌</h1>
      <p class="mm-sub">${esc(LZ_CFG.ten)} · ${esc(LZ_CFG.chude)}</p>
      <div class="mm-faces">${S.kids.map(face).join('') || '<p class="mm-sub">Cô đang mời các bạn vào lớp…</p>'}</div>
      <div class="mm-rules"><span>✋ Giơ tay</span><span>⌨️ Gõ số vào chat</span><span>🎤 Phát biểu</span><span>= ⭐ đổi quà trên web học</span></div>`,
    ctl: `<button class="btn ghost" data-act="add">👥 Thêm bé</button><button class="btn red" data-act="start">▶ Bắt đầu: Hát chào</button>`,
    tip: 'Cô chia sẻ <b>cả màn hình này</b> lên Zoom và tích <b>Chia sẻ âm thanh</b>. Dặn các con: muốn trả lời thì giơ tay; câu có tranh đánh số thì gõ số vào khung chat. Mỗi lần cô bấm ✋ ✅ 🎤 là con được thêm sao.'
  };
}

/* --- Hát chào mở đầu: video YouTube nhúng (không chép video lên web); cô bấm Phát, chia sẻ cả màn + âm thanh lên Zoom --- */
function vHat() {
  const on = !!S.songOn;
  return {
    key: 'hat|' + (on ? S.songN || 0 : 0) + '|' + (muted ? 1 : 0),
    html: on ? `<div class="song-box"><iframe src="${songSrc(true, muted)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="${esc(SONG.ten)}"></iframe></div>`
      : `<div class="qno">🎵 Hát chào</div><h1 class="mm-h1">${esc(SONG.ten)}</h1>${songLyrics(true)}<p class="ask-line">🙋 Cả lớp đứng dậy, sẵn sàng hát và làm động tác nhé!</p>`,
    ctl: (on ? `<button class="btn ghost" data-act="songStop">⏹ Dừng video</button><button class="btn y" data-act="songGo">🔁 Hát lại</button>` : `<button class="btn y" data-act="songGo">▶ Phát bài hát</button>`)
      + `<a class="btn ghost" href="https://www.youtube.com/watch?v=${SONG.id}" target="_blank" rel="noopener" style="text-decoration:none">YouTube ↗</a><button class="btn" data-act="next">Tiếp: ${phaseName('intro')} ▶</button>`,
    tip: on ? `Hát xong cô nói: <b>${esc(SONG.sauBai)}</b> · Video: ${esc(SONG.nguon)} (YouTube)`
      : `<b>Cô Hươu giới thiệu</b> (cô đọc): ${SONG.gioiThieu.map((x, j) => `<b>${j + 1}.</b> ${esc(x)}`).join(' ')}`
  };
}
/* --- Chào bạn mới: vòng quay chọn bạn --- */
function vIntro() {
  const sp = S.spin || {}, l = sp.l === 'zh' ? 'zh' : 'en', N = S.kids.length, I = (sp.q === 'dad' && INTRO.dad) || INTRO;
  const idx = Math.max(0, S.kids.findIndex(k => k.id === sp.seat));
  const target = sp.n ? -idx * 360 / Math.max(1, N) + 360 * (4 + sp.n) : 0;
  const landed = !sp.n || spinLanded === sp.n, kid = kidById(sp.seat);
  const ring = S.kids.map((k, j) => { const a = j * 2 * Math.PI / Math.max(1, N); return `<div class="seat" style="left:${50 + 36 * Math.sin(a)}%;top:${50 - 36 * Math.cos(a)}%"><img src="${avaImg(k.ava)}" alt=""><b>${esc(k.kid)}</b></div>`; }).join('');
  let under = '<p class="ask-line">Cô quay vòng chọn bạn nhé!</p>', audio = sp.n ? null : [hd('Cô quay vòng chọn bạn nhé!')], akey = sp.n ? 'intro-spin' + sp.n : 'intro0';
  if (sp.n && landed && kid) {
    under = `<div class="chosen-card"><img src="${avaImg(kid.ava)}" alt=""><b>${esc(kid.kid)}</b></div>
      <p class="ask-line">Cả lớp cùng hỏi bạn: <b class="${l}">${esc(I.ask[l].t)}</b></p>
      <p class="mm-sub">Bạn trả lời: <b class="${l}">${esc(I.model[l].t)}</b></p>`;
    audio = [hd('Cả lớp cùng hỏi bạn nhé!'), 200, I.ask[l].a]; akey = 'intro-land' + sp.n;
  }
  const spinBtns = INTRO.dad
    ? `<button class="btn" data-spin="en|mom">🎡 Hỏi mẹ · EN</button><button class="btn red" data-spin="zh|mom">🎡 Hỏi mẹ · 中文</button><button class="btn" data-spin="en|dad">🎡 Hỏi ba · EN</button><button class="btn red" data-spin="zh|dad">🎡 Hỏi ba · 中文</button>`
    : `<button class="btn" data-spin="en">🎡 Quay · English</button><button class="btn red" data-spin="zh">🎡 Quay · 中文</button>`;
  return {
    key: 'intro|' + S.kids.map(k => k.id).join(',') + '|' + (sp.n || 0) + '|' + (landed ? 1 : 0) + l + (sp.q || ''), akey, audio,
    html: `<div class="mm-row"><div class="wheel-box mm-wheel"><div class="pointer">🔻</div><div class="wheel" id="wh">${ring}</div><div class="hub">🎡</div></div>
      <div class="mm-col">${under}</div></div>`,
    ctl: spinBtns + (kid && landed ? `<button class="btn ghost" data-play="${I.model[l].a}">🔊 Câu mẫu</button>${chaoBtns(kid.id, l)}` : '') + `<button class="btn ghost" data-act="next">Tiếp: ${phaseName('noi')} ▶</button>`,
    tip: (INTRO.tip ? INTRO.tip + ' ' : '') + 'Bạn được chọn nói xong, cô bấm <b>🎤</b> (ở đây hoặc trên thẻ của bé). Bạn nào giơ tay xin trả lời thay thì bấm <b>✋</b>.',
    bind() {
      const wh = $('#wh'); if (!wh) return;
      if (sp.n && spinShown !== sp.n && spinLanded !== sp.n) {
        wh.style.transform = `rotate(${wheelAngle}deg)`; void wh.offsetWidth;
        wh.classList.add('spin'); wh.style.transform = `rotate(${target}deg)`; SND.beep('whoosh');
        const n = sp.n; setTimeout(() => { if ((S.spin || {}).n === n) { spinLanded = n; SND.beep('win'); draw(); } }, 3300);
      } else { wh.style.transform = `rotate(${target}deg)`; if (sp.n) spinLanded = sp.n; }
      spinShown = sp.n || 0; wheelAngle = target;
      $$('.seat', wh).forEach(x => x.style.transform = `rotate(${-target}deg)`);
    }
  };
}
function spin(l, q) {
  if (!S.kids.length) return toast('Cô thêm bé trước nhé.');
  const done = new Set(Object.values(S.spinDone || {}));
  let pool = S.kids.filter(k => !done.has(k.id)); if (!pool.length) { S.spinDone = {}; pool = S.kids; }
  const k = pool[Math.floor(Math.random() * pool.length)];
  const n = ((S.spin || {}).n || 0) + 1; S.spinDone = Object.assign({}, S.spinDone, { [n]: k.id });
  go({ spin: { seat: k.id, l, q: q || '', n } });
}

function chaoBtns(id, l) {
  const v = ((S.chao || {})[id] || {})[l];
  return `<button class="btn ${v === 2 ? 'y' : 'ghost'}" data-act="chao" data-id="${id}" data-l="${l}" data-v="2">🎤 Tự nói ${l === 'zh' ? '中文' : 'EN'} ${v === 2 ? '✓' : '+⭐'}</button><button class="btn ${v === 1 ? 'y' : 'ghost'}" data-act="chao" data-id="${id}" data-l="${l}" data-v="1">🎤 Nói cùng cô ${v === 1 ? '✓' : '+⭐'}</button>`;
}
/* --- Nói theo cô --- */
function vNoi() {
  const N = NOI.length, i = Math.min(N - 1, S.i || 0), it = NOI[i];
  const lines = ['en', 'zh'].map(l => `<div class="noi-l" data-l="${l}">${flag(l)}<b class="${l}">${esc(txt(it.k, l))}</b></div>`).join('');
  return {
    key: ['noi', i, S.rp || 0].join('|'),
    html: `<div class="qno">🗣️ Nói theo cô · ${i + 1}/${N} <span class="flag doc">${NOI_GRP[it.g]}</span></div>
      <p class="ask-line">👂 Các con nghe cô đọc rồi nói theo nhé!</p>
      <div class="mm-row"><img class="mm-big" src="${pic(it.k, 2)}" alt=""><div class="mm-col"><div class="noi-lines play" id="noiL">${lines}</div>
      <div class="noi-cue" id="noiCue"><span>🗣️ Cả lớp nói theo!</span><i id="noiBar"></i></div></div></div>
      <div class="dots">${NOI.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`,
    ctl: nav(i > 0 ? 'prev' : '', 'next', i + 1 < N ? 'Tiếp ▶' : `Tiếp: ${phaseName('on')} ▶`, `<button class="btn ghost" data-act="rp">🔁 Đọc lại</button><label class="mm-chk"><input type="checkbox" data-act="autoNoi" ${S.autoNoi ? 'checked' : ''}> Tự chạy</label>`),
    tip: 'Không chấm từng bé. Bạn nào nói to, rõ thì cô bấm <b>🎤</b> trên thẻ của bé để khen.',
    bind() { if (!muted) noiPlay(lastStageKey, ['en', 'zh'].map(l => [l, aud(it.k, l)])); }
  };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function noiPlay(key, list) {
  const my = ++noiRun, live = () => my === noiRun && lastStageKey === key;
  await sleep(350);
  for (const [l, src] of list) {
    if (!live()) return;
    $$('#noiL .noi-l').forEach(x => x.classList.toggle('on', x.dataset.l === l));
    const t0 = performance.now(); await SND.play([src]); const d = performance.now() - t0;
    if (!live()) return;
    const gap = noiGap(d), cue = $('#noiCue'), bar = $('#noiBar');
    SND.beep('tap');
    if (cue) { cue.classList.add('show'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = `width ${gap}ms linear`; bar.style.width = '0%'; }
    await sleep(gap);
    if (!live()) return;
    cue && cue.classList.remove('show');
  }
  $$('#noiL .noi-l').forEach(x => x.classList.add('on'));
  if (S.autoNoi && live() && S.ph === 'noi') { await sleep(600); if (live()) step(1); }
}

/* --- Ôn nhanh: nghe rồi gõ số tranh --- */
function vOn() {
  const i = Math.min(QUIZ.length - 1, S.i || 0), q = QUIZ[i], rv = S.step === 'rv', ans = quizAns(q) + 1, lang = quizLang(q), a = quizAudio(q);
  const prompt = q.l === 'doc' ? `<div class="chu ${/[a-z]/i.test(q.chu) ? 'latin' : 'zh'}">${esc(q.chu)}</div>`
    : `<button class="say ${q.l}" data-play="${a}"><span class="ic">🔊</span>${rv ? `<span class="${q.l}">${esc(txt(q.k, q.l))}</span>` : '<span>Nghe</span>'}</button>`;
  return {
    key: ['on', i, rv ? 1 : 0, S.run || 0].join('|'), akey: ['on', i, rv ? 1 : 0, S.rp || 0, S.run || 0].join('|'),
    audio: rv ? [a, 500, hd('Giỏi quá!')] : q.l === 'doc' ? [hd('Con nhìn lại chữ nhé.')] : [a, 700, a],
    html: `<div class="qno">⚡ Ôn nhanh · câu ${i + 1}/${QUIZ.length} ${flag(lang)}</div>
      <div class="mm-prompt">${prompt}${rv && q.l === 'doc' ? `<button class="say ${q.a}" data-play="${a}"><span class="ic">🔊</span></button>` : ''}</div>
      ${numPics(quizPics(q), ans, rv)}
      <p class="ask-line">${rv ? '🌟 Cả lớp cùng nói nào!' : '⌨️ Con gõ số tranh đúng vào khung chat nhé: 1, 2 hay 3?'}</p>`,
    ctl: qCtl(i, QUIZ.length, rv, 'tone'),
    tip: 'Các con gõ số vào chat, cô bấm số của từng bé ở cột phải (bấm lại để bỏ). Bấm <b>Hiện đáp án</b> (phím Space) rồi mới cộng sao cho bạn đúng. Phím → câu tiếp, R phát lại.'
  };
}
function qCtl(i, n, rv, nextPh) {
  return nav(i > 0 ? 'prev' : '', '', '', `<button class="btn ghost" data-act="rp">🔁 Phát lại</button>`)
    + (rv ? '' : `<button class="btn y" data-act="rv">👁 Hiện đáp án</button>`)
    + `<button class="btn" data-act="next">${i + 1 < n ? 'Câu tiếp ▶' : `Tiếp: ${phaseName(nextPh)} ▶`}</button>` + autoRvChk();
}

/* --- Máy bay thanh điệu --- */
function planeSVG(t, id, big) {
  const d = TONE_PATH[t];
  return `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="${d}" fill="none" stroke="${big ? '#3BB273' : '#4AA3E8'}" stroke-width="${big ? 3 : 2.4}" stroke-linecap="round" stroke-dasharray="${big ? '0' : '4 3'}"/>
    <g><path d="M-6,-1.6 L4,-1.6 L8,0 L4,1.6 L-6,1.6 Z M-2,-1.6 L-5,-7 L-2.6,-7 L2,-1.6 Z M-2,1.6 L-5,7 L-2.6,7 L2,1.6 Z M-6,-1.6 L-8,-4 L-6.5,-4 L-4.6,-1.6Z" fill="#E3262E" transform="scale(${big ? 1.2 : .9})"/>
    <animateMotion id="${id}" dur="${big ? '1.8s' : '2.4s'}" repeatCount="indefinite" rotate="auto" path="${d}"/></g></svg>`;
}
function vTone() {
  const i = Math.min(TONES.length - 1, S.i || 0), x = TONES[i], rv = S.step === 'rv', a = toneAudio(x);
  const opts = [1, 2, 3, 4].map(t => `<div class="path mm-path${x.o ? ' two' : ''}${rv && t === x.t ? ' right' : ''}${rv && t !== x.t ? ' dim' : ''}"><span class="no">${t}</span>${planeSVG(toneOpt(x, t), 'pl' + t)}<span>${TONE_NAME[toneOpt(x, t)]}</span></div>`).join('');
  return {
    key: ['tone', i, rv ? 1 : 0, S.run || 0].join('|'), akey: ['tone', i, rv ? 1 : 0, S.rp || 0, S.run || 0].join('|'),
    audio: rv ? [hd('Cả lớp đưa tay bay theo, nói theo nhé!'), 300].concat(a ? [a, 700, a, 700, a] : []) : (i === 0 && !S.rp ? [hd('Con nghe rồi chạm vào đường bay đúng nhé!'), 300] : []).concat(a ? [a, 800, a] : []),
    html: `<div class="qno">✈️ Máy bay thanh điệu · ${i + 1}/${TONES.length}</div>
      <div class="tone-head"><img src="${tonePic(x)}" alt=""><div class="chu zh">${x.c}</div><div><div class="py">${rv ? x.py : x.p0}</div>${a ? `<button class="say zh" data-play="${a}"><span class="ic">🔊</span>Nghe</button>` : ''}</div></div>
      ${rv ? `<div class="fly-big">${planeSVG(toneOpt(x, x.t), 'plBig', true)}</div><p class="ask-line">✋ Cả lớp đưa tay bay theo, nói theo nhé! <b class="zh">${x.py}</b></p>`
        : `<div class="paths mm-paths">${opts}</div><p class="ask-line">⌨️ Máy bay nào bay đúng? Con gõ số 1, 2, 3 hoặc 4 vào chat nhé!</p>`}`,
    ctl: qCtl(i, TONES.length, rv, 'lop'),
    tip: 'Sau khi hiện đáp án, cả lớp đưa tay bay theo đường bay và nói theo. Bạn nào nói đúng thanh thì cô bấm <b>🎤</b>.'
  };
}

/* --- Cô giáo nhỏ: mỗi bạn một lượt chọn một bức tranh, nói bằng tiếng Anh và tiếng Trung theo hướng dẫn của cô --- */
function lt(id) { S.lt = S.lt || {}; return S.lt[id] || (S.lt[id] = {}); }
function vLop() {
  const turns = lopTurnsNow(), n = turns.length;
  if (!n) return { key: 'lop0', html: `<h1 class="mm-h1">📣 Cô giáo nhỏ</h1><p class="mm-sub">Cô thêm bé trước nhé.</p>`, ctl: `<button class="btn" data-act="next">Tiếp ▶</button>` };
  const li = Math.min(n - 1, S.li || 0), t = turns[li], it = PAIR_POOL[t.k], kid = kidById(t.a), m = lt(kid.id), c = m.c, k = c != null ? it.o[c] : null;
  const pics = `<div class="mm-pics n3">${it.o.map((x, j) => `<button class="mm-pick lp${c === j ? ' right' : ''}${c != null && c !== j ? ' dim' : ''}" data-lp="${j}"><img src="${pic(x, 3)}" alt=""><span class="no">${j + 1}</span></button>`).join('')}</div>`;
  const say = l => `<div class="lp-say"><button class="say ${l}" data-play="${aud(k, l)}"><span class="ic">🔊</span><span class="${l}">${esc(txt(k, l))}</span></button>${m[l] ? '<span class="lp-ok">✓</span>' : ''}</div>`;
  return {
    key: ['lop', li, c == null ? '-' : c, m.en ? 1 : 0, m.zh ? 1 : 0].join('|'), akey: 'lop' + li,
    html: `<div class="qno">📣 Cô giáo nhỏ · lượt ${li + 1}/${n}</div>
      <div class="mm-row tight"><div class="chosen-card"><img src="${avaImg(kid.ava)}" alt=""><b>${esc(kid.kid)}</b></div>
        <p class="ask-line">${c == null ? `👆 ${esc(kid.kid)} chọn một bức tranh con thích nhé: 1, 2 hay 3?` : `🎤 ${esc(kid.kid)} nói bức tranh số ${c + 1} bằng tiếng Anh rồi tiếng Trung nhé!`}</p></div>
      ${pics}
      ${k ? `<div class="lp-says">${say('en')}${say('zh')}</div>` : ''}`,
    ctl: nav(li > 0 ? 'prev' : '', '', '')
      + (k ? `<button class="btn ${m.en ? 'y' : 'ghost'}" data-act="lpSay" data-l="en">🎤 Nói được tiếng Anh ${m.en ? '✓' : '+⭐'}</button><button class="btn ${m.zh ? 'y' : 'ghost'}" data-act="lpSay" data-l="zh">🎤 Nói được tiếng Trung ${m.zh ? '✓' : '+⭐'}</button><button class="btn ghost" data-act="lpRe">↺ Chọn lại tranh</button>` : '')
      + `<button class="btn" data-act="next">${li + 1 < n ? 'Lượt tiếp ▶' : `Tiếp: ${phaseName('boss')} ▶`}</button>`,
    tip: `Con nói số tranh (hoặc gõ vào chat), cô bấm vào bức tranh đó. Chữ tiếng Anh và tiếng Trung hiện dưới tranh; con nói, cô hướng dẫn nếu con cần (bấm 🔊 để nghe mẫu). Con nói được tiếng nào thì cô bấm nút tiếng đó, mỗi tiếng +${S.w.noi} ⭐ phát biểu (bấm lại để bỏ). Các bạn khác giơ tay nói theo thì cô bấm ✋ / 🎤 trên thẻ.`
  };
}
/* --- Đấu Rồng Lửa: cô hiện một câu cho cả lớp, các con gõ số trong chat, cô bấm cho từng bé, mỗi câu đúng +1 ⚡ --- */
function roomFromS() {
  const players = {}, marks = {};
  S.kids.forEach((k, i) => { players[k.id] = { kid: k.kid, ava: k.ava, ok: true, on: true, ord: i }; });
  const b = S.boss || {};
  Object.entries(S.px).forEach(([q, m]) => {
    const p = q.split('_'); if (p[0] !== 'boss' || +p[1] !== b.run) return;
    Object.entries(m).forEach(([id, a]) => { if (a.ok) { const x = marks[id] || (marks[id] = { bx: {} }); x.bx[p[1] + '_' + p[2]] = a.at; } });
  });
  return { state: { ph: 'boss', boss: b }, players, marks, answers: {} };
}
function bossDoneNow() { const b = S.boss || {}; return !!b.t0 && (!!b.end || Date.now() - b.t0 >= (b.dur || 180000)); }
function vBoss2() {
  room = roomFromS();
  const info = bossInfo(room), b = S.boss, state = info.pre ? 'pre' : info.done ? 'done' : 'run', q = b.q;
  const qhtml = state === 'run' && q ? `<div class="mm-bq">${q.l === 'doc' ? `<div class="chu zh b-chu">${esc(q.chu)}</div>` : `<button class="say ${q.l}" data-play="${aud(q.k, q.l)}"><span class="ic">🔊</span>${flag(q.l)}</button>`}
      ${numPics(q.o.map(k => pic(k, 2)), 0, false, 'sm')}<span class="mm-qn">Câu ${b.qn + 1}</span></div>` : '';
  const dur = Math.round((b.dur || 180000) / 60000);
  return {
    key: ['boss', b.run, state, b.qn || 0].join('|'), akey: ['boss', b.run, state, b.qn || 0, S.rp || 0].join('|'),
    audio: state === 'run' && q && q.l !== 'doc' ? [aud(q.k, q.l)] : null,
    html: `<div class="mm-boss">${bossScene(info, true)}${qhtml}</div>`,
    ctl: state === 'pre' ? `<label class="mm-chk">Thời gian <select data-act="dur">${[2, 3, 4, 5].map(m => `<option value="${m}" ${m === dur ? 'selected' : ''}>${m} phút</option>`).join('')}</select></label><button class="btn red" data-act="bossGo">⚔️ Bắt đầu trận</button><button class="btn ghost" data-act="next">Bỏ qua ▶</button>`
      : state === 'run' ? `<button class="btn ghost" data-act="rp">🔁 Nghe lại</button><button class="btn" data-act="bossNext">Câu tiếp ▶</button><label class="mm-chk"><input type="checkbox" data-act="auto" ${S.auto ? 'checked' : ''}> Tự sang câu khi đủ các bé</label><button class="btn ghost" data-act="bossEnd">🏁 Kết thúc</button>`
      : `<button class="btn ghost" data-act="bossGo">⚔️ Đấu lại</button><button class="btn" data-act="next">Tiếp: ${phaseName('xep')} ▶</button>`,
    tip: 'Mỗi câu: các con gõ số vào chat, cô bấm số của từng bé ở cột phải. Câu đúng cộng ⚡ cho anh hùng ngay và tính là một lần ✅ trả lời đúng. Bé chưa trả lời kịp cũng không sao, cô sang câu tiếp.',
    bind() { bossStage = info.done ? 0 : (info.prog || 0) >= 0.8 ? 1 : (info.prog || 0) >= 0.5 ? 2 : 3; bossHitsAtFight = info.H || 0; bossFightT = Date.now(); bossFaces(info); if (state === 'pre') BA.stop(); },
  };
}
let bossSurge = false;
function bossTick() {
  if (!S || S.ph !== 'boss') { clearInterval(bossT); bossT = null; BA.stop(); return; }
  room = roomFromS();
  const info = bossInfo(room), b = S.boss, state = info.pre ? 'pre' : info.done ? 'done' : 'run';
  if (state === 'done' && b.t0 && !b.won) { b.won = 1; save(); BA.mood('win'); if (!muted) { BA.start(); BA.fanfare(); setTimeout(() => play([hd('Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng!')]), 1200); setTimeout(() => BA.stop(), 6000); } confetti(); }
  if (!$('#bPos')) return;
  if (VKEY.split('|')[2] !== state) { const keep = state === 'done'; VKEY = ''; draw(); if (keep && !muted) { BA.start(); setTimeout(() => BA.stop(), 6000); } return; }
  $('#bPos').style.left = info.pos + '%'; $('#bH').textContent = info.H || 0;
  $('#bT').textContent = info.pre ? '' : Math.ceil(info.left / 1000) + 's'; $('#bMsg').textContent = bossMsg(info);
  const sc0 = $('#bScene'); sc0 && sc0.classList.toggle('surge', info.surge);
  bossFaces(info);
  if (state !== 'run') return;
  if (!muted) { if (info.surge && !bossSurge) { bossSurge = true; BA.mood('tense'); BA.roar(); setTimeout(() => play([hd('Rồng Lửa nổi giận rồi! Cả lớp trả lời nhanh nào!')]), 600); } if (!info.surge && bossSurge) { bossSurge = false; BA.mood('calm'); } }
  if (Date.now() - bossFightT > (info.surge ? 900 : 1500)) { bossFightT = Date.now(); bossFight(info, !muted); }
}
function bossGo() {
  const b = S.boss; b.run = (b.run || 0) + 1; b.t0 = Date.now(); b.end = 0; b.qn = 0; b.q = bossPick(null, []); b.won = 0; b.miss = [];
  if (!S.t0) S.t0 = Date.now();
  bossSurge = false; save(); draw();
  if (!muted) { BA.mood('calm'); BA.start(); setTimeout(() => { if (S.boss.q && S.boss.q.l !== 'doc') play([hd('Cả lớp cùng tiếp sức cho anh hùng Bông nhé!'), 300, aud(S.boss.q.k, S.boss.q.l)]); }, 50); }
}
function bossNext() {
  const b = S.boss; if (!b.t0 || bossDoneNow()) return;
  const m = S.px[`boss_${b.run}_${b.qn}`] || {};
  if (S.kids.some(k => m[k.id] && !m[k.id].ok)) (b.miss = b.miss || []).push({ k: b.q.k, l: b.q.l });
  b.qn++; b.q = bossPick(b.q, b.miss || []); save(); draw();
}
function bossHit(id) {
  BA.power(); const k = kidById(id), feed = $('#bFeed'), bub = $('#bBub');
  if (k && bub) { const e = document.createElement('div'); e.className = 'b-fly'; e.innerHTML = `<img src="${avaImg(k.ava)}" alt=""><b>${esc(k.kid)} ⚡</b>`; e.style.left = (5 + Math.random() * 50) + '%'; bub.appendChild(e); setTimeout(() => e.remove(), 1400); }
  if (k && feed) { const r = document.createElement('div'); r.className = 'b-f'; r.innerHTML = `<img src="${avaImg(k.ava)}" alt=""><b>${esc(k.kid)}</b><span>+1 ⚡</span>`; feed.prepend(r); while (feed.children.length > 4) feed.lastChild.remove(); }
  flash($('#bHero'), 'charge', 700);
  setTimeout(() => floatOn(id, '+1⚡'), 50);
}
/* --- Nghe truyện, ghép tranh: (1) nghe cả truyện, tranh sáng lần lượt theo câu; (2) ghép tranh từng câu: cô Hươu đọc câu, các con gõ số tranh,
   hiện đáp án thì tranh bay vào dải truyện; tranh đã ghép mờ đi nên càng về sau càng dễ; ghép xong cô Hươu đọc lại cả truyện bằng tiếng kia --- */
let xepRun = 0;
async function xepPlay(key, list) {
  const my = ++xepRun, live = () => my === xepRun && lastStageKey === key;
  await sleep(300);
  for (const [k, src] of list) {
    if (!live()) return;
    $$('.xp-book figure').forEach((f, j) => f.classList.toggle('on', j === k));
    await SND.play([src]); if (!live()) return; await sleep(500);
  }
  $$('.xp-book figure').forEach(f => f.classList.remove('on'));
}
function vXep() {
  const R = XEP.length, r = Math.min(R - 1, S.xr || 0), X = XEP[r], ord = xepOrder(r), j = S.xj == null ? -1 : S.xj, rv = S.step === 'rv', from = X.from, to = X.to;
  const lname = l => l === 'zh' ? 'tiếng Trung' : 'tiếng Anh';
  if (j < 0) {   // nghe cả truyện trước
    const list = X.scenes.map((sc0, k) => [k, xepAud(sc0, from)]);
    return {
      key: ['xep', r, 'nghe', S.rp || 0].join('|'),
      html: `<div class="qno">📖 ${esc(X.title)} · đoạn ${r + 1}/${R} ${flag(from)}</div>
        <p class="ask-line">👂 Các con nghe và xem truyện nhé. Nhớ tranh nào trước, tranh nào sau!</p>
        <div class="mm-story xp-book">${X.scenes.map((sc0, k) => `<figure><span class="no">${k + 1}</span><img src="${sc0.img}" alt=""><figcaption class="${from}">${esc(sc0[from])}</figcaption></figure>`).join('')}</div>`,
      ctl: `${r > 0 ? '<button class="btn ghost" data-act="prev">◀ Trước</button>' : ''}<button class="btn ghost" data-act="rp">🔁 Nghe lại truyện</button><button class="btn" data-act="next">Bắt đầu ghép tranh ▶</button>`,
      tip: `Cô Hươu đọc cả đoạn bằng ${lname(from)}, tranh sáng lên theo từng câu. Nghe xong (có thể nghe 2 lần), bấm <b>Bắt đầu ghép tranh</b>: tranh xáo trộn, cô Hươu đọc lại từng câu để các con tìm tranh.`,
      bind() { if (!muted) xepPlay(lastStageKey, list); }
    };
  }
  const sc0 = X.scenes[j], ans = ord.indexOf(j) + 1, filled = rv ? j + 1 : j, done = rv && j === 3;
  const strip = `<div class="xp-strip">${X.scenes.map((x, k) => k < filled ? `<div class="xp-slot full${k === j && rv ? ' new' : ''}"><img src="${x.img}" alt=""><span class="no">${k + 1}</span><small class="${to}">${esc(x[to])}</small></div>` : `<div class="xp-slot${k === j ? ' cur' : ''}"><span class="no">${k + 1}</span>${k === j ? '❓' : ''}</div>`).join('')}</div>`;
  const pics = `<div class="mm-pics wide n4 xp-pool">${ord.map((k, c) => { const placed = k < j || (rv && k === j); return `<div class="mm-pick${rv && k === j ? ' right' : ''}${placed && !(rv && k === j) ? ' placed' : ''}"><img src="${X.scenes[k].img}" alt=""><span class="no">${c + 1}</span>${placed && !(rv && k === j) ? '<span class="xp-done">✓</span>' : ''}</div>`; }).join('')}</div>`;
  const seqTo = []; X.scenes.forEach(x => { seqTo.push(xepAud(x, to)); seqTo.push(500); });
  return {
    key: ['xep', r, j, rv ? 1 : 0, S.run || 0].join('|'), akey: ['xep', r, j, rv ? 1 : 0, S.rp || 0, S.run || 0].join('|'),
    audio: done ? [xepAud(sc0, to), 900].concat(seqTo) : rv ? [xepAud(sc0, to), 600, xepAud(sc0, to)] : [xepAud(sc0, from), 700, xepAud(sc0, from)],
    seq: seqTo,
    html: `<div class="qno">🧩 Ghép tranh · ${esc(X.title)} · câu ${j + 1}/4</div>
      ${strip}
      <div class="mm-prompt"><button class="say ${rv ? to : from}" data-play="${xepAud(sc0, rv ? to : from)}"><span class="ic">🔊</span>${rv ? `<span class="${to}">${esc(sc0[to])}</span>` : `Câu ${j + 1} ${flag(from)}`}</button>${done ? `<button class="say ${to}" data-play-seq="1"><span class="ic">📖</span>Cả truyện</button>` : ''}</div>
      ${pics}
      <p class="ask-line">${done ? `🎉 Ghép xong cả truyện! Cả lớp nghe lại bằng ${lname(to)} và nói theo nhé!` : rv ? `🔁 Cả lớp nói theo bằng ${lname(to)} nhé!` : `⌨️ Câu ${j + 1} là tranh số mấy? Con gõ số vào chat!`}</p>`,
    ctl: `<button class="btn ghost" data-act="prev">◀ Trước</button><button class="btn ghost" data-act="rp">🔁 Phát lại</button>${rv ? '' : '<button class="btn y" data-act="rv">👁 Hiện đáp án</button>'}<button class="btn" data-act="next">${j < 3 ? 'Câu tiếp ▶' : r + 1 < R ? 'Đoạn tiếp ▶' : `Tiếp: ${phaseName('vinh')} ▶`}</button>` + autoRvChk(),
    tip: `Tranh đã ghép có dấu ✓ và mờ đi, các con chỉ cần tìm trong các tranh còn lại. Hiện đáp án: tranh bay vào dải truyện, cô Hươu đọc câu đó bằng ${lname(to)} (chuyển ngữ). Ghép xong câu 4, cô Hươu đọc lại cả đoạn bằng ${lname(to)}.`
  };
}

/* --- Vinh danh: từng bạn một (theo thứ tự trong lớp, không xếp hạng), rồi cả lớp --- */
function title(t) {
  const c = [['tay', t.tay, 'Bạn hăng hái giơ tay', '🙋'], ['dung', t.dung, 'Bạn tinh tai, tinh mắt', '👀'], ['noi', t.noi, 'Bạn tự tin phát biểu', '🎤']];
  const mx = Math.max(...c.map(x => x[1]));
  if (!mx) return ['Bạn chăm chú lắng nghe', '💛'];
  const top = c.filter(x => x[1] === mx);
  return top.length > 1 && top.length === 3 ? ['Ngôi sao toàn năng', '🌟'] : [top[0][2], top[0][3]];
}
function vVinh() {
  const n = S.kids.length, vi = Math.min(n, S.vi || 0);
  if (!n) return { key: 'vinh0', html: `<h1 class="mm-h1">🏆 Vinh danh</h1><p class="mm-sub">Chưa có bé nào.</p>` };
  if (vi < n) {
    const k = S.kids[vi], t = totals(k.id), [tt, ic] = title(t);
    return {
      key: 'vinh|' + vi, akey: 'vinh|' + vi + '|' + (S.rp || 0), audio: [hd('Giỏi quá!')],
      html: `<div class="qno">🏆 Vinh danh · ${vi + 1}/${n}</div>
        <div class="mm-hero"><div class="mm-hero-ava"><img src="${avaImg(k.ava)}" alt=""><span class="mm-crown">👑</span></div>
          <h1 class="mm-h1">${esc(k.kid)}</h1><div class="mm-title">${ic} ${esc(tt)}</div>
          <div class="mm-bigstar">⭐ ${t.sao}</div>
          <div class="mm-counts"><span>✋ ${t.tay}</span><span>✅ ${t.dung}</span><span>🎤 ${t.noi}</span></div></div>`,
      ctl: `<button class="btn ghost" data-act="prev">◀ Bạn trước</button><button class="btn" data-act="next">${vi + 1 < n ? 'Bạn tiếp ▶' : 'Cả lớp ▶'}</button>`,
      tip: 'Mỗi bạn đều được vinh danh, theo thứ tự trong lớp (không xếp hạng). Sao của con sẽ được cộng vào ví sao trên web học để đổi quà khi cô bấm <b>Gửi báo cáo & cộng sao</b>.',
      bind() { SND.beep('win'); confetti(); }
    };
  }
  return {
    key: 'vinh|all', akey: 'vinh|all', audio: [hd('Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá!'), 300, hd('Tuyệt vời! Con đã học xong hôm nay rồi!')],
    html: `<div class="medal"><small>Huy hiệu</small><b>BỨT PHÁ</b><small>⭐ Vòng ${LZ_CFG.vong} ⭐</small></div>
      <h1 class="mm-h1">Cả nhóm giỏi quá!</h1>
      <div class="mm-faces big">${S.kids.map(k => `<div class="face"><img src="${avaImg(k.ava)}" alt=""><span>${esc(k.kid)}</span><b>⭐ ${totals(k.id).sao}</b></div>`).join('')}</div>
      <p class="ask-line">⭐ Sao hôm nay được cộng vào web học để con đổi quà nhé!</p>`,
    ctl: `<button class="btn ghost" data-act="prev">◀ Trước</button><button class="btn ghost" data-act="copyVinh">📋 Chép lời vinh danh cho nhóm ba mẹ</button><button class="btn red" data-act="report">📤 Gửi báo cáo & cộng sao</button>`,
    tip: S.sent ? `Đã gửi lúc ${new Date(S.sent).toLocaleTimeString('vi-VN')}. Gửi lại thì ghi đè, không cộng trùng.` : 'Bấm <b>Gửi báo cáo & cộng sao</b> sau buổi (cô có thể chỉnh sao trong bảng báo cáo trước khi gửi).',
    bind() { SND.beep('win'); confetti(); }
  };
}

/* ======================= chuyển câu / chuyển phần ======================= */
function step(d) {
  const p = S.ph, nx = nextPhase();
  const P = { step: 'ask', rp: 0 };
  if (p === 'cho' || p === 'intro' || p === 'hat') { if (p === 'hat') S.songOn = false; return d > 0 ? goPhase(nx) : null; }
  if (p === 'noi' || p === 'on' || p === 'tone') {
    const N = p === 'noi' ? NOI.length : p === 'on' ? QUIZ.length : TONES.length, i = (S.i || 0) + d;
    if (i < 0) return; if (i >= N) return goPhase(nx);
    return go(Object.assign(P, { i }));
  }
  if (p === 'lop') { const li = (S.li || 0) + d; if (li < 0) return; if (li >= lopTurnsNow().length) return goPhase(nx); return go(Object.assign(P, { li })); }
  if (p === 'boss') return d > 0 ? goPhase(nx) : null;
  if (p === 'xep') {
    let r = S.xr || 0, j = (S.xj == null ? -1 : S.xj) + d;
    if (j > 3) { r++; j = -1; } if (j < -1) { r--; j = 3; }
    if (r < 0) return; if (r >= XEP.length) return goPhase(nx);
    xepRun++; return go(Object.assign(P, { xr: r, xj: j }));
  }
  if (p === 'vinh') { const vi = (S.vi || 0) + d; if (vi < 0 || vi > S.kids.length) return; return go({ vi, rp: 0 }); }
}

/* ======================= thêm bé ======================= */
let parsed = [];
function addBox() {
  const ov = overlay(`<h2>👥 Các bé trong lớp</h2>
    <div class="mm-two"><div>
      <h3>Dán danh sách người tham gia Zoom</h3>
      <p class="small">Mỗi dòng một bé. Web tự tách tên con và tên ba mẹ ("Bin - Mẹ Hoa", "Mẹ Bống", "Na (bố Tuấn)"). Cô xem lại rồi bấm Thêm.</p>
      <textarea id="paste" rows="5" placeholder="Bin - Mẹ Hoa&#10;Mẹ Bống&#10;Na (bố Tuấn)"></textarea>
      <div class="ctl"><button class="btn ghost" id="ps">Tách tên</button></div><div id="pres"></div>
      <h3>Gõ nhanh</h3><div class="mm-quick"><input id="qk" placeholder="Tên con"><input id="qp" placeholder="Tên ba hoặc mẹ (không bắt buộc)"><button class="btn" id="qa">Thêm</button></div>
      <p class="small">Gõ đúng tên con như trên web học (ví dụ "Gia Bảo") để sao tự cộng đúng bé.</p>
    </div><div><h3>Trong lớp (${S.kids.length})</h3><div id="kl"></div></div></div>
    <div class="ctl"><button class="btn red" data-close>Xong</button></div>`);
  const list = () => {
    $('#kl', ov).innerHTML = S.kids.map((k, j) => `<div class="mm-kl"><img src="${avaImg(k.ava)}" alt="" data-ava="${k.id}" title="Đổi bạn đồng hành">
      <input value="${esc(k.kid)}" data-kn="${k.id}" aria-label="Tên con"><input value="${esc(k.parent)}" data-kp="${k.id}" placeholder="Ba/mẹ" aria-label="Tên ba mẹ">
      <button class="ic-btn" data-up="${j}" title="Lên">▲</button><button class="ic-btn" data-rm="${k.id}" title="Xoá">✖</button></div>`).join('') || '<p class="small">Chưa có bé nào.</p>';
    $$('[data-kn]', ov).forEach(x => x.onchange = () => { const k = kidById(x.dataset.kn); if (k && x.value.trim()) { k.kid = x.value.trim(); save(); draw(); } });
    $$('[data-kp]', ov).forEach(x => x.onchange = () => { const k = kidById(x.dataset.kp); if (k) { k.parent = x.value.trim(); save(); draw(); } });
    $$('[data-up]', ov).forEach(x => x.onclick = () => { const j = +x.dataset.up; if (j > 0) { [S.kids[j - 1], S.kids[j]] = [S.kids[j], S.kids[j - 1]]; save(); draw(); list(); } });
    $$('[data-rm]', ov).forEach(x => x.onclick = () => { const k = kidById(x.dataset.rm); if (k && confirm('Xoá ' + k.kid + ' khỏi lớp? Sao của bé trong buổi này cũng mất.')) { S.kids = S.kids.filter(y => y !== k); save(); draw(); list(); } });
    $$('[data-ava]', ov).forEach(x => x.onclick = () => { cycleAva(x.dataset.ava); list(); });
    $('h3', $('#kl', ov).parentNode).textContent = 'Trong lớp (' + S.kids.length + ')';
  };
  list();
  const drawParsed = () => {
    $('#pres', ov).innerHTML = parsed.length ? `<table class="res parse">${parsed.map((r, j) => `<tr><td><input type="checkbox" data-j="${j}" ${r.use ? 'checked' : ''}></td><td><input data-k="${j}" value="${esc(r.kid)}"></td><td><input data-p="${j}" value="${esc(r.parent)}"></td><td class="small">${esc(r.raw)}${r.note ? `<br><b>${esc(r.note)}</b>` : ''}</td></tr>`).join('')}</table>
      <div class="ctl"><button class="btn" id="addAll">Thêm ${parsed.filter(r => r.use).length} bé</button></div>` : '';
    $$('[data-j]', ov).forEach(x => x.onchange = () => { parsed[x.dataset.j].use = x.checked; });
    $$('[data-k]', ov).forEach(x => x.oninput = () => { parsed[x.dataset.k].kid = x.value; });
    $$('[data-p]', ov).forEach(x => x.oninput = () => { parsed[x.dataset.p].parent = x.value; });
    const b = $('#addAll', ov); if (b) b.onclick = () => { let n = 0; parsed.filter(r => r.use).forEach(r => { if (addKid(r.kid, r.parent)) n++; }); parsed = []; $('#paste', ov).value = ''; save(); draw(); drawParsed(); list(); toast(`Đã thêm ${n} bé.`); };
  };
  $('#ps', ov).onclick = () => { parsed = parseZoomList($('#paste', ov).value); drawParsed(); };
  const quick = () => { const k = $('#qk', ov).value.trim(); if (!k) return; if (!addKid(k, $('#qp', ov).value)) toast('Bé này đã có trong lớp.'); $('#qk', ov).value = ''; $('#qp', ov).value = ''; $('#qk', ov).focus(); save(); draw(); list(); };
  $('#qa', ov).onclick = quick; $('#qk', ov).onkeydown = e => { if (e.key === 'Enter') quick(); }; $('#qp', ov).onkeydown = e => { if (e.key === 'Enter') quick(); };
  setTimeout(() => $('#qk', ov).focus(), 50);
}
function cycleAva(id) { const k = kidById(id); if (!k) return; const i = AVATARS.findIndex(a => a.id === k.ava); k.ava = AVATARS[(i + 1) % AVATARS.length].id; save(); draw(); }
/* Tách tên con / tên ba mẹ từ tên hiển thị trên Zoom (chép từ lop-zoom/lz-co.js) */
function parseZoomList(text) {
  const PAR = /^(mẹ|me|má|mama|mom|mommy|mami|ba|bố|bo|cha|papa|daddy|dad|bà|ông|ong)(?=[\s.]|$)\.?\s*/i;
  const KID = /^(bé|be|con|bạn|baby)(?=[\s.]|$)\.?\s*/i;
  const DEV = /(iphone|ipad|samsung|galaxy|oppo|xiaomi|redmi|vivo|realme|laptop|android|macbook|desktop|\bpc\b)/i;
  const out = [];
  text.split(/\r?\n/).forEach(raw => {
    let s = raw.replace(/\((host|co-host|me|tôi|khách|guest|chủ trì|đồng chủ trì)\)/ig, '').replace(/\b(unmute|mute|bật tiếng|tắt tiếng|bật video|tắt video)\b/ig, '')
      .replace(/^[\s\d.)]+/, '').replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '').trim();
    if (!s || s.length < 2) return;
    if (/^(cô|co|teacher|ces|thầy)(?=[\s.\-]|$)/i.test(s) || /\bCES\b/.test(s)) { out.push({ raw, kid: '', parent: '', use: false, note: 'Có vẻ là cô / tài khoản CES' }); return; }
    let kid = '', parent = '', note = '';
    if (s.match(DEV)) { const m = s.match(/của\s+(.+)$/i); parent = m ? m[1].trim() : ''; out.push({ raw, kid: '', parent, use: false, note: 'Tên máy: cô gõ tên con' }); return; }
    const parts = s.split(/\s*[-–—|/,_:;()\[\]]\s*|\s+(?:của|con)\s+/i).map(x => x.trim()).filter(Boolean);
    const other = [];
    parts.forEach(p => { if (PAR.test(p) && !parent) parent = p; else if (KID.test(p) && !kid) kid = p.replace(KID, ''); else other.push(p); });
    if (!kid && other.length) kid = other.shift().replace(KID, '');
    if (!kid && parent) { kid = parent.replace(PAR, ''); note = 'Đoán: "' + parent + '" là ba/mẹ của bé ' + kid; }
    if (!parent && other.length) parent = other.join(' ');
    const cap = x => x.replace(/\s+/g, ' ').trim();
    out.push({ raw, kid: cap(kid), parent: cap(parent), use: !!kid, note: note || (parent ? '' : 'Chưa thấy tên ba mẹ') });
  });
  return out;
}
function overlay(html) {
  const ov = document.createElement('div'); ov.className = 'mm-ov';
  ov.innerHTML = `<div class="mm-box">${html}<button class="mm-x" data-close aria-label="Đóng">✕</button></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) ov.remove(); });
  return ov;
}

/* ======================= báo cáo cuối buổi ======================= */
const pct = a => a[1] ? `${a[0]}/${a[1]}` : '';
/* Mốc chấm 4H điều chỉnh cho buổi Zoom một màn (0–2), giống bản cũ, đổi câu chữ cho cách học qua một màn hình */
const H4 = {
  td: { n: 'Thái độ', lv: { 2: ['Tự giác', 'Tập trung gần cả buổi, tự giơ tay, gõ chat và trả lời ngay khi cô hỏi'], 1: ['Khi nhắc', 'Tham gia khi cô gọi tên hoặc ba mẹ nhắc, lúc tập trung lúc xao nhãng'], 0: ['Cần hỗ trợ', 'Chưa muốn tham gia, ba mẹ phải làm cùng hoặc con rời màn hình'] } },
  cx: { n: 'Cảm xúc', lv: { 2: ['Hào hứng', 'Vui, cười, hăng hái, muốn được chọn, khoe khi đúng'], 1: ['Bình thường', 'Lúc đầu còn ngại, vui dần lên hoặc bình thản cả buổi'], 0: ['Còn ngại', 'Rụt rè, lo lắng, không muốn nói hoặc muốn dừng sớm'] } },
  tt: { n: 'Tương tác với bạn', lv: { 2: ['Chủ động', 'Tự hỏi, đáp bạn, nói theo bạn khi bạn làm cô giáo nhỏ, cổ vũ bạn'], 1: ['Khi cô gợi ý', 'Hỏi, đáp bạn khi cô mời; nói theo bạn nhưng còn chờ cô'], 0: ['Chưa', 'Chưa nói với bạn, chưa tham gia khi bạn làm cô giáo nhỏ'] } }
};
const chaoLv = v => v === 2 ? 'tự nói' : v === 1 ? 'nói cùng cô' : '';
const RCOLS = [
  ['kid', 'Tên con'], ['parent', 'Ba/mẹ'], ['tay', '✋ Giơ tay'], ['chat', '✅ Đúng (chat)'], ['noi', '🎤 Phát biểu'],
  ['chaoEN', 'Chào bạn EN'], ['chaoZH', 'Chào bạn ZH'], ['onEN', 'Ôn nhanh EN'], ['onZH', 'Ôn nhanh ZH'], ['doc', 'Nhìn chữ'],
  ['tone', 'Thanh điệu chọn đúng'], ['toneCham', 'Cô chấm thanh điệu'], ['lopEN', 'Cô giáo nhỏ: nói EN'], ['lopZH', 'Cô giáo nhỏ: nói ZH'],
  ['rongTxt', 'Đấu Rồng Lửa: đúng/câu'], ['xep0', 'XEP0'], ['xep1', 'XEP1']
];
function rcolName(c) { if (c[0] === 'xep0' || c[0] === 'xep1') { const X = XEP[+c[0].slice(3)]; return X ? `Ghép tranh (nghe ${X.from === 'zh' ? 'ZH' : 'EN'}, đọc lại ${X.to === 'zh' ? 'ZH' : 'EN'})` : ''; } return c[1]; }
function reportRows() {
  return S.kids.map(k => {
    const t = totals(k.id), a = t.a, ch = (S.chao || {})[k.id] || {}, lt0 = (S.lt || {})[k.id] || {}, h = (S.h4 || {})[k.id] || {};
    const g = { 2: 0, 1: 0, 0: 0 }; Object.values(S.tr || {}).forEach(m => { const v = m[k.id]; if (v != null) g[v]++; });
    return { ma: k.id, kid: k.kid, parent: k.parent, tay: t.tay, chat: t.chat, rong: t.rong, dung: t.dung, noi: t.noi, sao: t.sao, adj: +S.adj[k.id] || 0, note: S.note[k.id] || '',
      chaoEN: chaoLv(ch.en), chaoZH: chaoLv(ch.zh), onEN: pct(a.onEN), onZH: pct(a.onZH), doc: pct(a.doc), tone: pct(a.tone),
      toneCham: (g[2] + g[1] + g[0]) ? `chuẩn ${g[2]} · gần ${g[1]} · cần luyện ${g[0]}` : '',
      lopEN: lt0.en ? 'được' : (lt0.c != null ? 'chưa' : ''), lopZH: lt0.zh ? 'được' : (lt0.c != null ? 'chưa' : ''),
      rongTxt: a.rongN ? `${a.rong}/${a.rongN}` : '', xep0: a.x0 ? pct(a.x0) : '', xep1: a.x1 ? pct(a.x1) : '',
      td: h.td ?? '', cx: h.cx ?? '', tt: h.tt ?? '', tieu: title(t)[0] };
  });
}
function reportBox() {
  const ov = overlay(`<h2>📊 Báo cáo buổi Zoom · ${esc(LZ_CFG.ten)} · ${esc(S.ngay)}</h2>
    <p class="small">Mỗi bé một dòng, tách EN và ZH, theo đúng các lần cô bấm. Câu chưa hiện đáp án và câu con chưa trả lời không tính là sai. Chấm 4H điều chỉnh (thái độ, cảm xúc, tương tác với bạn, 0–2), chỉnh <b>± sao</b> và ghi chú trước khi gửi. Một sao = ✋ ×${S.w.tay}, ✅ ×${S.w.dung}, 🎤 ×${S.w.noi} (đổi ở ⚙).</p>
    <div class="ctl"><button class="btn red" id="send">📤 Gửi báo cáo & cộng sao vào web học</button><button class="btn ghost" id="csv">⬇ Tải CSV</button><button class="btn ghost" id="cp">📋 Chép lời vinh danh</button></div>
    <div id="sendMsg">${S.sent ? `<p class="msg">Đã gửi lúc ${new Date(S.sent).toLocaleString('vi-VN')}. Gửi lại thì ghi đè, không cộng trùng.</p>` : ''}</div>
    <details class="h4-guide" open><summary><b>Mốc chấm 4H</b> (bấm một mốc, bấm lại để bỏ)</summary><div class="h4-g">${Object.values(H4).map(x => `<div><b>${x.n}</b>${[2, 1, 0].map(n => `<div class="small"><b>${n} · ${esc(x.lv[n][0])}</b>: ${esc(x.lv[n][1])}</div>`).join('')}</div>`).join('')}</div></details>
    <div class="scroll-x"><table class="res" id="rt"></table></div>`);
  const h4btn = (id, f, v) => `<div class="h4b">${[2, 1, 0].map(n => `<button class="${String(v) === String(n) ? 'on' : ''}" data-h4="${id}|${f}|${n}" title="${esc(H4[f].lv[n][0])}">${n}</button>`).join('')}</div>`;
  const fill = () => {
    const rows = reportRows();
    $('#rt', ov).innerHTML = `<tr>${RCOLS.map(c => `<th>${esc(rcolName(c))}</th>`).join('')}<th>Thái độ</th><th>Cảm xúc</th><th>Tương tác</th><th>± sao</th><th>⭐ Sao</th><th>Ghi chú của cô</th></tr>`
      + rows.map(r => `<tr>${RCOLS.map(c => c[0] === 'kid' ? `<td><b>${esc(r.kid)}</b><br><small>${esc(r.tieu)}</small></td>` : `<td>${esc(r[c[0]])}</td>`).join('')}
        <td>${h4btn(r.ma, 'td', r.td)}</td><td>${h4btn(r.ma, 'cx', r.cx)}</td><td>${h4btn(r.ma, 'tt', r.tt)}</td>
        <td><input type="number" class="adj" data-adj="${r.ma}" value="${r.adj}" step="1"></td><td><b>⭐ ${r.sao}</b></td><td><textarea data-note="${r.ma}">${esc(r.note)}</textarea></td></tr>`).join('');
    $$('[data-adj]', ov).forEach(x => x.onchange = () => { S.adj[x.dataset.adj] = Math.round(+x.value || 0); save(); draw(); fill(); });
    $$('[data-note]', ov).forEach(x => x.onchange = () => { S.note[x.dataset.note] = x.value.trim(); save(); });
    $$('[data-h4]', ov).forEach(x => x.onclick = () => { const [id, f, n] = x.dataset.h4.split('|'); S.h4 = S.h4 || {}; const m = S.h4[id] || (S.h4[id] = {}); if (m[f] === +n) delete m[f]; else m[f] = +n; save(); fill(); });
  };
  fill();
  $('#csv', ov).onclick = downloadCSV;
  $('#cp', ov).onclick = copyVinh;
  $('#send', ov).onclick = async () => {
    const m = $('#sendMsg', ov); m.innerHTML = '<p class="msg">Đang gửi…</p>';
    try {
      const pg = await (await fetch(LZ_API + '?action=ping&t=' + Date.now())).json();
      if (!pg || !(pg.v >= 16)) { m.innerHTML = `<p class="msg err">Máy chủ đang ở bản v${pg && pg.v}. Cần dán <b>apps-script/Code.gs</b> và triển khai bản v16 thì mới cộng sao được. Cô bấm Tải CSV để giữ kết quả.</p>`; return; }
      const t = reportTable();
      const rows = reportRows().map((r, j) => ({ ma: r.ma, kid: r.kid, parent: r.parent, tay: r.tay, dung: r.chat, rong: r.rong, noi: r.noi, sao: r.sao, note: r.note, cells: t.rows[j] }));
      const j = await apiPost({ action: 'zoommm', buoi: S.id, ngay: S.ngay, lop: LZ_CFG.ten, khoa: LZ_CFG.khoa, vong: LZ_CFG.vong, cols: t.head, rows });
      if (!j || !j.ok) throw new Error('máy chủ không nhận');
      S.sent = Date.now(); save();
      const need = (j.rows || []).filter(x => !x.web).map(x => (kidById(x.ma) || {}).kid).filter(Boolean);
      m.innerHTML = `<p class="msg">Đã ghi ${j.n} bé vào tab "Lớp Zoom 1 màn" và "Sao Zoom". ${need.length ? `<b>Chưa ghép được với tài khoản web học: ${need.map(esc).join(', ')}</b> (trùng tên hoặc tên khác với trên web). Sale dán mã bé vào cột "Mã bé web" của tab "Sao Zoom" là web tự cộng sao.` : 'Tất cả các bé đã ghép với tài khoản web học: lần tới con mở web là thấy sao trong ví.'}</p>`;
    } catch (e) { m.innerHTML = '<p class="msg err">Chưa gửi được (mạng hoặc máy chủ). Cô bấm Tải CSV để giữ kết quả rồi thử lại sau.</p>'; }
  };
}
/* bảng báo cáo dùng chung cho Tải CSV và Gửi về Sheet */
function reportTable() {
  const head = RCOLS.map(rcolName).concat(['Thái độ', 'Cảm xúc', 'Tương tác', '± sao', 'Sao', 'Danh hiệu', 'Ghi chú của cô']);
  const rows = reportRows().map(r => RCOLS.map(c => r[c[0]]).concat([r.td, r.cx, r.tt, r.adj, r.sao, r.tieu, r.note]));
  return { head, rows };
}
function downloadCSV() {
  const t = reportTable();
  const all = [['Buổi', 'Ngày', 'Khoá'].concat(t.head)].concat(t.rows.map(r => [S.id, S.ngay, LZ_CFG.ten].concat(r)));
  const csv = '﻿' + all.map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `lop-zoom-mot-man-${LZ_LOP}-${S.ngay}.csv`; a.click();
}
function copyVinh() {
  const t = `🏆 Vinh danh lớp Zoom ${LZ_CFG.ten} (${S.ngay})\n` + S.kids.map(k => { const x = totals(k.id); return `⭐ ${k.kid}: ${x.sao} sao · ${title(x)[0]} (✋ ${x.tay} · ✅ ${x.dung} · 🎤 ${x.noi})`; }).join('\n') + '\nSao được cộng vào ví sao trên web học để các con đổi quà nhé! 🎁';
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Đã chép lời vinh danh.')).catch(() => prompt('Cô chép đoạn này:', t));
}
function setBox() {
  const ov = overlay(`<h2>⚙ Cài đặt buổi học</h2>
    <h3>Mỗi lần cô bấm được bao nhiêu sao</h3>
    <div class="mm-quick"><label>✋ Giơ tay <input type="number" min="0" max="5" id="w1" value="${S.w.tay}"></label><label>✅ Trả lời đúng <input type="number" min="0" max="5" id="w2" value="${S.w.dung}"></label><label>🎤 Phát biểu <input type="number" min="0" max="5" id="w3" value="${S.w.noi}"></label></div>
    <h3>Khoá học</h3><div class="ctl">${Object.entries(LZ_LOPS).map(([k, v]) => `<a class="btn ${k === LZ_LOP ? 'y' : 'ghost'}" href="${lopUrl(k)}">${esc(v.ten)}</a>`).join('')}</div>
    <h3>Buổi học</h3><div class="ctl"><button class="btn ghost" id="nb">🆕 Mở buổi mới</button><button class="btn ghost" id="old">📂 Buổi cũ</button></div>
    <div class="ctl"><button class="btn red" data-close>Xong</button></div>`);
  ['w1', 'w2', 'w3'].forEach((id, j) => $('#' + id, ov).onchange = e => { S.w[['tay', 'dung', 'noi'][j]] = Math.max(0, Math.min(5, Math.round(+e.target.value || 0))); save(); draw(); });
  $('#nb', ov).onclick = () => { if (!confirm('Mở buổi mới? Buổi hiện tại vẫn được giữ ở "Buổi cũ".')) return; ov.remove(); const old = S; S = blank(); if (old && confirm('Giữ danh sách các bé của buổi trước?')) S.kids = old.kids.map(k => Object.assign({}, k)); save(); VKEY = ''; draw(); };
  $('#old', ov).onclick = () => { ov.remove(); home(true); };
}

/* ======================= trang mở đầu ======================= */
function home(list) {
  const cur = lsGet(KEY, null), ds = (lsGet('mm-ds', []) || []);
  app.innerHTML = `<div class="wrap"><div class="card"><h2>🦌 Lớp Zoom một màn</h2>
    <p>Cô vừa dạy vừa điều khiển trên một màn hình, chia sẻ màn này lên Zoom. Các con xem màn cô, giơ tay, gõ số vào chat, phát biểu; cô bấm thay các con.</p>
    <div class="ctl">${Object.entries(LZ_LOPS).map(([k, v]) => `<a class="btn ${k === LZ_LOP ? 'y' : 'ghost'}" href="${lopUrl(k)}">${esc(v.ten)}</a>`).join('')}</div>
    ${cur && !list ? `<p><b>Buổi đang dạy:</b> ${esc(cur.ngay)} · ${cur.kids.length} bé</p><div class="ctl"><button class="btn red" id="cont">▶ Tiếp tục buổi này</button><button class="btn ghost" id="nw">🆕 Mở buổi mới</button></div>`
      : `<div class="ctl"><button class="btn red" id="nw">🆕 Mở buổi mới · ${esc(LZ_CFG.ten)}</button></div>`}
    ${ds.length ? `<h3>Buổi cũ trên máy này</h3><div class="ctl">${ds.map(x => `<button class="btn ghost" data-old="${x.id}">${esc((LZ_LOPS[x.lop] || {}).ten || x.lop)} · ${esc(x.ngay)} · ${x.n} bé</button>`).join('')}</div>` : ''}
    <p class="small">Dữ liệu lưu trên trình duyệt của máy này. Cô dùng cùng một trình duyệt từ đầu đến hết buổi; tải lại trang không mất dữ liệu.</p></div></div>`;
  const nw = $('#nw'); if (nw) nw.onclick = () => { SND.unlock(); const old = cur; S = blank(); if (old && old.kids.length && confirm('Giữ danh sách các bé của buổi trước (' + old.kids.map(k => k.kid).join(', ') + ')?')) S.kids = old.kids.map(k => Object.assign({}, k)); save(); VKEY = ''; draw(); if (!S.kids.length) addBox(); };
  const ct = $('#cont'); if (ct) ct.onclick = () => { SND.unlock(); S = cur; VKEY = ''; draw(); };
  $$('[data-old]').forEach(b => b.onclick = () => {
    const x = lsGet('mm-s-' + b.dataset.old, null); if (!x) return toast('Không mở được buổi này.');
    if (x.lop !== LZ_LOP) { location.href = lopUrl(x.lop, { buoi: x.id }); return; }
    SND.unlock(); S = x; lsSet(KEY, S); VKEY = ''; draw();
  });
}

/* ======================= bấm nút ======================= */
const ACT = {
  start: () => goPhase('hat'), next: () => step(1), prev: () => step(-1), rv: reveal,
  rp: () => { autoRvStop(); xepRun++; go({ rp: (S.rp || 0) + 1 }); }, undo, add: addBox, report: reportBox, set: setBox, copyVinh,
  mute: () => { muted = !muted; lsSet('mm-mute', muted); if (muted) { SND.stop(); BA.stop(); } draw(); },
  full: () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) { } },
  noiKid: b => bump(b.dataset.id, 'noi', 1),
  chao: b => { S.chao = S.chao || {}; const m = S.chao[b.dataset.id] || (S.chao[b.dataset.id] = {}), l = b.dataset.l, v = +b.dataset.v;
    if (m[l] === v) { delete m[l]; bump(b.dataset.id, 'noi', -1); } else { const had = m[l] != null; m[l] = v; if (had) { save(); draw(); } else bump(b.dataset.id, 'noi', 1); } },
  dm: b => { const t = VIEW && VIEW.dm; if (!t) return; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Đã chép. Cô dán vào tin nhắn riêng trên Zoom.')).catch(() => prompt('Cô chép lời nhắn này:', t)); },
  lpSay: b => { const t = lopTurnsNow()[S.li || 0]; if (!t) return; const m = lt(t.a), l = b.dataset.l; if (m[l]) { m[l] = 0; bump(t.a, 'noi', -1); } else { m[l] = 1; bump(t.a, 'noi', 1); } },
  lpRe: () => { const t = lopTurnsNow()[S.li || 0]; if (t) { delete lt(t.a).c; save(); draw(); } },
  songGo: () => go({ songOn: true, songN: (S.songN || 0) + 1 }), songStop: () => go({ songOn: false }),
  bossGo, bossNext, bossEnd: () => { S.boss.end = Date.now(); save(); bossTick(); },
  auto: b => { S.auto = b.checked; save(); }, autoShow: b => { S.autoShow = b.checked; save(); }, autoRv: b => { S.autoRv = b.checked; save(); if (!b.checked) { autoRvStop(); draw(); } else if (S.step === 'rv') autoRvStart(); }, autoNoi: b => { S.autoNoi = b.checked; save(); },
  dur: b => { S.boss.dur = (+b.value || 3) * 60000; save(); },
};
document.addEventListener('click', e => {
  SND.unlock();
  const t = e.target.closest('[data-act],[data-ph],[data-sc],[data-px],[data-spin],[data-play],[data-play-seq],[data-ava],[data-lp],[data-tr]');
  if (!t || !S || t.closest('.mm-ov') && !t.dataset.act) return;
  if (t.dataset.ph) return goPhase(t.dataset.ph);
  if (t.dataset.sc) { const [id, f] = t.dataset.sc.split('|'); return bump(id, f, 1); }
  if (t.dataset.px) { const [id, c] = t.dataset.px.split('|'); return press(id, +c); }
  if (t.dataset.spin) { const [l, q] = t.dataset.spin.split('|'); return spin(l, q); }
  if (t.dataset.playSeq) { SND.stop(); if (VIEW && VIEW.seq) muted ? toast('Đang tắt tiếng') : SND.play(VIEW.seq); return; }
  if (t.dataset.play !== undefined) { if (t.dataset.play) { SND.stop(); muted ? toast('Đang tắt tiếng') : play([t.dataset.play]); } return; }
  if (t.dataset.tr) { const [id, v] = t.dataset.tr.split('|'); S.tr = S.tr || {}; const m = S.tr[S.i] || (S.tr[S.i] = {}); if (m[id] === +v) delete m[id]; else m[id] = +v; SND.beep('pop'); save(); draw(); return; }
  if (t.dataset.ava) return cycleAva(t.dataset.ava);
  if (t.dataset.lp !== undefined) { const tt = lopTurnsNow()[S.li || 0]; if (tt) { lt(tt.a).c = +t.dataset.lp; SND.beep('pop'); save(); draw(); } return; }
  const f = ACT[t.dataset.act]; if (f && t.tagName !== 'INPUT' && t.tagName !== 'SELECT') f(t);
});
document.addEventListener('change', e => { const t = e.target.closest('[data-act]'); if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT') && ACT[t.dataset.act]) ACT[t.dataset.act](t); });
document.addEventListener('keydown', e => {
  if (!S || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName) || $('.mm-ov') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); S.ph === 'boss' && S.boss.t0 && !bossDoneNow() ? bossNext() : step(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  else if (e.key === ' ') { e.preventDefault(); reveal(); }
  else if (e.key === 'r' || e.key === 'R') ACT.rp();
  else if (e.key === 'z' || e.key === 'Z') undo();
});

/* ======================= khởi động ======================= */
(function () {
  const want = QS.get('buoi');
  if (want) { const x = lsGet('mm-s-' + want, null); if (x && x.lop === LZ_LOP) { S = x; lsSet(KEY, S); return draw(); } }
  home();
})();
