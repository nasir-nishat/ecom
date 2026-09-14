import { HCAPTCHA_SECRET } from 'astro:env/server';

/**
 * Verify an hCaptcha token server-side. Returns true when no secret is configured (dev),
 * so forms keep working before hCaptcha keys exist.
 */
export async function verifyCaptcha(token: string | null | undefined, remoteIp?: string) {
  if (!HCAPTCHA_SECRET) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret: HCAPTCHA_SECRET, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch('https://api.hcaptcha.com/siteverify', { method: 'POST', body });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
