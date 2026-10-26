#!/data/user/0/com.agy/files/usr/bin/bash
DIR="/data/user/0/com.agy/files/watermarkremove2"
cd "$DIR"

echo "Starting Vite preview on 127.0.0.1:8080..."
node ./node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8080 &

sleep 2

echo "Starting Cloudflare tunnel..."
exec cloudflared tunnel --url http://127.0.0.1:8080
