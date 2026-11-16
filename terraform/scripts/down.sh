#!/usr/bin/env bash
# Turn the Minecraft server off. The world disk is kept.
source "$(dirname "${BASH_SOURCE[0]}")/_common.sh"

ID="$(instance_id)"
if [ -z "$ID" ]; then
  echo "Server is already off."
  aws autoscaling set-desired-capacity --auto-scaling-group-name "$ASG_NAME" --desired-capacity 0
  exit 0
fi

# Preferred: ask the machine to stop Minecraft first (saves the world), then delete itself
echo "Asking $ID to save the world and shut down..."
if CMD_ID="$(aws ssm send-command --instance-ids "$ID" --document-name AWS-RunShellScript \
      --parameters 'commands=["/usr/local/bin/mc-shutdown"]' --query 'Command.CommandId' --output text 2>/dev/null)"; then
  aws ssm wait command-executed --command-id "$CMD_ID" --instance-id "$ID" 2>/dev/null || true
else
  echo "Could not reach the machine through SSM; shutting down directly."
fi

# Makes sure it goes down either way (shutdown still stops the Minecraft service cleanly)
aws autoscaling set-desired-capacity --auto-scaling-group-name "$ASG_NAME" --desired-capacity 0
echo "Waiting for the machine to be deleted..."
aws ec2 wait instance-terminated --instance-ids "$ID"
echo "Server is off. The world disk and its snapshots are kept."
