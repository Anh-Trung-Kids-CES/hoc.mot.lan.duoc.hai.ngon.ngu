/* =====================================================================
   TÀI KHOẢN CỦA CON (dùng chung Little Seed + Seedling) · bản 5 của máy chủ lớp offline
   1) KidAuth.call(raw, q): thêm "mã máy" vào lệnh của con; nếu máy chủ báo con có PIN mà máy này chưa được nhớ
      thì hiện ô nhập PIN 4 số; máy thứ 3 trở đi thì hiện màn "chờ cô duyệt". Con chưa có PIN: không hiện gì.
   2) viewBang(): trang "Bảng của con" (#/bang) – con và ba mẹ cùng xem: sao, chuyên cần, mức tham gia từng buổi,
      và CHỈ những nhận xét cô chọn chia sẻ. Không có dữ liệu của bạn khác, không xếp hạng.
   ===================================================================== */
const KidAuth = (() => {
  const ACT = { kid: 1, hello: 1, redeem: 1, tai: 1, luu: 1, bang: 1 };
  let ov = null, busy = null, snoozeUntil = {};
  function dev() {
    try { let d = localStorage.getItem('sdl-dev'); if (!d || d.length < 8) { d = (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 24); localStorage.setItem('sdl-dev', d); } return d; }
    catch (e) { return (window.__sdlDev = window.__sdlDev || Math.random().toString(36).slice(2, 14) + Date.now().toString(36)); }
  }
  function ua() { const u = navigator.userAgent || ''; return (/iPad|iPhone/.test(u) ? 'iPhone/iPad' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'Máy khác'); }
  function css() {
    if (document.getElementById('ka-css')) return; const s = document.createElement('style'); s.id = 'ka-css';
    s.textContent = `.ka-ov{position:fixed;inset:0;z-index:99999;background:rgba(40,30,10,.55);display:flex;align-items:center;justify-content:center;padding:16px}
.ka-box{background:#fff;border:4px solid #F28C00;border-radius:22px;max-width:360px;width:100%;padding:20px 18px;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.3);font-family:inherit}
.ka-box h3{margin:0 0 6px;font-size:20px}.ka-box p{margin:6px 0;font-size:14px;line-height:1.45}
.ka-in{font-size:30px;letter-spacing:12px;text-align:center;width:9ch;border:3px solid #ccc;border-radius:14px;padding:8px 6px 8px 18px;margin:10px 0}
.ka-btn{display:block;width:100%;margin-top:8px;border:0;border-radius:14px;padding:12px;font-size:16px;font-weight:800;background:#F28C00;color:#fff;cursor:pointer}
.ka-btn.o{background:#fff;color:#555;border:2px solid #ddd;font-weight:600}.ka-hot{margin-top:12px!important;font-size:13px!important;color:#555}.ka-hot a{color:#E3262E;text-decoration:none}.ka-err{color:#C0392B;font-weight:700;min-height:1.3em}
.bg-wrap{max-width:760px;margin:0 auto;padding:12px}.bg-wrap h2{margin:4px 0}.bg-sub{color:#666;font-size:14px;margin:0 0 10px}
.bg-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:10px 0}
.bg-tile{background:#FFF8E6;border:2px solid #F5D58A;border-radius:16px;padding:10px;text-align:center}.bg-tile b{display:block;font-size:26px}.bg-tile span{font-size:13px;color:#555}
.bg-card{background:#fff;border:2px solid #eee;border-radius:16px;padding:12px;margin:10px 0}.bg-card h3{margin:0 0 8px;font-size:17px}
.bg-tbl{width:100%;border-collapse:collapse;font-size:14px}.bg-tbl th,.bg-tbl td{padding:6px 4px;white-space:nowrap;border-bottom:1px solid #eee;text-align:center}.bg-tbl td:first-child,.bg-tbl th:first-child{text-align:left}
.bg-sc{overflow-x:auto}.bg-note{border-left:4px solid #7CC576;background:#F3FAF1;border-radius:8px;padding:8px 10px;margin:8px 0}.bg-note small{color:#777;display:block}
.bg-note.ho_tro{border-color:#F28C00;background:#FFF8E6}.bg-bar{height:12px;background:#eee;border-radius:8px;overflow:hidden}.bg-bar i{display:block;height:100%;background:#7CC576}
.bg-foot{font-size:12px;color:#777;margin-top:12px}.bg-pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;background:#eee}.bg-pill.c{background:#DFF3DC}.bg-pill.t{background:#FFF1C9}.bg-pill.v{background:#FADBD8}.bg-pill.p{background:#E6E9F5}`;
    document.head.appendChild(s);
  }
  function show(html) { css(); if (ov) ov.remove(); ov = document.createElement('div'); ov.className = 'ka-ov'; ov.innerHTML = `<div class="ka-box" role="dialog" aria-modal="true">${html}</div>`; document.body.appendChild(ov); return ov; }
  function hide() { if (ov) { ov.remove(); ov = null; } }
  const esc2 = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function askPin(raw, id, ten, msg) {
    return new Promise(res => {
      const o = show(`<h3>🔐 Mã của ${esc2(ten || 'con')}</h3><p>Nhập <b>PIN 4 số</b> của con (cô đã đưa trên thẻ) để mở bài học ở máy này.</p>
        <input class="ka-in" id="kaPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="PIN 4 số"><div class="ka-err" id="kaErr">${esc2(msg || '')}</div>
        <button class="ka-btn" id="kaOk" type="button">Vào học</button><button class="ka-btn o" id="kaLater" type="button">Để sau</button>
        <p class="ka-hot">Quên PIN hoặc chưa có thẻ? Ba mẹ liên hệ CES:<br><a href="tel:0974840845"><b>📞 Hotline 0974.840.845</b></a></p>`);
      const inp = o.querySelector('#kaPin'), err = o.querySelector('#kaErr'); setTimeout(() => inp.focus(), 60);
      const go = async () => { const pin = inp.value.replace(/\D/g, ''); if (pin.length !== 4) { err.textContent = 'PIN gồm đúng 4 số nhé.'; return; }
        o.querySelector('#kaOk').disabled = true; err.textContent = '';
        const r = await raw({ action: 'dangnhap', id, dev: dev(), ua: ua(), pin }); o.querySelector('#kaOk') && (o.querySelector('#kaOk').disabled = false);
        if (r && r.ok) { hide(); return res({ ok: true }); }
        if (r && r.need === 'duyet') { hide(); return res(await waitApprove(raw, id, r.ten || ten)); }
        err.textContent = (r && r.err) || 'Chưa vào được, thử lại nhé.'; inp.value = ''; inp.focus(); if (r && r.khoa) o.querySelector('#kaOk').disabled = true; };
      o.querySelector('#kaOk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
      o.querySelector('#kaLater').onclick = () => { hide(); res({ ok: false }); };
    });
  }
  function waitApprove(raw, id, ten) {
    return new Promise(res => {
      const o = show(`<h3>⏳ Chờ cô duyệt máy này</h3><p>Bé ${esc2(ten || '')} đã dùng đủ số máy cho phép. Cô sẽ duyệt máy này trong Bảng quản trị. Ba mẹ nhắn cô giúp con nhé!</p><p class="ka-hot">Cần hỗ trợ: <a href="tel:0974840845"><b>Hotline CES 0974.840.845</b></a></p>
        <div class="ka-err" id="kaErr"></div><button class="ka-btn" id="kaChk" type="button">Kiểm tra lại</button><button class="ka-btn o" id="kaLater" type="button">Đóng</button>`);
      let stop = false, tm; const chk = async (quiet) => { const r = await raw({ action: 'kid', id, dev: dev() }); if (stop) return;
        if (r && r.ok) { stop = true; clearInterval(tm); hide(); return res({ ok: true }); } if (!quiet) o.querySelector('#kaErr').textContent = 'Cô chưa duyệt. Chờ thêm chút nhé.'; };
      o.querySelector('#kaChk').onclick = () => chk(false); tm = setInterval(() => chk(true), 20000);
      o.querySelector('#kaLater').onclick = () => { stop = true; clearInterval(tm); hide(); res({ ok: false }); };
    });
  }
  async function call(raw, q) {
    if (!ACT[q.action]) return raw(q);
    q = Object.assign({}, q, { dev: dev() });
    let r = await raw(q);
    if (!r || (r.need !== 'pin' && r.need !== 'duyet') || !q.id) return r;
    if (Date.now() < (snoozeUntil[q.id] || 0)) return Object.assign({ err: 'Cần nhập PIN của con để dùng ở máy này' }, r);
    if (!busy) busy = (async () => { try { return r.need === 'duyet' ? await waitApprove(raw, q.id, r.ten) : await askPin(raw, q.id, r.ten); } finally { busy = null; } })();
    const a = await busy;
    if (!a.ok) { snoozeUntil[q.id] = Date.now() + 90000; return Object.assign({ err: 'Cần nhập PIN của con để dùng ở máy này' }, r); }
    return raw(q);
  }
  return { call, dev };
})();

/* ---------- Bảng của con (#/bang) ---------- */
const BG_TT = { 1: 'đang làm quen', 2: 'khá tốt', 3: 'rất tốt' }, BG_CM = { c: ['Có mặt', 'c'], t: ['Đến muộn', 't'], p: ['Vắng có phép', 'p'], v: ['Vắng', 'v'] };
const BG_LOAI = { tien_bo: '🌱 Tiến bộ', ho_tro: '🤝 Cô gợi ý ở nhà', phu_huynh: '👪 Gửi phụ huynh', hanh_vi: '🧭 Nề nếp', khac: '📝 Nhận xét' };
async function viewBang() {
  const id = (typeof kidId === 'function') ? kidId() : '';
  document.body.classList.add('hub'); if (typeof setActive === 'function') setActive('');
  const frame = b => { app.innerHTML = `<div class="screen qscr"><div class="q-top"><span class="q-back">📒</span><h2>Bảng của con</h2></div><div class="bg-wrap">${b}</div></div>`; };
  if (!id) return frame('<p>Chưa có mã của con. Ba mẹ mở đường link cô gửi, hoặc bấm nút ❓ ở góc trên để nhập mã.</p>');
  frame('<p>Đang tải…</p>');
  const r = await api({ action: 'bang', id });
  if (!r || !r.ok) return frame(`<p>${esc((r && r.err) || 'Chưa tải được bảng của con.')}</p><p><a href="#/bang" onclick="viewBang();return false">Thử lại</a></p>`);
  const dd = r.buoi.filter(b => b.cm), co = dd.filter(b => b.cm === 'c' || b.cm === 't').length, taught = r.da_day.length || dd.length;
  const pct = dd.length ? Math.round(100 * co / dd.length) : 0, lv = v => v === '' || v == null ? '·' : '🌱'.repeat(+v);
  const sao = (+r.web || 0) + (+r.sao_co || 0);
  frame(`<h2>${esc(r.ten)}</h2><p class="bg-sub">Con và ba mẹ cùng xem nhé. Đây là chặng đường của riêng con, không so với bạn nào.</p>
    <div class="bg-tiles"><div class="bg-tile"><b>⭐ ${sao}</b><span>sao (web ${+r.web || 0} + cô tặng ${+r.sao_co || 0})</span></div>
    <div class="bg-tile"><b>${r.ngay}</b><span>ngày đã học trên web</span></div>
    <div class="bg-tile"><b>${co}/${taught || '0'}</b><span>buổi con đã đến lớp</span></div></div>
    <div class="bg-card"><h3>Đi học đều</h3><div class="bg-bar" aria-label="${pct}%"><i style="width:${pct}%"></i></div><p>${dd.length ? `Con có mặt <b>${pct}%</b> số buổi cô đã ghi.` : 'Cô chưa ghi buổi nào.'} Học web mỗi ngày một chút là cách nhớ lâu nhất.</p></div>
    <div class="bg-card"><h3>Từng buổi trên lớp</h3>${dd.length ? `<div class="bg-sc"><table class="bg-tbl"><thead><tr><th>Buổi</th><th>Đi học</th><th>Tham gia</th><th>Nói Anh</th><th>Nói Trung</th><th>Bài tập</th></tr></thead><tbody>${dd.map(b => { const c = BG_CM[b.cm] || ['', '']; return `<tr><td>${b.buoi}${b.ngay ? `<br><small>${esc(String(b.ngay).slice(5).split('-').reverse().join('/'))}</small>` : ''}</td><td><span class="bg-pill ${c[1]}">${c[0]}</span></td><td>${lv(b.tg)}</td><td>${lv(b.en)}</td><td>${lv(b.zh)}</td><td>${lv(b.bt)}</td></tr>`; }).join('')}</tbody></table></div><p class="bg-foot">🌱 = đang làm quen · 🌱🌱 = khá tốt · 🌱🌱🌱 = rất tốt</p>` : '<p>Cô chưa ghi buổi nào. Khi cô ghi, bảng này sẽ hiện ra.</p>'}</div>
    <div class="bg-card"><h3>Cô nhắn con và ba mẹ</h3>${r.gc.length ? r.gc.map(g => `<div class="bg-note ${esc(g.loai)}"><small>${esc(BG_LOAI[g.loai] || BG_LOAI.khac)}${g.buoi !== '' ? ' · buổi ' + g.buoi : ''} · ${esc(new Date(g.at).toLocaleDateString('vi-VN'))}</small>${esc(g.nd)}</div>`).join('') : '<p>Chưa có lời nhắn. Cô sẽ viết khi con có điều đáng khen hoặc cần cố gắng thêm.</p>'}</div>
    <p class="bg-foot">🔐 Bảng này chỉ hiện ở máy đã nhập PIN của con. Xin đừng chia sẻ link và PIN cho bạn khác. Đây là thông tin học tập riêng của con.</p>`);
}
