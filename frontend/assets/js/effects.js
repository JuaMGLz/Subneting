(function () {
  const NetApp = (window.NetApp = window.NetApp || {});

  function mouseReactiveNodes() {
    document.addEventListener("mousemove", function (e) {
      const nodes = document.querySelectorAll(".network-node");
      nodes.forEach((node, index) => {
        if (index % 5 === 0) {
          const rect = node.getBoundingClientRect();
          const dx = e.clientX - rect.left;
          const dy = e.clientY - rect.top;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            node.style.background = "#ff6b35";
            node.style.transform = "scale(2)";
          } else {
            node.style.background = "var(--accent)";
            node.style.transform = "scale(1)";
          }
        }
      });
    });
  }

  function addImageAnimations() {
    const imageCards = document.querySelectorAll(".image-card");
    imageCards.forEach((card, index) => {
      card.style.animationDelay = index * 0.2 + "s";
      card.addEventListener("mouseenter", function () {
        const diagram = this.querySelector(".network-diagram");
        if (diagram) {
          diagram.style.transform = "scale(1.05) rotateY(5deg)";
          diagram.style.boxShadow = "0 10px 30px rgba(0, 212, 255, 0.3)";
        }
      });
      card.addEventListener("mouseleave", function () {
        const diagram = this.querySelector(".network-diagram");
        if (diagram) {
          diagram.style.transform = "scale(1) rotateY(0deg)";
          diagram.style.boxShadow = "none";
        }
      });
    });
  }

  function loadProgressiveContent() {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach((section, index) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(20px)";
      setTimeout(() => {
        section.style.transition = "all 0.6s ease";
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
      }, index * 200);
    });
  }

  function simulateRealTimeData() {
    const nodes = document.querySelectorAll(".network-node");
    if (!nodes.length) return;
    setInterval(() => {
      const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
      randomNode.style.background = "#ff6b35";
      randomNode.style.transform = "scale(2)";
      setTimeout(() => {
        randomNode.style.background = "var(--accent)";
        randomNode.style.transform = "scale(1)";
      }, 1000);
    }, 2000);
  }

  // Observa cambios en el mainContent para re-aplicar efectos
  function observeMainContent() {
    const main = document.getElementById("mainContent");
    if (!main) return;
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          addImageAnimations();
          loadProgressiveContent();
        }
      }
    });
    observer.observe(main, { childList: true, subtree: true });
  }

  NetApp.effects = {
    init() {
      mouseReactiveNodes();
      simulateRealTimeData();
      observeMainContent();
      // Inicial se ejecuta cuando insertamos primera vista
      setTimeout(() => {
        addImageAnimations();
        loadProgressiveContent();
      }, 100);
    },
  };
})();
