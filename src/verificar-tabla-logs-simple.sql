-- ============================================================================
-- SCRIPT DE VERIFICACIÓN: Tabla logs_auditoria
-- ============================================================================
-- Ejecuta esto en el SQL Editor de Supabase para verificar si la tabla existe
-- ============================================================================

-- 1. Verificar si la tabla existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'logs_auditoria'
    ) 
    THEN '✅ La tabla logs_auditoria EXISTE'
    ELSE '❌ La tabla logs_auditoria NO EXISTE - Debes ejecutar migration-logs-auditoria-v2.sql'
  END AS estado_tabla;

-- 2. Si existe, mostrar las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'logs_auditoria'
ORDER BY ordinal_position;

-- 3. Si existe, contar cuántos logs hay
SELECT COUNT(*) as total_logs FROM logs_auditoria;

-- 4. Si existen logs, mostrar los 5 más recientes
SELECT 
  id, 
  usuario_nombre, 
  accion, 
  modulo, 
  fecha
FROM logs_auditoria
ORDER BY fecha DESC
LIMIT 5;
