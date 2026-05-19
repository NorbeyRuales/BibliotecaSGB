/**
 * ============================================================================
 * PUBLICCATALOGO - VISTA PÚBLICA DEL CATÁLOGO
 * ============================================================================
 * Vista pública principal del Sistema de Gestión de Biblioteca (SGB)
 * Permite explorar el catálogo de libros sin necesidad de iniciar sesión
 * Incluye restricciones para solicitar préstamos (requiere autenticación)
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Search, BookOpen, Lock, UserPlus, LogIn, Eye, AlertCircle, Library, Filter, BookMarked, ChevronDown } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { HelpButton } from '../common/HelpButton';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import logoImage from 'figma:asset/d98fea41c2fe4b78955c4108114601a7d4892aa9.png';

interface Libro {
  id: string;
  titulo: string;
  autor: string;
  isbn: string;
  editorial?: string;
  anio_publicacion?: number;
  descripcion?: string;
  copias_disponibles: number;
  copias_totales?: number;
  imagen_portada?: string;
  categoria?: {
    id: string;
    nombre: string;
  };
}

interface Categoria {
  id: string;
  nombre: string;
}

interface PublicCatalogoProps {
  onRegistroClick: () => void;
  onLoginClick: () => void;
}

const heroBackground = 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1400&q=80';

export function PublicCatalogo({ onRegistroClick, onLoginClick }: PublicCatalogoProps) {
  const catalogoRef = useRef<HTMLElement | null>(null);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [disponibilidadFiltro, setDisponibilidadFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [libroSeleccionado, setLibroSeleccionado] = useState<Libro | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarAlertaPrestamo, setMostrarAlertaPrestamo] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      console.log('📚 [PublicCatalogo] Iniciando carga de datos públicos...');
      
      // Cargar libros y categorías sin autenticación
      const [librosRes, categoriasRes] = await Promise.all([
        apiClient.get('/libros'),
        apiClient.get('/categorias')
      ]);

      console.log('📗 [PublicCatalogo] Respuesta libros:', librosRes);
      console.log('📁 [PublicCatalogo] Respuesta categorías:', categoriasRes);

      if (librosRes.success && librosRes.data) {
        console.log(`✅ [PublicCatalogo] ${librosRes.data.length} libros cargados correctamente`);
        setLibros(librosRes.data || []);
      } else {
        console.error('❌ [PublicCatalogo] Error al cargar libros:', librosRes.error || 'Respuesta inválida');
        if (librosRes.debug) {
          console.error('🔍 [PublicCatalogo] Info de debug:', librosRes.debug);
        }
      }

      if (categoriasRes.success && categoriasRes.data) {
        console.log(`✅ [PublicCatalogo] ${categoriasRes.data.length} categorías cargadas correctamente`);
        setCategorias(categoriasRes.data || []);
      } else {
        console.error('❌ [PublicCatalogo] Error al cargar categorías:', categoriasRes.error || 'Respuesta inválida');
        if (categoriasRes.debug) {
          console.error('🔍 [PublicCatalogo] Info de debug:', categoriasRes.debug);
        }
      }
    } catch (error) {
      console.error('💥 [PublicCatalogo] Error inesperado al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar libros según búsqueda, categoría y disponibilidad
  const librosFiltrados = libros.filter(libro => {
    const matchBusqueda = busqueda === '' || 
      libro.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
      libro.isbn.toLowerCase().includes(busqueda.toLowerCase());

    const matchCategoria = categoriaFiltro === 'todas' || 
      libro.categoria?.id === categoriaFiltro;

    const matchDisponibilidad = disponibilidadFiltro === 'todas' || 
      (disponibilidadFiltro === 'disponible' && libro.copias_disponibles > 0) ||
      (disponibilidadFiltro === 'no-disponible' && libro.copias_disponibles === 0);

    return matchBusqueda && matchCategoria && matchDisponibilidad;
  });

  // Calcular estadísticas para el hero
  const totalLibros = libros.length;
  const librosDisponibles = libros.filter(l => l.copias_disponibles > 0).length;
  const totalCategorias = categorias.length;

  // Manejar clic en "Solicitar préstamo" - siempre muestra alerta (usuario no autenticado)
  const handleSolicitarPrestamo = (libro: Libro) => {
    setLibroSeleccionado(libro);
    setMostrarAlertaPrestamo(true);
  };

  // Manejar clic en "Ver detalles" - funciona sin autenticación
  const handleVerDetalles = (libro: Libro) => {
    setLibroSeleccionado(libro);
    setMostrarDetalles(true);
  };

  const scrollToCatalogo = () => {
    const target = catalogoRef.current || document.getElementById('catalogo-publico');
    if (!target) return;

    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header/Navbar */}
      <nav className="sticky top-0 z-50 border-b shadow-sm" style={{ backgroundColor: '#2C2C2C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Biblioteca SGB" className="h-16 w-auto" />
              <div>
                <h1 className="text-white">Sistema de Gestión de Biblioteca</h1>
                <p className="text-gray-400 text-sm">Explora nuestro catálogo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={onLoginClick}
                className="gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: '#28A745' }}
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Button>
              <Button
                onClick={onRegistroClick}
                className="gap-2 text-white hover:opacity-90"
                style={{ backgroundColor: '#28A745' }}
              >
                <UserPlus className="w-4 h-4" />
                Registrarse gratis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="relative overflow-hidden text-slate-900"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,126,255,0.85), rgba(0,183,255,0.7)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/70 via-sky-400/50 to-blue-500/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="text-white drop-shadow-sm">

              <p className="mt-4 text-lg text-blue-50 max-w-2xl">
                Descubre, reserva y gestiona tus libros favoritos en línea. Inicia sesión o crea tu cuenta gratuita para explorar el catálogo completo y comenzar a leer.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="rounded-2xl bg-white/60 p-6 shadow-2xl backdrop-blur">
                <img
                  src={heroBackground}
                  alt="Lectura digital"
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
          <Button
            type="button"
            onClick={scrollToCatalogo}
            className="gap-2 bg-white text-blue-700 shadow-xl hover:bg-blue-50"
          >
            Explora nuestro catálogo
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Catálogo público */}
      <main id="catalogo-publico" ref={catalogoRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 scroll-mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 sm:mt-20">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Libros</p>
                <p className="text-2xl font-semibold">{totalLibros}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                <BookMarked className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Disponibles</p>
                <p className="text-2xl font-semibold">{librosDisponibles}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Filter className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categorías</p>
                <p className="text-2xl font-semibold">{totalCategorias}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-blue-600" />
              Catálogo público
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, autor o ISBN..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={disponibilidadFiltro} onValueChange={setDisponibilidadFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Disponibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos los estados</SelectItem>
                  <SelectItem value="disponible">Disponibles</SelectItem>
                  <SelectItem value="no-disponible">No disponibles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Cargando catálogo...
              </div>
            ) : librosFiltrados.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium">No se encontraron libros</p>
                <p className="text-sm text-gray-500">
                  Ajusta la búsqueda o cambia los filtros para ver más resultados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {librosFiltrados.map((libro) => {
                  const estaDisponible = libro.copias_disponibles > 0;

                  return (
                    <Card key={libro.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="h-52 bg-blue-50 flex items-center justify-center">
                        {libro.imagen_portada ? (
                          <ImageWithFallback
                            src={libro.imagen_portada}
                            alt={libro.titulo}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-20 w-20 text-blue-300" />
                        )}
                      </div>

                      <CardContent className="p-5 space-y-4">
                        <div className="min-h-[72px]">
                          <h3 className="font-semibold line-clamp-2">{libro.titulo}</h3>
                          <p className="text-sm text-gray-600 mt-1">{libro.autor}</p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Categoría</span>
                            <span className="text-right">{libro.categoria?.nombre || 'Sin categoría'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">ISBN</span>
                            <span className="font-mono text-xs text-right">{libro.isbn}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-gray-500">Copias</span>
                            <span>
                              {libro.copias_disponibles}/{libro.copias_totales || libro.copias_disponibles}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge
                            style={{
                              backgroundColor: estaDisponible ? '#28A745' : '#DC3545',
                              color: 'white',
                              borderColor: 'transparent'
                            }}
                          >
                            {estaDisponible ? 'Disponible' : 'No disponible'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleVerDetalles(libro)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </Button>
                          <Button
                            onClick={() => handleSolicitarPrestamo(libro)}
                            disabled={!estaDisponible}
                            className="gap-2 text-white"
                            style={{ backgroundColor: estaDisponible ? '#007BFF' : undefined }}
                          >
                            <Lock className="h-4 w-4" />
                            Solicitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src={logoImage} alt="Biblioteca SGB" className="h-8 w-auto brightness-0 invert" />
              <span className="font-semibold">Biblioteca SGB</span>
            </div>
            <p className="text-gray-400 text-sm">
              Sistema de Gestión de Biblioteca - Tu biblioteca digital siempre disponible
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de detalles del libro - funciona SIN autenticación */}
      <Dialog open={mostrarDetalles} onOpenChange={setMostrarDetalles}>
        <DialogContent className="max-w-2xl">
          {libroSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{libroSeleccionado.titulo}</DialogTitle>
                <DialogDescription>
                  por {libroSeleccionado.autor}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Portada */}
                <div className="md:col-span-1">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center h-64">
                    {libroSeleccionado.imagen_portada ? (
                      <ImageWithFallback 
                        src={libroSeleccionado.imagen_portada} 
                        alt={libroSeleccionado.titulo}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Detalles */}
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">Estado</span>
                      <div className="mt-1">
                        <Badge
                          style={{
                            backgroundColor: libroSeleccionado.copias_disponibles > 0 ? '#28A745' : '#DC3545',
                            color: 'white',
                            borderColor: 'transparent'
                          }}
                        >
                          {libroSeleccionado.copias_disponibles > 0 ? 'Disponible' : 'No disponible'}
                        </Badge>
                      </div>
                    </div>

                    {libroSeleccionado.categoria && (
                      <div>
                        <span className="text-sm text-gray-500">Categoría</span>
                        <p className="mt-1">{libroSeleccionado.categoria.nombre}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-sm text-gray-500">ISBN</span>
                      <p className="mt-1">{libroSeleccionado.isbn}</p>
                    </div>

                    {libroSeleccionado.editorial && (
                      <div>
                        <span className="text-sm text-gray-500">Editorial</span>
                        <p className="mt-1">{libroSeleccionado.editorial}</p>
                      </div>
                    )}

                    {libroSeleccionado.anio_publicacion && (
                      <div>
                        <span className="text-sm text-gray-500">Año de publicación</span>
                        <p className="mt-1">{libroSeleccionado.anio_publicacion}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-sm text-gray-500">Disponibilidad</span>
                      <p className="mt-1">
                        {libroSeleccionado.copias_disponibles} de {libroSeleccionado.copias_totales || libroSeleccionado.copias_disponibles} copias disponibles
                      </p>
                    </div>

                    {libroSeleccionado.descripcion && (
                      <div>
                        <span className="text-sm text-gray-500">Descripción</span>
                        <p className="mt-1 text-sm text-gray-700">{libroSeleccionado.descripcion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => {
                    setMostrarDetalles(false);
                    handleSolicitarPrestamo(libroSeleccionado);
                  }}
                  className="gap-2 text-white"
                  style={{ backgroundColor: '#007BFF' }}
                  disabled={libroSeleccionado.copias_disponibles === 0}
                >
                  <Lock className="w-4 h-4" />
                  Solicitar préstamo
                </Button>
                <Button
                  onClick={() => setMostrarDetalles(false)}
                  variant="outline"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para solicitud de préstamo - requiere autenticación */}
      <AlertDialog open={mostrarAlertaPrestamo} onOpenChange={setMostrarAlertaPrestamo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-600" />
              Autenticación requerida
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Para solicitar un préstamo del libro <strong>"{libroSeleccionado?.titulo}"</strong> necesitas tener una cuenta en el Sistema de Gestión de Biblioteca.
              <br /><br />
              ¿Ya tienes cuenta? Inicia sesión. ¿Eres nuevo? Regístrate gratis en segundos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setMostrarAlertaPrestamo(false);
                onRegistroClick();
              }}
              className="gap-2 text-white hover:opacity-90"
              style={{ backgroundColor: '#28A745' }}
            >
              <UserPlus className="w-4 h-4" />
              Crear cuenta nueva
            </Button>
            <Button
              onClick={() => {
                setMostrarAlertaPrestamo(false);
                onLoginClick();
              }}
              className="gap-2"
              style={{ backgroundColor: '#007BFF', color: 'white' }}
            >
              <LogIn className="w-4 h-4" />
              Iniciar sesión
            </Button>
            <Button
              onClick={() => setMostrarAlertaPrestamo(false)}
              variant="outline"
            >
              Cancelar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Botón flotante de ayuda */}
      <HelpButton 
        userRole="guest" 
        currentSection="catalogo-publico"
        onRegistroClick={onRegistroClick}
        onLoginClick={onLoginClick}
      />
    </div>
  );
}
