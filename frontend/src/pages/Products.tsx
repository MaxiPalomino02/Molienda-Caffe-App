import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ApiError, getProducts } from '../services/api';
import type { Category, Product } from '../types';

const validCategories: Category[] = ['granos', 'molinillos', 'tazas', 'accesorios'];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const isValidCategory = (cat: string | null): cat is Category => {
    if (!cat) return false;
    return validCategories.includes(cat as Category);
  };

  const category = isValidCategory(categoryParam) ? categoryParam : undefined;
  const activeCategory = category ?? null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getProducts(category, controller.signal)
      .then((data) => {
        setProducts(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudieron cargar los productos. Intentá de nuevo.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [category]);

  const setCategory = (cat: Category | null) => {
    if (cat === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">Productos</h1>
      <div className="filters">
        <button
          className={`filters__button${activeCategory === null ? ' filters__button--active' : ''}`}
          onClick={() => setCategory(null)}
          disabled={!categoryParam || !isValidCategory(categoryParam)}
        >
          Todas
        </button>{' '}
        <button
          className={`filters__button${activeCategory === 'granos' ? ' filters__button--active' : ''}`}
          onClick={() => setCategory('granos')}
          disabled={categoryParam === 'granos'}
        >
          granos
        </button>{' '}
        <button
          className={`filters__button${activeCategory === 'molinillos' ? ' filters__button--active' : ''}`}
          onClick={() => setCategory('molinillos')}
          disabled={categoryParam === 'molinillos'}
        >
          molinillos
        </button>{' '}
        <button
          className={`filters__button${activeCategory === 'tazas' ? ' filters__button--active' : ''}`}
          onClick={() => setCategory('tazas')}
          disabled={categoryParam === 'tazas'}
        >
          tazas
        </button>{' '}
        <button
          className={`filters__button${activeCategory === 'accesorios' ? ' filters__button--active' : ''}`}
          onClick={() => setCategory('accesorios')}
          disabled={categoryParam === 'accesorios'}
        >
          accesorios
        </button>
      </div>
      {loading ? (
        <p className="state-message" role="status">
          Cargando productos...
        </p>
      ) : error ? (
        <p className="state-message state-message--error" role="alert">
          {error}
        </p>
      ) : products.length === 0 ? (
        <p className="state-message">No hay productos en esta categoría</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Products
