import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
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
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <Router>
      <CartProvider>
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
              <Route path="/producto/:slug" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contacto" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;

