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

const frameClass = "block w-full mix-blend-darken";
const stillClass = "block w-full";

export function EnvelopeIntro({ onEnter, replay = false }: EnvelopeIntroProps) {
  const reduced = useReducedMotion();
  const { play } = useSiteSound();
  const [phase, setPhase] = useState<Phase>(replay && !reduced ? "opening" : replay ? "reading" : "sealed");
  const [gifMs, setGifMs] = useState(3010);
  const [showButton, setShowButton] = useState(false);
  const playedReplay = useRef(false);
  const paragraphs = site.openingStatement.split(/\n+/).filter((line) => line.trim().length > 0);

  useEffect(() => {
    let active = true;
    void gifDurationMs(site.assets.envelopeOpen).then((ms) => {
      if (active) setGifMs(ms);
    });
    return () => {
      active = false;
    };
  }, []);

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
          {phase === "sealed" ? (
            <button type="button" className="press bob w-full" aria-label={site.ui.clickToOpen} onClick={open}>
              <Frame src={site.assets.envelopeFirst} still />
            </button>
          ) : null}
          {phase === "opening" ? <Frame src={`${site.assets.envelopeOpen}?once=1`} /> : null}
          {phase === "reading" ? (
            <>
              <Frame src={site.assets.envelopeLast} />
              <div className="letter-hand absolute top-[9%] right-[14%] bottom-[12%] left-[15%] flex flex-col overflow-hidden text-ink">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className="letter-line mt-[0.7em] text-[clamp(1rem,2.5vw,1.35rem)] leading-snug first:mt-0"
                    style={{ animationDelay: reduced ? "0ms" : `${index * 280}ms` }}
                  >
                    {paragraph}
                  </p>
                ))}
                <p
                  className="letter-line mt-[0.9em] text-[clamp(1rem,2.5vw,1.35rem)] leading-snug"
                  style={{ animationDelay: reduced ? "0ms" : `${paragraphs.length * 280}ms` }}
                >
                  {site.signature}
                </p>
                {showButton ? (
                  <button
                    type="button"
                    className="press letter-hand mt-auto inline-flex min-h-11 items-center self-start text-[clamp(1rem,2.4vw,1.3rem)] underline decoration-ink/40 underline-offset-8"
                    onClick={(event) => finishIntro(event, onEnter)}
                  >
                    {site.ui.enterLibrary}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
        {phase === "sealed" ? (
          <p className="mt-5 font-serif text-sm italic text-muted" aria-hidden="true">
            {site.ui.clickToOpen}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Frame({ src, still = false }: { src: string; still?: boolean }) {
  return (
    <span className="isolate block bg-paper">
      <img src={src} alt="" className={still ? stillClass : frameClass} />
    </span>
  );
}

function finishIntro(event: { preventDefault: () => void }, enter: () => void) {
  event.preventDefault();
  window.setTimeout(enter, 80);
}
