from PIL import Image, ImageDraw
import math
from pathlib import Path

OUTPUT = Path("public")
OUTPUT.mkdir(exist_ok=True)

def bezier(p0, p1, p2, p3, steps=100):
    points = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3*p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0]
        y = u**3*p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1]
        points.append((x, y))
    return points

def create_icon(size, filename):
    scale = 4
    n = size * scale

    image = Image.new("RGBA", (n, n), (5, 11, 9, 255))
    pixels = image.load()

    # Dégradé vert profond
    for y in range(n):
        for x in range(n):
            t = (x + y) / (2 * n)
            pixels[x, y] = (
                int(16 - 10*t),
                int(41 - 30*t),
                int(31 - 22*t),
                255
            )

    # Coins arrondis
    mask = Image.new("L", (n, n), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle(
        (0, 0, n-1, n-1),
        radius=int(n*0.22),
        fill=255
    )
    image.putalpha(mask)

    draw = ImageDraw.Draw(image)

    # Coordonnées du monogramme S
    def pt(x, y):
        return (int(x*n), int(y*n))

    segments = [
        bezier((0.70,0.25),(0.57,0.14),(0.39,0.18),(0.30,0.31)),
        bezier((0.30,0.31),(0.18,0.48),(0.37,0.55),(0.55,0.61)),
        bezier((0.55,0.61),(0.77,0.68),(0.79,0.82),(0.65,0.91)),
        bezier((0.65,0.91),(0.52,0.99),(0.36,0.91),(0.27,0.83))
    ]
    path = []
    for segment in segments:
        path.extend([pt(x,y) for x,y in segment])

    # Trait doré
    draw.line(
        path,
        fill=(214,173,85,255),
        width=int(n*0.085),
        joint="curve"
    )

    # Reflet lumineux du monogramme
    draw.line(
        [pt(0.68,0.24), pt(0.58,0.19), pt(0.48,0.20)],
        fill=(255,239,185,255),
        width=int(n*0.018)
    )

    # Feuille verte
    leaf = [
        pt(0.51,0.34),
        pt(0.54,0.22),
        pt(0.67,0.12),
        pt(0.84,0.12),
        pt(0.81,0.27),
        pt(0.68,0.38)
    ]
    draw.polygon(leaf, fill=(52,211,153,255))
    draw.line(
        [pt(0.54,0.34), pt(0.66,0.25), pt(0.82,0.14)],
        fill=(214,173,85,255),
        width=max(2, int(n*0.012))
    )

    # Ligne dorée inférieure
    draw.line(
        [pt(0.25,0.94), pt(0.75,0.94)],
        fill=(214,173,85,180),
        width=max(2, int(n*0.012))
    )

    image = image.convert("RGB")
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    image.save(OUTPUT / filename, "PNG", optimize=True)
    print(f"Créé : {OUTPUT / filename} ({size}x{size})")

create_icon(180, "icon-180.png")
create_icon(192, "icon-192.png")
create_icon(512, "icon-512.png")
