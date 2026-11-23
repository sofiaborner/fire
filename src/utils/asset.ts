/**
 * Resolves static asset paths relative to the Vite base URL.
 * Ensures assets work both locally and on GitHub Pages (e.g. /repo-name/).
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  return `${base}${cleanPath}`;
};
