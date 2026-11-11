# Máy chủ lớp offline 48 buổi (Little Seed + Seedling)

Một Google Sheet và một link Apps Script dùng chung cho hai web:
- `little-seed/` (mã lớp `ls`), `seedling/` (mã lớp `sd`)
- Sheet: **Lớp offline 48 buổi – Quản lý học sinh và tiến độ (Little Seed, Seedling)**, thư mục Drive "Dữ liệu web Anh - Trung" (link Sheet không ghi ở repo công khai vì Sheet chứa PIN và dữ liệu của con; chỉ chia sẻ Sheet cho người cụ thể, không bật "Bất kỳ ai có đường liên kết").

## Bật máy chủ (làm một lần, khoảng 10 phút)
1. Mở Sheet → **Tiện ích mở rộng → Apps Script**. Đặt tên dự án "Máy chủ lớp offline 48 buổi".
2. Xoá mã có sẵn trong `Code.gs`. Mở [Code.gs](https://raw.githubusercontent.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu/main/apps-script/lop-offline-48/Code.gs), chọn hết (Ctrl+A), chép, dán vào. Bấm **Lưu**.
3. Ở thanh trên, chọn hàm **caiDat** → **Chạy**. Google hỏi quyền: chọn tài khoản → nếu thấy "Google chưa xác minh ứng dụng này" thì bấm **Nâng cao → Đi tới … (không an toàn) → Cho phép**.
4. **Triển khai → Tùy chọn triển khai mới** → bánh răng → **Ứng dụng web**. "Thực thi với tư cách": **Tôi**. "Người có quyền truy cập": **Bất kỳ ai**. Bấm **Triển khai**, chép link kết thúc bằng `/exec`.
5. Dán link vào dòng `const SDL_API = '';` của **cả hai** tệp `little-seed/ls-may-chu.js` và `seedling/seedling-may-chu.js` (hoặc gửi link cho Claude để gắn).
6. Kiểm tra: mở link /exec trên trình duyệt, thấy `{"ok":true,"v":2}` là máy chủ đã chạy.

Sửa mã sau này: dán mã mới → Lưu → **Triển khai → Quản lý triển khai → bút chì → Phiên bản: Phiên bản mới → Triển khai**. Link /exec giữ nguyên.

## Các tab
| Tab | Nội dung |
|---|---|
| CaiDat | PIN của từng lớp. Cô sửa PIN ngay trong ô, không cần sửa mã. |
| HocSinh | Mỗi con một dòng: lớp, mã, tên, tổng sao web, sao trong ví, số ngày web đã học, ngày học gần nhất, lần lưu tiến độ gần nhất. |
| TienDo | Bản lưu đầy đủ tiến độ của con (ngày, bước, sao, Hộp ôn, quà, huy hiệu). Không sửa tay. |
| Thuong | Từng lượt cô thưởng sao. Cột `huy` = x là đã huỷ. |
| DoiQua | Yêu cầu đổi quà thật: `cho` chờ duyệt, `da_trao` đã trao, `tu_choi` không duyệt. |

## Tiến độ không mất khi đổi máy
- Mỗi lần con làm xong một việc, web lưu trên máy và gửi bản đầy đủ lên tab TienDo (gom 5 giây/lần; khi con tắt tab cũng gửi nốt).
- Máy mới: ba mẹ mở lại link cô gửi (`…?con=MÃ`) hoặc nhập mã ở mục Ba mẹ → web lấy bài về rồi học tiếp.
- Hai máy cùng học: máy chủ giữ số phiên bản (cột `v`). Máy gửi bản cũ hơn sẽ nhận bản mới để gộp rồi gửi lại. Khi gộp, web giữ mọi ngày, bước, thẻ Hộp ôn, phiếu quà có ở bất kỳ máy nào. Sao lấy số lớn hơn của hai máy, nên nếu con học xen kẽ hai máy cùng lúc khi mất mạng thì tổng sao có thể thiếu vài sao, không mất ngày học.
- Anh chị em dùng chung một máy: mỗi con mở link của mình, web cất riêng bài của từng con.
- Bảng của cô có nút 🔗 Link cạnh tên mỗi con để chép lại link gửi ba mẹ.

## Giới hạn
- Ai có mã của con thì mở được tiến độ của con đó (mã 6 ký tự ngẫu nhiên). Không ghi họ tên đầy đủ hay thông tin khác của con vào web.
- Mỗi con lưu được khoảng 270.000 ký tự tiến độ (đủ cho 99 ngày web và Hộp ôn).
