// Sistema de Gestión de Biblioteca - Backend Server
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ==================== INICIALIZACIÓN ====================

// Crear usuario admin por defecto (solo si no existe)
app.post('/setup/init-admin', async (c) => {
  try {
    const adminEmail = 'admin@biblioteca.com';
    const adminIdentificacion = '0000000000';
    
    // Verificar si ya existe
    const existing = await kv.get(`cliente:${adminIdentificacion}`);
    if (existing) {
      return c.json({ 
        success: true, 
        message: 'El usuario administrador ya existe',
        existing: true 
      });
    }

    // Crear admin
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123',
      user_metadata: { 
        identificacion: adminIdentificacion, 
        nombre: 'Administrador', 
        apellido: 'Sistema', 
        fechaNacimiento: '1990-01-01',
        role: 'admin'
      },
      email_confirm: true
    });

    if (error) {
      console.error('Error al crear admin:', error);
      return c.json({ error: `Error al crear administrador: ${error.message}` }, 400);
    }

    const adminData = {
      id: data.user!.id,
      email: adminEmail,
      identificacion: adminIdentificacion,
      nombre: 'Administrador',
      apellido: 'Sistema',
      fechaNacimiento: '1990-01-01',
      role: 'admin',
      bloqueado: false,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user!.id}`, adminData);
    await kv.set(`cliente:${adminIdentificacion}`, adminData);

    // Crear categorías por defecto
    const categoriasDefault = [
      { nombre: 'Ficción', descripcion: 'Novelas y relatos de ficción literaria' },
      { nombre: 'Ciencia', descripcion: 'Libros científicos y divulgativos' },
      { nombre: 'Historia', descripcion: 'Libros de historia y biografías' },
      { nombre: 'Tecnología', descripcion: 'Libros sobre tecnología e informática' },
      { nombre: 'Arte', descripcion: 'Libros sobre arte, pintura y diseño' }
    ];

    for (const cat of categoriasDefault) {
      const catId = crypto.randomUUID();
      await kv.set(`categoria:${catId}`, {
        id: catId,
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        eliminado: false,
        createdAt: new Date().toISOString()
      });
    }

    return c.json({ 
      success: true, 
      message: 'Usuario administrador y categorías creados exitosamente',
      credentials: {
        email: adminEmail,
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('Error en init-admin:', error);
    return c.json({ error: `Error en inicialización: ${error.message}` }, 500);
  }
});

// ==================== AUTENTICACIÓN ====================

// Registro de usuarios
app.post('/auth/signup', async (c) => {
  try {
    const { email, password, identificacion, nombre, apellido, fechaNacimiento, role } = await c.req.json();
    
    // Validar que la identificación no exista
    const existingClient = await kv.get(`cliente:${identificacion}`);
    if (existingClient) {
      return c.json({ error: 'La identificación ya está registrada' }, 400);
    }

    // Crear usuario en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        identificacion, 
        nombre, 
        apellido, 
        fechaNacimiento,
        role: role || 'cliente'
      },
      email_confirm: true
    });

    if (error) {
      console.error('Error al crear usuario en Auth:', error);
      return c.json({ error: `Error al crear usuario: ${error.message}` }, 400);
    }

    // Guardar información adicional en KV Store
    const userData = {
      id: data.user!.id,
      email,
      identificacion,
      nombre,
      apellido,
      fechaNacimiento,
      role: role || 'cliente',
      bloqueado: false,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user!.id}`, userData);
    await kv.set(`cliente:${identificacion}`, userData);

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error en signup:', error);
    return c.json({ error: `Error en el registro: ${error.message}` }, 500);
  }
});

// Inicio de sesión
app.post('/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error al iniciar sesión:', error);
      return c.json({ error: 'Credenciales incorrectas' }, 401);
    }

    // Obtener datos adicionales del usuario
    const userData = await kv.get(`user:${data.user.id}`);
    
    if (!userData) {
      return c.json({ error: 'Usuario no encontrado en el sistema' }, 404);
    }

    if (userData.eliminado) {
      return c.json({ error: 'Esta cuenta ha sido eliminada' }, 403);
    }

    if (userData.bloqueado && userData.role === 'cliente') {
      return c.json({ error: 'Esta cuenta ha sido bloqueada. Contacte al administrador.' }, 403);
    }

    return c.json({ 
      success: true, 
      access_token: data.session.access_token,
      user: userData
    });
  } catch (error) {
    console.error('Error en signin:', error);
    return c.json({ error: `Error al iniciar sesión: ${error.message}` }, 500);
  }
});

// Middleware de autenticación
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (!user || error) {
    return c.json({ error: 'Token inválido' }, 401);
  }

  c.set('userId', user.id);
  const userData = await kv.get(`user:${user.id}`);
  c.set('user', userData);
  
  await next();
};

const requireAdmin = async (c: any, next: any) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Acceso denegado. Se requieren permisos de administrador.' }, 403);
  }
  await next();
};

// ==================== GESTIÓN DE CLIENTES ====================

// Listar clientes (Admin) - Muestra todos incluidos los eliminados
app.get('/clientes', requireAuth, requireAdmin, async (c) => {
  try {
    const clientes = await kv.getByPrefix('cliente:');
    // Admin ve todos los clientes (incluidos eliminados)
    return c.json({ clientes });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    return c.json({ error: `Error al obtener clientes: ${error.message}` }, 500);
  }
});

// Obtener cliente por identificación (Admin)
app.get('/clientes/:identificacion', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const cliente = await kv.get(`cliente:${identificacion}`);
    
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    return c.json({ cliente });
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return c.json({ error: `Error al buscar cliente: ${error.message}` }, 500);
  }
});

// Crear cliente (Admin)
app.post('/clientes', requireAuth, requireAdmin, async (c) => {
  try {
    const { identificacion, nombre, apellido, fechaNacimiento } = await c.req.json();
    
    const existingClient = await kv.get(`cliente:${identificacion}`);
    if (existingClient && !existingClient.eliminado) {
      return c.json({ error: 'La identificación ya existe' }, 400);
    }

    const clienteData = {
      id: crypto.randomUUID(),
      identificacion,
      nombre,
      apellido,
      fechaNacimiento,
      role: 'cliente',
      bloqueado: false,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, clienteData);

    return c.json({ success: true, cliente: clienteData });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return c.json({ error: `Error al crear cliente: ${error.message}` }, 500);
  }
});

