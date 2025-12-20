#!/bin/bash
# Production startup script for Minecraft Server Controller
# This script starts both the backend API server and serves the frontend

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables
if [ -f "$SCRIPT_DIR/Server/.env" ]; then
    export $(cat "$SCRIPT_DIR/Server/.env" | grep -v '^#' | xargs)
fi

# Start backend server
echo "🚀 Starting backend server..."
cd "$SCRIPT_DIR/Server"
node dist/server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server (serving built files)
echo "🌐 Starting frontend server..."
cd "$SCRIPT_DIR/Client"
npm run preview &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

