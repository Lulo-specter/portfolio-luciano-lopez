const express = require('express');
const path = require('node:path');
const db = require('./db/connection');
const inicializarDatos = require('./db/seed');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const raizPortfolio = path.resolve(__dirname, '..');
const apiSoloLectura = process.env.VERCEL === '1' || process.env.READ_ONLY_API === 'true';
const origenesPermitidos = new Set([
  'https://lulo-specter.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean));
let baseLista;

function asegurarBaseLista() {
  if (!baseLista) {
    baseLista = inicializarDatos(db);
  }

  return baseLista;
}

app.use((req, res, next) => {
  const origen = req.get('Origin');

  if (origen && !origenesPermitidos.has(origen)) {
    return res.status(403).json({ error: 'Origen no permitido.' });
  }

  if (origen) {
    res.set('Access-Control-Allow-Origin', origen);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: '20kb' }));

app.use('/api', (req, res, next) => {
  if (apiSoloLectura && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(403).json({ error: 'La API pública solo permite consultar proyectos.' });
  }

  return next();
});

app.get('/api/salud', async (req, res) => {
  await asegurarBaseLista();
  return res.json({ ok: true, mensaje: 'Backend funcionando' });
});

async function obtenerProyectos() {
  const soloPublicados = apiSoloLectura ? "WHERE p.estado_publicacion = 'publicado'" : '';
  const resultado = await db.query(`
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.imagen_url AS "imagenUrl",
      p.enlace_url AS "enlaceUrl",
      p.estado_publicacion AS "estadoPublicacion",
      t.nombre AS tecnologia
    FROM proyectos p
    LEFT JOIN proyecto_tecnologia pt ON pt.proyecto_id = p.id
    LEFT JOIN tecnologias t ON t.id = pt.tecnologia_id
    ${soloPublicados}
    ORDER BY p.id, t.nombre
  `);

  const proyectos = new Map();

  for (const fila of resultado.rows) {
    if (!proyectos.has(fila.id)) {
      proyectos.set(fila.id, {
        id: fila.id,
        nombre: fila.nombre,
        descripcion: fila.descripcion,
        imagenUrl: fila.imagenUrl,
        enlaceUrl: fila.enlaceUrl,
        estadoPublicacion: fila.estadoPublicacion,
        tecnologias: [],
      });
    }

    if (fila.tecnologia) {
      proyectos.get(fila.id).tecnologias.push(fila.tecnologia);
    }
  }

  return [...proyectos.values()];
}

function validarProyecto(entrada) {
  if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)) {
    return { error: 'El cuerpo de la solicitud debe ser un objeto JSON.' };
  }

  const nombre = typeof entrada.nombre === 'string' ? entrada.nombre.trim() : '';
  const descripcion = typeof entrada.descripcion === 'string'
    ? entrada.descripcion.trim()
    : '';
  const imagenUrl = typeof entrada.imagenUrl === 'string'
    ? entrada.imagenUrl.trim()
    : '';
  const enlaceUrl = typeof entrada.enlaceUrl === 'string'
    ? entrada.enlaceUrl.trim()
    : '';
  const estadoPublicacion = entrada.estadoPublicacion ?? 'borrador';

  if (!nombre || nombre.length > 120) {
    return { error: 'El nombre es obligatorio y no puede superar 120 caracteres.' };
  }

  if (!descripcion || descripcion.length > 2000) {
    return { error: 'La descripción es obligatoria y no puede superar 2000 caracteres.' };
  }

  if (!imagenUrl && !enlaceUrl) {
    return { error: 'Ingresá una imagen o un enlace representativo.' };
  }

  if (imagenUrl && !esImagenSegura(imagenUrl)) {
    return { error: 'La imagen debe ser una ruta local o una URL HTTP/HTTPS.' };
  }

  if (enlaceUrl && !esUrlWeb(enlaceUrl)) {
    return { error: 'El enlace debe comenzar con http:// o https://.' };
  }

  if (!Array.isArray(entrada.tecnologias) || entrada.tecnologias.length > 15) {
    return { error: 'Las tecnologías deben ser una lista de hasta 15 elementos.' };
  }

  const tecnologias = [];
  for (const tecnologia of entrada.tecnologias) {
    if (typeof tecnologia !== 'string' || !tecnologia.trim() || tecnologia.trim().length > 50) {
      return { error: 'Cada tecnología debe tener entre 1 y 50 caracteres.' };
    }

    const nombreTecnologia = tecnologia.trim();
    if (!tecnologias.some((existente) => existente.toLowerCase() === nombreTecnologia.toLowerCase())) {
      tecnologias.push(nombreTecnologia);
    }
  }

  if (!['borrador', 'publicado'].includes(estadoPublicacion)) {
    return { error: 'El estado debe ser borrador o publicado.' };
  }

  return {
    proyecto: {
      nombre,
      descripcion,
      imagenUrl: imagenUrl || null,
      enlaceUrl: enlaceUrl || null,
      estadoPublicacion,
      tecnologias,
    },
  };
}

