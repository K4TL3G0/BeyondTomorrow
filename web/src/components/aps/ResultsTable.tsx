import type { ApsBreakdownRow } from '../../lib/useApsCalculator';

export function ResultsTable({ breakdown }: { breakdown: ApsBreakdownRow[] }) {
  if (breakdown.length === 0) return <p className="muted">Enter a subject and mark to see the breakdown.</p>;

  return (
    <div className="aps-table-wrap">
      <table className="aps-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Mark</th>
            <th>APS</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((row, index) => (
            <tr key={`${row.name}-${index}`} className={row.counted ? undefined : 'aps-dim'}>
              <td>{row.name}{row.reason ? ` (${row.reason})` : ''}</td>
              <td>{row.percent}%</td>
              <td>{row.aps}</td>
              <td>{row.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
