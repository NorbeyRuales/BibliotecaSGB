-- ============================================================================
-- COPIAR TODO ESTE CONTENIDO Y PEGAR EN SUPABASE SQL EDITOR
-- ============================================================================
-- Tiempo estimado: 2 minutos
-- Este script crea la tabla de logs de auditoría para el Sistema de Biblioteca
-- ============================================================================

-- Eliminar tabla anterior si existe (para empezar limpio)
DROP TABLE IF EXISTS logs_auditoria CASCADE;

-- Crear tabla de logs de auditoría
CREATE TABLE logs_auditoria (
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
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX idx_logs_auditoria_accion ON logs_auditoria(accion);
CREATE INDEX idx_logs_auditoria_modulo ON logs_auditoria(modulo);
CREATE INDEX idx_logs_auditoria_fecha ON logs_auditoria(fecha DESC);
CREATE INDEX idx_logs_auditoria_entidad_id ON logs_auditoria(entidad_id);
CREATE INDEX idx_logs_auditoria_created_at ON logs_auditoria(created_at DESC);
CREATE INDEX idx_logs_auditoria_modulo_accion_fecha ON logs_auditoria(modulo, accion, fecha DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer logs
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer logs" ON logs_auditoria;
CREATE POLICY "Usuarios autenticados pueden leer logs" ON logs_auditoria
  FOR SELECT TO authenticated USING (true);

-- Política: Solo el sistema puede insertar logs
DROP POLICY IF EXISTS "Sistema puede insertar logs" ON logs_auditoria;
CREATE POLICY "Sistema puede insertar logs" ON logs_auditoria
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- LISTO! Debes ver: "Success. No rows returned"
-- Ahora recarga tu aplicación (F5) y los errores desaparecerán
-- ============================================================================
