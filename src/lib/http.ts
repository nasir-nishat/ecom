/** Tiny JSON response helpers so API routes stay one-liners. */
export const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers },
  });

export const error = (message: string, status = 400) => json({ error: message }, { status });
