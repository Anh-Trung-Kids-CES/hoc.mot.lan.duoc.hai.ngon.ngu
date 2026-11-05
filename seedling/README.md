# Seedling 48 buổi · web 99 ngày (lớp offline)

Web tự học cho lớp Seedling offline 48 buổi của Anh – Trung – Kids (CES Việt Nam). Chỉ dùng cho lớp này, không phải bản chuẩn cho các khoá khác. Không sửa web 21 ngày (`xem-truoc/`) hay web Zoom (`lop-zoom/`); chỉ dùng chung bộ nhận diện khuôn mặt ở `lop-zoom/vendor/mediapipe`.

## Nguồn nội dung
- `Seedling_KhungChuongTrinh_48buoi_v6.xlsx` (05/11/2026): tab Khung 48 buổi, Mạch từ theo ngày, Bước ngày web, Vai buổi I-R-P-P, Truyện unit, Hộp ôn & sao.
- Ngày web 1, 2, 3, 8 giữ bản demo Unit 1 đã duyệt (tranh cảnh Unit 1, giọng thu sẵn), thêm bước Vận động.
- 95 ngày còn lại sinh tự động: `cong-cu/parse.py` đọc Excel (đã xuất JSON), `cong-cu/build.py` dựng `seedling-data.js`. Đừng sửa tay `seedling-data.js`; sửa Excel rồi dựng lại.

## Cấu trúc
- `index.html` – khung web (thanh nút trái, giống web 21 ngày).
- `seedling-app.js` – lõi: giọng đọc, thu giọng, các dạng bài Thẻ nền, Thẻ từ mới, Nghe truyện, Chạm đúng tranh, Nói theo, Phiên dịch nhí, Trả lời câu hỏi, Lời lớp học, Mẹo âm, Gọi lại.
- `seedling-bai-moi.js` – dạng bài mới (Nghe – chạm tranh, Vận động, Dạng đề, Nghe – làm theo, Nghe – trả lời YCT口试) và các màn: trang chủ, bản đồ cả khoá (4 chặng), bản đồ từng unit, trang ngày, buổi trên lớp 1–48.
- `seedling-head.js` – chơi bằng đầu ở bước Vận động (camera, xử lý ngay trên máy, không ghi, không gửi). Thử không cần camera: `?headsim=1` (phím ← ↑ →).
- `seedling-on.js` (Hộp ôn), `seedling-thuong.js` (sao, đổi quà, huy hiệu), `seedling-co.js` (Bảng của cô), `seedling-reader.js` (Reader 12 truyện), `seedling-may-chu.js` (nối Google Sheet).
- `tai-nguyen/` – tranh, giọng (chép từ web 21 ngày và bản demo Unit 1).

## Thứ tự một ngày web
Theo tab "Bước ngày web" của v6, thêm bước Vận động ở cuối:
- Ngày Phần: Thẻ nền Little Seed → Thẻ từ mới → Nghe truyện → Chạm đúng tranh (hoặc Nghe – chạm tranh) → Nói theo → Phiên dịch nhí → Mẹo âm → Vận động.
- Ngày Cả truyện / Ôn: Nghe cả truyện → Trả lời câu hỏi → Nói theo / 听后重复 → Dạng đề → Phiên dịch nhí → Mẹo âm → Gọi lại → Vận động.

## Mở ngày
Học xong ngày trước mới mở ngày sau. Cô giáo thêm `?gv=1` vào link để mở hết (máy đó nhớ); `?gv=0` để tắt.

## Còn thiếu
Xem `CAN-BO-SUNG.md`: từ chưa có tranh (đang dùng biểu tượng tạm, cần vẽ theo phong cách 21 ngày) và câu chưa có giọng thu (đang đọc bằng giọng máy của trình duyệt).
