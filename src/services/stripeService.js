import { loadStripe } from '@stripe/stripe-js';

// Cargar Stripe con la clave pública desde variables de entorno
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

// API URL desde variables de entorno de Vercel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API_URL configured:', API_URL); // Debug log

/**
 * Crear sesión de checkout para compra única
 */
export const createCheckoutSession = async (cartItems, customerInfo) => {
  try {
    const response = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.finalPrice || item.price,
          quantity: item.quantity,
          weight: item.weight
        })),
        customer_info: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postal_code: customerInfo.postalCode,
          country: customerInfo.country || 'España',
          notes: customerInfo.notes
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la sesión de pago');
    }

    const { sessionId, url, order_number } = await response.json();
    
    // Redirigir a Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new Error(error.message);
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
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.finalPrice || item.price,
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
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la suscripción');
    }

    const { sessionId, url, subscription_number } = await response.json();
    
    // Redirigir a Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new Error(error.message);
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

