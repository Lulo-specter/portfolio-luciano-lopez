const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('menu');
const formContacto = document.getElementById('formContacto');
const contador = document.getElementById('contador');
const mensaje = document.getElementById('mensaje');
const respuesta = document.getElementById('respuesta');
const listaProyectos = document.getElementById('listaProyectos');
const formProyecto = document.getElementById('formProyecto');
const estadoFormularioProyecto = document.getElementById('estadoFormularioProyecto');
const apiBaseUrl = (window.PORTFOLIO_API_URL || '').replace(/\/+$/, '');
const authClient = window.portfolioAuth;
const panelAutenticacion = document.getElementById('panelAutenticacion');
const formularioAutenticacion = document.getElementById('formAutenticacion');
const formularioVerificacionEmail = document.getElementById('formVerificacionEmail');
const mensajeAutenticacion = document.getElementById('mensajeAutenticacion');
const crudProyectos = document.getElementById('crudProyectos');
let emailPendienteVerificacion = '';
let modoRegistro = false;

if (apiBaseUrl) {
  window.portfolioAdminAuthenticated = false;
  panelAutenticacion.hidden = false;
  crudProyectos.hidden = true;
}

function mostrarMensajeProyectos(mensaje) {
  if (listaProyectos) {
    listaProyectos.replaceChildren();
    const parrafo = document.createElement('p');
    parrafo.setAttribute('role', 'status');
    parrafo.textContent = mensaje;
    listaProyectos.append(parrafo);
  }
}

