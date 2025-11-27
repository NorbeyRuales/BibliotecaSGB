#!/bin/bash
# ============================================================================
# SCRIPT DE DESPLIEGUE AUTOMATIZADO - SISTEMA DE GESTIÓN DE BIBLIOTECA
# ============================================================================
# Este script automatiza el despliegue de funciones Edge de Supabase
# Bypasea el error 403 que ocurre al desplegar desde Figma Make
# Utiliza la CLI de Supabase para despliegue directo
# ============================================================================

# Mostrar encabezado del script
echo "=========================================="
echo "   DESPLIEGUE - Sistema de Biblioteca"
echo "=========================================="
echo ""

# ============================================================================
# CONFIGURACIÓN DE COLORES PARA TERMINAL
# ============================================================================
# Definir códigos ANSI para texto coloreado en terminal
GREEN='\033[0;32m'    # Verde para mensajes de éxito
BLUE='\033[0;34m'     # Azul para pasos informativos
RED='\033[0;31m'      # Rojo para mensajes de error
YELLOW='\033[1;33m'   # Amarillo para advertencias
NC='\033[0m'          # Sin color (reset)

# ============================================================================
# VERIFICACIÓN DE PREREQUISITOS - SUPABASE CLI
# ============================================================================
# Verificar si Supabase CLI está instalado en el sistema
if ! command -v supabase &> /dev/null
then
    # CLI no encontrado - mostrar advertencia
    echo -e "${YELLOW}⚠️  Supabase CLI no está instalado.${NC}"
    echo ""
    echo "Instalando Supabase CLI..."
    
    # Intentar instalar Supabase CLI globalmente via npm
    npm install -g supabase
    
    # Verificar el código de salida del comando anterior
    if [ $? -eq 0 ]; then
        # Instalación exitosa
        echo -e "${GREEN}✅ Supabase CLI instalado correctamente${NC}"
    else
        # Instalación falló - mostrar error y terminar
        echo -e "${RED}❌ Error al instalar Supabase CLI${NC}"
        echo "Instálalo manualmente con: npm install -g supabase"
        exit 1  # Salir con código de error
    fi
fi

# ============================================================================
# PASO 1: VERIFICACIÓN DE AUTENTICACIÓN
# ============================================================================
echo -e "${BLUE}📋 Paso 1: Verificando autenticación...${NC}"

# Intentar listar proyectos para verificar si hay sesión activa
# Redirigir salida estándar y errores a /dev/null para silenciar el comando
supabase projects list &> /dev/null

# Verificar el código de salida del comando anterior
if [ $? -ne 0 ]; then
    # No está autenticado - mostrar advertencia
    echo -e "${YELLOW}⚠️  No estás autenticado en Supabase${NC}"
    echo ""
    echo "Abriendo navegador para login..."
    
    # Iniciar proceso de login interactivo (abre navegador)
    supabase login
    
    # Verificar si el login fue exitoso
    if [ $? -ne 0 ]; then
        # Login falló - mostrar error y terminar
        echo -e "${RED}❌ Error al hacer login${NC}"
        exit 1  # Salir con código de error
    fi
fi

# Autenticación verificada - continuar
echo -e "${GREEN}✅ Autenticación verificada${NC}"
echo ""

# ============================================================================
# PASO 2: CONEXIÓN AL PROYECTO DE SUPABASE
# ============================================================================
echo -e "${BLUE}📋 Paso 2: Conectando al proyecto...${NC}"

# Vincular directorio local con proyecto remoto de Supabase
# lpspwvwgqiqrendjksqy = ID del proyecto en Supabase
supabase link --project-ref lpspwvwgqiqrendjksqy

# Verificar el código de salida del comando de vinculación
if [ $? -eq 0 ]; then
    # Vinculación exitosa
    echo -e "${GREEN}✅ Proyecto conectado${NC}"
else
    # Ya estaba vinculado (no es error crítico)
    echo -e "${YELLOW}⚠️  Proyecto ya estaba conectado${NC}"
fi

echo ""

# ============================================================================
# PASO 3: DESPLIEGUE DE FUNCIÓN EDGE
# ============================================================================
echo -e "${BLUE}📋 Paso 3: Desplegando función Edge...${NC}"
echo ""

# Navegar al directorio que contiene las funciones Edge
cd supabase

# Desplegar la función 'server' a Supabase
# --no-verify-jwt: Desactiva verificación JWT (permite acceso público)
supabase functions deploy server --no-verify-jwt

# ============================================================================
# VERIFICACIÓN DEL RESULTADO DEL DESPLIEGUE
# ============================================================================
# Verificar el código de salida del comando de despliegue
if [ $? -eq 0 ]; then
    # ========================================================================
    # DESPLIEGUE EXITOSO
    # ========================================================================
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ DESPLIEGUE EXITOSO"
    echo "==========================================${NC}"
    echo ""
    echo "La función 'server' ha sido desplegada correctamente."
    echo ""
    
    # Mostrar URL de la función desplegada
    echo "URL de la función:"
    echo "https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a"
    echo ""
    
    # Instrucciones para inicializar el sistema
    echo -e "${BLUE}📋 Siguiente paso:${NC}"
    echo "Inicializa el sistema abriendo esta URL en tu navegador:"
    echo "https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a/setup/init-admin"
    echo ""
    
    # Mostrar credenciales del administrador por defecto
    echo "Credenciales del admin:"
    echo "Email: admin@biblioteca.com"
    echo "Password: admin123"
    echo ""
else
    # ========================================================================
    # DESPLIEGUE FALLÓ
    # ========================================================================
    echo ""
    echo -e "${RED}=========================================="
    echo "❌ ERROR EN EL DESPLIEGUE"
    echo "==========================================${NC}"
    echo ""
    
    # Listar posibles causas del error
    echo "El despliegue falló. Posibles causas:"
    echo "1. No tienes permisos en el proyecto"
    echo "2. La contraseña de la base de datos es incorrecta"
    echo "3. Hay un problema de red"
    echo ""
    
    # Mostrar comando para intentar manualmente
    echo "Intenta ejecutar manualmente:"
    echo "  cd supabase"
    echo "  supabase functions deploy server"
    echo ""
    
    # Salir con código de error
    exit 1
fi
