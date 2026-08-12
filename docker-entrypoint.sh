#!/bin/sh
set -e

echo "Aplicando migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Garantindo usuário admin (SEED_ADMIN_PHONE)..."
node prisma/seed.mjs

echo "Iniciando servidor..."
exec node server.js
