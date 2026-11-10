import { site } from "../content/site";
import { useSiteSound } from "../hooks/useSound";

export function SoundToggle() {
  const { enabled, toggle } = useSiteSound();
  const label = enabled ? site.ui.soundOn : site.ui.soundOff;

  return (
    <button
      type="button"
      className="press fixed right-4 top-4 z-[90] flex h-11 items-center gap-2 rounded-full bg-card/90 px-3 font-sans text-xs text-ink shadow-[var(--shadow-paper)]"
      aria-pressed={enabled}
      aria-label={label}
      onClick={toggle}
    >
      <SpeakerIcon muted={!enabled} />
      <span>{label}</span>
    </button>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 6.5h2.2L8.5 4v8L5.2 9.5H3v-3z" fill="currentColor" />
      {muted ? (
        <path d="M10 6.2l3.6 3.6M13.6 6.2L10 9.8" stroke="currentColor" strokeWidth="1.2" />
      ) : (
        <path
          d="M10.2 6.1a2.8 2.8 0 0 1 0 3.8M11.8 4.6a5 5 0 0 1 0 6.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
