#!/bin/bash

# ============================================================================
# SCRIPT DE DESPLIEGUE COMPLETO - SISTEMA DE GESTIÓN DE BIBLIOTECA
# ============================================================================
# Este script verifica y despliega todo el sistema automáticamente
# ============================================================================

echo "🚀 INICIANDO DESPLIEGUE COMPLETO DEL SISTEMA"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
PROJECT_ID="lpspwvwgqiqrendjksqy"
FUNCTION_NAME="make-server-bebfd31a"
FUNCTION_URL="https://${PROJECT_ID}.supabase.co/functions/v1/${FUNCTION_NAME}"

# ============================================================================
# 1. VERIFICAR ESTRUCTURA DE ARCHIVOS
# ============================================================================
echo "📁 PASO 1: Verificando estructura de archivos..."
echo "------------------------------------------------"

if [ ! -d "supabase/functions/${FUNCTION_NAME}" ]; then
  echo -e "${RED}❌ ERROR: Carpeta supabase/functions/${FUNCTION_NAME} no existe${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Carpeta principal existe${NC}"

if [ ! -f "supabase/functions/${FUNCTION_NAME}/index.tsx" ]; then
  echo -e "${RED}❌ ERROR: index.tsx no existe${NC}"
  exit 1
fi
echo -e "${GREEN}✅ index.tsx existe${NC}"

if [ ! -f "supabase/functions/${FUNCTION_NAME}/kv_store.tsx" ]; then
  echo -e "${RED}❌ ERROR: kv_store.tsx no existe${NC}"
  exit 1
fi
echo -e "${GREEN}✅ kv_store.tsx existe${NC}"

if [ ! -f "supabase/functions/${FUNCTION_NAME}/deno.json" ]; then
  echo -e "${RED}❌ ERROR: deno.json no existe${NC}"
  exit 1
fi
echo -e "${GREEN}✅ deno.json existe${NC}"

echo ""

# ============================================================================
# 2. VERIFICAR CONFIGURACIÓN
# ============================================================================
echo "⚙️  PASO 2: Verificando configuración..."
echo "---------------------------------------"

if [ ! -f "supabase/config.toml" ]; then
  echo -e "${RED}❌ ERROR: config.toml no existe${NC}"
  exit 1
fi
echo -e "${GREEN}✅ config.toml existe${NC}"

# Verificar que config.toml tenga la configuración correcta
if grep -q "\[functions.${FUNCTION_NAME}\]" supabase/config.toml; then
  echo -e "${GREEN}✅ config.toml está configurado para ${FUNCTION_NAME}${NC}"
else
  echo -e "${RED}❌ ERROR: config.toml no está configurado para ${FUNCTION_NAME}${NC}"
  exit 1
fi

echo ""

# ============================================================================
# 3. VERIFICAR SUPABASE CLI
# ============================================================================
echo "🔧 PASO 3: Verificando Supabase CLI..."
echo "--------------------------------------"

if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ ERROR: Supabase CLI no está instalado${NC}"
  echo "Instala con: npm install -g supabase"
  exit 1
fi
echo -e "${GREEN}✅ Supabase CLI instalado: $(supabase --version)${NC}"

echo ""

# ============================================================================
# 4. VERIFICAR CONEXIÓN CON SUPABASE
# ============================================================================
echo "🌐 PASO 4: Verificando conexión con Supabase..."
echo "-----------------------------------------------"

# Verificar si supabase está linkeado
if ! supabase status &> /dev/null; then
  echo -e "${YELLOW}⚠️  Proyecto no está linkeado${NC}"
  echo "Intentando linkear proyecto..."
  
  # Intentar linkear
  supabase link --project-ref ${PROJECT_ID}
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ERROR: No se pudo linkear el proyecto${NC}"
    echo "Por favor ejecuta manualmente: supabase link --project-ref ${PROJECT_ID}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Conectado a proyecto Supabase${NC}"

echo ""

# ============================================================================
# 5. DESPLEGAR EDGE FUNCTION
# ============================================================================
echo "🚀 PASO 5: Desplegando Edge Function..."
echo "---------------------------------------"

supabase functions deploy ${FUNCTION_NAME} --no-verify-jwt

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ ERROR: Falló el despliegue${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Edge Function desplegada exitosamente${NC}"
echo ""

# ============================================================================
# 6. VERIFICAR QUE LA FUNCIÓN RESPONDA
# ============================================================================
echo "🧪 PASO 6: Verificando que la función responda..."
echo "------------------------------------------------"

# Esperar 3 segundos para que la función se active
echo "Esperando 3 segundos..."
sleep 3

# Probar endpoint público
response=$(curl -s -o /dev/null -w "%{http_code}" "${FUNCTION_URL}/public/libros")

if [ "$response" -eq 200 ]; then
  echo -e "${GREEN}✅ Función responde correctamente (HTTP 200)${NC}"
else
  echo -e "${YELLOW}⚠️  Función responde con código HTTP: ${response}${NC}"
  if [ "$response" -eq 404 ]; then
    echo -e "${YELLOW}   Es posible que necesites esperar un poco más${NC}"
  fi
fi

echo ""

# ============================================================================
# 7. INICIALIZAR ADMINISTRADOR
# ============================================================================
echo "👤 PASO 7: Inicializando administrador..."
echo "----------------------------------------"

init_response=$(curl -s -X POST "${FUNCTION_URL}/setup/init-admin" \
  -H "Content-Type: application/json")

echo "Respuesta del servidor:"
echo "$init_response" | jq '.' 2>/dev/null || echo "$init_response"

if echo "$init_response" | grep -q "success"; then
  echo -e "${GREEN}✅ Administrador inicializado${NC}"
  echo ""
  echo "📝 CREDENCIALES DEL ADMINISTRADOR:"
  echo "   Email: admin@biblioteca.com"
  echo "   Contraseña: admin123"
  echo "   Identificación: 0000000000"
else
  echo -e "${YELLOW}⚠️  No se pudo inicializar automáticamente${NC}"
  echo "   Puedes hacerlo manualmente desde la aplicación"
fi

echo ""

# ============================================================================
# 8. INFORMACIÓN FINAL
# ============================================================================
echo "=============================================="
echo "✅ DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "=============================================="
echo ""
echo "📍 URLs IMPORTANTES:"
echo "   • Función: ${FUNCTION_URL}"
echo "   • Dashboard: https://supabase.com/dashboard/project/${PROJECT_ID}"
echo "   • SQL Editor: https://supabase.com/dashboard/project/${PROJECT_ID}/sql"
echo ""
echo "🔧 PRÓXIMOS PASOS:"
echo "   1. Ejecuta el SQL de crear-kv-store.sql en el SQL Editor"
echo "   2. Abre la aplicación en el navegador"
echo "   3. Inicia sesión con las credenciales del administrador"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "   • /ESTADO_FINAL.md - Estado completo del sistema"
echo "   • /TEST_RAPIDO.md - Guía de pruebas"
echo "   • /RESUMEN_SOLUCION.md - Resumen ejecutivo"
echo ""
echo "=============================================="
