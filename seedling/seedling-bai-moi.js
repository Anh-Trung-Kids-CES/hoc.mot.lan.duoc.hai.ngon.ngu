/* =====================================================================
   SEEDLING 48 BUỔI · 99 NGÀY WEB – phần mở rộng từ bản demo Unit 1
   - Bản đồ hai tầng: 4 chặng → từng unit (đường đi có biển ngày web và buổi trên lớp).
   - Mở ngày lần lượt: học xong ngày trước mới mở ngày sau (cô giáo thêm ?gv=1 để mở hết).
   - Dạng bài mới: Chọn tranh, Vận động (quay đầu để chọn), Dạng đề, Nghe – làm theo, Nghe – trả lời.
   ===================================================================== */
const QSP = new URLSearchParams(location.search);
if (QSP.get('gv') === '1') sset('sdl-gv', true);
if (QSP.get('gv') === '0') sset('sdl-gv', false);
const GV = !!sget('sdl-gv', false);
const DAY_NS = Object.keys(SD.days).map(Number).sort((a, b) => a - b);
const TOTAL_DAYS = DAY_NS.length;
const isDone = n => !!(P.days[n] && P.days[n].done);
function dayOpen(n) { if (GV || n === DAY_NS[0] || isDone(n)) return true; const i = DAY_NS.indexOf(n); return i > 0 && isDone(DAY_NS[i - 1]); }
function nextDay() { return DAY_NS.find(n => !isDone(n)) || DAY_NS[DAY_NS.length - 1]; }
function blockOf(n) { return SD.map.find(b => b.items.some(([k, x]) => k === 'day' && x === n)); }
function unitLabel(day) { return day.unit === 'Ôn' ? 'Ôn tập' : `Unit ${day.unit} ${day.unitname || ''}`.trim(); }
function readerUnitFor(n) { const d = SD.days[n]; if (d && SD.reader[d.unit]) return d.unit; for (let k = n; k >= 1; k--) { const x = SD.days[k]; if (x && SD.reader[x.unit]) return x.unit; } return '1'; }

/* ---------- tên, biểu tượng các dạng bài mới ---------- */
Object.assign(T, {
  chon: { n: 'Nghe – chạm tranh', ic: 'ls_o_cham_hinh', sub: 'Từ của hôm nay', rules: ['Con nghe một từ.', 'Con chạm vào tranh đúng.', 'Chưa đúng cũng không sao: lát nữa mình gặp lại.'] },
  game: { n: 'Vận động', ic: 'cx_o_puzzle', sub: 'Gọi lại từ cũ · quay đầu để chọn', rules: ['Con ngồi thẳng, nhìn vào máy.', 'Con nghe một từ, rồi quay đầu về phía tranh đúng và giữ yên một chút.', 'Không có camera thì con chạm vào tranh nhé.'] },
  de: { n: 'Dạng đề', ic: 'cx_o_tf', sub: 'Starters · YCT1', rules: ['Con nghe kỹ, mỗi câu nghe 2 lần.', 'Con chạm vào đáp án đúng.', 'Câu chưa đúng lát nữa gặp lại.'] },
  lam: { n: 'Nghe – làm theo', ic: 'ls_o_xem', sub: 'Listen and do · 听一听，做一做', rules: ['Con nghe lệnh.', 'Con đứng dậy làm theo lệnh.', 'Làm xong con chạm nút “Con làm rồi!”.'] },
  tl: { n: 'Nghe – trả lời', ic: 'cx_o_speak', sub: 'YCT口试 听后回答', rules: ['Con nghe câu hỏi.', 'Con nói câu trả lời, máy ghi lại giọng con.', 'Rồi con nghe câu trả lời mẫu.'] }
});
Object.assign(SD.vi, { gamego: 'Con quay đầu hoặc chạm để chọn nhé!', did: 'Giỏi lắm! Con làm đúng rồi!' });

