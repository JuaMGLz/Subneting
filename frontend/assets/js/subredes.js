// ../assets/js/subredes.js - Versión Mejorada con Enfoque Educativo

// Estado global mejorado
const appState = { 
  devices: [], 
  currentNetwork: { base: '192.168.1.0', cidr: 24 },
  subnets: [],
  selectedSubnet: null,
  learningMode: 'manual' // manual, intermediate, advanced
};

// Configuraciones de redes base comunes
const networkTemplates = {
  'small': { base: '192.168.1.0', cidr: 24, name: 'Red Pequeña (Clase C)' },
  'medium': { base: '172.16.0.0', cidr: 16, name: 'Red Mediana (Clase B)' },
  'large': { base: '10.0.0.0', cidr: 8, name: 'Red Grande (Clase A)' }
};

// Utilidades para cálculos de subredes
const SubnetCalculator = {
  // Convierte CIDR a máscara decimal
  cidrToSubnetMask(cidr) {
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const bits = Math.min(8, Math.max(0, cidr - i * 8));
      mask.push(256 - Math.pow(2, 8 - bits));
    }
    return mask.join('.');
  },

  // Calcula información de subred
  calculateSubnetInfo(baseNetwork, cidr, requiredSubnets) {
    const hostBits = 32 - cidr;
    const subnetBits = Math.ceil(Math.log2(requiredSubnets));
    const newCidr = cidr + subnetBits;
    const hostsPerSubnet = Math.pow(2, hostBits - subnetBits) - 2;
    const totalSubnets = Math.pow(2, subnetBits);
    
    return {
      originalCidr: cidr,
      newCidr: newCidr,
      subnetBits: subnetBits,
      hostBitsUsed: hostBits - subnetBits,
      hostsPerSubnet: hostsPerSubnet,
      totalSubnets: totalSubnets,
      subnetMask: this.cidrToSubnetMask(newCidr)
    };
  },

  // Genera lista de subredes
  generateSubnets(baseNetwork, info) {
    const subnets = [];
    const baseOctets = baseNetwork.split('.').map(Number);
    const jump = Math.pow(2, info.hostBitsUsed);
    
    for (let i = 0; i < info.totalSubnets; i++) {
      const networkAddress = [...baseOctets];
      let carry = i * jump;
      
      // Distribuir el salto en los octetos (empezando desde el último)
      for (let j = 3; j >= 0; j--) {
        networkAddress[j] += carry % 256;
        carry = Math.floor(carry / 256);
      }
      
      const networkStr = networkAddress.join('.');
      const broadcastAddress = [...networkAddress];
      let broadcastCarry = jump - 1;
      
      for (let j = 3; j >= 0; j--) {
        broadcastAddress[j] += broadcastCarry % 256;
        broadcastCarry = Math.floor(broadcastCarry / 256);
      }
      
      const firstHost = [...networkAddress];
      firstHost[3] += 1;
      
      const lastHost = [...broadcastAddress];
      lastHost[3] -= 1;
      
      subnets.push({
        id: i,
        network: networkStr,
        broadcast: broadcastAddress.join('.'),
        firstHost: firstHost.join('.'),
        lastHost: lastHost.join('.'),
        cidr: info.newCidr,
        hostsAvailable: info.hostsPerSubnet,
        devices: []
      });
    }
    
    return subnets;
  }
};

// Utilidad mejorada: toasts con iconos educativos
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '🎉', error: '⚠️', warning: '💡', info: '📚',
    calculation: '🧮', subnet: '🌐', device: '💻'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">${icons[type] || icons.info}</span>
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

// Drag & Drop mejorado con validaciones
let draggedElement = null;
let isDragging = false;

