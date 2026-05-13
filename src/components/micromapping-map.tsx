"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  type LayerSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import "maplibre-gl/dist/maplibre-gl.css";

const PMTILES_URL = "/tiles/carrefour-foch.pmtiles";

// Orthophoto Grand Nancy 2024 (mise à jour 2025), résolution 5 cm
// Servi en WMS par datagrandest.fr — accès ouvert, attribution "© Grand Nancy"
const ORTHO_WMS =
  "https://www.datagrandest.fr/geoserver/grand-nancy/ows" +
  "?FORMAT=image/jpeg" +
  "&TRANSPARENT=FALSE" +
  "&VERSION=1.3.0" +
  "&SERVICE=WMS" +
  "&REQUEST=GetMap" +
  "&LAYERS=GrandNancy_2024-MAJ_2025-RVB_5cm_L93_cog" +
  "&STYLES=" +
  "&CRS=EPSG:3857" +
  "&WIDTH=512" +
  "&HEIGHT=512" +
  "&BBOX={bbox-epsg-3857}";

// Centre approximatif du carrefour
const CENTER: [number, number] = [6.1733, 48.6884];

const SURFACE = "#fafaf9";

const ROAD_FILL = "#686871";
const FOOTWAY_FILL = "#efe7d4";
const ISLAND_FILL = "#52525a";

const BUILDING_FILL = "#ebe7e1";
const BUILDING_OUTLINE = "#d6d3d1";
const MANHOLE_COLOR = "#4a4541";

const LANDUSE_GRASS = "#d9e3c6";
const LANDUSE_WOOD = "#b7c8a0";

const MARKING_WHITE = "#ffffff";
const MARKING_YELLOW = "#e6c53b";

// ----- Style ortho : juste le WMS Grand Nancy en raster -----
const orthoStyle: StyleSpecification = {
  version: 8,
  sources: {
    ortho: {
      type: "raster",
      tiles: [ORTHO_WMS],
      tileSize: 512,
      attribution: "© Grand Nancy · Orthophoto 2024 (MAJ 2025) · 5 cm",
    },
  },
  layers: [
    {
      id: "ortho-layer",
      type: "raster",
      source: "ortho",
      paint: { "raster-resampling": "linear" },
    },
  ],
};

