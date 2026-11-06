import { Helmet } from 'react-helmet-async';
import VipSignup from '../components/VipSignup';
import useVipPageview from '../hooks/useVipPageview';
const VipLanding = () => {
  useVipPageview();
  return (
    <main className="bg-[#f5efe4] py-10 sm:py-16">
      <Helmet>
        <title>Lista VIP Black Friday | Mikel&apos;s Fruit</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="mx-auto max-w-xl px-4 sm:px-6">
        <VipSignup />
      </section>
    </main>
  );
};
export default VipLanding;
