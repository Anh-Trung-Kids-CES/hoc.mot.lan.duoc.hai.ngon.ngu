# Giọng cô Hươu cần thu thêm cho Lớp Zoom

Web Lớp Zoom dùng lại các file giọng cô Hươu (Gemini TTS, giọng **Sulafat**) đã có ở web học. Những câu dưới đây chưa có file:
hiện giờ màn bé **chỉ hiện chữ, không đọc** (không dùng giọng máy), cô nói trên Zoom.

Thu xong: đặt file vào `xem-truoc/tai-nguyen/little-seed/audio/`, rồi thêm một dòng vào `HD` trong `lop-zoom/lz-core.js`,
ví dụ `'Cô quay vòng chọn bạn nhé!': AU + 'ls_co_huou_vi_zoom_02.mp3',`. Web tự đọc ở đúng chỗ, không cần sửa gì khác.

## Tiếng Việt (giọng Sulafat)
| Tên file gợi ý | Câu (chép đúng từng chữ) | Dùng ở |
|---|---|---|
| ls_co_huou_vi_zoom_01.mp3 | Con chờ cô một chút nhé, các bạn đang vào lớp. | Chờ vào lớp |
| ls_co_huou_vi_zoom_02.mp3 | Cô quay vòng chọn bạn nhé! | Chào bạn mới |
| ls_co_huou_vi_zoom_03.mp3 | Cả lớp cùng hỏi bạn nhé! | Chào bạn mới |
| ls_co_huou_vi_zoom_04.mp3 | Con nghe rồi chạm vào đường bay đúng nhé! | Máy bay thanh điệu (câu đầu) |
| ls_co_huou_vi_zoom_05.mp3 | Cả lớp bay tay nói theo nhé! | Máy bay thanh điệu (đáp án) |
| ls_co_huou_vi_zoom_06.mp3 | Con nói cho bạn nghe nhé! | Đôi bạn – bé nói |
| ls_co_huou_vi_zoom_07.mp3 | Con nghe bạn nói rồi chạm tranh đúng nhé! | Đôi bạn – bé nghe |
| ls_co_huou_vi_zoom_08.mp3 | Hai bạn ăn ý quá! | Đôi bạn – đúng |
| ls_co_huou_vi_zoom_09.mp3 | Con chạm hộp quà xem nào! | Phiên dịch nhí |
| ls_co_huou_vi_zoom_10.mp3 | Con là Phiên dịch nhí! | Phiên dịch nhí – bé được chọn |
| ls_co_huou_vi_zoom_11.mp3 | Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá! | Huy hiệu |

## Tiếng Trung (cô Hươu)
| Tên file gợi ý | Câu | Dùng ở |
|---|---|---|
| ls_co_huou_zh_jiao.mp3 | 叫 (jiào, đọc riêng một chữ) | Máy bay thanh điệu, chữ thứ 8. Thu xong: trong `lz-core.js`, dòng `叫` đổi `a: ''` thành `a: AU + 'ls_co_huou_zh_jiao.mp3'` |