// Modificar cliente (Admin)
app.put('/clientes/:identificacion', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const updates = await c.req.json();
    
    const cliente = await kv.get(`cliente:${identificacion}`);
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const updatedCliente = {
      ...cliente,
      ...updates,
      identificacion, // No permitir cambio de identificación
      updatedAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, updatedCliente);
    if (cliente.id) {
      await kv.set(`user:${cliente.id}`, updatedCliente);
    }

    return c.json({ success: true, cliente: updatedCliente });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return c.json({ error: `Error al actualizar cliente: ${error.message}` }, 500);
  }
});

// Eliminar cliente (borrado lógico)
app.delete('/clientes/:identificacion', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const cliente = await kv.get(`cliente:${identificacion}`);
    
    if (!cliente) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const updatedCliente = {
      ...cliente,
      eliminado: true,
      deletedAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, updatedCliente);
    if (cliente.id) {
      await kv.set(`user:${cliente.id}`, updatedCliente);
    }

    return c.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return c.json({ error: `Error al eliminar cliente: ${error.message}` }, 500);
  }
});

// Rehabilitar cliente
app.post('/clientes/:identificacion/rehabilitar', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const cliente = await kv.get(`cliente:${identificacion}`);
    
    if (!cliente) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const updatedCliente = {
      ...cliente,
      eliminado: false,
      rehabilitadoAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, updatedCliente);
    if (cliente.id) {
      await kv.set(`user:${cliente.id}`, updatedCliente);
    }

    return c.json({ success: true, message: 'Cliente rehabilitado correctamente' });
  } catch (error) {
    console.error('Error al rehabilitar cliente:', error);
    return c.json({ error: `Error al rehabilitar cliente: ${error.message}` }, 500);
  }
});

// Bloquear cliente
app.post('/clientes/:identificacion/bloquear', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const cliente = await kv.get(`cliente:${identificacion}`);
    
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const updatedCliente = {
      ...cliente,
      bloqueado: true,
      bloqueadoAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, updatedCliente);
    if (cliente.id) {
      await kv.set(`user:${cliente.id}`, updatedCliente);
    }

    return c.json({ success: true, message: 'Cliente bloqueado correctamente' });
  } catch (error) {
    console.error('Error al bloquear cliente:', error);
    return c.json({ error: `Error al bloquear cliente: ${error.message}` }, 500);
  }
});

// Desbloquear cliente
app.post('/clientes/:identificacion/desbloquear', requireAuth, requireAdmin, async (c) => {
  try {
    const identificacion = c.req.param('identificacion');
    const cliente = await kv.get(`cliente:${identificacion}`);
    
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const updatedCliente = {
      ...cliente,
      bloqueado: false,
      desbloqueadoAt: new Date().toISOString()
    };

    await kv.set(`cliente:${identificacion}`, updatedCliente);
    if (cliente.id) {
      await kv.set(`user:${cliente.id}`, updatedCliente);
    }

    return c.json({ success: true, message: 'Cliente desbloqueado correctamente' });
  } catch (error) {
    console.error('Error al desbloquear cliente:', error);
    return c.json({ error: `Error al desbloquear cliente: ${error.message}` }, 500);
  }
});

// ==================== GESTIÓN DE LIBROS ====================

// Listar libros - Calcula copias disponibles en tiempo real
app.get('/libros', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const libros = await kv.getByPrefix('libro:');
    const prestamos = await kv.getByPrefix('prestamo:');
    
    // Normalizar libros: SIEMPRE recalcular copias disponibles dinámicamente
    const librosNormalizados = libros.map((libro: any) => {
      // Usar copiasTotal como única fuente de verdad
      const copiasTotal = libro.copiasTotal ?? 1;
      
      // Contar préstamos activos de este libro
      const prestamosActivos = prestamos.filter((p: any) => 
        p.libroId === libro.id && !p.devuelto && p.activo !== false
      );
      
      const copiasDisponibles = Math.max(0, copiasTotal - prestamosActivos.length);
      
      return {
        ...libro,
        copiasTotal,
        copiasDisponibles,
        disponible: copiasDisponibles > 0
      };
    });
    
    // Admin ve todos los libros (incluidos eliminados), clientes solo los activos
    const filteredLibros = user.role === 'admin' 
      ? librosNormalizados 
      : librosNormalizados.filter((libro: any) => !libro.eliminado);
    
    return c.json({ libros: filteredLibros });
  } catch (error) {
    console.error('Error al listar libros:', error);
    return c.json({ error: `Error al obtener libros: ${error.message}` }, 500);
  }
});

// Crear libro (Admin)
app.post('/libros', requireAuth, requireAdmin, async (c) => {
  try {
    const { idLibro, nombre, genero, numPaginas, copiasTotal, autor, imagenUrl } = await c.req.json();
    
    const existingBook = await kv.get(`libro:${idLibro}`);
    if (existingBook && !existingBook.eliminado) {
      return c.json({ error: 'El ID del libro ya existe' }, 400);
    }

    // Usar copiasTotal, defaultear a 1 si no viene
    const totalCopias = copiasTotal ? parseInt(copiasTotal) : 1;
    
    const libroData = {
      id: idLibro,
      nombre,
      genero,
      numPaginas: numPaginas ? parseInt(numPaginas) : null,
      copiasTotal: totalCopias,
      copiasDisponibles: totalCopias,
      autor,
      imagenUrl: imagenUrl && imagenUrl.trim() !== '' ? imagenUrl.trim() : null,
      disponible: true,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    console.log('Creando libro con datos:', libroData);
    await kv.set(`libro:${idLibro}`, libroData);

    return c.json({ success: true, libro: libroData });
  } catch (error) {
    console.error('Error al crear libro:', error);
    return c.json({ error: `Error al crear libro: ${error.message}` }, 500);
  }
});

// Modificar libro (Admin)
app.put('/libros/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const libro = await kv.get(`libro:${id}`);
    if (!libro || libro.eliminado) {
      return c.json({ error: 'Libro no encontrado' }, 404);
    }

    // Obtener valores actuales
    const libroCopiasDisp = libro.copiasDisponibles !== undefined ? libro.copiasDisponibles : 1;
    const libroCopiasTotal = libro.copiasTotal !== undefined ? libro.copiasTotal : 1;
    
    let copiasDisponibles = libroCopiasDisp;
    let copiasTotal = libroCopiasTotal;
    
    // Si se actualiza la cantidad total de copias
    if (updates.copiasTotal !== undefined) {
      const nuevasCopiasTotal = parseInt(updates.copiasTotal);
      const diferencia = nuevasCopiasTotal - libroCopiasTotal;
      copiasTotal = nuevasCopiasTotal;
      copiasDisponibles = Math.max(0, libroCopiasDisp + diferencia);
    }

    const updatedLibro = {
      ...libro,
      ...updates,
      id, // No permitir cambio de ID
      numPaginas: updates.numPaginas ? parseInt(updates.numPaginas) : libro.numPaginas,
      copiasTotal: copiasTotal,
      copiasDisponibles: copiasDisponibles,
      imagenUrl: updates.imagenUrl !== undefined ? (updates.imagenUrl && updates.imagenUrl.trim() !== '' ? updates.imagenUrl.trim() : null) : libro.imagenUrl,
      disponible: copiasDisponibles > 0,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Actualizando libro con datos:', updatedLibro);

    await kv.set(`libro:${id}`, updatedLibro);

    return c.json({ success: true, libro: updatedLibro });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    return c.json({ error: `Error al actualizar libro: ${error.message}` }, 500);
  }
});

