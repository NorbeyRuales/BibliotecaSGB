import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const EstadisticasView: React.FC = () => {
  const { token } = useAuth();
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getEstadisticas(token!);
      if (result.estadisticas) {
        setEstadisticas(result.estadisticas);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Cargando estadísticas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!estadisticas) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay datos disponibles para generar estadísticas
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl">Estadísticas y Gráficos</h2>
          <p className="text-gray-600">Visualización de datos del sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Préstamos por Mes</CardTitle>
          <CardDescription>
            Cantidad de préstamos realizados en cada mes del año actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadisticas.prestamosPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                labelStyle={{ color: '#333' }}
              />
              <Legend />
              <Bar dataKey="cantidad" fill="#3b82f6" name="Préstamos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Promedio de Libros por Cliente</CardTitle>
            <CardDescription>
              Promedio de libros prestados por cliente registrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="text-6xl text-blue-600 mb-4">
                  {estadisticas.promedioLibrosPorCliente}
                </div>
                <p className="text-gray-600">libros por cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Libros Ingresados por Año</CardTitle>
            <CardDescription>
              Cantidad de libros agregados al inventario por año
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={estadisticas.librosPorAnio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anio" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                  labelStyle={{ color: '#333' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cantidad" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Libros"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevos Clientes por Trimestre</CardTitle>
          <CardDescription>
            Cantidad de nuevos clientes registrados en cada trimestre del año actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadisticas.clientesPorTrimestre}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trimestre" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                labelStyle={{ color: '#333' }}
              />
              <Legend />
              <Bar dataKey="cantidad" fill="#8b5cf6" name="Nuevos Clientes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Las estadísticas se actualizan automáticamente basándose en los datos del sistema.
          Los gráficos muestran información del año actual.
        </AlertDescription>
      </Alert>
    </div>
  );
};
