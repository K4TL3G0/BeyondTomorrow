# 12. APS calculator and subject memory

Status: **Proposed**. Written Saturday 24 October 2026.
Read with: `11_GAP_ANALYSIS_AND_TRACKING_PLAN.md`. SQL: `db/08_subjects_and_marks.sql`.
Caveat: this is based on the repo audit summary (the calculator and profile were not read by me directly), so check the subject list and the hook names against the real code.

---

## 1. Short answer

- **The APS calculator stays, in a supporting role.** It is useful, but not our differentiator (several free calculators already exist, and sources disagree on university rules). Its job here is to be the **one place a student enters subjects and marks**, which then feeds Profile, Pathways, Resources and the what-if.
- **"Memory of selected subjects" = rows in `student_marks`**, one per subject, with the mark allowed to be empty. No new table.
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
| Last change time | Yes | `student_marks.updated_at` (new) |
| Grade (11, 12, completed) | Yes | `student_profiles.grade` (06) |
| APS result per institution | **No** | recomputed on demand |
| Which institution the student is comparing | No (UI state) | optional URL parameter |
| "Which marks are these?" (term, prelim, final) | **Not in the MVP** | the optional `period` column in `06` stays off; show a note "update these as your marks change" |

## 4. Data contract: subject codes

- **Codes** are our identifiers: capital letters only, 2 to 10 characters (the API validates `^[A-Z]{2,10}$`). Existing codes (`MATH`, `MATHLIT`, `PHSC`, `ENGHL`, `LO` and so on) do not change.
- `08_subjects_and_marks.sql` adds Technical Mathematics and Sciences, all official home and first-additional languages as listed, and further electives. **Cross-check the names against the Department of Basic Education's NSC subject list** and add any subject the calculator has that is missing.
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

## 5. Persistence behaviour (the `useStudentMarks` hook)

One hook used by the Calculator, Profile, Pathways and Resources. Do not keep separate copies of the subject state.

| Method | Behaviour |
|---|---|
| `load()` | `student_marks` joined to `subjects(code, name)` for the signed-in student; also loads the `subjects` map `code -> id` once (public read) |
| `ensureProfile()` | Before the first write, upsert `{ id: userId }` into `student_profiles` with "ignore duplicates". Without it, writes fail on the foreign key if onboarding was skipped |
| `setSelected(codes)` | Diff against the saved rows: insert new subjects with `mark = null`; delete removed ones |
| `setMark(code, mark)` | Upsert on `(student_id, subject_id)`; accept an integer 0 to 100 or empty (null); round and reject anything else before it leaves the browser |
| Autosave | Debounce about 600 ms; show "Saved at hh:mm" or a clear error with a retry button. The Save button must give feedback, never a silent change |
| Offline or failed save | Keep the values in React state, mark them "not saved", retry on the next change |
| `clearAll()` | "Remove my marks" button (deletes the student's rows) |

Writes use the existing owner-only policy (`own rows`). No new policy is needed.

## 6. How each page uses it

| Page | Use |
|---|---|
| **APS Calculator** | Prefills subjects and marks on load; autosaves; shows the selection warnings; institution results are computed from saved marks and the institution's rule (static data) and labelled **"estimate"** |
| **Profile** | Shows subject chips from the same hook (read-only, with "edit in the calculator"); the completeness score counts subjects with marks |
| **Pathways and what-if** | Reads saved marks (for example Mathematics) instead of the defaults; if there are none, label the page "sample student" |
| **Resources** | Highlights the student's subjects first ("Your subjects") |
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
| Run `db/08_subjects_and_marks.sql` after `06`; cross-check the added subject names | Daniel | S |
| Compare the calculator's subject list with the database: list any missing codes | Daniel | S |
| `SUBJECT_CATALOG` and `validateSubjectSelection` with tests | Jeremie and Andile | M |
| `useStudentMarks` hook (load, ensureProfile, setSelected, setMark, autosave, clearAll) | Jeremie and Andile with Blessing and Katlego | M |
| Wire Calculator, Profile, Resources to the hook; remove their local copies of subject state | Blessing and Katlego | M |
| Pathways reads saved marks; label sample data when none | Blessing and Katlego | S |
| Institution rule records and the verification table | Daniel and pitch lead | M to L |

## 10. Acceptance tests

1. Select subjects (no marks), sign out and in on another browser: the same subjects appear.
2. Enter marks, reload: marks present; "Saved at" shows.
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
