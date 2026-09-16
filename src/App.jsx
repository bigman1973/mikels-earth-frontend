import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartProvider, useCart } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SeoManager from './components/SeoManager';
import './App.css';

const CartDrawer = lazy(() => import('./components/cart/CartDrawer'));
const FloatingNewsletterButton = lazy(() => import('./components/FloatingNewsletterButton'));
const NewsletterPopup = lazy(() => import('./components/NewsletterPopup'));

const Home = lazy(() => import('./pages/Home'));
const LaFamilia = lazy(() => import('./pages/LaFamilia'));
const NuestraTierra = lazy(() => import('./pages/NuestraTierra'));
const ElObrador = lazy(() => import('./pages/ElObrador'));
const NuestrasJoyas = lazy(() => import('./pages/NuestrasJoyas'));
const Experiencias = lazy(() => import('./pages/Experiencias'));
const Recetario = lazy(() => import('./pages/Recetario'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogAdmin = lazy(() => import('./pages/BlogAdmin'));
const Contact = lazy(() => import('./pages/Contact'));
const Horeca = lazy(() => import('./pages/Horeca'));
const Opiniones = lazy(() => import('./pages/Opiniones'));
const RecoverCart = lazy(() => import('./pages/RecoverCart'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminStock = lazy(() => import('./pages/admin/AdminStock'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminClientDetail = lazy(() => import('./pages/admin/AdminClientDetail'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));

const RouteFallback = () => (
  <div className="min-h-[45vh]" role="status" aria-live="polite">
    <span className="sr-only">Cargando…</span>
  </div>
);

const DeferredCartDrawer = () => {
  const { isCartOpen } = useCart();
  const [hasOpened, setHasOpened] = useState(isCartOpen);

  useEffect(() => {
    if (isCartOpen) setHasOpened(true);
  }, [isCartOpen]);

  if (!hasOpened) return null;

  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
};

const DeferredMarketingWidgets = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => setIsReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(() => setIsReady(true), 1500);
    return () => window.clearTimeout(timerId);
  }, []);

  if (!isReady) return null;

  return (
    <Suspense fallback={null}>
      <FloatingNewsletterButton />
    </Suspense>
  );
};

function App() {
  const { i18n } = useTranslation();
  const activeLanguage = (i18n.resolvedLanguage || i18n.language || 'es').split('-')[0];
  const documentLanguage = activeLanguage === 'en' ? 'en' : 'es';

  useEffect(() => {
    document.documentElement.lang = documentLanguage;
  }, [documentLanguage]);

  return (
    <Router>
      <CartProvider>
        <AdminAuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* ====== ADMIN PANEL (sin Header/Footer) ====== */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/productos" element={<AdminProducts />} />
              <Route path="/admin/stock" element={<AdminStock />} />
              <Route path="/admin/pedidos" element={<AdminOrders />} />
              <Route path="/admin/clientes" element={<AdminClients />} />
              <Route path="/admin/clientes/:clientId" element={<AdminClientDetail />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/cupones" element={<AdminCoupons />} />

              {/* ====== TIENDA PÚBLICA (con Header/Footer) ====== */}
              <Route path="/*" element={
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/la-familia" element={<LaFamilia />} />
                      <Route path="/nuestra-tierra" element={<NuestraTierra />} />
                      <Route path="/el-obrador" element={<ElObrador />} />
                      <Route path="/nuestras-joyas" element={<NuestrasJoyas />} />
                      <Route path="/experiencias" element={<Experiencias />} />
                      <Route path="/recetario" element={<Recetario />} />
                      <Route path="/tienda" element={<Products />} />
                      <Route path="/productos" element={<Navigate to="/tienda" replace />} />
                      <Route path="/producto/:slug" element={<ProductDetail />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/admin/blog" element={<BlogAdmin />} />
                      <Route path="/contacto" element={<Contact />} />
                      <Route path="/horeca" element={<Horeca />} />
                      <Route path="/opiniones" element={<Opiniones />} />
                      <Route path="/recuperar-carrito/:token" element={<RecoverCart />} />
                      <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                      <Route path="/terminos" element={<Terms />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <SeoManager />
                  <Footer />
                  <Suspense fallback={null}>
                    <NewsletterPopup />
                  </Suspense>
                  <DeferredCartDrawer />
                  <DeferredMarketingWidgets />
                </div>
              } />
            </Routes>
          </Suspense>
        </AdminAuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
