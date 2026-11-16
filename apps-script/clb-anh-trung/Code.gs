/**
 * CLB Anh – Trung offline: máy chủ đăng nhập, theo dõi việc đọc và nhận kết quả kiểm tra của cô mới.
 * Ghi vào Sheet "CLB Anh-Trung – Kết quả kiểm tra cô mới" (Drive duyenvth@hanu.edu.vn). Script là dự án riêng, không gắn vào Sheet.
 * Cách bật xem HUONG-DAN.md. Sheet tự tạo 3 trang: GiaoVien (tài khoản), TienDo (đã mở trang nào, bao lâu), KetQua (bài kiểm tra).
 * Mật khẩu chỉ lưu dạng băm. Mật khẩu quản trị đặt bằng hàm datMatKhauAdmin() (chạy 1 lần trong trình soạn thảo).
 */
const DATA_ID = '188_wgtkS2BQq1xlcG2XX9HUtyI8rfdMS41GmBKgY0x8';
const TOKEN_DAYS = 14;
const TAB = { GV: 'GiaoVien', TD: 'TienDo', KQ: 'KetQua' };
const HEAD = {
  GiaoVien: ['ID', 'Họ tên', 'Email', 'Băm mật khẩu', 'Muối', 'Trạng thái', 'Tạo lúc', 'Đăng nhập cuối', 'Ghi chú HR'],
  TienDo: ['ID', 'Mục', 'Số lần mở', 'Giây đã xem', 'Mở lần cuối'],
  KetQua: ['Nộp lúc', 'ID', 'Họ tên', 'Email', 'Buổi dự kiến dạy', 'Điểm', 'Tổng', 'Tinh thần (/6)', 'Tình huống (/6)', 'Phần buổi dạy (/5)', 'Phút', 'Nhận định', 'Câu sai', 'Ghi chú HR', 'HR đã dạy thử 5 phút (Có/Không)', 'Quyết định (Đạt/Kèm thêm/Chưa)']
};

/* ---- đặt mật khẩu quản trị: sửa dòng MAT_KHAU, chạy hàm này 1 lần, rồi XOÁ mật khẩu khỏi dòng đó ---- */
function datMatKhauAdmin() {
  const MAT_KHAU = 'DOI-DONG-NAY';
  if (MAT_KHAU === 'DOI-DONG-NAY' || MAT_KHAU.length < 8) throw new Error('Hãy nhập mật khẩu từ 8 ký tự vào MAT_KHAU rồi chạy lại.');
  const salt = Utilities.getUuid();
  const p = PropertiesService.getScriptProperties();
  p.setProperty('ADMIN_SALT', salt);
  p.setProperty('ADMIN_HASH', hash_(MAT_KHAU, salt));
}

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function hex_(bytes) { return bytes.map(b => ('0' + ((b + 256) % 256).toString(16)).slice(-2)).join(''); }
function hash_(pass, salt) { return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + pass)); }
function secret_() {
  const p = PropertiesService.getScriptProperties();
  let s = p.getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('SECRET', s); }
  return s;
}
function sign_(payload) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret_())); }
function makeToken_(id, role) {
  const payload = id + '|' + role + '|' + (Date.now() + TOKEN_DAYS * 86400000);
  return Utilities.base64EncodeWebSafe(payload) + '.' + sign_(payload);
}
function readToken_(tok) {
  try {
    const parts = String(tok || '').split('.');
    if (parts.length !== 2) return null;
    const payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
    if (sign_(payload) !== parts[1]) return null;
    const f = payload.split('|');
    if (Number(f[2]) < Date.now()) return null;
    return { id: f[0], role: f[1] };
  } catch (e) { return null; }
}
function sheet_(name) {
  const ss = SpreadsheetApp.openById(DATA_ID);
  let sh = ss.getSheetByName(name);
  if (!sh) {
    const first = ss.getSheets()[0];
    if (name === TAB.KQ && first && first.getName() === 'Sheet1') { sh = first; sh.setName(name); sh.getRange(1, 1, 1, HEAD[name].length).setValues([HEAD[name]]); }
    else { sh = ss.insertSheet(name); sh.appendRow(HEAD[name]); }
    sh.setFrozenRows(1);
  }
  return sh;
}
function rows_(name) { const sh = sheet_(name), n = sh.getLastRow(); return n < 2 ? [] : sh.getRange(2, 1, n - 1, HEAD[name].length).getValues(); }
function clean_(s, n) { return String(s == null ? '' : s).slice(0, n || 200).replace(/^[=+\-@]/, "'$&"); }
function findGV_(id) {
  const sh = sheet_(TAB.GV), n = sh.getLastRow();
  if (n < 2) return null;
  const v = sh.getRange(2, 1, n - 1, HEAD.GiaoVien.length).getValues();
  for (let i = 0; i < v.length; i++) if (String(v[i][0]).toLowerCase() === String(id).toLowerCase()) return { row: i + 2, v: v[i], sh: sh };
  return null;
}
function randPass_() {
  const c = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = ''; for (let i = 0; i < 8; i++) s += c.charAt(Math.floor(Math.random() * c.length));
  return s;
}
function throttled_(id) {
  const c = CacheService.getScriptCache(), k = 'fail_' + String(id).toLowerCase();
  return Number(c.get(k) || 0) >= 5;
}
function fail_(id) { const c = CacheService.getScriptCache(), k = 'fail_' + String(id).toLowerCase(); c.put(k, String(Number(c.get(k) || 0) + 1), 600); }

