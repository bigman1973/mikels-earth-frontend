# Bloque D · Precio habitual exclusivamente por unidad

Preparado para revisión local antes de publicar, sobre frontend de producción `719a5be0641c3ba3c2345f099be32e7c96facfea`. Requiere el backend con metadatos `pricingData` de las seis definiciones oficiales. No existe un catálogo frontend adicional de referencias ni se duplican sus importes en código comercial.

La utilidad `getCampaignUnitReference` valida identidad BF exacta y el bloque backend con `basis: unit`. El componente compartido `CampaignUnitReference` muestra el precio de botella/tarro/garrafa, su precio habitual dentro de `<s>` y el porcentaje declarado. La ficha y la tarjeta muestran separadamente `Pack completo:` con el total cobrable original, sin tachado ni comparación del pack. PARA6 no calcula su total desde el redondeo de unidad.

El titular **HASTA EL 50 % DE DESCUENTO** se limita a la cuadrícula que reciba al menos un pack con metadatos válidos; el listado real de productos ocultos no lo muestra. No se cambia el copy de `/vip`, bienvenida o correos reales. Copy reservado para posibles borradores de campaña: `HASTA EL 50 % DE DESCUENTO`; cada producto utiliza su comparación exclusivamente por unidad, nunca «antes/ahora» del total de pack. No se crea ni activa una campaña o flujo.

MIKVET500 2026/27 conserva 19,90 € sin referencia, porcentaje o tachado. No se toca fallback público, activación, visibilidad, SEO global, `vercel.json`, rutas HTML noindex, sitemap, carrito, stock, transporte, impuestos ni consentimientos.

La fixture `tests/fixtures/bf26-unit-reference-backend.json` es una respuesta auténtica del handler Flask en SQLite desechable; no producción, no clientes, no inventario exacto. Los previews mantienen las fichas no disponibles y noindex. La cuadrícula de prueba usa una proyección local de visibilidad para mostrar cómo quedaría; no constituye una modificación de catálogo.

`tests/bf26-unit-reference.test.mjs` hace render SSR real de tarjetas y render React StrictMode de las seis fichas con Chromium en red aislada. Comprueba que el único tachado pertenece a la unidad, los totales exactos, la exclusión de la cosecha actual, el alcance del titular y la ausencia de peticiones inesperadas o envíos de formulario. Las capturas móviles se escriben fuera del repositorio.
