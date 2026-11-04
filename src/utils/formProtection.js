// Keep the delivery address intact; Gmail alias canonicalization belongs on the server.
export const normalizeFormEmail = (email) => email.trim().toLowerCase();

export const getPhoneValidationMessage = (phone = '') => {
  const compact = phone.trim().replace(/[\s().-]/g, '');
  if (/^\d{10}$/.test(compact) && !compact.startsWith('00')) {
    return 'Si tu teléfono tiene diez dígitos, incluye el prefijo internacional (+ o 00).';
  }
  return '';
};

export const getRateLimitMessage = (retryAfter, now = Date.now()) => {
  const value = (retryAfter || '').trim();
  const seconds = /^\d+$/.test(value)
    ? Number(value)
    : (Date.parse(value) - now) / 1000;
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 'Has enviado demasiadas solicitudes. Espera un poco antes de volver a enviar el formulario.';
  }
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `Has enviado demasiadas solicitudes. Espera ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} antes de volver a enviar el formulario.`;
};