// Eliminar libro (borrado lógico)
app.delete('/libros/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const libro = await kv.get(`libro:${id}`);
    
    if (!libro) {
      return c.json({ error: 'Libro no encontrado' }, 404);
    }

    const updatedLibro = {
      ...libro,
      eliminado: true,
      deletedAt: new Date().toISOString()
    };

    await kv.set(`libro:${id}`, updatedLibro);

    return c.json({ success: true, message: 'Libro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    return c.json({ error: `Error al eliminar libro: ${error.message}` }, 500);
  }
});

// Rehabilitar libro
app.post('/libros/:id/rehabilitar', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const libro = await kv.get(`libro:${id}`);
    
    if (!libro) {
      return c.json({ error: 'Libro no encontrado' }, 404);
    }

    const updatedLibro = {
      ...libro,
      eliminado: false,
      rehabilitadoAt: new Date().toISOString()
    };

    await kv.set(`libro:${id}`, updatedLibro);

    return c.json({ success: true, message: 'Libro rehabilitado correctamente' });
  } catch (error) {
    console.error('Error al rehabilitar libro:', error);
    return c.json({ error: `Error al rehabilitar libro: ${error.message}` }, 500);
  }
});

// ==================== GESTIÓN DE PRÉSTAMOS ====================

// Listar préstamos
app.get('/prestamos', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const prestamos = await kv.getByPrefix('prestamo:');
    
    // Filtrar préstamos según el rol
    let filteredPrestamos = prestamos;
    
    if (user.role === 'admin') {
      // Admin ve todos los préstamos (activos e inactivos)
      filteredPrestamos = prestamos;
    } else {
      // Clientes solo ven sus préstamos activos
      filteredPrestamos = prestamos.filter((p: any) => 
        p.clienteIdentificacion === user.identificacion && p.activo !== false
      );
    }

    return c.json({ prestamos: filteredPrestamos });
  } catch (error) {
    console.error('Error al listar préstamos:', error);
    return c.json({ error: `Error al obtener préstamos: ${error.message}` }, 500);
  }
});

// Crear préstamo (Admin o Cliente)
app.post('/prestamos', requireAuth, async (c) => {
  try {
    const { clienteIdentificacion, libroId, fechaPrestamo, fechaVencimiento } = await c.req.json();
    const user = c.get('user');

    // Si es cliente, solo puede prestar para sí mismo
    const targetIdentificacion = user.role === 'cliente' ? user.identificacion : clienteIdentificacion;

    // Verificar que el cliente existe y no está bloqueado
    const cliente = await kv.get(`cliente:${targetIdentificacion}`);
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }
    if (cliente.bloqueado) {
      return c.json({ error: 'Cliente bloqueado. No puede realizar préstamos.' }, 403);
    }

    // Verificar que el libro existe y está disponible
    let libro = await kv.get(`libro:${libroId}`);
    if (!libro || libro.eliminado) {
      return c.json({ error: 'Libro no encontrado' }, 404);
    }
    
    // Normalizar libro si es necesario (para libros antiguos)
    if (libro.copiasTotal === undefined || libro.copiasDisponibles === undefined) {
      const copiasTotal = libro.copiasTotal || libro.cantidadCopias || 1;
      
      // Contar préstamos activos de este libro
      const prestamos = await kv.getByPrefix('prestamo:');
      const prestamosActivos = prestamos.filter((p: any) => 
        p.libroId === libroId && !p.devuelto && p.activo !== false
      );
      
      libro = {
        ...libro,
        copiasTotal,
        cantidadCopias: copiasTotal,
        copiasDisponibles: Math.max(0, copiasTotal - prestamosActivos.length)
      };
      
      await kv.set(`libro:${libroId}`, libro);
    }
    
    // Verificar copias disponibles
    const copiasDisponibles = libro.copiasDisponibles;
    if (copiasDisponibles <= 0) {
      return c.json({ error: 'No hay copias disponibles de este libro' }, 400);
    }

    // Validar fechas
    const fechaInicio = fechaPrestamo ? new Date(fechaPrestamo) : new Date();
    const fechaFin = fechaVencimiento ? new Date(fechaVencimiento) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    if (fechaFin <= fechaInicio) {
      return c.json({ error: 'La fecha de vencimiento debe ser posterior a la fecha de préstamo' }, 400);
    }

    // Generar recibo
    const prestamoId = crypto.randomUUID();
    const recibo = {
      numero: `REC-${Date.now()}`,
      fecha: fechaInicio.toISOString(),
      cliente: `${cliente.nombre} ${cliente.apellido}`,
      identificacion: cliente.identificacion,
      libro: libro.nombre,
      autor: libro.autor,
      libroId: libro.id,
      prestamoId,
      fechaVencimiento: fechaFin.toISOString()
    };

    const prestamoData = {
      id: prestamoId,
      clienteIdentificacion: targetIdentificacion,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
      libroId,
      libroNombre: libro.nombre,
      fechaPrestamo: fechaInicio.toISOString(),
      fechaVencimiento: fechaFin.toISOString(),
      fechaDevolucion: null,
      devuelto: false,
      estado: 'activo',
      activo: true, // Préstamo activo por defecto
      recibo,
      createdAt: fechaInicio.toISOString()
    };

    await kv.set(`prestamo:${prestamoId}`, prestamoData);

    // Decrementar copias disponibles
    const nuevasCopiasDisponibles = copiasDisponibles - 1;
    await kv.set(`libro:${libroId}`, { 
      ...libro, 
      copiasDisponibles: nuevasCopiasDisponibles,
      disponible: nuevasCopiasDisponibles > 0 
    });

    return c.json({ success: true, prestamo: prestamoData, recibo });
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    return c.json({ error: `Error al crear préstamo: ${error.message}` }, 500);
  }
});

