# Bật nhận kết quả "Kiểm tra cô mới" (làm 1 lần, khoảng 5 phút)

Sheet nhận kết quả: **CLB Anh-Trung – Kết quả kiểm tra cô mới** (Drive duyenvth@hanu.edu.vn). HR chỉ cần mở Sheet này, không cần quyền gì trên GitHub.

1. Đăng nhập duyenvth@hanu.edu.vn, mở script.google.com → **Dự án mới**.
2. Xoá code mẫu, dán toàn bộ `Code.gs`. **Đổi dòng `TOKEN`** thành một chuỗi riêng (ví dụ `clb-2026-xxxxxx`), bấm **Lưu**.
3. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**. Thực thi với tư cách: **Tôi**. Ai có quyền truy cập: **Bất kỳ ai**. Bấm Triển khai, cho phép quyền, chép **URL ứng dụng web** (đuôi `/exec`).
4. Mở `clb-anh-trung/index.html`, tìm hai dòng đầu phần `CẤU HÌNH`:
   `const CLB_API = "…";` dán URL `/exec`; `const CLB_TOKEN = "…";` dán đúng chuỗi TOKEN ở bước 2. Lưu và đẩy lên GitHub.
5. Kiểm tra: mở `URL/exec` trên trình duyệt, thấy `{"ok":true,...}` là đạt. Làm thử một bài kiểm tra, mở Sheet thấy dòng mới.

## Về Sheet
- Mỗi lần nộp là một dòng mới (làm lại thì thêm dòng, không ghi đè).
- Cột M–O để HR tự điền: ghi chú, đã dạy thử 5 phút chưa, quyết định.
- Chỉ chia sẻ Sheet cho HR và cô quản lý, không để "bất kỳ ai có đường liên kết". Sheet có họ tên và email cô mới.
- Cô mới nhập họ tên và email khi làm bài; HR nên đối chiếu với danh sách ứng viên.

## Cập nhật code
Dán đè `Code.gs` (giữ TOKEN) → Lưu → Triển khai → Quản lý các bản triển khai → bút chì → Phiên bản mới → Triển khai. Link `/exec` giữ nguyên.
