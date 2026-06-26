import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminCoupons() {
  const { authFetch } = useAdminAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
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

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/coupons?all=true`);
      if (res && res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingCoupon(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
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
    setEditingCoupon(coupon);
    setShowForm(true);
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
      if (editingCoupon) {
        res = await authFetch(`${API_URL}/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch(`${API_URL}/api/admin/coupons`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: data.message });
        setShowForm(false);
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

  const toggleCoupon = async (coupon) => {
    setActionLoading(`toggle-${coupon.id}`);
    try {
      const res = await authFetch(`${API_URL}/api/admin/coupons/${coupon.id}/toggle`, {
        method: 'POST'
      });
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
      const res = await authFetch(`${API_URL}/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE'
      });
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
    if (!coupon.active) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Inactivo</span>;
    }
    if (coupon.is_expired) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Caducado</span>;
    }
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Agotado</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Activo</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Cupones</h1>
            <p className="text-sm text-gray-500 mt-1">Gestiona los códigos de descuento de la tienda</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadCoupons}
              className="px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo cupón
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="float-right text-current opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-6 p-5 rounded-xl bg-[#12121a] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {editingCoupon ? `Editar cupón: ${editingCoupon.code}` : 'Nuevo cupón'}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-500 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Código del cupón *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase()})}
                  placeholder="ej: verano2025"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">El código que el cliente introduce en el checkout</p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Descripción (nota interna)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ej: Cupón para influencer X"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">Solo visible para administradores</p>
              </div>

              {/* Tipo de descuento */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Tipo de descuento</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Cantidad fija (€)</option>
                </select>
              </div>

              {/* Valor del descuento */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">
                  Valor del descuento {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Fecha de caducidad */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Fecha de caducidad</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">Dejar vacío = sin caducidad</p>
              </div>

              {/* Máximo de usos */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Máximo de usos</label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                  placeholder="Ilimitado"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">Dejar vacío = usos ilimitados</p>
              </div>

              {/* Pedido mínimo */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Pedido mínimo (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">0 = sin mínimo</p>
              </div>

              {/* Email específico */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email específico (opcional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="solo@este-email.com"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-gray-600 mt-1">Si se indica, solo ese email podrá usar el cupón</p>
              </div>

              {/* Botones */}
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === 'save'}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'save' ? 'Guardando...' : (editingCoupon ? 'Guardar cambios' : 'Crear cupón')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No hay cupones creados</p>
            <button onClick={openCreateForm} className="mt-3 text-emerald-400 text-sm hover:underline">
              Crear el primer cupón
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl overflow-hidden border border-white/5">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Caducidad</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm font-mono font-medium text-white">{coupon.code}</span>
                          {coupon.description && (
                            <p className="text-[11px] text-gray-500 mt-0.5">{coupon.description}</p>
                          )}
                          {coupon.email && (
                            <p className="text-[11px] text-blue-400 mt-0.5">Solo: {coupon.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-amber-400">{coupon.display_discount}</span>
                        {coupon.min_order_amount > 0 && (
                          <p className="text-[11px] text-gray-500">Mín: {coupon.min_order_amount}€</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300">
                          {coupon.current_uses}{coupon.max_uses ? ` / ${coupon.max_uses}` : ' / ∞'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${coupon.is_expired ? 'text-red-400' : 'text-gray-400'}`}>
                          {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sin caducidad'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle */}
                          <button
                            onClick={() => toggleCoupon(coupon)}
                            disabled={actionLoading === `toggle-${coupon.id}`}
                            title={coupon.active ? 'Desactivar' : 'Activar'}
                            className={`p-1.5 rounded-md transition-colors ${
                              coupon.active 
                                ? 'text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-500 hover:bg-white/5'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {coupon.active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEditForm(coupon)}
                            title="Editar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => deleteCoupon(coupon)}
                            disabled={actionLoading === `delete-${coupon.id}`}
                            title="Eliminar"
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="p-4 rounded-xl bg-[#12121a] border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-mono font-medium text-white">{coupon.code}</span>
                      {coupon.description && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{coupon.description}</p>
                      )}
                    </div>
                    {getStatusBadge(coupon)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Descuento</p>
                      <p className="text-sm font-semibold text-amber-400">{coupon.display_discount}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Usos</p>
                      <p className="text-sm text-gray-300">{coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : '/∞'}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs text-gray-500">Caduca</p>
                      <p className={`text-sm ${coupon.is_expired ? 'text-red-400' : 'text-gray-400'}`}>
                        {coupon.expires_at ? formatDate(coupon.expires_at) : '—'}
                      </p>
                    </div>
                  </div>

                  {coupon.email && (
                    <p className="text-[11px] text-blue-400 mt-2">Restringido a: {coupon.email}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleCoupon(coupon)}
                      disabled={actionLoading === `toggle-${coupon.id}`}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        coupon.active 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {coupon.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => openEditForm(coupon)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon)}
                      disabled={actionLoading === `delete-${coupon.id}`}
                      className="py-2 px-3 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer count */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">{coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} en total</p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
