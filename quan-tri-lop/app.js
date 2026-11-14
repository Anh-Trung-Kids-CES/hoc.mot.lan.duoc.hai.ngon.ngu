/* =====================================================================
   TRANG QUẢN TRỊ LỚP OFFLINE · Little Seed + Seedling 48 buổi (cho cô giáo)
   - Nói chuyện với máy chủ lớp offline 48 buổi (apps-script/lop-offline-48/Code.gs, bản 4). Đăng nhập bằng PIN của lớp (tab CaiDat).
   - ?demo=1: chạy với dữ liệu giả lưu trên máy này (PIN 2468) để xem thử, không cần máy chủ.
   - Máy chủ cũ (bản 3): vẫn xem được dashboard và sao/quà; điểm danh, ghi chú, tài nguyên cần bản 4.
   ===================================================================== */
const API = 'https://script.google.com/macros/s/AKfycbxGmqsyBcA-NxzE50aJEx5ZOEYxnxcoROthFs_6utXPtpfNhRqHaq89Ry3urcGLWdfKhw/exec';
const DEMO = /[?&]demo=1/.test(location.search);
const LOPS = { ls: { ten: 'Little Seed', web: '../little-seed/', tong: 99 }, sd: { ten: 'Seedling', web: '../seedling/', tong: 99 } };
const LOAI = { tien_bo: '🌱 Tiến bộ', ho_tro: '🤝 Cần hỗ trợ', phu_huynh: '👪 Phụ huynh', hanh_vi: '🧭 Nề nếp', khac: '📝 Khác' };
const CM = [['c', '✓', 'Có mặt'], ['t', 'T', 'Đến muộn'], ['p', 'P', 'Vắng có phép'], ['v', '✗', 'Vắng']];
const WHY = ['Phát biểu hăng hái', 'Giúp đỡ bạn', 'Nói được cả câu', 'Hoàn thành bài ở nhà', 'Tiến bộ rõ'];
const TABS = [['tq', 'Tổng quan'], ['hs', 'Học sinh'], ['dd', 'Điểm danh & buổi học'], ['sq', 'Sao & quà'], ['tn', 'Tài nguyên']];

/* ---------- tiện ích ---------- */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => ymd(new Date());
const dayDiff = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const dm = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '';
const dmt = t => { if (!t) return ''; const d = new Date(+t); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); };
let toastT = 0;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
const store = { get: k => { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }, set: (k, v) => { try { v ? sessionStorage.setItem(k, v) : sessionStorage.removeItem(k); } catch (e) {} } };

/* ---------- trạng thái ---------- */
const S = { lop: store.get('qtl-lop') || 'ls', pin: '', d: null, tab: 'tq', kid: '', q: '', filt: '', dd: null, sel: new Set(), n: 3, why: WHY[0], tnEdit: null, v3: false, err: '' };
const KH = () => (window.KHUNG && KHUNG[S.lop]) || [];
const weekOf = n => n <= 3 ? n : 4 + Math.floor((n - 4) / 2);   // tuần 1–3: 1 buổi/tuần; từ tuần 4: 2 buổi/tuần (khung 48 buổi)

/* ---------- gọi máy chủ (POST text/plain: không cần hỏi trước, PIN không nằm trên link) ---------- */
async function call(action, extra = {}) {
  const q = Object.assign({ action, lop: S.lop, pin: S.pin }, extra);
  if (DEMO) return mock(q);
  try { const r = await fetch(API, { method: 'POST', body: JSON.stringify(q), redirect: 'follow' }); return await r.json(); }
  catch (e) { return { ok: false, err: 'Không nối được máy chủ. Kiểm tra mạng rồi thử lại.', net: true }; }
}
async function load() {
  let r = await call('qt_tai');
  if (!r.ok && /Lệnh không rõ/.test(r.err || '')) {   // máy chủ bản 3: chỉ có dữ liệu lớp cơ bản
    const c = await call('cls');
    if (!c.ok) return c;
    r = { ok: true, v: 3, cfg: {}, kids: c.kids, awards: c.awards, orders: c.orders, hs: [], bl: [], gc: [], tn: [] };
  }
  if (!r.ok) return r;
  S.d = r; S.v3 = r.v < 4; return r;
}
async function refresh(keepScroll) { const y = scrollY; const r = await load(); if (!r.ok) { toast(r.err || 'Chưa tải được'); return; } draw(); if (keepScroll) scrollTo(0, y); }

