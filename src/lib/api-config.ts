/**
 * Centralized API configuration.
 *
 * Requirements:
 * - Local development: VITE_API_BASE_URL can be set to e.g. "http://localhost:5001"
 *   or left empty to use Vite development proxy (/api -> http://localhost:5001).
 * - Netlify same-origin deployment: empty value, resolving to relative /api/contact.
 * - Future separate backend: configurable absolute API URL.
 * - Centralizes endpoint URL construction in one place.
 * - Ensures URL joining never produces double slashes.
 */

// Safely access env in both Vite client bundles and Node/test runtimes
const env: Record<string, string | undefined> =
  typeof import.meta !== "undefined" && import.meta.env
    ? (import.meta.env as Record<string, string | undefined>)
    : typeof process !== "undefined" && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};

export const API_BASE_URL = (env["VITE_API_BASE_URL"] || "").trim().replace(/\/+$/, "");

/**
 * Builds a clean API endpoint URL without double slashes.
 *
 * @param path - The API endpoint path, e.g. "/api/contact"
 * @returns The full API URL or relative path
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}
