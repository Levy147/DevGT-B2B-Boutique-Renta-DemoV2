# 🛠️ Manual Técnico — Nicol Dress Rental

**Sistema de Alquiler de Vestidos — Demo Interactiva B2B**

---

## 📋 Índice

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Instalación y Ejecución](#2-instalación-y-ejecución)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Base de Datos (LocalStorage)](#5-base-de-datos-localstorage)
6. [Credenciales de Prueba](#6-credenciales-de-prueba)
7. [Funcionalidades por Página](#7-funcionalidades-por-página)
8. [Panel de Administración](#8-panel-de-administración)
9. [Sistema de Imágenes](#9-sistema-de-imágenes)
10. [Sistema de SKU y QR](#10-sistema-de-sku-y-qr)
11. [Personalización y Branding](#11-personalización-y-branding)
12. [Solución de Problemas](#12-solución-de-problemas)

---

## 1. Requisitos del Sistema

### Mínimos
| Componente | Requisito |
|-----------|-----------|
| Navegador | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| JavaScript | Habilitado (no requiere Node.js ni servidor) |
| Almacenamiento | Navegador con soporte para localStorage |
| Cámara (opcional) | Para funcionalidad de escáner QR |
| Conexión a Internet | Necesaria para Google Fonts y placeholders de imágenes |

### Recomendados
- **Resolución de pantalla:** 1024×768 o superior
- **Navegador:** Google Chrome (mejor rendimiento)
- **Conexión:** Para cargar imágenes placeholder de picsum.photos

---

## 2. Instalación y Ejecución

### 2.1 Descarga
Clona o descarga el proyecto en tu computadora:

```bash
git clone <url-del-repositorio>
cd B2B-Boutique-Renta-Demo
```

### 2.2 Ejecución
Este proyecto es **100% frontend estático**. No requiere servidor web ni instalación de dependencias.

**Opción 1 — Abrir directamente (recomendado):**
```
Haz doble clic en index.html
```
O arrastra `index.html` a tu navegador.

**Opción 2 — Servidor local (opcional):**
```bash
# Con Python
python -m http.server 8000

# Con Node.js (si tienes http-server instalado)
npx http-server .

# Con VS Code Live Server
# Botón derecho en index.html → "Open with Live Server"
```
Luego abre `http://localhost:8000` en tu navegador.

> ⚠️ **Nota:** Algunas funcionalidades como el fetch de `imagenes.json` pueden requerir un servidor local para funcionar correctamente en ciertos navegadores.

### 2.3 Modo Demo (Recomendado)
El sistema viene precargado con 50 vestidos de ejemplo, 4 usuarios demo, 5 citas de prueba, 6 reseñas y 8 accesorios. Al abrir cualquier página del proyecto, la base de datos se inicializa automáticamente en localStorage.

---

## 3. Estructura del Proyecto

```
B2B-Boutique-Renta-Demo/
│
├── index.html                  # Landing Page (Hero, Slider, Cómo funciona)
├── catalogo.html               # Catálogo con filtros y grid de productos
├── vestido.html                # Detalle del vestido con galería y calendario
├── faq.html                    # Preguntas Frecuentes
├── politicas.html              # Política de Alquiler
├── terminos.html               # Términos y Condiciones
├── privacidad.html             # Aviso de Privacidad
├── README.md                   # Guía de uso general
├── MANUAL_TECNICO.md           # Este documento
│
├── admin/
│   ├── dashboard.html          # Dashboard con métricas, citas y estadísticas
│   ├── inventario.html         # CRUD de vestidos y generador QR
│   └── scanner.html            # Interfaz de escáner QR con cámara
│
└── public/
    ├── css/
    │   ├── main.css            # Estilos globales (variables, navbar, botones, modales, footer)
    │   ├── cliente.css         # Estilos del catálogo, landing y detalle de vestido
    │   └── admin.css           # Estilos del panel admin (sidebar, tablas, gráficos, QR)
    │
    ├── img/
    │   ├── config/
    │   │   └── imagenes.json   # Mapa de configuración de imágenes (local vs placeholder)
    │   └── vestidos/
    │       ├── boda/           # Imágenes de vestidos de boda
    │       ├── 15-anos/        # Imágenes de vestidos de 15 años
    │       ├── graduacion/     # Imágenes de vestidos de graduación
    │       ├── coctel/         # Imágenes de vestidos de cóctel
    │       └── fiesta/         # Imágenes de vestidos de fiesta
    │
    └── js/
        ├── data.js             # Base de datos falsa + funciones CRUD (50 vestidos, usuarios, citas)
        ├── catalogo.js         # Lógica de filtros, renderizado de tarjetas y favoritos
        ├── carrito.js          # Auth, favoritos, citas, calendario, reseñas, cross-selling
        ├── admin.js            # Dashboard, inventario, estadísticas, QR, daños, tintorería
        ├── qr-scanner.js       # Lector QR con cámara y entrada manual
        └── image-config.js     # Sistema de resolución de imágenes (local vs placeholder)
```

---

## 4. Arquitectura del Sistema

### 4.1 Patrón de Diseño
El sistema sigue una arquitectura **SPA-like** (Single Page Application-like) sin framework, utilizando:

- **HTML estático** para las vistas
- **CSS puro** con variables CSS para theming
- **JavaScript vanilla** con localStorage como base de datos
- **SessionStorage** para manejo de sesiones de usuario

### 4.2 Flujo de Datos //1

```
Usuario → HTML (Vista) → JavaScript (Controlador) → localStorage (Modelo)
                    ↑                                        │
                    └─────── Renderizado con datos ──────────┘
```

### 4.3 Dependencia de Scripts (Orden de carga)
Es **crítico** que los scripts se carguen en este orden:

```html
<script src="public/js/data.js"></script>        <!-- 1. BD + funciones de acceso -->
<script src="public/js/catalogo.js"></script>     <!-- 2. Renderizado de catálogo -->
<script src="public/js/carrito.js"></script>      <!-- 3. Auth, citas, toasts, calendario -->
<script src="public/js/admin.js"></script>        <!-- 4. Solo en páginas admin -->
<script src="public/js/qr-scanner.js"></script>   <!-- 5. Solo en scanner.html -->
<script src="public/js/image-config.js"></script> <!-- 6. Configuración de imágenes -->
```

---

## 5. Base de Datos (LocalStorage)

### 5.1 Tablas
El sistema almacena 6 tablas en `localStorage` como JSON arrays:

| Tabla | Clave | Descripción | Registros Demo |
|-------|-------|-------------|:---:|
| `db_vestidos` | `'db_vestidos'` | 50 vestidos con SKU, precios, tallas, estados | 50 |
| `db_usuarios` | `'db_usuarios'` | 4 usuarios (3 clientes + 1 admin) | 4 |
| `db_citas` | `'db_citas'` | Citas agendadas con estados | 5 |
| `db_resenas` | `'db_resenas'` | Reseñas con fotos y puntuaciones | 6 |
| `db_accesorios` | `'db_accesorios'` | Accesorios para cross-selling | 8 |
| `db_danos` | `'db_danos'` | Registro de daños y depósitos | 1 |

### 5.2 Limpiar Datos
Para reiniciar la base de datos a su estado inicial:

```javascript
// Desde la consola del navegador:
localStorage.removeItem('nicol_inicializado');
localStorage.clear();
location.reload();
```

### 5.3 Estructura de un Vestido
```javascript
{
  id: 1,
  sku: "NDR-001",
  nombre: "Aurora Divine",
  categoria: "Boda",              // Boda, 15 Años, Graduación, Cóctel
  color: "Marfil",
  talla: ["M", "L", "XL"],
  precio_renta: 5800,             // Precio de alquiler
  precio_venta: 18500,            // Precio de venta (null si no aplica)
  estado: "disponible",           // disponible, agotado, lavanderia, reparacion
  descripcion: "Elegante vestido...",
  tela: "Encaje Chantilly, Tul, Seda",
  tipo_cuerpo: ["Reloj de Arena", "Triángulo Invertido"],
  corte: "Sirena",                // Sirena, Princesa, Vaso, Imperio, Evasé, etc.
  imagen: "https://picsum.photos/...",
  imagenes_extra: ["url1", "url2", "url3"],
  disponibles: 2,                 // Stock disponible
  rentas_completadas: 18,         // Para estadísticas
  fecha_retorno_lavanderia: null  // Fecha estimada de retorno de lavandería
}
```

### 5.4 Funciones CRUD Principales (en `data.js`)

| Función | Descripción |
|---------|-------------|
| `getVestidos()` | Obtiene todos los vestidos |
| `getVestidoById(id)` | Busca un vestido por ID |
| `getVestidosDisponibles()` | Filtra solo disponibles |
| `getVestidosByCategoria(cat)` | Filtra por categoría |
| `getVestidosByTipoCuerpo(tipo)` | Filtra por tipo de cuerpo |
| `getVestidosFavoritos(ids)` | Obtiene vestidos por array de IDs |
| `saveVestidos(array)` | Guarda cambios en vestidos |
| `getUsuarios()` / `getUsuarioById()` / `getUsuarioByEmail()` | Acceso a usuarios |
| `loginUsuario(email, pass)` | Autenticación |
| `getCitas()` / `getCitasByUsuario()` / `agregarCita()` | Gestión de citas |

---

## 6. Credenciales de Prueba

### Clientes Demo
| Nombre | Correo | Contraseña |
|--------|--------|:----------:|
| María García | `maria@demo.com` | `123456` |
| Ana López | `ana@demo.com` | `123456` |
| Carmen Ruiz | `carmen@demo.com` | `123456` |

### Administrador
| Nombre | Correo | Contraseña |
|--------|--------|:----------:|
| Admin Boutique | `admin@boutique.com` | `admin123` |

---

## 7. Funcionalidades por Página

### 7.1 `index.html` — Landing Page
- **Hero Section:** Título, descripción, CTA a catálogo
- **Slider "Más Rentados":** Top 5 vestidos con scroll horizontal
- **"Cómo Funciona":** 4 pasos visuales (Explora → Agenda → Usa → Devuelve)
- **Categorías:** Cards de acceso rápido (Boda, 15 Años, Graduación, Cóctel)
- **Footer:** Con enlaces funcionales a FAQ, Políticas, Términos, Privacidad

### 7.2 `catalogo.html` — Catálogo
- **Sidebar de Filtros:**
  - Categoría (botones con estilo píldora)
  - Color (swatches circulares seleccionables)
  - Talla (chips XS-XL)
  - Rango de precio (inputs min/max)
  - Tipo de cuerpo (Reloj de Arena, Pera, etc.)
  - Tipo (Solo Alquiler / Solo Venta)
  - Búsqueda por nombre
- **Grid de Productos:** Cards con imagen, SKU, nombre, precio, badge de estado
- **Ordenamiento:** Default, menor precio, mayor precio, nombre A-Z
- **Favoritos:** Botón de corazón por card
- **Vista de Favoritos:** `?tab=favoritos` en URL

### 7.3 `vestido.html` — Detalle del Vestido
- **Galería:** Imagen principal + thumbnails intercambiables
- **Meta tags:** Color, tallas, disponibilidad, corte, tipo de cuerpo
- **Reseñas:** Sección con fotos de clientas y puntuaciones (estrellas)
- **Cross-selling:** Módulo "Completa tu Look" con 8 accesorios
- **Calendario Interactivo:**
  - Navegación mensual
  - Fechas ocupadas marcadas
  - Selección de horario (10:00-18:00)
  - Botón "Agendar Cita de Prueba"

### 7.4 Páginas Informativas
| Página | Contenido |
|--------|-----------|
| `faq.html` | 10 preguntas frecuentes con acordeón |
| `politicas.html` | Política de alquiler (9 secciones) |
| `terminos.html` | Términos y condiciones (11 secciones) |
| `privacidad.html` | Aviso de privacidad (9 secciones) |

---

## 8. Panel de Administración

### 8.1 Acceso
1. Inicia sesión con `admin@boutique.com` / `admin123`
2. Haz clic en tu avatar → "Panel Admin"
3. O usa el botón `⚙️ Cambiar a Vista Admin` en el footer de cualquier página

### 8.2 `admin/dashboard.html` — Dashboard

**Métricas Rápidas:**
- Citas para hoy
- Vestidos disponibles
- En lavandería
- En reparación

**Secciones:**
- **Citas del Día:** Tabla con acciones (WhatsApp, aprobar, rechazar, marcar asistió)
- **Citas Pendientes:** Todas las solicitudes pendientes ordenadas por fecha
- **Estadísticas:** Top 5 vestidos más rentados con gráfico de barras animado
- **Tintorería:** Lista de vestidos en lavandería/reparación con fecha de retorno
- **Control de Daños:** Tabla con daños reportados y depósitos a retener

### 8.3 `admin/inventario.html` — Inventario

**Acciones:**
- `➕ Agregar Nuevo Vestido` — Formulario completo con todos los campos
- `✏️` — Editar vestido existente
- `🗑️` — Eliminar vestido (con confirmación)
- `📱 QR` — Generar código QR del vestido

**Tabla de Inventario:**
- SKU, Nombre, Categoría, Color, Tallas, Precio, Estado, Disponibles
- Selector de estado inline (disponible/agotado/lavandería/reparación)
- Búsqueda por nombre, categoría o color

### 8.4 `admin/scanner.html` — Escáner QR

**Modalidades:**
- **Cámara:** Inicia la cámara trasera para escanear QRs
- **ID Manual:** Input para ingresar número de vestido manualmente

**Al Escanear:**
- Muestra foto, nombre, estado, precio del vestido
- Permite cambiar el estado del vestido desde el escáner
- Enlace a ficha detallada del vestido

---

## 9. Sistema de Imágenes

### 9.1 Arquitectura
El sistema tiene una capa de abstracción para manejar imágenes locales vs placeholders:

```
getImageUrl(v) → image-config.js
    │
    ├── ¿Hay imagen local en /img/vestidos/[categoria]/[SKU].jpg?
    │   → Usa la imagen local
    │
    └── ¿No? → Usa placeholder de picsum.photos
```

### 9.2 Cómo Agregar Imágenes Locales
1. Coloca las imágenes en `public/img/vestidos/[categoria]/`
2. Nombra los archivos según el SKU:
   - `NDR-001.jpg` — Imagen principal
   - `NDR-001-a.jpg` — Imagen extra 1
   - `NDR-001-b.jpg` — Imagen extra 2
3. Opcional: actualiza `public/img/config/imagenes.json` con las rutas

### 9.3 Configuración por Defecto
Sin imágenes locales, el sistema usa `picsum.photos` como placeholder. Esto funciona para la demo sin necesidad de archivos adicionales.

---

## 10. Sistema de SKU y QR

### 10.1 Formato de SKU
```
NDR-001  →  NDR = Nicol Dress Rental, 001 = número secuencial
NDR-050  →  SKU del último vestido en la base de datos demo
```

### 10.2 Generación de QR
- Se genera usando la API pública: `https://api.qrserver.com/v1/create-qr-code/`
- El QR contiene: URL del vestido + ID + SKU
- Se usa en pantalla (no impresión) desde el inventario

### 10.3 Escaneo de QR
- El QR redirige a `vestido.html?id=X&sku=NDR-XXX`
- El escáner en admin/scanner.html procesa la URL y muestra los datos del vestido

---

## 11. Personalización y Branding

### 11.1 Paleta de Colores
Las variables CSS están en `:root` dentro de `public/css/main.css`:

```css
:root {
  --primary: #5C1F14;           /* Botones CTA */
  --primary-dark: #4a1810;      /* Hover de botones */
  --accent: #8C5E5E;            /* Acentos y bordes */
  --accent-soft: #CCAB9A;       /* Acentos suaves */
  --bg-cream: #F7F7F7;          /* Fondo principal */
  --bg-light: #FFD6DB;          /* Fondos secundarios */
  --bg-card: #D9C1C1;           /* Fondo tarjetas alternativo */
  --bg-dark: #41110D;           /* Footer y texto principal */
  --text-primary: #41110D;      /* Texto principal */
}
```

### 11.2 Tipografía
- **Títulos:** Playfair Display (Google Fonts)
- **Textos:** Lato (Google Fonts)

### 11.3 Cambiar Nombre del Negocio
1. Busca y reemplaza "Nicol Dress Rental" en todos los archivos
2. Actualiza el logo en la navbar
3. Actualiza datos de contacto en el footer

---

## 12. Solución de Problemas

### Las imágenes no se ven
```
Causa: Sin conexión a Internet (picsum.photos no disponible)
Solución: Agregar imágenes locales en /public/img/vestidos/[categoria]/
```

### El modal de login no aparece
```
Causa: El modal HTML no está presente en la página
Solución: Verificar que <div class="modal-overlay" id="loginModal"> exista
```

### El calendario no muestra fechas
```
Causa: localStorage corrompido
Solución: localStorage.removeItem('nicol_inicializado'); location.reload();
```

### La base de datos demo no se carga
```
Causa: Ya se inicializó anteriormente y se modificaron los datos
Solución: localStorage.clear(); location.reload();
```

### El escáner QR no inicia la cámara
```
Causa: Permiso denegado o sin cámara disponible
Solución: Usar el botón "Ingresar ID Manual" como alternativa
```

### Los estilos se ven rotos o diferentes
```
Causa: Google Fonts no cargó (sin Internet)
Solución: Las fuentes fallback (Georgia, Segoe UI) se usarán automáticamente
```

### Error "No se pudo cargar imagenes.json"
```
Causa: fetch a archivo local no permitido (política CORS en file://)
Solución: Usar servidor local (python -m http.server 8000)
```

---

## 📞 Soporte Técnico

Para dudas técnicas sobre este proyecto demo:

- **Sitio web:** codebuff.com
- **Documentación:** codebuff.com/docs
- **Proyecto:** Nicol Dress Rental — Demo B2B

---

*Documento generado el 15 de junio de 2026 · Versión 1.0*
