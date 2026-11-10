/* Chung kết Rung chuông vàng – màn cô (máy tính).
   Cô mở phòng, chia sẻ màn chiếu lên Zoom, bấm qua 4 phần; tab Kết quả cập nhật trực tiếp từ Firebase,
   xếp hạng riêng Little Seed và Canopy. Cửa sổ "Bảng xếp hạng" (index.html?bang=MÃ) để đưa vào OBS khi livestream. */
const app = $('#app');
let CODE = '', room = {}, TAB = 'dk', lastHtmlKey = '';
const base = () => roomPath(CODE);
const ST = () => room.state || {};
function setState(o) { return DB.update(base() + '/state', o).catch(er => alert('Chưa lưu được: ' + er.message)); }
function linkKid() { return location.href.replace(/co\.html.*$/, '') + '?phong=' + CODE; }
function linkChieu() { return location.href.replace(/co\.html.*$/, '') + '?chieu=' + CODE; }
function linkBang() { return location.href.replace(/co\.html.*$/, '') + '?bang=' + CODE; }

/* ---------- mở phòng ---------- */
function startScreen(msg) {
  const old = lsGet('ck-co-room', null);
  app.innerHTML = `<div class="wrap"><div class="card"><h2>🔔 Chung kết Rung chuông vàng · Màn cô</h2>
    <p class="vn">Mở phòng mới để có mã 4 số. Các con Little Seed và Canopy vào cùng một phòng, web tự xếp hạng riêng theo level.</p>
    ${msg ? `<p class="msg err">${esc(msg)}</p>` : ''}
    <div class="ctl"><button class="btn red" id="nw">Mở phòng chung kết mới</button>
    ${old ? `<button class="btn ghost" id="od">Vào lại phòng ${esc(old.code)}</button>` : ''}</div></div></div>`;
  $('#nw').onclick = newRoom;
  if (old) $('#od').onclick = () => openRoom(old.code);
}
async function newRoom() {
  for (let t = 0; t < 8; t++) {
    const code = String(1000 + Math.floor(Math.random() * 9000));
    const has = await DB.get(roomPath(code) + '/teacher');
    if (has) continue;
    await DB.set(roomPath(code) + '/teacher', DB.uid);
    await DB.set(roomPath(code) + '/state', { lop: CK_LOP, ph: 'cho', i: 0, step: 'hoi', p4: { run: 0, step: 'cho' }, boss: { run: 0, dur: CK_BOSS_DUR } });
    return openRoom(code);
  }
  startScreen('Chưa mở được phòng, cô thử lại nhé.');
}
async function openRoom(code) {
  const t = await DB.get(roomPath(code) + '/teacher');
  if (t !== DB.uid) return startScreen('Phòng ' + code + ' do máy khác mở. Cô mở phòng mới nhé.');
  CODE = code; lsSet('ck-co-room', { code, t: Date.now() });
  $('#hdr').innerHTML = `Phòng <span class="code-big">${esc(CODE)}</span>`;
  let tm = null, lastAt = 0;
  DB.on(base(), v => {   // gộp các thay đổi dồn dập (trận Rồng Lửa) để màn cô không giật
    room = v || {};
    if (tm) return;
    const wait = Math.max(0, 300 - (Date.now() - lastAt));
    tm = setTimeout(() => { tm = null; lastAt = Date.now(); draw(); }, wait);
  });
}

