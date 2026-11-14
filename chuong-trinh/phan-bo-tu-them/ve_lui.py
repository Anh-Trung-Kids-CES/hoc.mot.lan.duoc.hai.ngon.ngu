import sys, os, json, base64, threading
sys.path.insert(0, '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/seedling/cong-cu/gemini')
import gem
R = '/home/claude/hoc.mot.lan.duoc.hai.ngon.ngu/seedling'
STYLE_REF = R + '/cong-cu/gemini/mau_phong_cach_21ngay.png'
CHAR_REF = R + '/tai-nguyen/nhan-vat/bang_sheet_kids.webp'
MODEL = 'gemini-3.1-flash-image'
BASE = ("Flat children's picture-book illustration in exactly the same style as the style reference image: clean dark-brown outlines, soft warm colours, rosy cheeks, friendly faces. "
        "Recurring characters must match the character reference sheet exactly: Bông = girl with a long dark ponytail tied with a red band, red T-shirt with a yellow star, blue jeans; "
        "Anna = girl with long wavy brown hair, a red flower clip and a red coat; Leo = boy with curly brown hair and an olive-green shirt; "
        "Xiaomei = girl with black hair in two buns with red flowers and a red qipao-style dress. "
        "Every panel has a plain white background. ABSOLUTELY no text, no letters, no numbers, no panel numbers, no watermarks. ")
SHEETS = {
 'D': dict(size='2K', n=4, grid="2x2", panels=[
   "a red ball BEHIND an open brown cardboard box: seen from the front, the box stands in front and clearly OVERLAPS and HIDES the lower half of the ball, only the top half of the red ball peeks out above the back edge of the box, ball and box both sit on the same floor",
   "Anna holds out one hand with the palm facing up and the fingers curling toward herself in a clear beckoning 'come here' gesture, leaning slightly forward, smiling warmly, the other arm relaxed",
   "a red ball BEHIND an open brown cardboard box: seen from the front, only the top third of the red ball is visible above the back flap of the box, the box in front hides most of the ball, same floor",
   "Xiaomei holds out one hand palm up with fingers curling toward herself in a clear beckoning 'come here' gesture, leaning slightly forward, smiling"],
   extra="Panels 1 and 3 use the same simple style as the reference box image: a red ball and a brown cardboard box on a plain white background with a soft floor shadow, NO coloured floor rectangle. "),
 'A': dict(size='4K', n=9, grid="3x3", panels=[
   "Bông sitting in a bathtub full of white bubbles, only her head, shoulders and arms visible, happy, a yellow rubber duck beside her",
   "a friendly brown horse standing in side view with a long mane and a gentle smile, a short strip of green grass under its hooves",
   "Leo and Xiaomei meeting: Xiaomei points to herself with a smile, Leo faces her with a small speech bubble that contains only a question mark",
   "Leo walking down a wooden indoor staircase seen from the side, one foot stepping onto the lower step, smiling",
   "Xiaomei waving one hand toward the viewer in a beckoning 'come here' gesture, other arm open wide, smiling",
   "a tear-off wall calendar page: a coloured header band at the top with two binding rings, and below it a large completely EMPTY white square with nothing written in it, a small cute sun drawn in the bottom corner. No digits, no letters anywhere",
   "ONE single big shiny red apple with a small green leaf, centered, nothing else in the panel",
   "Anna sliding down a playground slide, arms up, happy",
   "Leo waving one hand toward the viewer in a beckoning 'come here' gesture, smiling"]),
 'B': dict(size='2K', n=4, grid="2x2", noref=True, panels=[
   "a red ball directly BEHIND an open brown cardboard box, the ball further away from the viewer and clearly visible above and behind the box",
   "a red ball directly IN FRONT OF an open brown cardboard box, the ball closer to the viewer than the box",
   "a red ball NEXT TO an open brown cardboard box, standing on the right side of the box with a small gap between them",
   "TWO identical open brown cardboard boxes side by side with a red ball BETWEEN them on the floor"],
   extra="All four panels show the SAME red ball and the SAME brown box, same size, same pale floor shadow, seen from a 3/4 view slightly from above so everything is fully visible. No characters. "),
 'C': dict(size='2K', n=4, grid="2x2", panels=[
   "Leo and Bông sitting side by side at a wooden table, both eating bowls of rice with chopsticks, happy",
   "Anna and Xiaomei running side by side in a park, big smiles, one arm swinging",
   "Bông and Anna swimming side by side in blue water, heads and arms above the water",
   "Leo and Xiaomei jumping with joy side by side, arms up"]),
}
def build(key):
    s = SHEETS[key]
    order = ['top-left','top-middle','top-right','middle-left','center','middle-right','bottom-left','bottom-middle','bottom-right'] if s['grid']=='3x3' else ['top-left','top-right','bottom-left','bottom-right']
    t = BASE + s.get('extra','') + f"A {s['grid']} grid of {s['n']} separate illustrations, separated by thin plain white gutters, same style in every panel, each panel one clear simple picture. "
    for i, p in enumerate(s['panels']): t += f"Panel {i+1} ({order[i]}): {p}. "
    return t
def run(key):
    s = SHEETS[key]; parts = []
    refs = [STYLE_REF] if s.get('noref') else ([STYLE_REF, CHAR_REF, '/home/claude/work/sheets/B_ref_nextto.png'] if key=='D' else [STYLE_REF, CHAR_REF])
    for p in refs:
        mt = 'image/png' if p.endswith('.png') else 'image/webp'
        parts.append({'inlineData': {'mimeType': mt, 'data': base64.b64encode(open(p,'rb').read()).decode()}})
    parts.append({'text': build(key)})
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '1:1', 'imageSize': s['size']}}}
    d = gem.call(MODEL, body, timeout=600)
    um = d.get('usageMetadata'); img = None
    for p in d['candidates'][0]['content']['parts']:
        if 'inlineData' in p: img = base64.b64decode(p['inlineData']['data'])
    out = f"/home/claude/work/sheets/{key}_{sys.argv[2] if len(sys.argv)>2 else '1'}.png"
    open(out,'wb').write(img); print(key, out, len(img), json.dumps(um))
if __name__ == '__main__':
    ks = sys.argv[1]
    th = [threading.Thread(target=run, args=(k,)) for k in ks]
    [t.start() for t in th]; [t.join() for t in th]
