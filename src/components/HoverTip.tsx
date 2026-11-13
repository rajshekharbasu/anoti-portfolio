import { useLayoutEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type HoverTipProps = {
  open: boolean;
  instant: boolean;
  anchor: RefObject<HTMLElement | null>;
  placement?: "above" | "below";
  wide?: boolean;
  children: ReactNode;
};

export function HoverTip({
  open,
  instant,
  anchor,
  placement = "above",
  wide = false,
  children,
}: HoverTipProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const node = anchor.current;
    if (!open || !node) return;
    const place = () => {
      const rect = node.getBoundingClientRect();
      setPoint({
        x: rect.left + rect.width / 2,
        y: placement === "below" ? rect.bottom + 8 : rect.top - 8,
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, placement]);

  if (!open || !point) return null;

  return createPortal(
    <span
      role="tooltip"
      className={`hover-tip book-title${wide ? " hover-tip-wide" : ""}${placement === "below" ? " hover-tip-below" : ""}${instant ? " hover-tip-instant" : ""}`}
      style={{ left: point.x, top: point.y }}
    >
      {children}
    </span>,
    document.body,
  );
}
