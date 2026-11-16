/**
 * CLB Anh – Trung offline: nhận kết quả "Kiểm tra cô mới" và ghi vào Google Sheet
 * "CLB Anh-Trung – Kết quả kiểm tra cô mới" (Drive duyenvth@hanu.edu.vn).
 * Script này là dự án riêng, không gắn vào Sheet. Cách bật xem HUONG-DAN.md.
 */
const DATA_ID = '188_wgtkS2BQq1xlcG2XX9HUtyI8rfdMS41GmBKgY0x8';
const TOKEN = 'DOI-CHUOI-NAY-TRUOC-KHI-TRIEN-KHAI'; // phải giống CLB_TOKEN trong clb-anh-trung/index.html
const HEAD = ['Nộp lúc','Họ tên','Email','Buổi dự kiến dạy','Điểm','Tổng','Tinh thần (/6)','Tình huống (/6)','Phần buổi dạy (/5)','Phút','Nhận định','Câu sai','Ghi chú HR','HR đã dạy thử 5 phút (Có/Không)','Quyết định (Đạt/Kèm thêm/Chưa)'];

function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(){ const ss = SpreadsheetApp.openById(DATA_ID); const sh = ss.getSheets()[0]; if (sh.getLastRow() < 1) { sh.appendRow(HEAD); sh.setFrozenRows(1); } return sh; }

function doGet(e){ return json_({ ok: true, v: 1, service: 'clb-anh-trung' }); }

function doPost(e){
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.token !== TOKEN) return json_({ ok: false, error: 'token' });
    const clean = s => String(s == null ? '' : s).slice(0, 200).replace(/^[=+\-@]/, "'$&");
    const sh = sheet_();
    sh.appendRow([
      new Date(), clean(d.name), clean(d.email), clean(d.session),
      Number(d.score) || 0, Number(d.total) || 0, Number(d.spirit) || 0, Number(d.situation) || 0,
      Number(d.sessionScore) || 0, Number(d.minutes) || 0, clean(d.verdict), clean((d.wrong || []).join(', ')),
      '', '', ''
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
