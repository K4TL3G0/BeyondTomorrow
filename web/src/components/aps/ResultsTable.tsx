import type { BreakdownRow } from '@beyond-tomorrow/engine';

export function ResultsTable({ breakdown }: { breakdown: BreakdownRow[] }) {
  return (
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
        {breakdown.map((r, i) => (
          <tr key={i} className={r.counted ? undefined : 'aps-dim'}>
            <td>{r.name + (r.counted ? '' : ' (not counted)')}</td>
            <td>{r.percent}%</td>
            <td>{r.aps}</td>
            <td>{r.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
