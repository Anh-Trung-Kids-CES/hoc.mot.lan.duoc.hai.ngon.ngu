# Tự động cập nhật máy chủ Apps Script

Dự án **Anh-Trung-Kids – Máy chủ web học** (tài khoản anhtrung.home) có thêm tệp `TuCapNhat` (bản gốc: `apps-script/TuCapNhat.gs`).
Cứ khoảng 10 phút, tệp này đọc tệp thô trên GitHub (raw.githubusercontent.com, không bị giới hạn lượt như api.github.com): nếu `apps-script/Code.gs` hoặc `apps-script/QuanTri.gs` trên nhánh `main` có bản mới, nó tự
chép vào dự án, tạo phiên bản mới và cập nhật đúng bản triển khai đang chạy. Link /exec giữ nguyên.

Không cần máy tính, không cần Node, không cần secret trên GitHub. Kho phải để **công khai** (hiện đang công khai).

## Đã cài (29/10/2026)

1. Bật "Google Apps Script API" ở https://script.google.com/home/usersettings (tài khoản anhtrung.home).
2. Cài đặt dự án → bật "Hiển thị tệp kê khai appsscript.json". Trong `appsscript.json` thêm `oauthScopes`:
   spreadsheets, script.external_request, script.scriptapp, script.projects, script.deployments.
3. Thêm tệp Script tên `TuCapNhat`, dán nội dung `apps-script/TuCapNhat.gs`.
4. Chọn hàm `caiTuCapNhat` → Chạy → Cho phép. Hàm tạo lịch chạy 10 phút và cập nhật ngay lần đầu.

## Kiểm tra / xử lý

- Xem trạng thái: chọn hàm `trangThaiTuCapNhat` → Chạy → Nhật ký thực thi hiện lần cập nhật cuối (phiên bản, mã) và lỗi (nếu có).
- Lịch chạy nằm ở mục ⏰ **Trình kích hoạt** (hàm `tuCapNhat`, mỗi 10 phút).
- **An toàn:** nếu ai đó sửa thẳng `Mã.gs` hoặc `QuanTri.gs` trong trình soạn, lần sau tệp tự cập nhật **dừng, không ghi đè** và ghi lỗi.
  Đưa phần sửa đó lên GitHub, rồi chạy hàm `xoaLoiTuCapNhat`.
- Sửa `TuCapNhat.gs` hoặc thêm phạm vi mới (dùng dịch vụ Google mới như Gmail, Drive) thì phải dán tay vào dự án và sửa `appsscript.json`,
  vì tệp này chỉ chép `Code.gs` và `QuanTri.gs`.
- Muốn tắt: xoá trình kích hoạt `tuCapNhat` trong mục ⏰.
- Trang quản trị cũ (`apps-script/quan-tri/`, dự án Apps Script riêng) không nằm trong việc tự cập nhật này.
