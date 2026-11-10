# Seedling 48 buổi · web 99 ngày (lớp offline)

Web tự học cho lớp Seedling offline 48 buổi của Anh – Trung – Kids (CES Việt Nam). Chỉ dùng cho lớp này, không phải bản chuẩn cho các khoá khác. Không sửa web 21 ngày (`xem-truoc/`) hay web Zoom (`lop-zoom/`); chỉ dùng chung bộ nhận diện khuôn mặt ở `lop-zoom/vendor/mediapipe`.

## Nguồn nội dung
- `Seedling_KhungChuongTrinh_48buoi_v7.xlsx` (05/11/2026): tab Khung 48 buổi, Mạch từ theo ngày, Bước ngày web, Vai buổi I-R-P-P, Truyện unit, Hộp ôn & sao.
- Ngày web 1, 2, 3, 8 giữ bản demo Unit 1 đã duyệt (tranh cảnh Unit 1, giọng thu sẵn), thêm bước Vận động.
- 95 ngày còn lại sinh tự động: `cong-cu/parse.py` đọc Excel (đã xuất JSON), `cong-cu/build.py` dựng `seedling-data.js`. Đừng sửa tay `seedling-data.js`; sửa Excel rồi dựng lại.

## Cấu trúc
- `index.html` – khung web (thanh nút trái, giống web 21 ngày).
- `seedling-app.js` – lõi: giọng đọc, thu giọng, các dạng bài Thẻ nền, Thẻ từ mới, Nghe truyện, Chạm đúng tranh, Nói theo, Phiên dịch nhí, Trả lời câu hỏi, Lời lớp học, Mẹo âm, Gọi lại.
- `seedling-bai-moi.js` – dạng bài mới (Nghe – chạm tranh, Vận động, Dạng đề, Nghe – làm theo, Nghe – trả lời YCT口试) và các màn: trang chủ, bản đồ cả khoá (4 chặng), bản đồ từng unit, trang ngày, buổi trên lớp 1–48.
- `seedling-head.js` – chơi bằng đầu ở bước Vận động (camera, xử lý ngay trên máy, không ghi, không gửi). Thử không cần camera: `?headsim=1` (phím ← ↑ →).
- `seedling-on.js` (Hộp ôn), `seedling-thuong.js` (sao, đổi quà, huy hiệu), `seedling-co.js` (Bảng của cô), `seedling-reader.js` (Reader 12 truyện), `seedling-may-chu.js` (nối Google Sheet).
- `tai-nguyen/` – tranh, giọng (chép từ web 21 ngày và bản demo Unit 1).

## Thứ tự một ngày web
Theo tab "Bước ngày web" của v7, thêm bước Vận động ở cuối:
- Ngày Phần: Thẻ nền Little Seed → Thẻ từ mới → Nghe truyện → Chạm đúng tranh (hoặc Nghe – chạm tranh) → Nói theo → Phiên dịch nhí → Mẹo âm → Vận động.
- Ngày Cả truyện / Ôn: Nghe cả truyện → Trả lời câu hỏi → Nói theo / 听后重复 → Dạng đề → Phiên dịch nhí → Mẹo âm → Gọi lại → Vận động.

## Mở ngày
Học xong ngày trước mới mở ngày sau. Cô giáo thêm `?gv=1` vào link để mở hết (máy đó nhớ); `?gv=0` để tắt.

## Giọng và nhân vật tạo bằng Gemini (05/11/2026)
- `tai-nguyen/giong/`: 1.942 câu tiếng Anh, tiếng Trung và 25 lời dặn tiếng Việt, tạo bằng Gemini 3.8 Flash TTS qua Batch API (rẻ hơn 50%). Giọng: Despina (Anh, chậm lại 10%), vi-vn-tutor-8 (Việt). Tiếng Trung (944 câu) làm lại 05/11 bằng Gemini 3.1 Flash TTS, giọng Leda, có lời dặn giữ tên gốc: Bông, Vũ, Lan đọc kiểu Việt; Leo, Anna kiểu Anh; Xiaomei đọc 小美. 13 câu có tên Vũ làm lại từng câu (chọn bản đọc Vũ đúng thanh ngã). Cắt khoảng lặng hai đầu. Bảng ghép câu → tệp nằm trong `seedling-data.js` (sinh từ `gen_au.json`).
- `tai-nguyen/nhan-vat/nv_*_a.webp`: Vũ, anh trai Vũ, người diễn (Unit 4), Miss Hoa, Mrs Lan (người, thay cô Hươu khi Mrs Lan nói). Vẽ bằng Nano Banana 2.1, lấy Bông, Leo, anh trai Bông, mẹ Bông làm mẫu nét.
- Công cụ: `cong-cu/gemini/` (gem.py, ia.py, bat.py, gen_audio.py, merge.py, gen_nv.py). Khoá đặt trong biến môi trường `GEMINI_API_KEY`, không lưu vào repo.

