/* ============================================================
   LUNETTE — Render de páginas
   ============================================================ */

function lfPageName() {
  return document.body.dataset.page || '';
}

function lfStars(rating) {
  const full = Math.round(rating || 0);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
}

function lfProductImageStyle(product) {
  return `filter:hue-rotate(${Number(product.tint || 0)}deg) saturate(1.08);`;
}

/* ─── Home ─── */
function lfRenderHome() {
  const hero = document.getElementById('heroCarousel');
  if (hero) {
    const picks = LUNETTE_PRODUCTS.filter(p => p.badge === 'best' || p.badge === 'new').slice(0, 3);
    hero.innerHTML = `
      <div class="hc-slides">
        ${picks.map((product, index) => `
          <a href="${lunetteProductUrl(product)}" class="hc-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${product.image}" alt="${product.name}" style="${lfProductImageStyle(product)}">
            <div class="hc-overlay">
              <span class="hc-badge">${lunetteCategoryBySlug(product.category)?.name || product.category}</span>
              <h3 class="hc-name">${product.name}</h3>
              <p class="hc-price">${lfMoney(product.price)}</p>
            </div>
          </a>
        `).join('')}
      </div>
      <div class="hc-dots">
        ${picks.map((_, index) => `<button class="hc-dot ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Slide ${index + 1}"></button>`).join('')}
      </div>
    `;

    const slides = hero.querySelectorAll('.hc-slide');
    const dots = hero.querySelectorAll('.hc-dot');
    let current = 0;
    const goTo = index => {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      slides[index]?.classList.add('active');
      dots[index]?.classList.add('active');
      current = index;
    };
    dots.forEach(dot => dot.addEventListener('click', () => goTo(Number(dot.dataset.index))));
    if (slides.length > 1) {
      window.setInterval(() => goTo((current + 1) % slides.length), 4200);
    }
  }

  const featured = document.getElementById('featuredSlider');
  if (featured) {
    const picks = LUNETTE_PRODUCTS.filter(p => p.badge === 'best' || p.badge === 'new').slice(0, 6);
    lfRenderGrid(featured, picks);
  }

  const categories = document.getElementById('homeCategories');
  if (categories) {
    categories.innerHTML = LUNETTE_CATEGORIES.map(category => `
      <a href="catalogo.html?categoria=${category.slug}" class="card category-card">
        <div class="lf-category-media"><img src="${category.image}" alt="${category.name}" loading="lazy"></div>
        <div class="category-card-footer">
          <h3>${category.emoji} ${category.name}</h3>
          <p>${category.blurb}</p>
        </div>
      </a>
    `).join('');
  }

  const arrivals = document.getElementById('homeProducts');
  if (arrivals) {
    lfRenderGrid(arrivals, LUNETTE_PRODUCTS.slice(0, 8));
  }
}

function lfBindHomeSlider() {
  const track = document.getElementById('featuredSlider');
  const prev = document.getElementById('featuredPrev');
  const next = document.getElementById('featuredNext');
  if (!track) return;
  const step = 304;
  prev?.addEventListener('click', () => track.scrollBy({ left: -step, behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step, behavior: 'smooth' }));
}

/* ─── Catalog ─── */
const lfCatalogState = {
  category: '',
  color: '',
  size: '',
  min: '',
  max: '',
  query: '',
  sort: 'default'
};

let lfFiltersStaticsBound = false;

function lfReadCatalogParams() {
  const params = new URLSearchParams(window.location.search);
  lfCatalogState.category = params.get('categoria') || '';
  lfCatalogState.color = params.get('color') || '';
  lfCatalogState.size = params.get('talla') || '';
  lfCatalogState.query = params.get('buscar') || '';
  lfCatalogState.min = params.get('min') || '';
  lfCatalogState.max = params.get('max') || '';
}

