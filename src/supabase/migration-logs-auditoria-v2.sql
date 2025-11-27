-- ============================================================================
-- MIGRACIÓN: SISTEMA DE LOGS DE AUDITORÍA
-- ============================================================================
-- Tabla para registrar todas las acciones administrativas en el sistema
-- Autor: Sistema de Gestión de Biblioteca
-- Fecha: 2025-11-06
-- ============================================================================

-- Crear tabla de logs de auditoría
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
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario_id ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_accion ON logs_auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_modulo ON logs_auditoria(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_fecha ON logs_auditoria(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_entidad_id ON logs_auditoria(entidad_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at ON logs_auditoria(created_at DESC);

-- Índice compuesto para consultas de búsqueda comunes
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_modulo_accion_fecha 
  ON logs_auditoria(modulo, accion, fecha DESC);

-- Comentarios para documentación
COMMENT ON TABLE logs_auditoria IS 'Tabla que registra todas las acciones realizadas por administradores en el sistema';
COMMENT ON COLUMN logs_auditoria.id IS 'Identificador único del log';
COMMENT ON COLUMN logs_auditoria.usuario_id IS 'Identificación del usuario que realizó la acción';
COMMENT ON COLUMN logs_auditoria.usuario_nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN logs_auditoria.usuario_email IS 'Email del usuario';
COMMENT ON COLUMN logs_auditoria.accion IS 'Tipo de acción realizada (CREAR, EDITAR, ELIMINAR, ACTIVAR, etc)';
COMMENT ON COLUMN logs_auditoria.modulo IS 'Módulo del sistema donde se realizó la acción (LIBROS, USUARIOS, PRÉSTAMOS, MULTAS)';
COMMENT ON COLUMN logs_auditoria.entidad_id IS 'ID de la entidad afectada';
COMMENT ON COLUMN logs_auditoria.detalles IS 'Detalles adicionales de la acción en formato JSON';
COMMENT ON COLUMN logs_auditoria.ip_address IS 'Dirección IP desde donde se realizó la acción';
COMMENT ON COLUMN logs_auditoria.user_agent IS 'User agent del navegador';
COMMENT ON COLUMN logs_auditoria.fecha IS 'Fecha y hora de la acción';

-- Crear política de seguridad (RLS)
ALTER TABLE logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer logs
CREATE POLICY "Usuarios autenticados pueden leer logs" ON logs_auditoria
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo el sistema puede insertar logs (a través del service role)
CREATE POLICY "Sistema puede insertar logs" ON logs_auditoria
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Función para limpiar logs antiguos (opcional, para mantenimiento)
CREATE OR REPLACE FUNCTION limpiar_logs_antiguos(dias_antiguedad INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  registros_eliminados INTEGER;
BEGIN
  DELETE FROM logs_auditoria 
  WHERE fecha < NOW() - INTERVAL '1 day' * dias_antiguedad;
  
  GET DIAGNOSTICS registros_eliminados = ROW_COUNT;
  RETURN registros_eliminados;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION limpiar_logs_antiguos IS 'Elimina logs de auditoría más antiguos que el número de días especificado';
