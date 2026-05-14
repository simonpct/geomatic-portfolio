export type StackGroup = {
  label: string;
  items: string[];
};

export type PipelineStep = {
  number: string;
  label: string;
  title: string;
  description: string;
  color: string;
  preview?: string;
  previewAlt?: string;
};

export type ProjectSection = {
  number: string;
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  location: string;
  year: string;
  category: string;
  summary: string;
  tags: string[];
  status: "En cours" | "Livré" | "À venir";
  meta: {
    role: string;
    statusLabel: string;
  };
  context: string;
  sections: ProjectSection[];
  stack: StackGroup[];
  pipeline?: PipelineStep[];
  liveDemo?: {
    label: string;
    description: string;
  }[];
};

export const projects: Project[] = [
  {
    slug: "le-palais",
    title: "Le Palais",
    location: "Nancy",
    year: "2026",
    category: "Patrimoine · Acquisition 3D",
    summary:
      "Relevé LiDAR multi-étages et visite virtuelle 360° d'un édifice patrimonial nancéien, en collaboration bénévole avec le commanditaire.",
    tags: ["LiDAR", "ROS 2", "Potree"],
    status: "En cours",
    meta: {
      role: "Conception · Acquisition · Traitement · Publication",
      statusLabel: "En cours",
    },
    context:
      "Le Palais est un édifice patrimonial nancéien ouvert au public. J'ai proposé au commanditaire une démarche bénévole de relevé numérique et de valorisation web : produire une visite virtuelle accessible au grand public, et archiver un nuage de points exploitable pour l'entretien et la documentation du bâti.",
    sections: [
      {
        number: "02",
        title: "Acquisition",
        body: "Plateforme mobile conçue sur mesure : scanner LiDAR Unilidar L2 et caméra 360°, pilotés par Raspberry Pi sous ROS 2. Acquisition simultanée du nuage de points et des panoramas immersifs sur les quatre étages du bâtiment.",
      },
      {
        number: "03",
        title: "Traitement",
        body: "Alignement multi-étages par recalage de points homologues entre paliers. Filtrage du bruit, sous-échantillonnage adapté à la publication web. Extraction d'un plan 2D vectoriel par étage à partir des sections horizontales du nuage.",
      },
      {
        number: "04",
        title: "Publication",
        body: "Visite virtuelle en panoramas 360 chaînés, points de vue géo-référencés sur le plan 2D. Le nuage de points densifié est consultable séparément via Potree pour les usages techniques.",
      },
    ],
    stack: [
      { label: "Acquisition", items: ["Unilidar L2", "GoPro 360", "Raspberry Pi", "ROS 2"] },
      { label: "Traitement", items: ["CloudCompare", "PDAL", "Python"] },
      { label: "Publication", items: ["Potree", "Pannellum", "Next.js"] },
    ],
    pipeline: [
      {
        number: "01",
        label: "Hardware",
        title: "Rig sur mesure",
        description:
          "Plateforme mobile assemblée à partir d'un scanner LiDAR Unilidar L2, d'une caméra 360° et d'un Raspberry Pi sous ROS 2.",
        color: "#6b7d8a",
      },
      {
        number: "02",
        label: "Terrain",
        title: "Acquisition",
        description:
          "Captation simultanée du nuage de points et des panoramas immersifs sur les quatre étages, en parcours continu pour assurer la cohérence du SLAM.",
        color: "#4f7060",
      },
      {
        number: "03",
        label: "Bureau",
        title: "Traitement",
        description:
          "Recalage multi-étages, filtrage du bruit, sous-échantillonnage pour le web, extraction d'un plan 2D vectoriel par sections horizontales.",
        color: "#a78b5e",
      },
      {
        number: "04",
        label: "Web",
        title: "Publication",
        description:
          "Visite virtuelle 360° géo-référencée sur le plan 2D, et nuage de points densifié consultable via Potree pour les usages techniques.",
        color: "#8a6a78",
      },
    ],
    liveDemo: [
      {
        label: "Visite virtuelle 360°",
        description: "Navigation immersive entre les points de vue panoramiques.",
      },
      {
        label: "Nuage de points 3D",
        description: "Exploration libre du scan via Potree.",
      },
    ],
  },
  {
    slug: "accessibilite-stan",
    title: "Accessibilité STAN",
    location: "Grand Nancy",
    year: "2026",
    category: "Mobilité · Analyse spatiale",
    summary:
      "Analyse d'isochrones piétonnes sur le réseau STAN : quelle part de la population a un arrêt à moins de 5, 10 ou 15 minutes à pied ?",
    tags: ["GTFS", "GeoPandas", "MapLibre"],
    status: "À venir",
    meta: {
      role: "Conception · Analyse · Visualisation",
      statusLabel: "À venir",
    },
    context:
      "L'accessibilité aux transports en commun est un indicateur clé pour évaluer l'équité d'un service public urbain. Cette analyse mesure, à partir de données 100 % ouvertes, la couverture piétonne du réseau STAN à l'échelle du Grand Nancy.",
    sections: [
      {
        number: "02",
        title: "Sources de données",
        body: "GTFS officiel STAN pour les arrêts et fréquences, OpenStreetMap pour la voirie piétonne, carroyage INSEE pour la distribution de population. L'ensemble des sources sont publiques et reproductibles.",
      },
      {
        number: "03",
        title: "Méthode d'analyse",
        body: "Calcul d'isochrones réseau (et non buffers euclidiens) via un moteur de routage piéton sur le graphe OSM. Agrégation par carreau INSEE 200 m pour estimer la part de population couverte par tranche de temps.",
      },
      {
        number: "04",
        title: "Visualisation",
        body: "Carte web interactive avec basculement entre seuils de temps (5, 10, 15 min), mise en évidence des zones blanches, fiche d'arrêt au clic. Limites assumées : analyse en heure de pointe, mode piéton seul, accessibilité PMR non modélisée.",
      },
    ],
    stack: [
      { label: "Données", items: ["GTFS STAN", "OSM", "INSEE"] },
      { label: "Traitement", items: ["Python", "GeoPandas", "r5py / pgRouting"] },
      { label: "Publication", items: ["MapLibre GL JS", "Tuiles vectorielles", "Next.js"] },
    ],
    liveDemo: [
      {
        label: "Carte interactive",
        description: "Basculement entre seuils 5 / 10 / 15 minutes.",
      },
    ],
  },
  {
    slug: "micromapping-osm",
    title: "Micromapping OSM",
    location: "Carrefour Foch / Saint-Léon / Kennedy, Nancy",
    year: "2026",
    category: "OpenStreetMap · Cartographie de précision",
    summary:
      "Démonstrateur de cartographie fine : marquages au sol, trottoirs comme surfaces, mobilier urbain. Contribution OSM et rendu MapLibre custom.",
    tags: ["OSM", "MapLibre", "PMTiles"],
    status: "Livré",
    meta: {
      role: "Cartographie · Style · Pipeline · Publication",
      statusLabel: "Livré",
    },
    context:
      "OpenStreetMap est souvent perçue comme une base mondiale mais peu détaillée. Ce projet démontre l'inverse à l'échelle d'un carrefour de Nancy : surfaces de chaussée et trottoirs comme polygones, passages piétons avec bandes zebra générées par PCA, marquages directionnels, mobilier urbain. L'objectif : prouver qu'OSM peut atteindre la finesse d'un SIG métier de collectivité, et que cette finesse peut être rendue cartographiquement de manière nette.",
    sections: [
      {
        number: "02",
        title: "Sources et collecte",
        body: "Orthophoto Grand Nancy 2024 (mise à jour 2025, 5 cm/pixel) servie en WMS par datagrandest.fr comme fond de calage. Saisie dans JOSM sur les tags area:highway (chaussée, trottoirs, îlots, passages piétons, sas vélo), road_marking (lignes, flèches, restrictions), barrier=bollard, natural=tree, man_made=manhole. Contributions poussées dans OSM avec source explicite.",
      },
    ],
    stack: [
      {
        label: "Données",
        items: ["OpenStreetMap", "Orthophoto Grand Nancy 2024", "datagrandest.fr WMS"],
      },
      {
        label: "Pipeline",
        items: ["JOSM", "osmium-tool", "tippecanoe", "Python · geopandas · shapely"],
      },
      {
        label: "Publication",
        items: ["MapLibre GL JS", "PMTiles", "Web Fonts (Barlow Condensed)", "Next.js"],
      },
    ],
    liveDemo: [
      {
        label: "Carte interactive",
        description: "Comparaison orthophoto / rendu OSM avec slider.",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectIndex(slug: string): number {
  return projects.findIndex((p) => p.slug === slug);
}

export const projectImages: Record<string, { src: string; alt: string }> = {
  "le-palais": {
    src: "/lepalais.png",
    alt: "Le Palais — vue extérieure du bâtiment, Nancy",
  },
  "micromapping-osm": {
    src: "/micromapping.jpg",
    alt: "Carrefour Foch / Saint-Léon / Kennedy — relevé micromapping OSM, Nancy",
  },
};

export function getProjectImage(slug: string) {
  return projectImages[slug];
}

const projectAccents: Record<string, string> = {
  "le-palais": "#a78b5e",
  "accessibilite-stan": "#4f7060",
  "micromapping-osm": "#8a6a78",
};

export function getProjectAccent(slug: string): string {
  return projectAccents[slug] ?? "#1f4d3a";
}

export type ProjectStatusVisual = {
  dot: string;
  label: string;
  text: string;
  bg: string;
  border: string;
};

export function getStatusVisual(status: Project["status"]): ProjectStatusVisual {
  switch (status) {
    case "Livré":
      return {
        dot: "#1f4d3a",
        label: status,
        text: "#1f4d3a",
        bg: "#e6efe9",
        border: "#1f4d3a33",
      };
    case "En cours":
      return {
        dot: "#a78b5e",
        label: status,
        text: "#7a6443",
        bg: "#f5efe3",
        border: "#a78b5e33",
      };
    case "À venir":
      return {
        dot: "#78716c",
        label: status,
        text: "#57534e",
        bg: "#f4f4f3",
        border: "#78716c33",
      };
  }
}
