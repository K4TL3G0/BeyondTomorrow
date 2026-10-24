import { useState, useRef, useEffect } from 'react';

interface Props {
  title: string;
  content: string;
}

export function InfoTooltip({ title, content }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="info-tooltip-container" ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="info-lightbulb-btn"
        onClick={() => setOpen(!open)}
        aria-label={`Info: ${title}`}
        title="Click for helpful info"
        style={{
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          cursor: 'pointer',
          fontSize: '0.95rem',
          padding: '0.25rem 0.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        💡
      </button>

      {open && (
        <div
          className="info-tooltip-popup"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.5rem',
            width: '280px',
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
            zIndex: 100,
            color: 'var(--text)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{title}</strong>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--muted)', padding: '0.1rem' }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, color: 'var(--muted)' }}>{content}</p>
        </div>
      )}
    </div>
  );
}
