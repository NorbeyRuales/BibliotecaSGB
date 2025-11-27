/**
 * ============================================================================
 * QUICKHELPLINK - ENLACE RÁPIDO DE AYUDA CONTEXTUAL
 * ============================================================================
 * Componente pequeño que puede colocarse en encabezados de secciones
 * para abrir la ayuda directamente en el tema relacionado
 * ============================================================================
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { HelpCircle } from 'lucide-react';
import { HelpDialog } from './HelpDialog';

interface QuickHelpLinkProps {
  userRole: 'guest' | 'cliente' | 'admin';
  currentSection?: string;
  onLogAction?: (action: string) => void;
  text?: string;
  variant?: 'button' | 'link';
  size?: 'sm' | 'md';
}

export function QuickHelpLink({ 
  userRole, 
  currentSection, 
  onLogAction,
  text = 'Ayuda',
  variant = 'link',
  size = 'sm'
}: QuickHelpLinkProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  const handleOpenHelp = () => {
    setHelpOpen(true);
    if (onLogAction) {
      onLogAction('ABRIR_AYUDA_CONTEXTUAL');
    }
  };

  if (variant === 'link') {
    return (
      <>
        <button
          onClick={handleOpenHelp}
          className="inline-flex items-center gap-1 text-sm hover:underline transition-colors"
          style={{ color: '#17A2B8' }}
        >
          <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>{text}</span>
        </button>

        <HelpDialog
          open={helpOpen}
          onOpenChange={setHelpOpen}
          userRole={userRole}
          currentSection={currentSection}
          onLogAction={onLogAction}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenHelp}
        variant="outline"
        size={size}
        className="gap-1"
      >
        <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        {text}
      </Button>

      <HelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        userRole={userRole}
        currentSection={currentSection}
        onLogAction={onLogAction}
      />
    </>
  );
}