// ----- Style rendu OSM custom -----
// Fonction parce que MapLibre 5 exige une URL ABSOLUE pour le sprite
// → on résout `/sprites/sprite` en `https://host/sprites/sprite` à l'init
// Avec MapLibre 5, on peut utiliser des Web Fonts (CSS @font-face) au lieu
// des PBF glyphs SDF. Ça permet d'utiliser n'importe quelle font Google Fonts.
// Voir https://maplibre.org/maplibre-gl-js/docs/examples/style-with-web-fonts/
const buildRenderStyle = (origin: string, debug = false): StyleSpecification => ({
  version: 8,
  sprite: `${origin}/sprites/sprite`,
  sources: {
    carrefour: {
      type: "vector",
      url: `pmtiles://${PMTILES_URL}`,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · données micromapping',
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": SURFACE } },

    // Espaces verts
    {
      id: "landuse-grass",
      source: "carrefour",
      "source-layer": "landuse",
      type: "fill",
      filter: [
        "any",
        ["in", ["get", "landuse"], ["literal", ["grass", "meadow", "recreation_ground"]]],
        ["in", ["get", "leisure"], ["literal", ["park", "garden", "pitch", "playground"]]],
        ["==", ["get", "natural"], "grass"],
      ],
      paint: { "fill-color": LANDUSE_GRASS },
    },
    {
      id: "landuse-wood",
      source: "carrefour",
      "source-layer": "landuse",
      type: "fill",
      filter: [
        "any",
        ["==", ["get", "landuse"], "forest"],
        ["in", ["get", "natural"], ["literal", ["wood", "scrub"]]],
      ],
      paint: { "fill-color": LANDUSE_WOOD },
    },

    // area:highway — surfaces
    {
      id: "area-highway-road",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: [
        "in",
        ["get", "area:highway"],
        ["literal", ["primary", "secondary", "tertiary", "residential", "service", "unclassified"]],
      ],
      paint: { "fill-color": ROAD_FILL },
    },
    {
      id: "area-highway-road-extras",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["in", ["get", "area:highway"], ["literal", ["busway", "cycleway", "asl"]]],
      paint: { "fill-color": ROAD_FILL },
    },
    {
      id: "area-highway-island",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["==", ["get", "area:highway"], "traffic_island"],
      paint: { "fill-color": ISLAND_FILL },
    },
    {
      id: "area-highway-footway",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["in", ["get", "area:highway"], ["literal", ["footway", "pedestrian", "path", "steps"]]],
      paint: { "fill-color": FOOTWAY_FILL },
    },
    {
      id: "area-highway-bicycle-crossing",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["==", ["get", "area:highway"], "bicycle_crossing"],
      paint: { "fill-color": ROAD_FILL },
    },
    // Fond du passage piéton : chaussée par défaut, ou couleur explicite si posée
    {
      id: "area-highway-crossing-base",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["==", ["get", "area:highway"], "crossing"],
      paint: {
        "fill-color": [
          "case",
          ["has", "colour"],
          ["to-color", ["get", "colour"], ROAD_FILL],
          ROAD_FILL,
        ],
      },
    },
    // Bandes zebra orientées selon l'axe principal du passage piéton
    // (générées par script Python PCA, voir tiles/scripts/generate_zebra_stripes.py)
    {
      id: "crossing-stripes",
      source: "carrefour",
      "source-layer": "crossing_stripes",
      type: "fill",
      minzoom: 17,
      paint: {
        "fill-color": MARKING_WHITE,
        "fill-opacity": 0.95,
      },
    },
    // Override : couleur explicite (colour=#XXXXXX)
    {
      id: "area-highway-explicit-colour",
      source: "carrefour",
      "source-layer": "area_highway",
      type: "fill",
      filter: ["all", ["has", "colour"], ["!=", ["get", "area:highway"], "crossing"]],
      paint: {
        "fill-color": ["to-color", ["get", "colour"], "#888"],
      },
    },

    // Bâti
    {
      id: "buildings-fill",
      source: "carrefour",
      "source-layer": "buildings",
      type: "fill",
      paint: { "fill-color": BUILDING_FILL, "fill-outline-color": BUILDING_OUTLINE },
    },

    // road_marking — surfaces
    {
      id: "road-marking-restriction-yellow",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "fill",
      filter: [
        "all",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["get", "road_marking"], "restriction"],
        ["==", ["get", "colour"], "yellow"],
      ],
      paint: { "fill-color": MARKING_YELLOW, "fill-opacity": 0.85 },
    },
    {
      id: "road-marking-restriction-white",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "fill",
      filter: [
        "all",
        ["==", ["geometry-type"], "Polygon"],
        ["==", ["get", "road_marking"], "restriction"],
        ["!=", ["get", "colour"], "yellow"],
      ],
      paint: { "fill-color": MARKING_WHITE, "fill-opacity": 0.9 },
    },

    // road_marking — lignes
    {
      id: "road-marking-line-yellow",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "line",
      filter: [
        "all",
        ["==", ["geometry-type"], "LineString"],
        ["==", ["get", "colour"], "yellow"],
        ["!=", ["get", "road_marking"], "arrow"],
      ],
      paint: {
        "line-color": MARKING_YELLOW,
        "line-width": ["interpolate", ["linear"], ["zoom"], 16, 0.5, 18, 2],
      },
    },
    {
      id: "road-marking-line-white",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "line",
      filter: [
        "all",
        ["==", ["geometry-type"], "LineString"],
        ["!=", ["get", "colour"], "yellow"],
        ["!=", ["get", "road_marking"], "arrow"],
      ],
      paint: {
        "line-color": MARKING_WHITE,
        "line-width": ["interpolate", ["linear"], ["zoom"], 16, 0.5, 18, 2],
        "line-dasharray": [
          "case",
          ["==", ["get", "stroke"], "dashed"],
          ["literal", [2, 2]],
          ["literal", [1, 0]],
        ],
      },
    },

    // road_marking=arrow — points avec direction et type calculés au build
    // (script generate_arrows.py)
    {
      id: "arrows-through",
      source: "carrefour",
      "source-layer": "arrows",
      type: "symbol",
      filter: ["==", ["get", "arrow_type"], "through"],
      minzoom: 17,
      layout: {
        "icon-image": "arrow-through",
        "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.18, 20, 1.5],
        "icon-rotate": ["to-number", ["get", "direction"]],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    },
    {
      id: "arrows-left",
      source: "carrefour",
      "source-layer": "arrows",
      type: "symbol",
      filter: ["==", ["get", "arrow_type"], "left"],
      minzoom: 17,
      layout: {
        "icon-image": "arrow-left",
        "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.18, 20, 1.5],
        "icon-rotate": ["to-number", ["get", "direction"]],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    },
    {
      id: "arrows-right",
      source: "carrefour",
      "source-layer": "arrows",
      type: "symbol",
      filter: ["==", ["get", "arrow_type"], "right"],
      minzoom: 17,
      layout: {
        "icon-image": "arrow-right",
        "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.18, 20, 1.5],
        "icon-rotate": ["to-number", ["get", "direction"]],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    },
    {
      id: "road-marking-bicycle",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "symbol",
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "symbol"], "bicycle"],
      ],
      minzoom: 17,
      layout: {
        "icon-image": "bicycle",
        // Taille fixe au sol : double à chaque zoom (exponential base 2)
        "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.04, 20, 0.32],
        "icon-rotate": ["to-number", ["coalesce", ["get", "direction"], 0]],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    },
    {
      id: "road-marking-chevron-double",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "symbol",
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "symbol"], "chevron_double"],
      ],
      minzoom: 17,
      layout: {
        "icon-image": "chevron-double",
        // Taille fixe au sol : double à chaque zoom (exponential base 2)
        "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.04, 20, 0.32],
        "icon-rotate": ["to-number", ["coalesce", ["get", "direction"], 0]],
        "icon-rotation-alignment": "map",
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
    },
    {
      id: "road-marking-text",
      source: "carrefour",
      "source-layer": "road_marking",
      type: "symbol",
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "road_marking"], "text"],
      ],
      minzoom: 16,
      layout: {
        "text-field": [
          "coalesce",
          ["get", "inscription"],
          ["get", "text"],
          ["get", "name"],
          "—",
        ],
        "text-font": ["Barlow Condensed"],
        // Taille fixe au sol : double à chaque zoom
        "text-size": ["interpolate", ["exponential", 2], ["zoom"], 16, 2, 20, 32],
        "text-letter-spacing": 0.02
        ,
        "text-rotate": ["to-number", ["coalesce", ["get", "direction"], 0]],
        "text-rotation-alignment": "map",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": MARKING_WHITE,
      },
    },

    // Manholes — petits cercles gris foncé
    {
      id: "street-features-manhole",
      source: "carrefour",
      "source-layer": "street_features",
      type: "circle",
      filter: ["==", ["get", "man_made"], "manhole"],
      minzoom: 17,
      paint: {
        // Taille fixe au sol (~70 cm de diamètre)
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.3, 20, 2.4],
        "circle-color": MANHOLE_COLOR,
        "circle-stroke-color": "#2a2522",
        "circle-stroke-width": 0.5,
      },
    },
    // Bollards — petits cercles très foncés (vue du dessus)
    {
      id: "street-features-bollard",
      source: "carrefour",
      "source-layer": "street_features",
      type: "circle",
      filter: ["==", ["get", "barrier"], "bollard"],
      minzoom: 17,
      paint: {
        // Diamètre fixe au sol (~30 cm)
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.15, 20, 1.2],
        "circle-color": "#2a2522",
        "circle-stroke-color": "#1c1c1c",
        "circle-stroke-width": 0.4,
      },
    },
    // Arbres — 3 m de rayon, pseudo-gradient radial via cercles superposés
    // Couronne externe diffuse
    {
      id: "street-features-tree-outer",
      source: "carrefour",
      "source-layer": "street_features",
      type: "circle",
      filter: ["==", ["get", "natural"], "tree"],
      minzoom: 16,
      paint: {
        // ~9 m de rayon (= 3× le précédent)
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 16, 4.5, 20, 72],
        "circle-color": "#8aab66",
        "circle-opacity": 0.55,
        "circle-blur": 0.5,
      },
    },
    // Couronne intermédiaire : feuillage plus dense (~6 m rayon)
    {
      id: "street-features-tree-mid",
      source: "carrefour",
      "source-layer": "street_features",
      type: "circle",
      filter: ["==", ["get", "natural"], "tree"],
      minzoom: 16,
      paint: {
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 16, 3, 20, 48],
        "circle-color": "#6a8a4a",
        "circle-opacity": 0.8,
        "circle-blur": 0.25,
      },
    },
    // Cœur (tronc / point central, ~1.5 m rayon)
    {
      id: "street-features-tree-core",
      source: "carrefour",
      "source-layer": "street_features",
      type: "circle",
      filter: ["==", ["get", "natural"], "tree"],
      minzoom: 17,
      paint: {
        "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 17, 0.75, 20, 6],
        "circle-color": "#4f6b35",
        "circle-opacity": 0.9,
      },
    },

    // Stop sign (traffic_signals retiré du rendu)
    {
      id: "crossings-stop",
      source: "carrefour",
      "source-layer": "crossings",
      type: "circle",
      filter: [
        "all",
        ["==", ["geometry-type"], "Point"],
        ["==", ["get", "highway"], "stop"],
      ],
      minzoom: 16,
      paint: {
        "circle-radius": 5,
        "circle-color": "#a64a4a",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1.5,
      },
    },

    // ----- DEBUG (local uniquement) -----
    // Pour chaque area:highway=crossing, on rend en rouge :
    //  - l'axe principal PCA (ligne pleine)
    //  - la bbox orientée (rectangle tireté)
    // Permet de diagnostiquer pourquoi certaines bandes zebra sont mal orientées.
    ...(debug
      ? [
          {
            id: "crossing-bbox-debug",
            source: "carrefour",
            "source-layer": "crossing_axes",
            type: "line",
            filter: ["==", ["get", "kind"], "bbox"],
            minzoom: 16,
            paint: {
              "line-color": "#ff0000",
              "line-width": 1,
              "line-opacity": 0.6,
              "line-dasharray": [3, 3],
            },
          } satisfies LayerSpecification,
          {
            id: "crossing-axes-debug",
            source: "carrefour",
            "source-layer": "crossing_axes",
            type: "line",
            filter: ["==", ["get", "kind"], "axis"],
            minzoom: 16,
            paint: {
              "line-color": "#ff0000",
              "line-width": 2,
              "line-opacity": 0.9,
            },
          } satisfies LayerSpecification,
        ]
      : []),
  ],
});

