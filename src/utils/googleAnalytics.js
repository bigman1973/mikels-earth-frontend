const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

const COOKIEBOT_EVENTS = [
  'CookiebotOnConsentReady',
  'CookiebotOnAccept',
  'CookiebotOnDecline',
];

const hasWindow = () => typeof window !== 'undefined';

// Statistics must be a deliberate Cookiebot choice. An implied regional state
// never loads Google Analytics or sends an ecommerce event.
export const hasStatisticsConsent = () => Boolean(
  hasWindow()
  && window.Cookiebot?.consent?.method === 'explicit'
  && window.Cookiebot?.consent?.statistics === true,
);

export const isGA4Configured = () => Boolean(MEASUREMENT_ID);

export const isGA4TrackingEnabled = () => (
  isGA4Configured() && hasStatisticsConsent() && typeof window.gtag === 'function'
);

const analyticsBootstrapped = () => Boolean(hasWindow() && window.__mikelsGa4Bootstrapped);

const markAnalyticsBootstrapped = () => {
  window.__mikelsGa4Bootstrapped = true;
};

const installGoogleTag = () => {
  if (!hasWindow() || typeof window.gtag === 'function') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);

  const script = window.document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  script.dataset.mikelsGa4 = 'true';
  window.document.head.appendChild(script);
};

export const syncGA4Consent = () => {
  if (!hasWindow() || !isGA4Configured()) return false;

  if (!hasStatisticsConsent()) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    return false;
  }

  if (analyticsBootstrapped()) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return true;
  }

  installGoogleTag();
  window.gtag('consent', 'default', { analytics_storage: 'denied' });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);
  markAnalyticsBootstrapped();
  return true;
};

export const registerGA4ConsentListeners = () => {
  if (!hasWindow() || !isGA4Configured()) return () => {};

  const sync = () => syncGA4Consent();
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

export const productToGA4Item = (product, quantity = 1, price = product?.price) => {
  const itemId = String(product?.sku || '').trim();
  if (!itemId) return null;

  return {
    item_id: itemId,
    item_name: String(product?.name || 'Producto'),
    item_brand: "Mikel's Fruit",
    item_category: String(product?.category || ''),
    price: numericValue(price),
    quantity: Math.max(1, Number(quantity) || 1),
  };
};

export const cartToGA4Items = (items = [], priceForItem = (item) => item?.price) => (
  items
    .map((item) => productToGA4Item(item, item?.quantity, priceForItem(item)))
    .filter(Boolean)
);

const track = (eventName, parameters) => {
  if (!isGA4TrackingEnabled()) return false;
  window.gtag('event', eventName, parameters);
  return true;
};

export const trackGA4ViewItem = (product) => {
  const item = productToGA4Item(product);
  if (!item) return false;

  return track('view_item', {
    currency: 'EUR',
    value: item.price,
    items: [item],
  });
};

export const trackGA4AddToCart = (product, quantity) => {
  const item = productToGA4Item(product, quantity);
  if (!item) return false;

  return track('add_to_cart', {
    currency: 'EUR',
    value: numericValue(item.price * item.quantity),
    items: [item],
  });
};

export const trackGA4BeginCheckout = (items, value, priceForItem) => {
  const gaItems = cartToGA4Items(items, priceForItem);
  if (!gaItems.length) return false;

  return track('begin_checkout', {
    currency: 'EUR',
    value: numericValue(value),
    items: gaItems,
  });
};

export const trackGA4Purchase = (receipt) => {
  const transactionId = String(receipt?.order_number || '').trim();
  if (!transactionId) return false;

  const items = (receipt?.lines || [])
    .map((line) => {
      const quantity = Math.max(1, Number(line?.quantity) || 1);
      return productToGA4Item(
        { sku: line?.sku, name: line?.name },
        quantity,
        Number(line?.amount || 0) / quantity,
      );
    })
    .filter(Boolean);

  if (!items.length) return false;

  const storageKey = `mikels:ga4-purchase:${transactionId}`;
  if (window.sessionStorage.getItem(storageKey)) return false;

  const tracked = track('purchase', {
    transaction_id: transactionId,
    currency: 'EUR',
    value: numericValue(receipt?.totals?.total),
    shipping: numericValue(receipt?.totals?.shipping),
    items,
  });

  if (tracked) window.sessionStorage.setItem(storageKey, '1');
  return tracked;
};
