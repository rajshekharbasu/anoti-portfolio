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