/* ---------- điều khiển chung (nút, phím, thanh chia sẻ) ---------- */
const ACT = {
  next() {
    const s = ST();
    if (s.ph === 'p1' && (s.i || 0) < CK_P1.length - 1) return setState({ i: (s.i || 0) + 1, step: 'hoi' });
    if (s.ph === 'p2' && (s.i || 0) < CK_P2N - 1) return setState({ i: (s.i || 0) + 1, step: 'hoi', t0: DB.now() });
    if (s.ph === 'p4' && (s.p4 || {}).step === 'rv') { const sc = ((s.p4 || {}).sc || 0) + 1; if (sc < 6) return setState({ 'p4/sc': sc }); }
  },
  prev() {
    const s = ST();
    if ((s.ph === 'p1' || s.ph === 'p2') && (s.i || 0) > 0) return setState({ i: s.i - 1, step: 'hoi', t0: DB.now() });
    if (s.ph === 'p4' && (s.p4 || {}).step === 'rv' && ((s.p4 || {}).sc || 0) > 0) return setState({ 'p4/sc': s.p4.sc - 1 });
  },
  show() { const s = ST(); if (s.ph === 'p1' || s.ph === 'p2') return setState({ step: s.step === 'rv' ? 'hoi' : 'rv' }); },
  replay() { return setState({ rp: (ST().rp || 0) + 1 }); },
  phase(ph) { const o = { ph, i: 0, step: 'hoi', rp: 0 }; if (ph === 'p2') o.t0 = DB.now(); return setState(o); },
  bossStart() { const b = ST().boss || {}; return setState({ boss: { run: b.t0 ? (b.run || 0) + 1 : (b.run || 0), t0: DB.now(), dur: +($('#bDur') ? $('#bDur').value : CK_BOSS_DUR) } }); },
  bossEnd() { return setState({ 'boss/end': true }); },
  bossNew() { const b = ST().boss || {}; return setState({ boss: { run: (b.run || 0) + 1, dur: b.dur || CK_BOSS_DUR } }); },
  p4(step) { const p = ST().p4 || {}; return setState({ p4: { run: p.run || 0, step, sc: 0, t0: DB.now() } }); },
  p4New() { const p = ST().p4 || {}; return setState({ p4: { run: (p.run || 0) + 1, step: 'cho' } }); },
  bang() { return setState({ bang: !ST().bang }); }
};
window.ckKey = e => {
  if (!CODE) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); ACT.next(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); ACT.prev(); }
  else if (e.key === ' ') { e.preventDefault(); ACT.show(); }
  else if (e.key === 'r' || e.key === 'R') ACT.replay();
  else if (e.key === 'Escape') shareOff();
};
document.addEventListener('keydown', e => { if (!/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName)) window.ckKey(e); });

function shareOn() {
  $('#shareFr').src = linkChieu(); $('#share').classList.remove('hide'); document.body.classList.add('sharing'); drawBar();
}
function shareOff() { $('#share').classList.add('hide'); $('#shareFr').src = 'about:blank'; document.body.classList.remove('sharing'); }
function drawBar() {
  if ($('#share').classList.contains('hide')) return;
  const s = ST(), ph = CK_PH.find(p => p.id === s.ph) || CK_PH[0];
  const B = [];
  if (s.ph === 'p1' || s.ph === 'p2') B.push(['prev', '← Câu trước', 'ghost'], ['show', s.step === 'rv' ? '↺ Ẩn đáp án' : '👁 Hiện đáp án', 'y'], ['next', 'Câu tiếp →', ''], ['replay', '🔊 Phát lại', 'ghost']);
  if (s.ph === 'p3') B.push(['bossStart', '⚔️ Bắt đầu trận', 'red'], ['bossEnd', '⏹ Kết thúc', 'ghost']);
  if (s.ph === 'p4') B.push(['p4:nghe', '🎧 Phát truyện', ''], ['p4:xep', '🧩 Xếp tranh', 'y'], ['p4:rv', '👁 Đáp án', 'red'], ['prev', '← Cảnh', 'ghost'], ['next', 'Cảnh →', 'ghost']);
  B.push(['bang', s.bang ? '📊 Ẩn bảng' : '📊 Hiện bảng', 'ghost']);
  $('#shareBar').innerHTML = `<span class="lb">${ph.ic} ${esc(ph.n)}${s.ph === 'p1' || s.ph === 'p2' ? ` · câu ${(s.i || 0) + 1}` : ''}</span>` + B.map(([a, t, c]) => `<button class="btn sm ${c}" data-a="${a}">${t}</button>`).join('') + `<button class="btn sm ghost" id="shX">✖ Về màn điều khiển</button>`;
  $$('#shareBar [data-a]').forEach(b => b.onclick = () => { const [a, x] = b.dataset.a.split(':'); ACT[a](x); });
  $('#shX').onclick = shareOff;
}

