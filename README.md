# Portfolio de Luciano López

Portfolio personal desarrollado con HTML, CSS, JavaScript, Node.js, Express, PostgreSQL y TypeScript para presentar mi perfil y gestionar proyectos con persistencia.

## Descripción
Este proyecto fue desarrollado como actividad integradora de la Unidad 3. Tiene como objetivo presentar mi perfil académico y profesional, mostrar mis proyectos, habilidades y tecnologías, así como facilitar el contacto a través de un formulario.

## Tecnologías utilizadas
- HTML, CSS y JavaScript para el frontend
- Node.js y Express para la API
- PostgreSQL en Neon para persistir los proyectos
- TypeScript para modelar y comprobar los tipos de los proyectos
- Git y GitHub

## Funcionalidades principales
- Sección de inicio con presentación personal
- Sección sobre mí
- Sección de proyectos cargada desde PostgreSQL
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
1. Crear un proyecto en Neon y ejecutar `backend/db/schema.sql` una vez en su SQL Editor.
2. Abrir una terminal en la carpeta `backend` e instalar dependencias con `npm.cmd install` (en PowerShell de Windows).
3. Crear `backend/.env` a partir de `backend/.env.example` y configurar `DATABASE_URL` con la URL de conexión agrupada (pooled) de Neon. No subir `.env` a Git.
4. Iniciar el servidor con `npm.cmd start` y abrir `http://localhost:3000`. El servidor sirve el frontend y la API.
5. Desde `backend`, ejecutar `npm.cmd run build` para comprobar los tipos TypeScript antes de publicar.

La API carga VitalHome, C&M y el proyecto del gimnasio si la tabla de proyectos de Neon está vacía. La inicialización usa una transacción para evitar inserciones parciales. `node_modules`, los archivos `.env` y cualquier base SQLite antigua están excluidos por `.gitignore`.

## API de proyectos
- `GET /api/proyectos`: lista los proyectos y sus tecnologías.
- `GET /api/proyectos/:id`: consulta un proyecto por identificador.
- `POST /api/proyectos`: crea un proyecto.
- `PUT /api/proyectos/:id`: reemplaza los datos de un proyecto existente.
- `DELETE /api/proyectos/:id`: elimina un proyecto.
- `GET /api/salud`: confirma que el backend está activo.

El cuerpo de creación y actualización es JSON, con `nombre`, `descripcion`, `tecnologias` (array de textos), `imagenUrl`, `enlaceUrl` y `estadoPublicacion`. Se debe incluir al menos una imagen o un enlace.

## Base de datos
Se eligió PostgreSQL, una base relacional alojada en Neon. `proyectos` y `tecnologias` se relacionan muchos a muchos mediante `proyecto_tecnologia`, lo que permite que varios proyectos compartan tecnologías y que cada proyecto tenga varias tecnologías. La URL de conexión se configura como secreto y no se escribe en el frontend ni se sube al repositorio.

## Alcance de seguridad
El CRUD de esta actividad es una demostración educativa local y no tiene autenticación. En Vercel la API se ejecuta en modo de solo lectura y solo permite consultar proyectos publicados; las escrituras y eliminaciones se rechazan en el servidor. El formulario de gestión sigue disponible al ejecutar localmente el backend.

## Publicación
GitHub Pages continúa alojando el frontend estático. Vercel aloja únicamente la API Express con la carpeta `backend` como raíz del proyecto; Neon aloja PostgreSQL.

1. Crear la base en Neon y ejecutar `backend/db/schema.sql` en el SQL Editor.
2. Desplegar el proyecto en Vercel seleccionando `backend` como Root Directory.
3. Configurar `DATABASE_URL` y `FRONTEND_ORIGIN` (`https://lulo-specter.github.io`) en Environment Variables de Vercel. No publicar ni compartir `DATABASE_URL`.
4. Copiar el dominio asignado por Vercel a `window.PORTFOLIO_API_URL` en `js/api-config.js`.
5. Publicar los cambios del frontend en GitHub Pages.

La API permite solicitudes de navegador desde los orígenes configurados. En Vercel, además, rechaza en el servidor POST, PUT, PATCH y DELETE; los proyectos publicados se pueden consultar públicamente. El frontend alojado oculta los controles de gestión; el CRUD sigue disponible localmente.

Para entender el funcionamiento archivo por archivo y preparar la defensa, consultar `EXPLICACION_BACKEND_FRONTEND.txt`.

## Enlaces
- Sitio publicado: https://lulo-specter.github.io/portfolio-luciano-lopez/
- GitHub: https://github.com/Lulo-specter
- LinkedIn: https://www.linkedin.com/in/luciano-lopez-b90b642a1/