async function solicitarApi(url, opciones = {}) {
  const headers = {
    ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
    ...opciones.headers,
  };

  if (apiBaseUrl && window.portfolioAdminAuthenticated) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      throw new Error(error?.message || 'No se pudo obtener el token de administrador.');
    }

    headers.Authorization = `Bearer ${data.token}`;
  }

  const response = await fetch(`${apiBaseUrl}${url}`, {
    ...opciones,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const datos = await response.json();
  if (!response.ok) {
    throw new Error(datos.error || 'La solicitud no pudo completarse.');
  }

  return datos;
}

function crearTarjetaProyecto(proyecto) {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'card';

  if (proyecto.imagenUrl) {
    const imagen = document.createElement('img');
    imagen.src = proyecto.imagenUrl;
    imagen.alt = `Imagen representativa de ${proyecto.nombre}`;
    imagen.loading = 'lazy';
    imagen.className = 'proyecto-imagen';
    tarjeta.append(imagen);
  }

  const titulo = document.createElement('h3');
  titulo.textContent = proyecto.nombre;
  tarjeta.append(titulo);

  const descripcion = document.createElement('p');
  descripcion.textContent = proyecto.descripcion;
  tarjeta.append(descripcion);

  const tecnologias = document.createElement('p');
  const etiquetaTecnologias = document.createElement('strong');
  etiquetaTecnologias.textContent = 'Tecnologías: ';
  tecnologias.append(etiquetaTecnologias, document.createTextNode(proyecto.tecnologias.join(', ') || 'Sin tecnologías'));
  tarjeta.append(tecnologias);

  const estado = document.createElement('p');
  estado.className = `estado-proyecto estado-${proyecto.estadoPublicacion}`;
  estado.textContent = proyecto.estadoPublicacion === 'publicado' ? 'Publicado' : 'Borrador';
  tarjeta.append(estado);

  if (proyecto.enlaceUrl) {
    const enlace = document.createElement('a');
    enlace.className = 'enlace-proyecto';
    enlace.href = proyecto.enlaceUrl;
    enlace.target = '_blank';
    enlace.rel = 'noopener noreferrer';
    enlace.textContent = 'Ver proyecto';
    tarjeta.append(enlace);
  }

  const acciones = document.createElement('div');
  acciones.className = 'acciones-proyecto';

  const botonEditar = document.createElement('button');
  botonEditar.type = 'button';
  botonEditar.className = 'btn btn-secundario';
  botonEditar.dataset.accion = 'editar';
  botonEditar.dataset.id = proyecto.id;
  botonEditar.textContent = 'Editar';

  const botonEliminar = document.createElement('button');
  botonEliminar.type = 'button';
  botonEliminar.className = 'btn btn-secundario';
  botonEliminar.dataset.accion = 'eliminar';
  botonEliminar.dataset.id = proyecto.id;
  botonEliminar.textContent = 'Eliminar';

  acciones.append(botonEditar, botonEliminar);
  acciones.hidden = apiBaseUrl && !window.portfolioAdminAuthenticated;
  tarjeta.append(acciones);
  return tarjeta;
}

async function cargarProyectos() {
  if (!listaProyectos) {
    return;
  }

  try {
    const proyectos = await solicitarApi('/api/proyectos');
    listaProyectos.replaceChildren();

    if (proyectos.length === 0) {
      mostrarMensajeProyectos('Todavía no hay proyectos registrados.');
      return;
    }

    proyectos.forEach((proyecto) => {
      listaProyectos.append(crearTarjetaProyecto(proyecto));
    });
  } catch (error) {
    console.error('No se pudieron cargar los proyectos:', error);
    mostrarMensajeProyectos('No se pudieron cargar los proyectos. Comprobá que el backend esté iniciado y volvé a intentar.');
  }
}

function prepararEdicion(proyecto) {
  document.getElementById('proyectoId').value = proyecto.id;
  document.getElementById('proyectoNombre').value = proyecto.nombre;
  document.getElementById('proyectoDescripcion').value = proyecto.descripcion;
  document.getElementById('proyectoTecnologias').value = proyecto.tecnologias.join(', ');
  document.getElementById('proyectoImagen').value = proyecto.imagenUrl || '';
  document.getElementById('proyectoEnlace').value = proyecto.enlaceUrl || '';
  document.getElementById('proyectoEstado').value = proyecto.estadoPublicacion;
  document.getElementById('cancelarEdicion').hidden = false;
  document.querySelector('.gestion-proyectos').open = true;
  document.getElementById('proyectoNombre').focus();
  estadoFormularioProyecto.textContent = `Editando: ${proyecto.nombre}`;
}

function limpiarFormularioProyecto() {
  formProyecto.reset();
  document.getElementById('proyectoId').value = '';
  document.getElementById('proyectoEstado').value = 'publicado';
  document.getElementById('cancelarEdicion').hidden = true;
  estadoFormularioProyecto.textContent = '';
}

function actualizarInterfazSesion(usuario, esAdministrador) {
  const sesionActiva = Boolean(usuario);

  window.portfolioAdminAuthenticated = esAdministrador;
  formularioAutenticacion.hidden = sesionActiva;
  formularioVerificacionEmail.hidden = true;
  document.getElementById('sesionAdministrador').hidden = !sesionActiva;
  document.getElementById('emailSesionAdministrador').textContent = usuario?.email || '';
  crudProyectos.hidden = Boolean(apiBaseUrl) && !esAdministrador;

  if (sesionActiva && !esAdministrador) {
    mensajeAutenticacion.textContent = 'Esta cuenta no tiene permisos de administración.';
  }

  document.querySelectorAll('.acciones-proyecto').forEach((acciones) => {
    acciones.hidden = Boolean(apiBaseUrl) && !esAdministrador;
  });

  if (!sesionActiva) {
    formularioAutenticacion.hidden = false;
    modoRegistro = false;
    document.getElementById('campoNombreAdministrador').hidden = true;
    document.getElementById('nombreAdministrador').required = false;
    document.getElementById('passwordAdministrador').autocomplete = 'current-password';
    document.getElementById('enviarAutenticacion').textContent = 'Iniciar sesión';
    document.getElementById('cambiarModoAutenticacion').textContent = 'Crear cuenta de administrador';
  }
}

async function establecerSesion(usuario) {
  const esAdministrador = typeof usuario?.email === 'string'
    && usuario.email.trim().toLowerCase() === window.PORTFOLIO_ADMIN_EMAIL.toLowerCase()
    && usuario.emailVerified === true;

  if (esAdministrador) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      throw new Error(error?.message || 'No se pudo obtener el token de administrador.');
    }
  }

  actualizarInterfazSesion(usuario, esAdministrador);
  await cargarProyectos();
}

function mostrarErrorAutenticacion(error) {
  console.error('Error de autenticación:', error);
  mensajeAutenticacion.textContent = error.message || 'No se pudo completar la autenticación.';
}