/* ---------- vẽ ---------- */
function draw() {
  const S = buildSeats(room.players);
  const ok = S.filter(s => s.ok), on = ok.filter(s => s.on).length;
  $('#hdr').innerHTML = `Phòng <span class="code-big">${esc(CODE)}</span> <span class="pill">${on}/${ok.length} bé đang vào</span>`;
  if (!$('#tabs')) {
    app.innerHTML = `<div class="tabs" id="tabs"></div><div class="co-top" id="top"></div><div id="body"></div>`;
  }
  $('#tabs').innerHTML = [['dk', 'Điều khiển'], ['be', `Các bé <span class="n">${ok.length}</span>`], ['kq', 'Kết quả']].map(([k, t]) => `<button data-t="${k}" class="${TAB === k ? 'on' : ''}">${t}</button>`).join('');
  $$('#tabs button').forEach(b => b.onclick = () => { TAB = b.dataset.t; lastHtmlKey = ''; draw(); });
  $('#top').innerHTML = `<div class="ctl">
      <button class="btn red sm" id="shOn">🖥 Chia sẻ lên Zoom</button>
      <button class="btn ghost sm" id="cpK">📋 Chép link cho ba mẹ</button>
      <a class="btn ghost sm" href="${esc(linkChieu())}" target="_blank" rel="noopener">📺 Cửa sổ màn chiếu</a>
      <a class="btn ghost sm" href="${esc(linkBang())}" target="_blank" rel="noopener">📊 Cửa sổ bảng xếp hạng (OBS)</a>
      <button class="btn ${ST().bang ? 'y' : 'ghost'} sm" id="bgT">${ST().bang ? '📊 Đang hiện bảng trên màn chiếu' : '📊 Hiện bảng trên màn chiếu'}</button>
    </div>`;
  $('#shOn').onclick = shareOn;
  $('#cpK').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(`Chung kết Rung chuông vàng: ${linkKid()} · Mã phòng ${CODE}`); $('#cpK').textContent = '✅ Đã chép'; };
  $('#bgT').onclick = ACT.bang;
  const body = $('#body');
  const keep = document.activeElement && body.contains(document.activeElement) && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
  if (TAB === 'dk') body.innerHTML = drawDk(S);
  else if (TAB === 'be') { if (!keep) body.innerHTML = drawBe(S); }
  else body.innerHTML = drawKq();
  bindBody();
  drawBar();
}