function bindPalette() {
  document.querySelectorAll('.device-item[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = e.currentTarget;
      isDragging = true;
      const deviceType = draggedElement.dataset.type.toUpperCase();
      showToast(`Arrastrando ${deviceType} - Recuerda: los hosts necesitan estar en subredes`, 'device', 2500);
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
      showToast('¡Coloca el dispositivo dentro del área de red!', 'error');
      return;
    }

    // Asignar IP según el tipo de dispositivo y subred
    const deviceType = draggedElement.dataset.type;
    const device = {
      type: deviceType,
      x: Math.max(0, Math.min(x, rect.width - 80)),
      y: Math.max(0, Math.min(y, rect.height - 80)),
      id: Date.now() + Math.random(),
      ip: assignDeviceIP(deviceType),
      subnet: null
    };

    appState.devices.push(device);
    renderDevices();
    updateNetworkAnalysis();
    
    showToast(`${deviceType.toUpperCase()} agregado con IP ${device.ip}`, 'success');
    
    // Consejo educativo basado en el dispositivo
    setTimeout(() => {
      if (deviceType === 'host') {
        showToast('💡 Los hosts necesitan estar en la misma subred para comunicarse directamente', 'info', 3000);
      } else if (deviceType === 'router') {
        showToast('💡 Los routers conectan diferentes subredes - cada interfaz tiene una IP distinta', 'info', 3000);
      }
    }, 1500);
  });

  canvas.addEventListener('click', () => {
    document.querySelectorAll('.network-device').forEach(d => d.classList.remove('selected'));
    appState.selectedSubnet = null;
    renderSubnetHighlight();
  });
}

// Sistema inteligente de asignación de IPs
function assignDeviceIP(deviceType) {
  const currentNet = appState.currentNetwork;
  
  if (deviceType === 'router') {
    // Los routers obtienen la primera IP disponible de cada subred
    return generateRouterIP();
  } else {
    // Hosts y switches obtienen IPs según la subred asignada
    return generateHostIP();
  }
}

function generateRouterIP() {
  const baseOctets = appState.currentNetwork.base.split('.').map(Number);
  // Para routers, usar IPs tipo .1, .65, .129, etc. (primera IP útil de cada subred)
  const routerNum = appState.devices.filter(d => d.type === 'router').length;
  baseOctets[3] = (routerNum * 64) + 1; // Asumiendo subredes /26
  return baseOctets.join('.');
}

function generateHostIP() {
  const baseOctets = appState.currentNetwork.base.split('.').map(Number);
  const hostNum = appState.devices.filter(d => d.type !== 'router').length;
  baseOctets[3] = (hostNum % 50) + 10; // IPs del 10 al 59 para hosts
  return baseOctets.join('.');
}

function renderDevices() {
  canvas.querySelectorAll('.network-device').forEach(d => d.remove());

  appState.devices.forEach(device => {
    const el = document.createElement('div');
    el.className = `network-device ${device.type}`;
    el.style.left = device.x + 'px';
    el.style.top = device.y + 'px';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${device.type} ${device.ip}`);

    // Iconos específicos para cada tipo de dispositivo
    const icons = { host: '💻', router: '🌐', switch: '🔗' };
    
    el.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:16px;">${icons[device.type]}</div>
        <div style="font-size:9px;font-weight:bold;">${device.type.toUpperCase()}</div>
        <div style="font-size:8px;opacity:.9;">${device.ip}</div>
      </div>
    `;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.network-device').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      
      // Mostrar información educativa del dispositivo
      const info = getDeviceInfo(device);
      showToast(info, 'info', 3500);
    });

    el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      removeDevice(device.id);
    });

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

function getDeviceInfo(device) {
  const info = {
    host: `Host ${device.ip} - Dispositivo final que envía y recibe datos`,
    router: `Router ${device.ip} - Conecta diferentes subredes y toma decisiones de enrutamiento`,
    switch: `Switch ${device.ip} - Conecta dispositivos en la misma subred usando direcciones MAC`
  };
  return info[device.type];
}

function removeDevice(id) {
  const device = appState.devices.find(d => d.id === id);
  appState.devices = appState.devices.filter(d => d.id !== id);
  renderDevices();
  updateNetworkAnalysis();
  if (device) showToast(`${device.type.toUpperCase()} eliminado`, 'warning');
}

function clearCanvas() {
  if (appState.devices.length === 0) {
    showToast('El área de red ya está vacía', 'warning');
    return;
  }
  const count = appState.devices.length;
  appState.devices = [];
  appState.subnets = [];
  renderDevices();
  updateNetworkAnalysis();
  showToast(`${count} dispositivos eliminados - Red restaurada`, 'success');
}

