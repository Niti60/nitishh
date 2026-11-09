/**
 * Calculates scroll percentage from 0 to 100 based on the actual scrollable element.
 * Accounts for browser subpixel rounding differences at the bottom.
 */
export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const scrollable = scrollHeight - clientHeight;
  if (scrollable <= 0) {
    return 0;
  }
  // If scrolled within 2px of the bottom, clamp to 100% to handle subpixel rounding differences across browsers
  if (scrollTop + clientHeight >= scrollHeight - 2) {
    return 100;
  }
  const progress = (scrollTop / scrollable) * 100;
  return Math.min(100, Math.max(0, progress));
}