if (apiBaseUrl && authClient) {
  formularioAutenticacion.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensajeAutenticacion.textContent = '';

    const email = document.getElementById('emailAdministrador').value.trim();
    const password = document.getElementById('passwordAdministrador').value;

    try {
      if (modoRegistro) {
        if (email.toLowerCase() !== window.PORTFOLIO_ADMIN_EMAIL.toLowerCase()) {
          throw new Error('El registro está limitado a la cuenta administradora autorizada.');
        }

        const nombre = document.getElementById('nombreAdministrador').value.trim();
        const { error } = await authClient.signUp.email({ email, password, name: nombre });
        if (error) {
          throw new Error(error.message);
        }

        emailPendienteVerificacion = email;
        formularioAutenticacion.hidden = true;
        formularioVerificacionEmail.hidden = false;
        mensajeAutenticacion.textContent = 'Te enviamos un código. Revisá tu correo para verificar la cuenta.';
        document.getElementById('codigoVerificacionEmail').focus();
        return;
      }

      const { data, error } = await authClient.signIn.email({ email, password, rememberMe: true });
      if (error) {
        throw new Error(error.message);
      }

      await establecerSesion(data?.user);
    } catch (error) {
      mostrarErrorAutenticacion(error);
    }
  });

  document.getElementById('cambiarModoAutenticacion').addEventListener('click', () => {
    modoRegistro = !modoRegistro;
    const campoNombre = document.getElementById('campoNombreAdministrador');
    const nombre = document.getElementById('nombreAdministrador');
    const password = document.getElementById('passwordAdministrador');

    campoNombre.hidden = !modoRegistro;
    nombre.required = modoRegistro;
    password.autocomplete = modoRegistro ? 'new-password' : 'current-password';
    document.getElementById('enviarAutenticacion').textContent = modoRegistro
      ? 'Crear cuenta'
      : 'Iniciar sesión';
    document.getElementById('cambiarModoAutenticacion').textContent = modoRegistro
      ? 'Ya tengo una cuenta'
      : 'Crear cuenta de administrador';
    mensajeAutenticacion.textContent = '';
  });

  formularioVerificacionEmail.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensajeAutenticacion.textContent = '';

    try {
      const otp = document.getElementById('codigoVerificacionEmail').value.trim();
      const { error } = await authClient.emailOtp.verifyEmail({
        email: emailPendienteVerificacion,
        otp,
      });
      if (error) {
        throw new Error(error.message);
      }

      mensajeAutenticacion.textContent = 'Email verificado.';
      const { data, error: errorSesion } = await authClient.getSession();
      if (errorSesion) {
        throw new Error(errorSesion.message);
      }

      const usuario = data?.user || data?.session?.user;
      if (usuario) {
        await establecerSesion(usuario);
      } else {
        formularioVerificacionEmail.hidden = true;
        formularioAutenticacion.hidden = false;
        document.getElementById('emailAdministrador').value = emailPendienteVerificacion;
        modoRegistro = false;
        document.getElementById('campoNombreAdministrador').hidden = true;
        document.getElementById('nombreAdministrador').required = false;
        document.getElementById('passwordAdministrador').autocomplete = 'current-password';
        document.getElementById('enviarAutenticacion').textContent = 'Iniciar sesión';
        document.getElementById('cambiarModoAutenticacion').textContent = 'Crear cuenta de administrador';
        mensajeAutenticacion.textContent = 'Ya podés iniciar sesión con tu cuenta verificada.';
      }
    } catch (error) {
      mostrarErrorAutenticacion(error);
    }
  });

  document.getElementById('reenviarCodigoVerificacion').addEventListener('click', async () => {
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: emailPendienteVerificacion,
        type: 'email-verification',
      });
      if (error) {
        throw new Error(error.message);
      }

      mensajeAutenticacion.textContent = 'Enviamos otro código de verificación.';
    } catch (error) {
      mostrarErrorAutenticacion(error);
    }
  });

  document.getElementById('cancelarVerificacionEmail').addEventListener('click', () => {
    formularioVerificacionEmail.hidden = true;
    formularioAutenticacion.hidden = false;
    mensajeAutenticacion.textContent = '';
  });

  document.getElementById('cerrarSesionAdministrador').addEventListener('click', async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw new Error(error.message);
      }

      actualizarInterfazSesion(null, false);
      limpiarFormularioProyecto();
      mensajeAutenticacion.textContent = 'Sesión cerrada.';
      await cargarProyectos();
    } catch (error) {
      mostrarErrorAutenticacion(error);
    }
  });

  authClient.getSession().then(async ({ data, error }) => {
    if (error) {
      throw new Error(error.message);
    }

    const usuario = data?.user || data?.session?.user;
    if (usuario) {
      await establecerSesion(usuario);
    }
  }).catch(mostrarErrorAutenticacion);
} else if (apiBaseUrl) {
  mensajeAutenticacion.textContent = 'No se cargó el cliente de autenticación. Volvé a generar el bundle.';
}

