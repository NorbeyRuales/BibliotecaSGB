import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { QuickHelpLink } from '../common/QuickHelpLink';
import { AlertCircle, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const MisMultas: React.FC = () => {
  const { token } = useAuth();
  const [multas, setMultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMultas();
  }, []);

  const loadMultas = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getMultas(token!);
      if (result.multas) {
        setMultas(result.multas);
      }
    } catch (error) {
      console.error('Error al cargar multas:', error);
      toast.error('Error al cargar multas');
    } finally {
      setLoading(false);
    }
  };

  const multasActivas = multas.filter(m => m.activa);
  const multasPagadas = multas.filter(m => !m.activa);

  const calcularTotal = (multas: any[]) => {
    return multas.reduce((sum, multa) => sum + multa.monto, 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Multas Activas</p>
                <p className="text-3xl">{multasActivas.length}</p>
              </div>
              <DollarSign className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pendiente</p>
                <p className="text-3xl">${calcularTotal(multasActivas).toFixed(2)}</p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Multas Pagadas</p>
                <p className="text-3xl">{multasPagadas.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Multas Activas</CardTitle>
          <CardDescription>
            Multas pendientes de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando multas...</div>
          ) : multasActivas.length === 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                ¡Excelente! No tienes multas activas en este momento.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Tienes multas pendientes. Por favor, acércate a la biblioteca para realizar el pago.
                </AlertDescription>
              </Alert>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multasActivas.map((multa) => (
                      <TableRow key={multa.id}>
                        <TableCell>
                          {new Date(multa.fechaCreacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{multa.razon}</TableCell>
                        <TableCell>
                          <span className="text-red-600">${multa.monto.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Pendiente</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      <strong>Total a pagar: ${calcularTotal(multasActivas).toFixed(2)}</strong>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Para pagar tus multas, dirígete a la biblioteca durante el horario de atención.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {multasPagadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Multas Pagadas</CardTitle>
            <CardDescription>
              Multas que ya has pagado anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                    <TableHead>Razón</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {multasPagadas.map((multa) => (
                    <TableRow key={multa.id}>
                      <TableCell>
                        {new Date(multa.fechaCreacion).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>
                        {multa.fechaPago 
                          ? new Date(multa.fechaPago).toLocaleDateString('es-ES')
                          : '-'}
                      </TableCell>
                      <TableCell>{multa.razon}</TableCell>
                      <TableCell>${multa.monto.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          Pagada
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};