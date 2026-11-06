import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ApiError, getProducts } from '../services/api';
import type { Product } from '../types';

const categories = [
  { id: 'granos', title: 'Café en grano', detail: 'Orígenes y blends', icon: '☕' },
  { id: 'molinillos', title: 'Molinillos', detail: 'La molienda perfecta', icon: '⚙' },
  { id: 'tazas', title: 'Tazas', detail: 'Tu ritual, tu momento', icon: '▱' },
  { id: 'accesorios', title: 'Accesorios', detail: 'Todo para preparar', icon: '✳' },
] as const;

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(undefined, controller.signal)
      .then((data) => setProducts(data.slice(0, 4)))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setProducts([]);
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudieron cargar los productos. Intentá nuevamente.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero__copy">
          <span className="eyebrow"><span className="eyebrow__line" /> CAFÉ DE ESPECIALIDAD · BUENOS MOMENTOS</span>
          <h1>El café sabe mejor cuando <em>te tomás tu tiempo.</em></h1>
          <p>Descubrí granos seleccionados, accesorios y todo lo que necesitás para preparar una taza extraordinaria en casa.</p>
          <div className="home-hero__actions">
            <Link to="/products" className="button button--primary button--lg">Explorar tienda <span aria-hidden="true">↗</span></Link>
            <a href="#nuestra-esencia" className="text-link">Conocé Molienda <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span className="hero-note__stars">✳ ✳ ✳</span><span>Pequeños rituales. Grandes momentos.</span></div>
        </div>
        <div className="home-hero__visual" aria-label="Café de especialidad">
          <div className="hero-orbit hero-orbit--one" />
          <div className="hero-orbit hero-orbit--two" />
          <div className="hero-photo-wrap">
            <img src="/products/brasil-cerrado.jpg" alt="Café de especialidad Brasil Cerrado" />
          </div>
          <div className="hero-stamp"><span>ORIGEN</span><strong>100%</strong><span>SELECCIONADO</span></div>
          <div className="hero-caption"><span className="hero-caption__dot" /> Una pausa que vale la pena</div>
        </div>
        <div className="hero-index">01 <span /> 04</div>
      </section>

      <section className="trust-strip" aria-label="Nuestra propuesta">
        <div><span>✳</span><p><strong>Granos seleccionados</strong><small>Calidad en cada origen</small></p></div>
        <div><span>◷</span><p><strong>Tu ritual, a tu manera</strong><small>Todo para preparar en casa</small></p></div>
        <div><span>♡</span><p><strong>Hecho para disfrutar</strong><small>Una taza a la vez</small></p></div>
      </section>

      <section className="home-section home-categories" id="nuestra-esencia">
        <div className="section-heading">
          <div><span className="eyebrow">ENCONTRÁ TU FAVORITO</span><h2>Un mundo de café, <em>a tu alcance.</em></h2></div>
          <Link to="/products" className="text-link">Ver toda la tienda <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <Link key={category.id} to={`/products?category=${category.id}`} className={`category-tile category-tile--${index + 1}`}>
              <span className="category-tile__number">0{index + 1}</span>
              <span className="category-tile__icon" aria-hidden="true">{category.icon}</span>
              <span className="category-tile__content"><strong>{category.title}</strong><small>{category.detail}</small></span>
              <span className="category-tile__arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section featured-section">
        <div className="section-heading">
          <div><span className="eyebrow">UNA BUENA ELECCIÓN</span><h2>Para empezar <em>por algo rico.</em></h2></div>
          <Link to="/products" className="text-link">Descubrir productos <span aria-hidden="true">↗</span></Link>
        </div>
        {loading ? <p className="state-message">Preparando la selección...</p> : products.length ? (
          <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : error ? (
          <div className="featured-empty" role="alert">
            <span aria-hidden="true">⚠</span>
            <p>{error}</p>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="featured-empty"><span>☕</span><p>Pronto vas a encontrar acá nuestra selección destacada.</p><Link to="/products" className="text-link">Explorar catálogo ↗</Link></div>
        )}
      </section>

      <section className="story-banner">
        <div className="story-banner__mark">M.</div>
        <div><span className="eyebrow">EL PLACER DE HACER UNA PAUSA</span><h2>No es solo café.<br /><em>Es tu momento.</em></h2><p>Elegí tus favoritos, prepará tu taza y hacé espacio para disfrutar.</p></div>
        <Link to="/products" className="button button--light">Encontrá tu próximo café <span>↗</span></Link>
      </section>
    </div>
  );
}

export default Home;
