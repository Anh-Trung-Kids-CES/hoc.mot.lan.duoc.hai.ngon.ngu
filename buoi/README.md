# Web dạy buổi trên lớp · lớp offline 48 buổi (Little Seed, Seedling)

Link: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/buoi/?lop=ls&b=1 (`lop` = `ls` | `sd`, `b` = số buổi).
Nối tiếp Buổi 0 (`khai-giang/`, nút "Buổi 1 ›"); trang học liệu in của hai lớp có nút "Web dạy buổi 1–3".

**Làm từng unit, chị duyệt từng unit (12/11/2026).** Hiện có Unit 1 = buổi 1–3 của cả hai lớp
(Seedling tuần 1–3 gồm Unit 1 Greeting + Unit 4 Body như khung v8.1).

## Nguyên tắc tổ chức buổi
Tài liệu "GrapeSEED và Budding Bean: nguyên tắc tổ chức buổi học offline" (Docs, 12/11/2026). Tóm tắt:
giữ 7 khối của khung; trong khối là màn ngắn ≤ 5–6′ (số phút ghi ở mỗi màn); vận động chuyển tiếp mỗi 5–8′;
từ (thẻ tranh) chỉ đi kèm văn bản dạy ngay sau; vai cô theo buổi: buổi Introduce làm mẫu → Repeat/Practice giúp con đáp
→ Produce nghe con; truyện, big book đọc cả lượt tiếng Anh rồi cả lượt tiếng Trung; mở – đóng bằng vè chào; mỗi buổi có màn dự phòng.

**Chị duyệt 12/11 tối (lớp offline là các con lớp 1–5 học chung):**
- mỗi màn ghi `vai` cô (`mau` làm mẫu · `giup` giúp con đáp · `nghe` nghe con dẫn); nội dung mới luôn `mau`;
- `lead: true` = con làm chủ (đôi bạn, nhóm, bạn làm "cô", con nói một mình); tăng dần buổi 1 → 3 (≈15′ → 30–40′ → ≥ 60′);
- `off: true` = tắt chiếu (thẻ in, rối, người giấy): cửa sổ chiếu hiện "Look at me! 看老师！"; ≥ 30′ mỗi buổi;
- mỗi buổi có màn **Nghe – chỉ sách** (đôi bạn cầm big book in, máy đọc, con chỉ ngón tay theo; như giờ nghe – chỉ sách của Budding Bean);
- 2–3 câu hỏi về chính con mỗi unit; đôi bạn lớn – bạn nhỏ cố định cả unit, bạn lớn dẫn và kèm bạn nhỏ;
- build tự tính "con làm chủ" và "tắt chiếu" từng buổi (hiện trên thanh buổi) và báo lỗi nếu màn chưa ghi `vai`.

## Loại màn (buoi.js)
chao · song (YouTube) · ve (vè, nhịp, hát to – nhỏ, đổi tiếng) · hoi (hỏi – đáp mẫu) · flash (thẻ tranh, "Cô trước" / "Con trước")
· book (truyện, big book; che chữ; câu hỏi theo trang) · cua (Cửa lớp thần kỳ / chào đúng người) · chon (chỉ tranh; `xep` = xếp tranh theo thứ tự)
· says (Leo says / Xiaomei says) · cau (cầu nối Leo – Xiaomei; `pdn` = Phiên dịch nhí) · dien (diễn, kịch, có vai) · move (chuyển tiếp vận động)
· lam (làm tay, tắt chiếu, link trang in) · nghi (đồng hồ nghỉ) · tong (tổng kết, việc ở nhà) · kt (phiếu cuối unit nghe – khoanh) · chu (chữ và âm).

Lời cô bên phải: Việc của con, vai cô, câu trên màn, ô "Chưa dạy màn này" (chấm đỏ trên dải khối, danh sách hiện ở màn tổng kết).
📺 Cửa sổ chiếu (`?chieu`) đi theo màn của cô; 🎙 thu giọng cô dùng chung kho với Buổi 0.

## Sửa nội dung
Sửa `cong-cu/noi-dung-u1.js` (ngữ liệu lấy thẳng từ `little-seed/day/hoc-lieu-data.js` và `seedling/day/hoc-lieu/hoc-lieu-data.js`)
rồi chạy `node buoi/cong-cu/build.js` ở gốc repo: sinh `data-u1.js`, ghép giọng có sẵn (nguyên câu, rồi tự tách câu theo dấu phẩy để ghép mảnh),
kiểm tra id màn, tổng phút từng khối không vượt khung, tranh có thật; ghi `cong-cu/giong-thieu.json` (câu chưa có giọng).
Unit sau: thêm `noi-dung-u2.js` (cùng cấu trúc), thêm `<script src="data-u2.js">` vào `index.html`. Đổi `?v=` sau mỗi lần sửa.

Giọng còn thiếu: tạo theo lô bằng Gemini TTS (khoá chị cấp, xoá sau khi dùng):
`GEMINI_API_KEY=... python3 seedling/cong-cu/gemini/gen_audio.py buoi/cong-cu/giong-thieu.json buoi/giong buoi/cong-cu/giong-map.json`, rồi chạy lại build.
