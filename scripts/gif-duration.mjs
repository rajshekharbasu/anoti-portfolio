import fs from "node:fs";

function duration(file) {
  const b = fs.readFileSync(file);
  let i = 13;
  const packed = b[10];
  if (packed & 0x80) {
    const size = 3 * (1 << ((packed & 7) + 1));
    i = 13 + size;
  }
  let total = 0;
  let frames = 0;
  while (i < b.length) {
    if (b[i] === 0x21 && b[i + 1] === 0xf9 && b[i + 2] === 0x04) {
      let delay = b.readUInt16LE(i + 4);
      if (delay === 0) delay = 10;
      total += delay;
      frames += 1;
      i += 8;
      continue;
    }
    if (b[i] === 0x2c) {
      i += 10;
      if (b[i - 1] & 0x80) i += 3 * (1 << ((b[i - 1] & 7) + 1));
      i += 1;
      while (i < b.length) {
        const n = b[i];
        i += 1;
        if (n === 0) break;
        i += n;
      }
      continue;
    }
    if (b[i] === 0x21) {
      i += 2;
      while (i < b.length) {
        const n = b[i];
        i += 1;
        if (n === 0) break;
        i += n;
      }
      continue;
    }
    if (b[i] === 0x3b) break;
    i += 1;
  }
  console.log(file, "frames", frames, "ms", total * 10);
}

duration("public/assets/loading/intro.gif");
duration("public/assets/envelope.gif");
duration("public/assets/kirby.GIF");
