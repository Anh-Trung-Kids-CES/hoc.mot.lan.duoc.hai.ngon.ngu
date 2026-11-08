# Giọng cô Hươu cho Lớp Zoom

**Trạng thái 04/11/2026: ĐÃ TẠO ĐỦ 35/35 câu** (Gemini Batch API, giọng Sulafat), đã nghe soát bằng máy chép lời và đã gắn vào web (`gan_vao_web.py`).
Muốn đổi câu: sửa `tao-tai-nguyen/giong.json`, chạy `tao_giong.py <khoá> <tên_file>` rồi `gan_vao_web.py`. Lưu ý: chỉ gửi đúng câu cần đọc, không kèm lời dặn giọng (máy sẽ đọc to cả lời dặn).

Danh sách đầy đủ (máy đọc được) ở `tao-tai-nguyen/giong.json`; tạo tự động bằng `tao-tai-nguyen/tao_giong.py` (Gemini TTS, giọng **Sulafat**).
Câu nào chưa có file thì màn bé chỉ hiện chữ hoặc tạm đọc câu có sẵn, không dùng giọng máy.

| Tên file | Câu |
|---|---|
| ls_co_huou_vi_zoom_01.mp3 | Con chờ cô một chút nhé, các bạn đang vào lớp. |
| ls_co_huou_vi_zoom_02.mp3 | Cô quay vòng chọn bạn nhé! |
| ls_co_huou_vi_zoom_03.mp3 | Cả lớp cùng hỏi bạn nhé! |
| ls_co_huou_vi_zoom_04.mp3 | Con nghe rồi chạm vào đường bay đúng nhé! |
| ls_co_huou_vi_zoom_05.mp3 | Cả lớp đưa tay bay theo, nói theo nhé! |
| ls_co_huou_vi_zoom_06.mp3 | Con nói cho bạn nghe nhé! |
| ls_co_huou_vi_zoom_07.mp3 | Con nghe bạn nói rồi chạm tranh đúng nhé! |
| ls_co_huou_vi_zoom_08.mp3 | Hai bạn ăn ý quá! |
| ls_co_huou_vi_zoom_11.mp3 | Cả nhóm giỏi quá! Cả nhóm được huy hiệu Bứt phá! |
| ls_co_huou_vi_zoom_12.mp3 | Con chạm lần lượt các tranh theo thứ tự truyện nhé! |
| ls_co_huou_vi_zoom_13.mp3 | Cả lớp cùng tiếp sức cho anh hùng Bông nhé! |
| ls_co_huou_vi_zoom_14.mp3 | Rồng Lửa nổi giận rồi! Cả lớp trả lời nhanh nào! |
| ls_co_huou_vi_zoom_15.mp3 | Cả lớp thắng rồi! Rồng Lửa biến lại thành quả trứng! |
| ls_co_huou_vi_zoom_16.mp3 | Con là cô giáo nhỏ! Con nói cho cả lớp nghe nhé! |
| ls_co_huou_vi_khen_01.mp3 | Con nghe tiếng Anh tinh ghê! |
| ls_co_huou_vi_khen_02.mp3 | Tai con bắt được từ tiếng Anh rồi! |
| ls_co_huou_vi_khen_03.mp3 | Con nghe ra tiếng Trung rồi đó! |
| ls_co_huou_vi_khen_04.mp3 | Con nhận ra từ tiếng Trung nhanh ghê! |
| ls_co_huou_vi_khen_05.mp3 | Con nhìn chữ là nhận ra liền! |
| ls_co_huou_vi_khen_06.mp3 | Con nhớ mặt chữ rồi đó! |
| ls_co_huou_vi_khen_07.mp3 | Máy bay của con bay đúng đường rồi! |
| ls_co_huou_vi_khen_08.mp3 | Tai con bắt thanh điệu chuẩn ghê! |
| ls_co_huou_vi_khen_09.mp3 | Con nói rõ nên bạn hiểu liền! |
| ls_co_huou_vi_khen_10.mp3 | Bạn nghe con nói là hiểu ngay! |
| ls_co_huou_vi_khen_11.mp3 | Con hiểu ý bạn rồi đó! |
| ls_co_huou_vi_khen_12.mp3 | Con lắng nghe bạn giỏi ghê! |
| ls_co_huou_vi_khen_13.mp3 | Con đoán đúng cùng các bạn rồi! |
| ls_co_huou_vi_khen_14.mp3 | Cô giáo nhỏ nói hay ghê, các bạn hiểu rồi! |
| ls_co_huou_vi_khen_15.mp3 | Con nói rõ, cả lớp hiểu con rồi! |
| ls_co_huou_vi_khen_16.mp3 | Con hiểu cô giáo nhỏ rồi đó! |
| ls_co_huou_vi_khen_17.mp3 | Con lắng nghe bạn rất chăm! |
| ls_co_huou_vi_khen_18.mp3 | Cả lớp cùng nhau thắng Rồng Lửa rồi! |
| ls_co_huou_vi_khen_19.mp3 | Con nhớ truyện giỏi ghê! |
| ls_co_huou_vi_khen_20.mp3 | Con xếp tranh đúng hết rồi! |
| ls_co_huou_zh_jiao.mp3 | 叫 (gửi máy "叫。" để đọc đúng tiếng Trung) |


## Phần "他 hay 她?" – Little Seed Vòng 3 (thêm 08/11/2026) – CHƯA TẠO
9 câu cô Hươu dạy phân biệt 他 / 她 (đã có trong `tao-tai-nguyen/giong.json`, tự thêm khi chạy `tao_seed_v3.js`). Chưa có file thì màn chiếu hiện lời trong bong bóng, cô đọc trên Zoom.
Tạo xong: chạy lại `node lop-zoom/tao-tai-nguyen/tao_seed_v3.js` là web tự gắn giọng (chỉ gắn câu đã có file).
Ước tính chi phí Gemini (Batch API, giọng Sulafat): khoảng 600 ký tự, dưới 0,02 USD (lần 35 câu trước tốn khoảng 0,05 USD).

| Tên file | Câu |
|---|---|
| ls_co_huou_vi_zoom_17.mp3 | Các con ơi, he và she trong tiếng Trung đọc giống hệt nhau. Các con nghe nhé! |
| ls_co_huou_vi_zoom_18.mp3 | Nghe giống nhau quá! Vậy làm sao biết là bạn trai hay bạn gái? Mình nhìn chữ nhé! |
| ls_co_huou_vi_zoom_19.mp3 | Chữ này có nét bên trái giống một người đứng thẳng. Đây là he: ông, anh trai, em trai. |
| ls_co_huou_vi_zoom_20.mp3 | Cả lớp đứng thẳng, giơ một tay lên nào! |
| ls_co_huou_vi_zoom_21.mp3 | Chữ này có chữ nữ bên trái, giống một bạn gái đang quỳ. Đây là she: bà, chị gái, em gái. |
| ls_co_huou_vi_zoom_22.mp3 | Cả lớp khoanh hai tay trước ngực nào! |
| ls_co_huou_vi_zoom_23.mp3 | Cô đổi chữ thật nhanh nhé! Chữ có người đứng thì giơ tay, chữ có chữ nữ thì khoanh tay! |
| ls_co_huou_vi_zoom_24.mp3 | Con nghe cô đọc rồi nói theo nhé! |
| ls_co_huou_vi_zoom_25.mp3 | Bạn này là he hay she? Con nhìn tranh rồi chạm chữ đúng nhé! |
