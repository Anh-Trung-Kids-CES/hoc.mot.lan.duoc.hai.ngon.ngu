# Trình chiếu tương tác (kiểu Mentimeter), buổi chia sẻ 18/11/2026

- Màn cô (máy chia sẻ Zoom): `co.html`
- Bố mẹ (quét QR hoặc bấm link): `index.html`
- Phòng mặc định: `chiase1811`. Phòng khác: thêm `?phong=tenmoi` vào cả hai link.
- Dữ liệu: Firebase `anh-trung-kids-zoom`, `rooms/<phòng>/` (teacher, state, players, answers). Luật bản 1 của Lớp Zoom dùng được, không cần sửa.
- Máy mở `co.html` đầu tiên trong phòng sẽ là máy cô. Máy khác mở `co.html` cùng phòng chỉ xem, không điều khiển được.

## Phím tắt màn cô
- ← / →: lùi, tiến (câu hỏi xen trước các slide quan trọng)
- O: mở / khoá bình chọn
- R: hiện đáp án (tự khoá bình chọn)
- F: toàn màn hình
- Nút "Tải kết quả (CSV)": từng bố mẹ, từng câu và bảng tổng.

## Sửa câu hỏi
Trong `tc.js`, mảng `TC_POLLS`: `truoc` là số slide mà câu hỏi đứng trước, `dung` là chỉ số đáp án đúng (null là câu khảo sát), `giai` là lời giải hiện khi bấm R.

Ảnh slide ở `anh/s01.jpg … s46.jpg` (xuất từ bộ pptx 46 trang).
