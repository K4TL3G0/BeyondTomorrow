import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticleWaveBackground } from '../components/ParticleWaveBackground';
import { supabase } from '../lib/supabase';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setBusy(true);
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (error) return setMessage(error.message);
    if (mode === 'signup') return setMessage('Check your email to confirm your account, then sign in.');
    nav('/');
  }

  async function google() {
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } },
    });
    if (error) setMessage(error.message);
  }

  return (
    <div className="login-container">
      <div className="login-form-pane">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
            <img src="/logo.svg" alt="Beyond Tomorrow Logo" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '0.25rem' }} />
            <strong style={{ fontSize: '1.25rem', fontWeight: 800 }}>Beyond Tomorrow</strong>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="muted" style={{ marginBottom: '0.9rem', fontSize: '0.9rem' }}>
            {mode === 'signin'
              ? 'Sign in to manage your higher education pathway and funding.'
              : 'Join to calculate your APS, check affordability, and find bursaries.'}
          </p>

          <button
            type="button"
            onClick={google}
            className="google-sign-in"
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20">
              <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
              <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
              <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
              <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
            </svg>
            Continue with Google
          </button>
          <p className="muted" style={{ textAlign: 'center', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>
            or use your email
          </p>

          <form onSubmit={submit} className="stack" style={{ maxWidth: '100%', gap: '0.75rem' }}>
            <div>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-label="Email address" placeholder="Enter your email" />
            </div>
            <div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  aria-label="Password"
                  placeholder="Enter your password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy} style={{ width: '100%', marginTop: '0.25rem', padding: '0.65rem 0.75rem' }}>
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          {message && (
            <p role="status" style={{ marginTop: '0.75rem', color: message.includes('Check') ? 'var(--primary)' : '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
              {message}
            </p>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button type="button" className="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ fontSize: '0.9rem' }}>
              {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      <div className="login-hero-pane">
        <ParticleWaveBackground density={0.7} className="login-hero-wave" />
        <div className="login-hero-orb login-hero-orb-one" aria-hidden="true" />
        <div className="login-hero-orb login-hero-orb-two" aria-hidden="true" />
        <img
          src="/logo.svg"
          alt="Beyond Tomorrow Logo"
          className="login-hero-logo"
        />
        <div className="login-hero-content">
          <h2>Find your path.<br />Fund your future.<br />Finish your degree.</h2>
          <p>
            Helping young South Africans navigate higher education, affordability, and graduation success.
          </p>
        </div>
      </div>
    </div>
  );
}
