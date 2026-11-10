/* Chung kết Rung chuông vàng – màn bé (link chung), màn chiếu (?chieu=MÃ) và bảng xếp hạng cho livestream (?bang=MÃ).
   Âm thanh: Phần 1 và lời cô Hươu phát ở màn chiếu (qua Zoom). Phần 2, 3, 4 mỗi bé nghe câu hỏi trên máy mình
   (câu hỏi theo bậc của từng bé), nên cô tắt tiếng tất cả trên Zoom khi các con làm bài. */
const CHIEU = QS.get('chieu') || '';
const BANG = QS.get('bang') || '';
const app = $('#app');
const HUOU = TN + 'nhan-vat/huou_huou1_a.webp';
let muted = CHIEU ? !!lsGet('ck-chieu-mute', false) : false;
let ME = lsGet('ck-me', null);
let CODE = '', room = {}, joined = false, mySeat = null;
let stageKey = '', audioKey = '', shownAt = 0, playTok = 0;
const picked = {};   // câu vừa chọn trên máy này (chờ Firebase ghi xong)
function play(list, v) { if (!muted) return SND.play(list, v); return Promise.resolve(); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- thông tin của con ---------- */
function prefill() {
  const me = ME || {}, kid = lsGet('lle-kid', null);
  return { kid: me.kid || (kid && kid.name) || '', parent: me.parent || '', ava: me.ava || 'bong', lv: me.lv || (kid && kid.group === 'canopy' ? 'canopy' : kid && kid.group === 'seed' ? 'seed' : ''), web: (kid && kid.id) || me.web || '' };
}
function profileForm(onDone) {
  const f = prefill();
  let ava = f.ava, lv = f.lv;
  app.innerHTML = `<div class="wrap"><form class="card" id="pf">
    <h2>Thông tin của con</h2>
    <label class="field"><span>Tên của con</span><input id="fKid" autocomplete="off" value="${esc(f.kid)}" placeholder="Ví dụ: Bông"></label>
    <label class="field"><span>Tên ba hoặc mẹ</span><input id="fPar" autocomplete="off" value="${esc(f.parent)}" placeholder="Ví dụ: Mẹ Hoa"></label>
    <div class="field"><span>Con học level nào?</span><div class="lv-pick" id="lvG">
      ${Object.entries(CK_LV).map(([k, n]) => `<button type="button" data-lv="${k}" class="${k === lv ? 'on' : ''}">${k === 'seed' ? '🌱' : '🌳'} ${n}</button>`).join('')}
    </div></div>
    <div class="field"><span>Con chọn bạn đồng hành nhé</span><div class="ava-grid" id="avaG">
      ${AVATARS.map(a => `<button type="button" data-a="${a.id}" class="${a.id === ava ? 'on' : ''}"><img src="${a.img}" alt="">${esc(a.n)}</button>`).join('')}
    </div></div>
    <div id="pfMsg"></div>
    <button class="btn wide red">Vào phòng thi</button>
  </form></div>`;
  $('#avaG').onclick = e => { const b = e.target.closest('button'); if (!b) return; ava = b.dataset.a; SND.beep('pop'); $$('#avaG button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#lvG').onclick = e => { const b = e.target.closest('button'); if (!b) return; lv = b.dataset.lv; SND.beep('pop'); $$('#lvG button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#pf').onsubmit = e => {
    e.preventDefault(); SND.unlock();
    const kid = $('#fKid').value.trim(), parent = $('#fPar').value.trim();
    if (!kid) return $('#pfMsg').innerHTML = '<p class="msg err">Ba mẹ nhập tên của con nhé.</p>';
    if (!lv) return $('#pfMsg').innerHTML = '<p class="msg err">Ba mẹ chọn level con đang học nhé (Little Seed hoặc Canopy).</p>';
    ME = { kid, parent, ava, lv, web: f.web, t: Date.now() };
    lsSet('ck-me', ME);
    onDone();
  };
}

/* ---------- mã phòng ---------- */
function codeScreen(msg) {
  const pre = (QS.get('phong') || '').replace(/\D/g, '').slice(0, 4);
  app.innerHTML = `<div class="wrap"><form class="card" id="cf" style="text-align:center">
    <img class="huou" src="${HUOU}" alt="">
    <h2>Chung kết Rung chuông vàng</h2><p class="vn small" style="margin-top:-6px">Ba mẹ nhập mã phòng 4 số cô hiện trên màn Zoom</p>
    <div class="code-in">${[0, 1, 2, 3].map(i => `<input inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Số ${i + 1}" value="${pre[i] || ''}">`).join('')}</div>
    <div>${msg ? `<p class="msg err">${esc(msg)}</p>` : ''}</div>
    <button class="btn wide red">Vào phòng thi</button>
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
    let t = null, lop = '';
    try { t = await DB.get(roomPath(code) + '/teacher'); lop = await DB.get(roomPath(code) + '/state/lop'); } catch (er) { return codeScreen('Mạng đang chập chờn. Ba mẹ thử lại nhé.'); }
    if (!t) return codeScreen('Chưa thấy phòng ' + code + '. Ba mẹ xem lại mã trên màn Zoom của cô nhé.');
    if (lop !== CK_LOP) { location.href = '../lop-zoom/?phong=' + code + (lop ? '&lop=' + lop : '') + '&tiep=1'; return; }
    CODE = code;
    if (ME && ME.kid && ME.lv) confirmScreen(); else profileForm(join);
  };
}
function confirmScreen() {
  app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center">
    <img src="${avaImg(ME.ava)}" alt="" class="me-face">
    <h2>Chào con, ${esc(ME.kid)}!</h2><p class="vn small">${ME.parent ? 'Ba/mẹ: ' + esc(ME.parent) + ' · ' : ''}Level ${CK_LV[ME.lv]}</p>
    <button class="btn wide red" id="go">Vào phòng thi</button>
    <p><button class="btn ghost" id="edit" style="font-size:16px">Không phải con / sửa thông tin</button></p></div></div>`;
  $('#go').onclick = () => { SND.unlock(); join(); };
  $('#edit').onclick = () => profileForm(join);
}

/* ---------- vào phòng ---------- */
async function join() {
  app.innerHTML = '<div class="wrap"><div class="card"><p>Đang vào phòng thi…</p></div></div>';
  const base = roomPath(CODE), uid = DB.uid;
  try {
    const P = (await DB.get(base + '/players')) || {}, mine = P[uid];
    let seat = (mine && mine.seat) || '';
    if (!seat) {   // nhận chỗ cô đã tạo (bé 1 máy, cô thêm trước) hoặc chỗ cũ khi vào lại bằng máy khác: trùng tên con, không đang trực tuyến
      const nk = normName(ME.kid), np = normName(ME.parent);
      const c = buildSeats(P).filter(s => s.id !== uid && s.ids.indexOf(uid) < 0 && normName(s.kid) === nk && (!np || !s.parent || normName(s.parent) === np) && !s.on);
      if (c.length) seat = (c.find(s => /^t_/.test(s.id)) || c[0]).id;
    }
    const me = { kid: ME.kid, parent: ME.parent || '', ava: ME.ava || 'bong', lv: ME.lv, on: true, t: (mine && mine.t) || DB.now(), web: ME.web || '' };
    if (!mine) { me.src = seat ? 'nhan-cho' : 'tu-vao'; me.ord = DB.now(); }
    if (seat) me.seat = seat;
    await DB.update(base + '/players/' + uid, me);
    DB.onDisc(base + '/players/' + uid + '/on', false);
  } catch (er) { console.error(er); return codeScreen('Chưa vào được phòng thi. Ba mẹ thử lại nhé.'); }
  joined = true;
  try { navigator.wakeLock && navigator.wakeLock.request('screen'); } catch (e) { }
  $('#topInfo').innerHTML = `<span class="pill y" id="saoPill">⭐ 0</span> <span class="pill">${esc(ME.kid)} · ${CK_LV[ME.lv]}</span>`;
  starPill();
  DB.on(base, v => { room = v || {}; renderSoon(); });
}
function watchConn() {
  DB.onConn(ok => {
    $('#net').classList.toggle('off', !ok);
    if (ok && joined) { DB.set(roomPath(CODE) + '/players/' + DB.uid + '/on', true).catch(() => { }); DB.onDisc(roomPath(CODE) + '/players/' + DB.uid + '/on', false); }
  });
}

/* ======================= hiển thị ======================= */
function seats() { return buildSeats(room.players).filter(s => s.ok); }
function findMe() { return buildSeats(room.players).find(s => s.ids.indexOf(DB.uid) >= 0) || null; }
function myAns(qid) { return picked[qid] || (mySeat ? answerOf(room, mySeat, qid) : null); }
let tickT = null;
function render() {
  const st = room.state || {};
  if (!CHIEU) {
    mySeat = findMe();
    if (joined && !mySeat) return removed();
  }
  if (!$('#stage')) app.innerHTML = `<div class="room${CHIEU ? ' chieu' : ''}"><div class="stage" id="stage"></div></div>`;
  document.body.classList.toggle('boss-play', !CHIEU && st.ph === 'p3' && bossState() === 'run');
  const v = view(st);
  if (v.key !== stageKey) {
    if (st.ph !== render.ph) { render.ph = st.ph; const ov = $('#starOv'); if (ov) ov.remove(); }   // sang phần mới: bỏ thẻ sao / chuông còn che màn
    stageKey = v.key; shownAt = performance.now(); playTok++;
    $('#stage').innerHTML = v.html;
    if (v.bind) v.bind();
    clearInterval(tickT); tickT = v.tick ? setInterval(v.tick, 250) : null;   // chỉ đặt lại nhịp khi đổi màn (dữ liệu đổi liên tục trong trận)
  }
  if (v.akey && v.akey !== audioKey) { audioKey = v.akey; if (v.audio) v.audio(); }
  if (v.update) v.update();
  overlayBoard(st);
}
/* gộp các thay đổi dồn dập (40 bé cùng trả lời) thành tối đa khoảng 6 lần vẽ mỗi giây */
let rsT = null, rsAt = 0;
function renderSoon() {
  if (rsT) return;
  const wait = Math.max(0, 160 - (Date.now() - rsAt));
  rsT = setTimeout(() => { rsT = null; rsAt = Date.now(); render(); }, wait);
}
function removed() { app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center"><img class="huou" src="${HUOU}" alt=""><h2>Con đã ra khỏi phòng thi</h2><p class="vn">Ba mẹ nhắn cô trên Zoom nếu cần vào lại nhé.</p></div></div>`; stageKey = ''; }

function view(st) {
  switch (st.ph) {
    case 'p1': return vP1(st);
    case 'p2': return vP2(st);
    case 'p3': return vP3(st);
    case 'p4': return vP4(st);
    case 'trao': return vTrao(st);
    default: return vCho(st);
  }
}

/* --- chờ --- */
function vCho(st) {
  const S = seats();
  if (CHIEU) {
    const link = location.href.split('?')[0];
    const key = 'cho|' + S.map(s => s.id + (s.on ? 1 : 0)).join(',');
    return {
      key, akey: 'cho', audio: () => play([ckLoi('chao')]),
      html: `<h1 class="ck-title">🔔 Chung kết Rung chuông vàng</h1>
        <div class="ck-join"><div>Vào thi tại <b>${esc(link.replace(/^https?:\/\//, ''))}</b></div><div>Mã phòng <span class="ck-code">${esc(CODE)}</span></div></div>
        <p class="sub">${Object.entries(CK_LV).map(([lv, n]) => `${n}: <b>${S.filter(s => seatLv(room, s) === lv).length}</b> bạn`).join(' · ')}</p>
        <div class="ck-wall">${S.map(s => `<div class="face${s.on ? '' : ' off'}"><img src="${faceOf(s)}" alt=""><span>${esc(s.kid)}</span></div>`).join('')}</div>`
    };
  }
  const lv = mySeat ? seatLv(room, mySeat) : ME.lv;
  return { key: 'cho|' + lv, html: `<img class="huou" src="${HUOU}" alt=""><h1>Con đã vào phòng thi!</h1><p class="sub">Level <b>${CK_LV[lv]}</b>. Con chờ cô bắt đầu nhé.</p><img class="me-face" src="${avaImg(ME.ava)}" alt="">` };
}

/* --- vẽ đề và lựa chọn --- */
function promptHTML(p, big) {
  let h = '';
  if (p.img) h += p.img === 'ongba' ? `<div class="ck-ongba">${['grandpa', 'grandma'].map(k => `<img src="${ckImg(k)}" alt="">`).join('')}</div>` : `<img class="ck-pimg${big ? ' big' : ''}" src="${ckImg(p.img)}" alt="">`;
  if (p.chu) h += `<div class="chu zh">${esc(p.chu)}</div>`;
  if (p.txt) h += `<div class="chu latin ck-word">${esc(ckTxt(p.txt, 'en'))}</div>`;
  if (p.t) h += `<p class="ask-line">${esc(p.t)}</p>`;
  if (p.a) h += `<button class="say ${p.a[1]}" id="pPlay"><span class="ic">🔊</span><span>${p.a[1] === 'zh' ? '中文' : 'English'}</span></button>`;
  return h;
}
function optHTML(o, c, pos) {   // c: số thứ tự trong dữ liệu (0 là đáp án), pos: vị trí trên màn
  if (o.t === 'img') return `<button class="pick" data-c="${c}"><img src="${ckImg(o.k)}" alt=""></button>`;
  if (o.t === 'txt') return `<button class="pick ck-txt" data-c="${c}"><span>${esc(ckTxt(o.k, 'en'))}</span></button>`;
  if (o.t === 'say') return `<button class="pick ck-say ${o.l}" data-c="${c}"><b class="ck-num">${(pos == null ? c : pos) + 1}</b><span class="ck-sp">🔊</span><span class="ck-rep" data-rep="${c}" title="Nghe lại">↺</span></button>`;
  if (o.t === 'pair') return `<button class="pick ck-pair" data-c="${c}">${['grandpa', 'grandma'].map((k, j) => `<span><img src="${ckImg(k)}" alt=""><b class="zh">${o.c[j]}</b></span>`).join('')}</button>`;
  return '';
}
function optAudio(o) { return o.t === 'say' ? ckAud(o.k, o.l) : ''; }
/* phát đề rồi (nếu lựa chọn là lời nói) phát lần lượt từng lựa chọn, sáng thẻ đang phát */
async function playQ(p, opts, tok) {
  if (muted) return;
  if (p.a) { await SND.play([ckAud(p.a[0], p.a[1])]); if (tok !== playTok) return; }
  const box = $('#pics');
  for (let j = 0; j < opts.length; j++) {
    const a = optAudio(opts[j]); if (!a) continue;
    if (tok !== playTok || (box && box.classList.contains('locked'))) return;
    const el = box && box.querySelector(`[data-c="${j}"]`);
    el && el.classList.add('playing');
    await sleep(350); if (tok !== playTok) return;
    await SND.play([a]);
    el && el.classList.remove('playing');
  }
}
function bindOpts(opts, onPick) {
  const box = $('#pics'); if (!box) return;
  $$('[data-rep]', box).forEach(r => r.onclick = e => { e.stopPropagation(); playTok++; play([optAudio(opts[+r.dataset.rep])]); });
  $$('.pick', box).forEach(b => b.onclick = () => {
    if (box.classList.contains('locked')) return;
    playTok++; SND.stop();
    box.classList.add('locked'); b.classList.add('chosen');
    onPick(+b.dataset.c, b);
  });
}

/* --- Phần 1: cả lớp làm chung (một đề cho mọi bé), màn chiếu phát tiếng --- */
function p1Prompt(q) {
  if (q.k === 'pick') return { a: [q.w, q.l] };
  if (q.k === 'lang') return { a: [q.w, q.l] };
  return {};
}
function vP1(st) {
  const i = Math.min(CK_P1.length - 1, st.i || 0), q = CK_P1[i], rv = st.step === 'rv', qid = 'p1_' + i;
  const head = `<div class="qno">🌱 Phần 1 · Ôn tập · Câu ${i + 1}/${CK_P1.length}</div>`;
  const key = ['p1', i, rv ? 'rv' : 'q'].join('|');
  if (q.k === 'chao' || q.k === 'noi') {
    const k = q.k === 'chao' ? null : q.w;
    const html = `${head}<p class="ask-line">${esc(q.t)}</p>${q.k === 'chao' ? `<img class="huou" src="${q.img}" alt=""><div class="ck-lines"><span class="en">Hello!</span><span class="zh">你好！</span></div>` : `<img class="ck-pimg big" src="${ckImg(k)}" alt=""><div class="ck-lines"><span class="en">${esc(ckTxt(k, 'en'))}</span><span class="zh">${esc(ckTxt(k, 'zh'))}</span></div>`}`;
    const aud = q.k === 'chao' ? [ckAud('hello', 'en'), 500, ckAud('hello', 'zh')] : [ckAud(k, 'en'), 900, ckAud(k, 'zh')];
    return { key, akey: key + '|' + (st.rp || 0), html, audio: () => { if (CHIEU) play((i === 0 && !st.rp ? [ckLoi('p1'), 400] : []).concat(aud)); } };
  }
  const opts = q.k === 'lang' ? [{ t: 'lang', l: 'en' }, { t: 'lang', l: 'zh' }] : q.o.map(k => ({ t: 'img', k }));
  const ans = q.k === 'lang' ? (q.l === 'en' ? 0 : 1) : 0;
  const order = q.k === 'lang' ? [0, 1] : ckOrder(3, 'p1' + i);
  const my = myAns(qid);
  const optH = c => q.k === 'lang' ? `<button class="pick ck-lang ${opts[c].l}${CHIEU && rv && c === ans ? ' right' : ''}${my && my.c === c ? ' chosen' : ''}" data-c="${c}">${opts[c].l === 'en' ? 'English' : '中文'}</button>`
    : optHTML(opts[c], c).replace('class="pick', `class="pick${CHIEU && rv && c === ans ? ' right' : ''}${CHIEU && rv && c !== ans ? ' dim' : ''}${my && my.c === c ? ' chosen' : ''}`);
  const html = `${head}<p class="ask-line">${q.k === 'lang' ? '🤔 Tiếng Anh hay tiếng Trung?' : '👂 Con nghe rồi chạm tranh đúng nhé!'}</p>${promptHTML(p1Prompt(q))}
    <div class="pics${q.k === 'lang' ? ' two' : ''}${CHIEU || my || rv ? ' locked' : ''}" id="pics">${order.map(optH).join('')}</div>
    ${CHIEU ? '<p class="count" id="cnt"></p>' : my ? '<p class="sub">✅ Con chọn rồi! Chờ cô nhé.</p>' : ''}${rv && q.k === 'lang' && CHIEU ? `<div class="ck-lines"><span class="${q.l}">${q.l === 'en' ? 'English' : '中文'}</span></div>` : ''}`;
  return {
    key: key + '|' + (my ? 'x' : ''), akey: key + '|' + (st.rp || 0), html,
    audio: () => { if (CHIEU) play((i === 1 && !rv && !st.rp ? [hd('Con nghe và chạm vào tranh đúng nhé!'), 300] : []).concat(rv ? [] : [ckAud(q.w, q.l)])); },
    bind() {
      const pp = $('#pPlay'); if (pp) pp.onclick = () => play([ckAud(q.w, q.l)]);
      if (CHIEU) return;
      if (rv && my && my.ok) giveStar(qid);
      if (!my && !rv) bindOpts(opts, c => save(qid, { c, ok: c === ans }));
    },
    update() { const c = $('#cnt'); if (c) { const S = seats(); c.textContent = `${S.filter(s => answerOf(room, s, qid)).length}/${S.length} bạn đã chọn`; } }
  };
}
function save(qid, rec) {
  rec = Object.assign({ ms: Math.round(performance.now() - shownAt), at: DB.now() }, rec);
  picked[qid] = rec; SND.beep('ok');
  DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, rec).catch(er => console.error(er));
  stageKey = ''; render();
}

/* --- Phần 2: Rung chuông vàng, mỗi bé một bậc --- */
function vP2(st) {
  const i = Math.min(CK_P2.length - 1, st.i || 0), Q = CK_P2[i], rv = st.step === 'rv', qid = 'p2_' + i;
  const last = !!Q.chuong;
  const head = `<div class="qno">🔔 Phần 2 · ${last ? '<b>Câu chuông vàng</b>' : `Câu ${i + 1}/${CK_P2.length}`}</div>`;
  const timer = `<div class="ck-timer"><i id="tBar"></i></div>`;
  if (CHIEU) {
    const A = CK_P2_ANS[i];
    const html = `${head}${rv ? '' : timer}${promptHTML({ img: Q.img }, true)}
      ${rv ? `<div class="ck-lines big"><span class="en">${esc(ckTxt(A, 'en'))}</span><span class="zh">${esc(ckTxt(A, 'zh'))}</span></div>${last ? '<div class="ck-bell-n" id="bellN"></div>' : ''}` : '<p class="ask-line">👂 Các con nghe trên máy mình rồi chọn nhé!</p>'}
      <p class="count" id="cnt"></p>`;
    const key = ['p2', i, rv ? 'rv' : 'q'].join('|');
    return {
      key, akey: key + '|' + (st.rp || 0), html,
      audio: () => play(rv ? [ckAud(A, 'en'), 700, ckAud(A, 'zh')] : (i === 0 && !st.rp ? [ckLoi('p2')] : last && !st.rp ? [ckLoi('chuong')] : [])),
      bind() { if (rv && last) { SND.beep('win'); confetti(); } },
      update() {
        const S = seats(), n = S.filter(s => answerOf(room, s, qid)).length;
        const c = $('#cnt'); if (c) c.textContent = `${n}/${S.length} bạn đã chọn`;
        const b = $('#bellN'); if (b) b.innerHTML = `🔔 <b>${S.filter(s => (answerOf(room, s, qid) || {}).ok).length}</b> bạn rung chuông vàng!`;
      },
      tick: rv ? null : () => p2Timer(st)
    };
  }
  const my = myAns(qid);
  const b = my && my.b != null ? CK_BANDS.indexOf(my.b) : p2Band(room, mySeat, i), V = Q[CK_BANDS[b]];
  const order = ckOrder(V.o.length, qid + DB.uid);
  const key = ['p2', i, CK_BANDS[b], my ? 'x' : '', rv ? 'rv' : ''].join('|');
  const html = `${head}${rv ? '' : timer}${promptHTML(V.p)}
    <div class="pics${my || rv ? ' locked' : ''}" id="pics">${order.map((c, j) => optHTML(V.o[c], c, j).replace('class="pick', `class="pick${my && my.c === c ? ' chosen' : ''}`)).join('')}</div>
    ${my ? '<p class="sub">✅ Con chọn rồi! Chờ cô nhé.</p>' : rv ? '<p class="sub">Cô đang đọc đáp án, con nghe nhé!</p>' : ''}`;
  return {
    key, akey: ['p2', i, CK_BANDS[b]].join('|') + '|' + (st.rp || 0), html,
    audio: () => { if (!my && !rv) playQ(V.p, order.map(c => V.o[c]), playTok); },
    bind() {
      const pp = $('#pPlay'); if (pp) pp.onclick = () => { playTok++; playQ(V.p, order.map(c => V.o[c]), playTok); };
      if (rv) { if (my && my.ok) last ? ringBell(qid) : giveStar(qid); return; }
      if (!my) bindOpts(V.o, c => save(qid, { c, ok: c === 0, b: CK_BANDS[b] }));
    },
    tick: rv ? null : () => p2Timer(st)
  };
}
function p2Timer(st) {
  const bar = $('#tBar'); if (!bar || !st.t0) return;
  const left = Math.max(0, 1 - (DB.now() - st.t0) / (CK_P2_SEC * 1000));
  bar.style.width = (left * 100) + '%'; bar.classList.toggle('low', left < .3);
}

/* --- Phần 3: Rồng Lửa (theo giờ, mỗi bé theo tốc độ của mình) --- */
function bossState() { const info = bossInfo(room); return info.pre ? 'pre' : info.done ? 'done' : 'run'; }
let BQX = null, bossShown = '', bossHitsSeen = 0, bossSurge = false, bossFightAt = 0;
function vP3(st) {
  const info = bossInfo(room), state = info.pre ? 'pre' : info.done ? 'done' : 'run', run = info.run;
  const key = 'p3|' + run + '|' + state;
  let html;
  if (!CHIEU && state === 'run') html = `<div class="boss-split"><div class="bs-scene">${bossScene(info, false)}</div><div class="bs-q"><div id="bq" class="bq"></div></div></div>`;
  else html = `<div class="qno">🐉 Phần 3 · Cả lớp đấu Rồng Lửa</div>${bossScene(info, !!CHIEU)}${!CHIEU && state === 'pre' ? '<p class="sub">Cô bấm bắt đầu là con tự trả lời liên tục nhé. Câu nào đúng cũng giúp anh hùng Bông mạnh hơn!</p>' : ''}${!CHIEU && state === 'done' ? `<p class="sub">Con trả lời đúng <b>${mySeat ? ckP3(room, mySeat).n : 0}</b> câu. Giỏi quá!</p>` : ''}`;
  return {
    key, html,
    bind() {
      bossStage = info.done ? 0 : (info.prog || 0) >= 0.8 ? 1 : (info.prog || 0) >= 0.5 ? 2 : 3;
      bossShown = state; bossHitsSeen = info.H || 0; bossSurge = false; bossFightAt = Date.now();
      bossFaces(info);
      if (CHIEU && !muted) {
        if (state === 'run') { BA.mood('calm'); BA.start(); play([ckLoi('p3')]); }
        else if (state === 'done') { BA.mood('win'); BA.start(); setTimeout(() => BA.stop(), 6000); BA.fanfare(); setTimeout(() => play([hd('Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng!')]), 1200); }
        else BA.stop();
      }
      if (state === 'done') confetti();
      if (!CHIEU && state === 'run') {
        if (!BQX || BQX.run !== run) {
          const saved = lsGet('ck-boss-' + CODE + '-' + run + '-' + DB.uid, null);
          BQX = saved || { run, n: 0, b: mySeat ? p2Final(room, mySeat) : bandStart(ME.lv), up: 0, dn: 0 };
          BQX.it = null;
        }
        bossAskCk();
      }
    },
    tick: () => bossTickCk()
  };
}
function bossSaveState() { const s = Object.assign({}, BQX); delete s.it; lsSet('ck-boss-' + CODE + '-' + BQX.run + '-' + DB.uid, s); }
function bossAskCk() {
  const box = $('#bq'); if (!box) return;
  const it = BQX.it = bossQ(BQX.b, BQX.it); if (!it) return;
  const order = [0, 1, 2].sort(() => Math.random() - .5);
  box.innerHTML = `${promptHTML(it.p)}
    <div class="pics" id="pics">${order.map((c, j) => optHTML(it.o[c], c, j)).join('')}</div>`;
  const tok = ++playTok;
  playQ(it.p, order.map(c => it.o[c]), tok);
  const pp = $('#pPlay'); if (pp) pp.onclick = () => { const t = ++playTok; playQ(it.p, order.map(c => it.o[c]), t); };
  const t0 = performance.now();
  bindOpts(it.o, async (c, btn) => {
    const ok = c === 0, qid = 'boss_' + BQX.run + '_' + BQX.n, b = CK_BANDS[BQX.b];
    BQX.n++;
    if (ok) { BQX.up++; BQX.dn = 0; if (BQX.up >= 2) { BQX.b = Math.min(2, BQX.b + 1); BQX.up = 0; } }
    else { BQX.dn++; BQX.up = 0; if (BQX.dn >= 2) { BQX.b = Math.max(0, BQX.b - 1); BQX.dn = 0; } }
    bossSaveState();
    DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, { c, ok, b, ms: Math.round(performance.now() - t0), at: DB.now(), k: it.k, l: it.l }).catch(er => console.error(er));
    if (ok) {
      BA.power();
      const f = document.createElement('div'); f.className = 'b-plus'; f.innerHTML = '⚡<b>+1</b>'; box.appendChild(f);
      flash($('#bHero'), 'charge', 700);
      await sleep(600);
    } else {
      /* chọn chưa đúng: thẻ đúng sáng lên, nhân vật đọc lại lời đúng (có hình, có tiếng, không để màn trống) rồi sang câu mới */
      const right = box.querySelector('[data-c="0"]'); right && right.classList.add('right');
      btn.classList.add('dim');
      const a = it.o[0].t === 'say' ? ckAud(it.k, it.o[0].l) : it.l === 'doc' ? ckAud(it.k, 'en') : ckAud(it.k, it.l);
      const t1 = Date.now();
      if (a && !muted) await Promise.race([SND.play([a]), sleep(2600)]);
      const rest = 1500 - (Date.now() - t1); if (rest > 0) await sleep(rest);
    }
    if ($('#bq') === box && bossState() === 'run') bossAskCk();
  });
}
/* nhịp cập nhật trận đấu (màn bé và màn chiếu) – theo lz-boss.js của Lớp Zoom */
function bossTickCk() {
  if ((room.state || {}).ph !== 'p3') { BA.stop(); return; }
  const info = bossInfo(room), state = info.pre ? 'pre' : info.done ? 'done' : 'run';
  if (state !== bossShown) { stageKey = ''; render(); return; }
  const pos = $('#bPos'); if (!pos) return;
  pos.style.left = info.pos + '%';
  $('#bH').textContent = info.H || 0;
  $('#bT').textContent = info.pre ? '' : Math.ceil(info.left / 1000) + 's';
  $('#bMsg').textContent = bossMsg(info);
  const sc = $('#bScene'); sc && sc.classList.toggle('surge', info.surge);
  bossFaces(info);
  if (state !== 'run') return;
  const sound = CHIEU && !muted;
  if (info.surge && !bossSurge) { bossSurge = true; if (sound) { BA.mood('tense'); BA.roar(); setTimeout(() => play([hd('Rồng Lửa nổi giận rồi! Cả lớp trả lời nhanh nào!')]), 600); } }
  if (!info.surge && bossSurge && sound) BA.mood('calm');
  if (Date.now() - bossFightAt > (info.surge ? 900 : 1500)) { bossFightAt = Date.now(); bossFight(info, sound); }
  if (CHIEU && info.H > bossHitsSeen) {   // bạn vừa tiếp sức bay vào anh hùng, hiện ở hàng "Tiếp sức" (không đếm điểm từng bạn)
    const all = buildSeats(room.players), bub = $('#bBub'), feed = $('#bFeed');
    info.hits.slice(bossHitsSeen).slice(-3).forEach(([, u], j) => {
      const s = all.find(x => x.ids.indexOf(u) >= 0 || x.id === u); if (!s) return;
      setTimeout(() => {
        if (bub) { const e = document.createElement('div'); e.className = 'b-fly'; e.innerHTML = `<img src="${faceOf(s)}" alt=""><b>${esc(s.kid)} ⚡</b>`; e.style.left = (5 + Math.random() * 50) + '%'; bub.appendChild(e); setTimeout(() => e.remove(), 1400); }
        if (feed) { const r = document.createElement('div'); r.className = 'b-f'; r.innerHTML = `<img src="${faceOf(s)}" alt=""><b>${esc(s.kid)}</b><span>+1 ⚡</span>`; feed.prepend(r); while (feed.children.length > 5) feed.lastChild.remove(); }
        if (sound) BA.power();
      }, j * 180);
    });
    flash($('#bHero'), 'charge', 700);
  }
  bossHitsSeen = info.H || 0;
}

/* --- Phần 4: nghe truyện, xếp tranh chuyển ngữ --- */
function p4Ver() { return mySeat && p2Final(room, mySeat) >= 1 ? 'B' : 'A'; }   // A: nghe tiếng Anh, thẻ tiếng Trung (chạm nghe); B/C: nghe tiếng Trung, thẻ chữ tiếng Anh
function p4Lines(j, l) { const ks = j === 6 ? CK_P4.extra.k : CK_P4.scenes[j]; return ks.map(k => ckAud(k, l)); }
function p4Text(j, l) { const ks = j === 6 ? CK_P4.extra.k : CK_P4.scenes[j]; return ks.map(k => ckTxt(k, l)).join(' – '); }
function p4Img(j) { return ckImg(j === 6 ? CK_P4.extra.img : CK_P4.img[j]); }
let p4Pick = {};
function vP4(st) {
  const P = st.p4 || {}, run = P.run || 0, step = P.step || 'cho', qid = 'p4_' + run;
  const head = `<div class="qno">🧩 Phần 4 · Nghe truyện "${esc(CK_P4.title)}", xếp tranh</div>`;
  const N = CK_P4.scenes.length;
  if (step === 'rv') {
    const sc = Math.min(N - 1, P.sc || 0);
    return {
      key: 'p4|rv|' + run + '|' + sc, akey: 'p4|rv|' + run + '|' + sc + '|' + (st.rp || 0),
      html: `${head}<p class="ask-line">🗣️ Cả lớp cùng nói theo nhé!</p><div class="xep-grid ck-xg rv">${CK_P4.scenes.map((_, j) => `<div class="xep-t${j === sc ? ' cur' : ''}"><b class="xep-n">${j + 1}</b><img src="${p4Img(j)}" alt=""><span class="en">${esc(p4Text(j, 'en'))}</span><small class="zh">${esc(p4Text(j, 'zh'))}</small></div>`).join('')}</div>
        ${!CHIEU && (myAns(qid) || {}).pts != null ? `<p class="sub">Con xếp đúng <b>${myAns(qid).pts}</b>/7.</p>` : ''}`,
      audio: () => { if (CHIEU) play(p4Lines(sc, 'en').concat([700], p4Lines(sc, 'zh'))); },
      bind() { const my = myAns(qid); if (!CHIEU && my && my.pts === 7) giveStar(qid); }
    };
  }
  if (CHIEU) {
    if (step === 'xep') return {
      key: 'p4|xep|' + run, akey: 'p4|xep|' + run, audio: () => play([ckLoi('xep')]),
      html: `${head}<p class="ask-line">🧩 Các bạn xếp tranh theo thứ tự truyện vừa nghe nhé!</p><div class="xep-grid ck-xg">${ckOrder(7, 'chieu' + run).map(j => `<div class="xep-t"><img src="${p4Img(j)}" alt=""></div>`).join('')}</div><p class="count" id="cnt"></p>`,
      update() { const S = seats(); $('#cnt').textContent = `${S.filter(s => answerOf(room, s, qid)).length}/${S.length} bạn đã xếp xong`; }
    };
    return {
      key: 'p4|' + step + '|' + run, akey: 'p4|' + step + '|' + run, audio: () => { if (step === 'nghe') play([ckLoi('p4')]); },
      html: `${head}<img class="huou" src="${HUOU}" alt=""><h1>${step === 'nghe' ? '🎧 Các con đang nghe truyện trên máy của mình' : 'Sắp nghe truyện rồi!'}</h1><p class="sub">Truyện "${esc(CK_P4.title)}" · nghe 2 lần</p>`
    };
  }
  const v = p4Ver(), from = v === 'A' ? 'en' : 'zh', to = v === 'A' ? 'zh' : 'en';
  if (step === 'nghe' || step === 'cho') return {
    key: 'p4|' + step + '|' + run + '|' + v, akey: 'p4|' + step + '|' + run,
    html: `${head}<img class="huou" src="${HUOU}" alt=""><h1 id="p4h">${step === 'nghe' ? '🎧 Con nghe truyện thật kỹ nhé!' : 'Con chờ cô mở truyện nhé!'}</h1>
      <div class="dots" id="p4dots">${CK_P4.scenes.map(() => '<i></i>').join('')}</div><span class="flag ${from}">${from === 'zh' ? '中文' : 'English'}</span>
      ${step === 'nghe' ? '<p><button class="btn ghost" id="p4Re">🔊 Nghe lại</button></p>' : ''}`,
    audio: () => { if (step === 'nghe') p4Listen(from, 2); },
    bind() { const r = $('#p4Re'); if (r) r.onclick = () => p4Listen(from, 1); }
  };
  /* xếp tranh: chạm lần lượt 6 tranh theo thứ tự truyện, một thẻ thừa để ra ngoài */
  const order = ckOrder(7, DB.uid + 'p4' + run), my = myAns(qid);
  const picks = p4Pick[qid] || (my && my.order ? my.order.slice() : []);
  const done = picks.length === N;
  return {
    key: ['p4', 'xep', run, v, picks.join('')].join('|'), akey: 'p4|xep|' + run,
    audio: () => { if (!picks.length) play([hd('Con chạm lần lượt các tranh theo thứ tự truyện nhé!')]); },
    html: `${head}<p class="ask-line">${done ? '✅ Con xếp xong rồi! Chờ cô nhé.' : `🧩 Con chạm tranh thứ <b>${picks.length + 1}</b> của truyện nhé! <small>(có 1 tranh thừa)</small>`}</p>
      <div class="xep-grid ck-xg">${order.map(j => { const n = picks.indexOf(j); return `<div class="xep-t kid${n >= 0 ? ' on' : ''}" data-j="${j}">${n >= 0 ? `<b class="xep-n">${n + 1}</b>` : ''}<img src="${p4Img(j)}" alt="">${to === 'zh' ? `<button class="say zh xep-say" data-j="${j}"><span class="ic">🔊</span>中文</button>` : `<span class="en">${esc(p4Text(j, 'en'))}</span>`}</div>`; }).join('')}</div>
      ${picks.length ? '<button class="btn ghost" id="xRe">↺ Xếp lại</button>' : ''}`,
    bind() {
      $$('.xep-say', $('#stage')).forEach(b => b.onclick = e => { e.stopPropagation(); play(p4Lines(+b.dataset.j, 'zh').reduce((a, x) => a.concat(a.length ? [400, x] : [x]), [])); });
      $$('.xep-t.kid', $('#stage')).forEach(t => t.onclick = () => {
        const cur = (p4Pick[qid] || picks).slice(), j = +t.dataset.j;
        if (cur.indexOf(j) >= 0 || cur.length >= N) return;
        cur.push(j); p4Pick[qid] = cur; SND.beep('pop');
        if (cur.length === N) {
          const pts = cur.filter((x, k) => x === k).length + (cur.indexOf(6) < 0 ? 1 : 0);
          const rec = { order: cur, pts, ok: pts === 7, b: v, ms: Math.round(performance.now() - shownAt), at: DB.now() };
          picked[qid] = rec;
          DB.set(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid, rec).catch(er => console.error(er));
          SND.beep('ok');
        }
        stageKey = ''; render();
      });
      const re = $('#xRe'); if (re) re.onclick = () => { p4Pick[qid] = []; delete picked[qid]; if (answerOf(room, mySeat, qid)) DB.remove(roomPath(CODE) + '/answers/' + qid + '/' + DB.uid).catch(() => { }); stageKey = ''; render(); };
    }
  };
}
async function p4Listen(l, times) {
  const tok = ++playTok;
  for (let t = 0; t < times; t++) {
    for (let j = 0; j < CK_P4.scenes.length; j++) {
      if (tok !== playTok) return;
      $$('#p4dots i').forEach((d, k) => d.classList.toggle('on', k <= j));
      await play(p4Lines(j, l).reduce((a, x) => a.concat(a.length ? [400, x] : [x]), []));
      await sleep(600);
    }
    if (t < times - 1) await sleep(1200);
  }
  const h = $('#p4h'); if (h && tok === playTok) h.textContent = '✅ Con nghe xong rồi! Chờ cô nhé.';
}

/* --- Trao giải --- */
function vTrao(st) {
  const res = ckResults(room);
  if (CHIEU) return {
    key: 'trao|' + JSON.stringify(Object.values(res.by).map(L => L.slice(0, 5).map(r => r.seat.id + r.tong))), akey: 'trao',
    html: `<h1 class="ck-title">🏆 Chúc mừng các nhà thám hiểm ngôn ngữ!</h1><div class="ck-board">${Object.keys(CK_LV).map(lv => ckBoardHTML(res, lv, 5)).join('')}</div>`,
    audio: () => { play([ckLoi('trao')]); confetti(); SND.beep('win'); }
  };
  const r = mySeat && res.rows.find(x => x.seat.id === mySeat.id);
  return {
    key: 'trao|' + (r ? r.giai : ''), akey: 'trao',
    html: `<div class="ck-award"><div class="ck-cup">${r ? CK_CUP[r.giai] : '🧭'}</div><h1>${r ? esc(r.giai) : 'Nhà thám hiểm ngôn ngữ'}</h1><p class="sub">${esc(ME.kid)} · ${CK_LV[r ? r.lv : ME.lv]}</p><p class="sub">Con đã hoàn thành Chung kết Rung chuông vàng. Cô khen con nhé!</p></div>`,
    audio: () => { confetti(); SND.beep('win'); }
  };
}

/* bảng xếp hạng phủ lên màn chiếu khi cô bật (giữa các phần) */
function overlayBoard(st) {
  let ov = $('#bdOv');
  if (!CHIEU || !st.bang || st.ph === 'trao') { if (ov) ov.remove(); return; }
  const res = ckResults(room);
  if (!ov) { ov = document.createElement('div'); ov.id = 'bdOv'; ov.className = 'bd-ov'; document.body.appendChild(ov); }
  ov.innerHTML = `<h2>📊 Bảng xếp hạng</h2><div class="ck-board">${Object.keys(CK_LV).map(lv => ckBoardHTML(res, lv, 5)).join('')}</div>`;
}

/* ---------- sao, chuông, pháo giấy ---------- */
function stars() { return lsGet('ck-sao-' + CODE + '-' + DB.uid, []) || []; }
function starPill() { const el = $('#saoPill'); if (el) el.textContent = '⭐ ' + stars().length; }
function giveStar(qid) {
  if (CHIEU) return;
  const list = stars(); if (list.indexOf(qid) >= 0) return;
  list.push(qid); lsSet('ck-sao-' + CODE + '-' + DB.uid, list); starPill();
  overlay(`<div class="star-card"><div class="star-big">⭐</div><b>+1 sao</b><small>⭐ ${list.length}</small></div>`);
  SND.beep('ok');
}
function ringBell(qid) {
  const list = stars(); if (list.indexOf(qid) < 0) { list.push(qid); lsSet('ck-sao-' + CODE + '-' + DB.uid, list); starPill(); }
  overlay(`<div class="star-card ck-bellc"><div class="ck-bell">🔔</div><b>Con rung chuông vàng!</b></div>`, 3500);
  SND.beep('win'); confetti();
}
function overlay(html, ms) {
  let ov = $('#starOv'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'starOv'; ov.className = 'star-ov'; ov.innerHTML = html;
  document.body.appendChild(ov); ov.onclick = () => ov.remove();
  setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 500); }, ms || 2200);
}
function confetti() {
  const box = $('#confetti'), cols = ['#E3262E', '#FFC72C', '#3BB273', '#4AA3E8', '#F29B38'];
  box.innerHTML = Array.from({ length: 70 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${cols[i % 5]};animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.5}s"></i>`).join('');
  setTimeout(() => box.innerHTML = '', 7000);
}

