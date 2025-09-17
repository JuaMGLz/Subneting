/* assets/js/nav.js
   - Arregla rutas según si estás en /pages/ o en raíz
   - Maneja dropdowns
   - Marca enlace activo
*/
(function routeFix() {
  // ¿Esta página está dentro de /pages/ ? (soporta file:// en Windows)
  const path = location.pathname.replace(/\\/g, "/").toLowerCase();
  const inPages = /\/pages\/[^/]+\.html$/.test(path);

  const toRoot = inPages ? "../" : "./"; // para ir a frontend/
  const toPages = inPages ? "" : "pages/"; // para ir a frontend/pages/

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
        // si tienes auth propio, ponlo aquí
        sessionStorage.removeItem("ns_user");
        localStorage.removeItem("ns_user");
      } catch {}
      location.href = toRoot + "index.html";
    });
  }
})();

/* ---------- Dropdowns (igual que tenías) ---------- */
(function () {
  // Toggle de dropdowns (Conceptos / Herramientas)
  document.querySelectorAll("[data-dropdown]").forEach((btn) => {
    const id = btn.getAttribute("data-dropdown");
    const dropdown = document.getElementById(id + "Dropdown");
    if (!dropdown) return;

    btn.addEventListener("click", () => {
      const isOpen = dropdown.hidden === false;
      // Cierra otros
      document.querySelectorAll(".dropdown").forEach((d) => (d.hidden = true));
      document
        .querySelectorAll("[data-dropdown]")
        .forEach((b) => b.setAttribute("aria-expanded", "false"));

      // Abre/cierra este
      dropdown.hidden = isOpen ? true : false;
      btn.setAttribute("aria-expanded", String(!isOpen));
      dropdown.classList.toggle("show", !isOpen);
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

/* ---------- Enlace activo (más robusto) ---------- */
(function () {
  // Compara por nombre de archivo para que funcione igual en raíz o en /pages/
  const hereFile = location.pathname.split(/[\\/]/).pop().toLowerCase();

  document
    .querySelectorAll(".nav-menu a.nav-link, .dropdown a")
    .forEach((a) => {
      const href = a.getAttribute("href") || "";
      const toFile = href.split(/[\\/]/).pop().toLowerCase();

      if (toFile === hereFile) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");

        // Si está dentro de un dropdown, marca el botón padre también
        const dd = a.closest(".dropdown");
        if (dd) {
          const btn = document.querySelector(`[aria-controls="${dd.id}"]`);
          btn && btn.classList.add("is-active");
        }
      }
    });
})();
