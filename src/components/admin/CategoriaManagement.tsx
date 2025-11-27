import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const CategoriaManagement: React.FC = () => {
  const { token } = useAuth();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getCategorias(token!);
      if (result.categorias) {
        setCategorias(result.categorias);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createCategoria(formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoría creada correctamente');
        setIsCreateOpen(false);
        resetForm();
        loadCategorias();
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      toast.error('Error al crear categoría');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.updateCategoria(selectedCategoria.id, formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoría actualizada correctamente');
        setIsEditOpen(false);
        setSelectedCategoria(null);
        resetForm();
        loadCategorias();
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      toast.error('Error al actualizar categoría');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar esta categoría?')) return;
    
    try {
      const result = await apiClient.deleteCategoria(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoría desactivada correctamente');
        loadCategorias();
      }
    } catch (error) {
      console.error('Error al desactivar categoría:', error);
      toast.error('Error al desactivar categoría');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const result = await apiClient.rehabilitarCategoria(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Categoría activada correctamente');
        loadCategorias();
      }
    } catch (error) {
      console.error('Error al activar categoría:', error);
      toast.error('Error al activar categoría');
    }
  };

  const openEditDialog = (categoria: any) => {
    setSelectedCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    });
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Categorías</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Input
                placeholder="Buscar por nombre o descripción"
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
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#28A745] hover:bg-[#218838] text-white border-0">
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Categoría</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-nombre">Nombre</Label>
                      <Input
                        id="create-nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Ficción, Ciencia, Historia..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-descripcion">Descripción</Label>
                      <Textarea
                        id="create-descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Descripción opcional de la categoría"
                        rows={3}
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
                        Crear Categoría
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
            <div className="text-center py-8">Cargando categorías...</div>
          ) : filteredCategorias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron categorías
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium">Nombre</TableHead>
                    <TableHead className="font-medium">Descripción</TableHead>
                    <TableHead className="font-medium">Fecha de Creación</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategorias.map((categoria) => (
                    <TableRow key={categoria.id} className={categoria.eliminado ? 'bg-gray-50 opacity-60' : 'bg-white'}>
                      <TableCell className="font-medium">{categoria.nombre}</TableCell>
                      <TableCell>{categoria.descripcion || '-'}</TableCell>
                      <TableCell>
                        {new Date(categoria.createdAt).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>
                        {categoria.eliminado ? (
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
                        <div className="flex justify-end gap-2">
                          {!categoria.eliminado && (
                            <Button
                              size="sm"
                              className="bg-[#007BFF] hover:bg-[#0069D9] text-white"
                              onClick={() => openEditDialog(categoria)}
                            >
                              Editar
                            </Button>
                          )}
                          
                          {categoria.eliminado ? (
                            <Button
                              size="sm"
                              className="bg-[#28A745] hover:bg-[#218838] text-white"
                              onClick={() => handleRestore(categoria.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Activar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#DC3545] hover:bg-[#C82333] text-white"
                              onClick={() => handleDelete(categoria.id)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditOpen(false);
                setSelectedCategoria(null);
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
