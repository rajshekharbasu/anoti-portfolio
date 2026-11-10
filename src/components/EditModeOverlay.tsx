import { useState } from "react";
import { site } from "../content/site";

type EditModeOverlayProps = {
  json: string;
};

export function EditModeOverlay({ json }: EditModeOverlayProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      console.info(json);
    }
  }

  return (
    <aside className="fixed bottom-4 left-4 z-[90] w-[min(360px,calc(100vw-2rem))] rounded-md bg-card p-3 text-ink shadow-[var(--shadow-paper)]">
      <p className="font-sans text-xs leading-relaxed">{site.ui.editHint}</p>
      <pre className="mt-2 max-h-40 overflow-auto font-sans text-[11px] leading-snug">{json}</pre>
      <button
        type="button"
        className="press mt-2 inline-flex min-h-11 items-center font-serif text-sm underline underline-offset-4"
        onClick={() => {
          void copy();
        }}
      >
        {copied ? site.ui.copied : site.ui.copyPositions}
      </button>
    </aside>
  );
}
