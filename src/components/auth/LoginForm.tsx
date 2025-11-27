import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../context/AuthContext';
import { HelpButton } from '../common/HelpButton';
import { AlertCircle } from 'lucide-react';
import logoImage from 'figma:asset/d98fea41c2fe4b78955c4108114601a7d4892aa9.png';

interface LoginFormProps {
  onRegisterClick: () => void;
  onBackToPublic?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick, onBackToPublic }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      if (errorMessage.includes('credentials') || errorMessage.includes('Credenciales')) {
        setError('Usuario no encontrado. Por favor, regístrate primero.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <img src={logoImage} alt="Biblioteca SGB" className="h-32 w-auto" />
          </div>
          <CardTitle>Sistema de Gestión de Biblioteca</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#28A745] hover:bg-[#218838] text-white border-0" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={onRegisterClick}
                className="text-sm text-[#007BFF] hover:text-[#0056B3] hover:underline block w-full"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
              
              {onBackToPublic && (
                <button
                  type="button"
                  onClick={onBackToPublic}
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline block w-full"
                >
                  ← Volver al catálogo público
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Botón flotante de ayuda para usuarios no registrados */}
      <HelpButton 
        userRole="guest" 
        currentSection="login"
        onRegistroClick={onRegisterClick}
        onLoginClick={() => {}} // Ya estamos en login
      />
    </div>
  );
};