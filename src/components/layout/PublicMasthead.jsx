import BlackFridayTopBand from '../BlackFridayTopBand';
import Header from './Header';

const PublicMasthead = () => (
  <div className="sticky top-0 z-40 shrink-0" data-public-masthead>
    <BlackFridayTopBand />
    <Header />
  </div>
);

export default PublicMasthead;
