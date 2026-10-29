# Little Language Explorers – Web học tập 21 ngày

Web tự học cho Thử thách 21 ngày Bật phản xạ Anh – Trung (CES Vietnam).
2 khoá: Little Seed (bé mới bắt đầu) · Canopy (bé khá tiếng Anh, biết chút tiếng Trung). Seedling đang tạm ẩn. Mỗi nhóm 3 vòng, mỗi vòng 6 ngày tự học + 1 buổi Zoom.

## Cấu trúc
- `index.html` – toàn bộ web (nội dung, trò chơi, điểm, Bảng vàng)
- `img/` – ảnh minh hoạ (tuỳ chọn), tên file theo danh sách câu lệnh tạo ảnh
- `.nojekyll` – giúp GitHub Pages phục vụ file nguyên trạng

## Sửa nội dung
Mở `index.html`, tìm phần `PHẦN DỮ LIỆU`:
- `SEED_DAYS`, `CANOPY_DAYS` – nội dung 21 ngày của từng khoá (`SEEDLING_DAYS` giữ lại nhưng không hiện)
- `ZALO_LINK` – nhóm Zalo nộp clip
- `ZOOM_LINK` – link phòng Zoom (để trống thì web nhắc xem trên Zalo)
- `SCORE_API` – link Web App Apps Script để bật Bảng vàng Top 10

## Chế độ giáo viên
Thêm `?gv=1` vào cuối link, hoặc bấm nút "Chế độ giáo viên" ở cuối trang chủ, để mở tất cả các ngày.

## Cập nhật 27/10/2026 (Xếp hạng)
- **Nút "Xếp hạng" 🏆** trên thanh điều hướng (`#/xep-hang`), thay cho Bảng vàng cũ. Mỗi tuần (mỗi chặng) là một giải đấu của từng khoá, tính từ thứ Hai 26/10/2026 (`XH_START` trong `xem-truoc/xep-hang.js`), có đồng hồ đếm ngược đến hết Chủ nhật.
- **Nhóm vinh danh**: 5 bạn nhiều sao nhất tuần (`XH_TOP`). Không có nhóm xuống hạng; bạn ở dưới thấy "còn bao nhiêu sao nữa". Dòng của bé được tô xanh, ghi chữ "Con", luôn dùng điểm mới nhất trên máy.
- Mỗi bạn hiện avatar đã chọn trong Phòng đổi quà (nhân vật, trang phục, nền, khung). Tab Tuần 1/2/3 và Tổng 21 ngày; tuần chưa tới bị khóa.
- Máy chủ: `apps-script/Code.gs` thêm `?action=xephang` (cả bảng tới 50 bạn, kèm avatar, không lộ mã bé), `ping` trả `v:7`. Chưa cập nhật máy chủ thì web vẫn hiện Top 10 từ bản cũ, avatar các bạn khác là nhân vật mặc định.
- **Trang chủ có ô "Xếp hạng tuần"** cạnh "Hành trình của con": ảnh là avatar của con, nhãn chỉ ghi số sao con có trong tuần ("⭐ 142 tuần này"), không ghi hạng, dòng dưới ghi tuần và số ngày còn lại. Trang chủ máy tính nay có 2 ô lớn + 6 ô nhỏ.

## Cập nhật 29/10/2026 (Trang quản trị: Gọi sau 3 buổi)

- Trang quản trị có thêm mục **Báo cáo học tập**: mỗi con đã mở khóa 21 ngày một dòng, kèm tình hình học (chưa vào web, cần kéo nhịp, học đều, học vượt…), số ngày học, bài xong, lượt nói, chi tiết theo 4H và câu khen, câu hỏi thêm cho cuộc gọi.
- Lọc theo người hỗ trợ, tình hình học và cuộc gọi (chưa gọi, đã gọi, đồng ý Zoom, chưa xác nhận Zoom).
- Hai ô tích **Đã gọi** và **Đồng ý Zoom** lưu ở tab "Gọi sau 3 buổi" của Sheet (tự tạo ở lần tích đầu). Mỗi lần tích ghi một dòng vào Nhật ký cuộc gọi.
- Việc hôm nay có thêm việc Sale "Gọi sau 3 buổi" (ngày 4–7 của hành trình), tự đóng khi tích Đã gọi. Tin mẫu `goi_3b` dùng khi gọi không gặp.
- Máy chủ: sửa `apps-script/QuanTri.gs` và `apps-script/Code.gs` (ping trả `v: 12`). Cần dán hai tệp này vào dự án Apps Script của máy chủ web học rồi **Triển khai → Quản lý triển khai → sửa → Phiên bản mới** (giữ nguyên link /exec).
- Máy chủ Apps Script **tự cập nhật** khoảng 10 phút sau khi `apps-script/Code.gs` hoặc `apps-script/QuanTri.gs` trên `main` thay đổi (tệp `TuCapNhat` nằm ngay trong dự án Apps Script, bản gốc `apps-script/TuCapNhat.gs`). Cách kiểm tra và xử lý lỗi: `apps-script/TU-DONG-CAP-NHAT.md`.
