import { formatEuro } from '../../utils/formatMoney.js';
import { getCampaignUnitReference } from '../../utils/campaignUnitReference.js';

const CampaignUnitReference = ({ product, compact = false }) => {
  const reference = getCampaignUnitReference(product);
  if (!reference) return null;
  return (
    <div data-campaign-unit-reference="BF26" className="space-y-2 text-[#1a1a1a]">
      <p className={`${compact ? 'text-xl' : 'text-3xl'} font-bold text-price`}>
        {formatEuro(reference.unitPrice)} <span className="text-base font-medium">por {reference.unitLabel}</span>
      </p>
      <p className="text-sm leading-6 text-stone-700">
        Precio habitual <s>{formatEuro(reference.usualUnitPrice)} por {reference.unitLabel}</s>
      </p>
      <span className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white">
        −{reference.discountPercent} % por {reference.unitLabel}
      </span>
    </div>
  );
};

export default CampaignUnitReference;
