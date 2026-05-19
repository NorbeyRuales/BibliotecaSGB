require('dotenv').config();
const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE || !PROJECT_REF || !SUPABASE_ANON_KEY) {
  console.error('Faltan variables en .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_REF, SUPABASE_ANON_KEY)');
  process.exit(1);
}

const adminEmail = 'admin@biblioteca.com';
const adminPassword = 'admin123';
const adminIdentificacion = '0000000000';

async function createAuthUser() {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users`;
  const body = {
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      identificacion: adminIdentificacion,
      nombre: 'Administrador',
      apellido: 'Sistema',
      fechaNacimiento: '1990-01-01',
      role: 'admin'
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE}`,
      apikey: SERVICE_ROLE
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    const data = await res.json();
    return { data, created: true };
  }

  const text = await res.text();
  if (res.status === 422 && text.includes('email_exists')) {
    return { data: null, created: false, reason: 'email_exists' };
  }

  throw new Error(`Auth create failed: ${res.status} ${text}`);
}

function decodeJwtSub(token) {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(json).sub;
  } catch (err) {
    return null;
  }
}

async function loginAndGetUserId() {
  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email: adminEmail, password: adminPassword })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user?.id || (data?.access_token ? decodeJwtSub(data.access_token) : null);
  } catch (err) {
    return null;
  }
}

async function upsertKV(client, key, valueObj) {
  const sql = `INSERT INTO kv_store_bebfd31a(key, value) VALUES($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  await client.query(sql, [key, JSON.stringify(valueObj)]);
}

async function main() {
  try {
    console.log('Creando usuario admin en Auth...');
    const authResult = await createAuthUser();
    let userId = authResult?.data?.id || authResult?.data?.user?.id || authResult?.data?.user_id || null;

    if (!userId && authResult && authResult.created === false) {
      userId = await loginAndGetUserId();
    }

    if (!userId) {
      throw new Error('No se pudo obtener el ID del usuario admin. Verifica credenciales y estado en Auth.');
    }
    console.log('Usuario creado:', userId);

    // Conectar a Postgres
    const host = `db.${PROJECT_REF}.supabase.co`;
    const client = new Client({
      host,
      port: 5432,
      user: 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      database: 'postgres',
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    const adminData = {
      id: userId,
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

    await upsertKV(client, `user:${userId}`, adminData);
    await upsertKV(client, `cliente:${adminIdentificacion}`, adminData);

    // Crear categorías por defecto
    const categoriasDefault = [
      { nombre: 'Ficción', descripcion: 'Novelas y relatos de ficción literaria' },
      { nombre: 'Ciencia', descripcion: 'Libros científicos y divulgativos' },
      { nombre: 'Historia', descripcion: 'Libros de historia y biografías' },
      { nombre: 'Tecnología', descripcion: 'Libros sobre tecnología e informática' },
      { nombre: 'Arte', descripcion: 'Libros sobre arte, pintura y diseño' }
    ];

    for (const cat of categoriasDefault) {
      const catId = require('crypto').randomUUID();
      const obj = { id: catId, nombre: cat.nombre, descripcion: cat.descripcion, eliminado: false, createdAt: new Date().toISOString() };
      await upsertKV(client, `categoria:${catId}`, obj);
    }

    console.log('Admin y categorías creados en kv_store.');
    await client.end();
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
}

main();
