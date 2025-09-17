// Navbar global: inserta el menú superior en la página y maneja dropdowns + activo + logout.
(function () {
  function ready(fn) {
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);
  }

  ready(() => {
    const username =
      (window.NetAuth &&
        typeof window.NetAuth.getUsername === "function" &&
        window.NetAuth.getUsername()) ||
      sessionStorage.getItem("ns_user") ||
      localStorage.getItem("ns_user") ||
      "Usuario";

    const navHtml = `
    <nav class="navbar" id="globalNav">
      <div class="navbar-content">
        <div class="logo" aria-label="NetSegment Pro">🌐 NetSegment Pro</div>

        <div class="nav-menu" role="menubar">
          <div class="nav-item" role="none">
            <a class="nav-link" href="definicion.html" role="menuitem" data-route="definicion">Definición</a>
          </div>

          <div class="nav-item" role="none">
            <button class="nav-link" data-dropdown="concepts" aria-expanded="false" aria-controls="conceptsDropdown" role="menuitem">
              Conceptos <span class="caret">▼</span>
            </button>
            <div class="dropdown" id="conceptsDropdown" hidden>
              <a class="dropdown-item" href="tipos_segmentacion.html">Tipos de Segmentación</a>
              <a class="dropdown-item" href="beneficios.html">Beneficios</a>
              <a class="dropdown-item" href="implementacion.html">Implementación</a>
            </div>
          </div>

          <div class="nav-item" role="none">
            <button class="nav-link" data-dropdown="tools" aria-expanded="false" aria-controls="toolsDropdown" role="menuitem">
              Herramientas <span class="caret">▼</span>
            </button>
            <div class="dropdown" id="toolsDropdown" hidden>
              <a class="dropdown-item" href="calculadora.html">Calculadora</a>
              <a class="dropdown-item" href="monitoreo.html">Monitoreo</a>
              <a class="dropdown-item" href="analisis.html">Análisis</a>
              <a class="dropdown-item" href="reportes.html">Reportes</a>
            </div>
          </div>
        </div>

        <div class="user-menu">
          <span id="welcomeUser" class="welcome">Bienvenido, ${username}</span>
          <button id="logoutBtn" class="logout-btn" type="button">Salir</button>
        </div>
      </div>
    </nav>`;

    // Montaje: antes del contenido dentro de .dashboard (o al inicio del body si no existe)
    const host = document.querySelector(".dashboard") || document.body;
    host.insertAdjacentHTML("afterbegin", navHtml);

    const navEl = document.getElementById("globalNav");

    // ---------- Dropdowns ----------
    function toggle(dropId) {
      const dd = navEl.querySelector("#" + dropId + "Dropdown");
      // cerrar otros
      navEl.querySelectorAll(".dropdown").forEach((d) => {
        if (d !== dd) {
          d.classList.remove("show");
          d.hidden = true;
        }
      });
      const btn = navEl.querySelector(`[data-dropdown="${dropId}"]`);
      const isOpen = dd.classList.toggle("show");
      dd.hidden = !isOpen;
      btn.setAttribute("aria-expanded", String(isOpen));
    }
    navEl.querySelectorAll("[data-dropdown]").forEach((btn) => {
      btn.addEventListener("click", () => toggle(btn.dataset.dropdown));
    });
    document.addEventListener("click", (e) => {
      if (!navEl.contains(e.target)) {
        navEl.querySelectorAll(".dropdown").forEach((d) => {
          d.classList.remove("show");
          d.hidden = true;
        });
        navEl
          .querySelectorAll("[data-dropdown]")
          .forEach((b) => b.setAttribute("aria-expanded", "false"));
      }
    });

    // ---------- Activo según URL ----------
    const current = (
      location.pathname.split("/").pop() || "definicion.html"
    ).toLowerCase();
    const activeLink = navEl.querySelector(`a[href="${current}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      activeLink.setAttribute("aria-current", "page");
      const parentDD = activeLink.closest(".dropdown");
      if (parentDD) {
        const parentBtn = navEl.querySelector(
          `[aria-controls="${parentDD.id}"]`
        );
        parentBtn && parentBtn.classList.add("active");
      }
    }

    // ---------- Logout ----------
    navEl.querySelector("#logoutBtn").addEventListener("click", () => {
      if (window.NetAuth && typeof window.NetAuth.logout === "function") {
        window.NetAuth.logout();
        return;
      }
      sessionStorage.removeItem("ns_user");
      localStorage.removeItem("ns_user");
      location.href = "index.html"; // ajusta si tu login vive en otra ruta
    });
  });
})();