if (listaProyectos) {
  listaProyectos.addEventListener('click', async (event) => {
    const boton = event.target.closest('button[data-accion]');
    if (!boton) {
      return;
    }

    const id = Number(boton.dataset.id);
    try {
      if (boton.dataset.accion === 'editar') {
        const proyecto = await solicitarApi(`/api/proyectos/${id}`);
        prepararEdicion(proyecto);
      } else if (boton.dataset.accion === 'eliminar') {
        const confirmar = window.confirm('¿Seguro que querés eliminar este proyecto? Esta acción no se puede deshacer.');
        if (confirmar) {
          await solicitarApi(`/api/proyectos/${id}`, { method: 'DELETE' });
          await cargarProyectos();
          estadoFormularioProyecto.textContent = 'Proyecto eliminado.';
        }
      }
    } catch (error) {
      estadoFormularioProyecto.textContent = error.message;
    }
  });
}

if (formProyecto) {
  formProyecto.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = document.getElementById('proyectoId').value;
    const proyecto = {
      nombre: document.getElementById('proyectoNombre').value,
      descripcion: document.getElementById('proyectoDescripcion').value,
      tecnologias: document.getElementById('proyectoTecnologias').value
        .split(',')
        .map((tecnologia) => tecnologia.trim())
        .filter(Boolean),
      imagenUrl: document.getElementById('proyectoImagen').value,
      enlaceUrl: document.getElementById('proyectoEnlace').value,
      estadoPublicacion: document.getElementById('proyectoEstado').value,
    };

    try {
      await solicitarApi(id ? `/api/proyectos/${id}` : '/api/proyectos', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(proyecto),
      });

      limpiarFormularioProyecto();
      estadoFormularioProyecto.textContent = id ? 'Proyecto actualizado.' : 'Proyecto creado.';
      await cargarProyectos();
    } catch (error) {
      estadoFormularioProyecto.textContent = error.message;
    }
  });
}

document.getElementById('cancelarEdicion')?.addEventListener('click', limpiarFormularioProyecto);

if (listaProyectos) {
  cargarProyectos();
}

if (btnMenu && menu) {
  const cerrarMenu = () => {
    menu.classList.remove('menu-visible');
    btnMenu.setAttribute('aria-expanded', 'false');
    btnMenu.setAttribute('aria-label', 'Abrir menú');
  };

  btnMenu.addEventListener('click', () => {
    const abierto = menu.classList.toggle('menu-visible');
    btnMenu.setAttribute('aria-expanded', String(abierto));
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', cerrarMenu);
  });

  document.addEventListener('click', (event) => {
    const nav = btnMenu.closest('.nav');
    if (!nav || nav.contains(event.target)) {
      return;
    }

    cerrarMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      cerrarMenu();
    }
  });
}

if (mensaje && contador) {
  mensaje.addEventListener('input', () => {
    contador.textContent = mensaje.value.length;
  });
}

if (formContacto) {
  formContacto.addEventListener('submit', (event) => {
    const nombre = document.getElementById('nombre');
    const email = document.getElementById('email');
    const mensajeInput = document.getElementById('mensaje');

    const errorNombre = document.getElementById('errorNombre');
    const errorEmail = document.getElementById('errorEmail');
    const errorMensaje = document.getElementById('errorMensaje');

    let valido = true;

    if (!nombre || nombre.value.trim().length < 2) {
      errorNombre.textContent = 'Ingresá un nombre válido.';
      valido = false;
    } else {
      errorNombre.textContent = '';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.value.trim())) {
      errorEmail.textContent = 'Ingresá un email válido.';
      valido = false;
    } else {
      errorEmail.textContent = '';
    }

    if (!mensajeInput || mensajeInput.value.trim().length < 10) {
      errorMensaje.textContent = 'El mensaje debe tener al menos 10 caracteres.';
      valido = false;
    } else {
      errorMensaje.textContent = '';
    }

    if (!valido) {
      event.preventDefault();

      if (respuesta) {
        respuesta.textContent = '';
        respuesta.classList.remove('visible');
      }
    }
  });
}
