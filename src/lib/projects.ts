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
      "Isochrones piétonnes calculées sur le réseau STAN à partir de données 100 % ouvertes : 93 % de la population du Grand Nancy a un arrêt à moins de 5 minutes à pied.",
    tags: ["GTFS", "r5py", "MapLibre"],
    status: "Livré",
    meta: {
      role: "Conception · Analyse · Visualisation",
      statusLabel: "Pipeline reproductible · Carte interactive",
    },
    context:
      "L'accessibilité aux transports en commun est un indicateur clé pour évaluer l'équité d'un service public urbain. Cette analyse mesure, à partir de données 100 % ouvertes, la couverture piétonne du réseau STAN (bus + tram) à l'échelle du Grand Nancy — 20 communes, 223 000 habitants au carroyage INSEE.",
    sections: [
      {
        number: "02",
        title: "Sources de données",
        body: "GTFS officiel STAN (transport.data.gouv.fr) pour les 1 463 arrêts du réseau, voirie OpenStreetMap récupérée via Overpass et convertie en PBF par osmium-tool, carroyage INSEE Filosofi 200 m pour la distribution de population, limites communales Overpass (admin_level=8) filtrées par code EPCI. Tout est versionné dans metadata.json (hash SHA-256 et date d'extraction) pour reproduire l'analyse à l'identique.",
      },
      {
        number: "03",
        title: "Méthode d'analyse",
        body: "Calcul d'isochrones réseau via r5py (wrapper Python du moteur Conveyal R5). Une grille fine de destinations (100 m) couvre l'union des communes. r5py construit la matrice temps-de-marche depuis les 1 463 arrêts vers chaque cellule, à 4,5 km/h, en mode WALK uniquement. Pour chaque seuil (5/10/15 min), les cellules atteintes sont fusionnées avec un buffer adapté au pas de grille pour produire un polygone d'union. Chaque carreau INSEE 200 m hérite ensuite du seuil le plus restrictif qui couvre son centroïde.",
      },
      {
        number: "04",
        title: "Résultats",
        body: "Sur 223 390 habitants : 93,3 % à ≤ 5 min, 99,2 % à ≤ 10 min, 99,6 % à ≤ 15 min. Nancy centre dépasse 96 % dès 5 min ; les communes les moins denses (Art-sur-Meurthe, Dommartemont) descendent à 54-77 % à 5 min mais atteignent 100 % à 15 min. Le maillage STAN est remarquablement serré.",
      },
    ],
    stack: [
      { label: "Données", items: ["GTFS STAN", "OpenStreetMap (Overpass)", "INSEE Filosofi 2017"] },
      { label: "Traitement", items: ["Python · uv", "r5py + Conveyal R5", "GeoPandas · DuckDB", "osmium-tool"] },
      { label: "Publication", items: ["MapLibre GL JS", "GeoJSON statique", "Next.js"] },
    ],
    pipeline: [
      {
        number: "01",
        label: "Sources",
        title: "Données ouvertes",
        description:
          "GTFS STAN, voirie OSM via Overpass, carroyage INSEE Filosofi 200 m, communes via admin_level=8. Hashes SHA-256 sauvegardés pour la reproductibilité.",
        color: "#4f7060",
      },
      {
        number: "02",
        label: "Routage",
        title: "Isochrones r5py",
        description:
          "Conveyal R5 calcule la matrice temps-de-marche depuis 1 463 arrêts vers une grille fine de 17 242 destinations. 25 millions de paires en ~30 s.",
        color: "#6b7d8a",
      },
      {
        number: "03",
        label: "Agrégation",
        title: "Carreaux INSEE",
        description:
          "Chaque carreau 200 m hérite du seuil minimal qui couvre son centroïde. Agrégation de la population par seuil et par commune.",
        color: "#a78b5e",
      },
      {
        number: "04",
        label: "Web",
        title: "Carte interactive",
        description:
          "GeoJSON statiques servis par Next.js, rendus MapLibre avec basculement de seuil et popup arrêt. Fond Maptiler base-v4.",
        color: "#8a6a78",
      },
    ],
    liveDemo: [
      {
        label: "Code source GitHub",
        description: "Pipeline Python complet, reproductible avec uv sync + 3 scripts.",
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
  "accessibilite-stan": {
    src: "/access-stan.png",
    alt: "Carte d'accessibilité piétonne au réseau STAN — isochrones 5 minutes sur le Grand Nancy",
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
