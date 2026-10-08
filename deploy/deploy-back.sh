#!/usr/bin/env bash
set -euo pipefail
DB_IP="${1:?Uso: bash deploy/deploy-back.sh <IP_PRIVADA_BD>}"
: "${DB_PASSWORD:?Falta DB_PASSWORD}"
: "${JWT_SECRET:?Falta JWT_SECRET}"

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR/backend"
PORT=3003
DB_NAME="ecommerce_db"
APP_USER="app"

command -v node >/dev/null && command -v npm >/dev/null || { echo "Instala nodejs y npm primero"; exit 1; }
[ -f dist/server.js ] || { echo "Falta dist/server.js"; exit 1; }

echo ">> Instalando pm2"
command -v pm2 >/dev/null || sudo npm install -g pm2

echo ">> Dependencias de producción (solo externos)"
npm install --omit=dev

echo ">> Escribiendo .env en $APP_DIR/backend"
ENC_PW="$(DB_PASSWORD="$DB_PASSWORD" node -e 'process.stdout.write(encodeURIComponent(process.env.DB_PASSWORD))')"
umask 077
cat > .env <<ENVEOF
PORT=$PORT
DATABASE_URL=postgresql://$APP_USER:$ENC_PW@$DB_IP:5432/$DB_NAME
JWT_SECRET=$JWT_SECRET
UPLOADS_DIR=$APP_DIR/backend/uploads
ENVEOF
mkdir -p uploads/productos

echo ">> Arrancando con pm2"
pm2 delete api >/dev/null 2>&1 || true
pm2 start dist/server.js --name api --cwd "$APP_DIR/backend"
pm2 save
sleep 2
CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/auth/captcha" || true)"
echo ">> /auth/captcha respondió: $CODE   (si no es 200: pm2 logs api)"
echo ">> IP privada de esta instancia (úsala en deploy-front.sh):"
hostname -I | awk '{print $1}'