// Devolver libro
app.post('/prestamos/:id/devolver', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const prestamo = await kv.get(`prestamo:${id}`);
    
    if (!prestamo) {
      return c.json({ error: 'Préstamo no encontrado' }, 404);
    }

    if (prestamo.devuelto) {
      return c.json({ error: 'Este libro ya fue devuelto' }, 400);
    }

    const updatedPrestamo = {
      ...prestamo,
      fechaDevolucion: new Date().toISOString(),
      devuelto: true,
      estado: 'devuelto'
    };

    await kv.set(`prestamo:${id}`, updatedPrestamo);

    // Incrementar copias disponibles
    const libro = await kv.get(`libro:${prestamo.libroId}`);
    if (libro) {
      const copiasDisponibles = (libro.copiasDisponibles !== undefined ? libro.copiasDisponibles : 0) + 1;
      const copiasTotal = libro.copiasTotal || libro.cantidadCopias || 1;
      await kv.set(`libro:${prestamo.libroId}`, { 
        ...libro, 
        copiasDisponibles: Math.min(copiasDisponibles, copiasTotal),
        disponible: true 
      });
    }

    return c.json({ success: true, message: 'Libro devuelto correctamente' });
  } catch (error) {
    console.error('Error al devolver libro:', error);
    return c.json({ error: `Error al devolver libro: ${error.message}` }, 500);
  }
});

// Desactivar préstamo - Admin
app.delete('/prestamos/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const prestamo = await kv.get(`prestamo:${id}`);
    
    if (!prestamo) {
      return c.json({ error: 'Préstamo no encontrado' }, 404);
    }

    // Desactivar préstamo
    const updatedPrestamo = {
      ...prestamo,
      activo: false,
      desactivadoAt: new Date().toISOString()
    };

    await kv.set(`prestamo:${id}`, updatedPrestamo);

    // Si el préstamo estaba en curso (no devuelto), incrementar copias disponibles
    if (!prestamo.devuelto) {
      const libro = await kv.get(`libro:${prestamo.libroId}`);
      if (libro) {
        const copiasDisponibles = (libro.copiasDisponibles !== undefined ? libro.copiasDisponibles : 0) + 1;
        const copiasTotal = libro.copiasTotal || libro.cantidadCopias || 1;
        await kv.set(`libro:${prestamo.libroId}`, { 
          ...libro, 
          copiasDisponibles: Math.min(copiasDisponibles, copiasTotal),
          disponible: true 
        });
      }
    }

    return c.json({ success: true, message: 'Préstamo desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar préstamo:', error);
    return c.json({ error: `Error al desactivar préstamo: ${error.message}` }, 500);
  }
});

// Rehabilitar préstamo - Admin
app.post('/prestamos/:id/rehabilitar', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const prestamo = await kv.get(`prestamo:${id}`);
    
    if (!prestamo) {
      return c.json({ error: 'Préstamo no encontrado' }, 404);
    }

    // Reactivar préstamo
    const updatedPrestamo = {
      ...prestamo,
      activo: true,
      desactivadoAt: null
    };

    await kv.set(`prestamo:${id}`, updatedPrestamo);

    // Si el préstamo no estaba devuelto, decrementar copias disponibles
    if (!prestamo.devuelto) {
      const libro = await kv.get(`libro:${prestamo.libroId}`);
      if (libro) {
        const copiasDisponibles = Math.max(0, (libro.copiasDisponibles !== undefined ? libro.copiasDisponibles : 1) - 1);
        await kv.set(`libro:${prestamo.libroId}`, { 
          ...libro, 
          copiasDisponibles,
          disponible: copiasDisponibles > 0 
        });
      }
    }

    return c.json({ success: true, message: 'Préstamo rehabilitado correctamente' });
  } catch (error) {
    console.error('Error al rehabilitar préstamo:', error);
    return c.json({ error: `Error al rehabilitar préstamo: ${error.message}` }, 500);
  }
});

// ==================== GESTIÓN DE MULTAS ====================

// Listar multas
app.get('/multas', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const multas = await kv.getByPrefix('multa:');
    
    // Filtrar multas según el rol
    let filteredMultas = multas;
    
    if (user.role === 'admin') {
      // Admin ve todas las multas (activas e inactivas)
      filteredMultas = multas;
    } else {
      // Clientes solo ven sus multas activas (no desactivadas)
      filteredMultas = multas.filter((m: any) => 
        m.clienteIdentificacion === user.identificacion && m.activo !== false
      );
    }

    return c.json({ multas: filteredMultas });
  } catch (error) {
    console.error('Error al listar multas:', error);
    return c.json({ error: `Error al obtener multas: ${error.message}` }, 500);
  }
});

// Crear multa (Admin)
app.post('/multas', requireAuth, requireAdmin, async (c) => {
  try {
    const { clienteIdentificacion, monto, razon } = await c.req.json();
    
    const cliente = await kv.get(`cliente:${clienteIdentificacion}`);
    if (!cliente || cliente.eliminado) {
      return c.json({ error: 'Cliente no encontrado' }, 404);
    }

    const multaData = {
      id: crypto.randomUUID(),
      clienteIdentificacion,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
      monto: parseFloat(monto),
      razon,
      activa: true, // La multa está activa (pendiente de pago)
      activo: true, // La multa está habilitada en el sistema
      fechaCreacion: new Date().toISOString(),
      fechaPago: null
    };

    await kv.set(`multa:${multaData.id}`, multaData);

    return c.json({ success: true, multa: multaData });
  } catch (error) {
    console.error('Error al crear multa:', error);
    return c.json({ error: `Error al crear multa: ${error.message}` }, 500);
  }
});

// Marcar multa como pagada (Admin)
app.post('/multas/:id/pagar', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const multa = await kv.get(`multa:${id}`);
    
    if (!multa) {
      return c.json({ error: 'Multa no encontrada' }, 404);
    }

    const updatedMulta = {
      ...multa,
      activa: false,
      fechaPago: new Date().toISOString()
    };

    await kv.set(`multa:${id}`, updatedMulta);

    return c.json({ success: true, message: 'Multa marcada como pagada' });
  } catch (error) {
    console.error('Error al marcar multa como pagada:', error);
    return c.json({ error: `Error al marcar multa como pagada: ${error.message}` }, 500);
  }
});