/* ---------- dữ liệu suy ra ---------- */
function derive() {
  const d = S.d, kids = d.kids.slice().sort((a, b) => String(a.ten).localeCompare(String(b.ten), 'vi'));
  const active = kids.filter(k => !k.tt);
  const hsBy = {}; d.hs.forEach(r => { (hsBy[r.kid] = hsBy[r.kid] || {})[r.buoi] = r; });
  const blBy = {}; d.bl.forEach(r => { blBy[r.buoi] = r; });
  const taught = new Set(); d.bl.forEach(r => { if (r.da_day) taught.add(r.buoi); }); d.hs.forEach(r => { if (r.cm) taught.add(r.buoi); });
  const tl = [...taught].sort((a, b) => a - b);
  const info = {};
  kids.forEach(k => {
    const recs = Object.values(hsBy[k.id] || {}), cms = recs.filter(r => r.cm);
    const pres = cms.filter(r => r.cm === 'c' || r.cm === 't').length;
    const avg = f => { const v = recs.map(r => r[f]).filter(x => x !== '' && x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const dsc = k.cuoi ? dayDiff(today(), k.cuoi) : null;
    const lastCm = tl.slice(-2).map(b => (hsBy[k.id] || {})[b]).map(r => r && r.cm);
    const lowTg = tl.slice(-3).map(b => (hsBy[k.id] || {})[b]).filter(r => r && r.tg !== '' && r.tg > 0 && r.tg <= 1).length;
    info[k.id] = { att: cms.length ? pres / cms.length : null, nAtt: cms.length, tg: avg('tg'), en: avg('en'), zh: avg('zh'), dsc, lastCm, lowTg,
      stars: (k.web || 0) + d.awards.filter(a => a.kid === k.id && !a.huy).reduce((s, a) => s + a.n, 0) };
  });
  return { kids, active, hsBy, blBy, tl, info };
}
function expectedDays() {
  const st = S.d.cfg && S.d.cfg.khai_giang; if (!st) return null;
  const w = Math.floor(dayDiff(today(), st) / 7) + 1; if (w < 1) return 0;
  let m = 0; KH().forEach(s => { if (weekOf(s.n) <= w) (s.days || []).forEach(x => { if (x > m) m = x; }); }); return m;
}
function flags(D) {
  const out = [], exp = expectedDays(), ord = S.d.orders.filter(o => o.st === 'cho');
  D.active.forEach(k => {
    const i = D.info[k.id], f = [];
    if (i.dsc == null) f.push(['r', 'Chưa mở web học lần nào']); else if (i.dsc >= 4) f.push(['r', `Chưa học web ${i.dsc} ngày (lần cuối ${dm(k.cuoi)})`]);
    if (exp != null && exp - (k.ngay || 0) >= 3 && (k.ngay || 0) > 0) f.push(['a', `Học web chậm hơn lịch ${exp - k.ngay} ngày`]);
    if (i.lastCm.length === 2 && i.lastCm.every(x => x === 'v' || x === 'p')) f.push(['r', 'Vắng 2 buổi dạy gần nhất']);
    if (i.lowTg >= 2) f.push(['a', 'Tham gia thấp ở ≥2 trong 3 buổi gần nhất']);
    if (ord.some(o => o.kid === k.id)) f.push(['b', 'Có phiếu đổi quà chờ duyệt']);
    f.forEach(x => out.push({ kid: k.id, ten: k.ten, c: x[0], t: x[1] }));
  });
  return out;
}

/* ---------- vỏ trang ---------- */
function shell() {
  $('#top').hidden = false;
  $('#lopsw').innerHTML = Object.keys(LOPS).map(l => `<button class="pill" role="tab" aria-selected="${l === S.lop}" data-lop="${l}" type="button">${LOPS[l].ten}</button>`).join('');
  const ord = S.d ? S.d.orders.filter(o => o.st === 'cho').length : 0;
  $('#nav').innerHTML = TABS.map(([k, t]) => `<button type="button" data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${t}${k === 'sq' && ord ? `<span class="dot">${ord}</span>` : ''}</button>`).join('');
  const b = $('#banner');
  if (DEMO) { b.hidden = false; b.textContent = 'Chế độ xem thử: dữ liệu giả, lưu trên máy này. Đừng nhập thông tin thật.'; }
  else if (S.v3) { b.hidden = false; b.textContent = 'Máy chủ lớp đang là bản 3: xem được dashboard, sao và quà. Muốn điểm danh, ghi chú từng con và kho tài nguyên, dán Code.gs bản 4 (xem apps-script/lop-offline-48/HUONG-DAN.md).'; }
  else b.hidden = true;
}
function draw() {
  if (!S.d) return login();
  shell();
  const m = $('#main'); const f = { tq: vTq, hs: vHs, dd: vDd, sq: vSq, tn: vTn }[S.tab] || vTq;
  m.innerHTML = f();
  document.title = (LOPS[S.lop].ten) + ' · Quản trị lớp offline';
  bind();
}

/* ---------- đăng nhập ---------- */
function login(err) {
  $('#top').hidden = true; $('#banner').hidden = !DEMO; if (DEMO) $('#banner').textContent = 'Chế độ xem thử: PIN là 2468, dữ liệu giả lưu trên máy này.';
  $('#main').innerHTML = `<div class="card login"><h1>Quản trị lớp offline</h1><p class="muted">Dành cho cô giáo. Chọn lớp rồi nhập PIN của lớp (PIN nằm ở tab CaiDat của Google Sheet quản lý).</p>
    <div class="lopsw" role="tablist">${Object.keys(LOPS).map(l => `<button class="pill" role="tab" aria-selected="${l === S.lop}" data-lop0="${l}" type="button">${LOPS[l].ten}</button>`).join('')}</div>
    <form id="lf"><label class="f" for="pin">PIN lớp ${esc(LOPS[S.lop].ten)}</label><input id="pin" type="password" inputmode="numeric" autocomplete="off" autofocus>
    <div class="err" id="lerr" role="alert">${esc(err || '')}</div><button class="btn" type="submit" style="width:100%">Vào quản trị</button></form></div>`;
  $$('[data-lop0]').forEach(b => b.onclick = () => { S.lop = b.dataset.lop0; store.set('qtl-lop', S.lop); S.pin = store.get('qtl-pin-' + S.lop); S.pin ? enter() : login(); });
  $('#lf').onsubmit = async e => { e.preventDefault(); S.pin = $('#pin').value.trim(); if (!S.pin) return; await enter(); };
}
async function enter() {
  const btn = $('#lf button'); if (btn) { btn.disabled = true; btn.textContent = 'Đang vào…'; }
  const r = await load();
  if (!r.ok) { if (!r.net) { S.pin = ''; store.set('qtl-pin-' + S.lop, ''); } S.d = null; return login(r.err || 'Chưa vào được'); }
  store.set('qtl-pin-' + S.lop, S.pin); S.kid = ''; S.dd = null; S.sel = new Set(); draw();
}

/* =====================================================================
   TỔNG QUAN
   ===================================================================== */
function vTq() {
  const D = derive(), d = S.d, kh = KH(), tong = LOPS[S.lop].tong, exp = expectedDays();
  const last = D.tl.length ? D.tl[D.tl.length - 1] : -1, next = kh.find(s => s.n > last);
  const att = (() => { const v = D.active.map(k => D.info[k.id].att).filter(x => x != null); return v.length ? Math.round(100 * v.reduce((a, b) => a + b, 0) / v.length) : null; })();
  const recent = D.active.filter(k => D.info[k.id].dsc != null && D.info[k.id].dsc <= 3).length;
  const wait = d.orders.filter(o => o.st === 'cho').length, fl = flags(D);
  const tiles = `<div class="tiles">
    <div class="tile"><b>${D.active.length}</b><span>bạn đang học${D.kids.length > D.active.length ? ` (${D.kids.length - D.active.length} nghỉ)` : ''}</span></div>
    <div class="tile"><b>${D.tl.filter(n => n > 0).length}/48</b><span>buổi đã dạy${last >= 0 ? ` · gần nhất buổi ${last}` : ''}</span></div>
    <div class="tile"><b>${att == null ? '–' : att + '%'}</b><span>chuyên cần trung bình</span></div>
    <div class="tile"><b>${recent}/${D.active.length}</b><span>học web trong 3 ngày qua</span></div>
    <div class="tile ${wait ? 'warn' : ''}"><b>${wait}</b><span>phiếu quà chờ duyệt</span></div></div>`;
  const nextCard = next ? `<div class="card"><h2>Buổi tiếp theo · Buổi ${next.n}</h2><p style="margin:0 0 8px"><b>${esc(next.vai)}</b> · Unit ${esc(next.u)}${next.days && next.days.length ? ` · web ngày ${next.days[0]}–${next.days[next.days.length - 1]}` : ''}<br><span class="muted">${esc(next.t)}</span></p>
    <div class="row">${teachLinks(next.n).map(l => `<a class="btn" href="${l.href}" target="_blank" rel="noopener">${esc(l.t)}</a>`).join('')}<button class="ghost" type="button" data-go-dd="${next.n}">Điểm danh buổi này</button></div></div>` : `<div class="card"><h2>Đã dạy hết 48 buổi</h2></div>`;
  const bars = D.active.length ? `<div class="bars">${D.active.map(k => {
    const i = D.info[k.id], pct = Math.min(100, Math.round(100 * (k.ngay || 0) / tong)), cls = i.dsc == null || i.dsc >= 6 ? 'r' : i.dsc >= 4 ? 'a' : '';
    return `<div class="bar-row" data-kid="${esc(k.id)}" tabindex="0" role="button" aria-label="Mở hồ sơ ${esc(k.ten)}"><span class="nm">${esc(k.ten)}</span>
      <div class="bar"><span class="fill ${cls}" style="width:${pct}%"></span>${exp != null ? `<i class="mark" style="left:${Math.min(100, Math.round(100 * exp / tong))}%"></i>` : ''}</div>
      <span class="vl">${k.ngay || 0}/${tong} ngày · ${i.dsc == null ? 'chưa học' : i.dsc === 0 ? 'hôm nay' : i.dsc + ' ngày trước'}</span></div>`; }).join('')}</div>
    <div class="legend">Thanh xanh: học đều · vàng: 4–5 ngày chưa học · đỏ: từ 6 ngày hoặc chưa học${exp != null ? ' · vạch đen: tiến độ theo lịch (ước tính từ ngày khai giảng)' : ' · điền ngày khai giảng ở mục Điểm danh để hiện vạch tiến độ theo lịch'}</div>`
    : `<div class="empty">Lớp chưa có bạn nào. Vào mục <b>Sao & quà</b> để thêm bạn và lấy link gửi ba mẹ.</div>`;
  const attn = fl.length ? `<ul class="attn">${fl.slice(0, 14).map(x => `<li data-kid="${esc(x.kid)}"><span class="chip ${x.c}">${x.c === 'r' ? 'Cần gọi' : x.c === 'a' ? 'Theo dõi' : 'Việc'}</span><span><b>${esc(x.ten)}</b> · ${esc(x.t)}</span></li>`).join('')}</ul>${fl.length > 14 ? `<p class="muted sm">… và ${fl.length - 14} mục nữa.</p>` : ''}` : `<div class="empty">Chưa có bạn nào cần chú ý. 🎉</div>`;
  return tiles + `<div class="grid g2"><div>${nextCard}<div class="card"><h2>Cần chú ý</h2>${attn}</div></div><div class="card"><h2>Học web của từng bạn</h2>${bars}</div></div>` + heat(D);
}
function heat(D) {
  if (!D.tl.length) return `<div class="card"><h2>Bản đồ các buổi học</h2><div class="empty">Chưa ghi buổi nào. Vào mục <b>Điểm danh & buổi học</b> để ghi buổi đầu tiên; bản đồ sẽ hiện ở đây.</div></div>`;
  const cols = D.tl.slice(-16);
  const head = cols.map(b => `<th>${b}</th>`).join('');
  const rows = D.active.map(k => `<tr><td class="nm">${esc(k.ten)}</td>${cols.map(b => { const r = (D.hsBy[k.id] || {})[b], c = r ? r.cm : '';
    const lv = r && r.tg !== '' && r.tg > 0 ? (r.tg >= 3 ? ' s3' : r.tg <= 1 ? ' s1' : '') : '';
    return `<td><button class="hc ${c}${lv}" type="button" data-go-dd="${b}" title="${esc(k.ten)} · buổi ${b}${r && r.note ? ' · ' + esc(r.note) : ''}" aria-label="${esc(k.ten)} buổi ${b}: ${esc((CM.find(x => x[0] === c) || [0, 0, 'chưa ghi'])[2])}">${c ? (CM.find(x => x[0] === c)[1]) : '·'}</button></td>`; }).join('')}</tr>`).join('');
  const avg = cols.map(b => { const v = D.active.map(k => ((D.hsBy[k.id] || {})[b] || {}).cm).filter(Boolean); return `<td class="muted sm" style="text-align:center">${v.length ? Math.round(100 * v.filter(x => x === 'c' || x === 't').length / v.length) + '%' : ''}</td>`; }).join('');
  return `<div class="card"><h2>Bản đồ các buổi học</h2><div class="hm-wrap"><table class="hm"><thead><tr><th class="nm">Buổi →</th>${head}</tr></thead><tbody>${rows}<tr><td class="nm muted sm">Có mặt</td>${avg}</tr></tbody></table></div>
    <div class="legend">✓ có mặt · T muộn · P vắng có phép · ✗ vắng. Viền xanh: tham gia nổi bật · viền vàng: cần hỗ trợ. Bấm một ô để mở buổi đó.${D.tl.length > 16 ? ' Đang hiện 16 buổi gần nhất.' : ''}</div></div>`;
}
function teachLinks(n) {
  const l = [], sd = S.lop === 'sd';
  if (n === 0) l.push({ t: 'Mở web khai giảng', href: `../khai-giang/?lop=${S.lop}` });
  else {
    if (n <= 3) l.push({ t: `Web dạy buổi ${n}`, href: `../buoi/?lop=${S.lop}&b=${n}` });
    if (sd) l.push({ t: `Giáo án & trình chiếu buổi ${n}`, href: `../seedling/day/#/b/${n}` });
    if (!l.length) l.push({ t: 'Web dạy buổi này chưa dựng', href: '#', dead: 1 });
  }
  return l.filter(x => !x.dead);
}

/* =====================================================================
   HỌC SINH
   ===================================================================== */
function vHs() {
  const D = derive(), q = S.q.toLowerCase(), fl = new Set(flags(D).map(x => x.kid));
  const list = D.kids.filter(k => (!q || String(k.ten).toLowerCase().includes(q)) && (S.filt !== 'attn' || fl.has(k.id)) && (S.filt !== 'nghi' ? true : !!k.tt));
  const left = `<div class="card klistcard"><h2>Học sinh (${D.kids.length})</h2>
    <input type="text" id="kq" placeholder="Tìm theo tên…" value="${esc(S.q)}" aria-label="Tìm học sinh">
    <div class="chips" style="margin-top:8px"><button type="button" data-filt="" aria-pressed="${S.filt === ''}">Tất cả</button><button type="button" data-filt="attn" aria-pressed="${S.filt === 'attn'}">Cần chú ý</button><button type="button" data-filt="nghi" aria-pressed="${S.filt === 'nghi'}">Nghỉ học</button></div>
    <div class="klist">${list.map(k => { const i = D.info[k.id]; return `<button type="button" class="kitem ${k.tt ? 'off' : ''}" data-kid="${esc(k.id)}" aria-current="${S.kid === k.id}"><span><b>${esc(k.ten)}</b><br><span class="muted sm">${k.ngay || 0}/${LOPS[S.lop].tong} ngày web</span></span>${fl.has(k.id) ? '<span class="chip a">!</span>' : ''}${k.tt ? '<span class="chip">nghỉ</span>' : ''}</button>`; }).join('') || '<div class="empty">Không có bạn nào.</div>'}</div></div>`;
  return `<div class="split ${S.kid ? 'has-kid' : ''}">${left}<div class="kdetail">${S.kid && D.kids.some(k => k.id === S.kid) ? kidDetail(D) : '<div class="card"><div class="empty">Chọn một bạn ở danh sách để xem hồ sơ, điểm danh từng buổi và ghi chú.</div></div>'}</div></div>`;
}
function kidDetail(D) {
  const k = D.kids.find(x => x.id === S.kid), i = D.info[k.id], tong = LOPS[S.lop].tong, link = location.origin + location.pathname.replace(/quan-tri-lop\/.*$/, '') + (S.lop === 'ls' ? 'little-seed/' : 'seedling/') + '?con=' + k.id;
  const recs = Object.values(D.hsBy[k.id] || {}).sort((a, b) => b.buoi - a.buoi);
  const notes = S.d.gc.filter(g => g.kid === k.id), awards = S.d.awards.filter(a => a.kid === k.id && !a.huy);
  const f = x => x == null ? '–' : x.toFixed(1);
  const lvs = v => v === '' || v == null ? '·' : v;
  const canW = !S.v3;
  return `<div class="card"><button class="ghost back" type="button" data-back>‹ Danh sách</button>
    <div class="row"><h2 class="grow">${esc(k.ten)} <span class="chip">${esc(k.id)}</span> ${k.tt ? '<span class="chip">nghỉ học</span>' : ''}</h2></div>
    <div class="facts"><div><b>${k.ngay || 0}/${tong}</b><span>ngày web đã học</span></div><div><b>${k.cuoi ? dm(k.cuoi) : '–'}</b><span>học web lần cuối</span></div>
      <div><b>${i.att == null ? '–' : Math.round(i.att * 100) + '%'}</b><span>chuyên cần (${i.nAtt} buổi)</span></div><div><b>${f(i.tg)}</b><span>tham gia (1–3)</span></div>
      <div><b>${f(i.en)} · ${f(i.zh)}</b><span>nói EN · ZH (1–3)</span></div><div><b>${i.stars}</b><span>tổng sao (web + cô)</span></div></div>
    <div class="row"><button class="ghost" type="button" data-copy="${esc(link)}">🔗 Chép link gửi ba mẹ</button>
    ${canW ? `<button class="ghost" type="button" data-ren="${esc(k.id)}">✏️ Đổi tên</button><button class="ghost" type="button" data-tt="${esc(k.id)}" data-v="${k.tt ? '' : 'nghi'}">${k.tt ? 'Cho học lại' : 'Đánh dấu nghỉ học'}</button>` : ''}</div></div>
  <div class="card"><h3>Nhật ký từng buổi</h3>${recs.length ? `<div class="att-scroll"><table class="tbl"><thead><tr><th>Buổi</th><th>Có mặt</th><th>Tham gia</th><th>Nói EN</th><th>Nói ZH</th><th>Bài tập</th><th>Ghi chú</th></tr></thead><tbody>${recs.map(r => `<tr><td><a href="#" data-go-dd="${r.buoi}">${r.buoi}</a></td><td>${esc((CM.find(x => x[0] === r.cm) || [0, '·'])[1])}</td><td>${lvs(r.tg)}</td><td>${lvs(r.en)}</td><td>${lvs(r.zh)}</td><td>${lvs(r.bt)}</td><td>${esc(r.note)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Chưa có buổi nào được ghi cho bạn này.</div>'}
    <div class="legend">Mức 1 = cần hỗ trợ · 2 = ổn · 3 = nổi bật. Bài tập: 1 chưa làm · 2 một phần · 3 đủ.</div></div>
  <div class="card"><h3>Ghi chú về ${esc(k.ten)}</h3>
    ${canW ? `<div class="row"><select id="nl" aria-label="Loại ghi chú" style="width:auto">${Object.entries(LOAI).map(([a, b]) => `<option value="${a}">${b}</option>`).join('')}</select><input type="number" id="nb" min="0" max="48" placeholder="Buổi (tuỳ chọn)" style="width:150px"></div>
    <textarea id="nt" placeholder="Ví dụ: hôm nay dám nói cả câu; ba mẹ hỏi về bài ở nhà…" aria-label="Nội dung ghi chú" style="margin-top:8px"></textarea><div style="margin-top:8px"><button class="btn" type="button" data-addnote="${esc(k.id)}">Lưu ghi chú</button></div>` : '<p class="muted">Cần máy chủ bản 4 để ghi chú.</p>'}
    <div class="timeline">${notes.map(g => `<div class="note ${g.loai}"><div class="meta"><span>${LOAI[g.loai] || LOAI.khac}${g.buoi !== '' ? ' · buổi ' + g.buoi : ''} · ${dmt(g.at)}</span><button class="ghost sm" type="button" data-delnote="${esc(g.id)}" aria-label="Xoá ghi chú">Xoá</button></div><p>${esc(g.nd)}</p></div>`).join('') || '<div class="empty">Chưa có ghi chú.</div>'}</div></div>
  <div class="card"><h3>Sao cô đã thưởng</h3>${awards.length ? `<p class="muted sm">${awards.slice(0, 12).map(a => `+${a.n}⭐ ${esc(a.why || '')} (${dmt(a.at)})`).join(' · ')}</p>` : '<div class="empty">Chưa thưởng sao.</div>'}</div>`;
}

/* =====================================================================
   ĐIỂM DANH & BUỔI HỌC
   ===================================================================== */
function ddInit(n) {
  const D = derive(), kh = KH(), last = D.tl.length ? D.tl[D.tl.length - 1] : -1;
  if (n == null) { const nx = kh.find(s => s.n > last); n = nx ? nx.n : last; }
  const bl = D.blBy[n] || {}, rows = {};
  D.active.forEach(k => { const r = (D.hsBy[k.id] || {})[n]; rows[k.id] = r ? { cm: r.cm, tg: r.tg, en: r.en, zh: r.zh, bt: r.bt, note: r.note } : { cm: '', tg: '', en: '', zh: '', bt: '', note: '' }; });
  S.dd = { n, ngay: bl.ngay || today(), da_day: bl.da_day !== undefined ? bl.da_day : true, ghi_chu: bl.ghi_chu || '', rows, dirty: false };
}
function vDd() {
  const D = derive(), kh = KH(); if (!S.dd || !kh.some(s => s.n === S.dd.n)) ddInit();
  const dd = S.dd, ss = kh.find(s => s.n === dd.n) || { vai: '', t: '', u: '' };
  const khai = S.d.cfg && S.d.cfg.khai_giang || '';
  const opt = kh.map(s => `<option value="${s.n}" ${s.n === dd.n ? 'selected' : ''}>Buổi ${s.n} · U${esc(s.u)} · ${esc(s.vai)}${D.tl.includes(s.n) ? ' ✓' : ''}</option>`).join('');
  const lv = (k, f) => { const v = dd.rows[k][f]; return `<button type="button" class="lv ${v ? 'l' + v : ''}" data-lv="${esc(k)}|${f}" aria-label="${f}: ${v || 'chưa ghi'}">${v || '–'}</button>`; };
  const trs = D.active.map(k => { const r = dd.rows[k.id]; return `<tr><td class="nm">${esc(k.ten)}</td>
    <td><div class="seg" role="group" aria-label="Có mặt: ${esc(k.ten)}">${CM.map(([c, sy, tt]) => `<button type="button" class="${c}" aria-pressed="${r.cm === c}" title="${tt}" data-cm="${esc(k.id)}|${c}">${sy}</button>`).join('')}</div></td>
    <td>${lv(k.id, 'tg')}</td><td>${lv(k.id, 'en')}</td><td>${lv(k.id, 'zh')}</td><td>${lv(k.id, 'bt')}</td>
    <td><input type="text" data-nt="${esc(k.id)}" value="${esc(r.note)}" placeholder="Ghi chú nhanh" aria-label="Ghi chú ${esc(k.ten)}"></td></tr>`; }).join('');
  return `<div class="card"><h2>Ghi buổi học</h2>
    <div class="row"><div class="grow"><label class="f" for="ds">Buổi</label><select id="ds">${opt}</select></div>
    <div><label class="f" for="dn">Ngày dạy</label><input type="date" id="dn" value="${esc(dd.ngay)}"></div></div>
    <p class="muted sm" style="margin:6px 0 0">${esc(ss.t)}</p>
    <label class="f" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="dq" ${dd.da_day ? 'checked' : ''}> Đã dạy buổi này</label>
    <label class="f" for="dg">Ghi chú buổi (cái gì đã dạy, chưa kịp, điều chỉnh lần sau)</label><textarea id="dg" placeholder="Ví dụ: chưa kịp trò Bingo, buổi sau làm trước phần ôn…">${esc(dd.ghi_chu)}</textarea>
    <div class="row" style="margin-top:10px"><a class="ghost" href="${(teachLinks(dd.n)[0] || {}).href || '#'}" target="_blank" rel="noopener" ${teachLinks(dd.n).length ? '' : 'hidden'}>Mở web dạy buổi này</a>
    <span class="muted sm">Ngày khai giảng của lớp:</span><input type="date" id="kg" value="${esc(khai)}" style="width:auto" ${S.v3 ? 'disabled' : ''}><button class="ghost sm" type="button" id="kgs" ${S.v3 ? 'disabled' : ''}>Lưu ngày</button></div></div>
  <div class="card"><h2>Điểm danh và ghi nhận từng bạn</h2>
    ${D.active.length ? `<div class="row"><button class="ghost" type="button" id="allc">✓ Tất cả có mặt</button><span class="muted sm">Bấm số để đổi mức: – → 1 → 2 → 3 → bỏ trống.</span></div>
    <div class="att-scroll"><table class="att"><thead><tr><th class="nm" style="text-align:left">Bạn</th><th>Có mặt</th><th>Tham gia</th><th>Nói EN</th><th>Nói ZH</th><th>Bài tập</th><th>Ghi chú</th></tr></thead><tbody>${trs}</tbody></table></div>
    <div class="legend">Tham gia, nói EN, nói ZH: 1 cần hỗ trợ · 2 ổn · 3 nổi bật. Bài tập (sách bài tập, web ở nhà): 1 chưa làm · 2 một phần · 3 đủ. Vắng thì để trống các mức.</div>`
    : '<div class="empty">Lớp chưa có bạn nào. Thêm bạn ở mục Sao & quà.</div>'}
    <div class="savebar"><button class="btn" type="button" id="dsave" ${S.v3 ? 'disabled' : ''}>Lưu buổi ${dd.n}</button><span class="muted sm" id="dstat">${S.v3 ? 'Cần máy chủ bản 4 để lưu.' : (D.tl.includes(dd.n) ? 'Buổi này đã có dữ liệu.' : 'Buổi này chưa ghi.')}</span></div></div>`;
}

/* =====================================================================
   SAO & QUÀ (dùng lại lệnh của Bảng của cô)
   ===================================================================== */
function vSq() {
  const D = derive(), d = S.d, ord = d.orders;
  const chips = D.active.map(k => `<button type="button" data-pick="${esc(k.id)}" aria-pressed="${S.sel.has(k.id)}">${esc(k.ten)}</button>`).join('');
  const aw = d.awards.filter(a => !a.huy).slice(0, 12).map(a => { const k = D.kids.find(x => x.id === a.kid); return `<li>${esc(k ? k.ten : a.kid)} · <b>+${a.n}⭐</b> ${esc(a.why || '')} <span class="muted sm">(${dmt(a.at)})</span> <button class="ghost sm" type="button" data-un="${esc(a.id)}">Huỷ</button></li>`; }).join('');
  const ST = { cho: ['a', 'Chờ duyệt'], da_trao: ['g', 'Đã trao'], tu_choi: ['r', 'Không duyệt'] };
  const orows = ord.map(o => `<tr><td>${esc(o.ten)}</td><td>${esc(o.ten_qua)}</td><td>${o.sao}⭐</td><td>${dmt(o.at)}</td><td><span class="chip ${ST[o.st] ? ST[o.st][0] : ''}">${ST[o.st] ? ST[o.st][1] : esc(o.st)}</span>${o.st === 'cho' ? ` <button class="btn sm" type="button" data-o="${esc(o.code)}" data-st="da_trao">Đã trao</button> <button class="ghost sm" type="button" data-o="${esc(o.code)}" data-st="tu_choi">Không duyệt</button>` : ''}</td></tr>`).join('');
  return `<div class="grid g2"><div class="card"><h2>Thưởng sao</h2><div class="chips">${chips || '<span class="muted">Chưa có bạn.</span>'}</div>
    <div class="row" style="margin-top:10px"><button class="ghost sm" type="button" id="pall">Chọn cả lớp</button><button class="ghost sm" type="button" id="pnone">Bỏ chọn</button>
    <label class="sm" for="sn">Số sao</label><input type="number" id="sn" min="1" max="10" value="${S.n}" style="width:70px"></div>
    <label class="f" for="sw">Lý do</label><input type="text" id="sw" list="whys" value="${esc(S.why)}" maxlength="120"><datalist id="whys">${WHY.map(w => `<option value="${esc(w)}">`).join('')}</datalist>
    <div style="margin-top:10px"><button class="btn" type="button" id="give">Thưởng cho ${S.sel.size} bạn</button></div>
    <h3 style="margin-top:16px">Vừa thưởng</h3><ul class="attn" style="gap:4px">${aw || '<li class="muted">Chưa có lượt thưởng.</li>'}</ul></div>
    <div class="card"><h2>Thêm bạn mới</h2><div class="row"><input type="text" id="nk" maxlength="40" placeholder="Tên gọi ở lớp (không ghi họ tên đầy đủ)" aria-label="Tên bạn mới" class="grow"><button class="btn" type="button" id="addk">Thêm</button></div>
    <p class="muted sm">Mỗi bạn có một mã riêng. Sang mục Học sinh, mở hồ sơ rồi bấm “Chép link gửi ba mẹ” để gửi qua Zalo.</p></div></div>
  <div class="card"><h2>Phiếu đổi quà</h2>${ord.length ? `<div class="att-scroll"><table class="tbl"><thead><tr><th>Bạn</th><th>Quà</th><th>Sao</th><th>Ngày</th><th>Trạng thái</th></tr></thead><tbody>${orows}</tbody></table></div>` : '<div class="empty">Chưa có phiếu đổi quà.</div>'}</div>`;
}

/* =====================================================================
   TÀI NGUYÊN
   ===================================================================== */
function builtIn() {
  const L = S.lop, w = LOPS[L].web, g = [];
  const A = (nhom, ten, href, gc) => g.push({ nhom, ten, url: href, ghi_chu: gc || '' });
  A('Dạy trên lớp', 'Buổi 0 · Khai giảng (web trình chiếu)', `../khai-giang/?lop=${L}`, '18 màn, 90 phút, có đồng hồ buổi');
  [1, 2, 3].forEach(n => A('Dạy trên lớp', `Web dạy buổi ${n} (Unit 1)`, `../buoi/?lop=${L}&b=${n}`, 'Mỗi unit dựng xong sẽ thêm buổi mới vào đây'));
  if (L === 'sd') { A('Dạy trên lớp', 'Giáo án, trình chiếu, big book, reader, đồ dùng in (48 buổi)', '../seedling/day/', 'Lớp & báo cáo từng buổi'); }
  else { A('Dạy trên lớp', 'Học liệu in và phiếu tô – dán', '../little-seed/day/', 'Phiếu theo buổi, flashcard, thủ công'); }
  A('Web của con', `Web học ${LOPS[L].ten} (con học ở nhà)`, w, 'Gửi ba mẹ kèm ?con=MÃ ở hồ sơ từng bạn');
  if (L === 'ls') A('Web của con', 'Web học Little Seed có hiện chữ (dành cho cô, ba mẹ)', w + '?gv=1');
  A('Web của con', 'Bảng của cô (thưởng sao, duyệt quà, cách cũ)', w + '#/co', 'Cũng dùng PIN lớp');
  return g;
}
function vTn() {
  const own = (S.d.tn || []), all = builtIn().concat(own.map(t => Object.assign({ own: 1 }, t)));
  const groups = []; all.forEach(r => { let g = groups.find(x => x.n === r.nhom); if (!g) groups.push(g = { n: r.nhom, l: [] }); g.l.push(r); });
  const order = ['Quản lý lớp', 'Dạy trên lớp', 'Web của con'], gs = groups.sort((a, b) => { const x = order.indexOf(a.n), y = order.indexOf(b.n); return (x < 0 ? 9 : x) - (y < 0 ? 9 : y); });
  const names = [...new Set(own.map(t => t.nhom).concat(['Quản lý lớp', 'Tài liệu khoá học', 'Bài hát & video', 'Phụ huynh']))];
  const ed = S.tnEdit, e = ed && ed !== 'new' ? own.find(t => t.id === ed) || {} : {};
  const form = ed ? `<div class="card"><h2>${ed === 'new' ? 'Thêm link' : 'Sửa link'}</h2>
    <label class="f" for="tt">Tên hiển thị</label><input type="text" id="tt" value="${esc(e.ten || '')}" maxlength="100">
    <label class="f" for="tu">Link (https://…)</label><input type="url" id="tu" value="${esc(e.url || '')}">
    <div class="row"><div class="grow"><label class="f" for="tg">Nhóm</label><input type="text" id="tg" list="tgs" value="${esc(e.nhom || 'Tài liệu khoá học')}" maxlength="40"><datalist id="tgs">${names.map(n => `<option value="${esc(n)}">`).join('')}</datalist></div>
    <div><label class="f" for="to">Thứ tự</label><input type="number" id="to" value="${e.thu_tu || 0}" style="width:90px"></div></div>
    <label class="f" for="tk">Ghi chú</label><input type="text" id="tk" value="${esc(e.ghi_chu || '')}" maxlength="200">
    <div class="row" style="margin-top:10px"><button class="btn" type="button" id="tsave" data-id="${esc(ed === 'new' ? '' : ed)}">Lưu link</button><button class="ghost" type="button" id="tcancel">Huỷ</button></div></div>` : '';
  return `<div class="card"><div class="row"><h2 class="grow">Tài nguyên của lớp ${esc(LOPS[S.lop].ten)}</h2>${S.v3 ? '' : '<button class="btn" type="button" id="tnew">+ Thêm link</button>'}</div>
    <p class="muted sm" style="margin:0 0 12px">Các web của chương trình hiện sẵn. Link riêng (thư mục Drive, Sheet, nhóm Zalo, sách bài tập…) cô thêm ở đây; chúng lưu trong Google Sheet của cô, chỉ hiện sau khi nhập PIN.</p>
    ${gs.map(g => `<div class="rgrp"><h3>${esc(g.n)}</h3><div class="rlist">${g.l.map(r => `<div class="res"><a href="${esc(r.url)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><b>${esc(r.ten)}</b>${r.ghi_chu ? `<br><small>${esc(r.ghi_chu)}</small>` : ''}</a>${r.own ? `<div class="acts"><button class="ghost" type="button" data-tedit="${esc(r.id)}">Sửa</button><button class="ghost danger" type="button" data-tdel="${esc(r.id)}">Xoá</button></div>` : ''}</div>`).join('')}</div></div>`).join('')}
    ${!own.length && !S.v3 ? '<div class="empty" style="margin-top:14px">Chưa có link riêng nào. Bấm “+ Thêm link” để thêm thư mục Drive của khoá học, Google Sheet, nhóm Zalo…</div>' : ''}</div>${form}`;
}

/* =====================================================================
   SỰ KIỆN
   ===================================================================== */
function bind() {
  const root = $('#main');
  $$('[data-kid]', root).forEach(el => { const go = () => { S.kid = el.dataset.kid; S.tab = 'hs'; draw(); scrollTo(0, 0); }; el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
  $$('[data-go-dd]', root).forEach(el => el.onclick = e => { e.preventDefault(); ddInit(+el.dataset.goDd); S.tab = 'dd'; draw(); scrollTo(0, 0); });
  const kq = $('#kq'); if (kq) kq.oninput = () => { S.q = kq.value; const p = kq.selectionStart; draw(); const n = $('#kq'); n.focus(); n.setSelectionRange(p, p); };
  $$('[data-filt]', root).forEach(b => b.onclick = () => { S.filt = b.dataset.filt; draw(); });
  const bk = $('[data-back]', root); if (bk) bk.onclick = () => { S.kid = ''; draw(); };
  $$('[data-copy]', root).forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.copy); toast('Đã chép link. Dán vào Zalo gửi ba mẹ nhé.'); } catch (e) { prompt('Chép link này:', b.dataset.copy); } });
  $$('[data-ren]', root).forEach(b => b.onclick = async () => { const k = S.d.kids.find(x => x.id === b.dataset.ren), t = prompt('Tên gọi ở lớp:', k.ten); if (!t || !t.trim()) return; const r = await call('qt_hs', { id: k.id, ten: t.trim() }); if (!r.ok) return toast(r.err || 'Chưa đổi được'); toast('Đã đổi tên'); refresh(true); });
  $$('[data-tt]', root).forEach(b => b.onclick = async () => { const r = await call('qt_hs', { id: b.dataset.tt, tt: b.dataset.v }); if (!r.ok) return toast(r.err || 'Chưa lưu được'); toast(b.dataset.v ? 'Đã đánh dấu nghỉ học (không tính vào sĩ số và cảnh báo)' : 'Đã cho học lại'); refresh(true); });
  $$('[data-addnote]', root).forEach(b => b.onclick = async () => { const nd = $('#nt').value.trim(); if (!nd) return toast('Chưa có nội dung ghi chú'); b.disabled = true;
    const r = await call('qt_gc_them', { kid: b.dataset.addnote, loai: $('#nl').value, buoi: $('#nb').value, noi_dung: nd }); b.disabled = false; if (!r.ok) return toast(r.err || 'Chưa lưu được'); toast('Đã lưu ghi chú'); refresh(true); });
  $$('[data-delnote]', root).forEach(b => b.onclick = async () => { if (!confirm('Xoá ghi chú này?')) return; await call('qt_gc_xoa', { id: b.dataset.delnote }); toast('Đã xoá'); refresh(true); });
  bindDd(root); bindSq(root); bindTn(root);
}
function bindDd(root) {
  const dd = S.dd; if (!dd || S.tab !== 'dd') return;
  const ds = $('#ds'); if (!ds) return;
  ds.onchange = () => { if (dd.dirty && !confirm('Buổi này có thay đổi chưa lưu. Chuyển buổi khác?')) { ds.value = dd.n; return; } ddInit(+ds.value); draw(); };
  $('#dn').onchange = e => { dd.ngay = e.target.value; dd.dirty = true; };
  $('#dq').onchange = e => { dd.da_day = e.target.checked; dd.dirty = true; };
  $('#dg').oninput = e => { dd.ghi_chu = e.target.value; dd.dirty = true; };
  $$('[data-cm]', root).forEach(b => b.onclick = () => { const [k, c] = b.dataset.cm.split('|'), r = dd.rows[k]; r.cm = r.cm === c ? '' : c;
    if (c === 'v' || c === 'p') { if (r.cm === c) { r.tg = r.en = r.zh = r.bt = ''; } } dd.dirty = true; keepDraw(); });
  $$('[data-lv]', root).forEach(b => b.onclick = () => { const [k, f] = b.dataset.lv.split('|'), r = dd.rows[k], v = r[f] === '' ? 1 : r[f] >= 3 ? '' : r[f] + 1; r[f] = v; if (v !== '' && !r.cm) r.cm = 'c'; dd.dirty = true; keepDraw(); });
  $$('[data-nt]', root).forEach(i => i.oninput = () => { dd.rows[i.dataset.nt].note = i.value; dd.dirty = true; });
  const all = $('#allc'); if (all) all.onclick = () => { Object.values(dd.rows).forEach(r => { if (!r.cm) r.cm = 'c'; }); dd.dirty = true; keepDraw(); };
  const kgs = $('#kgs'); if (kgs) kgs.onclick = async () => { const v = $('#kg').value; const r = await call('qt_lop', { khai_giang: v }); if (!r.ok) return toast(r.err || 'Chưa lưu được'); toast('Đã lưu ngày khai giảng'); refresh(true); };
  const sv = $('#dsave'); if (sv) sv.onclick = async () => { sv.disabled = true; sv.textContent = 'Đang lưu…';
    const rows = Object.entries(dd.rows).map(([kid, r]) => Object.assign({ kid }, r)).filter(r => r.cm || r.tg || r.en || r.zh || r.bt || r.note);
    const r = await call('qt_buoi', { buoi: dd.n, ngay: dd.ngay, da_day: dd.da_day, ghi_chu: dd.ghi_chu, rows });
    if (!r.ok) { sv.disabled = false; sv.textContent = `Lưu buổi ${dd.n}`; return toast(r.err || 'Chưa lưu được'); }
    dd.dirty = false; toast(`Đã lưu buổi ${dd.n} (${r.n} bạn)`); const n = dd.n; await load(); ddInit(n); draw(); };
}
function keepDraw() { const y = scrollY, sc = $('.att-scroll'), x = sc ? sc.scrollLeft : 0; draw(); scrollTo(0, y); const s2 = $('.att-scroll'); if (s2) s2.scrollLeft = x; }
function bindSq(root) {
  $$('[data-pick]', root).forEach(b => b.onclick = () => { const id = b.dataset.pick; S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); S.n = +$('#sn').value || 1; S.why = $('#sw').value; keepDraw(); });
  const pa = $('#pall'); if (pa) pa.onclick = () => { derive().active.forEach(k => S.sel.add(k.id)); S.n = +$('#sn').value || 1; S.why = $('#sw').value; draw(); };
  const pn = $('#pnone'); if (pn) pn.onclick = () => { S.sel.clear(); draw(); };
  const gv = $('#give'); if (gv) gv.onclick = async () => { if (!S.sel.size) return toast('Chọn ít nhất một bạn'); const n = Math.max(1, Math.min(10, +$('#sn').value || 1)), why = $('#sw').value.trim();
    gv.disabled = true; const r = await call('award', { ids: [...S.sel].join(','), n, why }); gv.disabled = false; if (!r.ok) return toast(r.err || 'Chưa thưởng được');
    toast(`Đã thưởng ${n}⭐ cho ${r.n} bạn`); S.sel.clear(); S.n = n; S.why = why || WHY[0]; refresh(true); };
  $$('[data-un]', root).forEach(b => b.onclick = async () => { await call('unaward', { aid: b.dataset.un }); toast('Đã huỷ lượt thưởng'); refresh(true); });
  $$('[data-o]', root).forEach(b => b.onclick = async () => { await call('order', { code: b.dataset.o, st: b.dataset.st }); toast(b.dataset.st === 'da_trao' ? 'Đã ghi: cô đã trao quà' : 'Đã ghi: không duyệt, sao hoàn lại cho bạn'); refresh(true); });
  const ak = $('#addk'); if (ak) ak.onclick = async () => { const t = $('#nk').value.trim(); if (!t) return toast('Nhập tên gọi của bạn'); const r = await call('addkid', { ten: t }); if (!r.ok) return toast(r.err || 'Chưa thêm được'); toast('Đã thêm bạn. Mã: ' + r.id); await refresh(true); S.kid = r.id; };
}
function bindTn(root) {
  const nw = $('#tnew'); if (nw) nw.onclick = () => { S.tnEdit = 'new'; draw(); $('#tt').focus(); };
  $$('[data-tedit]', root).forEach(b => b.onclick = () => { S.tnEdit = b.dataset.tedit; draw(); $('#tt').focus(); });
  $$('[data-tdel]', root).forEach(b => b.onclick = async () => { if (!confirm('Xoá link này khỏi kho tài nguyên?')) return; await call('qt_tn_xoa', { id: b.dataset.tdel }); toast('Đã xoá'); refresh(true); });
  const c = $('#tcancel'); if (c) c.onclick = () => { S.tnEdit = null; draw(); };
  const sv = $('#tsave'); if (sv) sv.onclick = async () => { const url = $('#tu').value.trim(); if (!/^https?:\/\//i.test(url)) return toast('Link phải bắt đầu bằng https://');
    const r = await call('qt_tn_luu', { id: sv.dataset.id, ten: $('#tt').value.trim() || url, url, nhom: $('#tg').value.trim() || 'Khác', thu_tu: $('#to').value, ghi_chu: $('#tk').value.trim() });
    if (!r.ok) return toast(r.err || 'Chưa lưu được'); S.tnEdit = null; toast('Đã lưu link'); refresh(true); };
}
document.addEventListener('click', e => {
  const l = e.target.closest('[data-lop]'); if (l) { const v = l.dataset.lop; if (v === S.lop) return; S.lop = v; store.set('qtl-lop', v); S.pin = store.get('qtl-pin-' + v); S.d = null; S.kid = ''; S.dd = null; S.sel = new Set(); S.tnEdit = null; S.pin ? enter() : login(); return; }
  const t = e.target.closest('[data-tab]'); if (t) { S.tab = t.dataset.tab; if (S.tab === 'hs') S.kid = S.kid; draw(); scrollTo(0, 0); }
});
$('#logout').onclick = () => { store.set('qtl-pin-' + S.lop, ''); S.pin = ''; S.d = null; login(); };

/* =====================================================================
   MÁY CHỦ GIẢ cho ?demo=1 (localStorage)
   ===================================================================== */
function mockDb() {
  const key = 'qtl-demo-' + S.lop; let d; try { d = JSON.parse(localStorage.getItem(key)); } catch (e) {}
  if (d) return d;
  let seed = S.lop === 'ls' ? 7 : 19; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const names = S.lop === 'ls' ? ['Minh An', 'Gia Khôi', 'Bảo Linh', 'Tuệ Lâm', 'Hà My', 'Đức Anh', 'Khánh Vy', 'Nhật Minh', 'Bảo Châu', 'Quang Huy'] : ['Phương Anh', 'Hải Đăng', 'Ngọc Mai', 'Tùng Lâm', 'Gia Hân', 'Bảo Nam', 'Diệp Chi', 'Anh Khoa'];
  const now = Date.now(); d = { kids: [], awards: [], orders: [], hs: [], bl: [], gc: [], tn: [], cfg: { ten_lop: LOPS[S.lop].ten, khai_giang: ymd(new Date(now - 17 * 864e5)) }, seq: 1 };
  names.forEach((n, i) => { const ngay = Math.max(0, Math.round(5 + rnd() * 8 - (i === 2 ? 5 : 0))); const dsc = i === 2 ? 7 : Math.floor(rnd() * 4);
    d.kids.push({ id: 'DM' + S.lop.toUpperCase() + (i + 1), lop: S.lop, ten: n + ' (ví dụ)', tao: now, web: Math.round(ngay * 14 + rnd() * 20), vi: 0, ngay, cuoi: ymd(new Date(now - dsc * 864e5)), luu: now, tt: '' }); });
  [0, 1, 2, 3, 4].forEach(b => { d.bl.push({ buoi: b, ngay: ymd(new Date(now - (17 - b * 3.5) * 864e5)), da_day: true, ghi_chu: b === 2 ? 'Chưa kịp trò Bingo' : '' });
    d.kids.forEach((k, i) => { const vang = (i === 2 && b >= 3) || (i === 5 && b === 1); const l = () => 1 + Math.floor(rnd() * 3);
      d.hs.push({ buoi: b, kid: k.id, cm: vang ? (i === 5 ? 'p' : 'v') : (rnd() < .1 ? 't' : 'c'), tg: vang ? '' : (i === 4 ? 1 : l()), en: vang ? '' : l(), zh: vang ? '' : l(), bt: vang ? '' : l(), note: '' }); }); });
  d.awards.push({ id: 'A1', kid: d.kids[0].id, n: 5, why: 'Phát biểu hăng hái', at: now - 864e5, huy: false });
  d.orders.push({ code: 'Q1', kid: d.kids[1].id, ten: d.kids[1].ten, qua: 'sticker', ten_qua: 'Bộ sticker hoạt hình', sao: 120, at: now - 3600e3, st: 'cho', note: '' });
  d.gc.push({ id: 'N1', kid: d.kids[2].id, buoi: 3, loai: 'phu_huynh', nd: 'Ba mẹ báo con ốm, sẽ học bù ở nhà.', at: now - 2 * 864e5 });
  d.tn.push({ id: 'T1', nhom: 'Tài liệu khoá học', ten: 'Thư mục sách bài tập (ví dụ)', url: 'https://drive.google.com/', ghi_chu: 'Link ví dụ', thu_tu: 1 });
  return d;
}
function mock(q) {
  const d = mockDb(), save = () => { try { localStorage.setItem('qtl-demo-' + S.lop, JSON.stringify(d)); } catch (e) {} };
  if (q.pin !== '2468') return { ok: false, err: 'Sai mã PIN' };
  const id = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
  switch (q.action) {
    case 'qt_tai': return Object.assign({ ok: true, v: 4 }, JSON.parse(JSON.stringify(d)));
    case 'qt_buoi': { const i = d.bl.findIndex(x => x.buoi === +q.buoi), o = { buoi: +q.buoi, ngay: q.ngay, da_day: !!q.da_day, ghi_chu: q.ghi_chu || '' }; i < 0 ? d.bl.push(o) : d.bl[i] = o;
      (q.rows || []).forEach(r => { const j = d.hs.findIndex(x => x.buoi === +q.buoi && x.kid === r.kid), o2 = { buoi: +q.buoi, kid: r.kid, cm: r.cm || '', tg: r.tg, en: r.en, zh: r.zh, bt: r.bt, note: r.note || '' }; j < 0 ? d.hs.push(o2) : d.hs[j] = o2; }); save(); return { ok: true, n: (q.rows || []).length }; }
    case 'qt_gc_them': { const o = { id: id('N'), kid: q.kid, buoi: q.buoi === '' ? '' : +q.buoi, loai: q.loai, nd: q.noi_dung, at: Date.now() }; d.gc.unshift(o); save(); return { ok: true, note: o }; }
    case 'qt_gc_xoa': d.gc = d.gc.filter(x => x.id !== q.id); save(); return { ok: true };
    case 'qt_hs': { const k = d.kids.find(x => x.id === q.id); if (k) { if (q.ten) k.ten = q.ten; if (q.tt != null) k.tt = q.tt; } save(); return { ok: true }; }
    case 'qt_lop': d.cfg.khai_giang = q.khai_giang; save(); return { ok: true };
    case 'qt_tn_luu': { const o = { id: q.id || id('T'), nhom: q.nhom, ten: q.ten, url: q.url, ghi_chu: q.ghi_chu, thu_tu: +q.thu_tu || 0 }, i = d.tn.findIndex(x => x.id === o.id); i < 0 ? d.tn.push(o) : d.tn[i] = o; save(); return { ok: true, id: o.id }; }
    case 'qt_tn_xoa': d.tn = d.tn.filter(x => x.id !== q.id); save(); return { ok: true };
    case 'award': { const ids = String(q.ids || '').split(',').filter(Boolean); ids.forEach(k => d.awards.unshift({ id: id('A'), kid: k, n: +q.n || 1, why: q.why || '', at: Date.now(), huy: false })); save(); return { ok: true, n: ids.length }; }
    case 'unaward': { const a = d.awards.find(x => x.id === q.aid); if (a) a.huy = true; save(); return { ok: true }; }
    case 'order': { const o = d.orders.find(x => x.code === q.code); if (o) { o.st = q.st; } save(); return { ok: true }; }
    case 'addkid': { const k = id(''); d.kids.push({ id: k, lop: S.lop, ten: q.ten, tao: Date.now(), web: 0, vi: 0, ngay: 0, cuoi: '', luu: 0, tt: '' }); save(); return { ok: true, id: k }; }
  }
  return { ok: false, err: 'Lệnh không rõ' };
}

/* ---------- khởi động ---------- */
S.pin = store.get('qtl-pin-' + S.lop);
if (DEMO && !S.pin) { S.pin = '2468'; }
S.pin ? enter() : login();