// Función mejorada de auto-subred con ejemplos educativos
function autoSubnet() {
  clearCanvas();
  
  showToast('🎯 Creando ejemplo: Red empresarial con departamentos', 'info', 2000);
  
  // Ejemplo educativo: empresa con 3 departamentos
  const departments = [
    { name: 'RR.HH.', hosts: 25, x: 100, y: 80 },
    { name: 'Ventas', hosts: 15, x: 300, y: 80 },
    { name: 'Gerencia', hosts: 8, x: 200, y: 200 }
  ];
  
  // Agregar router central
  setTimeout(() => {
    appState.devices.push({
      type: 'router',
      x: 200, y: 140,
      id: Date.now() + Math.random(),
      ip: '192.168.1.1',
      subnet: null
    });
    renderDevices();
    showToast('Router central agregado - Conectará las 3 subredes', 'calculation', 2000);
  }, 500);
  
  // Agregar switches para cada departamento
  departments.forEach((dept, index) => {
    setTimeout(() => {
      const switchDevice = {
        type: 'switch',
        x: dept.x, y: dept.y + 60,
        id: Date.now() + Math.random() + index,
        ip: `192.168.${index + 1}.2`,
        subnet: index,
        department: dept.name
      };
      appState.devices.push(switchDevice);
      
      // Agregar algunos hosts
      const hostsToAdd = Math.min(3, Math.ceil(dept.hosts / 10));
      for (let i = 0; i < hostsToAdd; i++) {
        setTimeout(() => {
          appState.devices.push({
            type: 'host',
            x: dept.x + (i - 1) * 40,
            y: dept.y + 120,
            id: Date.now() + Math.random() + i,
            ip: `192.168.${index + 1}.${10 + i}`,
            subnet: index,
            department: dept.name
          });
          renderDevices();
        }, i * 200);
      }
      
      renderDevices();
      showToast(`Switch de ${dept.name} agregado (necesita ${dept.hosts} hosts)`, 'subnet');
    }, 1000 + index * 800);
  });
  
  // Calcular y mostrar información de subredes
  setTimeout(() => {
    calculateAndShowSubnets(3);
    showToast('¡Topología empresarial creada! Analiza las 3 subredes generadas', 'success', 4000);
  }, 4000);
}

function calculateAndShowSubnets(requiredSubnets) {
  const info = SubnetCalculator.calculateSubnetInfo(
    appState.currentNetwork.base, 
    appState.currentNetwork.cidr, 
    requiredSubnets
  );
  
  appState.subnets = SubnetCalculator.generateSubnets(appState.currentNetwork.base, info);
  
  // Mostrar información educativa
  showToast(`📊 Cálculo: ${requiredSubnets} subredes necesitan ${info.subnetBits} bits prestados`, 'calculation', 3000);
  setTimeout(() => {
    showToast(`🧮 Nueva máscara: /${info.newCidr} (${info.subnetMask})`, 'calculation', 3000);
  }, 1500);
  setTimeout(() => {
    showToast(`💡 Cada subred tendrá ${info.hostsPerSubnet} hosts disponibles`, 'calculation', 3000);
  }, 3000);
}

function validateTopology() {
  if (appState.devices.length === 0) {
    showToast('¡Agrega algunos dispositivos primero para validar!', 'warning');
    return;
  }

  const hosts = appState.devices.filter(d => d.type === 'host').length;
  const routers = appState.devices.filter(d => d.type === 'router').length;
  const switches = appState.devices.filter(d => d.type === 'switch').length;

  let feedback = [];
  let score = 0;
  let tips = [];

  // Validaciones educativas mejoradas
  if (routers >= 1) { 
    feedback.push('✅ Tienes routers para conectar subredes diferentes'); 
    score += 25; 
  } else { 
    feedback.push('❌ Necesitas al menos 1 router para conectar subredes');
    tips.push('💡 Los routers permiten comunicación entre subredes');
  }

  if (hosts >= 2) { 
    feedback.push('✅ Suficientes hosts para formar una red'); 
    score += 25; 
  } else { 
    feedback.push('❌ Necesitas al menos 2 hosts para comunicación');
    tips.push('💡 Los hosts son los dispositivos finales (computadoras, impresoras, etc.)');
  }

  if (switches >= 1) { 
    feedback.push('✅ Switches para conectar hosts en subredes'); 
    score += 20; 
  } else {
    tips.push('💡 Los switches conectan múltiples hosts en la misma subred');
  }

  // Validación de proporción hosts/switches
  if (switches > 0 && hosts <= switches * 24) { 
    feedback.push('✅ Buena proporción hosts por switch (<24 por switch)'); 
    score += 15; 
  } else if (switches > 0) { 
    feedback.push('⚠️ Demasiados hosts por switch (>24 por switch)');
    tips.push('💡 Un switch típico maneja 24-48 hosts eficientemente');
  }

  // Validación de diseño de subredes
  const subnetsNeeded = Math.max(1, Math.ceil(hosts / 50));
  if (routers >= Math.ceil(subnetsNeeded / 3)) {
    feedback.push('✅ Suficientes routers para el número de subredes');
    score += 15;
  } else {
    feedback.push('⚠️ Podrías necesitar más routers para tantas subredes');
    tips.push('💡 Un router puede manejar 2-4 subredes típicamente');
  }

  const message = [
    ...feedback,
    `<br><strong>📊 Puntuación de Topología: ${score}/100</strong>`,
    tips.length > 0 ? '<br><strong>💡 Consejos:</strong>' : '',
    ...tips
  ].join('<br>');

  const help = document.getElementById('topologyHelp');
  if (help) help.innerHTML = message;

  if (score >= 85) showToast('🎉 ¡Excelente topología! Cumple principios de subnetting', 'success');
  else if (score >= 65) showToast('👍 Buena topología, algunas mejoras posibles', 'warning');
  else showToast('📚 Topología necesita mejoras - revisa los consejos', 'error');
}

