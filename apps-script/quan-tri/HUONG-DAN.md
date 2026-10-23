# Bật cổng Zalo, đơn đăng ký và trang quản trị trên Sheet "Tiến độ & Bảng vàng"

Từ nay mọi dữ liệu của dự án nằm trong **một Sheet duy nhất**: "Little Language Explorer – Tiến độ & Bảng vàng" (chủ sở hữu duyenvth@hanu.edu.vn). Sheet DATA Dự án cũ không còn nhận dữ liệu mới. Sheet mới bắt đầu trống: gia đình đăng ký trước khi chuyển không được chép sang.

Làm theo đúng thứ tự, khoảng 25 phút. Web học đã cập nhật sẵn: cổng Zalo chỉ tự hiện sau khi máy chủ ở bước 2 là bản mới, nên làm chậm cũng không mất số của ba mẹ.

## 1. Khóa Sheet "Tiến độ & Bảng vàng" (làm trước tiên)

Sheet này đang để **"Bất kỳ ai có đường liên kết đều có thể xem"**. Từ nay nó chứa tên ba mẹ và số Zalo.

1. Mở Sheet → **Chia sẻ**.
2. Kiểm tra đủ người chỉnh sửa: các bạn vận hành đã có sẵn (thuytien01603, nguyenphuongthaohxpt488, thuhoai.azgen, Ducanh.cit). Thêm ai còn thiếu. Ai không cần xem số điện thoại của ba mẹ thì bỏ ra.
3. Ở "Quyền truy cập chung", đổi thành **Bị hạn chế**.

Web học vẫn chạy bình thường sau khi khóa, vì máy chủ ghi vào Sheet bằng quyền của người đã triển khai.

## 2. Cập nhật máy chủ (một máy chủ cho cả web học và trang ưu đãi)

Người làm: tài khoản đã triển khai máy chủ hiện tại của Sheet này.

1. Mở Sheet → **Tiện ích mở rộng → Apps Script**.
2. Mở tệp `Code.gs`, xóa hết, dán toàn bộ nội dung tệp [`apps-script/Code.gs`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/Code.gs) (nút "Copy raw file" trên GitHub). Bấm **Lưu**.
3. **Triển khai → Quản lý các bản triển khai** → biểu tượng bút chì → Phiên bản: **Phiên bản mới** → **Triển khai**. Link /exec giữ nguyên.
4. Kiểm tra: mở link /exec, thêm `?action=ping` vào cuối. Thấy `{"ok":true,"v":3}` là xong.

## 3. Chuyển đơn đăng ký của trang ưu đãi sang Sheet mới

Chỉ làm sau khi bước 2 báo `v:3`; làm trước thì form đăng ký sẽ báo lỗi.

1. Vào kho GitHub **Ceseducation/little-language-explorers**.
2. **Add file → Upload files**, kéo thả tệp `index.html` Claude gửi kèm (thay tệp cũ), bấm **Commit changes**.
3. Đợi 1–2 phút, mở trang ưu đãi, gửi thử một đơn tên "TEST". Đơn hiện ở tab **Đăng ký Web** của Sheet "Tiến độ & Bảng vàng".

Bản mới chỉ đổi 3 chỗ: đơn gửi về máy chủ ở bước 2; mang theo mã gia đình khi ba mẹ đi từ web học sang; điền sẵn tên con và đội.

Đội tick ô **Đã đóng phí** (cột O tab Đăng ký Web) khi tiền về, như trước.

## 4. Tạo trang quản trị

Trang quản trị là một dự án Apps Script riêng, chạy bằng tài khoản Google của chính người mở. Ai không có quyền mở Sheet "Tiến độ & Bảng vàng" thì không xem được gì.