function esUrlWeb(valor) {
  try {
    const url = new URL(valor);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function esImagenSegura(valor) {
  if (esUrlWeb(valor)) {
    return true;
  }

  return !valor.startsWith('//')
    && !valor.startsWith('\\\\')
    && !/^[a-z][a-z\d+.-]*:/i.test(valor)
    && !valor.split(/[\\/]/).includes('..');
}

async function guardarTecnologias(client, proyectoId, tecnologias) {
  for (const nombre of tecnologias) {
    await client.query(`
      INSERT INTO tecnologias (nombre)
      VALUES ($1)
      ON CONFLICT (nombre) DO NOTHING
    `, [nombre]);

    const tecnologia = await client.query(
      'SELECT id FROM tecnologias WHERE nombre = $1',
      [nombre],
    );

    await client.query(`
      INSERT INTO proyecto_tecnologia (proyecto_id, tecnologia_id)
      VALUES ($1, $2)
    `, [proyectoId, tecnologia.rows[0].id]);
  }
}

async function conTransaccion(operacion) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    const resultado = await operacion(client);
    await client.query('COMMIT');
    return resultado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

app.get('/api/proyectos', async (req, res) => {
  await asegurarBaseLista();
  return res.json(await obtenerProyectos());
});

app.get('/api/proyectos/:id', async (req, res) => {
  await asegurarBaseLista();
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  const proyecto = (await obtenerProyectos()).find((elemento) => elemento.id === id);
  if (!proyecto) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  return res.json(proyecto);
});

app.post('/api/proyectos', async (req, res) => {
  await asegurarBaseLista();
  const resultado = validarProyecto(req.body);
  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  const id = await conTransaccion(async (client) => {
    const insercion = await client.query(`
      INSERT INTO proyectos (
        nombre, descripcion, imagen_url, enlace_url, estado_publicacion
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      resultado.proyecto.nombre,
      resultado.proyecto.descripcion,
      resultado.proyecto.imagenUrl,
      resultado.proyecto.enlaceUrl,
      resultado.proyecto.estadoPublicacion,
    ]);

    await guardarTecnologias(client, insercion.rows[0].id, resultado.proyecto.tecnologias);
    return insercion.rows[0].id;
  });

  const creado = (await obtenerProyectos()).find((proyecto) => proyecto.id === id);
  return res.status(201).json(creado);
});

app.put('/api/proyectos/:id', async (req, res) => {
  await asegurarBaseLista();
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  const resultado = validarProyecto(req.body);
  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  const actualizacion = await conTransaccion(async (client) => {
    const existente = await client.query('SELECT id FROM proyectos WHERE id = $1', [id]);
    if (existente.rowCount === 0) {
      return null;
    }

    await client.query(`
      UPDATE proyectos
      SET nombre = $1,
          descripcion = $2,
          imagen_url = $3,
          enlace_url = $4,
          estado_publicacion = $5
      WHERE id = $6
    `, [
      resultado.proyecto.nombre,
      resultado.proyecto.descripcion,
      resultado.proyecto.imagenUrl,
      resultado.proyecto.enlaceUrl,
      resultado.proyecto.estadoPublicacion,
      id,
    ]);

    await client.query('DELETE FROM proyecto_tecnologia WHERE proyecto_id = $1', [id]);
    await guardarTecnologias(client, id, resultado.proyecto.tecnologias);
    return true;
  });

  if (!actualizacion) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  const actualizado = (await obtenerProyectos()).find((proyecto) => proyecto.id === id);
  return res.json(actualizado);
});

app.delete('/api/proyectos/:id', async (req, res) => {
  await asegurarBaseLista();
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  const resultado = await db.query('DELETE FROM proyectos WHERE id = $1', [id]);
  if (resultado.rowCount === 0) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  return res.status(204).end();
});

if (process.env.VERCEL !== '1') {
  app.use('/css', express.static(path.join(raizPortfolio, 'css')));
  app.use('/js', express.static(path.join(raizPortfolio, 'js')));
  app.use('/img', express.static(path.join(raizPortfolio, 'img')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(raizPortfolio, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ ok: true, mensaje: 'API del portfolio' });
  });
}

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'La ruta de la API no existe.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo enviado no contiene JSON válido.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la solicitud supera el tamaño permitido.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Portfolio disponible en http://localhost:${PORT}`);
  });
}

module.exports = app;
