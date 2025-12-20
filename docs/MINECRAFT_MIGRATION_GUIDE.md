# 🎮 Minecraft Server Controller - Migration Complete!

## ✅ Migration Summary

Your Minecraft server controller has been successfully migrated to the professional TypeScript MERN template with Auth0 authentication and iOS-inspired glass morphism design!

---

## 📁 Files Created

### Backend (Server)

#### Types
- **`Server/src/types/minecraft.d.ts`** - Complete TypeScript interfaces for all Minecraft operations

#### Utils
- **`Server/src/utils/rcon.ts`** - RCON service utility for communicating with Minecraft server

#### Controllers
- **`Server/src/controllers/minecraft.controllers.ts`** - All 25+ API endpoint handlers

#### Routes
- **`Server/src/routes/minecraft.routes.ts`** - RESTful API routes

#### Modified Files
- **`Server/src/server.ts`** - Added Minecraft routes registration

### Frontend (Client)

#### Types
- **`Client/src/types/minecraft.d.ts`** - Frontend TypeScript interfaces

#### Services
- **`Client/src/services/minecraft.ts`** - API service with all 25+ endpoint calls

#### Components (Atomic Design)
**Molecules:**
- **`Client/src/components/Molecules/ServerStatusCard.tsx`** - Real-time server status display
- **`Client/src/components/Molecules/GameModeControl.tsx`** - Game mode, difficulty, weather, time controls
- **`Client/src/components/Molecules/QuickActionsPanel.tsx`** - Quick action buttons

#### Pages
- **`Client/src/pages/MinecraftDashboardPage.tsx`** - Main dashboard page

#### Modified Files
- **`Client/src/routes.tsx`** - Added `/minecraft` route

---

## 🚀 Quick Start

### 1. Backend Setup

Add these environment variables to `Server/.env`:

```env
# Minecraft Configuration
MINECRAFT_HOST=localhost
MINECRAFT_RCON_PORT=25575
MINECRAFT_RCON_PASSWORD_FILE=/opt/minecraft/rcon_password
# Or use direct password:
# MINECRAFT_RCON_PASSWORD=your-rcon-password
MINECRAFT_SERVER_PROPERTIES=/opt/minecraft/server/server.properties
```

### 2. Start the Services

```bash
# Terminal 1 - Backend
cd Server
npm run dev

# Terminal 2 - Frontend
cd Client
npm run dev
```

### 3. Access the Dashboard

Open your browser to:
```
http://localhost:5173/minecraft
```

---

## 🎯 Available API Endpoints

All endpoints are under `/api/minecraft`:

### Server Information
- `GET /api/minecraft/info` - Get server information
- `GET /api/minecraft/status` - Get server status
- `GET /api/minecraft/players` - Get online players

### Game Mode & Settings
- `POST /api/minecraft/gamemode` - Change player game mode
- `POST /api/minecraft/difficulty` - Set difficulty
- `POST /api/minecraft/weather` - Control weather
- `POST /api/minecraft/time` - Control time

### World Management
- `POST /api/minecraft/world/save` - Save world
- `POST /api/minecraft/world/gamerule` - Set game rules
- `POST /api/minecraft/world/seed` - Get world seed
- `POST /api/minecraft/teleport` - Teleport players

### Whitelist & OP
- `POST /api/minecraft/whitelist/add` - Add to whitelist
- `POST /api/minecraft/whitelist/remove` - Remove from whitelist
- `GET /api/minecraft/whitelist/list` - List whitelist
- `POST /api/minecraft/whitelist/toggle` - Toggle whitelist
- `POST /api/minecraft/op/add` - Give OP
- `POST /api/minecraft/op/remove` - Remove OP

### Player Management
- `POST /api/minecraft/player/kick` - Kick player
- `POST /api/minecraft/player/ban` - Ban player
- `POST /api/minecraft/player/pardon` - Unban player
- `GET /api/minecraft/player/banlist` - Get ban list

### Items & Effects
- `POST /api/minecraft/give` - Give items
- `POST /api/minecraft/effect/give` - Give effects
- `POST /api/minecraft/effect/clear` - Clear effects

### Communication
- `POST /api/minecraft/broadcast` - Broadcast message
- `POST /api/minecraft/command` - Execute custom command

---

## 🎨 Design System Integration

The Minecraft controller follows the template's iOS 26 glass morphism design:

### Color Scheme
- **Glass Backgrounds:** `bg-white/20 backdrop-blur-xl`
- **Borders:** `border border-white/30`
- **Hover Effects:** `hover:shadow-xl`
- **Rounded Corners:** `rounded-2xl`, `rounded-3xl`

### Animations
- **Framer Motion** for smooth transitions
- **Staggered animations** with delays
- **Hover effects** with scale transforms

### Components
All components use:
- ✅ Glass morphism backgrounds
- ✅ Smooth transitions
- ✅ Proper spacing and padding
- ✅ Responsive grid layouts
- ✅ Blue accent colors for actions
- ✅ Emoji icons for visual clarity

---

## 📱 Features

### Real-Time Updates
- **Server Status**: Updates every 5 seconds
- **Player List**: Live player tracking
- **Auto-refresh**: TanStack Query with refetch intervals

### User Experience
- **Toast Notifications**: React Hot Toast for feedback
- **Loading States**: Disabled buttons during operations
- **Error Handling**: Graceful error messages
- **Responsive Design**: Mobile-first approach

### Quick Actions
- 💾 Save World
- 📢 Broadcast Messages
- 💎 Give Items
- 🚀 Teleport Players

