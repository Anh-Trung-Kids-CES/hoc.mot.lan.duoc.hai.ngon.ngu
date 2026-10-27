/**
 * Anh-Trung-Kids – API TRANG QUẢN TRỊ (nằm chung dự án Apps Script với máy chủ web học)
 *
 * Trang quản trị: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/quan-tri/
 * Trang gửi POST {action:'qt', fn:'…', token:'…', …} tới chính link /exec của máy chủ web học.
 * Không cần tài khoản Google: đăng nhập bằng TÊN ĐĂNG NHẬP + MẬT KHẨU.
 *
 * Tài khoản nằm ở tab "Đội" của Sheet dữ liệu:
 *   A Tên đăng nhập | B Tên (đúng như cột "Người hỗ trợ") | C Vai trò (Quản lý / Vận hành) | D Nhận gia đình mới
 *   E Đang hoạt động | F Mật khẩu (đã mã hóa, không ai đọc ngược được) | G Muối | H Phải đổi mật khẩu | I Đăng nhập gần nhất
 * Cột A–D giữ nguyên thứ tự vì máy chủ web học dùng chúng để chia gia đình mới cho đội.
 *
 * Tài khoản đầu tiên / quên mật khẩu: tab "Cài đặt quản trị", dòng "Mã thiết lập tài khoản".
 * Ai mở được Sheet thì đọc được mã này; nhập mã trên trang để tạo tài khoản Quản lý hoặc đặt lại mật khẩu.
 * Mã đổi mới sau mỗi lần dùng. Vì vậy chỉ Quản lý giữ quyền mở Sheet; bạn Vận hành không cần quyền Sheet.
 *
 * Dùng chung với Code.gs: DATA_ID, ss_, GD_HEAD, COT_MO_KHOA, OLD_DATA_ID, normPhone_, yes_, json_.
 */

const QT_C = {}; GD_HEAD.forEach((h, i) => QT_C[h] = i);
const QT_DOI_HEAD = ['Tên đăng nhập', 'Tên', 'Vai trò', 'Nhận gia đình mới', 'Đang hoạt động', 'Mật khẩu (đã mã hóa)', 'Muối', 'Phải đổi mật khẩu', 'Đăng nhập gần nhất'];
/* Ba cấp công việc (27/10/2026):
 *   CTV      – làm theo ca, nhắn tin hàng loạt theo mẫu, không gọi tư vấn, không nói giá. Thấy hàng việc CTV của mọi gia đình.
 *   Sale     – chủ một danh sách gia đình, đi 4B (Bạn · Bàn · Bán · Bám), chốt offer. "Vận hành" cũ được coi như Sale.
 *   Cố vấn   – leader: duyệt ngoại lệ, xử lý khiếu nại, giao người, việc quá hạn. Thấy mọi gia đình.
 *   Quản lý  – như Cố vấn, thêm Báo cáo và Tài khoản. */
const QT_VAI_TRO = ['Quản lý', 'Cố vấn', 'Sale', 'Vận hành', 'CTV'];
function qtCap_(vt) { return vt === 'Quản lý' ? 'ql' : vt === 'Cố vấn' ? 'cv' : vt === 'CTV' ? 'ctv' : 'sale'; }
const QT_TRANG_THAI = ['Đang dùng thử', 'Mời đăng ký', 'Chờ đóng phí', 'Đang học 21 ngày', 'Chờ tư vấn khóa dài', 'Đã tư vấn',
  'Học viên khóa dài', 'Nuôi dưỡng', 'Dừng'];
const QT_BUOC = QT_TRANG_THAI.slice(0, 7);
const QT_LY_DO = ['Phí', 'Thời gian', 'Con chưa hợp tuổi', 'Con chưa thích', 'Đã học nơi khác', 'Rút đồng ý', 'Khác'];
const QT_KET_QUA = ['Đã nói chuyện', 'Không nghe máy', 'Đã nhắn Zalo', 'Ba mẹ nhắn lại / hỏi thêm', 'Hẹn gọi lại', 'Chuyển sale', 'Xin ý kiến cố vấn', 'Cố vấn trả lời', 'Ghi chú nội bộ'];
const QT_KQ_CAN_GHI_CHU = ['Chuyển sale', 'Xin ý kiến cố vấn', 'Cố vấn trả lời'];
const QT_KQ_LIEN_HE = ['Đã nói chuyện', 'Không nghe máy', 'Đã nhắn Zalo', 'Ba mẹ nhắn lại / hỏi thêm', 'Hẹn gọi lại'];
/* Thẻ kết quả mong muốn (6 ô) + câu JTBD + 4 lực, mỗi gia đình một dòng */
const QT_THE_HEAD = ['Mã gia đình', 'Nhóm (chọn tay)', '① Bối cảnh', '② Khi', '② Tôi muốn', '② Để', '③ Nỗi đau', '④ Rào cản', '⑤ Kết quả + cách đo',
  '⑥ Vì sao cần ngay', 'Lực đẩy', 'Lực kéo', 'Lo lắng', 'Thói quen', 'Cập nhật lúc', 'Người cập nhật'];
const QT_THE_KEY = ['code', 'nhom', 'o1', 'khi', 'muon', 'de', 'o3', 'o4', 'o5', 'o6', 'day', 'keo', 'lo', 'thoiQuen'];
const QT_THE_CTV = ['o1', 'o4'];                     // CTV chỉ ghi được ô bối cảnh và rào cản
const QT_NK_HEAD = ['Ngày gọi', 'Người gọi', 'Tên phụ huynh', 'SĐT / Zalo', 'Tên con', 'Tuổi', 'Phần B đúng (/5)', 'Phần C đúng (/4)', 'Điểm mạnh của con',
  'Nhóm xếp', 'Trạng thái', 'Hạn giữ chỗ / giờ gọi lại', 'Mong muốn của phụ huynh', 'Thắc mắc chưa trả lời', 'Ghi chú'];
const QT_TZ = 'Asia/Ho_Chi_Minh';
const QT_PHIEN_GIAY = 6 * 3600;           // phiên đăng nhập 6 giờ (tự gia hạn khi đang dùng)

const QT_CAI_DAT_MAC_DINH = [
  ['Hạn đăng ký', '2026-10-25T23:59:00+07:00', 'Giờ Việt Nam, giữ nguyên dạng năm-tháng-ngàyTgiờ:phút:giây+07:00'],
  ['Khai mạc', 'thứ Hai 26/10/2026', 'Ghi đúng như muốn hiện trong tin nhắn'],
  ['Link trang ưu đãi', 'https://ceseducation.github.io/little-language-explorers/', ''],
  ['Phí', '79.000đ', ''],
  ['Link học', 'https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/', 'Một link cho ba mẹ từ đầu đến cuối'],
  ['Ngưỡng nóng', '60', 'Từ điểm này: gọi trong 1 giờ'],
  ['Ngưỡng ấm', '35', 'Từ điểm này: nhắn Zalo mẫu kèm link đăng ký'],
  ['Giờ làm việc', '8-21', 'Ngoài giờ này, việc "gọi trong 1 giờ" dời sang 9:00 sáng hôm sau'],
  ['Mã thiết lập tài khoản', '', 'Nhập mã này trên trang quản trị để tạo tài khoản Quản lý đầu tiên hoặc đặt lại mật khẩu. Mã tự đổi sau mỗi lần dùng.'],
  ['Ngày bắt đầu 21 ngày', '2026-10-26', 'Năm-tháng-ngày. Dùng để tự sinh việc theo tuần (Bạn · Bàn · Bán · Bám)'],
  ['Ngày chung kết', '', 'Năm-tháng-ngày. Để trống thì tính là ngày thứ 22 sau ngày bắt đầu'],
];
const QT_TIN_MAU_MAC_DINH = [
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
  ['chao_thu', 'Học thử: gọi chào (vừa đăng ký học thử)',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro} ở Anh-Trung-Kids (CES) ạ. Em cảm ơn ba mẹ đã đăng ký cho bé {ten_con} học thử miễn phí. Con học ngay tại link này: {link_hoc} . Mỗi buổi khoảng 15 phút, ba mẹ chỉ cần mở bài đúng giờ và khen con khi con nói thành tiếng. Con học xong buổi 2 sẽ thấy nút Kích hoạt 21 ngày thử thách. Con vướng chỗ nào ba mẹ nhắn em nhé ạ.'],
  ['nhac_thu', 'Học thử: đăng ký 1 ngày mà bé chưa vào học',
    'Dạ em chào {phu_huynh} ạ. Hôm qua ba mẹ đã đăng ký cho bé {ten_con} học thử, em chưa thấy con vào buổi đầu ạ. Tối nay ba mẹ mở cho con khoảng 15 phút nhé: {link_hoc} . Ba mẹ nhập đúng tên con đã đăng ký là con học tiếp được ạ.'],
  ['moi_kich_hoat', 'Học thử: bé xong buổi 2, mời kích hoạt 21 ngày',
    'Dạ em chào {phu_huynh} ạ. Bé {ten_con} đã học xong 2 buổi học thử{hoc_them} rồi ạ. Để con đi tiếp cả hành trình, ba mẹ đóng giúp em {phi} phí học liệu nhé ạ: con sẽ tham gia 21 ngày gồm 3 buổi học với giáo viên và các buổi làm bài tập trên web. Ba mẹ bấm nút "Kích hoạt 21 ngày thử thách" trên web để quét mã chuyển khoản, rồi gửi em ảnh chuyển khoản là em mở cho con ngay ạ.'],
  ['nhac_hoc', 'Bé nghỉ học vài ngày: nhắc nhẹ',
    'Dạ em chào {phu_huynh} ạ. Mấy hôm nay em chưa thấy bé {ten_con} vào bài mới. Hôm nay ba mẹ mở cho con học lại một buổi ngắn khoảng 15 phút nhé ạ, con học tiếp đúng chỗ đang dừng: {link_hoc} . Ba mẹ nhớ khen con khi con nói thành tiếng ạ. Con vướng chỗ nào ba mẹ nhắn em hỗ trợ nhé.'],
  /* ----- các điểm chạm 21 ngày (bản đồ điểm chạm 27/10/2026) ----- */
  ['boi_canh', '21 ngày · CTV: chào mừng + 3 câu bối cảnh',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro} ở Anh-Trung-Kids (CES) ạ. Chúc mừng bé {ten_con} đã vào hành trình 21 ngày! Để cô gợi ý khung giờ học hợp với nhà mình, ba mẹ trả lời giúp em 3 câu ngắn nhé: 1) Trước giờ con học tiếng Anh ở đâu, bao lâu rồi ạ? 2) Nhà mình có ai nói được tiếng Anh hoặc tiếng Trung không ạ? 3) Con thường rảnh học vào lúc nào trong ngày ạ? Em cảm ơn ba mẹ!'],
  ['hen_khao_sat', '21 ngày · Sale: hẹn gọi khảo sát 2–3 phút',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro}, đang đồng hành cùng bé {ten_con} ạ. Mấy hôm nay con học chăm lắm ạ. Em muốn gọi ba mẹ khoảng 2 phút để hỏi thăm con học thế nào và gửi ba mẹ vài gợi ý riêng cho con. Ba mẹ tiện nghe máy lúc nào ạ?'],
  ['hoi_so_1', '21 ngày · CTV: hỏi bằng số tuần 1 (mong muốn)',
    'Dạ em chào {phu_huynh} ạ. Em hỏi nhanh một câu để cô hiểu nhà mình hơn, ba mẹ chỉ cần trả lời 1 số: Sau 21 ngày, ba mẹ mong nhất điều gì ở bé {ten_con}? 1. Con mạnh dạn nói · 2. Con thích tiếng Trung · 3. Con tự giác học · 4. Có lộ trình rõ cho con. Em cảm ơn ba mẹ ạ!'],
  ['hoi_so_2', '21 ngày · CTV: hỏi bằng số tuần 2 (kiểm chứng JTBD)',
    'Dạ em chào {phu_huynh} ạ. Ba mẹ thấy câu nào giống nhà mình nhất ạ? Ba mẹ chỉ cần trả lời 1 số: 1. Con đã nói tiếng Anh cơ bản, tôi muốn con học thêm tiếng Trung mà không phải thêm một lớp riêng, để con có hai ngoại ngữ mà không quá tải. 2. Tối về tôi hay mệt, tôi muốn có bài con tự học được khoảng 15 phút, để con tiến bộ mà mẹ không phải kèm. 3. Con học nhiều nơi mà tôi chưa rõ con đã đến đâu, tôi muốn một lộ trình có mốc và chứng chỉ. 4. Con biết từ mà ngại nói, tôi muốn con được nói thường xuyên để tự tin hơn. Nếu không câu nào đúng, ba mẹ kể giúp em bằng một câu nhé ạ.'],
  ['keo_nhip', '21 ngày · CTV: bé nghỉ từ 2 ngày, kéo nhịp',
    'Dạ em chào {phu_huynh} ạ. Mấy hôm nay em chưa thấy bé {ten_con} vào bài mới. Em gửi ba mẹ link để con học tiếp một buổi ngắn khoảng 15 phút nhé: {link_hoc} . Nếu nhà mình đang vướng gì, ba mẹ trả lời giúp em 1 số để em hỗ trợ đúng: 1. Bố mẹ bận · 2. Con chưa hứng thú · 3. Khó vào web · 4. Lý do khác.'],
  ['thu_giua', '21 ngày · CTV: thư giữa chặng',
    'Dạ em chào {phu_huynh} ạ. Bé {ten_con} đã đi được nửa hành trình 21 ngày rồi ạ. Cô gửi ba mẹ nhận xét giữa chặng: [dán nhận xét của giáo viên: 2 điểm mạnh của con + 1 gợi ý]. Em hỏi thêm ba mẹ một câu: trước đây ba mẹ đã cho con học ngoại ngữ theo cách nào, chỗ nào ba mẹ thấy chưa ổn ạ?'],
  ['phieu_nhu_cau', '21 ngày · phiếu nhu cầu học tập (tuần 3)',
    'Dạ em chào {phu_huynh} ạ. Để chuẩn bị cho bé {ten_con} sau thử thách, ba mẹ trả lời giúp em 4 câu ngắn nhé: 1) Ba mẹ muốn con học tiếp theo cách nào: tự học trên web / lớp online / lớp tại trung tâm? 2) Khung giờ nào tiện cho con? 3) Mỗi tuần 2 hay 3 buổi? 4) Ba mẹ có muốn con học cùng các bạn trong thử thách không ạ? Em cảm ơn ba mẹ!'],
  ['bao_cao', 'Sau chung kết · CTV: gửi Báo cáo năng lực',
    'Dạ em chào {phu_huynh} ạ. Chúc mừng bé {ten_con} đã hoàn thành hành trình 21 ngày! Em gửi ba mẹ Báo cáo năng lực của con: [dán link hoặc ảnh báo cáo]. Trong báo cáo có phần so sánh ngày đầu và ngày cuối của con. Nếu ba mẹ muốn cô tư vấn lộ trình tiếp theo, ba mẹ trả lời "1" giúp em nhé ạ.'],
  ['vet', 'Sau chung kết · Sale: mời tư vấn lộ trình',
    'Dạ em chào {phu_huynh}, em là {nguoi_ho_tro} ạ. Em đã chuẩn bị đề xuất lộ trình riêng cho bé {ten_con} dựa trên kết quả 21 ngày của con. Ba mẹ tiện giờ nào để em gọi khoảng 10 phút trao đổi ạ?'],
  ['gioi_thieu', 'Học viên khóa dài · Sale: mời giới thiệu',
    'Dạ em chào {phu_huynh} ạ. Em cảm ơn ba mẹ đã đồng hành cùng CES. Nếu ba mẹ có bạn bè cũng muốn cho con học Anh – Trung, ba mẹ giới thiệu giúp em nhé ạ: gia đình được giới thiệu nhận mức học phí ưu đãi, và ba mẹ nhận voucher cho khoá sau của bé {ten_con}.'],
  ['ngoai_tuoi', 'Bé ngoài độ tuổi 5–10: mời nhóm đúng tuổi',
    'Dạ em chào {phu_huynh} ạ. Em cảm ơn ba mẹ đã quan tâm chương trình cho bé {ten_con}. Hành trình 21 ngày hiện được thiết kế cho bé 5–10 tuổi, nên em mời ba mẹ vào nhóm học liệu miễn phí theo tuổi để con có hoạt động hợp với con hơn ạ. Bé 3–5 tuổi: https://zalo.me/g/lgqg8t0xkwgjli122qxl · Bé dưới 3 tuổi: https://zalo.me/g/63shvzmfizo7jd0v8amz'],
];

