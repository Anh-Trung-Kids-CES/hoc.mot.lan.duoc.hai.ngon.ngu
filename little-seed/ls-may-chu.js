/* =====================================================================
   LITTLE SEED · NỐI MÁY CHỦ (Google Sheet quản lý lớp, qua Apps Script) – dùng chung máy chủ với web Seedling.
   - SDL_API: dán link /exec của Apps Script (mã ở apps-script/lop-offline-48/Code.gs, cách bật ở HUONG-DAN.md).
     Để trống = bản xem thử: "máy chủ giả" lưu trên chính máy này (PIN 2468, 3 bạn ví dụ).
   - LOP: mã lớp trên máy chủ ('ls' = Little Seed, 'sd' = Seedling). PIN của từng lớp nằm ở tab CaiDat của Sheet.
   - Lệnh: kid, hello, redeem, tai, luu (web của con); cls, award, unaward, order, addkid (Bảng của cô, cần PIN).
   - TIẾN ĐỘ KHÔNG MẤT KHI ĐỔI MÁY: mỗi lần lưu, web gửi bản tiến độ đầy đủ của con lên máy chủ (gom 5 giây/lần).
     Máy mới mở link ?con=MÃ (hoặc ba mẹ nhập mã) → web lấy bản trên máy chủ về, gộp với bản trên máy (không bỏ ngày nào
     con đã học) rồi học tiếp. Máy chủ giữ số phiên bản: máy nào gửi bản cũ hơn sẽ được trả bản mới để gộp rồi gửi lại.
   ===================================================================== */
const SDL_API = 'https://script.google.com/macros/s/AKfycbxGmqsyBcA-NxzE50aJEx5ZOEYxnxcoROthFs_6utXPtpfNhRqHaq89Ry3urcGLWdfKhw/exec';
const API_ON = !!SDL_API;
const LOP = 'ls', KEY = 'lsd';

