# Kiểm giọng tiếng Trung bằng máy nghe lại (13/11/2026)

Mọi file giọng tiếng Trung **thu xong phải qua bước này trước khi đưa lên web** (chị yêu cầu 12/11: dạy sai âm cho trẻ là nguy hiểm).

1. `pip install --break-system-packages faster-whisper opencc-python-reimplemented jieba pycccedict` (cần mở `huggingface.co` và `*.hf.co` ở Settings > Capabilities).
2. Lập danh sách `[{file, zh, part, exists}]` các file cần kiểm (gom mọi `a_zh` trong dữ liệu web, như lần soát 13/11).
3. `python3 -W ignore chuong-trinh/giong-can-thu/kiem-nghe/nghe.py ds.json nghe.json` – Whisper medium, ~5 giây/file. Nghe lại file nghi: `WHISPER_MODEL=large-v3-turbo` (large-v3 quá bộ nhớ 8 GB).
4. `python3 -W ignore chuong-trinh/giong-can-thu/kiem-nghe/so_sanh.py nghe.json nghi.json` – so theo pinyin có thanh (pinyin_chuan.py); đồng âm không tính sai; tên Latin ghi riêng.
5. File cả hai mô hình cùng nghi → trang nghe đối chiếu (MDBG) cho người soát; file sai vào `chuong-trinh/cong-cu/giong_thieu_thu_lai_zh.json` rồi chạy `gom_giong.py`.

Giới hạn: máy nghe tốt lỗi sai chữ, sai âm, gắn nhầm file; chưa chắc với thanh điệu và chữ đứng riêng rất ngắn.

Lần soát 13/11: 503 file, 421 khớp; 10 file vào hàng chờ thu lại (nhóm 1: gắn nhầm / nói thừa; nhóm 2: ch đọc thành q); 12 file chữ đứng riêng chờ người nghe (trang "Soát giọng tiếng Trung").
