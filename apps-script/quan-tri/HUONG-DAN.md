# Bật cổng Zalo và trang quản trị "Việc hôm nay"

Ba việc, làm theo đúng thứ tự, khoảng 20 phút. Web học đã được cập nhật sẵn: cổng Zalo chỉ tự hiện sau khi máy chủ ở bước 2 là bản mới, nên làm chậm cũng không mất số của ba mẹ.

## 1. Khóa Sheet DATA Dự án (làm trước tiên)

Từ nay tab "Gia đình" chứa tên ba mẹ và số Zalo của gia đình đang dùng thử. Sheet hiện đang để "Bất kỳ ai có đường liên kết đều có thể chỉnh sửa", và mã Sheet nằm trong mã nguồn công khai trên GitHub.

Người làm: chủ Sheet (tài khoản anhnguseccaugiay@gmail.com).

1. Mở Sheet DATA Dự án → nút **Chia sẻ**.
2. Thêm làm **Người chỉnh sửa**: duyenvth@hanu.edu.vn (tài khoản chạy máy chủ web học, thiếu là web không ghi được) và email của 4 bạn vận hành.
3. Ở "Quyền truy cập chung", đổi thành **Bị hạn chế**.

## 2. Cập nhật máy chủ của web học

Người làm: tài khoản đã triển khai máy chủ hiện tại (Sheet "Little Language Explorer – Tiến độ & Bảng vàng").

