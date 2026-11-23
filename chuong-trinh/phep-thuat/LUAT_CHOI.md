# Game "Phép thuật lời nói" (Little Seed + Seedling)

## LUẬT MỚI: HỎI – ĐÁP – HIỆN TRANH (chị duyệt 23/11/2026, thay các luật chơi ngày 11/11 ở dưới)
**Vì sao đổi:** chị thấy bản cũ khó hiểu với trẻ: 5 nhân vật cùng lúc, hai phù thuỷ ngủ ở hai mép, nhãn "⭐ Con" nằm dưới chân ông, con phải chọn bạn, gọi dậy, chọn bong bóng rồi mới nói, mỗi lượt tự chọn thứ tiếng, chỉ dẫn bằng chữ.

**Luật chơi (đã có trên web cả hai khoá):**
- **Mỗi lúc một phù thuỷ.** Màn 1: chỉ Leo, hỏi 4 câu tiếng Anh; xong Leo chào "Bye-bye! Your turn, Xiaomei!" rồi bay đi. Cô Hươu nói "Bây giờ mình nói tiếng Trung nhé!". Màn 2: Xiaomei bay vào, hỏi đúng 4 câu đó bằng tiếng Trung về **chính bức tranh con vừa dựng** (tranh con chọn ở màn 1 được đánh dấu). Không trộn hai thứ tiếng trong một màn.
- **Phù thuỷ hỏi, con trả lời, tranh hiện theo câu trả lời.** Cảnh bắt đầu trống, lớn dần theo lời con. Mỗi câu có 2–3 tranh gợi ý ở trên cảnh; con nói tranh nào thì tranh đó hiện.
- **Gợi trước, hỏi sau:** lần đầu gặp một câu hỏi trong màn, phù thuỷ đọc mẫu từng tranh rồi mới hỏi.
- **Câu hỏi dùng chung mọi unit** (19 câu, bảng `QT` trong `chuong-trinh/phep-thuat/hoi_dap.py`): Who's here? Say hello! · Who is she/he? · How do you feel? · What's this? · What do you have? · Where is it? · What can they do? · What do you eat/drink/like? · What's the weather like today? · What colour do you want? · Let's count! How many? · What shall we do? · What do we wear? · How old are you? · What's your name? · Look! What do you say? Mỗi unit chọn nhóm câu hỏi + tranh đáp án (bảng `QA`). Phép tự là câu hỏi (What's your name?…) không làm đáp án.
- **Mỗi ngày 4 câu:** câu của unit đang học, câu cuối ôn unit trước (nếu có); ngày Ôn lấy các unit đã học. Tranh ưu tiên phép con ít nói.
- **Thang gợi ý 4 bậc** (nút 💡 lên bậc ngay; im ~7 giây hoặc máy chưa nghe ra thì tự lên bậc):
  0. Câu hỏi + tranh gợi ý.
  1. Tranh nảy lần lượt, phù thuỷ chỉ một tranh và nói **từ khoá**.
  2. Phù thuỷ nói **nửa đầu câu** (cắt từ file câu mẫu, chỗ ngắt hơi đo sẵn: 173 câu), con nói nốt. Câu không có chỗ ngắt thì lên bậc 3.
  3. Phù thuỷ nói **cả câu mẫu**, con nói theo.
  4. Máy nghe không ra 2 lần (hoặc im sau bậc 3): tranh chuyển sang **chạm được**; chạm thì tranh vẫn hiện, phù thuỷ nói câu mẫu, câu này vào Phép thưởng cuối, không tính sai.
  Con chạm một tranh gợi ý bất kỳ lúc nào = nghe câu mẫu của tranh đó rồi nói theo.
