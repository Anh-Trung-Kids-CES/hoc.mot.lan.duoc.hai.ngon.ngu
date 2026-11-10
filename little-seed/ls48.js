/* =====================================================================
   LITTLE SEED 48 BUỔI – chỉnh riêng cho con 4–5 tuổi (chạy sau ls-bai-moi.js)
   - Không hiện chữ cho con: chỉ tranh và tiếng. Cô (?gv=1) hoặc ba mẹ bấm "Ba mẹ xem chữ" thì thấy chữ.
   - Giọng ghép: a = "file1|file2" thì đọc nối các file (big book hai câu một trang).
   ===================================================================== */
(function () {
  const showText = () => GV || !!sget('lsd-chu', false);
  const apply = () => document.body.classList.toggle('khong-chu', !showText());
  apply();
  const btn = document.createElement('button');
  btn.className = 'ls-chubtn'; btn.type = 'button';
  const label = () => { btn.textContent = showText() ? 'Aa Ẩn chữ' : 'Aa Ba mẹ xem chữ'; };
  btn.onclick = () => { sset('lsd-chu', !sget('lsd-chu', false)); apply(); label(); };
  label(); document.body.appendChild(btn);
  const _say = say;
  say = async function (u) {
    if (u && typeof u.a === 'string' && u.a.indexOf('|') >= 0) {
      const my = RUN; for (const f of u.a.split('|')) { if (my !== RUN) return; await playFile(f); if (my !== RUN) return; await wait(180); } return;
    }
    return _say(u);
  };
})();

/* Câu có tên con (nguyên tắc 25): "___" trong truyện, big book thay bằng tên con; giọng "@ten" = đọc tên bằng giọng máy tiếng Việt. */
(function () {
  const name = () => (typeof P !== 'undefined' && P.name) ? P.name : '';
  const sub = o => { if (Array.isArray(o)) return o.forEach(sub); if (!o || typeof o !== 'object') return;
    for (const k of Object.keys(o)) { const v = o[k];
      if (typeof v === 'string' && v.indexOf('___') >= 0 && (k === 'en' || k === 'zh' || k === 't' || k === 'py')) {
        if (!o['_' + k]) o['_' + k] = v;
        const n = name(); o[k] = n ? o['_' + k].replace(/___/g, n) : o['_' + k].replace(/,? ?___,? ?|___，?/g, k === 'zh' ? '' : ' ').replace(/\s+([!?])/g, '$1').trim();
      } else if (v && typeof v === 'object') sub(v); } };
  window.lsTen = () => { sub(SD.days); sub(SD.reader); };
  lsTen(); window.addEventListener('hashchange', lsTen);
  const _say = say;
  say = async function (u) {
    if (u && typeof u.a === 'string' && u.a.indexOf('@ten') >= 0) {
      const my = RUN, n = name();
      for (const f of u.a.split('|')) { if (my !== RUN) return;
        if (f === '@ten') { if (n) { try { await tts(n, 'vi'); } catch (e) {} } }
        else { await playFile(f); }
        if (my !== RUN) return; await wait(120); }
      return;
    }
    return _say(u);
  };
})();
