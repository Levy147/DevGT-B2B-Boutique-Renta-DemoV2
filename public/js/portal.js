/* ============================================================
   Lunette — Portal de administración
   Requiere: @supabase/supabase-js + public/js/lunette-data.js
   ============================================================ */

(function () {
  'use strict';

  const state = {
    client: null,
    session: null,
    profile: null,
    categories: [],
    products: [],
    editingId: null,
    filter: '',
    categoryFilter: '',
    busy: false
  };

  let els = {};

  /* ─── Utilidades ─── */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function splitLines(value) {
    return String(value || '').split('\n').map(line => line.trim()).filter(Boolean);
  }

  function splitCommas(value) {
    return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
  }

  function setBusy(busy) {
    state.busy = busy;
    document.body.style.cursor = busy ? 'progress' : '';
  }

  function showLoginMessage(text, type) {
    els.loginMessage.textContent = text;
    els.loginMessage.className = 'portal-message' + (type ? ' ' + type : '');
    els.loginMessage.hidden = false;
  }

  function hideLoginMessage() {
    els.loginMessage.hidden = true;
  }

  function message(text, type) {
    els.appMessage.textContent = text;
    els.appMessage.className = 'portal-message' + (type ? ' ' + type : '');
    els.appMessage.hidden = false;
    clearTimeout(message.timer);
    message.timer = setTimeout(() => { els.appMessage.hidden = true; }, 5000);
  }

  /* ─── Vistas ─── */

  function showLogin() {
    els.appView.hidden = true;
    els.loginView.hidden = false;
    els.loginForm.hidden = false;
    els.signupForm.hidden = true;
    els.toggleSignup.textContent = '¿No tienes cuenta? Crear una';
    els.userEmail.textContent = '';
    state.session = null;
    state.profile = null;
    state.products = [];
    state.categories = [];
  }

  function showApp(session) {
    els.loginView.hidden = true;
    els.appView.hidden = false;
    els.userEmail.textContent = session.user.email || '';
  }

  async function handleSession(session) {
    state.session = session;
    const { data, error } = await state.client
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      showLogin();
      showLoginMessage('No se pudo verificar tu cuenta: ' + error.message, 'error');
      return;
    }

    if (!data || data.role !== 'admin') {
      await state.client.auth.signOut();
      showLogin();
      showLoginMessage(
        'Tu cuenta no tiene permisos de administrador. Ejecuta el SQL del final de supabase/schema.sql con tu correo y vuelve a entrar.',
        'error'
      );
      return;
    }

    state.profile = data;
    showApp(session);
    await loadAll();
  }

  /* ─── Datos ─── */

  async function loadAll() {
    setBusy(true);
    const [categoriesResult, productsResult] = await Promise.all([
      state.client.from('categories').select('*').order('sort_order', { ascending: true }),
      state.client.from('products').select('*').order('id', { ascending: true })
    ]);
    setBusy(false);

    if (categoriesResult.error) {
      message('No se pudieron cargar las categorías: ' + categoriesResult.error.message, 'error');
      return;
    }
    if (productsResult.error) {
      message('No se pudieron cargar los productos: ' + productsResult.error.message, 'error');
      return;
    }

    state.categories = categoriesResult.data || [];
    state.products = productsResult.data || [];
    renderAll();
  }

  function renderAll() {
    renderStats();
    fillCategorySelects();
    renderTable();
    renderCategories();
  }

  function renderStats() {
    const total = state.products.length;
    const active = state.products.filter(product => product.active).length;
    const categories = state.categories.length;
    const hidden = total - active;

    els.stats.innerHTML = [
      statCard(total, 'Productos'),
      statCard(active, 'Visibles'),
      statCard(hidden, 'Ocultos'),
      statCard(categories, 'Categorías')
    ].join('');
  }

  function statCard(value, label) {
    return '<div class="portal-stat"><strong>' + escapeHtml(value) + '</strong><span>' + escapeHtml(label) + '</span></div>';
  }

  function categoryById(id) {
    return state.categories.find(category => String(category.id) === String(id)) || null;
  }

  function fillCategorySelects() {
    const formValue = els.fieldCategory.value;
    els.fieldCategory.innerHTML = '<option value="">Sin categoría</option>' +
      state.categories.map(category =>
        '<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>'
      ).join('');
    els.fieldCategory.value = formValue;

    const filterValue = state.categoryFilter;
    els.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
      state.categories.map(category =>
        '<option value="' + category.id + '">' + escapeHtml(category.name) + '</option>'
      ).join('');
    els.categoryFilter.value = filterValue;
  }

  function filteredProducts() {
    const search = state.filter.trim().toLowerCase();
    return state.products.filter(product => {
      const category = categoryById(product.category_id);
      const haystack = [product.name, product.sku, category ? category.name : '']
        .join(' ')
        .toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      const matchesCategory = !state.categoryFilter || String(product.category_id) === state.categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  function renderTable() {
    const products = filteredProducts();

    if (!products.length) {
      els.productsBody.innerHTML = '<tr><td colspan="8" class="portal-empty">' +
        (state.products.length ? 'No hay resultados para tu búsqueda.' : 'No hay productos todavía.') +
        '</td></tr>';
    } else {
      els.productsBody.innerHTML = products.map(productRow).join('');
    }

    els.emptyState.hidden = state.products.length > 0;
  }

  function productRow(product) {
    const category = categoryById(product.category_id);
    const thumb = product.image
      ? '<img src="' + escapeHtml(product.image) + '" alt="">'
      : '<span>' + escapeHtml(String(product.name || '?').charAt(0)) + '</span>';

    return '<tr>' +
      '<td><div class="portal-thumb">' + thumb + '</div></td>' +
      '<td><div class="portal-name">' + escapeHtml(product.name) + '</div>' +
        '<div class="portal-sku">' + escapeHtml(product.sku || 'Sin SKU') + '</div></td>' +
      '<td>' + escapeHtml(product.sku || '—') + '</td>' +
      '<td>' + escapeHtml(category ? category.name : '—') + '</td>' +
      '<td>Q ' + Number(product.price || 0).toFixed(2) + '</td>' +
      '<td>' + Number(product.stock || 0) + '</td>' +
      '<td><label class="portal-switch">' +
        '<input type="checkbox" data-action="toggle" data-id="' + product.id + '"' + (product.active ? ' checked' : '') + '>' +
        (product.active ? 'Sí' : 'No') +
      '</label></td>' +
      '<td><div class="portal-row-actions">' +
        '<button type="button" data-action="edit" data-id="' + product.id + '">Editar</button>' +
        '<button type="button" class="delete" data-action="delete" data-id="' + product.id + '">Eliminar</button>' +
      '</div></td>' +
    '</tr>';
  }

  function renderCategories() {
    if (!state.categories.length) {
      els.categoriesList.innerHTML = '<span class="portal-muted">Sin categorías todavía.</span>';
      return;
    }
    els.categoriesList.innerHTML = state.categories.map(category =>
      '<span class="portal-chip">' +
        escapeHtml(category.emoji || '♡') + ' ' + escapeHtml(category.name) +
        ' <button type="button" data-action="delete-category" data-id="' + category.id + '" title="Eliminar categoría">×</button>' +
      '</span>'
    ).join('');
  }

  /* ─── Formulario de producto ─── */

  function openProductForm(product) {
    state.editingId = product ? product.id : null;
    els.modalTitle.textContent = product ? 'Editar producto' : 'Nuevo producto';
    els.productId.value = product ? product.id : '';
    els.fieldName.value = product ? product.name : '';
    els.fieldSku.value = product ? (product.sku || '') : '';
    els.fieldPrice.value = product ? product.price : '';
    els.fieldOldPrice.value = product && product.old_price != null ? product.old_price : '';
    els.fieldBadge.value = product ? (product.badge || '') : '';
    els.fieldRating.value = product ? (product.rating != null ? product.rating : 5) : 5;
    els.fieldReviews.value = product ? (product.reviews || 0) : 0;
    els.fieldStock.value = product ? (product.stock || 0) : 0;
    els.fieldTint.value = product ? (product.tint || 0) : 0;
    els.fieldImage.value = product ? (product.image || '') : '';
    els.fieldDescription.value = product ? (product.description || '') : '';
    els.fieldDetails.value = product && Array.isArray(product.details) ? product.details.join('\n') : '';
    els.fieldSizes.value = product && Array.isArray(product.sizes) ? product.sizes.join(', ') : '';
    els.fieldColors.value = product && Array.isArray(product.colors) ? product.colors.join(', ') : '';
    els.fieldActive.checked = product ? Boolean(product.active) : true;
    fillCategorySelects();
    els.fieldCategory.value = product && product.category_id ? String(product.category_id) : '';
    updatePreview();
    els.productModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => els.fieldName.focus(), 40);
  }

  function closeProductForm() {
    els.productModal.hidden = true;
    document.body.style.overflow = '';
    state.editingId = null;
    els.productForm.reset();
  }

  function updatePreview() {
    const source = els.fieldImage.value.trim();
    if (source) {
      els.imagePreview.src = source;
      els.imagePreview.hidden = false;
    } else {
      els.imagePreview.removeAttribute('src');
      els.imagePreview.hidden = true;
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (state.busy) return;

    const payload = {
      name: els.fieldName.value.trim(),
      sku: els.fieldSku.value.trim() || null,
      slug: slugify(els.fieldName.value),
      category_id: els.fieldCategory.value ? Number(els.fieldCategory.value) : null,
      price: Number(els.fieldPrice.value) || 0,
      old_price: els.fieldOldPrice.value ? Number(els.fieldOldPrice.value) : null,
      badge: els.fieldBadge.value || '',
      rating: Number(els.fieldRating.value) || 0,
      reviews: Number(els.fieldReviews.value) || 0,
      stock: Number(els.fieldStock.value) || 0,
      tint: Number(els.fieldTint.value) || 0,
      image: els.fieldImage.value.trim(),
      description: els.fieldDescription.value.trim(),
      details: splitLines(els.fieldDetails.value),
      sizes: splitCommas(els.fieldSizes.value),
      colors: splitCommas(els.fieldColors.value),
      active: els.fieldActive.checked
    };

    if (!payload.name) {
      message('El nombre es obligatorio.', 'error');
      return;
    }

    setBusy(true);
    let error;
    if (state.editingId) {
      ({ error } = await state.client.from('products').update(payload).eq('id', state.editingId));
    } else {
      ({ error } = await state.client.from('products').insert(payload));
    }
    setBusy(false);

    if (error) {
      message('No se pudo guardar: ' + error.message, 'error');
      return;
    }

    closeProductForm();
    message('Producto guardado correctamente.', 'ok');
    await loadAll();
  }

  async function deleteProduct(id) {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    const { error } = await state.client.from('products').delete().eq('id', id);
    if (error) {
      message('No se pudo eliminar: ' + error.message, 'error');
      return;
    }
    message('Producto eliminado.', 'ok');
    await loadAll();
  }

  async function toggleProduct(id, active) {
    const { error } = await state.client.from('products').update({ active }).eq('id', id);
    if (error) {
      message('No se pudo cambiar la visibilidad: ' + error.message, 'error');
      await loadAll();
      return;
    }
    const product = state.products.find(item => String(item.id) === String(id));
    if (product) product.active = active;
    renderStats();
    renderTable();
    message(active ? 'Producto visible en la tienda.' : 'Producto oculto de la tienda.', 'ok');
  }

  /* ─── Categorías ─── */

  async function addCategory(event) {
    event.preventDefault();
    if (state.busy) return;

    const name = els.catName.value.trim();
    const slug = slugify(els.catSlug.value) || slugify(name);
    if (!name || !slug) {
      message('El nombre de la categoría es obligatorio.', 'error');
      return;
    }

    const payload = {
      slug: slug,
      name: name,
      emoji: els.catEmoji.value.trim() || '♡',
      blurb: els.catBlurb.value.trim(),
      image: els.catImage.value.trim(),
      sort_order: state.categories.length
    };

    setBusy(true);
    const { error } = await state.client.from('categories').insert(payload);
    setBusy(false);

    if (error) {
      message('No se pudo crear la categoría: ' + error.message, 'error');
      return;
    }

    els.categoryForm.reset();
    els.categoryForm.hidden = true;
    message('Categoría creada.', 'ok');
    await loadAll();
  }

  async function deleteCategory(id) {
    if (!window.confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return;
    const { error } = await state.client.from('categories').delete().eq('id', id);
    if (error) {
      message('No se pudo eliminar la categoría: ' + error.message, 'error');
      return;
    }
    message('Categoría eliminada.', 'ok');
    await loadAll();
  }

  /* ─── Importar catálogo demo ─── */

  async function importDemo() {
    if (!window.confirm('Se importarán las categorías y los 20 productos demo. ¿Continuar?')) return;
    if (typeof LUNETTE_CATEGORIES === 'undefined' || typeof LUNETTE_PRODUCTS === 'undefined') {
      message('No se encontraron los datos demo.', 'error');
      return;
    }

    setBusy(true);
    try {
      const categoryRows = LUNETTE_CATEGORIES.map((category, index) => ({
        slug: category.slug,
        name: category.name,
        emoji: category.emoji,
        blurb: category.blurb,
        image: category.image,
        sort_order: index
      }));

      let { error } = await state.client
        .from('categories')
        .upsert(categoryRows, { onConflict: 'slug', ignoreDuplicates: true });
      if (error) throw error;

      const { data: categories, error: categoriesError } = await state.client
        .from('categories')
        .select('id, slug');
      if (categoriesError) throw categoriesError;

      const categoryMap = new Map((categories || []).map(category => [category.slug, category.id]));

      const productRows = LUNETTE_PRODUCTS.map(product => ({
        sku: product.sku,
        name: product.name,
        slug: slugify(product.name),
        category_id: categoryMap.get(product.category) || null,
        price: product.price,
        old_price: product.oldPrice != null ? product.oldPrice : null,
        badge: product.badge || '',
        rating: product.rating,
        reviews: product.reviews,
        description: product.description,
        details: product.details,
        sizes: product.sizes,
        colors: product.colors,
        image: product.image,
        tint: product.tint,
        stock: 0,
        active: true
      }));

      ({ error } = await state.client
        .from('products')
        .upsert(productRows, { onConflict: 'sku', ignoreDuplicates: true }));
      if (error) throw error;

      message('Catálogo demo importado correctamente.', 'ok');
      await loadAll();
    } catch (error) {
      message('No se pudo importar: ' + error.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  /* ─── Sesión ─── */

  async function login(event) {
    event.preventDefault();
    if (state.busy) return;
    hideLoginMessage();

    setBusy(true);
    const { data, error } = await state.client.auth.signInWithPassword({
      email: els.loginEmail.value.trim(),
      password: els.loginPassword.value
    });
    setBusy(false);

    if (error) {
      showLoginMessage(error.message, 'error');
      return;
    }
    if (data.session) await handleSession(data.session);
  }

  async function signup(event) {
    event.preventDefault();
    if (state.busy) return;
    hideLoginMessage();

    setBusy(true);
    const { data, error } = await state.client.auth.signUp({
      email: els.signupEmail.value.trim(),
      password: els.signupPassword.value
    });
    setBusy(false);

    if (error) {
      showLoginMessage(error.message, 'error');
      return;
    }

    if (data.session) {
      await state.client.auth.signOut();
      showLoginMessage(
        'Cuenta creada. Ahora hazla admin con el SQL de supabase/schema.sql y vuelve a entrar.',
        'ok'
      );
    } else {
      showLoginMessage('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.', 'ok');
    }
  }

  async function logout() {
    await state.client.auth.signOut();
    showLogin();
    hideLoginMessage();
  }

  /* ─── Eventos ─── */

  function bindEvents() {
    els.loginForm.addEventListener('submit', login);
    els.signupForm.addEventListener('submit', signup);
    els.logoutBtn.addEventListener('click', logout);

    els.toggleSignup.addEventListener('click', () => {
      const showSignup = els.signupForm.hidden;
      els.signupForm.hidden = !showSignup;
      els.loginForm.hidden = showSignup;
      els.toggleSignup.textContent = showSignup
        ? '¿Ya tienes cuenta? Iniciar sesión'
        : '¿No tienes cuenta? Crear una';
      hideLoginMessage();
    });

    els.newProductBtn.addEventListener('click', () => openProductForm(null));
    els.closeModal.addEventListener('click', closeProductForm);
    els.cancelModal.addEventListener('click', closeProductForm);
    els.productModal.addEventListener('click', event => {
      if (event.target === els.productModal) closeProductForm();
    });
    els.productForm.addEventListener('submit', saveProduct);
    els.fieldImage.addEventListener('input', updatePreview);

    els.searchInput.addEventListener('input', () => {
      state.filter = els.searchInput.value;
      renderTable();
    });
    els.categoryFilter.addEventListener('change', () => {
      state.categoryFilter = els.categoryFilter.value;
      renderTable();
    });

    els.productsBody.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      if (button.dataset.action === 'edit') {
        const product = state.products.find(item => String(item.id) === String(button.dataset.id));
        if (product) openProductForm(product);
      } else if (button.dataset.action === 'delete') {
        deleteProduct(button.dataset.id);
      }
    });

    els.productsBody.addEventListener('change', event => {
      const input = event.target.closest('input[data-action="toggle"]');
      if (!input) return;
      toggleProduct(input.dataset.id, input.checked);
    });

    els.newCategoryBtn.addEventListener('click', () => {
      els.categoryForm.hidden = !els.categoryForm.hidden;
      if (!els.categoryForm.hidden) els.catName.focus();
    });
    els.categoryForm.addEventListener('submit', addCategory);
    els.categoriesList.addEventListener('click', event => {
      const button = event.target.closest('button[data-action="delete-category"]');
      if (button) deleteCategory(button.dataset.id);
    });

    els.importDemoBtn.addEventListener('click', importDemo);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !els.productModal.hidden) closeProductForm();
    });
  }

  /* ─── Init ─── */

  function init() {
    els = {
      loginView: document.getElementById('loginView'),
      appView: document.getElementById('appView'),
      loginForm: document.getElementById('loginForm'),
      signupForm: document.getElementById('signupForm'),
      loginEmail: document.getElementById('loginEmail'),
      loginPassword: document.getElementById('loginPassword'),
      signupEmail: document.getElementById('signupEmail'),
      signupPassword: document.getElementById('signupPassword'),
      loginMessage: document.getElementById('loginMessage'),
      toggleSignup: document.getElementById('toggleSignup'),
      userEmail: document.getElementById('userEmail'),
      logoutBtn: document.getElementById('logoutBtn'),
      appMessage: document.getElementById('appMessage'),
      stats: document.getElementById('stats'),
      searchInput: document.getElementById('searchInput'),
      categoryFilter: document.getElementById('categoryFilter'),
      newProductBtn: document.getElementById('newProductBtn'),
      productsBody: document.getElementById('productsBody'),
      emptyState: document.getElementById('emptyState'),
      importDemoBtn: document.getElementById('importDemoBtn'),
      categoriesList: document.getElementById('categoriesList'),
      newCategoryBtn: document.getElementById('newCategoryBtn'),
      categoryForm: document.getElementById('categoryForm'),
      catSlug: document.getElementById('catSlug'),
      catName: document.getElementById('catName'),
      catEmoji: document.getElementById('catEmoji'),
      catBlurb: document.getElementById('catBlurb'),
      catImage: document.getElementById('catImage'),
      productModal: document.getElementById('productModal'),
      modalTitle: document.getElementById('modalTitle'),
      closeModal: document.getElementById('closeModal'),
      cancelModal: document.getElementById('cancelModal'),
      productForm: document.getElementById('productForm'),
      productId: document.getElementById('productId'),
      fieldName: document.getElementById('fieldName'),
      fieldSku: document.getElementById('fieldSku'),
      fieldCategory: document.getElementById('fieldCategory'),
      fieldPrice: document.getElementById('fieldPrice'),
      fieldOldPrice: document.getElementById('fieldOldPrice'),
      fieldBadge: document.getElementById('fieldBadge'),
      fieldRating: document.getElementById('fieldRating'),
      fieldReviews: document.getElementById('fieldReviews'),
      fieldStock: document.getElementById('fieldStock'),
      fieldTint: document.getElementById('fieldTint'),
      fieldImage: document.getElementById('fieldImage'),
      fieldDescription: document.getElementById('fieldDescription'),
      fieldDetails: document.getElementById('fieldDetails'),
      fieldSizes: document.getElementById('fieldSizes'),
      fieldColors: document.getElementById('fieldColors'),
      fieldActive: document.getElementById('fieldActive'),
      imagePreview: document.getElementById('imagePreview')
    };

    bindEvents();

    if (!window.supabase) {
      showLoginMessage('No se pudo cargar Supabase. Revisa tu conexión a internet.', 'error');
      return;
    }

    if (!LUNETTE_SUPABASE.url || !LUNETTE_SUPABASE.anonKey) {
      showLoginMessage(
        'Falta configurar Supabase. Abre public/js/lunette-data.js y completa url y anonKey.',
        'error'
      );
      els.loginForm.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    state.client = window.supabase.createClient(LUNETTE_SUPABASE.url, LUNETTE_SUPABASE.anonKey);

    state.client.auth.getSession().then(({ data }) => {
      if (data.session) {
        handleSession(data.session);
      } else {
        showLogin();
      }
    });

    state.client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') showLogin();
    });
  }

  init();
})();
