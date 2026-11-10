import fs from "node:fs";
import { PNG } from "pngjs";
import { decompressFrames, parseGIF } from "gifuct-js";

const source = "public/assets/envelope.gif";
const buf = fs.readFileSync(source);
const gif = parseGIF(buf);
const frames = decompressFrames(gif, true);
const width = gif.lsd.width;
const height = gif.lsd.height;
console.log("frames", frames.length, "size", width, height);

const canvas = new Uint8ClampedArray(width * height * 4);
let previous = null;

function restoreBackground(frame) {
  const { width: fw, height: fh, top, left } = frame.dims;
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const di = ((top + y) * width + (left + x)) * 4;
      canvas[di + 3] = 0;
    }
  }
}

function blit(frame) {
  const { width: fw, height: fh, top, left } = frame.dims;
  const patch = frame.patch;
  for (let y = 0; y < fh; y++) {
    for (let x = 0; x < fw; x++) {
      const si = (y * fw + x) * 4;
      if (patch[si + 3] < 16) continue;
      const di = ((top + y) * width + (left + x)) * 4;
      canvas[di] = patch[si];
      canvas[di + 1] = patch[si + 1];
      canvas[di + 2] = patch[si + 2];
      canvas[di + 3] = 255;
    }
  }
}

function save(name) {
  const png = new PNG({ width, height });
  png.data.set(canvas);
  fs.mkdirSync("public/assets/intro", { recursive: true });
  fs.writeFileSync(`public/assets/intro/${name}.png`, PNG.sync.write(png));
}

frames.forEach((frame, index) => {
  if (previous && (previous.disposalType === 2 || previous.disposalType === 3)) {
    if (previous.disposalType === 2) restoreBackground(previous);
    if (previous.disposalType === 3 && previous.snapshot) canvas.set(previous.snapshot);
  }
  if (frame.disposalType === 3) frame.snapshot = canvas.slice();
  blit(frame);
  if (index === 0 || index === frames.length - 1) {
    save(index === 0 ? "envelope-first" : "envelope-last");
    console.log("saved", index, "disposal", frame.disposalType, "dims", frame.dims);
  }
  previous = frame;
});
