/* =====================================================================
   BIG BOOK hai cột + VÈ karaoke (thiết kế chị chốt 12/11/2026) – dùng chung cho web Little Seed và Seedling.
   - type "bb":  trái đọc cả quyển big book từng trang (tiếng Anh rồi tiếng Trung); nghe hết thì bên phải mở
                 câu hỏi đọc hiểu (nghe câu hỏi, chạm tranh). Sai không chặn: làm câu khác, cuối bài gặp lại.
   - type "vek": vè dạng video (tranh + lời sáng theo nhịp + nhạc máy). Con hát karaoke bao nhiêu lần cũng được,
                 rồi "Lồng tiếng": video chạy không có giọng mẫu, máy thu giọng con trộn với nhạc thành video,
                 con xem lại và lưu về máy để ba mẹ gửi cô qua Zalo.
   Cần các hàm chung của ls-app.js / seedling-app.js (R, T, say, en, zh, finish, star, dots, cap, stopAll, RUN…).
   ===================================================================== */
T.bb = { n: 'Big book', ic: 'cx_o_story', sub: 'Nghe cả quyển rồi trả lời câu hỏi',
  rules: ['Bên trái: cô đọc cả quyển big book bằng tiếng Anh, rồi đọc lại cả quyển bằng tiếng Trung.', 'Nghe hết quyển thì bên phải mở câu hỏi: con nghe câu hỏi và chạm đúng tranh.', 'Chưa đúng cũng không sao: mình làm câu khác, lát nữa gặp lại.'] };
T.vek = { n: 'Vè', ic: 'cx_o_video', sub: 'Nghe mẫu, hát karaoke rồi lồng tiếng',
  rules: ['Tiếng Anh trước, tiếng Trung sau. Con nghe cô đọc mẫu từng dòng.', 'Rồi con hát karaoke cùng nhạc: chữ sáng đến đâu, con hát đến đó. Hát bao nhiêu lần cũng được.', 'Khi đã thuộc, con bấm "Lồng tiếng" để thu giọng con thành video, lưu về máy gửi cô.'] };

