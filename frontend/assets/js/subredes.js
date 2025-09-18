// ../assets/js/subredes.js

// Estado global
const appState = { devices: [] };

// Utilidad: toasts
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">
        ${type === 'success' ? '✅' :
           type === 'error'   ? '❌' :
           type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span>${message}</span>
    </div>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Drag & Drop
let draggedElement = null;
let isDragging = false;

function bindPalette() {
  document.querySelectorAll('.device-item[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = e.currentTarget;
      isDragging = true;
      showToast(`Arrastrando ${draggedElement.dataset.type.toUpperCase()}`, 'info', 1800);
    });
    item.addEventListener('dragend', () => { isDragging = false; });
  });
}

const canvas = document.getElementById('canvas');

function bindCanvas() {
  if (!canvas) return;

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (isDragging) canvas.classList.add('drag-over');
  });

  canvas.addEventListener('dragleave', (e) => {
    if (!canvas.contains(e.relatedTarget)) canvas.classList.remove('drag-over');
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('drag-over');
    if (!draggedElement) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 30;

    if (x < 0 || y < 0 || x > rect.width - 80 || y > rect.height - 80) {
      showToast('¡Posición inválida! Coloca el dispositivo dentro del área', 'error');
      return;
    }

    const device = {
      type: draggedElement.dataset.type,
      x: Math.max(0, Math.min(x, rect.width - 80)),
      y: Math.max(0, Math.min(y, rect.height - 80)),
      id: Date.now() + Math.random(),
      ip: generateDeviceIP(draggedElement.dataset.type)
    };

    appState.devices.push(device);
    renderDevices();
    updateSubnetInfo();

    showToast(`${device.type.toUpperCase()} agregado con IP ${device.ip}`, 'success');
  });

  // Des-seleccionar al hacer click vacío
  canvas.addEventListener('click', () => {
    document.querySelectorAll('.network-device').forEach(d => d.classList.remove('selected'));
  });
}

function generateDeviceIP(type) {
  const baseNetworks = ['192.168.1', '192.168.2', '10.0.0', '172.16.1'];
  const base = baseNetworks[Math.floor(Math.random() * baseNetworks.length)];
  const host = Math.floor(Math.random() * 200) + 10;
  return `${base}.${host}`;
}

function renderDevices() {
  // Limpia
  canvas.querySelectorAll('.network-device').forEach(d => d.remove());

  appState.devices.forEach(device => {
    const el = document.createElement('div');
    el.className = `network-device ${device.type}`;
    el.style.left = device.x + 'px';
    el.style.top = device.y + 'px';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${device.type} ${device.ip}`);

    el.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:10px;">${device.type.toUpperCase()}</div>
        <div style="font-size:8px;opacity:.8;">${device.ip}</div>
      </div>
    `;

    el.addEventListener('click', (e) => {
      document.querySelectorAll('.network-device').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      showToast(`Dispositivo ${device.type.toUpperCase()} seleccionado - IP: ${device.ip}`, 'info', 2500);
    });

    el.addEventListener('dblclick', (e) => {
      removeDevice(device.id);
    });

    // Teclado: Enter = seleccionar, Supr = borrar
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        el.click();
        e.preventDefault();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        removeDevice(device.id);
        e.preventDefault();
      }
    });

    canvas.appendChild(el);
  });
}

function removeDevice(id) {
  const device = appState.devices.find(d => d.id === id);
  appState.devices = appState.devices.filter(d => d.id !== id);
  renderDevices();
  updateSubnetInfo();
  if (device) showToast(`${device.type.toUpperCase()} eliminado`, 'warning');
}

function clearCanvas() {
  if (appState.devices.length === 0) {
    showToast('El área ya está vacía', 'warning');
    return;
  }
  const count = appState.devices.length;
  appState.devices = [];
  renderDevices();
  updateSubnetInfo();
  showToast(`${count} dispositivos eliminados`, 'success');
}

