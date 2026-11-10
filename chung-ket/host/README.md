# Luyện host – Chung kết Rung chuông vàng

Trang luyện câu dẫn tiếng Anh và tiếng Trung cho host, theo tài liệu "Kịch bản ngôn ngữ cho Host – Chung kết Rung chuông vàng" (10/11/2026).

| Ai dùng | Link |
|---|---|
| Host luyện (Chrome, máy có micro, nên đeo tai nghe) | https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/chung-ket/host/ |
| Chị xem kết quả, nghe lại bản ghi | …/chung-ket/host/?ket-qua |
| Thử không cần máy chấm (chấm tạm bằng Chrome) | …/chung-ket/host/?mock=1 |
| Thử tự động không cần micro | …/chung-ket/host/?gia-lap=1 |

## Host làm gì
1. **Nghe mẫu** từng câu (tiếng Trung luôn kèm pinyin).
2. **Luyện từng câu với AI**: bấm Nói (hoặc phím cách), máy tự dừng khi host ngừng nói. Gemini nghe bản ghi, chấm Nội dung, Phát âm, Thanh điệu (tiếng Trung), Ngữ điệu; chỉ ra từ bị lỗi và một lời nhận xét. Đạt khi đúng câu, nội dung ≥ 85, phát âm ≥ 75, thanh điệu ≥ 75.
3. **Kiểm tra tình huống**: tình huống bằng tiếng Việt, ghi rõ phải nói tiếng Anh hay tiếng Trung, có câu phải nói liền 2–3 câu. Micro tự nghe; thời gian từ lúc hiện tình huống đến lúc host mở miệng là phản xạ (quá 5 giây tính chậm). Mỗi câu được nói lại 1 lần.

## Lộ trình 4 lần (HOST_LAN trong host-data.js)
| Lần | Phải luyện đạt trước | Bài kiểm tra | Cần đúng |
|---|---|---|---|
| 1 | Tất cả câu ★, cả hai tiếng (170 mục) | 20 tình huống, chỉ câu ★ | 80% |
| 2 | Câu ☆ và câu chưa vững (dưới 85 điểm) | 25 tình huống | 80% |
| 3 | Câu điểm còn thấp và câu nói sai ở bài trước | 30 tình huống, có câu ghép | 85% |
| 4 | Như lần 3 | 40 tình huống, tổng duyệt | 90% → **Sẵn sàng lên sóng** |

Làm lại bài kiểm tra luôn là đề mới: ưu tiên tình huống chưa gặp và tình huống sai lần trước, đổi cách hỏi (mỗi tình huống có 2–3 cách hỏi), đổi tiếng so với lần trước, xáo thứ tự. Câu nói sai trong bài kiểm tra tự vào danh sách cần luyện của lần sau.

Ngân hàng: 110 câu × 2 tiếng = 220 mục luyện; 113 tình huống, phủ đủ 110 mã câu.

## Máy chấm AI (làm 1 lần)
Trang hướng dẫn từng bước, có nút chép code và ô kiểm tra: …/chung-ket/host/cai-may-cham.html. Dự án Apps Script riêng `may-cham-host.gs` (không đụng máy chủ web học). Cách bật cũng ghi ở đầu tệp: dán code, thêm Thuộc tính tập lệnh `GEMINI_KEY`, triển khai Ứng dụng web, gửi URL /exec để gắn vào dòng `HOST_API` trong `host.js`.
Chưa gắn URL thì trang vẫn chạy, chấm tạm bằng máy nhận giọng của Chrome (chỉ so chữ, không chấm thanh điệu).

## Giọng mẫu
`tao-giong-host.py <tệp khoá>` thu 220 câu bằng Gemini TTS (giọng Puck), lưu vào `audio/` và tự cập nhật `host-audio.js`. Câu nghe lỗi thu lại riêng: `tao-giong-host.py <tệp khoá> MM1|en K3|zh`. Câu chưa có tệp tạm đọc bằng giọng trình duyệt (ghi "giọng tạm").

## Tài khoản host
Chị cấp tài khoản trong Sheet [Máy chấm host – Chung kết](https://docs.google.com/spreadsheets/d/1-Bl-tWBxyhrmfo4usGP0mCkEOxbqZQ9CLFurJMyskhk/edit), tab **Tài khoản host** (Tài khoản · Mật khẩu · Tên host · Đang dùng · Ghi chú). Thêm host = thêm dòng; khóa = ghi "không" ở cột Đang dùng; có hiệu lực sau tối đa 1 phút, không cần triển khai lại. Máy chủ kiểm tra tài khoản ở mỗi lần đăng nhập và mỗi lần chấm.

## Dữ liệu (Firebase `anh-trung-kids-zoom`, phòng `rooms/HOSTCK`, luật bảo mật bản 1 không cần sửa)
- `players/<máy>`: tài khoản, tên, lần đang luyện, đã sẵn sàng chưa (trang kết quả lấy danh sách tài khoản từ đây).
- `answers/acc_<tài khoản>/<máy>`: toàn bộ tiến độ và phản hồi AI. Mở trang (hoặc quay lại tab) web tự lấy bản mới nhất trong mọi máy của tài khoản đó.
- `answers/ghi_<bài>/<máy>`: bài kiểm tra kèm bản ghi âm từng câu để chị nghe ở `?ket-qua`.

## Tệp
- `host-data.js` – câu (mã khớp tài liệu), tình huống kiểm tra, lộ trình 4 lần. Sửa câu ở đây.
- `host.js` – trang luyện, ghi âm, chấm, ra đề, trang kết quả. `host.css`, `index.html`.
- `host-audio.js` – danh sách giọng mẫu (sinh tự động). `audio/` – tệp giọng.
- `may-cham-host.gs` – máy chấm AI (Apps Script riêng). `tao-giong-host.py` – thu giọng mẫu.
