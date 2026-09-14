# 06 · Media storage driver

**Goal:** product media uploads land where they will live in production, and the URL saved on the product is publicly reachable.

**Preconditions:** `PROGRESS.md` → `[x] 05-hcaptcha`. Signed in as admin.

## Steps

Ask the user which of the two supported targets they use (README §6). Adding a third driver (S3, Supabase Storage) is a *build* task — see `prompts/build/`, don't improvise it here.

### Option A — `local` (VPS / same server)

1. `.env`: `STORAGE_DRIVER=local`, `LOCAL_UPLOAD_DIR=public/uploads` (or an absolute path on a persistent disk in production — then serve that directory with your web server/reverse proxy under `/uploads`).
2. `public/uploads/` is gitignored except `.gitkeep`; back it up like a database.

### Option B — `hostinger` (shared hosting holds the files)

1. Upload `deploy/hostinger/uploader.php` to `public_html/uploader.php` on Hostinger (hPanel → File Manager or FTP).
2. Choose a long random secret (`openssl rand -hex 32`). Either set `UPLOAD_SECRET` in hPanel → *PHP configuration* → environment, or replace `CHANGE_ME` in the file and `chmod 600 uploader.php`.
3. `.env`:
   ```env
   STORAGE_DRIVER=hostinger
   HOSTINGER_UPLOAD_ENDPOINT=https://<domain>/uploader.php
   HOSTINGER_UPLOAD_SECRET=<same secret>
   HOSTINGER_BASE_URL=https://<domain>/uploads
   ```
4. Restart `pnpm dev` (server env is read at boot).

## Verify

```bash
# unauthenticated upload is refused by middleware
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4321/api/upload   # 403
```

In the browser, signed in as admin: edit a product → drop an image → thumbnail appears → Save → open the product page → the image URL (Local: `/uploads/…`; Hostinger: `https://<domain>/uploads/…`) loads in a private window.

For Hostinger also confirm a wrong secret is refused:

```bash
curl -s -F file=@public/favicon.svg -H 'X-Upload-Secret: nope' https://<domain>/uploader.php   # {"error":"Unauthorized"}
```

## Done when

- End-to-end upload → public URL works and the two refusal checks pass.
- Tick `- [ ] 06-media-storage` in `prompts/PROGRESS.md`.
- Next: `prompts/setup/07-agent-surfaces.md`.
