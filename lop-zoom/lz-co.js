/* Lớp Zoom – màn cô: mở phòng, thêm bé, điều khiển 6 phần của buổi học, chấm, xem và gửi kết quả. */

const app = $('#app');
let CODE = '', room = {}, TAB = 'lop', dirty = false, tick = null;
const HUOU = TN + 'nhan-vat/huou_huou1_a.webp';
const base = () => roomPath(CODE);
const setState = patch => DB.update(base() + '/state', patch).catch(err);
const mark = (seat, path, v) => DB.set(base() + '/marks/' + seat + '/' + path, v).catch(err);
function err(e) { console.error(e); toast('Chưa lưu được: ' + (e && e.message || e)); }
function toast(t) { let el = $('#toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'msg'; el.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99;box-shadow:var(--shadow)'; document.body.appendChild(el); } el.textContent = t; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => el.style.display = 'none', 3200); }
const kidLink = () => location.href.replace(/co\.html.*$/, '');

/* ======================= mở phòng ======================= */
function homeScreen(msg) {
  const old = (lsGet('lz-co-rooms', []) || []).slice(0, 4);
  app.innerHTML = `<div class="wrap"><div class="card"><h2>Mở lớp Zoom</h2>
    <p>Little Seed · Vòng 2 "Giới thiệu bản thân" · nhóm tối đa 6 bé, 40 phút.</p>
    ${msg ? `<p class="msg err">${esc(msg)}</p>` : ''}
    <button class="btn red" id="mk">Mở phòng mới</button>
    ${old.length ? `<h3 style="margin-top:18px">Phòng đã mở trên máy này</h3><div class="ctl">${old.map(r => `<button class="btn ghost" data-r="${r.code}">Phòng ${r.code} · ${esc(r.d || '')}</button>`).join('')}</div>` : ''}
    <p class="tip">Cô dùng <b>cùng một trình duyệt</b> trên máy này từ lúc mở phòng đến hết buổi. Máy khác hoặc cửa sổ ẩn danh không điều khiển được phòng.</p>
    ${LZ_MOCK ? '<p class="tip">Đang ở <b>chế độ thử trên máy</b> (?mock=1): không dùng Firebase, mở thêm tab <code>index.html?mock=1</code> để làm bé.</p>' : ''}
  </div></div>`;
  $('#mk').onclick = createRoom;
  $$('[data-r]').forEach(b => b.onclick = () => openRoom(b.dataset.r));
}
async function createRoom() {
  for (let k = 0; k < 8; k++) {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const t = await DB.get(roomPath(code) + '/teacher');
    if (t && t !== DB.uid) continue;
    try {
      await DB.set(roomPath(code) + '/teacher', DB.uid);
      await DB.set(roomPath(code) + '/state', { ph: 'cho', run: 0, duyet: false, amCo: true, made: DB.now(), lop: 'seed-v2', ngay: today() });
    } catch (e) { continue; }
    const list = (lsGet('lz-co-rooms', []) || []).filter(r => r.code !== code);
    list.unshift({ code, d: new Date().toLocaleDateString('vi-VN') }); lsSet('lz-co-rooms', list.slice(0, 8));
    return openRoom(code);
  }
  homeScreen('Chưa mở được phòng. Cô kiểm tra mạng rồi thử lại nhé.');
}
async function openRoom(code) {
  const t = await DB.get(roomPath(code) + '/teacher');
  if (t !== DB.uid) return homeScreen('Phòng ' + code + ' không do trình duyệt này mở nên không điều khiển được. Cô mở phòng mới nhé.');
  CODE = code;
  $('#hdr').innerHTML = `<span class="code-big" title="Mã phòng">${code}</span>
    <button class="pill y" id="shareBtn">🖥 Chia sẻ lên Zoom</button><button class="pill" id="chieu" title="Mở màn chiếu ở cửa sổ riêng">📺 Cửa sổ riêng</button><button class="pill" id="cp">🔗 Chép link cho ba mẹ</button>`;
  $('#chieu').onclick = () => window.open(kidLink() + 'index.html?chieu=' + code + (LZ_MOCK ? '&mock=1' : ''), 'lz-chieu', 'width=1100,height=760');
  $('#shareBtn').onclick = openShare;
  $('#cp').onclick = () => { const l = kidLink() + '?phong=' + code + (LZ_MOCK ? '&mock=1' : ''); navigator.clipboard && navigator.clipboard.writeText(`Lớp Zoom cùng cô: ${l}  (mã phòng ${code})`); toast('Đã chép: ' + l); };
  app.innerHTML = `<nav class="tabs" id="tabs"></nav><div id="body"></div>`;
  DB.on(base(), v => { room = v || {}; draw(); });
  clearInterval(tick); tick = setInterval(drawTimer, 1000);
}

/* ======================= vẽ ======================= */
function seatsAll() { return buildSeats(room.players); }
function seatsIn() { return seatsAll().filter(s => s.ok); }
function draw() {
  const waiting = seatsAll().filter(s => !s.ok).length;
  $('#tabs').innerHTML = [['lop', 'Buổi học'], ['them', 'Thêm bé' + (waiting ? `<span class="n">${waiting}</span>` : '')], ['kq', 'Kết quả']]
    .map(([id, n]) => `<button data-t="${id}" class="${TAB === id ? 'on' : ''}">${n}</button>`).join('');
  $$('#tabs button').forEach(b => b.onclick = () => { TAB = b.dataset.t; dirty = false; if (sharing && TAB !== 'lop') { sharing = false; $('#share').classList.add('hide'); } draw(); });
  // đang gõ trong ô nhập thì để yên, vẽ lại khi rời ô
  const ae = document.activeElement;
  if (ae && $('#body').contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) { dirty = true; return; }
  dirty = false;
  if (TAB === 'them') return drawAdd();
  if (TAB === 'kq') return drawResults();
  drawClass();
}
document.addEventListener('focusout', () => setTimeout(() => { if (dirty) draw(); }, 50));

function drawTimer() {
  const el = $('#timer'); if (!el) return;
  const st = room.state || {};
  if (!st.t0) { el.textContent = '00:00'; return; }
  const s = Math.max(0, Math.floor((DB.now() - st.t0) / 1000)), m = Math.floor(s / 60);
  el.textContent = String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  const ph = PHASES.find(p => p.id === st.ph), end = ph && ph.m ? +ph.m.split('–')[1] : 99;
  el.classList.toggle('late', m >= end);
}

function drawClass() {
  const st = room.state || { ph: 'cho' };
  $('#body').innerHTML = `<div class="co-grid">
    <div class="panel"><div class="timer" id="timer">00:00</div><div class="phases">${PHASES.map(p => `<button data-ph="${p.id}" class="${st.ph === p.id ? 'on' : ''}"><span>${p.ic}</span><span>${p.n}<small>${p.m ? 'phút ' + p.m : 'trước giờ học'}</small></span></button>`).join('')}</div></div>
    <div class="panel" id="ctl"></div>
    <div class="panel"><h3>Các bé (${seatsIn().length})</h3><div class="kids" id="kids"></div></div></div>`;
  $$('[data-ph]').forEach(b => b.onclick = () => goPhase(b.dataset.ph));
  drawTimer();
  if (st.ph === 'story') { goPhase('xep'); return; }   // phòng mở từ bản cũ
  const c = CTL[st.ph] || CTL.cho;
  $('#ctl').innerHTML = c.html(st);
  if (HEAD_PHASES.indexOf(st.ph) >= 0) {
    $('#ctl').insertAdjacentHTML('beforeend', `<label class="toggle" style="margin-top:10px"><input type="checkbox" id="hdIn" ${headAllowed(st) ? 'checked' : ''}> 🙆 Phần này các con chọn bằng cách quay đầu (máy đã bật camera; chạm vẫn được)</label>`);
    $('#hdIn').onchange = e => setState({ ['headIn/' + st.ph]: e.target.checked });
  }
  c.bind && c.bind(st);
  drawKids(st, c);
  drawBar(st);
}

/* ---------- Chế độ chia sẻ lên Zoom ----------
   Cả màn hình là màn chiếu (tranh to, có tiếng, không hiện ai đúng ai sai); thanh nút ở dưới bấm hộ các nút của màn điều khiển.
   Phím tắt: → câu tiếp · ← câu trước · Space hiện đáp án · R phát lại · Esc thoát. */
