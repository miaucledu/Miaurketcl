#!/bin/bash
set -e

echo "=== Migrando base de datos ==="

cd /home/ubuntu/webapp/backend

PGPASSWORD=$(grep DATABASE_URL .env | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') \
  psql -h $(grep DATABASE_URL .env | sed 's/.*@\([^:]*\):.*/\1/') \
  -U $(grep DATABASE_URL .env | sed 's/.*:\/\/\([^:]*\):.*/\1/') \
  -d $(grep DATABASE_URL .env | sed 's/.*:\/\/[^\/]*\/\(.*\)/\1/') \
  -f schema.sql

echo "=== Migracion completada ==="
