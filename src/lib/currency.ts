/**
 * Currency formatting utility for CUP (Cuban Peso).
 * Centralizes all monetary formatting across the application.
 */

/**
 * Formats a number as CUP currency string.
 * @param amount - The numeric amount to format
 * @param options - Optional formatting options
 * @returns Formatted string like "$1,234.00 CUP"
 */
export function formatCUP(amount: number | string, options?: { decimals?: number; showSymbol?: boolean }): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "$0.00 CUP";

  const decimals = options?.decimals ?? 2;
  const showSymbol = options?.showSymbol ?? true;

  const formatted = value.toLocaleString("es-CU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `$${formatted} CUP` : formatted;
}

/**
 * Short format for inline display (no "CUP" suffix).
 * @param amount - The numeric amount
 * @returns Formatted string like "$1,234"
 */
export function formatCUPShort(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(value)) return "$0";

  return `$${value.toLocaleString("es-CU")}`;
}
