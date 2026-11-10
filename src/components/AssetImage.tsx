import { useEffect, useState } from "react";

type AssetImageProps = {
  src: string;
  fallbackSrc?: string;
  alt: string;
  label: string;
  className?: string;
  hideOnFail?: boolean;
  fetchPriority?: "high" | "low" | "auto";
};

export function AssetImage({
  src,
  fallbackSrc,
  alt,
  label,
  className,
  hideOnFail = false,
  fetchPriority = "auto",
}: AssetImageProps) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setFailed(false);
  }, [src]);

  if (failed) {
    if (hideOnFail) return null;
    return (
      <span
        role="img"
        aria-label={alt || label}
        className={`grid place-items-center bg-[#e4ddd4] px-3 text-center font-serif text-sm text-ink ${className ?? ""}`}
      >
        {label}
      </span>
    );
  }

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      fetchPriority={fetchPriority}
      onError={() => {
        if (fallbackSrc && current !== fallbackSrc) {
          setCurrent(fallbackSrc);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
