// assets/js/content.js
(function () {
    const NetApp = (window.NetApp = window.NetApp || {});

    const templates = {
        definition: `
            <header class="content-section text-center">
                <h1 class="section-title">Subnetting de Redes</h1>
                <p class="section-subtitle">La forma más sencilla de entender cómo se dividen las redes</p>
            </header>

            <div class="content-section">
                <h2 class="section-title">¿Qué es el Subnetting?</h2>
                <p class="definition-text">
                    El <strong>subnetting</strong> es la técnica de dividir un bloque de direcciones IP de una red principal en subredes más pequeñas y eficientes. Esta división se logra tomando bits de la porción de 'host' de la dirección IP y asignándolos a la porción de 'red'. El objetivo principal es reducir el tamaño de los dominios de broadcast, optimizar el uso de direcciones IP y mejorar la seguridad y el rendimiento de la red.
                </p>
            </div>

            <div class="content-section">
                <h2 class="section-title">Piensa en una Ciudad...</h2>
                <p class="definition-text">
                    Imagina una ciudad enorme. Cada casa tiene una dirección única para que el correo llegue a donde debe. En el mundo de las redes, tu casa es una computadora y tu dirección es una <strong>dirección IP</strong>.
                </p>
                <p class="definition-text">
                    Al principio, toda la ciudad es un solo barrio. Esto funciona bien si hay pocas casas, pero si la ciudad crece mucho, se vuelve un caos. El cartero se pierde y las entregas son muy lentas.
                </p>
                <div class="image-gallery">
                    <div class="image-card">
                        <img src="assets/images/ciudad.webp" alt="Ilustración de una ciudad muy grande y ocupada" />
                        <div class="image-title">Una Red Grande</div>
                        <div class="image-description">
                            Como una ciudad sin barrios, se vuelve ineficiente y difícil de gestionar.
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <h2 class="section-title">El Problema y la Solución</h2>
                <p class="definition-text">
                    Cuando una red es muy grande, como esa ciudad, se vuelve lenta e insegura. Todos "gritan" al mismo tiempo para comunicarse, lo que causa congestión. Un solo fallo puede afectar a todos.
                </p>
                <p class="definition-text">
                    La solución es simple: <strong>dividir la ciudad en barrios</strong>. Esto es exactamente lo que hace el <strong>subnetting</strong>.
                </p>
                <div class="image-gallery">
                    <div class="image-card">
                        <img src="assets/images/division_por_barrios.webp" alt="Ilustración de una ciudad dividida en barrios con letreros y nombres" />
                        <div class="image-title">División en Subredes</div>
                        <div class="image-description">
                            Organizar la red en partes más pequeñas facilita el tráfico y mejora la seguridad.
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="content-section">
                <h2 class="section-title">¿Qué es el Subnetting?</h2>
                <p class="definition-text text-center">
                    Subnetting es el proceso de tomar una red grande y dividirla en redes más pequeñas y manejables, llamadas <strong>subredes</strong>. Cada subred es como un barrio con su propio conjunto de direcciones, lo que hace que todo sea más organizado y eficiente.
                </p>
                <div class="image-gallery">
                    <div class="image-card">
                        <img src="assets/images/red_dividida.png" alt="Diagrama de una red principal dividida en subredes más pequeñas" />
                        <div class="image-title">Diagrama de Subredes</div>
                        <div class="image-description">
                            Una red principal se ramifica en subredes para una gestión más eficiente.
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-section">
                <h2 class="section-title">¿Por qué es Importante?</h2>
                <div class="benefits-list">
                    <div class="benefit-item">
                        <div class="benefit-title">📦 Mejor Organización</div>
                        <div class="benefit-desc">
                            Separa departamentos, áreas o tipos de dispositivos. Como organizar libros en una biblioteca.
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-title">🛡️ Más Seguridad</div>
                        <div class="benefit-desc">
                            Si hay un problema en un barrio (subred), no afecta a toda la ciudad.
                        </div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-title">🚀 Mayor Eficiencia</div>
                        <div class="benefit-desc">
                            El tráfico de datos es más rápido porque las "cartas" tienen menos camino que recorrer.
                        </div>
                    </div>
                </div>
            </div>
        `,
    };

    function set(contentType = "definition") {
        const main = document.getElementById("mainContent");
        if (!main) return;
        main.innerHTML = templates[contentType] || templates.definition;
        main.scrollTo({ top: 0, behavior: "smooth" });
    }

    NetApp.content = { set };
})();