/* =====================================================================
   SEEDLING · CHƠI BẰNG ĐẦU (bước Vận động) – dùng lại cách làm của lop-zoom/lz-head.js.
   Con quay đầu sang trái / phải (2 lựa chọn) hoặc trái / ngửa lên / phải (3 lựa chọn), giữ khoảng 0,6 giây là chọn.
   Camera trước + MediaPipe Face Landmarker (Apache-2.0) để sẵn ở ../lop-zoom/vendor/mediapipe.
   Hình camera chỉ xử lý ngay trên máy, không ghi lại, không gửi đi. Chạm vẫn dùng được như thường.
   Thử không cần camera: thêm ?headsim=1 (phím ← ↑ →).
   ===================================================================== */
const HEAD = (() => {
  const VENDOR = '../lop-zoom/vendor/mediapipe/';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const SIM = new URLSearchParams(location.search).has('headsim'), HOLD = 650, TH_Y = 0.17, TH_P = 0.10;
  const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
  let on = false, starting = false, video = null, stream = null, lm = null, raf = 0, last = 0;
  let base = { yaw: 0, pitch: 0, n: 0 }, sign = +sget('sdl-head-sign', 0) || 0;
  let holdDir = '', holdT = 0, needNeutral = false, calib = null, simPose = { yaw: 0, pitch: 0 }, faceSeen = false;

  function pose(L) {
    const n = L[1], le = L[33], re = L[263], top = L[10], ch = L[152];
    const ed = Math.hypot(re.x - le.x, re.y - le.y) || 1e-3, fh = Math.abs(ch.y - top.y) || 1e-3;
    return { yaw: (n.x - (le.x + re.x) / 2) / ed, pitch: (n.y - (top.y + ch.y) / 2) / fh };
  }
  const within = (p, ms, why) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(why || 'timeout')), ms))]);
  async function loadModel() {
    const vision = await import(new URL(VENDOR + 'vision_bundle.mjs', location.href).href);
    const files = await vision.FilesetResolver.forVisionTasks(new URL(VENDOR + 'wasm', location.href).href);
    const mk = (path, delegate) => vision.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: path, delegate }, runningMode: 'VIDEO', numFaces: 1 });
    for (const path of [new URL(VENDOR + 'face_landmarker.task', location.href).href, MODEL])
      for (const d of ['GPU', 'CPU']) { try { lm = await within(mk(path, d), 15000, 'model'); return; } catch (e) { } }
    throw new Error('model');
  }
  async function startCam() {
    if (SIM) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false });
    video = $('#hdVid'); video.srcObject = stream; await video.play().catch(() => { });
  }
  const zone = () => $('.hd-zone');
  function picks() { const z = zone(); if (!z) return []; return Array.from(z.querySelectorAll('.hd-pick')).filter(b => !b.disabled); }
  function tick() {
    raf = requestAnimationFrame(tick);
    const t = performance.now(); if (t - last < 66) return; last = t;
    const cam = $('#hdCam'); if (cam) cam.classList.toggle('idle', !zone() && !calib);
    if (!zone() && !calib) { holdDir = ''; setAim(-1, 0); return; }   // ngoài bước Vận động: tạm nghỉ cho đỡ tốn pin
    let p = null;
    if (SIM) p = simPose;
    else if (lm && video && video.readyState >= 2) { try { const r = lm.detectForVideo(video, t); if (r.faceLandmarks && r.faceLandmarks[0]) p = pose(r.faceLandmarks[0]); } catch (e) { } }
    faceSeen = !!p; cam && cam.classList.toggle('noface', !p);
    if (!p) { setAim(-1, 0); holdDir = ''; showDir('', false); return; }
    if (base.n < 8) { base.yaw = (base.yaw * base.n + p.yaw) / (base.n + 1); base.pitch = (base.pitch * base.n + p.pitch) / (base.n + 1); base.n++; return; }
    const dy = p.yaw - base.yaw, dp = p.pitch - base.pitch;
    let dir = '';
    if (Math.abs(dy) > TH_Y) dir = dy * (sign || 1) > 0 ? 'L' : 'R';
    else if (Math.abs(dp) > TH_P) dir = 'U';
    else { base.yaw += (p.yaw - base.yaw) * .04; base.pitch += (p.pitch - base.pitch) * .04; }
    if (calib) return calibStep(dir, dy, t);
    showDir(dir, true); handle(dir, t);
  }
  const ARW = { L: '⬅️', R: '➡️', U: '⬆️' };
  function mirror() { const m = $('#mir'); if (!m) return; const v = m.querySelector('video');
    m.classList.toggle('off', !on); if (on && stream && v && v.srcObject !== stream) { v.srcObject = stream; v.play().catch(() => { }); } }
  function showDir(dir, face) { const m = $('#mir'); if (!m) return; if (on && m.classList.contains('off')) mirror();
    const d = $('#mdir'), tip = $('#mtip'); m.classList.toggle('noface', !face);
    if (d) { d.textContent = face && dir ? ARW[dir] : ''; d.className = 'sd-dir' + (face && dir ? ' ' + dir : ''); }
    if (tip) tip.textContent = !on ? 'Bấm 🙆 để chơi bằng đầu' : !face ? 'Máy chưa thấy mặt con' : dir ? 'Giữ yên một chút…' : 'Con quay đầu để chọn tranh'; }
  function setAim(i, f) {
    $$('.hd-pick.aim').forEach((x, j) => { x.classList.remove('aim'); x.style.removeProperty('--hold'); });
    const a = picks(); if (i < 0 || !a[i]) return;
    a[i].classList.add('aim'); a[i].style.setProperty('--hold', Math.min(1, f).toFixed(2));
  }
  function idxOf(dir, n) { if (n === 2) return dir === 'L' ? 0 : dir === 'R' ? 1 : -1; return { L: 0, U: 1, R: 2 }[dir]; }
  function decorate() { const a = picks(); a.forEach((x, i) => { x.dataset.hd = a.length === 2 ? ['⬅️', '➡️'][i] : ['⬅️', '⬆️', '➡️'][i]; }); }
  function handle(dir, t) {
    decorate(); const a = picks();
    if (needNeutral) { if (!dir) needNeutral = false; setAim(-1, 0); return; }
    const i = dir ? idxOf(dir, a.length) : -1;
    if (!a.length || i < 0 || i == null) { holdDir = ''; setAim(-1, 0); return; }
    if (dir !== holdDir) { holdDir = dir; holdT = t; }
    const f = (t - holdT) / HOLD; setAim(i, f);
    if (f >= 1) { needNeutral = true; holdDir = ''; setAim(-1, 0); a[i].click(); }
  }
  const STEPS = [{ k: 'L', t: 'Con quay đầu sang bên TRÁI nhé!', ic: '⬅️' }, { k: 'R', t: 'Giờ con quay đầu sang bên PHẢI!', ic: '➡️' }, { k: 'U', t: 'Con ngửa đầu nhìn lên trời nào!', ic: '⬆️' }];
  function calibShow() { const s = STEPS[calib.i], ov = $('#hdCal'); if (!ov) return;
    ov.innerHTML = `<div class="hd-card"><div class="hd-ic">${s.ic}</div><h2>${s.t}</h2><div class="hd-prog"><i id="hdProg"></i></div>
      <p>${faceSeen || SIM ? 'Con giữ yên một chút…' : 'Con nhìn thẳng vào máy để máy thấy mặt con nhé.'}</p><button class="ls-b" id="hdSkip">Bỏ qua, chơi bằng chạm</button></div>`;
    $('#hdSkip').onclick = () => { stop(); ov.remove(); };
    say({ t: s.t, l: 'vi' }); }
  function calibStep(dir, dy, t) { const s = STEPS[calib.i]; let hit = false;
    if (s.k === 'L' && Math.abs(dy) > TH_Y) hit = true;
    if (s.k === 'R' && Math.abs(dy) > TH_Y && Math.sign(dy) === -calib.sign) hit = true;
    if (s.k === 'U' && dir === 'U') hit = true;
    if (!hit) { calib.t0 = 0; const pr = $('#hdProg'); pr && (pr.style.width = '0%'); if (!calib.shown) { calib.shown = 1; calibShow(); } return; }
    if (!calib.t0) calib.t0 = t;
    const f = (t - calib.t0) / 500, pr = $('#hdProg'); pr && (pr.style.width = Math.min(100, f * 100) + '%'); if (f < 1) return;
    if (s.k === 'L') { calib.sign = Math.sign(dy); sign = calib.sign; sset('sdl-head-sign', sign); }
    sfx.ok(); calib.i++; calib.t0 = 0; calib.shown = 0; needNeutral = true;
    if (calib.i >= STEPS.length) { calib = null; const ov = $('#hdCal'); ov && ov.remove(); sset('sdl-head', true); toast('🙆 Xong rồi! Con quay đầu để chọn. Giữ một chút cho vòng sáng đầy là chọn.'); return; }
    calibShow(); }
  async function start(withCalib) {
    if (on || starting) return; starting = true;
    let cam = $('#hdCam');
    if (!cam) { cam = document.createElement('div'); cam.id = 'hdCam'; cam.className = 'hd-cam noface'; cam.innerHTML = '<video id="hdVid" playsinline muted></video><span>🙆</span>'; document.body.appendChild(cam); }
    if (withCalib) { const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal'; ov.innerHTML = '<div class="hd-card"><h2>Đang mở camera…</h2><p>Lần đầu có thể mất vài giây. Nếu trình duyệt hỏi, ba mẹ bấm <b>Cho phép</b>.</p><button class="btn y" id="hdSkip">Chơi bằng chạm</button></div>'; document.body.appendChild(ov); const sk = ov.querySelector('#hdSkip'); if (sk) sk.onclick = () => { cancelled = true; stop(); ov.remove(); }; }
    let cancelled = false;
    try {
      await within(startCam(), 30000, 'cam'); if (cancelled) { starting = false; return; } if (!SIM) await within(loadModel(), 40000, 'model'); if (cancelled) { stop(); starting = false; return; }
      on = true; base = { yaw: 0, pitch: 0, n: 0 }; needNeutral = true;
      if (withCalib || !sign) { calib = { i: 0, sign: 0, t0: 0 }; if (!$('#hdCal')) { const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal'; document.body.appendChild(ov); } calibShow(); }
      tick(); btn(); mirror();
    } catch (e) {
      console.error(e); stop();
      const camErr = e && /NotAllowed|NotFound|NotReadable|Overconstrained|Security/.test(e.name || '');
      const ov = $('#hdCal') || (() => { const o = document.createElement('div'); o.id = 'hdCal'; o.className = 'hd-cal'; document.body.appendChild(o); return o; })();
      ov.innerHTML = `<div class="hd-card"><h2>${camErr ? 'Chưa mở được camera' : 'Chưa tải được bộ nhận diện'}</h2><p>${camErr ? 'Ba mẹ cho phép trình duyệt dùng camera (biểu tượng ổ khoá cạnh địa chỉ web), rồi bấm lại nút 🙆.' : 'Máy cần mạng ổn định để tải bộ nhận diện khuôn mặt lần đầu (khoảng 4 MB). Ba mẹ thử lại sau ít phút.'} Con vẫn chạm để chơi bình thường.</p><button class="btn g" id="hdOk">Đã hiểu</button></div>`;
      $('#hdOk').onclick = () => ov.remove();
    }
    starting = false;
  }
  function stop() { on = false; calib = null; cancelAnimationFrame(raf); setAim(-1, 0); setTimeout(mirror, 0);
    if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; const cam = $('#hdCam'); cam && cam.remove(); sset('sdl-head', false); btn(); }
  function consent() {
    if (sget('sdl-head-ok', false)) return start(!sign);
    const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal';
    ov.innerHTML = `<div class="hd-card"><div class="hd-ic">🙆</div><h2>Chơi bằng đầu</h2>
      <p>Con quay đầu sang <b>trái</b> ⬅️, sang <b>phải</b> ➡️ hoặc <b>ngửa đầu lên</b> ⬆️ để chọn, giữ một chút là chọn.</p>
      <p><small>Web dùng camera trước của máy này để nhận ra con quay đầu. Hình ảnh chỉ xử lý ngay trên máy, <b>không ghi lại, không gửi đi</b>. Tắt bất cứ lúc nào bằng nút 🙆.</small></p>
      <div class="row" style="justify-content:center"><button class="btn g" id="hdYes">Ba mẹ đồng ý, bật camera</button><button class="ls-b" id="hdNo">Để sau</button></div></div>`;
    document.body.appendChild(ov);
    $('#hdNo').onclick = () => ov.remove();
    $('#hdYes').onclick = () => { ov.remove(); sset('sdl-head-ok', true); start(true); };
  }
  function btn() { const b = $('#hdBtn'); if (!b) return; b.textContent = on ? '🙆 Đang chơi bằng đầu (bấm để tắt)' : '🙆 Chơi bằng đầu'; b.classList.toggle('dark', on); }
  if (SIM) {
    addEventListener('keydown', e => { if (e.key === 'ArrowLeft') simPose = { yaw: .4 * (sign || 1), pitch: 0 }; if (e.key === 'ArrowRight') simPose = { yaw: -.4 * (sign || 1), pitch: 0 }; if (e.key === 'ArrowUp') simPose = { yaw: 0, pitch: -.2 }; });
    addEventListener('keyup', () => { simPose = { yaw: 0, pitch: 0 }; });
  }
  return { start, stop, consent, btn, mirror, get on() { return on; } };
})();
