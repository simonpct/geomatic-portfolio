# Projet 2 — Accessibilité STAN

Analyse d'isochrones piétonnes sur le réseau STAN du Grand Nancy.

---

## 1. Objectif

Mesurer, à partir de données 100 % ouvertes, la couverture piétonne du
réseau de transport en commun STAN à l'échelle du Grand Nancy.

**Question concrète :**
Quelle part de la population du Grand Nancy a un arrêt STAN
(bus + tram) à moins de 5, 10 et 15 minutes à pied de son lieu de
résidence ?

Output attendu : carte web interactive, cliquable arrêt par arrêt, avec
identification des zones blanches.

---

## 2. Données sources

| Donnée | Source | Format | Licence |
|---|---|---|---|
| Arrêts + horaires STAN | data.grandnancy.eu (GTFS officiel) | GTFS (ZIP de CSV) | Licence ouverte (Etalab) |
| Voirie piétonne | OpenStreetMap (export Geofabrik ou Overpass) | OSM PBF | ODbL |
| Population | INSEE — carroyage 200 m | shapefile / GeoPackage | Licence ouverte |
| Limites administratives | IGN ADMIN-EXPRESS | Shapefile | Licence ouverte |

Périmètre d'étude : **Grand Nancy** (20 communes, ~250 000 habitants).

Bbox approximative : `[6.07, 48.61, 6.30, 48.74]` (à affiner sur la
géométrie ADMIN-EXPRESS).

Toutes les sources sont reproductibles : un script `data/download.py`
récupère et place les fichiers dans `data/raw/`.

---

## 3. Méthode

### 3.1 Préparation

1. Téléchargement des 4 sources (`data/raw/`)
2. Découpage OSM PBF sur la bbox du Grand Nancy avec `osmium-tool`
3. Sélection des arrêts STAN dans le périmètre depuis le GTFS
4. Reprojection de tous les jeux en `EPSG:2154` (Lambert-93)

### 3.2 Calcul des isochrones

Outil retenu : **`r5py`** — wrapper Python du moteur Conveyal R5,
conçu pour l'analyse d'accessibilité depuis GTFS + OSM.

Pour chaque arrêt STAN :
- Calcul du temps de marche depuis chaque cellule du carroyage INSEE
  vers cet arrêt
- Vitesse piétonne : 4,5 km/h (paramètre par défaut de R5)
- Mode : `WALK` uniquement (pas de bus dans le routage)
- Génération d'isochrones à 5, 10, 15 minutes par fusion (union spatiale)

Sortie intermédiaire : `outputs/isochrones_{05,10,15}.geojson` —
polygones d'union de toutes les isochrones individuelles.

### 3.3 Agrégation par carreau INSEE 200 m

Pour chaque carreau INSEE :
- Classification "couvert à T minutes" si le centroïde du carreau
  intersecte l'isochrone fusionnée
- Calcul de la part de population couverte par tranche
- Conservation de la valeur de couverture la plus restrictive (5 min
  prime sur 10 min prime sur 15 min)

Sortie finale : `outputs/carreaux_couverture.geojson` avec attributs
`population`, `couverture_min` (5 / 10 / 15 / non couvert).

### 3.4 Statistiques agrégées

Tableau récapitulatif global (`outputs/stats.json`) :
- Population totale
- Population à ≤ 5 min, ≤ 10 min, ≤ 15 min
- Pourcentages associés
- Statistiques par commune (jointure ADMIN-EXPRESS)

---

## 4. Limites assumées

À mentionner explicitement dans la page portfolio et le README :

1. **Analyse statique** : aucune prise en compte des fréquences de
   passage. Un arrêt desservi 1 fois par jour compte autant qu'un
   arrêt à 5 min de fréquence. Mention "à enrichir en v2".

2. **Mode piéton uniquement** : pas de modélisation du temps d'attente
   à l'arrêt, pas de calcul de trajet bus jusqu'à destination.

3. **Accessibilité PMR non modélisée** : la voirie OSM n'est pas filtrée
   sur la praticabilité (escaliers, trottoirs étroits, dénivelés).

4. **Vitesse piétonne uniforme** : 4,5 km/h pour tout le monde, ce qui
   sur-représente les actifs valides.

5. **Centroïde de carreau** : un carreau est "couvert" ou "non couvert"
   en bloc, alors qu'en pratique seulement une partie de sa surface peut
   être dans l'isochrone.

