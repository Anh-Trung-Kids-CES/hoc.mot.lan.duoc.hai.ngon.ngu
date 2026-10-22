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
 * Web chỉ gửi mã băm của SĐT/Gmail, không gửi số điện thoại thật.
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
 * Link CTV: …/demo/?ref=CTV01 … CTV10. Web gửi 4 loại sự kiện:
 *   mo = mở trang học thử · hoc = bé nhập tên, bắt đầu học thử · xong3 = học xong 3 buổi · bam_dk = bấm "Đăng ký cho con"
 * Mỗi sự kiện ghi 1 dòng vào tab "Truy cập học thử" của Sheet "DATA Dự án";
 * tab "Thống kê CTV" (cột H–L) tự đếm theo mã, cạnh số đăng ký và số đã đóng phí.
 * Tài khoản triển khai Apps Script này cần có quyền sửa Sheet DATA Dự án. */
const DATA_DU_AN_ID = '1antBQ-MDz2a4U-w-B2y6XTnF1Pzln7QwwUxxJm5TanI';
function visit_(p) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ref = String(p.ref || 'TU_NHIEN').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'TU_NHIEN';
    const ev = ['mo', 'hoc', 'xong3', 'bam_dk'].indexOf(p.ev) >= 0 ? p.ev : 'mo';
    const ss = SpreadsheetApp.openById(DATA_DU_AN_ID);
    let sh = ss.getSheetByName('Truy cập học thử');
    if (!sh) { sh = ss.insertSheet('Truy cập học thử'); sh.appendRow(['Thời gian', 'Mã CTV', 'Mã người xem', 'Sự kiện', 'Khoá']); sh.setFrozenRows(1); }
    sh.appendRow([new Date(), ref, String(p.vid || '').slice(0, 24), ev, String(p.g || '').slice(0, 10)]);
    return json_({ ok: true });
  } catch (err) { return json_({ ok: false }); }
  finally { lock.releaseLock(); }
}
