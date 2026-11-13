/* =====================================================================
   BIG BOOK + VÈ – 4 lần gặp trong một unit (chị duyệt 12/11/2026, claude/QuyTac_BigBook_Ve_Web.md, mục N)
   Mỗi unit: ngày đầu big book, ngày sau vè; mỗi thứ gặp 4 lần, việc khó dần (Introduce → Repeat → Practice → Produce).
   Năm quy tắc "gợi trước – hỏi sau":
     a. khởi động 20–45 giây (chỉ nghe, nhìn, không hỏi);  b. mẫu trước, con sau (cô → cô và con → con);
     c. nhắc tên trước khi hỏi;  d. 💡 luôn sẵn, tự hiện khi con im 6 giây, sai lần 1 có gợi ý, sai lần 2 cô làm mẫu và câu đó gặp lại cuối bài;
     e. ôn nối ngày: ngày big book mở bằng cả bài vè của unit (một tiếng mỗi lần), ngày vè mở bằng 3 trang big book. Vè cũ ôn ở buổi offline, không ôn trên web.
   step.type "bb"  (lan 1–4): 1 ai, cái gì – chạm tranh · 2 trang sau là ai · 3 đọc đuổi + điền khung câu · 4 con kể + câu của con (bìa khung ảnh)
   step.type "vek" (lan 1–4): 1 nghe mẫu + karaoke Anh · 2 karaoke Trung · 3 karaoke hai tiếng, giọng mẫu nhỏ dần · 4 lồng tiếng, lưu gửi cô
   Cần các hàm chung của ls-app.js (R, T, say, en, zh, tts, playFile, VOICE, finish, star, dots, cap, stopAll, micTurn, RUN…).
   ===================================================================== */
T.bb = { n: 'Big book', ic: 'cx_o_story', sub: 'Nghe cả quyển rồi trả lời câu hỏi',
  rules: ['Bên trái: cô đọc cả quyển big book bằng tiếng Anh, rồi đọc lại cả quyển bằng tiếng Trung.', 'Nghe hết quyển thì bên phải mở câu hỏi.', 'Cần thì con bấm 💡 để xem gợi ý.'] };
T.vek = { n: 'Vè', ic: 'cx_o_video', sub: 'Nghe mẫu, hát karaoke',
  rules: ['Con nghe cô đọc mẫu từng dòng.', 'Rồi con hát karaoke cùng nhạc: chữ sáng đến đâu, con hát đến đó.'] };

/* luật chơi riêng từng lần (step.rules) */
rulesCard = (function (orig) { return function (body, step, run) {
  if (!step.rules) return orig(body, step, run);
  const t = T[step.type], old = t.rules; t.rules = step.rules; try { return orig(body, step, run); } finally { t.rules = old; } }; })(rulesCard);

/* ---------- dùng chung ---------- */
const BV = {
  u: (l, t, a) => l === 'zh' ? zh(t, a) : en(t, a),
  // lời tiếng Việt: có file giọng thì phát; chưa có thì máy đọc tạm (danh sách câu cần thu giọng: little-seed/cong-cu/giong_vi_bbve.json)
  vi(t) { const a = ((window.SD && SD.vi_tx) || {})[t]; cap(t); return a ? say({ t, l: 'vi', a }) : wait(Math.min(2200, 500 + t.length * 30)); },
  // phát một lời với âm lượng v (0–1); v = 0 thì im
  async sayV(u, v) { if (!u || !u.t || v <= 0) return; if (v >= 1) { VOICE.volume = 1; return say(u); }
    const a = u.a || auOf(u.l, u.t), my = RUN; VOICE.volume = v;
    if (a) { for (const f of a.split('|')) { if (my !== RUN) return; await playFile(f); } return; }
    return new Promise(res => { try { const s = new SpeechSynthesisUtterance(String(u.t).replace(/[·…_]+/g, ' ')); s.lang = u.l === 'zh' ? 'zh-CN' : 'en-US'; s.rate = .82; s.volume = v;
      const vv = voices.find(x => x.lang.toLowerCase().startsWith(s.lang.slice(0, 2))); if (vv) s.voice = vv; s.onend = res; s.onerror = res; speechSynthesis.speak(s); setTimeout(res, 1800 + u.t.length * 180); } catch (e) { res(); } }); },
  // ảnh gia đình con dán vào bìa khung (chỉ lưu trên máy này)
  PHOTO: 'lsd-anh-gia-dinh',
  photo(k) { return sget(k || BV.PHOTO, ''); },
  pickPhoto(cb, k) { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => { const f = inp.files && inp.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 720 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
        cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        const d = cv.toDataURL('image/jpeg', .82); try { localStorage.setItem(k || BV.PHOTO, JSON.stringify(d)); } catch (e) { toast('Ảnh lớn quá, máy chưa lưu được.'); } cb(d); }; im.src = r.result; };
      r.readAsDataURL(f); }; inp.click(); },
  FRAME: { left: 59.8, top: 14.5, width: 33.2, height: 37.8 },   // ô ảnh trên bìa khung (đo từ bia_khung.webp U3)
  // (13/11, vè ôn vòng) khởi động trỏ tới vè theo mã unit: warm.ve_ref = {u, i: 'all' | [dòng]} – hát cả bài, một tiếng mỗi lần; lời lấy từ SD.ve_u lúc chạy,
  // nên khi lời vè viết lại thì khởi động tự đổi theo. ve_u trả về số unit để màn khởi động ghi "Vè cũ (Unit …)".
  warmOf(w) { w = Object.assign({}, w || {}); const r = w.ve_ref, V = ((window.SD && SD.ve_u) || {})[r && r.u];
    if (r && V && V.length) { w.ve = r.i === 'all' ? V.slice() : r.i.map(i => V[i % V.length]); w.ve_u = r.cu ? r.u : 0; }
    return w; },
  // vè 2 dòng có bàn tay vỗ theo nhịp; trang big book nghe lại – hai khởi động nối ngày
  async veLines(host, lines, langs, bpm, my) {
    for (const l of langs) for (const x of lines) { if (my !== RUN) return;
      const t = l === 'zh' ? x.zh : x.en;
      host.innerHTML = BV.veHTML(x, l, bpm);
      cap((l === 'zh' ? '中文: ' : 'EN: ') + t); await say(BV.u(l, t, l === 'zh' ? x.a_zh : x.a_en)); if (my !== RUN) return; await wait(450); } },
  async pages(host, P, idxs, langs, my, opt) { opt = opt || {};
    for (const l of langs) for (const i of idxs) { if (my !== RUN) return; const p = P[i]; if (!p) continue; const t = l === 'zh' ? p.zh : p.en;
      host.innerHTML = BV.pgHTML(p, l);
      cap((l === 'zh' ? '中文: ' : 'EN: ') + t); if (opt.rate) VOICE.playbackRate = opt.rate;
      await say(BV.u(l, t, l === 'zh' ? p.a_zh : p.a_en)); VOICE.playbackRate = 1; if (my !== RUN) return; await wait(opt.gap ?? 450); } },
  veHTML(x, l, bpm) { const t = l === 'zh' ? x.zh : vkTok(x.raw || x.en).map(w => w.t).join(' ');   // chữ hoa đánh dấu phách chỉ dùng khi hát; trên màn hình viết thường
    return `<div class="bvw-ve ${l}" style="--beat:${(60 / (bpm || 92)).toFixed(3)}s">${x.img ? `<img src="${esc(x.img)}" alt="">` : ''}
      <div class="bvw-line"><span class="bvw-clap" aria-hidden="true">👏</span><b class="${l === 'zh' ? 'zh' : ''}">${esc(t)}</b>${l === 'zh' && x.py ? `<small>${esc(x.py)}</small>` : ''}</div></div>`; },
  pgHTML(p, l) { const t = l === 'zh' ? p.zh : p.en;
    return `<div class="bvw-pg ${l}"><img src="${esc(p.img)}" alt=""><div class="bvw-tx"><b class="${l === 'zh' ? 'zh' : ''}">${esc(t)}</b>${l === 'zh' && p.py ? `<small>${esc(p.py)}</small>` : ''}</div></div>`; },
  warmBox(body, title) {
    body.innerHTML = `<div class="bvw"><div class="bvw-h"><span class="bvw-tag">☀️ Khởi động</span><b>${esc(title)}</b><button class="ls-b" id="bvSkip">Bỏ qua ▶</button></div><div class="bvw-host" id="bvHost"></div></div>`;
    return body.querySelector('#bvHost'); }
};

