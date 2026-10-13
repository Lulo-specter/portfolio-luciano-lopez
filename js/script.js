const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('menu');
const btnTema = document.getElementById('btnTema');
const filtros = document.querySelectorAll('.filtro');
const tarjetas = document.querySelectorAll('.card');
const formContacto = document.getElementById('formContacto');
const contador = document.getElementById('contador');
const mensaje = document.getElementById('mensaje');
const respuesta = document.getElementById('respuesta');

if (btnMenu && menu) {
  btnMenu.addEventListener('click', () => {
    const abierto = menu.classList.toggle('menu-visible');
    btnMenu.setAttribute('aria-expanded', String(abierto));
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
}

if (btnTema) {
  btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const oscuro = document.body.classList.contains('dark-theme');
    btnTema.textContent = oscuro ? '☀' : '☾';
    btnTema.setAttribute('aria-pressed', String(oscuro));
  });
}

filtros.forEach((filtro) => {
  filtro.addEventListener('click', () => {
    const categoria = filtro.dataset.filtro;

    filtros.forEach((btn) => btn.classList.remove('activo'));
    filtro.classList.add('activo');

    tarjetas.forEach((tarjeta) => {
      const categoriaTarjeta = tarjeta.dataset.categoria;
      const mostrar = categoria === 'todos' || categoriaTarjeta === categoria;
      tarjeta.style.display = mostrar ? 'block' : 'none';
    });
  });
});

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
