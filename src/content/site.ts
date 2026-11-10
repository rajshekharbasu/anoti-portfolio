import type { SiteContent } from "./types";

// Swap copy here. Components read this file and do not keep their own sentences.
export const site = {
  name: "Anoti",
  openingStatement:
    "Dear visitor,\n\nWelcome to my little library. Every book on these shelves holds a story I've drawn, designed, or dreamed up, some finished, some still being written.\n\nPull out any one that catches your eye, and if you'd like to know who's behind them, just say hi. I'm the one sitting on the shelf.\n\nMake yourself at home and stay as long as you like.",
  signature: "love, Anoti",
  dialogue: [
    "Hi. I'm Anoti.",
    "I illustrate stories, covers, and the occasional poster that ends up taped to a friend's wall.",
    "Stay and talk, or take a book off the shelf.",
    {
      text: "Want to say hello?",
      links: [
        { label: "Email", href: "mailto:hello@example.com" },
        { label: "Instagram", href: "https://instagram.com/" },
      ],
    },
  ],
  character: {
    idle: "/assets/scene/character-idle.gif",
    idleFallback: "/assets/scene/character-idle.png",
    talking: "/assets/scene/character-talking.gif",
    alt: "Anoti, waving from the bookshelf",
    x: 57,
    y: -3,
    width: 22,
  },
  wall: {
    src: "/assets/kirby.GIF",
    x: 18,
    width: 50,
  },
  loadingAnimation: "/assets/loading/loading.png",
  loadingFallback: "/assets/loading/loading.png",
  loadingLastFrame: "/assets/loading/loading-last.png",
  bookshelf: {
    src: "/assets/scene/bookshelf.png",
    x: 16,
    y: 36,
    width: 54,
  },
  assets: {
    bookFrame: "/assets/ui/book-open-frame.png",
    background: "/assets/scene/background.png",
    envelopeClosed: "/assets/intro/envelope-first.png",
    envelopeOpen: "/assets/envelope.gif",
    envelopeFirst: "/assets/intro/envelope-first.png",
    envelopeLast: "/assets/intro/envelope-last.png",
    letter: "/assets/intro/letter.png",
  },
  ambient: {
    dust: true,
    vignette: true,
    breathe: true,
  },
  ui: {
    clickToOpen: "click to open",
    enterLibrary: "Enter the library →",
    skipIntro: "Skip intro",
    shelfLabel: "bookshelf",
    sayHi: "say hi",
    close: "Close",
    closeBook: "Close book",
    closeDialogue: "Close dialogue",
    projects: "Projects",
    nextPage: "Next page",
    previousPage: "Previous page",
    clickToContinue: "click to continue",
    editHint: "Drag the books and the character. Copy the result into the content files.",
    copyPositions: "Copy positions",
    copied: "Copied",
    soundOn: "Sound on",
    soundOff: "Sound off",
  },
} satisfies SiteContent;
