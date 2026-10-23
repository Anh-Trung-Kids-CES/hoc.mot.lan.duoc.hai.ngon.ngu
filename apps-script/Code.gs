/**
 * Little Language Explorers – máy chủ nhỏ trên Google Apps Script
 * Một link Web App dùng cho 2 việc:
 *   1) Lưu / mở lại tiến độ học của từng bé (đăng nhập bằng tên con + SĐT/Gmail, không mật khẩu)
 *   2) Bảng vàng Top 10 theo khoá và chặng
 *
 * CÁCH BẬT (làm 1 lần, khoảng 5 phút):
 *   1. Tạo một Google Sheet mới, đặt tên ví dụ "LLE – Tiến độ & Bảng vàng".
 *   2. Trong Sheet: Tiện ích mở rộng → Apps Script. Xoá code mẫu, dán toàn bộ file này, bấm Lưu.
 *   3. Bấm Triển khai → Tùy chọn triển khai mới → loại "Ứng dụng web".
 *        Thực thi với tư cách: Tôi        Ai có quyền truy cập: Bất kỳ ai
 *   4. Bấm Triển khai, cho phép quyền truy cập, chép "URL ứng dụng web" (đuôi /exec).
 *   5. Dán URL đó vào  xem-truoc/index.html  ở dòng  const SCORE_API = "…";
 *
 * Sheet tự tạo 3 trang:
 *   TienDo : mã bé | tên | tài khoản (đã che) | khoá | cập nhật | tiến độ (JSON)
 *   Diem   : mã bé | tên | khoá | buổi | chặng | điểm | cập nhật
 *   DoiQua : phiếu đổi quà thật / học bổng từ Phòng đổi quà. Cô đổi cột "status" thành
 *            duyet (đã duyệt) · da_trao (đã trao) · tu_choi (không duyệt – web tự hoàn sao cho bé),
 *            ghi lý do ở cột "note" nếu cần. Web của bé tự cập nhật trạng thái.
 *
 * CẬP NHẬT CODE (khi có bản mới): dán đè toàn bộ file này → Lưu → Triển khai → Quản lý các bản triển khai
 *   → bấm biểu tượng bút chì → Phiên bản: "Phiên bản mới" → Triển khai. Link /exec giữ nguyên.
 * Đăng nhập học chính chỉ gửi mã băm của SĐT/Gmail, không gửi số điện thoại thật.
 * Riêng cổng Zalo sau buổi 1 của bản cho phụ huynh gửi tên ba/mẹ và số Zalo (khi ba mẹ tự điền và đồng ý),
 * ghi thẳng vào tab "Gia đình" của Sheet DATA Dự án, không ghi vào Sheet này.
 */

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
const QUA_HEAD = ['code', 'time', 'kid', 'name', 'acct', 'group', 'kind', 'item', 'itemName', 'cost', 'earned', 'spent', 'lessons', 'zooms', 'status', 'note'];
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function findRow_(sh, key) {
  const n = sh.getLastRow(); if (n < 2) return -1;
  const ids = sh.getRange(2, 1, n - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === key) return i + 2;
  return -1;
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.action === 'family') return json_(family_(d));
    if (d.action === 'redeem') {
      if (!d.id || !d.code) return json_({ ok: false });
      const sh = sheet_('DoiQua', QUA_HEAD);
      if (findRow_(sh, d.code) > 0) return json_({ ok: true, dup: true });
      sh.appendRow([d.code, new Date(), d.id, d.name || '', d.acct || '', d.group || '', d.kind === 'hb' ? 'Học bổng' : 'Quà thật',
        d.item || '', d.itemName || '', +d.cost || 0, +d.earned || 0, +d.spent || 0, +d.lessons || 0, +d.zooms || 0, 'cho', '']);
      const r = sh.getLastRow();
      sh.getRange(r, 15).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['cho', 'duyet', 'da_trao', 'tu_choi'], true).build());
      return json_({ ok: true });
    }
    if (d.action === 'save') {
      if (!d.id) return json_({ ok: false });
      const sh = sheet_('TienDo', ['id', 'name', 'acct', 'group', 'updated', 'prog']);
      const row = [d.id, d.name || '', d.acct || '', d.group || '', new Date(), JSON.stringify(d.prog || {})];
      const r = findRow_(sh, d.id);
      if (r > 0) sh.getRange(r, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
      return json_({ ok: true });
    }
    // mặc định: ghi điểm một buổi
    const sh = sheet_('Diem', ['kid', 'name', 'group', 'day', 'round', 'points', 'updated']);
    const key = [d.kid, d.group, d.day].join('|');
    const n = sh.getLastRow();
    if (n > 1) {
      const v = sh.getRange(2, 1, n - 1, 4).getValues();
      for (let i = 0; i < v.length; i++) {
        if ([v[i][0], v[i][2], v[i][3]].join('|') === key) {
          sh.getRange(i + 2, 1, 1, 7).setValues([[d.kid, d.name, d.group, d.day, d.round, d.points, new Date()]]);
          return json_({ ok: true });
        }
      }
    }
    sh.appendRow([d.kid, d.name, d.group, d.day, d.round, d.points, new Date()]);
    return json_({ ok: true });
  } finally { lock.releaseLock(); }
}

