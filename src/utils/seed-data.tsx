// Datos iniciales para el sistema
// Para crear un usuario administrador, usa las siguientes credenciales en el registro:

export const ADMIN_SEED_DATA = {
  email: 'admin@biblioteca.com',
  password: 'admin123',
  identificacion: '0000000000',
  nombre: 'Administrador',
  apellido: 'Sistema',
  fechaNacimiento: '1990-01-01',
  role: 'admin'
};

export const CLIENTE_SEED_DATA = {
  email: 'cliente@biblioteca.com',
  password: 'cliente123',
  identificacion: '1111111111',
  nombre: 'Cliente',
  apellido: 'Demo',
  fechaNacimiento: '1995-05-15',
  role: 'cliente'
};

// Instrucciones:
// 1. Inicia sesión o regístrate con las credenciales de arriba
// 2. Si necesitas un administrador, usa ADMIN_SEED_DATA
// 3. Si necesitas un cliente de prueba, usa CLIENTE_SEED_DATA
