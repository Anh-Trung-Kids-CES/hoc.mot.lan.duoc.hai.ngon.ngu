/* Lớp Zoom – màn của con (và màn chiếu cô chia sẻ trên Zoom: ?chieu=<mã phòng>).
   Bé chỉ chạm và nói, 3 tranh, giọng cô Hươu, không bảng xếp hạng: chỉ có thanh năng lượng chung của nhóm. */

const CHIEU = QS.get('chieu') || '';
const PREP = QS.has('chuan-bi');
const app = $('#app');
const HUOU = TN + 'nhan-vat/huou_huou1_a.webp';
let ME = lsGet('lz-me', null);
let CODE = '', room = {}, mySeat = '', joined = false;
let lastStageKey = '', lastAudioKey = '', shownAt = 0, localPick = {};
let spinSeen = null, spinLanded = null, wheelAngle = 0, confettiDone = false;
let muted = CHIEU ? !!lsGet('lz-chieu-mute', false) : false;

function play(list, v) { if (!muted) SND.play(list, v); }
/* Tiếng chỉ phát ở máy cô (mặc định): máy các con im lặng để Zoom không bị vọng tiếng;
   riêng tiếng mẫu bí mật của bạn đang nói (priv) vẫn phát nhỏ trên máy bạn đó, màn chiếu không phát. */
function amCo() { return ((room && room.state) || {}).amCo !== false; }

/* ---------- thông tin có sẵn trên máy (đã đăng nhập web 21 ngày, hoặc đã chuẩn bị vào lớp) ---------- */
function prefill() {
  const me = ME || {}, kid = lsGet('lle-kid', null), prog = lsGet('lle-progress-v2', null);
  let ava = me.ava;
  if (!ava && prog && prog._shop && prog._shop.ava) { const a = prog._shop.ava; ava = a.o ? `qua/ava_${a.c}_${a.o}.webp` : a.c; }
  return { kid: me.kid || (kid && kid.name) || '', parent: me.parent || '', ava: ava || 'bong', photo: me.photo || '', ok: !!me.ok, web: (kid && kid.id) || me.web || '' };
}

/* ---------- form thông tin của con (dùng cho "Chuẩn bị vào lớp" và lúc vào lớp lần đầu) ---------- */
function profileForm(title, btnText, onDone) {
  const f = prefill();
  let ava = f.ava, photo = f.photo, photoBig = '';
  const avas = AVATARS.slice();
  if (ava.indexOf('/') >= 0) avas.unshift({ id: ava, n: 'Của con', img: avaImg(ava) });
  app.innerHTML = `<div class="wrap"><form class="card" id="pf">
    <h2>${esc(title)}</h2>
    <label class="field"><span>Tên của con</span><input id="fKid" autocomplete="off" value="${esc(f.kid)}" placeholder="Ví dụ: Bông"></label>
    <label class="field"><span>Tên ba hoặc mẹ</span><input id="fPar" autocomplete="off" value="${esc(f.parent)}" placeholder="Ví dụ: Mẹ Hoa"></label>
    <div class="field"><span>Con tự chọn bạn đồng hành nhé</span><div class="ava-grid" id="avaG">
      ${avas.map(a => `<button type="button" data-a="${esc(a.id)}" class="${a.id === ava ? 'on' : ''}"><img src="${a.img}" alt="">${esc(a.n)}</button>`).join('')}
    </div></div>
    <div class="field"><span>Ảnh của con <small class="small">(không bắt buộc)</small></span>
      <div class="photo-row"><img id="pv" class="${photo ? '' : 'hide'}" src="${esc(photo)}" alt="">
        <label class="btn ghost" style="font-size:16px">📷 Chọn ảnh<input type="file" id="fPh" accept="image/*" hidden></label>
        <button type="button" class="btn ghost ${photo ? '' : 'hide'}" id="phDel" style="font-size:16px">Bỏ ảnh</button></div>
      <label class="chk"><input type="checkbox" id="fOk" ${f.ok ? 'checked' : ''}><span>Đồng ý cho các bạn trong lớp thấy ảnh con. Không tích thì cả lớp thấy bạn đồng hành con chọn.</span></label>
    </div>
    <div id="pfMsg"></div>
    <button class="btn wide" id="pfGo">${esc(btnText)}</button>
  </form></div>`;
  $('#avaG').onclick = e => { const b = e.target.closest('button'); if (!b) return; ava = b.dataset.a; SND.beep('pop'); $$('#avaG button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#fPh').onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    try { photo = await shrinkPhoto(file, 200); photoBig = await shrinkPhoto(file, 480); $('#pv').src = photo; $('#pv').classList.remove('hide'); $('#phDel').classList.remove('hide'); }
    catch (er) { $('#pfMsg').innerHTML = '<p class="msg err">Không mở được ảnh này. Ba mẹ chọn ảnh khác nhé.</p>'; }
  };
  $('#phDel').onclick = () => { photo = ''; photoBig = ''; $('#pv').classList.add('hide'); $('#phDel').classList.add('hide'); };
  $('#pf').onsubmit = e => {
    e.preventDefault(); SND.unlock();
    const kid = $('#fKid').value.trim(), parent = $('#fPar').value.trim();
    if (!kid) return $('#pfMsg').innerHTML = '<p class="msg err">Ba mẹ nhập tên của con nhé.</p>';
    ME = { kid, parent, ava, photo, ok: $('#fOk').checked, web: f.web, t: Date.now() };
    lsSet('lz-me', ME);
    onDone(photoBig);
  };
}

