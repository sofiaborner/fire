/**
 * Resolves static asset paths relative to the Vite base URL.
 * Ensures assets work both locally and on GitHub Pages (e.g. /repo-name/).
 */
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (
    path.startsWith('data:') ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  let cleanPath = path;
  if (cleanPath.startsWith('./')) {
    cleanPath = cleanPath.slice(2);
  } else if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }

  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

