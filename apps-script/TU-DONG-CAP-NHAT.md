# Cập nhật máy chủ Apps Script

Máy chủ **Anh-Trung-Kids – Máy chủ web học** (tài khoản anhtrung.home) **không tự cập nhật** từ GitHub. Sau khi sửa `apps-script/Code.gs`
hoặc `apps-script/QuanTri.gs`, phải dán vào dự án và triển khai (khoảng 2 phút):

1. Mở dự án bằng anhtrung.home → dán `Code.gs` vào **Mã.gs**, `QuanTri.gs` vào **QuanTri.gs** → Lưu.
2. **Triển khai → Quản lý tùy chọn triển khai** → bấm bút chì → Phiên bản: **Phiên bản mới** → **Triển khai**. Link /exec giữ nguyên.
3. Kiểm tra: mở `.../exec?action=ping`, số `v` phải đúng số trong `Code.gs`.

## Vì sao không tự động (đã thử 29/10/2026)

- GitHub Actions + clasp: cần Node trên máy và secret đăng nhập Google, quá rắc rối.
- Tệp tự cập nhật nằm trong dự án Apps Script: đọc GitHub được, nhưng bước tự triển khai cần bật "Apps Script API" trong dự án
  Google Cloud của script. Dự án Cloud mặc định không cho bật (báo thiếu quyền). Muốn làm phải chuyển script sang dự án Cloud riêng
  và cài màn hình đồng ý OAuth, nên đã gỡ tệp này ra.
