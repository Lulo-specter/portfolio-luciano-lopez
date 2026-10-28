# Portfolio de Luciano López

Portfolio personal desarrollado con HTML, CSS, JavaScript, Node.js, Express, SQLite y TypeScript para presentar mi perfil y gestionar proyectos con persistencia.

## Descripción
Este proyecto fue desarrollado como actividad integradora de la Unidad 3. Tiene como objetivo presentar mi perfil académico y profesional, mostrar mis proyectos, habilidades y tecnologías, así como facilitar el contacto a través de un formulario.

## Tecnologías utilizadas
- HTML, CSS y JavaScript para el frontend
- Node.js y Express para la API
- SQLite con better-sqlite3 para persistir los proyectos
- TypeScript para modelar y comprobar los tipos de los proyectos
- Git y GitHub

## Funcionalidades principales
- Sección de inicio con presentación personal
- Sección sobre mí
- Sección de proyectos cargada desde SQLite
- API con operaciones CRUD para proyectos
- Formulario sencillo para crear, editar y eliminar proyectos
- Formulario de contacto conectado a Formspree, con validación de campos
- Menú responsive
- Contador de caracteres del mensaje

## Proyectos
- VitalHome: aplicación para Android desarrollada en Java.
- C&M: sistema de gestión para registrar kilos de yerba sin procesar, desarrollado en Java.

## Requisitos
- Node.js 22 o superior
- npm

## Instalación y ejecución local
1. Abrir una terminal en la carpeta `backend`.
2. Instalar dependencias con `npm.cmd install` (en PowerShell de Windows).
3. Iniciar el servidor con `npm.cmd start`.
4. Abrir `http://localhost:3000` en el navegador. El servidor sirve el frontend y la API.
5. En otra terminal, ejecutar `npm.cmd run typecheck` para comprobar los tipos TypeScript.

La base de datos se crea en `backend/db/portfolio.sqlite` al iniciar el servidor. El schema se ejecuta automáticamente y se cargan VitalHome y C&M solo cuando la tabla de proyectos está vacía. La base local y `node_modules` están excluidos por `.gitignore`.

## API de proyectos
- `GET /api/proyectos`: lista los proyectos y sus tecnologías.
- `GET /api/proyectos/:id`: consulta un proyecto por identificador.
- `POST /api/proyectos`: crea un proyecto.
- `PUT /api/proyectos/:id`: reemplaza los datos de un proyecto existente.
- `DELETE /api/proyectos/:id`: elimina un proyecto.
- `GET /api/salud`: confirma que el backend está activo.

El cuerpo de creación y actualización es JSON, con `nombre`, `descripcion`, `tecnologias` (array de textos), `imagenUrl`, `enlaceUrl` y `estadoPublicacion`. Se debe incluir al menos una imagen o un enlace.

## Base de datos
Se eligió SQLite, una base relacional ligera que guarda los datos en un archivo. `proyectos` y `tecnologias` se relacionan muchos a muchos mediante `proyecto_tecnologia`, lo que permite que varios proyectos compartan tecnologías y que cada proyecto tenga varias tecnologías.

## Alcance de seguridad
El CRUD de esta actividad es una demostración educativa local y no tiene autenticación. No se debe exponer directamente a Internet ni desplegar la página con gestión habilitada sin agregar autenticación, autorización y controles adicionales.

Para entender el funcionamiento archivo por archivo y preparar la defensa, consultar `EXPLICACION_BACKEND_FRONTEND.txt`.

## Enlaces
- Sitio publicado: https://lulo-specter.github.io/portfolio-luciano-lopez/
- GitHub: https://github.com/Lulo-specter
- LinkedIn: https://www.linkedin.com/in/luciano-lopez-b90b642a1/
