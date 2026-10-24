# Data curation guide (Daniel)

Wrong data in a funding and admissions tool harms students. Rules:
1. Every course, institution, funding and resource row has `source_url` and `last_verified`.
2. Copy requirements and APS methods from the institution's **published** page. Do not guess.
3. Start with 2 or 3 institutions and a handful of courses. Small and accurate beats large and wrong.
4. NSFAS: income thresholds and deadlines must be checked on nsfas.org.za. Sources have conflicted on closing dates.
5. Remove all `SAMPLE DATA` rows before the real demo.
6. Link only to official domains. Fake NSFAS and bursary links are a known scam risk.

The APS calculator's 2027 qualification matcher uses the supplied UP and Stellenbosch workbook data in
`web/src/data/qualificationWorkbook.json`, plus the separately curated Wits, NWU, and UFS entries in
`web/src/data/qualifications.ts`. It compares institution-specific APS totals and subject thresholds;
Stellenbosch aggregate thresholds use the average of the student's six highest non-Life-Orientation marks.
Rows flagged for checking, and rows with unsupported or missing requirements, are not shown as matches.
Meeting these listed thresholds does not guarantee admission, and extra selection requirements may still apply.
