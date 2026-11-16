#!/usr/bin/env bash
# Open the web dashboard through a private SSM tunnel (nothing is exposed to the internet).
# Needs the Session Manager plugin: brew install --cask session-manager-plugin
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

LOCAL_PORT="${1:-8080}"
ID="$(instance_id)"
[ -n "$ID" ] || { echo "Server is off. Run scripts/up.sh first."; exit 1; }

echo "Dashboard: http://localhost:$LOCAL_PORT   (Ctrl+C to close)"
aws ssm start-session --target "$ID" \
  --document-name AWS-StartPortForwardingSession \
  --parameters "portNumber=80,localPortNumber=$LOCAL_PORT"