/* ---------- CHỌN TRANH: nghe một từ, chạm 1 trong 3 tranh ---------- */
R.chon = (step, body) => {
  const Q = step.qs.map(q => Object.assign({}, q)); const back = new Set(); let qi = 0, busy = false;
  const ask = () => { dots(qi, Q.length); if (qi >= Q.length) return finish(); const q = Q[qi];
    body.innerHTML = `<div class="ls-ask"><span class="ls-lab">Câu ${qi + 1}/${Q.length} · nghe ${q.say.l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}${q.again ? ' · gặp lại' : ''}</span>
      <div class="ls-opts sx-faces" style="--n:${q.opts.length}">${q.opts.map((o, i) => `<button class="ls-opt" data-i="${i}">${pic(o.img, o.e, '')}</button>`).join('')}</div></div>`;
    const play = () => { stopAll(); cap('Con nghe nhé…'); return say(q.say); }; X.replay = play; play();
    body.querySelectorAll('.ls-opt').forEach(b => b.onclick = async () => { if (busy) return; busy = true; stopAll(); const me = RUN, i = +b.dataset.i;
      if (i === q.ans) { sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star(); cap((q.say.l === 'zh' ? '中文: ' : 'EN: ') + q.say.t); await hd(q.again ? 'retry' : 'ok'); }
      else { sfx.no(); shake(b); body.querySelectorAll('.ls-opt')[q.ans].classList.add('hint'); hopAdd(q.say);
        if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); } await hd('later'); }
      await wait(500); busy = false; if (me === RUN || alive(me)) { qi++; ask(); } }); };
  (async () => { await hd('chon'); ask(); })();
};

/* ---------- DẠNG ĐỀ: nghe (hoặc đọc) rồi chọn; đúng/sai với tranh ---------- */
R.de = (step, body) => {
  const Q = step.qs.map(q => Object.assign({}, q)); const back = new Set(); let qi = 0, busy = false;
  const ask = async () => { const my = RUN; dots(qi, Q.length); if (qi >= Q.length) return finish(); const q = Q[qi];
    const prompt = q.read ? `<div class="sx-q"><div><b class="zh">${esc(q.say.t)}</b><span class="sx-pyl" data-later>${esc(q.py || '')}</span></div></div>`
      : q.tf ? (q.img ? `<div class="sx-q sd-tfpic">${pic(q.img, '', 'sd-depic')}<button class="ls-b sm" id="pq">${SVG.spk}</button></div>`
                      : `<div class="sx-q sd-desc"><span class="sx-e">🖼️</span><div><b>${esc(q.desc)}</b><small>Tranh</small></div><button class="ls-b sm" id="pq">${SVG.spk}</button></div>`)
      : `<div class="sx-q"><span class="sx-e">🎧</span><div><b>Con nghe nhé</b></div><button class="ls-b sm" id="pq">${SVG.spk}</button></div>`;
    body.innerHTML = `<div class="sx-hoi"><span class="ls-lab">${q.read ? 'Đọc và chọn tranh' : q.tf ? 'Nghe: đúng hay sai với tranh?' : 'Nghe và chọn tranh'} · Câu ${qi + 1}/${Q.length}${q.again ? ' · gặp lại' : ''}</span>${prompt}
      <div class="sx-opts ${q.tf ? 'two' : ''}">${q.opts.map((o, n) => { const im = (q.imgs || [])[n]; return `<button class="sx-opt${im ? ' sd-picopt' : ''}" data-n="${n}" aria-label="${im ? 'tranh ' + (n + 1) : esc(o)}">${q.tf ? esc(o) : im ? pic(im, '', 'sd-depic') : '<span class="sd-ph">🖼️</span>' + esc(o)}</button>`; }).join('')}</div></div>`;
    revealPy(body, 900);
    let tok = 0; const play = async () => { hush(); const me = RUN, t = ++tok; await say(q.say); if (me !== RUN || t !== tok || q.read) return; await wait(700); if (me === RUN && t === tok) await say(q.say); };
    X.replay = play; const pq = body.querySelector('#pq'); if (pq) pq.onclick = play; play();
    body.querySelectorAll('.sx-opt').forEach(b => b.onclick = async () => { if (busy) return; busy = true; const n = +b.dataset.n;
      if (n === q.ans) { hush(); sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star(); await hd('ok'); }
      else { sfx.no(); shake(b); body.querySelectorAll('.sx-opt')[q.ans].classList.add('hint'); hopAdd(q.say);
        if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); } await hd('later'); }
      await wait(400); busy = false; if (my === RUN) { qi++; ask(); } }); };
  (async () => { await hd('de'); ask(); })();
};