/* ---------- BIG BOOK hai cột ---------- */
R.bb = (step, body) => {
  // Lượt 1: đọc cả quyển bằng tiếng Anh. Lượt 2: đọc cả quyển bằng tiếng Trung (chị chốt 12/11: không trộn hai tiếng trong một trang).
  const P = step.pages, LANG = ['en', 'zh']; let pass = 0, c = 0, autoId = -1, read = false, busy = false;
  let Q = step.qs.map(q => Object.assign({}, q)); let qi = 0; const back = new Set();
  body.innerHTML = `<div class="bb2"><section class="bb2-book" id="bbBook"></section><section class="bb2-q" id="bbQ"></section></div>`;
  const B = body.querySelector('#bbBook'), QP = body.querySelector('#bbQ');
  const playing = () => autoId === RUN;
  const prog = () => dots(read ? 2 + Math.min(qi, Q.length) : pass, 2 + step.qs.length);
  function drawBook(hl) { const p = P[c], l = LANG[pass]; prog();
    B.className = 'bb2-book ' + l;
    B.innerHTML = `<div class="bb2-h"><span class="ls-tag ${l}">${read ? 'Đọc lại' : 'Lượt ' + (pass + 1)} · ${l === 'zh' ? 'tiếng Trung' : 'tiếng Anh'}</span><b>${esc(l === 'zh' ? step.title_zh : step.title)}</b><span>${c + 1}/${P.length}</span></div>
      <div class="bb2-pg ${p.cover ? 'cover' : ''}"><img src="${esc(p.img)}" alt="">${p.cover ? `<div class="bb2-ttl"><b class="${l === 'zh' ? 'zh' : ''}">${esc(l === 'zh' ? p.zh : p.en)}</b></div>` : ''}</div>
      ${p.cover ? '' : `<div class="bb2-tx ${hl ? 'on' : ''}">${l === 'zh' ? `<b class="zh">${esc(p.zh)}</b><span class="sx-pyl on">${esc(p.py)}</span>` : `<span class="en">${esc(p.en)}</span>`}</div>`}
      <div class="bb2-nav"><button class="ls-b" id="bPrev" ${c || pass ? '' : 'disabled'} aria-label="Trang trước">◀</button>
        ${playing() ? '<span class="bb2-auto">🔊 Cô đang đọc…</span>' : '<button class="ls-b dark" id="bPlay">▶ Đọc tiếp</button>'}
        <button class="ls-b" id="bNext" aria-label="Trang sau">▶</button></div>`;
    B.querySelector('#bPrev').onclick = () => { stopAll(); if (c > 0) c--; else if (pass > 0) { pass--; c = P.length - 1; } drawBook(); line(); };
    B.querySelector('#bNext').onclick = () => { stopAll(); step1(); };
    const pl = B.querySelector('#bPlay'); if (pl) pl.onclick = () => { sfx.pop(); auto(); }; }
  function step1() {   // sang trang sau; hết lượt Anh thì sang lượt Trung; hết lượt Trung thì mở câu hỏi
    if (c < P.length - 1) { c++; drawBook(); line(); return false; }
    if (pass === 0) { pass = 1; c = 0; sfx.ok(); if (!read) star(); drawBook(); line(); return false; }
    doneRead(); return true; }
  async function line() { const p = P[c], l = LANG[pass], me = RUN; drawBook(true);
    cap((l === 'zh' ? '中文: ' + p.zh : 'EN: ' + p.en)); await say(l === 'zh' ? zh(p.zh, p.a_zh) : en(p.en, p.a_en)); if (me === RUN) drawBook(); }
  async function auto() { stopAll(); const me = RUN; autoId = me;
    VK_STOP.add(() => setTimeout(() => { if (body.isConnected) drawBook(); }, 0));   // bấm Dừng ở dưới: hiện lại nút Đọc tiếp
    if (c === 0 && pass === 0 && !read) { await hd('listen'); if (me !== RUN) return; }
    while (me === RUN) { await line(); if (me !== RUN) return; await wait(700); if (me !== RUN) return;
      if (c === P.length - 1 && pass === 1) { autoId = -1; return doneRead(); }
      if (c === P.length - 1) { pass = 1; c = 0; sfx.ok(); if (!read) star(); cap('Giờ mình nghe bằng tiếng Trung nhé.'); await wait(900); if (me !== RUN) return; continue; }
      c++; } }
  function doneRead() { autoId = -1; c = 0; pass = 0; drawBook(); if (read) return; read = true; sfx.ok(); star(); cap('Nghe xong rồi! Giờ con trả lời câu hỏi bên phải nhé.'); drawQ(); ask(); }
  function drawQ() { prog();
    if (!read) { QP.className = 'bb2-q lock';
      QP.innerHTML = `<div class="bb2-qh"><b>Câu hỏi</b><small>${step.qs.length} câu</small></div><div class="bb2-lock"><span>🔒</span><p>Con nghe hết big book (tiếng Anh rồi tiếng Trung) thì câu hỏi mở ra ở đây.</p></div>
        <ol class="bb2-list">${step.qs.map((q, k) => `<li><img src="${esc(q.img)}" alt=""><span>Câu ${k + 1}</span></li>`).join('')}</ol>`; return; }
    QP.className = 'bb2-q open';
    if (qi >= Q.length) { QP.innerHTML = `<div class="ls-done"><b>Con trả lời hết rồi!</b></div>`; return; }
    const q = Q[qi];
    QP.innerHTML = `<div class="bb2-qh"><b>Câu ${Math.min(qi + 1, Q.length)}/${Q.length}${q.again ? ' · gặp lại' : ''}</b><small>${q.l === 'zh' ? 'nghe tiếng Trung' : 'nghe tiếng Anh'}</small></div>
      <button class="bb2-ask" id="qSay" type="button"><img src="${esc(q.img)}" alt=""><span class="${q.l === 'zh' ? 'zh' : ''}">🔊 ${esc(q.q)}${q.py ? `<small>${esc(q.py)}</small>` : ''}</span></button>
      <div class="ls-opts bb2-opts" style="--n:${q.opts.length}">${q.opts.map((o, k) => `<button class="ls-opt" data-k="${k}">${pic(o.img, '', '')}<span class="sx-nm ${q.l === 'zh' ? 'zh' : ''}">${esc(q.l === 'zh' ? o.zh : o.en)}</span></button>`).join('')}</div>
      <div class="bb2-ans" id="qAns"></div>`;
    QP.querySelector('#qSay').onclick = () => { stopAll(); say(q.l === 'zh' ? zh(q.q, q.a_q) : en(q.q, q.a_q)); };
    QP.querySelectorAll('.ls-opt').forEach(b => b.onclick = () => pick(b)); }
  async function ask() { const q = Q[qi]; if (!q) return; ++RUN; drawQ(); X.replay = () => { stopAll(); say(q.l === 'zh' ? zh(q.q, q.a_q) : en(q.q, q.a_q)); };
    cap((q.l === 'zh' ? '中文: ' : 'EN: ') + q.q); await say(q.l === 'zh' ? zh(q.q, q.a_q) : en(q.q, q.a_q)); }
  async function pick(b) { if (busy) return; busy = true; stopAll(); const q = Q[qi], me = RUN, ok = +b.dataset.k === q.ans;
    if (ok) { sfx.ok(); b.classList.add('right'); pop(b); if (!q.again) star();
      QP.querySelector('#qAns').innerHTML = `<span class="${q.l === 'zh' ? 'zh' : ''}">✓ ${esc(q.say)}</span>`; cap((q.l === 'zh' ? '中文: ' : 'EN: ') + q.say);
      await say(q.l === 'zh' ? zh(q.say, q.a_say) : en(q.say, q.a_say)); if (me !== RUN) { busy = false; return; } await wait(500); }
    else { sfx.no(); shake(b); if (!back.has(qi) && !q.again) { back.add(qi); Q.push(Object.assign({}, q, { again: true })); }
      QP.querySelector('#qAns').innerHTML = '<span class="no">Chưa đúng! Mình làm câu khác, lát nữa gặp lại câu này nhé.</span>'; await wait(1300); }
    busy = false; qi++; if (qi >= Q.length) { drawQ(); await wait(400); return finish(); } ask(); }
  X.replay = () => { stopAll(); line(); };
  drawQ(); drawBook(); auto();
};

