/**
 * Anh-Trung-Kids – TRANG QUẢN TRỊ (Việc hôm nay · Gia đình · Số liệu)
 *
 * Đây là một dự án Apps Script RIÊNG, khác với máy chủ của web học (apps-script/Code.gs).
 * Trang chạy bằng chính tài khoản Google của người mở, nên:
 *   – ai không có quyền mở Sheet Anh-Trung-Kids – Dữ liệu dự án thì không xem được gì;
 *   – ai có quyền nhưng chưa có tên trong tab "Đội" thì trang báo "chưa có quyền".
 * Không có dữ liệu nào của bé nằm trên GitHub Pages.
 *
 * Mọi dữ liệu nằm trong Sheet "Anh-Trung-Kids – Dữ liệu dự án" của anhtrung.home@gmail.com (cùng Sheet với máy chủ web học).
 * Sheet DATA Dự án cũ không còn dùng. Tab dùng:
 *   Gia đình          – mỗi gia đình một dòng, một trạng thái (web học tạo khi ba mẹ để lại Zalo;
 *                       trang này tự thêm gia đình từ "Đăng ký Web" – đơn của trang ưu đãi)
 *   Truy cập học thử  – sự kiện học thử theo mã người xem (để chấm điểm và vẽ phễu)
 *   Nhật ký cuộc gọi  – mỗi lần liên hệ một dòng (cột P "Mã gia đình", Q "Kết quả")
 *   Đội               – Email | Tên | Vai trò (Quản lý / Vận hành) | Nhận gia đình mới (TRUE/FALSE)
 *   Tin mẫu Zalo      – tin nhắn mẫu cho từng loại việc, sửa thoải mái ngay trên Sheet
 *   Cài đặt quản trị  – hạn đăng ký, ngày khai mạc, link trang ưu đãi, ngưỡng điểm
 *   Nhật ký mở hồ sơ  – ai mở hồ sơ gia đình nào, lúc nào
 * Các tab Đội, Tin mẫu Zalo, Cài đặt quản trị, Nhật ký mở hồ sơ tự tạo ở lần mở đầu tiên.
 * Ai không có quyền mở Sheet này thì không mở được trang.
 *
 * CÁCH BẬT: xem apps-script/quan-tri/HUONG-DAN.md
 */

const DATA_ID = '1QQnbTRwpbu6wGmrtnbwAW0VVyyk1AA7xlHQb_GwFOic';    // Sheet "Anh-Trung-Kids – Dữ liệu dự án" (Drive anhtrung.home@gmail.com)
const TIEN_DO_ID = DATA_ID;                                          // phiếu đổi quà (tab DoiQua) cũng nằm ở đây

const GD_HEAD = ['Mã gia đình', 'Tạo lúc', 'Nguồn', 'Mã người xem', 'Mã CTV', 'Tên ba/mẹ', 'Số Zalo', 'Tên con', 'Tuổi', 'Khoá',
  'ĐY học tập', 'ĐY tư vấn', 'ĐY tin ưu đãi', 'Trạng thái', 'Đổi trạng thái lúc', 'Người hỗ trợ', 'Liên hệ đầu', 'Liên hệ gần nhất',
  'Hẹn gọi lại', 'Lý do dừng', 'Ghi chú', 'Điểm', 'Làn', 'Mở khóa 21 ngày', 'Mở khóa lúc'];
const OLD_DATA_ID = '1antBQ-MDz2a4U-w-B2y6XTnF1Pzln7QwwUxxJm5TanI';  // Sheet DATA Dự án cũ: chỉ lấy gia đình ĐÃ ĐÓNG PHÍ
const C = {};  GD_HEAD.forEach((h, i) => C[h] = i);

const TRANG_THAI = ['Đang dùng thử', 'Mời đăng ký', 'Chờ đóng phí', 'Đang học 21 ngày', 'Chờ tư vấn khóa dài', 'Đã tư vấn',
  'Học viên khóa dài', 'Nuôi dưỡng', 'Dừng'];
const BUOC = TRANG_THAI.slice(0, 7);                    // thứ tự tiến lên; Nuôi dưỡng và Dừng nằm ngoài
const LY_DO = ['Phí', 'Thời gian', 'Con chưa hợp tuổi', 'Con chưa thích', 'Đã học nơi khác', 'Rút đồng ý', 'Khác'];
const KET_QUA = ['Đã nói chuyện', 'Không nghe máy', 'Đã nhắn Zalo', 'Ba mẹ nhắn lại / hỏi thêm', 'Hẹn gọi lại', 'Ghi chú nội bộ'];

const CAI_DAT_MAC_DINH = [
  ['Hạn đăng ký', '2026-10-25T23:59:00+07:00', 'Giờ Việt Nam, giữ nguyên dạng năm-tháng-ngàyTgiờ:phút:giây+07:00'],
  ['Khai mạc', 'thứ Hai 26/10/2026', 'Ghi đúng như muốn hiện trong tin nhắn'],
  ['Link trang ưu đãi', 'https://ceseducation.github.io/little-language-explorers/', ''],
  ['Phí', '79.000đ', ''],
  ['Link học', 'https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/', 'Một link cho ba mẹ từ đầu đến cuối'],
  ['Ngưỡng nóng', '60', 'Từ điểm này: gọi trong 1 giờ'],
  ['Ngưỡng ấm', '35', 'Từ điểm này: nhắn Zalo mẫu kèm link đăng ký'],
  ['Giờ làm việc', '8-21', 'Ngoài giờ này, việc "gọi trong 1 giờ" dời sang 9:00 sáng hôm sau'],
];

