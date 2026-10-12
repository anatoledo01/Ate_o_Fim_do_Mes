/** Routes that always render in dark mode, regardless of the user's saved theme. */
export const FORCED_DARK_ROUTES = ['/', '/login', '/cadastro'];

export function isForcedDarkRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return FORCED_DARK_ROUTES.includes(normalized);
}
