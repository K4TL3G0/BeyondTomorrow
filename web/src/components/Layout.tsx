import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Footer } from './Footer';

const links = [
  ['/aps-calculator', 'APS Calculator'],
  ['/pathways', 'Pathways'],
  ['/applications', 'Applications'],
  ['/funding', 'Funding'],
  ['/checklist', 'Checklist'],
  ['/resources', 'Resources'],
  ['/aps', 'APS Calculator'],
] as const;

export function Layout() {
  const { session } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isApplicationsPage = location.pathname === '/applications';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="nav">
        <Link to="/" className="brand">
          <img src="/logo.svg" alt="Beyond Tomorrow Logo" />
          <span>Beyond Tomorrow</span>
        </Link>
        <nav aria-label="Main">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to}>{label}</NavLink>
          ))}
        </nav>
        {session ? (
          <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        ) : (
          <NavLink to="/login">Sign in</NavLink>
        )}
      </header>
      {isApplicationsPage ? (
        <div className="page page--wide" style={{ flex: 1 }}><Outlet /></div>
      ) : (
        <main className="page" style={{ flex: 1 }}><Outlet /></main>
      )}
      {!isAuthPage && <Footer />}
    </div>
  );
}
