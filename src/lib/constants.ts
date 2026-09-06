/**
 * Application-wide constants.
 *
 * Anything that appears in more than one place — the product name, the logo
 * asset, shared list sizes — lives here so there is a single source of truth.
 */

export const APP_NAME = "Stowaway";
export const APP_DESCRIPTION =
  "Modern inventory management system - stow away your items safely";

/** Logo asset used in the sidebar and on the auth screens. */
export const LOGO_SRC = "/logo.svg";
export const LOGO_SIZE = 24;

/** Rows requested per page on the items list. */
export const ITEMS_PAGE_SIZE = 20;

/** Debounce applied to the items search box before a request is sent. */
export const SEARCH_DEBOUNCE_MS = 300;

/** How many of the most recently added items the dashboard lists. */
export const RECENT_ITEMS_LIMIT = 5;

/** Placeholder shown where a value is not set. */
export const EMPTY_VALUE = "—";

/**
 * Browser chrome colors, mirroring the `--background` token of each theme in
 * `globals.css`. Keep these in sync if the background tokens change.
 */
export const THEME_COLOR_LIGHT = "#ffffff";
export const THEME_COLOR_DARK = "#0a0a0a";