function lfSyncCatalogParams() {
  const params = new URLSearchParams();
  if (lfCatalogState.category) params.set('categoria', lfCatalogState.category);
  if (lfCatalogState.color) params.set('color', lfCatalogState.color);
  if (lfCatalogState.size) params.set('talla', lfCatalogState.size);
  if (lfCatalogState.query) params.set('buscar', lfCatalogState.query);
  if (lfCatalogState.min) params.set('min', lfCatalogState.min);
  if (lfCatalogState.max) params.set('max', lfCatalogState.max);
  const query = params.toString();
  const url = window.location.pathname + (query ? '?' + query : '');
  window.history.replaceState(null, '', url);
}

function lfBuildCatalogFilters() {
  const categoryHost = document.getElementById('filterCategorias');
  if (categoryHost) {
    categoryHost.innerHTML = `
      <button class="filter-category-btn ${!lfCatalogState.category ? 'active' : ''}" data-cat="">Todas</button>
      ${LUNETTE_CATEGORIES.map(category => `
        <button class="filter-category-btn ${lfCatalogState.category === category.slug ? 'active' : ''}" data-cat="${category.slug}">
          ${category.emoji} ${category.name}
        </button>
      `).join('')}
    `;
  }

  const colorHost = document.getElementById('filterColores');
  if (colorHost) {
    const colorMap = {
      'Rosa': '#f9a8d4', 'Blanco': '#ffffff', 'Negro': '#27272a', 'Marfil': '#f5f0df',
      'Lavanda': '#c4b5fd', 'Plateado': '#cbd5e1', 'Dorado': '#e6c56a', 'Cereza': '#be123c',
      'Denim claro': '#93c5fd', 'Denim rosa': '#f9a8d4', 'Lila': '#d8b4fe', 'Magenta': '#db2777',
      'Rosa pastel': '#fbcfe8', 'Rosa metal': '#e879f9', 'Perla': '#f1f5f9', 'Rojo': '#dc2626'
    };
    colorHost.innerHTML = LUNETTE_COLORS.map(color => `
      <button class="color-swatch ${lfCatalogState.color === color ? 'active' : ''}"
              data-color="${color}" title="${color}" aria-label="${color}"
              style="background:${colorMap[color] || '#f9a8d4'};"></button>
    `).join('');
  }

  const sizeHost = document.getElementById('filterTallas');
  if (sizeHost) {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'Única'];
    sizeHost.innerHTML = sizes.map(size => `
      <button class="size-chip ${lfCatalogState.size === size ? 'active' : ''}" data-size="${size}">${size}</button>
    `).join('');
  }

  const search = document.getElementById('catalogSearch');
  if (search) search.value = lfCatalogState.query;
  const min = document.getElementById('precioMin');
  if (min) min.value = lfCatalogState.min;
  const max = document.getElementById('precioMax');
  if (max) max.value = lfCatalogState.max;
  const sort = document.getElementById('sortSelect');
  if (sort) sort.value = lfCatalogState.sort;

  document.querySelectorAll('[data-cat]').forEach(button => {
    button.addEventListener('click', () => {
      lfCatalogState.category = button.dataset.cat;
      document.querySelectorAll('[data-cat]').forEach(btn => btn.classList.toggle('active', btn === button));
      lfApplyCatalogFilters();
    });
  });

  document.querySelectorAll('[data-color]').forEach(button => {
    button.addEventListener('click', () => {
      const color = button.dataset.color;
      lfCatalogState.color = lfCatalogState.color === color ? '' : color;
      document.querySelectorAll('[data-color]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === lfCatalogState.color);
      });
      lfApplyCatalogFilters();
    });
  });

  document.querySelectorAll('[data-size]').forEach(button => {
    button.addEventListener('click', () => {
      const size = button.dataset.size;
      lfCatalogState.size = lfCatalogState.size === size ? '' : size;
      document.querySelectorAll('[data-size]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === lfCatalogState.size);
      });
      lfApplyCatalogFilters();
    });
  });

  if (lfFiltersStaticsBound) return;
  lfFiltersStaticsBound = true;

  search?.addEventListener('input', () => {
    lfCatalogState.query = search.value.trim();
    lfApplyCatalogFilters();
  });

  min?.addEventListener('input', () => {
    lfCatalogState.min = min.value;
    lfApplyCatalogFilters();
  });
  max?.addEventListener('input', () => {
    lfCatalogState.max = max.value;
    lfApplyCatalogFilters();
  });

  sort?.addEventListener('change', () => {
    lfCatalogState.sort = sort.value;
    lfApplyCatalogFilters();
  });

  document.getElementById('clearFilters')?.addEventListener('click', () => {
    Object.assign(lfCatalogState, { category: '', color: '', size: '', min: '', max: '', query: '', sort: 'default' });
    lfBuildCatalogFilters();
    lfApplyCatalogFilters();
  });

  document.getElementById('applyFilters')?.addEventListener('click', lfApplyCatalogFilters);

  const toggle = document.getElementById('filtersToggle');
  const sidebar = document.getElementById('filtersSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('lf-open'));
  }
}