/* ---------- máy chủ giả cho bản xem thử (localStorage) ---------- */
const FAKE_PIN = '2468';
function fakeDb() {
  let d = sget(KEY + '-fake-server', null);
  if (!d) { const t = Date.now();
    d = { kids: { MAYNAY: { id: 'MAYNAY', ten: 'Bé trên máy này', tao: t, web: 0, ngay: 0, cuoi: '' },
        VDAN: { id: 'VDAN', ten: 'Minh An (ví dụ)', tao: t, web: 142, ngay: 4, cuoi: today() },
        VDKHOI: { id: 'VDKHOI', ten: 'Gia Khôi (ví dụ)', tao: t, web: 88, ngay: 3, cuoi: addDays(-1) },
        VDLINH: { id: 'VDLINH', ten: 'Bảo Linh (ví dụ)', tao: t, web: 35, ngay: 1, cuoi: addDays(-3) } },
      awards: [{ id: 'A1', kid: 'VDAN', n: 5, why: 'Phát biểu hăng hái', at: t - 864e5, huy: false }], orders: [] };
    sset(KEY + '-fake-server', d); }
  d.td = d.td || {};
  return d;
}
function fakeSave(d) { sset(KEY + '-fake-server', d); }
function fakeId(p) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = p || ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function fakeCall(q) {
  const d = fakeDb(), pinOk = q.pin === FAKE_PIN;
  const kidOut = id => ({ ok: true, kid: d.kids[id] || null, awards: d.awards.filter(a => a.kid === id && !a.huy), orders: d.orders.filter(o => o.kid === id) });
  switch (q.action) {
    case 'ping': return { ok: true, v: 2, fake: true };
    case 'kid': return kidOut(q.id);
    case 'hello': { const k = d.kids[q.id]; if (!k) return { ok: false, err: 'Không có mã con này' };
      Object.assign(k, { web: +q.web || 0, ngay: +q.ngay || 0, cuoi: q.cuoi || '', vi: +q.vi || 0 }); if (q.ten && k.id === 'MAYNAY') k.ten = q.ten; fakeSave(d); return { ok: true }; }
    case 'redeem': { if (!d.kids[q.id]) return { ok: false, err: 'Không có mã con này' };
      if (!d.orders.some(o => o.code === q.code)) d.orders.unshift({ code: q.code, kid: q.id, ten: d.kids[q.id].ten, qua: q.qua, ten_qua: q.ten_qua, sao: +q.sao, at: Date.now(), st: 'cho', note: '' });
      fakeSave(d); return { ok: true }; }
    case 'tai': { if (!d.kids[q.id]) return { ok: false, err: 'Không có mã con này' }; const t = d.td[q.id]; return { ok: true, v: t ? t.v : 0, t: t ? t.t : 0, data: t ? t.data : '' }; }
    case 'luu': { if (!d.kids[q.id]) return { ok: false, err: 'Không có mã con này' }; const t = d.td[q.id], cur = t ? t.v : 0;
      if ((+q.base || 0) !== cur) return { ok: false, xung: true, v: cur, t: t.t, data: t.data };
      d.td[q.id] = { v: cur + 1, t: +q.t || Date.now(), data: q.data }; d.kids[q.id].luu = Date.now(); fakeSave(d); return { ok: true, v: cur + 1 }; }
    case 'cls': if (!pinOk) return { ok: false, err: 'Sai mã PIN' };
      return { ok: true, kids: Object.values(d.kids), awards: d.awards.slice(0, 200), orders: d.orders };
    case 'award': { if (!pinOk) return { ok: false, err: 'Sai mã PIN' }; const ids = String(q.ids || '').split(',').filter(x => d.kids[x]);
      ids.forEach(id => d.awards.unshift({ id: fakeId('A'), kid: id, n: +q.n || 1, why: q.why || '', at: Date.now(), huy: false })); fakeSave(d); return { ok: true, n: ids.length }; }
    case 'unaward': { if (!pinOk) return { ok: false, err: 'Sai mã PIN' }; const a = d.awards.find(x => x.id === q.aid); if (a) a.huy = true; fakeSave(d); return { ok: true }; }
    case 'order': { if (!pinOk) return { ok: false, err: 'Sai mã PIN' }; const o = d.orders.find(x => x.code === q.code); if (o) { o.st = q.st; o.note = q.note || ''; } fakeSave(d); return { ok: true }; }
    case 'addkid': { if (!pinOk) return { ok: false, err: 'Sai mã PIN' }; const id = fakeId('');
      d.kids[id] = { id, ten: String(q.ten || '').trim() || 'Bạn mới', tao: Date.now(), web: 0, ngay: 0, cuoi: '' }; fakeSave(d); return { ok: true, id }; }
  }
  return { ok: false, err: 'Lệnh không rõ' };
}
/* ---------- gọi máy chủ: lệnh nhỏ đi GET, tiến độ (dài) đi POST ---------- */
async function api(q) {
  q = Object.assign({ lop: LOP }, q);
  if (!API_ON) return fakeCall(q);
  try {
    let r;
    if (q.action === 'luu') r = await fetch(SDL_API, { method: 'POST', body: JSON.stringify(q), redirect: 'follow' });   // text/plain: không cần hỏi trước (CORS)
    else r = await fetch(SDL_API + '?' + Object.entries(q).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v == null ? '' : v)).join('&'), { redirect: 'follow' });
    return await r.json();
  } catch (e) { return { ok: false, err: 'Không nối được máy chủ', net: true }; }
}

/* ---------- mã của con trên máy này ---------- */
function kidId() {
  try { const m = location.search.match(/[?&]con=([A-Za-z0-9]+)/); if (m && P.kidId !== m[1].toUpperCase()) clSwitch(m[1].toUpperCase()); } catch (e) {}
  if (!P.kidId && !API_ON) { P.kidId = 'MAYNAY'; save(); }
  if (P.kidId && CL.pulled !== P.kidId && !CL.busy && Date.now() - CL.tryAt > 30000) setTimeout(clPull, 0);
  return P.kidId || '';
}

