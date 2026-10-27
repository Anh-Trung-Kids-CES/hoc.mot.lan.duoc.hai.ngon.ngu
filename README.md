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
