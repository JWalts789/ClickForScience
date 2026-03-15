import { Decimal } from "./decimal";
import type { DecimalSource } from "./decimal";

export type Notation = "scientific" | "engineering" | "standard" | "letters";

const STANDARD_SUFFIXES = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "UDc",
  "DDc",
  "TDc",
  "QaDc",
  "QiDc",
  "SxDc",
  "SpDc",
  "OcDc",
  "NoDc",
  "Vg",
];

function formatStandard(value: Decimal): string {
  const exp = value.log10().floor().toNumber();
  const tier = Math.floor(exp / 3);
  if (tier < STANDARD_SUFFIXES.length) {
    const divisor = Decimal.pow(10, tier * 3);
    const mantissa = value.div(divisor).toNumber();
    const suffix = STANDARD_SUFFIXES[tier];
    return tier === 0
      ? mantissa.toFixed(1)
      : `${mantissa.toFixed(2)} ${suffix}`.trim();
  }
  return value.toExponential(2);
}

function formatEngineering(value: Decimal): string {
  const exp = Math.floor(value.log10().toNumber() / 3) * 3;
  const mantissa = value.div(Decimal.pow(10, exp)).toNumber();
  return `${mantissa.toFixed(2)}e${exp}`;
}

function formatLetters(value: Decimal): string {
  const exp = value.log10().floor().toNumber();
  const tier = Math.floor(exp / 3);
  if (tier <= 0) return value.toFixed(value.lt(10) ? 1 : 0);

  const divisor = Decimal.pow(10, tier * 3);
  const mantissa = value.div(divisor).toNumber();

  // Generate letter suffix: 1=a, 2=b, ..., 26=z, 27=aa, 28=ab...
  let suffix = "";
  let t = tier;
  while (t > 0) {
    t--;
    suffix = String.fromCharCode(97 + (t % 26)) + suffix;
    t = Math.floor(t / 26);
  }
  return `${mantissa.toFixed(2)}${suffix}`;
}

/**
 * Format a Decimal value for display using the chosen notation.
 */
export function formatNumber(
  value: DecimalSource,
  notation: Notation = "standard"
): string {
  const d = new Decimal(value);

  if (d.lt(0)) return `-${formatNumber(d.neg(), notation)}`;
  if (d.eq(0)) return "0";
  if (d.lt(1000)) {
    const n = d.toNumber();
    if (n < 10) return n.toFixed(2);
    if (n < 100) return n.toFixed(1);
    return n.toFixed(1);
  }

  switch (notation) {
    case "scientific":
      return d.toExponential(2);
    case "engineering":
      return formatEngineering(d);
    case "letters":
      return formatLetters(d);
    case "standard":
    default:
      return formatStandard(d);
  }
}

/**
 * Format RP specifically (with "/sec" suffix option).
 */
export function formatRP(
  value: DecimalSource,
  notation: Notation = "standard"
): string {
  return formatNumber(value, notation);
}

/**
 * Format a rate (per second).
 */
export function formatRate(
  value: DecimalSource,
  notation: Notation = "standard"
): string {
  return `${formatNumber(value, notation)}/s`;
}

/**
 * Format a cost with a "can afford" check.
 */
export function formatCost(
  cost: DecimalSource,
  notation: Notation = "standard"
): string {
  return formatNumber(cost, notation);
}

/**
 * Format a multiplier for display.
 */
export function formatMultiplier(value: DecimalSource): string {
  const d = new Decimal(value);
  if (d.lt(1000)) return `x${d.toNumber().toFixed(2)}`;
  return `x${formatNumber(d)}`;
}

/**
 * Format a percentage.
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
