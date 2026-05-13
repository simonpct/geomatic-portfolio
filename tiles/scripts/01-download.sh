#!/usr/bin/env bash
# Télécharge un extrait PBF du carrefour via slice.openstreetmap.us
# Usage : tiles/scripts/01-download.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$(cd "$SCRIPT_DIR/../data" && pwd)"

SLICE_API="https://slice.openstreetmap.us/api/extracts/"

# Bbox du carrefour Foch / Saint-Léon / Kennedy / Commanderie — Nancy
read -r -d '' BODY <<'JSON' || true
{
  "Name": "carrefour-foch-nancy",
  "RegionType": "geojson",
  "RegionData": {
    "type": "Polygon",
    "coordinates": [[
      [6.1705, 48.6872],
      [6.1745, 48.6872],
      [6.1745, 48.6898],
      [6.1705, 48.6898],
      [6.1705, 48.6872]
    ]]
  }
}
JSON

echo "[1/2] Création du job d'extraction…"
JOB_ID=$(curl -sS -X POST "$SLICE_API" \
  -H "Content-Type: application/json" \
  --data "$BODY")

if [ -z "$JOB_ID" ]; then
  echo "Erreur : pas de job ID retourné"
  exit 1
fi
echo "    Job ID : $JOB_ID"

# Le PBF est servi quasi-immédiatement à /files/{id}.osm.pbf
# On attend juste qu'il soit dispo (réponse 200 sur HEAD).
echo "[2/2] Téléchargement du PBF…"
PBF_URL="https://slice.openstreetmap.us/files/${JOB_ID}.osm.pbf"

for i in {1..30}; do
  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -I "$PBF_URL")
  if [ "$HTTP_CODE" = "200" ]; then
    break
  fi
  sleep 1
done

curl -sS -L "$PBF_URL" -o "$DATA_DIR/carrefour-foch.osm.pbf"

# Vérification : c'est bien un PBF, pas un HTML d'erreur
if ! file "$DATA_DIR/carrefour-foch.osm.pbf" | grep -q "OpenStreetMap"; then
  echo "✗ Le fichier téléchargé n'est pas un PBF valide. Probablement une erreur côté slice."
  echo "  Contenu reçu :"
  head -c 200 "$DATA_DIR/carrefour-foch.osm.pbf"
  echo ""
  rm "$DATA_DIR/carrefour-foch.osm.pbf"
  exit 1
fi

SIZE=$(stat -f%z "$DATA_DIR/carrefour-foch.osm.pbf" 2>/dev/null || stat -c%s "$DATA_DIR/carrefour-foch.osm.pbf")
echo "✓ PBF téléchargé : $DATA_DIR/carrefour-foch.osm.pbf ($SIZE octets)"

# Stats rapides
echo ""
echo "--- Contenu ---"
osmium fileinfo --extended "$DATA_DIR/carrefour-foch.osm.pbf" 2>&1 | grep -E "Number of (nodes|ways|relations)" | head -3
echo ""
echo "--- area:highway ---"
osmium tags-filter "$DATA_DIR/carrefour-foch.osm.pbf" 'w/area:highway' -o /tmp/_check.osm.pbf --overwrite 2>/dev/null
osmium fileinfo --extended /tmp/_check.osm.pbf 2>&1 | grep "Number of ways"
echo ""
echo "--- road_marking ---"
osmium tags-filter "$DATA_DIR/carrefour-foch.osm.pbf" 'nwr/road_marking' -o /tmp/_check.osm.pbf --overwrite 2>/dev/null
osmium fileinfo --extended /tmp/_check.osm.pbf 2>&1 | grep -E "Number of (ways|nodes)"
rm -f /tmp/_check.osm.pbf
