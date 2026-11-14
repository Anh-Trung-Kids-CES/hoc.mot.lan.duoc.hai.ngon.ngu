"""Vẽ 10 hình dán còn thiếu của Phép thuật lời nói: 1 tờ lưới 3x3 (4K) + 1 hình lẻ (fruit). Khoá chỉ đọc từ GEMINI_API_KEY.
python3 -I ve_10hinh.py <thư_mục_ra>   → <ra>/A.png, <ra>/fruit.png (in usageMetadata)"""
import sys, os, json, base64
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, R + '/seedling/cong-cu/gemini'); import gem
OUT = sys.argv[1]; MODEL = 'gemini-3.1-flash-image'
STYLE_REF = R + '/seedling/cong-cu/gemini/mau_phong_cach_21ngay.png'; CHAR_REF = R + '/seedling/tai-nguyen/nhan-vat/bang_sheet_kids.webp'
BASE = ("Flat children's picture-book sticker illustration in exactly the same style as the style reference image: clean dark-brown outlines, soft warm colours, rosy cheeks, friendly faces. "
        "Recurring characters must match the character reference sheet: Leo = boy with curly brown hair and an olive-green shirt; Bông = girl with a long dark ponytail tied with a red band, red T-shirt with a yellow star. "
        "Every panel has a plain pure-white background and ONE single centered subject with a small soft floor shadow, fully inside its panel with white margin around it. ABSOLUTELY no text, no letters, no numbers, no watermarks. ")
PANELS = ["a plain round birthday cake with pink frosting and a few small sprinkles, NO candles on it at all, simple three-quarter view",
 "a cute baby with a round head and a little tuft of hair, sitting and smiling, wearing a light-blue onesie, big happy eyes",
 "a friendly boxy toy robot, silver-blue body, square head with two antennas and a smiling screen face, little arms and legs, standing",
 "Leo looking clearly ANGRY: furrowed eyebrows, frowning mouth, red cheeks, fists clenched at his sides, upper body to full body",
 "Bông looking very EXCITED: eyes sparkling, big open smile, both arms raised high, little stars around her",
 "one plain yellow wooden pencil with a sharpened grey-and-brown tip and a pink eraser, drawn diagonally",
 "one single red wax crayon with a paper wrapper and a rounded tip, drawn diagonally",
 "one single pure WHITE balloon with a clear closed dark-brown outline, light-grey shading and a highlight, with a thin red string hanging down",
 "a cute white polar bear standing on four legs in side view, black nose, small round ears, gentle smile, a small bit of ice under its paws"]
order = ['top-left','top-middle','top-right','middle-left','center','middle-right','bottom-left','bottom-middle','bottom-right']
A = BASE + "A 3x3 grid of 9 separate illustrations, separated by thin plain white gutters, same style in every panel. " + ' '.join(f"Panel {i+1} ({order[i]}): {p}." for i, p in enumerate(PANELS))
F = BASE + "ONE single illustration: a small bunch of mixed fruit grouped together (a red apple, a yellow banana, an orange and a bunch of purple grapes), centered."
def run(name, text, size, refs):
    parts = [{'inlineData': {'mimeType': 'image/png' if p.endswith('.png') else 'image/webp', 'data': base64.b64encode(open(p, 'rb').read()).decode()}} for p in refs] + [{'text': text}]
    d = gem.call(MODEL, {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '1:1', 'imageSize': size}}}, timeout=600)
    img = next(base64.b64decode(p['inlineData']['data']) for p in d['candidates'][0]['content']['parts'] if 'inlineData' in p)
    open(f'{OUT}/{name}.png', 'wb').write(img); print(name, len(img), json.dumps(d.get('usageMetadata')))
which = sys.argv[2] if len(sys.argv) > 2 else 'AF'
if 'A' in which: run('A', A, '4K', [STYLE_REF, CHAR_REF])
if 'F' in which: run('fruit', F, '1K', [STYLE_REF])
