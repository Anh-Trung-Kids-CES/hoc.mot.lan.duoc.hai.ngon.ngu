# Chung kết Rung chuông vàng – Little Language Explorers

Web hai màn theo quy cách Lớp Zoom buổi 2: màn cô (chia sẻ màn chiếu lên Zoom) và máy thứ hai của từng bé. Dữ liệu đồng bộ qua Firebase (dự án `anh-trung-kids-zoom`, luật bảo mật bản 1, không cần sửa), tab Kết quả cập nhật trực tiếp.
Nội dung theo doc "Chung kết Rung chuông vàng – Khung nội dung câu hỏi" (10/11/2026).

## Các link

| Ai dùng | Link |
|---|---|
| Ba mẹ / bé | https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/chung-ket/ |
| Cô (máy tính) | …/chung-ket/co.html |
| Màn chiếu (cô chia sẻ lên Zoom) | nút **🖥 Chia sẻ lên Zoom** trên màn cô, hoặc …/chung-ket/?chieu=MÃ |
| Bảng xếp hạng cho livestream (OBS) | …/chung-ket/?bang=MÃ — top 5 mỗi level, tự cập nhật |
| Thử trên một máy, không cần Firebase | thêm `?mock=1` vào link cô và link bé, mở nhiều tab cùng trình duyệt |

Bé nhập mã phòng ở link Lớp Zoom cũng được: web tự chuyển sang trang chung kết.

## Luật
- Little Seed và Canopy thi chung một phòng; **xếp hạng riêng theo level đăng ký**.
- Mỗi câu 3 bậc (A nghe – chạm tranh; B nghe một tiếng – chọn lời tiếng kia; C đọc chữ). Little Seed bắt đầu A, Canopy bắt đầu B; đúng 2 câu liên tiếp lên bậc, sai 2 câu liên tiếp xuống bậc. Bậc chỉ để vừa sức, **mỗi câu đúng 1 điểm ở mọi bậc**.
- Tổng điểm = Phần 2 (30%, chia 15) + Phần 3 (30%, chia số câu đúng cao nhất buổi thi) + Phần 4 (40%, chia 7). Phần 1 chỉ tích sao. Bằng điểm: xét Phần 4, rồi thời gian nộp Phần 4.
- Giải mỗi level: Quán quân, Á quân, Hạng 3; Phiên dịch nhí (điểm Phần 4 cao nhất ngoài top 3); còn lại Nhà thám hiểm ngôn ngữ.
- 3 KHÔNG: máy bé không báo sai, màn chiếu chỉ hiện đáp án chung và số bạn đã chọn, Rồng Lửa không hiện điểm từng bạn.

## Âm thanh
Phần 1 và lời cô Hươu phát ở màn chiếu. Phần 2–4 mỗi bé nghe câu hỏi trên máy mình (đề theo bậc của từng bé), nên khi các con làm bài cô **tắt tiếng tất cả** trên Zoom.

Lời cô Hươu mới (`CK_LOI` trong `ck-core.js`) đang tạm đọc bằng giọng máy để duyệt; duyệt xong thu bằng Gemini (giọng Sulafat):
1. Chào mừng các con đến với Chung kết Rung chuông vàng!
2. Phần một: cả lớp cùng khởi động nhé!
3. Phần hai: Rung chuông vàng! Con nghe và chọn thật kỹ nhé!
4. Câu cuối cùng: câu chuông vàng!
5. Phần bốn: nghe truyện, xếp tranh! Con nghe thật kỹ nhé!
6. Chúc mừng tất cả các nhà thám hiểm ngôn ngữ!

## Tệp
- `tao-du-lieu.js` → sinh `ck-data.js` từ `xem-truoc/ls-data.js` (tranh, giọng có sẵn của web học). Sửa câu hỏi ở đây rồi chạy `node chung-ket/tao-du-lieu.js`.
- `ck-core.js` – luật bậc, câu Rồng Lửa, tính điểm, xếp hạng.
- `ck-con.js` – màn bé, màn chiếu, bảng xếp hạng. `ck-co.js` – màn cô. `ck.css`.
- Dùng lại của `lop-zoom/`: `lz-core.js` (Firebase, âm thanh, chỗ ngồi), `lz-boss.js` (trận Rồng Lửa), `lz.css`, `co.css`, `vendor/`.

## Dữ liệu Firebase (`rooms/<mã>/`)
- `state`: `lop:'chung-ket'`, `ph` (cho, p1, p2, p3, p4, trao), `i`, `step`, `t0`, `boss {run,t0,dur,end}`, `p4 {run,step,sc}`, `bang`.
- `players/<máy>`: `kid, parent, ava, lv (seed|canopy), on`.
- `answers/p1_<i>`, `p2_<i>` (`c, ok, b`), `boss_<lượt>_<n>` (`ok, b, k, l`), `p4_<lượt>` (`order, pts, b`).
- `marks/<chỗ>/`: `px` (cô bấm hộ Phần 2), `bx` (⚡ +1 Phần 3), `p4` (điểm xếp tranh bé 1 máy), `lv` (cô đổi level).
- Gói Firebase miễn phí cho tối đa 100 máy kết nối cùng lúc: 40 bé + màn cô + màn chiếu + cửa sổ OBS vẫn dư.
