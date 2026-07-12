/**
 * ============================================================
 * Nicol Dress Rental - Base de Datos Falsa (Demo)
 * ============================================================
 * Este script inicializa tablas en localStorage:
 * - db_vestidos  → Catálogo de vestidos (+ tipo_cuerpo, corte)
 * - db_usuarios  → Perfiles de clientas
 * - db_citas     → Citas agendadas
 * - db_resenas   → Reseñas con fotos de clientas reales
 * - db_accesorios→ Accesorios para cross-selling
 * - db_danos     → Registro de daños/depósitos
 * - db_reservas_rapidas → Reservas sin login (CSV + WhatsApp)
 *
 * Se ejecuta automáticamente al cargar cualquier página.
 * ============================================================
 */

const INIT_KEY = 'nicol_inicializado_v3';

function formatDressName(v) {
  const sku = v.sku || `NDR-${String(v.id).padStart(3, '0')}`;
  return `${sku} (${v.nombre})`;
}

function inicializarBaseDeDatos() {
  if (localStorage.getItem(INIT_KEY)) return;

  // ─── VESTIDOS (50 VESTIDOS CON SKU Y PRECIOS AJUSTADOS EN GTQ) ───
  const sku = n => `NDR-${String(n).padStart(3, '0')}`;
  
  const db_vestidos = [
    // ===== ~~ BODA (IDs 1-10) =====
    { id: 1, sku: sku(1), nombre: 'Aurora Divine', categoria: 'Boda', color: 'Marfil', talla: ['M','L','XL'], precio_renta: 4500, precio_venta: 0, estado:'disponible', descripcion:'Elegante vestido de novia con encaje Chantilly sobre tul illusion. Escote en V profundo y espalda descubierta con botones forrados.', tela:'Encaje Chantilly, Tul illusion, Seda', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:18, fecha_retorno_lavanderia:null },
    { id: 51, sku: sku(51), nombre: 'Aurora Divine - Opción 2', categoria: 'Boda', color: 'Marfil', talla: ['M','L','XL'], precio_renta: 4500, precio_venta: 0, estado:'disponible', descripcion:'Elegante vestido de novia con encaje Chantilly sobre tul illusion. Escote en V profundo y espalda descubierta con botones forrados.', tela:'Encaje Chantilly, Tul illusion, Seda', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:0, fecha_retorno_lavanderia:null },
    { id: 2, sku: sku(2), nombre: 'Celestial Dream', categoria: 'Boda', color: 'Blanco', talla: ['XS','S','M'], precio_renta: 5200, precio_venta: 0, estado:'disponible', descripcion:'Vestido de novia estilo princesa con falda voluminosa de organza y corset bordado con pedrería. Cola de catedral desmontable.', tela:'Organza de seda, Bordado pedrería, Tul', tipo_cuerpo:['Pera','Rectángulo'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:1, rentas_completadas:12, fecha_retorno_lavanderia:null },
    { id: 3, sku: sku(3), nombre: 'Ivory Grace', categoria: 'Boda', color: 'Marfil', talla: ['S','M'], precio_renta: 3800, precio_venta: 0, estado:'lavanderia', descripcion:'Vestido de novia de corte sirena con encaje floral aplicado a mano. Escote bardot y mangas largas de tul transparente.', tela:'Encaje floral, Tul, Mikado', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:7, fecha_retorno_lavanderia: new Date(Date.now()+3*86400000).toISOString().split('T')[0] },
    { id: 4, sku: sku(4), nombre: 'Blush Romance', categoria: 'Boda', color: 'Rosado', talla: ['S','M','L'], precio_renta: 4800, precio_venta: 0, estado:'disponible', descripcion:'Vestido de novia en tono blush con capas de tul y appliques de flores en 3D. Escote corazón con mangas de encaje.', tela:'Tul bordado, Encaje, Seda', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:25, fecha_retorno_lavanderia:null },
    { id: 5, sku: sku(5), nombre: 'Golden Empress', categoria: 'Boda', color: 'Dorado', talla: ['M','L','XL'], precio_renta: 6500, precio_venta: 22000, estado:'disponible', descripcion:'Impresionante vestido de novia con bordados dorados a mano. Falda de organza con capas y cola de catedral.', tela:'Brocado dorado, Organza, Pedrería', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:1, rentas_completadas:30, fecha_retorno_lavanderia:null },
    { id: 6, sku: sku(6), nombre: 'Snow Princess', categoria: 'Boda', color: 'Blanco', talla: ['XS','S','M','L'], precio_renta: 5000, precio_venta: 0, estado:'disponible', descripcion:'Vestido de novia estilo princesa con corset de pedrería. Falda voluminosa de tul con detalles de cristal Swarovski.', tela:'Tul, Pedrería, Mikado', tipo_cuerpo:['Pera','Rectángulo'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:22, fecha_retorno_lavanderia:null },
    { id: 7, sku: sku(7), nombre: 'Vintage Lace', categoria: 'Boda', color: 'Marfil', talla: ['S','M'], precio_renta: 4200, precio_venta: 0, estado:'disponible', descripcion:'Vestido de novia de inspiración vintage con encaje de bolillos y mangas largas. Cuello alto con botones forrados en la espalda.', tela:'Encaje de bolillos, Tul, Raso', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Vaso', imagen:'', imagenes_extra:[], disponibles:1, rentas_completadas:14, fecha_retorno_lavanderia:null },
    { id: 8, sku: sku(8), nombre: 'Mermaid Dream', categoria: 'Boda', color: 'Blanco', talla: ['M','L'], precio_renta: 5500, precio_venta: 0, estado:'reparacion', descripcion:'Espectacular vestido de novia corte sirena con cola de pez. Cuerpo bordado con perlas y cristales. Escote en V profundo.', tela:'Mikado, Perlas, Cristal', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:9, fecha_retorno_lavanderia:null },
    { id: 9, sku: sku(9), nombre: 'Boho Chic', categoria: 'Boda', color: 'Marfil', talla: ['XS','S','M','L','XL'], precio_renta: 3500, precio_venta: 0, estado:'disponible', descripcion:'Vestido de novia bohemio con encaje floral y mangas acampanadas. Falda ligera con vuelo y espalda descubierta.', tela:'Encaje floral, Algodón, Tul', tipo_cuerpo:['Pera','Rectángulo','Reloj de Arena'], corte:'Imperio', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:35, fecha_retorno_lavanderia:null },
    { id: 10, sku: sku(10), nombre: 'Eternal Love', categoria: 'Boda', color: 'Blanco', talla: ['S','M','L'], precio_renta: 7000, precio_venta: 25000, estado:'agotado', descripcion:'Vestido de novia de alta costura con corset de encaje Chantilly y falda de múltiples capas de tul. Cola de catedral de 3 metros.', tela:'Encaje Chantilly, Tul, Seda salvaje', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:45, fecha_retorno_lavanderia:null },

    // ===== ~~ 15 AÑOS (IDs 11-20) =====
    { id: 11, sku: sku(11), nombre: 'Quinceañera Rose', categoria: '15 Años', color: 'Rosado', talla: ['S','M','L'], precio_renta: 2200, precio_venta: 0, estado:'disponible', descripcion:'Espectacular vestido de 15 años en tono rosado empolvado con falda de tul con capas y corset bordado con flores en 3D.', tela:'Tul bordado, Organza, Pedrería', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:25, fecha_retorno_lavanderia:null },
    { id: 12, sku: sku(12), nombre: 'Princess Tiffany', categoria: '15 Años', color: 'Azul', talla: ['XS','S','M','L'], precio_renta: 2500, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años azul cielo con falda de tul con capas de glitter. Incluye tiara y guantes largos a juego.', tela:'Tul con glitter, Organza, Seda', tipo_cuerpo:['Rectángulo','Triángulo Invertido'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:30, fecha_retorno_lavanderia:null },
    { id: 13, sku: sku(13), nombre: 'Golden Luxe', categoria: '15 Años', color: 'Dorado', talla: ['M','L','XL'], precio_renta: 2800, precio_venta: 0, estado:'reparacion', descripcion:'Vestido de 15 años dorado con aplicaciones de pedrería y mostacilla. Corte princesa con mangas abullonadas de tul.', tela:'Brocado dorado, Pedrería, Tul', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:5, fecha_retorno_lavanderia:null },
    { id: 14, sku: sku(14), nombre: 'Lavender Dream', categoria: '15 Años', color: 'Lavanda', talla: ['S','M'], precio_renta: 2100, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años lavanda con falda de tul con capas de organza. Corset bordado con flores en tonos plateados.', tela:'Tul, Organza, Bordado plateado', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:18, fecha_retorno_lavanderia:null },
    { id: 15, sku: sku(15), nombre: 'Coral Fantasy', categoria: '15 Años', color: 'Rojo', talla: ['M','L'], precio_renta: 2300, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años en tono coral con falda de tul con capas de glitter. Escote corazón y espalda con encaje.', tela:'Tul coral, Glitter, Encaje', tipo_cuerpo:['Pera','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:12, fecha_retorno_lavanderia:null },
    { id: 16, sku: sku(16), nombre: 'Sweet Sixteen', categoria: '15 Años', color: 'Blanco', talla: ['XS','S','M','L','XL'], precio_renta: 1900, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años blanco con detalles en plateado. Falda de tul con capas y corset con aplicaciones de strass.', tela:'Tul blanco, Strass, Organza', tipo_cuerpo:['Reloj de Arena','Rectángulo','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:5, rentas_completadas:28, fecha_retorno_lavanderia:null },
    { id: 17, sku: sku(17), nombre: 'Midnight Blue', categoria: '15 Años', color: 'Azul', talla: ['S','M','L'], precio_renta: 2600, precio_venta: 7800, estado:'disponible', descripcion:'Vestido de 15 años azul medianoche con falda de tul estrellado. Cuerpo bordado con pedrería plateada.', tela:'Tul estrellado, Pedrería, Mikado', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:20, fecha_retorno_lavanderia:null },
    { id: 18, sku: sku(18), nombre: 'Enchanted Rose', categoria: '15 Años', color: 'Rosado', talla: ['XS','S','M'], precio_renta: 2200, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años rosa chicle con capas de tul y flores en 3D. Cinturón de strass y espalda con botones forrados.', tela:'Tul rosa, Flores 3D, Strass', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:15, fecha_retorno_lavanderia:null },
    { id: 19, sku: sku(19), nombre: 'Silver Star', categoria: '15 Años', color: 'Plateado', talla: ['M','L','XL'], precio_renta: 2700, precio_venta: 0, estado:'disponible', descripcion:'Vestido de 15 años plateado con lentejuela completa. Corte princesa con cuello ilusión y mangas de tul.', tela:'Lentejuela plateada, Tul, Mikado', tipo_cuerpo:['Triángulo Invertido','Rectángulo'], corte:'Imperio', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:10, fecha_retorno_lavanderia:null },
    { id: 20, sku: sku(20), nombre: 'Majestic Queen', categoria: '15 Años', color: 'Dorado', talla: ['S','M','L'], precio_renta: 3200, precio_venta: 9500, estado:'agotado', descripcion:'Vestido de 15 años dorado imperial con bordados a mano. Falda de organza con capas y cola desmontable.', tela:'Brocado dorado, Organza, Bordado a mano', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:8, fecha_retorno_lavanderia:null },

    // ===== ~~ GRADUACIÓN (IDs 21-35) =====
    { id: 21, sku: sku(21), nombre: 'Scarlet Honor', categoria: 'Graduación', color: 'Rojo', talla: ['S','M','L'], precio_renta: 850, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación en rojo pasión con escote tipo princesa. Cierre oculto y pretina con detalles de cristal.', tela:'Gamuza, Cristal, Seda', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Imperio', imagen:'', imagenes_extra:[], disponibles:5, rentas_completadas:42, fecha_retorno_lavanderia:null },
    { id: 22, sku: sku(22), nombre: 'Velvet Night', categoria: 'Graduación', color: 'Negro', talla: ['XS','S','M','L','XL'], precio_renta: 950, precio_venta: 2800, estado:'disponible', descripcion:'Elegante vestido de graduación en terciopelo negro con abertura lateral. Corte sirena y espalda descubierta.', tela:'Terciopelo, Raso, Crepé', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:35, fecha_retorno_lavanderia:null },
    { id: 23, sku: sku(23), nombre: 'Silver Lining', categoria: 'Graduación', color: 'Plateado', talla: ['M','L'], precio_renta: 1100, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación plateado con lentejuelas. Corte recto con cinturón de strass y cuello halter.', tela:'Lentejuela, Mikado, Strass', tipo_cuerpo:['Rectángulo','Triángulo Invertido'], corte:'Recto', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:15, fecha_retorno_lavanderia:null },
    { id: 24, sku: sku(24), nombre: 'Teal Elegance', categoria: 'Graduación', color: 'Verde', talla: ['S','M','L','XL'], precio_renta: 900, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación verde teal con drapeado lateral. Escote asimétrico con detalle de broche dorado.', tela:'Gasa, Seda, Crepé', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Asimétrico', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:22, fecha_retorno_lavanderia:null },
    { id: 25, sku: sku(25), nombre: 'Crimson Night', categoria: 'Graduación', color: 'Rojo', talla: ['XS','S','M'], precio_renta: 750, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación rojo vino con detalles de encaje negro. Corte midi con manga corta y falda evasé.', tela:'Encaje, Crepé, Raso', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:28, fecha_retorno_lavanderia:null },
    { id: 26, sku: sku(26), nombre: 'Gold Rush', categoria: 'Graduación', color: 'Dorado', talla: ['S','M','L'], precio_renta: 800, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación dorado con lentejuela completa. Mini vestido con cuello tortuga y mangas largas.', tela:'Lentejuela, Malla, Seda', tipo_cuerpo:['Triángulo Invertido','Rectángulo'], corte:'Mini', imagen:'', imagenes_extra:[], disponibles:1, rentas_completadas:10, fecha_retorno_lavanderia:null },
    { id: 27, sku: sku(27), nombre: 'White Pearl', categoria: 'Graduación', color: 'Blanco', talla: ['XS','S','M','L'], precio_renta: 950, precio_venta: 0, estado:'agotado', descripcion:'Vestido de graduación blanco perla con aplicaciones de pedrería. Corte ajustado con escote en V.', tela:'Mikado, Pedrería, Tul', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Vaso', imagen:'', imagenes_extra:[], disponibles:0, rentas_completadas:8, fecha_retorno_lavanderia:null },
    { id: 28, sku: sku(28), nombre: 'Royal Blue', categoria: 'Graduación', color: 'Azul', talla: ['M','L','XL'], precio_renta: 1000, precio_venta: 3000, estado:'disponible', descripcion:'Vestido de graduación azul real con falda de tul con capas. Cuerpo bordado con pedrería plateada.', tela:'Tul bordado, Mikado, Pedrería', tipo_cuerpo:['Pera','Reloj de Arena'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:18, fecha_retorno_lavanderia:null },
    { id: 29, sku: sku(29), nombre: 'Classic Black', categoria: 'Graduación', color: 'Negro', talla: ['XS','S','M','L','XL'], precio_renta: 700, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación negro clásico con escote corazón. Falda midi tableada con cinturón de strass.', tela:'Crepé, Strass, Algodón', tipo_cuerpo:['Reloj de Arena','Rectángulo','Pera'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:6, rentas_completadas:40, fecha_retorno_lavanderia:null },
    { id: 30, sku: sku(30), nombre: 'Pink Blossom', categoria: 'Graduación', color: 'Rosado', talla: ['S','M'], precio_renta: 900, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación rosa empolvado con flores aplicadas. Corte princesa con falda de tul con capas.', tela:'Tul floral, Organza, Seda', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:14, fecha_retorno_lavanderia:null },
    { id: 31, sku: sku(31), nombre: 'Lavender Haze', categoria: 'Graduación', color: 'Lavanda', talla: ['XS','S','M'], precio_renta: 650, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación lavanda con vuelo. Escote corazón y falda tableada. Perfecto para eventos de día.', tela:'Algodón, Tul, Encaje', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:20, fecha_retorno_lavanderia:null },
    { id: 32, sku: sku(32), nombre: 'Emerald Spark', categoria: 'Graduación', color: 'Verde', talla: ['S','M','L','XL'], precio_renta: 850, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación verde esmeralda con drapeado lateral. Escote asimétrico con detalle de broche.', tela:'Gasa, Seda, Crepé', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Asimétrico', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:22, fecha_retorno_lavanderia:null },
    { id: 33, sku: sku(33), nombre: 'Blue Lagoon', categoria: 'Graduación', color: 'Azul', talla: ['M','L','XL'], precio_renta: 800, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación azul marino con detalles de pedrería en el escote. Corte evasé con manga 3/4.', tela:'Crepé, Pedrería, Gasa', tipo_cuerpo:['Pera','Reloj de Arena'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:16, fecha_retorno_lavanderia:null },
    { id: 34, sku: sku(34), nombre: 'Champagne Toast', categoria: 'Graduación', color: 'Marfil', talla: ['S','M','L'], precio_renta: 1050, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación champán con aplicaciones de pedrería. Corte sirena con abertura lateral y espalda descubierta.', tela:'Mikado, Pedrería, Tul', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:12, fecha_retorno_lavanderia:null },
    { id: 35, sku: sku(35), nombre: 'Candy Pink', categoria: 'Graduación', color: 'Rosado', talla: ['XS','S','M','L'], precio_renta: 750, precio_venta: 0, estado:'disponible', descripcion:'Vestido de graduación rosa chicle con falda de tul. Corte princesa con cinturón de moño satinado.', tela:'Tul, Raso, Satin', tipo_cuerpo:['Rectángulo','Pera'], corte:'Princesa', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:25, fecha_retorno_lavanderia:null },

    // ===== ~~ CÓCTEL / FIESTA (IDs 36-50) =====
    { id: 36, sku: sku(36), nombre: 'Black Tie', categoria: 'Cóctel', color: 'Negro', talla: ['XS','S','M','L','XL'], precio_renta: 550, precio_venta: 1600, estado:'disponible', descripcion:'Vestido de cóctel negro con detalles de pedrería en el escote. Corte ajustado con falda midi y espalda en V.', tela:'Crepé, Pedrería, Gasa', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Vaso', imagen:'', imagenes_extra:[], disponibles:5, rentas_completadas:38, fecha_retorno_lavanderia:null },
    { id: 37, sku: sku(37), nombre: 'Red Carpet', categoria: 'Cóctel', color: 'Rojo', talla: ['S','M','L'], precio_renta: 650, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel rojo pasión con lentejuela completa. Mini vestido con cuello halter y espalda descubierta.', tela:'Lentejuela, Mikado, Seda', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Mini', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:32, fecha_retorno_lavanderia:null },
    { id: 38, sku: sku(38), nombre: 'Golden Night', categoria: 'Cóctel', color: 'Dorado', talla: ['S','M'], precio_renta: 700, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel dorado con aplicaciones de strass. Corte sirena con falda de gasa y abertura lateral.', tela:'Gasa dorada, Strass, Seda', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:18, fecha_retorno_lavanderia:null },
    { id: 39, sku: sku(39), nombre: 'Silver Fox', categoria: 'Cóctel', color: 'Plateado', talla: ['M','L','XL'], precio_renta: 500, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel plateado con lentejuela. Corte recto con cinturón de cadena y cuello redondo.', tela:'Lentejuela, Crepé, Cadena', tipo_cuerpo:['Triángulo Invertido','Rectángulo'], corte:'Recto', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:14, fecha_retorno_lavanderia:null },
    { id: 40, sku: sku(40), nombre: 'Emerald City', categoria: 'Cóctel', color: 'Verde', talla: ['XS','S','M'], precio_renta: 600, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel verde esmeralda con drapeado frontal. Corte asimétrico con una manga y falda midi.', tela:'Gasa, Seda, Crepé', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Asimétrico', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:24, fecha_retorno_lavanderia:null },
    { id: 41, sku: sku(41), nombre: 'Blue Velvet', categoria: 'Cóctel', color: 'Azul', talla: ['S','M','L','XL'], precio_renta: 580, precio_venta: 1700, estado:'disponible', descripcion:'Vestido de cóctel azul marino en terciopelo con mangas largas. Corte ajustado con escote en V profundo.', tela:'Terciopelo, Raso, Crepé', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Vaso', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:30, fecha_retorno_lavanderia:null },
    { id: 42, sku: sku(42), nombre: 'White Swan', categoria: 'Cóctel', color: 'Blanco', talla: ['XS','S','M','L'], precio_renta: 480, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel blanco con detalles de encaje. Corte evasé con manga corta y escote barco.', tela:'Encaje, Algodón, Crepé', tipo_cuerpo:['Reloj de Arena','Rectángulo'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:20, fecha_retorno_lavanderia:null },
    { id: 43, sku: sku(43), nombre: 'Cocktail Red', categoria: 'Cóctel', color: 'Rojo', talla: ['S','M'], precio_renta: 450, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel rojo vino con encaje negro en las mangas. Corte midi con falda lápiz y escote redondo.', tela:'Encaje, Crepé, Raso', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Lápiz', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:26, fecha_retorno_lavanderia:null },
    { id: 44, sku: sku(44), nombre: 'Party Glitter', categoria: 'Cóctel', color: 'Dorado', talla: ['XS','S','M','L','XL'], precio_renta: 400, precio_venta: 1200, estado:'disponible', descripcion:'Vestido de cóctel dorado con glitter. Mini vestido con cuello redondo y mangas cortas. Perfecto para fiesta.', tela:'Glitter, Malla, Algodón', tipo_cuerpo:['Rectángulo','Triángulo Invertido'], corte:'Mini', imagen:'', imagenes_extra:[], disponibles:6, rentas_completadas:45, fecha_retorno_lavanderia:null },
    { id: 45, sku: sku(45), nombre: 'Mystic Purple', categoria: 'Cóctel', color: 'Lavanda', talla: ['M','L'], precio_renta: 600, precio_venta: 0, estado:'disponible', descripcion:'Vestido de cóctel lavanda oscuro con drapeado. Corte sirena con falda de gasa y espalda descubierta.', tela:'Gasa, Seda, Crepé', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:12, fecha_retorno_lavanderia:null },
    { id: 46, sku: sku(46), nombre: 'Summer Party', categoria: 'Cóctel', color: 'Rosado', talla: ['XS','S','M','L'], precio_renta: 450, precio_venta: 0, estado:'disponible', descripcion:'Vestido de fiesta rosado con vuelo. Estilo casual elegante con falda tableada y escote corazón.', tela:'Algodón, Tul, Encaje', tipo_cuerpo:['Reloj de Arena','Rectángulo','Pera'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:5, rentas_completadas:35, fecha_retorno_lavanderia:null },
    { id: 47, sku: sku(47), nombre: 'Tropical Night', categoria: 'Cóctel', color: 'Verde', talla: ['S','M','L'], precio_renta: 500, precio_venta: 0, estado:'disponible', descripcion:'Vestido de fiesta verde tropical con estampado floral. Corte midi con mangas abullonadas y escote en V.', tela:'Algodón estampado, Tul, Encaje', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:4, rentas_completadas:28, fecha_retorno_lavanderia:null },
    { id: 48, sku: sku(48), nombre: 'Cocktail Black', categoria: 'Cóctel', color: 'Negro', talla: ['XS','S','M','L','XL'], precio_renta: 480, precio_venta: 1400, estado:'disponible', descripcion:'Vestido de fiesta negro básico con detalles de encaje. Corte ajustado con falda lápiz y cuello tortuga.', tela:'Encaje, Crepé, Raso', tipo_cuerpo:['Reloj de Arena','Rectángulo','Triángulo Invertido'], corte:'Lápiz', imagen:'', imagenes_extra:[], disponibles:7, rentas_completadas:50, fecha_retorno_lavanderia:null },
    { id: 49, sku: sku(49), nombre: 'Sunset Glow', categoria: 'Cóctel', color: 'Rojo', talla: ['S','M','L'], precio_renta: 550, precio_venta: 0, estado:'disponible', descripcion:'Vestido de fiesta en degradado rojo anaranjado. Corte evasé con falda de gasa y escote bardot.', tela:'Gasa degradada, Seda, Crepé', tipo_cuerpo:['Reloj de Arena','Pera'], corte:'Evasé', imagen:'', imagenes_extra:[], disponibles:3, rentas_completadas:15, fecha_retorno_lavanderia:null },
    { id: 50, sku: sku(50), nombre: 'Diamond Queen', categoria: 'Cóctel', color: 'Plateado', talla: ['M','L','XL'], precio_renta: 750, precio_venta: 0, estado:'disponible', descripcion:'Vestido de fiesta plateado con pedrería completa. Corte sirena con falda de gasa y escote en V profundo.', tela:'Pedrería, Gasa, Mikado', tipo_cuerpo:['Reloj de Arena','Triángulo Invertido'], corte:'Sirena', imagen:'', imagenes_extra:[], disponibles:2, rentas_completadas:20, fecha_retorno_lavanderia:null }
  ];

  // ─── USUARIOS (con teléfonos realistas GT) ────────────────
  const db_usuarios = [
    {
      id: 101,
      nombre: 'María García',
      correo: 'maria@demo.com',
      password: '123456',
      telefono: '502 5555-0101',
      favoritos: [1, 5, 10]
    },
    {
      id: 102,
      nombre: 'Ana López',
      correo: 'ana@demo.com',
      password: '123456',
      telefono: '502 5555-0102',
      favoritos: [7, 8, 13]
    },
    {
      id: 103,
      nombre: 'Carmen Ruiz',
      correo: 'carmen@demo.com',
      password: '123456',
      telefono: '502 5555-0103',
      favoritos: [4, 11]
    },
    {
      id: 999,
      nombre: 'Admin Boutique',
      correo: 'admin@boutique.com',
      password: 'admin123',
      telefono: '502 2339-4963',
      favoritos: []
    }
  ];

  // ─── CITAS ────────────────────────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  const fmt = d => d.toISOString().split('T')[0];

  const db_citas = [
    {
      id_cita: 201,
      id_usuario: 101,
      id_vestido: 1,
      fecha: fmt(tomorrow),
      hora: '11:00',
      tipo: 'prueba',
      notes: 'Quiere ver también el vestido Ivory Grace si está disponible',
      estado_cita: 'pendiente',
      creada_en: fmt(today)
    },
    {
      id_cita: 202,
      id_usuario: 102,
      id_vestido: 7,
      fecha: fmt(today),
      hora: '16:30',
      tipo: 'prueba',
      notas: '',
      estado_cita: 'pendiente',
      creada_en: fmt(today)
    },
    {
      id_cita: 203,
      id_usuario: 101,
      id_vestido: 5,
      fecha: fmt(nextWeek),
      hora: '10:00',
      tipo: 'renta',
      notas: 'Evento: XV años de su prima',
      estado_cita: 'confirmada',
      creada_en: fmt(today)
    },
    {
      id_cita: 204,
      id_usuario: 103,
      id_vestido: 4,
      fecha: fmt(nextMonth),
      hora: '12:00',
      tipo: 'renta',
      notas: 'Para el evento de XV años',
      estado_cita: 'confirmada',
      creada_en: fmt(today)
    },
    {
      id_cita: 205,
      id_usuario: 103,
      id_vestido: 11,
      fecha: fmt(tomorrow),
      hora: '14:00',
      tipo: 'devolucion',
      notas: 'Devolver vestido rentado',
      estado_cita: 'pendiente',
      creada_en: fmt(today)
    }
  ];

  // ─── RESEÑAS ────────────────────────────────────────────────
  const db_resenas = [
    {
      id: 301,
      id_vestido: 7,
      id_usuario: 101,
      nombre_usuario: 'María García',
      puntuacion: 5,
      texto: 'Me encantó este vestido para mi graduación. ¡Recibí muchísimos cumplidos! La tela es preciosa y se ajustó perfectamente.',
      foto: 'https://picsum.photos/seed/review1/200/200',
      fecha: '2026-03-15'
    },
    {
      id: 302,
      id_vestido: 1,
      id_usuario: 102,
      nombre_usuario: 'Ana López',
      puntuacion: 5,
      texto: 'El vestido Aurora Divine fue el sueño de mi boda. El encaje es espectacular y el servicio de la boutique increíble. Lo recomiendo 100%.',
      foto: 'https://picsum.photos/seed/review2/200/200',
      fecha: '2026-02-20'
    },
    {
      id: 303,
      id_vestido: 5,
      id_usuario: 103,
      nombre_usuario: 'Carmen Ruiz',
      puntuacion: 4,
      texto: 'Hermoso vestido para mis 15. El color azul cielo es divino. Solo le pongo 4 estrellas porque le faltó un poco de volumen a la falda.',
      foto: 'https://picsum.photos/seed/review3/200/200',
      fecha: '2026-01-10'
    },
    {
      id: 304,
      id_vestido: 11,
      id_usuario: 101,
      nombre_usuario: 'María García',
      puntuacion: 5,
      texto: 'Perfecto para una cena de gala. El color esmeralda es vibrante y la tela de seda se siente increíble. ¡Me lo compré!',
      foto: null,
      fecha: '2026-04-02'
    },
    {
      id: 305,
      id_vestido: 8,
      id_usuario: 102,
      nombre_usuario: 'Ana López',
      puntuacion: 5,
      texto: 'El terciopelo es de altísima calidad. Me sentí una estrella de cine. Definitivamente volveré a rentar en Nicol Dress Rental.',
      foto: 'https://picsum.photos/seed/review5/200/200',
      fecha: '2026-05-18'
    },
    {
      id: 306,
      id_vestido: 4,
      id_usuario: 103,
      nombre_usuario: 'Carmen Ruiz',
      puntuacion: 5,
      texto: 'El vestido Quinceañera Rose es un sueño. Las fotos no le hacen justicia, en persona es muchísimo más bonito. ¡100% recomendado!',
      foto: 'https://picsum.photos/seed/review6/200/200',
      fecha: '2026-06-01'
    }
  ];

  // ─── ACCESORIOS (Cross-selling) ───────────────────────────
  const db_accesorios = [
    { id: 401, nombre: 'Tiara de Cristal', precio: 150, icono: '◈', categoria: 'Cabello', imagen: 'https://picsum.photos/seed/acc1/200/200' },
    { id: 402, nombre: 'Bolso de Noche', precio: 250, icono: '◈', categoria: 'Accesorios', imagen: 'https://picsum.photos/seed/acc2/200/200' },
    { id: 403, nombre: 'Chal de Seda', precio: 180, icono: '◈', categoria: 'Ropa', imagen: 'https://picsum.photos/seed/acc3/200/200' },
    { id: 404, nombre: 'Collar de Perlas', precio: 190, icono: '◈', categoria: 'Joyas', imagen: 'https://picsum.photos/seed/acc4/200/200' },
    { id: 405, nombre: 'Guantes Largos', precio: 120, icono: '◈', categoria: 'Ropa', imagen: 'https://picsum.photos/seed/acc5/200/200' },
    { id: 406, nombre: 'Pamela Elegante', precio: 220, icono: '◈', categoria: 'Cabello', imagen: 'https://picsum.photos/seed/acc6/200/200' },
    { id: 407, nombre: 'Zapatos Talla 36', precio: 350, icono: '◈', categoria: 'Calzado', imagen: 'https://picsum.photos/seed/acc7/200/200' },
    { id: 408, nombre: 'Aretes de Strass', precio: 120, icono: '◈', categoria: 'Joyas', imagen: 'https://picsum.photos/seed/acc8/200/200' }
  ];

  // ─── DAÑOS / DEPÓSITOS ──────────────────────────────────
  const db_danos = [
    {
      id: 501,
      id_cita: 205,
      id_vestido: 11,
      id_usuario: 103,
      descripcion: 'Ruedo descosido 5cm en costado izquierdo',
      tipo: 'Menor',
      deposito_retener: 250,
      fecha_reporte: fmt(today),
      estado: 'pendiente'
    }
  ];

  // ─── GUARDAR EN LOCALSTORAGE ─────────────────────────────
  localStorage.setItem('db_vestidos', JSON.stringify(db_vestidos));
  localStorage.setItem('db_usuarios', JSON.stringify(db_usuarios));
  localStorage.setItem('db_citas', JSON.stringify(db_citas));
  localStorage.setItem('db_resenas', JSON.stringify(db_resenas));
  localStorage.setItem('db_accesorios', JSON.stringify(db_accesorios));
  localStorage.setItem('db_danos', JSON.stringify(db_danos));
  localStorage.setItem('db_reservas_rapidas', JSON.stringify([]));
  localStorage.setItem(INIT_KEY, 'true');

  console.log('✓ Nicol Dress Rental - Base de datos inicializada con éxito');
  console.log(`  [V] ${db_vestidos.length} vestidos`);
  console.log(`  [U] ${db_usuarios.length} usuarios`);
  console.log(`  [C] ${db_citas.length} citas`);
  console.log(`  [R] ${db_resenas.length} reseñas`);
  console.log(`  [A] ${db_accesorios.length} accesorios`);
  console.log(`  [D] ${db_danos.length} daños registrados`);
}

// ─── FUNCIONES DE ACCESO A DATOS ────────────────────────────

function getVestidos() {
  return JSON.parse(localStorage.getItem('db_vestidos')) || [];
}

function getUsuarios() {
  return JSON.parse(localStorage.getItem('db_usuarios')) || [];
}

function getCitas() {
  return JSON.parse(localStorage.getItem('db_citas')) || [];
}

function getVestidoById(id) {
  return getVestidos().find(v => v.id === id);
}

function getUsuarioById(id) {
  return getUsuarios().find(u => u.id === id);
}

function getUsuarioByEmail(email) {
  return getUsuarios().find(u => u.correo === email);
}

function getUsuarioByTelefono(telefono) {
  const clean = telefono.replace(/\D/g, '');
  return getUsuarios().find(u => {
    const uClean = u.telefono.replace(/\D/g, '');
    return uClean === clean || uClean.endsWith(clean.slice(-8));
  });
}

function getCitasByUsuario(idUsuario) {
  return getCitas().filter(c => c.id_usuario === idUsuario);
}

function getCitasByVestido(idVestido) {
  return getCitas().filter(c => c.id_vestido === idVestido);
}

function getVestidosByCategoria(categoria) {
  return getVestidos().filter(v => v.categoria === categoria);
}

function getVestidosByTipoCuerpo(tipo) {
  return getVestidos().filter(v => v.tipo_cuerpo && v.tipo_cuerpo.includes(tipo) && v.estado !== 'lavanderia' && v.estado !== 'reparacion');
}

function getVestidosDisponibles() {
  return getVestidos().filter(v => v.estado === 'disponible' && v.disponibles > 0);
}

function getVestidosFavoritos(ids) {
  return getVestidos().filter(v => ids.includes(v.id));
}

function saveVestidos(vestidos) {
  localStorage.setItem('db_vestidos', JSON.stringify(vestidos));
}

function saveUsuarios(usuarios) {
  localStorage.setItem('db_usuarios', JSON.stringify(usuarios));
}

function saveCitas(citas) {
  localStorage.setItem('db_citas', JSON.stringify(citas));
}

function agregarCita(idUsuario, idVestido, fecha, hora, tipo, notas) {
  const citas = getCitas();
  const nuevaCita = {
    id_cita: Date.now(),
    id_usuario: idUsuario,
    id_vestido: idVestido,
    fecha,
    hora,
    tipo,
    notas: notas || '',
    estado_cita: 'pendiente',
    creada_en: new Date().toISOString().split('T')[0]
  };
  citas.push(nuevaCita);
  saveCitas(citas);
  return nuevaCita;
}

function actualizarEstadoCita(idCita, nuevoEstado) {
  const citas = getCitas();
  const idx = citas.findIndex(c => c.id_cita === idCita);
  if (idx !== -1) {
    citas[idx].estado_cita = nuevoEstado;
    saveCitas(citas);
    return true;
  }
  return false;
}

function toggleFavorito(idUsuario, idVestido) {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.id === idUsuario);
  if (!usuario) return false;

  const idx = usuario.favoritos.indexOf(idVestido);
  if (idx === -1) {
    usuario.favoritos.push(idVestido);
  } else {
    usuario.favoritos.splice(idx, 1);
  }
  saveUsuarios(usuarios);
  return true;
}

function esFavorito(idUsuario, idVestido) {
  const usuario = getUsuarioById(idUsuario);
  return usuario ? usuario.favoritos.includes(idVestido) : false;
}

// ─── FUNCIONES PARA RESEÑAS ────────────────────────────────
function getResenas() {
  return JSON.parse(localStorage.getItem('db_resenas')) || [];
}

function getResenasByVestido(idVestido) {
  return getResenas().filter(r => r.id_vestido === idVestido);
}

// ─── FUNCIONES PARA ACCESORIOS ─────────────────────────────
function getAccesorios() {
  return JSON.parse(localStorage.getItem('db_accesorios')) || [];
}

// ─── FUNCIONES PARA DAÑOS ──────────────────────────────────
function getDanos() {
  return JSON.parse(localStorage.getItem('db_danos')) || [];
}

function agregarDano(idCita, idVestido, idUsuario, descripcion, tipo, deposito) {
  const danos = getDanos();
  danos.push({
    id: Date.now(),
    id_cita: idCita,
    id_vestido: idVestido,
    id_usuario: idUsuario,
    descripcion,
    tipo,
    deposito_retener: deposito,
    fecha_reporte: new Date().toISOString().split('T')[0],
    estado: 'pendiente'
  });
  localStorage.setItem('db_danos', JSON.stringify(danos));
}

// ─── FUNCIONES PARA RESERVAS RÁPIDAS ────────────────────────
function getReservasRapidas() {
  return JSON.parse(localStorage.getItem('db_reservas_rapidas')) || [];
}

function getReservasRapidasByTelefono(telefono) {
  const clean = telefono.replace(/\D/g, '');
  return getReservasRapidas().filter(r => {
    const rClean = r.telefono.replace(/\D/g, '');
    return rClean === clean || rClean.endsWith(clean.slice(-8));
  });
}

function agregarReservaRapida(data) {
  const reservas = getReservasRapidas();
  const reserva = {
    id_reserva: Date.now(),
    nombre: data.nombre,
    telefono: data.telefono,
    id_usuario: data.id_usuario || null,
    id_vestido: data.id_vestido,
    sku: data.sku,
    nombre_vestido: data.nombre_vestido,
    categoria: data.categoria,
    precio_renta: data.precio_renta,
    fecha_prueba: data.fecha_prueba,
    fecha_evento: data.fecha_evento,
    hora: data.hora || '',
    notas: data.notas || '',
    fecha_reserva: new Date().toISOString().split('T')[0],
    tipo: 'rapida'
  };
  reservas.push(reserva);
  localStorage.setItem('db_reservas_rapidas', JSON.stringify(reservas));
  return reserva;
}

// ─── SESIÓN DE USUARIO ──────────────────────────────────────

function loginUsuario(correo, password) {
  const usuario = getUsuarioByEmail(correo);
  if (usuario && usuario.password === password) {
    sessionStorage.setItem('currentUser', JSON.stringify(usuario));
    return usuario;
  }
  return null;
}

function logoutUsuario() {
  sessionStorage.removeItem('currentUser');
}

function getCurrentUser() {
  const data = sessionStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

function isLoggedIn() {
  return !!getCurrentUser();
}

// ─── INICIALIZAR ────────────────────────────────────────────
inicializarBaseDeDatos();