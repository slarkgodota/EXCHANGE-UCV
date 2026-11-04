#!/usr/bin/env bash
echo "================================================================="
echo "  EXCHANGE UCV - PLATAFORMA ACADÉMICA COLABORATIVA (GRUPO 5)"
echo "  Ejecución para Mac / Linux (Con y Sin Internet)"
echo "================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado. Instálalo desde https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Instalando paquetes del proyecto..."
    npm install
fi

echo ""
echo "[2/2] Iniciando servidor local en http://localhost:3000..."
echo ""
echo "Cualquier persona puede crear su cuenta desde la pagina (boton Crear cuenta)."
echo ""

# Abrir navegador según SO
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000 &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 &> /dev/null &
fi

npm run dev
