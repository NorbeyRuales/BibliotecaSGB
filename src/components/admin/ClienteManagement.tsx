import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const ClienteManagement: React.FC = () => {
  const { token } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [formData, setFormData] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    email: ''
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getClientes(token!);
      if (result.clientes) {
        setClientes(result.clientes);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createCliente(formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cliente creado correctamente');
        setIsCreateOpen(false);
        resetForm();
        loadClientes();
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error('Error al crear cliente');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.updateCliente(selectedCliente.identificacion, formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cliente actualizado correctamente');
        setIsEditOpen(false);
        setSelectedCliente(null);
        resetForm();
        loadClientes();
      }
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      toast.error('Error al actualizar cliente');
    }
  };

  const handleDelete = async (identificacion: string) => {
    if (!confirm('¿Está seguro de desactivar este cliente?')) return;
    
    try {
      const result = await apiClient.deleteCliente(identificacion, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cliente desactivado correctamente');
        loadClientes();
      }
    } catch (error) {
      console.error('Error al desactivar cliente:', error);
      toast.error('Error al desactivar cliente');
    }
  };

  const handleRestore = async (identificacion: string) => {
    try {
      const result = await apiClient.rehabilitarCliente(identificacion, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cliente activado correctamente');
        loadClientes();
      }
    } catch (error) {
      console.error('Error al activar cliente:', error);
      toast.error('Error al activar cliente');
    }
  };

  const openEditDialog = (cliente: any) => {
    setSelectedCliente(cliente);
    setFormData({
      identificacion: cliente.identificacion,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      fechaNacimiento: cliente.fechaNacimiento,
      email: cliente.email || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      identificacion: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      email: ''
    });
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.identificacion?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Clientes</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Input
                placeholder="Buscar por nombre, email o documento"
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
                    Nuevo
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-nombre">Nombre</Label>
                        <Input
                          id="create-nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-apellido">Apellido</Label>
                        <Input
                          id="create-apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-identificacion">Documento</Label>
                      <Input
                        id="create-identificacion"
                        value={formData.identificacion}
                        onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-email">Email</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-fecha">Fecha de Nacimiento</Label>
                      <Input
                        id="create-fecha"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                        required
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
                        Crear Cliente
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
            <div className="text-center py-8">Cargando clientes...</div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron clientes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium">Nombre</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Teléfono</TableHead>
                    <TableHead className="font-medium">Documento</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.identificacion} className={cliente.eliminado ? 'bg-gray-50 opacity-60' : 'bg-white'}>
                      <TableCell>{cliente.nombre} {cliente.apellido}</TableCell>
                      <TableCell>{cliente.email || 'N/A'}</TableCell>
                      <TableCell>None</TableCell>
                      <TableCell>{cliente.identificacion}</TableCell>
                      <TableCell>
                        {cliente.eliminado ? (
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
                          {!cliente.eliminado && (
                            <Button
                              size="sm"
                              className="bg-[#007BFF] hover:bg-[#0069D9] text-white"
                              onClick={() => openEditDialog(cliente)}
                            >
                              Editar
                            </Button>
                          )}
                          
                          {cliente.eliminado ? (
                            <Button
                              size="sm"
                              className="bg-[#28A745] hover:bg-[#218838] text-white"
                              onClick={() => handleRestore(cliente.identificacion)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Activar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#DC3545] hover:bg-[#C82333] text-white"
                              onClick={() => handleDelete(cliente.identificacion)}
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
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Documento</Label>
              <Input value={formData.identificacion} disabled className="bg-gray-100" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="edit-apellido">Apellido</Label>
                <Input
                  id="edit-apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fecha">Fecha de Nacimiento</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditOpen(false);
                setSelectedCliente(null);
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
