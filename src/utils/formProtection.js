// Optional phone: nine Spanish digits and international +/00 remain valid.
export const getPhoneValidationMessage = (phone = '') => {
  const compact = phone.trim().replace(/[\s().-]/g, '');
  if (/^\d{10}$/.test(compact) && !compact.startsWith('00')) {
    return 'Si tu teléfono tiene diez dígitos, incluye el prefijo internacional (+ o 00).';
  }
  return '';
};
