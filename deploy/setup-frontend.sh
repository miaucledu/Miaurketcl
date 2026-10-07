#!/bin/bash
set -e

echo "=== Setup WEBAPPFRONT ==="

sudo apt update
sudo apt install -y nodejs npm nginx

cd /home/ubuntu/webapp/frontend

echo "VITE_API_URL=${VITE_API_URL}" > .env

npm install
npm run build

sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo systemctl restart nginx

echo "=== WEBAPPFRONT listo en puerto 80 ==="
