# ---------------------------------------------------------------------------
# On-demand layer: the server itself
#
# The instance is owned by an Auto Scaling Group of size 0 or 1, not by
# Terraform directly. Turning the server on or off only changes the group's
# desired capacity (scripts/up.sh, scripts/down.sh, or the idle check on the
# box), so the Terraform state never drifts and no `terraform apply` is needed
# to play.
# ---------------------------------------------------------------------------
data "aws_caller_identity" "current" {}

data "aws_ec2_instance_type" "server" {
  instance_type = var.instance_type
}

locals {
  arch = contains(data.aws_ec2_instance_type.server.supported_architectures, "arm64") ? "arm64" : "x86_64"
}

data "aws_ssm_parameter" "ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-${local.arch}"
}

# --- Permissions of the instance -------------------------------------------
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "server" {
  name               = "${var.name}-server"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

# Session Manager: shell access and port forwarding without opening SSH
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.server.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "server" {
  statement {
    sid     = "AttachWorldDisk"
    actions = ["ec2:AttachVolume", "ec2:DetachVolume"]
    resources = [
      aws_ebs_volume.world.arn,
      "arn:aws:ec2:${var.region}:${data.aws_caller_identity.current.account_id}:instance/*",
    ]
  }

  statement {
    sid       = "TurnItselfOff"
    actions   = ["autoscaling:SetDesiredCapacity"]
    resources = ["arn:aws:autoscaling:${var.region}:${data.aws_caller_identity.current.account_id}:autoScalingGroup:*:autoScalingGroupName/${local.asg_name}"]
  }

  dynamic "statement" {
    for_each = local.dns ? [1] : []
    content {
      sid       = "UpdateDnsRecord"
      actions   = ["route53:ChangeResourceRecordSets"]
      resources = ["arn:aws:route53:::hostedzone/${var.route53_zone_id}"]
    }
  }
}

resource "aws_iam_role_policy" "server" {
  name   = "${var.name}-server"
  role   = aws_iam_role.server.id
  policy = data.aws_iam_policy_document.server.json
}

resource "aws_iam_instance_profile" "server" {
  name = "${var.name}-server"
  role = aws_iam_role.server.name
}

resource "aws_key_pair" "admin" {
  count      = var.ssh_public_key != "" ? 1 : 0
  key_name   = "${var.name}-admin"
  public_key = var.ssh_public_key
}

# --- Launch template + group -----------------------------------------------
resource "aws_launch_template" "server" {
  name          = "${var.name}-server"
  image_id      = data.aws_ssm_parameter.ami.value
  instance_type = var.instance_type
  key_name      = one(aws_key_pair.admin[*].key_name)

  iam_instance_profile {
    arn = aws_iam_instance_profile.server.arn
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.server.id]
    delete_on_termination       = true
  }

  # Small throw-away root disk; the world lives on the separate volume
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 8
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  metadata_options {
    http_tokens = "required"
  }

  user_data = base64gzip(templatefile("${path.module}/user_data.sh.tftpl", {
    region            = var.region
    volume_id         = aws_ebs_volume.world.id
    asg_name          = local.asg_name
    minecraft_version = var.minecraft_version
    java_package      = var.java_package
    java_memory       = var.java_memory
    idle_minutes      = var.idle_minutes
    route53_zone_id   = local.dns ? var.route53_zone_id : ""
    dns_name          = local.dns ? var.dns_name : ""
    dashboard_enabled = var.dashboard_enabled
    dashboard_repo    = var.dashboard_repo_url
    dashboard_branch  = var.dashboard_branch
  }))

  tag_specifications {
    resource_type = "instance"
    tags          = { Name = "${var.name}-server" }
  }

  tag_specifications {
    resource_type = "volume"
    tags          = { Name = "${var.name}-root" }
  }
}

resource "aws_autoscaling_group" "server" {
  name                = local.asg_name
  min_size            = 0
  max_size            = 1
  desired_capacity    = 0 # starts off; scripts/up.sh turns it on
  vpc_zone_identifier = [aws_subnet.public.id]
  health_check_type   = "EC2"

  launch_template {
    id      = aws_launch_template.server.id
    version = "$Latest"
  }

  lifecycle {
    # On/off is controlled outside Terraform
    ignore_changes = [desired_capacity]
  }

  depends_on = [aws_iam_role_policy.server, aws_iam_role_policy_attachment.ssm]
}
