# Máy chủ Cuộc thi mùa 3 – cách bật (làm 1 lần, khoảng 10 phút)

Web mùa 3 (`cuoc-thi-mua-3/`) và trang quản trị mùa 3 (`cuoc-thi-mua-3/quan-tri/`) dùng **máy chủ và Sheet riêng**, không đụng vào máy chủ, Sheet "Anh-Trung-Kids – Dữ liệu dự án" của trang chính.
Hai tệp trong thư mục này là bản sao `apps-script/Code.gs` và `apps-script/QuanTri.gs` (bản 20/11/2026), chỉ khác:
- `DATA_ID` trỏ tới Sheet mùa 3 (chị dán mã vào).
- `OLD_DATA_ID` để trống: không đọc đơn đăng ký, danh sách đóng tiền của Sheet cũ.
- Thư mục ảnh Zoom có đuôi "– Mùa 3".
- "Link học" mặc định là link web mùa 3.

## 1. Tạo Sheet trống
1. Đăng nhập **anhtrung.home@gmail.com**, mở Google Sheets → **Trống**. Đặt tên: `Cuộc thi mùa 3 – Dữ liệu`.
2. Chép mã Sheet trên thanh địa chỉ: đoạn nằm giữa `/d/` và `/edit`.
3. Chỉ chia sẻ Sheet cho đội (không để "Bất kỳ ai có đường liên kết"), vì Sheet sẽ có tên ba mẹ và số Zalo.

Không cần tạo tab nào: máy chủ tự tạo các tab (TienDo, Diem, Gia đình, Đội, Cài đặt quản trị…) ở lần chạy đầu.

## 2. Tạo dự án Apps Script
1. Vẫn tài khoản anhtrung.home, mở `script.google.com` → **Dự án mới**. Đặt tên: `Cuộc thi mùa 3 – Máy chủ`.
2. Tệp `Code.gs`: xoá code mẫu, dán toàn bộ `apps-script/cuoc-thi-mua-3/Code.gs`.
   Tìm dòng `const DATA_ID = 'DAN_MA_SHEET_MUA_3_VAO_DAY';` và thay `DAN_MA_SHEET_MUA_3_VAO_DAY` bằng mã Sheet ở bước 1.
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

## 5. Sửa ngày và phí cho mùa 3
- Sheet mùa 3, tab **Cài đặt quản trị**: Hạn đăng ký, Khai mạc, Phí, Ngày bắt đầu 21 ngày, Ngày chung kết (đang là số liệu mùa 2).
- `cuoc-thi-mua-3/index.html`: `DEMO_FEE`, `DEMO_HAN`, `DEMO_KHAI_MAC`.
- `cuoc-thi-mua-3/xep-hang.js`: `XH_START` = thứ Hai khai mạc mùa 3 (Xếp hạng tính tuần từ ngày này).

## Cập nhật máy chủ sau này
Sửa `Code.gs`/`QuanTri.gs` trong thư mục này → dán vào dự án "Cuộc thi mùa 3 – Máy chủ" (nhớ giữ `DATA_ID` của mùa 3) → **Triển khai → Quản lý các bản triển khai** → bút chì → **Phiên bản mới** → Triển khai. Link `/exec` giữ nguyên.
Sửa máy chủ của trang chính (`apps-script/Code.gs`) không tự sang mùa 3, và ngược lại.
