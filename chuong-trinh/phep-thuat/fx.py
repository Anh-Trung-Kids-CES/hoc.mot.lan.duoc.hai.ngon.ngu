# Hiệu ứng "nói → hình đổi" của từng phép. Mỗi phép = danh sách bước; máy game (seedling/phep-thuat.js) chạy lần lượt.
# Bước: show/hide/anim/time/weather/scene/bg/candles/count/color/move/tag/frame/push/clock/flash/confetti/heart/cross/steam/shine/reply
# "$" = giá trị con nói (số hoặc màu); d = giá trị mặc định khi con không nói.
def oid(o):
    return o.split(':', 1)[1] if ':' in o and not o.startswith('code:') else None

def ids(objs):
    return [oid(o) for o in objs if oid(o)]

def sh(*o): return dict(t='show', o=list(o))
def hd(*o): return dict(t='hide', o=list(o) if o else 'all')
def an(a, *o): return dict(t='anim', a=a, o=list(o) if o else 'shown')

def fx_for(course, unit, k, objs):
    """Trả về (danh sách bước, tham số|None). course = LS/SD, unit = chuỗi."""
    I = ids(objs)
    key = (course, unit, k)
    # --- mặc định: các vật hiện ra, nhún nhẹ ---
    st = [sh(*I), an('wave')] if I else []
    par = None
    # ---------- U1 (chào hỏi) ----------
    if k == 'day': st = [dict(t='time', v='day'), dict(t='weather', v='sunny')]
    elif k == 'night' and unit in ('1', '5'):
        st = [dict(t='time', v='night'), hd()] + ([sh('bed'), an('sleep', 'bed')] if (course, unit) == ('SD', '5') else [])
    elif k == 'go': st = [dict(t='scene')]
    elif k == 'hi_all': st = [sh('kids_bong_a', 'kids_anna_a', 'pets_meo_dung_a', 'pets_cun_dung_a'), an('wave')]
    elif k == 'hi_kids': st = [sh('kids_bong_a', 'kids_anna_a', 'nv_vu_a'), an('wave')]
    elif k == 'bye_puppy': st = [hd('pets_cun_dung_a')]
    elif k == 'tall': st = [sh('nv_nguoi_dien_a'), an('tall', 'nv_nguoi_dien_a')]
    # ---------- U2 tên – tuổi ----------
    elif k == 'hello_cake': st = [sh('cake_plain'), an('pop', 'cake_plain')]
    elif k == 'num': st = [sh('cake_plain'), dict(t='candles', n='$', d=6)]; par = 'num'
    elif k == 'hbd': st = [sh('cake_plain'), dict(t='candles', n='$', d=6), dict(t='confetti')]
    elif k == 'name' and course == 'LS': st = [sh('kids_leo_a'), dict(t='tag', text='Leo'), an('wave', 'kids_leo_a')]
    elif k == 'name': st = [sh('kids_xiaomei_a'), dict(t='tag', text='Xiaomei'), an('wave', 'kids_xiaomei_a')]
    elif k == 'ask_name': st = [sh('kids_bong_a'), an('talk', 'kids_bong_a')]
    elif k == 'ask_age' and course == 'LS': st = [sh('cake_plain'), dict(t='candles', n=6, d=6), an('talk', 'cake_plain')]
    elif k == 'ask_age': st = [sh('kids_anna_a'), an('talk', 'kids_anna_a')]
    elif k == 'age': st = [sh('cake_plain'), dict(t='candles', n='$', d=6)]; par = 'num'
    elif k == 'meet': st = [sh('kids_anna_a', 'kids_xiaomei_a'), an('shake_hands'), an('wave')]
    elif k == 'hbd_vu': st = [sh('nv_vu_a', 'cake_plain'), dict(t='candles', n=7, d=7), dict(t='confetti'), an('jump', 'nv_vu_a')]
    elif k == 'hbd_leo': st = [sh('kids_leo_a', 'cake_plain'), dict(t='candles', n=6, d=6), dict(t='confetti'), an('jump', 'kids_leo_a')]
    # ---------- U3 gia đình ----------
    elif k == 'family': st = [sh('fam_bong_bo_a', 'fam_bong_me_a', 'fam_bong_anh_trai_a', 'fam_bong_em_gai_a'), an('wave')]
    elif k == 'baby': st = [sh('baby'), an('pop', 'baby')]
    elif k == 'photo': st = [sh('people'), dict(t='frame'), an('pop', 'people')]
    # ---------- U4 cơ thể ----------
    elif k == 'hi_robo': st = [sh('robo'), an('wave', 'robo')]
    elif k in ('head', 'eyes', 'ears', 'nose') and course == 'LS':
        st = [sh('robo'), an({'head': 'nod', 'eyes': 'blink', 'ears': 'wiggle', 'nose': 'touch'}[k], 'robo'), dict(t='shine', o='robo')]
    elif k == 'mouth' and course == 'LS': st = [sh('robo'), an('smile', 'robo')]
    elif k == 'clap': st = [sh('kids_bong_a', 'kids_anna_a', 'nv_vu_a'), an('clap')]
    elif k == 'stamp': st = [sh('kids_bong_a', 'kids_anna_a', 'nv_vu_a'), an('stamp')]
    elif k == 'mouth': st = [sh('kids_bong_a', 'kids_anna_a', 'nv_vu_a'), an('mouth')]
    elif k == 'hands': st = [sh('hand'), an('wave', 'hand')]
    elif k == 'arms': st = [sh('arm', 'leg'), an('grow', 'arm', 'leg')]
    elif k == 'body': st = [sh('body'), an('pop', 'body')]
    # ---------- U5 cảm xúc ----------
    elif k in ('happy', 'excited'): st = [sh(I[0]), an('jump', I[0])]
    elif k == 'sad': st = [sh('sad'), an('sag', 'sad')]
    elif k == 'hungry' and course == 'LS': st = [sh('hungry'), an('shake', 'hungry')]
    elif k == 'hungry': st = [sh('hungry', 'cake_plain'), an('shake', 'hungry')]
    elif k == 'thirsty': st = [sh('thirsty', 'water'), an('shake', 'thirsty')]
    elif k == 'sleepy': st = [sh('sleepy'), an('sag', 'sleepy'), dict(t='time', v='dusk')]
    elif k == 'scared': st = [sh('scared'), an('shake', 'scared')]
    elif k == 'angry': st = [sh('angry'), an('shake', 'angry'), dict(t='steam', o='angry')]
    # ---------- U6 đồ dùng học tập ----------
    elif k == 'bag' and course == 'LS': st = [sh('schoolbag'), dict(t='shine', o='schoolbag')]
    elif k == 'bag' and unit == '6': st = [sh('schoolbag'), dict(t='shine', o='schoolbag')]
    elif k in ('book', 'pen', 'pencil', 'ruler', 'eraser', 'crayon', 'scissors', 'glue'): st = [sh(I[0]), an('pop', I[0])]
    elif k == 'line': st = [sh('kids_bong_a', 'kids_anna_a', 'nv_vu_a'), an('line')]
    elif k == 'letters': st = [sh('letter'), an('spin', 'letter')]
    # ---------- U7 ngôi nhà ----------
    elif unit == '7' and k == 'where': st = [sh('kids_bong_a'), an('look', 'kids_bong_a'), hd('book', 'ball')]
    elif k == 'on_table': st = [sh('table'), dict(t='move', o='book', to='table', how='on')]
    elif k == 'under_bed': st = [sh('bed'), dict(t='move', o=I[0], to='bed', how='under')]
    elif k == 'on_sofa': st = [sh('sofa'), dict(t='move', o=I[0], to='sofa', how='on')]
    elif k == 'under_chair': st = [sh('chair'), dict(t='move', o='book', to='chair', how='under')]
    elif k == 'here': st = [sh('kids_bong_a', 'book'), an('wave', 'kids_bong_a'), dict(t='heart')]
    elif k == 'found': st = [sh('ball'), dict(t='confetti'), an('jump', 'ball')]
    elif k == 'dining': st = [sh('dining_room'), an('pop', 'dining_room'), an('shake', 'dining_room')]
    elif k == 'living': st = [dict(t='bg', img='tranh/living_room')]
    # ---------- U8 con vật ----------
    elif k == 'dog_run': st = [sh(I[0]), an('run', I[0])]
    elif k == 'bird_fly': st = [sh('bird'), an('fly', 'bird')]
    elif k == 'fish_swim': st = [sh('fish'), an('swim', 'fish')]
    elif k == 'rabbit_jump': st = [sh('rabbit'), an('jump', 'rabbit')]
    elif k == 'hi_duck': st = [sh('duck'), an('wave', 'duck')]
    elif k == 'ready_go': st = [sh('pets_cun_dung_a', 'pets_meo_dung_a', 'duck'), an('run')]
    elif k == 'frog_cant': st = [sh('frog'), an('hop_fall', 'frog')]
    elif k == 'bear_swim': st = [sh('polar_bear'), an('swim', 'polar_bear')]
    # ---------- U9 ăn uống ----------
    elif k in ('eat_apple', 'eat_banana', 'eat_rice', 'drink_juice', 'drink_milk'):
        st = [sh('kids_bong_a', I[0]), dict(t='move', o=I[0], to='kids_bong_a', how='mouth'), an('eat', 'kids_bong_a')]
    elif k in ('like_pizza', 'like_apple', 'like_ice'): st = [sh(I[0]), dict(t='heart'), an('pop', I[0])]
    elif k == 'dont_fruit': st = [sh('fruit'), dict(t='cross')]
    elif k == 'or': st = [sh('noodles', 'ice_cream'), an('pulse')]
    elif k == 'no_thanks': st = [sh('kids_bong_a', 'noodles'), dict(t='push', o='noodles')]
    elif k == 'burger': st = [sh('burger'), an('pop', 'burger'), an('talk', 'burger')]
    # ---------- U10 thời tiết ----------
    elif unit in ('10',) and k in ('sunny', 'cloudy', 'windy', 'rainy', 'snowy', 'cold'): st = [dict(t='weather', v=k)] + ([sh('umbrella')] if k == 'rainy' and course == 'SD' else []) + ([sh('snowman')] if k == 'snowy' and course == 'SD' else []) + ([an('shiver')] if k == 'cold' else [])
    elif k == 'coat': st = [sh('kids_bong_a', 'coat'), dict(t='move', o='coat', to='kids_bong_a', how='wear'), an('wave', 'kids_bong_a')]
    elif k == 'hat': st = [sh('kids_bong_a', 'hat'), dict(t='move', o='hat', to='kids_bong_a', how='hat'), an('wave', 'kids_bong_a')]
    # ---------- U11 màu sắc ----------
    elif k in ('red', 'yellow', 'blue', 'green', 'pink') and course == 'LS':
        st = [sh('balloon_white'), dict(t='color', o='balloon_white', c='$', d=k), an('pop', 'balloon_white')]; par = 'color'
    elif k == 'rainbow': st = [sh('rainbow'), dict(t='shine', o='rainbow'), an('pop', 'rainbow')]
    elif k in ('pink_dress', 'blue_shorts', 'red_socks'):
        st = [sh(I[0]), dict(t='color', o=I[0], c='$', d=k.split('_')[0]), an('pop', I[0])]; par = 'color'
    elif k == 'gold': st = [sh('glasses'), dict(t='color', o='glasses', c='$', d='gold'), dict(t='shine', o='glasses')]; par = 'color'
    elif k == 'colour_dress': st = [sh('dress'), dict(t='color', o='dress', c='pink', d='pink'), an('pop', 'dress')]
    elif k == 'fav': st = [sh('dress'), dict(t='color', o='dress', c='$', d='gold'), an('talk', 'dress')]; par = 'color'
    # ---------- U12 đếm, giờ ----------
    elif k == 'two_dogs': st = [dict(t='count', o='pets_cun_dung_a', n='$', d=2)]; par = 'num'
    elif k == 'three_cakes': st = [dict(t='count', o='cake_plain', n='$', d=3)]; par = 'num'
    elif k == 'five_monkeys': st = [dict(t='count', o='monkey', n='$', d=5)]; par = 'num'
    elif k == 'ten_eggs': st = [dict(t='count', o='egg', n='$', d=10)]; par = 'num'
    elif k == 'how_many': st = [dict(t='count', o='cake_plain', n=4, d=4), an('talk', 'cake_plain')]
    elif k == 'count': st = [dict(t='count_people', o=['kids_bong_a', 'kids_anna_a', 'nv_vu_a', 'kids_leo_a', 'kids_xiaomei_a'])]
    elif k == 'ten': st = [sh('ten_people'), an('pop', 'ten_people')]
    elif k == 'time': st = [dict(t='clock', h=8)]
    elif k == 'photo' : pass
    elif k == 'hooray': st = [dict(t='confetti'), an('jump')]
    elif k == 'cake': st = [sh('nv_lan_a', 'cake_plain'), dict(t='candles', n=1, d=1), an('wave', 'nv_lan_a')]
    # ---------- thời tiết ở U1 / thẻ cũ ----------
    # ---------- còn lại (hi_*, mother…): mặc định ----------
    # photo U12: đèn flash
    if (course, unit) == ('SD', '12') and k == 'photo':
        st = [dict(t='flash'), sh('take_a_photo'), an('pop', 'take_a_photo')]
    return st, par
