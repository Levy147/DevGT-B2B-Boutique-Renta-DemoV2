/**
 * ============================================================
 *  Nicol Dress Rental - Reservas Rápidas
 *  ============================================================
 *  Reserva sin login → Google Sheets + WhatsApp + localStorage
 *  También funciona con login (auto-completa datos).
 * ============================================================
 */

const WHATSAPP_NUMBER = '50258570841';
const WHATSAPP_NUMBER_DISPLAY = '5857-0841';
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwLBusrx7LI2cq4vlepZtTG6yOBQaNgS3ozZz3AimAa5DQMHMF-ClktcJNmEDFphg/exec';

// ─── ABRIR MODAL DE RESERVA RÁPIDA ───
function abrirModalReservaRapida(idVestido) {
  const v = getVestidoById(idVestido);
  if (!v) return;

  const user = getCurrentUser();
  const nombreDefault = user ? user.nombre : '';
  const telDefault = user ? user.telefono : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = 'reservaRapidaModal';
  overlay.innerHTML = `
    <div class="modal" style="max-width:480px;">
      <div class="modal-header">
        <h3>Reservar sin Cuenta</h3>
        <button class="modal-close" onclick="cerrarModalReservaRapida()">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--bg-secondary);border-radius:8px;padding:12px;margin-bottom:16px;display:flex;gap:12px;align-items:center;">
          <div style="width:56px;height:56px;border-radius:8px;overflow:hidden;flex-shrink:0;">
            <img src="${getImageUrl(v)}" alt="${v.nombre}" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div>
            <div style="font-weight:600;">${v.nombre}</div>
            <div style="font-size:0.85rem;color:var(--text-muted);">${v.sku} · ${v.categoria} · ${v.color}</div>
            <div style="font-weight:700;color:var(--primary);">${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</div>
          </div>
        </div>

        <form class="login-form" id="formReservaRapida" onsubmit="confirmarReservaRapida(event, ${v.id})">
          <div class="form-group">
            <label for="reservaNombre">Nombre completo *</label>
            <input type="text" id="reservaNombre" placeholder="Tu nombre" value="${nombreDefault}" required>
          </div>
          <div class="form-group">
            <label for="reservaTelefono">Teléfono *</label>
            <input type="tel" id="reservaTelefono" placeholder="5555-0101" value="${telDefault}" required minlength="8">
          </div>
          <div class="form-group">
            <label for="reservaFechaPrueba">¿Cuándo quieres probarte el vestido? *</label>
            <input type="date" id="reservaFechaPrueba" required min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label for="reservaFechaEvento">Fecha del evento *</label>
            <input type="date" id="reservaFechaEvento" required min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group">
            <label for="reservaNotas">Notas (opcional)</label>
            <textarea id="reservaNotas" rows="2" placeholder="Alguna indicación especial..."></textarea>
          </div>

          ${user ? `
            <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:var(--text-muted);">
              Sesión activa: <strong>${user.nombre}</strong>. Tu reserva se guardará también en "Mis Citas".
            </div>
          ` : `
            <div style="background:var(--bg-secondary);border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:var(--text-muted);">
              No necesitas crear cuenta. Tu reserva se sincronizará con nuestra hoja de cálculo y recibirás confirmación por WhatsApp.
            </div>
          `}

          <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;">
            Confirmar Reserva
          </button>
        </form>

        <div style="text-align:center;margin-top:12px;">
          <a href="#" onclick="abrirModalLoginDesdeReserva();return false;" style="font-size:0.85rem;color:var(--primary);">¿Ya tienes cuenta? Inicia sesión</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarModalReservaRapida();
  });
}

function cerrarModalReservaRapida() {
  const modal = document.getElementById('reservaRapidaModal');
  if (modal) modal.remove();
}

function abrirModalLoginDesdeReserva() {
  cerrarModalReservaRapida();
  openLoginModal();
}

// ─── CONFIRMAR RESERVA RÁPIDA ───
function confirmarReservaRapida(e, idVestido) {
  e.preventDefault();

  const nombre = document.getElementById('reservaNombre').value.trim();
  const telefono = document.getElementById('reservaTelefono').value.trim();
  const fechaPrueba = document.getElementById('reservaFechaPrueba').value;
  const fechaEvento = document.getElementById('reservaFechaEvento').value;
  const notas = document.getElementById('reservaNotas').value.trim();

  if (!nombre || !telefono || !fechaPrueba || !fechaEvento) {
    showToast('Completa nombre, teléfono y ambas fechas', 'warning');
    return;
  }

  if (telefono.replace(/\D/g, '').length < 8) {
    showToast('Ingresa un teléfono válido (mínimo 8 dígitos)', 'warning');
    return;
  }

  const v = getVestidoById(idVestido);
  if (!v) return;

  const user = getCurrentUser();

  // 1. Guardar en localStorage
  const reserva = agregarReservaRapida({
    nombre,
    telefono,
    id_usuario: user ? user.id : null,
    id_vestido: v.id,
    sku: v.sku,
    nombre_vestido: v.nombre,
    categoria: v.categoria,
    precio_renta: v.precio_renta,
    fecha_prueba: fechaPrueba,
    fecha_evento: fechaEvento,
    notas
  });

  // 2. Si hay sesión, también guardar en db_citas
  if (user) {
    agregarCita(user.id, v.id, fechaPrueba, '10:00', 'prueba', notas || `Reserva rápida: ${nombre}. Evento: ${fechaEvento}`);
  }

  showToast('Reserva registrada', 'success');

  // 3. Cerrar modal
  cerrarModalReservaRapida();

  // 4. Enviar a Google Sheets
  enviarReservaGoogleSheet({ nombre, telefono, vestido: v, fechaPrueba, fechaEvento, notas, fechaReserva: reserva.fecha_reserva });

  // 5. Abrir WhatsApp
  setTimeout(() => {
    enviarWhatsAppReserva({ nombre, telefono, vestido: v, fechaPrueba, fechaEvento, notas });
  }, 500);
}

// ─── ENVIAR A GOOGLE SHEETS ───
function enviarReservaGoogleSheet(data) {
  const { nombre, telefono, vestido, fechaPrueba, fechaEvento, notas, fechaReserva } = data;

  const payload = {
    fecha_reserva: fechaReserva,
    nombre,
    telefono,
    sku: vestido.sku,
    nombre_vestido: vestido.nombre,
    categoria: vestido.categoria,
    color: vestido.color,
    precio_renta: vestido.precio_renta,
    fecha_prueba: fechaPrueba,
    fecha_evento: fechaEvento,
    notas: notas || ''
  };

  fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(() => {
    showToast('Reserva enviada a la hoja de calculo', 'info');
  }).catch(err => {
    console.warn('Error al enviar a Google Sheets:', err);
    showToast('No se pudo sincronizar con la hoja, pero tu reserva esta guardada localmente', 'warning');
  });
}

// ─── ENVIAR WHATSAPP ───
function enviarWhatsAppReserva(data) {
  const { nombre, telefono, vestido, fechaPrueba, fechaEvento, notas } = data;

  const msg = [
    `Hola, quiero reservar un vestido:`,
    ``,
    `${vestido.nombre}`,
    `SKU: ${vestido.sku}`,
    `Categoria: ${vestido.categoria}`,
    `Precio: Q${(vestido.precio_renta || 0).toLocaleString()}`,
    ``,
    `Quiero probarmelo el: ${fechaPrueba}`,
    `Mi evento es el: ${fechaEvento}`,
    `Nombre: ${nombre}`,
    `Telefono: ${telefono}`,
    notas ? `\nNotas: ${notas}` : '',
    ``,
    `Gracias!`
  ].join('\n');

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ─── HISTORIAL DE RESERVAS RÁPIDAS (modal) ───
function showReservasRapidas() {
  const user = getCurrentUser();
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('open');

  let reservas = getReservasRapidas();
  if (user) {
    reservas = reservas.filter(r => r.id_usuario === user.id || (r.telefono && user.telefono && r.telefono.replace(/\D/g, '') === user.telefono.replace(/\D/g, '')));
  }

  let html = `
    <div class="modal-header">
      <h3>Mis Reservas</h3>
      <button class="modal-close" onclick="closeModal(this)">×</button>
    </div>
    <div class="modal-body">
  `;

  if (reservas.length === 0) {
    html += `<div class="empty-state"><div class="empty-icon">*</div><h3>No tienes reservas</h3><p>Reserva un vestido desde su pagina de detalle</p></div>`;
  } else {
    reservas.reverse().forEach(r => {
      html += `
        <div class="appointment-card">
          <div>
            <h4>${r.nombre_vestido}</h4>
            <p style="font-size:0.85rem;color:var(--text-muted);">${r.sku} · ${r.categoria}</p>
            <p>Prueba: ${r.fecha_prueba} · Evento: ${r.fecha_evento}</p>
            ${r.notas ? `<p style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">"${r.notas}"</p>` : ''}
            <p style="font-size:0.75rem;color:var(--text-muted);">Reservado: ${r.fecha_reserva}</p>
          </div>
          <div class="appointment-status">
            <span class="badge badge-success">Reservado</span>
            <button class="btn btn-sm btn-outline" style="margin-top:8px;" onclick="reenviarWhatsAppReserva(${r.id_reserva})">WhatsApp</button>
          </div>
        </div>
      `;
    });
  }

  html += `</div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `<div class="modal" style="max-width:600px;">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function reenviarWhatsAppReserva(idReserva) {
  const reservas = getReservasRapidas();
  const r = reservas.find(res => res.id_reserva === idReserva);
  if (!r) return;

  const vestido = getVestidoById(r.id_vestido) || { nombre: r.nombre_vestido, sku: r.sku, categoria: r.categoria, precio_renta: r.precio_renta };
  enviarWhatsAppReserva({
    nombre: r.nombre,
    telefono: r.telefono,
    vestido,
    fechaPrueba: r.fecha_prueba,
    fechaEvento: r.fecha_evento,
    notas: r.notas
  });
}