function autoSubnet() {
  clearCanvas();
  const positions = [
    {type: 'router', x: 200, y: 100},
    {type: 'switch', x: 100, y: 200},
    {type: 'switch', x: 300, y: 200},
    {type: 'host', x: 50,  y: 300},
    {type: 'host', x: 150, y: 300},
    {type: 'host', x: 250, y: 300},
    {type: 'host', x: 350, y: 300}
  ];

  positions.forEach((pos, index) => {
    setTimeout(() => {
      appState.devices.push({
        ...pos,
        id: Date.now() + Math.random(),
        ip: generateDeviceIP(pos.type)
      });
      renderDevices();
      updateSubnetInfo();
    }, index * 160);
  });

  showToast('Creando topología automática...', 'info', 1600);
  setTimeout(() => { showToast('¡Topología creada! 3 subredes detectadas', 'success'); }, 1200);
}

function validateTopology() {
  if (appState.devices.length === 0) {
    showToast('¡Agrega algunos dispositivos primero!', 'warning');
    return;
  }

  const hosts = appState.devices.filter(d => d.type === 'host').length;
  const routers = appState.devices.filter(d => d.type === 'router').length;
  const switches = appState.devices.filter(d => d.type === 'switch').length;

  let feedback = [];
  let score = 0;

  if (routers >= 1) { feedback.push('✅ Tienes routers para conectar redes'); score += 30; }
  else { feedback.push('❌ Necesitas al menos 1 router'); }

  if (hosts >= 2) { feedback.push('✅ Suficientes hosts para comunicación'); score += 30; }
  else { feedback.push('❌ Necesitas al menos 2 hosts'); }

  if (switches >= 1) { feedback.push('✅ Switches para conectar dispositivos'); score += 20; }

  if (hosts <= switches * 4) { feedback.push('✅ Buena proporción hosts/switches'); score += 20; }
  else { feedback.push('⚠️ Demasiados hosts por switch'); }

  const message = feedback.join('<br>') + `<br><strong>Puntuación: ${score}/100</strong>`;

  const help = document.getElementById('topologyHelp');
  if (help) help.innerHTML = message;

  if (score >= 80) showToast('¡Excelente topología!', 'success');
  else if (score >= 60) showToast('Buena topología, puede mejorar', 'warning');
  else showToast('Topología necesita mejoras', 'error');
}

function updateSubnetInfo() {
  const hostCount = appState.devices.filter(d => d.type === 'host').length;
  const routerCount = appState.devices.filter(d => d.type === 'router').length;
  const switchCount = appState.devices.filter(d => d.type === 'switch').length;

  const subnetsNeeded = Math.max(1, routerCount + Math.ceil(switchCount/2));
  const hostsPerSubnet = Math.max(1, Math.ceil(hostCount / subnetsNeeded));
  const mask = Math.max(24, 32 - Math.ceil(Math.log2(hostsPerSubnet + 2))); // clamp simple (evita />32)

  const el = document.getElementById('subnetInfo');
  if (el) {
    el.innerHTML = `
      📊 <strong>Análisis de Red:</strong><br>
      Dispositivos: ${appState.devices.length} (H:${hostCount} R:${routerCount} S:${switchCount})<br>
      Subredes recomendadas: ${subnetsNeeded} | Hosts por subred: ${hostsPerSubnet}<br>
      Red sugerida: 192.168.0.0/${mask}
    `;
  }
}

// Controles (botones)
function bindControls() {
  document.querySelector('[data-action="clear"]')?.addEventListener('click', clearCanvas);
  document.querySelector('[data-action="auto"]')?.addEventListener('click', autoSubnet);
  document.querySelector('[data-action="validate"]')?.addEventListener('click', validateTopology);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  bindPalette();
  bindCanvas();
  bindControls();
  updateSubnetInfo();

  // Marca link activo en el menú (por si cambian rutas)
  try {
    const path = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(a => {
      if (a.getAttribute('href') && a.getAttribute('href').endsWith(path)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch {}
});
