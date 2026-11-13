import type { ProjectPage, SpreadPage } from "../content/types";

export type BookSlot =
  | { kind: "concept" }
  | { kind: "blank" }
  | { kind: "page"; page: Exclude<ProjectPage, SpreadPage> }
  | { kind: "spread"; page: SpreadPage; side: "left" | "right" };

function isSpread(page: ProjectPage): page is SpreadPage {
  return page.type === "full-spread";
}

function isSingle(page: ProjectPage): page is Exclude<ProjectPage, SpreadPage> {
  return page.type !== "full-spread";
}

// Page-flip wants an even count so the last spread is not a single dangling page.
export function buildSlots(pages: ProjectPage[], includeConcept = true): BookSlot[] {
  const slots: BookSlot[] = includeConcept ? [{ kind: "concept" }] : [];

  for (const page of pages) {
    if (isSpread(page)) {
      if (slots.length % 2 === 1) slots.push({ kind: "blank" });
      slots.push(
        { kind: "spread", page, side: "left" },
        { kind: "spread", page, side: "right" },
      );
      continue;
    }
    if (isSingle(page)) slots.push({ kind: "page", page });
  }

  if (slots.length % 2 === 1) slots.push({ kind: "blank" });
  return slots;
}
