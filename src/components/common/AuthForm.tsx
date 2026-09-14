import { useState } from 'react';
import { isDemoMode } from '../../lib/demo';
import { supabaseBrowser } from '../../lib/supabase';
import Captcha from './Captcha';

interface Props {
  mode: 'login' | 'register';
  next?: string;
}

/** Email/password auth via Supabase. hCaptcha token is verified by Supabase Auth itself. */
export default function AuthForm({ mode, next = '/' }: Props) {
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    const sb = supabaseBrowser();
    const options = captcha ? { captchaToken: captcha } : undefined;

    const { data, error } =
      mode === 'login'
        ? await sb.auth.signInWithPassword({ email, password, options })
        : await sb.auth.signUp({ email, password, options });

    setBusy(false);
    if (error) return setError(error.message);
    // Local Supabase auto-confirms emails and returns a session; hosted projects usually require confirmation.
    if (mode === 'register' && !data.session) return setSent(true);
    window.location.assign(next);
  }

  if (isDemoMode())
    return (
      <div className="alert alert-warning text-sm">
        Demo mode — accounts are disabled. <code>/admin</code> is open read-only. Connect Supabase (<code>prompts/setup/01</code>) to enable sign-in.
      </div>
    );
  if (sent) return <div className="alert alert-success">Check your inbox to confirm your email.</div>;

  return (
    <form onSubmit={onSubmit} className="fieldset gap-3">
      <label className="floating-label">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="Email" className="input w-full" />
      </label>
      <label className="floating-label">
        <span>Password</span>
        <input name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Password" className="input w-full" />
      </label>
      <Captcha onToken={setCaptcha} />
      {error && <p className="text-error text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy && <span className="loading loading-spinner loading-xs" />}
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
