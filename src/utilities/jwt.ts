export function parseJwt2<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded as T;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt2<{ exp?: number }>(token);
  if (!payload?.exp) return false; // si el token no tiene exp, decide tu policy
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}