/* ===================== cổng vào ===================== */
function quanTri_(d) {
  const fn = String(d.fn || '');
  try {
    if (fn === 'trangThai') return qtTrangThai_();
    if (fn === 'thietLap') return qtThietLap_(d);
    if (fn === 'dangNhap') return qtDangNhap_(d);
    const s = qtPhien_(d.token);                       // các việc dưới đây cần đăng nhập
    if (fn === 'dangXuat') { CacheService.getScriptCache().remove('qt_s_' + d.token); return { ok: true }; }
    if (fn === 'doiMatKhau') return qtDoiMatKhau_(s, d);
    if (s.me.doiMk) return { ok: false, doiMk: true, err: 'Hãy đổi mật khẩu tạm trước khi dùng trang.' };
    if (fn === 'taiDuLieu') return qtTaiDuLieu_(s);
    if (fn === 'ghiLienHe') return qtGhiLienHe_(s, d.p || {});
    if (fn === 'moKhoa') return qtMoKhoa_(s, d.code, !!d.on);
    if (fn === 'ghiMoHoSo') { qtGhiMoHoSo_(s, d.code); return { ok: true }; }
    if (fn === 'taiKhoan') return qtTaiKhoan_(s);
    if (fn === 'luuTaiKhoan') return qtLuuTaiKhoan_(s, d.tk || {});
    if (fn === 'taoGd') return qtTaoGd_(s, d.p || {});
    if (fn === 'xoaTrung') return qtXoaTrung_(s, d.code);
    if (fn === 'gopTrung') return qtGopTrung_(s);
    if (fn === 'suaGd') return qtSuaGd_(s, d.code, d.p || {});
    if (fn === 'luuThe') return qtLuuThe_(s, d.code, d.the || {});
    return { ok: false, err: 'Không rõ yêu cầu.' };
  } catch (e) {
    const m = String(e && e.message || e);
    return { ok: false, err: m, het: /^PHIEN/.test(m) };
  }
}

/* ===================== tiện ích ===================== */
function qtTab_(ss, name, head, seed) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#FFF3C4');
    if (seed && seed.length) sh.getRange(2, 1, seed.length, seed[0].length).setValues(seed);
  }
  return sh;
}
function qtMs_(v) { if (v instanceof Date) return v.getTime(); if (v === '' || v == null) return 0; const t = new Date(v).getTime(); return isNaN(t) ? 0 : t; }
function qtNgay_(t) { return Utilities.formatDate(new Date(t), QT_TZ, 'yyyy-MM-dd'); }
function qtKhoa_(k) { k = String(k || '').toLowerCase(); return k === 'seed' || k.indexOf('little') >= 0 || k.indexOf('seed') >= 0 ? 'Little Seed' : k.indexOf('canopy') >= 0 ? 'Canopy' : String(k || ''); }
function qtBuoc_(st) { return QT_BUOC.indexOf(st); }
function qtTuoi_(a) { const m = String(a || '').match(/\d+/); return m ? +m[0] : 0; }
function qtNgauNhien_(n, bo) {
  bo = bo || 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now());
  let s = ''; for (let i = 0; i < n; i++) s += bo[((b[i % b.length] + 256) % 256) % bo.length]; return s;
}
function qtCaiDat_(ss) {
  const sh = qtTab_(ss, 'Cài đặt quản trị', ['Mục', 'Giá trị', 'Ghi chú'], QT_CAI_DAT_MAC_DINH);
  const n = Math.max(1, sh.getLastRow() - 1), v = sh.getRange(2, 1, n, 2).getValues(), o = {};
  v.forEach(r => { if (r[0]) o[String(r[0]).trim()] = r[1]; });
  QT_CAI_DAT_MAC_DINH.forEach(r => { if (!(r[0] in o)) { sh.appendRow(r); o[r[0]] = r[1]; } if (o[r[0]] === '' && r[1] !== '') o[r[0]] = r[1]; });
  const gio = String(o['Giờ làm việc']).split('-'), han = qtMs_(o['Hạn đăng ký']);
  const ngay0 = v => { if (v instanceof Date) return new Date(Utilities.formatDate(v, QT_TZ, 'yyyy-MM-dd') + 'T00:00:00+07:00').getTime();
    const m = String(v || '').match(/(\d{4})-(\d{1,2})-(\d{1,2})/); return m ? new Date(m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2) + 'T00:00:00+07:00').getTime() : 0; };
  const batDau = ngay0(o['Ngày bắt đầu 21 ngày']), chungKet = ngay0(o['Ngày chung kết']) || (batDau ? batDau + 21 * 864e5 : 0);
  return { han: han, hanText: han ? Utilities.formatDate(new Date(han), QT_TZ, "HH:mm 'ngày' dd/MM") : '',
    khaiMac: String(o['Khai mạc']), link: String(o['Link trang ưu đãi']), phi: String(o['Phí']), linkHoc: String(o['Link học']),
    phiSo: +String(o['Phí']).replace(/\D/g, '') || 0,
    nong: +o['Ngưỡng nóng'] || 60, am: +o['Ngưỡng ấm'] || 35, gioMo: +gio[0] || 8, gioDong: +gio[1] || 21,
    batDau: batDau, chungKet: chungKet };
}
function qtMaThietLap_(ss, doiMoi) {
  qtCaiDat_(ss);
  const sh = ss.getSheetByName('Cài đặt quản trị'), v = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
  const i = v.findIndex(r => String(r[0]).trim() === 'Mã thiết lập tài khoản');
  let ma = String(v[i][1] || '').trim();
  if (!ma || doiMoi) { ma = qtNgauNhien_(8); sh.getRange(i + 2, 2).setNumberFormat('@').setValue(ma); }
  return ma;
}
function qtTinMau_(ss) {
  const sh = qtTab_(ss, 'Tin mẫu Zalo', ['Mã', 'Dùng khi', 'Nội dung (giữ nguyên các chữ trong ngoặc nhọn)'], QT_TIN_MAU_MAC_DINH);
  const o = {}; sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 3).getValues().forEach(r => { if (r[0]) o[String(r[0]).trim()] = { ten: r[1], noiDung: r[2] }; });
  QT_TIN_MAU_MAC_DINH.forEach(r => { if (!o[r[0]]) { sh.appendRow(r); o[r[0]] = { ten: r[1], noiDung: r[2] }; } });
  return o;
}

/* ===================== tài khoản ===================== */
function qtDoiSheet_(ss) {
  const sh = qtTab_(ss, 'Đội', QT_DOI_HEAD);
  const head = sh.getRange(1, 1, 1, QT_DOI_HEAD.length).getValues()[0];
  if (head.join('|') !== QT_DOI_HEAD.join('|')) {
    sh.getRange(1, 1, 1, QT_DOI_HEAD.length).setValues([QT_DOI_HEAD]).setFontWeight('bold').setBackground('#FFF3C4');
  }
  return sh;
}
function qtDoi_(ss) {
  const sh = qtDoiSheet_(ss), n = sh.getLastRow();
  const rows = n > 1 ? sh.getRange(2, 1, n - 1, QT_DOI_HEAD.length).getValues() : [];
  return { sh: sh, ds: rows.map((r, i) => ({ row: i + 2, user: String(r[0]).trim().toLowerCase(), ten: String(r[1]).trim(), vaiTro: String(r[2]).trim(),
    nhan: yes_(r[3]), hoatDong: r[4] === '' || yes_(r[4]), hash: String(r[5] || ''), muoi: String(r[6] || ''), doiMk: yes_(r[7]),
    cuoi: qtMs_(r[8]) })).filter(t => t.user || t.ten) };
}
function qtTieu_() {
  const p = PropertiesService.getScriptProperties();
  let t = p.getProperty('QT_TIEU'); if (!t) { t = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('QT_TIEU', t); }
  return t;
}
function qtBam_(mk, muoi) {
  const tieu = qtTieu_(); let h = muoi + '|' + mk;
  for (let i = 0; i < 400; i++) h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, tieu + '|' + h, Utilities.Charset.UTF_8));
  return h;
}
function qtUserHopLe_(u) { return /^[a-z0-9._@-]{3,40}$/.test(u); }
function qtMkHopLe_(mk) {
  mk = String(mk || '');
  if (mk.length < 8) return 'Mật khẩu cần ít nhất 8 ký tự.';
  if (!/[a-zA-Z]/.test(mk) || !/\d/.test(mk)) return 'Mật khẩu cần có cả chữ và số.';
  return '';
}
function qtDatMk_(sh, row, mk, phaiDoi) {
  const muoi = qtNgauNhien_(16, 'abcdefghijklmnopqrstuvwxyz0123456789');
  sh.getRange(row, 6, 1, 3).setValues([[qtBam_(mk, muoi), muoi, !!phaiDoi]]);
}
function qtSaiNhieu_(key) {
  const c = CacheService.getScriptCache(), n = +(c.get('qt_f_' + key) || 0);
  if (n >= 6) throw new Error('Nhập sai quá nhiều lần. Đợi 15 phút rồi thử lại.');
  return () => c.put('qt_f_' + key, String(n + 1), 900);
}
function qtTaoPhien_(t) {
  const token = qtNgauNhien_(40, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  CacheService.getScriptCache().put('qt_s_' + token, JSON.stringify({ u: t.user, v: t.hash.slice(0, 12) }), QT_PHIEN_GIAY);
  return token;
}
function qtNguoi_(t) { return { user: t.user, ten: t.ten, vaiTro: t.vaiTro, cap: qtCap_(t.vaiTro), doiMk: t.doiMk }; }
function qtPhien_(token) {
  token = String(token || '');
  if (!/^[A-Za-z0-9]{40}$/.test(token)) throw new Error('PHIEN Phiên đăng nhập đã hết. Hãy đăng nhập lại.');
  const c = CacheService.getScriptCache(), raw = c.get('qt_s_' + token);
  if (!raw) throw new Error('PHIEN Phiên đăng nhập đã hết. Hãy đăng nhập lại.');
  const s = JSON.parse(raw), ss = ss_(), doi = qtDoi_(ss), t = doi.ds.find(x => x.user === s.u);
  if (!t || !t.hoatDong || t.hash.slice(0, 12) !== s.v || QT_VAI_TRO.indexOf(t.vaiTro) < 0) {
    c.remove('qt_s_' + token); throw new Error('PHIEN Tài khoản đã đổi mật khẩu hoặc bị tạm khóa. Hãy đăng nhập lại.');
  }
  c.put('qt_s_' + token, raw, QT_PHIEN_GIAY);          // gia hạn
  return { ss: ss, me: t, doi: doi, token: token };
}
function qtTrangThai_() {
  const ss = ss_(), doi = qtDoi_(ss);
  qtMaThietLap_(ss, false);                           // bảo đảm luôn có mã thiết lập trong Sheet
  return { ok: true, coTaiKhoan: doi.ds.some(t => t.hash) };
}
function qtThietLap_(d) {
  const ghiSai = qtSaiNhieu_('__thiet_lap');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ss = ss_(), ma = qtMaThietLap_(ss, false);
    if (String(d.ma || '').trim().toUpperCase() !== ma.toUpperCase()) { ghiSai(); return { ok: false, err: 'Mã thiết lập không đúng. Mở Sheet dữ liệu, tab "Cài đặt quản trị", dòng "Mã thiết lập tài khoản".' }; }
    const user = String(d.user || '').trim().toLowerCase(), ten = String(d.ten || '').trim().slice(0, 40);
    if (!qtUserHopLe_(user)) return { ok: false, err: 'Tên đăng nhập 3–40 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch.' };
    const loi = qtMkHopLe_(d.mk); if (loi) return { ok: false, err: loi };
    const doi = qtDoi_(ss); let t = doi.ds.find(x => x.user === user);
    if (!t) {
      if (!ten) return { ok: false, err: 'Nhập tên hiển thị.' };
      doi.sh.appendRow([user, ten, 'Quản lý', false, true, '', '', false, '']);
      t = { row: doi.sh.getLastRow() };
    } else {
      doi.sh.getRange(t.row, 5).setValue(true);
      if (ten) doi.sh.getRange(t.row, 2).setValue(ten);
    }
    qtDatMk_(doi.sh, t.row, d.mk, false);
    doi.sh.getRange(t.row, 9).setValue(new Date());
    qtMaThietLap_(ss, true);                            // mã dùng một lần
    const me = qtDoi_(ss).ds.find(x => x.user === user);
    return { ok: true, token: qtTaoPhien_(me), me: qtNguoi_(me) };
  } finally { lock.releaseLock(); }
}
function qtDangNhap_(d) {
  const user = String(d.user || '').trim().toLowerCase(), ghiSai = qtSaiNhieu_(user || '_');
  const ss = ss_(), doi = qtDoi_(ss), t = doi.ds.find(x => x.user === user);
  if (!t || !t.hash || qtBam_(String(d.mk || ''), t.muoi) !== t.hash) { ghiSai(); return { ok: false, err: 'Sai tên đăng nhập hoặc mật khẩu.' }; }
  if (!t.hoatDong) return { ok: false, err: 'Tài khoản đang tạm khóa. Nhờ Quản lý mở lại.' };
  if (QT_VAI_TRO.indexOf(t.vaiTro) < 0) return { ok: false, err: 'Vai trò "' + t.vaiTro + '" chưa có màn hình. Nhờ Quản lý chọn một trong: ' + QT_VAI_TRO.join(', ') + '.' };
  CacheService.getScriptCache().remove('qt_f_' + user);
  doi.sh.getRange(t.row, 9).setValue(new Date());
  return { ok: true, token: qtTaoPhien_(t), me: qtNguoi_(t) };
}
function qtDoiMatKhau_(s, d) {
  const ghiSai = qtSaiNhieu_('doi_' + s.me.user);
  if (qtBam_(String(d.mkCu || ''), s.me.muoi) !== s.me.hash) { ghiSai(); return { ok: false, err: 'Mật khẩu hiện tại không đúng.' }; }
  const loi = qtMkHopLe_(d.mkMoi); if (loi) return { ok: false, err: loi };
  if (d.mkMoi === d.mkCu) return { ok: false, err: 'Mật khẩu mới cần khác mật khẩu cũ.' };
  qtDatMk_(s.doi.sh, s.me.row, d.mkMoi, false);
  CacheService.getScriptCache().remove('qt_s_' + s.token);
  const me = qtDoi_(s.ss).ds.find(x => x.user === s.me.user);
  return { ok: true, token: qtTaoPhien_(me), me: qtNguoi_(me) };
}
function qtTaiKhoan_(s) {
  if (s.me.vaiTro !== 'Quản lý') throw new Error('Chỉ Quản lý xem được danh sách tài khoản.');
  return { ok: true, ds: s.doi.ds.map(t => ({ user: t.user, ten: t.ten, vaiTro: t.vaiTro, nhan: t.nhan, hoatDong: t.hoatDong, coMk: !!t.hash, doiMk: t.doiMk, cuoi: t.cuoi })) };
}
function qtLuuTaiKhoan_(s, tk) {
  if (s.me.vaiTro !== 'Quản lý') throw new Error('Chỉ Quản lý tạo hoặc sửa tài khoản.');
  const user = String(tk.user || '').trim().toLowerCase(), ten = String(tk.ten || '').trim().slice(0, 40);
  if (!qtUserHopLe_(user)) return { ok: false, err: 'Tên đăng nhập 3–40 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch.' };
  if (QT_VAI_TRO.indexOf(tk.vaiTro) < 0) return { ok: false, err: 'Chọn vai trò.' };
  if (!ten) return { ok: false, err: 'Nhập tên (đúng như tên dùng ở cột Người hỗ trợ).' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const doi = qtDoi_(s.ss); let t = doi.ds.find(x => x.user === user), mkTam = '';
    if (doi.ds.some(x => x.ten.toLowerCase() === ten.toLowerCase() && x.user !== user)) return { ok: false, err: 'Tên "' + ten + '" đã có người dùng. Chọn tên khác để không nhầm người hỗ trợ.' };
    if (user === s.me.user && (tk.vaiTro !== 'Quản lý' || tk.hoatDong === false)) return { ok: false, err: 'Bạn không tự hạ vai trò hoặc tự khóa tài khoản của mình được.' };
    if (!t) {
      doi.sh.appendRow([user, ten, tk.vaiTro, !!tk.nhan, true, '', '', true, '']);
      t = { row: doi.sh.getLastRow(), ten: '' }; tk.datLaiMk = true;
    } else {
      doi.sh.getRange(t.row, 2, 1, 4).setValues([[ten, tk.vaiTro, !!tk.nhan, tk.hoatDong !== false]]);
    }
    // đổi tên: đổi luôn tên người hỗ trợ trong tab Gia đình để không mất gia đình đang giao
    if (t.ten && t.ten !== ten) {
      const gd = s.ss.getSheetByName('Gia đình');
      if (gd && gd.getLastRow() > 1) {
        const rg = gd.getRange(2, QT_C['Người hỗ trợ'] + 1, gd.getLastRow() - 1, 1), v = rg.getValues();
        let doiTen = false; v.forEach(r => { if (String(r[0]).trim() === t.ten) { r[0] = ten; doiTen = true; } });
        if (doiTen) rg.setValues(v);
      }
    }
    if (tk.datLaiMk) { mkTam = qtNgauNhien_(4, 'abcdefghjkmnpqrstuvwxyz') + qtNgauNhien_(4, '23456789'); qtDatMk_(doi.sh, t.row, mkTam, true); }
    s.doi = qtDoi_(s.ss);
    const out = qtTaiKhoan_(s); out.mkTam = mkTam; out.user = user;
    return out;
  } finally { lock.releaseLock(); }
}

