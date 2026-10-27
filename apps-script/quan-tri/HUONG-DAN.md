# Trang quản trị Anh-Trung-Kids (bản có tài khoản, từ 26/10/2026)

**Link trang quản trị:** https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/quan-tri/

- Đăng nhập bằng **tên đăng nhập + mật khẩu**, không cần tài khoản Google, không còn bước "cấp quyền".
- Trang nói chuyện với **chính máy chủ web học** (dự án Apps Script "Anh-Trung-Kids – Máy chủ web học", link `…AKfycbwsLupV…/exec`). Phần quản trị nằm ở tệp `apps-script/QuanTri.gs` trong cùng dự án đó.
- Dữ liệu vẫn chỉ nằm trong Sheet "Anh-Trung-Kids – Dữ liệu dự án". Trang GitHub không chứa dữ liệu nào; phải đăng nhập mới tải được.
- Dự án Apps Script riêng "Anh-Trung-Kids – Quản trị" (các tệp trong thư mục này: Code.gs, TrangQuanTri.html) **không dùng nữa**. Có thể xóa bản triển khai `AKfycbzmjn…` của nó.

## Cập nhật máy chủ (mỗi khi có bản mới)
1. `https://script.google.com/u/2/home` (tài khoản anhtrung.home) → dự án **Anh-Trung-Kids – Máy chủ web học**.
2. Tệp `Code.gs`: dán đè `apps-script/Code.gs`. Tệp **QuanTri.gs** (＋ → Tập lệnh, tên `QuanTri`): dán đè `apps-script/QuanTri.gs`. **Lưu**.
3. **Triển khai → Quản lý các bản triển khai** → bút chì → Phiên bản: **Phiên bản mới** → **Triển khai**. Link /exec giữ nguyên.
4. Kiểm tra: mở link /exec thêm `?action=ping`, thấy `"v":8` là đúng (bản có việc theo vai trò).

## Việc theo vai trò: CTV · Sale · Cố vấn (từ 27/10/2026, máy chủ `v:8`)

Trang tự sinh việc theo **bản đồ điểm chạm** và chia theo ba cấp. Cần dán lại cả `Code.gs` và `QuanTri.gs` rồi triển khai **Phiên bản mới** (ping thấy `"v":8`). Khi máy chủ chưa cập nhật, trang vẫn chạy như cũ.

| Vai trò (cột C tab Đội) | Thấy gì ở Việc hôm nay | Làm được |
| --- | --- | --- |
| **CTV** | Hàng việc CTV của mọi gia đình (nhắn tin mẫu), xếp theo hạn trong ca | Tin mẫu, Zalo, "✓ Đã gửi tin", "↗ Chuyển sale", ghi ô ① và ④ của thẻ, mở khóa cho gia đình đã ghi nhận đóng phí. Không có nút Gọi, không đổi trạng thái, không sửa thông tin |
| **Sale** (và **Vận hành** cũ) | Việc của sale cho gia đình mình phụ trách: gọi gia đình nóng, khảo sát 2–3 phút, phiếu nhu cầu, tư vấn, vét sau chung kết, mời giới thiệu | Mọi việc với gia đình mình, điền Thẻ 6 ô, "🙋 Xin ý kiến cố vấn" |
| **Cố vấn** | Mặc định lọc "Cần cố vấn quyết": xin ý kiến, giao người, việc quá hạn hơn 24 giờ. Đổi bộ lọc để xem hàng CTV, việc sale hoặc từng người | Giao người phụ trách, "✓ Cố vấn trả lời", điền Thẻ |
| **Quản lý** | Như Cố vấn, thêm Báo cáo và Tài khoản | Mọi việc |

