/**
 * ============================================================================
 * APP.TSX - COMPONENTE RAÍZ DE LA APLICACIÓN
 * ============================================================================
 * Punto de entrada principal del Sistema de Gestión de Biblioteca
 * Maneja el routing básico entre autenticación y dashboards
 * Proporciona el contexto de autenticación a toda la aplicación
 * ============================================================================
 */

import React, { useState } from 'react';
// Importar contexto de autenticación
import { AuthProvider, useAuth } from './context/AuthContext';
// Importar componentes de autenticación
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
// Importar dashboards para cada tipo de usuario
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ClienteDashboard } from './components/cliente/ClienteDashboard';
// Importar catálogo público
import { PublicCatalogo } from './components/public/PublicCatalogo';
// Importar sistema de notificaciones toast
import { Toaster } from './components/ui/sonner';

/**
 * APPCONTENT - Componente interno que maneja la lógica de routing
 * Debe estar dentro del AuthProvider para acceder al contexto de autenticación
 * 
 * LÓGICA DE NAVEGACIÓN:
 * 1. Si no hay usuario autenticado → Mostrar Catálogo Público, Login o Registro
 * 2. Si hay usuario admin → Mostrar AdminDashboard
 * 3. Si hay usuario cliente → Mostrar ClienteDashboard
 */
const AppContent: React.FC = () => {
  // Obtener usuario actual del contexto de autenticación
  const { user } = useAuth();
  
  // Estado local para controlar la vista actual cuando no hay usuario
  // 'public' = catálogo público (landing), 'login' = formulario login, 'register' = formulario registro
  const [currentView, setCurrentView] = useState<'public' | 'login' | 'register'>('public');

  /**
   * CASO 1: USUARIO NO AUTENTICADO
   * Mostrar catálogo público, login o registro según el estado
   */
  if (!user) {
    if (currentView === 'register') {
      return (
        <RegisterForm 
          onLoginClick={() => setCurrentView('login')} 
          onBackToPublic={() => setCurrentView('public')}
        />
      );
    }
    
    if (currentView === 'login') {
      return (
        <LoginForm 
          onRegisterClick={() => setCurrentView('register')}
          onBackToPublic={() => setCurrentView('public')}
        />
      );
    }
    
    // Vista pública por defecto (landing page)
    return (
      <PublicCatalogo 
        onLoginClick={() => setCurrentView('login')} 
        onRegistroClick={() => setCurrentView('register')} 
      />
    );
  }

  /**
   * CASO 2: USUARIO AUTENTICADO
   * Renderizar dashboard según el rol del usuario
   * - admin → AdminDashboard (gestión completa del sistema)
   * - cliente → ClienteDashboard (catálogo, préstamos, multas)
   */
  return user.role === 'admin' ? <AdminDashboard /> : <ClienteDashboard />;
};

/**
 * APP - Componente raíz exportado por defecto
 * Envuelve toda la aplicación con providers necesarios
 * 
 * ESTRUCTURA:
 * - AuthProvider: Proporciona contexto de autenticación a toda la app
 * - AppContent: Maneja la navegación principal
 * - Toaster: Sistema de notificaciones toast (posición superior derecha)
 */
export default function App() {
  return (
    <AuthProvider>
      {/* Contenido principal de la aplicación */}
      <AppContent />
      
      {/* Sistema de notificaciones toast */}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}