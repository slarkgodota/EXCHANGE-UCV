@echo off
chcp 65001 > nul
title Exchange UCV - Universidad César Vallejo
echo =================================================================
echo   EXCHANGE UCV - PLATAFORMA ACADÉMICA COLABORATIVA (GRUPO 5)
echo   Ejecución para PC (Funciona Con y Sin Internet)
echo =================================================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontró Node.js en tu sistema.
    echo Por favor descarga e instala Node.js gratis desde: https://nodejs.org/
    echo Luego de instalarlo, vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b
)

:: Instalar dependencias si no existen
if not exist node_modules (
    echo [1/2] Instalando paquetes necesarios (solo la primera vez con internet)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Ocurrió un error al instalar dependencias.
        pause
        exit /b
    )
)

echo.
echo [2/2] Iniciando plataforma local en el puerto 3000...
echo.
echo Cualquier persona puede crear su cuenta desde la pagina (boton Crear cuenta).
echo.
echo Abriendo tu navegador...
timeout /t 2 >nul
start http://localhost:3000

call npm run dev
pause
