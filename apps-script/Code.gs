/**
 * Little Language Explorers – máy chủ nhỏ trên Google Apps Script
 * Một link Web App dùng cho mọi việc của dự án, ghi tất cả vào CHÍNH Sheet chứa script này
 * ("Anh-Trung-Kids – Dữ liệu dự án", Drive anhtrung.home@gmail.com). Các Sheet cũ không còn dùng.
 *   1) Lưu / mở lại tiến độ học của từng bé (đăng nhập bằng tên con + SĐT/Gmail, không mật khẩu)
 *   2) Bảng vàng Top 10 theo khoá và chặng; Xếp hạng mỗi tuần (?action=xephang) cả bảng kèm avatar
 *   3) Sự kiện học thử theo mã CTV (tab "Truy cập học thử")
 *   4) Cổng Zalo sau buổi 1 (tab "Gia đình")
 *   5) Đơn đăng ký từ trang ưu đãi (tab "Đăng ký Web")
 *   6) Trang quản trị (tệp QuanTri.gs trong CÙNG dự án này): đăng nhập tên + mật khẩu, việc hôm nay, báo cáo
 *
 * CÁCH BẬT (làm 1 lần, khoảng 5 phút):
 *   1. Đăng nhập anhtrung.home@gmail.com, mở script.google.com → Dự án mới (mã Sheet dữ liệu ở DATA_ID bên dưới).
 *   2. Xoá code mẫu, dán toàn bộ file này, bấm Lưu.
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
 * Riêng cổng Zalo sau buổi 1 và form trang ưu đãi gửi tên ba/mẹ và số Zalo (khi ba mẹ tự điền và đồng ý).
 * Vì vậy Sheet này chỉ chia sẻ cho đội, không để "bất kỳ ai có đường liên kết".
 */

