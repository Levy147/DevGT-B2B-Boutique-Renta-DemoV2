/**
 * ============================================================
 *  Nicol Dress Rental - Lógica de Usuario
 *  ============================================================
 *  Auth, Favoritos, Citas, reseñas, cross-selling, calendario.
 * ============================================================
 */

// ─── TOAST ───
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(toast);    setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
}

// ─── LOGIN MODAL ───
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('open');
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('open');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const user = loginUsuario(email, password);

  if (user) {
    showToast(`Bienvenida, ${user.nombre}!`, 'success');
    closeLoginModal();
    actualizarUIUsuario();
    mostrarAnunciosPendientes();
    if (window.location.pathname.includes('catalogo') && window.location.search.includes('tab=favoritos')) {
      window.location.reload();
    }
  } else {
    showToast('Correo o contraseña incorrectos', 'error');
  }
}

// ─── USER MENU ───
function toggleUserMenu() {
  const user = getCurrentUser();
  if (!user) {
    openLoginModal();
    return;
  }

  // Crear dropdown si no existe
  let dropdown = document.getElementById('userDropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'userDropdown';
    dropdown.className = 'user-dropdown';
    document.querySelector('.navbar-actions').appendChild(dropdown);
  }

  if (dropdown.classList.contains('open')) {
    dropdown.classList.remove('open');
    return;
  }

  const inicial = user.nombre.charAt(0).toUpperCase();
  const isAdmin = user.correo === 'admin@boutique.com';

  dropdown.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border-light);margin-bottom:4px;">
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.9rem;">${inicial}</div>
      <div>
        <div style="font-weight:600;font-size:0.9rem;">${user.nombre}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${user.correo}</div>
      </div>
    </div>
    <a href="catalogo.html?tab=favoritos">♡ Mis Favoritos</a>
    <a href="#" onclick="showMyAppointments();return false;">◷ Mis Citas</a>
    <a href="#" onclick="showMyRentals();return false;">◷ Mis Rentas</a>
    <a href="#" onclick="showReservasRapidas();return false;">Mis Reservas</a>
    ${isAdmin ? '<div class="dropdown-divider"></div><a href="admin/dashboard.html">⚙ Panel Admin</a>' : ''}
    <div class="dropdown-divider"></div>
    <button class="logout-btn" onclick="handleLogout()">⤻ Cerrar Sesión</button>
  `;

  dropdown.classList.add('open');

  // Cerrar al hacer clic fuera
  setTimeout(() => {
    document.addEventListener('click', closeUserMenu, { once: true });
  }, 10);
}

function handleFavClick() {
  const user = getCurrentUser();
  if (!user) {
    openLoginModal();
    showToast('Inicia sesión para ver tus favoritos', 'warning');
    return;
  }
  window.location.href = 'catalogo.html?tab=favoritos';
}

function closeUserMenu(e) {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown && !dropdown.contains(e.target) && e.target.id !== 'loginBtn') {
    dropdown.classList.remove('open');
  }
}

function handleLogout() {
  logoutUsuario();
  showToast('Sesión cerrada', 'info');
  actualizarUIUsuario();
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('open');
  // Si está en admin, redirigir al home
  if (window.location.pathname.includes('admin/')) {
    setTimeout(() => { window.location.href = '../index.html'; }, 500);
  }
}

// ─── ACTUALIZAR UI SEGÚN SESIÓN ───
function actualizarUIUsuario() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');

  if (user) {
    if (loginBtn) {
      loginBtn.innerHTML = `<div class="user-menu"><div class="user-name"><span class="user-avatar">${user.nombre.charAt(0).toUpperCase()}</span>${user.nombre.split(' ')[0]}</div></div>`;
      loginBtn.className = 'btn btn-sm user-btn';
      loginBtn.onclick = toggleUserMenu;
    }
  } else {
    if (loginBtn) {
      loginBtn.innerHTML = 'Iniciar Sesión';
      loginBtn.className = 'btn btn-primary btn-sm';
      loginBtn.onclick = openLoginModal;
    }
  }
}

// ─── MIS CITAS (Modal) ───
function showMyAppointments() {
  const user = getCurrentUser();
  if (!user) {
    openLoginModal();
    return;
  }

  const citas = getCitasByUsuario(user.id);
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('open');

  const statusMap = {
    pendiente: { label: 'Pendiente', class: 'badge-warning' },
    confirmada: { label: 'Confirmada', class: 'badge-success' },
    completada: { label: 'Completada', class: 'badge-info' },
    rechazada: { label: 'Rechazada', class: 'badge-danger' },
    cancelada: { label: 'Cancelada', class: 'badge-danger' }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = `
    <div class="modal-header">
      <h3>◷ Mis Citas</h3>
      <button class="modal-close" onclick="closeModal(this)">×</button>
    </div>
    <div class="modal-body">
  `;

  if (citas.length === 0) {
    html += `<div class="empty-state"><div class="empty-icon">◷</div><h3>No tienes citas</h3><p>Agenda una cita desde el catálogo</p></div>`;
  } else {
    html += citas.map(c => {
      const v = getVestidoById(c.id_vestido);
      const st = statusMap[c.estado_cita] || { label: c.estado_cita, class: 'badge-default' };
      const tipoLabel = { prueba: 'Prueba', renta: 'Renta', devolucion: 'Devolución' };

      const citaDate = new Date(c.fecha + 'T' + c.hora);
      const diffDays = Math.ceil((citaDate - today) / (1000 * 60 * 60 * 24));
      const puedeCancelar = diffDays >= 2 && (c.estado_cita === 'pendiente' || c.estado_cita === 'confirmada');

      return `
        <div class="appointment-card">
          <div>
            <h4>${v ? v.nombre : 'Vestido #' + c.id_vestido}</h4>
            <p>${c.fecha} · ${c.hora} · ${tipoLabel[c.tipo] || c.tipo}</p>
            ${c.notas ? `<p style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">"${c.notas}"</p>` : ''}
            ${!puedeCancelar && (c.estado_cita === 'pendiente' || c.estado_cita === 'confirmada') ? `<p style="font-size:0.75rem;color:var(--danger);">Las citas deben cancelarse con al menos 2 días de antelación</p>` : ''}
          </div>
          <div class="appointment-status">
            <span class="badge ${st.class}">${st.label}</span>
            ${puedeCancelar ? `
              <div style="display:flex;gap:4px;margin-top:8px;">
                <button class="btn btn-sm btn-danger" onclick="cancelarCita(${c.id_cita})">Cancelar</button>
                <button class="btn btn-sm btn-outline" onclick="reprogramarCita(${c.id_cita})">Reprogramar</button>
              </div>
            ` : ''}
            ${c.estado_cita === 'completada' ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">✓ Completada</div>` : ''}
            ${c.estado_cita === 'cancelada' || c.estado_cita === 'rechazada' ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">× ${c.estado_cita === 'cancelada' ? 'Cancelada por ti' : 'Rechazada'}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  html += `</div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `<div class="modal" style="max-width:600px;">${html}</div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function cancelarCita(idCita) {
  if (!confirm('¿Estás segura de cancelar esta cita?')) return;
  actualizarEstadoCita(idCita, 'cancelada');
  showToast('✓ Cita cancelada', 'success');
  const overlay = document.querySelector('.modal-overlay.open');
  if (overlay) overlay.remove();
  showMyAppointments();
}

function reprogramarCita(idCita) {
  reprogramandoCitaId = idCita;
  showToast('Selecciona una nueva fecha y hora en el calendario del vestido', 'info');
  const overlay = document.querySelector('.modal-overlay.open');
  if (overlay) overlay.remove();
  const citas = getCitas();
  const cita = citas.find(c => c.id_cita === idCita);
  if (cita) {
    window.location.href = `vestido.html?id=${cita.id_vestido}&reprogramar=${idCita}`;
  }
}

function showMyRentals() {
  const user = getCurrentUser();
  if (!user) {
    openLoginModal();
    return;
  }

  const citas = getCitasByUsuario(user.id).filter(c => c.tipo === 'renta' || c.tipo === 'devolucion');
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.remove('open');

  let html = `
    <div class="modal-header">
      <h3>◷ Mis Rentas</h3>
      <button class="modal-close" onclick="closeModal(this)">×</button>
    </div>
    <div class="modal-body">
  `;

  if (citas.length === 0) {
    html += `<div class="empty-state"><div class="empty-icon">◷</div><h3>No tienes rentas</h3><p>Las rentas que realices aparecerán aquí</p></div>`;
  } else {
    html += citas.map(c => {
      const v = getVestidoById(c.id_vestido);
      const statusMap = {
        pendiente: { label: 'Pendiente', class: 'badge-warning' },
        confirmada: { label: 'Confirmada', class: 'badge-success' },
        completada: { label: 'Completada', class: 'badge-info' },
        rechazada: { label: 'Rechazada', class: 'badge-danger' },
        cancelada: { label: 'Cancelada', class: 'badge-danger' }
      };
      const st = statusMap[c.estado_cita] || { label: c.estado_cita, class: 'badge-default' };
      const tipoLabel = { renta: 'Renta', devolucion: 'Devolución' };
      return `
        <div class="appointment-card">
          <div>
            <h4>${v ? v.nombre : 'Vestido #' + c.id_vestido}</h4>
            <p>${c.fecha} · ${c.hora} · ${tipoLabel[c.tipo] || c.tipo}</p>
            ${c.notas ? `<p style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">"${c.notas}"</p>` : ''}
          </div>
          <div class="appointment-status">
            <span class="badge ${st.class}">${st.label}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  html += `</div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `<div class="modal" style="max-width:600px;">${html}</div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

function closeModal(el) {
  el.closest('.modal-overlay')?.remove();
}

// ─── RENDERIZAR VESTIDO DETALLE ───
function renderizarVestido(id) {
  const v = getVestidoById(id);
  if (!v) {
    document.getElementById('productDetail').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-icon"></div>
        <h3>Vestido no encontrado</h3>
        <a href="catalogo.html" class="btn btn-primary">Volver al catálogo</a>
      </div>
    `;
    return;
  }

  const user = getCurrentUser();
  const isFav = user ? esFavorito(user.id, v.id) : false;
  const estadoClass = v.estado === 'disponible' && v.disponibles > 0 ? 'badge-success' : 'badge-danger';
  const estadoText = v.estado === 'disponible' && v.disponibles > 0 ? 'Disponible' : 'Agotado';
  const tallas = Array.isArray(v.talla) ? v.talla.join(', ') : v.talla || '';

  let thumbs = '';
  const allImgs = getTodasLasImagenes(v.sku);
  if (allImgs.length > 1) {
    thumbs = `<div class="product-thumbnails">
      ${allImgs.map((img, i) => `
        <div class="product-thumbnail ${i === 0 ? 'active' : ''}" onclick="cambiarImagenPrincipal(this, '${img}')">
          <img src="${img}" alt="">
        </div>
      `).join('')}
    </div>`;
  }

  // Cross-selling: accesorios sugeridos
  const accesorios = getAccesorios();
  const accsHtml = accesorios.length > 0 ? `
    <div class="cross-sell-section">
      <h4>Completa tu Look</h4>
      <div class="cross-sell-grid">
        ${accesorios.map(a => `
          <div class="cross-sell-item" onclick="showToast('${a.nombre} (${a.precio.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}) agregado a tu cotización', 'success')" title="Agregar ${a.nombre}">
            <div class="cs-name">${a.nombre}</div>
            <div class="cs-price">+${a.precio.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Reseñas
  const resenas = getResenasByVestido(v.id);
  const resHtml = resenas.length > 0 ? `
    <div class="reviews-section">
      <h4>Reseñas de Clientes</h4>
      ${resenas.map(r => {
        const stars = '★'.repeat(r.puntuacion) + '☆'.repeat(5 - r.puntuacion);
        return `
          <div class="review-card">
            <div class="review-avatar">${r.nombre_usuario.charAt(0)}</div>
            <div class="review-content">
              <div class="review-name">${r.nombre_usuario}</div>
              <div class="review-date">${r.fecha}</div>
              <div class="review-stars">${stars}</div>
              <div class="review-text">${r.texto}</div>
              ${r.foto ? `<img src="${r.foto}" class="review-img" alt="Foto de cliente">` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : '';

  const html = `
    <div class="product-gallery">
      <div class="product-main-image" style="position:relative;overflow:hidden;">
        <img id="mainImage" src="${getImageUrl(v)}" alt="${v.nombre}">
      </div>
      ${thumbs}
    </div>
    <div class="product-info">
      <h1>${v.nombre}</h1>
      <div class="product-category">${v.categoria}</div>
      <div class="product-sku">SKU: ${v.sku || 'NDR-'+String(v.id).padStart(3,'0')}</div>

      <div class="product-meta">
        <span class="badge ${estadoClass}">${estadoText}</span>
        <span class="product-meta-item">${v.color}</span>
        <span class="product-meta-item">${tallas}</span>
        <span class="product-meta-item">${v.disponibles} disponible${v.disponibles !== 1 ? 's' : ''}</span>
        ${v.corte ? `<span class="product-meta-item">Corte ${v.corte}</span>` : ''}
        ${v.tipo_cuerpo ? `<span class="product-meta-item">${v.tipo_cuerpo.join(', ')}</span>` : ''}
      </div>

      <div class="size-guide-link">
        <a href="#" onclick="document.getElementById('sizeGuideModal').style.display='flex'; return false;" style="font-size:0.85rem;color:var(--primary);"> Guía de Tallas</a>
      </div>

      <div class="product-price">${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</div>
      <div class="product-price-sub">Alquiler por evento · ${v.precio_venta ? v.precio_venta.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' }) + ' en venta' : 'Solo alquiler'}</div>

      <div class="product-description">${v.descripcion}</div>

      <div class="product-fabric">
        <h4>Tela</h4>
        <p>${v.tela}</p>
      </div>

      <div class="product-actions">
        ${v.estado === 'lavanderia' || v.estado === 'reparacion' ? 
          `<div style="padding:12px;background:#fff3e0;border-radius:8px;text-align:center;color:#e65100;font-weight:600;">
            Este vestido no está disponible actualmente (${v.estado === 'lavanderia' ? 'en lavandería' : 'en reparación'})
          </div>` :
          `<button class="btn btn-primary btn-lg" onclick="agendarCita(${v.id})">
            Agendar Cita de Prueba
          </button>
          <button class="btn btn-outline btn-lg" onclick="abrirModalReservaRapida(${v.id})" style="margin-top:8px;">
            Reservar sin Cuenta
          </button>`
        }
        <button class="btn btn-outline ${isFav ? 'active' : ''}" onclick="toggleFavoritoDetail(${v.id})">
          ${isFav ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
        </button>
      </div>

      ${accsHtml}
      ${resHtml}

      <div class="calendar-section" id="calendarSection">
        <h4>Selecciona una fecha disponible</h4>
        <div id="calendarWidget"></div>
      </div>
    </div>
  `;

  document.getElementById('productDetail').innerHTML = html;
  renderCalendar();

  const params = new URLSearchParams(window.location.search);
  const reprogramar = parseInt(params.get('reprogramar'));
  if (reprogramar) {
    reprogramandoCitaId = reprogramar;
    showToast('Selecciona la nueva fecha y hora para tu cita', 'info');
    document.getElementById('calendarSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function cambiarImagenPrincipal(thumb, src) {
  document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
  document.getElementById('mainImage').src = src;
}

function toggleFavoritoDetail(idVestido) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Inicia sesión para guardar favoritos', 'warning');
    openLoginModal();
    return;
  }
  toggleFavorito(user.id, idVestido);
  const isFav = esFavorito(user.id, idVestido);
  showToast(isFav ? '♥ Vestido guardado en tu Wishlist!' : '♡ Eliminado de favoritos', isFav ? 'success' : 'info');
  renderizarVestido(idVestido); // Re-render
}

// ─── CALENDARIO ───
let calendarDate = new Date();
let selectedDate = null;
let selectedTime = null;
let currentVestidoId = null;
let reprogramandoCitaId = null;

function renderCalendar() {
  const widget = document.getElementById('calendarWidget');
  if (!widget) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Get already booked dates
  const citas = getCitas().filter(c => c.estado_cita !== 'rechazada');
  const bookedDates = citas.map(c => c.fecha);

  let days = '<div class="calendar-header">Dom</div><div class="calendar-header">Lun</div><div class="calendar-header">Mar</div><div class="calendar-header">Mié</div><div class="calendar-header">Jue</div><div class="calendar-header">Vie</div><div class="calendar-header">Sáb</div>';

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    days += '<div class="calendar-day empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isBooked = bookedDates.includes(dateStr);
    const isSelected = selectedDate === dateStr;

    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (isPast) cls += ' disabled';
    if (isBooked) cls += ' booked';
    if (isSelected) cls += ' selected';

    days += `<div class="${cls}" onclick="${isPast || isBooked ? '' : `selectFecha('${dateStr}', this)`}">${d}</div>`;
  }

  widget.innerHTML = `
    <div class="calendar-nav">
      <button onclick="cambiarMes(-1)">‹</button>
      <span class="month-year">${monthNames[month]} ${year}</span>
      <button onclick="cambiarMes(1)">›</button>
    </div>
    <div class="calendar-grid">${days}</div>
    <div id="timeSlotsContainer"></div>
    <div id="appointmentActions" style="display:none;margin-top:16px;">
      <button class="btn btn-primary btn-block" onclick="confirmarCita()">Confirmar Cita</button>
    </div>
  `;
}

function cambiarMes(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  selectedDate = null;
  selectedTime = null;
  renderCalendar();
}

function selectFecha(dateStr, el) {
  document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = dateStr;

  // Show time slots
  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const container = document.getElementById('timeSlotsContainer');
  container.innerHTML = `
    <p style="font-size:0.85rem;margin-bottom:8px;color:var(--text-secondary);">Horarios disponibles:</p>
    <div class="time-slots">
      ${times.map(t => `<button class="time-slot" onclick="selectTime('${t}', this)">${t}</button>`).join('')}
    </div>
  `;
}

function selectTime(time, el) {
  document.querySelectorAll('.time-slot.selected').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  selectedTime = time;

  document.getElementById('appointmentActions').style.display = 'block';
}

function agendarCita(idVestido) {
  currentVestidoId = idVestido;
  const user = getCurrentUser();
  if (user) {
    document.getElementById('calendarSection')?.scrollIntoView({ behavior: 'smooth' });
  } else {
    abrirModalReservaRapida(idVestido);
  }
}

function confirmarCita() {
  const user = getCurrentUser();
  if (!user) {
    showToast('Debes iniciar sesión', 'error');
    return;
  }

  if (!selectedDate || !selectedTime || !currentVestidoId) {
    showToast('Selecciona fecha y hora', 'warning');
    return;
  }

  if (reprogramandoCitaId) {
    const citas = getCitas();
    const idx = citas.findIndex(c => c.id_cita === reprogramandoCitaId);
    if (idx !== -1) {
      citas[idx].fecha = selectedDate;
      citas[idx].hora = selectedTime;
      citas[idx].estado_cita = 'pendiente';
      saveCitas(citas);
      showToast(`✓ Cita reprogramada para el ${selectedDate} a las ${selectedTime}`, 'success');
    }
    reprogramandoCitaId = null;
  } else {
    agregarCita(user.id, currentVestidoId, selectedDate, selectedTime, 'prueba', '');
    const v = getVestidoById(currentVestidoId);
    showToast(`✓ Cita agendada para probar "${v?.nombre}" el ${selectedDate} a las ${selectedTime}`, 'success');
  }

  selectedDate = null;
  selectedTime = null;
  currentVestidoId = null;
  renderCalendar();
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  actualizarUIUsuario();

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.remove();
    }
  });

  // ─── Rose Petals ───
  const petalLayer = document.createElement('div');
  petalLayer.className = 'petal-layer';
  document.body.appendChild(petalLayer);

  const colors = [
    'var(--accent)', 'var(--primary)', 'var(--primary-dark)',
    'var(--primary-hover)', 'var(--accent-soft)'
  ];

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    const w = 40 + Math.random() * 30;
    const c = colors[Math.floor(Math.random() * colors.length)];
    const anim = 'pd' + (1 + Math.floor(Math.random() * 10));
    const dur = 18 + Math.random() * 18;
    const del = Math.random() * -36;
    const lft = 2 + Math.random() * 96;
    Object.assign(p.style, {
      width: w + 'px',
      height: (w * 1.3) + 'px',
      left: lft + '%',
      background: `radial-gradient(ellipse at 30% 30%, ${c}, transparent 70%)`,
      animation: `${anim} ${dur}s ease-in-out infinite`,
      animationDelay: del + 's'
    });
    petalLayer.appendChild(p);
  }
});

// ─── ANUNCIOS GLOBALES ───
function mostrarAnunciosPendientes() {
  const anuncios = JSON.parse(localStorage.getItem('db_anuncios')) || [];
  if (anuncios.length === 0) return;

  const user = getCurrentUser();
  if (!user || user.correo === 'admin@boutique.com') return;

  const ultimo = anuncios[anuncios.length - 1];
  if (!ultimo.leido) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `<div class="modal" style="max-width:500px;">
      <div class="modal-header">
        <h3>Aviso</h3>
        <button class="modal-close" onclick="marcarAnuncioLeido(${ultimo.id});this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div style="padding:16px;">
        <p style="margin-bottom:8px;">${ultimo.mensaje}</p>
        <p style="font-size:0.8rem;color:var(--text-muted);">${ultimo.fecha}</p>
      </div>
    </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) { marcarAnuncioLeido(ultimo.id); overlay.remove(); }});
    document.body.appendChild(overlay);
  }
}

function marcarAnuncioLeido(id) {
  let anuncios = JSON.parse(localStorage.getItem('db_anuncios')) || [];
  const idx = anuncios.findIndex(a => a.id === id);
  if (idx !== -1) {
    anuncios[idx].leido = true;
    localStorage.setItem('db_anuncios', JSON.stringify(anuncios));
  }
}
