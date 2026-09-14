import type { APIRoute } from 'astro';
import { MEDIA_MAX_BYTES, MEDIA_MIME } from '../../config/constants';
import { error, json } from '../../lib/http';
import { getStorageDriver } from '../../lib/storage-driver';
import { isDemoMode } from '../../lib/demo';

/** Admin-only (enforced in src/middleware.ts). Accepts multipart `file`, returns { url }. */
export const POST: APIRoute = async ({ request }) => {
  if (isDemoMode()) return error('Demo mode: uploads are disabled until Supabase is connected (prompts/setup/01)', 503);
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return error('Missing file');
  if (!MEDIA_MIME.includes(file.type)) return error(`Unsupported type ${file.type}`, 415);
  if (file.size > MEDIA_MAX_BYTES) return error('File too large', 413);

  try {
    const url = await getStorageDriver().uploadFile(file);
    return json({ url }, { status: 201 });
  } catch (e) {
    return error(e instanceof Error ? e.message : 'Upload failed', 500);
  }
};
