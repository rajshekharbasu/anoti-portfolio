const GIF_LIMIT = 3 * 1024 * 1024;

function warnIfLargeGif(url: string, size: number): void {
  if (!url.toLowerCase().endsWith(".gif")) return;
  if (size > GIF_LIMIT) {
    const megabytes = (size / (1024 * 1024)).toFixed(1);
    console.warn(`GIF is over 3 MB (${megabytes} MB): ${url}`);
  }
}

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

async function loadOne(url: string): Promise<void> {
  if (url.toLowerCase().endsWith(".gif")) {
    try {
      const response = await fetch(url);
      if (response.ok) warnIfLargeGif(url, Number(response.headers.get("content-length") ?? 0));
    } catch {
      // A missing gif should not hold the loading screen.
    }
    return;
  }
  await loadImage(url);
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function preloadAssets(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => loadOne(url)));
}

export function warmImages(urls: string[]): void {
  for (const url of urls) {
    const image = new Image();
    image.src = url;
  }
}
