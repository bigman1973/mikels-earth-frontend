import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

const CATEGORIES = {
  manual: { label: 'Manual', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  newsletter: { label: 'Newsletter', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  post_compra: { label: 'Post-compra', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  resena: { label: 'Reseña', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
};

export default function AdminCoupons() {
  const { authFetch } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showMonthly, setShowMonthly] = useState(false);
  const editRef = useRef(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_uses: '',
    expires_at: '',
    email: '',
    active: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    if (editRef.current && editingId) {
      editRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [editingId]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/coupons?all=true`);
      if (res && res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '', description: '', discount_type: 'percentage',
      discount_value: 10, min_order_amount: 0, max_uses: '',
      expires_at: '', email: '', active: true
    });
  };

  const openCreateForm = () => {
    resetForm();
    setEditingId(null);
    setShowNewForm(true);
  };

  const openEditForm = (coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_uses: coupon.max_uses || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      email: coupon.email || '',
      active: coupon.active
    });
    setShowNewForm(false);
    setEditingId(coupon.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('save');
    setMessage(null);

    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value) || 0,
      min_order_amount: parseFloat(formData.min_order_amount) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at || null,
      email: formData.email || null
    };

    try {
      let res;
      if (editingId) {
        res = await authFetch(`${API_URL}/api/admin/coupons/${editingId}`, {
          method: 'PUT', body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch(`${API_URL}/api/admin/coupons`, {
          method: 'POST', body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        setShowNewForm(false);
        setEditingId(null);
        resetForm();
        loadCoupons();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Error al guardar cupón' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setActionLoading(null);
    }
  };

  const shareCouponWhatsApp = (coupon) => {
    const discount = coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value}€`;
    const message = `🎁 ¡Tienes un cupón de descuento para Mikel's Earth!\n\n` +
      `Código: *${coupon.code}*\n` +
      `Descuento: ${discount}\n\n` +
      `Úsalo en www.mikels.es al finalizar tu compra. ` +
      `Introduce el código en el campo de "Código de descuento" del carrito.\n\n` +
      `¡Disfrútalo! 🌿`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const toggleCoupon = async (coupon) => {
    setActionLoading(`toggle-${coupon.id}`);
    try {
      const res = await authFetch(`${API_URL}/api/admin/coupons/${coupon.id}/toggle`, { method: 'POST' });
      if (res && res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        loadCoupons();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cambiar estado' });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!confirm(`¿Eliminar el cupón "${coupon.code}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(`delete-${coupon.id}`);
    try {
      const res = await authFetch(`${API_URL}/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
      if (res && res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        loadCoupons();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al eliminar cupón' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (coupon) => {
    if (coupon.is_expired) return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Caducado</span>;
    if (coupon.used || (coupon.max_uses && coupon.current_uses >= coupon.max_uses) || (coupon.total_uses > 0 && coupon.single_use)) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Agotado</span>;
    }
    if (!coupon.active) return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Inactivo</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Activo</span>;
  };

  const getCategoryBadge = (category) => {
    const cat = CATEGORIES[category] || CATEGORIES.manual;
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.bg} ${cat.color} border ${cat.border}`}>{cat.label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  // Filtrar cupones
  const filteredCoupons = coupons.filter(c => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  // Formulario reutilizable
  const CouponForm = ({ isNew }) => (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Código *</label>
        <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase()})}
          placeholder="ej: verano2025" required
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Descripción (interna)</label>
        <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="ej: Cupón para influencer X"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Tipo descuento</label>
        <select value={formData.discount_type} onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50">
          <option value="percentage">Porcentaje (%)</option>
          <option value="fixed">Cantidad fija (€)</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Valor {formData.discount_type === 'percentage' ? '(%)' : '(€)'}</label>
        <input type="number" step="0.01" min="0" value={formData.discount_value}
          onChange={(e) => setFormData({...formData, discount_value: e.target.value})} required
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Caducidad</label>
        <input type="date" value={formData.expires_at} onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Máx. usos</label>
        <input type="number" min="0" value={formData.max_uses} onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
          placeholder="Ilimitado"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Pedido mínimo (€)</label>
        <input type="number" step="0.01" min="0" value={formData.min_order_amount}
          onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div>
        <label className="block text-[11px] text-gray-400 mb-1">Email (opcional)</label>
        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="solo@este-email.com"
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50" />
      </div>
      <div className="md:col-span-2 flex items-center gap-3 pt-1">
        <button type="submit" disabled={actionLoading === 'save'}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50">
          {actionLoading === 'save' ? 'Guardando...' : (isNew ? 'Crear cupón' : 'Guardar cambios')}
        </button>
        <button type="button" onClick={() => { setShowNewForm(false); setEditingId(null); resetForm(); }}
          className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Cupones</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona los códigos de descuento de la tienda</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadCoupons} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={openCreateForm}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo cupón
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-xl font-bold text-white mt-1">{stats.total_coupons}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Activos</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{stats.active_coupons}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Utilizados</p>
              <p className="text-xl font-bold text-amber-400 mt-1">{stats.used_coupons}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#12121a] border border-white/5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">Ahorro est. total</p>
              <p className="text-xl font-bold text-red-400 mt-1">{stats.total_estimated_savings?.toFixed(2)}€</p>
              <p className="text-[9px] text-gray-600 mt-0.5">*Basado en pedido medio {stats.avg_order_estimate}€</p>
            </div>
          </div>
        )}

        {/* Category Stats */}
        {stats?.by_category && (
          <div className="mb-5 p-4 rounded-xl bg-[#12121a] border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Por categoría</h3>
              <button onClick={() => setShowMonthly(!showMonthly)}
                className="text-[11px] text-gray-400 hover:text-white transition-colors">
                {showMonthly ? 'Ocultar mensual' : 'Ver por meses'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(stats.by_category).map(([key, val]) => {
                const cat = CATEGORIES[key] || CATEGORIES.manual;
                return (
                  <div key={key} className={`p-2.5 rounded-lg border ${cat.border} ${cat.bg}`}>
                    <p className={`text-[11px] font-medium ${cat.color}`}>{cat.label}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{val.total} cupones</p>
                    <p className="text-[10px] text-gray-400">{val.used} usados · {val.savings?.toFixed(2)}€ ahorro</p>
                  </div>
                );
              })}
            </div>

            {/* Monthly Stats */}
            {showMonthly && stats.by_month && stats.by_month.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <h4 className="text-xs font-medium text-gray-400 mb-2">Ahorro estimado por mes</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {stats.by_month.map((m) => (
                    <div key={m.month} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.02]">
                      <span className="text-sm text-gray-300">{formatMonth(m.month)}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{m.uses} usos</span>
                        <span className="text-sm font-semibold text-red-400">-{m.estimated_savings?.toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right text-current opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'manual', label: 'Manual' },
            { key: 'newsletter', label: 'Newsletter' },
            { key: 'post_compra', label: 'Post-compra' },
            { key: 'resena', label: 'Reseña' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab.key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}>
              {tab.label}
              {tab.key !== 'all' && stats?.by_category?.[tab.key] && (
                <span className="ml-1 text-[10px] opacity-60">({stats.by_category[tab.key].total})</span>
              )}
            </button>
          ))}
        </div>

        {/* New Coupon Form (top) */}
        {showNewForm && (
          <div className="mb-4 rounded-xl bg-[#12121a] border border-emerald-500/30 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Nuevo cupón</span>
              <button onClick={() => { setShowNewForm(false); resetForm(); }} className="text-gray-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CouponForm isNew={true} />
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No hay cupones en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCoupons.map((coupon) => (
              <div key={coupon.id}>
                {/* Coupon Row */}
                <div className={`rounded-xl border transition-colors overflow-hidden ${
                  editingId === coupon.id ? 'border-emerald-500/30 bg-[#12121a]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.03]'
                }`}>
                  {/* Main row content */}
                  <div className="p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      {/* Code + Category + Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-mono font-semibold text-white">{coupon.code}</span>
                          {getCategoryBadge(coupon.category)}
                          {getStatusBadge(coupon)}
                          {coupon.single_use && (
                            <span className="text-[9px] text-gray-600 border border-white/5 px-1.5 py-0.5 rounded">1 uso</span>
                          )}
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{coupon.description}</p>
                        )}
                        {coupon.email && (
                          <p className="text-[11px] text-blue-400/70 mt-0.5 truncate">Email: {coupon.email}</p>
                        )}
                      </div>

                      {/* Discount */}
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="text-center md:text-right">
                          <span className="text-sm font-bold text-amber-400">{coupon.display_discount}</span>
                          {coupon.min_order_amount > 0 && (
                            <p className="text-[10px] text-gray-600">Mín: {coupon.min_order_amount}€</p>
                          )}
                        </div>

                        {/* Uses */}
                        <div className="text-center md:text-right">
                          <span className="text-sm text-gray-300">
                            {coupon.total_uses}{coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                          </span>
                          <p className="text-[10px] text-gray-600">usos</p>
                        </div>

                        {/* Savings */}
                        <div className="text-center md:text-right">
                          {coupon.estimated_savings > 0 ? (
                            <span className={`text-sm font-medium ${coupon.savings_source === 'stripe' ? 'text-green-400' : 'text-red-400'}`}>-{coupon.estimated_savings.toFixed(2)}€</span>
                          ) : (
                            <span className="text-sm text-gray-600">—</span>
                          )}
                          <p className="text-[10px] text-gray-600">{coupon.savings_source === 'stripe' ? 'ahorro real' : 'ahorro est.'}</p>
                        </div>

                        {/* Expiry */}
                        <div className="hidden md:block text-right">
                          <span className={`text-xs ${coupon.is_expired ? 'text-red-400' : 'text-gray-500'}`}>
                            {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sin caducidad'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleCoupon(coupon)} disabled={actionLoading === `toggle-${coupon.id}`}
                            title={coupon.active ? 'Desactivar' : 'Activar'}
                            className={`p-1.5 rounded-md transition-colors ${coupon.active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:bg-white/5'}`}>
                            {coupon.active ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                          </button>
                          <button onClick={() => editingId === coupon.id ? setEditingId(null) : openEditForm(coupon)}
                            title="Editar" className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => shareCouponWhatsApp(coupon)}
                            title="Compartir por WhatsApp" className="p-1.5 rounded-md text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                          <button onClick={() => deleteCoupon(coupon)} disabled={actionLoading === `delete-${coupon.id}`}
                            title="Eliminar" className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Form (appears below this coupon) */}
                  {editingId === coupon.id && (
                    <div ref={editRef} className="border-t border-white/5">
                      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
                        <span className="text-xs font-medium text-gray-400">Editando: <span className="text-white">{coupon.code}</span></span>
                      </div>
                      <CouponForm isNew={false} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            {filteredCoupons.length} cupón{filteredCoupons.length !== 1 ? 'es' : ''} 
            {activeFilter !== 'all' ? ` (${CATEGORIES[activeFilter]?.label || activeFilter})` : ' en total'}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
