import { useEffect, useRef, useState } from "react";
import { site } from "../content/site";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSiteSound } from "../hooks/useSound";
import { gifDurationMs } from "../lib/gifTiming";

type EnvelopeIntroProps = {
  onEnter: () => void;
  replay?: boolean;
};

type Phase = "sealed" | "opening" | "reading";

const frameClass = "block w-full";

export function EnvelopeIntro({ onEnter, replay = false }: EnvelopeIntroProps) {
  const reduced = useReducedMotion();
  const { play } = useSiteSound();
  const [phase, setPhase] = useState<Phase>(replay && reduced ? "reading" : "sealed");
  const [gifMs, setGifMs] = useState(3010);
  const [gifSrc, setGifSrc] = useState("");
  const [gifReady, setGifReady] = useState(false);
  const gifBlob = useRef<Blob | null>(null);
  const [showButton, setShowButton] = useState(false);
  const playedReplay = useRef(false);
  const paragraphs = site.openingStatement.split(/\n+/).filter((line) => line.trim().length > 0);

  useEffect(() => {
    let active = true;
    void gifDurationMs(site.assets.envelopeOpen).then((ms) => {
      if (active) setGifMs(ms);
    });
    void fetch(site.assets.envelopeOpen)
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!active || !blob) return;
        gifBlob.current = blob;
        if (replay && !reduced) {
          setGifReady(false);
          setGifSrc(URL.createObjectURL(blob));
          setPhase("opening");
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [replay]);

  useEffect(() => {
    if (!replay || reduced || phase !== "opening") return;
    if (!playedReplay.current) {
      playedReplay.current = true;
      play("rustle");
    }
    const timeout = window.setTimeout(() => setPhase("reading"), Math.max(400, gifMs - 40));
    return () => window.clearTimeout(timeout);
  }, [replay, reduced, phase, gifMs, play]);

  useEffect(() => {
    if (phase !== "reading") return;
    const wait = reduced ? 200 : paragraphs.length * 280 + 500;
    const timeout = window.setTimeout(() => setShowButton(true), wait);
    return () => window.clearTimeout(timeout);
  }, [phase, paragraphs.length, reduced]);

  function open() {
    if (phase !== "sealed") return;
    play("rustle");
    if (reduced) {
      setPhase("reading");
      return;
    }
    const blob = gifBlob.current;
    setGifReady(false);
    setGifSrc(blob ? URL.createObjectURL(blob) : site.assets.envelopeOpen);
    setPhase("opening");
    window.setTimeout(() => setPhase("reading"), Math.max(400, gifMs - 40));
  }

  return (
    <div
      className={
        replay
          ? "fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-paper px-5 py-8"
          : "relative grid h-svh place-items-center overflow-hidden px-5 py-8"
      }
    >
      {replay ? null : (
        <button
          type="button"
          className="press fixed top-4 left-4 z-[90] font-sans text-sm underline decoration-ink/30 underline-offset-4"
          onClick={(event) => finishIntro(event, onEnter)}
        >
          {site.ui.skipIntro}
        </button>
      )}

      <div className="envelope-fit flex flex-col items-center">
        <div className="relative w-full">
          {phase === "sealed" || (phase === "opening" && !gifReady) ? (
            <button
              type="button"
              className={phase === "sealed" && !replay ? "press bob w-full" : "block w-full"}
              disabled={phase !== "sealed"}
              aria-label={site.ui.clickToOpen}
              onClick={open}
            >
              <Frame src={site.assets.envelopeFirst} />
            </button>
          ) : null}
          {phase !== "sealed" && gifSrc ? (
            <img
              src={gifSrc}
              alt=""
              className={
                phase === "opening" && !gifReady
                  ? "absolute inset-0 h-full w-full"
                  : "block w-full"
              }
              onLoad={() => setGifReady(true)}
            />
          ) : null}
          {phase === "reading" ? (
            <div className="letter-hand absolute top-[12%] right-[13%] bottom-[10%] left-[14%] flex flex-col text-ink">
              <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-[0.45em] overflow-y-auto">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className="letter-line text-[clamp(0.78rem,1.45vw,1.02rem)] leading-snug"
                    style={{ animationDelay: reduced ? "0ms" : `${index * 220}ms` }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {showButton ? (
                <button
                  type="button"
                  className="press mt-2 inline-flex min-h-11 shrink-0 items-center self-start text-[clamp(0.85rem,1.5vw,1.05rem)] underline decoration-ink/40 underline-offset-8"
                  onClick={(event) => finishIntro(event, onEnter)}
                >
                  {site.ui.enterLibrary}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        {phase === "sealed" && !replay ? (
          <p className="mt-5 font-serif text-sm italic text-muted" aria-hidden="true">
            {site.ui.clickToOpen}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Frame({ src }: { src: string }) {
  return (
    <span className="isolate block bg-paper">
      <img src={src} alt="" className={frameClass} />
    </span>
  );
}

function finishIntro(event: { preventDefault: () => void }, enter: () => void) {
  event.preventDefault();
  window.setTimeout(enter, 80);
}
