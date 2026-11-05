import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { API_URL } from '../../config/api';

const todayMadrid = () => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const labels = {
  pageviews: 'Visitas registradas /vip (pageviews)',
  submissions: 'Formularios: POST recibidos',
  successful_signup: 'Altas correctas (accepted + evento accepted)',
  ineligible: 'No elegibles (ineligible)',
  technical_failure: 'Fallos técnicos confirmados',
  validation_rejected: 'Rechazos de validación',
  honeypot: 'Honeypot',
  rate_limited: 'Rate limited',
  unknown_outcome: 'Resultado pendiente / desconocido',
  telemetry_failure: 'Fallos de telemetría registrados',
  persisted_submissions: 'Formularios históricos persistidos (no todos)',
};
const shown = (value) => value == null ? 'No medido / no disponible' : value.toLocaleString('es-ES');
const when = (value) => value ? new Date(value).toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }) : 'Sin observaciones';

export default function AdminVipFunnel() {
  const { user, loading, authFetch } = useAdminAuth();
  const [start, setStart] = useState(todayMadrid);
  const [end, setEnd] = useState(todayMadrid);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async (event) => {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    setData(null);
    setError('');
    try {
      const params = new URLSearchParams({ start, end });
      const response = await authFetch(`${API_URL}/api/admin/vip/funnel?${params}`, { cache: 'no-store' });
      if (!response?.ok) {
        setError(response?.status === 400 ? 'Revisa el rango: fechas hasta hoy y máximo 93 días.' :
          'No disponible: revisa tu sesión admin o el estado de la telemetría. No se muestran ceros de sustitución.');
        return;
      }
      setData(await response.json());
    } catch {
      setError('No disponible. No se muestran ceros de sustitución.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="p-6" role="status">Comprobando sesión…</p>;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-white px-4 py-6 text-stone-900">
      <h1 className="text-2xl font-semibold">Embudo VIP diario</h1>
      <p className="mt-3 text-sm">Privado. Zona horaria: Madrid. Visitas son pageviews first-party registradas, no personas únicas; no se usan cookies ni identificadores de persona para este contador.</p>
      <form onSubmit={load} className="my-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">Desde<input type="date" required value={start} max={todayMadrid()} onChange={(e) => setStart(e.target.value)} className="rounded border border-stone-400 bg-white p-2 text-stone-900" /></label>
        <label className="flex flex-col gap-1">Hasta<input type="date" required value={end} min={start} max={todayMadrid()} onChange={(e) => setEnd(e.target.value)} className="rounded border border-stone-400 bg-white p-2 text-stone-900" /></label>
        <button disabled={busy} className="rounded bg-stone-900 px-4 py-3 text-white disabled:opacity-60">{busy ? 'Consultando…' : 'Consultar'}</button>
      </form>
      {error && <p role="alert" className="rounded border border-red-300 p-3 text-red-800">{error}</p>}
      {data && (
        <section aria-live="polite">
          <p className="text-sm">Primera observación de telemetría: {when(data.instrumentation_start)}.</p>
          <p className="text-sm">Inicio de envíos registrados: {when(data.coverage_start)}. Inicio de pageviews registrados: {when(data.pageviews_coverage_start)}.</p>
          <p className="my-3 text-sm">El primer día es parcial. Antes del inicio o sin registro: no medido. Los contadores son observaciones mínimas; una caída de telemetría puede dejar pérdidas desconocidas. Envíos son POST recibidos, no clics perdidos por red. Las altas exigen suscripción y evento aceptados.</p>
          <p className="mb-4 text-sm">El histórico sólo contiene formularios persistidos de VipSignup anteriores al inicio de envíos; no se suma otra vez en live. Visitas, todos los envíos, validación, honeypot y rate no están disponibles retrospectivamente. Salud de lectura: {data.health === 'not_started' ? 'Sin observaciones aún' : 'Disponible; completitud desconocida'}.</p>
          {(data.daily || []).map((day) => (
            <article key={day.date} className="mb-4 rounded-lg border border-stone-300 p-4">
              <h2 className="text-lg font-semibold">{day.date}</h2>
              <h3 className="my-2 font-medium">Instrumentación en vivo</h3>
              <dl className="space-y-2 text-sm">
                {Object.entries(day.live).map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2"><dt>{labels[key]}</dt><dd className="font-semibold">{shown(value)}</dd></div>)}
              </dl>
              {day.historical_persisted && <><h3 className="mb-2 mt-4 font-medium">Histórico persistido, anterior a la cobertura</h3><dl className="space-y-2 text-sm">{Object.entries(day.historical_persisted).map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2"><dt>{labels[key]}</dt><dd className="font-semibold">{shown(value)}</dd></div>)}</dl></>}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