export function MicroMappingMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beforeRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const sliderPosRef = useRef(50); // 0–100, position du slider

  const [sliderPos, setSliderPos] = useState(50);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !beforeRef.current || !afterRef.current) return;

    const wrapper = containerRef.current;
    const beforeContainer = beforeRef.current;
    const afterContainer = afterRef.current;

    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    // Préchargement de la web font pour MapLibre 5 (text-font: Barlow Condensed Medium).
    // Sans ce load explicite, MapLibre rendrait avec une fallback en attendant.
    if (typeof document !== "undefined" && "fonts" in document) {
      void document.fonts.load("500 16px 'Barlow Condensed'");
    }

    let beforeMap: maplibregl.Map | null = null;
    let afterMap: maplibregl.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

    // Attend que le wrapper ait une hauteur réelle
    const waitForSize = () =>
      new Promise<void>((resolve) => {
        const check = () => {
          if (cancelled) return resolve();
          if (wrapper.clientHeight > 0 && wrapper.clientWidth > 0) {
            return resolve();
          }
          requestAnimationFrame(check);
        };
        check();
      });

    waitForSize().then(() => {
      if (cancelled) return;

      console.log("[MicroMappingMap] init", {
        wrapperSize: { w: wrapper.clientWidth, h: wrapper.clientHeight },
        beforeSize: { w: beforeContainer.clientWidth, h: beforeContainer.clientHeight },
        afterSize: { w: afterContainer.clientWidth, h: afterContainer.clientHeight },
      });

      beforeMap = new maplibregl.Map({
        container: beforeContainer,
        style: orthoStyle,
        center: CENTER,
        zoom: 19,
        minZoom: 15,
        maxZoom: 20,
        attributionControl: false,
      });

      beforeMap.on("load", () => {
        console.log("[MicroMappingMap] beforeMap loaded", {
          canvas: { w: beforeContainer.clientWidth, h: beforeContainer.clientHeight },
        });
        beforeMap?.resize();
      });
      beforeMap.on("error", (e) => console.error("[MicroMappingMap] beforeMap error", e));

      afterMap = new maplibregl.Map({
        container: afterContainer,
        style: buildRenderStyle(
          window.location.origin,
          // Mode debug : axe principal PCA visible. Actif uniquement en local
          // (localhost ou 127.0.0.1). Caché en prod.
          ["localhost", "127.0.0.1"].includes(window.location.hostname),
        ),
        center: CENTER,
        zoom: 18,
        minZoom: 15,
        maxZoom: 20,
        attributionControl: false,
      });

      afterMap.on("load", () => {
        console.log("[MicroMappingMap] afterMap loaded", {
          canvas: { w: afterContainer.clientWidth, h: afterContainer.clientHeight },
        });
        afterMap?.resize();
      });
      afterMap.on("error", (e) => console.error("[MicroMappingMap] afterMap error", e));

      beforeMap.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-left",
      );
      afterMap.addControl(new maplibregl.NavigationControl(), "top-right");
      afterMap.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right",
      );

      // Synchronisation caméra : tout changement sur l'une se propage sur l'autre
      let syncing = false;
      const sync = (from: maplibregl.Map, to: maplibregl.Map) => () => {
        if (syncing) return;
        syncing = true;
        to.jumpTo({
          center: from.getCenter(),
          zoom: from.getZoom(),
          bearing: from.getBearing(),
          pitch: from.getPitch(),
        });
        syncing = false;
      };
      beforeMap.on("move", sync(beforeMap, afterMap));
      afterMap.on("move", sync(afterMap, beforeMap));

      resizeObserver = new ResizeObserver(() => {
        beforeMap?.resize();
        afterMap?.resize();
      });
      resizeObserver.observe(wrapper);
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      beforeMap?.remove();
      afterMap?.remove();
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  // --- Logique du slider ---
  const updateSlider = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, pct));
    sliderPosRef.current = clamped;
    setSliderPos(clamped);
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      updateSlider(e.clientX);
    };
    const onPointerUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden rounded-lg border border-border"
      style={{ height: 560 }}
    >
      {/* Ortho dessous, pleine largeur */}
      <div
        ref={beforeRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Rendu OSM par-dessus, clippé selon sliderPos */}
      <div
        ref={afterRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          clipPath: `inset(0 0 0 ${sliderPos}%)`,
        }}
      />

      {/* Slider central */}
      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: `${sliderPos}%` }}
      />
      <button
        type="button"
        aria-label="Glisser pour comparer ortho et rendu"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          draggingRef.current = true;
        }}
        className="absolute top-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-border bg-surface-elevated shadow-md transition-shadow hover:shadow-lg"
        style={{ left: `${sliderPos}%` }}
      >
        <span aria-hidden className="text-text-muted">
          ⇆
        </span>
      </button>

      {/* Étiquettes */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded border border-border bg-surface-elevated/90 px-2 py-1 backdrop-blur">
        <p className="label-caps text-text-subtle">Ortho 2024</p>
      </div>
      <div className="pointer-events-none absolute right-16 top-4 z-10 rounded border border-border bg-surface-elevated/90 px-2 py-1 backdrop-blur">
        <p className="label-caps text-text-subtle">Rendu OSM</p>
      </div>
    </div>
  );
}
