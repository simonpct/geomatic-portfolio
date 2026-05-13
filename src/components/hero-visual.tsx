"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => <Placeholder />,
  },
);

function Placeholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="px-6 text-center">
        <p className="label-caps text-text-subtle">
          Chargement du modèle 3D…
        </p>
      </div>
    </div>
  );
}

export function HeroVisual() {
  const [interacted, setInteracted] = useState(false);

  return (
    <div className="relative aspect-4/5 overflow-hidden rounded-lg border border-border bg-surface-elevated md:aspect-square">
      <div className="tech-grid absolute inset-0 pointer-events-none" />

      <div
        className="absolute inset-0"
        onPointerDown={() => setInteracted(true)}
      >
        <HeroScene />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="rounded border border-border bg-surface-elevated/90 px-3 py-2 backdrop-blur">
          <p className="label-caps text-text-subtle">
            Nancy — capture photogrammétrie
          </p>
        </div>
        {!interacted && (
          <div className="rounded border border-border bg-surface-elevated/90 px-3 py-2 backdrop-blur">
            <p className="label-caps text-text-subtle">Glissez · zoomez</p>
          </div>
        )}
      </div>
    </div>
  );
}