- Việc CTV luôn tách riêng, kể cả khi chưa có tài khoản CTV. Quản lý, Cố vấn chọn nhanh hàng việc bằng các nút **Tất cả · CTV · Sale · Cố vấn** cạnh nút "Chỉ học thử".
- **Chia gia đình mới**: máy chủ web học chia cho người có vai trò **Vận hành** hoặc **Sale** và "Nhận gia đình mới" = TRUE. CTV, Cố vấn không nhận.
- **Việc tự đóng**: bấm "Ghi kết quả" hoặc "✓ Đã gửi tin" từ đúng thẻ việc, trang ghi mã việc vào cột R ("Việc") của tab Nhật ký cuộc gọi, việc đó biến mất.
- **Nhóm A–E** tự xếp: A gia đình nóng hoặc ba mẹ nhắn lại / được chuyển sale · B học đều · C nghỉ học từ 2 ngày · D học thử chưa kích hoạt · E nuôi dưỡng. Sale, Cố vấn chọn tay được trong Thẻ.
- **Thẻ 6 ô** (bối cảnh, câu JTBD Khi / Tôi muốn / Để, nỗi đau, rào cản, kết quả + cách đo, vì sao cần ngay, 4 lực) lưu ở tab mới **Thẻ gia đình**.
- **Tiến độ 21 ngày** của bé được nối với gia đình theo số điện thoại + tên con (giống cách web học đặt mã bé), nên trang biết bé nghỉ mấy ngày.
- Tab **Cài đặt quản trị** có thêm "Ngày bắt đầu 21 ngày" (2026-10-26) và "Ngày chung kết" (để trống = ngày thứ 22). Việc theo tuần tính từ hai mốc này. Việc mới bắt đầu tính hạn từ 9:00 ngày 28/10/2026.
- Tin mẫu mới tự thêm vào tab **Tin mẫu Zalo**: `boi_canh`, `hen_khao_sat`, `hoi_so_1`, `hoi_so_2`, `keo_nhip`, `thu_giua`, `phieu_nhu_cau`, `bao_cao`, `vet`, `gioi_thieu`, `ngoai_tuoi`. Sửa nội dung ngay trên Sheet; riêng `hoi_so_2` nên thay bằng các câu JTBD đội gom được ngày 2/11.

| Mã việc | Ai | Khi nào sinh |
| --- | --- | --- |
| `chao`, `moi`, `phi` | Sale nếu gia đình nóng, CTV nếu không | Như cũ; việc CTV hạn trong ca (4 giờ làm việc) |
| `mo` | CTV (đã đóng phí) · Sale (ba mẹ bấm Kích hoạt, cần kiểm tra chuyển khoản) | Như cũ |
| `ngoai_tuoi` | CTV | Bé dưới 5 hoặc trên 10 tuổi, chưa mở khóa |
| `chuyen` · `giao` | Sale có người phụ trách · Cố vấn nếu chưa có | CTV ghi "Chuyển sale", sale chưa liên hệ lại |
| `xin` · `tra_loi` | Cố vấn · Sale | Sale ghi "Xin ý kiến cố vấn" · Cố vấn ghi "Cố vấn trả lời" |
| `boi_canh` | CTV | Đã mở khóa, thẻ chưa có ô ① |
| `khao_sat` | Sale | Nhóm A, có người phụ trách, 14 ngày đầu |
| `hoi_so_1`, `hoi_so_2` | CTV | Nhóm B, C, từ ngày thứ 3 của tuần 1 và tuần 2 |
| `keo_nhip` | CTV | Bé nghỉ từ 2 ngày (hoặc mở khóa 2 ngày chưa vào học) |
| `thu_giua`, `phieu_nhu_cau`, `bo_sung_the` | CTV · Sale (nhóm A) · Sale | Từ ngày 15 (9/11) |
| `bao_cao`, `vet_1..3` | CTV · Sale | Ngày 1–7 sau chung kết; vét ngày 1, 3, 6 |
| `gioi_thieu` | Sale | 3 ngày sau khi chuyển "Học viên khóa dài" |

