# Little Language Explorers – Web học tập 21 ngày

Web tự học cho Thử thách 21 ngày Bật phản xạ Anh – Trung (CES Vietnam).
2 level: **Little Seed** (bé mới bắt đầu) và **Canopy** (bé có tiếng Anh A1, tiếng Trung YCT 1). Mỗi level 3 vòng, mỗi vòng 6 ngày tự học và 1 buổi học trực tuyến.

## Cấu trúc
- `index.html` – khung web: trang chủ, bản đồ, điểm, Bảng vàng, ngày Zoom
- `ls-data.js`, `ls.js`, `ls.css` – Little Seed: 18 ngày, 6 dạng bài (Xem và làm theo, Chạm đúng hình, Nói theo, Anh hay Trung?, Đố con, Nhìn chữ)
- `canopy-data.js`, `canopy.js`, `canopy-games.js`, `canopy-speak.js`, `canopy.css` – Canopy: 18 ngày, 13 dạng bài
- `xem-them.js` – Góc khám phá thêm (video, game chơi cùng ba mẹ) của từng vòng
- `tai-nguyen/` – hình (nét 2D) và giọng đọc của từng nhân vật; `tai-nguyen/canopy-audio-map.js` nối lời với file giọng Canopy
- `.nojekyll` – giúp GitHub Pages phục vụ file nguyên trạng

## Sửa nội dung
- Little Seed: dữ liệu được sinh tự động từ Google Doc "Little Language Explorers – Thiết kế chuyên môn 21 ngày" và `tai-nguyen/*_manifest.json`.
- Canopy: theo Google Doc "Canopy – Logic bài tập tự học 3 vòng × 6 ngày" (bản 20/10/2026).
- Trong `index.html`: `ZALO_LINK`, `ZOOM_LINK`, `SCORE_API` (Bảng vàng Top 10).

## Chế độ giáo viên
Thêm `?gv=1` vào cuối link, hoặc bấm "Chế độ giáo viên" ở cuối trang chủ, để mở tất cả các ngày mà không cần nhập tên.
