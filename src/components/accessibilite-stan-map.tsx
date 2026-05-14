"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type FillLayerSpecification,
  type CircleLayerSpecification,
  type Map as MaplibreMap,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_KEY =
  process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "BPzMB1jeMqToVdXDvhUP";

const STYLE_URL = `https://api.maptiler.com/maps/base-v4/style.json?key=${MAPTILER_KEY}`;
const CENTER: [number, number] = [6.184, 48.692];

// Palette : la carte met en valeur les ZONES NON COUVERTES (rouge/orange
// saillant) plutôt que les zones couvertes (vert atténué).
// Les carreaux couverts par le seuil courant sont rendus subtilement, ceux
// hors couverture (et a fortiori hors-isochrone du tout) ressortent.
const COLORS = {
  iso5: "#1f4d3a",
  iso10: "#4f7060",
  iso15: "#8aa491",
  stop: "#1f4d3a",
  // Carreaux : couverts = vert atténué presque transparent. Non couverts =
  // dégradé jaune → rouge nettement séparé en luminance pour qu'on voie
  // immédiatement "où sont les zones blanches habitées".
  carreauCovered: "#a8c4b3",
  uncov0: "#fff2c2",  // jaune très clair  (1-5 hab)
  uncov1: "#fec976",  // orange clair      (~10 hab)
  uncov2: "#f08147",  // orange soutenu    (~30 hab)
  uncov3: "#cc2c1f",  // rouge vif         (≥ 100 hab)
} as const;

type Threshold = 5 | 10 | 15;

const THRESHOLDS: Threshold[] = [5, 10, 15];

type StatsPayload = {
  global: {
    population_totale: number;
    seuils: Record<
      string,
      { population_couverte: number; pourcentage: number }
    >;
  };
};

