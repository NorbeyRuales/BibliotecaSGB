require('dotenv').config();
const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;

if (!SUPABASE_URL || !SERVICE_ROLE || !PROJECT_REF) {
  console.error('Faltan variables en .env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_REF)');
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth create failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data;
}

async function upsertKV(client, key, valueObj) {
  const sql = `INSERT INTO kv_store_bebfd31a(key, value) VALUES($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  await client.query(sql, [key, JSON.stringify(valueObj)]);
}

async function main() {
  try {
    console.log('Creando usuario admin en Auth...');
    const auth = await createAuthUser();
    const userId = auth.id || auth.user?.id || auth.user_id || auth;
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
