#!/usr/bin/env bash
set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.local/bin"

mkdir -p "$TARGET_DIR"
cp "$REPO_DIR/lib.js" "$TARGET_DIR/lib"
chmod +x "$TARGET_DIR/lib"

if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
  echo "Added ~/.local/bin to PATH in .bashrc — run 'source ~/.bashrc' or restart your shell."
fi

echo "Installed. Try: lib add my-package 1.0.0"
