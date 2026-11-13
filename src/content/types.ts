import type { TimeOfDay } from "../lib/timeOfDay";

export type DialogueLink = {
  label: string;
  href: string;
};

export type DialogueLine = string | { text: string; links: DialogueLink[] };

export type ShelfPlacement = {
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z: number;
  showLabel: boolean;
};

export type TextPage = { type: "text"; body: string };
export type ImagePage = { type: "image"; src: string; alt: string };
export type GifPage = { type: "gif"; src: string; alt: string };
export type CaptionPage = {
  type: "image+caption";
  src: string;
  alt: string;
  caption: string;
};
export type SpreadPage = { type: "full-spread"; src: string; alt: string };

export type ProjectPage = TextPage | ImagePage | GifPage | CaptionPage | SpreadPage;

export type BookFormat = "a5" | "a5-landscape" | "square" | "wip";

export type Project = {
  slug: string;
  title: string;
  year: string;
  tags: string[];
  shelf: ShelfPlacement;
  cover: string;
  bookColor: string;
  concept: string;
  pages: ProjectPage[];
  format: BookFormat;
  pdf: string;
  hover: string;
};

export type SiteContent = {
  name: string;
  openingStatement: string;
  signature: string;
  dialogue: DialogueLine[];
  character: {
    idle: string;
    idleFallback: string;
    talking: string;
    alt: string;
    x: number;
    y: number;
    width: number;
  };
  loadingAnimation: string;
  loadingFallback: string;
  loadingLastFrame: string;
  bookshelf: {
    src: string;
    x: number;
    y: number;
    width: number;
  };
  wall: {
    src: string;
    frame: string;
    x: number;
    width: number;
    bottom: number;
  };
  wordmark: string;
  kirbyCaption: string;
  aboutFace: "baskerville" | "inter";
  room: {
    wallpaper: string;
    floor: string;
    flower: string;
    shelfObjects: string;
    dog: string;
    dogBox: { x: number; y: number; width: number };
    sofa: { src: string; x: number; y: number; width: number };
    window: Record<TimeOfDay, string>;
    windowBox: { x: number; y: number; width: number };
    lamp: {
      frames: readonly [string, string, string, string];
      hit: { x: number; y: number; width: number; height: number };
    };
  };
  assets: {
    bookFrame: string;
    background: string;
    envelopeClosed: string;
    envelopeOpen: string;
    envelopeFirst: string;
    envelopeLast: string;
    letter: string;
  };
  ambient: {
    dust: boolean;
    vignette: boolean;
    breathe: boolean;
  };
  ui: {
    clickToOpen: string;
    enterLibrary: string;
    viewLetter: string;
    skipIntro: string;
    shelfLabel: string;
    sayHi: string;
    close: string;
    closeBook: string;
    closeDialogue: string;
    projects: string;
    nextPage: string;
    previousPage: string;
    clickToContinue: string;
    editHint: string;
    copyPositions: string;
    copied: string;
    soundOn: string;
    soundOff: string;
  };
};
