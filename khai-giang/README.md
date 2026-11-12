# Buổi 0 · Khai giảng (web trình chiếu cho cô)

Link: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/khai-giang/
(`?lop=ls` mở sẵn Little Seed, `?lop=sd` mở sẵn Seedling.) Có nút mở từ web dạy Seedling 48 buổi và trang học liệu in của hai lớp.

Kịch bản chị chốt 11/11/2026: buổi 0 nằm ngoài 48 buổi, 90 phút, 6 khối × 15′, làm quen, chưa dạy từ; ba mẹ dự 15′ cuối. Không đưa vào web học của con.

## 18 màn
| Khối | Màn |
|---|---|
| 1 · 0–15′ Đón con | Chào mừng · Bài hát chào (YouTube) · Thẻ tên · Trò Tìm bạn cùng màu |
| 2 · 15–30′ Vè chào đầu | Vè câu 1–2 (nhịp 4 phách, Sư tử – Chú chuột) · Vận động Vỗ tay thật vui (YouTube) |
| 3 · 30–45′ Vận động | Trò Leo says / Xiaomei says · Vận động Đi trong rừng, đứng hình (YouTube) |
| 4 · 45–60′ Gặp các bạn | Gặp các bạn · Truyện tranh (LS: big book U1 trang 5–9; SD: truyện U1 Good Morning, Mrs Lan!) · Trò Chạm nhanh |
| 5 · 60–75′ Vè chào cuối | Vè câu 1–2 · Trò Đoàn tàu tạm biệt (YouTube) · Ảnh lớp đầu tiên |
| 6 · 75–90′ Ba mẹ | Con biểu diễn · Học ở nhà trên web (QR) · Lộ trình (QR nhóm Zalo cô dán vào) · Tạm biệt |

Mỗi màn có lời cô, câu cô đọc theo (kèm pinyin), phím cách làm việc chính của màn. Trò chơi có bảng sao đội Cún / Mèo.
Đồng hồ buổi: bấm "Bắt đầu buổi", thanh khối báo khối nên đang dạy và chậm bao nhiêu phút.
📺 Cửa sổ chiếu: mở thêm một cửa sổ (`?chieu`), kéo sang TV; cửa sổ này đi theo màn cô, video phát ở cửa sổ chiếu, giọng mẫu phát ở máy cô.

## Giọng đọc mẫu (cách tiết kiệm nhất)
Thứ tự trang dùng: giọng cô tự thu → file giọng có sẵn → giọng máy của trình duyệt.
1. **Dùng lại giọng có sẵn** của web Little Seed và Seedling (không tạo mới): 57 lượt nguyên câu.
2. **Ghép mảnh có sẵn** khi chưa có nguyên câu (ví dụ "Goodbye" + "everyone", "One" + "two" + "three"): 22 lượt.
3. **16 câu còn thiếu** (`cong-cu/giong-thieu.json` trước 12/11 trưa): dòng 2 vè chào đầu, 2 câu vè chào cuối, "Leo says…", "Xiaomei说……", 跳一跳 và các câu chào gọi tên. Đã tạo bằng Kokoro (mô hình đọc miễn phí chạy ngay trên máy, giọng af_heart và zf_xiaobei, tốc độ 0,85), file ở `giong/`, map ở `cong-cu/giong-map.json`. Tên Việt đọc gần đúng (Bông → "Bong", Vũ → "Voo"); Xiaomei, Anna trong câu tiếng Trung đọc là 小美, 安娜.
   - Muốn giọng thật: cô thu đè ngay trên trang (🎙 Giọng đọc → ● Thu; "Tải về" rồi "Nạp file" để chuyển sang máy lớp).
   - Hoặc tạo lại bằng Gemini TTS cho cùng giọng với web học: xoá dòng tương ứng trong `giong-map.json`, chạy
     `GEMINI_API_KEY=... python3 seedling/cong-cu/gemini/gen_audio.py <danh sách> khai-giang/giong khai-giang/cong-cu/giong-map.json` rồi `node khai-giang/cong-cu/build_buoi0.js`.

## Bài hát khởi động
Lấy từ kho "Xem thêm" của web (kênh có trên YouTube Kids, chọn 11/11/2026), nhúng youtube-nocookie, không tải về:
Hello! và Bye Bye Goodbye, If You're Happy And You Know It, Walking In The Jungle (Super Simple Songs); 你好歌, 再见歌, 如果感到幸福你就拍拍手, 我会跳 (Little Fox Chinese).
Nhạc nền trò Tìm bạn cùng màu dùng `seedling/day/nhac/london.mp3` (giai điệu dân gian tự tổng hợp).

## Sửa nội dung
Sửa `cong-cu/noi-dung.js` rồi chạy `node khai-giang/cong-cu/build_buoi0.js` ở gốc repo (sinh `buoi0-data.js`, kiểm tranh và nhạc có thật, ghi lại danh sách câu thiếu giọng). Đổi số `?v=` trong `index.html` sau mỗi lần sửa.
`qr-ls.svg`, `qr-sd.svg`: mã QR link web học, tạo sẵn để không cần mạng.