// Desactivar multa (Admin)
app.delete('/multas/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const multa = await kv.get(`multa:${id}`);
    
    if (!multa) {
      return c.json({ error: 'Multa no encontrada' }, 404);
    }

    // Desactivar multa (borrado lógico)
    const updatedMulta = {
      ...multa,
      activo: false,
      desactivadoAt: new Date().toISOString()
    };

    await kv.set(`multa:${id}`, updatedMulta);

    return c.json({ success: true, message: 'Multa desactivada correctamente' });
  } catch (error) {
    console.error('Error al desactivar multa:', error);
    return c.json({ error: `Error al desactivar multa: ${error.message}` }, 500);
  }
});

// Rehabilitar multa (Admin)
app.post('/multas/:id/rehabilitar', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const multa = await kv.get(`multa:${id}`);
    
    if (!multa) {
      return c.json({ error: 'Multa no encontrada' }, 404);
    }

    // Reactivar multa
    const updatedMulta = {
      ...multa,
      activo: true,
      desactivadoAt: null
    };

    await kv.set(`multa:${id}`, updatedMulta);

    return c.json({ success: true, message: 'Multa rehabilitada correctamente' });
  } catch (error) {
    console.error('Error al rehabilitar multa:', error);
    return c.json({ error: `Error al rehabilitar multa: ${error.message}` }, 500);
  }
});

// ==================== REPORTES Y ESTADÍSTICAS ====================

// Reporte general de préstamos
app.get('/reportes/general', requireAuth, requireAdmin, async (c) => {
  try {
    const clientes = await kv.getByPrefix('cliente:');
    const libros = await kv.getByPrefix('libro:');
    const prestamos = await kv.getByPrefix('prestamo:');
    const multas = await kv.getByPrefix('multa:');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar préstamos del mes actual
    const prestamosDelMes = prestamos.filter((p: any) => {
      const fecha = new Date(p.fechaPrestamo);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    // Filtrar multas del mes actual (solo activas en el sistema)
    const multasDelMes = multas.filter((m: any) => {
      const fecha = new Date(m.fechaCreacion);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear && m.activo !== false;
    });

    // Libro más prestado
    const librosPrestados: any = {};
    prestamosDelMes.forEach((p: any) => {
      librosPrestados[p.libroId] = (librosPrestados[p.libroId] || 0) + 1;
    });
    const libroMasPrestadoId = Object.keys(librosPrestados).reduce((a, b) => 
      librosPrestados[a] > librosPrestados[b] ? a : b, ''
    );
    const libroMasPrestado = libroMasPrestadoId ? await kv.get(`libro:${libroMasPrestadoId}`) : null;

    // Géneros más prestados
    const generosPrestados: any = {};
    for (const p of prestamosDelMes) {
      const libro = await kv.get(`libro:${p.libroId}`);
      if (libro) {
        generosPrestados[libro.genero] = (generosPrestados[libro.genero] || 0) + 1;
      }
    }

    const reporte = {
      libroMasPrestado: libroMasPrestado ? libroMasPrestado.nombre : 'N/A',
      generosMasPrestados: Object.entries(generosPrestados).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3),
      totalClientes: clientes.filter((c: any) => !c.eliminado).length,
      totalLibros: libros.filter((l: any) => !l.eliminado).length,
      totalPrestamos: prestamosDelMes.length,
      totalMultas: multasDelMes.filter((m: any) => m.activa).length,
      mes: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    };

    return c.json({ reporte });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return c.json({ error: `Error al generar reporte: ${error.message}` }, 500);
  }
});

// Reporte de multas del mes
app.get('/reportes/multas', requireAuth, requireAdmin, async (c) => {
  try {
    const multas = await kv.getByPrefix('multa:');

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar solo multas activas en el sistema (no desactivadas)
    const multasDelMes = multas.filter((m: any) => {
      const fecha = new Date(m.fechaCreacion);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear && m.activo !== false;
    });

    const reporte = {
      cantidadMultas: multasDelMes.length,
      multasActivas: multasDelMes.filter((m: any) => m.activa).length,
      multasPagadas: multasDelMes.filter((m: any) => !m.activa).length,
      montoTotal: multasDelMes.reduce((sum: number, m: any) => sum + m.monto, 0),
      mes: now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      multas: multasDelMes
    };

    return c.json({ reporte });
  } catch (error) {
    console.error('Error al generar reporte de multas:', error);
    return c.json({ error: `Error al generar reporte de multas: ${error.message}` }, 500);
  }
});

// ==================== GESTIÓN DE CATEGORÍAS ====================

// Listar categorías
app.get('/categorias', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const categorias = await kv.getByPrefix('categoria:');
    
    // Admin ve todas las categorías (incluidas eliminadas), clientes solo las activas
    const filteredCategorias = user.role === 'admin' 
      ? categorias 
      : categorias.filter((cat: any) => !cat.eliminado);
    
    return c.json({ categorias: filteredCategorias });
  } catch (error) {
    console.error('Error al listar categorías:', error);
    return c.json({ error: `Error al obtener categorías: ${error.message}` }, 500);
  }
});

// Crear categoría (Admin)
app.post('/categorias', requireAuth, requireAdmin, async (c) => {
  try {
    const { nombre, descripcion } = await c.req.json();
    
    // Verificar que el nombre no exista
    const categorias = await kv.getByPrefix('categoria:');
    const exists = categorias.some((cat: any) => 
      cat.nombre.toLowerCase() === nombre.toLowerCase() && !cat.eliminado
    );
    
    if (exists) {
      return c.json({ error: 'Ya existe una categoría con ese nombre' }, 400);
    }

    const categoriaId = crypto.randomUUID();
    const categoriaData = {
      id: categoriaId,
      nombre,
      descripcion: descripcion || '',
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`categoria:${categoriaId}`, categoriaData);

    return c.json({ success: true, categoria: categoriaData });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return c.json({ error: `Error al crear categoría: ${error.message}` }, 500);
  }
});

// Modificar categoría (Admin)
app.put('/categorias/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const categoria = await kv.get(`categoria:${id}`);
    if (!categoria || categoria.eliminado) {
      return c.json({ error: 'Categoría no encontrada' }, 404);
    }

    // Si se cambia el nombre, verificar que no exista
    if (updates.nombre && updates.nombre !== categoria.nombre) {
      const categorias = await kv.getByPrefix('categoria:');
      const exists = categorias.some((cat: any) => 
        cat.nombre.toLowerCase() === updates.nombre.toLowerCase() && 
        cat.id !== id && 
        !cat.eliminado
      );
      
      if (exists) {
        return c.json({ error: 'Ya existe una categoría con ese nombre' }, 400);
      }
    }

    const updatedCategoria = {
      ...categoria,
      ...updates,
      id, // No permitir cambio de ID
      updatedAt: new Date().toISOString()
    };

    await kv.set(`categoria:${id}`, updatedCategoria);

    return c.json({ success: true, categoria: updatedCategoria });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return c.json({ error: `Error al actualizar categoría: ${error.message}` }, 500);
  }
});

