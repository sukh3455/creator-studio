#!/data/user/0/com.agy/files/usr/bin/bash
PORT=${1:-8080}
while true; do
  echo "[$(date)] Starting SSH tunnel to localhost.run on 127.0.0.1:${PORT}..."
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=10 \
      -o ServerAliveCountMax=3 \
      -o ExitOnForwardFailure=yes \
      -o TCPKeepAlive=yes \
      -R 80:127.0.0.1:${PORT} \
      nokey@localhost.run
  echo "[$(date)] Tunnel disconnected. Reconnecting in 2 seconds..."
  sleep 2
done
