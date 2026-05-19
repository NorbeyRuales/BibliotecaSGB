/**
 * ============================================================================
 * CLIENT.TSX - CLIENTE DE SUPABASE (SINGLETON)
 * ============================================================================
 * Este archivo crea y mantiene una única instancia del cliente de Supabase
 * Usa el patrón Singleton para evitar crear múltiples conexiones
 * El cliente se usa para autenticación y acceso a la base de datos
 * ============================================================================
 */

// Importar la función para crear cliente de Supabase
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Importar configuración del proyecto
import { supabaseConfig } from './config';

/**
 * Variable que mantiene la única instancia del cliente de Supabase
 * Se inicializa como null y se crea solo cuando se solicita (lazy initialization)
 */
let supabaseClient: any = null;

/**
 * CREATE CLIENT - Crea o retorna la instancia existente del cliente de Supabase
 * Implementa el patrón Singleton para garantizar una sola instancia
 * 
 * @returns Instancia del cliente de Supabase configurado
 * 
 * FUNCIONAMIENTO:
 * 1. Si ya existe una instancia (supabaseClient != null), la retorna
 * 2. Si no existe, crea una nueva instancia con las credenciales del proyecto
 * 3. Guarda la instancia en la variable para reutilizarla
 */
export const createClient = () => {
  // Verificar si ya existe una instancia del cliente
  if (!supabaseClient) {
    // No existe - crear nueva instancia
    supabaseClient = createSupabaseClient(
      supabaseConfig.supabaseUrl,
      supabaseConfig.supabaseAnonKey
    );
  }
  
  // Retornar la instancia existente o recién creada
  return supabaseClient;
};
