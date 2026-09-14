import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { STORAGE_CONFIG } from '../config/storage';

/**
 * Server-side media driver. The browser never talks to storage directly —
 * it posts to /api/upload (admin-gated), which delegates here. Secrets stay on the server.
 */
export interface StorageDriver {
  uploadFile(file: File): Promise<string>;
  getPublicUrl(filepath: string): string;
}

function safeName(original: string) {
  const ext = extname(original).toLowerCase();
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
}

export class LocalStorageDriver implements StorageDriver {
  async uploadFile(file: File) {
    const name = safeName(file.name);
    await mkdir(STORAGE_CONFIG.local.dir, { recursive: true });
    await writeFile(join(STORAGE_CONFIG.local.dir, name), Buffer.from(await file.arrayBuffer()));
    return this.getPublicUrl(name);
  }
  getPublicUrl(filepath: string) {
    return `${STORAGE_CONFIG.local.publicPath}/${filepath}`;
  }
}

export class HostingerStorageDriver implements StorageDriver {
  async uploadFile(file: File) {
    const { endpoint, secret } = STORAGE_CONFIG.hostinger;
    if (!endpoint || !secret) throw new Error('Hostinger storage is not configured');

    const body = new FormData();
    body.append('file', file, safeName(file.name));
    const res = await fetch(endpoint, { method: 'POST', body, headers: { 'X-Upload-Secret': secret } });
    if (!res.ok) throw new Error(`Hostinger upload failed (${res.status})`);
    const data = (await res.json()) as { url?: string; error?: string };
    if (!data.url) throw new Error(data.error ?? 'Hostinger upload returned no URL');
    return data.url;
  }
  getPublicUrl(filepath: string) {
    return `${STORAGE_CONFIG.hostinger.baseUrl}/${filepath}`;
  }
}

export function getStorageDriver(): StorageDriver {
  return STORAGE_CONFIG.driver === 'hostinger' ? new HostingerStorageDriver() : new LocalStorageDriver();
}
