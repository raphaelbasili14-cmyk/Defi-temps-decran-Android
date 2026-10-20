/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F2F4E8',
    tint: '#D7F36A',

    // Core surfaces
    background: '#101E19',
    foreground: '#F2F4E8',

    // Cards / elevated surfaces
    card: '#182B23',
    cardForeground: '#F2F4E8',

    // Primary action color (buttons, links, active states)
    primary: '#D7F36A',
    primaryForeground: '#17231B',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#23382E',
    secondaryForeground: '#E8EEDF',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#1D3329',
    mutedForeground: '#A4B4A7',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F2A77A',
    accentForeground: '#241A14',

    // Destructive actions (delete, error states)
    destructive: '#E87668',
    destructiveForeground: '#24110F',

    // Borders and input outlines
    border: '#30483B',
    input: '#30483B',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