const TIN_MAU_MAC_DINH = [
  ['chao', 'Gọi chào (vừa để lại Zalo)',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro} ở Anh-Trung-Kids (CES) ạ. Bé {ten_con} vừa học xong buổi đầu khoá {khoa}{hoc_them}. Em gửi ba mẹ một trò ôn 5 phút tối nay: ba mẹ hỏi con một từ con vừa học, con trả lời bằng tiếng nào cũng được, rồi ba mẹ nhắc lại bằng tiếng còn lại. Nếu ba mẹ muốn cô nghe con nói, ba mẹ gửi em một clip ngắn ở đây nhé ạ. Con thích phần nào nhất ạ?'],
  ['moi_nong', 'Mời đăng ký (gia đình nóng – gọi)',
    'Dạ em chào {phu_huynh} ạ. Bé {ten_con} đã học {so_buoi}/3 buổi đầu và nói thành tiếng {so_lan_noi} lần rồi ạ. Đợt 21 ngày bắt đầu {khai_mac}; con vào kịp sẽ học cùng nhóm cùng trình độ suốt 21 ngày, có 3 buổi Zoom với cô. Ba mẹ xem chi tiết và đăng ký ở đây: {link_dang_ky}. Ba mẹ tiện giờ nào để em gọi trao đổi thêm ạ?'],
  ['moi_am', 'Mời đăng ký (gia đình ấm – nhắn Zalo)',
    'Dạ em chào {phu_huynh} ạ. Em thấy bé {ten_con} đã bắt đầu làm quen cả tiếng Anh và tiếng Trung trên web rồi. Đợt 21 ngày bắt đầu {khai_mac}, mỗi ngày chỉ khoảng 15 phút, có 3 buổi Zoom cùng cô. Nếu ba mẹ muốn con đi tiếp cả hành trình, ba mẹ đăng ký ở đây trước {han}: {link_dang_ky}. Ba mẹ cần em hỗ trợ gì cứ nhắn em nhé ạ.'],
  ['nhac_phi', 'Nhắc đóng phí',
    'Dạ em chào {phu_huynh} ạ. Chỗ của bé {ten_con} trong nhóm {khoa} em đang giữ đến {han}. Ba mẹ chuyển khoản {phi} (nội dung: LLE – {ten_con} – {khoa} – {so_zalo}) giúp em để con kịp vào nhóm trước khai mạc {khai_mac} nhé ạ. Ba mẹ còn băn khoăn gì em hỗ trợ ngay ạ.'],
  ['link_hoc', 'Đã đóng phí: gửi link học chính',
    'Dạ em đã nhận được phí và mở hành trình 21 ngày cho bé {ten_con} rồi ạ, em cảm ơn {phu_huynh}! Con học tiếp ngay trên link cũ: {link_hoc} . Nếu web chưa tự mở đủ 21 ngày, ba mẹ bấm "Ba mẹ đã đóng phí? Đăng nhập", nhập tên con và số {so_zalo}. Mỗi ngày con học một buổi khoảng 15 phút; lịch Zoom và nhóm Zalo của khoá {khoa} em gửi ngay sau đây ạ.'],
  ['goi_lai', 'Gọi lại theo hẹn',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro} ở Anh-Trung-Kids (CES) ạ. Em gọi lại như đã hẹn về hành trình 21 ngày của bé {ten_con} ạ.'],
  ['nuoi_duong', 'Chưa đăng ký: mời vào nhóm học liệu',
    'Dạ em cảm ơn {phu_huynh} đã cho bé {ten_con} học thử ạ. Em gửi ba mẹ nhóm chia sẻ học liệu miễn phí theo tuổi của con; khi mở đợt mới em sẽ báo ba mẹ đầu tiên nhé ạ. Nhóm Facebook: https://www.facebook.com/groups/1057551126772261'],
];

/* ===================== trang ===================== */
function doGet() {
  return HtmlService.createTemplateFromFile('TrangQuanTri').evaluate()
    .setTitle('Quản trị – Anh-Trung-Kids')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ===================== quyền ===================== */
function ss_() { return SpreadsheetApp.openById(DATA_ID); }
function tab_(ss, name, head, seed) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#FFF3C4');
    if (seed && seed.length) sh.getRange(2, 1, seed.length, seed[0].length).setValues(seed);
  }
  return sh;
}
function toi_(ss) {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) throw new Error('Không đọc được email Google của bạn. Hãy mở trang khi đã đăng nhập Google.');
  let sh = ss.getSheetByName('Đội');
  if (!sh) sh = tab_(ss, 'Đội', ['Email', 'Tên', 'Vai trò', 'Nhận gia đình mới'], [[email, email.split('@')[0], 'Quản lý', false]]);
  const n = sh.getLastRow(), rows = n > 1 ? sh.getRange(2, 1, n - 1, 4).getValues() : [];
  const team = rows.filter(r => r[0] || r[1]).map(r => ({ email: String(r[0]).trim().toLowerCase(), ten: String(r[1]).trim(),
    vaiTro: String(r[2]).trim(), nhan: r[3] === true || String(r[3]).toUpperCase() === 'TRUE' }));
  const me = team.find(t => t.email === email);
  if (!me) throw new Error('Email ' + email + ' chưa có trong tab "Đội" của Sheet Anh-Trung-Kids – Dữ liệu dự án. Nhờ cô thêm email, tên và vai trò rồi tải lại trang.');
  if (['Quản lý', 'Vận hành'].indexOf(me.vaiTro) < 0) throw new Error('Vai trò "' + me.vaiTro + '" chưa có màn hình ở bản này. Trang hiện dành cho Quản lý và Vận hành.');
  return { me: me, team: team };
}

