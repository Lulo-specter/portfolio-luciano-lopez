function inicializarDatos(db) {
  const cantidad = db.prepare('SELECT COUNT(*) AS total FROM proyectos').get().total;
  if (cantidad > 0) {
    return;
  }

  const insertarProyecto = db.prepare(`
    INSERT INTO proyectos (
      nombre, descripcion, imagen_url, enlace_url, estado_publicacion
    )
    VALUES (
      @nombre, @descripcion, @imagenUrl, @enlaceUrl, 'publicado'
    )
  `);
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

  const cargarDatos = db.transaction(() => {
    for (const proyecto of proyectosIniciales) {
      const insercion = insertarProyecto.run(proyecto);

      for (const nombre of proyecto.tecnologias) {
        insertarTecnologia.run(nombre);
        const tecnologia = obtenerTecnologia.get(nombre);
        asociarTecnologia.run(insercion.lastInsertRowid, tecnologia.id);
      }
    }
  });

  cargarDatos();
}

module.exports = inicializarDatos;
