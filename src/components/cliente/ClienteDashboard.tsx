import React, { useState } from 'react';
import { Navbar } from '../common/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { LibrosCatalogo } from './LibrosCatalogo';
import { MisPrestamos } from './MisPrestamos';
import { MisMultas } from './MisMultas';
import { useAuth } from '../../context/AuthContext';
import { HelpButton } from '../common/HelpButton';
import { Menu, BookOpen, BookCheck, DollarSign, LogOut } from 'lucide-react';

export const ClienteDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalogo');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para manejar navegación desde la ayuda
  const handleNavigateFromHelp = (ruta: string) => {
    // Mapeo de rutas a tabs
    const rutaToTabMap: Record<string, string> = {
      '/catalogo': 'catalogo',
      '/prestamos': 'prestamos',
      '/multas': 'multas'
    };

    const tab = rutaToTabMap[ruta];
    if (tab) {
      setActiveTab(tab);
    }
  };

  const tabOptions = [
    { value: 'catalogo', label: 'Catálogo de Libros', icon: BookOpen },
    { value: 'prestamos', label: 'Mis Préstamos', icon: BookCheck },
    { value: 'multas', label: 'Mis Multas', icon: DollarSign }
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
                  <SheetTitle className="text-white">Menú de Cliente</SheetTitle>
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
                  value="catalogo"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Catálogo de Libros
                </TabsTrigger>
                <TabsTrigger 
                  value="prestamos"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Mis Préstamos
                </TabsTrigger>
                <TabsTrigger 
                  value="multas"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-4 py-3 text-sm text-gray-300 hover:text-white whitespace-nowrap"
                >
                  Mis Multas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="hidden">
            <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
            <TabsTrigger value="prestamos">Préstamos</TabsTrigger>
            <TabsTrigger value="multas">Multas</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogo">
            <LibrosCatalogo />
          </TabsContent>

          <TabsContent value="prestamos">
            <MisPrestamos />
          </TabsContent>

          <TabsContent value="multas">
            <MisMultas />
          </TabsContent>
        </Tabs>
      </div>

      {/* Botón flotante de ayuda contextual */}
      <HelpButton 
        userRole="cliente" 
        currentSection={activeTab}
        onNavigate={handleNavigateFromHelp}
        onLogoutClick={logout}
      />
    </div>
  );
};