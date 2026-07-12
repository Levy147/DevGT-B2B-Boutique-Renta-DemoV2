/**
 * ============================================================
 *  Nicol Dress Rental - Lógica del Panel Admin
 *  ============================================================
 *  Dashboard, citas con WhatsApp, inventario, estadísticas,
 *  tintorería, daños, QR.
 * ============================================================
 */

// ─── DASHBOARD ───
function cargarDashboard() {
  const vestidos = getVestidos();
  const citas = getCitas();
  const today = new Date().toISOString().split('T')[0];

  // Stats
  const citasHoy = citas.filter(c => c.fecha === today);
  const disponibles = vestidos.filter(v => v.estado === 'disponible' && v.disponibles > 0);
  const lavanderia = vestidos.filter(v => v.estado === 'lavanderia');
  const reparacion = vestidos.filter(v => v.estado === 'reparacion');

  const el = (id) => document.getElementById(id);
  if (el('statCitasHoy')) el('statCitasHoy').textContent = citasHoy.length;
  if (el('statDisponibles')) el('statDisponibles').textContent = disponibles.length;
  if (el('statLavanderia')) el('statLavanderia').textContent = lavanderia.length;
  if (el('statReparacion')) el('statReparacion').textContent = reparacion.length;

  const citasHoyCount = document.getElementById('citasHoyCount');
  if (citasHoyCount) citasHoyCount.textContent = `${citasHoy.length} cita(s)`;

  // Tabla citas de hoy
  renderizarCitas(citasHoy, 'citasHoyBody');

  // Tabla citas pendientes
  const pendientes = citas.filter(c => c.estado_cita === 'pendiente').sort((a, b) => a.fecha.localeCompare(b.fecha));
  renderizarCitas(pendientes, 'citasPendientesBody');
}

