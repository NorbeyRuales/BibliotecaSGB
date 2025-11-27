-- ============================================================================
-- MIGRACIÓN: AGREGAR SISTEMA DE LOGS DE AUDITORÍA
-- ============================================================================
-- Este script agrega el sistema de logs de auditoría a una base de datos existente
-- 
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. El script es idempotente (se puede ejecutar múltiples veces sin problemas)
-- 3. Verifica que no haya errores después de la ejecución
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA DE LOGS DE AUDITORÍA
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

-- ============================================================================
-- PASO 2: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================
-- Los índices mejoran el rendimiento de las consultas frecuentes

-- Índice por timestamp (para búsquedas por fecha y ordenamiento)
CREATE INDEX IF NOT EXISTS idx_logs_timestamp 
ON logs_auditoria_bebfd31a(timestamp DESC);

-- Índice por usuario (para filtrar por usuario específico)
CREATE INDEX IF NOT EXISTS idx_logs_usuario 
ON logs_auditoria_bebfd31a(usuario_id);

-- Índice por módulo (para filtrar por módulo del sistema)
CREATE INDEX IF NOT EXISTS idx_logs_modulo 
ON logs_auditoria_bebfd31a(modulo);

-- Índice por acción (para filtrar por tipo de acción)
CREATE INDEX IF NOT EXISTS idx_logs_accion 
ON logs_auditoria_bebfd31a(accion);

-- Índice compuesto para búsquedas por módulo y acción
CREATE INDEX IF NOT EXISTS idx_logs_modulo_accion 
ON logs_auditoria_bebfd31a(modulo, accion);

-- ============================================================================
-- PASO 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS permite definir políticas de acceso a nivel de fila
ALTER TABLE logs_auditoria_bebfd31a ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 4: CREAR POLÍTICA PARA SERVICE ROLE
-- ============================================================================
-- Permitir todas las operaciones (SELECT, INSERT, UPDATE, DELETE) 
-- cuando se use el service_role key (backend server)
DROP POLICY IF EXISTS "Allow all for service role logs" ON logs_auditoria_bebfd31a;
CREATE POLICY "Allow all for service role logs"
ON logs_auditoria_bebfd31a
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PASO 5: CREAR POLÍTICA PARA USUARIOS AUTENTICADOS
-- ============================================================================
-- Permitir solo lectura para usuarios autenticados
-- Los usuarios pueden ver logs pero no modificarlos
DROP POLICY IF EXISTS "Allow read for authenticated users logs" ON logs_auditoria_bebfd31a;
CREATE POLICY "Allow read for authenticated users logs"
ON logs_auditoria_bebfd31a
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- PASO 6: VERIFICACIÓN
-- ============================================================================
-- Verificar que la tabla fue creada correctamente
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'logs_auditoria_bebfd31a'
  ) THEN
    RAISE NOTICE '✅ Tabla logs_auditoria_bebfd31a creada exitosamente';
  ELSE
    RAISE EXCEPTION '❌ Error: La tabla logs_auditoria_bebfd31a no fue creada';
  END IF;
END $$;

-- Verificar que los índices fueron creados
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_indexes 
    WHERE tablename = 'logs_auditoria_bebfd31a'
  ) THEN
    RAISE NOTICE '✅ Índices creados exitosamente';
  ELSE
    RAISE WARNING '⚠️  No se encontraron índices para la tabla';
  END IF;
END $$;

-- Verificar que RLS está habilitado
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'logs_auditoria_bebfd31a' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ Row Level Security habilitado';
  ELSE
    RAISE EXCEPTION '❌ Error: RLS no está habilitado';
  END IF;
END $$;

-- Contar políticas creadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'logs_auditoria_bebfd31a';
  
  IF policy_count >= 2 THEN
    RAISE NOTICE '✅ Políticas de seguridad creadas: %', policy_count;
  ELSE
    RAISE WARNING '⚠️  Se esperaban al menos 2 políticas, se encontraron: %', policy_count;
  END IF;
END $$;

-- ============================================================================
-- PASO 7: INSERTAR LOG DE PRUEBA (OPCIONAL)
-- ============================================================================
-- Este paso es opcional y sirve para verificar que todo funciona correctamente
-- Puedes comentarlo si no quieres el log de prueba

-- COMENTAR LAS SIGUIENTES LÍNEAS SI NO DESEAS EL LOG DE PRUEBA:
-- INSERT INTO logs_auditoria_bebfd31a (
--   usuario_id,
--   usuario_nombre,
--   usuario_role,
--   accion,
--   modulo,
--   entidad_id,
--   detalles
-- ) VALUES (
--   'system',
--   'Sistema',
--   'system',
--   'CREAR',
--   'CONFIGURACIÓN',
--   'logs-auditoria',
--   '{"mensaje": "Sistema de logs de auditoría inicializado correctamente"}'::jsonb
-- );

-- ============================================================================
-- RESUMEN DE LA MIGRACIÓN
-- ============================================================================
SELECT 
  'MIGRACIÓN COMPLETADA' as status,
  'logs_auditoria_bebfd31a' as tabla_creada,
  COUNT(*) as indices_creados
FROM pg_indexes 
WHERE tablename = 'logs_auditoria_bebfd31a';

-- Mostrar estructura de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'logs_auditoria_bebfd31a'
ORDER BY ordinal_position;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Esta migración es segura y puede ejecutarse en producción
-- 2. El script es idempotente (puede ejecutarse múltiples veces)
-- 3. No modifica datos existentes, solo agrega nueva funcionalidad
-- 4. Los índices mejoran el rendimiento pero pueden tardar un momento en crearse
-- 5. Las políticas RLS aseguran que solo el backend puede escribir logs
-- 6. Los usuarios autenticados pueden leer logs pero no modificarlos
-- ============================================================================

-- ============================================================================
-- PRÓXIMOS PASOS
-- ============================================================================
-- 1. ✅ Ejecutar este script en Supabase SQL Editor
-- 2. ⏳ Desplegar las Edge Functions actualizadas (./deploy.sh)
-- 3. ⏳ Integrar el hook useAuditoria en los componentes
-- 4. ⏳ Verificar que los logs se registran correctamente
-- 5. ⏳ Revisar la sección "Logs de Auditoría" en el panel de admin
-- ============================================================================
