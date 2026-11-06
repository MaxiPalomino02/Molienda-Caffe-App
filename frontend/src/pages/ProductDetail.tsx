import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { ApiError, getProductById } from '../services/api';
import type { Product } from '../types';

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const productId = Number(id);
  const isValidId = id !== undefined && Number.isInteger(productId);

  useEffect(() => {
    if (!isValidId) {
      setLoading(false);
      setNotFound(true);
      setProduct(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setError(null);

    getProductById(productId, controller.signal)
      .then((data) => {
        setProduct(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('No se pudo cargar el producto. Intentá de nuevo.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [productId, isValidId]);

  if (loading) {
    return (
      <p className="page state-message" role="status">
        Cargando producto...
      </p>
    );
  }

  if (notFound) {
    return (
      <div className="page page--center">
        <h1 className="page__title">Producto no encontrado</h1>
        <Link to="/products" className="button button--secondary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page page--center">
        <p className="state-message state-message--error" role="alert">
          {error}
        </p>
        <Link to="/products" className="button button--secondary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <p className="page state-message" role="status">
        Cargando producto...
      </p>
    );
  }

  const max = product.stock;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (Number.isNaN(val)) return;
    if (val < 1) setQuantity(1);
    else if (val > max) setQuantity(max);
    else setQuantity(val);
  };

  const handleAdd = () => {
    if (max === 0) return;
    const qty = Math.max(1, Math.min(quantity, max));
    addToCart(product, qty);
  };

  return (
    <div className="page">
      <Link to="/products" className="detail__back">
        Volver al catálogo
      </Link>
      <article className="detail-card">
        <ProductImage
          className="detail-card__image"
          src={product.image}
          alt={product.name}
        />
        <p className="detail-card__category">{product.category}</p>
        <h1 className="detail-card__title">{product.name}</h1>
        <p className="detail-card__price">
          ${product.price.toLocaleString('es-AR')}
        </p>
        <p className="detail-card__description">{product.description}</p>
        <p className="detail-card__stock">Stock disponible: {product.stock}</p>
        <div className="detail-card__actions">
          <input
            className="quantity-input"
            type="number"
            min={1}
            max={max}
            value={quantity}
            onChange={handleChange}
            disabled={max === 0}
            aria-label="Cantidad"
          />
          <button
            className="button button--primary"
            onClick={handleAdd}
            disabled={max === 0}
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    </div>
  );
}

export default ProductDetail
