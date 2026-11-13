import fitz
from pathlib import Path

books = [
    ("everything-begins", "Everything Begins & Ends in Brown"),
    ("seicho", "Seicho Brand Manual"),
    ("concept-art", "Concept art"),
    ("my-birthright", "My Birthright"),
    ("typographic-posters", "Typographic Posters"),
    ("poetry-magazine", "Poetry magazine cover design"),
    ("gilded-affection", "Gilded affection"),
    ("sketchbook", "Sketchbook"),
]

root = Path(r"C:\Users\rajsh\anoti pf")
lines = [
    'import type { ImagePage } from "./types";',
    "",
    "export const renderedPages: Record<string, ImagePage[]> = {",
]

for slug, title in books:
    doc = fitz.open(root / "public" / "books" / f"{slug}.pdf")
    out = root / "public" / "assets" / "projects" / slug
    out.mkdir(parents=True, exist_ok=True)
    lines.append(f"  {slug!r}: [")
    for index, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False)
        name = f"{index:02d}.jpg"
        pix.save(str(out / name), jpg_quality=82)
        src = f"/assets/projects/{slug}/{name}"
        alt = f"{title}, page {index}"
        lines.append(f"    {{ type: \"image\", src: {src!r}, alt: {alt!r} }},")
    lines.append("  ],")
    print(slug, doc.page_count)

lines.append("};")
lines.append("")
(root / "src" / "content" / "bookPages.ts").write_text("\n".join(lines), encoding="utf-8")
print("wrote bookPages.ts")
