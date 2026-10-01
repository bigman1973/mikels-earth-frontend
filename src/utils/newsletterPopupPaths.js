const ALLOWED_NEWSLETTER_POPUP_PATHS = new Set([
  '/blog',
  '/la-familia',
  '/nuestra-tierra',
  '/recetario',
]);

export const isNewsletterPopupAllowedPath = (pathname) => (
  ALLOWED_NEWSLETTER_POPUP_PATHS.has(pathname) || pathname.startsWith('/blog/')
);
