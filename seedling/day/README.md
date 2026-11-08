# Web dạy offline 48 buổi · Seedling

Link: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/seedling/day/

Web cho cô dạy lớp Seedling offline 48 buổi, thay slide. Nội dung lấy từ web học (`../seedling-data.js`), nên từ, câu, truyện, tranh và giọng trên lớp khớp đúng các ngày web trước buổi.

## Mỗi buổi có
- **Giáo án**: 7 khối 90 phút theo vai I-R-P-P (Introduce, Repeat, Practice, Produce; tuần 1–3, ôn, thi có khung riêng), từng hoạt động và trang chiếu tương ứng.
- **Trình chiếu**: trang có tranh và tiếng; nhãn *Chiếu* / *Thẻ* / *Vận động* cho biết lúc nào các con làm bằng đồ dùng, lúc nào nhìn màn. Phím: → ← chuyển, Space hiện đáp án, R phát lại, B tắt chiếu.
  - 📺 Cửa sổ chiếu: mở thêm một cửa sổ (kéo sang TV); cửa sổ này đi theo màn cô qua BroadcastChannel, không hiện ghi chú và danh sách các bé.
  - 👥 Các bé: cô bấm đáp án con giơ (1 2 3, Đ S), ✋, 🎤 EN, 🎤 中, ✏️ bảng con, vắng. Bé chưa có lượt nói từ khối [4] chuyển màu cam.
- **Big Book**: truyện của unit, trang lớn, chạm câu để nghe, đổi English / 中文.
- **Reader**: bản in A5 (A4 ngang gấp đôi).
- **Chant & nhảy**: chant tự soạn Anh – Trung theo giai điệu dân gian hết bản quyền (Frère Jacques, Twinkle, London Bridge, Row Your Boat), mỗi câu có giọng và động tác; nhạc nền ở `nhac/` (tổng hợp bằng `../cong-cu/make_tunes.py`). Video ngoài lấy từ ngày web.
- **Thủ công**: sản phẩm của unit, bước theo buổi, câu thuyết trình, mẫu in.
- **Đồ dùng in**: flashcard lớn gấp đôi, thẻ mini, Bingo, dải câu, thẻ trả lời, rối que, reader, phiếu ghi giấy, phiếu trả lời bài thi.
- **Lớp & báo cáo**: mỗi bé một dòng (có mặt, giơ tay, nói EN, nói ZH, thẻ đúng, bảng con, 4H, ghi chú), tải CSV, chép lời vinh danh cho Zalo.

Danh sách lớp và số liệu lưu trên trình duyệt máy cô (`localStorage`: `sdd-lop`, `sdd-rec-<buổi>`).

## Sinh lại dữ liệu
```
python3 seedling/cong-cu/build_day.py      # day-data.js từ seedling-data.js
python3 seedling/cong-cu/make_tunes.py     # nhạc nền
```
Sửa chant, thủ công, khung buổi trong `build_day.py` (các bảng CHANTS, CRAFTS, hàm build_session). Đổi số `?v=` trong `index.html` sau mỗi lần sửa.

## Bản quyền
Không đưa bài hát, chant, sách của GrapeSEED, Jolly Phonics hay bên khác lên web. Video ngoài chỉ để link tới kênh chính thức.
