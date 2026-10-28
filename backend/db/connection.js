const { Pool } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Configurala en backend/.env o en el panel de Vercel.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
