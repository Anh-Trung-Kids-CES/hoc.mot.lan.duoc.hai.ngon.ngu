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
 * Sheet tự tạo 2 trang:
 *   TienDo : mã bé | tên | tài khoản (đã che) | khoá | cập nhật | tiến độ (JSON)
 *   Diem   : mã bé | tên | khoá | buổi | chặng | điểm | cập nhật
 * Web chỉ gửi mã băm của SĐT/Gmail, không gửi số điện thoại thật.
 */

function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
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
