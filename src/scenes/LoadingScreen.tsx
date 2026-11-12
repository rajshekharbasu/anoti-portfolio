import { site } from "../content/site";

const HOLD_MS = 2000;

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
      <img
        src={site.loadingAnimation}
        alt=""
        className="block h-auto w-[min(78vw,1040px)]"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export { HOLD_MS };