/* ======================= màn chiếu, bảng xếp hạng ======================= */
async function startChieu() {
  CODE = CHIEU;
  if (window.parent !== window) document.addEventListener('keydown', e => { try { parent.ckKey && parent.ckKey(e); } catch (er) { } });
  document.title = 'Màn chiếu chung kết – Phòng ' + CODE;
  $('#topInfo').innerHTML = `<span class="chieu-code">Mã phòng ${esc(CODE)}</span> <button class="pill mute-btn" id="mu">${muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'}</button>`;
  $('#mu').onclick = () => { muted = !muted; lsSet('ck-chieu-mute', muted); if (muted) { SND.stop(); BA.stop(); } $('#mu').textContent = muted ? '🔇 Bật tiếng' : '🔊 Tắt tiếng'; };
  const go = () => { SND.unlock(); DB.on(roomPath(CODE), v => { room = v || {}; renderSoon(); }); };
  if (QS.has('tu')) return go();   // mở trong màn cô (đã bấm bật tiếng ở đó)
  app.innerHTML = `<div class="wrap"><div class="card" style="text-align:center"><h2>Màn chiếu phòng ${esc(CODE)}</h2><p class="vn">Cô chia sẻ cửa sổ này trên Zoom và tích "Chia sẻ âm thanh".</p><button class="btn red wide" id="st">🔊 Bật tiếng và bắt đầu</button></div></div>`;
  $('#st').onclick = go;
}
function startBang() {
  CODE = BANG; document.body.classList.add('bang');
  document.title = 'Bảng xếp hạng – Phòng ' + CODE;
  $('#topInfo').innerHTML = `<span class="chieu-code">🔔 Chung kết Rung chuông vàng</span>`;
  let t = null;
  DB.on(roomPath(CODE), v => {
    room = v || {};
    if (t) return;
    t = setTimeout(() => { t = null; drawBang(); }, 400);
  });
  function drawBang() {
    const res = ckResults(room);
    app.innerHTML = `<div class="ck-board bang">${Object.keys(CK_LV).map(lv => ckBoardHTML(res, lv, 5)).join('')}</div>`;
  }
}

/* ======================= khởi động ======================= */
(async function () {
  try { await DB.init({ perTab: QS.has('thu') }); }
  catch (e) { console.error(e); app.innerHTML = '<div class="wrap"><div class="card"><h2>Chưa kết nối được</h2><p class="vn">Mạng đang chập chờn. Ba mẹ tải lại trang giúp cô nhé.</p></div></div>'; return; }
  watchConn();
  if (BANG) return startBang();
  if (CHIEU) return startChieu();
  codeScreen();
})();
