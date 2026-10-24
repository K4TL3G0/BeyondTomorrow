import { APS_LEVELS } from '../../lib/apsLevels';

export function ApsExplainer() {
  return (
    <div className="aps-explainer">
      <div className="aps-explainer-col">
        <h2>What is an APS?</h2>
        <p>
          Your Admission Point Score (APS) turns your matric marks into points. This general estimate uses the
          seven-point achievement scale and adds every selected subject.
        </p>

        <div className="aps-table-wrap">
          <table className="aps-table aps-levels">
            <thead>
              <tr>
                <th>Mark</th>
                <th>APS points</th>
                <th>Achievement level</th>
              </tr>
            </thead>
            <tbody>
              {APS_LEVELS.map((level) => (
                <tr key={level.level}>
                  <td>{level.minMark}–{level.maxMark}%</td>
                  <td>{level.points}</td>
                  <td>{level.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="aps-explainer-col">
        <h3>Things to know</h3>
        <ul>
          <li>
            Institutions can use different scales, count Life Orientation, or require specific subjects and marks.
            Compare estimates for selected institutions below, and confirm programme requirements with the institution.
          </li>
          <li>
            Life Orientation is a required subject and is excluded from the general estimate by default. English is
            automatically set as a first additional language unless you choose English Home Language. Institutional
            estimates apply each institution&apos;s own subject rules.
          </li>
          <li>Meeting an APS minimum does not guarantee admission. Confirm all requirements with the institution.</li>
        </ul>
      </div>
    </div>
  );
}