## Tài khoản
- **Tài khoản đầu tiên:** mở trang, nhập **Mã thiết lập** lấy ở Sheet → tab **Cài đặt quản trị** → dòng **Mã thiết lập tài khoản**, rồi chọn tên đăng nhập và mật khẩu. Tài khoản này là **Quản lý**. Mã tự đổi sau mỗi lần dùng.
- **Thêm bạn trong đội:** Quản lý vào tab **Tài khoản** → **Tạo tài khoản** → trang cấp một mật khẩu tạm, chép tin nhắn gửi riêng cho bạn đó. Lần đầu đăng nhập, bạn ấy phải đặt mật khẩu riêng.
- **Quên mật khẩu:** Quản lý bấm **Cấp mật khẩu tạm**. Quản lý tự quên mật khẩu: dùng lại Mã thiết lập trong Sheet ("Lần đầu dùng hoặc quên mật khẩu?").
- Tài khoản lưu ở tab **Đội** (cột A–D như cũ: Tên đăng nhập, Tên, Vai trò, Nhận gia đình mới; thêm E–I). Mật khẩu chỉ lưu dạng đã mã hóa.
- Bạn Vận hành **không cần quyền mở Sheet** nữa. Chỉ Quản lý giữ quyền Sheet, vì ai mở Sheet cũng đọc được Mã thiết lập.
- Nhập sai mật khẩu 6 lần: tài khoản tạm chặn 15 phút. Phiên đăng nhập hết sau 6 giờ không dùng.

## Sổ tay chăm sóc phụ huynh (tab Sổ tay, cả đội xem được)
- Nội dung nằm ở tệp `quan-tri/so-tay.json`: 10 block (điểm chạm và mảng việc nội bộ), sơ đồ tổng quan, câu hỏi thường gặp kèm câu trả lời mẫu, nhật ký thay đổi.
- Tab Sổ tay tự đọc tệp này; sửa tệp và đẩy lên GitHub là trang đổi theo sau 1–2 phút. Không cần cập nhật máy chủ Apps Script.
- **Cập nhật tự động 18:00 mỗi ngày (giờ Việt Nam):** một việc định kỳ rà các thay đổi trong ngày (mã nguồn web học, trang quản trị, trang ưu đãi, quyết định mới của dự án). Có thay đổi ảnh hưởng tới hệ thống hoặc điểm chạm với phụ huynh thì sửa block, câu hỏi liên quan và ghi một dòng vào Nhật ký thay đổi; không có thì không sửa gì.
- Câu hỏi có `"duyet": true` hiện nhãn vàng "Cần Quản lý duyệt": Quản lý chốt câu trả lời rồi bỏ nhãn.
- Tệp này công khai trên GitHub: **không ghi tên, số điện thoại hay dữ liệu gia đình** vào đây.
- Bản dài để đọc và bình luận: https://claude.ai/artifact/Nri2gNd4ZaoDVnmR95izMS

## Báo cáo (chỉ Quản lý)
Số đóng phí và doanh thu, đăng ký, bé học hôm nay, bé nghỉ từ 2 ngày; tuyển sinh theo ngày; số bé học mỗi ngày; phễu chuyển đổi; hiệu quả theo mã CTV; tiến độ 21 ngày theo nhóm; phân bố số buổi đã học; danh sách bé cần nhắc; đăng ký theo nhóm, kênh biết đến, tuổi; gia đình theo trạng thái; đội vận hành. Lọc 7 ngày / 14 ngày / cả đợt, mỗi biểu đồ có "Xem dạng bảng", các bảng chính tải được CSV.

---

# Ghi chép cũ (bản đăng nhập Google, đã thay)

# Bật máy chủ mới, trang quản trị và trang cuộc thi (tài khoản anhtrung.home@gmail.com)