- `tai-nguyen/canh/u1/`: 10 cảnh (và 5 tranh phóng to cắt ra từ đó) đã thay cô Hươu bằng Mrs Lan dạng người (05/11).
- `tai-nguyen/tranh/`: 186 tranh từ vựng, cắt từ 21 tờ 9 ô vẽ bằng Nano Banana 2.1 qua Batch API (tờ T02, T17 vẽ lại vì có chữ; T20, T21 thêm). Bảng từ → tranh: `cong-cu/gemini/gen_pic.json`, cắt bằng `cong-cu/gemini/cut.py`.

## Còn thiếu
Xem `CAN-BO-SUNG.md`: 78 từ chức năng / trừu tượng (yes, what, can, today…) vẫn hiện biểu tượng hoặc thẻ chữ, theo danh sách "Không cần tranh". 

## Sửa sau buổi duyệt 05/11 tối
- Luật 5–10 câu: bài nào dưới 5 câu (Thẻ nền, Thẻ từ mới, Mẹo âm, Phiên dịch nhí, Nói theo, Gọi lại) được thêm mục ôn từ các ngày trước (`on: true`); Thẻ nền lấy từ Little Seed của các ngày gần nhất. Logic nằm cuối `cong-cu/build.py`.
- Giọng: `SD.aumap` (câu → file). Web tự tìm file theo nội dung câu, không còn phải dùng giọng máy. 168 câu còn thiếu (chủ yếu ngày 1, 2, 3, 8 và Mẹo âm) đã tạo bằng Gemini.
- Nói theo: chỉ khen và cho sao khi micro thật sự nghe thấy con nói; im lặng thì nhắc nói lại một lần rồi sang câu.
- Phiên dịch nhí: 3 bước rõ ràng ① Nghe Leo nói → ② Con nói tiếng Trung → ③ Xiaomei hiểu rồi. Tuần đầu cô nói mẫu trước; các tuần sau con thử trước rồi nghe đáp án.
- Vận động: nghe một từ rồi quay đầu chọn TRANH đúng (2 tranh ở ngày 1–3, 3 tranh từ ngày 4), có tranh gây nhiễu, không ghi chữ dưới tranh. Có khung camera của con ngay trong bài và mũi tên hướng đang quay. Màn "Đang mở camera" có nút "Chơi bằng chạm" và tự báo lỗi sau 30–40 giây.

## Sửa ngày 06/11
- Chạy thử tự động cả 99 ngày bằng `cong-cu/kiem-tra-choi-het.py` (chơi từng bài tới màn "làm xong bước", ghi bài kẹt, câu dùng giọng máy, file giọng lỗi). Đã sửa kẹt ở Trả lời câu hỏi, Dạng đề, Nghe – trả lời, Phiên dịch nhí (nguyên nhân: tắt tiếng bằng `stopAll()` làm đổi lượt chạy; nay dùng `hush()` và lời mới tự kết thúc lời cũ).
- Dạng đề: đáp án là tranh (96 tranh: 32 dùng lại, 64 vẽ mới ở `tai-nguyen/tranh/de_*.webp`, bảng `cong-cu/gemini/vi_en.json`, `plan.json`, `drawn.json`); 3 câu A/B/C bị đọc nhầm thành đúng/sai đã sửa.
- Giọng: thêm 174 câu Anh–Trung (đáp án Trả lời câu hỏi…) và 140 câu tiếng Việt (hướng dẫn đầu bài, "Hôm nay con học") trong `SD.vi_tx`.

