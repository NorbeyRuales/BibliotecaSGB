@echo off
REM ============================================================================
REM SCRIPT DE DESPLIEGUE AUTOMATIZADO - SISTEMA DE GESTIÓN DE BIBLIOTECA
REM ============================================================================
REM Script para Windows (.bat) que automatiza el despliegue de funciones Edge
REM Bypasea el error 403 que ocurre al desplegar desde Figma Make
REM Utiliza la CLI de Supabase para despliegue directo
REM ============================================================================

REM Mostrar encabezado del script
echo ==========================================
echo    DESPLIEGUE - Sistema de Biblioteca
echo ==========================================
echo.

REM ============================================================================
REM PASO 1: VERIFICACIÓN DE PREREQUISITOS - SUPABASE CLI
REM ============================================================================
echo [Paso 1] Verificando Supabase CLI...

REM Verificar si el comando 'supabase' existe en el PATH
REM Redirigir salida estándar (>nul) y errores (2>nul) para silenciar el comando
where supabase >nul 2>nul

REM Verificar el código de error del comando anterior
if %errorlevel% neq 0 (
    REM CLI no encontrado - mostrar advertencia
    echo WARNING: Supabase CLI no esta instalado.
    echo.
    echo Instalando Supabase CLI...
    
    REM Intentar instalar Supabase CLI globalmente via npm
    call npm install -g supabase
    
    REM Verificar el código de salida de la instalación
    if %errorlevel% equ 0 (
        REM Instalación exitosa
        echo OK: Supabase CLI instalado correctamente
    ) else (
        REM Instalación falló - mostrar error y terminar
        echo ERROR: No se pudo instalar Supabase CLI
        echo Instalalo manualmente con: npm install -g supabase
        pause
        exit /b 1
    )
)

REM CLI ya está instalado - continuar
echo OK: Supabase CLI encontrado
echo.

REM ============================================================================
REM PASO 2: AUTENTICACIÓN CON SUPABASE
REM ============================================================================
echo [Paso 2] Autenticando con Supabase...
echo.
echo Abriendo navegador para login...

REM Iniciar proceso de login interactivo (abre navegador)
call supabase login

REM Verificar si el login fue exitoso
if %errorlevel% neq 0 (
    REM Login falló - mostrar error y terminar
    echo ERROR: No se pudo autenticar
    pause
    exit /b 1
)

REM Autenticación exitosa - continuar
echo OK: Autenticacion exitosa
echo.

REM ============================================================================
REM PASO 3: CONEXIÓN AL PROYECTO DE SUPABASE
REM ============================================================================
echo [Paso 3] Conectando al proyecto...

REM Vincular directorio local con proyecto remoto de Supabase
REM lpspwvwgqiqrendjksqy = ID del proyecto en Supabase
call supabase link --project-ref lpspwvwgqiqrendjksqy

REM Proyecto conectado (ignorar errores si ya estaba conectado)
echo OK: Proyecto conectado
echo.

REM ============================================================================
REM PASO 4: DESPLIEGUE DE FUNCIÓN EDGE
REM ============================================================================
echo [Paso 4] Desplegando funcion Edge...
echo.

REM Navegar al directorio que contiene las funciones Edge
cd supabase

REM Desplegar la función 'server' a Supabase
REM --no-verify-jwt: Desactiva verificación JWT (permite acceso público)
call supabase functions deploy server --no-verify-jwt

REM ============================================================================
REM VERIFICACIÓN DEL RESULTADO DEL DESPLIEGUE
REM ============================================================================
REM Verificar el código de error del comando de despliegue
if %errorlevel% equ 0 (
    REM ========================================================================
    REM DESPLIEGUE EXITOSO
    REM ========================================================================
    echo.
    echo ==========================================
    echo OK: DESPLIEGUE EXITOSO
    echo ==========================================
    echo.
    echo La funcion 'server' ha sido desplegada correctamente.
    echo.
    
    REM Mostrar URL de la función desplegada
    echo URL de la funcion:
    echo https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a
    echo.
    
    REM Instrucciones para inicializar el sistema
    echo [Siguiente paso]
    echo Inicializa el sistema abriendo esta URL en tu navegador:
    echo https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a/setup/init-admin
    echo.
    
    REM Mostrar credenciales del administrador por defecto
    echo Credenciales del admin:
    echo Email: admin@biblioteca.com
    echo Password: admin123
    echo.
) else (
    REM ========================================================================
    REM DESPLIEGUE FALLÓ
    REM ========================================================================
    echo.
    echo ==========================================
    echo ERROR: FALLO EL DESPLIEGUE
    echo ==========================================
    echo.
    
    REM Listar posibles causas del error
    echo El despliegue fallo. Posibles causas:
    echo 1. No tienes permisos en el proyecto
    echo 2. La contrasena de la base de datos es incorrecta
    echo 3. Hay un problema de red
    echo.
    
    REM Mostrar comando para intentar manualmente
    echo Intenta ejecutar manualmente:
    echo   cd supabase
    echo   supabase functions deploy server
    echo.
)

REM Volver al directorio raíz
cd ..

REM Pausar para que el usuario pueda leer los resultados
pause
