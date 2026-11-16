# Bật đăng nhập, theo dõi việc đọc và nhận kết quả (làm 1 lần, khoảng 10 phút)

Máy chủ này lo ba việc: **đăng nhập** (tài khoản quản trị và tài khoản cô mới), **ghi lại cô mới đã mở trang nào, bao lâu**, và **nhận kết quả bài kiểm tra**. Dữ liệu nằm trong Google Sheet **CLB Anh-Trung – Kết quả kiểm tra cô mới** (Drive duyenvth@hanu.edu.vn), tự tạo 3 trang: `GiaoVien`, `TienDo`, `KetQua`.

## A. Bật máy chủ
1. Đăng nhập duyenvth@hanu.edu.vn, mở script.google.com → **Dự án mới**.
2. Xoá code mẫu, dán toàn bộ `Code.gs`, bấm **Lưu**.
3. **Đặt mật khẩu quản trị:** trong `Code.gs` tìm hàm `datMatKhauAdmin`, sửa dòng `MAT_KHAU = 'DOI-DONG-NAY'` thành mật khẩu riêng của bạn (từ 8 ký tự). Chọn hàm `datMatKhauAdmin` ở thanh trên, bấm **Chạy**, cho phép quyền truy cập. Chạy xong **xoá mật khẩu khỏi dòng đó và Lưu lại** (mật khẩu đã được lưu dạng băm trong dự án, không còn cần trong code).
4. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web.** Thực thi với tư cách: **Tôi**. Ai có quyền truy cập: **Bất kỳ ai**. Triển khai, chép **URL ứng dụng web** (đuôi `/exec`).
5. Mở `URL/exec` trên trình duyệt, thấy `{"ok":true,"v":2,...}` là đạt.

## B. Nối vào trang
Mở `clb-anh-trung/index.html`, tìm dòng `const CLB_API="";`, dán URL `/exec` vào giữa hai dấu ngoặc kép, lưu và đẩy lên GitHub. Từ lúc này trang yêu cầu đăng nhập. (Để trống thì trang mở tự do, dùng để xem thử.)

## C. Dùng hằng ngày
- **Quản trị:** vào trang, đăng nhập ID `admin` và mật khẩu ở bước A3. Tab **Quản trị**:
  - Tạo tài khoản cô mới: nhập họ tên, email → hệ thống cấp ID (GV001, GV002…) và mật khẩu ngẫu nhiên, hiện **một lần**, kèm tin nhắn có sẵn để sao chép gửi cô.
  - Bảng theo dõi: mỗi cô đã xem kịch bản bao nhiêu buổi (xem từ 1 phút), trình chiếu, ngữ liệu, thời gian luyện câu lớp và tình huống, lần vào cuối, điểm kiểm tra và nhận định.
  - Đặt lại mật khẩu, khoá hoặc mở lại tài khoản.
- **Cô mới:** đăng nhập bằng ID và mật khẩu HR gửi, đọc kịch bản buổi mình sẽ dạy, dùng trình chiếu, ngữ liệu, luyện câu lớp, tình huống, rồi làm bài kiểm tra. Bài kiểm tra tự lấy tên và email từ tài khoản, kết quả tự lưu.
- **HR** có thể mở Sheet để lọc, ghi chú, điền "đã dạy thử 5 phút" và "quyết định" ở trang `KetQua`.

## Bảo mật và giới hạn (cần biết)
- Mật khẩu cô mới lưu dạng băm có muối; nhập sai 5 lần thì tạm khoá 10 phút. Phiên đăng nhập 14 ngày, khoá tài khoản có hiệu lực ngay.
- **Trang là tệp công khai trên GitHub Pages**: màn hình đăng nhập chặn người dùng thường, nhưng ai biết xem mã nguồn vẫn đọc được nội dung kịch bản và đáp án trắc nghiệm. Nội dung kịch bản không bí mật, còn điểm số thì HR không nên tin tuyệt đối, hãy luôn có buổi dạy thử 5 phút. Nếu cần nội dung thật sự khoá, phải chuyển sang lưu nội dung trong Drive riêng và cấp qua máy chủ (làm thêm được).
- Chỉ chia sẻ Google Sheet cho HR và cô quản lý. Sheet có tên, email và kết quả của cô mới.
- Quên mật khẩu quản trị: chạy lại `datMatKhauAdmin` với mật khẩu mới.
- Cập nhật code: dán đè `Code.gs` → Lưu → Triển khai → Quản lý các bản triển khai → bút chì → Phiên bản mới → Triển khai. Link `/exec` giữ nguyên.
