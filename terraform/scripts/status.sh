#!/usr/bin/env bash
# Show whether the server is on, and its address.
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

ID="$(instance_id)"
if [ -z "$ID" ]; then
  echo "Server is OFF."
  exit 0
fi
IP="$(public_ip "$ID")"
echo "Server is ON: $ID"
echo "Address:      ${DNS_NAME:-$IP}"
if nc -z -w 3 "$IP" 25565 2>/dev/null; then
  echo "Minecraft:    accepting players"
else
  echo "Minecraft:    not answering (still booting?)"
fi
