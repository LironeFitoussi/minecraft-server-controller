# 🚀 Production Deployment Guide

## Simple Production Setup

### Architecture
- **Frontend:** Nginx serves static files from `Client/dist/`
- **Backend:** Node.js process running on port 5000 (`npm start`)
- **Nginx:** Proxies `/api` requests to backend

---

## Quick Start (3 Steps)

### 1. Build Both Apps
```bash
# Build frontend
cd Client
npm run build

# Build backend
cd ../Server
npm run build
cd ..
```

### 2. Start Backend
```bash
cd Server
npm start
# Backend runs on http://localhost:5000
```

### 3. Setup Nginx (One-Time)
```bash
# Link nginx config
sudo ln -sf $(pwd)/nginx-minecraft-controller.conf /etc/nginx/sites-enabled/minecraft-controller

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## Access Your App

- **Frontend:** http://localhost
- **Minecraft Dashboard:** http://localhost/minecraft
- **API:** http://localhost/api (proxied to :5000)
- **Health:** http://localhost/health

---

## Environment Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/minecraft-controller
CLIENT_URL=http://localhost

# Minecraft
MINECRAFT_HOST=localhost
MINECRAFT_RCON_PORT=25575
MINECRAFT_RCON_PASSWORD_FILE=/opt/minecraft/rcon_password
```

### Frontend (built into dist/)
No runtime env needed - everything baked into build!

---

## Managing Services

### Backend
```bash
# Start
cd Server && npm start

# Stop
# Press Ctrl+C or kill the process
```

### Nginx
```bash
# Status
sudo systemctl status nginx

# Reload config
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Stop
sudo systemctl stop nginx
```

---

## Production Checklist

- ✅ Frontend built (`Client/dist/`)
- ✅ Backend built (`Server/dist/`)
- ✅ Environment variables configured
- ✅ Nginx config linked
- ✅ Backend running on port 5000
- ✅ Nginx serving on port 80

---

## Optional: Systemd Service for Backend

Create `/etc/systemd/system/minecraft-backend.service`:

```ini
[Unit]
Description=Minecraft Controller Backend
After=network.target mongodb.service

[Service]
Type=simple
User=lirone
WorkingDirectory=/home/lirone/minecraft-server-controller/Server
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable minecraft-backend
sudo systemctl start minecraft-backend
```

---

## Logs

### Backend Logs
```bash
# If running directly
# Check the terminal where you ran npm start

# If using systemd
sudo journalctl -u minecraft-backend -f
```

### Nginx Logs
```bash
# Access log
tail -f /var/log/nginx/minecraft-controller-access.log

# Error log
tail -f /var/log/nginx/minecraft-controller-error.log
```

---

## Testing

```bash
# Test backend
curl http://localhost:5000/health

# Test frontend (through nginx)
curl http://localhost/

# Test API proxy
curl http://localhost/api/minecraft/info
```

---

## Troubleshooting

### Backend won't start
- Check if port 5000 is free: `lsof -ti:5000`
- Check .env file exists in Server/
- Check MongoDB is running: `systemctl status mongodb`

### Nginx won't serve frontend
- Check build exists: `ls Client/dist/`
- Check nginx config: `sudo nginx -t`
- Check nginx logs: `tail /var/log/nginx/minecraft-controller-error.log`

### API calls fail
- Check backend is running: `curl http://localhost:5000/health`
- Check nginx proxy config
- Check CORS settings in backend

---

**That's it! Simple and clean production setup.** 🎉
