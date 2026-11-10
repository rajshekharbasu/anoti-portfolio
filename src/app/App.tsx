import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useMatch, useSearchParams } from "react-router-dom";
import { site } from "../content/site";
import { projects } from "../content/projects";
import { preloadAssets, wait } from "../hooks/usePreload";
import { SoundProvider } from "../hooks/useSound";
import { gifDurationMs } from "../lib/gifTiming";
import { markIntroSeen, readIntroSeen } from "../lib/session";
import { EnvelopeIntro } from "../scenes/EnvelopeIntro";
import { LibraryScene } from "../scenes/LibraryScene";
import { HOLD_MS, LoadingScreen } from "../scenes/LoadingScreen";
import { SoundToggle } from "../components/SoundToggle";

export function App() {
  return (
    <BrowserRouter>
      <SoundProvider>
        <Routes>
          <Route path="*" element={<Experience />} />
        </Routes>
      </SoundProvider>
    </BrowserRouter>
  );
}

function Experience() {
  const projectMatch = useMatch("/project/:slug");
  const slug = projectMatch?.params.slug;
  const [search] = useSearchParams();
  const forceIntro = search.get("intro") === "1";
  const editMode = search.get("edit") === "1";
  const urls = useMemo(() => criticalUrls(), []);
  const slugRef = useRef(slug);
  const forceRef = useRef(forceIntro);
  slugRef.current = slug;
  forceRef.current = forceIntro;
  const [booting, setBooting] = useState(true);
  const [loopMs, setLoopMs] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2000,
  );
  const [cover, setCover] = useState(true);
  const [phase, setPhase] = useState<"intro" | "library">("intro");

  useEffect(() => {
    document.title = site.name;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    void (async () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const [introMs] = await Promise.all([gifDurationMs(site.loadingAnimation), preloadAssets(urls)]);
      const playClip = !reduced && introMs > 0;
      if (!cancelled) setLoopMs(playClip ? introMs : 0);
      const hold = reduced ? 800 : introMs + HOLD_MS;
      const remain = hold - (performance.now() - started);
      if (remain > 0) await wait(remain);
      if (cancelled) return;
      const skip = Boolean(slugRef.current) || (!forceRef.current && readIntroSeen());
      setPhase(skip ? "library" : "intro");
      setBooting(false);
    })();
    return () => {
      cancelled = true;
    };
    // Boot once. Later route changes should not replay the loading screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls]);

  useEffect(() => {
    if (booting) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setCover(false), reduced ? 0 : 700);
    return () => window.clearTimeout(timeout);
  }, [booting]);

  function enterLibrary() {
    markIntroSeen();
    setPhase("library");
  }

  if (!booting && !projectMatch && window.location.pathname !== "/") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {!booting && phase === "intro" ? <EnvelopeIntro onEnter={enterLibrary} /> : null}
      {!booting && phase === "library" ? <LibraryScene editMode={editMode} /> : null}
      {!booting ? <SoundToggle /> : null}
      {cover ? (
        <LoadingScreen leaving={!booting} loopMs={loopMs} onExited={() => setCover(false)} />
      ) : null}
    </>
  );
}

function criticalUrls(): string[] {
  const urls = [
    site.loadingAnimation,
    site.loadingFallback,
    site.loadingLastFrame,
    site.bookshelf.src,
    site.assets.bookFrame,
    site.assets.background,
    site.assets.envelopeClosed,
    site.assets.envelopeOpen,
    site.assets.letter,
    site.character.idle,
    site.character.idleFallback,
    site.character.talking,
    ...projects.flatMap((project) => [project.shelf.image, project.cover]),
  ];
  return [...new Set(urls)];
}
