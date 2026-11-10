/* =====================================================================
   SEEDLING · HỘP ÔN – ôn cách quãng (kiểu hộp Leitner) cho từ và câu con đã học.
   - Thẻ vào hộp khi con học xong bước có thẻ đó (Thẻ nền, Thẻ từ mới, Gọi lại, Lời lớp học, Phiên dịch nhí),
     cả từ chỉ có tiếng Anh (nguyên tắc 15: mọi từ mới vào hộp ngay ngày học).
   - 5 lượt gọi lại (nguyên tắc 15): lượt 1 ngay trong ngày web (bước cuối của ngày), 4 lượt trong hộp:
     ngày web kế tiếp (bậc 1) → khoảng 1 tuần (bậc 2) → khoảng 3 tuần (bậc 3) → cuối unit / khoá ôn (bậc 4) → ⭐ bậc 5.
   - Lượt sau khó hơn lượt trước (nguyên tắc 9): bậc 1 nghe tiếng Anh → chạm tranh; bậc 2 nghe tiếng Trung → chạm tranh;
     bậc 3 nhìn tranh → tự nói tiếng Anh; bậc 4 nhìn tranh → tự nói tiếng Trung; bậc 5 nhìn tranh → chọn chữ Hán.
   - Mỗi câu hỏi chỉ một thứ tiếng, mỗi thẻ chỉ một lần trong lượt (nguyên tắc 2: không lặp dồn cả hai tiếng).
   - Sai thì bài vẫn đi tiếp, thẻ về bậc 1 và gặp lại cuối lượt ở dạng dễ hơn (nguyên tắc 16).
   - Câu con chạm sai trong bài học tự về bậc 1, ôn ngay hôm nay.
   - Sao cố định: +5 mỗi lượt xong (tối đa 3 lượt có sao một ngày), không theo số câu đúng.
   ===================================================================== */
const ON_GAP = [0, 1, 6, 14, 14, 30], ON_TOP = 5, ON_N = 8, ON_LEAF = ['', '🌱', '🌿', '🌳', '🌳', '⭐'];
function onState() { P.on = P.on || {}; P.onLog = P.onLog || {}; return P.on; }
function addDays(k) { const d = new Date(Date.parse(today()) + k * 864e5); return d.toISOString().slice(0, 10); }
/* kho thẻ: từ các bước con đã học xong */
function onBank() {
  const bank = [], seen = new Set();
  /* từ chỉ có tiếng Anh vào hộp khi có tranh thật; từ chức năng (have, my, what…) được ôn qua câu */
  const add = it => { if (!(it.zh || (it.en && onPic(it))) || seen.has(it.k)) return; seen.add(it.k); bank.push(it); };
  Object.keys(SD.days).map(Number).sort((a, b) => a - b).forEach(n => { const st = P.days[n]; if (!st) return;
    SD.days[n].steps.forEach((s, i) => { if (!(i in st.steps)) return;
      if (['nen', 'the', 'goi'].includes(s.type)) s.cards.forEach(c => add({ k: 'w:' + c.en, kind: 'tu', en: c.en, zh: c.zh, py: c.py, img: c.img || '', e: c.e || '', a_en: c.a_en, a_zh: c.a_zh, n }));
      if (s.type === 'loi') s.cards.forEach(c => add({ k: 's:' + c.en, kind: 'cau', en: c.en, zh: c.zh, py: c.py, e: c.e || '', a_en: c.a_en, a_zh: c.a_zh, n }));
      if (s.type === 'pdn') s.items.forEach(c => add({ k: 's:' + c.en, kind: 'cau', en: c.en, zh: c.zh, py: c.py, a_en: c.a_en, a_zh: c.a_zh, n })); }); });
  const S = onState();
  bank.forEach(it => { if (!S[it.k]) S[it.k] = { b: 1, due: addDays(1) }; });
  /* câu chạm sai trong bài: khớp với thẻ thì về bậc 1, ôn ngay */
  Object.values(P.hop || {}).forEach(h => { const it = bank.find(x => x.en === h.t || x.zh === h.t); if (!it) return;
    const s = S[it.k]; if (!s.hop || s.hop < h.n) { s.hop = h.n; s.b = 1; s.due = today(); } });
  return bank;
}
function onPic(it) { return !!(it.img || (it.e && it.e !== '🖼️')); }
function onDue(bank) { const S = onState(), t = today(); return bank.filter(it => S[it.k].due <= t); }
function onRemembered() { const S = P.on || {}; return Object.values(S).filter(s => s.b >= ON_TOP).length; }
function onPicOf(it) { return it.img ? `<img class="ls-pic" src="${esc(it.img)}" alt="" draggable="false">` : `<span class="ls-pic sx-emo">${it.e || '🖼️'}</span>`; }

