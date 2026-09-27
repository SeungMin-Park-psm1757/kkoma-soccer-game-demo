from pathlib import Path
from PIL import Image, ImageDraw
import json

root = Path("assets/players/korea")
files = sorted(root.glob("*.webp"))
if not files:
    raise SystemExit("No Korea WebP sprites found")

metrics = []
thumbs = []
for path in files:
    with Image.open(path) as im:
        rgba = im.convert("RGBA")
        if rgba.size != (128, 136):
            raise SystemExit(f"FAIL: {path.name} canvas is {rgba.size}, expected 128x136")
        alpha = rgba.getchannel("A")
        bbox = alpha.getbbox()
        if not bbox:
            raise SystemExit(f"FAIL: {path.name} has empty alpha")
        if any(alpha.getpixel(point) != 0 for point in [(0,0),(127,0),(0,135),(127,135)]):
            raise SystemExit(f"FAIL: {path.name} corner alpha is not transparent")
        transparent = sum(1 for value in alpha.getdata() if value == 0)
        if transparent < 128*136*.20:
            raise SystemExit(f"FAIL: {path.name} has too little transparent area; possible baked background")
        left, top, right, bottom = bbox
        metric = {
            "file": str(path),
            "canvas": [rgba.width, rgba.height],
            "alpha_bbox": [left, top, right, bottom],
            "content_size": [right-left, bottom-top],
            "bottom_margin": rgba.height-bottom,
            "left_margin": left,
            "right_margin": rgba.width-right,
            "top_margin": top,
            "transparent_ratio": round(transparent/(128*136), 4),
        }
        metrics.append(metric)

        tile = Image.new("RGBA", (160, 184), (30, 45, 42, 255))
        checker = Image.new("RGBA", (128, 136), (0,0,0,0))
        d = ImageDraw.Draw(checker)
        step=8
        for y in range(0,136,step):
            for x in range(0,128,step):
                c=(235,235,235,255) if (x//step+y//step)%2==0 else (200,200,200,255)
                d.rectangle((x,y,x+step-1,y+step-1), fill=c)
        checker.alpha_composite(rgba)
        tile.alpha_composite(checker, (16, 12))
        td=ImageDraw.Draw(tile)
        td.text((8,154), path.name, fill=(255,255,255,255))
        thumbs.append(tile.convert("RGB"))

out=Path("sprite-qa")
out.mkdir(exist_ok=True)
(out/"metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")

cols=4
rows=(len(thumbs)+cols-1)//cols
sheet=Image.new("RGB",(160*cols,184*rows),(20,30,28))
for i,tile in enumerate(thumbs):
    sheet.paste(tile,((i%cols)*160,(i//cols)*184))
sheet.save(out/"korea-sprite-contact.png")

for state in ("idle","run"):
    group=[m for m in metrics if Path(m["file"]).name.startswith(state+"-")]
    bottoms=[m["bottom_margin"] for m in group]
    heights=[m["content_size"][1] for m in group]
    if max(bottoms)-min(bottoms) > 3:
        raise SystemExit(f"FAIL: {state} foot baselines differ by more than 3 px")
    if max(heights)-min(heights) > 18:
        raise SystemExit(f"FAIL: {state} visible heights differ by more than 18 px")

for state in ("pass","shot"):
    group=[m for m in metrics if Path(m["file"]).name.startswith(state+"-")]
    if len(group) != 3:
        raise SystemExit(f"FAIL: expected 3 {state} field sprites, found {len(group)}")
    for m in group:
        height=m["content_size"][1]
        if height < 112 or height > 134:
            raise SystemExit(f"FAIL: {m['file']} visible height {height} outside action tolerance")
        if m["bottom_margin"] > 14:
            raise SystemExit(f"FAIL: {m['file']} bottom margin too large")

print(json.dumps(metrics, ensure_ascii=False, indent=2))
print("PASS: sprite dimensions, transparency, baseline rules, and action-frame tolerances")
