import { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { authFetch, user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, ordersRes] = await Promise.all([
        authFetch(`${API_URL}/api/admin/dashboard`),
        authFetch(`${API_URL}/api/admin/orders`)
      ]);
      if (dashRes && dashRes.ok) {
        const json = await dashRes.json();
        setData(json);
      } else {
        setError('No se pudieron cargar los datos.');
      }
      if (ordersRes && ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        setOrders(ordersJson.orders || []);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular datos mensuales de ventas
  const monthlyData = useMemo(() => {
    const months = {};
    orders.forEach(o => {
      if (!o.created_at) return;
      // Excluir pedidos cancelados/reembolsados
      if (['cancelled', 'refunded'].includes(o.payment_status)) return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) {
        months[key] = { month: key, orders: 0, revenue: 0, avgTicket: 0 };
      }
      months[key].orders += 1;
      months[key].revenue += (o.total || 0);
    });
    // Calcular ticket medio
    Object.values(months).forEach(m => {
      m.avgTicket = m.orders > 0 ? m.revenue / m.orders : 0;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [orders]);

  const formatMonthLabel = (key) => {
    const [year, month] = key.split('-');
    const d = new Date(year, parseInt(month) - 1);
    return d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Aquí tienes el resumen de tu tienda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm rounded-xl border border-white/10 transition-all disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !data && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm rounded-xl border border-red-500/20 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
              <KPICard
                title="Pedidos"
                value={data.total_orders}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                gradient="from-blue-500/20 to-blue-600/5"
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
                link="/admin/pedidos"
              />
              <KPICard
                title="Productos"
                value={data.total_products_holded}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                gradient="from-emerald-500/20 to-emerald-600/5"
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                link="/admin/productos"
              />
              <KPICard
                title="Reseñas"
                value={data.total_reviews}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                gradient="from-amber-500/20 to-amber-600/5"
                iconBg="bg-amber-500/10"
                iconColor="text-amber-400"
              />
              <KPICard
                title="Avisos"
                value={data.total_notifications || 0}
                subtitle="pendientes"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                gradient="from-purple-500/20 to-purple-600/5"
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
              />
              <KPICard
                title="Carritos"
                value={data.total_abandoned_carts || 0}
                subtitle="abandonados"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>}
                gradient="from-rose-500/20 to-rose-600/5"
                iconBg="bg-rose-500/10"
                iconColor="text-rose-400"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <QuickAction label="Sincronizar Holded" icon="🔄" link="/admin/productos" />
              <QuickAction label="Ver Stock Bajo" icon="⚠️" link="/admin/stock" />
              <QuickAction label="Gestionar Pedidos" icon="📦" link="/admin/pedidos" />
              <QuickAction label="Ver Clientes" icon="👥" link="/admin/clientes" />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Stock Alerts */}
              <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Alertas de Stock
                  </h2>
                  <Link to="/admin/stock" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    Ver todo →
                  </Link>
                </div>
                <div className="p-4">
                  {data.low_stock_alerts && data.low_stock_alerts.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {data.low_stock_alerts.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">{item.sku}</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            item.stock <= 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            item.stock < 20 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {item.stock} uds
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="✓" text="Stock correcto" subtext="Todos los productos tienen stock suficiente" />
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Últimos Pedidos
                  </h2>
                  <Link to="/admin/pedidos" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                    Ver todo →
                  </Link>
                </div>
                <div className="p-4">
                  {data.recent_orders && data.recent_orders.length > 0 ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {data.recent_orders.map((order, i) => (
                        <div key={i} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate font-medium">{order.email}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.date)}</p>
                          </div>
                          <div className="text-right ml-3">
                            <p className="text-sm font-bold text-emerald-400">{order.total ? order.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€' : '—'}</p>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon="📋" text="Sin pedidos" subtext="Los pedidos aparecerán aquí" />
                  )}
                </div>
              </div>
            </div>

            {/* Evolución Mensual de Ventas */}
            {monthlyData.length > 0 && (
              <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Evolución Mensual de Ventas
                  </h2>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span>Facturación</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400"></span>Pedidos</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={formatMonthLabel}
                          tick={{ fill: '#9ca3af', fontSize: 11 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                          tickLine={false}
                        />
                        <YAxis 
                          yAxisId="revenue"
                          tick={{ fill: '#9ca3af', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${v.toFixed(0)}€`}
                        />
                        <YAxis 
                          yAxisId="orders"
                          orientation="right"
                          tick={{ fill: '#9ca3af', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                          labelStyle={{ color: '#fff', marginBottom: '4px' }}
                          labelFormatter={formatMonthLabel}
                          formatter={(value, name) => {
                            if (name === 'revenue') return [`${value.toFixed(2)}€`, 'Facturación'];
                            if (name === 'orders') return [value, 'Pedidos'];
                            return [value, name];
                          }}
                        />
                        <Bar yAxisId="revenue" dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} opacity={0.85} />
                        <Bar yAxisId="orders" dataKey="orders" fill="#60a5fa" radius={[6, 6, 0, 0]} opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla resumen mensual */}
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left py-2 px-3 text-gray-500 font-medium">Mes</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Pedidos</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Facturación</th>
                          <th className="text-right py-2 px-3 text-gray-500 font-medium">Ticket Medio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...monthlyData].reverse().map(m => (
                          <tr key={m.month} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-2.5 px-3 text-white font-medium capitalize">{formatMonthLabel(m.month)}</td>
                            <td className="py-2.5 px-3 text-right text-gray-300">{m.orders}</td>
                            <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-medium">{m.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>
                            <td className="py-2.5 px-3 text-right text-blue-400 font-mono">{m.avgTicket.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-white/10 font-bold">
                          <td className="py-2.5 px-3 text-white">TOTAL</td>
                          <td className="py-2.5 px-3 text-right text-white">{monthlyData.reduce((s, m) => s + m.orders, 0)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-mono">{monthlyData.reduce((s, m) => s + m.revenue, 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>
                          <td className="py-2.5 px-3 text-right text-blue-400 font-mono">
                            {(monthlyData.reduce((s, m) => s + m.revenue, 0) / Math.max(monthlyData.reduce((s, m) => s + m.orders, 0), 1)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* System Status */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Estado del Sistema
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <IntegrationCard
                    name="Holded"
                    status={data.holded_status === 'connected' ? 'online' : 'error'}
                    detail={`${data.total_products_holded} productos`}
                    icon="📊"
                  />
                  <IntegrationCard
                    name="Stripe"
                    status="online"
                    detail="Pagos activos"
                    icon="💳"
                  />
                  <IntegrationCard
                    name="Klaviyo"
                    status="online"
                    detail="Emails activos"
                    icon="📧"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Última actualización: {formatDate(data.last_updated)}
                  </p>
                  <span className="text-xs text-emerald-400/70 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 font-medium capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function KPICard({ title, value, icon, gradient, iconBg, iconColor, link, subtitle }) {
  const Wrapper = link ? Link : 'div';
  const props = link ? { to: link } : {};
  
  return (
    <Wrapper {...props} className={`block bg-gradient-to-br ${gradient} rounded-2xl p-4 md:p-5 border border-white/5 hover:border-white/10 transition-all group`}>
      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3 ${iconColor}`}>
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-gray-600 mt-0.5">{subtitle}</p>}
    </Wrapper>
  );
}

function QuickAction({ label, icon, link }) {
  return (
    <Link to={link} className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
      <span className="text-base">{icon}</span>
      <span className="text-xs text-gray-400 group-hover:text-gray-200 font-medium transition-colors">{label}</span>
    </Link>
  );
}

function IntegrationCard({ name, status, detail, icon }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/5">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-white font-medium">{name}</p>
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === 'online' ? 'bg-emerald-400' : 'bg-red-400'
          }`}></span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const labels = {
    completed: 'Completado',
    pending: 'Pendiente',
    shipped: 'Enviado',
  };
  const style = styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const label = labels[status] || status || 'Nuevo';
  
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${style}`}>
      {label}
    </span>
  );
}

function EmptyState({ icon, text, subtext }) {
  return (
    <div className="text-center py-10">
      <span className="text-2xl opacity-40">{icon}</span>
      <p className="text-gray-500 text-sm mt-2 font-medium">{text}</p>
      <p className="text-gray-600 text-xs mt-1">{subtext}</p>
    </div>
  );
}