function renderizarCitas(citas, containerId) {
  const body = document.getElementById(containerId);
  if (!body) return;

  const isHoy = containerId === 'citasHoyBody';
  const cols = isHoy ? 7 : 7;

  if (citas.length === 0) {
    body.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:32px;color:var(--text-muted);">No hay citas</td></tr>`;
    return;
  }

  const tipoLabel = { prueba: 'Prueba', renta: 'Alquiler', devolucion: 'Devolución' };
  const statusClass = {
    pendiente: 'badge-warning',
    confirmada: 'badge-success',
    completada: 'badge-info',
    rechazada: 'badge-danger'
  };

  body.innerHTML = citas.map(c => {
    const usuario = getUsuarioById(c.id_usuario);
    const vestido = getVestidoById(c.id_vestido);
    const stClass = statusClass[c.estado_cita] || 'badge-default';
    
    // WhatsApp link para recordatorio
    const waMsg = encodeURIComponent(`¡Hola ${usuario?.nombre || ''}! Te esperamos mañana a las ${c.hora} para tu ${tipoLabel[c.tipo] || c.tipo} de ${vestido ? formatDressName(vestido) : ''} en Nicol Dress Rental. ◎ 7av 16-21 zona 9, Guatemala.`);
    const waLink = usuario ? `https://wa.me/${usuario.telefono.replace(/[^0-9]/g, '')}?text=${waMsg}` : '#';

    return `
      <tr>
        <td><strong>${usuario ? usuario.nombre : 'Usuario #' + c.id_usuario}</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">${usuario ? usuario.correo : ''}</span></td>
        <td>${vestido ? formatDressName(vestido) : '#' + c.id_vestido}</td>
        <td>${c.fecha}</td>
        <td>${c.hora}</td>
        <td>${tipoLabel[c.tipo] || c.tipo}</td>
        <td><span class="badge ${stClass}">${c.estado_cita.charAt(0).toUpperCase() + c.estado_cita.slice(1)}</span></td>
        ${isHoy ? `
        <td>
          <a href="${waLink}" target="_blank" class="btn btn-sm btn-whatsapp" title="Enviar recordatorio por WhatsApp">WhatsApp</a>
        </td>` : ''}
        <td>
          <div class="table-actions">
            ${c.estado_cita === 'pendiente' ? `
              <button class="btn btn-sm btn-success" onclick="cambiarEstadoCita(${c.id_cita}, 'confirmada')">Aprobar</button>
              <button class="btn btn-sm btn-danger" onclick="cambiarEstadoCita(${c.id_cita}, 'rechazada')">Rechazar</button>
            ` : ''}
            ${c.estado_cita === 'confirmada' ? `
              <button class="btn btn-sm btn-success" onclick="cambiarEstadoCita(${c.id_cita}, 'completada')">Asistió</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ─── ESTADÍSTICAS DE RENTABILIDAD ───
function cargarEstadisticas() {
  const chart = document.getElementById('chartBars');
  if (!chart) return;

  const vestidos = getVestidos().filter(v => v.rentas_completadas > 0);
  const topVestidos = vestidos.sort((a, b) => b.rentas_completadas - a.rentas_completadas).slice(0, 5);
  const maxRentas = Math.max(...topVestidos.map(v => v.rentas_completadas));
  const barColors = ['#a8445c', '#c45a74', '#c9788a', '#b8926b', '#7a2d42'];

  chart.innerHTML = `
    <div class="chart-header">
      <h4>Vestidos M&aacute;s Rentados</h4>
      <span class="chart-subtitle">Top 5 &middot; Rentas completadas</span>
    </div>
    <div class="chart-body">
      ${topVestidos.map((v, i) => {
        const pct = (v.rentas_completadas / maxRentas) * 100;
        return `
          <div class="chart-bar-group">
            <div class="chart-bar-header">
              <span class="chart-bar-rank">${i + 1}</span>
              <div class="chart-bar-label">
                <span class="chart-bar-name">${formatDressName(v)}</span>
                <span class="chart-bar-category">${v.categoria}</span>
              </div>
            </div>
            <div class="chart-bar-track">
              <div class="chart-bar-fill" id="chartBar_${i}" style="width:0%;background:${barColors[i]};"></div>
            </div>
            <div class="chart-bar-footer">
              <span class="chart-bar-count">${v.rentas_completadas} rentas</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  setTimeout(() => {
    topVestidos.forEach((v, i) => {
      const bar = document.getElementById(`chartBar_${i}`);
      if (bar) {
        const pct = (v.rentas_completadas / maxRentas) * 100;
        bar.style.width = pct + '%';
      }
    });
  }, 100);
}

// ─── DAÑOS / DEPÓSITOS ───
function cargarDanos() {
  const body = document.getElementById('danosBody');
  if (!body) return;

  const danos = getDanos();
  if (danos.length === 0) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted);">No hay daños registrados</td></tr>`;
    return;
  }

  const statusColors = {
    pendiente: { bg: '#fce4ec', text: '#c62828', dot: '#c62828' },
    resuelto: { bg: '#e8f5e9', text: '#2e7d32', dot: '#2e7d32' }
  };

  body.innerHTML = danos.map(d => {
    const v = getVestidoById(d.id_vestido);
    const u = getUsuarioById(d.id_usuario);
    const tipoClass = d.tipo === 'Menor' ? 'badge-warning' : 'badge-danger';
    const sc = statusColors[d.estado] || statusColors.pendiente;
    return `
      <tr>
        <td><strong>${v ? formatDressName(v) : '#' + d.id_vestido}</strong></td>
        <td>${u ? u.nombre : '#' + d.id_usuario}</td>
        <td class="damage-desc">${d.descripcion}</td>
        <td><span class="badge ${tipoClass}">${d.tipo}</span></td>
        <td><span class="damage-badge">${d.deposito_retener.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</span></td>
        <td>
          <span class="status-dot" style="background:${sc.dot};"></span>
          <span style="color:${sc.text};font-weight:600;font-size:0.8rem;text-transform:capitalize;">${d.estado}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-sm btn-secondary" onclick="editarDano(${d.id})" title="Editar">Editar</button>
            ${d.estado === 'pendiente' ? `<button class="btn btn-sm btn-success" onclick="resolverDano(${d.id})" title="Marcar como resuelto">Resolver</button>` : ''}
            <button class="btn btn-sm btn-danger" onclick="eliminarDano(${d.id})" title="Eliminar">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirFormularioDano(editData) {
  const modal = document.getElementById('danoModal');
  const form = document.getElementById('danoForm');
  form.reset();
  document.getElementById('danoEditId').value = '';

  // Llenar selects
  const vestidoSelect = document.getElementById('danoVestido');
  const clienteSelect = document.getElementById('danoCliente');

    vestidoSelect.innerHTML = '<option value="">Seleccionar vestido</option>' +
    getVestidos().map(v => `<option value="${v.id}">${formatDressName(v)}</option>`).join('');

  clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>' +
    getUsuarios().filter(u => u.rol !== 'admin').map(u => `<option value="${u.id}">${u.nombre} (${u.correo})</option>`).join('');

  if (editData) {
    document.getElementById('danoFormTitle').textContent = 'Editar Daño';
    document.getElementById('danoEditId').value = editData.id;
    document.getElementById('danoVestido').value = editData.id_vestido;
    document.getElementById('danoCliente').value = editData.id_usuario;
    document.getElementById('danoDescripcion').value = editData.descripcion;
    document.getElementById('danoTipo').value = editData.tipo;
    document.getElementById('danoDeposito').value = editData.deposito_retener;
    document.getElementById('danoEstado').value = editData.estado;
  } else {
    document.getElementById('danoFormTitle').textContent = 'Nuevo Daño';
  }

  modal.style.display = 'flex';
}

function cerrarFormularioDano() {
  document.getElementById('danoModal').style.display = 'none';
}

function guardarDano(e) {
  e.preventDefault();
  const editId = document.getElementById('danoEditId').value;
  const data = {
    id_vestido: parseInt(document.getElementById('danoVestido').value),
    id_usuario: parseInt(document.getElementById('danoCliente').value),
    descripcion: document.getElementById('danoDescripcion').value,
    tipo: document.getElementById('danoTipo').value,
    deposito_retener: parseFloat(document.getElementById('danoDeposito').value) || 0,
    estado: document.getElementById('danoEstado').value
  };

  if (editId) {
    const danos = getDanos();
    const idx = danos.findIndex(d => d.id === parseInt(editId));
    if (idx !== -1) {
      danos[idx] = { ...danos[idx], ...data };
      localStorage.setItem('db_danos', JSON.stringify(danos));
    }
    showToast('Daño actualizado', 'success');
  } else {
    const v = getVestidoById(data.id_vestido);
    const u = getUsuarioById(data.id_usuario);
    data.id = Date.now();
    data.fecha_reporte = new Date().toISOString().split('T')[0];
    agregarDano(null, data.id_vestido, data.id_usuario, data.descripcion, data.tipo, data.deposito_retener);
    // Override estado if set to resuelto
    if (data.estado === 'resuelto') {
      const danos = getDanos();
      const d = danos.find(x => x.id === data.id);
      if (d) { d.estado = 'resuelto'; }
      localStorage.setItem('db_danos', JSON.stringify(danos));
    }
    showToast(`Daño registrado para "${v ? formatDressName(v) : '#' + data.id_vestido}"`, 'success');
  }

  cerrarFormularioDano();
  cargarDanos();
}

function editarDano(id) {
  const danos = getDanos();
  const d = danos.find(x => x.id === id);
  if (d) abrirFormularioDano(d);
}

function resolverDano(id) {
  if (!confirm('Marcar este daño como resuelto?')) return;
  const danos = getDanos();
  const d = danos.find(x => x.id === id);
  if (d) {
    d.estado = 'resuelto';
    localStorage.setItem('db_danos', JSON.stringify(danos));
    showToast('Daño marcado como resuelto', 'success');
    cargarDanos();
  }
}

function eliminarDano(id) {
  if (!confirm('Eliminar este registro de daño?')) return;
  let danos = getDanos();
  danos = danos.filter(d => d.id !== id);
  localStorage.setItem('db_danos', JSON.stringify(danos));
  showToast('Daño eliminado', 'info');
  cargarDanos();
}

// ─── TINTORERÍA / LAVANDERÍA ───
function cargarTintoreria() {
  const list = document.getElementById('lavanderiaList');
  if (!list) return;

  const enLavanderia = getVestidos().filter(v => v.estado === 'lavanderia' || v.estado === 'reparacion');
  const lavanderia = enLavanderia.filter(v => v.estado === 'lavanderia');
  const reparacion = enLavanderia.filter(v => v.estado === 'reparacion');

  if (enLavanderia.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding:24px;text-align:center;color:var(--text-muted);">No hay vestidos en tintorería o reparación</div>`;
    return;
  }

  let html = '';

  if (lavanderia.length > 0) {
    html += `
      <div class="laundry-group">
        <div class="laundry-group-header">
          <span class="laundry-group-icon"><img src="../public/img/Iconos/Lavanderia.png" alt="Lavandería"></span>
          <span>Lavandería</span>
          <span class="laundry-group-count">${lavanderia.length}</span>
        </div>
        ${lavanderia.map(v => {
          const retorno = v.fecha_retorno_lavanderia || 'Sin fecha estimada';
          const hoy = new Date();
          const retDate = v.fecha_retorno_lavanderia ? new Date(v.fecha_retorno_lavanderia) : null;
          const vencido = retDate && retDate < hoy;
          return `
            <div class="laundry-card">
              <div class="laundry-card-left">
                <div class="laundry-card-icon"><img src="../public/img/Iconos/Lavanderia.png" alt="Lavandería"></div>
                <div class="laundry-info">
                  <h4>${formatDressName(v)}</h4>
                  <p class="laundry-return ${vencido ? 'overdue' : ''}">
                    Retorno: <strong>${retorno}</strong>
                    ${vencido ? '<span class="laundry-overdue-label">Vencido</span>' : ''}
                  </p>
                </div>
              </div>
              <div class="laundry-card-actions">
                <span class="badge badge-warning">Lavandería</span>
                <button class="btn btn-sm btn-outline" style="margin-left:8px;" onclick="editarEstadoLavanderia(${v.id})" title="Editar">✎</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  if (reparacion.length > 0) {
    html += `
      <div class="laundry-group">
        <div class="laundry-group-header">
          <span class="laundry-group-icon"><img src="../public/img/Iconos/Reparacion.png" alt="Reparación"></span>
          <span>Reparación</span>
          <span class="laundry-group-count">${reparacion.length}</span>
        </div>
        ${reparacion.map(v => {
          const retorno = v.fecha_retorno_lavanderia || 'Sin fecha estimada';
          return `
            <div class="laundry-card repair-card">
              <div class="laundry-card-left">
                <div class="laundry-card-icon"><img src="../public/img/Iconos/Reparacion.png" alt="Reparación"></div>
                <div class="laundry-info">
                  <h4>${formatDressName(v)}</h4>
                  <p class="laundry-return">Retorno estimado: <strong>${retorno}</strong></p>
                </div>
              </div>
              <div class="laundry-card-actions">
                <span class="badge badge-info">Reparación</span>
                <button class="btn btn-sm btn-outline" style="margin-left:8px;" onclick="editarEstadoLavanderia(${v.id})" title="Editar">✎</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  list.innerHTML = html;
}

function editarEstadoLavanderia(id) {
  const v = getVestidoById(id);
  if (!v) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = `
    <div class="modal" style="max-width:450px;">
      <div class="modal-header">
        <h3>Editar: ${formatDressName(v)}</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <form onsubmit="guardarEstadoLavanderia(event, ${id})" style="padding:16px;">
        <div class="form-group">
          <label>Estado</label>
          <select id="lavEditEstado" class="form-control" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px;">
            <option value="lavanderia" ${v.estado === 'lavanderia' ? 'selected' : ''}>Lavandería</option>
            <option value="reparacion" ${v.estado === 'reparacion' ? 'selected' : ''}>Reparación</option>
            <option value="disponible">Marcar como Devuelto / Disponible</option>
          </select>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Fecha estimada de retorno</label>
          <input type="date" id="lavEditFecha" class="form-control" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px;" value="${v.fecha_retorno_lavanderia || ''}">
        </div>
        <div class="form-actions" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function guardarEstadoLavanderia(event, id) {
  event.preventDefault();
  const nuevoEstado = document.getElementById('lavEditEstado').value;
  const nuevaFecha = document.getElementById('lavEditFecha').value;

  const vestidos = getVestidos();
  const idx = vestidos.findIndex(v => v.id === id);
  if (idx === -1) return;

  vestidos[idx].estado = nuevoEstado;
  vestidos[idx].fecha_retorno_lavanderia = nuevaFecha || '';
  saveVestidos(vestidos);
  showToast(`"${vestidos[idx].nombre}" actualizado: ${nuevoEstado}`, 'success');
  event.target.closest('.modal-overlay').remove();
  cargarTintoreria();
}

function cambiarEstadoCita(idCita, nuevoEstado) {
  actualizarEstadoCita(idCita, nuevoEstado);
  showToast(`Cita ${nuevoEstado} correctamente`, 'success');
  cargarDashboard();
  cargarEstadisticas();
}

// ─── INVENTARIO ───
let inventarioPagina = 1;
const INVENTARIO_POR_PAGINA = 10;

function renderizarInventario() {
  const body = document.getElementById('inventarioBody');
  if (!body) return;

  let vestidos = getVestidos();
  const search = document.getElementById('inventarioSearch')?.value.toLowerCase().trim();

  if (search) {
    const sku = v => (v.sku || `NDR-${String(v.id).padStart(3, '0')}`).toLowerCase();
    vestidos = vestidos.filter(v =>
      v.nombre.toLowerCase().includes(search) ||
      sku(v).includes(search) ||
      v.categoria.toLowerCase().includes(search) ||
      v.color.toLowerCase().includes(search)
    );
  }

  const totalPages = Math.ceil(vestidos.length / INVENTARIO_POR_PAGINA);
  if (inventarioPagina > totalPages) inventarioPagina = totalPages || 1;
  const start = (inventarioPagina - 1) * INVENTARIO_POR_PAGINA;
  const pageVestidos = vestidos.slice(start, start + INVENTARIO_POR_PAGINA);

  const estadoClass = {
    disponible: 'badge-success',
    agotado: 'badge-danger',
    lavanderia: 'badge-warning',
    reparacion: 'badge-info'
  };

  if (pageVestidos.length === 0) {
    body.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-muted);">No se encontraron vestidos</td></tr>`;
    updatePagination(0, 0);
    return;
  }

  body.innerHTML = pageVestidos.map(v => `
    <tr>
      <td><span style="font-family:monospace;font-size:0.8rem;background:var(--bg-light);padding:2px 6px;border-radius:4px;">${v.sku || 'NDR-'+String(v.id).padStart(3,'0')}</span></td>
      <td><strong>${v.nombre}</strong></td>
      <td>${v.categoria}</td>
      <td>${v.color}</td>
      <td>${Array.isArray(v.talla) ? v.talla.join(', ') : v.talla || ''}</td>
      <td>${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</td>
      <td>
        <select class="estado-select" data-id="${v.id}" onchange="cambiarEstadoVestido(${v.id}, this.value)" style="width:auto;padding:4px 8px;font-size:0.8rem;">
          <option value="disponible" ${v.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
          <option value="agotado" ${v.estado === 'agotado' ? 'selected' : ''}>Agotado</option>
          <option value="lavanderia" ${v.estado === 'lavanderia' ? 'selected' : ''}>Lavandería</option>
          <option value="reparacion" ${v.estado === 'reparacion' ? 'selected' : ''}>Reparación</option>
        </select>
      </td>
      <td>${v.disponibles}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-secondary" onclick="editarVestido(${v.id})">✎</button>
          <button class="btn btn-sm btn-outline" onclick="generarQR(${v.id})"> QR</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarVestido(${v.id})">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
  updatePagination(inventarioPagina, totalPages);
}

function updatePagination(current, total) {
  let container = document.getElementById('inventarioPagination');
  if (!container) {
    container = document.createElement('div');
    container.id = 'inventarioPagination';
    container.className = 'pagination';
    document.querySelector('.table-container').appendChild(container);
  }
  if (total <= 1) { container.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= total; i++) {
    html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="inventarioPagina=${i};renderizarInventario()">${i}</button>`;
  }
  container.innerHTML = html;
}

function cambiarEstadoVestido(id, nuevoEstado) {
  const vestidos = getVestidos();
  const v = vestidos.find(v => v.id === id);
  if (v) {
    v.estado = nuevoEstado;
    saveVestidos(vestidos);
    showToast(`"${formatDressName(v)}" ahora está: ${nuevoEstado}`, 'info');
  }
}

// ─── CRUD ───
function abrirFormularioNuevo() {
    document.getElementById('formTitle').textContent = '+ Agregar Nuevo Vestido';
  document.getElementById('editId').value = '';
  document.getElementById('vestidoForm').style.display = 'block';
  document.getElementById('vestidoForm').scrollIntoView({ behavior: 'smooth' });

  // Reset
  ['vNombre', 'vCategoria', 'vColor', 'vTallas', 'vPrecioRenta', 'vPrecioVenta',
   'vDisponibles', 'vImagen', 'vDescripcion', 'vTela', 'vSku', 'vCorte', 'vRentasCompletadas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('vEstado').value = 'disponible';
  document.querySelectorAll('#vTipoCuerpo input[type="checkbox"]').forEach(cb => cb.checked = false);
}

function cerrarFormulario() {
  document.getElementById('vestidoForm').style.display = 'none';
}

function guardarVestido(e) {
  e.preventDefault();

  const editId = document.getElementById('editId').value;
  const tallas = document.getElementById('vTallas').value.split(',').map(t => t.trim()).filter(t => t);

  const tipoCuerpo = Array.from(document.querySelectorAll('#vTipoCuerpo input[type="checkbox"]:checked')).map(cb => cb.value);

  const data = {
    nombre: document.getElementById('vNombre').value,
    categoria: document.getElementById('vCategoria').value,
    color: document.getElementById('vColor').value,
    talla: tallas,
    precio_renta: parseInt(document.getElementById('vPrecioRenta').value) || 0,
    precio_venta: parseInt(document.getElementById('vPrecioVenta').value) || 0,
    disponibles: parseInt(document.getElementById('vDisponibles').value) || 0,
    estado: document.getElementById('vEstado').value,
    imagen: document.getElementById('vImagen').value || 'https://picsum.photos/seed/dress/600/800',
    descripcion: document.getElementById('vDescripcion').value,
    tela: document.getElementById('vTela').value,
    tipo_cuerpo: tipoCuerpo.length > 0 ? tipoCuerpo : undefined,
    corte: document.getElementById('vCorte').value || undefined,
    rentas_completadas: parseInt(document.getElementById('vRentasCompletadas').value) || 0,
    sku: document.getElementById('vSku').value.trim() || undefined,
    imagenes_extra: []
  };

  let vestidos = getVestidos();

  if (editId) {
    const idx = vestidos.findIndex(v => v.id === parseInt(editId));
    if (idx !== -1) {
      if (!data.sku) data.sku = vestidos[idx].sku || `NDR-${String(vestidos[idx].id).padStart(3, '0')}`;
      vestidos[idx] = { ...vestidos[idx], ...data };
    }
    showToast('✓ Vestido actualizado', 'success');
  } else {
    data.id = Date.now();
    if (!data.sku) {
      data.sku = `NDR-${String(data.id).padStart(3, '0')}`;
    }
    vestidos.push(data);
    showToast('✓ Vestido agregado al catálogo', 'success');
  }

  saveVestidos(vestidos);
  cerrarFormulario();
  renderizarInventario();
}

function editarVestido(id) {
  const v = getVestidoById(id);
  if (!v) return;

  document.getElementById('formTitle').textContent = 'Editar Vestido';
  document.getElementById('editId').value = id;
  document.getElementById('vNombre').value = v.nombre;
  document.getElementById('vCategoria').value = v.categoria;
  document.getElementById('vColor').value = v.color;
  document.getElementById('vTallas').value = Array.isArray(v.talla) ? v.talla.join(', ') : v.talla || '';
  document.getElementById('vPrecioRenta').value = v.precio_renta;
  document.getElementById('vPrecioVenta').value = v.precio_venta || 0;
  document.getElementById('vDisponibles').value = v.disponibles;
  document.getElementById('vEstado').value = v.estado;
  document.getElementById('vImagen').value = v.imagen;
  document.getElementById('vDescripcion').value = v.descripcion;
  document.getElementById('vTela').value = v.tela;
  document.getElementById('vCorte').value = v.corte || '';
  document.getElementById('vRentasCompletadas').value = v.rentas_completadas || 0;
  document.getElementById('vSku').value = v.sku || '';
  document.querySelectorAll('#vTipoCuerpo input[type="checkbox"]').forEach(cb => {
    cb.checked = Array.isArray(v.tipo_cuerpo) && v.tipo_cuerpo.includes(cb.value);
  });

  document.getElementById('vestidoForm').style.display = 'block';
  document.getElementById('vestidoForm').scrollIntoView({ behavior: 'smooth' });
}

function eliminarVestido(id) {
  const v = getVestidoById(id);
  if (!v) return;
  if (!confirm(`¿Eliminar "${formatDressName(v)}" del catálogo?`)) return;

  let vestidos = getVestidos();
  vestidos = vestidos.filter(v => v.id !== id);
  saveVestidos(vestidos);
    showToast(`✗ "${formatDressName(v)}" eliminado`, 'info');
  renderizarInventario();
}

// ─── QR GENERATOR ───
function generarQR(id) {
  const v = getVestidoById(id);
  if (!v) return;

  const qrSection = document.getElementById('qrSection');
  const qrContainer = document.getElementById('qrCode');
  const qrInfo = document.getElementById('qrInfo');

  qrSection.style.display = 'block';
  qrSection.scrollIntoView({ behavior: 'smooth' });

  const sku = v.sku || `NDR-${String(v.id).padStart(3, '0')}`;
  const vestidoUrl = `${window.location.origin}/vestido.html?id=${v.id}&sku=${sku}`;

  // Generar QR: el QR contiene la URL del vestido + SKU
  qrContainer.innerHTML = `
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vestidoUrl)}" 
         alt="QR ${formatDressName(v)}"
         style="margin:0 auto;border-radius:8px;">
    <p style="margin-top:12px;padding:6px 12px;background:var(--bg-light);border-radius:6px;font-size:0.85rem;font-weight:700;color:var(--primary);font-family:monospace;">${sku}</p>
  `;

  qrInfo.innerHTML = `
    <strong>${formatDressName(v)}</strong><br>
    ID: #${v.id} · ${v.categoria} · ${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}<br>
    <a href="${vestidoUrl}" target="_blank" style="font-size:0.8rem;">Ver ficha del vestido</a>
  `;
}

function cerrarQR() {
  document.getElementById('qrSection').style.display = 'none';
}

// ─── ID Manual ───
function entrarIdManual() {
  const id = prompt('Ingresa el ID del vestido (número):');
  if (id && !isNaN(parseInt(id))) {
    const v = getVestidoById(parseInt(id));
    if (v) {
      mostrarResultadoScanner(v);
    } else {
      const err = document.getElementById('scannerError');
      const msg = document.getElementById('scannerErrorMessage');
      if (err && msg) {
        err.style.display = 'block';
        msg.textContent = `✗ No se encontró un vestido con ID #${id}`;
      }
    }
  }
}

// ─── USUARIOS ───
function renderizarUsuarios() {
  const body = document.getElementById('usuariosBody');
  if (!body) return;

  const usuarios = getUsuarios();
  if (usuarios.length === 0) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No hay usuarios registrados</td></tr>`;
    return;
  }

  body.innerHTML = usuarios.map(u => {
    const citas = getCitasByUsuario(u.id);
    return `
    <tr>
      <td>${u.id}</td>
      <td><strong>${u.nombre}</strong></td>
      <td>${u.correo}</td>
      <td>${u.telefono || '-'}</td>
      <td>${(u.favoritos || []).length} vestidos</td>
      <td><span class="badge ${u.correo === 'admin@boutique.com' ? 'badge-danger' : 'badge-success'}">${u.correo === 'admin@boutique.com' ? 'Admin' : 'Cliente'}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-outline" onclick="verCitasUsuario(${u.id})">${citas.length} cita(s)</button>
        </div>
      </td>
    </tr>
  `}).join('');
}

function verCitasUsuario(id) {
  const u = getUsuarioById(id);
  if (!u) return;

  const citas = getCitasByUsuario(id);
  const tipoLabel = { prueba: 'Prueba', renta: 'Renta', devolucion: 'Devolucion' };
  const statusClass = {
    pendiente: 'badge-warning', confirmada: 'badge-success',
    completada: 'badge-info', rechazada: 'badge-danger'
  };

  let html = `<div style="padding:16px;">`;
  html += `<h4 style="margin-bottom:4px;">${u.nombre}</h4>`;
  html += `<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">${u.correo} ${u.telefono ? '&middot; Tel: '+u.telefono : ''}</p>`;

  if (citas.length === 0) {
    html += `<p style="color:var(--text-muted);">Este usuario no tiene citas registradas.</p>`;
  } else {
    citas.sort((a, b) => b.fecha.localeCompare(a.fecha));
    html += citas.map(c => {
      const v = getVestidoById(c.id_vestido);
      const st = statusClass[c.estado_cita] || 'badge-default';
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong>${c.fecha}</strong> a las <strong>${c.hora}</strong>
          <br><span style="font-size:0.85rem;color:var(--text-muted);">
            ${v ? formatDressName(v) : '#'+c.id_vestido} &middot; ${tipoLabel[c.tipo] || c.tipo}
            ${c.notas ? '&middot; '+c.notas : ''}
          </span>
        </div>
        <span class="badge ${st}">${c.estado_cita.charAt(0).toUpperCase() + c.estado_cita.slice(1)}</span>
      </div>`;
    }).join('');
  }
  html += `</div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = `<div class="modal" style="max-width:550px;">
    <div class="modal-header">
      <h3>Citas de ${u.nombre}</h3>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
    </div>
    ${html}
  </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function enviarAnuncioGlobal() {
  const texto = document.getElementById('anuncioTexto');
  const status = document.getElementById('anuncioStatus');
  if (!texto || !texto.value.trim()) {
    if (status) status.textContent = 'Escribe un mensaje primero';
    return;
  }
  const anuncio = {
    id: Date.now(),
    mensaje: texto.value.trim(),
    fecha: new Date().toISOString().split('T')[0],
    leido: false
  };
  let anuncios = JSON.parse(localStorage.getItem('db_anuncios')) || [];
  anuncios.push(anuncio);
  localStorage.setItem('db_anuncios', JSON.stringify(anuncios));
  texto.value = '';
  if (status) {
    status.textContent = 'Anuncio enviado correctamente';
    status.style.color = 'var(--success)';
    setTimeout(() => { if (status) status.textContent = ''; }, 3000);
  }
}

// ─── INGRESOS ───
function renderizarIngresos() {
  const body = document.getElementById('ingresosBody');
  if (!body) return;

  let ingresos = JSON.parse(localStorage.getItem('db_ingresos')) || [];
  const total = ingresos.reduce((s, i) => s + (i.monto || 0), 0);

  if (ingresos.length === 0) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No hay ingresos registrados</td></tr>`;
    document.getElementById('totalIngresos').textContent = 'Q0.00';
    return;
  }

  ingresos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  body.innerHTML = ingresos.map(i => {
    const v = getVestidoById(i.id_vestido);
    const u = getUsuarioById(i.id_usuario);
    return `
      <tr>
        <td>${i.fecha}</td>
        <td><span class="badge ${i.concepto === 'renta' ? 'badge-success' : i.concepto === 'venta' ? 'badge-info' : 'badge-warning'}">${i.concepto}</span></td>
        <td>${v ? formatDressName(v) : '-'}</td>
        <td>${u ? u.nombre : '-'}</td>
        <td>${i.tipo_pago || 'Efectivo'}</td>
        <td style="font-weight:700;color:var(--success);">${i.monto.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</td>
        <td><button class="btn btn-sm btn-danger" onclick="eliminarIngreso(${i.id})">✕</button></td>
      </tr>
    `;
  }).join('');
  document.getElementById('totalIngresos').textContent = total.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' });
}

function mostrarFormularioIngreso() {
  document.getElementById('ingresoModal').style.display = 'flex';
  document.getElementById('ingresoEditId').value = '';
  document.getElementById('ingresoConcepto').value = 'renta';
  document.getElementById('ingresoMonto').value = '';
  document.getElementById('ingresoNotas').value = '';

  const vSelect = document.getElementById('ingresoVestido');
  vSelect.innerHTML = '<option value="">Ninguno</option>' +
    getVestidos().map(v => `<option value="${v.id}">${formatDressName(v)}</option>`).join('');

  const uSelect = document.getElementById('ingresoCliente');
  uSelect.innerHTML = '<option value="">Seleccionar...</option>' +
    getUsuarios().filter(u => u.rol !== 'admin').map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
}

function cerrarFormularioIngreso() {
  document.getElementById('ingresoModal').style.display = 'none';
}

function guardarIngreso(e) {
  e.preventDefault();
  const data = {
    id: Date.now(),
    fecha: new Date().toISOString().split('T')[0],
    concepto: document.getElementById('ingresoConcepto').value,
    id_vestido: parseInt(document.getElementById('ingresoVestido').value) || null,
    id_usuario: parseInt(document.getElementById('ingresoCliente').value) || null,
    monto: parseFloat(document.getElementById('ingresoMonto').value) || 0,
    tipo_pago: 'Efectivo',
    notas: document.getElementById('ingresoNotas').value
  };

  let ingresos = JSON.parse(localStorage.getItem('db_ingresos')) || [];
  ingresos.push(data);
  localStorage.setItem('db_ingresos', JSON.stringify(ingresos));
  showToast(`✓ Ingreso de ${data.monto.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })} registrado`, 'success');
  cerrarFormularioIngreso();
  renderizarIngresos();
}

function eliminarIngreso(id) {
  if (!confirm('Eliminar este registro de ingreso?')) return;
  let ingresos = JSON.parse(localStorage.getItem('db_ingresos')) || [];
  ingresos = ingresos.filter(i => i.id !== id);
  localStorage.setItem('db_ingresos', JSON.stringify(ingresos));
  showToast('Ingreso eliminado', 'info');
  renderizarIngresos();
}

function exportarIngresosCSV() {
  const ingresos = JSON.parse(localStorage.getItem('db_ingresos')) || [];
  if (ingresos.length === 0) {
    showToast('No hay ingresos para exportar', 'warning');
    return;
  }
  let csv = 'Fecha,Concepto,ID Vestido,ID Cliente,Monto,Tipo Pago,Notas\n';
  ingresos.forEach(i => {
    csv += `${i.fecha},${i.concepto},${i.id_vestido || ''},${i.id_usuario || ''},${i.monto},${i.tipo_pago || 'Efectivo'},"${(i.notas || '').replace(/"/g, '""')}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ingresos_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast('✓ CSV exportado', 'success');
}

// ─── CALENDARIO ADMIN ───
let adminCalendarDate = new Date();

function renderizarCalendarioAdmin() {
  const widget = document.getElementById('adminCalendarWidget');
  const mesLabel = document.getElementById('adminMesActual');
  if (!widget) return;

  const year = adminCalendarDate.getFullYear();
  const month = adminCalendarDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  if (mesLabel) mesLabel.textContent = `${monthNames[month]} ${year}`;

  const citas = getCitas().filter(c => c.estado_cita !== 'rechazada');
  const citasByDate = {};
  citas.forEach(c => {
    if (!citasByDate[c.fecha]) citasByDate[c.fecha] = [];
    citasByDate[c.fecha].push(c);
  });

  let days = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">';
  const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  dayNames.forEach(d => { days += `<div style="text-align:center;font-size:0.75rem;font-weight:600;color:var(--text-muted);padding:8px 0;">${d}</div>`; });

  for (let i = 0; i < firstDay; i++) {
    days += '<div></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = date.getTime() === today.getTime();
    const dayCitas = citasByDate[dateStr] || [];
    const count = dayCitas.length;

    days += `<div onclick="mostrarCitasDelDia('${dateStr}')" style="cursor:pointer;text-align:center;padding:6px 0;border-radius:8px;${isToday ? 'background:var(--primary);color:white;font-weight:700;' : 'background:var(--bg-light);'}font-size:0.85rem;position:relative;">
      ${d}
      ${count > 0 ? `<div style="position:absolute;top:-2px;right:-2px;background:var(--primary);color:white;font-size:0.6rem;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;">${count}</div>` : ''}
    </div>`;
  }
  days += '</div>';

  widget.innerHTML = days;
}

function adminCambiarMes(delta) {
  adminCalendarDate.setMonth(adminCalendarDate.getMonth() + delta);
  renderizarCalendarioAdmin();
}

function mostrarCitasDelDia(dateStr) {
  const citas = getCitas().filter(c => c.fecha === dateStr && c.estado_cita !== 'rechazada');
  const tipoLabel = { prueba: 'Prueba', renta: 'Renta', devolucion: 'Devolucion' };

  let info = `<div style="padding:16px;max-height:400px;overflow-y:auto;">`;
  info += `<h4 style="margin-bottom:12px;">Citas del ${dateStr}</h4>`;

  if (citas.length === 0) {
    info += `<p style="color:var(--text-muted);">No hay citas programadas para este dia.</p>`;
  } else {
    info += citas.map(c => {
      const u = getUsuarioById(c.id_usuario);
      const v = getVestidoById(c.id_vestido);
      const st = c.estado_cita.charAt(0).toUpperCase() + c.estado_cita.slice(1);
      return `<div style="padding:8px 0;border-bottom:1px solid var(--border-light);">
        <strong>${c.hora}</strong> - ${u ? u.nombre : 'Usuario #'+c.id_usuario}
        <br><span style="font-size:0.85rem;color:var(--text-muted);">
          ${v ? formatDressName(v) : '#'+c.id_vestido} &middot; ${tipoLabel[c.tipo] || c.tipo} &middot; ${st}
        </span>
      </div>`;
    }).join('');
  }
  info += `</div>`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'flex';
  overlay.innerHTML = `<div class="modal" style="max-width:500px;">
    <div class="modal-header">
      <h3>Citas del ${dateStr}</h3>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
    </div>
    ${info}
  </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
