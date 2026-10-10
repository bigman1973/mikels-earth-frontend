// A Meta Pixel ID is public by design: it is present in every visitor's
// browser request. The Vercel variable can override this documented data-set
// ID, while the fallback prevents a configuration UI issue from silently
// disabling consented measurement in production.
const PIXEL_ID = String(import.meta.env.VITE_META_PIXEL_ID || '25782978224669556').trim();

const COOKIEBOT_EVENTS = [
  'CookiebotOnConsentReady',
  'CookiebotOnAccept',
  'CookiebotOnDecline',
];

const hasWindow = () => typeof window !== 'undefined';

// Cookiebot can be configured in an implied-consent mode for some regions.
// Meta must never be activated in that mode: this storefront requires the
// visitor's affirmative, explicit marketing choice before any Meta request.
export const hasMarketingConsent = () => Boolean(
  hasWindow()
  && window.Cookiebot?.consent?.method === 'explicit'
  && window.Cookiebot?.consent?.marketing === true,
);

export const isMetaPixelConfigured = () => Boolean(PIXEL_ID);

export const isMetaTrackingEnabled = () => (
  isMetaPixelConfigured() && hasMarketingConsent() && typeof window.fbq === 'function'
);

const installPixelQueue = () => {
  if (!hasWindow() || typeof window.fbq === 'function') return;

  const queue = function metaPixelQueue(...args) {
    queue.callMethod
      ? queue.callMethod(...args)
      : queue.queue.push(args);
  };
  queue.push = queue;
  queue.loaded = false;
  queue.version = '2.0';
  queue.queue = [];

  window.fbq = queue;
  window._fbq = queue;

  const script = window.document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.dataset.mikelsMetaPixel = 'true';
  window.document.head.appendChild(script);
};

const pixelBootstrapped = () => Boolean(hasWindow() && window.__mikelsMetaPixelBootstrapped);

const markPixelBootstrapped = () => {
  window.__mikelsMetaPixelBootstrapped = true;
};

export const syncMetaPixelConsent = () => {
  if (!hasWindow() || !isMetaPixelConfigured()) return false;

  if (!hasMarketingConsent()) {
    if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
    return false;
  }

  if (pixelBootstrapped()) {
    window.fbq('consent', 'grant');
    return true;
  }

  installPixelQueue();
  // Meta requires the revocation to precede init. Cookiebot's marketing state
  // has already been positively resolved before consent is granted below.
  window.fbq('consent', 'revoke');
  window.fbq('init', PIXEL_ID);
  window.fbq('consent', 'grant');
  markPixelBootstrapped();
  return true;
};

export const registerMetaConsentListeners = () => {
  if (!hasWindow() || !isMetaPixelConfigured()) return () => {};

  const sync = () => syncMetaPixelConsent();
  COOKIEBOT_EVENTS.forEach((eventName) => window.addEventListener(eventName, sync));
  sync();

  return () => {
    COOKIEBOT_EVENTS.forEach((eventName) => window.removeEventListener(eventName, sync));
  };
};

const numericValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0;
};

export const productToMetaContent = (product, quantity = 1, price = product?.price) => {
  const sku = String(product?.sku || '').trim();
  if (!sku) return null;

  return {
    id: sku,
    quantity: Math.max(1, Number(quantity) || 1),
    item_price: numericValue(price),
  };
};

export const cartToMetaContents = (items = [], priceForItem = (item) => item?.price) => (
  items
    .map((item) => productToMetaContent(item, item?.quantity, priceForItem(item)))
    .filter(Boolean)
);

const track = (eventName, parameters, options) => {
  if (!isMetaTrackingEnabled()) return false;
  window.fbq('track', eventName, parameters, options);
  return true;
};

export const trackMetaPageView = () => track('PageView');

export const trackMetaViewContent = (product) => {
  const content = productToMetaContent(product, 1, product?.price);
  if (!content) return false;

  return track('ViewContent', {
    content_ids: [content.id],
    content_type: 'product',
    contents: [content],
    value: content.item_price,
    currency: 'EUR',
  });
};

export const trackMetaAddToCart = (product, quantity) => {
  const content = productToMetaContent(product, quantity, product?.price);
  if (!content) return false;

  return track('AddToCart', {
    content_ids: [content.id],
    content_type: 'product',
    contents: [content],
    value: numericValue(content.item_price * content.quantity),
    currency: 'EUR',
  });
};

export const trackMetaInitiateCheckout = (items, value, priceForItem) => {
  const contents = cartToMetaContents(items, priceForItem);
  if (!contents.length) return false;

  return track('InitiateCheckout', {
    content_ids: contents.map((content) => content.id),
    content_type: 'product',
    contents,
    value: numericValue(value),
    currency: 'EUR',
  });
};

export const trackMetaPurchase = (receipt) => {
  const orderNumber = String(receipt?.order_number || '').trim();
  if (!orderNumber) return false;

  const contents = (receipt?.lines || [])
    .map((line) => productToMetaContent(
      { sku: line?.sku },
      line?.quantity,
      Number(line?.amount || 0) / Math.max(1, Number(line?.quantity) || 1),
    ))
    .filter(Boolean);

  if (!contents.length) return false;

  const storageKey = `mikels:meta-purchase:${orderNumber}`;
  if (window.sessionStorage.getItem(storageKey)) return false;

  const tracked = track('Purchase', {
    content_ids: contents.map((content) => content.id),
    content_type: 'product',
    contents,
    value: numericValue(receipt?.totals?.total),
    currency: 'EUR',
  }, { eventID: orderNumber });

  if (tracked) window.sessionStorage.setItem(storageKey, '1');
  return tracked;
};
