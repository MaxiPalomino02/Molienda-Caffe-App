import { useState } from 'react';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

/**
 * Muestra la foto real (/products/<nombre>.jpg) si existe.
 * Si no está, usa la ilustración (/products/<nombre>.svg).
 */
function ProductImage({ src, alt, className }: ProductImageProps) {
  const fallback = src ?? '/favicon.svg';
  const photo = fallback.replace(/\.svg$/, '.jpg');
  const [current, setCurrent] = useState(photo);

  return (
    <img
      className={className}
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => setCurrent(fallback)}
    />
  );
}

export default ProductImage;