/* ===================== tiện ích ===================== */
function normPhone_(s) {
  s = String(s || '').trim().toLowerCase();
  if (s.indexOf('@') > 0) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) ? s : '';
  let d = s.replace(/\D/g, ''); if (d.indexOf('84') === 0 && d.length >= 11) d = '0' + d.slice(2); if (d.length === 9) d = '0' + d;
  return /^0\d{9,10}$/.test(d) ? d : '';
}
function cotZalo_(sh) { sh.getRange(1, C['Số Zalo'] + 1, sh.getMaxRows(), 1).setNumberFormat('@'); }
function ms_(v) { if (v instanceof Date) return v.getTime(); if (v === '' || v == null) return 0; const t = new Date(v).getTime(); return isNaN(t) ? 0 : t; }
function yes_(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
function dayKey_(t) { return Utilities.formatDate(new Date(t), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'); }
function khoaTen_(k) { k = String(k || '').toLowerCase(); return k === 'seed' || k.indexOf('little') >= 0 ? 'Little Seed' : k === 'canopy' || k.indexOf('canopy') >= 0 ? 'Canopy' : String(k || ''); }
function buoc_(st) { return BUOC.indexOf(st); }
function caiDat_(ss) {
  const sh = tab_(ss, 'Cài đặt quản trị', ['Mục', 'Giá trị', 'Ghi chú'], CAI_DAT_MAC_DINH);
  const o = {}; sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 2).getValues().forEach(r => { if (r[0]) o[String(r[0]).trim()] = r[1]; });
  CAI_DAT_MAC_DINH.forEach(r => { if (o[r[0]] === undefined || o[r[0]] === '') o[r[0]] = r[1]; });
  const gio = String(o['Giờ làm việc']).split('-');
  return { han: ms_(o['Hạn đăng ký']), hanText: Utilities.formatDate(new Date(ms_(o['Hạn đăng ký'])), 'Asia/Ho_Chi_Minh', "HH:mm 'ngày' dd/MM"),
    khaiMac: String(o['Khai mạc']), link: String(o['Link trang ưu đãi']), phi: String(o['Phí']), linkHoc: String(o['Link học']),
    nong: +o['Ngưỡng nóng'] || 60, am: +o['Ngưỡng ấm'] || 35, gioMo: +gio[0] || 8, gioDong: +gio[1] || 21 };
}
function tinMau_(ss) {
  const sh = tab_(ss, 'Tin mẫu Zalo', ['Mã', 'Dùng khi', 'Nội dung (giữ nguyên các chữ trong ngoặc nhọn)'], TIN_MAU_MAC_DINH);
  const o = {}; sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 3).getValues().forEach(r => { if (r[0]) o[String(r[0]).trim()] = { ten: r[1], noiDung: r[2] }; });
  return o;
}

/* ===================== đồng bộ đăng ký vào Bảng Gia đình ===================== */
function nguonDangKy_(ss) {
  const out = [];
  const read = (name, map, book, chiDaDong) => {
    const sh = (book || ss).getSheetByName(name); if (!sh || sh.getLastRow() < 2) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues().forEach(r => {
      const phone = normPhone_(r[map.phone]); if (!phone) return;
      if (chiDaDong && !(map.paid != null && yes_(r[map.paid]))) return;
      out.push({ nguon: (book ? 'Sheet cũ · ' : '') + name.trim(), t: ms_(r[map.t]), parent: String(r[map.parent] || '').trim(), phone: phone,
        kid: String(r[map.kid] || '').trim(), age: map.age != null ? String(r[map.age] || '') : '', khoa: map.khoa != null ? khoaTen_(r[map.khoa]) : '',
        ho: map.ho != null ? String(r[map.ho] || '').trim() : '', paid: map.paid != null && yes_(r[map.paid]), ref: map.ref != null ? String(r[map.ref] || '').trim().toUpperCase() : '',
        anh: map.anh != null ? String(r[map.anh] || '') : '', fam: map.fam != null ? String(r[map.fam] || '').trim() : '' });
    });
  };
  read('Đăng ký Web', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, anh: 9, khoa: 10, ho: 12, paid: 14, ref: 15, fam: 16 });
  // gia đình đã đóng phí trước khi chuyển sang Sheet mới (Sheet DATA Dự án cũ)
  try {
    const old = SpreadsheetApp.openById(OLD_DATA_ID);
    read('Đăng ký Web', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, anh: 9, khoa: 10, ho: 12, paid: 14, ref: 15 }, old, true);
    read('Google Form', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, anh: 9, ho: 10, paid: 12 }, old, true);
    read('Danh sách đóng tiền ', { t: null, parent: 1, kid: 2, age: 3, phone: 4, paid: 6 }, old, true);
  } catch (e) { }
  return out;
}
function dongBo_(ss, rows) {
  const byPhone = {}, byCode = {};
  rows.forEach((r, i) => { const p = normPhone_(r[C['Số Zalo']]); if (p) byPhone[p] = i; byCode[String(r[C['Mã gia đình']])] = i; });
  let changed = false; const now = Date.now(), moi = {};    // moi: dòng vừa thêm trong lần đồng bộ này
  nguonDangKy_(ss).forEach(d => {
    // khớp theo mã gia đình (đơn đi từ web học) trước, rồi theo số điện thoại
    let i = d.fam && byCode[d.fam] != null ? byCode[d.fam] : byPhone[d.phone];
    if (i == null) {
      const r = GD_HEAD.map(() => '');
      r[C['Mã gia đình']] = 'GD' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
      r[C['Tạo lúc']] = new Date(d.t || now); r[C['Nguồn']] = d.nguon; r[C['Mã CTV']] = d.ref || 'TU_NHIEN';
      r[C['Tên ba/mẹ']] = d.parent; r[C['Số Zalo']] = d.phone; r[C['Tên con']] = d.kid; r[C['Tuổi']] = d.age; r[C['Khoá']] = d.khoa;
      r[C['ĐY học tập']] = true; r[C['ĐY tư vấn']] = true; r[C['ĐY tin ưu đãi']] = '';
      r[C['Trạng thái']] = d.paid ? 'Đang học 21 ngày' : 'Chờ đóng phí'; r[C['Đổi trạng thái lúc']] = new Date(d.t || now);
      r[C['Người hỗ trợ']] = d.ho; r[C['Ghi chú']] = d.anh ? 'Hình ảnh: ' + d.anh : '';
      // gia đình đăng ký trực tiếp: lấy lúc đăng ký làm mốc liên hệ, để việc "nhắc đóng phí" tính từ đó
      r[C['Liên hệ gần nhất']] = new Date(d.t || now);
      if (d.paid) { r[C['Mở khóa 21 ngày']] = true; r[C['Mở khóa lúc']] = new Date(); } else r[C['Mở khóa 21 ngày']] = false;
      rows.push(r); byPhone[d.phone] = rows.length - 1; moi[rows.length - 1] = 1; changed = true; return;
    }
    const r = rows[i];
    if (d.kid && String(r[C['Tên con']]).toLowerCase().indexOf(d.kid.toLowerCase()) < 0 &&
        d.kid.toLowerCase().indexOf(String(r[C['Tên con']]).toLowerCase()) < 0) { r[C['Tên con']] = r[C['Tên con']] ? r[C['Tên con']] + ', ' + d.kid : d.kid; changed = true; }
    if (!r[C['Khoá']] && d.khoa) { r[C['Khoá']] = d.khoa; changed = true; }
    if (!r[C['Người hỗ trợ']] && d.ho) { r[C['Người hỗ trợ']] = d.ho; changed = true; }
    if ((!r[C['Mã CTV']] || r[C['Mã CTV']] === 'TU_NHIEN') && d.ref) { r[C['Mã CTV']] = d.ref; changed = true; }
    const st = String(r[C['Trạng thái']]), want = d.paid ? 'Đang học 21 ngày' : 'Chờ đóng phí';
    const cur = buoc_(st);
    if (cur < 0 && st !== 'Dừng' || (cur >= 0 && cur < buoc_(want))) {     // Nuôi dưỡng hoặc bước thấp hơn → tiến lên
      r[C['Trạng thái']] = want; changed = true;
      // gia đình đã có trong bảng từ trước: đây là bước tiến thật, tính từ bây giờ (bật việc tương ứng)
      if (!moi[i]) r[C['Đổi trạng thái lúc']] = new Date();
    }
    if (d.paid && !yes_(r[C['Mở khóa 21 ngày']]) && !/^khóa/i.test(String(r[C['Mở khóa lúc']] || ''))) {
      r[C['Mở khóa 21 ngày']] = true; r[C['Mở khóa lúc']] = new Date(); changed = true;
    }
  });
  return changed;
}

