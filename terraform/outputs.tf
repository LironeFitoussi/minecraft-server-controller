output "region" {
  value = var.region
}

output "asg_name" {
  description = "Auto Scaling Group that owns the server (desired capacity 1 = on, 0 = off)."
  value       = aws_autoscaling_group.server.name
}

output "world_volume_id" {
  value = aws_ebs_volume.world.id
}

output "dns_name" {
  description = "DNS name that follows the server, if configured."
  value       = local.dns ? var.dns_name : ""
}
