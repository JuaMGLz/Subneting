// ---------- Estado global ----------
const appState = {
  userLevel: 1,
  userXP: 0,
  difficulty: 'easy',
  stats: { correct: 0, total: 0, streak: 0, maxStreak: 0, hintsUsed: 0, timeSpent: 0, questionsPerDifficulty: { easy: 0, medium: 0, hard: 0 } },
  currentQuestion: null
};

// ---------- Toasts ----------
function showToast(msg, type='info', duration=4000){
  const c = document.getElementById('toastContainer'); if(!c) return;
  const t = document.createElement('div'); t.className = `toast ${type}`;
  t.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">
    <span style="font-size:20px;">${type==='success'?'✅':type==='error'?'❌':type==='warning'?'⚠️':'ℹ️'}</span>
    <span>${msg}</span></div>`;
  c.appendChild(t); requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(), 300); }, duration);
}

// ---------- Banco de preguntas ----------
const questionTemplates = {
  easy: [{
    generate: () => {
      const nets = ['192.168.1.0/24','10.0.0.0/24','172.16.1.0/24'];
      const network = nets[Math.floor(Math.random()*nets.length)];
      const [ip, cidr] = network.split('/'); const [a,b,c] = ip.split('.').map(Number);
      const host = Math.floor(Math.random()*200)+10;
      return {
        question: `¿A qué red pertenece la IP ${a}.${b}.${c}.${host}/${cidr}?`,
        answer: network,
        explanation: `Con máscara /${cidr}, todas las IP ${a}.${b}.${c}.X están en la red ${network}.`,
        hint: `Con /${cidr} no cambian los primeros 3 octetos en esos ejemplos.`
      };
    }
  }],
  medium: [{
    generate: () => {
      const nets = ['192.168.1.0/26','10.0.0.0/25','172.16.1.0/27'];
      const network = nets[Math.floor(Math.random()*nets.length)];
      const [ip, cidrStr] = network.split('/'); const cidr = parseInt(cidrStr,10);
      const [a,b,c,d] = ip.split('.').map(Number);
      const subnetSize = Math.pow(2, 32 - cidr) / 256; // tamaño por último octeto
      const n = Math.floor(Math.random()*3);
      const hostIn = Math.floor(Math.random()*Math.max(2, subnetSize-4)) + 2;
      const testIP = `${a}.${b}.${c}.${d + n*subnetSize + hostIn}`;
      const correctNet = `${a}.${b}.${c}.${d + n*subnetSize}/${cidr}`;
      return {
        question: `¿A qué subred pertenece la IP ${testIP}/${cidr}?`,
        answer: correctNet,
        explanation: `Bloques de ${subnetSize} direcciones en el último octeto. Esa IP cae en ${correctNet}.`,
        hint: `Divide el último octeto en bloques de ${subnetSize}.`
      };
    }
  }],
  hard: [{
    generate: () => {
      const nets = ['192.168.0.0/22','10.0.0.0/20','172.16.0.0/21'];
      const network = nets[Math.floor(Math.random()*nets.length)];
      const baseCidr = parseInt(network.split('/')[1],10);
      const subWanted = [4,8,16][Math.floor(Math.random()*3)];
      const newCidr = baseCidr + Math.ceil(Math.log2(subWanted));
      const hostsPerSubnet = Math.pow(2, 32 - newCidr) - 2;
      return {
        question: `Si divides ${network} en ${subWanted} subredes iguales, ¿cuántos hosts útiles tiene cada subred?`,
        answer: String(hostsPerSubnet),
        explanation: `Se requieren ${Math.ceil(Math.log2(subWanted))} bits extra ⇒ /${newCidr}. Hosts útiles: ${hostsPerSubnet}.`,
        hint: `Bits extra = ceil(log2(subredes)).`
      };
    }
  }]
};

// ---------- Lógica de dificultad ----------
function getDifficulty() {
  if (appState.stats.total < 3) return 'easy';
  const acc = appState.stats.correct / appState.stats.total;
  const s = appState.stats.streak;
  if (acc >= .8 && s >= 3) return appState.userLevel >= 3 ? 'hard' : 'medium';
  if (acc >= .6 && s >= 2) return 'medium';
  return 'easy';
}

function newQuestion(){
  const diff = getDifficulty(); appState.difficulty = diff;
  const tpl = questionTemplates[diff][Math.floor(Math.random()*questionTemplates[diff].length)];
  appState.currentQuestion = tpl.generate();

  document.getElementById('currentQuestion').textContent = appState.currentQuestion.question;
  const badge = document.getElementById('difficultyBadge');
  badge.textContent = diff.charAt(0).toUpperCase()+diff.slice(1);
  badge.className = `difficulty-indicator difficulty-${diff}`;

  document.getElementById('answerInput').value = '';
  document.getElementById('feedback').innerHTML = '';
  document.getElementById('hintContent').classList.remove('show');

  showToast(`Nueva pregunta de nivel ${diff}`, 'info', 1800);
}

// ---------- Interacción ----------
function toggleHint(){
  const cont = document.getElementById('hintContent');
  const text = document.getElementById('hintText');
  if (appState.currentQuestion?.hint){
    text.textContent = appState.currentQuestion.hint;
    cont.classList.toggle('show');
    if (cont.classList.contains('show')) { appState.stats.hintsUsed++; showToast('Pista mostrada (-5 XP)','warning',1800); }
  }
}

function checkPartialAnswer(userAnswer, correctAnswer){
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?/;
  if (ipPattern.test(userAnswer) && ipPattern.test(correctAnswer)) {
    const u = userAnswer.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?/);
    const c = correctAnswer.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/(\d{1,2}))?/);
    if (u && c) {
      let octets = 0; for (let i=1;i<=4;i++) if (u[i]===c[i]) octets++;
      const cidrMatch = u[6]===c[6];
      if (octets>=3 && cidrMatch) return { isPartial:true, message:'Formato correcto y la mayoría de octetos coinciden.' };
      if (octets>=2) return { isPartial:true, message:'Formato correcto pero hay octetos incorrectos.' };
    }
  }
  return { isPartial:false };
}

function getDifficultyXP(d){ return ({easy:10, medium:20, hard:35}[d]||10); }
function getXPForLevel(level){ return level*100; }
function getLevelName(level){
  if (level < 5) return 'Principiante';
  if (level < 10) return 'Aprendiz de Subredes';
  if (level < 15) return 'Experto en CIDR';
  return 'Maestro de Redes';
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
    if (document.getElementById('hintContent').classList.contains('show')) xp = Math.max(1, xp-5);
    appState.userXP += xp;
    cls='success';
    msg = `<div style="display:flex;justify-content:space-between;align-items:center;">
      <div>✅ ¡Correcto! ${appState.currentQuestion.explanation}</div>
      <div style="background:rgba(40,167,69,.2);padding:4px 10px;border-radius:14px;">+${xp} XP</div>
    </div>${appState.stats.streak>1?`<div style="margin-top:8px;"><strong>🔥 Racha: ${appState.stats.streak}</strong></div>`:''}`;
    showToast(`¡Correcto! +${xp} XP`, 'success');
  } else if (partial.isPartial){
    appState.stats.streak = 0; xp = 1; appState.userXP += xp;
    cls='partial';
    msg = `<div>⚠️ Parcialmente correcto. ${partial.message}</div>
           <div><strong>Tu respuesta:</strong> ${val}</div>
           <div><strong>Correcta:</strong> ${appState.currentQuestion.answer}</div>
           <div style="margin-top:8px;">${appState.currentQuestion.explanation}</div>`;
    showToast('Parcialmente correcto +1 XP', 'warning');
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
function saveState(){ try{ localStorage.setItem('validacion_state', JSON.stringify(appState)); }catch{} }
function loadState(){
  try{
    const raw = localStorage.getItem('validacion_state');
    if (raw){
      const parsed = JSON.parse(raw);
      // Mantén estructura pero copia valores
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
  const a = document.createElement('a'); a.href = url; a.download = 'subnetting_progress.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
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
      if (a.getAttribute('href')?.endsWith(path)){ a.classList.add('is-active'); a.setAttribute('aria-current','page'); }
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
