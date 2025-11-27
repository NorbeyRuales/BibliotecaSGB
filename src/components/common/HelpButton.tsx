/**
 * ============================================================================
 * HELPBUTTON - BOTÓN FLOTANTE DE AYUDA
 * ============================================================================
 * Botón siempre visible que abre el diálogo de ayuda contextual
 * Se adapta según el tipo de usuario y la sección actual
 * ============================================================================
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { HelpCircle } from 'lucide-react';
import { HelpDialog } from './HelpDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface HelpButtonProps {
  userRole: 'guest' | 'cliente' | 'admin';
  currentSection?: string;
  onLogAction?: (action: string) => void;
  position?: 'fixed' | 'relative';
  onNavigate?: (ruta: string) => void;
  onRegistroClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export function HelpButton({ 
  userRole, 
  currentSection, 
  onLogAction,
  position = 'fixed',
  onNavigate,
  onRegistroClick,
  onLoginClick,
  onLogoutClick
}: HelpButtonProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  const handleOpenHelp = () => {
    setHelpOpen(true);
    if (onLogAction) {
      onLogAction('ABRIR_AYUDA');
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleOpenHelp}
              className={`
                ${position === 'fixed' ? 'fixed bottom-6 right-6 z-50' : ''}
                rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all
                flex items-center justify-center
                text-white hover:opacity-90
              `}
              style={{ backgroundColor: '#17A2B8' }}
              aria-label="Ayuda"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>¿Necesitas ayuda?</p>
            <p className="text-xs text-gray-400">Guía de usuario contextual</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <HelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        userRole={userRole}
        currentSection={currentSection}
        onLogAction={onLogAction}
        onNavigate={onNavigate}
        onRegistroClick={onRegistroClick}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
      />
    </>
  );
}