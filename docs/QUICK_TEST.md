# 🧪 Quick Production Test

## Test Without Nginx (Simple Test)

Just want to test if everything works? Use this:

```bash
# 1. Start backend
cd Server
npm start
# Leave this running in terminal 1

# 2. In another terminal, test the API
curl http://localhost:5000/health
curl http://localhost:5000/api/minecraft/info

# 3. Serve frontend (optional)
cd Client/dist
npx http-server -p 8080
# Open http://localhost:8080
```

---

## Full Production Test (With Nginx)

```bash
# Run the simple start script
./start-simple.sh
```

This will:
1. ✅ Check builds exist
2. ✅ Configure nginx
3. ✅ Start backend on port 5000
4. ✅ Serve everything on port 80

**Access at:** http://localhost

---

## Manual Step-by-Step

### 1. Build Everything
```bash
cd Client && npm run build && cd ..
cd Server && npm run build && cd ..
```

### 2. Start Backend
```bash
cd Server
npm start
```

Backend runs on http://localhost:5000

### 3. Setup Nginx (One-Time)
```bash
sudo ln -sf $(pwd)/nginx-minecraft-controller.conf /etc/nginx/sites-enabled/minecraft-controller
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Test
```bash
# Frontend
curl http://localhost/

# API through nginx
curl http://localhost/api/minecraft/status

# Direct backend
curl http://localhost:5000/health
```

---

## Expected Results

✅ **Backend:** Running on port 5000  
✅ **Nginx:** Serving frontend on port 80  
✅ **API:** Proxied through nginx `/api` → `:5000`  
✅ **Frontend:** Loads from `Client/dist/`  
✅ **Routes:** SPA fallback working  

---

## Troubleshooting

**Backend won't start?**
```bash
# Check port
lsof -ti:5000

# Kill if needed
lsof -ti:5000 | xargs kill -9

# Check .env
ls Server/.env
```

**Nginx errors?**
```bash
# Test config
sudo nginx -t

# Check logs
tail /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

**Can't access http://localhost?**
- Check nginx is running: `systemctl status nginx`
- Check if firewall is blocking: `sudo ufw status`
- Try http://127.0.0.1 instead

---

## Quick Commands

```bash
# Kill backend
lsof -ti:5000 | xargs kill -9

# Reload nginx
sudo systemctl reload nginx

# View backend logs (if using systemd)
sudo journalctl -u minecraft-backend -f

# View nginx logs
tail -f /var/log/nginx/minecraft-controller-*.log
```
