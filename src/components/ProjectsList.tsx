import { useEffect, useRef } from "react";
import { site } from "../content/site";
import type { Project } from "../content/types";
import { useFocusTrap } from "../hooks/useFocusTrap";

type ProjectsListProps = {
  projects: Project[];
  onOpen: (slug: string) => void;
  onClose: () => void;
};

export function ProjectsList({ projects, onOpen, onClose }: ProjectsListProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(true, ref);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-ink/25 p-4 sm:place-items-center">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={site.ui.projects}
        tabIndex={-1}
        className="max-h-[80dvh] w-full max-w-md overflow-auto rounded-md bg-card p-4 shadow-[var(--shadow-paper)] outline-none"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{site.ui.projects}</h2>
          <button
            type="button"
            className="press grid h-11 w-11 place-items-center font-serif text-lg"
            aria-label={site.ui.close}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <ul className="mt-3 divide-y divide-ink/10">
          {projects.map((project) => (
            <li key={project.slug}>
              <button
                type="button"
                className="press flex min-h-11 w-full items-baseline justify-between gap-4 py-3 text-left"
                onClick={() => onOpen(project.slug)}
              >
                <span className="font-serif text-lg">{project.title}</span>
                <span className="font-sans text-xs text-muted">{project.year}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