/* =====================================================================
   BIG BOOK – trái đọc theo trang, phải câu hỏi
   ===================================================================== */
R.bb = (step, body) => {
  const lan = step.lan || 1, P = step.pages, W = BV.warmOf(step.warm), LANG = ['en', 'zh'], NQ = step.qs.length;
  const FR = step.frame || BV.FRAME, PK = step.photo_k || BV.PHOTO, PT = step.photo_t || 'ảnh gia đình';
  let pass = 0, c = 0, autoId = -1, read = false, busy = false, who = '', glow = '', idleT = 0, tries = 0, warmed = false;
  let Q = step.qs.map(q => Object.assign({}, q)), qi = 0;
  const playing = () => autoId === RUN;
  const prog = () => dots(!warmed ? 0 : !read ? 1 + pass : 3 + Math.min(qi, NQ), 3 + NQ);
  const pgTxt = (p, l) => l === 'zh' ? p.zh : p.en;
  const pgAu = (p, l) => l === 'zh' ? p.a_zh : p.a_en;
  const clearIdle = () => { clearTimeout(idleT); idleT = 0; };

  /* ---- khởi động ---- */
  async function warm() { const me = ++RUN; warmed = false; prog();
    const host = BV.warmBox(body, ['', 'Vè và tên các bạn', 'Vè và 3 trang đầu', 'Vè và 2 trang đầu', 'Vè và cả quyển thật nhanh'][lan]);
    body.querySelector('#bvSkip').onclick = () => { sfx.pop(); stopAll(); main(); };
    X.replay = () => warm();
    if ((W.ve || [])[0]) host.innerHTML = BV.veHTML(W.ve[0], (W.ve_l || ['en'])[0], 92);   // màn khởi động luôn có tranh, chữ ngay từ đầu
    await BV.vi('Mình khởi động nhé! Con nghe vè và vỗ tay theo.'); if (me !== RUN) return;
    await BV.veLines(host, W.ve || [], W.ve_l || ['en'], 92, me); if (me !== RUN) return;
    if (W.names) { await BV.vi('Đây là các bạn trong truyện. Con nghe tên nhé!'); if (me !== RUN) return;
      host.innerHTML = `<div class="bvw-names">${W.names.map((o, k) => `<div class="bvw-nm" data-k="${k}">${pic(o.img, '', '')}<b>${esc(o.en)}</b><b class="zh">${esc(o.zh)}</b></div>`).join('')}</div>`;
      for (let k = 0; k < W.names.length; k++) { if (me !== RUN) return; const o = W.names[k], el = host.querySelector(`[data-k="${k}"]`); el.classList.add('lit');
        await say(en(o.en, o.a_en)); if (me !== RUN) return; await wait(250); await say(zh(o.zh, o.a_zh)); if (me !== RUN) return; await wait(350); el.classList.remove('lit'); el.classList.add('seen'); } }
    if (W.pages) { await BV.pages(host, P, W.pages, ['en', 'zh'], me); if (me !== RUN) return; }
    if (W.fast) { await BV.pages(host, P, P.map((_, i) => i), ['en'], me, { rate: 1.15, gap: 150 }); if (me !== RUN) return; }
    main(); }

  /* ---- trang sách bên trái ---- */
  const photoHTML = () => { const ph = BV.photo(PK); return ph ? `<img class="bb2-photo" src="${ph}" alt="" style="left:${FR.left}%;top:${FR.top}%;width:${FR.width}%;height:${FR.height}%">` : ''; };
  function drawBook(hl) { const p = P[c], l = LANG[pass]; prog();
    const hideTx = lan === 4 && !p.cover;   // lần 4: con kể, chỉ có tranh
    B.className = 'bb2-book ' + l;
    B.innerHTML = `<div class="bb2-h"><span class="ls-tag ${l}">${read ? 'Big book' : 'Lượt ' + (pass + 1)} · ${l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}</span><b>${esc(l === 'zh' ? step.title_zh : step.title)}</b><span>${c + 1}/${P.length}</span></div>
      <div class="bb2-pg ${p.cover ? 'cover' : ''} ${glow}"><img src="${esc(p.img)}" alt="">${p.cover ? photoHTML() + `<div class="bb2-ttl"><b class="${l === 'zh' ? 'zh' : ''}">${esc(pgTxt(p, l))}</b></div>` : ''}${glow === 'peek' ? '<span class="bb2-peek">💡</span>' : ''}</div>
      ${p.cover ? '' : glow === 'peek' ? '<div class="bb2-tx"><span class="bb2-who">💡 Trang sau…</span></div>' : hideTx ? `<div class="bb2-tx ke"><span class="bb2-who">${who || '🧒 Con kể nhé'}</span></div>` : `<div class="bb2-tx ${hl ? 'on' : ''}">${l === 'zh' ? `<b class="zh">${esc(p.zh)}</b><span class="sx-pyl on">${esc(p.py)}</span>` : `<span class="en">${esc(p.en)}</span>`}${who ? `<span class="bb2-who">${who}</span>` : ''}</div>`}
      ${lan >= 3 && !read ? `<div class="bb2-microw"><div class="ls-mic idle" id="bMic"><span class="ls-lv"></span>${SVG.mic}<b></b></div></div>` : ''}
      ${p.cover && (lan === 4 || BV.photo(PK)) ? `<div class="row bb2-phrow"><button class="ls-b" id="bPhoto">📷 ${BV.photo(PK) ? 'Đổi ' + PT : 'Ba mẹ chọn ' + PT}</button></div>` : ''}
      ${read ? (glow === 'peek' ? '' : `<div class="bb2-nav q"><button class="ls-b" id="bPage">🔊 Nghe trang này</button></div>`)
        : `<div class="bb2-nav"><button class="ls-b" id="bPrev" ${c || pass ? '' : 'disabled'} aria-label="Trang trước">◀</button>
        ${playing() ? `<span class="bb2-auto">${lan >= 3 ? '📖 Đang đọc…' : '🔊 Cô đang đọc…'}</span>` : `<button class="ls-b dark" id="bPlay">▶ Đọc tiếp</button>`}
        <button class="ls-b" id="bNext" aria-label="Trang sau">▶</button></div>`}`;
    const on = (id, f) => { const e = B.querySelector(id); if (e) e.onclick = f; };   // đang trả lời câu hỏi: không lật sách để khỏi lạc khỏi câu hỏi
    on('#bPrev', () => { stopAll(); glow = ''; who = ''; if (c > 0) c--; else if (pass > 0) { pass--; c = P.length - 1; } drawBook(); line(); });
    on('#bNext', () => { stopAll(); glow = ''; who = ''; turnPage(); });
    on('#bPlay', () => { sfx.pop(); glow = ''; auto(); });
    on('#bPage', () => { sfx.pop(); line(); });
    const ph = B.querySelector('#bPhoto'); if (ph) ph.onclick = () => BV.pickPhoto(() => drawBook(), PK); }
  function turnPage() {   // sang trang sau; hết lượt Anh thì sang lượt Trung; hết lượt Trung thì mở câu hỏi
    if (c < P.length - 1) { c++; drawBook(); line(); return; }
    if (pass === 0) { pass = 1; c = 0; sfx.ok(); if (!read) star(); drawBook(); line(); return; }
    if (!read) doneRead(); }
  async function line(l0) { const p = P[c], l = l0 || LANG[pass], me = RUN; drawBook(true);
    cap((l === 'zh' ? '中文: ' : 'EN: ') + pgTxt(p, l)); await say(BV.u(l, pgTxt(p, l), pgAu(p, l))); if (me === RUN) drawBook(); }
  async function listenAgain() { stopAll(); const me = RUN; autoId = me;   // sau khi mở câu hỏi: nghe lại cả quyển (không đổi tiến độ)
    for (const ps of [0, 1]) for (let i = 0; i < P.length; i++) { if (me !== RUN) return; pass = ps; c = i; await line(); if (me !== RUN) return; await wait(500); }
    autoId = -1; pass = 0; c = 0; drawBook(); }

  /* một trang theo từng lần: 1–2 cô đọc; 3 đọc đuổi; 4 con kể */
  async function pageTurn(me) { const p = P[c], l = LANG[pass], ans = !!p.nm;
    if (lan <= 2 || p.cover) { await line(); return; }
    const mic = () => B.querySelector('#bMic');
    if (lan === 3) {
      who = '👩‍🏫 Cô đọc'; await line(); if (me !== RUN) return; await wait(300);
      if (pass === 1 && !ans) return;   // lượt Trung: trang hỏi chỉ nghe
      who = '👩‍🏫🧒 Cô và con cùng đọc'; drawBook(true); cap('Cùng đọc nào!'); await wait(250); await say(BV.u(l, pgTxt(p, l), pgAu(p, l))); if (me !== RUN) return; await wait(400);
      if (!ans) return;   // trang trả lời (cả lượt Anh và lượt Trung): con đọc một mình
      who = '🧒 Con đọc một mình'; drawBook(true); await hd('turn'); if (me !== RUN) return;
      await conNoi(me, mic, async () => { who = '💡 Cô đọc lại, con đọc theo nhé'; drawBook(true); await BV.vi('Con nghe cô đọc lại rồi đọc nhé.');
        if (me !== RUN) return; await say(BV.u(l, pgTxt(p, l), pgAu(p, l))); who = '🧒 Con đọc một mình'; drawBook(true); }); await wait(300); return; }
    // lần 4: con kể – trang hỏi cô đọc; trang trả lời cô nói nửa câu đầu, con nói tiếp, rồi cô đọc cả câu
    if (!ans) { who = '👩‍🏫 Cô đọc'; await line(); return; }
    const half = l === 'zh' ? p.half_zh : p.half_en, cueU = () => BV.u(l, p['cue_' + l], p['a_cue_' + l]);
    who = '👩‍🏫 ' + esc(half); drawBook(); cap((l === 'zh' ? '中文: ' : 'EN: ') + half); await say(cueU()); if (me !== RUN) return;
    who = '🧒 Con nói tiếp…'; drawBook();
    const nmo = (step.names || []).find(o => o.k === p.nm);
    const how = await conNoi(me, mic, async () => { if (!nmo) return; who = '💡 ' + esc(l === 'zh' ? nmo.zh : nmo.en) + ' …'; drawBook();
      await BV.vi('Gợi ý nè.'); if (me !== RUN) return; await say(BV.u(l, l === 'zh' ? nmo.zh : nmo.en, l === 'zh' ? nmo.a_zh : nmo.a_en)); if (me !== RUN) return;
      await say(cueU()); who = '🧒 Con nói tiếp…'; drawBook(); }); if (how === 'gone') return;
    who = '👩‍🏫 Cô đọc cả câu'; await line(); }
  async function micOnce(mic, my) {   // một lượt thu (micTurn của ls-app.js thử 2 lần; ở đây gợi ý xen giữa 2 lần)
    if (!mic) return 'gone'; const lbl = mic.querySelector('b'), lv = mic.querySelector('.ls-lv');
    mic.className = 'ls-mic rec'; cap('🔴 Đang thu… con nói đi!'); if (lbl) lbl.textContent = '';
    const r = await recTake({ maxMs: 5000, onLevel: v => { if (lv) lv.style.setProperty('--lv', (.25 + v * .9).toFixed(2)); } });
    if (my !== RUN) return 'gone';
    if (!r) { mic.className = 'ls-mic on'; cap('Con nói nhé!'); for (let k = 3; k >= 1; k--) { if (my !== RUN) return 'gone'; if (lbl) lbl.textContent = k; await wait(1000); } return 'count'; }
    if (!r.spoke) { mic.className = 'ls-mic on'; if (lbl) lbl.textContent = ''; cap('Cô chưa nghe thấy con nói'); return 'quiet'; }
    mic.className = 'ls-mic ok'; if (lbl) lbl.textContent = '✓'; sfx.ok(); cap('🎧 Con nghe lại giọng của con nhé'); await wait(250);
    if (my !== RUN) return 'gone'; if (typeof jRec === 'function') jRec(); await playFile(r.url); return 'rec'; }
  async function conNoi(me, getMic, hintFn) {   // con im lặng: gợi ý (quy tắc d) rồi thử lại; lần 2 vẫn im thì đi tiếp, không chặn
    let how = await micOnce(getMic(), me); if (me !== RUN || how === 'gone') return 'gone';
    if (how === 'quiet') { await hintFn(); if (me !== RUN) return 'gone'; how = await micOnce(getMic(), me); if (me !== RUN || how === 'gone') return 'gone';
      if (how === 'quiet') { await hd('quiet2'); if (me !== RUN) return 'gone'; } }
    if (how === 'rec') star(); return how; }
  async function auto() { stopAll(); const me = RUN; autoId = me;
    VK_STOP.add(() => setTimeout(() => { if (body.isConnected && B.isConnected) { autoId = -1; drawBook(); } }, 0));   // bấm Dừng: hiện lại nút Đọc tiếp
    if (c === 0 && pass === 0) { await (lan === 3 ? BV.vi('Mình đọc đuổi nhé: cô đọc, cô và con cùng đọc, rồi con đọc một mình.') : lan === 4 ? BV.vi('Con kể chuyện nhé! Cô nói nửa câu, con nói tiếp.') : hd('listen')); if (me !== RUN) return; }
    while (me === RUN) { await pageTurn(me); if (me !== RUN) return; who = ''; await wait(lan >= 3 ? 400 : 700); if (me !== RUN) return;
      if (c === P.length - 1 && pass === 1) { autoId = -1; return doneRead(); }
      if (c === P.length - 1) { pass = 1; c = 0; sfx.ok(); star(); cap('Giờ mình nghe bằng tiếng Trung nhé.'); await wait(900); if (me !== RUN) return; continue; }
      c++; } }
  function doneRead() { autoId = -1; c = 0; pass = 0; who = ''; if (read) return drawBook(); read = true; sfx.ok(); star(); drawBook(); qStart(); }

  /* ---- câu hỏi bên phải ---- */
  const qL = q => q.l === 'zh' ? 'zh' : 'en';
  const ansU = q => BV.u(q.l, q.say, q.a_say);
  function drawLock() { prog(); QP.className = 'bb2-q lock';
    QP.innerHTML = `<div class="bb2-qh"><b>${['', 'Ai đây?', 'Trang sau là ai?', 'Điền chỗ trống', step.mine_h || 'Gia đình con'][lan]}</b><small>${NQ} câu</small></div><div class="bb2-lock"><span>🔒</span><p>${lan >= 3 ? 'Con đọc hết big book cùng cô' : 'Con nghe hết big book (tiếng Anh rồi tiếng Trung)'} thì câu hỏi mở ra ở đây.</p></div>
      <ol class="bb2-list">${step.qs.map((q, k) => `<li><img src="${esc(q.img || (q.pg != null ? P[q.pg].img : P[0].img))}" alt=""><span>Câu ${k + 1}</span></li>`).join('')}</ol>`; }
  function drawQ() { prog(); const q = Q[qi]; QP.className = 'bb2-q open';
    if (!q) { QP.innerHTML = `<div class="ls-done"><b>Con trả lời hết rồi!</b></div>`; return; }
    const L = qL(q), head = `<div class="bb2-qh"><b>Câu ${Math.min(qi + 1, Q.length)}/${Q.length}${q.again ? ' · gặp lại' : ''}</b><small>${L === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}</small></div>`;
    if (lan === 4) {
      QP.innerHTML = head + `<div class="bb2-mine"><button class="bb2-ask" id="qSay" type="button"><span class="${L === 'zh' ? 'zh' : ''}">🔊 ${esc(q.q || q.half)}</span></button>
        <div class="bb2-half ${L}">${esc(q.half).replace('…', '<i>___</i>')}</div><div class="ls-mic idle" id="qMic"><span class="ls-lv"></span>${SVG.mic}<b></b></div>
        <div class="bb2-ans" id="qAns"></div><div class="row"><button class="ls-b" id="qSkip">Bỏ qua ▶</button></div></div>`;
      QP.querySelector('#qSay').onclick = () => { stopAll(); q.q ? say(BV.u(q.l, q.q, q.a_q)) : say(BV.u(q.l, q.cue, q.a_cue)); };
      QP.querySelector('#qSkip').onclick = () => { stopAll(); qi++; qi >= Q.length ? (drawQ(), finish()) : ask(); }; return; }
    const askTx = lan === 3 ? `${esc(q.fr).replace('___', '<i class="bb2-blank" id="qBlank">___</i>')}` : esc(q.qd || q.q);
    const opt = (o, k) => lan === 2 ? `<button class="ls-opt bb2-pgopt" data-k="${k}"><img src="${esc(P[o.pg].img)}" alt="" draggable="false"></button>`
      : `<button class="ls-opt" data-k="${k}">${pic(o.img, '', '')}<span class="sx-nm ${L === 'zh' ? 'zh' : ''}">${esc(L === 'zh' ? o.zh : o.en)}</span></button>`;
    const cm = (step.cmd || {})[q.l];
    const coRow = `<div class="bb2-co">${step.co_img ? `<img src="${esc(step.co_img)}" alt="">` : ''}<div class="bb2-co-tx">${cm ? `<b class="${L === 'zh' ? 'zh' : ''}">${esc(cm.t)}</b>${q._tr ? `<small>${esc(cm.tr)}</small>` : ''}` : ''}</div>
      <button class="bb2-bulb" id="qHint" type="button" aria-label="Gợi ý">💡</button></div>`;
    QP.innerHTML = head + coRow + `<button class="bb2-ask" id="qSay" type="button"><img src="${esc(q.img || P[q.pg].img)}" alt="">${lan === 2 ? '<span class="bb2-arrow" aria-hidden="true">➜ ?</span>' : ''}<span class="${L === 'zh' ? 'zh' : ''}">🔊 ${askTx}${q.py && lan !== 3 ? `<small>${esc(q.py)}</small>` : ''}</span></button>
      <div class="ls-opts bb2-opts ${lan === 2 ? 'pg' : ''}" style="--n:${q.opts.length}">${q.opts.map(opt).join('')}</div>
      <div class="bb2-ans" id="qAns"></div>`;
    QP.querySelector('#qSay').onclick = () => { stopAll(); askAudio(q); };
    QP.querySelector('#qHint').onclick = () => { sfx.pop(); hint(); };
    QP.querySelectorAll('.ls-opt').forEach(b => b.onclick = () => pick(b)); }
  async function cmdAudio(q, me) { const cm = (step.cmd || {})[q.l]; if (!cm) return;
    cap((q.l === 'zh' ? '中文: ' : 'EN: ') + cm.t); await say(BV.u(q.l, cm.t, cm.a)); if (me !== RUN || !q._tr) return; await wait(250);
    if (cm.tl === 'vi') await BV.vi(cm.tr); else { cap('EN: ' + cm.tr); await say(en(cm.tr, cm.a_tr)); } }
  const askAudio = async q => { const me = RUN;
    if (lan === 3) { const p = P[q.ap]; await cmdAudio(q, me); if (me !== RUN) return; await wait(250);
      if (q.q) { await say(BV.u(q.l, q.q, q.a_q)); if (me !== RUN) return; await wait(300); } return say(BV.u(q.l, p['cue_' + q.l], p['a_cue_' + q.l])); }
    if (lan === 2) { await say(BV.u(q.l, q.q, q.a_q)); if (me !== RUN) return; await wait(350); return cmdAudio(q, me); }
    await cmdAudio(q, me); if (me !== RUN) return; await wait(250); return say(BV.u(q.l, q.q, q.a_q)); };
  async function sweep(host, opts, l, me) {   // nhắc tên trước khi hỏi: thẻ sáng lên, cô đọc tên
    for (let k = 0; k < opts.length; k++) { if (me !== RUN) return; const el = host.querySelectorAll('.ls-opt, .bvw-nm')[k]; el && el.classList.add('lit');
      await say(BV.u(l, l === 'zh' ? opts[k].zh : opts[k].en, l === 'zh' ? opts[k].a_zh : opts[k].a_en)); if (me !== RUN) return; await wait(250); el && el.classList.remove('lit'); } }
  async function qStart() { const me = ++RUN; drawQ(); clearIdle();
    if (lan === 2) {   // lần 2: lướt thẻ một lần ở đầu phần hỏi
      QP.innerHTML = `<div class="bb2-qh"><b>Trang sau là ai?</b><small>${NQ} câu</small></div><div class="bvw-names sm">${step.names.map((o, k) => `<div class="bvw-nm" data-k="${k}">${pic(o.img, '', '')}<b>${esc(o.en)}</b><b class="zh">${esc(o.zh)}</b></div>`).join('')}</div>`;
      await BV.vi('Con nghe lại tên các bạn nhé.'); if (me !== RUN) return;
      for (let k = 0; k < step.names.length; k++) { if (me !== RUN) return; const el = QP.querySelector(`[data-k="${k}"]`), o = step.names[k]; el.classList.add('lit');
        await say(en(o.en, o.a_en)); if (me !== RUN) return; await wait(200); await say(zh(o.zh, o.a_zh)); if (me !== RUN) return; await wait(250); el.classList.remove('lit'); el.classList.add('seen'); }
    }
    else if (lan === 4) { c = 0; pass = 0; drawBook(); await BV.vi(step.mine_vi || 'Giờ con nói về gia đình con nhé! Con nhìn ảnh rồi nói.'); if (me !== RUN) return; }
    ask(); }
  async function ask() { const q = Q[qi]; if (!q) return; const me = ++RUN; tries = 0; clearIdle(); glow = ''; q._tr = qi < 2 && !q.again;
    if (lan !== 4) { c = q.pg != null ? q.pg : 0; pass = q.l === 'zh' ? 1 : 0; who = ''; drawBook(); }
    drawQ(); X.replay = () => { stopAll(); askAudio(q); };
    if (lan === 4) { if (q.q) { await say(BV.u(q.l, q.q, q.a_q)); if (me !== RUN) return; await wait(250); }
      await say(BV.u(q.l, q.cue, q.a_cue)); if (me !== RUN) return;
      const how = await conNoi(me, () => QP.querySelector('#qMic'), async () => { const a = QP.querySelector('#qAns');
        if (a) a.innerHTML = `<span class="${q.l === 'zh' ? 'zh' : ''}">💡 ${esc(q.vd || '')}</span>`;
        await BV.vi('Con nghe ví dụ nhé.'); if (me !== RUN) return; if (q.vd) await say(BV.u(q.l, q.vd, q.a_vd)); if (me !== RUN) return;
        await say(BV.u(q.l, q.cue, q.a_cue)); }); if (how === 'gone') return;
      await wait(500); if (me !== RUN) return; qi++; if (qi >= Q.length) { drawQ(); await wait(300); return finish(); } return ask(); }
    if (lan === 1 && !q.again) { cap('Con nghe tên các bạn nhé.'); await sweep(QP, q.opts, q.l, me); if (me !== RUN) return; await wait(200); }
    cap((q.l === 'zh' ? '中文: ' : 'EN: ') + (lan === 3 ? q.fr : q.q)); await askAudio(q); if (me !== RUN) return;
    idleT = setTimeout(() => { if (me === RUN && !busy && Q[qi] === q && !glow) hint(true); }, 6000); }   // con im khoảng 6 giây: gợi ý tự hiện
  async function hint(auto) { const q = Q[qi]; if (!q || busy) return; clearIdle(); stopAll(); const me = RUN;
    // trang có đáp án sáng lên bên trái + nghe lại câu mẫu (lần 2: chỉ hé trang sau, để con vẫn tự đoán)
    c = q.ap; pass = q.l === 'zh' ? 1 : 0; glow = lan === 2 ? 'peek' : 'glow'; drawBook();
    const h = QP.querySelector('#qHint'); h && h.classList.add('on');
    if (auto) { await BV.vi('Con xem gợi ý nhé.'); if (me !== RUN) return; }
    cap('💡 ' + q.say); await say(ansU(q)); if (me !== RUN) return; await wait(300); await askAudio(q); }
  async function pick(b) { if (busy) return; busy = true; clearIdle(); stopAll(); const q = Q[qi], me = RUN, k = +b.dataset.k, ok = k === q.ans; 
    if (ok) { sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star();
      const bl = QP.querySelector('#qBlank'); if (bl) { bl.textContent = q.l === 'zh' ? q.opts[q.ans].zh : q.opts[q.ans].en; bl.classList.add('fill'); }
      if (lan === 2) { c = q.ap; glow = ''; drawBook(true); }
      QP.querySelector('#qAns').innerHTML = `<span class="${q.l === 'zh' ? 'zh' : ''}">✓ ${esc(q.say)}</span>`; cap((q.l === 'zh' ? '中文: ' : 'EN: ') + q.say);
      await say(ansU(q)); if (me !== RUN) { busy = false; return; } await wait(500); }
    else { tries++; sfx.no(); shake(b); b.disabled = true; b.classList.add('off');
      if (tries === 1) { QP.querySelector('#qAns').innerHTML = '<span class="no">Gần đúng rồi! Con xem gợi ý nhé.</span>'; busy = false; return hint(); }
      // sai lần 2: cô làm mẫu đáp án, câu này gặp lại ở cuối bài
      const rb = QP.querySelectorAll('.ls-opt')[q.ans]; rb && rb.classList.add('model');
      const bl = QP.querySelector('#qBlank'); if (bl) { bl.textContent = q.l === 'zh' ? q.opts[q.ans].zh : q.opts[q.ans].en; bl.classList.add('fill'); }
      c = q.ap; glow = 'glow'; drawBook(true);
      if (!q.again) Q.push(Object.assign({}, q, { again: true }));
      QP.querySelector('#qAns').innerHTML = `<span>👩‍🏫 ${esc(q.say)}</span><span class="no">${q.again ? '' : 'Lát nữa mình gặp lại câu này nhé.'}</span>`;
      await hd('ans'); if (me !== RUN) { busy = false; return; } await say(ansU(q)); if (me !== RUN) { busy = false; return; } await wait(900); }
    busy = false; glow = ''; qi++; if (qi >= Q.length) { drawQ(); await wait(400); return finish(); } ask(); }

  /* ---- dựng màn hai cột ---- */
  let B, QP;
  function main() { stopAll(); warmed = true;
    body.innerHTML = `<div class="bb2 lan${lan}"><section class="bb2-book" id="bbBook"></section><section class="bb2-q" id="bbQ"></section></div>`;
    B = body.querySelector('#bbBook'); QP = body.querySelector('#bbQ'); pass = 0; c = 0;
    X.replay = () => { stopAll(); line(); };
    drawLock(); drawBook(); auto(); }
  warm();
};

