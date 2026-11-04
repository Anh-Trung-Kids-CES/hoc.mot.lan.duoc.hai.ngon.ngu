"""Phần dùng chung cho việc vẽ ảnh biểu cảm (gọi thường hoặc Batch)."""
import io
from pathlib import Path
from PIL import Image
HERE = Path(__file__).parent
QUA = HERE.parent.parent / "xem-truoc" / "tai-nguyen" / "qua"
MODEL = "gemini-3.1-flash-image"   # cùng mô hình đã vẽ hình web học (Nano Banana 2.1)
STYLE = ("Children's picture-book 2D cartoon, same line art, colours and proportions as the reference image. "
         "Keep exactly the same character: same face, hair, outfit and colours. Full body, centred, "
         "plain pure white background (#FFFFFF), no ground shadow, no text, no frame. Cute and gentle for 5-7 year olds, nothing scary.")
JOBS = [
    ("heroWin", "ava_bong_sieu_nhan.webp", "zoom_bong_thang.webp", "The superhero girl cheers happily, one fist raised to the sky, big open smile, eyes sparkling."),
    ("heroHurt", "ava_bong_sieu_nhan.webp", "zoom_bong_lui.webp", "The superhero girl leans back a little, both hands raised to block, determined straining face, not injured."),
    ("monAngry", "mon_lua_3.webp", "zoom_rong_gian.webp", "The little fire dragon puffs its cheeks, frowns with cute angry eyebrows and blows a small playful flame."),
    ("monDizzy", "mon_lua_3.webp", "zoom_rong_choang.webp", "The little fire dragon is dizzy: swirly spiral eyes, little stars circling its head, sitting down, wobbly."),
]

def cut_white(png):
    """Bỏ nền trắng nối liền với mép ảnh (giữ phần trắng bên trong nhân vật như mắt)."""
    im = Image.open(io.BytesIO(png)).convert("RGBA"); w, h = im.size; px = im.load()
    seen = bytearray(w * h); stack = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    white = lambda c: c[0] > 235 and c[1] > 235 and c[2] > 235
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        seen[y * w + x] = 1
        if not white(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    bb = im.getbbox(); im = im.crop(bb) if bb else im
    im.thumbnail((640, 640)); return im

