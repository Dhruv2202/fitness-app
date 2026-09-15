// Links are typed by hand in the admin area, so "www.brand.com" is likely.
// Returns a safe absolute http(s) URL, or null if it can't be made into one.
export function normalizeUrl(value) {
  const trimmed = (value ?? "").toString().trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    // Anything other than http(s) (javascript:, data:) must never reach an href.
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
