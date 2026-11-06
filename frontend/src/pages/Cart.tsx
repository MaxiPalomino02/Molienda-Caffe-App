import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ApiError, createOrder } from '../services/api';
import type { OrderResponse } from '../types';

type CheckoutStatus = 'idle' | 'loading' | 'success' | 'error';

function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [status, setStatus] = useState<CheckoutStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);

  const isLoading = status === 'loading';

  const clearError = () => {
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage(null);
    }
  };

  const handleCheckout = async () => {
    if (isLoading || items.length === 0) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await createOrder(
        items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      );
      setOrder(response);
      setStatus('success');
      clearCart();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'No se pudo enviar el pedido. Intentá de nuevo.',
      );
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    clearError();
    updateQuantity(productId, quantity);
  };

  const handleRemoveFromCart = (productId: number) => {
    clearError();
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearError();
    clearCart();
  };

  return (
    <div className="page">
      <h1 className="page__title">Carrito</h1>
      {status === 'success' && order && (
        <div className="banner banner--success" role="status">
          <p>
            Pedido #{order.id} confirmado. Total: $
            {order.total.toLocaleString('es-AR')}
          </p>
          <Link to="/products">Volver al catálogo</Link>
        </div>
      )}
      {status === 'error' && errorMessage && (
        <div className="banner banner--error" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}
      {items.length === 0 ? (
        status === 'success' ? null : (
          <div className="cart-empty">
            <p>Tu carrito está vacío.</p>
            <Link to="/products" className="button button--secondary">
              Ver productos
            </Link>
          </div>
        )
      ) : (
        <div className="cart">
          <div className="cart__items">
            {items.map((item) => (
              <article className="cart-item" key={item.product.id}>
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.product.name}</h3>
                  <p className="cart-item__unit">
                    Precio unitario: $
                    {item.product.price.toLocaleString('es-AR')}
                  </p>
                </div>
                <div className="cart-item__controls">
                  <p className="cart-item__quantity">
                    Cantidad:
                    <button
                      className="quantity-button"
                      onClick={() =>
                        handleUpdateQuantity(item.product.id, item.quantity - 1)
                      }
                      disabled={isLoading}
                      aria-label="Restar una unidad"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="quantity-button"
                      onClick={() =>
                        handleUpdateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={isLoading || item.quantity >= item.product.stock}
                      aria-label="Sumar una unidad"
                    >
                      +
                    </button>
                  </p>
                  <p className="cart-item__subtotal">
                    Subtotal: $
                    {(item.product.price * item.quantity).toLocaleString('es-AR')}
                  </p>
                  <button
                    className="button button--ghost button--sm"
                    onClick={() => handleRemoveFromCart(item.product.id)}
                    disabled={isLoading}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
          <aside className="cart__summary">
            <p className="cart__count">Total de unidades: {totalItems}</p>
            <p className="cart__total">
              Total a pagar
              <span className="cart__total-value">
                ${totalPrice.toLocaleString('es-AR')}
              </span>
            </p>
            <div className="cart__actions">
              <button
                className="button button--secondary button--block"
                onClick={handleClearCart}
                disabled={isLoading}
              >
                Vaciar carrito
              </button>
              <button
                className="button button--primary button--block"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando pedido...' : 'Finalizar pedido'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart
