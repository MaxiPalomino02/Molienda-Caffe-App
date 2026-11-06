import { Link } from 'react-router-dom';
import Logo from './Logo';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link to="/" aria-label="Molienda Café, inicio"><Logo className="logo--sm" /></Link>
        <p>Un buen café transforma cualquier momento.</p>
        <span>Molienda Café — 2026</span>
      </div>
    </footer>
  );
}
export default Footer;