function phaseList() {
  const s = ST();
  return `<div class="phases">${CK_PH.map(p => `<button data-ph="${p.id}" class="${s.ph === p.id || (!s.ph && p.id === 'cho') ? 'on' : ''}"><span>${p.ic}</span><span>${esc(p.n)}<small>${p.m}</small></span></button>`).join('')}</div>`;
}
function optPrev(o, ans) {
  const cls = ans ? ' class="ans"' : '';
  if (o.t === 'img') return `<img${cls} src="${ckImg(o.k)}" alt="" title="${esc(ckTxt(o.k, 'en'))}">`;
  if (o.t === 'pair') return `<span class="bigtxt${ans ? ' ok' : ''}">${o.c.join(' · ')}</span>`;
  return `<span class="opt-t${ans ? ' ok' : ''}">${o.t === 'say' ? '🔊 ' : '✍️ '}${esc(ckTxt(o.k, o.l || 'en'))}</span>`;
}
function promptPrev(p) {
  const a = [];
  if (p.a) a.push(`🔊 <b>${esc(ckTxt(p.a[0], p.a[1]))}</b> <span class="flag ${p.a[1]}">${p.a[1] === 'zh' ? '中文' : 'EN'}</span>`);
  if (p.chu) a.push(`chữ <b class="zh">${esc(p.chu)}</b>`);
  if (p.txt) a.push(`chữ <b>${esc(ckTxt(p.txt, 'en'))}</b>`);
  if (p.img) a.push('tranh đề');
  if (p.t) a.push(esc(p.t));
  return a.join(' · ');
}
function drawDk(S) {
  const s = ST(), ph = s.ph || 'cho';
  let mid = '', side = '';
  const ok = S.filter(x => x.ok);
  if (ph === 'cho') {
    mid = `<h3>🚪 Chờ các con vào phòng</h3><div class="tip">1. Bấm <b>🖥 Chia sẻ lên Zoom</b>, bấm nút đỏ trong màn chiếu để bật tiếng, rồi chia sẻ cửa sổ này trên Zoom (tích "Chia sẻ âm thanh").<br>2. Bấm <b>📋 Chép link cho ba mẹ</b> và dán vào chat Zoom. Mỗi bé mở link trên máy thứ hai, nhập mã <b>${esc(CODE)}</b>, chọn level.<br>3. Bé chỉ có 1 máy: thêm ở tab <b>Các bé</b>, cô bấm hộ.<br>4. Khi các con làm bài (Phần 2–4), cô <b>tắt tiếng tất cả</b> trên Zoom: mỗi bé nghe câu hỏi trên máy mình.</div>
      <p>${Object.entries(CK_LV).map(([lv, n]) => `${n}: <b>${ok.filter(x => seatLv(room, x) === lv).length}</b>`).join(' · ')}</p>`;
  } else if (ph === 'p1') {
    const i = s.i || 0, q = CK_P1[i], qid = 'p1_' + i;
    mid = `<h3>🌱 Phần 1 · Câu ${i + 1}/${CK_P1.length}</h3><p class="small">Cả lớp làm chung, không tính xếp hạng, đúng được sao. Màn chiếu phát tiếng; cô hiện đáp án thì màn chiếu đọc cả hai tiếng.</p>
      <p><span class="ck-lvtag ${q.lv}">${CK_LV[q.lv]} · Vòng ${q.r}: ${esc(CK_ROUNDS[q.lv][q.r - 1])}</span> <b>${CK_T[q.t]}</b></p>
      <div class="prev">🔊 <b>${esc(ckTxt(q.w, q.l))}</b> <span class="flag ${q.l}">${q.l === 'zh' ? '中文' : 'EN'}</span> ${q.o.map((k, j) => optPrev({ t: 'img', k }, j === 0)).join('')}</div>
      ${ctlQ(s)}<p class="count">${countDone(ok, qid)}</p>`;
  } else if (ph === 'p2') {
    const i = s.i || 0, qid = 'p2_' + i, last = i === CK_P2N - 1;
    mid = `<h3>🔔 Phần 2 · ${last ? 'Câu chuông vàng' : `Câu ${i + 1}/${CK_P2N}`} · ${p2Days(i)}</h3>
      <p class="small">${last ? 'Câu chuông vàng soạn tay, mỗi level một câu, 3 bậc.' : 'Mỗi bé nhận một mục ngẫu nhiên của ngày học này (từ, cụm từ hoặc câu), không lặp mục; cả lớp phủ hết nội dung của 18 ngày. Cô hiện đáp án thì máy mỗi bé sáng thẻ đúng và đọc hai tiếng.'}</p>
      ${Object.entries(CK_LV).map(([lv, n]) => {
        const L = ok.filter(x => seatLv(room, x) === lv), dist = [0, 1, 2].map(b => L.filter(x => p2Band(room, x, i) === b).length);
        const dayItems = last ? [] : CK_SLOTS[i].map(d => CK_DAYS[lv][d - 1]).flat().map(x => x[0]).filter((x, j, A) => A.indexOf(x) === j);
        return `<p><span class="ck-lvtag ${lv}">${n}</span> A ${dist[0]} · B ${dist[1]} · C ${dist[2]} bé</p>
          ${last ? `<table class="res"><tr><th>Bậc</th><th>Đề</th><th>Lựa chọn (xanh là đáp án)</th></tr>${CK_BANDS.map(b => `<tr><td><b>${b}</b></td><td>${promptPrev(CK_CHUONG[lv][b].p)}</td><td><div class="prev sm">${CK_CHUONG[lv][b].o.map((o, j) => optPrev(o, j === 0)).join('')}</div></td></tr>`).join('')}</table>`
            : `<p class="small">Nội dung ngày này: ${dayItems.map(k => esc(ckTxt(k, 'en'))).join(' · ')}</p>`}`;
      }).join('')}
      ${ctlQ(s)}<div class="timer" id="coT"></div><p class="count">${countDone(ok, qid)}</p>`;
    side = `<h3>Bé chỉ có 1 máy: cô bấm hộ</h3><div class="kids">${ok.filter(x => !x.on || /^t_/.test(x.id)).map(x => {
      const a = answerOf(room, x, qid), bi = p2Band(room, x, i), b = CK_BANDS[bi], V = p2Q(seatLv(room, x), x.id, i, bi);
      return `<div class="kid${x.on ? '' : ' off'}"><img src="${faceOf(x)}" alt=""><div class="nm"><span class="dot"></span>${esc(x.kid)} <span class="tag">bậc ${b}</span></div><div class="meta">${a ? (a.ok ? '<span class="st ok">Đúng</span>' : '<span class="st no">Chưa đúng</span>') : '<span class="st none">Chưa chọn</span>'}</div>
        <div class="row small">Đề: ${promptPrev(V.p)} · đáp án <b>${esc(ckTxt(V.ans, 'en'))}</b></div>
        <div class="row"><button class="px" data-px="${x.id}|${qid}|1|${b}">✓ Đúng</button><button class="px" data-px="${x.id}|${qid}|0|${b}">✗ Chưa</button></div></div>`;
    }).join('') || '<p class="small">Không có bé nào cần bấm hộ.</p>'}</div>`;
  } else if (ph === 'p3') {
    const info = bossInfo(room), b = s.boss || {};
    mid = `<h3>🐉 Phần 3 · Cả lớp đấu Rồng Lửa</h3>
      <p class="small">Theo giờ, mỗi bé làm theo tốc độ của mình, không giới hạn số câu. Câu hỏi theo bậc (bắt đầu từ bậc cuối Phần 2), mỗi câu đúng +1 ⚡ cho cả lớp và +1 điểm cho bé. Màn chiếu không hiện điểm từng bạn.</p>
      <div class="ctl"><label>Thời gian <select id="bDur">${[120000, 180000, 240000].map(d => `<option value="${d}"${(b.dur || CK_BOSS_DUR) === d ? ' selected' : ''}>${d / 60000} phút</option>`).join('')}</select></label>
        <button class="btn red" data-act="bossStart">⚔️ ${info.pre ? 'Bắt đầu trận' : 'Bắt đầu lại'}</button><button class="btn ghost" data-act="bossEnd">⏹ Kết thúc sớm</button><button class="btn ghost" data-act="bossNew">↺ Về màn chờ trận</button></div>
      <div class="timer" id="coT">${info.pre ? 'Chưa bắt đầu' : info.done ? 'Đã xong' : Math.ceil(info.left / 1000) + ' giây'}</div><p>⚡ Cả lớp: <b>${info.H || 0}</b> câu đúng</p>`;
    side = `<h3>Bé 1 máy: con nói đáp án trên Zoom, cô bấm ⚡</h3><div class="kids">${ok.filter(x => !x.on || /^t_/.test(x.id)).map(x => `<div class="kid${x.on ? '' : ' off'}"><img src="${faceOf(x)}" alt=""><div class="nm">${esc(x.kid)}</div><div class="row"><button class="px" data-bx="${x.id}">⚡ +1</button> <span class="small">${ckP3(room, x).n} câu đúng</span></div></div>`).join('') || '<p class="small">Không có bé nào cần bấm hộ.</p>'}</div>`;
  } else if (ph === 'p4') {
    const P = s.p4 || {}, qid = 'p4_' + (P.run || 0);
    mid = `<h3>🧩 Phần 4 · Nghe truyện, xếp tranh chuyển ngữ</h3>
      <p class="small">Mỗi level một truyện. Bé bậc A (cuối Phần 2) nghe tiếng Anh, thẻ tranh có lời tiếng Trung (chạm để nghe); bé bậc B, C nghe tiếng Trung, thẻ có chữ tiếng Anh. Mỗi máy tự phát truyện 2 lần. 7 thẻ: 6 thẻ đúng thứ tự + 1 thẻ thừa; tối đa 7 điểm. Hiện đáp án: màn chiếu đọc từng cảnh của cả hai truyện.</p>
      ${Object.entries(CK_LV).map(([lv, n]) => `<p><span class="ck-lvtag ${lv}">${n}</span> <b>"${esc(CK_P4[lv].title)}"</b></p><ol class="small">${CK_P4[lv].scenes.map(ks => `<li>${ks.map(k => esc(ckTxt(k, 'en'))).join(' – ')} · <span class="zh">${ks.map(k => esc(ckTxt(k, 'zh'))).join(' ')}</span></li>`).join('')}<li style="list-style:none">Thẻ thừa: ${esc(ckTxt(CK_P4[lv].extra.k[0], 'en'))}</li></ol>`).join('')}
      <div class="ctl"><button class="btn${P.step === 'nghe' ? ' y' : ''}" data-act="p4:nghe">🎧 1. Phát truyện</button><button class="btn${P.step === 'xep' ? ' y' : ''}" data-act="p4:xep">🧩 2. Các con xếp tranh</button><button class="btn red" data-act="p4:rv">👁 3. Hiện đáp án</button>
        ${P.step === 'rv' ? `<button class="btn ghost" data-act="prev">← Cảnh trước</button><button class="btn ghost" data-act="next">Cảnh tiếp →</button><span class="small">Cảnh ${(P.sc || 0) + 1}/6</span>` : ''}
        <button class="btn ghost" data-act="p4New">↺ Làm lại lượt mới</button></div>
      <p class="count">${countDone(ok, qid)}</p>`;
    side = `<h3>Bé 1 máy: cô nhập điểm xếp tranh (0–7)</h3><div class="kids">${ok.filter(x => !x.on || /^t_/.test(x.id)).map(x => `<div class="kid${x.on ? '' : ' off'}"><img src="${faceOf(x)}" alt=""><div class="nm">${esc(x.kid)}</div><div class="row"><select data-p4="${x.id}"><option value="">–</option>${[0, 1, 2, 3, 4, 5, 6, 7].map(n => `<option${(((room.marks || {})[x.id] || {}).p4 === n) ? ' selected' : ''}>${n}</option>`).join('')}</select></div></div>`).join('') || '<p class="small">Không có bé nào cần bấm hộ.</p>'}</div>`;
  } else if (ph === 'trao') {
    const res = ckResults(room);
    mid = `<h3>🏆 Trao giải</h3><p class="small">Màn chiếu hiện top 5 mỗi level và pháo giấy. Máy mỗi bé hiện giải của con. Kết quả đầy đủ ở tab Kết quả.</p><div class="ck-board">${Object.keys(CK_LV).map(lv => ckBoardHTML(res, lv, 5)).join('')}</div>`;
  }
  if (!side) side = `<h3>Các bé (${ok.length})</h3><div class="kids">${ok.map(x => `<div class="kid${x.on ? '' : ' off'}"><img src="${faceOf(x)}" alt=""><div class="nm"><span class="dot"></span>${esc(x.kid)}</div><div class="meta">${CK_LV[seatLv(room, x)]}</div></div>`).join('')}</div>`;
  return `<div class="co-grid"><div class="panel">${phaseList()}</div><div class="panel">${mid}</div><div class="panel">${side}</div></div>`;
}
function ctlQ(s) {
  return `<div class="ctl"><button class="btn ghost" data-act="prev">← Câu trước</button><button class="btn y" data-act="show">${s.step === 'rv' ? '↺ Ẩn đáp án' : '👁 Hiện đáp án'}</button><button class="btn" data-act="next">Câu tiếp →</button><button class="btn ghost" data-act="replay">🔊 Phát lại</button></div><p class="small">Phím: → câu tiếp · ← câu trước · Space hiện đáp án · R phát lại</p>`;
}
function countDone(ok, qid) { return `${ok.filter(x => answerOf(room, x, qid)).length}/${ok.length} bạn đã làm`; }

