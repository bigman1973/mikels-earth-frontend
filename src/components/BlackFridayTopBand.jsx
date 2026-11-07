import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { VIP_ACCESS_START } from '../config/vipSchedule.js';
import {
  BF26_TOP_BAND_CHANGE_EVENT, dismissTopBand, isTopBandAllowedPath,
  isTopBandBeforeAccess, isTopBandDismissed,
} from '../utils/blackFridayTopBand.js';

const BlackFridayTopBand = () => {
  const { pathname } = useLocation();
  const [beforeAccess, setBeforeAccess] = useState(isTopBandBeforeAccess);
  const [dismissed, setDismissed] = useState(isTopBandDismissed);

  useEffect(() => {
    let timer;
    const update = () => {
      window.clearTimeout(timer);
      const remaining = VIP_ACCESS_START - Date.now();
      setBeforeAccess(isTopBandBeforeAccess());
      if (isTopBandDismissed()) setDismissed(true);
      if (remaining > 0) timer = window.setTimeout(update, Math.min(remaining, 2_147_483_647));
    };
    update();
    window.addEventListener('focus', update);
    window.addEventListener('storage', update);
    window.addEventListener(BF26_TOP_BAND_CHANGE_EVENT, update);
    document.addEventListener('visibilitychange', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', update);
      window.removeEventListener('storage', update);
      window.removeEventListener(BF26_TOP_BAND_CHANGE_EVENT, update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  if (!isTopBandAllowedPath(pathname) || dismissed || !beforeAccess || !isTopBandBeforeAccess()) return null;

  return (
    <aside aria-label="Black Friday 2026" className="bf26-top-band" lang="es">
      <div className="relative mx-auto max-w-7xl px-4 py-3 pr-14 text-center sm:px-16">
        <p className="m-0 text-[13px] font-semibold leading-5 sm:text-sm">
          Black Friday el 26 de noviembre · hasta el 50 % de descuento
        </p>
        <Link to="/vip" className="mt-1 block text-[13px] font-medium leading-5 underline decoration-current underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-sm">
          Entra en la lista y compra un día antes{'  →  '}<span className="whitespace-nowrap">mikels.es/vip</span>
        </Link>
        <button
          type="button"
          aria-label="Cerrar banda de Black Friday"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => { dismissTopBand(); setDismissed(true); }}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};

export default BlackFridayTopBand;