## Đối chiếu bộ nguyên tắc 09–10/11 (sửa ngày 10/11/2026)
Đối chiếu với `claude/NguyenTac_LapLai_DangBai.md` (Project). Kiểm lại bất cứ lúc nào: `python3 -I seedling/cong-cu/kiem-nguyen-tac.py` (báo đỏ = phải sửa trước khi giao; báo vàng = thuộc bước viết lại mạng văn bản).
- **Dữ liệu** (`cong-cu/va_nguyen_tac.py`, chạy sau `build.py` vì nguồn dựng gốc không nằm trong repo): bỏ lời dặn tiếng Việt lọt vào câu Leo nói ở Phiên dịch nhí (ngày 17, 25, 59, 71, 95; giọng cũ đọc cả lời dặn), 3 câu hỏi dính mã tranh ở ngày 96, câu Trung dính pinyin ở ngày 32, thẻ "vóc dáng" (ngày 5) và "lượng từ…" (ngày 88); bỏ chữ tiếng Việt trên nút Mẹo âm và nút đúng/sai của Dạng đề; Miss Hoa → Mrs Lan; bỏ tên mới "Mr Nam" (bố Anna). Lựa chọn trùng tranh trong bài vận động được thay bằng thẻ khác.
- **Hộp ôn** (`seedling-on.js`): 5 lượt gọi lại (trong ngày web, ngày web kế tiếp, ~1 tuần, ~3 tuần, cuối unit/khoá ôn); lượt sau khó hơn (nghe Anh → nghe Trung → nói Anh → nói Trung → chọn chữ Hán); mỗi câu một thứ tiếng; từ chỉ có tiếng Anh nay cũng vào hộp (khi có tranh); sai thì gặp lại cuối lượt ở dạng dễ hơn.
- **Nghỉ mắt** (`seedling-nghi.js`): phút 25 nghỉ mắt 20 giây; đủ 30 phút thì không mở bước mới, nghỉ 10 phút. Tắt khi chạy thử tự động hoặc `?nghi=0`.
- **Chưa sửa được trong lần này** (cần viết lại mạng văn bản U2–U12 theo mẫu U1 và tạo giọng, tranh bằng Gemini): truyện dài hơn mức Seedling 15–20 chữ mỗi phần; cảnh U2–U12 và Body dùng tranh nền chung; web chưa có bài hát, big book mẫu câu, vè; 5 unit hơn 15 từ chưa chia lõi / vòng ngoài; 16 ngày có cảnh Anh và Trung lệch nhau. Mẹo âm đang luyện thanh điệu, trái mục "Giữ nguyên" (không luyện thanh ở Seedling): chờ chị quyết.

## Mạng văn bản Unit 9 (bản mẫu 10/11, chờ chị duyệt)
- Truyện khung mới 6 phần "The Picnic · 真好吃！" theo nguyên tắc mục I (khung hỏi – đáp, câu cuối hỏi con), big book "I like ___ / I don't like ___", vè đếm: `chuong-trinh/cong-cu/khung/grid/mang/mau_seedling48_u9.json`.
- `cong-cu/ap_mang_u9.py` sửa ngày 64–71 ngay trong `seedling-data.js` (chạy SAU build.py): thay truyện, thay bài luyện rời Chạm/Nghe – chạm tranh bằng bước "Big book và vè", dựng lại Nói theo, Phiên dịch nhí, Trả lời câu hỏi; Reader U9. Tranh ghép: `tai-nguyen/canh/u9/`.
- Câu chưa có giọng thu: `cong-cu/giong_thieu_u9.json` (đang đọc bằng giọng máy).

## Máy chủ lớp (10/11/2026)
Tiến độ của con, sao cô thưởng và phiếu quà lưu trên Google Sheet quản lý lớp, dùng chung với Little Seed: mã ở `apps-script/lop-offline-48/Code.gs`, cách bật ở `apps-script/lop-offline-48/HUONG-DAN.md`. Link /exec dán vào `SDL_API` trong `seedling-may-chu.js`. Để trống thì web chạy bản xem thử (dữ liệu trên máy, PIN 2468).
