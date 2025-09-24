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

  // ✅ Lógica de login
  function handleLogin() {
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;

        if (username) {
          localStorage.setItem("currentUser", username);
          window.location.href = "definicion.html";
        } else {
          alert("Por favor, ingresa tu usuario.");
        }
      });
    }
  }

  // ✅ Lógica de logout (¡aquí estaba el error!)
  function handleLogout() {
    // Por ahora solo es un placeholder para evitar el ReferenceError
    console.log("Logout ejecutado (placeholder)");
  }

  // ✅ Inicializar módulos según la página
  function initialize() {
    if (loginForm) {
      modules.background?.init(); // Fondo solo en login
      handleLogin();
    } else {
      // Dashboard
      modules.background?.init();
      modules.effects?.init();
      modules.content?.set("definition");
      modules.nav?.init();
      modules.auth?.init();
      modules.modal?.init();

      handleLogout(); // ✅ Ya no lanzará error
    }
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
