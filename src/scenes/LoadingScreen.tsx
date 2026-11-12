import { site } from "../content/site";

const HOLD_MS = 2000;

// The drawing sits in a wide band inside a taller transparent frame.
const CROP = { canvasW: 2752, canvasH: 2064, x: 180, y: 740, w: 2440, h: 680 };

type LoadingScreenProps = {
  leaving: boolean;
  loopMs: number;
  onExited: () => void;
};

export function LoadingScreen({ leaving, onExited }: LoadingScreenProps) {
  return (
    <div
      className="loader fixed inset-0 z-[100] grid place-items-center bg-paper"
      data-leaving={leaving ? "true" : "false"}
      onTransitionEnd={(event) => {
        if (event.propertyName === "opacity" && leaving) onExited();
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{ width: "min(78vw, 1040px)", aspectRatio: `${CROP.w} / ${CROP.h}` }}
      >
        <img
          src={site.loadingAnimation}
          alt=""
          className="absolute max-w-none"
          style={{
            width: `${(CROP.canvasW / CROP.w) * 100}%`,
            left: `${(-CROP.x / CROP.w) * 100}%`,
            top: `${(-CROP.y / CROP.h) * 100}%`,
          }}
        />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export { HOLD_MS };
