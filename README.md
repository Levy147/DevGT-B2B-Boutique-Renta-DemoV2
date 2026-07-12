# Nicol Dress Rental

**Sistema Demo de Alquiler de Vestidos** — Portal de Cliente + Panel Administrativo B2B

> 7av 16-21 zona 9, Guatemala · 5857-0841 · info@nicoldressrental.com

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Requisitos](#requisitos)
- [Instalacion y Uso](#instalacion-y-uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Guia Rapida para Clientes](#guia-rapida-para-clientes)
- [Guia Rapida para Administradores](#guia-rapida-para-administradores)
- [Funcionalidades Clave](#funcionalidades-clave)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Paleta de Colores Estrategica](#paleta-de-colores-estrategica)

---

## Descripcion

**Nicol Dress Rental** es una demo interactiva de un sistema completo de alquiler de vestidos para una boutique. Esta dividido en dos experiencias:

| Portal del Cliente | Panel del Admin |
|-------------------|-----------------|
| Landing page con catalogo | Dashboard con metricas |
| Filtros por categoria, color, talla, precio y **tipo de cuerpo** | Gestion de citas (aprobar/rechazar) |
| Detalle del vestido con galeria y resenas | **CRUD completo** de inventario (50 vestidos) |
| Calendario para **agendar citas de prueba** | **Generador de codigos QR** por vestido |
| Favoritos y mis citas | **Simulador de WhatsApp** para recordatorios |
| Modulo **"Completa tu Look"** (cross-selling) | Control de **tintoreria y danos** |
| Resenas reales de clientas | **Gestion de usuarios** y anuncios globales |
| Paginas de FAQ, Politicas, Terminos y Privacidad | **Registro de ingresos** con exportacion CSV |

---

## Requisitos

- Un navegador web moderno (Chrome, Firefox, Edge, Safari)
- **No requiere servidor** — todo funciona 100% del lado del cliente
- **No requiere internet** para funcionalidad base (solo para imagenes placeholder y QR)
- **No requiere instalacion de dependencias**

---

## Instalacion y Uso

### 1. Descargar el proyecto
```bash
git clone <tu-repositorio>  # o descarga el ZIP
```

### 2. Abrir en el navegador
Simplemente abre el archivo **`index.html`** en tu navegador:

```bash
# En Windows (doble clic en index.html)
# O desde terminal:
start index.html
```

> **Importante**: Para evitar problemas de CORS con `localStorage`, abre los archivos directamente (protocolo `file://`) o subelos a cualquier servidor estatico (Netlify, Vercel, GitHub Pages, etc.).

### 3. Base de datos demo
La base de datos se inicializa automaticamente en `localStorage` al cargar cualquier pagina. Viene precargada con **50 vestidos de ejemplo**, 4 usuarios demo, 5 citas de prueba, 6 resenas y 8 accesorios.

---

## Estructura del Proyecto

```
Nicol-Dress-Rental/
|
|-- index.html              # Landing Page (Hero, Slider, Como funciona)
|-- catalogo.html           # Catalogo con filtros
|-- vestido.html            # Detalle del vestido + calendario
|-- faq.html                # Preguntas Frecuentes
|-- politicas.html          # Politica de Alquiler
|-- terminos.html           # Terminos y Condiciones
|-- privacidad.html         # Aviso de Privacidad
|-- README.md               # Este archivo
|
|-- admin/                  # Panel de Administracion
|   |-- dashboard.html      # Metricas, citas, estadisticas, danos, ingresos
|   |-- inventario.html     # CRUD de vestidos + QR
|   |-- usuarios.html       # Gestion de usuarios y anuncios globales
|   |-- scanner.html        # Escaner QR + ID manual
|
|-- public/
    |-- css/
    |   |-- main.css        # Estilos globales (paleta de colores)
    |   |-- cliente.css     # Estilos del portal cliente
    |   |-- admin.css       # Estilos del panel admin
    |
    |-- img/                # Imagenes del proyecto
    |   |-- config/         # Configuracion de imagenes (local vs placeholder)
    |   |-- vestidos/       # Imagenes organizadas por categoria
    |
    |-- js/
        |-- data.js         # Base de datos falsa (50 vestidos, 4 usuarios, resenas, accesorios)
        |-- catalogo.js     # Filtros combinados + tipo de cuerpo
        |-- carrito.js      # Auth, favoritos, citas, calendario, resenas, cross-selling
        |-- admin.js        # Dashboard, CRUD, WhatsApp, estadisticas, tintoreria, ingresos
        |-- qr-scanner.js   # Lector QR con camara
        |-- image-config.js # Sistema de resolucion de imagenes (local vs placeholder)
```

---

## Guia Rapida para Clientes

### 1. Explorar el catalogo
1. Abre **`index.html`**
2. Haz clic en **"Explorar Catalogo"** o ve a **`catalogo.html`**

### 2. Filtrar vestidos
Usa la barra lateral de filtros:
- **Categoria**: Boda, 15 Anos, Graduacion, Coctel
- **Color**: Selecciona por circulos de color
- **Talla**: XS, S, M, L, XL
- **Precio**: Rango minimo y maximo
- **Tipo de Cuerpo**: Reloj de Arena, Pera, Triangulo Invertido, Rectangulo
- **Tipo**: Solo Alquiler / Solo Venta
- **Busqueda por nombre**

### 3. Ver detalle del vestido
Haz clic en cualquier tarjeta para ver:
- Galeria de fotos con thumbnails
- Tallas disponibles y tipo de cuerpo recomendado
- Guia de tallas con medidas
- Resenas de clientas reales
- **"Completa tu Look"** — accesorios sugeridos

### 4. Agendar una cita
1. Inicia sesion (ver credenciales abajo)
2. En el detalle del vestido, haz clic en **"Agendar Cita de Prueba"**
3. Selecciona una **fecha** en el calendario interactivo
4. Selecciona un **horario** disponible (10:00 - 18:00)
5. Confirma la cita

### 5. Gestionar favoritos
- Haz clic en el corazon de cualquier tarjeta para agregar/quitar favoritos
- Ve a **"Mis Favoritos"** desde el menu de usuario
- Tambien desde el icono de corazon en la barra de navegacion

### 6. Ver mis citas y rentas
Desde el menu de usuario (haciendo clic en tu nombre), puedes ver:
- **Mis Citas**: Estado de tus reservas con opciones de cancelar o reprogramar
- **Mis Rentas**: Historial de tus rentas

### 7. Informacion legal
Desde el footer de cualquier pagina:
- **Preguntas Frecuentes** (`faq.html`)
- **Politica de Alquiler** (`politicas.html`)
- **Terminos y Condiciones** (`terminos.html`)
- **Aviso de Privacidad** (`privacidad.html`)

---

## Guia Rapida para Administradores

### Acceso al panel
1. Inicia sesion con las credenciales de admin (abajo)
2. Desde el menu de usuario, selecciona **"Panel Admin"**
3. O directamente abre **`admin/dashboard.html`**
4. Tambien hay un boton **"Cambiar a Vista Admin"** en el footer

### Dashboard
- **Metricas rapidas**: Citas hoy, vestidos disponibles, en lavanderia, en reparacion
- **Calendario admin**: Vista mensual con conteo de citas por dia
- **Citas del dia**: Con boton WhatsApp para enviar recordatorio
- **Citas pendientes**: Aprobar / Rechazar / Asistio
- **Top 5 mas rentados**: Barras animadas con ingresos totales
- **Vestidos en tintoreria**: Lista con fecha estimada de retorno
- **Control de danos**: Registro de danos reportados y depositos a retener
- **Registro de ingresos**: Agregar, editar, eliminar ingresos con exportacion CSV

### Inventario
- **Tabla completa** de 50 vestidos con estado
- **Agregar**: Formulario completo para nuevo vestido
- **Editar**: Haz clic en el lapiz para modificar cualquier vestido
- **Eliminar**: Boton rojo para eliminar del catalogo
- **QR**: Genera un codigo QR para cada vestido (escanea para ver detalle)
- **Estado inline**: Cambia el estado directamente desde la tabla (disponible, agotado, lavanderia, reparacion)
- **Buscar**: Filtro de busqueda en tiempo real

### Usuarios
- **Tabla de usuarios**: Lista todos los usuarios registrados con sus datos
- **Ver citas**: Consulta las citas de cada usuario
- **Anuncios globales**: Envia anuncios que se muestran como modales a todos los clientes

### Scanner QR
1. Abre **`admin/scanner.html`**
2. Haz clic en **"Iniciar Camara"** para escanear QRs
3. O usa **"Ingresar ID Manual"** para buscar por numero
4. Al detectar un vestido, puedes **cambiar su estado** directamente

---

## Funcionalidades Clave

### Filtro por Tipo de Cuerpo
Cada vestido tiene etiquetas de **tipo de cuerpo recomendado**:

| Tipo de Cuerpo | Cortes que Favorecen |
|----------------|---------------------|
| **Reloj de Arena** | Sirena, Corte princesa, Ajustado |
| **Pera** | Princesa, Evase, Imperio |
| **Triangulo Invertido** | Sirena, Asimetrico, Mini |
| **Rectangulo** | Princesa, Imperio, Recto |

### Modulo "Completa tu Look"
En la pagina de detalle del vestido, se muestran **8 accesorios** sugeridos:
- Tiara de Cristal ($350)
- Bolso de Noche ($450)
- Chal de Seda ($380)
- Collar de Perlas ($290)
- Guantes Largos ($280)
- Pamela Elegante ($320)
- Zapatos Talla 36 ($550)
- Aretes de Strass ($220)

### Resenas Reales (Social Proof)
Cada vestido muestra resenas escritas por clientas que ya lo usaron, con fotos reales y calificacion de estrellas.

### Gatillos de Urgencia
Los vestidos con alta demanda (>20 rentas) y pocas unidades disponibles muestran un badge **"Alta demanda"** con animacion pulsante.

### Simulador de WhatsApp
Desde el dashboard admin, cada cita del dia tiene un boton que abre WhatsApp con un mensaje pre-llenado:
> "Hola [Nombre]! Te esperamos manana a las [Hora] para tu [Tipo de Cita] de [Vestido] en Nicol Dress Rental. 7av 16-21 zona 9, Guatemala."

Tambien hay un **boton flotante de WhatsApp** en todas las paginas para contacto directo.

### Switch Rapido Admin/Cliente
En el footer de todas las paginas hay un boton **"Cambiar a Vista Admin"** para cambiar entre la vista de cliente y el panel administrativo instantaneamente.

---

## Credenciales de Prueba

| Rol | Email | Contrasena | Que puedes hacer? |
|-----|-------|-----------|-------------------|
| **Admin** | `admin@boutique.com` | `admin123` | Dashboard, inventario, QR, citas, usuarios, ingresos |
| **Cliente** | `maria@demo.com` | `123456` | Favoritos [1,5,10], citas programadas |
| **Cliente** | `ana@demo.com` | `123456` | Favoritos [7,8,13], citas programadas |
| **Cliente** | `carmen@demo.com` | `123456` | Favoritos [4,11], citas programadas |

---

## Paleta de Colores Estrategica

| Color | Codigo | Uso |
|-------|--------|-----|
| Vino Tinto | `#a8445c` | Botones CTA, acentos principales |
| Vino Oscuro | `#7a2d42` | Hover de botones, acentos oscuros |
| Fondo Oscuro | `#11080c` | Fondo principal |
| Texto Claro | `#f2e8ea` | Texto principal |
| Acento Rosa | `#c9788a` | Acentos secundarios |
| Acento Dorado | `#d4a574` | Bordes, detalles sutiles |

---

## Licencia

Demo educativa y de ventas. Proyecto libre para presentaciones comerciales.

---

*Desarrollado por DevGT — Empresa de Soluciones de Software*
