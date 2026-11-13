/* =====================================================================
   VÈ 48 BUỔI trên web Little Seed + Seedling (chị chốt 13/11/2026, claude/QuyTac_BigBook_Ve_Web.md mục D)
   - Vè chỉ là lượt làm quen trước buổi lớp: mỗi unit 2 bài (A mở buổi, B kết buổi) × 2 tiếng = 4 lượt ở ngày web 1–4,
     mỗi ngày tối đa 1 lượt, một tiếng. Ngày 5–8 không có vè.
   - Một lượt có 3 lần: 1 · Nghe mẫu (chữ chạy theo giọng) → 2 · Nói theo từng câu (nhạc vẫn chạy, mỗi câu có chỗ cho con nói)
     → 3 · Lồng tiếng (giọng mẫu đơn, nhỏ; máy ghi giọng con thành video, lưu về máy, ba mẹ gửi cô qua Zalo).
   - Dữ liệu: window.VE48 (ve48-ls.js / ve48-sd.js, sinh bằng chuong-trinh/cong-cu/ve-audio/web.py). Audio từng câu đã đặt sẵn trong chỗ 2 ô nhịp.
   - Tệp này tự gắn bước vè vào ngày (thay bước 've'/'vek' cũ), không sửa dữ liệu big book.
   Cần các hàm chung của ls-app.js / seedling-app.js: R, T, cap, dots, star, finish, stopAll, toast, sfx, RUN, P.
   ===================================================================== */
(function () {
  const V = window.VE48; if (!V || !window.SD || !SD.days) return;
  /* ---- gắn bước vè vào ngày ---- */
  const isOld = s => s && (s.type === 've' || s.type === 'vek' || s.type === 'vk48');
  (V.bo || []).forEach(n => { const d = SD.days[n]; if (d && d.steps) d.steps = d.steps.filter(s => !isOld(s)); });
  Object.entries(V.ngay || {}).forEach(([n, g]) => {
    const d = SD.days[n]; if (!d || !d.steps) return; const b = V.bai[g.bai]; if (!b) return;
    const st = { type: 'vk48', lab: 'Vè', bai: g.bai, l: g.l, luot: g.luot, sub: (g.l === 'zh' ? 'Vè tiếng Trung · ' : 'Vè tiếng Anh · ') + (g.l === 'zh' ? b.ten_zh : b.ten) };
    const old = d.steps.findIndex(isOld); d.steps = d.steps.filter(s => !isOld(s));
    let at = old >= 0 ? old : d.steps.findIndex(s => s.type === 'game' || s.type === 'meo'); if (at < 0) at = d.steps.length;
    d.steps.splice(at, 0, st);
  });
})();

T.vk48 = { n: 'Vè', ic: 'cx_o_video', sub: 'Nghe, nói theo, lồng tiếng',
  rules: ['Lần 1: con nghe cô đọc vè, chữ sáng theo giọng.', 'Lần 2: cô đọc một câu, con nói theo câu đó.', 'Lần 3: giọng cô nhỏ đi, con đọc cùng, máy quay video giọng con để gửi cô.'] };

