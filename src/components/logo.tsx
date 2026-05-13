"use client";

export type LogoProps = {
  src: string;
  alt: string;
  fallback: string;
};

export function Logo({ src, alt, fallback }: LogoProps) {
  return (
    <span
      className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface"
      title={alt}
    >
      <span className="label-caps absolute inset-0 flex items-center justify-center text-[9px] text-text-subtle">
        {fallback}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="relative h-full w-full object-contain p-0.5"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}