/* ---------- NGHE – LÀM THEO: con đứng dậy làm theo lệnh ---------- */
R.lam = (step, body) => {
  const C = step.cmds; let i = 0;
  async function show() { const my = RUN; dots(i, C.length); if (i >= C.length) return finish(); const c = C[i];
    body.innerHTML = `<div class="sx-goi"><span class="ls-lab">Lệnh ${i + 1}/${C.length} · ${c.l === 'zh' ? '听一听，做一做' : 'Listen and do'}</span><div class="sx-big">${pic(c.img, c.e, 'sx-gpic')}</div>
      <div id="ans" class="sx-ans2"></div><div class="row"><button class="btn g" id="did">✋ Con làm rồi!</button><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div>`;
    const u = c.l === 'zh' ? zh(c.t, c.a) : en(c.t, c.a);
    const play = () => { hush(); return say(u); }; X.replay = play;
    body.querySelector('#nx').onclick = () => { stopAll(); i++; show(); };
    body.querySelector('#did').onclick = async () => { stopAll(); sfx.ok(); star(); body.querySelector('#ans').innerHTML = bub(c.t, c.l, '', c.py); revealPy(body, 600); await hd('did'); await wait(400); i++; show(); };
    await play(); if (my !== RUN) return; await wait(600); if (my === RUN) await play(); }
  (async () => { await hd('lam'); show(); })();
};

/* ---------- NGHE – TRẢ LỜI (YCT口试 听后回答) ---------- */
R.tl = (step, body) => {
  const I = step.items; let i = 0;
  async function show() { const my = RUN; dots(i, I.length); if (i >= I.length) return finish(); const it = I[i];
    body.innerHTML = `<div class="sx-hoi"><span class="ls-lab">YCT口试 听后回答 · Câu ${i + 1}/${I.length}</span>
      <div class="sx-q"><span class="sx-e">❓</span><div><b class="zh">${esc(it.q)}</b><span class="sx-pyl" data-later>${esc(it.py)}</span></div><button class="ls-b sm" id="pq">${SVG.spk}</button></div>
      <div class="sx-microw"><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div><span class="ls-lab">Con trả lời nhé!</span></div><div id="ans" class="sx-ans2"></div>
      <div class="row"><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div>`;
    revealPy(body, 900); const q = zh(it.q, it.a_q);
    const play = () => { hush(); return say(q); }; X.replay = play; body.querySelector('#pq').onclick = play;
    body.querySelector('#nx').onclick = () => { stopAll(); i++; show(); };
    await play(); if (my !== RUN) return; const how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return;
    body.querySelector('#ans').innerHTML = bub(it.a, 'zh', '', it.apy); revealPy(body, 600); await say(zh(it.a, it.a_a)); if (my !== RUN) return;
    if (how === 'rec') star(); await wait(700); if (my === RUN) { i++; show(); } }
  (async () => { await hd('turn'); show(); })();
};

/* ---------- VẬN ĐỘNG: nghe rồi quay đầu (hoặc chạm) để chọn ---------- */
R.game = (step, body) => {
  const Q = step.qs.map(q => Object.assign({}, q)); const back = new Set(); let qi = 0, busy = false;
  const ask = () => { dots(qi, Q.length); if (qi >= Q.length) return finish(); const q = Q[qi];
    let top = '', opts = '';
    if (q.m === 'aht') { top = `<span class="ls-lab">Tiếng Anh hay tiếng Trung?</span>`;
      opts = `<button class="hd-pick sd-flag en" data-i="0"><b>EN</b><small>English</small></button><button class="hd-pick sd-flag zh" data-i="1"><b class="zh">中文</b><small>Tiếng Trung</small></button>`; }
    else if (q.m === 'ds') { top = `<div class="sd-dscard">${pic(q.card.img, q.card.e, '')}<b>${esc(q.card.en)}</b></div><span class="ls-lab">Câu tiếng Trung có cùng nghĩa với thẻ không?</span>`;
      opts = `<button class="hd-pick sd-yn ok" data-i="0"><b>✓</b><small>Đúng</small></button><button class="hd-pick sd-yn no" data-i="1"><b>✗</b><small>Sai</small></button>`; }
    else if (q.m === 'pic') { top = `<span class="ls-lab">Con nghe rồi chọn tranh đúng</span>`;
      opts = q.opts.map((o, i) => `<button class="hd-pick sd-pc" data-i="${i}" aria-label="tranh ${i + 1}">${pic(o.img, o.e, '')}</button>`).join(''); }
    else { top = `<span class="ls-lab">Con nghe rồi chọn tranh đúng</span>`;
      opts = q.opts.map((o, i) => `<button class="hd-pick sd-pc" data-i="${i}">${pic(o.img, o.e, '')}<small>${esc(q.say.l === 'zh' ? o.en : o.zh)}</small></button>`).join(''); }
    const nOpt = q.m === 'c3' || (q.opts && q.opts.length === 3) ? 3 : 2;
    body.innerHTML = `<div class="sd-game hd-zone"><div class="sd-gtop">${top}<button class="ls-b sm" id="pq">${SVG.spk}</button></div>
      <div class="sd-mirror${HEAD.on ? '' : ' off'}" id="mir"><video muted playsinline autoplay></video><span class="sd-dir" id="mdir"></span><small id="mtip">${HEAD.on ? 'Con nhìn thẳng vào máy' : 'Bấm 🙆 để chơi bằng đầu'}</small></div>
      <div class="sd-picks n${nOpt}">${opts}</div>
      <div class="sd-gbar"><button class="ls-b" id="hdBtn" type="button">🙆 ${HEAD.on ? 'Đang chơi bằng đầu' : 'Chơi bằng đầu'}</button><span class="ls-lab">${nOpt === 3 ? '⬅️ quay trái · ⬆️ ngửa lên · ➡️ quay phải' : '⬅️ quay trái · ➡️ quay phải'}</span></div></div>`;
    body.querySelector('#hdBtn').onclick = () => HEAD.on ? HEAD.stop() : HEAD.consent();
    HEAD.btn(); HEAD.mirror && HEAD.mirror();
    const play = () => { stopAll(); return say(q.say); }; X.replay = play; body.querySelector('#pq').onclick = play; play();
    body.querySelectorAll('.hd-pick').forEach(b => b.onclick = async () => { if (busy) return; busy = true; stopAll(); const me = RUN, i = +b.dataset.i;
      if (i === q.ans) { sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star(); await hd(q.again ? 'retry' : 'ok'); }
      else { sfx.no(); shake(b); const r = body.querySelectorAll('.hd-pick')[q.ans]; r && r.classList.add('hint'); hopAdd(q.say);
        if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); } await hd('later'); }
      await wait(600); busy = false; if (me === RUN) { qi++; ask(); } }); };
  (async () => { await hd('game'); ask(); })();
};

