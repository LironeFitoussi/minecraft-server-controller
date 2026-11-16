variable "name" {
  description = "Prefix for all resource names."
  type        = string
  default     = "minecraft"
}

variable "region" {
  description = "AWS region. il-central-1 (Tel Aviv) gives the best latency from Israel but must be enabled in the account first."
  type        = string
  default     = "eu-central-1"
}

variable "availability_zone" {
  description = "AZ for the world disk and the server. The disk is locked to it: choose once and never change. Defaults to \"<region>a\"."
  type        = string
  default     = null
}

variable "instance_type" {
  description = "EC2 instance type. t4g (ARM) is the cheapest option that runs Minecraft well."
  type        = string
  default     = "t4g.medium"
}

variable "world_volume_size" {
  description = "Size of the persistent world disk in GB. Can be increased later, never decreased."
  type        = number
  default     = 10
}

variable "snapshot_retention_days" {
  description = "How many daily snapshots of the world disk to keep."
  type        = number
  default     = 7
}

variable "accept_eula" {
  description = "Set to true to accept the Minecraft EULA (https://aka.ms/MinecraftEULA). Required."
  type        = bool

  validation {
    condition     = var.accept_eula
    error_message = "You must accept the Minecraft EULA by setting accept_eula = true."
  }
}

variable "minecraft_version" {
  description = "Server version to download when the disk has no server.jar yet (e.g. \"1.21.8\" or \"latest\"). Ignored once a server.jar exists. Must match the Java version in java_package."
  type        = string
  default     = "1.21.8"
}

variable "java_package" {
  description = "Amazon Linux 2023 package that provides Java. Minecraft 1.20.5+ needs Java 21."
  type        = string
  default     = "java-21-amazon-corretto-headless"
}

variable "java_memory" {
  description = "Heap size for the Minecraft JVM. Leave about 1.5 GB of the instance's RAM for the OS and the dashboard."
  type        = string
  default     = "2500M"
}

variable "idle_minutes" {
  description = "Shut the server down after this many minutes with no player connected. 0 disables auto-shutdown."
  type        = number
  default     = 30
}

variable "player_cidrs" {
  description = "Who may connect to the Minecraft port (25565)."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "admin_cidrs" {
  description = "CIDRs allowed to reach the web dashboard (port 80) and SSH, e.g. [\"203.0.113.7/32\"]. The dashboard has no login, so never use 0.0.0.0/0. Leave empty and use scripts/dashboard.sh (SSM tunnel) instead."
  type        = list(string)
  default     = []

  validation {
    condition     = !contains(var.admin_cidrs, "0.0.0.0/0")
    error_message = "admin_cidrs must not contain 0.0.0.0/0: the dashboard is unauthenticated."
  }
}

variable "ssh_public_key" {
  description = "Optional SSH public key for ec2-user. Only needed for scripts/upload-world.sh; port 22 is opened to admin_cidrs only when this is set."
  type        = string
  default     = ""
}

variable "dashboard_enabled" {
  description = "Install the web dashboard (this repository) on the server."
  type        = bool
  default     = true
}

variable "dashboard_repo_url" {
  description = "Git URL of the dashboard. Must be cloneable without credentials."
  type        = string
  default     = "https://github.com/LironeFitoussi/minecraft-server-controller.git"
}

variable "dashboard_branch" {
  description = "Branch of the dashboard to deploy."
  type        = string
  default     = "main"
}

variable "route53_zone_id" {
  description = "Optional Route 53 hosted zone ID. When set together with dns_name, the server updates the record with its new IP on every boot."
  type        = string
  default     = ""
}

variable "dns_name" {
  description = "Optional DNS name for the server, e.g. mc.example.com."
  type        = string
  default     = ""
}
