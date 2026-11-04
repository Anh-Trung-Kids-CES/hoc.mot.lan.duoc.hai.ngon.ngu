/* Lớp Zoom – "Chơi bằng đầu": con quay đầu sang trái / phải hoặc ngửa đầu lên để chọn 1 trong 3 tranh.
   Dùng camera trước của máy web và MediaPipe Face Landmarker (Apache-2.0, để sẵn trong vendor/mediapipe).
   Hình ảnh camera chỉ xử lý ngay trên máy, không ghi lại, không gửi đi đâu.
   Áp dụng cho mọi câu chọn 1 trong 3 tranh: Ôn nhanh, Đôi bạn, Cô giáo nhỏ, Đấu Rồng Lửa. Chạm tranh vẫn dùng được như cũ.
   Thử không cần camera: thêm ?headsim=1 (phím ← → ↑ thay cho quay đầu). */

const HEAD_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const HEAD = (() => {
  const SIM = QS.has('headsim'), HOLD = 650, TH_Y = 0.17, TH_P = 0.10;
  let on = false, starting = false, video = null, stream = null, lm = null, raf = 0, last = 0;
  let base = { yaw: 0, pitch: 0, n: 0 }, sign = +lsGet('lz-head-sign', 0) || 0;
  let holdDir = '', holdT = 0, needNeutral = false, calib = null, simPose = { yaw: 0, pitch: 0 }, faceSeen = false;

  /* ---------- tư thế đầu từ các điểm trên mặt ---------- */
  function pose(L) {
    const n = L[1], le = L[33], re = L[263], top = L[10], ch = L[152];
    const ed = Math.hypot(re.x - le.x, re.y - le.y) || 1e-3, fh = Math.abs(ch.y - top.y) || 1e-3;
    return { yaw: (n.x - (le.x + re.x) / 2) / ed, pitch: (n.y - (top.y + ch.y) / 2) / fh };
  }
  async function loadModel() {
    const vision = await import(new URL('vendor/mediapipe/vision_bundle.mjs', location.href).href);
    const files = await vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href);
    const mk = (path, delegate) => vision.FaceLandmarker.createFromOptions(files, { baseOptions: { modelAssetPath: path, delegate }, runningMode: 'VIDEO', numFaces: 1 });
    for (const path of [new URL('vendor/mediapipe/face_landmarker.task', location.href).href, HEAD_MODEL]) {
      for (const d of ['GPU', 'CPU']) { try { lm = await mk(path, d); return; } catch (e) { } }
    }
    throw new Error('Không tải được bộ nhận diện khuôn mặt');
  }
  async function startCam() {
    if (SIM) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } }, audio: false });
    video = $('#hdVid'); video.srcObject = stream; await video.play().catch(() => { });
  }

  /* ---------- vòng nhận diện ---------- */
  function tick() {
    raf = requestAnimationFrame(tick);
    const t = performance.now(); if (t - last < 66) return; last = t;
    let p = null;
    if (!calib && !headAllowed((typeof room !== 'undefined' && room.state) || {})) { holdDir = ''; setAim(-1, 0); undecorate(); return; }   // phần này chạm: không chạy nhận diện cho đỡ tốn pin
    if (SIM) p = simPose;
    else if (lm && video && video.readyState >= 2) { try { const r = lm.detectForVideo(video, t); if (r.faceLandmarks && r.faceLandmarks[0]) p = pose(r.faceLandmarks[0]); } catch (e) { } }
    faceSeen = !!p; const box = $('#hdCam'); box && box.classList.toggle('noface', !p);
    if (!p) { setAim(-1, 0); holdDir = ''; return; }
    if (base.n < 8) { base.yaw = (base.yaw * base.n + p.yaw) / (base.n + 1); base.pitch = (base.pitch * base.n + p.pitch) / (base.n + 1); base.n++; return; }
    const dy = p.yaw - base.yaw, dp = p.pitch - base.pitch;
    let dir = '';
    if (Math.abs(dy) > TH_Y) dir = dy * (sign || 1) > 0 ? 'L' : 'R';
    else if (Math.abs(dp) > TH_P) dir = 'U';
    else { base.yaw += (p.yaw - base.yaw) * .04; base.pitch += (p.pitch - base.pitch) * .04; }   // tư thế thẳng thay đổi chậm theo thời gian
    if (calib) return calibStep(dir, dy, t);
    if (!headAllowed((typeof room !== 'undefined' && room.state) || {})) { holdDir = ''; setAim(-1, 0); undecorate(); return; }
    handle(dir, t);
  }
  const IDX = { L: 0, U: 1, R: 2 };
  function picks() {
    const b = $('#bq'); if (b && b.dataset.lock) return [];
    const a = $$('#pics:not(.locked) .pick'); return a.length === 3 ? a : [];
  }
  function setAim(i, f) {
    $$('.pick.aim').forEach((x, j) => { if (j !== i || !x.isConnected) { x.classList.remove('aim'); x.style.removeProperty('--hold'); } });
    const a = picks(); if (i < 0 || !a[i]) return;
    a[i].classList.add('aim'); a[i].style.setProperty('--hold', Math.min(1, f).toFixed(2));
  }
  function undecorate() { $$('.pick[data-hd]').forEach(x => delete x.dataset.hd); }
  function decorate() {
    picks().forEach((x, i) => { if (!x.dataset.hd) x.dataset.hd = ['⬅️', '⬆️', '➡️'][i]; });
  }
  function handle(dir, t) {
    decorate();
    const a = picks();
    if (needNeutral) { if (!dir) needNeutral = false; setAim(-1, 0); return; }
    if (!a.length || !dir) { holdDir = ''; setAim(-1, 0); return; }
    if (dir !== holdDir) { holdDir = dir; holdT = t; }
    const f = (t - holdT) / HOLD, i = IDX[dir];
    setAim(i, f);
    if (f >= 1) { needNeutral = true; holdDir = ''; setAim(-1, 0); a[i].click(); }
  }

  /* ---------- tập quay đầu lần đầu (cũng để biết hướng trái/phải của camera máy này) ---------- */
  const STEPS = [
    { k: 'L', t: 'Con quay đầu sang bên TRÁI nhé!', ic: '⬅️' },
    { k: 'R', t: 'Giờ con quay đầu sang bên PHẢI!', ic: '➡️' },
    { k: 'U', t: 'Con ngửa đầu nhìn lên trời nào!', ic: '⬆️' }
  ];
  function calibShow() {
    const s = STEPS[calib.i], ov = $('#hdCal'); if (!ov) return;
    ov.innerHTML = `<div class="hd-card"><div class="hd-ic">${s.ic}</div><h2>${s.t}</h2>
      <div class="hd-prog"><i id="hdProg"></i></div><p class="small vn">${faceSeen || SIM ? 'Con giữ yên một chút…' : 'Con nhìn thẳng vào máy để máy thấy mặt con nhé.'}</p>
      <button class="btn ghost" id="hdSkip" style="font-size:15px">Bỏ qua, chơi bằng chạm</button></div>`;
    $('#hdSkip').onclick = () => { stop(); ov.remove(); };
  }
  function calibStep(dir, dy, t) {
    const s = STEPS[calib.i];
    let hit = false;
    if (s.k === 'L' && Math.abs(dy) > TH_Y) hit = true;
    if (s.k === 'R' && Math.abs(dy) > TH_Y && Math.sign(dy) === -calib.sign) hit = true;
    if (s.k === 'U' && dir === 'U') hit = true;
    if (!hit) { calib.t0 = 0; const pr = $('#hdProg'); pr && (pr.style.width = '0%'); if (!calib.shown) { calib.shown = 1; calibShow(); } return; }
    if (!calib.t0) calib.t0 = t;
    const f = (t - calib.t0) / 500, pr = $('#hdProg'); pr && (pr.style.width = Math.min(100, f * 100) + '%');
    if (f < 1) return;
    if (s.k === 'L') { calib.sign = Math.sign(dy); sign = calib.sign; lsSet('lz-head-sign', sign); }
    SND.beep('ok'); calib.i++; calib.t0 = 0; calib.shown = 0; needNeutral = true;
    if (calib.i >= STEPS.length) { calib = null; const ov = $('#hdCal'); ov && ov.remove(); lsSet('lz-head', true); toastHead('🙆 Xong rồi! Con quay đầu để chọn tranh nhé. Giữ một chút cho vòng sáng đầy là chọn.'); return; }
    calibShow();
  }
  function toastHead(t) { let el = $('#hdToast'); if (!el) { el = document.createElement('div'); el.id = 'hdToast'; el.className = 'msg hd-toast'; document.body.appendChild(el); } el.textContent = t; el.style.display = 'block'; clearTimeout(el._t); el._t = setTimeout(() => el.style.display = 'none', 4500); }

  /* ---------- bật / tắt ---------- */
  async function start(withCalib) {
    if (on || starting) return; starting = true;
    let cam = $('#hdCam');
    if (!cam) { cam = document.createElement('div'); cam.id = 'hdCam'; cam.className = 'hd-cam noface'; cam.innerHTML = `<video id="hdVid" playsinline muted></video><span>🙆</span>`; document.body.appendChild(cam); }
    if (withCalib) { const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal'; ov.innerHTML = '<div class="hd-card"><h2>Đang mở camera…</h2><p class="small vn">Lần đầu có thể mất vài giây.</p></div>'; document.body.appendChild(ov); }
    try {
      await startCam();
      if (!SIM) await loadModel();
      on = true; base = { yaw: 0, pitch: 0, n: 0 }; needNeutral = true;
      if (withCalib || !sign) { calib = { i: 0, sign: 0, t0: 0 }; if (!$('#hdCal')) { const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal'; document.body.appendChild(ov); } calibShow(); }
      tick(); btn();
    } catch (e) {
      console.error(e); stop();
      if (!withCalib) toastHead('Chưa mở được camera để chơi bằng đầu. Con chạm tranh để chơi nhé, hoặc bấm nút 🙆 để thử lại.');
      const cam = e && /NotAllowed|NotFound|NotReadable|Overconstrained|Security/.test(e.name || '');
      const ov = $('#hdCal'); if (ov) ov.innerHTML = cam ? `<div class="hd-card"><h2>Chưa mở được camera</h2><p class="vn">Ba mẹ cho phép trình duyệt dùng camera (biểu tượng ổ khoá cạnh địa chỉ web), rồi bấm lại nút 🙆. Con vẫn chạm tranh để chơi bình thường.</p></div>`
        : `<div class="hd-card"><h2>Chưa tải được bộ nhận diện</h2><p class="vn">Máy cần mạng ổn định để tải bộ nhận diện khuôn mặt lần đầu (khoảng 4 MB). Ba mẹ thử lại nút 🙆 sau ít phút. Con vẫn chạm tranh để chơi bình thường.</p></div>`;
      if (ov) { ov.innerHTML = ov.innerHTML.replace(/<\/div>$/, '') + '<button class="btn" id="hdOk">Đã hiểu</button></div>'; $('#hdOk').onclick = () => ov.remove(); }
    }
    starting = false;
  }
  function stop() {
    on = false; calib = null; cancelAnimationFrame(raf); setAim(-1, 0);
    if (stream) stream.getTracks().forEach(t => t.stop()); stream = null;
    const cam = $('#hdCam'); cam && cam.remove(); lsSet('lz-head', false); btn();
  }
  function consent() {
    const ov = document.createElement('div'); ov.id = 'hdCal'; ov.className = 'hd-cal';
    ov.innerHTML = `<div class="hd-card"><div class="hd-ic">🙆</div><h2>Chơi bằng đầu</h2>
      <p class="vn">Con quay đầu sang <b>trái</b> ⬅️, sang <b>phải</b> ➡️ hoặc <b>ngửa đầu lên</b> ⬆️ để chọn tranh, giữ một chút là chọn.</p>
      <p class="vn small">Web dùng camera trước của máy này để nhận ra con quay đầu. Hình ảnh chỉ xử lý ngay trên máy, <b>không ghi lại, không gửi đi</b>. Tắt bất cứ lúc nào bằng nút 🙆 trên thanh đỏ.</p>
      <div class="ctl" style="justify-content:center;display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="hdYes">Ba mẹ đồng ý, bật camera</button><button class="btn ghost" id="hdNo">Để sau</button></div></div>`;
    document.body.appendChild(ov);
    $('#hdNo').onclick = () => ov.remove();
    $('#hdYes').onclick = () => { ov.remove(); SND.unlock(); start(true); };
  }
  function btn() {
    const b = $('#hdBtn'); if (!b) return;
    b.textContent = on ? '🙆 Đang bật' : '🙆 Chơi bằng đầu'; b.classList.toggle('y', on);
  }
  /* gọi sau khi con vào lớp */
  function boot() {
    if (CHIEU || $('#hdBtn')) return;
    const b = document.createElement('button'); b.id = 'hdBtn'; b.className = 'pill'; b.type = 'button';
    $('#topInfo').prepend(b); btn();
    b.onclick = () => on ? stop() : consent();
    if (lsGet('lz-head', false)) start(false);   // đã bật ở lần trước: tự mở lại camera (trình duyệt đã nhớ quyền)
  }
  if (SIM) {
    addEventListener('keydown', e => { if (e.key === 'ArrowLeft') simPose = { yaw: .4 * (sign || 1), pitch: 0 }; if (e.key === 'ArrowRight') simPose = { yaw: -.4 * (sign || 1), pitch: 0 }; if (e.key === 'ArrowUp') simPose = { yaw: 0, pitch: -.2 }; });
    addEventListener('keyup', () => { simPose = { yaw: 0, pitch: 0 }; });
  }
  /* gọi mỗi lần màn bé vẽ lại: nhắc con khi sang phần chơi bằng đầu */
  let lastPh = '', nudged = {};
  function phase(st) {
    const ok = headAllowed(st), cam = $('#hdCam');
    cam && cam.classList.toggle('idle', !ok);
    if (st.ph === lastPh) return; lastPh = st.ph;
    if (!ok) return;
    if (on) toastHead('🙆 Phần này con quay đầu để chọn tranh nhé!');
    else if (!nudged[st.ph] && $('#hdBtn')) { nudged[st.ph] = 1; toastHead('🙆 Phần này có thể chơi bằng đầu: ba mẹ bấm nút 🙆 trên thanh đỏ để bật camera. Con chạm tranh cũng được.'); }
  }
  return { boot, start, stop, phase, get on() { return on; } };
})();
