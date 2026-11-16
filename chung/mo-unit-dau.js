/* =====================================================================
   MỞ UNIT ĐẦU · NHẮC ĐĂNG NHẬP (dùng chung Little Seed + Seedling) · chị quyết 16/11/2026
   - Unit đầu tiên (chặng đầu của bản đồ: tuần 1–3, ngày web 1–9) luôn mở: con không cần tài khoản cũng học được.
     Thứ tự mở ngày trong unit vẫn như cũ (học xong ngày trước mới mở ngày sau).
   - Từ unit thứ hai (và reader của các unit đó): con phải đăng nhập (có mã của con, máy đã nhập PIN nếu con có PIN).
     Chưa đăng nhập → hiện thông báo: nhập mã của con, hoặc liên hệ CES qua hotline để lấy mã và PIN.
   - Cô giáo (?gv=1) và bản xem thử không có máy chủ: mở hết như cũ.
   - Chạy SAU các file *-bai-moi.js, *-reader.js (thay viewDay, viewReader).
   ===================================================================== */
(function () {
  const HOTLINE = '0974.840.845', TEL = 'tel:0974840845';
  const first = (SD.map && SD.map[0]) || { items: [] };
  const FREE_DAYS = new Set(first.items.filter(x => x[0] === 'day').map(x => +x[1]));
  const FREE_UNITS = new Set([...FREE_DAYS].map(n => SD.days[n] && String(SD.days[n].unit)).filter(Boolean));
  const DN = KEY + '-dang-nhap';   // mã con đã được máy chủ xác nhận trên máy này
  const ok0 = () => { try { return sget(DN, '') || ''; } catch (e) { return ''; } };
  const setOk = id => { try { sset(DN, id || ''); } catch (e) {} };
  const isGV = () => { try { return !!GV; } catch (e) { return false; } };

  function loggedIn() { if (isGV() || !API_ON) return true; const id = P.kidId || ''; return !!id && ok0() === id; }
  /* hỏi máy chủ: mã có thật không, máy này đã nhập PIN chưa (nếu cần PIN, tai-khoan-con.js tự hiện ô nhập PIN) */
  async function verify(id) {
    if (!id) return { ok: false };
    const r = await api({ action: 'kid', id });
    if (r && r.ok && r.kid) { setOk(id); return { ok: true }; }
    if (r && r.ok && !r.kid) { setOk(''); return { ok: false, err: 'Chưa tìm thấy mã này. Ba mẹ kiểm tra lại thẻ của con nhé.' }; }
    if (r && r.net) return { ok: false, net: true, err: 'Chưa nối được máy chủ. Kiểm tra mạng rồi thử lại nhé.' };
    if (r && (r.need === 'pin' || r.need === 'duyet')) { setOk(''); return { ok: false, err: r.need === 'duyet' ? 'Máy này đang chờ cô duyệt.' : 'Con cần nhập PIN 4 số để học ở máy này.' }; }
    return { ok: false, err: (r && r.err) || 'Chưa đăng nhập được, thử lại nhé.' };
  }

  /* ---------- thông báo nhắc đăng nhập ---------- */
  function css() {
    if (document.getElementById('mu-css')) return; const s = document.createElement('style'); s.id = 'mu-css';
    s.textContent = `.mu-ov{position:fixed;inset:0;z-index:99990;background:rgba(40,30,10,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.mu-box{background:#fff;border:4px solid #1FA5A0;border-radius:22px;max-width:380px;width:100%;padding:20px 18px;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.3);font-family:inherit;max-height:92vh;overflow:auto}
.mu-box h3{margin:0 0 6px;font-size:20px;line-height:1.3}.mu-box p{margin:6px 0;font-size:14px;line-height:1.5}
.mu-in{font-size:22px;letter-spacing:3px;text-align:center;width:100%;box-sizing:border-box;border:3px solid #ccc;border-radius:14px;padding:10px;margin:8px 0 2px;text-transform:uppercase}
.mu-btn{display:block;width:100%;margin-top:8px;border:0;border-radius:14px;padding:12px;font-size:16px;font-weight:800;background:#1FA5A0;color:#fff;cursor:pointer;text-decoration:none;box-sizing:border-box}
.mu-btn.call{background:#E3262E}.mu-btn.o{background:#fff;color:#555;border:2px solid #ddd;font-weight:600}
.mu-err{color:#C0392B;font-weight:700;min-height:1.3em;font-size:14px}
.mu-hot{background:#FFF8E6;border:2px dashed #F5D58A;border-radius:14px;padding:10px;margin-top:12px}.mu-hot b{font-size:18px;letter-spacing:.5px}`;
    document.head.appendChild(s);
  }
  let ov = null;
  const close = () => { if (ov) { ov.remove(); ov = null; } };
  function gate(then, why) {
    css(); close(); try { sfx.no(); } catch (e) {}
    const id = P.kidId || '';
    ov = document.createElement('div'); ov.className = 'mu-ov'; ov.dataset.h = location.hash;
    ov.innerHTML = `<div class="mu-box" role="dialog" aria-modal="true" aria-labelledby="muT">
      <h3 id="muT">🔐 Ba mẹ đăng nhập để con học tiếp nhé</h3>
      <p><b>Unit 1</b> mở cho mọi bạn. Từ <b>${esc(why || 'unit này')}</b> trở đi, con cần <b>mã của con</b> và <b>PIN</b> do CES cấp để web lưu bài và sao của con.</p>
      <input class="mu-in" id="muId" type="text" inputmode="text" autocomplete="off" maxlength="12" placeholder="Mã của con" aria-label="Mã của con" value="${esc(id)}">
      <div class="mu-err" id="muErr"></div>
      <button class="mu-btn" id="muOk" type="button">Đăng nhập</button>
      <div class="mu-hot"><p>Chưa có mã hoặc quên PIN?<br>Ba mẹ liên hệ <b>CES</b> để lấy mã và PIN cho con:</p>
        <p>Hotline <b>${HOTLINE}</b></p><a class="mu-btn call" href="${TEL}">📞 Gọi ${HOTLINE}</a></div>
      <button class="mu-btn o" id="muBack" type="button">Về Unit 1</button></div>`;
    document.body.appendChild(ov);
    const inp = ov.querySelector('#muId'), err = ov.querySelector('#muErr'), okB = ov.querySelector('#muOk');
    setTimeout(() => { if (!id) inp.focus(); }, 60);
    const go = async () => {
      const v = inp.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (v.length < 4) { err.textContent = 'Ba mẹ nhập mã in trên thẻ của con nhé.'; return; }
      okB.disabled = true; err.textContent = 'Đang kiểm tra…';
      close();   // để ô nhập PIN (nếu có) hiện rõ
      const r = await verify(v);   // kiểm mã trước, chưa đổi tiến độ trên máy (gõ nhầm mã không làm mất bài con đã học)
      if (r.ok) { if (P.kidId !== v) clSwitch(v); try { toast('Đã đăng nhập. Web đang lấy bài và sao của con…'); clPull().then(() => coSync(true)); } catch (e) {} return then(); }
      gate(then, why); const e2 = ov && ov.querySelector('#muErr'); if (e2) e2.textContent = r.err || '';
    };
    okB.onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    ov.querySelector('#muBack').onclick = () => { close(); location.hash = '#/ban-do/' + (first.key || ''); };
  }

  /* đã có mã trên máy nhưng chưa được xác nhận (máy mới, vừa đổi bản…) → hỏi máy chủ trước, rồi mới hiện thông báo */
  async function need(then, why) {
    if (loggedIn()) return then();
    const id = P.kidId || '';
    if (id) { const r = await verify(id); if (r.ok) return then();
      if (r.net) { try { toast('Chưa nối được máy chủ 📶 Kiểm tra mạng rồi mở lại ngày này nhé.'); } catch (e) {} location.hash = '#/ban-do'; return; } }
    gate(then, why);
  }

  /* ---------- chặn ngày web và reader ngoài unit đầu ---------- */
  const unitName = d => (d && d.unit !== 'Ôn') ? 'Unit ' + d.unit : 'phần ôn tập';
  const _viewDay = viewDay;
  viewDay = function (n, sub) {
    if (FREE_DAYS.has(+n) || loggedIn() || !SD.days[n] || (typeof dayOpen === 'function' && !dayOpen(+n))) return _viewDay(n, sub);
    try { stopAll(); } catch (e) {}
    const here = location.hash;
    need(() => { if (location.hash === here) _viewDay(n, sub); else location.hash = here; }, unitName(SD.days[n]));
  };
  if (typeof viewReader === 'function') {
    const _viewReader = viewReader;
    viewReader = function (u, i) {
      if (FREE_UNITS.has(String(u)) || loggedIn()) return _viewReader(u, i);
      const here = location.hash;
      need(() => { if (location.hash === here) _viewReader(u, i); else location.hash = here; }, 'Unit ' + u);
    };
  }
  /* bỏ thông báo khi con rời màn */
  window.addEventListener('hashchange', () => { if (ov && ov.dataset.h !== location.hash) close(); });
  /* máy đã đăng nhập: thầm kiểm lại một lần mỗi lần mở web (PIN bị cô đổi, máy bị gỡ…) */
  if (API_ON && P.kidId && ok0() === P.kidId) setTimeout(() => { api({ action: 'kid', id: P.kidId }).then(r => { if (r && r.need) setOk(''); }); }, 4000);

  window.MoUnitDau = { loggedIn, FREE_DAYS, FREE_UNITS, HOTLINE };
  /* web đã vẽ màn đầu trước khi file này chạy: vẽ lại nếu đang mở một ngày/reader */
  if (/^#\/(ngay|reader)\//.test(location.hash) && !document.querySelector('.splash')) route();
})();
