import { ProgramCode } from "../entities/Program";

/**
 * Base prices for each program (in NGN)
 */
export const PROGRAM_BASE_PRICES: Record<ProgramCode, number> = {
  [ProgramCode.RM]: 15000,
  [ProgramCode.RN]: 15000,
  [ProgramCode.RPHN]: 15000,
  [ProgramCode.SPECIALTY]: 20000,
};

/**
 * Default duration for program enrollment (in months)
 */
export const DEFAULT_ENROLLMENT_DURATION = 12;

/**
 * Multi-program discount structure
 * Key: number of programs, Value: discount percentage
 */
export const MULTI_PROGRAM_DISCOUNTS: Record<number, number> = {
  2: 10, // 10% off for 2 programs
  3: 15, // 15% off for 3 programs
  4: 20, // 20% off for 4 programs
};

/**
 * Calculate total price for program enrollments with discounts
 */
export function calculateTotalPrice(programCodes: ProgramCode[]): {
  subtotal: number;
  discount: number;
  total: number;
  discountPercentage: number;
} {
  // Calculate subtotal
  const subtotal = programCodes.reduce(
    (sum, code) => sum + (PROGRAM_BASE_PRICES[code] || 0),
    0
  );

  // Get discount percentage based on number of programs
  const discountPercentage = MULTI_PROGRAM_DISCOUNTS[programCodes.length] || 0;

  // Calculate discount amount
  const discount = Math.round((subtotal * discountPercentage) / 100);

  // Calculate final total
  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    discountPercentage,
  };
}

/**
 * Get price for a single program
 */
export function getProgramPrice(programCode: ProgramCode): number {
  return PROGRAM_BASE_PRICES[programCode] || 0;
}

/**
 * Convert price to kobo (for Paystack)
 */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert kobo to naira
 */
export function fromKobo(kobo: number): number {
  return kobo / 100;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Duration-based pricing options
 */
export interface DurationPricing {
  months: number;
  multiplier: number;
  label: string;
}

export const DURATION_OPTIONS: DurationPricing[] = [
  { months: 3, multiplier: 0.3, label: "3 Months" },
  { months: 6, multiplier: 0.55, label: "6 Months" },
  { months: 12, multiplier: 1.0, label: "1 Year" },
];

/**
 * Calculate price for a specific duration
 */
export function calculateDurationPrice(
  programCodes: ProgramCode[],
  months: number
): {
  subtotal: number;
  discount: number;
  total: number;
  discountPercentage: number;
} {
  const durationOption = DURATION_OPTIONS.find((d) => d.months === months);
  const multiplier = durationOption?.multiplier || 1.0;

  const basePrice = calculateTotalPrice(programCodes);

  return {
    subtotal: Math.round(basePrice.subtotal * multiplier),
    discount: Math.round(basePrice.discount * multiplier),
    total: Math.round(basePrice.total * multiplier),
    discountPercentage: basePrice.discountPercentage,
  };
}