/* ===================== đồng bộ đơn đăng ký vào tab Gia đình ===================== */
function qtNguonDangKy_(ss) {
  const out = [];
  const read = (name, map, book, chiDaDong) => {
    const sh = (book || ss).getSheetByName(name); if (!sh || sh.getLastRow() < 2) return;
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues().forEach(r => {
      const phone = normPhone_(r[map.phone]); if (!phone) return;
      if (chiDaDong && !(map.paid != null && yes_(r[map.paid]))) return;
      out.push({ nguon: (book ? 'Sheet cũ · ' : '') + name.trim(), t: qtMs_(r[map.t]), parent: String(r[map.parent] || '').trim(), phone: phone,
        kid: String(r[map.kid] || '').trim(), age: map.age != null ? String(r[map.age] || '') : '', khoa: map.khoa != null ? qtKhoa_(r[map.khoa]) : '',
        ho: map.ho != null ? String(r[map.ho] || '').trim() : '', paid: map.paid != null && yes_(r[map.paid]),
        ref: map.ref != null ? String(r[map.ref] || '').trim().toUpperCase() : '', biet: map.biet != null ? String(r[map.biet] || '').trim() : '',
        anh: map.anh != null ? String(r[map.anh] || '') : '', fam: map.fam != null ? String(r[map.fam] || '').trim() : '' });
    });
  };
  read('Đăng ký Web', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, biet: 8, anh: 9, khoa: 10, ho: 12, paid: 14, ref: 15, fam: 16 });
  try {
    const old = SpreadsheetApp.openById(OLD_DATA_ID);
    read('Đăng ký Web', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, anh: 9, khoa: 10, ho: 12, paid: 14, ref: 15 }, old, true);
    read('Google Form', { t: 0, parent: 1, phone: 2, kid: 4, age: 5, anh: 9, ho: 10, paid: 12 }, old, true);
    read('Danh sách đóng tiền ', { t: null, parent: 1, kid: 2, age: 3, phone: 4, paid: 6 }, old, true);
  } catch (e) { }
  return out;
}
/* Khóa so khớp số điện thoại: bỏ +84/84 và các số 0 đầu (Sheet hay làm mất số 0 đầu). Gmail giữ nguyên chữ thường. */
function qtKeySo_(v) {
  const t = String(v == null ? '' : v).trim().toLowerCase().replace(/^'/, '');
  if (t.indexOf('@') > 0) return t;
  let d = t.replace(/\D/g, ''); if (/^84\d{9,10}$/.test(d)) d = d.slice(2);
  d = d.replace(/^0+/, ''); return d.length >= 8 ? d : '';
}
function qtDongBo_(rows, dk, ls) {
  ls = ls || { soCu: {}, tenCon: {} };
  const byPhone = {}, byCode = {};
  rows.forEach((r, i) => { const k = qtKeySo_(r[QT_C['Số Zalo']]); if (k && byPhone[k] == null) byPhone[k] = i; byCode[String(r[QT_C['Mã gia đình']])] = i; });
  let changed = false; const now = Date.now(), moi = {};
  dk.forEach(d => {
    const kd = qtKeySo_(d.phone);
    let i = d.fam && byCode[d.fam] != null ? byCode[d.fam] : byPhone[kd];
    if (i == null && ls.soCu[kd] && byCode[ls.soCu[kd]] != null) i = byCode[ls.soCu[kd]];   // số đã được sửa trên trang quản trị
    if (i == null) {
      const r = GD_HEAD.map(() => '');
      r[QT_C['Mã gia đình']] = 'GD' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
      r[QT_C['Tạo lúc']] = new Date(d.t || now); r[QT_C['Nguồn']] = d.nguon; r[QT_C['Mã CTV']] = d.ref || 'TU_NHIEN';
      r[QT_C['Tên ba/mẹ']] = d.parent; r[QT_C['Số Zalo']] = d.phone; r[QT_C['Tên con']] = d.kid; r[QT_C['Tuổi']] = d.age; r[QT_C['Khoá']] = d.khoa;
      r[QT_C['ĐY học tập']] = true; r[QT_C['ĐY tư vấn']] = true; r[QT_C['ĐY tin ưu đãi']] = '';
      r[QT_C['Trạng thái']] = d.paid ? 'Đang học 21 ngày' : 'Chờ đóng phí'; r[QT_C['Đổi trạng thái lúc']] = new Date(d.t || now);
      r[QT_C['Người hỗ trợ']] = d.ho; r[QT_C['Ghi chú']] = d.anh ? 'Hình ảnh: ' + d.anh : '';
      r[QT_C['Liên hệ gần nhất']] = new Date(d.t || now);
      if (d.paid) { r[QT_C['Mở khóa 21 ngày']] = true; r[QT_C['Mở khóa lúc']] = new Date(); } else r[QT_C['Mở khóa 21 ngày']] = false;
      rows.push(r); byPhone[qtKeySo_(d.phone)] = rows.length - 1; moi[rows.length - 1] = 1; changed = true; return;
    }
    const r = rows[i];
    if (d.kid && !ls.tenCon[String(r[QT_C['Mã gia đình']])] && String(r[QT_C['Tên con']]).toLowerCase().indexOf(d.kid.toLowerCase()) < 0 &&
        d.kid.toLowerCase().indexOf(String(r[QT_C['Tên con']]).toLowerCase()) < 0) { r[QT_C['Tên con']] = r[QT_C['Tên con']] ? r[QT_C['Tên con']] + ', ' + d.kid : d.kid; changed = true; }
    if (!r[QT_C['Khoá']] && d.khoa) { r[QT_C['Khoá']] = d.khoa; changed = true; }
    if (!r[QT_C['Người hỗ trợ']] && d.ho) { r[QT_C['Người hỗ trợ']] = d.ho; changed = true; }
    if ((!r[QT_C['Mã CTV']] || r[QT_C['Mã CTV']] === 'TU_NHIEN') && d.ref) { r[QT_C['Mã CTV']] = d.ref; changed = true; }
    const st = String(r[QT_C['Trạng thái']]), want = d.paid ? 'Đang học 21 ngày' : 'Chờ đóng phí', cur = qtBuoc_(st);
    if (cur < 0 && st !== 'Dừng' || (cur >= 0 && cur < qtBuoc_(want))) {
      r[QT_C['Trạng thái']] = want; changed = true;
      if (!moi[i]) r[QT_C['Đổi trạng thái lúc']] = new Date();
    }
    if (d.paid && !yes_(r[QT_C['Mở khóa 21 ngày']]) && !/^khóa/i.test(String(r[QT_C['Mở khóa lúc']] || ''))) {
      r[QT_C['Mở khóa 21 ngày']] = true; r[QT_C['Mở khóa lúc']] = new Date(); changed = true;
    }
  });
  return changed;
}

/* ===================== sự kiện học thử, nhật ký, điểm học ===================== */
function qtSuKien_(ss) {
  const sh = ss.getSheetByName('Truy cập học thử'), byVid = {}, all = [];
  if (!sh || sh.getLastRow() < 2) return { byVid: byVid, all: all };
  sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(r => {
    const vid = String(r[2] || ''), ev = String(r[3] || ''), t = qtMs_(r[0]); if (!vid || !ev) return;
    const e = byVid[vid] || (byVid[vid] = { ev: {}, tEv: {}, days: {}, noi: 0, khoa: 0, ref: String(r[1] || ''), g: '', age: '', first: t, last: t, log: [] });
    e.ev[ev] = (e.ev[ev] || 0) + 1; e.last = Math.max(e.last, t); e.first = Math.min(e.first, t);
    if (!e.tEv[ev] || t < e.tEv[ev]) e.tEv[ev] = t;
    if (r[4]) e.g = String(r[4]);
    if (['vao', 'hoc', 'xong1', 'xong2', 'xong3', 'noi'].indexOf(ev) >= 0) e.days[qtNgay_(t)] = 1;
    if (ev === 'noi') e.noi = Math.max(e.noi, +r[5] || 0);
    if (ev === 'hoc' && r[5]) e.age = String(r[5]);
    if (ev === 'khoa') e.khoa++;
    if (e.log.length < 60 && ev !== 'mo') e.log.push([t, ev, String(r[5] || '')]);
    all.push({ vid: vid, ref: String(r[1] || 'TU_NHIEN'), ev: ev, t: t, g: String(r[4] || '') });
  });
  return { byVid: byVid, all: all };
}
function qtNhatKy_(ss) {
  const sh = ss.getSheetByName('Nhật ký cuộc gọi'), byFam = {}, all = [];
  if (!sh || sh.getLastRow() < 2) return { byFam: byFam, all: all };
  if (!sh.getRange(1, 16).getValue()) sh.getRange(1, 16, 1, 2).setValues([['Mã gia đình', 'Kết quả']]);
  if (!sh.getRange(1, 18).getValue()) sh.getRange(1, 18).setValue('Việc');
  sh.getRange(2, 1, sh.getLastRow() - 1, 18).getValues().forEach(r => {
    const c = { t: qtMs_(r[0]), ai: String(r[1] || ''), kq: String(r[16] || ''), tt: String(r[10] || ''),
      hen: qtMs_(r[11]) ? qtMs_(r[11]) : String(r[11] || ''), ghiChu: String(r[14] || ''), viec: String(r[17] || '') };
    all.push(c);
    const code = String(r[15] || ''); if (code) (byFam[code] = byFam[code] || []).push(c);
  });
  return { byFam: byFam, all: all };
}
function qtDiem_(ss) {
  const sh = ss.getSheetByName('Diem'), out = [];
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 7).getValues().forEach(r => {
    if (!r[0]) return;
    out.push({ kid: String(r[0]), ten: String(r[1] || ''), g: String(r[2] || ''), day: +r[3] || 0, round: +r[4] || 0, diem: +r[5] || 0, t: qtMs_(r[6]) });
  });
  return out;
}
/* Thẻ gia đình (tab "Thẻ gia đình"): mã gia đình → thẻ 6 ô (cột A–P) + offer đã trao đổi (cột Q–W) */
const QT_OFFER_HEAD = ['Offer: lộ trình đề xuất', 'Offer: hình thức', 'Offer: gói học phí', 'Offer: khung giờ', 'Offer: tình trạng', 'Offer: ghi chú', 'Offer cập nhật lúc'];
const QT_OFFER_KEY = ['oLoTrinh', 'oHinhThuc', 'oGoi', 'oGio', 'oTinhTrang', 'oGhiChu'];
const QT_THE_W = QT_THE_HEAD.length + QT_OFFER_HEAD.length;
function qtTheSheet_(ss) {
  const sh = qtTab_(ss, 'Thẻ gia đình', QT_THE_HEAD.concat(QT_OFFER_HEAD));
  if (sh.getRange(1, QT_THE_HEAD.length + 1).getValue() !== QT_OFFER_HEAD[0])
    sh.getRange(1, QT_THE_HEAD.length + 1, 1, QT_OFFER_HEAD.length).setValues([QT_OFFER_HEAD]).setFontWeight('bold').setBackground('#FFF3C4');
  return sh;
}
function qtThe_(ss) {
  const sh = ss.getSheetByName('Thẻ gia đình'), out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, QT_THE_W).getValues().forEach((r, i) => {
    const code = String(r[0] || '').trim(); if (!code) return;
    const t = { row: i + 2 }; QT_THE_KEY.forEach((k, j) => t[k] = String(r[j] == null ? '' : r[j]));
    t.luc = qtMs_(r[14]); t.ai = String(r[15] || '');
    QT_OFFER_KEY.forEach((k, j) => t[k] = String(r[16 + j] == null ? '' : r[16 + j]));
    t.oLuc = qtMs_(r[16 + QT_OFFER_KEY.length]); out[code] = t;
  });
  return out;
}
/* Tiến độ 21 ngày của từng gia đình: web học đặt mã bé = băm("SĐT|tên-con-không-dấu") (hashAcct_ ở Code.gs).
 * Dự phòng cho bé đặt tên hơi khác: khớp tab TienDo theo 4 số cuối của SĐT + tên con. */
