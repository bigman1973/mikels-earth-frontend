# Mikel's Earth - E-commerce Frontend

Sitio web de comercio electrónico para Mikel's Earth, empresa familiar dedicada a productos naturales y artesanales desde 1819.

## 🌟 Características

- ✅ Diseño responsive y moderno
- ✅ Catálogo de productos con filtros y ordenación
- ✅ Sistema de carrito de compras con persistencia
- ✅ Compras puntuales y suscripciones recurrentes
- ✅ Integración con Stripe para pagos
- ✅ Múltiples frecuencias de suscripción (semanal, quincenal, mensual)
- ✅ Descuentos automáticos por suscripción
- ✅ Animaciones suaves con Framer Motion

## 🛠️ Stack Tecnológico

- **React** 19.1.0
- **Vite** 6.3.5
- **React Router DOM** 7.x
- **Tailwind CSS** 3.x
- **Framer Motion** 11.x
- **Stripe.js** - Pagos seguros
- **Lucide React** - Iconos

## 📋 Requisitos Previos

- Node.js 18+ o superior
- pnpm (recomendado) o npm
- Cuenta de Stripe (para pagos)
- Backend API corriendo (ver repositorio del backend)

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/mikels-earth-frontend.git
cd mikels-earth-frontend
```

2. Instala las dependencias:
```bash
pnpm install
# o
npm install
```

3. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publicable_de_stripe
VITE_API_URL=http://localhost:5001
```

5. Inicia el servidor de desarrollo:
```bash
pnpm dev
# o
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción

```bash
pnpm build
# o
npm run build
```

Los archivos compilados estarán en el directorio `dist/`

Para previsualizar el build:
```bash
pnpm preview
# o
npm run preview
```

## 🌐 Despliegue en Vercel

### Opción 1: Desde la interfaz de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno:
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_API_URL`
5. Haz clic en "Deploy"

### Opción 2: Desde la línea de comandos

1. Instala Vercel CLI:
```bash
npm install -g vercel
```

2. Inicia sesión:
```bash
vercel login
```

3. Despliega:
```bash
vercel
```

4. Para producción:
```bash
vercel --prod
```

### Configuración de Variables de Entorno en Vercel

En el dashboard de Vercel:
1. Ve a tu proyecto → Settings → Environment Variables
2. Añade:
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Tu clave publicable de Stripe
   - `VITE_API_URL`: URL de tu backend en producción

## 📁 Estructura del Proyecto

```
mikels-earth/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── layout/       # Header, Footer
│   │   ├── common/       # Componentes reutilizables
│   │   ├── products/     # Componentes de productos
│   │   └── cart/         # Carrito de compras
│   ├── context/          # React Context (CartContext)
│   ├── data/             # Datos mock de productos
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderSuccess.jsx
│   │   └── SubscriptionSuccess.jsx
│   ├── App.jsx           # Componente principal con rutas
│   ├── App.css           # Estilos globales
│   └── main.jsx          # Punto de entrada
├── .env.example          # Ejemplo de variables de entorno
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Personalización

### Colores

Los colores principales están definidos en `src/App.css`:

```css
:root {
  --color-primary: #3A3226;      /* Marrón oscuro */
  --color-secondary: #F4C2C2;    /* Rosa pastel */
  --color-accent: #E8F3D6;       /* Amarillo verdoso */
}
```

### Productos

Los productos están definidos en `src/data/products.js`. Para añadir o modificar productos, edita este archivo.

## 🔗 Integración con Backend

Este frontend se conecta con el backend Flask para:
- Crear sesiones de checkout de Stripe
- Procesar pagos y suscripciones
- Obtener estado de pedidos

Asegúrate de que el backend esté corriendo y la variable `VITE_API_URL` apunte a la URL correcta.

**Repositorio del backend**: [mikels-earth-backend](https://github.com/tu-usuario/mikels-earth-backend)

## 🧪 Testing

Para ejecutar tests (cuando estén implementados):
```bash
pnpm test
# o
npm test
```

## 📝 Tareas Pendientes

- [ ] Añadir tests unitarios y de integración
- [ ] Implementar SSR para mejor SEO
- [ ] Optimizar imágenes de productos
- [ ] Añadir sistema de búsqueda
- [ ] Implementar filtros avanzados
- [ ] Añadir reviews de productos
- [ ] Integrar con CMS para gestión de contenido

## 🐛 Problemas Conocidos

- Las imágenes de productos son placeholders (pendiente de fotos reales)
- El costo de envío está hardcodeado a 0€
- No hay validación de stock en tiempo real

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Mikel's Earth.

## 📧 Contacto

**Mikel's Earth**
- Web: https://mikels.es
- Email: info@mikels.es

## 🙏 Agradecimientos

- Diseño basado en el sitio original de Mikel's Earth
- Iconos por [Lucide](https://lucide.dev/)
- Animaciones por [Framer Motion](https://www.framer.com/motion/)

---

**Desarrollado con ❤️ para Mikel's Earth**