Mọi dữ liệu của dự án nay nằm trong **một Sheet** thuộc Drive của **anhtrung.home@gmail.com**:
"Anh-Trung-Kids – Dữ liệu dự án" (mã `1QQnbTRwpbu6wGmrtnbwAW0VVyyk1AA7xlHQb_GwFOic`).
Sheet mới bắt đầu trống và đang ở chế độ **Bị hạn chế** (chỉ người được thêm mới mở được). Các Sheet cũ (DATA Dự án, Tiến độ & Bảng vàng của Duyên) không còn nhận dữ liệu mới sau khi làm xong bước 2.

## Trạng thái

| Việc | Trạng thái |
| --- | --- |
| Tạo Sheet "Anh-Trung-Kids – Dữ liệu dự án" trong Drive anhtrung.home | Xong |
| Tạo dự án Apps Script "Anh-Trung-Kids – Máy chủ web học" (anhtrung.home), dán `apps-script/Code.gs` bản mới, lưu | Xong |
| Triển khai máy chủ thành ứng dụng web (`…AKfycbwsLupV…/exec`, ping trả `v:3`) | Xong 23/10 |
| Đổi link máy chủ trong web học | Xong |
| Đổi link máy chủ trong tệp trang cuộc thi | Xong trong tệp, chờ tải lên kho Ceseducation |
| Tạo trang quản trị | Chưa |
| Tải trang cuộc thi mới lên kho Ceseducation | Chưa |

Trong lúc chờ, web học vẫn chạy với máy chủ cũ như trước. Cổng Zalo sau buổi 1 tự ẩn cho tới khi web học trỏ sang máy chủ mới.

## Lưu ý khi Chrome đăng nhập nhiều tài khoản Google

Apps Script hay báo "Không thể mở tệp" khi Chrome đăng nhập nhiều tài khoản. Luôn mở bằng link có `/u/2/` (số thứ tự của anhtrung.home trong Chrome), ví dụ: `https://script.google.com/u/2/home`. Nếu vẫn lỗi, mở một cửa sổ ẩn danh chỉ đăng nhập anhtrung.home.

## Bước 1. Triển khai máy chủ (khoảng 3 phút)

1. Mở `https://script.google.com/u/2/home` bằng anhtrung.home → dự án **Anh-Trung-Kids – Máy chủ web học**.
2. **Triển khai → Tùy chọn triển khai mới** → biểu tượng bánh răng cạnh "Chọn loại" → **Ứng dụng web**.
3. Thực thi với tư cách: **Tôi (anhtrung.home@gmail.com)**. Ai có quyền truy cập: **Bất kỳ ai**.
4. **Triển khai** → **Cấp quyền truy cập** → chọn anhtrung.home → **Nâng cao → Đi tới … (không an toàn) → Cho phép**. Đây là ứng dụng tự làm nên Google chưa xác minh, bình thường.
5. Chép **URL ứng dụng web** (đuôi `/exec`) gửi cho Claude. Claude sẽ tự đổi link trong web học và trong tệp trang cuộc thi.

Kiểm tra: mở link /exec, thêm `?action=ping` vào cuối, thấy `{"ok":true,"v":3}` là đúng.

## Bước 2. Trang quản trị (Claude làm được qua Chrome, hoặc tự làm khoảng 5 phút)

1. `https://script.google.com/u/2/home` → **Dự án mới**, đặt tên `Anh-Trung-Kids – Quản trị`.
2. Tệp `Code.gs`: dán [`apps-script/quan-tri/Code.gs`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/Code.gs).
3. **＋ → HTML**, tên `TrangQuanTri`, dán [`apps-script/quan-tri/TrangQuanTri.html`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/TrangQuanTri.html).
4. **Cài đặt dự án** → tích "Hiển thị tệp kê khai appsscript.json" → dán [`apps-script/quan-tri/appsscript.json`](https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/blob/main/apps-script/quan-tri/appsscript.json). **Lưu**.
5. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**: Thực thi với tư cách **Người dùng truy cập ứng dụng web**; Ai có quyền truy cập **Bất kỳ ai có Tài khoản Google**. Triển khai, cho phép quyền như bước 1.4.
6. Mở URL trang quản trị bằng anhtrung.home: trang tự tạo các tab Đội (anhtrung.home là Quản lý), Gia đình, Tin mẫu Zalo, Cài đặt quản trị, Nhật ký mở hồ sơ.

