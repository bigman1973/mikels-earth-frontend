import { Link } from 'react-router-dom';
import Newsletter from '../common/Newsletter';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12">
        <Newsletter variant="footer" />
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation links */}
          <div>
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Navegación
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/familia" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  La Família
                </Link>
              </li>
              <li>
                <Link to="/productos" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-600 hover:text-primary transition-colors text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Company info */}
          <div>
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Mikel's Earth
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tradición familiar desde 1819. Productos naturales, artesanales y veganos de Lleida.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Contacto
            </h3>
            <address className="text-gray-600 text-sm not-italic space-y-1">
              <p>Mikel's by Farms Planet SL</p>
              <p>Carrer Cardenal Cisneros, 10</p>
              <p>Lérida, España</p>
            </address>
          </div>

          {/* Social media */}
          <div>
            <h3 className="font-bold text-primary mb-4 uppercase tracking-wide text-sm">
              Síguenos
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/mikelsearth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@mikelsearth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>
              Copyright © 2025 Mikel's Earth - Todos los derechos reservados
            </p>
            <div className="flex gap-4">
              <Link to="/politica-privacidad" className="hover:text-primary transition-colors">
                Política de privacidad
              </Link>
              <Link to="/terminos" className="hover:text-primary transition-colors">
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

