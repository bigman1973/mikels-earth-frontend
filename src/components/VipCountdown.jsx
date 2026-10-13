import { useEffect, useState } from 'react';

const BLACK_FRIDAY_START = new Date('2026-11-27T00:00:00+01:00').getTime();

const getTimeLeft = () => {
  const difference = Math.max(0, BLACK_FRIDAY_START - Date.now());
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference % 86_400_000) / 3_600_000),
    minutes: Math.floor((difference % 3_600_000) / 60_000),
    seconds: Math.floor((difference % 60_000) / 1_000),
  };
};

const unitLabel = (value, singular, plural) => (value === 1 ? singular : plural);

const VipCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(getTimeLeft()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    ['days', 'día', 'días'],
    ['hours', 'hora', 'horas'],
    ['minutes', 'minuto', 'minutos'],
    ['seconds', 'segundo', 'segundos'],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 text-center sm:gap-4" aria-label="Cuenta atrás para Black Friday">
      {units.map(([key, singular, plural]) => (
        <div key={key} className="rounded-xl border border-stone-200 bg-white px-2 py-4 shadow-sm sm:px-4">
          <p className="text-2xl font-semibold tabular-nums text-[#1a1a1a] sm:text-4xl">{String(timeLeft[key]).padStart(2, '0')}</p>
          <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-stone-600 sm:text-xs">
            {unitLabel(timeLeft[key], singular, plural)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default VipCountdown;
