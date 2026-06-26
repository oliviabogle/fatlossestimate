/**
 * main.js
 * Entry point. Wires the UI controls to the calculator and renderer.
 * Import order: log → calculator → results.
 */

import { initLog, readLog }            from './log.js';
import { processLog }                  from './calculator.js';
import { renderResults, renderProjection } from './results.js';

// The last computed stats object, kept in module scope so the
// projection toggle can re-render without recalculating.
let currentStats = null;
let currentUnit  = 'lbs';

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initLog();
  bindUnitToggle();
  bindCalculateButton();
  bindProjectionToggle();
});

// ── Unit toggle ───────────────────────────────────────────────────────────────

function bindUnitToggle() {
  document.getElementById('units').addEventListener('change', function () {
    const isKg = this.value === 'kg';
    currentUnit = this.value;
    document.getElementById('wLabel').textContent = isKg ? 'Weight (kg)'   : 'Weight (lbs)';
    document.getElementById('hLabel').textContent = isKg ? 'Height (cm)'   : 'Height (inches)';
    document.getElementById('weight').placeholder = isKg ? '84'            : '185';
    document.getElementById('height').placeholder = isKg ? '178'           : '70';
  });
}

// ── Calculate ─────────────────────────────────────────────────────────────────

function bindCalculateButton() {
  document.getElementById('calcBtn').addEventListener('click', calculate);
}

function calculate() {
  const units  = document.getElementById('units').value;
  const isKg   = units === 'kg';
  const rawW   = parseFloat(document.getElementById('weight').value) || 0;
  const rawH   = parseFloat(document.getElementById('height').value) || 0;
  const age    = parseFloat(document.getElementById('age').value)    || 30;
  const sex    = document.getElementById('sex').value;

  if (!rawW || !rawH) {
    alert('Enter your weight and height to continue.');
    return;
  }

  // Normalise to lbs / inches for the calculator module
  const weightLbs = isKg ? rawW / 0.453592 : rawW;
  const heightIn  = isKg ? rawH / 2.54      : rawH;

  const entries = readLog();
  if (entries.length === 0) {
    alert('Fill in at least one day of data before calculating.');
    return;
  }

  const stats = processLog(entries, weightLbs, heightIn, age, sex);
  if (!stats) return;

  currentStats = stats;
  currentUnit  = units;

  renderResults(stats, units);
}

// ── Projection toggle ─────────────────────────────────────────────────────────

function bindProjectionToggle() {
  document.getElementById('p7btn').addEventListener('click',  () => switchProjection(7));
  document.getElementById('p30btn').addEventListener('click', () => switchProjection(30));
}

function switchProjection(days) {
  if (!currentStats) return;
  renderProjection(currentStats, currentUnit, days);
}
