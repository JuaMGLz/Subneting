// Interacción accesible para las tarjetas “flip” (click, Enter, Space)
(function () {
  const cards = document.querySelectorAll("[data-flip]");

  function toggle(card) {
    const flipped = card.classList.toggle("is-flipped");
    // Actualiza aria-pressed y aria-hidden de las caras para accesibilidad
    card.setAttribute("aria-pressed", String(flipped));
    const front = card.querySelector(".flip-front");
    const back = card.querySelector(".flip-back");
    if (front && back) {
      front.setAttribute("aria-hidden", String(flipped));
      back.setAttribute("aria-hidden", String(!flipped));
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => toggle(card));
    card.addEventListener("keydown", (e) => {
      // Enter (13) / Space (32)
      if (e.key === "Enter" || e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggle(card);
      }
    });
  });
})();