function qtSlug_(s) { return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-'); }
function qtChe_(a) { return a.indexOf('@') > 0 ? a.slice(0, 2) + '***@' + a.split('@')[1] : '***' + a.slice(-4); }
function qtHoc21_(ss) {
  const be = {}, td = {};
  qtDiem_(ss).forEach(x => { if (x.diem <= 0) return; const b = be[x.kid] || (be[x.kid] = { ngay: {}, cuoi: 0, diem: 0 });
    b.ngay[x.day] = 1; b.cuoi = Math.max(b.cuoi, x.t); b.diem += x.diem; });
  const sh = ss.getSheetByName('TienDo');
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues().forEach(r => {
    if (r[0] && r[2]) td[String(r[2]) + '|' + qtSlug_(r[1])] = String(r[0]);
  });
  return { be: be, td: td };
}
function qtHoc21Gd_(f, h21) {
  const so = normPhone_(f.zalo); if (!so) return null;
  let out = null;
  String(f.tenCon || '').split(',').map(x => x.trim()).filter(Boolean).forEach(ten => {
    const sl = qtSlug_(ten), id = hashAcct_(so + '|' + sl), b = h21.be[id] || h21.be[h21.td[qtChe_(so) + '|' + sl]];
    if (!b) return;
    const buoi = Object.keys(b.ngay).length;
    if (!out || b.cuoi > out.cuoi) out = { buoi: buoi, cuoi: b.cuoi, diem: b.diem };
  });
  return out;
}
function qtLuuThe_(s, code, the) {
  const cap = qtCap_(s.me.vaiTro), keys = cap === 'ctv' ? QT_THE_CTV : QT_THE_KEY.slice(1).concat(QT_OFFER_KEY);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let doi = 0;
  try {
    qtTimGd_(s, code);                                  // kiểm tra quyền với gia đình này
    const sh = qtTheSheet_(s.ss), cu = qtThe_(s.ss)[String(code)], tat = QT_THE_KEY.concat(QT_OFFER_KEY);
    const v = {}; tat.forEach(k => v[k] = k === 'code' ? String(code) : cu ? cu[k] : '');
    let doiThe = 0, doiOffer = 0;
    keys.forEach(k => {
      if (the[k] == null) return;
      let val = String(the[k]).trim().slice(0, k === 'nhom' ? 1 : 600);
      if (k === 'nhom' && val && !/^[A-E]$/.test(val)) val = '';
      if (/^[=+@]/.test(val)) val = "'" + val;          // không để ô bị hiểu là công thức
      if (v[k] !== val) { v[k] = val; if (QT_OFFER_KEY.indexOf(k) >= 0) doiOffer++; else doiThe++; }
    });
    doi = doiThe + doiOffer;
    if (doi) {
      const now = new Date();
      const row = QT_THE_KEY.map(k => v[k]).concat([doiThe ? now : (cu && cu.luc ? new Date(cu.luc) : ''), doiThe ? s.me.ten : (cu ? cu.ai : '')])
        .concat(QT_OFFER_KEY.map(k => v[k])).concat([doiOffer ? now : (cu && cu.oLuc ? new Date(cu.oLuc) : '')]);
      const at = cu ? cu.row : sh.getLastRow() + 1;
      sh.getRange(at, 1, 1, QT_THE_W).setValues([row]);
    }
  } finally { lock.releaseLock(); }
  return Object.assign(qtTaiDuLieu_(s), { soSua: doi });
}
function qtCham_(r, e, calls) {
  const parts = [], add = (nhom, ten, d, ok) => parts.push({ nhom: nhom, ten: ten, diem: d, ok: !!ok });
  const age = qtTuoi_(r[QT_C['Tuổi']] || (e && e.age)), kq = calls.map(c => c.kq), ev = (e && e.ev) || {};
  add('Phù hợp', 'Bé 5–10 tuổi', 10, age >= 5 && age <= 10);
  add('Phù hợp', 'Để lại Zalo, đồng ý được tư vấn', 10, yes_(r[QT_C['ĐY tư vấn']]));
  add('Phù hợp', 'Đã nói chuyện được với ba hoặc mẹ', 10, kq.indexOf('Đã nói chuyện') >= 0);
  add('Dùng thử', 'Xong buổi 1', 10, ev.xong1 || ev.xong2 || ev.xong3);
  add('Dùng thử', 'Xong cả 3 buổi', 10, ev.xong3);
  add('Dùng thử', 'Học vào từ 2 ngày khác nhau', 10, e && Object.keys(e.days).length >= 2);
  add('Dùng thử', 'Con nói thành tiếng từ 5 lần', 10, e && e.noi >= 5);
  add('Ý định', 'Bấm "Đăng ký cho con" hoặc "Kích hoạt 21 ngày"', 10, ev.bam_dk || ev.kich_hoat);
  add('Ý định', 'Ba mẹ nhắn lại hoặc hỏi thêm', 10, kq.indexOf('Ba mẹ nhắn lại / hỏi thêm') >= 0);
  add('Ý định', 'Mở mục Ba mẹ đồng hành', 5, ev.dong_hanh);
  add('Ý định', 'Bấm vào phần bị khóa từ 2 lần', 5, e && e.khoa >= 2);
  return { diem: parts.reduce((a, p) => a + (p.ok ? p.diem : 0), 0), chiTiet: parts };
}

/* ===================== việc hôm nay ===================== */
/* Hạn xử lý: "gọi trong 1 giờ" (gio = 1) hoặc "trong ca" (gio = 4) tính trong giờ làm việc.
 * Ngoài giờ làm việc thì dời sang sáng hôm sau: 9:00 cho việc 1 giờ, 9:00 + (gio – 1) giờ cho việc trong ca. */
function qtHanGoi_(t, cd, gio) {
  gio = gio || 1;
  const d = new Date(t + gio * 3600e3), h = +Utilities.formatDate(d, QT_TZ, 'H');
  if (h >= cd.gioMo && h < cd.gioDong) return d.getTime();
  const base = new Date(t + (h >= cd.gioDong ? 86400e3 : 0));
  return new Date(Utilities.formatDate(base, QT_TZ, 'yyyy-MM-dd') + 'T09:00:00+07:00').getTime() + (gio - 1) * 3600e3;
}
function qtHanCa_(t, cd) { return qtHanGoi_(t, cd, 4); }
/* Ai làm việc này: gia đình nóng → Sale gọi trong 1 giờ; còn lại → CTV nhắn Zalo theo mẫu, hạn trong ca. */
function qtTheoLan_(x, f, cd, t0) {
  if (f.lan === 'nóng') { x.ai = 'sale'; return x; }
  x.ai = 'ctv'; if (t0) x.han = qtHanCa_(t0, cd);
  if (x.ten.indexOf('Gọi ') === 0) x.ten = 'Nhắn Zalo' + x.ten.slice(3);
  return x;
}
function qtViec_(f, cd, now) {
  const st = f.trangThai, lan = f.lan, lh = f.lienHeGanNhat, sa = f.doiTrangThaiLuc, v = [];
  if (f.moKhoa) return v;   // đã đóng phí và đã mở khóa 21 ngày → việc 21 ngày do qtViec21_ sinh
  if (f.henGoiLai && f.henGoiLai <= now + 2 * 3600e3 && f.henGoiLai > lh)
    v.push({ loai: 'goi_lai', ai: 'sale', uuTien: 0, ten: 'Gọi lại theo hẹn', han: f.henGoiLai, tin: 'goi_lai' });
  if (f.hocThu) return qtViecHocThu_(f, cd, now, v);
  if (st === 'Đang dùng thử' && !lh)
    v.push(qtTheoLan_({ loai: 'chao', uuTien: 1, ten: lan === 'nóng' ? 'Gọi chào ngay (gia đình nóng)' : 'Gọi chào – vừa để lại Zalo', han: qtHanGoi_(f.taoLuc, cd), dem: f.taoLuc, tin: 'chao' }, f, cd, f.taoLuc));
  if (f.dyTuVan && (st === 'Mời đăng ký' || (st === 'Đang dùng thử' && lan === 'nóng' && lh)) && lh < sa) {
    const gap48 = cd.han && now > cd.han - 48 * 3600e3 && now < cd.han;
    if (lan === 'nóng') v.push({ loai: 'moi', ai: 'sale', uuTien: 2, ten: 'Gọi mời đăng ký (nóng)', han: qtHanGoi_(sa, cd), tin: 'moi_nong' });
    else if (lan === 'ấm') v.push({ loai: 'moi', ai: gap48 ? 'sale' : 'ctv', uuTien: gap48 ? 2 : 4, ten: gap48 ? 'Gọi mời đăng ký (ấm, sát hạn)' : 'Nhắn Zalo mời đăng ký (ấm)', han: sa + 24 * 3600e3, tin: 'moi_am' });
    else v.push({ loai: 'moi', ai: 'ctv', uuTien: 6, ten: 'Mời vào nhóm Zalo học liệu (lạnh)', han: sa + 48 * 3600e3, tin: 'nuoi_duong' });
  }
  if (st === 'Chờ đóng phí' && f.dyTuVan) {
    const sat = cd.han && now > cd.han - 24 * 3600e3 && now < cd.han;
    if (now - lh > 24 * 3600e3 || (sat && lh < cd.han - 24 * 3600e3))
      v.push({ loai: 'phi', ai: lan === 'nóng' ? 'sale' : 'ctv', uuTien: 3, ten: 'Nhắc đóng phí' + (cd.han > now ? ' – còn ' + Math.max(0, Math.round((cd.han - now) / 3600e3)) + ' giờ tới hạn' : ''), han: Math.max(lh + 24 * 3600e3, now), tin: 'nhac_phi' });
  }
  // Đã đóng phí nhưng chưa mở: chỉ một thẻ "Mở khóa 21 ngày"; tin mẫu đi kèm là tin gửi link học, Zoom, nhóm Zalo.
  if (st === 'Đang học 21 ngày')
    v.push({ loai: 'mo', ai: 'ctv', uuTien: 1, ten: 'Mở khóa 21 ngày (đã đóng phí, chưa mở)', han: sa + 2 * 3600e3, tin: 'link_hoc' });
  return v;
}

/* Việc hằng ngày cho gia đình đăng ký ở ô "Học thử miễn phí" (danh sách riêng, tab "Đăng ký học thử").
 * Thay cho các việc chào/mời chung: chào ngay sau đăng ký → nhắc nếu 24 giờ chưa vào học → mời kích hoạt khi bé xong buổi 2
 * → ba mẹ bấm Kích hoạt thì kiểm tra chuyển khoản và mở khóa. */
function qtViecHocThu_(f, cd, now, v) {
  const st = f.trangThai, lh = f.lienHeGanNhat, t0 = f.hocThu.t || f.taoLuc, h = f.hoc || {};
  if (['Dừng', 'Nuôi dưỡng', 'Học viên khóa dài'].indexOf(st) >= 0) return v;
  const daBam = !!h.tKichHoat, xong2 = h.tXong2 || (h.soBuoi >= 2 ? h.cuoi : 0);
  if (daBam && st !== 'Đang học 21 ngày')       // kiểm tra tiền về: Sale (việc liên quan đến tiền)
    v.push({ loai: 'mo', ai: 'sale', uuTien: 0, ten: 'Ba mẹ bấm Kích hoạt: kiểm tra chuyển khoản rồi mở khóa 21 ngày', han: h.tKichHoat + 2 * 3600e3, dem: h.tKichHoat, demTen: 'bấm kích hoạt', tin: 'link_hoc' });
  if (st === 'Đang học 21 ngày')
    v.push({ loai: 'mo', ai: 'ctv', uuTien: 1, ten: 'Mở khóa 21 ngày (đã đóng phí, chưa mở)', han: f.doiTrangThaiLuc + 2 * 3600e3, tin: 'link_hoc' });
  if (!lh && !daBam && st !== 'Đang học 21 ngày')
    v.push(qtTheoLan_({ loai: 'chao', uuTien: 1, ten: 'Gọi chào – vừa đăng ký học thử', han: qtHanGoi_(t0, cd), dem: t0, demTen: 'đăng ký', tin: 'chao_thu' }, f, cd, t0));
  else if (!daBam && !h.soBuoi && now - t0 > 24 * 3600e3 && lh < t0 + 24 * 3600e3)
    v.push({ loai: 'nhac', ai: 'ctv', uuTien: 5, ten: 'Đăng ký học thử 1 ngày, bé chưa vào học: nhắc nhẹ', han: t0 + 48 * 3600e3, dem: t0, demTen: 'đăng ký', tin: 'nhac_thu' });
  if (!daBam && xong2 && f.dyTuVan && lh < xong2 && ['Đang dùng thử', 'Mời đăng ký'].indexOf(st) >= 0)
    v.push(qtTheoLan_({ loai: 'moi', uuTien: 2, ten: 'Bé xong buổi 2: mời kích hoạt 21 ngày', han: qtHanGoi_(xong2, cd), dem: xong2, demTen: 'xong buổi 2', tin: 'moi_kich_hoat' }, f, cd, xong2));
  if (f.henGoiLai && f.henGoiLai <= now + 2 * 3600e3 && f.henGoiLai > lh && !v.some(x => x.loai === 'goi_lai'))
    v.push({ loai: 'goi_lai', ai: 'sale', uuTien: 0, ten: 'Gọi lại theo hẹn', han: f.henGoiLai, tin: 'goi_lai' });
  return v;
}

/* ===================== nhóm A–E và việc theo bản đồ điểm chạm =====================
 * A Tích cực · B Học đều, ít lên tiếng · C Tụt nhịp (nghỉ từ 2 ngày) · D Học thử, chưa kích hoạt · E Nuôi dưỡng / cộng đồng.
 * Sale, Cố vấn chọn tay được trong Thẻ gia đình; để trống thì tự xếp theo dữ liệu. */
const QT_DONG = ['Dừng', 'Nuôi dưỡng', 'Học viên khóa dài'];
/* Việc theo bản đồ điểm chạm bắt đầu tính hạn từ ngày áp dụng, để việc "lẽ ra" sinh trước đó không hiện quá hạn hàng loạt */
const QT_VIEC_MOI_TU = new Date('2026-10-28T09:00:00+07:00').getTime();
function qtMoKhoaT_(f) { return typeof f.moKhoaLuc === 'number' && f.moKhoaLuc ? f.moKhoaLuc : f.doiTrangThaiLuc || f.taoLuc; }
function qtNhom_(f, c, now) {
  if (f.the && /^[A-E]$/.test(f.the.nhom)) return f.the.nhom;
  if (f.trangThai === 'Nuôi dưỡng' || f.trangThai === 'Dừng') return 'E';
  if (!f.moKhoa) return 'D';
  if (f.lan === 'nóng' || c.some(x => x.kq === 'Ba mẹ nhắn lại / hỏi thêm' || x.kq === 'Chuyển sale')) return 'A';
  const h = f.h21, cuoi = h && h.cuoi ? h.cuoi : 0, cd = f._cd || {};
  if (cd.chungKet && now >= cd.chungKet) return 'B';       // hết 21 ngày: không còn "tụt nhịp"
  if (cuoi ? now - cuoi >= 2 * 864e5 : now - qtMoKhoaT_(f) >= 2 * 864e5) return 'C';
  return 'B';
}
function qtTheDu_(t) { if (!t) return 0; return [t.o1, t.khi || t.muon || t.de, t.o3, t.o4, t.o5, t.o6].filter(x => String(x || '').trim()).length; }

/* Việc tự sinh từ bản đồ điểm chạm: chuyển cấp (CTV → Sale → Cố vấn), giao người, ngoài độ tuổi,
 * và các điểm chạm 21 ngày theo tuần. Mỗi việc đóng lại khi có một dòng Nhật ký ghi đúng mã việc (cột "Việc"). */
function qtViec21_(f, c, cd, now, capOf) {
  const v = [], st = f.trangThai, chu = f.nguoiHoTro, capChu = capOf[chu] || '';
  const coChu = !!chu && capChu !== 'ctv';
  if (st === 'Dừng') return v;
  const daLam = (ma, sau) => c.some(x => x.viec === ma && x.t >= (sau || 0));
  const cuoiKq = kq => c.reduce((m, x) => x.kq === kq && x.t > m.t ? x : m, { t: 0, ghiChu: '' });
  const capLienHeSau = (t, caps) => c.some(x => x.t > t && QT_KQ_LIEN_HE.indexOf(x.kq) >= 0 && caps.indexOf(capOf[x.ai] || 'sale') >= 0);
  const add = x => { x.g21 = true; if (x.han < QT_VIEC_MOI_TU + 4 * 3600e3) x.han = QT_VIEC_MOI_TU + 4 * 3600e3; v.push(x); };

  /* ---- chuyển cấp ---- */
  const chuyen = cuoiKq('Chuyển sale');
  if (chuyen.t && !capLienHeSau(chuyen.t, ['sale', 'cv', 'ql'])) {
    if (coChu) add({ loai: 'chuyen', ai: 'sale', uuTien: 0, ten: 'CTV chuyển: liên hệ trong 24 giờ' + (chuyen.ghiChu ? ' · ' + chuyen.ghiChu.slice(0, 70) : ''),
      han: chuyen.t + 24 * 3600e3, dem: chuyen.t, demTen: 'CTV chuyển', tin: 'goi_lai' });
    else add({ loai: 'giao', ai: 'cv', uuTien: 0, ten: 'Giao sale: CTV vừa chuyển gia đình' + (chuyen.ghiChu ? ' · ' + chuyen.ghiChu.slice(0, 60) : ''),
      han: chuyen.t + 4 * 3600e3, dem: chuyen.t, demTen: 'CTV chuyển' });
  }
  const xin = cuoiKq('Xin ý kiến cố vấn'), tra = cuoiKq('Cố vấn trả lời');
  if (xin.t > tra.t) add({ loai: 'xin', ai: 'cv', uuTien: 0, ten: 'Xin ý kiến' + (xin.ghiChu ? ': ' + xin.ghiChu.slice(0, 90) : ''), han: xin.t + 24 * 3600e3, dem: xin.t, demTen: 'sale hỏi' });
  else if (tra.t && !capLienHeSau(tra.t, ['sale', 'ql'])) add({ loai: 'tra_loi', ai: 'sale', uuTien: 1, ten: 'Cố vấn đã trả lời: báo lại ba mẹ' + (tra.ghiChu ? ' · ' + tra.ghiChu.slice(0, 70) : ''), han: tra.t + 24 * 3600e3, tin: 'goi_lai' });

  /* ---- giao người: gia đình đáng có sale mà chưa có ---- */
  if (!coChu && QT_DONG.indexOf(st) < 0 && !v.some(x => x.loai === 'giao') && (f.lan === 'nóng' || f.nhom === 'A' || (f.moKhoa && !chu))) {
    const sang = new Date(Utilities.formatDate(new Date(now), QT_TZ, 'yyyy-MM-dd') + 'T09:00:00+07:00').getTime();
    add({ loai: 'giao', ai: 'cv', uuTien: 3, ten: f.lan === 'nóng' ? 'Giao sale cho gia đình nóng' : 'Giao người phụ trách', han: Math.max(sang, f.taoLuc) });
  }

  /* ---- bé ngoài độ tuổi 5–10 ---- */
  const tuoi = qtTuoi_(f.tuoi);
  if (tuoi && (tuoi < 5 || tuoi > 10) && !f.moKhoa && QT_DONG.indexOf(st) < 0 && !daLam('ngoai_tuoi'))
    add({ loai: 'ngoai_tuoi', ai: 'ctv', uuTien: 4, ten: 'Bé ' + tuoi + ' tuổi, ngoài độ tuổi 5–10: mời nhóm đúng tuổi', han: qtHanCa_(f.taoLuc, cd), tin: 'ngoai_tuoi' });

  /* ---- 21 ngày ---- */
  if (!f.moKhoa || !cd.batDau || now < cd.batDau || QT_DONG.indexOf(st) >= 0 && st !== 'Học viên khóa dài') return v;
  const D = 864e5, ngay = Math.floor((now - cd.batDau) / D) + 1, tMo = Math.max(qtMoKhoaT_(f), cd.batDau);
  const n = f.nhom, sau = cd.chungKet ? Math.floor((now - cd.chungKet) / D) + 1 : 0;   // ngày thứ mấy sau chung kết
  const t = f.the || {};

  if (st === 'Học viên khóa dài') {
    if (coChu && now - f.doiTrangThaiLuc >= 3 * D && !daLam('gioi_thieu'))
      add({ loai: 'gioi_thieu', ai: 'sale', uuTien: 5, ten: 'Bám: mời giới thiệu bạn bè', han: f.doiTrangThaiLuc + 5 * D, tin: 'gioi_thieu' });
    return v;
  }
  if (ngay <= 21) {
    // Tuần 1 · Bạn
    if (!String(t.o1 || '').trim() && !daLam('boi_canh'))
      add({ loai: 'boi_canh', ai: 'ctv', uuTien: 4, ten: 'Chào mừng 21 ngày + 3 câu bối cảnh (ô ①)', han: qtHanCa_(tMo, cd), tin: 'boi_canh' });
    if (n === 'A' && coChu && ngay <= 14 && !daLam('khao_sat'))
      add({ loai: 'khao_sat', ai: 'sale', uuTien: 2, ten: 'Bạn: hẹn và gọi khảo sát 2–3 phút', han: tMo + 2 * D, tin: 'hen_khao_sat' });
    // Hỏi bằng số mỗi tuần cho nhóm B (từ ngày thứ 3 của tuần)
    const tuan = Math.ceil(ngay / 7), thu = (ngay - 1) % 7 + 1;
    if ((n === 'B' || n === 'C') && tuan <= 2 && thu >= 3 && !daLam('hoi_so_' + tuan))
      add({ loai: 'hoi_so_' + tuan, ai: 'ctv', uuTien: 5, ten: 'Hỏi bằng số · tuần ' + tuan, han: qtHanCa_(cd.batDau + ((tuan - 1) * 7 + 2) * D + 9 * 3600e3, cd), tin: 'hoi_so_' + tuan });
    // Nhóm C: kéo nhịp
    const h = f.h21, cuoi = h && h.cuoi ? h.cuoi : 0, moc = cuoi || tMo;
    if (now - moc >= 2 * D && !daLam('keo_nhip', moc))
      add({ loai: 'keo_nhip', ai: 'ctv', uuTien: 3, ten: cuoi ? 'Bé nghỉ ' + Math.floor((now - cuoi) / D) + ' ngày: kéo nhịp' : 'Mở khóa 2 ngày, bé chưa vào học 21 ngày', han: qtHanCa_(moc + 2 * D, cd), tin: cuoi ? 'keo_nhip' : 'nhac_hoc' });
    // Tuần 3 · Bàn: thư giữa chặng, phiếu nhu cầu, bổ sung thẻ
    if (ngay >= 15) {
      const t15 = cd.batDau + 14 * D + 9 * 3600e3;
      if (!daLam('thu_giua'))
        add({ loai: 'thu_giua', ai: 'ctv', uuTien: 4, ten: 'Gửi thư giữa chặng (kèm nhận xét của giáo viên)', han: qtHanCa_(t15, cd), tin: 'thu_giua' });
      if (!daLam('phieu_nhu_cau'))
        add(n === 'A' && coChu
          ? { loai: 'phieu_nhu_cau', ai: 'sale', uuTien: 2, ten: 'Bàn: phiếu nhu cầu học tập + chốt giữ chỗ', han: t15 + D, tin: 'phieu_nhu_cau' }
          : { loai: 'phieu_nhu_cau', ai: 'ctv', uuTien: 5, ten: 'Gửi phiếu nhu cầu học tập', han: qtHanCa_(t15, cd), tin: 'phieu_nhu_cau' });
      const du = qtTheDu_(t);
      if (n === 'A' && coChu && du < 6 && !daLam('bo_sung_the', cd.batDau + 14 * D))
        add({ loai: 'bo_sung_the', ai: 'sale', uuTien: 4, ten: 'Bổ sung thẻ: còn thiếu ' + (6 - du) + ' ô', han: t15 + 2 * D });
    }
  } else if (sau >= 1 && sau <= 7) {
    // Chung kết và 7 ngày sau · Bán, Bám
    if (!daLam('bao_cao'))
      add({ loai: 'bao_cao', ai: 'ctv', uuTien: 3, ten: 'Gửi Báo cáo năng lực sau chung kết', han: qtHanCa_(cd.chungKet + 9 * 3600e3, cd), tin: 'bao_cao' });
    const lan = sau >= 6 ? 3 : sau >= 3 ? 2 : 1, moc = [0, 1, 3, 6][lan];
    if (coChu && (n === 'A' || n === 'B') && !daLam('vet_' + lan))
      add({ loai: 'vet_' + lan, ai: 'sale', uuTien: 2, ten: 'Bán: tư vấn lộ trình (lần ' + lan + ', ngày ' + moc + ' sau chung kết)', han: cd.chungKet + (moc - 1) * D + 21 * 3600e3, tin: 'vet' });
  }
  return v;
}
/* Tab "Đăng ký học thử": mã gia đình và số điện thoại → lúc đăng ký đầu tiên */
function qtHocThu_(ss) {
  const sh = ss.getSheetByName('Đăng ký học thử'), byCode = {}, bySo = {};
  if (!sh || sh.getLastRow() < 2) return { byCode: byCode, bySo: bySo };
  sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues().forEach(r => {
    const t = qtMs_(r[0]), code = String(r[1] || '').trim(), k = qtKeySo_(r[4]);
    if (code && (!byCode[code] || t < byCode[code])) byCode[code] = t;
    if (k && (!bySo[k] || t < bySo[k])) bySo[k] = t;
  });
  return { byCode: byCode, bySo: bySo };
}

/* ===================== dữ liệu cho trang ===================== */
function qtTaiDuLieu_(s) {
  const ss = s.ss, cd = qtCaiDat_(ss), tm = qtTinMau_(ss), now = Date.now(), dk = qtNguonDangKy_(ss);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let rows, sk, nk;
  try {
    const sh = qtTab_(ss, 'Gia đình', GD_HEAD);
    sh.getRange(1, QT_C['Số Zalo'] + 1, sh.getMaxRows(), 1).setNumberFormat('@');
    if (!sh.getRange(1, COT_MO_KHOA).getValue()) sh.getRange(1, COT_MO_KHOA, 1, 2).setValues([['Mở khóa 21 ngày', 'Mở khóa lúc']]);
    const n = sh.getLastRow();
    rows = n > 1 ? sh.getRange(2, 1, n - 1, GD_HEAD.length).getValues() : [];
    rows.forEach(r => { r[QT_C['Số Zalo']] = normPhone_(r[QT_C['Số Zalo']]) || String(r[QT_C['Số Zalo']]).replace(/^'/, ''); });
    let thieuMa = false;
    rows.forEach(r => { if (!String(r[QT_C['Mã gia đình']]).trim()) { r[QT_C['Mã gia đình']] = qtMaMoi_(); thieuMa = true; } });
    const nOld = rows.length;
    let changed = qtDongBo_(rows, dk, qtLichSuSua_(ss)) || thieuMa;
    sk = qtSuKien_(ss); nk = qtNhatKy_(ss);
    rows.forEach(r => {
      const e = sk.byVid[String(r[QT_C['Mã người xem']])], c = nk.byFam[String(r[QT_C['Mã gia đình']])] || [];
      const sc = qtCham_(r, e, c), lan = sc.diem >= cd.nong ? 'nóng' : sc.diem >= cd.am ? 'ấm' : 'lạnh';
      if (r[QT_C['Điểm']] !== sc.diem || r[QT_C['Làn']] !== lan) { r[QT_C['Điểm']] = sc.diem; r[QT_C['Làn']] = lan; changed = true; }
      const ev = (e && e.ev) || {};
      if (r[QT_C['Trạng thái']] === 'Đang dùng thử' && (ev.xong3 || ev.bam_dk || ev.kich_hoat || sc.diem >= cd.nong)) {
        r[QT_C['Trạng thái']] = 'Mời đăng ký'; r[QT_C['Đổi trạng thái lúc']] = new Date(); changed = true;
      }
    });
    if (changed) {
      if (nOld) sh.getRange(2, 1, nOld, GD_HEAD.length).setValues(rows.slice(0, nOld));
      if (rows.length > nOld) {
        /* Trang khác (máy chủ web học, trang quản trị cũ) có thể vừa thêm dòng: đọc lại số đang có, chỉ thêm số chưa có, thêm vào cuối */
        const last = sh.getLastRow(), co = {};
        if (last > 1) sh.getRange(2, QT_C['Số Zalo'] + 1, last - 1, 1).getValues().forEach(v => { const k = qtKeySo_(v[0]); if (k) co[k] = 1; });
        const them = rows.slice(nOld).filter(r => { const k = qtKeySo_(r[QT_C['Số Zalo']]); if (!k || co[k]) return false; co[k] = 1; return true; });
        if (them.length) sh.getRange(last + 1, 1, them.length, GD_HEAD.length).setValues(them);
        rows = rows.slice(0, nOld).concat(them);
      }
      if (rows.length) sh.getRange(2, QT_C['Điểm'] + 1, rows.length, 1).setNumberFormat('0');
      if (rows.length) sh.getRange(2, COT_MO_KHOA, rows.length, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
      CacheService.getScriptCache().remove('mo-khoa-v1');
    }
  } finally { lock.releaseLock(); }

  const me = s.me, cap = qtCap_(me.vaiTro), laQL = cap === 'ql', xemHet = laQL || cap === 'cv', ht = qtHocThu_(ss);
  const theAll = qtThe_(ss), h21 = qtHoc21_(ss), capOf = {};
  s.doi.ds.forEach(t => { if (t.ten) capOf[t.ten] = qtCap_(t.vaiTro); });
  const coCtv = s.doi.ds.some(t => t.hoatDong && t.hash && qtCap_(t.vaiTro) === 'ctv');
  const all = rows.map(r => {
    const e = sk.byVid[String(r[QT_C['Mã người xem']])], code = String(r[QT_C['Mã gia đình']]), c = nk.byFam[code] || [];
    const sc = qtCham_(r, e, c);
    const f = { code: code, taoLuc: qtMs_(r[QT_C['Tạo lúc']]), nguon: String(r[QT_C['Nguồn']]), ref: String(r[QT_C['Mã CTV']] || 'TU_NHIEN'),
      phuHuynh: String(r[QT_C['Tên ba/mẹ']]), zalo: normPhone_(r[QT_C['Số Zalo']]) || String(r[QT_C['Số Zalo']]).replace(/^'/, ''),
      tenCon: String(r[QT_C['Tên con']]), tuoi: String(r[QT_C['Tuổi']] || (e && e.age) || ''), khoa: qtKhoa_(r[QT_C['Khoá']] || (e && e.g)),
      dyHoc: yes_(r[QT_C['ĐY học tập']]), dyTuVan: yes_(r[QT_C['ĐY tư vấn']]), dyUuDai: yes_(r[QT_C['ĐY tin ưu đãi']]),
      trangThai: String(r[QT_C['Trạng thái']] || 'Đang dùng thử'), doiTrangThaiLuc: qtMs_(r[QT_C['Đổi trạng thái lúc']]),
      nguoiHoTro: String(r[QT_C['Người hỗ trợ']] || ''), lienHeDau: qtMs_(r[QT_C['Liên hệ đầu']]), lienHeGanNhat: qtMs_(r[QT_C['Liên hệ gần nhất']]),
      henGoiLai: qtMs_(r[QT_C['Hẹn gọi lại']]), lyDo: String(r[QT_C['Lý do dừng']] || ''), ghiChu: String(r[QT_C['Ghi chú']] || ''),
      moKhoa: yes_(r[QT_C['Mở khóa 21 ngày']]), moKhoaLuc: r[QT_C['Mở khóa lúc']] instanceof Date ? r[QT_C['Mở khóa lúc']].getTime() : String(r[QT_C['Mở khóa lúc']] || ''),
      diem: sc.diem, chiTietDiem: sc.chiTiet, lan: sc.diem >= cd.nong ? 'nóng' : sc.diem >= cd.am ? 'ấm' : 'lạnh',
      hoc: e ? { soBuoi: e.ev.xong3 ? 3 : e.ev.xong2 ? 2 : e.ev.xong1 ? 1 : 0, noi: e.noi, ngay: Object.keys(e.days).length, khoa: e.khoa,
        bamDk: !!e.ev.bam_dk, cuoi: e.last, log: e.log, tXong2: e.tEv.xong2 || e.tEv.xong3 || 0, tKichHoat: e.tEv.kich_hoat || 0 } : null,
      lienHe: c.slice().sort((a, b) => b.t - a.t).slice(0, 20) };
    const tHt = ht.byCode[code] || ht.bySo[qtKeySo_(r[QT_C['Số Zalo']])];
    f.hocThu = tHt ? { t: tHt } : null;
    const th = theAll[code];
    f.the = th ? QT_THE_KEY.slice(1).concat(QT_OFFER_KEY).reduce((o, k) => (o[k] = th[k], o), { luc: th.luc, ai: th.ai, oLuc: th.oLuc }) : null;
    f.theDu = qtTheDu_(f.the);
    f.h21 = f.moKhoa ? qtHoc21Gd_(f, h21) : null;
    f._cd = cd; f.nhom = qtNhom_(f, c, now); delete f._cd;
    f.viec = qtViec_(f, cd, now).concat(qtViec21_(f, c, cd, now, capOf));
    const tuoi = qtTuoi_(f.tuoi);              // ngoài độ tuổi: không đưa vào luồng chốt, việc của sale chuyển cho CTV (trừ việc tiền, hẹn gọi lại)
    if (tuoi && (tuoi < 5 || tuoi > 10)) f.viec.forEach(x => { if (x.ai === 'sale' && x.loai !== 'mo' && x.loai !== 'goi_lai') x.ai = 'ctv'; });
    return f;
  });
  const gan = 7 * 864e5;
  const fams = xemHet ? all
    : cap === 'ctv' ? all.filter(f => f.viec.some(x => x.ai === 'ctv') || f.lienHe.some(x => x.ai === me.ten && now - x.t < gan))
      .map(f => Object.assign({}, f, { viec: f.viec.filter(x => x.ai === 'ctv'), chiTietDiem: [] }))
    : all.filter(f => f.nguoiHoTro === me.ten).map(f => Object.assign({}, f, { viec: f.viec.filter(x => x.ai === 'sale') }));
  const cdOut = Object.assign({}, cd);
  const out = { ok: true, me: qtNguoi_(me), laQL: laQL, cap: cap, xemHet: xemHet, coCtv: coCtv, vaiTroDs: QT_VAI_TRO,
    team: s.doi.ds.filter(t => QT_VAI_TRO.indexOf(t.vaiTro) >= 0 && t.hoatDong).map(t => ({ ten: t.ten, vaiTro: t.vaiTro, cap: qtCap_(t.vaiTro), nhan: t.nhan })),
    caiDat: cdOut, tinMau: tm, trangThai: QT_TRANG_THAI, lyDo: QT_LY_DO, ketQua: QT_KET_QUA, now: now, gd: fams };
  if (laQL) out.bc = qtBaoCao_(ss, all, sk, nk, dk, cd, now);
  return out;
}

/* ===================== báo cáo cho Quản lý ===================== */
function qtBaoCao_(ss, fams, sk, nk, dk, cd, now) {
  const homNay = qtNgay_(now), diem = qtDiem_(ss);
  /* ----- dòng thời gian theo ngày ----- */
  const ngay = {}, D = k => ngay[k] || (ngay[k] = { mo: {}, hoc: {}, xong1: {}, zalo: 0, dangKy: {}, moKhoa: 0, buoi: 0, beHoc: {} });
  sk.all.forEach(a => { const k = qtNgay_(a.t), o = D(k); if (a.ev === 'mo') o.mo[a.vid] = 1; if (a.ev === 'hoc') o.hoc[a.vid] = 1; if (a.ev === 'xong1') o.xong1[a.vid] = 1; });
  fams.forEach(f => {
    if (f.nguon === 'Web học thử' && f.taoLuc) D(qtNgay_(f.taoLuc)).zalo++;
    if (f.moKhoa && typeof f.moKhoaLuc === 'number' && f.moKhoaLuc) D(qtNgay_(f.moKhoaLuc)).moKhoa++;
  });
  const dkMoi = dk.filter(d => d.nguon === 'Đăng ký Web');
  dkMoi.forEach(d => { if (d.t) D(qtNgay_(d.t)).dangKy[d.phone] = 1; });
  diem.forEach(x => { if (x.diem > 0 && x.t) { const o = D(qtNgay_(x.t)); o.buoi++; o.beHoc[x.kid] = 1; } });
  const keys = Object.keys(ngay).sort();
  const dau = keys.length ? keys[0] : homNay, ds = [];
  for (let t = new Date(dau + 'T12:00:00+07:00').getTime(), i = 0; i < 90; i++, t += 86400e3) {
    const k = qtNgay_(t); if (k > homNay) break;
    const o = ngay[k] || D(k), cnt = x => Object.keys(x).length;
    ds.push({ ngay: k, mo: cnt(o.mo), hoc: cnt(o.hoc), xong1: cnt(o.xong1), zalo: o.zalo, dangKy: cnt(o.dangKy), moKhoa: o.moKhoa, buoi: o.buoi, beHoc: cnt(o.beHoc) });
  }

  /* ----- phễu ----- */
  const step = ['mo', 'hoc', 'xong1', 'zalo', 'xong3', 'bam_dk'], by = {}, tot = {};
  step.forEach(s => tot[s] = {});
  sk.all.forEach(a => { const ref = a.ref || 'TU_NHIEN', b = by[ref] || (by[ref] = {}); step.forEach(s => b[s] = b[s] || {});
    if (step.indexOf(a.ev) >= 0) { b[a.ev][a.vid] = 1; tot[a.ev][a.vid] = 1; } });
  const dkRef = {}, dpRef = {}; let dkTot = 0, dpTot = 0;
  fams.forEach(f => { const b = qtBuoc_(f.trangThai), ref = f.ref || 'TU_NHIEN';
    const daDk = b >= 2 || (f.nguon !== 'Web học thử' && f.trangThai !== 'Dừng'), daPhi = b >= 3;
    if (daDk) { dkRef[ref] = (dkRef[ref] || 0) + 1; dkTot++; } if (daPhi) { dpRef[ref] = (dpRef[ref] || 0) + 1; dpTot++; } });
  const cnt = o => Object.keys(o || {}).length;
  const refs = Object.keys(Object.assign({}, by, dkRef)).sort();
  const kenh = refs.map(r => { const b = by[r] || {}; return { ref: r, mo: cnt(b.mo), hoc: cnt(b.hoc), xong1: cnt(b.xong1), zalo: cnt(b.zalo), xong3: cnt(b.xong3), bamDk: cnt(b.bam_dk), dangKy: dkRef[r] || 0, daPhi: dpRef[r] || 0 }; });

  /* ----- học tập 21 ngày (tab Diem) ----- */
  const be = {};
  diem.forEach(x => { if (x.diem <= 0) return; const b = be[x.kid] || (be[x.kid] = { kid: x.kid, ten: x.ten, g: x.g, ngay: {}, diem: 0, cuoi: 0, xa: 0 });
    b.ngay[x.day] = 1; b.diem += x.diem; b.cuoi = Math.max(b.cuoi, x.t); b.xa = Math.max(b.xa, x.day); b.ten = x.ten || b.ten; b.g = x.g || b.g; });
  const dsBe = Object.keys(be).map(k => { const b = be[k]; return { kid: b.kid, ten: b.ten, khoa: qtKhoa_(b.g), buoi: Object.keys(b.ngay).length, diem: b.diem, cuoi: b.cuoi, xa: b.xa }; });
  const theoNgayHoc = { 'Little Seed': [], 'Canopy': [] };
  for (let i = 1; i <= 21; i++) { theoNgayHoc['Little Seed'].push(0); theoNgayHoc['Canopy'].push(0); }
  Object.keys(be).forEach(k => { const g = qtKhoa_(be[k].g); if (!theoNgayHoc[g]) return; Object.keys(be[k].ngay).forEach(d => { if (d >= 1 && d <= 21) theoNgayHoc[g][d - 1]++; }); });
  const phanBo = [['1–3 buổi', 1, 3], ['4–7 buổi', 4, 7], ['8–14 buổi', 8, 14], ['15–21 buổi', 15, 21]].map(x => ({ nhom: x[0],
    seed: dsBe.filter(b => b.khoa === 'Little Seed' && b.buoi >= x[1] && b.buoi <= x[2]).length,
    canopy: dsBe.filter(b => b.khoa === 'Canopy' && b.buoi >= x[1] && b.buoi <= x[2]).length }));
  const nghi = dsBe.filter(b => b.buoi < 21 && b.cuoi && now - b.cuoi >= 2 * 86400e3).sort((a, b) => a.cuoi - b.cuoi).slice(0, 60);
  const hoatDongHomNay = dsBe.filter(b => qtNgay_(b.cuoi) === homNay).length;
  let taiKhoanHoc = 0; const td = ss.getSheetByName('TienDo'); if (td) taiKhoanHoc = Math.max(0, td.getLastRow() - 1);

  /* ----- đăng ký: theo khoá, kênh biết đến, tuổi ----- */
  const dem = (arr, f) => { const o = {}; arr.forEach(x => { const k = f(x); if (k) o[k] = (o[k] || 0) + 1; }); return Object.keys(o).map(k => ({ k: k, n: o[k] })).sort((a, b) => b.n - a.n); };
  const dkKhoa = dem(dkMoi, d => d.khoa || 'Chưa chọn'), dkBiet = dem(dkMoi, d => d.biet || 'Không ghi'), dkTuoi = dem(dkMoi, d => { const a = qtTuoi_(d.age); return a ? a + ' tuổi' : 'Không ghi'; });

  /* ----- đội ----- */
  const nguoi = {};
  fams.forEach(f => { const k = f.nguoiHoTro || '(chưa giao)', o = nguoi[k] || (nguoi[k] = { ten: k, gd: 0, viec: 0, phi: 0, goi: 0, phut: [] });
    o.gd++; o.viec += f.viec.length; if (qtBuoc_(f.trangThai) >= 3) o.phi++;
    if (f.nguon === 'Web học thử' && f.lienHeDau && f.taoLuc) o.phut.push((f.lienHeDau - f.taoLuc) / 60000); });
  nk.all.forEach(c => { if (!c.ai || c.kq === 'Ghi chú nội bộ') return; const o = nguoi[c.ai] || (nguoi[c.ai] = { ten: c.ai, gd: 0, viec: 0, phi: 0, goi: 0, phut: [] }); o.goi++; });
  const trungVi = a => { if (!a.length) return null; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const doiNgu = Object.keys(nguoi).map(k => { const o = nguoi[k]; return { ten: o.ten, gd: o.gd, viec: o.viec, phi: o.phi, goi: o.goi, phut: trungVi(o.phut) }; })
    .sort((a, b) => b.gd - a.gd);
  const nhanh = fams.filter(f => f.nguon === 'Web học thử' && f.lienHeDau).map(f => (f.lienHeDau - f.taoLuc) / 60000);
  const theoTT = {}; fams.forEach(f => theoTT[f.trangThai] = (theoTT[f.trangThai] || 0) + 1);
  const theoLan = { 'nóng': 0, 'ấm': 0, 'lạnh': 0 }; fams.filter(f => qtBuoc_(f.trangThai) >= 0 && qtBuoc_(f.trangThai) < 2).forEach(f => theoLan[f.lan]++);
  const lyDo = dem(fams.filter(f => f.lyDo), f => f.lyDo.split(':')[0]);

  let doiQua = { cho: 0, tong: 0 };
  try { const q = ss.getSheetByName('DoiQua'); if (q && q.getLastRow() > 1) { const v = q.getRange(2, 15, q.getLastRow() - 1, 1).getValues();
    doiQua = { tong: v.length, cho: v.filter(r => String(r[0] || 'cho') === 'cho').length }; } } catch (e) { doiQua = { cho: null, tong: null }; }

  return {
    homNay: homNay, ngay: ds,
    tong: { gd: fams.length, dangKy: dkTot, daPhi: dpTot, doanhThu: dpTot * cd.phiSo, dangHoc: fams.filter(f => f.moKhoa).length,
      maySo: cnt(tot.mo), beHocThu: cnt(tot.hoc), zalo: fams.filter(f => f.nguon === 'Web học thử').length,
      beHoc21: dsBe.length, hoatDongHomNay: hoatDongHomNay, taiKhoanHoc: taiKhoanHoc, buoiHoc: diem.filter(x => x.diem > 0).length },
    pheu: { buoc: ['Mở link', 'Bé bắt đầu học', 'Xong buổi 1', 'Để lại Zalo', 'Xong 3 buổi', 'Bấm đăng ký', 'Đã đăng ký', 'Đã đóng phí'],
      so: step.map(s => cnt(tot[s])).concat([dkTot, dpTot]) },
    kenh: kenh,
    hoc: { theoNgayHoc: theoNgayHoc, phanBo: phanBo, nghi: nghi, top: dsBe.slice().sort((a, b) => b.buoi - a.buoi || b.diem - a.diem).slice(0, 10) },
    dangKy: { khoa: dkKhoa, biet: dkBiet, tuoi: dkTuoi, tong: dkMoi.length },
    doi: doiNgu, phutGoiDau: trungVi(nhanh), trong1Gio: nhanh.length ? Math.round(100 * nhanh.filter(m => m <= 60).length / nhanh.length) : null, soDaGoi: nhanh.length,
    theoTT: theoTT, theoLan: theoLan, lyDo: lyDo, doiQua: doiQua,
    chuaGiao: fams.filter(f => !f.nguoiHoTro && ['Dừng', 'Học viên khóa dài'].indexOf(f.trangThai) < 0).length
  };
}

/* ===================== ghi liên hệ / đổi trạng thái ===================== */
function qtNhatKySheet_(ss) {
  const nk = ss.getSheetByName('Nhật ký cuộc gọi') || qtTab_(ss, 'Nhật ký cuộc gọi', QT_NK_HEAD);
  if (!nk.getRange(1, 16).getValue()) nk.getRange(1, 16, 1, 2).setValues([['Mã gia đình', 'Kết quả']]);
  if (!nk.getRange(1, 18).getValue()) nk.getRange(1, 18).setValue('Việc');
  return nk;
}
function qtTimGd_(s, code) {
  const sh = qtTab_(s.ss, 'Gia đình', GD_HEAD), n = sh.getLastRow();
  const codes = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])) : [];
  const i = codes.indexOf(String(code)); if (i < 0) throw new Error('Không tìm thấy gia đình ' + code + '.');
  const rg = sh.getRange(i + 2, 1, 1, GD_HEAD.length), r = rg.getValues()[0];
  if (qtCap_(s.me.vaiTro) === 'sale' && String(r[QT_C['Người hỗ trợ']]) !== s.me.ten) throw new Error('Gia đình này đang giao cho ' + (r[QT_C['Người hỗ trợ']] || 'người khác') + '.');
  return { sh: sh, i: i, rg: rg, r: r };
}
function qtGhiLienHe_(s, p) {
  const cap = qtCap_(s.me.vaiTro), laQL = cap === 'ql' || cap === 'cv';
  if (!p.code) throw new Error('Thiếu mã gia đình.');
  if (cap === 'ctv') { p.trangThai = ''; p.lyDo = ''; p.khoa = ''; p.nguoiHoTro = null; }   // CTV chỉ ghi kết quả và ghi chú
  if (QT_KQ_CAN_GHI_CHU.indexOf(p.ketQua) >= 0 && !String(p.ghiChu || '').trim()) throw new Error('Ghi rõ nội dung khi chọn "' + p.ketQua + '".');
  if (p.ketQua === 'Cố vấn trả lời' && !laQL) throw new Error('Chỉ Cố vấn hoặc Quản lý ghi được "Cố vấn trả lời".');
  const viec = /^[a-z0-9_]{2,24}$/.test(String(p.viec || '')) ? String(p.viec) : '';
  if (p.trangThai && QT_TRANG_THAI.indexOf(p.trangThai) < 0) throw new Error('Trạng thái không hợp lệ.');
  if ((p.trangThai === 'Dừng' || p.trangThai === 'Nuôi dưỡng') && !p.lyDo) throw new Error('Chọn lý do khi chuyển sang ' + p.trangThai + '.');
  if (p.ketQua && QT_KET_QUA.indexOf(p.ketQua) < 0) throw new Error('Kết quả không hợp lệ.');
  if (p.lyDo && QT_LY_DO.indexOf(p.lyDo) < 0) throw new Error('Lý do không hợp lệ.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const g = qtTimGd_(s, p.code), r = g.r;
    g.sh.getRange(1, QT_C['Số Zalo'] + 1, g.sh.getMaxRows(), 1).setNumberFormat('@');
    const now = new Date(), lienHe = QT_KQ_LIEN_HE.indexOf(p.ketQua) >= 0;
    if (lienHe) { if (!r[QT_C['Liên hệ đầu']]) r[QT_C['Liên hệ đầu']] = now; r[QT_C['Liên hệ gần nhất']] = now; }
    r[QT_C['Hẹn gọi lại']] = p.henGoiLai ? new Date(+p.henGoiLai) : (lienHe ? '' : r[QT_C['Hẹn gọi lại']]);
    if (p.trangThai && p.trangThai !== r[QT_C['Trạng thái']]) { r[QT_C['Trạng thái']] = p.trangThai; r[QT_C['Đổi trạng thái lúc']] = now; }
    if (p.lyDo) r[QT_C['Lý do dừng']] = p.lyDo + (p.lyDoThem ? ': ' + String(p.lyDoThem).slice(0, 200) : '');
    if (p.lyDo === 'Rút đồng ý') { r[QT_C['ĐY tư vấn']] = false; r[QT_C['ĐY tin ưu đãi']] = false; }
    if (laQL && p.nguoiHoTro != null) r[QT_C['Người hỗ trợ']] = String(p.nguoiHoTro).slice(0, 40);
    if (p.khoa) r[QT_C['Khoá']] = p.khoa === 'Canopy' ? 'Canopy' : 'Little Seed';
    r[QT_C['Số Zalo']] = normPhone_(r[QT_C['Số Zalo']]) || String(r[QT_C['Số Zalo']]);
    g.rg.setValues([r]);
    if (p.ketQua || p.ghiChu || p.trangThai) {
      const nk = qtNhatKySheet_(s.ss);
      nk.appendRow([now, s.me.ten, r[QT_C['Tên ba/mẹ']], '', r[QT_C['Tên con']], r[QT_C['Tuổi']], '', '', '', r[QT_C['Khoá']],
        r[QT_C['Trạng thái']], p.henGoiLai ? new Date(+p.henGoiLai) : '', '', '', String(p.ghiChu || '').slice(0, 500) + (p.lyDo ? ' [Lý do: ' + r[QT_C['Lý do dừng']] + ']' : ''),
        r[QT_C['Mã gia đình']], p.ketQua || (p.trangThai ? 'Đổi trạng thái' : 'Ghi chú nội bộ'), viec]);
      nk.getRange(nk.getLastRow(), 4).setNumberFormat('@').setValue(normPhone_(r[QT_C['Số Zalo']]) || '');
    }
  } finally { lock.releaseLock(); }
  return qtTaiDuLieu_(s);
}
function qtMoKhoa_(s, code, on) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const g = qtTimGd_(s, code), r = g.r, now = new Date();
    if (qtCap_(s.me.vaiTro) === 'ctv' && !(on && String(r[QT_C['Trạng thái']]) === 'Đang học 21 ngày'))
      throw new Error('CTV chỉ mở khóa cho gia đình đã ghi nhận đóng phí (trạng thái "Đang học 21 ngày"). Kiểm tra chuyển khoản là việc của sale.');
    r[QT_C['Mở khóa 21 ngày']] = !!on;
    r[QT_C['Mở khóa lúc']] = on ? now : 'Khóa ' + Utilities.formatDate(now, QT_TZ, 'dd/MM HH:mm') + ' · ' + s.me.ten;
    if (on && qtBuoc_(String(r[QT_C['Trạng thái']])) < qtBuoc_('Đang học 21 ngày')) { r[QT_C['Trạng thái']] = 'Đang học 21 ngày'; r[QT_C['Đổi trạng thái lúc']] = now; }
    r[QT_C['Số Zalo']] = normPhone_(r[QT_C['Số Zalo']]) || String(r[QT_C['Số Zalo']]);
    g.sh.getRange(1, QT_C['Số Zalo'] + 1, g.sh.getMaxRows(), 1).setNumberFormat('@');
    g.rg.setValues([r]);
    g.sh.getRange(g.i + 2, COT_MO_KHOA).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build()).setValue(!!on);
    qtNhatKySheet_(s.ss).appendRow([now, s.me.ten, r[QT_C['Tên ba/mẹ']], '', r[QT_C['Tên con']], r[QT_C['Tuổi']], '', '', '', r[QT_C['Khoá']], r[QT_C['Trạng thái']], '', '', '',
      on ? 'Mở khóa 21 ngày' : 'Khóa 21 ngày', r[QT_C['Mã gia đình']], 'Ghi chú nội bộ']);
    CacheService.getScriptCache().remove('mo-khoa-v1');      // web học thấy ngay, không đợi 60 giây
  } finally { lock.releaseLock(); }
  return qtTaiDuLieu_(s);
}
function qtGhiMoHoSo_(s, code) {
  try { qtTab_(s.ss, 'Nhật ký mở hồ sơ', ['Lúc', 'Ai', 'Tên đăng nhập', 'Mã gia đình']).appendRow([new Date(), s.me.ten, s.me.user, String(code).slice(0, 12)]); } catch (e) { }
}

/* ===================== tạo tài khoản · gộp/xoá dòng trùng ===================== */
function qtMaMoi_() { return 'GD' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase(); }
function qtGdRows_(ss) {
  const sh = qtTab_(ss, 'Gia đình', GD_HEAD), n = sh.getLastRow();
  return { sh: sh, rows: n > 1 ? sh.getRange(2, 1, n - 1, GD_HEAD.length).getValues() : [] };
}
/* Tạo tài khoản cho gia đình đăng ký ngoài web (gọi điện, chuyển khoản thẳng…). Tài khoản = tên con + số điện thoại. */
function qtTaoGd_(s, p) {
  const laQL = s.me.vaiTro === 'Quản lý';
  const phone = normPhone_(p.zalo), parent = String(p.phuHuynh || '').trim().slice(0, 60), kid = String(p.tenCon || '').trim().slice(0, 60);
  if (!kid) throw new Error('Nhập tên con.');
  if (!phone) throw new Error('Số điện thoại (10 số) hoặc Gmail chưa đúng.');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let code;
  try {
    const g = qtGdRows_(s.ss), k = qtKeySo_(phone);
    const trung = g.rows.find(r => qtKeySo_(r[QT_C['Số Zalo']]) === k);
    if (trung) return { ok: false, err: 'Số ' + phone + ' đã có tài khoản: ' + (trung[QT_C['Tên ba/mẹ']] || '') + ' – bé ' + (trung[QT_C['Tên con']] || '') + '.', code: String(trung[QT_C['Mã gia đình']]) };
    const now = new Date(), mo = !!p.moKhoa, r = GD_HEAD.map(() => '');
    code = qtMaMoi_();
    r[QT_C['Mã gia đình']] = code; r[QT_C['Tạo lúc']] = now; r[QT_C['Nguồn']] = 'Tạo trên trang quản trị';
    r[QT_C['Mã CTV']] = String(p.ref || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'TU_NHIEN';
    r[QT_C['Tên ba/mẹ']] = parent; r[QT_C['Số Zalo']] = phone; r[QT_C['Tên con']] = kid;
    r[QT_C['Tuổi']] = String(p.tuoi || '').slice(0, 8); r[QT_C['Khoá']] = p.khoa === 'Canopy' ? 'Canopy' : p.khoa === 'Little Seed' ? 'Little Seed' : '';
    r[QT_C['ĐY học tập']] = true; r[QT_C['ĐY tư vấn']] = true; r[QT_C['ĐY tin ưu đãi']] = false;
    r[QT_C['Trạng thái']] = mo ? 'Đang học 21 ngày' : 'Chờ đóng phí'; r[QT_C['Đổi trạng thái lúc']] = now;
    r[QT_C['Người hỗ trợ']] = laQL ? String(p.nguoiHoTro == null ? s.me.ten : p.nguoiHoTro).slice(0, 40) : s.me.ten;
    r[QT_C['Liên hệ gần nhất']] = now; r[QT_C['Ghi chú']] = 'Tạo tài khoản bởi ' + s.me.ten;
    r[QT_C['Mở khóa 21 ngày']] = mo; r[QT_C['Mở khóa lúc']] = mo ? now : '';
    const row = g.sh.getLastRow() + 1;
    g.sh.getRange(row, QT_C['Số Zalo'] + 1).setNumberFormat('@');
    g.sh.getRange(row, 1, 1, GD_HEAD.length).setValues([r]);
    g.sh.getRange(row, COT_MO_KHOA).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build()).setValue(mo);
    qtNhatKySheet_(s.ss).appendRow([now, s.me.ten, parent, '', kid, r[QT_C['Tuổi']], '', '', '', r[QT_C['Khoá']], r[QT_C['Trạng thái']], '', '', '',
      'Tạo tài khoản' + (mo ? ' (mở khóa 21 ngày)' : ''), code, 'Ghi chú nội bộ']);
    qtNhatKySheet_(s.ss).getRange(qtNhatKySheet_(s.ss).getLastRow(), 4).setNumberFormat('@').setValue(phone);
    CacheService.getScriptCache().remove('mo-khoa-v1');
  } finally { lock.releaseLock(); }
  return Object.assign(qtTaiDuLieu_(s), { moi: code });
}
/* Dòng nên giữ trong một nhóm trùng: đã mở khóa > trạng thái xa nhất > có tiến độ học thử > số hợp lệ > tạo sớm nhất */
function qtDiemGiu_(r) {
  const b = qtBuoc_(String(r[QT_C['Trạng thái']]));
  return (yes_(r[QT_C['Mở khóa 21 ngày']]) ? 1e6 : 0) + (b < 0 ? 0 : b) * 1e4 + (r[QT_C['Mã người xem']] ? 1e3 : 0)
    + (normPhone_(r[QT_C['Số Zalo']]) ? 100 : 0) + (r[QT_C['Người hỗ trợ']] ? 10 : 0);
}
function qtChonGiu_(rows) {
  return rows.slice().sort((a, b) => qtDiemGiu_(b) - qtDiemGiu_(a) || qtMs_(a[QT_C['Tạo lúc']]) - qtMs_(b[QT_C['Tạo lúc']]))[0];
}
/* Gộp dòng x vào dòng giữ g: không mất mở khóa, trạng thái, tên các con, ghi chú, lịch liên hệ */
function qtGop_(g, x) {
  const C = QT_C, empty = v => v === '' || v == null;
  GD_HEAD.forEach((h, j) => { if (empty(g[j]) && !empty(x[j])) g[j] = x[j]; });
  if (!normPhone_(g[C['Số Zalo']]) && normPhone_(x[C['Số Zalo']])) g[C['Số Zalo']] = normPhone_(x[C['Số Zalo']]);
  g[C['Số Zalo']] = normPhone_(g[C['Số Zalo']]) || String(g[C['Số Zalo']]);
  const ten = String(g[C['Tên con']] || '').split(',').map(t => t.trim()).filter(Boolean);
  String(x[C['Tên con']] || '').split(',').map(t => t.trim()).filter(Boolean)
    .forEach(t => { if (!ten.some(u => u.toLowerCase() === t.toLowerCase())) ten.push(t); });
  g[C['Tên con']] = ten.join(', ');
  if (yes_(x[C['Mở khóa 21 ngày']]) && !yes_(g[C['Mở khóa 21 ngày']])) { g[C['Mở khóa 21 ngày']] = true; g[C['Mở khóa lúc']] = x[C['Mở khóa lúc']] || new Date(); }
  const bg = qtBuoc_(String(g[C['Trạng thái']])), bx = qtBuoc_(String(x[C['Trạng thái']]));
  if (bx > bg && bg >= 0) { g[C['Trạng thái']] = x[C['Trạng thái']]; g[C['Đổi trạng thái lúc']] = x[C['Đổi trạng thái lúc']]; }
  const ms = j => qtMs_(x[j]), mg = j => qtMs_(g[j]);
  if (ms(C['Tạo lúc']) && (!mg(C['Tạo lúc']) || ms(C['Tạo lúc']) < mg(C['Tạo lúc']))) g[C['Tạo lúc']] = x[C['Tạo lúc']];
  if (ms(C['Liên hệ đầu']) && (!mg(C['Liên hệ đầu']) || ms(C['Liên hệ đầu']) < mg(C['Liên hệ đầu']))) g[C['Liên hệ đầu']] = x[C['Liên hệ đầu']];
  if (ms(C['Liên hệ gần nhất']) > mg(C['Liên hệ gần nhất'])) g[C['Liên hệ gần nhất']] = x[C['Liên hệ gần nhất']];
  const gc = String(g[C['Ghi chú']] || ''), xc = String(x[C['Ghi chú']] || '');
  if (xc && gc.indexOf(xc) < 0) g[C['Ghi chú']] = (gc ? gc + ' | ' : '') + xc;
  return g;
}
/* Xóa các dòng (đã gộp) khỏi tab Gia đình: lưu bản sao vào "Gia đình đã xoá", chuyển nhật ký cuộc gọi sang mã giữ lại */
function qtXoaDong_(s, sh, rows, xoa, giu) {
  const now = new Date(), arch = qtTab_(s.ss, 'Gia đình đã xoá', GD_HEAD.concat(['Xoá lúc', 'Người xoá', 'Gộp vào']));
  const ds = Object.keys(xoa).map(Number).sort((a, b) => b - a);
  arch.getRange(arch.getLastRow() + 1, 1, ds.length, GD_HEAD.length + 3)
    .setValues(ds.map(i => rows[i].concat([now, s.me.ten, xoa[i]])));
  Object.keys(giu).forEach(i => {
    sh.getRange(+i + 2, QT_C['Số Zalo'] + 1).setNumberFormat('@');
    sh.getRange(+i + 2, 1, 1, GD_HEAD.length).setValues([giu[i]]);
    sh.getRange(+i + 2, COT_MO_KHOA).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
  });
  ds.forEach(i => sh.deleteRow(i + 2));
  const map = {}; ds.forEach(i => map[String(rows[i][QT_C['Mã gia đình']])] = xoa[i]);
  const nk = qtNhatKySheet_(s.ss), n = nk.getLastRow();
  if (n > 1) {
    const rg = nk.getRange(2, 16, n - 1, 1), v = rg.getValues(); let doi = false;
    v.forEach(r => { if (map[String(r[0])]) { r[0] = map[String(r[0])]; doi = true; } });
    if (doi) rg.setValues(v);
  }
  CacheService.getScriptCache().remove('mo-khoa-v1');
}
function qtChiQL_(s) { if (s.me.vaiTro !== 'Quản lý') throw new Error('Chỉ Quản lý được xoá hoặc gộp dòng trùng.'); }
/* Xoá một dòng trùng: gộp vào dòng tốt nhất còn lại cùng số điện thoại */
function qtXoaTrung_(s, code) {
  qtChiQL_(s);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const g = qtGdRows_(s.ss), rows = g.rows;
    const i = rows.findIndex(r => String(r[QT_C['Mã gia đình']]) === String(code));
    if (i < 0) throw new Error('Không tìm thấy gia đình ' + code + '. Bấm Tải lại.');
    const k = qtKeySo_(rows[i][QT_C['Số Zalo']]);
    const khac = k ? rows.map((r, j) => j).filter(j => j !== i && qtKeySo_(rows[j][QT_C['Số Zalo']]) === k) : [];
    if (!khac.length) throw new Error('Gia đình này không còn dòng nào trùng số, nên không xoá.');
    const giuRow = qtChonGiu_(khac.map(j => rows[j])), gi = rows.indexOf(giuRow);
    qtGop_(giuRow, rows[i]);
    const xoa = {}; xoa[i] = String(giuRow[QT_C['Mã gia đình']]);
    const giu = {}; giu[gi] = giuRow;
    qtXoaDong_(s, g.sh, rows, xoa, giu);
  } finally { lock.releaseLock(); }
  return qtTaiDuLieu_(s);
}
/* Gộp tất cả nhóm trùng số: mỗi nhóm giữ một dòng */
function qtGopTrung_(s) {
  qtChiQL_(s);
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let soXoa = 0;
  try {
    const g = qtGdRows_(s.ss), rows = g.rows, nhom = {};
    rows.forEach((r, i) => { const k = qtKeySo_(r[QT_C['Số Zalo']]); if (k) (nhom[k] = nhom[k] || []).push(i); });
    const xoa = {}, giu = {};
    Object.keys(nhom).forEach(k => {
      const ids = nhom[k]; if (ids.length < 2) return;
      const giuRow = qtChonGiu_(ids.map(j => rows[j])), gi = rows.indexOf(giuRow);
      ids.forEach(j => { if (j !== gi) { qtGop_(giuRow, rows[j]); xoa[j] = String(giuRow[QT_C['Mã gia đình']]); } });
      giu[gi] = giuRow;
    });
    soXoa = Object.keys(xoa).length;
    if (soXoa) qtXoaDong_(s, g.sh, rows, xoa, giu);
  } finally { lock.releaseLock(); }
  return Object.assign(qtTaiDuLieu_(s), { soXoa: soXoa });
}

