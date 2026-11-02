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
- Administración de proyectos con inicio de sesión y cuenta autorizada
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
El CRUD local sigue disponible para practicar sin autenticación. En Vercel, cualquier visitante puede consultar los proyectos publicados; las operaciones de creación, edición y eliminación exigen un JWT válido de Neon Auth, un email verificado y coincidencia con `ADMIN_EMAIL`. Los borradores solo se devuelven a esa cuenta. CORS y los controles visuales del frontend no sustituyen esta autorización del servidor.

## Publicación
GitHub Pages continúa alojando el frontend estático. Vercel aloja únicamente la API Express con la carpeta `backend` como raíz del proyecto; Neon aloja PostgreSQL.

1. Crear la base en Neon y ejecutar `backend/db/schema.sql` en el SQL Editor.
2. Desplegar el proyecto en Vercel seleccionando `backend` como Root Directory.
3. Configurar `DATABASE_URL`, `FRONTEND_ORIGIN` (`https://lulo-specter.github.io`), `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL` y `ADMIN_EMAIL` en Environment Variables de Vercel. `DATABASE_URL` es secreto; las URLs de Auth/JWKS y el email administrador no son contraseñas.
4. Copiar el dominio asignado por Vercel a `window.PORTFOLIO_API_URL` en `js/api-config.js`.
5. Desde la raíz del repositorio, ejecutar `npm.cmd install` y `npm.cmd run build:auth` para generar `js/auth-client.bundle.js`; luego publicar los cambios del frontend en GitHub Pages.

En la rama de Neon, Neon Auth debe tener habilitada la verificación de email con códigos OTP y debe confiar en el origen `https://lulo-specter.github.io`. La página permite crear la cuenta administradora con un código enviado al correo y luego iniciar/cerrar sesión. El backend verifica los JWT con el JWKS de esa rama. La API solo permite solicitudes de navegador desde los orígenes configurados.

Para entender el funcionamiento archivo por archivo y preparar la defensa, consultar `EXPLICACION_BACKEND_FRONTEND.txt`.

## Enlaces
- Sitio publicado: https://lulo-specter.github.io/portfolio-luciano-lopez/
- GitHub: https://github.com/Lulo-specter
- LinkedIn: https://www.linkedin.com/in/luciano-lopez-b90b642a1/
