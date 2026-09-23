"""Genera imágenes mock: escenas oscuras con haces de luz, bruma y público.
No son fotos reales; se reemplazan por fotografía de eventos cuando la haya."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import math, random, sys

OUT = sys.argv[1]

def beam(size, x, spread, angle, length, softness):
    w, h = size
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    top = (x, -h * 0.12)
    dx = math.sin(math.radians(angle)) * length * h
    dy = math.cos(math.radians(angle)) * length * h
    bx, by = top[0] + dx, top[1] + dy
    half = spread * w
    d.polygon([(top[0] - w * .012, top[1]), (top[0] + w * .012, top[1]),
               (bx + half, by), (bx - half, by)], fill=210)
    return m.filter(ImageFilter.GaussianBlur(softness * w))

def radial(size, cx, cy, rx, ry, strength=255):
    w, h = size
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=strength)
    return m.filter(ImageFilter.GaussianBlur(rx * .5))

def tint(mask, rgb, size):
    layer = Image.new('RGB', size, rgb)
    out = Image.new('RGB', size, (0, 0, 0))
    return Image.composite(layer, out, mask)

def crowd(size, base_y, rng):
    """Siluetas de cabezas contra la luz."""
    w, h = size
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    d.rectangle([0, base_y + h * .10, w, h], fill=255)
    for _ in range(int(w / 26)):
        cx = rng.uniform(-20, w + 20)
        r = rng.uniform(w * .012, w * .026)
        cy = base_y + rng.uniform(0, h * .11)
        d.ellipse([cx - r, cy - r, cx + r, cy + r * 2.4], fill=255)
    return m.filter(ImageFilter.GaussianBlur(w * .004))

def scene(size, seed, hues, with_crowd=True):
    rng = random.Random(seed)
    w, h = size
    img = Image.new('RGB', size, (5, 5, 8))

    for i, (hue, op) in enumerate(hues):
        b = beam(size, rng.uniform(w * .1, w * .9),
                 rng.uniform(.05, .13), rng.uniform(-26, 26),
                 rng.uniform(.75, 1.15), rng.uniform(.02, .05))
        img = ImageChops.screen(img, tint(b, hue, size).point(lambda v, o=op: int(v * o)))

    glow = radial(size, w * rng.uniform(.35, .65), h * .80, w * .55, h * .30)
    img = ImageChops.screen(img, tint(glow, hues[0][0], size).point(lambda v: int(v * .30)))

    if with_crowd:
        img = Image.composite(Image.new('RGB', size, (3, 3, 5)), img,
                              crowd(size, h * rng.uniform(.58, .70), rng))

    vig = Image.new('L', size, 0)
    ImageDraw.Draw(vig).ellipse([-w * .25, -h * .25, w * 1.25, h * 1.25], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(w * .16))
    img = Image.composite(img, Image.new('RGB', size, (4, 4, 6)), vig)

    noise = Image.effect_noise(size, 14).convert('RGB')
    img = Image.blend(img, ImageChops.screen(img, noise), .16)
    return img

BLUE  = (58, 31, 255)
DEEP  = (24, 0, 172)
WARM  = (201, 119, 58)
CYAN  = (40, 120, 210)

JOBS = [
    ('hero',      (2200, 1400), 7,  [(BLUE, .85), (DEEP, .9), (CYAN, .5)],  True),
    ('trabajo-01',(1500, 1875), 11, [(DEEP, .9),  (BLUE, .7), (WARM, .35)], True),
    ('trabajo-02',(1600, 1200), 23, [(WARM, .55), (DEEP, .8), (BLUE, .5)],  False),
    ('trabajo-03',(1500, 1875), 31, [(CYAN, .7),  (BLUE, .8)],              True),
    ('trabajo-04',(1600, 1200), 47, [(DEEP, .95), (BLUE, .6)],              True),
    ('svc-01',    (1400, 1050), 3,  [(DEEP, .85), (CYAN, .5)],              False),
    ('svc-02',    (1400, 1050), 5,  [(BLUE, .9),  (WARM, .3)],              True),
    ('svc-03',    (1400, 1050), 13, [(WARM, .5),  (DEEP, .8)],              True),
    ('svc-04',    (1400, 1050), 17, [(CYAN, .75), (DEEP, .7)],              False),
    ('svc-05',    (1400, 1050), 29, [(DEEP, .9),  (BLUE, .55)],             True),
]

for name, size, seed, hues, cr in JOBS:
    scene(size, seed, hues, cr).save(f'{OUT}/{name}.jpg', quality=80, optimize=True)
    print(name, size)
