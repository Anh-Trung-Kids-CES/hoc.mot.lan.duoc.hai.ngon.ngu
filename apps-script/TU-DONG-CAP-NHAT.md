# Tự động cập nhật máy chủ Apps Script

Mỗi khi `apps-script/Code.gs` hoặc `apps-script/QuanTri.gs` trên nhánh `main` thay đổi, GitHub tự dán hai tệp này vào dự án
**Anh-Trung-Kids – Máy chủ web học** (tài khoản anhtrung.home) và triển khai phiên bản mới trên đúng bản triển khai đang chạy,
nên link /exec giữ nguyên. Cuối cùng GitHub gọi `?action=ping` để chắc máy chủ đã chạy bản mới.

Việc chạy nằm ở tab **Actions** của kho, tên "Cập nhật máy chủ Apps Script". Muốn chạy tay: Actions → chọn việc này → **Run workflow**.

## Cài một lần (khoảng 10 phút, làm trên máy Mac)

1. **Bật Apps Script API** cho tài khoản anhtrung.home: mở https://script.google.com/home/usersettings bằng tài khoản này, bật "Google Apps Script API".
2. **Đăng nhập clasp** bằng anhtrung.home. Mở Terminal, chạy:
   ```
   npx @google/clasp@2.4.2 login
   ```
   Trình duyệt mở ra: chọn tài khoản **anhtrung.home@gmail.com**, bấm Cho phép. Terminal báo đăng nhập xong thì chạy:
   ```
   cat ~/.clasprc.json | pbcopy
   ```
   (lệnh này chép nội dung đăng nhập vào bộ nhớ tạm, chưa dán vào đâu cả).
3. **Lấy Mã tập lệnh**: mở dự án máy chủ trong Apps Script → ⚙ **Cài đặt dự án** → chép ô **Mã tập lệnh** (Script ID).
4. **Thêm 2 secret vào kho GitHub**: kho `Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu` → **Settings → Secrets and variables → Actions → New repository secret**:
   - Tên `CLASPRC_JSON`, giá trị: dán nội dung đã chép ở bước 2.
   - Tên `SCRIPT_ID`, giá trị: Mã tập lệnh ở bước 3.
5. Vào **Actions** → "Cập nhật máy chủ Apps Script" → **Run workflow** để chạy lần đầu. Xanh là xong.

## An toàn

- Nếu ai đó sửa mã thẳng trong trình soạn Apps Script, GitHub sẽ **dừng, không ghi đè**, và báo lỗi ở Actions. Đưa phần sửa đó lên GitHub trước rồi chạy lại.
- `CLASPRC_JSON` cho phép sửa các dự án Apps Script của anhtrung.home. Chỉ người có quyền quản trị kho mới xem được Secrets; chỉ cho người tin cậy quyền ghi vào kho.
  Muốn thu hồi: https://myaccount.google.com/permissions bằng anhtrung.home → gỡ quyền của "clasp".
- Trang quản trị cũ (`apps-script/quan-tri/`, dự án Apps Script riêng) không nằm trong việc tự cập nhật này.