function lfApplyCatalogFilters() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;

  let products = LUNETTE_PRODUCTS.slice();
  const state = lfCatalogState;

  if (state.category) products = products.filter(p => p.category === state.category);
  if (state.color) products = products.filter(p => p.colors.includes(state.color));
  if (state.size) products = products.filter(p => p.sizes.includes(state.size));
  if (state.min !== '') products = products.filter(p => p.price >= Number(state.min));
  if (state.max !== '') products = products.filter(p => p.price <= Number(state.max));

  if (state.query) {
    const query = state.query.toLowerCase();
    products = products.filter(product => {
      const category = lunetteCategoryBySlug(product.category)?.name || '';
      return [product.name, product.description, product.sku, category, ...product.colors]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  if (state.sort === 'precio-asc') products.sort((a, b) => a.price - b.price);
  if (state.sort === 'precio-desc') products.sort((a, b) => b.price - a.price);
  if (state.sort === 'nombre') products.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === 'rating') products.sort((a, b) => b.rating - a.rating);

  lfRenderGrid(grid, products, 'Prueba con otra categoría, color o rango de precio.');
  const count = document.getElementById('resultCount');
  if (count) {
    count.textContent = `Mostrando ${products.length} ${products.length === 1 ? 'producto' : 'productos'}`;
  }
  lfSyncCatalogParams();
}

function lfRenderCatalog() {
  lfReadCatalogParams();
  lfBuildCatalogFilters();
  lfApplyCatalogFilters();
}

/* ─── Product detail ─── */
function lfRenderProductDetail() {
  const host = document.getElementById('productDetail');
  if (!host) return;

  const params = new URLSearchParams(window.location.search);
  const product = lunetteProductById(params.get('id') || params.get('producto'));

  if (!product) {
    host.innerHTML = `
      <div class="catalog-empty" style="grid-column:1/-1;">
        <div class="empty-icon">♡</div>
        <h3>No encontramos ese producto</h3>
        <p>Puede que ya no esté disponible. Mira el resto de la colección.</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top:18px;">Ver catálogo</a>
      </div>
    `;
    return;
  }

  document.title = product.name + ' · Lunette';
  const category = lunetteCategoryBySlug(product.category);
  const badge = lunetteBadge(product);
  const favorite = lfIsFavorite(product.id);
  const oldPrice = product.oldPrice
    ? `<span class="lf-detail-old">${lfMoney(product.oldPrice)}</span>`
    : '';

  host.innerHTML = `
    <div class="product-gallery">
      <div class="product-main-image">
        <img src="${product.image}" alt="${product.name}" style="${lfProductImageStyle(product)}">
      </div>
      <div class="product-thumbnails">
        <div class="product-thumbnail active"><img src="${product.image}" alt="${product.name}" style="${lfProductImageStyle(product)}"></div>
        <div class="product-thumbnail"><img src="${product.image}" alt="${product.name} detalle" style="filter:hue-rotate(${Number(product.tint || 0) + 12}deg) saturate(1.15);"></div>
        <div class="product-thumbnail"><img src="${LUNETTE_IMG.outfits}" alt="Inspiración Lunette" style="filter:hue-rotate(${Number(product.tint || 0)}deg);"></div>
      </div>
    </div>

    <div class="product-info">
      <div class="product-category">${category?.emoji || '♡'} ${category?.name || product.category}</div>
      <h1>${product.name}</h1>
      <div class="product-sku">${product.sku}</div>
      ${badge ? `<span class="badge ${badge.className}">${badge.label}</span>` : ''}

      <div class="lf-detail-rating">
        <span>${lfStars(product.rating)}</span>
        ${product.rating.toFixed(1)} · ${product.reviews} reseñas
      </div>

      <div class="lf-detail-price-row">
        <div class="product-price">${lfMoney(product.price)}</div>
        ${oldPrice}
      </div>
      <div class="product-price-sub">Precio en quetzales · Envío ${lfMoney(LUNETTE_STORE.shipping)}</div>

      <p class="product-description">${product.description}</p>

      <div class="product-meta">
        <span class="product-meta-item">✦ ${product.colors.join(' / ')}</span>
        <span class="product-meta-item">♡ ${product.sizes.join(' · ')}</span>
      </div>

      <div class="lf-option-label">Talla <span>${product.sizes.length > 1 ? 'Elige la tuya' : 'Talla única'}</span></div>
      <div class="lf-size-row" id="lfSizeRow">
        ${product.sizes.map((size, index) => `
          <button class="lf-size-pill ${index === 0 ? 'active' : ''}" type="button" data-size="${size}">${size}</button>
        `).join('')}
      </div>

      <div class="lf-option-label">Cantidad</div>
      <div class="lf-detail-actions">
        <div class="lf-qty">
          <button type="button" id="lfQtyMinus" aria-label="Quitar uno">−</button>
          <span id="lfQtyValue">1</span>
          <button type="button" id="lfQtyPlus" aria-label="Agregar uno">+</button>
        </div>
        <button class="btn btn-primary" type="button" id="lfDetailAdd">Agregar al carrito</button>
        <button class="lf-fav-detail ${favorite ? 'active' : ''}" type="button" id="lfDetailFav" aria-label="Favorito">
          ${favorite ? '♥' : '♡'}
        </button>
      </div>

      <div class="lf-ship-note">
        <strong>Envío gratis</strong> en compras desde ${lfMoney(LUNETTE_STORE.freeShippingFrom)}. Entregas en ${LUNETTE_STORE.city} y departamentos.
      </div>

      <div class="lf-option-label" style="margin-top:24px;">Detalles</div>
      <ul class="lf-detail-list">
        ${product.details.map(detail => `<li>${detail}</li>`).join('')}
      </ul>
    </div>
  `;

  let quantity = 1;
  const qtyValue = document.getElementById('lfQtyValue');
  document.getElementById('lfQtyMinus')?.addEventListener('click', () => {
    quantity = Math.max(1, quantity - 1);
    qtyValue.textContent = quantity;
  });
  document.getElementById('lfQtyPlus')?.addEventListener('click', () => {
    quantity = Math.min(99, quantity + 1);
    qtyValue.textContent = quantity;
  });

  document.querySelectorAll('#lfSizeRow .lf-size-pill').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#lfSizeRow .lf-size-pill').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  document.getElementById('lfDetailAdd')?.addEventListener('click', () => {
    const size = document.querySelector('#lfSizeRow .lf-size-pill.active')?.dataset.size || product.sizes[0];
    lfAddToCart(product.id, size, quantity);
  });

  document.getElementById('lfDetailFav')?.addEventListener('click', function () {
    const active = lfToggleFavorite(product.id);
    this.classList.toggle('active', active);
    this.textContent = active ? '♥' : '♡';
  });

  const relatedIds = [];
  LUNETTE_PRODUCTS
    .filter(item => item.category === product.category && item.id !== product.id)
    .forEach(item => relatedIds.push(item.id));
  LUNETTE_PRODUCTS
    .filter(item => item.id !== product.id && !relatedIds.includes(item.id))
    .forEach(item => relatedIds.push(item.id));

  const related = relatedIds.slice(0, 4).map(lunetteProductById);
  lfRenderGrid(document.getElementById('relatedGrid'), related);
}

