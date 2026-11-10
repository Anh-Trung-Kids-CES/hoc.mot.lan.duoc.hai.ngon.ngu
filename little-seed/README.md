# Little Seed 48 buổi · web tự học (bản demo Unit 1)

Web tự học cho lớp Little Seed offline 48 buổi của Anh – Trung – Kids (CES Việt Nam): con 4–5 tuổi, chưa học PreB. Chỉ dùng cho lớp này; không sửa web Seedling (`seedling/`), web 21 ngày (`xem-truoc/`) hay web Zoom (`lop-zoom/`).

## Nguồn nội dung
- Khung 48 buổi: `chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json` (dựng bằng `chuong-trinh/cong-cu/khung/ls48/build_ls48.py`, xuất Excel bằng `make_xlsx.py`).
- Unit 1: mạng văn bản trọn (truyện khung Bông's Day 5 phần, bài hát, big book, vè) – `grid/mang/mau_little-seed_u1.json`.
- Tranh và giọng dùng lại của web Seedling (`../seedling/tai-nguyen/`) và web 21 ngày (`../xem-truoc/tai-nguyen/`); cảnh còn thiếu ghép từ nhân vật và nền có sẵn: `tai-nguyen-ls/canh/u1/` (`cong-cu/ghep_canh.py`).
- `little-seed-data.js` sinh tự động bằng `cong-cu/build_ls.py` (chạy ở thư mục gốc repo). Đừng sửa tay.

## Khác web Seedling
- Không hiện chữ cho con (con chưa đọc): chỉ tranh và tiếng. Cô thêm `?gv=1` hoặc ba mẹ bấm "Ba mẹ xem chữ" thì thấy chữ (`ls48.js`, `ls48.css`).
- Mỗi ngày ≤5 bước, mỗi bài 5–10 câu: Thẻ từ → Nghe truyện → Nghe – chạm tranh → Nói theo → Vận động. Ngày cả truyện: Nghe cả truyện → Ai nói? / Nói câu của Bông / Phiên dịch nhí (cô nói mẫu trước) → Gọi lại → Vận động. Không có Mẹo âm, Dạng đề.
- Cô giáo trong truyện là cô Hươu (cô giáo của web 21 ngày Little Seed).
- Tiến độ lưu riêng (khoá `lsd-…`), không lẫn với Seedling trên cùng máy.
- Mã code: `ls-*.js` là bản chép của `seedling-*.js`, đổi đường dẫn tranh/giọng sang `../seedling/tai-nguyen/` và đổi chữ hiển thị.

## Kiểm tra
`python3 little-seed/cong-cu/kiem-tra-choi-het.py 5` chơi tự động mọi bước của các ngày đã dựng (10/11: 41 bước, 0 kẹt, 0 lỗi JavaScript, 0 file giọng lỗi).

## Còn thiếu
- 46 câu tiếng Anh, tiếng Trung chưa có giọng thu sẵn (danh sách `cong-cu/giong_thieu.json`) – web đang đọc bằng giọng máy. Tạo bằng `../seedling/cong-cu/gemini/gen_audio.py` khi có khoá `GEMINI_API_KEY`.
- Ngày 10–99 hiện khoá "sắp có" (theo khung 48 buổi); dựng sau khi chị duyệt hình thức Unit 1.
