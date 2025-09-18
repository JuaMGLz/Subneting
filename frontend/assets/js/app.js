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
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("username").value;
            

            if (username) {
                localStorage.setItem("currentUser", username);
                window.location.href = "definicion.html";
            }
        });
    }
}

  // Lógica de logout
function handleLogin() {
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("username").value;
            // La línea de la contraseña ya no es necesaria
            // const password = document.getElementById("password").value;

            // Solo se valida que el campo de usuario no esté vacío
            if (username) {
                localStorage.setItem("currentUser", username);
                window.location.href = "definicion.html";
            } else {
                alert("Por favor, ingresa tu usuario.");
            }
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