/* ─── Cart page ─── */
function lfRenderCartPage() {
  const host = document.getElementById('lfCartContent');
  if (!host) return;
  const cart = lfCart();

  if (!cart.length) {
    host.innerHTML = `
      <div class="catalog-empty" style="padding:60px 24px;">
        <div class="empty-icon">🛍</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega tus piezas favoritas para comenzar tu pedido.</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top:18px;">Explorar catálogo</a>
      </div>
    `;
    return;
  }

  const subtotal = lfCartSubtotal();
  const shipping = lfShipping(subtotal);
  const total = subtotal + shipping;
  const missing = Math.max(0, LUNETTE_STORE.freeShippingFrom - subtotal);
  const progress = Math.min(100, (subtotal / LUNETTE_STORE.freeShippingFrom) * 100);

  host.innerHTML = `
    <div class="lf-cart-layout">
      <div>
        <div class="lf-cart-table">
          <div class="lf-cart-table-head">
            <span>Producto</span><span>Precio</span><span>Total</span>
          </div>
          ${cart.map(line => {
            const product = lunetteProductById(line.id);
            if (!product) return '';
            return `
              <div class="lf-cart-row">
                <div class="lf-cart-product">
                  <img src="${product.image}" alt="${product.name}" style="${lfProductImageStyle(product)}">
                  <div>
                    <a href="${lunetteProductUrl(product)}">${product.name}</a>
                    <span>Talla ${line.size} · ${product.sku}</span>
                    <div class="lf-qty" style="margin-top:8px;">
                      <button type="button" data-lf-qty="-1" data-key="${line.key}" aria-label="Quitar uno">−</button>
                      <span>${line.qty}</span>
                      <button type="button" data-lf-qty="1" data-key="${line.key}" aria-label="Agregar uno">+</button>
                    </div>
                  </div>
                </div>
                <div class="lf-cart-row-price">${lfMoney(product.price)}</div>
                <div class="lf-cart-row-total">
                  ${lfMoney(product.price * line.qty)}
                  <button class="lf-remove" type="button" data-lf-remove="${line.key}">Eliminar</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="lf-checkout">
          <h3>Datos de entrega</h3>
          <p>Completa tus datos para registrar tu pedido. Te contactaremos para coordinar el pago y la entrega.</p>
          <form id="lfCheckoutForm" novalidate>
            <div class="lf-form-grid">
              <div class="form-group lf-full">
                <label for="lfName">Nombre completo *</label>
                <input type="text" id="lfName" name="name" required placeholder="Tu nombre">
              </div>
              <div class="form-group">
                <label for="lfPhone">Teléfono / WhatsApp *</label>
                <input type="tel" id="lfPhone" name="phone" required placeholder="5555 5555">
              </div>
              <div class="form-group">
                <label for="lfEmail">Correo electrónico</label>
                <input type="email" id="lfEmail" name="email" placeholder="tu@correo.com">
              </div>
              <div class="form-group lf-full">
                <label for="lfAddress">Dirección de entrega *</label>
                <input type="text" id="lfAddress" name="address" required placeholder="Zona, calle, número de casa">
              </div>
              <div class="form-group">
                <label for="lfCity">Ciudad / Departamento *</label>
                <input type="text" id="lfCity" name="city" required placeholder="Guatemala">
              </div>
              <div class="form-group">
                <label for="lfPayment">Método de pago *</label>
                <select id="lfPayment" name="payment" required>
                  <option value="Transferencia bancaria">Transferencia bancaria</option>
                  <option value="Pago contra entrega">Pago contra entrega</option>
                  <option value="Depósito">Depósito</option>
                </select>
              </div>
              <div class="form-group lf-full">
                <label for="lfNotes">Notas del pedido</label>
                <textarea id="lfNotes" name="notes" placeholder="Referencias de entrega, horario, etc."></textarea>
              </div>
              <div class="lf-full">
                <button class="btn btn-primary btn-block" type="submit">Confirmar pedido</button>
                <p class="lf-free-note" style="margin:10px 0 0;">Al confirmar se guarda tu pedido y lo registramos para coordinar la entrega.</p>
              </div>
            </div>
          </form>
          <div class="lf-success" id="lfOrderSuccess" hidden></div>
        </div>
      </div>

      <aside class="lf-cart-summary">
        <h3>Resumen del pedido</h3>
        <div class="lf-summary-line"><span>Subtotal</span><strong>${lfMoney(subtotal)}</strong></div>
        <div class="lf-summary-line"><span>Envío</span><strong>${shipping ? lfMoney(shipping) : 'Gratis'}</strong></div>
        <div class="lf-summary-line lf-summary-total"><span>Total</span><strong>${lfMoney(total)}</strong></div>
        ${missing > 0
          ? `<div class="lf-freebar"><span style="width:${progress}%"></span></div>
             <p class="lf-free-note">Te faltan <strong>${lfMoney(missing)}</strong> para envío gratis.</p>`
          : `<p class="lf-free-note">¡Felicidades! Tienes envío gratis.</p>`}
        <div class="lf-summary-line"><span>Productos</span><strong>${lfCartCount()}</strong></div>
        <p class="lf-free-note">Puedes coordinar tu pago por WhatsApp o Instagram. Te confirmamos disponibilidad y tiempo de entrega.</p>
        <a href="catalogo.html" class="btn btn-secondary btn-block btn-sm">Seguir comprando</a>
      </aside>
    </div>
  `;

  document.getElementById('lfCheckoutForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const items = lfCart().map(line => {
      const product = lunetteProductById(line.id);
      return {
        id: line.id,
        name: product ? product.name : 'Producto',
        size: line.size,
        qty: line.qty,
        price: product ? product.price : 0
      };
    });

    const order = {
      code: 'LNT-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toISOString(),
      items,
      subtotal,
      shipping,
      total,
      customer: {
        name: String(data.get('name') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        email: String(data.get('email') || '').trim(),
        address: String(data.get('address') || '').trim(),
        city: String(data.get('city') || '').trim(),
        payment: String(data.get('payment') || '').trim(),
        notes: String(data.get('notes') || '').trim()
      }
    };

    lfSaveOrder(order);
    lfWrite(LF_CART_KEY, []);
    lfRefreshBadges();
    lfRenderCartDrawer();

    const success = document.getElementById('lfOrderSuccess');
    success.innerHTML = `
      <h3>¡Pedido registrado! 🎀</h3>
      <p>Guarda tu número de pedido:</p>
      <div class="lf-order-code">${order.code}</div>
      <p>Te contactaremos para confirmar el pago y la entrega.</p>
      <div class="lf-success-actions">
        <a class="btn btn-primary" href="${lfWhatsAppUrl(lfOrderMessage(order))}" target="_blank" rel="noopener">Enviar por WhatsApp</a>
        <a class="btn btn-secondary" href="catalogo.html">Seguir comprando</a>
      </div>
    `;
    success.hidden = false;
    form.closest('.lf-checkout')?.querySelector('#lfCheckoutForm')?.remove();
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    lfToast('Pedido registrado correctamente', 'success');
  });
}

/* ─── Favorites page ─── */
function lfRenderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;
  const favorites = LUNETTE_PRODUCTS.filter(product => lfIsFavorite(product.id));
  if (!favorites.length) {
    grid.innerHTML = `
      <div class="catalog-empty" style="grid-column:1/-1;">
        <div class="empty-icon">♡</div>
        <h3>Todavía no tienes favoritos</h3>
        <p>Toca el corazón en cualquier producto para guardarlo aquí.</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top:18px;">Descubrir productos</a>
      </div>
    `;
    return;
  }
  lfRenderGrid(grid, favorites);
}

/* ─── Init ─── */
function lfRenderCurrentPage() {
  switch (lfPageName()) {
    case 'home':
      lfRenderHome();
      lfBindHomeSlider();
      break;
    case 'catalog':
      lfRenderCatalog();
      break;
    case 'product':
      lfRenderProductDetail();
      break;
    case 'cart':
      lfRenderCartPage();
      break;
    case 'favorites':
      lfRenderFavorites();
      break;
  }
}

function lfPagesInit() {
  lfRenderCurrentPage();
  document.addEventListener('lf:cart', () => {
    if (lfPageName() === 'cart') lfRenderCartPage();
  });
  document.addEventListener('lf:favs', () => {
    if (lfPageName() === 'favorites') lfRenderFavorites();
  });
}

document.addEventListener('lf:ready', lfPagesInit, { once: true });
