// ============================================================
// CV — Simon Picot
// Compilation : npm run cv  (ou typst compile --font-path cv/fonts cv/cv.typ public/cv.pdf)
// ============================================================

#let accent = rgb("#1f4d3a")
#let surface = rgb("#fafaf9")
#let text-muted = rgb("#57534e")
#let text-subtle = rgb("#78716c")
#let border = rgb("#e7e5e4")
#let grid-line = rgb(0, 0, 0, 10) // alpha très faible

#set document(
  title: "CV — Simon Picot",
  author: "Simon Picot",
)

// ----- Grid background (fond technique discret) -------------

#let grid-bg = {
  let step = 12mm
  let w = 210mm
  let h = 297mm
  place(
    top + left,
    {
      // Lignes verticales
      for x in range(0, int(w / step) + 1) {
        place(
          top + left,
          dx: x * step,
          line(angle: 90deg, length: h, stroke: 0.2pt + grid-line),
        )
      }
      // Lignes horizontales
      for y in range(0, int(h / step) + 1) {
        place(
          top + left,
          dy: y * step,
          line(length: w, stroke: 0.2pt + grid-line),
        )
      }
    },
  )
}

#set page(
  paper: "a4",
  margin: (top: 12mm, bottom: 10mm, left: 14mm, right: 14mm),
  background: grid-bg,
)

#set text(
  font: "Inter",
  size: 9.5pt,
  fill: rgb("#1c1c1c"),
  lang: "fr",
)

#set par(
  leading: 0.6em,
  justify: false,
)

// ----- Helpers ----------------------------------------------

#let label-caps(content) = text(
  font: "Space Grotesk",
  weight: "semibold",
  size: 7.5pt,
  tracking: 1.4pt,
  fill: text-subtle,
  upper(content),
)

#let section-title(content) = block(
  above: 14pt,
  below: 8pt,
  {
    grid(
      columns: (auto, 1fr),
      column-gutter: 10pt,
      align: (left + horizon, left + horizon),
      text(
        font: "Space Grotesk",
        weight: "semibold",
        size: 11.5pt,
        fill: accent,
        upper(content),
      ),
      line(length: 100%, stroke: 0.6pt + border),
    )
  }
)

#let entry(
  period: "",
  title: "",
  meta: "",
  body: none,
) = block(
  below: 8pt,
  {
    grid(
      columns: (28mm, 1fr),
      column-gutter: 10pt,
      align: (left + top, left + top),
      label-caps(period),
      [
        #text(font: "Space Grotesk", weight: "semibold", size: 10pt, title) \
        #text(size: 9pt, fill: text-muted, meta)
        #if body != none [
          \ #text(size: 9pt, fill: text-muted, body)
        ]
      ],
    )
  }
)

#let chip(content) = box(
  inset: (x: 5pt, y: 2.5pt),
  outset: (y: 2.5pt),
  stroke: 0.5pt + border,
  radius: 2pt,
  fill: surface,
  text(size: 8pt, fill: text-muted, content),
)

// ----- En-tête avec photo -----------------------------------

#grid(
  columns: (1fr, 26mm),
  align: (left + horizon, right + horizon),
  column-gutter: 14pt,
  [
    #text(font: "Space Grotesk", weight: "bold", size: 24pt, "Simon Picot") \
    #v(-2pt)
    #text(size: 10.5pt, fill: text-muted)[
      Géomatique + dev web · Nancy
    ]
    #v(6pt)
    #text(size: 8.5pt, fill: text-muted)[
      #link("mailto:pro@simonpct.fr")[pro\@simonpct.fr] ·
      #link("https://simonpct.fr")[simonpct.fr] \
      #link("https://linkedin.com/in/simon-picot")[linkedin.com/in/simon-picot] ·
      #link("https://github.com/simonpct")[github.com/simonpct]
    ]
  ],
  box(
    radius: 4mm,
    clip: true,
    image("portrait.jpg", width: 26mm, height: 26mm, fit: "cover"),
  ),
)