## Bước 3. Cho đội vào trang quản trị

Trang quản trị chạy bằng tài khoản của chính người mở, nên mỗi bạn cần **hai thứ**:

1. Quyền **Người chỉnh sửa** Sheet "Anh-Trung-Kids – Dữ liệu dự án" (nút Chia sẻ, thêm email).
2. Một dòng trong tab **Đội**: Email | Tên (đúng như cột "Người hỗ trợ") | Vai trò (`Quản lý` hoặc `Vận hành`) | Nhận gia đình mới (`TRUE` / `FALSE`).

Không bật "Bất kỳ ai có đường liên kết" cho Sheet này: trong đó có số Zalo của ba mẹ.

## Bước 4. Trang cuộc thi (kho Ceseducation/little-language-explorers)

Làm sau khi Claude đã đổi link máy chủ trong tệp `index.html` (sau bước 1).

- Cách nhanh nhất: cho ứng dụng Claude trên GitHub quyền ghi vào kho này, Claude tự đẩy lên.
- Hoặc tự làm: vào kho → **Add file → Upload files** → kéo tệp `index.html` Claude gửi → **Commit changes**. Đợi 1–2 phút, gửi thử một đơn "TEST", đơn hiện ở tab **Đăng ký Web** của Sheet mới.

## Một link cho ba mẹ và ô "Mở khóa 21 ngày"

Ba mẹ chỉ dùng **một link** từ đầu đến cuối: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/ (link CTV thêm `?ref=CTV05`; link /demo/ cũ vẫn chạy và dẫn về cùng chỗ).

- Chưa mở khóa: bé học 3 buổi đầu (bản học thử), có cổng Zalo sau buổi 1.
- Đội tick **Mở khóa 21 ngày** (trên trang quản trị, hoặc thẳng ở cột X tab Gia đình): lần sau ba mẹ mở link, web tự chúc mừng và mở đủ 21 ngày, giữ nguyên các buổi đã học. Gia đình không để lại Zalo thì bấm "Ba mẹ đã đóng phí? Đăng nhập", nhập tên con và số đã đăng ký.
- Bỏ tick: lần mở sau, máy đó quay về bản học thử (cột "Mở khóa lúc" ghi "Khóa …" để không tự mở lại).
- Gia đình đã tick "Đã đóng phí" ở tab Đăng ký Web (Sheet mới) hoặc Sheet DATA cũ được mở sẵn, không cần tick thêm; trang quản trị nhập họ vào tab Gia đình với ô đã tick.
- Kết quả mở/khóa có hiệu lực sau tối đa khoảng 1 phút.

## Trang quản trị làm gì, chưa làm gì

**Đã có**
- Việc hôm nay xếp theo độ gấp: gọi lại theo hẹn; gọi chào gia đình vừa để lại Zalo (hạn 1 giờ trong giờ làm việc, ngoài giờ là 9:00 sáng hôm sau); mời đăng ký theo làn nóng, ấm, lạnh (48 giờ trước hạn thì gia đình ấm cũng được gọi); nhắc đóng phí kèm số giờ còn lại; gửi link học chính khi gia đình vừa đóng phí.
- Gia đình chưa đồng ý được tư vấn không bao giờ bị xếp việc mời đăng ký hay nhắc phí.
- Mỗi việc có nút Gọi, mở Zalo, tin mẫu điền sẵn tên ba mẹ, tên con, số buổi, link đăng ký mang mã CTV và mã gia đình.
- Hồ sơ gia đình: điểm và lý do từng điểm, các bước học thử của bé, lịch sử liên hệ, đổi trạng thái (Dừng và Nuôi dưỡng bắt buộc chọn lý do), hẹn gọi lại, giao người.
- Số liệu (chỉ Quản lý): phễu 8 bước, phễu theo mã CTV, thời gian từ lúc để lại Zalo đến cuộc gọi đầu, việc của từng người, phiếu đổi quà chờ duyệt.
- Đơn trên trang cuộc thi tự gộp vào gia đình đã học thử: khớp theo mã gia đình, nếu không có thì theo số điện thoại.

