// API URL desde variables de entorno de Vercel
const API_URL = import.meta.env.VITE_API_URL || 'https://mikels-earth-backend-production.up.railway.app';

const serializeCartItem = (item) => ({
  product_id: item.id,
  sku: item.sku || null,
  slug: item.slug,
  quantity: item.quantity,
  purchase_type: item.purchaseType || 'one-time',
});

/**
 * Obtener una cotización vigente sin crear objetos de Stripe.
 */
export const getCheckoutQuote = async (cartItems, customerInfo) => {
  const response = await fetch(`${API_URL}/api/stripe/quote`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      items: cartItems.map(serializeCartItem),
      customer_info: {
        email: customerInfo.email,
      },
      discount_code: customerInfo.discountCode,
      locale: customerInfo.locale || 'es',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'No se pudo confirmar el precio actual.');
    error.code = data.error;
    throw error;
  }
  return data;
};

/**
 * Crear sesión de checkout para compra única
 */
export const createCheckoutSession = async (cartItems, customerInfo) => {
  try {
    const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Checkout-Pricing-Version': '2',
      },
      body: JSON.stringify({
        items: cartItems.map(serializeCartItem),
        customer_info: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country || 'España',
          notes: customerInfo.notes
        },
        discount_code: customerInfo.discountCode,
        discount_amount: customerInfo.discountAmount,
        needs_invoice: customerInfo.needsInvoice,
        invoice_data: customerInfo.invoiceData,
        locale: customerInfo.locale || 'es'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error === 'PRICE_MISMATCH') {
        // Precios desactualizados - lanzar error especial con los datos de actualización
        const err = new Error(errorData.message || 'Los precios han cambiado');
        err.code = 'PRICE_MISMATCH';
        err.priceUpdates = errorData.price_updates;
        throw err;
      }
      throw new Error(errorData.error || 'Error al crear la sesión de pago');
    }

    const { url, order_number } = await response.json();
    
    // Redirigir a Stripe Checkout usando la URL directa
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No se recibió URL de checkout');
    }

    return { order_number };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Crear sesión de checkout para suscripción
 */
export const createSubscriptionCheckout = async (item, customerInfo) => {
  try {
    const response = await fetch(`${API_URL}/api/stripe/create-subscription-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: {
          product_id: item.id,
          sku: item.sku || null,
          slug: item.slug,
          quantity: item.quantity,
          subscription_frequency: item.subscriptionFrequency
        },
        customer_info: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country || 'España'
        },
        locale: customerInfo.locale || 'es'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la suscripción');
    }

    const { url, subscription_number } = await response.json();
    
    // Redirigir a Stripe Checkout usando la URL directa
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No se recibió URL de checkout');
    }

    return { subscription_number };
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
};

/**
 * Obtener el estado de una sesión de checkout
 */
export const getSessionStatus = async (sessionId) => {
  try {
    const response = await fetch(`${API_URL}/api/stripe/session-status/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener el estado de la sesión');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
};

