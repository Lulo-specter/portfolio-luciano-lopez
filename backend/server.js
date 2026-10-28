const express = require('express');
const path = require('node:path');
const db = require('./db/connection');
const inicializarDatos = require('./db/seed');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const raizPortfolio = path.resolve(__dirname, '..');

inicializarDatos(db);

app.use(express.json({ limit: '20kb' }));

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'Backend funcionando' });
});

function obtenerProyectos() {
  const filas = db.prepare(`
    SELECT
      p.id,
      p.nombre,
      p.descripcion,
      p.imagen_url AS imagenUrl,
      p.enlace_url AS enlaceUrl,
      p.estado_publicacion AS estadoPublicacion,
      t.nombre AS tecnologia
    FROM proyectos p
    LEFT JOIN proyecto_tecnologia pt ON pt.proyecto_id = p.id
    LEFT JOIN tecnologias t ON t.id = pt.tecnologia_id
    ORDER BY p.id, t.nombre
  `).all();

  const proyectos = new Map();

  for (const fila of filas) {
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

function guardarTecnologias(proyectoId, tecnologias) {
  const insertarTecnologia = db.prepare(`
    INSERT INTO tecnologias (nombre)
    VALUES (?)
    ON CONFLICT(nombre) DO NOTHING
  `);
  const obtenerTecnologia = db.prepare('SELECT id FROM tecnologias WHERE nombre = ?');
  const asociarTecnologia = db.prepare(`
    INSERT INTO proyecto_tecnologia (proyecto_id, tecnologia_id)
    VALUES (?, ?)
  `);

  for (const nombre of tecnologias) {
    insertarTecnologia.run(nombre);
    const tecnologia = obtenerTecnologia.get(nombre);
    asociarTecnologia.run(proyectoId, tecnologia.id);
  }
}

app.get('/api/proyectos', (req, res) => {
  res.json(obtenerProyectos());
});

app.get('/api/proyectos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  const proyecto = obtenerProyectos().find((elemento) => elemento.id === id);
  if (!proyecto) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  return res.json(proyecto);
});

app.post('/api/proyectos', (req, res) => {
  const resultado = validarProyecto(req.body);
  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  const crearProyecto = db.transaction((proyecto) => {
    const resultadoInsercion = db.prepare(`
      INSERT INTO proyectos (
        nombre, descripcion, imagen_url, enlace_url, estado_publicacion
      )
      VALUES (
        @nombre, @descripcion, @imagenUrl, @enlaceUrl, @estadoPublicacion
      )
    `).run(proyecto);

    guardarTecnologias(resultadoInsercion.lastInsertRowid, proyecto.tecnologias);
    return resultadoInsercion.lastInsertRowid;
  });

  const id = crearProyecto(resultado.proyecto);
  const creado = obtenerProyectos().find((proyecto) => proyecto.id === id);
  return res.status(201).json(creado);
});

app.put('/api/proyectos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  if (!db.prepare('SELECT id FROM proyectos WHERE id = ?').get(id)) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  const resultado = validarProyecto(req.body);
  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  const actualizarProyecto = db.transaction((proyecto) => {
    db.prepare(`
      UPDATE proyectos
      SET nombre = @nombre,
          descripcion = @descripcion,
          imagen_url = @imagenUrl,
          enlace_url = @enlaceUrl,
          estado_publicacion = @estadoPublicacion
      WHERE id = @id
    `).run({ ...proyecto, id });

    db.prepare('DELETE FROM proyecto_tecnologia WHERE proyecto_id = ?').run(id);
    guardarTecnologias(id, proyecto.tecnologias);
  });

  actualizarProyecto(resultado.proyecto);
  const actualizado = obtenerProyectos().find((proyecto) => proyecto.id === id);
  return res.json(actualizado);
});

app.delete('/api/proyectos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'El identificador debe ser un número entero positivo.' });
  }

  const resultado = db.prepare('DELETE FROM proyectos WHERE id = ?').run(id);
  if (resultado.changes === 0) {
    return res.status(404).json({ error: 'No se encontró el proyecto.' });
  }

  return res.status(204).end();
});

app.use('/css', express.static(path.join(raizPortfolio, 'css')));
app.use('/js', express.static(path.join(raizPortfolio, 'js')));
app.use('/img', express.static(path.join(raizPortfolio, 'img')));

app.get('/', (req, res) => {
  res.sendFile(path.join(raizPortfolio, 'index.html'));
});

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

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Portfolio disponible en http://localhost:${PORT}`);
});