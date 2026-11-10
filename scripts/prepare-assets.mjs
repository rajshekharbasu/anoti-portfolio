import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const root = process.cwd();
const attached = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-rajsh-anoti-pf",
  "assets",
);

const sources = {
  bookshelf: path.join(attached, "image-658d9958-a1d9-4ac8-8c7f-9bfe4a691d95.png"),
  book: path.join(attached, "image-723e0a4f-dfa1-41e2-ab7c-54a2041e8b37.png"),
  frame: path.join(attached, "image-080cbf9c-28cf-46a6-8e0c-5bc9de481e1d.png"),
  character: path.join(attached, "image-c83e27d9-52f4-4de0-9e62-ad003726b0c9.png"),
  intro: path.join(root, "intor.gif"),
};

function readPng(file) {
  const buffer = fs.readFileSync(file);
  return PNG.sync.read(buffer);
}

function writePng(file, png) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, PNG.sync.write(png));
}

function alphaExtent(png) {
  let min = 255;
  let max = 0;
  for (let i = 3; i < png.data.length; i += 4) {
    const a = png.data[i];
    if (a < min) min = a;
    if (a > max) max = a;
  }
  return { min, max };
}

function corner(png) {
  const i = 0;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}

function flood(png, starts, shouldClear) {
  const { width, height, data } = png;
  const seen = new Uint8Array(width * height);
  const stack = starts.slice();
  while (stack.length) {
    const point = stack.pop();
    if (!point) continue;
    const { x, y } = point;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = y * width + x;
    if (seen[p]) continue;
    const i = p * 4;
    if (!shouldClear(data[i], data[i + 1], data[i + 2], data[i + 3])) continue;
    seen[p] = 1;
    data[i + 3] = 0;
    stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 });
  }
}

function isNearBlack(r, g, b) {
  return r < 18 && g < 18 && b < 18;
}

function isPageWhite(r, g, b, a) {
  if (a < 10) return false;
  return r > 236 && g > 232 && b > 228 && Math.abs(r - b) < 18;
}

function knockOutBackdrop(png) {
  const starts = [
    { x: 0, y: 0 },
    { x: png.width - 1, y: 0 },
    { x: 0, y: png.height - 1 },
    { x: png.width - 1, y: png.height - 1 },
  ];
  flood(png, starts, (r, g, b, a) => a > 0 && isNearBlack(r, g, b));
}

function knockOutPageHoles(png) {
  const seeds = [];
  const probes = [
    [0.27, 0.48],
    [0.73, 0.48],
    [0.22, 0.35],
    [0.78, 0.35],
  ];
  for (const [fx, fy] of probes) {
    const x = Math.round(png.width * fx);
    const y = Math.round(png.height * fy);
    const i = (y * png.width + x) * 4;
    if (isPageWhite(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3])) {
      seeds.push({ x, y });
    }
  }
  if (seeds.length === 0) {
    console.log("frame: no white page seed found");
    return;
  }
  flood(png, seeds, (r, g, b, a) => isPageWhite(r, g, b, a));
}

function cropToContent(png, pad = 2) {
  const b = contentBounds(png);
  const minX = Math.max(0, b.minX - pad);
  const minY = Math.max(0, b.minY - pad);
  const maxX = Math.min(png.width - 1, b.maxX + pad);
  const maxY = Math.min(png.height - 1, b.maxY + pad);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = ((y + minY) * png.width + (x + minX)) * 4;
      const di = (y * width + x) * 4;
      out.data[di] = png.data[si];
      out.data[di + 1] = png.data[si + 1];
      out.data[di + 2] = png.data[si + 2];
      out.data[di + 3] = png.data[si + 3];
    }
  }
  return out;
}

function contentBounds(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const a = png.data[(y * png.width + x) * 4 + 3];
      if (a < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

function hexToRgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function makeSpine({ width, height, fill, edge }) {
  const png = new PNG({ width, height });
  const radius = Math.round(Math.min(width, height) * 0.08);
  const f = hexToRgb(fill);
  const e = hexToRgb(edge);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x < radius ? radius - x : x > width - 1 - radius ? x - (width - 1 - radius) : 0;
      const dy = y < radius ? radius - y : y > height - 1 - radius ? y - (height - 1 - radius) : 0;
      const outside = dx * dx + dy * dy > radius * radius;
      const i = (y * width + x) * 4;
      if (outside) {
        png.data[i + 3] = 0;
        continue;
      }
      const border = x < 2 || y < 2 || x > width - 3 || y > height - 3;
      const highlight = x < width * 0.22;
      const color = border ? e : f;
      png.data[i] = highlight && !border ? Math.min(255, color.r + 18) : color.r;
      png.data[i + 1] = highlight && !border ? Math.min(255, color.g + 14) : color.g;
      png.data[i + 2] = highlight && !border ? Math.min(255, color.b + 12) : color.b;
      png.data[i + 3] = 255;
    }
  }
  return png;
}

