export const TEMPRANO_SLUG = 'aceite-temprano-sin-filtrar';

export const isReservationSale = (product = {}) => (
  product.slug !== TEMPRANO_SLUG
  && (product.reservationOnly === true || product.reservation_only === true)
);

export const normalizeReservationSaleProduct = (product = {}) => {
  if (product.slug !== TEMPRANO_SLUG) return product;

  return {
    ...product,
    name: typeof product.name === 'string'
      ? product.name.replace(/\s*—\s*Reserva\b/i, '').trim()
      : product.name,
    reservationOnly: false,
    reservation_only: false,
    reservationMessage: '',
  };
};
