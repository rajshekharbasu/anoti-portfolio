export async function gifDurationMs(url: string): Promise<number> {
  try {
    const response = await fetch(url);
    if (!response.ok) return 2000;
    const bytes = new Uint8Array(await response.arrayBuffer());
    const ms = readGifDuration(bytes);
    return ms > 0 ? ms : 0;
  } catch {
    return 2000;
  }
}

function readGifDuration(bytes: Uint8Array): number {
  if (bytes.length < 14) return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let index = 13;
  const packed = bytes[10] ?? 0;
  if (packed & 0x80) {
    const colors = 1 << ((packed & 7) + 1);
    index = 13 + colors * 3;
  }
  let total = 0;
  while (index < bytes.length) {
    const marker = bytes[index];
    if (marker === 0x21 && bytes[index + 1] === 0xf9 && bytes[index + 2] === 0x04) {
      let delay = view.getUint16(index + 4, true);
      if (delay === 0) delay = 10;
      total += delay;
      index += 8;
      continue;
    }
    if (marker === 0x2c) {
      index += 10;
      const imagePacked = bytes[index - 1] ?? 0;
      if (imagePacked & 0x80) index += 3 * (1 << ((imagePacked & 7) + 1));
      index += 1;
      while (index < bytes.length) {
        const size = bytes[index] ?? 0;
        index += 1;
        if (size === 0) break;
        index += size;
      }
      continue;
    }
    if (marker === 0x21) {
      index += 2;
      while (index < bytes.length) {
        const size = bytes[index] ?? 0;
        index += 1;
        if (size === 0) break;
        index += size;
      }
      continue;
    }
    if (marker === 0x3b) break;
    index += 1;
  }
  return total * 10;
}
