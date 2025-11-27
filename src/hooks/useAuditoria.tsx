/**
 * ============================================================================
 * HOOK: useAuditoria
 * ============================================================================
 * 
 * Hook personalizado para facilitar el registro de logs de auditoría
 * en los componentes del sistema.
 * 
 * CARACTERÍSTICAS:
 * - Integración automática con el contexto de autenticación
 * - API simple y consistente
 * - Manejo de errores silencioso (no interrumpe la operación principal)
 * - Tipo de datos fuertemente tipado
 * 
 * USO:
 * ```typescript
 * const { registrarLog } = useAuditoria();
 * 
 * // Registrar una acción
 * await registrarLog('CREAR', 'LIBROS', libroId, { titulo: libro.titulo });
 * ```
 */

import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { registrarLog as registrarLogAPI } from '../utils/auditoria';

export function useAuditoria() {
  const { user, token } = useAuth();

  /**
   * Registra una acción en el sistema de auditoría
   * 
   * @param accion - Tipo de acción (CREAR, EDITAR, ELIMINAR, etc.)
   * @param modulo - Módulo del sistema (USUARIOS, LIBROS, PRÉSTAMOS, etc.)
   * @param entidadId - ID de la entidad afectada (opcional)
   * @param detalles - Información adicional sobre la acción (opcional)
   * @returns Promise que se resuelve cuando el log se registra
   * 
   * NOTA: Los errores son capturados y logueados, pero no se propagan
   * para evitar interrumpir la operación principal del usuario
   */
  const registrarLog = useCallback(
    async (
      accion: string,
      modulo: string,
      entidadId?: string,
      detalles?: Record<string, any>
    ): Promise<void> => {
      // Validar que tenemos usuario
      if (!user) {
        console.warn('No se puede registrar log: usuario no autenticado');
        return;
      }

      try {
        await registrarLogAPI(
          {
            usuarioId: user.id,
            usuarioNombre: `${user.nombre} ${user.apellido}`,
            usuarioEmail: user.email,
            usuarioRole: user.role,
            accion,
            modulo,
            entidadId,
            detalles,
          },
          token || ''
        );
      } catch (error) {
        // Loguear el error pero no propagarlo
        // Esto asegura que un fallo en el sistema de auditoría
        // no interrumpa la operación principal del usuario
        console.error('Error al registrar log de auditoría:', error);
      }
    },
    [user, token]
  );

  return {
    registrarLog,
  };
}
