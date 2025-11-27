import React, { useState } from 'react';
import { Navbar } from '../common/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { UsuarioManagement } from './UsuarioManagement';
import { LibroManagement } from './LibroManagement';
import { CategoriaManagement } from './CategoriaManagement';
import { PrestamoManagement } from './PrestamoManagement';
import { MultaManagement } from './MultaManagement';
import { ReportesView } from './ReportesView';
import { EstadisticasView } from './EstadisticasView';
import LogsAuditoriaView from './LogsAuditoriaView';
import { useAuth } from '../../context/AuthContext';
import { HelpButton } from '../common/HelpButton';
import { useAuditoria } from '../../hooks/useAuditoria';
import { Menu, Users, BookOpen, Tag, BookCheck, DollarSign, FileText, BarChart3, LogOut, ScrollText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const { registrarLog } = useAuditoria();
  const [activeTab, setActiveTab] = useState('libros');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para registrar acciones de ayuda en logs
  const handleLogHelpAction = async (action: string) => {
    await registrarLog(action, 'AYUDA', undefined, {
      seccion_actual: activeTab,
      timestamp: new Date().toISOString()
    });
  };

  // Función para manejar navegación desde la ayuda
  const handleNavigateFromHelp = (ruta: string) => {
    // Mapeo de rutas a tabs
    const rutaToTabMap: Record<string, string> = {
      '/libros': 'libros',
      '/usuarios': 'usuarios',
      '/categorias': 'categorias',
      '/prestamos': 'prestamos',
      '/multas': 'multas',
      '/reportes': 'reportes',
      '/estadisticas': 'estadisticas',
      '/logs': 'logs'
    };

    const tab = rutaToTabMap[ruta];
    if (tab) {
      setActiveTab(tab);
      registrarLog('NAVEGAR_DESDE_AYUDA', 'AYUDA', undefined, {
        ruta_destino: ruta,
        tab_destino: tab
      });
    }
  };

  const tabOptions = [
    { value: 'libros', label: 'Libros', icon: BookOpen },
    { value: 'categorias', label: 'Categorías', icon: Tag },
    { value: 'prestamos', label: 'Préstamos', icon: BookCheck },
    { value: 'usuarios', label: 'Usuarios', icon: Users },
    { value: 'multas', label: 'Multas', icon: DollarSign },
    { value: 'reportes', label: 'Reportes', icon: FileText },
    { value: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { value: 'logs', label: 'Logs de Auditoría', icon: ScrollText }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="bg-[#2C2C2C] text-white shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          {/* Menú hamburguesa para móviles */}
          <div className="flex items-center justify-between md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#3C3C3C]">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-[#2C2C2C] text-white border-[#4C4C4C]">
                <SheetHeader>
                  <SheetTitle className="text-white">Menú de Administrador</SheetTitle>
                  <SheetDescription className="text-gray-400">
                    Navegación principal del sistema
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6">
                  <div className="border-b border-[#4C4C4C] pb-3 mb-3">
                    <p className="text-sm text-gray-400">Usuario</p>
                    <p className="text-sm">{user?.nombre} {user?.apellido}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>

                  {tabOptions.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          activeTab === tab.value 
                            ? 'bg-[#3C3C3C] text-white hover:bg-[#4C4C4C]' 
                            : 'text-gray-300 hover:bg-[#3C3C3C] hover:text-white'
                        }`}
                        onClick={() => handleTabChange(tab.value)}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </Button>
                    );
                  })}

                  <div className="border-t border-[#4C4C4C] pt-3 mt-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-[#3C3C3C] hover:text-red-300"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="text-sm">
              {tabOptions.find(t => t.value === activeTab)?.label}
            </div>
          </div>

          {/* Tabs para desktop */}
          <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-0 h-auto p-0 space-x-1">
                <TabsTrigger 
                  value="libros" 
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Libros
                </TabsTrigger>
                <TabsTrigger 
                  value="categorias"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Categorías
                </TabsTrigger>
                <TabsTrigger 
                  value="prestamos"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Préstamos
                </TabsTrigger>
                <TabsTrigger 
                  value="usuarios"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Usuarios
                </TabsTrigger>
                <TabsTrigger 
                  value="multas"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Multas
                </TabsTrigger>
                <TabsTrigger 
                  value="reportes"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Reportes
                </TabsTrigger>
                <TabsTrigger 
                  value="estadisticas"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Estadísticas
                </TabsTrigger>
                <TabsTrigger 
                  value="logs"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Logs de Auditoría
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="hidden">
            <TabsTrigger value="libros">Libros</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="multas">Multas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
            <TabsTrigger value="logs">Logs de Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="libros">
            <LibroManagement />
          </TabsContent>

          <TabsContent value="categorias">
            <CategoriaManagement />
          </TabsContent>

          <TabsContent value="prestamos">
            <PrestamoManagement />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsuarioManagement />
          </TabsContent>

          <TabsContent value="multas">
            <MultaManagement />
          </TabsContent>

          <TabsContent value="reportes">
            <ReportesView />
          </TabsContent>

          <TabsContent value="estadisticas">
            <EstadisticasView />
          </TabsContent>

          <TabsContent value="logs">
            <LogsAuditoriaView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Botón flotante de ayuda contextual */}
      <HelpButton 
        userRole="admin" 
        currentSection={activeTab}
        onLogAction={handleLogHelpAction}
        onNavigate={handleNavigateFromHelp}
        onLogoutClick={logout}
      />
    </div>
  );
};