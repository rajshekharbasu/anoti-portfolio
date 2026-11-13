import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { motion } from "framer-motion";
import { site } from "../content/site";
import type { DialogueLine } from "../content/types";
import { lineText } from "../lib/guards";
import { useFocusTrap } from "../hooks/useFocusTrap";

const aboutClass = {
  baskerville: "about-baskerville",
  inter: "about-inter",
} as const;

type SpeechBubbleProps = {
  line: DialogueLine;
  canContinue: boolean;
  reduced: boolean;
  onAdvance: () => void;
  onClose: () => void;
  onViewLetter: () => void;
};

export function SpeechBubble({
  line,
  canContinue,
  reduced,
  onAdvance,
  onClose,
  onViewLetter,
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
      className="absolute top-[24%] left-[78%] z-[80] w-[20%] min-w-56 outline-none max-[767px]:left-[58%] max-[767px]:w-[40%]"
      style={{ transformOrigin: "left center" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        <p
          className={`pr-8 text-[15px] leading-relaxed ${aboutClass[site.aboutFace]}`}
          aria-live="polite"
        >
          {text.slice(0, count)}
        </p>
        {done && links.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                className="press inline-flex min-h-11 items-center text-sm underline decoration-ink/40 underline-offset-4"
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
        <button
          type="button"
          className="press mt-3 grid h-11 w-11 place-items-center text-ink"
          aria-label={site.ui.viewLetter}
          onClick={onViewLetter}
        >
          <LetterIcon />
        </button>
      </div>
    </motion.div>
  );
}

function LetterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.5 6.99982L14.0518 10.5596C12.747 11.1468 11.253 11.1468 9.94818 10.5596L2.5 6.99982" />
      <path d="M22 12.5V10C22 6.70017 22 5.05025 20.9749 4.02513C19.9497 3 18.2998 3 15 3H9C5.70017 3 4.05025 3 3.02513 4.02513C2 5.05025 2 6.70017 2 10V12C2 15.2998 2 16.9497 3.02513 17.9749C4.05025 19 5.70017 19 9 19H12" />
      <path d="M19 16.125V18M19 18V19.875M19 18H17.5M19 18H20.5M22 18L20.6987 17.5662C20.1015 17.3672 19.6328 16.8985 19.4338 16.3013L19 15L18.5662 16.3013C18.3672 16.8985 17.8985 17.3672 17.3013 17.5662L16 18L17.3013 18.4338C17.8985 18.6328 18.3672 19.1015 18.5662 19.6987L19 21L19.4338 19.6987C19.6328 19.1015 20.1015 18.6328 20.6987 18.4338L22 18Z" />
    </svg>
  );
}
