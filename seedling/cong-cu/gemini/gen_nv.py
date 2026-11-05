import sys, json, os
sys.path.insert(0, os.path.dirname(__file__))
import gem
from concurrent.futures import ThreadPoolExecutor
REFS = ['kids_bong_a.png', 'kids_leo_a.png', 'fam_bong_anh_trai_a.png', 'fam_bong_me_a.png']
BASE = ("The attached pictures are characters from our children's English–Chinese course. Copy their art style exactly: "
        "flat 2D children's picture-book cartoon, clean dark-brown outlines of the same thickness, flat warm colours with very soft shading, "
        "big friendly eyes, rosy cheeks, simple shapes, same head-to-body proportions. Draw ONE NEW character (not any of the attached ones): ")
TAIL = (" Full body from head to shoes, standing, front view, centred, filling most of the height. Plain pure white background, "
        "no shadow on the ground, no scenery, no other people, no text, no letters, no logo, no frame.")
CH = {
 'vu': "Vũ, a cheerful Vietnamese boy, 7 years old, short neat black hair, yellow T-shirt, blue shorts, white sneakers, waving one hand with a big smile.",
 'anh_vu': "Vũ's older brother, a friendly Vietnamese boy, 9 years old and a little taller than a 7-year-old, short spiky black hair, green T-shirt, grey trousers, sneakers, one hand raised in a small wave.",
 'nguoi_dien': "a friendly street performer man, VERY tall and thin with very long arms and very long legs, colourful red-and-yellow striped costume, small blue top hat, big smile, both long arms raised up high.",
 'hoa': "Miss Hoa, a young Vietnamese woman in her twenties who is a photographer, long black hair in a ponytail, light-blue blouse, white trousers, a camera on a strap around her neck, holding the camera with one hand and waving with the other, friendly smile.",
 'lan': "Mrs Lan, a kind Vietnamese woman teacher, clearly an ADULT around 30 years old with adult body proportions like the attached mother (taller, longer legs, smaller head relative to body), teal dress (#1FA5A0) with a round white collar, shoulder-length black hair with a small yellow leaf hair clip, holding a red book against her chest with one arm and waving with the other hand, warm smile, simple flat shoes.",
}
def run(k):
    try:
        b, mt, u = gem.image(BASE + CH[k] + TAIL, REFS, aspect='9:16')
        ext = 'png' if 'png' in mt else 'jpg'
        open(f'{k}_{TAG}.{ext}', 'wb').write(b); return k, mt, u
    except Exception as e:
        return k, 'ERR', str(e)[:300]
TAG = sys.argv[1]
keys = sys.argv[2:] or list(CH)
with ThreadPoolExecutor(5) as ex:
    for r in ex.map(run, keys): print(r)
