#!/usr/bin/env bash
# Rebuild Ravender_Pratap_Singh_Operations_Resume.pdf from resume.html using headless Chrome.
# Run from Git Bash:  bash build.sh
set -euo pipefail
cd "$(dirname "$0")"

CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
[ -x "$CHROME" ] || CHROME="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

OUT="$(cygpath -w "$PWD")\\Ravender_Pratap_Singh_Operations_Resume.pdf"
SRC="file:///$(cygpath -m "$PWD")/resume.html"

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=8000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$OUT" "$SRC"

echo "Built: $OUT"
