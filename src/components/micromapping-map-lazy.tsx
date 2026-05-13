"use client";

import dynamic from "next/dynamic";

// MapLibre + pmtiles touchent `window` à l'import — donc on charge le
// composant uniquement côté client, après hydratation.
export const MicroMappingMap = dynamic(
  () => import("./micromapping-map").then((m) => m.MicroMappingMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full items-center justify-center rounded-lg border border-border bg-surface-muted"
        style={{ height: 560 }}
      >
        <p className="label-caps text-text-subtle">Chargement de la carte…</p>
      </div>
    ),
  },
);