/* =====================================================================
   MÀN HÌNH
   ===================================================================== */
function viewHome() { document.body.classList.add('hub'); setActive('home');
  const done = DAY_NS.filter(isDone).length, n = nextDay(), d = SD.days[n], B = blockOf(n);
  app.innerHTML = `<div class="screen home2"><div class="h2-top"><span class="h2-kick">Anh – Trung – Kids · lớp offline</span><h1>Seedling · Hạt mầm vươn cao</h1></div>
    <div class="h2-grid">
      ${tile({ cls: 'big', href: B ? '#/ban-do/' + B.key : '#/ban-do', img: 'tai-nguyen/trang/the_gioi_seed.webp', c: '#1FA5A0', t: '🌱 Bản đồ học', sub: `Đã học ${done}/${TOTAL_DAYS} ngày web · ${B ? B.name : ''}` })}
      ${tile({ cls: 'big', href: '#/ngay/' + n, img: d.hero, c: '#E3262E', t: `▶ ${isDone(n) ? 'Ôn lại' : 'Học'} ngày ${n}`, sub: `${unitLabel(d)} · ${d.t}` })}
      ${tile({ href: '#/hop-on', img: 'tai-nguyen/trang/ls_album.webp', c: '#7B5CD6', t: 'Hộp ôn', sub: (() => { const b = onBank(); const k = onDue(b).length; return k ? `${k} thẻ đến hẹn ôn hôm nay` : `${b.length} thẻ trong hộp`; })() })}
      ${tile({ href: '#/reader/' + readerUnitFor(n) + '/1', img: SD.reader[readerUnitFor(n)].pages[0].img, size: 'cover', bg: '#DDEBFF', c: '#2F6FD6', t: 'Reader · đọc truyện', sub: SD.reader[readerUnitFor(n)].t })}
      ${tile({ href: '#/qua', img: 'tai-nguyen/qua/gift_rubik.webp', size: 'auto 62%', pos: '50% 55%', bg: '#FFE4EC', c: '#E3487A', t: 'Phòng đổi quà', sub: `⭐ ${qWallet()} sao trong ví` })}
      ${tile({ href: '#/hanh-trinh', img: 'tai-nguyen/trang/ls_stickers.webp', size: 'auto 92%', bg: '#FFF8E1', c: '#C9A227', t: 'Hành trình của con', sub: 'Huy hiệu · ngày học · lần nói' })}
    </div>${GV ? '<p class="sx-demo">Chế độ giáo viên: mở tất cả các ngày. Thêm <code>?gv=0</code> vào link để tắt.</p>' : ''}</div>`;
}

