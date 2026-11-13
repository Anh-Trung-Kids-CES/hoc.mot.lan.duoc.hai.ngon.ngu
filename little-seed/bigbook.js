/* =====================================================================
   BIG BOOK – bài tập mới (chị chốt 13/11/2026 chiều, claude/KeHoach_DungBigBook_1311.md)
   Một màn cho cả 4 lần: trái là big book (nghe / dừng, lật trang, đổi Anh – Trung), phải là cô Hươu hướng dẫn + 5 câu.
   Lần 1 bắt buộc nghe hết quyển (Anh rồi Trung) mới mở câu hỏi; lần 2–4 câu hỏi mở ngay, con tự chọn nghe lại sách.
   Không có phần khởi động. Gợi ý (💡, im 6 giây, sai lần 1): sách lật về đúng trang, viền sáng, nút ▶ nhấp nháy,
   cô Hươu nhắc nghe lại trang đó; sai lần 2: cô đọc trang và làm mẫu đáp án, câu gặp lại cuối bài.
   Sáu dạng (step.kind):
     an   – tìm chi tiết ẩn: nghe từ, chạm đúng người / vật trên tranh bên trái
     sai  – cô đọc sai, con sửa: Yes! / No!, nếu sai thì chọn từ đúng
     dien – nghe, chọn từ có sẵn điền chỗ trống
     vai  – lồng tiếng nhân vật: chọn vai, nói lời vai đó (thu âm), cuối bài trang ảnh của con; nghe lại truyện có giọng con
     dich – chuyển ngữ bằng tai: nghe câu một tiếng, chọn câu cùng nghĩa ở tiếng kia
     xep  – nghe rồi xếp thẻ thành câu (Seedling có thể nghe tiếng Anh, xếp câu tiếng Trung)
   Bước có step.v === 2 dùng màn này; bước cũ vẫn chạy bằng R.bb của bb-ve.js.
   ===================================================================== */
