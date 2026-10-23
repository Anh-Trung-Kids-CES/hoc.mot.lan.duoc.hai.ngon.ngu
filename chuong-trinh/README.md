# Anh – Trung – Kids · trang chương trình

Trang riêng cho chương trình song ngữ Anh – Trung 9 khóa của CES Việt Nam. Trang này **độc lập với web Thử thách 21 ngày** (`/xem-truoc/`): không sửa file nào của web 21 ngày, chỉ đọc tranh và giọng đọc ở `../xem-truoc/tai-nguyen/`.

## Có gì
- **Lộ trình 9 khóa** (PreB → Butterfly): tuổi, thời lượng, chuẩn đầu ra, danh sách từ tiếng Anh và tiếng Trung của từng unit theo bảng phân bổ từ vựng (23/10/2026).
- **Bài tự học**: Little Seed Unit 1–3 và Canopy Unit 5–7, mỗi unit 6 bài, dựng lại theo quy tắc lặp mới:
  - Ôn nhanh đầu mỗi bài (3 từ cũ ở Little Seed, 5 từ cũ ở Canopy), con tự nghe, tự chọn trước khi thấy thẻ.
  - Phương án nhiễu luôn có ít nhất một từ của unit trước, không bao giờ là từ chưa học.
  - Hộp ôn riêng của từng con (lưu trên máy): từ chọn sai quay lại ở bài sau, giãn 1 → 2 → 7 → 21 → 42 ngày.
  - Từ của Little Seed quay lại ở Canopy (ví dụ từ gia đình ở Canopy Unit 6).
  - Màn bài học không có chữ tiếng Việt: chỉ hình, biểu tượng, giọng tiếng Anh và tiếng Trung. Little Seed không hiện chữ.
- Thêm `?thu=1` vào link để tranh đúng nhấp nháy gần như ngay (thầy cô chạy thử nhanh).

## Cấu trúc
- `index.html`, `app.css`, `app.js` (trang lộ trình, khóa, unit, Hộp ôn, hướng dẫn), `bai.js` (trình phát bài).
- `data/chuong-trinh.json`: khóa, unit, từ của unit, kho tranh/giọng dùng trong bài, truyện.
- `data/bai/<khóa>-u<n>.json`: 6 bài của một unit.
- `cong-cu/`: script đã dùng để sinh dữ liệu (đọc dữ liệu web 21 ngày và bảng phân bổ từ vựng).