// Eliminar categoría (borrado lógico)
app.delete('/categorias/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const categoria = await kv.get(`categoria:${id}`);
    
    if (!categoria) {
      return c.json({ error: 'Categoría no encontrada' }, 404);
    }

    const updatedCategoria = {
      ...categoria,
      eliminado: true,
      deletedAt: new Date().toISOString()
    };

    await kv.set(`categoria:${id}`, updatedCategoria);

    return c.json({ success: true, message: 'Categoría desactivada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return c.json({ error: `Error al eliminar categoría: ${error.message}` }, 500);
  }
});

// Rehabilitar categoría
app.post('/categorias/:id/rehabilitar', requireAuth, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const categoria = await kv.get(`categoria:${id}`);
    
    if (!categoria) {
      return c.json({ error: 'Categoría no encontrada' }, 404);
    }

    const updatedCategoria = {
      ...categoria,
      eliminado: false,
      rehabilitadoAt: new Date().toISOString()
    };

    await kv.set(`categoria:${id}`, updatedCategoria);

    return c.json({ success: true, message: 'Categoría activada correctamente' });
  } catch (error) {
    console.error('Error al rehabilitar categoría:', error);
    return c.json({ error: `Error al rehabilitar categoría: ${error.message}` }, 500);
  }
});

// ==================== REPORTES Y ESTADÍSTICAS ====================

// Estadísticas para gráficos
app.get('/estadisticas', requireAuth, requireAdmin, async (c) => {
  try {
    const prestamos = await kv.getByPrefix('prestamo:');
    const clientes = await kv.getByPrefix('cliente:');
    const libros = await kv.getByPrefix('libro:');

    const now = new Date();
    const currentYear = now.getFullYear();

    // Préstamos por mes (últimos 12 meses)
    const prestamosPorMes = Array(12).fill(0);
    prestamos.forEach((p: any) => {
      const fecha = new Date(p.fechaPrestamo);
      if (fecha.getFullYear() === currentYear) {
        prestamosPorMes[fecha.getMonth()]++;
      }
    });

    // Promedio de libros prestados por cliente
    const clientesConPrestamos = new Set(prestamos.map((p: any) => p.clienteIdentificacion));
    const promedioLibrosPorCliente = clientesConPrestamos.size > 0 
      ? (prestamos.length / clientesConPrestamos.size).toFixed(2) 
      : 0;

    // Libros ingresados por año
    const librosPorAnio: any = {};
    libros.forEach((l: any) => {
      const anio = new Date(l.createdAt).getFullYear();
      librosPorAnio[anio] = (librosPorAnio[anio] || 0) + 1;
    });

    // Nuevos clientes por trimestre
    const clientesPorTrimestre = [0, 0, 0, 0];
    clientes.forEach((c: any) => {
      const fecha = new Date(c.createdAt);
      if (fecha.getFullYear() === currentYear) {
        const trimestre = Math.floor(fecha.getMonth() / 3);
        clientesPorTrimestre[trimestre]++;
      }
    });

    const estadisticas = {
      prestamosPorMes: prestamosPorMes.map((cantidad, mes) => ({
        mes: new Date(currentYear, mes).toLocaleDateString('es-ES', { month: 'short' }),
        cantidad
      })),
      promedioLibrosPorCliente: parseFloat(promedioLibrosPorCliente),
      librosPorAnio: Object.entries(librosPorAnio).map(([anio, cantidad]) => ({
        anio,
        cantidad
      })),
      clientesPorTrimestre: clientesPorTrimestre.map((cantidad, trimestre) => ({
        trimestre: `T${trimestre + 1}`,
        cantidad
      }))
    };

    return c.json({ estadisticas });
  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    return c.json({ error: `Error al generar estadísticas: ${error.message}` }, 500);
  }
});

// ==================== LOGS DE AUDITORÍA ====================
// NOTA: Los logs se almacenan en el KV store para evitar requerir 
// configuración adicional de base de datos. Esto es ideal para prototipos.

/**
 * ENDPOINT: POST /logs/registrar
 * Descripción: Registra una acción en el sistema de auditoría usando KV store
 * Body: {
 *   usuarioId: string,
 *   usuarioNombre: string,
 *   usuarioRole: string,
 *   accion: string,
 *   modulo: string,
 *   entidadId?: string,
 *   detalles?: object,
 *   ipAddress?: string,
 *   userAgent?: string
 * }
 */
app.post('/logs/registrar', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { 
      usuarioId, 
      usuarioNombre, 
      usuarioRole,
      accion, 
      modulo, 
      entidadId, 
      detalles,
      ipAddress,
      userAgent
    } = body;

    // Validar campos requeridos
    if (!usuarioId || !usuarioNombre || !usuarioRole || !accion || !modulo) {
      return c.json({ 
        error: 'Campos requeridos: usuarioId, usuarioNombre, usuarioRole, accion, modulo' 
      }, 400);
    }

    // Crear log con timestamp único para ordenación
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
    
    const logData = {
      id,
      timestamp,
      usuario_id: usuarioId,
      usuario_nombre: usuarioNombre,
      usuario_role: usuarioRole,
      accion: accion,
      modulo: modulo,
      entidad_id: entidadId || null,
      detalles: detalles || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null
    };

    // Guardar en KV store con key que permite ordenamiento temporal
    // Formato: log:TIMESTAMP:UUID
    await kv.set(`log:${timestamp}:${id}`, logData);

    return c.json({ success: true, log: logData });
  } catch (error) {
    console.error('Error en endpoint de logs:', error);
    return c.json({ error: `Error en endpoint de logs: ${error.message}` }, 500);
  }
});

/**
 * ENDPOINT: GET /logs/listar
 * Descripción: Obtiene logs de auditoría con filtros y paginación
 * Query params:
 *   - page: número de página (default: 1)
 *   - limit: registros por página (default: 50, max: 500)
 *   - modulo: filtrar por módulo
 *   - accion: filtrar por acción
 *   - usuarioId: filtrar por usuario
 *   - fechaInicio: filtrar desde fecha (ISO string)
 *   - fechaFin: filtrar hasta fecha (ISO string)
 */
