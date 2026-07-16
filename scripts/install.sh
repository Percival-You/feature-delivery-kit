#!/usr/bin/env bash
set -euo pipefail

TARGET_ROOT="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KIT_CURSOR="$KIT_ROOT/cursor"

CURSOR_DIR="$TARGET_ROOT/.cursor"
mkdir -p "$CURSOR_DIR/hooks" "$CURSOR_DIR/skills" "$CURSOR_DIR/agents"

echo "FDP Install -> $CURSOR_DIR"

for skill in "$KIT_CURSOR/skills"/*; do
  name="$(basename "$skill")"
  rm -rf "$CURSOR_DIR/skills/$name"
  cp -R "$skill" "$CURSOR_DIR/skills/$name"
  echo "  skill: $name"
done

for agent in "$KIT_CURSOR/agents"/*.md; do
  [ -f "$agent" ] || continue
  cp "$agent" "$CURSOR_DIR/agents/"
  echo "  agent: $(basename "$agent")"
done

for hook in "$KIT_CURSOR/hooks"/*.mjs; do
  [ -f "$hook" ] || continue
  cp "$hook" "$CURSOR_DIR/hooks/"
  echo "  hook: $(basename "$hook")"
done

cp "$KIT_CURSOR/fdp.config.example.json" "$CURSOR_DIR/fdp.config.example.json"
if [ ! -f "$CURSOR_DIR/fdp.config.json" ]; then
  cp "$KIT_CURSOR/fdp.config.example.json" "$CURSOR_DIR/fdp.config.json"
  echo "  created fdp.config.json"
fi

if [ -f "$CURSOR_DIR/hooks.json" ]; then
  echo "  hooks.json exists — merge manually from feature-delivery-kit/cursor/hooks.json"
else
  cp "$KIT_CURSOR/hooks.json" "$CURSOR_DIR/hooks.json"
  echo "  installed hooks.json"
fi

if [ -f "$KIT_CURSOR/rules/fdp-routing.mdc" ]; then
  mkdir -p "$CURSOR_DIR/rules"
  cp "$KIT_CURSOR/rules/fdp-routing.mdc" "$CURSOR_DIR/rules/"
  echo "  rule: fdp-routing.mdc"
fi

echo ""
echo "Done. Edit .cursor/fdp.config.json and restart Cursor."
