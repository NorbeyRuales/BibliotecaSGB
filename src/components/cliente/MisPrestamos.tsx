import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { ReciboModal } from '../common/ReciboModal';
import { QuickHelpLink } from '../common/QuickHelpLink';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const MisPrestamos: React.FC = () => {
  const { token, user } = useAuth();
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState<any>(null);
  const [isReciboOpen, setIsReciboOpen] = useState(false);

  useEffect(() => {
    loadPrestamos();
  }, []);

  const loadPrestamos = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getPrestamos(token!);
      if (result.prestamos) {
        setPrestamos(result.prestamos);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (prestamoId: string) => {
    if (!confirm('¿Confirmar la devolución de este libro?')) return;
    
    try {
      const result = await apiClient.devolverLibro(prestamoId, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('¡Libro devuelto correctamente! Gracias.');
        loadPrestamos();
      }
    } catch (error) {
      console.error('Error al devolver libro:', error);
      toast.error('Error al devolver libro');
    }
  };

  const verRecibo = (prestamo: any) => {
    if (prestamo.recibo) {
      setSelectedRecibo(prestamo.recibo);
      setIsReciboOpen(true);
    }
  };

  const prestamosActivos = prestamos.filter(p => !p.devuelto);
  const prestamosDevueltos = prestamos.filter(p => p.devuelto);

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Préstamos Activos</CardTitle>
            <CardDescription>
              Libros que tienes actualmente en préstamo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando préstamos...</div>
            ) : prestamosActivos.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tienes préstamos activos en este momento
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libro</TableHead>
                      <TableHead>Fecha de Préstamo</TableHead>
                      <TableHead>Fecha de Vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prestamosActivos.map((prestamo) => {
                      const fechaVencimiento = prestamo.fechaVencimiento ? new Date(prestamo.fechaVencimiento) : null;
                      const hoy = new Date();
                      const esVencido = fechaVencimiento && hoy > fechaVencimiento;
                      
                      return (
                        <TableRow key={prestamo.id}>
                          <TableCell>
                            <div>
                              <p>{prestamo.libroNombre}</p>
                              <p className="text-sm text-gray-500">ID: {prestamo.libroId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(prestamo.fechaPrestamo).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            {fechaVencimiento ? fechaVencimiento.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </TableCell>
                          <TableCell>
                            {esVencido ? (
                              <Badge className="bg-[#DC3545] hover:bg-[#DC3545] text-white">Vencido</Badge>
                            ) : (
                              <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#2C2C2C]">Activo</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => verRecibo(prestamo)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Recibo
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleDevolver(prestamo.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Devolver
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {prestamosActivos.length > 0 && (
              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Recuerda devolver los libros a tiempo para evitar multas.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Préstamos</CardTitle>
            <CardDescription>
              Libros que has devuelto anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando historial...</div>
            ) : prestamosDevueltos.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tienes préstamos devueltos aún
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Libro</TableHead>
                      <TableHead>Fecha de Préstamo</TableHead>
                      <TableHead>Fecha de Devolución</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prestamosDevueltos.map((prestamo) => (
                      <TableRow key={prestamo.id}>
                        <TableCell>
                          <div>
                            <p>{prestamo.libroNombre}</p>
                            <p className="text-sm text-gray-500">ID: {prestamo.libroId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(prestamo.fechaPrestamo).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          {new Date(prestamo.fechaDevolucion).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50">
                            Devuelto
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verRecibo(prestamo)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Ver Recibo
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReciboModal
        isOpen={isReciboOpen}
        onClose={() => setIsReciboOpen(false)}
        recibo={selectedRecibo}
      />
    </>
  );
};