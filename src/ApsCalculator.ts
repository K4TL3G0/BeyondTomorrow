// main.ts - DOM wiring. Replaces the <script> block in the HTML page.
import { calculateAps, isValidMark, type SubjectEntry } from "./aps.js";

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const rowsEl = byId<HTMLDivElement>("rows");
const outEl = byId<HTMLTableSectionElement>("out");
const errEl = byId<HTMLDivElement>("err");
const totalEl = byId<HTMLSpanElement>("total");
const metaEl = byId<HTMLSpanElement>("meta");

interface RowRefs {
  name: HTMLInputElement;
  mark: HTMLInputElement;
  count: HTMLInputElement;
}
const rows = new Map<HTMLDivElement, RowRefs>();

function addRow(name = "", mark = "", counted = true): HTMLInputElement {
  const row = document.createElement("div");
  row.className = "row";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Subject";
  nameInput.setAttribute("list", "subs");
  nameInput.value = name;
  nameInput.setAttribute("aria-label", "Subject name");

  const markInput = document.createElement("input");
  markInput.type = "number";
  markInput.min = "0";
  markInput.max = "100";
  markInput.step = "1";
  markInput.inputMode = "numeric";
  markInput.placeholder = "%";
  markInput.value = mark;
  markInput.setAttribute("aria-label", "Mark percentage");

  const label = document.createElement("label");
  label.className = "cnt";
  const countInput = document.createElement("input");
  countInput.type = "checkbox";
  countInput.checked = counted;
  label.append(countInput, document.createTextNode("Count"));

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "x";
  removeBtn.textContent = "✕";
  removeBtn.setAttribute("aria-label", "Remove subject");

  row.append(nameInput, markInput, label, removeBtn);
  rowsEl.appendChild(row);
  rows.set(row, { name: nameInput, mark: markInput, count: countInput });

  let touched = false;
  nameInput.addEventListener("input", () => {
    if (/life\s*orientation/i.test(nameInput.value) && !touched) {
      countInput.checked = false;
    }
    update();
  });
  countInput.addEventListener("change", () => {
    touched = true;
    update();
  });
  markInput.addEventListener("input", update);
  removeBtn.addEventListener("click", () => {
    rows.delete(row);
    row.remove();
    update();
  });

  return nameInput;
}

function cell(text: string | number): HTMLTableCellElement {
  const td = document.createElement("td");
  td.textContent = String(text);
  return td;
}

function update(): void {
  outEl.textContent = "";
  errEl.textContent = "";

  const entries: SubjectEntry[] = [];
  let hasInvalid = false;

  rows.forEach((refs) => {
    if (refs.mark.value === "") return; // ignore empty rows
    const percent = parseFloat(refs.mark.value);

    if (!isValidMark(percent)) {
      hasInvalid = true;
      refs.mark.setAttribute("aria-invalid", "true");
      return;
    }
    refs.mark.removeAttribute("aria-invalid");

    entries.push({
      name: refs.name.value.trim() || "Subject",
      percent,
      counted: refs.count.checked,
    });
  });

  if (hasInvalid) errEl.textContent = "Marks must be between 0 and 100.";

  const result = calculateAps(entries);

  for (const r of result.breakdown) {
    const tr = document.createElement("tr");
    if (!r.counted) tr.style.opacity = ".55";
    tr.append(
      cell(r.name + (r.counted ? "" : " (not counted)")),
      cell(`${r.percent}%`),
      cell(r.aps),
      cell(r.level),
    );
    outEl.appendChild(tr);
  }

  totalEl.textContent = String(result.total);
  const n = result.countedSubjects;
  metaEl.textContent = `APS points from ${n} subject${n === 1 ? "" : "s"}`;
}

byId<HTMLButtonElement>("add").addEventListener("click", () => addRow().focus());

byId<HTMLButtonElement>("reset").addEventListener("click", () => {
  rows.clear();
  rowsEl.textContent = "";
  for (let i = 0; i < 7; i++) addRow();
  update();
});

// Initial rows
["Home Language", "First Additional Language", "Mathematics", "Life Orientation"].forEach((s) =>
  addRow(s, "", !/life/i.test(s)),
);
addRow();
addRow();
addRow();
update();