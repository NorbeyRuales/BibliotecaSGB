import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { ReciboModal } from '../common/ReciboModal';
import { QuickHelpLink } from '../common/QuickHelpLink';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Search, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const LibrosCatalogo: React.FC = () => {
  const { token, user } = useAuth();
  const [libros, setLibros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [generoFilter, setGeneroFilter] = useState('todos');
  const [selectedRecibo, setSelectedRecibo] = useState<any>(null);
  const [isReciboOpen, setIsReciboOpen] = useState(false);

  useEffect(() => {
    loadLibros();
  }, []);

  const loadLibros = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getLibros(token!);
      if (result.libros) {
        setLibros(result.libros);
      }
    } catch (error) {
      console.error('Error al cargar libros:', error);
      toast.error('Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarPrestamo = async (libroId: string) => {
    if (user?.bloqueado) {
      toast.error('Tu cuenta está bloqueada. Contacta al administrador.');
      return;
    }

    if (!confirm('¿Deseas solicitar el préstamo de este libro?')) return;

    try {
      const result = await apiClient.createPrestamo(
        { 
          clienteIdentificacion: user?.identificacion,
          libroId 
        }, 
        token!
      );
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('¡Préstamo realizado exitosamente!');
        loadLibros();
        
        if (result.recibo) {
          setSelectedRecibo(result.recibo);
          setIsReciboOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al solicitar préstamo:', error);
      toast.error('Error al solicitar préstamo');
    }
  };

  const generos = ['todos', ...Array.from(new Set(libros.map(libro => libro.genero)))];

  const filteredLibros = libros.filter(libro => {
    // Filtrar libros eliminados
    if (libro.eliminado) return false;
    
    const matchesSearch = 
      libro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenero = generoFilter === 'todos' || libro.genero === generoFilter;

    return matchesSearch && matchesGenero;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Libros</CardTitle>
              <CardDescription>
                Explora nuestra colección y solicita préstamos de libros disponibles
              </CardDescription>
            </div>
            <QuickHelpLink 
              userRole="cliente" 
              currentSection="catalogo"
              text="¿Cómo buscar libros?"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={generoFilter} onValueChange={setGeneroFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por género" />
              </SelectTrigger>
              <SelectContent>
                {generos.map(genero => (
                  <SelectItem key={genero} value={genero}>
                    {genero === 'todos' ? 'Todos los géneros' : genero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {user?.bloqueado && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tu cuenta está bloqueada. No puedes solicitar préstamos en este momento.
                Por favor, contacta al administrador.
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">Cargando libros...</div>
          ) : filteredLibros.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se encontraron libros que coincidan con tu búsqueda
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLibros.map((libro) => {
                const copiasDisponibles = libro.copiasDisponibles ?? 0;
                const copiasTotal = libro.copiasTotal ?? 1;
                const estaDisponible = copiasDisponibles > 0;
                
                return (
                <Card key={libro.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {libro.imagenUrl && libro.imagenUrl.trim() !== '' ? (
                      <div className="mb-4 w-full h-48 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageWithFallback
                          src={libro.imagenUrl}
                          alt={libro.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 w-full h-48 overflow-hidden rounded-lg bg-blue-50 flex items-center justify-center">
                        <BookOpen className="h-20 w-20 text-blue-400" />
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="mb-1">{libro.nombre}</h3>
                      <p className="text-sm text-gray-600">{libro.autor}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Género:</span>
                        <span>{libro.genero}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ISBN:</span>
                        <span className="font-mono text-xs">{libro.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Copias Disponibles:</span>
                        <span className="font-medium">
                          {copiasDisponibles}/{copiasTotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600">Estado:</span>
                        {estaDisponible ? (
                          <Badge variant="default" className="bg-green-500">
                            Disponible
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            No Disponible
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleSolicitarPrestamo(libro.id)}
                      disabled={!estaDisponible || user?.bloqueado}
                    >
                      {estaDisponible ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Solicitar Préstamo
                        </>
                      ) : (
                        'No Disponible'
                      )}
                    </Button>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ReciboModal
        isOpen={isReciboOpen}
        onClose={() => setIsReciboOpen(false)}
        recibo={selectedRecibo}
      />
    </>
  );
};