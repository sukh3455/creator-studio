#!/bin/bash
pkill -9 -f "nokey@localhost.run" 2>/dev/null || true
while true; do
  ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -R 80:127.0.0.1:8080 nokey@localhost.run 2>&1 | while read -r line; do
    echo "$line"
    url=$(echo "$line" | grep -o 'https://[a-zA-Z0-9-]*\.lhr\.life' | head -n 1)
    if [ -n "$url" ]; then
      echo "$url" > /data/user/0/com.agy/files/watermarkremove2/tunnel_url.txt
      echo "=== ACTIVE TUNNEL: $url ==="
    fi
  done
  sleep 2
done
