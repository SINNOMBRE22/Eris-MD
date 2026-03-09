#!/bin/bash

echo "--- 🚀 Iniciando configuración automática de PM2 ---"

# 1. Instalar PM2 globalmente si no existe
if ! command -v pm2 &> /dev/null
then
    echo "[1/4] Instalando PM2..."
    npm install -g pm2
else
    echo "[1/4] PM2 ya está instalado."
fi

# 2. Iniciar el bot (si ya existe uno con el mismo nombre, lo reinicia)
echo "[2/4] Iniciando index.js con el nombre 'eris-bot'..."
pm2 start index.js --name "eris-bot"

# 3. Configurar el inicio automático con el sistema
echo "[3/4] Configurando el inicio automático (startup)..."
# Este comando detecta el sistema y genera la línea necesaria
pm2 startup | grep "sudo" | bash

# 4. Guardar el estado actual
echo "[4/4] Guardando procesos actuales para reinicios..."
pm2 save

echo "----------------------------------------------------"
echo "✅ ¡Listo! Tu bot 'eris-bot' ya está corriendo y protegido contra reinicios."
echo "Usa 'pm2 logs' para ver la actividad."
echo "----------------------------------------------------"
