document.addEventListener("DOMContentLoaded", () => {
  const navHTML = `
        <nav class="navbar">
            <div class="navbar-content">
                <div class="logo" aria-label="UAEMCITOS">🌐 UAEMCITOS</div>

                <div class="nav-menu" role="menubar">
                    <div class="nav-item" role="none">
                        <a class="nav-link" href="definicion.html" role="menuitem">Definición</a>
                    </div>

                    <div class="nav-item" role="none">
                        <button class="nav-link" data-dropdown="concepts" aria-expanded="false"
                            aria-controls="conceptsDropdown" role="menuitem">
                            Metodos de creación <span class="caret">▼</span>
                        </button>
                        <div class="dropdown" id="conceptsDropdown" hidden>
                            <a class="dropdown-item" href="pages/tipos_segmentacion.html">Conversión a binario</a>
                            <a class="dropdown-item" href="pages/beneficios.html">Beneficios</a>
                            <a class="dropdown-item" href="pages/implementacion.html">Implementación</a>
                        </div>
                    </div>

                    <div class="nav-item" role="none">
                        <button class="nav-link" data-dropdown="tools" aria-expanded="false"
                            aria-controls="toolsDropdown" role="menuitem">
                            Herramientas <span class="caret">▼</span>
                        </button>
                        <div class="dropdown" id="toolsDropdown" hidden>
                            <a class="dropdown-item" href="pages/division.html">División Visual de Subredes</a>
                            <a class="dropdown-item" href="pages/calculadora.html">Calculadora Inteligente de Subredes</a>
                            <a class="dropdown-item" href="pages/validacion.html">Sistema Adaptativo de Validación</a>
                        </div>
                    </div>
                </div>

                <div class="user-menu">
                    <span id="welcomeUser" class="welcome">Bienvenido, Usuario</span>
                    <button id="logoutBtn" class="logout-btn">Salir</button>
                </div>
            </div>
        </nav>
    `;

  const dashboardContainer = document.querySelector(".dashboard");
  if (dashboardContainer) {
    dashboardContainer.insertAdjacentHTML("afterbegin", navHTML);
    setupNavbarListeners();
    setupScrollListener();
    setupRouteFix();
  }

  function setupNavbarListeners() {
    // Toggle de dropdowns
    document.querySelectorAll("[data-dropdown]").forEach((btn) => {
      const id = btn.getAttribute("data-dropdown");
      const dropdown = document.getElementById(id + "Dropdown");
      if (!dropdown) return;

      btn.addEventListener("click", () => {
        const isOpen = dropdown.hidden === false;
        document
          .querySelectorAll(".dropdown")
          .forEach((d) => (d.hidden = true));
        document
          .querySelectorAll("[data-dropdown]")
          .forEach((b) => b.setAttribute("aria-expanded", "false"));
        dropdown.hidden = isOpen ? true : false;
        dropdown.classList.toggle("show", !isOpen);
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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        if (typeof handleLogout === "function") {
          handleLogout();
        } else {
          console.error("La función handleLogout no está definida.");
        }
      });
    }
  }

  function setupScrollListener() {
    let lastScrollTop = 0;
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", function () {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;

      if (
        currentScroll > lastScrollTop &&
        currentScroll > navbar.offsetHeight
      ) {
        navbar.classList.add("hidden");
      } else {
        navbar.classList.remove("hidden");
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
  }

  function setupRouteFix() {
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
    ["division", "calculadora", "validacion"].forEach((name) => {
      document
        .querySelectorAll(`#toolsDropdown a[href$="${name}.html"]`)
        .forEach((a) => {
          a.setAttribute("href", toPages + `${name}.html`);
        });
    });

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
  }
});
