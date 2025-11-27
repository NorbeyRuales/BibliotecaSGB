import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Info, UserCog, Database, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const SetupGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Script de inicialización para la base de datos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear la tabla kv_store si no existe
CREATE TABLE IF NOT EXISTS kv_store_bebfd31a (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE kv_store_bebfd31a ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para service role
DROP POLICY IF EXISTS "Allow all for service role" ON kv_store_bebfd31a;
CREATE POLICY "Allow all for service role"
ON kv_store_bebfd31a
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Crear política para usuarios autenticados
DROP POLICY IF EXISTS "Allow all for authenticated users" ON kv_store_bebfd31a;
CREATE POLICY "Allow all for authenticated users"
ON kv_store_bebfd31a
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar que todo está correcto
SELECT 'Configuración completada exitosamente' AS status;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    toast.success('Script SQL copiado al portapapeles');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 space-y-6">
      <Card className="border-2 border-blue-500">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Database className="h-6 w-6" />
            Configuración Inicial de la Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Alert className="bg-yellow-50 border-yellow-300">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-900">⚠️ Paso Importante</AlertTitle>
            <AlertDescription className="text-yellow-800 mt-2">
              <p className="mb-3">
                Antes de usar el sistema, debes ejecutar el siguiente script SQL en tu base de datos de Supabase.
                Esto creará la tabla necesaria para almacenar todos los datos del sistema.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Copiar el Script SQL
            </h3>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sqlScript}</code>
              </pre>
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600"
                size="sm"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar Script
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Abrir el SQL Editor de Supabase
            </h3>
            <Button
              onClick={() => window.open('https://supabase.com/dashboard/project/lpspwvwgqiqrendjksqy/sql/new', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir SQL Editor
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Ejecutar el Script
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
              <li>Pega el script SQL copiado en el editor</li>
              <li>Haz clic en el botón "Run" o presiona Ctrl+Enter</li>
              <li>Verifica que aparezca el mensaje "Configuración completada exitosamente"</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Verificar la Configuración
            </h3>
            <p className="text-sm ml-8">
              Una vez ejecutado el script, recarga esta página y podrás registrarte como usuario.
            </p>
          </div>

          <Alert className="bg-green-50 border-green-300 mt-6">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Después de la Configuración</AlertTitle>
            <AlertDescription className="text-green-800 mt-2">
              <p>Una vez completados los pasos anteriores, podrás:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                <li>Registrarte como nuevo usuario</li>
                <li>Crear usuarios administradores y clientes</li>
                <li>Comenzar a usar el Sistema de Gestión de Biblioteca</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-blue-600" />
            Credenciales del Primer Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Usuario Administrador por Defecto</AlertTitle>
            <AlertDescription className="text-blue-800 mt-2">
              <p className="mb-2">Puedes crear tu primer administrador con estos datos:</p>
              <div className="bg-white p-4 rounded border border-blue-200 space-y-2 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p><strong>Email:</strong></p>
                  <p>admin@biblioteca.com</p>
                  
                  <p><strong>Contraseña:</strong></p>
                  <p>admin123</p>
                  
                  <p><strong>Identificación:</strong></p>
                  <p>0000000000</p>
                  
                  <p><strong>Nombre:</strong></p>
                  <p>Administrador</p>
                  
                  <p><strong>Apellido:</strong></p>
                  <p>Sistema</p>
                  
                  <p><strong>Fecha de Nacimiento:</strong></p>
                  <p>01/01/1990</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-blue-700">
                💡 Recuerda cambiar estos datos después del primer acceso por seguridad.
              </p>
            </AlertDescription>
          </Alert>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Usuario Cliente de Prueba</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">También puedes crear un cliente de prueba:</p>
              <div className="bg-gray-50 p-4 rounded border space-y-2 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p><strong>Email:</strong></p>
                  <p>cliente@biblioteca.com</p>
                  
                  <p><strong>Contraseña:</strong></p>
                  <p>cliente123</p>
                  
                  <p><strong>Identificación:</strong></p>
                  <p>1111111111</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
