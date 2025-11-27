-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN - SISTEMA DE GESTIÓN DE BIBLIOTECA
-- ============================================================================
-- Este script configura la base de datos PostgreSQL en Supabase
-- Crea la tabla kv_store que actúa como almacenamiento clave-valor
-- Configura políticas de seguridad RLS (Row Level Security)
-- 
-- INSTRUCCIONES:
-- Ejecuta este script en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/lpspwvwgqiqrendjksqy/sql/new
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
CREATE TABLE IF NOT EXISTS logs_auditoria_bebfd31a (
  id BIGSERIAL PRIMARY KEY,                    -- ID auto-incremental
  timestamp TIMESTAMPTZ DEFAULT NOW(),         -- Fecha y hora del evento
  usuario_id TEXT NOT NULL,                    -- ID del usuario que ejecuta la acción
  usuario_nombre TEXT NOT NULL,                -- Nombre completo del usuario
  usuario_role TEXT NOT NULL,                  -- Rol del usuario (admin/cliente)
  accion TEXT NOT NULL,                        -- Tipo de acción (CREAR, EDITAR, ELIMINAR, etc.)
  modulo TEXT NOT NULL,                        -- Módulo afectado (USUARIOS, LIBROS, PRÉSTAMOS, etc.)
  entidad_id TEXT,                             -- ID de la entidad afectada
  detalles JSONB,                              -- Información adicional en formato JSON
  ip_address TEXT,                             -- Dirección IP del usuario (opcional)
  user_agent TEXT                              -- Navegador/dispositivo del usuario (opcional)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_auditoria_bebfd31a(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria_bebfd31a(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_modulo ON logs_auditoria_bebfd31a(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_accion ON logs_auditoria_bebfd31a(accion);

-- Habilitar RLS para la tabla de logs
ALTER TABLE logs_auditoria_bebfd31a ENABLE ROW LEVEL SECURITY;

-- Política para service_role (backend)
DROP POLICY IF EXISTS "Allow all for service role logs" ON logs_auditoria_bebfd31a;
CREATE POLICY "Allow all for service role logs"
ON logs_auditoria_bebfd31a
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política para usuarios autenticados (solo lectura)
DROP POLICY IF EXISTS "Allow read for authenticated users logs" ON logs_auditoria_bebfd31a;
CREATE POLICY "Allow read for authenticated users logs"
ON logs_auditoria_bebfd31a
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- PASO 7 (OPCIONAL): LISTAR TODAS LAS TABLAS
-- ============================================================================
-- Mostrar todas las tablas públicas en la base de datos
-- Útil para verificar que kv_store_bebfd31a aparece en la lista
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';    -- Solo tablas en el esquema 'public'
