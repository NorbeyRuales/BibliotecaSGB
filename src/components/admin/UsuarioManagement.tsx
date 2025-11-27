import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { useAuditoria } from '../../hooks/useAuditoria';
import { MODULOS, ACCIONES } from '../../utils/auditoria';
import { RotateCcw, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const UsuarioManagement: React.FC = () => {
  const { token } = useAuth();
  const { registrarLog } = useAuditoria();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [formData, setFormData] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    role: 'cliente'
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getClientes(token!);
      if (result.clientes) {
        setUsuarios(result.clientes);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
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
        toast.success('Usuario creado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.CREAR,
          MODULOS.USUARIOS,
          formData.identificacion,
          {
            nombre: formData.nombre,
            apellido: formData.apellido,
            identificacion: formData.identificacion,
            email: formData.email,
            role: formData.role
          }
        );
        
        setIsCreateOpen(false);
        resetForm();
        loadUsuarios();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear usuario');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.updateCliente(selectedUsuario.identificacion, formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Usuario actualizado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.EDITAR,
          MODULOS.USUARIOS,
          selectedUsuario.identificacion,
          {
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email,
            cambios: 'Usuario actualizado'
          }
        );
        
        setIsEditOpen(false);
        setSelectedUsuario(null);
        resetForm();
        loadUsuarios();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar usuario');
    }
  };

  const handleDelete = async (identificacion: string) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return;
    
    try {
      const result = await apiClient.deleteCliente(identificacion, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Usuario desactivado correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ELIMINAR,
          MODULOS.USUARIOS,
          identificacion,
          {
            identificacion,
            accion: 'Desactivación lógica'
          }
        );
        
        loadUsuarios();
      }
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      toast.error('Error al desactivar usuario');
    }
  };

  const handleRestore = async (identificacion: string) => {
    try {
      const result = await apiClient.rehabilitarCliente(identificacion, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Usuario activado correctamente');
        loadUsuarios();
      }
    } catch (error) {
      console.error('Error al activar usuario:', error);
      toast.error('Error al activar usuario');
    }
  };

  const openEditDialog = (usuario: any) => {
    setSelectedUsuario(usuario);
    setFormData({
      identificacion: usuario.identificacion,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      role: usuario.role || 'cliente'
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
      role: 'cliente'
    });
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    // Filtro de búsqueda por texto
    const matchesSearch = usuario.identificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por rol
    const matchesRole = filterRole === 'todos' || usuario.role === filterRole;
    
    // Filtro por estado
    const matchesEstado = filterEstado === 'todos' || 
      (filterEstado === 'activo' && !usuario.eliminado) ||
      (filterEstado === 'inactivo' && usuario.eliminado);
    
    return matchesSearch && matchesRole && matchesEstado;
  });

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-[#DC3545] hover:bg-[#DC3545] text-white">Administrador</Badge>;
    }
    return <Badge className="bg-[#007BFF] hover:bg-[#007BFF] text-white">Cliente</Badge>;
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Gestión de Usuarios</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Input
                  placeholder="Buscar por identificación, nombre o email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#28A745] hover:bg-[#218838] text-white border-0">
                    <Plus className="h-4 w-4 mr-1" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-identificacion">Identificación</Label>
                        <Input
                          id="create-identificacion"
                          value={formData.identificacion}
                          onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                          placeholder="Ej: 1234567890"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-role">Tipo de Usuario</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cliente">Cliente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-nombre">Nombre</Label>
                        <Input
                          id="create-nombre"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Nombre del usuario"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-apellido">Apellido</Label>
                        <Input
                          id="create-apellido"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          placeholder="Apellido del usuario"
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
                          placeholder="correo@ejemplo.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="create-telefono">Teléfono</Label>
                        <Input
                          id="create-telefono"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="Número de teléfono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-direccion">Dirección</Label>
                      <Input
                        id="create-direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Dirección completa"
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
                        Crear Usuario
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
              <Label htmlFor="filter-role" className="whitespace-nowrap">Tipo de Usuario:</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger id="filter-role" className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cliente">Clientes</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
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

            {(filterRole !== 'todos' || filterEstado !== 'todos' || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterRole('todos');
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
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium">Identificación</TableHead>
                    <TableHead className="font-medium">Nombre Completo</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Teléfono</TableHead>
                    <TableHead className="font-medium">Tipo de Usuario</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.identificacion} className={usuario.eliminado ? 'bg-gray-50 opacity-60' : 'bg-white'}>
                      <TableCell className="font-medium">{usuario.identificacion}</TableCell>
                      <TableCell>{usuario.nombre} {usuario.apellido}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefono || '-'}</TableCell>
                      <TableCell>{getRoleBadge(usuario.role)}</TableCell>
                      <TableCell>
                        {usuario.eliminado ? (
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
                          {!usuario.eliminado && (
                            <Button
                              size="sm"
                              className="bg-[#007BFF] hover:bg-[#0069D9] text-white"
                              onClick={() => openEditDialog(usuario)}
                            >
                              Editar
                            </Button>
                          )}
                          
                          {usuario.eliminado ? (
                            <Button
                              size="sm"
                              className="bg-[#28A745] hover:bg-[#218838] text-white"
                              onClick={() => handleRestore(usuario.identificacion)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Activar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-[#DC3545] hover:bg-[#C82333] text-white"
                              onClick={() => handleDelete(usuario.identificacion)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-identificacion">Identificación</Label>
                <Input
                  id="edit-identificacion"
                  value={formData.identificacion}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Tipo de Usuario</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Input
                id="edit-direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsEditOpen(false);
                setSelectedUsuario(null);
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