function doGet(e) {
  const p = e.parameter || {};
  if (p.action === 'ping') return json_({ ok: true, v: 2 });          // web hỏi: máy chủ đã có Bảng Gia đình chưa
  if (p.action === 'visit') return visit_(p);
  if (p.action === 'team') {   // mục tiêu chung: cả đội một khoá đã cùng học bao nhiêu buổi (không lộ tên, không xếp hạng)
    const sh = sheet_('Diem', ['kid', 'name', 'group', 'day', 'round', 'points', 'updated']), n = sh.getLastRow(), kids = {};
    let lessons = 0;
    if (n > 1) sh.getRange(2, 1, n - 1, 6).getValues().forEach(r => { if (r[2] === p.group && +r[5] > 0) { lessons++; kids[r[0]] = 1; } });
    return json_({ lessons: lessons, kids: Object.keys(kids).length });
  }
  if (p.action === 'orders') {
    const sh = sheet_('DoiQua', QUA_HEAD), n = sh.getLastRow(), id = String(p.id || ''), out = [];
    if (n > 1) sh.getRange(2, 1, n - 1, 16).getValues().forEach(r => { if (String(r[2]) === id) out.push({ code: r[0], status: String(r[14] || 'cho'), note: String(r[15] || '') }); });
    return json_({ orders: out });
  }
  if (p.action === 'load') {
    const sh = sheet_('TienDo', ['id', 'name', 'acct', 'group', 'updated', 'prog']);
    const r = findRow_(sh, String(p.id || ''));
    if (r < 0) return json_({ prog: null });
    const v = sh.getRange(r, 1, 1, 6).getValues()[0];
    return json_({ name: v[1], group: v[3], prog: JSON.parse(v[5] || '{}') });
  }
  // Bảng vàng: ?group=seed&round=1 (round=0 là tổng 21 ngày)&kid=<mã bé>
  const sh = sheet_('Diem', ['kid', 'name', 'group', 'day', 'round', 'points', 'updated']);
  const n = sh.getLastRow(), round = +p.round || 0, tot = {};
  if (n > 1) sh.getRange(2, 1, n - 1, 6).getValues().forEach(r => {
    if (r[2] !== p.group || (round && +r[4] !== round)) return;
    const k = r[0]; tot[k] = tot[k] || { kid: k, name: r[1], points: 0 }; tot[k].points += +r[5] || 0; tot[k].name = r[1];
  });
  const all = Object.values(tot).sort((a, b) => b.points - a.points);
  const me = all.findIndex(x => x.kid === p.kid);
  return json_({ top: all.slice(0, 10).map(x => ({ name: x.name, points: x.points })), me: me >= 0 ? { rank: me + 1, points: all[me].points } : null });
}

