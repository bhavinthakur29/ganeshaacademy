/**
 * Site-wide configuration. Change these values to update the app across the board.
 */
export const siteConfig = {
  /** Site title shown in browser tab, metadata, and PWA */
  siteTitle: "GAMA | Management System",
  /** Short name for PWA home screen, sidebar when collapsed */
  siteShortName: "GAMA",
  /** Site description for meta tags and PWA */
  siteDescription: "Student, branch, and attendance management",
  /** Default theme: "dark" or "light" */
  defaultTheme: "dark",
  /** localStorage key for theme preference (include site identifier to avoid conflicts) */
  themeStorageKey: "gama-theme",
  /** Brand name shown in sidebar (when expanded) */
  brandName: "GAMA",
  /** Default fee amount (₹) for new fee entries */
  defaultFees: 800,
  /** Favicon filename. File must be in the public folder (e.g. public/favicon.svg) */
  favicon: "site-icon.png",
  /** Site logo for sidebar and auth headers. File must be in the public folder (e.g. public/site-logo.png) */
  siteLogo: "site-logo.png",
};

export default siteConfig;