/* ---------- tab Các bé ---------- */
function drawBe(S) {
  return `<div class="wrap wide"><div class="panel"><h3>Thêm bé (bé chỉ có 1 máy, hoặc vào giúp)</h3>
    <div class="ctl"><input id="aKid" placeholder="Tên con"><input id="aPar" placeholder="Tên ba hoặc mẹ"><select id="aLv">${Object.entries(CK_LV).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><button class="btn sm" id="aGo">+ Thêm</button></div>
    <p class="small">Bé vào sau bằng mã phòng với đúng tên sẽ tự nhận chỗ này.</p></div>
    <div class="panel" style="margin-top:12px"><table class="res"><tr><th></th><th>Tên con</th><th>Ba/mẹ</th><th>Level (xếp hạng)</th><th>Trạng thái</th><th></th></tr>
    ${S.map(x => `<tr${x.ok ? '' : ' style="opacity:.5"'}><td><img src="${faceOf(x)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover"></td><td><b>${esc(x.kid)}</b>${/^t_/.test(x.id) ? ' <span class="tag tam">cô thêm</span>' : ''}</td><td>${esc(x.parent)}</td>
      <td><select data-lv="${x.id}">${Object.entries(CK_LV).map(([k, n]) => `<option value="${k}"${seatLv(room, x) === k ? ' selected' : ''}>${n}</option>`).join('')}</select></td>
      <td>${x.on ? '🟢 đang vào' : '⚪ chưa vào / rớt mạng'}</td><td><button class="btn ghost sm" data-hide="${x.id}">${x.ok ? 'Ẩn khỏi xếp hạng' : 'Hiện lại'}</button></td></tr>`).join('')}</table></div></div>`;
}