/* ---------- Truy cập bản học thử theo mã CTV ----------
 * Link CTV: …/demo/?ref=CTV01 … CTV10. Web gửi các sự kiện (GET action=visit):
 *   mo = mở trang · vao = bé quay lại học (1 lần/ngày) · hoc = bé nhập tên, bắt đầu học (chi tiết: tuổi)
 *   xong1 / xong2 / xong3 = học xong 1 / 2 / 3 buổi · noi = con nói thành tiếng (chi tiết: tổng số lần 1, 5, 10, 20)
 *   khoa = bấm vào phần bị khóa (chi tiết: phần nào) · bam_dk = bấm "Đăng ký cho con" · zalo = ba mẹ để lại Zalo
 * Mỗi sự kiện ghi 1 dòng vào tab "Truy cập học thử" của Sheet "DATA Dự án";
 * trang quản trị đọc tab này để chấm điểm gia đình và vẽ phễu theo mã CTV.
 * Tài khoản triển khai Apps Script này cần có quyền sửa Sheet DATA Dự án. */
const DATA_DU_AN_ID = '1antBQ-MDz2a4U-w-B2y6XTnF1Pzln7QwwUxxJm5TanI';
const EVENTS = ['mo', 'vao', 'hoc', 'xong1', 'xong2', 'xong3', 'noi', 'khoa', 'bam_dk', 'zalo', 'dong_hanh'];
const TC_HEAD = ['Thời gian', 'Mã CTV', 'Mã người xem', 'Sự kiện', 'Khoá', 'Chi tiết'];
function cleanRef_(r) { return String(r || 'TU_NHIEN').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'TU_NHIEN'; }
function logEvent_(ss, ref, vid, ev, g, x) {
  let sh = ss.getSheetByName('Truy cập học thử');
  if (!sh) { sh = ss.insertSheet('Truy cập học thử'); sh.appendRow(TC_HEAD); sh.setFrozenRows(1); }
  else if (!sh.getRange(1, 6).getValue()) sh.getRange(1, 6).setValue('Chi tiết');
  sh.appendRow([new Date(), cleanRef_(ref), String(vid || '').slice(0, 24), ev, String(g || '').slice(0, 10), String(x == null ? '' : x).slice(0, 40)]);
}
function visit_(p) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ev = EVENTS.indexOf(p.ev) >= 0 ? p.ev : 'mo';
    logEvent_(SpreadsheetApp.openById(DATA_DU_AN_ID), p.ref, p.vid, ev, p.g, p.x);
    return json_({ ok: true });
  } catch (err) { return json_({ ok: false }); }
  finally { lock.releaseLock(); }
}

/* ---------- Bảng Gia đình: ba mẹ để lại Zalo ở cổng sau buổi 1 ----------
 * Ghi 1 dòng vào tab "Gia đình" của Sheet DATA Dự án (tự tạo nếu chưa có), trạng thái "Đang dùng thử",
 * rồi giao cho 1 bạn vận hành theo lượt: bạn đang nhận ít gia đình nhất trong tab "Đội"
 * (cột Vai trò = Vận hành, cột "Nhận gia đình mới" = TRUE). Trang quản trị đọc và cập nhật tab này.
 * Một gia đình (cùng mã người xem hoặc cùng số Zalo) gửi lại thì chỉ cập nhật, không tạo dòng mới. */
const GD_HEAD = ['Mã gia đình', 'Tạo lúc', 'Nguồn', 'Mã người xem', 'Mã CTV', 'Tên ba/mẹ', 'Số Zalo', 'Tên con', 'Tuổi', 'Khoá',
  'ĐY học tập', 'ĐY tư vấn', 'ĐY tin ưu đãi', 'Trạng thái', 'Đổi trạng thái lúc', 'Người hỗ trợ', 'Liên hệ đầu', 'Liên hệ gần nhất',
  'Hẹn gọi lại', 'Lý do dừng', 'Ghi chú', 'Điểm', 'Làn'];