**Chưa có, làm trong 21 ngày học**
- Màn hình giáo viên Zoom và CTV.
- Việc "bé nghỉ 3 ngày", "đã đóng phí nhưng chưa vào học": cần nối tài khoản học chính với mã gia đình.
- Khớp chuyển khoản tự động: vẫn tick tay ô "Đã đóng phí".

## Chép tài khoản cho ba mẹ (26/10/2026)
- Tab **Gia đình**: mỗi dòng có nút **📋 Chép tài khoản** bên cạnh ô Mở khóa 21 ngày. Bấm một lần là chép sẵn tin gồm link học, tên con, số đăng nhập và 3 bước đăng nhập; dán vào Zalo gửi ba mẹ.
- Tài khoản của bé = **tên con + số điện thoại đã đăng ký**. Ba mẹ phải nhập đúng tên con như trong tin mỗi lần đăng nhập.
- Bé chưa được mở khóa thì vẫn chép được, nhưng trang nhắc tick Mở khóa 21 ngày trước khi gửi.
- Mở hồ sơ gia đình có ô **Tài khoản đăng nhập**: xem trước và sửa tin (ví dụ ba mẹ gõ tên con khác) rồi bấm Chép.
- Gia đình chưa có số hợp lệ thì nút hiện "Chưa có số".

## Lọc SĐT, tạo tài khoản, xoá dòng trùng (26/10/2026)
- Tab **Gia đình** có ô **Lọc theo SĐT**: gõ vài số là lọc (bỏ qua dấu cách, +84, số 0 đầu).
- Chip **⚠ Trùng SĐT** hiện khi một số có nhiều dòng; các dòng cùng số xếp cạnh nhau. Quản lý bấm **Gộp tất cả** (mỗi số giữ một dòng) hoặc mở hồ sơ → **🗑 Xoá dòng này**.
  Dòng bị xoá được gộp vào dòng còn lại (giữ mở khóa, trạng thái xa hơn, tên các con, ghi chú, nhật ký cuộc gọi); bản sao lưu ở tab **Gia đình đã xoá**.
- Nút **＋ Tạo tài khoản**: tạo gia đình đăng ký ngoài web, tick sẵn Mở khóa 21 ngày; tạo xong mở hồ sơ để chép tin đăng nhập. Số đã có thì trang báo và mở hồ sơ cũ.
- Nguyên nhân dòng trùng cũ: trang quản trị cũ (đăng nhập Google, `apps-script/quan-tri/`) và trang mới cùng đồng bộ đơn đăng ký; số mất số 0 đầu không khớp. Đã sửa ở máy chủ mới; nên **ngừng triển khai trang quản trị cũ**.
- Cần dán `apps-script/QuanTri.gs` mới vào dự án Apps Script máy chủ và triển khai phiên bản mới thì Tạo tài khoản và Xoá dòng trùng mới chạy.
- **Sửa thông tin** (hồ sơ gia đình → ✏️ Sửa thông tin): sửa tên ba mẹ, SĐT, tên con, tuổi, khoá, mã CTV ngay trên trang. Dữ liệu gốc vẫn ở Sheet để đối chiếu: các tab đơn đăng ký không đổi, mỗi thay đổi ghi giá trị cũ → mới vào tab **Lịch sử sửa**. Đồng bộ đơn đăng ký đọc tab này nên không tạo lại dòng theo số cũ và không ghép lại tên con cũ. Số mới trùng số gia đình khác thì trang chặn và gợi ý gộp.
