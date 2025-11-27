-- ============================================================================
-- SCRIPT DE VERIFICACIÓN: Tabla logs_auditoria
-- ============================================================================
-- Este script verifica que la tabla de logs esté correctamente creada

-- 1. Verificar que la tabla existe
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'logs_auditoria';

-- 2. Verificar las columnas de la tabla
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'logs_auditoria'
ORDER BY ordinal_position;

-- 3. Verificar los índices
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'logs_auditoria';

-- 4. Verificar las políticas RLS
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'logs_auditoria';

-- 5. Verificar si hay datos
SELECT 
  COUNT(*) as total_logs,
  MIN(fecha) as primer_log,
  MAX(fecha) as ultimo_log
FROM logs_auditoria;

-- 6. Ver los últimos 5 logs (si existen)
SELECT 
  id,
  usuario_nombre,
  accion,
  modulo,
  fecha
FROM logs_auditoria
ORDER BY fecha DESC
LIMIT 5;

-- 7. Verificar estadísticas por módulo
SELECT 
  modulo,
  COUNT(*) as cantidad
FROM logs_auditoria
GROUP BY modulo
ORDER BY cantidad DESC;

-- 8. Verificar estadísticas por acción
SELECT 
  accion,
  COUNT(*) as cantidad
FROM logs_auditoria
GROUP BY accion
ORDER BY cantidad DESC;
