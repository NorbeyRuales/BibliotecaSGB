-- Script de Limpieza de Base de Datos
-- Este script corrige los libros con datos incorrectos (copias = páginas)
-- Ejecuta esto en el SQL Editor de Supabase ANTES de usar el sistema

-- OPCIÓN 1: Borrar TODOS los libros y empezar de cero (RECOMENDADO)
-- Esto es más seguro si estás en pruebas

DELETE FROM kv_store_bebfd31a 
WHERE key LIKE 'libro:%';

-- También borra los préstamos asociados para evitar inconsistencias
DELETE FROM kv_store_bebfd31a 
WHERE key LIKE 'prestamo:%';

-- También borra las multas asociadas
DELETE FROM kv_store_bebfd31a 
WHERE key LIKE 'multa:%';

-- Mensaje de confirmación
SELECT 'Base de datos limpiada. Todos los libros, préstamos y multas fueron eliminados.' AS status;

-- IMPORTANTE: Después de ejecutar esto, crea libros NUEVOS desde la interfaz
-- con las cantidades correctas de copias (ej: 5, 10, etc.)