/* bản đồ tầng 1: 4 chặng, mỗi chặng là các unit */
const CHANG_N = { 1: 'Chặng 1 · Unit 1–4', 2: 'Chặng 2 · Unit 5–8', 3: 'Chặng 3 · Unit 9–12', 4: 'Về đích · ôn và thi thử' };
function blockStat(B) { const ds = B.items.filter(x => x[0] === 'day').map(x => x[1]); const dn = ds.filter(isDone).length; return { ds, dn, open: ds.some(dayOpen), all: dn === ds.length }; }
function viewWorld() { document.body.classList.add('hub'); setActive('map'); stopAll();
  const cur = blockOf(nextDay());
  const sec = [1, 2, 3, 4].map(c => { const Bs = SD.map.filter(b => b.chang === c); if (!Bs.length) return '';
    return `<section class="sd-chang"><h2>${esc(CHANG_N[c])}</h2><div class="sd-bgrid">${Bs.map(B => { const st = blockStat(B), now = B === cur;
      return `<a class="ht ${st.all ? 'done' : st.open ? 'open' : 'lock'} ${now ? 'now' : ''}" href="#/ban-do/${B.key}" style="--tc:${st.all ? '#2E9E5B' : now ? '#E3262E' : '#1FA5A0'}">
        <span class="ht-img" style="background-image:url('${esc(B.img)}')"></span>
        <span class="ht-badge ${st.all ? 'ok' : st.open ? '' : 'lk'}">${st.all ? '✓ ' : st.open ? '' : '🔒 '}${st.dn}/${st.ds.length}</span>${now ? '<span class="ht-now">▶ Đang học</span>' : ''}
        <span class="ht-lb"><small>${esc(B.topic)}</small><b>${esc(B.name)}${B.story ? ' · ' + esc(B.story) : ''}</b></span></a>`; }).join('')}</div></section>`; }).join('');
  app.innerHTML = `<div class="screen sd-world"><div class="h2-top"><span class="h2-kick">48 buổi · ${TOTAL_DAYS} ngày web · 26 tuần</span><h1>Bản đồ Seedling</h1>
    <span class="wh-prog sd-prog"><i style="width:${DAY_NS.filter(isDone).length / TOTAL_DAYS * 100}%"></i><b>${DAY_NS.filter(isDone).length}/${TOTAL_DAYS} ngày</b></span></div>${sec}</div>`;
  const c = app.querySelector('.ht.now'); if (c) c.scrollIntoView({ block: 'center' });
}
/* bản đồ tầng 2: đường đi của một unit (ngày web + buổi trên lớp) */
const ROAD = [[13.81, 98.83], [20.28, 96.29], [26.93, 94.11], [33.62, 92.39], [40.21, 89.7], [46.67, 86.19], [52.18, 79.52], [52.45, 68.41], [47.38, 60.7], [41.17, 55.95], [35.16, 50.54], [32.5, 40.18], [36.28, 30.51], [42.34, 25.86], [48.8, 22.33], [55.54, 21.54], [62.28, 22.23], [68.88, 24.83]];
function roadPts(k) { const P2 = ROAD.map(([x, y]) => [x * 1.6, y * .9]), L = [0]; for (let i = 1; i < P2.length; i++) L.push(L[i - 1] + Math.hypot(P2[i][0] - P2[i - 1][0], P2[i][1] - P2[i - 1][1]));
  const tot = L[L.length - 1], out = [];
  for (let j = 0; j < k; j++) { const s = tot * (0.06 + 0.88 * (k === 1 ? .5 : j / (k - 1))); let i = 1; while (i < L.length - 1 && L[i] < s) i++; const f = (s - L[i - 1]) / (L[i] - L[i - 1] || 1);
    out.push([(P2[i - 1][0] + f * (P2[i][0] - P2[i - 1][0])) / 1.6, (P2[i - 1][1] + f * (P2[i][1] - P2[i - 1][1])) / .9]); }
  return out; }