/* Sheet dữ liệu của dự án (Drive anhtrung.home@gmail.com). Script này là dự án riêng, không gắn vào Sheet. */
const DATA_ID = '1QQnbTRwpbu6wGmrtnbwAW0VVyyk1AA7xlHQb_GwFOic';
function ss_() { return SpreadsheetApp.openById(DATA_ID); }
function sheet_(name, head) {
  const ss = ss_();
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
  // form trang ưu đãi gửi dạng form (không phải JSON)
  if (e && e.parameter && e.parameter.ho_ten_phu_huynh !== undefined) return json_(dangKy_(e.parameter));
  let d0 = {}; try { d0 = JSON.parse(e.postData.contents || '{}'); } catch (err) { return json_({ ok: false }); }
  if (d0.action === 'qt') return json_(quanTri_(d0));             // trang quản trị (tệp QuanTri.gs), tự khóa khi cần
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = d0;
    if (d.action === 'family') return json_(family_(d));
    if (d.action === 'zoom') return json_(lopZoom_(d));          // kết quả buổi Zoom (lop-zoom/co.html)
    if (d.action === 'zoomhs') return json_(lopZoomHoSo_(d));    // Chuẩn bị vào lớp (lop-zoom/index.html?chuan-bi)
    if (d.action === 'zoommm') return json_(zoomMotMan_(d));     // Lớp Zoom một màn (lop-zoom-mot-man/): báo cáo + cộng sao
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
  if (p.action === 'zoomsao') return json_(zoomSao_(p));        // web học hỏi số sao Zoom đã cộng cho một bé
  if (p.action === 'ping') return json_({ ok: true, v: 16 });          // v16: Lớp Zoom một màn (tab Lớp Zoom 1 màn, Sao Zoom, ?action=zoomsao) · v15: Lớp Zoom (tab Lớp Zoom, Chuẩn bị Zoom, ảnh con vào Drive) · v14: bỏ tích nhiệm vụ · v13: Gọi tuần 1 gộp (4H + thẻ), CTV ghi đủ 6 ô · v12: Gọi sau 3 buổi (báo cáo + ô tích Đã gọi / Đồng ý Zoom) · v11: phân luồng CTV (chưa kích hoạt) / Sale (đã kích hoạt) / Cố vấn (chỉ định) · v3: Bảng Gia đình · v4: mở khóa 21 ngày · v5: trang quản trị có tài khoản · v7: Xếp hạng · v8: việc theo vai trò CTV/Sale/Cố vấn · v9: offer trong Thẻ gia đình · v10: nhiệm vụ theo bản đồ
  if (p.action === 'xephang') return json_(xepHang_(p));
  if (p.action === 'access') return json_(access_(p));
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

/* ---------- Xếp hạng (mỗi chặng = một tuần giải đấu) ----------
 * ?action=xephang&group=seed&round=1 (0 = tổng 21 ngày)&kid=<mã bé>
 * Trả tối đa 50 bạn có sao (tên, sao, avatar bé tự chọn ở Phòng đổi quà) và đánh dấu dòng của bé đang xem.
 * Không trả mã bé của các bạn khác. Bảng được giữ trong bộ nhớ đệm 45 giây cho đỡ tải Sheet. */
function xepHang_(p) {
  const g = String(p.group || '').slice(0, 20), round = Math.max(0, Math.min(3, +p.round || 0)), kid = String(p.kid || '');
  const cache = CacheService.getScriptCache(), key = 'xh1-' + g + '-' + round;
  let all = null;
  try { const hit = cache.get(key); if (hit) all = JSON.parse(hit); } catch (e) { }
  if (!all) {
    const sh = sheet_('Diem', ['kid', 'name', 'group', 'day', 'round', 'points', 'updated']), n = sh.getLastRow(), tot = {};
    if (n > 1) sh.getRange(2, 1, n - 1, 6).getValues().forEach(r => {
      if (String(r[2]) !== g || (round && +r[4] !== round)) return;
      const k = String(r[0]); tot[k] = tot[k] || { k: k, n: '', p: 0 }; tot[k].p += +r[5] || 0; tot[k].n = String(r[1] || '');
    });
    const td = ss_().getSheetByName('TienDo');
    if (td && td.getLastRow() > 1) td.getRange(2, 1, td.getLastRow() - 1, 6).getValues().forEach(r => {
      const x = tot[String(r[0])]; if (!x) return;
      try { const a = (JSON.parse(r[5] || '{}')._shop || {}).ava; if (a && a.c) x.a = [a.c, a.o || '', a.bg || 'studio', a.fr || 'none']; } catch (e) { }
    });
    all = Object.keys(tot).map(k => tot[k]).filter(x => x.p > 0).sort((a, b) => b.p - a.p || a.n.localeCompare(b.n));
    try { cache.put(key, JSON.stringify(all), 45); } catch (e) { }
  }
  const mi = all.findIndex(x => x.k === kid);
  const list = all.slice(0, 50).map(x => ({ n: x.n, p: x.p, a: x.a || null, me: x.k === kid }));
  if (mi >= 50) list.push({ n: all[mi].n, p: all[mi].p, a: all[mi].a || null, me: true });
  return { v: 7, list: list, total: all.length };
}

/* ---------- Truy cập bản học thử theo mã CTV ----------
 * Link CTV: …/demo/?ref=CTV01 … CTV10. Web gửi các sự kiện (GET action=visit):
 *   mo = mở trang · vao = bé quay lại học (1 lần/ngày) · hoc = bé nhập tên, bắt đầu học (chi tiết: tuổi)
 *   xong1 / xong2 / xong3 = học xong 1 / 2 / 3 buổi · noi = con nói thành tiếng (chi tiết: tổng số lần 1, 5, 10, 20)
 *   khoa = bấm vào phần bị khóa (chi tiết: phần nào) · bam_dk = bấm "Đăng ký cho con" · zalo = ba mẹ để lại Zalo
 * Mỗi sự kiện ghi 1 dòng vào tab "Truy cập học thử" của Sheet này;
 * trang quản trị đọc tab này để chấm điểm gia đình và vẽ phễu theo mã CTV. */
const EVENTS = ['mo', 'vao', 'hoc', 'xong1', 'xong2', 'xong3', 'noi', 'khoa', 'bam_dk', 'zalo', 'dong_hanh', 'kich_hoat'];   // kich_hoat = bấm "Nhắn Zalo đội hỗ trợ" ở bảng Kích hoạt 21 ngày
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
    logEvent_(ss_(), p.ref, p.vid, ev, p.g, p.x);
    return json_({ ok: true });
  } catch (err) { return json_({ ok: false }); }
  finally { lock.releaseLock(); }
}

