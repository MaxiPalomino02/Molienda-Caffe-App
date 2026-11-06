import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import ProductImage from './ProductImage';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <article className="product-card">
      <Link
        className="product-card__image-link"
        to={'/products/' + product.id}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage
          className="product-card__image"
          src={product.image}
          alt={product.name}
        />
      </Link>
      <div className="product-card__meta">
        <span className="product-card__category">{product.category}</span>
        <span className="product-card__stock">Stock: {product.stock}</span>
      </div>
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__description">{product.description}</p>
      <div className="product-card__footer">
        <span className="product-card__price">
          ${product.price.toLocaleString('es-AR')}
        </span>
        <button
          className="button button--primary button--sm"
          onClick={() => addToCart(product, 1)}
          disabled={product.stock === 0}
        >
          Agregar al carrito
        </button>
      </div>
      <Link className="product-card__link" to={'/products/' + product.id}>
        Ver detalle
      </Link>
    </article>
  );
}

export default ProductCard;
