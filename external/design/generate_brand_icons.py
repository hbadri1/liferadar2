from pathlib import Path

from PIL import Image, ImageDraw

PRIMARY = '#1FB7A6'
ACCENT = '#FF6B5E'
NEUTRAL = '#142033'
WHITE = '#FFFFFF'

ROOT = Path(__file__).resolve().parents[2]
WEBAPP = ROOT / 'src' / 'main' / 'webapp'
IMAGES = WEBAPP / 'content' / 'images'


def hex_to_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip('#')
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def draw_logo_mark(size: int) -> Image.Image:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = int(size * 0.06)
    radius = int(size * 0.19)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=hex_to_rgba(NEUTRAL))

    cx = cy = size / 2
    outer_r = size * 0.29
    mid_r = size * 0.205
    inner_r = size * 0.095

    draw.ellipse((cx - outer_r, cy - outer_r, cx + outer_r, cy + outer_r), outline=(255, 255, 255, 35), width=max(2, size // 48))
    draw.ellipse((cx - mid_r, cy - mid_r, cx + mid_r, cy + mid_r), outline=hex_to_rgba(PRIMARY), width=max(3, size // 42))
    draw.ellipse((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r), outline=(255, 255, 255, 48), width=max(2, size // 56))

    sweep = [
        (cx, cy),
        (cx, cy - outer_r * 0.92),
        (cx + outer_r * 0.66, cy - outer_r * 0.56),
    ]
    draw.polygon(sweep, fill=hex_to_rgba(PRIMARY, 58))

    line_end = (cx + outer_r * 0.69, cy - outer_r * 0.57)
    draw.line((cx, cy, *line_end), fill=hex_to_rgba(PRIMARY), width=max(3, size // 36))

    center_r = size * 0.035
    draw.ellipse((cx - center_r, cy - center_r, cx + center_r, cy + center_r), fill=hex_to_rgba(WHITE))

    pulse_r = size * 0.045
    px, py = line_end
    draw.ellipse((px - pulse_r, py - pulse_r, px + pulse_r, py + pulse_r), fill=hex_to_rgba(ACCENT))

    curve = [
        (size * 0.275, size * 0.69),
        (size * 0.39, size * 0.61),
        (size * 0.50, size * 0.60),
        (size * 0.62, size * 0.60),
        (size * 0.74, size * 0.66),
    ]
    draw.line(curve, fill=hex_to_rgba(ACCENT), width=max(3, size // 38), joint='curve')

    return img


def main() -> None:
    IMAGES.mkdir(parents=True, exist_ok=True)
    sizes = [192, 256, 384, 512]
    for size in sizes:
        draw_logo_mark(size).save(IMAGES / f'liferadar-icon-{size}.png', format='PNG')

    draw_logo_mark(180).save(WEBAPP / 'apple-touch-icon.png', format='PNG')

    favicon_base = draw_logo_mark(64)
    favicon_base.save(WEBAPP / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])


if __name__ == '__main__':
    main()

