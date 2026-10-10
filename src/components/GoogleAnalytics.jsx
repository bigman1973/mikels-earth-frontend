import { useEffect } from 'react';
import { registerGA4ConsentListeners } from '../utils/googleAnalytics';

const GoogleAnalytics = () => {
  useEffect(() => registerGA4ConsentListeners(), []);
  return null;
};

export default GoogleAnalytics;
