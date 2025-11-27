/**
 * ============================================================================
 * API.TSX - CLIENTE DE API PARA EDGE FUNCTIONS
 * ============================================================================
 * Este archivo centraliza todas las llamadas HTTP al backend (Edge Functions)
 * Proporciona métodos tipados para cada endpoint del servidor
 * Maneja autenticación, serialización JSON y headers HTTP
 * ============================================================================
 */

// Importar credenciales del proyecto Supabase
import { projectId, publicAnonKey } from './supabase/info';

/**
 * URL base de las Edge Functions
 * Formato: https://[project-id].supabase.co/functions/v1/[function-name]
 */
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-bebfd31a`;

/**
 * APICLIENT - Objeto que contiene todos los métodos para llamar al backend
 * Cada método corresponde a un endpoint específico del servidor
 */
export const apiClient = {
  
  // ==========================================================================
  // INICIALIZACIÓN DEL SISTEMA
  // ==========================================================================
  
  /**
   * INITADMIN - Crea el usuario administrador inicial
   * Endpoint: POST /setup/init-admin
   * @returns Promesa con {success, message, credentials} o {error}
   */
  async initAdmin() {
    const response = await fetch(`${API_URL}/setup/init-admin`, {
      method: 'POST',                          // Método HTTP
      headers: {
        'Content-Type': 'application/json',    // Indicar que enviamos JSON
        'Authorization': `Bearer ${publicAnonKey}` // Autenticación con clave pública
      }
    });
    return response.json();  // Parsear respuesta JSON
  },

  // ==========================================================================
  // AUTENTICACIÓN
  // ==========================================================================
  
  /**
   * SIGNUP - Registra un nuevo usuario en el sistema
   * Endpoint: POST /auth/signup
   * @param data - Datos del usuario {email, password, identificacion, nombre, apellido, fechaNacimiento, role}
   * @returns Promesa con {success, user} o {error}
   */
  async signup(data: any) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(data)  // Convertir objeto a JSON
    });
    return response.json();
  },

  /**
   * SIGNIN - Inicia sesión con email y contraseña
   * Endpoint: POST /auth/signin
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa con {success, access_token, user} o {error}
   */
  async signin(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  // ==========================================================================
  // GESTIÓN DE CLIENTES
  // ==========================================================================
  
  /**
   * GETCLIENTES - Obtiene lista de todos los clientes
   * Endpoint: GET /clientes
   * @param token - Token de autenticación del usuario (access_token)
   * @returns Promesa con {clientes: Array} o {error}
   * NOTA: Admin ve todos (incluidos eliminados), clientes solo activos
   */
  async getClientes(token: string) {
    const response = await fetch(`${API_URL}/clientes`, {
      headers: {
        'Authorization': `Bearer ${token}`  // Token en header Authorization
      }
    });
    return response.json();
  },

  /**
   * GETCLIENTE - Obtiene un cliente específico por identificación
   * Endpoint: GET /clientes/:identificacion
   * @param identificacion - Número de identificación del cliente
   * @param token - Token de autenticación
   * @returns Promesa con {cliente: Object} o {error}
   */
  async getCliente(identificacion: string, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * CREATECLIENTE - Crea un nuevo cliente (solo admin)
   * Endpoint: POST /clientes
   * @param data - Datos del cliente {identificacion, nombre, apellido, fechaNacimiento}
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, cliente} o {error}
   */
  async createCliente(data: any, token: string) {
    const response = await fetch(`${API_URL}/clientes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)  // Enviar datos del cliente como JSON
    });
    return response.json();
  },

  /**
   * UPDATECLIENTE - Actualiza datos de un cliente existente (solo admin)
   * Endpoint: PUT /clientes/:identificacion
   * @param identificacion - Identificación del cliente a actualizar
   * @param data - Datos a actualizar (pueden ser parciales)
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, cliente} o {error}
   */
  async updateCliente(identificacion: string, data: any, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * DELETECLIENTE - Elimina un cliente (borrado lógico) (solo admin)
   * Endpoint: DELETE /clientes/:identificacion
   * @param identificacion - Identificación del cliente a eliminar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: No elimina físicamente, solo marca como eliminado
   */
  async deleteCliente(identificacion: string, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * REHABILITARCLIENTE - Reactiva un cliente eliminado (solo admin)
   * Endpoint: POST /clientes/:identificacion/rehabilitar
   * @param identificacion - Identificación del cliente a rehabilitar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async rehabilitarCliente(identificacion: string, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}/rehabilitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * BLOQUEARCLIENTE - Bloquea un cliente (impide préstamos) (solo admin)
   * Endpoint: POST /clientes/:identificacion/bloquear
   * @param identificacion - Identificación del cliente a bloquear
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async bloquearCliente(identificacion: string, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}/bloquear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * DESBLOQUEARCLIENTE - Desbloquea un cliente previamente bloqueado (solo admin)
   * Endpoint: POST /clientes/:identificacion/desbloquear
   * @param identificacion - Identificación del cliente a desbloquear
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async desbloquearCliente(identificacion: string, token: string) {
    const response = await fetch(`${API_URL}/clientes/${identificacion}/desbloquear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // GESTIÓN DE LIBROS
  // ==========================================================================
  
  /**
   * GETLIBROS - Obtiene lista de todos los libros
   * Endpoint: GET /libros
   * @param token - Token de autenticación
   * @returns Promesa con {libros: Array} o {error}
   * NOTA: Los libros incluyen copiasDisponibles calculadas dinámicamente
   * Admin ve todos (incluidos eliminados), clientes solo activos
   */
  async getLibros(token: string) {
    const response = await fetch(`${API_URL}/libros`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * CREATELIBRO - Crea un nuevo libro (solo admin)
   * Endpoint: POST /libros
   * @param data - Datos del libro {idLibro, nombre, genero, numPaginas, copiasTotal, autor, imagenUrl}
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, libro} o {error}
   * NOTA: copiasTotal = inventario inicial, copiasDisponibles se calcula automáticamente
   */
  async createLibro(data: any, token: string) {
    const response = await fetch(`${API_URL}/libros`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * UPDATELIBRO - Actualiza datos de un libro existente (solo admin)
   * Endpoint: PUT /libros/:id
   * @param id - ID del libro a actualizar
   * @param data - Datos a actualizar (pueden ser parciales)
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, libro} o {error}
   * NOTA: Si se actualiza copiasTotal, copiasDisponibles se ajusta automáticamente
   */
  async updateLibro(id: string, data: any, token: string) {
    const response = await fetch(`${API_URL}/libros/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * DELETELIBRO - Elimina un libro (borrado lógico) (solo admin)
   * Endpoint: DELETE /libros/:id
   * @param id - ID del libro a eliminar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: No elimina físicamente, solo marca como eliminado
   */
  async deleteLibro(id: string, token: string) {
    const response = await fetch(`${API_URL}/libros/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * REHABILITARLIBRO - Reactiva un libro eliminado (solo admin)
   * Endpoint: POST /libros/:id/rehabilitar
   * @param id - ID del libro a rehabilitar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async rehabilitarLibro(id: string, token: string) {
    const response = await fetch(`${API_URL}/libros/${id}/rehabilitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // GESTIÓN DE PRÉSTAMOS
  // ==========================================================================
  
  /**
   * GETPRESTAMOS - Obtiene lista de préstamos
   * Endpoint: GET /prestamos
   * @param token - Token de autenticación
   * @returns Promesa con {prestamos: Array} o {error}
   * NOTA: Admin ve todos, clientes solo ven sus propios préstamos activos
   */
  async getPrestamos(token: string) {
    const response = await fetch(`${API_URL}/prestamos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * CREATEPRESTAMO - Crea un nuevo préstamo
   * Endpoint: POST /prestamos
   * @param data - Datos del préstamo {clienteIdentificacion, libroId, fechaPrestamo, fechaVencimiento}
   * @param token - Token de autenticación
   * @returns Promesa con {success, prestamo, recibo} o {error}
   * NOTA: Decrementa automáticamente copiasDisponibles del libro
   * NOTA: Genera un recibo automáticamente para el préstamo
   * VALIDACIONES: Verifica que haya copias disponibles y que el cliente no esté bloqueado
   */
  async createPrestamo(data: any, token: string) {
    const response = await fetch(`${API_URL}/prestamos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * DEVOLVERLIBRO - Marca un préstamo como devuelto
   * Endpoint: POST /prestamos/:id/devolver
   * @param prestamoId - ID del préstamo a devolver
   * @param token - Token de autenticación
   * @returns Promesa con {success, message} o {error}
   * NOTA: Incrementa automáticamente copiasDisponibles del libro
   */
  async devolverLibro(prestamoId: string, token: string) {
    const response = await fetch(`${API_URL}/prestamos/${prestamoId}/devolver`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * DELETEPRESTAMO - Desactiva un préstamo (solo admin)
   * Endpoint: DELETE /prestamos/:id
   * @param prestamoId - ID del préstamo a desactivar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: Si el préstamo no estaba devuelto, incrementa copiasDisponibles
   */
  async deletePrestamo(prestamoId: string, token: string) {
    const response = await fetch(`${API_URL}/prestamos/${prestamoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * REHABILITARPRESTAMO - Reactiva un préstamo desactivado (solo admin)
   * Endpoint: POST /prestamos/:id/rehabilitar
   * @param prestamoId - ID del préstamo a rehabilitar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: Si el préstamo no está devuelto, decrementa copiasDisponibles
   */
  async rehabilitarPrestamo(prestamoId: string, token: string) {
    const response = await fetch(`${API_URL}/prestamos/${prestamoId}/rehabilitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // GESTIÓN DE MULTAS
  // ==========================================================================
  
  /**
   * GETMULTAS - Obtiene lista de multas
   * Endpoint: GET /multas
   * @param token - Token de autenticación
   * @returns Promesa con {multas: Array} o {error}
   * NOTA: Admin ve todas, clientes solo ven sus multas activas
   * NOTA: Los montos están en pesos colombianos (COP $)
   */
  async getMultas(token: string) {
    const response = await fetch(`${API_URL}/multas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * CREATEMULTA - Crea una nueva multa (solo admin)
   * Endpoint: POST /multas
   * @param data - Datos de la multa {clienteIdentificacion, monto, razon}
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, multa} o {error}
   * NOTA: La multa se crea con activa=true (pendiente de pago)
   */
  async createMulta(data: any, token: string) {
    const response = await fetch(`${API_URL}/multas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * PAGARMULTA - Marca una multa como pagada (solo admin)
   * Endpoint: POST /multas/:id/pagar
   * @param multaId - ID de la multa a marcar como pagada
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: Cambia activa=false y registra fechaPago
   */
  async pagarMulta(multaId: string, token: string) {
    const response = await fetch(`${API_URL}/multas/${multaId}/pagar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * DELETEMULTA - Desactiva una multa del sistema (solo admin)
   * Endpoint: DELETE /multas/:id
   * @param multaId - ID de la multa a desactivar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: Cambia activo=false (la multa desaparece de las vistas)
   */
  async deleteMulta(multaId: string, token: string) {
    const response = await fetch(`${API_URL}/multas/${multaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * REHABILITARMULTA - Reactiva una multa desactivada (solo admin)
   * Endpoint: POST /multas/:id/rehabilitar
   * @param multaId - ID de la multa a rehabilitar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async rehabilitarMulta(multaId: string, token: string) {
    const response = await fetch(`${API_URL}/multas/${multaId}/rehabilitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // REPORTES Y ESTADÍSTICAS
  // ==========================================================================
  
  /**
   * GETREPORTEGENERAL - Obtiene reporte general del sistema (solo admin)
   * Endpoint: GET /reportes/general
   * @param token - Token de autenticación del admin
   * @returns Promesa con {reporte} que incluye:
   *   - libroMasPrestado: Nombre del libro más prestado del mes
   *   - generosMasPrestados: Array de [género, cantidad] top 3
   *   - totalClientes: Cantidad total de clientes activos
   *   - totalLibros: Cantidad total de libros activos
   *   - totalPrestamos: Cantidad de préstamos del mes
   *   - totalMultas: Cantidad de multas activas del mes
   *   - mes: Nombre del mes actual
   * NOTA: Solo incluye datos del mes actual
   */
  async getReporteGeneral(token: string) {
    const response = await fetch(`${API_URL}/reportes/general`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * GETREPORTEMULTAS - Obtiene reporte detallado de multas (solo admin)
   * Endpoint: GET /reportes/multas
   * @param token - Token de autenticación del admin
   * @returns Promesa con {reporte} que incluye:
   *   - cantidadMultas: Total de multas del mes
   *   - multasActivas: Multas pendientes de pago
   *   - multasPagadas: Multas ya pagadas
   *   - montoTotal: Suma total de multas en COP $
   *   - mes: Nombre del mes actual
   *   - multas: Array con detalles de cada multa
   * NOTA: Solo incluye multas del mes actual
   */
  async getReporteMultas(token: string) {
    const response = await fetch(`${API_URL}/reportes/multas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // GESTIÓN DE CATEGORÍAS
  // ==========================================================================
  
  /**
   * GETCATEGORIAS - Obtiene lista de categorías de libros
   * Endpoint: GET /categorias
   * @param token - Token de autenticación
   * @returns Promesa con {categorias: Array} o {error}
   * NOTA: Admin ve todas (incluidas eliminadas), clientes solo activas
   * NOTA: Categorías predeterminadas: Ficción, Ciencia, Historia, Tecnología, Arte
   */
  async getCategorias(token: string) {
    const response = await fetch(`${API_URL}/categorias`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * CREATECATEGORIA - Crea una nueva categoría (solo admin)
   * Endpoint: POST /categorias
   * @param data - Datos de la categoría {nombre, descripcion}
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, categoria} o {error}
   * VALIDACIÓN: No permite nombres duplicados
   */
  async createCategoria(data: any, token: string) {
    const response = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * UPDATECATEGORIA - Actualiza una categoría existente (solo admin)
   * Endpoint: PUT /categorias/:id
   * @param id - ID de la categoría a actualizar
   * @param data - Datos a actualizar {nombre, descripcion}
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, categoria} o {error}
   */
  async updateCategoria(id: string, data: any, token: string) {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * DELETECATEGORIA - Elimina una categoría (borrado lógico) (solo admin)
   * Endpoint: DELETE /categorias/:id
   * @param id - ID de la categoría a eliminar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   * NOTA: No elimina físicamente, solo marca como eliminada
   */
  async deleteCategoria(id: string, token: string) {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  /**
   * REHABILITARCATEGORIA - Reactiva una categoría eliminada (solo admin)
   * Endpoint: POST /categorias/:id/rehabilitar
   * @param id - ID de la categoría a rehabilitar
   * @param token - Token de autenticación del admin
   * @returns Promesa con {success, message} o {error}
   */
  async rehabilitarCategoria(id: string, token: string) {
    const response = await fetch(`${API_URL}/categorias/${id}/rehabilitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // ESTADÍSTICAS GENERALES
  // ==========================================================================
  
  /**
   * GETESTADISTICAS - Obtiene estadísticas generales del sistema (solo admin)
   * Endpoint: GET /estadisticas
   * @param token - Token de autenticación del admin
   * @returns Promesa con {estadisticas} o {error}
   * NOTA: Incluye métricas agregadas de todo el sistema
   */
  async getEstadisticas(token: string) {
    const response = await fetch(`${API_URL}/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // ==========================================================================
  // ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN)
  // ==========================================================================
  
  /**
   * GET - Método genérico para endpoints públicos
   * @param endpoint - Ruta del endpoint (ej: '/libros', '/categorias')
   * @returns Promesa con respuesta del servidor
   * NOTA: Este método se usa para llamadas públicas sin autenticación
   */
  async get(endpoint: string) {
    try {
      const url = `${API_URL}/public${endpoint}`;
      console.log('🌐 [API GET] Llamando a endpoint público:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      console.log('📡 [API GET] Status HTTP:', response.status, response.statusText);
      console.log('📋 [API GET] Headers:', Object.fromEntries(response.headers.entries()));
      
      // PASO 1: Obtener el contenido como texto primero
      const responseText = await response.text();
      console.log('📄 [API GET] Respuesta cruda (primeros 500 caracteres):', responseText.substring(0, 500));
      
      // PASO 2: Verificar si es HTML (página de error)
      if (responseText.trim().startsWith('<')) {
        console.error('❌ [API GET] ERROR: El servidor devolvió HTML en lugar de JSON');
        console.error('🔍 [API GET] Contenido HTML recibido:', responseText.substring(0, 1000));
        return { 
          success: false, 
          error: `El servidor devolvió HTML en lugar de JSON. Status: ${response.status}. Probablemente el endpoint no existe o hay un error en el servidor.`,
          debug: {
            url,
            status: response.status,
            contentType: response.headers.get('content-type'),
            responsePreview: responseText.substring(0, 500)
          }
        };
      }
      
      // PASO 3: Intentar parsear como JSON
      try {
        const data = JSON.parse(responseText);
        console.log('✅ [API GET] JSON parseado correctamente:', data);
        
        // Si el servidor respondió con un error pero en formato JSON
        if (!response.ok) {
          console.error('⚠️ [API GET] Servidor respondió con error:', data);
          return { 
            success: false, 
            error: data.error || `Error del servidor: ${response.status}`,
            data 
          };
        }
        
        return data;
      } catch (parseError) {
        console.error('❌ [API GET] Error al parsear JSON:', parseError);
        console.error('🔍 [API GET] Contenido que falló al parsear:', responseText);
        return { 
          success: false, 
          error: `Error al parsear respuesta JSON: ${parseError.message}`,
          debug: {
            parseError: parseError.message,
            responseText: responseText.substring(0, 500)
          }
        };
      }
    } catch (error) {
      console.error('💥 [API GET] Error general en fetch:', error);
      return { 
        success: false, 
        error: `Error de red o servidor: ${error.message}`,
        debug: {
          errorType: error.name,
          errorMessage: error.message
        }
      };
    }
  }
};