/* ---------- màn Hộp ôn ---------- */
function viewHop() {
  document.body.classList.add('hub'); setActive('hop'); stopAll();
  const bank = onBank(), S = onState(), due = onDue(bank), t = today(), lg = P.onLog[t] || 0; save();
  const words = bank.filter(x => x.kind === 'tu'), sents = bank.filter(x => x.kind === 'cau');
  const lv = k => Array.from({ length: ON_TOP }, (_, i) => `<i class="${i < S[k].b ? 'on' : ''}"></i>`).join('');
  const card = it => `<button class="sx-oc ${S[it.k].due <= t ? 'due' : ''}" data-k="${esc(it.k)}" type="button">${it.kind === 'tu' ? onPicOf(it) : `<span class="sx-oe">${it.e || '💬'}</span>`}
    <span class="sx-oen">${esc(it.en)}</span><span class="zh sx-ozh">${esc(it.zh)}</span><span class="sx-olv" title="Bậc ${S[it.k].b}">${ON_LEAF[S[it.k].b]}<span>${lv(it.k)}</span></span></button>`;
  const weak = Object.values(P.hop || {}).filter(h => !bank.some(x => x.en === h.t || x.zh === h.t));
  app.innerHTML = `<div class="screen qscr onscr"><div class="q-top"><span class="q-back">🗃️</span><h2>Hộp ôn của con</h2>
      <div class="q-wallet"><span><small>Cần ôn hôm nay</small><b>${due.length}</b></span><span><small>Đang nhớ</small><b>${bank.length - onRemembered()}</b></span><span class="q-left"><small>Nhớ chắc ⭐</small><b>${onRemembered()}</b></span></div></div>
    <div class="sx-onbody">
      ${bank.length ? `<div class="sx-onhero"><img src="tai-nguyen/trang/ls_album.webp" alt=""><div><b>${due.length ? `Hôm nay có ${due.length} thẻ đến hẹn ôn` : 'Con đã ôn hết thẻ đến hẹn hôm nay'}</b>
          <span>Một lượt ${ON_N} câu, khoảng 3 phút: nghe, chạm, nói bằng cả hai thứ tiếng.${lg < PTS.reviewMaxDay ? ` Xong lượt được +${PTS.review} ⭐.` : ' Hôm nay con đã nhận đủ sao ôn, con vẫn ôn thêm được.'}</span>
          <div class="row"><a class="btn g" href="#/hop-on/choi">▶ Ôn nhanh ${ON_N} câu</a></div></div></div>
        <div class="sx-onkey">Bậc nhớ: 🌱 mới học · 🌿 đang nhớ · 🌳 nhớ khá · ⭐ nhớ chắc. Thẻ viền cam là thẻ đến hẹn. Chạm thẻ để nghe.</div>
        ${words.length ? `<h3 class="sx-onh">Từ con đã học <small>${words.length}</small></h3><div class="sx-ocs">${words.map(card).join('')}</div>` : ''}
        ${sents.length ? `<h3 class="sx-onh">Câu con đã học <small>${sents.length}</small></h3><div class="sx-ocs cau">${sents.map(card).join('')}</div>` : ''}
        ${weak.length ? `<h3 class="sx-onh">Câu con cần nghe thêm <small>chạm để nghe</small></h3><div class="sx-hop">${weak.map((h, i) => `<button class="sx-opt" data-w="${i}" type="button">${h.l === 'zh' ? `<span class="zh">${esc(h.t)}</span>` : esc(h.t)}<small>chạm sai ${h.n} lần</small></button>`).join('')}</div>` : ''}`
      : `<div class="sx-onhero"><img src="tai-nguyen/trang/ls_album.webp" alt=""><div><b>Hộp ôn đang trống</b><span>Con học xong bước Thẻ nền hay Thẻ từ mới thì thẻ sẽ vào đây để con ôn lại sau 1 ngày.</span><div class="row"><a class="btn g" href="#/ngay/1">▶ Học ngày 1</a></div></div></div>`}
    </div></div>`;
  app.querySelectorAll('.sx-oc').forEach(b => b.onclick = () => { const it = bank.find(x => x.k === b.dataset.k); stopAll(); sfx.pop(); pop(b); seq([en(it.en, it.a_en)].concat(it.zh ? [zh(it.zh, it.a_zh)] : []), 300); });
  app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { stopAll(); say(weak[+b.dataset.w]); });
}

