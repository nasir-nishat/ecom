import type { APIRoute } from 'astro';
import { z } from 'zod';
import { verifyCaptcha } from '../../lib/captcha';
import { error, json } from '../../lib/http';
import { supabaseAnon } from '../../lib/supabase';
import { isDemoMode } from '../../lib/demo';

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  message: z.string().min(5).max(4000),
  product_id: z.uuid().nullish(),
  captcha_token: z.string().nullish(),
});

/** Public contact / product inquiry. Accepts JSON or form-encoded bodies. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const raw = request.headers.get('content-type')?.includes('json')
    ? await request.json().catch(() => null)
    : Object.fromEntries((await request.formData().catch(() => new FormData())).entries());

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '));
  if (!(await verifyCaptcha(parsed.data.captcha_token, clientAddress))) return error('Captcha failed', 403);

  const { captcha_token: _, ...row } = parsed.data;
  if (isDemoMode()) return json({ ok: true, demo: true, note: 'Demo mode: inquiry accepted but not stored' }, { status: 202 });
  const { error: dbError } = await supabaseAnon().from('inquiries').insert(row);
  if (dbError) return error('Could not save inquiry', 500);
  return json({ ok: true }, { status: 201 });
};
