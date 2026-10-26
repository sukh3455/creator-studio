#!/data/user/0/com.agy/files/usr/bin/bash
set -e

DIR="/data/user/0/com.agy/files/watermarkremove2"
cd "$DIR"

PORT=8080
URL_FILE="$DIR/tunnel_url.txt"
LOG_FILE="$DIR/tunnel.log"

echo "[$(date)] Starting Auto-Anim Engine server and Cloudflare Tunnel..." | tee "$LOG_FILE"

# 1. Kill any existing instances
pkill -9 -f "preview --host 127.0.0.1 --port 8080" 2>/dev/null || true
pkill -9 -f "cloudflared tunnel" 2>/dev/null || true
pkill -9 -f "nokey@localhost.run" 2>/dev/null || true
sleep 1

# 2. Ensure DNS config for patched cloudflared
cat << 'EOF' > /sdcard/dns.conf
nameserver 1.1.1.1
nameserver 8.8.8.8
EOF

# 3. Launch Vite Preview on port 8080
echo "[$(date)] Starting local HTTP server on 127.0.0.1:${PORT}..." | tee -a "$LOG_FILE"
node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port "$PORT" >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID" >> "$LOG_FILE"

sleep 2

# Verify local server
if curl -s -I "http://127.0.0.1:${PORT}/" | grep -q "200 OK"; then
  echo "[$(date)] Local server is healthy and responding on port ${PORT}." | tee -a "$LOG_FILE"
else
  echo "[$(date)] Warning: Local server check pending..." | tee -a "$LOG_FILE"
fi

# 4. Start Cloudflare Tunnel Loop
echo "[$(date)] Connecting Cloudflare Tunnel (trycloudflare.com)..." | tee -a "$LOG_FILE"
while true; do
  cloudflared tunnel --url "http://127.0.0.1:${PORT}" 2>&1 | while IFS= read -r line; do
    echo "$line" >> "$LOG_FILE"
    url=$(echo "$line" | grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | head -n 1)
    if [ -n "$url" ] && [ "$url" != "https://api.trycloudflare.com" ]; then
      echo "$url" > "$URL_FILE"
      echo "=========================================================="
      echo "🎉 ACTIVE LIVE CLOUDFLARE TUNNEL: $url"
      echo "=========================================================="
    fi
  done
  echo "[$(date)] Cloudflare tunnel disconnected, reconnecting in 2s..." >> "$LOG_FILE"
  sleep 2
done