- **Chấm theo ý, sửa ngầm:** đủ câu chuẩn → khen to. Đúng ý nhưng khác khung câu / chỉ một từ / từ đồng nghĩa → tranh vẫn hiện, phù thuỷ khen rồi **nhắc lại câu chuẩn**, con không phải nói lại. Nói một câu đã học khác tranh gợi ý → cũng hiện. Nói nhầm thứ tiếng mà máy nhận ra → nhận ý, phù thuỷ nói "That's Chinese! In English, we say: …" / "这是英语哦！中文这样说：…". Tiếng Trung so cả theo **pinyin bỏ dấu** (máy nghe ra chữ đồng âm như 页页 vẫn nhận là 爷爷), không chấm thanh điệu.
- **Thưởng:** tự nói đủ câu không cần gợi ý → pháo sáng lớn; có gợi ý → hiệu ứng nhỏ. Nói hai tranh một hơi → Phép vàng. Một ý nói được cả hai tiếng → Phép đôi (thẻ vào album). Tiến độ: 4 sao (tiếng Anh) + 4 đèn lồng (tiếng Trung) ở góc trên.
- **Đổi ý:** vài giây sau khi tranh hiện có nút "↺ Đổi ý" ở góc con; chạm thì bỏ câu vừa rồi và trả lời lại.
- **Kết lượt:** Leo và Xiaomei cùng hiện, bức tranh con tạo được chụp vào album; Phép thưởng (tối đa 3 câu con mới chạm tranh / nói một phần, xen hai thứ tiếng); +2 ⭐ một lần mỗi ngày. Bỏ phần "Hội thoại nhỏ" và phần ôn mẫu câu đầu trò cũ (thay bằng gợi trước, hỏi sau ở từng câu) để lượt chơi ≤ 3 phút.
- **Lần đầu chơi:** màn "Leo hỏi › Con trả lời › Tranh hiện ra", cô Hươu nói hai câu hướng dẫn; bàn tay mẫu 👆 ở câu hỏi đầu tiên.
- **Bóng nói của con** ở góc dưới bên trái ("🧒 Con"), không đứng chung chỗ nhân vật trong tranh (thay quy tắc "⭐ Con ở giữa phía dưới" ngày 12/11).
- **Câu tiếng Trung** của câu hỏi mới đã qua agent giáo viên tiếng Trung rà: 谁来啦？打个招呼吧！ · 它们会什么？(không dùng 会做什么, dễ hiểu thành "sẽ làm gì") · 数一数，有几个？ · 我们一起做什么？ · 我们要穿什么？戴什么？ · 看！这时候要说什么？(không dùng 你说什么 vì nghĩa "con nói gì cơ?") · 这是英语哦！中文这样说：. Theo luật chị đã chốt (khả năng dùng 会), 9 câu đáp án khả năng của LS U8, SD U8 đổi 能 → 会 (小狗会跑, 青蛙不会飞…) cùng câu dài và hội thoại liên quan; 18 file giọng cũ đã bỏ, chờ thu lại.
- **Chị quyết 23/11 (sau khi tra từ điển):** giữ 张大口 (chữ 口 YCT1; 张口 có trong CC-CEDICT/Chinese Notes, chỉ hơi sách vở hơn 嘴巴 – từ HSK 3.0 cấp 5); đổi 这些和那些都是字母 → 这些都是字母 (gọn hơn); đổi 今天晴天 → 今天是晴天 (câu danh từ làm vị ngữ bỏ 是 chỉ dùng cho ngày, giờ, tuổi, giá, quốc tịch; thời tiết dùng 是 cho chắc, khớp câu sửa ý 不是下雨，是晴天). Đã đổi cả game lẫn bài học (truyện LS U10, SD U6, SD U10; kịch bản buổi offline vốn đã dùng 今天是晴天); 7 file giọng câu cũ đã bỏ, 6 câu mới vào hàng chờ thu.
- **"Good try!" → 加油！** (chị duyệt 23/11; 很好 = "rất tốt" không hợp lúc con chưa nói được).
- **Rà từ điển toàn bộ 341 câu tiếng Trung của game (23/11):** mọi từ đều có trong CC-CEDICT; lượng từ đúng theo từ điển (只 狗/猴子/手, 个 蛋糕/鸡蛋, 张 照片, 支 蜡笔); 好困 (好 = 很, zdic), 数一数 (V一V), 啦, 哦 đúng nghĩa từ điển.
- **Giọng:** 289 câu mới cần thu: 213 câu dùng lại giọng có sẵn trên web (từ khoá), 76 câu thu bằng Gemini (câu hỏi, câu chung, 3 câu cô Hươu, 18 câu 能 → 会). Chưa thu thì tạm đọc bằng giọng máy.
- **Kiểm thử:** `kiem-thu/chay.js` (dữ liệu, nhận giọng 463 đạt) + `kiem-thu/choi.js` mới (kế hoạch 4 câu cho 99 ngày × 2 khoá, một lượt trọn từng khoá, gợi ý, chấm theo ý, đổi ý, chữ đồng âm, nhầm thứ tiếng, chạm khi không có micro, màn hướng dẫn): 531 đạt, 0 lỗi. Bản test luật cũ giữ ở `choi_luat_cu_1411.js`.

