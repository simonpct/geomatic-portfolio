# Projet 3 — Micromapping OSM

Démonstrateur de cartographie OpenStreetMap fine, à l'échelle du
marquage au sol, sur un carrefour complexe de Nancy.

---

## 1. Objectif

Prouver qu'OpenStreetMap peut atteindre un niveau de détail digne d'un
SIG métier de collectivité, et que ce niveau peut être **rendu
cartographiquement** de manière nette.

**Question concrète :**
À quoi ressemble OSM si on y consacre 50 heures de cartographie de
précision sur un carrefour réel, avec gestion des niveaux multiples,
des marquages au sol et des trottoirs comme surfaces ?

Output : contributions OSM publiques + carte web interactive
"avant / après" + style MapLibre custom valorisant les éléments
détaillés.

---

## 2. Périmètre

**Site :** Carrefour Avenue Foch / Rue Saint-Jean / Viaduc J.F. Kennedy
/ Rue de la Commanderie — Nancy.

**Justification du choix :** site difficile cumulant plusieurs angles
techniques rarement bien traités sur OSM :

- **Niveaux multiples** : le viaduc Kennedy passe au-dessus du
  carrefour au sol. Force la rigueur sur `layer`, `bridge` et
  potentiellement `level`.
- **Sens uniques croisés** : marquages directionnels nombreux
  (flèches au sol, voies réservées).
- **Carrefour à feux** : feux tricolores, lignes d'arrêt, passages
  piétons, sas vélos éventuels.
- **Trottoirs et espaces piétons** : surfaces irrégulières autour du
  carrefour, à modéliser comme polygones plutôt que lignes.
- **Probable présence de pistes cyclables et arrêts de bus** dans le
  périmètre.

**Bbox approximative :** à affiner sur le terrain, ~150 m × 150 m
autour du carrefour. Centre approximatif : 48.6907 N, 6.1693 E.

---

## 3. Sources

| Donnée | Source | Usage | Licence |
|---|---|---|---|
| Fond de calage | BD ORTHO IGN (résolution 5 cm) | Tracé géométrique principal | Licence ouverte 2.0 — compatible OSM |
| Validation street-level | Mapillary | Nature et orientation des marquages | CC BY-SA — compatible OSM |
| Vérification ponctuelle | Terrain à pied | Finalisation détails non visibles depuis l'air | — |
| Données existantes | OpenStreetMap | Base de départ et publication | ODbL |

**Important** : chaque changeset doit comporter `source=BDORTHO IGN`
et/ou `source=Mapillary` selon les éléments tracés. C'est une
**convention communautaire OSM** et un signal de sérieux pour les
mappeurs validateurs.

---

## 4. Méthode de cartographie

### 4.1 Préparation

1. Configurer JOSM avec :
   - Image WMS BD ORTHO 5 cm (URL Géoportail)
   - Couche Mapillary
   - Plugin `utilsplugin2` pour les outils avancés
2. Télécharger le bbox actuel d'OSM sur le périmètre
3. Faire un **état des lieux avant** (capture du rendu osm-carto)

### 4.2 Tags ciblés (par ordre d'importance)

**Surfaces de voirie :**
- `area:highway=primary` / `secondary` pour la chaussée comme surface
- `area:highway=traffic_island` pour les îlots centraux
- `area:highway=footway` pour les zones piétonnes
- `area:highway=crossing` pour les passages piétons matérialisés

**Trottoirs :**
- Tracé en polygones séparés avec `highway=footway` + `area=yes` +
  `footway=sidewalk`
- En complément, garder `sidewalk=left/right/both` sur les routes
  principales pour les rendus qui ne supportent pas encore `area:highway`

**Marquages au sol :**
- `highway=give_way` / `highway=stop` aux nœuds d'intersection
- `highway=traffic_signals` pour les feux
- `crossing=marked` + `crossing:markings=zebra/lines/dashes` selon
  l'observation
- Voies de bus : `lanes:bus=*` + `psv:lanes=*`

**Pont :**
- Sur le viaduc Kennedy : `bridge=yes`, `layer=1`, `man_made=bridge`
- Au sol sous le viaduc : `tunnel=building_passage` ou simplement
  rien si l'ouvrage n'enferme pas l'air

**Vélos :**
- `cycleway:left/right=*` ou `cycleway:both=*`
- Si bande séparée matérialisée : géométrie distincte avec
  `highway=cycleway`

### 4.3 Workflow JOSM

1. **Calage** : afficher BD ORTHO en fond, vérifier l'alignement avec
   OSM existant (rectifier si décalage > 50 cm).