/* ---------- tab Kết quả (trực tiếp) ---------- */
function drawKq() {
  const res = ckResults(room);
  return `<div class="wrap wide"><div class="ctl"><button class="btn sm" id="csv">⬇ Tải CSV</button><span class="small">Cập nhật trực tiếp. Tổng điểm = Phần 2 (30%, chia 15 câu) + Phần 3 (30%, chia ${res.p3max} là số câu đúng cao nhất buổi thi) + Phần 4 (40%, chia 7). Mỗi câu đúng 1 điểm, bậc nào cũng vậy. Phần 1 chỉ tích sao.</span></div>
    ${Object.entries(CK_LV).map(([lv, n]) => `<div class="panel" style="margin-top:12px"><h3>${n} · ${res.by[lv].length} bé</h3><div class="scroll-x"><table class="res"><tr><th>Hạng</th><th>Tên con</th><th>Ba/mẹ</th><th>⭐ P1</th><th>P2 (/15)</th><th>P3 câu đúng</th><th>P4 (/7)</th><th>Tổng</th><th>Giải</th><th>Bậc cuối P2</th></tr>
      ${res.by[lv].map(r => `<tr><td><b>${r.hang}</b></td><td>${esc(r.seat.kid)}</td><td>${esc(r.seat.parent)}</td><td>${r.sao}</td><td>${r.p2}${r.p2done < CK_P2N ? ` <span class="small">(làm ${r.p2done})</span>` : ''}</td><td>${r.p3}</td><td>${r.p4 == null ? '–' : r.p4}</td><td><b>${r.tong}</b></td><td>${CK_CUP[r.giai]} ${esc(r.giai)}</td><td class="small">${r.band}</td></tr>`).join('')}</table></div></div>`).join('')}</div>`;
}
function csv() {
  const res = ckResults(room), rows = [['Level', 'Hạng', 'Tên con', 'Ba/mẹ', 'Sao Phần 1', 'Phần 2 (/15)', 'Phần 3 câu đúng', 'Phần 4 (/7)', 'Tổng', 'Giải', 'Bậc cuối Phần 2']];
  Object.entries(res.by).forEach(([lv, L]) => L.forEach(r => rows.push([CK_LV[lv], r.hang, r.seat.kid, r.seat.parent, r.sao, r.p2, r.p3, r.p4 == null ? '' : r.p4, r.tong, r.giai, r.band])));
  const txt = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv' })); a.download = `chung-ket-${CODE}-${today()}.csv`; a.click();
}

