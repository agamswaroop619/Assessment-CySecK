#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
CLIENT_DIR="$ROOT_DIR/client"

if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$CLIENT_DIR" ]; then
  echo "backend or client folder not found"
  exit 1
fi

# Install deps only when missing
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "install backend deps..."
  (cd "$BACKEND_DIR" && npm install)
fi

if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo "install client deps..."
  (cd "$CLIENT_DIR" && npm install)
fi

cleanup() {
  if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$CLIENT_PID" ] && kill -0 "$CLIENT_PID" 2>/dev/null; then
    kill "$CLIENT_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

# Start backend and frontend together
echo "start backend on 7250..."
(cd "$BACKEND_DIR" && node server.js) &
BACKEND_PID=$!

echo "start client on 7150..."
(cd "$CLIENT_DIR" && npm run dev) &
CLIENT_PID=$!

wait "$BACKEND_PID" "$CLIENT_PID"
