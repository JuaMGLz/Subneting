
    // JavaScript para el quiz de acceso
    class QuizAccess {
      constructor() {
        this.correctAnswer = 'b'; // 192.168.10.0 es la respuesta correcta
        this.selectedAnswer = null;
        this.attempts = 0;
        this.maxAttempts = 3;
        
        // Comprobar si el quiz ya fue aprobado antes de inicializar
        if (localStorage.getItem('quizPassed') === 'true') {
          this.unlockContent(true); // Desbloquea el contenido silenciosamente
        } else {
          this.init(); // Inicia el quiz normalmente
        }
      }

      init() {
        this.bindEvents();
        this.updateProgress();
        // Asegurarse de que el modal sea visible al iniciar el quiz
        document.getElementById('quizModal').style.display = 'flex';
      }

      bindEvents() {
        // Opciones de respuesta
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
          option.addEventListener('click', (e) => this.selectOption(e));
        });

        // Botón de verificar
        document.getElementById('submitQuiz').addEventListener('click', () => this.checkAnswer());
        
        // Botón de reintentar
        document.getElementById('retryQuiz').addEventListener('click', () => this.resetQuiz());
      }

      selectOption(e) {
        // Limpiar selecciones previas
        document.querySelectorAll('.quiz-option').forEach(opt => {
          opt.classList.remove('selected');
        });

        // Seleccionar la nueva opción
        e.target.classList.add('selected');
        this.selectedAnswer = e.target.dataset.answer;

        // Habilitar botón de verificar
        document.getElementById('submitQuiz').disabled = false;
      }

      checkAnswer() {
        this.attempts++;
        const resultMessage = document.getElementById('resultMessage');
        const submitBtn = document.getElementById('submitQuiz');
        const retryBtn = document.getElementById('retryQuiz');

        if (this.selectedAnswer === this.correctAnswer) {
          // Respuesta correcta
          resultMessage.innerHTML = `
            <div class="result-message result-success">
              🎉 ¡Excelente! Has demostrado que comprendes el concepto de direcciones IP.
              <br><small>Con máscara /24, los primeros 24 bits (192.168.10) representan la red.</small>
            </div>
          `;

          // Marcar opción correcta
          document.querySelector(`[data-answer="${this.correctAnswer}"]`).classList.add('correct');
          
          // ***** CAMBIO CLAVE: Guardar en localStorage que el quiz fue aprobado *****
          localStorage.setItem('quizPassed', 'true');

          setTimeout(() => {
            this.unlockContent();
          }, 2000);

        } else {
          // Respuesta incorrecta
          document.querySelector(`[data-answer="${this.selectedAnswer}"]`).classList.add('incorrect');
          
          if (this.attempts >= this.maxAttempts) {
            resultMessage.innerHTML = `
              <div class="result-message result-error">
                ❌ Has agotado tus intentos. Serás redirigido para repasar el tema.
                <br><small>La respuesta correcta era <strong>192.168.10.0</strong> - necesitas estudiar más sobre direcciones IP.</small>
              </div>
            `;
            
            document.querySelector(`[data-answer="${this.correctAnswer}"]`).classList.add('correct');
            
            // Mostrar countdown y redireccionar
            let countdown = 5;
            const countdownInterval = setInterval(() => {
              resultMessage.innerHTML = `
                <div class="result-message result-error">
                  ❌ Intentos agotados. Redirigiendo a la página de estudio en <strong>${countdown}</strong> segundos...
                  <br><small>Debes repasar el tema de direcciones IP antes de continuar.</small>
                </div>
              `;
              countdown--;
              
              if (countdown < 0) {
                clearInterval(countdownInterval);
                // Redireccionar a página de estudio (cambia la URL según necesites)
                window.location.href = 'definicion.html';
              }
            }, 1000);
          } else {
            const remaining = this.maxAttempts - this.attempts;
            resultMessage.innerHTML = `
              <div class="result-message result-error">
                ❌ Respuesta incorrecta. Te quedan ${remaining} intento${remaining > 1 ? 's' : ''}.
                <br><small>Recuerda: con /24, los primeros 24 bits representan la parte de red.</small>
              </div>
            `;
            
            submitBtn.style.display = 'none';
            retryBtn.style.display = 'inline-block';
          }
        }

        submitBtn.disabled = true;
        this.updateProgress();
      }

      resetQuiz() {
        // Limpiar selecciones y estilos
        document.querySelectorAll('.quiz-option').forEach(opt => {
          opt.classList.remove('selected', 'incorrect', 'correct');
        });

        // Resetear estado
        this.selectedAnswer = null;
        document.getElementById('resultMessage').innerHTML = '';
        document.getElementById('submitQuiz').disabled = true;
        document.getElementById('submitQuiz').style.display = 'inline-block';
        document.getElementById('retryQuiz').style.display = 'none';
        
        this.updateProgress();
      }

      updateProgress() {
        const progress = (this.attempts / this.maxAttempts) * 100;
        document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
      }

      unlockContent(silently = false) {
        const modal = document.getElementById('quizModal');
        const dashboard = document.getElementById('dashboardPage');

        if (silently) {
          // Si es silencioso, simplemente oculta el modal y desbloquea el contenido sin animaciones ni mensajes.
          modal.style.display = 'none';
          dashboard.classList.remove('content-locked');
          dashboard.style.filter = 'none';
          dashboard.style.pointerEvents = 'all';
          dashboard.style.userSelect = 'auto';
        } else {
          // Comportamiento original con animación y mensaje de bienvenida
          modal.style.animation = 'fadeOut 0.5s ease';
          
          setTimeout(() => {
            modal.style.display = 'none';
            
            // Desbloquear contenido
            dashboard.classList.remove('content-locked');
            dashboard.style.filter = 'none';
            dashboard.style.pointerEvents = 'all';
            dashboard.style.userSelect = 'auto';

            // Mostrar mensaje de bienvenida
            this.showWelcomeMessage();
          }, 500);
        }
      }

      showWelcomeMessage() {
        // Crear toast de bienvenida
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(45deg, #4ade80, #22c55e);
          color: white;
          padding: 20px 25px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
          z-index: 1000;
          animation: slideInRight 0.5s ease;
          max-width: 300px;
        `;
        
        toast.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 5px;">🎉 ¡Acceso Concedido!</div>
          <div style="font-size: 0.9em; opacity: 0.9;">Ahora puedes explorar el Visualizador de Red</div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
          toast.style.animation = 'slideOutRight 0.5s ease';
          setTimeout(() => toast.remove(), 500);
        }, 4000);
      }
    }

    // CSS para animaciones adicionales
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideInRight {
        from { 
          opacity: 0;
          transform: translateX(100%);
        }
        to { 
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOutRight {
        from { 
          opacity: 1;
          transform: translateX(0);
        }
        to { 
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(additionalStyles);

    // Inicializar el quiz cuando cargue la página
    document.addEventListener('DOMContentLoaded', () => {
      new QuizAccess();
    });