---

## LỊCH SỬ (bản 11–12/11/2026) – các luật chơi dưới đây ĐÃ THAY bằng luật mới ở trên
**Đã bỏ:** gọi phù thuỷ dậy ("Hi, Leo!" / "你好，Xiaomei！") trước khi ra lệnh · con tự chọn thứ tiếng mỗi lượt · hai phù thuỷ đứng cùng lúc · hàng bong bóng "sách phép" để con tự chọn · câu rút lại "No, no!" / "不，不！" (thay bằng nút ↺ Đổi ý; câu phủ định vẫn dạy trong bài) · phần ôn 6 câu mẫu đầu trò (thay bằng gợi trước, hỏi sau) · "Hội thoại nhỏ" cuối lượt · nhãn "⭐ Con" giữa phía dưới (nay là góc dưới bên trái) · nhắc "I can do magic too!" khi nói một thứ tiếng 3 lần.
**Vẫn giữ:** Phép đôi + album · micro tự mở sau câu mẫu (tiếng "ting") · máy nghe không ra 2 lần thì chuyển sang chạm · Phép thưởng cuối (≤ 3 câu, mỗi câu thử một lần, "Good try!" / "很好！") · +2 ⭐ một lần mỗi ngày · mỗi lượt ≤ 3 phút · chỉ dùng từ đã học · tiếng Trung không chấm thanh điệu · Leo chỉ nói tiếng Anh, Xiaomei chỉ nói tiếng Trung · quy tắc phân vai bóng nói (lời của ai hiện ở người đó; câu gợi ý và lời con hiện ở góc của con).

### Quy tắc đưa trò vào các ngày web (chị chốt 11/11, vẫn áp dụng)
- Mọi ngày web của Little Seed và Seedling (99 ngày mỗi khoá) có nút 🪄 Phép thuật lời nói.
- Chỉ dùng từ và mẫu câu con đã học tới ngày đó; câu của unit đang học + ôn unit trước (ôn xoắn ốc); cảnh gồm unit hiện tại + các unit trước.
- Làm theo đợt cho cả khoá rồi đẩy lên web một lần, không làm lẻ từng unit.
- Làm một lần cho cả chương trình: mũ + đũa phép cho Leo và Xiaomei (vẽ thêm phụ kiện, không tạo nhân vật mới), tiếng "ting" mở micro.

### Kết quả rà khung (11/11)
- Little Seed: 99/99 ngày có ít nhất một loại đổi hình rõ (gia đình 47 ngày, cảm xúc 43, động vật 40, lời chào 37, hành động 31, đồ ăn 31, số 27, đồ vật 27, vị trí 22, cơ thể 19).
- Seedling: 61/99 ngày có trong từ mới của ngày; 38 ngày còn lại (cả truyện, ôn, kiểm tra) chơi ôn bằng từ của unit.
- Nhóm theo unit: U1 chào hỏi · U2 số/tuổi · U3 gia đình · U4 cơ thể + hành động · U5 cảm xúc · U6 đồ dùng học tập · U7 vị trí · U8 động vật + khả năng · U9 đồ ăn · U10 thời tiết + quần áo · U11 màu · U12 số, tiệc.

### Kỹ thuật (vẫn đúng)
- Nhận giọng của trình duyệt (Web Speech API, lấy 5 kết quả gần đúng): Chrome (máy tính, Android), Safari (iPad, iPhone); không chạy trên Firefox; cần mạng.
- Giọng con được gửi tới Google (Chrome) hoặc Apple (Safari) để nhận chữ → cần ba mẹ đồng ý; có nút tắt micro, khi tắt thì chơi bằng chạm.
- Tệp: `seedling/phep-thuat.js` (dùng chung hai khoá), `seedling/phep-thuat-du-lieu.js` (sinh tự động từ `chuong-trinh/phep-thuat/sinh_du_lieu.py`, không sửa tay), `phep-thuat.css` ở `seedling/` và `little-seed/`; lớp CSS tên `pt-*`.
