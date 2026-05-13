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

# Le PBF est servi à /files/{id}.osm.pbf une fois le job traité.
# Slice ne renvoie pas de Content-Type sur HEAD, donc on se base sur le
# Content-Length : un vrai PBF fait > 5000 octets, la SPA HTML d'erreur fait
# quelques centaines.
echo "[2/2] Téléchargement du PBF…"
PBF_URL="https://slice.openstreetmap.us/files/${JOB_ID}.osm.pbf"

PBF_READY=false
for i in {1..60}; do
  SIZE=$(curl -sS -o /dev/null -w "%{size_download}" --range "0-0" "$PBF_URL")
  CONTENT_LENGTH=$(curl -sSI "$PBF_URL" 2>/dev/null | grep -i "content-length" | tail -1 | awk '{print $2}' | tr -d '\r')

  if [ -n "$CONTENT_LENGTH" ] && [ "$CONTENT_LENGTH" -gt 5000 ]; then
    # Vérification supplémentaire : le premier octet ressemble à du PBF binaire
    # (les PBF OSM commencent par 0x00 0x00 0x00 0x?? - la taille du blob header)
    FIRST_BYTE=$(curl -sS --range "0-3" "$PBF_URL" 2>/dev/null | xxd -p | head -c 8)
    if [ "${FIRST_BYTE:0:4}" = "0000" ]; then
      PBF_READY=true
      break
    fi
  fi
  echo "    [${i}/60] En attente du PBF (taille=$CONTENT_LENGTH octets)…"
  sleep 2
done

if [ "$PBF_READY" != "true" ]; then
  echo "✗ Timeout : PBF non disponible après 2 minutes."
  exit 1
fi

curl -sS -L "$PBF_URL" -o "$DATA_DIR/carrefour-foch.osm.pbf"

# Double vérification (ceinture+bretelles)
if ! file "$DATA_DIR/carrefour-foch.osm.pbf" | grep -q "OpenStreetMap"; then
  echo "✗ Le fichier téléchargé n'est pas un PBF valide."
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
