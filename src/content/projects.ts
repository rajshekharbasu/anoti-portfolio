import type { Project } from "./types";

// One object per book. x/y/width/height are percentages of the 16:10 stage.
export const projects = [
  {
    slug: "sketchbook",
    title: "Sketchbook",
    year: "2025",
    tags: ["illustration", "sketch"],
    shelf: {
      image: "/assets/books/shelf/book-01.png",
      x: 21.2,
      y: 53.2,
      width: 3.5,
      height: 15.6,
      rotation: 0,
      z: 4,
      showLabel: true,
    },
    cover: "/assets/books/covers/book-01-cover.png",
    bookColor: "#f6d6de",
    concept:
      "A stand-in for the first book on the shelf. Replace this note with the idea behind the project, in a few sentences.",
    pages: [
      {
        type: "image",
        src: "/assets/projects/project-01/01.png",
        alt: "Sketchbook, first spread",
      },
      {
        type: "image+caption",
        src: "/assets/projects/project-01/02.png",
        alt: "Sketchbook, detail",
        caption: "A caption sits under the picture. Swap the image and rewrite this line.",
      },
      {
        type: "text",
        body: "Longer notes live on their own page. Keep them short enough to read without leaning in.",
      },
    ],
  },
  {
    slug: "field-notes",
    title: "Field notes",
    year: "2025",
    tags: ["drawing", "travel"],
    shelf: {
      image: "/assets/books/shelf/book-02.png",
      x: 25.6,
      y: 53.2,
      width: 3.5,
      height: 15.6,
      rotation: -1.5,
      z: 4,
      showLabel: true,
    },
    cover: "/assets/books/covers/book-02-cover.png",
    bookColor: "#f3e6d8",
    concept: "Studies from walking around. Plants, doorways, and whatever was on the café table.",
    pages: [
      {
        type: "text",
        body: "The right-hand page is where the project itself starts. This one is a text page.",
      },
      {
        type: "image",
        src: "/assets/projects/project-02/01.png",
        alt: "Field notes, pencil study",
      },
      {
        type: "full-spread",
        src: "/assets/projects/project-02/02.png",
        alt: "Field notes, wide drawing across both pages",
      },
    ],
  },
  {
    slug: "poster-study",
    title: "Posters",
    year: "2024",
    tags: ["poster", "type"],
    shelf: {
      image: "/assets/books/shelf/book-03.png",
      x: 30,
      y: 53.2,
      width: 3.4,
      height: 15.6,
      rotation: 1,
      z: 5,
      showLabel: true,
    },
    cover: "/assets/books/covers/book-03-cover.png",
    bookColor: "#e7eee6",
    concept: "A set of posters made to be read from across a room. Big type, one picture, no extra.",
    pages: [
      {
        type: "gif",
        src: "/assets/projects/project-03/01.gif",
        alt: "Poster study, moving frame",
      },
      {
        type: "image+caption",
        src: "/assets/projects/project-03/02.png",
        alt: "Poster on a wall",
        caption: "Printed and taped up, to see if the type still holds.",
      },
    ],
  },
  {
    slug: "night-window",
    title: "Night window",
    year: "2024",
    tags: ["illustration"],
    shelf: {
      image: "/assets/books/shelf/book-04.png",
      x: 34.3,
      y: 53.2,
      width: 3.6,
      height: 15.6,
      rotation: 0,
      z: 4,
      showLabel: true,
    },
    cover: "/assets/books/covers/book-04-cover.png",
    bookColor: "#efe4f2",
    concept: "Interiors after dark. The window is the lamp, and the room is mostly guesswork.",
    pages: [
      {
        type: "image",
        src: "/assets/projects/project-04/01.png",
        alt: "A room lit by a window",
      },
      {
        type: "text",
        body: "Write what the picture does not say. Who lives here, or what you left out on purpose.",
      },
      {
        type: "image",
        src: "/assets/projects/project-04/02.png",
        alt: "Close view of the windowsill",
      },
    ],
  },
  {
    slug: "paper-boats",
    title: "Paper boats",
    year: "2023",
    tags: ["picture book"],
    shelf: {
      image: "/assets/books/shelf/book-05.png",
      x: 22,
      y: 83.6,
      width: 16,
      height: 6.4,
      rotation: -2,
      z: 3,
      showLabel: false,
    },
    cover: "/assets/books/covers/book-05-cover.png",
    bookColor: "#f6e4da",
    concept: "A small story about folding paper and sending it somewhere you cannot follow.",
    pages: [
      {
        type: "full-spread",
        src: "/assets/projects/project-05/01.png",
        alt: "Paper boats on a wide spread",
      },
      {
        type: "text",
        body: "The last page can be quiet. A line or two is enough.",
      },
    ],
  },
] satisfies Project[];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
