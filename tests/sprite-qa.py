from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
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
        alpha = rgba.getchannel("A")
        bbox = alpha.getbbox()
        if not bbox:
            raise SystemExit(f"{path}: empty alpha")
        left, top, right, bottom = bbox
        metrics.append({
            "file": str(path),
            "canvas": [rgba.width, rgba.height],
            "alpha_bbox": [left, top, right, bottom],
            "content_size": [right-left, bottom-top],
            "bottom_margin": rgba.height-bottom,
            "left_margin": left,
            "right_margin": rgba.width-right,
            "top_margin": top,
        })

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

bottoms=[m["bottom_margin"] for m in metrics]
heights=[m["content_size"][1] for m in metrics]
print(json.dumps(metrics, ensure_ascii=False, indent=2))
print(f"bottom-margin range: {min(bottoms)}..{max(bottoms)} px")
print(f"content-height range: {min(heights)}..{max(heights)} px")
if max(bottoms)-min(bottoms) > 3:
    raise SystemExit("FAIL: sprite foot baselines differ by more than 3 px")
if max(heights)-min(heights) > 18:
    raise SystemExit("FAIL: sprite visible heights differ by more than 18 px")
print("PASS: sprite alpha bounds and baselines are within tolerance")
