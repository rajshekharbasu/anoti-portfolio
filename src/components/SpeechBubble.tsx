import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { site } from "../content/site";
import type { DialogueLine } from "../content/types";
import { lineText } from "../lib/guards";
import { useFocusTrap } from "../hooks/useFocusTrap";

type SpeechBubbleProps = {
  line: DialogueLine;
  canContinue: boolean;
  mobile: boolean;
  reduced: boolean;
  onAdvance: () => void;
  onClose: () => void;
};

export function SpeechBubble({
  line,
  canContinue,
  mobile,
  reduced,
  onAdvance,
  onClose,
}: SpeechBubbleProps) {
  const text = lineText(line);
  const links = typeof line === "string" ? [] : line.links;
  const [count, setCount] = useState(reduced ? text.length : 0);
  const done = count >= text.length;
  const bubbleRef = useRef<HTMLDivElement>(null);
  useFocusTrap(true, bubbleRef);

  useEffect(() => {
    if (reduced) {
      setCount(text.length);
      return;
    }
    setCount(0);
  }, [text, reduced]);

  useEffect(() => {
    if (reduced || count >= text.length) return;
    const timer = window.setTimeout(() => setCount(count + 1), 16);
    return () => window.clearTimeout(timer);
  }, [count, reduced, text.length]);

  function advance() {
    if (!done) {
      setCount(text.length);
      return;
    }
    if (canContinue) onAdvance();
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement) return;
    event.stopPropagation();
  }

  function onClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement) return;
    advance();
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={site.name}
      ref={bubbleRef}
      tabIndex={-1}
      className={
        mobile
          ? "absolute left-1/2 top-[92%] z-40 w-[min(78cqi,320px)] outline-none"
          : "absolute top-[2%] right-[62%] z-40 w-[min(28cqi,280px)] outline-none"
      }
      style={{ transformOrigin: mobile ? "top center" : "90% 100%" }}
      initial={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, transform: mobile ? "translateX(-50%) scale(0.96)" : "scale(0.96)" }
      }
      animate={{ opacity: 1, transform: mobile ? "translateX(-50%) scale(1)" : "scale(1)" }}
      exit={
        reduced
          ? { opacity: 0 }
          : { opacity: 0, transform: mobile ? "translateX(-50%) scale(0.98)" : "scale(0.98)" }
      }
      transition={
        reduced
          ? { duration: 0.15 }
          : { type: "spring", duration: 0.38, bounce: 0.14 }
      }
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.key !== " ") return;
        const target = event.target;
        if (target instanceof HTMLAnchorElement || target instanceof HTMLButtonElement) return;
        event.preventDefault();
        advance();
      }}
    >
      <div className="relative rounded-[18px] rounded-br-[6px] bg-card px-4 py-3 text-left shadow-[var(--shadow-paper)]">
        <button
          type="button"
          className="press absolute right-1 top-1 grid h-11 w-11 place-items-center font-serif text-lg"
          aria-label={site.ui.closeDialogue}
          onClick={onClose}
        >
          ×
        </button>
        <p className="pr-8 font-serif text-[15px] leading-relaxed italic" aria-live="polite">
          {text.slice(0, count)}
        </p>
        {done && links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="press inline-flex min-h-11 items-center font-sans text-sm underline decoration-ink/40 underline-offset-4"
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
        {done && canContinue ? (
          <p className="mt-3 font-sans text-[11px] text-muted">{site.ui.clickToContinue}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
