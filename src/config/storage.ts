import {
  HOSTINGER_BASE_URL,
  HOSTINGER_UPLOAD_ENDPOINT,
  HOSTINGER_UPLOAD_SECRET,
  LOCAL_UPLOAD_DIR,
  STORAGE_DRIVER,
} from 'astro:env/server';

export const STORAGE_CONFIG = {
  driver: STORAGE_DRIVER,
  local: {
    dir: LOCAL_UPLOAD_DIR,
    publicPath: '/uploads',
  },
  hostinger: {
    endpoint: HOSTINGER_UPLOAD_ENDPOINT ?? '',
    secret: HOSTINGER_UPLOAD_SECRET ?? '',
    baseUrl: (HOSTINGER_BASE_URL ?? '').replace(/\/$/, ''),
  },
} as const;
