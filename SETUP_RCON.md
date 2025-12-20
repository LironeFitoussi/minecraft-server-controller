# 🔧 RCON Setup Guide

## Quick Setup

Your Minecraft server controller needs RCON to work. Here's how to set it up:

### Option 1: Use enable-rcon.sh script (Recommended)

```bash
sudo /home/lirone/enable-rcon.sh
```

This will:
- Enable RCON in server.properties
- Generate a secure password
- Save it to `/opt/minecraft/rcon_password`

**Then add the password to your .env:**

```bash
cd /home/lirone/minecraft-server-controller/Server
echo "MINECRAFT_RCON_PASSWORD=$(sudo cat /opt/minecraft/rcon_password)" >> .env
```

### Option 2: Manual Setup

1. **Enable RCON in server.properties:**
   ```bash
   sudo nano /opt/minecraft/server/server.properties
   ```
   
   Add/update these lines:
   ```properties
   enable-rcon=true
   rcon.port=25575
   rcon.password=your-secure-password-here
   ```

2. **Add to .env:**
   ```bash
   cd /home/lirone/minecraft-server-controller/Server
   echo "MINECRAFT_RCON_PASSWORD=your-secure-password-here" >> .env
   ```

3. **Restart Minecraft server:**
   ```bash
   sudo systemctl restart minecraft
   ```

### Option 3: Direct Password in .env (Simplest)

Just add this line to `Server/.env`:
```env
MINECRAFT_RCON_PASSWORD=your-actual-rcon-password
```

## Verify Setup

After setting up, restart your backend:
```bash
cd /home/lirone/minecraft-server-controller/Server
npm run dev
```

Then try broadcasting a message from the dashboard. If it works, you're all set! ✅
