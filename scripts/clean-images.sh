#!/usr/bin/env bash
# Applies the README photo rules: strips all metadata (GPS, camera, dates),
# shrinks to max 400px on the long edge and re-encodes as JPEG quality 80.
# Usage: scripts/clean-images.sh [file ...]   (default: every image under images/)
set -euo pipefail
cd "$(dirname "$0")/.."

MAX=400
command -v exiftool >/dev/null || { echo "exiftool missing: brew install exiftool" >&2; exit 1; }

if [ $# -eq 0 ]; then
  files=()
  while IFS= read -r f; do files+=("$f"); done < <(find images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.heic' -o -iname '*.webp' \))
  set -- "${files[@]}"
fi

for f in "$@"; do
  out="${f%.*}.jpg"
  out="$(dirname "$out")/$(basename "$out" | tr '[:upper:]_ ' '[:lower:]--')"
  if [ "$f" != "$out" ]; then
    sips -s format jpeg "$f" --out "$out" >/dev/null
    [ "$(echo "$f" | tr '[:upper:]' '[:lower:]')" != "$out" ] && rm "$f"
  fi
  w=$(sips -g pixelWidth "$out" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$out" | awk '/pixelHeight/{print $2}')
  if [ "$w" -gt "$MAX" ] || [ "$h" -gt "$MAX" ]; then
    sips -Z "$MAX" -s formatOptions 80 "$out" >/dev/null
  fi
  exiftool -q -overwrite_original -all= --icc_profile:all "$out"
  echo "cleaned $out ($(stat -f%z "$out") bytes)"
done
