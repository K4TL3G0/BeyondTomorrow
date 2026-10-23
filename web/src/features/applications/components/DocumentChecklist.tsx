import { useDocumentChecklist } from '../hooks/useDocumentChecklist';

export function DocumentChecklist() {
  const { items, checked, completedCount, total, statusMessage, toggle, reset } =
    useDocumentChecklist();

  const handleReset = () => {
    if (!window.confirm('Clear all document checklist ticks in this browser?')) return;
    reset();
  };

  return (
    <aside
      id="document-checklist"
      className="bt-checklist"
      aria-labelledby="checklist-title"
    >
      <h2 id="checklist-title">My document checklist</h2>
      <p className="bt-small">
        A general preparation list. Check the official requirements for your programme and applicant category.
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

      <div className="bt-storage">
        <p className="bt-small">
          Privacy: this page stores only checkbox choices in this browser. It does
          not upload documents or submit applications. Other people using this
          browser profile may see your checklist. Clearing browser data may remove
          it.
        </p>
      </div>
    </aside>
  );
}