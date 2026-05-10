#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/server"
CLIENT_DIR="$ROOT_DIR/client"

if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$CLIENT_DIR" ]; then
  echo "server or client folder not found"
  exit 1
fi

# Install deps only when missing
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "install server deps..."
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
echo "start server on 7250..."
(cd "$BACKEND_DIR" && node server.js) &
BACKEND_PID=$!

if node -e 'const [maj,min]=process.versions.node.split(".").map(Number); process.exit((maj>20 || (maj===20 && min>=19)) ? 0 : 1)'; then
  echo "start client on 7150 with local node $(node -v)..."
  (cd "$CLIENT_DIR" && npm run dev) &
else
  echo "local node $(node -v) is older than vite requirement. starting client with node 20.19 via npx..."
  (cd "$CLIENT_DIR" && npx -y node@20.19.0 ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 7150) &
fi
CLIENT_PID=$!

wait "$BACKEND_PID" "$CLIENT_PID"