/* ---------- một lượt Ôn nhanh ---------- */
function onPick(bank) {
  const S = onState(), t = today(), due = onDue(bank).sort((a, b) => S[a.k].b - S[b.k].b || (S[a.k].due < S[b.k].due ? -1 : 1));
  const rest = shuffle(bank.filter(x => !due.includes(x))).sort((a, b) => S[a.k].b - S[b.k].b);
  return due.concat(rest).slice(0, ON_N);
}
/* dạng hỏi theo bậc: bậc càng cao càng khó; mỗi câu một thứ tiếng */
function onQType(it, words) {
  const b = (onState()[it.k] || {}).b || 1, hasZh = !!it.zh, pics = onPic(it) && words.filter(onPic).length >= 3;
  if (it.kind === 'cau') return { ty: b % 2 ? 'en2zh' : 'zh2en' };
  if (!onPic(it)) return { ty: 'chu' };   /* từ không vẽ được (chỉ vào hộp khi có chữ Hán): nhìn tiếng Anh, chọn chữ Hán */
  if (b <= 1) return pics ? { ty: 'nghe', L: 'en' } : { ty: 'noi', L: 'en' };
  if (b === 2) return pics ? { ty: 'nghe', L: hasZh ? 'zh' : 'en' } : { ty: 'noi', L: 'en' };
  if (b === 3) return { ty: 'noi', L: 'en' };
  if (b === 4) return { ty: 'noi', L: hasZh ? 'zh' : 'en' };
  return hasZh && words.filter(w => w.zh).length >= 3 ? { ty: 'chu' } : { ty: 'noi', L: hasZh ? 'zh' : 'en' };
}
function viewOnPlay() {
  document.body.classList.remove('hub'); setActive('hop'); stopAll();
  const bank = onBank(); save();
  if (!bank.length) return viewHop();
  const words = bank.filter(x => x.kind === 'tu'), sents = bank.filter(x => x.kind === 'cau');
  let Q = onPick(bank).map(it => Object.assign({ it }, onQType(it, words)));
  const S = onState(), up = new Set(), back = new Set(); let qi = 0, busy = false, ok1 = 0;
  app.innerHTML = `<div class="wrap ls-wrap"><div class="dayhead"><div class="crumb">🗃️ Hộp ôn · Ôn nhanh</div><h2>Ôn nhanh ${Q.length} câu</h2></div><div id="lsBox"></div>
    <div class="row"><a class="btn y" href="#/hop-on">← Hộp ôn</a></div></div>`;
  const box = document.getElementById('lsBox');
  box.innerHTML = `<div class="ls-stage"><div class="ls-top"><div><b>Ôn nhanh</b><small>Thẻ đến hẹn ôn trước</small></div><div class="ls-dots" id="lsDots"></div><div class="ls-stars">${SVG.star}<span id="lsStars">0</span></div></div>
    <div class="ls-body" id="lsBody"></div><div class="ls-bot"><div class="ls-ctl"><button class="ls-b dark" id="lsReplay">${SVG.spk}<span>Nghe lại</span></button><button class="ls-b" id="lsStop">${SVG.stop}<span>Dừng</span></button></div>
    <div class="ls-cap" id="lsCap"></div><a class="ls-b" href="#/hop-on">${SVG.redo}<span>Thoát</span></a></div></div>`;
  const body = box.querySelector('#lsBody'); let replay = null;
  box.querySelector('#lsReplay').onclick = () => { sfx.pop(); replay && replay(); };
  box.querySelector('#lsStop').onclick = () => { sfx.pop(); stopAll(); cap('Đã dừng. Con chạm Nghe lại nhé.'); };
  const lvl = (it, right, again) => { const s = S[it.k];
    if (!right) { s.b = 1; s.due = today(); } else if (!again && !up.has(it.k)) { s.b = Math.min(ON_TOP, s.b + 1); s.due = addDays(ON_GAP[s.b]); up.add(it.k); ok1++; } else s.due = addDays(1); save(); };
  /* sai: gặp lại cuối lượt ở dạng dễ hơn (nghe → chạm tranh), cùng thứ tiếng */
  const later = q => { if (!back.has(q.it.k) && !q.again) { back.add(q.it.k);
    const easy = q.it.kind === 'tu' && onPic(q.it) && words.filter(onPic).length >= 3 ? { ty: 'nghe', L: q.L || (q.ty === 'chu' ? 'zh' : 'en') } : {};
    Q.push(Object.assign({}, q, easy, { again: true })); } };
  const judge = async (btn, right, q, rightBtn, model) => { busy = true;
    if (right) { stopAll(); sfx.ok(); btn.classList.add('right'); pop(btn); lvl(q.it, true, q.again); if (!q.again) { const el = document.getElementById('lsStars'); el.textContent = +el.textContent + 1; } await hd(q.again ? 'retry' : 'ok'); }
    else { sfx.no(); shake(btn); rightBtn && rightBtn.classList.add('hint'); lvl(q.it, false); later(q); await hd('later'); }
    if (model) { await wait(200); await model(); } await wait(500); busy = false; qi++; ask(); };
  const opts = (pool, it, n) => shuffle([it].concat(shuffle(pool.filter(x => x.k !== it.k)).slice(0, n - 1)));
  function ask() {
    dots(qi, Q.length); if (qi >= Q.length) return done(); const q = Q[qi], it = q.it, my = RUN, lab = `Câu ${qi + 1}/${Q.length}${q.again ? ' · gặp lại' : ''} · ${ON_LEAF[S[it.k].b]} bậc ${S[it.k].b}`;
    if (q.ty === 'nghe') { const L = q.L === 'zh' && it.zh ? 'zh' : 'en', O = opts(words.filter(onPic), it, Math.min(4, words.filter(onPic).length)), u = L === 'zh' ? zh(it.zh, it.a_zh) : en(it.en, it.a_en);
      body.innerHTML = `<div class="ls-ask"><span class="ls-lab">${lab} · nghe ${L === 'zh' ? 'tiếng Trung' : 'tiếng Anh'} rồi chạm tranh</span>
        <div class="ls-opts sx-onpics" style="--n:${O.length}">${O.map(o => `<button class="ls-opt" data-k="${esc(o.k)}">${onPicOf(o)}</button>`).join('')}</div></div>`;
      replay = () => { stopAll(); cap('Con nghe nhé…'); return say(u); }; replay();
      body.querySelectorAll('.ls-opt').forEach(b => b.onclick = () => { if (busy) return; const r = b.dataset.k === it.k;
        judge(b, r, q, body.querySelector(`.ls-opt[data-k="${CSS.escape(it.k)}"]`), () => { cap(L === 'zh' ? it.zh : it.en); return say(u); }); });
    } else if (q.ty === 'chu') { const zw = words.filter(w => w.zh), O = opts(zw.length >= 3 ? zw : bank.filter(w => w.zh), it, Math.min(3, Math.max(2, zw.length)));
      body.innerHTML = `<div class="ls-ask sx-onchu"><span class="ls-lab">${lab} · nhìn tranh, chọn chữ Hán đúng</span><div class="sx-onq">${onPicOf(it)}<b>${esc(it.en)}</b></div>
        <div class="sx-opts">${O.map(o => `<button class="sx-opt" data-k="${esc(o.k)}"><span class="zh">${esc(o.zh)}</span><small class="sx-pyl" data-later>${esc(o.py)}</small></button>`).join('')}</div></div>`;
      revealPy(body, 2500); replay = () => { stopAll(); return say(en(it.en, it.a_en)); }; replay();
      body.querySelectorAll('.sx-opt').forEach(b => b.onclick = () => { if (busy) return; const r = b.dataset.k === it.k;
        judge(b, r, q, body.querySelector(`.sx-opt[data-k="${CSS.escape(it.k)}"]`), () => { cap(it.zh + ' · ' + it.py); return say(zh(it.zh, it.a_zh)); }); });
    } else if (q.ty === 'noi') {
      body.innerHTML = `<div class="ls-noi"><div class="ls-npic">${onPicOf(it)}</div><div class="ls-nside"><span class="ls-lab">${lab} · con tự nói bằng ${q.L === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}</span>
        <div class="sx-onsay"><b class="sx-onhide" id="onAns">?</b></div><div class="ls-mic idle" id="mic"><span class="ls-lv"></span>${SVG.mic}<b></b></div>
        <div class="row ls-nrow"><button class="ls-b" id="nx">Bỏ qua ▶</button></div></div></div>`;
      body.querySelector('#nx').onclick = () => { stopAll(); busy = false; qi++; ask(); };
      const ZH = q.L === 'zh' && it.zh, model = () => say(ZH ? zh(it.zh, it.a_zh) : en(it.en, it.a_en)); replay = () => { stopAll(); model(); };
      (async () => { cap(ZH ? 'Đây là gì? Con nói bằng tiếng Trung nhé.' : 'Đây là gì? Con nói bằng tiếng Anh nhé.'); await wait(600); if (my !== RUN) return;
        const how = await micTurn(body.querySelector('#mic'), my); if (how === 'gone' || my !== RUN) return;
        const a = body.querySelector('#onAns'); a.className = 'sx-onshow'; a.innerHTML = ZH ? `<span class="zh">${esc(it.zh)}</span> <small>${esc(it.py)}</small>` : esc(it.en);
        await hd('ans'); await model(); if (my !== RUN) return;
        /* con tự nói được (hoặc máy không có micro) thì lên bậc; im lặng thì hẹn lại ngày web sau, không lên bậc */
        if (how === 'rec' || how === 'count') lvl(it, true, q.again); else { S[it.k].due = addDays(1); save(); }
        const el = document.getElementById('lsStars'); el.textContent = +el.textContent + 1; await hd('speak'); await wait(400); if (my === RUN) { qi++; ask(); } })();
    } else { const toZh = q.ty === 'en2zh', O = opts(sents, it, Math.min(3, sents.length)), u = toZh ? en(it.en, it.a_en) : zh(it.zh, it.a_zh);
      body.innerHTML = `<div class="ls-ask"><span class="ls-lab">${lab} · nghe ${toZh ? 'tiếng Anh, chọn câu tiếng Trung' : 'tiếng Trung, chọn câu tiếng Anh'}</span>
        <div class="sx-q">${it.e ? `<span class="sx-oe">${it.e}</span>` : ''}${toZh ? `<b>${esc(it.en)}</b>` : `<b class="zh">${esc(it.zh)}</b>`}</div>
        <div class="sx-opts">${O.map(o => `<button class="sx-opt" data-k="${esc(o.k)}">${toZh ? `<span class="zh">${esc(o.zh)}</span><small class="sx-pyl" data-later>${esc(o.py)}</small>` : esc(o.en)}</button>`).join('')}</div></div>`;
      revealPy(body, 2500); replay = () => { stopAll(); return say(u); }; replay();
      body.querySelectorAll('.sx-opt').forEach(b => b.onclick = () => { if (busy) return; const r = b.dataset.k === it.k;
        judge(b, r, q, body.querySelector(`.sx-opt[data-k="${CSS.escape(it.k)}"]`), () => say(toZh ? zh(it.zh, it.a_zh) : en(it.en, it.a_en))); });
    }
  }
  function done() {
    const t = today(), n = P.onLog[t] || 0, give = n < PTS.reviewMaxDay; P.onLog[t] = n + 1; jGet().on++; jMark();
    if (give) addStars(PTS.review); const nb = badgesNew(); save();
    body.innerHTML = `<div class="ls-done"><div class="ls-bigstar">${SVG.star}</div><b>Con ôn xong một lượt rồi!</b>
      <span>${ok1 ? `${ok1} thẻ lên bậc nhớ mới.` : 'Con đã nghe và nói lại tất cả các câu.'} ${give ? `Con được +${PTS.review} sao.` : ''}</span>
      ${nb.length ? `<div class="rw-badges"><small>🏅 Huy hiệu mới</small><div>${nb.map(b => badgeHTML(b, true, false)).join('')}</div></div>` : ''}
      <div class="row"><a class="btn g" href="#/hop-on">🗃️ Về Hộp ôn</a><button class="btn y" id="again" type="button">Ôn thêm một lượt</button></div></div>`;
    body.querySelector('#again').onclick = () => viewOnPlay(); replay = null; cap(''); sfx.win(); confetti(20); hd('stepdone');
  }
  (async () => { await hd('touch'); ask(); })();
}
