-- ============================================================================
-- CREAR TABLA KV_STORE_BEBFD31A
-- ============================================================================
-- Esta tabla es necesaria para que el backend funcione correctamente
-- Almacena todos los datos de la aplicación en formato clave-valor
-- ============================================================================

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS kv_store_bebfd31a (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Agregar índice para búsquedas por prefijo (mejora rendimiento)
CREATE INDEX IF NOT EXISTS idx_kv_store_key_pattern 
ON kv_store_bebfd31a (key text_pattern_ops);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name, 
  table_type 
FROM information_schema.tables 
WHERE table_name = 'kv_store_bebfd31a';

-- Mostrar estructura de la tabla
\d kv_store_bebfd31a

-- ============================================================================
-- NOTA: Ejecuta este SQL en Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/lpspwvwgqiqrendjksqy/sql
-- ============================================================================
