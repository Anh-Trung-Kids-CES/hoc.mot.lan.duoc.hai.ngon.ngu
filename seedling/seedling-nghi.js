/* =====================================================================
   SEEDLING · NGHỈ MẮT VÀ GIỚI HẠN 30 PHÚT (nguyên tắc 47 và mục "Giữ nguyên":
   nhắc nghỉ mắt ở phút 25, không đoạn học nào quá 30 phút).
   - Chỉ đếm lúc con đang làm bài (màn bước của ngày web, Ôn nhanh, Reader) và trang đang mở trên màn hình.
   - Phút 25: hiện màn nghỉ mắt 20 giây (nhìn ra xa, chớp mắt), rồi học tiếp.
   - Phút 30: bước đang làm vẫn làm cho xong; khi con mở bước mới thì hiện màn nghỉ, đếm ngược 10 phút.
   - Con rời màn bài từ 10 phút trở lên thì đồng hồ tính lại từ 0.
   - Máy chạy thử tự động (navigator.webdriver) hoặc link có ?nghi=0 thì không bật.
   ===================================================================== */
(function () {
  const OFF = navigator.webdriver || /[?&]nghi=0\b/.test(location.search);
  const EYE = 25 * 60e3, CAP = 30 * 60e3, REST = 10 * 60e3, TICK = 5e3, KEY = 'sdl-nghi';
  const st = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  st.ms = st.ms || 0; st.last = st.last || 0; st.eye = !!st.eye; st.stopAt = st.stopAt || 0;
  const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const lesson = () => /^#\/(ngay\/\d+\/b\d+|hop-on\/choi|reader)/.test(location.hash);
  const resting = () => st.stopAt && Date.now() - st.stopAt < REST;

  function tick() {
    if (OFF) return;
    const now = Date.now();
    if (st.last && now - st.last >= REST) { st.ms = 0; st.eye = false; st.stopAt = 0; }   /* đã nghỉ đủ */
    if (document.visibilityState === 'visible' && lesson() && !document.querySelector('.sdn-ov')) {
      st.ms += st.last && now - st.last < 2 * TICK ? now - st.last : TICK; st.last = now;
      if (!st.eye && st.ms >= EYE) { st.eye = true; keep(); eyeBreak(); }
      if (st.ms >= CAP && !st.stopAt) st.stopAt = now;   /* chặn ở lần mở bước kế tiếp */
    }
    keep();
  }

  function overlay(html) {
    const ov = document.createElement('div'); ov.className = 'sdn-ov';
    ov.innerHTML = `<div class="sdn-card">${html}</div>`; document.body.appendChild(ov); return ov;
  }
  function eyeBreak() {
    try { stopAll(); } catch (e) {}
    const ov = overlay(`<div class="sdn-eye">👀</div><h2>Nghỉ mắt một chút nhé!</h2>
      <p>Con nhìn ra cửa sổ, nhìn thật xa. Chớp mắt 10 lần.</p><b class="sdn-n" id="sdnN">20</b>
      <button class="btn g" id="sdnGo" hidden>Học tiếp ▶</button>`);
    let n = 20; const t = setInterval(() => { n--; const el = ov.querySelector('#sdnN'); if (el) el.textContent = n;
      if (n <= 0) { clearInterval(t); el && el.remove(); ov.querySelector('#sdnGo').hidden = false; } }, 1000);
    ov.querySelector('#sdnGo').onclick = () => ov.remove();
  }
  function restScreen() {
    try { stopAll(); } catch (e) {}
    const left = () => Math.max(0, Math.ceil((REST - (Date.now() - st.stopAt)) / 60e3));
    const ov = overlay(`<div class="sdn-eye">🌳</div><h2>Hôm nay con học đủ 30 phút rồi!</h2>
      <p>Con đứng dậy, vươn vai, đi uống nước nhé. Nghỉ <b id="sdnL">${left()}</b> phút nữa rồi con học tiếp.</p>
      <a class="btn g" href="#/" id="sdnHome">🏠 Về trang chủ</a>`);
    const t = setInterval(() => { const el = ov.querySelector('#sdnL'); if (!document.body.contains(ov)) return clearInterval(t);
      if (!resting()) { clearInterval(t); st.ms = 0; st.eye = false; st.stopAt = 0; keep(); ov.remove(); return; } if (el) el.textContent = left(); }, 15e3);
    ov.querySelector('#sdnHome').onclick = () => ov.remove();
  }

  /* chặn mở bước mới khi đã quá 30 phút; bước đang làm thì cho làm xong */
  if (!OFF && typeof startStep === 'function') {
    const orig = startStep;
    startStep = function (skipRules) { if (resting() && !document.querySelector('.sdn-ov')) return restScreen(); return orig(skipRules); };
  }
  if (!OFF) { setInterval(tick, TICK); document.addEventListener('visibilitychange', tick);
    window.addEventListener('hashchange', () => { if (lesson() && resting() && !document.querySelector('.sdn-ov')) setTimeout(restScreen, 50); }); }
  window.SDN = { st, eyeBreak, restScreen };
})();
