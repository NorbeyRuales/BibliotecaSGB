import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { HelpButton } from '../common/HelpButton';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../utils/api';
import logoImage from 'figma:asset/d98fea41c2fe4b78955c4108114601a7d4892aa9.png';

interface RegisterFormProps {
  onLoginClick: () => void;
  onBackToPublic?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onLoginClick, onBackToPublic }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    identificacion: '',
    nombre: '',
    apellido: '',
    fechaNacimiento: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const result = await apiClient.signup({
        email: formData.email,
        password: formData.password,
        identificacion: formData.identificacion,
        nombre: formData.nombre,
        apellido: formData.apellido,
        fechaNacimiento: formData.fechaNacimiento,
        role: 'cliente'
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onLoginClick();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
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
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para acceder al sistema de biblioteca
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

            {success && (
              <Alert className="bg-[#E8F5E9] text-[#2C2C2C] border-[#28A745]">
                <CheckCircle className="h-4 w-4 text-[#28A745]" />
                <AlertDescription>
                  ¡Registro exitoso! Redirigiendo al inicio de sesión...
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="border border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="border border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identificacion">Número de Identificación</Label>
              <Input
                id="identificacion"
                name="identificacion"
                value={formData.identificacion}
                onChange={handleChange}
                className="border border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className="border border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="border border-gray-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="border border-gray-300"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#28A745] hover:bg-[#218838] text-white border-0" disabled={loading || success}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={onLoginClick}
                className="text-sm text-[#007BFF] hover:text-[#0056B3] hover:underline block w-full"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
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
        currentSection="registro"
        onRegistroClick={() => {}} // Ya estamos en registro
        onLoginClick={onLoginClick}
      />
    </div>
  );
};