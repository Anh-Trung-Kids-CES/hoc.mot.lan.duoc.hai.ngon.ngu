# Little Language Explorers – Web học tập 21 ngày

Web tự học cho Thử thách 21 ngày Bật phản xạ Anh – Trung (CES Vietnam).
2 level: **Little Seed** (bé mới bắt đầu) và **Canopy** (bé có tiếng Anh A1, tiếng Trung YCT 1). Mỗi level 3 vòng, mỗi vòng 6 ngày tự học và 1 buổi học trực tuyến.

## Cấu trúc
- `index.html` – khung web: trang chủ, bản đồ, điểm, Bảng vàng, ngày Zoom
- `ls-data.js`, `ls.js`, `ls.css` – Little Seed: 18 ngày, 6 dạng bài (Xem và làm theo, Chạm đúng hình, Nói theo, Anh hay Trung?, Đố con, Nhìn chữ)
- `canopy-data.js`, `canopy.js`, `canopy-games.js`, `canopy-speak.js`, `canopy.css` – Canopy: 18 ngày, 13 dạng bài
- `xem-them.js` – Góc khám phá thêm (video, game chơi cùng ba mẹ) của từng vòng
- `tai-nguyen/` – hình (nét 2D) và giọng đọc của từng nhân vật; `tai-nguyen/canopy-audio-map.js` nối lời với file giọng Canopy
- `dien-thoai.css` – bố cục điện thoại (cầm dọc: thanh nút dưới đáy, bản đồ kéo ngang; nằm ngang: bài học gọn một màn)
- `.nojekyll` – giúp GitHub Pages phục vụ file nguyên trạng

## Sửa nội dung
- Little Seed: dữ liệu được sinh tự động từ Google Doc "Little Language Explorers – Thiết kế chuyên môn 21 ngày" và `tai-nguyen/*_manifest.json`.
- Canopy: theo Google Doc "Canopy – Logic bài tập tự học 3 vòng × 6 ngày" (bản 20/10/2026).
- Trong `index.html`: `ZALO_LINK`, `ZOOM_LINK`, `SCORE_API` (Bảng vàng Top 10).

## Chế độ giáo viên
Thêm `?gv=1` vào cuối link, hoặc bấm "Chế độ giáo viên" ở cuối trang chủ, để mở tất cả các ngày mà không cần nhập tên.
Tiến độ ở chế độ giáo viên lưu riêng (`lle-progress-gv`), không cộng vào điểm và ngày của bé trên cùng máy, và không gửi lên Bảng vàng.

## Cập nhật 21/10/2026 (sửa theo báo cáo của team tester)
- **Âm thanh**: cắt tiếng "rẹt" ở cuối 68 file giọng đọc (Little Seed 23, Canopy 45); dựng lại file 去公园 (chữ 园 bị đọc hỏng). Truyện Canopy đọc từ một bản thu liền cả truyện (`tai-nguyen/canopy-story-times.js`) nên giọng đều từ đầu đến cuối.
- **Đăng nhập không mật khẩu**: tên con + SĐT hoặc Gmail của bố mẹ. Để học tiếp trên máy khác, cần bật máy chủ Apps Script: làm theo hướng dẫn ở đầu file `apps-script/Code.gs`, rồi dán link vào `SCORE_API` trong `index.html` (cùng link này bật luôn Bảng vàng). Chưa có link thì tiến độ vẫn lưu trên máy đang dùng.
- **Màn "Chạm để bắt đầu"** khi mở web (mở khoá âm thanh) và **hướng dẫn lần đầu** có giọng đọc (nút "Xem hướng dẫn" ở trang chủ để xem lại).
- **Bản đồ khám phá mới**: 3 chặng nối liền, mỗi chặng 6 buổi trên đường uốn lượn, có tên và mô tả chủ đề; buổi Zoom ở cuối chặng, không chặn buổi sau.
- **Góc khám phá**: 2 video gợi ý ngay trên bản đồ và sau khi học xong buổi.
- **Mở buổi học**: cô Hươu tự đọc "Hôm nay con học gì" và lời nhắn cho ba mẹ; nút xanh "Bắt đầu".
- **Luật chơi từng bước** (thẻ có hình + giọng đọc) trước mỗi bước Little Seed và mỗi bài Canopy.
- **Nút ⏸ Dừng / ⏮ Câu trước** trong bài Little Seed.
- **Thu giọng con**: micro tự bật, chấm đỏ "Đang thu", tự dừng khi con nói xong, phát lại giọng con rồi tự sang câu tiếp (Little Seed: Nói theo, Đố con; Canopy: Luyện nói).
- **Nhiệm vụ chia sẻ**: quay clip gửi nhóm Zalo sau mỗi buổi (+10 điểm khi ba mẹ bấm "Đã gửi clip").
- **Canopy**: nút loa nằm trong ô đáp án (trước đây trình duyệt đẩy loa ra ngoài ô).
- **Video Little Seed**: nhãn "Xem bằng tiếng Anh / tiếng Trung"; có link dự phòng khi video Drive không chạy. Muốn video nét và tự phát: nén video thành `.mp4`, đặt vào `tai-nguyen/video/` và khai báo trong `window.LS_VIDEO_LOCAL` (mã Drive → tên file).
- Lời hướng dẫn mới chưa có file thu giọng cô Hươu thì đọc bằng giọng tiếng Việt của máy. Khi thu xong, khai báo trong `window.HD_FILES` ("câu" → "đường dẫn file mp3").

