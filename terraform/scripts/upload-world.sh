#!/usr/bin/env bash
# One-time upload of an existing world folder to the server.
#   scripts/upload-world.sh ~/path/to/world
# Needs ssh_public_key and admin_cidrs (your IP) set in terraform.tfvars, and the server on.
# The previous world on the server is kept as world.bak.
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

WORLD_DIR="${1:?Usage: upload-world.sh <path-to-world-folder>}"
[ -f "$WORLD_DIR/level.dat" ] || { echo "$WORLD_DIR does not look like a Minecraft world (no level.dat)."; exit 1; }

ID="$(instance_id)"
[ -n "$ID" ] || { echo "Server is off. Run scripts/up.sh first."; exit 1; }
IP="$(public_ip "$ID")"

echo "Uploading $(du -sh "$WORLD_DIR" | cut -f1) to $IP..."
COPYFILE_DISABLE=1 tar -czf - -C "$WORLD_DIR" . | ssh -o StrictHostKeyChecking=accept-new "ec2-user@$IP" '
  set -e
  # Unpack first: this is the only command that reads the uploaded stream
  sudo rm -rf /opt/minecraft/world-upload </dev/null && sudo mkdir /opt/minecraft/world-upload </dev/null
  sudo tar -xzf - -C /opt/minecraft/world-upload
  cd /opt/minecraft/server
  LEVEL=$(sudo grep -s "^level-name=" server.properties | cut -d= -f2)
  LEVEL=${LEVEL:-world}
  sudo systemctl stop minecraft
  sudo rm -rf "$LEVEL.bak"
  if [ -d "$LEVEL" ]; then sudo mv "$LEVEL" "$LEVEL.bak"; fi
  sudo mv /opt/minecraft/world-upload "$LEVEL"
  sudo chown -R minecraft:minecraft "$LEVEL"
  sudo systemctl start minecraft
'
echo "Done. The server is restarting with the uploaded world."
