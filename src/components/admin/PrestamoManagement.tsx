import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { useAuditoria } from '../../hooks/useAuditoria';
import { MODULOS, ACCIONES } from '../../utils/auditoria';
import { ReciboModal } from '../common/ReciboModal';
import { FileText, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

export const PrestamoManagement: React.FC = () => {
  const { token } = useAuth();
  const { registrarLog } = useAuditoria();
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [libros, setLibros] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecibo, setSelectedRecibo] = useState<any>(null);
  const [isReciboOpen, setIsReciboOpen] = useState(false);
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false);
  const [openComboboxCliente, setOpenComboboxCliente] = useState(false);
  const [openComboboxLibro, setOpenComboboxLibro] = useState(false);
  const [formData, setFormData] = useState({
    clienteIdentificacion: '',
    libroId: '',
    fechaPrestamo: new Date().toISOString().split('T')[0],
    fechaVencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    loadPrestamos();
    loadLibros();
    loadClientes();
  }, []);

  useEffect(() => {
    loadPrestamos();
  }, [mostrarDesactivados]);

  const loadPrestamos = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getPrestamos(token!);
      if (result.prestamos) {
        // Filtrar préstamos desactivados por defecto
        const prestamosVisibles = mostrarDesactivados 
          ? result.prestamos 
          : result.prestamos.filter((p: any) => p.activo !== false);
        setPrestamos(prestamosVisibles);
      }
    } catch (error) {
      console.error('Error al cargar préstamos:', error);
      toast.error('Error al cargar préstamos');
    } finally {
      setLoading(false);
    }
  };

  const loadLibros = async () => {
    try {
      const result = await apiClient.getLibros(token!);
      if (result.libros) {
        setLibros(result.libros.filter((l: any) => !l.eliminado));
      }
    } catch (error) {
      console.error('Error al cargar libros:', error);
    }
  };

  const loadClientes = async () => {
    try {
      const result = await apiClient.getClientes(token!);
      if (result.clientes) {
        setClientes(result.clientes.filter((c: any) => !c.eliminado));
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createPrestamo(formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Préstamo creado correctamente');
        
        // Registrar acción en logs de auditoría
        const cliente = clientes.find(c => c.identificacion === formData.clienteIdentificacion);
        const libro = libros.find(l => l.id === formData.libroId);
        await registrarLog(
          ACCIONES.CREAR,
          MODULOS.PRÉSTAMOS,
          result.prestamo?.id,
          {
            cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : formData.clienteIdentificacion,
            libro: libro?.nombre || formData.libroId,
            fechaPrestamo: formData.fechaPrestamo,
            fechaVencimiento: formData.fechaVencimiento
          }
        );
        
        setIsCreateOpen(false);
        resetForm();
        loadPrestamos();
        loadLibros();
        
        if (result.recibo) {
          setSelectedRecibo(result.recibo);
          setIsReciboOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      toast.error('Error al crear préstamo');
    }
  };

  const handleDevolver = async (id: string) => {
    if (!confirm('¿Confirmar devolución del libro?')) return;
    
    try {
      const prestamo = prestamos.find(p => p.id === id);
      const result = await apiClient.devolverLibro(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Libro devuelto correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.EDITAR,
          MODULOS.PRÉSTAMOS,
          id,
          {
            accion: 'Devolución de libro',
            cliente: prestamo?.cliente_nombre || 'N/A',
            libro: prestamo?.libro_nombre || 'N/A',
            fechaDevolucion: new Date().toISOString()
          }
        );
        
        loadPrestamos();
        loadLibros();
      }
    } catch (error) {
      console.error('Error al devolver libro:', error);
      toast.error('Error al devolver libro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar este préstamo?')) return;
    
    try {
      const prestamo = prestamos.find(p => p.id === id);
      const result = await apiClient.deletePrestamo(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Préstamo desactivado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ELIMINAR,
          MODULOS.PRÉSTAMOS,
          id,
          {
            cliente: prestamo?.cliente_nombre || 'N/A',
            libro: prestamo?.libro_nombre || 'N/A',
            accion: 'Desactivación lógica'
          }
        );
        
        loadPrestamos();
        loadLibros();
      }
    } catch (error) {
      console.error('Error al desactivar préstamo:', error);
      toast.error('Error al desactivar préstamo');
    }
  };

  const handleReactivar = async (id: string) => {
    if (!confirm('¿Estás seguro de reactivar este préstamo?')) return;
    
    try {
      const prestamo = prestamos.find(p => p.id === id);
      const result = await apiClient.rehabilitarPrestamo(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Préstamo reactivado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ACTIVAR,
          MODULOS.PRÉSTAMOS,
          id,
          {
            cliente: prestamo?.cliente_nombre || 'N/A',
            libro: prestamo?.libro_nombre || 'N/A',
            accion: 'Reactivación de préstamo'
          }
        );
        
        loadPrestamos();
        loadLibros();
      }
    } catch (error) {
      console.error('Error al reactivar préstamo:', error);
      toast.error('Error al reactivar préstamo');
    }
  };

  const resetForm = () => {
    setFormData({
      clienteIdentificacion: '',
      libroId: '',
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  const filteredPrestamos = prestamos.filter(prestamo =>
    prestamo.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestamo.libroNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prestamo.clienteIdentificacion?.includes(searchTerm)
  );

  // Separar préstamos por estado
  const prestamosActivos = filteredPrestamos.filter(p => !p.devuelto);
  const prestamosDevueltos = filteredPrestamos.filter(p => p.devuelto);

  // Verificar si hay préstamos vencidos
  const prestamosVencidos = prestamosActivos.filter(p => {
    const fechaVencimiento = p.fechaVencimiento ? new Date(p.fechaVencimiento) : null;
    const hoy = new Date();
    return fechaVencimiento && hoy > fechaVencimiento;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const calcularVencimiento = (fechaPrestamo: string) => {
    const fecha = new Date(fechaPrestamo);
    fecha.setDate(fecha.getDate() + 30); // 30 días de préstamo
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Préstamos</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Input
                placeholder="Buscar por cliente o libro"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="bg-white border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF] hover:text-white"
              >
                Buscar
              </Button>

              {prestamosVencidos.length > 0 && (
                <Button className="bg-[#FFC107] hover:bg-[#E0A800] text-[#2C2C2C] border-0">
                  Ver vencidos ({prestamosVencidos.length})
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setMostrarDesactivados(!mostrarDesactivados)}
                className={mostrarDesactivados ? "bg-[#DC3545] text-white border-0 hover:bg-[#C82333]" : "bg-white border-gray-300"}
              >
                {mostrarDesactivados ? '👁️ Ocultar desactivados' : '🔌 Ver desactivados'}
              </Button>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#17A2B8] hover:bg-[#138496] text-white border-0">
                    Nuevo préstamo
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Préstamo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-cliente">Cliente</Label>
                      <Popover open={openComboboxCliente} onOpenChange={setOpenComboboxCliente}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openComboboxCliente}
                            className="w-full justify-between"
                          >
                            {formData.clienteIdentificacion 
                              ? clientes.find((c) => c.identificacion === formData.clienteIdentificacion)
                                ? `${formData.clienteIdentificacion} - ${clientes.find((c) => c.identificacion === formData.clienteIdentificacion)?.nombre} ${clientes.find((c) => c.identificacion === formData.clienteIdentificacion)?.apellido}`
                                : formData.clienteIdentificacion
                              : "Seleccionar cliente"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Buscar cliente..." className="w-full" />
                            <CommandList>
                              <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                              <CommandGroup>
                                {clientes.map((cliente) => (
                                  <CommandItem
                                    key={cliente.identificacion}
                                    value={`${cliente.identificacion} ${cliente.nombre} ${cliente.apellido}`}
                                    onSelect={() => {
                                      setFormData({ ...formData, clienteIdentificacion: cliente.identificacion });
                                      setOpenComboboxCliente(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.clienteIdentificacion === cliente.identificacion ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {cliente.identificacion} - {cliente.nombre} {cliente.apellido}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-libro">Libro</Label>
                      <Popover open={openComboboxLibro} onOpenChange={setOpenComboboxLibro}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openComboboxLibro}
                            className="w-full justify-between"
                          >
                            {formData.libroId 
                              ? libros.find((l) => l.id === formData.libroId)
                                ? `${libros.find((l) => l.id === formData.libroId)?.nombre} - ${libros.find((l) => l.id === formData.libroId)?.autor}`
                                : formData.libroId
                              : "Seleccionar libro"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                          <Command className="w-full">
                            <CommandInput placeholder="Buscar libro..." className="w-full" />
                            <CommandList>
                              <CommandEmpty>No se encontró el libro.</CommandEmpty>
                              <CommandGroup>
                                {libros.filter(l => {
                                  const copias = l.copiasDisponibles ?? l.cantidadCopias ?? (l.disponible ? 1 : 0);
                                  return copias > 0;
                                }).map((libro) => {
                                  const copiasDisp = libro.copiasDisponibles ?? libro.cantidadCopias ?? 1;
                                  const copiasTotal = libro.copiasTotal ?? libro.cantidadCopias ?? 1;
                                  return (
                                  <CommandItem
                                    key={libro.id}
                                    value={`${libro.nombre} ${libro.autor}`}
                                    onSelect={() => {
                                      setFormData({ ...formData, libroId: libro.id });
                                      setOpenComboboxLibro(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.libroId === libro.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {libro.nombre} - {libro.autor} ({copiasDisp}/{copiasTotal} disponibles)
                                  </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-fecha-prestamo">Fecha de Inicio</Label>
                        <Input
                          id="create-fecha-prestamo"
                          type="date"
                          value={formData.fechaPrestamo}
                          onChange={(e) => setFormData({ ...formData, fechaPrestamo: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-fecha-vencimiento">Fecha de Finalización</Label>
                        <Input
                          id="create-fecha-vencimiento"
                          type="date"
                          value={formData.fechaVencimiento}
                          onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                          min={formData.fechaPrestamo}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        resetForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#17A2B8] hover:bg-[#138496]">
                        Crear Préstamo
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Cargando préstamos...</div>
          ) : filteredPrestamos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron préstamos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#2C2C2C] text-white border-b">
                    <TableHead className="font-medium text-white">Cliente</TableHead>
                    <TableHead className="font-medium text-white">Libro</TableHead>
                    <TableHead className="font-medium text-white">Inicio</TableHead>
                    <TableHead className="font-medium text-white">Vencimiento</TableHead>
                    <TableHead className="font-medium text-white">Devolución</TableHead>
                    <TableHead className="font-medium text-white">Estado</TableHead>
                    <TableHead className="font-medium text-white text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrestamos.map((prestamo) => {
                    const fechaVencimiento = prestamo.fechaVencimiento ? new Date(prestamo.fechaVencimiento) : null;
                    const hoy = new Date();
                    const esVencido = fechaVencimiento && hoy > fechaVencimiento && !prestamo.devuelto;

                    return (
                      <TableRow key={prestamo.id} className={prestamo.activo === false ? "bg-red-50" : "bg-white"}>
                        <TableCell>
                          {prestamo.activo === false && <span className="text-red-600 mr-2">🔌</span>}
                          {prestamo.clienteIdentificacion} - {prestamo.clienteNombre}
                        </TableCell>
                        <TableCell>{prestamo.libroNombre}</TableCell>
                        <TableCell>{formatDate(prestamo.fechaPrestamo)}</TableCell>
                        <TableCell>{prestamo.fechaVencimiento ? formatDate(prestamo.fechaVencimiento) : calcularVencimiento(prestamo.fechaPrestamo)}</TableCell>
                        <TableCell>{prestamo.fechaDevolucion ? formatDate(prestamo.fechaDevolucion) : '-'}</TableCell>
                        <TableCell>
                          {prestamo.activo === false ? (
                            <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
                              Desactivado
                            </Badge>
                          ) : prestamo.devuelto ? (
                            <Badge className="bg-[#28A745] hover:bg-[#28A745] text-white">
                              Devuelto
                            </Badge>
                          ) : esVencido ? (
                            <Badge className="bg-[#DC3545] hover:bg-[#DC3545] text-white">
                              Vencido
                            </Badge>
                          ) : (
                            <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#2C2C2C]">
                              En curso
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {prestamo.activo === false ? (
                              <Button
                                size="sm"
                                className="bg-[#28A745] hover:bg-[#218838] text-white"
                                onClick={() => handleReactivar(prestamo.id)}
                              >
                                Reactivar
                              </Button>
                            ) : (
                              <>
                                {!prestamo.devuelto ? (
                                  <Button
                                    size="sm"
                                    className="bg-[#28A745] hover:bg-[#218838] text-white"
                                    onClick={() => handleDevolver(prestamo.id)}
                                  >
                                    Registrar devolución
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-500"
                                    disabled
                                  >
                                    Devuelto
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-[#DC3545] hover:bg-[#C82333] text-white"
                                  onClick={() => handleDelete(prestamo.id)}
                                >
                                  Desactivar
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ReciboModal
        isOpen={isReciboOpen}
        onClose={() => setIsReciboOpen(false)}
        recibo={selectedRecibo}
      />
    </div>
  );
};
