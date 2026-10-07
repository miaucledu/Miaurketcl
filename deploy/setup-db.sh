#!/bin/bash
set -e

echo "=== Setup WEBAPPDDB ==="

sudo apt update
sudo apt install -y postgresql postgresql-contrib

sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD '${DB_PASS}';" 2>/dev/null || echo "Usuario ya existe"
sudo -u postgres psql -c "CREATE DATABASE ecommerce_db OWNER app_user;" 2>/dev/null || echo "DB ya existe"

echo "=== Ejecutando schema.sql ==="
PGPASSWORD=${DB_PASS} psql -h localhost -U app_user -d ecommerce_db -f /home/ubuntu/webapp/backend/schema.sql

echo "=== WEBAPPDDB listo ==="
