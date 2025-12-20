#!/bin/bash
# Installation script for Minecraft Server Controller systemd service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="$SCRIPT_DIR/minecraft-controller.service"
SYSTEMD_PATH="/etc/systemd/system/minecraft-controller.service"

echo "🔧 Installing Minecraft Server Controller systemd service..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo ./install-service.sh"
    exit 1
fi

# Check if service file exists
if [ ! -f "$SERVICE_FILE" ]; then
    echo "❌ Service file not found: $SERVICE_FILE"
    exit 1
fi

# Copy service file
echo "📋 Copying service file..."
cp "$SERVICE_FILE" "$SYSTEMD_PATH"

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable service
echo "✅ Enabling service to start on boot..."
systemctl enable minecraft-controller.service

echo ""
echo "✅ Installation complete!"
echo ""
echo "Useful commands:"
echo "  Start service:    sudo systemctl start minecraft-controller"
echo "  Stop service:     sudo systemctl stop minecraft-controller"
echo "  Restart service:  sudo systemctl restart minecraft-controller"
echo "  Check status:     sudo systemctl status minecraft-controller"
echo "  View logs:        sudo journalctl -u minecraft-controller -f"
echo ""
echo "The service will start automatically on system boot."

