import { useState } from 'react';

/** Stores the signup as an inquiry (message "Newsletter signup") so the owner sees it in admin — no extra table. */
export default function Newsletter() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get('email'));
    setState('busy');
    const res = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Newsletter', email, message: 'Newsletter signup' }),
    });
    setState(res.ok ? 'done' : 'error');
  }

  if (state === 'done') return <p className="text-sm text-success">Thanks — you’re on the list.</p>;
  return (
    <form onSubmit={onSubmit} className="join w-full">
      <input name="email" type="email" required placeholder="Enter your email" className="input input-sm join-item w-full border-base-300" />
      <button className="btn btn-primary btn-sm join-item" disabled={state === 'busy'}>Subscribe</button>
      {state === 'error' && <p className="text-xs text-error mt-1">Please try again.</p>}
    </form>
  );
}
