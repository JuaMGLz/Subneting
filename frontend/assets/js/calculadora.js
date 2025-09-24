// ../assets/js/calculadora.js - Versión Educativa Mejorada

// Estado global para modo educativo
const calculatorState = {
  currentMode: 'subnets', // 'subnets' o 'hosts'
  showSteps: true,
  lastCalculation: null
};

// Utilidades educativas mejoradas
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '🎉', error: '⚠️', warning: '💡', info: '📚',
    calculation: '🧮', binary: '🔢', formula: '📐', step: '🔍'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">${icons[type] || icons.info}</span>
      <span>${message}</span>
    </div>`;
  container.appendChild(toast);
  
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Calculadora educativa de subredes con métodos paso a paso
const SubnetEducator = {
  // Convierte número a binario con padding
  toBinary(num, bits = 8) {
    return num.toString(2).padStart(bits, '0');
  },

  // Convierte CIDR a máscara decimal paso a paso
  cidrToMask(cidr) {
    const binaryMask = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
    const octets = [];
    
    for (let i = 0; i < 4; i++) {
      const octetBinary = binaryMask.slice(i * 8, (i + 1) * 8);
      const octetDecimal = parseInt(octetBinary, 2);
      octets.push(octetDecimal);
    }
    
    return {
      decimal: octets.join('.'),
      binary: binaryMask,
      octets: octets
    };
  },

  // Método Manual: Calcula subredes paso a paso
  calculateBySubnets(networkStr, requiredSubnets) {
    showToast('🔍 Iniciando método manual de subnetting...', 'step', 2000);
    
    const [ipStr, cidrStr] = networkStr.split('/');
    const originalCidr = parseInt(cidrStr);
    const hostBits = 32 - originalCidr;
    
    // Calcular máscara original una sola vez
    const originalMask = this.cidrToMask(originalCidr);
    
    // Paso 1: Convertir a binario
    setTimeout(() => {
      showToast(`📝 Paso 1: Máscara original /${originalCidr} = ${originalMask.decimal}`, 'binary', 3000);
    }, 500);

    // Paso 2: Calcular bits necesarios (fórmula 2^n)
    const subnetBits = Math.ceil(Math.log2(requiredSubnets));
    const actualSubnets = Math.pow(2, subnetBits);
    
    setTimeout(() => {
      showToast(`🧮 Paso 2: Para ${requiredSubnets} subredes → 2^${subnetBits} = ${actualSubnets} subredes`, 'formula', 3000);
    }, 1500);

    // Paso 3: Calcular hosts por subred (fórmula 2^h - 2)
    const newHostBits = hostBits - subnetBits;
    const hostsPerSubnet = Math.pow(2, newHostBits) - 2;
    
    setTimeout(() => {
      showToast(`📐 Paso 3: Hosts por subred → 2^${newHostBits} - 2 = ${hostsPerSubnet} hosts`, 'formula', 3000);
    }, 2500);

    // Paso 4: Nueva máscara y salto
    const newCidr = originalCidr + subnetBits;
    const newMask = this.cidrToMask(newCidr);
    const jump = Math.pow(2, newHostBits);
    
    setTimeout(() => {
      showToast(`🎯 Paso 4: Nueva máscara /${newCidr} = ${newMask.decimal}`, 'calculation', 3000);
    }, 3500);

    // Validaciones de límites
    if (newCidr > 30) {
      throw new Error(`Demasiadas subredes para esta red. Con /${originalCidr} solo puedes crear máximo ${Math.pow(2, 30 - originalCidr)} subredes.`);
    }
    
    if (hostsPerSubnet < 2) {
      throw new Error(`Muy pocos hosts por subred (${hostsPerSubnet}). Reduce el número de subredes.`);
    }

    setTimeout(() => {
      showToast(`🔄 Paso 5: Salto de red = ${jump} (cada subred avanza ${jump} direcciones)`, 'calculation', 3000);
    }, 4500);
    
    // Validaciones de límites
    if (newCidr > 30) {
      throw new Error(`Demasiadas subredes para esta red. Con /${originalCidr} solo puedes crear máximo ${Math.pow(2, 30 - originalCidr)} subredes.`);
    }
    
    if (hostsPerSubnet < 2) {
      throw new Error(`Muy pocos hosts por subred (${hostsPerSubnet}). Reduce el número de subredes.`);
    }

    return {
      originalCidr,
      subnetBits,
      newCidr,
      newHostBits,
      hostsPerSubnet,
      actualSubnets,
      jump,
      newMask: newMask.decimal,
      steps: {
        step1: `Máscara original: ${originalMask.decimal}`,
        step2: `Bits necesarios: ${subnetBits} (2^${subnetBits} = ${actualSubnets})`,
        step3: `Hosts por subred: 2^${newHostBits} - 2 = ${hostsPerSubnet}`,
        step4: `Nueva máscara: /${newCidr} = ${newMask.decimal}`,
        step5: `Salto: ${jump}`
      }
    };
  },

  // Método VLSM: Calcular por hosts requeridos
  calculateByHosts(networkStr, requiredHosts) {
    showToast('🎯 Iniciando método VLSM (por hosts requeridos)...', 'step', 2000);
    
    const [ipStr, cidrStr] = networkStr.split('/');
    const originalCidr = parseInt(cidrStr);
    
    // Encontrar el número mínimo de bits para hosts
    const hostBits = Math.ceil(Math.log2(requiredHosts + 2)); // +2 por red y broadcast
    const newCidr = 32 - hostBits;
    const actualHosts = Math.pow(2, hostBits) - 2;
    
    setTimeout(() => {
      showToast(`📊 Para ${requiredHosts} hosts → necesitamos ${hostBits} bits → 2^${hostBits} - 2 = ${actualHosts} hosts`, 'formula', 4000);
    }, 1000);
    
    setTimeout(() => {
      showToast(`🎯 Nueva máscara: /${newCidr} (optimizada para ${actualHosts} hosts)`, 'calculation', 3000);
    }, 2000);

    return {
      originalCidr,
      newCidr,
      hostBits,
      actualHosts,
      requiredHosts,
      optimized: actualHosts >= requiredHosts
    };
  },

  // Generar subredes con información educativa
  generateSubnets(networkStr, calculation) {
    const [ipStr, cidrStr] = networkStr.split('/');
    const [a, b, c, d] = ipStr.split('.').map(Number);
    const baseNetwork = (a << 24) + (b << 16) + (c << 8) + d;
    
    const subnets = [];
    const subnetSize = Math.pow(2, 32 - calculation.newCidr);
    
    for (let i = 0; i < calculation.actualSubnets; i++) {
      const networkAddr = baseNetwork + (i * subnetSize);
      const broadcastAddr = networkAddr + subnetSize - 1;
      
      subnets.push({
        id: i + 1,
        network: `${this.ipToString(networkAddr)}/${calculation.newCidr}`,
        networkAddr: this.ipToString(networkAddr),
        firstHost: this.ipToString(networkAddr + 1),
        lastHost: this.ipToString(broadcastAddr - 1),
        broadcast: this.ipToString(broadcastAddr),
        mask: calculation.newMask,
        hostsAvailable: calculation.hostsPerSubnet,
        binaryNetwork: this.toBinary((networkAddr >>> 24) & 255) + '.' +
                       this.toBinary((networkAddr >>> 16) & 255) + '.' +
                       this.toBinary((networkAddr >>> 8) & 255) + '.' +
                       this.toBinary(networkAddr & 255),
        usageExamples: this.getUsageExamples(calculation.hostsPerSubnet)
      });
    }
    
    return subnets;
  },

  // Ejemplos de uso según el tamaño de subred
  getUsageExamples(hosts) {
    if (hosts >= 1000) return 'Red empresarial grande';
    if (hosts >= 250) return 'Departamento o edificio';
    if (hosts >= 50) return 'Oficina o área específica';
    if (hosts >= 10) return 'Equipo pequeño o VLAN';
    return 'Conexión punto a punto';
  },

  // Utilidad para convertir IP numérica a string
  ipToString(ip) {
    return [(ip >>> 24) & 255, (ip >>> 16) & 255, (ip >>> 8) & 255, ip & 255].join('.');
  }
};

// Validaciones mejoradas con contexto educativo
function validateNetwork(networkStr) {
  const pattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;
  const match = networkStr.match(pattern);
  
  if (!match) {
    return { 
      isValid: false, 
      message: 'Formato incorrecto. Ejemplo: 192.168.1.0/24 (IP/CIDR)' 
    };
  }

  const [, ip, cidr] = match;
  const [a, b, c, d] = ip.split('.').map(Number);
  
  // Validar octetos
  const validOctets = [a, b, c, d].every(n => n >= 0 && n <= 255);
  if (!validOctets) {
    return { 
      isValid: false, 
      message: 'Los octetos deben estar entre 0 y 255' 
    };
  }

  const cidrNum = parseInt(cidr, 10);
  if (cidrNum < 8 || cidrNum > 30) {
    return { 
      isValid: false, 
      message: 'CIDR debe estar entre /8 y /30 para subredes válidas' 
    };
  }

  // Verificar que sea una dirección de red válida
  const networkInt = (a << 24) + (b << 16) + (c << 8) + d;
  const mask = (0xFFFFFFFF << (32 - cidrNum)) >>> 0;
  const actualNetwork = networkInt & mask;
  
  if (networkInt !== actualNetwork) {
    const correctedIp = SubnetEducator.ipToString(actualNetwork);
    return { 
      isValid: false, 
      message: `No es dirección de red válida. ¿Querías ${correctedIp}/${cidrNum}?` 
    };
  }

  const totalHosts = Math.pow(2, 32 - cidrNum) - 2;
  const networkClass = a < 128 ? 'A' : a < 192 ? 'B' : 'C';
  
  return { 
    isValid: true, 
    message: `✓ Red Clase ${networkClass} válida con ${totalHosts.toLocaleString()} hosts`, 
    data: { networkInt, cidr: cidrNum, hostsAvailable: totalHosts, networkClass }
  };
}

function validateInput(input, validationFn, errorElementId, successElementId) {
  const errorEl = document.getElementById(errorElementId);
  const successEl = document.getElementById(successElementId);
  const inputGroup = input.closest('.input-group');

  const result = validationFn(input.value);
  
  if (result.isValid) {
    inputGroup?.classList.remove('error');
    inputGroup?.classList.add('success');
    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.textContent = result.message || '✓ Válido';
    return result;
  } else {
    inputGroup?.classList.remove('success');
    inputGroup?.classList.add('error');
    if (successEl) successEl.textContent = '';
    if (errorEl) errorEl.textContent = result.message || 'Formato inválido';
    return null;
  }
}

// Mostrar resultados con información educativa
function displayResults(subnets, calculation) {
  const table = document.getElementById('resultsTable');
  const tbody = document.getElementById('resultsBody');
  
  if (!tbody) return;
  
  tbody.innerHTML = '';

  // Agregar información de cálculos
  const infoRow = document.createElement('tr');
  infoRow.className = 'info-row';
  infoRow.innerHTML = `
    <td colspan="7" style="background: linear-gradient(90deg, rgba(0,224,255,0.1), rgba(123,97,255,0.1)); padding: 15px; text-align: left;">
      <strong>📊 Información del Cálculo:</strong><br>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 8px;">
        <div>🔢 Bits prestados: ${calculation.subnetBits}</div>
        <div>📐 Nueva máscara: /${calculation.newCidr}</div>
        <div>🌐 Subredes creadas: ${calculation.actualSubnets}</div>
        <div>💻 Hosts por subred: ${calculation.hostsPerSubnet}</div>
      </div>
    </td>
  `;
  tbody.appendChild(infoRow);

  // Agregar filas de subredes
  subnets.forEach((subnet, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="background:hsl(${(subnet.id * 40) % 360} 70% 20% / 0.35); font-weight:800;">
        Red ${subnet.id}
      </td>
      <td><strong>${subnet.networkAddr}/${calculation.newCidr}</strong></td>
      <td>${subnet.firstHost}</td>
      <td>${subnet.lastHost}</td>
      <td>${subnet.broadcast}</td>
      <td>${subnet.mask}</td>
      <td>
        <span style="color:#2ecc71; font-weight:800;">${subnet.hostsAvailable}</span>
        <br><small style="opacity:0.7;">${subnet.usageExamples}</small>
      </td>
    `;
    
    // Animación de entrada
    tr.style.opacity = '0';
    tr.style.transform = 'translateX(-20px)';
    tr.style.transition = 'all 0.3s ease';
    tbody.appendChild(tr);
    
    setTimeout(() => {
      tr.style.opacity = '1';
      tr.style.transform = 'translateX(0)';
    }, (idx + 1) * 80);
  });

  table.classList.add('show');
}

