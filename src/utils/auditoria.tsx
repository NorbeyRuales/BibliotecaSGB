/**
 * ============================================================================
 * UTILIDADES DE AUDITORÍA - SISTEMA DE GESTIÓN DE BIBLIOTECA
 * ============================================================================
 * 
 * Sistema de logs de auditoría usando Supabase
 * Registra todas las acciones administrativas en la base de datos
 */

import { projectId, publicAnonKey } from './supabase/info';

/**
 * Tipo de datos para un log de auditoría
 */
export interface LogAuditoria {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_email?: string;
  accion: string;
  modulo: string;
  entidad_id?: string;
  detalles?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  fecha: string;
  created_at: string;
}

/**
 * Parámetros para registrar un log
 */
export interface RegistrarLogParams {
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail?: string;
  usuarioRole: string;
  accion: string;
  modulo: string;
  entidadId?: string;
  detalles?: Record<string, any>;
}

/**
 * Parámetros para listar logs
 */
export interface ListarLogsParams {
  page?: number;
  limit?: number;
  modulo?: string;
  accion?: string;
  usuarioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Respuesta de la API al listar logs
 */
export interface ListarLogsResponse {
  logs: LogAuditoria[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Registra una acción en el sistema de auditoría
 */
export async function registrarLog(
  params: RegistrarLogParams,
  token: string
): Promise<{ success: boolean; log?: LogAuditoria; error?: string }> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bebfd31a/logs-auditoria/registrar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          usuario_id: params.usuarioId,
          usuario_nombre: params.usuarioNombre,
          usuario_email: params.usuarioEmail || '',
          accion: params.accion,
          modulo: params.modulo,
          entidad_id: params.entidadId,
          detalles: params.detalles,
          ip_address: '', // Se puede añadir más adelante
          user_agent: navigator.userAgent,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al registrar log');
    }

    const data = await response.json();
    
    // Solo mostrar en modo debug
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Log registrado:', data.log);
    }

    return { success: true, log: data.log };
  } catch (error) {
    // Silenciar TODOS los errores de logs - no deben afectar funcionalidad principal
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    
    // No mostrar warnings ni errores en consola
    // Los logs son secundarios y no deben interrumpir la experiencia del usuario
    
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Lista logs de auditoría con filtros y paginación
 */
export async function listarLogs(
  params: ListarLogsParams,
  token: string
): Promise<ListarLogsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.modulo) queryParams.append('modulo', params.modulo);
    if (params.accion) queryParams.append('accion', params.accion);
    if (params.usuarioId) queryParams.append('usuarioId', params.usuarioId);
    if (params.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params.fechaFin) queryParams.append('fechaFin', params.fechaFin);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bebfd31a/logs-auditoria/listar?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al listar logs');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    
    // Si la tabla no existe, retornar datos vacíos en lugar de error
    if (errorMsg.includes('does not exist') || errorMsg.includes('Could not find')) {
      return {
        logs: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
    
    console.error('Error al listar logs:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de los logs de auditoría
 */
export async function obtenerEstadisticasLogs(
  fechaInicio: string | undefined,
  fechaFin: string | undefined,
  token: string
): Promise<{
  totalAcciones: number;
  accionesPorTipo: Array<{ tipo: string; cantidad: number }>;
  accionesPorModulo: Array<{ modulo: string; cantidad: number }>;
  accionesPorUsuario: Array<{ usuario: string; cantidad: number }>;
  accionesPorDia: Array<{ fecha: string; cantidad: number }>;
}> {
  try {
    const queryParams = new URLSearchParams();
    
    if (fechaInicio) queryParams.append('fechaInicio', fechaInicio);
    if (fechaFin) queryParams.append('fechaFin', fechaFin);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bebfd31a/logs-auditoria/estadisticas?${queryParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener estadísticas');
    }

    const data = await response.json();
    return data.estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas de logs:', error);
    throw error;
  }
}

/**
 * Constantes para los módulos del sistema
 */
export const MODULOS = {
  USUARIOS: 'USUARIOS',
  LIBROS: 'LIBROS',
  PRÉSTAMOS: 'PRÉSTAMOS',
  MULTAS: 'MULTAS',
  CATEGORÍAS: 'CATEGORÍAS',
  AUTENTICACIÓN: 'AUTENTICACIÓN',
  REPORTES: 'REPORTES',
  CONFIGURACIÓN: 'CONFIGURACIÓN',
} as const;

/**
 * Constantes para las acciones del sistema
 */
export const ACCIONES = {
  CREAR: 'CREAR',
  EDITAR: 'EDITAR',
  ELIMINAR: 'ELIMINAR',
  ACTIVAR: 'ACTIVAR',
  BLOQUEAR: 'BLOQUEAR',
  DESBLOQUEAR: 'DESBLOQUEAR',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  VER: 'VER',
  EXPORTAR: 'EXPORTAR',
  DEVOLVER: 'DEVOLVER',
  RENOVAR: 'RENOVAR',
  PAGAR: 'PAGAR',
  CONDONAR: 'CONDONAR',
} as const;
