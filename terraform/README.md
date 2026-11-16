# On-demand Minecraft server on AWS

The world lives on a small EBS disk that always exists. The server itself (EC2)
only exists while somebody is playing, and deletes itself after 30 idle minutes.

| Layer | What | Cost |
|---|---|---|
| Always on | VPC, security group, 10 GB world disk, daily snapshots | about $1 / month |
| While playing | `t4g.medium` instance + public IP, with the web dashboard on it | about $0.04 / hour |

## How it works

- Terraform creates the network, the world disk (`prevent_destroy`), daily
  snapshots (DLM) and an **Auto Scaling Group of size 0 or 1**.
- On = desired capacity 1, off = 0. `up.sh`, `down.sh` and the idle check on the
  server only change that number, so there is no `terraform apply` to play and
  the state never drifts.
- On boot the server attaches the world disk, formats it **only if it is empty**,
  installs Java, starts Minecraft as a systemd service and installs the dashboard.
- Every 5 minutes the server checks for connected players. After `idle_minutes`
  without any, it stops Minecraft (which saves the world) and deletes itself.

## Setup (once)

Needs: Terraform >= 1.5, AWS CLI v2 logged in, and for the dashboard tunnel the
Session Manager plugin (`brew install --cask session-manager-plugin`).

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # set accept_eula = true, region, etc.
terraform init
terraform apply
```

Decide these **before** the first apply:

- `region` / `availability_zone` - the disk is locked to its AZ forever.
  `il-central-1` has the best latency from Israel but must be enabled in the account.
- Remote state - the state holds the link to the world disk. To keep it in S3,
  copy `backend.tf.example` to `backend.tf` before `terraform init`.
- `minecraft_version` - must match your existing world, and `java_package` must
  match the version (1.20.5+ needs Java 21).

## Daily use

```bash
scripts/up.sh         # start and wait until players can connect
scripts/status.sh     # on/off and address
scripts/dashboard.sh  # web dashboard at http://localhost:8080 (private tunnel)
scripts/down.sh       # save and turn off (also happens automatically when idle)
```

The public IP changes on every start. Set `route53_zone_id` and `dns_name` to get
a stable name that the server updates on boot.

## Uploading an existing world (once)

Set `ssh_public_key` and `admin_cidrs = ["<your IP>/32"]`, apply, then:

```bash
scripts/up.sh
scripts/upload-world.sh ~/path/to/world
```

The world that was on the server is kept next to it as `world.bak`.

## The dashboard

It is installed from `dashboard_repo_url` / `dashboard_branch` onto the world
disk, so only the first boot (or a new commit) has to build it. It has **no
login**, so it is not exposed to the internet: use `scripts/dashboard.sh`, or
restrict it to your own IP with `admin_cidrs`.

Its Stop button stops the Minecraft service, not the machine; the idle check
then turns the machine off. Using only the dashboard does not count as activity.

## Good to know

- Boot log on the server: `/var/log/minecraft-bootstrap.log`
  (`aws ssm start-session --target <instance-id>`).
- `terraform destroy` fails on purpose because of the world disk. To really
  delete everything, remove `prevent_destroy` in `storage.tf` first.
- Restore from a snapshot: create a volume from it in the same AZ and
  `terraform import aws_ebs_volume.world <new-volume-id>` (after
  `terraform state rm aws_ebs_volume.world`).
- `idle_minutes = 0` disables auto-shutdown.
