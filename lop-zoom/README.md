# Lớp Zoom cùng cô – đợt 1 (Little Seed · Vòng 2)

Web riêng cho buổi Zoom cuối tuần, kiểu Wayground: cô điều khiển tốc độ, các bé chạm trên máy thứ hai.
Đợt 1: **Little Seed Vòng 2 "Giới thiệu bản thân"** (Zoom ngày 14, Chủ nhật 8/11/2026, 40 phút, nhóm 6 bé).

## Các link

| Ai dùng | Link |
|---|---|
| Ba mẹ / bé (một link chung) | https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/lop-zoom/ |
| Ba mẹ chuẩn bị trước buổi học | …/lop-zoom/?chuan-bi |
| Cô (máy tính) | …/lop-zoom/co.html |
| Màn chiếu cô chia sẻ trên Zoom | nút **📺 Mở màn chiếu** trên màn cô (…/lop-zoom/?chieu=MÃ) |
| Thử trên một máy, không cần Firebase | thêm `?mock=1` vào cả link cô và link bé, mở nhiều tab |
| Thử nhiều bé trên một trình duyệt thật (Firebase) | link bé thêm `?thu=1` (mỗi tab là một bé khác) |

## Cách chạy một buổi
1. **Trước buổi**: sale gửi link `?chuan-bi`. Ba mẹ điền tên con, tên ba/mẹ, chọn bạn đồng hành, ảnh con (không bắt buộc; chỉ hiện cho lớp khi tích "Đồng ý cho các bạn trong lớp thấy ảnh con").
2. **Đầu giờ**: cô mở `co.html` → **Mở phòng mới** → được mã 4 số. Bấm **Mở màn chiếu**, chia sẻ cửa sổ đó trên Zoom (tích chia sẻ âm thanh). Bấm **Chép link cho ba mẹ** dán vào chat Zoom.
3. **Bé vào lớp**: mở link chung → nhập mã phòng → tên con và tên ba hoặc mẹ (máy đã chuẩn bị hoặc đã đăng nhập web 21 ngày thì điền sẵn). Rớt mạng mở lại thì vào đúng chỗ cũ.
4. **Cô thêm bé nhanh** (thẻ *Thêm bé*): dán danh sách người tham gia Zoom (web tự tách tên con / tên ba mẹ, cô sửa trước khi thêm), hoặc gõ nhanh tên. Chỗ ngồi tạm vẫn ghi đủ dữ liệu; bé vào sau bằng mã phòng với đúng tên thì tự nhận chỗ. Có thể bật **Cô duyệt từng bé**. Nút 🔗 ghép hai chỗ của cùng một bé.
5. **Bé chỉ có 1 máy**: bé xem màn chiếu, giơ ngón tay 1-2-3 (thanh điệu 1-4), cô bấm hộ ở cột phải.
6. **6 phần**: bấm lần lượt ở cột trái. Mỗi câu: *Hiện đáp án* → *Câu tiếp*. *Phát lại* cho mọi máy đọc lại.
7. **Sau buổi** (thẻ *Kết quả*): chấm 4H (thái độ, cảm xúc, tương tác với bạn, 0–2), ghi chú → **Gửi về Sheet** (tab "Lớp Zoom") hoặc **Tải CSV**. Nút **Xóa ảnh các con khỏi phòng**.

## Mạch 40 phút
| Phút | Phần | Bé làm gì | Cô chấm |
|---|---|---|---|
| 0–5 | Chào bạn mới | Vòng quay chọn bạn; cả lớp hỏi What's your name? / 你叫什么？, bạn trả lời | EN / ZH: tự nói (✓) hoặc nói cùng cô (~) |
| 5–13 | Ôn nhanh | 10 câu nghe (4 EN, 4 ZH) hoặc nhìn chữ (三, Anna), chạm 1 trong 3 tranh | tự động: đúng/chưa, thời gian |
| 13–21 | Máy bay thanh điệu | 一 二 三 四 五 六 你 叫: chạm 1 trong 4 đường bay, rồi cả lớp bay tay nói theo | chuẩn / gần / cần luyện |
| 21–31 | Đôi bạn | Bé A thấy tranh và nói, bé B nghe rồi chạm 1 trong 3 tranh, đổi vai, đổi tiếng; bạn khác đoán cho vui | tự động |
| 31–37 | Truyện + Phiên dịch nhí | Nghe 8 cảnh "Sinh nhật của Bông"; mở 4 hộp quà, phiên dịch nhí nói sang tiếng kia | được / cùng cô / chưa |
| 37–40 | Huy hiệu Bứt phá | Huy hiệu cả nhóm, ảnh hoặc avatar các bạn | – |

Luật Little Seed: chỉ chạm và nói, 3 tranh, không bảng xếp hạng (chỉ có thanh năng lượng chung của nhóm), 3 KHÔNG (bé chưa đúng thì cả lớp nghe lại, không sửa lỗi riêng, màn bé không hiện ai đúng ai sai). Màn cô có ✓/○ từng bé nên **chỉ chia sẻ cửa sổ Màn chiếu**, không chia sẻ màn cô.

## Dữ liệu
- Firebase Realtime Database `anh-trung-kids-zoom` (luật bảo mật bản 1, không cần sửa): `rooms/<mã>/teacher`, `state` (cô ghi), `marks/<chỗ>/` (cô chấm, bấm hộ, 4H, ghi chú), `players/<máy hoặc t_…>` (bé), `answers/<câu>/<máy>`.
- Mã câu: `on_<câu>_<lượt>`, `tone_<chữ>_<lượt>`, `pair_<lượt chơi>_<lượt>`. "Hỏi lại câu này" tăng lượt; kết quả lấy lượt mới nhất bé đã trả lời.
- Máy chủ Apps Script (cùng link SCORE_API của web học) cần lên **v15** (`apps-script/Code.gs`): nhận `action:'zoom'` (tab "Lớp Zoom", gửi lại thì ghi đè) và `action:'zoomhs'` (tab "Chuẩn bị Zoom", ảnh vào thư mục Drive riêng "Lớp Zoom – Ảnh con (xóa khi hết thử thách)"). Hết thử thách chạy hàm `xoaAnhLopZoom()`. Lần triển khai này Google sẽ hỏi thêm quyền Drive.
- Firebase SDK để sẵn trong `vendor/` (bản 10.14.1), không tải từ ngoài.

## Tệp
- `index.html`, `lz-con.js` – màn bé + màn chiếu + chuẩn bị vào lớp
- `co.html`, `lz-co.js`, `co.css` – màn cô
- `lz-core.js` – cấu hình Firebase, nội dung Vòng 2, âm thanh, chỗ ngồi, thanh năng lượng
- `lz.css` – kiểu chung
- `GIONG-CAN-THU.md` – các câu giọng cô Hươu cần thu thêm

## Đợt 2 (cho Zoom ngày 21)
Canopy, thẻ báo cáo tự động, câu gợi ý cho sale, huy hiệu cộng sao, tab "Ghép hồ sơ Zoom" trên trang quản trị.