1. Vào [script.google.com](https://script.google.com) → **Dự án mới**. Đặt tên `Anh-Trung-Kids – Quản trị`.
2. Tệp `Code.gs`: xóa hết, dán [`apps-script/quan-tri/Code.gs`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/Code.gs).
3. **＋ → HTML**, đặt tên đúng là `TrangQuanTri` (không gõ đuôi). Dán [`apps-script/quan-tri/TrangQuanTri.html`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/TrangQuanTri.html).
4. **Cài đặt dự án** (bánh răng) → tích "Hiển thị tệp kê khai appsscript.json". Mở `appsscript.json`, dán [`apps-script/quan-tri/appsscript.json`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/appsscript.json). **Lưu**.
5. **Triển khai → Tùy chọn triển khai mới** → **Ứng dụng web**. Thực thi với tư cách **Người dùng truy cập ứng dụng web**; Ai có quyền truy cập **Bất kỳ ai có Tài khoản Google**. **Triển khai**, chép URL.
   Nếu không thấy lựa chọn "Bất kỳ ai có Tài khoản Google" (tài khoản trường có thể chặn), tạo dự án ở bước 1 bằng Gmail cá nhân của cô; Gmail đó cần quyền chỉnh sửa Sheet.
6. Mở URL. Google báo "Google chưa xác minh ứng dụng này" là bình thường với ứng dụng tự làm: **Nâng cao → Đi tới Anh-Trung-Kids – Quản trị → Cho phép**.

Lần mở đầu tiên, trang tự tạo trong Sheet các tab: **Đội** (email của cô là Quản lý), **Gia đình**, **Tin mẫu Zalo**, **Cài đặt quản trị**, **Nhật ký mở hồ sơ**. Tab **Nhật ký cuộc gọi** tạo ở lần đầu ghi kết quả.

## 5. Thêm đội vào tab Đội

| Email | Tên | Vai trò | Nhận gia đình mới |
| --- | --- | --- | --- |
| email Google của bạn đó | Thảo | Vận hành | TRUE |

- **Email** phải trùng email có quyền chỉnh sửa Sheet ở bước 1.
- **Vai trò**: `Quản lý` thấy mọi gia đình, số liệu, giao lại người; `Vận hành` chỉ thấy gia đình được giao cho mình.
- **Nhận gia đình mới** = TRUE: gia đình mới để lại Zalo được giao tự động cho bạn đang nhận ít gia đình nhất. Ai nghỉ ca thì đổi thành FALSE.
- Gia đình đăng ký thẳng trên trang ưu đãi chưa có người hỗ trợ: cô giao trong hồ sơ gia đình, hoặc điền tên vào cột **Người hỗ trợ** (cột M) tab Đăng ký Web.

Gửi URL trang quản trị cho các bạn; mỗi bạn mở bằng đúng email đã ghi và cho phép quyền một lần như bước 4.6.

## 6. Chạy thử 5 phút

1. Mở link /demo/ trên điện thoại, nhập tên "TEST", chọn tuổi, học xong buổi 1, điền cổng Zalo bằng một số của đội.
2. Trang quản trị → **Việc hôm nay**: có việc "Gọi chào – vừa để lại Zalo".
3. Trên bảng mời của web học, bấm "Đăng ký cho con": trang ưu đãi điền sẵn tên "TEST". Gửi đơn. Tải lại trang quản trị: gia đình TEST chuyển sang **Chờ đóng phí**.
4. Bấm **Ghi kết quả** → Trạng thái **Dừng**, Lý do **Khác**, ghi "test" → **Lưu**.
5. Xóa các dòng TEST trong tab Gia đình, Đăng ký Web và Nhật ký cuộc gọi.

## Trang này làm gì, chưa làm gì

**Đã có**
- Việc hôm nay xếp theo độ gấp: gọi lại theo hẹn; gọi chào gia đình vừa để lại Zalo (hạn 1 giờ trong giờ làm việc, ngoài giờ là 9:00 sáng hôm sau); mời đăng ký theo làn nóng, ấm, lạnh (48 giờ trước hạn thì gia đình ấm cũng được gọi); nhắc đóng phí kèm số giờ còn lại; gửi link học chính khi gia đình vừa đóng phí.
- Gia đình chưa đồng ý được tư vấn không bao giờ bị xếp việc mời đăng ký hay nhắc phí.
- Mỗi việc có nút Gọi, mở Zalo, tin mẫu điền sẵn tên ba mẹ, tên con, số buổi, link đăng ký mang mã CTV và mã gia đình.
- Hồ sơ gia đình: điểm và lý do từng điểm, các bước học thử của bé, lịch sử liên hệ, đổi trạng thái (Dừng và Nuôi dưỡng bắt buộc chọn lý do), hẹn gọi lại, giao người.
- Số liệu (chỉ Quản lý): phễu 8 bước, phễu theo mã CTV, thời gian từ lúc để lại Zalo đến cuộc gọi đầu, việc của từng người, phiếu đổi quà chờ duyệt.
- Đơn trên trang ưu đãi tự gộp vào gia đình đã học thử: khớp theo mã gia đình, nếu không có thì theo số điện thoại.

**Chưa có, làm trong 21 ngày học**
- Màn hình giáo viên Zoom và CTV.
- Việc "bé nghỉ 3 ngày", "đã đóng phí nhưng chưa vào học": cần nối tài khoản học chính với mã gia đình.
- Khớp chuyển khoản tự động: vẫn tick tay ô "Đã đóng phí".
- Tab "Thống kê CTV" cũ ở Sheet DATA không chuyển sang; số liệu theo CTV nay xem ở màn hình Số liệu.
