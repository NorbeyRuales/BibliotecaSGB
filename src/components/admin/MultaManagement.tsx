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
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';
import { useAuditoria } from '../../hooks/useAuditoria';
import { MODULOS, ACCIONES } from '../../utils/auditoria';
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../ui/utils';

export const MultaManagement: React.FC = () => {
  const { token } = useAuth();
  const { registrarLog } = useAuditoria();
  const [multas, setMultas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false);
  const [openComboboxCliente, setOpenComboboxCliente] = useState(false);
  const [formData, setFormData] = useState({
    clienteIdentificacion: '',
    monto: '',
    razon: ''
  });

  useEffect(() => {
    loadMultas();
    loadClientes();
  }, []);

  useEffect(() => {
    loadMultas();
  }, [mostrarDesactivados]);

  const loadMultas = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getMultas(token!);
      if (result.multas) {
        // Filtrar multas desactivadas por defecto
        const multasVisibles = mostrarDesactivados 
          ? result.multas 
          : result.multas.filter((m: any) => m.activo !== false);
        setMultas(multasVisibles);
      }
    } catch (error) {
      console.error('Error al cargar multas:', error);
      toast.error('Error al cargar multas');
    } finally {
      setLoading(false);
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
      const result = await apiClient.createMulta(formData, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Multa creada correctamente');
        
        // Registrar acción en logs de auditoría
        const cliente = clientes.find(c => c.identificacion === formData.clienteIdentificacion);
        await registrarLog(
          ACCIONES.CREAR,
          MODULOS.MULTAS,
          result.multa?.id,
          {
            cliente: cliente ? `${cliente.nombre} ${cliente.apellido}` : formData.clienteIdentificacion,
            monto: formData.monto,
            razon: formData.razon
          }
        );
        
        setIsCreateOpen(false);
        resetForm();
        loadMultas();
      }
    } catch (error) {
      console.error('Error al crear multa:', error);
      toast.error('Error al crear multa');
    }
  };

  const handlePagar = async (id: string) => {
    if (!confirm('¿Confirmar que la multa ha sido pagada?')) return;
    
    try {
      const multa = multas.find(m => m.id === id);
      const result = await apiClient.pagarMulta(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Multa marcada como pagada');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.EDITAR,
          MODULOS.MULTAS,
          id,
          {
            accion: 'Pago de multa',
            cliente: multa?.cliente_nombre || 'N/A',
            monto: multa?.monto || 0,
            fechaPago: new Date().toISOString()
          }
        );
        
        loadMultas();
      }
    } catch (error) {
      console.error('Error al marcar multa como pagada:', error);
      toast.error('Error al marcar multa como pagada');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de desactivar esta multa?')) return;
    
    try {
      const multa = multas.find(m => m.id === id);
      const result = await apiClient.deleteMulta(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Multa desactivada correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ELIMINAR,
          MODULOS.MULTAS,
          id,
          {
            cliente: multa?.cliente_nombre || 'N/A',
            monto: multa?.monto || 0,
            accion: 'Desactivación lógica'
          }
        );
        
        loadMultas();
      }
    } catch (error) {
      console.error('Error al desactivar multa:', error);
      toast.error('Error al desactivar multa');
    }
  };

  const handleReactivar = async (id: string) => {
    if (!confirm('¿Estás seguro de reactivar esta multa?')) return;
    
    try {
      const multa = multas.find(m => m.id === id);
      const result = await apiClient.rehabilitarMulta(id, token!);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Multa reactivada correctamente');
        
        // Registrar acción en logs de auditoría
        await registrarLog(
          ACCIONES.ACTIVAR,
          MODULOS.MULTAS,
          id,
          {
            cliente: multa?.cliente_nombre || 'N/A',
            monto: multa?.monto || 0,
            accion: 'Reactivación de multa'
          }
        );
        
        loadMultas();
      }
    } catch (error) {
      console.error('Error al reactivar multa:', error);
      toast.error('Error al reactivar multa');
    }
  };

  const resetForm = () => {
    setFormData({
      clienteIdentificacion: '',
      monto: '',
      razon: ''
    });
  };

  const filteredMultas = multas.filter(multa =>
    multa.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    multa.clienteIdentificacion?.includes(searchTerm) ||
    multa.razon?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl">Multas</h2>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Input
                placeholder="Buscar por cliente o razón"
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

              <Button
                variant="outline"
                onClick={() => setMostrarDesactivados(!mostrarDesactivados)}
                className={mostrarDesactivados ? "bg-[#DC3545] text-white border-0 hover:bg-[#C82333]" : "bg-white border-gray-300"}
              >
                {mostrarDesactivados ? '👁️ Ocultar desactivados' : '🔌 Ver desactivados'}
              </Button>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#28A745] hover:bg-[#218838] text-white border-0">
                    Nueva Multa
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Multa</DialogTitle>
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
                      <Label htmlFor="create-monto">Monto (COP $)</Label>
                      <Input
                        id="create-monto"
                        type="number"
                        step="0.01"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-razon">Razón</Label>
                      <Textarea
                        id="create-razon"
                        value={formData.razon}
                        onChange={(e) => setFormData({ ...formData, razon: e.target.value })}
                        placeholder="Ej: Retraso en devolución de libro"
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
                        Crear Multa
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
            <div className="text-center py-8">Cargando multas...</div>
          ) : filteredMultas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron multas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b">
                    <TableHead className="font-medium">Cliente</TableHead>
                    <TableHead className="font-medium">Documento</TableHead>
                    <TableHead className="font-medium">Razón</TableHead>
                    <TableHead className="font-medium">Monto</TableHead>
                    <TableHead className="font-medium">Fecha</TableHead>
                    <TableHead className="font-medium">Estado</TableHead>
                    <TableHead className="font-medium text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMultas.map((multa) => (
                    <TableRow key={multa.id} className={multa.activo === false ? "bg-red-50" : "bg-white"}>
                      <TableCell>
                        {multa.activo === false && <span className="text-red-600 mr-2">🔌</span>}
                        {multa.clienteNombre}
                      </TableCell>
                      <TableCell>{multa.clienteIdentificacion}</TableCell>
                      <TableCell>{multa.razon}</TableCell>
                      <TableCell>{formatMoney(multa.monto)}</TableCell>
                      <TableCell>{formatDate(multa.fechaCreacion)}</TableCell>
                      <TableCell>
                        {multa.activo === false ? (
                          <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
                            Desactivado
                          </Badge>
                        ) : multa.activa ? (
                          <Badge className="bg-[#DC3545] hover:bg-[#DC3545] text-white">
                            Pendiente
                          </Badge>
                        ) : (
                          <Badge className="bg-[#28A745] hover:bg-[#28A745] text-white">
                            Pagada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {multa.activo === false ? (
                            <Button
                              size="sm"
                              className="bg-[#28A745] hover:bg-[#218838] text-white"
                              onClick={() => handleReactivar(multa.id)}
                            >
                              Reactivar
                            </Button>
                          ) : (
                            <>
                              {multa.activa ? (
                                <Button
                                  size="sm"
                                  className="bg-[#28A745] hover:bg-[#218838] text-white"
                                  onClick={() => handlePagar(multa.id)}
                                >
                                  Marcar como Pagada
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-500"
                                  disabled
                                >
                                  Pagada
                                </Button>
                              )}
                              <Button
                                size="sm"
                                className="bg-[#DC3545] hover:bg-[#C82333] text-white"
                                onClick={() => handleDelete(multa.id)}
                              >
                                Desactivar
                              </Button>
                            </>
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
    </div>
  );
};
