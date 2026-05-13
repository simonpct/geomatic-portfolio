"use client";

import { useState } from "react";

export type PipelineStep = {
  number: string;
  label: string;
  title: string;
  description: string;
  color: string;
  preview?: string;
  previewAlt?: string;
};

export function Pipeline({ steps }: { steps: PipelineStep[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      className="relative"
      onMouseLeave={() => setActive(null)}
    >
      {/* Rail horizontal reliant les étapes */}
      <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />

      <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
        {steps.map((step, i) => (
          <li key={step.number} className="relative flex flex-col items-center text-center">
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(active === i ? null : i)}
              aria-label={`${step.title} — voir détails`}
              aria-expanded={active === i}
              className="group relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-surface text-sm font-semibold text-white shadow-sm outline-none transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 hover:scale-110"
              style={{ background: step.color }}
            >
              {step.number}
            </button>

            <div className="mt-4 max-w-[12rem]">
              <p className="label-caps text-text-subtle">{step.label}</p>
              <p className="mt-1 font-display text-sm font-semibold text-text">
                {step.title}
              </p>
            </div>

            {active === i && (
              <Popover step={step} alignRight={i === steps.length - 1} alignLeft={i === 0} />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Popover({
  step,
  alignLeft,
  alignRight,
}: {
  step: PipelineStep;
  alignLeft: boolean;
  alignRight: boolean;
}) {
  const align = alignLeft
    ? "left-0 -translate-x-0"
    : alignRight
      ? "right-0 translate-x-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      role="tooltip"
      className={`absolute top-16 z-20 w-72 rounded-lg border border-border bg-surface-elevated p-4 shadow-lg ${align}`}
    >
      {step.preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded border border-border bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={step.preview}
            alt={step.previewAlt ?? step.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="tech-grid relative aspect-video w-full rounded border border-border bg-surface-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="label-caps text-text-subtle">Aperçu à venir</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        {step.description}
      </p>
    </div>
  );
}