// Función principal de cálculo mejorada
function calculateSubnets() {
  const networkInput = document.getElementById('networkInput')?.value.trim();
  const subnetCountSelect = document.getElementById('subnetCount');
  const subnetCount = parseInt(subnetCountSelect?.value || '4', 10);
  
  const btn = document.getElementById('calculateBtn');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');

  if (!networkInput || !btn) return;

  // Validar entrada
  const validation = validateNetwork(networkInput);
  if (!validation || !validation.isValid) {
    showToast(validation?.message || 'Error de validación', 'error');
    return;
  }

  // UI de carga
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = 'Calculando paso a paso...';
  
  if (progressBar) {
    progressBar.hidden = false;
    if (progressFill) progressFill.style.width = '0%';
  }

  // Simular progreso educativo
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(85, progress + Math.random() * 12);
    if (progressFill) progressFill.style.width = progress + '%';
  }, 150);

  // Realizar cálculo educativo
  setTimeout(() => {
    try {
      // Usar el método educativo paso a paso
      const calculation = SubnetEducator.calculateBySubnets(networkInput, subnetCount);
      const subnets = SubnetEducator.generateSubnets(networkInput, calculation);
      
      // Guardar para referencia
      calculatorState.lastCalculation = { networkInput, calculation, subnets };
      
      // Completar progreso
      clearInterval(progressInterval);
      if (progressFill) progressFill.style.width = '100%';
      
      setTimeout(() => {
        displayResults(subnets, calculation);
        showToast(
          `🎉 ¡Cálculo completado! ${calculation.actualSubnets} subredes con ${calculation.hostsPerSubnet} hosts cada una`,
          'success',
          5000
        );
        
        // Tip educativo adicional
        setTimeout(() => {
          showToast(
            `💡 Tip: Usaste ${calculation.subnetBits} bits del host para crear las subredes (método manual aplicado)`,
            'info',
            4000
          );
        }, 2000);

        // Resetear UI
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = '🚀 Calcular Subredes Inteligentemente';
        if (progressBar) progressBar.hidden = true;
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      showToast('Error: ' + error.message, 'error');
      
      // Resetear UI
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.textContent = '🚀 Calcular Subredes Inteligentemente';
      if (progressBar) progressBar.hidden = true;
    }
  }, 5500); // Tiempo suficiente para mostrar todos los pasos educativos
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
  // Activar link del navbar
  try {
    const path = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(a => {
      if (a.getAttribute('href')?.endsWith(path)) {
        a.classList.add('is-active');
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch (e) {
    console.warn('Error activando link del navbar:', e);
  }

  // Validación en tiempo real
  const networkEl = document.getElementById('networkInput');
  if (networkEl) {
    networkEl.addEventListener('input', (e) => {
      validateInput(e.target, validateNetwork, 'networkError', 'networkSuccess');
    });
    
    // Validación inicial
    validateInput(networkEl, validateNetwork, 'networkError', 'networkSuccess');
  }

  // Event listener para calcular
  const calculateBtn = document.querySelector('[data-action="calculate"]');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateSubnets);
  }
  
  // Mostrar tip inicial
  setTimeout(() => {
    showToast('🎯 Ingresa una red y número de subredes para ver el proceso paso a paso', 'info', 4000);
  }, 1000);
});