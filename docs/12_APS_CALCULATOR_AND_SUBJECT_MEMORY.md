# 12. APS calculator and subject memory

Status: **Partially implemented**. The APS calculator loads and explicitly saves a signed-in student's subjects, marks, and counted choices; the Profile page reads those saved subjects and marks. Run `db/10_aps_calculator_persistence.sql` after `db/08_subjects_and_marks.sql` to enable the calculator's atomic save operation and complete its subject catalog.
Read with: `11_GAP_ANALYSIS_AND_TRACKING_PLAN.md`.

---

## 1. Short answer

- **The APS calculator stays, in a supporting role.** It is useful, but not our differentiator (several free calculators already exist, and sources disagree on university rules). Its job here is to be the **one place a student enters subjects and marks**, which then feeds Profile, Pathways, Resources and the what-if.
- **"Memory of selected subjects" = rows in `student_marks`**, one per subject, with the mark allowed to be empty. The `counted` choice is saved too. No new table.
- **Results are not stored.** An APS score can always be recomputed from saved marks plus the institution's rule, so storing it would only create stale numbers.

## 2. What is wrong today (from the audit and the live schema)

| Problem | Evidence |
|---|---|
| Calculator does not save marks | Audit: marks are not written to `student_marks` |
| Profile's selected subjects are UI state only | Audit: Save changes temporary state |
| A subject cannot be saved without a mark | Live schema: `student_marks.mark` is `NOT NULL` |
| The database knows only 18 subjects | `02_seed.sql`. The calculator probably lists more (all home languages, technical and arts subjects), and an unknown subject cannot be saved because of the foreign key |
| Two sources of truth for subjects | Calculator list, Profile list, and the database list may differ |

## 3. Design

### One source of truth
```
SUBJECT_CATALOG (engine, typed)  ──seeds──▶  subjects table (code, name)
        │                                          │
        └──── used by the calculator, Profile,     └── student_marks (student_id, subject_id, mark nullable)
              Resources, Pathways, validation
```

### What is stored and what is not
| Item | Stored? | Where |
|---|---|---|
| Which subjects the student takes | Yes | a `student_marks` row per subject |
| Marks (0 to 100, whole numbers) | Yes | `student_marks.mark`, may be empty |
| Whether the subject counts in the general APS total | Yes | `student_marks.counted` |
| Last change time | Yes | `student_marks.updated_at` (new) |
| Grade (11, 12, completed) | Yes | `student_profiles.grade` (06) |
| APS result per institution | **No** | recomputed on demand |
| Which institution the student is comparing | No (UI state) | optional URL parameter |
| "Which marks are these?" (term, prelim, final) | **Not in the MVP** | the optional `period` column in `06` stays off; show a note "update these as your marks change" |

## 4. Data contract: subject codes

- **Codes** are our identifiers: capital letters only, 2 to 10 characters (the API validates `^[A-Z]{2,10}$`). Existing codes (`MATH`, `MATHLIT`, `PHSC`, `ENGHL`, `LO` and so on) do not change.
- `08_subjects_and_marks.sql` and `10_aps_calculator_persistence.sql` seed the subjects offered by the calculator. **Cross-check the names against the Department of Basic Education's NSC subject list** before relying on this list as official.
- The calculator must use `code`, never a display name, as the key.

### Engine: `subjects.ts` (new, typed catalog and validation)

```ts
export type SubjectKind = 'lang_hl' | 'lang_fal' | 'maths' | 'life_orientation' | 'elective';
export interface SubjectInfo { code: string; name: string; kind: SubjectKind; group: string }  // group for UI sections
export const SUBJECT_CATALOG: SubjectInfo[] = [ /* one entry per code in subjects */ ];

export function validateSubjectSelection(codes: string[]): { errors: string[]; warnings: string[] };
```

`validateSubjectSelection` (pure, with tests):

| Result | Rule |
|---|---|
| **error** | An unknown code; a duplicate code; more than one of Mathematics, Mathematical Literacy and Technical Mathematics |
| **warning** | No mathematics-type subject; no Life Orientation; fewer than two language subjects, or no Home Language; fewer than 7 subjects selected |

These rules reflect the general NSC structure (two languages with at least one at Home Language level, one mathematics-type subject, Life Orientation, seven subjects in total). **Verify them against the DBE's current NSC requirements** before showing them as advice. Errors block "Calculate"; warnings only inform.

## 5. Persistence behaviour

One hook used by the Calculator, Profile, Pathways and Resources. Do not keep separate copies of the subject state.

