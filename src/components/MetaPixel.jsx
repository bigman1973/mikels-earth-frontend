import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  registerMetaConsentListeners,
  syncMetaPixelConsent,
  trackMetaPageView,
} from '../utils/metaPixel';

const MetaPixel = () => {
  const location = useLocation();

  useEffect(() => registerMetaConsentListeners(), []);

  useEffect(() => {
    if (syncMetaPixelConsent()) trackMetaPageView();
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixel;
