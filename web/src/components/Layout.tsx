import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { Footer } from './Footer';

const links = [
  ['/aps-calculator', 'APS Calculator'],
  ['/pathways', 'Pathways'],
  ['/funding', 'Funding'],
  ['/applications', 'Applications'],
  ['/coach', 'Readiness Coach'],
  ['/resources', 'Resources'],
  ['/profile', 'Profile'],
] as const;

export function Layout() {
  const { session } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isApplicationsPage = location.pathname === '/applications';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1060) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="nav">
        <div className="nav-container">
          <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.svg" alt="Beyond Tomorrow Logo" />
            <span>Beyond Tomorrow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main">
            {links.map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            {session ? (
              <button
                type="button"
                className="nav-auth-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void supabase.auth.signOut();
                }}
              >
                <span>Sign out</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className="nav-auth-btn nav-auth-btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Sign in</span>
              </NavLink>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-nav-overlay animate-fadeIn">
            <nav aria-label="Mobile Main">
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-nav-link"
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mobile-nav-footer">
              {session ? (
                <button
                  type="button"
                  className="mobile-auth-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    void supabase.auth.signOut();
                  }}
                >
                  <LogOut size={18} />
                  <span>Sign out</span>
                </button>
              ) : (
                <NavLink
                  to="/login"
                  className="mobile-auth-btn mobile-auth-btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  <span>Sign in</span>
                </NavLink>
              )}
            </div>
          </div>
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
