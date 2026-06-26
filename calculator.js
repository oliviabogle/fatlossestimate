/**
 * calculator.js
 * Core science and math for the Fat Loss Tracker.
 *
 * Formulas used:
 *   - Mifflin-St Jeor for Basal Metabolic Rate (BMR)
 *   - Weight-adjusted NEAT estimation from step count
 *   - Sedentary activity multiplier (1.2) as the base, since steps
 *     are already accounted for separately to avoid double-counting
 *   - 3,500 kcal per pound of body fat (established clinical approximation)
 */

const FAT_KCAL_PER_LB = 3500;

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 * Inputs are converted to metric internally.
 *
 * @param {number} weightLbs - Body weight in pounds
 * @param {number} heightIn  - Height in inches
 * @param {number} age       - Age in years
 * @param {'male'|'female'} sex
 * @returns {number} BMR in kcal/day
 */
export function calcBMR(weightLbs, heightIn, age, sex) {
  const kg = weightLbs * 0.453592;
  const cm = heightIn * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Estimates Non-Exercise Activity Thermogenesis (NEAT) from step count.
 * Uses a weight-adjusted coefficient: ~0.04 kcal/step at 150 lbs, scaled
 * linearly with body weight.
 *
 * @param {number} steps      - Daily step count
 * @param {number} weightLbs  - Body weight in pounds
 * @returns {number} Estimated kcal burned from steps
 */
export function stepsToKcal(steps, weightLbs) {
  return steps * (weightLbs / 150) * 0.04;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * Uses sedentary multiplier (1.2) on BMR as the base,
 * then adds step-based NEAT and logged exercise separately.
 *
 * @param {number} bmr          - Basal Metabolic Rate in kcal
 * @param {number} stepsKcal    - NEAT from steps in kcal
 * @param {number} exerciseKcal - Exercise calories from MFP log
 * @returns {number} Total daily energy expenditure in kcal
 */
export function calcTDEE(bmr, stepsKcal, exerciseKcal) {
  return bmr * 1.2 + stepsKcal + exerciseKcal;
}

/**
 * Processes an array of daily log entries and returns all stats needed for display.
 *
 * @param {Array<{calIn: number, steps: number, exCal: number}>} entries
 * @param {number} weightLbs
 * @param {number} heightIn
 * @param {number} age
 * @param {'male'|'female'} sex
 * @returns {Object} Computed stats object
 */
export function processLog(entries, weightLbs, heightIn, age, sex) {
  const bmr = calcBMR(weightLbs, heightIn, age, sex);

  const days = entries
    .filter(e => e.calIn > 0 || e.steps > 0)
    .map(e => {
      const stepsKcal = stepsToKcal(e.steps, weightLbs);
      const tdee      = calcTDEE(bmr, stepsKcal, e.exCal);
      const deficit   = tdee - e.calIn;
      return { ...e, stepsKcal, tdee, deficit };
    });

  if (days.length === 0) return null;

  const n            = days.length;
  const avgDeficit   = days.reduce((s, d) => s + d.deficit, 0) / n;
  const avgIn        = days.reduce((s, d) => s + d.calIn, 0) / n;
  const avgOut       = days.reduce((s, d) => s + d.tdee, 0) / n;
  const avgStepsKcal = days.reduce((s, d) => s + d.stepsKcal, 0) / n;
  const avgExKcal    = days.reduce((s, d) => s + d.exCal, 0) / n;
  const avgSteps     = days.reduce((s, d) => s + d.steps, 0) / n;

  const fatLbs7  = (avgDeficit * 7)  / FAT_KCAL_PER_LB;
  const fatLbs30 = (avgDeficit * 30) / FAT_KCAL_PER_LB;

  return {
    bmr,
    days,
    avgDeficit,
    avgIn,
    avgOut,
    avgStepsKcal,
    avgExKcal,
    avgSteps,
    fatLbs7,
    fatLbs30,
    fatPerDay: avgDeficit / FAT_KCAL_PER_LB,
  };
}

/**
 * Converts a fat value in pounds to the display unit.
 *
 * @param {number} lbs
 * @param {'lbs'|'kg'} unit
 * @returns {string}
 */
export function formatFat(lbs, unit) {
  if (unit === 'kg') return (lbs * 0.453592).toFixed(2) + ' kg';
  return lbs.toFixed(2) + ' lbs';
}
