/* Lớp Zoom – "Bay bằng tay" ở phần Máy bay thanh điệu.
   Con giơ ngón trỏ trước camera, nghe "tách" thì bay tay theo thanh điệu; web theo dõi đầu ngón trỏ
   (MediaPipe Hand Landmarker, Apache-2.0, chạy ngay trên máy) rồi chọn đường bay gần nhất trong 4 đường bay.
   Little Seed: một chữ, một chặng. Canopy: từ hai chữ, bay hai chặng liền nhau (giữa hai chặng có tiếng "tách").
   Hình camera chỉ xử lý trên máy, không ghi, không gửi. Chạm đường bay vẫn dùng được như cũ.
   Thử không cần camera: thêm ?handsim=1 rồi kéo chuột / ngón tay trong khung camera thay cho bay tay. */

const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const TAY = (() => {
  const SIM = QS.has('handsim');
  let lm = null, stream = null, video = null, raf = 0, run = null, usedQ = '', simPt = null;

  /* ---------- nhận dạng một chặng bay ---------- */
  const N = 16;
  const TPL = {
    2: u => u,                                                   // bay lên
    3: u => u < 0.45 ? 0.5 * (1 - u / 0.45) : 0.9 * (u - 0.45) / 0.55,   // lượn xuống rồi lên
    4: u => 1 - u                                                // lao xuống
  };
  function resample(a, n) {
    if (a.length === 1) return Array(n).fill(a[0]);
    return Array.from({ length: n }, (_, i) => { const f = i * (a.length - 1) / (n - 1), j = Math.floor(f), k = Math.min(a.length - 1, j + 1); return a[j] + (a[k] - a[j]) * (f - j); });
  }
  const median = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)] || 0; };
  /* trả về chi phí của từng thanh 1–4 cho một chặng (càng nhỏ càng giống) */
  function costs(pts) {
    if (pts.length < 5) return null;
    const t0 = pts[0].t, T = pts[pts.length - 1].t - t0;
    const p = pts.filter(q => q.t - t0 >= T * 0.1);               // bỏ lúc con vừa bắt đầu
    if (p.length < 4) return null;
    const s = median(p.map(q => q.s)) || 0.2;                      // cỡ bàn tay trên hình (cổ tay → gốc ngón giữa)
    let h = p.map(q => -q.y);
    h = h.map((v, i) => (h[Math.max(0, i - 1)] + v + h[Math.min(h.length - 1, i + 1)]) / 3);
    const mx = Math.max(...h), mn = Math.min(...h), R = (mx - mn) / s;   // biên độ lên xuống, tính theo cỡ bàn tay
    const r = resample(h, N).map(v => (v - mn) / ((mx - mn) || 1));
    const c = { 1: Math.max(0, R - 0.45) * 0.35 };
    [2, 3, 4].forEach(k => { let e = 0; r.forEach((v, i) => { const d = v - TPL[k](i / (N - 1)); e += d * d; }); c[k] = e / N + (R < 0.5 ? 0.25 : 0); });
    return c;
  }
  /* chọn lựa chọn (1–4) có tổng chi phí nhỏ nhất; mỗi lựa chọn là một thanh (Little Seed) hoặc một cặp thanh (Canopy) */
  function choose(x, segs) {
    const cs = segs.map(costs); if (cs.some(c => !c)) return null;
    let best = 0, bc = 1e9;
    [1, 2, 3, 4].forEach(o => {
      const code = toneOpt(x, o), tones = x.o ? [Math.floor(code / 10), code % 10] : [code];
      const c = tones.reduce((t, k, j) => t + (cs[j] ? cs[j][k] : 1), 0);
      if (c < bc) { bc = c; best = o; }
    });
    return best;
  }

  /* ---------- camera và bộ nhận diện ---------- */
  async function load() {
    if (lm || SIM) return;
    const vision = await import(new URL('vendor/mediapipe/vision_bundle.mjs', location.href).href);
    const files = await vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href);
    for (const path of [new URL('vendor/mediapipe/hand_landmarker.task', location.href).href, HAND_MODEL]) {
      for (const d of ['GPU', 'CPU']) { try { lm = await vision.HandLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: path, delegate: d }, runningMode: 'VIDEO', numHands: 1 }); return; } catch (e) { } }
    }
    throw new Error('Không tải được bộ nhận diện bàn tay');
  }
  async function cam(el) {
    if (SIM) return;
    const hv = $('#hdVid');   // camera đã mở cho "Chơi bằng đầu": dùng chung, không mở thêm
    if (hv && hv.srcObject && hv.srcObject.active) el.srcObject = hv.srcObject;
    else { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } }, audio: false }); el.srcObject = stream; }
    video = el; await el.play().catch(() => { });
  }
  function close() {
    cancelAnimationFrame(raf); run = null;
    if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; video = null;
    const ov = $('#tayOv'); ov && ov.remove();
  }
  /* một khung hình: đầu ngón trỏ (y từ 0 trên xuống 1 dưới) và cỡ bàn tay */
  function sample(t) {
    if (SIM) return simPt ? { x: simPt.x, y: simPt.y, s: 0.25, t } : null;
    if (!lm || !video || video.readyState < 2) return null;
    try {
      const r = lm.detectForVideo(video, t), L = r.landmarks && r.landmarks[0];
      if (!L) return null;
      return { x: L[8].x, y: L[8].y, s: Math.hypot(L[9].x - L[0].x, L[9].y - L[0].y) || 0.2, t };
    } catch (e) { return null; }
  }

  /* ---------- màn bay bằng tay ---------- */
  function overlay(x) {
    const ov = document.createElement('div'); ov.id = 'tayOv'; ov.className = 'hd-cal tay-ov';
    ov.innerHTML = `<div class="hd-card tay-card">
      <div class="tay-top"><b>✋ Bay bằng tay · <span class="zh">${esc(x.c)}</span></b><button class="ic-btn" id="tayX" aria-label="Đóng">✖</button></div>
      <div class="tay-stage" id="tayStage"><video id="tayVid" playsinline muted></video><canvas id="tayCv"></canvas><div class="tay-big" id="tayBig"></div></div>
      <p class="tay-msg" id="tayMsg">Đang mở camera…</p><div class="tay-res" id="tayRes"></div></div>`;
    document.body.appendChild(ov);
    $('#tayX').onclick = close;
    if (SIM) {
      const st = $('#tayStage'), mv = e => { const b = st.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; simPt = { x: 1 - (p.clientX - b.left) / b.width, y: (p.clientY - b.top) / b.height }; };
      st.addEventListener('pointermove', mv); st.addEventListener('pointerdown', mv); st.addEventListener('pointerleave', () => simPt = null);
    }
    return ov;
  }
  function draw(trail, segAt) {
    const cv = $('#tayCv'); if (!cv) return;
    const w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w) { cv.width = w; cv.height = h; }
    const g = cv.getContext('2d'); g.clearRect(0, 0, w, h);
    const col = ['#FFC72C', '#4AA3E8'];
    trail.forEach((seg, j) => {
      if (seg.length < 2) return;
      g.strokeStyle = col[j % 2]; g.lineWidth = 8; g.lineCap = g.lineJoin = 'round'; g.beginPath();
      seg.forEach((p, i) => { const X = (1 - p.x) * w, Y = p.y * h; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke();
    });
    if (segAt) { g.fillStyle = '#E3262E'; g.beginPath(); g.arc((1 - segAt.x) * w, segAt.y * h, 10, 0, 7); g.fill(); }
  }
  /* mở màn bay bằng tay cho câu thanh điệu x; onPick(c) chọn lựa chọn c (1–4) như khi con chạm */
  async function open(x, qid, onPick) {
    close();
    overlay(x);
    const msg = t => { const m = $('#tayMsg'); m && (m.innerHTML = t); }, big = t => { const b = $('#tayBig'); b && (b.innerHTML = t); };
    try { await cam($('#tayVid')); await load(); }
    catch (e) {
      console.error(e);
      const denied = e && /NotAllowed|NotFound|NotReadable|Overconstrained|Security/.test(e.name || '');
      msg(denied ? 'Chưa mở được camera. Ba mẹ cho phép trình duyệt dùng camera (biểu tượng ổ khoá cạnh địa chỉ web) rồi bấm lại. Con chạm đường bay cũng được nhé.'
        : 'Chưa tải được bộ nhận diện bàn tay (cần mạng ổn định lần đầu, khoảng 8 MB). Con chạm đường bay để chọn nhé.');
      return;
    }
    const segs = x.o ? [{ lb: x.c[0] }, { lb: x.c[1] }] : [{ lb: x.c }];
    const SEG = x.o ? 1300 : 1600;
    const me = run = {};
    let state = 'wait', seen = 0, tState = performance.now(), cd = 3, trail = segs.map(() => []), si = 0, last = 0;
    msg(SIM ? 'Chế độ thử: kéo chuột trong khung để bay.' : 'Con giơ <b>ngón trỏ</b> lên trước camera nhé ☝️');
    const loop = () => {
      if (run !== me) return;
      raf = requestAnimationFrame(loop);
      const t = performance.now(); if (t - last < 33) return; last = t;
      const p = sample(t);
      if (state === 'wait') {
        seen = p ? seen + 1 : 0; big(p ? '☝️' : '');
        if (seen >= 8) { state = 'cd'; tState = t; cd = 3; big(cd); SND.beep('tap'); msg('Chuẩn bị bay nhé!'); }
      } else if (state === 'cd') {
        if (t - tState > 650) { tState = t; cd--; if (cd > 0) { big(cd); SND.beep('tap'); } else { state = 'rec'; si = 0; tState = t; SND.beep('pop'); big(`<span class="zh">${esc(segs[0].lb)}</span>`); msg(x.o ? 'Bay chữ thứ nhất!' : 'Bay theo thanh nào! ✈️'); } }
      } else if (state === 'rec') {
        if (p) trail[si].push(p);
        if (t - tState > SEG) {
          si++; tState = t;
          if (si < segs.length) { SND.beep('pop'); big(`<span class="zh">${esc(segs[si].lb)}</span>`); msg('Bay chữ thứ hai!'); }
          else { state = 'done'; finish(); return; }
        }
      }
      draw(trail, p);
    };
    const finish = () => {
      cancelAnimationFrame(raf); big('');
      const c = choose(x, trail);
      const res = $('#tayRes'); if (!res) return;
      if (!c) { msg('Máy chưa thấy rõ tay con. Con bay lại nhé!'); res.innerHTML = `<button class="btn" id="tayAgain">↺ Bay lại</button>`; $('#tayAgain').onclick = () => open(x, qid, onPick); return; }
      const code = toneOpt(x, c);
      msg('Máy bay của con:');
      res.innerHTML = `<div class="tay-pick">${planeSVG(code, 'tayPl', true)}<b>${esc(TONE_NAME[code])}</b></div>
        <div class="ctl" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button class="btn red" id="tayOk">✅ Chọn đường bay này</button><button class="btn ghost" id="tayAgain">↺ Bay lại</button></div>`;
      $('#tayAgain').onclick = () => open(x, qid, onPick);
      $('#tayOk').onclick = () => { usedQ = qid; close(); onPick(c); };
    };
    loop();
  }
  /* lần đầu: xin phép ba mẹ dùng camera (bỏ qua nếu đã bật "Chơi bằng đầu" hoặc đã đồng ý trước đó) */
  function start(x, qid, onPick) {
    if (SIM || lsGet('lz-tay-ok', false) || (typeof HEAD !== 'undefined' && HEAD.on)) return open(x, qid, onPick);
    const ov = document.createElement('div'); ov.id = 'tayOv'; ov.className = 'hd-cal';
    ov.innerHTML = `<div class="hd-card"><div class="hd-ic">✋</div><h2>Bay bằng tay</h2>
      <p class="vn">Con giơ ngón trỏ trước camera, nghe tiếng "tách" thì đưa tay bay theo thanh điệu. Máy nhận ra đường tay con bay và chọn đường bay giống nhất.</p>
      <p class="vn small">Web dùng camera trước của máy này. Hình ảnh chỉ xử lý ngay trên máy, <b>không ghi lại, không gửi đi</b>.</p>
      <div class="ctl" style="justify-content:center;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="tayYes">Ba mẹ đồng ý, bật camera</button><button class="btn ghost" id="tayNo">Để sau, con chạm</button></div></div>`;
    document.body.appendChild(ov);
    $('#tayNo').onclick = () => ov.remove();
    $('#tayYes').onclick = () => { lsSet('lz-tay-ok', true); SND.unlock(); open(x, qid, onPick); };
  }
  return { start, open, close, used: q => usedQ === q, _choose: choose };
})();
