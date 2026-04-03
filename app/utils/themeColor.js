export function getThemeCssColor(variableName, fallback = 'currentColor') {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  if (value) {
    return value;
  }

  return getComputedStyle(document.body).color || fallback;
}
