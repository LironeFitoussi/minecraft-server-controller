#!/usr/bin/env bash
# Turn the Minecraft server on and wait until it accepts players.
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

echo "Starting server..."
aws autoscaling set-desired-capacity --auto-scaling-group-name "$ASG_NAME" --desired-capacity 1

ID=""
for _ in $(seq 1 60); do
  ID="$(instance_id)"
  [ -n "$ID" ] && break
  sleep 5
done
[ -n "$ID" ] || { echo "No instance appeared. Check the Auto Scaling Group activity in the AWS console."; exit 1; }

aws ec2 wait instance-running --instance-ids "$ID"
IP="$(public_ip "$ID")"
echo "Instance $ID is running at $IP. Waiting for Minecraft (first boot takes a few minutes)..."

for _ in $(seq 1 90); do
  if nc -z -w 3 "$IP" 25565 2>/dev/null; then
    echo
    echo "Ready! Connect to: ${DNS_NAME:-$IP}"
    echo "Dashboard:         run scripts/dashboard.sh"
    exit 0
  fi
  printf '.'
  sleep 5
done
echo
echo "Minecraft is not answering yet. Server address: ${DNS_NAME:-$IP}"
echo "Boot log: aws ssm start-session --target $ID, then: sudo tail -f /var/log/minecraft-bootstrap.log"
exit 1
