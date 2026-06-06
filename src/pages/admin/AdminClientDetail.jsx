import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [docItems, setDocItems] = useState({}); // Cache de items cargados bajo demanda
  const [loadingItems, setLoadingItems] = useState(null); // ID del doc que está cargando items

  useEffect(() => {
    loadClientDetail();
  }, [clientId]);

  const loadClientDetail = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/clients/${clientId}`);
      if (res && res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error('Error loading client detail');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar items de un documento bajo demanda
  const loadDocumentItems = async (docType, docId) => {
    if (docItems[docId]) return; // Ya cargado
    setLoadingItems(docId);
    try {
      const res = await authFetch(`${API_URL}/api/admin/documents/${docType}/${docId}`);
      if (res && res.ok) {
        const result = await res.json();
        setDocItems(prev => ({ ...prev, [docId]: result.items || [] }));
      }
    } catch (err) {
      console.error('Error loading document items:', err);
    } finally {
      setLoadingItems(null);
    }
  };

  const handleExpandDoc = (doc) => {
    const docId = doc.id;
    if (expandedDoc === docId) {
      setExpandedDoc(null);
      return;
    }
    setExpandedDoc(docId);
    // Si es un documento B2B de Holded y no tiene items cargados, cargarlos
    if (!data?.source?.startsWith('web') && !docItems[docId]) {
      const docType = doc.type || 'invoice';
      loadDocumentItems(docType, docId);
    }
  };

  const formatDate = (val) => {
    if (!val) return '—';
    if (typeof val === 'number') {
      const date = new Date(val * 1000);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const date = new Date(val);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0,00€';
    return parseFloat(amount).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm">Cargando datos del cliente...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data || !data.client) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-gray-400">Cliente no encontrado</p>
          <button onClick={() => navigate('/admin/clientes')} className="text-emerald-400 text-sm hover:underline">
            ← Volver a clientes
          </button>
        </div>
      </AdminLayout>
    );
  }

  const client = data.client;
  const isWebClient = data.source === 'web';

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin/clientes')}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a clientes
        </button>

        {/* Client Header */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
              isWebClient
                ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/20'
                : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/20'
            }`}>
              <span className={`text-2xl font-bold ${isWebClient ? 'text-emerald-400' : 'text-amber-400'}`}>
                {client.name ? client.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white truncate">{client.name}</h1>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                  isWebClient
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {isWebClient ? 'Web' : 'B2B / Contado'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400 mt-3">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </div>
                )}
                {(client.phone || client.mobile) && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {client.phone || client.mobile}
                  </div>
                )}
                {client.vatnumber && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {client.vatnumber}
                  </div>
                )}
              </div>
              {(client.address || client.city) && (
                <p className="text-xs text-gray-500 mt-2">
                  {[client.address, client.postal_code, client.city, client.province, client.country].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {isWebClient ? 'Total gastado' : 'Total facturado'}
              </p>
              <p className={`text-3xl font-bold font-mono ${isWebClient ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(isWebClient ? data.stats?.total_spent : (data.stats?.total_all || client.total_invoiced))}
              </p>
            </div>
          </div>
        </div>

        {/* ===== WEB CLIENT VIEW ===== */}
        {isWebClient && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Total pedidos</p>
                <p className="text-xl font-bold text-white">{data.stats?.total_orders || 0}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Total gastado</p>
                <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(data.stats?.total_spent)}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Tickets generados</p>
                <p className="text-xl font-bold text-cyan-400">{data.stats?.tickets_generated || 0}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Tickets pendientes</p>
                <p className={`text-xl font-bold ${(data.stats?.tickets_pending || 0) > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {data.stats?.tickets_pending || 0}
                </p>
              </div>
            </div>

            {/* Orders list */}
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Pedidos web</h2>
            {(data.orders || []).length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-gray-500 text-sm">No hay pedidos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data.orders || []).map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
                  >
                    <div
                      className="p-4 md:p-5 cursor-pointer"
                      onClick={() => setExpandedDoc(expandedDoc === order.id ? null : order.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Ticket status badge */}
                          {order.has_ticket ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-lg border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 flex-shrink-0">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {order.ticket_holded}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-lg border bg-red-500/10 text-red-400 border-red-500/20 flex-shrink-0">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Ticket pendiente
                            </span>
                          )}

                          {/* Order number */}
                          <span className="text-sm text-white font-mono font-medium">
                            {order.order_number || `#${order.id}`}
                          </span>

                          {/* Date */}
                          <span className="text-xs text-gray-500 hidden md:inline">
                            {formatDate(order.date)}
                          </span>

                          {/* Payment status */}
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {order.payment_status === 'paid' ? 'Pagado' : order.payment_status || '—'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 md:hidden">
                            {formatDate(order.date)}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">
                            {formatCurrency(order.total)}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${expandedDoc === order.id ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded items */}
                    {expandedDoc === order.id && order.items && order.items.length > 0 && (
                      <div className="border-t border-white/5 px-4 md:px-5 py-3 bg-white/[0.01]">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left pb-2 font-medium">Producto</th>
                              <th className="text-center pb-2 font-medium">Uds.</th>
                              <th className="text-right pb-2 font-medium">Importe</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 text-gray-300 pr-4 truncate max-w-[200px]">{item.name || item.product_name || '—'}</td>
                                <td className="py-1.5 text-gray-400 text-center">{item.quantity || item.units || 1}</td>
                                <td className="py-1.5 text-white text-right font-mono">{formatCurrency(item.price || item.subtotal || 0)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== B2B CLIENT VIEW ===== */}
        {!isWebClient && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Total documentos</p>
                <p className="text-xl font-bold text-white">{data.stats?.total_documents || 0}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Facturas</p>
                <p className="text-xl font-bold text-emerald-400">{data.stats?.count_invoices || 0}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(data.stats?.total_invoices)}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Tickets</p>
                <p className="text-xl font-bold text-cyan-400">{data.stats?.count_tickets || 0}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(data.stats?.total_tickets)}</p>
              </div>
              <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
                <p className="text-xs text-gray-500 mb-1">Pedidos venta</p>
                <p className="text-xl font-bold text-purple-400">{data.stats?.count_salesorders || 0}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(data.stats?.total_salesorders)}</p>
              </div>
            </div>

            {/* Documents list */}
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Historial de documentos</h2>
            {(data.documents || []).length === 0 ? (
              <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
                <p className="text-gray-500 text-sm">No hay documentos para este cliente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data.documents || []).map((doc) => (
                  <div
                    key={`${doc.type}-${doc.id}`}
                    className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
                  >
                    <div
                      className="p-4 md:p-5 cursor-pointer"
                      onClick={() => handleExpandDoc(doc)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Type badge */}
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border flex-shrink-0 ${
                            doc.type === 'salesreceipt'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : doc.type === 'invoice'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {doc.type === 'salesreceipt' ? 'Ticket' : doc.type === 'invoice' ? 'Factura' : 'Pedido'}
                          </span>

                          {/* Draft badge */}
                          {doc.is_draft && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded border bg-gray-500/10 text-gray-400 border-gray-500/20">
                              Borrador
                            </span>
                          )}

                          {/* Number */}
                          <span className="text-sm text-white font-mono font-medium truncate">
                            {doc.number || '—'}
                          </span>

                          {/* Date */}
                          <span className="text-xs text-gray-500 hidden md:inline">
                            {formatDate(doc.date)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 md:hidden">
                            {formatDate(doc.date)}
                          </span>
                          <span className="text-sm font-bold text-white font-mono">
                            {formatCurrency(doc.total)}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${expandedDoc === doc.id ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded items - loaded on demand */}
                    {expandedDoc === doc.id && (
                      <div className="border-t border-white/5 px-4 md:px-5 py-3 bg-white/[0.01]">
                        {loadingItems === doc.id ? (
                          <div className="flex items-center gap-2 py-2">
                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-500">Cargando desglose...</span>
                          </div>
                        ) : (docItems[doc.id] && docItems[doc.id].length > 0) ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left pb-2 font-medium">Producto</th>
                                <th className="text-center pb-2 font-medium">Uds.</th>
                                <th className="text-center pb-2 font-medium">Precio ud.</th>
                                <th className="text-right pb-2 font-medium">Importe</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {docItems[doc.id].map((item, idx) => (
                                <tr key={idx}>
                                  <td className="py-1.5 text-gray-300 pr-4 truncate max-w-[200px]">{item.name || '—'}</td>
                                  <td className="py-1.5 text-gray-400 text-center">{item.units}</td>
                                  <td className="py-1.5 text-gray-400 text-center font-mono">{formatCurrency(item.price)}</td>
                                  <td className="py-1.5 text-white text-right font-mono">{formatCurrency(item.subtotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-xs text-gray-500 py-2">No hay desglose disponible para este documento</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-5 mb-10">
          <p className="text-xs text-gray-600">
            {isWebClient
              ? `${data.orders?.length || 0} pedidos web · Datos de Stripe/DB local`
              : `${data.documents?.length || 0} documentos · Datos sincronizados con Holded`
            }
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
