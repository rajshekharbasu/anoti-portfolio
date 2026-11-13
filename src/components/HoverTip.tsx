import { useLayoutEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type HoverTipProps = {
  open: boolean;
  instant: boolean;
  anchor: RefObject<HTMLElement | null>;
  placement?: "above" | "below" | "left";
  frameInset?: { top: number; bottom: number; left: number };
  wide?: boolean;
  children: ReactNode;
};

export function HoverTip({
  open,
  instant,
  anchor,
  placement = "above",
  frameInset,
  wide = false,
  children,
}: HoverTipProps) {
  const [point, setPoint] = useState<{ x: number; y: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const node = anchor.current;
    if (!open || !node) return;
    const place = () => {
      const rect = node.getBoundingClientRect();
      if (placement === "left") {
        const top = rect.top + rect.height * (frameInset?.top ?? 0);
        const height = rect.height * (1 - (frameInset?.top ?? 0) - (frameInset?.bottom ?? 0));
        const left = rect.left + rect.width * (frameInset?.left ?? 0);
        setPoint({ x: left - 10, y: top, height });
        return;
      }
      setPoint({
        x: rect.left + rect.width / 2,
        y: placement === "below" ? rect.bottom + 8 : rect.top - 8,
        height: 0,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, placement, frameInset]);

  if (!open || !point) return null;

  return createPortal(
    <span
      role="tooltip"
      className={`hover-tip book-title${wide ? " hover-tip-wide" : ""}${placement === "below" ? " hover-tip-below" : ""}${placement === "left" ? " hover-tip-left" : ""}${instant ? " hover-tip-instant" : ""}`}
      style={{
        left: point.x,
        top: point.y,
        height: placement === "left" ? point.height : undefined,
      }}
    >
      {children}
    </span>,
    document.body,
  );
}
