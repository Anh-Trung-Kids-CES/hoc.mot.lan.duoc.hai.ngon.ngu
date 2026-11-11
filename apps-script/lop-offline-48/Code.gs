/**
 * MÁY CHỦ LỚP OFFLINE 48 BUỔI · Little Seed + Seedling (Google Apps Script gắn với Google Sheet quản lý)
 *
 * Một Sheet, một link /exec dùng chung cho cả hai web:
 *   little-seed/ls-may-chu.js      → lop = 'ls'
 *   seedling/seedling-may-chu.js   → lop = 'sd'
 *
 * Tab trong Sheet (tự tạo nếu thiếu, chạy hàm caiDat một lần):
 *   CaiDat   : PIN của từng lớp (cô sửa thẳng trong Sheet)
 *   HocSinh  : mỗi con một dòng: lớp, mã, tên, tổng sao web, ví sao, số ngày web, lần học cuối
 *   TienDo   : bản lưu ĐẦY ĐỦ tiến độ của con (ngày đã học, Hộp ôn, sao, quà…) để con đổi máy không mất bài
 *   Thuong   : từng lượt cô thưởng sao
 *   DoiQua   : yêu cầu đổi quà thật
 *
 * Lệnh của web con (không cần PIN, chỉ cần mã con):
 *   GET  kid, hello, redeem, tai (lấy tiến độ)      POST luu (gửi tiến độ, có kiểm phiên bản)
 *   GET  video (Góc vinh danh: danh sách video trong thư mục Drive của lớp, ai cũng xem được)
 * Lệnh của Bảng của cô (cần PIN của lớp):
 *   GET  cls, award, unaward, order, addkid
 */

