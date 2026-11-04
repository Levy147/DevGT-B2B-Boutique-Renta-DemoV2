# Lunette

**Tienda de moda y accesorios Y2K / Coquette** — sitio estático para Guatemala.

> Tops, faldas, hoodies, bolsas, accesorios y outfits. Envíos a todo el país.

---

## Descripción

Lunette es una tienda en línea construida con HTML, CSS y JavaScript puro. No requiere instalación de dependencias ni servidor para funcionar: todo se ejecuta en el navegador y el carrito, los favoritos y el historial de pedidos se guardan en `localStorage`.

### Funcionalidades

- Catálogo con búsqueda y filtros por categoría, color, talla y precio.
- Orden por precio, nombre o valoración.
- Detalle de producto con selector de talla y cantidad.
- Carrito lateral y página de carrito con resumen.
- Checkout con datos de entrega y confirmación por WhatsApp.
- Favoritos sin necesidad de crear cuenta.
- Páginas de FAQ, envíos y cambios, términos y privacidad.
- Diseño responsive con la paleta rosa/azul del tema boutique.

---

## Uso

Abre `index.html` en el navegador o publica la carpeta en cualquier hosting estático (GitHub Pages, Netlify, Vercel).

```bash
# Servidor local opcional
python -m http.server 8000
```

Luego visita `http://localhost:8000`.

---

## Estructura

```
index.html              Landing page
catalogo.html           Catálogo con filtros
Producto.html           Detalle de producto
carrito.html            Carrito y checkout
favoritos.html          Productos guardados
faq.html                Preguntas frecuentes
politicas.html          Envíos y cambios
terminos.html           Términos y condiciones
privacidad.html         Aviso de privacidad
public/css/             Estilos del tema y ajustes de Lunette
public/js/              Datos, carrito y render de páginas
public/img/lunette/     Ilustraciones y recursos de marca
```

---

## Configuración

Los datos de la tienda y el catálogo están en `public/js/lunette-data.js`.

Antes de publicar, actualiza:

- `LUNETTE_STORE.whatsapp` con el número real (formato internacional, sin signos).
- `LUNETTE_STORE.email`, `instagram` e `instagramUrl`.
- Imágenes de producto en `public/img/lunette/` si tienes fotos reales.
- Precios, tallas y descripciones del catálogo.

---

## Persistencia

| Clave | Contenido |
|---|---|
| `lunette_cart_v1` | Carrito |
| `lunette_favs_v1` | Favoritos |
| `lunette_orders_v1` | Pedidos confirmados |

Los pedidos se guardan localmente y se envían por WhatsApp al confirmar el checkout. No se envían a un servidor.
