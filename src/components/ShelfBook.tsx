import { useRef, type PointerEvent } from "react";
import type { Project, ShelfPlacement } from "../content/types";
import { HoverTip } from "./HoverTip";

type ShelfBookProps = {
  project: Project;
  placement: ShelfPlacement;
  editMode: boolean;
  tipVisible: boolean;
  tipInstant: boolean;
  onShowTip: () => void;
  onHideTip: () => void;
  onOpen: () => void;
  onWarm: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export function ShelfBook({
  project,
  placement,
  editMode,
  tipVisible,
  tipInstant,
  onShowTip,
  onHideTip,
  onOpen,
  onWarm,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ShelfBookProps) {
  const wip = project.format === "wip";
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      id={`shelf-book-${project.slug}`}
      className="absolute"
      style={{
        left: `${placement.x}%`,
        top: `${placement.y}%`,
        width: `${placement.width}%`,
        height: `${placement.height}%`,
        zIndex: placement.z,
        touchAction: editMode ? "none" : "auto",
      }}
      onPointerDown={editMode ? onPointerDown : undefined}
      onPointerMove={editMode ? onPointerMove : undefined}
      onPointerUp={editMode ? onPointerUp : undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        className={wip ? "relative block h-full w-full" : "book-hit relative block h-full w-full"}
        aria-label={wip ? `${project.title}, ${project.hover}` : project.title}
        onMouseEnter={() => {
          onShowTip();
          onWarm();
        }}
        onMouseLeave={onHideTip}
        onFocus={() => {
          onShowTip();
          onWarm();
        }}
        onBlur={onHideTip}
        onClick={() => {
          if (editMode || wip) return;
          onOpen();
        }}
      >
        {wip ? null : (
          <span
            className="block h-full w-full"
            style={{ transform: `rotate(${placement.rotation}deg)`, transformOrigin: "bottom center" }}
          >
            <span className="lift relative block h-full w-full">
              <span className="book-side">
                <span className="book-side__spine" style={{ background: project.bookColor }} />
                <span className="book-side__pages" />
              </span>
            </span>
          </span>
        )}
      </button>
      <HoverTip open={tipVisible} instant={tipInstant} anchor={buttonRef} wide>
        {project.hover}
      </HoverTip>
    </div>
  );
}
