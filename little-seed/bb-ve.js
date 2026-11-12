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
  rules: ['Bên trái: cô đọc big book từng trang, tiếng Anh rồi tiếng Trung.', 'Nghe hết quyển thì bên phải mở câu hỏi: con nghe câu hỏi và chạm đúng tranh.', 'Chưa đúng cũng không sao: mình làm câu khác, lát nữa gặp lại.'] };
T.vek = { n: 'Vè', ic: 'cx_o_video', sub: 'Hát karaoke rồi lồng tiếng',
  rules: ['Con xem video vè và hát theo: chữ sáng đến đâu, con hát đến đó. Hát bao nhiêu lần cũng được.', 'Khi đã thuộc, con bấm "Lồng tiếng": máy thu giọng con hát cùng video.', 'Xem lại rồi lưu video về máy để ba mẹ gửi cô.'] };

/* ---------- BIG BOOK hai cột ---------- */
R.bb = (step, body) => {
  const P = step.pages; let c = 0, playing = true, read = false, busy = false;
  let Q = step.qs.map(q => Object.assign({}, q)); let qi = 0; const back = new Set();
  body.innerHTML = `<div class="bb2"><section class="bb2-book" id="bbBook"></section><section class="bb2-q" id="bbQ"></section></div>`;
  const B = body.querySelector('#bbBook'), QP = body.querySelector('#bbQ');
  const prog = () => dots(read ? 1 + Math.min(qi, Q.length) : 0, 1 + step.qs.length);
  function drawBook(hl) { const p = P[c]; prog();
    B.innerHTML = `<div class="bb2-h"><span class="ls-tag en">Big book</span><b>${esc(step.title)} · <span class="zh">${esc(step.title_zh)}</span></b><span>${c + 1}/${P.length}</span></div>
      <div class="bb2-pg ${p.cover ? 'cover' : ''}"><img src="${esc(p.img)}" alt="">${p.cover ? `<div class="bb2-ttl"><b>${esc(p.en)}</b><b class="zh">${esc(p.zh)}</b></div>` : ''}</div>
      ${p.cover ? '' : `<div class="bb2-tx"><div class="en ${hl === 'en' ? 'on' : ''}">${esc(p.en)}</div><div class="zhl ${hl === 'zh' ? 'on' : ''}"><b class="zh">${esc(p.zh)}</b><span class="sx-pyl on">${esc(p.py)}</span></div></div>`}
      <div class="row ls-snav"><button class="ls-b" id="bPrev" ${c ? '' : 'disabled'}>◀</button><button class="ls-b dark" id="bPlay">${playing ? '⏸ Dừng' : '▶ Đọc tiếp'}</button><button class="ls-b" id="bNext">${c === P.length - 1 ? 'Hết ✓' : '▶▶'}</button></div>`;
    B.querySelector('#bPrev').onclick = () => { if (c > 0) { stopAll(); playing = false; c--; drawBook(); line(); } };
    B.querySelector('#bNext').onclick = () => { stopAll(); playing = false; if (c < P.length - 1) { c++; drawBook(); line(); } else doneRead(); };
    B.querySelector('#bPlay').onclick = () => { playing = !playing; if (playing) auto(); else { stopAll(); drawBook(); } }; }
  async function line() { const p = P[c], me = RUN;
    drawBook('en'); cap('EN: ' + p.en); await say(en(p.en, p.a_en)); if (me !== RUN) return;
    await wait(250); drawBook('zh'); cap('中文: ' + p.zh); await say(zh(p.zh, p.a_zh)); if (me === RUN) drawBook(); }
  async function auto() { const me = ++RUN; if (c === 0 && !read) { await hd('listen'); if (me !== RUN) return; }
    while (me === RUN) { await line(); if (me !== RUN) return; await wait(700); if (me !== RUN) return; if (c === P.length - 1) return doneRead(); c++; } }
  function doneRead() { playing = false; drawBook(); if (read) return; read = true; sfx.ok(); star(); cap('Nghe xong rồi! Giờ con trả lời câu hỏi bên phải nhé.'); drawQ(); ask(); }
  function drawQ() { prog();
    if (!read) { QP.className = 'bb2-q lock';
      QP.innerHTML = `<div class="bb2-qh"><b>Câu hỏi</b><small>${step.qs.length} câu</small></div><div class="bb2-lock"><span>🔒</span><p>Con nghe hết big book bên trái thì câu hỏi sẽ mở ra ở đây.</p></div>
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
  async function ask() { const q = Q[qi]; if (!q) return; const me = ++RUN; drawQ(); X.replay = () => { stopAll(); say(q.l === 'zh' ? zh(q.q, q.a_q) : en(q.q, q.a_q)); };
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
  const BPM = step.bpm || 92, BEAT = 60 / BPM, BAR = 4 * BEAT, W = 960, H = 540;
  const nm = (typeof P !== 'undefined' && P.name) ? P.name : '';
  const fill = s => nm ? (s || '').replace(/___/g, nm) : (s || '').replace(/___[，,]?\s*/g, '').replace(/\s+([!?！？])/g, '$1').trim();
  // dòng thời gian: 1 ô đếm nhịp, các dòng tiếng Anh, 1 ô chuyển, các dòng tiếng Trung, 1 ô kết
  const TL = [{ k: 'count', l: 'en' }].concat(step.lines.map(x => ({ k: 'line', l: 'en', x, tk: vkTok(x.raw || x.en) })), [{ k: 'swap', l: 'zh' }],
    step.lines.map(x => ({ k: 'line', l: 'zh', x, tk: vkZh(fill(x.zh)) })), [{ k: 'end', l: 'zh' }]);
  const DUR = TL.length * BAR;
  const IM = {}; step.lines.forEach(x => { if (x.img && !IM[x.img]) { const im = new Image(); im.src = x.img; IM[x.img] = im; } });
  let nKar = 0, rec = null, url = '', mode = '', ctx = null, master = null, raf = 0, micS = null, myRun = 0;
  const C2 = () => body.querySelector('#vkCv');

  function ui() { dots(Math.min(nKar, 2) + (url ? 1 : 0), 3);
    body.innerHTML = `<div class="vk"><div class="vk-stage"><canvas id="vkCv" width="${W}" height="${H}"></canvas>${url || mode ? '' : `<div class="vk-cover" id="vkCover"><b>▶</b></div>`}</div>
      <div class="vk-st" id="vkSt">${mode === 'k' ? '🎤 Đang hát karaoke…' : mode === 'v' ? '🔴 Đang thu giọng con…' : nKar ? `Con đã hát ${nKar} lần.` : 'Bấm "Hát karaoke" để bắt đầu.'}</div>
      ${url ? `<div class="vk-out"><video src="${url}" controls playsinline></video><div class="row"><a class="btn g" id="vkSave" href="${url}" download="ve-${(nm || 'cua-con').replace(/\s+/g, '-')}.${rec && rec.mimeType && rec.mimeType.indexOf('mp4') >= 0 ? 'mp4' : 'webm'}">💾 Lưu video về máy</a><button class="ls-b" id="vkRe">🎬 Thu lại</button></div>
        <small>Ba mẹ lưu video rồi gửi vào nhóm Zalo của lớp cho cô nhé.</small></div>` : ''}
      <div class="row vk-ctl"><button class="btn y" id="vkK" ${mode ? 'disabled' : ''}>🎤 Hát karaoke${nKar ? ` (lần ${nKar + 1})` : ''}</button>
        <button class="btn" id="vkV" ${mode || !nKar ? 'disabled' : ''}>🎬 Lồng tiếng</button>
        ${nKar && !mode ? '<button class="btn g" id="nx">Xong ⭐</button>' : ''}</div>
      ${nKar && !url && !mode ? '<small class="vk-tip">Lồng tiếng: nên đeo tai nghe để video chỉ có nhạc và giọng con.</small>' : ''}</div>`;
    const go = m => { sfx.pop(); start(m); };
    body.querySelector('#vkK').onclick = () => go('k'); body.querySelector('#vkV').onclick = () => go('v');
    const cv = body.querySelector('#vkCover'); if (cv) cv.onclick = () => go('k');
    const nx = body.querySelector('#nx'); if (nx) nx.onclick = () => { stop(); sfx.ok(); finish(); };
    const re = body.querySelector('#vkRe'); if (re) re.onclick = () => { URL.revokeObjectURL(url); url = ''; go('v'); };
    draw(-1); }

  /* ---- nhạc máy: trống + bass + hợp âm C–G–Am–F, đếm nhịp bằng tiếng gõ ---- */
  function music(t0) {
    const g = ctx.createGain(); g.gain.value = .55; g.connect(master);
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
  /* ---- vẽ một khung hình ---- */
  function draw(t) { const cv = C2(); if (!cv) return; const g = cv.getContext('2d');
    g.fillStyle = '#FFF7EA'; g.fillRect(0, 0, W, H);
    const bi = t < 0 ? -1 : Math.min(TL.length - 1, Math.floor(t / BAR)), seg = TL[Math.max(0, bi)], bt = t < 0 ? -1 : (t - bi * BAR) / BEAT;
    const lineSeg = seg.k === 'line' ? seg : (TL.slice(0, Math.max(1, bi)).reverse().find(s => s.k === 'line') || TL.find(s => s.k === 'line'));
    const im = lineSeg && IM[lineSeg.x.img];
    if (im && im.complete && im.naturalWidth) { const r = Math.max(W / im.naturalWidth, 390 / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
      g.save(); g.beginPath(); g.rect(0, 0, W, 390); g.clip(); g.drawImage(im, (W - w) / 2, (390 - h) / 2, w, h); g.restore(); }
    g.fillStyle = '#ffffff'; g.fillRect(0, 390, W, 150); g.fillStyle = '#F2C94C'; g.fillRect(0, 386, W, 6);
    g.textAlign = 'left'; g.textBaseline = 'middle';
    g.font = '700 22px "Be Vietnam Pro", system-ui, sans-serif'; g.fillStyle = seg.l === 'zh' ? '#D93A3A' : '#2F6FD6';
    g.beginPath(); g.roundRect ? g.roundRect(20, 18, 140, 40, 20) : g.rect(20, 18, 140, 40); g.fill(); g.fillStyle = '#fff'; g.fillText(seg.l === 'zh' ? '中文' : 'English', 46, 39);
    for (let b = 0; b < 4; b++) { g.beginPath(); g.arc(W - 120 + b * 28, 38, b === Math.floor(bt) && t >= 0 ? 11 : 8, 0, 7);
      g.fillStyle = b === Math.floor(bt) && t >= 0 ? '#F2994A' : 'rgba(0,0,0,.18)'; g.fill(); }
    if (t < 0 || seg.k === 'count' || seg.k === 'swap' || seg.k === 'end') {
      g.fillStyle = 'rgba(255,247,234,.82)'; g.fillRect(0, 0, W, 390); g.textAlign = 'center'; g.fillStyle = '#3b2a1f';
      const big = t < 0 ? (step.title || 'Vè') : seg.k === 'count' ? String(Math.min(4, Math.floor(bt) + 1)) : seg.k === 'swap' ? '中文 · 再来一次！' : '👏 Yeah!';
      g.font = `800 ${seg.k === 'count' && t >= 0 ? 150 : 56}px "Be Vietnam Pro", "Noto Sans SC", system-ui, sans-serif`; g.fillText(big, W / 2, 200);
      if (t < 0) { g.font = '600 30px "Noto Sans SC", system-ui, sans-serif'; g.fillText(step.title_zh || '', W / 2, 270); }
    }
    const nxt = TL[bi + 1], show = seg.k === 'line' ? seg : (nxt && nxt.k === 'line' ? nxt : null);   // ô chuyển: hiện trước dòng sắp hát
    if (show) { const sung = seg === show ? bt : -1, zhL = show.l === 'zh';
      let fs = zhL ? 50 : 44; g.textAlign = 'left';
      const font = s => `${zhL ? 700 : 800} ${s}px ${zhL ? '"Noto Sans SC", system-ui' : '"Be Vietnam Pro", system-ui'}, sans-serif`;
      const sep = zhL ? '' : ' '; let tw;
      do { g.font = font(fs); tw = show.tk.reduce((a, w) => a + g.measureText(w.t + sep).width, 0); if (tw > W - 60) fs -= 2; } while (tw > W - 60 && fs > 20);
      let x = (W - tw) / 2; const y = zhL && show.x.py ? 450 : 465;
      show.tk.forEach(w => { const on = w.b !== null && sung >= w.b; g.font = font(fs); g.fillStyle = on ? '#C8372D' : (w.s ? '#3b2a1f' : '#6b5a45');
        if (on && sung - w.b < .5) { g.save(); g.translate(x, y); g.scale(1.08, 1.08); g.fillText(w.t, 0, 0); g.restore(); } else g.fillText(w.t, x, y);
        x += g.measureText(w.t + sep).width; });
      if (zhL && show.x.py) { g.textAlign = 'center'; g.font = '500 24px system-ui, sans-serif'; g.fillStyle = '#2d7a74'; g.fillText(show.x.py, W / 2, 505); } }
    const st = body.querySelector('#vkSt'); if (st && t >= 0) { const k = TL.slice(0, bi + 1).filter(s => s.k === 'line').length, n = TL.filter(s => s.k === 'line').length;
      const msg = (mode === 'v' ? '🔴 Đang thu giọng con… ' : '🎤 Hát cùng nhé! ') + `Dòng ${k}/${n}`; if (st.textContent !== msg) st.textContent = msg; }
  }
  async function start(m) {
    stop(); mode = m; myRun = ++RUN; const me = myRun; ui(); VK_STOP.add(() => { const was = mode; stop(); if (was && body.isConnected) ui(); });
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); await ctx.resume(); } catch (e) { mode = ''; cap('Máy chưa phát được nhạc.'); return ui(); }
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    let dest = null, chunks = [];
    if (m === 'v') {
      try { micS = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch (e) { mode = ''; ui(); cap('Chưa mở được micro. Ba mẹ cho phép dùng micro rồi bấm Lồng tiếng lại nhé.'); return; }
      if (me !== RUN) return stop();
      dest = ctx.createMediaStreamDestination(); master.connect(dest);
      const mic = ctx.createMediaStreamSource(micS), mg = ctx.createGain(); mg.gain.value = 1.6; mic.connect(mg); mg.connect(dest);
      const vs = C2().captureStream ? C2().captureStream(30) : null;
      const type = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
      if (!vs || !type) { mode = ''; ui(); cap('Trình duyệt này chưa thu được video. Ba mẹ thử Chrome hoặc Safari mới nhé.'); return; }
      rec = new MediaRecorder(new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]), { mimeType: type });
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { if (!chunks.length) return; url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || type })); star(); mode = ''; ui(); cap('Con xem lại video, rồi lưu về máy nhé!'); };
      rec.start(500);
    }
    const t0 = ctx.currentTime + .25; music(t0);
    let said = -1;
    const tick = () => { if (me !== RUN) return; const t = ctx.currentTime - t0;
      if (t >= DUR) return end(m);
      draw(t); const bi = Math.floor(t / BAR);
      if (m === 'k' && bi !== said && t >= 0 && TL[bi] && TL[bi].k === 'line') { said = bi; const x = TL[bi].x;   // giọng mẫu karaoke (lồng tiếng thì không có)
        say(TL[bi].l === 'zh' ? zh(fill(x.zh), x.a_zh) : en(fill(x.en), x.a_en)); }
      raf = requestAnimationFrame(tick); };
    tick();
  }
  function end(m) { cancelAnimationFrame(raf); draw(DUR - .01);
    if (m === 'k') { nKar++; if (nKar <= 2) star(); mode = ''; stopAudio(); ui(); cap(nKar === 1 ? 'Giỏi lắm! Con hát lại cho thuộc, hoặc bấm Lồng tiếng.' : `Con đã hát ${nKar} lần rồi!`); return; }
    stopAudio(); if (rec && rec.state !== 'inactive') rec.stop(); }
  function stopAudio() { try { master && master.disconnect(); } catch (e) {} master = null; if (micS) { micS.getTracks().forEach(t => t.stop()); micS = null; } }
  function stop() { cancelAnimationFrame(raf); stopAudio(); if (rec && rec.state !== 'inactive') { rec.onstop = null; try { rec.stop(); } catch (e) {} } if (mode) { mode = ''; } }
  X.replay = () => start('k');
  VK_STOP.clear(); VK_STOP.add(() => { const was = mode; stop(); if (was && body.isConnected) ui(); });   // Dừng / Làm lại / rời bước: tắt nhạc, micro
  ui(); start('k');
};
