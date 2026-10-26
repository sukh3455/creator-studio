#!/data/user/0/com.agy/files/usr/bin/bash
PORT=${1:-8080}
URL_FILE="/data/user/0/com.agy/files/watermarkremove2/tunnel_url.txt"
KEY_PATH="$HOME/.ssh/id_ed25519"

echo "=== Serveo HTTPS Tunnel Daemon ==="
echo "Forwarding local port: ${PORT}"

while true; do
  echo "[$(date)] Connecting to serveo.net..."
  ssh -i "${KEY_PATH}" \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/dev/null \
      -o ServerAliveInterval=10 \
      -o ServerAliveCountMax=3 \
      -o TCPKeepAlive=yes \
      -R 80:127.0.0.1:${PORT} \
      serveo.net 2>&1 | while read -r line; do
        echo "$line"
        if echo "$line" | grep -q "Forwarding HTTP traffic from"; then
          URL=$(echo "$line" | grep -o 'https://[^ ]*')
          echo "$URL" > "${URL_FILE}"
          echo "========================================="
          echo " LIVE PUBLIC TUNNEL URL: $URL"
          echo "========================================="
        fi
      done
  echo "[$(date)] Tunnel disconnected. Reconnecting in 3 seconds..."
  sleep 3
done
