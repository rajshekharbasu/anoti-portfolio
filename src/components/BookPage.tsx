import { forwardRef, useState } from "react";
import type { Project } from "../content/types";
import type { BookSlot } from "../lib/slots";

type BookPageProps = {
  slot: BookSlot;
  project: Project;
  eager: boolean;
};

export const BookPage = forwardRef<HTMLDivElement, BookPageProps>(function BookPage(
  { slot, project, eager },
  ref,
) {
  return (
    <div ref={ref} className="paper-page">
      <div className={`paper-page__inner${pictureSlot(slot) ? " paper-page__inner--picture" : ""}`}>
        {renderSlot(slot, project, eager)}
      </div>
    </div>
  );
});

function pictureSlot(slot: BookSlot): boolean {
  return slot.kind === "page" && (slot.page.type === "image" || slot.page.type === "gif");
}

function renderSlot(slot: BookSlot, project: Project, eager: boolean) {
  switch (slot.kind) {
    case "concept":
      return <Concept project={project} />;
    case "blank":
      return <div className="h-full" />;
    case "page":
      return <SinglePage page={slot.page} eager={eager} />;
    case "spread":
      return <SpreadHalf page={slot.page} side={slot.side} eager={eager} />;
    default:
      return assertNever(slot);
  }
}

function Concept({ project }: { project: Project }) {
  return (
    <article className="flex h-full flex-col">
      <p className="font-sans text-[3.2cqi] tracking-wide text-muted">{project.year}</p>
      <h2 className="mt-[2cqi] font-serif text-[8cqi] leading-[1.05] font-medium">{project.title}</h2>
      <p className="mt-[2cqi] font-sans text-[3cqi] text-muted">{project.tags.join(" · ")}</p>
      <p className="mt-[5cqi] font-serif text-[4cqi] leading-relaxed">{project.concept}</p>
    </article>
  );
}

function SinglePage({
  page,
  eager,
}: {
  page: Exclude<BookSlot, { kind: "concept" } | { kind: "blank" } | { kind: "spread" }>["page"];
  eager: boolean;
}) {
  switch (page.type) {
    case "text":
      return <p className="font-serif text-[4.2cqi] leading-relaxed">{page.body}</p>;
    case "image":
    case "gif":
      return <PagePicture src={page.src} alt={page.alt} eager={eager} />;
    case "image+caption":
      return (
        <figure className="flex h-full flex-col">
          <PagePicture src={page.src} alt={page.alt} eager={eager} />
          <figcaption className="mt-[3cqi] font-serif text-[3.4cqi] italic leading-snug">
            {page.caption}
          </figcaption>
        </figure>
      );
    default:
      return assertNever(page);
  }
}

function SpreadHalf({
  page,
  side,
  eager,
}: {
  page: Extract<BookSlot, { kind: "spread" }>["page"];
  side: "left" | "right";
  eager: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    if (side === "right") return <div className="h-full" />;
    return <Missing label={page.alt} />;
  }
  return (
    <div className="h-full overflow-hidden">
      <img
        src={page.src}
        alt={side === "left" ? page.alt : ""}
        loading={eager ? "eager" : "lazy"}
        className="h-full max-w-none object-cover"
        style={{
          width: "200%",
          marginLeft: side === "right" ? "-100%" : 0,
          objectPosition: side === "left" ? "left center" : "right center",
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function PagePicture({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Missing label={alt} />;
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className="h-full w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function Missing({ label }: { label: string }) {
  return (
    <div className="grid min-h-32 flex-1 place-items-center bg-[#e4ddd4] p-[4cqi] text-center font-serif text-[3.6cqi] text-ink">
      {label}
    </div>
  );
}

function assertNever(value: never): null {
  void value;
  return null;
}
