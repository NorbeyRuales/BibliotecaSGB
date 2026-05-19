require('dotenv').config();
const { Client } = require('pg');
const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE || !PROJECT_REF || !DB_PASSWORD || !ANON_KEY) {
  console.error('Faltan variables en .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD, SUPABASE_ANON_KEY');
  process.exit(1);
}

const baseUrl = SUPABASE_URL.replace(/\/$/, '');
const adminUsersUrl = `${baseUrl}/auth/v1/admin/users`;
const signInUrl = `${baseUrl}/auth/v1/token?grant_type=password`;

const host = `db.${PROJECT_REF}.supabase.co`;
const client = new Client({
  host,
  port: 5432,
  user: 'postgres',
  password: DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const adminHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${SERVICE_ROLE}`,
  apikey: SERVICE_ROLE
};

const anonHeaders = {
  'Content-Type': 'application/json',
  apikey: ANON_KEY
};

const upsertKV = async (key, valueObj) => {
  const sql = 'INSERT INTO kv_store_bebfd31a(key, value) VALUES($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value';
  await client.query(sql, [key, JSON.stringify(valueObj)]);
};

const decodeJwtSub = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(json).sub;
  } catch (err) {
    return null;
  }
};

const loginAndGetUserId = async (email, password) => {
  try {
    const res = await fetch(signInUrl, {
      method: 'POST',
      headers: anonHeaders,
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.user?.id) return data.user.id;
    if (data?.access_token) return decodeJwtSub(data.access_token);
    return null;
  } catch (err) {
    return null;
  }
};

const createOrGetAuthUser = async ({ email, password, user_metadata }) => {
  const res = await fetch(adminUsersUrl, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata })
  });

  if (res.ok) {
    const data = await res.json();
    return data?.id || data?.user?.id || data?.user_id || null;
  }

  const fallbackId = await loginAndGetUserId(email, password);
  if (fallbackId) return fallbackId;

  const text = await res.text();
  console.warn(`No se pudo crear usuario ${email}: ${res.status} ${text}`);
  return null;
};

const seedClientes = async () => {
  const clientes = [
    { email: 'cliente1@biblioteca.com', password: 'cliente123', identificacion: '1000000001', nombre: 'Cliente', apellido: 'Uno', fechaNacimiento: '1995-01-01' },
    { email: 'cliente2@biblioteca.com', password: 'cliente123', identificacion: '1000000002', nombre: 'Cliente', apellido: 'Dos', fechaNacimiento: '1994-02-02' },
    { email: 'cliente3@biblioteca.com', password: 'cliente123', identificacion: '1000000003', nombre: 'Cliente', apellido: 'Tres', fechaNacimiento: '1993-03-03' },
    { email: 'cliente4@biblioteca.com', password: 'cliente123', identificacion: '1000000004', nombre: 'Cliente', apellido: 'Cuatro', fechaNacimiento: '1992-04-04' },
    { email: 'cliente5@biblioteca.com', password: 'cliente123', identificacion: '1000000005', nombre: 'Cliente', apellido: 'Cinco', fechaNacimiento: '1991-05-05' }
  ];

  const created = [];

  for (const c of clientes) {
    const userId = await createOrGetAuthUser({
      email: c.email,
      password: c.password,
      user_metadata: {
        identificacion: c.identificacion,
        nombre: c.nombre,
        apellido: c.apellido,
        fechaNacimiento: c.fechaNacimiento,
        role: 'cliente'
      }
    });

    if (!userId) {
      console.warn(`Cliente omitido (sin user id): ${c.email}`);
      continue;
    }

    const clienteData = {
      id: userId,
      email: c.email,
      identificacion: c.identificacion,
      nombre: c.nombre,
      apellido: c.apellido,
      fechaNacimiento: c.fechaNacimiento,
      role: 'cliente',
      bloqueado: false,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await upsertKV(`user:${userId}`, clienteData);
    await upsertKV(`cliente:${c.identificacion}`, clienteData);
    created.push(clienteData);
  }

  return created;
};

const seedCategorias = async () => {
  const existing = await client.query("SELECT value FROM kv_store_bebfd31a WHERE key LIKE 'categoria:%'");
  const existingNames = new Set((existing.rows || []).map((r) => (r.value?.nombre || '').toLowerCase()));

  const categorias = [
    { nombre: 'Ficcion', descripcion: 'Novelas y relatos de ficcion.' },
    { nombre: 'Ciencia', descripcion: 'Libros cientificos y divulgativos.' },
    { nombre: 'Historia', descripcion: 'Historia y biografias.' },
    { nombre: 'Tecnologia', descripcion: 'Tecnologia e informatica.' },
    { nombre: 'Arte', descripcion: 'Arte, pintura y diseno.' }
  ];

  let created = 0;

  for (const cat of categorias) {
    if (existingNames.has(cat.nombre.toLowerCase())) continue;
    const categoriaId = crypto.randomUUID();
    const categoriaData = {
      id: categoriaId,
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      eliminado: false,
      createdAt: new Date().toISOString()
    };
    await upsertKV(`categoria:${categoriaId}`, categoriaData);
    created += 1;
  }

  return created;
};

const seedLibros = async () => {
  const libros = [
    { id: 'LIB-001', nombre: 'Introduccion a Programacion', autor: 'A. Torres', genero: 'Tecnologia', numPaginas: 320, copiasTotal: 3, editorial: 'TecnoPress', anioPublicacion: 2021, descripcion: 'Fundamentos de programacion.' },
    { id: 'LIB-002', nombre: 'Historia Universal', autor: 'M. Rivera', genero: 'Historia', numPaginas: 410, copiasTotal: 2, editorial: 'Historia Viva', anioPublicacion: 2018, descripcion: 'Recorrido historico.' },
    { id: 'LIB-003', nombre: 'Fisica Basica', autor: 'C. Gomez', genero: 'Ciencia', numPaginas: 280, copiasTotal: 4, editorial: 'Ciencia Hoy', anioPublicacion: 2019, descripcion: 'Conceptos esenciales de fisica.' },
    { id: 'LIB-004', nombre: 'Arte y Diseno', autor: 'L. Santos', genero: 'Arte', numPaginas: 190, copiasTotal: 2, editorial: 'ArtePlus', anioPublicacion: 2020, descripcion: 'Panorama del arte moderno.' },
    { id: 'LIB-005', nombre: 'Novelas Cortas', autor: 'R. Perez', genero: 'Ficcion', numPaginas: 220, copiasTotal: 5, editorial: 'Lectura Libre', anioPublicacion: 2017, descripcion: 'Coleccion de relatos.' },
    { id: 'LIB-006', nombre: 'Redes y Sistemas', autor: 'J. Mora', genero: 'Tecnologia', numPaginas: 360, copiasTotal: 3, editorial: 'TecnoPress', anioPublicacion: 2022, descripcion: 'Introduccion a redes.' },
    { id: 'LIB-007', nombre: 'Biologia General', autor: 'V. Diaz', genero: 'Ciencia', numPaginas: 300, copiasTotal: 2, editorial: 'Ciencia Hoy', anioPublicacion: 2016, descripcion: 'Principios de biologia.' },
    { id: 'LIB-008', nombre: 'Historia de America', autor: 'S. Lopez', genero: 'Historia', numPaginas: 260, copiasTotal: 3, editorial: 'Historia Viva', anioPublicacion: 2015, descripcion: 'Procesos historicos de America.' },
    { id: 'LIB-009', nombre: 'Diseno Grafico', autor: 'P. Velez', genero: 'Arte', numPaginas: 210, copiasTotal: 2, editorial: 'ArtePlus', anioPublicacion: 2023, descripcion: 'Conceptos de diseno grafico.' },
    { id: 'LIB-010', nombre: 'Cuentos Clasicos', autor: 'E. Silva', genero: 'Ficcion', numPaginas: 240, copiasTotal: 4, editorial: 'Lectura Libre', anioPublicacion: 2014, descripcion: 'Cuentos tradicionales.' }
  ];

  const libroMap = new Map();

  for (const l of libros) {
    const libroData = {
      id: l.id,
      nombre: l.nombre,
      genero: l.genero,
      numPaginas: l.numPaginas,
      copiasTotal: l.copiasTotal,
      copiasDisponibles: l.copiasTotal,
      autor: l.autor,
      imagenUrl: null,
      editorial: l.editorial,
      anioPublicacion: l.anioPublicacion,
      descripcion: l.descripcion,
      disponible: true,
      eliminado: false,
      createdAt: new Date().toISOString()
    };

    await upsertKV(`libro:${l.id}`, libroData);
    libroMap.set(l.id, libroData);
  }

  return libroMap;
};

const seedPrestamos = async (clientes, libroMap) => {
  if (clientes.length === 0) return [];

  const prestamos = [];
  const libros = Array.from(libroMap.values());

  for (let i = 0; i < Math.min(3, libros.length, clientes.length); i++) {
    const cliente = clientes[i];
    const libro = libros[i];
    const prestamoId = crypto.randomUUID();
    const fechaInicio = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
    const fechaFin = new Date(fechaInicio.getTime() + 14 * 24 * 60 * 60 * 1000);

    const recibo = {
      numero: `REC-${Date.now()}-${i + 1}`,
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
      clienteIdentificacion: cliente.identificacion,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
      libroId: libro.id,
      libroNombre: libro.nombre,
      fechaPrestamo: fechaInicio.toISOString(),
      fechaVencimiento: fechaFin.toISOString(),
      fechaDevolucion: null,
      devuelto: false,
      estado: 'activo',
      activo: true,
      recibo,
      createdAt: fechaInicio.toISOString()
    };

    await upsertKV(`prestamo:${prestamoId}`, prestamoData);
    prestamos.push(prestamoData);

    const updatedLibro = {
      ...libro,
      copiasDisponibles: Math.max(0, (libro.copiasDisponibles ?? libro.copiasTotal ?? 1) - 1),
      disponible: true
    };

    await upsertKV(`libro:${libro.id}`, updatedLibro);
    libroMap.set(libro.id, updatedLibro);
  }

  return prestamos;
};

const seedMultas = async (clientes) => {
  const multas = [];

  for (let i = 0; i < Math.min(2, clientes.length); i++) {
    const cliente = clientes[i];
    const multaId = crypto.randomUUID();
    const multaData = {
      id: multaId,
      clienteIdentificacion: cliente.identificacion,
      clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
      monto: 5 + i * 2,
      razon: 'Retraso en devolucion',
      activa: true,
      activo: true,
      fechaCreacion: new Date().toISOString(),
      fechaPago: null
    };

    await upsertKV(`multa:${multaId}`, multaData);
    multas.push(multaData);
  }

  return multas;
};

const main = async () => {
  try {
    await client.connect();
    console.log('Conectado a Postgres en', host);

    const categoriasCreadas = await seedCategorias();
    console.log(`Categorias creadas: ${categoriasCreadas}`);

    const clientes = await seedClientes();
    console.log(`Clientes creados: ${clientes.length}`);

    const libroMap = await seedLibros();
    console.log(`Libros creados: ${libroMap.size}`);

    const prestamos = await seedPrestamos(clientes, libroMap);
    console.log(`Prestamos creados: ${prestamos.length}`);

    const multas = await seedMultas(clientes);
    console.log(`Multas creadas: ${multas.length}`);

    console.log('Seed completado.');
  } catch (err) {
    console.error('Error en seed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

main();