### Game Controls
- 🎮 Game Mode (Survival, Creative, Adventure, Spectator)
- ⚔️ Difficulty (Peaceful, Easy, Normal, Hard)
- ☁️ Weather (Clear, Rain, Thunder)
- 🕐 Time (Day, Noon, Night, Midnight)

---

## 🔧 Configuration

### RCON Setup

Make sure your Minecraft server has RCON enabled in `server.properties`:

```properties
enable-rcon=true
rcon.port=25575
rcon.password=your-secure-password
```

### Backend Environment

The backend automatically tries to:
1. Read password from file: `/opt/minecraft/rcon_password`
2. Fallback to environment variable: `MINECRAFT_RCON_PASSWORD`

### Frontend Environment

Already configured to use the API URL from `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏗️ Architecture

### Backend Flow
```
Client → Express Route → Controller → RCON Service → Minecraft Server
```

### Frontend Flow
```
Component → Service → Axios → Backend API → Response
```

### State Management
- **TanStack Query**: Server state (players, status, etc.)
- **Local State**: Form inputs and loading states
- **Redux**: User authentication (from template)

---

## 🎯 Usage Examples

### Change Game Mode
```typescript
import { setGameMode } from '@/services/minecraft';

await setGameMode({ 
  player: 'Steve', 
  mode: 'creative' 
});
```

### Broadcast Message
```typescript
import { broadcast } from '@/services/minecraft';

await broadcast({ 
  message: 'Server restarting in 5 minutes!' 
});
```

### Give Items
```typescript
import { giveItem } from '@/services/minecraft';

await giveItem({ 
  player: 'Steve', 
  item: 'minecraft:diamond', 
  count: 64 
});
```

---

## 🔐 Authentication

The Minecraft dashboard is protected by Auth0 (from the template):

- **Protected Route**: Requires authentication to access
- **Role-Based**: Can be extended for admin-only access
- **JWT Tokens**: Automatic token management

To make it admin-only, wrap the route:
```typescript
import ProtectedRoute from "@/components/ProtectedRoute";

{
  path: "/minecraft",
  Component: () => (
    <ProtectedRoute requiredRole="admin">
      <MinecraftDashboardPage />
    </ProtectedRoute>
  ),
  name: "Minecraft Server",
}
```

---

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Get server status
curl http://localhost:5000/api/minecraft/status

# Change difficulty (with auth token)
curl -X POST http://localhost:5000/api/minecraft/difficulty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"difficulty": "hard"}'
```

### Test Frontend
1. Navigate to `http://localhost:5173/minecraft`
2. Check server status card updates
3. Try changing game mode
4. Test quick actions

---

## 🚀 Next Steps

### Extend Functionality

1. **Add More Components:**
   ```bash
   Client/src/components/Molecules/
   ├── PlayerManagementPanel.tsx
   ├── WhitelistControl.tsx
   ├── ItemsEffectsPanel.tsx
   └── WorldManagementPanel.tsx
   ```

2. **Add Real-Time WebSocket:**
   - Live server logs
   - Chat integration
   - Event notifications

3. **Add Charts & Analytics:**
   - Player activity over time
   - Server performance metrics
   - TPS monitoring

4. **Add File Management:**
   - Upload/download worlds
   - Plugin management
   - Configuration editor

### Deployment

**Backend:**
```bash
cd Server
npm run build
npm start
```

**Frontend:**
```bash
cd Client
npm run build
# Deploy dist/ folder to Vercel, Netlify, etc.
```

---

## 📚 Template Features Used

✅ **TypeScript** - Full type safety  
✅ **Express 5** - Modern backend  
✅ **React 19** - Latest frontend  
✅ **Auth0** - Authentication  
✅ **MongoDB** - Database (for users)  
✅ **TanStack Query** - Server state  
✅ **Framer Motion** - Animations  
✅ **Tailwind CSS** - Styling  
✅ **Glass Morphism** - iOS design  
✅ **Atomic Design** - Component structure  
✅ **Error Handling** - Comprehensive  
✅ **Rate Limiting** - API protection  

---

## 🐛 Troubleshooting

### Backend Issues

**RCON Not Connected:**
```bash
# Check RCON password
cat /opt/minecraft/rcon_password

# Test RCON manually
npm install -g rcon-cli
rcon-cli --host localhost --port 25575 --password YOUR_PASSWORD
```

**Can't reach Minecraft server:**
```bash
# Check if Minecraft is running
pgrep -f "server.jar"

# Check RCON port
netstat -tulpn | grep 25575
```

### Frontend Issues

**API calls failing:**
- Check `VITE_API_URL` in `Client/.env`
- Verify backend is running on correct port
- Check browser console for CORS errors

**Components not rendering:**
- Check imports are correct
- Verify TanStack Query Provider is setup
- Check for TypeScript errors

---

## 📄 Documentation Reference

- **Original Dashboard:** `/home/lirone/dashboard/`
- **Template Guide:** `TEMPLATE_GUIDE.md`
- **Design System:** `Client/DESIGN_SYSTEM.md`
- **API Docs:** `/home/lirone/API-DOCUMENTATION.md`

---

## 🎉 Success!

Your Minecraft server controller is now fully integrated into the professional MERN template with:

✅ **TypeScript** throughout  
✅ **Professional architecture**  
✅ **Beautiful iOS-inspired UI**  
✅ **Auth0 authentication**  
✅ **Real-time updates**  
✅ **25+ API endpoints**  
✅ **Comprehensive error handling**  
✅ **Production-ready code**  

---

**Happy server managing! 🎮✨**

Need help? Check the template documentation or refer to the original dashboard implementation.
