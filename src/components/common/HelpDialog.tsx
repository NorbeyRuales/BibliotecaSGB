/**
 * ============================================================================
 * HELPDIALOG - MODAL DE AYUDA CONTEXTUAL
 * ============================================================================
 * Componente que muestra la guía de usuario adaptada al tipo de usuario
 * y a la sección actual donde se encuentra
 * Incluye buscador interno y navegación por índice
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Search, BookOpen, ChevronRight, Home } from 'lucide-react';
import {
  helpNoRegistrado,
  helpCliente,
  helpAdmin,
  searchHelpContent,
  getContextualHelp,
  HelpContent,
  HelpSection
} from '../../utils/helpContent';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'guest' | 'cliente' | 'admin';
  currentSection?: string;
  onLogAction?: (action: string) => void;
  onNavigate?: (ruta: string) => void;
  onRegistroClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export function HelpDialog({ 
  open, 
  onOpenChange, 
  userRole, 
  currentSection,
  onLogAction,
  onNavigate,
  onRegistroClick,
  onLoginClick,
  onLogoutClick
}: HelpDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpSection[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HelpSection | null>(null);

  // Obtener contenido contextual
  const contextualContent = getContextualHelp(userRole, currentSection);
  const allContent = userRole === 'guest' ? helpNoRegistrado : userRole === 'cliente' ? helpCliente : helpAdmin;

  // Registrar apertura de ayuda en logs (solo para admin)
  useEffect(() => {
    if (open && onLogAction) {
      onLogAction('VER_AYUDA');
    }
  }, [open, onLogAction]);

  // Manejar búsqueda
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const results = searchHelpContent(searchQuery, userRole);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchQuery, userRole]);

  // Limpiar búsqueda al cerrar
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery('');
      setShowSearchResults(false);
      setSelectedSection(null);
    }
    onOpenChange(newOpen);
  };

  // Manejar acciones rápidas
  const handleAccionRapida = (accion: { texto: string; ruta?: string; accion?: 'registro' | 'login' | 'cerrar' }) => {
    if (accion.accion === 'registro' && onRegistroClick) {
      onRegistroClick();
      handleOpenChange(false);
    } else if (accion.accion === 'login' && onLoginClick) {
      onLoginClick();
      handleOpenChange(false);
    } else if (accion.accion === 'cerrar' && onLogoutClick) {
      onLogoutClick();
      handleOpenChange(false);
    } else if (accion.ruta && onNavigate) {
      onNavigate(accion.ruta);
      handleOpenChange(false);
    }
  };

  // Renderizar sección de ayuda
  const renderSection = (section: HelpSection) => (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <BookOpen className="w-5 h-5 mt-1 flex-shrink-0" style={{ color: '#17A2B8' }} />
        <div className="flex-1">
          <p className="text-sm text-gray-700 leading-relaxed">{section.contenido}</p>
        </div>
      </div>
      
      {section.pasos && section.pasos.length > 0 && (
        <div className="pl-7 space-y-2">
          <p className="text-sm font-medium text-gray-900">Pasos a seguir:</p>
          <ol className="space-y-2">
            {section.pasos.map((paso, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-gray-600">
                <span className="flex-shrink-0 font-medium" style={{ color: '#007BFF' }}>
                  {idx + 1}.
                </span>
                <span className="flex-1">{paso}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Botones de acciones rápidas */}
      {section.accionesRapidas && section.accionesRapidas.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-gray-900 mb-3">Acciones rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {section.accionesRapidas.map((accion, idx) => (
              <Button
                key={idx}
                onClick={() => handleAccionRapida(accion)}
                style={{ backgroundColor: '#17A2B8' }}
                className="text-white hover:opacity-90"
                size="sm"
              >
                <ChevronRight className="w-4 h-4 mr-1" />
                {accion.texto}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Vista de sección individual
  if (selectedSection) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSection(null)}
                className="p-1 h-auto"
              >
                <Home className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <DialogTitle className="text-xl">{selectedSection.titulo}</DialogTitle>
            </div>
            <DialogDescription>
              Guía detallada paso a paso
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {renderSection(selectedSection)}
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSelectedSection(null)}
            >
              Volver al índice
            </Button>
            <Button
              onClick={() => handleOpenChange(false)}
              style={{ backgroundColor: '#28A745' }}
              className="text-white hover:opacity-90"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6" style={{ color: '#17A2B8' }} />
            Guía de Usuario
            {userRole === 'admin' && (
              <Badge style={{ backgroundColor: '#DC3545' }} className="text-white ml-2">
                Administrador
              </Badge>
            )}
            {userRole === 'cliente' && (
              <Badge style={{ backgroundColor: '#007BFF' }} className="text-white ml-2">
                Cliente
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {userRole === 'guest' && 'Aprende cómo usar nuestra plataforma de biblioteca digital'}
            {userRole === 'cliente' && 'Ayuda contextual para gestionar tus préstamos y consultar el catálogo'}
            {userRole === 'admin' && 'Guía completa de administración del sistema'}
          </DialogDescription>
        </DialogHeader>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar en la ayuda... (ej: 'cómo crear libro', 'renovar préstamo', 'pagar multa')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Resultados de búsqueda */}
        {showSearchResults && (
          <ScrollArea className="h-[50vh]">
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge style={{ backgroundColor: '#17A2B8' }} className="text-white">
                    {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {searchResults.map((section, idx) => (
                  <div
                    key={idx}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedSection(section);
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                  >
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      {section.titulo}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{section.contenido}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No se encontraron resultados para "{searchQuery}"</p>
                <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Índice de contenido contextual */}
        {!showSearchResults && (
          <ScrollArea className="h-[50vh]">
            <div className="space-y-4">
              {/* Indicador de contenido contextual */}
              {currentSection && contextualContent.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Ayuda contextual para la sección actual
                  </p>
                </div>
              )}

              {/* Accordion con categorías */}
              <Accordion type="single" collapsible className="w-full">
                {(contextualContent.length > 0 ? contextualContent : allContent).map((categoria, catIdx) => (
                  <AccordionItem key={catIdx} value={`cat-${catIdx}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{categoria.categoria}</span>
                        <Badge variant="outline" className="ml-2">
                          {categoria.secciones.length} tema{categoria.secciones.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {categoria.secciones.map((seccion, secIdx) => (
                          <div
                            key={secIdx}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedSection(seccion)}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" style={{ color: '#17A2B8' }} />
                                {seccion.titulo}
                              </h4>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1 ml-6">
                              {seccion.contenido}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Opción para ver todo el contenido */}
              {currentSection && contextualContent.length > 0 && contextualContent.length < allContent.length && (
                <>
                  <Separator className="my-4" />
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Forzar mostrar todo el contenido
                      setSearchQuery('');
                    }}
                    className="w-full"
                  >
                    Ver toda la guía completa
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            {userRole === 'guest' && '💡 Regístrate para acceder a todas las funcionalidades'}
            {userRole === 'cliente' && '💡 Usa el buscador para encontrar ayuda rápida'}
            {userRole === 'admin' && '💡 Todas tus consultas de ayuda quedan registradas en los logs'}
          </p>
          <Button
            onClick={() => handleOpenChange(false)}
            style={{ backgroundColor: '#28A745' }}
            className="text-white hover:opacity-90"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}