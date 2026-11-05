/* =====================================================================
   SEEDLING · NỐI MÁY CHỦ (Google Sheet qua Apps Script) – cùng cách web 21 ngày.
   - SDL_API: dán link /exec của Apps Script (xem apps-script/HUONG-DAN.md). Để trống = bản xem thử:
     "máy chủ giả" lưu trên chính máy này, để chị thử Bảng của cô và web của con trên cùng một trình duyệt.
   - Mọi lệnh là GET và trả JSON: kid, hello, redeem (web của con); cls, award, unaward, order, addkid (Bảng của cô, cần mã PIN).
   ===================================================================== */
const SDL_API = '';
const API_ON = !!SDL_API;

/* ---------- máy chủ giả cho bản xem thử (localStorage) ---------- */
const FAKE_PIN = '2468';
function fakeDb() {
  let d = sget('sdl-fake-server', null);
  if (!d) { const t = Date.now();
    d = { kids: { MAYNAY: { id: 'MAYNAY', ten: 'Bé trên máy này', tao: t, web: 0, ngay: 0, cuoi: '' },
        VDAN: { id: 'VDAN', ten: 'Minh An (ví dụ)', tao: t, web: 142, ngay: 4, cuoi: today() },
        VDKHOI: { id: 'VDKHOI', ten: 'Gia Khôi (ví dụ)', tao: t, web: 88, ngay: 3, cuoi: addDays(-1) },
        VDLINH: { id: 'VDLINH', ten: 'Bảo Linh (ví dụ)', tao: t, web: 35, ngay: 1, cuoi: addDays(-3) } },
      awards: [{ id: 'A1', kid: 'VDAN', n: 5, why: 'Phát biểu hăng hái', at: t - 864e5, huy: false }], orders: [] };
    sset('sdl-fake-server', d); }
  return d;
}
function fakeSave(d) { sset('sdl-fake-server', d); }
function fakeId(p) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = p || ''; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function fakeCall(q) {
  const d = fakeDb(), pinOk = q.pin === FAKE_PIN;
  const kidOut = id => ({ ok: true, kid: d.kids[id] || null, awards: d.awards.filter(a => a.kid === id && !a.huy), orders: d.orders.filter(o => o.kid === id) });
  switch (q.action) {
    case 'ping': return { ok: true, v: 1, fake: true };
    case 'kid': return kidOut(q.id);
    case 'hello': { const k = d.kids[q.id]; if (!k) return { ok: false, err: 'Không có mã con này' };
      Object.assign(k, { web: +q.web || 0, ngay: +q.ngay || 0, cuoi: q.cuoi || '', vi: +q.vi || 0 }); if (q.ten && k.id === 'MAYNAY') k.ten = q.ten; fakeSave(d); return { ok: true }; }
    case 'redeem': { if (!d.kids[q.id]) return { ok: false, err: 'Không có mã con này' };
      if (!d.orders.some(o => o.code === q.code)) d.orders.unshift({ code: q.code, kid: q.id, ten: d.kids[q.id].ten, qua: q.qua, ten_qua: q.ten_qua, sao: +q.sao, at: Date.now(), st: 'cho', note: '' });
      fakeSave(d); return { ok: true }; }
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
/* ---------- gọi máy chủ ---------- */
async function api(q) {
  if (!API_ON) return fakeCall(q);
  try { const u = SDL_API + '?' + Object.entries(q).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v == null ? '' : v)).join('&');
    const r = await fetch(u, { redirect: 'follow' }); return await r.json(); }
  catch (e) { return { ok: false, err: 'Không nối được máy chủ', net: true }; }
}

/* ---------- mã của con trên máy này ---------- */
function kidId() {
  try { const m = location.search.match(/[?&]con=([A-Za-z0-9]+)/); if (m && P.kidId !== m[1]) { P.kidId = m[1]; save(); } } catch (e) {}
  if (!P.kidId && !API_ON) { P.kidId = 'MAYNAY'; save(); }
  return P.kidId || '';
}
