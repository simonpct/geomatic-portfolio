"""
Génère des bandes zebra pour chaque polygone area:highway=crossing.

Pour chaque passage piéton, on calcule son axe principal (PCA), on génère des
bandes parallèles régulières à cet axe, puis on les intersecte avec le
polygone original. Le résultat est exporté en GeoJSONSeq pour tippecanoe.

Usage :
    uv run --project tiles tiles/scripts/generate_zebra_stripes.py \\
      <input.geojsonseq> <output.geojsonseq>
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import geopandas as gpd
from shapely.affinity import rotate
from shapely.geometry import LineString, Polygon, box, mapping

# Bandes blanches, plus fines et plus espacées que la norme stricte pour
# un rendu cartographique plus aéré
STRIPE_WIDTH_M = 0.4
STRIPE_INTERVAL_M = 1.1


def principal_axis(poly: Polygon) -> tuple[float, float, float]:
    """Retourne (angle_deg, longueur_axe, largeur_axe) du polygone via MRR.

    Utilise le Minimum Rotated Rectangle (rectangle englobant minimum, autorisé
    à être tourné). L'axe long du MRR donne l'orientation principale.

    L'angle est mesuré depuis l'axe X (est) dans le sens trigonométrique.
    """
    mrr = poly.minimum_rotated_rectangle
    coords = list(mrr.exterior.coords)[:4]

    edges = []
    for i in range(4):
        x1, y1 = coords[i]
        x2, y2 = coords[(i + 1) % 4]
        dx, dy = x2 - x1, y2 - y1
        length = math.hypot(dx, dy)
        edges.append((length, dx, dy))

    edges.sort(reverse=True)
    long_length, long_dx, long_dy = edges[0]
    short_length, _, _ = edges[2]

    angle_deg = float(math.degrees(math.atan2(long_dy, long_dx)))
    return angle_deg, float(long_length), float(short_length)


def generate_stripes_for(poly: Polygon) -> list[Polygon]:
    """Génère les bandes zebra pour un polygone donné (en CRS projeté, mètres)."""
    angle, length, width = principal_axis(poly)

    # On tourne le polygone pour aligner son axe long avec l'axe X (horizontal)
    # → on peut alors générer les bandes comme rectangles axis-aligned
    centroid = poly.centroid
    cx, cy = centroid.x, centroid.y

    # Rotation inverse pour aligner l'axe principal sur X
    aligned = rotate(poly, -angle, origin=centroid, use_radians=False)

    # Bbox du polygone aligné, étendue d'un peu pour éviter les bords coupés
    minx, miny, maxx, maxy = aligned.bounds
    pad = STRIPE_WIDTH_M
    minx -= pad
    maxx += pad

    # On génère des bandes le long de l'axe X (donc dans la largeur, perpendiculaire
    # à l'axe principal — c'est bien comme ça que les zebras sont peints).
    stripes_aligned: list[Polygon] = []
    n_stripes = int((maxx - minx) / STRIPE_INTERVAL_M) + 2
    # On centre les bandes sur le polygone
    total_span = n_stripes * STRIPE_INTERVAL_M
    start_x = (minx + maxx) / 2 - total_span / 2

    for i in range(n_stripes):
        x = start_x + i * STRIPE_INTERVAL_M
        stripe = box(x, miny - 1, x + STRIPE_WIDTH_M, maxy + 1)
        clipped = stripe.intersection(aligned)
        if clipped.is_empty:
            continue
        # Si l'intersection produit un MultiPolygon, on garde les parts
        if clipped.geom_type == "Polygon":
            stripes_aligned.append(clipped)
        elif clipped.geom_type == "MultiPolygon":
            stripes_aligned.extend(list(clipped.geoms))
        # On ignore les autres types (lignes, points en bord)

    # On re-tourne les bandes dans l'orientation d'origine
    stripes = [rotate(s, angle, origin=centroid, use_radians=False) for s in stripes_aligned]
    return stripes


def generate_axis_line(poly: Polygon) -> LineString:
    """Retourne la médiane du polygone (mode debug).

    Calcule le MRR du polygone, identifie les deux côtés les plus courts, et
    trace une ligne reliant leur milieu.
    """
    mrr = poly.minimum_rotated_rectangle
    coords = list(mrr.exterior.coords)[:4]

    edges = []
    for i in range(4):
        x1, y1 = coords[i]
        x2, y2 = coords[(i + 1) % 4]
        length = math.hypot(x2 - x1, y2 - y1)
        mid = ((x1 + x2) / 2, (y1 + y2) / 2)
        edges.append((length, mid))

    edges.sort(key=lambda e: e[0])
    return LineString([edges[0][1], edges[1][1]])


def generate_oriented_bbox(poly: Polygon) -> LineString:
    """Retourne le MRR du polygone comme LineString fermé (debug)."""
    mrr = poly.minimum_rotated_rectangle
    return LineString(list(mrr.exterior.coords))


def main(input_path: Path, output_path: Path, debug_axes_path: Path | None = None) -> None:
    # Lecture du GeoJSONSeq exporté par osmium
    features = []
    with input_path.open() as f:
        for line in f:
            line = line.strip()
            if not line or line == "\x1e":  # GeoJSONSeq utilise RS comme séparateur
                continue
            # Certaines lignes commencent par RS (0x1e), on l'enlève
            if line.startswith("\x1e"):
                line = line[1:]
            try:
                feat = json.loads(line)
                features.append(feat)
            except json.JSONDecodeError:
                continue

    # Filtrer seulement les area:highway=crossing
    crossings = [
        f for f in features
        if f.get("properties", {}).get("area:highway") == "crossing"
    ]

    print(f"  {len(crossings)} polygones area:highway=crossing trouvés", file=sys.stderr)

    if not crossings:
        # Fichier de sortie vide (mais existant pour tippecanoe)
        output_path.write_text("")
        return

    # Reprojection en EPSG:2154 (Lambert-93) pour travailler en mètres
    gdf = gpd.GeoDataFrame.from_features(crossings, crs="EPSG:4326")
    gdf_proj = gdf.to_crs("EPSG:2154")

    # Génération des bandes (et optionnellement des axes en mode debug)
    all_stripes: list[dict] = []
    all_axes: list[dict] = []
    skipped_non_polygon = 0
    for idx, row in gdf_proj.iterrows():
        geom = row.geometry
        if geom is None or geom.is_empty:
            continue
        if geom.geom_type == "Polygon":
            polys = [geom]
        elif geom.geom_type == "MultiPolygon":
            polys = list(geom.geoms)
        else:
            skipped_non_polygon += 1
            continue
        for poly in polys:
            # Axe debug + bounding box orientée
            if debug_axes_path is not None:
                axis = generate_axis_line(poly)
                all_axes.append({
                    "type": "Feature",
                    "geometry": mapping(axis),
                    "properties": {
                        "kind": "axis",
                        "from_osm_id": row.get("@id", idx),
                    },
                })
                obbox = generate_oriented_bbox(poly)
                all_axes.append({
                    "type": "Feature",
                    "geometry": mapping(obbox),
                    "properties": {
                        "kind": "bbox",
                        "from_osm_id": row.get("@id", idx),
                    },
                })
            # Bandes zebra
            stripes = generate_stripes_for(poly)
            for stripe in stripes:
                all_stripes.append({
                    "type": "Feature",
                    "geometry": mapping(stripe),
                    "properties": {
                        "source": "generated",
                        "from_osm_id": row.get("@id", idx),
                    },
                })

    print(f"  {len(all_stripes)} bandes générées", file=sys.stderr)
    if skipped_non_polygon:
        print(f"  {skipped_non_polygon} features non-polygones ignorées (LineString)", file=sys.stderr)

    # Reprojection en EPSG:4326 pour tippecanoe — bandes
    if all_stripes:
        stripes_gdf = gpd.GeoDataFrame.from_features(all_stripes, crs="EPSG:2154")
        stripes_gdf = stripes_gdf.to_crs("EPSG:4326")
        with output_path.open("w") as f:
            for _, row in stripes_gdf.iterrows():
                feature = {
                    "type": "Feature",
                    "geometry": mapping(row.geometry),
                    "properties": {
                        k: v for k, v in row.items() if k != "geometry"
                    },
                }
                f.write(json.dumps(feature, default=str) + "\n")
    else:
        output_path.write_text("")

    # Reprojection en EPSG:4326 — axes debug
    if debug_axes_path is not None:
        if all_axes:
            axes_gdf = gpd.GeoDataFrame.from_features(all_axes, crs="EPSG:2154")
            axes_gdf = axes_gdf.to_crs("EPSG:4326")
            with debug_axes_path.open("w") as f:
                for _, row in axes_gdf.iterrows():
                    feature = {
                        "type": "Feature",
                        "geometry": mapping(row.geometry),
                        "properties": {
                            k: v for k, v in row.items() if k != "geometry"
                        },
                    }
                    f.write(json.dumps(feature, default=str) + "\n")
            print(f"  {len(all_axes)} axes debug exportés", file=sys.stderr)
        else:
            debug_axes_path.write_text("")


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        print(
            "Usage: generate_zebra_stripes.py <input.geojsonseq> <output.geojsonseq> [debug-axes.geojsonseq]",
            file=sys.stderr,
        )
        sys.exit(1)
    debug = Path(sys.argv[3]) if len(sys.argv) == 4 else None
    main(Path(sys.argv[1]), Path(sys.argv[2]), debug)
