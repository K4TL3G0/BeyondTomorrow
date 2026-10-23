import { LEVELS } from '@beyond-tomorrow/engine';

export function ApsExplainer() {
  return (
    <div className="aps-explainer">
      <h2>What is an APS?</h2>
      <p>
        Your Admission Point Score (APS) turns your matric marks into a single number. Universities use it to
        compare applicants, and many set a minimum APS for each programme. Each subject mark is converted to a
        level from 1 to 7, and the levels are added up.
      </p>

      <table className="aps-table aps-levels">
        <thead>
          <tr>
            <th>Mark</th>
            <th>APS points</th>
            <th>Achievement level</th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((level) => (
            <tr key={level.level}>
              <td>
                {level.minMark}–{level.maxMark === 100 ? 100 : Math.floor(level.maxMark)}%
              </td>
              <td>{level.points}</td>
              <td>{level.level}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>How it is used</h3>
      <ul>
        <li>
          <strong>Meeting a programme’s minimum.</strong> A programme might ask for an APS of 30. If your
          score is below that, your application is usually not considered, even if you pass matric.
        </li>
        <li>
          <strong>Ranking applicants.</strong> Popular programmes receive more qualified applicants than they
          have places, so a higher APS improves your chances.
        </li>
        <li>
          <strong>Choosing where to apply.</strong> Compare your score with the requirements of each
          programme before you apply, and include a few where you comfortably qualify.
        </li>
      </ul>

      <h3>Example</h3>
      <p>
        Marks of 82, 71, 65, 58, 54 and 47 give 7 + 6 + 5 + 4 + 4 + 3 = <strong>29 points</strong>.
      </p>

      <h3>Things to know</h3>
      <ul>
        <li>
          Universities do not all calculate APS the same way. Most count your best six subjects and leave out
          Life Orientation, but some use different point scales, count Life Orientation, or weight subjects
          like Mathematics. Tick institutions below to see each one’s method.
        </li>
        <li>
          Programmes can also ask for specific subjects and minimum marks in them, for example Mathematics
          for engineering, on top of the APS.
        </li>
        <li>
          Your APS is an estimate. Meeting the minimum does not guarantee a place. Check the official source
          for each institution.
        </li>
        <li>
          The Count tickbox controls which subjects are added in the general total. Life Orientation is
          unticked by default.
        </li>
      </ul>
    </div>
  );
}
