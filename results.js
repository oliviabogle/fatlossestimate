/**
 * results.js
 * Takes a computed stats object from calculator.js and renders the results UI.
 * Keeps all DOM manipulation in one place, separate from the math.
 */

import { formatFat } from './calculator.js';

/**
 * Renders the full results panel given a stats object.
 *
 * @param {Object} stats  - Output from processLog()
 * @param {'lbs'|'kg'} unit
 */
export function renderResults(stats, unit) {
  const panel = document.getElementById('results');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  renderBigNumber(stats, unit);
  renderStatGrid(stats, unit);
  renderBreakdown(stats, unit);
  renderProjection(stats, unit, 7);
}

// ── Big number at the top ────────────────────────────────────────────────────

function renderBigNumber(stats, unit) {
  const { fatLbs7, avgDeficit } = stats;
  const positive = fatLbs7 >= 0;
  const display  = formatFat(Math.abs(fatLbs7), unit);

  document.getElementById('bigNum').textContent = display;
  document.getElementById('bigNum').className   = 'num ' + (positive ? 'v-green' : 'v-red');

  document.getElementById('bigSub').textContent = positive
    ? `You're in a real deficit of ~${Math.round(avgDeficit)} kcal/day. Fat loss is happening.`
    : `You're in a surplus of ~${Math.abs(Math.round(avgDeficit))} kcal/day. Tighten the deficit.`;
}

// ── 2×2 stat grid ───────────────────────────────────────────────────────────

function renderStatGrid(stats, unit) {
  const { avgIn, avgOut, avgDeficit, fatLbs30 } = stats;
  const positive = avgDeficit >= 0;
  const sign     = positive ? '−' : '+';

  document.getElementById('avgIn').textContent    = Math.round(avgIn) + ' kcal';
  document.getElementById('avgOut').textContent   = Math.round(avgOut) + ' kcal';

  const defEl = document.getElementById('avgDef');
  defEl.textContent = sign + Math.abs(Math.round(avgDeficit)) + ' kcal';
  defEl.className   = 'v ' + (positive ? 'v-green' : 'v-red');

  document.getElementById('monthFat').textContent = formatFat(Math.abs(fatLbs30), unit);
}

// ── How-we-got-there breakdown ───────────────────────────────────────────────

function renderBreakdown(stats, unit) {
  const { bmr, avgStepsKcal, avgExKcal, avgOut, avgIn, avgDeficit, fatLbs7, avgSteps } = stats;
  const positive = avgDeficit >= 0;

  const rows = [
    ['BMR (Mifflin-St Jeor)',                          Math.round(bmr) + ' kcal'],
    ['× Sedentary base (1.2)',                         Math.round(bmr * 1.2) + ' kcal'],
    [`+ NEAT from steps (~${Math.round(avgSteps).toLocaleString()}/day)`, '+' + Math.round(avgStepsKcal) + ' kcal'],
    ['+ Exercise logged (avg)',                         '+' + Math.round(avgExKcal) + ' kcal'],
    ['= Avg total burn (TDEE)',                        Math.round(avgOut) + ' kcal'],
    ['− Avg calories eaten',                           '−' + Math.round(avgIn) + ' kcal'],
    ['= Daily deficit',                                (positive ? '−' : '+') + Math.abs(Math.round(avgDeficit)) + ' kcal'],
    ['÷ 3,500 kcal/lb × 7',                           formatFat(Math.abs(fatLbs7), unit) + ' / week'],
  ];

  document.getElementById('breakdownRows').innerHTML = rows
    .map(([k, v]) => `<div class="breakdown-row"><span class="bk">${k}</span><span class="bv">${v}</span></div>`)
    .join('');
}

// ── Projection bar chart ─────────────────────────────────────────────────────

/**
 * Renders the projection bar chart for the given number of days.
 * Called on initial render and when the user toggles between 7 / 30.
 *
 * @param {Object} stats
 * @param {'lbs'|'kg'} unit
 * @param {7|30} days
 */
export function renderProjection(stats, unit, days) {
  document.getElementById('p7btn').className  = 'toggle-btn' + (days === 7  ? ' active' : '');
  document.getElementById('p30btn').className = 'toggle-btn' + (days === 30 ? ' active' : '');

  const { fatPerDay } = stats;
  const step   = days <= 7 ? 1 : 3;
  const points = [];
  for (let d = step; d <= days; d += step) points.push(d);

  const values = points.map(d => fatPerDay * d);
  const maxAbs = Math.max(...values.map(Math.abs), 0.01);

  document.getElementById('projChart').innerHTML = points.map((d, i) => {
    const v      = values[i];
    const pct    = (Math.abs(v) / maxAbs * 100).toFixed(1);
    const color  = v >= 0 ? 'var(--fill-success)' : 'var(--fill-danger)';
    const sign   = v < 0 ? '+' : '−';
    const label  = formatFat(Math.abs(v), unit);
    return `
      <div class="bar-row">
        <span class="bar-day">Day ${d}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <span class="bar-val" style="color:${color}">${sign}${label}</span>
      </div>`;
  }).join('');
}