| Method | Behaviour |
|---|---|
| Load | The calculator reads the signed-in student's `student_marks`, joined to `subjects(code, name)`, and prefills the rows |
| Save | An explicit Save button sends subject codes, marks (nullable), and counted choices to `save_student_marks(jsonb)` |
| Atomicity | The database function validates input, creates a profile row if needed, and synchronizes marks in one transaction under the existing owner-only RLS policies |
| Empty save | Saving an empty subject list removes the user's saved marks; the UI confirms this if saved subjects exist |
| Scores | APS totals are recalculated from the current marks; no APS result is persisted |
| Errors | Load and save failures are shown to the student; unsaved calculator rows remain on screen |

Writes use the existing owner-only policy (`own rows`). No new policy is needed.

## 6. How each page uses it

| Page | Use |
|---|---|
| **APS Calculator** | Prefills saved subjects and marks; explicitly saves changes; recalculates totals from the current rows |
| **Profile** | Reads and displays saved subjects and marks, with an "edit in the calculator" link |
| **Pathways and what-if** | Uses saved counted marks and Mathematics where available; clearly labels sample inputs and estimates |
| **Resources** | Shows saved subjects and marks first, with links to matching resource pages when available |
| **Funding** | Shows an informational average of saved marked subjects; it does not infer funding eligibility from that average |
| **Coach** | Does not need marks; only the income bracket and household answers |
| **Events** | Log `aps_calculated` with no payload when the student presses Calculate |

## 7. Institution rules (static data, but verified)

The calculator's institution rules stay in typed files, but each rule needs a record like this:

```ts
interface InstitutionApsRule {
  code: string;                 // e.g. matches institutions.aps_method_code when it exists
  name: string;
  scale: string;                // description of the scale the institution uses
  subjectsCounted: string;      // e.g. "best six excluding Life Orientation"
  lifeOrientation: string;      // how Life Orientation is treated
  bonusRules: string | null;
  maxScore: number | null;
  sourceUrl: string;            // the institution's OWN page
  lastVerified: string;         // ISO date
  verification: 'official' | 'secondary' | 'conflict';
}
```

Why: when I compared sources earlier, third-party sites disagreed about how Wits, UJ and UFS treat Life Orientation, and about maximum scores. Rules:

- Copy each rule from the institution's **own current page**, and record the URL and date.
- Show a verified badge only for `official`. Show other institutions as "unverified estimate", or hide them.
- Never claim coverage of "all universities".

Verification table for Daniel and the pitch lead:

| Institution | Official page URL | Subjects counted | Life Orientation rule | Scale and maximum | Verified by | Date |
|---|---|---|---|---|---|---|
| (one row per institution the calculator shows) | | | | | | |

## 8. Privacy

Marks of minors are personal information. We store only subject codes and marks (no school name, no ID numbers, no images). The student can delete everything with one button. Show "We only keep your subjects and marks" beside the Save indicator.

## 9. Tasks

| Task | Owner | Size |
|---|---|---|
| Run `db/10_aps_calculator_persistence.sql` after `08` in Supabase | Database owner | S |
| Cross-check calculator subject names against current DBE requirements | Database owner | S |
| `SUBJECT_CATALOG` and `validateSubjectSelection` with tests | Jeremie and Andile | M |
| Extend personalized subject data to any new study-planning surfaces | Product team | S |
| Institution rule records and the verification table | Daniel and pitch lead | M to L |

## 10. Acceptance tests

1. Select subjects (no marks), sign out and in on another browser: the same subjects appear.
2. Enter marks and counted choices, save, then reload: rows are restored and APS is recalculated.
3. Enter 101, -3 or 72.5: rejected in the UI before sending; the database also refuses 101.
4. Choose Mathematics and Mathematical Literacy together: error shown and Calculate disabled.
5. Choose six subjects: warning appears, calculation still allowed.
6. A second test user cannot read or change the first user's rows (existing RLS tests).
7. Network tab shows only subject ids, marks and the user id, nothing else.
8. Pressing Save with no network shows an error and keeps the values on screen.

## 11. Open questions

| # | Question | Default |
|---|---|---|
| Q24 | Do we need marks over time (term, prelim, final)? | No for the MVP; keep the `period` option off |
| Q25 | Which institutions does the calculator show, and who verifies each? | Only those verified from official pages |
| Q26 | Are languages other than the official eleven needed? | No; add on request |
| Q27 | Should the calculator work for logged-out users? | Yes, as a try-it mode that saves nothing and invites sign-in |
