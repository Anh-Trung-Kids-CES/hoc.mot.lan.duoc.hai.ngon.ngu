# Little Seed 48 buổi · web tự học (bản demo Unit 1 và Unit 9)

Web tự học cho lớp Little Seed offline 48 buổi của Anh – Trung – Kids (CES Việt Nam): con 4–5 tuổi, chưa học PreB. Chỉ dùng cho lớp này; không sửa web Seedling (`seedling/`), web 21 ngày (`xem-truoc/`) hay web Zoom (`lop-zoom/`).

## Nguồn nội dung
- Khung 48 buổi: `chuong-trinh/cong-cu/khung/grid/mang/little-seed48.json` (dựng bằng `chuong-trinh/cong-cu/khung/ls48/build_ls48.py`, xuất Excel bằng `make_xlsx.py`).
- Unit 1: mạng văn bản trọn (truyện khung Bông's Day 5 phần, bài hát, big book, vè) – `grid/mang/mau_little-seed_u1.json`.
- Tranh và giọng dùng lại của web Seedling (`../seedling/tai-nguyen/`) và web 21 ngày (`../xem-truoc/tai-nguyen/`); cảnh còn thiếu ghép từ nhân vật và nền có sẵn: `tai-nguyen-ls/canh/u1/` (`cong-cu/ghep_canh.py`).
- `little-seed-data.js` sinh tự động bằng `cong-cu/build_ls.py` (chạy ở thư mục gốc repo). Đừng sửa tay.

## Mạng văn bản trên web (nguyên tắc 23, 25, 27 – sửa 10/11)
- Mỗi ngày Phần: Thẻ từ → Nghe truyện → **Big book và vè** (3 trang big book + 2 câu vè, thay bài Nghe – chạm tranh) → Nói theo → Vận động. Ngày Cả truyện có thêm bước Big book và vè.
- Câu cuối có tên con ("Hello, ___!", "What do you like, ___?"): web thay ___ bằng tên con (P.name), đọc tên bằng giọng máy tiếng Việt (`@ten` trong `ls48.js`).
- Bài hát vận động (T2) chưa có trên web vì chưa có bản thu; lời bài nằm trong `grid/mang/mau_little-seed_u*.json`.
- Unit 9 (ngày 66–73): `grid/mang/mau_little-seed_u9.json`, tranh ghép `tai-nguyen-ls/canh/u9/` (`chuong-trinh/cong-cu/khung/mang_u9/ghep_u9.py`). Đo nguyên tắc: `mang_u9/do_mang.py`.

## Khác web Seedling
- Không hiện chữ cho con (con chưa đọc): chỉ tranh và tiếng. Cô thêm `?gv=1` hoặc ba mẹ bấm "Ba mẹ xem chữ" thì thấy chữ (`ls48.js`, `ls48.css`).
- Mỗi ngày ≤5 bước, mỗi bài 5–10 câu (thứ tự ở mục trên). Ngày cả truyện: Nghe cả truyện → Ai nói? / Nói câu của các bạn / Phiên dịch nhí → Big book và vè → Gọi lại hoặc Vận động. Không có Mẹo âm, Dạng đề.
- Cô giáo trong truyện là cô Hươu (cô giáo của web 21 ngày Little Seed).
- Tiến độ lưu riêng (khoá `lsd-…`), không lẫn với Seedling trên cùng máy, và gửi lên Google Sheet quản lý lớp để con đổi máy không mất bài (máy chủ dùng chung với Seedling: `apps-script/lop-offline-48/`, cách bật ở `HUONG-DAN.md`; link /exec dán vào `SDL_API` trong `ls-may-chu.js`).
- Mã code: `ls-*.js` là bản chép của `seedling-*.js`, đổi đường dẫn tranh/giọng sang `../seedling/tai-nguyen/` và đổi chữ hiển thị.

## Kiểm tra
`python3 little-seed/cong-cu/kiem-tra-choi-het.py 5` chơi tự động mọi bước của các ngày đã dựng (10/11 tối: U1 + U9, 83 bước, 0 kẹt, 0 lỗi JavaScript, 0 file giọng lỗi).

## Còn thiếu
- Khoảng 130 câu tiếng Anh, tiếng Trung (U1 + U9, gồm big book và vè) chưa có giọng thu sẵn (danh sách `cong-cu/giong_thieu.json`) – web đang đọc bằng giọng máy. Tạo bằng `../seedling/cong-cu/gemini/gen_audio.py` khi có khoá `GEMINI_API_KEY`.
- Các ngày ngoài U1, U9 hiện khoá "sắp có" (theo khung 48 buổi); dựng sau khi chị duyệt hình thức Unit 1.

## Nghe reader tuần (13/11/2026)
- `nghe-reader.html`: trang nghe cho mã QR in trên reader (`nghe-reader.html#05` mở track 05). Không gắn vào ngày web (reader chỉ là bản in).
- `tai-nguyen-ls/reader-tuan/`: 26 track mp3 (Anh hết truyện rồi Trung hết truyện, giọng nhân vật cố định), `danh-sach-track.json`, `DANH-SACH-TRACK.md`. Tạo bằng Gemini TTS; mã ở Project Claude `claude/MaNghe_Reader_Lo.md`.
