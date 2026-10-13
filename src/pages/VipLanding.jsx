import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import VipCountdown from '../components/VipCountdown';
import { API_URL } from '../config/api';

const VipLanding = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!marketingConsent) {
      setStatus({ type: 'error', message: 'Debes aceptar recibir comunicaciones comerciales para entrar en la lista VIP.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await fetch(`${API_URL}/api/vip/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          marketing_consent: true,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.signup_id) {
        throw new Error(data.error || 'No se ha podido completar el alta. Inténtalo de nuevo más tarde.');
      }
      const signupId = String(data.signup_id);
      window.sessionStorage.setItem(`mikels:vip-signup:${signupId}`, '1');
      navigate(`/vip/gracias?signup=${encodeURIComponent(signupId)}`, { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'No se ha podido completar el alta. Inténtalo de nuevo más tarde.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[#f5efe4] py-10 sm:py-16">
      <Helmet>
        <title>Lista VIP Black Friday | Mikel&apos;s Fruit</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-[#7f1d2d]">Black Friday 2026</p>
          <h1 className="mt-4 text-center font-serif text-3xl font-medium leading-tight tracking-[0.02em] text-[#1a1a1a] sm:text-4xl">
            Acceso anticipado al Black Friday de Mikel&apos;s, solo para la lista VIP.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-center text-base leading-7 text-stone-700">
            Recibirás acceso 24 horas antes que el resto y tu código de descuento por correo.
          </p>

          <div className="mt-8">
            <VipCountdown />
          </div>

          <form className="mt-10 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1a1a1a]" htmlFor="vip-email">Correo electrónico</label>
              <input
                id="vip-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition focus:border-[#7f1d2d] focus:ring-2 focus:ring-[#7f1d2d]/20"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1a1a1a]" htmlFor="vip-first-name">Nombre <span className="font-normal text-stone-500">(opcional)</span></label>
              <input
                id="vip-first-name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                maxLength={120}
                className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base text-[#1a1a1a] outline-none transition focus:border-[#7f1d2d] focus:ring-2 focus:ring-[#7f1d2d]/20"
              />
            </div>
            <label className="flex items-start gap-3 text-sm leading-5 text-stone-700" htmlFor="vip-marketing-consent">
              <input
                id="vip-marketing-consent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#7f1d2d]"
                required
              />
              <span>
                Acepto recibir comunicaciones comerciales de Mikel&apos;s Fruit y he leído la{' '}
                <Link to="/politica-privacidad" className="font-medium text-[#7f1d2d] underline underline-offset-2">política de privacidad</Link>.
              </span>
            </label>
            {status.message && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{status.message}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#7f1d2d] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[#651725] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando…' : 'Quiero entrar en la lista VIP'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default VipLanding;