export function AccessibiliteStanMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [threshold, setThreshold] = useState<Threshold>(10);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [stopPopup, setStopPopup] = useState<{
    name: string;
    lon: number;
    lat: number;
  } | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: CENTER,
      zoom: 11,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", async () => {
      // Sources & layers
      for (const t of THRESHOLDS) {
        map.addSource(`iso-${t}`, {
          type: "geojson",
          data: `/data/stan/isochrones_${String(t).padStart(2, "0")}.geojson`,
        });
        map.addLayer(buildIsoLayer(t));
      }

      map.addSource("carreaux", {
        type: "geojson",
        data: "/data/stan/carreaux_couverture.geojson",
      });
      map.addLayer(buildCarreauxLayer(threshold));

      map.addSource("stops", {
        type: "geojson",
        data: "/data/stan/arrets_stan.geojson",
      });
      map.addLayer(buildStopsLayer());

      map.on("click", "stops", (e) => {
        const f = e.features?.[0];
        if (!f || !f.geometry || f.geometry.type !== "Point") return;
        const [lon, lat] = (f.geometry.coordinates as [number, number]);
        const name = (f.properties?.stop_name as string) ?? "Arrêt STAN";
        setStopPopup({ name, lon, lat });
      });
      map.on("mouseenter", "stops", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "stops", () => {
        map.getCanvas().style.cursor = "";
      });

      applyThresholdVisibility(map, threshold);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update visibility + carreaux color expression when threshold changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyThresholdVisibility(map, threshold);
    applyCarreauxThreshold(map, threshold);
  }, [threshold]);

  // Manage popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !stopPopup) return;
    const popup = new maplibregl.Popup({ closeOnClick: true })
      .setLngLat([stopPopup.lon, stopPopup.lat])
      .setHTML(
        `<strong style="font-family:var(--font-display,inherit);font-size:14px">${escapeHtml(stopPopup.name)}</strong>`,
      )
      .addTo(map);
    return () => {
      popup.remove();
    };
  }, [stopPopup]);

  // Load stats
  useEffect(() => {
    fetch("/data/stan/stats.json")
      .then((r) => r.json())
      .then((d: StatsPayload) => setStats(d))
      .catch(() => undefined);
  }, []);

  const currentPct = stats?.global.seuils[String(threshold)]?.pourcentage;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-elevated px-4 py-3">
        <div className="flex gap-1.5">
          {THRESHOLDS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setThreshold(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                threshold === t
                  ? "bg-accent text-white"
                  : "bg-surface text-text-muted hover:bg-surface-muted"
              }`}
              aria-pressed={threshold === t}
            >
              ≤ {t} min
            </button>
          ))}
        </div>
        {currentPct !== undefined ? (
          <p className="text-sm text-text-muted">
            <span className="font-display text-base font-semibold text-text">
              {currentPct.toFixed(1)} %
            </span>{" "}
            de la population à ≤ {threshold} min d&apos;un arrêt
          </p>
        ) : null}
      </div>
      <div
        ref={containerRef}
        className="relative h-[520px] w-full md:h-[640px]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-elevated px-4 py-3 text-xs text-text-subtle">
        <Legend threshold={threshold} />
        <p>
          Données : GTFS STAN · OSM · INSEE Filosofi 2017 · Fond MapTiler
        </p>
      </div>
    </div>
  );
}

function buildIsoLayer(t: Threshold): FillLayerSpecification {
  // Un seul vert pour l'iso active : on veut juste matérialiser la zone
  // de couverture, pas la hiérarchiser (le bouton du seuil fait ça).
  return {
    id: `iso-${t}-fill`,
    type: "fill",
    source: `iso-${t}`,
    paint: {
      "fill-color": "#3f8a64",
      "fill-opacity": 0.18,
      "fill-outline-color": "#1f4d3a",
    },
    layout: { visibility: "none" },
  };
}

function buildCarreauxLayer(threshold: Threshold): FillLayerSpecification {
  // Stratégie : on N'AFFICHE QUE les carreaux NON COUVERTS au seuil
  // courant — ce sont les zones blanches habitées qu'on veut mettre en
  // valeur. Les couverts restent invisibles (l'isochrone fait déjà voir
  // la couverture en vert).
  return {
    id: "carreaux-fill",
    type: "fill",
    source: "carreaux",
    filter: uncoveredFilter(threshold),
    paint: {
      "fill-color": uncoveredColor(),
      "fill-opacity": 0.7,
    },
  };
}

function uncoveredFilter(
  threshold: Threshold,
): maplibregl.FilterSpecification {
  // Un carreau est "non couvert au seuil T" si :
  //   - couverture_min est null/absent, OU
  //   - couverture_min > T
  // ET il a au moins 1 habitant (sinon ça pollue visuellement).
  return [
    "all",
    [">=", ["coalesce", ["get", "population"], 0], 1],
    [
      "any",
      ["==", ["get", "couverture_min"], null],
      ["!", ["has", "couverture_min"]],
      [">", ["to-number", ["coalesce", ["get", "couverture_min"], 999]], threshold],
    ],
  ];
}

function uncoveredColor(): maplibregl.ExpressionSpecification {
  // Palette discrète par tranche de population — sans dégradé continu
  // pour éviter les mélanges qui assombrissent.
  return [
    "step",
    ["coalesce", ["get", "population"], 0],
    COLORS.uncov0,
    6,
    COLORS.uncov1,
    20,
    COLORS.uncov2,
    60,
    COLORS.uncov3,
  ];
}

function buildStopsLayer(): CircleLayerSpecification {
  return {
    id: "stops",
    type: "circle",
    source: "stops",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        1.5,
        14,
        3,
        16,
        5,
      ],
      "circle-color": COLORS.stop,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": 0.9,
    },
    minzoom: 11,
  };
}

function applyThresholdVisibility(map: MaplibreMap, active: Threshold) {
  for (const t of THRESHOLDS) {
    map.setLayoutProperty(
      `iso-${t}-fill`,
      "visibility",
      t === active ? "visible" : "none",
    );
  }
}

function applyCarreauxThreshold(map: MaplibreMap, active: Threshold) {
  if (!map.getLayer("carreaux-fill")) return;
  map.setFilter("carreaux-fill", uncoveredFilter(active));
}

function Legend({ threshold }: { threshold: Threshold }) {
  const swatches: { color: string; label: string }[] = [
    { color: COLORS.uncov0, label: "1-5 hab" },
    { color: COLORS.uncov1, label: "6-19" },
    { color: COLORS.uncov2, label: "20-59" },
    { color: COLORS.uncov3, label: "≥ 60" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-3 rounded-sm"
          style={{ backgroundColor: COLORS.carreauCovered, opacity: 0.4 }}
        />
        Couvert ≤ {threshold} min
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-text-muted">Zone blanche :</span>
        {swatches.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-3 rounded-sm"
              style={{ backgroundColor: s.color, opacity: 0.7 }}
            />
            <span className="text-text-subtle">{s.label}</span>
          </span>
        ))}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: COLORS.stop, opacity: 0.9 }}
        />
        Arrêt STAN
      </span>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Default export for next/dynamic
export default AccessibiliteStanMap;

// Provide both default and named so `next/dynamic` can pick either form.
