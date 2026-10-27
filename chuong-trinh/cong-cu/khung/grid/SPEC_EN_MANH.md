# Web · Chế độ cho con trội tiếng Anh

Con trội tiếng Anh học đúng bài chính như mọi con. Web bật thêm ba thứ, cùng chủ đề của ngày:
1. kiểm tra nhanh tiếng Anh để rút gọn phần ôn tiếng Anh, dành thời gian cho tiếng Trung;
2. Thử thách tiếng Anh ở cấp Cambridge cao hơn một bậc;
3. Phiên dịch nhí nâng cao (nghe tiếng Anh dài, nói lại bằng tiếng Trung, ghi âm gửi cô).

## 1. Bật chế độ
- Trường `che_do.en_manh: true` trong hồ sơ của con. Cô bật trên trang quản lý lớp khi con có đủ hai dấu hiệu: bài đầu vào cho thấy tiếng Anh cao hơn mốc khóa ít nhất một bậc Cambridge, tiếng Trung ở đúng mức khóa; và trên lớp con làm tốt bản chuẩn [Chuyển ngữ] 3 buổi liền. Ba mẹ không tự bật.
- Màn của con không hiện nhãn "trội tiếng Anh"; con chỉ thấy thêm nội dung.
- Con trượt bài kiểm tra nhanh 3 ngày liền → web gợi ý cô tắt chế độ (cô quyết).
- Bản xem thử: công tắc trong trang Hướng dẫn cho thầy cô, lưu trên máy.

## 2. Kiểm tra nhanh tiếng Anh, rút gọn phần ôn
| Bước trong ngày web | Mọi con | Con bật chế độ, đúng 4/4 kiểm tra nhanh |
|---|---|---|
| Ôn nhanh đầu bài | Có | Có |
| Kiểm tra nhanh tiếng Anh | Không | 4 câu: nghe tiếng Anh, chọn tranh; từ, cụm của chính ngày đó |
| Thẻ, nghe – chọn, nói (phần tiếng Anh) | Đủ lượt | Mỗi từ 1 lượt tiếng Anh, bỏ lượt lặp |
| Thẻ, nghe – chọn, nói (phần tiếng Trung) | Đủ lượt | Đủ lượt |
| Truyện ngày 7–8 | Tiếng Anh rồi tiếng Trung | Giữ nguyên (truyện tiếng Anh là nền cho tiếng Trung) |
| Cuối ngày | – | Thêm bước "Thêm tiếng Trung": nghe – nói lại từ, câu tiếng Trung của ngày và một vòng nghe tiếng Trung – chọn tranh |

- Sai từ 1 câu kiểm tra: con học đúng như bài chính; từ sai vào Hộp ôn như thường.
- Không đếm giờ, không trừ sao. Thời lượng ngày gần như không đổi: phần tiếng Anh bớt bao nhiêu thì tiếng Trung thêm bấy nhiêu.
- Câu kiểm tra sinh tự động từ các mục tiếng Anh của ngày, nên không cần thêm dữ liệu.

## 3. Thử thách của Leo (trong Góc Xem thêm & Luyện thêm)
Hiện với con bật chế độ; cô có thể mở cho cả lớp. Mở sau khi con xong ngày đó. Theo luật của góc: không cộng sao, không mở ngày mới, không bảng xếp hạng, có dòng "không cần làm hết".

### 3a. Thử thách tiếng Anh (mỗi ngày web)
- 5–6 từ mở rộng cùng chủ đề, 2–3 câu dài hơn, một đoạn 4–8 câu (bản dài của truyện hôm đó hoặc đoạn cùng chủ đề), 3 câu hỏi nghe – hiểu, mỗi câu 3 lựa chọn.
- Khóa có luyện đề: thêm 1 câu luyện đề Cambridge ở cấp kế tiếp, cùng chủ đề.
- Chỉ tiếng Anh, không đưa từ tiếng Trung mới.

| Khóa | Cấp tiếng Anh của Thử thách |
|---|---|
| Little Seed, Seedling | Starters |
| Canopy | Movers |
| Larva, Larva Plus | Flyers |
| Pupa, Cocoon, Butterfly | Flyers nâng cao / A2 Key for Schools |

### 3b. Phiên dịch nhí nâng cao (ngày 2, 4, 6, 8 của unit, ứng với 4 buổi trên lớp)
Lấy đúng dòng [Bản nâng cao] của buổi trong bảng phân bổ.
1. Leo đọc đoạn tiếng Anh (có nút nghe lại).
2. Con chọn câu tóm tắt tiếng Trung đúng giữa A và B (nghe được cả hai câu).
3. Con ghi âm 2–3 câu nói lại cho Xiaomei (tối đa 60 giây, nghe lại, ghi lại được).
4. Con nghe câu mẫu.
Bản ghi lưu vào hộp "Gửi cô" để cô nghe trên lớp. Không chấm tự động.

## 4. Giữ nguyên
Bài chính và thứ tự bước; định mức từ tiếng Trung mới; Hộp ôn; màn bài học không có chữ tiếng Việt; nhắc nghỉ mắt ở 25 phút (tính cả bài chính và góc thêm).

## 5. Dữ liệu cần thêm
Trong `data/bai/<khóa>-u<n>.json`, mỗi ngày web:
```
"thu_thach_en": {
  "cap": "Movers",
  "tu":  [{"en": "library", "emo": "📚"}, …],          // 5–6 mục
  "cau": ["Let's go to the library on Saturday.", …],  // 2–3 câu
  "doan": {"ten": "Leo's Busy Saturday", "cau": ["…", "…"]},  // 4–8 câu
  "hoi": [{"q": "Where does Leo go first?", "opts": ["…","…","…"], "ans": 0}, …],  // 3 câu
  "de":  {"dang": "Movers Listening Part 1", "q": "…", "opts": […], "ans": 0}   // tuỳ khóa
}
```
Ngày 2, 4, 6, 8 thêm:
```
"phien_dich_nc": {
  "buoi": 21,
  "en": ["…", "…"],                 // đoạn tiếng Anh, từng câu
  "chon": [{"zh": "…", "py": "…"}, {"zh": "…", "py": "…"}],
  "dung": 0,
  "mau": {"zh": "…", "py": "…"}
}
```
Hồ sơ con: `che_do.en_manh`, lịch sử kiểm tra nhanh (ngày, đúng/sai), danh sách bản ghi "Gửi cô".

Âm thanh: bản xem thử dùng giọng máy của trình duyệt cho phần Thử thách và Phiên dịch nhí nâng cao; web thật cần thu âm (mỗi unit khoảng 8 đoạn tiếng Anh, 4 đoạn Phiên dịch nhí, 8 câu tiếng Trung).

## 6. Việc còn lại
- Viết `thu_thach_en` và `phien_dich_nc` cho các unit còn lại.
- Thu âm.
- Trang quản lý lớp: cô bật/tắt chế độ, xem lịch sử kiểm tra nhanh, nghe bản ghi "Gửi cô".
