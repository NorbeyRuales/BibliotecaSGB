-- Script de Limpieza Simplificado
-- Elimina TODOS los libros, préstamos y multas con datos corruptos
-- Después de esto, el sistema usará solo 2 campos: copiasTotal y copiasDisponibles

-- 1. Borrar todos los libros (tienen cantidadCopias redundante)
DELETE FROM kv_store_bebfd31a WHERE key LIKE 'libro:%';

-- 2. Borrar todos los préstamos
DELETE FROM kv_store_bebfd31a WHERE key LIKE 'prestamo:%';

-- 3. Borrar todas las multas
DELETE FROM kv_store_bebfd31a WHERE key LIKE 'multa:%';

-- 4. Confirmación
SELECT 'Base de datos limpiada. Ahora solo se usarán copiasTotal y copiasDisponibles.' AS status;

-- IMPORTANTE: 
-- Después de ejecutar esto, crea libros nuevos desde la interfaz.
-- El nuevo modelo solo usa:
--   - copiasTotal: Total de copias del libro (inventario)
--   - copiasDisponibles: Copias disponibles (calculado dinámicamente)
-- Ya NO existe cantidadCopias (era redundante)
