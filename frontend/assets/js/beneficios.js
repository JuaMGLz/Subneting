// Beneficios – JS específico
document.addEventListener("DOMContentLoaded", () => {
  // Intersección para animar tarjetas al aparecer
  const cards = Array.from(document.querySelectorAll(".benefit-card"));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  cards.forEach((c) => io.observe(c));

  // Toggle abrir/cerrar detalles (click + teclado)
  document.getElementById("benefitGrid")?.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".benefit-toggle");
    if (!btn) return;
    const card = btn.closest(".benefit-card");
    const details = card.querySelector(".benefit-details");

    const isOpen = card.classList.toggle("open");
    details.hidden = !isOpen;
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.textContent = isOpen ? "Ver menos" : "Ver más";
  });

  // Soporte teclado: Enter/Espacio sobre la tarjeta también expande
  document.getElementById("benefitGrid")?.addEventListener("keydown", (ev) => {
    const card = ev.target.closest(".benefit-card");
    if (!card) return;
    if (ev.key === "Enter" || ev.key === " ") {
      const btn = card.querySelector(".benefit-toggle");
      btn?.click();
      ev.preventDefault();
    }
  });

  // Opcional: hacer cada tarjeta focuseable para accesibilidad
  cards.forEach((c) => (c.tabIndex = 0));
});