/* ===================== sự kiện học thử và điểm ===================== */
function suKien_(ss) {
  const sh = ss.getSheetByName('Truy cập học thử'), byVid = {}, all = [];
  if (!sh || sh.getLastRow() < 2) return { byVid: byVid, all: all };
  sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(r => {
    const vid = String(r[2] || ''), ev = String(r[3] || ''), t = ms_(r[0]); if (!vid || !ev) return;
    const e = byVid[vid] || (byVid[vid] = { ev: {}, days: {}, noi: 0, khoa: 0, ref: String(r[1] || ''), g: '', age: '', first: t, last: t, log: [] });
    e.ev[ev] = (e.ev[ev] || 0) + 1; e.last = Math.max(e.last, t); e.first = Math.min(e.first, t);
    if (r[4]) e.g = String(r[4]);
    if (['vao', 'hoc', 'xong1', 'xong2', 'xong3', 'noi'].indexOf(ev) >= 0) e.days[dayKey_(t)] = 1;
    if (ev === 'noi') e.noi = Math.max(e.noi, +r[5] || 0);
    if (ev === 'hoc' && r[5]) e.age = String(r[5]);
    if (ev === 'khoa') e.khoa++;
    if (e.log.length < 60 && ev !== 'mo') e.log.push([t, ev, String(r[5] || '')]);
    all.push({ vid: vid, ref: String(r[1] || 'TU_NHIEN'), ev: ev, t: t });
  });
  return { byVid: byVid, all: all };
}
function nhatKy_(ss) {
  const sh = ss.getSheetByName('Nhật ký cuộc gọi'), byFam = {};
  if (!sh || sh.getLastRow() < 2) return byFam;
  if (!sh.getRange(1, 16).getValue()) sh.getRange(1, 16, 1, 2).setValues([['Mã gia đình', 'Kết quả']]);
  sh.getRange(2, 1, sh.getLastRow() - 1, 17).getValues().forEach(r => {
    const code = String(r[15] || ''); if (!code) return;
    (byFam[code] = byFam[code] || []).push({ t: ms_(r[0]), ai: String(r[1] || ''), kq: String(r[16] || ''), tt: String(r[10] || ''),
      hen: ms_(r[11]) ? ms_(r[11]) : String(r[11] || ''), ghiChu: String(r[14] || '') });
  });
  return byFam;
}
function tuoiSo_(a) { const m = String(a || '').match(/\d+/); return m ? +m[0] : 0; }
function cham_(r, e, calls) {
  const parts = [], add = (nhom, ten, d, ok) => parts.push({ nhom: nhom, ten: ten, diem: d, ok: !!ok });
  const age = tuoiSo_(r[C['Tuổi']] || (e && e.age));
  const kq = calls.map(c => c.kq);
  add('Phù hợp', 'Bé 5–10 tuổi', 10, age >= 5 && age <= 10);
  add('Phù hợp', 'Để lại Zalo, đồng ý được tư vấn', 10, yes_(r[C['ĐY tư vấn']]));
  add('Phù hợp', 'Đã nói chuyện được với ba hoặc mẹ', 10, kq.indexOf('Đã nói chuyện') >= 0);
  const ev = (e && e.ev) || {};
  add('Dùng thử', 'Xong buổi 1', 10, ev.xong1 || ev.xong2 || ev.xong3);
  add('Dùng thử', 'Xong cả 3 buổi', 10, ev.xong3);
  add('Dùng thử', 'Học vào từ 2 ngày khác nhau', 10, e && Object.keys(e.days).length >= 2);
  add('Dùng thử', 'Con nói thành tiếng từ 5 lần', 10, e && e.noi >= 5);
  add('Ý định', 'Bấm "Đăng ký cho con"', 10, ev.bam_dk);
  add('Ý định', 'Ba mẹ nhắn lại hoặc hỏi thêm', 10, kq.indexOf('Ba mẹ nhắn lại / hỏi thêm') >= 0);
  add('Ý định', 'Mở mục Ba mẹ đồng hành', 5, ev.dong_hanh);
  add('Ý định', 'Bấm vào phần bị khóa từ 2 lần', 5, e && e.khoa >= 2);
  return { diem: parts.reduce((a, p) => a + (p.ok ? p.diem : 0), 0), chiTiet: parts };
}

