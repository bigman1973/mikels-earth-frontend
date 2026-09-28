const CompanyLegalBlock = ({ className = '' }) => (
  <address className={`not-italic ${className}`.trim()}>
    <p>FARMS PLANET SL · Mikel&apos;s Fruit</p>
    <p>CIF B25825209</p>
    <p>C/ Cardenal Cisneros 10, 25003 Lleida, España</p>
    <p>
      <a href="mailto:info@mikels.es" className="hover:underline">info@mikels.es</a>
      {' · '}
      <a href="tel:+34621144701" className="hover:underline">+34 621 144 701</a>
    </p>
  </address>
);

export default CompanyLegalBlock;
