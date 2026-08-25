#!/usr/bin/env bash
# Odświeża podglądówkę przykładowego raportu na landingu.
# Uruchom po każdej podmianie public/landing/przykladowy-raport.pdf.
# Użycie: ./scripts/generate-report-preview.sh [numer_strony]   (domyślnie 2)
# Wymaga: poppler (pdftoppm) i imagemagick (magick).
set -euo pipefail

PAGE=${1:-2}

cd "$(dirname "$0")/.."

PDF=public/landing/przykladowy-raport.pdf
OUT=public/landing/przykladowy-raport-podglad.webp
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

pdftoppm -png -r 150 -f "$PAGE" -l "$PAGE" "$PDF" "$TMP/page"
magick "$TMP"/page-*.png -resize 1200x -quality 88 -define webp:method=6 "$OUT"

echo "Zapisano $OUT ($(magick identify -format '%wx%h' "$OUT"))"
