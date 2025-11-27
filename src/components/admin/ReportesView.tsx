import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { FileDown, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as XLSX from 'xlsx';

export const ReportesView: React.FC = () => {
  const { token } = useAuth();
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [multas, setMultas] = useState<any[]>([]);
  const [libros, setLibros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [reporteGeneral, setReporteGeneral] = useState<any>(null);
  const [reporteMultas, setReporteMultas] = useState<any>(null);

  // Establecer fechas por defecto (último mes)
  useEffect(() => {
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(haceUnMes.toISOString().split('T')[0]);
    
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prestamosRes, multasRes, librosRes, clientesRes] = await Promise.all([
        apiClient.getPrestamos(token!),
        apiClient.getMultas(token!),
        apiClient.getLibros(token!),
        apiClient.getClientes(token!)
      ]);

      if (prestamosRes.prestamos) setPrestamos(prestamosRes.prestamos);
      if (multasRes.multas) setMultas(multasRes.multas);
      if (librosRes.libros) setLibros(librosRes.libros);
      if (clientesRes.clientes) setClientes(clientesRes.clientes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const generarReporteGeneral = () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Por favor selecciona un rango de fechas');
      return;
    }

    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      toast.error('La fecha desde no puede ser mayor que la fecha hasta');
      return;
    }

    setLoading(true);

    try {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);

      // Filtrar préstamos por rango de fechas (excluir desactivados)
      const prestamosFiltrados = prestamos.filter((p: any) => {
        const fecha = new Date(p.fechaPrestamo);
        return fecha >= desde && fecha <= hasta && p.activo !== false;
      });

      const prestamosActivos = prestamosFiltrados.filter((p: any) => !p.devuelto);
      const prestamosDevueltos = prestamosFiltrados.filter((p: any) => p.devuelto);

      // Enriquecer con datos de clientes y libros
      const enrichPrestamo = (p: any) => {
        const cliente = clientes.find((c: any) => c.identificacion === p.clienteIdentificacion);
        const libro = libros.find((l: any) => l.id === p.libroId);
        
        return {
          ...p,
          clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A',
          clienteIdentificacion: p.clienteIdentificacion,
          libroNombre: libro?.nombre || 'N/A',
          estado: p.devuelto ? 'Devuelto' : 'Activo'
        };
      };

      const reporte = {
        prestamosActivos: prestamosActivos.map(enrichPrestamo),
        prestamosDevueltos: prestamosDevueltos.map(enrichPrestamo),
        totalPrestamosActivos: prestamosActivos.length,
        totalPrestamosDevueltos: prestamosDevueltos.length
      };

      setReporteGeneral(reporte);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const generarReporteMultas = () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Por favor selecciona un rango de fechas');
      return;
    }

    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      toast.error('La fecha desde no puede ser mayor que la fecha hasta');
      return;
    }

    setLoading(true);

    try {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);

      // Filtrar multas por rango de fechas
      const multasFiltradas = multas.filter((m: any) => {
        const fecha = new Date(m.fechaCreacion);
        return fecha >= desde && fecha <= hasta;
      });

      // Enriquecer con datos de clientes
      const multasEnriquecidas = multasFiltradas.map((m: any) => {
        const cliente = clientes.find((c: any) => c.identificacion === m.clienteIdentificacion);
        return {
          ...m,
          clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : 'N/A',
          clienteIdentificacion: m.clienteIdentificacion
        };
      });

      const multasActivas = multasEnriquecidas.filter((m: any) => m.activa);
      const multasPagadas = multasEnriquecidas.filter((m: any) => !m.activa);

      const reporte = {
        multas: multasEnriquecidas,
        totalMultas: multasEnriquecidas.length,
        multasActivas: multasActivas.length,
        multasPagadas: multasPagadas.length,
        montoTotal: multasActivas.reduce((sum: number, m: any) => sum + m.monto, 0),
        montoPagado: multasPagadas.reduce((sum: number, m: any) => sum + m.monto, 0)
      };

      setReporteMultas(reporte);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      console.error('Error al generar reporte:', error);
      toast.error('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcelGeneral = () => {
    if (!reporteGeneral) {
      toast.error('Primero genera el reporte');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Hoja de préstamos activos
      const activosData = reporteGeneral.prestamosActivos.map((p: any) => ({
        'Cliente': p.clienteNombre,
        'Identificación': p.clienteIdentificacion,
        'Libro': p.libroNombre,
        'Fecha Préstamo': new Date(p.fechaPrestamo).toLocaleDateString('es-ES'),
        'Fecha Vencimiento': p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString('es-ES') : 'N/A',
        'Estado': p.estado
      }));

      const wsActivos = XLSX.utils.json_to_sheet(activosData);
      XLSX.utils.book_append_sheet(wb, wsActivos, 'Préstamos Activos');

      // Hoja de préstamos devueltos
      const devueltosData = reporteGeneral.prestamosDevueltos.map((p: any) => ({
        'Cliente': p.clienteNombre,
        'Identificación': p.clienteIdentificacion,
        'Libro': p.libroNombre,
        'Fecha Préstamo': new Date(p.fechaPrestamo).toLocaleDateString('es-ES'),
        'Fecha Vencimiento': p.fechaVencimiento ? new Date(p.fechaVencimiento).toLocaleDateString('es-ES') : 'N/A',
        'Fecha Devolución': p.fechaDevolucion ? new Date(p.fechaDevolucion).toLocaleDateString('es-ES') : 'N/A',
        'Estado': p.estado
      }));

      const wsDevueltos = XLSX.utils.json_to_sheet(devueltosData);
      XLSX.utils.book_append_sheet(wb, wsDevueltos, 'Préstamos Devueltos');

      // Hoja de resumen
      const resumenData = [{
        'Total Préstamos Activos': reporteGeneral.totalPrestamosActivos,
        'Total Préstamos Devueltos': reporteGeneral.totalPrestamosDevueltos,
        'Total General': reporteGeneral.totalPrestamosActivos + reporteGeneral.totalPrestamosDevueltos,
        'Rango de Fechas': `${new Date(fechaDesde).toLocaleDateString('es-ES')} - ${new Date(fechaHasta).toLocaleDateString('es-ES')}`
      }];

      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      XLSX.writeFile(wb, `Reporte_Prestamos_${fechaDesde}_${fechaHasta}.xlsx`);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const exportarExcelMultas = () => {
    if (!reporteMultas) {
      toast.error('Primero genera el reporte');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Hoja de multas
      const multasData = reporteMultas.multas.map((m: any) => ({
        'Cliente': m.clienteNombre,
        'Identificación': m.clienteIdentificacion,
        'Monto': m.monto,
        'Razón': m.razon,
        'Fecha': new Date(m.fechaCreacion).toLocaleDateString('es-ES'),
        'Estado': m.activa ? 'Pendiente' : 'Pagada'
      }));

      const wsMultas = XLSX.utils.json_to_sheet(multasData);
      XLSX.utils.book_append_sheet(wb, wsMultas, 'Multas');

      // Hoja de resumen
      const resumenData = [{
        'Total Multas': reporteMultas.totalMultas,
        'Multas Activas': reporteMultas.multasActivas,
        'Multas Pagadas': reporteMultas.multasPagadas,
        'Monto Pendiente': `${reporteMultas.montoTotal.toLocaleString('es-CO')}`,
        'Monto Pagado': `${reporteMultas.montoPagado.toLocaleString('es-CO')}`,
        'Rango de Fechas': `${new Date(fechaDesde).toLocaleDateString('es-ES')} - ${new Date(fechaHasta).toLocaleDateString('es-ES')}`
      }];

      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      XLSX.writeFile(wb, `Reporte_Multas_${fechaDesde}_${fechaHasta}.xlsx`);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl">Reportes</h2>
      </div>

      {/* Selector de Rango de Fechas */}
      <Card className="border-0 shadow-sm mb-6">
        <CardHeader className="border-b bg-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rango de Fechas para Reportes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="fecha-desde">Desde</Label>
              <Input
                id="fecha-desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha-hasta">Hasta</Label>
              <Input
                id="fecha-hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="text-sm text-gray-600">
              Selecciona el rango de fechas para generar los reportes
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="general">Reporte General de Préstamos</TabsTrigger>
          <TabsTrigger value="multas">Reporte de Multas</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-white">
              <div className="flex justify-between items-center">
                <CardTitle>Reporte General de Préstamos</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={generarReporteGeneral}
                    disabled={loading}
                    className="bg-[#17A2B8] hover:bg-[#138496] text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {loading ? 'Generando...' : 'Generar Reporte'}
                  </Button>
                  {reporteGeneral && (
                    <Button 
                      onClick={exportarExcelGeneral}
                      className="bg-[#28A745] hover:bg-[#218838] text-white"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Exportar a Excel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!reporteGeneral ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Selecciona un rango de fechas y genera el reporte</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Préstamos Activos</p>
                          <p className="text-4xl">{reporteGeneral.totalPrestamosActivos}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Préstamos Devueltos</p>
                          <p className="text-4xl">{reporteGeneral.totalPrestamosDevueltos}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Total General</p>
                          <p className="text-4xl">
                            {reporteGeneral.totalPrestamosActivos + reporteGeneral.totalPrestamosDevueltos}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Préstamos Activos */}
                  <div>
                    <h3 className="mb-4">Préstamos Activos</h3>
                    {reporteGeneral.prestamosActivos.length > 0 ? (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-medium">Cliente</TableHead>
                              <TableHead className="font-medium">Libro</TableHead>
                              <TableHead className="font-medium">Fecha Préstamo</TableHead>
                              <TableHead className="font-medium">Fecha Vencimiento</TableHead>
                              <TableHead className="font-medium">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reporteGeneral.prestamosActivos.map((prestamo: any, index: number) => (
                              <TableRow key={index} className="bg-white">
                                <TableCell>{prestamo.clienteNombre} ({prestamo.clienteIdentificacion})</TableCell>
                                <TableCell>{prestamo.libroNombre}</TableCell>
                                <TableCell>
                                  {new Date(prestamo.fechaPrestamo).toLocaleDateString('es-ES')}
                                </TableCell>
                                <TableCell>
                                  {prestamo.fechaVencimiento ? new Date(prestamo.fechaVencimiento).toLocaleDateString('es-ES') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#2C2C2C]">Activo</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4 bg-gray-50 rounded">No hay préstamos activos en este rango</p>
                    )}
                  </div>

                  {/* Préstamos Devueltos */}
                  <div>
                    <h3 className="mb-4">Préstamos Devueltos</h3>
                    {reporteGeneral.prestamosDevueltos.length > 0 ? (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-medium">Cliente</TableHead>
                              <TableHead className="font-medium">Libro</TableHead>
                              <TableHead className="font-medium">Fecha Préstamo</TableHead>
                              <TableHead className="font-medium">Fecha Devolución</TableHead>
                              <TableHead className="font-medium">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reporteGeneral.prestamosDevueltos.map((prestamo: any, index: number) => (
                              <TableRow key={index} className="bg-white">
                                <TableCell>{prestamo.clienteNombre} ({prestamo.clienteIdentificacion})</TableCell>
                                <TableCell>{prestamo.libroNombre}</TableCell>
                                <TableCell>
                                  {new Date(prestamo.fechaPrestamo).toLocaleDateString('es-ES')}
                                </TableCell>
                                <TableCell>
                                  {prestamo.fechaDevolucion ? new Date(prestamo.fechaDevolucion).toLocaleDateString('es-ES') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-[#28A745] hover:bg-[#28A745] text-white">Devuelto</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4 bg-gray-50 rounded">No hay préstamos devueltos en este rango</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multas">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-white">
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Multas</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={generarReporteMultas}
                    disabled={loading}
                    className="bg-[#17A2B8] hover:bg-[#138496] text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {loading ? 'Generando...' : 'Generar Reporte'}
                  </Button>
                  {reporteMultas && (
                    <Button 
                      onClick={exportarExcelMultas}
                      className="bg-[#28A745] hover:bg-[#218838] text-white"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Exportar a Excel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!reporteMultas ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Selecciona un rango de fechas y genera el reporte</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Total Multas</p>
                          <p className="text-4xl">{reporteMultas.totalMultas}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Multas Activas</p>
                          <p className="text-4xl">{reporteMultas.multasActivas}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Monto Pendiente</p>
                          <p className="text-2xl">{formatMoney(reporteMultas.montoTotal)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border shadow-sm">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Monto Pagado</p>
                          <p className="text-2xl">{formatMoney(reporteMultas.montoPagado)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Listado de Multas */}
                  <div>
                    <h3 className="mb-4">Detalle de Multas</h3>
                    {reporteMultas.multas.length > 0 ? (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-medium">Cliente</TableHead>
                              <TableHead className="font-medium">Monto</TableHead>
                              <TableHead className="font-medium">Razón</TableHead>
                              <TableHead className="font-medium">Fecha</TableHead>
                              <TableHead className="font-medium">Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reporteMultas.multas.map((multa: any, index: number) => (
                              <TableRow key={index} className="bg-white">
                                <TableCell>{multa.clienteNombre} ({multa.clienteIdentificacion})</TableCell>
                                <TableCell>{formatMoney(multa.monto)}</TableCell>
                                <TableCell>{multa.razon}</TableCell>
                                <TableCell>
                                  {new Date(multa.fechaCreacion).toLocaleDateString('es-ES')}
                                </TableCell>
                                <TableCell>
                                  {multa.activa ? (
                                    <Badge className="bg-[#DC3545] hover:bg-[#DC3545] text-white">Pendiente</Badge>
                                  ) : (
                                    <Badge className="bg-[#28A745] hover:bg-[#28A745] text-white">Pagada</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4 bg-gray-50 rounded">No hay multas en este rango</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
