# Phép thuật lời nói – cả khoá (24 unit, 146 phép)

Nguồn sự thật: `spec.py` (bảng phép) + `kichban.py` (bậc 1, câu dài, phép nối, hội thoại) + `fx.py` (hiệu ứng).
- `python3 sinh_du_lieu.py` → `seedling/phep-thuat-du-lieu.js` (đừng sửa tay) và `giong_can_thu.json` (531 câu cần thu giọng, đã bỏ trùng; `same` = id dùng chung file).
- `python3 cat_nen.py` → cắt nền 53 tranh kho thành hình dán `seedling/tai-nguyen/phep-thuat/*.webp`.
- 10 hình mới chưa vẽ (cake_plain, robo, baby, crayon, pencil, balloon_white, angry, excited, fruit, polar_bear) tạm hiện biểu tượng emoji; vẽ xong lưu cùng tên vào thư mục trên.
- Giọng thu: lưu `seedling/tai-nguyen/giong/phep-thuat/<id>.mp3`, thêm id vào `audio` (sinh_du_lieu.py) để máy dùng file thay giọng máy.
- Máy chạy: `seedling/phep-thuat.js` (dùng chung hai khoá, Little Seed tải `../seedling/`).
- Kiểm thử: `kiem-thu/choi.js` (cần `npm i jsdom`; chạy `node choi.js`): dữ liệu, nhận giọng 146 phép × 2 tiếng, phép nối, câu dài, số/màu, 99 ngày × 2 khoá, bắn từng hiệu ứng, một lượt chơi trọn vẹn.
