-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN - SISTEMA DE GESTIÓN DE BIBLIOTECA
-- ============================================================================
-- Este script configura la base de datos PostgreSQL en Supabase
-- Crea la tabla kv_store que actúa como almacenamiento clave-valor
-- Configura políticas de seguridad RLS (Row Level Security)
-- 
-- INSTRUCCIONES:
-- Ejecuta este script en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/ffkxmdgwdzvwanrocshn/sql/new
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA DE ALMACENAMIENTO CLAVE-VALOR
-- ============================================================================
-- Crear tabla kv_store_bebfd31a si no existe
-- Esta tabla almacena todos los datos del sistema (usuarios, libros, préstamos, etc.)
-- usando un patrón clave-valor donde:
--   - key: identificador único (ej: "libro:123", "cliente:987654321")
--   - value: datos JSON del registro
CREATE TABLE IF NOT EXISTS kv_store_bebfd31a (
  key TEXT NOT NULL PRIMARY KEY,    -- Clave única (índice primario)
  value JSONB NOT NULL               -- Valor en formato JSON binario
);

-- ============================================================================
-- PASO 2: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS permite definir políticas de acceso a nivel de fila
-- Aunque se habilita, las políticas permitirán acceso completo
ALTER TABLE kv_store_bebfd31a ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 3: CREAR POLÍTICA PARA SERVICE ROLE
-- ============================================================================
-- Permitir todas las operaciones (SELECT, INSERT, UPDATE, DELETE) 
-- cuando se use el service_role key (backend server)
-- Esta política da acceso completo a las Edge Functions
DROP POLICY IF EXISTS "Allow all for service role" ON kv_store_bebfd31a;
CREATE POLICY "Allow all for service role"
ON kv_store_bebfd31a              -- Tabla afectada
FOR ALL                           -- Todas las operaciones (SELECT, INSERT, UPDATE, DELETE)
TO service_role                   -- Solo para el rol service_role
USING (true)                      -- Permitir lectura de todas las filas
WITH CHECK (true);                -- Permitir escritura en todas las filas

-- ============================================================================
-- PASO 4: CREAR POLÍTICA PARA USUARIOS AUTENTICADOS
-- ============================================================================
-- Permitir todas las operaciones para usuarios autenticados
-- (esto es permisivo, en producción deberías restringir más)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON kv_store_bebfd31a;
CREATE POLICY "Allow all for authenticated users"
ON kv_store_bebfd31a              -- Tabla afectada
FOR ALL                           -- Todas las operaciones
TO authenticated                  -- Solo para usuarios autenticados
USING (true)                      -- Permitir lectura de todas las filas
WITH CHECK (true);                -- Permitir escritura en todas las filas

-- ============================================================================
-- PASO 5: VERIFICACIÓN DE CREACIÓN EXITOSA
-- ============================================================================
-- Consulta simple para confirmar que la tabla fue creada
SELECT 'Tabla kv_store_bebfd31a creada correctamente' AS status;

-- ============================================================================
-- PASO 6: CREAR TABLA DE LOGS DE AUDITORÍA
-- ============================================================================
-- Tabla para registrar todas las acciones realizadas en el sistema
-- Útil para auditoría, seguridad y análisis de usabilidad
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id VARCHAR(255) NOT NULL,
  usuario_nombre VARCHAR(255) NOT NULL,
  usuario_email VARCHAR(255),
  accion VARCHAR(50) NOT NULL,
  modulo VARCHAR(50) NOT NULL,
  entidad_id VARCHAR(255),
  detalles JSONB,
  ip_address VARCHAR(100),
  user_agent TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_accion ON logs_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_modulo ON logs_auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_fecha ON logs_auditoria(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidad_id ON logs_auditoria(entidad_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at ON logs_auditoria(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_modulo_accion_fecha
  ON logs_auditoria(modulo, accion, fecha DESC);

-- Habilitar RLS para la tabla de logs
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política para service_role (backend)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer logs" ON logs_auditoria;
CREATE POLICY "Usuarios autenticados pueden leer logs"
ON logs_auditoria
FOR SELECT
TO authenticated
USING (true);

-- Política para inserción desde la función
DROP POLICY IF EXISTS "Sistema puede insertar logs" ON logs_auditoria;
CREATE POLICY "Sistema puede insertar logs"
ON logs_auditoria
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- PASO 7 (OPCIONAL): LISTAR TODAS LAS TABLAS
-- ============================================================================
-- Mostrar todas las tablas públicas en la base de datos
-- Útil para verificar que kv_store_bebfd31a aparece en la lista
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';    -- Solo tablas en el esquema 'public'
