// assets/js/content.js
(function () {
  const NetApp = (window.NetApp = window.NetApp || {});

  const templates = {
    definition: `
      <div class="content-section">
        <h2 class="section-title">¿Qué es la Segmentación de Redes?</h2>
        <p class="definition-text">
          La <strong>segmentación de redes</strong> divide una red en múltiples segmentos o subredes más pequeñas.
          Permite aislar activos críticos, aplicar el principio de <em>acceso mínimo necesario</em> y mejorar el control del tráfico.
        </p>

        <div class="image-gallery">
          <!-- ========== Tarjeta: Red Tradicional (flip) ========== -->
          <div class="image-card">
            <div class="network-diagram">🔗 → 🔗 → 🔗</div>
            <div class="image-title">Red Tradicional</div>
            <div class="image-description">
              Todos los dispositivos conviven en un mismo dominio de broadcast.
            </div>

            <div class="flip-card" data-flip role="button" tabindex="0" aria-label="Voltear tarjeta de analogía">
              <div class="flip-inner">
                <!-- Frente: imagen -->
                <div class="flip-face flip-front">
                  <img
                    src="assets/images/tradicional.png"
                    alt="Topología de red tradicional"
                    loading="eager"
                    decoding="async"
                    onerror="this.outerHTML='<div style=&quot;color:#fff;padding:16px;text-align:center&quot;>No se encontró <strong>assets/images/tradicional.png</strong></div>'"
                  />
                  <span class="flip-hint">Haz clic para voltear ⟲</span>
                </div>

                <!-- Reverso: analogía (sin imagen) -->
                <div class="flip-face flip-back">
                  <div class="analogy-panel">
                    <h4>Analogía: un solo patio de recreo</h4>
                    <p>Imagina que toda la escuela juega en <strong>un mismo patio sin divisiones</strong>.</p>
                    <ul>
                      <li><strong>Todos oyen todo:</strong> si alguien grita “¡Pelota!”, <em>todos</em> se distraen. 🔔</li>
                      <li><strong>Se hacen bolitas:</strong> todos quieren el mismo espacio; moverse es difícil. 🧑‍🤝‍🧑</li>
                      <li><strong>Un tropiezo afecta a todos:</strong> cualquiera puede chocar con cualquiera. 😵</li>
                    </ul>
                    <small>Vuelve a hacer clic para regresar.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ========== Tarjeta: Red Segmentada (flip) ========== -->
          <div class="image-card">
            <div class="network-diagram">🔗 | 🔗 | 🔗</div>
            <div class="image-title">Red Segmentada</div>
            <div class="image-description">
              La red se divide en zonas separadas con reglas claras entre sí.
            </div>

            <div class="flip-card" data-flip role="button" tabindex="0" aria-label="Voltear tarjeta de analogía">
              <div class="flip-inner">
                <!-- Frente: imagen -->
                <div class="flip-face flip-front">
                  <img
                    src="assets/images/segmentada.png"
                    alt="Topología de red segmentada"
                    loading="eager"
                    decoding="async"
                    onerror="this.outerHTML='<div style=&quot;color:#fff;padding:16px;text-align:center&quot;>No se encontró <strong>assets/images/segmentada.png</strong></div>'"
                  />
                  <span class="flip-hint">Haz clic para voltear ⟲</span>
                </div>

                <!-- Reverso: analogía (sin imagen) -->
                <div class="flip-face flip-back">
                  <div class="analogy-panel">
                    <h4>Analogía: patios con rejas y puertas</h4>
                    <p>Ahora la escuela tiene <strong>varios patios</strong>: fútbol (⚽), columpios (🎠) y lectura (📚).</p>
                    <ul>
                      <li><strong>Menos ruido cruzado:</strong> cada grupo oye lo suyo, no todo a la vez.</li>
                      <li><strong>Menos choques:</strong> cada juego tiene su espacio; moverse es más fácil.</li>
                      <li><strong>Aislamiento de problemas:</strong> si algo pasa en fútbol, los columpios siguen tranquilos.</li>
                      <li><strong>Puertas con control:</strong> se pueden pasar “pelotas” o mensajes <em>sólo cuando hace falta</em>. 🚪👩‍🏫</li>
                    </ul>
                    <small>Vuelve a hacer clic para regresar.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- ===================================================== -->
        </div>
      </div>
    `,
    // ... el resto de tus templates
  };

  // Handlers para el flip al click/teclado
  function attachFlipHandlers(root = document) {
    root.querySelectorAll("[data-flip] .flip-inner").forEach((inner) => {
      const card = inner.closest("[data-flip]");
      if (!card) return;

      const toggle = () => {
        const flipped = inner.classList.toggle("is-flipped");
        card.setAttribute("aria-pressed", String(flipped));
      };

      card.addEventListener("click", toggle);

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  function set(contentType = "definition") {
    const main = document.getElementById("mainContent");
    if (!main) return;
    main.innerHTML = templates[contentType] || templates.definition;
    main.scrollTo({ top: 0, behavior: "smooth" });

    // activar flip en nuevas tarjetas
    attachFlipHandlers(main);
  }

  NetApp.content = { set };
})();