/* ---------- Bảng Gia đình: ba mẹ để lại Zalo ở cổng sau buổi 1 ----------
 * Ghi 1 dòng vào tab "Gia đình" của Sheet này (tự tạo nếu chưa có), trạng thái "Đang dùng thử",
 * rồi giao cho 1 bạn vận hành theo lượt: bạn đang nhận ít gia đình nhất trong tab "Đội"
 * (cột Vai trò = Vận hành hoặc Sale, cột "Nhận gia đình mới" = TRUE). CTV và Cố vấn không nhận gia đình mới. Trang quản trị đọc và cập nhật tab này.
 * Một gia đình (cùng mã người xem hoặc cùng số Zalo) gửi lại thì chỉ cập nhật, không tạo dòng mới. */
const GD_HEAD = ['Mã gia đình', 'Tạo lúc', 'Nguồn', 'Mã người xem', 'Mã CTV', 'Tên ba/mẹ', 'Số Zalo', 'Tên con', 'Tuổi', 'Khoá',
  'ĐY học tập', 'ĐY tư vấn', 'ĐY tin ưu đãi', 'Trạng thái', 'Đổi trạng thái lúc', 'Người hỗ trợ', 'Liên hệ đầu', 'Liên hệ gần nhất',
  'Hẹn gọi lại', 'Lý do dừng', 'Ghi chú', 'Điểm', 'Làn', 'Mở khóa 21 ngày', 'Mở khóa lúc'];
const COT_MO_KHOA = 24;                                               // cột X (đếm từ 1)
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
  const ppl = team.getRange(2, 1, team.getLastRow() - 1, 5).getValues()
    .filter(r => r[1] && ['Vận hành', 'Sale'].indexOf(String(r[2]).trim()) >= 0 && (r[3] === true || String(r[3]).toUpperCase() === 'TRUE')
      && !(r[4] === false || String(r[4]).toUpperCase() === 'FALSE'))           // cột E: Đang hoạt động
    .map(r => String(r[1]).trim());
  if (!ppl.length) return '';
  const load = {}; ppl.forEach(n => load[n] = 0);
  rows.forEach(r => { const n = String(r[15]).trim(); if (n in load && DONG_HO_SO.indexOf(String(r[13])) < 0) load[n]++; });
  return ppl.sort((a, b) => load[a] - load[b])[0];
}
/* Danh sách riêng: mỗi lần ba mẹ đăng ký ở ô "Học thử miễn phí" (web gửi nguon=hocthu) ghi thêm 1 dòng vào tab "Đăng ký học thử".
 * Gia đình vẫn nằm ở tab "Gia đình" như mọi gia đình khác; trang quản trị đọc tab này để dựng màn Học thử và việc hằng ngày riêng. */
const HT_HEAD = ['Thời gian', 'Mã gia đình', 'Tên con', 'Tuổi', 'SĐT / Zalo', 'ĐY tư vấn', 'Mã CTV', 'Mã người xem'];
function ghiHocThu_(ss, code, d, phone) {
  let sh = ss.getSheetByName('Đăng ký học thử');
  if (!sh) {
    sh = ss.insertSheet('Đăng ký học thử'); sh.appendRow(HT_HEAD); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HT_HEAD.length).setFontWeight('bold').setBackground('#FFE3E0');
  }
  sh.appendRow([new Date(), code, String(d.kid || '').trim().slice(0, 40), String(d.age || '').slice(0, 6), '',
    d.cTuVan === true || d.cTuVan === 'true', cleanRef_(d.ref), String(d.vid || '').slice(0, 24)]);
  sh.getRange(sh.getLastRow(), 5).setNumberFormat('@').setValue(phone);
}
function family_(d) {
  if (d.web) return { ok: true };                                   // ô bẫy chống spam
  const kq = family0_(d);
  if (kq.ok && kq.code && d.nguon === 'hocthu') { try { ghiHocThu_(ss_(), kq.code, d, normPhone_(d.phone)); } catch (e) {} }
  return kq;
}
function family0_(d) {
  const phone = normPhone_(d.phone), parent = String(d.parent || '').trim().slice(0, 40);
  const kid = String(d.kid || '').trim().slice(0, 40), vid = String(d.vid || '').slice(0, 24);
  if (!phone || !parent || !kid) return { ok: false, err: 'thieu' };
  const ss = ss_(), sh = giaDinhSheet_(ss);
  if (!sh.getRange(1, COT_MO_KHOA).getValue()) sh.getRange(1, COT_MO_KHOA, 1, 2).setValues([['Mở khóa 21 ngày', 'Mở khóa lúc']]);
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
    yes(d.cHoc), yes(d.cTuVan), yes(d.cUuDai), 'Đang dùng thử', now, chonNguoiHoTro_(ss, rows), '', '', '', '', '', '', '', false, '']);
  sh.getRange(sh.getLastRow(), 7).setNumberFormat('@').setValue(phone);       // giữ số 0 đầu
  sh.getRange(sh.getLastRow(), COT_MO_KHOA).insertCheckboxes();
  logEvent_(ss, d.ref, vid, 'zalo', group, code);
  return { ok: true, code: code };
}

