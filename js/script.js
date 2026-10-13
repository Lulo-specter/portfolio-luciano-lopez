const btnMenu = document.getElementById('btnMenu');
const menu = document.getElementById('menu');
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

    if (!valido || !formContacto.hasAttribute('action')) {
      event.preventDefault();

      if (respuesta) {
        respuesta.textContent = valido
          ? 'El envío todavía no está conectado. Podés escribirme por LinkedIn mientras tanto.'
          : '';
        respuesta.classList.toggle('visible', valido);
      }
    }
  });
}