let sharing = false;
function openShare() {
  TAB = 'lop'; sharing = true;
  const fr = $('#shareFr'), src = 'index.html?chieu=' + CODE + '&nhung=1' + (LZ_MOCK ? '&mock=1' : '');
  if (!fr.getAttribute('src')) fr.src = src;
  $('#share').classList.remove('hide');
  draw();
  toast('Trong Zoom: Chia sẻ màn hình → chọn cửa sổ này, tích "Chia sẻ âm thanh". Bấm nút đỏ giữa màn để bật tiếng.');
}
function closeShare() { sharing = false; $('#share').classList.add('hide'); draw(); }
const BAR = [
  ['#go', '▶ Bắt đầu', 'red'], ['[data-spin="en"]', '🎡 Quay · EN', ''], ['[data-spin="zh"]', '🎡 Quay · 中文', 'red'],
  ['#pv', '◀', 'ghost'], ['#rp', '🔁 Phát lại', 'ghost'], ['#rv', '👁 Hiện đáp án', 'y'], ['#ag', '↺ Hỏi lại', 'ghost'],
  ['#bst', '⚔️ Bắt đầu trận đấu', 'red'], ['#ben', '🏁 Kết thúc ngay', 'ghost'], ['#bre', '↺ Đấu lại', 'ghost'],
  ['#xgo', '🧩 Cho các con xếp tranh', 'y'], ['#xback', '◀ Nghe lại truyện', 'ghost'],
  ['#op', '🎁 Mở hộp quà', 'y'], ['#an', '👂 Nghe đáp án', 'y'], ['#nx', 'Tiếp ▶', ''], ['#kq', 'Xem kết quả', 'red']];
function drawBar(st) {
  if (!sharing) return;
  const ph = PHASES.find(p => p.id === st.ph) || PHASES[0];
  let lb = ph.ic + ' ' + ph.n;
  if (st.ph === 'on') lb += ` ${(st.i || 0) + 1}/${QUIZ.length}`;
  if (st.ph === 'tone') lb += ` ${(st.i || 0) + 1}/${TONES.length}`;
  if (st.ph === 'story') lb += ` ${(st.scene || 0) + 1}/${STORY.length}`;
  if (st.ph === 'xep') lb += ` · lượt ${((st.xep || {}).r || 0) + 1}/2`;
  const qid = (CTL[st.ph] || {}).qid ? CTL[st.ph].qid(st) : '';
  const only = (CTL[st.ph] || {}).only ? CTL[st.ph].only(st) : null;
  if (qid) { const ss = seatsIn().filter(x => !only || only.indexOf(x.id) >= 0); lb += ` · ${ss.filter(x => answerOf(room, x, qid)).length}/${ss.length} đã chọn`; }
  $('#shareBar').innerHTML = `<span class="lb">${esc(lb)}</span>` + BAR.map(([sel, t, c], j) => $('#ctl ' + sel) ? `<button class="btn ${c}" data-bar="${j}">${t}</button>` : '').join('') + `<button class="btn ghost x" id="shX">✖ Về màn điều khiển</button>`;
  $$('[data-bar]').forEach(b => b.onclick = () => { const sel = BAR[+b.dataset.bar][0], el = $('#ctl ' + sel); if (sel === '#kq') { sharing = false; $('#share').classList.add('hide'); } el && el.click(); });
  $('#shX').onclick = closeShare;
  const amOn = st.amCo !== false;
  $('#shX').insertAdjacentHTML('beforebegin', `<button class="btn ghost" id="shAm" title="Bấm để đổi">${amOn ? '🔈 Tiếng: chỉ máy cô' : '🔊 Tiếng: mọi máy'}</button>`);
  $('#shAm').onclick = () => setState({ amCo: !amOn });
}
window.lzKey = e => {
  if (!sharing) return;
  const k = { ArrowRight: '#nx', ArrowLeft: '#pv', ' ': '#rv', r: '#rp', R: '#rp' }[e.key];
  if (e.key === 'Escape') return closeShare();
  if (k) { const el = $('#ctl ' + k); if (el) { e.preventDefault(); el.click(); } }
};
document.addEventListener('keydown', e => { if (!/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName)) window.lzKey(e); });

