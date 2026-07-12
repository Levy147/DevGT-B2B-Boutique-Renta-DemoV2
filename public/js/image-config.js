const _imgConfig = {
  "vestidos": {
    "NDR-001": { "local": "public/img/vestidos/boda/NDR-001.jpg" },
    "NDR-002": { "local": "public/img/vestidos/boda/CelestialDream.png" },
    "NDR-004": { "local": "public/img/vestidos/boda/Blush Romance.png" },
    "NDR-005": { "local": "public/img/vestidos/boda/GoldenEmpress.png" },
    "NDR-006": { "local": "public/img/vestidos/boda/SnowPrincess.png" },
    "NDR-007": { "local": "public/img/vestidos/boda/VintageLace.png" },
    "NDR-009": { "local": "public/img/vestidos/boda/BohoChic.png" },
    "NDR-010": { "local": "public/img/vestidos/boda/EternalLove.png" },
    "NDR-051": { "local": "public/img/vestidos/boda/NDR-051.jpg" }
  }
};

function getImageUrl(vestido) {
  if (!vestido) return `https://picsum.photos/seed/dress/600/800`;
  const sku = vestido.sku || `NDR-${String(vestido.id).padStart(3, '0')}`;
  const local = _imgConfig?.vestidos?.[sku]?.local;
  if (local) {
    const isAdmin = window.location.pathname.includes('/admin/');
    return isAdmin ? '../' + local : local;
  }
  return `https://picsum.photos/seed/dress${vestido.id}/600/800`;
}

function getTodasLasImagenes(sku) {
  const id = sku ? parseInt(sku.replace('NDR-', '')) : 0;
  return [`https://picsum.photos/seed/dress${id}/600/800`];
}

console.log(`[IMG] Configuración de imágenes cargada: ${Object.keys(_imgConfig?.vestidos || {}).length} vestidos`);