/* ===================== sửa thông tin gia đình trên trang quản trị =====================
 * Dữ liệu gốc vẫn nằm trên Sheet để đối chiếu: các tab đơn đăng ký giữ nguyên; mỗi lần sửa ghi một dòng
 * (giá trị cũ → mới) vào tab "Lịch sử sửa". Đồng bộ đơn đăng ký đọc tab này để không tạo lại dòng theo số cũ
 * và không ghép lại tên con cũ vào tên đã sửa. */
const QT_SUA_HEAD = ['Lúc', 'Người sửa', 'Mã gia đình', 'Thông tin', 'Giá trị cũ', 'Giá trị mới'];
const QT_SUA_COT = { phuHuynh: 'Tên ba/mẹ', zalo: 'Số Zalo', tenCon: 'Tên con', tuoi: 'Tuổi', khoa: 'Khoá', ref: 'Mã CTV' };
function qtLichSuSua_(ss) {
  const out = { soCu: {}, tenCon: {} }, sh = ss.getSheetByName('Lịch sử sửa');
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues().forEach(r => {
    const code = String(r[2]);
    if (r[3] === 'Số Zalo') { const k = qtKeySo_(r[4]); if (k) out.soCu[k] = code; }
    if (r[3] === 'Tên con') out.tenCon[code] = 1;
  });
  return out;
}
function qtSuaGd_(s, code, p) {
  if (qtCap_(s.me.vaiTro) === 'ctv') throw new Error('CTV không sửa thông tin gia đình. Ghi chú lại rồi chuyển sale phụ trách.');
  const moi = {};
  if (p.phuHuynh != null) moi.phuHuynh = String(p.phuHuynh).trim().slice(0, 60);
  if (p.tenCon != null) { moi.tenCon = String(p.tenCon).trim().slice(0, 80); if (!moi.tenCon) throw new Error('Tên con không được để trống.'); }
  if (p.tuoi != null) moi.tuoi = String(p.tuoi).trim().slice(0, 8);
  if (p.khoa != null) moi.khoa = p.khoa === 'Canopy' ? 'Canopy' : p.khoa === 'Little Seed' ? 'Little Seed' : '';
  if (p.ref != null) moi.ref = String(p.ref).trim().toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'TU_NHIEN';
  if (p.zalo != null) { moi.zalo = normPhone_(p.zalo); if (!moi.zalo) throw new Error('Số điện thoại (10 số) hoặc Gmail chưa đúng.'); }
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  let soSua = 0;
  try {
    const g = qtTimGd_(s, code), r = g.r, now = new Date(), log = [];
    if (moi.zalo) {
      const k = qtKeySo_(moi.zalo), n = g.sh.getLastRow();
      const ds = g.sh.getRange(2, 1, n - 1, GD_HEAD.length).getValues();
      const khac = ds.find((x, j) => j !== g.i && qtKeySo_(x[QT_C['Số Zalo']]) === k);
      if (khac) return { ok: false, err: 'Số ' + moi.zalo + ' đang là của ' + (khac[QT_C['Tên ba/mẹ']] || '') + ' – bé ' + (khac[QT_C['Tên con']] || '') + '. Nếu là cùng một gia đình, hãy dùng Xoá dòng trùng để gộp.', code: String(khac[QT_C['Mã gia đình']]) };
    }
    Object.keys(moi).forEach(f => {
      const col = QT_SUA_COT[f], cu = String(r[QT_C[col]] == null ? '' : r[QT_C[col]]).replace(/^'/, '');
      const cuSo = f === 'zalo' ? (normPhone_(cu) || cu) : cu;
      if (cuSo === moi[f]) return;
      log.push([now, s.me.ten, String(code), col, cu, moi[f]]); r[QT_C[col]] = moi[f];
    });
    soSua = log.length;
    if (log.length) {
    r[QT_C['Số Zalo']] = normPhone_(r[QT_C['Số Zalo']]) || String(r[QT_C['Số Zalo']]);
    g.sh.getRange(g.i + 2, QT_C['Số Zalo'] + 1).setNumberFormat('@');
    g.rg.setValues([r]);
    const ls = qtTab_(s.ss, 'Lịch sử sửa', QT_SUA_HEAD), at = ls.getLastRow() + 1;
    ls.getRange(at, 5, log.length, 2).setNumberFormat('@');
    ls.getRange(at, 1, log.length, 6).setValues(log);
    qtNhatKySheet_(s.ss).appendRow([now, s.me.ten, r[QT_C['Tên ba/mẹ']], '', r[QT_C['Tên con']], r[QT_C['Tuổi']], '', '', '', r[QT_C['Khoá']], r[QT_C['Trạng thái']], '', '', '',
      'Sửa thông tin: ' + log.map(x => x[3] + ' "' + x[4] + '" → "' + x[5] + '"').join('; '), String(code), 'Ghi chú nội bộ']);
    CacheService.getScriptCache().remove('mo-khoa-v1');
    }
  } finally { lock.releaseLock(); }
  return Object.assign(qtTaiDuLieu_(s), { soSua: soSua });
}
