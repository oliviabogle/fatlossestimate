/**
 * constants.js
 * Shared numeric constants used throughout the calculator.
 * Centralised here so they're easy to find and audit.
 */

/** Kilocalories stored in one pound of body fat. Clinical approximation. */
export const FAT_KCAL_PER_LB = 3500;

/** Sedentary activity multiplier applied to BMR as the base TDEE.
 *  We use 1.2 (sedentary) rather than a higher multiplier because
 *  step-based NEAT is added separately — using a higher multiplier
 *  AND counting steps would double-count light daily movement. */
export const SEDENTARY_MULTIPLIER = 1.2;

/** Kcal burned per step at a reference body weight of 150 lbs.
 *  Scaled linearly with actual body weight in the NEAT formula. */
export const KCAL_PER_STEP_AT_150LB = 0.04;

/** Reference body weight used for step-calorie scaling, in lbs. */
export const STEP_REFERENCE_WEIGHT_LBS = 150;

/** Pounds → kilograms conversion factor. */
export const LBS_TO_KG = 0.453592;

/** Inches → centimetres conversion factor. */
export const IN_TO_CM = 2.54;
