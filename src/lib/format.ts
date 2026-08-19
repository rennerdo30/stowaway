/**
 * Locale-aware formatting helpers.
 *
 * The locale and currency are fixed constants rather than being read from the
 * browser so that server-rendered markup and the client hydration match
 * exactly. Change these two constants to re-target the whole UI.
 */

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_CURRENCY = "USD";

/** Date presentation formats, kept in one place so pages stay consistent. */
export const DATE_FORMAT_MEDIUM = "MMM d, yyyy";
export const DATE_FORMAT_LONG = "MMMM d, yyyy";
export const DATE_FORMAT_DATE_TIME = "MMM d, yyyy HH:mm";

/** Alpha suffix appended to a category hex color to build a soft tint. */
export const COLOR_TINT_ALPHA = "20";

const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: DEFAULT_CURRENCY,
});

const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE);

/**
 * Currency symbol for {@link DEFAULT_CURRENCY}, derived from `Intl` so form
 * labels never hardcode a `$`.
 */
export const CURRENCY_SYMBOL =
  currencyFormatter.formatToParts(0).find((part) => part.type === "currency")
    ?.value ?? DEFAULT_CURRENCY;

/** Formats a monetary amount, e.g. `1234.5` -> `$1,234.50`. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Formats a plain number with locale-aware grouping, e.g. `1234` -> `1,234`. */
export function formatNumber(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0);
}

/** Builds a translucent tint from a category color, e.g. `#6366f1` -> `#6366f120`. */
export function tintColor(hexColor: string): string {
  return `${hexColor}${COLOR_TINT_ALPHA}`;
}
