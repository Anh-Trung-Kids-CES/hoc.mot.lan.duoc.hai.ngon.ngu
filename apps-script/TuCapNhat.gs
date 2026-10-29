/**
 * Anh-Trung-Kids – TỰ CẬP NHẬT MÁY CHỦ TỪ GITHUB (nằm chung dự án Apps Script với Code.gs và QuanTri.gs)
 *
 * Cứ 10 phút, hàm tuCapNhat() xem GitHub có commit mới đụng tới thư mục apps-script/ không.
 * Có thì chép apps-script/Code.gs và apps-script/QuanTri.gs vào dự án này, tạo phiên bản mới
 * và cập nhật đúng bản triển khai đang chạy (link /exec giữ nguyên).
 *
 * An toàn: lần nào cập nhật xong cũng ghi lại dấu của mã vừa dán. Lần sau, nếu mã trong dự án khác dấu đó
 * (có người sửa thẳng trong trình soạn Apps Script), hàm dừng lại, không ghi đè, và ghi lỗi vào
 * Thuộc tính tập lệnh "tcn_loi". Đưa phần sửa tay đó lên GitHub, rồi chạy xoaLoiTuCapNhat().
 *
 * Cài một lần: chạy caiTuCapNhat() trong trình soạn, bấm Cho phép. Cần bật "Google Apps Script API" ở
 * https://script.google.com/home/usersettings và manifest có các phạm vi (oauthScopes) trong appsscript.json.
 * Tệp này không tự cập nhật chính nó: sửa tệp này thì dán tay vào dự án.
 */
const TCN_REPO = 'Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu';
const TCN_DEPLOY = 'AKfycbwsLupVsEa0jqsJ5UDtU1KciL7AiniAhYQk_YZ5N05HESfL6pmSQjcImzZ8nyH9sQ9Lsg';

function tcnDau_(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    String(s || '').replace(/\r\n/g, '\n').replace(/\s+$/, ''), Utilities.Charset.UTF_8));
}
function tcnApi_(method, path, body) {
  const o = { method: method, headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true };
  if (body) { o.contentType = 'application/json'; o.payload = JSON.stringify(body); }
  const r = UrlFetchApp.fetch('https://script.googleapis.com/v1/projects/' + ScriptApp.getScriptId() + path, o);
  if (r.getResponseCode() >= 300) throw new Error('Apps Script API ' + path + ' ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
  return JSON.parse(r.getContentText() || '{}');
}
function tcnGithub_(url) {
  const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'anh-trung-kids-apps-script' } });
  if (r.getResponseCode() !== 200) throw new Error('GitHub ' + r.getResponseCode() + ': ' + url);
  return r.getContentText();
}
function tuCapNhat() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) return;
  const props = PropertiesService.getScriptProperties();
  try {
    const c = JSON.parse(tcnGithub_('https://api.github.com/repos/' + TCN_REPO + '/commits?sha=main&path=apps-script&per_page=1'));
    const sha = c && c[0] && c[0].sha; if (!sha) return;
    if (props.getProperty('tcn_sha') === sha) return;                       // không có gì mới
    const moiCode = tcnGithub_('https://raw.githubusercontent.com/' + TCN_REPO + '/' + sha + '/apps-script/Code.gs');
    const moiQt = tcnGithub_('https://raw.githubusercontent.com/' + TCN_REPO + '/' + sha + '/apps-script/QuanTri.gs');
    if (moiCode.indexOf('function doPost(') < 0 || moiQt.indexOf('function quanTri_(') < 0) throw new Error('Tệp trên GitHub không đúng dạng, không cập nhật.');
    const nd = tcnApi_('get', '/content'), files = nd.files || [];
    const chinh = files.find(f => f.type === 'SERVER_JS' && f.name !== 'QuanTri' && f.name !== 'TuCapNhat' && /function doPost\(/.test(f.source));
    const qt = files.find(f => f.type === 'SERVER_JS' && f.name === 'QuanTri');
    if (!chinh || !qt) throw new Error('Không thấy tệp máy chủ chính hoặc QuanTri trong dự án.');
    const dauDang = tcnDau_(chinh.source) + '|' + tcnDau_(qt.source), dauTruoc = props.getProperty('tcn_dau');
    if (dauTruoc && dauTruoc !== dauDang) {
      props.setProperty('tcn_loi', new Date().toISOString() + ' Mã trong dự án đã bị sửa tay sau lần tự cập nhật trước. Không ghi đè. Đưa phần sửa lên GitHub rồi chạy xoaLoiTuCapNhat().');
      return;
    }
    const dauMoi = tcnDau_(moiCode) + '|' + tcnDau_(moiQt);
    if (dauDang !== dauMoi) {
      chinh.source = moiCode; qt.source = moiQt;
      tcnApi_('put', '/content', { files: files });
      const v = tcnApi_('post', '/versions', { description: 'GitHub ' + sha.slice(0, 7) });
      tcnApi_('put', '/deployments/' + TCN_DEPLOY, { deploymentConfig: { scriptId: ScriptApp.getScriptId(), versionNumber: v.versionNumber,
        manifestFileName: 'appsscript', description: 'GitHub ' + sha.slice(0, 7) } });
      props.setProperty('tcn_lan_cuoi', new Date().toISOString() + ' · phiên bản ' + v.versionNumber + ' · GitHub ' + sha.slice(0, 7));
    }
    props.setProperties({ tcn_sha: sha, tcn_dau: dauMoi });
    props.deleteProperty('tcn_loi');
  } catch (e) {
    props.setProperty('tcn_loi', new Date().toISOString() + ' ' + String(e && e.message || e).slice(0, 400));
    throw e;
  } finally { lock.releaseLock(); }
}
/* Chạy một lần trong trình soạn: tạo lịch 10 phút và cập nhật ngay */
function caiTuCapNhat() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'tuCapNhat').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('tuCapNhat').timeBased().everyMinutes(10).create();
  PropertiesService.getScriptProperties().deleteProperty('tcn_sha');
  tuCapNhat();
  return trangThaiTuCapNhat();
}
/* Xem lần cập nhật gần nhất và lỗi (nếu có) */
function trangThaiTuCapNhat() {
  const p = PropertiesService.getScriptProperties().getProperties();
  const o = { lanCuoi: p.tcn_lan_cuoi || '', github: p.tcn_sha || '', loi: p.tcn_loi || '' };
  console.log(JSON.stringify(o)); return o;
}
/* Sau khi đã đưa phần sửa tay lên GitHub: cho phép tự cập nhật lại */
function xoaLoiTuCapNhat() {
  const p = PropertiesService.getScriptProperties(); p.deleteProperty('tcn_dau'); p.deleteProperty('tcn_loi'); p.deleteProperty('tcn_sha');
  tuCapNhat();
  return trangThaiTuCapNhat();
}