2. **Tracé surfaces** : commencer par les `area:highway` de la
   chaussée principale, puis les îlots, puis les trottoirs.
3. **Tracé marquages** : passages piétons (polygones simples),
   lignes d'arrêt si visibles sur l'ortho.
4. **Validation Mapillary** : pour chaque passage piéton, vérifier
   le type de marquage (zébra, dents de requin) sur la photo
   street-level la plus récente.
5. **Vérif tags** : avant chaque upload, faire passer le validator
   JOSM intégré, corriger tous les warnings rouges.
6. **Upload** : changeset par "lot logique" (ex. "carrefour Foch :
   surfaces de chaussée", "carrefour Foch : marquages au sol"), pas
   un mega-changeset.

### 4.4 Vérification terrain (1 session, ~1 h)

À faire en **dernier**, après le gros du travail sur ortho :

- Photos verticales des marquages non identifiables sur ortho
- Confirmation des sens uniques et signalisation verticale
- Notes sur les particularités locales (état dégradé d'un marquage,
  voie bus matérialisée par couleur, etc.)

---

## 5. Limites assumées

À mentionner dans la page portfolio et le README :

1. **Tags émergents controversés** : `area:highway=*` n'a pas
   consensus complet en 2026. Certains rendus (osm-carto) ne le
   supportent pas. C'est un choix méthodologique assumé.
2. **Pas de relevé métrique précis** : précision dépend de l'ortho
   IGN (~10 cm au sol, suffisante pour ce niveau de détail mais pas
   pour une mesure de chantier).
3. **Périmètre limité à un carrefour** : c'est volontairement une
   **preuve de concept**, pas une cartographie exhaustive de la ville.
4. **Pas de modélisation du mobilier urbain** complet (poteaux,
   panneaux verticaux) — focus sur l'horizontalité.

---

## 6. Livrables

### 6.1 Contributions OSM

- Plusieurs changesets traçables via OSMCha et achavi
- Signature dans chaque changeset : `source=BDORTHO IGN` ou
  `source=Mapillary`, message clair décrivant le lot
- Lien public vers le diff dans la page portfolio

### 6.2 Style MapLibre custom

Adaptation d'un style existant **(OSM Liberty)** comme base, avec
surcouches pour :

- Rendu des `area:highway` en couleur de chaussée
- Rendu des passages piétons matérialisés
- Distinction visuelle des trottoirs en polygones
- Étiquetage léger des feux et stops

Code versionné, publié sur GitHub avec le repo principal du site ou
en repo séparé `nancy-tiles`.

### 6.3 Pipeline tuiles vectorielles

Pipeline reproductible :

1. Extraction OSM Geofabrik Lorraine ou export Overpass sur bbox
2. Découpe via `osmium-tool` sur bbox du carrefour étendu
3. Conversion en GeoJSON par couche thématique
4. Génération `.pmtiles` via `tippecanoe`
5. Servi en statique depuis `portfolio/public/tiles/nancy.pmtiles`

### 6.4 Page portfolio `/projets/micromapping-osm`

Gabarit existant. Composant interactif :

- Carte MapLibre custom centrée sur le carrefour
- **Toggle "avant / après"** : bascule entre état OSM précédent et
  état OSM actuel
- **Toggle "fond ortho"** : superposition BD ORTHO IGN en
  transparence
- Légende des éléments cartographiés
- Lien direct vers changesets OSM

---

## 7. Stack

### Cartographie

- **JOSM** : éditeur principal
- Plugins : `utilsplugin2`, `Mapillary`, `WMSPlugin`, `validator`

### Pipeline tuiles (repo séparé ou dossier `tiles/` du portfolio)

```
python ^3.11
osmium-tool         # découpe PBF
tippecanoe          # génération pmtiles
```

### Publication web

- `maplibre-gl` (déjà à ajouter au portfolio)
- `pmtiles` package npm

---

## 8. Charge estimée

| Étape | Heures |
|---|---|
| Setup JOSM + WMS + Mapillary | 2 |
| Calage et état des lieux avant | 2 |
| Tracé surfaces chaussée + îlots + viaduc | 8 |
| Tracé trottoirs polygones | 6 |
| Tracé marquages au sol | 6 |
| Validation Mapillary | 3 |
| Vérification terrain | 2 |
| Upload changesets (par lots) | 2 |
| Pipeline extraction + tuiles pmtiles | 8 |
| Style MapLibre custom (adaptation OSM Liberty) | 10 |
| Composant interactif portfolio | 6 |
| Page projet finalisée, captures, narration | 3 |
| Tests, doc, README | 2 |
| **Total** | **~60 h** |

Soit 5-6 weekends en répartissant, ou 3 semaines intensives.

---

## 9. Étapes de réalisation

### Phase 1 — Préparation (4 h)

- [ ] Configurer JOSM avec BD ORTHO + Mapillary + validator
- [ ] Délimiter bbox précise du périmètre étendu
- [ ] Capture "avant" du rendu osm-carto et style Liberty actuel
- [ ] **Validation** : ortho s'affiche correctement, calage OK avec OSM
      existant

### Phase 2 — Cartographie (25 h)

- [ ] Surfaces de chaussée principales (Foch, Saint-Jean, Kennedy,
      Commanderie)
- [ ] Îlots centraux et terre-pleins
- [ ] Trottoirs en polygones
- [ ] Passages piétons (avec validation Mapillary)
- [ ] Feux, stops, signalisation horizontale
- [ ] Viaduc Kennedy : `bridge`, `layer`
- [ ] Bandes/pistes cyclables si présentes
- [ ] Sens uniques et marquages directionnels
- [ ] **Validation** : achavi diff clean, validator JOSM sans
      warnings critiques

### Phase 3 — Vérification terrain (2 h)

- [ ] Visite sur place avec téléphone
- [ ] Photos verticales des marquages ambigus
- [ ] Notes corrections à faire
- [ ] Retour JOSM, dernières corrections, upload final

### Phase 4 — Pipeline tuiles (8 h)

- [ ] Script extraction OSM bbox via Overpass ou Geofabrik
- [ ] Découpe par couche thématique (chaussée, marquages,
      trottoirs, bâti, ...)
- [ ] Conversion en GeoJSON
- [ ] Génération `.pmtiles` via tippecanoe (paramètres adaptés au
      grand zoom : `-z18 -Z14`)
- [ ] **Validation** : tuiles servies en statique, navigation
      fluide jusqu'au zoom 20

### Phase 5 — Style custom (10 h)

- [ ] Fork du style OSM Liberty
- [ ] Ajout des couches pour `area:highway`
- [ ] Ajout des couches pour passages piétons matérialisés
- [ ] Distinction visuelle des trottoirs polygones
- [ ] Test multi-zoom (z14 à z20)
- [ ] **Validation** : à z19-z20, tous les éléments détaillés sont
      visibles et lisibles

### Phase 6 — Page portfolio (8 h)

- [ ] Composant `<MicroMappingMap />` côté client
- [ ] Toggle "avant / après" (deux sources de tuiles)
- [ ] Toggle "fond ortho IGN" (overlay raster transparent)
- [ ] Liens vers changesets OSM
- [ ] Mise à jour finale des `sections` dans `lib/projects.ts`

### Phase 7 — Finalisation (3 h)

- [ ] Captures pour les vignettes
- [ ] Vérification responsive et perf
- [ ] Commit final, tag

---

## 10. Points d'attention

### Respect des conventions OSM

- **Pas de copyright violation** : seules les sources autorisées
  (BD ORTHO, Mapillary) doivent figurer en `source=`.
- **Pas de mass-tagging** ou de modifications hors périmètre.
- **Changesets explicites** : un message clair par lot, traçable.
- Si une partie de l'OSM existant est tagué autrement, **discuter
  avant de modifier**. La communauté OSM française est active et
  réactive sur Telegram et le forum.

### Compatibilité ODbL des sources

- BD ORTHO IGN sous **Licence Ouverte 2.0** : compatible OSM
  (autorisée explicitement par OSMF et la communauté française).
- Mapillary : CC BY-SA, compatible.
- **Ne jamais** utiliser Google Maps, Bing Maps en imagerie, ou des
  ortho à licence restrictive.

### Performance tuiles

- À z20, des `.pmtiles` peuvent atteindre plusieurs Mo. Bien limiter
  le `-Z14` (zoom minimum) pour ne pas générer de tuiles inutiles à
  faible zoom où le détail ne se voit pas.
- Sur le carrefour seul, le `.pmtiles` final devrait peser
  < 5 Mo.

### Gestion du viaduc Kennedy

Cas piège : si le viaduc est mal taggé en OSM aujourd'hui, **ne pas
le casser**. Vérifier l'état actuel, comprendre les choix précédents
(voir l'historique des contributions sur cette zone), améliorer plutôt
que remplacer.

### Crédibilité communautaire

Un projet "vu et validé" par la communauté OSM française est plus
fort en portfolio qu'une démo isolée. Mentionner explicitement les
changesets, et idéalement obtenir un commentaire positif ou une
discussion technique. C'est un **signal social** que les recruteurs
sérieux vérifieront.
