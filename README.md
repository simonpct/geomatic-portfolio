# Portfolio — Simon Picot

Portfolio personnel d'un étudiant en géomatique à Nancy, candidat en alternance L3 SIG. Le site présente trois projets qui couvrent la chaîne complète **acquisition terrain → analyse spatiale → publication web** : relevé LiDAR patrimonial, analyse d'accessibilité des transports, et micromapping OpenStreetMap rendu en tuiles vectorielles.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS 4**
- **MapLibre GL JS** + **PMTiles** pour les cartes vectorielles servies en statique
- **React Three Fiber** / **three.js** pour les visuels 3D
- **Framer Motion** pour les transitions
- Pipeline de tuiles maison : `osmium-tool` + `tippecanoe`, scripts Python (`geopandas`, `shapely`) pour la génération de sprites

## Structure du repo

```
src/             Application Next.js (App Router)
public/          Assets statiques — CV, tuiles PMTiles, sprites, modèle 3D
tiles/           Pipeline de génération des tuiles vectorielles (scripts shell + Python)
```

Les sources Typst du CV et les assets LinkedIn vivent dans des dossiers séparés à côté de ce repo, hors du portfolio web.

## Lancer en local

```bash
npm install
npm run dev
```

Le site est ouvert sur [http://localhost:3000](http://localhost:3000).

### Régénérer les tuiles (optionnel)

Le fichier PMTiles est versionné dans `public/tiles/`. Pour le reconstruire à partir d'OpenStreetMap :

```bash
npm run tiles:all    # download .pbf + build .pmtiles + sprites
```

Nécessite `osmium-tool`, `tippecanoe` et `uv` installés localement.

## Sur l'usage de l'IA générative

Ce portfolio a été construit avec l'aide d'outils d'IA générative (Claude Code principalement), de façon assumée. Je m'en sers pour accélérer le scaffolding, explorer des pistes de design, et corriger du TypeScript — mais l'architecture, les choix techniques, les pipelines de données et la rédaction des contenus restent les miens. 

## Contact

pro@simonpct.fr
