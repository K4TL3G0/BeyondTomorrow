import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ParticleWaveBackground } from '../components/ParticleWaveBackground';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    if (error) return setMessage(error.message);
    if (mode === 'signup') return setMessage('Check your email to confirm your account.');
    nav('/');
  }

  return (
    <div className="login-container">
      <div className="login-form-pane">
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
            <img src="/logo.svg" alt="Beyond Tomorrow Logo" style={{ width: '72px', height: '72px', objectFit: 'contain', marginBottom: '0.5rem' }} />
            <strong style={{ fontSize: '1.25rem', fontWeight: 800 }}>Beyond Tomorrow</strong>
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.025em' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="muted" style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            {mode === 'signin'
              ? 'Sign in to manage your higher education pathway and funding.'
              : 'Join to calculate your APS, check affordability, and find bursaries.'}
          </p>

          <form onSubmit={submit} className="stack" style={{ maxWidth: '100%', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.9rem' }}>
              Email address
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="e.g. student@example.com" style={{ marginTop: '0.2rem' }} />
            </label>
            <label style={{ display: 'block', fontSize: '0.9rem' }}>
              Password
              <div style={{ position: 'relative', marginTop: '0.2rem' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="Enter password"
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
            </label>
            <button type="submit" className="login-submit-btn" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          {message && (
            <p role="status" style={{ marginTop: '0.75rem', color: message.includes('Check') ? 'var(--primary)' : '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
              {message}
            </p>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button className="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ fontSize: '0.9rem' }}>
              {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      <div className="login-image-pane">
        <ParticleWaveBackground />
        <img
          src="/logo.svg"
          alt="Beyond Tomorrow Logo"
          style={{ position: 'absolute', top: '1rem', left: '0rem', width: '400px', height: '400px', objectFit: 'contain', filter: 'brightness(0) invert(1)', zIndex: 2 }}
        />
        <div className="login-image-content" style={{ zIndex: 2 }}>
          <h2>Find your path.<br />Fund your future.<br />Finish your degree.</h2>
          <p style={{ opacity: 0.85, margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>
            Helping young South Africans navigate higher education, affordability, and graduation success.
          </p>
        </div>
      </div>
    </div>
  );
}