function viewMap(key) { const B = SD.map.find(b => b.key === key) || blockOf(nextDay()); if (!key) return viewWorld();
  document.body.classList.add('hub'); setActive('map'); stopAll();
  const U = ([x, y]) => [x * 1.6, y * .9], road = ROAD.map((p, k) => (k ? 'L' : 'M') + U(p).map(v => v.toFixed(2)).join(' ')).join(' ');
  const pos = roadPts(B.items.length); let nowSet = false, html = '';
  B.items.forEach(([kind, n], j) => { const p = pos[j];
    if (kind === 'day') { const open = dayOpen(n), done = isDone(n), now = open && !done && !nowSet; if (now) nowSet = true;
      html += `<button class="sign ${done ? 'done' : open ? 'open' : 'lock'} ${SHAPE[j % 3]} ${now ? 'now' : ''}" data-n="${n}" style="left:${p[0]}%;top:${p[1]}%;--zc:${ZONE_C[(B.chang - 1) % 3]}" title="Ngày ${n}">
        <span class="sg-pole"></span><span class="sg-face"><b>${done ? '★' : n}</b></span>${open ? '' : '<span class="sg-lock">🔒</span>'}</button>`; }
    else html += `<a class="wzoom" href="#/lop/${n}" style="left:${p[0]}%;top:${p[1]}%"><span>🏫</span><small>Buổi ${n}</small></a>`; });
  const ds = B.items.filter(x => x[0] === 'day').map(x => x[1]), dn = ds.filter(isDone).length;
  const i = SD.map.indexOf(B), prev = SD.map[i - 1], next = SD.map[i + 1];
  app.innerHTML = `<div class="screen worldscr"><div class="world" style="--wbg:url('tai-nguyen/trang/the_gioi_seed.webp')"><div class="wcanvas">
    <svg class="wroad" viewBox="0 0 160 90" preserveAspectRatio="none" aria-hidden="true"><path d="${road}" class="edge"/><path d="${road}" class="sand"/><path d="${road}" class="dash"/></svg>${html}</div>
    <div class="whud"><span class="wh-name" style="--c:#1FA5A0">🌱 ${esc(B.name)} · ${esc(B.topic.split(' · ')[0])}</span><span class="wh-prog"><i style="width:${dn / ds.length * 100}%"></i><b>${dn}/${ds.length} ngày</b></span>${GV ? '<span class="wh-gv">Giáo viên</span>' : ''}</div>
    <div class="wbtns">${prev ? `<a class="wmbtn" href="#/ban-do/${prev.key}">◀<span>${esc(prev.name)}</span></a>` : ''}<a class="wmbtn" href="#/ban-do">🗺️<span>Cả khoá</span></a>${next ? `<a class="wmbtn" href="#/ban-do/${next.key}">▶<span>${esc(next.name)}</span></a>` : ''}<button class="wmbtn" id="mapHelp" type="button">🔊<span>Hướng dẫn</span></button></div></div></div>`;
  app.querySelectorAll('.sign').forEach(b => b.onclick = () => { const n = +b.dataset.n; if (!dayOpen(n)) { sfx.no(); hd('lock'); toast(`Ngày ${n}: con học xong ngày ${n - 1} để mở nhé 🔒`); return; } sfx.pop(); location.hash = '#/ngay/' + n; });
  document.getElementById('mapHelp').onclick = () => hd('map');
}
function viewDay(n, sub) { const day = SD.days[n]; if (!day) { location.hash = '#/ban-do'; return; }
  if (!dayOpen(n)) { toast(`Ngày ${n} chưa mở: con học xong ngày ${n - 1} trước nhé 🔒`); location.hash = '#/ban-do/' + (blockOf(n) || {}).key; return; }
  const k = sub && /^b\d+$/.test(sub) ? +sub.slice(1) - 1 : -1;
  if (k >= 0 && day.steps[k]) return playStep(n, k);
  document.body.classList.add('hub'); setActive('map'); stopAll();
  const s = dayState(n), doneN = day.steps.filter((_, j) => j in s.steps).length, nextJ = day.steps.findIndex((_, j) => !(j in s.steps));
  const vids = (day.video || []).filter(v => v.url).map(v => `<a href="${esc(v.url)}" target="_blank" rel="noopener">▶ ${esc(v.label)}</a>`).join('');
  const B = blockOf(n);
  app.innerHTML = `<div class="screen dayscr"><section class="dy-card"><div class="dy-img" style="background-image:url('${esc(day.hero)}')"></div><div class="dy-in">
      <span class="ls-kick">Tuần ${day.week} · ${esc(unitLabel(day))} · ${esc(day.part)} · Ngày web ${n}/${TOTAL_DAYS}</span><h2>${esc(day.t)}</h2>
      <button class="ls-goal" id="goal">${SVG.spk}<span><small>Hôm nay con học</small>${esc(day.goal)}</span></button>
      <div class="ls-prog"><i style="width:${doneN / day.steps.length * 100}%"></i></div>
      ${doneN < day.steps.length ? `<button class="btn g ls-gonext" id="go">▶ ${doneN ? 'Học tiếp' : 'Bắt đầu'}: Bước ${nextJ + 1}</button>` : `<div class="dy-done">🎉 Con đã học xong ngày này!</div><div class="dy-row">${SD.days[n + 1] ? `<a class="btn g" href="#/ngay/${n + 1}">Ngày ${n + 1} →</a>` : ''}<a class="btn y" href="#/ban-do/${B ? B.key : ''}">🗺️ Bản đồ</a></div>`}
      <div class="dy-parent"><span><b>Trước buổi ${day.before}:</b> ngày web này cô Lan dạy kỹ ở buổi ${day.before} trên lớp. Ba mẹ khen con khi làm bài và khi xong bài. 3 KHÔNG: không ép nói, không sửa lỗi, không so sánh.</span></div>
      ${vids ? `<div class="sx-vids"><b>Xem thêm (không bắt buộc):</b>${vids}</div>` : ''}</div></section>
    <section class="dy-tiles ${day.steps.length > 6 ? 'n8' : ''}">${day.steps.map((st, j) => { const done = j in s.steps, now = j === nextJ;
      return `<button class="ht step ${done ? 'done' : 'open'} ${now ? 'now' : ''}" data-j="${j}" type="button" style="--tc:${st.type === 'game' ? '#F28C00' : '#3BB273'}"><span class="ht-img" style="background-image:url('${ICON(T[st.type].ic)}')"></span>
        ${done ? `<span class="ht-badge ok">✓ ${s.steps[j]}★</span>` : ''}${now ? '<span class="ht-now">▶ Bắt đầu</span>' : ''}<span class="ht-lb"><small>Bước ${j + 1} · ${esc(st.sub || T[st.type].sub)}</small><b>${esc(st.lab || T[st.type].n)}</b></span></button>`; }).join('')}</section></div>`;
  document.getElementById('goal').onclick = () => { stopAll(); say({ t: 'Hôm nay con học: ' + day.goal, l: 'vi' }); };
  const go = document.getElementById('go'); if (go) go.onclick = () => { sfx.pop(); location.hash = `#/ngay/${n}/b${nextJ + 1}`; };
  app.querySelectorAll('.ht.step').forEach(b => b.onclick = () => { sfx.pop(); location.hash = `#/ngay/${n}/b${+b.dataset.j + 1}`; });
  window.scrollTo({ top: 0 });
}
function playStep(n, k) { const day = SD.days[n]; document.body.classList.remove('hub'); setActive('map');
  app.innerHTML = `<div class="wrap ls-wrap"><div class="dayhead"><div class="crumb">🌱 Seedling · ${esc(unitLabel(day))} · Ngày web ${n} · Bước ${k + 1}/${day.steps.length}</div><h2>${esc(day.t)}</h2></div><div id="lsBox"></div>
    <div class="row"><a class="btn y" href="#/ngay/${n}">← Các bước của ngày ${n}</a></div></div>`;
  X = { n, k, day, step: day.steps[k], stars: 0 }; startStep(); window.scrollTo({ top: 0 }); }
