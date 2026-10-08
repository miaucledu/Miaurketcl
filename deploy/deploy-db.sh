#!/usr/bin/env bash
set -euo pipefail
: "${DB_PASSWORD:?Falta DB_PASSWORD (export DB_PASSWORD=...)}"

APP_USER="app"
DB_NAME="ecommerce_db"
VPC_CIDR="172.31.0.0/16"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="${SCHEMA_FILE:-$DIR/../backend/schema.sql}"

echo ">> Instalando PostgreSQL"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib

PG_VER="$(ls /etc/postgresql | sort -V | tail -1)"
CONF="/etc/postgresql/$PG_VER/main/postgresql.conf"
HBA="/etc/postgresql/$PG_VER/main/pg_hba.conf"
echo ">> Versión detectada: $PG_VER"

echo ">> Configurando listen_addresses y pg_hba.conf"
sudo sed -i "s/^#\?listen_addresses.*/listen_addresses = '*'/" "$CONF"
RULE="host    $DB_NAME    $APP_USER    $VPC_CIDR    scram-sha-256"
sudo grep -qF "$RULE" "$HBA" || echo "$RULE" | sudo tee -a "$HBA" >/dev/null
sudo systemctl restart postgresql

echo ">> Usuario y base de datos"
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$APP_USER'" | grep -q 1; then
  echo "ALTER ROLE $APP_USER LOGIN PASSWORD :'pw';" | sudo -u postgres psql -v ON_ERROR_STOP=1 -v pw="$DB_PASSWORD"
else
  echo "CREATE ROLE $APP_USER LOGIN PASSWORD :'pw';" | sudo -u postgres psql -v ON_ERROR_STOP=1 -v pw="$DB_PASSWORD"
fi
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || sudo -u postgres createdb -O "$APP_USER" "$DB_NAME"

echo ">> Migración"
TABLES="$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$APP_USER" -d "$DB_NAME" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")"
if [ "$TABLES" = "0" ]; then
  [ -f "$SCHEMA_FILE" ] || { echo "No encuentro $SCHEMA_FILE"; exit 1; }
  PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$APP_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"
else
  echo "La BD ya tiene $TABLES tablas; no se vuelve a migrar."
fi

echo ">> Listo. IP privada de esta instancia (úsala en deploy-back.sh):"
hostname -I | awk '{print $1}'
echo ">> Evidencia:  PGPASSWORD=\$DB_PASSWORD psql -h localhost -U $APP_USER -d $DB_NAME -c '\\dt'"
