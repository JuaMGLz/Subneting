// assets/js/app.js

(function () {
  // Referencia a los módulos de tu aplicación
  const modules = {
    background: window.NetApp?.background,
    effects: window.NetApp?.effects,
    content: window.NetApp?.content,
    nav: window.NetApp?.nav,
    auth: window.NetApp?.auth,
    modal: window.NetApp?.modal,
  };

  // Referencia al formulario de login
  const loginForm = document.getElementById("loginForm");

  // Lógica de autenticación
  function handleLogin() {
    if (loginForm) {
      // Escucha el evento de envío del formulario
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Validación simple: que los campos no estén vacíos
        if (username && password) {
          // Guarda el nombre de usuario para su uso en otras páginas
          localStorage.setItem("currentUser", username);

          // Redirige al usuario al dashboard principal
          window.location.href = "definicion.html";
        } else {
          alert("Por favor, completa todos los campos.");
        }
      });
    }
  }

  // Lógica de logout
  function handleLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      });
    }
  }

  // Lógica de inicialización al cargar la página
  function initialize() {
    // Si estás en la página de login, maneja el login
    if (loginForm) {
      modules.background?.init(); // Solo inicializa el fondo en la página de login
      handleLogin();
    }
    // Si estás en alguna página del dashboard (como definicion.html)
    else {
      // Inicializa todos los demás módulos de la aplicación
      modules.background?.init();
      modules.effects?.init();
      modules.content?.set("definition"); // Carga el contenido de definición por defecto
      modules.nav?.init();
      modules.auth?.init();
      modules.modal?.init();
      handleLogout();
    }
  }

  // Ejecuta la inicialización cuando el DOM esté completamente cargado
  document.addEventListener("DOMContentLoaded", initialize);
})();