const DONG_HO_SO = ['Dừng', 'Nuôi dưỡng', 'Học viên khóa dài'];
function normPhone_(s) {
  s = String(s || '').trim().toLowerCase();
  if (s.indexOf('@') > 0) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) ? s : '';
  let d = s.replace(/\D/g, ''); if (d.indexOf('84') === 0 && d.length >= 11) d = '0' + d.slice(2); if (d.length === 9) d = '0' + d;
  return /^0\d{9,10}$/.test(d) ? d : '';
}
function giaDinhSheet_(ss) {
  let sh = ss.getSheetByName('Gia đình');
  if (!sh) {
    sh = ss.insertSheet('Gia đình'); sh.appendRow(GD_HEAD); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, GD_HEAD.length).setFontWeight('bold').setBackground('#FFF3C4');
  }
  return sh;
}
function chonNguoiHoTro_(ss, rows) {
  const team = ss.getSheetByName('Đội'); if (!team || team.getLastRow() < 2) return '';
  const ppl = team.getRange(2, 1, team.getLastRow() - 1, 4).getValues()
    .filter(r => r[1] && String(r[2]).trim() === 'Vận hành' && (r[3] === true || String(r[3]).toUpperCase() === 'TRUE'))
    .map(r => String(r[1]).trim());
  if (!ppl.length) return '';
  const load = {}; ppl.forEach(n => load[n] = 0);
  rows.forEach(r => { const n = String(r[15]).trim(); if (n in load && DONG_HO_SO.indexOf(String(r[13])) < 0) load[n]++; });
  return ppl.sort((a, b) => load[a] - load[b])[0];
}
function family_(d) {
  if (d.web) return { ok: true };                                   // ô bẫy chống spam
  const phone = normPhone_(d.phone), parent = String(d.parent || '').trim().slice(0, 40);
  const kid = String(d.kid || '').trim().slice(0, 40), vid = String(d.vid || '').slice(0, 24);
  if (!phone || !parent || !kid) return { ok: false, err: 'thieu' };
  const ss = SpreadsheetApp.openById(DATA_DU_AN_ID), sh = giaDinhSheet_(ss);
  const n = sh.getLastRow(), rows = n > 1 ? sh.getRange(2, 1, n - 1, GD_HEAD.length).getValues() : [];
  const yes = v => v === true || v === 'true' || v === 1 || v === '1';
  let at = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((vid && String(rows[i][3]) === vid) || normPhone_(rows[i][6]) === phone) { at = i; break; }
  }
  const age = String(d.age || '').slice(0, 6), group = String(d.group || '').slice(0, 10);
  if (at >= 0) {                                                     // gửi lại: cập nhật thông tin, giữ trạng thái và người hỗ trợ
    const r = rows[at];
    r[3] = r[3] || vid; r[5] = parent; r[6] = phone; r[8] = age || r[8]; r[9] = r[9] || group;
    if (String(r[7]).toLowerCase().indexOf(kid.toLowerCase()) < 0) r[7] = r[7] ? r[7] + ', ' + kid : kid;
    r[10] = yes(d.cHoc); r[11] = yes(d.cTuVan); r[12] = yes(d.cUuDai);
    sh.getRange(at + 2, 7).setNumberFormat('@');
    sh.getRange(at + 2, 1, 1, GD_HEAD.length).setValues([r]);
    logEvent_(ss, d.ref, vid, 'zalo', group, 'cap-nhat');
    return { ok: true, code: r[0] };
  }
  const code = /^GD[A-Z0-9]{4,8}$/.test(String(d.code || '')) ? String(d.code) : 'GD' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  const now = new Date();
  sh.appendRow([code, now, 'Web học thử', vid, cleanRef_(d.ref), parent, '', kid, age, group,
    yes(d.cHoc), yes(d.cTuVan), yes(d.cUuDai), 'Đang dùng thử', now, chonNguoiHoTro_(ss, rows), '', '', '', '', '', '', '']);
  sh.getRange(sh.getLastRow(), 7).setNumberFormat('@').setValue(phone);       // giữ số 0 đầu
  logEvent_(ss, d.ref, vid, 'zalo', group, code);
  return { ok: true, code: code };
}
