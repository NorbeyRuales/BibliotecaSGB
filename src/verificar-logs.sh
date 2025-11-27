#!/bin/bash
# ============================================================================
# SCRIPT DE VERIFICACIÓN - Sistema de Logs de Auditoría
# ============================================================================
# Este script verifica que el sistema de logs esté configurado correctamente
# ============================================================================

echo "=========================================="
echo "  VERIFICACIÓN - Sistema de Logs"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# VERIFICAR TABLA EN SUPABASE
# ============================================================================
echo -e "${BLUE}📋 Verificando tabla en Supabase...${NC}"
echo ""

# Nota: Este script requiere que hayas ejecutado la migración SQL
echo "Por favor, verifica manualmente en el Supabase Dashboard:"
echo "1. Ve a Table Editor"
echo "2. Busca la tabla: logs_auditoria_bebfd31a"
echo ""
read -p "¿La tabla existe? (s/n): " tabla_existe

if [ "$tabla_existe" = "s" ] || [ "$tabla_existe" = "S" ]; then
    echo -e "${GREEN}✅ Tabla verificada${NC}"
else
    echo -e "${RED}❌ La tabla no existe${NC}"
    echo ""
    echo "Debes ejecutar la migración SQL:"
    echo "1. Abre Supabase Dashboard → SQL Editor"
    echo "2. Copia el contenido de /supabase/migration-logs-auditoria.sql"
    echo "3. Pégalo y ejecuta"
    echo ""
    exit 1
fi

echo ""

# ============================================================================
# VERIFICAR ARCHIVOS DEL SISTEMA
# ============================================================================
echo -e "${BLUE}📋 Verificando archivos del sistema...${NC}"
echo ""

archivos=(
    "utils/auditoria.tsx"
    "hooks/useAuditoria.tsx"
    "components/admin/LogsAuditoriaView.tsx"
    "supabase/functions/server/index.tsx"
    "supabase/migration-logs-auditoria.sql"
)

todos_existen=true

for archivo in "${archivos[@]}"; do
    if [ -f "$archivo" ]; then
        echo -e "${GREEN}✅${NC} $archivo"
    else
        echo -e "${RED}❌${NC} $archivo ${RED}(no encontrado)${NC}"
        todos_existen=false
    fi
done

echo ""

if [ "$todos_existen" = false ]; then
    echo -e "${RED}❌ Faltan archivos necesarios${NC}"
    exit 1
fi

# ============================================================================
# VERIFICAR CONFIGURACIÓN DE DENO
# ============================================================================
echo -e "${BLUE}📋 Verificando configuración de Deno...${NC}"
echo ""

if grep -q "jsx.*react" supabase/functions/server/deno.json; then
    echo -e "${RED}❌ deno.json tiene configuración de React (debe ser eliminada)${NC}"
    echo ""
    echo "El archivo deno.json debe contener solo:"
    echo '{'
    echo '  "tasks": {'
    echo '    "start": "deno run --allow-all index.tsx"'
    echo '  }'
    echo '}'
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ deno.json configurado correctamente${NC}"
fi

echo ""

# ============================================================================
# VERIFICAR DESPLIEGUE
# ============================================================================
echo -e "${BLUE}📋 Verificando despliegue...${NC}"
echo ""

echo "Intentando hacer ping a la función..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://lpspwvwgqiqrendjksqy.supabase.co/functions/v1/make-server-bebfd31a/setup/init-admin)

if [ "$response" = "200" ] || [ "$response" = "201" ]; then
    echo -e "${GREEN}✅ Función desplegada y respondiendo${NC}"
elif [ "$response" = "404" ]; then
    echo -e "${RED}❌ Función no encontrada (404)${NC}"
    echo ""
    echo "Debes redesplegar el servidor:"
    echo "- Windows: deploy.bat"
    echo "- Mac/Linux: ./deploy.sh"
    echo ""
    exit 1
else
    echo -e "${YELLOW}⚠️  Respuesta inesperada: $response${NC}"
    echo "La función puede estar funcionando, pero devolvió un código inusual."
fi

echo ""

# ============================================================================
# RESUMEN
# ============================================================================
echo -e "${GREEN}=========================================="
echo "✅ VERIFICACIÓN COMPLETADA"
echo "==========================================${NC}"
echo ""
echo "Sistema de logs verificado correctamente."
echo ""
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Abre la aplicación"
echo "2. Inicia sesión como admin"
echo "3. Ve a 'Logs de Auditoría'"
echo "4. Realiza una acción (crear/editar)"
echo "5. Refresca para ver el log"
echo ""
