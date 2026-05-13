#!/usr/bin/env bash
# Génère les tuiles vectorielles .pmtiles depuis le PBF
# Couches thématiques séparées pour le rendu MapLibre
# Usage : tiles/scripts/02-build-tiles.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/../data" && pwd)"
OUTPUT_DIR="$(cd "$SCRIPT_DIR/../output" && pwd)"
TMP_DIR="$(mktemp -d)"
trap "rm -rf $TMP_DIR" EXIT

PBF="$DATA_DIR/carrefour-foch.osm.pbf"
if [ ! -f "$PBF" ]; then
  echo "Erreur : $PBF n'existe pas. Lance d'abord 01-download.sh"
  exit 1
fi

echo "[1/4] Extraction des couches thématiques…"

# Couche 1 : surfaces de voirie (area:highway=*)
osmium tags-filter "$PBF" 'w/area:highway' -o "$TMP_DIR/area-highway.osm.pbf" --overwrite 2>/dev/null

# Couche 2 : marquages au sol (road_marking=*) — ways et nodes
osmium tags-filter "$PBF" 'nwr/road_marking' -o "$TMP_DIR/road-marking.osm.pbf" --overwrite 2>/dev/null

# Couche 3 : voirie classique (highway=* lignes) pour contexte
osmium tags-filter "$PBF" 'w/highway' -o "$TMP_DIR/highway.osm.pbf" --overwrite 2>/dev/null

# Couche 4 : passages piétons et infrastructures de croisement
osmium tags-filter "$PBF" 'nwr/highway=crossing,traffic_signals,stop,give_way nwr/crossing' -o "$TMP_DIR/crossings.osm.pbf" --overwrite 2>/dev/null

# Couche 5 : bâti pour contexte
osmium tags-filter "$PBF" 'w/building' -o "$TMP_DIR/buildings.osm.pbf" --overwrite 2>/dev/null

# Couche 6 : espaces verts et land use
osmium tags-filter "$PBF" \
  'wr/landuse=grass,forest,meadow,recreation_ground' \
  'wr/leisure=park,garden,pitch,playground' \
  'wr/natural=grass,wood,scrub' \
  -o "$TMP_DIR/landuse.osm.pbf" --overwrite 2>/dev/null

# Couche 7 : éléments urbains au sol (manholes, bollards, arbres, etc.)
osmium tags-filter "$PBF" \
  'n/man_made=manhole' \
  'n/barrier=bollard' \
  'n/natural=tree' \
  -o "$TMP_DIR/street-features.osm.pbf" --overwrite 2>/dev/null

echo "[2/5] Conversion en GeoJSON…"

# osmium export en GeoJSONSeq, puis tippecanoe gère
for layer in area-highway road-marking highway crossings buildings landuse street-features; do
  osmium export -f geojsonseq "$TMP_DIR/${layer}.osm.pbf" -o "$TMP_DIR/${layer}.geojsonseq" --overwrite 2>/dev/null
  COUNT=$(wc -l < "$TMP_DIR/${layer}.geojsonseq" | tr -d ' ')
  echo "    $layer : $COUNT features"
done

echo "[3/5] Génération des bandes zebra pour passages piétons (PCA + intersect)…"
uv run --project "$SCRIPT_DIR/.." \
  "$SCRIPT_DIR/generate_zebra_stripes.py" \
  "$TMP_DIR/area-highway.geojsonseq" \
  "$TMP_DIR/crossing-stripes.geojsonseq" \
  "$TMP_DIR/crossing-axes.geojsonseq" 2>&1 | sed 's/^/    /'
STRIPES_COUNT=$(wc -l < "$TMP_DIR/crossing-stripes.geojsonseq" | tr -d ' ')
AXES_COUNT=$(wc -l < "$TMP_DIR/crossing-axes.geojsonseq" 2>/dev/null | tr -d ' ' || echo 0)
echo "    crossing-stripes : $STRIPES_COUNT features"
echo "    crossing-axes (debug) : $AXES_COUNT features"

echo "    Conversion des ways arrow → points orientés…"
uv run --project "$SCRIPT_DIR/.." \
  "$SCRIPT_DIR/generate_arrows.py" \
  "$TMP_DIR/road-marking.geojsonseq" \
  "$TMP_DIR/arrows.geojsonseq" 2>&1 | sed 's/^/    /'
ARROWS_COUNT=$(wc -l < "$TMP_DIR/arrows.geojsonseq" | tr -d ' ')
echo "    arrows : $ARROWS_COUNT features"

echo "[4/5] Génération des tuiles vectorielles via tippecanoe…"

tippecanoe \
  --output="$OUTPUT_DIR/carrefour-foch.pmtiles" \
  --force \
  --name="Micromapping Nancy" \
  --description="Carrefour Foch / Saint-Léon / Kennedy / Commanderie — Nancy" \
  --attribution='© OpenStreetMap contributors · BD ORTHO IGN' \
  -Z14 -z18 \
  --no-feature-limit \
  --no-tile-size-limit \
  --no-simplification-of-shared-nodes \
  --no-tiny-polygon-reduction \
  --no-line-simplification \
  -r1 \
  -pS \
  --preserve-input-order \
  --named-layer=area_highway:"$TMP_DIR/area-highway.geojsonseq" \
  --named-layer=road_marking:"$TMP_DIR/road-marking.geojsonseq" \
  --named-layer=highway:"$TMP_DIR/highway.geojsonseq" \
  --named-layer=crossings:"$TMP_DIR/crossings.geojsonseq" \
  --named-layer=buildings:"$TMP_DIR/buildings.geojsonseq" \
  --named-layer=landuse:"$TMP_DIR/landuse.geojsonseq" \
  --named-layer=street_features:"$TMP_DIR/street-features.geojsonseq" \
  --named-layer=crossing_stripes:"$TMP_DIR/crossing-stripes.geojsonseq" \
  --named-layer=crossing_axes:"$TMP_DIR/crossing-axes.geojsonseq" \
  --named-layer=arrows:"$TMP_DIR/arrows.geojsonseq" \
  2>&1 | tail -3

echo ""
echo "[5/5] Vérification…"
ls -la "$OUTPUT_DIR/"
echo ""
pmtiles show "$OUTPUT_DIR/carrefour-foch.pmtiles" 2>&1 | head -20
