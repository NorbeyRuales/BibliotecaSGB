/**
 * ============================================================================
 * AUTHCONTEXT.TSX - CONTEXTO DE AUTENTICACIÓN
 * ============================================================================
 * Maneja el estado global de autenticación de la aplicación usando React Context
 * Proporciona funciones de login/logout y persiste la sesión en localStorage
 * Permite acceso al usuario actual y su token en cualquier componente
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * INTERFAZ USER - Define la estructura de un usuario autenticado
 */
interface User {
  id: string;                        // UUID del usuario en Supabase Auth
  email: string;                     // Correo electrónico
  identificacion: string;            // Número de identificación (DNI/CC)
  nombre: string;                    // Nombre del usuario
  apellido: string;                  // Apellido del usuario
  fechaNacimiento: string;           // Fecha de nacimiento (formato ISO)
  role: 'admin' | 'cliente';         // Rol del usuario (determina permisos)
  bloqueado: boolean;                // Si el usuario está bloqueado (solo afecta clientes)
}

/**
 * INTERFAZ AUTHCONTEXTTYPE - Define el tipo del contexto de autenticación
 */
interface AuthContextType {
  user: User | null;                 // Usuario actual (null si no está autenticado)
  token: string | null;              // Token de acceso JWT (null si no está autenticado)
  login: (email: string, password: string) => Promise<any>;  // Función para iniciar sesión
  logout: () => void;                // Función para cerrar sesión
  isAdmin: boolean;                  // Computed property: true si el usuario es admin
}

/**
 * Crear el contexto de autenticación
 * Inicialmente undefined, se popula por el AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AUTHPROVIDER - Proveedor del contexto de autenticación
 * Debe envolver toda la aplicación para que cualquier componente pueda acceder al contexto
 * @param children - Componentes hijos que tendrán acceso al contexto
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado local: usuario actual (null si no está autenticado)
  const [user, setUser] = useState<User | null>(null);
  
  // Estado local: token de acceso JWT (null si no está autenticado)
  const [token, setToken] = useState<string | null>(null);

  /**
   * EFFECT: RESTAURAR SESIÓN DESDE LOCALSTORAGE
   * Se ejecuta una vez al montar el componente
   * Permite que la sesión persista entre recargas de página
   */
  useEffect(() => {
    // Intentar recuperar datos de sesión guardados
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    // Si existen ambos, restaurar la sesión
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));  // Parsear JSON del usuario
      setToken(savedToken);             // Asignar token
    }
  }, []); // Array vacío = solo se ejecuta al montar

  /**
   * LOGIN - Función para iniciar sesión
   * @param email - Correo electrónico del usuario
   * @param password - Contraseña del usuario
   * @returns Promesa con resultado del login o lanza error
   * @throws Error si las credenciales son incorrectas
   */
  const login = async (email: string, password: string) => {
    // Importación dinámica para evitar dependencias circulares
    const { apiClient } = await import('../utils/api');
    
    // Llamar al endpoint de signin
    const result = await apiClient.signin(email, password);
    
    // Si hay error, lanzar excepción
    if (result.error) {
      throw new Error(result.error);
    }

    // Login exitoso - actualizar estado
    setUser(result.user);
    setToken(result.access_token);
    
    // Persistir sesión en localStorage
    localStorage.setItem('user', JSON.stringify(result.user));
    localStorage.setItem('token', result.access_token);

    // Retornar resultado completo
    return result;
  };

  /**
   * LOGOUT - Función para cerrar sesión
   * Limpia el estado y elimina datos de localStorage
   */
  const logout = () => {
    // Limpiar estado
    setUser(null);
    setToken(null);
    
    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  /**
   * ISADMIN - Computed property que determina si el usuario actual es admin
   * Usa optional chaining (?.) para evitar error si user es null
   */
  const isAdmin = user?.role === 'admin';

  /**
   * Proveer el contexto a todos los componentes hijos
   * Cualquier componente descendiente puede acceder a estos valores
   */
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * USEAUTH - Hook personalizado para acceder al contexto de autenticación
 * Simplifica el uso del contexto y provee validación de uso correcto
 * @returns Objeto con {user, token, login, logout, isAdmin}
 * @throws Error si se usa fuera de un AuthProvider
 * 
 * EJEMPLO DE USO:
 * const { user, token, login, logout, isAdmin } = useAuth();
 * if (isAdmin) { ... }
 */
export const useAuth = () => {
  // Obtener el contexto usando el hook de React
  const context = useContext(AuthContext);
  
  // Validar que se esté usando dentro de un AuthProvider
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  // Retornar el contexto
  return context;
};
