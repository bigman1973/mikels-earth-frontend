import { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminReviewRemap() {
  const { authFetch } = useAdminAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [selection, setSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [changes, setChanges] = useState([]);
  const [preparedMappings, setPreparedMappings] = useState([]);
  const selectRefs = useRef({});

  const load = async () => {
    setLoading(true);
    setError('');
    setNotice('');
    setPreparedMappings([]);
    try {
      const [reviewsResponse, productsResponse] = await Promise.all([
        authFetch(`${API_URL}/api/admin/reviews/verified`),
        fetch(`${API_URL}/api/products`),
      ]);
      if (!reviewsResponse?.ok) throw new Error('No se han podido leer las reseñas verificadas.');
      if (!productsResponse.ok) throw new Error('No se han podido leer los productos canónicos.');

      const reviewPayload = await reviewsResponse.json();
      const productPayload = await productsResponse.json();
      const loadedReviews = reviewPayload.reviews || [];
      const loadedProducts = (productPayload.products || [])
        .filter((product) => product.slug && product.name)
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));
      setReviews(loadedReviews);
      setProducts(loadedProducts);
      setSelection(Object.fromEntries(loadedReviews.map((review) => [review.id, review.product_slug])));
    } catch (loadError) {
      setError(loadError.message || 'Error al cargar el remapeo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = useMemo(
    () => reviews.filter((review) => selection[review.id] && selection[review.id] !== review.product_slug),
    [reviews, selection],
  );

  const prepare = () => {
    if (saving) return;
    // Some remote-browser controllers modify a native <select> without emitting React's
    // synthetic change event. The DOM remains authoritative at the point of confirmation.
    const selectedNow = Object.fromEntries(reviews.map((review) => [
      review.id,
      selectRefs.current[review.id]?.value || selection[review.id],
    ]));
    const pendingNow = reviews.filter((review) => selectedNow[review.id] && selectedNow[review.id] !== review.product_slug);
    if (!pendingNow.length) {
      setError('No hay ningún producto canónico distinto seleccionado para guardar.');
      return;
    }
    setError('');
    setPreparedMappings(pendingNow.map((review) => ({
      review_id: review.id,
      expected_slug: review.product_slug,
      target_slug: selectedNow[review.id],
    })));
  };

  const submit = async () => {
    if (!preparedMappings.length || saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await authFetch(`${API_URL}/api/admin/reviews/remap-products`, {
        method: 'PUT',
        body: JSON.stringify({
          mappings: preparedMappings,
        }),
      });
      const payload = await response?.json();
      if (!response?.ok) throw new Error(payload?.details?.join(' · ') || payload?.error || 'No se ha podido guardar el remapeo.');
      setChanges(payload.changes || []);
      setNotice(`${payload.changed} reseña(s) verificada(s) reasignada(s).`);
      setPreparedMappings([]);
      await load();
    } catch (saveError) {
      setError(saveError.message || 'Error al guardar el remapeo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-emerald-400 text-xs uppercase tracking-[0.16em] font-semibold">Reseñas</p>
            <h1 className="text-2xl font-semibold text-white tracking-tight mt-2">Compras verificadas</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-3xl">
              Corrige únicamente la asociación de producto de reseñas verificadas con slugs históricos. Los datos de contacto y el texto no se muestran ni se modifican aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading || saving}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            Actualizar
          </button>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
        {notice && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</div>}

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Mapa antes de guardar</h2>
              <p className="text-xs text-gray-500 mt-1">Solo hay una operación pendiente si el destino difiere del slug guardado.</p>
            </div>
            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              {pending.length} cambio(s) pendiente(s)
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Cargando reseñas verificadas…</div>
          ) : reviews.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">No hay reseñas de compra verificada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">ID</th>
                    <th className="px-5 py-3 font-medium">Producto guardado</th>
                    <th className="px-5 py-3 font-medium">Producto canónico</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium">Actualizada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.map((review) => {
                    const changed = selection[review.id] && selection[review.id] !== review.product_slug;
                    return (
                      <tr key={review.id} className={changed ? 'bg-amber-400/[0.04]' : ''}>
                        <td className="px-5 py-4 font-mono text-xs text-gray-400">#{review.id}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-200">{review.product_name || 'Sin nombre histórico'}</p>
                          <p className="mt-1 font-mono text-xs text-gray-500">{review.product_slug || 'sin slug'}</p>
                        </td>
                        <td className="px-5 py-4 min-w-[280px]">
                          <select
                            value={selection[review.id] || ''}
                            ref={(element) => { selectRefs.current[review.id] = element; }}
                            onChange={(event) => setSelection((previous) => ({ ...previous, [review.id]: event.target.value }))}
                            className="w-full rounded-lg border border-white/10 bg-[#12121b] px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                            aria-label={`Producto canónico para reseña ${review.id}`}
                          >
                            <option value={review.product_slug || ''}>{review.product_slug || 'Selecciona un producto'}</option>
                            {products.filter((product) => product.slug !== review.product_slug).map((product) => (
                              <option key={product.slug} value={product.slug}>{product.name} — {product.slug}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs ${review.status === 'approved' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-gray-400/20 bg-gray-400/10 text-gray-300'}`}>
                            {review.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(review.updated_at || review.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">El servidor rechaza slugs obsoletos, reseñas no verificadas, productos inexistentes y cambios parciales.</p>
            <button
              type="button"
              disabled={(!reviews.length && !preparedMappings.length) || saving}
              onClick={preparedMappings.length ? submit : prepare}
              className="shrink-0 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#08211c] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {saving ? 'Guardando…' : preparedMappings.length ? `Confirmar ${preparedMappings.length} cambio(s)` : 'Revisar y aplicar cambios'}
            </button>
          </div>
        </div>

        {preparedMappings.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-amber-200">Confirmación pendiente</h2>
                <p className="mt-1 text-xs text-amber-100/70">Se cambiará únicamente la asociación de producto; texto, puntuación, estado y verificación permanecen intactos.</p>
              </div>
              <button type="button" onClick={() => setPreparedMappings([])} className="text-xs text-amber-100/70 hover:text-amber-100 underline underline-offset-4">Cancelar revisión</button>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-200">
              {preparedMappings.map((mapping) => (
                <li key={mapping.review_id}>#{mapping.review_id}: <span className="font-mono text-gray-400">{mapping.expected_slug}</span> → <span className="font-mono text-emerald-300">{mapping.target_slug}</span></li>
              ))}
            </ul>
          </div>
        )}

        {changes.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-white">Resultado guardado</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              {changes.map((change) => (
                <li key={change.after.id}>
                  #{change.after.id}: <span className="font-mono text-gray-500">{change.before.product_slug}</span> → <span className="font-mono text-emerald-300">{change.after.product_slug}</span> · {formatDate(change.after.updated_at)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
