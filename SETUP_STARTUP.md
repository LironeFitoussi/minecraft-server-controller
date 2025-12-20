# 🚀 Setup Startup Service

This guide will help you set up the Minecraft Server Controller to start automatically on system boot.

## ✅ Build Tests Passed!

Both server and client build successfully:
- ✅ Backend compiled to `Server/dist/`
- ✅ Frontend built to `Client/dist/`

## Option 1: Systemd Service (Recommended)

### Quick Install

```bash
cd /home/lirone/minecraft-server-controller
sudo ./install-service.sh
```

Or manually:

```bash
# Copy service file
sudo cp minecraft-controller.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (starts on boot)
sudo systemctl enable minecraft-controller.service

# Start the service now
sudo systemctl start minecraft-controller.service
```

### Service Management

```bash
# Check status
sudo systemctl status minecraft-controller.service

# View logs (follow mode)
sudo journalctl -u minecraft-controller.service -f

# Stop the service
sudo systemctl stop minecraft-controller.service

# Restart the service
sudo systemctl restart minecraft-controller.service

# Disable auto-start (keeps service but won't start on boot)
sudo systemctl disable minecraft-controller.service
```

## Option 2: Using PM2 (Alternative)

If you prefer PM2 for process management:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the backend
cd /home/lirone/minecraft-server-controller/Server
pm2 start dist/server.js --name minecraft-controller-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions it provides (usually involves running a sudo command)
```

## Option 3: Production with Nginx (Full Setup)

For a complete production setup with nginx serving the frontend:

### 1. Build the application
```bash
cd /home/lirone/minecraft-server-controller
npm run build
```

### 2. Setup nginx
```bash
sudo ln -sf $(pwd)/nginx-minecraft-controller.conf /etc/nginx/sites-enabled/minecraft-controller
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Install systemd service
```bash
sudo ./install-service.sh
```

### 4. Access the application
- Frontend: http://localhost (or your server IP)
- Backend API: http://localhost/api
- Health check: http://localhost/health

## Environment Variables

Make sure your `Server/.env` file is properly configured:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost
MINECRAFT_HOST=localhost
MINECRAFT_RCON_PORT=25575
MINECRAFT_RCON_PASSWORD_FILE=/opt/minecraft/rcon_password
MINECRAFT_SERVICE=minecraft
```

## Verification

After installation, verify everything works:

```bash
# Check if service is running
sudo systemctl status minecraft-controller.service

# Check if it's enabled for startup
sudo systemctl is-enabled minecraft-controller.service

# Test the API
curl http://localhost:5000/health

# View recent logs
sudo journalctl -u minecraft-controller.service -n 50
```

## Troubleshooting

### Service won't start
- Check logs: `sudo journalctl -u minecraft-controller.service -n 100`
- Verify `.env` file exists and has correct values
- Check if port 5000 is already in use: `sudo lsof -i :5000`

### Service starts but API doesn't respond
- Check if the build exists: `ls -la Server/dist/server.js`
- Verify environment variables are set correctly
- Check firewall: `sudo ufw status`

### Permission issues
- Ensure the service user has access to the directory
- Check file permissions: `ls -la /home/lirone/minecraft-server-controller`

## Notes

- The systemd service only starts the backend API server
- For production, use nginx to serve the frontend (see nginx-minecraft-controller.conf)
- The service will automatically restart if it crashes
- Logs are available via `journalctl -u minecraft-controller.service`
- The service runs as user `lirone` - adjust in the service file if needed