## Cập nhật 22/10/2026 (tối ưu điện thoại)
- **Điện thoại cầm dọc dùng được ngay**, bỏ màn bắt xoay ngang. Thanh nút bên trái chuyển xuống đáy màn hình; trang chủ, buổi học, phòng đổi quà, hành trình xếp dọc và cuộn được.
- **Bản đồ trên điện thoại dọc**: tranh giữ đúng tỉ lệ, con kéo ngang để xem; web tự cuộn tới buổi đang học.
- **Điện thoại nằm ngang**: ẩn tiêu đề buổi khi đang làm bài, thu gọn khung và nút; video, tranh, quiz, thẻ lật, luyện nói xếp hai cột để vừa một màn hình.
- Bản học thử: dải "Đăng ký" nằm ngay trên thanh nút, không che bài.

## Cập nhật 23/10/2026 (cổng Zalo và trang quản trị)
- **Màn nhập tên** (bản cho phụ huynh): thêm một chạm chọn tuổi của con (3–10, trên 10).
- **Cổng Zalo sau buổi 1**: ba mẹ để lại tên và số Zalo để nhận nhận xét buổi đầu của cô; 3 ô đồng ý tách theo mục đích, không tích sẵn; bỏ qua vẫn học tiếp; chỉ hỏi một lần. Có lối vào lại ở bảng mời đăng ký. Cổng chỉ hiện khi máy chủ Apps Script đã là bản mới (`?action=ping` trả `v:2`). Kiểu chữ ở `cong-zalo.css`.
- **Sự kiện học gửi về tab "Truy cập học thử"**: thêm `vao` (quay lại học, 1 lần/ngày), `xong1`, `xong2`, `noi` (lần nói thứ 1, 5, 10, 20), `khoa` (bấm phần bị khóa), `zalo`; `hoc` kèm tuổi.
- **Nút "Đăng ký cho con"** mang theo `fam` (mã gia đình), `ten`, `khoa` sang trang ưu đãi.
- **Trang quản trị** (Việc hôm nay · Gia đình · Số liệu) là dự án Apps Script riêng trong `apps-script/quan-tri/`, đăng nhập Google. Cách bật: `apps-script/quan-tri/HUONG-DAN.md`.

## Cập nhật 23/10/2026 (gộp về một Sheet)
- Mọi dữ liệu (tiến độ, Bảng vàng, đổi quà, sự kiện học thử, Gia đình, đơn đăng ký trang ưu đãi, trang quản trị) nay nằm trong Sheet "Little Language Explorer – Tiến độ & Bảng vàng". Sheet DATA Dự án không còn nhận dữ liệu mới; Sheet mới bắt đầu trống.
- Máy chủ `apps-script/Code.gs` nhận thêm form trang ưu đãi (tab "Đăng ký Web", cùng thứ tự cột như cũ, thêm cột Q "Mã gia đình"); `?action=ping` trả `v:3`.
- Trang ưu đãi (kho Ceseducation) cần đổi `SHEET_ENDPOINT` sang link /exec của máy chủ này; xem `apps-script/quan-tri/HUONG-DAN.md`, bước 3.

## Cập nhật 26/10/2026 (một link, mở khóa 21 ngày)
- **Một link cho ba mẹ**: link gốc `…/hoc.mot.lan.duoc.hai.ngon.ngu/` (và /demo/ cũ) dẫn vào web học. Chế độ học thử (3 buổi) hay đủ 21 ngày không còn tùy link mà tùy kết quả mở khóa của gia đình (`lle-mo-khoa`, hỏi máy chủ `?action=access` mỗi lần mở web).
- Màn nhập tên và bảng mời có lối "Ba mẹ đã đóng phí? Đăng nhập bằng số điện thoại". Gia đình đã để lại Zalo được tự mở khi đội tick, tiến độ học thử được mang sang.
- Máy đã học bản đầy đủ trước khi có một link vẫn học tiếp (máy chủ nhận mã bé có trong tab TienDo). `?gv=1` vẫn là chế độ giáo viên.
- Trang cũ ở gốc chuyển sang `cu/index.html`.

