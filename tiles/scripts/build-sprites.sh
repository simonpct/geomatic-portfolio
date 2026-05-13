#!/usr/bin/env bash
# Régénère la sprite sheet MapLibre depuis les SVG sources.
# Format de sortie : sprite.png (1×, 384×64) et sprite@2x.png (2×, 768×128)
# 6 icônes côte à côte, chacune dans un canvas 64×64 (ou 128×128 en 2×)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPRITES_DIR="$(cd "$SCRIPT_DIR/../../public/sprites" && pwd)"

cd "$SPRITES_DIR"

# Zebra (pas de SVG, dessiné directement)
magick -size 64x64 xc:none -fill white -draw "rectangle 0,0 32,64" zebra-1x.png
magick -size 128x128 xc:none -fill white -draw "rectangle 0,0 64,128" zebra-2x.png

# Chevron double : SVG portrait (18×24)
magick -background none -density 300 chevron-double.svg -resize 48x64 -gravity center -extent 64x64 chevron-1x.png
magick -background none -density 600 chevron-double.svg -resize 96x128 -gravity center -extent 128x128 chevron-2x.png

# Bicycle : SVG quasi-carré (54×55)
magick -background none -density 300 bicycle.svg -resize 64x64 -gravity center -extent 64x64 bicycle-1x.png
magick -background none -density 600 bicycle.svg -resize 128x128 -gravity center -extent 128x128 bicycle-2x.png

# Arrows : SVG en portrait, on force la couleur blanche (les SVG sources utilisent #D9D9D9)
for arr in arrow-through arrow-left arrow-right; do
  magick -background none -density 300 "$arr.svg" -resize x60 -gravity center -extent 64x64 -fill white -opaque "#D9D9D9" "$arr-1x.png"
  magick -background none -density 600 "$arr.svg" -resize x120 -gravity center -extent 128x128 -fill white -opaque "#D9D9D9" "$arr-2x.png"
done

# Assemblage côte à côte : zebra | chevron | bicycle | arrow-through | arrow-left | arrow-right
magick zebra-1x.png chevron-1x.png bicycle-1x.png arrow-through-1x.png arrow-left-1x.png arrow-right-1x.png +append sprite.png
magick zebra-2x.png chevron-2x.png bicycle-2x.png arrow-through-2x.png arrow-left-2x.png arrow-right-2x.png +append sprite@2x.png

# Cleanup des intermédiaires
rm -f zebra-1x.png zebra-2x.png \
      chevron-1x.png chevron-2x.png \
      bicycle-1x.png bicycle-2x.png \
      arrow-through-1x.png arrow-through-2x.png \
      arrow-left-1x.png arrow-left-2x.png \
      arrow-right-1x.png arrow-right-2x.png

echo "✓ Sprites rebuilt: $SPRITES_DIR/sprite.png"
echo "  $(sips -g pixelWidth -g pixelHeight sprite.png | tail -2 | tr -s ' ')"
echo "  $(sips -g pixelWidth -g pixelHeight sprite@2x.png | tail -2 | tr -s ' ')"