#v(8pt)
#line(length: 100%, stroke: 0.6pt + border)
#v(8pt)

// ----- Profil -----------------------------------------------

#text(size: 9.5pt, fill: text-muted)[
  Étudiant en alternance en développement web qui pivote vers la
  géomatique. Je couvre la chaîne complète : acquisition LiDAR sur
  le terrain, analyse spatiale en Python, publication d'applications
  web cartographiques. Trois années d'alternance déjà en poche.
]

// ----- Recherche --------------------------------------------

#section-title[Recherche]

#entry(
  period: "Sept. 2026 → juil. 2027",
  title: "Alternance — Licence Pro SIG",
  meta: "Cartographie, Topographie et SIG · Université de Lorraine · Candidat",
  body: "Collectivité, bureau d'études géomatique, structure de données ouvertes, transports. Nancy en priorité.",
)

// ----- Expérience -------------------------------------------

#section-title[Expérience]

#entry(
  period: "Sept. 2025 → auj.",
  title: "Développeur web — Skedl + Neodigit",
  meta: "Nancy · Alternance double-mission",
  body: "Gestion d'événements · méthodes agiles. Stack TypeScript, React, Next.js.",
)

#entry(
  period: "Juil. 2024 → juil. 2025",
  title: "Développeur web — TheGiftsClub",
  meta: "Paris · Alternance",
  body: "Développement React, déploiement AWS. Mise en production d'applications client.",
)

#entry(
  period: "Juil. 2023",
  title: "Stage — Keolis Grand Nancy",
  meta: "Poste de Commandement Centralisé",
  body: "Découverte du SAE Ineo Systrans, exploitation du réseau de transport en commun.",
)

// ----- Projets ----------------------------------------------

#section-title[Projets géomatique]

#entry(
  period: "2026 · En cours",
  title: "Le Palais — relevé LiDAR multi-étages",
  meta: "Acquisition 3D · ROS 2 · Potree · visite virtuelle 360°",
  body: "Conception d'un rig sur mesure (Unilidar L2 + Raspberry Pi). Scan complet d'un édifice nancéien en collaboration bénévole, livré sous forme de visite immersive web.",
)

#entry(
  period: "2026",
  title: "Accessibilité STAN — isochrones piétonnes",
  meta: "GTFS · OSM · INSEE · r5py · MapLibre",
  body: "Analyse de la couverture du réseau STAN à l'échelle du Grand Nancy.",
)

// ----- Formation --------------------------------------------

#section-title[Formation]

#entry(
  period: "2024 → août 2026",
  title: "CESI · Bachelor Développement Web",
  meta: "En alternance · Nancy",
)

#entry(
  period: "2021 → 2024",
  title: "Lycée Henri Loritz · Nancy",
  meta: "Baccalauréat général, dominante scientifique · mention assez bien",
)

// ----- Compétences ------------------------------------------

#section-title[Compétences]

#grid(
  columns: (28mm, 1fr),
  column-gutter: 10pt,
  row-gutter: 8pt,
  label-caps("Géomatique"),
  [#chip("QGIS") #chip("PostGIS") #chip("GeoPandas") #chip("PDAL") #chip("rasterio") #chip("CloudCompare") #chip("MapLibre GL JS")],

  label-caps("Acquisition"),
  [#chip("LiDAR Unilidar L2") #chip("Photogrammétrie") #chip("ROS 2") #chip("Raspberry Pi")],

  label-caps("Dev"),
  [#chip("Python") #chip("TypeScript") #chip("React") #chip("Next.js") #chip("Node.js") #chip("AWS")],

  label-caps("Données"),
  [#chip("OpenStreetMap") #chip("GTFS") #chip("IGN") #chip("INSEE") #chip("GeoJSON") #chip("PMTiles")],
)

// ----- Pratique communautaire -------------------------------

#section-title[Pratique communautaire]

#entry(
  period: "Continu",
  title: "Contributeur OpenStreetMap",
  meta: "Secteur Nancy · bâti, voirie piétonne, adresses, points d'intérêt",
)