function viewLop(b) { const L = SD.lop[b]; if (!L) return viewWorld(); document.body.classList.add('hub'); setActive('map'); stopAll();
  const B = SD.map.find(x => x.items.some(([k, v]) => k === 'lop' && v === b));
  app.innerHTML = `<div class="screen dayscr"><section class="dy-card"><div class="dy-img" style="background-image:url('${esc(L.img)}')"></div><div class="dy-in">
    <span class="ls-kick">Buổi học với cô Lan · 90 phút · ngày web trước buổi: ${esc((L.days || []).join(', '))}</span><h2>${esc(L.t)}</h2><p>${esc(L.about)}</p>
    ${L.prep && L.prep.length ? `<div class="dy-parent"><span><b>Ba mẹ ôn cùng con trước buổi học:</b><br>${L.prep.map(esc).join('<br>')}</span></div>` : ''}
    ${L.wb && L.wb.length ? `<div class="dy-parent"><span><b>Sách bài tập sau buổi (khoảng 10 phút):</b><br>Tiếng Anh: ${esc(L.wb[0])}${L.wb[1] ? '<br>Tô chữ Hán: ' + esc(L.wb[1]) : ''}</span></div>` : ''}
    <div class="dy-row"><a class="btn y" href="#/ban-do/${B ? B.key : ''}">🗺️ Bản đồ</a></div></div></section></div>`; }
