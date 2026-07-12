/**
 * ============================================================
 *  B2B Boutique - Lógica de Catálogo
 *  ============================================================
 *  Renderizado de tarjetas, filtros combinados, búsqueda.
 * ============================================================
 */

// ─── ESTADO DE FILTROS ───
const estadoFiltros = {
  categoria: '',
  color: '',
  talla: '',
  precioMin: 0,
  precioMax: Infinity,
  soloRenta: false,
  soloVenta: false,
  busqueda: '',
  sort: 'default'
};

// ─── CREAR CARD DE VESTIDO ───
function crearCardVestido(v) {
  const estadoClass = v.estado === 'disponible' && v.disponibles > 0 ? 'badge-success' : 'badge-danger';
  const estadoText = v.estado === 'disponible' && v.disponibles > 0 ? 'Disponible' : 'Agotado';
  
  // Gatillo de urgencia: si el vestido tiene alta demanda (>20 rentas) y pocos disponibles
  const showUrgency = v.rentas_completadas > 20 && v.disponibles <= 2 && v.disponibles > 0;
  const currentUser = getCurrentUser();
  const isFav = currentUser ? esFavorito(currentUser.id, v.id) : false;

  const isAdmin = currentUser?.correo === 'admin@boutique.com';

  return `
    <div class="product-card" onclick="window.location.href='vestido.html?id=${v.id}'">
      <div class="product-card-image">
        <img src="${getImageUrl(v)}" alt="${v.nombre}" loading="lazy">
        ${isAdmin ? `<a href="admin/inventario.html?edit=${v.id}" class="admin-edit-btn" onclick="event.stopPropagation()" title="Editar vestido">✎</a>` : ''}
        <button class="favorite-btn ${isFav ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavoritoCatalog(${v.id})"
                title="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
          ${isFav ? '♥' : '♡'}
        </button>
        <span class="badge ${estadoClass} status-badge">${estadoText}</span>
        ${showUrgency ? '<span class="urgency-badge">Alta demanda</span>' : ''}
      </div>
      <div class="product-card-body">
        <h3>${v.nombre}</h3>
        <div class="product-sku">${v.sku || 'NDR-'+String(v.id).padStart(3,'0')}</div>
        <div class="category">${v.categoria} · ${v.color}</div>
        <div class="price-row">
          <div>
            <div class="price">${(v.precio_renta || 0).toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</div>
            <span class="price-label">Renta por evento</span>
          </div>
          ${v.precio_venta ? `<div style="text-align:right;">
            <div class="price" style="font-size:0.95rem;">${v.precio_venta.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ' })}</div>
            <span class="price-label">Venta</span>
          </div>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── RENDERIZAR VESTIDOS ───
function renderizarVestidos(vestidos) {
  const grid = document.getElementById('catalogGrid');
  const count = document.getElementById('resultCount');

  if (!grid) return;

  if (vestidos.length === 0) {
    grid.innerHTML = `
      <div class="catalog-empty" style="grid-column:1/-1;">
        <div class="empty-icon">◈</div>
        <h3>No encontramos vestidos</h3>
        <p>Intenta con otros filtros o categorías</p>
        <button class="btn btn-secondary mt-3" onclick="limpiarFiltros()">Limpiar filtros</button>
      </div>
    `;
    if (count) count.textContent = 'Mostrando 0 vestidos';
    return;
  }

  grid.innerHTML = vestidos.map(v => crearCardVestido(v)).join('');
  if (count) count.textContent = `Mostrando ${vestidos.length} vestidos`;
}

// ─── APLICAR FILTROS ───
function aplicarFiltros() {
  // Leer estado de los filtros desde el DOM
  const precMin = document.getElementById('precioMin');
  const precMax = document.getElementById('precioMax');
  const searchInput = document.getElementById('searchInput');
  const soloRenta = document.getElementById('soloRenta');
  const soloVenta = document.getElementById('soloVenta');
  const sortSelect = document.getElementById('sortSelect');

  estadoFiltros.precioMin = precMin ? parseFloat(precMin.value) || 0 : 0;
  estadoFiltros.precioMax = precMax ? parseFloat(precMax.value) || Infinity : Infinity;
  estadoFiltros.busqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';
  estadoFiltros.soloRenta = soloRenta ? soloRenta.checked : false;
  estadoFiltros.soloVenta = soloVenta ? soloVenta.checked : false;
  estadoFiltros.sort = sortSelect ? sortSelect.value : 'default';

  let resultados = getVestidos();

  // Excluir vestidos en lavandería o reparación (ocultos del catálogo público)
  resultados = resultados.filter(v => v.estado !== 'lavanderia' && v.estado !== 'reparacion');

    // Filtro categoría
  if (estadoFiltros.categoria) {
    resultados = resultados.filter(v => v.categoria === estadoFiltros.categoria);
  }

  // Filtro color
  if (estadoFiltros.color) {
    resultados = resultados.filter(v => v.color === estadoFiltros.color);
  }

  // Filtro talla
  if (estadoFiltros.talla) {
    resultados = resultados.filter(v => v.talla.includes(estadoFiltros.talla));
  }

  // Filtro precio
  resultados = resultados.filter(v => {
    const precio = v.precio_renta;
    return precio >= estadoFiltros.precioMin && precio <= estadoFiltros.precioMax;
  });

  // Filtro búsqueda
  if (estadoFiltros.busqueda) {
    const q = estadoFiltros.busqueda;
    resultados = resultados.filter(v =>
      v.nombre.toLowerCase().includes(q) ||
      v.categoria.toLowerCase().includes(q) ||
      v.color.toLowerCase().includes(q) ||
      (v.sku && v.sku.toLowerCase().includes(q))
    );
  }

  // Filtro soloVenta (si está activo solo venta)
  if (estadoFiltros.soloVenta && !estadoFiltros.soloRenta) {
    resultados = resultados.filter(v => v.precio_venta > 0);
  }

  // Filtro soloRenta
  if (estadoFiltros.soloRenta && !estadoFiltros.soloVenta) {
    resultados = resultados.filter(v => !v.precio_venta || v.precio_venta === 0);
  }

  // Ordenar
  switch (estadoFiltros.sort) {
    case 'precio-asc':
      resultados.sort((a, b) => a.precio_renta - b.precio_renta);
      break;
    case 'precio-desc':
      resultados.sort((a, b) => b.precio_renta - a.precio_renta);
      break;
    case 'nombre':
      resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
  }

  renderizarVestidos(resultados);
}

// ─── FILTROS INDIVIDUALES ───
function filtrarPorCategoria(btn) {
  document.querySelectorAll('#filterCategorias .filter-category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  estadoFiltros.categoria = btn.dataset.categoria;
  aplicarFiltros();
}

function filtrarPorColor(btn) {
  document.querySelectorAll('#filterColores .color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.toggle('active');
  estadoFiltros.color = btn.classList.contains('active') ? btn.dataset.color : '';
  aplicarFiltros();
}

function filtrarPorTalla(btn) {
  document.querySelectorAll('#filterTallas .size-chip').forEach(b => b.classList.remove('active'));
  btn.classList.toggle('active');
  estadoFiltros.talla = btn.classList.contains('active') ? btn.dataset.talla : '';
  aplicarFiltros();
}

function filtrarPorPrecio() {
  aplicarFiltros();
}

function limpiarFiltros() {
  estadoFiltros.categoria = '';
  estadoFiltros.color = '';
  estadoFiltros.talla = '';
  estadoFiltros.precioMin = 0;
  estadoFiltros.precioMax = Infinity;
  estadoFiltros.soloRenta = false;
  estadoFiltros.soloVenta = false;
  estadoFiltros.busqueda = '';

  // Resetear DOM
  document.querySelectorAll('.filter-category-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.size-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.filter-body-btn').forEach(b => b.classList.remove('active'));

  const precMin = document.getElementById('precioMin');
  const precMax = document.getElementById('precioMax');
  const searchInput = document.getElementById('searchInput');
  const soloRenta = document.getElementById('soloRenta');
  const soloVenta = document.getElementById('soloVenta');
  const sortSelect = document.getElementById('sortSelect');

  if (precMin) precMin.value = '';
  if (precMax) precMax.value = '';
  if (searchInput) searchInput.value = '';
  if (soloRenta) soloRenta.checked = false;
  if (soloVenta) soloVenta.checked = false;
  if (sortSelect) sortSelect.value = 'default';

  aplicarFiltros();
}

// ─── TOGGLE FAVORITO DESDE CATÁLOGO ───
function toggleFavoritoCatalog(idVestido) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Debes iniciar sesión para guardar favoritos', 'warning');
    openLoginModal();
    return;
  }
  toggleFavorito(user.id, idVestido);
  const isFav = esFavorito(user.id, idVestido);
  showToast(isFav ? '¡Vestido guardado en tu Wishlist!' : ' Eliminado de favoritos', isFav ? 'success' : 'info');
  aplicarFiltros(); // Re-render para actualizar el corazón
}

// ─── INICIALIZAR CATÁLOGO ───
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return; // No estamos en la página de catálogo

  // Leer parámetros de URL
  const params = new URLSearchParams(window.location.search);
  const categoriaUrl = params.get('categoria');
  const tab = params.get('tab');

  if (categoriaUrl) {
    estadoFiltros.categoria = categoriaUrl;
    const btn = document.querySelector(`#filterCategorias .filter-category-btn[data-categoria="${categoriaUrl}"]`);
    if (btn) btn.classList.add('active');
  }

  if (tab === 'favoritos') {
    const user = getCurrentUser();
    if (user) {
      const favoritos = getVestidosFavoritos(user.favoritos);
      renderizarVestidos(favoritos);
      const count = document.getElementById('resultCount');
      if (count) count.textContent = 'Mostrando favoritos';
      return;
    } else {
      openLoginModal();
    }
  }

  aplicarFiltros();
});
