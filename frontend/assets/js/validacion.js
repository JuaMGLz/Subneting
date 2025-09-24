
        // ---------- Estado global ----------
        const appState = {
            userLevel: 1,
            userXP: 0,
            difficulty: 'principiante',
            stats: { 
                correct: 0, 
                total: 0, 
                streak: 0, 
                maxStreak: 0, 
                hintsUsed: 0, 
                timeSpent: 0, 
                questionsPerDifficulty: { principiante: 0, intermedio: 0, avanzado: 0 } 
            },
            currentQuestion: null
        };

        // ---------- Toasts ----------
        function showToast(msg, type='info', duration=4000){
            const c = document.getElementById('toastContainer'); 
            if(!c) return;
            const t = document.createElement('div'); 
            t.className = `toast ${type}`;
            t.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:20px;">${type==='success'?'✅':type==='error'?'❌':type==='warning'?'⚠️':'ℹ️'}</span>
                <span>${msg}</span></div>`;
            c.appendChild(t); 
            requestAnimationFrame(()=>t.classList.add('show'));
            setTimeout(()=>{ 
                t.classList.remove('show'); 
                setTimeout(()=>t.remove(), 300); 
            }, duration);
        }

        // ---------- Banco de preguntas basado en tu metodología ----------
        const questionTemplates = {
            principiante: [
                {
                    generate: () => {
                        const networks = ['192.168.1.0/24', '10.0.0.0/24', '172.16.0.0/24'];
                        const network = networks[Math.floor(Math.random() * networks.length)];
                        const subnets = [2, 4, 8];
                        const subnetCount = subnets[Math.floor(Math.random() * subnets.length)];
                        const bitsNeeded = Math.ceil(Math.log2(subnetCount));
                        
                        return {
                            question: `Si quieres dividir la red ${network} en ${subnetCount} subredes, ¿cuántos bits necesitas "tomar prestados" de la parte de Host? (Paso 2 del método manual)`,
                            answer: String(bitsNeeded),
                            explanation: `Para ${subnetCount} subredes necesitas ${bitsNeeded} bits porque 2^${bitsNeeded} = ${Math.pow(2, bitsNeeded)} ≥ ${subnetCount}. Este es el Paso 2 de tu método manual.`,
                            hint: `Usa la fórmula 2^n donde n es el número de bits. Busca la potencia de 2 igual o mayor a ${subnetCount}.`
                        };
                    }
                },
                {
                    generate: () => {
                        const bitsBorrowed = [2, 3, 4];
                        const bits = bitsBorrowed[Math.floor(Math.random() * bitsBorrowed.length)];
                        const originalHosts = 8;
                        const remainingHosts = originalHosts - bits;
                        const hostsPerSubnet = Math.pow(2, remainingHosts) - 2;
                        
                        return {
                            question: `Si tu máscara original tenía 8 bits de Host y tomas ${bits} bits prestados, ¿cuántos hosts útiles tendrás por subred? (Paso 3 del método manual)`,
                            answer: String(hostsPerSubnet),
                            explanation: `Te quedan ${remainingHosts} bits de Host. Entonces: 2^${remainingHosts} - 2 = ${Math.pow(2, remainingHosts)} - 2 = ${hostsPerSubnet} hosts útiles. El "-2" es para la dirección de red y broadcast.`,
                            hint: `Usa la fórmula 2^h - 2, donde h son los bits restantes para Host.`
                        };
                    }
                },
                {
                    generate: () => {
                        const newMasks = [192, 224, 240];
                        const newMask = newMasks[Math.floor(Math.random() * newMasks.length)];
                        const salto = 256 - newMask;
                        
                        return {
                            question: `Si tu nueva máscara de subred termina en 255.255.255.${newMask}, ¿cuál es el "salto" entre subredes? (Paso 4 del método manual)`,
                            answer: String(salto),
                            explanation: `El salto se calcula: 256 - ${newMask} = ${salto}. Este es el incremento que usas para encontrar cada subred consecutiva.`,
                            hint: `Recuerda la fórmula del Paso 4: Salto = 256 - Máscara Nueva`
                        };
                    }
                }
            ],
            
            intermedio: [
                {
                    generate: () => {
                        const potencias = [
                            { exp: 2, valor: 4 },
                            { exp: 3, valor: 8 },
                            { exp: 4, valor: 16 },
                            { exp: 5, valor: 32 }
                        ];
                        const potencia = potencias[Math.floor(Math.random() * potencias.length)];
                        
                        return {
                            question: `Según la "Tabla Mágica del 2" del método intermedio, ¿cuál es el valor de 2^${potencia.exp}?`,
                            answer: String(potencia.valor),
                            explanation: `En la Tabla Mágica del 2: 2^${potencia.exp} = ${potencia.valor}. Esta tabla es la base del método intermedio de potencias de 2.`,
                            hint: `Recuerda la secuencia: 2^0=1, 2^1=2, 2^2=4, 2^3=8, 2^4=16, 2^5=32...`
                        };
                    }
                },
                {
                    generate: () => {
                        const baseNets = [
                            { net: '192.168.1.0/24', salto: 32 },
                            { net: '10.0.0.0/24', salto: 64 },
                            { net: '172.16.0.0/24', salto: 128 }
                        ];
                        const base = baseNets[Math.floor(Math.random() * baseNets.length)];
                        const subnetNum = Math.floor(Math.random() * 3) + 1; // 1-3
                        const baseIP = base.net.split('/')[0];
                        const [a, b, c] = baseIP.split('.');
                        const expectedNet = `${a}.${b}.${c}.${subnetNum * base.salto}`;
                        
                        return {
                            question: `Usando el método intermedio, si tu red base es ${base.net} y el salto es ${base.salto}, ¿cuál es la dirección de la subred ${subnetNum + 1}? (sin /CIDR)`,
                            answer: expectedNet,
                            explanation: `Subred ${subnetNum + 1}: Red base (${baseIP}) + ${subnetNum} × ${base.salto} = ${expectedNet}. Así enumeras subredes en el método intermedio.`,
                            hint: `Suma el salto multiplicado por el número de subred a la dirección base.`
                        };
                    }
                }
            ],
            
            avanzado: [
                {
                    generate: () => {
                        const departments = [
                            { name: 'RR.HH.', hosts: 50, bits: 6, cidr: 26 },
                            { name: 'Ventas', hosts: 20, bits: 5, cidr: 27 },
                            { name: 'Gerencia', hosts: 10, bits: 4, cidr: 28 },
                            { name: 'Impresoras', hosts: 2, bits: 2, cidr: 30 }
                        ];
                        const dept = departments[Math.floor(Math.random() * departments.length)];
                        
                        return {
                            question: `Usando VLSM (método avanzado), si ${dept.name} necesita ${dept.hosts} hosts, ¿qué máscara CIDR necesitas? (responde solo el número)`,
                            answer: String(dept.cidr),
                            explanation: `Para ${dept.hosts} hosts necesitas ${dept.bits} bits de host (2^${dept.bits} - 2 ≥ ${dept.hosts}). Entonces: 32 - ${dept.bits} = /${dept.cidr}`,
                            hint: `Usa la fórmula del método avanzado: 2^n - 2 ≥ hosts, luego 32 - n = CIDR`
                        };
                    }
                },
                {
                    generate: () => {
                        const vlsmExamples = [
                            { hosts: 30, availableHosts: 30, cidr: 27 },
                            { hosts: 14, availableHosts: 14, cidr: 28 },
                            { hosts: 6, availableHosts: 6, cidr: 29 }
                        ];
                        const example = vlsmExamples[Math.floor(Math.random() * vlsmExamples.length)];
                        const actualHosts = Math.pow(2, 32 - example.cidr) - 2;
                        
                        return {
                            question: `En VLSM, si asignas una máscara /${example.cidr}, ¿cuántos hosts útiles tendrás disponibles?`,
                            answer: String(actualHosts),
                            explanation: `Con /${example.cidr}: 2^${32 - example.cidr} - 2 = ${Math.pow(2, 32 - example.cidr)} - 2 = ${actualHosts} hosts útiles. VLSM optimiza el uso de direcciones.`,
                            hint: `Calcula 2^(32 - CIDR) - 2 para obtener hosts útiles.`
                        };
                    }
                }
            ]
        };

        // ---------- Lógica de dificultad ----------
        function getDifficulty() {
            if (appState.stats.total < 5) return 'principiante';
            const acc = appState.stats.correct / appState.stats.total;
            const s = appState.stats.streak;
            if (acc >= .8 && s >= 3) return appState.userLevel >= 3 ? 'avanzado' : 'intermedio';
            if (acc >= .6 && s >= 2) return 'intermedio';
            return 'principiante';
        }

        function newQuestion(){
            const diff = getDifficulty(); 
            appState.difficulty = diff;
            const tpl = questionTemplates[diff][Math.floor(Math.random()*questionTemplates[diff].length)];
            appState.currentQuestion = tpl.generate();

            document.getElementById('currentQuestion').textContent = appState.currentQuestion.question;
            const badge = document.getElementById('difficultyBadge');
            const difficultyNames = {
                'principiante': 'Principiante',
                'intermedio': 'Intermedio',
                'avanzado': 'Avanzado'
            };
            badge.textContent = difficultyNames[diff];
            badge.className = `difficulty-indicator difficulty-${diff === 'principiante' ? 'easy' : diff === 'intermedio' ? 'medium' : 'hard'}`;

            document.getElementById('answerInput').value = '';
            document.getElementById('feedback').innerHTML = '';
            document.getElementById('hintContent').classList.remove('show');

            showToast(`Nueva pregunta de nivel ${difficultyNames[diff]}`, 'info', 1800);
        }

        // ---------- Interacción ----------
        function toggleHint(){
            const cont = document.getElementById('hintContent');
            const text = document.getElementById('hintText');
            if (appState.currentQuestion?.hint){
                text.textContent = appState.currentQuestion.hint;
                cont.classList.toggle('show');
                if (cont.classList.contains('show')) { 
                    appState.stats.hintsUsed++; 
                    showToast('Pista mostrada (-3 XP)','warning',1800); 
                }
            }
        }

        function checkPartialAnswer(userAnswer, correctAnswer){
            // Para respuestas numéricas
            if (/^\d+$/.test(userAnswer) && /^\d+$/.test(correctAnswer)) {
                const userNum = parseInt(userAnswer);
                const correctNum = parseInt(correctAnswer);
                const diff = Math.abs(userNum - correctNum);
                if (diff <= 2 && diff > 0) {
                    return { isPartial: true, message: 'Muy cerca del resultado correcto.' };
                }
            }
            
            // Para direcciones IP
            const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?/;
            if (ipPattern.test(userAnswer) && ipPattern.test(correctAnswer)) {
                const u = userAnswer.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?/);
                const c = correctAnswer.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?/);
                if (u && c) {
                    let octets = 0; 
                    for (let i=1;i<=4;i++) if (u[i]===c[i]) octets++;
                    const cidrMatch = u[6]===c[6];
                    if (octets>=3 && cidrMatch) return { isPartial:true, message:'Formato correcto y la mayoría de octetos coinciden.' };
                    if (octets>=2) return { isPartial:true, message:'Formato correcto pero hay octetos incorrectos.' };
                }
            }
            return { isPartial:false };
        }

        function getDifficultyXP(d){ return ({principiante:10, intermedio:20, avanzado:35}[d]||10); }
        function getXPForLevel(level){ return level*100; }
        function getLevelName(level){
            if (level < 3) return 'Principiante';
            if (level < 6) return 'Aprendiz de Subredes';
            if (level < 10) return 'Experto en CIDR';
            if (level < 15) return 'Maestro VLSM';
            return 'Gurú de Redes';
        }

        function updateStats(){
            const s = appState.stats;
            document.getElementById('correctCount').textContent = s.correct;
            document.getElementById('totalCount').textContent = s.total;
            document.getElementById('streak').textContent = s.streak;
            const acc = s.total>0 ? Math.round((s.correct/s.total)*100) : 0;
            document.getElementById('accuracy').textContent = `${acc}%`;

            document.getElementById('currentXP').textContent = `${appState.userXP} XP`;
            const next = getXPForLevel(appState.userLevel+1);
            const curr = getXPForLevel(appState.userLevel);
            const pct = ((appState.userXP - curr) / (next - curr)) * 100;
            document.getElementById('xpProgress').style.width = Math.max(0, Math.min(100, pct)) + '%';

            saveState();
        }

        function checkLevelUp(){
            const nextXP = getXPForLevel(appState.userLevel+1);
            if (appState.userXP >= nextXP){
                appState.userLevel++;
                document.getElementById('currentLevel').textContent = `Nivel ${appState.userLevel}: ${getLevelName(appState.userLevel)}`;
                showToast(`¡Has subido a Nivel ${appState.userLevel}!`, 'success', 4200);
                updateStats();
            }
        }

        function checkAnswer(){
            if (!appState.currentQuestion){ newQuestion(); return; }
            const val = document.getElementById('answerInput').value.trim();
            if (!val){ showToast('¡Escribe una respuesta primero!','warning'); return; }

            const f = document.getElementById('feedback');
            appState.stats.total++;

            const correct = val.toLowerCase() === appState.currentQuestion.answer.toLowerCase();
            const partial = checkPartialAnswer(val, appState.currentQuestion.answer);

            let xp=0, cls='', msg='';
            if (correct){
                appState.stats.correct++; appState.stats.streak++;
                xp = getDifficultyXP(appState.difficulty) + (appState.stats.streak*2);
                if (document.getElementById('hintContent').classList.contains('show')) xp = Math.max(1, xp-3);
                appState.userXP += xp;
                cls='success';
                msg = `<div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>✅ ¡Correcto! ${appState.currentQuestion.explanation}</div>
                    <div style="background:rgba(40,167,69,.2);padding:4px 10px;border-radius:14px;">+${xp} XP</div>
                </div>${appState.stats.streak>1?`<div style="margin-top:8px;"><strong>🔥 Racha: ${appState.stats.streak}</strong></div>`:''}`;
                showToast(`¡Correcto! +${xp} XP`, 'success');
            } else if (partial.isPartial){
                appState.stats.streak = 0; xp = 2; appState.userXP += xp;
                cls='partial';
                msg = `<div>⚠️ Parcialmente correcto. ${partial.message}</div>
                       <div><strong>Tu respuesta:</strong> ${val}</div>
                       <div><strong>Correcta:</strong> ${appState.currentQuestion.answer}</div>
                       <div style="margin-top:8px;">${appState.currentQuestion.explanation}</div>`;
                showToast('Parcialmente correcto +2 XP', 'warning');
            } else {
                appState.stats.streak = 0;
                cls='error';
                msg = `<div>❌ Incorrecto. ${appState.currentQuestion.explanation}</div>
                       <div><strong>Tu respuesta:</strong> ${val}</div>
                       <div><strong>Correcta:</strong> ${appState.currentQuestion.answer}</div>`;
                showToast('Respuesta incorrecta. ¡Sigue practicando!', 'error');
            }

            f.innerHTML = `<div class="feedback ${cls}">${msg}</div>`;
            updateStats(); checkLevelUp();
            setTimeout(newQuestion, 2800);
        }

        // ---------- Persistencia ----------
        function saveState(){ 
            try{ 
                localStorage.setItem('validacion_state', JSON.stringify(appState)); 
            }catch{} 
        }

        function loadState(){
            try{
                const raw = localStorage.getItem('validacion_state');
                if (raw){
                    const parsed = JSON.parse(raw);
                    appState.userLevel = parsed.userLevel ?? 1;
                    appState.userXP = parsed.userXP ?? 0;
                    appState.stats = Object.assign(appState.stats, parsed.stats||{});
                    document.getElementById('currentLevel').textContent = `Nivel ${appState.userLevel}: ${getLevelName(appState.userLevel)}`;
                    showToast('¡Progreso cargado!', 'info', 1600);
                    updateStats();
                }
            }catch{}
        }

        function exportProgress(){
            const dataStr = JSON.stringify(appState, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); 
            a.href = url; 
            a.download = 'subnetting_progress.json';
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            URL.revokeObjectURL(url);
            showToast('Estadísticas exportadas como JSON','success');
        }

        function resetProgress(){
            if (confirm('¿Reiniciar todo tu progreso?')) {
                try{ localStorage.removeItem('validacion_state'); }catch{}
                location.reload();
            }
        }

        // ---------- Init ----------
        document.addEventListener('DOMContentLoaded', () => {
            // Marcar link activo
            try{
                const path = location.pathname.split('/').pop();
                document.querySelectorAll('.nav-link, .dropdown-item').forEach(a=>{
                    if (a.getAttribute('href')?.endsWith(path)){ 
                        a.classList.add('is-active'); 
                        a.setAttribute('aria-current','page'); 
                    }
                });
            }catch{}

            loadState();
            newQuestion();

            // Acciones
            document.querySelector('[data-action="check"]')?.addEventListener('click', checkAnswer);
            document.querySelector('[data-action="new"]')?.addEventListener('click', newQuestion);
            document.querySelector('[data-action="hint"]')?.addEventListener('click', toggleHint);
            document.querySelector('[data-action="reset"]')?.addEventListener('click', resetProgress);
            document.querySelector('[data-action="export"]')?.addEventListener('click', exportProgress);
            document.getElementById('answerInput')?.addEventListener('keyup', e=>{ if(e.key==='Enter') checkAnswer(); });
        });
