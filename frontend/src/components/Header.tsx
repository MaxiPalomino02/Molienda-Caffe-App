import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Logo from './Logo';

function Header() {
  const { totalItems } = useCart();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="header-brand" aria-label="Molienda Café, inicio"><Logo className="logo--sm" /></Link>
        <nav className="site-nav" aria-label="Navegación principal">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'}>Inicio</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'site-nav__link site-nav__link--active' : 'site-nav__link'}>La tienda</NavLink>
        </nav>
        <Link to="/cart" className="header-cart"><span className="header-cart__icon">↗</span><span>Mi carrito</span><span className="site-nav__badge">{totalItems}</span></Link>
      </div>
    </header>
  );
}
export default Header;
