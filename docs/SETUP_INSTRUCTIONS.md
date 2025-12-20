# 🚀 Minecraft Server Controller - Setup Instructions

## Quick Setup (5 minutes)

### 1. Configure Backend Environment

Create `Server/.env`:

```env
# Server Configuration (from template)
PORT=5000
NODE_ENV=development

# Database (from template)
MONGO_URI=mongodb://localhost:27017/minecraft-controller

# Client URL (from template)
CLIENT_URL=http://localhost:5173

# Auth0 Configuration (from template)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier

# ===== MINECRAFT CONFIGURATION (NEW) =====
# Minecraft server host
MINECRAFT_HOST=localhost

# RCON port (default 25575)
MINECRAFT_RCON_PORT=25575

# RCON password file path (recommended)
MINECRAFT_RCON_PASSWORD_FILE=/opt/minecraft/rcon_password

# Or use direct password (less secure)
# MINECRAFT_RCON_PASSWORD=your-rcon-password

# Server properties file path
MINECRAFT_SERVER_PROPERTIES=/opt/minecraft/server/server.properties
```

### 2. Configure Frontend Environment

Create `Client/.env`:

```env
# API Configuration (from template)
VITE_API_URL=http://localhost:5000/api

# Auth0 Configuration (from template)
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

### 3. Install Dependencies

```bash
# Backend
cd Server
npm install

# Frontend (in new terminal)
cd Client
npm install
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd Server
npm run dev

# Terminal 2 - Frontend
cd Client
npm run dev
```

### 5. Access Dashboard

Open browser to: **http://localhost:5173/minecraft**

---

## 🔧 Minecraft Server RCON Setup

### Enable RCON on Your Minecraft Server

Edit your Minecraft `server.properties`:

```properties
enable-rcon=true
rcon.port=25575
rcon.password=your-secure-password-here
```

Save the password to a file:
```bash
echo "your-secure-password-here" | sudo tee /opt/minecraft/rcon_password
sudo chmod 600 /opt/minecraft/rcon_password
```

Restart your Minecraft server to apply changes.

---

## 🧪 Test the Setup

### 1. Test Backend

```bash
# Health check
curl http://localhost:5000/health

# Minecraft server info (requires Auth0 token)
curl http://localhost:5000/api/minecraft/info
```

### 2. Test Frontend

1. Navigate to http://localhost:5173/minecraft
2. You should see the server status card
3. Try changing game mode or weather

---

## 📝 Development Tips

### Backend Development

- **Hot reload enabled** - Changes reload automatically
- **TypeScript** - Full type checking
- **Error logging** - Check console for errors
- **RCON debug** - Check connection logs in terminal

### Frontend Development

- **Vite HMR** - Instant updates
- **React Query DevTools** - Inspect queries
- **Toast notifications** - Visual feedback
- **TypeScript errors** - Check VS Code problems panel

---

## 🎯 Next Steps

1. **Customize UI** - Edit components in `Client/src/components/Molecules/`
2. **Add Features** - Create new components following atomic design
3. **Configure Auth** - Set up Auth0 for authentication
4. **Deploy** - Follow template deployment guide

---

## 🆘 Common Issues

### "RCON not connected"
- Check Minecraft server is running
- Verify RCON is enabled in server.properties
- Check password matches

### "CORS error"
- Verify CLIENT_URL in backend .env
- Check VITE_API_URL in frontend .env

### "Auth0 error"
- Set up Auth0 account
- Configure callback URLs
- Add environment variables

### "Port already in use"
- Change PORT in backend .env
- Kill existing process: `lsof -ti:5000 | xargs kill -9`

---

## 📚 Resources

- **Template Guide**: `TEMPLATE_GUIDE.md`
- **Migration Guide**: `MINECRAFT_MIGRATION_GUIDE.md`
- **Design System**: `Client/DESIGN_SYSTEM.md`
- **Original API Docs**: `/home/lirone/API-DOCUMENTATION.md`

---

**Ready to manage your Minecraft server! 🎮**
