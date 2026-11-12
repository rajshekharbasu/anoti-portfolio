import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence } from "framer-motion";
import { useMatch, useNavigate, useSearchParams } from "react-router-dom";
import { AssetImage } from "../components/AssetImage";
import { Character } from "../components/Character";
import { DustParticles } from "../components/DustParticles";
import { EditModeOverlay } from "../components/EditModeOverlay";
import OpenBook from "../components/OpenBook";
import { ProjectsList } from "../components/ProjectsList";
import { ShelfBook } from "../components/ShelfBook";
import { SpeechBubble } from "../components/SpeechBubble";
import { Stage } from "../components/Stage";
import { projects, projectBySlug } from "../content/projects";
import { site } from "../content/site";
import type { ShelfPlacement } from "../content/types";
import { warmImages } from "../hooks/usePreload";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { msUntilNextTimeOfDay, timeOfDay, type TimeOfDay } from "../lib/timeOfDay";

type Drag = {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  node: HTMLDivElement;
  moved: boolean;
};

type LibrarySceneProps = {
  editMode: boolean;
  onViewLetter: () => void;
};

export function LibraryScene({ editMode, onViewLetter }: LibrarySceneProps) {
  const slug = useMatch("/project/:slug")?.params.slug;
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const tipTimer = useRef(0);
  const instantTimer = useRef(0);
  const instantRef = useRef(false);
  const [placements, setPlacements] = useState<Record<string, ShelfPlacement>>(() =>
    Object.fromEntries(projects.map((project) => [project.slug, project.shelf])),
  );
  const [character, setCharacter] = useState({
    x: site.character.x,
    y: site.character.y,
    width: site.character.width,
  });
  const [dialogue, setDialogue] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [tinyBooks, setTinyBooks] = useState(false);
  const [tipId, setTipId] = useState<string | null>(null);
  const [tipInstant, setTipInstant] = useState(false);
  const [lampLevel, setLampLevel] = useState(1);
  const [partOfDay, setPartOfDay] = useState<TimeOfDay>(() => timeOfDay(new Date()));
  const openProject = slug ? projectBySlug(slug) : undefined;
  const line = site.dialogue[lineIndex];

  useEffect(() => {
    if (slug && !openProject) navigate(libraryPath(search), { replace: true });
  }, [slug, openProject, navigate, search]);

  useEffect(() => {
    let timer = 0;
    const arm = () => {
      const current = new Date();
      setPartOfDay(timeOfDay(current));
      timer = window.setTimeout(arm, msUntilNextTimeOfDay(current));
    };
    timer = window.setTimeout(arm, msUntilNextTimeOfDay(new Date()));
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const width = stage.clientWidth;
      const narrowest = Math.min(
        ...projects.map((project) => {
          const placement = placements[project.slug] ?? project.shelf;
          return (placement.width / 100) * width;
        }),
      );
      setTinyBooks(narrowest < 32);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [placements]);

  function showTip(id: string) {
    window.clearTimeout(tipTimer.current);
    if (instantRef.current) {
      setTipInstant(true);
      setTipId(id);
      return;
    }
    tipTimer.current = window.setTimeout(() => {
      instantRef.current = true;
      setTipInstant(true);
      setTipId(id);
    }, 280);
  }

  function hideTip() {
    window.clearTimeout(tipTimer.current);
    setTipId(null);
    window.clearTimeout(instantTimer.current);
    instantTimer.current = window.setTimeout(() => {
      instantRef.current = false;
      setTipInstant(false);
    }, 320);
  }

  function warm(projectSlug: string) {
    const project = projectBySlug(projectSlug);
    if (!project) return;
    const urls: string[] = [];
    for (const page of project.pages) {
      if ("src" in page && urls.length < 4) urls.push(page.src);
    }
    warmImages(urls);
  }

  function goToProject(nextSlug: string) {
    const params = new URLSearchParams(search);
    params.delete("intro");
    const query = params.toString();
    navigate(query ? `/project/${nextSlug}?${query}` : `/project/${nextSlug}`);
    setProjectsOpen(false);
    setDialogue(false);
  }

  function beginDrag(
    event: PointerEvent<HTMLDivElement>,
    id: string,
    originX: number,
    originY: number,
  ) {
    if (!editMode || dragRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX,
      originY,
      node: event.currentTarget,
      moved: false,
    };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 3) drag.moved = true;
    drag.node.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    const stage = stageRef.current;
    drag.node.style.transform = "";
    if (!drag.moved || !stage) return;
    const x = round(drag.originX + ((event.clientX - drag.startX) / stage.clientWidth) * 100);
    const y = round(drag.originY + ((event.clientY - drag.startY) / stage.clientHeight) * 100);
    if (drag.id === "character") {
      const next = { ...character, x, y };
      setCharacter(next);
      console.info(snapshot(next, placements));
      return;
    }
    const shelf = placements[drag.id];
    if (!shelf) return;
    const nextPlacements = { ...placements, [drag.id]: { ...shelf, x, y } };
    setPlacements(nextPlacements);
    console.info(snapshot(character, nextPlacements));
  }

  const editJson = snapshot(character, placements);

  const lampSrc = site.room.lamp.frames[lampLevel] ?? site.room.lamp.frames[0];
  const windowSrc = site.room.window[partOfDay];

  return (
    <div className="room">
      <div className="room-floor-bleed" />
      {site.ambient.vignette ? (
        <div
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 52%, rgba(59, 42, 38, 0.16) 100%)",
          }}
        />
      ) : null}
      <Stage stageRef={stageRef}>
        <SceneLayer src={site.room.floor} z={1} />
        <img
          src={windowSrc}
          alt=""
          className="pointer-events-none absolute h-full w-full"
          style={{ zIndex: 2, left: "52%", top: "7.5%" }}
        />
        <div
          className="pointer-events-none absolute z-[3]"
          style={{
            left: `${site.wall.x}%`,
            width: `${site.wall.width}%`,
            bottom: `${site.wall.bottom}%`,
          }}
        >
          <div className="relative">
            <div
              className="absolute overflow-hidden"
              style={{ left: "9.2%", top: "23.4%", width: "81.4%", height: "47.4%" }}
            >
              <img
                src={site.wall.src}
                alt=""
                className="absolute bottom-0 w-full max-w-none object-cover object-bottom"
                style={{ height: "200%" }}
              />
            </div>
            <img src={site.wall.frame} alt="" className="relative block h-auto w-full" />
          </div>
        </div>
        <div
          className="pointer-events-none absolute z-[4]"
          style={{
            left: `${site.bookshelf.x}%`,
            top: `${site.bookshelf.y}%`,
            width: `${site.bookshelf.width}%`,
          }}
        >
          <AssetImage
            src={site.bookshelf.src}
            alt=""
            label={site.ui.shelfLabel}
            fetchPriority="high"
            className="h-auto w-full"
          />
        </div>
        <SceneLayer src={site.room.flower} z={5} />
        <SceneLayer src={site.room.shelfObjects} z={6} />
        <SceneLayer src={site.room.dog} z={7} />
        <SceneLayer src={lampSrc} z={8} />
        <button
          type="button"
          className="lamp-hit"
          style={{
            left: `${site.room.lamp.hit.x}%`,
            top: `${site.room.lamp.hit.y}%`,
            width: `${site.room.lamp.hit.width}%`,
            height: `${site.room.lamp.hit.height}%`,
          }}
          aria-label="Lamp"
          onClick={() => setLampLevel((current) => (current + 1) % site.room.lamp.frames.length)}
        />
        {site.ambient.dust && !reduced ? <DustParticles /> : null}
        {projects.map((project) => {
          const placement = placements[project.slug] ?? project.shelf;
          return (
            <ShelfBook
              key={project.slug}
              project={project}
              placement={placement}
              editMode={editMode}
              tipVisible={tipId === project.slug}
              tipInstant={tipInstant}
              onShowTip={() => showTip(project.slug)}
              onHideTip={hideTip}
              onWarm={() => warm(project.slug)}
              onOpen={() => goToProject(project.slug)}
              onPointerDown={(event) => beginDrag(event, project.slug, placement.x, placement.y)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
            />
          );
        })}
        <Character
          x={character.x}
          y={character.y}
          width={character.width}
          breathe={false}
          editMode={editMode}
          expanded={dialogue}
          tipVisible={tipId === "character"}
          tipInstant={tipInstant}
          onShowTip={() => showTip("character")}
          onHideTip={hideTip}
          onOpen={() => {
            setLineIndex(0);
            setDialogue(true);
          }}
          onPointerDown={(event) => beginDrag(event, "character", character.x, character.y)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
        />
        {dialogue ? (
          <div className="absolute inset-0 z-30" onMouseDown={() => setDialogue(false)} />
        ) : null}
        <AnimatePresence>
          {dialogue && line ? (
            <SpeechBubble
              key="bubble"
              line={line}
              canContinue={lineIndex < site.dialogue.length - 1}
              reduced={reduced}
              onAdvance={() => setLineIndex((current) => current + 1)}
              onClose={() => setDialogue(false)}
              onViewLetter={() => {
                setDialogue(false);
                onViewLetter();
              }}
            />
          ) : null}
        </AnimatePresence>
      </Stage>
      {tinyBooks && !openProject ? (
        <button
          type="button"
          className="press fixed bottom-4 left-1/2 z-40 inline-flex min-h-11 -translate-x-1/2 items-center rounded-full bg-card px-5 font-serif shadow-[var(--shadow-paper)]"
          onClick={() => setProjectsOpen(true)}
        >
          {site.ui.projects}
        </button>
      ) : null}
      {editMode ? <EditModeOverlay json={editJson} /> : null}
      {projectsOpen ? (
        <ProjectsList
          projects={projects}
          onOpen={goToProject}
          onClose={() => setProjectsOpen(false)}
        />
      ) : null}
      {openProject ? (
        <OpenBook project={openProject} reduced={reduced} onClose={() => navigate(libraryPath(search))} />
      ) : null}
    </div>
  );
}

function SceneLayer({ src, z }: { src: string; z: number }) {
  return (
    <img
      src={src}
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: z }}
    />
  );
}

function libraryPath(search: URLSearchParams): string {
  const params = new URLSearchParams(search);
  params.delete("intro");
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function snapshot(
  character: { x: number; y: number; width: number },
  placements: Record<string, ShelfPlacement>,
): string {
  return JSON.stringify(
    {
      character: {
        x: character.x,
        y: character.y,
        width: character.width,
      },
      books: projects.map((project) => ({
        slug: project.slug,
        shelf: placements[project.slug] ?? project.shelf,
      })),
    },
    null,
    2,
  );
}
