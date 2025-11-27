/* ============================================================================
 * KV_STORE.TSX - INTERFAZ DE ALMACENAMIENTO CLAVE-VALOR
 * ============================================================================
 * ARCHIVO AUTOGENERADO - NO EDITAR MANUALMENTE
 * 
 * Este archivo proporciona una interfaz simple de almacenamiento clave-valor
 * para gestionar datos de la aplicación en PostgreSQL usando Supabase.
 * 
 * ESQUEMA DE LA TABLA:
 * CREATE TABLE kv_store_bebfd31a (
 *   key TEXT NOT NULL PRIMARY KEY,   -- Identificador único
 *   value JSONB NOT NULL              -- Datos en formato JSON
 * );
 * 
 * VISTA EN SUPABASE:
 * https://supabase.com/dashboard/project/lpspwvwgqiqrendjksqy/database/tables
 * ============================================================================
 */

// Importar cliente de Supabase desde JSR (JavaScript Registry)
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

/**
 * Crea y retorna una instancia del cliente de Supabase
 * Usa variables de entorno proporcionadas por Deno
 * @returns Cliente de Supabase configurado
 */
const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),               // URL del proyecto Supabase
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),  // Clave de servicio (acceso completo)
);

/**
 * SET - Almacena o actualiza un par clave-valor en la base de datos
 * Si la clave ya existe, actualiza el valor (upsert)
 * @param key - Identificador único (ej: "libro:123")
 * @param value - Cualquier objeto JavaScript (se convierte a JSON)
 * @throws Error si la operación falla
 */
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Realizar upsert (insert o update)
  const { error } = await supabase.from("kv_store_bebfd31a").upsert({
    key,      // Clave única
    value     // Valor JSON (JSONB en PostgreSQL)
  });
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * GET - Recupera un valor de la base de datos usando su clave
 * @param key - Identificador único del registro
 * @returns El valor almacenado (objeto JavaScript) o null si no existe
 * @throws Error si la operación falla
 */
export const get = async (key: string): Promise<any> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Buscar registro por clave
  // .select("value") - Solo retornar la columna 'value'
  // .eq("key", key) - Filtrar por clave exacta
  // .maybeSingle() - Retornar un solo registro o null (no error si no existe)
  const { data, error } = await supabase
    .from("kv_store_bebfd31a")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
  
  // Retornar el valor o undefined si no existe
  return data?.value;
};

/**
 * DEL - Elimina un par clave-valor de la base de datos
 * @param key - Identificador único del registro a eliminar
 * @throws Error si la operación falla
 */
export const del = async (key: string): Promise<void> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Eliminar registro por clave
  // .eq("key", key) - Filtrar por clave exacta
  const { error } = await supabase
    .from("kv_store_bebfd31a")
    .delete()
    .eq("key", key);
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * MSET - Almacena múltiples pares clave-valor en una sola operación
 * Operación atómica para mejorar rendimiento
 * @param keys - Array de claves únicas
 * @param values - Array de valores correspondientes a cada clave
 * @throws Error si la operación falla o si los arrays no tienen la misma longitud
 */
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Mapear arrays a objetos {key, value} y hacer upsert masivo
  // keys.map((k, i) => ...) - Por cada clave, crear objeto con su valor correspondiente
  const { error } = await supabase
    .from("kv_store_bebfd31a")
    .upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * MGET - Recupera múltiples valores usando sus claves
 * @param keys - Array de claves a buscar
 * @returns Array de valores en el mismo orden que las claves
 * @throws Error si la operación falla
 */
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Buscar múltiples registros por claves
  // .in("key", keys) - Filtrar donde 'key' está en el array de claves
  const { data, error } = await supabase
    .from("kv_store_bebfd31a")
    .select("value")
    .in("key", keys);
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
  
  // Extraer solo los valores de los registros encontrados
  // ?? [] - Retornar array vacío si data es null/undefined
  return data?.map((d) => d.value) ?? [];
};

/**
 * MDEL - Elimina múltiples pares clave-valor en una sola operación
 * @param keys - Array de claves a eliminar
 * @throws Error si la operación falla
 */
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Eliminar múltiples registros por claves
  // .in("key", keys) - Filtrar donde 'key' está en el array de claves
  const { error } = await supabase
    .from("kv_store_bebfd31a")
    .delete()
    .in("key", keys);
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * GETBYPREFIX - Busca todos los registros cuya clave comience con un prefijo
 * Útil para obtener todos los registros de un tipo (ej: todos los libros)
 * @param prefix - Prefijo a buscar (ej: "libro:", "cliente:")
 * @returns Array de valores de todos los registros que coincidan
 * @throws Error si la operación falla
 * 
 * EJEMPLOS DE USO:
 * - getByPrefix("libro:") - Retorna todos los libros
 * - getByPrefix("cliente:") - Retorna todos los clientes
 * - getByPrefix("prestamo:") - Retorna todos los préstamos
 */
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client()  // Obtener cliente de Supabase
  
  // Buscar registros por patrón de clave
  // .like("key", prefix + "%") - Buscar claves que comiencen con el prefijo
  // % es el wildcard de SQL que significa "cualquier cosa"
  const { data, error } = await supabase
    .from("kv_store_bebfd31a")
    .select("key, value")
    .like("key", prefix + "%");
  
  // Lanzar error si la operación falló
  if (error) {
    throw new Error(error.message);
  }
  
  // Extraer solo los valores de los registros encontrados
  // ?? [] - Retornar array vacío si data es null/undefined
  return data?.map((d) => d.value) ?? [];
};