/* ---------- Chuẩn bị vào lớp (trước buổi học) ---------- */
function prepScreen() {
  profileForm('Chuẩn bị vào lớp Zoom', 'Lưu thông tin', async photoBig => {
    app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center"><img class="huou" src="${HUOU}" alt="">
      <h2>Xong rồi!</h2><p class="vn">Đến giờ học, ba mẹ mở lại đúng link này trên máy con dùng, nhập <b>mã phòng 4 số</b> cô hiện trên Zoom là con vào lớp.</p>
      <p class="vn small">Nhớ chuẩn bị 2 máy: một máy vào Zoom, một máy mở trang này. Chỉ có 1 máy cũng không sao, con giơ ngón tay 1-2-3 để cô bấm hộ.</p>
      <button class="btn ghost" id="again">Sửa thông tin</button></div></div>`;
    $('#again').onclick = prepScreen;
    try { await apiPost({ action: 'zoomhs', kid: ME.kid, parent: ME.parent, ava: ME.ava, ok: ME.ok, photo: ME.ok ? photoBig || '' : '', web: ME.web || '', khoa: 'seed', vong: 2 }); } catch (e) { /* máy chủ chưa cập nhật: thông tin vẫn lưu trên máy */ }
  });
}

/* ---------- nhập mã phòng ---------- */
function codeScreen(msg) {
  const pre = (QS.get('phong') || '').replace(/\D/g, '').slice(0, 4);
  app.innerHTML = `<div class="wrap"><form class="card" id="cf" style="text-align:center">
    <img class="huou" src="${HUOU}" alt="">
    <h2>Mã phòng</h2><p class="vn small" style="margin-top:-6px">Ba mẹ nhập 4 số cô hiện trên màn Zoom</p>
    <div class="code-in">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Số ${i + 1}" value="${pre[i] || ''}">`).join('')}</div>
    <div>${msg ? `<p class="msg err">${esc(msg)}</p>` : ''}</div>
    <button class="btn wide red">Vào lớp</button>
    <p style="margin:16px 0 0"><a class="vn small" href="?chuan-bi">Chuẩn bị vào lớp trước (tên con, ảnh, bạn đồng hành)</a></p>
  </form></div>`;
  const ins = $$('.code-in input');
  ins.forEach((el, i) => {
    el.oninput = () => { el.value = el.value.replace(/\D/g, '').slice(-1); if (el.value && ins[i + 1]) ins[i + 1].focus(); };
    el.onkeydown = e => { if (e.key === 'Backspace' && !el.value && ins[i - 1]) ins[i - 1].focus(); };
    el.onpaste = e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, ''); if (t.length >= 4) { e.preventDefault(); ins.forEach((x, j) => x.value = t[j] || ''); } };
  });
  (ins.find(x => !x.value) || ins[3]).focus();
  $('#cf').onsubmit = async e => {
    e.preventDefault(); SND.unlock();
    const code = ins.map(x => x.value).join('');
    if (!/^\d{4}$/.test(code)) return codeScreen('Mã phòng có 4 số. Ba mẹ nhập lại giúp cô nhé.');
    let t = null;
    try { t = await DB.get(roomPath(code) + '/teacher'); } catch (er) { return codeScreen('Mạng đang chập chờn. Ba mẹ thử lại nhé.'); }
    if (!t) return codeScreen('Chưa thấy phòng ' + code + '. Ba mẹ xem lại mã trên màn Zoom của cô nhé.');
    CODE = code;
    if (ME && ME.kid) confirmScreen(); else profileForm('Thông tin của con', 'Vào lớp', () => join());
  };
}
function confirmScreen() {
  app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center">
    <img src="${faceOf(ME.ok ? ME : { ava: ME.ava })}" alt="" style="width:120px;height:120px;border-radius:50%;object-fit:cover;background:var(--yellow-soft)">
    <h2>Chào con, ${esc(ME.kid)}!</h2>${ME.parent ? `<p class="vn small">Ba/mẹ: ${esc(ME.parent)}</p>` : ''}
    <button class="btn wide red" id="go">Vào lớp</button>
    <p><button class="btn ghost" id="edit" style="font-size:16px">Không phải con / sửa thông tin</button></p></div></div>`;
  $('#go').onclick = () => { SND.unlock(); join(); };
  $('#edit').onclick = () => profileForm('Thông tin của con', 'Vào lớp', () => join());
}

/* ---------- vào lớp ---------- */
async function join() {
  app.innerHTML = '<div class="wrap"><div class="card"><p>Đang vào lớp…</p></div></div>';
  const base = roomPath(CODE), uid = DB.uid;
  try {
    const [players, st] = await Promise.all([DB.get(base + '/players'), DB.get(base + '/state')]);
    const P = players || {}, mine = P[uid];
    let seat = (mine && mine.seat) || lsGet('lz-seat-' + CODE, '');
    if (seat === uid || (seat && !P[seat]) || (seat && !(mine && mine.seat) && normName((P[seatOf(P, seat)] || {}).kid) !== normName(ME.kid))) seat = '';
    if (!seat) {   // nhận chỗ cô đã tạo, hoặc chỗ cũ khi vào lại bằng máy khác (trùng tên con, không đang trực tuyến)
      const nk = normName(ME.kid), np = normName(ME.parent);
      const c = buildSeats(P).filter(s => s.id !== uid && s.ids.indexOf(uid) < 0 && normName(s.kid) === nk && (!np || !s.parent || normName(s.parent) === np) && !s.on);
      if (c.length) seat = (c.find(s => /^t_/.test(s.id)) || c[0]).id;
    }
    const me = { kid: ME.kid, parent: ME.parent || '', ava: ME.ava || 'bong', photo: (ME.ok && ME.photo) ? ME.photo : null, on: true, t: (mine && mine.t) || DB.now(), web: ME.web || '' };
    if (!mine) { me.src = seat ? 'nhan-cho' : 'tu-vao'; me.ord = DB.now(); if (st && st.duyet && !seat) me.ok = false; }
    if (seat) me.seat = seat;
    await DB.update(base + '/players/' + uid, me);
    DB.onDisc(base + '/players/' + uid + '/on', false);
    lsSet('lz-seat-' + CODE, seat || uid);
    lsSet('lz-room', { code: CODE, t: Date.now() });
  } catch (er) { console.error(er); return codeScreen('Chưa vào được lớp. Ba mẹ thử lại nhé.'); }
  joined = true;
  try { navigator.wakeLock && navigator.wakeLock.request('screen'); } catch (e) { }
  $('#topInfo').innerHTML = `<span class="pill y" id="saoPill">⭐ 0</span> <span class="pill">${esc(ME.kid)} · Phòng ${CODE}</span>`; starPill();
  DB.on(base, v => { room = v || {}; render(); });
}
function watchConn() {
  DB.onConn(ok => {
    $('#net').classList.toggle('off', !ok);
    if (ok && joined && !CHIEU) { DB.set(roomPath(CODE) + '/players/' + DB.uid + '/on', true).catch(() => { }); DB.onDisc(roomPath(CODE) + '/players/' + DB.uid + '/on', false); }
  });
}

/* ======================= màn lớp học ======================= */
function seatName(seats, id) { if (id === 'co') return 'Cô'; const s = seats.find(x => x.id === id); return s ? s.kid : '…'; }
function seatFace(seats, id) { if (id === 'co') return HUOU; const s = seats.find(x => x.id === id); return s ? faceOf(s) : HUOU; }
function myAnswer(qid) {
  if (localPick[qid]) return localPick[qid];
  if (!mySeat) return null;
  const seat = buildSeats(room.players).find(s => s.id === mySeat);
  return seat ? answerOf(room, seat, qid) : null;
}
function countAnswered(qid, seats, only) {
  let n = 0; seats.forEach(s => { if (only && only.indexOf(s.id) < 0) return; if (answerOf(room, s, qid)) n++; }); return n;
}

function render() {
  const st = room.state || { ph: 'cho' }, players = room.players || {};
  const meNode = players[DB.uid];
  if (!CHIEU && (!meNode || !meNode.kid)) return removed();
  mySeat = CHIEU ? '' : seatOf(players, DB.uid);
  const seats = buildSeats(players).filter(s => s.ok);
  const waiting = !CHIEU && meNode.ok === false;
  if (!$('#stage')) app.innerHTML = `<div class="room${CHIEU ? ' chieu' : ''}"><div id="en"></div><div class="stage" id="stage"></div><div class="friends" id="friends"></div></div>`;
  $('#en').innerHTML = energyHTML(energy(room));
  $('#friends').innerHTML = seats.map(s => `<div class="face${s.id === mySeat ? ' me' : ''}${s.on ? '' : ' off'}"><img src="${faceOf(s)}" alt=""><span>${esc(s.id === mySeat ? 'Con' : s.kid)}</span></div>`).join('') || '<span class="small">Các bạn đang vào lớp…</span>';
  const v = waiting ? { key: 'wait', html: viewWait() } : view(st, seats);
  if (v.key !== lastStageKey) {
    lastStageKey = v.key; shownAt = performance.now();
    $('#stage').innerHTML = v.html; v.bind && v.bind();
  } else if (v.update) v.update();
  if (v.audio && v.akey !== lastAudioKey) {
    lastAudioKey = v.akey;
    if (CHIEU) { if (!v.priv) play(v.audio); }
    else if (v.priv) play(v.audio, amCo() ? 0.45 : 1);
    else if (!amCo()) play(v.audio);
  }
}
function removed() {
  joined = false;
  app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center"><img class="huou" src="${HUOU}" alt=""><h2>Con đã ra khỏi phòng ${esc(CODE)}</h2>
    <p class="vn small">Nếu ba mẹ chưa muốn rời lớp, bấm Vào lại nhé.</p><button class="btn red" id="re">Vào lại</button></div></div>`;
  $('#re').onclick = () => join();
}
function viewWait() { return `<img class="huou" src="${HUOU}" alt=""><h1>Cô đang mời con vào lớp…</h1><p class="sub">Con chờ cô một chút nhé.</p>`; }

function view(st, seats) {
  switch (st.ph) {
    case 'intro': return vIntro(st, seats);
    case 'on': return vQuiz(st, seats);
    case 'tone': return vTone(st, seats);
    case 'pair': return vPair(st, seats);
    case 'lop': return vLop(st, seats);
    case 'story': return vStory(st);
    case 'gift': return vGift(st, seats);
    case 'badge': return vBadge(st, seats);
    default: {
      const name = CHIEU ? '' : ', ' + (ME && ME.kid || '');
      return { key: 'cho', akey: 'cho', audio: CHIEU ? null : [hd('Chào con! Cô là cô Hươu.'), 300, hd('Con chờ cô một chút nhé, các bạn đang vào lớp.')],
        html: `<img class="huou" src="${HUOU}" alt=""><h1>Chào con${esc(name)}!</h1><p class="sub">${CHIEU ? `Ba mẹ mở trang lớp Zoom và nhập mã phòng <b>${esc(CHIEU)}</b>` : 'Cô sắp bắt đầu. Các bạn đang vào lớp.'}</p>` };
    }
  }
}

/* --- Chào bạn mới: vòng quay chọn bạn --- */
function vIntro(st, seats) {
  const sp = st.spin || {}, l = sp.l === 'zh' ? 'zh' : 'en', N = seats.length;
  const idx = Math.max(0, seats.findIndex(s => s.id === sp.seat));
  const target = sp.n ? -idx * 360 / Math.max(1, N) + 360 * (4 + sp.n) : 0;
  const landed = !sp.n || spinLanded === sp.n;
  const key = 'intro|' + seats.map(s => s.id).join(',') + '|' + (sp.n || 0) + '|' + (landed ? 1 : 0) + '|' + l;
  const ring = seats.map((s, j) => {
    const a = j * 2 * Math.PI / Math.max(1, N);
    return `<div class="seat" style="left:${50 + 36 * Math.sin(a)}%;top:${50 - 36 * Math.cos(a)}%"><img src="${faceOf(s)}" alt=""><b>${esc(s.kid)}</b></div>`;
  }).join('');
  let under = '<p class="sub">Cô quay vòng chọn bạn nhé!</p>', audio = sp.n ? null : [hd('Cô quay vòng chọn bạn nhé!')], akey = sp.n ? key : 'intro0';
  if (sp.n && landed && sp.seat) {
    const me = sp.seat === mySeat;
    under = `<div class="chosen-card"><img src="${seatFace(seats, sp.seat)}" alt=""><b>${esc(seatName(seats, sp.seat))}</b></div>` +
      (me ? `<div class="my-turn">Đến lượt con!</div><button class="say ${l}" data-a="${INTRO.model[l].a}"><span class="ic">🔊</span><span class="${l}">${esc(INTRO.model[l].t)}</span></button>`
          : `<p class="sub">Cả lớp cùng hỏi bạn:</p><button class="say ${l}" data-a="${INTRO.ask[l].a}"><span class="ic">🔊</span><span class="${l}">${esc(INTRO.ask[l].t)}</span></button>`);
    audio = me ? [hd('Đến lượt con!'), 300, INTRO.model[l].a] : [hd('Cả lớp cùng hỏi bạn nhé!'), 200, INTRO.ask[l].a];
    akey = 'intro-land|' + sp.n + '|' + l;
  }
  return {
    key, akey, audio, priv: !!(sp.n && landed && sp.seat === mySeat && !CHIEU),
    html: `<div class="wheel-box"><div class="pointer">🔻</div><div class="wheel" id="wh">${ring}</div><div class="hub">🎡</div></div><div id="under" style="display:flex;flex-direction:column;align-items:center;gap:10px">${under}</div>`,
    bind() {
      const wh = $('#wh');
      $$('[data-a]', $('#stage')).forEach(b => b.onclick = () => play([b.dataset.a]));
      if (sp.n && spinSeen !== sp.n && spinSeen !== null && spinLanded !== sp.n) {   // lượt quay mới: xoay
        wh.style.transform = `rotate(${wheelAngle}deg)`; void wh.offsetWidth;
        wh.classList.add('spin'); wh.style.transform = `rotate(${target}deg)`; SND.beep('whoosh');
        const n = sp.n; setTimeout(() => { if ((room.state || {}).spin && room.state.spin.n === n) { spinLanded = n; SND.beep('win'); render(); } }, 3300);
      } else { wh.style.transform = `rotate(${target}deg)`; if (sp.n) spinLanded = sp.n; }
      spinSeen = sp.n || 0; wheelAngle = target;
      // giữ khuôn mặt luôn đứng thẳng
      $$('.seat', wh).forEach(x => x.style.transform = `rotate(${-target}deg)`);
    }
  };
}

/* --- Ôn nhanh: nghe rồi chạm 1 trong 3 tranh --- */
function vQuiz(st, seats) {
  const i = Math.min(QUIZ.length - 1, st.i || 0), q = QUIZ[i], qid = `on_${i}_${st.run || 0}`, rv = st.step === 'rv';
  const ans = quizAns(q), my = myAnswer(qid), lang = quizLang(q), a = quizAudio(q);
  const flag = { en: 'English', zh: '中文', doc: 'Nhìn chữ' }[lang];
  const key = ['on', i, st.run || 0, rv ? 1 : 0, my ? my.c : '-'].join('|');
  const prompt = q.l === 'doc' ? `<div class="chu ${/[a-z]/i.test(q.chu) ? 'latin' : 'zh'}">${esc(q.chu)}</div>`
    : `<button class="say ${q.l}" data-play><span class="ic">🔊</span>${rv && CHIEU ? `<span class="${q.l}">${esc(txt(q.k, q.l))}</span>` : '<span>Nghe</span>'}</button>`;
  const pics = quizPics(q).map((src, c) => `<button class="pick${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}" aria-label="Tranh ${c + 1}"><img src="${src}" alt=""></button>`).join('');
  let after = '';
  if (rv && CHIEU) after = `<p class="sub">Cả lớp cùng nghe nhé: <b class="${lang === 'doc' ? q.a : lang}">${esc(q.l === 'doc' ? q.chu : txt(q.k, q.l))}</b></p>`;
  let audio, akey = ['on', i, st.run || 0, rv ? 1 : 0, st.rp || 0].join('|');
  if (rv) audio = [a, 600, a];
  else if (q.l === 'doc') audio = [hd('Con nhìn lại chữ nhé.')];
  else audio = i === 0 && !st.rp ? [hd('Con nghe và chạm vào tranh đúng nhé!'), 400, a, 700, a] : [a, 700, a];
  return {
    key, akey, audio,
    html: `<div class="qno">Câu ${i + 1}/${QUIZ.length} <span class="flag ${lang}">${flag}</span></div>
      <p class="ask-line">${q.l === 'doc' ? '👀 Con nhìn chữ rồi chạm vào tranh đúng nhé!' : '👂 Con nghe và chạm vào tranh đúng nhé!'}</p>${prompt}
      <div class="pics${my || rv || CHIEU ? ' locked' : ''}" id="pics">${pics}</div><p class="count" id="cnt"></p>${after}`,
    bind() { bindPlay(() => [a]); bindPicks(qid, c => ({ c, ok: c === ans })); if (rv && my && my.ok) giveStar(qid, 'on_' + lang); this.update(); },
    update() { const n = countAnswered(qid, seats); $('#cnt').textContent = rv ? '' : `${n}/${seats.length} bạn đã chọn`; }
  };
}

/* --- Máy bay thanh điệu: chạm 1 trong 4 đường bay --- */
function planeSVG(t, id, big) {
  const d = TONE_PATH[t];
  return `<svg viewBox="0 0 100 60" aria-hidden="true"><path d="${d}" fill="none" stroke="${big ? '#3BB273' : '#4AA3E8'}" stroke-width="${big ? 3 : 2.4}" stroke-linecap="round" stroke-dasharray="${big ? '0' : '4 3'}"/>
    <g opacity="${big ? 1 : 0}"><path d="M-6,-1.6 L4,-1.6 L8,0 L4,1.6 L-6,1.6 Z M-2,-1.6 L-5,-7 L-2.6,-7 L2,-1.6 Z M-2,1.6 L-5,7 L-2.6,7 L2,1.6 Z M-6,-1.6 L-8,-4 L-6.5,-4 L-4.6,-1.6Z" fill="#E3262E" transform="scale(${big ? 1.2 : .9})"/>
    <animateMotion id="${id}" dur="${big ? '1.8s' : '1.3s'}" ${big ? 'repeatCount="indefinite"' : 'begin="indefinite" fill="freeze"'} rotate="auto" path="${d}"/>${big ? '' : `<set attributeName="opacity" to="1" begin="${id}.begin"/>`}</g></svg>`;
}
function vTone(st, seats) {
  const i = Math.min(TONES.length - 1, st.i || 0), x = TONES[i], qid = `tone_${i}_${st.run || 0}`, rv = st.step === 'rv';
  const my = myAnswer(qid), a = toneAudio(x);
  const key = ['tone', i, st.run || 0, rv ? 1 : 0, my ? my.c : '-'].join('|');
  const opts = [1, 2, 3, 4].map(t => `<button class="path${my && my.c === t ? ' chosen' : ''}${rv && CHIEU && t === x.t ? ' right' : ''}${rv && CHIEU && t !== x.t ? ' dim' : ''}" data-c="${t}">${planeSVG(t, 'pl' + t)}<span>${TONE_NAME[t]}</span></button>`).join('');
  const head = `<div class="tone-head"><img src="${tonePic(x)}" alt=""><div class="chu zh">${x.c}</div>
    <div class="tone-side"><div class="py">${rv && CHIEU ? x.py : x.p0}</div>${a ? `<button class="say zh tone-say" data-play><span class="ic">🔊</span>Nghe</button>` : '<p class="sub">Cô đọc trên Zoom</p>'}</div></div>`;
  const body = rv && CHIEU ? `<div class="cheer" style="color:var(--red)">Cả lớp bay tay nói theo nhé! ✋ ${x.py}</div><div class="fly-big">${planeSVG(x.t, 'plBig', true)}</div>`
    : `<div class="paths${my || CHIEU ? ' locked' : ''}" id="pics">${opts}</div><p class="count" id="cnt"></p>`;
  const akey = ['tone', i, st.run || 0, rv ? 1 : 0, st.rp || 0].join('|');
  return {
    key, akey, audio: rv ? [hd('Cả lớp bay tay nói theo nhé!'), 300].concat(a ? [a, 700, a, 700, a] : []) : (i === 0 && !st.rp ? [hd('Con nghe rồi chạm vào đường bay đúng nhé!'), 300] : []).concat(a ? [a, 800, a] : []),
    html: `<div class="qno">Máy bay thanh điệu ${i + 1}/${TONES.length}</div>${rv && CHIEU ? '' : '<p class="ask-line">✈️ Con nghe rồi chạm vào đường bay đúng nhé!</p>'}${head}${body}`,
    bind() {
      bindPlay(() => a ? [a] : []);
      $$('.path', $('#stage')).forEach(b => b.addEventListener('click', () => { const m = $('#pl' + b.dataset.c); m && m.beginElement && m.beginElement(); }));
      bindPicks(qid, c => ({ c, ok: c === x.t }), '.path');
      if (my && !rv) { const m = $('#pl' + my.c); try { m && m.beginElement && m.beginElement(); } catch (e) { } }
      if (rv && my && my.ok) giveStar(qid, 'tone', { py: x.py });
      this.update && this.update();
    },
    update() { const el = $('#cnt'); if (el) el.textContent = `${countAnswered(qid, seats)}/${seats.length} bạn đã chọn`; }
  };
}

/* --- Trò chơi đôi bạn --- */
function vPair(st, seats) {
  const p = st.pair || {}, item = PAIR_POOL[p.k || 0], l = p.l === 'zh' ? 'zh' : 'en', qid = `pair_${p.n || 0}_${st.run || 0}`, rv = st.step === 'rv';
  if (p.a === undefined) return { key: 'pair-wait', html: `<h1>Trò chơi đôi bạn 🤝</h1><p class="sub">Cô đang ghép đôi các bạn…</p>` };
  const role = CHIEU ? 'see' : mySeat === p.a ? 'say' : mySeat === p.b ? 'hear' : 'see';
  const listener = seats.find(s => s.id === p.b);
  const la = listener ? answerOf(room, listener, qid) : null, ans = item.o.indexOf(item.k);
  const my = myAnswer(qid);
  const key = ['pair', p.n, st.run || 0, rv ? 1 : 0, role, my ? my.c : '-', rv && la && la.ok ? 1 : 0].join('|');
  const duo = `<div class="duo"><div class="face"><img src="${seatFace(seats, p.a)}" alt=""><span>${esc(p.a === mySeat ? 'Con' : seatName(seats, p.a))}</span></div><span class="arrow">🗣️➡️</span><div class="face"><img src="${seatFace(seats, p.b)}" alt=""><span>${esc(p.b === mySeat ? 'Con' : seatName(seats, p.b))}</span></div></div>`;
  const langLb = l === 'zh' ? 'Nói bằng tiếng Trung' : 'Nói bằng tiếng Anh';
  const picks = `<div class="pics${my || rv || CHIEU || role === 'say' ? ' locked' : ''}" id="pics">${item.o.map((k, c) => `<button class="pick${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}"><img src="${pic(k, 3)}" alt=""></button>`).join('')}</div>`;
  let body;
  if (role === 'say') body = `<div class="my-turn">Đến lượt con nói!</div><img class="big-pic" src="${pic(item.k, 3)}" alt=""><span class="flag ${l}">${langLb}</span>
      <button class="say ${l}" data-play style="font-size:20px;padding:8px 16px"><span class="ic" style="font-size:24px">🔊</span>Nghe mẫu</button><p class="sub">Con nói cho bạn ${esc(seatName(seats, p.b))} nghe nhé!</p>${amCo() ? `<p class="msg vn" style="max-width:420px">🎧 Tiếng mẫu chỉ phát trên máy này. Ba mẹ tắt mic Zoom khi con nghe mẫu, bật lại khi con nói. Ba mẹ nhắc nhỏ nếu con cần: <b class="${l}">${esc(txt(item.k, l))}</b></p>` : ''}`;
  else if (role === 'hear') body = `<p class="sub" style="font-size:19px"><b>${esc(seatName(seats, p.a))}</b> nói, con nghe rồi chạm tranh đúng nhé!</p>${picks}`;
  else body = `<p class="sub"><b>${esc(seatName(seats, p.a))}</b> đang nói cho <b>${esc(seatName(seats, p.b))}</b> nghe. ${CHIEU ? '' : 'Con cũng đoán nhé!'}</p><span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span>${picks}`;
  if (rv && CHIEU) body += la && la.ok ? `<div class="cheer">Hai bạn ăn ý quá! 🎉</div>` : `<p class="sub">Cả lớp cùng nghe nhé: <b class="${l}">${esc(txt(item.k, l))}</b></p>`;
  const a = aud(item.k, l);
  const akey = ['pair', p.n, st.run || 0, rv ? 1 : 0, role, st.rp || 0].join('|');
  return {
    key, akey, priv: !rv && role === 'say', audio: rv ? [a].concat(CHIEU && la && la.ok ? [400, hd('Hai bạn ăn ý quá!')] : []) : role === 'say' ? [hd('Đến lượt con!'), 300, hd('Con nói cho bạn nghe nhé!'), 300, a] : role === 'hear' ? [hd('Con nghe bạn nói rồi chạm tranh đúng nhé!')] : null,
    html: `<div class="qno">Trò chơi đôi bạn · lượt ${(p.n || 0) + 1}</div>${duo}${body}`,
    bind() {
      bindPlay(() => [a], role === 'say'); bindPicks(qid, c => ({ c, ok: c === ans, xem: role === 'see' || undefined }));
      if (rv && !CHIEU) { if (role === 'say' && la && la.ok) giveStar(qid, 'pairSay', { ban: seatName(seats, p.b) }); else if (role !== 'say' && my && my.ok) giveStar(qid, role === 'hear' ? 'pairHear' : 'pairSee', { ban: seatName(seats, p.a) }); }
    }
  };
}

/* --- Cô giáo nhỏ: một bạn nói, cả lớp nghe và chạm, rồi cả lớp nói bằng tiếng kia --- */
function vLop(st, seats) {
  const p = st.lop || {}, item = PAIR_POOL[p.k || 0], l = p.l === 'zh' ? 'zh' : 'en', to = l === 'zh' ? 'en' : 'zh';
  const qid = `lop_${p.n || 0}_${st.run || 0}`, rv = st.step === 'rv';
  if (p.a === undefined) return { key: 'lop-wait', html: `<h1>📣 Cô giáo nhỏ</h1><p class="sub">Cô đang chọn bạn làm cô giáo nhỏ…</p>` };
  const me = !CHIEU && mySeat === p.a, ans = item.o.indexOf(item.k), my = myAnswer(qid);
  const others = seats.filter(x => x.id !== p.a);
  const hit = others.filter(x => { const a = answerOf(room, x, qid); return a && a.ok; }).length;
  const key = ['lop', p.n, st.run || 0, rv ? 1 : 0, me ? 1 : 0, my ? my.c : '-', rv ? hit : ''].join('|');
  const who = `<div class="chosen-card"><img src="${seatFace(seats, p.a)}" alt=""><b>${esc(me ? 'Con' : seatName(seats, p.a))}</b><span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span></div>`;
  let body;
  if (me) {
    body = `<div class="my-turn">Con là cô giáo nhỏ! 📣</div><img class="big-pic" src="${pic(item.k, 3)}" alt="">
      <button class="say ${l}" data-play style="font-size:20px;padding:8px 16px"><span class="ic" style="font-size:24px">🔊</span>Nghe mẫu</button>
      <p class="sub">Con nói ${l === 'zh' ? 'bằng tiếng Trung' : 'bằng tiếng Anh'} cho cả lớp nghe nhé!</p>${amCo() ? `<p class="msg vn" style="max-width:420px">🎧 Tiếng mẫu chỉ phát trên máy này. Ba mẹ tắt mic Zoom khi con nghe mẫu, bật lại khi con nói. Ba mẹ nhắc nhỏ nếu con cần: <b class="${l}">${esc(txt(item.k, l))}</b></p>` : ''}`;

  } else {
    body = `<p class="ask-line">👂 Bạn ${esc(seatName(seats, p.a))} nói, cả lớp nghe rồi chạm tranh đúng nhé!</p>
      <div class="pics${my || rv || CHIEU ? ' locked' : ''}" id="pics">${item.o.map((k, c) => `<button class="pick${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}"><img src="${pic(k, 3)}" alt=""></button>`).join('')}</div>
      <p class="count" id="cnt"></p>`;
  }
  if (rv && CHIEU) body += `<p class="ask-line">🗣️ Cả lớp cùng nói bằng ${to === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}: <b class="${to}">${esc(txt(item.k, to))}</b></p>`;
  const a = aud(item.k, l), b = aud(item.k, to);
  const akey = ['lop', p.n, st.run || 0, rv ? 1 : 0, me ? 1 : 0, st.rp || 0].join('|');
  const audio = rv ? [a, 600, hd(to === 'zh' ? 'Tiếng Trung nói thế nào nhỉ?' : 'Tiếng Anh nói thế nào nhỉ?'), 1800, b]
    : me ? [hd('Đến lượt con!'), 300, a] : (p.n === 0 && !st.rp ? [hd('Con nghe bạn nói rồi chạm tranh đúng nhé!')] : null);
  return {
    key, akey, audio, priv: !rv && me,
    html: `<div class="qno">📣 Cô giáo nhỏ · lượt ${(p.n || 0) + 1}</div>${who}${body}`,
    bind() {
      bindPlay(() => [a], me); if (!me) bindPicks(qid, c => ({ c, ok: c === ans }));
      if (rv && !CHIEU) { if (me && hit) giveStar(qid, 'lopSay', { n: hit }); else if (!me && my && my.ok) giveStar(qid, 'lopHear', { ban: seatName(seats, p.a) }); }
      this.update();
    },
    update() { const el = $('#cnt'); if (el) el.textContent = rv ? '' : `${others.filter(x => answerOf(room, x, qid)).length}/${others.length} bạn đã chọn`; }
  };
}

/* --- Truyện --- */
function vStory(st) {
  const i = Math.min(STORY.length - 1, st.scene || 0), l = st.l || 'both', s = STORY[i];
  const list = l === 'en' ? [sceneAud(i, 'en')] : l === 'zh' ? [sceneAud(i, 'zh')] : [sceneAud(i, 'en'), 700, sceneAud(i, 'zh')];
  const audio = (i === 0 && !st.rp) ? [hd('Mình cùng nghe truyện nhé!'), 500].concat(list) : list;
  return {
    key: 'story|' + i + '|' + l, akey: 'story|' + i + '|' + l + '|' + (st.rp || 0), audio,
    html: `<div class="qno">📖 ${STORY_TITLE}</div><img class="scene" src="${sceneImg(i)}" alt="">
      <div class="scene-cap">${l !== 'zh' ? esc(s.en) : ''}${l === 'both' ? '<br>' : ''}${l !== 'en' ? `<span class="zh">${esc(s.zh)}</span>` : ''}</div>
      <div class="dots">${STORY.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`
  };
}

/* --- Phiên dịch nhí: mở hộp quà --- */
function vGift(st, seats) {
  const g = st.gift || {}, k = Math.min(GIFTS.length - 1, g.k || 0), G = GIFTS[k], from = G.from, to = from === 'en' ? 'zh' : 'en', s = STORY[G.s];
  const me = g.seat && g.seat === mySeat;
  const row = `<div class="gifts-row">${GIFTS.map((_, j) => `<span class="${j < k || (j === k && g.open) ? 'done' : ''}">🎁</span>`).join('')}</div>`;
  const who = g.seat ? (me ? `<div class="pd">🎤 Con là Phiên dịch nhí!</div>` : `<p class="sub">Phiên dịch nhí: <b>${esc(seatName(seats, g.seat))}</b></p>`) : '';
  let body;
  if (!g.open) body = `<button class="gift" id="gb" aria-label="Hộp quà">🎁</button><p class="sub">Hộp quà số ${k + 1}. Con chạm thử xem nào!</p>`;
  else body = `<img class="scene open-pic" src="${sceneImg(G.s)}" alt="" style="max-width:560px"><div class="scene-cap"><span class="${from}">${esc(s[from])}</span>${g.ans ? `<br><span class="${to}">${esc(s[to])}</span>` : ''}</div>
    ${g.ans ? `<div class="cheer">Giỏi quá! 🎉</div>` : `<p class="sub" style="font-size:19px">${to === 'zh' ? 'Tiếng Trung nói thế nào nhỉ?' : 'Tiếng Anh nói thế nào nhỉ?'}</p>`}`;
  const ask = hd(to === 'zh' ? 'Tiếng Trung nói thế nào nhỉ?' : 'Tiếng Anh nói thế nào nhỉ?');
  const audio = !g.open ? [hd('Con chạm hộp quà xem nào!')].concat(me ? [300, hd('Con là Phiên dịch nhí!'), 300, hd('Con nghe rồi thử nói bằng tiếng kia nhé!')] : [])
    : g.ans ? [sceneAud(G.s, to)] : [sceneAud(G.s, from), 500, ask];
  return {
    key: ['gift', k, g.seat || '', g.open ? 1 : 0, g.ans ? 1 : 0].join('|'), akey: ['gift', k, g.seat || '', g.open ? 1 : 0, g.ans ? 1 : 0, st.rp || 0].join('|'), audio,
    html: `<div class="qno">🎁 Phiên dịch nhí</div>${row}${who}${body}`,
    bind() { const b = $('#gb'); if (b) b.onclick = () => { b.classList.remove('wig'); void b.offsetWidth; b.classList.add('wig'); SND.beep('pop'); }; }
  };
}

/* --- Huy hiệu Bứt phá cả nhóm --- */
function vBadge(st, seats) {
  return {
    key: 'badge|' + seats.map(s => s.id + (s.photo ? 'p' : '')).join(','), akey: 'badge', audio: [hd('Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá!'), 300, hd('Tuyệt vời! Con đã học xong hôm nay rồi!')],
    html: `<div class="medal"><small>Huy hiệu</small><b>BỨT PHÁ</b><small>⭐ Vòng 2 ⭐</small></div><h1>Cả nhóm giỏi quá!</h1>
      <div class="team">${seats.map(s => `<div class="face${s.id === mySeat ? ' me' : ''}"><img src="${faceOf(s)}" alt=""><span>${esc(s.kid)}</span></div>`).join('')}</div>`,
    bind() { if (!confettiDone) { confettiDone = true; SND.beep('win'); confetti(); } }
  };
}
function confetti() {
  const box = $('#confetti'), cols = ['#E3262E', '#FFC72C', '#3BB273', '#4AA3E8', '#F29B38'];
  box.innerHTML = Array.from({ length: 70 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${cols[i % 5]};animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.5}s"></i>`).join('');
  setTimeout(() => box.innerHTML = '', 7000);
}

/* --- Tặng sao: chỉ hiện khi con đúng (lúc cô hiện đáp án). Chưa đúng thì màn con không hiện gì; kết quả nằm ở màn cô. --- */
function stars() { return lsGet('lz-sao-' + CODE + '-' + DB.uid, []) || []; }
function starPill() { const el = $('#saoPill'); if (el) el.textContent = '⭐ ' + stars().length; }
/* Lời khen theo đúng việc con vừa làm, đổi câu mỗi lần (không lặp lại câu vừa dùng). Chỉ hiện chữ, không đọc thành tiếng. */
const PRAISE = {
  on_en: ['Con nghe tiếng Anh tinh ghê!', 'Tai con bắt được từ tiếng Anh rồi!', 'Con nghe một lần là chọn đúng!', 'Con nghe kỹ nên chọn trúng tranh!'],
  on_zh: ['Con nghe ra tiếng Trung rồi đó!', 'Tiếng Trung con cũng nghe hiểu!', 'Con nhận ra từ tiếng Trung nhanh ghê!', 'Con nghe kỹ tiếng Trung nên chọn trúng!'],
  on_doc: ['Con nhìn chữ là nhận ra liền!', 'Con nhớ mặt chữ rồi đó!', 'Mắt con tinh ghê, đọc được chữ rồi!'],
  tone: ['Máy bay của con bay đúng đường {py}!', 'Con nghe ra thanh điệu {py} rồi!', 'Tai con bắt thanh điệu chuẩn ghê!', 'Con chọn đúng đường bay rồi đó!'],
  pairSay: ['Con nói rõ nên {ban} hiểu liền!', '{ban} nghe con nói là hiểu ngay!', 'Con nói to, rõ, {ban} chọn đúng rồi!'],
  pairHear: ['Con nghe {ban} nói và hiểu liền!', 'Con hiểu ý {ban} rồi đó!', 'Con lắng nghe bạn giỏi ghê!'],
  pairSee: ['Con đoán đúng cùng hai bạn rồi!', 'Con nghe các bạn nói cũng hiểu luôn!'],
  lopSay: ['Con nói rõ, {n} bạn hiểu con rồi!', 'Cô giáo nhỏ nói hay ghê, {n} bạn chọn đúng!', 'Cả lớp nghe con và {n} bạn hiểu rồi!'],
  lopHear: ['Con nghe {ban} nói và chọn đúng rồi!', 'Con hiểu cô giáo nhỏ {ban} rồi đó!', 'Con lắng nghe bạn rất chăm!']
};
let lastPraise = '';
function praise(kind, v) {
  const list = PRAISE[kind] || PRAISE.on_en;
  let pool = list.filter(x => x !== lastPraise); if (!pool.length) pool = list;
  const t = pool[Math.floor(Math.random() * pool.length)];
  lastPraise = t;
  return t.replace(/\{(\w+)\}/g, (_, k) => (v && v[k] !== undefined) ? v[k] : '');
}
function giveStar(qid, kind, v) {
  if (CHIEU) return;
  const list = stars(); if (list.indexOf(qid) >= 0) return;
  list.push(qid); lsSet('lz-sao-' + CODE + '-' + DB.uid, list); starPill();
  let ov = $('#starOv'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'starOv'; ov.className = 'star-ov';
  ov.innerHTML = `<div class="star-card"><div class="star-big">⭐</div><b>+1 sao</b><p>${esc(praise(kind, v))}</p><small>Con có ${list.length} ⭐ trong buổi này</small></div>`;
  document.body.appendChild(ov); ov.onclick = () => ov.remove();
  SND.beep('ok');
  setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 500); }, 2600);
}

