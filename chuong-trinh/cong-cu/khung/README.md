# Bộ công cụ bảng phân bổ (khung chương trình) Anh – Trung – Kids

`grid/out/<khóa>-<phần>.json` là bản gốc của bảng phân bổ 9 khóa (900 ngày web, 450 buổi lớp). Nó trùng với Google Sheet "Khung chương trình mỗi khoá" tại thời điểm 27/10/2026. Sửa khung thì sửa các file JSON này, kiểm tra, rồi đưa lên Sheet.

## Cấu trúc JSON
```
{rows:[{buoi, unit, label_buoi,
        web:[{ngay, label, en:{tu,cum,cau,truyen,video}, zh:{…}} ×2],
        lop:{en:{flash,slide,truyen,baihat}, zh:{…}}}]}
```
- Các phần: a, b, c. Riêng PreB chỉ có preb-a; Larva Plus và Butterfly có a, b.
- Ô `tu` chia đoạn bằng " | ", mỗi đoạn có tiền tố: `Mới:`, `Ôn:`, `Nghe làm quen:`…
- Thẻ trong ô: [Cầu nối], [Cầu nối Anh – Trung], [Chuyển ngữ], [Lời cô], [Bản nâng cao]. Từ Trung mới ghi "(= nghĩa)" ngay sau từ.

## Kiểm tra (chạy trong `grid/`)
| Lệnh | Việc |
|---|---|
| `python3 check_principles.py <phần>` | Kiểm 4 nguyên tắc cốt lõi; phải ĐẠT tất cả |
| `python3 to_sheet.py <phần>` | Xuất CSV cho Sheet; không được có ô trống |
| `python3 sandhi.py [--fix] [glob]` | Biến điệu 一/不 trong pinyin; khoảng 71 cảnh báo còn lại là đếm nhầm chữ Bù viết hoa |
| `python3 exam_cov.py` | Độ phủ từ thi; từ "vững" = gặp ≥5 lần trước mốc thi. Có đếm nhầm vài từ, ví dụ 比 với 比萨 |
| `python3 build_site.py` | Dựng `../../data/bang/*` cho web |

Chạy trong `audit/`: `metrics.py` (độ dài truyện, tải từ mới, tên truyện theo khóa), `jumps.py` (ngày khó đột ngột, từ đích trong truyện, truyện unit), `lop_counts.py` (số câu mỗi hoạt động trên lớp).

Tiêu chí rà soát: `grid/REVIEW_CRITERIA.md`.

## Đưa lên Google Sheet
1. `build_site.py`, rồi push `chuong-trinh/data/bang/<cid>-sheet.csv` lên main. Đợi GitHub Pages cập nhật, khoảng 3–4 phút.
2. Thêm tab tạm "tam-nhap". Ở các ô A1, A131, A261, A391, A521, A651, A781, A911, A1041 đặt công thức `=IMPORTDATA("https://anh-trung-kids-ces.github.io/hoc.mot.lan.duoc.hai.ngon.ngu/chuong-trinh/data/bang/<cid>-sheet.csv?v=N")`. Thứ tự: preb, little-seed, seedling, canopy, larva, larva-plus, pupa, cocoon, butterfly. Mỗi lần nhập tăng N; lần gần nhất dùng v=9.
3. Kiểm một ô vừa sửa.
4. copyPaste PASTE_VALUES sang các tab 101–109 (PreB … Butterfly), bắt đầu từ dòng startRowIndex 3. Vùng nguồn là các dòng 130·i đến 130·i + n, với n = 60 hoặc 120.
5. Xóa tab tạm.

Quy định: trong repo chỉ sửa thư mục `chuong-trinh/`. Không động vào web 21 ngày.
