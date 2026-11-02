// Pool reutilizable de conexiones al PostgreSQL de Neon.
const { Pool } = require('@neondatabase/serverless');

// Falla de manera explicita si el entorno no tiene configurado el secreto de conexion.
if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Configurala en backend/.env o en el panel de Vercel.');
}

// La URL se inyecta por entorno; los limites reducen conexiones y esperas innecesarias.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
