# 🎮 Minecraft Server Controller

Professional MERN stack application for managing Minecraft servers.

## 🚀 Quick Start

### Development (Both servers with hot reload)
```bash
npm run dev
```

Runs:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Development (Separate terminals)
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev:client
```

## 📦 Production

### Build
```bash
npm run build
```

### Run Production
```bash
# Backend
npm run start:server

# Setup nginx (one-time)
sudo ln -sf $(pwd)/nginx-minecraft-controller.conf /etc/nginx/sites-enabled/minecraft-controller
sudo nginx -t && sudo systemctl reload nginx
```

Access: http://localhost

## ⚙️ Setup

### Install Dependencies
```bash
npm run install:all
```

### Environment Variables
Create `Server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/minecraft-controller
CLIENT_URL=http://localhost:5173
MINECRAFT_HOST=localhost
MINECRAFT_RCON_PORT=25575
MINECRAFT_RCON_PASSWORD_FILE=/opt/minecraft/rcon_password
```

## 📚 Documentation

See [docs/](./docs/) folder for detailed guides.

## 🎯 Features

- 26 API endpoints for full Minecraft server control
- Real-time status updates
- Game mode, difficulty, weather, time controls
- Player management (kick, ban, whitelist, OP)
- Items & effects management
- World management & teleportation
- TypeScript throughout
- Auth0 ready
- iOS-inspired glass morphism UI

---

Built with React 19, Express 5, TypeScript, and MongoDB.


