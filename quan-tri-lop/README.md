# Trang quản trị lớp offline (cho cô giáo) · Little Seed + Seedling 48 buổi

Link: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/quan-tri-lop/
Xem thử không cần máy chủ: thêm `?demo=1` (PIN 2468, dữ liệu giả lưu trên máy).

Đăng nhập bằng PIN của lớp (tab CaiDat của Google Sheet quản lý). Chọn lớp ở góc trên trái; PIN chỉ nhớ trong tab trình duyệt đang mở.

## Năm mục
| Mục | Làm gì |
|---|---|
| Tổng quan | Sĩ số, số buổi đã dạy, chuyên cần, ai học web trong 3 ngày qua, phiếu quà chờ duyệt; buổi tiếp theo kèm link web dạy; "cần chú ý" (lâu chưa học web, vắng 2 buổi, tham gia thấp, chậm hơn lịch); tiến độ web từng bạn; bản đồ các buổi học (bấm ô để mở buổi) |
| Học sinh | Hồ sơ từng bạn: ngày web, chuyên cần, tham gia, nói EN/ZH, nhật ký từng buổi, ghi chú (tiến bộ, cần hỗ trợ, phụ huynh, nề nếp), đổi tên, đánh dấu nghỉ học, chép link gửi ba mẹ |
| Điểm danh & buổi học | Chọn buổi 0–48, ngày dạy, đã dạy chưa, ghi chú buổi; mỗi bạn: có mặt / muộn / phép / vắng, tham gia, nói EN, nói ZH, bài tập (mức 1–3), ghi chú nhanh; ngày khai giảng của lớp |
| Sao & quà | Thưởng sao (một bạn hoặc cả lớp), huỷ lượt thưởng, duyệt phiếu đổi quà, thêm bạn mới |
| Tài nguyên | Link web dạy (Buổi 0, buổi 1–3, giáo án Seedling 48 buổi, học liệu in), web học của con, Bảng của cô; cộng thêm link riêng cô tự thêm (Drive, Sheet, Zalo…) lưu trong tab TaiNguyen của Sheet |

Mức ghi nhận: 1 cần hỗ trợ · 2 ổn · 3 nổi bật. Bài tập: 1 chưa làm · 2 một phần · 3 đủ.
Vạch "tiến độ theo lịch" trên dashboard tính từ ngày khai giảng và khung 48 buổi (tuần 1–3 mỗi tuần một buổi, từ tuần 4 hai buổi một tuần); chỉ là ước tính.

## Máy chủ
Dùng chung máy chủ Apps Script của hai web học (`apps-script/lop-offline-48/Code.gs`), cần **bản 4** (các lệnh `qt_*`, tab BuoiHS, BuoiLop, GhiChu, TaiNguyen). Cách nâng cấp ở `apps-script/lop-offline-48/HUONG-DAN.md`.
Máy chủ còn bản 3 vẫn mở được trang (xem dashboard, sao, quà); điểm danh, ghi chú và kho tài nguyên cần bản 4.
Trang gọi bằng POST nên PIN không nằm trên đường link. Không ghi họ tên đầy đủ hay liên hệ của con vào trang này; dùng tên gọi ở lớp.

## Cập nhật danh sách buổi
`khung.js` sinh từ khung 48 buổi: `node quan-tri-lop/cong-cu/build_khung.js` ở gốc repo (đọc `chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json` và `seedling/day/day-data.js`). Đổi `?v=` trong `index.html` sau mỗi lần sửa.
Thêm link web dạy của unit mới: sửa hàm `teachLinks` và `builtIn` trong `app.js`.
