import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { trackMetaLead } from '../utils/metaPixel';
import { trackGA4GenerateLead } from '../utils/googleAnalytics';

const VipThanks = () => {
  const [searchParams] = useSearchParams();
  const signupId = String(searchParams.get('signup') || '').trim();

  useEffect(() => {
    if (!signupId) return;
    const confirmedSignupKey = `mikels:vip-signup:${signupId}`;
    if (window.sessionStorage.getItem(confirmedSignupKey) !== '1') return;
    const storageKey = `mikels:vip-lead:${signupId}`;
    const trackLead = () => {
      if (window.sessionStorage.getItem(storageKey)) return;
      const trackedByMeta = trackMetaLead(`vip-${signupId}`);
      const trackedByGA4 = trackGA4GenerateLead();
      if (trackedByMeta || trackedByGA4) window.sessionStorage.setItem(storageKey, '1');
    };

    trackLead();
    window.addEventListener('CookiebotOnConsentReady', trackLead);
    window.addEventListener('CookiebotOnAccept', trackLead);
    return () => {
      window.removeEventListener('CookiebotOnConsentReady', trackLead);
      window.removeEventListener('CookiebotOnAccept', trackLead);
    };
  }, [signupId]);

  return (
    <main className="bg-[#f5efe4] py-16 sm:py-24">
      <Helmet>
        <title>Lista VIP confirmada | Mikel&apos;s Fruit</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7f1d2d]">Lista VIP</p>
          <h1 className="mt-4 font-serif text-3xl font-medium tracking-[0.02em] text-[#1a1a1a] sm:text-4xl">Ya estás dentro.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">Revisa tu correo.</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">Te escribiremos antes de que se abra el Black Friday para el resto.</p>
          <Link to="/tienda" className="mt-8 inline-block rounded-lg bg-[#7f1d2d] px-5 py-3 font-semibold text-white transition hover:bg-[#651725]">Ver la tienda</Link>
        </div>
      </section>
    </main>
  );
};

export default VipThanks;
