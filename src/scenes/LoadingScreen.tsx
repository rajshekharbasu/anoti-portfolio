import { useEffect, useState } from "react";
import { site } from "../content/site";

const HOLD_MS = 2000;

type LoadingScreenProps = {
  leaving: boolean;
  loopMs: number;
  onExited: () => void;
};

export function LoadingScreen({ leaving, loopMs, onExited }: LoadingScreenProps) {
  const [holding, setHolding] = useState(loopMs <= 0);

  useEffect(() => {
    if (loopMs <= 0) {
      setHolding(true);
      return;
    }
    const timeout = window.setTimeout(() => setHolding(true), loopMs);
    return () => window.clearTimeout(timeout);
  }, [loopMs]);

  return (
    <div
      className="loader fixed inset-0 z-[100] grid place-items-center bg-paper"
      data-leaving={leaving ? "true" : "false"}
      onTransitionEnd={(event) => {
        if (event.propertyName === "opacity" && leaving) onExited();
      }}
    >
      <img
        src={holding ? site.loadingLastFrame : site.loadingAnimation}
        alt=""
        className="h-auto max-h-[68vh] w-[min(68vw,760px)] object-contain"
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export { HOLD_MS };