1. Mở Sheet đó → **Tiện ích mở rộng → Apps Script**.
2. Mở tệp `Code.gs`, xóa hết, dán toàn bộ nội dung tệp [`apps-script/Code.gs`](https://github.com/anh-trung-kids-ces/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/Code.gs) (bấm nút "Copy raw file" trên GitHub). Bấm **Lưu**.
3. **Triển khai → Quản lý các bản triển khai** → biểu tượng bút chì → Phiên bản: **Phiên bản mới** → **Triển khai**. Nếu Google hỏi quyền, bấm cho phép. Link /exec giữ nguyên, không phải sửa web.
4. Kiểm tra: mở link /exec của máy chủ, thêm `?action=ping` vào cuối. Thấy `{"ok":true,"v":2}` là xong.

Từ lúc này: ba mẹ học xong buổi 1 trên link /demo/ sẽ thấy cổng Zalo; mỗi gia đình để lại số thành một dòng trong tab **Gia đình**, và tab **Truy cập học thử** bắt đầu có dữ liệu.

## 3. Tạo trang quản trị

Trang quản trị là một dự án Apps Script riêng. Trang chạy bằng tài khoản Google của chính người mở, nên ai không có quyền mở Sheet DATA thì không xem được gì, và không có dữ liệu nào của bé nằm trên GitHub.

Nên tạo bằng tài khoản Gmail cá nhân của cô. Tài khoản trường (hanu.edu.vn) có thể không cho người ngoài trường mở web app; nếu ở bước 6 không có lựa chọn "Bất kỳ ai có Tài khoản Google", hãy đổi sang Gmail cá nhân.

1. Vào [script.google.com](https://script.google.com) → **Dự án mới**. Đặt tên: `Anh-Trung-Kids – Quản trị`.
2. Tệp `Code.gs`: xóa hết, dán nội dung [`apps-script/quan-tri/Code.gs`](https://github.com/anh-trung-kids-ces/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/Code.gs).
3. Bấm **＋ (Tệp) → HTML**, đặt tên đúng là `TrangQuanTri` (không gõ đuôi .html). Xóa hết, dán nội dung [`apps-script/quan-tri/TrangQuanTri.html`](https://github.com/anh-trung-kids-ces/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/TrangQuanTri.html).
4. **Cài đặt dự án** (bánh răng) → tích "Hiển thị tệp kê khai appsscript.json". Quay lại Trình chỉnh sửa, mở `appsscript.json`, dán nội dung [`apps-script/quan-tri/appsscript.json`](https://github.com/anh-trung-kids-ces/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/appsscript.json). Bấm **Lưu**.
5. **Triển khai → Tùy chọn triển khai mới** → biểu tượng bánh răng → **Ứng dụng web**.
6. Chọn: Thực thi với tư cách **Người dùng truy cập ứng dụng web**; Ai có quyền truy cập **Bất kỳ ai có Tài khoản Google**. Bấm **Triển khai**, chép **URL ứng dụng web**.
7. Mở URL đó. Google báo "Google chưa xác minh ứng dụng này" là bình thường với ứng dụng tự làm: bấm **Nâng cao → Đi tới Anh-Trung-Kids – Quản trị → Cho phép**.

Lần mở đầu tiên, trang tự tạo các tab sau trong Sheet DATA và ghi email của cô làm Quản lý:

| Tab | Dùng để |
| --- | --- |
| Đội | Ai được vào trang và vai trò của từng người |
| Gia đình | Mỗi gia đình một dòng, một trạng thái. Trang tự thêm gia đình từ Đăng ký Web, Google Form và Danh sách đóng tiền (khớp theo số điện thoại) |
| Tin mẫu Zalo | Tin nhắn mẫu cho từng loại việc. Sửa thẳng trên Sheet, giữ nguyên các chữ trong ngoặc nhọn như `{ten_con}` |
| Cài đặt quản trị | Hạn đăng ký, ngày khai mạc, link trang ưu đãi, ngưỡng điểm nóng và ấm, giờ làm việc. Sang đợt mới chỉ sửa ở đây |
| Nhật ký mở hồ sơ | Ai mở hồ sơ gia đình nào, lúc nào |

Tab "Nhật ký cuộc gọi" có sẵn được thêm 2 cột: P "Mã gia đình", Q "Kết quả".

## 4. Thêm đội vào tab Đội

Mỗi người một dòng:

| Email | Tên | Vai trò | Nhận gia đình mới |
| --- | --- | --- | --- |
| email Google của bạn đó | Thảo | Vận hành | TRUE |

- **Tên** viết đúng như cột "Người hỗ trợ" đang dùng trong Đăng ký Web và Google Form (Thảo, Thư…), để gia đình cũ hiện đúng người.
- **Vai trò**: `Quản lý` thấy mọi gia đình, số liệu, giao lại người; `Vận hành` chỉ thấy gia đình được giao cho mình.
- **Nhận gia đình mới** = TRUE: gia đình mới để lại Zalo được giao tự động cho bạn đang nhận ít gia đình nhất. Ai nghỉ ca thì đổi thành FALSE.

Gửi URL trang quản trị cho các bạn. Mỗi bạn mở bằng đúng email đã ghi, cho phép quyền một lần như bước 3.7.

## 5. Chạy thử 5 phút

1. Mở link /demo/ trên điện thoại, nhập tên "TEST", chọn tuổi, học xong buổi 1. Cổng Zalo hiện ra; điền tên và một số thật của đội.
2. Mở trang quản trị → **Việc hôm nay**: thấy việc "Gọi chào – vừa để lại Zalo" với gia đình TEST.
3. Bấm **Ghi kết quả** → Trạng thái **Dừng**, Lý do **Khác**, ghi "test" → **Lưu**. Việc biến mất và tab Nhật ký cuộc gọi có thêm một dòng.

## Trang này làm gì, chưa làm gì

**Đã có**
- Việc hôm nay xếp theo độ gấp: gọi lại theo hẹn; gọi chào gia đình vừa để lại Zalo (hạn 1 giờ trong giờ làm việc, ngoài giờ là 9:00 sáng hôm sau); mời đăng ký theo làn nóng, ấm, lạnh (48 giờ trước hạn thì gia đình ấm cũng được gọi); nhắc đóng phí kèm số giờ còn lại; gửi link học chính khi gia đình vừa đóng phí.
- Gia đình chưa đồng ý được tư vấn không bao giờ bị xếp việc mời đăng ký hay nhắc phí.
- Mỗi việc có nút Gọi, mở Zalo, tin mẫu điền sẵn tên ba mẹ, tên con, số buổi, link đăng ký mang mã CTV.
- Hồ sơ gia đình: điểm và lý do từng điểm, các bước học thử của bé, lịch sử liên hệ, đổi trạng thái (Dừng và Nuôi dưỡng bắt buộc chọn lý do), hẹn gọi lại, giao người.
- Số liệu (chỉ Quản lý): phễu 8 bước, phễu theo mã CTV, thời gian từ lúc để lại Zalo đến cuộc gọi đầu, việc của từng người, phiếu đổi quà chờ duyệt.
- Điểm gia đình theo đúng bảng trong tài liệu phễu (Phù hợp 30, Dùng thử 40, Ý định 30). Riêng "Mở Ba mẹ đồng hành" luôn 0 vì web chưa có mục này.

**Chưa có, làm trong 21 ngày học**
- Màn hình giáo viên Zoom và CTV.
- Việc "bé nghỉ 3 ngày", "đã đóng phí nhưng chưa vào học": cần nối tài khoản học chính với mã gia đình.
- Khớp chuyển khoản tự động: hiện vẫn tick tay cột "Đã đóng phí".
- Trang ưu đãi điền sẵn tên con: web đã gửi kèm `fam`, `ten`, `khoa` trên đường link, trang ưu đãi (kho Ceseducation) chưa đọc. Trong lúc chờ, trang quản trị khớp đơn với gia đình theo số điện thoại.
