(function () {
  const NetApp = (window.NetApp = window.NetApp || {});

  const modal = {
    el: null,

    open({ title = "Título", body = "" } = {}) {
      if (!this.el) this.el = document.getElementById("appModal");
      if (!this.el) return;

      const titleEl = this.el.querySelector("#modalTitle");
      const bodyEl = this.el.querySelector("#modalBody");

      if (titleEl) titleEl.textContent = title;
      if (bodyEl) bodyEl.innerHTML = body;

      this.el.hidden = false;
      this.el.removeAttribute("aria-hidden");

      // Handlers de cierre
      this.el.querySelectorAll("[data-modal-close]").forEach((btn) => {
        btn.addEventListener("click", this.close.bind(this), { once: true });
      });

      document.addEventListener("keydown", this._esc, { once: true });
    },

    close() {
      if (!this.el) this.el = document.getElementById("appModal");
      if (!this.el) return;

      this.el.hidden = true;
      this.el.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", this._esc);
    },

    _esc(e) {
      if (e.key === "Escape") modal.close();
    },

    init() {
      if (!this.el) this.el = document.getElementById("appModal");
      if (!this.el) return;

      // Cerrar al hacer clic en backdrop o botones marcados
      this.el.addEventListener("click", (e) => {
        if (
          e.target.matches("[data-modal-close]") ||
          e.target.classList.contains("modal-backdrop")
        ) {
          modal.close();
        }
      });
    },
  };

  NetApp.modal = modal;
})();