(function () {
  const OLD = R.bb;
  R.bb = (step, body) => step.v === 2 ? bbMoi(step, body) : OLD(step, body);

  const GUIDE = {
    an: 'Con nghe cô nói rồi chạm vào đúng người hoặc đồ vật trong tranh bên trái nhé.',
    sai: 'Cô đọc một trang. Cô đọc đúng thì con bấm Yes. Cô đọc sai thì con bấm No, rồi chọn từ đúng nhé.',
    dien: 'Con nghe câu, rồi chọn từ đúng điền vào chỗ trống nhé.',
    vai: 'Con chọn một bạn để đóng vai. Đến lời của bạn ấy, con nói thay bạn ấy nhé.',
    dich: 'Con nghe câu, rồi nghe các câu ở tiếng kia. Con chọn câu cùng nghĩa nhé.',
    xep: 'Con nghe câu, rồi chạm các thẻ theo đúng thứ tự để xếp lại câu nhé.'
  };
  const HEAD = { an: 'Tìm trong tranh', sai: 'Cô đọc đúng không?', dien: 'Điền chỗ trống', vai: 'Con đóng vai', dich: 'Con phiên dịch', xep: 'Xếp câu' };
  const V_HINT = 'Con nghe lại trang này rồi thử lại nhé!';
  const V_LOCK = 'Con nghe hết big book, tiếng Anh rồi tiếng Trung, thì câu hỏi mở ra nhé.';
  const V_PICK = 'Con chọn một bạn để đóng vai nhé!';
  const V_BACK = 'Con nghe lại truyện có giọng của con nhé!';

  function bbMoi(step, body) {
    const lan = step.lan || 1, kind = step.kind, P = step.pages, LANG = ['en', 'zh'];
    const FR = step.frame || BV.FRAME, PK = step.photo_k || BV.PHOTO, PT = step.photo_t || 'ảnh gia đình';
    let pass = 0, c = 0, autoId = -1, read = lan > 1, busy = false, glow = '', idleT = 0, tries = 0, hideTx = false;
    let Q = (step.qs || []).map(q => Object.assign({}, q)), qi = 0, role = null, recs = [], xs = null, saiStage = 0;
    const NQ = () => Q.length;
    const L2 = l => l === 'zh' ? 'zh' : 'en';
    const txt = (p, l) => l === 'zh' ? p.zh : p.en;
    const aud = (p, l) => l === 'zh' ? p.a_zh : p.a_en;
    const prog = () => dots(!read ? pass : 2 + Math.min(qi, NQ()), 2 + NQ());
    const clearIdle = () => { clearTimeout(idleT); idleT = 0; };
    const playing = () => autoId === RUN;

    body.innerHTML = `<div class="bb2 bbm lan${lan} k-${kind}"><section class="bb2-book" id="bbBook"></section><section class="bb2-q" id="bbQ"></section></div>`;
    const B = body.querySelector('#bbBook'), QP = body.querySelector('#bbQ');

    /* ---------------- sách bên trái ---------------- */
    const photoHTML = () => { const ph = BV.photo(PK); return ph ? `<img class="bb2-photo" src="${ph}" alt="" style="left:${FR.left}%;top:${FR.top}%;width:${FR.width}%;height:${FR.height}%">` : ''; };
    function drawBook(hl) { const p = P[c], l = LANG[pass]; prog();
      const q = Q[qi], tapOn = read && kind === 'an' && q && c === q.pg && !busy;
      const showTx = !(hideTx && q && c === q.pg);
      B.className = 'bb2-book ' + l;
      B.innerHTML = `<div class="bb2-h"><span class="ls-tag ${l}">${l === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh'}</span><b>${esc(l === 'zh' ? step.title_zh : step.title)}</b><span>${c + 1}/${P.length}</span></div>
        <div class="bb2-pg ${p.cover ? 'cover' : ''} ${glow} ${tapOn ? 'tap' : ''}" id="bPg"><img src="${esc(p.img)}" alt="" draggable="false">${p.cover ? photoHTML() + `<div class="bb2-ttl"><b class="${l === 'zh' ? 'zh' : ''}">${esc(txt(p, l))}</b></div>` : ''}</div>
        ${p.cover ? '' : `<div class="bb2-tx ${hl ? 'on' : ''}">${!showTx ? '<span class="bb2-who">👂 Con nghe nhé</span>' : l === 'zh' ? `<b class="zh">${esc(p.zh)}</b><span class="sx-pyl on">${esc(p.py || '')}</span>` : `<span class="en">${esc(p.en)}</span>`}</div>`}
        ${p.cover && (kind === 'vai' || BV.photo(PK)) ? `<div class="row bb2-phrow"><button class="ls-b" id="bPhoto">📷 ${BV.photo(PK) ? 'Đổi ' + PT : 'Ba mẹ chọn ' + PT}</button></div>` : ''}
        <div class="bb2-nav bbm-nav">
          <button class="ls-b" id="bPrev" ${c || pass ? '' : 'disabled'} aria-label="Trang trước">◀</button>
          ${playing() ? `<button class="ls-b dark" id="bStop">⏸ Dừng</button>` : `<button class="ls-b dark ${glow === 'glow' ? 'pulse' : ''}" id="bPlay">▶ Nghe</button>`}
          <button class="ls-b" id="bNext" aria-label="Trang sau">▶</button>
          <span class="bbm-lang"><button class="ls-b ${l === 'en' ? 'on' : ''}" id="bEn">EN</button><button class="ls-b ${l === 'zh' ? 'on' : ''}" id="bZh">中文</button></span>
        </div>`;
      const on = (id, f) => { const e = B.querySelector(id); if (e) e.onclick = f; };
      on('#bPrev', () => { stopAll(); glow = ''; if (c > 0) c--; else if (pass > 0) { pass--; c = P.length - 1; } drawBook(); line(); });
      on('#bNext', () => { stopAll(); glow = ''; turnPage(); });
      on('#bPlay', () => { sfx.pop(); glow = ''; reading(); });
      on('#bStop', () => { stopAll(); autoId = -1; drawBook(); });
      on('#bEn', () => { stopAll(); pass = 0; drawBook(); });
      on('#bZh', () => { if (!read && pass === 0) return toast('Con nghe hết lượt tiếng Anh trước nhé.'); stopAll(); pass = 1; drawBook(); });
      const ph = B.querySelector('#bPhoto'); if (ph) ph.onclick = () => BV.pickPhoto(() => drawBook(), PK);
      if (tapOn) B.querySelector('#bPg').onclick = ev => tapPic(ev); }
    function turnPage() {
      if (c < P.length - 1) { c++; drawBook(); line(); return; }
      if (pass === 0) { pass = 1; c = 0; sfx.ok(); drawBook(); line(); return; }
      if (!read) doneRead(); else { c = 0; drawBook(); } }
    async function line(l0) { const p = P[c], l = l0 || LANG[pass], me = RUN; drawBook(true);
      cap((l === 'zh' ? '中文: ' : 'EN: ') + txt(p, l)); await say(BV.u(l, txt(p, l), aud(p, l))); if (me === RUN) drawBook(); }
    async function reading() { stopAll(); const me = RUN; autoId = me; drawBook();   // nghe từ trang đang mở đến hết lượt; lần 1 đọc tiếp sang lượt Trung
      if (!read && c === 0 && pass === 0) { await hd('listen'); if (me !== RUN) return; }
      while (me === RUN) { await line(); if (me !== RUN) return; await wait(600); if (me !== RUN) return;
        if (c < P.length - 1) { c++; continue; }
        if (pass === 0 && !read) { pass = 1; c = 0; sfx.ok(); star(); cap('Giờ mình nghe bằng tiếng Trung nhé.'); await wait(900); continue; }
        autoId = -1; if (!read) return doneRead(); c = 0; drawBook(); return; } }
    function doneRead() { autoId = -1; c = 0; pass = 0; read = true; sfx.ok(); star(); drawBook(); qStart(); }

    /* ---------------- câu hỏi bên phải ---------------- */
    const coRow = q => { const cm = (step.cmd || {})[q ? q.l : 'en'];
      return `<div class="bb2-co">${step.co_img ? `<img src="${esc(step.co_img)}" alt="">` : ''}<div class="bb2-co-tx">${cm && q ? `<b class="${q.l === 'zh' ? 'zh' : ''}">${esc(cm.t)}</b>${q._tr ? `<small>${esc(cm.tr)}</small>` : ''}` : `<small>${esc(GUIDE[kind])}</small>`}</div>
        <button class="bb2-bulb" id="qGuide" type="button" aria-label="Nghe hướng dẫn">🔊</button><button class="bb2-bulb" id="qHint" type="button" aria-label="Gợi ý">💡</button></div>`; };
    const head = q => `<div class="bb2-qh"><b>${HEAD[kind]} · Câu ${Math.min(qi + 1, NQ())}/${NQ()}${q && q.again ? ' · gặp lại' : ''}</b><small>${q ? (q.l === 'zh' ? 'tiếng Trung' : 'tiếng Anh') : ''}</small></div>`;
    function wire() { const g = QP.querySelector('#qGuide'); if (g) g.onclick = () => { stopAll(); BV.vi(GUIDE[kind]); };
      const h = QP.querySelector('#qHint'); if (h) h.onclick = () => { sfx.pop(); hint(); }; }
    function drawLock() { prog(); QP.className = 'bb2-q lock';
      QP.innerHTML = `<div class="bb2-qh"><b>${HEAD[kind]}</b><small>${NQ()} câu</small></div>${coRow(null)}<div class="bb2-lock"><span>🔒</span><p>Con nghe hết big book (tiếng Anh rồi tiếng Trung) thì câu hỏi mở ra ở đây.</p></div>`; wire(); }
    function optHTML(o, k, l) { return `<button class="ls-opt ${o.img ? '' : 'bbm-txt'}" data-k="${k}">${o.img ? pic(o.img, '', '') : ''}<span class="sx-nm ${l === 'zh' ? 'zh' : ''}">${esc(l === 'zh' ? o.zh || o.t : o.en || o.t)}</span>${l === 'zh' && o.py ? `<small>${esc(o.py)}</small>` : ''}</button>`; }
    function drawQ() { prog(); const q = Q[qi]; QP.className = 'bb2-q open';
      if (!q) { QP.innerHTML = `<div class="ls-done"><b>Con làm hết rồi!</b></div>` + (kind === 'vai' && recs.length ? `<div class="row"><button class="ls-b dark" id="qBack">▶ Nghe lại truyện có giọng con</button></div>` : ''); const bk = QP.querySelector('#qBack'); if (bk) bk.onclick = () => playBack(); return; }
      const L = L2(q.l); let mid = '';
      if (kind === 'an') mid = `<button class="bb2-ask" id="qSay" type="button"><span class="${L === 'zh' ? 'zh' : ''}">🔊 ${esc(q.w)}${q.py ? `<small>${esc(q.py)}</small>` : ''}</span></button><p class="bbm-tip">👈 Con chạm vào tranh bên trái</p>`;
      if (kind === 'sai') mid = `<button class="bb2-ask" id="qSay" type="button"><span>🔊 Nghe cô đọc</span></button>` + (saiStage === 0
        ? `<div class="bbm-yn"><button class="ls-opt yes" data-k="y">✓ Yes!</button><button class="ls-opt no" data-k="n">✗ No!</button></div>`
        : `<p class="bbm-tip">Từ đúng là gì?</p><div class="ls-opts bb2-opts" style="--n:${q.opts.length}">${q.opts.map((o, k) => optHTML(o, k, L)).join('')}</div>`);
      if (kind === 'dien') mid = `<button class="bb2-ask" id="qSay" type="button"><span class="${L === 'zh' ? 'zh' : ''}">🔊 ${esc(q.fr).replace('___', '<i class="bb2-blank" id="qBlank">___</i>')}</span></button>
        <div class="ls-opts bb2-opts" style="--n:${q.opts.length}">${q.opts.map((o, k) => optHTML(o, k, L)).join('')}</div>`;
      if (kind === 'dich') mid = `<button class="bb2-ask" id="qSay" type="button"><span class="${q.src === 'zh' ? 'zh' : ''}">🔊 ${esc(q.s)}${q.src === 'zh' && q.s_py ? `<small>${esc(q.s_py)}</small>` : ''}</span></button><p class="bbm-tip">${L === 'zh' ? 'Câu tiếng Trung nào cùng nghĩa?' : 'Câu tiếng Anh nào cùng nghĩa?'}</p>
        <div class="bbm-sent">${q.opts.map((o, k) => `<button class="ls-opt" data-k="${k}"><span class="${L === 'zh' ? 'zh' : ''}">🔊 ${esc(o.t)}</span>${o.py ? `<small>${esc(o.py)}</small>` : ''}</button>`).join('')}</div>`;
      if (kind === 'xep') { if (!xs) xs = { got: 0, order: shuffle(q.tiles.map((_, i) => i)) };
        mid = `<button class="bb2-ask" id="qSay" type="button"><span>🔊 Nghe câu</span></button>
        <div class="bbm-slots ${L}">${q.tiles.map((t, i) => `<span class="bbm-slot ${i < xs.got ? 'fill' : ''}">${i < xs.got ? esc(t.t) : ''}</span>`).join('')}</div>
        <div class="bbm-tiles">${xs.order.map(i => `<button class="ls-opt bbm-tile ${i < xs.got ? 'used' : ''} ${L}" data-k="${i}" ${i < xs.got ? 'disabled' : ''}><span class="${L === 'zh' ? 'zh' : ''}">${esc(q.tiles[i].t)}</span>${q.tiles[i].py ? `<small>${esc(q.tiles[i].py)}</small>` : ''}</button>`).join('')}</div>`; }
      if (kind === 'vai') mid = q.mine
        ? `<div class="bb2-mine"><button class="bb2-ask" id="qSay" type="button"><span class="${L === 'zh' ? 'zh' : ''}">🔊 ${esc(q.q)}</span></button><div class="bb2-half ${L}">${esc(q.half).replace('…', '<i>___</i>')}</div><div class="ls-mic idle" id="qMic"><span class="ls-lv"></span>${SVG.mic}<b></b></div></div>`
        : `<div class="bb2-mine"><p class="bbm-tip">🎭 Con là <b>${esc(role.label)}</b></p><div class="bb2-half ${L}">${esc(q.t)}${L === 'zh' && q.py ? `<small>${esc(q.py)}</small>` : ''}</div><div class="ls-mic idle" id="qMic"><span class="ls-lv"></span>${SVG.mic}<b></b></div></div>`;
      QP.innerHTML = head(q) + coRow(q) + mid + `<div class="bb2-ans" id="qAns"></div>` + (kind === 'vai' ? `<div class="row"><button class="ls-b" id="qSkip">Bỏ qua ▶</button></div>` : '');
      wire();
      const s = QP.querySelector('#qSay'); if (s) s.onclick = () => { stopAll(); askAudio(q); };
      const sk = QP.querySelector('#qSkip'); if (sk) sk.onclick = () => { stopAll(); next(); };
      QP.querySelectorAll('.ls-opt').forEach(b => b.onclick = () => pick(b)); }
    function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      if (a.length > 1 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1], a[0]]; return a; }
    async function cmdAudio(q, me) { const cm = (step.cmd || {})[q.l]; if (!cm) return;
      cap((q.l === 'zh' ? '中文: ' : 'EN: ') + cm.t); await say(BV.u(q.l, cm.t, cm.a)); if (me !== RUN || !q._tr) return; await wait(250); await BV.vi(cm.tr); }
    const ansU = q => BV.u(q.l, q.say, q.a_say);
    async function askAudio(q) { const me = RUN;
      if (kind === 'an') { await cmdAudio(q, me); if (me !== RUN) return; await wait(250); cap((q.l === 'zh' ? '中文: ' : 'EN: ') + q.w); return say(BV.u(q.l, q.w, q.a_w)); }
      if (kind === 'sai') { if (saiStage === 0) { c = q.pg; pass = q.l === 'zh' ? 1 : 0; drawBook(true); cap('…'); await say(BV.u(q.l, q.read, q.a_read)); if (me !== RUN) return; drawBook(); await wait(250); return cmdAudio(q, me); }
        return say(BV.u(q.l, q.read, q.a_read)); }
      if (kind === 'dien') { await cmdAudio(q, me); if (me !== RUN) return; await wait(250); return say(ansU(q)); }
      if (kind === 'dich') { await cmdAudio(q, me); if (me !== RUN) return; await wait(250); cap((q.src === 'zh' ? '中文: ' : 'EN: ') + q.s); await say(BV.u(q.src, q.s, q.a_s)); if (me !== RUN) return; await wait(400);
        const bs = QP.querySelectorAll('.bbm-sent .ls-opt');   // các câu lựa chọn sáng lần lượt, cô đọc
        for (let k = 0; k < q.opts.length; k++) { if (me !== RUN) return; const b = bs[k]; b && b.classList.add('lit'); await say(BV.u(q.l, q.opts[k].t, q.opts[k].a)); if (me !== RUN) return; await wait(350); b && b.classList.remove('lit'); } return; }
      if (kind === 'xep') { await cmdAudio(q, me); if (me !== RUN) return; await wait(250); return say(BV.u(q.src || q.l, q.src_t || q.say, q.src_a || q.a_say)); }
      if (kind === 'vai') { if (q.mine) { if (q.q) { await say(BV.u(q.l, q.q, q.a_q)); if (me !== RUN) return; await wait(250); } return say(BV.u(q.l, q.cue, q.a_cue)); }
        return cmdAudio(q, me); } }

    async function qStart() { const me = ++RUN; clearIdle(); qi = 0;
      if (kind === 'vai') return pickRole();
      drawQ(); await BV.vi(GUIDE[kind]); if (me !== RUN) return; ask(); }
    async function ask() { const q = Q[qi]; if (!q) return; const me = ++RUN; tries = 0; clearIdle(); glow = ''; busy = false; saiStage = 0; xs = null; q._tr = qi < 2 && !q.again;
      hideTx = ['sai', 'dien', 'xep', 'dich'].includes(kind);
      c = q.pg != null ? q.pg : 0; pass = (kind === 'dich' ? q.src : q.l) === 'zh' ? 1 : 0; drawBook(); drawQ();
      X.replay = () => { stopAll(); askAudio(q); };
      if (kind === 'vai') return vaiTurn(q, me);
      await askAudio(q); if (me !== RUN) return;
      idleT = setTimeout(() => { if (me === RUN && !busy && Q[qi] === q && !glow) hint(true); }, 6000); }   // con im khoảng 6 giây: gợi ý tự hiện
    async function hint(auto) { const q = Q[qi]; if (!q || busy) return; clearIdle(); stopAll(); const me = RUN;
      c = q.pg != null ? q.pg : 0; pass = q.l === 'zh' ? 1 : 0; glow = 'glow'; drawBook();
      const h = QP.querySelector('#qHint'); h && h.classList.add('on');
      await BV.vi(V_HINT); if (me !== RUN) return;
      if (kind === 'sai') hideTx = true; }
    async function right(b, me, q) { sfx.ok(); if (b) { b.classList.add('right'); pop(b); } if (!q.again) star();
      QP.querySelector('#qAns').innerHTML = `<span class="${q.l === 'zh' ? 'zh' : ''}">✓ ${esc(q.say)}</span>`; cap((q.l === 'zh' ? '中文: ' : 'EN: ') + q.say);
      hideTx = false; c = q.pg; pass = q.l === 'zh' ? 1 : 0; glow = ''; drawBook(true);
      await say(ansU(q)); if (me !== RUN) return false; await wait(500); return true; }
    async function wrong(b, me, q) { tries++; sfx.no(); if (b) { shake(b); if (kind !== 'xep') { b.disabled = true; b.classList.add('off'); } }
      if (tries === 1) { QP.querySelector('#qAns').innerHTML = '<span class="no">Gần đúng rồi! Con nghe lại trang này nhé.</span>'; busy = false; hint(); return false; }
      // sai lần 2: cô đọc trang và làm mẫu đáp án, câu này gặp lại ở cuối bài
      hideTx = false; c = q.pg; pass = q.l === 'zh' ? 1 : 0; glow = 'glow'; drawBook(true);
      if (kind === 'dien' || kind === 'dich' || (kind === 'sai' && saiStage === 1)) { const rb = QP.querySelectorAll('.ls-opt')[q.ans]; rb && rb.classList.add('model'); }
      if (kind === 'xep') { xs.got = q.tiles.length; drawQ(); }
      const bl = QP.querySelector('#qBlank'); if (bl && q.opts) { bl.textContent = q.l === 'zh' ? q.opts[q.ans].zh || q.opts[q.ans].t : q.opts[q.ans].en || q.opts[q.ans].t; bl.classList.add('fill'); }
      if (!q.again) Q.push(Object.assign({}, q, { again: true }));
      QP.querySelector('#qAns').innerHTML = `<span>👩‍🏫 ${esc(q.say)}</span><span class="no">${q.again ? '' : 'Lát nữa mình gặp lại câu này nhé.'}</span>`;
      await hd('ans'); if (me !== RUN) return false; await say(ansU(q)); if (me !== RUN) return false; await wait(900); return true; }
    function next() { busy = false; glow = ''; hideTx = false; qi++; if (qi >= Q.length) { drawQ(); drawBook(); return wait(400).then(() => finish()); } ask(); }

    async function pick(b) { if (busy) return; const q = Q[qi]; if (!q) return; busy = true; clearIdle(); stopAll(); const me = RUN, k = b.dataset.k;
      let go = false;
      if (kind === 'sai' && saiStage === 0) {
        const ok = (k === 'n') === !!q.wrong;
        if (ok && q.wrong) { sfx.ok(); pop(b); saiStage = 1; busy = false; drawQ(); await BV.vi('Đúng rồi, cô đọc sai! Từ đúng là gì?'); if (me !== RUN) return; return say(BV.u(q.l, q.read, q.a_read)); }
        go = ok ? await right(b, me, q) : await wrong(b, me, q); }
      else if (kind === 'xep') {
        const i = +k; if (i === xs.got) { sfx.pop(); xs.got++; busy = false; await say(BV.u(q.l, q.tiles[i].t, q.tiles[i].a)); if (me !== RUN) return; drawQ();
          if (xs.got < q.tiles.length) return; busy = true; go = await right(null, me, q); }
        else { say(BV.u(q.l, q.tiles[i].t, q.tiles[i].a)); go = await wrong(b, me, q); } }
      else { const ok = +k === q.ans;
        if (ok) { const bl = QP.querySelector('#qBlank'); if (bl) { bl.textContent = q.l === 'zh' ? q.opts[q.ans].zh || q.opts[q.ans].t : q.opts[q.ans].en || q.opts[q.ans].t; bl.classList.add('fill'); } }
        go = ok ? await right(b, me, q) : await wrong(b, me, q); }
      if (go && me === RUN) next(); else busy = false; }

    function tapPic(ev) { const q = Q[qi]; if (!q || busy || kind !== 'an') return; clearIdle(); stopAll();
      const r = ev.currentTarget.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100, [bx, by, bw, bh] = q.box;
      const mark = document.createElement('span'); mark.className = 'bbm-mark'; mark.style.left = x + '%'; mark.style.top = y + '%';
      const inBox = x >= bx - 3 && x <= bx + bw + 3 && y >= by - 3 && y <= by + bh + 3;
      busy = true; const me = RUN;
      (async () => { let go;
        if (inBox) { glow = ''; drawBook(); const pg = B.querySelector('#bPg'); const ring = document.createElement('span'); ring.className = 'bbm-ring';
          Object.assign(ring.style, { left: bx + '%', top: by + '%', width: bw + '%', height: bh + '%' }); pg && pg.appendChild(ring); go = await right(null, me, q); }
        else { mark.textContent = '✗'; ev.currentTarget.appendChild(mark); go = await wrong(null, me, q);
          if (!go && me === RUN) return; if (go) { const pg = B.querySelector('#bPg'); const ring = document.createElement('span'); ring.className = 'bbm-ring model'; Object.assign(ring.style, { left: bx + '%', top: by + '%', width: bw + '%', height: bh + '%' }); pg && pg.appendChild(ring); await wait(600); } }
        if (go && me === RUN) next(); else busy = false; })(); }

    /* ---------------- lồng tiếng nhân vật ---------------- */
    async function pickRole() { const me = RUN; QP.className = 'bb2-q open';
      QP.innerHTML = `<div class="bb2-qh"><b>${HEAD.vai}</b></div>${coRow(null)}<p class="bbm-tip">Con muốn làm ai?</p><div class="ls-opts bb2-opts" style="--n:${step.roles.length}">${step.roles.map((r, k) =>
        `<button class="ls-opt bbm-role" data-k="${k}">${pic(r.img, '🎭', '')}<span class="sx-nm">${esc(r.label)}</span></button>`).join('')}</div>`;
      wire(); QP.querySelectorAll('.bbm-role').forEach(b => b.onclick = () => { stopAll(); sfx.ok(); role = step.roles[+b.dataset.k];
        Q = role.turns.map(q => Object.assign({}, q)).concat((step.mine || []).map(m => Object.assign({ mine: true, pg: 0 }, m))); qi = 0; recs = []; ask(); });
      await BV.vi(GUIDE.vai); if (me !== RUN) return; await BV.vi(V_PICK); }
    async function micOnce(mic, my) {
      if (!mic) return { how: 'gone' }; const lbl = mic.querySelector('b'), lv = mic.querySelector('.ls-lv');
      mic.className = 'ls-mic rec'; cap('🔴 Đang thu… con nói đi!'); if (lbl) lbl.textContent = '';
      const r = await recTake({ maxMs: 6000, onLevel: v => { if (lv) lv.style.setProperty('--lv', (.25 + v * .9).toFixed(2)); } });
      if (my !== RUN) return { how: 'gone' };
      if (!r) { mic.className = 'ls-mic on'; cap('Con nói nhé!'); for (let k = 3; k >= 1; k--) { if (my !== RUN) return { how: 'gone' }; if (lbl) lbl.textContent = k; await wait(1000); } return { how: 'count' }; }
      if (!r.spoke) { mic.className = 'ls-mic on'; if (lbl) lbl.textContent = ''; cap('Cô chưa nghe thấy con nói'); return { how: 'quiet' }; }
      mic.className = 'ls-mic ok'; if (lbl) lbl.textContent = '✓'; sfx.ok(); if (typeof jRec === 'function') jRec(); return { how: 'rec', url: r.url }; }
    async function vaiTurn(q, me) { const mic = () => QP.querySelector('#qMic');
      if (q.mine) { c = 0; pass = 0; drawBook(); if (!q._said) { q._said = 1; await BV.vi(step.mine_vi || 'Giờ con nói về con nhé! Con nhìn ảnh rồi nói.'); if (me !== RUN) return; } }
      else { // nghe trang ngay trước (lời người khác) để có ngữ cảnh, rồi đến lượt con
        if (q.ctx != null) { c = q.ctx; pass = q.l === 'zh' ? 1 : 0; await line(); if (me !== RUN) return; await wait(300); }
        c = q.pg; pass = q.l === 'zh' ? 1 : 0; glow = 'glow'; drawBook(true); }
      await askAudio(q); if (me !== RUN) return;
      let r = await micOnce(mic(), me); if (r.how === 'gone') return;
      if (r.how === 'quiet') {   // im lặng: trang đó tự phát giọng mẫu một lần rồi mic mở lại
        await BV.vi(q.mine ? 'Con nghe ví dụ nhé.' : 'Con nghe cô đọc mẫu rồi nói nhé.'); if (me !== RUN) return;
        await say(q.mine ? BV.u(q.l, q.vd, q.a_vd) : ansU(q)); if (me !== RUN) return; r = await micOnce(mic(), me); if (r.how === 'gone') return;
        if (r.how === 'quiet') { await hd('quiet2'); if (me !== RUN) return; } }
      if (r.how === 'rec') { star(); recs.push({ q, url: r.url }); cap('🎧 Con nghe lại giọng của con nhé'); await playFile(r.url); if (me !== RUN) return; }
      glow = ''; await wait(400); if (me !== RUN) return; next(); }
    async function playBack() { stopAll(); const me = RUN; await BV.vi(V_BACK); if (me !== RUN) return;
      for (const { q, url } of recs) { if (me !== RUN) return; if (q.ctx != null) { c = q.ctx; pass = q.l === 'zh' ? 1 : 0; await line(); if (me !== RUN) return; await wait(250); }
        c = q.pg || 0; pass = q.l === 'zh' ? 1 : 0; glow = 'glow'; drawBook(true); await playFile(url); if (me !== RUN) return; glow = ''; await wait(400); }
      drawBook(); }

    /* ---------------- bắt đầu ---------------- */
    X.replay = () => { stopAll(); line(); };
    drawBook();
    if (lan === 1) { drawLock(); (async () => { const me = RUN; await BV.vi(V_LOCK); if (me === RUN) reading(); })(); }
    else qStart();
  }
})();
