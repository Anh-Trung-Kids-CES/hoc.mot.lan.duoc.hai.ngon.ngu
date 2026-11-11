/* =====================================================================
   GÓC VINH DANH · video các bạn làm bài tốt (dùng chung cho web Little Seed và Seedling)
   - Cô thả video vào thư mục Drive của lớp (ID ở tab CaiDat, cột video_folder). Máy chủ đọc thư mục,
     nhớ danh sách 5 phút → video mới hiện trên web chậm nhất khoảng 5 phút. Ai mở web cũng xem được.
   - Tên tệp: "Bông – đọc truyện Unit 2.mp4". Thêm mã con trong ngoặc vuông để con thấy huy hiệu
     "Video của con": "Bông [ZTK2A7] – đọc truyện Unit 2.mp4".
   - Bố cục: màn rộng (≥1180px, ngoài bài học) → cột trái cạnh thanh nút; màn vừa và trong lúc làm bài →
     dải hẹp, chạm để mở; điện thoại dọc → nút 🌟 nổi, mở toàn màn hình. Video phát bằng trình phát của Drive.
   ===================================================================== */
(function () {
  if (typeof api !== 'function' || typeof API_ON === 'undefined' || !API_ON) return;   // bản xem thử: không có Góc vinh danh
  const K = (typeof KEY === 'string' ? KEY : 'sdl') + '-vd';
  const VD = { items: [], start: '', open: false, cur: -1, timer: 0, ok: false };
  const ls = { get(k, d) { try { const v = localStorage.getItem(K + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} } };
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DAY = 864e5, WEEK = 7 * DAY;
  const dd = t => { const d = new Date(t); return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2); };
  const midnight = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  function startMs() { const m = String(VD.start || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0; }
  /* tuần: tính từ ngày khai giảng (nếu cô điền), không thì theo tuần lịch thứ Hai → Chủ nhật */
  function weekOf(t) {
    const s = startMs(), day = midnight(t);
    if (s && day >= s) { const n = Math.floor((day - s) / WEEK) + 1, a = s + (n - 1) * WEEK; return { key: 'w' + n, label: 'Tuần ' + n, range: dd(a) + ' – ' + dd(a + 6 * DAY), a }; }
    const d = new Date(day), mon = day - ((d.getDay() + 6) % 7) * DAY;
    return { key: 'c' + mon, label: s ? 'Trước khai giảng' : 'Tuần', range: dd(mon) + ' – ' + dd(mon + 6 * DAY), a: mon };
  }
  const watched = () => ls.get('-xem', []);
  const isNew = it => Date.now() - it.t < WEEK && !watched().includes(it.id);
  const mine = it => !!it.kid && typeof P === 'object' && P && P.kidId === it.kid;
  const thumb = id => 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(id) + '&sz=w480';

  /* ---------- khung trang ---------- */
  const col = document.createElement('aside'); col.className = 'vd'; col.id = 'vd'; col.setAttribute('aria-label', 'Góc vinh danh');
  const rail = document.createElement('button'); rail.type = 'button'; rail.className = 'vd-rail'; rail.setAttribute('aria-label', 'Mở Góc vinh danh');
  const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'vd-fab'; fab.setAttribute('aria-label', 'Mở Góc vinh danh');
  const back = document.createElement('div'); back.className = 'vd-back';
  document.body.append(col, rail, fab, back);
  rail.onclick = fab.onclick = () => setOpen(true);
  back.onclick = () => setOpen(false);

  function inLesson() { return /^#\/(ngay|co|hop-on\/choi)/.test(location.hash || ''); }
  function phone() { return matchMedia('(orientation:portrait) and (max-width:820px)').matches; }
  function wideOk() { return innerWidth >= 1180 && innerHeight >= 560 && !inLesson() && !ls.get('-gon', false) && !phone(); }
  function layout() {
    const b = document.body.classList, on = VD.ok;
    b.toggle('vd-wide', on && wideOk());
    b.toggle('vd-mini', on && !wideOk() && !phone());
    b.toggle('vd-phone', on && phone());
    if (wideOk() && VD.open) setOpen(false, true);
    col.classList.toggle('drawer', !wideOk());
  }
  function setOpen(v, quiet) {
    VD.open = v; col.classList.toggle('open', v); back.classList.toggle('on', v);
    if (v && !quiet) draw();
  }
  addEventListener('resize', layout); addEventListener('hashchange', () => { setOpen(false, true); layout(); });

  /* ---------- vẽ cột ---------- */
  function groups(list) {
    const g = []; list.forEach((it, i) => { const w = weekOf(it.t); let x = g[g.length - 1];
      if (!x || x.key !== w.key) g.push(x = Object.assign({ list: [] }, w)); x.list.push(i); });
    return g;
  }
  function card(i, big) {
    const it = VD.items[i];
    return `<button type="button" class="vd-card${big ? ' big' : ''}${mine(it) ? ' mine' : ''}" data-vd="${i}">
      <span class="vd-th"><img src="${thumb(it.id)}" alt="" loading="lazy" onerror="this.remove()"><span class="vd-tri"></span>
        ${isNew(it) ? '<span class="vd-new">Mới</span>' : ''}${mine(it) ? '<span class="vd-mine">Video của con 🌟</span>' : ''}</span>
      <span class="vd-cap"><b>${h(it.ten || 'Bạn nhỏ')}</b>${it.bai ? `<span>${h(it.bai)}</span>` : ''}<small>${dd(it.t)}</small></span></button>`;
  }
  function draw() {
    const nNew = VD.items.filter(isNew).length;
    const badge = nNew ? `<span class="vd-badge">${nNew}</span>` : '';
    rail.innerHTML = `<span class="vd-star">🌟</span><span class="vd-rt">Vinh danh</span>${badge}`;
    fab.innerHTML = `🌟${badge}`;
    const g = groups(VD.items);
    col.innerHTML = `<div class="vd-hd"><div><b>🌟 Góc vinh danh</b><span>Video các bạn làm bài tốt</span></div>
        <button type="button" class="vd-gon" aria-label="${wideOk() ? 'Thu gọn' : 'Đóng'}">${wideOk() ? '«' : '✕'}</button></div>
      <div class="vd-list">${VD.items.length ? g.map(w => `<h4 class="vd-wk">${h(w.label)} <small>${w.range}</small></h4>${w.list.map(i => card(i)).join('')}`).join('')
        : '<p class="vd-empty">Cô sẽ đăng video các bạn làm bài tốt ở đây mỗi tuần. Con chăm làm bài để được lên Góc vinh danh nhé!</p>'}</div>
      ${VD.items.length ? `<button type="button" class="vd-allbtn">📼 Album cả khoá · ${VD.items.length} video</button>` : ''}`;
    col.querySelectorAll('[data-vd]').forEach(b => b.onclick = () => play(+b.dataset.vd));
    col.querySelector('.vd-gon').onclick = () => { if (wideOk()) { ls.set('-gon', true); layout(); draw(); } else setOpen(false); };
    const all = col.querySelector('.vd-allbtn'); if (all) all.onclick = album;
  }
  /* màn rộng đã thu gọn: chạm dải hẹp thì mở lại cột cố định */
  rail.addEventListener('click', () => { if (ls.get('-gon', false) && innerWidth >= 1180 && !inLesson()) { ls.set('-gon', false); setOpen(false, true); layout(); draw(); } });

  /* ---------- trình phát ---------- */
  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') closePop(); if (e.key === 'ArrowRight' && pop) step(1); if (e.key === 'ArrowLeft' && pop) step(-1); }
  function step(d) { const n = VD.cur + d; if (n >= 0 && n < VD.items.length) play(n); }
  function play(i) {
    const it = VD.items[i]; if (!it) return; VD.cur = i;
    try { if (typeof stopAll === 'function') stopAll(); } catch (e) {}
    const w = watched(); if (!w.includes(it.id)) { w.push(it.id); ls.set('-xem', w.slice(-500)); }
    const wk = weekOf(it.t);
    closePop(); pop = document.createElement('div'); pop.className = 'vd-pop';
    pop.innerHTML = `<div class="vd-box" role="dialog" aria-label="Video của ${h(it.ten)}">
      <div class="vd-ptop"><div><b>${h(it.ten || 'Bạn nhỏ')}</b>${it.bai ? ` · ${h(it.bai)}` : ''}<small>${h(wk.label)} · ${dd(it.t)}</small></div>
        ${mine(it) ? '<span class="vd-mine on">Video của con 🌟</span>' : ''}<button type="button" class="vd-close" aria-label="Đóng">✕</button></div>
      <div class="vd-frame"><iframe src="https://drive.google.com/file/d/${encodeURIComponent(it.id)}/preview" allow="autoplay; fullscreen" allowfullscreen title="Video của ${h(it.ten)}"></iframe></div>
      <div class="vd-nav"><button type="button" class="ls-b" data-st="-1" ${i <= 0 ? 'disabled' : ''}>‹ Video mới hơn</button>
        <span>${i + 1} / ${VD.items.length}</span><button type="button" class="ls-b" data-st="1" ${i >= VD.items.length - 1 ? 'disabled' : ''}>Video trước đó ›</button></div></div>`;
    document.body.appendChild(pop);
    pop.onclick = e => { if (e.target === pop) closePop(); };
    pop.querySelector('.vd-close').onclick = closePop;
    pop.querySelectorAll('[data-st]').forEach(b => b.onclick = () => step(+b.dataset.st));
    document.addEventListener('keydown', onKey);
    draw();
  }
  /* ---------- album cả khoá ---------- */
  function album() {
    closePop(); setOpen(false, true);
    pop = document.createElement('div'); pop.className = 'vd-pop vd-album';
    const g = groups(VD.items);
    pop.innerHTML = `<div class="vd-box"><div class="vd-ptop"><div><b>📼 Album cả khoá</b><small>${VD.items.length} video · từ mới đến cũ</small></div>
        <button type="button" class="vd-close" aria-label="Đóng">✕</button></div>
      <div class="vd-agrid">${g.map(w => `<section><h4 class="vd-wk">${h(w.label)} <small>${w.range} · ${w.list.length} video</small></h4>
        <div class="vd-arow">${w.list.map(i => card(i, true)).join('')}</div></section>`).join('')}</div></div>`;
    document.body.appendChild(pop);
    pop.onclick = e => { if (e.target === pop) closePop(); };
    pop.querySelector('.vd-close').onclick = closePop;
    pop.querySelectorAll('[data-vd]').forEach(b => b.onclick = () => play(+b.dataset.vd));
    document.addEventListener('keydown', onKey);
  }

  /* ---------- lấy danh sách ---------- */
  async function load() {
    const r = await api({ action: 'video' });
    if (!r || !r.ok || !Array.isArray(r.items)) { if (!VD.ok) return; }   // máy chủ chưa có lệnh video: giữ ẩn
    else { VD.items = r.items; VD.start = r.start || ''; VD.ok = true; }
    layout(); draw();
  }
  load(); setInterval(load, 300000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') load(); });
  window.VD_GOC = VD;   // để kiểm thử
})();