function noisePng(size) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = 150 + Math.floor(Math.random() * 90);
      const i = (y * size + x) * 4;
      png.data[i] = v;
      png.data[i + 1] = v - 4;
      png.data[i + 2] = v - 8;
      png.data[i + 3] = 255;
    }
  }
  return png;
}

function rowDarkness(png, y, x0, x1) {
  let sum = 0;
  let count = 0;
  for (let x = x0; x < x1; x++) {
    const i = (y * png.width + x) * 4;
    if (png.data[i + 3] < 20) continue;
    sum += (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    count++;
  }
  return count ? sum / count : 255;
}

const publicRoot = path.join(root, "public", "assets");

const bookshelf = readPng(sources.bookshelf);
const book = readPng(sources.book);
const frame = readPng(sources.frame);
const character = readPng(sources.character);

for (const [name, png] of [
  ["bookshelf", bookshelf],
  ["book", book],
  ["frame", frame],
  ["character", character],
]) {
  console.log(name, `${png.width}x${png.height}`, "alpha", alphaExtent(png), "corner", corner(png));
}

knockOutBackdrop(bookshelf);
knockOutBackdrop(book);
knockOutBackdrop(frame);
knockOutPageHoles(frame);
knockOutBackdrop(character);

const shelfCut = cropToContent(bookshelf, 0);
const bookCut = cropToContent(book, 1);
const frameCut = cropToContent(frame, 2);
const characterCut = cropToContent(character, 1);

console.log("cropped shelf", shelfCut.width, shelfCut.height);
console.log("cropped book", bookCut.width, bookCut.height);
console.log("cropped frame", frameCut.width, frameCut.height);
console.log("cropped character", characterCut.width, characterCut.height);

const frameMid = ((Math.floor(frameCut.height / 2) * frameCut.width + Math.floor(frameCut.width * 0.28)) * 4);
console.log("frame left-page pixel", [
  frameCut.data[frameMid],
  frameCut.data[frameMid + 1],
  frameCut.data[frameMid + 2],
  frameCut.data[frameMid + 3],
]);

writePng(path.join(publicRoot, "scene", "bookshelf.png"), shelfCut);
writePng(path.join(publicRoot, "books", "shelf", "book-01.png"), bookCut);
writePng(path.join(publicRoot, "ui", "book-open-frame.png"), frameCut);
writePng(path.join(publicRoot, "scene", "character-idle.png"), characterCut);
writePng(path.join(publicRoot, "ui", "paper-grain.png"), noisePng(128));

const spines = [
  ["book-02.png", 86, 340, "#E7D3C4", "#C9B09A"],
  ["book-03.png", 78, 340, "#D5DDD4", "#A8B8A8"],
  ["book-04.png", 92, 340, "#E4C8B4", "#C49A84"],
  ["book-05.png", 280, 78, "#F3E0C8", "#D9BFA4"],
];
for (const [name, w, h, fill, edge] of spines) {
  writePng(
    path.join(publicRoot, "books", "shelf", name),
    makeSpine({ width: w, height: h, fill, edge }),
  );
}

fs.mkdirSync(path.join(publicRoot, "loading"), { recursive: true });
fs.copyFileSync(sources.intro, path.join(publicRoot, "loading", "intro.gif"));
fs.copyFileSync(sources.intro, path.join(publicRoot, "loading", "loading.gif"));

const bounds = { minX: 0, minY: 0, maxX: shelfCut.width - 1, maxY: shelfCut.height - 1 };
console.log("bookshelf content bounds", bounds, "size", pngSize(bounds));

function pngSize(b) {
  return { w: b.maxX - b.minX + 1, h: b.maxY - b.minY + 1 };
}

const x0 = Math.round(shelfCut.width * 0.18);
const x1 = Math.round(shelfCut.width * 0.82);
const bands = [];
for (let y = 0; y < shelfCut.height; y++) {
  bands.push({ y, d: Math.round(rowDarkness(shelfCut, y, x0, x1)) });
}
const edges = bands.filter((row, i) => i > 0 && Math.abs(row.d - bands[i - 1].d) >= 6);
console.log(
  "sample rows",
  bands.filter((_, i) => i % 20 === 0).map((row) => `${row.y}:${row.d}`).join(" "),
);
console.log("edges", edges.map((row) => `${row.y}:${row.d}`).join(" "));
const groups = [];
for (const row of bands) {
  const last = groups[groups.length - 1];
  const kind = row.d > 95 ? "light" : "dark";
  if (!last || last.kind !== kind) groups.push({ kind, y0: row.y, y1: row.y, d: row.d });
  else last.y1 = row.y;
}
console.log(
  "bands",
  groups.map((g) => `${g.kind} ${g.y0}-${g.y1} (${g.y1 - g.y0 + 1}px)`),
);

const introStat = fs.statSync(sources.intro);
console.log("intro gif bytes", introStat.size);