## Cập nhật 27/10/2026 (ô học thử 3 buổi trên màn vào web)
- Màn vào web có **3 ô**: Đăng nhập · Đăng ký cho con · **Học thử 3 buổi miễn phí** (ô đỏ, thay dòng chữ xanh cũ).
- Bấm ô học thử → màn **Tên của con · Con mấy tuổi? · Số điện thoại (Zalo) của ba mẹ**, 1 ô đồng ý bắt buộc (nhắn hướng dẫn và nhận xét) và 1 ô không bắt buộc (tư vấn khoá). Mọi lối vào bản học thử (kể cả link vào thẳng một buổi) đều qua màn này.
- Gửi về Apps Script `action=family` như cổng Zalo → tab **Gia đình**, nguồn "Web học thử", trạng thái "Đang dùng thử", giao người vận hành → trang quản trị hiện việc **Gọi chào** trong *Việc hôm nay*. Tên ba/mẹ ghi tạm "Ba mẹ bé <tên con>", đội sửa trên trang quản trị khi gọi. Không cần cập nhật máy chủ.
- Đã có số điện thoại nên cổng Zalo sau buổi 1 không hỏi lại. Máy đã học thử trước đó: ô đỏ hiện "Con … học tiếp" và vào thẳng.

## Cập nhật 27/10/2026 (kích hoạt 21 ngày sau buổi 2)
- Ô trên màn vào web đổi tên thành **Học thử miễn phí**.
- Bé học xong **buổi 2** (bất kỳ khoá nào): web tự mở bảng **Kích hoạt 21 ngày thử thách** (1 lần), ruy băng dưới màn hình chuyển thành nút đỏ "🚀 Kích hoạt 21 ngày thử thách" để mở lại bất cứ lúc nào. Bảng mời ở các phần bị khoá cũng có nút này.
- Bảng kích hoạt: phí học liệu 79.000đ, 21 ngày gồm 3 buổi học với giáo viên và các buổi bài tập trên web; mã QR chuyển khoản (`tai-nguyen/trang/qr-chuyen-khoan.webp`); nội dung chuyển khoản gợi ý `LLE <TÊN CON> <SĐT>` có nút Chép; nút **Nhắn Zalo đội hỗ trợ** (https://zalo.me/0974840845) tự chép sẵn tin nhắn để ba mẹ dán.
- Bấm nút Zalo được ghi là `bam_dk` (tính điểm Ý định, gia đình lên làn nóng trên trang quản trị).
- Đội nhận ảnh chuyển khoản → tick **Mở khóa 21 ngày** trên trang quản trị → lần mở web sau, máy tự mở đủ 21 ngày theo số điện thoại đã để lại.
- Bỏ dòng hạn đăng ký 25/10 và nút sang trang ưu đãi trong bảng mời của bản học thử.

## Cập nhật 27/10/2026 (danh sách học thử riêng trên trang quản trị)
- Web gửi `nguon:'hocthu'` khi ba mẹ đăng ký ở ô Học thử; máy chủ (`?action=ping` trả `v:6`) ghi thêm 1 dòng vào tab mới **"Đăng ký học thử"** (Thời gian, Mã gia đình, Tên con, Tuổi, SĐT, ĐY tư vấn, Mã CTV, Mã người xem). Gia đình vẫn ở tab Gia đình như cũ.
- Sự kiện mới `kich_hoat` = bấm "Nhắn Zalo đội hỗ trợ" ở bảng Kích hoạt 21 ngày (tính điểm như `bam_dk`).
- Trang quản trị có màn **Học thử**: số liệu (đăng ký, đã vào học, xong buổi 2, bấm kích hoạt, đã mở khóa), lọc theo tiến độ, tải CSV. *Việc hôm nay* có nút lọc "Chỉ học thử" và nhãn Học thử.
- Việc hằng ngày riêng cho gia đình học thử: Gọi chào (trong 1 giờ) → nhắc nếu sau 24 giờ bé chưa vào học → Bé xong buổi 2: mời kích hoạt (chỉ khi ba mẹ đồng ý tư vấn) → Ba mẹ bấm Kích hoạt: kiểm tra chuyển khoản rồi mở khóa. Tin mẫu mới: `chao_thu`, `nhac_thu`, `moi_kich_hoat` (tự thêm vào tab Tin mẫu Zalo).
