import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Package, CreditCard, Truck, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { createCheckoutSession, createSubscriptionCheckout } from '../services/stripeService';

const Checkout = () => {
  const { cart, getCartTotal, clearCart, getItemPrice, appliedDiscount, getDiscountAmount } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'España',
    notes: ''
  });
  
  const [needsInvoice, setNeedsInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    fiscalName: '',
    nif: '',
    fiscalAddress: '',
    fiscalCity: '',
    fiscalPostalCode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleInvoiceInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'email', 'address', 'city', 'postal_code'];
    for (const field of required) {
      if (!formData[field]) {
        setError(`Por favor, completa el campo: ${field}`);
        return false;
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, introduce un email válido');
      return false;
    }
    
    // Validate invoice data if needed
    if (needsInvoice) {
      const invoiceRequired = ['fiscalName', 'nif'];
      for (const field of invoiceRequired) {
        if (!invoiceData[field]) {
          setError(`Por favor, completa el campo de factura: ${field === 'fiscalName' ? 'Nombre fiscal' : 'NIF/CIF'}`);
          return false;
        }
      }
    }
    
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Separate one-time purchases from subscriptions
      const oneTimePurchases = cart.filter(item => item.purchaseType === 'one-time');
      const subscriptions = cart.filter(item => item.purchaseType === 'subscription');
      
      // Prepare customer info with correct field names
      const customerInfo = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postal_code,
        country: formData.country,
        notes: formData.notes,
        discountCode: appliedDiscount?.code || null,
        discountAmount: appliedDiscount ? getDiscountAmount() : 0,
        needsInvoice: needsInvoice,
        invoiceData: needsInvoice ? invoiceData : null
      };
      
      // Process one-time purchases
      if (oneTimePurchases.length > 0) {
        // Calcular precio final con descuento por volumen
        const itemsWithFinalPrice = oneTimePurchases.map(item => ({
          ...item,
          finalPrice: getItemPrice(item)
        }));
        await createCheckoutSession(itemsWithFinalPrice, customerInfo);
        // The function will redirect to Stripe Checkout
      }
      
      // Process subscriptions (one at a time for now)
      if (subscriptions.length > 0) {
        const subscription = subscriptions[0]; // Process first subscription
        const subscriptionWithFinalPrice = {
          ...subscription,
          finalPrice: getItemPrice(subscription)
        };
        await createSubscriptionCheckout(subscriptionWithFinalPrice, customerInfo);
        // The function will redirect to Stripe Checkout
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-primary mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8">
              Añade productos a tu carrito para continuar con la compra
            </p>
            <button
              onClick={() => navigate('/productos')}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-8"
            >
              {/* Shipping Information */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-primary">
                    Información de Envío
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Calle, número, piso, puerta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Barcelona"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="08001"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-primary mb-2">
                      País *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    >
                      <option value="España">España</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Francia">Francia</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Notas del Pedido (Opcional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                  </div>

                  {/* Checkbox para factura */}
                  <div className="md:col-span-2 border-t-2 border-gray-200 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsInvoice}
                        onChange={(e) => setNeedsInvoice(e.target.checked)}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm font-semibold text-primary">
                        ¿Necesitas factura?
                      </span>
                    </label>
                  </div>

                  {/* Campos de factura */}
                  {needsInvoice && (
                    <>
                      <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 font-medium mb-3">
                          📝 Datos para la factura
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-primary mb-2">
                              Nombre Fiscal / Razón Social *
                            </label>
                            <input
                              type="text"
                              name="fiscalName"
                              value={invoiceData.fiscalName}
                              onChange={handleInvoiceInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="Nombre completo o razón social"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-primary mb-2">
                              NIF/CIF *
                            </label>
                            <input
                              type="text"
                              name="nif"
                              value={invoiceData.nif}
                              onChange={handleInvoiceInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="12345678A o B12345678"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dirección Fiscal (opcional, si es diferente a la de envío)
                            </label>
                            <input
                              type="text"
                              name="fiscalAddress"
                              value={invoiceData.fiscalAddress}
                              onChange={handleInvoiceInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="Calle, número, piso, puerta"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ciudad Fiscal
                            </label>
                            <input
                              type="text"
                              name="fiscalCity"
                              value={invoiceData.fiscalCity}
                              onChange={handleInvoiceInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="Ciudad"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Código Postal Fiscal
                            </label>
                            <input
                              type="text"
                              name="fiscalPostalCode"
                              value={invoiceData.fiscalPostalCode}
                              onChange={handleInvoiceInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              placeholder="08001"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">
                  Resumen del Pedido
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary text-sm">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {item.purchaseType === 'subscription' ? 'Suscripción' : 'Compra única'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cantidad: {item.quantity}
                        {item.freeQuantity && (
                          <span className="text-green-600 font-semibold"> (incluye {item.freeQuantity} gratis)</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {(() => {
                          const paidQuantity = item.freeQuantity ? (item.quantity - item.freeQuantity) : item.quantity;
                          return (getItemPrice(item) * paidQuantity).toFixed(2);
                        })()}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{appliedDiscount ? (getCartTotal() + getDiscountAmount()).toFixed(2) : getCartTotal().toFixed(2)}€</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Descuento {appliedDiscount.code}</span>
                    <span>-{getDiscountAmount().toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Envío</span>
                  <span className="text-green-600 font-semibold">GRATIS</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{getCartTotal().toFixed(2)}€</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceder al Pago
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Pago seguro con Stripe. Tus datos están protegidos.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