/* --- chạm và nghe --- */
function bindPlay(fn, priv) { $$('[data-play]', $('#stage')).forEach(b => b.onclick = () => play(fn(), priv && amCo() ? 0.45 : 1)); }
function bindPicks(qid, judge, sel) {
  if (CHIEU) return;
  $$(sel || '.pick', $('#stage')).forEach(b => b.addEventListener('click', () => {
    if (localPick[qid] || myAnswer(qid) || (room.state || {}).step === 'rv') return;
    const c = +b.dataset.c, rec = Object.assign({ ms: Math.round(performance.now() - shownAt), at: DB.now() }, judge(c));
    Object.keys(rec).forEach(k => rec[k] === undefined && delete rec[k]);
    localPick[qid] = rec; SND.beep('ok');
    $$(sel || '.pick', $('#stage')).forEach(x => x.classList.toggle('chosen', x === b));
    $('#pics') && $('#pics').classList.add('locked');
    DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, rec).catch(er => console.error(er));
  }));
}

/* ======================= màn chiếu ======================= */
function startChieu() {
  CODE = CHIEU;
  if (window.parent !== window) document.addEventListener('keydown', e => { try { parent.lzKey && parent.lzKey(e); } catch (er) { } });
  document.title = 'Màn chiếu – Phòng ' + CODE;
  const link = location.href.split('?')[0];
  $('#topInfo').innerHTML = `<span class="chieu-code">Mã phòng ${esc(CODE)}</span> <button class="pill mute-btn" id="mu">${muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'}</button>`;
  $('#mu').onclick = () => { muted = !muted; lsSet('lz-chieu-mute', muted); if (muted) SND.stop(); $('#mu').textContent = muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'; };
  app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center"><h2>Màn chiếu phòng ${esc(CODE)}</h2><p class="vn">Cô chia sẻ cửa sổ này trên Zoom (tích "Chia sẻ âm thanh" để bé chỉ có 1 máy cũng nghe được).</p><button class="btn red" id="st">🔊 Bắt đầu chiếu (bật tiếng)</button><p class="vn small">Link cho ba mẹ: ${esc(link)}</p></div></div>`;
  $('#st').onclick = () => { SND.unlock(); DB.on(roomPath(CODE), v => { room = v || {}; render(); }); };
}

/* ======================= khởi động ======================= */
(async function () {
  try { await DB.init({ perTab: QS.has('thu') }); }
  catch (e) { console.error(e); app.innerHTML = '<div class="wrap"><div class="card"><h2>Chưa kết nối được</h2><p class="vn">Mạng đang chập chờn. Ba mẹ tải lại trang giúp cô nhé.</p></div></div>'; return; }
  watchConn();
  if (CHIEU) return startChieu();
  if (PREP) return prepScreen();
  codeScreen();
})();
