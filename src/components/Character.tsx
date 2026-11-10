import type { PointerEvent } from "react";
import { site } from "../content/site";
import { AssetImage } from "./AssetImage";

type CharacterProps = {
  x: number;
  y: number;
  width: number;
  talking: boolean;
  breathe: boolean;
  editMode: boolean;
  expanded: boolean;
  tipVisible: boolean;
  tipInstant: boolean;
  onShowTip: () => void;
  onHideTip: () => void;
  onOpen: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
};

export function Character({
  x,
  y,
  width,
  talking,
  breathe,
  editMode,
  expanded,
  tipVisible,
  tipInstant,
  onShowTip,
  onHideTip,
  onOpen,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: CharacterProps) {
  const src = talking ? site.character.talking : site.character.idle;

  return (
    <div
      id="shelf-character"
      className="absolute z-20"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        touchAction: editMode ? "none" : "auto",
      }}
      onPointerDown={editMode ? onPointerDown : undefined}
      onPointerMove={editMode ? onPointerMove : undefined}
      onPointerUp={editMode ? onPointerUp : undefined}
    >
      <div className={breathe ? "breathe" : undefined}>
        <button
          type="button"
          className="character-hit relative block w-full"
          aria-label={site.ui.sayHi}
          aria-expanded={expanded}
          onMouseEnter={onShowTip}
          onMouseLeave={onHideTip}
          onFocus={onShowTip}
          onBlur={onHideTip}
          onClick={() => {
            if (editMode) return;
            onOpen();
          }}
        >
          <span className="lift block">
            <AssetImage
              src={src}
              fallbackSrc={site.character.idleFallback}
              alt={site.character.alt}
              label={site.name}
              fetchPriority="high"
              className="h-auto w-full"
            />
          </span>
          <span
            role="tooltip"
            data-open={tipVisible ? "true" : "false"}
            data-instant={tipInstant ? "true" : "false"}
            className="tip whitespace-nowrap rounded-sm bg-card px-2 py-1 font-serif text-xs shadow-[var(--shadow-paper)]"
            aria-hidden={tipVisible ? undefined : true}
          >
            {site.ui.sayHi}
          </span>
        </button>
      </div>
    </div>
  );
}
