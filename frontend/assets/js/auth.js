// assets/js/auth.js
(function () {
  const loginForm = document.getElementById("loginForm");
  const loginPage = document.getElementById("loginPage");
  const dashboardPage = document.getElementById("dashboardPage");
  const welcomeUser = document.getElementById("welcomeUser");
  const logoutBtn = document.getElementById("logoutBtn");

  // Función para mostrar el dashboard y establecer el nombre de usuario
  function showDashboard(username) {
    // Guarda el nombre de usuario en el almacenamiento local para persistencia
    localStorage.setItem("currentUser", username);

    if (welcomeUser)
      welcomeUser.textContent = `Bienvenido, ${username || "Usuario"}`;
    if (loginPage) loginPage.hidden = true;
    if (dashboardPage) dashboardPage.hidden = false;

    // Cargar por defecto "Definición" en el main
    if (
      window.NetApp &&
      NetApp.content &&
      typeof NetApp.content.set === "function"
    ) {
      NetApp.content.set("definition");
    }

    // Accesibilidad: foco al contenedor principal
    const main = document.getElementById("mainContent");
    if (main) main.focus();
  }

  // Manejar el envío del formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username =
        (document.getElementById("username") || {}).value || "Usuario";
      const password = (document.getElementById("password") || {}).value || "";

      // Validación mínima (simulada)
      if (username && password) {
        showDashboard(username);
      } else {
        alert("Por favor, completa todos los campos.");
      }
    });
  }

  // Manejar el cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Elimina el nombre de usuario del almacenamiento local
      localStorage.removeItem("currentUser");

      // Regresa a login
      if (loginPage) loginPage.hidden = false;
      if (dashboardPage) dashboardPage.hidden = true;

      const u = document.getElementById("username");
      const p = document.getElementById("password");
      if (u) u.value = "";
      if (p) p.value = "";
    });
  }

  // Recuperación de contraseña (demo)
  const recover = document.getElementById("recoverPass");
  if (recover) {
    recover.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Función de recuperación de contraseña (demo).");
    });
  }

  // Función de inicialización para verificar la sesión al cargar la página
  function init() {
    const storedUser = localStorage.getItem("currentUser");
    // Si hay un usuario guardado, muestra el dashboard directamente
    if (storedUser) {
      if (loginPage) loginPage.hidden = true;
      if (dashboardPage) dashboardPage.hidden = false;
      if (welcomeUser) welcomeUser.textContent = `Bienvenido, ${storedUser}`;
    }
  }

  // Expone la función init para que pueda ser llamada desde app.js
  window.NetApp = window.NetApp || {};
  NetApp.auth = {
    init,
  };
})();