/* ---------- Đơn đăng ký từ trang ưu đãi (Ceseducation/little-language-explorers) ----------
 * Form gửi các ô: ho_ten_phu_huynh, so_zalo, quan_he, ten_be, tuoi_be, doi, da_hoc, hoc_o_dau, biet_qua, hinh_anh, cam_ket,
 * ref (mã CTV), fam (mã gia đình nếu đi từ web học), website (ô bẫy chống spam).
 * Ghi 1 dòng vào tab "Đăng ký Web" của Sheet này, cùng thứ tự cột với Sheet DATA cũ.
 * Đội tick cột "Đã đóng phí" khi tiền về; trang quản trị tự gộp đơn vào tab "Gia đình" theo số điện thoại. */
const DK_HEAD = ['Thời gian', 'Họ và tên phụ huynh', 'SĐT / Zalo', 'Mối quan hệ với bé', 'Họ và tên bé', 'Tuổi của bé',
  'Đã từng học Anh / Trung', 'Học ở đâu', 'Biết qua đâu', 'Đồng ý chia sẻ hình ảnh', 'Đội ba mẹ chọn', 'Cam kết 21 ngày + phí 79k',
  'Người hỗ trợ', 'Note thông tin sau khai thác', 'Đã đóng phí', 'Mã CTV', 'Mã gia đình'];
function dangKy_(p) {
  if (p.website) return { ok: true };                                // ô bẫy chống spam
  const t = (k, n) => String(p[k] || '').trim().slice(0, n || 120);
  const phone = normPhone_(p.so_zalo);
  if (!t('ho_ten_phu_huynh') || !phone || !t('ten_be') || !t('tuoi_be')) return { ok: false, error: 'Thiếu thông tin bắt buộc' };
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const ss = ss_();
    let sh = ss.getSheetByName('Đăng ký Web');
    if (!sh) {
      sh = ss.insertSheet('Đăng ký Web'); sh.appendRow(DK_HEAD); sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, DK_HEAD.length).setFontWeight('bold').setBackground('#FFF3C4');
      sh.getRange(1, 3, sh.getMaxRows(), 1).setNumberFormat('@');
    }
    const fam = /^GD[A-Z0-9]{4,8}$/.test(t('fam', 12)) ? t('fam', 12) : '';
    sh.appendRow([new Date(), t('ho_ten_phu_huynh', 60), '', t('quan_he', 30), t('ten_be', 60), t('tuoi_be', 10), t('da_hoc', 30),
      t('hoc_o_dau'), t('biet_qua', 40), t('hinh_anh', 20), t('doi', 30), t('cam_ket', 10), '', '', false, cleanRef_(p.ref), fam]);
    const r = sh.getLastRow();
    sh.getRange(r, 3).setNumberFormat('@').setValue(phone);           // giữ số 0 đầu
    sh.getRange(r, 15).insertCheckboxes();
    return { ok: true };
  } catch (err) { return { ok: false, error: 'Lỗi máy chủ' }; }
  finally { lock.releaseLock(); }
}

/* ---------- Mở khóa 21 ngày (một link cho ba mẹ từ đầu đến cuối) ----------
 * Web học gửi  ?action=access&p=<mã băm số điện thoại/Gmail>&id=<mã bé>  và nhận về {ok:true/false}.
 * Không gửi số điện thoại thật; mã băm = 16 ký tự đầu SHA-256 của "lle|" + số đã chuẩn hóa (giống hashStr ở web).
 * Thứ tự xét:
 *   1. Ô "Mở khóa 21 ngày" trong tab "Gia đình" được tick (đội tick trên trang quản trị hoặc thẳng trên Sheet) → mở.
 *   2. Số nằm trong danh sách ĐÃ ĐÓNG PHÍ (tab Đăng ký Web của Sheet này, và các tab Đăng ký Web, Google Form,
 *      Danh sách đóng tiền của Sheet DATA Dự án cũ) → mở, trừ khi đội đã chủ động khóa
 *      (bỏ tick trên trang quản trị, cột "Mở khóa lúc" ghi "Khóa …").
 *   3. Bé đã có tiến độ trong tab TienDo (đã học bản đầy đủ trước khi có một link) vẫn học tiếp.
 *      Từ khi có một link, chỉ máy đã được mở khóa mới ghi được vào TienDo.
 * Kết quả giữ trong bộ nhớ đệm 60 giây để web chạy nhanh khi nhiều bé vào cùng lúc. */
