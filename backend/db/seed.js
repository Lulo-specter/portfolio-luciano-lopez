async function inicializarDatos(db) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1, $2)', [74192, 1]);

    const cantidad = await client.query('SELECT COUNT(*) AS total FROM proyectos');
    if (Number(cantidad.rows[0].total) > 0) {
      await client.query('COMMIT');
      return;
    }

    const proyectosIniciales = [
      {
        nombre: 'VitalHome',
        descripcion: 'Aplicación móvil de domótica para adultos mayores con funciones de monitoreo, alertas y accesibilidad. Fue desarrollada en Android con Java, con foco en la usabilidad y la seguridad del usuario.',
        imagenUrl: 'img/vitalhome.jpeg',
        enlaceUrl: null,
        tecnologias: ['Java', 'Android', 'UX y accesibilidad'],
      },
      {
        nombre: 'Sistema de gestión para C&M',
        descripcion: 'Sistema para registrar los kilos de yerba sin procesar, desarrollado como trabajo final de Programación Orientada a Objetos.',
        imagenUrl: 'img/yerbateraC_M.jpg',
        enlaceUrl: null,
        tecnologias: ['Java'],
      },
      {
        nombre: 'Sistema de gestión para gimnasio',
        descripcion: 'Aplicación web para registrar profesores y alumnos por turno, controlar el ingreso con DNI y avisar el estado de la cuota por WhatsApp. Pensada para usarse desde una tablet y desde celulares.',
        imagenUrl: 'img/gimnasio.svg',
        enlaceUrl: null,
        tecnologias: ['PHP', 'HTML', 'CSS', 'JavaScript'],
      },
    ];

    for (const proyecto of proyectosIniciales) {
      const insercion = await client.query(`
        INSERT INTO proyectos (
          nombre, descripcion, imagen_url, enlace_url, estado_publicacion
        )
        VALUES ($1, $2, $3, $4, 'publicado')
        RETURNING id
      `, [
        proyecto.nombre,
        proyecto.descripcion,
        proyecto.imagenUrl,
        proyecto.enlaceUrl,
      ]);

      for (const nombre of proyecto.tecnologias) {
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
        `, [insercion.rows[0].id, tecnologia.rows[0].id]);
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = inicializarDatos;
