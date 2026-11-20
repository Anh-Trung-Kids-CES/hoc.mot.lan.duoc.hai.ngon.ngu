# Máy chủ Cuộc thi mùa 3 – cách bật (làm 1 lần, khoảng 10 phút)

Web mùa 3 (`cuoc-thi-mua-3/`) và trang quản trị mùa 3 (`cuoc-thi-mua-3/quan-tri/`) dùng **máy chủ và Sheet riêng**, không đụng vào máy chủ, Sheet "Anh-Trung-Kids – Dữ liệu dự án" của trang chính.
Hai tệp trong thư mục này là bản sao `apps-script/Code.gs` và `apps-script/QuanTri.gs` (bản 20/11/2026), chỉ khác:
- `DATA_ID` trỏ tới Sheet mùa 3 (đã điền sẵn).
- `OLD_DATA_ID` để trống: không đọc đơn đăng ký, danh sách đóng tiền của Sheet cũ.
- Thư mục ảnh Zoom có đuôi "– Mùa 3".
- "Link học" mặc định là link web mùa 3.

## 1. Tạo Sheet trống
1. Đã có: https://docs.google.com/spreadsheets/d/1Icr3Kq4J77v4VMmu-CEbCFWQtSxnufAvZ5FEQGsjXH8/edit
2. Tài khoản chạy máy chủ (anhtrung.home) phải có quyền **Chỉnh sửa** Sheet này.
3. Chỉ chia sẻ Sheet cho đội (không để "Bất kỳ ai có đường liên kết"), vì Sheet sẽ có tên ba mẹ và số Zalo.

Không cần tạo tab nào: máy chủ tự tạo các tab (TienDo, Diem, Gia đình, Đội, Cài đặt quản trị…) ở lần chạy đầu.

## 2. Tạo dự án Apps Script
1. Vẫn tài khoản anhtrung.home, mở `script.google.com` → **Dự án mới**. Đặt tên: `Cuộc thi mùa 3 – Máy chủ`.
2. Tệp `Code.gs`: xoá code mẫu, dán toàn bộ `apps-script/cuoc-thi-mua-3/Code.gs` (mã Sheet mùa 3 `1Icr3Kq4J77v4VMmu-CEbCFWQtSxnufAvZ5FEQGsjXH8` đã điền sẵn ở `DATA_ID`).
3. Bấm **＋ → Tập lệnh**, đặt tên `QuanTri`, dán toàn bộ `apps-script/cuoc-thi-mua-3/QuanTri.gs`. Bấm **Lưu**.
4. **Triển khai → Tùy chọn triển khai mới** → loại **Ứng dụng web**. Thực thi với tư cách: **Tôi**. Ai có quyền truy cập: **Bất kỳ ai**.
5. Bấm **Triển khai**, cho phép quyền (Sheets, Drive), chép **URL ứng dụng web** (đuôi `/exec`).
6. Kiểm tra: mở link đó thêm `?action=ping`, thấy `"ok":true` là được.

## 3. Dán link vào hai trang mùa 3
Gửi link `/exec` cho Claude để dán và đẩy lên GitHub, hoặc tự sửa:
- `cuoc-thi-mua-3/index.html`, dòng `const SCORE_API = "";`
- `cuoc-thi-mua-3/quan-tri/index.html`, dòng `const API = "";`

## 4. Tài khoản quản trị đầu tiên
1. Mở trang quản trị mùa 3. Trang báo chưa có tài khoản và hỏi **mã thiết lập**.
2. Mở Sheet mùa 3, tab **Cài đặt quản trị**, dòng **Mã thiết lập tài khoản**, chép mã, nhập trên trang để tạo tài khoản Quản lý.
3. Tài khoản đội (Sale, CTV, Cố vấn) tạo ở mục **Tài khoản** trên trang. Tài khoản mùa 2 không dùng được ở mùa 3.

## 5. Ngày và phí mùa 3 (đã điền 20/11/2026)
- Bắt đầu thứ Hai 30/11/2026, **không có hạn đăng ký**, phí **159.000đ**.
- Tab **Cài đặt quản trị** của Sheet mùa 3 tự tạo với các giá trị này ở lần chạy đầu; muốn đổi thì sửa ngay trong tab.
- Web: `DEMO_FEE`, `DEMO_KHAI_MAC` (`cuoc-thi-mua-3/index.html`), `XH_START` (`cuoc-thi-mua-3/xep-hang.js`).

## Cập nhật máy chủ sau này
Sửa `Code.gs`/`QuanTri.gs` trong thư mục này → dán vào dự án "Cuộc thi mùa 3 – Máy chủ" (nhớ giữ `DATA_ID` của mùa 3) → **Triển khai → Quản lý các bản triển khai** → bút chì → **Phiên bản mới** → Triển khai. Link `/exec` giữ nguyên.
Sửa máy chủ của trang chính (`apps-script/Code.gs`) không tự sang mùa 3, và ngược lại.