Ces limites sont des choix volontaires pour que le projet reste réalisable
en charge raisonnable. Elles seront formalisées dans la page projet du
portfolio comme **point fort méthodologique** ("voici ce que mon analyse
fait, voici ce qu'elle ne fait pas") plutôt que comme défaut.

---

## 5. Livrables techniques

À produire dans `outputs/` :

- `isochrones_05.geojson` — union des isochrones piétonnes 5 min
- `isochrones_10.geojson` — idem 10 min
- `isochrones_15.geojson` — idem 15 min
- `carreaux_couverture.geojson` — carroyage INSEE enrichi
- `arrets_stan.geojson` — points avec attributs (nom, mode, ligne)
- `stats.json` — agrégats globaux et par commune
- `stats_communes.geojson` — communes avec taux de couverture
- `metadata.json` — date d'extraction GTFS, version OSM, hash des
  données sources (pour traçabilité / reproductibilité)

Tuiles vectorielles (optionnel, si le poids GeoJSON dépasse 5 Mo) :
- Génération via `tippecanoe` à partir des GeoJSON
- Format `.pmtiles` pour servir en statique sur Vercel sans backend

---

## 6. Livrables web (intégration portfolio)

Page projet `/projets/accessibilite-stan` du portfolio Next.js,
gabarit déjà en place. À compléter :

### 6.1 Carte interactive (livrable principal)

Composant client `<AccessibiliteStanMap />` :
- MapLibre GL JS, fond OSM ou Maptiler
- 3 couches : arrêts (points), isochrones par seuil (toggle), carreaux
  (choroplèthe)
- Sélecteur 5 / 10 / 15 min en barre supérieure
- Légende avec part de population couverte
- Clic sur arrêt → popup avec nom + lignes desservies
- Clic sur carreau → popup avec population + niveau de couverture

### 6.2 Statistiques en bandeau

Trois chiffres en gros, lisibles sans interaction :
- X % de la population à ≤ 5 min
- Y % à ≤ 10 min
- Z % à ≤ 15 min

(Source : `stats.json`, importé statiquement au build du portfolio.)

### 6.3 Lien vers le code

Bouton "Code source →" pointant vers le repo GitHub
`github.com/simonpct/accessibilite-stan`.

---

## 7. Stack

### Python (repo `accessibilite-stan`)

```
python = "^3.11"
r5py = "^0.x"          # routage isochrones
geopandas = "^1.0"     # manipulation vectorielle
rasterio = "^1.3"      # lecture raster (carroyage INSEE)
gtfs-kit = "^9.0"      # parsing GTFS
shapely = "^2.0"       # géométries
pyogrio = "^0.7"       # IO vectoriel rapide
duckdb = "^1.0"        # agrégations attributaires
matplotlib = "^3.8"    # cartes statiques pour debug
jupyter = "^1.0"       # notebooks d'exploration
```

Outils CLI externes :
- `osmium-tool` (découpage OSM PBF)
- `tippecanoe` (génération tuiles vectorielles, optionnel)

Gestionnaire d'environnement : **`uv`** (rapide, lock-file moderne).

### Web (intégré au portfolio existant)

```
maplibre-gl = "^4.x"   # déjà à ajouter au portfolio
pmtiles = "^3.x"       # si tuiles vectorielles
```

---

## 8. Structure du repo

```
accessibilite-stan/
├── README.md                # Reprend ce document, version courte
├── LICENSE                  # MIT
├── pyproject.toml
├── uv.lock
├── .gitignore               # exclut data/raw, data/processed, outputs lourds
├── data/
│   ├── download.py          # script téléchargement sources
│   ├── raw/                 # ignoré par git
│   └── processed/           # ignoré par git
├── notebooks/
│   ├── 01-exploration-gtfs.ipynb
│   ├── 02-isochrones-test.ipynb
│   └── 03-validation.ipynb
├── src/
│   └── accessibilite_stan/
│       ├── __init__.py
│       ├── data.py          # chargement / nettoyage
│       ├── isochrones.py    # calcul r5py
│       ├── aggregation.py   # carroyage INSEE
│       └── stats.py         # agrégats
├── scripts/
│   ├── 01_download.py
│   ├── 02_isochrones.py
│   └── 03_aggregate.py
├── outputs/                 # versionné si < 5 Mo, sinon S3 / Releases GitHub
│   ├── isochrones_*.geojson
│   ├── carreaux_couverture.geojson
│   └── stats.json
└── tests/
    └── test_aggregation.py
```

---

## 9. Charge estimée

| Étape | Heures |
|---|---|
| Setup repo, structure, dépendances | 2 |
| Script de téléchargement données | 2 |
| Préparation OSM (osmium) + GTFS | 2 |
| Premier calcul isochrones r5py (1 arrêt test) | 3 |
| Boucle complète sur tous les arrêts + union | 3 |
| Agrégation carroyage INSEE | 3 |
| Statistiques + métadonnées | 2 |
| Génération tuiles vectorielles (si nécessaire) | 2 |
| Composant MapLibre dans portfolio | 4 |
| Tests, validation, README | 2 |
| **Total** | **~25 h** |

Soit 2 weekends à temps plein, ou 3-4 weekends en répartissant.

---

## 10. Étapes de réalisation

Ordre recommandé, avec points de validation :

### Phase 1 — Setup & données (5 h)

- [ ] Créer le repo GitHub `accessibilite-stan` (public)
- [ ] Initialiser avec `uv init`, `pyproject.toml`, `.gitignore`
- [ ] Écrire `data/download.py` qui télécharge les 4 sources
- [ ] Notebook `01-exploration-gtfs.ipynb` : parser le GTFS STAN, vérifier les arrêts dans le périmètre
- [ ] **Validation** : nombre d'arrêts cohérent (~700 attendus), bbox OK

### Phase 2 — Isochrones (6 h)

- [ ] Notebook `02-isochrones-test.ipynb` : calcul r5py sur 1 arrêt
- [ ] Vérifier visuellement la forme de l'isochrone (matplotlib + fond OSM)
- [ ] Script `scripts/02_isochrones.py` : boucle sur tous les arrêts
- [ ] Union spatiale par seuil
- [ ] **Validation** : 3 GeoJSON cohérents, taille raisonnable, visuel attendu

### Phase 3 — Agrégation INSEE (5 h)

- [ ] Charger le carroyage 200 m, filtrer sur le Grand Nancy
- [ ] Jointure spatiale isochrone × carreau (centroïde)
- [ ] Calcul `couverture_min` par carreau
- [ ] Stats globales et par commune
- [ ] **Validation** : chiffres globaux plausibles (>50 % à 10 min en zone urbaine dense, attendu)

### Phase 4 — Publication tuiles (2 h, optionnel)

- [ ] Si GeoJSON > 5 Mo : génération `.pmtiles` via tippecanoe
- [ ] Sinon : copie directe vers `portfolio/public/data/stan/`

### Phase 5 — Page portfolio (4 h)

- [ ] Ajouter `maplibre-gl` au portfolio
- [ ] Composant `<AccessibiliteStanMap />` côté client
- [ ] Bandeau de stats au-dessus de la carte
- [ ] Lien GitHub
- [ ] Mise à jour des `sections` de `lib/projects.ts` pour refléter le réel

### Phase 6 — Finalisation (3 h)

- [ ] README du repo soigné, captures
- [ ] Tests unitaires sur les fonctions critiques (`aggregation`, `stats`)
- [ ] Vérification reproductibilité (clone propre, exécution complète)
- [ ] Commit final, tag `v1.0`

---

## 11. Points d'attention

### Reproductibilité

Le repo doit pouvoir tourner depuis zéro avec :

```bash
git clone …
cd accessibilite-stan
uv sync
uv run scripts/01_download.py
uv run scripts/02_isochrones.py
uv run scripts/03_aggregate.py
```

Toute donnée intermédiaire doit être régénérable. Les datasets bruts ne
sont jamais commités.

### Versions des données

GTFS STAN évolue (changements horaires saisonniers). Stocker dans
`metadata.json` :
- Date d'extraction
- Hash SHA-256 du fichier ZIP source
- Version d'OSM utilisée

Permet de re-faire tourner exactement la même analyse plus tard.

### Performance r5py

R5 charge OSM + GTFS en mémoire (peut consommer 2-4 Go selon le
périmètre). Si problème : restreindre encore le PBF OSM aux tags
piétonniers utiles.

### Crédibilité du chiffre

Le chiffre final ("X % couverts à 10 min") sera **scruté**. Un recruteur
géomaticien vérifiera :
- La méthode de calcul (réseau vs euclidien)
- La source de population
- La validité spatiale (carroyage centroïde, vrai partiel ?)

→ Documenter chaque choix dans le README, **assumer les limites**, ne pas
gonfler le chiffre.
