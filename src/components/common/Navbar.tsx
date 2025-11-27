/**
 * ============================================================================
 * NAVBAR.TSX - BARRA DE NAVEGACIÓN SUPERIOR
 * ============================================================================
 * Componente de navegación principal que se muestra en la parte superior
 * Incluye logo del sistema, nombre del usuario y botón de salir
 * Responsivo: en móvil oculta el botón salir (se muestra en menú hamburguesa)
 * 
 * ESQUEMA DE COLORES:
 * - Fondo: #2C2C2C (gris oscuro)
 * - Texto: blanco
 * - Hover: #3C3C3C (gris más claro)
 * ============================================================================
 */

import React from 'react';
import { Button } from '../ui/button';           // Componente de botón de shadcn/ui
import { useAuth } from '../../context/AuthContext';  // Hook para acceder al usuario
import logoImage from 'figma:asset/d98fea41c2fe4b78955c4108114601a7d4892aa9.png';  // Logo importado desde Figma

/**
 * NAVBAR - Componente de barra de navegación
 * Se renderiza en la parte superior de todos los dashboards
 */
export const Navbar: React.FC = () => {
  // Obtener usuario actual y función de logout del contexto de autenticación
  const { user, logout } = useAuth();

  return (
    // Elemento nav principal con color de fondo oscuro (#2C2C2C)
    <nav className="bg-[#2C2C2C] text-white shadow-lg">
      {/* Container responsivo con padding adaptativo */}
      <div className="container mx-auto px-2 sm:px-4 py-2">
        {/* Flex container para alinear logo y controles */}
        <div className="flex items-center justify-between">
          
          {/* SECCIÓN IZQUIERDA: Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Logo del sistema con tamaño responsivo 
                  h-12 (48px en móvil) → h-16 (64px en tablet) → h-20 (80px en desktop)
                  brightness-0 invert: convierte logo a blanco si es oscuro */}
              <img 
                src={logoImage} 
                alt="Biblioteca SGB" 
                className="h-12 sm:h-16 md:h-20 w-auto brightness-0 invert" 
              />
            </div>
          </div>

          {/* SECCIÓN DERECHA: Usuario y botón salir 
              hidden md:flex: oculto en móvil, visible desde tablet (768px+)
              En móvil, el botón salir se muestra en el menú hamburguesa */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Saludo personalizado con nombre del usuario
                text-gray-300: texto gris claro para contraste */}
            <span className="text-sm text-gray-300">
              Hola, {user?.nombre}
            </span>
            
            {/* Botón de cerrar sesión
                variant="ghost": estilo sin fondo, solo hover
                hover:bg-[#3C3C3C]: fondo gris claro al pasar el mouse */}
            <Button 
              onClick={logout}  // Llamar función logout al hacer clic
              variant="ghost"   // Variante sin fondo
              className="text-white hover:bg-[#3C3C3C] text-sm px-4"
            >
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
