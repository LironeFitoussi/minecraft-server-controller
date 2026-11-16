#!/usr/bin/env bash
# Shared helpers. Needs: terraform, aws CLI v2 (logged in), run after `terraform apply`.
set -euo pipefail

TF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

tf_output() { terraform -chdir="$TF_DIR" output -raw "$1"; }

REGION="$(tf_output region)"
ASG_NAME="$(tf_output asg_name)"
DNS_NAME="$(tf_output dns_name)"
export AWS_DEFAULT_REGION="$REGION"

# ID of the running (or starting) server, empty if there is none
instance_id() {
  aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$ASG_NAME" \
    --query 'AutoScalingGroups[0].Instances[?LifecycleState==`InService` || LifecycleState==`Pending`] | [0].InstanceId' \
    --output text | grep -v '^None$' || true
}

public_ip() {
  aws ec2 describe-instances --instance-ids "$1" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' --output text | grep -v '^None$' || true
}
