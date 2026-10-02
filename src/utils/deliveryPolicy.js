export const BALEARES_MINIMUM_ORDER = 59;

const EXCLUDED_SPANISH_PREFIXES = ['35', '38', '51', '52'];

const normalizeText = (value) => String(value || '')
  .trim()
  .toLocaleLowerCase('es-ES')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export const normalizeDestinationCountry = (value) => {
  const country = normalizeText(value);
  if (['espana', 'spain', 'es'].includes(country)) return 'ES';
  if (['portugal', 'pt'].includes(country)) return 'PT';
  return null;
};

export const normalizePostalCode = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export const deliveryEligibility = ({ country, postalCode, orderTotal }) => {
  const countryCode = normalizeDestinationCountry(country);
  if (!countryCode) {
    return {
      eligible: false,
      code: 'DESTINATION_NOT_SERVED',
      message: 'Solo enviamos a España (península y Baleares) y Portugal.',
    };
  }

  const postal = normalizePostalCode(postalCode);
  if (countryCode === 'ES' && EXCLUDED_SPANISH_PREFIXES.some((prefix) => postal.startsWith(prefix))) {
    return {
      eligible: false,
      code: 'DESTINATION_NOT_SERVED',
      message: 'No enviamos a Canarias, Ceuta ni Melilla.',
    };
  }

  if (countryCode === 'ES' && postal.startsWith('07') && Number(orderTotal) < BALEARES_MINIMUM_ORDER) {
    return {
      eligible: false,
      code: 'BALEARES_MINIMUM_ORDER',
      message: 'En Baleares el pedido mínimo es de 59,00 €.',
    };
  }

  return { eligible: true, countryCode };
};