app.get('/logs/listar', requireAuth, requireAdmin, async (c) => {
  try {
    // Obtener parámetros de query
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 500);
    const modulo = c.req.query('modulo');
    const accion = c.req.query('accion');
    const usuarioId = c.req.query('usuarioId');
    const fechaInicio = c.req.query('fechaInicio');
    const fechaFin = c.req.query('fechaFin');

    // Obtener todos los logs del KV store
    let logs = await kv.getByPrefix('log:');

    // Aplicar filtros
    if (modulo && modulo !== 'TODOS') {
      logs = logs.filter((log: any) => log.modulo === modulo);
    }
    if (accion && accion !== 'TODAS') {
      logs = logs.filter((log: any) => log.accion === accion);
    }
    if (usuarioId) {
      logs = logs.filter((log: any) => log.usuario_id === usuarioId);
    }
    if (fechaInicio) {
      // Convertir fecha inicio a inicio del día en UTC
      const fechaInicioDate = new Date(fechaInicio + 'T00:00:00.000Z');
      logs = logs.filter((log: any) => new Date(log.timestamp) >= fechaInicioDate);
    }
    if (fechaFin) {
      // Convertir fecha fin a fin del día en UTC (23:59:59.999)
      const fechaFinDate = new Date(fechaFin + 'T23:59:59.999Z');
      logs = logs.filter((log: any) => new Date(log.timestamp) <= fechaFinDate);
    }

    // Ordenar por timestamp descendente (más reciente primero)
    logs.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Calcular paginación
    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedLogs = logs.slice(offset, offset + limit);

    return c.json({ 
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error en endpoint de listar logs:', error);
    return c.json({ error: `Error al listar logs: ${error.message}` }, 500);
  }
});

/**
 * ENDPOINT: GET /logs/estadisticas
 * Descripción: Obtiene estadísticas de los logs de auditoría
 * Query params:
 *   - fechaInicio: filtrar desde fecha (ISO string)
 *   - fechaFin: filtrar hasta fecha (ISO string)
 */
app.get('/logs/estadisticas', requireAuth, requireAdmin, async (c) => {
  try {
    const fechaInicio = c.req.query('fechaInicio');
    const fechaFin = c.req.query('fechaFin');

    // Obtener todos los logs del KV store
    let logs = await kv.getByPrefix('log:');

    // Aplicar filtros de fecha
    if (fechaInicio) {
      // Convertir fecha inicio a inicio del día en UTC
      const fechaInicioDate = new Date(fechaInicio + 'T00:00:00.000Z');
      logs = logs.filter((log: any) => new Date(log.timestamp) >= fechaInicioDate);
    }
    if (fechaFin) {
      // Convertir fecha fin a fin del día en UTC (23:59:59.999)
      const fechaFinDate = new Date(fechaFin + 'T23:59:59.999Z');
      logs = logs.filter((log: any) => new Date(log.timestamp) <= fechaFinDate);
    }

    // Calcular estadísticas
    const totalAcciones = logs.length;
    
    const accionesPorTipo: Record<string, number> = {};
    const accionesPorModulo: Record<string, number> = {};
    const accionesPorUsuario: Record<string, number> = {};
    const accionesPorDia: Record<string, number> = {};

    logs.forEach((log: any) => {
      // Por tipo de acción
      accionesPorTipo[log.accion] = (accionesPorTipo[log.accion] || 0) + 1;
      
      // Por módulo
      accionesPorModulo[log.modulo] = (accionesPorModulo[log.modulo] || 0) + 1;
      
      // Por usuario
      accionesPorUsuario[log.usuario_nombre] = (accionesPorUsuario[log.usuario_nombre] || 0) + 1;
      
      // Por día
      const fecha = new Date(log.timestamp).toISOString().split('T')[0];
      accionesPorDia[fecha] = (accionesPorDia[fecha] || 0) + 1;
    });

    return c.json({
      estadisticas: {
        totalAcciones,
        accionesPorTipo: Object.entries(accionesPorTipo).map(([tipo, cantidad]) => ({
          tipo,
          cantidad
        })),
        accionesPorModulo: Object.entries(accionesPorModulo).map(([modulo, cantidad]) => ({
          modulo,
          cantidad
        })),
        accionesPorUsuario: Object.entries(accionesPorUsuario).map(([usuario, cantidad]) => ({
          usuario,
          cantidad
        })),
        accionesPorDia: Object.entries(accionesPorDia)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([fecha, cantidad]) => ({
            fecha,
            cantidad
          }))
      }
    });
  } catch (error) {
    console.error('Error al generar estadísticas de logs:', error);
    return c.json({ error: `Error al generar estadísticas: ${error.message}` }, 500);
  }
});

// ==================== LOGS DE AUDITORÍA (SUPABASE) ====================

/**
 * ENDPOINT: POST /logs-auditoria/registrar
 * Descripción: Registra una nueva acción en los logs de auditoría
 * Body: { usuario_id, usuario_nombre, usuario_email, accion, modulo, entidad_id, detalles, ip_address, user_agent }
 */
app.post('/logs-auditoria/registrar', async (c) => {
  try {
    const body = await c.req.json();
    const { 
      usuario_id, 
      usuario_nombre, 
      usuario_email,
      accion, 
      modulo, 
      entidad_id, 
      detalles,
      ip_address,
      user_agent
    } = body;

    // Validaciones
    if (!usuario_id || !usuario_nombre || !accion || !modulo) {
      return c.json({ error: 'Faltan campos requeridos: usuario_id, usuario_nombre, accion, modulo' }, 400);
    }

    // Insertar en la tabla de logs_auditoria
    const { data, error } = await supabase
      .from('logs_auditoria')
      .insert({
        usuario_id,
        usuario_nombre,
        usuario_email,
        accion,
        modulo,
        entidad_id,
        detalles,
        ip_address,
        user_agent,
        fecha: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error al insertar log de auditoría:', error);
      return c.json({ error: `Error al registrar log: ${error.message}` }, 500);
    }

    return c.json({ 
      success: true, 
      log: data,
      message: 'Log registrado correctamente' 
    });
  } catch (error) {
    console.error('Error en endpoint de registrar log:', error);
    return c.json({ error: `Error al registrar log: ${error.message}` }, 500);
  }
});

/**
 * ENDPOINT: GET /logs-auditoria/listar
 * Descripción: Lista los logs de auditoría con filtros y paginación
 * Query params: page, limit, modulo, accion, usuarioId, fechaInicio, fechaFin
 */
app.get('/logs-auditoria/listar', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const modulo = c.req.query('modulo');
    const accion = c.req.query('accion');
    const usuarioId = c.req.query('usuarioId');
    const fechaInicio = c.req.query('fechaInicio');
    const fechaFin = c.req.query('fechaFin');

    // Construir query base
    let query = supabase
      .from('logs_auditoria')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (modulo && modulo !== 'TODOS') {
      query = query.eq('modulo', modulo);
    }
    if (accion && accion !== 'TODAS') {
      query = query.eq('accion', accion);
    }
    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }
    if (fechaInicio) {
      query = query.gte('fecha', new Date(fechaInicio + 'T00:00:00.000Z').toISOString());
    }
    if (fechaFin) {
      query = query.lte('fecha', new Date(fechaFin + 'T23:59:59.999Z').toISOString());
    }

    // Ordenar por fecha descendente
    query = query.order('fecha', { ascending: false });

    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error al listar logs de auditoría:', error);
      return c.json({ error: `Error al listar logs: ${error.message}` }, 500);
    }

    return c.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error en endpoint de listar logs:', error);
    return c.json({ error: `Error al listar logs: ${error.message}` }, 500);
  }
});

