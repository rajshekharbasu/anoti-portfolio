import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import HTMLFlipBook from "react-pageflip";
import "page-flip/src/Style/stPageFlip.css";
import { site } from "../content/site";
import type { Project } from "../content/types";
import { isFlipEvent, isFlipHandle, isPageFlip } from "../lib/guards";
import { buildSlots } from "../lib/slots";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useSiteSound } from "../hooks/useSound";
import { BookPage } from "./BookPage";

type OpenBookProps = {
  project: Project;
  reduced: boolean;
  onClose: () => void;
};

export default function OpenBook({ project, reduced, onClose }: OpenBookProps) {
  const slots = buildSlots(project.pages);
  const dialogRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ pageFlip: () => unknown } | null>(null);
  const pageRef = useRef(0);
  const [page, setPage] = useState(0);
  const [backdropOn, setBackdropOn] = useState(false);
  const [frameFailed, setFrameFailed] = useState(false);
  const { play } = useSiteSound();
  useFocusTrap(true, dialogRef);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBackdropOn(true));
    const shell = shellRef.current;
    const from = document.getElementById(`shelf-book-${project.slug}`)?.getBoundingClientRect();
    if (!shell || reduced || !from) return () => window.cancelAnimationFrame(frame);
    const to = shell.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const scale = Math.min(1, Math.max(0.08, from.width / Math.max(to.width, 1)));
    shell.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.8 },
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
      ],
      { duration: 460, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" },
    );
    return () => window.cancelAnimationFrame(frame);
  }, [project.slug, reduced]);

  useEffect(() => {
    return () => {
      const api = flipRef.current?.pageFlip();
      if (!isPageFlip(api)) return;
      const parent = mountRef.current;
      const block = parent?.querySelector(".stf__parent");
      api.destroy();
      if (parent && block instanceof HTMLElement && !block.isConnected) {
        parent.appendChild(block);
      }
    };
  }, []);

  function turn(direction: -1 | 1) {
    const api = flipRef.current?.pageFlip();
    if (!isPageFlip(api)) return;
    if (direction < 0) api.flipPrev();
    else api.flipNext();
  }

  function close() {
    const shell = shellRef.current;
    const target = document.getElementById(`shelf-book-${project.slug}`)?.getBoundingClientRect();
    setBackdropOn(false);
    if (!shell || !target || reduced) {
      onClose();
      return;
    }
    const from = shell.getBoundingClientRect();
    const dx = target.left + target.width / 2 - (from.left + from.width / 2);
    const dy = target.top + target.height / 2 - (from.top + from.height / 2);
    const scale = Math.max(0.08, target.width / Math.max(from.width, 1));
    const animation = shell.animate(
      [
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.15 },
      ],
      { duration: 300, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" },
    );
    animation.onfinish = () => onClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      turn(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      turn(-1);
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      tabIndex={-1}
      className="fixed inset-0 z-[60] flex items-center justify-center outline-none"
      style={{
        background: project.bookColor,
        opacity: backdropOn ? 1 : 0,
        transition: reduced ? "none" : "opacity 280ms var(--ease-out)",
      }}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        className="press absolute right-4 top-4 z-10 inline-flex min-h-11 items-center font-serif text-sm underline underline-offset-4"
        onClick={close}
      >
        {site.ui.close}
      </button>
      <div className="flex w-[min(1040px,calc(100vw-2rem))] flex-col items-center max-[767px]:w-[min(440px,calc(100vw-1.5rem))]">
        <div ref={shellRef} className="relative w-full" style={{ aspectRatio: "979 / 674" }}>
          {frameFailed ? <SketchFrame /> : null}
          <img
            src={site.assets.bookFrame}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full"
            onError={() => setFrameFailed(true)}
          />
          <div ref={mountRef} className="absolute inset-[5.5%_5%_6.5%_5%]">
            <HTMLFlipBook
              width={460}
              height={640}
              size="stretch"
              minWidth={280}
              maxWidth={520}
              minHeight={360}
              maxHeight={760}
              drawShadow={!reduced}
              flippingTime={reduced ? 1 : 650}
              usePortrait
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.35}
              showCover={false}
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners={!reduced}
              disableFlipByClick={false}
              startPage={0}
              className="h-full w-full"
              style={{ width: "100%", height: "100%" }}
              onFlip={(event) => {
                if (!isFlipEvent(event) || event.data === pageRef.current) return;
                pageRef.current = event.data;
                setPage(event.data);
                play("flip");
              }}
              ref={(node) => {
                flipRef.current = isFlipHandle(node) ? node : null;
              }}
            >
              {slots.map((slot, index) => (
                <BookPage
                  key={`${project.slug}-${index}`}
                  slot={slot}
                  project={project}
                  eager={index < 4}
                />
              ))}
            </HTMLFlipBook>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <button
            type="button"
            className="press inline-flex h-11 w-11 items-center justify-center font-serif text-2xl disabled:opacity-30"
            aria-label={site.ui.previousPage}
            disabled={page <= 0}
            onClick={() => turn(-1)}
          >
            ‹
          </button>
          <p className="min-w-16 text-center font-serif text-sm" aria-live="polite">
            {page + 1} / {slots.length}
          </p>
          <button
            type="button"
            className="press inline-flex h-11 w-11 items-center justify-center font-serif text-2xl disabled:opacity-30"
            aria-label={site.ui.nextPage}
            disabled={page >= slots.length - 1}
            onClick={() => turn(1)}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

function SketchFrame() {
  return (
    <svg
      viewBox="0 0 100 69"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect x="1.2" y="1.4" width="97.6" height="66" rx="1.5" fill="#f4c6d3" />
      <rect x="3.2" y="3" width="93.6" height="63" rx="1" fill="#fffaf3" />
      <path
        d="M4 6c8-3 16-3 22 0s12 3 20 0 14-3 22 0 16 2 28-1"
        fill="none"
        stroke="#3b2a26"
        strokeWidth="0.7"
      />
      <path
        d="M4 63c8 3 16 3 22 0s12-3 20 0 14 3 22 0 16-2 28 1"
        fill="none"
        stroke="#3b2a26"
        strokeWidth="0.7"
      />
      <line x1="50" y1="4" x2="50" y2="65" stroke="#3b2a26" strokeWidth="0.45" />
    </svg>
  );
}
