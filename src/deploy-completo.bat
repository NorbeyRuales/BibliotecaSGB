@echo off
REM ============================================================================
REM SCRIPT DE DESPLIEGUE COMPLETO - SISTEMA DE GESTIÓN DE BIBLIOTECA (WINDOWS)
REM ============================================================================
REM Este script verifica y despliega todo el sistema automáticamente
REM ============================================================================

echo.
echo ========================================
echo INICIANDO DESPLIEGUE COMPLETO DEL SISTEMA
echo ========================================
echo.

set PROJECT_ID=lpspwvwgqiqrendjksqy
set FUNCTION_NAME=make-server-bebfd31a
set FUNCTION_URL=https://%PROJECT_ID%.supabase.co/functions/v1/%FUNCTION_NAME%

REM ============================================================================
REM 1. VERIFICAR ESTRUCTURA DE ARCHIVOS
REM ============================================================================
echo.
echo [PASO 1] Verificando estructura de archivos...
echo ------------------------------------------------

if not exist "supabase\functions\%FUNCTION_NAME%" (
  echo [ERROR] Carpeta supabase\functions\%FUNCTION_NAME% no existe
  exit /b 1
)
echo [OK] Carpeta principal existe

if not exist "supabase\functions\%FUNCTION_NAME%\index.tsx" (
  echo [ERROR] index.tsx no existe
  exit /b 1
)
echo [OK] index.tsx existe

if not exist "supabase\functions\%FUNCTION_NAME%\kv_store.tsx" (
  echo [ERROR] kv_store.tsx no existe
  exit /b 1
)
echo [OK] kv_store.tsx existe

if not exist "supabase\functions\%FUNCTION_NAME%\deno.json" (
  echo [ERROR] deno.json no existe
  exit /b 1
)
echo [OK] deno.json existe

REM ============================================================================
REM 2. VERIFICAR CONFIGURACIÓN
REM ============================================================================
echo.
echo [PASO 2] Verificando configuracion...
echo --------------------------------------

if not exist "supabase\config.toml" (
  echo [ERROR] config.toml no existe
  exit /b 1
)
echo [OK] config.toml existe

findstr /C:"[functions.%FUNCTION_NAME%]" supabase\config.toml >nul
if %errorlevel% equ 0 (
  echo [OK] config.toml esta configurado para %FUNCTION_NAME%
) else (
  echo [ERROR] config.toml NO esta configurado para %FUNCTION_NAME%
  exit /b 1
)

REM ============================================================================
REM 3. VERIFICAR SUPABASE CLI
REM ============================================================================
echo.
echo [PASO 3] Verificando Supabase CLI...
echo -------------------------------------

where supabase >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Supabase CLI no esta instalado
  echo Instala con: npm install -g supabase
  exit /b 1
)
echo [OK] Supabase CLI instalado

REM ============================================================================
REM 4. DESPLEGAR EDGE FUNCTION
REM ============================================================================
echo.
echo [PASO 4] Desplegando Edge Function...
echo --------------------------------------

supabase functions deploy %FUNCTION_NAME% --no-verify-jwt

if %errorlevel% neq 0 (
  echo [ERROR] Fallo el despliegue
  exit /b 1
)

echo [OK] Edge Function desplegada exitosamente

REM ============================================================================
REM 5. VERIFICAR QUE LA FUNCIÓN RESPONDA
REM ============================================================================
echo.
echo [PASO 5] Verificando que la funcion responda...
echo -----------------------------------------------
echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

curl -s -o nul -w "HTTP %%{http_code}" "%FUNCTION_URL%/public/libros"
echo.

REM ============================================================================
REM 6. INICIALIZAR ADMINISTRADOR
REM ============================================================================
echo.
echo [PASO 6] Inicializando administrador...
echo ---------------------------------------

curl -X POST "%FUNCTION_URL%/setup/init-admin" -H "Content-Type: application/json"
echo.

REM ============================================================================
REM 7. INFORMACIÓN FINAL
REM ============================================================================
echo.
echo ========================================
echo DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo URLs IMPORTANTES:
echo   - Funcion: %FUNCTION_URL%
echo   - Dashboard: https://supabase.com/dashboard/project/%PROJECT_ID%
echo   - SQL Editor: https://supabase.com/dashboard/project/%PROJECT_ID%/sql
echo.
echo CREDENCIALES DEL ADMINISTRADOR:
echo   - Email: admin@biblioteca.com
echo   - Password: admin123
echo   - Identificacion: 0000000000
echo.
echo PROXIMOS PASOS:
echo   1. Ejecuta el SQL de crear-kv-store.sql en el SQL Editor
echo   2. Abre la aplicacion en el navegador
echo   3. Inicia sesion con las credenciales del administrador
echo.
echo ========================================
echo.

pause