/**
 * ENDPOINT: GET /logs-auditoria/estadisticas
 * Descripción: Obtiene estadísticas de los logs de auditoría
 * Query params: fechaInicio, fechaFin
 */
app.get('/logs-auditoria/estadisticas', async (c) => {
  try {
    const fechaInicio = c.req.query('fechaInicio');
    const fechaFin = c.req.query('fechaFin');

    // Construir query base
    let query = supabase
      .from('logs_auditoria')
      .select('*');

    // Aplicar filtros de fecha
    if (fechaInicio) {
      query = query.gte('fecha', new Date(fechaInicio + 'T00:00:00.000Z').toISOString());
    }
    if (fechaFin) {
      query = query.lte('fecha', new Date(fechaFin + 'T23:59:59.999Z').toISOString());
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error al obtener logs para estadísticas:', error);
      return c.json({ error: `Error al obtener estadísticas: ${error.message}` }, 500);
    }

    // Calcular estadísticas
    const totalAcciones = logs?.length || 0;
    const accionesPorTipo: Record<string, number> = {};
    const accionesPorModulo: Record<string, number> = {};
    const accionesPorUsuario: Record<string, number> = {};
    const accionesPorDia: Record<string, number> = {};

    logs?.forEach((log: any) => {
      // Por tipo de acción
      accionesPorTipo[log.accion] = (accionesPorTipo[log.accion] || 0) + 1;
      
      // Por módulo
      accionesPorModulo[log.modulo] = (accionesPorModulo[log.modulo] || 0) + 1;
      
      // Por usuario
      const usuarioKey = log.usuario_nombre || log.usuario_id;
      accionesPorUsuario[usuarioKey] = (accionesPorUsuario[usuarioKey] || 0) + 1;
      
      // Por día
      const fecha = new Date(log.fecha).toISOString().split('T')[0];
      accionesPorDia[fecha] = (accionesPorDia[fecha] || 0) + 1;
    });

    return c.json({
      estadisticas: {
        totalAcciones,
        accionesPorTipo: Object.entries(accionesPorTipo).map(([tipo, cantidad]) => ({
          tipo,
          cantidad
        })),
        accionesPorModulo: Object.entries(accionesPorModulo).map(([modulo, cantidad]) => ({
          modulo,
          cantidad
        })),
        accionesPorUsuario: Object.entries(accionesPorUsuario).map(([usuario, cantidad]) => ({
          usuario,
          cantidad
        })),
        accionesPorDia: Object.entries(accionesPorDia)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([fecha, cantidad]) => ({
            fecha,
            cantidad
          }))
      }
    });
  } catch (error) {
    console.error('Error al generar estadísticas de logs:', error);
    return c.json({ error: `Error al generar estadísticas: ${error.message}` }, 500);
  }
});

// ==================== ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN) ====================

// Endpoint público para listar libros (para vista pública del catálogo)
app.get('/public/libros', async (c) => {
  try {
    const libros = await kv.getByPrefix('libro:');
    const prestamos = await kv.getByPrefix('prestamo:');
    
    // Normalizar libros: SIEMPRE recalcular copias disponibles dinámicamente
    const librosNormalizados = libros.map((libro: any) => {
      // Usar copiasTotal como única fuente de verdad
      const copiasTotal = libro.copiasTotal ?? 1;
      
      // Contar préstamos activos de este libro
      const prestamosActivos = prestamos.filter((p: any) => 
        p.libroId === libro.id && !p.devuelto && p.activo !== false
      );
      
      const copiasDisponibles = Math.max(0, copiasTotal - prestamosActivos.length);
      
      return {
        id: libro.id,
        titulo: libro.nombre,
        autor: libro.autor,
        isbn: libro.id,
        editorial: libro.editorial || null,
        anio_publicacion: libro.anioPublicacion || null,
        descripcion: libro.descripcion || null,
        copias_disponibles: copiasDisponibles,
        copias_totales: copiasTotal,
        imagen_portada: libro.imagenUrl,
        categoria: libro.genero ? { id: libro.genero, nombre: libro.genero } : null
      };
    });
    
    // Solo mostrar libros NO eliminados en la vista pública
    const librosFiltrados = librosNormalizados.filter((libro: any) => {
      const libroOriginal = libros.find((l: any) => l.id === libro.isbn);
      return libroOriginal && !libroOriginal.eliminado;
    });
    
    return c.json({ success: true, data: librosFiltrados });
  } catch (error) {
    console.error('Error al listar libros públicos:', error);
    return c.json({ error: `Error al obtener libros: ${error.message}` }, 500);
  }
});

// Endpoint público para listar categorías (para vista pública del catálogo)
app.get('/public/categorias', async (c) => {
  try {
    const categorias = await kv.getByPrefix('categoria:');
    
    // Solo mostrar categorías NO eliminadas en la vista pública
    const categoriasFiltradas = categorias
      .filter((cat: any) => !cat.eliminado)
      .map((cat: any) => ({
        id: cat.id,
        nombre: cat.nombre,
        descripcion: cat.descripcion || ''
      }));
    
    return c.json({ success: true, data: categoriasFiltradas });
  } catch (error) {
    console.error('Error al listar categorías públicas:', error);
    return c.json({ error: `Error al obtener categorías: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
