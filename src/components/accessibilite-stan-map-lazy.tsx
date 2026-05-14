"use client";

import dynamic from "next/dynamic";

// MapLibre touche `window` à l'import — chargement client uniquement.
export const AccessibiliteStanMap = dynamic(
  () =>
    import("./accessibilite-stan-map").then((m) => m.AccessibiliteStanMap),
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
