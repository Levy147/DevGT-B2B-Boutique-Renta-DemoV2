/**
 * ============================================================
 *  B2B Boutique - Lector de Códigos QR
 *  ============================================================
 *  Escanea QRs usando la cámara del dispositivo o input manual.
 *  Nota: Para un escaneo real de QR se necesita la librería
 *  jsQR (https://github.com/cozmo/jsQR). En esta demo,
 *  usamos el input manual como fallback principal.
 * ============================================================
 */

let stream = null;
let scanning = false;

// ─── INICIAR CÁMARA ───
async function iniciarEscanner() {
  const viewport = document.getElementById('scannerViewport');
  const placeholder = document.getElementById('scannerPlaceholder');
  const errorEl = document.getElementById('scannerError');
  const errorMsg = document.getElementById('scannerErrorMessage');

  if (errorEl) errorEl.style.display = 'none';

  try {
    // Intentar acceder a la cámara trasera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });

    // Crear o reusar el elemento de video
    let video = document.getElementById('scannerVideo');
    if (!video) {
      video = document.createElement('video');
      video.id = 'scannerVideo';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      viewport.appendChild(video);
    }

    video.srcObject = stream;
    await video.play();

    if (placeholder) placeholder.style.display = 'none';
    scanning = true;

    showToast('◇ Cámara iniciada. Enfoca el código QR.', 'info');

    // En un entorno real, aquí se integraría jsQR para leer el QR
    // Por ahora, mostramos instrucciones para input manual
    setTimeout(() => {
      if (scanning) {
        showToast('Escanea el QR o usa "Ingresar ID Manual"', 'info');
      }
    }, 2000);

  } catch (err) {
    console.error('Error al acceder a la cámara:', err);

    if (errorEl && errorMsg) {
      let mensaje = 'No se pudo acceder a la cámara. ';
      if (err.name === 'NotAllowedError') {
        mensaje += 'Permiso denegado. Habilita la cámara en tu navegador.';
      } else if (err.name === 'NotFoundError') {
        mensaje += 'No se encontró una cámara en este dispositivo.';
      } else {
        mensaje += 'Usa el botón "Ingresar ID Manual" para buscar un vestido.';
      }
      errorEl.style.display = 'block';
      errorMsg.textContent = mensaje;
    }

    if (placeholder) {
      placeholder.innerHTML = `
        <p style="font-size:3rem;margin-bottom:16px;">◇</p>
        <p style="color:var(--danger);">Error: No se pudo iniciar la cámara</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="entrarIdManual()"># Ingresar ID Manual</button>
      `;
    }
  }
}

// ─── DETENER CÁMARA ───
function detenerEscanner() {
  scanning = false;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  const video = document.getElementById('scannerVideo');
  if (video && video.parentElement) {
    video.parentElement.removeChild(video);
  }

  const placeholder = document.getElementById('scannerPlaceholder');
  if (placeholder) {
    placeholder.style.display = 'block';
    placeholder.innerHTML = `
      <p style="font-size:3rem;margin-bottom:16px;">◇</p>
      <p>Cámara detenida</p>
    `;
  }

  showToast('⊟ Cámara detenida', 'info');
}

// ─── PROCESAR RESULTADO DEL QR ───
// Esta función se llamaría desde jsQR cuando se detecte un código
function procesarQR(data) {
  if (!data || !scanning) return;

  try {
    // El QR contiene la URL del vestido: vestido.html?id=X
    const url = new URL(data);
    const id = parseInt(url.searchParams.get('id'));

    if (id) {
      const v = getVestidoById(id);
      if (v) {
        detenerEscanner();
        mostrarResultadoScanner(v);
      } else {
        showToast('✗ Vestido no encontrado', 'error');
      }
    }
  } catch (e) {
    // Si el QR contiene solo el ID como texto plano
    const id = parseInt(data.trim());
    if (id) {
      const v = getVestidoById(id);
      if (v) {
        detenerEscanner();
        mostrarResultadoScanner(v);
      }
    }
  }
}

// ─── MOSTRAR RESULTADO ───
function mostrarResultadoScanner(v) {
  const result = document.getElementById('scannerResult');
  const content = document.getElementById('scannerResultContent');
  const errorEl = document.getElementById('scannerError');
  const placeholder = document.getElementById('scannerPlaceholder');

  if (errorEl) errorEl.style.display = 'none';

  if (result && content) {
    result.style.display = 'block';

    const estadoClass = v.estado === 'disponible' && v.disponibles > 0 ? 'badge-success' : 'badge-danger';
    const estadoText = v.estado === 'disponible' && v.disponibles > 0 ? 'Disponible' : 'Agotado';

    content.innerHTML = `
      <div style="display:flex;gap:20px;align-items:start;flex-wrap:wrap;">
        <img src="${getImageUrl(v)}" alt="${formatDressName(v)}" style="width:120px;height:160px;object-fit:cover;border-radius:8px;">
        <div style="flex:1;min-width:200px;">
          <h4 style="margin-bottom:4px;">✓ ${formatDressName(v)}</h4>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:8px;">#${v.id} · ${v.categoria} · ${v.color}</p>
          <p style="margin-bottom:8px;">
            <span class="badge ${estadoClass}">${estadoText}</span>
            <span style="margin-left:8px;font-weight:700;color:var(--primary-dark);">${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })} / evento</span>
          </p>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;">
            Tallas: ${Array.isArray(v.talla) ? v.talla.join(', ') : v.talla || ''} · Disp: ${v.disponibles} unidad${v.disponibles !== 1 ? 'es' : ''}
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <select id="scannerEstadoSelect" style="width:auto;padding:6px 12px;font-size:0.85rem;">
              <option value="disponible" ${v.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
              <option value="agotado" ${v.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
              <option value="lavanderia" ${v.estado === 'lavanderia' ? 'selected' : ''}>Lavandería</option>
              <option value="reparacion" ${v.estado === 'reparacion' ? 'selected' : ''}>Reparación</option>
            </select>
            <button class="btn btn-sm btn-primary" onclick="actualizarEstadoDesdeScanner(${v.id})">Actualizar Estado</button>
            <a href="../vestido.html?id=${v.id}" target="_blank" class="btn btn-sm btn-outline">Ver Detalle</a>
          </div>
        </div>
      </div>
    `;
  }
}

function actualizarEstadoDesdeScanner(id) {
  const select = document.getElementById('scannerEstadoSelect');
  if (!select) return;

  const nuevoEstado = select.value;
  const vestidos = getVestidos();
  const v = vestidos.find(v => v.id === id);
  if (v) {
    v.estado = nuevoEstado;
    saveVestidos(vestidos);
    showToast(`✓ "${formatDressName(v)}" actualizado a: ${nuevoEstado}`, 'success');
    mostrarResultadoScanner(v); // Re-render
  }
}

// ─── LIMPIAR AL SALIR ───
window.addEventListener('beforeunload', () => {
  detenerEscanner();
});
