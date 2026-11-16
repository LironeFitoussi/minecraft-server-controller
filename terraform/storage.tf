# ---------------------------------------------------------------------------
# Always-on layer: the world disk and its backups
# ---------------------------------------------------------------------------
resource "aws_ebs_volume" "world" {
  availability_zone = local.az
  type              = "gp3"
  size              = var.world_volume_size
  encrypted         = true

  tags = {
    Name   = "${var.name}-world"
    Backup = "${var.name}-world"
  }

  lifecycle {
    # Blocks `terraform destroy` and any change that would replace the disk
    # (such as a different AZ). It does NOT help if this block is deleted from
    # the code - the daily snapshots below are the real safety net.
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "dlm_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["dlm.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "dlm" {
  name               = "${var.name}-dlm"
  assume_role_policy = data.aws_iam_policy_document.dlm_assume.json
}

resource "aws_iam_role_policy_attachment" "dlm" {
  role       = aws_iam_role.dlm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole"
}

resource "aws_dlm_lifecycle_policy" "world" {
  description        = "Daily snapshots of the ${var.name} world disk"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]
    target_tags    = { Backup = "${var.name}-world" }

    schedule {
      name      = "daily"
      copy_tags = true

      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        times         = ["03:00"] # UTC
      }

      retain_rule {
        count = var.snapshot_retention_days
      }
    }
  }
}
