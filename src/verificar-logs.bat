@echo off
REM ============================================================================
REM SCRIPT DE VERIFICACIÓN - Sistema de Logs de Auditoría (Windows)
REM ============================================================================
REM Este script verifica que el sistema de logs esté configurado correctamente
REM ============================================================================

echo ==========================================
echo   VERIFICACIÓN - Sistema de Logs
echo ==========================================
echo.

REM ============================================================================
REM VERIFICAR ARCHIVOS DEL SISTEMA
REM ============================================================================
echo [94m📋 Verificando archivos del sistema...[0m
echo.

set archivos_ok=true

if exist "utils\auditoria.tsx" (
    echo [92m✓[0m utils\auditoria.tsx
) else (
    echo [91m✗[0m utils\auditoria.tsx [91m^(no encontrado^)[0m
    set archivos_ok=false
)

if exist "hooks\useAuditoria.tsx" (
    echo [92m✓[0m hooks\useAuditoria.tsx
) else (
    echo [91m✗[0m hooks\useAuditoria.tsx [91m^(no encontrado^)[0m
    set archivos_ok=false
)

if exist "components\admin\LogsAuditoriaView.tsx" (
    echo [92m✓[0m components\admin\LogsAuditoriaView.tsx
) else (
    echo [91m✗[0m components\admin\LogsAuditoriaView.tsx [91m^(no encontrado^)[0m
    set archivos_ok=false
)

if exist "supabase\functions\server\index.tsx" (
    echo [92m✓[0m supabase\functions\server\index.tsx
) else (
    echo [91m✗[0m supabase\functions\server\index.tsx [91m^(no encontrado^)[0m
    set archivos_ok=false
)

if exist "supabase\migration-logs-auditoria.sql" (
    echo [92m✓[0m supabase\migration-logs-auditoria.sql
) else (
    echo [91m✗[0m supabase\migration-logs-auditoria.sql [91m^(no encontrado^)[0m
    set archivos_ok=false
)

echo.

if "%archivos_ok%"=="false" (
    echo [91m✗ Faltan archivos necesarios[0m
    pause
    exit /b 1
)

REM ============================================================================
REM VERIFICAR CONFIGURACIÓN DE DENO
REM ============================================================================
echo [94m📋 Verificando configuración de Deno...[0m
echo.

findstr /C:"jsx" /C:"react" supabase\functions\server\deno.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [91m✗ deno.json tiene configuración de React ^(debe ser eliminada^)[0m
    echo.
    echo El archivo deno.json debe contener solo:
    echo {
    echo   "tasks": {
    echo     "start": "deno run --allow-all index.tsx"
    echo   }
    echo }
    echo.
    pause
    exit /b 1
) else (
    echo [92m✓ deno.json configurado correctamente[0m
)

echo.

REM ============================================================================
REM VERIFICAR TABLA EN SUPABASE
REM ============================================================================
echo [94m📋 Verificando tabla en Supabase...[0m
echo.

echo Por favor, verifica manualmente en el Supabase Dashboard:
echo 1. Ve a Table Editor
echo 2. Busca la tabla: logs_auditoria_bebfd31a
echo.
set /p tabla_existe="¿La tabla existe? (s/n): "

if /i "%tabla_existe%"=="n" (
    echo.
    echo [91m✗ La tabla no existe[0m
    echo.
    echo Debes ejecutar la migración SQL:
    echo 1. Abre Supabase Dashboard → SQL Editor
    echo 2. Copia el contenido de supabase\migration-logs-auditoria.sql
    echo 3. Pégalo y ejecuta
    echo.
    pause
    exit /b 1
)

echo [92m✓ Tabla verificada[0m
echo.

REM ============================================================================
REM VERIFICAR DESPLIEGUE
REM ============================================================================
echo [94m📋 Verificando despliegue...[0m
echo.

echo Intentando hacer ping a la función...
curl -s -o nul -w "%%{http_code}" https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a/setup/init-admin > temp_status.txt 2>nul
set /p response=<temp_status.txt
del temp_status.txt >nul 2>&1

if "%response%"=="200" (
    echo [92m✓ Función desplegada y respondiendo[0m
) else if "%response%"=="201" (
    echo [92m✓ Función desplegada y respondiendo[0m
) else if "%response%"=="404" (
    echo [91m✗ Función no encontrada ^(404^)[0m
    echo.
    echo Debes redesplegar el servidor:
    echo   deploy.bat
    echo.
    pause
    exit /b 1
) else (
    echo [93m⚠ Respuesta inesperada: %response%[0m
    echo La función puede estar funcionando, pero devolvió un código inusual.
)

echo.

REM ============================================================================
REM RESUMEN
REM ============================================================================
echo [92m==========================================
echo ✓ VERIFICACIÓN COMPLETADA
echo ==========================================[0m
echo.
echo Sistema de logs verificado correctamente.
echo.
echo [94mPróximos pasos:[0m
echo 1. Abre la aplicación
echo 2. Inicia sesión como admin
echo 3. Ve a 'Logs de Auditoría'
echo 4. Realiza una acción ^(crear/editar^)
echo 5. Refresca para ver el log
echo.
pause