function doGet() { return json_({ ok: true, v: 2, service: 'clb-anh-trung' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const act = d.action;
    if (act === 'login') return json_(login_(d));
    const who = readToken_(d.token);
    if (!who) return json_({ ok: false, error: 'auth' });
    if (who.role === 'teacher') {
      const g = findGV_(who.id);
      if (!g || g.v[5] !== 'hoat-dong') return json_({ ok: false, error: 'locked' });
      if (act === 'me') return json_({ ok: true, id: who.id, role: 'teacher', name: g.v[1], email: g.v[2] });
      if (act === 'track') return json_(track_(who.id, d.events));
      if (act === 'quiz') return json_(quiz_(who.id, g.v, d));
      if (act === 'passwd') return json_(passwd_(g, d));
      return json_({ ok: false, error: 'unknown' });
    }
    if (who.role === 'admin') {
      if (act === 'me') return json_({ ok: true, id: 'admin', role: 'admin', name: 'Quản trị' });
      if (act === 'list') return json_(list_());
      if (act === 'create') return json_(create_(d));
      if (act === 'reset') return json_(reset_(d));
      if (act === 'status') return json_(status_(d));
      return json_({ ok: false, error: 'unknown' });
    }
    return json_({ ok: false, error: 'auth' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function login_(d) {
  const id = String(d.id || '').trim(), pass = String(d.pass || '');
  if (!id || !pass) return { ok: false, error: 'thieu' };
  if (throttled_(id)) return { ok: false, error: 'thu-lai-sau' };
  if (id.toLowerCase() === 'admin') {
    const p = PropertiesService.getScriptProperties();
    const salt = p.getProperty('ADMIN_SALT'), h = p.getProperty('ADMIN_HASH');
    if (!salt || !h) return { ok: false, error: 'chua-dat-mat-khau-admin' };
    if (hash_(pass, salt) !== h) { fail_(id); return { ok: false, error: 'sai' }; }
    return { ok: true, token: makeToken_('admin', 'admin'), id: 'admin', role: 'admin', name: 'Quản trị' };
  }
  const g = findGV_(id);
  if (!g || hash_(pass, g.v[4]) !== g.v[3]) { fail_(id); return { ok: false, error: 'sai' }; }
  if (g.v[5] !== 'hoat-dong') return { ok: false, error: 'locked' };
  g.sh.getRange(g.row, 8).setValue(new Date());
  return { ok: true, token: makeToken_(g.v[0], 'teacher'), id: g.v[0], role: 'teacher', name: g.v[1], email: g.v[2] };
}

function track_(id, events) {
  if (!Array.isArray(events)) return { ok: false, error: 'events' };
  const sh = sheet_(TAB.TD), n = sh.getLastRow();
  const v = n < 2 ? [] : sh.getRange(2, 1, n - 1, 5).getValues();
  const idx = {}; v.forEach((r, i) => { if (r[0] === id) idx[r[1]] = i; });
  events.slice(0, 40).forEach(ev => {
    const k = clean_(ev.k, 60), c = Math.min(Number(ev.n) || 0, 20), s = Math.min(Number(ev.s) || 0, 1800);
    if (!k) return;
    if (idx[k] != null) { const r = v[idx[k]]; r[2] = Number(r[2]) + c; r[3] = Number(r[3]) + s; r[4] = new Date(); }
    else { v.push([id, k, c, s, new Date()]); idx[k] = v.length - 1; }
  });
  if (v.length) sh.getRange(2, 1, v.length, 5).setValues(v);
  return { ok: true };
}

function quiz_(id, gv, d) {
  sheet_(TAB.KQ).appendRow([new Date(), id, gv[1], gv[2], clean_(d.session), Number(d.score) || 0, Number(d.total) || 0, Number(d.spirit) || 0, Number(d.situation) || 0, Number(d.sessionScore) || 0, Number(d.minutes) || 0, clean_(d.verdict), clean_((d.wrong || []).join(', ')), '', '', '']);
  return { ok: true };
}

function passwd_(g, d) {
  const np = String(d.newPass || '');
  if (np.length < 8) return { ok: false, error: 'ngan' };
  if (hash_(String(d.oldPass || ''), g.v[4]) !== g.v[3]) return { ok: false, error: 'sai' };
  const salt = Utilities.getUuid();
  g.sh.getRange(g.row, 4, 1, 2).setValues([[hash_(np, salt), salt]]);
  return { ok: true };
}

function create_(d) {
  const name = clean_(d.name, 100), email = clean_(d.email, 120);
  if (!name) return { ok: false, error: 'thieu-ten' };
  const sh = sheet_(TAB.GV), n = sh.getLastRow();
  let max = 0;
  if (n >= 2) sh.getRange(2, 1, n - 1, 1).getValues().forEach(r => { const m = /^GV(\d+)$/i.exec(String(r[0])); if (m) max = Math.max(max, Number(m[1])); });
  const id = 'GV' + ('000' + (max + 1)).slice(-3), pass = randPass_(), salt = Utilities.getUuid();
  sh.appendRow([id, name, email, hash_(pass, salt), salt, 'hoat-dong', new Date(), '', '']);
  return { ok: true, id: id, pass: pass, name: name };
}
function reset_(d) {
  const g = findGV_(d.id);
  if (!g) return { ok: false, error: 'khong-co' };
  const pass = randPass_(), salt = Utilities.getUuid();
  g.sh.getRange(g.row, 4, 1, 2).setValues([[hash_(pass, salt), salt]]);
  return { ok: true, id: g.v[0], pass: pass };
}
function status_(d) {
  const g = findGV_(d.id);
  if (!g) return { ok: false, error: 'khong-co' };
  g.sh.getRange(g.row, 6).setValue(d.status === 'khoa' ? 'khoa' : 'hoat-dong');
  return { ok: true };
}

function list_() {
  const gv = rows_(TAB.GV), td = rows_(TAB.TD), kq = rows_(TAB.KQ);
  const out = gv.map(r => {
    const id = r[0], mine = td.filter(t => t[0] === id);
    const sec = (pre, min) => mine.filter(t => String(t[1]).indexOf(pre) === 0 && Number(t[3]) >= min).length;
    const total = mine.reduce((a, t) => a + Number(t[3]), 0);
    const last = mine.reduce((a, t) => Math.max(a, new Date(t[4]).getTime() || 0), 0);
    const tests = kq.filter(k => k[1] === id);
    const best = tests.reduce((a, k) => (a == null || Number(k[5]) > Number(a[5]) ? k : a), null);
    const latest = tests.length ? tests[tests.length - 1] : null;
    return {
      id: id, name: r[1], email: r[2], status: r[5], created: r[6], lastLogin: r[7],
      kichBan: sec('kich-ban-', 60), trinhChieu: sec('trinh-chieu-', 30), nguLieu: sec('ngu-lieu-', 30),
      luyenLop: Math.round(((mine.find(t => t[1] === 'luyen-lop') || [0, 0, 0, 0])[3]) / 60),
      tinhHuong: Math.round(((mine.find(t => t[1] === 'tinh-huong') || [0, 0, 0, 0])[3]) / 60),
      phut: Math.round(total / 60), lastSeen: last || null,
      tries: tests.length, best: best ? Number(best[5]) + '/' + Number(best[6]) : '', verdict: latest ? latest[11] : '', session: latest ? latest[4] : ''
    };
  });
  return { ok: true, teachers: out };
}
