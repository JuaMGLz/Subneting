(function () {
  let lastScrollTop = 0; // Almacenamos la posición anterior del scroll

  // Referencia a la barra de navegación
  const navbar = document.querySelector(".navbar");

  // Función para manejar el scroll
  window.addEventListener("scroll", function () {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Si el usuario hace scroll hacia abajo, ocultamos la navbar
    if (currentScroll > lastScrollTop && currentScroll > navbar.offsetHeight) {
      navbar.classList.add("hidden");
    } else {
      // Si hace scroll hacia arriba, mostramos la navbar
      navbar.classList.remove("hidden");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Para evitar que lastScrollTop sea negativo
  });
})();

/* Arreglo para las rutas del menú de navegación (activo y dropdowns) */
(function routeFix() {
  const path = location.pathname.replace(/\\/g, "/").toLowerCase();
  const inPages = /\/pages\/[^/]+\.html$/.test(path);
  const toRoot = inPages ? "../" : "./";
  const toPages = inPages ? "" : "pages/";

  // Definición (raíz)
  document
    .querySelectorAll('.nav-menu a.nav-link[href$="definicion.html"]')
    .forEach((a) => {
      a.setAttribute("href", toRoot + "definicion.html");
    });

  // Conceptos
  ["tipos_segmentacion", "beneficios", "implementacion"].forEach((name) => {
    document
      .querySelectorAll(`#conceptsDropdown a[href$="${name}.html"]`)
      .forEach((a) => {
        a.setAttribute("href", toPages + `${name}.html`);
      });
  });

  // Herramientas
  ["calculadora", "monitoreo", "analisis", "reportes"].forEach((name) => {
    document
      .querySelectorAll(`#toolsDropdown a[href$="${name}.html"]`)
      .forEach((a) => {
        a.setAttribute("href", toPages + `${name}.html`);
      });
  });

  // Logout -> index en raíz
  const logout = document.getElementById("logoutBtn");
  if (logout) {
    logout.addEventListener("click", () => {
      try {
        sessionStorage.removeItem("ns_user");
        localStorage.removeItem("ns_user");
      } catch {}
      location.href = toRoot + "index.html";
    });
  }
})();

/* Dropdowns */
(function () {
  // Toggle de dropdowns (Conceptos / Herramientas)
  document.querySelectorAll("[data-dropdown]").forEach((btn) => {
    const id = btn.getAttribute("data-dropdown");
    const dropdown = document.getElementById(id + "Dropdown");
    if (!dropdown) return;

    btn.addEventListener("click", () => {
      const isOpen = dropdown.hidden === false;
      document.querySelectorAll(".dropdown").forEach((d) => (d.hidden = true));
      document
        .querySelectorAll("[data-dropdown]")
        .forEach((b) => b.setAttribute("aria-expanded", "false"));
      dropdown.hidden = isOpen ? true : false;
      dropdown.classList.toggle("show", !isOpen); // Muestra el dropdown
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // Cerrar dropdowns si se hace click fuera
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item")) {
      document.querySelectorAll(".dropdown").forEach((d) => {
        d.hidden = true;
        d.classList.remove("show");
      });
      document
        .querySelectorAll("[data-dropdown]")
        .forEach((b) => b.setAttribute("aria-expanded", "false"));
    }
  });

  // Cerrar dropdown al navegar por opción
  document.querySelectorAll(".dropdown a").forEach((a) => {
    a.addEventListener("click", () => {
      document.querySelectorAll(".dropdown").forEach((d) => {
        d.hidden = true;
        d.classList.remove("show");
      });
      document
        .querySelectorAll("[data-dropdown]")
        .forEach((b) => b.setAttribute("aria-expanded", "false"));
    });
  });
})();
