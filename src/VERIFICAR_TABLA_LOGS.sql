-- ============================================================================
-- SCRIPT DE VERIFICACIÓN: Tabla logs_auditoria
-- ============================================================================
-- Ejecuta este script en Supabase SQL Editor para verificar si la tabla existe
-- y ver su estructura
-- ============================================================================

-- 1. Verificar si la tabla existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = 'logs_auditoria'
    ) THEN '✅ La tabla logs_auditoria EXISTE'
    ELSE '❌ La tabla logs_auditoria NO EXISTE - Debes ejecutar la migración'
  END AS estado_tabla;

-- 2. Ver la estructura de la tabla (columnas y tipos de datos)
SELECT 
  column_name AS "Columna",
  data_type AS "Tipo de Dato",
  is_nullable AS "Puede ser NULL",
  column_default AS "Valor por Defecto"
FROM information_schema.columns 
WHERE table_name = 'logs_auditoria' 
ORDER BY ordinal_position;

-- 3. Ver los índices de la tabla
SELECT
  indexname AS "Nombre del Índice",
  indexdef AS "Definición"
FROM pg_indexes
WHERE tablename = 'logs_auditoria'
ORDER BY indexname;

-- 4. Contar cuántos logs hay registrados
SELECT 
  COUNT(*) AS "Total de Logs",
  COUNT(DISTINCT usuario_id) AS "Usuarios Distintos",
  COUNT(DISTINCT modulo) AS "Módulos Distintos",
  COUNT(DISTINCT accion) AS "Acciones Distintas",
  MIN(fecha) AS "Primer Log",
  MAX(fecha) AS "Último Log"
FROM logs_auditoria;

-- 5. Ver los últimos 10 logs registrados (si existen)
SELECT 
  fecha,
  usuario_nombre,
  accion,
  modulo,
  entidad_id
FROM logs_auditoria 
ORDER BY fecha DESC 
LIMIT 10;

-- ============================================================================
-- INTERPRETACIÓN DE RESULTADOS:
-- ============================================================================
-- Si ves "✅ La tabla logs_auditoria EXISTE" en el primer resultado:
--   → Todo está bien, la tabla existe
-- 
-- Si ves "❌ La tabla logs_auditoria NO EXISTE":
--   → Debes ejecutar el archivo EJECUTAR_MIGRACION_LOGS_AHORA.sql
--
-- Si ves columnas en el segundo resultado:
--   → La tabla está correctamente estructurada
--
-- Si ves 0 en "Total de Logs":
--   → La tabla existe pero aún no hay logs registrados
--   → Esto es normal si acabas de crear la tabla
--   → Los logs se crearán automáticamente cuando realices acciones
-- ============================================================================
