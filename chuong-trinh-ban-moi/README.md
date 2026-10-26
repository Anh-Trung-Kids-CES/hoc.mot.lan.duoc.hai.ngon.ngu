# Anh – Trung – Kids · bản xem trước "giữ chân học viên"

Bản xem trước của trang `/chuong-trinh/`, làm theo báo cáo "Người đồng hành giữ trẻ học web đều đặn" (26/10/2026). **Trang thật `/chuong-trinh/` không đổi.** Bản này đọc chung dữ liệu ở `../chuong-trinh/data/` và tranh, giọng ở `../xem-truoc/tai-nguyen/`, lưu tiến độ dưới khóa riêng `atk2-` (không lẫn với trang thật).

- Hướng dẫn kiểm tra: mở `#/moi` trên trang. Thêm `?thu=1` để thử nhanh (nhắc nghỉ sau 1 phút, khóa mềm sau 1,5 phút, thuộc từ sau 1 ngày).
- `giu-chan.js`: ngày học, mục tiêu tuần, tạm nghỉ, phiên học (nhắc nghỉ 20 phút, khóa mềm 30 phút), mở bài theo ngày, quy tắc xanh/vàng/đỏ, lớp mẫu, mẫu tin, cổng người lớn.
- `trang-moi.js`: trang Ba mẹ (`#/ba-me`), Thầy cô (`#/lop`), Bộ sưu tập (`#/suu-tap`), Có gì mới (`#/moi`).
- `bai.js`: thêm tạm dừng, lưu chỗ làm dở, màn chào khi quay lại sau ≥7 ngày, chế độ dễ tự động, ghi nhận từ đã thuộc, màn cuối "Goodbye! 再见！" không có nút sang bài kế tiếp (trừ chế độ thầy cô), ăn mừng bất ngờ, 3 tranh "ba mẹ hỏi con".
- `app.js`: thẻ Nhiệm vụ hôm nay ở trang chủ, khóa ngày web chưa đến ngày mở, đánh dấu "Hôm nay".

Khi duyệt: chép các thay đổi sang `/chuong-trinh/` (đổi `DATA` về `data/`, khóa `atk2-` về `atk-`), rồi xóa thư mục này.
