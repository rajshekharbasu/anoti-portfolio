import type { DialogueLine } from "../content/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function lineText(line: DialogueLine): string {
  return typeof line === "string" ? line : line.text;
}

export function isFlipHandle(value: unknown): value is {
  pageFlip: () => unknown;
} {
  return isRecord(value) && typeof value.pageFlip === "function";
}

export function isPageFlip(value: unknown): value is {
  flipNext: () => void;
  flipPrev: () => void;
  getCurrentPageIndex: () => number;
  destroy: () => void;
} {
  if (!isRecord(value)) return false;
  return (
    typeof value.flipNext === "function" &&
    typeof value.flipPrev === "function" &&
    typeof value.getCurrentPageIndex === "function" &&
    typeof value.destroy === "function"
  );
}

export function isFlipEvent(value: unknown): value is { data: number } {
  return isRecord(value) && typeof value.data === "number";
}
