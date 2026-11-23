'use strict';

/* ============================================================
   1. AÑO DEL PIE DE PÁGINA
   ============================================================ */
const yearElement = document.getElementById('anio');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ============================================================
   2. TEMA CLARO / OSCURO
   El tema inicial se aplica en un script dentro de index.html.
   Aquí se actualiza el botón, se guarda la elección y se
   escucha el cambio de tema del sistema si no hay elección.
   ============================================================ */
const themeToggle = document.querySelector('.theme-toggle');
const themeText = themeToggle ? themeToggle.querySelector('.theme-toggle__text') : null;
const themeRoot = document.documentElement;
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme, save) {
  const isDark = theme === 'oscuro';

  themeRoot.setAttribute('data-tema', isDark ? 'oscuro' : 'claro');

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }

  if (themeText) {
    themeText.textContent = isDark ? 'Claro' : 'Oscuro';
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', isDark ? '#1A1022' : '#F3DFEF');
  }

  if (save) {
    try {
      localStorage.setItem('tema', isDark ? 'oscuro' : 'claro');
    } catch (error) {
      // Si el navegador bloquea localStorage, el tema sigue funcionando en esta visita.
    }
  }
}

applyTheme(themeRoot.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro', false);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = themeRoot.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro';
    applyTheme(current === 'oscuro' ? 'claro' : 'oscuro', true);
  });
}

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

if (typeof systemTheme.addEventListener === 'function') {
  systemTheme.addEventListener('change', (event) => {
    let saved = null;

    try {
      saved = localStorage.getItem('tema');
    } catch (error) {
      // Sin acceso a localStorage se usa el tema del sistema.
    }

    if (!saved) {
      applyTheme(event.matches ? 'oscuro' : 'claro', false);
    }
  });
}

/* ============================================================
   3. MENÚ DE NAVEGACIÓN EN MÓVIL
   ============================================================ */
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('menu-principal');
const menuText = menuToggle ? menuToggle.querySelector('.menu-toggle__text') : null;

function openMenu() {
  nav.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Cerrar menú');
  if (menuText) menuText.textContent = 'Cerrar';
}

function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  if (menuText) menuText.textContent = 'Menú';
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Al pulsar un enlace del menú, se cierra solo.
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con la tecla Escape.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Cerrar al pulsar fuera de la cabecera.
  document.addEventListener('click', (event) => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';

    if (isOpen && !event.target.closest('.site-header')) {
      closeMenu();
    }
  });

  // Si la pantalla pasa a escritorio, el menú móvil vuelve a su estado cerrado.
  const desktopQuery = window.matchMedia('(min-width: 820px)');

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) {
        closeMenu();
      }
    });
  }
}

/* ============================================================
   4. MODAL DE VIDEO
   El iframe se crea al abrir y se elimina al cerrar, así el
   video no se carga hasta que el usuario lo pide.
   ============================================================ */
const modal = document.getElementById('modal-proyecto');
const modalTitle = document.getElementById('modal-titulo');
const modalVideo = document.getElementById('modal-video');
const modalClose = modal ? modal.querySelector('.modal__close') : null;

let lastFocusedElement = null;

function openModal(link, videoUrl) {
  const title = link.dataset.title || 'Video del proyecto';

  lastFocusedElement = link;
  modalTitle.textContent = title;
  modalVideo.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.src = videoUrl;
  iframe.title = title;
  iframe.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  );
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

  modalVideo.appendChild(iframe);
  modal.showModal();
  document.body.classList.add('modal-abierto');
}

function closeModal() {
  if (modal.open) {
    modal.close();
  }
}

if (modal && modalTitle && modalVideo && modalClose) {
  document.querySelectorAll('[data-video]').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Si se pulsa con Ctrl, Cmd, Shift o Alt, se deja abrir el enlace normal.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const videoUrl = link.dataset.video;

      if (!videoUrl) {
        return;
      }

      event.preventDefault();
      openModal(link, videoUrl);
    });
  });

  modalClose.addEventListener('click', closeModal);

  // Cerrar al hacer clic en el fondo oscuro (fuera de la ventana).
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Al cerrarse (con el botón, el fondo o la tecla Escape),
  // se elimina el video y se devuelve el foco al proyecto.
  modal.addEventListener('close', () => {
    modalVideo.innerHTML = '';
    document.body.classList.remove('modal-abierto');

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  });
}

/* ============================================================
   5. AVISO DEL FORMULARIO DE EJEMPLO
   Si todavía no has conectado Formspree, el formulario no envía
   nada y muestra un aviso. Al sustituir REEMPLAZA_TU_ID por tu
   identificador real, el formulario funcionará con normalidad.
   ============================================================ */
const contactForm = document.querySelector('.contact-form');
const formStatus = document.getElementById('form-estado');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    const endpoint = contactForm.getAttribute('action') || '';

    if (endpoint.includes('REEMPLAZA_TU_ID')) {
      event.preventDefault();
      formStatus.textContent =
        'Formulario de ejemplo: todavía falta conectar el servicio de envío (Formspree).';
      formStatus.classList.add('form-status--error');
    }
  });
}

/* ============================================================
   6. FIN
   ============================================================ */
