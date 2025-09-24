// Implementación – interacciones
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("implementationGrid");
  const cards = Array.from(document.querySelectorAll(".step-card"));

  // Animar entrada con IntersectionObserver
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

  // Toggle analogías (click)
  grid?.addEventListener("click", (ev) => {
    const btn = ev.target.closest(".step-toggle");
    if (!btn) return;
    const card = btn.closest(".step-card");
    const analogy = card.querySelector(".step-analogy");
    const isOpen = card.classList.toggle("open");
    analogy.hidden = !isOpen;
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.textContent = isOpen ? "Ocultar analogía" : "Ver analogía";
  });

  // Accesibilidad: abrir con Enter/Espacio al enfocar la tarjeta
  grid?.addEventListener("keydown", (ev) => {
    const card = ev.target.closest(".step-card");
    if (!card) return;
    if (ev.key === "Enter" || ev.key === " ") {
      card.querySelector(".step-toggle")?.click();
      ev.preventDefault();
    }
  });

  // Hacer las tarjetas focuseables
  cards.forEach((c) => (c.tabIndex = 0));
});
