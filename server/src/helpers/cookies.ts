export type CookieOptions = {
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, part) => {
    const [name, ...rest] = part.trim().split('=');
    if (!name) return cookies;
    cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});
};

export const serializeCookie = (name: string, value: string, options: CookieOptions = {}): string => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  }

  if (options.httpOnly) {
    parts.push('HttpOnly');
  }

  if (options.secure) {
    parts.push('Secure');
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  parts.push(`Path=${options.path || '/'}`);

  return parts.join('; ');
};
