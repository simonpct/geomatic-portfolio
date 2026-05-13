"""
Transforme les ways road_marking=arrow (LineString 2 points) en points avec
direction calculée depuis l'angle du way.

Les ways arrow sont tracés de la queue vers la pointe de la flèche : le 1er
node est l'origine, le 2e node est la direction pointée. On calcule l'angle
via atan2 et on génère un point au centre avec :
  - direction : angle en degrés depuis le nord (sens horaire, convention OSM)
  - arrow_type : through, left, right (depuis le tag arrow=*)

Usage :
    uv run --project tiles tiles/scripts/generate_arrows.py \\
      <input.geojsonseq> <output.geojsonseq>
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import geopandas as gpd
from shapely.geometry import LineString, Point, mapping


def angle_from_north(start: tuple[float, float], end: tuple[float, float]) -> float:
    """Calcule l'angle en degrés depuis le nord (sens horaire, convention OSM).

    start, end : coordonnées en EPSG:2154 (mètres).
    """
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    # atan2 retourne l'angle depuis l'axe X est, sens trigonométrique
    angle_math = math.degrees(math.atan2(dy, dx))
    # On convertit : sens horaire + référence nord
    angle_north_cw = (90.0 - angle_math) % 360.0
    return angle_north_cw


def main(input_path: Path, output_path: Path) -> None:
    features = []
    with input_path.open() as f:
        for line in f:
            line = line.strip()
            if not line or line == "\x1e":
                continue
            if line.startswith("\x1e"):
                line = line[1:]
            try:
                feat = json.loads(line)
                features.append(feat)
            except json.JSONDecodeError:
                continue

    # Filtre : seulement les LineString road_marking=arrow
    arrows = [
        f for f in features
        if f.get("properties", {}).get("road_marking") == "arrow"
        and f.get("geometry", {}).get("type") == "LineString"
    ]
    print(f"  {len(arrows)} ways road_marking=arrow trouvés", file=sys.stderr)

    if not arrows:
        output_path.write_text("")
        return

    # Reprojection en EPSG:2154 pour calculer les angles en mètres
    gdf = gpd.GeoDataFrame.from_features(arrows, crs="EPSG:4326")
    gdf_proj = gdf.to_crs("EPSG:2154")

    out_features: list[dict] = []
    skipped = 0
    for idx, row in gdf_proj.iterrows():
        geom = row.geometry
        if not isinstance(geom, LineString) or geom.is_empty:
            skipped += 1
            continue
        coords = list(geom.coords)
        if len(coords) < 2:
            skipped += 1
            continue

        # Direction : du 1er au dernier point
        start = coords[0]
        end = coords[-1]
        direction = angle_from_north(start, end)

        # Position : milieu du way
        mid_x = (start[0] + end[0]) / 2
        mid_y = (start[1] + end[1]) / 2

        # Type de flèche : depuis le tag arrow=*, fallback "through"
        arrow_type = row.get("arrow") or "through"

        out_features.append({
            "geometry": Point(mid_x, mid_y),
            "properties": {
                "arrow_type": arrow_type,
                "direction": round(direction, 1),
                "source": "generated",
            },
        })

    print(f"  {len(out_features)} flèches générées", file=sys.stderr)
    if skipped:
        print(f"  {skipped} features ignorées (géométrie invalide)", file=sys.stderr)

    if not out_features:
        output_path.write_text("")
        return

    out_gdf = gpd.GeoDataFrame(
        [{"geometry": f["geometry"], **f["properties"]} for f in out_features],
        crs="EPSG:2154",
    ).to_crs("EPSG:4326")

    with output_path.open("w") as f:
        for _, row in out_gdf.iterrows():
            feat = {
                "type": "Feature",
                "geometry": mapping(row.geometry),
                "properties": {
                    k: v for k, v in row.items() if k != "geometry"
                },
            }
            f.write(json.dumps(feat, default=str) + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: generate_arrows.py <input.geojsonseq> <output.geojsonseq>", file=sys.stderr)
        sys.exit(1)
    main(Path(sys.argv[1]), Path(sys.argv[2]))