/* =====================================================================
   TIẾN ĐỘ TRÊN MÁY CHỦ
   ===================================================================== */
const CL = { timer: 0, busy: false, pulled: '', dirty: false, last: 0, err: '', tryAt: 0 };
const clCopy = o => JSON.parse(JSON.stringify(o == null ? {} : o));
const clEmpty = () => ({ days: {}, stars: 0, hop: {} });
/* so sánh 2 bản không phụ thuộc thứ tự khoá */
function clKey(o) { return JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).sort().reduce((a, x) => (a[x] = v[x], a), {}) : v); }
/* phần gửi lên: bỏ mã con và số phiên bản (là thông tin của máy này) */
function clPack(p) { const o = clCopy(p); delete o.kidId; delete o._sv; return o; }
function clHasWork(p) { return !!p && (Object.keys(p.days || {}).length > 0 || (+p.stars || 0) > 0 || Object.keys(p.on || {}).length > 0); }
/* gộp 2 bản tiến độ của CÙNG một con: lấy bản mới hơn làm nền, rồi thêm mọi thứ bản kia có mà bản nền thiếu.
   Không bao giờ bỏ một ngày, một bước, một thẻ Hộp ôn, một phiếu quà con đã có ở bất kỳ máy nào. */
function clMerge(x, y) {
  x = x || {}; y = y || {};
  const xt = +x._t || 0, yt = +y._t || 0, n = clCopy(xt >= yt ? x : y), o = xt >= yt ? y : x;
  const addMissing = (a, b) => { Object.keys(b || {}).forEach(k => { if (!(k in a)) a[k] = clCopy(b[k]); }); return a; };
  const maxNum = (a, b) => { Object.keys(b || {}).forEach(k => { a[k] = Math.max(+a[k] || 0, +b[k] || 0); }); return a; };
  n.days = n.days || {};
  Object.keys(o.days || {}).forEach(d => { const s = o.days[d], t = n.days[d];
    if (!t) { n.days[d] = clCopy(s); return; }
    t.steps = maxNum(t.steps || {}, s.steps); if (s.done) t.done = true; });
  n.stars = Math.max(+n.stars || 0, +o.stars || 0);
  n.on = addMissing(n.on || {}, o.on); n.hop = addMissing(n.hop || {}, o.hop); n.onLog = maxNum(n.onLog || {}, o.onLog);
  if (o._shop) { const s = n._shop = n._shop || {}, t = o._shop;
    s.spent = Math.max(+s.spent || 0, +t.spent || 0); s.own = addMissing(s.own || {}, t.own);
    ['pets', 'mons'].forEach(f => { s[f] = s[f] || []; (t[f] || []).forEach(z => { if (!s[f].some(w => w.sp === z.sp)) s[f].push(clCopy(z)); }); });
    s.orders = s.orders || []; (t.orders || []).forEach(z => { if (!s.orders.some(w => w.code === z.code)) s.orders.push(clCopy(z)); }); }
  if (o._j) { const j = n._j = n._j || {}, t = o._j;
    ['days', 'lop', 'badges', 'gifts'].forEach(f => { j[f] = addMissing(j[f] || {}, t[f]); });
    j.rec = Math.max(+j.rec || 0, +t.rec || 0); j.on = Math.max(+j.on || 0, +t.on || 0); }
  if (o.co) { const c = n.co = n.co || { awards: [], seen: {} }; c.seen = addMissing(c.seen || {}, o.co.seen); }
  n._t = Math.max(xt, yt);
  return n;
}
function clParse(s) { try { return s ? (typeof s === 'string' ? JSON.parse(s) : s) : null; } catch (e) { return null; } }
function clStore() { sset(KEY + '-progress', P); try { updStars(); } catch (e) {} }
/* màn đang làm bài thì không vẽ lại giữa chừng */
function clCanRedraw() { return !/^#\/(ngay|on|co|reader)/.test(location.hash || ''); }

/* đổi sang con khác trên cùng máy (anh chị em dùng chung máy): cất bản của con cũ, mở bản của con mới */
function clSwitch(id) {
  const old = P.kidId;
  if (old && old !== id) {
    sset(KEY + '-progress@' + old, P);
    if (CL.dirty) clPush(true);
    P = sget(KEY + '-progress@' + id, null) || clEmpty();
  }
  P.kidId = id; P.co = P.co || { awards: [], seen: {} };
  CL.pulled = ''; CL.tryAt = 0; clStore();
}

/* lấy bản trên máy chủ về và gộp */
async function clPull() {
  const id = P.kidId; if (!id || CL.busy) return; CL.busy = true; CL.tryAt = Date.now();
  try {
    const r = await api({ action: 'tai', id }); if (!r || !r.ok || P.kidId !== id) return;
    CL.pulled = id;
    const srv = clParse(r.data), hadLocal = clHasWork(P);
    if (srv) {
      const before = clKey(clPack(P)), m = clMerge(clPack(P), srv);
      m.kidId = id; m._sv = +r.v || 0;
      const changed = clKey(clPack(m)) !== before;
      P = m; clStore();
      if (changed) {
        if (!hadLocal) toast('Đã lấy lại bài con học ở máy khác ✓');
        if (clCanRedraw()) try { route(); } catch (e) {}
      }
      if (clKey(clPack(m)) !== clKey(clPack(Object.assign({}, srv, { _t: m._t })))) clSoon(1500);   // máy này có thêm bài → gửi lên
    } else { P._sv = +r.v || 0; clStore(); if (hadLocal) clSoon(1500); }
  } finally { CL.busy = false; }
}

/* gửi bản đầy đủ lên; nếu máy chủ có bản mới hơn thì gộp rồi gửi lại */
function clSoon(ms) { if (!P.kidId) return; CL.dirty = true; clearTimeout(CL.timer); CL.timer = setTimeout(() => clPush(), ms == null ? 5000 : ms); }
async function clPush(now, tries) {
  const id = P.kidId; if (!id) return; clearTimeout(CL.timer);
  if (CL.pulled !== id) { if (!CL.busy) await clPull(); if (CL.pulled !== id) return; }   // chưa lấy được bản máy chủ thì chưa gửi, tránh đè
  const r = await api({ action: 'luu', id, base: +P._sv || 0, t: +P._t || Date.now(), data: JSON.stringify(clPack(P)) });
  if (P.kidId !== id) return;
  if (r && r.ok) { P._sv = +r.v; CL.dirty = false; CL.last = Date.now(); CL.err = ''; sset(KEY + '-progress', P); return; }
  if (r && r.xung && (tries || 0) < 3) {
    const m = clMerge(clPack(P), clParse(r.data) || {}); m.kidId = id; m._sv = +r.v || 0; P = m; clStore();
    return clPush(now, (tries || 0) + 1);
  }
  CL.err = (r && r.err) || 'Chưa gửi được'; if (r && r.net) clSoon(30000);
}
/* tắt tab / chuyển app: gửi nốt phần chưa gửi */
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && CL.dirty && API_ON) clPush(true); });
addEventListener('online', () => { if (CL.dirty) clPush(true); });
/* dòng trạng thái cho mục Ba mẹ */
function clStatus() {
  if (!P.kidId) return '';
  if (!API_ON) return 'Bản xem thử: tiến độ chỉ lưu trên máy này.';
  if (CL.err) return 'Chưa lưu được lên lớp (' + CL.err + '). Web sẽ thử lại khi có mạng.';
  if (CL.dirty) return 'Đang chờ lưu bài mới nhất lên lớp…';
  return CL.last ? 'Đã lưu bài lên lớp lúc ' + new Date(CL.last).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + '.' : 'Bài của con được lưu lên lớp.';
}