function parentPanel() { const ov = document.createElement('div'); ov.className = 'overlay pp';
  ov.innerHTML = `<div class="modal pp-box" role="dialog" aria-label="Ba mẹ đồng hành"><button class="pp-x" aria-label="Đóng">✕</button><h3>Ba mẹ đồng hành</h3>
    <ol class="intro-steps"><li><b>48 buổi · ${TOTAL_DAYS} ngày web · 26 tuần</b><span>Tuần 1–3: 3 ngày web rồi buổi Chủ nhật. Từ tuần 4: 2 ngày web → buổi thứ Tư → 2 ngày web → buổi Chủ nhật. Web luôn đi trước buổi lớp.</span></li>
      <li><b>Mỗi ngày web khoảng 12–15 phút</b><span>Thẻ nền Little Seed → thẻ từ mới → nghe truyện (tiếng Anh rồi tiếng Trung) → chạm, nói, phiên dịch nhí → Mẹo âm → vận động.</span></li>
      <li><b>Mỗi unit là một truyện kể dần</b><span>6 ngày nghe từng phần, 2 ngày nghe lại cả truyện. Reader để đọc lại ở nhà.</span></li>
      <li><b>Bước Vận động dùng camera nếu ba mẹ đồng ý</b><span>Con quay đầu để chọn đáp án. Hình camera chỉ xử lý ngay trên máy, không ghi lại, không gửi đi. Không bật camera thì con chạm để chọn.</span></li>
      <li><b>Chữ gạch chân là từ con chưa học</b><span>Con chạm để nghe, có pinyin và nghĩa tiếng Anh. Con không cần nói những từ này.</span></li>
      <li><b>Làm sai vẫn đi tiếp</b><span>Câu con chưa đúng gặp lại ở cuối bài và được lưu vào Hộp ôn.</span></li></ol>
    <p><b>3 KHÔNG:</b> không ép nói, không sửa lỗi, không so sánh. Khen con khi con đang làm bài và khi con xong bài.</p>
    <div class="sx-kidcode"><b>Nối web với lớp</b><span>${kidId() ? `Mã của con: <code>${esc(kidId())}</code>${API_ON ? '' : ' (bản xem thử)'}<small class="sx-cl">${esc(clStatus())} Con đổi sang máy khác: ba mẹ mở lại link cô gửi, hoặc nhập mã này ở máy mới, web tự lấy lại bài con đã học.</small>` : 'Ba mẹ mở đường link cô gửi qua Zalo, hoặc nhập mã cô đưa:'}</span>
      <div class="row"><input id="kidCodeIn" class="q-gate-in" placeholder="Mã của con" autocomplete="off"><button class="btn g sm" id="kidCodeOk" type="button">Lưu mã</button></div>
      <a class="sx-colink" href="#/co">Dành cho cô giáo: Bảng của cô →</a></div></div>`;
  document.body.appendChild(ov); const close = () => ov.remove(); ov.querySelector('.pp-x').onclick = close; ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('a')) close(); });
  ov.querySelector('#kidCodeOk').onclick = () => { const v = ov.querySelector('#kidCodeIn').value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!v) return;
    clSwitch(v); close(); toast('Đã lưu mã của con. Web đang lấy bài và sao của con…'); clPull().then(() => coSync(true)); }; }
function route() { if (!/^#\/reader/.test(location.hash)) RDR.auto = ''; stopAll(); if (!/^#\/(ngay|co)/.test(location.hash)) coSync(); document.querySelectorAll('.sx-pop').forEach(x => x.remove());
  if (!/^#\/ngay\/\d+\/b/.test(location.hash) && HEAD.on) HEAD.stop();
  const h = location.hash.replace(/^#\/?/, '').split('/');
  if (h[0] === 'ban-do') return h[1] ? viewMap(h[1]) : viewWorld(); if (h[0] === 'ngay') return viewDay(+h[1], h[2]); if (h[0] === 'lop') return viewLop(+h[1]);
  if (h[0] === 'hop-on') return h[1] === 'choi' ? viewOnPlay() : viewHop(); if (h[0] === 'qua') return viewQua(h[1]); if (h[0] === 'hanh-trinh') return viewJourney(); if (h[0] === 'co') return viewCo();
  if (h[0] === 'reader') return viewReader(h[1] || readerUnitFor(nextDay()), (+h[2] || 1) - 1);
  viewHome(); }
sdBoot();
