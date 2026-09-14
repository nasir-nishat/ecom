import { useState } from 'react';
import { MEDIA_MAX_BYTES, MEDIA_MIME } from '../../config/constants';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

/** Posts files to /api/upload (admin-gated); the server picks local or Hostinger storage. */
export default function MediaUploader({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    const urls = [...value];
    for (const file of Array.from(files)) {
      if (file.size > MEDIA_MAX_BYTES) { setError(`${file.name} exceeds size limit`); continue; }
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) { setError(data.error ?? `Upload failed for ${file.name}`); continue; }
      urls.push(data.url);
    }
    onChange(urls);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <input type="file" multiple accept={MEDIA_MIME.join(',')} onChange={(e) => onFiles(e.target.files)} disabled={busy} className="file-input file-input-bordered w-full" />
      {busy && <progress className="progress w-full" />}
      {error && <p className="text-error text-sm">{error}</p>}
      <ul className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <li key={url} className="relative">
            <img src={url} alt="" className="size-20 rounded object-cover border border-base-300" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="btn btn-circle btn-xs absolute -top-2 -right-2" aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
