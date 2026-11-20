# Cuộc thi mùa 3 – web học 21 ngày + trang quản trị (bản tách riêng)

Bản sao của web học 21 ngày (`xem-truoc/`, cả Little Seed và Canopy) và trang quản trị (`quan-tri/`), chép ngày 20/11/2026 để chạy mùa 3 mà **không ảnh hưởng trang chính**.

- Web học mùa 3: https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/cuoc-thi-mua-3/
- Trang quản trị "Cuộc thi mùa 3": https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/cuoc-thi-mua-3/quan-tri/
- Chế độ giáo viên: thêm `?gv=1`.

## Tách khỏi trang chính thế nào
| Phần | Trang chính | Mùa 3 |
|---|---|---|
| Code web | `xem-truoc/` | `cuoc-thi-mua-3/` (sửa ở đây không đổi trang chính, và ngược lại) |
| Trang quản trị | `quan-tri/` | `cuoc-thi-mua-3/quan-tri/` |
| Máy chủ + Sheet | `apps-script/Code.gs`, Sheet "Anh-Trung-Kids – Dữ liệu dự án" | `apps-script/cuoc-thi-mua-3/`, Sheet riêng mùa 3 (cách bật: `apps-script/cuoc-thi-mua-3/HUONG-DAN.md`) |
| Lưu trên máy của bé | khoá `lle-…` | khoá `lle3-…`: cùng một máy học cả hai bản không lẫn tiến độ, sao, avatar |
| Phiên đăng nhập quản trị | `qt-token` | `qt3-token` |
| Tranh, giọng | `xem-truoc/tai-nguyen/`, `xem-truoc/img/` | **dùng chung** (đọc từ `../xem-truoc/…`) để site không vượt giới hạn 1 GB của GitHub Pages |

Ba tệp nối lời với giọng (`canopy-audio-map.js`, `canopy-story-times.js`, `huong-dan.js`) được chép vào `tai-nguyen-chung/` vì chứa đường dẫn tương đối.
Vì tranh, giọng dùng chung: **đừng xoá hay đổi tên** file trong `xem-truoc/tai-nguyen/`; thêm tranh, giọng mới cho mùa 3 thì đặt trong `cuoc-thi-mua-3/` và trỏ tới đó.

## Việc còn lại trước khi mở mùa 3
1. Bật máy chủ mùa 3 và dán link `/exec` vào `SCORE_API` (`index.html`) và `API` (`quan-tri/index.html`). Khi còn trống: web học vẫn chạy nhưng chỉ lưu trên máy, chưa mở khoá 21 ngày, chưa có Xếp hạng; trang quản trị báo "chưa nối máy chủ".
2. Sửa ngày và phí mùa 3: `DEMO_FEE`, `DEMO_HAN`, `DEMO_KHAI_MAC` (`index.html`), `XH_START` (`xep-hang.js`), tab "Cài đặt quản trị" của Sheet mùa 3.
3. `DANG_KY_LINK` (`index.html`) vẫn trỏ trang ưu đãi hiện tại; đổi nếu mùa 3 có trang đăng ký riêng.
