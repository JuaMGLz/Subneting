// Toasts
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span>${message}</span>
    </div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, duration);
}

// Validaciones
function validateNetwork(networkStr) {
  const pattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;
  const match = networkStr.match(pattern);
  if (!match) return { isValid: false, message: 'Formato incorrecto. Usa: 192.168.1.0/24' };

  const [, ip, cidr] = match;
  const [a, b, c, d] = ip.split('.').map(Number);
  const validOct = [a, b, c, d].every(n => n >= 0 && n <= 255);
  if (!validOct) return { isValid: false, message: 'Octetos deben estar entre 0-255' };

  const cidrNum = parseInt(cidr, 10);
  if (cidrNum < 8 || cidrNum > 30) return { isValid: false, message: 'CIDR debe estar entre /8 y /30' };

  const networkInt = (a << 24) + (b << 16) + (c << 8) + d;
  const mask = (0xFFFFFFFF << (32 - cidrNum)) >>> 0;
  const actualNetwork = networkInt & mask;
  if (networkInt !== actualNetwork) {
    return { isValid: false, message: `No es dirección de red. ¿Querías decir ${ipToString(actualNetwork)}/${cidrNum}?` };
  }

  const hosts = Math.pow(2, 32 - cidrNum) - 2;
  return { isValid: true, message: `✓ Red válida con ${hosts} hosts disponibles`, data: { networkInt, cidr: cidrNum, hostsAvailable: hosts } };
}

function validateInput(input, validationFn, errorElementId, successElementId) {
  const errorEl = document.getElementById(errorElementId);
  const successEl = document.getElementById(successElementId);
  const inputGroup = input.closest('.input-group');

  const result = validationFn(input.value);
  if (result.isValid) {
    inputGroup.classList.remove('error'); inputGroup.classList.add('success');
    errorEl.textContent = ''; successEl.textContent = result.message || '✓ Válido';
    return true;
  } else {
    inputGroup.classList.remove('success'); inputGroup.classList.add('error');
    successEl.textContent = ''; errorEl.textContent = result.message || 'Formato inválido';
    return false;
  }
}

// Cálculo
function ipToString(ip) {
  return [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255].join('.');
}

function displayResults(results) {
  const table = document.getElementById('resultsTable');
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';

  results.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="background:hsl(${(r.subnet*40)%360} 70% 20% / .35); font-weight:800;">Subred ${r.subnet}</td>
      <td><strong>${r.network}</strong></td>
      <td>${r.firstHost}</td>
      <td>${r.lastHost}</td>
      <td>${r.broadcast}</td>
      <td>${r.mask}</td>
      <td><span style="color:#2ecc71; font-weight:800;">${r.hostsAvailable} hosts</span></td>
    `;
    tr.style.opacity = '0'; tr.style.transform = 'translateX(-14px)'; tr.style.transition = 'all .28s ease';
    tbody.appendChild(tr);
    setTimeout(() => { tr.style.opacity = '1'; tr.style.transform = 'translateX(0)'; }, idx * 60);
  });

  table.classList.add('show');
}

function calculateSubnets() {
  const networkInput = document.getElementById('networkInput').value.trim();
  const subnetCount = parseInt(document.getElementById('subnetCount').value, 10);
  const btn = document.getElementById('calculateBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');

  const validation = validateNetwork(networkInput);
  if (!validation.isValid) { showToast(validation.message, 'error'); return; }

  // Loading UI
  btn.disabled = true; btn.classList.add('loading'); btn.textContent = 'Calculando...';
  progressBar.hidden = false; progressFill.style.width = '0%';

  let progress = 0;
  const tick = setInterval(() => {
    progress = Math.min(90, progress + Math.random() * 18);
    progressFill.style.width = progress + '%';
  }, 110);

  setTimeout(() => {
    try {
      const [net, cidrStr] = networkInput.split('/');
      const [a, b, c, d] = net.split('.').map(Number);
      const hostBits = 32 - parseInt(cidrStr, 10);
      const subnetBits = Math.ceil(Math.log2(subnetCount));
      const newCidr = 32 - hostBits + subnetBits;
      const hostsPerSubnet = Math.pow(2, hostBits - subnetBits) - 2;

      if (newCidr > 30) throw new Error('Demasiadas subredes para esta red. Reduce el número o usa una red mayor.');
      if (hostsPerSubnet < 2) throw new Error('Muy pocos hosts por subred. Reduce el número de subredes.');

      const base = (a << 24) + (b << 16) + (c << 8) + d;
      const subnetSize = Math.pow(2, 32 - newCidr);
      const maskInt = (0xFFFFFFFF << (32 - newCidr)) >>> 0;

      const results = [];
      for (let i = 0; i < subnetCount; i++) {
        const network = base + (i * subnetSize);
        results.push({
          subnet: i + 1,
          network: `${ipToString(network)}/${newCidr}`,
          firstHost: ipToString(network + 1),
          lastHost: ipToString(network + subnetSize - 2),
          broadcast: ipToString(network + subnetSize - 1),
          mask: ipToString(maskInt),
          hostsAvailable: hostsPerSubnet
        });
      }

      clearInterval(tick); progressFill.style.width = '100%';
      setTimeout(() => {
        displayResults(results);
        showToast(`¡Listo! ${subnetCount} subredes con ${hostsPerSubnet} hosts c/u`, 'success');

        // Reset UI
        btn.disabled = false; btn.classList.remove('loading');
        btn.textContent = '🚀 Calcular Subredes Inteligentemente';
        progressBar.hidden = true;
      }, 420);

    } catch (err) {
      clearInterval(tick);
      showToast('Error: ' + err.message, 'error');
      btn.disabled = false; btn.classList.remove('loading');
      btn.textContent = '🚀 Calcular Subredes Inteligentemente';
      progressBar.hidden = true;
    }
  }, 1200);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Link activo automático
  try {
    const path = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(a => {
      if (a.getAttribute('href')?.endsWith(path)) {
        a.classList.add('is-active'); a.setAttribute('aria-current','page');
      }
    });
  } catch {}

  // Validación en tiempo real
  const networkEl = document.getElementById('networkInput');
  networkEl.addEventListener('input', e => validateInput(e.target, validateNetwork, 'networkError', 'networkSuccess'));

  // Botón calcular
  document.querySelector('[data-action="calculate"]')?.addEventListener('click', calculateSubnets);
});