function updateNetworkAnalysis() {
  const hostCount = appState.devices.filter(d => d.type === 'host').length;
  const routerCount = appState.devices.filter(d => d.type === 'router').length;
  const switchCount = appState.devices.filter(d => d.type === 'switch').length;

  // Cálculos educativos más precisos
  const subnetsNeeded = Math.max(1, Math.ceil(hostCount / 50) + routerCount);
  const subnetInfo = SubnetCalculator.calculateSubnetInfo(
    appState.currentNetwork.base, 
    appState.currentNetwork.cidr, 
    subnetsNeeded
  );

  const el = document.getElementById('subnetInfo');
  if (el) {
    el.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
        <div>
          <strong>Red Base:</strong> ${appState.currentNetwork.base}/${appState.currentNetwork.cidr}<br>
          <strong>Dispositivos:</strong> ${appState.devices.length} total<br>
          <strong>Hosts:</strong> ${hostCount} | <strong>Routers:</strong> ${routerCount} | <strong>Switches:</strong> ${switchCount}
        </div>
        <div>
          <strong>Análisis de Subredes:</strong><br>
          <strong>Subredes necesarias:</strong> ${subnetsNeeded}<br>
          <strong>Bits prestados:</strong> ${subnetInfo.subnetBits}<br>
          <strong>Nueva máscara:</strong> /${subnetInfo.newCidr} (${subnetInfo.subnetMask})<br>
          <strong>Hosts por subred:</strong> ${subnetInfo.hostsPerSubnet}
        </div>
      </div>
    `;
  }
}

function renderSubnetHighlight() {
  // Función para resaltar subredes (implementar si se necesita)
}

// Controles mejorados
function bindControls() {
  document.querySelector('[data-action="clear"]')?.addEventListener('click', clearCanvas);
  document.querySelector('[data-action="auto"]')?.addEventListener('click', autoSubnet);
  document.querySelector('[data-action="validate"]')?.addEventListener('click', validateTopology);
  
  // Agregar selector de red base
  const networkSelector = document.createElement('select');
  networkSelector.className = 'btn btn-outline w-100 mt-xs';
  networkSelector.innerHTML = Object.entries(networkTemplates).map(([key, net]) => 
    `<option value="${key}">${net.name}</option>`
  ).join('');
  
  networkSelector.addEventListener('change', (e) => {
    const selected = networkTemplates[e.target.value];
    appState.currentNetwork = { base: selected.base, cidr: selected.cidr };
    updateNetworkAnalysis();
    showToast(`Red cambiada a ${selected.name}`, 'subnet');
  });
  
  const controlsDiv = document.querySelector('.v-stack.gap-xs');
  if (controlsDiv) {
    const label = document.createElement('h4');
    label.textContent = 'Red Base';
    label.className = 'subtitle mt-md mb-xs';
    controlsDiv.insertBefore(label, controlsDiv.lastElementChild);
    controlsDiv.insertBefore(networkSelector, controlsDiv.lastElementChild);
  }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
  bindPalette();
  bindCanvas();
  bindControls();
  updateNetworkAnalysis();

  // Mostrar tip educativo inicial
  setTimeout(() => {
    showToast('🎯 Arrastra dispositivos para crear tu topología y aprender subnetting', 'info', 4000);
  }, 1000);

  // Marcar link activo
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