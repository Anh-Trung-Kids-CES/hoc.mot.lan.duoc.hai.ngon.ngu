# Little Language Explorers – Web học tập 21 ngày

Web tự học cho Thử thách 21 ngày Bật phản xạ Anh – Trung (CES Vietnam).
2 level: **Little Seed** (bé mới bắt đầu) và **Canopy** (bé có tiếng Anh A1, tiếng Trung YCT 1). Mỗi level 3 vòng, mỗi vòng 6 ngày tự học và 1 buổi học trực tuyến.

## Cấu trúc
- `index.html` – khung web: trang chủ, bản đồ, điểm, Bảng vàng, ngày Zoom
- `ls-data.js`, `ls.js`, `ls.css` – Little Seed: 18 ngày, 6 dạng bài (Xem và làm theo, Chạm đúng hình, Nói theo, Anh hay Trung?, Đố con, Nhìn chữ)
- `canopy-data.js`, `canopy.js`, `canopy-games.js`, `canopy-speak.js`, `canopy.css` – Canopy: 18 ngày, 13 dạng bài
- `xem-them.js` – Góc khám phá thêm (video, game chơi cùng ba mẹ) của từng vòng
- `tai-nguyen/` – hình (nét 2D) và giọng đọc của từng nhân vật; `tai-nguyen/canopy-audio-map.js` nối lời với file giọng Canopy
- `dien-thoai.css` – bố cục điện thoại (cầm dọc: thanh nút dưới đáy, bản đồ kéo ngang; nằm ngang: bài học gọn một màn)
- `.nojekyll` – giúp GitHub Pages phục vụ file nguyên trạng

## Sửa nội dung
- Little Seed: dữ liệu được sinh tự động từ Google Doc "Little Language Explorers – Thiết kế chuyên môn 21 ngày" và `tai-nguyen/*_manifest.json`.
- Canopy: theo Google Doc "Canopy – Logic bài tập tự học 3 vòng × 6 ngày" (bản 20/10/2026).
- Trong `index.html`: `ZALO_LINK`, `ZOOM_LINK`, `SCORE_API` (Bảng vàng Top 10).

## Chế độ giáo viên
Thêm `?gv=1` vào cuối link, hoặc bấm "Chế độ giáo viên" ở cuối trang chủ, để mở tất cả các ngày mà không cần nhập tên.
Tiến độ ở chế độ giáo viên lưu riêng (`lle-progress-gv`), không cộng vào điểm và ngày của bé trên cùng máy, và không gửi lên Bảng vàng.

## Cập nhật 21/10/2026 (sửa theo báo cáo của team tester)
- **Âm thanh**: cắt tiếng "rẹt" ở cuối 68 file giọng đọc (Little Seed 23, Canopy 45); dựng lại file 去公园 (chữ 园 bị đọc hỏng). Truyện Canopy đọc từ một bản thu liền cả truyện (`tai-nguyen/canopy-story-times.js`) nên giọng đều từ đầu đến cuối.
- **Đăng nhập không mật khẩu**: tên con + SĐT hoặc Gmail của bố mẹ. Để học tiếp trên máy khác, cần bật máy chủ Apps Script: làm theo hướng dẫn ở đầu file `apps-script/Code.gs`, rồi dán link vào `SCORE_API` trong `index.html` (cùng link này bật luôn Bảng vàng). Chưa có link thì tiến độ vẫn lưu trên máy đang dùng.
- **Màn "Chạm để bắt đầu"** khi mở web (mở khoá âm thanh) và **hướng dẫn lần đầu** có giọng đọc (nút "Xem hướng dẫn" ở trang chủ để xem lại).
- **Bản đồ khám phá mới**: 3 chặng nối liền, mỗi chặng 6 buổi trên đường uốn lượn, có tên và mô tả chủ đề; buổi Zoom ở cuối chặng, không chặn buổi sau.
- **Góc khám phá**: 2 video gợi ý ngay trên bản đồ và sau khi học xong buổi.
- **Mở buổi học**: cô Hươu tự đọc "Hôm nay con học gì" và lời nhắn cho ba mẹ; nút xanh "Bắt đầu".
- **Luật chơi từng bước** (thẻ có hình + giọng đọc) trước mỗi bước Little Seed và mỗi bài Canopy.
- **Nút ⏸ Dừng / ⏮ Câu trước** trong bài Little Seed.
- **Thu giọng con**: micro tự bật, chấm đỏ "Đang thu", tự dừng khi con nói xong, phát lại giọng con rồi tự sang câu tiếp (Little Seed: Nói theo, Đố con; Canopy: Luyện nói).
- **Nhiệm vụ chia sẻ**: quay clip gửi nhóm Zalo sau mỗi buổi (+10 điểm khi ba mẹ bấm "Đã gửi clip").
- **Canopy**: nút loa nằm trong ô đáp án (trước đây trình duyệt đẩy loa ra ngoài ô).
- **Video Little Seed**: nhãn "Xem bằng tiếng Anh / tiếng Trung"; có link dự phòng khi video Drive không chạy. Muốn video nét và tự phát: nén video thành `.mp4`, đặt vào `tai-nguyen/video/` và khai báo trong `window.LS_VIDEO_LOCAL` (mã Drive → tên file).
- Lời hướng dẫn mới chưa có file thu giọng cô Hươu thì đọc bằng giọng tiếng Việt của máy. Khi thu xong, khai báo trong `window.HD_FILES` ("câu" → "đường dẫn file mp3").

## Cập nhật 22/10/2026 (tối ưu điện thoại)
- **Điện thoại cầm dọc dùng được ngay**, bỏ màn bắt xoay ngang. Thanh nút bên trái chuyển xuống đáy màn hình; trang chủ, buổi học, phòng đổi quà, hành trình xếp dọc và cuộn được.
- **Bản đồ trên điện thoại dọc**: tranh giữ đúng tỉ lệ, con kéo ngang để xem; web tự cuộn tới buổi đang học.
- **Điện thoại nằm ngang**: ẩn tiêu đề buổi khi đang làm bài, thu gọn khung và nút; video, tranh, quiz, thẻ lật, luyện nói xếp hai cột để vừa một màn hình.
- Bản học thử: dải "Đăng ký" nằm ngay trên thanh nút, không che bài.
