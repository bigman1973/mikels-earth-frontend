# Apertura pública BF26 · 27 de noviembre de 2026, 09:00 Madrid

Este documento registra los pasos aprobados, no los ejecuta ni los programa. El mecanismo es el enlace directo a una ficha activa-oculta. No se crea otro control de acceso.

## Estado hasta la apertura pública

Las seis rutas se declaran en `NONINDEX_STATIC_ROUTE_SEO`, igual que `/vip` y `/vip/gracias`. Se generan HTML y un índice de directorio con `noindex, nofollow`; permanecen fuera de `public/sitemap.xml`. La disponibilidad sigue dependiendo de la API: un pack inactivo devuelve 404 y no se puede comprar, aunque su HTML exista. Un pack activo-oculto puede cargar por enlace directo y no aparece en el listado.

La intervención del 5 de noviembre no activa los seis. Sólo BF26-PARA3 está autorizado para una activación temporal de compra, siempre oculto y con desactivación al terminar o ante la primera discrepancia. La comprobación móvil de Jordi precede a la compra. El resto permanece inactivo.

En la apertura VIP del 26 a las 09:00 Madrid, cualquier activación de los seis requiere ejecutar la apertura aprobada; el listado sigue oculto, el HTML sigue noindex y no se cambia el sitemap. No se activa ahora por una fecha escrita en el código.

## Apertura pública del 27

1. **Apertura comercial manual y coordinada.** Verificar por SKU los seis productos y sus precios/recetas antes de ponerlos activos y visibles a las 09:00 Madrid. Si cualquiera falla, parar. Mantener la cosecha 2025/26 visible en las dos fichas Temprano y conservar el 2026/27 como artículo independiente. No cambiar precios, impuestos, transporte o inventario por esta apertura.
2. **Retirar las seis declaraciones temporales de `NONINDEX_STATIC_ROUTE_SEO`.** Retirar sólo las claves `/producto/...` de campaña indicadas abajo. `/vip` y `/vip/gracias` continúan noindex y fuera del sitemap. No basta con cambiar `visibleInStore`: el HTML inicial también debe perder el noindex temporal.
3. **Incluir las seis URL en `public/sitemap.xml`.** Usar los mismos slugs y canonical, sin duplicados ni rutas alternativas. El resto de URLs actuales se conserva. Añadir su lastmod real de publicación. Actualizar el guard del generador que actualmente exige 23 rutas para incluir las seis nuevas y ajustar las pruebas de conteo/sitemap e invariantes correspondientes; no eliminar comprobaciones para hacer pasar la apertura.
4. **Build y despliegue público coordinados con el listado real.** El generador toma los metadatos del listado API; las seis entradas del sitemap deben existir ahí cuando se ejecute el build. No marcar el trabajo terminado sólo por cambiar flags de base de datos. No desplegar el borrador de rewrite de Vercel junto a esta apertura sin autorización nueva.
5. **Verificación directa y renderizada.** Las seis URL deben devolver 200, mostrar su ficha correcta y tener `index, follow` sin ningún `noindex` residual en el HTML estático o tras React. Comprobar la presencia de las seis URL en el sitemap servido, sus canonical y la ausencia de cifras de stock. Confirmar que `/vip` y `/vip/gracias` conservan `noindex, nofollow`.
6. **Cuadrícula y compra.** Confirmar las seis tarjetas en el orden aprobado y el Temprano 2026/27 detrás, con nombres de cosecha íntegros. Mantener la política aprobada de cupones, excepciones de colaboradores y corte del 30. No restaurar stock o usos de cupones sobre ventas reales.

## Las seis URL

- BF26-TEMP6: `/producto/aceite-temprano-sin-filtrar-cosecha-2025-26-pack-6`
- BF26-TEMP12: `/producto/aceite-temprano-sin-filtrar-cosecha-2025-26-caja-12`
- BF26-ECO6: `/producto/black-friday-aceite-ecologico-pack-6`
- BF26-PARA3: `/producto/black-friday-paraguayo-720g-pack-3`
- BF26-PARA6: `/producto/black-friday-paraguayo-720g-pack-6`
- BF26-5L3: `/producto/black-friday-aceite-5l-caja-3`

No se considera certificada la apertura pública hasta completar las verificaciones de HTML, sitemap y listado. La corrección global de `vercel.json` queda aparte en una rama local, sin despliegue ahora.
