/**
 * ============================================================================
 * COMPONENTE: VISUALIZACIÓN DE LOGS DE AUDITORÍA
 * ============================================================================
 * 
 * Componente para visualizar y analizar los logs de auditoría del sistema.
 * Permite a los administradores ver TODAS las acciones realizadas en el sistema
 * con filtros avanzados, estadísticas y exportación a Excel.
 * 
 * CARACTERÍSTICAS:
 * - Visualización de TODOS los logs en tabla paginada
 * - Filtros por módulo y acción (sin restricciones de fecha)
 * - Estadísticas visuales de actividad
 * - Exportación a Excel
 * - Búsqueda en tiempo real
 * - Detalles expandibles de cada log
 */

import React, { useState, useEffect } from 'react';
import { Download, Search, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import * as XLSX from 'xlsx';
import { toast } from 'sonner@2.0.3';
import { 
  listarLogs, 
  obtenerEstadisticasLogs,
  LogAuditoria,
  MODULOS,
  ACCIONES 
} from '../../utils/auditoria';
import { useAuth } from '../../context/AuthContext';

export default function LogsAuditoriaView() {
  const { user, token } = useAuth();
  
  // Estados para logs
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 50;
  
  // Estados para filtros (sin fechas)
  const [filtroModulo, setFiltroModulo] = useState<string>('');
  const [filtroAccion, setFiltroAccion] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  
  // Estados para estadísticas
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  
  // Estado para detalles expandidos
  const [logExpandido, setLogExpandido] = useState<string | null>(null);

  /**
   * Cargar logs con filtros y paginación
   */
  const cargarLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listarLogs({
        page: currentPage,
        limit,
        modulo: (filtroModulo && filtroModulo !== 'TODOS') ? filtroModulo : undefined,
        accion: (filtroAccion && filtroAccion !== 'TODAS') ? filtroAccion : undefined,
        // Sin filtros de fecha - mostrar todos los registros
      }, token || '');
      
      setLogs(response.logs);
      setTotalPages(response.pagination.totalPages);
      setTotalLogs(response.pagination.total);
      
      // Si no hay logs, verificar si es porque la tabla no existe
      if (response.logs.length === 0 && response.pagination.total === 0 && currentPage === 1) {
        setError('tabla_no_existe');
      }
    } catch (err) {
      console.error('Error al cargar logs:', err);
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      if (errorMsg.includes('does not exist') || errorMsg.includes('Could not find')) {
        setError('tabla_no_existe');
      } else {
        setError('Error al cargar los logs de auditoría');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    setLoadingEstadisticas(true);
    
    try {
      const stats = await obtenerEstadisticasLogs(
        undefined, // Sin filtro de fecha inicio
        undefined, // Sin filtro de fecha fin
        token || ''
      );
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  /**
   * Efecto para cargar logs cuando cambian los filtros o la página
   */
  useEffect(() => {
    cargarLogs();
  }, [currentPage, filtroModulo, filtroAccion]);

  /**
   * Efecto para cargar estadísticas cuando se activa la vista
   */
  useEffect(() => {
    if (mostrarEstadisticas) {
      cargarEstadisticas();
    }
  }, [mostrarEstadisticas]);

  /**
   * Aplicar filtros de búsqueda en tiempo real
   */
  const logsFiltrados = logs.filter(log => {
    if (!busqueda) return true;
    
    const searchLower = busqueda.toLowerCase();
    return (
      log.usuario_nombre.toLowerCase().includes(searchLower) ||
      log.accion.toLowerCase().includes(searchLower) ||
      log.modulo.toLowerCase().includes(searchLower) ||
      (log.entidad_id && log.entidad_id.toLowerCase().includes(searchLower))
    );
  });

  /**
   * Exportar logs a Excel
   */
  const exportarAExcel = () => {
    const datosExportar = logsFiltrados.map(log => ({
      'Fecha y Hora': new Date(log.fecha).toLocaleString('es-CO'),
      'Usuario': log.usuario_nombre,
      'Email': log.usuario_email || 'N/A',
      'Acción': log.accion,
      'Módulo': log.modulo,
      'Entidad ID': log.entidad_id || 'N/A',
      'Detalles': log.detalles ? JSON.stringify(log.detalles) : 'N/A',
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs de Auditoría');
    XLSX.writeFile(wb, `logs_auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltroModulo('');
    setFiltroAccion('');
    setBusqueda('');
    setCurrentPage(1);
  };

  /**
   * Obtener color del badge según la acción
   */
  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'CREAR':
        return 'bg-green-600 hover:bg-green-700';
      case 'EDITAR':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'ELIMINAR':
        return 'bg-red-600 hover:bg-red-700';
      case 'ACTIVAR':
      case 'DESBLOQUEAR':
        return 'bg-teal-600 hover:bg-teal-700';
      case 'BLOQUEAR':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'EXPORTAR':
      case 'VER':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  /**
   * Obtener color del badge según el módulo
   */
  const getModuloColor = (modulo: string) => {
    switch (modulo) {
      case 'USUARIOS':
        return 'bg-indigo-600 hover:bg-indigo-700';
      case 'LIBROS':
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 'PRÉSTAMOS':
        return 'bg-cyan-600 hover:bg-cyan-700';
      case 'MULTAS':
        return 'bg-rose-600 hover:bg-rose-700';
      case 'CATEGORÍAS':
        return 'bg-violet-600 hover:bg-violet-700';
      case 'AUTENTICACIÓN':
        return 'bg-amber-600 hover:bg-amber-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando logs de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Logs de Auditoría</h2>
          <p className="text-gray-600 mt-1">
            Visualiza todas las acciones realizadas en el sistema - Se registran automáticamente
          </p>
          <p className="text-sm text-blue-600 mt-1">
            ℹ️ Mostrando todos los registros disponibles en orden cronológico descendente
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              toast.info('Recargando auditorías...');
              await cargarLogs();
              if (mostrarEstadisticas) {
                await cargarEstadisticas();
              }
              toast.success('Auditorías recargadas correctamente');
            }}
            style={{ backgroundColor: '#17A2B8', borderColor: '#17A2B8' }}
            className="text-white hover:opacity-90"
            title="Recargar auditorías"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>

          <Button
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            variant={mostrarEstadisticas ? 'default' : 'outline'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {mostrarEstadisticas ? 'Ocultar' : 'Ver'} Estadísticas
          </Button>
          
          <Button
            onClick={exportarAExcel}
            style={{ backgroundColor: '#28A745' }}
            className="text-white hover:opacity-90"
            disabled={logsFiltrados.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {mostrarEstadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {loadingEstadisticas ? (
            <div className="col-span-4 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : estadisticas ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total de Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl">{estadisticas.totalAcciones}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acciones por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estadisticas.accionesPorTipo.slice(0, 3).map((item: any) => (
                      <div key={item.tipo} className="flex justify-between text-sm">
                        <span>{item.tipo}</span>
                        <span>{item.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Acciones por Módulo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estadisticas.accionesPorModulo.slice(0, 3).map((item: any) => (
                      <div key={item.modulo} className="flex justify-between text-sm">
                        <span>{item.modulo}</span>
                        <span>{item.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Usuarios Más Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {estadisticas.accionesPorUsuario.slice(0, 3).map((item: any) => (
                      <div key={item.usuario} className="flex justify-between text-sm">
                        <span className="truncate">{item.usuario}</span>
                        <span>{item.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Limpiar Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="text-sm mb-1 block text-gray-700">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar en logs..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por Módulo */}
            <div>
              <label className="text-sm mb-1 block text-gray-700">Módulo</label>
              <Select value={filtroModulo || 'TODOS'} onValueChange={(value) => {
                setFiltroModulo(value === 'TODOS' ? '' : value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los módulos</SelectItem>
                  {Object.values(MODULOS).map(modulo => (
                    <SelectItem key={modulo} value={modulo}>{modulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Acción */}
            <div>
              <label className="text-sm mb-1 block text-gray-700">Acción</label>
              <Select value={filtroAccion || 'TODAS'} onValueChange={(value) => {
                setFiltroAccion(value === 'TODAS' ? '' : value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas las acciones</SelectItem>
                  {Object.values(ACCIONES).map(accion => (
                    <SelectItem key={accion} value={accion}>{accion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Mostrando {logsFiltrados.length} de {totalLogs} registros totales
        </p>
        <p>
          Página {currentPage} de {totalPages}
        </p>
      </div>

      {/* Tabla de logs */}
      <Card>
        <CardContent className="p-0">
          {error === 'tabla_no_existe' ? (
            <div className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl text-gray-900 mb-2">Tabla de Logs No Configurada</h3>
                  <p className="text-gray-600 mb-6">
                    La tabla de auditoría aún no existe en la base de datos de Supabase.
                  </p>
                </div>
                
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-left mb-6">
                  <h4 className="text-lg mb-3 text-blue-900">📝 Pasos para Solucionar (3 minutos):</h4>
                  <ol className="space-y-3 text-sm text-blue-900">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                      <div>
                        <strong>Ve a Supabase:</strong>
                        <br />
                        <a 
                          href="https://supabase.com/dashboard" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          https://supabase.com/dashboard
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                      <div>
                        <strong>Abre SQL Editor:</strong>
                        <br />
                        Menú lateral → "SQL Editor" → "+ New Query"
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
                      <div>
                        <strong>Ejecuta el SQL:</strong>
                        <br />
                        Abre el archivo <code className="bg-white px-2 py-1 rounded">SOLUCION_RAPIDA.txt</code> y copia/pega el SQL
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
                      <div>
                        <strong>Recarga esta página</strong>
                        <br />
                        Presiona F5 y ¡listo!
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
                  <strong>💡 Nota:</strong> El sistema funcionará normalmente, pero no registrará logs hasta que ejecutes el SQL.
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-2">No se encontraron logs de auditoría</p>
              {totalLogs === 0 ? (
                <p className="text-sm text-blue-600 mt-2">
                  💡 Los logs se registran automáticamente. Crea, edita o elimina libros, usuarios o préstamos para ver registros aquí.
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  Intenta ajustar los filtros o limpia la búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Módulo
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">
                      Detalles
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsFiltrados.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setLogExpandido(logExpandido === log.id ? null : log.id!)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.fecha).toLocaleString('es-CO', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.usuario_nombre}</div>
                          {log.usuario_email && (
                            <div className="text-xs text-gray-500">{log.usuario_email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getAccionColor(log.accion)} text-white`}>
                            {log.accion}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getModuloColor(log.modulo)} text-white`}>
                            {log.modulo}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.entidad_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.detalles ? (
                            <span className="text-blue-600 hover:underline">
                              Ver detalles
                            </span>
                          ) : (
                            'Sin detalles'
                          )}
                        </td>
                      </tr>
                      
                      {/* Fila expandida con detalles */}
                      {logExpandido === log.id && log.detalles && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-2">
                              <p className="text-sm">
                                <strong>Detalles completos:</strong>
                              </p>
                              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                {JSON.stringify(log.detalles, null, 2)}
                              </pre>
                              {log.user_agent && (
                                <p className="text-xs text-gray-600">
                                  <strong>Navegador:</strong> {log.user_agent}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