const OLD_DATA_ID = '1antBQ-MDz2a4U-w-B2y6XTnF1Pzln7QwwUxxJm5TanI';
function hashAcct_(a) {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'lle|' + a, Utilities.Charset.UTF_8);
  return b.slice(0, 8).map(x => ((x + 256) % 256).toString(16).padStart(2, '0')).join('');
}
function yes_(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
function bangMoKhoa_() {
  const cache = CacheService.getScriptCache(), hit = cache.get('mo-khoa-v1');
  if (hit) return JSON.parse(hit);
  const gd = {}, paid = {}, ss = ss_();
  const sh = ss.getSheetByName('Gia đình');
  if (sh && sh.getLastRow() > 1) {
    const w = Math.max(COT_MO_KHOA, sh.getLastColumn());
    sh.getRange(2, 1, sh.getLastRow() - 1, w).getValues().forEach(r => {
      const a = normPhone_(r[6]); if (!a) return;
      const k = hashAcct_(a), g = gd[k] || { on: false, khoa: false };
      g.on = g.on || yes_(r[COT_MO_KHOA - 1]); g.khoa = g.khoa || /^khóa/i.test(String(r[COT_MO_KHOA] || ''));
      gd[k] = g;
    });
  }
  const read = (book, name, phoneCol, paidCol) => {
    try {
      const t = book.getSheetByName(name); if (!t || t.getLastRow() < 2) return;
      t.getRange(2, 1, t.getLastRow() - 1, Math.max(phoneCol, paidCol) + 1).getValues().forEach(r => {
        const a = normPhone_(r[phoneCol]); if (a && yes_(r[paidCol])) paid[hashAcct_(a)] = 1;
      });
    } catch (e) { }
  };
  read(ss, 'Đăng ký Web', 2, 14);
  try {
    const old = SpreadsheetApp.openById(OLD_DATA_ID);
    read(old, 'Đăng ký Web', 2, 14); read(old, 'Google Form', 2, 12); read(old, 'Danh sách đóng tiền ', 4, 6);
  } catch (e) { }
  const cu = {}, td = ss.getSheetByName('TienDo');
  if (td && td.getLastRow() > 1) td.getRange(2, 1, td.getLastRow() - 1, 1).getValues().forEach(r => { if (r[0]) cu[String(r[0])] = 1; });
  const out = { gd: gd, paid: paid, cu: cu };
  try { cache.put('mo-khoa-v1', JSON.stringify(out), 60); } catch (e) { }
  return out;
}
function access_(p) {
  const h = String(p.p || '').toLowerCase().replace(/[^0-9a-f]/g, '').slice(0, 16), id = String(p.id || '').slice(0, 40);
  if (!h && !id) return { ok: false };
  const b = bangMoKhoa_();
  const g = h && b.gd[h];
  if (g && g.on) return { ok: true, via: 'gia-dinh' };
  if (g && g.khoa) return { ok: false, via: 'da-khoa' };
  if (h && b.paid[h]) return { ok: true, via: 'da-dong-phi' };
  if (id && b.cu[id]) return { ok: true, via: 'dang-hoc' };
  return { ok: false, known: false };
}


/* ---------- Lớp Zoom (thư mục lop-zoom/ trên web học) ----------
 * action 'zoom'  : màn cô gửi kết quả buổi Zoom. rows[0] là tiêu đề, mỗi dòng sau là một bé.
 *                  Ghi vào tab "Lớp Zoom"; gửi lại cùng phòng + ngày + chỗ ngồi thì ghi đè dòng cũ.
 * action 'zoomhs': ba mẹ điền "Chuẩn bị vào lớp" (tên con, tên ba mẹ, avatar, ảnh khi đồng ý).
 *                  Ghi vào tab "Chuẩn bị Zoom"; ảnh lưu vào thư mục Drive riêng ZOOM_ANH_THU_MUC (không chia sẻ công khai).
 * Hết thử thách: chạy hàm xoaAnhLopZoom() một lần để chuyển toàn bộ ảnh con vào thùng rác.
 */
const ZOOM_ANH_THU_MUC = 'Lớp Zoom – Ảnh con (xóa khi hết thử thách)';
function lopZoom_(d) {
  const rows = d.rows || [];
  if (rows.length < 2) return { ok: false, n: 0 };
  const head = rows[0].concat(['Cập nhật']);
  const sh = sheet_('Lớp Zoom', head);
  if (sh.getLastColumn() < head.length || String(sh.getRange(1, 1).getValue()) !== String(head[0])) sh.getRange(1, 1, 1, head.length).setValues([head]);   // web thêm cột thì cập nhật dòng tiêu đề
  const n = sh.getLastRow(), keys = {};
  if (n > 1) sh.getRange(2, 1, n - 1, 3).getValues().forEach((r, i) => { keys[[r[0], fmtDate_(r[1]), r[2]].join('|')] = i + 2; });
  let cnt = 0;
  rows.slice(1).forEach(r => {
    const row = r.map(v => (v === null || v === undefined) ? '' : v).concat([new Date()]);
    while (row.length < head.length) row.splice(row.length - 1, 0, '');
    const k = [r[0], String(r[1]), r[2]].join('|');
    if (keys[k]) sh.getRange(keys[k], 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    cnt++;
  });
  return { ok: true, n: cnt };
}
function fmtDate_(v) { return v instanceof Date ? Utilities.formatDate(v, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd') : String(v); }
function lopZoomHoSo_(d) {
  const sh = sheet_('Chuẩn bị Zoom', ['Thời gian', 'Tên con', 'Tên ba/mẹ', 'Avatar', 'Đồng ý cho lớp thấy ảnh', 'Ảnh (Drive)', 'Mã bé web 21 ngày', 'Khoá', 'Vòng']);
  let link = '';
  if (d.ok && d.photo && String(d.photo).indexOf('data:image/') === 0) {
    try {
      const it = DriveApp.getFoldersByName(ZOOM_ANH_THU_MUC), folder = it.hasNext() ? it.next() : DriveApp.createFolder(ZOOM_ANH_THU_MUC);
      const b64 = String(d.photo).split(',')[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(b64), 'image/jpeg', ('anh-' + (d.kid || 'con') + '-' + Date.now()).replace(/[^\w\-]+/g, '_') + '.jpg');
      link = folder.createFile(blob).getUrl();
    } catch (e) { link = 'Lỗi lưu ảnh: ' + e; }
  }
  sh.appendRow([new Date(), String(d.kid || '').slice(0, 60), String(d.parent || '').slice(0, 60), String(d.ava || ''), d.ok ? 'Có' : 'Không', link, String(d.web || ''), String(d.khoa || ''), String(d.vong || '')]);
  return { ok: true };
}
/* Chạy tay khi hết thử thách: chuyển ảnh con vào thùng rác và xoá link ảnh trong tab "Chuẩn bị Zoom" */
function xoaAnhLopZoom() {
  const it = DriveApp.getFoldersByName(ZOOM_ANH_THU_MUC);
  while (it.hasNext()) { const f = it.next(); const fs = f.getFiles(); while (fs.hasNext()) fs.next().setTrashed(true); f.setTrashed(true); }
  const sh = ss_().getSheetByName('Chuẩn bị Zoom');
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 6, sh.getLastRow() - 1, 1).clearContent();
}


/* ---------- Lớp Zoom một màn (thư mục lop-zoom-mot-man/) ----------
 * action 'zoommm' (POST): cô gửi báo cáo cuối buổi và số sao của từng bé.
 *   d = { buoi, ngay, lop, khoa, vong, rows: [{ ma, kid, parent, web, tay, dung, noi, rong, sao, note }] }
 *   - Tab "Lớp Zoom 1 màn": báo cáo từng bé (gửi lại cùng buổi + bé thì ghi đè).
 *   - Tab "Sao Zoom": số sao cộng vào web học. Mã bé web để trống thì tự ghép theo tên con trong tab TienDo cùng khoá;
 *     trùng tên hoặc không thấy thì để trống, ghi "cần ghép" – sale dán mã bé (cột G) bằng tay, web học tự nhận sao.
 * action 'zoomsao' (GET ?id=<mã bé web>): tổng sao Zoom của bé, web học cộng vào ví sao (Phòng đổi quà).
 */
const ZMM_HEAD = ['Buổi', 'Ngày', 'Khoá', 'Mã trong buổi', 'Tên con', 'Ba/mẹ', 'Giơ tay', 'Trả lời đúng (chat)', 'Đúng trong trận Rồng', 'Phát biểu', 'Sao', 'Ghi chú của cô', 'Cập nhật'];
const SAO_HEAD = ['Buổi', 'Ngày', 'Khoá', 'Mã trong buổi', 'Tên con', 'Ba/mẹ', 'Mã bé web', 'Sao', 'Ghép', 'Gợi ý', 'Cập nhật'];
function zoomMotMan_(d) {
  const rows = d.rows || [];
  if (!d.buoi || !rows.length) return { ok: false, n: 0 };
  const rep = sheet_('Lớp Zoom 1 màn', ZMM_HEAD), sao = sheet_('Sao Zoom', SAO_HEAD);
  const keyOf = (sh) => { const n = sh.getLastRow(), k = {}; if (n > 1) sh.getRange(2, 1, n - 1, 4).getValues().forEach((r, i) => { k[r[0] + '|' + r[3]] = i + 2; }); return k; };
  const kr = keyOf(rep), ks = keyOf(sao), kids = tienDoTen_(d.khoa), out = [];
  rows.forEach(r => {
    const k = d.buoi + '|' + r.ma, now = new Date();
    const a = [d.buoi, d.ngay || '', d.lop || d.khoa || '', r.ma, r.kid || '', r.parent || '', +r.tay || 0, +r.dung || 0, +r.rong || 0, +r.noi || 0, +r.sao || 0, r.note || '', now];
    if (kr[k]) rep.getRange(kr[k], 1, 1, a.length).setValues([a]); else rep.appendRow(a);
    let web = String(r.web || ''), ghep = web ? 'có sẵn' : '', goi = '';
    if (ks[k]) { const old = sao.getRange(ks[k], 7, 1, 3).getValues()[0]; if (!web && old[0]) { web = String(old[0]); ghep = String(old[2] || 'sale ghép'); } }
    if (!web) {
      const m = timBe_(kids, r.kid);
      if (m.length === 1) { web = m[0].id; ghep = m[0].gan ? 'tự ghép (tên gần đúng)' : 'tự ghép'; }
      else { ghep = 'cần ghép'; goi = m.slice(0, 5).map(x => x.name + ': ' + x.id).join(' · ') || 'không thấy bé này trong TienDo'; }
    }
    const b = [d.buoi, d.ngay || '', d.lop || d.khoa || '', r.ma, r.kid || '', r.parent || '', web, +r.sao || 0, ghep, goi, now];
    if (ks[k]) sao.getRange(ks[k], 1, 1, b.length).setValues([b]); else sao.appendRow(b);
    out.push({ ma: r.ma, ghep: ghep, web: web ? 1 : 0 });
  });
  return { ok: true, n: rows.length, rows: out };
}
function tenChuan_(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function tienDoTen_(khoa) {
  const sh = ss_().getSheetByName('TienDo'); if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().filter(r => r[0] && (!khoa || String(r[3]) === khoa)).map(r => ({ id: String(r[0]), name: String(r[1]), n: tenChuan_(r[1]) }));
}
/* trùng hẳn tên (bỏ dấu) trước; không có thì tên cô gõ là phần cuối tên trên web ("Minh Anh" khớp "Nguyễn Minh Anh") */
function timBe_(kids, ten) {
  const t = tenChuan_(ten); if (!t) return [];
  const exact = kids.filter(x => x.n === t);
  if (exact.length) return exact;
  return kids.filter(x => (' ' + x.n).slice(-(t.length + 1)) === ' ' + t || (' ' + t).slice(-(x.n.length + 1)) === ' ' + x.n).map(x => Object.assign({ gan: true }, x));
}
function zoomSao_(p) {
  const id = String(p.id || ''); if (!id) return { sao: 0 };
  const sh = ss_().getSheetByName('Sao Zoom'); if (!sh || sh.getLastRow() < 2) return { sao: 0, n: 0 };
  let sao = 0, n = 0;
  sh.getRange(2, 7, sh.getLastRow() - 1, 2).getValues().forEach(r => { if (String(r[0]) === id) { sao += +r[1] || 0; n++; } });
  return { sao: sao, n: n };
}
