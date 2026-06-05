import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAdminAuth();
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, online, offline
  const [expandedDoc, setExpandedDoc] = useState(null);

  useEffect(() => {
    loadClientDetail();
  }, [clientId]);

  const loadClientDetail = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/clients/${clientId}`);
      if (res && res.ok) {
        const data = await res.json();
        setClient(data.client);
        setDocuments(data.documents || []);
        setStats(data.stats || {});
      } else {
        console.error('Error loading client detail');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(d => {
    if (filter === 'all') return true;
    return d.channel === filter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp * 1000);
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

  if (!client) {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-emerald-400">
                {client.name ? client.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1 truncate">{client.name}</h1>
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
                  {[client.address, client.postal_code, client.city, client.province].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            {/* Total facturado */}
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total facturado</p>
              <p className="text-3xl font-bold text-emerald-400 font-mono">
                {formatCurrency(client.total_invoiced)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Total documentos</p>
            <p className="text-xl font-bold text-white">{stats.total_documents || 0}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Compras online</p>
            <p className="text-xl font-bold text-blue-400">{stats.count_online || 0}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(stats.total_online)}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Compras offline</p>
            <p className="text-xl font-bold text-amber-400">{stats.count_offline || 0}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(stats.total_offline)}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-4">
            <p className="text-xs text-gray-500 mb-1">Total gastado</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(stats.total_all)}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: 'all', label: 'Todos', count: documents.length },
            { key: 'online', label: 'Online (Web)', count: stats.count_online || 0 },
            { key: 'offline', label: 'Offline (Otros)', count: stats.count_offline || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                filter === tab.key
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Documents list */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/5">
            <p className="text-gray-500 text-sm">No hay documentos para este filtro</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <div
                key={`${doc.type}-${doc.id}`}
                className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors"
              >
                {/* Document header */}
                <div
                  className="p-4 md:p-5 cursor-pointer"
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Channel badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-lg border flex-shrink-0 ${
                        doc.channel === 'online'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {doc.channel === 'online' ? 'Web' : 'Otro'}
                      </span>

                      {/* Type badge */}
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        doc.is_ticket
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : doc.type === 'invoice'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {doc.is_ticket ? 'Ticket' : doc.type === 'invoice' ? 'Factura' : 'Pedido'}
                      </span>

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

                {/* Expanded items */}
                {expandedDoc === doc.id && doc.items && doc.items.length > 0 && (
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
                        {doc.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1.5 text-gray-300 pr-4 truncate max-w-[200px]">{item.name}</td>
                            <td className="py-1.5 text-gray-400 text-center">{item.units}</td>
                            <td className="py-1.5 text-white text-right font-mono">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {doc.notes && (
                      <p className="text-[10px] text-gray-600 mt-2 italic">Notas: {doc.notes}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 mb-10">
          <p className="text-xs text-gray-600">
            Mostrando {filteredDocs.length} de {documents.length} documentos · Datos sincronizados con Holded
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
