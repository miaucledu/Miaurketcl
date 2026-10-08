#!/usr/bin/env bash
set -euo pipefail
BACK_IP="${1:?Uso: bash deploy/deploy-front.sh <IP_PRIVADA_BACKEND>}"
BACK_PORT="${BACK_PORT:-3003}"
[[ "$BACK_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || { echo "IP inválida: $BACK_IP"; exit 1; }

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$APP_DIR/deploy/nginx.conf.template"
[ -f "$APP_DIR/frontend/dist/index.html" ] || { echo "Falta frontend/dist/index.html"; exit 1; }
[ -f "$TEMPLATE" ] || { echo "Falta $TEMPLATE"; exit 1; }

echo ">> Instalando nginx"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx

echo ">> Copiando dist (borrando versión anterior)"
sudo rm -rf /var/www/app
sudo mkdir -p /var/www/app
sudo cp -r "$APP_DIR/frontend/dist/." /var/www/app/
sudo chmod -R a+rX /var/www/app

echo ">> Generando config de nginx (backend $BACK_IP:$BACK_PORT)"
sed "s/__BACKEND_IP__/$BACK_IP/g; s/__BACKEND_PORT__/$BACK_PORT/g" "$TEMPLATE" \
  | sudo tee /etc/nginx/sites-available/app >/dev/null
sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl restart nginx
echo ">> Listo. Abre http://<IP_PUBLICA_DEL_FRONT>/"
