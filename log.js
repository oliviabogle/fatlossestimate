/**
 * log.js
 * Handles building and reading the daily log input table.
 */

/**
 * Returns a short date label like "Mon 6/23".
 * @param {number} daysAgo - 0 = today, 1 = yesterday, etc.
 * @returns {string}
 */
function getDayLabel(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

/**
 * Renders the initial 7-day log rows into #logBody.
 * Called once on page load.
 */
export function initLog() {
  const body = document.getElementById('logBody');
  body.innerHTML = '';
  // Row 0 = 6 days ago, row 6 = today
  for (let i = 6; i >= 0; i--) {
    appendRow(body, getDayLabel(i));
  }
}

/**
 * Appends a single blank log row to the table.
 * @param {HTMLElement} body - The #logBody container
 * @param {string} label     - Day label text
 */
function appendRow(body, label) {
  const row = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML = `
    <div class="day-label">${label}</div>
    <input type="number" class="cal-in"  placeholder="e.g. 1800" min="0" />
    <input type="number" class="steps"   placeholder="e.g. 8000" min="0" />
    <input type="number" class="ex-cal"  placeholder="e.g. 0"    min="0" />
  `;
  body.appendChild(row);
}

/**
 * Reads all filled-in rows from the log table.
 * Skips rows where both calIn and steps are 0 (blank rows).
 *
 * @returns {Array<{calIn: number, steps: number, exCal: number}>}
 */
export function readLog() {
  const rows = document.querySelectorAll('#logBody .log-row');
  const entries = [];
  rows.forEach(row => {
    const calIn = parseFloat(row.querySelector('.cal-in').value)  || 0;
    const steps = parseFloat(row.querySelector('.steps').value)   || 0;
    const exCal = parseFloat(row.querySelector('.ex-cal').value)  || 0;
    if (calIn === 0 && steps === 0) return;
    entries.push({ calIn, steps, exCal });
  });
  return entries;
}
