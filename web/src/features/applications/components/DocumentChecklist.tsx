import { useDocumentChecklist } from '../hooks/useDocumentChecklist';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentChecklist({ isOpen, onClose }: Props) {
  const { items, checked, completedCount, total, statusMessage, toggle, reset } =
    useDocumentChecklist();

  const handleReset = () => {
    if (!window.confirm('Clear all document checklist ticks in this browser?')) return;
    reset();
  };

  if (!isOpen) return null;

  return (
    <aside
      id="document-checklist"
      className="bt-checklist bt-checklist-drawer animate-fadeIn"
      aria-labelledby="checklist-title"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 id="checklist-title" style={{ margin: 0, fontSize: '1.2rem' }}>My document checklist</h2>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700, color: 'var(--muted)', padding: '4px' }}
          aria-label="Close checklist"
        >
          ✕
        </button>
      </div>

      <p className="bt-small" style={{ marginBottom: '0.75rem' }}>
        A general preparation list. Check official requirements for your programme.
      </p>

      <label htmlFor="document-progress" id="progress-text" className="bt-small">
        {completedCount} of {total} preparation items ticked
      </label>
      <progress
        id="document-progress"
        className="bt-progress"
        max={total}
        value={completedCount}
      >
        {completedCount} of {total}
      </progress>

      <div className="bt-checkitems">
        {items.map((item) => (
          <label key={item.id} className="bt-checkrow" htmlFor={`doc-${item.id}`}>
            <input
              type="checkbox"
              id={`doc-${item.id}`}
              checked={checked[item.id]}
              onChange={(event) => toggle(item.id, event.target.checked)}
            />
            <span>{item.text}</span>
          </label>
        ))}
      </div>

      <p id="save-status" className="bt-small" role="status" aria-live="polite">
        {statusMessage}
      </p>
      <button className="bt-link-button" type="button" onClick={handleReset}>
        Reset checklist
      </button>

      <div className="bt-storage" style={{ marginTop: '12px' }}>
        <p className="bt-small">
          Privacy: choices are saved locally in this browser.
        </p>
      </div>
    </aside>
  );
}