/* chuyển phần */
function goPhase(ph) {
  const st = room.state || {};
  const p = { ph, step: 'ask', rp: 0 };
  if (!st.t0 && ph !== 'cho') p.t0 = DB.now();
  if (ph === 'on' || ph === 'tone') p.i = 0;
  if (ph === 'story') { p.scene = 0; p.l = 'both'; }
  if (ph === 'xep') { p.xep = { r: 0, step: 'nghe', sc: 0 }; p.run = (st.run || 0) + 1; }
  if (ph === 'gift') p.gift = { k: 0, open: false, ans: false, seat: pickRandom('pd') || null };
  if (ph === 'boss') { const b = st.boss || {}; p.boss = { run: b.t0 ? (b.run || 0) : (b.run || 0), dur: b.dur || 120000 }; }
  if (ph === 'lop') { const turns = lopTurns(onlineSeats()); p.lturns = turns; p.run = (st.run || 0) + 1; Object.assign(p, lopPatch(turns, 0, p.run)); }
  if (ph === 'pair') { const turns = pairTurns(onlineSeats()); p.turns = turns; p.run = (st.run || 0) + 1; Object.assign(p, pairPatch(turns, 0, p.run)); }
  setState(p);
}
/* bé đang có mặt: máy bé đang trực tuyến, hoặc chỗ cô tạo cho bé chỉ có 1 máy (cô bấm hộ) */
function lopPatch(turns, n, run) {
  const t = turns[n]; if (!t) return {};
  const o = { lop: Object.assign({ n }, t), step: 'ask', rp: 0 };
  o['llog/' + n + '_' + run] = t;
  return o;
}
function onlineSeats() { const s = seatsIn(); const on = s.filter(x => x.on || (/^t_/.test(x.id) && x.ids.length < 2)); return on.length >= 2 ? on : s; }
function pairPatch(turns, n, run) {
  const t = turns[n]; if (!t) return {};
  const o = { pair: Object.assign({ n }, t), step: 'ask', rp: 0 };
  o['plog/' + n + '_' + run] = t;
  return o;
}
/* chọn ngẫu nhiên một bé chưa được chọn ở phần này (vòng quay, phiên dịch nhí) */
function pickRandom(kind) {
  const s = onlineSeats(); if (!s.length) return '';
  const marks = room.marks || {};
  const done = kind === 'pd' ? (id => marks[id] && marks[id].pd) : (id => marks[id] && marks[id].intro);
  const fresh = s.filter(x => !done(x.id));
  const pool = fresh.length ? fresh : s;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

/* ======================= điều khiển từng phần ======================= */
const pv = (src, ok) => `<img src="${src}" class="${ok ? 'ans' : ''}" alt="">`;
const CTL = {
  cho: {
    html: st => `<h2>🚪 Chờ vào lớp</h2>
      <p>Đọc mã phòng <span class="code-big">${CODE}</span> cho ba mẹ, hoặc dán link vào khung chat Zoom (nút <b>Chép link cho ba mẹ</b>).</p>
      <p class="tip">Bé chỉ có 1 máy: con xem màn chiếu cô chia sẻ, giơ ngón tay 1-2-3, cô bấm hộ ở cột bên phải. Cô thêm bé ở thẻ <b>Thêm bé</b> (dán danh sách người tham gia Zoom).</p>
      <label class="toggle"><input type="checkbox" id="dy" ${st.duyet ? 'checked' : ''}> Cô duyệt từng bé tự vào bằng mã phòng</label>
      <label class="toggle" style="margin-top:8px"><input type="checkbox" id="amco" ${st.amCo !== false ? 'checked' : ''}> Tiếng chỉ phát ở máy cô (màn chiếu cô chia sẻ). Máy các con im lặng, trừ tiếng mẫu bí mật của bạn đang nói.</label>
      <div class="ctl"><button class="btn red" id="go">▶ Bắt đầu: Chào bạn mới</button></div>`,
    bind() { $('#dy').onchange = e => setState({ duyet: e.target.checked }); $('#amco').onchange = e => setState({ amCo: e.target.checked }); $('#go').onclick = () => goPhase('intro'); }
  },
  intro: {
    html: st => {
      const sp = st.spin || {}, s = seatsIn().find(x => x.id === sp.seat);
      return `<h2>🎡 Chào bạn mới</h2><p>Cô quay vòng chọn bạn. Cả lớp hỏi <b>What's your name?</b> / <b class="zh">你叫什么？</b>, bạn trả lời <b>My name is…</b> / <b class="zh">我叫…</b></p>
      <div class="ctl"><button class="btn" data-spin="en">🎡 Quay · tiếng Anh</button><button class="btn red" data-spin="zh">🎡 Quay · tiếng Trung</button></div>
      ${s ? `<div class="tip">Vừa chọn: <b>${esc(s.kid)}</b> (${sp.l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}). Chấm ở cột bên phải: <b>EN</b>/<b>ZH</b> = con nói được, bấm lần nữa = nói cùng cô.</div>` : ''}
      <p class="small">Bấm 🎯 cạnh tên bé để chọn đúng bạn đó.</p>
      <div class="ctl"><button class="btn ghost" id="nx">Tiếp: Ôn nhanh ▶</button></div>`;
    },
    bind(st) {
      $$('[data-spin]').forEach(b => b.onclick = () => spin(pickRandom('intro'), b.dataset.spin));
      $('#nx').onclick = () => goPhase('on');
    },
    kid(s, st) {
      const m = ((room.marks || {})[s.id] || {}).intro || {};
      const lv = v => v === 2 ? ' on' : v === 1 ? ' on y' : '';
      return `<button class="ic-btn" title="Chọn bạn này" data-pick="${s.id}">🎯</button>
        <button class="mk${lv(m.en)}" data-intro="${s.id}|en">EN ${m.en === 2 ? '✓' : m.en === 1 ? '~' : ''}</button>
        <button class="mk${lv(m.zh)}" data-intro="${s.id}|zh">ZH ${m.zh === 2 ? '✓' : m.zh === 1 ? '~' : ''}</button>`;
    },
    kbind(st) {
      $$('[data-pick]').forEach(b => b.onclick = () => spin(b.dataset.pick, (st.spin || {}).l || 'en'));
      $$('[data-intro]').forEach(b => b.onclick = () => {
        const [id, l] = b.dataset.intro.split('|'), cur = ((((room.marks || {})[id] || {}).intro) || {})[l] || 0;
        mark(id, 'intro/' + l, cur === 2 ? 1 : cur === 1 ? null : 2);
      });
    }
  },
  on: {
    html: st => {
      const i = st.i || 0, q = QUIZ[i], rv = st.step === 'rv', a = quizAns(q);
      return `<h2>⚡ Ôn nhanh · câu ${i + 1}/${QUIZ.length}</h2>
        <p><span class="flag ${quizLang(q)}">${{ en: 'English', zh: '中文', doc: 'Nhìn chữ' }[quizLang(q)]}</span> <span class="bigtxt ${q.l === 'zh' ? 'zh' : ''}">${esc(q.l === 'doc' ? q.chu : txt(q.k, q.l))}</span></p>
        <div class="prev">${quizPics(q).map((s, c) => pv(s, c === a)).join('')}<button class="btn ghost sm" id="lp">🔊 Nghe trên máy cô</button></div>
        ${qButtons(st, i, QUIZ.length, rv)}
        <p class="tip">Mỗi câu đúng làm đầy thanh năng lượng chung. Bé chưa đúng thì cả lớp nghe lại, không sửa lỗi riêng.</p>`;
    },
    bind(st) { qBind(st, QUIZ.length, 'tone'); $('#lp').onclick = () => SND.play([quizAudio(QUIZ[st.i || 0])]); },
    qid: st => `on_${st.i || 0}_${st.run || 0}`, opts: 3
  },
  tone: {
    html: st => {
      const i = st.i || 0, x = TONES[i], rv = st.step === 'rv';
      return `<h2>✈️ Máy bay thanh điệu · ${i + 1}/${TONES.length}</h2>
        <p><span class="bigtxt zh">${x.c}</span> <span class="bigtxt" style="color:var(--red)">${x.py}</span> · thanh ${x.t} (${TONE_NAME[x.t]})</p>
        ${toneAudio(x) ? '' : '<p class="tip">Chữ này chưa có file giọng riêng: <b>cô đọc trên Zoom</b>.</p>'}
        ${qButtons(st, i, TONES.length, rv)}
        <p class="tip">Sau khi hiện đáp án: cả lớp đưa tay bay theo, nói theo. Cô chấm từng bé ở cột phải: <b>Chuẩn</b> / <b>Gần</b> / <b>Luyện</b>. Bé 1 máy: bấm hộ số đường bay 1–4.</p>`;
    },
    bind(st) { qBind(st, TONES.length, 'pair'); },
    qid: st => `tone_${st.i || 0}_${st.run || 0}`, opts: 4,
    kid(s, st) {
      const v = ((((room.marks || {})[s.id] || {}).tone) || {})[st.i || 0];
      return [[2, 'Chuẩn', ''], [1, 'Gần', ' y'], [0, 'Luyện', ' o']].map(([n, t, c]) => `<button class="mk${v === n ? ' on' + c : ''}" data-tone="${s.id}|${n}">${t}</button>`).join('');
    },
    kbind(st) { $$('[data-tone]').forEach(b => b.onclick = () => { const [id, n] = b.dataset.tone.split('|'); const cur = ((((room.marks || {})[id] || {}).tone) || {})[st.i || 0]; mark(id, 'tone/' + (st.i || 0), cur === +n ? null : +n); }); }
  },
  pair: {
    html: st => {
      const p = st.pair || {}, turns = st.turns || [], it = PAIR_POOL[p.k || 0], s = seatsAll(), nm = id => id === 'co' ? 'Cô' : ((s.find(x => x.id === id) || {}).kid || '…');
      if (!turns.length) return `<h2>🤝 Trò chơi đôi bạn</h2><p>Cần ít nhất 1 bé trong lớp.</p><div class="ctl"><button class="btn" id="re">Ghép đôi</button></div>`;
      const rv = st.step === 'rv', l = p.l === 'zh' ? 'zh' : 'en';
      return `<h2>🤝 Trò chơi đôi bạn · lượt ${(p.n || 0) + 1}/${turns.length}</h2>
        <p><b>${esc(nm(p.a))}</b> nói 🗣️ → <b>${esc(nm(p.b))}</b> nghe và chạm · <span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span> <span class="bigtxt ${l}">${esc(txt(it.k, l))}</span></p>
        <div class="prev">${it.o.map((k, c) => pv(pic(k, 3), k === it.k)).join('')}</div>
        <div class="ctl"><button class="btn ghost" id="pv">◀ Lượt trước</button>
          ${rv ? '' : '<button class="btn y" id="rv">👁 Hiện đáp án</button>'}
          <button class="btn" id="nx">${(p.n || 0) + 1 < turns.length ? 'Lượt tiếp ▶' : 'Tiếp: Cô giáo nhỏ ▶'}</button>
          <button class="btn ghost" id="lg">Đổi sang ${l === 'zh' ? 'tiếng Anh' : 'tiếng Trung'}</button>
          <button class="btn ghost" id="re">🔀 Ghép đôi lại</button></div>
        <p class="small">Thứ tự: ${turns.map((t, j) => `<span style="${j === p.n ? 'font-weight:800;color:var(--red)' : ''}">${esc(nm(t.a))}→${esc(nm(t.b))}</span>`).join(' · ')}</p>
        <p class="tip">Bạn nói thấy tranh trên máy mình; bạn nghe chọn 1 trong 3 tranh. Các bạn khác cũng đoán cho vui (không tính vào kết quả đôi bạn). Bé lẻ sẽ chơi với cô. Bạn nói chỉ có 1 máy: cô nhắn riêng tranh hoặc gợi ý cho con; bạn nghe chỉ có 1 máy: con giơ ngón tay, cô bấm hộ.</p>`;
    },
    bind(st) {
      const turns = st.turns || [], n = (st.pair || {}).n || 0, run = st.run || 0;
      const go = k => setState(pairPatch(turns, k, run));
      $('#re') && ($('#re').onclick = () => { const t = pairTurns(onlineSeats()), r = run + 1; setState(Object.assign({ turns: t, run: r }, pairPatch(t, 0, r))); });
      if (!turns.length) return;
      $('#pv').onclick = () => n > 0 && go(n - 1);
      $('#nx').onclick = () => n + 1 < turns.length ? go(n + 1) : goPhase('lop');
      $('#rv') && ($('#rv').onclick = () => setState({ step: 'rv' }));
      $('#lg').onclick = () => { const t = Object.assign({}, turns[n], { l: (st.pair || {}).l === 'zh' ? 'en' : 'zh' }); const tt = turns.slice(); tt[n] = t; setState(Object.assign({ turns: tt }, pairPatch(tt, n, run))); };
    },
    qid: st => `pair_${(st.pair || {}).n || 0}_${st.run || 0}`, opts: 3,
    only: st => [(st.pair || {}).b]
  },
  lop: {
    html: st => {
      const p = st.lop || {}, turns = st.lturns || [], it = PAIR_POOL[p.k || 0], s = seatsAll(), nm = id => (s.find(x => x.id === id) || {}).kid || '…';
      if (!turns.length) return `<h2>📣 Cô giáo nhỏ</h2><p>Cần ít nhất 1 bé trong lớp.</p><div class="ctl"><button class="btn" id="re">Xếp lượt</button></div>`;
      const rv = st.step === 'rv', l = p.l === 'zh' ? 'zh' : 'en', to = l === 'zh' ? 'en' : 'zh';
      return `<h2>📣 Cô giáo nhỏ (cả lớp) · lượt ${(p.n || 0) + 1}/${turns.length}</h2>
        <p><b>${esc(nm(p.a))}</b> nói cho cả lớp 🗣️ <span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span> <span class="bigtxt ${l}">${esc(txt(it.k, l))}</span>
          → cả lớp chạm tranh, rồi cùng nói <span class="bigtxt ${to}" style="color:var(--red)">${esc(txt(it.k, to))}</span></p>
        <div class="prev">${it.o.map((k, c) => pv(pic(k, 3), k === it.k)).join('')}</div>
        <div class="ctl"><button class="btn ghost" id="pv">◀ Lượt trước</button><button class="btn ghost" id="rp">🔁 Phát lại</button>
          ${rv ? '' : '<button class="btn y" id="rv">👁 Hiện đáp án</button>'}
          <button class="btn" id="nx">${(p.n || 0) + 1 < turns.length ? 'Lượt tiếp ▶' : 'Tiếp: Đấu Rồng Lửa ▶'}</button>
          <button class="btn ghost" id="lg">Đổi sang ${l === 'zh' ? 'tiếng Anh' : 'tiếng Trung'}</button>
          <button class="btn ghost" id="re">🔀 Xếp lượt lại</button></div>
        <p class="small">Thứ tự: ${turns.map((t, j) => `<span style="${j === p.n ? 'font-weight:800;color:var(--red)' : ''}">${esc(nm(t.a))}</span>`).join(' · ')}</p>
        <p class="tip">Mỗi bạn một lượt làm cô giáo nhỏ: con thấy tranh trên máy mình và nói cho cả lớp nghe; các bạn còn lại cùng chạm 1 trong 3 tranh. Hiện đáp án xong, cả lớp cùng nói câu đó bằng tiếng kia (chuyển ngữ). Màn của bạn nói hiện "N bạn hiểu con rồi!". Bạn nói chỉ có 1 máy: cô nhắn riêng tranh cho con.</p>`;
    },
    bind(st) {
      const turns = st.lturns || [], n = (st.lop || {}).n || 0, run = st.run || 0;
      const go = k => setState(lopPatch(turns, k, run));
      $('#re').onclick = () => { const t = lopTurns(onlineSeats()), r = run + 1; setState(Object.assign({ lturns: t, run: r }, lopPatch(t, 0, r))); };
      if (!turns.length) return;
      $('#pv').onclick = () => n > 0 && go(n - 1);
      $('#rp').onclick = () => setState({ rp: (st.rp || 0) + 1 });
      $('#nx').onclick = () => n + 1 < turns.length ? go(n + 1) : goPhase('boss');
      $('#rv') && ($('#rv').onclick = () => setState({ step: 'rv' }));
      $('#lg').onclick = () => { const tt = turns.slice(); tt[n] = Object.assign({}, turns[n], { l: (st.lop || {}).l === 'zh' ? 'en' : 'zh' }); setState(Object.assign({ lturns: tt }, lopPatch(tt, n, run))); };
    },
    qid: st => `lop_${(st.lop || {}).n || 0}_${st.run || 0}`, opts: 3,
    only: st => seatsIn().map(x => x.id).filter(id => id !== (st.lop || {}).a)
  },
  boss: {
    html: st => {
      const b = st.boss || {}, info = bossInfo(room), dur = (b.dur || 120000) / 1000;
      const state = info.pre ? 'pre' : info.done ? 'done' : 'run';
      return `<h2>🐉 Cả lớp đấu Rồng Lửa (tự chơi)</h2>
        <p>Mỗi bạn tự trả lời câu hỏi ngẫu nhiên trên máy mình, câu nọ nối câu kia. Mỗi câu đúng +1 ⚡ cho anh hùng Bông. Giữa trận Rồng Lửa nổi giận kéo thanh về phía rồng, các bạn tiếp sức kéo lại; hết giờ cả lớp thắng.</p>
        <p class="tip">Trước khi bắt đầu: bấm <b>Tắt tiếng tất cả</b> trên Zoom/Meet. Trong trận các con nghe câu hỏi trên máy mình, cô không cần nói.</p>
        ${state === 'pre' ? `<p>Thời gian: ${[90, 120, 150, 180].map(x => `<button class="btn ${x === dur ? 'y' : 'ghost'} sm" data-dur="${x}">${x < 120 ? x + ' giây' : (x / 60) + ' phút'}</button>`).join(' ')}</p>
          <div class="ctl"><button class="btn red" id="bst">⚔️ Bắt đầu trận đấu</button></div>`
        : state === 'run' ? `<p class="bigtxt">⚡ ${info.H} · còn ${Math.ceil(info.left / 1000)} giây${info.surge ? ' · ⚠️ rồng nổi giận' : ''}</p>
          <div class="ctl"><button class="btn ghost" id="ben">🏁 Kết thúc ngay (cả lớp thắng)</button></div>`
        : `<p class="bigtxt">🎉 Cả lớp thắng với ⚡ ${info.H}</p>`}
        <div class="ctl">${state !== 'pre' ? '<button class="btn ghost" id="bre">↺ Đấu lại</button>' : ''}<button class="btn" id="nx">Tiếp: Nghe truyện, xếp tranh ▶</button></div>`;
    },
    bind(st) {
      const b = st.boss || {};
      $$('[data-dur]').forEach(x => x.onclick = () => setState({ boss: Object.assign({}, b, { dur: +x.dataset.dur * 1000 }) }));
      $('#bst') && ($('#bst').onclick = () => setState({ boss: { run: (b.run || 0) + 1, dur: b.dur || 120000, t0: DB.now() } }));
      $('#ben') && ($('#ben').onclick = () => setState({ boss: Object.assign({}, b, { end: true }) }));
      $('#bre') && ($('#bre').onclick = () => setState({ boss: { run: (b.run || 0), dur: b.dur || 120000 } }));
      $('#nx').onclick = () => goPhase('xep');
      clearTimeout(this._t); if (b.t0 && !b.end && DB.now() - b.t0 < (b.dur || 120000) + 1500) this._t = setTimeout(() => { if (TAB === 'lop' && (room.state || {}).ph === 'boss') draw(); }, 1000);
    },
    kid(s, st) {
      const b = st.boss || {}, pre = 'boss_' + (b.run || 0) + '_'; let a = 0, ok = 0;
      Object.entries(room.answers || {}).forEach(([q, o]) => { if (q.indexOf(pre) !== 0) return; s.ids.forEach(id => { if (o && o[id]) { a++; if (o[id].ok) ok++; } }); });
      const bx = Object.keys(((room.marks || {})[s.id] || {}).bx || {}).filter(k => k.indexOf((b.run || 0) + '_') === 0).length;
      return b.t0 ? `<span class="st ${a || bx ? 'ok' : 'none'}">⚡ ${ok} đúng / ${a} câu${bx ? ` · cô +${bx}` : ''}</span> <button class="mk" data-bx="${s.id}" title="Bé chỉ có 1 máy: con trả lời đúng trên Zoom thì cô bấm">⚡ +1</button>` : '';
    },
    kbind(st) {
      const b = st.boss || {};
      $$('[data-bx]').forEach(x => x.onclick = () => mark(x.dataset.bx, 'bx/' + (b.run || 0) + '_' + Date.now().toString(36), DB.now()));
    }
  },
  xep: {
    html: st => {
      const x = st.xep || {}, r = x.r || 0, S = XEP[r], step = x.step || 'nghe', sc = x.sc || 0, qid = `xep_${r}_${st.run || 0}`;
      const L = l => l === 'zh' ? 'tiếng Trung' : 'tiếng Anh';
      let body;
      if (step === 'nghe') body = `<div class="prev"><img class="scene-s" src="${S.scenes[sc].img}" alt=""><div><div class="small">Cảnh ${sc + 1}/4 · cô phát ${L(S.from)}</div><div class="bigtxt ${S.from}">${esc(S.scenes[sc][S.from])}</div></div></div>
        <div class="ctl"><button class="btn ghost" id="pv">◀ Cảnh trước</button><button class="btn ghost" id="rp">🔁 Đọc lại</button>
          ${sc < 3 ? '<button class="btn" id="nx">Cảnh tiếp ▶</button>' : '<button class="btn y" id="xgo">🧩 Cho các con xếp tranh</button>'}</div>`;
      else if (step === 'xep') { const done = seatsIn().filter(s => answerOf(room, s, qid)).length;
        body = `<p class="bigtxt">🧩 ${done}/${seatsIn().length} bạn đã xếp xong</p><p class="tip">Mỗi bạn thấy 4 tranh xáo, có lời ${L(S.to)} (chạm 🔊 để nghe), chạm lần lượt tranh 1→4. Bạn chỉ có 1 máy: con nói thứ tự trên Zoom, cô bấm Đúng/Chưa ở cột phải.</p>
          <div class="ctl"><button class="btn ghost" id="xback">◀ Nghe lại truyện</button><button class="btn y" id="rv">👁 Hiện đáp án</button></div>`; }
      else body = `<div class="prev"><img class="scene-s" src="${S.scenes[sc].img}" alt=""><div><div class="small">Đáp án · cảnh ${sc + 1}/4 · đọc ${L(S.to)}, cả lớp nói theo</div><div class="bigtxt ${S.to}">${esc(S.scenes[sc][S.to])}</div></div></div>
        <div class="ctl"><button class="btn ghost" id="pv">◀</button><button class="btn ghost" id="rp">🔁 Đọc lại</button>
          <button class="btn" id="nx">${sc < 3 ? 'Cảnh tiếp ▶' : r === 0 ? 'Sang lượt 2 (nghe tiếng Trung) ▶' : 'Tiếp: Huy hiệu ▶'}</button></div>`;
      return `<h2>🧩 Nghe truyện, xếp tranh · lượt ${r + 1}/2</h2><p><b>${esc(S.title)}</b>: cô phát <b>${L(S.from)}</b>, các con xếp tranh có lời <b>${L(S.to)}</b>.</p>${body}
        <div class="ctl"><button class="btn ghost sm" id="xr0">Lượt 1</button><button class="btn ghost sm" id="xr1">Lượt 2</button></div>`;
    },
    bind(st) {
      const x = st.xep || {}, r = x.r || 0, step = x.step || 'nghe', sc = x.sc || 0;
      const set = o => setState({ xep: Object.assign({ r, step, sc }, o), rp: 0 });
      $('#pv') && ($('#pv').onclick = () => sc > 0 && set({ sc: sc - 1 }));
      $('#rp') && ($('#rp').onclick = () => setState({ rp: (st.rp || 0) + 1 }));
      $('#xgo') && ($('#xgo').onclick = () => set({ step: 'xep', sc: 0 }));
      $('#xback') && ($('#xback').onclick = () => set({ step: 'nghe', sc: 0 }));
      $('#rv') && ($('#rv').onclick = () => set({ step: 'rv', sc: 0 }));
      $('#nx') && ($('#nx').onclick = () => sc < 3 ? set({ sc: sc + 1 }) : step === 'rv' ? (r === 0 ? set({ r: 1, step: 'nghe', sc: 0 }) : goPhase('badge')) : set({ sc: sc + 1 }));
      $('#xr0').onclick = () => set({ r: 0, step: 'nghe', sc: 0 }); $('#xr1').onclick = () => set({ r: 1, step: 'nghe', sc: 0 });
    },
    kid(s, st) {
      const x = st.xep || {}, qid = `xep_${x.r || 0}_${st.run || 0}`, a = answerOf(room, s, qid);
      if ((x.step || 'nghe') === 'nghe') return '';
      const px = ((((room.marks || {})[s.id] || {}).px) || {})[qid];
      return (a ? `<span class="st ${a.ok ? 'ok' : 'no'}">${a.ok ? '✓ đúng cả 4' : `○ đúng ${a.n || 0}/4 vị trí`}${a.ho ? ' (cô bấm)' : ''}</span>` : '<span class="st none">… đang xếp</span>') +
        ` <button class="mk${px && px.ok ? ' on' : ''}" data-xpx="${s.id}|1">Đúng</button><button class="mk${px && !px.ok ? ' on o' : ''}" data-xpx="${s.id}|0">Chưa</button>`;
    },
    kbind(st) {
      const x = st.xep || {}, qid = `xep_${x.r || 0}_${st.run || 0}`;
      $$('[data-xpx]').forEach(b => b.onclick = () => { const [id, v] = b.dataset.xpx.split('|'), cur = ((((room.marks || {})[id] || {}).px) || {})[qid], ok = v === '1';
        mark(id, 'px/' + qid, cur && !!cur.ok === ok ? null : { ok, n: ok ? 4 : 0, at: DB.now() }); });
    }
  },
  story: {
    html: st => {
      const i = st.scene || 0, s = STORY[i], l = st.l || 'both';
      return `<h2>📖 Truyện: ${STORY_TITLE} · cảnh ${i + 1}/${STORY.length}</h2>
        <div class="prev"><img class="scene-s" src="${sceneImg(i)}" alt=""><div><div class="bigtxt">${esc(s.en)}</div><div class="bigtxt zh" style="color:var(--red)">${esc(s.zh)}</div></div></div>
        <div class="ctl">${[['en', 'Tiếng Anh'], ['zh', 'Tiếng Trung'], ['both', 'Cả hai']].map(([k, n]) => `<button class="btn ${l === k ? 'y' : 'ghost'} sm" data-l="${k}">${n}</button>`).join('')}</div>
        <div class="ctl"><button class="btn ghost" id="pv">◀ Cảnh trước</button><button class="btn ghost" id="rp">🔁 Đọc lại</button>
          <button class="btn" id="nx">${i + 1 < STORY.length ? 'Cảnh tiếp ▶' : 'Tiếp: Phiên dịch nhí ▶'}</button></div>`;
    },
    bind(st) {
      const i = st.scene || 0;
      $$('[data-l]').forEach(b => b.onclick = () => setState({ l: b.dataset.l, rp: (st.rp || 0) + 1 }));
      $('#pv').onclick = () => i > 0 && setState({ scene: i - 1, rp: 0 });
      $('#rp').onclick = () => setState({ rp: (st.rp || 0) + 1 });
      $('#nx').onclick = () => i + 1 < STORY.length ? setState({ scene: i + 1, rp: 0 }) : goPhase('gift');
    }
  },
  gift: {
    html: st => {
      const g = st.gift || {}, k = g.k || 0, G = GIFTS[k], s = STORY[G.s], to = G.from === 'en' ? 'zh' : 'en', seats = seatsIn();
      return `<h2>🎁 Phiên dịch nhí · hộp ${k + 1}/${GIFTS.length}</h2>
        <div class="prev"><img class="scene-s" src="${sceneImg(G.s)}" alt=""><div><div class="small">Bé nghe ${G.from === 'en' ? 'tiếng Anh' : 'tiếng Trung'}:</div><div class="bigtxt ${G.from}">${esc(s[G.from])}</div>
          <div class="small">Phiên dịch sang ${to === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}:</div><div class="bigtxt ${to}" style="color:var(--red)">${esc(s[to])}</div></div></div>
        <p>Phiên dịch nhí: <select id="who"><option value="">— chưa chọn —</option>${seats.map(x => `<option value="${x.id}" ${x.id === g.seat ? 'selected' : ''}>${esc(x.kid)}</option>`).join('')}</select>
          <button class="btn ghost sm" id="rnd">🎲 Chọn ngẫu nhiên</button></p>
        <div class="ctl">${g.open ? '' : '<button class="btn y" id="op">🎁 Mở hộp quà</button>'}
          ${g.open && !g.ans ? '<button class="btn y" id="an">👂 Nghe đáp án</button>' : ''}
          <button class="btn ghost" id="rp">🔁 Phát lại</button>
          <button class="btn ghost" id="pv">◀ Hộp trước</button>
          <button class="btn" id="nx">${k + 1 < GIFTS.length ? 'Hộp tiếp ▶' : 'Tiếp: Huy hiệu ▶'}</button></div>
        <p class="tip">Chấm bé phiên dịch ở cột phải: <b>Được</b> (tự nói) · <b>Cùng cô</b> · <b>Chưa</b>.</p>`;
    },
    bind(st) {
      const g = st.gift || {}, k = g.k || 0;
      const set = o => setState({ gift: Object.assign({}, g, o) });
      $('#who').onchange = e => set({ seat: e.target.value || null });
      $('#rnd').onclick = () => set({ seat: pickRandom('pd') || null });
      $('#op') && ($('#op').onclick = () => set({ open: true }));
      $('#an') && ($('#an').onclick = () => set({ ans: true }));
      $('#rp').onclick = () => setState({ rp: (st.rp || 0) + 1 });
      $('#pv').onclick = () => k > 0 && setState({ gift: { k: k - 1, open: false, ans: false, seat: null }, rp: 0 });
      $('#nx').onclick = () => k + 1 < GIFTS.length ? setState({ gift: { k: k + 1, open: false, ans: false, seat: pickRandom('pd') || null }, rp: 0 }) : goPhase('badge');
    },
    kid(s, st) {
      const k = (st.gift || {}).k || 0, v = ((((room.marks || {})[s.id] || {}).pd) || {})[k];
      if ((st.gift || {}).seat !== s.id && v === undefined) return '';
      return [[2, 'Được', ''], [1, 'Cùng cô', ' y'], [0, 'Chưa', ' o']].map(([n, t, c]) => `<button class="mk${v === n ? ' on' + c : ''}" data-pd="${s.id}|${n}">${t}</button>`).join('');
    },
    kbind(st) { const k = (st.gift || {}).k || 0; $$('[data-pd]').forEach(b => b.onclick = () => { const [id, n] = b.dataset.pd.split('|'); const cur = ((((room.marks || {})[id] || {}).pd) || {})[k]; mark(id, 'pd/' + k, cur === +n ? null : +n); }); }
  },
  badge: {
    html: () => `<h2>🏅 Huy hiệu Bứt phá</h2><p>Màn các bé đang hiện huy hiệu cả nhóm, ảnh hoặc avatar của 6 bạn, thanh năng lượng đầy.</p>
      <p class="tip">Sau buổi: mở thẻ <b>Kết quả</b>, chấm 4H (thái độ, cảm xúc, tương tác với bạn) rồi bấm <b>Gửi về Sheet</b>.</p>
      <div class="ctl"><button class="btn red" id="kq">Xem kết quả ▶</button><button class="btn ghost" id="bk">Về phòng chờ</button></div>`,
    bind() { $('#kq').onclick = () => { TAB = 'kq'; draw(); }; $('#bk').onclick = () => setState({ ph: 'cho' }); }
  }
};
function spin(seat, l) { if (!seat) return toast('Chưa có bé nào trong lớp.'); const sp = (room.state || {}).spin || {}; setState({ spin: { seat, l, n: (sp.n || 0) + 1 } }); }
function qButtons(st, i, n, rv) {
  return `<div class="ctl"><button class="btn ghost" id="pv">◀ Câu trước</button><button class="btn ghost" id="rp">🔁 Phát lại</button>
    ${rv ? '<button class="btn ghost" id="ag">↺ Hỏi lại câu này</button>' : '<button class="btn y" id="rv">👁 Hiện đáp án</button>'}
    <button class="btn" id="nx">${i + 1 < n ? 'Câu tiếp ▶' : 'Sang phần tiếp ▶'}</button></div>`;
}
function qBind(st, n, nextPh) {
  const i = st.i || 0;
  $('#pv').onclick = () => i > 0 && setState({ i: i - 1, step: 'ask', rp: 0 });
  $('#rp').onclick = () => setState({ rp: (st.rp || 0) + 1 });
  $('#rv') && ($('#rv').onclick = () => setState({ step: 'rv' }));
  $('#ag') && ($('#ag').onclick = () => setState({ step: 'ask', run: (st.run || 0) + 1, rp: 0 }));
  $('#nx').onclick = () => i + 1 < n ? setState({ i: i + 1, step: 'ask', rp: 0 }) : goPhase(nextPh);
}

/* ---------- cột các bé ---------- */
function drawKids(st, c) {
  const seats = seatsAll(), qid = c.qid ? c.qid(st) : '', only = c.only ? c.only(st) : null;
  $('#kids').innerHTML = seats.map(s => {
    let row = '';
    if (!s.ok) row = `<button class="mk on" data-ok="${s.id}">Cho vào lớp</button><button class="mk" data-del="${s.id}">Không</button>`;
    else {
      if (qid && (!only || only.indexOf(s.id) >= 0)) {
        const a = answerOf(room, s, qid), px = ((((room.marks || {})[s.id] || {}).px) || {})[qid];
        row += a ? `<span class="st ${a.ok ? 'ok' : 'no'}">${a.ok ? '✓ đúng' : '○ chưa đúng'}${a.ho ? ' (cô bấm)' : a.ms ? ' · ' + (a.ms / 1000).toFixed(1) + 's' : ''}</span>` : '<span class="st none">… chưa chọn</span>';
        row += ' <span class="small">bấm hộ</span>' + Array.from({ length: c.opts }, (_, k) => `<button class="px${px && px.c === k + (c.opts === 4 ? 1 : 0) ? ' on' : ''}" data-px="${s.id}|${k + (c.opts === 4 ? 1 : 0)}">${k + 1}</button>`).join('');
      }
      if (c.kid) row += ' ' + c.kid(s, st);
    }
    return `<div class="kid${s.on ? '' : ' off'}${s.ok ? '' : ' wait'}"><img src="${faceOf(s)}" alt="">
      <div class="nm"><span class="dot"></span>${esc(s.kid)} ${srcTag(s)}
        <button class="ic-btn" title="Sửa tên" data-ed="${s.id}">✏️</button><button class="ic-btn" title="Ghép với chỗ khác" data-mg="${s.id}">🔗</button><button class="ic-btn" title="Cho ra khỏi lớp" data-rm="${s.id}">✖</button></div>
      <div class="meta">${esc(s.parent || 'chưa có tên ba mẹ')}${s.on ? '' : ' · chưa vào / rớt mạng'}</div>
      ${row ? `<div class="row">${row}</div>` : ''}</div>`;
  }).join('') || '<p class="small">Chưa có bé nào. Thêm bé ở thẻ Thêm bé, hoặc chờ ba mẹ nhập mã phòng.</p>';
  kidActions();
  $$('[data-px]').forEach(b => b.onclick = () => {
    const [id, k] = b.dataset.px.split('|'), cur = ((((room.marks || {})[id] || {}).px) || {})[qid];
    const ok = proxyOk(st, +k);
    mark(id, 'px/' + qid, cur && cur.c === +k ? null : { c: +k, ok, at: DB.now() });
  });
  c.kbind && c.kbind(st);
}
function proxyOk(st, k) {
  if (st.ph === 'on') return k === quizAns(QUIZ[st.i || 0]);
  if (st.ph === 'tone') return k === TONES[st.i || 0].t;
  if (st.ph === 'pair') { const it = PAIR_POOL[(st.pair || {}).k || 0]; return k === it.o.indexOf(it.k); }
  if (st.ph === 'lop') { const it = PAIR_POOL[(st.lop || {}).k || 0]; return k === it.o.indexOf(it.k); }
  return false;
}
function srcTag(s) {
  if (/^t_/.test(s.id) && s.ids.length < 2) return `<span class="tag tam" title="Chỗ ngồi tạm cô tạo, chưa có máy bé nhận">tạm</span>`;
  if (s.src === 'zoom') return '<span class="tag zoom">từ Zoom</span>';
  return '';
}
function kidActions() {
  const P = room.players || {};
  $$('[data-ok]').forEach(b => b.onclick = () => DB.set(base() + '/players/' + b.dataset.ok + '/ok', true).catch(err));
  $$('[data-del],[data-rm]').forEach(b => b.onclick = () => {
    const id = b.dataset.del || b.dataset.rm, s = seatsAll().find(x => x.id === id);
    if (b.dataset.rm && !confirm('Cho ' + (s ? s.kid : 'bé') + ' ra khỏi lớp? Kết quả đã ghi của bé vẫn giữ trong phòng nếu bé vào lại.')) return;
    (s ? s.ids : [id]).forEach(x => DB.remove(base() + '/players/' + x).catch(err));
  });
  $$('[data-ed]').forEach(b => b.onclick = () => {
    const id = b.dataset.ed, p = P[id] || {};
    const kid = prompt('Tên con', p.kid || ''); if (kid === null) return;
    const parent = prompt('Tên ba hoặc mẹ', p.parent || ''); if (parent === null) return;
    DB.update(base() + '/players/' + id, { kid: kid.trim() || p.kid, parent: parent.trim() }).catch(err);
  });
  $$('[data-mg]').forEach(b => b.onclick = () => {
    const id = b.dataset.mg, all = seatsAll().filter(x => x.id !== id);
    if (!all.length) return toast('Chưa có chỗ nào khác để ghép.');
    const pickN = prompt('Ghép bé này vào chỗ nào? Gõ số:\n' + all.map((x, j) => `${j + 1}. ${x.kid}${x.parent ? ' (' + x.parent + ')' : ''}`).join('\n'));
    const tgt = all[(+pickN || 0) - 1]; if (!tgt) return;
    const src = seatsAll().find(x => x.id === id);
    (src ? src.ids : [id]).forEach(x => DB.update(base() + '/players/' + x, { seat: tgt.id }).catch(err));
    toast('Đã ghép vào chỗ của ' + tgt.kid);
  });
}

/* ======================= Thêm bé ======================= */
let parsed = [];
function drawAdd() {
  const st = room.state || {}, wait = seatsAll().filter(s => !s.ok);
  $('#body').innerHTML = `<div class="co-grid" style="grid-template-columns:minmax(0,1fr) 400px"><div>
    <div class="panel" style="margin-bottom:12px"><h3>Dán danh sách người tham gia Zoom</h3>
      <p class="small">Trong Zoom: Người tham gia → chọn tên → chép. Mỗi dòng một người. Web tự tách tên con và tên ba mẹ (ví dụ "Bin - Mẹ Hoa", "Mẹ Bống", "Na (bố Tuấn)"). Cô kiểm tra lại trước khi thêm.</p>
      <textarea id="paste" rows="6" style="width:100%;padding:10px;border:2px solid var(--line);border-radius:12px" placeholder="Bin - Mẹ Hoa&#10;Mẹ Bống&#10;Na (bố Tuấn)"></textarea>
      <div class="ctl"><button class="btn ghost" id="ps">Tách tên</button></div>
      <div id="pres"></div></div>
    <div class="panel"><h3>Gõ nhanh</h3><div class="two"><label class="field"><span>Tên con</span><input id="qk"></label><label class="field"><span>Tên ba hoặc mẹ</span><input id="qp"></label></div>
      <button class="btn" id="qa">Thêm bé</button>
      <p class="small">Chỗ ngồi tạm vẫn ghi đủ kết quả (cô bấm hộ). Khi bé vào bằng mã phòng với đúng tên, máy bé tự nhận chỗ này.</p></div>
  </div><div class="panel"><h3>Bé tự vào bằng mã phòng</h3>
    <label class="toggle"><input type="checkbox" id="dy" ${st.duyet ? 'checked' : ''}> Cô duyệt từng bé</label>
    <div class="kids" id="kids" style="margin-top:10px"></div></div></div>`;
  $('#dy').onchange = e => setState({ duyet: e.target.checked });
  $('#ps').onclick = () => { parsed = parseZoomList($('#paste').value); drawParsed(); };
  $('#qa').onclick = () => { const k = $('#qk').value.trim(); if (!k) return toast('Cô gõ tên con nhé.'); addSeats([{ kid: k, parent: $('#qp').value.trim(), src: 'go' }]); $('#qk').value = ''; $('#qp').value = ''; $('#qk').focus(); };
  drawKids(st, {});
  if (parsed.length) drawParsed();
}
function drawParsed() {
  $('#pres').innerHTML = parsed.length ? `<table class="res parse"><tr><th></th><th>Tên con</th><th>Tên ba mẹ</th><th>Dòng gốc</th></tr>${parsed.map((r, j) => `<tr>
    <td><input type="checkbox" data-j="${j}" ${r.use ? 'checked' : ''}></td><td><input data-k="${j}" value="${esc(r.kid)}"></td><td><input data-p="${j}" value="${esc(r.parent)}"></td>
    <td class="small">${esc(r.raw)}${r.note ? `<br><b style="color:var(--orange)">${esc(r.note)}</b>` : ''}</td></tr>`).join('')}</table>
    <div class="ctl"><button class="btn" id="addAll">Thêm ${parsed.filter(r => r.use).length} bé vào lớp</button></div>` : '<p class="small">Không tách được dòng nào.</p>';
  $$('[data-j]').forEach(x => x.onchange = () => { parsed[x.dataset.j].use = x.checked; });
  $$('[data-k]').forEach(x => x.oninput = () => { parsed[x.dataset.k].kid = x.value; });
  $$('[data-p]').forEach(x => x.oninput = () => { parsed[x.dataset.p].parent = x.value; });
  $('#addAll') && ($('#addAll').onclick = () => { const rows = parsed.filter(r => r.use && r.kid.trim()); addSeats(rows.map(r => ({ kid: r.kid.trim(), parent: r.parent.trim(), src: 'zoom' }))); parsed = []; $('#paste').value = ''; drawParsed(); });
}
function addSeats(rows) {
  const P = room.players || {}, have = seatsAll();
  let n = 0;
  rows.forEach((r, j) => {
    if (have.some(s => normName(s.kid) === normName(r.kid) && (!r.parent || !s.parent || normName(s.parent) === normName(r.parent)))) return;   // đã có
    const id = 't_' + rid();
    DB.set(base() + '/players/' + id, { kid: r.kid, parent: r.parent || '', ava: AVATARS[(Object.keys(P).length + j) % AVATARS.length].id, src: r.src, ok: true, ord: DB.now() + j, t: DB.now() }).catch(err);
    n++;
  });
  toast(n ? `Đã thêm ${n} bé.` : 'Các bé này đã có trong lớp.');
}
/* Tách tên con / tên ba mẹ từ tên hiển thị trên Zoom */
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
    let dev = s.match(DEV);
    if (dev) { const m = s.match(/của\s+(.+)$/i); parent = m ? m[1].trim() : ''; note = 'Tên máy: cô gõ tên con'; out.push({ raw, kid: '', parent, use: false, note }); return; }
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

/* ======================= Kết quả ======================= */
function allQids() {
  const s = new Set(Object.keys(room.answers || {}));
  Object.values(room.marks || {}).forEach(m => Object.keys((m && m.px) || {}).forEach(q => s.add(q)));
  return [...s];
}
function latest(seat, prefix, qids) {
  const re = new RegExp('^' + prefix + '_(\\d+)$');
  return qids.filter(q => re.test(q)).sort((a, b) => +b.match(re)[1] - +a.match(re)[1]).map(q => answerOf(room, seat, q)).find(Boolean) || null;
}
function xepRes(seat, r, qids) { const a = latest(seat, 'xep_' + r, qids); return a ? (a.ok ? 'đúng cả 4' : `${a.n || 0}/4 vị trí`) : ''; }
function results() {
  const st = room.state || {}, qids = allQids(), M = room.marks || {}, plog = st.plog || {}, llog = st.llog || {};
  return seatsIn().map(s => {
    const m = M[s.id] || {}, r = { id: s.id, kid: s.kid, parent: s.parent, web: s.web || '', src: /^t_/.test(s.id) && s.ids.length < 2 ? 'chỗ tạm' : s.src === 'zoom' ? 'từ Zoom' : 'tự vào' };
    const c = { en: [0, 0], zh: [0, 0], doc: [0, 0] }, times = [], det = { on: [], tone: [], pair: [] };
    QUIZ.forEach((q, i) => { const a = latest(s, 'on_' + i, qids), L = quizLang(q); c[L][1]++; if (a && a.ok) c[L][0]++; if (a && a.ms && !a.ho) times.push(a.ms); det.on.push(a ? (a.ok ? 1 : 0) : null); });
    let tOk = 0; const g = { 2: 0, 1: 0, 0: 0 };
    TONES.forEach((x, i) => { const a = latest(s, 'tone_' + i, qids); if (a && a.ok) tOk++; if (a && a.ms && !a.ho) times.push(a.ms); det.tone.push(a ? (a.ok ? 1 : 0) : null); const v = (m.tone || {})[i]; if (v !== undefined && v !== null) g[v]++; });
    let say = [0, 0], hear = [0, 0];
    Object.entries(plog).forEach(([key, t]) => {
      if (!t) return;
      const listener = seatsIn().find(x => x.id === t.b), a = listener ? answerOf(room, listener, 'pair_' + key) : (t.b === 'co' ? { ok: true, co: 1 } : null);
      if (!a) return;
      if (t.a === s.id && t.b !== 'co') { say[1]++; if (a.ok) say[0]++; }
      if (t.b === s.id) { hear[1]++; if (a.ok) hear[0]++; det.pair.push({ k: PAIR_POOL[t.k].k, l: t.l, ok: a.ok ? 1 : 0 }); }
    });
    let bA = 0, bOk = 0; const bpre = 'boss_' + ((st.boss || {}).run || 0) + '_';
    Object.entries(room.answers || {}).forEach(([q, o]) => { if (q.indexOf(bpre) !== 0) return; s.ids.forEach(id => { if (o && o[id]) { bA++; if (o[id].ok) bOk++; } }); });
    let lSay = [0, 0], lHear = [0, 0];
    Object.entries(llog).forEach(([key, t]) => {
      if (!t) return;
      const qid = 'lop_' + key, others = seatsIn().filter(x => x.id !== t.a);
      if (t.a === s.id) { const ans = others.map(x => answerOf(room, x, qid)).filter(Boolean); if (ans.length) { lSay[1] += ans.length; lSay[0] += ans.filter(a => a.ok).length; } }
      else { const a = answerOf(room, s, qid); if (a) { lHear[1]++; if (a.ok) lHear[0]++; } }
    });
    const pd = Object.values(m.pd || {}).filter(v => v !== null && v !== undefined), h = m.h || {}, intro = m.intro || {};
    const lv = v => v === 2 ? 'tự nói' : v === 1 ? 'nói cùng cô' : '';
    Object.assign(r, {
      onEN: `${c.en[0]}/${c.en[1]}`, onZH: `${c.zh[0]}/${c.zh[1]}`, doc: `${c.doc[0]}/${c.doc[1]}`,
      tg: times.length ? (times.reduce((x, y) => x + y, 0) / times.length / 1000).toFixed(1) : '',
      toneChon: `${tOk}/${TONES.length}`, toneCham: (g[2] + g[1] + g[0]) ? `chuẩn ${g[2]} · gần ${g[1]} · cần luyện ${g[0]}` : '',
      doiNoi: say[1] ? `${say[0]}/${say[1]}` : '', doiNghe: hear[1] ? `${hear[0]}/${hear[1]}` : '',
      boss: bA ? `${bOk}/${bA}` : '',
      xep0: xepRes(s, 0, qids), xep1: xepRes(s, 1, qids),
      lopNoi: lSay[1] ? `${lSay[0]}/${lSay[1]} bạn hiểu` : '', lopNghe: lHear[1] ? `${lHear[0]}/${lHear[1]}` : '',
      chaoEN: lv(intro.en), chaoZH: lv(intro.zh), pd: pd.length ? pd.map(v => ['chưa', 'cùng cô', 'được'][v]).join(', ') : '',
      h1: h.td ?? '', h2: h.cx ?? '', h3: h.tt ?? '', note: m.note || '', detail: JSON.stringify(det)
    });
    return r;
  });
}
const COLS = [['kid', 'Tên con'], ['parent', 'Ba/mẹ'], ['src', 'Vào lớp'], ['onEN', 'Ôn nhanh EN'], ['onZH', 'Ôn nhanh ZH'], ['doc', 'Nhìn chữ'], ['tg', 'TB phản hồi (giây)'],
  ['toneChon', 'Thanh điệu chọn đúng'], ['toneCham', 'Cô chấm thanh điệu'], ['doiNoi', 'Đôi bạn: bạn hiểu con nói'], ['doiNghe', 'Đôi bạn: con nghe đúng'], ['lopNoi', 'Cô giáo nhỏ: cả lớp hiểu con nói'], ['lopNghe', 'Cô giáo nhỏ: con nghe bạn đúng'], ['boss', 'Đấu Rồng Lửa: đúng/câu'], ['xep0', 'Xếp tranh (nghe EN, xếp ZH)'], ['xep1', 'Xếp tranh (nghe ZH, xếp EN)'],
  ['chaoEN', 'Chào bạn EN'], ['chaoZH', 'Chào bạn ZH']];
function drawResults() {
  const rows = results();
  const sel = (id, k, v) => `<div class="h4">${[2, 1, 0].map(n => { const L = H4[k].lv[n]; return `<button class="h4b l${n}${String(v) === String(n) ? ' on' : ''}" data-h="${id}|${k}|${n}" title="${esc(L[1])}">${n} · ${esc(L[0])}</button>`; }).join('')}</div>`;
  $('#body').innerHTML = `<div style="padding:12px 14px 40px"><div class="panel">
    <h3>Kết quả phòng ${CODE} · ${esc((room.state || {}).ngay || today())}</h3>
    <p class="small">Mỗi bé một dòng, tách EN và ZH. Chưa trả lời không tính là sai. 4H điều chỉnh: thái độ, cảm xúc, tương tác với bạn (0–2).</p>
    <div class="ctl"><button class="btn" id="send">📤 Gửi về Sheet</button><button class="btn ghost" id="csv">⬇ Tải CSV</button><button class="btn ghost" id="ph">🗑 Xóa ảnh các con khỏi phòng</button></div>
    <div id="sendMsg"></div>
    <details class="h4-guide" open><summary>Mốc chấm 4H (bấm một mốc, bấm lại để bỏ)</summary><div class="two" style="grid-template-columns:repeat(3,1fr)">${Object.values(H4).map(h => `<div><b>${h.n}</b>${[2, 1, 0].map(n => `<div class="small"><b>${n} · ${esc(h.lv[n][0])}</b>: ${esc(h.lv[n][1])}</div>`).join('')}</div>`).join('')}</div></details>
    <div class="scroll-x"><table class="res"><tr>${COLS.map(c => `<th>${c[1]}</th>`).join('')}<th>Thái độ</th><th>Cảm xúc</th><th>Tương tác</th><th>Ghi chú của cô</th></tr>
    ${rows.map(r => `<tr>${COLS.map(c => `<td>${esc(r[c[0]])}</td>`).join('')}<td>${sel(r.id, 'td', r.h1)}</td><td>${sel(r.id, 'cx', r.h2)}</td><td>${sel(r.id, 'tt', r.h3)}</td>
      <td><textarea data-note="${r.id}">${esc(r.note)}</textarea></td></tr>`).join('') || `<tr><td colspan="${COLS.length + 4}">Chưa có bé nào.</td></tr>`}</table></div></div></div>`;
  $$('[data-h]').forEach(x => x.onclick = () => { const [id, k, n] = x.dataset.h.split('|'), cur = ((((room.marks || {})[id] || {}).h) || {})[k]; mark(id, 'h/' + k, cur === +n ? null : +n); });
  $$('[data-note]').forEach(x => x.onchange = () => mark(x.dataset.note, 'note', x.value.trim() || null));
  $('#csv').onclick = () => downloadCSV(results());
  $('#send').onclick = sendSheet;
  $('#ph').onclick = () => {
    if (!confirm('Xóa ảnh của các con khỏi phòng này? Lớp sẽ hiện avatar thay cho ảnh.')) return;
    Object.entries(room.players || {}).forEach(([id, p]) => { if (p && p.photo) DB.set(base() + '/players/' + id + '/photo', null).catch(err); });
    toast('Đã xóa ảnh khỏi phòng.');
  };
}
/* Mốc chấm 4H điều chỉnh cho buổi Zoom (0–2). Sửa câu chữ ở đây nếu cô muốn đổi mốc. */
const H4 = {
  td: { n: 'Thái độ', lv: { 2: ['Tự giác', 'Tập trung gần cả buổi, tự chạm và trả lời ngay khi cô hỏi'], 1: ['Khi nhắc', 'Tham gia khi cô gọi tên hoặc ba mẹ nhắc, lúc tập trung lúc xao nhãng'], 0: ['Cần hỗ trợ', 'Chưa muốn tham gia, ba mẹ phải làm cùng hoặc con rời màn hình'] } },
  cx: { n: 'Cảm xúc', lv: { 2: ['Hào hứng', 'Vui, cười, hăng hái, muốn được chọn, khoe khi đúng'], 1: ['Bình thường', 'Lúc đầu còn ngại, vui dần lên hoặc bình thản cả buổi'], 0: ['Còn ngại', 'Rụt rè, lo lắng, không muốn nói hoặc muốn dừng sớm'] } },
  tt: { n: 'Tương tác với bạn', lv: { 2: ['Chủ động', 'Tự hỏi, đáp bạn, chơi đôi bạn tốt, cổ vũ bạn'], 1: ['Khi cô gợi ý', 'Hỏi, đáp bạn khi cô mời; chơi đôi bạn được nhưng còn chờ cô'], 0: ['Chưa', 'Chưa nói với bạn, chưa tham gia trò đôi bạn'] } }
};
function h4Txt(k, v) { return v === '' || v === undefined || v === null ? '' : `${v} – ${H4[k].lv[v][0]}`; }
function csvRows(rows) {
  const head = ['Mã phòng', 'Ngày', 'Mã chỗ ngồi', 'Mã bé web 21 ngày'].concat(COLS.map(c => c[1]), ['Thái độ', 'Cảm xúc', 'Tương tác', 'Ghi chú', 'Chi tiết']);
  const date = (room.state || {}).ngay || today();
  return [head].concat(rows.map(r => [CODE, date, r.id, r.web].concat(COLS.map(c => r[c[0]]), [h4Txt('td', r.h1), h4Txt('cx', r.h2), h4Txt('tt', r.h3), r.note, r.detail])));
}
function downloadCSV(rows) {
  const csv = '﻿' + csvRows(rows).map(r => r.map(v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `lop-zoom-${CODE}-${today()}.csv`; a.click();
}
async function sendSheet() {
  const m = $('#sendMsg'); m.innerHTML = '<p class="msg">Đang gửi…</p>';
  try {
    const j = await apiPost({ action: 'zoom', room: CODE, ngay: (room.state || {}).ngay || today(), lop: 'Little Seed · Vòng 2', rows: csvRows(results()) });
    m.innerHTML = j && j.ok ? `<p class="msg">Đã ghi ${j.n} dòng vào tab "Lớp Zoom" của Sheet.</p>` : '<p class="msg err">Máy chủ chưa nhận. Có thể máy chủ Apps Script chưa lên bản mới (v15). Cô bấm Tải CSV để giữ kết quả.</p>';
  } catch (e) { m.innerHTML = '<p class="msg err">Chưa gửi được (mạng hoặc máy chủ chưa cập nhật). Cô bấm Tải CSV để giữ kết quả.</p>'; }
}

/* ======================= khởi động ======================= */
(async function () {
  try { await DB.init(); } catch (e) { console.error(e); app.innerHTML = '<div class="wrap"><div class="card"><h2>Chưa kết nối được Firebase</h2><p>' + esc(e.message || e) + '</p></div></div>'; return; }
  DB.onConn(ok => $('#net').classList.toggle('off', !ok));
  const q = QS.get('phong'); if (q) return openRoom(q);
  homeScreen();
})();
