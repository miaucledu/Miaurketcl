#!/bin/bash
set -e

BACKEND_IP="${1:?Uso: deploy-front.sh <IP_PRIVADA_BACKEND>}"

sudo apt update
sudo apt install -y nginx

sudo rm -rf /var/www/html/*
sudo cp -r /home/ubuntu/webapp/frontend/dist/* /var/www/html/

sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location /api/ {
        proxy_pass http://${BACKEND_IP}:3003;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://${BACKEND_IP}:3003;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo nginx -t
sudo systemctl restart nginx

echo "Frontend listo en http://$(curl -s ifconfig.me)"
