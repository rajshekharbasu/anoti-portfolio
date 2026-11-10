import type { PointerEvent } from "react";
import type { Project, ShelfPlacement } from "../content/types";
import { AssetImage } from "./AssetImage";

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
      <div className="h-full w-full" style={{ transform: `rotate(${placement.rotation}deg)` }}>
        <button
          type="button"
          className="book-hit relative block h-full w-full"
          aria-label={project.title}
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
            if (editMode) return;
            onOpen();
          }}
        >
          <span className="book-shadow pointer-events-none absolute inset-x-1 bottom-0 h-2 rounded-full bg-ink/30 blur-[2px]" />
          <span className="lift relative block h-full w-full">
            <AssetImage
              src={placement.image}
              alt=""
              label={project.title}
              className="h-full w-full object-contain object-bottom"
            />
            {placement.showLabel ? (
              <span className="spine-label pointer-events-none absolute inset-[10%_0] grid place-items-center font-serif text-[1.5cqi] tracking-wide">
                {project.title}
              </span>
            ) : null}
          </span>
          <span
            role="tooltip"
            data-open={tipVisible ? "true" : "false"}
            data-instant={tipInstant ? "true" : "false"}
            className="tip whitespace-nowrap rounded-sm bg-card px-2 py-1 font-serif text-xs text-ink shadow-[var(--shadow-paper)]"
            aria-hidden={tipVisible ? undefined : true}
          >
            {project.title}
          </span>
        </button>
      </div>
    </div>
  );
}