/* ---------- VÈ karaoke + lồng tiếng ---------- */
function vkTok(raw) {   // chữ hoa trong nguồn = phách mạnh; trên màn hình viết thường như câu bình thường
  const nm = (typeof P !== 'undefined' && P.name) ? P.name : '';
  let s = (raw || '').replace(/(\w)-(\w)/g, '$1$2'); s = nm ? s.replace(/___/g, nm) : s.replace(/,? ?___,? ?/g, ' ').trim();
  const out = []; let first = true;
  for (const tok of s.split(/\s+/)) { if (!tok) continue;
    const core = tok.replace(/[^\p{L}']/gu, ''), up = [...core].filter(ch => ch !== ch.toLowerCase()).length, strong = up >= 2;
    let t = tok; if (strong) { t = tok.toLowerCase(); if (first || core.toLowerCase() === 'i') t = t.replace(/\p{L}/u, m => m.toUpperCase()); }
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

/* Dừng, Làm lại, rời bước đều gọi stopAll(): tắt luôn nhạc máy và micro của vè */
const VK_STOP = new Set();
stopAll = (function (orig) { return function () { const f = [...VK_STOP]; VK_STOP.clear(); f.forEach(g => { try { g(); } catch (e) {} }); return orig.apply(this, arguments); }; })(stopAll);
R.vek = (step, body) => {
  // Mỗi tiếng một video riêng (chị chốt 12/11): tiếng Anh trước, tiếng Trung sau; trong video không có chữ tiếng Việt.
  // Mỗi tiếng: 1) Nghe mẫu – cô đọc từng dòng, chữ sáng theo; 2) Hát karaoke với nhạc (bao nhiêu lần cũng được); 3) Lồng tiếng, lưu video.
  const BPM = step.bpm || 92, BEAT = 60 / BPM, BAR = 4 * BEAT, W = 960, H = 540;
  const nm = (typeof P !== 'undefined' && P.name) ? P.name : '';
  const fill = s => nm ? (s || '').replace(/___/g, nm) : (s || '').replace(/___[，,]?\s*/g, '').replace(/\s+([!?！？])/g, '$1').trim();
  const TTL = { en: step.title || '', zh: step.title_zh || '' };
  const mk = l => [{ k: 'count', l }].concat(step.lines.map(x => ({ k: 'line', l, x, tk: l === 'zh' ? vkZh(fill(x.zh)) : vkTok(x.raw || x.en) })), [{ k: 'end', l }]);
  const TLS = { en: mk('en'), zh: mk('zh') };
  const IM = {}; step.lines.forEach(x => { if (x.img && !IM[x.img]) { const im = new Image(); im.src = x.img; IM[x.img] = im; } });
  let lang = 'en', TL = TLS.en, mode = '', ctx = null, master = null, raf = 0, micS = null, rec = null;
  const kar = { en: 0, zh: 0 }, heard = { en: false, zh: false }, url = { en: '', zh: '' }, ext = { en: 'webm', zh: 'webm' };
  const DUR = () => TL.length * BAR;
  const C2 = () => body.querySelector('#vkCv');
  const sayLine = seg => seg.l === 'zh' ? zh(fill(seg.x.zh), seg.x.a_zh) : en(seg.tk.map(w => w.t).join(' '), seg.x.a_en);
  const hook = () => VK_STOP.add(() => { const was = mode; stop(); if (was && body.isConnected) ui(); });

  function ui() { const L = lang === 'zh';
    dots((heard.en ? 1 : 0) + (kar.en ? 1 : 0) + (heard.zh ? 1 : 0) + (kar.zh ? 1 : 0), 4);
    body.innerHTML = `<div class="vk">
      <div class="vk-tabs"><button class="vk-tab en ${!L ? 'on' : ''}" data-l="en" ${mode ? 'disabled' : ''}>1 · English ${kar.en ? '✓' : ''}</button>
        <button class="vk-tab zh ${L ? 'on' : ''}" data-l="zh" ${mode || !kar.en ? 'disabled' : ''}>2 · 中文 ${kar.zh ? '✓' : ''}</button></div>
      <div class="vk-stage ${lang}"><canvas id="vkCv" width="${W}" height="${H}"></canvas>${url[lang] || mode ? '' : `<div class="vk-cover" id="vkCover"><b>▶</b></div>`}</div>
      <div class="vk-st" id="vkSt">${mode === 'm' ? '👂 Con nghe cô đọc mẫu…' : mode === 'k' ? '🎤 Đang hát karaoke…' : mode === 'v' ? '🔴 Đang thu giọng con…' : kar[lang] ? `Con đã hát ${kar[lang]} lần.` : heard[lang] ? 'Giờ con hát karaoke cùng nhạc nhé!' : 'Con nghe mẫu trước nhé.'}</div>
      ${url[lang] ? `<div class="vk-out"><video src="${url[lang]}" controls playsinline></video><div class="row"><a class="btn g" id="vkSave" href="${url[lang]}" download="ve-${lang === 'zh' ? 'tieng-trung' : 'tieng-anh'}-${(nm || 'cua-con').replace(/\s+/g, '-')}.${ext[lang]}">💾 Lưu video về máy</a><button class="ls-b" id="vkRe">🎬 Thu lại</button></div>
        <small>Ba mẹ lưu video rồi gửi vào nhóm Zalo của lớp cho cô nhé.</small></div>` : ''}
      <div class="row vk-ctl"><button class="btn" id="vkM" ${mode ? 'disabled' : ''}>👂 Nghe mẫu</button>
        <button class="btn y" id="vkK" ${mode ? 'disabled' : ''}>🎤 Hát karaoke${kar[lang] ? ` (lần ${kar[lang] + 1})` : ''}</button>
        <button class="btn" id="vkV" ${mode || !kar[lang] ? 'disabled' : ''}>🎬 Lồng tiếng</button>
        ${!L && kar.en && !mode ? '<button class="btn g" id="did">Sang tiếng Trung →</button>' : ''}
        ${kar.en && kar.zh && !mode ? '<button class="btn g" id="nx">Xong ⭐</button>' : ''}</div>
      ${kar[lang] && !url[lang] && !mode ? '<small class="vk-tip">Lồng tiếng: nên đeo tai nghe để video chỉ có nhạc và giọng con.</small>' : ''}</div>`;
    const on = (id, f) => { const e = body.querySelector(id); if (e) e.onclick = f; };
    on('#vkM', () => { sfx.pop(); model(); }); on('#vkK', () => { sfx.pop(); start('k'); }); on('#vkV', () => { sfx.pop(); start('v'); }); on('#vkCover', () => { sfx.pop(); start('k'); });
    on('#did', () => { sfx.pop(); setLang('zh'); }); on('#nx', () => { stop(); sfx.ok(); finish(); });
    on('#vkRe', () => { URL.revokeObjectURL(url[lang]); url[lang] = ''; start('v'); });
    body.querySelectorAll('.vk-tab').forEach(b => b.onclick = () => { if (b.dataset.l !== lang) setLang(b.dataset.l); });
    draw(-1); }
  function setLang(l) { stop(); lang = l; TL = TLS[l]; ui(); if (!heard[l]) intro(); }
  async function intro() { await model(); if (mode === '' && heard[lang] && !kar[lang] && body.isConnected) start('k'); }   // lần đầu: nghe mẫu rồi tự vào karaoke

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
      const msg = { m: '👂 Cô đọc mẫu… ', k: '🎤 Hát cùng nhé! ', v: '🔴 Đang thu giọng con… ' }[mode] + `Dòng ${Math.max(1, k)}/${n}`; if (st.textContent !== msg) st.textContent = msg; }
  }
  /* ---- nghe mẫu: cô đọc từng dòng (không nhạc), chữ sáng dần theo giọng ---- */
  async function model() { stop(); mode = 'm'; const me = ++RUN; ui(); hook();
    for (let i = 1; i < TL.length - 1; i++) { const seg = TL[i], txt = seg.l === 'zh' ? fill(seg.x.zh) : seg.tk.map(w => w.t).join(' ');
      const dur = 1.2 + (seg.l === 'zh' ? txt.length * .3 : txt.length * .075), t0 = performance.now(); let alive = true;
      const anim = () => { if (!alive || me !== RUN) return; draw(i * BAR + Math.min(3.6, (performance.now() - t0) / 1000 / dur * 3.6) * BEAT); raf = requestAnimationFrame(anim); }; anim();
      cap((seg.l === 'zh' ? '中文: ' : 'EN: ') + txt); await say(sayLine(seg)); alive = false; cancelAnimationFrame(raf); if (me !== RUN) return;
      draw(i * BAR + 3.95 * BEAT); await wait(600); if (me !== RUN) return; }
    heard[lang] = true; mode = ''; ui(); cap('Giờ con hát karaoke cùng nhạc nhé!'); }
  async function start(m) {
    stop(); mode = m; const me = ++RUN; ui(); hook();
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); await ctx.resume(); } catch (e) { mode = ''; cap('Máy chưa phát được nhạc.'); return ui(); }
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    let chunks = [];
    if (m === 'v') {
      try { micS = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch (e) { mode = ''; ui(); cap('Chưa mở được micro. Ba mẹ cho phép dùng micro rồi bấm Lồng tiếng lại nhé.'); return; }
      if (me !== RUN) return stop();
      const dest = ctx.createMediaStreamDestination(); master.connect(dest);
      const mic = ctx.createMediaStreamSource(micS), mg = ctx.createGain(); mg.gain.value = 1.6; mic.connect(mg); mg.connect(dest);
      const vs = C2().captureStream ? C2().captureStream(30) : null;
      const type = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
      if (!vs || !type) { mode = ''; ui(); cap('Trình duyệt này chưa thu được video. Ba mẹ thử Chrome hoặc Safari mới nhé.'); return; }
      const L0 = lang; rec = new MediaRecorder(new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]), { mimeType: type });
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { if (!chunks.length) return; ext[L0] = type.indexOf('mp4') >= 0 ? 'mp4' : 'webm'; url[L0] = URL.createObjectURL(new Blob(chunks, { type })); star(); mode = ''; if (body.isConnected) ui(); cap('Con xem lại video, rồi lưu về máy nhé!'); };
      rec.start(500);
    }
    const t0 = ctx.currentTime + .25; music(t0);
    let said = -1;
    const tick = () => { if (me !== RUN) return; const t = ctx.currentTime - t0;
      if (t >= DUR()) return end(m);
      draw(t); const bi = Math.floor(t / BAR);
      if (m === 'k' && bi !== said && t >= 0 && TL[bi] && TL[bi].k === 'line') { said = bi; say(sayLine(TL[bi])); }   // giọng mẫu khi hát karaoke (lồng tiếng thì không)
      raf = requestAnimationFrame(tick); };
    tick();
  }
  function end(m) { cancelAnimationFrame(raf); draw(DUR() - .01);
    if (m === 'k') { kar[lang]++; if (kar[lang] === 1) star(); mode = ''; stopAudio(); ui();
      cap(lang === 'en' && kar.en === 1 ? 'Giỏi lắm! Con hát lại, lồng tiếng, hoặc sang tiếng Trung.' : `Con đã hát ${kar[lang]} lần rồi!`); return; }
    stopAudio(); if (rec && rec.state !== 'inactive') rec.stop(); }
  function stopAudio() { try { master && master.disconnect(); } catch (e) {} master = null; if (micS) { micS.getTracks().forEach(t => t.stop()); micS = null; } }
  function stop() { cancelAnimationFrame(raf); stopAudio(); if (rec && rec.state !== 'inactive') { rec.onstop = null; try { rec.stop(); } catch (e) {} } mode = ''; }
  X.replay = () => model();
  ui(); intro();
};
