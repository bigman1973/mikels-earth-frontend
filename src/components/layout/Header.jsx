import { ShoppingCart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import LanguageSelector from '../common/LanguageSelector';
import logoMikelsFruit from '../../assets/mikels-fruit-logo-bn-1600.png';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartCount, toggleCart } = useCart();
  const { t } = useTranslation();
  const cartCount = getCartCount();
  const links = [
    ['/tienda', 'nav.shop'],
    ['/la-familia', 'nav.family'],
    ['/nuestra-tierra', 'nav.land'],
    ['/como-se-hace', 'nav.workshop'],
    ['/nuestras-joyas', 'nav.jewels'],
    ['/recetario', 'nav.recipes'],
    ['/opiniones', 'nav.reviews'],
    ['/horeca', 'nav.horecaB2B'],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#f5efe4]/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 md:h-18">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Mikel's Fruit">
          <img src={logoMikelsFruit} alt="Mikel's Fruit" className="h-11 w-auto md:h-12" />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto lg:flex" aria-label="Navegación principal">
          {links.map(([to, key]) => (
            <Link key={to} to={to} className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#1a1a1a] transition-colors hover:text-primary">
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector compact className="hidden md:flex" />
          <button type="button" onClick={toggleCart} className="relative rounded-lg p-2 text-[#1a1a1a] hover:bg-white" aria-label="Carrito">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1a1a1a] px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button type="button" className="rounded-lg p-2 text-[#1a1a1a] hover:bg-white lg:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-label="Menú">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-stone-200 bg-[#f5efe4] lg:hidden" aria-label="Navegación móvil">
          <div className="container mx-auto grid grid-cols-2 gap-x-5 gap-y-1 px-4 py-4">
            {links.map(([to, key]) => (
              <Link key={to} to={to} className="py-2 text-sm font-semibold text-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>
                {t(key)}
              </Link>
            ))}
            <div className="col-span-2 border-t border-stone-200 pt-3">
              <LanguageSelector />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
