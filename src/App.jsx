import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import FloatingNewsletterButton from './components/FloatingNewsletterButton';
import NewsletterPopup from './components/NewsletterPopup';
import Home from './pages/Home';
import LaFamilia from './pages/LaFamilia';
import NuestraTierra from './pages/NuestraTierra';
import ElObrador from './pages/ElObrador';
import NuestrasJoyas from './pages/NuestrasJoyas';
import Experiencias from './pages/Experiencias';
import Recetario from './pages/Recetario';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BlogAdmin from './pages/BlogAdmin';
import Contact from './pages/Contact';
import Horeca from './pages/Horeca';
import Opiniones from './pages/Opiniones';
import RecoverCart from './pages/RecoverCart';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
// Admin Panel
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminStock from './pages/admin/AdminStock';
import AdminOrders from './pages/admin/AdminOrders';
import AdminClients from './pages/admin/AdminClients';
import AdminClientDetail from './pages/admin/AdminClientDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import './App.css';

function App() {
  return (
    <Router>
      <CartProvider>
        <AdminAuthProvider>
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
                  </Routes>
                </main>
                <Footer />
                <CartDrawer />
                <FloatingNewsletterButton />
                <NewsletterPopup />
              </div>
            } />
          </Routes>
        </AdminAuthProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
