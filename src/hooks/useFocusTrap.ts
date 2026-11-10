import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;
    const root = container;

    const previous = document.activeElement;

    function items(): HTMLElement[] {
      return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => !element.hasAttribute("disabled"),
      );
    }

    if (container.tabIndex === -1) container.focus();
    else items()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const list = items();
      const start = list[0];
      const end = list[list.length - 1];
      if (!start || !end) return;
      if (event.shiftKey && document.activeElement === start) {
        event.preventDefault();
        end.focus();
      } else if (!event.shiftKey && document.activeElement === end) {
        event.preventDefault();
        start.focus();
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [active, containerRef]);
}