/* ---------- gắn nút ---------- */
function bindBody() {
  $$('[data-ph]').forEach(b => b.onclick = () => ACT.phase(b.dataset.ph));
  $$('[data-act]').forEach(b => b.onclick = () => { const [a, x] = b.dataset.act.split(':'); ACT[a](x); });
  $$('[data-px]').forEach(b => b.onclick = () => { const [seat, qid, ok, band] = b.dataset.px.split('|'); DB.set(base() + '/marks/' + seat + '/px/' + qid, { ok: ok === '1', b: band, at: DB.now() }); });
  $$('[data-bx]').forEach(b => b.onclick = () => { const run = (ST().boss || {}).run || 0; DB.set(base() + '/marks/' + b.dataset.bx + '/bx/' + run + '_' + Date.now(), DB.now()); });
  $$('[data-p4]').forEach(s => s.onchange = () => DB.set(base() + '/marks/' + s.dataset.p4 + '/p4', s.value === '' ? null : +s.value));
  $$('[data-lv]').forEach(s => s.onchange = () => DB.set(base() + '/marks/' + s.dataset.lv + '/lv', s.value));
  $$('[data-hide]').forEach(b => b.onclick = () => { const x = buildSeats(room.players).find(s => s.id === b.dataset.hide); DB.set(base() + '/players/' + b.dataset.hide + '/ok', x && x.ok ? false : null); });
  const ag = $('#aGo'); if (ag) ag.onclick = () => {
    const kid = $('#aKid').value.trim(); if (!kid) return;
    const id = 't_' + rid('');
    DB.set(base() + '/players/' + id, { kid, parent: $('#aPar').value.trim(), lv: $('#aLv').value, ava: AVATARS[Math.floor(Math.random() * AVATARS.length)].id, on: false, src: 'co', ord: DB.now(), t: DB.now() });
    $('#aKid').value = ''; $('#aPar').value = '';
  };
  const c = $('#csv'); if (c) c.onclick = csv;
}
/* đồng hồ trên màn cô */
setInterval(() => {
  const el = $('#coT'); if (!el || !CODE) return;
  const s = ST();
  if (s.ph === 'p2' && s.t0 && s.step !== 'rv') { const left = Math.max(0, CK_P2_SEC - Math.floor((DB.now() - s.t0) / 1000)); el.textContent = left ? left + ' giây' : 'Hết giờ, cô bấm Hiện đáp án'; el.classList.toggle('late', !left); }
  if (s.ph === 'p3') { const info = bossInfo(room); el.textContent = info.pre ? 'Chưa bắt đầu' : info.done ? 'Đã xong' : Math.ceil(info.left / 1000) + ' giây'; }
}, 500);

(async function () {
  try { await DB.init(); } catch (e) { app.innerHTML = '<div class="wrap"><div class="card"><h2>Chưa kết nối được Firebase</h2><p>Cô tải lại trang nhé.</p></div></div>'; return; }
  DB.onConn(ok => $('#net').classList.toggle('off', !ok));
  startScreen();
})();
