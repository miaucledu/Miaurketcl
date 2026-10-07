#!/bin/bash
set -e

echo "=== Setup WEBAPPBACK ==="

sudo apt update
sudo apt install -y nodejs npm

cd /home/ubuntu/webapp/backend

cat > .env << EOF
PORT=${PORT}
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
UPLOADS_DIR=${UPLOADS_DIR}
EOF

mkdir -p ../uploads/productos

npm install

echo "=== Iniciando backend en puerto ${PORT} ==="
node src/server.js
