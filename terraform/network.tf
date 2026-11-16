# ---------------------------------------------------------------------------
# Always-on layer: network (free)
# ---------------------------------------------------------------------------
locals {
  az       = coalesce(var.availability_zone, "${var.region}a")
  asg_name = "${var.name}-server"
  dns      = var.route53_zone_id != "" && var.dns_name != ""
}

resource "aws_vpc" "this" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = var.name }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = var.name }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = "10.42.1.0/24"
  availability_zone       = local.az
  map_public_ip_on_launch = true
  tags                    = { Name = "${var.name}-public" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = { Name = "${var.name}-public" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "server" {
  name        = "${var.name}-server"
  description = "Minecraft server"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "Minecraft"
    from_port   = 25565
    to_port     = 25565
    protocol    = "tcp"
    cidr_blocks = var.player_cidrs
  }

  dynamic "ingress" {
    for_each = length(var.admin_cidrs) > 0 ? [1] : []
    content {
      description = "Web dashboard"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = var.admin_cidrs
    }
  }

  dynamic "ingress" {
    for_each = length(var.admin_cidrs) > 0 && var.ssh_public_key != "" ? [1] : []
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = var.admin_cidrs
    }
  }

  # RCON (25575) is deliberately not exposed: only the dashboard on the box uses it.

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.name}-server" }
}
