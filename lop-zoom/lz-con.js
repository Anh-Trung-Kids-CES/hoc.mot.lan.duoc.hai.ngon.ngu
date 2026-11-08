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

/* âm lượng tiếng chỉ phát trên máy con (tiếng mẫu bí mật, lời khen) khi tiếng chính phát ở máy cô: đủ nghe rõ, ba mẹ tắt mic Zoom lúc con nghe mẫu */
const PRIV_VOL = 0.8;
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
    try { await apiPost({ action: 'zoomhs', kid: ME.kid, parent: ME.parent, ava: ME.ava, ok: ME.ok, photo: ME.ok ? photoBig || '' : '', web: ME.web || '', khoa: LZ_CFG.khoa, vong: LZ_CFG.vong }); } catch (e) { /* máy chủ chưa cập nhật: thông tin vẫn lưu trên máy */ }
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
  /* vừa tải lại để đổi khoá: vào tiếp luôn, ba mẹ không phải bấm lại */
  if (QS.has('tiep') && pre.length === 4 && !codeScreen.auto) { codeScreen.auto = true; setTimeout(() => $('#cf') && $('#cf').requestSubmit ? $('#cf').requestSubmit() : $('#cf').dispatchEvent(new Event('submit', { cancelable: true })), 0); }
  $('#cf').onsubmit = async e => {
    e.preventDefault(); SND.unlock();
    const code = ins.map(x => x.value).join('');
    if (!/^\d{4}$/.test(code)) return codeScreen('Mã phòng có 4 số. Ba mẹ nhập lại giúp cô nhé.');
    let t = null;
    try { t = await DB.get(roomPath(code) + '/teacher'); } catch (er) { return codeScreen('Mạng đang chập chờn. Ba mẹ thử lại nhé.'); }
    if (!t) return codeScreen('Chưa thấy phòng ' + code + '. Ba mẹ xem lại mã trên màn Zoom của cô nhé.');
    /* phòng của khoá khác (Little Seed / Canopy): tải lại trang với đúng nội dung rồi vào tiếp */
    let lop = '';
    try { lop = await DB.get(roomPath(code) + '/state/lop'); } catch (er) { }
    if (lop && LZ_LOPS[lop] && lop !== LZ_LOP) { location.replace(lopUrl(lop, { phong: code, tiep: 1 })); return; }
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
  $('#topInfo').innerHTML = `<span class="pill y" id="saoPill">⭐ 0</span> <span class="pill">${esc(ME.kid)} · Phòng ${CODE}</span>`; starPill(); HEAD.boot();
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

let bossTick = null, bossDone = null;
function render() {
  const st = room.state || { ph: 'cho' }, players = room.players || {};
  if (st.ph === 'boss' && !bossTick) bossTick = setInterval(bossUpdate, 250);
  if (st.ph !== 'boss' && bossTick) { clearInterval(bossTick); bossTick = null; BA.stop(); document.body.classList.remove('boss-play'); }
  const meNode = players[DB.uid];
  if (!CHIEU && (!meNode || !meNode.kid)) return removed();
  mySeat = CHIEU ? '' : seatOf(players, DB.uid);
  const seats = buildSeats(players).filter(s => s.ok);
  const waiting = !CHIEU && meNode.ok === false;
  if (!$('#stage')) app.innerHTML = `<div class="room${CHIEU ? ' chieu' : ''}"><div id="en"></div><div class="stage" id="stage"></div><div class="friends" id="friends"></div></div>`;
  $('#en').innerHTML = energyHTML(energy(room));
  $('#friends').innerHTML = seats.map(s => `<div class="face${s.id === mySeat ? ' me' : ''}${s.on ? '' : ' off'}"><img src="${faceOf(s)}" alt=""><span>${esc(s.id === mySeat ? 'Con' : s.kid)}</span></div>`).join('') || '<span class="small">Các bạn đang vào lớp…</span>';
  const v = waiting ? { key: 'wait', html: viewWait() } : view(st, seats);
  if (!CHIEU) HEAD.phase(st);
  if (v.key) v.key += '|h' + (headAllowed(st) ? 1 : 0);
  if (v.key !== lastStageKey) {
    lastStageKey = v.key; shownAt = performance.now();
    if (!CHIEU && typeof TAY !== 'undefined') TAY.close();   // sang câu khác / cô hiện đáp án: đóng màn bay bằng tay
    $('#stage').innerHTML = v.html; v.bind && v.bind();
  } else if (v.update) v.update();
  if (v.audio && v.akey !== lastAudioKey) {
    lastAudioKey = v.akey;
    if (CHIEU) { if (!v.priv) play(v.audio); }
    else if (v.priv) play(v.audio, amCo() ? PRIV_VOL : 1);
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
    case 'hat': return vHat(st);
    case 'intro': return vIntro(st, seats);
    case 'noi': return vNoi(st, seats);
    case 'on': return vQuiz(st, seats);
    case 'tone': return vTone(st, seats);
    case 'dtc': return vDtc(st, seats);
    case 'pb': return vPb(st, seats);
    case 'cn': return vCn(st, seats);
    case 'pair': return vPair(st, seats);
    case 'lop': return vLop(st, seats);
    case 'story':   // phòng mở từ bản cũ: phần Truyện nay là Nghe truyện, xếp tranh
    case 'xep': return vXep(st, seats);
    case 'gift': return vGift(st, seats);
    case 'boss': return vBoss(st, seats);
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
  const sp = st.spin || {}, l = sp.l === 'zh' ? 'zh' : 'en', N = seats.length, I = (sp.q === 'dad' && INTRO.dad) || INTRO;
  const idx = Math.max(0, seats.findIndex(s => s.id === sp.seat));
  const target = sp.n ? -idx * 360 / Math.max(1, N) + 360 * (4 + sp.n) : 0;
  const landed = !sp.n || spinLanded === sp.n;
  const key = 'intro|' + seats.map(s => s.id).join(',') + '|' + (sp.n || 0) + '|' + (landed ? 1 : 0) + '|' + l + (sp.q || '');
  const ring = seats.map((s, j) => {
    const a = j * 2 * Math.PI / Math.max(1, N);
    return `<div class="seat" style="left:${50 + 36 * Math.sin(a)}%;top:${50 - 36 * Math.cos(a)}%"><img src="${faceOf(s)}" alt=""><b>${esc(s.kid)}</b></div>`;
  }).join('');
  let under = '<p class="sub">Cô quay vòng chọn bạn nhé!</p>', audio = sp.n ? null : [hd('Cô quay vòng chọn bạn nhé!')], akey = sp.n ? key : 'intro0';
  if (sp.n && landed && sp.seat) {
    const me = sp.seat === mySeat;
    under = `<div class="chosen-card"><img src="${seatFace(seats, sp.seat)}" alt=""><b>${esc(seatName(seats, sp.seat))}</b></div>` +
      (me ? `<div class="my-turn">Đến lượt con!</div><button class="say ${l}" data-a="${I.model[l].a}"><span class="ic">🔊</span><span class="${l}">${esc(I.model[l].t)}</span></button>`
          : `<p class="sub">Cả lớp cùng hỏi bạn:</p><button class="say ${l}" data-a="${I.ask[l].a}"><span class="ic">🔊</span><span class="${l}">${esc(I.ask[l].t)}</span></button>`);
    audio = me ? [hd('Đến lượt con!'), 300, I.model[l].a] : [hd('Cả lớp cùng hỏi bạn nhé!'), 200, I.ask[l].a];
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

/* --- Nói theo cô: cô đọc mẫu, cả lớp nói theo (không chấm) --- */
let noiRun = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function vNoi(st, seats) {
  const N = NOI.length, i = Math.min(N - 1, st.i || 0), it = NOI[i], od = st.od === 'zh' ? ['zh', 'en'] : ['en', 'zh'];
  const key = ['noi', i, st.rp || 0, od[0]].join('|');
  const here = CHIEU ? !muted : !amCo();   // máy này phát tiếng mẫu không
  const lines = od.map(l => `<div class="noi-l" data-l="${l}"><span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span><b class="${l}">${esc(txt(it.k, l))}</b></div>`).join('');
  return {
    key,
    html: `<div class="qno">🗣️ Nói theo cô · ${i + 1}/${N} <span class="flag doc">${NOI_GRP[it.g]}</span></div>
      <p class="ask-line">👂 Con nghe cô đọc rồi nói theo nhé!</p>
      <img class="big-pic" src="${pic(it.k, 2)}" alt="">
      <div class="noi-lines${here ? ' play' : ''}" id="noiL">${lines}</div>
      <div class="noi-cue${here ? '' : ' show still'}" id="noiCue"><span>🗣️ ${CHIEU ? 'Cả lớp nói theo!' : 'Con nói theo cô nhé!'}</span><i id="noiBar"></i></div>
      <div class="dots">${NOI.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`,
    bind() { if (here) noiPlay(lastStageKey, od.map(l => [l, aud(it.k, l)])); }   // khoá màn đã kèm hậu tố của render()
  };
}
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
}

/* --- 他 hay 她? Cô Hươu dạy phân biệt hai chữ đồng âm (tā): nghe giống nhau → bộ 亻 người → bộ 女 nữ → động tác → câu ví dụ nói theo → luyện chọn chữ.
   Lời cô Hươu chưa có file giọng thì hiện chữ trong bong bóng để cô đọc trên Zoom (không dùng giọng máy). --- */
function pbSay(t) { return `<div class="pb-bubble"><img src="${HUOU}" alt=""><span>${esc(t)}</span></div>`; }
function pbLines(keys) { return keys.map(k => PB.loi[k]); }
function pbAud(keys) { const out = []; keys.forEach(k => { const a = hd(PB.loi[k]); if (a) out.push(a, 300); }); return out; }
function vPb(st, seats) {
  const p = st.pb || {}, s = p.s || 0, A = PB.a, Bq = PB.b;
  const dots = `<div class="dots">${PB.buoc.map((_, j) => `<i class="${j <= s ? 'on' : ''}"></i>`).join('')}</div>`;
  const head = t => `<div class="qno">🔍 ${esc(PB.ten)} · ${esc(t)}</div>`;
  const card = x => `<div class="pb-card ${x.g}"><img class="pic" src="${x.img}" alt=""><div class="pb-big">${x.chu}</div><small class="${x.g === 'he' ? 'pb-he' : 'pb-she'}">${x.g}</small></div>`;
  if (s === 0) return {
    key: 'pb0|' + (st.rp || 0), akey: 'pb0|' + (st.rp || 0),
    audio: pbAud(['nghe1']).concat([A.za, 700, Bq.za, 500]).concat(pbAud(['nghe2'])),
    html: `${head(PB.buoc[0])}<p class="ask-line">👂 tā … tā … Nghe giống nhau quá!</p><div class="pb-two">${card(A)}${card(Bq)}</div>
      <div class="ctl"><button class="say zh" data-a="${A.za}"><span class="ic">🔊</span>${A.chu}</button><button class="say zh" data-a="${Bq.za}"><span class="ic">🔊</span>${Bq.chu}</button></div>
      ${pbSay(PB.loi.nghe1 + ' ' + PB.loi.nghe2)}${dots}`,
    bind() { $$('[data-a]', $('#stage')).forEach(b => b.onclick = () => play([b.dataset.a])); }
  };
  if (s === 1 || s === 2) {
    const x = s === 1 ? A : Bq, L = s === 1 ? ['chuA', 'tayA'] : ['chuB', 'tayB'];
    return {
      key: 'pb' + s + '|' + (st.rp || 0), akey: 'pb' + s + '|' + (st.rp || 0),
      audio: pbAud([L[0]]).concat(x.boA ? [x.boA, 500] : []).concat([x.za, 600, x.ea, 600]).concat(pbAud([L[1]])),
      html: `${head(PB.buoc[s])}${pbEq(x)}
        <div class="pb-row">${pbIcon(x)}<img class="pb-pic" src="${x.img}" alt=""><div class="pb-big ${x.g === 'he' ? 'pb-he' : 'pb-she'}" style="font-size:44px;font-weight:800">${x.g}</div></div>
        <div class="pb-do">${x.dongtac}</div>${pbSay(PB.loi[L[0]])}${dots}`
    };
  }
  if (s === 3) {
    const f = p.f || 0, x = f ? (PB.flash[(f - 1) % PB.flash.length] === 'a' ? A : Bq) : null;
    return {
      key: 'pb3|' + f, akey: 'pb3|' + f + '|' + (st.rp || 0),
      audio: f ? [x.za] : pbAud(['tpr']),
      html: `${head(PB.buoc[3])}${x ? `<div class="pb-flash ${x.g}">${x.chu}</div>` : `<div class="pb-two"><div class="pb-card he"><div class="pb-big">${A.chu}</div><small>${esc(A.dongtac)}</small></div><div class="pb-card she"><div class="pb-big">${Bq.chu}</div><small>${esc(Bq.dongtac)}</small></div></div>`}
        <p class="ask-line">🙆 ${CHIEU ? 'Cả lớp' : 'Con'} nhìn chữ rồi làm động tác nhé!</p>${f ? '' : pbSay(PB.loi.tpr)}${dots}`,
      bind() { if (f) SND.beep('whoosh'); }
    };
  }
  if (s === 4) {
    const v = Math.min(PB.vd.length - 1, p.v || 0), it = PB.vd[v], here = CHIEU ? !muted : !amCo();
    const lines = ['en', 'zh'].map(x => `<div class="noi-l" data-l="${x}"><span class="flag ${x}">${x === 'zh' ? '中文' : 'English'}</span><b class="${x}">${x === 'zh' ? pbColor(it.zh) : esc(it.en).replace(/\b(He|he)\b/, '<span class="pb-he">$1</span>').replace(/\b(She|she)\b/, '<span class="pb-she">$1</span>')}</b></div>`).join('');
    return {
      key: ['pb4', v, st.rp || 0].join('|'),
      html: `${head(PB.buoc[4] + ' ' + (v + 1) + '/' + PB.vd.length)}<p class="ask-line">👂 Con nghe cô đọc rồi nói theo nhé!</p>
        <div class="pb-row"><img class="pb-pic" src="${it.img}" alt="">${pbIcon(it.g === 'he' ? A : Bq)}</div>
        <div class="noi-lines${here ? ' play' : ''}" id="noiL">${lines}</div>
        <div class="noi-cue${here ? '' : ' show still'}" id="noiCue"><span>🗣️ ${CHIEU ? 'Cả lớp nói theo!' : 'Con nói theo cô nhé!'}</span><i id="noiBar"></i></div>
        ${v === 0 ? pbSay(PB.loi.vd) : ''}${dots}`,
      bind() { if (here) noiPlay(lastStageKey, [['en', it.ea], ['zh', it.za]]); }
    };
  }
  /* s === 5: luyện chọn chữ */
  const i = Math.min(PB.luyen.length - 1, p.i || 0), it = PB.luyen[i], run = st.run || 0, qid = `pb_${i}_${run}`, rv = st.step === 'rv';
  const ans = it.g === 'she' ? 1 : 0, my = myAnswer(qid), goi = i < (PB.goiY || 0);
  const opt = (x, c) => `<button class="pick pb-c ${x.g}${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}" aria-label="${x.chu}"><b>${x.chu}</b>${goi ? pbIcon(x) : ''}</button>`;
  const right = it.g === 'she' ? Bq : A;
  return {
    key: ['pb5', i, run, rv ? 1 : 0, my ? my.c : '-'].join('|'), akey: ['pb5', i, run, rv ? 1 : 0, st.rp || 0].join('|'),
    audio: rv ? [it.ea, 600, it.za] : (i === 0 && !st.rp ? pbAud(['luyen']) : []).concat([it.za, 700, it.za]),
    html: `${head(PB.buoc[5] + ' ' + (i + 1) + '/' + PB.luyen.length)}<p class="ask-line">👀 ${esc(PB.loi.luyen)}</p>
      <div class="pb-row"><img class="pb-pic" src="${it.img}" alt=""><button class="say zh" data-play><span class="ic">🔊</span><span>${rv && CHIEU ? pbColor(it.zh) : 'Nghe'}</span></button></div>
      <div class="pics pb-picks${my || rv || CHIEU ? ' locked' : ''}" id="pics">${opt(A, 0)}${opt(Bq, 1)}</div><p class="count" id="cnt"></p>
      ${rv && CHIEU ? `<div class="pb-row">${pbEq(right)}<p class="sub">${pbColor(it.zh)} · <b class="en">${esc(it.en)}</b></p></div>` : ''}${dots}`,
    bind() { bindPlay(() => [it.za]); bindPicks(qid, c => ({ c, ok: c === ans })); if (rv && my && my.ok) giveStar(qid, 'pb'); this.update(); },
    update() { const n = countAnswered(qid, seats), el = $('#cnt'); if (el) el.textContent = rv ? '' : `${n}/${seats.length} bạn đã chọn`; }
  };
}

/* --- Đọc theo cô: (1) cô Hươu đọc EN rồi ZH, cả lớp đọc theo; (2) cô đọc lại một tiếng, con chạm chọn tranh --- */
function vDtc(st, seats) {
  const i = Math.min(DTC_N - 1, st.i || 0), it = dtcItem(i), step = st.step || 'say', run = st.run || 0, qid = `dtc_${i}_${run}`, l = it.l;
  const dots = `<div class="dots">${Array.from({ length: DTC_N }, (_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>`;
  if (step === 'say') {
    const here = CHIEU ? !muted : !amCo();
    const lines = ['en', 'zh'].map(x => `<div class="noi-l" data-l="${x}"><span class="flag ${x}">${x === 'zh' ? '中文' : 'English'}</span><b class="${x}">${esc(txt(it.k, x))}</b></div>`).join('');
    return {
      key: ['dtc', i, 'say', st.rp || 0].join('|'),
      html: `<div class="qno">📖 Đọc theo cô · ${i + 1}/${DTC_N}</div>
        <p class="ask-line">👂 Con nghe cô đọc rồi đọc theo nhé!</p>
        <img class="big-pic" src="${pic(it.k, 2)}" alt="">
        <div class="noi-lines${here ? ' play' : ''}" id="noiL">${lines}</div>
        <div class="noi-cue${here ? '' : ' show still'}" id="noiCue"><span>🗣️ ${CHIEU ? 'Cả lớp đọc theo!' : 'Con đọc theo cô nhé!'}</span><i id="noiBar"></i></div>${dots}`,
      bind() { if (here) noiPlay(lastStageKey, ['en', 'zh'].map(x => [x, aud(it.k, x)])); }
    };
  }
  const rv = step === 'rv', ans = it.o.indexOf(it.k), my = myAnswer(qid), a = aud(it.k, l);
  const pics = it.o.map((k, c) => `<button class="pick${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}" aria-label="Tranh ${c + 1}"><img src="${pic(k, 3)}" alt=""></button>`).join('');
  return {
    key: ['dtc', i, run, rv ? 1 : 0, my ? my.c : '-'].join('|'), akey: ['dtc', i, run, rv ? 1 : 0, st.rp || 0].join('|'),
    audio: rv ? [a, 600, a] : [a, 700, a],
    html: `<div class="qno">📖 Đọc theo cô · ${i + 1}/${DTC_N} <span class="flag ${l}">${l === 'zh' ? '中文' : 'English'}</span>${headAllowed(st) ? HEAD_TAG : ''}</div>
      <p class="ask-line">👂 Con nghe rồi chạm vào tranh đúng nhé!</p>
      ${it.chu && l === 'zh' ? `<div class="chu zh dtc-chu">${esc(it.chu)}</div>` : ''}<button class="say ${l}" data-play><span class="ic">🔊</span>${rv && CHIEU ? `<span class="${l}">${esc(txt(it.k, l))}</span>` : '<span>Nghe</span>'}</button>
      <div class="pics${my || rv || CHIEU ? ' locked' : ''}" id="pics">${pics}</div><p class="count" id="cnt"></p>
      ${rv && CHIEU ? `<p class="sub">Cả lớp cùng đọc lại nhé: <b class="${l}">${esc(txt(it.k, l))}</b></p>` : ''}${dots}`,
    bind() { bindPlay(() => [a]); bindPicks(qid, c => ({ c, ok: c === ans })); if (rv && my && my.ok) giveStar(qid, 'dtc'); this.update(); },
    update() { const n = countAnswered(qid, seats), el = $('#cnt'); if (el) el.textContent = rv ? '' : `${n}/${seats.length} bạn đã chọn`; }
  };
}

/* --- Cô nói, con nói tiếng kia: tranh + nội dung mẫu của bạn đến lượt; cô Hươu nói câu bằng một tiếng, bạn nói lại bằng tiếng kia --- */
function vCn(st, seats) {
  const c = st.cn || {}, sets = cnSets(), t = c.t || 0, set = sets[t % sets.length], d = cnDir(c), j = Math.min(set.lines.length - 1, c.j || 0), L = set.lines[j];
  const kid = seats.find(x => x.id === c.seat), me = kid && kid.id === mySeat;
  const src = x => d.from === 'zh' ? x.za : x.ea, dst = x => d.to === 'zh' ? x.za : x.ea;
  const rows = set.lines.map((x, k) => `<div class="cn-l${k === j ? ' on' : ''}${k < j || (k === j && c.ans) ? ' done' : ''}"><span class="cn-no">${k + 1}</span>
    <div><b class="${d.from}">${esc(x[d.from])}</b>${k < j || (k === j && c.ans) ? `<div class="cn-to ${d.to}">→ ${esc(x[d.to])}</div>` : k === j ? `<div class="cn-to q">→ ${d.to === 'zh' ? '中文' : 'English'} ?</div>` : ''}</div></div>`).join('');
  return {
    key: ['cn', t, c.seat || '', j, c.ans ? 1 : 0, d.from].join('|'), akey: ['cn', t, j, c.ans ? 1 : 0, st.rp || 0, d.from].join('|'),
    audio: c.ans ? [dst(L)] : [src(L)],
    html: `<div class="qno">🔁 Cô nói ${d.from === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}, ${kid ? esc(me ? 'con' : kid.kid) : 'bạn'} nói ${d.to === 'zh' ? 'tiếng Trung' : 'tiếng Anh'} · câu ${j + 1}/${set.lines.length}</div>
      ${kid ? (me ? '<div class="my-turn">Đến lượt con!</div>' : `<div class="chosen-card"><img src="${faceOf(kid)}" alt=""><b>${esc(kid.kid)}</b></div>`) : ''}
      <div class="cn-box"><img class="cn-pic" src="${set.img}" alt=""><div class="cn-lines">${rows}</div></div>
      <button class="say ${c.ans ? d.to : d.from}" data-play><span class="ic">🔊</span>${c.ans ? 'Nghe câu tiếng ' + (d.to === 'zh' ? 'Trung' : 'Anh') : 'Nghe cô nói'}</button>`,
    bind() { bindPlay(() => [c.ans ? dst(L) : src(L)]); if (c.ans) SND.beep('ok'); }
  };
}

/* --- Ôn nhanh: nghe rồi chạm 1 trong 3 tranh --- */
function vQuiz(st, seats) {
  const i = Math.min(QUIZ.length - 1, st.i || 0), q = QUIZ[i], qid = `on_${i}_${st.run || 0}`, rv = st.step === 'rv';
  const ans = quizAns(q), my = myAnswer(qid), lang = quizLang(q), a = quizAudio(q);
  const flag = q.nghe ? '中文 · nhìn chữ' : { en: 'English', zh: '中文', doc: 'Nhìn chữ' }[lang];
  const key = ['on', i, st.run || 0, rv ? 1 : 0, my ? my.c : '-'].join('|');
  const prompt = q.l === 'doc' ? `<div class="chu ${/[a-z]/i.test(q.chu) ? 'latin' : 'zh'}">${esc(q.chu)}</div>${q.nghe ? `<button class="say zh" data-play><span class="ic">🔊</span><span>Nghe</span></button>` : ''}`
    : `<button class="say ${q.l}" data-play><span class="ic">🔊</span>${rv && CHIEU ? `<span class="${q.l}">${esc(txt(q.k, q.l))}</span>` : '<span>Nghe</span>'}</button>`;
  const pics = quizPics(q).map((src, c) => `<button class="pick${my && my.c === c ? ' chosen' : ''}${rv && CHIEU && c === ans ? ' right' : ''}${rv && CHIEU && c !== ans ? ' dim' : ''}" data-c="${c}" aria-label="Tranh ${c + 1}"><img src="${src}" alt=""></button>`).join('');
  let after = '';
  if (rv && CHIEU) after = `<p class="sub">Cả lớp cùng nghe nhé: <b class="${lang === 'doc' ? q.a : lang}">${esc(q.l === 'doc' ? q.chu : txt(q.k, q.l))}</b></p>`;
  let audio, akey = ['on', i, st.run || 0, rv ? 1 : 0, st.rp || 0].join('|');
  if (rv) audio = [a, 600, a];
  else if (q.l === 'doc' && q.nghe) audio = [a, 700, a];   // nghe tiếng và nhìn mặt chữ cùng lúc (他 / 她)
  else if (q.l === 'doc') audio = [hd('Con nhìn lại chữ nhé.')];
  else audio = i === 0 && !st.rp ? [hd('Con nghe và chạm vào tranh đúng nhé!'), 400, a, 700, a] : [a, 700, a];
  return {
    key, akey, audio,
    html: `<div class="qno">Câu ${i + 1}/${QUIZ.length} <span class="flag ${lang}">${flag}</span>${headAllowed(st) ? HEAD_TAG : ''}</div>
      <p class="ask-line">${q.l === 'doc' ? (q.nghe ? '👂👀 Con nghe, nhìn chữ rồi chạm vào tranh đúng nhé!' : '👀 Con nhìn chữ rồi chạm vào tranh đúng nhé!') : '👂 Con nghe và chạm vào tranh đúng nhé!'}</p>${prompt}
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
  const opts = [1, 2, 3, 4].map(t => `<button class="path${x.o ? ' two' : ''}${my && my.c === t ? ' chosen' : ''}${rv && CHIEU && t === x.t ? ' right' : ''}${rv && CHIEU && t !== x.t ? ' dim' : ''}" data-c="${t}">${planeSVG(toneOpt(x, t), 'pl' + t)}<span>${TONE_NAME[toneOpt(x, t)]}</span></button>`).join('');
  const head = `<div class="tone-head"><img src="${tonePic(x)}" alt=""><div class="chu zh">${toneChar(x)}</div>
    <div class="tone-side"><div class="py">${rv && CHIEU ? x.py : x.p0}</div>${a ? `<button class="say zh tone-say" data-play><span class="ic">🔊</span>Nghe</button>` : '<p class="sub">Cô đọc trên Zoom</p>'}</div></div>`;
  const body = rv && CHIEU ? `<div class="cheer" style="color:var(--red)">Cả lớp đưa tay bay theo, nói theo nhé! ✋ ${x.py}</div><div class="fly-big">${planeSVG(toneOpt(x, x.t), 'plBig', true)}</div>`
    : `<div class="paths${my || CHIEU ? ' locked' : ''}" id="pics">${opts}</div>${!CHIEU && !my && st.tayOn !== false ? '<button class="btn tay-go" id="tayGo">✋ Bay bằng tay</button>' : ''}<p class="count" id="cnt"></p>`;
  const akey = ['tone', i, st.run || 0, rv ? 1 : 0, st.rp || 0].join('|');
  return {
    key, akey, audio: rv ? [hd('Cả lớp đưa tay bay theo, nói theo nhé!'), 300].concat(a ? [a, 700, a, 700, a] : []) : (i === 0 && !st.rp ? [hd('Con nghe rồi chạm vào đường bay đúng nhé!'), 300] : []).concat(a ? [a, 800, a] : []),
    html: `<div class="qno">Máy bay thanh điệu ${i + 1}/${TONES.length}</div>${rv && CHIEU ? '' : '<p class="ask-line">✈️ Con nghe rồi chạm vào đường bay đúng nhé!</p>'}${head}${body}`,
    bind() {
      bindPlay(() => a ? [a] : []);
      $$('.path', $('#stage')).forEach(b => b.addEventListener('click', () => { const m = $('#pl' + b.dataset.c); m && m.beginElement && m.beginElement(); }));
      bindPicks(qid, c => ({ c, ok: c === x.t, tay: TAY.used(qid) ? 1 : undefined }), '.path');
      const tg = $('#tayGo'); if (tg) tg.onclick = () => TAY.start(x, qid, c => { const b = $(`.path[data-c="${c}"]`); b && b.click(); });
      if (my && !rv) { const m = $('#pl' + my.c); try { m && m.beginElement && m.beginElement(); } catch (e) { } }
      if (rv && my && my.ok) giveStar(qid, 'tone');
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
    html: `<div class="qno">Trò chơi đôi bạn · lượt ${(p.n || 0) + 1}${headAllowed(st) && role !== 'say' ? HEAD_TAG : ''}</div>${duo}${body}`,
    bind() {
      bindPlay(() => [a], role === 'say'); bindPicks(qid, c => ({ c, ok: c === ans, xem: role === 'see' || undefined }));
      if (rv && !CHIEU) { if (role === 'say' && la && la.ok) giveStar(qid, 'pairSay'); else if (role !== 'say' && my && my.ok) giveStar(qid, role === 'hear' ? 'pairHear' : 'pairSee'); }
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
    : me ? [hd('Con là cô giáo nhỏ! Con nói cho cả lớp nghe nhé!') || hd('Đến lượt con!'), 300, a] : (p.n === 0 && !st.rp ? [hd('Con nghe bạn nói rồi chạm tranh đúng nhé!')] : null);
  return {
    key, akey, audio, priv: !rv && me,
    html: `<div class="qno">📣 Cô giáo nhỏ · lượt ${(p.n || 0) + 1}${headAllowed(st) && !me ? HEAD_TAG : ''}</div>${who}${body}`,
    bind() {
      bindPlay(() => [a], me); if (!me) bindPicks(qid, c => ({ c, ok: c === ans }));
      if (rv && !CHIEU) { if (me && hit) giveStar(qid, 'lopSay'); else if (!me && my && my.ok) giveStar(qid, 'lopHear'); }
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

/* --- Nghe truyện, xếp tranh --- */
let xepPick = {};   // qid -> các cảnh con đã chạm theo thứ tự
function xepOrder(r, run) {   // thứ tự xáo riêng cho từng máy, không trùng thứ tự đúng
  let seed = 7; (DB.uid + r + run).split('').forEach(ch => seed = (seed * 31 + ch.charCodeAt(0)) % 99991);
  let o = shuffleSeeded([0, 1, 2, 3], seed || 1);
  if (o.join() === '0,1,2,3') o = [2, 0, 3, 1];
  return o;
}
function vXep(st, seats) {
  const x = st.xep || {}, r = x.r || 0, S = XEP[r], step = x.step || 'nghe', sc = Math.min(3, x.sc || 0), run = st.run || 0, qid = `xep_${r}_${run}`;
  const lab = l => l === 'zh' ? '中文' : 'English';
  const head = `<div class="qno">🧩 ${esc(S.title)} · Lượt ${r + 1}/2 <span class="flag ${S.from}">nghe ${lab(S.from)}</span> → <span class="flag ${S.to}">xếp ${lab(S.to)}</span></div>`;
  if (step === 'nghe') {
    const a = xepAud(S.scenes[sc], S.from);
    return {
      key: 'xep|' + r + '|nghe|' + sc, akey: 'xep|' + r + '|nghe|' + sc + '|' + (st.rp || 0), audio: sc === 0 && !st.rp ? [hd('Mình cùng nghe truyện nhé!'), 400, a] : [a],
      html: `${head}<p class="ask-line">👂 Con nghe truyện thật kỹ, lát nữa con xếp lại tranh nhé!</p><img class="scene" src="${S.scenes[sc].img}" alt="">
        <div class="scene-cap"><span class="${S.from}">${esc(S.scenes[sc][S.from])}</span></div><div class="dots">${S.scenes.map((_, j) => `<i class="${j <= sc ? 'on' : ''}"></i>`).join('')}</div>`
    };
  }
  const order = xepOrder(r, run), my = myAnswer(qid), picks = xepPick[qid] || (my && my.order ? my.order.slice() : []);
  if (CHIEU) {   // màn chiếu: lúc các con xếp thì chỉ hiện tranh xáo; lúc hiện đáp án thì hiện thứ tự đúng và đọc từng cảnh bằng tiếng kia
    if (step === 'xep') return {
      key: 'xep|' + r + '|xep', akey: 'xep|' + r + '|xep', audio: null,
      html: `${head}<p class="ask-line">🧩 Các bạn xếp tranh theo thứ tự truyện vừa nghe nhé!</p>
        <div class="xep-grid">${[1, 3, 0, 2].map(i => `<div class="xep-t"><img src="${S.scenes[i].img}" alt=""><span class="${S.to}">${esc(S.scenes[i][S.to])}</span></div>`).join('')}</div><p class="count" id="cnt"></p>`,
      update() { const done = seats.filter(s => answerOf(room, s, qid)).length; $('#cnt').textContent = `${done}/${seats.length} bạn đã xếp xong`; },
      bind() { this.update(); }
    };
    return {
      key: 'xep|' + r + '|rv|' + sc, akey: 'xep|' + r + '|rv|' + sc + '|' + (st.rp || 0), audio: [xepAud(S.scenes[sc], S.to)],
      html: `${head}<p class="ask-line">🗣️ Cả lớp cùng nói theo bằng ${S.to === 'zh' ? 'tiếng Trung' : 'tiếng Anh'} nhé!</p>
        <div class="xep-grid rv">${S.scenes.map((s, i) => `<div class="xep-t${i === sc ? ' cur' : ''}"><b class="xep-n">${i + 1}</b><img src="${s.img}" alt=""><span class="${S.to}">${esc(s[S.to])}</span><small class="${S.from}">${esc(s[S.from])}</small></div>`).join('')}</div>`
    };
  }
  /* máy bé: chạm lần lượt tranh 1, 2, 3, 4 */
  const doneMine = picks.length === 4;
  const key = ['xep', r, step, run, picks.join('')].join('|');
  return {
    key, akey: 'xep|' + r + '|' + step, audio: step === 'xep' && !doneMine && !picks.length ? [hd('Con chạm lần lượt các tranh theo thứ tự truyện nhé!') || hd('Con nghe và chạm vào tranh đúng nhé!')] : null,
    html: `${head}<p class="ask-line">${doneMine ? '✅ Con xếp xong rồi! Chờ cô nhé.' : `🧩 Con chạm tranh thứ <b>${picks.length + 1}</b> của truyện nhé!`}</p>
      <div class="xep-grid${step === 'rv' ? ' locked' : ''}">${order.map(i => { const n = picks.indexOf(i); return `<div class="xep-t kid${n >= 0 ? ' on' : ''}" data-i="${i}">${n >= 0 ? `<b class="xep-n">${n + 1}</b>` : ''}<img src="${S.scenes[i].img}" alt=""><span class="${S.to}">${esc(S.scenes[i][S.to])}</span><button class="xep-say" data-a="${xepAud(S.scenes[i], S.to)}" aria-label="Nghe">🔊</button></div>`; }).join('')}</div>
      ${step === 'xep' && picks.length ? '<button class="btn ghost" id="xRe">↺ Xếp lại</button>' : ''}`,
    bind() {
      $$('.xep-say', $('#stage')).forEach(b => b.onclick = e => { e.stopPropagation(); play([b.dataset.a], amCo() ? PRIV_VOL : 1); });
      if (step === 'rv') { if (my && my.ok) giveStar(qid, 'xep'); return; }
      $$('.xep-t.kid', $('#stage')).forEach(t => t.onclick = () => {
        const cur = (xepPick[qid] || picks).slice(), i = +t.dataset.i;
        if (cur.indexOf(i) >= 0 || cur.length >= 4) return;
        cur.push(i); xepPick[qid] = cur; SND.beep('pop');
        if (cur.length === 4) {
          const n = cur.filter((v, j) => v === j).length;
          DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, { order: cur, n, ok: n === 4, ms: Math.round(performance.now() - shownAt), at: DB.now() }).catch(er => console.error(er));
          SND.beep('ok');
        }
        lastStageKey = ''; render();
      });
      const re = $('#xRe'); if (re) re.onclick = () => { xepPick[qid] = []; if (myAnswer(qid)) DB.remove(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid).catch(() => { }); lastStageKey = ''; render(); };
    }
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

/* --- Cả lớp đấu Rồng Lửa: xem lz-boss.js --- */

/* --- Huy hiệu Bứt phá cả nhóm --- */
/* --- Hát chào mở đầu: màn chiếu phát video YouTube khi cô bấm Phát; máy các con hiện lời để hát và làm động tác theo --- */
function vHat(st) {
  const sg = st.song || {}, playing = !!sg.on;
  if (CHIEU) return {
    key: 'hat|' + (playing ? sg.n : 0) + '|' + (muted ? 1 : 0),
    html: playing ? `<div class="song-box"><iframe src="${songSrc(true, muted)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="${esc(SONG.ten)}"></iframe></div><p class="small">Video: ${esc(SONG.nguon)} (YouTube)</p>`
      : `<div class="qno">🎵 Hát chào</div><h1>${esc(SONG.ten)}</h1><img class="huou" src="${HUOU}" alt="">${songLyrics(true)}<p class="sub">Cả lớp đứng dậy, sẵn sàng hát và làm động tác nhé!</p>`
  };
  return {
    key: 'hat|' + (playing ? 1 : 0),
    html: `<div class="qno">🎵 Hát chào</div><h1>${playing ? 'Cùng hát nào! 🎶' : esc(SONG.ten)}</h1>${songLyrics(false)}<p class="sub">Con xem màn cô trên Zoom, hát và làm động tác theo nhé!</p>`
  };
}

function vBadge(st, seats) {
  const vi = st.vinh == null ? -1 : st.vinh;
  if (vi >= 0 && seats[vi]) {
    const k = seats[vi], t = seatStars(room, k), [tt, ic] = starTitle(t), me = k.id === mySeat;
    return {
      key: 'vinh|' + vi + '|' + k.id + '|' + t.sao, akey: 'vinh|' + vi, audio: me ? [hd('Giỏi quá!')] : null,
      html: `<div class="qno">🏆 Vinh danh · ${vi + 1}/${seats.length}</div>
        <div class="vd-hero"><div class="vd-ava"><img src="${faceOf(k)}" alt=""><span class="vd-crown">👑</span></div>
          <h1>${esc(me ? 'Con: ' + k.kid : k.kid)}</h1><div class="vd-title">${ic} ${esc(tt)}</div>
          <div class="vd-star">⭐ ${t.sao}</div>
          <div class="vd-counts"><span>✋ ${t.tay}</span><span>✅ ${t.dung}</span><span>🎤 ${t.noi}</span></div>
          <p class="sub">Sao được cộng vào ví sao trên web học để con đổi quà nhé! 🎁</p></div>`,
      bind() { SND.beep('win'); confetti(); }
    };
  }
  return {
    key: 'badge|' + seats.map(s => s.id + (s.photo ? 'p' : '') + seatStars(room, s).sao).join(','), akey: 'badge', audio: (LZ_CFG.huy || 'Bứt phá') === 'Bứt phá' ? [hd('Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá!'), 300, hd('Tuyệt vời! Con đã học xong hôm nay rồi!')] : [hd('Giỏi quá!'), 300, hd('Tuyệt vời! Con đã học xong hôm nay rồi!')],
    html: `<div class="medal"><small>Huy hiệu</small><b>${esc((LZ_CFG.huy || 'Bứt phá').toUpperCase())}</b><small>⭐ Vòng ${LZ_CFG.vong} ⭐</small></div><h1>Cả nhóm giỏi quá!</h1>
      <div class="team">${seats.map(s => `<div class="face${s.id === mySeat ? ' me' : ''}"><img src="${faceOf(s)}" alt=""><span>${esc(s.kid)}</span><b class="vd-mini">⭐ ${seatStars(room, s).sao}</b></div>`).join('')}</div>`,
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
/* Tặng sao: ngôi sao to xoay vào, không chữ khen (các con chưa đọc kịp).
   Cứ 3–4 sao im lặng thì sao kế tiếp có cô Hươu đọc một câu khen theo đúng việc con vừa làm, đổi câu mỗi lần.
   Câu nào chưa có file giọng (xem GIONG-CAN-THU.md) thì tạm đọc "Giỏi quá!" – không dùng giọng máy. */
const PRAISE = {
  on_en: ['Con nghe tiếng Anh tinh ghê!', 'Tai con bắt được từ tiếng Anh rồi!'],
  on_zh: ['Con nghe ra tiếng Trung rồi đó!', 'Con nhận ra từ tiếng Trung nhanh ghê!'],
  on_doc: ['Con nhìn chữ là nhận ra liền!', 'Con nhớ mặt chữ rồi đó!'],
  pb: ['Con nhìn chữ là nhận ra liền!', 'Con nhớ mặt chữ rồi đó!', 'Giỏi quá!'],
  tone: ['Máy bay của con bay đúng đường rồi!', 'Tai con bắt thanh điệu chuẩn ghê!'],
  pairSay: ['Con nói rõ nên bạn hiểu liền!', 'Bạn nghe con nói là hiểu ngay!'],
  pairHear: ['Con hiểu ý bạn rồi đó!', 'Con lắng nghe bạn giỏi ghê!'],
  pairSee: ['Con đoán đúng cùng các bạn rồi!'],
  lopSay: ['Cô giáo nhỏ nói hay ghê, các bạn hiểu rồi!', 'Con nói rõ, cả lớp hiểu con rồi!'],
  lopHear: ['Con hiểu cô giáo nhỏ rồi đó!', 'Con lắng nghe bạn rất chăm!'],
  boss: ['Cả lớp cùng nhau thắng Rồng Lửa rồi!'],
  xep: ['Con nhớ truyện giỏi ghê!', 'Con xếp tranh đúng hết rồi!']
};
let lastPraise = '';
function praiseAudio(kind) {
  const list = PRAISE[kind] || PRAISE.on_en;
  let pool = list.filter(x => x !== lastPraise); if (!pool.length) pool = list;
  const t = pool[Math.floor(Math.random() * pool.length)];
  lastPraise = t;
  return hd(t) || hd('Giỏi quá!');
}
function giveStar(qid, kind) {
  if (CHIEU) return;
  const key = 'lz-sao-' + CODE + '-' + DB.uid;
  const list = stars(); if (list.indexOf(qid) >= 0) return;
  list.push(qid); lsSet(key, list); starPill();
  let ov = $('#starOv'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'starOv'; ov.className = 'star-ov';
  ov.innerHTML = `<div class="star-card"><div class="star-big">⭐</div><b>+1 sao</b><small>⭐ ${list.length}</small></div>`;
  document.body.appendChild(ov); ov.onclick = () => ov.remove();
  SND.beep('ok');
  let next = +lsGet(key + '-noi', 0) || (4 + Math.floor(Math.random() * 2));   // sao thứ 4 hoặc 5 mới nói lần đầu
  if (list.length >= next) {
    setTimeout(() => play([praiseAudio(kind)], amCo() ? PRIV_VOL : 1), 500);
    next = list.length + 4 + Math.floor(Math.random() * 2);                     // sau đó 3–4 sao im lặng
  }
  lsSet(key + '-noi', next);
  setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 500); }, 2200);
}

/* --- chạm và nghe --- */
function bindPlay(fn, priv) { $$('[data-play]', $('#stage')).forEach(b => b.onclick = () => play(fn(), priv && amCo() ? PRIV_VOL : 1)); }
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
async function startChieu() {
  CODE = CHIEU;
  try { const lop = await DB.get(roomPath(CODE) + '/state/lop'); if (lop && LZ_LOPS[lop] && lop !== LZ_LOP) { location.replace(lopUrl(lop)); return; } } catch (e) { }
  if (window.parent !== window) document.addEventListener('keydown', e => { try { parent.lzKey && parent.lzKey(e); } catch (er) { } });
  document.title = 'Màn chiếu – Phòng ' + CODE;
  const link = location.href.split('?')[0];
  $('#topInfo').innerHTML = `<span class="chieu-code">Mã phòng ${esc(CODE)}</span> <button class="pill mute-btn" id="mu">${muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'}</button>`;
  $('#mu').onclick = () => { muted = !muted; lsSet('lz-chieu-mute', muted); if (muted) { SND.stop(); BA.stop(); } else if ((room.state || {}).ph === 'boss') { lastStageKey = ''; render(); } $('#mu').textContent = muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'; };
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