const TAB = {
  CaiDat:  ['lop', 'ten_lop', 'pin', 'ghi_chu', 'video_folder', 'khai_giang'],
  HocSinh: ['lop', 'id', 'ten', 'tao', 'web', 'vi', 'ngay', 'cuoi', 'luu_cuoi'],
  TienDo:  ['lop', 'id', 'v', 't', 'capnhat', 'do_dai', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'],
  Thuong:  ['id', 'lop', 'kid', 'n', 'why', 'at', 'huy'],
  DoiQua:  ['code', 'lop', 'kid', 'ten', 'qua', 'ten_qua', 'sao', 'at', 'st', 'note']
};
const LOP_MAC_DINH = [['ls', 'Little Seed offline 48 buổi'], ['sd', 'Seedling offline 48 buổi']];
const TEXT_COLS = { HocSinh: ['lop', 'id', 'ten', 'cuoi'], TienDo: ['lop', 'id', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6'], Thuong: ['id', 'lop', 'kid'],
  DoiQua: ['code', 'lop', 'kid'], CaiDat: ['lop', 'pin', 'video_folder', 'khai_giang'] };
const VIDEO_CACHE_GIAY = 300;   // danh sách video nhớ 5 phút: video mới thả vào Drive hiện trên web chậm nhất ~5 phút
const CHUNK = 45000;           // một ô Google Sheet chứa tối đa 50.000 ký tự
const MAX_DATA = CHUNK * 6;    // ~270.000 ký tự tiến độ mỗi con

/* ===================== cổng vào ===================== */
function doGet(e) { return run_(() => handle_((e && e.parameter) || {})); }
function doPost(e) {
  return run_(() => {
    let q = {};
    try { q = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) { return { ok: false, err: 'Dữ liệu gửi lên không đọc được' }; }
    return handle_(q);
  });
}
function run_(fn) {
  let out; const lock = LockService.getScriptLock();
  try { lock.waitLock(15000); out = fn(); }
  catch (err) { out = { ok: false, err: String(err && err.message || err) }; }
  finally { try { lock.releaseLock(); } catch (x) {} }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(q) {
  const lop = String(q.lop || '').trim();
  const pinOk = () => { const p = pinOf_(lop); return !!p && String(q.pin || '').trim() === p; };
  const needPin = () => (pinOk() ? null : { ok: false, err: lop ? 'Sai mã PIN' : 'Thiếu mã lớp' });

  switch (q.action) {
    case 'ping': return { ok: true, v: 3 };

    /* ---------- Góc vinh danh (công khai) ---------- */
    case 'video': {
      const cfg = rows_('CaiDat').find(x => x.lop === lop); if (!cfg) return { ok: false, err: 'Thiếu mã lớp' };
      const cache = CacheService.getScriptCache(), ck = 'vd_' + lop + '_' + String(cfg.video_folder || '');
      if (q.moi !== '1') { const c = cache.get(ck); if (c) return JSON.parse(c); }
      const out = { ok: true, start: ngay_(cfg.khai_giang), items: cfg.video_folder ? videos_(String(cfg.video_folder).trim()) : [] };
      try { cache.put(ck, JSON.stringify(out), VIDEO_CACHE_GIAY); } catch (x) {}
      return out;
    }

    /* ---------- web của con ---------- */
    case 'kid': {
      const k = find_('HocSinh', 'id', q.id);
      return { ok: true, kid: k ? kidOut_(k.obj) : null,
        awards: rows_('Thuong').filter(a => a.kid === String(q.id) && !truthy_(a.huy)).map(awardOut_),
        orders: rows_('DoiQua').filter(o => o.kid === String(q.id)).map(orderOut_) };
    }
    case 'hello': {
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      set_('HocSinh', k.row, { web: +q.web || 0, vi: +q.vi || 0, ngay: +q.ngay || 0, cuoi: String(q.cuoi || '') });
      return { ok: true };
    }
    case 'redeem': {
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      if (!find_('DoiQua', 'code', q.code)) add_('DoiQua', { code: String(q.code), lop: k.obj.lop, kid: String(q.id), ten: k.obj.ten,
        qua: q.qua || '', ten_qua: q.ten_qua || '', sao: +q.sao || 0, at: new Date(), st: 'cho', note: '' });
      return { ok: true };
    }
    case 'tai': {   // lấy bản tiến độ đầy đủ của con
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const t = find_('TienDo', 'id', q.id);
      return { ok: true, v: t ? +t.obj.v || 0 : 0, t: t ? +t.obj.t || 0 : 0, data: t ? readData_(t.obj) : '' };
    }
    case 'luu': {   // lưu bản tiến độ; base phải trùng phiên bản đang có, nếu không trả bản mới hơn để web gộp rồi gửi lại
      const k = find_('HocSinh', 'id', q.id); if (!k) return { ok: false, err: 'Không có mã con này' };
      const data = typeof q.data === 'string' ? q.data : JSON.stringify(q.data || {});
      if (data.length > MAX_DATA) return { ok: false, err: 'Tiến độ quá lớn để lưu' };
      const t = find_('TienDo', 'id', q.id), cur = t ? +t.obj.v || 0 : 0;
      if ((+q.base || 0) !== cur) return { ok: false, xung: true, v: cur, t: t ? +t.obj.t || 0 : 0, data: t ? readData_(t.obj) : '' };
      const o = { lop: k.obj.lop, id: String(q.id), v: cur + 1, t: +q.t || Date.now(), capnhat: new Date(), do_dai: data.length };
      for (let i = 0; i < 6; i++) o['d' + (i + 1)] = data.slice(i * CHUNK, (i + 1) * CHUNK);
      if (t) set_('TienDo', t.row, o); else add_('TienDo', o);
      set_('HocSinh', k.row, { luu_cuoi: new Date() });
      return { ok: true, v: cur + 1 };
    }

    /* ---------- Bảng của cô (PIN theo lớp) ---------- */
    case 'cls': {
      const bad = needPin(); if (bad) return bad;
      const kids = rows_('HocSinh').filter(k => k.lop === lop), ids = new Set(kids.map(k => k.id));
      return { ok: true, kids: kids.map(kidOut_),
        awards: rows_('Thuong').filter(a => ids.has(a.kid)).reverse().slice(0, 300).map(awardOut_),
        orders: rows_('DoiQua').filter(o => ids.has(o.kid)).reverse().map(orderOut_) };
    }
    case 'award': {
      const bad = needPin(); if (bad) return bad;
      const ids = String(q.ids || '').split(',').filter(Boolean), mine = new Set(rows_('HocSinh').filter(k => k.lop === lop).map(k => k.id));
      let n = 0; ids.forEach(id => { if (!mine.has(id)) return; add_('Thuong', { id: newId_('A'), lop, kid: id, n: +q.n || 1, why: String(q.why || '').slice(0, 120), at: new Date(), huy: '' }); n++; });
      return { ok: true, n };
    }
    case 'unaward': {
      const bad = needPin(); if (bad) return bad;
      const a = find_('Thuong', 'id', q.aid); if (a && a.obj.lop === lop) set_('Thuong', a.row, { huy: 'x' });
      return { ok: true };
    }
    case 'order': {
      const bad = needPin(); if (bad) return bad;
      const o = find_('DoiQua', 'code', q.code); if (o && o.obj.lop === lop) set_('DoiQua', o.row, { st: String(q.st || ''), note: String(q.note || '') });
      return { ok: true };
    }
    case 'addkid': {
      const bad = needPin(); if (bad) return bad;
      const ten = String(q.ten || '').trim().slice(0, 40) || 'Bạn mới';
      let id; do { id = newId_(''); } while (find_('HocSinh', 'id', id));
      add_('HocSinh', { lop, id, ten, tao: new Date(), web: 0, vi: 0, ngay: 0, cuoi: '', luu_cuoi: '' });
      return { ok: true, id };
    }
  }
  return { ok: false, err: 'Lệnh không rõ' };
}

/* ===================== cài đặt lần đầu (chị chạy hàm này 1 lần trong trình soạn Apps Script) ===================== */
function caiDat() {
  Object.keys(TAB).forEach(name => sh_(name));
  const cd = sh_('CaiDat'), have = rows_('CaiDat').map(r => r.lop);
  LOP_MAC_DINH.forEach(([lop, ten]) => { if (!have.includes(lop)) add_('CaiDat', { lop, ten_lop: ten, pin: String(100000 + Math.floor(Math.random() * 900000)), ghi_chu: 'Cô có thể sửa PIN ở ô này' }); });
  cd.autoResizeColumns(1, 4);
  Logger.log('Xong. PIN hiện tại: ' + rows_('CaiDat').map(r => r.ten_lop + ' = ' + r.pin).join(' · '));
}

/* ===================== Góc vinh danh ===================== */
/* Đọc video trong thư mục của lớp (và một tầng thư mục con, nếu cô muốn chia theo tuần).
   Tên tệp: "Bông – đọc truyện Unit 2.mp4"; có thể thêm mã con trong ngoặc vuông: "Bông [ZTK2A7] – đọc truyện.mp4". */
function videos_(folderId) {
  const out = [], seen = {};
  const scan = (f, depth) => {
    const it = f.getFiles();
    while (it.hasNext() && out.length < 600) {
      const x = it.next(), mt = String(x.getMimeType() || '');
      if (!/^video\//.test(mt) || seen[x.getId()] || x.isTrashed()) continue; seen[x.getId()] = 1;
      const raw = String(x.getName() || '').replace(/\.[A-Za-z0-9]{2,4}$/, '');
      const m = raw.match(/\[([A-Za-z0-9]{4,8})\]/), kid = m ? m[1].toUpperCase() : '';
      const clean = raw.replace(/\s*\[[A-Za-z0-9]{4,8}\]\s*/, ' ').replace(/\s+/g, ' ').trim();
      const parts = clean.split(/\s+[–—-]\s+|_/);
      out.push({ id: x.getId(), ten: (parts[0] || '').trim(), bai: parts.slice(1).join(' – ').trim(), kid, t: x.getDateCreated().getTime() });
    }
    if (depth < 1) { const sub = f.getFolders(); while (sub.hasNext()) scan(sub.next(), depth + 1); }
  };
  scan(DriveApp.getFolderById(folderId), 0);
  return out.sort((a, b) => b.t - a.t);
}
/* ngày khai giảng → "yyyy-mm-dd" (web tự tính tuần theo giờ trên máy con). Nhận ô ngày, "2026-11-16" hoặc "16/11/2026" */
function ngay_(v) {
  if (v === '' || v == null) return '';
  if (typeof v === 'number') return Utilities.formatDate(new Date(v), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  const s = String(v).trim(), p2 = n => ('0' + n).slice(-2); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return m[1] + '-' + p2(m[2]) + '-' + p2(m[3]);
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return m[3] + '-' + p2(m[2]) + '-' + p2(m[1]);
  return '';
}
/* Chị chạy hàm này một lần trong trình soạn Apps Script để cấp quyền đọc Drive và xem máy chủ thấy bao nhiêu video */
function thuVideo() {
  rows_('CaiDat').forEach(r => {
    if (!r.video_folder) return Logger.log(r.ten_lop + ': chưa có thư mục video');
    const v = videos_(String(r.video_folder).trim());
    Logger.log(r.ten_lop + ': ' + v.length + ' video' + (v[0] ? ' · mới nhất: ' + v[0].ten + ' – ' + v[0].bai : ''));
  });
}

/* ===================== tiện ích Sheet ===================== */
const SH_ = {};   // nhớ tab đã kiểm trong một lượt gọi
function sh_(name) {
  if (SH_[name]) return SH_[name];
  const ss = SpreadsheetApp.getActiveSpreadsheet(); let s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  const head = TAB[name], cur = s.getLastColumn() ? s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String) : [];
  const miss = head.filter(h => !cur.includes(h));
  if (!cur.filter(Boolean).length) {
    s.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#FFF4CC'); s.setFrozenRows(1);
  } else if (miss.length) {
    s.getRange(1, cur.length + 1, 1, miss.length).setValues([miss]).setFontWeight('bold').setBackground('#FFF4CC');
  }
  if (!cur.filter(Boolean).length || miss.length) {
    const hh = s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String);
    (TEXT_COLS[name] || []).forEach(c => { const j = hh.indexOf(c); if (j >= 0) s.getRange(2, j + 1, Math.max(1, s.getMaxRows() - 1), 1).setNumberFormat('@'); });
  }
  return (SH_[name] = s);
}
function head_(s) { return s.getRange(1, 1, 1, s.getLastColumn()).getValues()[0].map(String); }
function rows_(name) {
  const s = sh_(name), v = s.getDataRange().getValues(), h = v[0].map(String);
  return v.slice(1).filter(r => r.some(x => x !== '')).map(r => { const o = {}; h.forEach((k, j) => o[k] = norm_(k, r[j])); return o; });
}
function find_(name, key, val) {
  const s = sh_(name), v = s.getDataRange().getValues(), h = v[0].map(String), c = h.indexOf(key);
  for (let i = 1; i < v.length; i++) if (String(v[i][c]) === String(val)) { const o = {}; h.forEach((k, j) => o[k] = norm_(k, v[i][j])); return { row: i + 1, obj: o }; }
  return null;
}
/* cột chữ (mã con, ngày "2026-11-10"…) đặt định dạng văn bản trước khi ghi để Sheet không tự đổi thành số hay ngày */
function add_(name, o) {
  const s = sh_(name), h = head_(s), row = s.getLastRow() + 1, tx = TEXT_COLS[name] || [];
  h.forEach((k, j) => { if (tx.includes(k)) s.getRange(row, j + 1).setNumberFormat('@'); });
  s.getRange(row, 1, 1, h.length).setValues([h.map(k => o[k] === undefined ? '' : (tx.includes(k) ? String(o[k]) : o[k]))]);
}
function set_(name, row, o) {
  const s = sh_(name), h = head_(s), tx = TEXT_COLS[name] || [];
  Object.keys(o).forEach(k => { const c = h.indexOf(k); if (c < 0) return; const r = s.getRange(row, c + 1);
    if (tx.includes(k)) r.setNumberFormat('@').setValue(String(o[k])); else r.setValue(o[k]); });
}
function norm_(k, x) {
  if (x instanceof Date) return x.getTime();
  if (['id', 'kid', 'lop', 'code', 'pin', 'ten', 'cuoi', 'video_folder'].includes(k)) return String(x);
  return x;
}
function pinOf_(lop) { const r = rows_('CaiDat').find(x => x.lop === lop); return r ? String(r.pin).trim() : ''; }
function readData_(o) { let s = ''; for (let i = 1; i <= 6; i++) s += String(o['d' + i] || ''); return s; }
function kidOut_(k) { return { id: k.id, lop: k.lop, ten: k.ten, tao: k.tao, web: +k.web || 0, vi: +k.vi || 0, ngay: +k.ngay || 0, cuoi: String(k.cuoi || ''), luu: k.luu_cuoi || '' }; }
function awardOut_(a) { return { id: String(a.id), kid: a.kid, n: +a.n || 0, why: a.why || '', at: +a.at || 0, huy: truthy_(a.huy) }; }
function orderOut_(o) { return { code: o.code, kid: o.kid, ten: o.ten, qua: o.qua, ten_qua: o.ten_qua, sao: +o.sao || 0, at: +o.at || 0, st: o.st, note: o.note || '' }; }
function newId_(p) { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = p || ''; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
function truthy_(x) { return x !== '' && x !== false && x !== 0 && x != null; }