R.vk48 = (step, body) => {
  const V = window.VE48, B = V.bai[step.bai], L = step.l === 'zh', l = step.l, W = 960, H = 540;
  const BPM = B.bpm || 96, BEAT = 60 / BPM, BAR = 4 * BEAT, BASE = V.base;
  const nm = (typeof P !== 'undefined' && P.name) ? String(P.name).trim() : '';
  const LINES = B.dong.map(x => {
    let w = (L ? x.w_zh : x.w_en).slice(), m = (L ? x.m_zh : x.m_en).slice();
    if (x.ten && nm) { const pre = L ? [nm + '，', nm + '，'] : [nm + ',', nm + ',']; w = pre.concat(w); m = [0, 0].concat(m); }   // ô tên con: hiện tên, giọng mẫu không đọc
    return { w, m, py: L ? x.py : '', a: BASE + (L ? x.a_zh : x.a_en), a1: BASE + (L ? (x.a1_zh || x.a_zh) : (x.a1_en || x.a_en)) };
  });
  const N = LINES.length, done = { 1: false, 2: false, 3: false };
  let lan = 1, mode = '', ctx = null, master = null, raf = 0, micS = null, rec = null, url = '', ext = 'webm', noRec = false, BUF = {};
  const im = new Image(); if (B.img) im.src = B.img;
  const C2 = () => body.querySelector('#v4Cv');
  // dòng thời gian từng lần: [đếm 1 ô] + mỗi câu (lần 2: 2 ô cô + 2 ô con) + [kết 1 ô]
  const per = () => lan === 2 ? 4 : 2;
  const DUR = () => (2 + N * per()) * BAR;
  const slot = i => (1 + i * per()) * BAR;

  function ui() {
    dots([1, 2, 3].filter(k => done[k]).length, 3);
    const tab = k => `<button class="vk-tab ${lan === k ? 'on' : ''}" data-k="${k}" ${mode ? 'disabled' : ''}>${k} · ${['', 'Nghe', 'Nói theo', 'Lồng tiếng'][k]} ${done[k] ? '✓' : ''}</button>`;
    const msg = mode === 'p' ? (lan === 1 ? '👂 Con nghe cô đọc nhé…' : lan === 2 ? '🗣️ Cô đọc, rồi đến lượt con nói…' : '🔴 Đang quay video, con đọc cùng cô nhé…')
      : url ? '🎬 Video của con đây! Con xem lại rồi lưu về máy nhé.'
      : lan === 3 ? '🎬 Con bấm Lồng tiếng: giọng cô nhỏ, con đọc to lên nhé!' : lan === 2 ? 'Cô đọc một câu, con nói lại câu đó.' : 'Con bấm ▶ để nghe vè.';
    body.innerHTML = `<div class="vk">
      <div class="vk-tabs">${tab(1)}${tab(2)}${tab(3)}</div>
      <div class="vk-stage ${l}"><canvas id="v4Cv" width="${W}" height="${H}"></canvas>${mode || (lan === 3 && url) ? '' : '<div class="vk-cover" id="v4Go"><b>▶</b></div>'}</div>
      <div class="vk-st">${msg}</div>
      ${url ? `<div class="vk-out"><video src="${url}" controls playsinline></video><div class="row"><a class="btn g" href="${url}" download="ve-${L ? 'tieng-trung' : 'tieng-anh'}-${(nm || 'cua-con').replace(/\s+/g, '-')}.${ext}">💾 Lưu video về máy</a><button class="ls-b" id="v4Re">🎬 Quay lại</button></div>
        <small>${step.luot === 4 ? '⭐ Hôm nay là lượt vè cuối của unit: ba mẹ lưu video rồi gửi vào nhóm Zalo của lớp cho cô nhé!' : 'Ba mẹ lưu video, gửi vào nhóm Zalo của lớp cho cô nếu con muốn nhé.'}</small></div>` : ''}
      <div class="row vk-ctl">
        ${lan === 3 ? `<button class="btn y" id="v4Go2" ${mode ? 'disabled' : ''}>🎬 Lồng tiếng</button>` : `<button class="btn y" id="v4Go2" ${mode ? 'disabled' : ''}>${done[lan] ? '🔁 Làm lại' : '▶ Bắt đầu'}</button>`}
        ${!mode && done[lan] && lan < 3 ? `<button class="btn g" id="v4Nx">Sang lần ${lan + 1} →</button>` : ''}
        ${!mode && done[1] && done[2] && (done[3] || noRec) ? '<button class="btn g" id="nx">Xong ⭐</button>' : ''}</div>
      ${lan === 3 && !url && !mode ? '<small class="vk-tip">Nên đeo tai nghe để video rõ giọng con.</small>' : ''}</div>`;
    const on = (id, f) => { const e = body.querySelector(id); if (e) e.onclick = f; };
    on('#v4Go', () => { sfx.pop(); play(); }); on('#v4Go2', () => { sfx.pop(); play(); });
    on('#v4Nx', () => { sfx.pop(); setLan(lan + 1); }); on('#nx', () => { stop(); sfx.ok(); finish(); });
    on('#v4Re', () => { URL.revokeObjectURL(url); url = ''; play(); });
    body.querySelectorAll('.vk-tab').forEach(b => b.onclick = () => { const k = +b.dataset.k; if (k !== lan) setLan(k); });
    draw(-1); }
  function setLan(k) { stop(); lan = k; ui(); }

  /* ---- vẽ khung hình ---- */
  function draw(t) { const cv = C2(); if (!cv) return; const g = cv.getContext('2d');
    g.fillStyle = '#FFF7EA'; g.fillRect(0, 0, W, H);
    if (im.complete && im.naturalWidth) { const r = Math.max(W / im.naturalWidth, 390 / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
      g.save(); g.beginPath(); g.rect(0, 0, W, 390); g.clip(); g.drawImage(im, (W - w) / 2, (390 - h) / 2, w, h); g.restore(); }
    g.fillStyle = '#ffffff'; g.fillRect(0, 390, W, 150); g.fillStyle = '#F2C94C'; g.fillRect(0, 386, W, 6); g.textBaseline = 'middle';
    const font = s => `${L ? 700 : 800} ${s}px ${L ? '"Noto Sans SC", system-ui' : '"Be Vietnam Pro", system-ui'}, sans-serif`;
    const banner = (s, big) => { g.fillStyle = 'rgba(255,247,234,.85)'; g.fillRect(0, 0, W, 390); g.textAlign = 'center'; g.fillStyle = '#3b2a1f'; g.font = font(big ? 150 : 60); g.fillText(s, W / 2, 200); };
    if (t < 0) return banner(L ? B.ten_zh : B.ten);
    const pos = t - BAR; if (pos < 0) return banner(String(Math.min(4, Math.floor(t / BEAT) + 1)), true);
    const i = Math.floor(pos / (per() * BAR)); if (i >= N) return banner(L ? '👏 真棒！' : '👏 Yeah!');
    const inSlot = pos - i * per() * BAR, ln = LINES[i], kid = lan === 2 && inSlot >= 2 * BAR, tt = kid ? inSlot - 2 * BAR : inSlot;
    for (let b = 0; b < 4; b++) { const hit = b === Math.floor((t / BEAT) % 4); g.beginPath(); g.arc(W - 120 + b * 28, 38, hit ? 11 : 8, 0, 7); g.fillStyle = hit ? '#F2994A' : 'rgba(0,0,0,.18)'; g.fill(); }
    if (lan === 2) { g.textAlign = 'left'; g.font = '800 30px "Be Vietnam Pro", system-ui, sans-serif'; g.fillStyle = kid ? '#2d7a74' : '#C8372D';
      g.fillRect(24, 22, kid ? 210 : 150, 50); g.fillStyle = '#fff'; g.fillText(kid ? '🎤 Con nói!' : '👩‍🏫 Cô đọc', 38, 48); }
    let fs = L ? 52 : 46; const sep = L ? '' : ' '; let tw;
    do { g.font = font(fs); tw = ln.w.reduce((a, w) => a + g.measureText(w + sep).width, 0); if (tw > W - 60) fs -= 2; } while (tw > W - 60 && fs > 20);
    let x = (W - tw) / 2; const y = L && ln.py ? 448 : 465; g.textAlign = 'left';
    ln.w.forEach((w, k) => { const lit = tt >= ln.m[k] - 0.05; g.font = font(fs); g.fillStyle = lit ? (kid ? '#2d7a74' : '#C8372D') : '#6b5a45'; g.fillText(w, x, y); x += g.measureText(w + sep).width; });
    if (L && ln.py) { g.textAlign = 'center'; g.font = '500 24px system-ui, sans-serif'; g.fillStyle = '#2d7a74'; g.fillText(ln.py, W / 2, 505); } }

  /* ---- nhạc máy: trống + bass + hợp âm, như bước vè cũ ---- */
  function music(t0) {
    const g = ctx.createGain(); g.gain.value = lan === 3 ? .45 : .5; g.connect(master);
    const note = (f, t, d, type, v) => { const o = ctx.createOscillator(), a = ctx.createGain(); o.type = type; o.frequency.value = f; o.connect(a); a.connect(g);
      a.gain.setValueAtTime(.0001, t); a.gain.exponentialRampToValueAtTime(v, t + .02); a.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .05); };
    const noise = (t, d, v, hp) => { const n = Math.floor(ctx.sampleRate * d), b = ctx.createBuffer(1, n, ctx.sampleRate), x = b.getChannelData(0);
      for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain(); f.type = hp ? 'highpass' : 'bandpass'; f.frequency.value = hp ? 7000 : 1500; a.gain.value = v;
      s.buffer = b; s.connect(f); f.connect(a); a.connect(g); s.start(t); };
    const kick = t => { const o = ctx.createOscillator(), a = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .18);
      a.gain.setValueAtTime(.9, t); a.gain.exponentialRampToValueAtTime(.0001, t + .25); o.connect(a); a.connect(g); o.start(t); o.stop(t + .3); };
    const CH = [[48, 64, 67, 72], [43, 62, 67, 71], [45, 64, 69, 72], [41, 65, 69, 72]], hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const nb = 2 + N * per();
    for (let bi = 0; bi < nb; bi++) { const tb = t0 + bi * BAR;
      if (bi === 0) { for (let b = 0; b < 4; b++) note(b ? 1200 : 1600, tb + b * BEAT, .08, 'square', .25); continue; }
      const ch = CH[bi % 4];
      for (let b = 0; b < 4; b++) { const t = tb + b * BEAT;
        if (b % 2 === 0) kick(t); else noise(t, .16, .7, false);
        noise(t + BEAT / 2, .05, .18, true); noise(t, .05, .12, true);
        note(hz(ch[0]), t, BEAT * .9, 'triangle', .35); }
      ch.slice(1).forEach(m => note(hz(m), tb, BAR * .95, 'sine', .07)); } }
  async function load() {
    const need = [...new Set(LINES.map(x => lan === 1 ? x.a : x.a1))].filter(u => !BUF[u]);
    await Promise.all(need.map(async u => { try { const r = await fetch(u); BUF[u] = await ctx.decodeAudioData(await r.arrayBuffer()); } catch (e) { BUF[u] = null; } })); }
  function voices(t0) { const g = ctx.createGain(); g.gain.value = lan === 3 ? .3 : 1; g.connect(master);
    LINES.forEach((x, i) => { const b = BUF[lan === 1 ? x.a : x.a1]; if (!b) return; const s = ctx.createBufferSource(); s.buffer = b; s.connect(g); s.start(t0 + slot(i)); }); }

  async function play() { stop(); const me = ++RUN; mode = 'p'; ui(); VK_HOOK();
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); await ctx.resume(); } catch (e) { mode = ''; ui(); cap('Máy chưa phát được âm thanh.'); return; }
    cap('Đang tải giọng cô…'); await load(); if (me !== RUN) return;
    master = ctx.createGain(); master.connect(ctx.destination);
    if (lan === 3) {
      try { micS = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch (e) { mode = ''; noRec = true; ui(); cap('Chưa mở được micro. Ba mẹ cho phép dùng micro rồi bấm Lồng tiếng lại nhé.'); return; }
      if (me !== RUN) return stop();
      const dest = ctx.createMediaStreamDestination(); master.connect(dest);
      const mic = ctx.createMediaStreamSource(micS), mg = ctx.createGain(); mg.gain.value = 1.6; mic.connect(mg); mg.connect(dest);
      const vs = C2() && C2().captureStream ? C2().captureStream(30) : null;
      const type = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(x => window.MediaRecorder && MediaRecorder.isTypeSupported(x));
      if (!vs || !type) { mode = ''; noRec = true; stopAudio(); ui(); cap('Trình duyệt này chưa quay được video. Ba mẹ thử Chrome hoặc Safari mới nhé.'); return; }
      const chunks = []; rec = new MediaRecorder(new MediaStream([...vs.getVideoTracks(), ...dest.stream.getAudioTracks()]), { mimeType: type });
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { if (!chunks.length) return; ext = type.indexOf('mp4') >= 0 ? 'mp4' : 'webm'; url = URL.createObjectURL(new Blob(chunks, { type }));
        if (!done[3]) { done[3] = true; star(); } mode = ''; if (body.isConnected) ui(); cap('Con xem lại video rồi lưu về máy nhé!'); };
      rec.start(500); }
    const t0 = ctx.currentTime + .3; music(t0); voices(t0);
    cap(lan === 1 ? 'Con nghe nhé!' : lan === 2 ? 'Cô đọc xong, con nói theo nhé!' : 'Con đọc cùng cô nhé!');
    const tick = () => { if (me !== RUN) return; const t = ctx.currentTime - t0; if (t >= DUR()) return end(); draw(t); raf = requestAnimationFrame(tick); }; tick(); }
  function end() { cancelAnimationFrame(raf); draw(DUR() - .01);
    if (lan === 3) { stopAudio(); if (rec && rec.state !== 'inactive') rec.stop(); return; }
    stopAudio(); mode = ''; if (!done[lan]) { done[lan] = true; star(); } ui();
    cap(lan === 1 ? 'Giỏi lắm! Giờ con nói theo từng câu nhé.' : 'Giỏi lắm! Giờ con lồng tiếng nhé.'); setTimeout(() => body.isConnected && !mode && lan < 3 && setLan(lan + 1), 1500); }
  function stopAudio() { try { master && master.disconnect(); } catch (e) {} master = null; if (micS) { micS.getTracks().forEach(t => t.stop()); micS = null; } }
  function stop() { cancelAnimationFrame(raf); stopAudio(); if (rec && rec.state !== 'inactive') { rec.onstop = null; try { rec.stop(); } catch (e) {} } rec = null; mode = ''; }
  function VK_HOOK() { (window.VK48_STOP = window.VK48_STOP || new Set()).add(() => { const was = mode; stop(); if (was && body.isConnected) ui(); }); }
  if (typeof X !== 'undefined' && X) X.replay = () => play();
  ui();
};
/* dừng vè khi rời bước */
stopAll = (function (orig) { return function () { const f = [...(window.VK48_STOP || [])]; if (window.VK48_STOP) window.VK48_STOP.clear(); f.forEach(g => { try { g(); } catch (e) {} }); return orig.apply(this, arguments); }; })(stopAll);
