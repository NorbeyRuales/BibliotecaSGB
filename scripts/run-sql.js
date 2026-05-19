const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const projectRef = process.env.SUPABASE_PROJECT_REF;
const password = process.env.SUPABASE_DB_PASSWORD;
const host = `db.${projectRef}.supabase.co`;
const database = 'postgres';
const user = 'postgres';

if (!projectRef || !password) {
  console.error('Faltan variables en .env: SUPABASE_PROJECT_REF y/o SUPABASE_DB_PASSWORD');
  process.exit(1);
}

const client = new Client({
  host,
  port: 5432,
  user,
  password,
  database,
  ssl: { rejectUnauthorized: false }
});

async function runFile(filePath) {
  let sql = fs.readFileSync(filePath, 'utf8');
  // Remove psql meta-commands (lines starting with backslash) which cause syntax errors
  sql = sql
    .split(/\r?\n/)
    .filter(l => !l.trim().startsWith('\\'))
    .join('\n');
  console.log(`\n--- Ejecutando: ${filePath}`);
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`OK: ${path.basename(filePath)}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`ERROR al ejecutar ${filePath}:`, err.message || err);
    throw err;
  }
}

async function main() {
  try {
    await client.connect();
    console.log('Conectado a Postgres en', host);

    const base = path.join(__dirname, '..', 'src', 'supabase');
    const files = [
      path.join(base, 'crear-kv-store.sql'),
      path.join(base, 'setup.sql'),
      path.join(base, 'migration-logs-auditoria-v2.sql')
    ];

    for (const f of files) {
      if (fs.existsSync(f)) {
        await runFile(f);
      } else {
        console.warn('No existe, se omite:', f);
      }
    }

    console.log('\nTodos los scripts procesados.');
  } catch (err) {
    console.error('Proceso terminado con errores.');
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
