// The admin dashboard palette is grayscale from dark to light; in dark mode it flips so
// the strongest series stays the most visible against the dark card.
const DARK_PALETTE: Record<string, string> = {
  '#111827': '#F5F5F5',
  '#6B7280': '#D1D5DB',
  '#9CA3AF': '#9CA3AF',
  '#D1D5DB': '#6B7280',
  '#E5E7EB': '#4B5563',
}

/** Maps a dashboard color to its dark-mode counterpart (other colors pass through). */
export function adaptChartColor(color: string, isDark: boolean) {
  return isDark ? DARK_PALETTE[color.toUpperCase()] ?? color : color
}
