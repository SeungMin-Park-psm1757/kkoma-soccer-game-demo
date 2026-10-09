from collections import deque
from pathlib import Path
import colorsys
import sys

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITES = ROOT / "assets/players/korea/ai-v1"
OUTPUT = ROOT / "assets/players/national-kit-mask-v1.png"
STATES = (
    "idle",
    "run",
    "pass",
    "shot",
    "tackle",
    "goalkeeper-idle",
    "goalkeeper-save",
)
SIZE = (128, 136)


def components(mask):
    height, width = len(mask), len(mask[0])
    seen = set()
    for y in range(height):
        for x in range(width):
            if not mask[y][x] or (x, y) in seen:
                continue
            queue = deque([(x, y)])
            seen.add((x, y))
            points = []
            while queue:
                px, py = queue.popleft()
                points.append((px, py))
                for ny in range(max(0, py - 1), min(height, py + 2)):
                    for nx in range(max(0, px - 1), min(width, px + 2)):
                        if mask[ny][nx] and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            queue.append((nx, ny))
            yield points


def color_mask(image, kind, part, state):
    pixels = image.load()
    mask = [[False] * image.width for _ in range(image.height)]
    shirt_floor = {"idle": 42, "run": 42, "pass": 36, "shot": 30, "tackle": 47,
                   "goalkeeper-idle": 30, "goalkeeper-save": 78}[state]
    socks_floor = {"idle": 88, "run": 85, "pass": 85, "shot": 72, "tackle": 90,
                   "goalkeeper-idle": 82, "goalkeeper-save": 82}[state]
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
            if kind == "yellow":
                match = 0.09 < hue < 0.19 and saturation > 0.28 and value > 0.12
            elif kind == "blue":
                match = 0.53 < hue < 0.72 and saturation > 0.22 and value > 0.08
            else:
                match = (hue < 0.06 or hue > 0.94) and saturation > 0.22 and value > 0.08
            if part == "shirt":
                match = match and y >= shirt_floor
            elif part == "socks":
                match = match and y >= socks_floor
            mask[y][x] = alpha > 25 and match
    return mask


def selected_components(image, kind, part, state):
    mask = color_mask(image, kind, part, state)
    selected = []
    for points in components(mask):
        area = len(points)
        center_x = sum(point[0] for point in points) / area
        center_y = sum(point[1] for point in points) / area
        top, bottom = min(point[1] for point in points), max(point[1] for point in points)
        if part == "shirt" and area >= (500 if kind == "yellow" else 250):
            selected.append(points)
        elif part == "shorts" and area >= 90 and 30 <= center_x <= 90 and 55 <= center_y <= 125 and bottom - top >= 12:
            selected.append(points)
        elif part == "socks" and area >= (28 if kind == "red" else 55) and center_y >= (72 if kind == "red" else 82):
            if area >= 500:
                continue
            if kind == "yellow" and area < 500 and center_x < 40 and center_y < 88:
                continue
            selected.append(points)
    if part in ("shirt", "shorts") and selected:
        selected = [max(selected, key=len)]
    return selected


def make_mask(image, keeper, state):
    result = Image.new("RGBA", SIZE)
    channels = [bytearray(SIZE[0] * SIZE[1]) for _ in range(3)]
    colors = (("yellow" if keeper else "red", "shirt"), ("blue", "shorts"), ("yellow" if keeper else "red", "socks"))
    for channel, (kind, part) in enumerate(colors):
        for group in selected_components(image, kind, part, state):
            for x, y in group:
                channels[channel][y * SIZE[0] + x] = 255

    # Expand a single pixel into matching colored antialias edges while retaining white/navy trim.
    source = image.load()
    for channel, (kind, _) in enumerate(colors):
        for y in range(1, SIZE[1] - 1):
            for x in range(1, SIZE[0] - 1):
                index = y * SIZE[0] + x
                if channels[channel][index]:
                    continue
                shirt_floor = {"idle": 42, "run": 42, "pass": 36, "shot": 30, "tackle": 47,
                               "goalkeeper-idle": 30, "goalkeeper-save": 78}[state]
                socks_floor = {"idle": 88, "run": 85, "pass": 85, "shot": 72, "tackle": 90,
                               "goalkeeper-idle": 82, "goalkeeper-save": 82}[state]
                if (channel == 0 and y < shirt_floor) or (channel == 2 and y < socks_floor):
                    continue
                red, green, blue, alpha = source[x, y]
                hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
                similar = ((hue < 0.07 or hue > 0.93) if kind == "red" else
                           (0.075 < hue < 0.20 if kind == "yellow" else 0.51 < hue < 0.74))
                if alpha > 25 and saturation > 0.12 and value > 0.08 and similar and any(
                    channels[channel][ny * SIZE[0] + nx]
                    for ny in range(y - 1, y + 2)
                    for nx in range(x - 1, x + 2)
                ):
                    if not any(channels[other][index] for other in range(3)):
                        channels[channel][index] = 128

    for y in range(SIZE[1]):
        for x in range(SIZE[0]):
            i = y * SIZE[0] + x
            if sum(value > 0 for value in (channels[0][i], channels[1][i], channels[2][i])) > 1:
                raise ValueError(f"overlapping garment masks at {x},{y}")
            result.putpixel((x, y), (channels[0][i], channels[1][i], channels[2][i], 255))
    return result


def build(output=None):
    atlas = Image.new("RGBA", (SIZE[0], SIZE[1] * len(STATES)), (0, 0, 0, 255))
    metrics = {}
    for row, state in enumerate(STATES):
        path = SPRITES / f"{state}.webp"
        if not path.is_file():
            raise FileNotFoundError(path)
        image = Image.open(path).convert("RGBA")
        if image.size != SIZE:
            raise ValueError(f"{path} is {image.size}, expected {SIZE}")
        mask = make_mask(image, state.startswith("goalkeeper-"), state)
        atlas.paste(mask, (0, row * SIZE[1]))
        metrics[state] = [sum(mask.getchannel(channel).histogram()[1:]) for channel in range(3)]
        if any(count < 70 for count in metrics[state]):
            raise ValueError(f"incomplete shirt/shorts/socks mask for {state}: {metrics[state]}")
    if output is not None:
        atlas.save(output, optimize=True)
    return atlas, metrics


if __name__ == "__main__":
    generated, metrics = build()
    if "--check" in sys.argv[1:]:
        if not OUTPUT.is_file() or Image.open(OUTPUT).convert("RGBA").tobytes() != generated.tobytes():
            raise SystemExit("FAIL: committed national kit mask is missing or stale")
        print(f"PASS: national kit mask source matches all seven AI poses ({metrics})")
    else:
        destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else OUTPUT
        generated.save(destination, optimize=True)
        print(metrics)
        print(f"Wrote {destination}")
