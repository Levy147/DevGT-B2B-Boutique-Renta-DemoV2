const _imgConfig = {
  "Productos": {
    "NDR-001": { "local": "public/img/Productos/boda/NDR-001.jpg" },
    "NDR-002": { "local": "public/img/Productos/boda/CelestialDream.png" },
    "NDR-004": { "local": "public/img/Productos/boda/Blush Romance.png" },
    "NDR-005": { "local": "public/img/Productos/boda/GoldenEmpress.png" },
    "NDR-006": { "local": "public/img/Productos/boda/SnowPrincess.png" },
    "NDR-007": { "local": "public/img/Productos/boda/VintageLace.png" },
    "NDR-009": { "local": "public/img/Productos/boda/BohoChic.png" },
    "NDR-010": { "local": "public/img/Productos/boda/EternalLove.png" },
    "NDR-051": { "local": "public/img/Productos/boda/NDR-051.jpg" }
  }
};

function getImageUrl(Producto) {
  if (!Producto) return `https://picsum.photos/seed/dress/600/800`;
  const sku = Producto.sku || `NDR-${String(Producto.id).padStart(3, '0')}`;
  const local = _imgConfig?.Productos?.[sku]?.local;
  if (local) {
    const isAdmin = window.location.pathname.includes('/admin/');
    return isAdmin ? '../' + local : local;
  }
  return `https://picsum.photos/seed/dress${Producto.id}/600/800`;
}

function getTodasLasImagenes(sku) {
  const id = sku ? parseInt(sku.replace('NDR-', '')) : 0;
  return [`https://picsum.photos/seed/dress${id}/600/800`];
}

console.log(`[IMG] Configuración de imágenes cargada: ${Object.keys(_imgConfig?.Productos || {}).length} Productos`);