/* ===================== việc hôm nay ===================== */
function hanGoi_(t, cd) {          // "gọi trong 1 giờ"; ngoài giờ làm việc thì 9:00 sáng hôm sau
  const d = new Date(t + 3600e3), h = +Utilities.formatDate(d, 'Asia/Ho_Chi_Minh', 'H');
  if (h >= cd.gioMo && h < cd.gioDong) return d.getTime();
  const base = new Date(t + (h >= cd.gioDong ? 86400e3 : 0));
  return new Date(Utilities.formatDate(base, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd') + 'T09:00:00+07:00').getTime();
}
function viec_(f, cd, now) {
  const st = f.trangThai, lan = f.lan, lh = f.lienHeGanNhat, sa = f.doiTrangThaiLuc;
  const v = [];
  if (f.moKhoa) return v;   // đã đóng phí và đã mở khóa 21 ngày → không còn ở Việc hôm nay
  if (f.henGoiLai && f.henGoiLai <= now + 2 * 3600e3 && f.henGoiLai > lh)
    v.push({ loai: 'goi_lai', uuTien: 0, ten: 'Gọi lại theo hẹn', han: f.henGoiLai, tin: 'goi_lai' });
  if (st === 'Đang dùng thử' && !lh)
    v.push({ loai: 'chao', uuTien: 1, ten: lan === 'nóng' ? 'Gọi chào ngay (gia đình nóng)' : 'Gọi chào – vừa để lại Zalo', han: hanGoi_(f.taoLuc, cd), dem: f.taoLuc, tin: 'chao' });
  if (f.dyTuVan && (st === 'Mời đăng ký' || (st === 'Đang dùng thử' && lan === 'nóng' && lh)) && lh < sa) {
    const gap48 = cd.han && now > cd.han - 48 * 3600e3 && now < cd.han;
    if (lan === 'nóng') v.push({ loai: 'moi', uuTien: 2, ten: 'Gọi mời đăng ký (nóng)', han: hanGoi_(sa, cd), tin: 'moi_nong' });
    else if (lan === 'ấm') v.push({ loai: 'moi', uuTien: gap48 ? 2 : 4, ten: gap48 ? 'Gọi mời đăng ký (ấm, sát hạn)' : 'Nhắn Zalo mời đăng ký (ấm)', han: sa + 24 * 3600e3, tin: 'moi_am' });
    else v.push({ loai: 'moi', uuTien: 6, ten: 'Mời vào nhóm Zalo học liệu (lạnh)', han: sa + 48 * 3600e3, tin: 'nuoi_duong' });
  }
  if (st === 'Chờ đóng phí' && f.dyTuVan) {
    const sat = cd.han && now > cd.han - 24 * 3600e3 && now < cd.han;
    if (now - lh > 24 * 3600e3 || (sat && lh < cd.han - 24 * 3600e3))
      v.push({ loai: 'phi', uuTien: 3, ten: 'Nhắc đóng phí' + (cd.han > now ? ' – còn ' + Math.max(0, Math.round((cd.han - now) / 3600e3)) + ' giờ tới hạn' : ''), han: Math.max(lh + 24 * 3600e3, now), tin: 'nhac_phi' });
  }
  if (st === 'Đang học 21 ngày')
    v.push({ loai: 'mo', uuTien: 1, ten: 'Mở khóa 21 ngày (đã đóng phí, chưa mở)', han: sa + 2 * 3600e3, tin: 'link_hoc' });
  return v;
}

/* ===================== dữ liệu cho trang ===================== */
function taiDuLieu() {
  const ss = ss_(), quyen = toi_(ss), cd = caiDat_(ss), tm = tinMau_(ss), now = Date.now();
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let rows, sh, sk, calls;
  try {
    sh = tab_(ss, 'Gia đình', GD_HEAD); cotZalo_(sh);
    if (!sh.getRange(1, C['Mở khóa 21 ngày'] + 1).getValue()) sh.getRange(1, C['Mở khóa 21 ngày'] + 1, 1, 2).setValues([['Mở khóa 21 ngày', 'Mở khóa lúc']]);
    const n = sh.getLastRow();
    rows = n > 1 ? sh.getRange(2, 1, n - 1, GD_HEAD.length).getValues() : [];
    rows.forEach(r => { r[C['Số Zalo']] = normPhone_(r[C['Số Zalo']]) || String(r[C['Số Zalo']]).replace(/^'/, ''); });
    const nOld = rows.length;
    let changed = dongBo_(ss, rows);
    sk = suKien_(ss); calls = nhatKy_(ss);
    rows.forEach(r => {
      const e = sk.byVid[String(r[C['Mã người xem']])], c = calls[String(r[C['Mã gia đình']])] || [];
      const sc = cham_(r, e, c), lan = sc.diem >= cd.nong ? 'nóng' : sc.diem >= cd.am ? 'ấm' : 'lạnh';
      if (r[C['Điểm']] !== sc.diem || r[C['Làn']] !== lan) { r[C['Điểm']] = sc.diem; r[C['Làn']] = lan; changed = true; }
      const ev = (e && e.ev) || {};
      if (r[C['Trạng thái']] === 'Đang dùng thử' && (ev.xong3 || ev.bam_dk || sc.diem >= cd.nong)) {
        r[C['Trạng thái']] = 'Mời đăng ký'; r[C['Đổi trạng thái lúc']] = new Date(); changed = true;
      }
    });
    if (changed) {
      if (nOld) sh.getRange(2, 1, nOld, GD_HEAD.length).setValues(rows.slice(0, nOld));
      if (rows.length > nOld) sh.getRange(nOld + 2, 1, rows.length - nOld, GD_HEAD.length).setValues(rows.slice(nOld));
      // ô tick: dùng kiểu dữ liệu hộp kiểm (insertCheckboxes sẽ xóa các ô đã tick)
      if (rows.length) sh.getRange(2, C['Mở khóa 21 ngày'] + 1, rows.length, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    }
  } finally { lock.releaseLock(); }
  const sk2 = sk, calls2 = calls;

  const me = quyen.me, laQL = me.vaiTro === 'Quản lý';
  const fams = rows.map(r => {
    const e = sk2.byVid[String(r[C['Mã người xem']])], code = String(r[C['Mã gia đình']]), c = calls2[code] || [];
    const sc = cham_(r, e, c);
    const f = { code: code, taoLuc: ms_(r[C['Tạo lúc']]), nguon: String(r[C['Nguồn']]), ref: String(r[C['Mã CTV']] || 'TU_NHIEN'),
      phuHuynh: String(r[C['Tên ba/mẹ']]), zalo: normPhone_(r[C['Số Zalo']]) || String(r[C['Số Zalo']]).replace(/^'/, ''),
      tenCon: String(r[C['Tên con']]), tuoi: String(r[C['Tuổi']] || (e && e.age) || ''), khoa: khoaTen_(r[C['Khoá']] || (e && e.g)),
      dyHoc: yes_(r[C['ĐY học tập']]), dyTuVan: yes_(r[C['ĐY tư vấn']]), dyUuDai: yes_(r[C['ĐY tin ưu đãi']]),
      trangThai: String(r[C['Trạng thái']] || 'Đang dùng thử'), doiTrangThaiLuc: ms_(r[C['Đổi trạng thái lúc']]),
      nguoiHoTro: String(r[C['Người hỗ trợ']] || ''), lienHeDau: ms_(r[C['Liên hệ đầu']]), lienHeGanNhat: ms_(r[C['Liên hệ gần nhất']]),
      henGoiLai: ms_(r[C['Hẹn gọi lại']]), lyDo: String(r[C['Lý do dừng']] || ''), ghiChu: String(r[C['Ghi chú']] || ''),
      moKhoa: yes_(r[C['Mở khóa 21 ngày']]), moKhoaLuc: r[C['Mở khóa lúc']] instanceof Date ? r[C['Mở khóa lúc']].getTime() : String(r[C['Mở khóa lúc']] || ''),
      diem: sc.diem, chiTietDiem: sc.chiTiet, lan: sc.diem >= cd.nong ? 'nóng' : sc.diem >= cd.am ? 'ấm' : 'lạnh',
      hoc: e ? { soBuoi: e.ev.xong3 ? 3 : e.ev.xong2 ? 2 : e.ev.xong1 ? 1 : 0, noi: e.noi, ngay: Object.keys(e.days).length, khoa: e.khoa,
        bamDk: !!e.ev.bam_dk, cuoi: e.last, log: e.log } : null,
      lienHe: c.sort((a, b) => b.t - a.t).slice(0, 20) };
    f.viec = viec_(f, cd, now);
    return f;
  }).filter(f => laQL || f.nguoiHoTro === me.ten);

  const out = { me: me, laQL: laQL, team: quyen.team.filter(t => t.vaiTro === 'Vận hành' || t.vaiTro === 'Quản lý').map(t => ({ ten: t.ten, vaiTro: t.vaiTro, nhan: t.nhan })),
    caiDat: cd, tinMau: tm, trangThai: TRANG_THAI, lyDo: LY_DO, ketQua: KET_QUA, now: now, gd: fams };
  if (laQL) { out.so = soLieu_(fams, sk2.all, cd, now); out.doiQua = doiQua_(); }
  return out;
}

/* ===================== số liệu cho quản lý ===================== */
function soLieu_(fams, all, cd, now) {
  const step = ['mo', 'hoc', 'xong1', 'zalo', 'xong3', 'bam_dk'];
  const by = {}, tot = {}; step.forEach(s => tot[s] = {});
  all.forEach(a => { const ref = a.ref || 'TU_NHIEN'; const b = by[ref] || (by[ref] = {}); step.forEach(s => b[s] = b[s] || {});
    if (step.indexOf(a.ev) >= 0) { b[a.ev][a.vid] = 1; tot[a.ev][a.vid] = 1; } });
  const dk = {}, dp = {}; let dkTot = 0, dpTot = 0;
  fams.forEach(f => { const b = buoc_(f.trangThai), ref = f.ref || 'TU_NHIEN';
    const daDk = b >= 2 || f.nguon !== 'Web học thử' && f.trangThai !== 'Dừng', daPhi = b >= 3;
    if (daDk) { dk[ref] = (dk[ref] || 0) + 1; dkTot++; } if (daPhi) { dp[ref] = (dp[ref] || 0) + 1; dpTot++; } });
  const cnt = o => Object.keys(o).length;
  const phieu = (b, ref) => step.map(s => cnt(b[s] || {})).concat([dk[ref] || 0, dp[ref] || 0]);
  const refs = Object.keys(Object.assign({}, by, dk)).sort();
  const nhanh = fams.filter(f => f.nguon === 'Web học thử' && f.lienHeDau).map(f => (f.lienHeDau - f.taoLuc) / 60000).sort((a, b) => a - b);
  const theoTT = {}; fams.forEach(f => theoTT[f.trangThai] = (theoTT[f.trangThai] || 0) + 1);
  const theoLan = { 'nóng': 0, 'ấm': 0, 'lạnh': 0 }; fams.filter(f => buoc_(f.trangThai) >= 0 && buoc_(f.trangThai) < 2).forEach(f => theoLan[f.lan]++);
  const nguoi = {}; fams.forEach(f => { const k = f.nguoiHoTro || '(chưa giao)'; const o = nguoi[k] || (nguoi[k] = { ten: k, gd: 0, viec: 0, phi: 0 });
    o.gd++; o.viec += f.viec.length; if (buoc_(f.trangThai) >= 3) o.phi++; });
  return {
    buoc: ['Mở link', 'Bé bắt đầu học', 'Xong buổi 1', 'Để lại Zalo', 'Xong 3 buổi', 'Bấm đăng ký', 'Đã đăng ký', 'Đã đóng phí'],
    tong: phieu(tot, '__').slice(0, 6).concat([dkTot, dpTot]),
    kenh: refs.map(r => ({ ref: r, so: phieu(by[r] || {}, r) })),
    phutGoiDau: nhanh.length ? nhanh[Math.floor(nhanh.length / 2)] : null,
    trong1Gio: nhanh.length ? Math.round(100 * nhanh.filter(m => m <= 60).length / nhanh.length) : null, soDaGoi: nhanh.length,
    theoTT: theoTT, theoLan: theoLan, nguoi: Object.values(nguoi),
    chuaGiao: fams.filter(f => !f.nguoiHoTro && ['Dừng', 'Học viên khóa dài'].indexOf(f.trangThai) < 0).length,
    conGio: cd.han ? Math.round((cd.han - now) / 3600e3) : null
  };
}
function doiQua_() {
  try {
    const sh = SpreadsheetApp.openById(TIEN_DO_ID).getSheetByName('DoiQua'); if (!sh || sh.getLastRow() < 2) return { cho: 0 };
    return { cho: sh.getRange(2, 15, sh.getLastRow() - 1, 1).getValues().filter(r => String(r[0] || 'cho') === 'cho').length };
  } catch (e) { return { cho: null }; }
}

/* ===================== ghi một lần liên hệ / đổi trạng thái ===================== */
function ghiLienHe(p) {
  const ss = ss_(), quyen = toi_(ss), me = quyen.me, laQL = me.vaiTro === 'Quản lý';
  if (!p || !p.code) throw new Error('Thiếu mã gia đình.');
  if (p.trangThai && TRANG_THAI.indexOf(p.trangThai) < 0) throw new Error('Trạng thái không hợp lệ.');
  if ((p.trangThai === 'Dừng' || p.trangThai === 'Nuôi dưỡng') && !p.lyDo) throw new Error('Chọn lý do khi chuyển sang ' + p.trangThai + '.');
  if (p.ketQua && KET_QUA.indexOf(p.ketQua) < 0) throw new Error('Kết quả không hợp lệ.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = tab_(ss, 'Gia đình', GD_HEAD), n = sh.getLastRow(); cotZalo_(sh);
    const codes = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
    const i = codes.indexOf(String(p.code)); if (i < 0) throw new Error('Không tìm thấy gia đình ' + p.code + '.');
    const rg = sh.getRange(i + 2, 1, 1, GD_HEAD.length), r = rg.getValues()[0];
    if (!laQL && String(r[C['Người hỗ trợ']]) !== me.ten) throw new Error('Gia đình này đang giao cho ' + (r[C['Người hỗ trợ']] || 'người khác') + '.');
    const now = new Date(), lienHe = p.ketQua && p.ketQua !== 'Ghi chú nội bộ';
    if (lienHe) { if (!r[C['Liên hệ đầu']]) r[C['Liên hệ đầu']] = now; r[C['Liên hệ gần nhất']] = now; }
    r[C['Hẹn gọi lại']] = p.henGoiLai ? new Date(+p.henGoiLai) : (lienHe ? '' : r[C['Hẹn gọi lại']]);
    if (p.trangThai && p.trangThai !== r[C['Trạng thái']]) { r[C['Trạng thái']] = p.trangThai; r[C['Đổi trạng thái lúc']] = now; }
    if (p.lyDo) r[C['Lý do dừng']] = p.lyDo + (p.lyDoThem ? ': ' + String(p.lyDoThem).slice(0, 200) : '');
    if (p.lyDo === 'Rút đồng ý') { r[C['ĐY tư vấn']] = false; r[C['ĐY tin ưu đãi']] = false; }
    if (laQL && p.nguoiHoTro != null) r[C['Người hỗ trợ']] = String(p.nguoiHoTro).slice(0, 40);
    if (p.khoa) r[C['Khoá']] = p.khoa === 'Canopy' ? 'Canopy' : 'Little Seed';
    r[C['Số Zalo']] = normPhone_(r[C['Số Zalo']]) || String(r[C['Số Zalo']]);
    rg.setValues([r]);
    if (p.ketQua || p.ghiChu || p.trangThai) {
      const nk = ss.getSheetByName('Nhật ký cuộc gọi') || tab_(ss, 'Nhật ký cuộc gọi', ['Ngày gọi', 'Người gọi', 'Tên phụ huynh', 'SĐT / Zalo', 'Tên con', 'Tuổi', 'Phần B đúng (/5)', 'Phần C đúng (/4)', 'Điểm mạnh của con', 'Nhóm xếp', 'Trạng thái', 'Hạn giữ chỗ / giờ gọi lại', 'Mong muốn của phụ huynh', 'Thắc mắc chưa trả lời', 'Ghi chú']);
      if (!nk.getRange(1, 16).getValue()) nk.getRange(1, 16, 1, 2).setValues([['Mã gia đình', 'Kết quả']]);
      nk.appendRow([now, me.ten, r[C['Tên ba/mẹ']], '', r[C['Tên con']], r[C['Tuổi']], '', '', '', r[C['Khoá']],
        r[C['Trạng thái']], p.henGoiLai ? new Date(+p.henGoiLai) : '', '', '', String(p.ghiChu || '').slice(0, 500) + (p.lyDo ? ' [Lý do: ' + r[C['Lý do dừng']] + ']' : ''),
        r[C['Mã gia đình']], p.ketQua || (p.trangThai ? 'Đổi trạng thái' : 'Ghi chú nội bộ')]);
      nk.getRange(nk.getLastRow(), 4).setNumberFormat('@').setValue(normPhone_(r[C['Số Zalo']]) || '');
    }
  } finally { lock.releaseLock(); }
  return taiDuLieu();
}

/* ===================== mở khóa 21 ngày ===================== */
/* Tick: mở đủ 21 ngày trên link học (web hỏi máy chủ, sau tối đa khoảng 1 phút là thấy).
   Bỏ tick: khóa lại, ghi "Khóa …" ở cột "Mở khóa lúc" để đồng bộ không tự mở lại dù đã đóng phí. */
function moKhoa(code, on) {
  const ss = ss_(), quyen = toi_(ss), me = quyen.me, laQL = me.vaiTro === 'Quản lý';
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = tab_(ss, 'Gia đình', GD_HEAD), n = sh.getLastRow();
    const codes = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
    const i = codes.indexOf(String(code)); if (i < 0) throw new Error('Không tìm thấy gia đình ' + code + '.');
    const rg = sh.getRange(i + 2, 1, 1, GD_HEAD.length), r = rg.getValues()[0];
    if (!laQL && String(r[C['Người hỗ trợ']]) !== me.ten) throw new Error('Gia đình này đang giao cho ' + (r[C['Người hỗ trợ']] || 'người khác') + '.');
    const now = new Date();
    r[C['Mở khóa 21 ngày']] = !!on;
    r[C['Mở khóa lúc']] = on ? now : 'Khóa ' + Utilities.formatDate(now, 'Asia/Ho_Chi_Minh', 'dd/MM HH:mm') + ' · ' + me.ten;
    if (on && buoc_(String(r[C['Trạng thái']])) < buoc_('Đang học 21 ngày')) { r[C['Trạng thái']] = 'Đang học 21 ngày'; r[C['Đổi trạng thái lúc']] = now; }
    r[C['Số Zalo']] = normPhone_(r[C['Số Zalo']]) || String(r[C['Số Zalo']]);
    cotZalo_(sh); rg.setValues([r]); sh.getRange(i + 2, C['Mở khóa 21 ngày'] + 1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build()).setValue(!!on);
    const nk = ss.getSheetByName('Nhật ký cuộc gọi') || tab_(ss, 'Nhật ký cuộc gọi', ['Ngày gọi', 'Người gọi', 'Tên phụ huynh', 'SĐT / Zalo', 'Tên con', 'Tuổi', 'Phần B đúng (/5)', 'Phần C đúng (/4)', 'Điểm mạnh của con', 'Nhóm xếp', 'Trạng thái', 'Hạn giữ chỗ / giờ gọi lại', 'Mong muốn của phụ huynh', 'Thắc mắc chưa trả lời', 'Ghi chú']);
    if (!nk.getRange(1, 16).getValue()) nk.getRange(1, 16, 1, 2).setValues([['Mã gia đình', 'Kết quả']]);
    nk.appendRow([now, me.ten, r[C['Tên ba/mẹ']], '', r[C['Tên con']], r[C['Tuổi']], '', '', '', r[C['Khoá']], r[C['Trạng thái']], '', '', '',
      on ? 'Mở khóa 21 ngày' : 'Khóa 21 ngày', r[C['Mã gia đình']], 'Ghi chú nội bộ']);
  } finally { lock.releaseLock(); }
  return taiDuLieu();
}

/* ===================== nhật ký mở hồ sơ ===================== */
function ghiMoHoSo(code) {
  try {
    const ss = ss_(), me = toi_(ss).me;
    tab_(ss, 'Nhật ký mở hồ sơ', ['Lúc', 'Ai', 'Email', 'Mã gia đình']).appendRow([new Date(), me.ten, me.email, String(code).slice(0, 12)]);
  } catch (e) { }
  return true;
}
