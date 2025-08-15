#!/usr/bin/env sh
# Husky Git hooks shim

if [ -z "$husky_skip_init" ]; then
  debug() {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) -" "$@"
  }

  # Search ancestor directories for package.json
  command_exists() {
    command -v "$1" >/dev/null 2>&1
  }

  # Execute husky-run if script is found
  if command_exists husky-run; then
    husky-run "$@"
  fi
fi