/* =====================================================================
   VÈ karaoke – mỗi tiếng một video (Anh trước, Trung sau), trong video không có chữ tiếng Việt
   ===================================================================== */
const VK_NAMES = new Set(['leo', 'anna', 'bông', 'vũ', 'xiaomei', 'puppy', 'kitty']);
function vkTok(raw) {   // chữ hoa trong nguồn = phách mạnh; trên màn hình viết thường như câu bình thường
  const nm = (typeof P !== 'undefined' && P.name) ? P.name : '';
  let s = (raw || '').replace(/(\w)-(\w)/g, '$1$2'); s = nm ? s.replace(/___/g, nm) : s.replace(/,? ?___,? ?/g, ' ').trim();
  const out = []; let first = true;
  for (const tok of s.split(/\s+/)) { if (!tok) continue;
    const core = tok.replace(/[^\p{L}']/gu, ''), up = [...core].filter(ch => ch !== ch.toLowerCase()).length, strong = up >= 2;
    let t = strong ? tok.toLowerCase() : tok; const lc = core.toLowerCase();   // đầu câu và tên riêng viết hoa ("My name's Leo")
    if (first || lc === 'i' || VK_NAMES.has(lc.replace(/'s$/, ''))) t = t.replace(/\p{L}/u, m => m.toUpperCase());
    out.push({ t, s: strong }); first = /[.!?]["”’)]?$/.test(tok); }
  const st = out.map((w, i) => w.s ? i : -1).filter(i => i >= 0);   // thời điểm từng từ (tính theo phách trong ô nhịp 4 phách)
  if (st.length === 4) { st.forEach((i, b) => out[i].b = b);
    out.forEach((w, i) => { if (w.b !== undefined) return; const a = st.filter(x => x < i).pop(), z = st.find(x => x > i);
      if (a === undefined) w.b = Math.max(0, out[z].b - .5 * (z - i)); else if (z === undefined) w.b = Math.min(3.6, out[a].b + .4 * (i - a));
      else w.b = out[a].b + (out[z].b - out[a].b) * (i - a) / (z - a); }); }
  else out.forEach((w, i) => w.b = out.length > 1 ? 3.4 * i / (out.length - 1) : 0);
  return out;
}
function vkZh(z) { const ch = [...(z || '')]; const syl = ch.filter(x => /\p{Script=Han}|\w/u.test(x)).length || 1; let k = 0;
  return ch.map(x => { const isS = /\p{Script=Han}|\w/u.test(x); const o = { t: x, b: isS ? 3.4 * (k / Math.max(1, syl - 1)) : null }; if (isS) k++; return o; }); }

/* Dừng, Làm lại, rời bước đều gọi stopAll(): tắt luôn nhạc máy, micro của vè, hẹn giờ gợi ý */
const VK_STOP = new Set();
stopAll = (function (orig) { return function () { const f = [...VK_STOP]; VK_STOP.clear(); f.forEach(g => { try { g(); } catch (e) {} }); try { VOICE.volume = 1; VOICE.playbackRate = 1; } catch (e) {} return orig.apply(this, arguments); }; })(stopAll);
R.vek = (step, body) => {
  // lần 1: nghe mẫu + karaoke tiếng Anh · lần 2: karaoke tiếng Trung · lần 3: hai tiếng, mỗi tiếng 3 lượt giọng mẫu to → nhỏ → tắt · lần 4: lồng tiếng, lưu gửi cô
  const lan = step.lan || 1, BPM = step.bpm || 92, BEAT = 60 / BPM, BAR = 4 * BEAT, W = 960, H = 540;
  const LANGS = lan === 1 ? ['en'] : ['en', 'zh'], NEED = lan === 3 ? 3 : 1;
  const nm = (typeof P !== 'undefined' && P.name) ? P.name : '';
  const fill = s => nm ? (s || '').replace(/___/g, nm) : (s || '').replace(/___[，,]?\s*/g, '').replace(/\s+([!?！？])/g, '$1').trim();
  const TTL = { en: step.title || '', zh: step.title_zh || '' };
  const mk = l => [{ k: 'count', l }].concat(step.lines.map(x => ({ k: 'line', l, x, tk: l === 'zh' ? vkZh(fill(x.zh)) : vkTok(x.raw || x.en) })), [{ k: 'end', l }]);
  const TLS = { en: mk('en'), zh: mk('zh') };
  const IM = {}; step.lines.forEach(x => { if (x.img && !IM[x.img]) { const im = new Image(); im.src = x.img; IM[x.img] = im; } });
  let lang = lan === 2 ? 'zh' : 'en', TL = TLS[lang], mode = '', ctx = null, master = null, raf = 0, micS = null, rec = null, after = null, warmK = false, noRec = false;
  const kar = { en: 0, zh: 0 }, heard = { en: false, zh: false }, url = { en: '', zh: '' }, ext = { en: 'webm', zh: 'webm' };
  const DUR = () => TL.length * BAR;
  const C2 = () => body.querySelector('#vkCv');
  const sayLine = seg => seg.l === 'zh' ? zh(fill(seg.x.zh), seg.x.a_zh) : en(seg.tk.map(w => w.t).join(' '), seg.x.a_en);
  const hook = () => VK_STOP.add(() => { const was = mode; stop(); after = null; if (was && body.isConnected) ui(); });
  // giọng mẫu khi hát karaoke: lần 3 to → nhỏ → tắt theo lượt; lần 4 nhỏ
  const guide = () => lan === 3 ? [1, .35, 0][Math.min(2, kar[lang])] : lan === 4 ? .35 : 1;
  const guideTx = v => v >= 1 ? 'giọng cô to' : v > 0 ? 'giọng cô nhỏ' : 'con hát một mình';
  const okLang = l => lan === 4 ? (!!url[l] || (noRec && kar[l] > 0)) : kar[l] >= NEED;
  const mainLangs = lan === 2 ? ['zh'] : LANGS;
  const allDone = () => mainLangs.every(okLang);
  const total = 1 + mainLangs.length * (lan === 3 ? 3 : 1);

  function ui() { const L = lang === 'zh';
    dots(1 + mainLangs.reduce((a, l) => a + Math.min(lan === 3 ? 3 : 1, lan === 4 ? (url[l] ? 1 : 0) : kar[l]), 0), total);
    const g = guide(), lbl = lan === 3 ? ` · lượt ${Math.min(3, kar[lang] + 1)}/3 (${guideTx(g)})` : '';
    body.innerHTML = `<div class="vk">
      <div class="vk-tabs">${LANGS.map((l, i) => `<button class="vk-tab ${l} ${lang === l ? 'on' : ''}" data-l="${l}" ${mode || (l === 'zh' && lan !== 2 && !okLang('en')) ? 'disabled' : ''}>${i + 1} · ${l === 'zh' ? '中文' : 'English'} ${okLang(l) || (lan === 2 && l === 'en' && warmK) ? '✓' : ''}</button>`).join('')}</div>
      <div class="vk-stage ${lang}"><canvas id="vkCv" width="${W}" height="${H}"></canvas>${url[lang] || mode ? '' : `<div class="vk-cover" id="vkCover"><b>▶</b></div>`}</div>
      <div class="vk-st" id="vkSt">${mode === 'm' ? '👂 Con nghe cô đọc mẫu…' : mode === 'k' ? '🎤 Đang hát karaoke…' + lbl : mode === 'v' ? '🔴 Đang thu giọng con…' : lan === 4 && url[lang] ? '🎬 Video của con đây! Con xem lại rồi lưu về máy nhé.' : lan === 4 && !url[lang] ? '🎬 Con bấm Lồng tiếng để thu video nhé!' : kar[lang] ? `Con đã hát ${kar[lang]} lần.${lan === 3 && kar[lang] < 3 ? ' Lượt sau: ' + guideTx(g) + '.' : ''}` : heard[lang] ? 'Giờ con hát karaoke cùng nhạc nhé!' : 'Con nghe mẫu trước nhé.'}</div>
      ${url[lang] ? `<div class="vk-out"><video src="${url[lang]}" controls playsinline></video><div class="row"><a class="btn g" id="vkSave" href="${url[lang]}" download="ve-${L ? 'tieng-trung' : 'tieng-anh'}-${(nm || 'cua-con').replace(/\s+/g, '-')}.${ext[lang]}">💾 Lưu video về máy</a><button class="ls-b" id="vkRe">🎬 Thu lại</button></div>
        <small>Ba mẹ lưu video rồi gửi vào nhóm Zalo của lớp cho cô nhé.</small></div>` : ''}
      <div class="row vk-ctl"><button class="btn" id="vkM" ${mode ? 'disabled' : ''}>💡 Nghe mẫu</button>
        <button class="btn ${lan === 4 ? '' : 'y'}" id="vkK" ${mode ? 'disabled' : ''}>🎤 Hát karaoke${kar[lang] ? ` (lần ${kar[lang] + 1})` : ''}</button>
        ${lan === 4 ? `<button class="btn y" id="vkV" ${mode ? 'disabled' : ''}>🎬 Lồng tiếng</button>` : ''}
        ${!L && LANGS.includes('zh') && okLang('en') && !mode ? '<button class="btn g" id="did">Sang tiếng Trung →</button>' : ''}
        ${allDone() && !mode ? '<button class="btn g" id="nx">Xong ⭐</button>' : ''}</div>
      ${lan === 4 && !url[lang] && !mode ? '<small class="vk-tip">Lồng tiếng: nên đeo tai nghe để video chỉ có nhạc và giọng con.</small>' : ''}</div>`;
    const on = (id, f) => { const e = body.querySelector(id); if (e) e.onclick = f; };
    on('#vkM', () => { sfx.pop(); model(); }); on('#vkK', () => { sfx.pop(); start('k'); }); on('#vkV', () => { sfx.pop(); start('v'); });
    on('#vkCover', () => { sfx.pop(); start(lan === 4 ? 'v' : 'k'); });
    on('#did', () => { sfx.pop(); setLang('zh'); }); on('#nx', () => { stop(); sfx.ok(); finish(); });
    on('#vkRe', () => { URL.revokeObjectURL(url[lang]); url[lang] = ''; start('v'); });
    body.querySelectorAll('.vk-tab').forEach(b => b.onclick = () => { if (b.dataset.l !== lang) setLang(b.dataset.l); });
    draw(-1); }
  function setLang(l) { stop(); after = null; lang = l; TL = TLS[l]; ui(); if (lan <= 2 && !heard[l]) intro(); else if (lan === 3) chain(); }
  async function intro() { await model(); if (mode === '' && heard[lang] && !kar[lang] && body.isConnected) start('k'); }   // lần 1–2: nghe mẫu rồi tự vào karaoke
  // lần 3: hát liền 3 lượt mỗi tiếng, giọng cô nhỏ dần; hết tiếng Anh tự sang tiếng Trung
  function chain() { if (!body.isConnected) return; if (kar[lang] >= 3) { if (lang === 'en' && kar.zh < 3) { cap('Giờ mình hát tiếng Trung nhé!'); setTimeout(() => body.isConnected && !mode && setLang('zh'), 1200); } return; }
    after = () => setTimeout(() => { if (body.isConnected && !mode) chain(); }, 1400);
    cap('Lượt ' + (kar[lang] + 1) + '/3 · ' + guideTx(guide())); start('k', true); }

  /* ---- khởi động: 3 trang big book (+ lần 2: hát lại vè tiếng Anh; lần 3: nghe nhanh vè hai tiếng; lần 4: karaoke một lượt giọng nhỏ) ---- */
  async function warm() { const me = ++RUN; dots(0, total);
    const host = BV.warmBox(body, 'Nghe lại 3 trang big book');
    body.querySelector('#bvSkip').onclick = () => { sfx.pop(); stopAll(); afterWarm(true); };
    X.replay = () => warm();
    const p0 = (step.pages || [])[(step.warm || [])[0]]; if (p0) host.innerHTML = BV.pgHTML(p0, 'en');
    await BV.vi('Mình khởi động nhé! Con nghe lại big book.'); if (me !== RUN) return;
    await BV.pages(host, step.pages || [], step.warm || [], ['en', 'zh'], me); if (me !== RUN) return;
    afterWarm(false); }
  async function afterWarm(skipped) { X.replay = () => model();
    if (lan === 2 && !skipped) { lang = 'en'; TL = TLS.en; ui(); await BV.vi('Con hát lại vè tiếng Anh cùng cô nhé!'); if (!body.isConnected) return;
      after = () => { warmK = true; kar.en = 0; setTimeout(() => body.isConnected && setLang('zh'), 900); }; return start('k', true); }
    if (lan === 3 && !skipped) { lang = 'en'; TL = TLS.en; ui(); await BV.vi('Con nghe nhanh vè hai tiếng nhé.'); if (!body.isConnected) return;
      await model(true); if (!body.isConnected || mode) return; lang = 'zh'; TL = TLS.zh; ui(); await model(true); if (!body.isConnected || mode) return;
      lang = 'en'; TL = TLS.en; ui(); await BV.vi('Giờ con hát 3 lượt. Giọng cô nhỏ dần, con hát to lên nhé!'); if (!body.isConnected) return; return chain(); }
    if (lan === 3) { lang = 'en'; TL = TLS.en; ui(); return; }
    if (lan === 4 && !skipped) { lang = 'en'; TL = TLS.en; ui(); await BV.vi('Con hát một lượt cùng cô cho nhớ nhé.'); if (!body.isConnected) return;
      after = () => { kar.en = 0; ui(); BV.vi('Hôm nay con lồng tiếng cho video vè. Con bấm Lồng tiếng nhé!'); }; return start('k', true); }
    if (lan === 4) { lang = 'en'; TL = TLS.en; ui(); return; }
    if (lan === 2) { lang = 'zh'; TL = TLS.zh; }
    ui(); intro(); }

  /* ---- nhạc máy: trống + bass + hợp âm C–G–Am–F, đếm nhịp bằng tiếng gõ ---- */
  function music(t0) {
    const g = ctx.createGain(); g.gain.value = .5; g.connect(master);
    const note = (f, t, d, type, v) => { const o = ctx.createOscillator(), a = ctx.createGain(); o.type = type; o.frequency.value = f; o.connect(a); a.connect(g);
      a.gain.setValueAtTime(.0001, t); a.gain.exponentialRampToValueAtTime(v, t + .02); a.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .05); };
    const noise = (t, d, v, hp) => { const n = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, n, ctx.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain(); f.type = hp ? 'highpass' : 'bandpass'; f.frequency.value = hp ? 7000 : 1500; a.gain.value = v;
      s.buffer = b; s.connect(f); f.connect(a); a.connect(g); s.start(t); };
    const kick = t => { const o = ctx.createOscillator(), a = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .18);
      a.gain.setValueAtTime(.9, t); a.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(a); a.connect(g); o.start(t); o.stop(t + .3); };
    const CH = [[48, 64, 67, 72], [43, 62, 67, 71], [45, 64, 69, 72], [41, 65, 69, 72]], hz = m => 440 * Math.pow(2, (m - 69) / 12);
    TL.forEach((seg, bi) => { const tb = t0 + bi * BAR;
      if (seg.k === 'count') { for (let b = 0; b < 4; b++) note(b ? 1200 : 1600, tb + b * BEAT, .08, 'square', .25); return; }
      const ch = CH[bi % 4];
      for (let b = 0; b < 4; b++) { const t = tb + b * BEAT;
        if (b % 2 === 0) kick(t); else noise(t, .16, .7, false);
        noise(t + BEAT / 2, .05, .18, true); noise(t, .05, .12, true);
        note(hz(ch[0]), t, BEAT * .9, 'triangle', .35); }
      ch.slice(1).forEach(m => note(hz(m), tb, BAR * .95, 'sine', .07)); });
  }
  /* ---- vẽ một khung hình (t < 0: màn chờ) ---- */
  function draw(t) { const cv = C2(); if (!cv) return; const g = cv.getContext('2d'), L = lang === 'zh';
    g.fillStyle = '#FFF7EA'; g.fillRect(0, 0, W, H);
    const bi = t < 0 ? -1 : Math.min(TL.length - 1, Math.floor(t / BAR)), seg = TL[Math.max(0, bi)], bt = t < 0 ? -1 : (t - bi * BAR) / BEAT;
    const lineSeg = seg.k === 'line' ? seg : (TL.slice(0, Math.max(1, bi)).reverse().find(s => s.k === 'line') || TL.find(s => s.k === 'line'));
    const im = lineSeg && IM[lineSeg.x.img];
    if (im && im.complete && im.naturalWidth) { const r = Math.max(W / im.naturalWidth, 390 / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
      g.save(); g.beginPath(); g.rect(0, 0, W, 390); g.clip(); g.drawImage(im, (W - w) / 2, (390 - h) / 2, w, h); g.restore(); }
    g.fillStyle = '#ffffff'; g.fillRect(0, 390, W, 150); g.fillStyle = '#F2C94C'; g.fillRect(0, 386, W, 6);
    g.textBaseline = 'middle';
    if (mode !== 'm') for (let b = 0; b < 4; b++) { const hit = t >= 0 && b === Math.floor(bt); g.beginPath(); g.arc(W - 120 + b * 28, 38, hit ? 11 : 8, 0, 7);
      g.fillStyle = hit ? '#F2994A' : 'rgba(0,0,0,.18)'; g.fill(); }
    if (t < 0 || seg.k === 'count' || seg.k === 'end') {
      g.fillStyle = 'rgba(255,247,234,.85)'; g.fillRect(0, 0, W, 390); g.textAlign = 'center'; g.fillStyle = '#3b2a1f';
      const big = t < 0 ? TTL[lang] : seg.k === 'count' ? String(Math.min(4, Math.floor(bt) + 1)) : (L ? '👏 真棒！' : '👏 Yeah!');
      g.font = `800 ${seg.k === 'count' && t >= 0 ? 150 : 60}px ${L ? '"Noto Sans SC"' : '"Be Vietnam Pro"'}, system-ui, sans-serif`; g.fillText(big, W / 2, 200); }
    const nxt = TL[bi + 1], show = seg.k === 'line' ? seg : (nxt && nxt.k === 'line' ? nxt : null);
    if (show) { const sung = seg === show ? bt : -1;
      let fs = L ? 52 : 46; g.textAlign = 'left';
      const font = s => `${L ? 700 : 800} ${s}px ${L ? '"Noto Sans SC", system-ui' : '"Be Vietnam Pro", system-ui'}, sans-serif`;
      const sep = L ? '' : ' '; let tw;
      do { g.font = font(fs); tw = show.tk.reduce((a, w) => a + g.measureText(w.t + sep).width, 0); if (tw > W - 60) fs -= 2; } while (tw > W - 60 && fs > 20);
      let x = (W - tw) / 2; const y = L && show.x.py ? 448 : 465;
      show.tk.forEach(w => { const on = w.b !== null && sung >= w.b; g.font = font(fs); g.fillStyle = on ? '#C8372D' : (w.s ? '#3b2a1f' : '#6b5a45');
        g.fillText(w.t, x, y);
        x += g.measureText(w.t + sep).width; });
      if (L && show.x.py) { g.textAlign = 'center'; g.font = '500 24px system-ui, sans-serif'; g.fillStyle = '#2d7a74'; g.fillText(fill(show.x.py), W / 2, 505); } }
    const st = body.querySelector('#vkSt'); if (st && t >= 0 && mode) { const k = TL.slice(0, bi + 1).filter(s => s.k === 'line').length, n = TL.filter(s => s.k === 'line').length;
      const msg = { m: '👂 Cô đọc mẫu… ', k: '🎤 Hát cùng nhé! ' + (lan === 3 ? `(lượt ${Math.min(3, kar[lang] + 1)}/3 · ${guideTx(guide())}) ` : ''), v: '🔴 Đang thu giọng con… ' }[mode] + `Dòng ${Math.max(1, k)}/${n}`; if (st.textContent !== msg) st.textContent = msg; }
  }
  /* ---- nghe mẫu (cũng là nút 💡): cô đọc từng dòng (không nhạc), chữ sáng dần theo giọng; fast = nghe nhanh khi khởi động ---- */
  async function model(fast) { stop(); mode = 'm'; const me = ++RUN; ui(); hook();
    for (let i = 1; i < TL.length - 1; i++) { const seg = TL[i], txt = seg.l === 'zh' ? fill(seg.x.zh) : seg.tk.map(w => w.t).join(' ');
      const dur = 1.2 + (seg.l === 'zh' ? txt.length * .3 : txt.length * .075), t0 = performance.now(); let alive = true;
      const anim = () => { if (!alive || me !== RUN) return; draw(i * BAR + Math.min(3.6, (performance.now() - t0) / 1000 / dur * 3.6) * BEAT); raf = requestAnimationFrame(anim); }; anim();
      cap((seg.l === 'zh' ? '中文: ' : 'EN: ') + txt); await say(sayLine(seg)); alive = false; cancelAnimationFrame(raf); if (me !== RUN) return;
      draw(i * BAR + 3.95 * BEAT); await wait(fast ? 200 : 600); if (me !== RUN) return; }
    heard[lang] = true; mode = ''; ui(); if (!fast) cap('Giờ con hát karaoke cùng nhạc nhé!'); }
  async function start(m, keepAfter) {
    const aft = keepAfter ? after : null; stop(); after = aft; mode = m; const me = ++RUN; ui(); hook();
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); await ctx.resume(); } catch (e) { mode = ''; cap('Máy chưa phát được nhạc.'); return ui(); }
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    let chunks = []; const vol = guide();
    if (m === 'v') {
      try { micS = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch (e) { mode = ''; noRec = true; ui(); cap('Chưa mở được micro. Ba mẹ cho phép dùng micro rồi bấm Lồng tiếng lại nhé.'); return; }
      if (me !== RUN) return stop();
      const dest = ctx.createMediaStreamDestination(); master.connect(dest);
      const mic = ctx.createMediaStreamSource(micS), mg = ctx.createGain(); mg.gain.value = 1.6; mic.connect(mg); mg.connect(dest);
      const vs = C2().captureStream ? C2().captureStream(30) : null;
      const type = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
      if (!vs || !type) { mode = ''; noRec = true; ui(); cap('Trình duyệt này chưa thu được video. Con hát karaoke cũng được; ba mẹ thử Chrome hoặc Safari mới để lồng tiếng nhé.'); return; }
      const L0 = lang; rec = new MediaRecorder(new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]), { mimeType: type });
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { if (!chunks.length) return; ext[L0] = type.indexOf('mp4') >= 0 ? 'mp4' : 'webm'; url[L0] = URL.createObjectURL(new Blob(chunks, { type })); star(); mode = '';
        if (body.isConnected) ui(); cap(L0 === 'en' && !url.zh ? 'Con xem lại video, lưu về máy, rồi sang tiếng Trung nhé!' : 'Con xem lại video, rồi lưu về máy nhé!'); };
      rec.start(500);
    }
    const t0 = ctx.currentTime + .25; music(t0);
    let said = -1;
    const tick = () => { if (me !== RUN) return; const t = ctx.currentTime - t0;
      if (t >= DUR()) return end(m);
      draw(t); const bi = Math.floor(t / BAR);
      if (m === 'k' && bi !== said && t >= 0 && TL[bi] && TL[bi].k === 'line') { said = bi; BV.sayV(sayLine(TL[bi]), vol); }   // giọng mẫu khi hát karaoke (lồng tiếng thì không)
      raf = requestAnimationFrame(tick); };
    tick();
  }
  function end(m) { cancelAnimationFrame(raf); draw(DUR() - .01); VOICE.volume = 1;
    if (m === 'k') { kar[lang]++; if (kar[lang] === 1) star(); mode = ''; stopAudio(); const f = after; after = null; ui();
      if (f) return f();
      cap(okLang(lang) ? (allDone() ? 'Giỏi lắm! Con bấm Xong nhé.' : 'Giỏi lắm! Giờ mình sang tiếng Trung nhé.') : `Con đã hát ${kar[lang]} lần rồi!`); return; }
    stopAudio(); if (rec && rec.state !== 'inactive') rec.stop(); }
  function stopAudio() { try { master && master.disconnect(); } catch (e) {} master = null; if (micS) { micS.getTracks().forEach(t => t.stop()); micS = null; } }
  function stop() { cancelAnimationFrame(raf); stopAudio(); VOICE.volume = 1; if (rec && rec.state !== 'inactive') { rec.onstop = null; try { rec.stop(); } catch (e) {} } mode = ''; }
  X.replay = () => model();
  warm();
};
