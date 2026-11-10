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
