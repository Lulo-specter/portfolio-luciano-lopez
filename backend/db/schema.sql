PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS proyectos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL CHECK (length(trim(nombre)) > 0),
    descripcion TEXT NOT NULL CHECK (length(trim(descripcion)) > 0),
    imagen_url TEXT CHECK (imagen_url IS NULL OR length(trim(imagen_url)) > 0),
    enlace_url TEXT CHECK (enlace_url IS NULL OR length(trim(enlace_url)) > 0),
    estado_publicacion TEXT NOT NULL DEFAULT 'borrador'
        CHECK (estado_publicacion IN ('borrador', 'publicado')),
    CHECK (imagen_url IS NOT NULL OR enlace_url IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS tecnologias (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE CHECK (length(trim(nombre)) > 0)
);

CREATE TABLE IF NOT EXISTS proyecto_tecnologia (
    proyecto_id INTEGER NOT NULL
        REFERENCES proyectos (id) ON DELETE CASCADE,
    tecnologia_id INTEGER NOT NULL
        REFERENCES tecnologias (id) ON DELETE CASCADE,
    PRIMARY KEY (proyecto_id, tecnologia_id)
);

CREATE INDEX IF NOT EXISTS idx_proyectos_estado_publicacion
    ON proyectos (estado_publicacion);
