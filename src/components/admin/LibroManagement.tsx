import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { useAuditoria } from '../../hooks/useAuditoria';
import { MODULOS, ACCIONES } from '../../utils/auditoria';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Plus, Search, Edit, Trash2, AlertCircle, RotateCcw, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

export const LibroManagement: React.FC = () => {
  const { token } = useAuth();
  const { registrarLog } = useAuditoria();
  const [libros, setLibros] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedLibro, setSelectedLibro] = useState<any>(null);
  const [openComboboxCreate, setOpenComboboxCreate] = useState(false);
  const [openComboboxEdit, setOpenComboboxEdit] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [formData, setFormData] = useState({
    idLibro: '',
    nombre: '',
    genero: '',
    numPaginas: '',
    copiasTotal: '',
    autor: '',
    imagenUrl: ''
  });

  useEffect(() => {
    loadLibros();
    loadCategorias();
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

  const loadCategorias = async () => {
    try {
      const result = await apiClient.getCategorias(token!);
      if (result.categorias) {
        setCategorias(result.categorias.filter((c: any) => !c.eliminado));
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createLibro(formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Libro creado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.CREAR,
          MODULOS.LIBROS,
          result.libro?.id,
          {
            nombre: formData.nombre,
            autor: formData.autor,
            genero: formData.genero,
            isbn: formData.idLibro,
            numPaginas: formData.numPaginas,
            copiasTotal: formData.copiasTotal
          }
        );
        
        setIsCreateOpen(false);
        resetForm();
        loadLibros();
      }
    } catch (error) {
      console.error('Error al crear libro:', error);
      toast.error('Error al crear libro');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.updateLibro(selectedLibro.id, formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Libro actualizado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.EDITAR,
          MODULOS.LIBROS,
          selectedLibro.id,
          {
            nombre: formData.nombre,
            autor: formData.autor,
            genero: formData.genero,
            isbn: formData.idLibro,
            cambios: 'Libro actualizado'
          }
        );
        
        setIsEditOpen(false);
        setSelectedLibro(null);
        resetForm();
        loadLibros();
      }
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      toast.error('Error al actualizar libro');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar este libro?')) return;
    
    try {
      const libro = libros.find(l => l.id === id);
      const result = await apiClient.deleteLibro(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Libro desactivado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ELIMINAR,
          MODULOS.LIBROS,
          id,
          {
            nombre: libro?.nombre,
            autor: libro?.autor,
            isbn: libro?.idLibro
          }
        );
        
        loadLibros();
      }
    } catch (error) {
      console.error('Error al desactivar libro:', error);
      toast.error('Error al desactivar libro');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const libro = libros.find(l => l.id === id);
      const result = await apiClient.rehabilitarLibro(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Libro activado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ACTIVAR,
          MODULOS.LIBROS,
          id,
          {
            nombre: libro?.nombre,
            autor: libro?.autor,
            isbn: libro?.idLibro
          }
        );
        
        loadLibros();
      }
    } catch (error) {
      console.error('Error al activar libro:', error);
      toast.error('Error al activar libro');
    }
  };

  const openEditDialog = (libro: any) => {
    setSelectedLibro(libro);
    setFormData({
      idLibro: libro.id,
      nombre: libro.nombre,
      genero: libro.genero,
      numPaginas: libro.numPaginas ? libro.numPaginas.toString() : '',
      copiasTotal: (libro.copiasTotal || '').toString(),
      autor: libro.autor,
      imagenUrl: libro.imagenUrl || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      idLibro: '',
      nombre: '',
      genero: '',
      numPaginas: '',
      copiasTotal: '',
      autor: '',
      imagenUrl: ''
    });
  };

  const filteredLibros = libros.filter(libro => {
    // Filtro de búsqueda por texto
    const matchesSearch = libro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.genero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      libro.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría
    const matchesCategoria = filterCategoria === 'todas' || libro.genero === filterCategoria;
    
    // Filtro por estado
    const matchesEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && !libro.eliminado) ||
      (filterEstado === 'inactivo' && libro.eliminado);
    
    return matchesSearch && matchesCategoria && matchesEstado;
  });

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Libros</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, autor, categoría o ISBN"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-300"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="w-full sm:w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="w-full sm:w-40 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="activos">Activos</SelectItem>
                    <SelectItem value="inactivos">Inactivos</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-[#28A745] hover:bg-[#218838] text-white border-0">
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Libro</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-id">ISBN</Label>
                      <Input
                        id="create-id"
                        value={formData.idLibro}
                        onChange={(e) => setFormData({ ...formData, idLibro: e.target.value })}
                        placeholder="Ej: 2"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-nombre">Título</Label>
                      <Input
                        id="create-nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-autor">Autor</Label>
                      <Input
                        id="create-autor"
                        value={formData.autor}
                        onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-genero">Categoría</Label>
                      {categorias.length > 0 ? (
                        <Popover open={openComboboxCreate} onOpenChange={setOpenComboboxCreate}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openComboboxCreate}
                              className="w-full justify-between"
                            >
                              {formData.genero || "Seleccionar categoría"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command className="w-full">
                              <CommandInput placeholder="Buscar categoría..." className="w-full" />
                              <CommandList>
                                <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                                <CommandGroup>
                                  {categorias.map((cat) => (
                                    <CommandItem
                                      key={cat.id}
                                      value={cat.nombre}
                                      onSelect={(currentValue) => {
                                        setFormData({ ...formData, genero: currentValue });
                                        setOpenComboboxCreate(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.genero === cat.nombre ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {cat.nombre}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          id="create-genero"
                          value={formData.genero}
                          onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                          placeholder="Ej: Ficción, Ciencia, etc."
                          required
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-paginas">Número de Páginas</Label>
                        <Input
                          id="create-paginas"
                          type="number"
                          min="1"
                          value={formData.numPaginas}
                          onChange={(e) => setFormData({ ...formData, numPaginas: e.target.value })}
                          placeholder="Ej: 320"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-copias">Total de Copias</Label>
                        <Input
                          id="create-copias"
                          type="number"
                          min="1"
                          value={formData.copiasTotal}
                          onChange={(e) => setFormData({ ...formData, copiasTotal: e.target.value })}
                          placeholder="Ej: 5"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-imagen">URL de la Imagen (opcional)</Label>
                      <Input
                        id="create-imagen"
                        type="url"
                        value={formData.imagenUrl}
                        onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        resetForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-[#28A745] hover:bg-[#218838]">
                        Registrar Libro
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Filtros avanzados */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="filter-categoria" className="whitespace-nowrap">Categoría:</Label>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger id="filter-categoria" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="filter-estado" className="whitespace-nowrap">Estado:</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger id="filter-estado" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(filterCategoria !== 'todas' || filterEstado !== 'todos' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCategoria('todas');
                  setFilterEstado('todos');
                  setSearchTerm('');
                }}
                className="text-gray-600"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Cargando libros...</div>
          ) : filteredLibros.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron libros
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium">Título</TableHead>
                    <TableHead className="font-medium">Autor</TableHead>
                    <TableHead className="font-medium">ISBN</TableHead>
                    <TableHead className="font-medium">Categoría</TableHead>
                    <TableHead className="font-medium">Copias (Disp/Total)</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLibros.map((libro) => {
                    const copiasDisponibles = libro.copiasDisponibles ?? 0;
                    const copiasTotal = libro.copiasTotal ?? 1;
                    
                    return (
                    <TableRow key={libro.id} className={libro.eliminado ? 'bg-gray-50 opacity-60' : 'bg-white'}>
                      <TableCell>{libro.nombre}</TableCell>
                      <TableCell>{libro.autor}</TableCell>
                      <TableCell>{libro.id}</TableCell>
                      <TableCell>{libro.genero}</TableCell>
                      <TableCell>
                        <span className={copiasDisponibles === 0 ? 'text-red-600 font-medium' : ''}>
                          {copiasDisponibles}/{copiasTotal}
                        </span>
                      </TableCell>
                      <TableCell>
                        {libro.eliminado ? (
                          <Badge variant="secondary" className="bg-gray-300 text-gray-700">
                            Inactivo
                          </Badge>
                        ) : (
                          <Badge className="bg-[#28A745] hover:bg-[#28A745] text-white">
                            Activo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                          {!libro.eliminado && (
                            <Button
                              size="sm"
                              className="bg-[#007BFF] hover:bg-[#0069D9] text-white text-xs px-2 py-1"
                              onClick={() => openEditDialog(libro)}
                            >
                              Editar
                            </Button>
                          )}
                          
                          {libro.eliminado ? (
                            <Button
                              size="sm"
                              className="bg-[#28A745] hover:bg-[#218838] text-white text-xs px-2 py-1"
                              onClick={() => handleRestore(libro.id)}
                            >
                              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Activar</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#DC3545] hover:bg-[#C82333] text-white text-xs px-2 py-1"
                              onClick={() => handleDelete(libro.id)}
                            >
                              Eliminar
                            </Button>
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Libro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>ISBN</Label>
              <Input value={formData.idLibro} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Título</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-autor">Autor</Label>
              <Input
                id="edit-autor"
                value={formData.autor}
                onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-genero">Categoría</Label>
              {categorias.length > 0 ? (
                <Popover open={openComboboxEdit} onOpenChange={setOpenComboboxEdit}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openComboboxEdit}
                      className="w-full justify-between"
                    >
                      {formData.genero || "Seleccionar categoría"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command className="w-full">
                      <CommandInput placeholder="Buscar categoría..." className="w-full" />
                      <CommandList>
                        <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                        <CommandGroup>
                          {categorias.map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.nombre}
                              onSelect={(currentValue) => {
                                setFormData({ ...formData, genero: currentValue });
                                setOpenComboboxEdit(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.genero === cat.nombre ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {cat.nombre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  id="edit-genero"
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-paginas">Número de Páginas</Label>
                <Input
                  id="edit-paginas"
                  type="number"
                  min="1"
                  value={formData.numPaginas}
                  onChange={(e) => setFormData({ ...formData, numPaginas: e.target.value })}
                  placeholder="Ej: 320"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-copias">Total de Copias</Label>
                <Input
                  id="edit-copias"
                  type="number"
                  min="1"
                  value={formData.copiasTotal}
                  onChange={(e) => setFormData({ ...formData, copiasTotal: e.target.value })}
                  placeholder="Ej: 5"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-imagen">URL de la Imagen (opcional)</Label>
              <Input
                id="edit-imagen"
                type="url"
                value={formData.imagenUrl}
                onChange={(e) => setFormData({ ...formData, imagenUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditOpen(false);
                setSelectedLibro(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#007BFF] hover:bg-[#0069D9]">
                Actualizar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
